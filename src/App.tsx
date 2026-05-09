import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from './components/Board';
import { CollectionStrip } from './components/CollectionStrip';
import { PhotosLayer } from './components/PhotosLayer';
import { PhotoState } from './components/Photo';
import { WinModal } from './components/WinModal';
import {
  PHOTO_REGIONS,
  cellKey,
  cellsForPhoto,
  initialIceKeys,
} from './game/photos';

const initialPhotoStates = (): Record<string, PhotoState> => {
  const out: Record<string, PhotoState> = {};
  for (const p of PHOTO_REGIONS) out[p.id] = 'iced';
  return out;
};

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const [iceState, setIceState] = useState<Set<string>>(initialIceKeys);
  const [photoStates, setPhotoStates] = useState<Record<string, PhotoState>>(initialPhotoStates);
  const [hasWon, setHasWon] = useState(false);

  const handleMatchedCells = useCallback(
    (cells: Array<{ row: number; col: number }>) => {
      setIceState((prev) => {
        let mutated = false;
        const next = new Set(prev);
        for (const { row, col } of cells) {
          if (next.delete(cellKey(row, col))) mutated = true;
        }
        return mutated ? next : prev;
      });
    },
    [],
  );

  const handlePhotoTap = useCallback((photoId: string) => {
    setPhotoStates((prev) => {
      // Only collected → expanded. Tapping an already-expanded photo is a no-op;
      // dismissal happens via the backdrop (taps outside the photo).
      if (prev[photoId] !== 'collected') return prev;
      const next: Record<string, PhotoState> = { ...prev };
      for (const id in next) {
        if (next[id] === 'expanded') next[id] = 'collected';
      }
      next[photoId] = 'expanded';
      return next;
    });
  }, []);

  const handleBackdropTap = useCallback(() => {
    setPhotoStates((prev) => {
      let mutated = false;
      const next: Record<string, PhotoState> = { ...prev };
      for (const id in next) {
        if (next[id] === 'expanded') {
          next[id] = 'collected';
          mutated = true;
        }
      }
      return mutated ? next : prev;
    });
  }, []);

  // When iceState changes, fire reveal for any photo that just became fully un-iced.
  useEffect(() => {
    for (const p of PHOTO_REGIONS) {
      if (photoStates[p.id] !== 'iced') continue;
      const allBroken = cellsForPhoto(p).every(
        ({ row, col }) => !iceState.has(cellKey(row, col)),
      );
      if (allBroken) {
        setPhotoStates((s) => ({ ...s, [p.id]: 'revealing-grow' }));
        setTimeout(() => setPhotoStates((s) => ({ ...s, [p.id]: 'revealing-hold' })), 600);
        setTimeout(() => setPhotoStates((s) => ({ ...s, [p.id]: 'revealing-shrink' })), 1100);
        setTimeout(() => setPhotoStates((s) => ({ ...s, [p.id]: 'collected' })), 1750);
      }
    }
    // photoStates intentionally omitted: we only react to iceState changes.
    // The 'iced' guard above prevents re-triggering after photoStates updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iceState]);

  // Latch hasWon once every photo has finished its reveal and is collected (or
  // the user expanded one immediately after — still counts).
  useEffect(() => {
    if (hasWon) return;
    const allDone = PHOTO_REGIONS.every(
      (p) => photoStates[p.id] === 'collected' || photoStates[p.id] === 'expanded',
    );
    if (allDone) setHasWon(true);
  }, [photoStates, hasWon]);

  return (
    <div className="app" ref={appRef}>
      <Board boardElRef={boardRef} iceState={iceState} onMatchedCells={handleMatchedCells} />
      <CollectionStrip ref={stripRef} />
      <PhotosLayer
        appRef={appRef}
        boardRef={boardRef}
        stripRef={stripRef}
        photoStates={photoStates}
        onPhotoTap={handlePhotoTap}
        onBackdropTap={handleBackdropTap}
      />
      {hasWon && <WinModal />}
    </div>
  );
}
