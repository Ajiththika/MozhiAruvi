/**
 * middleware/auth.js
 *
 * Authentication Middleware with Standard Error Responses.
 */
import { verifyAccessToken } from '../services/tokenService.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    
    if (!header?.startsWith('Bearer ')) {
        const error = new Error('Authentication required. Missing Bearer token.');
        error.status = 401;
        error.code = 'UNAUTHENTICATED';
        return next(error);
    }

    try {
        const token = header.slice(7);
        const decoded = verifyAccessToken(token);

        // Optimization: Lean query for existence check
        const user = await User.findById(decoded.sub).select('isActive role isEmailVerified').lean();
        
        if (!user) {
            const error = new Error('User no longer exists.');
            error.status = 401;
            error.code = 'USER_NOT_FOUND';
            return next(error);
        }

        if (!user.isActive) {
            const error = new Error('Your account has been deactivated.');
            error.status = 403;
            error.code = 'ACCOUNT_DEACTIVATED';
            return next(error);
        }

        if (user.isEmailVerified === false) {
            const error = new Error('Email verification required.');
            error.status = 403;
            error.code = 'EMAIL_NOT_VERIFIED';
            return next(error);
        }

        req.user = { ...decoded, role: user.role }; // Attach role from DB for accuracy
        next();
    } catch (err) {
        // Fall through to error handler for consistent JSON response
        const error = new Error(err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.');
        error.status = 401;
        error.code = 'INVALID_TOKEN';
        return next(error);
    }
}

export async function authenticateOptional(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    try {
        const decoded = verifyAccessToken(header.slice(7));
        const user = await User.findById(decoded.sub).select('isActive').lean();
        if (user && user.isActive) {
            req.user = decoded;
        }
        next();
    } catch {
        next(); // Ignore errors for optional auth
    }
}
