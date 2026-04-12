# FE-15: Components — Shared Components

## Goal
Implement small shared utility components used across multiple pages.

## Files to create
- `apps/frontend/src/components/shared/EmptyState.tsx`
- `apps/frontend/src/components/shared/LoadingSpinner.tsx`
- `apps/frontend/src/components/shared/PdfPreviewLink.tsx`

---

## EmptyState

Consistent empty state display using TEDI Alert.

```tsx
interface EmptyStateProps {
  message: string;
  type?: 'info' | 'warning' | 'error';  // default: 'info'
}

export function EmptyState({ message, type = 'info' }: EmptyStateProps) {
  return <Alert type={type}>{message}</Alert>;
}
```

Import `Alert` from `@tehik-ee/tedi-react/tedi`.

Usage throughout the app:
```tsx
<EmptyState message="Ühtegi arvet pole veel loodud." />
<EmptyState message="Andmete laadimine ebaõnnestus. Palun värskenda lehte." type="error" />
```

---

## LoadingSpinner

Centred TEDI Spinner wrapper.

```tsx
interface LoadingSpinnerProps {
  label?: string;  // optional accessible label
}

export function LoadingSpinner({ label = 'Laadin...' }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-xl)' }}>
      <Spinner label={label} />
    </div>
  );
}
```

Import `Spinner` from `@tehik-ee/tedi-react/tedi`.

---

## PdfPreviewLink

Opens a PDF in a new browser tab.

```tsx
interface PdfPreviewLinkProps {
  href: string;
  label?: string;  // default: "Vaata PDF ↗"
}

export function PdfPreviewLink({ href, label = 'Vaata PDF ↗' }: PdfPreviewLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
```

---

## Usage examples

```tsx
// Dashboard — loading
if (isLoading) return <LoadingSpinner />;

// InvoiceList — empty tab
if (!invoices?.length) return <EmptyState message="Kõik arved on kinnitatud." />;

// SaatekirjaRow — PDF link
<PdfPreviewLink href={api.getPdfUrl(saatekiri.id)} />

// InvoiceReview — PDF link
<PdfPreviewLink href={api.getInvoicePdfUrl(invoice.id)} label="Ekspordi PDF ↗" />
```

---

## Done when
- All three components render without errors
- LoadingSpinner is visually centered on the page
- PdfPreviewLink opens the URL in a new tab with `noopener noreferrer`
