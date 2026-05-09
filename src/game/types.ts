export const ANIMAL_KINDS = ['bear', 'chicken', 'fox', 'frog', 'hippo'] as const;
export type AnimalKind = (typeof ANIMAL_KINDS)[number];

export type CellState = {
  id: string;
  kind: AnimalKind;
  row: number; // visual row; can be negative while spawning above the board
  col: number;
  exiting: boolean;
};

export type Direction = 'up' | 'down' | 'left' | 'right';
