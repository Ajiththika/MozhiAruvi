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

export async function rotateRefreshToken(oldRaw, meta = {}) {
    // Only consider active, unexpired sessions
    const sessions = await Session.find({ revoked: false, expiresAt: { $gt: new Date() } });

    let matched = null;
    for (const s of sessions) {
        if (await bcrypt.compare(oldRaw, s.tokenHash)) { matched = s; break; }
    }

    if (!matched) {
        console.warn('[rotateRefreshToken] No matching active session found for provided refresh token.');
        return null;
    }

    // Rotate: revoke the old session and create a new one
    matched.revoked = true;
    await matched.save();

    return createRefreshToken(matched.userId, meta);
}

export async function revokeSession(raw) {
    const sessions = await Session.find({ revoked: false });
    for (const s of sessions) {
        if (await bcrypt.compare(raw, s.tokenHash)) {
            s.revoked = true;
            await s.save();
            return true;
        }
    }
    return false;
}

export function setRefreshCookie(res, token) {
    res.cookie('rt', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'lax',
        path: '/',                  // ← CRITICAL: without this, cookie is scoped to the
        maxAge: DAYS * 86_400_000,  //   login route path and is never sent to /api/auth/refresh
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
