import type { KnowledgeCard, Slide } from '../types';

const INTERACTIVE_TYPES = new Set<Slide['type']>(['quiz', 'reveal', 'estimate', 'order', 'match', 'sort', 'scramble', 'odd']);

/** Puzzles are the interactive slides with more than one tap in them. */
const PUZZLE_TYPES = new Set<Slide['type']>(['order', 'match', 'sort', 'scramble', 'odd']);

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

/** The key a slide's result is stored under in the reader's progress. */
export function challengeId(card: KnowledgeCard, slideIndex: number): string {
  return `${card.id}#${slideIndex}`;
}

/** A stable number from a string, to seed the per-post shuffles so a puzzle looks the same on every visit. */
export function seed(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}
