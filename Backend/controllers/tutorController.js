import * as tutorService from '../services/tutorService.js';

export async function listAvailableTutors(req, res, next) {
    try {
        const { page = 1, limit = 6, search, level, mode } = req.query;
        const result = await tutorService.getAvailableTutors(
            parseInt(page), 
            parseInt(limit), 
            { search, level, mode }
        );
        res.json(result);
    } catch (e) { next(e); }
}

export async function getTutorById(req, res, next) {
    try {
        const tutor = await tutorService.getTutorById(req.params.id);
        res.json({ tutor });
    } catch (e) { next(e); }
}

export async function updateTutorProfile(req, res, next) {
    try {
        if (req.file) {
            req.body.profilePhoto = req.file.path;
        }
        const tutor = await tutorService.updateTutorProfile(req.user.sub, req.body);
        res.json({ message: 'Profile updated.', tutor: tutor.toSafeObject() });
    } catch (e) { next(e); }
}

export async function updateTutorAvailability(req, res, next) {
    try {
        const tutor = await tutorService.updateTutorAvailability(req.user.sub, req.body.isTutorAvailable);
        res.json({ message: 'Availability updated.', tutor });
    } catch (e) { next(e); }
}

export async function requestTutor(req, res, next) {
    try {
        const request = await tutorService.createRequest(req.user.sub, req.body);
        res.status(201).json({ 
            message: `Request sent to tutor. ${request.priceCredits} XP points dedicated to this interaction.`, 
            request 
        });
    } catch (e) { next(e); }
}

export async function getLearnerRequests(req, res, next) {
    try {
        const requests = await tutorService.getStudentRequests(req.user.sub);
        res.json({ requests });
    } catch (e) { next(e); }
}

export async function getTutorPendingRequests(req, res, next) {
    try {
        const requests = await tutorService.getActiveTutorRequests(req.user.sub);
        res.json({ requests });
    } catch (e) { next(e); }
}

export async function acceptRequest(req, res, next) {
    try {
        const request = await tutorService.updateRequestStatus(req.user.sub, req.params.id, 'accepted');
        res.json({ message: 'Request accepted.', request });
    } catch (e) { next(e); }
}

export async function declineRequest(req, res, next) {
    try {
        const request = await tutorService.updateRequestStatus(req.user.sub, req.params.id, 'declined');
        res.json({ message: 'Request declined. Credits refunded to user.', request });
    } catch (e) { next(e); }
}

export async function resolveRequest(req, res, next) {
    try {
        const request = await tutorService.resolveRequest(req.user.sub, req.params.id, req.body.response);
        res.json({ message: 'Request resolved and response sent.', request });
    } catch (e) { next(e); }
}

export async function addMessage(req, res, next) {
    try {
        const { role, content } = req.body; // role: 'student' | 'teacher'
        const request = await tutorService.addRequestMessage(req.user.sub, req.params.id, content, role);
        res.json({ message: 'Message added.', request });
    } catch (e) { next(e); }
}
