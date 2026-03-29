import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import upload from '../middleware/upload.js';
import { z } from 'zod';

const router = Router();

// Validate update payload
const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
    age: z.string().or(z.number()).optional(), // handle string-encoded number from FormData
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    languages: z.any().optional(), // more flexible for FD
}).strict();

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
}).strict();

const setLevelSchema = z.object({
    level: z.enum(['Basic', 'Beginner', 'Intermediate', 'Advanced', 'Not Set']),
}).strict();

const onboardingSchema = z.object({
    age: z.number().or(z.string()).optional(),
    level: z.enum(['Basic', 'Beginner', 'Intermediate', 'Advanced', 'Not Set']).optional(),
    goal: z.string().optional(),
    timeAvailability: z.string().optional(),
    priorKnowledge: z.string().optional(),
}).strict();

router.get('/me', authenticate, userController.getProfile);
router.get('/dashboard', authenticate, userController.getStudentDashboardData);
router.patch('/me', authenticate, upload.single('profilePhoto'), validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);
router.patch('/me/deactivate', authenticate, userController.deactivateAccount);
router.patch('/me/level', authenticate, validate(setLevelSchema), userController.setLevel);
router.post('/me/onboarding', authenticate, validate(onboardingSchema), userController.completeOnboarding);
router.post('/me/consume-credit', authenticate, userController.consumeCredit);

export default router;
