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
import bookingRoutes from './routes/bookingRoutes.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { testSmtpConnection } from './services/mailService.js';
import { errorHandler } from './middleware/error.js';

import rateLimit from 'express-rate-limit';

const app = express();



// ── Trust Proxy ───────────────────────────────────────────────────────────────
// Required so express-rate-limit can correctly read the real client IP from
// the X-Forwarded-For header added by the Next.js rewrite proxy (and Vercel).
// '1' means we trust exactly one upstream proxy hop.
app.set('trust proxy', 1);

// ── Rate Limiting (SaaS Standard) ─────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { 
        success: false, 
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests from this IP, please try again after 15 minutes.' } 
    },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Apply to all routes
app.use('/api/', globalLimiter);

// ── Diagnostics ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [REQ] ${req.method} ${req.url} (Origin: ${req.get('origin') || 'No Origin'})`);
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
app.use(cookieParser(process.env.JWT_ACCESS_SECRET)); // Added secret for signed cookies if needed

// Standardize cookie settings for security
app.use((req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    req.cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days default
    };
    next();
});

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
app.use('/api/bookings', bookingRoutes);

app.get('/health', (_req, res) => res.json({ 
    status: 'operational', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: '1.0.0-resilient'
}));

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

