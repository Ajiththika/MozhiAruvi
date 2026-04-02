import Stripe from 'stripe';

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

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });

  user.subscription.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

/**
 * Creates a Checkout Session for Subscription.
 */
export async function createSubscriptionSession(user, priceId, planName, cycle) {
  const customerId = await getOrCreateCustomer(user);

  return await stripe.checkout.sessions.create({
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
      ...(arguments[4] ? { seats: arguments[4] } : {}) // passed as 5th argument if business
    },
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${process.env.FRONTEND_ORIGIN}/student/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_ORIGIN}/student/subscription`,
  });
}

/**
 * Create a Checkout Session for One-time Payment (Event or Tutor Class)
 */
export async function createPaymentSession(user, amount, type, metadata) {
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
    success_url: `${process.env.FRONTEND_ORIGIN}/${metadata.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_ORIGIN}/${metadata.cancelPath}`,
  });
}

export { stripe };
