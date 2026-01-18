
import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
}

class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('RootErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center text-[#D0BCFF] p-8 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em]">Render Recovery</h1>
            <p className="text-sm text-white/70">
              The interface failed to load. Please refresh the page or try again.
            </p>
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

// Mount immediately to ensure visibility
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);

// Global callback for YouTube API
window.onYouTubeIframeAPIReady = () => {
  console.log('YouTube IFrame API Ready');
  // Dispatch a custom event so App can respond if needed
  window.dispatchEvent(new CustomEvent('youtube-api-ready'));
};
