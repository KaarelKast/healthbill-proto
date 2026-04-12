import { Component, ReactNode } from 'react';
import { Alert } from '@tehik-ee/tedi-react/tedi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem' }}>
          <Alert type="danger">
            <strong>Rakenduse viga:</strong> {this.state.message}
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}
