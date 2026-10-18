import type { FieldId, KnowledgeCard } from '../types';

/** Small, fast seeded PRNG (mulberry32) so feed order is reproducible in tests. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffle cards so that consecutive cards come from different fields whenever
 * possible. Fields are picked at random, weighted by how many cards they have
 * left, which keeps the mix even across the whole sequence.
 */
export function spreadByField(
  cards: readonly KnowledgeCard[],
  rng: () => number,
  avoidFirst?: FieldId,
): KnowledgeCard[] {
  const groups = new Map<FieldId, KnowledgeCard[]>();
  for (const card of shuffle(cards, rng)) {
    const group = groups.get(card.field);
    if (group) group.push(card);
    else groups.set(card.field, [card]);
  }

  const out: KnowledgeCard[] = [];
  let last = avoidFirst;
  let remaining = cards.length;
  while (groups.size > 0) {
    let candidates = [...groups.keys()].filter((f) => f !== last);
    if (candidates.length === 0) candidates = [...groups.keys()];

    // A field holding more than half of what's left must go now, or it would
    // be forced into back-to-back slots later.
    const limit = Math.ceil((remaining - 1) / 2);
    let chosen = candidates.find((f) => groups.get(f)!.length > limit);
    if (!chosen) {
      const total = candidates.reduce((sum, f) => sum + groups.get(f)!.length, 0);
      let pick = rng() * total;
      chosen = candidates[candidates.length - 1];
      for (const f of candidates) {
        pick -= groups.get(f)!.length;
        if (pick < 0) {
          chosen = f;
          break;
        }
      }
    }

    const group = groups.get(chosen)!;
    out.push(group.pop()!);
    if (group.length === 0) groups.delete(chosen);
    last = chosen;
    remaining--;
  }
  return out;
}

export type FeedEntry =
  | { type: 'card'; card: KnowledgeCard; round: number }
  /** Emitted once the whole library has been shown, before the next round starts. */
  | { type: 'caught-up'; round: number };

/**
 * An endless stream over the library. The first round shows unseen cards
 * before already-seen ones; every later round is a fresh shuffle.
 */
export function* endlessFeed(
  cards: readonly KnowledgeCard[],
  options: { seed: number; seen?: ReadonlySet<string> },
): Generator<FeedEntry, never, void> {
  if (cards.length === 0) throw new Error('endlessFeed needs at least one card');
  const rng = createRng(options.seed);
  const seen = options.seen ?? new Set<string>();

  const unseen = cards.filter((c) => !seen.has(c.id));
  const already = cards.filter((c) => seen.has(c.id));
  let order = spreadByField(unseen, rng);
  order = order.concat(spreadByField(already, rng, order.at(-1)?.field));

  for (let round = 1; ; round++) {
    for (const card of order) yield { type: 'card', card, round };
    yield { type: 'caught-up', round };
    order = spreadByField(cards, rng, order.at(-1)?.field);
  }
}

/** Pull the next `count` entries from a generator. */
export function take<T>(gen: Generator<T, unknown, void>, count: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const next = gen.next();
    if (next.done) break;
    out.push(next.value);
  }
  return out;
}

export function readSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // ~230 words per minute, rounded to the nearest 5 seconds, at least 10s.
  return Math.max(10, Math.round(((words / 230) * 60) / 5) * 5);
}

export function cardText(card: KnowledgeCard): string {
  return [card.title, card.body, ...(card.slides ?? []).flatMap((s) => [s.heading, s.text])].join(' ');
}

/** Case-insensitive search over title, body, slides, tags and field. A leading '#' matches tags only. */
export function searchCards(cards: readonly KnowledgeCard[], query: string): KnowledgeCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards.slice();
  if (q.startsWith('#')) {
    const tag = q.slice(1);
    return cards.filter((c) => c.tags.some((t) => t.toLowerCase() === tag));
  }
  const terms = q.split(/\s+/);
  return cards.filter((c) => {
    const haystack = `${cardText(c)} ${c.tags.join(' ')} ${c.field}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
