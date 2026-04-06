import mongoose from 'mongoose';

const tutorRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for auto-assignment
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    
    // New: Handle different interactions
    requestType: {
        type: String,
        enum: ['doubt', 'speaking', 'practice', 'question', 'live_class'],
        default: 'doubt'
    },
    
    // The main message or description of the request
    content: { type: String, required: true },
    
    // Additional info: student progress, specific topics, etc.
    metadata: {
        topics: [String],
        preferredTime: String,
        sessionsCount: Number,
        additionalNotes: String,
        studentProgress: {
            score: Number,
            accuracy: Number,
            weakAreas: [String]
        }
    },
    
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'replied', 'resolved', 'answered', 'scheduled'],
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

tutorRequestSchema.index({ studentId: 1 });
tutorRequestSchema.index({ teacherId: 1 });
tutorRequestSchema.index({ status: 1 });

export default mongoose.model('TutorRequest', tutorRequestSchema);
