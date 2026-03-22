import { Router } from 'express';
import * as lessonController from '../controllers/lessonController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// Zod schemas for Lesson
const createLessonSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    moduleName: z.string().optional(),
    sectionName: z.string().optional(),
    description: z.string().optional(),
    moduleNumber: z.number().int().nonnegative('Module number must be positive').optional(),
    videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    content: z.string().optional(),
    isPremiumOnly: z.boolean().optional(),
    orderIndex: z.number().int().nonnegative('Order index must be positive'),
}).strict();

const updateLessonSchema = createLessonSchema.partial();

const createQuestionSchema = z.object({
<<<<<<< HEAD
    type: z.enum(['learn', 'match', 'identify', 'listening', 'fill', 'spelling', 'quiz', 'speaking']).optional(),
    text: z.string().min(1, 'Question text required'),
    options: z.array(z.string()).optional(),
    correctOptionIndex: z.number().int().nonnegative('Correct option index required').optional(),
    correctAnswer: z.string().optional(),
=======
    type: z.enum(['choice', 'speaking']).optional().default('choice'),
    text: z.string().min(1, 'Question text required'),
    options: z.array(z.string()).optional(),
    correctOptionIndex: z.number().int().nonnegative().optional(),
    expectedAudioText: z.string().optional(),
>>>>>>> origin/main
    scoreValue: z.number().int().positive().optional()
}).strict();

// Payload format: { answers: [ { questionId: '...', selectedOptionIndex: 0 }, ... ] }
const submitAnswersSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        selectedOptionIndex: z.number().int().nonnegative().optional(),
        isSpeakingCompleted: z.boolean().optional()
    }))
}).strict();

const evaluateSpeakingSchema = z.object({
    questionId: z.string().min(1),
    audioBase64: z.string().optional(), // Base64 chunk for future integration
});

// ── User Endpoints ────────────────────────────────────────────────────────────
// Phase 3: List and View Lessons
router.get('/', authenticate, lessonController.listLessons);
router.get('/:id', authenticate, lessonController.getLessonDetails);

// Phase 4: View Questions & Submit Answers
router.get('/:id/questions', authenticate, lessonController.getLessonQuestions);
router.post('/:id/submit', authenticate, validate(submitAnswersSchema), lessonController.submitAnswers);
router.post('/:id/evaluate-speaking', authenticate, validate(evaluateSpeakingSchema), lessonController.evaluateSpeaking);

// ── Admin Endpoints ───────────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('admin'), validate(createLessonSchema), lessonController.createLesson);
router.patch('/:id', authenticate, requireRole('admin'), validate(updateLessonSchema), lessonController.updateLesson);
router.delete('/:id', authenticate, requireRole('admin'), lessonController.deleteLesson);

router.post('/:id/questions', authenticate, requireRole('admin'), validate(createQuestionSchema), lessonController.createQuestion);

export default router;
