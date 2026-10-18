import type { KnowledgeCard, Slide } from '../types';

/** Slides that are a picture rather than text: drawn from numbers, or an image file. */
const VISUAL_TYPES = new Set<Slide['type']>(['chart', 'pictogram', 'scale', 'spectrum', 'flow', 'image', 'video', 'rank', 'higher', 'fill', 'place']);

export function isVisual(slide: Slide): boolean {
  return VISUAL_TYPES.has(slide.type);
}

/** Index of the card's first visual slide, or -1. */
export function firstVisual(card: KnowledgeCard): number {
  return card.slides?.findIndex(isVisual) ?? -1;
}

/** Index of the card's first video slide, or -1. */
export function firstVideo(card: KnowledgeCard): number {
  return card.slides?.findIndex((s) => s.type === 'video') ?? -1;
}
