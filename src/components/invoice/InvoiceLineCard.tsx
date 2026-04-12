import { Card, Button } from "@tehik-ee/tedi-react/tedi";
import type { InvoiceLine } from "../../types";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface InvoiceLineCardProps {
  line: InvoiceLine;
  isEditable: boolean;
  onRemove: (lineId: string) => void;
}

export function InvoiceLineCard({ line, isEditable, onRemove }: InvoiceLineCardProps) {
  return (
    <Card style={{ marginBottom: 'var(--spacing-sm, 8px)', padding: 'var(--spacing-md, 16px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md, 16px)' }}>
        {/* Checkbox */}
        <div style={{ paddingTop: '2px' }}>
          <input
            type="checkbox"
            defaultChecked
            disabled={!isEditable}
            onChange={(e) => {
              if (!e.target.checked) {
                onRemove(line.id);
              }
            }}
            style={{ width: '16px', height: '16px', cursor: isEditable ? 'pointer' : 'default' }}
          />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Top row: code, name, badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 8px)', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}>
              {line.ttlCode}
            </span>
            <span style={{ fontWeight: 600 }}>{line.ttlName}</span>
            <ConfidenceBadge confidence={line.confidence} />
            {line.isBillable ? (
              <span
                style={{
                  background: 'var(--color-primary, #0066cc)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 500,
                }}
              >
                tasuline
              </span>
            ) : (
              <span
                style={{
                  border: '1px solid var(--color-text-secondary, #666)',
                  color: 'var(--color-text-secondary, #666)',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                0€
              </span>
            )}
          </div>

          {/* AI rationale */}
          {line.aiRationale && (
            <p style={{ margin: '4px 0', fontSize: '0.875rem', color: 'var(--color-text-secondary, #555)' }}>
              {line.aiRationale}
            </p>
          )}

          {/* Source ref */}
          {line.sourceRef && (
            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary, #777)', fontStyle: 'italic' }}>
              📄 {line.sourceRef}
            </p>
          )}
        </div>

        {/* Right side: price + remove */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs, 4px)', flexShrink: 0 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: line.isBillable
                ? 'var(--color-success, #2e7d32)'
                : 'var(--color-text-secondary, #888)',
            }}
          >
            {line.isBillable ? `${Number(line.price).toFixed(2)} €` : '0 €'}
          </span>
          {isEditable && (
            <Button
              color="danger"
              size="small"
              onClick={() => onRemove(line.id)}
            >
              Eemalda ×
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
