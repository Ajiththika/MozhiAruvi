import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import PlanSettings from '../models/PlanSettings.js';
import Subscription from '../models/Subscription.js';
import * as paypalService from '../services/paypalService.js';
import * as communication from '../services/communicationService.js';
import { normalizePlanType, planTypeToUserPlan, userPlanToPlanType } from '../utils/planTypes.js';

/**
 * Synchronize Subscription document with User model.
 */
async function syncSubscriptionWithUser(subDoc) {
  const planType = normalizePlanType(subDoc.planType);
  const userPlan = planTypeToUserPlan(planType);

  await User.findByIdAndUpdate(subDoc.userId, {
    'subscription.plan': userPlan,
    'subscription.status': subDoc.isActive ? 'active' : 'canceled',
    'subscription.currentPeriodEnd': subDoc.endDate,
    isPremium: subDoc.isActive && planType !== 'basic',
  });

  if (subDoc.planType !== planType) {
    subDoc.planType = planType;
    await subDoc.save().catch(() => {});
  }
}

/**
 * Get all active subscription plans.
 * Automatically upserts the correct plans and prices to ensure database consistency.
 */
export async function getPlans(_req, res, next) {
  try {
    // Upsert PlanSettings to ensure correct pricing ($0, $12/mo, $20/mo)
    await PlanSettings.findOneAndUpdate(
      { plan: 'BASIC' },
      {
        monthlyPrice: 0,
        yearlyPrice: 0,
        levelLimit: ['Beginner'],
        categoryLimit: 1,
        tutorSupportLimit: 10,
        eventLimit: 2,
        isEnabled: true
      },
      { upsert: true, new: true }
    );

    await PlanSettings.findOneAndUpdate(
      { plan: 'PLUS' },
      {
        monthlyPrice: 12,
        yearlyPrice: 120, // Save $24/yr
        levelLimit: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
        categoryLimit: 50,
        tutorSupportLimit: 50,
        eventLimit: 8,
        isEnabled: true
      },
      { upsert: true, new: true }
    );

    await PlanSettings.findOneAndUpdate(
      { plan: 'MASTER' },
      {
        monthlyPrice: 20,
        yearlyPrice: 200, // Save $40/yr
        levelLimit: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
        categoryLimit: 9999, // Unlimited
        tutorSupportLimit: 100,
        eventLimit: 9999, // Unlimited
        isEnabled: true
      },
      { upsert: true, new: true }
    );

    const plans = await PlanSettings.find({ isEnabled: true });
    res.json(plans);
  } catch (e) {
    next(e);
  }
}

/**
 * Create a PayPal Subscription for the selected plan.
 */
export async function createSubscriptionSession(req, res, next) {
  try {
    const { plan, cycle } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map plans to PayPal Plan IDs from environment variables
    let planId;
    if (plan === 'PLUS') {
      planId = cycle === 'yearly' ? (process.env.PAYPAL_PLAN_PLUS_YEARLY || process.env.PAYPAL_PLAN_PLUS_MONTHLY) : process.env.PAYPAL_PLAN_PLUS_MONTHLY;
    } else if (plan === 'MASTER' || plan === 'PRO') {
      planId = cycle === 'yearly'
        ? (process.env.PAYPAL_PLAN_PRO_YEARLY || process.env.PAYPAL_PLAN_MASTER_YEARLY || process.env.PAYPAL_PLAN_PRO_MONTHLY)
        : (process.env.PAYPAL_PLAN_PRO_MONTHLY || process.env.PAYPAL_PLAN_MASTER_MONTHLY);
    }

    if (!planId) {
      return res.status(400).json({ message: `PayPal Plan ID not configured for ${plan} ${cycle}` });
    }

    const returnUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/subscription/success`;
    const cancelUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/subscription`;

    const paypalSub = await paypalService.createSubscription(planId, user.email, returnUrl, cancelUrl);
    const approveLink = paypalSub.links.find(link => link.rel === 'approve');

    if (!approveLink) {
      return res.status(500).json({ message: "PayPal approval link not found" });
    }

    // Save/update the subscription record in DB as pending activation
    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        planType: (plan.toUpperCase() === 'MASTER' || plan.toUpperCase() === 'PRO') ? 'pro' : 'plus',
        isActive: false,
        startDate: new Date(),
        paypalSubscriptionId: paypalSub.id,
        usageTracking: {
          questionsUsed: 0,
          categoriesAccessed: [],
          sessionsUsed: 0
        }
      },
      { upsert: true, new: true }
    );

    res.json({ url: approveLink.href });
  } catch (e) {
    next(e);
  }
}

/**
 * Verify and activate a subscription after returning from PayPal checkout.
 * Also handles capturing one-time orders (Events, tutor classes).
 */
export async function verifySubscriptionSession(req, res, next) {
  try {
    const { sessionId, subscription_id, token } = req.query;
    const paypalSubId = subscription_id || sessionId;

    // Handle One-time PayPal order capture if "token" (Order ID) is passed
    if (token && !paypalSubId) {
      const order = await paypalService.captureOrder(token);
      if (order.status !== 'COMPLETED') {
        return res.status(400).json({ message: "Payment was not completed successfully." });
      }

      // Update the local Payment record
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: token },
        { status: 'completed' }
      );

      if (payment) {
        if (payment.paymentType === 'event' && payment.metadata?.eventId) {
          await User.findByIdAndUpdate(payment.user, {
            $addToSet: { 'subscription.paidEvents': payment.metadata.eventId }
          });
        } else if (payment.paymentType === 'tutor_session' && payment.metadata?.tutorId) {
          await User.findByIdAndUpdate(payment.user, {
            $addToSet: { 'subscription.paidTutors': payment.metadata.tutorId }
          });

          // Check if there is an associated Booking to confirm
          let booking = null;
          if (payment.metadata?.bookingId) {
            booking = await Booking.findById(payment.metadata.bookingId);
          }
          if (!booking) {
            booking = await Booking.findOne({
              studentId: payment.user,
              tutorId: payment.metadata?.tutorId,
              paymentStatus: 'pending',
            });
          }
          if (booking) {
            booking.paymentStatus = 'paid';
            if (booking.status === 'pending') booking.status = 'confirmed';
            await booking.save();

            const student = await User.findById(payment.user);
            const tutor = await User.findById(payment.metadata?.tutorId || booking.tutorId);
            if (student && tutor) {
              await communication.notifyBookingSuccess(student, tutor, booking);
            }
          }
        }
      }

      const user = await User.findById(req.user.sub);
      return res.json({ message: "One-time payment verified and processed successfully", user: user.toSafeObject() });
    }

    if (!paypalSubId) {
      return res.status(400).json({ message: "Subscription ID or Order Token is required" });
    }

    const paypalSub = await paypalService.getSubscriptionDetails(paypalSubId);
    
    if (paypalSub.status !== 'ACTIVE') {
      return res.status(400).json({ message: `Subscription is not active. Status: ${paypalSub.status}` });
    }

    const subscription = await Subscription.findOne({ paypalSubscriptionId: paypalSubId });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription record not found locally" });
    }

    subscription.isActive = true;
    subscription.endDate = paypalSub.billing_info?.next_billing_time ? new Date(paypalSub.billing_info.next_billing_time) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();

    // Sync to User record
    await syncSubscriptionWithUser(subscription);

    const user = await User.findById(subscription.userId);
    const accessToken = jwt.sign(
      { sub: user._id.toString(), role: user.role, sid: 'session_verified_sync' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' }
    );

    res.json({
      message: "Subscription verified successfully",
      user: user.toSafeObject(),
      accessToken
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Cancel an active PayPal subscription.
 */
export async function cancelSubscription(req, res, next) {
  try {
    const sub = await Subscription.findOne({ userId: req.user.sub, isActive: true });
    if (!sub || !sub.paypalSubscriptionId) {
      return res.status(400).json({ message: "No active PayPal subscription found to cancel" });
    }

    await paypalService.cancelSubscription(sub.paypalSubscriptionId);

    sub.isActive = false;
    await sub.save();
    await syncSubscriptionWithUser(sub);

    res.json({ message: "Subscription cancelled successfully at PayPal." });
  } catch (e) {
    next(e);
  }
}

/**
 * Handle plan upgrades.
 */
export async function upgradeSubscription(req, res, next) {
  try {
    res.json({ message: "To upgrade, please choose your new plan and complete the subscription checkout." });
  } catch (e) {
    next(e);
  }
}

/**
 * Create a PayPal Order for one-time Event payments.
 */
export async function createEventPaymentSession(req, res, next) {
  try {
    const { eventId } = req.body;
    const user = await User.findById(req.user.sub);
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const amount = 5; // Flat rate of $5 for events

    const returnUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/events/success?eventId=${eventId}`;
    const cancelUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/events/${eventId}`;

    const order = await paypalService.createOrder(amount, `Joining Event: ${event.title}`, returnUrl, cancelUrl);
    const approveLink = order.links.find(link => link.rel === 'approve');

    await Payment.create({
      user: user._id,
      stripeSessionId: order.id, // Re-use this field for the PayPal Order ID
      amount,
      paymentType: 'event',
      metadata: { eventId }
    });

    res.json({ url: approveLink.href });
  } catch (e) {
    next(e);
  }
}

/**
 * Create a PayPal Order for one-time Tutor Session payments.
 */
export async function createTutorPaymentSession(req, res, next) {
  try {
    const { tutorId, isPackage } = req.body;
    const user = await User.findById(req.user.sub);
    const tutor = await User.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const amount = isPackage ? (tutor.eightClassFee || 200) : (tutor.oneClassFee || tutor.hourlyRate || 30);

    const returnUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/tutors/success?tutorId=${tutorId}&package=${!!isPackage}`;
    const cancelUrl = `${req.get('origin') || process.env.PRIMARY_SITE_URL || 'http://localhost:3000'}/student/tutors/${tutorId}`;

    const order = await paypalService.createOrder(
      amount,
      isPackage ? `8-Class Mastery Bundle with ${tutor.name}` : `Private Class with ${tutor.name}`,
      returnUrl,
      cancelUrl
    );
    const approveLink = order.links.find(link => link.rel === 'approve');

    await Payment.create({
      user: user._id,
      stripeSessionId: order.id, // Store PayPal Order ID
      amount,
      paymentType: 'tutor_session',
      metadata: { tutorId, isPackage }
    });

    // Create a pending Booking record
    await Booking.create({
      studentId: user._id,
      tutorId,
      date: new Date(),
      startTime: "TBD",
      duration: isPackage ? 480 : 60,
      amount,
      paymentStatus: 'pending',
      status: 'pending'
    });

    res.json({ url: approveLink.href });
  } catch (e) {
    next(e);
  }
}

/**
 * Handle incoming PayPal webhook events.
 */
export async function paypalWebhook(req, res, next) {
  try {
    const signatureValid = await paypalService.verifyWebhookSignature(req.headers, req.body);
    if (!signatureValid) {
      console.warn('❌ [PayPal Webhook] Invalid webhook signature detected.');
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(`[PayPal Webhook Received] Event Type: ${event.event_type}`);

    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED': {
        const sale = event.resource;
        const subscriptionId = sale.billing_agreement_id;

        if (subscriptionId) {
          const subscription = await Subscription.findOne({ paypalSubscriptionId: subscriptionId });
          if (subscription) {
            subscription.isActive = true;
            // Extend standard 30-day billing cycle
            subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            // Reset monthly usage tracking on payment completion/renewal
            subscription.usageTracking.questionsUsed = 0;
            subscription.usageTracking.sessionsUsed = 0;

            await subscription.save();
            await syncSubscriptionWithUser(subscription);
            console.log(`✅ [PayPal Webhook] Subscription ${subscriptionId} renewed & synced.`);
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const paypalSub = event.resource;
        const subscriptionId = paypalSub.id;

        const subscription = await Subscription.findOne({ paypalSubscriptionId: subscriptionId });
        if (subscription) {
          subscription.isActive = false;
          await subscription.save();
          await syncSubscriptionWithUser(subscription);
          console.log(`❌ [PayPal Webhook] Subscription ${subscriptionId} cancelled/expired.`);
        }
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled Event: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Error handling PayPal webhook:', e);
    res.status(500).json({ message: "Webhook handling error" });
  }
}
