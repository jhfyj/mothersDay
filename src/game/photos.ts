// Photos hosted directly from the GitHub repo. Change the branch in PHOTO_BASE_URL
// if you ever switch from main, or swap to a CDN later.
export const PHOTO_BASE_URL =
  'https://raw.githubusercontent.com/jhfyj/mothersDay/main/src/assets/photos';

export type PhotoRegion = {
  id: string;
  src: string;
  topRow: number;
  leftCol: number;
  width: 1 | 2;
  height: 1 | 2;
};

export const PHOTO_REGIONS: ReadonlyArray<PhotoRegion> = [
  { id: 'p1', src: `${PHOTO_BASE_URL}/photo1.jpg`, topRow: 0, leftCol: 1, width: 2, height: 2 },
  { id: 'p2', src: `${PHOTO_BASE_URL}/photo4.jpg`, topRow: 0, leftCol: 4, width: 2, height: 2 },
  { id: 'p3', src: `${PHOTO_BASE_URL}/photo3.jpg`, topRow: 1, leftCol: 0, width: 1, height: 2 },
  { id: 'p4', src: `${PHOTO_BASE_URL}/photo5.jpg`, topRow: 1, leftCol: 6, width: 1, height: 2 },
  { id: 'p5', src: `${PHOTO_BASE_URL}/photo2.jpg`, topRow: 3, leftCol: 3, width: 2, height: 2 },
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
