import { useRef, type TouchEvent as RTouchEvent } from 'react';
import { Direction } from '../game/types';

const SWIPE_THRESHOLD_PX = 20;

export function useSwipe(
  onSwipe?: (dir: Direction) => void,
  onTap?: () => void,
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const begin = (x: number, y: number) => {
    start.current = { x, y };
  };

  const end = (x: number, y: number) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = x - s.x;
    const dy = y - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) {
      onTap?.();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      onSwipe?.(dx > 0 ? 'right' : 'left');
    } else {
      onSwipe?.(dy > 0 ? 'down' : 'up');
    }
  };

  return {
    onTouchStart: (e: RTouchEvent) => {
      const t = e.touches[0];
      begin(t.clientX, t.clientY);
    },
    onTouchEnd: (e: RTouchEvent) => {
      const t = e.changedTouches[0];
      end(t.clientX, t.clientY);
    },
  };
}
