import type { KnowledgeCard, Slide } from '../types';

const INTERACTIVE_TYPES = new Set<Slide['type']>(['quiz', 'reveal', 'estimate', 'order']);

export function isInteractive(slide: Slide): boolean {
  return INTERACTIVE_TYPES.has(slide.type);
}

/** Index of the card's first interactive slide, or -1. */
export function firstInteractive(card: KnowledgeCard): number {
  return card.slides?.findIndex(isInteractive) ?? -1;
}

/** The key a slide's result is stored under in the reader's progress. */
export function challengeId(card: KnowledgeCard, slideIndex: number): string {
  return `${card.id}#${slideIndex}`;
}
