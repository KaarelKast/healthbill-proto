# FE-06: App Shell & Routing

## Goal
Implement the top-level router, layout shell, and navigation.

## Files to create
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/components/layout/AppShell.tsx`
- `apps/frontend/src/components/layout/PageHeader.tsx`

---

## App.tsx

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import CaseDetail from "./pages/CaseDetail";
import InvoiceReview from "./pages/InvoiceReview";
import InvoiceList from "./pages/InvoiceList";
import DemoManager from "./pages/DemoManager";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceReview />} />
          <Route path="demo" element={<DemoManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## AppShell.tsx

Layout: fixed sidebar nav on the left, content area on the right.

**Structure:**
```
┌──────┬────────────────────────────┐
│ Nav  │ <Outlet />                 │
│      │ (page content renders here)│
│      │                            │
└──────┴────────────────────────────┘
```

**Nav items** (use TEDI components for links/buttons, or plain `<NavLink>` styled with TEDI CSS vars):
- Logo/brand: "🏥 HealthBill" → links to `/`
- "Juhtumid" → `/`
- "Arved" → `/invoices`
- "Demo" → `/demo`

Active nav item should be visually highlighted (use `NavLink` `isActive` class or TEDI active state).

**Styling guidelines:**
- Nav background: `var(--color-primary-dark)`
- Nav text: white
- Content area background: `var(--color-background)`
- Content area has padding: `var(--spacing-lg)`
- Nav width: 220px fixed

Use CSS modules or a plain `AppShell.css` file with TEDI CSS variables.

---

## PageHeader.tsx

Reusable page header with title, optional subtitle, optional action button, and optional breadcrumb.

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to: string }[];
  action?: React.ReactNode;  // button or link rendered top-right
}
```

**Layout:**
```
[Breadcrumb > breadcrumb]
Title                    [action]
Subtitle (if present)
─────────────────────────────────
```

Use TEDI typography and spacing variables. The horizontal rule uses `var(--color-border)`.

---

## Done when
- Navigating to `/`, `/invoices`, `/demo` renders the correct placeholder page inside the shell
- Active nav link is highlighted
- AppShell nav is always visible
- `PageHeader` renders title + optional action in the correct positions
