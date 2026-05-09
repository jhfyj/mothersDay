import type { CSSProperties } from 'react';
import { PhotoRegion } from '../game/photos';
import { useSwipe } from '../hooks/useSwipe';

export type PhotoState =
  | 'iced'
  | 'revealing-grow'
  | 'revealing-hold'
  | 'revealing-shrink'
  | 'collected'
  | 'expanded';

export type PhotoLayout = {
  gridLeft: number;
  gridTop: number;
  cellWidth: number;
  cellHeight: number;
  centerX: number;
  centerY: number;
  growMaxDim: number; // bounding box for grown phase; aspect ratio applied per region
  slotRects: ReadonlyArray<{ left: number; top: number; width: number; height: number }>;
};

type Props = {
  region: PhotoRegion;
  slotIndex: number;
  state: PhotoState;
  layout: PhotoLayout;
  onTap: () => void;
};

const CENTERED_STATES: ReadonlyArray<PhotoState> = [
  'revealing-grow',
  'revealing-hold',
  'expanded',
];

export function Photo({ region, slotIndex, state, layout, onTap }: Props) {
  const handlers = useSwipe(undefined, onTap);

  let left: number;
  let top: number;
  let width: number;
  let height: number;

  if (state === 'iced') {
    left = layout.gridLeft + region.leftCol * layout.cellWidth;
    top = layout.gridTop + region.topRow * layout.cellHeight;
    width = region.width * layout.cellWidth;
    height = region.height * layout.cellHeight;
  } else if (CENTERED_STATES.includes(state)) {
    const aspect = region.width / region.height;
    if (aspect >= 1) {
      width = layout.growMaxDim;
      height = width / aspect;
    } else {
      height = layout.growMaxDim;
      width = height * aspect;
    }
    left = layout.centerX - width / 2;
    top = layout.centerY - height / 2;
  } else {
    // revealing-shrink, collected
    const slot = layout.slotRects[slotIndex] ?? { left: 0, top: 0, width: 0, height: 0 };
    left = slot.left;
    top = slot.top;
    width = slot.width;
    height = slot.height;
  }

  const inFront = state !== 'iced';

  const style: CSSProperties = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundImage: `url(${region.src})`,
    zIndex: inFront ? 100 : 0,
    opacity: state === 'iced' ? 0.5 : 1,
  };

  const cls = `photo photo--${state}${region.height > region.width ? ' photo--portrait' : ''}`;
  return <div className={cls} style={style} {...handlers} />;
}
