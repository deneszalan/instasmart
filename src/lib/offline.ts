import type { KnowledgeCard } from '../types';
import { LIBRARY, mediaBytes } from '../data/library';
import { EDITION } from '../edition';

/** This app can be saved for use without internet (`offline` in shared/editions.ts), and the browser can do it. */
export const OFFLINE = !!EDITION.offline && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined';

/** The cache the offline worker (src/offline-worker.js) serves saved pictures and clips from. */
const CACHE = 'media';

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

/** Every picture and clip of these posts in the reader's language: the app's own files, not ones on other sites. */
export function offlineFiles(cards: readonly KnowledgeCard[] = LIBRARY, base = location.href): OfflineFile[] {
  const srcs = new Set<string>();
  for (const card of cards) {
    if (card.cover) srcs.add(card.cover.src);
    for (const s of card.slides ?? []) {
      if (s.type === 'image' || s.type === 'comic') srcs.add(s.src);
      if (s.type === 'video') {
        srcs.add(s.src);
        srcs.add(s.poster);
      }
    }
  }
  const origin = new URL(base).origin;
  return [...srcs]
    .map((src) => ({ url: new URL(src, base).href, bytes: mediaBytes(src) ?? 0 }))
    .filter((f) => new URL(f.url).origin === origin);
}

export interface OfflineStatus {
  saved: number;
  total: number;
  savedBytes: number;
  totalBytes: number;
  /** The offline worker is running, so the app itself opens without internet. */
  app: boolean;
}

export function status(files: readonly OfflineFile[], saved: ReadonlySet<string>, app: boolean): OfflineStatus {
  const done = files.filter((f) => saved.has(f.url));
  return {
    saved: done.length,
    total: files.length,
    savedBytes: done.reduce((n, f) => n + f.bytes, 0),
    totalBytes: files.reduce((n, f) => n + f.bytes, 0),
    app,
  };
}

async function savedUrls(): Promise<Set<string>> {
  const cache = await caches.open(CACHE);
  return new Set((await cache.keys()).map((r) => r.url));
}

async function appReady(): Promise<boolean> {
  const registration = await navigator.serviceWorker.getRegistration();
  return !!registration?.active;
}

/** How much of these files is saved on this device. */
export async function offlineStatus(files: readonly OfflineFile[]): Promise<OfflineStatus> {
  return status(files, await savedUrls(), await appReady());
}

/**
 * Saves the files not saved yet, one after another, and reports after each. Throws when one can't be fetched or the
 * device is out of space; what was saved stays, so trying again carries on.
 */
export async function saveOffline(files: readonly OfflineFile[], onProgress: (s: OfflineStatus) => void, signal?: AbortSignal): Promise<OfflineStatus> {
  // Ask the browser not to clear the saved copy when space runs low; it may say no.
  await navigator.storage?.persist?.().catch(() => false);
  const cache = await caches.open(CACHE);
  const saved = await savedUrls();
  for (const file of files) {
    if (saved.has(file.url)) continue;
    signal?.throwIfAborted();
    const response = await fetch(file.url, { signal });
    if (!response.ok) throw new Error(`${response.status}`);
    await cache.put(file.url, response);
    saved.add(file.url);
    onProgress(status(files, saved, false));
  }
  // The app is kept by the worker; once it is active everything needed offline is on the device.
  if (OFFLINE && import.meta.env.PROD) await navigator.serviceWorker.ready;
  return status(files, saved, await appReady());
}

/** Deletes the saved pictures and clips (the app itself stays, it is small). */
export async function removeOffline(): Promise<void> {
  await caches.delete(CACHE);
}
