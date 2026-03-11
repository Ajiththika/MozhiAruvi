import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { applyForTeacher } from '../controllers/teacherApplicationController.js';
import { z } from 'zod';

const router = Router();

// ── Zod schema for teacher application ──────────────────────────────────────
const teacherApplicationSchema = z.object({
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
        .min(0, 'hourlyRate cannot be negative'),
    schedule: z.record(z.unknown(), { required_error: 'schedule is required' }),
}).strict();

// POST /api/teachers/apply — authenticated users apply to become a teacher
router.post('/apply', authenticate, validate(teacherApplicationSchema), applyForTeacher);

export default router;
