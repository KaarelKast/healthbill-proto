# FE-13: Components — Badges, AiWarningPanel, AuditTrail & AddLineModal

## Goal
Implement the smaller invoice-related display components and the add-line modal.

## Files to create
- `apps/frontend/src/components/invoice/ConfidenceBadge.tsx`
- `apps/frontend/src/components/invoice/InvoiceStatusBadge.tsx`
- `apps/frontend/src/components/invoice/AiWarningPanel.tsx`
- `apps/frontend/src/components/invoice/AuditTrail.tsx`
- `apps/frontend/src/components/invoice/AddLineModal.tsx`

---

## ConfidenceBadge

Maps AI confidence level to a TEDI Badge:

```tsx
const map = {
  high:   { label: 'kõrge',    variant: 'success' },
  medium: { label: 'keskmine', variant: 'warning' },
  low:    { label: 'madal',    variant: 'error' },
};

interface ConfidenceBadgeProps {
  confidence?: string | null;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  if (!confidence || !(confidence in map)) return null;
  const { label, variant } = map[confidence as keyof typeof map];
  return <Badge variant={variant}>{label}</Badge>;
}
```

Import `Badge` from `@tehik-ee/tedi-react/tedi`.

---

## InvoiceStatusBadge

Maps invoice status to a TEDI Badge:

```tsx
const statusMap = {
  DRAFT:          { label: 'Mustand',      variant: 'neutral' },
  PENDING_REVIEW: { label: 'Ootel',        variant: 'warning' },
  CONFIRMED:      { label: 'Kinnitatud',   variant: 'success' },
  SENT:           { label: 'Saadetud',     variant: 'info' },
  ACCEPTED:       { label: 'Vastu võetud', variant: 'success' },
  REJECTED:       { label: 'Tagasi lükatud', variant: 'error' },
  CANCELLED:      { label: 'Tühistatud',   variant: 'neutral' },
};

interface InvoiceStatusBadgeProps { status: InvoiceStatus; }
```

---

## AiWarningPanel

Renders only if there are warnings or missing data.

```tsx
interface AiWarningPanelProps {
  missingData?: string[];
  warnings?: string[];
}
```

If `missingData` has items:
- TEDI `Alert` type="info"
- Title: "🔍 Puuduvad andmed — võimalikud lisakoodid:"
- Body: bullet list of `missingData` strings

If `warnings` has items:
- TEDI `Alert` type="warning"
- Title: "⚠️ Tähelepanu:"
- Body: bullet list of `warnings` strings

Show both if both are present (missing data first).

Return `null` if both arrays are empty or undefined.

---

## AuditTrail

Collapsible section, collapsed by default.

```tsx
interface AuditTrailProps {
  events: AuditEvent[];
}
```

Uses a local `useState(false)` for open/closed.

Toggle button: "Ajalugu ▼" / "Ajalugu ▲"

When open, renders events as a timeline list:

```
✓  DRAFT_CREATED   SYSTEM         28.03.2025 14:32
✓  LINE_REMOVED    48001010000    28.03.2025 14:33
✓  CONFIRMED       48001010000    28.03.2025 14:34
```

Each row: checkmark icon, action (monospace), actor, formatted date (`dd.MM.yyyy HH:mm`).

---

## AddLineModal

Opens as TEDI `Modal`. Allows nurse to manually add a TTL code to the invoice.

```tsx
interface AddLineModalProps {
  invoiceId: string;
  visitDate: string;      // default serviceDate
  onClose: () => void;
}
```

**Inside the modal:**
- TTL code `Select` (TEDI): populated from `useTtlCodes()`
  - Option label format: `"3026 — Kroonilise haige jälgimine (12.00 €)"`
  - For non-billable: `"3061 — Diabeedi kvaliteediindikaator (0 €)"`
- ServiceDate `DateInput` (TEDI or plain `<input type="date">`): defaults to `props.visitDate`
- "Lisa" button (primary) + "Tühista" button (ghost)

**Submit logic:**
1. Validate: TTL code must be selected
2. Call `useAddLine(invoiceId).mutate({ ttlCode, serviceDate, quantity: 1 })`
3. On success: `onClose()`
4. On error: show error text below the form

**Loading state:** disable "Lisa" button + show Spinner while `addLine.isPending`.

---

## Done when
- ConfidenceBadge renders green/amber/red for high/medium/low
- InvoiceStatusBadge renders correct color per status
- AiWarningPanel only renders when there is content
- AuditTrail toggle works, events formatted correctly
- AddLineModal opens, allows code selection, submits correctly
