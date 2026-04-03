import * as tutorApplicationService from '../services/tutorApplicationService.js';

/**
 * POST /api/tutor/apply
 */
export async function applyForTutor(req, res, next) {
    try {
        const application = await tutorApplicationService.submitApplication(req.user.sub, req.body);
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
        res.json({
            message: 'Tutor application rejected.',
            application,
        });
    } catch (e) {
        next(e);
    }
}
