import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addTrackToLibrary, incrementPlayCount, loadLibrary, removeFromLibrary, saveLibrary, updateTrackMetadata } from '../utils/libraryStorage';
import { DeckId, LibraryTrack, QueueItem, TrackSourceType, YouTubeSearchResult } from '../types';
import { useDeck } from './DeckContext';
import { useUI } from './UIContext';

interface LibraryContextValue {
  library: LibraryTrack[];
  queue: QueueItem[];
  addUrlToLibrary: (url: string) => void;
  addResultToLibrary: (result: YouTubeSearchResult) => void;
  importLibrary: (tracks: LibraryTrack[] | ((prev: LibraryTrack[]) => LibraryTrack[])) => void;
  removeFromLibraryById: (id: string) => void;
  removeFromLibraryMultiple: (ids: string[]) => void;
  addToQueue: (track: LibraryTrack | YouTubeSearchResult) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  loadToDeck: (
    item: LibraryTrack | QueueItem | YouTubeSearchResult,
    deck: DeckId,
    sourceType?: TrackSourceType
  ) => void;
  updateMetadata: (videoId: string, meta: { title?: string; author?: string }) => void;
  reorderQueue: (from: number, to: number) => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<LibraryTrack[]>(() => loadLibrary());
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const { loadToDeck: loadDeck, setActiveDeck } = useDeck();
  const { showToast } = useUI();

  useEffect(() => {
    saveLibrary(library);
  }, [library]);

  const addUrlToLibrary = useCallback(
    (url: string) => {
      const { success, track, error } = addTrackToLibrary(url, library);
      if (success && track) {
        setLibrary(prev => [track, ...prev]);
        showToast('Track added to library', 'success');
      } else {
        showToast(error || 'Unable to add track', 'error');
      }
    },
    [library, showToast]
  );

  const addResultToLibrary = useCallback(
    (result: YouTubeSearchResult) => {
      if (library.some(track => track.videoId === result.videoId)) {
        showToast('Track already in library', 'warning');
        return;
      }
      const newTrack: LibraryTrack = {
        id: `${Date.now()}_${result.videoId}`,
        videoId: result.videoId,
        url: `https://www.youtube.com/watch?v=${result.videoId}`,
        title: result.title,
        author: result.channelTitle,
        thumbnailUrl: result.thumbnailUrl,
        addedAt: Date.now(),
        playCount: 0,
        sourceType: 'youtube'
      };
      setLibrary(prev => [newTrack, ...prev]);
      showToast('Track saved to library', 'success');
    },
    [library, showToast]
  );

  const importLibrary = useCallback(
    (tracks: LibraryTrack[] | ((prev: LibraryTrack[]) => LibraryTrack[])) => {
      setLibrary(prev => (typeof tracks === 'function' ? tracks(prev) : tracks));
    },
    []
  );

  const removeFromLibraryById = useCallback((id: string) => {
    setLibrary(prev => removeFromLibrary(id, prev));
  }, []);

  const removeFromLibraryMultiple = useCallback((ids: string[]) => {
    setLibrary(prev => prev.filter(track => !ids.includes(track.id)));
  }, []);

  const addToQueue = useCallback(
    (track: LibraryTrack | YouTubeSearchResult) => {
      const item: QueueItem = {
        id: `${Date.now()}_${track.videoId}`,
        videoId: track.videoId,
        url: 'addedAt' in track ? track.url : `https://www.youtube.com/watch?v=${track.videoId}`,
        title: track.title,
        thumbnailUrl: track.thumbnailUrl,
        addedAt: Date.now(),
        author: 'addedAt' in track ? track.author : track.channelTitle,
        sourceType: 'sourceType' in track ? track.sourceType : 'youtube'
      };
      setQueue(prev => [...prev, item]);
      showToast('Added to queue', 'success');
    },
    [showToast]
  );

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const loadToDeck = useCallback(
    (item: LibraryTrack | QueueItem | YouTubeSearchResult, deck: DeckId, sourceType: TrackSourceType = 'youtube') => {
      const url = 'url' in item ? item.url : `https://www.youtube.com/watch?v=${item.videoId}`;
      loadDeck(deck, url, sourceType, {
        title: item.title,
        author: 'author' in item ? item.author : item.channelTitle
      });
      setLibrary(prev => incrementPlayCount(item.videoId, prev));
      setActiveDeck(deck);
      showToast(`Loaded to Deck ${deck}`, 'success');
    },
    [loadDeck, setActiveDeck, showToast]
  );

  const updateMetadata = useCallback((videoId: string, meta: { title?: string; author?: string }) => {
    setLibrary(prev => updateTrackMetadata(videoId, meta, prev));
  }, []);

  const reorderQueue = useCallback((from: number, to: number) => {
    setQueue(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
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
      updateMetadata,
      reorderQueue
    }),
    [
      addResultToLibrary,
      addToQueue,
      addUrlToLibrary,
      clearQueue,
      importLibrary,
      library,
      loadToDeck,
      queue,
      removeFromLibraryById,
      removeFromLibraryMultiple,
      removeFromQueue,
      reorderQueue,
      updateMetadata
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryContextValue => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
