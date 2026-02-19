import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020617',
          color: '#f1f5f9',
          padding: '20px',
          textAlign: 'center'
        }}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" style={{ marginBottom: '24px' }}>
            <circle cx="50" cy="50" r="45" stroke="#d4af37" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="50" r="8" fill="#d4af37"/>
          </svg>
          <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#d4af37' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
            Please refresh the page to try again
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#d4af37',
              color: '#020617',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
