import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useTtlCodes() {
  return useQuery({
    queryKey: ["ttlCodes"],
    queryFn: api.getTtlCodes,
    staleTime: 60 * 60 * 1000,   // 1 hour — TTL codes rarely change
  });
}
