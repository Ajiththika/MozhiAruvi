import { Router } from 'express';
import * as tutorController from '../controllers/tutorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const requestTutorSchema = z.object({
    teacherId: z.string().min(1, 'Teacher ID needed'),
    lessonId: z.string().optional(),
    question: z.string().min(1, 'Question text cannot be empty'),
}).strict();

const respondTutorSchema = z.object({
    response: z.string().min(1, 'Response text cannot be empty'),
}).strict();

const updateTutorProfileSchema = z.object({
    bio: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().optional(),
    schedule: z.any().optional(),
    hourlyRate: z.number().min(0).optional(),
    languages: z.array(z.string()).optional(),
    teachingMode: z.enum(['online', 'offline', 'both']).optional(),
    profilePhoto: z.string().url().optional().nullable(),
    levelSupport: z.array(z.enum(['beginner', 'intermediate', 'advanced'])).optional(),
    responseTime: z.string().optional(),
}).strict();

const updateAvailabilitySchema = z.object({
    isTutorAvailable: z.boolean()
}).strict();

// ── Public (Learner) ────────────────────────────────────────────────────────
// Browse available tutors (from User model where isTutorAvailable is true)
router.get('/', authenticate, tutorController.listAvailableTutors);

// Get specific tutor by ID
router.get('/:id', authenticate, tutorController.getTutorById);

// Request a tutor's help
router.post('/request', authenticate, validate(requestTutorSchema), tutorController.requestTutor);

// View learner's own requests
router.get('/my-requests', authenticate, tutorController.getLearnerRequests);

// ── Tutor Specific ──────────────────────────────────────────────────────────
import { requireRole } from '../middleware/rbac.js';

// Update tutor profile
router.patch('/me', authenticate, requireRole('teacher'), validate(updateTutorProfileSchema), tutorController.updateTutorProfile);
router.patch('/me/availability', authenticate, requireRole('teacher'), validate(updateAvailabilitySchema), tutorController.updateTutorAvailability);

// These endpoint implementations implicitly check if req.user is the assigned tutor
router.get('/pending', authenticate, requireRole('teacher'), tutorController.getTutorPendingRequests);
router.patch('/requests/:id/accept', authenticate, requireRole('teacher'), tutorController.acceptRequest);
router.patch('/requests/:id/decline', authenticate, requireRole('teacher'), tutorController.declineRequest);
router.patch('/requests/:id/resolve', authenticate, requireRole('teacher'), validate(respondTutorSchema), tutorController.resolveRequest);

export default router;
