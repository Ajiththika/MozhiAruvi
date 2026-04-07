/**
 * middleware/error.js
 *
 * Centralized Error handling with standard JSON Response architecture.
 */
export function errorHandler(err, req, res, _next) {
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'An unexpected error occurred.';
    let code = err.code || 'SERVER_ERROR';

    // ── Handle Mongoose/MongoDB connectivity failures ───────────────────────
    const isOfflineError = (err.name === 'MongooseError' && err.message?.includes('buffering')) ||
                           err.name === 'MongoNotConnectedError' ||
                           (err.message && err.message.includes('querySrv ENOTFOUND')) ||
                           (err.cause && err.cause.name === 'MongoNetworkTimeoutError');

    if (isOfflineError) {
        status = 503; // Service Unavailable
        code = 'DATABASE_OFFLINE';
        message = 'The database is currently unreachable. If you are the administrator, check your IP whitelist on MongoDB Atlas.';
    }

    // ── Logging ───────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production' || status >= 500) {
        console.error(`❌ [ERROR HANDLER] ${status} ${code}: ${message}`);
        if (err.stack) console.error(err.stack);
    }

    // ── Production Response ───────────────────────────────────────────────
    // Standard response pattern: success: false, error: { code, message }
    res.status(status).json({
        success: false,
        error: {
            code,
            message: process.env.NODE_ENV === 'production' && status === 500 
                ? 'Internal server error. Please try again later.' 
                : message,
        },
    });
}
