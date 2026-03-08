import User from '../models/User.js';
import Session from '../models/Session.js';

export async function getUserInfo(userId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return user;
}

export async function updateUserInfo(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.experience !== undefined) user.experience = updateData.experience;
    if (updateData.specialization !== undefined) user.specialization = updateData.specialization;

    await user.save();
    return user;
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    if (!user.password) {
        const err = new Error('OAuth users cannot change password directly'); err.status = 400; err.code = 'INVALID_AUTH_METHOD'; throw err;
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
        const err = new Error('Incorrect current password'); err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err;
    }

    // Assign new password, the pre-save hook handles hashing
    user.password = newPassword;
    await user.save();

    // Revoke all existing sessions so that user must log in again
    await Session.updateMany({ userId: user._id }, { revoked: true });
}
