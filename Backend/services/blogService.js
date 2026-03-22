import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

export async function createBlog(authorId, data) {
    const blog = new Blog({ ...data, author: authorId });
    if (!blog.slug) {
        blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    return await blog.save();
}

export async function getPublicBlogs(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    const query = { status: 'published' };
    
    const [blogs, totalBlogs] = await Promise.all([
        Blog.find(query)
            .populate('author', 'name email profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Blog.countDocuments(query)
    ]);

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
    return await Blog.find({ author: authorId }).populate('author', 'name email').sort({ createdAt: -1 });
}

export async function getSavedBlogs(userId) {
    return await Blog.find({ savedBy: userId }).populate('author', 'name email').sort({ createdAt: -1 });
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

export async function updateBlog(blogId, authorId, data) {
    const blog = await Blog.findOne({ _id: blogId, author: authorId });
    if (!blog) throw new Error('Blog not found or unauthorized');
    
    ['title', 'content', 'excerpt', 'category', 'featuredImage', 'status'].forEach(field => {
        if (data[field] !== undefined) blog[field] = data[field];
    });
    
    if (data.title && !data.slug) {
         blog.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    
    return await blog.save();
}

export async function deleteBlog(blogId, authorId) {
    const blog = await Blog.findOneAndDelete({ _id: blogId, author: authorId });
    if (!blog) throw new Error('Blog not found or unauthorized');
    return blog;
}

// Admin Operations
export async function getAllBlogsForAdmin(page = 1, limit = 6) {
    const skip = (page - 1) * limit;
    
    const [blogs, totalBlogs] = await Promise.all([
        Blog.find()
            .populate('author', 'name email profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Blog.countDocuments()
    ]);

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
