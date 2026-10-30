import type { KnowledgeCard } from '../types';
import { ALL_CARDS, mediaBytes } from '../data/library';
import { readOffline, writeOffline } from '../data/offline-set';
import { sortCards } from './feed';
import { LANG } from '../i18n';
import { EDITION } from '../edition';

/** This app can be saved for use without internet (`offline` in shared/editions.ts), and the browser can do it. */
export const OFFLINE = !!EDITION.offline && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined';

/** The cache the offline worker (src/offline-worker.js) serves saved pictures and clips from; the apps share the site. */
const CACHE = `${EDITION.id}:media`;

/** Roma's first offline version kept its files in a cache just called "media": move them, so nothing is downloaded twice. */
async function moveOldCache(): Promise<void> {
  if (EDITION.id !== 'roma' || !(await caches.has('media'))) return;
  const from = await caches.open('media');
  const to = await caches.open(CACHE);
  for (const request of await from.keys()) {
    const response = await from.match(request);
    if (response) await to.put(request, response);
  }
  await caches.delete('media');
}

/** Installs the offline worker, which keeps the app itself. Only the built app has one (sw.js). */
export function registerOffline(): void {
  if (!OFFLINE || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Without the worker the app still works online; Settings then can't promise it offline.
    });
  });
}

export interface OfflineFile {
  /** Absolute URL, as the cache keeps it. */
  url: string;
  bytes: number;
}

/** A post's pictures and clips in the reader's language: the app's own files, not ones on other sites. */
export function postFiles(card: KnowledgeCard, base = location.href): OfflineFile[] {
  const srcs = new Set<string>();
  if (card.cover) srcs.add(card.cover.src);
  for (const s of card.slides ?? []) {
    if (s.type === 'image' || s.type === 'comic') srcs.add(s.src);
    if (s.type === 'video') {
      srcs.add(s.src);
      srcs.add(s.poster);
    }
  }
  const origin = new URL(base).origin;
  return [...srcs]
    .map((src) => ({ url: new URL(src, base).href, bytes: mediaBytes(src) ?? 0 }))
    .filter((f) => new URL(f.url).origin === origin);
}

/** The files of these posts, each once (posts can share a picture). */
export function filesOf(cards: readonly KnowledgeCard[], base = location.href): OfflineFile[] {
  const files = new Map<string, OfflineFile>();
  for (const card of cards) for (const f of postFiles(card, base)) files.set(f.url, f);
  return [...files.values()];
}

/** Bytes to download for these posts. */
export const bytesOf = (cards: readonly KnowledgeCard[], base = location.href) => filesOf(cards, base).reduce((n, f) => n + f.bytes, 0);

/** The posts a reader who keeps `count` saves: the newest first, as the app sorts them. */
export function newest(count: number, cards: readonly KnowledgeCard[] = ALL_CARDS): KnowledgeCard[] {
  return sortCards(cards, 'newest').slice(0, count);
}

async function savedUrls(): Promise<Set<string>> {
  await moveOldCache();
  const cache = await caches.open(CACHE);
  return new Set((await cache.keys()).map((r) => r.url));
}

/**
 * The posts the reader saved, in this language, whose files are all still on the device (a browser may clear some
 * when space runs low); the record offline mode reads is corrected to match.
 */
export async function savedPosts(cards: readonly KnowledgeCard[] = ALL_CARDS): Promise<KnowledgeCard[]> {
  const saved = await savedUrls();
  const record = readOffline();
  const ids = new Set(record.posts[LANG] ?? []);
  const done = cards.filter((c) => ids.has(c.id) && postFiles(c).every((f) => saved.has(f.url)));
  if (done.length !== ids.size) writeOffline({ ...record, posts: { ...record.posts, [LANG]: done.map((c) => c.id) } });
  return done;
}

/** The offline worker is running, so the app itself opens without internet. */
export async function appReady(): Promise<boolean> {
  if (!OFFLINE) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  return !!registration?.active;
}

export interface Progress {
  done: number;
  total: number;
}

/**
 * Keeps exactly these posts on the device: downloads what's missing, one file after another (reporting bytes), then
 * removes the files of other posts no longer chosen. Throws when a file can't be fetched or the device is full; what
 * was saved stays, so trying again carries on.
 */
export async function keepOffline(chosen: readonly KnowledgeCard[], onProgress: (p: Progress) => void, signal?: AbortSignal): Promise<void> {
  // Ask the browser not to clear the saved posts when space runs low; it may say no.
  await navigator.storage?.persist?.().catch(() => false);
  const cache = await caches.open(CACHE);
  const saved = await savedUrls();
  const files = filesOf(chosen);
  const total = files.reduce((n, f) => n + f.bytes, 0);
  let done = files.filter((f) => saved.has(f.url)).reduce((n, f) => n + f.bytes, 0);
  onProgress({ done, total });
  for (const file of files) {
    if (saved.has(file.url)) continue;
    signal?.throwIfAborted();
    const response = await fetch(file.url, { signal });
    if (!response.ok) throw new Error(`${response.status}`);
    await cache.put(file.url, response);
    done += file.bytes;
    onProgress({ done, total });
  }
  // Free the space of posts no longer chosen (in this language; another language's clips stay).
  const keep = new Set(files.map((f) => f.url));
  const chosenIds = new Set(chosen.map((c) => c.id));
  for (const f of filesOf(ALL_CARDS.filter((c) => !chosenIds.has(c.id)))) {
    if (!keep.has(f.url) && saved.has(f.url)) await cache.delete(f.url);
  }
  if (OFFLINE && import.meta.env.PROD) await navigator.serviceWorker.ready;
  const record = readOffline();
  writeOffline({ ...record, posts: { ...record.posts, [LANG]: chosen.map((c) => c.id) } });
}

/** Deletes every saved picture and clip and turns offline mode off (the app itself stays, it is small). */
export async function removeOffline(): Promise<void> {
  await caches.delete(CACHE);
  writeOffline({ posts: {}, only: false });
}

/** Switches offline mode on or off. The app reloads to show only the saved posts, or all of them again. */
export function setOfflineOnly(only: boolean): void {
  writeOffline({ ...readOffline(), only });
  location.reload();
}
