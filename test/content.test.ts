import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EDITION_IDS, EDITIONS, type Edition } from '../shared/editions.ts';
import { readContentFiles } from '../scripts/disk.ts';
import { validateContent } from '../shared/validate.ts';
import { schemaText, SCHEMA_PATH } from '../scripts/content.ts';
import { clipSeconds, LIBRARY } from '../src/data/library';

const root = join(__dirname, '..');

const content = Object.fromEntries(
  EDITION_IDS.map((id) => [id, validateContent(readContentFiles(join(root, EDITIONS[id].dir)), EDITIONS[id].fields)]),
);

describe('every edition', () => {
  for (const id of EDITION_IDS) {
    const { posts, problems } = content[id];
    const edition = EDITIONS[id];

    it(`${edition.name} passes validation (run \`npm run content\` for details)`, () => {
      expect(problems.map((p) => `${p.file}: ${p.message}`)).toEqual([]);
    });

    it(`${edition.name} has posts in each of its fields`, () => {
      // Reckon is the big library; a new edition may start small.
      const least = id === 'reckon' ? 8 : 1;
      for (const f of edition.fields) expect(posts.filter((p) => p.field === f).length, f).toBeGreaterThanOrEqual(least);
    });
  }

  it('gives every Reckon animation post a hands-on lab, each lab used once', () => {
    const animated = content.reckon.posts.filter((p) => p.slides.some((s) => s.type === 'video' && s.animation));
    expect(animated.filter((p) => !p.slides.some((s) => s.type === 'explore')).map((p) => p.id)).toEqual([]);
    const labs = content.reckon.posts.flatMap((p) => p.slides.flatMap((s) => (s.type === 'explore' ? [s.lab] : [])));
    expect(new Set(labs).size).toBe(labs.length);
  });

  it('lists only its own posts, each once, in a set order', () => {
    for (const id of EDITION_IDS) {
      const edition: Edition = EDITIONS[id];
      const order = edition.order ?? [];
      const ids = new Set(content[id].posts.map((p) => p.id));
      expect(order.filter((p) => !ids.has(p)), id).toEqual([]);
      expect(new Set(order).size, id).toBe(order.length);
    }
  });

  it('keeps post ids unique across editions, as explainers/ is shared', () => {
    const ids = EDITION_IDS.flatMap((id) => content[id].posts.map((p) => p.id));
    expect(ids.length).toBe(new Set(ids).size);
  });
});

describe('content/', () => {
  // Tests run in Vite's test mode, which builds Reckon.
  const { posts } = content.reckon;

  it('is what the app loads', () => {
    expect(LIBRARY.map((c) => c.id).sort()).toEqual(posts.map((p) => p.id).sort());
  });

  it('knows every clip\'s length before it loads', () => {
    const clips = LIBRARY.flatMap((c) => c.slides ?? []).filter((s) => s.type === 'video');
    expect(clips.length).toBeGreaterThan(200);
    for (const clip of clips) expect(clipSeconds(clip.src), clip.src).toBeGreaterThanOrEqual(2);
  });

  it('has an up-to-date JSON Schema (run `npm run content -- schema`)', () => {
    expect(readFileSync(join(root, SCHEMA_PATH), 'utf8')).toBe(schemaText());
  });
});
