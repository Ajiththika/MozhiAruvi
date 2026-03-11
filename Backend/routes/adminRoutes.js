import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as teacherApplicationController from '../controllers/teacherApplicationController.js';
import * as eventController from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Retrieve all users (admins can view)
router.get('/users', authenticate, requireRole('admin'), adminController.getUsers);

// Retrieve all tutors (admins can view)
router.get('/tutors', authenticate, requireRole('admin'), adminController.getTutors);

// Admin functions
router.patch('/users/:id/deactivate', authenticate, requireRole('admin'), adminController.deactivateUser);
router.patch('/users/:id/activate', authenticate, requireRole('admin'), adminController.activateUser);

// Admin functions
router.patch('/users/:id/tutor-status', authenticate, requireRole('admin'), adminController.changeTutorStatus);

// ── Teacher Application Management ──────────────────────────────────────────
router.get('/teacher-applications', authenticate, requireRole('admin'), teacherApplicationController.getTeacherApplications);
router.patch('/teacher-applications/:id/approve', authenticate, requireRole('admin'), teacherApplicationController.approveTeacherApplication);
router.patch('/teacher-applications/:id/reject', authenticate, requireRole('admin'), teacherApplicationController.rejectTeacherApplication);
router.patch('/teacher-applications/:id/request-revision', authenticate, requireRole('admin'), teacherApplicationController.requestRevisionTeacherApplication);

// ── Event Join Request Management ────────────────────────────────────────────
// GET  /api/admin/events/join-requests?eventId=&status=
router.get('/events/join-requests', authenticate, requireRole('admin'), eventController.listJoinRequests);
// PATCH /api/admin/events/join-requests/:id/approve
router.patch('/events/join-requests/:id/approve', authenticate, requireRole('admin'), eventController.approveJoinRequest);
// PATCH /api/admin/events/join-requests/:id/reject
router.patch('/events/join-requests/:id/reject', authenticate, requireRole('admin'), eventController.rejectJoinRequest);

export default router;
