import * as mentorApplicationService from '../services/mentorApplicationService.js';
import { emitMozhiEvent } from '../events/eventEmitter.js';

// ── Learner-Facing (Submit / View Progress) ──────────────────────────────────

/**
 * Normalizes all Mentor (Teacher/Tutor) applications.
 * POST /api/v1/mentor/apply (Unified Endpoint)
 */
export async function submitApplication(req, res, next) {
    try {
        const application = await mentorApplicationService.submitApplication(req.user.sub, req.body);
        
        // Automated Events (Used for Emails/Logs)
        emitMozhiEvent('TUTOR_APPLIED', {
            name: req.user.name || req.body.fullName || 'Candidate',
            email: req.user.email
        });

        res.status(201).json({
            message: 'Your application to become a mentor/tutor has been submitted successfully.',
            application,
        });
    } catch (e) { next(e); }
}

/**
 * GET /api/v1/mentor/application (Self-lookup)
 */
export async function getMyApplication(req, res, next) {
    try {
        const application = await mentorApplicationService.getMyApplication(req.user.sub);
        res.json({ application });
    } catch (e) { next(e); }
}

/**
 * PATCH /api/v1/mentor/application (Modify pending/rejected)
 */
export async function updateMyApplication(req, res, next) {
    try {
        const application = await mentorApplicationService.updateMyApplication(req.user.sub, req.body);
        res.json({
            message: 'Application updated successfully.',
            application,
        });
    } catch (e) { next(e); }
}

// ── Admin Control ─────────────────────────────────────────────────────────────

/**
 * Filtered & Paginated Applications List.
 * GET /api/v1/admin/mentor-applications
 */
export async function getMentorApplications(req, res, next) {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const result = await mentorApplicationService.getAllApplications(status, parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

/**
 * Approve Mentor and Promote User.
 * PATCH /api/v1/admin/mentor-applications/:id/approve
 */
export async function approveMentorApplication(req, res, next) {
    try {
        const application = await mentorApplicationService.approveApplication(req.params.id, req.user.sub);
        
        // Automated Event: Decision Made (Emails sent automatically via NotificationService)
        if (application?.userId) {
            emitMozhiEvent('TUTOR_APPROVED', {
                name: application.userId.name || 'Approved Mentor',
                email: application.userId.email
            });
        }

        res.json({
            message: 'Application approved. User has been promoted to Mentor (Teacher).',
            application,
        });
    } catch (e) { next(e); }
}

/**
 * Reject Mentor.
 * PATCH /api/v1/admin/mentor-applications/:id/reject
 */
export async function rejectMentorApplication(req, res, next) {
    try {
        const { rejectionReason, adminNotes } = req.body;
        const application = await mentorApplicationService.rejectApplication(
            req.params.id,
            req.user.sub,
            { rejectionReason, adminNotes }
        );

        if (application?.userId) {
            emitMozhiEvent('TUTOR_REJECTED', {
                name: application.userId.name || 'Applicant',
                email: application.userId.email
            });
        }

        res.json({ message: 'Application rejected.', application });
    } catch (e) { next(e); }
}

/**
 * Revision Request.
 * PATCH /api/v1/admin/mentor-applications/:id/revision
 */
export async function requestRevisionMentorApplication(req, res, next) {
    try {
        const { adminNotes } = req.body;
        const application = await mentorApplicationService.requestRevision(
            req.params.id,
            req.user.sub,
            adminNotes
        );
        res.json({ message: 'Revision requested from applicant.', application });
    } catch (e) { next(e); }
}
