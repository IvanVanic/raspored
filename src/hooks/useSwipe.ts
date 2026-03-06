import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocityThreshold = 0.3,
}: UseSwipeOptions): SwipeHandlers {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchCurrent = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.touches[0];
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchCurrent.current) return;

    const dx = touchCurrent.current.x - touchStart.current.x;
    const dy = touchCurrent.current.y - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    const velocity = Math.abs(dx) / dt;

    // Only trigger horizontal swipes (ignore vertical scrolling)
    if (Math.abs(dy) > Math.abs(dx) * 0.7) {
      touchStart.current = null;
      touchCurrent.current = null;
      return;
    }

    // Check if swipe meets threshold (distance or velocity)
    const isValidSwipe = Math.abs(dx) > threshold || velocity > velocityThreshold;

    if (isValidSwipe) {
      if (dx < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (dx > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    touchStart.current = null;
    touchCurrent.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold, velocityThreshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
