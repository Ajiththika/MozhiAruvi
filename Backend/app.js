import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import rateLimit from "express-rate-limit";

import { initGoogle } from "./services/googleService.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import resourceSectionRoutes from "./routes/resourceSectionRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import { testSmtpConnection } from "./services/mailService.js";
import { errorHandler } from "./middleware/error.js";
import { responseWrapper } from "./middleware/responseWrapper.js";
import { csrfProtection } from "./middleware/csrf.js";
import Lesson from './models/Lesson.js';
import User from './models/User.js';
import Question from './models/Question.js';

const app = express();

// ── Trust Proxy ───────────────────────────────────────────────────────────────
app.set("trust proxy", 1);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please slow down and try again in 15 minutes.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    console.warn(`[RATE LIMIT] IP ${req.ip} hit global limit.`);
    res.status(429).json(options.message);
  }
});

app.use("/api/", globalLimiter);

// ── Diagnostics ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [REQ] ${req.method} ${req.url} (Origin: ${req.get("origin") || "No Origin"})`);
  next();
});

// ── DB Guard ──────────────────────────────────────────────────────────────────
app.use('/api/', (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    return res.status(503).json({ message: 'Database temporarily unavailable.' });
  }
  next();
});

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Expires", "0");
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://mozhiaruvi.com",
  "https://www.mozhiaruvi.com",
  ...(process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected Origin: ${origin}`);
      callback(null, false); // Don't throw an error, just return false
    }
  },
  credentials: true,
}));

app.options('*', cors());

// ── Body / Cookie ─────────────────────────────────────────────────────────────
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(cookieParser(process.env.JWT_ACCESS_SECRET));

app.use((req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  req.cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  next();
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
initGoogle(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(responseWrapper);

// ── Routes ────────────────────────────────────────────────────────────────────
// Auth routes excluded from CSRF for OAuth/Login stability
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Apply CSRF protection to all subsequent routes
app.use(csrfProtection);

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/mentors", tutorRoutes);
app.use("/api/teachers", tutorRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/resource-sections", resourceSectionRoutes);
app.use("/api/feedback", feedbackRoutes);

// ── Database Diagnostic Route ─────────────────────────────────────────────────
app.get('/api/db-status', async (req, res) => {
  try {
    const counts = {
      lessons: await Lesson.countDocuments(),
      users: await User.countDocuments(),
      questions: await Question.countDocuments(),
    };
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/health", (_req, res) =>
  res.json({
    status: "operational",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: "1.0.0-resilient",
  })
);

// ── Test Email (development only) ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-email", async (req, res) => {
    const to = req.query.to || process.env.SMTP_USER;
    try {
      const messageId = await testSmtpConnection(to);
      res.json({ success: true, message: `Test email sent to ${to}`, messageId });
    } catch (error) {
      console.error("[TEST-EMAIL] SMTP error:", error);
      res.status(500).json({ success: false, message: "SMTP test failed.", error: error.message });
    }
  });
}

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
