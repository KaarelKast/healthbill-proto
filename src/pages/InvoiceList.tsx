import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@tehik-ee/tedi-react/tedi";
import { useInvoices } from "../hooks/useInvoice";
import { useStats } from "../hooks/useStats";
import { InvoiceStatusBadge } from "../components/invoice/InvoiceStatusBadge";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import PageHeader from "../components/layout/PageHeader";
import type { InvoiceStatus } from "../types";

const tabs = [
  { key: 'all',       label: 'Kõik' },
  { key: 'pending',   label: 'Kinnituse ootel' },
  { key: 'confirmed', label: 'Kinnitatud' },
  { key: 'rejected',  label: 'Tagasi lükatud' },
];

const statusMap: Record<string, InvoiceStatus | undefined> = {
  all:       undefined,
  pending:   'PENDING_REVIEW',
  confirmed: 'CONFIRMED',
  rejected:  'REJECTED',
};

const emptyMessages: Record<string, string> = {
  all:       'Ühtegi arvet pole veel loodud.',
  pending:   'Kõik arved on kinnitatud.',
  confirmed: 'Kinnitatud arveid pole.',
  rejected:  'Tagasi lükatud arveid pole.',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function InvoiceList() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [openerFilter, setOpenerFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const status = statusMap[activeTab];
  const { data: invoices, isLoading, isError } = useInvoices({
    status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const { data: stats } = useStats();

  // Collect unique opener names for filter dropdown
  const openerOptions = useMemo(() => {
    if (!invoices) return [];
    const names = Array.from(new Set(invoices.map((inv) => inv.createdByName).filter(Boolean))) as string[];
    return names;
  }, [invoices]);

  // Apply opener filter
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    if (openerFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.createdByName === openerFilter);
  }, [invoices, openerFilter]);

  const statCards = [
    { label: 'Kinnituse ootel', value: stats?.pendingReview ?? '—', color: '#e65100' },
    { label: 'Kinnitatud',      value: stats?.confirmed ?? '—',     color: '#2e7d32' },
    { label: 'Tagasi lükatud',  value: stats?.rejected ?? '—',      color: '#c62828' },
  ];

  return (
    <div>
      <PageHeader title="Raviarved" />

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--spacing-md, 16px)',
          marginBottom: 'var(--spacing-lg, 24px)',
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: 'white',
              border: `1px solid var(--color-border, #e0e0e0)`,
              borderLeft: `4px solid ${card.color}`,
              borderRadius: '8px',
              padding: 'var(--spacing-md, 16px) var(--spacing-lg, 24px)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #666)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md, 16px)', marginBottom: 'var(--spacing-sm, 8px)', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Arve avaja:</label>
        <select
          value={openerFilter}
          onChange={(e) => setOpenerFilter(e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid var(--color-border, #e0e0e0)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            background: 'white',
          }}
        >
          <option value="all">Kõik</option>
          {openerOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Alates:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--color-border, #e0e0e0)',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Kuni:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--color-border, #e0e0e0)',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          marginBottom: 'var(--spacing-md, 16px)',
          borderBottom: '2px solid var(--color-border, #e0e0e0)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: 'var(--spacing-sm, 8px) var(--spacing-md, 16px)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? 'var(--color-primary, #0066cc)' : 'var(--color-text-secondary, #666)',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-primary, #0066cc)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <Alert type="danger">Andmete laadimine ebaõnnestus. Palun värskenda lehte.</Alert>
      ) : !filteredInvoices || filteredInvoices.length === 0 ? (
        <Alert type="info">{emptyMessages[activeTab]}</Alert>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border, #e0e0e0)', textAlign: 'left' }}>
              {['Patsient', 'Kuupäev', 'Haiguslugu', 'Arve avaja', 'Summa', 'Olek', ''].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary, #666)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                style={{ borderBottom: '1px solid var(--color-border, #e0e0e0)' }}
              >
                <td style={{ padding: '10px 12px', fontSize: '0.875rem' }}>{invoice.patientName}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.875rem' }}>{formatDate(invoice.visitDate)}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.875rem', fontFamily: 'monospace' }}>{invoice.haigusjuhtumiNr}</td>
                <td style={{ padding: '10px 12px', fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)' }}>
                  {invoice.createdByName ?? '—'}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '0.875rem', fontWeight: 600 }}>
                  {Number(invoice.totalAmount).toFixed(2)} €
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <Link
                    to={`/invoices/${invoice.id}`}
                    style={{ color: 'var(--color-primary, #0066cc)', textDecoration: 'none', fontSize: '0.875rem' }}
                  >
                    Vaata →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
