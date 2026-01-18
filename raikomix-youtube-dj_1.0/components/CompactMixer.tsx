import React from 'react';

interface CompactMixerProps {
  crossfader: number;
  onCrossfaderChange: (val: number) => void;
  masterVolume: number;
  onMasterVolumeChange: (val: number) => void;
}

const CompactMixer: React.FC<CompactMixerProps> = ({
  crossfader,
  onCrossfaderChange,
  masterVolume,
  onMasterVolumeChange
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="m3-section-title">Quick Mix</p>
          <p className="text-sm text-white/70">Crossfader + Master</p>
        </div>
        <button
          type="button"
          onClick={() => onCrossfaderChange(0)}
          className="utility-button m3-touch touch-target"
          aria-label="Center crossfader"
        >
          <span className="material-icons text-base">center_focus_strong</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
          <span>Deck A</span>
          <span>Deck B</span>
        </div>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.001"
          value={crossfader}
          onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))}
          className="w-full h-12 cursor-pointer"
          aria-label="Crossfader"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Master</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
          onDoubleClick={() => onMasterVolumeChange(0.8)}
          className="flex-1 h-12 cursor-pointer"
          aria-label="Master volume"
        />
        <span className="text-sm font-mono text-white/70">{Math.round(masterVolume * 100)}%</span>
      </div>
    </div>
  );
};

export default CompactMixer;
