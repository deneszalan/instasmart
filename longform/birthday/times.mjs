// Still times: every line's midpoint, each chapter card's middle and the credits. node times.mjs <slug> [from] [to]
import { readFileSync } from 'node:fs';
const [slug, from = 0, to = 1e9] = process.argv.slice(2);
const TL = JSON.parse(readFileSync(new URL(`../${slug}/timeline.js`, import.meta.url), 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*$/, ''));
const ts = [...Object.values(TL.T).map(([a, b]) => (a + b) / 2), ...TL.chapters.map((c) => c.at + 2.0), TL.duration - 3];
console.log(ts.filter((x) => x >= from && x < to).sort((a, b) => a - b).map((x) => x.toFixed(2)).join(','));
