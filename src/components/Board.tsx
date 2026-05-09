import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { CellState, Direction } from '../game/types';
import { buildInitialCells, hasValidMove, newCell, reshuffleKinds } from '../game/board';
import { findMatches } from '../game/matches';
import { ALL_VALID, SHAPE_COLS, SHAPE_ROWS, columnRows, isValidCell } from '../game/shape';
import { cellKey, photoAtCell } from '../game/photos';
import { Tile } from './Tile';

const SWAP_MS = 220;
const CLEAR_MS = 200;
const FALL_MS = 320;
const SHUFFLE_OUT_MS = 450;
const SHUFFLE_IN_MS = 450;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

const dirDelta = (dir: Direction): [number, number] => {
  switch (dir) {
    case 'up': return [-1, 0];
    case 'down': return [1, 0];
    case 'left': return [0, -1];
    case 'right': return [0, 1];
  }
};

type Props = {
  boardElRef: RefObject<HTMLDivElement>;
  iceState: ReadonlySet<string>;
  onMatchedCells: (cells: Array<{ row: number; col: number }>) => void;
};

export function Board({ boardElRef, iceState, onMatchedCells }: Props) {
  const cellsRef = useRef<CellState[]>(buildInitialCells());
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  const busyRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Scatter (tiles shrink + spin), reassign kinds, then gather (tiles return).
  const shuffleBoard = async () => {
    setSelectedId(null);
    setIsShuffling(true);
    await wait(SHUFFLE_OUT_MS);

    update((prev) => {
      const next = prev.map((c) => ({ ...c }));
      reshuffleKinds(next);
      return next;
    });

    setIsShuffling(false);
    await wait(SHUFFLE_IN_MS);
  };

  // After every settled board, run shuffle if no valid moves remain.
  const finishMove = async () => {
    if (!hasValidMove(cellsRef.current)) {
      await shuffleBoard();
    }
    busyRef.current = false;
  };

  // On mount, the initial board could (very rarely) have no valid moves.
  useEffect(() => {
    if (!hasValidMove(cellsRef.current) && !busyRef.current) {
      busyRef.current = true;
      shuffleBoard().then(() => {
        busyRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (mutator: (prev: CellState[]) => CellState[]) => {
    cellsRef.current = mutator(cellsRef.current);
    forceRender();
  };

  const swap = (r1: number, c1: number, r2: number, c2: number) => {
    update((prev) =>
      prev.map((cell) => {
        if (cell.row === r1 && cell.col === c1) return { ...cell, row: r2, col: c2 };
        if (cell.row === r2 && cell.col === c2) return { ...cell, row: r1, col: c1 };
        return cell;
      }),
    );
  };

  const handleSwipe = async (r: number, c: number, dir: Direction) => {
    if (busyRef.current) return;
    setSelectedId(null);
    const [dr, dc] = dirDelta(dir);
    const r2 = r + dr;
    const c2 = c + dc;
    if (!isValidCell(r2, c2)) return;

    busyRef.current = true;

    swap(r, c, r2, c2);
    await wait(SWAP_MS);

    let matched = findMatches(cellsRef.current);
    if (matched.size === 0) {
      swap(r2, c2, r, c);
      await wait(SWAP_MS);
      await finishMove();
      return;
    }

    while (matched.size > 0) {
      const matchedSnapshot = matched;
      // Capture matched cell positions BEFORE marking exiting, so App can break ice.
      const matchedPositions = cellsRef.current
        .filter((c) => matchedSnapshot.has(c.id))
        .map((c) => ({ row: c.row, col: c.col }));
      onMatchedCells(matchedPositions);

      update((prev) =>
        prev.map((cell) =>
          matchedSnapshot.has(cell.id) ? { ...cell, exiting: true } : cell,
        ),
      );
      await wait(CLEAR_MS);

      update((prev) => {
        const surviving = prev.filter((cell) => !cell.exiting);
        const byCol = new Map<number, CellState[]>();
        for (const cell of surviving) {
          if (!byCol.has(cell.col)) byCol.set(cell.col, []);
          byCol.get(cell.col)!.push(cell);
        }
        const next: CellState[] = [];
        for (let col = 0; col < SHAPE_COLS; col++) {
          const validRows = columnRows(col);
          if (validRows.length === 0) continue;
          const colCells = (byCol.get(col) ?? []).sort((a, b) => a.row - b.row);
          const need = validRows.length - colCells.length;
          colCells.forEach((cell, i) => {
            next.push({ ...cell, row: validRows[need + i] });
          });
          for (let i = 0; i < need; i++) {
            next.push(newCell(i - need, col));
          }
        }
        return next;
      });

      await nextFrame();
      await nextFrame();

      update((prev) => {
        const newByCol = new Map<number, CellState[]>();
        for (const cell of prev) {
          if (cell.row < 0) {
            if (!newByCol.has(cell.col)) newByCol.set(cell.col, []);
            newByCol.get(cell.col)!.push(cell);
          }
        }
        for (const arr of newByCol.values()) arr.sort((a, b) => a.row - b.row);

        return prev.map((cell) => {
          const arr = newByCol.get(cell.col);
          if (!arr) return cell;
          const idx = arr.indexOf(cell);
          if (idx < 0) return cell;
          const validRows = columnRows(cell.col);
          return { ...cell, row: validRows[idx] };
        });
      });
      await wait(FALL_MS);

      matched = findMatches(cellsRef.current);
    }

    await finishMove();
  };

  const handleTap = (cellId: string) => {
    if (busyRef.current) return;
    const cell = cellsRef.current.find((c) => c.id === cellId);
    if (!cell) return;

    if (selectedId === cell.id) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null) {
      setSelectedId(cell.id);
      return;
    }
    const sel = cellsRef.current.find((c) => c.id === selectedId);
    if (!sel) {
      setSelectedId(cell.id);
      return;
    }
    const dr = cell.row - sel.row;
    const dc = cell.col - sel.col;
    const adjacent =
      (Math.abs(dr) === 1 && dc === 0) || (Math.abs(dc) === 1 && dr === 0);
    if (adjacent) {
      const dir: Direction =
        dr === -1 ? 'up' : dr === 1 ? 'down' : dc === -1 ? 'left' : 'right';
      handleSwipe(sel.row, sel.col, dir);
    } else {
      setSelectedId(cell.id);
    }
  };

  const boardStyle = {
    '--cols': SHAPE_COLS,
    '--rows': SHAPE_ROWS,
  } as CSSProperties;

  return (
    <div className="board" style={boardStyle} ref={boardElRef}>
      {ALL_VALID.map(({ row, col }) => {
        const cellStyle = {
          '--x': `${col * 100}%`,
          '--y': `${row * 100}%`,
        } as CSSProperties;
        const k = cellKey(row, col);
        const hasPhoto = photoAtCell(row, col) !== undefined;
        if (!hasPhoto) {
          return <div key={`bg-${k}`} className="cell-bg" style={cellStyle} />;
        }
        const iced = iceState.has(k);
        return (
          <div
            key={`ice-${k}`}
            className={`ice${iced ? '' : ' broken'}`}
            style={cellStyle}
          />
        );
      })}
      {cellsRef.current.map((cell) => {
        const tileStyle = {
          '--x': `${cell.col * 100}%`,
          '--y': `${cell.row * 100}%`,
        } as CSSProperties;
        return (
          <Tile
            key={cell.id}
            kind={cell.kind}
            exiting={cell.exiting}
            selected={selectedId === cell.id}
            shuffling={isShuffling}
            style={tileStyle}
            onSwipe={(dir) => handleSwipe(cell.row, cell.col, dir)}
            onTap={() => handleTap(cell.id)}
          />
        );
      })}
    </div>
  );
}
