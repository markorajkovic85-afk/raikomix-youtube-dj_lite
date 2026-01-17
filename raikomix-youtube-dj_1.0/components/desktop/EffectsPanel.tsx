import React, { memo, useCallback } from 'react';
import { EffectType, FxTarget } from '../../types';

interface EffectsPanelProps {
  deckAEffect: EffectType | null;
  deckBEffect: EffectType | null;
  deckAEffectWet: number;
  deckAEffectIntensity: number;
  deckBEffectWet: number;
  deckBEffectIntensity: number;
  fxTarget: FxTarget;
  onEffectChange: (deck: 'A' | 'B', effect: EffectType | null) => void;
  onEffectWetChange: (deck: 'A' | 'B', value: number) => void;
  onEffectIntensityChange: (deck: 'A' | 'B', value: number) => void;
  onFxTargetChange: (target: FxTarget) => void;
  variant?: 'desktop' | 'mobile';
}

const EFFECTS: EffectType[] = ['ECHO', 'DELAY', 'REVERB', 'FLANGER', 'PHASER', 'CRUSH'];

const EffectsPanel: React.FC<EffectsPanelProps> = ({
  deckAEffect,
  deckBEffect,
  deckAEffectWet,
  deckAEffectIntensity,
  deckBEffectWet,
  deckBEffectIntensity,
  fxTarget,
  onEffectChange,
  onEffectWetChange,
  onEffectIntensityChange,
  onFxTargetChange,
  variant = 'desktop'
}) => {
  const targetEffect = fxTarget === 'A' ? deckAEffect : fxTarget === 'B' ? deckBEffect : null;
  const wetValue = fxTarget === 'A' ? deckAEffectWet : fxTarget === 'B' ? deckBEffectWet : (deckAEffectWet + deckBEffectWet) / 2;
  const intensityValue = fxTarget === 'A' ? deckAEffectIntensity : fxTarget === 'B' ? deckBEffectIntensity : (deckAEffectIntensity + deckBEffectIntensity) / 2;

  const handleEffectSelect = useCallback((effect: EffectType) => {
    if (fxTarget === 'AB') {
      onEffectChange('A', effect);
      onEffectChange('B', effect);
      return;
    }
    onEffectChange(fxTarget, effect);
  }, [fxTarget, onEffectChange]);

  const handleWetChange = useCallback((value: number) => {
    if (fxTarget === 'AB') {
      onEffectWetChange('A', value);
      onEffectWetChange('B', value);
      return;
    }
    onEffectWetChange(fxTarget, value);
  }, [fxTarget, onEffectWetChange]);

  const handleIntensityChange = useCallback((value: number) => {
    if (fxTarget === 'AB') {
      onEffectIntensityChange('A', value);
      onEffectIntensityChange('B', value);
      return;
    }
    onEffectIntensityChange(fxTarget, value);
  }, [fxTarget, onEffectIntensityChange]);

  return (
    <div className={`flex flex-col gap-4 p-4 bg-[#1C1B1F] rounded-xl border border-white/5 ${variant === 'mobile' ? 'pb-6' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">FX Panel</h3>
        <div className="flex gap-2">
          {(['A', 'B', 'AB'] as FxTarget[]).map(target => (
            <button
              key={target}
              type="button"
              onClick={() => onFxTargetChange(target)}
              className={`min-h-[44px] px-4 rounded-full text-xs font-bold uppercase ${
                fxTarget === target ? 'bg-[#D0BCFF] text-black' : 'bg-white/5 text-white'
              }`}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {EFFECTS.map(effect => (
          <button
            key={effect}
            type="button"
            onClick={() => handleEffectSelect(effect)}
            className={`min-h-[80px] min-w-[80px] rounded-2xl border text-sm font-bold uppercase tracking-widest ${
              targetEffect === effect ? 'bg-[#D0BCFF] text-black border-[#D0BCFF]' : 'bg-[#15131A] text-white border-white/10'
            }`}
          >
            {effect}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-400">Wet / Dry</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={wetValue}
          onChange={event => handleWetChange(Number(event.target.value))}
          className="w-full h-[48px] accent-[#D0BCFF]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-400">Intensity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={intensityValue}
          onChange={event => handleIntensityChange(Number(event.target.value))}
          className="w-full h-[48px] accent-[#D0BCFF]"
        />
      </div>

      <div className="p-3 rounded-xl bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
        Streaming effects preview limited for remote sources.
      </div>
    </div>
  );
};

export default memo(EffectsPanel);
