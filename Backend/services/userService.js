import User from '../models/User.js';
import Session from '../models/Session.js';

export async function getUserInfo(userId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    const oneHour = 1000 * 60 * 60;
    if (user.learningCredits < 25) {
        const now = new Date();
        const lastUpdate = user.lastCreditUpdate || now;
        const diffMs = now - lastUpdate;
        const diffHours = Math.floor(diffMs / oneHour);
        if (diffHours > 0) {
            const newCredits = Math.min(25, user.learningCredits + diffHours);
            user.learningCredits = newCredits;
            // Shift lastUpdate forward by exact hours to keep the 'partial hour' credit progress
            user.lastCreditUpdate = new Date(lastUpdate.getTime() + (diffHours * oneHour));
            await user.save();
        }
    } else if (!user.lastCreditUpdate) {
        user.lastCreditUpdate = new Date();
        await user.save();
    }

    return user;
}

export async function setUserLevel(userId, level) {
    const user = await User.findByIdAndUpdate(userId, { level }, { new: true });
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    return user;
}

export async function consumeCredit(userId) {
    const user = await getUserInfo(userId);
    if (user.learningCredits <= 0) {
        const err = new Error('Daily credit limit reached'); err.status = 403; err.code = 'NO_CREDITS'; throw err;
    }
    user.learningCredits -= 1;
    // Keep lastCreditUpdate unchanged during consumption to maintain the 1hr interval
    await user.save();
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
    if (updateData.phoneNumber !== undefined) user.phoneNumber = updateData.phoneNumber;
    if (updateData.country !== undefined) user.country = updateData.country;
    if (updateData.age !== undefined) user.age = updateData.age;
    if (updateData.gender !== undefined) user.gender = updateData.gender;
    if (updateData.languages !== undefined) user.languages = updateData.languages;
    if (updateData.profilePhoto !== undefined) user.profilePhoto = updateData.profilePhoto;

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

export async function deactivateUserAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    user.isActive = false;
    await user.save();

    // Revoke all sessions
    await Session.updateMany({ userId: user._id }, { revoked: true });
}
