import * as tutorApplicationService from '../services/tutorApplicationService.js';
import { emitMozhiEvent } from '../events/eventEmitter.js';

/**
 * POST /api/tutor/apply
 */
export async function applyForTutor(req, res, next) {
    try {
        const application = await tutorApplicationService.submitApplication(req.user.sub, req.body);
        
        // ── Automated Acknowledgment ───────────────────────────────────────────
        emitMozhiEvent('TUTOR_APPLIED', {
            name: req.user.name || 'Student',
            email: req.user.email
        });

        res.status(201).json({
            message: 'Tutor application submitted successfully.',
            application,
        });
    } catch (e) {
        next(e);
    }
}

/**
 * GET /api/admin/tutors
 */
export async function getTutorApplications(req, res, next) {
    try {
        const applications = await tutorApplicationService.getAllApplications();
        res.json({ applications });
    } catch (e) {
        next(e);
    }
}

/**
 * PATCH /api/admin/tutors/:id/approve
 */
export async function approveTutorApplication(req, res, next) {
    try {
        const application = await tutorApplicationService.approveApplication(req.params.id);
        
        // ── Automated Approval Flow ────────────────────────────────────────────
        if (application?.userId) {
            emitMozhiEvent('TUTOR_APPROVED', {
                name: application.userId.name || 'Tutor',
                email: application.userId.email
            });
        }

        res.json({
            message: 'Tutor application approved. User has been promoted to tutor.',
            application,
        });
    } catch (e) {
        next(e);
    }
}

/**
 * PATCH /api/admin/tutors/:id/reject
 */
export async function rejectTutorApplication(req, res, next) {
    try {
        const { adminNotes } = req.body;
        const application = await tutorApplicationService.rejectApplication(req.params.id, adminNotes);
        
        // ── Automated Rejection Flow ───────────────────────────────────────────
        if (application?.userId) {
            emitMozhiEvent('TUTOR_REJECTED', {
                name: application.userId.name || 'Applicant',
                email: application.userId.email
            });
        }

        res.json({
            message: 'Tutor application rejected.',
            application,
        });
    } catch (e) {
        next(e);
    }
}
