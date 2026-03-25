import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Session from '../models/Session.js';

const DAYS = Number(process.env.REFRESH_EXPIRES_DAYS) || 30;

// ── Access Token ──────────────────────────────────────────────────────────────
export function signAccessToken(user, sessionId) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role, sid: sessionId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

// ── Refresh Token ─────────────────────────────────────────────────────────────
export async function createRefreshToken(userId, meta = {}) {
    const raw = crypto.randomBytes(40).toString('hex');
    const hash = await bcrypt.hash(raw, 10);
    const expiresAt = new Date(Date.now() + DAYS * 86_400_000);

    const session = await Session.create({
        userId,
        tokenHash: hash,
        userAgent: meta.userAgent,
        ip: meta.ip,
        expiresAt,
    });

    return { raw, sessionId: session._id };
}

export async function rotateRefreshToken(oldCombined, meta = {}) {
    if (!oldCombined || !oldCombined.includes('.')) return null;
    const [sid, oldRaw] = oldCombined.split('.');

    // Find session by ID first (very fast)
    const session = await Session.findById(sid);
    if (!session || session.revoked || session.expiresAt < new Date()) {
        console.warn('[rotateRefreshToken] Session not found, revoked, or expired.');
        return null;
    }

    // Verify token hash
    if (!(await bcrypt.compare(oldRaw, session.tokenHash))) {
        console.error('[rotateRefreshToken] Token reuse or invalid token detected for session:', sid);
        // Security logic: if token reuse is detected, you might want to revoke all of user's sessions
        return null;
    }

    // Rotate: revoke old session and create a new one
    session.revoked = true;
    await session.save();

    return createRefreshToken(session.userId, meta);
}

export async function revokeSession(combined) {
    if (!combined || !combined.includes('.')) return false;
    const [sid, raw] = combined.split('.');
    
    const session = await Session.findById(sid);
    if (session && (await bcrypt.compare(raw, session.tokenHash))) {
        session.revoked = true;
        await session.save();
        return true;
    }
    return false;
}

export function setRefreshCookie(res, { raw, sessionId }) {
    // Combine sessionId and raw token using a period separator
    const combined = `${sessionId}.${raw}`;
    res.cookie('rt', combined, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        path: '/',
        maxAge: DAYS * 86_400_000,
    });
}

export function clearRefreshCookie(res) {
    res.clearCookie('rt', {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        path: '/',                  // ← Must match the path used in setRefreshCookie
    });
}
