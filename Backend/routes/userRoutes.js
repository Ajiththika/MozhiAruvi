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

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);

export default router;
