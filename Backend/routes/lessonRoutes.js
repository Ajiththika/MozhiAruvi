import * as lessonController from '../controllers/lessonController.js';
import { Router } from 'express';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// Zod schemas for Lesson
const createLessonSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Category is required'),
    type: z.enum(['MCQ', 'speaking', 'writing', 'mixed']).optional().default('mixed'),
    examples: z.array(z.string()).optional(),
    moduleName: z.string().optional(),
    sectionName: z.string().optional(),
    description: z.string().optional(),
    moduleNumber: z.number().int().nonnegative('Module number must be positive').optional(),
    videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    content: z.string().optional(),
    isPremiumOnly: z.boolean().optional(),
    orderIndex: z.number().int().optional().default(0),
    level: z.enum(['Basic', 'Beginner', 'Intermediate', 'Advanced']).optional().default('Basic'),
}).strict();

const updateLessonSchema = createLessonSchema.partial();

const createQuestionSchema = z.object({
    type: z.enum(['learn', 'match', 'identify', 'listening', 'fill', 'spelling', 'quiz', 'speaking', 'choice', 'writing']).optional().default('quiz'),
    text: z.string().min(1, 'Question text required'),
    options: z.array(z.string()).optional(),
    correctOptionIndex: z.number().int().nonnegative('Correct option index required').optional(),
    correctAnswer: z.string().optional(),
    expectedAudioText: z.string().optional(),
    scoreValue: z.number().int().positive().optional()
}).strict();

// Payload format: { answers: [ { questionId: '...', selectedOptionIndex: 0 }, ... ] }
const submitAnswersSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        selectedOptionIndex: z.number().int().optional(),
        isSpeakingCompleted: z.boolean().optional()
    }))
}).strict();

const evaluateSpeakingSchema = z.object({
    questionId: z.string().min(1),
    audioBase64: z.string().optional(), // Base64 chunk for future integration
});

// ── User Endpoints ────────────────────────────────────────────────────────────
// Phase 3: List and View Lessons
router.get('/', authenticateOptional, lessonController.listLessons);
router.get('/:id', authenticate, lessonController.getLessonDetails);

// Phase 4: View Questions & Submit Answers
router.get('/:id/questions', authenticate, lessonController.getLessonQuestions);
router.post('/:id/submit', authenticate, validate(submitAnswersSchema), lessonController.submitAnswers);
router.post('/:id/evaluate-speaking', authenticate, validate(evaluateSpeakingSchema), lessonController.evaluateSpeaking);

// ── Admin Endpoints ───────────────────────────────────────────────────────────
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), validate(createLessonSchema), lessonController.createLesson);
router.patch('/:id', authenticate, authorizeRoles(ROLES.ADMIN), validate(updateLessonSchema), lessonController.updateLesson);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN), lessonController.deleteLesson);

router.post('/:id/questions', authenticate, authorizeRoles(ROLES.ADMIN), validate(createQuestionSchema), lessonController.createQuestion);
router.delete('/:id/questions/:qId', authenticate, authorizeRoles(ROLES.ADMIN), lessonController.deleteQuestion);

export default router;
