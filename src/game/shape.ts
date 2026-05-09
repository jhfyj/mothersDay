// 'X' = playable cell, '.' = empty (no tile rendered there).
const HEART_MASK: ReadonlyArray<string> = [
  '.XX.XX.',
  'XXXXXXX',
  'XXXXXXX',
  '.XXXXX.',
  '..XXX..',
  '...X...',
];

export const SHAPE_ROWS = HEART_MASK.length;
export const SHAPE_COLS = HEART_MASK[0].length;

const VALID: boolean[][] = HEART_MASK.map((row) =>
  row.split('').map((ch) => ch === 'X'),
);

export const isValidCell = (r: number, c: number): boolean =>
  r >= 0 && r < SHAPE_ROWS && c >= 0 && c < SHAPE_COLS && VALID[r][c];

// Sorted top-to-bottom list of playable rows in a column.
const COL_VALID_ROWS: number[][] = Array.from({ length: SHAPE_COLS }, (_, c) => {
  const rs: number[] = [];
  for (let r = 0; r < SHAPE_ROWS; r++) if (VALID[r][c]) rs.push(r);
  return rs;
});

export const columnRows = (c: number): readonly number[] => COL_VALID_ROWS[c];

export const ALL_VALID: ReadonlyArray<{ row: number; col: number }> = (() => {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < SHAPE_ROWS; r++) {
    for (let c = 0; c < SHAPE_COLS; c++) {
      if (VALID[r][c]) out.push({ row: r, col: c });
    }
  }
  return out;
})();
