import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import { authenticate, authenticateOptional } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

// Zod schemas
const createBlogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional().or(z.literal('')),
    category: z.string().optional().or(z.literal('')),
    featuredImage: z.string().optional().or(z.literal('')),
    status: z.enum(['draft', 'published', 'pending', 'rejected']).optional()
});

const updateBlogSchema = createBlogSchema.partial();

const updateStatusSchema = z.object({
    status: z.enum(['draft', 'pending', 'published', 'rejected'])
});

// ── Public Routes ────────────────────────────────────────────────────────────
router.get('/', blogController.getPublicBlogs);
router.get('/public/:id', authenticateOptional, blogController.getSinglePublicBlog);

// ── Authenticated User Routes ────────────────────────────────────────────────
router.get('/my-blogs', authenticate, blogController.getMyBlogs);
router.get('/saved', authenticate, blogController.getMySavedBlogs);
router.post('/', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), validate(createBlogSchema), blogController.createBlog);
router.post('/:id/save', authenticate, blogController.toggleSaveBlog);
router.put('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), validate(updateBlogSchema), blogController.updateMyBlog);
router.delete('/:id', authenticate, authorizeRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), blogController.deleteMyBlog);

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, authorizeRoles(ROLES.ADMIN), blogController.getAllBlogs);
router.patch('/:id/status', authenticate, authorizeRoles(ROLES.ADMIN), validate(updateStatusSchema), blogController.updateBlogStatus);
router.delete('/admin/:id', authenticate, authorizeRoles(ROLES.ADMIN), blogController.adminDeleteBlog);

export default router;
