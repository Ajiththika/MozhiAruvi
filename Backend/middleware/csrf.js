export function csrfProtection(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // For local testing from browser, Origin is usually present
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    const frontendOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : [];
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', ...frontendOrigins];
    
    // Normalize origins for comparison (remove trailing slashes)
    const normalize = (url) => url ? url.replace(/\/$/, '') : '';
    const cleanOrigin = normalize(origin);
    const cleanReferer = normalize(referer);

    const isAllowedOrigin = cleanOrigin && allowedOrigins.some(ao => normalize(ao) === cleanOrigin);
    const isAllowedReferer = cleanReferer && allowedOrigins.some(ao => cleanReferer.startsWith(normalize(ao)));

    if (!isAllowedOrigin && !isAllowedReferer) {
        console.warn(`[CSRF REJECTION] Origin: ${origin}, Referer: ${referer}`);
        return res.status(403).json({ error: { code: 'CSRF_FAILED', message: 'CSRF token validation failed or origin not allowed.' } });
    }

    next();
}
