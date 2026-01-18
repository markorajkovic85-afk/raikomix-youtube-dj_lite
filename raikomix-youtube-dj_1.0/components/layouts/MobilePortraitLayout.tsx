import React, { ReactNode, useEffect, useState } from 'react';

export type MobilePanelTab = 'LIBRARY' | 'QUEUE' | 'EFFECTS';

interface MobilePortraitLayoutProps {
  deckA: ReactNode;
  deckB: ReactNode;
  mixer: ReactNode;
  deckFocus: 'A' | 'B';
  onDeckFocusChange: (deck: 'A' | 'B') => void;
  navTab: 'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER';
  onNavTabChange: (tab: 'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER') => void;
  sheetOpen: boolean;
  sheetTab: MobilePanelTab;
  onSheetTabChange: (tab: MobilePanelTab) => void;
  onSheetToggle: (open: boolean) => void;
  sheetExpanded: boolean;
  onSheetExpandedToggle: () => void;
  libraryPanel: ReactNode;
  queuePanel: ReactNode;
  effectsPanel: ReactNode;
  utilityBar?: ReactNode;
  compactMixer?: ReactNode;
}

const MobilePortraitLayout: React.FC<MobilePortraitLayoutProps> = ({
  deckA,
  deckB,
  mixer,
  deckFocus,
  onDeckFocusChange,
  navTab,
  onNavTabChange,
  sheetOpen,
  sheetTab,
  onSheetTabChange,
  onSheetToggle,
  sheetExpanded,
  onSheetExpandedToggle,
  libraryPanel,
  queuePanel,
  effectsPanel,
  utilityBar,
  compactMixer
}) => {
  const [quickMixOpen, setQuickMixOpen] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      setQuickMixOpen(false);
    }
  }, [sheetOpen]);

  return (
    <div className="mobile-layout" id="main-content">
      <header className="mobile-top-bar">
        <div>
          <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.3em]">
            RaikoMix
          </p>
          <p className="text-base font-semibold">Mobile DJ Console</p>
        </div>
        <div className="utility-bar">{utilityBar}</div>
      </header>

      <div className="mobile-main">
        <div hidden={navTab === 'MIXER'} aria-hidden={navTab === 'MIXER'}>
          <div className="deck-tabs" role="tablist" aria-label="Deck switcher">
            <button
              type="button"
              onClick={() => {
                onDeckFocusChange('A');
                onNavTabChange('DECK_A');
              }}
              className={`deck-tab m3-touch touch-target ${deckFocus === 'A' ? 'is-active' : ''}`}
              aria-pressed={deckFocus === 'A'}
            >
              Deck A
            </button>
            <button
              type="button"
              onClick={() => {
                onDeckFocusChange('B');
                onNavTabChange('DECK_B');
              }}
              className={`deck-tab m3-touch touch-target ${deckFocus === 'B' ? 'is-active' : ''}`}
              aria-pressed={deckFocus === 'B'}
            >
              Deck B
            </button>
          </div>

          <div
            className="deck-stack"
          >
            <div className={`deck-slot ${deckFocus === 'A' ? '' : 'is-hidden'}`} aria-hidden={deckFocus !== 'A'}>
              {deckA}
            </div>
            <div className={`deck-slot ${deckFocus === 'B' ? '' : 'is-hidden'}`} aria-hidden={deckFocus !== 'B'}>
              {deckB}
            </div>
          </div>
        </div>

        {navTab === 'MIXER' && (
          <section className="space-y-3" aria-label="Mixer">
            {mixer}
            <details className="collapsible-panel">
              <summary>Effects</summary>
              <div className="collapsible-content">{effectsPanel}</div>
            </details>
          </section>
        )}
      </div>

      {sheetOpen && (
        <div className="panel-sheet elevation-4" data-expanded={sheetExpanded} role="dialog" aria-label="Library and queue">
          <div className="flex justify-center pt-3">
            <div className="panel-sheet__handle" aria-hidden="true" />
          </div>
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

 {compactMixer && !sheetOpen && (
        <>
          <button
            type="button"
            className="quick-mix-fab m3-touch touch-target"
            onClick={() => setQuickMixOpen((open) => !open)}
            aria-pressed={quickMixOpen}
            aria-label={quickMixOpen ? 'Close quick mix' : 'Open quick mix'}
          >
            <span className="material-icons text-base">tune</span>
          </button>
          {quickMixOpen && (
            <div className="quick-mix-overlay" role="dialog" aria-label="Quick mix">
              <button
                type="button"
                className="quick-mix-backdrop"
                aria-label="Close quick mix"
                onClick={() => setQuickMixOpen(false)}
              />
              <div className="quick-mix-modal">
                <div className="quick-mix-header">
                  <div>
                    <p className="m3-section-title">Quick Mix</p>
                    <p className="text-xs text-white/70">Crossfader + Master</p>
                  </div>
                  <button
                    type="button"
                    className="utility-button m3-touch touch-target"
                    onClick={() => setQuickMixOpen(false)}
                    aria-label="Close quick mix"
                  >
                    <span className="material-icons text-base">close</span>
                  </button>
                </div>
                {compactMixer}
              </div>
            </div>
          )}
        </>
      )}

      <nav className="mobile-bottom-nav" aria-label="Primary">
        {([
          { id: 'LIBRARY', label: 'Library', icon: 'library_music' },
          { id: 'DECK_A', label: 'Deck A', icon: 'album' },
          { id: 'DECK_B', label: 'Deck B', icon: 'graphic_eq' },
          { id: 'MIXER', label: 'Mixer', icon: 'tune' }
        ] as const).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavTabChange(item.id)}
            className={`bottom-nav__item m3-touch touch-target ${navTab === item.id ? 'is-active' : ''}`}
            aria-pressed={navTab === item.id}
          >
            <span className="material-icons bottom-nav__icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobilePortraitLayout;
