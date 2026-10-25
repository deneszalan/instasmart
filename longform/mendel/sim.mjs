// The simulations behind the narration's numbers (the scene runs the same code with the same seeds).
//   node sim.mjs            prints every number the script quotes
export function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Mendel's counts (1866 paper, Abbott & Fairbanks translation, Genetics 2016)
export const EXPTS = [
  ['seed shape', 'round', 'wrinkled', 5474, 1850],
  ['seed colour', 'yellow', 'green', 6022, 2001],
  ['seed coat', 'grey-brown', 'white', 705, 224],
  ['pod shape', 'inflated', 'constricted', 882, 299],
  ['pod colour', 'green', 'yellow', 428, 152],
  ['flower position', 'along the stem', 'at the tip', 651, 207],
  ['stem length', 'long', 'short', 787, 277],
];
export const FIRST10 = [[45, 12], [27, 8], [24, 7], [19, 10], [32, 11], [26, 6], [88, 24], [22, 10], [28, 6], [25, 7]];
// one seed of an Rr x Rr cross: pollen allele and egg allele, each R or r with chance 1/2
const seedIsWrinkled = (rnd) => rnd() < 0.5 && rnd() < 0.5;
export function tenPlants(seed) {
  const rnd = mulberry32(seed);
  return FIRST10.map(([a, b]) => { let w = 0; for (let i = 0; i < a + b; i++) if (seedIsWrinkled(rnd)) w++; return [a + b - w, w]; });
}
export function harvest(seed, n = 7324) {
  const rnd = mulberry32(seed), w = [];
  let k = 0;
  for (let i = 0; i < n; i++) { if (seedIsWrinkled(rnd)) k++; w.push(k); }
  return w; // w[i] = wrinkled among the first i+1 seeds
}
export const chi2 = (d, r) => { const n = d + r, e = n / 4; return (r - e) ** 2 / e + (d - 3 * e) ** 2 / (3 * e); };
export const MENDEL_CHI = EXPTS.reduce((s, x) => s + chi2(x[3], x[4]), 0);
export function gardens(seed, n = 1000) {
  const rnd = mulberry32(seed), out = [];
  for (let g = 0; g < n; g++) {
    let c = 0;
    for (const x of EXPTS) { const N = x[3] + x[4]; let r = 0; for (let i = 0; i < N; i++) if (rnd() < 0.25) r++; c += chi2(N - r, r); }
    out.push(c);
  }
  return out;
}
export const SEEDS = { ten: 10, harvest: 9, gardens: 11 };

if (import.meta.url === `file://${process.argv[1]}`) {
  const r2 = (x) => x.toFixed(2);
  for (const x of EXPTS) console.log(x[0], x[3], x[4], r2(x[3] / x[4]));
  const D = EXPTS.reduce((s, x) => s + x[3], 0), R = EXPTS.reduce((s, x) => s + x[4], 0);
  console.log('all', D, R, r2(D / R));
  console.log('F1 test 372/193', r2(372 / 193), '353/166', r2(353 / 166));
  console.log('ten-plant ratios', FIRST10.map(([a, b]) => r2(a / b)).join(' '));
  console.log('dihybrid expectations of 556', [9, 3, 3, 1].map((k) => (556 * k / 16).toFixed(2)).join(' '));
  console.log('(3/4)^10 =', (0.75 ** 10).toFixed(4), 'Fisher ratio', (2 * (1 - 0.75 ** 10) / (1 + 2 * 0.75 ** 10)).toFixed(4));
  console.log('Mendel chi2 (7 totals)', MENDEL_CHI.toFixed(3));
  for (let sd = 1; sd <= 12; sd++) {
    const t = tenPlants(sd), rs = t.map(([a, b]) => a / b);
    const h = harvest(sd), W = h.at(-1), Rn = 7324 - W;
    const g = gardens(sd), below = g.filter((c) => c <= MENDEL_CHI).length;
    console.log(`seed ${sd}: ten ${t.map(([a, b]) => a + ':' + b).join(' ')} (min ${r2(Math.min(...rs))} max ${r2(Math.max(...rs))}) | harvest ${Rn}:${W} = ${r2(Rn / W)} | @40 ${r2((40 - h[39]) / h[39])} @400 ${r2((400 - h[399]) / h[399])} | gardens <= Mendel: ${below}/1000`);
  }
}
