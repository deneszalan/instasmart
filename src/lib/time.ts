import type { KnowledgeCard } from '../types';
import { EDITION } from '../edition';

const LOCALE = EDITION.lang === 'de' ? 'de-DE' : undefined;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** When a post was published, in ms. A bare day counts as noon UTC; a post without a date sorts as the oldest. */
export function publishedAt(card: Pick<KnowledgeCard, 'createdAt'>): number {
  const stamp = card.createdAt;
  if (!stamp) return 0;
  return Date.parse(stamp.length === 10 ? `${stamp}T12:00:00Z` : stamp);
}

/** "October 27, 2026 at 1:09 AM" in the reader's time zone, or just the date for a post that only has a day. */
export function formatStamp(stamp: string): string {
  const date = new Date(publishedAt({ createdAt: stamp }));
  return stamp.length === 10
    ? date.toLocaleDateString(LOCALE, { dateStyle: 'long', timeZone: 'UTC' })
    : date.toLocaleString(LOCALE, { dateStyle: 'long', timeStyle: 'short' });
}

/** "now", "5 minutes ago", "yesterday", "3 days ago"; after a week, the date ("Oct 12", with the year if it isn't this one). */
export function timeAgo(stamp: string, now = Date.now()): string {
  const at = publishedAt({ createdAt: stamp });
  const ago = Math.max(0, now - at);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  if (stamp.length > 10) {
    if (ago < MINUTE) return rtf.format(0, 'second');
    if (ago < HOUR) return rtf.format(-Math.floor(ago / MINUTE), 'minute');
    if (ago < DAY) return rtf.format(-Math.floor(ago / HOUR), 'hour');
  }
  if (ago < 7 * DAY) return rtf.format(-Math.floor(ago / DAY), 'day');
  const sameYear = new Date(at).getFullYear() === new Date(now).getFullYear();
  return new Date(at).toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}
