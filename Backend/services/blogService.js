import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

export async function createBlog(authorId, data) {
    const blog = new Blog({ ...data, author: authorId });
    if (!blog.slug) {
        blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    return await blog.save();
}

export async function getPublicBlogs() {
    return await Blog.find({ status: 'published' }).populate('author', 'name email').sort({ createdAt: -1 });
}

export async function getPublicBlogByIdOrSlug(identifier) {
    const filter = mongoose.Types.ObjectId.isValid(identifier) 
        ? { _id: identifier, status: 'published' }
        : { slug: identifier, status: 'published' };
    const blog = await Blog.findOne(filter).populate('author', 'name email');
    if (!blog) throw new Error('Blog not found');
    return blog;
}

export async function getUserBlogs(authorId) {
    return await Blog.find({ author: authorId }).sort({ createdAt: -1 });
}

export async function updateBlog(blogId, authorId, data) {
    const blog = await Blog.findOne({ _id: blogId, author: authorId });
    if (!blog) throw new Error('Blog not found or unauthorized');
    
    ['title', 'content', 'excerpt', 'category', 'featuredImage'].forEach(field => {
        if (data[field] !== undefined) blog[field] = data[field];
    });
    
    if (data.title && !data.slug) {
         blog.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    
    if (data.status && ['draft', 'pending'].includes(data.status)) {
        blog.status = data.status;
    }
    
    return await blog.save();
}

export async function deleteBlog(blogId, authorId) {
    const blog = await Blog.findOneAndDelete({ _id: blogId, author: authorId });
    if (!blog) throw new Error('Blog not found or unauthorized');
    return blog;
}

// Admin Operations
export async function getAllBlogsForAdmin() {
    return await Blog.find().populate('author', 'name email').sort({ createdAt: -1 });
}

export async function adminUpdateStatus(blogId, status) {
    if (!['draft', 'pending', 'published', 'rejected'].includes(status)) {
         throw new Error('Invalid status');
    }
    const blog = await Blog.findByIdAndUpdate(blogId, { status }, { new: true });
    if (!blog) throw new Error('Blog not found');
    return blog;
}

export async function adminDeleteBlog(blogId) {
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) throw new Error('Blog not found');
    return blog;
}
