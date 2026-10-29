import { describe, expect, it } from 'vitest';
import type { FieldId, KnowledgeCard } from '../src/types';
import { createRng, endlessFeed, searchCards, sortCards, sortNews, spreadByField, take } from '../src/lib/feed';
import { formatNewsDate, formatStamp, newsAt, publishedAt, timeAgo } from '../src/lib/time';

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

  it('opens with the given cards in order, read or not', () => {
    const first = [CARDS[5].id, CARDS[0].id, 'no-such-post', CARDS[9].id];
    const seen = new Set([CARDS[0].id, CARDS[1].id]);
    const entries = take(endlessFeed(CARDS, { seed: 4, seen, first }), CARDS.length + 1);
    const ids = entries.flatMap((e) => (e.type === 'card' ? [e.card.id] : []));

    expect(ids.slice(0, 3)).toEqual([CARDS[5].id, CARDS[0].id, CARDS[9].id]);
    expect(new Set(ids).size).toBe(CARDS.length);
    expect(ids.at(-1)).toBe(CARDS[1].id);
  });

  it('opens every round with the given cards, so a fully listed library repeats in the same order', () => {
    const first = CARDS.map((c) => c.id).reverse();
    const entries = take(endlessFeed(CARDS, { seed: 5, first }), (CARDS.length + 1) * 3);
    for (const round of [1, 2, 3]) {
      const ids = entries.flatMap((e) => (e.type === 'card' && e.round === round ? [e.card.id] : []));
      expect(ids).toEqual(first);
    }
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

describe('sortCards', () => {
  const dated = [
    card('physics', 1, { createdAt: '2026-10-19T01:09:57Z' }),
    card('history', 1, { createdAt: '2026-10-27T06:00:00Z' }),
    card('art', 1, { createdAt: '2026-10-19T01:09:57Z' }),
    card('music', 1),
    card('music', 2, { createdAt: '2026-10-20' }),
  ];
  it('puts the newest first, breaking ties by id, and undated posts last', () => {
    expect(sortCards(dated, 'newest').map((c) => c.id)).toEqual(['history-1', 'music-2', 'art-1', 'physics-1', 'music-1']);
  });
  it('reverses for oldest first', () => {
    expect(sortCards(dated, 'oldest').map((c) => c.id)).toEqual(['music-1', 'art-1', 'physics-1', 'music-2', 'history-1']);
  });
  it('leaves the input alone', () => {
    const ids = dated.map((c) => c.id);
    sortCards(dated, 'newest');
    expect(dated.map((c) => c.id)).toEqual(ids);
  });
  it('gives a sorted feed the same order every round', () => {
    const first = sortCards(dated, 'newest').map((c) => c.id);
    const entries = take(endlessFeed(dated, { seed: 3, first }), 12);
    const ids = entries.map((e) => (e.type === 'card' ? e.card.id : '|'));
    expect(ids).toEqual([...first, '|', ...first, '|']);
  });
});

describe('news', () => {
  const posts = [
    card('politics', 1, { news: '2026-10-25', createdAt: '2026-10-26' }),
    card('physics', 1),
    card('space', 1, { news: '2026-10', createdAt: '2026-10-27' }),
    card('politics', 2, { news: '2026-11-03', createdAt: '2026-10-26' }),
    card('earth', 1, { news: '2026-10-25', createdAt: '2026-10-29' }),
  ];
  it('lists only news posts, the latest event first, then the newest post', () => {
    expect(sortNews(posts, 'newest').map((c) => c.id)).toEqual(['politics-2', 'earth-1', 'politics-1', 'space-1']);
  });
  it('reverses for the earliest event first', () => {
    expect(sortNews(posts, 'oldest').map((c) => c.id)).toEqual(['space-1', 'politics-1', 'earth-1', 'politics-2']);
  });
  it('mixes them by field, like the feed', () => {
    const mixed = sortNews(posts, 'mix', createRng(7)).map((c) => c.id);
    expect(mixed.slice().sort()).toEqual(['earth-1', 'politics-1', 'politics-2', 'space-1']);
    expect(mixed.some((id, i) => i > 0 && id.split('-')[0] === mixed[i - 1].split('-')[0])).toBe(false);
  });
  it('counts a month-only date from its first day', () => {
    expect(newsAt('2026-10')).toBe(Date.parse('2026-10-01T12:00:00Z'));
  });
  it('writes the day, or only the month', () => {
    expect(formatNewsDate('2026-10-25')).toBe('October 25, 2026');
    expect(formatNewsDate('2026-10')).toBe('October 2026');
  });
});

describe('post times', () => {
  const now = Date.parse('2026-10-27T12:00:00Z');
  it('reads a timestamp, and a bare day as noon UTC', () => {
    expect(publishedAt({ createdAt: '2026-10-27T06:30:00Z' })).toBe(Date.parse('2026-10-27T06:30:00Z'));
    expect(publishedAt({ createdAt: '2026-10-20' })).toBe(Date.parse('2026-10-20T12:00:00Z'));
    expect(publishedAt({})).toBe(0);
  });
  it('says how long ago, then the date after a week', () => {
    expect(timeAgo('2026-10-27T11:59:30Z', now)).toBe('now');
    expect(timeAgo('2026-10-27T11:15:00Z', now)).toBe('45 minutes ago');
    expect(timeAgo('2026-10-27T06:00:00Z', now)).toBe('6 hours ago');
    expect(timeAgo('2026-10-26T06:00:00Z', now)).toBe('yesterday');
    expect(timeAgo('2026-10-22T06:00:00Z', now)).toBe('5 days ago');
    expect(timeAgo('2026-10-27', now)).toBe('today');
    expect(timeAgo('2026-10-12T06:00:00Z', now)).toBe('Oct 12');
    expect(timeAgo('2025-10-12T06:00:00Z', now)).toBe('Oct 12, 2025');
  });
  it('writes the full date and time, or just the date', () => {
    expect(formatStamp('2026-10-20')).toBe('October 20, 2026');
    expect(formatStamp('2026-10-27T06:30:00Z')).toMatch(/^October 2[67], 2026 at \d{1,2}:\d{2}/);
  });
});
