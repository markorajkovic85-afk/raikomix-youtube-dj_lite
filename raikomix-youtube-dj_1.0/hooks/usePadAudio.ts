import { useState, useRef, useCallback, useEffect } from 'react';
import { PerformancePad, PadState } from '../types';

interface UsePadAudioOptions {
  pads: PerformancePad[];
  audioContext: AudioContext | null;
  masterGainNode: GainNode | null;
}

export const usePadAudio = ({ pads, audioContext, masterGainNode }: UsePadAudioOptions) => {
  const [padStates, setPadStates] = useState<PadState[]>(
    Array(12).fill({ playing: false, volume: 0.8 })
  );

  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const sourceNodesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map());
  const gainNodesRef = useRef<Map<number, GainNode>>(new Map());

  // Load audio buffer for a pad
  const loadAudioBuffer = useCallback(
    async (videoId: string, url: string): Promise<AudioBuffer | null> => {
      if (!audioContext) return null;

      // Check if already loaded
      if (audioBuffersRef.current.has(videoId)) {
        return audioBuffersRef.current.get(videoId)!;
      }

      try {
        // For YouTube videos, we can't directly load audio
        // This would need to be handled differently in production
        // For now, we'll return null and handle it gracefully
        console.warn('Audio buffer loading not implemented for streaming sources');
        return null;
      } catch (error) {
        console.error('Failed to load audio buffer:', error);
        return null;
      }
    },
    [audioContext]
  );

  // Trigger pad playback
  const triggerPad = useCallback(
    async (padIndex: number) => {
      if (!audioContext || !masterGainNode) {
        console.warn('Audio context not initialized');
        return;
      }

      const pad = pads[padIndex];
      if (!pad || !pad.videoId) {
        console.warn('Pad not configured');
        return;
      }

      // Stop existing playback on this pad
      stopPad(padIndex);

      // Load audio buffer
      const buffer = await loadAudioBuffer(pad.videoId, pad.url);
      if (!buffer) {
        // For streaming sources, we can't use Web Audio API directly
        // In a real implementation, you'd need a different approach
        // For now, just update the state
        setPadStates((prev) => {
          const newStates = [...prev];
          newStates[padIndex] = { playing: true, volume: pad.volume || 0.8 };
          return newStates;
        });

        // Auto-stop after simulated duration (for demo purposes)
        setTimeout(() => {
          setPadStates((prev) => {
            const newStates = [...prev];
            newStates[padIndex] = { playing: false, volume: pad.volume || 0.8 };
            return newStates;
          });
        }, 5000);

        return;
      }

      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = pad.mode === 'LOOP';

      // Create gain node for this pad
      const gainNode = audioContext.createGain();
      gainNode.gain.value = pad.volume || 0.8;

      // Connect: source -> gain -> master
      source.connect(gainNode);
      gainNode.connect(masterGainNode);

      // Store references
      sourceNodesRef.current.set(padIndex, source);
      gainNodesRef.current.set(padIndex, gainNode);

      // Handle playback end (for ONE_SHOT mode)
      source.onended = () => {
        if (pad.mode === 'ONE_SHOT') {
          setPadStates((prev) => {
            const newStates = [...prev];
            newStates[padIndex] = { playing: false, volume: pad.volume || 0.8 };
            return newStates;
          });
          sourceNodesRef.current.delete(padIndex);
          gainNodesRef.current.delete(padIndex);
        }
      };

      // Start playback from cue point
      const startTime = pad.cuePoint || 0;
      source.start(0, startTime);

      // Update state
      setPadStates((prev) => {
        const newStates = [...prev];
        newStates[padIndex] = { playing: true, volume: pad.volume || 0.8 };
        return newStates;
      });
    },
    [audioContext, masterGainNode, pads, loadAudioBuffer]
  );

  // Stop pad playback
  const stopPad = useCallback((padIndex: number) => {
    const source = sourceNodesRef.current.get(padIndex);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      sourceNodesRef.current.delete(padIndex);
    }

    const gainNode = gainNodesRef.current.get(padIndex);
    if (gainNode) {
      gainNode.disconnect();
      gainNodesRef.current.delete(padIndex);
    }

    setPadStates((prev) => {
      const newStates = [...prev];
      newStates[padIndex] = { playing: false, volume: pads[padIndex]?.volume || 0.8 };
      return newStates;
    });
  }, [pads]);

  // Stop all pads
  const stopAllPads = useCallback(() => {
    for (let i = 0; i < 12; i++) {
      stopPad(i);
    }
  }, [stopPad]);

  // Update pad volume
  const setPadVolume = useCallback((padIndex: number, volume: number) => {
    const gainNode = gainNodesRef.current.get(padIndex);
    if (gainNode) {
      gainNode.gain.value = volume;
    }

    setPadStates((prev) => {
      const newStates = [...prev];
      newStates[padIndex] = { ...newStates[padIndex], volume };
      return newStates;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPads();
    };
  }, [stopAllPads]);

  return {
    padStates,
    triggerPad,
    stopPad,
    stopAllPads,
    setPadVolume,
    isPlaying: padStates.map((state) => state.playing)
  };
};
