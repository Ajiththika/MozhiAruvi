import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import Organization from '../models/Organization.js';
import Booking from '../models/Booking.js';
import * as stripeService from '../services/stripeService.js';
import * as communication from '../services/communicationService.js';
// import { stripe } from '../services/stripeConnectService.js';
import PlanSettings from '../models/PlanSettings.js';

async function provisionBusinessAccount(userId, plan, seats, subscriptionId) {
    const owner = await User.findById(userId);
    if (!owner) return;

    // Create the organization record
    const org = await Organization.create({
        name: `${owner.name}'s Organization`,
        owner: owner._id,
        stripeSubscriptionId: subscriptionId,
        plan: `BUSINESS_${seats === 60 ? '60' : '30'}`,
        maxSeats: seats || 30,
        members: [owner._id]
    });

    // Link owner to organization
    await User.findByIdAndUpdate(userId, {
        organizationId: org._id,
        roleInOrg: 'owner'
    });
}

/**
 * Get all active subscription plans.
 */
export async function getPlans(_req, res, _next) {
    try {
        const plans = await PlanSettings.find({ isEnabled: true });
        res.json(plans);
    } catch (e) { _next(e); }
}

/**
 * Endpoint for creating a Stripe Checkout Session for Subscription.
 */
export async function createSubscriptionSession(req, res, _next) {
    try {
        const { plan, cycle, seats } = req.body;
        const user = await User.findById(req.user.sub);
        if (!user) return res.status(404).json({ message: "User not found" });

        const planSetting = await PlanSettings.findOne({ plan: plan });
        if (!planSetting) return res.status(400).json({ message: "Invalid plan" });

        const priceId = cycle === 'yearly' ? planSetting.stripeYearlyPriceId : planSetting.stripeMonthlyPriceId;
        
        if (!priceId) {
            return res.status(400).json({ message: `Stripe Price ID not configured for ${plan} ${cycle}` });
        }

        const session = await stripeService.createSubscriptionSession(user, priceId, plan, cycle, seats, req);
        res.json({ url: session.url });
    } catch (e) { _next(e); }
}

/**
 * Handle Webhook for Stripe Events.
 */
export async function stripeWebhook(req, res, _next) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeService.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { userId, type, plan, billingCycle, eventId, tutorId, seats } = session.metadata;

                if (session.mode === 'subscription') {
                    // Fetch full subscription to get trial_end or current_period_end
                    const subscription = await stripeService.stripe.subscriptions.retrieve(session.subscription);

                    // Update User subscription
                    const updateData = {
                        'subscription.plan': plan,
                        'subscription.billingCycle': billingCycle,
                        'subscription.stripeSubscriptionId': session.subscription,
                        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                        'subscription.hasUsedTrial': true,
                        'subscription.status': subscription.status,
                    };

                    await User.findByIdAndUpdate(userId, updateData);

                    // If Business plan, provision organization
                    if (plan === 'BUSINESS') {
                        await provisionBusinessAccount(userId, plan, parseInt(seats || '30'), session.subscription);
                    }
                } else if (session.mode === 'payment') {
                    // One-time payment (Event or Tutor Class)
                    if (type === 'event' && eventId) {
                        await User.findByIdAndUpdate(userId, { $addToSet: { 'subscription.paidEvents': eventId } });
                        // Update Payment record
                        await Payment.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'completed' });
                    } else if (type === 'tutor_session' && tutorId) {
                        await User.findByIdAndUpdate(userId, { $addToSet: { 'subscription.paidTutors': tutorId } });
                        await Payment.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'completed' });
                    } else if (type === 'tutor_booking' && tutorId) {
                        // Official Marketplace Booking Flow (Split Payments)
                        const bookingId = session.metadata.bookingId;
                        const totalAmount = (session.amount_total || 0) / 100; // to dollars
                        const feePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '20') / 100;
                        const platformFee = totalAmount * feePercent;
                        const tutorEarnings = totalAmount - platformFee;

                        let booking;

                        if (bookingId) {
                            // Request-First Flow: Update existing booking
                            booking = await Booking.findById(bookingId);
                            if (booking) {
                                booking.paymentStatus = 'paid';
                                booking.paymentIntentId = session.payment_intent;
                                booking.amount = totalAmount;
                                booking.platformFee = platformFee;
                                booking.tutorEarnings = tutorEarnings;
                                await booking.save();
                            }
                        } else {
                            // Legacy Immediate-Payment Flow: Create new booking
                            booking = await Booking.create({
                                studentId: userId,
                                tutorId,
                                date: new Date(session.metadata.date),
                                startTime: session.metadata.startTime,
                                endTime: session.metadata.endTime || "TBD",
                                duration: parseInt(session.metadata.duration || '60'),
                                amount: totalAmount,
                                platformFee,
                                tutorEarnings,
                                paymentIntentId: session.payment_intent,
                                paymentStatus: 'paid',
                                status: 'confirmed'
                            });
                        }

                        // Trigger Automated Communications
                        const student = await User.findById(userId);
                        const tutor = await User.findById(tutorId);
                        if (booking) {
                            await communication.notifyBookingSuccess(student, tutor, booking);
                        }
                    }
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                if (invoice.subscription) {
                    const subscription = await stripeService.stripe.subscriptions.retrieve(invoice.subscription);
                    const customerId = invoice.customer;
                    await User.findOneAndUpdate(
                        { 'subscription.stripeCustomerId': customerId },
                        {
                            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                            'subscription.freeEventsUsedThisCycle': 0, // Reset event usage on renewal
                            'subscription.tutorSupportUsed': 0, // Reset usage
                            'subscription.eventUsageCount': 0, // Reset usage
                            'subscription.status': subscription.status
                        }
                    );
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const user = await User.findOneAndUpdate(
                    { 'subscription.stripeSubscriptionId': subscription.id },
                    {
                        'subscription.plan': 'FREE',
                        'subscription.billingCycle': 'none',
                        'subscription.stripeSubscriptionId': null,
                        roleInOrg: null,
                        organizationId: null
                    }
                );

                if (user && user.roleInOrg === 'owner' && user.organizationId) {
                    // Organization subscription ended
                    const org = await Organization.findById(user.organizationId);
                    if (org) {
                        // Revert all members to FREE
                        await User.updateMany(
                            { _id: { $in: org.members } },
                            { 
                                'subscription.plan': 'FREE',
                                organizationId: null,
                                roleInOrg: null
                            }
                        );
                        await org.deleteOne();
                    }
                }
                break;
            }
        }
    } catch (e) {
        console.error("Webhook processing error:", e.message);
    }

    res.json({ received: true });
}

/**
 * Handle One-time payment for Event.
 */
export async function createEventPaymentSession(req, res, _next) {
    try {
        const { eventId } = req.body;
        const user = await User.findById(req.user.sub);
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const amount = 5; // Flat rate for events, or you can use event.price if you add it.

        const session = await stripeService.createPaymentSession(user, amount, 'event', {
            eventId,
            name: `Joining Event: ${event.title}`,
            successPath: `student/events/success?eventId=${eventId}`,
            cancelPath: `student/events/${eventId}`
        }, req);

        // Track payment session record locally for auditing
        await Payment.create({
            user: user._id,
            stripeSessionId: session.id,
            amount,
            paymentType: 'event',
            metadata: { eventId }
        });

        res.json({ url: session.url });
    } catch (e) { _next(e); }
}

/**
 * Handle One-time payment for Tutor session.
 */
/**
 * Proactive check for subscription status (fallback for delayed webhooks).
 */
export async function verifySubscriptionSession(req, res, _next) {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ message: "Session ID required" });

        const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.status !== 'complete') {
            return res.status(400).json({ message: "Session not completed" });
        }

        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const billingCycle = session.metadata.billingCycle;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // If skip processing if already handled by webhook
        if (user.subscription?.stripeSubscriptionId === session.subscription && user.subscription.plan !== 'FREE') {
            return res.json({ message: "Subscription already active", user: user.toSafeObject() });
        }

        // Retrieve subscription details
        const subscription = await stripeService.stripe.subscriptions.retrieve(session.subscription);

        const updateData = {
            'subscription.plan': plan,
            'subscription.billingCycle': billingCycle,
            'subscription.stripeSubscriptionId': session.subscription,
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.hasUsedTrial': true,
            'subscription.status': subscription.status,
            'subscription.stripeCustomerId': session.customer
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        
        // If Business plan and org doesn't exist yet, provision it
        if (plan === 'BUSINESS' && !updatedUser.organizationId) {
            await provisionBusinessAccount(userId, plan, parseInt(session.metadata.seats || '30'), session.subscription);
        }
        
        // Generate a fresh access token to prevent session expiration issues after returning from Stripe
        const accessToken = jwt.sign(
            { sub: updatedUser._id.toString(), role: updatedUser.role, sid: 'session_verified_sync' },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' }
        );

        res.json({ 
            message: "Subscription verified successfully", 
            user: updatedUser.toSafeObject(),
            accessToken 
        });
    } catch (e) { _next(e); }
}

export async function createTutorPaymentSession(req, res, _next) {
    try {
        const { tutorId, isPackage } = req.body; // isPackage: true for 8-class bundle
        const user = await User.findById(req.user.sub);
        const tutor = await User.findById(tutorId);
        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        const amount = isPackage ? (tutor.eightClassFee || 200) : (tutor.oneClassFee || tutor.hourlyRate || 30);

        const session = await stripeService.createPaymentSession(user, amount, 'tutor_session', {
            tutorId,
            isPackage: String(!!isPackage),
            name: isPackage ? `8-Class Mastery Bundle with ${tutor.name}` : `Private Class with ${tutor.name}`,
            successPath: `student/tutors/success?tutorId=${tutorId}&package=${!!isPackage}`,
            cancelPath: `student/tutors/${tutorId}`
        }, req);

        await Payment.create({
            user: user._id,
            stripeSessionId: session.id,
            amount,
            paymentType: 'tutor_session',
            metadata: { tutorId, isPackage }
        });

        res.json({ url: session.url });
    } catch (e) { _next(e); }
}
export async function cancelSubscription(req, res, _next) {
    try {
        const user = await User.findById(req.user.sub);
        if (!user || !user.subscription?.stripeSubscriptionId) {
            return res.status(400).json({ message: "No active subscription found" });
        }

        await stripeService.cancelSubscription(user.subscription.stripeSubscriptionId);
        
        // Update user status locally if needed, or wait for webhook
        // For now, let's just confirm it's set to cancel at period end
        res.json({ message: "Subscription will be cancelled at the end of the current billing period" });
    } catch (e) { _next(e); }
}

export async function upgradeSubscription(req, res, _next) {
    try {
        const { plan, cycle } = req.body;
        const user = await User.findById(req.user.sub);
        if (!user || !user.subscription?.stripeSubscriptionId) {
            return res.status(400).json({ message: "No active subscription found to upgrade" });
        }

        const planSetting = await PlanSettings.findOne({ plan: plan });
        if (!planSetting) return res.status(400).json({ message: "Invalid plan" });

        const priceId = cycle === 'yearly' ? planSetting.stripeYearlyPriceId : planSetting.stripeMonthlyPriceId;
        
        if (!priceId) {
            return res.status(400).json({ message: `Stripe Price ID not configured for ${plan} ${cycle}` });
        }

        const subscription = await stripeService.upgradeSubscription(user.subscription.stripeSubscriptionId, priceId, {
            plan,
            billingCycle: cycle
        });

        // Update local user record
        user.subscription.plan = plan;
        user.subscription.billingCycle = cycle;
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();

        res.json({ message: `Successfully upgraded to ${plan}!`, user: user.toSafeObject() });
    } catch (e) { _next(e); }
}
