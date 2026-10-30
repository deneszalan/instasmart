import { EDITION } from '../edition';
import { LANG } from '../i18n';

// Which posts are saved on this device for use without internet, and whether the reader has switched to offline mode
// (only those posts show). Read once at start, like the language: changing offline mode reloads the app.

const KEY = `${EDITION.storageKey}:offline`;

export interface OfflineRecord {
  /** Ids of the posts whose pictures and clips are all saved, per language (clips differ by language). */
  posts: Partial<Record<string, string[]>>;
  /** Offline mode: show only the saved posts. */
  only: boolean;
}

export function readOffline(): OfflineRecord {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<OfflineRecord>) : {};
    return { posts: parsed.posts ?? {}, only: parsed.only === true };
  } catch {
    return { posts: {}, only: false };
  }
}

export function writeOffline(record: OfflineRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Private mode or full storage: offline mode just can't be remembered.
  }
}

/** The posts saved on this device in the reader's language. */
export const SAVED_IDS: ReadonlySet<string> = new Set(EDITION.offline ? (readOffline().posts[LANG] ?? []) : []);

/** Offline mode is on and something is saved: the app shows only the saved posts. */
export const OFFLINE_ONLY = !!EDITION.offline && readOffline().only && SAVED_IDS.size > 0;
