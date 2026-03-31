import User from '../models/User.js';
import TeacherApplication from '../models/TeacherApplication.js';
import Event from '../models/Event.js';

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
    const query = { role: { $in: ['teacher', 'tutor'] } };
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

export async function warnUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    user.warnings = (user.warnings || 0) + 1;
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

    // Special logic: If role is upgraded to teacher by admin, make them available by default
    if (updateData.role === 'teacher' || updateData.role === 'tutor') {
        user.isTutorAvailable = true;
    }

    await user.save();
    return user;
}

export async function getDashboardStats() {
    const [totalUsers, activeUsers, totalTutors, pendingApps, totalEvents] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: { $in: ['teacher', 'tutor'] } }),
        TeacherApplication.countDocuments({ status: 'pending' }),
        Event.countDocuments()
    ]);

    return {
        totalUsers,
        activeUsers,
        totalTutors,
        pendingApps,
        totalEvents
    };
}
