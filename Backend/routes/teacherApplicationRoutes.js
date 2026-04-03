import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as mentorApplicationController from '../controllers/mentorApplicationController.js';
import { z } from 'zod';

const router = Router();

// ── Zod schema for new/update teacher application ───────────────────────────
const applicationSchema = z.object({
    fullName: z.string({ required_error: 'fullName is required' }).trim().min(1, 'fullName cannot be empty'),
    bio: z.string({ required_error: 'bio is required' }).trim().min(1, 'bio cannot be empty'),
    experience: z.string({ required_error: 'experience is required' }).trim().min(1, 'experience cannot be empty'),
    specialization: z.string({ required_error: 'specialization is required' }).trim().min(1, 'specialization cannot be empty'),
    languages: z
        .array(z.string().trim().min(1, 'language entry cannot be empty'), {
            required_error: 'languages is required',
        })
        .min(1, 'At least one language is required'),
    hourlyRate: z
        .number({ required_error: 'hourlyRate is required', invalid_type_error: 'hourlyRate must be a number' })
        .positive('hourlyRate must be positive'),
    schedule: z.string({ required_error: 'schedule is required' }).trim().min(1, 'schedule cannot be empty'),
    teachingMode: z.enum(['online', 'offline', 'both'], {
        required_error: 'teachingMode is required',
        invalid_type_error: "teachingMode must be 'online', 'offline', or 'both'",
    }),
    motivation: z.string({ required_error: 'motivation is required' }).trim().min(1, 'motivation cannot be empty'),
    profilePhoto: z.string().url('profilePhoto must be a valid URL').optional().nullable(),
}).strict();

// ── User Application Management Routes ────────────────────────────────────────

// Submit a new application
router.post('/apply', authenticate, validate(applicationSchema), mentorApplicationController.submitApplication);

// View my current application status
router.get('/application/me', authenticate, mentorApplicationController.getMyApplication);

// Update a pending or rejected application
router.patch('/application/me', authenticate, validate(applicationSchema.partial()), mentorApplicationController.updateMyApplication);

export default router;
