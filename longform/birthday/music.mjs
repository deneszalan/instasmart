// Writes music.json from the timeline: Daily Beetle, then Fretless from part SWITCH1's card, then On My Way from part SWITCH2's.
// node music.mjs <slug> <switch1> <switch2>
import { readFileSync, writeFileSync } from 'node:fs';
const [slug, a = '4', b = '7'] = process.argv.slice(2);
const dir = new URL(`../${slug}/`, import.meta.url);
const TL = JSON.parse(readFileSync(new URL('timeline.js', dir), 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*$/, ''));
const M = '/tmp/claude-0/-home-user-instasmart/597d1c62-e00b-59e9-a6a1-fbf35da32d35/scratchpad/video-posts/music-cache/';
const tracks = [['Daily Beetle.mp3', 316.86], ['Fretless.mp3', 336.06], ['On My Way.mp3', 253.38]];
const cut = [0, TL.chapters[+a - 1].at + 0.6, TL.chapters[+b - 1].at + 0.6, TL.duration];
const out = tracks.map(([f, len], i) => {
  const at = i === 0 ? 0 : +(cut[i] - 1.5).toFixed(2), until = i === 2 ? TL.duration : +(cut[i + 1] + 1.5).toFixed(2);
  if (until - at > len) console.log(`TOO SHORT: ${f} needs ${(until - at).toFixed(1)} s, has ${len}`);
  return { file: M + f, at, until, offset: 0 };
});
writeFileSync(new URL('music.json', dir), `${JSON.stringify(out, null, 1)}\n`);
console.log(out.map((m) => `${m.file.split('/').pop()}: ${m.at}–${m.until} (${(m.until - m.at).toFixed(1)} s)`).join('\n'));
