import { Router } from 'express';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';
import * as tutorController from '../controllers/tutorController.js';
import * as mentorApplicationController from '../controllers/mentorApplicationController.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkTutorAccess } from '../middleware/accessControl.js';
import upload from '../middleware/upload.js';
import { z } from 'zod';

const router = Router();

const requestTutorSchema = z.object({
    teacherId: z.string().optional(),
    lessonId: z.string().optional(),
    requestType: z.enum(['doubt', 'speaking', 'practice', 'question', 'live_class', 'multi_class']).default('doubt'),
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
    weeklySchedule: z.string().optional(),
    hourlyRate: z.string().or(z.number()).optional(),
    oneClassFee: z.string().or(z.number()).optional(),
    eightClassFee: z.string().or(z.number()).optional(),
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

// Browse available tutors (Public Discovery)
router.get('/', authenticateOptional, tutorController.listAvailableTutors);

// Apply for mentor/tutor status
router.post('/apply', authenticate, mentorApplicationController.submitApplication);
router.get('/application/me', authenticate, mentorApplicationController.getMyApplication);
router.patch('/application/me', authenticate, mentorApplicationController.updateMyApplication);

// Learner: view own request history ← before /:id to avoid collision
router.get('/my-requests', authenticate, tutorController.getLearnerRequests);

// Request a tutor's help
router.post('/request', authenticate, checkTutorAccess, validate(requestTutorSchema), tutorController.requestTutor);

// ── Tutor Specific ───────────────────────────────────────────────────────────

// Update tutor profile
router.patch('/me', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), upload.single('profilePhoto'), validate(updateTutorProfileSchema), tutorController.updateTutorProfile);
router.patch('/me/availability', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), validate(updateAvailabilitySchema), tutorController.updateTutorAvailability);

// Tutor request management ← before /:id
router.get('/pending', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.getTutorPendingRequests);
router.patch('/requests/:id/accept', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.acceptRequest);
router.patch('/requests/:id/decline', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.declineRequest);
router.patch('/requests/:id/resolve', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), validate(respondTutorSchema), tutorController.resolveRequest);

// Consolidated messaging for doubt-solving flow
router.post('/requests/:id/message', authenticate, tutorController.addMessage);

// ── Finance (Stripe Connect) ─────────────────────────────────────────────────
router.get('/me/stripe/onboard', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.startStripeOnboarding);
router.get('/me/stripe/finalize', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.finalizeStripeOnboarding);
router.get('/me/financials', authenticate, authorizeRoles(ROLES.TEACHER, ROLES.TUTOR), tutorController.getTutorFinancialStatus);

// Get specific tutor by ID ← dynamic route LAST
router.get('/:id', authenticate, tutorController.getTutorById);

export default router;
