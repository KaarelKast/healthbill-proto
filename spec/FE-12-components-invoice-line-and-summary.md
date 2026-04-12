# FE-12: Components — InvoiceLineCard & InvoiceSummaryBar

## Goal
Implement the two main invoice UI components: the per-line card and the sticky bottom action bar.

## Files to create
- `apps/frontend/src/components/invoice/InvoiceLineCard.tsx`
- `apps/frontend/src/components/invoice/InvoiceSummaryBar.tsx`

---

## InvoiceLineCard

```tsx
interface InvoiceLineCardProps {
  line: InvoiceLine;
  isEditable: boolean;
  onRemove: (lineId: string) => void;
}
```

### Visual structure

```
┌──────────────────────────────────────────────────────┐
│ [✓ Checkbox]  3026  Kroonilise haige jälgimine       │
│               [kõrge badge] [tasuline tag]            │
│               "Kõrgenenud glükoos ja HbA1c paneel…"  │
│               📄 "HbA1c (IFCC) 40.2 mmol/mol"       │
│                                          12.00 €     │
│                                    [Eemalda ×]       │
└──────────────────────────────────────────────────────┘
```

### Implementation details

- Use TEDI `Card` as the wrapper
- **Checkbox**: TEDI `Checkbox`, checked by default, `disabled` if `!isEditable`
  - On uncheck → call `onRemove(line.id)` immediately
- **TTL Code**: render in `font-family: monospace`
- **Confidence badge**: `<ConfidenceBadge confidence={line.confidence} />`
- **Billable tag**:
  - `isBillable === true` → TEDI `Tag` variant filled: "tasuline"
  - `isBillable === false` → TEDI `Tag` variant outlined grey: "0€"
- **AI rationale** (`line.aiRationale`): shown as normal text if present
- **Source ref** (`line.sourceRef`): shown in small italic text with 📄 prefix if present
- **Price**:
  - Billable: `line.price.toFixed(2) + " €"` in green (`var(--color-success)`)
  - Non-billable: "0 €" in grey (`var(--color-text-secondary)`)
- **Remove button**: TEDI `Button` variant="danger" size="sm", text "Eemalda ×"
  - Only rendered if `isEditable`
  - On click: `onRemove(line.id)`

---

## InvoiceSummaryBar

```tsx
interface InvoiceSummaryBarProps {
  invoice: Invoice;
  onConfirm: () => void;
  onSend: () => void;
  isConfirming: boolean;
  isSending: boolean;
}
```

### Visual structure

```
┌──────────────────────────────────────────────────────────┐
│ 2 koodi · 12.00 € (1 0€ arverida)      [Kinnita arve]  │
└──────────────────────────────────────────────────────────┘
```

Sticky at the bottom of the page: `position: sticky; bottom: 0; z-index: 100`
Background: `var(--color-primary-dark)`. Text: white.

### Left side (computed from invoice):

```typescript
const billableCount = invoice.lines.filter(l => l.isBillable).length;
const freeCount = invoice.lines.filter(l => !l.isBillable).length;
const total = invoice.totalAmount.toFixed(2);
// e.g. "2 koodi · 12.00 € (1 0€ arverida)"
```

Hide the free count part if `freeCount === 0`.

### Right side (status-dependent):

| Invoice status | Right side content |
|---------------|-------------------|
| PENDING_REVIEW | `[Kinnita arve]` button (primary, calls `onConfirm`) |
| CONFIRMED | `[Saada TK-le]` button (secondary, calls `onSend`) + `[Ekspordi PDF ↗]` link |
| SENT | "Saadetud ✓" text (green) + `[Ekspordi PDF ↗]` link |
| REJECTED | `[Kinnita uuesti]` button (calls `onConfirm`) |

- Show `Spinner` inside the active button while `isConfirming` or `isSending`
- "Ekspordi PDF" → `<a href={api.getInvoicePdfUrl(invoice.id)} target="_blank">Ekspordi PDF ↗</a>`

---

## Done when
- InvoiceLineCard renders all fields correctly for both billable and non-billable lines
- Checkbox uncheck immediately calls onRemove
- InvoiceSummaryBar renders correct right-side content per invoice status
- Sticky bar always visible at bottom of viewport
