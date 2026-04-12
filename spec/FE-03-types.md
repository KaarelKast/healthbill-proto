# FE-03: TypeScript Types

## Goal
Define all shared TypeScript types used across the frontend.

## File to create
`apps/frontend/src/types/index.ts`

---

## Types to define

```typescript
// Enums (string literals)
export type UserRole = 'NURSE' | 'DOCTOR' | 'ADMIN';
export type CaseStatus = 'OPEN' | 'CLOSED';
export type SaatekirjaStatus = 'OPEN' | 'RESPONSE_RECEIVED' | 'PROCESSED';
export type InvoiceStatus = 'DRAFT' | 'PENDING_REVIEW' | 'CONFIRMED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type Confidence = 'high' | 'medium' | 'low';
export type Automatability = 'high' | 'medium' | 'low';

// Core entities
export interface Organisation {
  id: string;
  name: string;
  registryCode: string;
  createdAt: string;
}

export interface Haiguslugu {
  id: string;
  haigusjuhtumiNr: string;
  patientCode: string;
  patientName: string;
  patientDob?: string;
  status: CaseStatus;
  openedAt: string;
  isDemo: boolean;
  // Computed fields from list endpoint
  pendingSaatekirjad?: number;
  invoiceStatus?: InvoiceStatus | null;
  invoiceId?: string | null;
  // Nested (detail endpoint only)
  saatekirjad?: Saatekiri[];
  invoices?: Invoice[];
}

export interface Saatekiri {
  id: string;
  haigusjuhtumiNr: string;
  issuedAt: string;
  status: SaatekirjaStatus;
  responsePdfPath?: string | null;
  responsePdfReceivedAt?: string | null;
  processedAt?: string | null;
  invoice?: { id: string; status: InvoiceStatus } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  haigusjuhtumiNr: string;
  saatekirjaId: string;
  patientCode: string;
  patientName: string;
  visitDate: string;
  organisationId: string;
  confirmedAt?: string | null;
  sentAt?: string | null;
  totalAmount: number;
  aiSummary?: string | null;
  aiWarnings?: string[];
  aiMissingData?: string[];
  automatability?: Automatability | null;
  lines: InvoiceLine[];
  auditEvents: AuditEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  ttlCode: string;
  ttlName: string;
  isBillable: boolean;
  price: number;
  quantity: number;
  serviceDate: string;
  sourceRef?: string | null;
  aiRationale?: string | null;
  confidence?: Confidence | null;
  addedBy: string;
  createdAt: string;
}

export interface TtlCode {
  code: string;
  nameEt: string;
  isBillable: boolean;
  priceLimit: number;
  conditions: string;
  validFrom: string;
  validUntil?: string | null;
}

export interface AuditEvent {
  id: string;
  invoiceId: string;
  actor: string;
  action: string;
  payload?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  openCases: number;
  pendingReview: number;
  confirmedToday: number;
  sentThisMonth: number;
  totalBilledThisMonth: number;
  unprocessedResponses: number;
}

// Request body types
export interface DemoHaiguslugуBody {
  haigusjuhtumiNr: string;
  patientName: string;
  patientCode: string;
  saatekirjaType: 'lab_results' | 'child_vaccination' | 'wound_tvl';
  fixturePdfCase: 1 | 2 | 3;
}

export interface AddLineBody {
  ttlCode: string;
  serviceDate: string;
  quantity: number;
}

export interface InvoiceListParams {
  status?: InvoiceStatus;
  haigusjuhtumiNr?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

---

## Done when
- All types compile without errors
- `api/client.ts` can import and use these types without type errors
