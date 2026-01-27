
import React, { ErrorInfo, ReactNode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SkaterGame from './components/SkaterGame.tsx';

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
        <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, textAlign: 'left', zIndex: 10 }}>
             <h1 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 5 }}>System Offline</h1>
             <p style={{ color: '#666', fontSize: '0.7rem', fontFamily: 'monospace' }}>CONNECTION_LOST // ERR_NETWORK_FAILURE</p>
          </div>
          
          <SkaterGame />

          <div style={{ position: 'absolute', bottom: 30, width: '100%', display: 'flex', justifyContent: 'center', gap: 10 }}>
             <button 
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Reconnect
              </button>
          </div>
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
