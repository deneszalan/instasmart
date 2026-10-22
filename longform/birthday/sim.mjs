// The simulations used in scene.js (same generator, same seeds), so the script's numbers match the picture.
export function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// 1,000 rooms: guests arrive until the first shared birthday; FIRST[i] = the guest number who brought it.
export function rooms(seed = 2026, n = 1000) {
  const rnd = mulberry32(seed), out = [];
  for (let r = 0; r < n; r++) {
    const seen = new Set(); let k = 0;
    for (;;) { k++; const d = Math.floor(rnd() * 365); if (seen.has(d)) break; seen.add(d); }
    out.push(k);
  }
  return out;
}
// one party of 23 for the demo: the first seed whose first match comes at guest 17..20 and no other match follows
export function demo() {
  for (let seed = 1; seed < 5000; seed++) {
    const rnd = mulberry32(seed * 7919);
    const days = Array.from({ length: 23 }, () => Math.floor(rnd() * 365));
    let first = -1, other = -1;
    for (let i = 0; i < 23 && first < 0; i++) for (let j = 0; j < i; j++) if (days[j] === days[i]) { first = i; other = j; break; }
    const later = days.slice(first + 1).some((d, i) => days.indexOf(d) !== first + 1 + i);
    if (first >= 16 && first <= 19 && !later) return { seed, days, first, other };
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const F = rooms();
  const by23 = F.filter((k) => k <= 23).length, mean = F.reduce((a, b) => a + b, 0) / F.length;
  const sorted = [...F].sort((a, b) => a - b);
  console.log({ by23, mean: mean.toFixed(2), min: sorted[0], max: sorted.at(-1), median: sorted[500], first5: F.slice(0, 5), over60: F.filter((k) => k > 60).length, by10: F.filter((k) => k <= 10).length, by70: F.filter((k) => k <= 70).length });
  const D = demo();
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], L = [31,28,31,30,31,30,31,31,30,31,30,31];
  const md = (d) => { let m = 0; while (d >= L[m]) { d -= L[m]; m++; } return `${M[m]} ${d + 1}`; };
  console.log({ seed: D.seed, guest: D.first + 1, with: D.other + 1, day: md(D.days[D.first]), days: D.days.map(md).join(', ') });
}
// 253 random birthdays for "someone shares yours": how many different days they cover
export function crowd(seed = 253, n = 253) {
  const rnd = mulberry32(seed), days = Array.from({ length: n }, () => Math.floor(rnd() * 365));
  return { days, distinct: new Set(days).size };
}
