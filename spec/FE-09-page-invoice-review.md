# FE-09: Page — Invoice Review (Core Page)

## Goal
Implement the InvoiceReview page (`/invoices/:id`) — the main nurse workflow page for reviewing and confirming AI-drafted invoices.

## File to create
`apps/frontend/src/pages/InvoiceReview.tsx`

---

## Data

```typescript
const { id } = useParams<{ id: string }>();
const { data: invoice, isLoading } = useInvoice(id!);
const confirmMutation = useConfirmInvoice();
const sendMutation = useSendInvoice();
const removeLine = useRemoveLine(id!);
const navigate = useNavigate();
const [showAddModal, setShowAddModal] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
```

---

## Layout (top to bottom)

```
PageHeader:
  breadcrumb: [Arved →]
  title: "Arve #" + invoice.haigusjuhtumiNr + " — " + invoice.patientName
  action: [InvoiceStatusBadge]  [Vaata PDF ↗]  [← Tagasi]

AI Summary box (TEDI Alert type="info"):
  invoice.aiSummary
  "Automatiseeritavus:" + ConfidenceBadge(invoice.automatability)

AiWarningPanel (if invoice.aiMissingData.length > 0 or invoice.aiWarnings.length > 0)

─ Arve read ─────────────────────────── [Lisa kood] (ghost Button, only if PENDING_REVIEW)

InvoiceLineCard × N   (for each invoice.lines)

AuditTrail (collapsible, collapsed by default)

[Sticky InvoiceSummaryBar at bottom]
```

---

## Line removal

When a line checkbox is unchecked (or "Eemalda" clicked):
- Call `removeLine.mutate(lineId)` immediately
- The API returns the updated invoice, React Query updates the cache
- The line disappears from the list without a page reload

`isEditable` = `invoice.status === 'PENDING_REVIEW'`

---

## Confirm flow

1. Click "Kinnita arve" in InvoiceSummaryBar
2. Show TEDI `Modal`: "Kas olete kindel? Arve saadetakse Tervisekassale."
3. On confirm: `confirmMutation.mutate(invoice.id)`
4. On success: show TEDI Toast "Arve kinnitatud ✓", modal closes
5. Invoice status updates to CONFIRMED via React Query cache

---

## Send flow

Only shown after status is CONFIRMED.
1. Click "Saada TK-le"
2. `sendMutation.mutate(invoice.id)`
3. On success: show TEDI Toast "Arve saadetud Tervisekassale ✓"
4. Status updates to SENT

---

## Status-based rendering

| Status | Checkboxes | Confirm button | Send button | Other |
|--------|-----------|---------------|------------|-------|
| PENDING_REVIEW | active | enabled | hidden | "Lisa kood" visible |
| CONFIRMED | disabled | hidden | shown | "Ekspordi PDF" link |
| SENT | disabled | hidden | hidden | Green "Saadetud ✓" banner, "Ekspordi PDF" link |
| REJECTED | disabled | "Kinnita uuesti" | hidden | Red Alert with rejection reason |

---

## Toast notifications

Use TEDI `Toast` or `Notification` for:
- Confirm success: "Arve kinnitatud ✓"
- Send success: "Arve saadetud Tervisekassale ✓"
- Any mutation error: "Midagi läks valesti: [error.message]"

---

## PDF link

"Vaata PDF" → `window.open(api.getInvoicePdfUrl(invoice.id), '_blank')`

---

## Done when
- Full invoice with AI summary, lines, warnings, and audit trail renders
- Removing a line updates the total in InvoiceSummaryBar immediately
- Confirm modal flow works end-to-end
- Status-based rendering shows correct UI for PENDING_REVIEW, CONFIRMED, and SENT states
