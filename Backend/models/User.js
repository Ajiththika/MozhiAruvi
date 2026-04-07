import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ALL_ROLES } from '../utils/roles.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // null for OAuth users
  role: { type: String, enum: ALL_ROLES, default: ROLES.STUDENT },
  tutorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  googleId: { type: String },

  // Base Profile Fields
  phoneNumber: { type: String, trim: true },
  country: { type: String, trim: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },

  // Status & Admin
  isActive: { type: Boolean, default: true },
  warnings: { type: Number, default: 0 },
  adminNotes: { type: String, trim: true },

  // Tutor specific fields
  isTutorAvailable: { type: Boolean, default: false },
  bio: { type: String, trim: true },
  experience: { type: String, trim: true },
  specialization: { type: String, trim: true },
  schedule: { type: mongoose.Schema.Types.Mixed }, // flexible structure for now
  weeklySchedule: { type: String, trim: true },
  hourlyRate: { type: Number, default: 0 },
  oneClassFee: { type: Number, default: 0 },
  eightClassFee: { type: Number, default: 0 },
  languages: [{ type: String, trim: true }],
  teachingMode: { type: String, enum: ['online', 'offline', 'both'] },
  profilePhoto: { type: String, trim: true },
  levelSupport: [{ type: String, enum: ['beginner', 'intermediate', 'advanced'] }],
  responseTime: { type: String, trim: true }, // e.g. "Within 1 hour"
  stripeAccountId: { type: String },
  isStripeVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  totalReviews: { type: Number, default: 0 },

  // Credits & Premium
  credits: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },

  // Learning Progression & Duolingo features
  level: { type: String, default: 'Not Set' },
  learningCredits: { type: Number, default: 25 },
  lastCreditUpdate: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  power: { type: Number, default: 25 },
  lastPowerUpdate: { type: Date, default: Date.now },
  badges: [{ type: String }],
  progress: {
    energy: { type: Number, default: 25 },
    lastEnergyUpdate: { type: Date, default: Date.now },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    level: { type: String, default: 'Basic' },
    currentStreak: { type: Number, default: 0 },
    highStreak: { type: Number, default: 0 },
    lastLessonDate: { type: Date }
  },
  // Subscription & Access Control (Stripe)
  subscription: {
    plan: { type: String, enum: ['FREE', 'PRO', 'PREMIUM', 'BUSINESS'], default: 'FREE' },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodEnd: { type: Date },
    paidEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    paidTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // purchased tutor sessions
    freeEventsUsedThisCycle: { type: Number, default: 0 },
    tutorSupportUsed: { type: Number, default: 0 },
    eventUsageCount: { type: Number, default: 0 },
    hasUsedTrial: { type: Boolean, default: false },
    status: { type: String, enum: ['trialing', 'active', 'canceled', 'none'], default: 'none' }
  },

  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  roleInOrg: { type: String, enum: ['owner', 'member'] },

  hasCompletedOnboarding: { type: Boolean, default: false },

  // Auth internals
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_ROUNDS) || 12);
  }
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const { _id, name, email, role, tutorStatus, isActive, warnings, adminNotes, isTutorAvailable, isPremium, progress, credits, createdAt, teachingMode, profilePhoto, level, learningCredits, xp, points, power, lastPowerUpdate, badges, hasCompletedOnboarding, lastCreditUpdate, phoneNumber, country, age, gender, bio, experience, specialization, languages, subscription, organizationId, roleInOrg, stripeAccountId, isStripeVerified, hourlyRate, weeklySchedule, oneClassFee, eightClassFee } = this;
  return { _id, name, email, role, tutorStatus, isActive, warnings, adminNotes, isTutorAvailable, isPremium, progress, credits, createdAt, teachingMode, profilePhoto, level, learningCredits, xp, points, power, lastPowerUpdate, badges, hasCompletedOnboarding, lastCreditUpdate, phoneNumber, country, age, gender, bio, experience, specialization, languages, subscription, organizationId, roleInOrg, hasUsedTrial: subscription?.hasUsedTrial, stripeAccountId, isStripeVerified, hourlyRate, weeklySchedule, oneClassFee, eightClassFee };
};

// Indexes for high-performance lookups
// NOTE: email index is already created via unique:true on the field definition
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ 'subscription.stripeCustomerId': 1 }, { sparse: true });
userSchema.index({ 'subscription.stripeSubscriptionId': 1 }, { sparse: true });
userSchema.index({ 'progress.completedLessons': 1 });

export default mongoose.model('User', userSchema);
