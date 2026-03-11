import mongoose from 'mongoose';

const teacherApplicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
                required: true,
            },
        ],
        hourlyRate: {
            type: Number,
            required: true,
            min: 0,
        },
        schedule: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
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

// One active pending application per user
teacherApplicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model('TeacherApplication', teacherApplicationSchema);
