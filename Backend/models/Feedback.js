import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
