import bear from './animals/bear.svg';
import chicken from './animals/chicken.svg';
import fox from './animals/fox.svg';
import frog from './animals/frog.svg';
import hippo from './animals/hippo.svg';
import { AnimalKind } from '../game/types';

export const ANIMAL_SRC: Record<AnimalKind, string> = {
  bear,
  chicken,
  fox,
  frog,
  hippo,
};
