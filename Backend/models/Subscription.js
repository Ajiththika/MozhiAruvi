import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['basic', 'plus', 'pro', 'starter', 'master'],
    default: 'basic',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  paypalSubscriptionId: {
    type: String,
    trim: true
  },
  usageTracking: {
    questionsUsed: {
      type: Number,
      default: 0
    },
    categoriesAccessed: [{
      type: String
    }],
    sessionsUsed: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Ensure fast lookups for user and subscription validations
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ paypalSubscriptionId: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
