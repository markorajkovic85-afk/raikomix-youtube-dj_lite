import { useCallback, useMemo, useRef } from 'react';

import { SwipeConfig } from '../types';

export const useSwipeable = (config: SwipeConfig) => {
  const {
    onSwipedLeft,
    onSwipedRight,
    onSwipedUp,
    onSwipedDown,
    delta = 50,
    preventDefaultTouchmoveEvent = true,
    trackMouse = false
  } = config;

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent | MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchEnd.current = null;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      const touch = 'touches' in e ? e.touches[0] : e;
      touchEnd.current = { x: touch.clientX, y: touch.clientY };

      if (preventDefaultTouchmoveEvent && 'touches' in e) {
        e.preventDefault();
      }
    },
    [preventDefaultTouchmoveEvent]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < delta && absY < delta) return;

    if (absX > absY) {
      if (deltaX > 0) {
        onSwipedLeft?.();
      } else {
        onSwipedRight?.();
      }
    } else {
      if (deltaY > 0) {
        onSwipedUp?.();
      } else {
        onSwipedDown?.();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [delta, onSwipedLeft, onSwipedRight, onSwipedUp, onSwipedDown]);

  const handlers = useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      ...(trackMouse && {
        onMouseDown: handleTouchStart,
        onMouseMove: handleTouchMove,
        onMouseUp: handleTouchEnd
      })
    }),
    [handleTouchStart, handleTouchMove, handleTouchEnd, trackMouse]
  );

  return handlers;
};
