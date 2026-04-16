# Phase 3: Code Review

Run `git diff HEAD` to see all changes made in this session.

Review every changed file systematically. For each file, check:

- **Correctness** — does the logic match the clarified requirements?
- **Type safety** — are all TypeScript types correct and non-`any`?
- **Consistency** — does the code follow existing patterns in the same file and adjacent files?
- **Edge cases** — are loading states, empty states, and error states handled?
- **Security** — no XSS, no unsafe DOM operations, no exposed secrets
- **Dead code** — no unused imports, variables, or parameters (TypeScript strict mode will catch most of these)

Output a numbered list of findings. If there are no issues, state that explicitly.

**Do not mark this phase complete until the findings list is written. Then move immediately to Phase 4.**
