import type { KnowledgeCard, Slide } from '../types';

/** Slides that are a picture rather than text: drawn from numbers, or an image file. */
const VISUAL_TYPES = new Set<Slide['type']>(['chart', 'pictogram', 'scale', 'spectrum', 'flow', 'image', 'comic', 'video', 'rank', 'higher', 'fill', 'place']);

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

/** Index of the card's first comic panel, or -1. */
export function firstComic(card: KnowledgeCard): number {
  return card.slides?.findIndex((s) => s.type === 'comic') ?? -1;
}

/** How many comic panels the card has. */
export function comicPanels(card: KnowledgeCard): number {
  return card.slides?.filter((s) => s.type === 'comic').length ?? 0;
}

/** Index of the card's first clip of real footage (a video slide that isn't an animation), or -1. */
export function firstFootage(card: KnowledgeCard): number {
  return card.slides?.findIndex((s) => s.type === 'video' && !s.animation) ?? -1;
}

/** Index of the card's first animated explainer, or -1. */
export function firstAnimation(card: KnowledgeCard): number {
  return card.slides?.findIndex((s) => s.type === 'video' && !!s.animation) ?? -1;
}
