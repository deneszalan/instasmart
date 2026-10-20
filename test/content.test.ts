import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIELDS } from '../shared/fields.ts';
import { readContentFiles } from '../scripts/disk.ts';
import { validateContent } from '../shared/validate.ts';
import { schemaText, SCHEMA_PATH } from '../scripts/content.ts';
import { clipSeconds, LIBRARY } from '../src/data/library';

const root = join(__dirname, '..');

describe('content/', () => {
  const files = readContentFiles(root);
  const { posts, problems } = validateContent(files);

  it('passes validation (run `npm run content` for details)', () => {
    expect(problems.map((p) => `${p.file}: ${p.message}`)).toEqual([]);
  });

  it('covers every field', () => {
    for (const f of FIELDS) expect(posts.filter((p) => p.field === f.id).length, f.id).toBeGreaterThanOrEqual(8);
  });

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
