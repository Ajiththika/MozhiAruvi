import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Provider-neutral identifier. Stored under the original `stripeSessionId`
  // key (preserving the existing unique index + all production rows) but
  // referenced everywhere in app code via the `paypalOrderId` alias — this is
  // the backward-compatible read shim that bridges legacy + new payments.
  stripeSessionId: { type: String, required: true, unique: true, alias: 'paypalOrderId' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentType: { type: String, enum: ['event', 'tutor_session'], required: true },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
