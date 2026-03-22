import api from "@/lib/api";
import { UserProfile } from "./userService";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  author: UserProfile;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  status?: 'draft' | 'pending';
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {
  status?: 'draft' | 'pending';
}

export async function getPublicBlogs(): Promise<Blog[]> {
  const res = await api.get<{ blogs: Blog[] }>("/blogs");
  return res.data.blogs;
}

export async function getPublicBlogByIdOrSlug(id: string): Promise<Blog> {
  const res = await api.get<{ blog: Blog }>(`/blogs/public/${id}`);
  return res.data.blog;
}

// Fetch a single owned blog by ID (for edit page, avoids loading all blogs)
export async function getMyBlogById(id: string): Promise<Blog> {
  const blogs = await getMyBlogs();
  const found = blogs.find((b) => b._id === id);
  if (!found) throw new Error("Blog not found or unauthorized");
  return found;
}

export async function getMyBlogs(): Promise<Blog[]> {
  const res = await api.get<{ blogs: Blog[] }>("/blogs/my-blogs");
  return res.data.blogs;
}

export async function createBlog(data: CreateBlogDto): Promise<Blog> {
  const res = await api.post<{ blog: Blog }>("/blogs", data);
  return res.data.blog;
}

export async function updateMyBlog(id: string, data: UpdateBlogDto): Promise<Blog> {
  const res = await api.put<{ blog: Blog }>(`/blogs/${id}`, data);
  return res.data.blog;
}

export async function deleteMyBlog(id: string): Promise<void> {
  await api.delete(`/blogs/${id}`);
}

// Admin
export async function getAllBlogsForAdmin(): Promise<Blog[]> {
  const res = await api.get<{ blogs: Blog[] }>("/blogs/admin/all");
  return res.data.blogs;
}

export async function updateBlogStatusAdmin(id: string, status: 'draft' | 'pending' | 'published' | 'rejected'): Promise<Blog> {
  const res = await api.patch<{ blog: Blog }>(`/blogs/${id}/status`, { status });
  return res.data.blog;
}

export async function adminDeleteBlog(id: string): Promise<void> {
  await api.delete(`/blogs/admin/${id}`);
}
