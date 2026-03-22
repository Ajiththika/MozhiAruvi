import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// Validate update payload
const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').optional(),
    bio: z.string().optional(),
    experience: z.string().optional(),
    specialization: z.string().optional(),
}).strict();

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
}).strict();

const setLevelSchema = z.object({
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Not Set']),
}).strict();

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);
router.patch('/me/deactivate', authenticate, userController.deactivateAccount);
router.patch('/me/level', authenticate, validate(setLevelSchema), userController.setLevel);
router.post('/me/consume-credit', authenticate, userController.consumeCredit);

export default router;
