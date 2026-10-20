import type { KnowledgeCard } from '../types';
import { t } from '../i18n';

/** Who wrote a post, grouped for badges and the "Written by" filter. */
export interface AuthorGroup {
  /** Stable id used in links and filters, e.g. "chatgpt". */
  id: string;
  /** Badge and filter label. */
  label: string;
}

/** AI writers with a badge of their own, matched against the post's author name and model. */
const KNOWN_AI: (AuthorGroup & { match: RegExp })[] = [
  { id: 'claude', label: 'Claude', match: /\bclaude\b/i },
  { id: 'chatgpt', label: 'ChatGPT', match: /chat\s*-?\s*gpt|\bgpt-?\d/i },
  { id: 'fable', label: 'Fable', match: /\bfable\b/i },
];

const OTHER_AI: AuthorGroup = { id: 'ai', label: t('Other AI') };
const PEOPLE: AuthorGroup = { id: 'people', label: t('People') };

export function authorGroup(card: KnowledgeCard): AuthorGroup | null {
  const author = card.author;
  if (!author) return null;
  if (author.kind === 'human') return PEOPLE;
  const signature = `${author.name} ${author.model ?? ''}`;
  return KNOWN_AI.find((k) => k.match.test(signature)) ?? OTHER_AI;
}

/** The badge text: a known AI by name, any other AI as plain "AI". People get no badge. */
export function badgeLabel(group: AuthorGroup): string | null {
  if (group.id === PEOPLE.id) return null;
  return group.id === OTHER_AI.id ? t('AI') : group.label;
}

/** Filters to offer: every known AI writer (even before it has posts), then any other group in the library. */
export function authorFilters(cards: readonly KnowledgeCard[]): (AuthorGroup & { count: number })[] {
  const counts = new Map<string, number>();
  for (const card of cards) {
    const group = authorGroup(card);
    if (group) counts.set(group.id, (counts.get(group.id) ?? 0) + 1);
  }
  const others = [OTHER_AI, PEOPLE].filter((g) => counts.has(g.id));
  return [...KNOWN_AI, ...others].map(({ id, label }) => ({ id, label, count: counts.get(id) ?? 0 }));
}
