import { verifyAccessToken } from '../services/tokenService.js';

export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Access token required.' } });

    try {
        req.user = verifyAccessToken(header.slice(7));
        next();
    } catch {
        res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token invalid or expired.' } });
    }
}
