import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', resourceController.getResources);
router.post('/', authenticate, authorizeRoles('admin'), resourceController.createResource);
router.patch('/:id', authenticate, authorizeRoles('admin'), resourceController.updateResource);
router.delete('/:id', authenticate, authorizeRoles('admin'), resourceController.deleteResource);

export default router;
