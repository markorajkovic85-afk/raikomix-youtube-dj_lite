import { useGestures } from './useGestures';

interface SwipeableOptions {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  threshold?: number;
}

export const useSwipeable = ({
  onSwipedLeft,
  onSwipedRight,
  onSwipedUp,
  onSwipedDown,
  threshold
}: SwipeableOptions) => {
  return useGestures({
    onSwipeLeft: onSwipedLeft,
    onSwipeRight: onSwipedRight,
    onSwipeUp: onSwipedUp,
    onSwipeDown: onSwipedDown,
    threshold
  });
};
