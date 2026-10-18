import type { KnowledgeCard, Slide } from '../types';
import { createRng, shuffle } from './feed';

const INTERACTIVE_TYPES = new Set<Slide['type']>([
  'quiz',
  'reveal',
  'estimate',
  'order',
  'match',
  'sort',
  'scramble',
  'odd',
  'rank',
  'higher',
  'fill',
  'place',
]);

/** Puzzles are the interactive slides with more than one tap in them. */
const PUZZLE_TYPES = new Set<Slide['type']>(['order', 'match', 'sort', 'scramble', 'odd', 'rank', 'higher', 'fill', 'place']);

export function isInteractive(slide: Slide): boolean {
  return INTERACTIVE_TYPES.has(slide.type);
}

export function isPuzzle(slide: Slide): boolean {
  return PUZZLE_TYPES.has(slide.type);
}

/** Index of the card's first interactive slide, or -1. */
export function firstInteractive(card: KnowledgeCard): number {
  return card.slides?.findIndex(isInteractive) ?? -1;
}

/** One of the card's interactive slides, chosen by `key` (for example the day) so stories vary, or -1. */
export function pickInteractive(card: KnowledgeCard, key: string): number {
  const options = (card.slides ?? []).map((slide, i) => (isInteractive(slide) ? i : -1)).filter((i) => i >= 0);
  if (!options.length) return -1;
  return options[seed(`${key}:${card.id}`) % options.length];
}

/** The key a slide's result is stored under in the reader's progress; `slideIndex` counts the title slide as 0. */
export function challengeId(card: KnowledgeCard, slideIndex: number): string {
  return `${card.id}#${slideIndex}`;
}

/** A stable number from a string, to seed the per-post shuffles so a puzzle looks the same on every visit. */
export function seed(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** A shuffle of 0..n-1 that is the same on every visit and never the identity. */
export function stableShuffle(n: number, key: string): number[] {
  const out = shuffle(
    Array.from({ length: n }, (_, i) => i),
    createRng(seed(key)),
  );
  if (out.every((v, i) => v === i)) out.push(out.shift()!);
  return out;
}
