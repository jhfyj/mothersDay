import { useLayoutEffect, useState, type RefObject } from 'react';
import { PHOTO_REGIONS } from '../game/photos';
import { SHAPE_COLS, SHAPE_ROWS } from '../game/shape';
import { Photo, PhotoLayout, PhotoState } from './Photo';

type Props = {
  appRef: RefObject<HTMLDivElement>;
  boardRef: RefObject<HTMLDivElement>;
  stripRef: RefObject<HTMLDivElement>;
  photoStates: Record<string, PhotoState>;
  onPhotoTap: (photoId: string) => void;
  onBackdropTap: () => void;
};

export function PhotosLayer({
  appRef,
  boardRef,
  stripRef,
  photoStates,
  onPhotoTap,
  onBackdropTap,
}: Props) {
  const [layout, setLayout] = useState<PhotoLayout | null>(null);

  useLayoutEffect(() => {
    const appEl = appRef.current;
    const boardEl = boardRef.current;
    const stripEl = stripRef.current;
    if (!appEl || !boardEl || !stripEl) return;

    const measure = () => {
      const appRect = appEl.getBoundingClientRect();
      const boardRect = boardEl.getBoundingClientRect();

      const slots = Array.from(
        stripEl.querySelectorAll<HTMLElement>('.strip-slot'),
      ).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - appRect.left,
          top: r.top - appRect.top,
          width: r.width,
          height: r.height,
        };
      });

      setLayout({
        gridLeft: boardRect.left - appRect.left,
        gridTop: boardRect.top - appRect.top,
        cellWidth: boardRect.width / SHAPE_COLS,
        cellHeight: boardRect.height / SHAPE_ROWS,
        centerX: appRect.width / 2,
        centerY: appRect.height / 2,
        growMaxDim: Math.min(appRect.width * 0.75, appRect.height * 0.6),
        slotRects: slots,
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(appEl);
    ro.observe(boardEl);
    ro.observe(stripEl);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [appRef, boardRef, stripRef]);

  if (!layout) return null;

  const anyExpanded = Object.values(photoStates).some((s) => s === 'expanded');

  return (
    <div className="photos-layer">
      {anyExpanded && (
        <div
          className="photo-backdrop"
          onTouchEnd={(e) => {
            e.preventDefault();
            onBackdropTap();
          }}
        />
      )}
      {PHOTO_REGIONS.map((p, i) => (
        <Photo
          key={p.id}
          region={p}
          slotIndex={i}
          state={photoStates[p.id] ?? 'iced'}
          layout={layout}
          onTap={() => onPhotoTap(p.id)}
        />
      ))}
    </div>
  );
}
