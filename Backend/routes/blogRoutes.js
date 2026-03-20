import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// Zod schemas
const createBlogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    category: z.string().optional(),
    featuredImage: z.string().url('Invalid URL').optional().or(z.literal('')),
    status: z.enum(['draft', 'pending']).optional()
});

const updateBlogSchema = createBlogSchema.partial();

const updateStatusSchema = z.object({
    status: z.enum(['draft', 'pending', 'published', 'rejected'])
});

// ── Public Routes ────────────────────────────────────────────────────────────
router.get('/', blogController.getPublicBlogs);
router.get('/public/:id', blogController.getSinglePublicBlog);

// ── Authenticated User Routes ────────────────────────────────────────────────
router.get('/my-blogs', authenticate, blogController.getMyBlogs);
router.post('/', authenticate, validate(createBlogSchema), blogController.createBlog);
router.put('/:id', authenticate, validate(updateBlogSchema), blogController.updateMyBlog);
router.delete('/:id', authenticate, blogController.deleteMyBlog);

// ── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, requireRole('admin'), blogController.getAllBlogs);
router.patch('/:id/status', authenticate, requireRole('admin'), validate(updateStatusSchema), blogController.updateBlogStatus);
router.delete('/admin/:id', authenticate, requireRole('admin'), blogController.adminDeleteBlog);

export default router;
