import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as teacherApplicationController from '../controllers/teacherApplicationController.js';
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

export default router;
