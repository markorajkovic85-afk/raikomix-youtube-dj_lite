import React, { useState, useEffect } from 'react';
import { PerformancePad, PadMode, QueueItem, LibraryTrack } from '../types';
import { DEFAULT_PAD_COLORS } from '../utils/padsStorage';
import { triggerHaptic } from '../utils/haptics';

interface MobilePadConfigDialogProps {
  padIndex: number;
  pad: PerformancePad;
  queue: QueueItem[];
  library: LibraryTrack[];
  onSave: (padIndex: number, config: Partial<PerformancePad>) => void;
  onClear: (padIndex: number) => void;
  onClose: () => void;
}

const MobilePadConfigDialog: React.FC<MobilePadConfigDialogProps> = ({
  padIndex,
  pad,
  queue,
  library,
  onSave,
  onClear,
  onClose
}) => {
  const [name, setName] = useState(pad.name || '');
  const [sourceTab, setSourceTab] = useState<'QUEUE' | 'LIBRARY'>('QUEUE');
  const [selectedVideoId, setSelectedVideoId] = useState(pad.videoId || '');
  const [selectedUrl, setSelectedUrl] = useState(pad.url || '');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [cuePoint, setCuePoint] = useState(pad.cuePoint || 0);
  const [mode, setMode] = useState<PadMode>(pad.mode || 'ONE_SHOT');
  const [volume, setVolume] = useState(pad.volume !== undefined ? pad.volume : 0.8);
  const [color, setColor] = useState(pad.color || DEFAULT_PAD_COLORS[padIndex % DEFAULT_PAD_COLORS.length]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    // Find selected track title
    if (selectedVideoId) {
      const queueTrack = queue.find(q => q.videoId === selectedVideoId);
      const libTrack = library.find(l => l.videoId === selectedVideoId);
      setSelectedTitle(queueTrack?.title || libTrack?.title || '');
    }
  }, [selectedVideoId, queue, library]);

  const handleSourceSelect = (videoId: string, url: string) => {
    setSelectedVideoId(videoId);
    setSelectedUrl(url);
    triggerHaptic('light');
  };

  const handleSave = () => {
    if (!selectedVideoId || !selectedUrl) {
      triggerHaptic('error');
      return;
    }

    onSave(padIndex, {
      name: name || `Pad ${padIndex + 1}`,
      videoId: selectedVideoId,
      url: selectedUrl,
      cuePoint,
      mode,
      volume,
      color
    });

    triggerHaptic('success');
    onClose();
  };

  const handleClear = () => {
    onClear(padIndex);
    triggerHaptic('success');
    onClose();
  };

  const sources = sourceTab === 'QUEUE' ? queue : library;

  return (
    <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="m3-card bg-[#1D1B20] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: color, color: '#000' }}
            >
              {padIndex + 1}
            </div>
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              Configure Pad
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pad Name */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Pad Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Pad ${padIndex + 1}`}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              maxLength={20}
            />
          </div>

          {/* Source Selection */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Audio Source
            </label>
            
            {/* Source Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSourceTab('QUEUE')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  sourceTab === 'QUEUE'
                    ? 'bg-purple-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Queue ({queue.length})
              </button>
              <button
                onClick={() => setSourceTab('LIBRARY')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  sourceTab === 'LIBRARY'
                    ? 'bg-purple-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Library ({library.length})
              </button>
            </div>

            {/* Source List */}
            <div className="max-h-40 overflow-y-auto space-y-1 bg-black/30 rounded-lg p-2">
              {sources.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-xs">
                  No {sourceTab === 'QUEUE' ? 'queued' : 'library'} tracks
                </div>
              )}
              {sources.map((track) => {
                const isSelected = selectedVideoId === track.videoId;
                return (
                  <button
                    key={track.videoId}
                    onClick={() => handleSourceSelect(track.videoId, track.url)}
                    className={`w-full p-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border border-purple-500'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className={`text-[10px] font-semibold truncate ${
                      isSelected ? 'text-purple-400' : 'text-white'
                    }`}>
                      {track.title}
                    </div>
                    <div className="text-[8px] text-gray-400 truncate">
                      {track.author || 'Unknown Artist'}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedVideoId && (
              <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-purple-400">check_circle</span>
                  <span className="text-[10px] text-purple-300 font-medium truncate">
                    {selectedTitle}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cue Point */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Cue Point
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">
                {Math.floor(cuePoint)}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="1"
              value={cuePoint}
              onChange={(e) => setCuePoint(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[8px] text-gray-500 mt-1">
              <span>0s</span>
              <span>5min</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Playback Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('ONE_SHOT')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === 'ONE_SHOT'
                    ? 'bg-purple-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm block mb-1">play_arrow</span>
                One-Shot
              </button>
              <button
                onClick={() => setMode('LOOP')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  mode === 'LOOP'
                    ? 'bg-purple-500 text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm block mb-1">loop</span>
                Loop
              </button>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Volume
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Pad Color
            </label>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full p-3 rounded-lg border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-white font-medium">{color}</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                {showColorPicker ? 'expand_less' : 'palette'}
              </span>
            </button>

            {showColorPicker && (
              <div className="mt-2 grid grid-cols-6 gap-2 p-2 bg-black/30 rounded-lg">
                {DEFAULT_PAD_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => {
                      setColor(presetColor);
                      setShowColorPicker(false);
                      triggerHaptic('light');
                    }}
                    className={`w-full aspect-square rounded-lg transition-all ${
                      color === presetColor
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleSave}
            disabled={!selectedVideoId}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black rounded-xl uppercase tracking-wider transition-all disabled:cursor-not-allowed"
          >
            Save Pad
          </button>
          
          {pad.videoId && (
            <button
              onClick={handleClear}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg uppercase tracking-wider transition-all"
            >
              Clear Pad
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePadConfigDialog;
