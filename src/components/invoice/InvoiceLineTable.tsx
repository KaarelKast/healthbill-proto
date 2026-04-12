import type { InvoiceLine } from "../../types";

interface InvoiceLineTableProps {
  lines: InvoiceLine[];
  isEditable: boolean;
  onRemove: (lineId: string) => void;
}

export function InvoiceLineTable({ lines, isEditable, onRemove }: InvoiceLineTableProps) {
  if (lines.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem' }}>
        Arve ridu pole.
      </p>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--color-border, #e0e0e0)', textAlign: 'left' }}>
          <th style={thStyle}>Kood</th>
          <th style={thStyle}>Nimetus</th>
          <th style={{ ...thStyle, textAlign: 'center' }}>Kogus</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Hind</th>
          <th style={thStyle}></th>
          <th style={{ ...thStyle, textAlign: 'center' }}>Allikas</th>
          {isEditable && <th style={thStyle}></th>}
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr
            key={line.id}
            style={{ borderBottom: '1px solid var(--color-border, #f0f0f0)' }}
          >
            <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600 }}>
              {line.ttlCode}
            </td>
            <td style={tdStyle}>
              {line.ttlName}
            </td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>{line.quantity}</td>
            <td
              style={{
                ...tdStyle,
                textAlign: 'right',
                fontWeight: 600,
                color: line.isBillable ? 'var(--color-success, #2e7d32)' : 'var(--color-text-secondary, #888)',
              }}
            >
              {line.isBillable ? `${Number(line.price).toFixed(2)} €` : '0 €'}
            </td>
            <td style={tdStyle}>
              {line.isBillable ? (
                <span style={billableBadge}>tasuline</span>
              ) : (
                <span style={freeBadge}>tasuta</span>
              )}
            </td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>
              {(line.sourceRef || line.aiRationale) && (
                <span
                  title={[line.aiRationale, line.sourceRef ? `Allikas: ${line.sourceRef}` : ''].filter(Boolean).join('\n')}
                  style={infoIconStyle}
                >
                  ℹ
                </span>
              )}
            </td>
            {isEditable && (
              <td style={tdStyle}>
                <button
                  onClick={() => onRemove(line.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error, #c62828)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: '2px 6px',
                  }}
                >
                  Eemalda
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const thStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary, #666)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '0.875rem',
};

const billableBadge: React.CSSProperties = {
  background: 'var(--color-primary, #0066cc)',
  color: 'white',
  fontSize: '0.7rem',
  padding: '2px 8px',
  borderRadius: '12px',
  fontWeight: 500,
};

const freeBadge: React.CSSProperties = {
  border: '1px solid var(--color-text-secondary, #999)',
  color: 'var(--color-text-secondary, #999)',
  fontSize: '0.7rem',
  padding: '2px 8px',
  borderRadius: '12px',
};

const infoIconStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: 'var(--color-primary-light, #e3f0ff)',
  color: 'var(--color-primary, #0066cc)',
  fontSize: '0.75rem',
  cursor: 'help',
  fontStyle: 'normal',
};
