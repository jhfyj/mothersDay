import type { CSSProperties } from 'react';
import { AnimalKind, Direction } from '../game/types';
import { useSwipe } from '../hooks/useSwipe';
import { ANIMAL_SRC } from '../assets/animalSources';

type Props = {
  kind: AnimalKind;
  style: CSSProperties;
  exiting: boolean;
  selected: boolean;
  shuffling: boolean;
  onSwipe: (dir: Direction) => void;
  onTap: () => void;
};

export function Tile({ kind, style, exiting, selected, shuffling, onSwipe, onTap }: Props) {
  const handlers = useSwipe(onSwipe, onTap);
  const cls = `tile${exiting ? ' exiting' : ''}${shuffling ? ' shuffling' : ''}`;
  return (
    <div className={cls} style={style} {...handlers}>
      <div className={`cell${selected ? ' selected' : ''}`}>
        <img src={ANIMAL_SRC[kind]} alt={kind} draggable={false} />
      </div>
    </div>
  );
}
