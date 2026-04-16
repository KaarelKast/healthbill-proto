# Phase 2: Implement

1. Explore relevant parts of the codebase first — read existing components, hooks, and types that will be reused or extended.
2. Implement the feature following the conventions in `CLAUDE.md`:
   - TEDI design system (`@tehik-ee/tedi-react`) for all UI components
   - Custom hooks in `src/hooks/` wrapping TanStack Query calls to the mock API client
   - Domain types from `src/types/index.ts`
   - Mock API mutations via `src/api/client.ts` with optimistic cache updates
3. Use `TodoWrite` to add sub-tasks for each concrete implementation step, and mark them complete as you go.

**Do not mark this phase complete until all code is written and sub-tasks are checked off. Then move immediately to Phase 3 — do not stop here.**
