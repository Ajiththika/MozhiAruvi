import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['booking_confirmed', 'booking_request', 'booking_accepted', 'new_booking', 'payment_success', 'session_reminder', 'session_completed', 'cancelled', 'info'],
    default: 'info'
  },
  
  // Action Context
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  read: { type: Boolean, default: false },
  actionUrl: { type: String }, // e.g. "/student/dashboard/bookings"
  
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
