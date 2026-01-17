
import React, { Component, useState, useCallback, useEffect, useRef, Suspense, ReactNode } from 'react';
import Deck, { DeckHandle } from './components/Deck';
import Mixer from './components/Mixer';
import LibraryPanel from './components/LibraryPanel';
import QueuePanel from './components/QueuePanel';
import SearchPanel from './components/SearchPanel';
import Toast, { ToastType } from './components/Toast';
import { PlayerState, DeckId, CrossfaderCurve, QueueItem, LibraryTrack, YouTubeSearchResult, TrackSourceType, EffectType } from './types';
import {
  loadLibrary,
  saveLibrary,
  addTrackToLibrary,
  removeFromLibrary,
  incrementPlayCount,
  updateTrackMetadata
} from './utils/libraryStorage';
import EffectsPanel from './components/EffectsPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// FIX: Explicitly using Component from named imports and providing constructor to ensure props are correctly initialized and recognized by the compiler
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  public render() {
    const { hasError } = this.state;
    // Destructuring children from this.props; typing is now correctly inherited from the Component base class
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
        
        {mobilePanel && (
          <div className="md:hidden fixed inset-x-0 bottom-16 z-40 px-3 pb-3">
            <div className="bg-[#1C1B1F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] min-h-[260px]">
              <div className="flex items-center justify-between gap-2 p-3 border-b border-white/10 bg-black/40">
                <div className="flex gap-2">
                  {(['LIBRARY', 'QUEUE', 'EFFECTS'] as const).map((panel) => (
                    <button
                      key={panel}
                      onClick={() => setMobilePanel(panel)}
                      className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        mobilePanel === panel ? 'bg-[#D0BCFF] text-black' : 'text-gray-400'
                      }`}
                    >
                      {panel === 'LIBRARY' ? 'Library' : panel === 'QUEUE' ? 'Queue' : 'Effects'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setMobilePanel(null)} className="text-gray-400 hover:text-white">
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-3">
                {mobilePanel === 'LIBRARY' && (
                  <div className="flex flex-col gap-3 h-full min-h-0">
                    <SearchPanel 
                      onLoadToDeck={(vid, url, deck, title, author) => handleLoadVideo(vid, url, deck, 'youtube', title, author)} 
                      onAddToQueue={handleAddToQueue} 
                      onAddToLibrary={(result) => {
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
                    <div className="flex-1 min-h-0 overflow-hidden">
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
                        onUpdateMetadata={(v, m) => { setLibrary(updateTrackMetadata(v, m, library)); showNotification('Metadata Saved'); }} 
                        onImportLibrary={setLibrary} 
                      />
                    </div>
                  </div>
                )}
                {mobilePanel === 'QUEUE' && (
                  <div className="h-full">
                    <QueuePanel 
                      queue={queue} 
                      onLoadToDeck={(i, d) => { handleLoadVideo(i.videoId, i.url, d, i.sourceType || 'youtube', i.title, i.author); setQueue(p => p.filter(q => q.id !== i.id)); }} 
                      onRemove={id => setQueue(p => p.filter(i => i.id !== id))} 
                      onClear={() => setQueue([])} 
                      onReorder={() => {}} 
                    />
                  </div>
                )}
                {mobilePanel === 'EFFECTS' && (
                  <div className="h-full overflow-y-auto">
                    <EffectsPanel
                      activeEffect={targetEffect}
                      effectAmount={targetWet}
                      effectIntensity={targetIntensity}
                      onEffectToggle={(effect) => {
                        if (fxTarget === 'A') toggleEffect('A', effect);
                        else if (fxTarget === 'B') toggleEffect('B', effect);
                        else {
                          toggleEffect('A', effect);
                          toggleEffect('B', effect);
                        }
                      }}
                      onAmountChange={(amount) => {
                        if (fxTarget === 'A') setDeckAEffectWet(amount);
                        else if (fxTarget === 'B') setDeckBEffectWet(amount);
                        else {
                          setDeckAEffectWet(amount);
                          setDeckBEffectWet(amount);
                        }
                      }}
                      onIntensityChange={(amount) => {
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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
    return children;
  }
}

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'PERFORM' | 'LIBRARY'>('LIBRARY');
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [queueOpen, setQueueOpen] = useState(true);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [library, setLibrary] = useState<LibraryTrack[]>(() => loadLibrary());
  const [deckAState, setDeckAState] = useState<PlayerState | null>(null);
  const [deckBState, setDeckBState] = useState<PlayerState | null>(null);
  const [masterPlayerA, setMasterPlayerA] = useState<any>(null);
  const [masterPlayerB, setMasterPlayerB] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [crossfader, setCrossfader] = useState(0);
  const [xFaderCurve, setXFaderCurve] = useState<CrossfaderCurve>('SMOOTH');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [deckAVolume, setDeckAVolume] = useState(0.8);
  const [deckBVolume, setDeckBVolume] = useState(0.8);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: ToastType } | null>(null);
  const [deckAEffect, setDeckAEffect] = useState<EffectType | null>(null);
  const [deckAEffectWet, setDeckAEffectWet] = useState(0.5);
  const [deckAEffectIntensity, setDeckAEffectIntensity] = useState(0.5);
  const [deckBEffect, setDeckBEffect] = useState<EffectType | null>(null);
  const [deckBEffectWet, setDeckBEffectWet] = useState(0.5);
  const [deckBEffectIntensity, setDeckBEffectIntensity] = useState(0.5);
  const [fxTarget, setFxTarget] = useState<'A' | 'B' | 'AB'>('A');

  const [deckAEq, setDeckAEq] = useState({ hi: 1, mid: 1, low: 1, filter: 0 });
  const [deckBEq, setDeckBEq] = useState({ hi: 1, mid: 1, low: 1, filter: 0 });
  const [mobilePanel, setMobilePanel] = useState<'LIBRARY' | 'QUEUE' | 'EFFECTS' | null>(null);
  const [mobileDeckFocus, setMobileDeckFocus] = useState<'A' | 'B'>('A');

  const deckARef = useRef<DeckHandle>(null);
  const deckBRef = useRef<DeckHandle>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { saveLibrary(library); }, [library]);
  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setLibraryOpen(false);
      setQueueOpen(false);
      setEffectsOpen(false);
      setMobilePanel(null);
      setMobileDeckFocus('A');
    }
  }, []);

  const showNotification = (msg: string, type: ToastType = 'info') => setToast({ msg, type });

  const handleDeckStateUpdate = useCallback((id: DeckId, state: PlayerState) => {
    id === 'A' ? setDeckAState(state) : setDeckBState(state);
    if (state.isReady && state.title && state.videoId && state.sourceType === 'youtube') {
      setLibrary(prev => updateTrackMetadata(state.videoId, { title: state.title, author: state.author }, prev));
    }
  }, []);

  const handleLoadVideo = useCallback((videoId: string, url: string, deck: DeckId, sourceType: TrackSourceType = 'youtube', title?: string, author?: string) => {
    const ref = deck === 'A' ? deckARef : deckBRef;
    if (ref.current) {
      ref.current.loadVideo(url, sourceType, { title, author });
      setLibrary(prev => incrementPlayCount(videoId, prev));
      showNotification(`${sourceType === 'local' ? 'File' : 'Stream'} Loaded to Deck ${deck}`, 'success');
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
    if (id === 'A') setDeckAVolume(prev => prev > 0 ? 0 : 0.8);
    else setDeckBVolume(prev => prev > 0 ? 0 : 0.8);
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

  const targetEffect = fxTarget === 'A'
    ? deckAEffect
    : fxTarget === 'B'
      ? deckBEffect
      : deckAEffect === deckBEffect
        ? deckAEffect
        : null;
  const targetWet = fxTarget === 'A'
    ? deckAEffectWet
    : fxTarget === 'B'
      ? deckBEffectWet
      : (deckAEffectWet + deckBEffectWet) / 2;
  const targetIntensity = fxTarget === 'A'
    ? deckAEffectIntensity
    : fxTarget === 'B'
      ? deckBEffectIntensity
      : (deckAEffectIntensity + deckBEffectIntensity) / 2;
  const isMixedEffect = fxTarget === 'AB' && deckAEffect !== deckBEffect;
  const isMixedWet = fxTarget === 'AB' && Math.abs(deckAEffectWet - deckBEffectWet) > 0.01;
  const isMixedIntensity = fxTarget === 'AB' && Math.abs(deckAEffectIntensity - deckBEffectIntensity) > 0.01;
  const targetColor = fxTarget === 'A' ? '#D0BCFF' : fxTarget === 'B' ? '#F2B8B5' : '#E5D0F7';
  const streamingNotice = fxTarget === 'A'
    ? deckAState?.sourceType === 'youtube'
    : fxTarget === 'B'
      ? deckBState?.sourceType === 'youtube'
      : deckAState?.sourceType === 'youtube' || deckBState?.sourceType === 'youtube';
 const showMobileScrim = mobilePanel !== null;
  
  const handleRemoveMultiple = useCallback((ids: string[]) => {
    setLibrary(prev => prev.filter(track => !ids.includes(track.id)));
    showNotification(`Removed ${ids.length} items from Library`);
  }, []);

  useKeyboardShortcuts(deckARef, deckBRef, crossfader, setCrossfader, () => setShowHelp(p => !p), {
    muteDeck, pitchDeck, resetEq
  });

  useEffect(() => {
    const interval = setInterval(() => {
      [{ p: masterPlayerA, bv: deckAVolume, id: 'A' }, { p: masterPlayerB, bv: deckBVolume, id: 'B' }].forEach(({ p, bv, id }) => {
        if (!p || typeof p.setVolume !== 'function') return;
        const t = (crossfader + 1) / 2;
        let gain = id === 'A' ? (xFaderCurve === 'CUT' ? (t > 0.9 ? 0 : 1) : Math.cos((t * Math.PI) / 2)) : (xFaderCurve === 'CUT' ? (t < 0.1 ? 0 : 1) : Math.sin((t * Math.PI) / 2));
        try { p.setVolume(Math.round(bv * masterVolume * gain * 100)); } catch (e) {}
      });
    }, 50);
    return () => clearInterval(interval);
  }, [crossfader, xFaderCurve, masterVolume, deckAVolume, deckBVolume, masterPlayerA, masterPlayerB]);

  return (
    <ErrorBoundary>
       <div className="h-screen bg-[#1C1B1F] text-white flex flex-col md:flex-row overflow-hidden font-['Roboto']" data-theme={theme}>
        <nav className="hidden md:flex w-16 bg-black/40 border-r border-white/5 flex-col items-center py-8 gap-10 shrink-0">
          <button onClick={() => setViewMode('PERFORM')} className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'PERFORM' ? 'text-[#D0BCFF] scale-110' : 'text-gray-600 hover:text-gray-400'}`}>
            <span className="material-icons text-3xl">speed</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Perform</span>
          </button>
          <button onClick={() => setViewMode('LIBRARY')} className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'LIBRARY' ? 'text-[#D0BCFF] scale-110' : 'text-gray-600 hover:text-gray-400'}`}>
            <span className="material-icons text-3xl">grid_view</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Library</span>
          </button>
          <div className="flex flex-col gap-4 mt-auto">
            <button onClick={() => setLibraryOpen(!libraryOpen)} className={`text-gray-600 hover:text-white transition-transform ${libraryOpen ? '' : 'rotate-180'}`} title="Toggle Library">
              <span className="material-icons">chevron_left</span>
            </button>
            <button onClick={() => setQueueOpen(!queueOpen)} className={`text-gray-600 hover:text-white transition-transform ${queueOpen ? '' : 'rotate-180'}`} title="Toggle Queue">
              <span className="material-icons">playlist_play</span>
            </button>
            <button onClick={toggleTheme} className="text-gray-600 hover:text-white"><span className="material-icons">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span></button>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden relative min-h-0 pb-20 md:pb-0">
          {showMobileScrim && (
            <button
              className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
              onClick={() => setMobilePanel(null)}
              aria-label="Close panels"
            />
          )}
             {viewMode === 'LIBRARY' ? (
            <section className={`hidden md:flex bg-black/20 border-r border-white/5 overflow-hidden flex-col transition-all duration-300 flex-none h-full md:relative md:translate-x-0 md:w-[420px] ${libraryOpen ? 'md:w-[420px]' : 'md:w-0 md:border-none'}`}>
              <div className={`p-4 flex flex-col gap-4 h-full min-w-[320px] min-h-0 ${!libraryOpen ? 'opacity-0 md:opacity-100' : 'opacity-100 transition-opacity'}`}>
                <SearchPanel 
                  onLoadToDeck={(vid, url, deck, title, author) => handleLoadVideo(vid, url, deck, 'youtube', title, author)} 
                  onAddToQueue={handleAddToQueue} 
                  onAddToLibrary={(result) => {
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
                    onUpdateMetadata={(v, m) => { setLibrary(updateTrackMetadata(v, m, library)); showNotification('Metadata Saved'); }} 
                    onImportLibrary={setLibrary} 
                  />
                </div> 
              </div>
            </section>
          ) : (
           <section className={`hidden md:flex bg-black/20 border-r border-white/5 flex-col h-full shrink-0 md:w-[320px] md:relative md:translate-x-0 ${effectsOpen ? 'md:w-[320px]' : 'md:w-[320px]'}`}>              <div className="p-4 flex flex-col gap-4 h-full">
              <div className="p-4 flex flex-col gap-4 h-full">          
                  <EffectsPanel
                   activeEffect={targetEffect}
                  effectAmount={targetWet}
                  effectIntensity={targetIntensity}
                  onEffectToggle={(effect) => {
                    if (fxTarget === 'A') toggleEffect('A', effect);
                    else if (fxTarget === 'B') toggleEffect('B', effect);
                    else {
                      toggleEffect('A', effect);
                      toggleEffect('B', effect);
                    }
                  }}
                  onAmountChange={(amount) => {
                    if (fxTarget === 'A') setDeckAEffectWet(amount);
                    else if (fxTarget === 'B') setDeckBEffectWet(amount);
                    else {
                      setDeckAEffectWet(amount);
                      setDeckBEffectWet(amount);
                    }
                  }}
                  onIntensityChange={(amount) => {
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
              </div>
            </section>
          )}

           <section className="flex-1 flex flex-col p-4 items-center justify-center overflow-auto min-h-0" id="main-content">
            {/* Responsive performance layout: stacked on portrait, dual-deck on landscape/tablet. */}
            <div className="w-full flex flex-col gap-4">
              <div className="min-[568px]:hidden flex items-center justify-between bg-black/40 border border-white/10 rounded-full px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Deck Focus</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMobileDeckFocus('A')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${mobileDeckFocus === 'A' ? 'bg-[#D0BCFF] text-black' : 'text-gray-400'}`}
                    aria-pressed={mobileDeckFocus === 'A'}
                  >
                    Deck A
                  </button>
                  <button
                    onClick={() => setMobileDeckFocus('B')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${mobileDeckFocus === 'B' ? 'bg-[#F2B8B5] text-black' : 'text-gray-400'}`}
                    aria-pressed={mobileDeckFocus === 'B'}
                  >
                    Deck B
                  </button>
                </div>
              </div>
              <div className="flex flex-col min-[568px]:flex-row gap-4 items-center justify-center w-full">
                <div className={`w-full min-[568px]:flex-1 min-w-[240px] ${mobileDeckFocus === 'A' ? 'flex' : 'hidden'} min-[568px]:flex`}>
                  <Deck ref={deckARef} id="A" color="#D0BCFF" eq={deckAEq} effect={deckAEffect} effectWet={deckAEffectWet} effectIntensity={deckAEffectIntensity} onStateUpdate={s => handleDeckStateUpdate('A', s)} onPlayerReady={p => setMasterPlayerA(p)} />
                </div>
                <div className="w-full min-[568px]:w-[260px] max-w-md min-[568px]:max-w-[280px]">
                  <Mixer crossfader={crossfader} onCrossfaderChange={setCrossfader} crossfaderCurve={xFaderCurve} onCurveChange={setXFaderCurve} masterVolume={masterVolume} onMasterVolumeChange={setMasterVolume} deckAVolume={deckAVolume} onDeckAVolumeChange={setDeckAVolume} deckBVolume={deckBVolume} onDeckBVolumeChange={setDeckBVolume} deckAPlaying={deckAState?.playing || false} deckBPlaying={deckBState?.playing || false} deckAEq={deckAEq} deckBEq={deckBEq} onDeckAEqChange={(k, v) => setDeckAEq(p => ({...p, [k]: v}))} onDeckBEqChange={(k, v) => setDeckBEq(p => ({...p, [k]: v}))} />
                </div>
                <div className={`w-full min-[568px]:flex-1 min-w-[240px] ${mobileDeckFocus === 'B' ? 'flex' : 'hidden'} min-[568px]:flex`}>
                  <Deck ref={deckBRef} id="B" color="#F2B8B5" eq={deckBEq} effect={deckBEffect} effectWet={deckBEffectWet} effectIntensity={deckBEffectIntensity} onStateUpdate={s => handleDeckStateUpdate('B', s)} onPlayerReady={p => setMasterPlayerB(p)} />
                </div>
              </div>
            </div>
          </section>

          {viewMode === 'LIBRARY' && (
            <>
                  <aside className={`hidden md:flex bg-black/10 flex-none border-l border-white/5 flex-col transition-all duration-300 overflow-hidden md:relative md:translate-x-0 md:w-80 md:p-4 ${queueOpen ? 'md:w-80 md:p-4' : 'md:w-0 md:p-0 md:border-none'}`}>                <div className={`h-full min-w-[260px] ${!queueOpen ? 'opacity-0 md:opacity-100' : 'opacity-100 visible transition-opacity'}`}>
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Queue Console</span>
                    <button onClick={() => setQueueOpen(false)} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                  <QueuePanel 
                    queue={queue} 
                    onLoadToDeck={(i, d) => { handleLoadVideo(i.videoId, i.url, d, i.sourceType || 'youtube', i.title, i.author); setQueue(p => p.filter(q => q.id !== i.id)); }} 
                    onRemove={id => setQueue(p => p.filter(i => i.id !== id))} 
                    onClear={() => setQueue([])} 
                    onReorder={() => {}} 
                  />
                </div>
              </aside>
              
              {!queueOpen && (
                <button 
                  onClick={() => setQueueOpen(true)}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-[#D0BCFF] text-black w-8 h-20 rounded-l-xl items-center justify-center z-50 shadow-xl hover:w-10 transition-all"
                >
                  <span className="material-icons rotate-180">chevron_left</span>
                </button>
              )}
            </>
          )}
        </div>

        {showHelp && (
          <div className="fixed inset-0 z-[4000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
            <div className="m3-card bg-[#1D1B20] p-12 max-w-2xl w-full border-[#D0BCFF]/30 shadow-[0_0_100px_rgba(208,188,255,0.15)]">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black text-[#D0BCFF] tracking-[0.3em] uppercase">Shortcut Engine</h2>
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">Pro Mode Active</span>
               </div>
               <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                  <div>
                    <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Deck A (Left)</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">PLAY/PAUSE / CUE</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">Q / 1-4</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">LOOP / MUTE</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">S / M</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">PITCH +/-</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#D0BCFF]">[ / ]</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Deck B (Right)</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">PLAY/PAUSE / CUE</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">P / 7-0</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">LOOP / MUTE</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">K / N</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">PITCH +/-</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-[#F2B8B5]">; / '</span></div>
                    </div>
                  </div>
                  <div className="col-span-2 pt-4">
                    <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Global Mixer</h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">CROSSFADER</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">← / →</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">RESET EQs</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">R</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">CENTER X-FADER</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">Space</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">KNOB FINE-TUNE</span><span className="bg-white/10 px-3 py-1 rounded-lg mono text-white">Wheel</span></div>
                    </div>
                  </div>
               </div>
               <button onClick={() => setShowHelp(false)} className="w-full mt-12 py-5 bg-[#D0BCFF] text-black font-black rounded-2xl tracking-[0.5em] hover:bg-white transition-all">RESUME PERFORMANCE</button>
            </div>
          </div>
        )}

         <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 border-t border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-around py-2 px-3 text-xs">
            <button onClick={() => { setViewMode('PERFORM'); setMobilePanel(null); setEffectsOpen(false); setLibraryOpen(false); }} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${viewMode === 'PERFORM' && !mobilePanel ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>              <span className="material-icons text-lg">speed</span>
              <span className="uppercase tracking-widest text-[9px]">Perform</span>
            </button>
            <button onClick={() => { setViewMode('LIBRARY'); setMobilePanel('LIBRARY'); setLibraryOpen(true); setEffectsOpen(false); }} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${mobilePanel === 'LIBRARY' ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>
              <span className="material-icons text-lg">grid_view</span>
              <span className="uppercase tracking-widest text-[9px]">Library</span>
            </button>
            <button onClick={() => { setMobilePanel('QUEUE'); setViewMode('LIBRARY'); setQueueOpen(true); setLibraryOpen(false); setEffectsOpen(false); }} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${mobilePanel === 'QUEUE' ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>
              <span className="material-icons text-lg">playlist_play</span>
              <span className="uppercase tracking-widest text-[9px]">Queue</span>
            </button>
            <button onClick={() => { setViewMode('PERFORM'); setMobilePanel('EFFECTS'); setEffectsOpen(true); setLibraryOpen(false); }} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${mobilePanel === 'EFFECTS' ? 'text-[#D0BCFF]' : 'text-gray-400'}`}>
              <span className="material-icons text-lg">tune</span>
              <span className="uppercase tracking-widest text-[9px]">Effects</span>
            </button>
            <button onClick={toggleTheme} className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-gray-400">
              <span className="material-icons text-lg">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              <span className="uppercase tracking-widest text-[9px]">Theme</span>
            </button>
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
