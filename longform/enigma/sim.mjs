// Runs the scene's own Enigma code (the block between "machine begin/end" in scene.js, or machine.js before the
// scene exists) and prints every number the narration uses. node sim.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const here = import.meta.dirname;
const src = existsSync(join(here, 'scene.js')) ? readFileSync(join(here, 'scene.js'), 'utf8') : readFileSync(join(here, 'machine.js'), 'utf8');
const block = src.slice(src.indexOf('// ---- machine begin'), src.indexOf('// ---- machine end'));
const X = new Function(`${block}\nreturn { ...EnigmaSim, ...(typeof Demo !== 'undefined' ? { Demo } : {}) };`)();
const { AB, ix, mod, makeEnigma, scramble, plugTable } = X;
const ok = (c, m) => { if (!c) throw new Error(m); };

// ---- checks against the documented test sequences
ok(makeEnigma().type('AAAAA') === 'BDZGO', 'BDZGO');
ok(makeEnigma({ rings: 'BBB' }).type('AAAAA') === 'EWTYX', 'EWTYX');
{ const m = makeEnigma({ start: 'ADU' }); const w = []; for (let i = 0; i < 4; i++) { m.press('A'); w.push(m.windows()); } ok(w.join(' ') === 'ADV AEW BFX BFY', 'double step ' + w); }
console.log('checks: AAAAA -> BDZGO, rings BBB -> EWTYX, ADU -> ADV AEW BFX BFY: ok');

// ---- the count (Army and Air Force Enigma from 1939: 3 rotors of 5 in order, 26^3 positions, 10 plugboard cables)
const fact = (n) => { let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i; return f; };
const orders = 5n * 4n * 3n, positions = 26n ** 3n, plugs10 = fact(26) / (fact(6) * fact(10) * 2n ** 10n);
const total = orders * positions * plugs10;
console.log('orders', orders, 'positions', positions, 'plugboard(10)', plugs10.toLocaleString('en-US'), 'total', total.toLocaleString('en-US'));
const years = Number(total) / 1e6 / (365.25 * 86400);
console.log('at a million settings a second:', years.toExponential(4), 'years');
const plugs6 = fact(26) / (fact(14) * fact(6) * 2n ** 6n);
console.log('plugboard with 6 cables', plugs6.toLocaleString('en-US'));
console.log('plugboard 0..13 cables:', Array.from({ length: 14 }, (_, L) => (fact(26) / (fact(26 - 2 * L) * fact(L) * 2n ** BigInt(L))).toLocaleString('en-US')).join(' | '));

// ---- never itself: every key at every one of the 17,576 positions (and every wheel order of I-III)
{
  let tests = 0, self = 0;
  const perms = [['I', 'II', 'III'], ['I', 'III', 'II'], ['II', 'I', 'III'], ['II', 'III', 'I'], ['III', 'I', 'II'], ['III', 'II', 'I']];
  for (const order of perms) for (let p = 0; p < 17576; p++) {
    const core = [Math.floor(p / 676), Math.floor(p / 26) % 26, p % 26];
    for (let c = 0; c < 26; c++) { tests++; if (scramble(order, core, c) === c) self++; }
  }
  console.log('self-encryption tests', tests.toLocaleString('en-US'), 'self', self);
}
// ---- the period
{
  const m = makeEnigma({ start: 'AAA' }); const seen = m.windows(); let n = 0;
  do { m.step(); n++; } while (m.windows() !== seen);
  console.log('period (steps before the windows repeat):', n);
}
// ---- the day key used in the video
const DAY = { order: ['I', 'II', 'III'], rings: 'AAA', plugs: 'EJ OY IV AQ KW FX MT PS LU BD' };
{
  const m = makeEnigma({ ...DAY, start: 'AAA' });
  const r = [...'AAAAAA'].map((ch) => m.press(ch));
  console.log('cold open: A pressed six times from AAA ->', r.map((x) => x.out + ' (' + x.windows + ')').join(' '));
  const f = r[0];
  console.log('first press path: key A, plug in', AB[f.plugIn], 'trace', f.trace.map((c) => AB[c]).join(' '), 'plug out', AB[f.plugOut], '-> lamp', f.out);
  // reciprocal: same start, press the lamp's letter
  const m2 = makeEnigma({ ...DAY, start: 'AAA' });
  console.log('reciprocal: press', f.out, '->', m2.press(f.out).out);
  console.log('ENIGMA ->', makeEnigma({ ...DAY, start: 'AAA' }).type('ENIGMA'), '-> back', makeEnigma({ ...DAY, start: 'AAA' }).type(makeEnigma({ ...DAY, start: 'AAA' }).type('ENIGMA')));
}
if (X.Demo) console.log('Demo', JSON.stringify(X.Demo).slice(0, 2000));
{
  const D = X.Demo, L = (c) => c.map((cy) => cy.map((i) => AB[i]).join('')).join(' ');
  console.log('AD cycles', L(D.AD), '| lengths', D.AD.map((c) => c.length).join(','), '| no plugboard lengths', D.AD0.map((c) => c.length).join(','));
  console.log('BE lengths', D.BE.map((c) => c.length).join(','), 'no plug', D.BE0.map((c) => c.length).join(','));
  console.log('CF lengths', D.CF.map((c) => c.length).join(','), 'no plug', D.CF0.map((c) => c.length).join(','));
  console.log('indicators', D.indicators.map((x) => x.key + x.key + '->' + x.ind).join(' '));
  console.log('zygalski: messages sent', D.zSent, 'females', D.zSheets.length, 'counts', D.zCounts.join(' '), 'true', D.zTrue, 'open at end', D.zOpen.at(-1).map((v, i) => v ? AB[Math.floor(i / 26)] + AB[i % 26] : '').filter(Boolean).join(' '));
  console.log('holes per sheet', D.zSheets.map((s) => s.grid.reduce((a, b) => a + b, 0)).join(' '));
  console.log('cipher', D.cipher, 'crib at', D.cribAt, 'survivors', D.survivors, 'of', D.slots.length, D.slots.map((s) => s.ok ? 'o' : 'x').join(''));
  console.log('windows during message', D.cipherPress.map((p) => p.windows).join(' '));
}
{
  const D = X.Demo;
  console.log('turnover at cipher index', D.turnAt, 'menu from', D.menu.a, 'len', D.menu.len, 'loops', D.menu.loops, 'letters', D.menu.nodes.length, 'comps', D.menu.comps);
  console.log('menu edges', D.menu.edges.map(([u, v, i]) => AB[u] + AB[v] + i).join(' '), 'central', AB[D.central]);
  console.log('bombe stops', D.stops.length, 'true pos', D.truePos, 'true stop', JSON.stringify(D.trueStop), 'stops', D.stops.map((s) => s.p + ':' + s.n).join(' '));
}
{
  const D = X.Demo;
  console.log('selfTests', D.selfTests, 'selfHits', D.selfHits, 'period', D.period, 'stops without diagonal', D.stopsNoDiagonal, 'partner of central at true stop', AB[D.trueStop.partner], 'plug of central', AB[plugTable(D.DAY.plugs)[D.central]]);
}
{
  const D = X.Demo;
  for (const s of D.slots) console.log('slot', s.p, s.ok ? 'OK' : 'x', s.clash.map((c, i) => c ? `${D.crib[i]}@${i}` : '').filter(Boolean).join(','));
}
