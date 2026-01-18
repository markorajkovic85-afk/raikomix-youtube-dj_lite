
import React, { Component, ReactNode, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

const App = React.lazy(() => import('./App'));

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error);
    console.error('RootErrorBoundary stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div className="h-screen bg-black flex items-center justify-center text-[#D0BCFF] p-8 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Render Recovery</h1>
            <p className="text-sm text-white/70">
              The interface failed to load. Please refresh the page or try again.
            </p>
            {error && (
              <pre className="text-left text-xs text-white/70 bg-black/40 border border-white/10 rounded-lg p-3 overflow-auto max-h-40">
                {error.message}
                {error.stack ? `\n${error.stack}` : ''}
              </pre>
            )}
            {errorInfo?.componentStack && (
              <pre className="text-left text-[10px] text-white/50 bg-black/40 border border-white/10 rounded-lg p-3 overflow-auto max-h-32">
                {errorInfo.componentStack}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#D0BCFF] text-black font-black rounded-full"
            >
              Reload App
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

const root = ReactDOM.createRoot(rootElement);

const renderBootstrapError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Bootstrap error:', error);
  rootElement.innerHTML = `
    <div style="min-height:100vh;background:#000;color:#D0BCFF;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;">
      <div style="max-width:480px;">
        <h1 style="font-size:20px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;">Bootstrap Error</h1>
        <p style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:12px;">${message}</p>
        <button style="margin-top:16px;padding:10px 18px;border-radius:999px;border:none;background:#D0BCFF;color:#1C1B1F;font-weight:700;cursor:pointer;" onclick="window.location.reload()">Reload App</button>
      </div>
    </div>
  `;
};

window.addEventListener('error', (event) => {
  renderBootstrapError(event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  renderBootstrapError(event.reason);
});

// Mount immediately to ensure visibility
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Suspense
        fallback={
          <div className="h-screen bg-black flex items-center justify-center text-[#D0BCFF]">
            <span className="text-sm uppercase tracking-[0.3em]">Loading…</span>
          </div>
        }
      >
        <App />
      </Suspense>
    </RootErrorBoundary>
  </React.StrictMode>
);

// Global callback for YouTube API
window.onYouTubeIframeAPIReady = () => {
  console.log('YouTube IFrame API Ready');
  // Dispatch a custom event so App can respond if needed
  window.dispatchEvent(new CustomEvent('youtube-api-ready'));
};
