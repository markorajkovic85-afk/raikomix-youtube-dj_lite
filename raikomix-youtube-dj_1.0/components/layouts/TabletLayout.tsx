import React, { ReactNode } from 'react';

interface TabletLayoutProps {
  deckA: ReactNode;
  deckB: ReactNode;
  mixer: ReactNode;
  libraryPanel: ReactNode;
  queuePanel: ReactNode;
  effectsPanel: ReactNode;
  panelTab: 'LIBRARY' | 'QUEUE';
  onPanelTabChange: (tab: 'LIBRARY' | 'QUEUE') => void;
  effectsCollapsed: boolean;
  onEffectsCollapseToggle: () => void;
  utilityBar?: ReactNode;
}

const TabletLayout: React.FC<TabletLayoutProps> = ({
  deckA,
  deckB,
  mixer,
  libraryPanel,
  queuePanel,
  effectsPanel,
  panelTab,
  onPanelTabChange,
  effectsCollapsed,
  onEffectsCollapseToggle,
  utilityBar
}) => {
  return (
    <div className="tablet-layout" id="main-content">
      {/* Tablet: left library/queue tabs, center decks + mixer, right persistent effects sidebar. */}
      <div className="tablet-grid">
        <section className="tablet-panel layout-panel layout-panel--raised">
          <header className="panel-sheet__header">
            <div className="panel-sheet__tabs">
              {(['LIBRARY', 'QUEUE'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onPanelTabChange(tab)}
                  className={`panel-tab m3-touch touch-target ${panelTab === tab ? 'is-active' : ''}`}
                  aria-pressed={panelTab === tab}
                >
                  {tab === 'LIBRARY' ? 'Library' : 'Queue'}
                </button>
              ))}
            </div>
            {utilityBar}
          </header>
          <div className="panel-sheet__body">
            <div className={`panel-sheet__panel ${panelTab === 'LIBRARY' ? '' : 'is-hidden'}`}>
              {libraryPanel}
            </div>
            <div className={`panel-sheet__panel ${panelTab === 'QUEUE' ? '' : 'is-hidden'}`}>
              {queuePanel}
            </div>
          </div>
        </section>

        <section className="tablet-center">
          <div className="tablet-decks">
            <div className="deck-slot">{deckA}</div>
            <div className="mixer-column">{mixer}</div>
            <div className="deck-slot">{deckB}</div>
          </div>
        </section>

        <aside
          className={`tablet-panel layout-panel layout-panel--raised tablet-effects ${effectsCollapsed ? 'is-collapsed' : ''}`}
          aria-hidden={effectsCollapsed}
        >
          <div className="panel-drawer__header">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Effects</span>
            <button
              type="button"
              onClick={onEffectsCollapseToggle}
              className="utility-button m3-touch touch-target"
              aria-label={effectsCollapsed ? 'Expand effects' : 'Collapse effects'}
            >
              <span className="material-icons text-base">{effectsCollapsed ? 'chevron_left' : 'chevron_right'}</span>
            </button>
          </div>
          <div className="panel-drawer__body tablet-effects__body">{effectsPanel}</div>
        </aside>
      </div>
    </div>
  );
};

export default TabletLayout;
