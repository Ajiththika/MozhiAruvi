import mongoose from 'mongoose';

const eventJoinRequestSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Allow guest registration
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            required: true,
        },
        message: {
            type: String,
            trim: true,
            default: '',
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

// One user (or guest by phone) cannot have more than one pending request for the same event
// We'll use a combination of eventId and (userId OR phoneNumber)
eventJoinRequestSchema.index(
    { eventId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending', userId: { $exists: true } },
    }
);

eventJoinRequestSchema.index(
    { eventId: 1, phoneNumber: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending', userId: { $exists: false } },
    }
);

eventJoinRequestSchema.index({ userId: 1 });

export default mongoose.model('EventJoinRequest', eventJoinRequestSchema);
