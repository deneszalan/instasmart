import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalog, covers } from '../scripts/fonts.ts';

const dir = join(__dirname, '..', 'explainers', 'fonts');

describe('explainer fonts', () => {
  const { catalog, readme } = buildCatalog();

  it('catalog.json and README.md are up to date (npm run fonts)', () => {
    expect(readFileSync(join(dir, 'catalog.json'), 'utf8')).toBe(`${JSON.stringify(catalog, null, 1)}\n`);
    expect(readFileSync(join(dir, 'README.md'), 'utf8')).toBe(readme);
  });

  it('every font file is complete enough for European languages, or says it is not', () => {
    for (const [name, family] of Object.entries(catalog)) {
      const wide = family.scripts.includes('Central European (ő ć ł ž)');
      if (!wide && !family.fallback) expect(family.about, `${name} lacks Central European letters: say so in families.json`).toMatch(/letters only/);
    }
  });

  it('the fallback fonts cover the symbols scenes use', () => {
    const fallback = Object.values(catalog).filter((f) => f.fallback).flatMap((f) => f.files.map((x) => covers(x.covers)));
    for (const ch of '→←↑≈≤≥π√Σ₁₂²✓▶◀ɛɔʊʰ') expect(fallback.some((has) => has(ch.codePointAt(0)!)), ch).toBe(true);
  });
});
