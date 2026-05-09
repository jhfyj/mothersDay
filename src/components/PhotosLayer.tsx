import { useEffect, useState, type RefObject } from 'react';
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

// Initial layout used before measurement completes. cellWidth/Height of 1 keeps
// math safe (no divide-by-zero downstream); photos render tiny near origin and
// crucially trigger their <img>/background-image requests immediately. Real
// positions snap in on the first measurement.
const FALLBACK_LAYOUT: PhotoLayout = {
  gridLeft: 0,
  gridTop: 0,
  cellWidth: 1,
  cellHeight: 1,
  centerX: 0,
  centerY: 0,
  growMaxDim: 300,
  slotRects: [],
};

export function PhotosLayer({
  appRef,
  boardRef,
  stripRef,
  photoStates,
  onPhotoTap,
  onBackdropTap,
}: Props) {
  const [layout, setLayout] = useState<PhotoLayout>(FALLBACK_LAYOUT);

  useEffect(() => {
    const measure = () => {
      const appEl = appRef.current;
      const boardEl = boardRef.current;
      const stripEl = stripRef.current;
      if (!appEl || !boardEl || !stripEl) return false;

      const appRect = appEl.getBoundingClientRect();
      const boardRect = boardEl.getBoundingClientRect();
      // Skip degenerate measurements (DOM not laid out yet).
      if (boardRect.width === 0 || boardRect.height === 0) return false;

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
      return true;
    };

    // Try immediately, then on next frame in case the DOM wasn't fully sized
    // yet (fonts loading, etc.).
    measure();
    const raf1 = requestAnimationFrame(() => {
      if (!measure()) {
        // One more retry after a short delay if the second attempt also failed.
        setTimeout(measure, 100);
      }
    });

    const appEl = appRef.current;
    const boardEl = boardRef.current;
    const stripEl = stripRef.current;
    let ro: ResizeObserver | null = null;
    if (appEl && boardEl && stripEl) {
      ro = new ResizeObserver(measure);
      ro.observe(appEl);
      ro.observe(boardEl);
      ro.observe(stripEl);
    }
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf1);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [appRef, boardRef, stripRef]);

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
