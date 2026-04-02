import mongoose from 'mongoose';

const planSettingsSchema = new mongoose.Schema({
  plan: { type: String, required: true, unique: true },
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  levelLimit: [{ type: String }], // levels user can access
  categoryLimit: { type: Number }, // number of unique categories user can access, null for unlimited
  tutorSupportLimit: { type: Number }, // days of support per month
  eventLimit: { type: Number }, // free events per month
  isEnabled: { type: Boolean, default: true },
  stripeMonthlyPriceId: { type: String },
  stripeYearlyPriceId: { type: String }
}, { timestamps: true });

export default mongoose.model('PlanSettings', planSettingsSchema);
