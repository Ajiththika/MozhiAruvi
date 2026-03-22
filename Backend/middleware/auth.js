import { verifyAccessToken } from '../services/tokenService.js';

import User from '../models/User.js';

export async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Access token required.' } });

    try {
        const decoded = verifyAccessToken(header.slice(7));

        // Ensure user is active
        const user = await User.findById(decoded.sub).select('isActive');
        if (!user || !user.isActive) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Account deactivated.' } });
        }

        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token invalid or expired.' } });
    }
}

export async function authenticateOptional(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    try {
        const decoded = verifyAccessToken(header.slice(7));
        // Check if user is active
        const user = await User.findById(decoded.sub).select('isActive');
        if (user && user.isActive) {
            req.user = decoded;
        }
        next();
    } catch {
        next(); 
    }
}
