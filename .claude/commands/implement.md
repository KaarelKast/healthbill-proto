---
description: Implement a feature with clarifying questions, code review, and refinement
argument-hint: <feature description>
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, Agent, TodoWrite, AskUserQuestion]
---

# Implement Workflow

The user wants to implement: $ARGUMENTS

## Start here — before doing anything else

Use `TodoWrite` to create exactly these four tasks:

1. "Phase 1: Clarify Requirements"
2. "Phase 2: Implement"
3. "Phase 3: Code Review"
4. "Phase 4: Apply Review Feedback"

All four must be created upfront. Work through them in order. **Mark a phase complete only after fully finishing it — never skip or batch.**

---

## Phases

Before starting each phase, read the corresponding detail file. It contains the exact checklist for that phase.

| Phase | Detail file |
|-------|-------------|
| 1 | `.claude/commands/implement/phase1-clarify.md` |
| 2 | `.claude/commands/implement/phase2-implement.md` |
| 3 | `.claude/commands/implement/phase3-review.md` |
| 4 | `.claude/commands/implement/phase4-feedback.md` |
