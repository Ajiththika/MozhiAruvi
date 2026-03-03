import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import * as auth from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, forgotSchema, resetSchema } from '../middleware/validate.js';

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts.' } } });
const forgotLimiter = rateLimit({ windowMs: 60 * 60_000, max: 5, message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts.' } } });

router.post('/register', validate(registerSchema), auth.register);
router.post('/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/refresh', loginLimiter, auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);
router.post('/forgot-password', forgotLimiter, validate(forgotSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetSchema), auth.resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), auth.googleCallback);

export default router;
