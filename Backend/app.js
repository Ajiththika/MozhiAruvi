import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { initGoogle } from './services/googleService.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { testSmtpConnection } from './services/mailService.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// ── Diagnostics ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} (Origin: ${req.get('origin') || 'No Origin'})`);
    next();
});

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Expires', '0');
    next();
});
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_ORIGIN].filter(Boolean),
    credentials: true,
}));

// ── Body / Cookie ─────────────────────────────────────────────────────────────
// Stripe webhook needs raw body for signature verification
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());

// ── Google OAuth (passport) ───────────────────────────────────────────────────
initGoogle(app);

// ── Response Wrapper & CSRF ───────────────────────────────────────────────────
import { responseWrapper } from './middleware/responseWrapper.js';
import { csrfProtection } from './middleware/csrf.js';

app.use(responseWrapper);
app.use(csrfProtection);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/mentors', tutorRoutes); 
app.use('/api/teachers', tutorRoutes); 
app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Test Email (development only) ─────────────────────────────────────────────
// Usage: GET /api/test-email?to=you@example.com
// Remove or disable this route before deploying to production.
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/test-email', async (req, res) => {
        const to = req.query.to || process.env.SMTP_USER;
        try {
            const messageId = await testSmtpConnection(to);
            res.json({ success: true, message: `Test email sent to ${to}`, messageId });
        } catch (error) {
            console.error('[TEST-EMAIL] SMTP error:', error);
            res.status(500).json({
                success: false,
                message: 'SMTP test failed. Check server logs for details.',
                error: error.message,
            });
        }
    });
}

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

