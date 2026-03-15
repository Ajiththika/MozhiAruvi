import Event from '../models/Event.js';
import EventJoinRequest from '../models/EventJoinRequest.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function notFound(msg = 'Not found.') {
    const err = new Error(msg);
    err.status = 404;
    err.code = 'NOT_FOUND';
    return err;
}

function conflict(msg) {
    const err = new Error(msg);
    err.status = 409;
    err.code = 'CONFLICT';
    return err;
}

function forbidden(msg) {
    const err = new Error(msg);
    err.status = 403;
    err.code = 'FORBIDDEN';
    return err;
}

// ── Event CRUD ────────────────────────────────────────────────────────────────

export async function getAllEvents() {
    return Event.find({ isActive: true }).sort({ date: 1, time: 1 });
}

export async function getEventById(eventId) {
    const event = await Event.findById(eventId);
    if (!event) throw notFound('Event not found.');
    return event;
}

export async function createEvent(data, creatorId) {
    const existing = await Event.findOne({ eventCode: data.eventCode.toUpperCase() });
    if (existing) throw conflict(`Event code "${data.eventCode}" is already in use.`);

    return Event.create({ ...data, createdBy: creatorId });
}

export async function updateEvent(eventId, updateData) {
    const event = await Event.findByIdAndUpdate(
        eventId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    if (!event) throw notFound('Event not found.');
    return event;
}

export async function deleteEvent(eventId) {
    // Soft delete
    const event = await Event.findByIdAndUpdate(
        eventId,
        { $set: { isActive: false } },
        { new: true }
    );
    if (!event) throw notFound('Event not found.');
    return event;
}

// ── Join Requests ────────────────────────────────────────────────────────────

export async function createJoinRequest(eventId, userId, message) {
    const event = await Event.findById(eventId);
    if (!event) throw notFound('Event not found.');
    if (!event.isActive) throw forbidden('This event is no longer active.');

    // Block if event is already at capacity (based on approved requests)
    if (event.participantsCount >= event.capacity) {
        throw forbidden('Event is at full capacity. No more join requests are being accepted.');
    }

    // Check for existing pending or approved request
    const existing = await EventJoinRequest.findOne({ eventId, userId });
    if (existing) {
        if (existing.status === 'pending') {
            throw conflict('You already have a pending join request for this event.');
        }
        if (existing.status === 'approved') {
            throw conflict('You have already been approved for this event.');
        }
        // If rejected, allow re-application by removing old rejected entry
        await EventJoinRequest.deleteOne({ _id: existing._id });
    }

    return EventJoinRequest.create({ eventId, userId, message: message ?? '' });
}

export async function getMyJoinRequests(userId) {
    return EventJoinRequest.find({ userId })
        .populate('eventId', 'eventCode title date time location')
        .sort({ createdAt: -1 });
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function getAllJoinRequests({ eventId, status } = {}) {
    const filter = {};
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;

    return EventJoinRequest.find(filter)
        .populate('eventId', 'eventCode title date time capacity participantsCount')
        .populate('userId', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });
}

export async function approveJoinRequest(requestId, adminId) {
    const request = await EventJoinRequest.findById(requestId);
    if (!request) throw notFound('Join request not found.');
    if (request.status !== 'pending') {
        throw conflict(`Request is already ${request.status}.`);
    }

    const event = await Event.findById(request.eventId);
    if (!event) throw notFound('Associated event not found.');

    if (event.participantsCount >= event.capacity) {
        throw forbidden('Event is at full capacity. Cannot approve more requests.');
    }

    // Atomically increment participants and approve request
    await Event.findByIdAndUpdate(event._id, { $inc: { participantsCount: 1 } });

    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    return request;
}

export async function rejectJoinRequest(requestId, adminId) {
    const request = await EventJoinRequest.findById(requestId);
    if (!request) throw notFound('Join request not found.');
    if (request.status !== 'pending') {
        throw conflict(`Request is already ${request.status}.`);
    }

    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    return request;
}















