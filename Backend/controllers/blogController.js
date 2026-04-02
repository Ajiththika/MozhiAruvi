 import * as blogService from '../services/blogService.js';

// ── Public ───────────────────────────────────────────────────────────────────
export async function getPublicBlogs(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const result = await blogService.getPublicBlogs(parseInt(page), parseInt(limit));
        res.json(result);
    } catch (e) { next(e); }
}

export async function getSinglePublicBlog(req, res, next) {
    try {
        const blog = await blogService.getBlogByIdOrSlug(req.params.id, req.user);
        res.json({ blog });
    } catch (e) { next(e); }
}

// ── Authenticated User ────────────────────────────────────────────────────────
export async function createBlog(req, res, next) {
    try {
        const blog = await blogService.createBlog(req.user.sub, req.user.role, req.body);
        res.status(201).json({ blog });
    } catch (e) { next(e); }
}

export async function getMyBlogs(req, res, next) {
    try {
        const blogs = await blogService.getUserBlogs(req.user.sub);
        res.json({ blogs });
    } catch (e) { next(e); }
}

// Used by the edit page — returns a blog if the user is its author or an admin
export async function getBlogForEdit(req, res, next) {
    try {
        const blog = await blogService.getBlogForEdit(req.params.id, req.user.sub, req.user.role);
        res.json({ blog });
    } catch (e) { next(e); }
}

export async function updateMyBlog(req, res, next) {
    try {
        const blog = await blogService.updateBlog(req.params.id, req.user.sub, req.body, req.user.role);
        res.json({ blog });
    } catch (e) { next(e); }
}

export async function deleteMyBlog(req, res, next) {
    try {
        await blogService.deleteBlog(req.params.id, req.user.sub, req.user.role);
        res.json({ message: 'Blog deleted successfully.' });
    } catch (e) { next(e); }
}

// Saved / Bookmarks
export async function getMySavedBlogs(req, res, next) {
    try {
        const blogs = await blogService.getSavedBlogs(req.user.sub);
        res.json({ blogs });
    } catch (e) { next(e); }
}

export async function toggleSaveBlog(req, res, next) {
    try {
        const result = await blogService.toggleSaveBlog(req.user.sub, req.params.id);
        res.json(result);
    } catch (e) { next(e); }
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function getAllBlogs(req, res, next) {
    try {
        const { page = 1, limit = 6 } = req.query;
        const result = await blogService.getAllBlogsForAdmin(parseInt(page), parseInt(limit));
        res.json(result);
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
