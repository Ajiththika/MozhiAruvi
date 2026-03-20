"use client";

import React, { useState } from "react";
import { createBlog } from "@/services/blogService";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    featuredImage: "",
    status: "draft" as "draft" | "pending"
  });

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlog({
        ...formData,
        status: isDraft ? "draft" : "pending"
      });
      alert(isDraft ? "Draft saved!" : "Blog submitted for review!");
      router.push("/student/blogs");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <button onClick={() => router.push('/student/blogs')} className="mb-6 text-slate-500 hover:text-mozhi-primary flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Blogs
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Write a new post</h1>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
            <input 
              type="text" name="title" required value={formData.title} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary outline-none transition transition-shadow bg-slate-50 relative z-10"
              placeholder="E.g., My experience learning Tamil"
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
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Excerpt (Short Summary)</label>
            <textarea 
              name="excerpt" rows={2} value={formData.excerpt} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary outline-none transition bg-slate-50"
              placeholder="A brief summary of your post..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content *</label>
            <textarea 
              name="content" required rows={12} value={formData.content} onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-mozhi-primary focus:ring-1 focus:ring-mozhi-primary outline-none transition bg-slate-50"
              placeholder="Write your article content here..."
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
