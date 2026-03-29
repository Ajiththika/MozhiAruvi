export function csrfProtection(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // For local testing from browser, Origin is usually present
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_ORIGIN];
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isAllowedReferer = referer && allowedOrigins.some(ao => referer.startsWith(ao));

    if (!isAllowedOrigin && !isAllowedReferer) {
        // If neither Origin nor Referer matches our trusted domains, reject it.
        // This is a basic form of CSRF protection suitable for standard API interaction.
        return res.status(403).json({ error: { code: 'CSRF_FAILED', message: 'CSRF token validation failed or origin not allowed.' } });
    }

    next();
}
