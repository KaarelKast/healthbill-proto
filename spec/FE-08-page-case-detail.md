# FE-08: Page — Case Detail

## Goal
Implement the CaseDetail page (`/cases/:id`) showing patient info, saatekirjad, and linked invoices.

## File to create
`apps/frontend/src/pages/CaseDetail.tsx`

---

## Data

```typescript
const { id } = useParams<{ id: string }>();
const { data: haiguslugu, isLoading, error } = useHaiguslugu(id!);
const processeMutation = useProcessSaatekiri();
const navigate = useNavigate();
```

---

## Layout

```
PageHeader:
  breadcrumb: [Juhtumid →]
  title: haigusjuhtumiNr + " — " + patientName
  subtitle: CaseStatus badge (TEDI Badge)

Patient info row:
  Sünnikuupäev: [patientDob formatted or "—"]
  Isikukood: [first 6 digits]XXXXX (partially masked)

── Saatekirjad ────────────────────────────────
[SaatekirjaRow] × N

── Arved ──────────────────────────────────────
Table or list:
  Invoice #id | visitDate | InvoiceStatusBadge | [Vaata arvet →]
```

---

## Saatekiri processing flow

Each `SaatekirjaRow` for a `RESPONSE_RECEIVED` saatekiri shows a "Töötle" button.

On click:
1. Call `processeMutation.mutate(saatekiri.id)`
2. Show TEDI `Spinner` / disable button while `processeMutation.isPending`
3. On `onSuccess`: `navigate('/invoices/' + invoice.id)` where `invoice` is the returned Invoice
4. On `onError`: show TEDI `Alert` type="error" inline: "Töötlemine ebaõnnestus: [error.message]"

**Note:** Processing can take 5–15 seconds (HBAI call). The spinner must stay visible for the full duration.

---

## Invoices section

If `haiguslugu.invoices` is empty: show TEDI `Alert` type="info": "Ühtegi arvet pole veel loodud."

Otherwise list each invoice:
- Columns: kuupäev, status badge, "Vaata arvet" link → `/invoices/:id`

---

## Loading & Error

- Loading: centered TEDI `Spinner`
- Error / not found: TEDI `Alert` type="error"

---

## Done when
- Page shows patient info, all saatekirjad, and all invoices
- "Töötle" button triggers processing and redirects to InvoiceReview on success
- Spinner visible while processing (async, can take 15s)
- Partially masked personal code (show only first 6 chars + XXXXX)
