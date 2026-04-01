import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeSessionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentType: { type: String, enum: ['event', 'tutor_session'], required: true },
  metadata: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
