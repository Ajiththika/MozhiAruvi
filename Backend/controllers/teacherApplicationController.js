import * as teacherApplicationService from '../services/teacherApplicationService.js';

// ── User-Facing ───────────────────────────────────────────────────────────────

/**
 * POST /api/teachers/apply
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
 * GET /api/teachers/application/me
 */
export async function getMyApplication(req, res, next) {
    try {
        const application = await teacherApplicationService.getMyApplication(req.user.sub);
        res.json({ application });
    } catch (e) { next(e); }
}

/**
 * PATCH /api/teachers/application/me
 */
export async function updateMyApplication(req, res, next) {
    try {
        const application = await teacherApplicationService.updateMyApplication(req.user.sub, req.body);
        res.json({
            message: 'Teacher application updated successfully.',
            application,
        });
    } catch (e) { next(e); }
}

// ── Admin-Facing ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/teacher-applications
 */
export async function getTeacherApplications(req, res, next) {
    try {
        const { status, page = 1, limit = 6 } = req.query;
        const result = await teacherApplicationService.getAllApplications(status, parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

/**
 * PATCH /api/admin/teacher-applications/:id/approve
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
 */
export async function rejectTeacherApplication(req, res, next) {
    try {
        const { rejectionReason, adminNotes } = req.body;
        const application = await teacherApplicationService.rejectApplication(
            req.params.id,
            req.user.sub,
            { rejectionReason, adminNotes }
        );
        res.json({
            message: 'Teacher application rejected.',
            application,
        });
    } catch (e) { next(e); }
}

/**
 * PATCH /api/admin/teacher-applications/:id/request-revision
 */
export async function requestRevisionTeacherApplication(req, res, next) {
    try {
        const { adminNotes } = req.body;
        const application = await teacherApplicationService.requestRevision(
            req.params.id,
            req.user.sub,
            adminNotes
        );
        res.json({
            message: 'Requested revision from applicant.',
            application,
        });
    } catch (e) { next(e); }
}
