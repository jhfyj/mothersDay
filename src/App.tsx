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
  // Bumping gameKey forces <Board> to remount with fresh cells.
  const [gameKey, setGameKey] = useState(0);

  const handleRestart = useCallback(() => {
    setIceState(initialIceKeys());
    setPhotoStates(initialPhotoStates());
    setHasWon(false);
    setGameKey((k) => k + 1);
  }, []);

  const handleDownloadPhotos = useCallback(async () => {
    // Fetch all 5 photos as Files. raw.githubusercontent.com is CORS-open
    // (Access-Control-Allow-Origin: *) so blob() works.
    const files = await Promise.all(
      PHOTO_REGIONS.map(async (r) => {
        const res = await fetch(r.src);
        const blob = await res.blob();
        return new File([blob], `mom-${r.id}.jpg`, { type: blob.type || 'image/jpeg' });
      }),
    );

    // Preferred: system share sheet with all 5 files (iOS "Save to Photos",
    // Android "Save Images" — single user confirmation for all 5).
    if (navigator.canShare?.({ files }) && navigator.share) {
      try {
        await navigator.share({ files, title: '母亲节照片' });
        return;
      } catch (err) {
        // User cancelled — don't fall back, they explicitly dismissed.
        if ((err as Error)?.name === 'AbortError') return;
        // Otherwise fall through to download fallback.
      }
    }

    // Fallback: trigger 5 separate downloads with small spacing so the browser
    // doesn't treat them as popup spam.
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await new Promise((r) => setTimeout(r, 200));
    }
  }, []);

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
      <Board
        key={gameKey}
        boardElRef={boardRef}
        iceState={iceState}
        onMatchedCells={handleMatchedCells}
      />
      <CollectionStrip ref={stripRef} />
      <PhotosLayer
        appRef={appRef}
        boardRef={boardRef}
        stripRef={stripRef}
        photoStates={photoStates}
        onPhotoTap={handlePhotoTap}
        onBackdropTap={handleBackdropTap}
      />
      {hasWon && <WinModal onRestart={handleRestart} onDownload={handleDownloadPhotos} />}
    </div>
  );
}
