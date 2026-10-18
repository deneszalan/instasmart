import { describe, expect, it } from 'vitest';
import { FIELDS } from '../data/fields';
import { LIBRARY } from '../data/library';

describe('knowledge library', () => {
  it('has unique ids prefixed with their field', () => {
    const ids = LIBRARY.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of LIBRARY) expect(c.id.startsWith(`${c.field}-`), c.id).toBe(true);
  });

  it('covers every field', () => {
    for (const f of FIELDS) {
      expect(LIBRARY.filter((c) => c.field === f.id).length, f.id).toBeGreaterThanOrEqual(8);
    }
  });

  it.each(LIBRARY.map((c) => [c.id, c] as const))('%s is well-formed', (_, c) => {
    expect(c.title.length).toBeGreaterThan(10);
    expect(c.title.length).toBeLessThanOrEqual(90);
    expect(c.emoji.trim()).not.toBe('');
    expect(c.body.length).toBeGreaterThanOrEqual(120);
    expect(c.body.length).toBeLessThanOrEqual(650);
    expect(c.tags.length).toBeGreaterThanOrEqual(1);
    for (const t of c.tags) expect(t).toMatch(/^[a-z0-9]+$/);
    expect(c.source.url).toMatch(/^https:\/\//);
    expect(c.source.label.trim()).not.toBe('');
    if (c.slides) {
      expect(c.slides.length).toBeGreaterThanOrEqual(1);
      expect(c.slides.length).toBeLessThanOrEqual(5);
      for (const s of c.slides) {
        expect(s.heading.trim()).not.toBe('');
        expect(s.text.length).toBeLessThanOrEqual(220);
      }
    }
  });
});
