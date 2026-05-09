import { ANIMAL_KINDS, AnimalKind, CellState } from './types';
import { ALL_VALID, SHAPE_COLS, SHAPE_ROWS, isValidCell } from './shape';
import { findMatches } from './matches';

let nextId = 0;
export const newId = () => `c${nextId++}`;

export const randomKind = (): AnimalKind =>
  ANIMAL_KINDS[Math.floor(Math.random() * ANIMAL_KINDS.length)];

export const newCell = (
  row: number,
  col: number,
  kind: AnimalKind = randomKind(),
): CellState => ({
  id: newId(),
  kind,
  row,
  col,
  exiting: false,
});

// Build initial cells across the shape's playable positions, avoiding any
// pre-existing run of 3 in either direction.
export function buildInitialCells(): CellState[] {
  const kindAt = new Map<string, AnimalKind>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (const { row, col } of ALL_VALID) {
    const forbidden = new Set<AnimalKind>();
    if (
      isValidCell(row - 1, col) &&
      isValidCell(row - 2, col) &&
      kindAt.get(key(row - 1, col)) === kindAt.get(key(row - 2, col))
    ) {
      forbidden.add(kindAt.get(key(row - 1, col))!);
    }
    if (
      isValidCell(row, col - 1) &&
      isValidCell(row, col - 2) &&
      kindAt.get(key(row, col - 1)) === kindAt.get(key(row, col - 2))
    ) {
      forbidden.add(kindAt.get(key(row, col - 1))!);
    }
    let k = randomKind();
    while (forbidden.has(k)) k = randomKind();
    kindAt.set(key(row, col), k);
  }

  return ALL_VALID.map(({ row, col }) => newCell(row, col, kindAt.get(key(row, col))!));
}

// Returns true if any single adjacent swap would produce a match.
// Mutates cell row/col temporarily for the simulation, restoring before return.
export function hasValidMove(cells: CellState[]): boolean {
  const cellAt = new Map<string, CellState>();
  for (const c of cells) {
    if (c.exiting || c.row < 0 || c.row >= SHAPE_ROWS || c.col < 0 || c.col >= SHAPE_COLS) {
      continue;
    }
    cellAt.set(`${c.row},${c.col}`, c);
  }

  for (let r = 0; r < SHAPE_ROWS; r++) {
    for (let c = 0; c < SHAPE_COLS; c++) {
      if (!isValidCell(r, c)) continue;
      const a = cellAt.get(`${r},${c}`);
      if (!a) continue;
      // Each unique adjacent pair tried once: down + right.
      for (const [dr, dc] of [[0, 1], [1, 0]] as const) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (!isValidCell(r2, c2)) continue;
        const b = cellAt.get(`${r2},${c2}`);
        if (!b) continue;
        // Simulate swap.
        a.row = r2; a.col = c2;
        b.row = r;  b.col = c;
        const matches = findMatches(cells);
        // Restore.
        a.row = r;  a.col = c;
        b.row = r2; b.col = c2;
        if (matches.size > 0) return true;
      }
    }
  }
  return false;
}

// Reassign every cell's kind so the board has at least one valid move and no
// pre-existing matches. Mutates cells in place. Up to maxAttempts random
// re-rolls; falls back to whatever was generated if it can't find a clean one.
export function reshuffleKinds(cells: CellState[], maxAttempts = 60): void {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (const c of cells) {
      if (c.exiting) continue;
      c.kind = randomKind();
    }
    if (findMatches(cells).size === 0 && hasValidMove(cells)) return;
  }
}
