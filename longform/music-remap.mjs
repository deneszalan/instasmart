// Move a music plan onto a new timeline, keeping every change of track at the same chapter card (or the same line).
//   node music-remap.mjs <slug>                   <slug>/music.json onto <slug>-dialogue's timeline -> <slug>-dialogue/music.json
//   node music-remap.mjs <dir> --since <old.js>   <dir>/music.json from the old timeline onto <dir>/timeline.js (after a re-recording)
// Then checks that every track is long enough for its segment.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const S = import.meta.dirname, [arg, flag, old] = process.argv.slice(2);
const read = (file) => JSON.parse(readFileSync(file, 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*$/, ''));
const [fromTL, toDir, musicFile] = flag === '--since'
  ? [read(old), join(S, arg), join(S, arg, 'music.json')]
  : [read(join(S, arg, 'timeline.js')), join(S, `${arg}-dialogue`), join(S, arg, 'music.json')];
const from = fromTL, to = read(join(toDir, 'timeline.js'));
if (from.chapters.length !== to.chapters.length) throw new Error('the two timelines need the same chapters');
const map = (x) => {
  if (x <= 0) return 0;
  if (x >= from.duration - 0.05) return to.duration;
  const ch = from.chapters.findLastIndex((c) => c.at <= x + 0.01);
  if (ch >= 0 && x <= from.chapters[ch].at + 6) return +(to.chapters[ch].at + (x - from.chapters[ch].at)).toFixed(2);
  const key = Object.keys(from.T).filter((k) => from.T[k][0] <= x).sort((a, b) => from.T[b][0] - from.T[a][0])[0];
  if (!to.T[key]) throw new Error(`line ${key} is missing from the new timeline`);
  return +(to.T[key][0] + (x - from.T[key][0])).toFixed(2);
};
const music = JSON.parse(readFileSync(musicFile, 'utf8')).map((m) => ({ ...m, at: map(m.at), until: map(m.until) }));
let ok = true;
for (const m of music) {
  const len = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', m.file], { encoding: 'utf8' }));
  const need = (m.offset ?? 0) + m.until - m.at;
  if (need > len) { ok = false; console.log(`TOO SHORT: ${m.file.split('/').pop()} needs ${need.toFixed(1)} s from ${(m.offset ?? 0)} s, it has ${len.toFixed(1)} s`); }
}
writeFileSync(join(toDir, 'music.json'), `${JSON.stringify(music, null, 1)}\n`);
console.log(`${join(toDir, 'music.json').slice(S.length + 1)}: ${music.length} segments, ${from.duration} s -> ${to.duration} s${ok ? '' : '  (fix the segments marked TOO SHORT)'}`);
process.exitCode = ok ? 0 : 2;
