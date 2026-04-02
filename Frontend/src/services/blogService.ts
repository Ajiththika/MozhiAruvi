import { api } from "@/lib/api";
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
  savedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  status?: 'draft' | 'published' | 'pending';
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {
}

export interface PaginatedBlogs {
  blogs: Blog[];
  totalBlogs: number;
  totalPages: number;
  currentPage: number;
}

export async function getPublicBlogs(page = 1, limit = 6): Promise<PaginatedBlogs> {
  const res = await api.get<PaginatedBlogs>(`/blogs?page=${page}&limit=${limit}`);
  return res.data;
}

export async function getPublicBlogByIdOrSlug(id: string): Promise<Blog> {
  const res = await api.get<{ blog: Blog }>(`/blogs/public/${id}`);
  return res.data.blog;
}

// Authenticated fetch — works for author's own blogs (any status) and admins
export async function getBlogForEdit(id: string): Promise<Blog> {
  const res = await api.get<{ blog: Blog }>(`/blogs/${id}/edit-data`);
  return res.data.blog;
}

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

export async function getSavedBlogs(): Promise<Blog[]> {
  const res = await api.get<{ blogs: Blog[] }>("/blogs/saved");
  return res.data.blogs;
}

export async function toggleSaveBlog(id: string): Promise<{ isSaved: boolean }> {
  const res = await api.post<{ isSaved: boolean }>(`/blogs/${id}/save`);
  return res.data;
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
export async function getAllBlogsForAdmin(page = 1, limit = 6): Promise<PaginatedBlogs> {
  const res = await api.get<PaginatedBlogs>(`/blogs/admin/all?page=${page}&limit=${limit}`);
  return res.data;
}

export async function updateBlogStatusAdmin(id: string, status: string): Promise<Blog> {
  const res = await api.patch<{ blog: Blog }>(`/blogs/${id}/status`, { status });
  return res.data.blog;
}

export async function adminDeleteBlog(id: string): Promise<void> {
  await api.delete(`/blogs/admin/${id}`);
}

