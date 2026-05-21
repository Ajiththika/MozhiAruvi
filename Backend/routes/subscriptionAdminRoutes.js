import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';
import * as subscriptionAdminController from '../controllers/subscriptionAdminController.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

// Stats overview
router.get('/stats', subscriptionAdminController.getSubscriptionStats);

// List all subscriptions (with pagination, filter, search)
router.get('/', subscriptionAdminController.getAllSubscriptions);

// Override a user's subscription plan
router.patch('/:userId', subscriptionAdminController.overrideSubscription);

export default router;
