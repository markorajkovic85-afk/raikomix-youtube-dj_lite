import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { CrossfaderCurve, EffectType, FxTarget } from '../types';

interface EQState {
  hi: number;
  mid: number;
  low: number;
  filter: number;
}

interface MixerContextValue {
  crossfader: number;
  crossfaderCurve: CrossfaderCurve;
  masterVolume: number;
  deckAVolume: number;
  deckBVolume: number;
  deckAEq: EQState;
  deckBEq: EQState;
  deckAEffect: EffectType | null;
  deckAEffectWet: number;
  deckAEffectIntensity: number;
  deckBEffect: EffectType | null;
  deckBEffectWet: number;
  deckBEffectIntensity: number;
  fxTarget: FxTarget;
  setCrossfader: (value: number) => void;
  setCrossfaderCurve: (curve: CrossfaderCurve) => void;
  setMasterVolume: (value: number) => void;
  setDeckAVolume: (value: number) => void;
  setDeckBVolume: (value: number) => void;
  setDeckAEq: (key: keyof EQState, value: number) => void;
  setDeckBEq: (key: keyof EQState, value: number) => void;
  setDeckAEffect: (effect: EffectType | null) => void;
  setDeckAEffectWet: (value: number) => void;
  setDeckAEffectIntensity: (value: number) => void;
  setDeckBEffect: (effect: EffectType | null) => void;
  setDeckBEffectWet: (value: number) => void;
  setDeckBEffectIntensity: (value: number) => void;
  setFxTarget: (target: FxTarget) => void;
}

const MixerContext = createContext<MixerContextValue | undefined>(undefined);

export const MixerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crossfader, setCrossfaderState] = useState(0);
  const [crossfaderCurve, setCrossfaderCurve] = useState<CrossfaderCurve>('SMOOTH');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [deckAVolume, setDeckAVolume] = useState(0.8);
  const [deckBVolume, setDeckBVolume] = useState(0.8);
  const [deckAEq, setDeckAEqState] = useState<EQState>({ hi: 1, mid: 1, low: 1, filter: 0 });
  const [deckBEq, setDeckBEqState] = useState<EQState>({ hi: 1, mid: 1, low: 1, filter: 0 });
  const [deckAEffect, setDeckAEffect] = useState<EffectType | null>(null);
  const [deckAEffectWet, setDeckAEffectWet] = useState(0.5);
  const [deckAEffectIntensity, setDeckAEffectIntensity] = useState(0.5);
  const [deckBEffect, setDeckBEffect] = useState<EffectType | null>(null);
  const [deckBEffectWet, setDeckBEffectWet] = useState(0.5);
  const [deckBEffectIntensity, setDeckBEffectIntensity] = useState(0.5);
  const [fxTarget, setFxTarget] = useState<FxTarget>('A');

  const debouncedSetCrossfader = useMemo(
    () => debounce((value: number) => setCrossfaderState(value), 40),
    []
  );

  const debouncedSetDeckAEq = useMemo(
    () => debounce((key: keyof EQState, value: number) => {
      setDeckAEqState(prev => ({ ...prev, [key]: value }));
    }, 40),
    []
  );

  const debouncedSetDeckBEq = useMemo(
    () => debounce((key: keyof EQState, value: number) => {
      setDeckBEqState(prev => ({ ...prev, [key]: value }));
    }, 40),
    []
  );

  useEffect(() => () => {
    debouncedSetCrossfader.cancel();
    debouncedSetDeckAEq.cancel();
    debouncedSetDeckBEq.cancel();
  }, [debouncedSetCrossfader, debouncedSetDeckAEq, debouncedSetDeckBEq]);

  const setCrossfader = useCallback((value: number) => {
    debouncedSetCrossfader(value);
  }, [debouncedSetCrossfader]);

  const setDeckAEq = useCallback((key: keyof EQState, value: number) => {
    debouncedSetDeckAEq(key, value);
  }, [debouncedSetDeckAEq]);

  const setDeckBEq = useCallback((key: keyof EQState, value: number) => {
    debouncedSetDeckBEq(key, value);
  }, [debouncedSetDeckBEq]);

  const value = useMemo(
    () => ({
      crossfader,
      crossfaderCurve,
      masterVolume,
      deckAVolume,
      deckBVolume,
      deckAEq,
      deckBEq,
      deckAEffect,
      deckAEffectWet,
      deckAEffectIntensity,
      deckBEffect,
      deckBEffectWet,
      deckBEffectIntensity,
      fxTarget,
      setCrossfader,
      setCrossfaderCurve,
      setMasterVolume,
      setDeckAVolume,
      setDeckBVolume,
      setDeckAEq,
      setDeckBEq,
      setDeckAEffect,
      setDeckAEffectWet,
      setDeckAEffectIntensity,
      setDeckBEffect,
      setDeckBEffectWet,
      setDeckBEffectIntensity,
      setFxTarget
    }),
    [
      crossfader,
      crossfaderCurve,
      deckAEffect,
      deckAEffectIntensity,
      deckAEffectWet,
      deckAEq,
      deckAVolume,
      deckBEffect,
      deckBEffectIntensity,
      deckBEffectWet,
      deckBEq,
      deckBVolume,
      fxTarget,
      masterVolume,
      setCrossfader,
      setCrossfaderCurve,
      setDeckAEffect,
      setDeckAEffectIntensity,
      setDeckAEffectWet,
      setDeckAEq,
      setDeckAVolume,
      setDeckBEffect,
      setDeckBEffectIntensity,
      setDeckBEffectWet,
      setDeckBEq,
      setDeckBVolume,
      setFxTarget,
      setMasterVolume
    ]
  );

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
};

export const useMixer = (): MixerContextValue => {
  const context = useContext(MixerContext);
  if (!context) {
    throw new Error('useMixer must be used within a MixerProvider');
  }
  return context;
};
