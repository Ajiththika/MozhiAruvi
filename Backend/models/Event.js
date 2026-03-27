import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        eventCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: String, // stored as "YYYY-MM-DD"
            required: true,
        },
        time: {
            type: String, // stored as "HH:mm"
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        participantsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        image: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
