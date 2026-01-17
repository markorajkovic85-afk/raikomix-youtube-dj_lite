import React, { memo, useCallback, useState } from 'react';
import Deck from './Deck';
import Mixer from './Mixer';
import LibraryPanel from './LibraryPanel';
import QueuePanel from './QueuePanel';
import SearchPanel from './SearchPanel';
import EffectsPanel from './EffectsPanel';
import { useDeck } from '../../contexts/DeckContext';
import { useMixer } from '../../contexts/MixerContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useUI } from '../../contexts/UIContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const DesktopApp: React.FC = () => {
  const { deckARef, deckBRef, deckAState, deckBState } = useDeck();
  const {
    crossfader,
    crossfaderCurve,
    masterVolume,
    deckAVolume,
    deckBVolume,
    deckAEq,
    deckBEq,
    deckAEffect,
    deckAEffectWet,
    deckAEffectIntensity,
    deckBEffect,
    deckBEffectWet,
    deckBEffectIntensity,
    fxTarget,
    setCrossfader,
    setCrossfaderCurve,
    setMasterVolume,
    setDeckAVolume,
    setDeckBVolume,
    setDeckAEq,
    setDeckBEq,
    setDeckAEffect,
    setDeckAEffectWet,
    setDeckAEffectIntensity,
    setDeckBEffect,
    setDeckBEffectWet,
    setDeckBEffectIntensity,
    setFxTarget
  } = useMixer();
  const {
    library,
    queue,
    addUrlToLibrary,
    addResultToLibrary,
    importLibrary,
    removeFromLibraryById,
    removeFromLibraryMultiple,
    addToQueue,
    removeFromQueue,
    clearQueue,
    loadToDeck,
    updateMetadata
  } = useLibrary();
  const { desktopPanelTab, setDesktopPanelTab, toggleTheme, theme } = useUI();
  const [showHelp, setShowHelp] = useState(false);

  const resetEq = useCallback(() => {
    setDeckAEq('hi', 1);
    setDeckAEq('mid', 1);
    setDeckAEq('low', 1);
    setDeckAEq('filter', 0);
    setDeckBEq('hi', 1);
    setDeckBEq('mid', 1);
    setDeckBEq('low', 1);
    setDeckBEq('filter', 0);
  }, [setDeckAEq, setDeckBEq]);

  const muteDeck = useCallback((id: 'A' | 'B') => {
    if (id === 'A') {
      setDeckAVolume(deckAVolume > 0 ? 0 : 0.8);
    } else {
      setDeckBVolume(deckBVolume > 0 ? 0 : 0.8);
    }
  }, [deckAVolume, deckBVolume, setDeckAVolume, setDeckBVolume]);

  const pitchDeck = useCallback((id: 'A' | 'B', delta: number) => {
    const state = id === 'A' ? deckAState : deckBState;
    const ref = id === 'A' ? deckARef : deckBRef;
    if (!state || !ref.current) return;
    ref.current.setPlaybackRate(state.playbackRate + delta);
  }, [deckARef, deckAState, deckBRef, deckBState]);

  useKeyboardShortcuts(deckARef, deckBRef, crossfader, setCrossfader, () => setShowHelp(prev => !prev), {
    resetEq,
    muteDeck,
    pitchDeck
  });

  return (
    <div className="min-h-screen bg-[#111016] text-white p-4">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Raikomix DJ</h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Performance Mode</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[44px] px-4 rounded-full bg-white/5 text-xs uppercase tracking-widest"
          >
            Theme: {theme}
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="min-h-[44px] px-4 rounded-full bg-white/5 text-xs uppercase tracking-widest"
          >
            Help
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDesktopPanelTab('LIBRARY')}
              className={`flex-1 min-h-[44px] rounded-full text-xs font-bold uppercase ${
                desktopPanelTab === 'LIBRARY' ? 'bg-[#D0BCFF] text-black' : 'bg-white/5 text-white'
              }`}
            >
              Library
            </button>
            <button
              type="button"
              onClick={() => setDesktopPanelTab('QUEUE')}
              className={`flex-1 min-h-[44px] rounded-full text-xs font-bold uppercase ${
                desktopPanelTab === 'QUEUE' ? 'bg-[#D0BCFF] text-black' : 'bg-white/5 text-white'
              }`}
            >
              Queue
            </button>
          </div>

          {desktopPanelTab === 'LIBRARY' ? (
            <>
              <SearchPanel
                onLoadToDeck={(videoId, url, deck, title, author) =>
                  loadToDeck({ videoId, title, thumbnailUrl: '', channelTitle: author }, deck)
                }
                onAddToQueue={addToQueue}
                onAddToLibrary={addResultToLibrary}
              />
              <LibraryPanel
                library={library}
                onAddSingle={addUrlToLibrary}
                onRemove={removeFromLibraryById}
                onRemoveMultiple={removeFromLibraryMultiple}
                onLoadToDeck={loadToDeck}
                onAddToQueue={addToQueue}
                onImportLibrary={importLibrary}
                onUpdateMetadata={updateMetadata}
              />
            </>
          ) : (
            <QueuePanel
              queue={queue}
              onLoadToDeck={loadToDeck}
              onRemove={removeFromQueue}
              onClear={clearQueue}
              onReorder={() => undefined}
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Deck ref={deckARef} id="A" />
            <Deck ref={deckBRef} id="B" />
          </div>
          <Mixer
            crossfader={crossfader}
            onCrossfaderChange={setCrossfader}
            crossfaderCurve={crossfaderCurve}
            onCurveChange={setCrossfaderCurve}
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
            deckAVolume={deckAVolume}
            onDeckAVolumeChange={setDeckAVolume}
            deckBVolume={deckBVolume}
            onDeckBVolumeChange={setDeckBVolume}
            deckAPlaying={deckAState?.playing ?? false}
            deckBPlaying={deckBState?.playing ?? false}
            deckAEq={deckAEq}
            deckBEq={deckBEq}
            onDeckAEqChange={setDeckAEq}
            onDeckBEqChange={setDeckBEq}
          />
        </div>

        <div className="flex flex-col gap-4">
          <EffectsPanel
            deckAEffect={deckAEffect}
            deckBEffect={deckBEffect}
            deckAEffectWet={deckAEffectWet}
            deckAEffectIntensity={deckAEffectIntensity}
            deckBEffectWet={deckBEffectWet}
            deckBEffectIntensity={deckBEffectIntensity}
            fxTarget={fxTarget}
            onEffectChange={(deck, effect) => deck === 'A' ? setDeckAEffect(effect) : setDeckBEffect(effect)}
            onEffectWetChange={(deck, value) => deck === 'A' ? setDeckAEffectWet(value) : setDeckBEffectWet(value)}
            onEffectIntensityChange={(deck, value) => deck === 'A' ? setDeckAEffectIntensity(value) : setDeckBEffectIntensity(value)}
            onFxTargetChange={setFxTarget}
          />
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1C1B1F] rounded-2xl p-6 border border-white/10 max-w-lg">
            <h2 className="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
            <ul className="text-xs text-gray-300 space-y-2">
              <li>Q/P: Play/Pause Deck A/B</li>
              <li>1-4 / 7-0: Hot Cues A/B</li>
              <li>Arrow Left/Right: Crossfader</li>
              <li>R: Reset EQ</li>
              <li>?: Toggle Help</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-4 min-h-[44px] px-4 rounded-full bg-[#D0BCFF] text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DesktopApp);
