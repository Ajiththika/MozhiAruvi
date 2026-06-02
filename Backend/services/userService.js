import User from '../models/User.js';
import Session from '../models/Session.js';
import Transaction from '../models/Transaction.js';

export async function getUserInfo(userId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    // Energy regeneration is owned exclusively by energyManager (operating on
    // the canonical `progress.energy`). The legacy root-level power/credit
    // regeneration has been removed to keep a single source of truth.

    // Sync subscription usage from Subscription collection to the user instance dynamically
    try {
        const Subscription = (await import('../models/Subscription.js')).default;
        let sub = await Subscription.findOne({ userId: user._id });
        if (!sub) {
            sub = await Subscription.create({
                userId: user._id,
                planType: 'basic',
                isActive: true,
                startDate: new Date(),
                usageTracking: {
                    questionsUsed: 0,
                    categoriesAccessed: [],
                    sessionsUsed: 0
                }
            });
        }
        
        if (user.subscription) {
            const { normalizePlanType, planTypeToUserPlan } = await import('../utils/planTypes.js');
            user.subscription.plan = planTypeToUserPlan(sub.planType);
            user.subscription.status = sub.isActive ? 'active' : 'canceled';
            user.subscription.tutorSupportUsed = sub.usageTracking.questionsUsed;
            user.subscription.eventUsageCount = sub.usageTracking.sessionsUsed;
            user.subscription.currentPeriodEnd = sub.endDate;
            user.isPremium = sub.isActive && normalizePlanType(sub.planType) !== 'basic';
        }
    } catch (err) {
        console.error("Failed to dynamically sync subscription metrics to user:", err);
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

export async function completeOnboarding(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (data.age) user.age = data.age;
    if (data.level) user.level = data.level;
    user.hasCompletedOnboarding = true;
    await user.save();
    return user;
}

export async function consumeCredit(userId) {
    const user = await getUserInfo(userId);
    // Operate on the canonical energy source (progress.energy) via energyManager.
    const { regenerateEnergy, consumeEnergy } = await import('../utils/energyManager.js');
    regenerateEnergy(user);
    if (!user.isPremium && (user.progress?.energy ?? 0) <= 0) {
        const err = new Error('Daily credit limit reached'); err.status = 403; err.code = 'NO_CREDITS'; throw err;
    }
    consumeEnergy(user);
    await user.save();

    await Transaction.create({
        user: userId,
        amount: -1,
        transactionType: 'CREDIT',
        source: 'LESSON',
        description: 'Consumed learning credit'
    });

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

export async function getTotalUserCount() {
    return await User.countDocuments({ isActive: true });
}
