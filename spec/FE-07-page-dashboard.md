# FE-07: Page — Dashboard

## Goal
Implement the Dashboard page (`/`) — the main entry point showing billing status at a glance.

## File to create
`apps/frontend/src/pages/Dashboard.tsx`

---

## Layout

```
PageHeader: "Juhtumid"                    [Lisa demo juhtum →]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Avatud       │ │ Ootel        │ │ Kinnitatud   │ │ Töötlemata   │
│ juhtumid     │ │ kinnitust    │ │ täna         │ │ vastused     │
│              │ │              │ │              │ │              │
│ [N]          │ │ [N]          │ │ [N]          │ │ [N]          │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

## Töötlemata saatekirja vastused
[CaseCard] [CaseCard] ...

## Kõik avatud juhtumid
[CaseCard] [CaseCard] ...
```

---

## Data

```typescript
const stats = useStats();
const unprocessed = useHaiguslood({ hasUnprocessed: true });
const allOpen = useHaiguslood({ status: 'OPEN' });
```

---

## Stat cards

Use TEDI `Card` component for each. 4 cards in a row (CSS grid, 4 columns).

| Card | Value | Color hint |
|------|-------|------------|
| "Avatud juhtumid" | `stats.data.openCases` | blue (`--color-primary`) |
| "Ootel kinnitust" | `stats.data.pendingReview` | amber (`--color-warning`) |
| "Kinnitatud täna" | `stats.data.confirmedToday` | green (`--color-success`) |
| "Töötlemata vastused" | `stats.data.unprocessedResponses` | red if > 0 (`--color-error`), grey if 0 |

Each card shows: label (small, muted) + number (large, bold).

---

## Case sections

"Töötlemata saatekirja vastused" section:
- Show only if `unprocessed.data.length > 0`
- Render one `CaseCard` per item

"Kõik avatud juhtumid" section:
- Filter out cases already shown in the unprocessed section (deduplicate by id)
- If empty after filtering and no unprocessed cases: show TEDI `Alert` type="info": "Kõik juhtumid on lahendatud. Lisa demo juhtum, et näha kuidas HealthBill toimib."

---

## Loading & Error states

- While any query is loading: show TEDI `Spinner` centered
- On error: TEDI `Alert` type="error": "Andmete laadimine ebaõnnestus. Palun värskenda lehte."

---

## Navigation

- Stat cards: not clickable (display only)
- "Lisa demo juhtum" button → `navigate('/demo')`
- Each `CaseCard` → `navigate('/cases/:id')`

---

## Done when
- Dashboard loads and shows stat counts from the API
- Two separate lists of CaseCards render correctly
- Empty state shows when no open cases
- Loading spinner shows while fetching
