import { Link } from "react-router-dom";
import { StatusBadge, Button, Spinner } from "@tehik-ee/tedi-react/tedi";
import type { Saatekiri } from "../../types";
import { api } from "../../api/client";

interface SaatekirjaRowProps {
  saatekiri: Saatekiri;
  onProcess: (id: string) => void;
  isProcessing: boolean;
}

const statusConfig = {
  OPEN:              { label: 'Avatud',            color: 'neutral' },
  RESPONSE_RECEIVED: { label: 'Vastus saabunud',   color: 'warning' },
  PROCESSED:         { label: 'Töödeldud',          color: 'success' },
} as const;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function SaatekirjaRow({ saatekiri, onProcess, isProcessing }: SaatekirjaRowProps) {
  const config = statusConfig[saatekiri.status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md, 16px)',
        padding: 'var(--spacing-sm, 8px) 0',
        borderBottom: '1px solid var(--color-border, #e0e0e0)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', minWidth: '160px' }}>
        Väljastatud: {formatDate(saatekiri.issuedAt)}
      </span>

      <StatusBadge color={config.color}>{config.label}</StatusBadge>

      {saatekiri.responsePdfPath && (
        <a
          href={api.getPdfUrl(saatekiri.id)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.875rem', color: 'var(--color-primary, #0066cc)', textDecoration: 'none' }}
        >
          Vaata PDF ↗
        </a>
      )}

      {saatekiri.status === 'RESPONSE_RECEIVED' && (
        <Button
          visualType="primary"
          size="small"
          disabled={isProcessing}
          onClick={() => onProcess(saatekiri.id)}
        >
          {isProcessing ? <Spinner label="Töötlen..." /> : 'Töötle'}
        </Button>
      )}

      {saatekiri.status === 'PROCESSED' && saatekiri.invoice?.id && (
        <Link
          to={`/invoices/${saatekiri.invoice.id}`}
          style={{ fontSize: '0.875rem', color: 'var(--color-primary, #0066cc)', textDecoration: 'none' }}
        >
          Vaata arvet →
        </Link>
      )}
    </div>
  );
}
