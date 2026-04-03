import MentorApplication from '../models/MentorApplication.js';
import User from '../models/User.js';
import { ROLES } from '../utils/roles.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeError(msg, status, code) {
    const err = new Error(msg);
    err.status = status;
    err.code = code;
    return err;
}

// ── User Application Management ───────────────────────────────────────────────

/**
 * Unified application submission.
 * Handles both "teacher" and "tutor" flows by normalizing fields.
 */
export async function submitApplication(userId, data) {
    const user = await User.findById(userId).select('role name email');
    if (!user) throw makeError('User not found.', 404, 'NOT_FOUND');

    if (user.role !== ROLES.STUDENT && user.role !== ROLES.TUTOR_PENDING) {
        throw makeError(
            'Only students or users in pending status can submit a new application.',
            403,
            'FORBIDDEN'
        );
    }

    // Check for existing actionable application
    const active = await MentorApplication.findOne({
        userId,
        status: { $in: ['pending', 'needs_revision'] },
    });
    if (active) {
        const hint = active.status === 'needs_revision'
                ? 'Please update your existing application instead.'
                : 'You already have a pending application.';
        throw makeError(hint, 409, 'DUPLICATE_APPLICATION');
    }

    // Normalizing fields if they come from different frontend versions
    const normalizedData = {
        userId,
        fullName: data.fullName || data.name || user.name,
        name: data.name || data.fullName || user.name,
        email: data.email || user.email,
        ...data,
        status: 'pending'
    };

    const application = await MentorApplication.create(normalizedData);

    // Sync user status
    await User.findByIdAndUpdate(userId, { tutorStatus: 'pending' });

    return application;
}

/**
 * Get user's active/latest application.
 */
export async function getMyApplication(userId) {
    const application = await MentorApplication.findOne({ userId })
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

    if (!application) throw makeError('No application found.', 404, 'NOT_FOUND');
    return application;
}

/**
 * Update current application (when rejected or revision requested).
 */
export async function updateMyApplication(userId, data) {
    const application = await MentorApplication.findOne({ userId }).sort({ createdAt: -1 });
    if (!application) throw makeError('No application found.', 404, 'NOT_FOUND');

    const editableStatuses = ['pending', 'needs_revision', 'rejected'];
    if (!editableStatuses.includes(application.status)) {
        throw makeError(
            `You cannot edit an application that is already ${application.status}.`,
            400,
            'NOT_EDITABLE'
        );
    }

    // Reset status on update to re-enter review queue
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

// ── Admin-Facing Control ──────────────────────────────────────────────────────

/**
 * Retrieve application list (Admin).
 */
export async function getAllApplications(statusFilter, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = statusFilter ? { status: statusFilter } : {};
    
    const [applications, totalItems] = await Promise.all([
        MentorApplication.find(query)
            .populate('userId', 'name email role isActive profilePhoto')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        MentorApplication.countDocuments(query)
    ]);

    return {
        applications,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page)
    };
}

/**
 * Approve application and promote user.
 */
export async function approveApplication(applicationId, adminId) {
    const application = await MentorApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

    if (application.status === 'approved') {
        throw makeError('Application is already processed.', 400, 'ALREADY_PROCESSED');
    }

    // 1. Mark Application as Approved
    application.status = 'approved';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // 2. Promote User to Teacher (Preferred) or Tutor role
    await User.findByIdAndUpdate(application.userId, {
        $set: {
            role: ROLES.TEACHER,
            tutorStatus: 'approved',
            isTutorAvailable: true,
            bio: application.bio,
            experience: application.experience,
            specialization: application.specialization,
            languages: application.languages,
            hourlyRate: application.hourlyRate,
            schedule: application.schedule || application.availability,
            teachingMode: application.teachingMode,
            profilePhoto: application.profilePhoto,
        },
    });

    return await application.populate([
        { path: 'userId', select: 'name email role tutorStatus isTutorAvailable' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}

/**
 * Reject application.
 */
export async function rejectApplication(applicationId, adminId, { rejectionReason, adminNotes } = {}) {
    const application = await MentorApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

    application.status = 'rejected';
    application.rejectionReason = rejectionReason ?? null;
    application.adminNotes = adminNotes ?? null;
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Mark user status for platform UI consistency
    await User.findByIdAndUpdate(application.userId, { tutorStatus: 'rejected' });

    return await application.populate([
        { path: 'userId', select: 'name email role tutorStatus' },
        { path: 'reviewedBy', select: 'name email' },
    ]);
}

/**
 * Request Revision (Softer than rejection).
 */
export async function requestRevision(applicationId, adminId, adminNotes) {
    const application = await MentorApplication.findById(applicationId);
    if (!application) throw makeError('Application not found.', 404, 'NOT_FOUND');

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
