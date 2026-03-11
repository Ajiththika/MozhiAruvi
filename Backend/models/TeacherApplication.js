import mongoose from 'mongoose';

const teacherApplicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // ── Applicant Profile ────────────────────────────────────────────────
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            required: true,
            trim: true,
        },
        experience: {
            type: String,
            required: true,
            trim: true,
        },
        specialization: {
            type: String,
            required: true,
            trim: true,
        },
        languages: [
            {
                type: String,
                trim: true,
            },
        ],
        hourlyRate: {
            type: Number,
            required: true,
            min: 0,
        },
        schedule: {
            type: String,
            required: true,
            trim: true,
        },
        teachingMode: {
            type: String,
            enum: ['online', 'offline', 'both'],
            required: true,
        },
        motivation: {
            type: String,
            required: true,
            trim: true,
        },
        profilePhoto: {
            type: String, // URL, optional
            trim: true,
            default: null,
        },

        // ── Review ───────────────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'needs_revision'],
            default: 'pending',
        },
        adminNotes: {
            type: String,
            trim: true,
            default: null,
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: null,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for fast lookup of a user's latest application by status
teacherApplicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model('TeacherApplication', teacherApplicationSchema);
