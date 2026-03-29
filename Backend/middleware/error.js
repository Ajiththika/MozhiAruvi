export function errorHandler(err, req, res, _next) {
    let status = err.status || 500;
    let message = err.message || 'An unexpected error occurred.';
    let code = err.code || 'SERVER_ERROR';

    const isOfflineError = (err.name === 'MongooseError' && err.message?.includes('buffering')) ||
                           err.name === 'MongoNotConnectedError' ||
                           (err.message && err.message.includes('querySrv ENOTFOUND'));

    if (process.env.NODE_ENV !== 'production') {
        if (isOfflineError) {
             console.warn('[DB OFFLINE]: Connection timed out or unavailable. Running in degraded mode.');
        } else {
             console.error('[ERROR HANDLER]:', err);
        }
    }

    // ── Handle Database Disconnection & Buffering Timeouts ─────────────────
    if (isOfflineError) {
        status = 503; // Service Unavailable
        code = 'DATABASE_OFFLINE';
        message = 'The database is currently unreachable. If you are the administrator, check your IP whitelist on MongoDB Atlas.';
    }

    res.status(status).json({
        error: {
            code,
            message,
        },
    });
}
