# FE-02: API Client

## Goal
Create the typed API client that all hooks use. No component should ever call `fetch` directly.

## File to create
`apps/frontend/src/api/client.ts`

---

## Base fetch wrapper

```typescript
const BASE = import.meta.env.VITE_API_BASE_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}
```

---

## Typed API methods

Export an `api` object with one method per backend endpoint:

```typescript
export const api = {
  // Haiguslood
  getHaiguslood: (params?: { status?: string; hasUnprocessed?: boolean }) =>
    apiFetch<Haiguslugu[]>(`/haiguslood?${new URLSearchParams(params as any)}`),

  getHaiguslugu: (id: string) =>
    apiFetch<Haiguslugu>(`/haiguslood/${id}`),

  createDemoHaiguslugu: (body: DemoHaiguslugуBody) =>
    apiFetch<Haiguslugu>('/haiguslood/demo', { method: 'POST', body: JSON.stringify(body) }),

  // Saatekirjad
  getPdfUrl: (saatekirjaId: string) =>
    `${BASE}/saatekirjad/${saatekirjaId}/pdf`,   // used in <a href> directly — not a fetch

  processSaatekiri: (saatekirjaId: string) =>
    apiFetch<Invoice>(`/saatekirjad/${saatekirjaId}/process`, { method: 'POST' }),

  // Invoices
  getInvoices: (params?: InvoiceListParams) =>
    apiFetch<Invoice[]>(`/invoices?${new URLSearchParams(params as any)}`),

  getInvoice: (id: string) =>
    apiFetch<Invoice>(`/invoices/${id}`),

  addLine: (invoiceId: string, body: AddLineBody) =>
    apiFetch<Invoice>(`/invoices/${invoiceId}/lines`, { method: 'POST', body: JSON.stringify(body) }),

  removeLine: (invoiceId: string, lineId: string) =>
    apiFetch<Invoice>(`/invoices/${invoiceId}/lines/${lineId}`, { method: 'DELETE' }),

  confirmInvoice: (invoiceId: string) =>
    apiFetch<Invoice>(`/invoices/${invoiceId}/confirm`, { method: 'POST' }),

  sendInvoice: (invoiceId: string) =>
    apiFetch<Invoice>(`/invoices/${invoiceId}/send`, { method: 'POST' }),

  getInvoicePdfUrl: (invoiceId: string) =>
    `${BASE}/invoices/${invoiceId}/pdf`,          // used in <a href> directly

  // TTL
  getTtlCodes: () =>
    apiFetch<TtlCode[]>('/ttl/codes'),

  syncTtl: () =>
    apiFetch<{ added: number; updated: number }>('/ttl/sync', { method: 'POST' }),

  // Stats
  getDashboardStats: () =>
    apiFetch<DashboardStats>('/stats/dashboard'),
};
```

---

## Types used in this file
Import from `../types` (implemented in FE-03):
- `Haiguslugu`, `Invoice`, `TtlCode`, `DashboardStats`
- `DemoHaiguslugуBody`, `AddLineBody`, `InvoiceListParams`

---

## Notes
- `getPdfUrl` and `getInvoicePdfUrl` return URL strings (not Promises) — they're used in `<a href>` and `window.open()`
- Query params: filter out undefined values before passing to `URLSearchParams` to avoid `key=undefined` in URL

---

## Done when
- `api.getHaiguslood()` compiles with correct TypeScript types
- No `fetch` calls anywhere except in `apiFetch`
