import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicBlogs } from "@/services/blogService";

export function useBlogs(initialPage = 1, limit = 6, status?: "published" | "draft") {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["blogs", page, limit, status],
    queryFn: () => getPublicBlogs(page, limit),
    staleTime: 5 * 60 * 1000,
  });

  return { 
    blogs: data?.blogs || [], 
    totalPages: data?.totalPages || 1, 
    page, 
    loading: isLoading, 
    error: error?.message || null, 
    setPage, 
    refetch 
  };
}
