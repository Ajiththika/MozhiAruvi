import express from 'express';
import * as organizationController from '../controllers/organizationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-organization', authenticate, organizationController.getOrganizationDetails);
router.post('/invite', authenticate, organizationController.inviteMember);
router.post('/join', authenticate, organizationController.joinOrganization);

export default router;
