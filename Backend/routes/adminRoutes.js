import { Router } from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// GET /api/admin/users — admin or superadmin only
router.get('/users', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpiry');
    res.json({ users });
});

export default router;
