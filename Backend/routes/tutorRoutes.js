import { Router } from 'express';
import { requireRole } from '../middleware/rbac.js';
import * as tutorController from '../controllers/tutorController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { z } from 'zod';

const router = Router();

const requestTutorSchema = z.object({
    teacherId: z.string().min(1, 'Teacher ID needed'),
    lessonId: z.string().optional(),
    requestType: z.enum(['question', 'live_class', 'multi_class']).default('question'),
    content: z.string().min(1, 'Message content cannot be empty'),
    question: z.string().optional(), // for backward compatibility
    metadata: z.object({
        topics: z.array(z.string()).optional(),
        preferredTime: z.string().optional(),
        sessionsCount: z.number().optional(),
        additionalNotes: z.string().optional(),
        lessonTitle: z.string().optional(),
        lessonModule: z.number().optional(),
    }).optional(),
}).strict();

const respondTutorSchema = z.object({
    response: z.string().min(1, 'Response text cannot be empty'),
}).strict();

const updateTutorProfileSchema = z.object({
    name: z.string().min(1).optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
    age: z.string().or(z.number()).optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().optional(),
    schedule: z.any().optional(),
    hourlyRate: z.string().or(z.number()).optional(),
    languages: z.any().optional(),
    teachingMode: z.enum(['online', 'offline', 'both']).optional(),
    levelSupport: z.any().optional(),
    responseTime: z.string().optional(),
}).strict();

const updateAvailabilitySchema = z.object({
    isTutorAvailable: z.boolean()
}).strict();

// ── Public (Learner) ─────────────────────────────────────────────────────────
// IMPORTANT: static paths (/my-requests, /pending) MUST come before /:id

// Browse available tutors
router.get('/', authenticate, tutorController.listAvailableTutors);

// Learner: view own request history ← before /:id to avoid collision
router.get('/my-requests', authenticate, tutorController.getLearnerRequests);

// Request a tutor's help
router.post('/request', authenticate, validate(requestTutorSchema), tutorController.requestTutor);

// ── Tutor Specific ───────────────────────────────────────────────────────────

// Update tutor profile
router.patch('/me', authenticate, requireRole('teacher'), upload.single('profilePhoto'), validate(updateTutorProfileSchema), tutorController.updateTutorProfile);
router.patch('/me/availability', authenticate, requireRole('teacher'), validate(updateAvailabilitySchema), tutorController.updateTutorAvailability);

// Tutor request management ← before /:id
router.get('/pending', authenticate, requireRole('teacher'), tutorController.getTutorPendingRequests);
router.patch('/requests/:id/accept', authenticate, requireRole('teacher'), tutorController.acceptRequest);
router.patch('/requests/:id/decline', authenticate, requireRole('teacher'), tutorController.declineRequest);
router.patch('/requests/:id/resolve', authenticate, requireRole('teacher'), validate(respondTutorSchema), tutorController.resolveRequest);

// Get specific tutor by ID ← dynamic route LAST
router.get('/:id', authenticate, tutorController.getTutorById);

export default router;
