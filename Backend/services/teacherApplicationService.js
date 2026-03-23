import TeacherApplication from '../models/TeacherApplication.js';
import User from '../models/User.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeError(msg, status, code) {
    const err = new Error(msg);
    err.status = status;
    err.code = code;
    return err;
}

// ── User-Facing ───────────────────────────────────────────────────────────────

/**
 * Submit a new teacher application.
 * Rules:
 *   - Only users with role 'user' can apply.
 *   - Cannot apply while a 'pending' or 'needs_revision' application exists
 *     (user should update their existing application instead).
 *   - If a previous application was rejected or approved, a new one is allowed.
 */
export async function applyForTeacher(userId, data) {
    const user = await User.findById(userId).select('role');
    if (!user) throw makeError('User not found.', 404, 'NOT_FOUND');

    if (user.role !== 'user') {
        throw makeError(
            'Only users with role "user" can apply to become a teacher.',
            403,
            'FORBIDDEN'
        );
    }

    // Block if already has an active (actionable) application
    const active = await TeacherApplication.findOne({
        userId,
        status: { $in: ['pending', 'needs_revision'] },
    });
    if (active) {
        const hint =
            active.status === 'needs_revision'
                ? 'Please update your existing application instead.'
                : 'You already have a pending application.';
        throw makeError(hint, 409, 'DUPLICATE_APPLICATION');
    }

    return TeacherApplication.create({ userId, ...data });
}

/**
 * Get the logged-in user's most recent teacher application.
 */
export async function getMyApplication(userId) {
    const application = await TeacherApplication.findOne({ userId })
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

    if (!application) throw makeError('No application found.', 404, 'NOT_FOUND');
    return application;
}

/**
 * User updates their own application.
 * Allowed only when status is: pending, needs_revision, or rejected (re-apply flow).
 */
export async function updateMyApplication(userId, data) {
    const application = await TeacherApplication.findOne({ userId }).sort({ createdAt: -1 });
    if (!application) throw makeError('No application found.', 404, 'NOT_FOUND');

    const editableStatuses = ['pending', 'needs_revision', 'rejected'];
    if (!editableStatuses.includes(application.status)) {
        throw makeError(
            `You cannot edit an application that is already ${application.status}.`,
            400,
            'NOT_EDITABLE'
        );
    }

    // If the application was rejected or needs revision, reset to pending on update
    if (application.status === 'rejected' || application.status === 'needs_revision') {
        application.status = 'pending';
        application.adminNotes = null;
        application.rejectionReason = null;
        application.reviewedBy = null;
        application.reviewedAt = null;
    }

    Object.assign(application, data);
    await application.save();

    return application;
}

// ── Admin-Facing ──────────────────────────────────────────────────────────────

/**
 * Retrieve all teacher applications with optional status filter.
 */
export async function getAllApplications(statusFilter, page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const query = statusFilter ? { status: statusFilter } : {};
    
    const [applications, totalItems] = await Promise.all([
        TeacherApplication.find(query)
            .populate('userId', 'name email role isActive profilePhoto')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        TeacherApplication.countDocuments(query)
    ]);

    return {
        applications,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page)
    };
}

/**
 * Approve a teacher application.
 * Side effects:
 *   - status → approved
 *   - user.role → teacher
 *   - user.isTutorAvailable → true
 *   - Copies profile data (bio, specialization, etc.) from application to user
 */
export async function approveApplication(applicationId, adminId) {
    const application = await TeacherApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

    if (application.status !== 'pending' && application.status !== 'needs_revision') {
        throw makeError(
            `Application is already ${application.status}.`,
            400,
            'ALREADY_PROCESSED'
        );
    }

    // Update application
    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Promote user and copy profile fields from application
    await User.findByIdAndUpdate(application.userId, {
        $set: {
            role: 'teacher',
            isTutorAvailable: true,
            bio: application.bio,
            experience: application.experience,
            specialization: application.specialization,
            languages: application.languages,
            hourlyRate: application.hourlyRate,
            schedule: application.schedule,
            teachingMode: application.teachingMode,
            profilePhoto: application.profilePhoto,
        },
    });

    return await application.populate([
        { path: 'userId', select: 'name email role isTutorAvailable' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}

/**
 * Reject a teacher application with an optional reason and admin notes.
 */
export async function rejectApplication(applicationId, adminId, { rejectionReason, adminNotes } = {}) {
    const application = await TeacherApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

    if (application.status === 'approved') {
        throw makeError('Cannot reject an already approved application.', 400, 'ALREADY_PROCESSED');
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason ?? null;
    application.adminNotes = adminNotes ?? null;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    return await application.populate([
        { path: 'userId', select: 'name email role' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}

/**
 * Request revision — a softer alternative to rejection.
 * The application is returned to the user for updates.
 */
export async function requestRevision(applicationId, adminId, adminNotes) {
    const application = await TeacherApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

    if (application.status !== 'pending') {
        throw makeError(
            `Only pending applications can be sent for revision. Current status: ${application.status}.`,
            400,
            'INVALID_STATE'
        );
    }

    application.status = 'needs_revision';
    application.adminNotes = adminNotes ?? null;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    return await application.populate([
        { path: 'userId', select: 'name email role' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}
