import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // null for OAuth users
  role: { type: String, enum: ['user', 'teacher', 'admin'], default: 'user' },
  googleId: { type: String },

  // Status & Admin
  isActive: { type: Boolean, default: true },

  // Tutor specific fields
  isTutorAvailable: { type: Boolean, default: false },
  bio: { type: String, trim: true },
  experience: { type: String, trim: true },
  specialization: { type: String, trim: true },
  schedule: { type: mongoose.Schema.Types.Mixed }, // flexible structure for now
  hourlyRate: { type: Number, default: 0 },
  languages: [{ type: String, trim: true }],
  teachingMode: { type: String, enum: ['online', 'offline', 'both'] },
  profilePhoto: { type: String, trim: true },
  levelSupport: [{ type: String, enum: ['beginner', 'intermediate', 'advanced'] }],
  responseTime: { type: String, trim: true }, // e.g. "Within 1 hour"

  // Credits & Premium
  credits: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },

  // Learning Progression & Duolingo features
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Not Set'], default: 'Not Set' },
  learningCredits: { type: Number, default: 25 },
  lastCreditUpdate: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },

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
  const { _id, name, email, role, isActive, isTutorAvailable, isPremium, credits, createdAt, teachingMode, profilePhoto, level, learningCredits, xp, lastCreditUpdate } = this;
  return { id: _id, name, email, role, isActive, isTutorAvailable, isPremium, credits, createdAt, teachingMode, profilePhoto, level, learningCredits, xp, lastCreditUpdate };
};

export default mongoose.model('User', userSchema);
