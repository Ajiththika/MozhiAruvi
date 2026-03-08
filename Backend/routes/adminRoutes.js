import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Retrieve all users (admins and superadmins can view)
router.get('/users', authenticate, requireRole('admin', 'superadmin'), adminController.getUsers);

// Retrieve all tutors (admins and superadmins can view)
router.get('/tutors', authenticate, requireRole('admin', 'superadmin'), adminController.getTutors);

// Superadmin functions
router.patch('/users/:id/deactivate', authenticate, requireRole('superadmin'), adminController.deactivateUser);
router.patch('/users/:id/activate', authenticate, requireRole('superadmin'), adminController.activateUser);
router.patch('/users/:id/verify-admin', authenticate, requireRole('superadmin'), adminController.verifyAdmin);

// Admin / Superadmin functions
router.patch('/users/:id/tutor-status', authenticate, requireRole('admin', 'superadmin'), adminController.changeTutorStatus);

export default router;
