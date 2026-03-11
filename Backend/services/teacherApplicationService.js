import TeacherApplication from '../models/TeacherApplication.js';
import User from '../models/User.js';

/**
 * Submit a teacher application.
 * Rules:
 *  - Only users with role 'user' may apply.
 *  - A user may not have more than one 'pending' application at a time.
 */
export async function applyForTeacher(userId, data) {
    // Guard: only regular users can apply
    const user = await User.findById(userId).select('role');
    if (!user) {
        const err = new Error('User not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (user.role !== 'user') {
        const err = new Error('Only users with role "user" can apply to become a teacher.');
        err.status = 403; err.code = 'FORBIDDEN'; throw err;
    }

    // Guard: no duplicate pending application
    const existing = await TeacherApplication.findOne({ userId, status: 'pending' });
    if (existing) {
        const err = new Error('You already have a pending teacher application.');
        err.status = 409; err.code = 'DUPLICATE_APPLICATION'; throw err;
    }

    return TeacherApplication.create({ userId, ...data });
}

/**
 * Retrieve all teacher applications (admin view).
 * Populates user name + email alongside application data.
 */
export async function getAllApplications() {
    return TeacherApplication.find()
        .populate('userId', 'name email role isActive')
        .populate('reviewedBy', 'name email')
        .sort('-createdAt');
}

/**
 * Approve a teacher application.
 * Side-effects:
 *  - application.status → 'approved'
 *  - application.reviewedBy / reviewedAt set
 *  - user.role → 'teacher'
 *  - user.isTutorAvailable → true
 */
export async function approveApplication(applicationId, adminId) {
    const application = await TeacherApplication.findById(applicationId);
    if (!application) {
        const err = new Error('Application not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (application.status !== 'pending') {
        const err = new Error(`Application is already ${application.status}.`);
        err.status = 400; err.code = 'ALREADY_PROCESSED'; throw err;
    }

    // Update application
    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Promote the user to teacher role
    await User.findByIdAndUpdate(application.userId, {
        $set: { role: 'teacher', isTutorAvailable: true },
    });

    return application.populate([
        { path: 'userId', select: 'name email role isTutorAvailable' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}

/**
 * Reject a teacher application.
 * Side-effects:
 *  - application.status → 'rejected'
 *  - application.reviewedBy / reviewedAt set
 *  (user role is NOT changed)
 */
export async function rejectApplication(applicationId, adminId) {
    const application = await TeacherApplication.findById(applicationId);
    if (!application) {
        const err = new Error('Application not found.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
    }
    if (application.status !== 'pending') {
        const err = new Error(`Application is already ${application.status}.`);
        err.status = 400; err.code = 'ALREADY_PROCESSED'; throw err;
    }

    application.status = 'rejected';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    return application.populate([
        { path: 'userId', select: 'name email role' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}
