import * as eventService from '../services/eventService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Event CRUD ────────────────────────────────────────────────────────────────

export const listEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6, status = 'all' } = req.query;
    const result = await eventService.getAllEvents(parseInt(page), parseInt(limit), status);
    res.json(result);
});

export const getMyEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getTutorEvents(req.user.sub);
    res.json({ events });
});

export const getEvent = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);
    res.json({ event });
});

export const createEvent = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.body, req.user.sub);
    res.status(201).json({ event });
});

export const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({ event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully.' });
});

// ── Join Requests ─────────────────────────────────────────────────────────────

export const submitJoinRequest = asyncHandler(async (req, res) => {
    const registrationData = req.body;
    const userId = req.user ? req.user.sub : null;
    
    const request = await eventService.createJoinRequest(
        req.params.id,
        userId,
        registrationData
    );
    res.status(201).json({ message: 'Registration submitted successfully.', request });
});

export const getMyJoinRequests = asyncHandler(async (req, res) => {
    const requests = await eventService.getMyJoinRequests(req.user.sub);
    res.json({ requests });
});

// ── Admin Actions ─────────────────────────────────────────────────────────────

export const listJoinRequests = asyncHandler(async (req, res) => {
    const { eventId, status } = req.query;
    const requests = await eventService.getAllJoinRequests({ eventId, status });
    res.json({ requests });
});

export const approveJoinRequest = asyncHandler(async (req, res) => {
    const request = await eventService.approveJoinRequest(req.params.id, req.user.sub);
    res.json({ message: 'Join request approved.', request });
});

export const rejectJoinRequest = asyncHandler(async (req, res) => {
    const request = await eventService.rejectJoinRequest(req.params.id, req.user.sub);
    res.json({ message: 'Join request rejected.', request });
});
