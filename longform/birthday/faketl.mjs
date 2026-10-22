// A provisional timeline from word counts, for checking the scene before the voice is recorded.
import { writeFileSync } from 'node:fs';
const dir = process.argv[2];
const { LINES, HOLD = {} } = await import(`${dir}/script.mjs`);
let t = 0; const T = {}, chapters = [];
for (const l of LINES) { const g = l.gap ?? 0.45; t += g; const w = (l.say ?? l.text).split(/\s+/).length; const st = t, en = st + w / 2.6 + 0.3; T[l.key] = [+st.toFixed(2), +en.toFixed(2)]; if (l.chapter) chapters.push({ n: chapters.length + 1, title: l.chapter, at: +(st - g).toFixed(2) }); t = en + (HOLD[l.key] ?? 0); }
writeFileSync(`${dir}/timeline.js`, `window.TL = ${JSON.stringify({ duration: +t.toFixed(2), T, chapters, CUES: [] })};\n`);
console.log('fake duration', t.toFixed(1));
