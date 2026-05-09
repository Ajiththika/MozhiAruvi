export function csrfProtection(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // For local testing from browser, Origin is usually present
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (!origin && !referer) {
        return res.status(403).json({ error: { code: 'CSRF_FAILED', message: 'CSRF token validation failed or origin not allowed.' } });
    }

    const frontendOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : [];
    const allowedOrigins = [
        'http://localhost:3000', 
        'http://127.0.0.1:3000', 
        'https://mozhiaruvi.com', 
        'https://www.mozhiaruvi.com', 
        ...frontendOrigins
    ];
    
    // Normalize origins for comparison (remove trailing slashes)
    const normalize = (url) => url ? url.replace(/\/$/, '') : '';
    const cleanOrigin = normalize(origin);
    const cleanReferer = normalize(referer);

    const isAwsWildcard = (url) => url && (
        url.endsWith('.vercel.app') || 
        url.endsWith('.amplifyapp.com') || 
        url.endsWith('.amazonaws.com') ||
        url.endsWith('.awsapprunner.com') ||
        url.endsWith('.elasticbeanstalk.com')
    );

    const isAllowedOrigin = cleanOrigin && (allowedOrigins.some(ao => normalize(ao) === cleanOrigin) || isAwsWildcard(cleanOrigin));
    
    let isAllowedReferer = false;
    if (cleanReferer) {
        if (allowedOrigins.some(ao => cleanReferer.startsWith(normalize(ao)))) {
            isAllowedReferer = true;
        } else {
            try {
                isAllowedReferer = isAwsWildcard(new URL(cleanReferer).hostname);
            } catch (e) {
                // Fallback if referer is not a valid URL object
                isAllowedReferer = isAwsWildcard(cleanReferer);
            }
        }
    }

    if (!isAllowedOrigin && !isAllowedReferer) {
        console.warn(`[CSRF REJECTION] Origin: ${origin}, Referer: ${referer}`);
        return res.status(403).json({ error: { code: 'CSRF_FAILED', message: 'CSRF token validation failed or origin not allowed.' } });
    }

    next();
}
