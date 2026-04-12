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
  createdByName?: string | null;
  confirmedAt?: string | null;
  sentAt?: string | null;
  totalAmount: number;
  aiSummary?: string | null;
  aiWarnings?: string[];
  aiMissingData?: string[];
  automatability?: Automatability | null;
  aiProcessingFailed: boolean;
  lines: InvoiceLine[];
  auditEvents: AuditEvent[];
  openSaatekirjadCount?: number;
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
  partnerName?: string | null;
  createdAt: string;
}

export interface TtlCode {
  code: string;
  nameEt: string;
  isBillable: boolean;
  priceLimit: number;
  conditions: string;
  source: string;
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
  openInvoices: number;
  confirmed: number;
  sent: number;
  rejected: number;
}

export interface PartnerInvoice {
  id: string;
  partnerName: string;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  pdfPath: string;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
  tkInvoices?: TkInvoiceSummary[];
}

export interface TkInvoiceSummary {
  id: string;
  patientName: string;
  visitDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  haigusjuhtumiNr: string;
  _count: { lines: number };
}

// Partner comparison types
export interface PartnerLineGroup {
  ttlCode: string;
  ttlName: string;
  _sum: { quantity: number };
  _count: { id: number };
}

export interface ParsedPartnerLine {
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface LisaEntry {
  personalCode: string;
  saatekirjaNumber: string;
  ttlCode: string;
  serviceDate: string;
  status?: 'match' | 'not_invoiced' | 'missing_from_partner';
}

// Request body types
export interface DemoHaigusluguBody {
  patientName: string;
  patientCode: string;
  files: File[];
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
