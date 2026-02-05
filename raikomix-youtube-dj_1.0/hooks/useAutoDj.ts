import { useState, useEffect, useCallback, useRef } from 'react';
import { AutoDjState, QueueItem, DeckId, PlayerState } from '../types';

interface UseAutoDjOptions {
  queue: QueueItem[];
  deckAState: PlayerState | null;
  deckBState: PlayerState | null;
  onLoadToDeck: (videoId: string, url: string, deck: DeckId, sourceType: any, title?: string, author?: string) => void;
  onRemoveFromQueue: (id: string) => void;
  onCrossfaderChange: (value: number) => void;
  currentCrossfader: number;
}

const AUTO_DJ_STORAGE_KEY = 'raikomix-auto-dj-settings';

interface AutoDjSettings {
  mixLeadSeconds: number;
  mixDurationSeconds: number;
}

const loadAutoDjSettings = (): AutoDjSettings => {
  try {
    const stored = localStorage.getItem(AUTO_DJ_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load Auto DJ settings:', error);
  }
  return { mixLeadSeconds: 12, mixDurationSeconds: 6 };
};

const saveAutoDjSettings = (settings: AutoDjSettings) => {
  try {
    localStorage.setItem(AUTO_DJ_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save Auto DJ settings:', error);
  }
};

export const useAutoDj = (options: UseAutoDjOptions) => {
  const {
    queue,
    deckAState,
    deckBState,
    onLoadToDeck,
    onRemoveFromQueue,
    onCrossfaderChange,
    currentCrossfader
  } = options;

  const savedSettings = loadAutoDjSettings();

  const [autoDj, setAutoDj] = useState<AutoDjState>({
    enabled: false,
    mixLeadSeconds: savedSettings.mixLeadSeconds,
    mixDurationSeconds: savedSettings.mixDurationSeconds,
    pendingMix: null,
    preloadedTrack: null,
    earlyStartedTrack: null,
    lastMixVideo: {},
    autoLoadDeck: null,
    manualPause: { A: false, B: false },
    autoStop: { A: false, B: false }
  });

  const mixingRef = useRef(false);
  const crossfaderAnimationRef = useRef<number | null>(null);

  // Save settings when they change
  useEffect(() => {
    saveAutoDjSettings({
      mixLeadSeconds: autoDj.mixLeadSeconds,
      mixDurationSeconds: autoDj.mixDurationSeconds
    });
  }, [autoDj.mixLeadSeconds, autoDj.mixDurationSeconds]);

  // Determine which deck is active based on crossfader position
  const getActiveDeck = useCallback((): DeckId => {
    return currentCrossfader < 0 ? 'A' : 'B';
  }, [currentCrossfader]);

  // Get the opposite deck
  const getOppositeDeck = useCallback((deck: DeckId): DeckId => {
    return deck === 'A' ? 'B' : 'A';
  }, []);

  // Get state for specific deck
  const getDeckState = useCallback((deck: DeckId): PlayerState | null => {
    return deck === 'A' ? deckAState : deckBState;
  }, [deckAState, deckBState]);

  // Calculate time remaining for a deck
  const getTimeRemaining = useCallback((deck: DeckId): number => {
    const state = getDeckState(deck);
    if (!state || !state.duration) return Infinity;
    return state.duration - state.currentTime;
  }, [getDeckState]);

  // Check if track is ending soon
  const isTrackEndingSoon = useCallback((deck: DeckId): boolean => {
    const remaining = getTimeRemaining(deck);
    return remaining <= autoDj.mixLeadSeconds && remaining > 0;
  }, [getTimeRemaining, autoDj.mixLeadSeconds]);

  // Preload next track from queue
  const preloadNextTrack = useCallback(() => {
    if (queue.length === 0 || autoDj.preloadedTrack) return;

    const activeDeck = getActiveDeck();
    const targetDeck = getOppositeDeck(activeDeck);
    const nextItem = queue[0];

    // Load track to opposite deck
    onLoadToDeck(
      nextItem.videoId,
      nextItem.url,
      targetDeck,
      nextItem.sourceType || 'youtube',
      nextItem.title,
      nextItem.author
    );

    setAutoDj(prev => ({
      ...prev,
      preloadedTrack: {
        deck: targetDeck,
        itemId: nextItem.id,
        videoId: nextItem.videoId
      },
      autoLoadDeck: targetDeck
    }));

    // Remove from queue after loading
    setTimeout(() => {
      onRemoveFromQueue(nextItem.id);
    }, 500);
  }, [queue, autoDj.preloadedTrack, getActiveDeck, getOppositeDeck, onLoadToDeck, onRemoveFromQueue]);

  // Start the mix (crossfade animation)
  const startMix = useCallback((fromDeck: DeckId, toDeck: DeckId) => {
    if (mixingRef.current) return;
    mixingRef.current = true;

    const fromPosition = fromDeck === 'A' ? -1 : 1;
    const toPosition = toDeck === 'A' ? -1 : 1;
    const mixDuration = autoDj.mixDurationSeconds * 1000; // Convert to ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / mixDuration, 1);

      // Smooth easing function
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const newPosition = fromPosition + (toPosition - fromPosition) * easeProgress;
      onCrossfaderChange(newPosition);

      if (progress < 1) {
        crossfaderAnimationRef.current = requestAnimationFrame(animate);
      } else {
        mixingRef.current = false;
        crossfaderAnimationRef.current = null;

        // Clear preloaded track after mix completes
        setAutoDj(prev => ({
          ...prev,
          preloadedTrack: null,
          pendingMix: null,
          lastMixVideo: {
            ...prev.lastMixVideo,
            [toDeck]: getDeckState(toDeck)?.videoId || ''
          }
        }));
      }
    };

    animate();
  }, [autoDj.mixDurationSeconds, onCrossfaderChange, getDeckState]);

  // Schedule a pending mix
  const scheduleMix = useCallback(() => {
    if (autoDj.pendingMix || !autoDj.preloadedTrack || queue.length === 0) return;

    const activeDeck = getActiveDeck();
    const targetDeck = autoDj.preloadedTrack.deck;
    const nextItem = queue[0];

    setAutoDj(prev => ({
      ...prev,
      pendingMix: {
        deck: targetDeck,
        fromDeck: activeDeck,
        item: nextItem
      }
    }));
  }, [autoDj.pendingMix, autoDj.preloadedTrack, queue, getActiveDeck]);

  // Execute the mix when track is ending
  const executeMix = useCallback(() => {
    if (!autoDj.pendingMix || mixingRef.current) return;

    const { fromDeck, deck: toDeck } = autoDj.pendingMix;
    startMix(fromDeck, toDeck);
  }, [autoDj.pendingMix, startMix]);

  // Main Auto DJ polling loop (runs every 250ms when enabled)
  useEffect(() => {
    if (!autoDj.enabled) return;

    const interval = setInterval(() => {
      const activeDeck = getActiveDeck();
      const activeState = getDeckState(activeDeck);

      // Skip if active deck is not playing
      if (!activeState || !activeState.playing || !activeState.duration) return;

      // Step 1: Preload next track if needed
      if (!autoDj.preloadedTrack && queue.length > 0) {
        preloadNextTrack();
      }

      // Step 2: Schedule mix if track is ending soon
      if (!autoDj.pendingMix && autoDj.preloadedTrack && isTrackEndingSoon(activeDeck)) {
        scheduleMix();
      }

      // Step 3: Execute mix if scheduled
      if (autoDj.pendingMix && !mixingRef.current) {
        const remaining = getTimeRemaining(activeDeck);
        if (remaining <= autoDj.mixLeadSeconds) {
          executeMix();
        }
      }
    }, 250); // Poll every 250ms

    return () => {
      clearInterval(interval);
      if (crossfaderAnimationRef.current) {
        cancelAnimationFrame(crossfaderAnimationRef.current);
      }
    };
  }, [
    autoDj.enabled,
    autoDj.preloadedTrack,
    autoDj.pendingMix,
    autoDj.mixLeadSeconds,
    queue,
    getActiveDeck,
    getDeckState,
    isTrackEndingSoon,
    getTimeRemaining,
    preloadNextTrack,
    scheduleMix,
    executeMix
  ]);

  // Public API
  const toggleAutoDj = useCallback(() => {
    setAutoDj(prev => {
      const newEnabled = !prev.enabled;
      
      // Cancel any ongoing mix when disabling
      if (!newEnabled && crossfaderAnimationRef.current) {
        cancelAnimationFrame(crossfaderAnimationRef.current);
        crossfaderAnimationRef.current = null;
        mixingRef.current = false;
      }

      return {
        ...prev,
        enabled: newEnabled,
        pendingMix: newEnabled ? prev.pendingMix : null,
        preloadedTrack: newEnabled ? prev.preloadedTrack : null
      };
    });
  }, []);

  const setMixLeadSeconds = useCallback((seconds: number) => {
    setAutoDj(prev => ({ ...prev, mixLeadSeconds: Math.max(4, Math.min(30, seconds)) }));
  }, []);

  const setMixDurationSeconds = useCallback((seconds: number) => {
    setAutoDj(prev => ({ ...prev, mixDurationSeconds: Math.max(2, Math.min(20, seconds)) }));
  }, []);

  const getCountdown = useCallback((): number | null => {
    if (!autoDj.enabled || !autoDj.pendingMix) return null;
    const activeDeck = getActiveDeck();
    const remaining = getTimeRemaining(activeDeck);
    return Math.max(0, remaining);
  }, [autoDj.enabled, autoDj.pendingMix, getActiveDeck, getTimeRemaining]);

  const getNextTrackInfo = useCallback(() => {
    if (queue.length === 0) return null;
    return queue[0];
  }, [queue]);

  return {
    autoDj,
    toggleAutoDj,
    setMixLeadSeconds,
    setMixDurationSeconds,
    getCountdown,
    getNextTrackInfo,
    isAutoDjActive: autoDj.enabled,
    isMixPending: !!autoDj.pendingMix,
    nextDeck: autoDj.preloadedTrack?.deck || null
  };
};
