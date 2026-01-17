import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { LibraryTrack, Playlist, DeckId } from '../../types';
import { exportLibrary, loadPlaylists, savePlaylists } from '../../utils/libraryStorage';
import { extractPlaylistId, fetchPlaylistItems } from '../../utils/youtubeApi';
import { useSwipeable } from '../../hooks/useSwipeable';

interface LibraryPanelProps {
  library: LibraryTrack[];
  onAddSingle: (url: string) => void;
  onRemove: (id: string) => void;
  onRemoveMultiple: (ids: string[]) => void;
  onLoadToDeck: (track: LibraryTrack, deck: DeckId) => void;
  onAddToQueue: (track: LibraryTrack) => void;
  onUpdateMetadata: (videoId: string, meta: { title?: string; author?: string }) => void;
  onImportLibrary: (tracks: LibraryTrack[] | ((prev: LibraryTrack[]) => LibraryTrack[])) => void;
  variant?: 'desktop' | 'mobile';
}

interface TrackRowData {
  items: LibraryTrack[];
  onLoadToDeck: (track: LibraryTrack, deck: DeckId) => void;
  onAddToQueue: (track: LibraryTrack) => void;
  onRemove: (id: string) => void;
  onEdit: (track: LibraryTrack) => void;
  toggleSelect: (id: string) => void;
  selectedTracks: Set<string>;
  variant: 'desktop' | 'mobile';
}

const TrackRow: React.FC<ListChildComponentProps<TrackRowData>> = memo(({ index, style, data }) => {
  const track = data.items[index];
  const isSelected = data.selectedTracks.has(track.id);
  const bind = useSwipeable({
    onSwipedLeft: () => data.onRemove(track.id),
    onSwipedRight: () => data.onAddToQueue(track)
  });

  return (
    <div style={style} className="px-1">
      <div
        {...bind()}
        className={`flex items-center gap-3 p-3 rounded-xl border ${
          isSelected ? 'border-[#D0BCFF] bg-[#2A2533]' : 'border-white/5 bg-[#1D1B20]'
        } ${data.variant === 'mobile' ? 'min-h-[64px]' : 'min-h-[60px]'}`}
      >
        <button
          type="button"
          onClick={() => data.toggleSelect(track.id)}
          className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center"
          aria-pressed={isSelected}
        >
          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#D0BCFF]" />}
        </button>
        <img src={track.thumbnailUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{track.title}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 truncate">{track.author}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => data.onEdit(track)}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-white/10 text-white flex items-center justify-center"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            onClick={() => data.onLoadToDeck(track, 'A')}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-[#D0BCFF] text-black font-bold"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => data.onLoadToDeck(track, 'B')}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-[#F2B8B5] text-black font-bold"
          >
            B
          </button>
        </div>
      </div>
    </div>
  );
});

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  library,
  onAddSingle,
  onRemove,
  onRemoveMultiple,
  onLoadToDeck,
  onAddToQueue,
  onImportLibrary,
  onUpdateMetadata,
  variant = 'desktop'
}) => {
  const [url, setUrl] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>(() => loadPlaylists());
  const [activePl, setActivePl] = useState<string | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [editingTrack, setEditingTrack] = useState<LibraryTrack | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pullStartRef = useRef(0);

  useEffect(() => { savePlaylists(playlists); }, [playlists]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [debouncedSearch, searchInput]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const handleAddUrl = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddSingle(url.trim());
      setUrl('');
    }
  }, [onAddSingle, url]);

  const handleBulkImport = useCallback(async () => {
    if (!bulkText.trim()) return;
    setIsImporting(true);
    setImportStatus('Initializing ingestion...');

    const playlistId = extractPlaylistId(bulkText);

    try {
      if (playlistId) {
        const items = await fetchPlaylistItems(playlistId, (loaded, total) => {
          setImportStatus(`Ingesting: ${loaded}${total ? ` / ${total}` : ''} tracks...`);
        });

        if (items.length === 0) {
          throw new Error('No videos found in this playlist.');
        }

        const fetchedTracks: LibraryTrack[] = items.map(t => ({
          id: `yt_${Date.now()}_${t.videoId}_${Math.random().toString(36).substr(2, 4)}`,
          videoId: t.videoId!,
          url: `https://www.youtube.com/watch?v=${t.videoId}`,
          title: t.title || 'Unknown Title',
          author: t.author || 'Unknown Artist',
          thumbnailUrl: t.thumbnailUrl || '',
          addedAt: Date.now(),
          playCount: 0,
          sourceType: 'youtube'
        }));

        onImportLibrary(prevLibrary => {
          const newTracks = fetchedTracks.filter(ft => !prevLibrary.some(existing => existing.videoId === ft.videoId));
          if (newTracks.length > 0) {
            setImportStatus(`Success: Ingested ${newTracks.length} new tracks.`);
          } else {
            setImportStatus('Library already contains these tracks.');
          }
          return [...prevLibrary, ...newTracks];
        });

        setTimeout(() => {
          setShowBulkAdd(false);
          setBulkText('');
          setImportStatus('');
        }, 2500);
      } else {
        const lines = bulkText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length > 0) {
          lines.forEach(line => onAddSingle(line));
          setShowBulkAdd(false);
          setBulkText('');
        } else {
          setImportStatus('No valid playlist ID or URLs found.');
        }
      }
    } catch (error: any) {
      setImportStatus(`Error: ${error.message}`);
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  }, [bulkText, onAddSingle, onImportLibrary]);

  const handleLocalFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: LibraryTrack[] = Array.from(files).map((file: File) => ({
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      videoId: `local_${file.name}_${Date.now()}`,
      url: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''),
      author: 'Local File',
      thumbnailUrl: 'https://img.icons8.com/fluency/96/000000/audio-file.png',
      addedAt: Date.now(),
      playCount: 0,
      sourceType: 'local',
      fileName: file.name
    }));

    onImportLibrary(prev => [...prev, ...newTracks]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onImportLibrary]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedTracks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleBulkQueue = useCallback(() => {
    const tracksToQueue = library.filter(track => selectedTracks.has(track.id));
    tracksToQueue.forEach(track => onAddToQueue(track));
    setSelectedTracks(new Set());
  }, [library, onAddToQueue, selectedTracks]);

  const handleBulkRemove = useCallback(() => {
    onRemoveMultiple(Array.from(selectedTracks));
    setSelectedTracks(new Set());
  }, [onRemoveMultiple, selectedTracks]);

  const handleSelectAll = useCallback((filtered: LibraryTrack[]) => {
    if (selectedTracks.size === filtered.length && filtered.length > 0) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(filtered.map(track => track.id)));
    }
  }, [selectedTracks]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const currentPl = activePl ? playlists.find(p => p.id === activePl) : null;
  const filtered = useMemo(() => library
    .filter(track =>
      (!currentPl || currentPl.trackIds.includes(track.id)) &&
      (track.title.toLowerCase().includes(search.toLowerCase()) || track.author.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.addedAt - a.addedAt), [currentPl, library, search]);

  const listData = useMemo(() => ({
    items: filtered,
    onLoadToDeck,
    onAddToQueue,
    onRemove,
    onEdit: setEditingTrack,
    toggleSelect,
    selectedTracks,
    variant
  }), [filtered, onAddToQueue, onLoadToDeck, onRemove, selectedTracks, toggleSelect, variant]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop === 0) {
      pullStartRef.current = event.touches[0].clientY;
    }
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const pullDistance = event.changedTouches[0].clientY - pullStartRef.current;
    if (pullDistance > 60) {
      handleRefresh();
    }
    pullStartRef.current = 0;
  }, [handleRefresh]);

  return (
    <div className={`flex flex-col gap-4 p-4 bg-[#1C1B1F] rounded-xl border border-white/5 h-full min-h-0 overflow-hidden relative ${variant === 'mobile' ? 'pb-6' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalFileSelect}
        multiple
        accept="audio/*"
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Collection ({library.length})</h3>
          {selectedTracks.size > 0 && (
            <span className="text-[8px] font-bold text-[#D0BCFF] uppercase animate-pulse">{selectedTracks.size} Selected</span>
          )}
        </div>
        <div className="flex gap-2">
          {selectedTracks.size > 0 && (
            <>
              <button
                onClick={handleBulkRemove}
                className="min-h-[44px] px-4 rounded-lg bg-red-500/20 text-red-200 text-[10px] font-black uppercase"
              >
                Delete
              </button>
              <button
                onClick={handleBulkQueue}
                className="min-h-[44px] px-4 rounded-lg bg-[#D0BCFF] text-black text-[10px] font-black uppercase"
              >
                Queue
              </button>
            </>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 rounded-lg bg-white/5 text-gray-200"
            title="Import Local Files"
          >
            <span className="material-symbols-outlined">upload_file</span>
          </button>
          <button
            onClick={() => exportLibrary(library)}
            className="min-h-[44px] px-4 rounded-lg bg-white/5 text-gray-200"
            title="Export Library"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleAddUrl} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="Paste YouTube URL..."
          className="flex-1 bg-[#1D1B20] border border-white/10 rounded-full py-3 px-4 text-xs focus:outline-none focus:border-[#D0BCFF]"
        />
        <button type="submit" className="min-w-[44px] min-h-[44px] rounded-full bg-[#D0BCFF] text-black">
          <span className="material-symbols-outlined">add</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowBulkAdd(prev => !prev)}
          className="min-h-[44px] px-4 rounded-full bg-white/5 text-xs text-white"
        >
          Bulk Add
        </button>
        <button
          onClick={() => handleSelectAll(filtered)}
          className="min-h-[44px] px-4 rounded-full bg-white/5 text-xs text-white"
        >
          {selectedTracks.size === filtered.length && filtered.length > 0 ? 'Clear Selection' : 'Select All'}
        </button>
        <button
          onClick={handleRefresh}
          className="min-h-[44px] px-4 rounded-full bg-white/5 text-xs text-white"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {showBulkAdd && (
        <div className="flex flex-col gap-2 bg-[#15131A] border border-white/10 rounded-xl p-3">
          <textarea
            value={bulkText}
            onChange={event => setBulkText(event.target.value)}
            placeholder="Paste playlist URL or multiple URLs (one per line)..."
            className="min-h-[120px] bg-[#1D1B20] border border-white/10 rounded-lg p-3 text-xs"
          />
          <button
            onClick={handleBulkImport}
            disabled={isImporting}
            className="min-h-[44px] rounded-lg bg-[#D0BCFF] text-black font-bold"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          {importStatus && (
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{importStatus}</p>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={event => setSearchInput(event.target.value)}
          placeholder="Search library..."
          className="w-full bg-[#1D1B20] border border-white/10 rounded-full py-3 pl-10 pr-4 text-xs"
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
      </div>

      <div
        className="flex-1 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs uppercase tracking-widest">No tracks found</div>
        ) : (
          <List
            height={variant === 'mobile' ? 380 : 520}
            itemCount={filtered.length}
            itemSize={variant === 'mobile' ? 76 : 72}
            width="100%"
            itemData={listData}
          >
            {TrackRow}
          </List>
        )}
      </div>

      {editingTrack && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="bg-[#1C1B1F] p-4 rounded-xl border border-white/10 w-[320px]">
            <h4 className="text-white font-bold mb-3">Edit Metadata</h4>
            <input
              type="text"
              value={editingTrack.title}
              onChange={event => setEditingTrack({ ...editingTrack, title: event.target.value })}
              className="w-full bg-[#15131A] border border-white/10 rounded-lg p-2 text-xs mb-2"
            />
            <input
              type="text"
              value={editingTrack.author}
              onChange={event => setEditingTrack({ ...editingTrack, author: event.target.value })}
              className="w-full bg-[#15131A] border border-white/10 rounded-lg p-2 text-xs mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingTrack(null)}
                className="flex-1 min-h-[44px] rounded-lg bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateMetadata(editingTrack.videoId, { title: editingTrack.title, author: editingTrack.author });
                  setEditingTrack(null);
                }}
                className="flex-1 min-h-[44px] rounded-lg bg-[#D0BCFF] text-black font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(LibraryPanel);
