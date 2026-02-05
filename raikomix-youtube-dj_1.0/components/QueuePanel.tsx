import React, { useRef, useState, useEffect } from 'react';
import { QueueItem, DeckId } from '../types';
import { exportQueue } from '../utils/queueStorage';

interface QueuePanelProps {
  queue: QueueItem[];
  onLoadToDeck: (item: QueueItem, deck: DeckId) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onReorder: (from: number, to: number) => void;
  // Auto DJ props (optional for backward compatibility)
  autoDjEnabled?: boolean;
  autoDjMixLeadSeconds?: number;
  autoDjMixDurationSeconds?: number;
  autoDjCountdown?: number | null;
  autoDjNextTrack?: QueueItem | null;
  autoDjNextDeck?: DeckId | null;
  onAutoDjToggle?: () => void;
  onAutoDjMixLeadChange?: (seconds: number) => void;
  onAutoDjMixDurationChange?: (seconds: number) => void;
}

const MarqueeText: React.FC<{ text: string; className: string }> = ({ text, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setShouldAnimate(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} className="marquee-container w-full">
      <div 
        ref={textRef} 
        className={`${className} marquee-text ${shouldAnimate ? 'animate-marquee' : ''}`}
      >
        {text}
        {shouldAnimate && <span className="ml-12">{text}</span>}
      </div>
    </div>
  );
};

const QueuePanel: React.FC<QueuePanelProps> = ({ 
  queue, 
  onLoadToDeck, 
  onRemove, 
  onClear, 
  onReorder,
  autoDjEnabled = false,
  autoDjMixLeadSeconds = 12,
  autoDjMixDurationSeconds = 6,
  autoDjCountdown = null,
  autoDjNextTrack = null,
  autoDjNextDeck = null,
  onAutoDjToggle,
  onAutoDjMixLeadChange,
  onAutoDjMixDurationChange
}) => {
  const [expandedQueueId, setExpandedQueueId] = useState<string | null>(null);
  const [autoDjSettingsOpen, setAutoDjSettingsOpen] = useState(false);

  const toggleExpandedQueue = (id: string) => {
    setExpandedQueueId((prev) => (prev === id ? null : id));
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full gap-2 elevation-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Play Queue ({queue.length})</h3>
        {queue.length > 0 && (
         <div className="flex items-center gap-2">
            <button
              onClick={() => exportQueue(queue)}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              title="Export Queue JSON"
            >
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
            <button 
              onClick={onClear}
              className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-tighter motion-standard"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Auto DJ Controls */}
      {onAutoDjToggle && (
        <div className="mx-2 p-2 rounded-lg bg-[#1C1B1F]/60 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-purple-400">
                {autoDjEnabled ? 'play_circle' : 'pause_circle'}
              </span>
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Auto DJ</h4>
              {autoDjEnabled && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[8px] font-bold animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
            <button
              onClick={() => setAutoDjSettingsOpen(!autoDjSettingsOpen)}
              className="p-1 rounded text-gray-400 hover:text-white transition-colors"
              title={autoDjSettingsOpen ? 'Hide settings' : 'Show settings'}
            >
              <span className="material-symbols-outlined text-sm">
                {autoDjSettingsOpen ? 'expand_less' : 'settings'}
              </span>
            </button>
          </div>

          {/* Main Toggle */}
          <button
            onClick={onAutoDjToggle}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              autoDjEnabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {autoDjEnabled ? 'Disable Auto DJ' : 'Enable Auto DJ'}
          </button>

          {/* Countdown Display */}
          {autoDjEnabled && autoDjCountdown !== null && (
            <div className="mt-2 p-2 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-sm animate-pulse">
                  schedule
                </span>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                  Mixing in
                </span>
              </div>
              <span className="text-sm font-mono font-bold text-purple-400">
                {formatTime(autoDjCountdown)}
              </span>
            </div>
          )}

          {/* Next Track Preview */}
          {autoDjEnabled && autoDjNextTrack && (
            <div className="mt-2 p-2 rounded bg-white/5 border border-white/5">
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[10px] text-gray-500">skip_next</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Next</span>
                {autoDjNextDeck && (
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-black ${
                    autoDjNextDeck === 'A' ? 'bg-[#D0BCFF]/10 text-[#D0BCFF]' : 'bg-[#F2B8B5]/10 text-[#F2B8B5]'
                  }`}>
                    Deck {autoDjNextDeck}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-semibold text-white truncate">
                {autoDjNextTrack.title}
              </div>
              <div className="text-[8px] text-gray-400 truncate">
                {autoDjNextTrack.author || 'Unknown Artist'}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {autoDjSettingsOpen && onAutoDjMixLeadChange && onAutoDjMixDurationChange && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-3">
              {/* Mix Lead Time */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Mix Lead Time
                  </label>
                  <span className="text-[10px] font-mono font-bold text-purple-400">
                    {autoDjMixLeadSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="1"
                  value={autoDjMixLeadSeconds}
                  onChange={(e) => onAutoDjMixLeadChange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
                  <span>4s</span>
                  <span>30s</span>
                </div>
              </div>

              {/* Mix Duration */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Mix Duration
                  </label>
                  <span className="text-[10px] font-mono font-bold text-purple-400">
                    {autoDjMixDurationSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={autoDjMixDurationSeconds}
                  onChange={(e) => onAutoDjMixDurationChange(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
                  <span>2s</span>
                  <span>20s</span>
                </div>
              </div>

              <div className="text-[8px] text-gray-500 italic">
                <span className="material-symbols-outlined text-[10px] inline-block mr-1 align-middle">info</span>
                Auto DJ will automatically mix tracks when the current track ends
              </div>
            </div>
          )}
        </div>
      )}

      {/* UX rationale: reduce chrome and row height so more queue items remain visible on small screens. */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-0.5 scrollbar-hide">
        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <span className="material-symbols-outlined text-4xl mb-2">queue_music</span>
            <p className="text-xs uppercase tracking-widest font-bold">Queue is empty</p>
            {autoDjEnabled && (
              <p className="text-[10px] mt-2 text-center max-w-[200px]">
                Add tracks to enable Auto DJ mixing
              </p>
            )}
          </div>
        )}

        {queue.map((item, index) => (
          <div key={item.id} className="m3-card px-2 py-1.5 flex gap-2 items-center bg-[#1C1B1F]/40 hover:bg-[#2B2930] motion-standard border-dashed elevation-1 hover:elevation-2 overflow-hidden">
            <div className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                className="w-4 h-4 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
                aria-label={`Move ${item.title} up`}
              >
                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_up</span>
              </button>
              <span className="text-[8px] font-mono text-gray-600 w-4 text-center">{index + 1}</span>
              <button
                type="button"
                onClick={() => onReorder(index, index + 1)}
                disabled={index === queue.length - 1}
                className="w-4 h-4 rounded-full text-gray-500 hover:text-white disabled:opacity-30"
                aria-label={`Move ${item.title} down`}
              >
                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
              </button>
            </div>
            <div className="w-9 h-9 bg-black rounded overflow-hidden flex-shrink-0 elevation-1">
              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpandedQueue(item.id)}
                className="w-full text-left focus:outline-none"
                aria-expanded={expandedQueueId === item.id}
                aria-label={expandedQueueId === item.id ? `Collapse ${item.title}` : `Expand ${item.title}`}
              >
                <div className={`text-[10px] font-semibold text-[#E6E1E5] leading-tight ${
                  expandedQueueId === item.id ? 'whitespace-normal break-words' : 'truncate'
                }`}>
                  {item.title}
                </div>
                <div className={`text-[8px] text-gray-400 font-medium ${
                  expandedQueueId === item.id ? 'whitespace-normal break-words' : 'truncate'
                }`}>
                  {item.author || 'Unknown Artist'}
                </div>
              </button>
            </div>
            <div className="flex gap-1 motion-standard">
              <button
                onClick={() => toggleExpandedQueue(item.id)}
                className="w-5 h-5 rounded-md bg-white/5 text-gray-300 flex items-center justify-center hover:bg-white/15 transition-all"
                aria-label={expandedQueueId === item.id ? `Collapse ${item.title}` : `Expand ${item.title}`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {expandedQueueId === item.id ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              <button 
                onClick={() => onLoadToDeck(item, 'A')}
                className="px-1.5 py-0.5 rounded bg-[#D0BCFF]/10 text-[#D0BCFF] text-[8px] font-black motion-emphasized elevation-1 hover:elevation-2"
                aria-label={`Load ${item.title} to Deck A`}
              >
                A
              </button>
              <button 
                onClick={() => onLoadToDeck(item, 'B')}
                className="px-1.5 py-0.5 rounded bg-[#F2B8B5]/10 text-[#F2B8B5] text-[8px] font-black motion-emphasized elevation-1 hover:elevation-2"
                aria-label={`Load ${item.title} to Deck B`}
              >
                B
              </button>
              <button 
                onClick={() => onRemove(item.id)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 motion-standard"
                aria-label={`Remove ${item.title} from queue`}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueuePanel;
