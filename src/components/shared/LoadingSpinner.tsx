import { Spinner } from "@tehik-ee/tedi-react/tedi";

interface LoadingSpinnerProps {
  label?: string;  // optional accessible label
}

export function LoadingSpinner({ label = 'Laadin...' }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-xl)' }}>
      <Spinner label={label} />
    </div>
  );
}
