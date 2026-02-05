import React, { ReactNode } from 'react';
import type { SheetRoute } from '../../types/ui';
import MobileBottomSheet from '../mobile/MobileBottomSheet';

interface MobilePortraitLayoutProps {
  deckA: ReactNode;
  deckB: ReactNode;
  mixer: ReactNode;
  deckFocus: 'A' | 'B';
  onDeckFocusChange: (deck: 'A' | 'B') => void;
  navTab: 'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER';
  onNavTabChange: (tab: 'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER') => void;
  sheetOpen: boolean;
  sheetRoute: SheetRoute;
  onSheetRouteChange: (route: SheetRoute) => void;
  onSheetToggle: (open: boolean) => void;
  sheetExpanded: boolean;
  onSheetExpandedToggle: () => void;
  libraryPanel: ReactNode;
  queuePanel: ReactNode;
  effectsPanel: ReactNode;
  padsPanel: ReactNode;
  settingsPanel: ReactNode;
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
  sheetRoute,
  onSheetRouteChange,
  onSheetToggle,
  sheetExpanded,
  onSheetExpandedToggle,
  libraryPanel,
  queuePanel,
  effectsPanel,
  padsPanel,
  settingsPanel,
  utilityBar,
  compactMixer
}) => {
  const deckFrameStyle = (deck: 'A' | 'B'): React.CSSProperties => {
    const accent = deck === 'A' ? 'var(--rm-deck-a, #D0BCFF)' : 'var(--rm-deck-b, #F2B8B5)';
    const glow = deck === 'A' ? 'rgba(208,188,255,0.18)' : 'rgba(242,184,181,0.18)';
    return {
      '--deck-accent': accent,
      '--deck-glow': glow
    } as React.CSSProperties;
  };

  return (
    <div className="mobile-layout" id="main-content">
      <header className="mobile-top-bar">
        <div className="mobile-top-bar__title">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">RaikoMix</p>
          <p className="text-sm font-semibold">Performance View</p>
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
          <div
            className={`deck-slot deck-slot--frame ${deckFocus === 'A' ? 'is-focused' : 'is-secondary'}`}
            style={deckFrameStyle('A')}
            aria-label="Deck A"
          >
            {deckA}
          </div>
          <div
            className={`deck-slot deck-slot--frame ${deckFocus === 'B' ? 'is-focused' : 'is-secondary'}`}
            style={deckFrameStyle('B')}
            aria-label="Deck B"
          >
            {deckB}
          </div>
        </div>

        {/* Keep existing mixer node mounted for now (used by tablet/landscape and future pro views). */}
        <div className="sr-only" aria-hidden="true">
          {mixer}
        </div>
      </div>

      <MobileBottomSheet
        open={sheetOpen}
        route={sheetRoute}
        onRouteChange={onSheetRouteChange}
        onOpenChange={onSheetToggle}
        expanded={sheetExpanded}
        onExpandedToggle={onSheetExpandedToggle}
        panels={{
          library: libraryPanel,
          queue: queuePanel,
          fx: effectsPanel,
          pads: padsPanel,
          settings: settingsPanel
        }}
        ariaLabel="Library, queue, FX, pads and settings"
      />

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
