import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import Organization from '../models/Organization.js';
import * as stripeService from '../services/stripeService.js';

/**
 * Endpoint for creating a Stripe Checkout Session for Subscription.
 */
export async function createSubscriptionSession(req, res, next) {
    try {
        const { plan, cycle, seats } = req.body;
        const user = await User.findById(req.user.sub);
        if (!user) return res.status(404).json({ message: "User not found" });

        let priceId;
        if (plan === 'PRO') {
            priceId = cycle === 'yearly' ? process.env.STRIPE_PRO_YEARLY_PRICE_ID : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
        } else if (plan === 'PREMIUM') {
            priceId = cycle === 'yearly' ? process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
        } else if (plan === 'BUSINESS') {
            priceId = seats === 60 ? process.env.STRIPE_BUSINESS_60_PRICE_ID : process.env.STRIPE_BUSINESS_30_PRICE_ID;
        } else {
            return res.status(400).json({ message: "Invalid plan" });
        }

        const session = await stripeService.createSubscriptionSession(user, priceId, plan, cycle, seats);
        res.json({ url: session.url });
    } catch (e) { next(e); }
}

/**
 * Handle Webhook for Stripe Events.
 */
export async function stripeWebhook(req, res, next) {
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
                    // Update User subscription
                    const updateData = {
                        'subscription.plan': plan,
                        'subscription.billingCycle': billingCycle,
                        'subscription.stripeSubscriptionId': session.subscription,
                        'subscription.currentPeriodEnd': new Date(session.expires_at * 1000), // temp, invoice will update it
                    };

                    if (plan === 'BUSINESS') {
                        updateData.roleInOrg = 'owner';
                        // Create Organization
                        const org = await Organization.create({
                            name: `${session.customer_details.name}'s Organization`,
                            owner: userId,
                            stripeSubscriptionId: session.subscription,
                            plan: seats === '60' ? 'BUSINESS_60' : 'BUSINESS_30',
                            maxSeats: parseInt(seats) || 30
                        });
                        updateData.organizationId = org._id;
                    }

                    await User.findByIdAndUpdate(userId, updateData);
                } else if (session.mode === 'payment') {
                    // One-time payment (Event or Tutor Class)
                    if (type === 'event' && eventId) {
                        await User.findByIdAndUpdate(userId, { $addToSet: { 'subscription.paidEvents': eventId } });
                        // Update Payment record
                        await Payment.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'completed' });
                    } else if (type === 'tutor_session' && tutorId) {
                        await User.findByIdAndUpdate(userId, { $addToSet: { 'subscription.paidTutors': tutorId } });
                        await Payment.findOneAndUpdate({ stripeSessionId: session.id }, { status: 'completed' });
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
                            'subscription.eventUsageCount': 0 // Reset usage
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
export async function createEventPaymentSession(req, res, next) {
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
        });

        // Track payment session record locally for auditing
        await Payment.create({
            user: user._id,
            stripeSessionId: session.id,
            amount,
            paymentType: 'event',
            metadata: { eventId }
        });

        res.json({ url: session.url });
    } catch (e) { next(e); }
}

/**
 * Handle One-time payment for Tutor session.
 */
export async function createTutorPaymentSession(req, res, next) {
    try {
        const { tutorId } = req.body;
        const user = await User.findById(req.user.sub);
        const tutor = await User.findById(tutorId);
        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        const amount = tutor.hourlyRate || 10;

        const session = await stripeService.createPaymentSession(user, amount, 'tutor_session', {
            tutorId,
            name: `Private Class with ${tutor.name}`,
            successPath: `student/tutors/success?tutorId=${tutorId}`,
            cancelPath: `student/tutors/${tutorId}`
        });

        await Payment.create({
            user: user._id,
            stripeSessionId: session.id,
            amount,
            paymentType: 'tutor_session',
            metadata: { tutorId }
        });

        res.json({ url: session.url });
    } catch (e) { next(e); }
}
