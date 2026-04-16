# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HealthBill is a **clickable frontend prototype** for a healthcare billing system (Estonian: Tervisekassa). There is **no backend** — the API client (`src/api/client.ts`) loads static JSON fixtures from `src/data/` and mutates them in-memory. The app uses Estonian-language domain terms throughout (haiguslugu = case, saatekiri = referral letter, arve = invoice, TTL = service code).

## Commands

- **Dev server:** `yarn dev` (Vite, proxies `/api` to `localhost:3000` — irrelevant for prototype)
- **Build:** `yarn build` (runs `tsc && vite build`, output in `dist/`)
- **Preview production build:** `yarn preview`
- **No test runner or linter is configured.**

## Architecture

**Stack:** React 18 + TypeScript + Vite, React Router v6, TanStack Query v5, TEHIK TEDI design system (`@tehik-ee/tedi-react`).

**Routing** (in `src/App.tsx`): All routes are nested under `AppShell` layout. Key routes: `/invoices` (list), `/invoices/:id` (review/edit), `/cases/:id` (case detail), `/partner-invoices` (partner comparison).

**Data flow:** `src/api/client.ts` is the single data source — a mock API that mirrors the shape of a real backend. Custom hooks in `src/hooks/` wrap TanStack Query calls to this client. Mutations optimistically update the query cache.

**Key domain types** are in `src/types/index.ts`: `Invoice`, `InvoiceLine`, `Haiguslugu`, `Saatekiri`, `TtlCode`, `PartnerInvoice`. Invoice status flow: `DRAFT → PENDING_REVIEW → CONFIRMED → SENT → ACCEPTED/REJECTED`.

**Spec documents** in `spec/` (FE-01 through FE-15) describe the intended implementation for each feature area. Consult these when adding or modifying features.

## Key Conventions

- TEDI CSS must be imported before any other styles (`import "@tehik-ee/tedi-react/index.css"` is first in `main.tsx`)
- TypeScript strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`
- Package manager is Yarn (Berry, see `.yarnrc.yml`)
