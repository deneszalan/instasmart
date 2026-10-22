// Times for keys: node at.mjs <slug> key:frac[:offset] ...  (frac of the line, or 's'/'e' with an offset)
import { readFileSync } from 'node:fs';
const [slug, ...specs] = process.argv.slice(2);
const TL = JSON.parse(readFileSync(new URL(`../${slug}/timeline.js`, import.meta.url), 'utf8').replace(/^[\s\S]*?window\.TL = /, '').replace(/;\s*$/, ''));
console.log(specs.map((sp) => { const [k, f, o = 0] = sp.split(':'); const [a, b] = TL.T[k]; const v = f === 's' ? a + +o : f === 'e' ? b + +o : a + (b - a) * +f; return v.toFixed(2); }).join(','));
