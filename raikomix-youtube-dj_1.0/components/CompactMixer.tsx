import React from 'react';

interface CompactMixerProps {
  crossfader: number;
  onCrossfaderChange: (val: number) => void;
  masterVolume: number;
  onMasterVolumeChange: (val: number) => void;
  deckAVolume?: number;
  onDeckAVolumeChange?: (val: number) => void;
  deckBVolume?: number;
  onDeckBVolumeChange?: (val: number) => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const CompactMixer: React.FC<CompactMixerProps> = ({
  crossfader,
  onCrossfaderChange,
  masterVolume,
  onMasterVolumeChange,
  deckAVolume,
  onDeckAVolumeChange,
  deckBVolume,
  onDeckBVolumeChange
}) => {
  const showDeckVolumes =
    typeof deckAVolume === 'number' && typeof deckBVolume === 'number' && !!onDeckAVolumeChange && !!onDeckBVolumeChange;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="m3-section-title">Mix</p>
          <p className="text-xs text-white/70">A/B Vol + Crossfader</p>
        </div>
        <button
          type="button"
          onClick={() => onCrossfaderChange(0)}
          className="utility-button m3-touch touch-target"
          aria-label="Center crossfader"
          title="Center crossfader"
        >
          <span className="material-icons text-base">center_focus_strong</span>
        </button>
      </div>

      <div className="grid grid-cols-[84px_1fr_84px] gap-3 items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-bold">A</span>
            {showDeckVolumes && <span className="text-[10px] font-mono text-white/55">{Math.round(clamp01(deckAVolume) * 100)}%</span>}
          </div>
          {showDeckVolumes ? (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={deckAVolume}
              onChange={e => onDeckAVolumeChange?.(parseFloat(e.target.value))}
              onDoubleClick={() => onDeckAVolumeChange?.(0.8)}
              className="w-full h-10 cursor-pointer"
              aria-label="Deck A volume"
            />
          ) : (
            <div className="h-10" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span>Deck A</span>
            <span>Deck B</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.001"
            value={crossfader}
            onChange={e => onCrossfaderChange(parseFloat(e.target.value))}
            className="w-full h-10 cursor-pointer"
            aria-label="Crossfader"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-bold">B</span>
            {showDeckVolumes && <span className="text-[10px] font-mono text-white/55">{Math.round(clamp01(deckBVolume) * 100)}%</span>}
          </div>
          {showDeckVolumes ? (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={deckBVolume}
              onChange={e => onDeckBVolumeChange?.(parseFloat(e.target.value))}
              onDoubleClick={() => onDeckBVolumeChange?.(0.8)}
              className="w-full h-10 cursor-pointer"
              aria-label="Deck B volume"
            />
          ) : (
            <div className="h-10" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold">Master</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={e => onMasterVolumeChange(parseFloat(e.target.value))}
          onDoubleClick={() => onMasterVolumeChange(0.8)}
          className="flex-1 h-10 cursor-pointer"
          aria-label="Master volume"
        />
        <span className="text-xs font-mono text-white/70">{Math.round(masterVolume * 100)}%</span>
      </div>
    </div>
  );
};

export default CompactMixer;
