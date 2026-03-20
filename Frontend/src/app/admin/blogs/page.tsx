"use client";

import React, { useEffect, useState } from "react";
import { getAllBlogsForAdmin, updateBlogStatusAdmin, adminDeleteBlog, Blog } from "@/services/blogService";
import { Trash2, CheckCircle, XCircle } from "lucide-react";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    setLoading(true);
    getAllBlogsForAdmin()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleStatusChange = async (id: string, newStatus: 'published' | 'rejected' | 'pending') => {
    try {
      if (!window.confirm(`Are you sure you want to mark this blog as ${newStatus}?`)) return;
      await updateBlogStatusAdmin(id, newStatus);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to permanently delete this blog?")) return;
      await adminDeleteBlog(id);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Manage Blogs</h1>
        <p className="text-slate-600">Approve, reject, or manage all user submitted blog posts.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <p className="text-slate-500">No blogs submitted yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate" title={blog.title}>{blog.title}</td>
                  <td className="px-6 py-4 text-slate-600">{blog.author?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800' :
                      blog.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                      blog.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                    {blog.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusChange(blog._id, 'published')} className="text-green-600 hover:text-green-800 inline-flex items-center gap-1" title="Approve">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleStatusChange(blog._id, 'rejected')} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1" title="Reject">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {(blog.status === 'published' || blog.status === 'rejected') && (
                       <button onClick={() => handleStatusChange(blog._id, 'pending')} className="text-amber-600 hover:text-amber-800 inline-flex items-center gap-1 text-xs">
                          Revert to Pending
                       </button>
                    )}
                    <button onClick={() => handleDelete(blog._id)} className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 ml-4" title="Delete Permanent">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
