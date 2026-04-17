import rateLimit from 'express-rate-limit';

/**
 * STRICT LIMITER
 * Used for expensive AI generation routes or critical interactions.
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Increased from 20 to 100
    message: {
        success: false,
        error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'You have reached the hourly limit for AI interventions. Please try again later.' 
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AUTH LIMITER
 * Used for login/signup to prevent brute force.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Increased from 10 to 50 for better UX
    message: {
        success: false,
        error: { 
            code: 'AUTH_LIMIT_EXCEEDED', 
            message: 'Too many authentication attempts. Please try again in 15 minutes.' 
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});
