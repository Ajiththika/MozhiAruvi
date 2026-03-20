"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, useRouter } from "next/navigation";
import { getPublicBlogByIdOrSlug, Blog } from "@/services/blogService";
import { ArrowLeft, Calendar, UserCircle } from "lucide-react";

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getPublicBlogByIdOrSlug(params.id as string)
        .then(setBlog)
        .catch(() => {
          // Keep blog as null to show non-found state
        })
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse">Loading...</div></div>;
  }

  if (!blog) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
         <h1 className="text-3xl font-bold mb-4">Blog Not Found</h1>
         <button onClick={() => router.push('/blogs')} className="text-mozhi-primary font-semibold hover:underline flex items-center gap-2">
           <ArrowLeft className="w-4 h-4" /> Back to Blogs
         </button>
       </div>
     );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
        <button onClick={() => router.push('/blogs')} className="mb-8 text-slate-500 hover:text-mozhi-primary flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </button>

        <article className="bg-white rounded-2xl p-6 md:p-12 border border-slate-200 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {blog.category || "General"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-600 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-slate-400" />
                <span className="font-semibold">{blog.author?.name || 'Unknown User'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {blog.featuredImage && (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 bg-slate-100">
               <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-slate lg:prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
