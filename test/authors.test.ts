import { describe, expect, it } from 'vitest';
import type { KnowledgeCard } from '../src/types';
import { authorFilters, authorGroup, badgeLabel } from '../src/lib/authors';
import { parseHash, toHash } from '../src/lib/route';

const card = (author?: KnowledgeCard['author']): KnowledgeCard => ({
  id: 'space-test',
  field: 'space',
  title: 'A test post',
  emoji: '🪐',
  body: 'Body text that is long enough for the schema, explaining something about space.',
  tags: ['test'],
  source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Space' },
  author,
});

describe('authorGroup', () => {
  it.each([
    [{ name: 'ChatGPT', kind: 'ai' as const }, 'chatgpt'],
    [{ name: 'chatgpt', kind: 'ai' as const }, 'chatgpt'],
    [{ name: 'Chat-GPT', kind: 'ai' as const }, 'chatgpt'],
    [{ name: 'OpenAI', kind: 'ai' as const, model: 'GPT-5' }, 'chatgpt'],
    [{ name: 'Claude', kind: 'ai' as const }, 'claude'],
    [{ name: 'Anthropic', kind: 'ai' as const, model: 'Claude Opus' }, 'claude'],
    [{ name: 'Gemini', kind: 'ai' as const }, 'ai'],
    [{ name: 'Ada Lovelace', kind: 'human' as const }, 'people'],
  ])('%o → %s', (author, id) => {
    expect(authorGroup(card(author))?.id).toBe(id);
  });

  it('gives unsigned posts no group', () => {
    expect(authorGroup(card())).toBeNull();
  });
});

describe('badgeLabel', () => {
  it('names known AI writers, says "AI" for others and shows nothing for people', () => {
    expect(badgeLabel(authorGroup(card({ name: 'ChatGPT', kind: 'ai' }))!)).toBe('ChatGPT');
    expect(badgeLabel(authorGroup(card({ name: 'Claude', kind: 'ai' }))!)).toBe('Claude');
    expect(badgeLabel(authorGroup(card({ name: 'Gemini', kind: 'ai' }))!)).toBe('AI');
    expect(badgeLabel(authorGroup(card({ name: 'Ada', kind: 'human' }))!)).toBeNull();
  });
});

describe('authorFilters', () => {
  it('always offers Claude and ChatGPT, and other groups only when present', () => {
    expect(authorFilters([card({ name: 'Claude', kind: 'ai' })])).toEqual([
      { id: 'claude', label: 'Claude', count: 1 },
      { id: 'chatgpt', label: 'ChatGPT', count: 0 },
    ]);
    const mixed = authorFilters([
      card({ name: 'ChatGPT', kind: 'ai' }),
      card({ name: 'ChatGPT', kind: 'ai' }),
      card({ name: 'Gemini', kind: 'ai' }),
      card({ name: 'Ada', kind: 'human' }),
    ]);
    expect(mixed.map((f) => [f.id, f.count])).toEqual([
      ['claude', 0],
      ['chatgpt', 2],
      ['ai', 1],
      ['people', 1],
    ]);
  });
});

describe('route', () => {
  it('round-trips the Written by filter', () => {
    const route = parseHash('#/explore?q=%23space&by=chatgpt');
    expect(route).toEqual({ tab: 'explore', q: '#space', post: null, by: 'chatgpt' });
    expect(toHash(route)).toBe('#/explore?q=%23space&by=chatgpt');
    expect(parseHash('#/p/space-test').by).toBe('');
  });
});
