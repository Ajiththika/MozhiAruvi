import * as blogService from '../services/blogService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ── Public ───────────────────────────────────────────────────────────────────
export const getPublicBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    const result = await blogService.getPublicBlogs(parseInt(page), parseInt(limit));
    res.json(result);
});

export const getSinglePublicBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.getBlogByIdOrSlug(req.params.id, req.user);
    res.json({ blog });
});

// ── Authenticated User ────────────────────────────────────────────────────────
export const createBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.createBlog(req.user.sub, req.body);
    res.status(201).json({ blog });
});

export const getMyBlogs = asyncHandler(async (req, res) => {
    const blogs = await blogService.getUserBlogs(req.user.sub);
    res.json({ blogs });
});

export const updateMyBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.updateBlog(req.params.id, req.user.sub, req.body);
    res.json({ blog });
});

export const deleteMyBlog = asyncHandler(async (req, res) => {
    await blogService.deleteBlog(req.params.id, req.user.sub);
    res.json({ message: 'Blog deleted successfully.' });
});

// Saved / Bookmarks
export const getMySavedBlogs = asyncHandler(async (req, res) => {
    const blogs = await blogService.getSavedBlogs(req.user.sub);
    res.json({ blogs });
});

export const toggleSaveBlog = asyncHandler(async (req, res) => {
    const result = await blogService.toggleSaveBlog(req.user.sub, req.params.id);
    res.json(result);
});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6 } = req.query;
    const result = await blogService.getAllBlogsForAdmin(parseInt(page), parseInt(limit));
    res.json(result);
});

export const updateBlogStatus = asyncHandler(async (req, res) => {
    const blog = await blogService.adminUpdateStatus(req.params.id, req.body.status);
    res.json({ blog });
});

export const adminDeleteBlog = asyncHandler(async (req, res) => {
    await blogService.adminDeleteBlog(req.params.id);
    res.json({ message: 'Blog deleted successfully by admin.' });
});
