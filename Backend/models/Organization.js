import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeSubscriptionId: { type: String },
  plan: { type: String, enum: ['BUSINESS_30', 'BUSINESS_60'], required: true },
  maxSeats: { type: Number, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  invitations: [{
    email: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' }
  }]
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);
