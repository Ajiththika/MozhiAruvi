import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import * as tokenService from './tokenService.js';
import { sendPasswordResetEmail } from './mailService.js';

function meta(req) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
}

export async function registerUser(req) {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
        const err = new Error('Email already registered.'); err.status = 409; err.code = 'EMAIL_IN_USE'; throw err;
    }
    const user = await User.create({ name, email, password });
    const { raw, sessionId } = await tokenService.createRefreshToken(user._id, meta(req));
    return { user, accessToken: tokenService.signAccessToken(user, sessionId), raw };
}

export async function loginUser(req) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const valid = user && user.password && await user.comparePassword(password);
    if (!valid) {
        const err = new Error('Invalid email or password.'); err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
    }
    const { raw, sessionId } = await tokenService.createRefreshToken(user._id, meta(req));
    return { user, accessToken: tokenService.signAccessToken(user, sessionId), raw };
}

export async function refreshTokens(req) {
    const oldRaw = req.cookies?.rt;
    if (!oldRaw) {
        const err = new Error('Refresh token missing.'); err.status = 401; err.code = 'NO_REFRESH_TOKEN'; throw err;
    }
    const result = await tokenService.rotateRefreshToken(oldRaw, meta(req));
    if (!result) {
        const err = new Error('Session expired or reuse detected.'); err.status = 401; err.code = 'INVALID_REFRESH_TOKEN'; throw err;
    }
    const session = await Session.findById(result.sessionId);
    const user = await User.findById(session.userId);
    return { accessToken: tokenService.signAccessToken(user, result.sessionId), raw: result.raw };
}

export async function getMe(userId) {
    const user = await User.findById(userId);
    if (!user) { const err = new Error('User not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err; }
    return user;
}

export async function sendForgotEmail(req) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        const raw = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
        user.resetPasswordExpiry = new Date(Date.now() + 3_600_000);
        await user.save();
        const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${raw}`;
        await sendPasswordResetEmail(email, resetUrl);
    }
}

export async function doResetPassword(token, password) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hash, resetPasswordExpiry: { $gt: new Date() } });
    if (!user) {
        const err = new Error('Token invalid or expired.'); err.status = 400; err.code = 'INVALID_TOKEN'; throw err;
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();
    await Session.updateMany({ userId: user._id }, { revoked: true });
}
