import { Alert } from "@tehik-ee/tedi-react/tedi";

interface EmptyStateProps {
  message: string;
  type?: 'info' | 'warning' | 'danger';  // default: 'info'
}

export function EmptyState({ message, type = 'info' }: EmptyStateProps) {
  return <Alert type={type}>{message}</Alert>;
}
