import { describe, expect, it } from 'vitest';
import type { KnowledgeCard } from '../src/types';
import { buildStories } from '../src/lib/stories';
import { firstInteractive } from '../src/lib/interactive';

const card = (field: KnowledgeCard['field'], n: number, quiz = false): KnowledgeCard => ({
  id: `${field}-${n}`,
  field,
  title: `Title ${field} ${n}`,
  emoji: '✨',
  body: 'A body long enough to pass validation, which is not checked here anyway.',
  slides: quiz
    ? [{ type: 'quiz', question: 'Why?', options: ['A', 'B'], answer: 0, explanation: 'Because.' }]
    : [{ type: 'text', text: 'Plain.' }],
  tags: [field],
  source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Example' },
});

const library = [
  card('physics', 1, true), card('physics', 2), card('space', 1, true), card('space', 2, true),
  card('art', 1, true), card('music', 1), card('history', 1, true), card('math', 1, true),
];

describe('buildStories', () => {
  it('adds a Daily quiz of interactive posts, one per field, unplayed first', () => {
    const stories = buildStories(library, new Set(), '2026-10-18', new Set(['space-1', 'space-2']));
    const quiz = stories.find((s) => s.id === 'quiz')!;
    expect(quiz.interactive).toBe(true);
    expect(quiz.cards.every((c) => firstInteractive(c) >= 0)).toBe(true);
    expect(new Set(quiz.cards.map((c) => c.field)).size).toBe(quiz.cards.length);
    // Four fields have unplayed challenges, so the played space posts come last if at all.
    const ids = quiz.cards.map((c) => c.id);
    expect(ids.slice(0, 4).every((id) => !id.startsWith('space'))).toBe(true);
  });

  it('skips the quiz story when nothing is interactive', () => {
    const stories = buildStories([card('physics', 1), card('art', 1)], new Set(), '2026-10-18');
    expect(stories.find((s) => s.id === 'quiz')).toBeUndefined();
  });

  it('is the same for the same day', () => {
    const a = buildStories(library, new Set(), '2026-10-18').map((s) => s.cards.map((c) => c.id));
    const b = buildStories(library, new Set(), '2026-10-18').map((s) => s.cards.map((c) => c.id));
    expect(a).toEqual(b);
  });
});
