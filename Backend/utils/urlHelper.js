/**
 * Backend/utils/urlHelper.js
 * 
 * Central utility to build stable frontend redirection URLs.
 * Handles production domain lists and identifies localhost automatically.
 */

export function getFrontendUrl(req) {
    // 1. Check for manual override in env
    const primary = process.env.PRIMARY_SITE_URL;
    
    // 2. Localhost Logic (Crucial for development)
    const host = req?.get('host');
    const isDev = process.env.NODE_ENV === 'development';

    if (host || isDev) {
        const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1') || isDev;
        if (isLocal) {
            const origins = process.env.FRONTEND_ORIGIN?.split(',') || [];
            let localOrigin = origins.find(o => o.includes('localhost') || o.includes('127.0.0.1'));
            
            if (localOrigin) {
                // Feature: Auto-downgrade https to http for localhost in development
                // to prevent ERR_SSL_PROTOCOL_ERROR when clicking email links
                if (process.env.NODE_ENV !== 'production' && localOrigin.startsWith('https://')) {
                    localOrigin = localOrigin.replace('https://', 'http://');
                }
                return localOrigin;
            }
            
            if (host) {
                const protocol = req.protocol || 'http';
                return `${protocol}://${host}`;
            }
        }

    }


    // 3. Fallback: Use the manual site URL if specified
    if (primary) return primary.endsWith('/') ? primary.slice(0, -1) : primary;
    
    // 4. Fallback: Use the first item from the FRONTEND_ORIGIN list
    const origins = process.env.FRONTEND_ORIGIN?.split(',') || [];
    // Prefer non-local origins if we are not explicitly in a local request context
    const prodOrigin = origins.find(o => !o.includes('localhost') && !o.includes('127.0.0.1'));
    if (prodOrigin) return prodOrigin;

    return origins[0] || 'http://mozhiaruvi.com';
}


