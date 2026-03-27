import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['CREDIT', 'XP'], required: true },
  source: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
