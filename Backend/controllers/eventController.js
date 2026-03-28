import * as eventService from '../services/eventService.js';

// ── Event CRUD ────────────────────────────────────────────────────────────────

export async function listEvents(req, res, next) {
    try {
        const { page = 1, limit = 6, status = 'all' } = req.query;
        const result = await eventService.getAllEvents(parseInt(page), parseInt(limit), status);
        res.json(result);
    } catch (e) { next(e); }
}

export async function getMyEvents(req, res, next) {
    try {
        const events = await eventService.getTutorEvents(req.user.sub);
        res.json({ events });
    } catch (e) { next(e); }
}

export async function getEvent(req, res, next) {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.json({ event });
    } catch (e) { next(e); }
}

export async function createEvent(req, res, next) {
    try {
        const event = await eventService.createEvent(req.body, req.user.sub);
        res.status(201).json({ event });
    } catch (e) { next(e); }
}

export async function updateEvent(req, res, next) {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        res.json({ event });
    } catch (e) { next(e); }
}

export async function deleteEvent(req, res, next) {
    try {
        await eventService.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted successfully.' });
    } catch (e) { next(e); }
}

// ── Join Requests ─────────────────────────────────────────────────────────────

export async function submitJoinRequest(req, res, next) {
    try {
        const registrationData = req.body;
        const userId = req.user ? req.user.sub : null;
        
        const request = await eventService.createJoinRequest(
            req.params.id,
            userId,
            registrationData
        );
        res.status(201).json({ message: 'Registration submitted successfully.', request });
    } catch (e) { next(e); }
}

export async function getMyJoinRequests(req, res, next) {
    try {
        const requests = await eventService.getMyJoinRequests(req.user.sub);
        res.json({ requests });
    } catch (e) { next(e); }
}

// ── Admin Actions ─────────────────────────────────────────────────────────────

export async function listJoinRequests(req, res, next) {
    try {
        const { eventId, status } = req.query;
        const requests = await eventService.getAllJoinRequests({ eventId, status });
        res.json({ requests });
    } catch (e) { next(e); }
}

export async function approveJoinRequest(req, res, next) {
    try {
        const request = await eventService.approveJoinRequest(req.params.id, req.user.sub);
        res.json({ message: 'Join request approved.', request });
    } catch (e) { next(e); }
}

export async function rejectJoinRequest(req, res, next) {
    try {
        const request = await eventService.rejectJoinRequest(req.params.id, req.user.sub);
        res.json({ message: 'Join request rejected.', request });
    } catch (e) { next(e); }
}
