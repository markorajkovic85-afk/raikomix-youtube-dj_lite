import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import RootErrorBoundary from './components/RootErrorBoundary';

const App = React.lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
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

window.onYouTubeIframeAPIReady = () => {
  console.log('YouTube IFrame API Ready');
  window.dispatchEvent(new CustomEvent('youtube-api-ready'));
};
