import { useState } from "react";
import type { AuditEvent } from "../../types";

interface AuditTrailProps {
  events: AuditEvent[];
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function AuditTrail({ events }: AuditTrailProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: 'var(--spacing-lg, 24px)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-primary, #0066cc)',
          fontSize: '0.95rem',
          padding: 'var(--spacing-xs, 4px) 0',
          fontWeight: 600,
        }}
      >
        Ajalugu {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <div
          style={{
            marginTop: 'var(--spacing-sm, 8px)',
            borderLeft: '2px solid var(--color-border, #e0e0e0)',
            paddingLeft: 'var(--spacing-md, 16px)',
          }}
        >
          {events.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary, #666)', fontSize: '0.875rem' }}>
              Sündmusi pole.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm, 8px)' }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-md, 16px)',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: 'var(--color-success, #2e7d32)' }}>✓</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, minWidth: '160px' }}>
                    {event.action}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary, #666)', minWidth: '120px' }}>
                    {event.actor}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary, #666)' }}>
                    {formatDateTime(event.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
