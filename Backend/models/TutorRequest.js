import mongoose from 'mongoose';

const tutorRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }, // optional context
    
    // New: Handle different interactions
    requestType: {
        type: String,
        enum: ['question', 'live_class', 'multi_class'],
        default: 'question'
    },
    
    // The main message or description of the request
    content: { type: String, required: true },
    
    // Additional info: live class availability, number of session for packages, specific topics
    metadata: {
        topics: [String],
        preferredTime: String,
        sessionsCount: Number,
        additionalNotes: String,
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'replied', 'resolved'],
        default: 'pending'
    },
    
    // Threaded conversation
    messages: [{
        senderRole: { type: String, enum: ['student', 'teacher'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    
    teacherReply: { type: String }, // Legacy: First teacher response
    priceCredits: { type: Number, default: 10 }, 
}, { timestamps: true });

export default mongoose.model('TutorRequest', tutorRequestSchema);
