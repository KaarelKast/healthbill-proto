import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

// List all haiguslood (with optional filters)
export function useHaiguslood(params?: { status?: string; hasUnprocessed?: boolean }) {
  return useQuery({
    queryKey: ["haiguslood", params],
    queryFn: () => api.getHaiguslood(params),
  });
}

// Single haiguslugu detail
export function useHaiguslugu(id: string) {
  return useQuery({
    queryKey: ["haiguslugu", id],
    queryFn: () => api.getHaiguslugu(id),
    enabled: !!id,
  });
}

// Process a saatekiri (triggers HBAI + creates invoice)
export function useProcessSaatekiri() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saatekirjaId: string) => api.processSaatekiri(saatekirjaId),
    onSuccess: () => {
      // Invalidate haiguslood list and stats (case status may have changed)
      qc.invalidateQueries({ queryKey: ["haiguslood"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// Create a new demo haiguslugu
export function useCreateDemoHaiguslugu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDemoHaiguslugu,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["haiguslood"] });
    },
  });
}
