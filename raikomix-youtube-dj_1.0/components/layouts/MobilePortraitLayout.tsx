import React, { ReactNode } from 'react';

export type MobilePanelTab = 'LIBRARY' | 'QUEUE' | 'EFFECTS';

interface MobilePortraitLayoutProps {
  deckA: ReactNode;
  deckB: ReactNode;
  mixer: ReactNode;
  deckFocus: 'A' | 'B';
  onDeckFocusChange: (deck: 'A' | 'B') => void;
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
}

const MobilePortraitLayout: React.FC<MobilePortraitLayoutProps> = ({
  deckA,
  deckB,
  mixer,
  deckFocus,
  onDeckFocusChange,
  sheetOpen,
  sheetTab,
  onSheetTabChange,
  onSheetToggle,
  sheetExpanded,
  onSheetExpandedToggle,
  libraryPanel,
  queuePanel,
  effectsPanel,
  utilityBar
}) => {
  return (
    <div className="mobile-layout" id="main-content">
      {/* Mobile portrait: top deck switcher, active deck stack, mixer strip, bottom sheet tabs. */}
      <header className="mobile-header">
        <div className="deck-switcher" role="tablist" aria-label="Deck switcher">
          <button
            type="button"
            onClick={() => onDeckFocusChange('A')}
            className={`deck-switcher__button touch-target ${deckFocus === 'A' ? 'is-active' : ''}`}
            aria-pressed={deckFocus === 'A'}
          >
            Deck A
          </button>
          <button
            type="button"
            onClick={() => onDeckFocusChange('B')}
            className={`deck-switcher__button deck-switcher__button--b touch-target ${deckFocus === 'B' ? 'is-active' : ''}`}
            aria-pressed={deckFocus === 'B'}
          >
            Deck B
          </button>
        </div>
        <div className="mobile-actions">
          <button
            type="button"
            onClick={() => onSheetToggle(!sheetOpen)}
            className="panel-trigger touch-target"
            aria-expanded={sheetOpen}
          >
            <span className="material-icons text-base">library_music</span>
            Panels
          </button>
          {utilityBar}
        </div>
      </header>

      <div className="deck-stack">
        <div className={`deck-slot ${deckFocus === 'A' ? '' : 'is-hidden'}`} aria-hidden={deckFocus !== 'A'}>
          {deckA}
        </div>
        <div className={`deck-slot ${deckFocus === 'B' ? '' : 'is-hidden'}`} aria-hidden={deckFocus !== 'B'}>
          {deckB}
        </div>
      </div>

      <section className="mixer-strip" aria-label="Mixer">
        {mixer}
      </section>

      {sheetOpen && (
        <div className="panel-sheet elevation-4" data-expanded={sheetExpanded} role="dialog" aria-label="Performance panels">
          <div className="panel-sheet__header">
            <div className="panel-sheet__tabs">
              {(['LIBRARY', 'QUEUE', 'EFFECTS'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSheetTabChange(tab)}
                  className={`panel-tab touch-target ${sheetTab === tab ? 'is-active' : ''}`}
                  aria-pressed={sheetTab === tab}
                >
                  {tab === 'LIBRARY' ? 'Library' : tab === 'QUEUE' ? 'Queue' : 'Effects'}
                </button>
              ))}
            </div>
            <div className="panel-sheet__actions">
              <button
                type="button"
                onClick={onSheetExpandedToggle}
                className="utility-button touch-target"
                aria-label={sheetExpanded ? 'Collapse panel' : 'Expand panel'}
              >
                <span className="material-icons text-base">{sheetExpanded ? 'expand_more' : 'expand_less'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSheetToggle(false)}
                className="utility-button touch-target"
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
            <div className={`panel-sheet__panel ${sheetTab === 'EFFECTS' ? '' : 'is-hidden'}`}>
              {effectsPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePortraitLayout;
