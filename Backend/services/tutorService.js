import User from '../models/User.js';
import TutorRequest from '../models/TutorRequest.js';

export async function getAvailableTutors() {
    return User.find({ role: 'teacher', isActive: true, isTutorAvailable: true })
        .select('name bio experience specialization hourlyRate languages email schedule teachingMode profilePhoto levelSupport responseTime isTutorAvailable');
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

    const priceCredits = 10; // Alternatively, tutor.hourlyRate could define this

    const student = await User.findById(studentId);
    // Phase 8: Premium Feature / Credit System restriction inside the phase 6 logic
    if (student.credits < priceCredits && !student.isPremium) {
        const err = new Error('Insufficient credits.'); err.status = 402; err.code = 'NOT_ENOUGH_CREDITS'; throw err;
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
        question: data.question,
        priceCredits, // Keep historical record of what was paid
    });
}

export async function getStudentRequests(studentId) {
    return TutorRequest.find({ studentId }).populate('teacherId', 'name email').sort('-createdAt');
}

export async function getTutorRequests(teacherId, status) {
    const query = { teacherId };
    if (status) query.status = status;
    return TutorRequest.find(query).populate('studentId', 'name email').sort('createdAt');
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

    if (request.status !== 'accepted' && request.status !== 'answered') {
        const err = new Error('Only accepted or answered requests can be resolved'); err.status = 400; err.code = 'INVALID_STATE'; throw err;
    }

    request.status = 'resolved';
    request.teacherAnswer = responseText;

    // Distribute paid credits to tutor's balance
    await User.findByIdAndUpdate(teacherId, { $inc: { credits: request.priceCredits } });

    await request.save();
    return request;
}
