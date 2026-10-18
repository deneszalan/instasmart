import type { KnowledgeCard } from '../types';
import { FIELDS } from '../data/fields';
import { createRng, shuffle, spreadByField } from './feed';

export interface Story {
  id: string;
  label: string;
  emoji: string;
  gradient: [string, string];
  cards: KnowledgeCard[];
}

export const STORY_LENGTH = 5;

function daySeed(day: string): number {
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Pick `count` cards, preferring ones not read yet, in a per-day order. */
function pick(cards: readonly KnowledgeCard[], seen: ReadonlySet<string>, rng: () => number, count: number) {
  const fresh = shuffle(cards.filter((c) => !seen.has(c.id)), rng);
  const old = shuffle(cards.filter((c) => seen.has(c.id)), rng);
  return fresh.concat(old).slice(0, count);
}

/** A "Daily 5" mix across fields, followed by one story per field. Changes every day. */
export function buildStories(library: readonly KnowledgeCard[], seen: ReadonlySet<string>, day: string): Story[] {
  const rng = createRng(daySeed(day));

  const daily = spreadByField(pick(library, seen, rng, STORY_LENGTH * 4), rng)
    .filter((card, i, all) => all.findIndex((c) => c.field === card.field) === i)
    .slice(0, STORY_LENGTH);

  const stories: Story[] = [
    { id: 'daily', label: 'Daily 5', emoji: '✨', gradient: ['#f59e0b', '#db2777'], cards: daily },
  ];
  for (const field of FIELDS) {
    const cards = pick(
      library.filter((c) => c.field === field.id),
      seen,
      rng,
      STORY_LENGTH,
    );
    if (cards.length) {
      stories.push({ id: field.id, label: field.name, emoji: field.emoji, gradient: field.gradient, cards });
    }
  }
  return stories;
}

/** How long a story frame stays up: long enough to read it, within sensible bounds. */
export function frameDuration(card: KnowledgeCard): number {
  const words = `${card.title} ${card.body}`.split(/\s+/).length;
  return Math.min(22_000, Math.max(7_000, words * 260));
}
