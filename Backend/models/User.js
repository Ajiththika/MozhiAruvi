import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // null for OAuth users
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  googleId: { type: String },

  // Status & Admin
  isActive: { type: Boolean, default: true },
  isVerifiedAdmin: { type: Boolean, default: false },

  // Tutor specific fields
  isTutorAvailable: { type: Boolean, default: false },
  bio: { type: String, trim: true },
  experience: { type: String, trim: true },
  specialization: { type: String, trim: true },
  schedule: { type: mongoose.Schema.Types.Mixed }, // flexible structure for now
  hourlyRate: { type: Number, default: 0 },

  // Credits & Premium
  credits: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },

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
  const { _id, name, email, role, isActive, isTutorAvailable, isPremium, credits, createdAt } = this;
  return { id: _id, name, email, role, isActive, isTutorAvailable, isPremium, credits, createdAt };
};

export default mongoose.model('User', userSchema);
