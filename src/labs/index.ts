import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { LabId } from '../../shared/labs.ts';
import type { LabProps } from './kit';

/** Every lab in shared/labs.ts, each loaded only when its slide comes into view. */
export const LAB_COMPONENTS: Record<LabId, LazyExoticComponent<ComponentType<LabProps>>> = {
  'monty-hall': lazy(() => import('./math/monty-hall')),
  'birthday-problem': lazy(() => import('./math/birthday-problem')),
  'blind-spot': lazy(() => import('./body/blind-spot')),
  'base-rate-fallacy': lazy(() => import('./math/base-rate-fallacy')),
  'kaprekar-6174': lazy(() => import('./math/kaprekar-6174')),
  'pythagoras-rearrangement-proof': lazy(() => import('./math/pythagoras-rearrangement-proof')),
  'simpsons-paradox': lazy(() => import('./math/simpsons-paradox')),
  'slide-rule-adds-logarithms': lazy(() => import('./math/slide-rule-adds-logarithms')),
  'binary-adder-logic-gates': lazy(() => import('./tech/binary-adder-logic-gates')),
  'binary-search-twenty-guesses': lazy(() => import('./tech/binary-search-twenty-guesses')),
  'enigma-never-itself': lazy(() => import('./tech/enigma-never-itself')),
  'huffman-coding-term-paper': lazy(() => import('./tech/huffman-coding-term-paper')),
  'public-key-cryptography': lazy(() => import('./tech/public-key-cryptography')),
  'double-slit': lazy(() => import('./physics/double-slit')),
  'foucault-pendulum': lazy(() => import('./physics/foucault-pendulum')),
  'pitch-drop-experiment': lazy(() => import('./physics/pitch-drop-experiment')),
  'why-the-sky-is-blue': lazy(() => import('./physics/why-the-sky-is-blue')),
  'chladni-figures-sand': lazy(() => import('./physics/chladni-figures-sand')),
  'ancient-sunlight': lazy(() => import('./space/ancient-sunlight')),
  'astronauts-are-falling': lazy(() => import('./space/astronauts-are-falling')),
  'kepler-equal-areas': lazy(() => import('./space/kepler-equal-areas')),
  'mars-retrograde-loop': lazy(() => import('./space/mars-retrograde-loop')),
  'moon-phases': lazy(() => import('./space/moon-phases')),
  'milankovitch-cycles': lazy(() => import('./earth/milankovitch-cycles')),
  'coriolis-toilet-myth': lazy(() => import('./earth/coriolis-toilet-myth')),
};
