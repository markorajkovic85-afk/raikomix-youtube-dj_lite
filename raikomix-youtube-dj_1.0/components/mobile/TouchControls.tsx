import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useDeck } from '../../contexts/DeckContext';
import { triggerHaptic } from '../shared/AudioEngine';

const HOT_CUE_LABELS = ['CUE 1', 'CUE 2', 'CUE 3', 'CUE 4'];

const TouchControls: React.FC = () => {
  const { activeDeck, deckAState, deckBState, togglePlay, triggerHotCue, toggleLoop, setPlaybackRate } = useDeck();
  const deckState = activeDeck === 'A' ? deckAState : deckBState;
  const longPressTimer = useRef<number | null>(null);

  const handlePlayToggle = useCallback(() => {
    triggerHaptic();
    togglePlay(activeDeck);
  }, [activeDeck, togglePlay]);

  const handleCuePress = useCallback((index: number) => {
    triggerHotCue(activeDeck, index);
  }, [activeDeck, triggerHotCue]);

  const handleCueLongPress = useCallback((index: number) => {
    triggerHaptic([10, 20, 10]);
    triggerHotCue(activeDeck, index, true);
    triggerHotCue(activeDeck, index);
  }, [activeDeck, triggerHotCue]);

  const handlePointerDown = useCallback((index: number) => {
    longPressTimer.current = window.setTimeout(() => handleCueLongPress(index), 550);
  }, [handleCueLongPress]);

  const handlePointerUp = useCallback((index: number) => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      handleCuePress(index);
    }
  }, [handleCuePress]);

  const handlePitch = useCallback((delta: number) => {
    if (!deckState) return;
    const next = Math.max(0.5, Math.min(1.5, deckState.playbackRate + delta));
    setPlaybackRate(activeDeck, next);
  }, [activeDeck, deckState, setPlaybackRate]);

  const bpm = useMemo(() => deckState?.bpm ?? 0, [deckState]);

  return (
    <div className="flex flex-col gap-4 bg-[#141218] border border-white/10 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Deck {activeDeck}</p>
          <p className="text-lg font-bold text-white">{deckState?.title || 'No Track Loaded'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">BPM {bpm || '--'}</div>
          <button
            type="button"
            onClick={() => toggleLoop(activeDeck, 4)}
            className="min-w-[48px] min-h-[48px] rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined">repeat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {HOT_CUE_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onPointerDown={() => handlePointerDown(index)}
            onPointerUp={() => handlePointerUp(index)}
            onPointerLeave={() => handlePointerUp(index)}
            className="min-h-[48px] rounded-xl bg-[#1D1B20] border border-white/10 text-white text-[10px] font-bold uppercase"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handlePitch(-0.02)}
          className="min-w-[56px] min-h-[56px] rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center"
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button
          type="button"
          onClick={handlePlayToggle}
          className="min-w-[56px] min-h-[56px] rounded-full bg-[#D0BCFF] text-black flex items-center justify-center shadow-xl"
        >
          <span className="material-symbols-outlined text-3xl">{deckState?.playing ? 'pause' : 'play_arrow'}</span>
        </button>
        <button
          type="button"
          onClick={() => handlePitch(0.02)}
          className="min-w-[56px] min-h-[56px] rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  );
};

export default memo(TouchControls);
