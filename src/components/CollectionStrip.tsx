import { forwardRef } from 'react';
import { PHOTO_REGIONS } from '../game/photos';

export const CollectionStrip = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="strip" ref={ref}>
      {PHOTO_REGIONS.map((p) => (
        <div
          className={`strip-slot${p.height > p.width ? ' strip-slot--portrait' : ''}`}
          key={p.id}
          style={{ aspectRatio: `${p.width} / ${p.height}` }}
        />
      ))}
    </div>
  );
});

CollectionStrip.displayName = 'CollectionStrip';
