import PlanSettings from '../models/PlanSettings.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const plans = [
  {
    plan: 'FREE',
    monthlyPrice: 0,
    yearlyPrice: 0,
    levelLimit: ['Basic', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'], // All levels accessible but only first cat is free
    categoryLimit: 1, // ONLY 1 CATEGORY IS FREE
    tutorSupportLimit: 10,
    eventLimit: 1,
    isEnabled: true
  },
  {
    plan: 'PRO',
    monthlyPrice: 3.81,
    yearlyPrice: 42,
    levelLimit: ['Basic', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    categoryLimit: 10,
    tutorSupportLimit: 50,
    eventLimit: 1,
    isEnabled: true,
    stripeMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID
  },
  {
    plan: 'PREMIUM',
    monthlyPrice: 7.94,
    yearlyPrice: 90,
    levelLimit: ['Basic', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    categoryLimit: null, // unlimited
    tutorSupportLimit: 100,
    eventLimit: 5,
    isEnabled: true,
    stripeMonthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
  }
];

export async function seedPlans() {
  try {
    for (const plan of plans) {
      await PlanSettings.findOneAndUpdate({ plan: plan.plan }, plan, { upsert: true });
    }
    console.log('✅ Plan settings seeded.');
  } catch (e) {
    console.error('❌ Plan seeding failed:', e);
  }
}
