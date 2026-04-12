# FE-10: Page — Invoice List

## Goal
Implement the InvoiceList page (`/invoices`) showing all invoices with status filtering tabs.

## File to create
`apps/frontend/src/pages/InvoiceList.tsx`

---

## Data

```typescript
const [activeTab, setActiveTab] = useState<string>('all');

const statusMap: Record<string, InvoiceStatus | undefined> = {
  all: undefined,
  pending: 'PENDING_REVIEW',
  confirmed: 'CONFIRMED',
  sent: 'SENT',
  rejected: 'REJECTED',
};

const { data: invoices, isLoading } = useInvoices(
  statusMap[activeTab] ? { status: statusMap[activeTab] } : undefined
);
```

---

## Layout

```
PageHeader: "Arved"

[Tabs: Kõik | Ootel kinnitust | Kinnitatud | Saadetud | Tagasi lükatud]

Table:
  Patsient | Kuupäev | Haiguslugu | Koodide arv | Summa | Olek | Toimingud
  ─────────────────────────────────────────────────────────────────────────
  Jaarika.. | 10.10.. | A21996     | 2           | 12.00€| [badge] | [Vaata →]
```

---

## Tabs

Use TEDI `Tabs` component. Tab labels:
- "Kõik"
- "Ootel kinnitust"
- "Kinnitatud"
- "Saadetud"
- "Tagasi lükatud"

On tab change: update `activeTab` state → triggers new query.

---

## Table

Use TEDI `Table` component. Columns:

| Column | Data |
|--------|------|
| Patsient | `invoice.patientName` |
| Kuupäev | `invoice.visitDate` formatted to `dd.MM.yyyy` |
| Haiguslugu | `invoice.haigusjuhtumiNr` |
| Koodide arv | `invoice.lineCount` (or `invoice.lines?.length`) |
| Summa | `invoice.totalAmount.toFixed(2) + " €"` |
| Olek | `<InvoiceStatusBadge status={invoice.status} />` |
| Toimingud | `<Link to={'/invoices/' + invoice.id}>Vaata →</Link>` |

---

## Empty state

Per tab, show TEDI `Alert` type="info" if no invoices:
- "Kõik" tab: "Ühtegi arvet pole veel loodud."
- "Ootel kinnitust": "Kõik arved on kinnitatud."
- "Kinnitatud": "Täna pole ühtegi arvet kinnitatud."
- "Saadetud": "Arved ootavad kinnitamist."
- "Tagasi lükatud": "Tagasi lükatud arveid pole."

---

## Loading & Error

- Loading: centered TEDI `Spinner`
- Error: TEDI `Alert` type="error"

---

## Done when
- All 5 tabs filter the invoice list correctly
- Each row links to the correct InvoiceReview page
- Empty state messages are tab-specific
- InvoiceStatusBadge renders the correct color for each status
