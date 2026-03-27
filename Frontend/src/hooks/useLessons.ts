import { useQuery } from "@tanstack/react-query";
import { getLessons } from "@/services/lessonService";

export function useLessons() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lessons"],
    queryFn: getLessons,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return { 
    lessons: data?.lessons || [], 
    progress: data?.progress || [], 
    loading: isLoading, 
    error: error?.message || null, 
    refetch 
  };
}
