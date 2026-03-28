import * as authService from '../services/authService.js';
import * as tokenService from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Register ──────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { user, accessToken, raw, sessionId } = await authService.registerUser(req);
    tokenService.setRefreshCookie(res, { raw, sessionId });
    res.status(201).json({ accessToken, user: user.toSafeObject() });
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, raw, sessionId } = await authService.loginUser(req);
    tokenService.setRefreshCookie(res, { raw, sessionId });
    res.json({ accessToken, user: user.toSafeObject() });
});

// ── Refresh ───────────────────────────────────────────────────────────────────
export const refresh = asyncHandler(async (req, res, next) => {
    try {
        if (!req.cookies?.rt) {
            return res.status(401).json({ message: 'Session expired or refresh token missing.' });
        }
        const { accessToken, raw, sessionId } = await authService.refreshTokens(req);
        tokenService.setRefreshCookie(res, { raw, sessionId });
        res.json({ accessToken });
    } catch (e) {
        tokenService.clearRefreshCookie(res);
        if (e.status === 401) {
            return res.status(401).json({ message: e.message || 'Refresh failed.' });
        }
        throw e; // Caught by asyncHandler
    }
});

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
    const raw = req.cookies?.rt;
    if (raw) await tokenService.revokeSession(raw);
    tokenService.clearRefreshCookie(res);
    res.json({ message: 'Logged out.' });
});

// ── Me ────────────────────────────────────────────────────────────────────────
export const me = asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.sub);
    res.json({ user: user.toSafeObject() });
});

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
    await authService.sendForgotEmail(req);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
    await authService.doResetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset. Please log in again.' });
});

// ── Google OAuth Callback ─────────────────────────────────────────────────────
export const googleCallback = asyncHandler(async (req, res) => {
    const user = req.user; // set by passport
    const { raw, sessionId } = await tokenService.createRefreshToken(user._id, {
        userAgent: req.headers['user-agent'], ip: req.ip,
    });
    const accessToken = tokenService.signAccessToken(user, sessionId);
    tokenService.setRefreshCookie(res, { raw, sessionId });
    res.redirect(`${process.env.FRONTEND_ORIGIN}/oauth-callback?accessToken=${accessToken}`);
});
