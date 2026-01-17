import React, { memo, useEffect } from 'react';
import { useDrag } from 'react-use-gesture';
import { animated, useSpring } from 'react-spring';
import Mixer from '../desktop/Mixer';
import { useUI } from '../../contexts/UIContext';

const SwipeableMixer: React.FC = () => {
  const { isMixerOpen, openMixer, closeMixer } = useUI();
  const [{ y }, api] = useSpring(() => ({ y: 1000 }));

  useEffect(() => {
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;
    api.start({ y: isMixerOpen ? 0 : height });
  }, [api, isMixerOpen]);

  const bind = useDrag(({ last, movement: [, my] }) => {
    if (last) {
      if (my > 120) {
        closeMixer();
      } else {
        openMixer();
      }
      return;
    }
    api.start({ y: Math.max(0, my) });
  }, { axis: 'y' });

  return (
    <animated.div
      {...bind()}
      style={{ transform: y.to(value => `translateY(${value}px)`) }}
      className="fixed inset-x-0 bottom-0 z-40 bg-[#1C1B1F] rounded-t-3xl border-t border-white/10 shadow-2xl touch-none"
      aria-hidden={!isMixerOpen}
    >
      <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3" />
      <div className="max-h-[70vh] overflow-y-auto px-3 pb-6">
        <Mixer variant="mobile" />
      </div>
    </animated.div>
  );
};

export default memo(SwipeableMixer);
