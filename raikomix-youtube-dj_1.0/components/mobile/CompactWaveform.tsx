import React, { memo } from 'react';
import Waveform from '../shared/Waveform';

interface CompactWaveformProps {
  isPlaying: boolean;
  volume: number;
  color: string;
  playbackRate: number;
}

const CompactWaveform: React.FC<CompactWaveformProps> = ({ isPlaying, volume, color, playbackRate }) => (
  <div className="rounded-xl overflow-hidden border border-white/10">
    <Waveform isPlaying={isPlaying} volume={volume} color={color} playbackRate={playbackRate} />
  </div>
);

export default memo(CompactWaveform);
