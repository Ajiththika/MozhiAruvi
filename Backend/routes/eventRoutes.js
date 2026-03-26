import { Router } from 'express';
import { z } from 'zod';
import * as eventController from '../controllers/eventController.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ── Validation Schemas ────────────────────────────────────────────────────────

const createEventSchema = z
    .object({
        eventCode: z
            .string({ required_error: 'Event code is required.' })
            .trim()
            .min(1, 'Event code cannot be empty.'),
        title: z
            .string({ required_error: 'Title is required.' })
            .trim()
            .min(1, 'Title cannot be empty.'),
        description: z
            .string({ required_error: 'Description is required.' })
            .trim()
            .min(1, 'Description cannot be empty.'),
        date: z
            .string({ required_error: 'Date is required.' })
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
        time: z
            .string({ required_error: 'Time is required.' })
            .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format.'),
        capacity: z
            .number({ required_error: 'Capacity is required.' })
            .int('Capacity must be a whole number.')
            .positive('Capacity must be a positive number.'),
        location: z
            .string({ required_error: 'Location is required.' })
            .trim()
            .min(1, 'Location cannot be empty.'),
    })
    .strict();

const updateEventSchema = z
    .object({
        title: z.string().trim().min(1, 'Title cannot be empty.').optional(),
        description: z.string().trim().min(1, 'Description cannot be empty.').optional(),
        date: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.')
            .optional(),
        time: z
            .string()
            .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format.')
            .optional(),
        capacity: z
            .number()
            .int('Capacity must be a whole number.')
            .positive('Capacity must be a positive number.')
            .optional(),
        location: z.string().trim().min(1, 'Location cannot be empty.').optional(),
        isActive: z.boolean().optional(),
    })
    .strict();

const joinRequestSchema = z
    .object({
        fullName: z.string().trim().min(3, 'Full name must be at least 3 characters.').optional(),
        phoneNumber: z.string().trim().min(5, 'Phone number must be valid.').optional(),
        country: z.string().trim().min(2, 'Country is required.').optional(),
        age: z.number().min(1, 'Age is required.').max(120).optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        message: z.string().trim().max(500, 'Message cannot exceed 500 characters.').optional(),
    });

// ── Public / Authenticated Routes ─────────────────────────────────────────────

// GET /api/events — list all active events (optionally filtered by upcoming/past)
router.get('/', authenticateOptional, eventController.listEvents);

// GET /api/events/my-requests — logged-in user's own join requests
// NOTE: must be declared BEFORE /:id to avoid "my-requests" being treated as an id
router.get('/my-requests', authenticate, eventController.getMyJoinRequests);

// GET /api/events/my-events — tutor sees their own created events
router.get('/my-events', authenticate, authorizeRoles(ROLES.TEACHER), eventController.getMyEvents);

// GET /api/events/:id — single event detail
router.get('/:id', authenticateOptional, eventController.getEvent);

// POST /api/events/:id/join-request — submit a join request
router.post(
    '/:id/join-request',
    authenticateOptional,
    validate(joinRequestSchema),
    eventController.submitJoinRequest
);

// POST /api/events — create event
router.post(
    '/',
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    validate(createEventSchema),
    eventController.createEvent
);

// PATCH /api/events/:id — update event
router.patch(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    validate(updateEventSchema),
    eventController.updateEvent
);

// DELETE /api/events/:id — soft-delete event
router.delete(
    '/:id',
    authenticate,
    authorizeRoles(ROLES.ADMIN),
    eventController.deleteEvent
);

export default router;
