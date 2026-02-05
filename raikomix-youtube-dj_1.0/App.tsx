import React, { useState, useCallback, useEffect, useRef } from 'react';
import Deck, { DeckHandle } from './components/Deck';
import Mixer from './components/Mixer';
import LibraryPanel from './components/LibraryPanel';
import QueuePanel from './components/QueuePanel';
import SearchPanel from './components/SearchPanel';
import Toast, { ToastType } from './components/Toast';
import MobilePortraitLayout, { MobilePanelTab } from './components/layouts/MobilePortraitLayout';
import MobileLandscapeLayout from './components/layouts/MobileLandscapeLayout';
import TabletLayout from './components/layouts/TabletLayout';
import CompactMixer from './components/CompactMixer';
import {
  PlayerState,
  CrossfaderCurve,
  QueueItem,
  LibraryTrack,
  YouTubeSearchResult,
  TrackSourceType,
  EffectType
} from './types';
import type { DeckId as PlayerDeckId } from './types';
import type { DeckId as UIDeckId, SheetRoute, UIMode } from './types/ui';
import {
  loadLibrary,
  saveLibrary,
  addTrackToLibrary,
  removeFromLibrary,
  incrementPlayCount,
  updateTrackMetadata
} from './utils/libraryStorage';
import { loadQueue, saveQueue } from './utils/queueStorage';
import EffectsPanel from './components/EffectsPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useAutoDj } from './hooks/useAutoDj';
import './styles/tokens.css';
import './styles/layout.css';

const tabToRoute = (tab: MobilePanelTab): SheetRoute => {
  switch (tab) {
    case 'QUEUE':
      return 'queue';
    case 'EFFECTS':
      return 'fx';
    case 'LIBRARY':
    default:
      return 'library';
  }
};

const App: React.FC = () => {
  const [library, setLibrary] = useState<LibraryTrack[]>(() => loadLibrary());
  const [deckAState, setDeckAState] = useState<PlayerState | null>(null);
  const [deckBState, setDeckBState] = useState<PlayerState | null>(null);
  const [masterPlayerA, setMasterPlayerA] = useState<any>(null);
  const [masterPlayerB, setMasterPlayerB] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>(() => loadQueue());
  const [crossfader, setCrossfader] = useState(0);
  const [xFaderCurve, setXFaderCurve] = useState<CrossfaderCurve>('SMOOTH');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [deckAVolume, setDeckAVolume] = useState(0.8);
  const [deckBVolume, setDeckBVolume] = useState(0.8);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [deckAEffect, setDeckAEffect] = useState<EffectType | null>(null);
  const [deckAEffectWet, setDeckAEffectWet] = useState(0.5);
  const [deckAEffectIntensity, setDeckAEffectIntensity] = useState(0.5);
  const [deckBEffect, setDeckBEffect] = useState<EffectType | null>(null);
  const [deckBEffectWet, setDeckBEffectWet] = useState(0.5);
  const [deckBEffectIntensity, setDeckBEffectIntensity] = useState(0.5);
  const [fxTarget, setFxTarget] = useState<'A' | 'B' | 'AB'>('A');

  const [deckAEq, setDeckAEq] = useState({ hi: 1, mid: 1, low: 1, filter: 0 });
  const [deckBEq, setDeckBEq] = useState({ hi: 1, mid: 1, low: 1, filter: 0 });

  // PR1: global mobile UI state (used more deeply in PR2+)
  const [focusedDeck, setFocusedDeck] = useState<UIDeckId>('A');
  const [uiMode, setUiMode] = useState<UIMode>('basic');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetRoute, setSheetRoute] = useState<SheetRoute>('library');

  const [mobileSheetTab, setMobileSheetTab] = useState<MobilePanelTab>('LIBRARY');
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState<'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER'>('DECK_A');
  const [tabletPanelTab, setTabletPanelTab] = useState<'LIBRARY' | 'QUEUE'>('LIBRARY');
  const [effectsDrawerOpen, setEffectsDrawerOpen] = useState(false);
  const [effectsCollapsed, setEffectsCollapsed] = useState(false);

  const deckARef = useRef<DeckHandle>(null);
  const deckBRef = useRef<DeckHandle>(null);
  const { theme, toggleTheme } = useTheme();

  const [layoutMode, setLayoutMode] = useState<'tablet' | 'landscape' | 'portrait'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width >= 1024) return 'tablet';
    if (width > height) return 'landscape';
    return 'portrait';
  });

  const handleLoadVideo = useCallback(
    (videoId: string, url: string, deck: PlayerDeckId, sourceType: TrackSourceType = 'youtube', title?: string, author?: string) => {
      const ref = deck === 'A' ? deckARef : deckBRef;
      if (ref.current) {
        ref.current.loadVideo(url, sourceType, { title, author });
        setLibrary(prev => incrementPlayCount(videoId, prev));
        showNotification(`${sourceType === 'local' ? 'File' : 'Stream'} Loaded to Deck ${deck}`, 'success');
      }
    },
    []
  );

  const handleRemoveFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
  }, []);

  // Initialize Auto DJ hook
  const {
    autoDj,
    toggleAutoDj,
    setMixLeadSeconds,
    setMixDurationSeconds,
    getCountdown,
    getNextTrackInfo,
    isAutoDjActive,
    isMixPending,
    nextDeck
  } = useAutoDj({
    queue,
    deckAState,
    deckBState,
    onLoadToDeck: handleLoadVideo,
    onRemoveFromQueue: handleRemoveFromQueue,
    onCrossfaderChange: setCrossfader,
    currentCrossfader: crossfader
  });

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width >= 1024) {
        setLayoutMode('tablet');
      } else if (width > height) {
        setLayoutMode('landscape');
      } else {
        setLayoutMode('portrait');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  useEffect(() => {
    saveLibrary(library);
  }, [library]);

  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  useEffect(() => {
    // Keep "route" in sync with current mobile sheet tab
    setSheetRoute(tabToRoute(mobileSheetTab));
  }, [mobileSheetTab]);

  useEffect(() => {
    if (layoutMode === 'tablet') {
      setSheetOpen(false);
      setEffectsDrawerOpen(false);
    }
    if (layoutMode === 'landscape') {
      setMobileSheetExpanded(false);
      if (mobileSheetTab === 'EFFECTS') setMobileSheetTab('LIBRARY');
    }
    if (layoutMode === 'portrait') {
      setMobileSheetExpanded(false);
      setEffectsDrawerOpen(false);
      if (mobileSheetTab === 'EFFECTS') setMobileSheetTab('LIBRARY');
    }
  }, [layoutMode, mobileSheetTab]);

  useEffect(() => {
    if (layoutMode !== 'portrait') return;
    if (mobileNavTab === 'LIBRARY') {
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
    }
    if (mobileNavTab === 'DECK_A') setFocusedDeck('A');
    if (mobileNavTab === 'DECK_B') setFocusedDeck('B');
  }, [layoutMode, mobileNavTab]);

  const showNotification = (msg: string, type: ToastType = 'info') => setToast({ msg, type });

  const handleDeckStateUpdate = useCallback((id: PlayerDeckId, state: PlayerState) => {
    id === 'A' ? setDeckAState(state) : setDeckBState(state);
    if (state.isReady && state.title && state.videoId && state.sourceType === 'youtube') {
      setLibrary(prev => updateTrackMetadata(state.videoId, { title: state.title, author: state.author }, prev));
    }
  }, []);

  const handleAddToQueue = useCallback((track: LibraryTrack | YouTubeSearchResult) => {
    const item: QueueItem = {
      id: `${Date.now()}_${track.videoId}`,
      videoId: track.videoId,
      url: 'addedAt' in track ? track.url : `https://www.youtube.com/watch?v=${track.videoId}`,
      title: track.title,
      thumbnailUrl: track.thumbnailUrl,
      addedAt: Date.now(),
      author: 'addedAt' in track ? track.author : (track as YouTubeSearchResult).channelTitle,
      sourceType: 'sourceType' in track ? track.sourceType : 'youtube'
    };
    setQueue(prev => [...prev, item]);
    showNotification('Added to Queue');
  }, []);

  const muteDeck = (id: 'A' | 'B') => {
    if (id === 'A') setDeckAVolume(prev => (prev > 0 ? 0 : 0.8));
    else setDeckBVolume(prev => (prev > 0 ? 0 : 0.8));
  };

  const pitchDeck = (id: 'A' | 'B', delta: number) => {
    const ref = id === 'A' ? deckARef : deckBRef;
    const currentState = id === 'A' ? deckAState : deckBState;
    if (ref.current && currentState) {
      ref.current.setPlaybackRate(currentState.playbackRate + delta);
    }
  };

  const resetEq = () => {
    setDeckAEq({ hi: 1, mid: 1, low: 1, filter: 0 });
    setDeckBEq({ hi: 1, mid: 1, low: 1, filter: 0 });
    showNotification('EQs Reset', 'info');
  };

  const toggleEffect = (deck: 'A' | 'B', effect: EffectType | null) => {
    if (deck === 'A') {
      setDeckAEffect(prev => (prev === effect ? null : effect));
    } else {
      setDeckBEffect(prev => (prev === effect ? null : effect));
    }
  };

  const targetEffect =
    fxTarget === 'A'
      ? deckAEffect
      : fxTarget === 'B'
      ? deckBEffect
      : deckAEffect === deckBEffect
      ? deckAEffect
      : null;
  const targetWet =
    fxTarget === 'A'
      ? deckAEffectWet
      : fxTarget === 'B'
      ? deckBEffectWet
      : (deckAEffectWet + deckBEffectWet) / 2;
  const targetIntensity =
    fxTarget === 'A'
      ? deckAEffectIntensity
      : fxTarget === 'B'
      ? deckBEffectIntensity
      : (deckAEffectIntensity + deckBEffectIntensity) / 2;
  const isMixedEffect = fxTarget === 'AB' && deckAEffect !== deckBEffect;
  const isMixedWet = fxTarget === 'AB' && Math.abs(deckAEffectWet - deckBEffectWet) > 0.01;
  const isMixedIntensity = fxTarget === 'AB' && Math.abs(deckAEffectIntensity - deckBEffectIntensity) > 0.01;
  const targetColor = fxTarget === 'A' ? '#D0BCFF' : fxTarget === 'B' ? '#F2B8B5' : '#E5D0F7';
  const streamingNotice =
    fxTarget === 'A'
      ? deckAState?.sourceType === 'youtube'
      : fxTarget === 'B'
      ? deckBState?.sourceType === 'youtube'
      : deckAState?.sourceType === 'youtube' || deckBState?.sourceType === 'youtube';

  const handleRemoveMultiple = useCallback((ids: string[]) => {
    setLibrary(prev => prev.filter(track => !ids.includes(track.id)));
    showNotification(`Removed ${ids.length} items from Library`);
  }, []);

  useKeyboardShortcuts(deckARef, deckBRef, crossfader, setCrossfader, () => setShowHelp(p => !p), {
    muteDeck,
    pitchDeck,
    resetEq
  });

  useEffect(() => {
    const interval = setInterval(() => {
      [{ p: masterPlayerA, bv: deckAVolume, id: 'A' }, { p: masterPlayerB, bv: deckBVolume, id: 'B' }].forEach(
        ({ p, bv, id }) => {
          if (!p || typeof p.setVolume !== 'function') return;
          const t = (crossfader + 1) / 2;
          let gain =
            id === 'A'
              ? xFaderCurve === 'CUT'
                ? t > 0.9
                  ? 0
                  : 1
                : Math.cos((t * Math.PI) / 2)
              : xFaderCurve === 'CUT'
              ? t < 0.1
                ? 0
                : 1
              : Math.sin((t * Math.PI) / 2);
          try {
            p.setVolume(Math.round(bv * masterVolume * gain * 100));
          } catch (e) {}
        }
      );
    }, 50);
    return () => clearInterval(interval);
  }, [crossfader, xFaderCurve, masterVolume, deckAVolume, deckBVolume, masterPlayerA, masterPlayerB]);

  const libraryPanel = (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <SearchPanel
        onLoadToDeck={(vid, url, deck, title, author) => handleLoadVideo(vid, url, deck, 'youtube', title, author)}
        onAddToQueue={handleAddToQueue}
        onAddToLibrary={result => {
          setLibrary(prev => {
            const res = addTrackToLibrary(`https://www.youtube.com/watch?v=${result.videoId}`, prev);
            if (res.success && res.track) {
              showNotification('Added to Library', 'success');
              const withTrack = [...prev, res.track];
              return updateTrackMetadata(result.videoId, { title: result.title, author: result.channelTitle }, withTrack);
            }
            if (res.error) showNotification(res.error, 'error');
            return prev;
          });
        }}
      />
      <div className="flex-1 overflow-hidden border-t border-white/5 pt-4 min-h-0">
        <LibraryPanel
          library={library}
          onAddSingle={url => {
            setLibrary(prev => {
              const res = addTrackToLibrary(url, prev);
              if (res.success && res.track) {
                showNotification('Added to Library', 'success');
                return [...prev, res.track];
              }
              if (res.error) showNotification(res.error, 'error');
              return prev;
            });
          }}
          onRemove={id => setLibrary(p => removeFromLibrary(id, p))}
          onRemoveMultiple={handleRemoveMultiple}
          onLoadToDeck={(track, deck) => handleLoadVideo(track.videoId, track.url, deck, track.sourceType, track.title, track.author)}
          onAddToQueue={handleAddToQueue}
          onUpdateMetadata={(v, m) => {
            setLibrary(updateTrackMetadata(v, m, library));
            showNotification('Metadata Saved');
          }}
          onImportLibrary={setLibrary}
        />
      </div>
    </div>
  );

  const queuePanel = (
    <div className="flex-1 min-h-0 overflow-hidden">
      <QueuePanel
        queue={queue}
        onLoadToDeck={(i, d) => {
          handleLoadVideo(i.videoId, i.url, d, i.sourceType || 'youtube', i.title, i.author);
          setQueue(p => p.filter(q => q.id !== i.id));
        }}
        onRemove={handleRemoveFromQueue}
        onClear={() => setQueue([])}
        onReorder={(from, to) => {
          setQueue(prev => {
            if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) {
              return prev;
            }
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          });
        }}
        // Auto DJ props
        autoDjEnabled={isAutoDjActive}
        autoDjMixLeadSeconds={autoDj.mixLeadSeconds}
        autoDjMixDurationSeconds={autoDj.mixDurationSeconds}
        autoDjCountdown={getCountdown()}
        autoDjNextTrack={getNextTrackInfo()}
        autoDjNextDeck={nextDeck}
        onAutoDjToggle={toggleAutoDj}
        onAutoDjMixLeadChange={setMixLeadSeconds}
        onAutoDjMixDurationChange={setMixDurationSeconds}
      />
    </div>
  );

  const effectsPanel = (
    <EffectsPanel
      activeEffect={targetEffect}
      effectAmount={targetWet}
      effectIntensity={targetIntensity}
      onEffectToggle={effect => {
        if (fxTarget === 'A') toggleEffect('A', effect);
        else if (fxTarget === 'B') toggleEffect('B', effect);
        else {
          toggleEffect('A', effect);
          toggleEffect('B', effect);
        }
      }}
      onAmountChange={amount => {
        if (fxTarget === 'A') setDeckAEffectWet(amount);
        else if (fxTarget === 'B') setDeckBEffectWet(amount);
        else {
          setDeckAEffectWet(amount);
          setDeckBEffectWet(amount);
        }
      }}
      onIntensityChange={amount => {
        if (fxTarget === 'A') setDeckAEffectIntensity(amount);
        else if (fxTarget === 'B') setDeckBEffectIntensity(amount);
        else {
          setDeckAEffectIntensity(amount);
          setDeckBEffectIntensity(amount);
        }
      }}
      color={targetColor}
      target={fxTarget}
      onTargetChange={setFxTarget}
      mixedEffect={isMixedEffect}
      mixedAmount={isMixedWet}
      mixedIntensity={isMixedIntensity}
      showStreamingNotice={streamingNotice}
    />
  );

  const mixerPanel = (
    <Mixer
      className="w-full max-w-[360px]"
      crossfader={crossfader}
      onCrossfaderChange={setCrossfader}
      crossfaderCurve={xFaderCurve}
      onCurveChange={setXFaderCurve}
      masterVolume={masterVolume}
      onMasterVolumeChange={setMasterVolume}
      deckAVolume={deckAVolume}
      onDeckAVolumeChange={setDeckAVolume}
      deckBVolume={deckBVolume}
      onDeckBVolumeChange={setDeckBVolume}
      deckAPlaying={deckAState?.playing || false}
      deckBPlaying={deckBState?.playing || false}
      deckAEq={deckAEq}
      deckBEq={deckBEq}
      onDeckAEqChange={(k, v) => setDeckAEq(p => ({ ...p, [k]: v }))}
      onDeckBEqChange={(k, v) => setDeckBEq(p => ({ ...p, [k]: v }))}
    />
  );

  const utilityBar = (
    <div className="utility-bar">
      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="utility-button m3-touch touch-target"
        aria-label="Show shortcuts"
      >
        <span className="material-icons text-base">help_outline</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="utility-button m3-touch touch-target"
        aria-label="Toggle theme"
      >
        <span className="material-icons text-base">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>
      <button
        type="button"
        onClick={() => setUiMode(p => (p === 'basic' ? 'pro' : 'basic'))}
        className="utility-button m3-touch touch-target"
        aria-label="Toggle Basic/Pro mode"
        title={`Mode: ${uiMode}`}
      >
        <span className="material-icons text-base">tune</span>
      </button>
    </div>
  );

  const deckA = (
    <Deck
      ref={deckARef}
      id="A"
      color="#D0BCFF"
      eq={deckAEq}
      effect={deckAEffect}
      effectWet={deckAEffectWet}
      effectIntensity={deckAEffectIntensity}
      onStateUpdate={s => handleDeckStateUpdate('A', s)}
      onPlayerReady={p => setMasterPlayerA(p)}
    />
  );

  const deckB = (
    <Deck
      ref={deckBRef}
      id="B"
      color="#F2B8B5"
      eq={deckBEq}
      effect={deckBEffect}
      effectWet={deckBEffectWet}
      effectIntensity={deckBEffectIntensity}
      onStateUpdate={s => handleDeckStateUpdate('B', s)}
      onPlayerReady={p => setMasterPlayerB(p)}
    />
  );

  const handleMobileNavTabChange = (tab: 'LIBRARY' | 'DECK_A' | 'DECK_B' | 'MIXER') => {
    setMobileNavTab(tab);
    if (tab === 'DECK_A') setFocusedDeck('A');
    if (tab === 'DECK_B') setFocusedDeck('B');
    if (tab === 'LIBRARY') {
      setSheetOpen(true);
      setMobileSheetExpanded(true);
      setMobileSheetTab('LIBRARY');
      setSheetRoute('library');
    }
    if (tab !== 'LIBRARY') setSheetOpen(false);
  };

  const handleMobileSheetToggle = (open: boolean) => {
    setSheetOpen(open);
    if (!open && mobileNavTab === 'LIBRARY') {
      setMobileNavTab(focusedDeck === 'B' ? 'DECK_B' : 'DECK_A');
    }
  };

  const compactMixer = (
    <CompactMixer
      crossfader={crossfader}
      onCrossfaderChange={setCrossfader}
      masterVolume={masterVolume}
      onMasterVolumeChange={setMasterVolume}
    />
  );

  const landscapeSheetTab: 'LIBRARY' | 'QUEUE' = mobileSheetTab === 'QUEUE' ? 'QUEUE' : 'LIBRARY';

  return (
    <div className="app-shell" data-theme={theme} data-ui-mode={uiMode} data-sheet-route={sheetRoute}>
      <div className="layout-root">
        {layoutMode === 'portrait' && (
          <MobilePortraitLayout
            deckA={deckA}
            deckB={deckB}
            mixer={mixerPanel}
            deckFocus={focusedDeck}
            onDeckFocusChange={setFocusedDeck}
            navTab={mobileNavTab}
            onNavTabChange={handleMobileNavTabChange}
            sheetOpen={sheetOpen}
            sheetTab={mobileSheetTab}
            onSheetTabChange={tab => {
              setMobileSheetTab(tab);
              setSheetRoute(tabToRoute(tab));
            }}
            onSheetToggle={handleMobileSheetToggle}
            sheetExpanded={mobileSheetExpanded}
            onSheetExpandedToggle={() => setMobileSheetExpanded(prev => !prev)}
            libraryPanel={libraryPanel}
            queuePanel={queuePanel}
            effectsPanel={effectsPanel}
            utilityBar={utilityBar}
            compactMixer={compactMixer}
          />
        )}

        {layoutMode === 'landscape' && (
          <MobileLandscapeLayout
            deckA={deckA}
            deckB={deckB}
            mixer={mixerPanel}
            sheetOpen={sheetOpen}
            sheetTab={landscapeSheetTab}
            onSheetTabChange={tab => setMobileSheetTab(tab)}
            onSheetToggle={setSheetOpen}
            sheetExpanded={mobileSheetExpanded}
            onSheetExpandedToggle={() => setMobileSheetExpanded(prev => !prev)}
            libraryPanel={libraryPanel}
            queuePanel={queuePanel}
            effectsPanel={effectsPanel}
            effectsOpen={effectsDrawerOpen}
            onEffectsToggle={setEffectsDrawerOpen}
            utilityBar={utilityBar}
          />
        )}

        {layoutMode === 'tablet' && (
          <TabletLayout
            deckA={deckA}
            deckB={deckB}
            mixer={mixerPanel}
            libraryPanel={libraryPanel}
            queuePanel={queuePanel}
            effectsPanel={effectsPanel}
            panelTab={tabletPanelTab}
            onPanelTabChange={setTabletPanelTab}
            effectsCollapsed={effectsCollapsed}
            onEffectsCollapseToggle={() => setEffectsCollapsed(prev => !prev)}
            utilityBar={utilityBar}
          />
        )}
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
          <div className="m3-card bg-[#1D1B20] p-12 max-w-2xl w-full border-[#D0BCFF]/30 shadow-[0_0_100px_rgba(208,188,255,0.15)]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-[#D0BCFF] tracking-[0.3em] uppercase">Shortcut Engine</h2>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
                {uiMode === 'pro' ? 'Pro Mode Active' : 'Basic Mode'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Deck A (Left)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">PLAY/PAUSE / CUE</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">Q / 1-4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">LOOP / MUTE</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">S / M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">PITCH +/-</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">[ / ]</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Deck B (Right)</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">PLAY/PAUSE / CUE</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">P / 7-0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">LOOP / MUTE</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">K / N</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">PITCH +/-</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">; / '</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 pt-4">
                <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Global Mixer</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">CROSSFADER</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">← / →</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">RESET EQs</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">R</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">CENTER X-FADER</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">Space</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">KNOB FINE-TUNE</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">Wheel</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-12 py-5 bg-[#D0BCFF] text-black font-black rounded-2xl tracking-[0.5em] hover:bg-white transition-all"
            >
              RESUME PERFORMANCE
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
