import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { bytesOf, filesOf, newest, outdated, postFiles } from '../src/lib/offline';
import type { KnowledgeCard } from '../src/types';

/** The offline worker as the build writes it, run in a bare context to reach its functions. */
function worker(): { parseRange: (header: string, size: number) => { start: number; end: number } | null; SHELL: string[]; APP: string; NESTED: string[] } {
  const source = readFileSync(new URL('../src/offline-worker.js', import.meta.url), 'utf8')
    .replace("'__VERSION__'", '"v1"')
    .replace("'__ID__'", '"reckon"')
    .replace('__SHELL__', '["./", "index.html"]')
    .replace('__NESTED__', '["lesefutter/", "roma/"]');
  const context: Record<string, unknown> = { self: { addEventListener: () => {} } };
  runInNewContext(`${source}\nthis.parseRange = parseRange; this.SHELL = SHELL; this.APP = APP; this.NESTED = NESTED;`, context);
  return context as never;
}

describe('the offline worker', () => {
  const { parseRange, SHELL, APP, NESTED } = worker();
  it('gets the app files, its name and the apps under it from the build', () => {
    expect(SHELL).toEqual(['./', 'index.html']);
    expect(APP).toBe('reckon:app-v1');
    expect(NESTED).toEqual(['lesefutter/', 'roma/']);
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

describe('saving posts for offline', () => {
  const card = (id: string, createdAt: string, slides: unknown[], cover?: string) =>
    ({ id, field: 'history', title: id, createdAt, slides, ...(cover ? { cover: { src: cover, alt: 'x' } } : {}) }) as unknown as KnowledgeCard;
  const base = 'https://example.org/roma/';
  const a = card('history-a', '2026-10-01', [{ type: 'video', src: 'https://example.org/roma/assets/a.mp4', poster: 'https://example.org/roma/assets/a.jpg' }, { type: 'quiz' }]);
  const b = card('history-b', '2026-10-20', [{ type: 'image', src: './assets/b.jpg' }, { type: 'video', src: './assets/b.mp4', poster: 'https://example.org/roma/assets/a.jpg' }], 'https://upload.wikimedia.org/c.jpg');
  const c = card('history-c', '2026-10-10', [{ type: 'text', text: 'x' }]);
  it('lists a post’s pictures and clips, only the app’s own', () => {
    expect(postFiles(b, base).map((f) => f.url)).toEqual([
      'https://example.org/roma/assets/b.jpg',
      'https://example.org/roma/assets/b.mp4',
      'https://example.org/roma/assets/a.jpg',
    ]);
  });
  it('counts a file two posts share once', () => {
    expect(filesOf([a, b], base)).toHaveLength(4);
    expect(bytesOf([a, b], base)).toBe(0); // test files have no known size
  });
  it('finds saved copies no post uses any more, such as a clip a newer version replaced', () => {
    const saved = ['https://example.org/roma/assets/a-OLD.mp4', 'https://example.org/roma/assets/a-NEW.mp4', 'https://example.org/roma/assets/b.jpg'];
    expect(outdated(saved, ['./assets/a-NEW.mp4', 'https://example.org/roma/assets/b.jpg'], base)).toEqual(['https://example.org/roma/assets/a-OLD.mp4']);
  });
  it('keeps the newest posts first', () => {
    expect(newest(2, [a, b, c]).map((p) => p.id)).toEqual(['history-b', 'history-c']);
    expect(newest(5, [a, b, c])).toHaveLength(3);
  });
});
