import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 60_000,   // auto-refresh every minute
  });
}
