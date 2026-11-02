import { readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fr } from '../src/i18n/fr';

const src = join(__dirname, '..', 'src');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(join(dir, e.name)) : /\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts') ? [join(dir, e.name)] : [],
  );
}

/** Every text passed to t(): the string literals in its first argument (both sides of a ?: too). */
function keysUsed(code: string): string[] {
  const keys: string[] = [];
  for (const call of code.matchAll(/(?<![\w.])t\(/g)) {
    // Read the first argument, stepping over string literals so their commas and brackets don't count.
    let depth = 0;
    let arg = '';
    for (let i = call.index + 2; i < code.length; i++) {
      const c = code[i];
      if (c === "'") {
        const end = code.indexOf("'", i + 1);
        arg += code.slice(i, end + 1);
        i = end;
        continue;
      }
      if (c === '(' || c === '{') depth++;
      if (c === ')' || c === '}') depth--;
      if (depth < 0 || (depth === 0 && c === ',')) break;
      arg += c;
    }
    // A string compared with === is a condition, not a text.
    for (const m of arg.matchAll(/'([^']*)'/g)) if (!/[=!]==$/.test(arg.slice(0, m.index).trimEnd())) keys.push(m[1]);
  }
  return keys;
}

describe('French text', () => {
  const under = (dir: string) => (f: string) => f.startsWith(join(src, dir) + sep);
  // The translation tables themselves are not callers of t().
  const files = sourceFiles(src).filter((f) => !under('i18n')(f));
  const keysIn = (list: string[]) => new Set(list.flatMap((f) => keysUsed(readFileSync(f, 'utf8'))));
  const app = keysIn(files.filter((f) => !under('labs')(f)));
  // Lab texts may be translated later, so an entry counts as used if anything in src passes it to t().
  const anywhere = keysIn(files);

  it('has a translation for every text the app outside the labs passes to t()', () => {
    expect(app.size).toBeGreaterThan(0);
    expect([...app].filter((k) => !(k in fr))).toEqual([]);
  });

  it('has no translations that nothing uses', () => {
    expect(Object.keys(fr).filter((k) => !anywhere.has(k))).toEqual([]);
  });

  it('keeps every {placeholder}', () => {
    const holes = (s: string) => [...s.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();
    expect(Object.entries(fr).filter(([en, text]) => holes(en).join() !== holes(text).join())).toEqual([]);
  });
});
