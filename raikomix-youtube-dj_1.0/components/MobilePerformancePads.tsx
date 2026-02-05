import React, { useState, useRef, useEffect } from 'react';
import { PerformancePad } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface MobilePerformancePadsProps {
  pads: PerformancePad[];
  onPadTrigger: (padIndex: number) => void;
  onPadConfigure: (padIndex: number) => void;
  isPlaying: boolean[];
}

const MobilePerformancePads: React.FC<MobilePerformancePadsProps> = ({
  pads,
  onPadTrigger,
  onPadConfigure,
  isPlaying
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressedPad, setPressedPad] = useState<number | null>(null);
  const longPressStartTime = useRef<number>(0);

  const handleTouchStart = (padIndex: number) => {
    setPressedPad(padIndex);
    longPressStartTime.current = Date.now();
    triggerHaptic('light');

    const timer = setTimeout(() => {
      // Long press detected (500ms)
      triggerHaptic('heavy');
      onPadConfigure(padIndex);
      setPressedPad(null);
    }, 500);

    setLongPressTimer(timer);
  };

  const handleTouchEnd = (padIndex: number) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const pressDuration = Date.now() - longPressStartTime.current;

    // Only trigger if it was a short press (< 500ms)
    if (pressDuration < 500 && pressedPad === padIndex) {
      onPadTrigger(padIndex);
      triggerHaptic('medium');
    }

    setPressedPad(null);
  };

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedPad(null);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const getPadLabel = (pad: PerformancePad, index: number): string => {
    if (!pad.name && !pad.videoId) return `PAD ${index + 1}`;
    return pad.name || `Pad ${index + 1}`;
  };

  const getPadSubtext = (pad: PerformancePad): string => {
    if (!pad.videoId) return 'Empty';
    const parts: string[] = [];
    if (pad.mode) parts.push(pad.mode === 'ONE_SHOT' ? 'One-Shot' : 'Loop');
    if (pad.cuePoint !== undefined) parts.push(`@${Math.floor(pad.cuePoint)}s`);
    return parts.join(' • ') || 'Ready';
  };

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-purple-400">grid_view</span>
          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Performance Pads</h3>
        </div>
        <div className="text-[8px] text-gray-500 uppercase tracking-wider">
          Tap: Play • Hold: Config
        </div>
      </div>

      {/* Pads Grid - 3x4 layout */}
      <div className="flex-1 grid grid-cols-3 gap-2">
        {pads.map((pad, index) => {
          const isEmpty = !pad.videoId;
          const isPressed = pressedPad === index;
          const isPadPlaying = isPlaying[index];

          return (
            <button
              key={index}
              type="button"
              className={`
                relative rounded-xl overflow-hidden
                transition-all duration-150
                touch-target
                ${
                  isEmpty
                    ? 'bg-white/5 border border-dashed border-white/10 hover:bg-white/10'
                    : `border border-solid`
                }
                ${
                  isPressed
                    ? 'scale-95 brightness-75'
                    : 'scale-100'
                }
                ${
                  isPadPlaying
                    ? 'animate-pulse shadow-lg'
                    : ''
                }
                min-h-[72px]
                flex flex-col items-center justify-center
                p-2
              `}
              style={{
                backgroundColor: isEmpty ? undefined : `${pad.color || '#8B5CF6'}20`,
                borderColor: isEmpty ? undefined : pad.color || '#8B5CF6',
                boxShadow: isPadPlaying ? `0 0 20px ${pad.color || '#8B5CF6'}80` : undefined
              }}
              onTouchStart={() => handleTouchStart(index)}
              onTouchEnd={() => handleTouchEnd(index)}
              onTouchCancel={handleTouchCancel}
              onMouseDown={() => handleTouchStart(index)}
              onMouseUp={() => handleTouchEnd(index)}
              onMouseLeave={handleTouchCancel}
              aria-label={isEmpty ? `Configure pad ${index + 1}` : `Play ${pad.name || `pad ${index + 1}`}`}
            >
              {/* Playing indicator */}
              {isPadPlaying && (
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${pad.color || '#8B5CF6'} 0%, transparent 70%)`
                  }}
                />
              )}

              {/* Empty state */}
              {isEmpty && (
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="material-symbols-outlined text-xl text-gray-500">add_circle</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                    Empty
                  </span>
                </div>
              )}

              {/* Configured pad */}
              {!isEmpty && (
                <div className="flex flex-col items-center gap-1 w-full relative z-10">
                  {/* Pad number badge */}
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{
                      backgroundColor: pad.color || '#8B5CF6',
                      color: '#000'
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Playing icon */}
                  {isPadPlaying && (
                    <span 
                      className="material-symbols-outlined text-2xl animate-pulse"
                      style={{ color: pad.color || '#8B5CF6' }}
                    >
                      play_circle
                    </span>
                  )}

                  {/* Stopped icon */}
                  {!isPadPlaying && (
                    <span 
                      className="material-symbols-outlined text-2xl"
                      style={{ color: pad.color || '#8B5CF6' }}
                    >
                      radio_button_unchecked
                    </span>
                  )}

                  {/* Pad name */}
                  <div 
                    className="text-[9px] font-bold uppercase tracking-wide text-center truncate w-full"
                    style={{ color: pad.color || '#8B5CF6' }}
                  >
                    {getPadLabel(pad, index)}
                  </div>

                  {/* Pad info */}
                  <div className="text-[7px] text-gray-400 uppercase tracking-wider text-center">
                    {getPadSubtext(pad)}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="text-center text-[8px] text-gray-500 italic">
        <span className="material-symbols-outlined text-[10px] inline-block mr-1 align-middle">info</span>
        Long press any pad to configure
      </div>
    </div>
  );
};

export default MobilePerformancePads;
