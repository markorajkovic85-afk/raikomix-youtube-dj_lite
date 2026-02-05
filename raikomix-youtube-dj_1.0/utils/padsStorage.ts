import { PerformancePad } from '../types';

const STORAGE_KEY = 'raikomix-pads';

/**
 * Load performance pads configuration from localStorage
 */
export const loadPads = (): PerformancePad[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const pads = JSON.parse(stored);
      // Validate the data structure
      if (Array.isArray(pads) && pads.length === 12) {
        return pads;
      }
    }
  } catch (error) {
    console.error('Failed to load pads from localStorage:', error);
  }
  
  // Return default empty pads if nothing stored or error
  return createDefaultPads();
};

/**
 * Save performance pads configuration to localStorage
 */
export const savePads = (pads: PerformancePad[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pads));
  } catch (error) {
    console.error('Failed to save pads to localStorage:', error);
  }
};

/**
 * Create default empty pad configuration (12 pads)
 */
const createDefaultPads = (): PerformancePad[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Pad ${i + 1}`,
    videoId: null,
    url: null,
    sourceType: 'youtube' as const,
    cuePoint: 0,
    duration: 0,
    mode: 'ONE_SHOT' as const,
    volume: 0.8,
    color: getDefaultPadColor(i)
  }));
};

/**
 * Get default color for pad based on index
 * Using a vibrant color palette suitable for DJ applications
 */
const getDefaultPadColor = (index: number): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Cyan
    '#45B7D1', // Blue
    '#FFA07A', // Coral
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52C7B8', // Teal
    '#A29BFE', // Lavender
    '#FD79A8'  // Pink
  ];
  return colors[index % colors.length];
};

/**
 * Reset all pads to default configuration
 */
export const resetPads = (): PerformancePad[] => {
  const defaultPads = createDefaultPads();
  savePads(defaultPads);
  return defaultPads;
};

/**
 * Update a single pad configuration
 */
export const updatePad = (pads: PerformancePad[], updatedPad: PerformancePad): PerformancePad[] => {
  const newPads = pads.map(pad => 
    pad.id === updatedPad.id ? updatedPad : pad
  );
  savePads(newPads);
  return newPads;
};

/**
 * Clear a specific pad (reset to empty)
 */
export const clearPad = (pads: PerformancePad[], padId: number): PerformancePad[] => {
  const newPads = pads.map(pad => {
    if (pad.id === padId) {
      return {
        ...pad,
        videoId: null,
        url: null,
        cuePoint: 0,
        duration: 0,
        title: undefined,
        author: undefined,
        thumbnailUrl: undefined
      };
    }
    return pad;
  });
  savePads(newPads);
  return newPads;
};
