import React, { memo } from 'react';
import MobileDeckView from './MobileDeckView';
import TouchControls from './TouchControls';
import SwipeableMixer from './SwipeableMixer';
import MobileBottomNav from './MobileBottomNav';
import LibraryPanel from '../desktop/LibraryPanel';
import QueuePanel from '../desktop/QueuePanel';
import EffectsPanel from '../desktop/EffectsPanel';
import SearchPanel from '../desktop/SearchPanel';
import { useUI } from '../../contexts/UIContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { useMixer } from '../../contexts/MixerContext';
import { useSwipeable } from '../../hooks/useSwipeable';

const MobileApp: React.FC = () => {
  const { activeMobileTab, showQueue, setShowQueue, openMixer, closeMixer } = useUI();
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
  const {
    deckAEffect,
    deckBEffect,
    deckAEffectWet,
    deckAEffectIntensity,
    deckBEffectWet,
    deckBEffectIntensity,
    fxTarget,
    setDeckAEffect,
    setDeckAEffectWet,
    setDeckAEffectIntensity,
    setDeckBEffect,
    setDeckBEffectWet,
    setDeckBEffectIntensity,
    setFxTarget
  } = useMixer();

  const mixSwipe = useSwipeable({
    onSwipedUp: openMixer,
    onSwipedDown: closeMixer
  });

  const librarySwipe = useSwipeable({
    onSwipedRight: () => setShowQueue(true),
    onSwipedLeft: () => setShowQueue(false)
  });

  return (
    <div className="min-h-screen bg-[#111016] text-white pb-24">
      {activeMobileTab === 'MIX' && (
        <div {...mixSwipe()} className="flex flex-col gap-4 px-3 pt-4">
          <MobileDeckView />
          <TouchControls />
          <SwipeableMixer />
        </div>
      )}

      {activeMobileTab === 'LIBRARY' && (
        <div {...librarySwipe()} className="flex flex-col gap-4 px-3 pt-4">
          {!showQueue ? (
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
                variant="mobile"
              />
            </>
          ) : (
            <QueuePanel
              queue={queue}
              onLoadToDeck={loadToDeck}
              onRemove={removeFromQueue}
              onClear={clearQueue}
              onReorder={() => undefined}
              variant="mobile"
            />
          )}
        </div>
      )}

      {activeMobileTab === 'FX' && (
        <div className="flex flex-col gap-4 px-3 pt-4">
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
            variant="mobile"
          />
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
};

export default memo(MobileApp);
