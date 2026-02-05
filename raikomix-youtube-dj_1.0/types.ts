export type DeckId = 'A' | 'B';
export type CrossfaderCurve = 'SMOOTH' | 'CUT' | 'DIP';

// Expanded from 6 to 16 effect types
export type EffectType =
  // Filters
  | 'HIGH_PASS'
  | 'LOW_PASS'
  | 'BAND_PASS'
  // Time-based
  | 'ECHO'
  | 'DELAY'
  | 'REVERB'
  // Modulation
  | 'FLANGER'
  | 'PHASER'
  | 'CHORUS'
  | 'TREMOLO'
  | 'AUTO_PAN'
  // Distortion
  | 'CRUSH'
  | 'BITCRUSH'
  | 'OVERDRIVE'
  // Other
  | 'FILTER_SWEEP'
  | 'GATE';

export type TrackSourceType = 'youtube' | 'local';
export type PadMode = 'ONE_SHOT' | 'LOOP';

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  videoId: string;
  sourceType: TrackSourceType;
  isReady: boolean;
  eqHigh: number;
  eqMid: number;
  eqLow: number;
  filter: number;
  hotCues: (number | null)[];
  loopActive: boolean;
  loopStart: number;
  loopEnd: number;
  bpm: number;
  musicalKey?: string;
  title?: string;
  author?: string;
  waveformPeaks?: number[]; // Added for advanced waveform visualization
}

export interface MixerState {
  crossfader: number;
  masterVolume: number;
  crossfaderCurve: CrossfaderCurve;
}

export interface QueueItem {
  id: string;
  videoId: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  addedAt: number;
  author?: string;
  album?: string; // Added for better track metadata
  sourceType?: TrackSourceType;
}

export interface LibraryTrack {
  id: string;
  videoId: string; // Used as unique identifier or YT ID
  url: string;     // URL or ObjectURL
  title: string;
  author: string;
  album?: string;  // Added for better track metadata
  thumbnailUrl: string;
  addedAt: number;
  lastPlayed?: number;
  playCount: number;
  sourceType: TrackSourceType;
  fileName?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  color?: string;
}

// Performance Pads types
export interface PerformancePad {
  id: number;
  name: string;
  videoId: string | null;
  url: string | null;
  sourceType: TrackSourceType;
  cuePoint: number;           // Start position in seconds
  duration: number;           // Track duration
  mode: PadMode;              // One-shot or loop
  volume: number;             // 0-1
  color: string;              // CSS color
  thumbnailUrl?: string;
  title?: string;
  author?: string;
}

export interface PadState {
  id: number;
  playing: boolean;
  startedAt: number;
  audioContext: AudioContext | null;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
}

// Auto DJ types
export interface AutoDjState {
  enabled: boolean;
  mixLeadSeconds: number;      // 4-30s, default 12
  mixDurationSeconds: number;  // 2-20s, default 6
  pendingMix: {
    deck: DeckId;
    fromDeck: DeckId;
    item: QueueItem;
  } | null;
  preloadedTrack: {
    deck: DeckId;
    itemId: string;
    videoId: string;
  } | null;
  earlyStartedTrack: {
    deck: DeckId;
    videoId: string;
  } | null;
  lastMixVideo: {
    A?: string;
    B?: string;
  };
  autoLoadDeck: DeckId | null;
  manualPause: {
    A: boolean;
    B: boolean;
  };
  autoStop: {
    A: boolean;
    B: boolean;
  };
}

// Settings types
export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  autoDjDefaults: {
    mixLeadSeconds: number;
    mixDurationSeconds: number;
  };
  waveformEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}

export type SettingsTab = 'shortcuts' | 'preferences';

// Mobile-specific types
export type MobileTab = 'MIX' | 'LIBRARY' | 'FX' | 'PADS'; // Added PADS tab
export type FxTarget = 'A' | 'B' | 'AB' | 'PADS'; // Added PADS routing

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '(max-width: 567px)',
  mobileLandscape: '(min-width: 568px) and (max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)'
} as const;

// Swipe configuration
export interface SwipeConfig {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  delta?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
}

// Toast notification
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
    gtag?: (...args: any[]) => void;
  }
}
