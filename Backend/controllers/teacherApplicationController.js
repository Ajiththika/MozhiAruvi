import * as teacherApplicationService from '../services/teacherApplicationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── User-Facing ───────────────────────────────────────────────────────────────

export const applyForTeacher = asyncHandler(async (req, res) => {
    const application = await teacherApplicationService.applyForTeacher(req.user.sub, req.body);
    res.status(201).json({
        message: 'Teacher application submitted successfully.',
        application,
    });
});

export const getMyApplication = asyncHandler(async (req, res) => {
    const application = await teacherApplicationService.getMyApplication(req.user.sub);
    res.json({ application });
});

export const updateMyApplication = asyncHandler(async (req, res) => {
    const application = await teacherApplicationService.updateMyApplication(req.user.sub, req.body);
    res.json({
        message: 'Teacher application updated successfully.',
        application,
    });
});

// ── Admin-Facing ──────────────────────────────────────────────────────────────

export const getTeacherApplications = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 6 } = req.query;
    const result = await teacherApplicationService.getAllApplications(status, parseInt(page), parseInt(limit));
    res.json(result);
});

export const approveTeacherApplication = asyncHandler(async (req, res) => {
    const application = await teacherApplicationService.approveApplication(req.params.id, req.user.sub);
    res.json({
        message: 'Teacher application approved. User has been promoted to teacher.',
        application,
    });
});

export const rejectTeacherApplication = asyncHandler(async (req, res) => {
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
});

export const requestRevisionTeacherApplication = asyncHandler(async (req, res) => {
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
});
