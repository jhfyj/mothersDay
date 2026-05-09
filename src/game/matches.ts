import { CellState } from './types';
import { SHAPE_COLS, SHAPE_ROWS } from './shape';

export function findMatches(cells: CellState[]): Set<string> {
  const grid: (CellState | null)[][] = Array.from({ length: SHAPE_ROWS }, () =>
    Array<CellState | null>(SHAPE_COLS).fill(null),
  );
  for (const cell of cells) {
    if (
      !cell.exiting &&
      cell.row >= 0 &&
      cell.row < SHAPE_ROWS &&
      cell.col >= 0 &&
      cell.col < SHAPE_COLS
    ) {
      grid[cell.row][cell.col] = cell;
    }
  }

  const matched = new Set<string>();

  // Horizontal: a null/empty position naturally breaks the run.
  for (let r = 0; r < SHAPE_ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= SHAPE_COLS; c++) {
      const same =
        c < SHAPE_COLS &&
        grid[r][c] !== null &&
        grid[r][start] !== null &&
        grid[r][c]!.kind === grid[r][start]!.kind;
      if (!same) {
        if (c - start >= 3 && grid[r][start] !== null) {
          for (let k = start; k < c; k++) matched.add(grid[r][k]!.id);
        }
        start = c;
      }
    }
  }

  // Vertical
  for (let c = 0; c < SHAPE_COLS; c++) {
    let start = 0;
    for (let r = 1; r <= SHAPE_ROWS; r++) {
      const same =
        r < SHAPE_ROWS &&
        grid[r][c] !== null &&
        grid[start][c] !== null &&
        grid[r][c]!.kind === grid[start][c]!.kind;
      if (!same) {
        if (r - start >= 3 && grid[start][c] !== null) {
          for (let k = start; k < r; k++) matched.add(grid[k][c]!.id);
        }
        start = r;
      }
    }
  }

  return matched;
}
