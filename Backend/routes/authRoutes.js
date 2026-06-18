import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import * as auth from '../controllers/authController.js';
import { getFrontendUrl, resolveGoogleCallbackUrl } from '../utils/urlHelper.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, forgotSchema, resetSchema } from '../middleware/validate.js';

const router = Router();
console.log('🚀 [AUTH] Auth router initialized');

// Test Route
router.get('/test', (req, res) => {
    console.log(`[AUTH DEBUG] Test route hit! BaseUrl: ${req.baseUrl}`);
    res.json({ success: true, message: 'Auth router is working!', baseUrl: req.baseUrl });
});

// Rate Limiters
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts.' } } });
const refreshLimiter = rateLimit({ windowMs: 15 * 60_000, max: 50, message: { error: { code: 'RATE_LIMITED', message: 'Too many refresh attempts.' } } });
const forgotLimiter = rateLimit({ windowMs: 60 * 60_000, max: 5, message: { error: { code: 'RATE_LIMITED', message: 'Too many forgot password attempts.' } } });
const registerLimiter = rateLimit({ windowMs: 60 * 60_000, max: 5, message: { error: { code: 'RATE_LIMITED', message: 'Too many registration attempts.' } } });

// Standard Auth Routes
router.post('/register', registerLimiter, validate(registerSchema), auth.register);
router.post('/login', loginLimiter, (req, res, next) => { console.log('[AUTH] Login route hit'); next(); }, validate(loginSchema), auth.login);
router.post('/refresh', refreshLimiter, auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);
router.post('/forgot-password', forgotLimiter, validate(forgotSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetSchema), auth.resetPassword);
router.get('/verify-email', auth.verifyEmail);
router.post('/resend-verification', auth.resendVerification);

// ── GOOGLE OAUTH ROUTES ─────────────────────────────────────────────────────

router.get('/google', (req, res, next) => {
    const callbackURL = resolveGoogleCallbackUrl(req);

    console.log(`[AUTH DEBUG] Triggering Google Login. Callback: ${callbackURL}`);

    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email'],
        callbackURL,
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const frontendUrl = getFrontendUrl(req);
    const callbackURL = resolveGoogleCallbackUrl(req);

    passport.authenticate('google', {
        session: false,
        failureRedirect: `${frontendUrl}/auth/signin?error=OAuth-failed`,
        callbackURL,
    })(req, res, (err) => {
        if (err) {
            console.error('[AUTH] Google OAuth error:', err.message);
            return res.redirect(`${frontendUrl}/auth/signin?error=OAuth-failed`);
        }
        next();
    });
}, auth.googleCallback);

export default router;