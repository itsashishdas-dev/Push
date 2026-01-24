import React, { ErrorInfo, ReactNode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare props to satisfy TypeScript in strict environments
  declare props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 20 }}>System Failure</h1>
          <p style={{ color: '#aaa', maxWidth: 400 }}>The PUSH network encountered a critical runtime error.</p>
          <pre style={{ marginTop: 20, padding: 15, backgroundColor: '#111', borderRadius: 8, textAlign: 'left', overflow: 'auto', maxWidth: '90vw', color: '#f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: 30, padding: '12px 24px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);