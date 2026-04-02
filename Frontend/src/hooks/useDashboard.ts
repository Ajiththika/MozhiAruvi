import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/authService";

export function useDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 2 * 60 * 1000,
  });

  return { 
    stats: data || null, 
    loading: isLoading, 
    error: error?.message || null, 
    refetch 
  };
}

