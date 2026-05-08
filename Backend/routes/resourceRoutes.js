import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', resourceController.getResources);
router.post('/', authenticate, authorizeRoles('admin', 'teacher'), resourceController.createResource);
router.patch('/:id', authenticate, authorizeRoles('admin', 'teacher'), resourceController.updateResource);
router.delete('/:id', authenticate, authorizeRoles('admin', 'teacher'), resourceController.deleteResource);

export default router;
