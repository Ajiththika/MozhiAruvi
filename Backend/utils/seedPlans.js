import PlanSettings from '../models/PlanSettings.js';
import dotenv from 'dotenv';
dotenv.config();

const plans = [
  {
    plan: 'BASIC',
    monthlyPrice: 0,
    yearlyPrice: 0,
    levelLimit: ['Beginner'],
    categoryLimit: 1,
    tutorSupportLimit: 10,
    eventLimit: 2,
    isEnabled: true
  },
  {
    plan: 'PLUS',
    monthlyPrice: 12,
    yearlyPrice: 120,
    levelLimit: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    categoryLimit: 50,
    tutorSupportLimit: 50,
    eventLimit: 8,
    isEnabled: true
  },
  {
    plan: 'MASTER',
    monthlyPrice: 20,
    yearlyPrice: 200,
    levelLimit: ['Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    categoryLimit: 9999, // Unlimited
    tutorSupportLimit: 100,
    eventLimit: 9999, // Unlimited
    isEnabled: true
  }
];

export async function seedPlans() {
  try {
    // Clear out legacy plans if they exist to prevent clutter
    await PlanSettings.deleteMany({ plan: { $in: ['FREE', 'PRO', 'PREMIUM'] } });

    for (const plan of plans) {
      await PlanSettings.findOneAndUpdate({ plan: plan.plan }, plan, { upsert: true, new: true });
    }
    console.log('✅ New PayPal plan settings seeded.');
  } catch (e) {
    console.error('❌ PayPal plan seeding failed:', e);
  }
}
