import * as teacherApplicationService from '../services/teacherApplicationService.js';

/**
 * POST /api/teachers/apply
 * Authenticated user submits a teacher application.
 */
export async function applyForTeacher(req, res, next) {
    try {
        const application = await teacherApplicationService.applyForTeacher(req.user.sub, req.body);
        res.status(201).json({
            message: 'Teacher application submitted successfully.',
            application,
        });
    } catch (e) { next(e); }
}

/**
 * GET /api/admin/teacher-applications
 * Admin views all teacher applications.
 */
export async function getTeacherApplications(req, res, next) {
    try {
        const applications = await teacherApplicationService.getAllApplications();
        res.json({ applications });
    } catch (e) { next(e); }
}

/**
 * PATCH /api/admin/teacher-applications/:id/approve
 * Admin approves a teacher application.
 */
export async function approveTeacherApplication(req, res, next) {
    try {
        const application = await teacherApplicationService.approveApplication(req.params.id, req.user.sub);
        res.json({
            message: 'Teacher application approved. User has been promoted to teacher.',
            application,
        });
    } catch (e) { next(e); }
}

/**
 * PATCH /api/admin/teacher-applications/:id/reject
 * Admin rejects a teacher application.
 */
export async function rejectTeacherApplication(req, res, next) {
    try {
        const application = await teacherApplicationService.rejectApplication(req.params.id, req.user.sub);
        res.json({
            message: 'Teacher application rejected.',
            application,
        });
    } catch (e) { next(e); }
}
