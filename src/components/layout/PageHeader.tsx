import React from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to: string }[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, action }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 'var(--spacing-lg, 24px)' }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #666)',
            marginBottom: 'var(--spacing-sm, 8px)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb.to}>
              {i > 0 && <span>›</span>}
              <Link
                to={crumb.to}
                style={{ color: 'var(--color-primary, #0066cc)', textDecoration: 'none' }}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--spacing-md, 16px)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary, #111)',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <div
              style={{
                marginTop: 'var(--spacing-xs, 4px)',
                color: 'var(--color-text-secondary, #666)',
                fontSize: '0.95rem',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>
      <hr
        style={{
          marginTop: 'var(--spacing-md, 16px)',
          border: 'none',
          borderTop: '1px solid var(--color-border, #e0e0e0)',
        }}
      />
    </div>
  );
}
