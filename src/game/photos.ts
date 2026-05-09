import p1 from '../assets/photos/photo1.jpg';
import p2 from '../assets/photos/photo2.jpg';
import p3 from '../assets/photos/photo3.jpg';
import p4 from '../assets/photos/photo4.jpg';
import p5 from '../assets/photos/photo5.jpg';

export type PhotoRegion = {
  id: string;
  src: string;
  topRow: number;
  leftCol: number;
  width: 1 | 2;
  height: 1 | 2;
};

export const PHOTO_REGIONS: ReadonlyArray<PhotoRegion> = [
  { id: 'p1', src: p1, topRow: 0, leftCol: 1, width: 2, height: 2 },
  { id: 'p2', src: p4, topRow: 0, leftCol: 4, width: 2, height: 2 },
  { id: 'p3', src: p3, topRow: 1, leftCol: 0, width: 1, height: 2 },
  { id: 'p4', src: p5, topRow: 1, leftCol: 6, width: 1, height: 2 },
  { id: 'p5', src: p2, topRow: 3, leftCol: 3, width: 2, height: 2 },
];

export const cellKey = (row: number, col: number) => `${row},${col}`;

export const photoAtCell = (row: number, col: number): PhotoRegion | undefined => {
  for (const p of PHOTO_REGIONS) {
    if (
      row >= p.topRow &&
      row < p.topRow + p.height &&
      col >= p.leftCol &&
      col < p.leftCol + p.width
    ) {
      return p;
    }
  }
  return undefined;
};

export const cellsForPhoto = (p: PhotoRegion): Array<{ row: number; col: number }> => {
  const out: Array<{ row: number; col: number }> = [];
  for (let r = p.topRow; r < p.topRow + p.height; r++) {
    for (let c = p.leftCol; c < p.leftCol + p.width; c++) {
      out.push({ row: r, col: c });
    }
  }
  return out;
};

// Initial set of iced cell keys = every cell covered by any photo region.
export const initialIceKeys = (): Set<string> => {
  const s = new Set<string>();
  for (const p of PHOTO_REGIONS) {
    for (const { row, col } of cellsForPhoto(p)) s.add(cellKey(row, col));
  }
  return s;
};
