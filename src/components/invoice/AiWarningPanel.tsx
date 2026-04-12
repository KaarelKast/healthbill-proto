import { Alert } from "@tehik-ee/tedi-react/tedi";

interface AiWarningPanelProps {
  missingData?: string[];
  warnings?: string[];
}

export function AiWarningPanel({ missingData, warnings }: AiWarningPanelProps) {
  const hasMissing = missingData && missingData.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  if (!hasMissing && !hasWarnings) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm, 8px)', marginBottom: 'var(--spacing-md, 16px)' }}>
      {hasMissing && (
        <Alert type="info">
          <strong>🔍 Puuduvad andmed — võimalikud lisakoodid:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
            {missingData.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Alert>
      )}
      {hasWarnings && (
        <Alert type="warning">
          <strong>⚠️ Tähelepanu:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
            {warnings.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
}
