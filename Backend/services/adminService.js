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



export async function setTutorStatus(userId, status) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    user.isTutorAvailable = status;
    await user.save();
    return user;
}

export async function editUser(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }

    // Allow updating all non-sensitive fields
    const allowedFields = [
        'name', 'phoneNumber', 'country', 'age', 'gender', 
        'bio', 'experience', 'specialization', 'isTutorAvailable',
        'isPremium', 'credits', 'teachingMode', 'profilePhoto', 
        'levelSupport', 'responseTime', 'role'
    ];

    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            user[field] = updateData[field];
        }
    });

    await user.save();
    return user;
}
