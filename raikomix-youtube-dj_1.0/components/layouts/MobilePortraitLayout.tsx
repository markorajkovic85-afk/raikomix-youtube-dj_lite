import React, { ReactNode } from 'react';

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
  const deckFrameStyle = (deck: 'A' | 'B'): React.CSSProperties => {
    const isFocused = deckFocus === deck;
    const accent = deck === 'A' ? 'var(--rm-deck-a, #D0BCFF)' : 'var(--rm-deck-b, #F2B8B5)';
    const glow = deck === 'A' ? 'rgba(208,188,255,0.18)' : 'rgba(242,184,181,0.18)';
    return {
      borderRadius: 16,
      padding: 8,
      border: isFocused ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isFocused ? `0 0 22px ${glow}` : undefined,
      opacity: isFocused ? 1 : 0.82,
      background: 'rgba(0,0,0,0.18)'
    };
  };

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
        <div className="deck-tabs" role="tablist" aria-label="Deck focus">
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

        <div className="deck-stack" aria-label="Decks">
          <div className="deck-slot" style={deckFrameStyle('A')} aria-label="Deck A">
            {deckA}
          </div>
          <div className="deck-slot" style={deckFrameStyle('B')} aria-label="Deck B">
            {deckB}
          </div>
        </div>

        {/* Keep existing mixer node mounted for now (used by tablet/landscape and future pro views). */}
        <div className="sr-only" aria-hidden="true">
          {mixer}
        </div>
      </div>

      {sheetOpen && (
        <div className="panel-sheet elevation-4" data-expanded={sheetExpanded} role="dialog" aria-label="Library, queue and effects">
          <div className="flex justify-center pt-3">
            <div className="panel-sheet__handle" aria-hidden="true" />
          </div>
          <div className="panel-sheet__header">
            <div className="panel-sheet__tabs">
              {(['LIBRARY', 'QUEUE', 'EFFECTS'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSheetTabChange(tab)}
                  className={`panel-tab m3-touch touch-target ${sheetTab === tab ? 'is-active' : ''}`}
                  aria-pressed={sheetTab === tab}
                >
                  {tab === 'LIBRARY' ? 'Library' : tab === 'QUEUE' ? 'Queue' : 'FX'}
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
            <div className={`panel-sheet__panel ${sheetTab === 'EFFECTS' ? '' : 'is-hidden'}`}>
              {effectsPanel}
            </div>
          </div>
        </div>
      )}

      {compactMixer && (
        <div className="mobile-mixer-bar" role="region" aria-label="Mix strip">
          {compactMixer}
        </div>
      )}

      <nav className="mobile-bottom-nav" aria-label="Primary">
        {([
          { id: 'LIBRARY', label: 'Library', icon: 'library_music' },
          { id: 'DECK_A', label: 'Deck A', icon: 'album' },
          { id: 'DECK_B', label: 'Deck B', icon: 'graphic_eq' },
          { id: 'MIXER', label: 'FX', icon: 'auto_fix_high' }
        ] as const).map(item => (
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
