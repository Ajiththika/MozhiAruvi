import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import * as tokenService from './tokenService.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './mailService.js';
import { getFrontendUrl } from '../utils/urlHelper.js';

function meta(req) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
}

export async function registerUser(req) {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
        const err = new Error('Email already registered.'); err.status = 409; err.code = 'EMAIL_IN_USE'; throw err;
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
        name, 
        email, 
        password,
        verificationToken,
        verificationTokenExpires,
        isEmailVerified: false
    });

    const verifyUrl = `${getFrontendUrl(req)}/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verifyUrl);

    const { raw, sessionId } = await tokenService.createRefreshToken(user._id, meta(req));
    return { user, accessToken: tokenService.signAccessToken(user, sessionId), raw, sessionId };
}

export async function loginUser(req) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const valid = user && user.password && await user.comparePassword(password);
    if (!valid) {
        const err = new Error('Invalid email or password.'); err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
    }

    if (user.isEmailVerified === false) {
        const err = new Error('Please verify your email before logging in.'); 
        err.status = 403; 
        err.code = 'EMAIL_NOT_VERIFIED'; 
        throw err;
    }

    const { raw, sessionId } = await tokenService.createRefreshToken(user._id, meta(req));
    return { user, accessToken: tokenService.signAccessToken(user, sessionId), raw, sessionId };
}

export async function refreshTokens(req) {
    // [refresh] Step 1: Check cookie exists
    const oldRaw = req.cookies?.rt;
    if (!oldRaw) {
        const err = new Error('Refresh token missing.'); err.status = 401; err.code = 'NO_REFRESH_TOKEN'; throw err;
    }

    // [refresh] Step 2: Rotate session
    const result = await tokenService.rotateRefreshToken(oldRaw, meta(req));
    if (!result) {
        const err = new Error('Session expired or reuse detected.'); err.status = 401; err.code = 'INVALID_REFRESH_TOKEN'; throw err;
    }

    // [refresh] Step 3: Load user from new session
    const session = await Session.findById(result.sessionId);
    if (!session) {
        const err = new Error('Session not found after rotation.'); err.status = 500; err.code = 'SESSION_ERROR'; throw err;
    }

    const user = await User.findById(session.userId);
    if (!user) {
        const err = new Error('User not found.'); err.status = 401; err.code = 'USER_NOT_FOUND'; throw err;
    }

    return { accessToken: tokenService.signAccessToken(user, result.sessionId), raw: result.raw, sessionId: result.sessionId };
}

export async function getMe(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) { const err = new Error('User not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err; }
        return user;
    } catch (e) {
        if (e.name === 'MongooseError' || e.message?.includes('timeout') || e.message?.includes('buffering')) {
            const err = new Error('Database is offline.'); err.status = 503; throw err;
        }
        throw e;
    }
}

export async function sendForgotEmail(req) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        // Generate a cryptographically strong 64-character hex string
        const token = crypto.randomBytes(32).toString('hex');
        
        user.set({
            resetPasswordToken: token,
            resetPasswordExpires: new Date(Date.now() + 600_000) // 10 minutes
        });
        
        await user.save();
        
        const resetUrl = `${getFrontendUrl(req)}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        
        console.log(`[AUTH] Reset email prepared for ${email}. Token: ${token.substring(0, 5)}...`);
        
        await sendPasswordResetEmail(email, resetUrl);
    }


}

export async function doResetPassword(token, password) {
    if (!token) {
        const err = new Error('Reset token is missing.'); 
        err.status = 400; 
        throw err;
    }

    // Find the user by raw token
    const user = await User.findOne({ resetPasswordToken: token });
    
    if (!user) {
        console.warn(`[AUTH] Reset attempt with non-existent token: ${token.substring(0, 10)}...`);
        const err = new Error('This reset link is invalid. Please request a new one.'); 
        err.status = 400; 
        err.code = 'INVALID_TOKEN'; 
        throw err;
    }

    // Check if it's expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        console.warn(`[AUTH] Reset attempt with expired token for user: ${user.email}`);
        const err = new Error('This reset link has expired. Please request a new one.');
        err.status = 400;
        err.code = 'EXPIRED_TOKEN';
        err.email = user.email; // Pass email back so frontend can resend easily
        throw err;
    }


    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // Revoke all existing sessions for security after password change
    await Session.updateMany({ userId: user._id }, { revoked: true });
}

export async function verifyUserEmail(token) {
    if (!token) {
        const err = new Error('Verification token is missing.');
        err.status = 400;
        throw err;
    }

    const user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
        const err = new Error('Invalid or expired verification token.');
        err.status = 400;
        err.code = 'INVALID_VERIFICATION_TOKEN';
        throw err;
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return user;
}


