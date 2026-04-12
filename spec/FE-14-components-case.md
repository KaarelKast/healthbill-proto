# FE-14: Components — Case Components

## Goal
Implement the case-related display components: CaseCard (for lists) and SaatekirjaRow (for case detail).

## Files to create
- `apps/frontend/src/components/case/CaseCard.tsx`
- `apps/frontend/src/components/case/SaatekirjaRow.tsx`

---

## CaseCard

Clickable summary card for a Haiguslugu. Used on the Dashboard.

```tsx
interface CaseCardProps {
  haiguslugu: Haiguslugu;
  onClick: () => void;
}
```

### Visual structure

```
┌─────────────────────────────────────────────┐
│ A21996                          [OPEN badge] │
│ Jaarika Järviste                             │
│ 1 töötlemata vastus · Arve: [PENDING badge] │
└─────────────────────────────────────────────┘
```

- Use TEDI `Card` with `onClick` handler (make the whole card clickable)
- Show cursor: pointer on hover
- Top row: `haigusjuhtumiNr` (bold) + `CaseStatus` Badge (OPEN=green, CLOSED=grey) right-aligned
- Second row: `patientName`
- Third row (muted, smaller font):
  - If `pendingSaatekirjad > 0`: `"${pendingSaatekirjad} töötlemata vastus${pendingSaatekirjad > 1 ? 't' : ''}"` in orange/warning color
  - If `invoiceStatus`: `"Arve: "` + `<InvoiceStatusBadge status={invoiceStatus} />`

---

## SaatekirjaRow

Single row in the CaseDetail saatekirjad list.

```tsx
interface SaatekirjaRowProps {
  saatekiri: Saatekiri;
  onProcess: (id: string) => void;
  isProcessing: boolean;  // true when this specific saatekiri's mutation is pending
}
```

### Layout (table row or flex row):

```
Väljastatud: 10.10.2024  [RESPONSE_RECEIVED badge]  [Vaata PDF ↗]  [Töötle]
```

Or if PROCESSED:
```
Väljastatud: 10.10.2024  [PROCESSED badge]           [Vaata PDF ↗]  [Vaata arvet →]
```

### Logic

**Status badge** — use TEDI Badge:
- OPEN: grey / neutral
- RESPONSE_RECEIVED: amber / warning
- PROCESSED: green / success

**"Vaata PDF" link:**
```tsx
<a href={api.getPdfUrl(saatekiri.id)} target="_blank" rel="noopener noreferrer">
  Vaata PDF ↗
</a>
```

**"Töötle" button** (shown only if `status === 'RESPONSE_RECEIVED'`):
- TEDI `Button` variant="primary"
- `disabled={isProcessing}`
- Shows TEDI `Spinner` inside when `isProcessing`
- `onClick`: `onProcess(saatekiri.id)`

**"Vaata arvet →" link** (shown only if `status === 'PROCESSED'` and `saatekiri.invoice?.id`):
```tsx
<Link to={`/invoices/${saatekiri.invoice.id}`}>Vaata arvet →</Link>
```

---

## Done when
- CaseCard renders haigusjuhtumiNr, patientName, pending count, and invoice status
- Clicking a CaseCard triggers `onClick`
- SaatekirjaRow shows correct buttons per status
- "Töötle" shows spinner while processing
- "Vaata PDF" opens PDF in new tab
