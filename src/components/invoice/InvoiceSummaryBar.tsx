import { Button, Spinner } from "@tehik-ee/tedi-react/tedi";
import type { Invoice } from "../../types";

interface InvoiceSummaryBarProps {
  invoice: Invoice;
  onConfirm: () => void;
  onConfirmAndSend: () => void;
  onSend: () => void;
  isConfirming: boolean;
  isSending: boolean;
}

export function InvoiceSummaryBar({
  invoice,
  onConfirmAndSend,
  isConfirming,
  isSending,
}: InvoiceSummaryBarProps) {
  const billableCount = invoice.lines.filter((l) => l.isBillable).length;
  const freeCount = invoice.lines.filter((l) => !l.isBillable).length;
  const total = Number(invoice.totalAmount).toFixed(2);

  const summaryText = `${billableCount} koodi · ${total} €${freeCount > 0 ? ` (${freeCount} 0€ arverida)` : ''}`;

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        background: 'var(--color-primary-dark, #1a3a5c)',
        color: 'white',
        padding: 'var(--spacing-md, 16px) var(--spacing-lg, 24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md, 16px)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Left: summary */}
      <span style={{ fontSize: '1rem', fontWeight: 500 }}>{summaryText}</span>

      {/* Right: actions based on status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 8px)' }}>
        {invoice.status === 'PENDING_REVIEW' && (
          <Button visualType="primary" onClick={onConfirmAndSend} disabled={isConfirming || isSending}>
            {isConfirming || isSending ? <Spinner label="Kinnitamine..." /> : 'Kinnita ja saada'}
          </Button>
        )}

        {(invoice.status === 'CONFIRMED' || invoice.status === 'SENT') && (
          <>
            <span style={{ color: 'var(--color-success, #4caf50)', fontWeight: 700 }}>Kinnitatud ✓</span>
            {/* <a
              href={api.getInvoicePdfUrl(invoice.id)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              Ekspordi PDF ↗
            </a> */}
          </>
        )}

        {invoice.status === 'REJECTED' && (
          <Button visualType="primary" onClick={onConfirmAndSend} disabled={isConfirming}>
            {isConfirming ? <Spinner label="Kinnitamine..." /> : 'Kinnita uuesti'}
          </Button>
        )}
      </div>
    </div>
  );
}
