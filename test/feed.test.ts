import { describe, expect, it } from 'vitest';
import type { FieldId, KnowledgeCard } from '../src/types';
import { createRng, endlessFeed, searchCards, spreadByField, take } from '../src/lib/feed';

function card(field: FieldId, n: number, extra: Partial<KnowledgeCard> = {}): KnowledgeCard {
  return {
    id: `${field}-${n}`,
    field,
    title: `Title ${field} ${n}`,
    emoji: '✨',
    body: `Body about ${field} number ${n}. `.repeat(4),
    tags: [field],
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Example' },
    ...extra,
  };
}

const FIELDS: FieldId[] = ['physics', 'history', 'art', 'music'];
const CARDS = FIELDS.flatMap((f) => [1, 2, 3, 4, 5].map((n) => card(f, n)));

describe('spreadByField', () => {
  it('keeps every card exactly once', () => {
    const out = spreadByField(CARDS, createRng(1));
    expect(out).toHaveLength(CARDS.length);
    expect(new Set(out.map((c) => c.id))).toEqual(new Set(CARDS.map((c) => c.id)));
  });

  it('never puts two cards from the same field next to each other when it can avoid it', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const out = spreadByField(CARDS, createRng(seed));
      for (let i = 1; i < out.length; i++) expect(out[i].field).not.toBe(out[i - 1].field);
    }
  });

  it('handles uneven fields without forced neighbours', () => {
    const uneven = [
      ...[1, 2, 3, 4, 5, 6, 7].map((n) => card('physics', n)),
      ...[1, 2, 3, 4, 5].map((n) => card('history', n)),
      ...[1, 2, 3].map((n) => card('art', n)),
      card('music', 1),
    ];
    for (let seed = 1; seed <= 200; seed++) {
      const out = spreadByField(uneven, createRng(seed));
      for (let i = 1; i < out.length; i++) expect(out[i].field).not.toBe(out[i - 1].field);
    }
  });

  it('honours avoidFirst', () => {
    for (let seed = 1; seed <= 20; seed++) {
      expect(spreadByField(CARDS, createRng(seed), 'physics')[0].field).not.toBe('physics');
    }
  });

  it('is deterministic for a seed', () => {
    const a = spreadByField(CARDS, createRng(7)).map((c) => c.id);
    const b = spreadByField(CARDS, createRng(7)).map((c) => c.id);
    expect(a).toEqual(b);
  });
});

describe('endlessFeed', () => {
  it('shows unseen cards first, then seen ones, then a caught-up marker', () => {
    const seen = new Set(CARDS.slice(0, 8).map((c) => c.id));
    const entries = take(endlessFeed(CARDS, { seed: 3, seen }), CARDS.length + 1);
    const ids = entries.flatMap((e) => (e.type === 'card' ? [e.card.id] : []));

    expect(ids.slice(0, CARDS.length - seen.size).every((id) => !seen.has(id))).toBe(true);
    expect(ids.slice(CARDS.length - seen.size).every((id) => seen.has(id))).toBe(true);
    expect(entries.at(-1)).toEqual({ type: 'caught-up', round: 1 });
  });

  it('keeps going forever with full reshuffled rounds', () => {
    const entries = take(endlessFeed(CARDS, { seed: 9 }), (CARDS.length + 1) * 3);
    const cards = entries.filter((e) => e.type === 'card');
    expect(entries.filter((e) => e.type === 'caught-up')).toHaveLength(3);
    for (const round of [1, 2, 3]) {
      const ids = cards.filter((e) => e.round === round).map((e) => (e.type === 'card' ? e.card.id : ''));
      expect(new Set(ids).size).toBe(CARDS.length);
    }
    // No same-field neighbours, even across round boundaries.
    for (let i = 1; i < cards.length; i++) {
      const [a, b] = [cards[i - 1], cards[i]];
      if (a.type === 'card' && b.type === 'card') expect(b.card.field).not.toBe(a.card.field);
    }
  });
});

describe('searchCards', () => {
  const cards = [
    card('physics', 1, { title: 'Light bends around stars', tags: ['gravity', 'light'] }),
    card('art', 1, { title: 'Ultramarine was worth more than gold', tags: ['color'] }),
  ];

  it('matches every word anywhere in the text', () => {
    expect(searchCards(cards, 'light STARS').map((c) => c.id)).toEqual(['physics-1']);
    expect(searchCards(cards, 'light gold')).toEqual([]);
  });

  it('matches exact tags with #', () => {
    expect(searchCards(cards, '#color').map((c) => c.id)).toEqual(['art-1']);
    expect(searchCards(cards, '#col')).toEqual([]);
  });

  it('returns everything for an empty query', () => {
    expect(searchCards(cards, '  ')).toHaveLength(2);
  });
});
