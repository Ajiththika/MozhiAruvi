import User from '../models/User.js';

// Get users with pagination
export async function getAllUsers(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const [users, totalItems] = await Promise.all([
        User.find().select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments()
    ]);
    return {
        users,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page)
    };
}

export async function getAllTutors(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const query = { isTutorAvailable: true };
    const [tutors, totalItems] = await Promise.all([
        User.find(query).select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
    ]);
    return {
        tutors,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page)
    };
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
