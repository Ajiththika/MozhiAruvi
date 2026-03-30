import User from '../models/User.js';
import TutorRequest from '../models/TutorRequest.js';

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
                .select('name bio experience specialization hourlyRate languages email schedule teachingMode profilePhoto levelSupport responseTime isTutorAvailable')
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
    const tutor = await User.findOne({ _id: tutorId, role: 'teacher', isActive: true })
        .select('name bio experience specialization hourlyRate languages email schedule teachingMode profilePhoto levelSupport responseTime isTutorAvailable');
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
    const tutor = await User.findById(data.teacherId);
    if (!tutor || tutor.role !== 'teacher' || !tutor.isTutorAvailable || !tutor.isActive) {
        const err = new Error('Tutor not found or not available.'); err.status = 404; err.code = 'UNAVAILABLE_TUTOR'; throw err;
    }

    // Dynamic pricing based on request type
    const pricing = {
        'question': 10,
        'live_class': 30,
        'multi_class': 100
    };
    const priceCredits = pricing[data.requestType || 'question'] || 10;

    const student = await User.findById(studentId);
    if (student.credits < priceCredits && !student.isPremium) {
        const err = new Error(`Insufficient credits. You need ${priceCredits} credits for this request.`); err.status = 402; err.code = 'NOT_ENOUGH_CREDITS'; throw err;
    }

    // Deduct credits immediately
    if (!student.isPremium) {
        student.credits -= priceCredits;
        await student.save();
    }

    return TutorRequest.create({
        studentId,
        teacherId: data.teacherId,
        lessonId: data.lessonId,
        requestType: data.requestType || 'question',
        content: data.content || data.question, // compatibility
        metadata: data.metadata || {},
        priceCredits, 
    });
}

export async function getStudentRequests(studentId) {
    return TutorRequest.find({ studentId })
        .populate('teacherId', 'name email profilePhoto')
        .populate('lessonId', 'title moduleNumber')
        .sort('-createdAt');
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
        .sort('createdAt');
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
    return request;
}
