"use client";

import React, { useEffect, useState } from "react";
import { updateMyBlog, getMyBlogs, Blog } from "@/services/blogService";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    featuredImage: "",
    status: "draft" as "draft" | "pending" | "published" | "rejected"
  });

  useEffect(() => {
    if (params.id) {
       getMyBlogs().then(blogs => {
           const blog = blogs.find(b => b._id === params.id);
           if (blog) {
               setFormData({
                   title: blog.title || "",
                   content: blog.content || "",
                   excerpt: blog.excerpt || "",
                   category: blog.category || "",
                   featuredImage: blog.featuredImage || "",
                   status: blog.status,
               });
           } else {
               alert("Blog not found or unauthorized");
               router.push('/student/blogs');
           }
       }).catch(console.error).finally(() => setInitialLoading(false));
    }
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (params.id) {
        await updateMyBlog(params.id as string, {
          ...formData,
          status: isDraft ? "draft" : "pending"
        });
        alert(isDraft ? "Draft updated!" : "Blog submitted for review!");
        router.push("/student/blogs");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (initialLoading) return <div className="py-12 text-center text-slate-500">Loading editor...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <button onClick={() => router.push('/student/blogs')} className="mb-6 text-slate-500 hover:text-mozhi-primary flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Blogs
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">Edit post</h1>
            <span className="uppercase text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{formData.status}</span>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
            <input 
              type="text" name="title" required value={formData.title} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary outline-none transition transition-shadow bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary outline-none transition bg-slate-50">
                <option value="">Select Category...</option>
                <option value="Grammar">Grammar</option>
                <option value="Culture">Culture</option>
                <option value="Pronunciation">Pronunciation</option>
                <option value="Tutor Tips">Tutor Tips</option>
                <option value="Updates">Updates</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Featured Image URL</label>
              <input 
                type="url" name="featuredImage" value={formData.featuredImage} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary outline-none transition bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Excerpt</label>
            <textarea 
              name="excerpt" rows={2} value={formData.excerpt} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary outline-none transition bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content *</label>
            <textarea 
              name="content" required rows={12} value={formData.content} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary outline-none transition bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <button 
              type="button" disabled={loading} onClick={(e) => handleSubmit(e, true)}
              className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button 
              type="button" disabled={loading} onClick={(e) => handleSubmit(e, false)}
              className="px-6 py-3 rounded-xl bg-mozhi-primary text-white font-bold text-sm shadow-sm hover:bg-mozhi-primary/90 transition-colors disabled:opacity-50"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
