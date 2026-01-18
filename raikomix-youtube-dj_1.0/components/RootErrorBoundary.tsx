import React, { Component, ReactNode } from 'react';

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

export default RootErrorBoundary;
