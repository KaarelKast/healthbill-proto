# FE-04: React Query Hooks — Haiguslood & Stats

## Goal
Implement TanStack Query hooks for haiguslood and dashboard stats.

## Files to create
- `apps/frontend/src/hooks/useHaiguslood.ts`
- `apps/frontend/src/hooks/useStats.ts`

---

## useHaiguslood.ts

```typescript
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
```

---

## useStats.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 60_000,   // auto-refresh every minute
  });
}
```

---

## Notes
- `useHaiguslood` passes `params` as part of the query key so different filter combinations are cached separately
- `useProcessSaatekiri` invalidates both haiguslood and stats because processing changes case state
- Stats refresh every 60s automatically (nurse dashboard should stay up to date)

---

## Done when
- Hooks compile without TypeScript errors
- `useHaiguslood({ hasUnprocessed: true })` and `useHaiguslood({ status: 'OPEN' })` use different cache entries
