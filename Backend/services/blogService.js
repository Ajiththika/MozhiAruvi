import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

export async function createBlog(authorId, role, data) {
    const blog = new Blog({ ...data, author: authorId });
    
    // Set status based on role — admins can publish directly, teachers always go to review
    if (role === 'admin') {
        blog.status = data.status || 'published';
    } else if (role === 'teacher' || role === 'tutor') {
        blog.status = 'pending'; // always goes to review on creation
    } else {
        throw new Error('Only admins and teachers can write blogs.');
    }

    if (!blog.slug) {
        blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    return await blog.save();
}

export async function getPublicBlogs(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const query = { status: 'published' };
    
    let blogs = [];
    let totalBlogs = 0;

    try {
        const results = await Promise.all([
            Blog.find(query)
                .populate('author', 'name email profilePhoto')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);
        blogs = results[0];
        totalBlogs = results[1];
    } catch (e) {
        if (e.name === 'MongooseError' || e.message?.includes('timeout') || e.message?.includes('buffering')) {
            console.warn('[blogService] DB offline, returning empty public blogs');
        } else {
            throw e;
        }
    }

    return {
        blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: parseInt(page)
    };
}

export async function getBlogByIdOrSlug(identifier, viewer = null) {
    const filter = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { slug: identifier };
    const blog = await Blog.findOne(filter).populate('author', 'name email');
    if (!blog) throw new Error('Blog not found');
    
    // If not published, only owner or admin can see it
    if (blog.status !== 'published') {
        const isOwner = viewer && viewer.sub === blog.author._id.toString();
        const isAdmin = viewer && viewer.role === 'admin';
        if (!isOwner && !isAdmin) throw new Error('Blog not found');
    }
    
    return blog;
}

export async function getUserBlogs(authorId) {
    try {
        return await Blog.find({ author: authorId }).populate('author', 'name email').sort({ createdAt: -1 });
    } catch (e) {
        if (e.name === 'MongooseError' || e.message?.includes('timeout') || e.message?.includes('buffering')) return [];
        throw e;
    }
}

// Fetch a single blog for editing — accessible by the author (any status) or admin
export async function getBlogForEdit(blogId, userId, role) {
    const blog = await Blog.findById(blogId).populate('author', 'name email role profilePhoto');
    if (!blog) throw new Error('Blog not found');
    const isOwner = blog.author._id.toString() === userId.toString();
    const isAdmin = role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Not authorized to edit this blog');
    return blog;
}

export async function getSavedBlogs(userId) {
    try {
        return await Blog.find({ savedBy: userId }).populate('author', 'name email').sort({ createdAt: -1 });
    } catch (e) {
        if (e.name === 'MongooseError' || e.message?.includes('timeout') || e.message?.includes('buffering')) return [];
        throw e;
    }
}

export async function toggleSaveBlog(userId, blogId) {
    const blog = await Blog.findById(blogId);
    if (!blog) throw new Error('Blog not found');
    
    const isSaved = blog.savedBy.includes(userId);
    if (isSaved) {
        blog.savedBy = blog.savedBy.filter(id => id.toString() !== userId.toString());
    } else {
        blog.savedBy.push(userId);
    }
    await blog.save();
    return { isSaved: !isSaved };
}

export async function updateBlog(blogId, authorId, data, role = 'user') {
    const filter = role === 'admin' ? { _id: blogId } : { _id: blogId, author: authorId };
    const blog = await Blog.findOne(filter);
    if (!blog) throw new Error('Blog not found or unauthorized');
    
    ['title', 'content', 'excerpt', 'category', 'featuredImage', 'status'].forEach(field => {
        if (data[field] !== undefined) blog[field] = data[field];
    });
    
    if (data.title && !data.slug) {
         blog.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    
    return await blog.save();
}

export async function deleteBlog(blogId, authorId, role = 'user') {
    const filter = role === 'admin' ? { _id: blogId } : { _id: blogId, author: authorId };
    const blog = await Blog.findOneAndDelete(filter);
    if (!blog) throw new Error('Blog not found or unauthorized');
    return blog;
}

// Admin Operations
export async function getAllBlogsForAdmin(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    
    let blogs = [];
    let totalBlogs = 0;

    try {
        const results = await Promise.all([
            Blog.find()
                .populate('author', 'name email profilePhoto')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments()
        ]);
        blogs = results[0];
        totalBlogs = results[1];
    } catch (e) {
        if (e.name === 'MongooseError' || e.message?.includes('timeout') || e.message?.includes('buffering')) {
            console.warn('[blogService] DB offline, returning empty admin blogs');
        } else {
            throw e;
        }
    }

    return {
        blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: parseInt(page)
    };
}

export async function adminUpdateStatus(blogId, status) {
    const blog = await Blog.findByIdAndUpdate(blogId, { status }, { new: true });
    if (!blog) throw new Error('Blog not found');
    return blog;
}

export async function adminDeleteBlog(blogId) {
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) throw new Error('Blog not found');
    return blog;
}
