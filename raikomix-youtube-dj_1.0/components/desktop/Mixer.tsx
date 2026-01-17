import React, { memo, useCallback } from 'react';
import { CrossfaderCurve } from '../../types';
import { triggerHaptic } from '../shared/AudioEngine';

interface MixerProps {
  crossfader: number;
  onCrossfaderChange: (val: number) => void;
  crossfaderCurve: CrossfaderCurve;
  onCurveChange: (curve: CrossfaderCurve) => void;
  masterVolume: number;
  onMasterVolumeChange: (val: number) => void;
  deckAVolume: number;
  onDeckAVolumeChange: (val: number) => void;
  deckBVolume: number;
  onDeckBVolumeChange: (val: number) => void;
  deckAPlaying: boolean;
  deckBPlaying: boolean;
  deckAEq: { hi: number; mid: number; low: number; filter: number };
  deckBEq: { hi: number; mid: number; low: number; filter: number };
  onDeckAEqChange: (key: string, val: number) => void;
  onDeckBEqChange: (key: string, val: number) => void;
  variant?: 'desktop' | 'mobile';
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color: string;
}

const VerticalSlider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 2, step = 0.01, color }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="h-32 flex items-center justify-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="h-32 w-12 accent-white"
        style={{
          WebkitAppearance: 'slider-vertical',
          writingMode: 'bt-lr',
          accentColor: color
        }}
      />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
  </div>
);

const Mixer: React.FC<MixerProps> = ({
  crossfader,
  onCrossfaderChange,
  crossfaderCurve,
  onCurveChange,
  masterVolume,
  onMasterVolumeChange,
  deckAVolume,
  onDeckAVolumeChange,
  deckBVolume,
  onDeckBVolumeChange,
  deckAPlaying,
  deckBPlaying,
  deckAEq,
  deckBEq,
  onDeckAEqChange,
  onDeckBEqChange,
  variant = 'desktop'
}) => {
  const handleCrossfader = useCallback((value: number) => {
    triggerHaptic();
    onCrossfaderChange(value);
  }, [onCrossfaderChange]);

  const isMobile = variant === 'mobile';

  return (
    <div className={`flex flex-col gap-4 ${isMobile ? 'p-4' : 'p-6'} bg-[#141218] rounded-2xl border border-white/10`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Mixer</p>
          <p className="text-sm font-bold text-white">Crossfader</p>
        </div>
        <select
          value={crossfaderCurve}
          onChange={event => onCurveChange(event.target.value as CrossfaderCurve)}
          className="bg-white/5 border border-white/10 text-xs text-white rounded-full px-3 py-2"
        >
          <option value="SMOOTH">Smooth</option>
          <option value="CUT">Cut</option>
          <option value="DIP">Dip</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={crossfader}
          onChange={event => handleCrossfader(Number(event.target.value))}
          className="w-full h-[60px] accent-[#D0BCFF]"
        />
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
          <span className={deckAPlaying ? 'text-[#D0BCFF]' : ''}>Deck A</span>
          <span>Center</span>
          <span className={deckBPlaying ? 'text-[#F2B8B5]' : ''}>Deck B</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <VerticalSlider
          label="Master"
          value={masterVolume}
          min={0}
          max={1}
          step={0.01}
          color="#ffffff"
          onChange={onMasterVolumeChange}
        />
        <VerticalSlider
          label="Deck A"
          value={deckAVolume}
          min={0}
          max={1}
          step={0.01}
          color="#D0BCFF"
          onChange={onDeckAVolumeChange}
        />
        <VerticalSlider
          label="Deck B"
          value={deckBVolume}
          min={0}
          max={1}
          step={0.01}
          color="#F2B8B5"
          onChange={onDeckBVolumeChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">Deck A EQ</p>
          <div className="grid grid-cols-4 gap-2">
            <VerticalSlider label="Hi" value={deckAEq.hi} onChange={value => onDeckAEqChange('hi', value)} color="#D0BCFF" />
            <VerticalSlider label="Mid" value={deckAEq.mid} onChange={value => onDeckAEqChange('mid', value)} color="#D0BCFF" />
            <VerticalSlider label="Low" value={deckAEq.low} onChange={value => onDeckAEqChange('low', value)} color="#D0BCFF" />
            <VerticalSlider label="Filter" value={deckAEq.filter} min={-1} max={1} onChange={value => onDeckAEqChange('filter', value)} color="#D0BCFF" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">Deck B EQ</p>
          <div className="grid grid-cols-4 gap-2">
            <VerticalSlider label="Hi" value={deckBEq.hi} onChange={value => onDeckBEqChange('hi', value)} color="#F2B8B5" />
            <VerticalSlider label="Mid" value={deckBEq.mid} onChange={value => onDeckBEqChange('mid', value)} color="#F2B8B5" />
            <VerticalSlider label="Low" value={deckBEq.low} onChange={value => onDeckBEqChange('low', value)} color="#F2B8B5" />
            <VerticalSlider label="Filter" value={deckBEq.filter} min={-1} max={1} onChange={value => onDeckBEqChange('filter', value)} color="#F2B8B5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Mixer);
