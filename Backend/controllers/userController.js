import * as userService from '../services/userService.js';

export async function getProfile(req, res, next) {
    try {
        const user = await userService.getUserInfo(req.user.sub);
        res.json({ user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function updateProfile(req, res, next) {
    try {
        const user = await userService.updateUserInfo(req.user.sub, req.body);
        res.json({ message: 'Profile updated successfully', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function updatePassword(req, res, next) {
    try {
        await userService.changeUserPassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (e) { next(e); }
}

export async function deactivateAccount(req, res, next) {
    try {
        await userService.deactivateUserAccount(req.user.sub);
        res.clearCookie('rt');
        res.json({ message: 'Account deactivated successfully. You have been logged out.' });
    } catch (e) { next(e); }
}

export async function setLevel(req, res, next) {
    try {
        const user = await userService.setUserLevel(req.user.sub, req.body.level);
        res.json({ message: 'Level updated', user: user.toSafeObject() });
    } catch (e) { next(e); }
}

export async function consumeCredit(req, res, next) {
    try {
        const user = await userService.consumeCredit(req.user.sub);
        res.json({ message: 'Credit consumed', learningCredits: user.learningCredits });
    } catch (e) { next(e); }
}
