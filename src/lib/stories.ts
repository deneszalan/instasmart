import type { KnowledgeCard } from '../types';
import { FIELDS } from '../data/fields';
import { createRng, shuffle, spreadByField } from './feed';
import { firstInteractive } from './interactive';
import { firstVideo } from './visual';
import { t } from '../i18n';

export interface Story {
  id: string;
  label: string;
  emoji: string;
  gradient: [string, string];
  cards: KnowledgeCard[];
  /** Frames show each card's interactive slide instead of its text, and wait for the reader. */
  interactive?: boolean;
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

/**
 * A "Daily 5" mix across fields, a "Daily quiz" of interactive slides, then one story per field
 * that leads with the field's video posts, like Shorts. Changes every day. `played` holds the ids of posts whose challenge the reader has already tried.
 */
export function buildStories(
  library: readonly KnowledgeCard[],
  seen: ReadonlySet<string>,
  day: string,
  played: ReadonlySet<string> = new Set(),
): Story[] {
  const rng = createRng(daySeed(day));

  const daily = spreadByField(pick(library, seen, rng, STORY_LENGTH * 4), rng)
    .filter((card, i, all) => all.findIndex((c) => c.field === card.field) === i)
    .slice(0, STORY_LENGTH);

  const stories: Story[] = [
    { id: 'daily', label: t('Daily 5'), emoji: '✨', gradient: ['#f59e0b', '#db2777'], cards: daily },
  ];

  // One challenge per field, from posts the reader hasn't played; played ones only fill gaps.
  const withChallenges = library.filter((c) => firstInteractive(c) >= 0);
  const onePerField = (cards: KnowledgeCard[], count: number) =>
    spreadByField(shuffle(cards, rng), rng)
      .filter((card, i, all) => all.findIndex((c) => c.field === card.field) === i)
      .slice(0, count);
  let quiz = onePerField(withChallenges.filter((c) => !played.has(c.id)), STORY_LENGTH);
  if (quiz.length < STORY_LENGTH) {
    const taken = new Set(quiz.map((c) => c.field));
    const rest = withChallenges.filter((c) => played.has(c.id) && !taken.has(c.field));
    quiz = quiz.concat(onePerField(rest, STORY_LENGTH - quiz.length));
  }
  if (quiz.length) {
    stories.push({ id: 'quiz', label: t('Daily quiz'), emoji: '🎯', gradient: ['#0ea5e9', '#6366f1'], cards: quiz, interactive: true });
  }
  for (const field of FIELDS) {
    const inField = library.filter((c) => c.field === field.id);
    const videos = pick(inField.filter((c) => firstVideo(c) >= 0), seen, rng, STORY_LENGTH);
    const cards = videos.concat(pick(inField.filter((c) => !videos.includes(c)), seen, rng, STORY_LENGTH - videos.length));
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
