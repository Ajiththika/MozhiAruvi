import * as blogService from '../services/blogService.js';

// ── Public ───────────────────────────────────────────────────────────────────
export async function getPublicBlogs(req, res, next) {
    try {
        const blogs = await blogService.getPublicBlogs();
        res.json({ blogs });
    } catch (e) { next(e); }
}

export async function getSinglePublicBlog(req, res, next) {
    try {
        const blog = await blogService.getPublicBlogByIdOrSlug(req.params.id);
        res.json({ blog });
    } catch (e) { next(e); }
}

// ── Authenticated User ────────────────────────────────────────────────────────
export async function createBlog(req, res, next) {
    try {
        const blog = await blogService.createBlog(req.user.sub, req.body);
        res.status(201).json({ blog });
    } catch (e) { next(e); }
}

export async function getMyBlogs(req, res, next) {
    try {
        const blogs = await blogService.getUserBlogs(req.user.sub);
        res.json({ blogs });
    } catch (e) { next(e); }
}

export async function updateMyBlog(req, res, next) {
    try {
        const blog = await blogService.updateBlog(req.params.id, req.user.sub, req.body);
        res.json({ blog });
    } catch (e) { next(e); }
}

export async function deleteMyBlog(req, res, next) {
    try {
        await blogService.deleteBlog(req.params.id, req.user.sub);
        res.json({ message: 'Blog deleted successfully.' });
    } catch (e) { next(e); }
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function getAllBlogs(req, res, next) {
    try {
        const blogs = await blogService.getAllBlogsForAdmin();
        res.json({ blogs });
    } catch (e) { next(e); }
}

export async function updateBlogStatus(req, res, next) {
    try {
        const blog = await blogService.adminUpdateStatus(req.params.id, req.body.status);
        res.json({ blog });
    } catch (e) { next(e); }
}

export async function adminDeleteBlog(req, res, next) {
    try {
        await blogService.adminDeleteBlog(req.params.id);
        res.json({ message: 'Blog deleted successfully by admin.' });
    } catch (e) { next(e); }
}
