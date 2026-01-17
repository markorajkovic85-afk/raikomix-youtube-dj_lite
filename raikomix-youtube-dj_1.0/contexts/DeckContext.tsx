import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { DeckHandle } from '../components/shared/DeckCore';
import { DeckId, PlayerState, TrackSourceType } from '../types';

interface DeckContextValue {
  deckARef: React.RefObject<DeckHandle>;
  deckBRef: React.RefObject<DeckHandle>;
  deckAState: PlayerState | null;
  deckBState: PlayerState | null;
  activeDeck: DeckId;
  setActiveDeck: (deck: DeckId) => void;
  masterPlayerA: any;
  masterPlayerB: any;
  updateDeckState: (id: DeckId, state: PlayerState) => void;
  setPlayerReady: (id: DeckId, player: any) => void;
  loadToDeck: (
    deck: DeckId,
    url: string,
    sourceType?: TrackSourceType,
    metadata?: { title?: string; author?: string }
  ) => void;
  togglePlay: (deck: DeckId) => void;
  triggerHotCue: (deck: DeckId, index: number, clear?: boolean) => void;
  toggleLoop: (deck: DeckId, beats?: number) => void;
  setPlaybackRate: (deck: DeckId, rate: number) => void;
}

const DeckContext = createContext<DeckContextValue | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deckARef = useRef<DeckHandle>(null);
  const deckBRef = useRef<DeckHandle>(null);
  const [deckAState, setDeckAState] = useState<PlayerState | null>(null);
  const [deckBState, setDeckBState] = useState<PlayerState | null>(null);
  const [activeDeck, setActiveDeck] = useState<DeckId>('A');
  const [masterPlayerA, setMasterPlayerA] = useState<any>(null);
  const [masterPlayerB, setMasterPlayerB] = useState<any>(null);

  const updateDeckState = useCallback((id: DeckId, state: PlayerState) => {
    if (id === 'A') setDeckAState(state);
    if (id === 'B') setDeckBState(state);
  }, []);

  const setPlayerReady = useCallback((id: DeckId, player: any) => {
    if (id === 'A') setMasterPlayerA(player);
    if (id === 'B') setMasterPlayerB(player);
  }, []);

  const resolveDeckRef = useCallback(
    (deck: DeckId) => (deck === 'A' ? deckARef : deckBRef),
    []
  );

  const loadToDeck = useCallback(
    (deck: DeckId, url: string, sourceType: TrackSourceType = 'youtube', metadata?: { title?: string; author?: string }) => {
      resolveDeckRef(deck).current?.loadVideo(url, sourceType, metadata);
    },
    [resolveDeckRef]
  );

  const togglePlay = useCallback(
    (deck: DeckId) => {
      resolveDeckRef(deck).current?.togglePlay();
    },
    [resolveDeckRef]
  );

  const triggerHotCue = useCallback(
    (deck: DeckId, index: number, clear?: boolean) => {
      resolveDeckRef(deck).current?.triggerHotCue(index, clear);
    },
    [resolveDeckRef]
  );

  const toggleLoop = useCallback(
    (deck: DeckId, beats?: number) => {
      resolveDeckRef(deck).current?.toggleLoop(beats);
    },
    [resolveDeckRef]
  );

  const setPlaybackRate = useCallback(
    (deck: DeckId, rate: number) => {
      resolveDeckRef(deck).current?.setPlaybackRate(rate);
    },
    [resolveDeckRef]
  );

  const value = useMemo(
    () => ({
      deckARef,
      deckBRef,
      deckAState,
      deckBState,
      activeDeck,
      setActiveDeck,
      masterPlayerA,
      masterPlayerB,
      updateDeckState,
      setPlayerReady,
      loadToDeck,
      togglePlay,
      triggerHotCue,
      toggleLoop,
      setPlaybackRate
    }),
    [
      activeDeck,
      deckAState,
      deckBState,
      loadToDeck,
      masterPlayerA,
      masterPlayerB,
      setPlaybackRate,
      setPlayerReady,
      toggleLoop,
      togglePlay,
      triggerHotCue,
      updateDeckState
    ]
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

export const useDeck = (): DeckContextValue => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};
