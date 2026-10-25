// Flag spoken lines that a voice is likely to read badly: node speak-lint.mjs <dir> [...]
// Checks what is spoken (say, else text) for: two numbers meeting across a sentence break ("divided by 2. 253"),
// caption-style colons, symbols and units, short number fragments ("253 pairs."), and digits in lines the cloned
// voice (m1/m2) reads, which need numbers in words.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const S = import.meta.dirname;
const plain = (s) => s.replace(/[*~^]/g, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
let total = 0;
for (const dir of process.argv.slice(2)) {
  const { LINES } = await import(pathToFileURL(join(S, dir, 'script.mjs')).href);
  const v = readFileSync(join(S, dir, 'voice.txt'), 'utf8').trim();
  const cloned = (l) => (l.who ? new RegExp(`${l.who}=(m1|m2|am_michael)`).test(v) && !/^A=am_michael/.test('') : /^(m1|m2)$/.test(v));
  const finalA = dir.endsWith('-dialogue') ? true : /^(m1|m2)$/.test(v);
  const out = [];
  for (const l of LINES) {
    const s = plain(l.say ?? l.text), why = [];
    if (/\d[.!?:;]\s+["']?\d/.test(s) || /\d,\s+\d/.test(s)) why.push('numbers meet');
    if (/:/.test(s)) why.push('colon');
    if (/[×÷=+−\/^√≈∝%°→←↑↓<>≤≥()]|\d\s*[–-]\s*\d/.test(s)) why.push('symbol');
    if (/\b(km|nm|µm|mm|cm|kg|AU|Da|vs|e\.g|i\.e|etc)\b/.test(s)) why.push('abbreviation');
    for (const sent of s.split(/(?<=[.!?])\s+/)) if (/^\d/.test(sent) && sent.split(' ').length <= 5) { why.push('number fragment'); break; }
    const isA = l.who === 'A' || (!l.who && /^(m1|m2)$/.test(v));
    if (isA && (dir.endsWith('-dialogue') || /^(m1|m2)$/.test(v)) && /\d/.test(s)) why.push('digits for the cloned voice');
    if (why.length) out.push(`  ${l.key.padEnd(5)} ${(l.who ?? '').padEnd(1)} [${why.join(', ')}] ${s}`);
  }
  total += out.length;
  console.log(`${dir}: ${out.length} of ${LINES.length} lines flagged`);
  if (process.env.VERBOSE) console.log(out.join('\n'));
}
console.log(`total flagged: ${total}`);
