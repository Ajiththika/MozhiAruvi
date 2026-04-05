import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Date & Time logic
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  duration: { type: Number, default: 60 },     // minutes
  
  // Lifecycle Management
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed'], 
    default: 'pending' 
  },
  
  // Financial Audit Trail (Stripe Connect)
  paymentIntentId: { type: String },
  transferId: { type: String },
  amount: { type: Number, required: true },          // Total paid by student
  platformFee: { type: Number, required: true },      // Commission taken by Mozhi Aruvi
  tutorEarnings: { type: Number, required: true },    // Net earnings for tutor
  currency: { type: String, default: 'usd' },
  
  // Feedback Engine
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date }
  },

  // Meeting Logic
  meetingLink: { type: String, trim: true },
  tutorNotes: { type: String, trim: true },
  
}, { timestamps: true });

// Optimize indexing for common lookups
bookingSchema.index({ studentId: 1, date: -1 });
bookingSchema.index({ tutorId: 1, date: -1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
