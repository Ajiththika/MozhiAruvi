import mongoose from 'mongoose';

const tutorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      trim: true,
    },
    certifications: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Unique index for the pending or approved applications
tutorApplicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model('TutorApplication', tutorApplicationSchema);
