import { useMemo } from 'react';
import { useDrag } from 'react-use-gesture';

interface GestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useGestures = ({
  threshold = 60,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown
}: GestureOptions) => {
  const bind = useDrag(({ movement: [mx, my], last }) => {
    if (!last) return;

    const absX = Math.abs(mx);
    const absY = Math.abs(my);
    if (absX < threshold && absY < threshold) return;

    if (absX > absY) {
      if (mx < 0) onSwipeLeft?.();
      if (mx > 0) onSwipeRight?.();
    } else {
      if (my < 0) onSwipeUp?.();
      if (my > 0) onSwipeDown?.();
    }
  });

  return useMemo(() => bind, [bind]);
};
