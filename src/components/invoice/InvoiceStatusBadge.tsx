import { StatusBadge } from "@tehik-ee/tedi-react/tedi";
import type { InvoiceStatus } from "../../types";

const statusMap = {
  DRAFT:          { label: 'Mustand',          color: 'neutral' },
  PENDING_REVIEW: { label: 'Ootel',            color: 'warning' },
  CONFIRMED:      { label: 'Kinnitatud',        color: 'success' },
  SENT:           { label: 'Kinnitatud',        color: 'success' },
  ACCEPTED:       { label: 'Vastu võetud',      color: 'success' },
  REJECTED:       { label: 'Tagasi lükatud',    color: 'danger' },
  CANCELLED:      { label: 'Tühistatud',        color: 'neutral' },
} as const;

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusMap[status];
  if (!config) return null;
  return <StatusBadge color={config.color}>{config.label}</StatusBadge>;
}
