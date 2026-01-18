import React, { ReactNode } from 'react';

interface MobileLandscapeLayoutProps {
  deckA: ReactNode;
  deckB: ReactNode;
  mixer: ReactNode;
  sheetOpen: boolean;
  sheetTab: 'LIBRARY' | 'QUEUE';
  onSheetTabChange: (tab: 'LIBRARY' | 'QUEUE') => void;
  onSheetToggle: (open: boolean) => void;
  sheetExpanded: boolean;
  onSheetExpandedToggle: () => void;
  libraryPanel: ReactNode;
  queuePanel: ReactNode;
  effectsPanel: ReactNode;
  effectsOpen: boolean;
  onEffectsToggle: (open: boolean) => void;
  utilityBar?: ReactNode;
}

const MobileLandscapeLayout: React.FC<MobileLandscapeLayoutProps> = ({
  deckA,
  deckB,
  mixer,
  sheetOpen,
  sheetTab,
  onSheetTabChange,
  onSheetToggle,
  sheetExpanded,
  onSheetExpandedToggle,
  libraryPanel,
  queuePanel,
  effectsPanel,
  effectsOpen,
  onEffectsToggle,
  utilityBar
}) => {
  return (
    <div className="mobile-layout" id="main-content">
      {/* Mobile landscape: dual decks with center mixer, bottom sheet for library/queue, side drawer for effects. */}
      <header className="mobile-header">
        <div className="mobile-actions">
          <button
            type="button"
            onClick={() => onSheetToggle(!sheetOpen)}
            className="panel-trigger m3-touch touch-target"
            aria-expanded={sheetOpen}
          >
            <span className="material-icons text-base">queue_music</span>
            Library / Queue
          </button>
          <button
            type="button"
            onClick={() => onEffectsToggle(!effectsOpen)}
            className="panel-trigger m3-touch touch-target"
            aria-expanded={effectsOpen}
          >
            <span className="material-icons text-base">tune</span>
            FX
          </button>
        </div>
        {utilityBar}
      </header>

      <div className="landscape-grid">
        <div className="deck-slot">{deckA}</div>
        <div className="mixer-column">{mixer}</div>
        <div className="deck-slot">{deckB}</div>
      </div>

      {sheetOpen && (
        <div className="panel-sheet elevation-4" data-expanded={sheetExpanded} role="dialog" aria-label="Library and queue">
          <div className="panel-sheet__header">
            <div className="panel-sheet__tabs">
              {(['LIBRARY', 'QUEUE'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSheetTabChange(tab)}
                  className={`panel-tab m3-touch touch-target ${sheetTab === tab ? 'is-active' : ''}`}
                  aria-pressed={sheetTab === tab}
                >
                  {tab === 'LIBRARY' ? 'Library' : 'Queue'}
                </button>
              ))}
            </div>
            <div className="panel-sheet__actions">
              <button
                type="button"
                onClick={onSheetExpandedToggle}
                className="utility-button m3-touch touch-target"
                aria-label={sheetExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                <span className="material-icons text-base">{sheetExpanded ? 'expand_more' : 'expand_less'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSheetToggle(false)}
                className="utility-button m3-touch touch-target"
                aria-label="Close panel"
              >
                <span className="material-icons text-base">close</span>
              </button>
            </div>
          </div>
          <div className="panel-sheet__body">
            <div className={`panel-sheet__panel ${sheetTab === 'LIBRARY' ? '' : 'is-hidden'}`}>
              {libraryPanel}
            </div>
            <div className={`panel-sheet__panel ${sheetTab === 'QUEUE' ? '' : 'is-hidden'}`}>
              {queuePanel}
            </div>
          </div>
        </div>
      )}

      <aside className="panel-drawer layout-panel layout-panel--raised" data-open={effectsOpen} aria-hidden={!effectsOpen}>
        <div className="panel-drawer__header">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Effects</span>
          <button
            type="button"
            onClick={() => onEffectsToggle(false)}
            className="utility-button m3-touch touch-target"
            aria-label="Close effects"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>
        <div className="panel-drawer__body">{effectsPanel}</div>
      </aside>
    </div>
  );
};

export default MobileLandscapeLayout;
