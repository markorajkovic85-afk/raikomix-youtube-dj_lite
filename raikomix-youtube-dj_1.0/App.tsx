import React, { Component, ReactNode } from 'react';
import DesktopApp from './components/desktop/DesktopApp';
import MobileApp from './components/mobile/MobileApp';
import Toast from './components/shared/Toast';
import { DeckProvider } from './contexts/DeckContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { MixerProvider } from './contexts/MixerContext';
import { UIProvider, useUI } from './contexts/UIContext';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) return (
      <div className="h-screen bg-black flex items-center justify-center text-[#D0BCFF] p-10 text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">System Critical</h1>
          <p className="mb-6 opacity-60">The DJ Engine encountered a memory fault. Re-initializing the console.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-[#D0BCFF] text-black font-black rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(208,188,255,0.4)]"
          >
            REBOOT CONSOLE
          </button>
        </div>
      </div>
    );
    return children;
  }
}

const AppContent: React.FC = () => {
  const { isMobile, toast, clearToast } = useUI();

  return (
    <div className="min-h-screen bg-[#111016]">
      {isMobile ? <MobileApp /> : <DesktopApp />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <UIProvider>
      <DeckProvider>
        <MixerProvider>
          <LibraryProvider>
            <AppContent />
          </LibraryProvider>
        </MixerProvider>
      </DeckProvider>
    </UIProvider>
  </ErrorBoundary>
);

export default App;
