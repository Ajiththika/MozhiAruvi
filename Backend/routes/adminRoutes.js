import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as teacherApplicationController from '../controllers/teacherApplicationController.js';
import * as tutorApplicationController from '../controllers/tutorApplicationController.js';
import * as eventController from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

// Retrieve all users (admins can view)
router.get('/stats', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getStats);
router.get('/users', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getUsers);
router.get('/premium-users', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getPremiumUsers);
router.get('/plan-settings', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getPlanSettings);
router.post('/plan-settings', authenticate, authorizeRoles(ROLES.ADMIN), adminController.createPlanSettings);
router.patch('/plan-settings/:planId', authenticate, authorizeRoles(ROLES.ADMIN), adminController.updatePlanSettings);
router.delete('/plan-settings/:planId', authenticate, authorizeRoles(ROLES.ADMIN), adminController.deletePlanSettings);

// ── Tutor Management ────────────────────────────────────────────────────────
router.get('/tutors', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getTutors);
router.get('/tutors/applications', authenticate, authorizeRoles(ROLES.ADMIN), tutorApplicationController.getTutorApplications);
router.patch('/tutors/:id/approve', authenticate, authorizeRoles(ROLES.ADMIN), tutorApplicationController.approveTutorApplication);
router.patch('/tutors/:id/reject', authenticate, authorizeRoles(ROLES.ADMIN), tutorApplicationController.rejectTutorApplication);
router.get('/mentor-applications', authenticate, authorizeRoles(ROLES.ADMIN), adminController.getMentorApplications);

// Admin functions
router.patch('/users/:id/deactivate', authenticate, authorizeRoles(ROLES.ADMIN), adminController.deactivateUser);
router.patch('/users/:id/activate', authenticate, authorizeRoles(ROLES.ADMIN), adminController.activateUser);
router.patch('/users/:id/edit', authenticate, authorizeRoles(ROLES.ADMIN), adminController.editUser);

// Admin functions
router.patch('/users/:id/tutor-status', authenticate, authorizeRoles(ROLES.ADMIN), adminController.changeTutorStatus);
router.patch('/users/:id/warn', authenticate, authorizeRoles(ROLES.ADMIN), adminController.warnUser);

// ── Teacher Application Management ──────────────────────────────────────────
router.get('/teacher-applications', authenticate, authorizeRoles(ROLES.ADMIN), teacherApplicationController.getTeacherApplications);
router.patch('/teacher-applications/:id/approve', authenticate, authorizeRoles(ROLES.ADMIN), teacherApplicationController.approveTeacherApplication);
router.patch('/teacher-applications/:id/reject', authenticate, authorizeRoles(ROLES.ADMIN), teacherApplicationController.rejectTeacherApplication);
router.patch('/teacher-applications/:id/request-revision', authenticate, authorizeRoles(ROLES.ADMIN), teacherApplicationController.requestRevisionTeacherApplication);

// ── Event Join Request Management ────────────────────────────────────────────
// GET  /api/admin/events/join-requests?eventId=&status=
router.get('/events/join-requests', authenticate, authorizeRoles(ROLES.ADMIN), eventController.listJoinRequests);
// PATCH /api/admin/events/join-requests/:id/approve
router.patch('/events/join-requests/:id/approve', authenticate, authorizeRoles(ROLES.ADMIN), eventController.approveJoinRequest);
// PATCH /api/admin/events/join-requests/:id/reject
router.patch('/events/join-requests/:id/reject', authenticate, authorizeRoles(ROLES.ADMIN), eventController.rejectJoinRequest);

export default router;
