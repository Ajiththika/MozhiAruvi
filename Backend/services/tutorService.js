import mongoose from 'mongoose';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import TutorRequest from '../models/TutorRequest.js';
import * as aiService from './aiChatService.js';
import mozhiEvents from '../events/eventEmitter.js';

export async function getAvailableTutors(page = 1, limit = 6, filters = {}) {
    const skip = (page - 1) * limit;
    const query = { 
        role: { $in: ['teacher', 'tutor'] }, 
        isActive: true 
    };

    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { specialization: { $regex: filters.search, $options: 'i' } },
            { bio: { $regex: filters.search, $options: 'i' } }
        ];
    }

    if (filters.level && filters.level !== 'all') {
        query.levelSupport = filters.level;
    }

    if (filters.mode && filters.mode !== 'all') {
        if (filters.mode === 'both') {
            query.teachingMode = 'both';
        } else {
            query.teachingMode = { $in: [filters.mode, 'both'] };
        }
    }

    let tutors = [];
    let totalTutors = 0;

    try {
        const results = await Promise.all([
            User.find(query)
                .select('name bio experience specialization hourlyRate oneClassFee eightClassFee languages email schedule teachingMode profilePhoto levelSupport responseTime isTutorAvailable')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);
        tutors = results[0];
        totalTutors = results[1];
    } catch (e) {
        if (e.name === 'MongooseError' || e.message.includes('timeout') || e.message.includes('buffering')) {
            console.warn('[tutorService] DB offline, returning empty tutors limit');
        } else {
            throw e;
        }
    }

    return {
        tutors,
        totalTutors,
        totalPages: Math.ceil(totalTutors / limit),
        currentPage: parseInt(page)
    };
}

export async function getTutorById(tutorId) {
    const tutor = await User.findOne({ _id: tutorId, role: { $in: ['teacher', 'tutor'] }, isActive: true })
        .select('name bio experience specialization hourlyRate weeklySchedule oneClassFee eightClassFee languages email schedule teachingMode profilePhoto levelSupport responseTime isTutorAvailable');
    if (!tutor) {
        const err = new Error('Tutor not found or unavailable'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return tutor;
}

export async function updateTutorProfile(teacherId, data) {
    const tutor = await User.findByIdAndUpdate(
        teacherId,
        { $set: data },
        { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    return tutor;
}

export async function updateTutorAvailability(teacherId, isAvailable) {
    return User.findByIdAndUpdate(
        teacherId,
        { $set: { isTutorAvailable: isAvailable } },
        { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
}

export async function createRequest(studentId, data) {
    let teacherId = data.teacherId;
    
    // SMART TUTOR ASSIGNMENT logic if no teacher selected
    if (!teacherId) {
        // Find tutors who are: available, support this level, and have best ratings
        const lesson = await mongoose.model('Lesson').findById(data.lessonId);
        const criteria = {
            role: { $in: ['teacher', 'tutor'] },
            isTutorAvailable: true,
            isActive: true
        };
        
        if (lesson && lesson.level) {
            criteria.levelSupport = lesson.level.toLowerCase();
        }

        const tutors = await User.find(criteria)
            .sort({ rating: -1, responseTime: 1 })
            .limit(10);
        
        if (tutors.length > 0) {
            // Randomly select or pick the best one
            teacherId = tutors[0]._id;
        } else {
            // Fallback: Pick any available active teacher
            const anyTutor = await User.findOne({ role: { $in: ['teacher', 'tutor'] }, isTutorAvailable: true, isActive: true });
            if (anyTutor) teacherId = anyTutor._id;
        }
    }

    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
        const err = new Error('No valid tutors current available for this lesson.'); err.status = 404; err.code = 'NO_TUTORS_AVAILABLE'; throw err;
    }

    const tutor = await User.findById(teacherId);
    if (!tutor || !['teacher', 'tutor'].includes(tutor.role) || !tutor.isActive) {
        const err = new Error('Selected tutor is no longer available.'); err.status = 404; err.code = 'UNAVAILABLE_TUTOR'; throw err;
    }

    // Dynamic pricing based on request type
    const pricing = {
        'doubt': 0, // Free within limits
        'speaking': 0, // Free within limits
        'practice': 0, // Free within limits
        'question': 0, // Free within limits
    };
    const priceCredits = pricing[data.requestType || 'doubt'] ?? 0;

    const student = await User.findById(studentId).select('+subscription +isPremium +credits');
    
    // ── SUBSCRIPTION LIMITS ──────────────────────────────────────────────────
    const plan = student.subscription?.plan || 'FREE';
    let limit = 10; 
    if (plan === 'PRO') limit = 50;
    if (plan === 'PREMIUM') limit = 100;

    // Reset usage if period ended (Check currentPeriodEnd for Pro/Premium)
    if (plan !== 'FREE' && student.subscription?.currentPeriodEnd && new Date() > student.subscription.currentPeriodEnd) {
        student.subscription.tutorSupportUsed = 0;
    }

    if ((student.subscription?.tutorSupportUsed || 0) >= limit) {
        const message = plan === 'FREE' 
            ? "You've reached your monthly limit of 10 free requests. Please upgrade to Pro or Premium to continue asking questions!"
            : `You've reached your monthly limit of ${limit} requests for the ${plan} plan.`;
        const err = new Error(message); 
        err.status = 402; 
        err.code = 'LIMIT_REACHED'; 
        err.redirect = "/student/subscription";
        throw err;
    }

    if (priceCredits > 0 && student.credits < priceCredits && !student.isPremium) {
        const err = new Error(`Insufficient credits. You need ${priceCredits} tokens for this expert intervention.`); err.status = 402; err.code = 'NOT_ENOUGH_CREDITS'; throw err;
    }

    // Capture student progress for teacher visibility
    const progress = await mongoose.model('Progress').findOne({ userId: studentId, lessonId: data.lessonId });

    // Deduct credits ONLY IF priceCredits > 0 (for legacy support if needed)
    if (priceCredits > 0 && !student.isPremium) {
        student.credits -= priceCredits;
    }
    
    // Increment usage
    if (!student.subscription) student.subscription = { plan: 'FREE', tutorSupportUsed: 0 };
    student.subscription.tutorSupportUsed = (student.subscription.tutorSupportUsed || 0) + 1;
    await student.save();

    const helpRequest = await TutorRequest.create({
        studentId,
        teacherId: teacherId,
        lessonId: data.lessonId,
        requestType: data.requestType || 'doubt',
        content: data.content || data.question,
        metadata: {
            ...data.metadata,
            studentProgress: progress ? {
                score: progress.score,
                accuracy: progress.accuracy,
                weakAreas: progress.weakAreas
            } : undefined
        },
        priceCredits, 
    });

    // AIRIVE FIRST RESPONSE (Doubt Resolving AI)
    if (helpRequest.requestType === 'doubt' || helpRequest.requestType === 'question') {
        try {
            const aiPrompt = `Student Question: "${helpRequest.content}" in Lesson: "${data.metadata?.lessonTitle || 'General'}". Provide a quick helpful answer first. The teacher will follow up if needed.`;
            const aiAnswer = await aiService.getAiResponse(aiPrompt);
            if (aiAnswer) {
                helpRequest.messages.push({
                    senderRole: 'teacher', // Treat AI as a proxy teacher for now
                    content: `[MozhiAruvi AI Assist]: ${aiAnswer}`,
                    createdAt: new Date()
                });
                await helpRequest.save();
            }
        } catch (err) {
            console.error("[AI Assist] Failed to generate auto-response:", err);
        }
    }

    // EMIT NOTIFICATION
    mozhiEvents.emit('HELP_REQUEST_CREATED', { student, teacher: tutor, request: helpRequest });

    return helpRequest;
}

export async function getStudentRequests(studentId, limit = 50) {
    return TutorRequest.find({ studentId })
        .populate('teacherId', 'name email profilePhoto')
        .populate('lessonId', 'title moduleNumber')
        .sort('-createdAt')
        .limit(limit);
}

export async function getTutorRequests(teacherId, status) {
    const query = { teacherId };
    if (status) query.status = status;
    return TutorRequest.find(query)
        .populate('studentId', 'name email')
        .populate('lessonId', 'title moduleNumber')
        .sort('createdAt');
}

/** Returns pending + accepted requests for tutor inbox */
export async function getActiveTutorRequests(teacherId) {
    return TutorRequest.find({
        teacherId,
        status: { $in: ['pending', 'accepted'] }
    })
    .populate('studentId', 'name email')
    .populate('lessonId', 'title moduleNumber')
    .sort({ createdAt: 1 })
    .limit(20); // Optimization: Fetch only most urgent
}

export async function updateRequestStatus(teacherId, requestId, status) {
    const request = await TutorRequest.findById(requestId);
    if (!request) {
        const err = new Error('Request not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    if (request.teacherId.toString() !== teacherId.toString()) {
        const err = new Error('Unauthorized.'); err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }

    if (request.status !== 'pending') {
        const err = new Error('Request has already been evaluated'); err.status = 400; err.code = 'ALREADY_PROCESSED'; throw err;
    }

    request.status = status;

    // If declined, refund the student
    if (status === 'declined') {
        await User.findByIdAndUpdate(request.studentId, { $inc: { credits: request.priceCredits } });
    }

    await request.save();

    // EMIT NOTIFICATION
    const [student, teacher] = await Promise.all([
        User.findById(request.studentId),
        User.findById(request.teacherId)
    ]);
    mozhiEvents.emit('HELP_REQUEST_REPLIED', { student, teacher, request, message: "Request updated to " + status });

    return request;
}

export async function resolveRequest(teacherId, requestId, responseText) {
    const request = await TutorRequest.findById(requestId);
    if (!request || request.teacherId.toString() !== teacherId.toString()) {
        const err = new Error('Request not found or unauthorized'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    // Status transition: allow replying to pending or accepted
    if (request.status === 'declined') {
        const err = new Error('Cannot reply to a declined request'); err.status = 400; err.code = 'INVALID_STATE'; throw err;
    }

    const wasPending = request.status === 'pending' || request.status === 'accepted';
    
    // Add to thread
    request.messages.push({
        senderRole: 'teacher',
        content: responseText,
        createdAt: new Date()
    });

    request.status = 'replied'; 
    request.teacherReply = responseText; // Legacy compatibility

    // Distribute paid credits to tutor's balance ONLY ONCE (first reply)
    if (wasPending) {
        await User.findByIdAndUpdate(teacherId, { $inc: { credits: request.priceCredits } });
    }

    await request.save();
    return request;
}

/** 
 * Generic message addition for continuation of the doubt-solving flow
 */
export async function addRequestMessage(userId, requestId, content, role) {
    const request = await TutorRequest.findById(requestId);
    if (!request) {
        const err = new Error('Request not found'); err.status = 404; throw err;
    }

    // Role check
    const isStudent = request.studentId.toString() === userId.toString();
    const isTeacher = request.teacherId.toString() === userId.toString();
    
    if (role === 'student' && !isStudent) {
        const err = new Error('Unauthorized'); err.status = 403; throw err;
    }
    if (role === 'teacher' && !isTeacher) {
        const err = new Error('Unauthorized'); err.status = 403; throw err;
    }

    request.messages.push({
        senderRole: role,
        content,
        createdAt: new Date()
    });

    // Update status to alert the other party
    if (role === 'student') {
        request.status = 'pending'; // Needs teacher attention again
    } else {
        request.status = 'replied';
    }

    await request.save();

    if (role === 'teacher') {
        const [student, teacher] = await Promise.all([
            User.findById(request.studentId),
            User.findById(request.teacherId)
        ]);
        mozhiEvents.emit('HELP_REQUEST_REPLIED', { student, teacher, request, message: content });
    }

    return request;
}
