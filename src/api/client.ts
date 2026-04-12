/**
 * Mock API client for the HealthBill clickable prototype.
 * All data is loaded from static JSON files and mutated in-memory.
 * No backend required.
 */
import type {
  Haiguslugu,
  Invoice,
  TtlCode,
  DashboardStats,
  DemoHaigusluguBody,
  AddLineBody,
  InvoiceListParams,
  PartnerInvoice,
  PartnerLineGroup,
  ParsedPartnerLine,
  LisaEntry,
} from '../types';

import rawInvoices from '../data/invoices.json';
import rawTtlCodes from '../data/ttl-codes.json';
import partnerParsedData from '../data/partner-invoice-parsed.json';

// ── In-memory state (mutable) ────────────────────────────────────────────────

let invoices: Invoice[] = JSON.parse(JSON.stringify(rawInvoices));
let nextLineId = 100;
let nextEventId = 100;

function delay(ms = 150): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── TTL codes (adapt fixture shape → frontend TtlCode shape) ─────────────────

const ttlCodes: TtlCode[] = (rawTtlCodes as Array<{
  code: string; nameEt: string; isBillable: boolean; priceLimit: number; source?: string;
}>).map((c) => ({
  code: c.code,
  nameEt: c.nameEt,
  isBillable: c.isBillable,
  priceLimit: c.priceLimit,
  conditions: '',
  source: c.source ?? 'TIS',
  validFrom: '2024-01-01T00:00:00.000Z',
  validUntil: null,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function findInvoice(id: string): Invoice | undefined {
  return invoices.find((inv) => inv.id === id);
}

function recalcTotal(inv: Invoice): void {
  inv.totalAmount = inv.lines
    .filter((l) => l.isBillable)
    .reduce((sum, l) => sum + Number(l.price) * l.quantity, 0);
}

function computeStats(): DashboardStats {
  return {
    openCases: 0,
    pendingReview: invoices.filter((i) => i.status === 'PENDING_REVIEW').length,
    confirmedToday: invoices.filter((i) => i.status === 'CONFIRMED').length,
    sentThisMonth: invoices.filter((i) => i.status === 'SENT').length,
    totalBilledThisMonth: invoices
      .filter((i) => ['CONFIRMED', 'SENT'].includes(i.status))
      .reduce((s, i) => s + Number(i.totalAmount), 0),
    unprocessedResponses: 0,
    openInvoices: invoices.filter((i) => ['DRAFT', 'PENDING_REVIEW'].includes(i.status)).length,
    confirmed: invoices.filter((i) => i.status === 'CONFIRMED').length,
    sent: invoices.filter((i) => i.status === 'SENT').length,
    rejected: invoices.filter((i) => i.status === 'REJECTED').length,
  };
}

// ── Public API (same shape as real client) ────────────────────────────────────

export const api = {
  // Haiguslood — not used in proto (Dashboard removed), but keep stubs
  getHaiguslood: async (_params?: { status?: string; hasUnprocessed?: boolean }): Promise<Haiguslugu[]> => {
    await delay();
    return [];
  },

  getHaiguslugu: async (id: string): Promise<Haiguslugu> => {
    await delay();
    return { id, haigusjuhtumiNr: 'HB-0000', patientCode: '', patientName: '', status: 'OPEN', openedAt: '', isDemo: true } as Haiguslugu;
  },

  createDemoHaiguslugu: async (_body: DemoHaigusluguBody): Promise<Haiguslugu> => {
    await delay();
    return { id: 'demo', haigusjuhtumiNr: 'HB-DEMO', patientCode: '', patientName: '', status: 'OPEN', openedAt: '', isDemo: true } as Haiguslugu;
  },

  // Saatekirjad — PDF links return '#' in proto
  getPdfUrl: (_saatekirjaId: string) => '#',

  processSaatekiri: async (_saatekirjaId: string): Promise<Invoice> => {
    await delay();
    return invoices[0];
  },

  reprocessSaatekiri: async (_saatekirjaId: string): Promise<Invoice> => {
    await delay();
    return invoices[0];
  },

  // ── Invoices ──────────────────────────────────────────────────────────────

  getInvoices: async (params?: InvoiceListParams): Promise<Invoice[]> => {
    await delay();
    let result = [...invoices];
    if (params?.status) {
      result = result.filter((i) => i.status === params.status);
    }
    if (params?.dateFrom) {
      const from = new Date(params.dateFrom);
      result = result.filter((i) => new Date(i.visitDate) >= from);
    }
    if (params?.dateTo) {
      const to = new Date(params.dateTo);
      result = result.filter((i) => new Date(i.visitDate) <= to);
    }
    return result;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    await delay();
    const inv = findInvoice(id);
    if (!inv) throw new Error('Arvet ei leitud');
    return JSON.parse(JSON.stringify(inv));
  },

  addLine: async (invoiceId: string, body: AddLineBody): Promise<Invoice> => {
    await delay();
    const inv = findInvoice(invoiceId);
    if (!inv) throw new Error('Arvet ei leitud');

    const ttl = ttlCodes.find((c) => c.code === body.ttlCode);
    if (!ttl) throw new Error('TTL kood ei leitud');

    const PARTNERS = ['Synlab', 'Tartu Ülikooli Kliinikum', 'Confido'];
    const newLine = {
      id: `line-auto-${++nextLineId}`,
      invoiceId,
      ttlCode: ttl.code,
      ttlName: ttl.nameEt,
      isBillable: ttl.isBillable,
      price: ttl.priceLimit,
      quantity: body.quantity,
      serviceDate: body.serviceDate,
      sourceRef: null,
      aiRationale: null,
      confidence: null,
      addedBy: 'USER',
      partnerName: PARTNERS[Math.floor(Math.random() * PARTNERS.length)],
      createdAt: new Date().toISOString(),
    };

    inv.lines.push(newLine as any);
    recalcTotal(inv);

    inv.auditEvents.push({
      id: `evt-auto-${++nextEventId}`,
      invoiceId,
      actor: '48001010000',
      action: 'LINE_ADDED',
      payload: { ttlCode: body.ttlCode },
      createdAt: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(inv));
  },

  removeLine: async (invoiceId: string, lineId: string): Promise<Invoice> => {
    await delay();
    const inv = findInvoice(invoiceId);
    if (!inv) throw new Error('Arvet ei leitud');

    inv.lines = inv.lines.filter((l) => l.id !== lineId);
    recalcTotal(inv);

    inv.auditEvents.push({
      id: `evt-auto-${++nextEventId}`,
      invoiceId,
      actor: '48001010000',
      action: 'LINE_REMOVED',
      payload: { lineId },
      createdAt: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(inv));
  },

  deleteInvoice: async (invoiceId: string): Promise<void> => {
    await delay();
    invoices = invoices.filter((i) => i.id !== invoiceId);
  },

  confirmInvoice: async (invoiceId: string): Promise<Invoice> => {
    await delay();
    const inv = findInvoice(invoiceId);
    if (!inv) throw new Error('Arvet ei leitud');
    inv.status = 'CONFIRMED';
    inv.confirmedAt = new Date().toISOString();
    inv.updatedAt = new Date().toISOString();

    inv.auditEvents.push({
      id: `evt-auto-${++nextEventId}`,
      invoiceId,
      actor: '48001010000',
      action: 'CONFIRMED',
      payload: null,
      createdAt: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(inv));
  },

  sendInvoice: async (invoiceId: string): Promise<Invoice> => {
    await delay();
    const inv = findInvoice(invoiceId);
    if (!inv) throw new Error('Arvet ei leitud');
    inv.status = 'SENT';
    inv.sentAt = new Date().toISOString();
    inv.updatedAt = new Date().toISOString();

    inv.auditEvents.push({
      id: `evt-auto-${++nextEventId}`,
      invoiceId,
      actor: '48001010000',
      action: 'SENT',
      payload: null,
      createdAt: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(inv));
  },

  getInvoicePdfUrl: (_invoiceId: string) => '#',

  // ── TTL Codes ─────────────────────────────────────────────────────────────

  getTtlCodes: async (): Promise<TtlCode[]> => {
    await delay();
    return ttlCodes;
  },

  syncTtl: async (): Promise<{ added: number; updated: number }> => {
    await delay();
    return { added: 0, updated: 0 };
  },

  // ── Stats ─────────────────────────────────────────────────────────────────

  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay();
    return computeStats();
  },

  // ── Partner invoices ──────────────────────────────────────────────────────

  getPartnerInvoices: async (): Promise<PartnerInvoice[]> => {
    await delay();
    return [];
  },

  getPartnerInvoice: async (_id: string): Promise<PartnerInvoice> => {
    await delay();
    throw new Error('Not used in proto');
  },

  uploadPartnerInvoice: async (_formData: FormData): Promise<PartnerInvoice> => {
    await delay();
    throw new Error('Not used in proto');
  },

  // Partner comparison — returns our system's lines grouped by code for a partner
  getLinesByPartner: async (params: { partner: string; dateFrom?: string; dateTo?: string }): Promise<PartnerLineGroup[]> => {
    await delay();
    const allLines = invoices.flatMap((inv) => inv.lines);
    const filtered = allLines.filter((l) => {
      if (l.partnerName !== params.partner) return false;
      if (params.dateFrom && new Date(l.serviceDate) < new Date(params.dateFrom)) return false;
      if (params.dateTo && new Date(l.serviceDate) > new Date(params.dateTo)) return false;
      return true;
    });

    // Group by ttlCode
    const map = new Map<string, { ttlName: string; qty: number; count: number }>();
    for (const line of filtered) {
      const existing = map.get(line.ttlCode);
      if (existing) {
        existing.qty += line.quantity;
        existing.count++;
      } else {
        map.set(line.ttlCode, { ttlName: line.ttlName, qty: line.quantity, count: 1 });
      }
    }

    return Array.from(map.entries()).map(([code, data]) => ({
      ttlCode: code,
      ttlName: data.ttlName,
      _sum: { quantity: data.qty },
      _count: { id: data.count },
    }));
  },

  // Mock file parsing — returns pre-built data for the selected partner.
  // The PartnerInvoices page sets window.__selectedPartner before calling this.
  parsePartnerFile: async (_file: File, type: 'invoice' | 'lisa'): Promise<{ lines?: ParsedPartnerLine[]; entries?: LisaEntry[] }> => {
    await delay(500);

    const partner = (window as any).__selectedPartner ?? 'Synlab';
    const data = (partnerParsedData as any)[partner];

    if (!data) {
      return type === 'lisa' ? { entries: [] } : { lines: [] };
    }

    if (type === 'lisa') {
      return { entries: data.lisa ?? [] };
    }
    return { lines: data.lines ?? [] };
  },
};
