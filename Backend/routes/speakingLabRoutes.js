import { Router } from 'express';
import * as speakingLab from '../controllers/speakingLabController.js';
import { generateSpeech } from '../controllers/lessonController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const itemSchema = z.object({
  type: z.enum(['phonetic', 'roleplay', 'dragboard', 'tongue_twister', 'fluency']).optional().default('phonetic'),
  prompt: z.string().min(1, 'Prompt is required'),
  tamilWord: z.string().optional(),
  expectedAudioText: z.string().optional(),
  phoneticHint: z.string().optional(),
  audioUrl: z.string().optional().or(z.literal('')),
  sequence: z.array(z.string()).optional(),
  acceptedAnswers: z.array(z.string()).optional(),
  difficulty: z.number().int().positive().optional(),
  xp: z.number().int().positive().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// ── Student ───────────────────────────────────────────────────────────────────
router.get('/session', authenticate, speakingLab.getSession);
router.post('/evaluate', authenticate, speakingLab.evaluateLabSpeaking);
router.get('/leaderboard', authenticate, speakingLab.getLeaderboard);
// Clear, Google-backed Tamil TTS (falls back to browser synthesis on the client).
router.post('/tts', authenticate, generateSpeech);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/items', authenticate, authorizeRoles(ROLES.ADMIN), speakingLab.listItems);
router.post('/items', authenticate, authorizeRoles(ROLES.ADMIN), validate(itemSchema), speakingLab.createItem);
router.patch('/items/:id', authenticate, authorizeRoles(ROLES.ADMIN), validate(itemSchema.partial()), speakingLab.updateItem);
router.delete('/items/:id', authenticate, authorizeRoles(ROLES.ADMIN), speakingLab.deleteItem);

export default router;
