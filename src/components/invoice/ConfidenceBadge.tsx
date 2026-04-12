import { StatusBadge } from "@tehik-ee/tedi-react/tedi";

const map = {
  high:   { label: 'kõrge',    color: 'success' },
  medium: { label: 'keskmine', color: 'warning' },
  low:    { label: 'madal',    color: 'danger' },
} as const;

interface ConfidenceBadgeProps {
  confidence?: string | null;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  if (!confidence || !(confidence in map)) return null;
  const { label, color } = map[confidence as keyof typeof map];
  return <StatusBadge color={color}>{label}</StatusBadge>;
}
