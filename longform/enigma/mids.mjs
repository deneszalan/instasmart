// prints comma lists of still times: every line's midpoint (optionally only some keys), title cards and the credits
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2], which = process.argv[3] ?? 'all';
const s = readFileSync(join(dir, 'timeline.js'), 'utf8'), tl = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
const keys = Object.keys(tl.T);
let times = [];
if (which === 'all') times = keys.map((k) => (tl.T[k][0] + tl.T[k][1]) / 2);
else if (which === 'cards') times = [...tl.chapters.map((c) => c.at + 2.0), tl.duration - 3];
else { const [a, b] = which.split('-').map(Number); times = keys.slice(a, b).map((k) => (tl.T[k][0] + tl.T[k][1]) / 2); }
console.log(times.map((t) => t.toFixed(2)).join(','));
