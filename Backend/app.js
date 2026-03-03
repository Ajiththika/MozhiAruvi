import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { initGoogle } from './services/googleService.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
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

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
