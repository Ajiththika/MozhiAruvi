import mongoose from 'mongoose';

const mentorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Compatible with both Tutor (name) and Teacher (fullName) formats
    fullName: { type: String, trim: true },
    name: { type: String, trim: true }, 
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    
    bio: { type: String, trim: true },
    experience: { type: String, trim: true },
    specialization: { type: String, trim: true },
    languages: [{ type: String, trim: true }],
    
    hourlyRate: { type: Number, default: 0 },
    schedule: { type: String, trim: true },
    availability: { type: String, trim: true }, 
    
    teachingMode: { type: String, enum: ['online', 'offline', 'both'] },
    motivation: { type: String, trim: true },
    certifications: { type: String, trim: true },
    profilePhoto: { type: String, trim: true },
    type: { type: String, enum: ['teacher', 'tutor', 'mentor'], default: 'mentor' },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending',
    },
    adminNotes: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Single status index for efficient filtering on admin dashboard
mentorApplicationSchema.index({ status: 1 });

export default mongoose.model('MentorApplication', mentorApplicationSchema);
