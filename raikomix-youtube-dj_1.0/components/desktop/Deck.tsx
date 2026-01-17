import React, { forwardRef, memo, useCallback } from 'react';
import DeckCore, { DeckHandle } from '../shared/DeckCore';
import { useDeck } from '../../contexts/DeckContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useMixer } from '../../contexts/MixerContext';
import { DeckId, PlayerState } from '../../types';

interface DeckProps {
  id: DeckId;
}

const Deck = forwardRef<DeckHandle, DeckProps>(({ id }, ref) => {
  const { updateDeckState, setPlayerReady } = useDeck();
  const { updateMetadata } = useLibrary();
  const {
    deckAEq,
    deckBEq,
    deckAEffect,
    deckAEffectWet,
    deckAEffectIntensity,
    deckBEffect,
    deckBEffectWet,
    deckBEffectIntensity
  } = useMixer();

  const eq = id === 'A' ? deckAEq : deckBEq;
  const effect = id === 'A' ? deckAEffect : deckBEffect;
  const effectWet = id === 'A' ? deckAEffectWet : deckBEffectWet;
  const effectIntensity = id === 'A' ? deckAEffectIntensity : deckBEffectIntensity;
  const color = id === 'A' ? '#D0BCFF' : '#F2B8B5';

  const handleStateUpdate = useCallback((state: PlayerState) => {
    updateDeckState(id, state);
    if (state.isReady && state.title && state.videoId && state.sourceType === 'youtube') {
      updateMetadata(state.videoId, { title: state.title, author: state.author });
    }
  }, [id, updateDeckState, updateMetadata]);

  return (
    <DeckCore
      ref={ref}
      id={id}
      color={color}
      eq={eq}
      effect={effect}
      effectWet={effectWet}
      effectIntensity={effectIntensity}
      onStateUpdate={handleStateUpdate}
      onPlayerReady={player => setPlayerReady(id, player)}
    />
  );
});

export default memo(Deck);
