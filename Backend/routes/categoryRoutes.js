import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.get('/', categoryController.listCategories);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN), categoryController.createCategory);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN), categoryController.deleteCategory);

export default router;
