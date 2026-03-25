import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true },   // bcrypt hash of raw refresh token
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
}, { timestamps: true });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-cleanup

export default mongoose.model('Session', sessionSchema);
