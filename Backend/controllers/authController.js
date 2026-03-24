import * as authService from '../services/authService.js';
import * as tokenService from '../services/tokenService.js';

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(req, res, next) {
    try {
        const { user, accessToken, raw } = await authService.registerUser(req);
        tokenService.setRefreshCookie(res, raw);
        res.status(201).json({ accessToken, user: user.toSafeObject() });
    } catch (e) { next(e); }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(req, res, next) {
    try {
        const { user, accessToken, raw } = await authService.loginUser(req);
        tokenService.setRefreshCookie(res, raw);
        res.json({ accessToken, user: user.toSafeObject() });
    } catch (e) { next(e); }
}

// ── Refresh ───────────────────────────────────────────────────────────────────
export async function refresh(req, res, next) {
    try {
        if (!req.cookies?.rt) {
            return res.status(401).json({ message: 'Session expired or refresh token missing.' });
        }
        const { accessToken, raw } = await authService.refreshTokens(req);
        tokenService.setRefreshCookie(res, raw);
        res.json({ accessToken });
    } catch (e) {
        tokenService.clearRefreshCookie(res);
        // If it's a known 401 from the service, return it cleanly
        if (e.status === 401) {
            return res.status(401).json({ message: e.message || 'Refresh failed.' });
        }
        next(e);
    }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(req, res) {
    const raw = req.cookies?.rt;
    if (raw) await tokenService.revokeSession(raw);
    tokenService.clearRefreshCookie(res);
    res.json({ message: 'Logged out.' });
}

// ── Me ────────────────────────────────────────────────────────────────────────
export async function me(req, res, next) {
    try {
        const user = await authService.getMe(req.user.sub);
        res.json({ user: user.toSafeObject() });
    } catch (e) { next(e); }
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export async function forgotPassword(req, res, next) {
    try {
        await authService.sendForgotEmail(req);
        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (e) { next(e); }
}

// ── Reset Password ────────────────────────────────────────────────────────────
export async function resetPassword(req, res, next) {
    try {
        await authService.doResetPassword(req.body.token, req.body.password);
        res.json({ message: 'Password reset. Please log in again.' });
    } catch (e) { next(e); }
}

// ── Google OAuth Callback ─────────────────────────────────────────────────────
export async function googleCallback(req, res, next) {
    try {
        const user = req.user; // set by passport
        const { raw, sessionId } = await tokenService.createRefreshToken(user._id, {
            userAgent: req.headers['user-agent'], ip: req.ip,
        });
        const accessToken = tokenService.signAccessToken(user, sessionId);
        tokenService.setRefreshCookie(res, raw);
        res.redirect(`${process.env.FRONTEND_ORIGIN}/oauth-callback?accessToken=${accessToken}`);
    } catch (e) { next(e); }
}
