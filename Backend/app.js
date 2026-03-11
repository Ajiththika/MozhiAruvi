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
import teacherApplicationRoutes from './routes/teacherApplicationRoutes.js';
import { testSmtpConnection } from './services/mailService.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
}));

// ── Body / Cookie ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Google OAuth (passport) ───────────────────────────────────────────────────
initGoogle(app);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/teachers', teacherApplicationRoutes);

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

