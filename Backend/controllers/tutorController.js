import * as tutorService from '../services/tutorService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAvailableTutors = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6, search, level, mode } = req.query;
    const result = await tutorService.getAvailableTutors(
        parseInt(page), 
        parseInt(limit), 
        { search, level, mode }
    );
    res.json(result);
});

export const getTutorById = asyncHandler(async (req, res) => {
    const tutor = await tutorService.getTutorById(req.params.id);
    res.json({ tutor });
});

export const updateTutorProfile = asyncHandler(async (req, res) => {
    if (req.file) {
        req.body.profilePhoto = req.file.path;
    }
    const tutor = await tutorService.updateTutorProfile(req.user.sub, req.body);
    res.json({ message: 'Profile updated.', tutor: tutor.toSafeObject() });
});

export const updateTutorAvailability = asyncHandler(async (req, res) => {
    const tutor = await tutorService.updateTutorAvailability(req.user.sub, req.body.isTutorAvailable);
    res.json({ message: 'Availability updated.', tutor });
});

export const requestTutor = asyncHandler(async (req, res) => {
    const request = await tutorService.createRequest(req.user.sub, req.body);
    res.status(201).json({ 
        message: `Request sent to tutor. ${request.priceCredits} XP points dedicated to this interaction.`, 
        request 
    });
});

export const getLearnerRequests = asyncHandler(async (req, res) => {
    const requests = await tutorService.getStudentRequests(req.user.sub);
    res.json({ requests });
});

export const getTutorPendingRequests = asyncHandler(async (req, res) => {
    const requests = await tutorService.getActiveTutorRequests(req.user.sub);
    res.json({ requests });
});

export const acceptRequest = asyncHandler(async (req, res) => {
    const request = await tutorService.updateRequestStatus(req.user.sub, req.params.id, 'accepted');
    res.json({ message: 'Request accepted.', request });
});

export const declineRequest = asyncHandler(async (req, res) => {
    const request = await tutorService.updateRequestStatus(req.user.sub, req.params.id, 'declined');
    res.json({ message: 'Request declined. Credits refunded to user.', request });
});

export const resolveRequest = asyncHandler(async (req, res) => {
    const request = await tutorService.resolveRequest(req.user.sub, req.params.id, req.body.response);
    res.json({ message: 'Request resolved and response sent.', request });
});

export const addMessage = asyncHandler(async (req, res) => {
    const { role, content } = req.body; // role: 'student' | 'teacher'
    const request = await tutorService.addRequestMessage(req.user.sub, req.params.id, content, role);
    res.json({ message: 'Message added.', request });
});
