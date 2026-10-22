// Start a dialogue version's music from its monologue's: node music-remap.mjs <slug>
// Reads <slug>/music.json and both timelines, moves every segment boundary to the same moment in <slug>-dialogue
// (the same chapter card, or the same line), writes <slug>-dialogue/music.json and checks every track is long enough.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const S = import.meta.dirname, slug = process.argv[2];
const tl = (dir) => JSON.parse(readFileSync(join(S, dir, 'timeline.js'), 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*$/, ''));
const from = tl(slug), to = tl(`${slug}-dialogue`);
if (from.chapters.length !== to.chapters.length) throw new Error('the two versions need the same chapters');
const map = (x) => {
  if (x <= 0) return 0;
  if (x >= from.duration - 0.05) return to.duration;
  const ch = from.chapters.findLastIndex((c) => c.at <= x + 0.01);
  if (ch >= 0 && x <= from.chapters[ch].at + 6) return +(to.chapters[ch].at + (x - from.chapters[ch].at)).toFixed(2);
  const key = Object.keys(from.T).filter((k) => from.T[k][0] <= x).sort((a, b) => from.T[b][0] - from.T[a][0])[0];
  if (!to.T[key]) throw new Error(`line ${key} is missing from the dialogue`);
  return +(to.T[key][0] + (x - from.T[key][0])).toFixed(2);
};
const music = JSON.parse(readFileSync(join(S, slug, 'music.json'), 'utf8')).map((m) => ({ ...m, at: map(m.at), until: map(m.until) }));
let ok = true;
for (const m of music) {
  const len = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', m.file], { encoding: 'utf8' }));
  const need = (m.offset ?? 0) + m.until - m.at;
  if (need > len) { ok = false; console.log(`TOO SHORT: ${m.file.split('/').pop()} needs ${need.toFixed(1)} s from ${(m.offset ?? 0)} s, it has ${len.toFixed(1)} s`); }
}
writeFileSync(join(S, `${slug}-dialogue`, 'music.json'), `${JSON.stringify(music, null, 1)}\n`);
console.log(`${slug}-dialogue/music.json: ${music.length} segments, ${from.duration} s -> ${to.duration} s${ok ? '' : '  (fix the segments marked TOO SHORT)'}`);
