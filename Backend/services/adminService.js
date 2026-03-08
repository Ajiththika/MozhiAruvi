import User from '../models/User.js';

// Get users safely, omitting sensitive fields
export async function getAllUsers() {
    return User.find().select('-password -resetPasswordToken -resetPasswordExpires');
}

export async function getAllTutors() {
    return User.find({ isTutorAvailable: true }).select('-password -resetPasswordToken -resetPasswordExpires');
}

export async function setUserActiveStatus(userId, status) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    user.isActive = status;
    await user.save();
    return user;
}

export async function setAdminVerified(userId, status) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (user.role !== 'admin') {
        const err = new Error('User is not an admin'); err.status = 400; err.code = 'INVALID_ROLE'; throw err;
    }
    user.isVerifiedAdmin = status;
    await user.save();
    return user;
}

export async function setTutorStatus(userId, status) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    user.isTutorAvailable = status;
    await user.save();
    return user;
}
