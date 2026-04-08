import rateLimit from 'express-rate-limit';

/**
 * STRICT LIMITER
 * Used for expensive AI generation routes or critical interactions.
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 requests per hour
    message: {
        success: false,
        error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'You have reached the hourly limit for AI interventions. Please try again later to ensure fair usage for all scholars.' 
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
    max: 10,
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
