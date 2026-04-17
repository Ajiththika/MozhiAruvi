import Stripe from 'stripe';
import { getFrontendUrl } from '../utils/urlHelper.js';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY) {
  console.warn('⚠️ [Stripe Service] STRIPE_SECRET_KEY is missing from environment variables. Payment features will fail.');
}

const stripe = new Stripe(STRIPE_KEY || 'sk_test_dummy_key_to_prevent_startup_crash', {
  apiVersion: '2023-10-16',
});

/**
 * Get or create a Stripe Customer for a local user.
 */
export async function getOrCreateCustomer(user) {
  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  if (!user.subscription) {
    user.subscription = { plan: 'FREE' };
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });

  user.subscription.stripeCustomerId = customer.id;
  user.markModified('subscription');
  await user.save();
  return customer.id;
}

/**
 * Creates a Checkout Session for Subscription.
 */
export async function createSubscriptionSession(user, priceId, planName, cycle, seats, req) {
  if (!STRIPE_KEY || STRIPE_KEY.includes('dummy')) {
     throw new Error('Stripe API Key is not configured. Please add STRIPE_SECRET_KEY to your .env file.');
  }

  if (!priceId || priceId.includes('placeholder') || priceId === 'undefined') {
     throw new Error('Stripe Price ID is not configured correctly in the .env file. Please ensure Price IDs start with "price_".');
  }

  if (!priceId.startsWith('price_')) {
     throw new Error(`Invalid Stripe Price ID format: "${priceId}". Expected a Price ID (e.g. price_...), but received something else.`);
  }

  const customerId = await getOrCreateCustomer(user);

  const sessionData = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user._id.toString(),
      plan: planName,
      billingCycle: cycle,
      ...(seats ? { seats: String(seats) } : {}) // Ensure seats is a string
    },
    success_url: `${getFrontendUrl(req)}/student/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl(req)}/student/subscription`,
  };

  // Only apply trial if user has NOT used it before
  if (!user.subscription?.hasUsedTrial) {
    sessionData.subscription_data = {
      trial_period_days: 7,
    };
  }

  return await stripe.checkout.sessions.create(sessionData);
}

/**
 * Create a Checkout Session for One-time Payment (Event or Tutor Class)
 */
export async function createPaymentSession(user, amount, type, metadata, req) {
  const customerId = await getOrCreateCustomer(user);

  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: metadata.name || `Payment for ${type}`,
            description: metadata.description || '',
          },
          unit_amount: Math.round(amount * 100), // convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
       userId: user._id.toString(),
       type,
       ...metadata
    },
    success_url: `${getFrontendUrl(req)}/${metadata.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl(req)}/${metadata.cancelPath}`,
  });
}

/**
 * Cancel an active Stripe subscription.
 */
export async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Upgrade an active Stripe subscription to a new price.
 */
export async function upgradeSubscription(subscriptionId, newPriceId, metadata) {
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
      price: newPriceId,
    }],
    metadata: {
      ...metadata
    },
    proration_behavior: 'always_invoice', // Invoice immediately for the difference
  });
}

export { stripe };
