// Narration timing for a long-form video. The voice sets the pace: each line plays at its natural length.
//   node timing.mjs measure <slug>   -> <slug>/measure.srt: one line every 30 s, so tts.sh records each line whole
//                                       (and rec/lines.json, what each line says, for the line cache)
//   node timing.mjs build <slug>     -> <slug>/timeline.js (for the scene), subtitles.srt (YouTube captions), plan.json (for assemble.py)
// <slug>/script.mjs exports LINES: [{ key, text, say?, gap?, chapter?, who? }] and optionally HOLD: { key: seconds after that line }.
// A dialogue gives every line who: 'A' or 'B' (voice.txt then casts both: "A=m1 B=af_bella"); its captions mark each change of speaker with ">>".
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [mode, slug] = process.argv.slice(2);
const dir = join(import.meta.dirname, slug);
const { LINES, HOLD = {} } = await import(pathToFileURL(join(dir, 'script.mjs')).href);
const GAP = 0.45, SPACING = 30;
const plain = (s) => s.replace(/[*~^]/g, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '').replace(/\s+/g, ' ').trim();
const spoken = (l) => plain(l.say ?? l.text).replace(/"/g, '');
const stamp = (s) => { const ms = Math.round(s * 1000), p = (n, w = 2) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const srt = (cues) => cues.map(([a, b, s], i) => `${i + 1}\n${stamp(a)} --> ${stamp(b)}\n${s}\n`).join('\n');
const keys = new Set();
for (const l of LINES) { if (keys.has(l.key)) throw new Error(`duplicate key ${l.key}`); keys.add(l.key); }
const dialogue = LINES.some((l) => l.who);
if (dialogue && LINES.some((l) => l.who !== 'A' && l.who !== 'B')) throw new Error('in a dialogue every line needs who: \'A\' or \'B\'');
const label = (l) => (dialogue ? `SPEAKER${l.who}: ` : '');
if (mode === 'measure') {
  writeFileSync(join(dir, 'measure.srt'), srt(LINES.map((l, i) => [1 + i * SPACING, SPACING - 4 + i * SPACING, label(l) + spoken(l)])));
  // What each line says, for tts.sh's line cache (linecache.py): only lines not recorded before are recorded.
  mkdirSync(join(dir, 'rec'), { recursive: true });
  writeFileSync(join(dir, 'rec', 'lines.json'), JSON.stringify(LINES.map((l) => ({ key: l.key, ...(l.who ? { who: l.who } : {}), spoken: spoken(l) })), null, 1));
  console.log(`${LINES.length} lines, about ${LINES.reduce((n, l) => n + spoken(l).split(' ').length, 0)} words`);
} else if (mode === 'build') {
  // By cue number, not log order: with two engines, srt2speech logs one engine's lines first, then the other's.
  const natural = [];
  for (const m of readFileSync(join(dir, 'measure.log'), 'utf8').matchAll(/^#(\d+)(?:\s+SPEAKER\w+)?\s+\S+\s+([\d.]+)s ->/gm)) natural[Number(m[1]) - 1] = Number(m[2]);
  const missing = LINES.map((l, i) => (natural[i] === undefined ? i + 1 : 0)).filter(Boolean);
  if (missing.length || natural.length !== LINES.length) throw new Error(`measure.log lacks lines ${missing.join(', ') || '?'} (script has ${LINES.length}): run tts.sh again`);
  let t = 0;
  const tl = LINES.map((l, i) => { t += l.gap ?? GAP; const start = t, end = start + natural[i] + 0.12; t = end + (HOLD[l.key] ?? 0); return { ...l, start: +start.toFixed(2), end: +end.toFixed(2), natural: natural[i], measured: 1 + i * SPACING }; });
  const duration = +t.toFixed(2);
  const caps = tl.map((l, i) => [l.start, Math.min(i + 1 < tl.length ? tl[i + 1].start - 0.08 : l.end + 2, l.end + 1.6), l.text]);
  const turn = (i) => (dialogue && (i === 0 || tl[i].who !== tl[i - 1].who) ? '>> ' : '');
  writeFileSync(join(dir, 'subtitles.srt'), srt(caps.map(([x, y, s], i) => [x, y, turn(i) + plain(s)])));
  writeFileSync(join(dir, 'plan.json'), JSON.stringify({ duration, lines: tl.map(({ key, start, natural: n, measured, who }) => ({ key, start, natural: n, measured, ...(who ? { who } : {}) })) }, null, 1));
  const T = Object.fromEntries(tl.map((l) => [l.key, [l.start, l.end]]));
  const WHO = dialogue ? { WHO: Object.fromEntries(tl.map((l) => [l.key, l.who])) } : {};
  const chapters = tl.filter((l) => l.chapter).map((l, i) => ({ n: i + 1, title: l.chapter, at: +(l.start - (l.gap ?? GAP)).toFixed(2) }));
  writeFileSync(join(dir, 'timeline.js'), `// Written by timing.mjs from the measured narration.\nwindow.TL = ${JSON.stringify({ duration, T, chapters, CUES: caps, ...WHO })};\n`);
  console.log(`${slug}: ${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, '0')} (${duration} s), ${chapters.length} chapters, ${LINES.length} lines`);
}
