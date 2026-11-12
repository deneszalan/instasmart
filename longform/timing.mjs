// Narration timing for a long-form video. The voice sets the pace: each line plays at its natural length.
//   node timing.mjs measure <slug>   -> <slug>/measure.srt: one line every 30 s, so tts.sh records each line whole
//                                       (and rec/lines.json, what each line says, for the line cache)
//   node timing.mjs build <slug>     -> <slug>/timeline.js (for the scene), subtitles.srt (YouTube captions), plan.json (for assemble.py)
// <slug>/script.mjs exports LINES: [{ key, text, say?, gap?, chapter?, who? }] and optionally HOLD: { key: seconds after that line }.
// A dialogue gives every line who: 'A' or 'B' (voice.txt then casts both: "A=m1 B=af_bella"); its captions mark each change of speaker with ">>".
// The French version (one narrator; see "French version" in README.md):
//   node timing.mjs measure-fr <slug> -> <slug>/rec-fr/lines.json, what each French line says, for tts-fr.sh; flags what XTTS reads badly
//   node timing.mjs build-fr <slug>   -> <slug>/timeline-fr.js, subtitles-fr.srt, plan-fr.json, from measure-fr.json (tts-fr.sh)
// script.mjs then also exports FR: { key: { text, say? } } for every key of LINES, and optionally HOLD_FR: { key: seconds },
// which overrides HOLD's entries for the French timeline (a key it doesn't name keeps HOLD's). Gaps and chapters come from LINES.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [mode, slug] = process.argv.slice(2);
const dir = join(import.meta.dirname, slug);
const script = await import(pathToFileURL(join(dir, 'script.mjs')).href);
const { LINES, HOLD = {} } = script;
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
} else if (mode === 'measure-fr' || mode === 'build-fr') {
  if (dialogue) throw new Error('a French version has one narrator, and this script is a dialogue');
  const FR = script.FR;
  if (!FR) throw new Error(`${slug}/script.mjs exports no FR: give every line its French, FR = { ${LINES[0].key}: { text, say? }, … }`);
  const lack = LINES.filter((l) => typeof FR[l.key]?.text !== 'string' || !FR[l.key].text.trim()).map((l) => l.key);
  const extra = Object.keys(FR).filter((k) => !keys.has(k));
  if (lack.length) throw new Error(`FR lacks the French text of ${lack.join(', ')}`);
  if (extra.length) throw new Error(`FR has keys that LINES doesn't: ${extra.join(', ')}`);
  // What the French voice says: no marks or quotation marks, and no final full stop (XTTS sometimes reads it out: "point").
  const spokenFr = (k) => plain(FR[k].say ?? FR[k].text).replace(/["«»]/g, '').replace(/\s+/g, ' ').replace(/\s*\.$/, '').trim();
  // The French captions keep their typography (’, « », the no-break spaces before ; : ! ?); only the marks go.
  const captionFr = (s) => s.replace(/[*~^]/g, '').replace(/[ \t\r\n]+/g, ' ').trim();
  // XTTS's longest line by language; the second language is French unless <slug>/lang2.txt says hu.
  const LIMIT = existsSync(join(dir, 'lang2.txt')) && readFileSync(join(dir, 'lang2.txt'), 'utf8').trim() === 'hu' ? 224 : 273;
  if (mode === 'measure-fr') {
    mkdirSync(join(dir, 'rec-fr'), { recursive: true });
    writeFileSync(join(dir, 'rec-fr', 'lines.json'), JSON.stringify(LINES.map((l) => ({ key: l.key, spoken: spokenFr(l.key) })), null, 1));
    const flags = [];
    for (const l of LINES) {
      const s = spokenFr(l.key), why = [];
      if (/\d/.test(s)) why.push('digits: write numbers and years in words in say');
      if (/[%°×÷=+/<>≈→−]/.test(s)) why.push('a symbol: say it in words');
      if (/:/.test(s)) why.push('a colon: give the voice the connecting words');
      if (s.length > LIMIT) why.push(`${s.length} characters: XTTS cuts a line after ${LIMIT} in this language, so split it`);
      else if (s.length > 200) why.push(`${s.length} characters: XTTS is less steady on long lines`);
      if (why.length) flags.push(`  ${l.key.padEnd(5)} [${why.join('; ')}] ${s}`);
    }
    if (flags.length) console.log(`French lines to look at:\n${flags.join('\n')}`);
    console.log(`${LINES.length} French lines, about ${LINES.reduce((n, l) => n + spokenFr(l.key).split(' ').length, 0)} words`);
  } else {
    let natural;
    try { natural = JSON.parse(readFileSync(join(dir, 'measure-fr.json'), 'utf8')); } catch { throw new Error(`${slug}/measure-fr.json is missing: run tts-fr.sh ${slug}`); }
    const missing = LINES.filter((l) => typeof natural[l.key] !== 'number').map((l) => l.key);
    if (missing.length) throw new Error(`measure-fr.json lacks ${missing.join(', ')}: run tts-fr.sh ${slug} again`);
    const hold = { ...HOLD, ...(script.HOLD_FR ?? {}) };
    let t = 0;
    const tl = LINES.map((l) => { t += l.gap ?? GAP; const start = t, end = start + natural[l.key] + 0.12; t = end + (hold[l.key] ?? 0); return { ...l, text: FR[l.key].text, start: +start.toFixed(2), end: +end.toFixed(2), natural: natural[l.key] }; });
    const duration = +t.toFixed(2);
    const caps = tl.map((l, i) => [l.start, Math.min(i + 1 < tl.length ? tl[i + 1].start - 0.08 : l.end + 2, l.end + 1.6), l.text]);
    writeFileSync(join(dir, 'subtitles-fr.srt'), srt(caps.map(([x, y, s]) => [x, y, captionFr(s)])));
    writeFileSync(join(dir, 'plan-fr.json'), JSON.stringify({ duration, lines: tl.map(({ key, start, natural: n }) => ({ key, start, natural: n })) }, null, 1));
    const T = Object.fromEntries(tl.map((l) => [l.key, [l.start, l.end]]));
    // Chapter titles stay in English, as the scene knows them: labels-fr.json translates them as drawn.
    const chapters = tl.filter((l) => l.chapter).map((l, i) => ({ n: i + 1, title: l.chapter, at: +(l.start - (l.gap ?? GAP)).toFixed(2) }));
    writeFileSync(join(dir, 'timeline-fr.js'), `// Written by timing.mjs (build-fr) from the measured French narration.\nwindow.TL = ${JSON.stringify({ duration, T, chapters, CUES: caps })};\n`);
    const mmss = (s) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
    let en = '';
    try { en = `; English ${mmss(JSON.parse(readFileSync(join(dir, 'plan.json'), 'utf8')).duration)}`; } catch {}
    console.log(`${slug} (French): ${mmss(duration)} (${duration} s), ${chapters.length} chapters, ${LINES.length} lines${en}`);
  }
}
