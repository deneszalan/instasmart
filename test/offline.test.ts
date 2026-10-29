import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { offlineFiles, status } from '../src/lib/offline';
import type { KnowledgeCard } from '../src/types';

/** The offline worker as the build writes it, run in a bare context to reach its functions. */
function worker(): { parseRange: (header: string, size: number) => { start: number; end: number } | null; SHELL: string[] } {
  const source = readFileSync(new URL('../src/offline-worker.js', import.meta.url), 'utf8')
    .replace("'__VERSION__'", '"test"')
    .replace('__SHELL__', '["./", "index.html"]');
  const context: Record<string, unknown> = { self: { addEventListener: () => {} } };
  runInNewContext(`${source}\nthis.parseRange = parseRange; this.SHELL = SHELL;`, context);
  return context as never;
}

describe('the offline worker', () => {
  const { parseRange, SHELL } = worker();
  it('gets the app files the build fills in', () => {
    expect(SHELL).toEqual(['./', 'index.html']);
  });
  it('serves the byte ranges a video player asks for', () => {
    expect(parseRange('bytes=0-', 1000)).toEqual({ start: 0, end: 999 });
    expect(parseRange('bytes=0-1', 1000)).toEqual({ start: 0, end: 1 });
    expect(parseRange('bytes=500-1999', 1000)).toEqual({ start: 500, end: 999 });
    expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
  });
  it('refuses ranges it cannot serve', () => {
    expect(parseRange('bytes=1000-', 1000)).toBeNull();
    expect(parseRange('bytes=-', 1000)).toBeNull();
    expect(parseRange('bytes=0-10,20-30', 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
  });
});

describe('saving for offline', () => {
  const card = (id: string, slides: unknown[], cover?: string) =>
    ({ id, field: 'history', title: id, slides, ...(cover ? { cover: { src: cover, alt: 'x' } } : {}) }) as unknown as KnowledgeCard;
  const base = 'https://example.org/roma/';
  const cards = [
    card('history-a', [{ type: 'video', src: 'https://example.org/roma/assets/a.mp4', poster: 'https://example.org/roma/assets/a.jpg' }, { type: 'quiz' }]),
    card('history-b', [{ type: 'image', src: './assets/b.jpg' }, { type: 'video', src: './assets/b.mp4', poster: 'https://example.org/roma/assets/a.jpg' }], 'https://upload.wikimedia.org/c.jpg'),
  ];
  it('lists each picture and clip once, and only the app’s own', () => {
    expect(offlineFiles(cards, base).map((f) => f.url)).toEqual([
      'https://example.org/roma/assets/a.mp4',
      'https://example.org/roma/assets/a.jpg',
      'https://example.org/roma/assets/b.jpg',
      'https://example.org/roma/assets/b.mp4',
    ]);
  });
  it('counts what is saved', () => {
    const files = [
      { url: 'a', bytes: 100 },
      { url: 'b', bytes: 50 },
    ];
    expect(status(files, new Set(['b']), true)).toEqual({ saved: 1, total: 2, savedBytes: 50, totalBytes: 150, app: true });
  });
});
