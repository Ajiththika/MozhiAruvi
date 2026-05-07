import express from 'express';
import * as sectionController from '../controllers/resourceSectionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.get('/', sectionController.getSections);
router.post('/', authenticate, authorizeRoles('admin'), sectionController.createSection);
router.patch('/:id', authenticate, authorizeRoles('admin'), sectionController.updateSection);
router.delete('/:id', authenticate, authorizeRoles('admin'), sectionController.deleteSection);

export default router;
