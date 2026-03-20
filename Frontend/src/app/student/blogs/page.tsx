"use client";

import React, { useEffect, useState } from "react";
import { getMyBlogs, deleteMyBlog, Blog } from "@/services/blogService";
import PrimaryButton from "@/components/PrimaryButton";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    setLoading(true);
    getMyBlogs()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteMyBlog(id);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Blogs</h1>
          <p className="text-slate-600">Manage your published and draft blog posts.</p>
        </div>
        <PrimaryButton href="/student/blogs/create" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Post
        </PrimaryButton>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No blogs found</h3>
          <p className="text-slate-500 mb-6">You haven't written any blogs yet. Start writing!</p>
          <PrimaryButton href="/student/blogs/create">Write your first blog</PrimaryButton>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{blog.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800' :
                      blog.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                      blog.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800' // pending
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link href={`/student/blogs/${blog._id}/edit`} className="text-mozhi-primary hover:text-mozhi-secondary inline-flex items-center gap-1">
                      <Edit2 className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => handleDelete(blog._id)} className="text-red-500 hover:text-red-700 inline-flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Delete
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
