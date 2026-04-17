import Stripe from 'stripe';
import { getFrontendUrl } from '../utils/urlHelper.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * ── Create Express Account (Onboarding Start) ────────────────────────────────
 */
export async function createTutorExpressAccount(user) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US', // default, can be dynamic
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: { userId: user._id.toString() },
  });

  return account;
}

/**
 * ── Generate Onboarding Link ─────────────────────────────────────────────────
 */
export async function generateAccountLink(accountId) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: process.env.TUTOR_ONBOARDING_REAUTH_URL,
    return_url: process.env.TUTOR_ONBOARDING_RETURN_URL,
    type: 'account_onboarding',
  });

  return accountLink;
}

/**
 * ── Split Payment Session (Destination Charges) ──────────────────────────────
 */
export async function createSplitPaymentSession(student, tutor, amount, bookingMetadata) {
  if (!tutor.stripeAccountId) {
    throw new Error('This mentor does not have a connected Stripe account yet.');
  }
  // Platform takes fee percent from ENV or default 20%
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '20') / 100;
  const platformFeeAmount = Math.round(amount * platformFeePercent * 100); // cents

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Language Session with ${tutor.name}`,
          description: `Date: ${bookingMetadata.date} at ${bookingMetadata.startTime}`,
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: platformFeeAmount,
      transfer_data: {
        destination: tutor.stripeAccountId,
      },
    },
    metadata: {
      studentId: student._id.toString(),
      tutorId: tutor._id.toString(),
      type: 'tutor_booking',
      ...bookingMetadata
    },
    success_url: `${getFrontendUrl()}/student/tutors/my-requests?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendUrl()}/tutors/${tutor._id}`,
  });

  return session;
}

/**
 * ── Verify Account Status ────────────────────────────────────────────────────
 */
export async function checkAccountStatus(accountId) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    isVerified: account.details_submitted && account.charges_enabled,
    details: account
  };
}

export { stripe };
