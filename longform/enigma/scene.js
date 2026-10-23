// "Enigma: the letter that never came out as itself", a long-form explainer (16:9, 1920x1080).
// Look: 1930s-40s machine and paper. A deep olive crinkle-steel ground, the machine in a dark wood box with a
// glowing lampboard and brass-ringed rotors; message forms, key sheets and paper strips in cream with typewritten
// letters; muted greens, brass and one signal red. Bitter (a slab serif) for titles and labels, IBM Plex Mono for
// every letter the machine or a typist produces.
// Layout: the machine (or a paper form) on the left, the inside view, numbers, strips or menus on the right; the
// crib strip and the timelines run across the whole width. Everything is keyed to the narration lines in window.TL
// (timing.mjs), never to absolute seconds. The machine is simulated below (the block sim.mjs also runs), so every
// lamp, loop, sheet, crib clash and bombe stop on screen is computed, and checked against script.mjs.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const dur = (key) => T[key][1] - T[key][0];
const at = (key, f) => T[key][0] + f * dur(key);

// ---- machine begin
// A real Enigma I: rotors I, II, III and reflector B with their documented wirings (Wikipedia, "Enigma rotor
// details"), alphabet rings (Ringstellung), the plugboard, and the stepping mechanism with the middle rotor's
// double step. Checks: rotors I-II-III, rings AAA, start AAA, plugboard empty: AAAAA -> BDZGO; rings BBB -> EWTYX;
// windows ADU -> ADV -> AEW -> BFX -> BFY (the double step).
const AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ix = (ch) => AB.indexOf(ch);
const mod = (n) => ((n % 26) + 26) % 26;
const ROTORS = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
};
const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
const REFLECTOR_A = 'EJMZALYXVBWFCRQUONTSPIKHGD'; // in use until 1 November 1937, so the 1932 demonstration uses it
const FWD = {}, BWD = {};
for (const [name, r] of Object.entries(ROTORS)) {
  FWD[name] = [...r.wiring].map(ix);
  BWD[name] = Array(26); FWD[name].forEach((o, i) => { BWD[name][o] = i; });
}
const REF = [...REFLECTOR_B].map(ix), REFS = { A: [...REFLECTOR_A].map(ix), B: REF };
/** Plugboard pairs "AQ EJ ..." as a 26-entry swap table. */
function plugTable(pairs = '') {
  const p = [...Array(26).keys()];
  for (const pr of pairs.split(/\s+/).filter(Boolean)) { const a = ix(pr[0]), b = ix(pr[1]); p[a] = b; p[b] = a; }
  return p;
}
/** The scrambler at fixed core offsets (window letter minus ring letter), without the plugboard. */
function scramble(order, core, c, trace, ref = REF) {
  // right to left: rotor 2 (right), 1 (middle), 0 (left)
  for (let r = 2; r >= 0; r--) { c = mod(FWD[order[r]][mod(c + core[r])] - core[r]); if (trace) trace.push(c); }
  c = ref[c]; if (trace) trace.push(c);
  for (let r = 0; r <= 2; r++) { c = mod(BWD[order[r]][mod(c + core[r])] - core[r]); if (trace) trace.push(c); }
  return c;
}
function makeEnigma({ order = ['I', 'II', 'III'], rings = 'AAA', start = 'AAA', plugs = '', reflector = 'B' } = {}) {
  const ring = [...rings].map(ix), pos = [...start].map(ix), plug = plugTable(plugs);
  const atNotch = (r) => AB[pos[r]] === ROTORS[order[r]].notch;
  const step = () => {
    // the right-hand pawl always steps its rotor; the middle pawl engages when the right rotor is at its notch;
    // the left pawl engages when the middle rotor is at its notch, and then also pushes the middle rotor (double step)
    if (atNotch(1)) { pos[1] = mod(pos[1] + 1); pos[0] = mod(pos[0] + 1); } else if (atNotch(2)) pos[1] = mod(pos[1] + 1);
    pos[2] = mod(pos[2] + 1);
  };
  const core = () => pos.map((p, i) => mod(p - ring[i]));
  /** Press a key: the rotors step first, then the current runs. Returns the lamp and every contact on the way. */
  const press = (ch) => {
    step();
    const k = ix(ch), inP = plug[k], trace = [];
    const s = scramble(order, core(), inP, trace, REFS[reflector]);
    const out = plug[s];
    return { key: ch, out: AB[out], windows: pos.map((p) => AB[p]).join(''), core: core(), plugIn: inP, trace, plugOut: s };
  };
  const windows = () => pos.map((p) => AB[p]).join('');
  const type = (text) => [...text].map((ch) => press(ch).out).join('');
  return { press, type, windows, step, plug };
}

// ---------- the demonstrations, computed once (the scene draws these; sim.mjs prints them) ----------
function cyclesOf(perm) {
  const seen = Array(26).fill(false), out = [];
  for (let i = 0; i < 26; i++) { if (seen[i]) continue; const cyc = []; let j = i; while (!seen[j]) { seen[j] = true; cyc.push(j); j = perm[j]; } out.push(cyc); }
  return out.sort((a, b) => b.length - a.length || a[0] - b[0]);
}
/** The permutations at the six indicator positions from a ground setting (stepping as the machine does). */
function sixPerms(key, ground) {
  const perms = [];
  for (let i = 0; i < 6; i++) {
    const p = [];
    for (let c = 0; c < 26; c++) { const m = makeEnigma({ ...key, start: ground }); for (let k = 0; k < i; k++) m.step(); p.push(ix(m.press(AB[c]).out)); }
    perms.push(p);
  }
  return perms;
}
/** Seeded random numbers (mulberry32), so every run draws the same messages. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const Demo = (() => {
  const D = {};
  // the day key used throughout: rotors I II III, rings at A, ten cables (the pairs of a 1940s key sheet)
  D.DAY = { order: ['I', 'II', 'III'], rings: 'AAA', plugs: 'EJ OY IV AQ KW FX MT PS LU BD' };
  // cold open and chapter 1: A pressed six times from AAA
  { const m = makeEnigma({ ...D.DAY, start: 'AAA' }); D.presses = [...'AAAAAA'].map((ch) => m.press(ch)); }
  // the double step, from ADU: five presses of A
  { const m = makeEnigma({ ...D.DAY, start: 'ADU' }); D.steps = [{ windows: 'ADU' }, ...[...'AAAAA'].map((ch) => m.press(ch))]; }
  // reciprocity: the first press's lamp letter, pressed at the same setting, lights A
  D.back = makeEnigma({ ...D.DAY, start: 'AAA' }).press(D.presses[0].out);
  D.word = 'ENIGMA'; D.wordC = makeEnigma({ ...D.DAY, start: 'AAA' }).type(D.word); D.wordP = makeEnigma({ ...D.DAY, start: 'AAA' }).type(D.wordC);
  // never itself: every key at every one of the 17,576 positions of rotors I, II, III
  { let n = 0, self = 0; for (let p = 0; p < 17576; p++) { const core = [Math.floor(p / 676), Math.floor(p / 26) % 26, p % 26]; for (let c = 0; c < 26; c++) { n++; if (scramble(D.DAY.order, core, c) === c) self++; } } D.selfTests = n; D.selfHits = self; }
  // the period: key presses before the windows come round again
  { const m = makeEnigma({ ...D.DAY, start: 'AAA' }); let n = 0; do { m.step(); n++; } while (m.windows() !== 'AAA'); D.period = n; }
  // 1932: an early key sheet (Wikipedia, "Cryptanalysis of the Enigma"): day 31, I II III, rings W N M, six cables, ground RAO
  D.SHEET = { order: ['I', 'II', 'III'], rings: 'WNM', plugs: 'HK CN IO FY JM LW', reflector: 'A' };
  D.GROUND = 'RAO';
  {
    const P = sixPerms(D.SHEET, D.GROUND), P0 = sixPerms({ ...D.SHEET, plugs: '' }, D.GROUND);
    const prod = (a, b) => a.map((x) => b[x]); // first a, then b
    D.AD = cyclesOf(prod(P[0], P[3])); D.BE = cyclesOf(prod(P[1], P[4])); D.CF = cyclesOf(prod(P[2], P[5]));
    D.AD0 = cyclesOf(prod(P0[0], P0[3])); D.BE0 = cyclesOf(prod(P0[1], P0[4])); D.CF0 = cyclesOf(prod(P0[2], P0[5]));
    // a few days' indicators: message keys chosen at random, typed twice at the ground setting
    const r = rng(1932); D.indicators = [];
    for (let i = 0; i < 6; i++) { const k = [0, 0, 0].map(() => AB[Math.floor(r() * 26)]).join(''); D.indicators.push({ key: k, ind: makeEnigma({ ...D.SHEET, start: D.GROUND }).type(k + k) }); }
  }
  // 1938: Zygalski's sheets. A day key the codebreakers don't know; each operator picks his own ground setting
  // (sent in clear) and a message key, typed twice. A "female" is an indicator whose 1st and 4th letters match.
  {
    const KEY = { order: ['I', 'II', 'III'], rings: 'KDR', plugs: 'AM BT CX DQ GZ HS' };
    const ring = [...KEY.rings].map(ix);
    // hole[l][m][r]: from core positions (l, m, r) before the first letter, without a turnover, can a 1-4 female occur?
    const hole = (l, m, r) => { for (let c = 0; c < 26; c++) { const a = scramble(KEY.order, [l, m, mod(r + 1)], c); if (scramble(KEY.order, [l, m, mod(r + 4)], a) === c) return true; } return false; };
    const r = rng(1938), females = [];
    let sent = 0;
    while (females.length < 14) {
      sent++;
      const g = [0, 0, 0].map(() => Math.floor(r() * 26)), k = [0, 0, 0].map(() => AB[Math.floor(r() * 26)]).join('');
      const ground = g.map((x) => AB[x]).join(''), m = makeEnigma({ ...KEY, start: ground }), ind = m.type(k + k);
      const turned = m.windows().slice(0, 2) !== ground.slice(0, 2);
      if (ind[0] === ind[3] && !turned) females.push({ ground, ind, g });
    }
    D.zSent = sent;
    // every female's sheet, laid at its ground setting; a candidate ring setting (middle, right) stays open only where
    // every sheet has a hole. The left sheet is taken as known here (the Poles tried the sheets in turn).
    const L = ring[0];
    D.zSheets = females.map((f) => {
      const lc = mod(f.g[0] - L), grid = [];
      for (let x = 0; x < 26; x++) for (let y = 0; y < 26; y++) grid.push(hole(lc, mod(f.g[1] - x), mod(f.g[2] - y)) ? 1 : 0);
      return { ...f, sheet: AB[lc], grid };
    });
    D.zOpen = []; let open = Array(676).fill(1);
    for (const s of D.zSheets) { open = open.map((v, i) => v & s.grid[i]); D.zOpen.push(open.slice()); }
    D.zCounts = D.zOpen.map((o) => o.reduce((a, b) => a + b, 0));
    D.zTrue = ring[1] * 26 + ring[2];
    D.zKey = KEY;
  }
  // 1940s: a crib. A made-up message on the day key; the crib KEINEBESONDERENEREIGNISSE ("nothing to report")
  {
    D.plain = 'ANXGRUPPEXKEINEBESONDERENEREIGNISSEXENDE';
    D.crib = 'KEINEBESONDERENEREIGNISSE';
    D.cribAt = D.plain.indexOf(D.crib);
    D.msgKey = 'MLH';
    const m = makeEnigma({ ...D.DAY, start: D.msgKey }), pr = [...D.plain].map((ch) => m.press(ch));
    D.cipher = pr.map((p) => p.out).join(''); D.cipherPress = pr;
    D.slots = Array.from({ length: D.cipher.length - D.crib.length + 1 }, (_, p) => {
      const clash = [...D.crib].map((ch, i) => (D.cipher[p + i] === ch ? 1 : 0));
      return { p, clash, ok: !clash.some(Boolean), first: clash.indexOf(1) };
    });
    D.survivors = D.slots.filter((s) => s.ok).length;
  }

  // the bombe: a menu from the crib where it fits, over a stretch with no middle-rotor turnover, run on all 17,576
  // positions of one wheel order, with Welchman's diagonal board
  {
    const turn = D.cipherPress.findIndex((p, i) => i > 0 && p.windows[1] !== D.cipherPress[i - 1].windows[1]);
    D.turnAt = turn;
    // the stretch of the crib (10 to 14 letters, no turnover inside, one connected menu, no repeated pair) with
    // the most loops, and the shortest such
    let best = null;
    for (let len = 10; len <= 14; len++) for (let a = D.cribAt; a + len <= D.cribAt + D.crib.length; a++) {
      if (D.cipherPress.slice(a, a + len).some((p, i) => i > 0 && p.windows[1] !== D.cipherPress[a + i - 1].windows[1])) continue;
      const edges = []; for (let i = a; i < a + len; i++) edges.push([ix(D.plain[i]), ix(D.cipher[i]), i]);
      const nodes = new Set(edges.flatMap((e) => [e[0], e[1]]));
      const par = [...Array(26).keys()], find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
      edges.forEach(([u, v]) => { par[find(u)] = find(v); });
      const comps = new Set([...nodes].map(find)).size, loops = edges.length - nodes.size + comps;
      const dbl = edges.some((e, i) => edges.some((g, j) => j < i && ((g[0] === e[0] && g[1] === e[1]) || (g[0] === e[1] && g[1] === e[0]))));
      if (comps === 1 && !dbl && (!best || loops > best.loops || (loops === best.loops && len < best.len))) best = { a, len, edges, loops, nodes: [...nodes], comps };
    }
    D.menu = best;
    const deg = Array(26).fill(0); best.edges.forEach(([u, v]) => { deg[u]++; deg[v]++; });
    D.central = deg.indexOf(Math.max(...deg));
    const order = D.DAY.order, E = best.edges.map(([u, v, i]) => [u, v, i - best.a]);
    const adj = Array.from({ length: 26 }, () => []); E.forEach(([u, v, j]) => { adj[u].push([v, j]); adj[v].push([u, j]); });
    const lit = new Uint8Array(676), queue = new Int16Array(676), S = Array.from({ length: best.len }, () => new Int8Array(26));
    const run = (diagonal) => {
      const stops = [];
      for (let p = 0; p < 17576; p++) {
        const l = Math.floor(p / 676), m = Math.floor(p / 26) % 26, r = p % 26;
        for (let j = 0; j < best.len; j++) for (let c = 0; c < 26; c++) S[j][c] = scramble(order, [l, m, mod(r + j)], c);
        lit.fill(0); let qh = 0, qt = 0;
        const on = (a, x) => { const k = a * 26 + x; if (!lit[k]) { lit[k] = 1; queue[qt++] = k; } };
        on(D.central, 0); // the test register: one hypothesis about the central letter's plug partner
        while (qh < qt) {
          const k = queue[qh++], a = Math.floor(k / 26), x = k % 26;
          if (diagonal) on(x, a); // Welchman's diagonal board: if a is plugged to x, then x is plugged to a
          for (const [b, j] of adj[a]) on(b, S[j][x]);
        }
        let n = 0; for (let x = 0; x < 26; x++) n += lit[D.central * 26 + x];
        if (n < 26) stops.push({ p, n, partner: n === 1 ? 0 : n === 25 ? [...Array(26).keys()].find((x) => !lit[D.central * 26 + x]) : -1 });
      }
      return stops;
    };
    const stops = run(true);
    D.stopsNoDiagonal = run(false).length;
    D.stops = stops;
    const tc = D.cipherPress[best.a].core; D.truePos = tc[0] * 676 + tc[1] * 26 + tc[2];
    D.trueStop = stops.find((s) => s.p === D.truePos);
  }
  return D;
})();
const EnigmaSim = { AB, ix, mod, ROTORS, REFLECTOR_A, REFLECTOR_B, REF, REFS, FWD, BWD, plugTable, scramble, makeEnigma, cyclesOf, rng };
// ---- machine end

// ---------- the narration's numbers, checked against the machine ----------
const D = Demo;
const NUM = { selfTests: 456976, period: 16900, cribPlaces: 16, ruledOut: 9, survivors: 7, stops: 2, stopsNoDiagonal: 662, zSheets: 7 };
const check = (c, m) => { if (!c) throw new Error('check failed: ' + m); };
check(makeEnigma().type('AAAAA') === 'BDZGO' && makeEnigma({ rings: 'BBB' }).type('AAAAA') === 'EWTYX', 'test sequences');
check(D.steps.map((x) => x.windows).join(' ') === 'ADU ADV AEW BFX BFY BFZ', 'double step');
check(D.selfTests === NUM.selfTests && D.selfHits === 0, 'never itself');
check(D.period === NUM.period, 'period');
check(D.presses[0].out === 'C' && D.presses[1].out === 'N' && D.back.out === 'A', 'lamps named in the narration');
check(D.wordP === D.word, 'reciprocal');
check(D.zCounts.indexOf(1) + 1 === NUM.zSheets && D.zOpen[NUM.zSheets - 1][D.zTrue] === 1, 'zygalski');
check(D.slots.length === NUM.cribPlaces && D.survivors === NUM.survivors && D.slots[D.cribAt - 0].ok, 'crib');
check(D.slots[1].clash.some((c, i) => c && D.crib[i] === 'R') && D.slots[0].ok, 'R on R in the second place');
check(D.stops.length === NUM.stops && D.stopsNoDiagonal === NUM.stopsNoDiagonal && D.trueStop, 'bombe');
check(AB[D.central] === 'E' && AB[D.trueStop.partner] === 'J' && plugTable(D.DAY.plugs)[D.central] === ix('J'), 'E plugged to J');
check(D.AD.map((c) => c.length).join() === D.AD0.map((c) => c.length).join(), 'loop lengths ignore the plugboard');
// with reflector A, the early key sheet's day 31 gives exactly the loops of Wikipedia's worked example
check(D.AD.map((c) => c.map((i) => AB[i]).join('')).join(' ') === 'ANPLXMJFI CYDQWVOUG BSZ ETK H R', 'the 1932 loops');
// A pressed again and again from AAA: never A
const AREP = (() => { const m = makeEnigma({ ...D.DAY, start: 'AAA' }); return Array.from({ length: 64 }, () => m.press('A').out); })();
check(!AREP.includes('A'), 'A never A');
const PLUG = plugTable(D.DAY.plugs);
const BIG = '158,962,555,217,826,360,000';
{ const f = (n) => { let r = 1n; for (let i = 2n; i <= n; i++) r *= i; return r; }; check((60n * 17576n * (f(26n) / (f(6n) * f(10n) * 1024n))).toLocaleString('en-US') === BIG, 'the count'); }
const YEARS = 158962555217826360000 / 1e6 / (365.25 * 86400); // about 5.04 million
check(YEARS > 4.9e6 && YEARS < 5.1e6, 'five million years');

// ---------- look ----------
const C = {
  bg0: '#1C2219', bg1: '#141812', steel: '#2B3326', steelHi: '#3C4634', panel: '#171B14', panelHi: '#232A1F',
  wood0: '#4C2E1B', wood1: '#2E1B10', brass: '#C9A24C', brassHi: '#EBD08C', brassDk: '#7A5D27',
  paper: '#ECE3CA', paperDk: '#D4C6A3', paperLine: 'rgba(60,52,34,0.18)', ink: '#2A2820', inkSoft: 'rgba(42,40,32,0.62)',
  cream: '#EFE7D1', creamSoft: 'rgba(239,231,209,0.74)', creamFaint: 'rgba(239,231,209,0.42)',
  lamp: '#FFD36A', lampHot: '#FFF5D2', glass: '#2A2E24',
  red: '#D2452F', redSoft: 'rgba(210,69,47,0.55)', green: '#A3BC80', greenDk: '#5F7A45',
  fwd: '#F2B544', bwd: '#E8643F', wire: 'rgba(239,231,209,0.10)',
};
const SLAB = 'Bitter', MONO = 'IBM Plex Mono';
let k, ctx;
const font = (w, size, fam = SLAB) => k.font(w, size, fam);
const text = (str, x, y, o = {}) => k.text(str, x, y, { color: C.cream, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const rrect = (...a) => k.rrect(...a);
function label(str, x, y, { size = 34, color = C.cream, align = 'center', weight = 600, family = SLAB, spacing = '0px' } = {}) {
  font(weight, size, family); text(str, x, y, { color, align, spacing });
}
const mono = (str, x, y, o = {}) => label(str, x, y, { family: MONO, weight: 500, ...o });

// ---------- textures, painted once ----------
let bg = null, paperPat = null, woodPat = null;
function paintTextures() {
  const r = EnigmaSim.rng(7);
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  let g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * 0.6, H);
  lg.addColorStop(0, '#222A1E'); lg.addColorStop(0.55, '#1A2017'); lg.addColorStop(1, '#121510');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30000; i++) {
    const x = r() * W, y = r() * H, d = r();
    g.fillStyle = d < 0.55 ? `rgba(0,0,0,${0.08 + 0.12 * r()})` : `rgba(196,208,160,${0.02 + 0.035 * r()})`;
    g.beginPath(); g.arc(x, y, 0.6 + r() * 1.5, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 9; i++) { // faint brushed bands
    const y = r() * H, h = 40 + r() * 120, band = g.createLinearGradient(0, y, 0, y + h);
    band.addColorStop(0, 'rgba(200,210,170,0)'); band.addColorStop(0.5, 'rgba(200,210,170,0.018)'); band.addColorStop(1, 'rgba(200,210,170,0)');
    g.fillStyle = band; g.fillRect(0, y, W, h);
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1180);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.58)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // paper grain
  const pc = document.createElement('canvas'); pc.width = 512; pc.height = 512; g = pc.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(120,100,60,${0.03 + 0.05 * r()})` : `rgba(255,252,240,${0.05 + 0.08 * r()})`; g.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1); }
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(130,110,70,${0.04 + 0.05 * r()})`; g.lineWidth = 0.7; const x = r() * 512, y = r() * 512, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (8 + r() * 20), y + Math.sin(a) * (8 + r() * 20)); g.stroke(); }
  paperPat = ctx.createPattern(pc, 'repeat');
  // wood grain
  const wc = document.createElement('canvas'); wc.width = 900; wc.height = 900; g = wc.getContext('2d');
  const wg = g.createLinearGradient(0, 0, 900, 0); wg.addColorStop(0, C.wood1); wg.addColorStop(0.5, C.wood0); wg.addColorStop(1, C.wood1);
  g.fillStyle = wg; g.fillRect(0, 0, 900, 900);
  for (let i = 0; i < 140; i++) {
    const x0 = r() * 900, wob = 6 + r() * 18, ph = r() * 6;
    g.strokeStyle = r() < 0.6 ? `rgba(20,10,4,${0.10 + 0.18 * r()})` : `rgba(140,90,50,${0.06 + 0.08 * r()})`;
    g.lineWidth = 0.8 + r() * 2.2; g.beginPath();
    for (let y = 0; y <= 900; y += 20) { const x = x0 + Math.sin(y / 140 + ph) * wob; if (y === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
  }
  woodPat = ctx.createPattern(wc, 'repeat');
}
function background() { ctx.drawImage(bg, 0, 0); }

// ---------- primitives ----------
function paper(x, y, w, h, { tilt = 0, fill = null, shadow = 0.45, r = 6 } = {}) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt);
  ctx.shadowColor = `rgba(0,0,0,${shadow})`; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
  rrect(-w / 2, -h / 2, w, h, r); ctx.fillStyle = fill ?? paperPat; ctx.fill();
  ctx.shadowColor = 'transparent';
  const sh = ctx.createLinearGradient(0, -h / 2, 0, h / 2); sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(1, 'rgba(90,70,40,0.10)');
  ctx.fillStyle = sh; rrect(-w / 2, -h / 2, w, h, r); ctx.fill();
  ctx.restore();
}
function chip(str, cx, cy, { size = 32, fg = C.ink, bg: b = C.paper, edge = null, padX = 12, h = null, family = MONO, weight = 600 } = {}) {
  font(weight, size, family); const w = ctx.measureText(str).width + padX * 2, hh = h ?? size * 1.35;
  rrect(cx - w / 2, cy - hh / 2, w, hh, 7); ctx.fillStyle = b; ctx.fill();
  if (edge) { ctx.lineWidth = 3; ctx.strokeStyle = edge; ctx.stroke(); }
  text(str, cx, cy + 1, { color: fg, align: 'center' });
  return w;
}
function cross(x, y, r, p, color = C.red, lw = 7) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  const a = clamp(p * 2), b = clamp(p * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
  ctx.restore();
}
function tick(x, y, r, p, color = C.green, lw = 7) {
  if (p <= 0) return;
  const pts = [[x - r, y], [x - r * 0.3, y + r * 0.7], [x + r, y - r * 0.8]];
  const L1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), L2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
  let d = p * (L1 + L2);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  if (d <= L1) ctx.lineTo(lerp(pts[0][0], pts[1][0], d / L1), lerp(pts[0][1], pts[1][1], d / L1));
  else { ctx.lineTo(...pts[1]); d -= L1; ctx.lineTo(lerp(pts[1][0], pts[2][0], d / L2), lerp(pts[1][1], pts[2][1], d / L2)); }
  ctx.stroke(); ctx.restore();
}
function arrow(x0, y0, x1, y1, { color = C.creamSoft, w = 4, head = 16, p = 1 } = {}) {
  if (p <= 0) return;
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * head * 0.6, y - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.45) * head, y - Math.sin(a - 0.45) * head); ctx.lineTo(x - Math.cos(a + 0.45) * head, y - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** A rubber-stamp date, slightly rotated. */
function stamp(str, x, y, p, { rot = -0.06, size = 40, color = C.red } = {}) {
  if (p <= 0) return;
  const sc = 1 + 0.35 * (1 - eout(clamp(p * 1.6)));
  A(clamp(p * 1.6) * 0.9, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    font(800, size, SLAB); const w = ctx.measureText(str).width + 40;
    ctx.strokeStyle = color; ctx.lineWidth = 4; rrect(-w / 2, -size * 0.85, w, size * 1.7, 8); ctx.stroke();
    text(str, 0, 2, { color, align: 'center', spacing: '2px' });
    ctx.restore();
  });
}
/** Letters in a row of cells, like a typed strip. hi(i) -> null | colour for that cell's background. */
function strip(letters, x, y, cell, { fg = C.ink, size = 34, hi = null, show = letters.length, bgc = null, weight = 600 } = {}) {
  font(weight, size, MONO);
  for (let i = 0; i < Math.min(show, letters.length); i++) {
    const cx = x + i * cell + cell / 2, h = hi ? hi(i) : null;
    if (h) { rrect(cx - cell / 2 + 2, y - cell / 2 + 2, cell - 4, cell - 4, 5); ctx.fillStyle = h; ctx.fill(); }
    text(letters[i], cx, y + 1, { color: bgc && h ? bgc : fg, align: 'center' });
  }
}
/** Typewriter reveal: how many characters of str are visible at time t, typing from t0 at rate chars/s. */
const typed = (t, t0, rate) => Math.max(0, Math.floor((t - t0) * rate));

// ---------- the machine, seen from above ----------
const ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
const KP = {};
ROWS.forEach((row, r) => [...row].forEach((ch, i) => { KP[ch] = [(i - (row.length - 1) / 2) * 74, r]; }));
function lampGlyph(x, y, ch, glow, ring = null) {
  if (glow > 0.01) {
    const gl = ctx.createRadialGradient(x, y, 4, x, y, 70);
    gl.addColorStop(0, `rgba(255,214,110,${0.55 * glow})`); gl.addColorStop(1, 'rgba(255,214,110,0)');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 70, 0, Math.PI * 2); ctx.fill();
  }
  const gg = ctx.createRadialGradient(x - 8, y - 8, 2, x, y, 28);
  gg.addColorStop(0, glow > 0.01 ? `rgba(255,248,220,${0.3 + 0.7 * glow})` : '#3A3F33');
  gg.addColorStop(1, glow > 0.01 ? `rgba(255,196,80,${0.25 + 0.75 * glow})` : C.glass);
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, 27, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
  font(600, 32, MONO);
  text(ch, x, y + 1, { color: glow > 0.3 ? '#5A3A0A' : 'rgba(239,231,209,0.32)', align: 'center' });
  if (ring) { ctx.lineWidth = 5; ctx.strokeStyle = ring; ctx.beginPath(); ctx.arc(x, y, 33, 0, Math.PI * 2); ctx.stroke(); }
}
function keyGlyph(x, y, ch, press) {
  const d = press * 5;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(x + 2, y + 6, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C9C1AA'; ctx.beginPath(); ctx.arc(x, y + d, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = press > 0.05 ? '#2A2A22' : '#11120E'; ctx.beginPath(); ctx.arc(x, y + d, 25.5, 0, Math.PI * 2); ctx.fill();
  font(600, 32, MONO); text(ch, x, y + d + 1, { color: press > 0.05 ? C.lamp : C.cream, align: 'center' });
}
/**
 * The machine. win: the three window letters; from/roll animate a step; lit: { letter: glow }; keys: { letter: press };
 * ring: { letter: colour } around a lamp.
 */
function machine(t, { cx = 470, cy = 560, sc = 0.9, win = 'AAA', from = null, roll = 1, lit = {}, keys = {}, ring = {}, cables = 1 } = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  rrect(-392, -442, 784, 884, 28); ctx.fillStyle = woodPat; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.stroke();
  rrect(-360, -410, 720, 820, 16); ctx.fillStyle = C.panel; ctx.fill();
  const pg = ctx.createLinearGradient(0, -410, 0, 410); pg.addColorStop(0, 'rgba(255,255,255,0.05)'); pg.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = pg; ctx.fill();
  // rotor bay and windows
  rrect(-215, -392, 430, 132, 12); ctx.fillStyle = '#0D0F0B'; ctx.fill();
  ctx.strokeStyle = C.brassDk; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const x = -120 + i * 120, y = -326;
    // finger wheel
    ctx.fillStyle = C.brassDk; rrect(x + 36, y - 52, 18, 104, 6); ctx.fill();
    for (let j = 0; j < 9; j++) { ctx.fillStyle = j % 2 ? C.brass : C.brassHi; ctx.fillRect(x + 38, y - 46 + j * 11 + ((roll < 1 && from && from[i] !== win[i]) ? (roll * 11) % 11 : 0), 14, 5); }
    rrect(x - 30, y - 34, 60, 68, 8); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.brass; ctx.stroke();
    ctx.save(); rrect(x - 28, y - 32, 56, 64, 6); ctx.clip();
    font(700, 40, MONO);
    const was = from ? from[i] : win[i], p = was !== win[i] ? eio(clamp(roll)) : 1;
    if (was !== win[i] && p < 1) { text(was, x, y + 1 - p * 64, { color: C.ink, align: 'center' }); text(win[i], x, y + 1 + (1 - p) * 64, { color: C.ink, align: 'center' }); }
    else text(win[i], x, y + 1, { color: C.ink, align: 'center' });
    ctx.restore();
  }
  // lampboard and keyboard
  for (const ch of AB) { const [x, r] = KP[ch]; lampGlyph(x, -196 + r * 72, ch, lit[ch] ?? 0, ring[ch] ?? null); }
  for (const ch of AB) { const [x, r] = KP[ch]; keyGlyph(x, 34 + r * 74, ch, keys[ch] ?? 0); }
  // plugboard: jacks in keyboard order, ten cables
  rrect(-336, 262, 672, 134, 10); ctx.fillStyle = '#0F110D'; ctx.fill(); ctx.strokeStyle = C.brassDk; ctx.lineWidth = 2; ctx.stroke();
  const JP = {};
  ROWS.forEach((row, r) => [...row].forEach((ch, i) => { JP[ch] = [(i - (row.length - 1) / 2) * 70, 292 + r * 38]; }));
  for (const ch of AB) { const [x, y] = JP[ch]; ctx.fillStyle = '#050605'; ctx.beginPath(); ctx.arc(x - 6, y, 4.5, 0, Math.PI * 2); ctx.arc(x + 6, y, 4.5, 0, Math.PI * 2); ctx.fill(); }
  if (cables > 0) A(cables, () => {
    for (const pr of D.DAY.plugs.split(' ')) {
      const [x0, y0] = JP[pr[0]], [x1, y1] = JP[pr[1]];
      ctx.strokeStyle = '#5E2419'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0, y0 + 70, x1, y1 + 70, x1, y1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,170,140,0.25)'; ctx.lineWidth = 2; ctx.stroke();
      for (const [x, y] of [[x0, y0], [x1, y1]]) { ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.brassDk; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    }
  });
  ctx.restore();
}
/** Where a machine part sits on screen, for callouts. */
const mPos = (cx, cy, sc, x, y) => [cx + x * sc, cy + y * sc];

// A run of key presses as a function of time: presses at times ts, each with its record; returns machine options.
function pressState(t, ts, recs, startWin) {
  let win = startWin, from = null, roll = 1, lit = {}, keys = {};
  for (let i = 0; i < ts.length; i++) {
    const t0 = ts[i]; if (t < t0) break;
    from = i === 0 ? startWin : recs[i - 1].windows; win = recs[i].windows; roll = seg(t, t0, t0 + 0.28);
    const next = i + 1 < ts.length ? ts[i + 1] : Infinity;
    keys = { [recs[i].key]: 1 - seg(t, Math.min(t0 + 0.32, next - 0.05), Math.min(t0 + 0.5, next)) };
    lit = { [recs[i].out]: seg(t, t0 + 0.12, t0 + 0.3) * (1 - seg(t, next - 0.12, next)) };
  }
  return { win, from, roll, lit, keys };
}

// ---------- the inside view: the current's path ----------
const PD = { keyX: 1000, plugA: 1036, plugB: 1112, rot: [[1170, 1270], [1340, 1440], [1510, 1610]], refX: 1668, y0: 190, dy: 28.6 };
const PY = (i) => PD.y0 + i * PD.dy;
const ROT_NAMES = ['III', 'II', 'I']; // right, middle, left: the order the current meets them
/** The path of one key press as points, with the index where the return leg starts. */
function pathOf(pr) {
  const k0 = ix(pr.key), tr = pr.trace, lamp = ix(pr.out), [R, M, L] = PD.rot;
  const pts = [[PD.keyX, PY(k0)], [PD.plugA, PY(k0)], [PD.plugB, PY(pr.plugIn)], [R[0], PY(pr.plugIn)], [R[1], PY(tr[0])], [M[0], PY(tr[0])], [M[1], PY(tr[1])], [L[0], PY(tr[1])], [L[1], PY(tr[2])], [PD.refX, PY(tr[2])]];
  const ya = PY(tr[2]), yb = PY(tr[3]), bulge = 30 + Math.abs(tr[3] - tr[2]) * 4.2;
  for (let i = 1; i <= 12; i++) { const u = i / 12; pts.push([PD.refX + 2 * u * (1 - u) * bulge, lerp(ya, yb, u)]); }
  const turn = pts.length - 1;
  pts.push([L[1], PY(tr[3])], [L[0], PY(tr[4])], [M[1], PY(tr[4])], [M[0], PY(tr[5])], [R[1], PY(tr[5])], [R[0], PY(tr[6])], [PD.plugB, PY(tr[6])], [PD.plugA, PY(lamp)], [PD.keyX, PY(lamp)]);
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len.at(-1), f = (i) => len[i] / total;
  // chips: the letter at each stage, where it is shown, and when the pulse reaches it
  const chips = [
    [pr.key, PD.keyX - 46, PY(k0), 0, 'f'], [AB[pr.plugIn], (PD.plugB + R[0]) / 2, PY(pr.plugIn), f(3), 'f'],
    [AB[tr[0]], (R[1] + M[0]) / 2, PY(tr[0]), f(5), 'f'], [AB[tr[1]], (M[1] + L[0]) / 2, PY(tr[1]), f(7), 'f'], [AB[tr[2]], (L[1] + PD.refX) / 2 + 4, PY(tr[2]), f(9), 'f'],
    [AB[tr[3]], (L[1] + PD.refX) / 2 + 4, PY(tr[3]), f(turn + 1), 'b'], [AB[tr[4]], (M[1] + L[0]) / 2, PY(tr[4]), f(turn + 3), 'b'], [AB[tr[5]], (R[1] + M[0]) / 2, PY(tr[5]), f(turn + 5), 'b'],
    [AB[tr[6]], (PD.plugB + R[0]) / 2, PY(tr[6]), f(turn + 7), 'b'], [pr.out, PD.keyX - 46, PY(lamp), 1, 'b'],
  ];
  return { pts, len, total, turn, chips, marks: { plug: f(3), ref: f(9), back: f(turn + 7), end: 1 } };
}
/** Draw the traversed part of a path up to fraction prog, glowing; the return leg in a second colour. */
function drawPulse(P, prog, { a = 1, width = 6, chips = true, from = 0 } = {}) {
  if (prog <= 0) return;
  const L = prog * P.total, L0 = from * P.total;
  A(a, () => {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [col, i0, i1] of [[C.fwd, 0, P.turn], [C.bwd, P.turn, P.pts.length - 1]]) {
      ctx.strokeStyle = col; ctx.lineWidth = width; ctx.shadowColor = col; ctx.shadowBlur = 16;
      ctx.beginPath(); let started = false, hx = null, hy = null;
      for (let i = i0; i < i1; i++) {
        const la = P.len[i], lb = P.len[i + 1];
        if (lb < L0 || la > L) continue;
        const u0 = clamp((L0 - la) / (lb - la)), u1 = clamp((L - la) / (lb - la));
        const [x0, y0] = P.pts[i], [x1, y1] = P.pts[i + 1];
        const ax = lerp(x0, x1, u0), ay = lerp(y0, y1, u0), bx = lerp(x0, x1, u1), by = lerp(y0, y1, u1);
        if (!started) { ctx.moveTo(ax, ay); started = true; }
        ctx.lineTo(bx, by); hx = bx; hy = by;
      }
      if (started) ctx.stroke();
      if (hx !== null && L < P.total && L <= P.len[i1] && L >= P.len[i0]) { ctx.fillStyle = C.lampHot; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    if (chips) for (const [ch, x, y, f, kind] of P.chips) {
      const c = seg(prog, f - 0.001, f + 0.04);
      if (c > 0) A(c, () => chip(ch, x, y - 24, { size: 32, bg: C.paper, edge: kind === 'f' ? C.fwd : C.bwd, padX: 9 }));
    }
  });
}
/** The inside view: plugboard, three rotors (cores c, fractional while stepping), reflector B. */
function diagram(t, { a = 1, cores = [0, 0, 0], hiPlug = [], dimWires = 1, labels = 1 } = {}) {
  A(a, () => {
    const [R, M, L] = PD.rot;
    // key/lamp contacts
    for (let i = 0; i < 26; i++) { ctx.fillStyle = C.creamFaint; ctx.beginPath(); ctx.arc(PD.keyX, PY(i), 3.5, 0, Math.PI * 2); ctx.fill(); }
    // plugboard
    ctx.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const j = PLUG[i], hot = hiPlug.includes(i);
      ctx.strokeStyle = hot ? C.brassHi : (j === i ? 'rgba(239,231,209,0.16)' : 'rgba(201,162,76,0.42)');
      ctx.lineWidth = hot ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(PD.keyX, PY(i)); ctx.lineTo(PD.plugA, PY(i)); ctx.lineTo(PD.plugB, PY(j)); ctx.lineTo(R[0] - 6, PY(j)); ctx.stroke();
    }
    // rotors
    PD.rot.forEach(([x0, x1], ri) => {
      const name = ROT_NAMES[ri], c = cores[2 - ri];
      rrect(x0 - 8, PY(-0.8), x1 - x0 + 16, PY(25.8) - PY(-0.8), 10); ctx.fillStyle = '#10130E'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = C.brassDk; ctx.stroke();
      ctx.save(); rrect(x0 - 6, PY(-0.7), x1 - x0 + 12, PY(25.7) - PY(-0.7), 9); ctx.clip();
      ctx.lineWidth = 1.4; ctx.strokeStyle = `rgba(239,231,209,${0.13 * dimWires})`;
      ctx.beginPath();
      for (let p = 0; p < 26; p++) {
        const ea = p - c, eb = FWD[name][p] - c;
        for (const kk of [-26, 0, 26]) { const ya = PY(ea + kk), yb = PY(eb + kk); if (Math.max(ya, yb) < PY(-1) || Math.min(ya, yb) > PY(26)) continue; ctx.moveTo(x0, ya); ctx.lineTo(x1, yb); }
      }
      ctx.stroke();
      // contacts, scrolling with the rotor
      for (let p = 0; p < 26; p++) for (const kk of [-26, 0, 26]) {
        const y = PY(p - c + kk); if (y < PY(-0.6) || y > PY(25.6)) continue;
        ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(x0, y, 3.4, 0, Math.PI * 2); ctx.arc(x1, y, 3.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      if (labels > 0) A(labels, () => label(name, (x0 + x1) / 2, PY(-0.8) - 30, { size: 34, color: C.brassHi, weight: 700 }));
    });
    // reflector B: 13 pairs
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(201,162,76,0.45)';
    for (let i = 0; i < 26; i++) {
      const j = REF[i]; if (j < i) continue;
      const ya = PY(i), yb = PY(j), bulge = 30 + (j - i) * 4.2;
      ctx.beginPath(); ctx.moveTo(PD.refX, ya); ctx.quadraticCurveTo(PD.refX + bulge, (ya + yb) / 2, PD.refX, yb); ctx.stroke();
    }
    ctx.fillStyle = C.brassDk; ctx.fillRect(PD.refX - 6, PY(-0.7), 6, PY(25.7) - PY(-0.7));
    if (labels > 0) A(labels, () => {
      label('plugs', (PD.keyX + PD.plugB) / 2 + 6, PY(-0.8) - 30, { size: 32, color: C.creamSoft });
      label('reflector', PD.refX + 66, PY(-0.8) - 30, { size: 32, color: C.creamSoft });
    });
  });
}

// ---------- the odometer: three rotor windows, large ----------
function drums(t, { a = 1, cx = 1400, cy = 470, from = 'ADU', to = 'ADU', roll = 1, notchHi = [0, 0, 0], twice = 0 }) {
  A(a, () => {
    const names = ['I', 'II', 'III'], notch = ['Q', 'E', 'V'];
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * 230;
      ctx.fillStyle = '#0D0F0B'; rrect(x - 90, cy - 150, 180, 300, 18); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.brassDk; ctx.stroke();
      // the tyre: letters rolling past the window
      ctx.save(); rrect(x - 70, cy - 130, 140, 260, 12); ctx.clip();
      const tg = ctx.createLinearGradient(0, cy - 130, 0, cy + 130); tg.addColorStop(0, '#6E6650'); tg.addColorStop(0.5, C.paper); tg.addColorStop(1, '#6E6650');
      ctx.fillStyle = tg; ctx.fillRect(x - 70, cy - 130, 140, 260);
      const p = from[i] !== to[i] ? eio(clamp(roll)) : 1, base = ix(from[i]) + (ix(to[i]) - ix(from[i]) + 26) % 26 * p;
      font(700, 96, MONO);
      for (let d = -2; d <= 2; d++) {
        const v = Math.floor(base) + d, off = (v - base) * 120;
        text(AB[mod(v)], x, cy + off + 4, { color: C.ink, align: 'center' });
      }
      ctx.restore();
      ctx.lineWidth = 5; ctx.strokeStyle = C.brass; rrect(x - 74, cy - 62, 148, 124, 10); ctx.stroke();
      label(names[i], x, cy + 196, { size: 40, color: C.brassHi, weight: 700 });
      const nh = notchHi[i];
      chip(`notch ${notch[i]}`, x, cy - 196, { size: 32, bg: nh > 0 ? `rgba(242,181,68,${0.25 + 0.75 * nh})` : 'rgba(239,231,209,0.12)', fg: nh > 0.5 ? C.ink : C.creamSoft, family: SLAB, weight: 600 });
    }
    if (twice > 0) A(twice, () => {
      const x = cx; ctx.strokeStyle = C.red; ctx.lineWidth = 5;
      rrect(x - 100, cy - 160, 200, 320, 22); ctx.stroke();
      chip('stepped twice in a row', x, cy + 262, { size: 34, bg: C.red, fg: C.cream, family: SLAB });
    });
  });
}

// ---------- layout of parts ----------
const at0 = (n) => CH[n - 1].at;
function header(t) {
  let ch = null; for (const c of CH) if (t >= c.at + 3.0) ch = c;
  if (!ch || t > e('f10', 1.2)) return;
  A(seg(t, ch.at + 3.0, ch.at + 3.9) * (1 - seg(t, e('f10', 0.4), e('f10', 1.2))), () => {
    font(600, 32, MONO); text(`PART ${ch.n}`, 96, 92, { color: C.brass, spacing: '3px', base: 'middle' });
    const w = ctx.measureText(`PART ${ch.n}`).width;
    font(600, 32, SLAB); text(ch.title, 96 + w + 28, 92, { color: C.creamFaint, base: 'middle' });
  });
}
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.45, 0.55);
    if (a <= 0) continue;
    A(a * 0.8, () => { ctx.fillStyle = 'rgba(8,10,7,0.86)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      const w = 1040, h = 400, x = (W - w) / 2, y = (H - h) / 2 + (1 - p) * 26;
      paper(x, y, w, h, { tilt: -0.012 });
      ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.rotate(-0.012);
      ctx.fillStyle = 'rgba(42,40,32,0.85)'; ctx.fillRect(-w / 2, -h / 2, w, 70);
      mono(`PART ${ch.n} OF ${CH.length}`, -w / 2 + 40, -h / 2 + 36, { size: 32, color: C.paper, align: 'left', weight: 600, spacing: '3px' });
      // rotor-ring numbers along the band's right end, a nod to the machine's numbered rings
      font(500, 32, MONO); text(String(ch.n).padStart(2, '0'), w / 2 - 44, -h / 2 + 36, { color: C.brassHi, align: 'right' });
      label(ch.title, 0, 42, { size: ch.title.length > 14 ? 92 : 108, color: C.ink, weight: 800 });
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-160, 128); ctx.lineTo(160, 128); ctx.stroke();
      ctx.restore();
    });
  }
}

// ---------- 0: cold open ----------
const M0 = { cx: 470, cy: 560, sc: 0.9 };
const openTimes = () => [at('o1', 0.45), at('o2', 0.3), at('o2', 0.56), at('o2', 0.68), at('o2', 0.8), at('o2', 0.92)];
/** A pressed again and again from time t0, a lamp every 1/rate s (the AREP sequence); returns machine options. */
function hammerA(t, t0, rate = 5) {
  if (t < t0) return null;
  const n = Math.floor((t - t0) * rate), f = (t - t0) * rate - n;
  return { lit: { [AREP[n % AREP.length]]: 1 - f * 0.6 }, keys: { A: f < 0.5 ? 1 : 0.4 } };
}
function partOpen(t) {
  const ts = openTimes(), st = pressState(t, ts, D.presses, 'AAA');
  const ham = hammerA(t, s('o4', 0.3));
  const ringA = seg(t, s('o4', 0.6), s('o4', 1.0));
  A(eout(seg(t, 0.15, 1.3)), () => machine(t, { ...M0, ...st, ...(ham ?? {}), ring: ringA > 0 ? { A: `rgba(210,69,47,${ringA})` } : {} }));
  // right: the two rows the operators would write
  const stripA = seg(t, s('o1', 0.2), s('o1', 0.9)) * (1 - seg(t, s('o3', 0.0), s('o3', 0.6)));
  if (stripA > 0) A(stripA, () => {
    paper(1010, 330, 780, 300, { tilt: 0.008 });
    ctx.save(); ctx.translate(1400, 480); ctx.rotate(0.008);
    label('key', -300, -62, { size: 36, color: C.inkSoft, align: 'left' });
    label('lamp', -300, 62, { size: 36, color: C.inkSoft, align: 'left' });
    for (let i = 0; i < 6; i++) {
      if (t < ts[i]) continue;
      const a = seg(t, ts[i], ts[i] + 0.2), x = -150 + i * 84;
      A(a, () => { mono('A', x, -62, { size: 56, color: C.ink, weight: 600 }); });
      A(seg(t, ts[i] + 0.15, ts[i] + 0.35), () => { mono(D.presses[i].out, x, 62, { size: 56, color: '#8A5A0E', weight: 700 }); });
    }
    ctx.restore();
  });
  // the number
  const nA = seg(t, s('o3', 0.2), s('o3', 0.8)) * (1 - seg(t, s('o4', 0.0), s('o4', 0.5)));
  if (nA > 0) A(nA, () => {
    const n = typed(t, s('o3', 0.35), 26);
    mono(BIG.slice(0, n), 1410, 450, { size: 50, color: C.brassHi, weight: 600 });
    label('possible settings', 1410, 540, { size: 44, color: C.cream });
    label('army Enigma, ten plugboard cables', 1410, 600, { size: 34, color: C.creamFaint });
  });
  // never itself
  const vA = seg(t, s('o4', 0.3), s('o4', 0.8)) * (1 - seg(t, s('o5', 0.0), s('o5', 0.6)));
  if (vA > 0) A(vA, () => {
    label('A', 1240, 470, { size: 120, color: C.cream, weight: 700, family: MONO });
    arrow(1305, 470, 1475, 470, { color: C.creamSoft, w: 6, head: 26 });
    label('A', 1560, 470, { size: 120, color: C.cream, weight: 700, family: MONO });
    cross(1560, 470, 62, seg(t, s('o4', 0.9), s('o4', 1.5)), C.red, 10);
    label('never itself', 1410, 620, { size: 48, color: C.creamSoft, weight: 500 });
  });
  // the title
  const tA = eout(seg(t, s('o5', 0.6), s('o5', 1.6)));
  if (tA > 0) A(tA, () => {
    label('ENIGMA', 1410, 430 + (1 - tA) * 20, { size: 120, color: C.cream, weight: 800, spacing: '14px' });
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1230, 510); ctx.lineTo(1590, 510); ctx.stroke();
    label('The letter that never came out as itself', 1410, 572, { size: 40, color: C.creamSoft, weight: 500 });
  });
}

// ---------- 1: one key press ----------
const stepTimes = () => [at('k9', 0.3), at('k9', 0.66), at('k10', 0.3), at('k10', 0.66), at('k11', 0.12)];
function partKey(t) {
  const p1 = at('k3', 0.55), p2 = at('k8', 0.3), P1 = pathOf(D.presses[0]), P2 = pathOf(D.presses[1]);
  // pulse of the first press, staged over four lines
  const m = P1.marks;
  const prog1 = t < at('k4', 0.2) ? 0
    : t < s('k5') ? lerp(0, m.plug, eio(seg(t, at('k4', 0.2), at('k4', 0.85))))
    : t < s('k6') ? lerp(m.plug, m.ref, eio(seg(t, at('k5', 0.05), at('k5', 0.9))))
    : t < s('k7') ? lerp(m.ref, m.back, eio(seg(t, at('k6', 0.05), at('k6', 0.9))))
    : lerp(m.back, 1, eio(seg(t, at('k7', 0.0), at('k7', 0.35))));
  const prog2 = eio(seg(t, at('k8', 0.42), at('k8', 0.92)));
  // the machine
  let mo;
  if (t < s('k9')) {
    const win = t < p1 ? 'AAA' : t < p2 ? 'AAB' : 'AAC', from = t < p2 ? 'AAA' : 'AAB', roll = t < p2 ? seg(t, p1, p1 + 0.3) : seg(t, p2, p2 + 0.3);
    const keys = { A: t >= p2 ? 1 - seg(t, at('k8', 0.95), e('k8', 0.3)) : t >= p1 ? 1 - seg(t, at('k7', 0.6), at('k7', 0.85)) : 0 };
    const lit = t >= p2 ? { N: seg(t, at('k8', 0.88), at('k8', 0.96)) * (1 - seg(t, e('k8', 0.2), e('k8', 0.5))), C: 1 - seg(t, p2 - 0.3, p2) } : { C: seg(t, at('k7', 0.25), at('k7', 0.38)) };
    mo = { win, from: t < p1 ? null : from, roll, keys, lit };
  } else {
    const st = pressState(t, stepTimes(), D.steps.slice(1), 'ADU');
    mo = { ...st, win: st.win, from: st.from ?? 'ADU' };
    if (t < stepTimes()[0]) mo.from = null;
  }
  // window letters change from AAC to ADU under a crossfade at k9
  A(1, () => machine(t, { ...M0, ...mo }));
  // k1: callouts
  const cA = seg(t, s('k1', 0.3), s('k1', 1.0)) * (1 - seg(t, s('k3'), s('k3', 0.5)));
  if (cA > 0) A(cA, () => {
    const items = [['rotors', -326, 0], ['26 lamps', -124, 0.25], ['26 keys', 108, 0.5], ['plugboard', 330, 0.75]];
    for (const [name, y, d] of items) {
      const a = seg(t, s('k1', 0.4 + d * 1.2), s('k1', 0.9 + d * 1.2)), [xm, ym] = mPos(M0.cx, M0.cy, M0.sc, 300, y);
      A(a, () => {
        ctx.strokeStyle = C.brass; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xm, ym); ctx.lineTo(905, ym); ctx.stroke();
        ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(xm, ym, 6, 0, Math.PI * 2); ctx.fill();
        label(name, 925, ym, { size: 42, color: C.cream, align: 'left' });
      });
    }
    // the second operator's pad: the lamps from the opening, written down
    const pa = seg(t, at('k1', 0.55), at('k1', 0.8));
    A(pa, () => {
      paper(1330, 330, 420, 360, { tilt: -0.02 });
      ctx.save(); ctx.translate(1540, 510); ctx.rotate(-0.02);
      label('lamps lit', 0, -120, { size: 36, color: C.inkSoft });
      ctx.strokeStyle = C.paperLine; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-170, -60 + i * 56); ctx.lineTo(170, -60 + i * 56); ctx.stroke(); }
      const n = typed(t, at('k1', 0.7), 5);
      mono(D.presses.map((p) => p.out).join(' ').slice(0, n * 2), -150, -14, { size: 52, color: C.ink, align: 'left', weight: 600 });
      ctx.restore();
    });
  });
  // k3-k8: the inside view
  const dA = seg(t, s('k3', 0.1), s('k3', 0.8)) * (1 - seg(t, s('k9'), s('k9', 0.6)));
  if (dA > 0) {
    const core = t < p2 ? 0 + eio(seg(t, p1, p1 + 0.45)) : 1 + eio(seg(t, p2, p2 + 0.45));
    const hiPlug = t > s('k4') && t < s('k8') ? [ix('A'), ix('Q')] : t >= p2 ? [ix('A'), ix('Q')] : [];
    diagram(t, { a: dA, cores: [0, 0, core], hiPlug });
    A(dA, () => {
      drawPulse(P1, prog1, { a: 1 - seg(t, p2 - 0.4, p2) });
      if (t >= p2) drawPulse(P2, prog2);
    });
    // stage labels under the view
    const labs = [['k4', 'plugboard'], ['k5', 'three rotors'], ['k6', 'reflector, and back'], ['k7', 'lamp']];
    for (const [key, str] of labs) A(dA * span(t, s(key, 0.1), e(key, -0.1), 0.3, 0.3), () => label(str, 1400, 960, { size: 36, color: C.creamSoft }));
    A(dA * span(t, s('k8', 0.2), e('k8'), 0.3, 0.3), () => label('the right rotor has stepped', 1400, 960, { size: 36, color: C.creamSoft }));
  }
  // k9-k11: the rotor windows, large
  const oA = seg(t, s('k9', 0.2), s('k9', 0.9));
  if (oA > 0) {
    const ts = stepTimes(), seq = D.steps.map((x) => x.windows);
    let i = 0; while (i < ts.length && t >= ts[i]) i++;
    const from = seq[Math.max(0, i - 1)], to = seq[i], roll = i === 0 ? 1 : seg(t, ts[i - 1], ts[i - 1] + 0.45);
    const cur = i === 0 ? seq[0] : to;
    const notchHi = [0, cur[1] === 'E' ? 1 : 0, cur[2] === 'V' ? 1 : 0].map((v) => v * (i > 0 ? seg(t, ts[i - 1] + 0.3, ts[i - 1] + 0.6) : 1));
    drums(t, { a: oA, from: i === 0 ? seq[0] : from, to: cur, roll, notchHi, twice: seg(t, ts[2] + 0.3, ts[2] + 0.7) * (1 - seg(t, s('k11'), s('k11', 0.5))) });
    A(oA * seg(t, s('k11', 0.4), s('k11', 1.0)), () => {
      mono('26 × 25 × 26 = ' + fmt(D.period), 1400, 850, { size: 50, color: C.brassHi, weight: 600 });
      label('key presses before the rotors repeat', 1400, 925, { size: 34, color: C.creamSoft });
    });
  }
}

// ---------- 2: the reflector ----------
function ringGeom(i) { const a = -Math.PI / 2 + (i / 26) * Math.PI * 2; return [Math.cos(a), Math.sin(a)]; }
function reflectorRing(t, { a = 1, cx = 1400, cy = 520, R = 260, draw = 1, hi = -1 } = {}) {
  A(a, () => {
    ctx.strokeStyle = C.brassDk; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, R + 4, 0, Math.PI * 2); ctx.stroke();
    let n = 0;
    for (let i = 0; i < 26; i++) {
      const j = REF[i]; if (j < i) continue;
      const p = clamp(draw * 13 - n); n++;
      if (p <= 0) continue;
      const [ax, ay] = ringGeom(i), [bx, by] = ringGeom(j), hot = i === hi || j === hi;
      ctx.strokeStyle = hot ? C.fwd : C.brass; ctx.lineWidth = hot ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(cx + ax * R, cy + ay * R);
      const mx = cx + (ax + bx) * R * 0.18, my = cy + (ay + by) * R * 0.18;
      const q = eio(p), ex = lerp(cx + ax * R, cx + bx * R, q), ey = lerp(cy + ay * R, cy + by * R, q);
      // a curve through the middle; drawn partly while it grows
      ctx.quadraticCurveTo(lerp(cx + ax * R, mx, q), lerp(cy + ay * R, my, q), ex, ey); ctx.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const [ux, uy] = ringGeom(i);
      ctx.fillStyle = C.brassHi; ctx.beginPath(); ctx.arc(cx + ux * R, cy + uy * R, 6, 0, Math.PI * 2); ctx.fill();
      mono(AB[i], cx + ux * (R + 40), cy + uy * (R + 40), { size: 34, color: i === hi ? C.fwd : C.cream, weight: 600 });
    }
  });
}
function partReflector(t) {
  // the machine: r2 press C (lights A); r3 typing; r4 A with a question; r7 A hammered
  let mo = { win: 'AAB' };
  if (t >= at('r2', 0.35) && t < s('r3')) mo = { win: 'AAB', keys: { C: 1 - seg(t, e('r2', -0.2), e('r2', 0.2)) }, lit: { A: seg(t, at('r2', 0.9), at('r2', 0.97)) * (1 - seg(t, e('r2', 0.0), e('r2', 0.4))) } };
  if (t >= s('r3') && t < s('r4')) {
    const word = D.word, i = Math.floor((t - at('r3', 0.15)) / 0.28);
    if (i >= 0 && i < 6) mo = { win: 'AAB', keys: { [word[i]]: 1 }, lit: { [D.wordC[i]]: 1 } };
  }
  if (t >= s('r4') && t < s('r7')) mo = { win: 'AAB', keys: { A: seg(t, s('r4', 0.2), s('r4', 0.5)) * (1 - seg(t, e('r4'), e('r4', 0.4))) }, ring: { A: `rgba(239,231,209,${seg(t, s('r4', 0.4), s('r4', 0.9)) * (1 - seg(t, s('r5'), s('r5', 0.5)))})` } };
  const ham = hammerA(t, s('r7', 0.2), 4);
  if (ham && t < s('r9')) mo = { win: 'AAB', ...ham, ring: { A: `rgba(210,69,47,${seg(t, s('r7', 0.3), s('r7', 0.8))})` } };
  machine(t, { ...M0, ...mo });
  // r1: the reflector as a ring of 13 pairs
  const rA = seg(t, s('r1', 0.1), s('r1', 0.7)) * (1 - seg(t, s('r2'), s('r2', 0.5)));
  if (rA > 0) {
    reflectorRing(t, { a: rA, draw: seg(t, s('r1', 0.3), e('r1', -0.3)) });
    A(rA, () => label('reflector B: 13 pairs', 1400, 925, { size: 36, color: C.creamSoft }));
  }
  // r2: the same path, backwards
  const P1 = pathOf(D.presses[0]), PB = pathOf(D.back);
  const d2 = seg(t, s('r2', 0.0), s('r2', 0.6)) * (1 - seg(t, s('r3'), s('r3', 0.5)));
  if (d2 > 0) {
    diagram(t, { a: d2, cores: D.presses[0].core });
    A(d2, () => {
      drawPulse(P1, 1, { a: 0.3, chips: false, width: 4 });
      drawPulse(PB, eio(seg(t, at('r2', 0.4), at('r2', 0.95))));
      label('same setting: C lights A', 1400, 960, { size: 36, color: C.creamSoft });
    });
  }
  // r3: sender and receiver
  const mA = seg(t, s('r3', 0.0), s('r3', 0.6)) * (1 - seg(t, s('r4'), s('r4', 0.5)));
  if (mA > 0) A(mA, () => {
    const rows = [['sender types', D.word, 'lamps', D.wordC, 230, at('r3', 0.15)], ['receiver types', D.wordC, 'lamps', D.word, 560, at('r3', 0.55)]];
    for (const [l1, w1, l2, w2, y, t0] of rows) {
      paper(1000, y, 800, 250, { tilt: y > 400 ? 0.006 : -0.006 });
      label(l1, 1050, y + 70, { size: 34, color: C.inkSoft, align: 'left' });
      label(l2, 1050, y + 180, { size: 34, color: C.inkSoft, align: 'left' });
      const n = typed(t, t0, 1 / 0.28);
      strip(w1, 1320, y + 70, 70, { size: 54, show: n, fg: C.ink });
      strip(w2, 1320, y + 180, 70, { size: 54, show: n, fg: '#8A5A0E', weight: 700 });
    }
  });
  // r4: the question
  const qA = seg(t, s('r4', 0.2), s('r4', 0.7)) * (1 - seg(t, s('r5'), s('r5', 0.5)));
  if (qA > 0) A(qA, () => {
    label('A', 1240, 500, { size: 120, color: C.cream, weight: 700, family: MONO });
    arrow(1305, 500, 1475, 500, { color: C.creamSoft, w: 6, head: 26 });
    label('A ?', 1590, 500, { size: 120, color: C.cream, weight: 700, family: MONO });
  });
  // r5-r6: why not: the way back would have to be the way in
  const wA = seg(t, s('r5', 0.0), s('r5', 0.6)) * (1 - seg(t, s('r7'), s('r7', 0.5)));
  if (wA > 0) {
    diagram(t, { a: wA, cores: D.presses[0].core });
    A(wA, () => {
      const m = P1.marks;
      drawPulse(P1, m.ref, { chips: false });
      // the forward route, dashed and red, running back on itself
      const back = eio(seg(t, at('r5', 0.35), at('r5', 0.9)));
      if (back > 0) {
        ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath();
        const L = back * P1.len[9];
        for (let i = 9; i > 0; i--) { const la = P1.len[i] - P1.len[i - 1]; const done = P1.len[9] - P1.len[i]; if (done > L) break; const u = clamp((L - done) / la); const [x0, y0] = P1.pts[i], [x1, y1] = P1.pts[i - 1]; if (i === 9) ctx.moveTo(x0 + 8, y0 + 8); ctx.lineTo(lerp(x0, x1, u) + 8, lerp(y0, y1, u) + 8); }
        ctx.stroke(); ctx.restore();
      }
      const zA = seg(t, s('r6', 0.1), s('r6', 0.5));
      if (zA > 0) A(zA, () => {
        const y = PY(D.presses[0].trace[2]);
        ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(PD.refX + 26, y, 22, 0, Math.PI * 2); ctx.stroke();
        cross(PD.refX + 26, y, 26, seg(t, s('r6', 0.4), s('r6', 0.9)), C.red, 7);
        label('no letter is paired with itself', 1400, 960, { size: 36, color: C.cream });
      });
      A(span(t, s('r5', 0.3), s('r6', 0.1), 0.3, 0.3), () => label('back along the same wires?', 1400, 960, { size: 36, color: C.creamSoft }));
    });
  }
  // r7: A, pressed again and again
  const hA = seg(t, s('r7', 0.0), s('r7', 0.6)) * (1 - seg(t, s('r8'), s('r8', 0.5)));
  if (hA > 0) A(hA, () => {
    label('A pressed again and again lights', 1400, 230, { size: 38, color: C.creamSoft });
    const n = Math.max(0, Math.floor((t - s('r7', 0.2)) * 4) + 1);
    for (let i = 0; i < Math.min(n, 48); i++) {
      const x = 1072 + (i % 12) * 60, y = 330 + Math.floor(i / 12) * 84;
      A(seg(t, s('r7', 0.2) + i / 4, s('r7', 0.2) + i / 4 + 0.2), () => mono(AREP[i], x, y, { size: 48, color: C.lamp, weight: 600 }));
    }
    A(seg(t, at('r7', 0.6), at('r7', 0.9)), () => label('any letter but A', 1400, 760, { size: 48, color: C.cream, weight: 700 }));
  });
  // r8: every key at every position
  const cA = seg(t, s('r8', 0.0), s('r8', 0.5)) * (1 - seg(t, s('r9'), s('r9', 0.5)));
  if (cA > 0) A(cA, () => {
    mono(`${fmt(17576)} positions × 26 keys`, 1400, 330, { size: 48, color: C.cream });
    A(seg(t, at('r8', 0.3), at('r8', 0.5)), () => mono(`= ${fmt(D.selfTests)} presses`, 1400, 430, { size: 48, color: C.brassHi }));
    A(seg(t, at('r8', 0.6), at('r8', 0.8)), () => {
      mono('0', 1400, 600, { size: 140, color: C.green, weight: 700 });
      label('lit their own lamp', 1400, 720, { size: 40, color: C.cream });
    });
  });
  // r9: the plugboard swaps in and swaps back
  const pA = seg(t, s('r9', 0.0), s('r9', 0.5));
  if (pA > 0) A(pA, () => {
    const x = 1400, p = (i) => seg(t, at('r9', 0.05 + i * 0.13), at('r9', 0.18 + i * 0.13));
    const down = (y0, y1, lab) => { arrow(x, y0, x, y1, { color: C.brass, w: 4, head: 16 }); if (lab) label(lab, x + 30, (y0 + y1) / 2, { size: 32, color: C.creamSoft, align: 'left' }); };
    A(p(0), () => chip('A', x, 210, { size: 48, bg: C.paper }));
    A(p(1), () => { down(250, 318, 'plug: swapped'); chip('Q', x, 360, { size: 48, bg: C.paper }); });
    A(p(2), () => { down(400, 448, null); rrect(x - 210, 458, 420, 90, 12); ctx.fillStyle = '#10130E'; ctx.fill(); ctx.strokeStyle = C.brassDk; ctx.lineWidth = 3; ctx.stroke(); label('rotors and reflector', x, 503, { size: 36, color: C.cream }); });
    A(p(3), () => { down(558, 608, null); chip('never Q', x, 650, { size: 44, bg: C.paper }); });
    A(p(4), () => { down(690, 758, 'plug: swapped back'); chip('never A', x, 800, { size: 44, bg: C.green, fg: C.ink }); });
  });
}

// ---------- 3: the number ----------
function partNumber(t) {
  A(seg(t, s('n1', 0.2), s('n1', 0.8)), () => label('Army and Air Force Enigma in the war: 3 rotors from 5, 10 plugboard cables', W / 2, 190, { size: 36, color: C.creamSoft }));
  const cards = [
    ['n2', 'rotor order', '5 × 4 × 3', '60'],
    ['n3', 'start positions', '26 × 26 × 26', fmt(17576)],
    ['n4', 'plugboard, 10 cables', '26! ÷ (6! · 10! · 2¹⁰)', '150,738,274,937,250'],
  ];
  const up = eio(seg(t, s('n6', 0.0), s('n6', 0.6)));
  cards.forEach(([key, title, formula, result], i) => {
    const a = seg(t, s(key, 0.0), s(key, 0.5)) * (1 - up * 0.85);
    if (a <= 0) return;
    const cx = 330 + i * 630, y = 280 - up * 40;
    A(a, () => {
      paper(cx - 280, y, 560, 340, { tilt: (i - 1) * 0.01 });
      label(title, cx, y + 58, { size: 38, color: C.inkSoft });
      // a small picture of the part
      if (i === 0) for (let j = 0; j < 5; j++) { const x = cx - 120 + j * 60, hot = j < 3; ctx.fillStyle = hot ? C.brass : 'rgba(42,40,32,0.25)'; ctx.beginPath(); ctx.arc(x, y + 128, 22, 0, Math.PI * 2); ctx.fill(); }
      if (i === 1) for (let j = 0; j < 3; j++) { const x = cx - 80 + j * 80; rrect(x - 26, y + 98, 52, 60, 6); ctx.fillStyle = C.ink; ctx.fill(); mono('?', x, y + 129, { size: 36, color: C.paper }); }
      if (i === 2) { ctx.strokeStyle = '#5E2419'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 90, y + 112); ctx.bezierCurveTo(cx - 90, y + 170, cx + 90, y + 170, cx + 90, y + 112); ctx.stroke(); for (const x of [cx - 90, cx + 90]) { ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(x, y + 112, 12, 0, Math.PI * 2); ctx.fill(); } }
      mono(formula, cx, y + 210, { size: i === 2 ? 34 : 40, color: C.ink });
      mono(result, cx, y + 282, { size: i === 2 ? 40 : 56, color: '#7A4E0C', weight: 700 });
    });
    if (i < 2) A(seg(t, s(cards[i + 1][0], 0.0), s(cards[i + 1][0], 0.5)) * (1 - up), () => label('×', cx + 315, y + 170, { size: 72, color: C.brassHi, weight: 700 }));
  });
  const nA = seg(t, s('n5', 0.1), s('n5', 0.6)) * (1 - seg(t, s('n6', 0.0), s('n6', 0.5)));
  if (nA > 0) A(nA, () => {
    mono('= ' + BIG, W / 2, 740, { size: 66, color: C.brassHi, weight: 600 });
    label('nearly 159 quintillion, even before the ring settings', W / 2, 830, { size: 38, color: C.creamSoft });
  });
  const yA = seg(t, s('n6', 0.3), s('n6', 0.9)) * (1 - seg(t, s('n7', 0.3), s('n7', 0.9)));
  if (yA > 0) A(yA, () => {
    label('trying 1,000,000 settings every second', W / 2, 420, { size: 44, color: C.creamSoft });
    mono(`≈ ${(YEARS / 1e6).toFixed(2)} million years`, W / 2, 560, { size: 96, color: C.cream, weight: 600 });
  });
  const sA = seg(t, at('n7', 0.55), at('n7', 0.9));
  if (sA > 0) { stamp('SHORTCUTS', W / 2, 520, sA, { size: 80 }); A(sA, () => label('the first came from Poland', W / 2, 680, { size: 44, color: C.creamSoft })); }
}

// ---------- 4: Warsaw, 1932 ----------
function loopRing(cyc, cx, cy, r, { letters = null, mixB = 0, other = null, a = 1, col = C.brass } = {}) {
  A(a, () => {
    const n = cyc.length;
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i / n) * Math.PI * 2, x = n === 1 ? cx : cx + Math.cos(ang) * r, y = n === 1 ? cy : cy + Math.sin(ang) * r;
      // arrowhead along the circle, between this letter and the next
      const am = ang + Math.PI / n, hx = cx + Math.cos(am) * r, hy = cy + Math.sin(am) * r, ta = am + Math.PI / 2;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(hx + Math.cos(ta) * 9, hy + Math.sin(ta) * 9); ctx.lineTo(hx + Math.cos(ta + 2.4) * 9, hy + Math.sin(ta + 2.4) * 9); ctx.lineTo(hx + Math.cos(ta - 2.4) * 9, hy + Math.sin(ta - 2.4) * 9); ctx.fill();
      ctx.fillStyle = '#10130E'; ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
      if (other && mixB > 0) {
        A(1 - mixB, () => mono(AB[cyc[i]], x, y + 1, { size: 32, color: C.cream, weight: 600 }));
        A(mixB, () => mono(AB[other[i]], x, y + 1, { size: 32, color: C.lamp, weight: 600 }));
      } else mono(AB[cyc[i]], x, y + 1, { size: 32, color: C.cream, weight: 600 });
    }
  });
}
const SHEET_ROWS = [['31', 'I II III', 'WNM', 'HK CN IO FY JM LW', 'RAO'], ['30', 'III I II', 'CKU', 'CK IZ QT NP JY GW', 'VQN'], ['29', 'II III I', 'BHN', 'FR LY OX IT BM GJ', 'XIO']];
function partWarsaw(t) {
  // p1: the course
  const c1 = seg(t, s('p1', 0.1), s('p1', 0.7)) * (1 - seg(t, s('p3'), s('p3', 0.5)));
  if (c1 > 0) A(c1, () => {
    paper(120, 190, 900, 330, { tilt: -0.01 });
    ctx.save(); ctx.translate(570, 355); ctx.rotate(-0.01);
    mono('POZNAŃ · 1929', -400, -100, { size: 36, color: C.red, align: 'left', weight: 600, spacing: '3px' });
    label('a secret course in codebreaking', -400, -20, { size: 48, color: C.ink, align: 'left', weight: 700 });
    label('for mathematics students who knew German', -400, 60, { size: 36, color: C.inkSoft, align: 'left', weight: 500 });
    ctx.restore();
    stamp('1929', 1560, 330, seg(t, s('p1', 0.8), s('p1', 1.3)), { size: 72 });
  });
  // p2: three of them
  const names = [['Marian Rejewski', 'born 1905'], ['Jerzy Różycki', 'born 1909'], ['Henryk Zygalski', 'born 1908']];
  const c2 = seg(t, s('p2', 0.0), s('p2', 0.5)) * (1 - seg(t, s('p3'), s('p3', 0.5)));
  if (c2 > 0) A(c2, () => {
    names.forEach(([n, b], i) => {
      const a = seg(t, at('p2', 0.45 + i * 0.15), at('p2', 0.6 + i * 0.15)), x = 140 + i * 560;
      A(a, () => { paper(x, 600, 520, 170, { tilt: (i - 1) * 0.012 }); label(n, x + 260, 662, { size: 46, color: C.ink, weight: 700 }); label(b, x + 260, 722, { size: 32, color: C.inkSoft, weight: 500 }); });
    });
    A(seg(t, at('p2', 0.85), e('p2')), () => label('Polish Cipher Bureau, Warsaw, from September 1932', W / 2, 850, { size: 38, color: C.creamSoft }));
  });
  // p3-p6: the doubled key, the links, the loops
  const fA = seg(t, s('p3', 0.0), s('p3', 0.6)) * (1 - seg(t, s('p7'), s('p7', 0.5)));
  const ind = D.indicators[0];
  if (fA > 0) A(fA, () => {
    paper(120, 190, 760, 640, { tilt: -0.008 });
    ctx.save(); ctx.translate(500, 510); ctx.rotate(-0.008);
    label('one message, 1932', -330, -268, { size: 36, color: C.inkSoft, align: 'left' });
    label('start for everyone today', -330, -190, { size: 34, color: C.ink, align: 'left', weight: 500 });
    mono(D.GROUND, 300, -190, { size: 48, color: C.ink, align: 'right', weight: 700 });
    label('message key, typed twice', -330, -100, { size: 34, color: C.ink, align: 'left', weight: 500 });
    const n = typed(t, at('p3', 0.4), 6);
    strip((ind.key + ind.key).slice(0, n), -320, -24, 86, { size: 60, fg: C.red, weight: 700 });
    label('what is sent', -330, 80, { size: 34, color: C.ink, align: 'left', weight: 500 });
    const n2 = typed(t, at('p3', 0.75), 8);
    const hiA = seg(t, s('p4', 0.2), s('p4', 0.5));
    const cols = [C.fwd, C.red, C.greenDk];
    strip(ind.ind.slice(0, n2), -320, 160, 86, { size: 60, fg: C.ink, weight: 700, hi: (i) => (hiA > 0 ? `rgba(${i % 3 === 0 ? '242,181,68' : i % 3 === 1 ? '210,69,47' : '95,122,69'},${0.35 * hiA})` : null) });
    for (let j = 0; j < 3; j++) {
      const p = seg(t, at('p4', 0.15 + j * 0.25), at('p4', 0.4 + j * 0.25));
      if (p <= 0) continue;
      const x0 = -320 + j * 86 + 43, x1 = x0 + 3 * 86;
      ctx.strokeStyle = cols[j]; ctx.lineWidth = 5; ctx.beginPath();
      ctx.moveTo(x0, 212); ctx.quadraticCurveTo((x0 + x1) / 2, 212 + 70 + j * 18, lerp(x0, x1, eio(p)), 212 + (1 - Math.abs(2 * eio(p) - 1)) * 0); ctx.stroke();
    }
    ctx.restore();
  });
  // the day's indicators and the loops they make
  const lA = seg(t, s('p5', 0.0), s('p5', 0.5)) * (1 - seg(t, s('p7'), s('p7', 0.5)));
  if (lA > 0) A(lA, () => {
    label('a day’s indicators', 1400, 205, { size: 34, color: C.creamSoft });
    D.indicators.forEach((x, i) => {
      const a = seg(t, at('p5', 0.05 + i * 0.07), at('p5', 0.12 + i * 0.07)), cx = 1060 + (i % 2) * 400, cy = 270 + Math.floor(i / 2) * 70;
      A(a, () => strip(x.ind, cx, cy, 46, { size: 40, fg: C.cream, hi: (j) => (j === 0 || j === 3 ? 'rgba(242,181,68,0.45)' : null) }));
    });
    const mix = t > s('p6') ? 0.5 - 0.5 * Math.cos(Math.max(0, t - s('p6', 0.3)) * Math.PI / 1.4) : 0;
    // the loops side by side, each sized to its letters; equal lengths come in pairs
    const radius = (n) => (n === 1 ? 26 : n <= 3 ? 40 : n * 8.9), pad = (n) => (n === 1 ? 26 : 22), gapX = 14;
    let x = 0; const xs = D.AD.map((cyc) => { const r = radius(cyc.length) + pad(cyc.length), c = x + r; x += 2 * r + gapX; return c; });
    const x0 = 1400 - (x - gapX) / 2;
    D.AD.forEach((cyc, i) => {
      const a = seg(t, at('p5', 0.45 + i * 0.07), at('p5', 0.55 + i * 0.07)), cx = x0 + xs[i];
      loopRing(cyc, cx, 620, radius(cyc.length), { a, other: D.AD0[i], mixB: mix });
      A(a, () => label(String(cyc.length), cx, 765, { size: 44, color: C.brassHi, weight: 700 }));
    });
    A(seg(t, at('p5', 0.92), e('p5')), () => { label('loops come in pairs of equal length', 1400, 850, { size: 34, color: C.creamSoft }); });
    const tg = seg(t, s('p6', 0.1), s('p6', 0.5));
    if (tg > 0) A(tg, () => chip(mix > 0.5 ? 'plugboard: off' : 'plugboard: on', 1400, 935, { size: 34, family: SLAB, bg: mix > 0.5 ? C.lamp : C.paper }));
  });
  // p7: the theorem
  const qA = span(t, s('p7', 0.0), e('p7', 0.5), 0.5, 0.5);
  if (qA > 0) A(qA, () => {
    font(500, 76, SLAB); ctx.font = `italic 500 76px "${SLAB}"`;
    text('“the theorem that won World War Two”', W / 2, 470, { color: C.cream, align: 'center' });
    label('Cipher A. Deavours, on the permutation theorem Rejewski used', W / 2, 580, { size: 34, color: C.creamSoft, weight: 500 });
  });
  // p8-p10: the wiring was unknown; the spy's material
  const sA = seg(t, s('p8', 0.0), s('p8', 0.5)) * (1 - seg(t, s('p11'), s('p11', 0.5)));
  if (sA > 0) A(sA, () => {
    // three rotors with unknown wiring
    for (let i = 0; i < 3; i++) {
      const x = 260 + i * 200, y = 330, rot = t * 0.4 + i;
      ctx.fillStyle = '#10130E'; ctx.beginPath(); ctx.arc(x, y, 80, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = C.brass; ctx.stroke();
      for (let j = 0; j < 26; j++) { const a = rot + (j / 26) * Math.PI * 2; ctx.fillStyle = C.brassDk; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 66, y + Math.sin(a) * 66, 3, 0, Math.PI * 2); ctx.fill(); }
      label('?', x, y + 4, { size: 72, color: C.red, weight: 800 });
    }
    const flow = [['p9', 0.15, 'Hans-Thilo Schmidt', 'German Cipher Office'], ['p9', 0.5, 'French intelligence', 'bought his secrets'], ['p10', 0.2, 'Polish Cipher Bureau', 'December 1932']];
    flow.forEach(([key, f, a1, a2], i) => {
      const a = seg(t, at(key, f), at(key, f + 0.25)), y = 540 + i * 140;
      A(a, () => {
        paper(170, y - 52, 560, 104, { tilt: 0 });
        label(a1, 450, y - 14, { size: 38, color: C.ink, weight: 700 });
        label(a2, 450, y + 26, { size: 32, color: C.inkSoft, weight: 500 });
        if (i > 0) arrow(450, y - 88, 450, y - 58, { color: C.brass, w: 4, head: 14 });
      });
    });
    // an early key sheet, as the sources describe one
    const kA = seg(t, at('p9', 0.4), at('p9', 0.8));
    A(kA, () => {
      paper(975, 250, 845, 360, { tilt: 0.01 });
      ctx.save(); ctx.translate(975, 250); ctx.rotate(0.01);
      label('key sheet: one row a day', 422, 52, { size: 34, color: C.inkSoft });
      const xs = [36, 106, 290, 392, 752], heads = ['day', 'rotors', 'rings', 'plugboard', 'start'];
      heads.forEach((h, j) => label(h, xs[j], 120, { size: 32, color: C.inkSoft, align: 'left', weight: 600 }));
      ctx.strokeStyle = C.paperLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, 148); ctx.lineTo(815, 148); ctx.stroke();
      SHEET_ROWS.forEach((row, r) => row.forEach((c, j) => mono(c, xs[j], 196 + r * 56, { size: 32, color: C.ink, align: 'left', weight: 500 })));
      ctx.restore();
      label('an early key sheet, as the sources describe one', 1400, 660, { size: 32, color: C.creamFaint, weight: 500 });
    });
  });
  // p11: how the keys were wired in
  const eA = seg(t, s('p11', 0.0), s('p11', 0.5)) * (1 - seg(t, s('p12'), s('p12', 0.5)));
  if (eA > 0) A(eA, () => {
    label('keys wired into the machine in the order…', 1400, 230, { size: 36, color: C.creamSoft });
    label('of the commercial model’s keyboard', 1010, 340, { size: 34, color: C.cream, align: 'left', weight: 500 });
    strip('QWERTZUIOASDFGHJKPYXCVBNML', 1010, 410, 30, { size: 32, fg: C.creamSoft });
    cross(1760, 340, 18, seg(t, at('p11', 0.35), at('p11', 0.5)), C.red, 6);
    label('of the alphabet: Rejewski’s guess', 1010, 560, { size: 34, color: C.cream, align: 'left', weight: 500 });
    strip(AB, 1010, 630, 30, { size: 32, fg: C.lamp });
    tick(1765, 560, 18, seg(t, at('p11', 0.7), at('p11', 0.9)), C.green, 6);
  });
  // p12: all three rotors and the reflector
  const wA = seg(t, s('p12', 0.0), s('p12', 0.5));
  if (wA > 0) A(wA, () => {
    paper(990, 250, 820, 420, { tilt: -0.006 });
    const rows = [['I', EnigmaSim.ROTORS.I.wiring], ['II', EnigmaSim.ROTORS.II.wiring], ['III', EnigmaSim.ROTORS.III.wiring], ['A', EnigmaSim.REFLECTOR_A]];
    label('worked out by the end of 1932', 1400, 300, { size: 34, color: C.inkSoft });
    rows.forEach(([n, w], i) => {
      const n0 = typed(t, at('p12', 0.1 + i * 0.16), 60);
      label(n, 1050, 380 + i * 76, { size: 38, color: C.red, align: 'left', weight: 700 });
      mono(w.slice(0, n0), 1150, 380 + i * 76, { size: 34, color: C.ink, align: 'left', weight: 500 });
    });
    A(seg(t, at('p12', 0.85), e('p12')), () => label('the machine’s wiring, without seeing the machine', 1400, 730, { size: 34, color: C.creamSoft }));
  });
}

// ---------- 5: sheets and bombs ----------
const SH = { x: 1130, y: 214, cell: 23.5 };
function sheetGrid(grid, open, x, y, cell, { a = 1, mark = -1 } = {}) {
  A(a, () => {
    paper(x - 18, y - 18, cell * 26 + 36, cell * 26 + 36, { shadow: 0.35, r: 4 });
    // stacked sheets: the paper looks darker, and light comes only through holes open in every sheet
    if (open) { ctx.fillStyle = 'rgba(70,52,26,0.42)'; ctx.fillRect(x - 18, y - 18, cell * 26 + 36, cell * 26 + 36); }
    for (let i = 0; i < 676; i++) {
      const r = Math.floor(i / 26), c = i % 26, cx = x + c * cell + cell / 2, cy = y + r * cell + cell / 2;
      if (open && open[i]) continue;
      if (grid[i]) { ctx.fillStyle = 'rgba(32,25,14,0.85)'; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.33, 0, Math.PI * 2); ctx.fill(); }
    }
    if (open) for (let i = 0; i < 676; i++) {
      if (!open[i]) continue;
      const r = Math.floor(i / 26), c = i % 26, cx = x + c * cell + cell / 2, cy = y + r * cell + cell / 2;
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, cell * 1.3);
      g.addColorStop(0, 'rgba(255,226,140,0.75)'); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cell * 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFF4CC'; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.36, 0, Math.PI * 2); ctx.fill();
    }
    if (mark >= 0) { const r = Math.floor(mark / 26), c = mark % 26; ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + c * cell + cell / 2, y + r * cell + cell / 2, cell * 0.9, 0, Math.PI * 2); ctx.stroke(); }
  });
}
function partSheets(t) {
  // z1: the methods of the 1930s
  const mA = seg(t, s('z1', 0.2), s('z1', 0.7)) * (1 - seg(t, s('z2'), s('z2', 0.5)));
  if (mA > 0) A(mA, () => {
    stamp('1933–1938', 520, 330, seg(t, s('z1', 0.3), s('z1', 0.8)), { size: 64 });
    const tags = [['the grill', 'Rejewski'], ['the clock', 'Różycki'], ['a card catalogue of 6 × 17,576 = 105,456 rotor settings', 'Rejewski’s cyclometer']];
    tags.forEach(([a1, a2], i) => {
      const a = seg(t, at('z1', 0.35 + i * 0.18), at('z1', 0.5 + i * 0.18)), y = 520 + i * 130;
      A(a, () => { const w = i === 2 ? 1300 : 620; paper(W / 2 - w / 2, y - 50, w, 100); label(a1, W / 2, y - 12, { size: 38, color: C.ink, weight: 700 }); label(a2, W / 2, y + 26, { size: 32, color: C.inkSoft, weight: 500 }); });
    });
  });
  // z2-z5: a message form with a "female", then the sheets
  const z0 = D.zSheets[0];
  const fA = seg(t, s('z2', 0.0), s('z2', 0.5)) * (1 - seg(t, s('z6'), s('z6', 0.5)));
  if (fA > 0) A(fA, () => {
    paper(120, 190, 760, 330, { tilt: -0.008 });
    label('1938: each operator picks a start', 160, 240, { size: 34, color: C.inkSoft, align: 'left' });
    label('sent openly', 160, 320, { size: 34, color: C.ink, align: 'left', weight: 500 });
    mono(z0.ground, 820, 320, { size: 48, color: C.ink, align: 'right', weight: 700 });
    label('key, typed twice, sent as', 160, 400, { size: 34, color: C.ink, align: 'left', weight: 500 });
    const hi = seg(t, s('z3', 0.0), s('z3', 0.4));
    strip(z0.ind, 330, 466, 76, { size: 56, fg: C.ink, weight: 700, hi: (i) => (hi > 0 && (i === 0 || i === 3) ? `rgba(210,69,47,${0.45 * hi})` : null) });
    // more "females" from the same day, one per sheet
    const n = t < s('z4') ? 1 : D.zSheets.findIndex((_, i) => t < sheetIn(i)) === -1 ? 7 : D.zSheets.findIndex((_, i) => t < sheetIn(i));
    for (let i = 1; i < Math.min(n, 7); i++) {
      const s0 = D.zSheets[i], y = 560 + ((i - 1) % 3) * 64, x = 150 + Math.floor((i - 1) / 3) * 370;
      A(seg(t, sheetIn(i), sheetIn(i) + 0.3), () => { mono(s0.ground, x, y, { size: 34, color: C.creamSoft, align: 'left' }); strip(s0.ind, x + 96, y, 36, { size: 34, fg: C.cream, hi: (j) => (j === 0 || j === 3 ? 'rgba(210,69,47,0.5)' : null) }); });
    }
    A(seg(t, s('z4', 0.1), s('z4', 0.6)), () => {
      const k2 = sheetsDown(t), cnt = k2 > 0 ? D.zCounts[k2 - 1] : 0;
      label('holes still open', 500, 820, { size: 34, color: C.creamSoft });
      mono(fmt(cnt), 500, 900, { size: 64, color: C.lamp, weight: 700 });
    });
  });
  const shA = seg(t, s('z3', 0.3), s('z3', 0.9)) * (1 - seg(t, s('z6'), s('z6', 0.5)));
  if (shA > 0) {
    const k2 = Math.max(1, sheetsDown(t)), done = seg(t, at('z5', 0.65), at('z5', 0.85));
    // the stack so far: light shows through the holes open in every sheet
    sheetGrid(D.zSheets[k2 - 1].grid, t > s('z4') ? D.zOpen[k2 - 1] : null, SH.x, SH.y, SH.cell, { a: shA, mark: done > 0 ? D.zTrue : -1 });
    // the next sheet, sliding in on top
    let sh = D.zSheets[k2 - 1];
    if (k2 < NUM.zSheets && t >= sheetIn(k2)) {
      const sl = eout(seg(t, sheetIn(k2), sheetIn(k2) + 0.3)); sh = D.zSheets[k2];
      sheetGrid(sh.grid, null, SH.x + (1 - sl) * 760, SH.y, SH.cell, { a: shA });
    }
    A(shA, () => {
      label(`sheet ${sh.sheet}`, SH.x + 13 * SH.cell, SH.y - 52, { size: 34, color: C.creamSoft });
      label('right rotor’s ring →', SH.x, SH.y + 26 * SH.cell + 56, { size: 32, color: C.creamFaint, align: 'left' });
      ctx.save(); ctx.translate(SH.x - 44, SH.y + 13 * SH.cell); ctx.rotate(-Math.PI / 2); label('middle rotor’s ring →', 0, 0, { size: 32, color: C.creamFaint }); ctx.restore();
    });
    if (done > 0) A(done, () => {
      const r = Math.floor(D.zTrue / 26), c = D.zTrue % 26;
      chip(AB[r], SH.x - 44, SH.y + r * SH.cell + SH.cell / 2, { size: 34, bg: C.lamp });
      chip(AB[c], SH.x + c * SH.cell + SH.cell / 2, SH.y - 52 + 0, { size: 34, bg: C.lamp });
    });
  }
  // z6-z7: the bomba
  const bA = seg(t, s('z6', 0.0), s('z6', 0.5)) * (1 - seg(t, s('z8'), s('z8', 0.5)));
  if (bA > 0) A(bA, () => {
    rrect(1060, 230, 700, 560, 18); ctx.fillStyle = '#10130E'; ctx.fill(); ctx.strokeStyle = C.brassDk; ctx.lineWidth = 3; ctx.stroke();
    for (let g = 0; g < 6; g++) for (let j = 0; j < 3; j++) {
      const x = 1150 + g * 104, y = 330 + j * 104, rot = (t - s('z6')) * (j === 2 ? 3.2 : j === 1 ? 0.6 : 0.12) + g;
      ctx.fillStyle = '#1D221A'; ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = C.brass; ctx.stroke();
      ctx.strokeStyle = C.brassHi; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(rot) * 34, y + Math.sin(rot) * 34); ctx.stroke();
    }
    rrect(1250, 660, 320, 90, 10); ctx.fillStyle = '#22281E'; ctx.fill(); ctx.strokeStyle = C.brassDk; ctx.stroke();
    label('motor', 1410, 705, { size: 34, color: C.creamSoft });
    label('bomba: six sets of rotors (diagram)', 1410, 850, { size: 34, color: C.creamSoft });
    A(seg(t, s('z7', 0.0), s('z7', 0.5)), () => {
      label('6 built', 500, 420, { size: 64, color: C.cream, weight: 800 });
      label('one for each order of the rotors', 500, 490, { size: 36, color: C.creamSoft });
      label('≈ 2 hours', 500, 640, { size: 64, color: C.lamp, weight: 800 });
      label('to find a day’s key', 500, 710, { size: 36, color: C.creamSoft });
    });
  });
  // z8-z9: two more rotors
  const gA = seg(t, s('z8', 0.0), s('z8', 0.5)) * (1 - seg(t, s('z10'), s('z10', 0.5)));
  if (gA > 0) A(gA, () => {
    stamp('DECEMBER 1938', 500, 300, seg(t, s('z8', 0.2), s('z8', 0.7)), { size: 52 });
    ['I', 'II', 'III', 'IV', 'V'].forEach((n, i) => {
      const x = 220 + i * 140, y = 520, nw = i >= 3, a = nw ? seg(t, at('z8', 0.3), at('z8', 0.5)) : 1;
      A(a, () => { ctx.fillStyle = '#10130E'; ctx.beginPath(); ctx.arc(x, y, 54, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = nw ? C.red : C.brass; ctx.stroke(); label(n, x, y + 2, { size: 38, color: nw ? C.red : C.brassHi, weight: 700 }); });
    });
    for (let i = 0; i < 60; i++) {
      const c = i % 10, r = Math.floor(i / 10), x = 1060 + c * 70, y = 250 + r * 70, old = i < 6;
      const a = old ? 1 : seg(t, at('z8', 0.55) + i * 0.012, at('z8', 0.6) + i * 0.012);
      A(a, () => { rrect(x, y, 56, 56, 6); ctx.fillStyle = old ? C.brass : 'rgba(210,69,47,0.25)'; ctx.fill(); ctx.strokeStyle = old ? C.brassHi : C.red; ctx.lineWidth = 2; ctx.stroke(); });
    }
    label('6 rotor orders', 1265, 700, { size: 36, color: C.brassHi, align: 'center' });
    A(seg(t, at('z8', 0.7), at('z8', 0.9)), () => label('→ 60', 1530, 700, { size: 36, color: C.red, weight: 700 }));
    A(seg(t, s('z9', 0.1), s('z9', 0.6)), () => {
      label('the Bureau’s yearly equipment budget', 1060, 790, { size: 32, color: C.creamSoft, align: 'left' });
      ctx.fillStyle = C.brass; ctx.fillRect(1060, 820, 46, 30);
      label('sixty bombas', 1060, 890, { size: 32, color: C.creamSoft, align: 'left' });
      ctx.fillStyle = C.red; ctx.fillRect(1060, 920, 46 * 15 * eio(seg(t, s('z9', 0.4), s('z9', 1.4))), 30);
      label('× 15', 1060 + 46 * 15 + 20, 935, { size: 32, color: C.red, align: 'left', weight: 700 });
    });
  });
  // z10: the woods outside Warsaw
  const pA = seg(t, s('z10', 0.0), s('z10', 0.6)) * (1 - seg(t, s('z12', 0.4), s('z12', 1.0)) * 0.6);
  if (pA > 0 && t < e('z12', 2)) A(pA, () => {
    for (let i = 0; i < 34; i++) {
      const x = 120 + i * 50 + (i % 3) * 9, h = 120 + ((i * 37) % 70), y = 800;
      ctx.fillStyle = i % 2 ? '#26341F' : '#2E3D25';
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + 40, y); ctx.lineTo(x - 40, y); ctx.closePath(); ctx.fill();
    }
    rrect(840, 690, 240, 110, 4); ctx.fillStyle = '#3A3A30'; ctx.fill();
    ctx.fillStyle = '#4A4A3C'; ctx.beginPath(); ctx.moveTo(820, 690); ctx.lineTo(960, 630); ctx.lineTo(1100, 690); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,110,0.8)'; for (let j = 0; j < 4; j++) ctx.fillRect(870 + j * 52, 722, 26, 26);
    label('Pyry, in the woods south of Warsaw', W / 2, 870, { size: 36, color: C.creamSoft });
    stamp('JULY 1939', 1560, 300, seg(t, s('z10', 0.3), s('z10', 0.8)), { size: 56 });
    const gifts = ['two Polish-built Enigma copies', 'Zygalski’s sheets', 'the bomba', 'their methods'];
    gifts.forEach((g, i) => A(seg(t, at('z10', 0.35 + i * 0.12), at('z10', 0.47 + i * 0.12)), () => chip(g, 560 + (i % 2) * 520, 330 + Math.floor(i / 2) * 110, { size: 38, family: SLAB, weight: 600, bg: C.paper })));
  });
  const wA = seg(t, s('z12', 0.0), s('z12', 0.4));
  if (wA > 0) { A(wA * 0.6, () => { ctx.fillStyle = 'rgba(8,10,7,0.8)'; ctx.fillRect(0, 0, W, H); }); stamp('1 SEPTEMBER 1939', W / 2, 520, seg(t, s('z12', 0.2), s('z12', 0.8)), { size: 80, rot: -0.04 }); }
}
// when each Zygalski sheet arrives, and how many are down at time t
const sheetIn = (i) => (i === 0 ? s('z3', 0.3) : i <= 3 ? at('z4', 0.1 + (i - 1) * 0.28) : at('z5', 0.05 + (i - 4) * 0.2));
const sheetsDown = (t) => { let n = 0; for (let i = 0; i < NUM.zSheets; i++) if (t >= sheetIn(i) + 0.32) n = i + 1; return n; };

// ---------- 6: cribs ----------
const CR = { cell: 42, x0: (W - 40 * 42) / 2, yC: 430, yK: 500, yT: 700 };
const cribSlot = (t) => {
  // where the crib sits: 0 during c5-c6, 1 during c7, then 2..15 through c8 and its hold
  if (t < at('c7', 0.1)) return 0;
  if (t < s('c8')) return eio(seg(t, at('c7', 0.1), at('c7', 0.35)));
  const t0 = s('c8', 0.2), t1 = e('c8', 2.2), step = (t1 - t0) / 14;
  const i = clamp(Math.floor((t - t0) / step), 0, 13), f = eio(seg(t - t0 - i * step, 0, step * 0.4));
  return t < t0 ? 1 : Math.min(15, 1 + i + f);
};
const slotDone = (t, p) => (p === 0 ? at('c6', 0.6) : p === 1 ? at('c7', 0.6) : s('c8', 0.2) + (p - 2 + 0.75) * ((e('c8', 2.2) - s('c8', 0.2)) / 14));
function partCribs(t) {
  // c1: Bletchley Park
  const bA = seg(t, s('c1', 0.1), s('c1', 0.7)) * (1 - seg(t, s('c3'), s('c3', 0.5)));
  if (bA > 0) A(bA, () => {
    ctx.strokeStyle = C.creamSoft; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    const x = 170, y = 640;
    ctx.beginPath(); ctx.rect(x + 60, y - 170, 380, 170); ctx.moveTo(x + 40, y - 170); ctx.lineTo(x + 250, y - 280); ctx.lineTo(x + 460, y - 170); ctx.stroke();
    ctx.beginPath(); ctx.rect(x + 20, y - 230, 90, 230); ctx.moveTo(x + 10, y - 230); ctx.lineTo(x + 65, y - 300); ctx.lineTo(x + 120, y - 230); ctx.stroke();
    for (let i = 0; i < 6; i++) { ctx.strokeRect(x + 90 + i * 60, y - 120, 30, 46); }
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.rect(x + 470 + i * 70, y - 70 - i * 0, 60, 70); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x + 720, y); ctx.stroke();
    label('Bletchley Park (diagram)', x + 350, y + 50, { size: 34, color: C.creamFaint });
    stamp('4 SEPTEMBER 1939', 1400, 300, seg(t, s('c1', 0.3), s('c1', 0.8)), { size: 52 });
    ['Alan Turing', 'Gordon Welchman'].forEach((n, i) => A(seg(t, at('c1', 0.45 + i * 0.15), at('c1', 0.6 + i * 0.15)), () => chip(n, 1400, 470 + i * 100, { size: 44, family: SLAB, weight: 700 })));
  });
  const kA = seg(t, s('c2', 0.0), s('c2', 0.5)) * (1 - seg(t, s('c3'), s('c3', 0.5)));
  if (kA > 0) A(kA, () => {
    strip('MIPMIP', 1150, 760, 80, { size: 56, fg: C.cream });
    ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1150 + 240, 760); ctx.lineTo(1150 + 240 + 240 * eio(seg(t, at('c2', 0.6), at('c2', 0.8))), 760); ctx.stroke();
    stamp('MAY 1940', 1650, 860, seg(t, at('c2', 0.7), at('c2', 1.0)), { size: 44 });
  });
  // c3-c4: set phrases
  const sA = seg(t, s('c3', 0.0), s('c3', 0.5)) * (1 - seg(t, s('c5'), s('c5', 0.5)));
  if (sA > 0) A(sA, () => {
    label('cribs: words that turned up again and again', W / 2, 220, { size: 40, color: C.creamSoft });
    const slips = [['WETTER', '“weather”'], ['AN DIE GRUPPE', '“to the group”'], ['KEINE BESONDEREN EREIGNISSE', '“nothing special to report”']];
    slips.forEach(([g, en], i) => {
      const a = seg(t, at('c3', 0.3 + i * 0.15), at('c3', 0.45 + i * 0.15)), y = 360 + i * 170, hot = i === 2 ? seg(t, s('c4', 0.1), s('c4', 0.5)) : 0;
      A(a, () => {
        const w = i === 2 ? 1100 : 640;
        paper(W / 2 - w / 2, y - 60, w, 120, { tilt: (i - 1) * 0.008 });
        if (hot > 0) { ctx.strokeStyle = `rgba(210,69,47,${hot})`; ctx.lineWidth = 5; rrect(W / 2 - w / 2 - 8, y - 68, w + 16, 136, 10); ctx.stroke(); }
        mono(g, W / 2, y - 14, { size: 44, color: C.ink, weight: 700 });
        label(en, W / 2, y + 32, { size: 32, color: C.inkSoft, weight: 500 });
      });
    });
    A(seg(t, s('c4', 0.4), s('c4', 0.9)), () => label('sent regularly by one outpost in North Africa', W / 2, 900, { size: 34, color: C.creamSoft }));
  });
  // c5-c9: drag the crib along the ciphertext
  const dA = seg(t, s('c5', 0.0), s('c5', 0.6));
  if (dA > 0) A(dA, () => {
    const p = cribSlot(t), pi = Math.round(p), settled = Math.abs(p - pi) < 0.02;
    label('ciphertext', CR.x0, CR.yC - 64, { size: 34, color: C.creamSoft, align: 'left' });
    paper(CR.x0 - 10, CR.yC - 30, 40 * CR.cell + 20, 60, { shadow: 0.3, r: 4 });
    strip(D.cipher, CR.x0, CR.yC, CR.cell, { size: 34, fg: C.ink, hi: (i) => (settled && i >= pi && i < pi + 25 && D.slots[pi].clash[i - pi] && t > slotDone(t, pi) - 0.35 ? 'rgba(210,69,47,0.65)' : null) });
    const xk = CR.x0 + p * CR.cell;
    paper(xk - 6, CR.yK - 28, 25 * CR.cell + 12, 56, { shadow: 0.45, r: 4, fill: '#E2D3A8' });
    strip(D.crib, xk, CR.yK, CR.cell, { size: 34, fg: '#5B3A0C', hi: (i) => (settled && D.slots[pi].clash[i] && t > slotDone(t, pi) - 0.35 ? 'rgba(210,69,47,0.65)' : null) });
    label('crib', xk + 25 * CR.cell + 24, CR.yK, { size: 34, color: C.brassHi, align: 'left' });
    // c6: each crib letter checked against the letter above it
    const cmp = span(t, s('c6', 0.2), at('c7', 0.1), 0.3, 0.2);
    if (cmp > 0) A(cmp, () => { for (let i = 0; i < 25; i++) { const x = xk + i * CR.cell + CR.cell / 2; ctx.strokeStyle = C.creamFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, CR.yC + 24); ctx.lineTo(x, CR.yK - 24); ctx.stroke(); } });
    // the tally of places
    for (let q = 0; q < 16; q++) {
      const x = W / 2 + (q - 7.5) * 96, y = CR.yT, done = t >= slotDone(t, q), sl = D.slots[q];
      rrect(x - 38, y - 38, 76, 76, 10); ctx.fillStyle = q === pi && !done ? 'rgba(242,181,68,0.25)' : 'rgba(239,231,209,0.07)'; ctx.fill();
      ctx.strokeStyle = C.creamFaint; ctx.lineWidth = 2; ctx.stroke();
      mono(String(q + 1), x, y, { size: 32, color: C.creamSoft });
      if (done) {
        const f = seg(t, slotDone(t, q), slotDone(t, q) + 0.35);
        if (sl.ok) { ctx.strokeStyle = `rgba(163,188,128,${f})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.stroke(); }
        else cross(x, y, 26, f, C.red, 7);
      }
    }
    label('places', W / 2 - 8 * 96 - 30, CR.yT, { size: 32, color: C.creamFaint, align: 'right' });
    A(seg(t, s('c9', 0.2), s('c9', 0.7)), () => {
      label(`${D.slots.length} places · ${D.slots.length - D.survivors} ruled out · ${D.survivors} left`, W / 2, 860, { size: 48, color: C.cream, weight: 700 });
    });
  });
}

// ---------- 7: the bombe ----------
const MENU = (() => {
  const nodes = D.menu.nodes.slice(), edges = D.menu.edges.map(([u, v, i]) => ({ u, v, n: i - D.menu.a + 1 }));
  // layout by stress majorisation: screen distances follow distances along the menu's links
  const box = [1040, 450, 1790, 900], P = {}, gd = {};
  for (const a of nodes) { const d = { [a]: 0 }, q = [a]; while (q.length) { const x = q.shift(); for (const ed of edges) { const y = ed.u === x ? ed.v : ed.v === x ? ed.u : -1; if (y >= 0 && d[y] === undefined) { d[y] = d[x] + 1; q.push(y); } } } gd[a] = d; }
  nodes.forEach((n, i) => { const a = (i / nodes.length) * Math.PI * 2 + 0.3; P[n] = [Math.cos(a) * 3, Math.sin(a) * 2]; });
  for (let it = 0; it < 400; it++) for (const a of nodes) {
    let sx = 0, sy = 0, sw = 0;
    for (const b of nodes) {
      if (a === b) continue;
      const dij = gd[a][b], w = 1 / (dij * dij), dx = P[a][0] - P[b][0], dy = P[a][1] - P[b][1], d = Math.hypot(dx, dy) || 1e-6;
      sx += w * (P[b][0] + dij * dx / d); sy += w * (P[b][1] + dij * dy / d); sw += w;
    }
    P[a] = [sx / sw, sy / sw];
  }
  // fit the layout into the box (x and y scaled separately, within limits)
  const xs = nodes.map((n) => P[n][0]), ys = nodes.map((n) => P[n][1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  let sxk = (box[2] - box[0]) / (bx1 - bx0), syk = (box[3] - box[1]) / (by1 - by0);
  if (sxk > syk * 1.6) sxk = syk * 1.6; if (syk > sxk * 1.6) syk = sxk * 1.6;
  for (const n of nodes) { P[n][0] = (box[0] + box[2]) / 2 + (P[n][0] - (bx0 + bx1) / 2) * sxk; P[n][1] = (box[1] + box[3]) / 2 + (P[n][1] - (by0 + by1) / 2) * syk; }
  // which links lie on a loop: still connected without them
  const connected = (skip, a, b) => { const seen = new Set([a]), q = [a]; while (q.length) { const x = q.pop(); for (const [i, ed] of edges.entries()) { if (i === skip) continue; const y = ed.u === x ? ed.v : ed.v === x ? ed.u : -1; if (y >= 0 && !seen.has(y)) { seen.add(y); q.push(y); } } } return seen.has(b); };
  edges.forEach((ed, i) => { ed.loop = connected(i, ed.u, ed.v); });
  // breadth-first order from the central letter, for the spreading guess
  const dist = { [D.central]: 0 }, q = [D.central];
  while (q.length) { const x = q.shift(); for (const ed of edges) { const y = ed.u === x ? ed.v : ed.v === x ? ed.u : -1; if (y >= 0 && dist[y] === undefined) { dist[y] = dist[x] + 1; q.push(y); } } }
  return { nodes, edges, P, dist, maxd: Math.max(...Object.values(dist)) };
})();
function menuGraph(t, { a = 1, grow = 1, spread = -1, red = 0, loopsHi = 0, partner = 0 } = {}) {
  A(a, () => {
    const { P, edges, nodes, dist, maxd } = MENU;
    edges.forEach((ed, i) => {
      const g = clamp(grow * edges.length - i); if (g <= 0) return;
      const [x0, y0] = P[ed.u], [x1, y1] = P[ed.v];
      const lit = spread >= 0 && Math.max(dist[ed.u], dist[ed.v]) <= spread;
      ctx.strokeStyle = lit ? (red > 0 ? C.red : C.lamp) : ed.loop && loopsHi > 0 ? `rgba(242,181,68,${0.4 + 0.6 * loopsHi})` : 'rgba(239,231,209,0.45)';
      ctx.lineWidth = ed.loop && loopsHi > 0 ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, eio(g)), lerp(y0, y1, eio(g))); ctx.stroke();
      if (g > 0.6) A(seg(g, 0.6, 1), () => { const d = Math.hypot(x1 - x0, y1 - y0) || 1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, cx0 = nodes.reduce((q, n) => q + P[n][0], 0) / nodes.length, cy0 = nodes.reduce((q, n) => q + P[n][1], 0) / nodes.length; let ox = -(y1 - y0) / d * 22, oy = (x1 - x0) / d * 22; if (ox * (mx - cx0) + oy * (my - cy0) < 0) { ox = -ox; oy = -oy; } mono(String(ed.n), mx + ox, my + oy, { size: 32, color: ed.loop && loopsHi > 0 ? C.lamp : C.creamSoft, weight: 600 }); });
    });
    nodes.forEach((n) => {
      const g = clamp(grow * edges.length - Math.min(...edges.map((ed, i) => (ed.u === n || ed.v === n ? i : 99)))); if (g <= 0) return;
      const [x, y] = P[n], lit = spread >= 0 && dist[n] <= spread;
      A(g, () => {
        ctx.fillStyle = lit ? (red > 0 && n === D.central ? C.red : '#5A4512') : '#10130E'; ctx.beginPath(); ctx.arc(x, y, 27, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = n === D.central ? C.lamp : C.brass; ctx.stroke();
        mono(AB[n], x, y + 1, { size: 36, color: C.cream, weight: 700 });
      });
    });
    if (partner > 0) A(partner, () => { const [x, y] = P[D.central]; chip('E ↔ J', x, y - 62, { size: 40, bg: C.green, fg: C.ink }); });
  });
}
function bombeCabinet(t, { a = 1, run = -1 } = {}) {
  A(a, () => {
    rrect(130, 190, 740, 660, 16); ctx.fillStyle = '#121510'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.brassDk; ctx.stroke();
    const cols = ['#8E2A1F', '#5E1F2A', '#2F5A33']; // the drums' colour code: rotor I red, II maroon, III green
    const tt = run >= 0 ? Math.max(0, t - run) : 0, top = tt * 2 * Math.PI * 1.6, midA = Math.floor(tt * 1.6) * (2 * Math.PI / 26), botA = Math.floor(tt * 1.6 / 26) * (2 * Math.PI / 26);
    for (let b = 0; b < 3; b++) for (let r = 0; r < 3; r++) for (let j = 0; j < 12; j++) {
      const x = 179 + j * 58, y = 252 + b * 210 + r * 58, ang = (r === 0 ? top : r === 1 ? midA : botA) + j * 0.5 + b;
      ctx.fillStyle = cols[r]; ctx.beginPath(); ctx.arc(x, y, 23, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
      ctx.strokeStyle = C.cream; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * 8, y + Math.sin(ang) * 8); ctx.lineTo(x + Math.cos(ang) * 19, y + Math.sin(ang) * 19); ctx.stroke();
    }
    label('the bombe: 36 Enigmas’ worth of drums (diagram)', 500, 900, { size: 32, color: C.creamFaint });
  });
}
function partBombe(t) {
  bombeCabinet(t, { a: seg(t, s('b1', 0.1), s('b1', 0.7)), run: s('b4', 0.3) });
  // b2: the crib in place, as pairs of letters
  const cA = seg(t, s('b2', 0.0), s('b2', 0.5)) * (1 - seg(t, s('b6'), s('b6', 0.5)));
  const a0 = D.menu.a, L = D.menu.len, cell = 56, x0 = 1416 - (L * cell) / 2;
  if (cA > 0) A(cA, () => {
    label('the crib where it fits', 1416, 182, { size: 32, color: C.creamFaint });
    for (let i = 0; i < L; i++) {
      const x = x0 + i * cell + cell / 2, g = seg(t, at('b2', 0.2 + i * 0.04), at('b2', 0.28 + i * 0.04));
      A(g, () => {
        mono(String(i + 1), x, 236, { size: 32, color: C.creamFaint });
        mono(D.plain[a0 + i], x, 290, { size: 38, color: C.lamp, weight: 700 });
        ctx.strokeStyle = C.creamFaint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 314); ctx.lineTo(x, 338); ctx.stroke();
        mono(D.cipher[a0 + i], x, 362, { size: 38, color: C.cream, weight: 600 });
      });
    }
  });
  // b3-b5: the menu, a guess spreading, a contradiction
  const gA = seg(t, s('b3', 0.0), s('b3', 0.5)) * (1 - seg(t, s('b7'), s('b7', 0.5)));
  if (gA > 0) {
    const cyc = (t - s('b4', 0.3)) / 1.6, k2 = Math.floor(cyc), f = cyc - k2;
    const spread = t < s('b4', 0.3) || t > e('b5', 0.6) ? -1 : Math.floor(f * (MENU.maxd + 2)) - 1;
    const red = spread >= MENU.maxd ? 1 : 0;
    menuGraph(t, { a: gA, grow: seg(t, s('b3', 0.1), at('b3', 0.7)), spread, red, loopsHi: seg(t, at('b3', 0.7), e('b3')) * (1 - seg(t, s('b4'), s('b4', 0.5))) });
    A(gA * span(t, s('b4', 0.3), e('b5', 0.6), 0.3, 0.3), () => {
      const pos = Math.min(17576, 1 + k2);
      mono(`position ${fmt(pos)} of ${fmt(17576)}`, 1250, 945, { size: 34, color: C.creamSoft });
      if (spread >= 0) chip(red ? 'contradiction' : `guess: E ↔ ${AB[(k2 * 7 + 1) % 26 === ix('J') ? 2 : (k2 * 7 + 1) % 26]}`, 1640, 945, { size: 34, family: SLAB, bg: red ? C.red : C.paper, fg: red ? C.cream : C.ink });
    });
  }
  // b6: the diagonal board
  const dA = seg(t, s('b6', 0.1), s('b6', 0.6)) * (1 - seg(t, s('b7'), s('b7', 0.5)));
  if (dA > 0) A(dA, () => {
    const gx = 1080, gy = 170, c = 8.2;
    ctx.fillStyle = '#10130E'; ctx.fillRect(gx, gy, 26 * c, 26 * c); ctx.strokeStyle = C.brass; ctx.lineWidth = 3; ctx.strokeRect(gx, gy, 26 * c, 26 * c);
    ctx.strokeStyle = 'rgba(239,231,209,0.12)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 26; i++) { ctx.beginPath(); ctx.moveTo(gx + i * c, gy); ctx.lineTo(gx + i * c, gy + 26 * c); ctx.moveTo(gx, gy + i * c); ctx.lineTo(gx + 26 * c, gy + i * c); ctx.stroke(); }
    ctx.strokeStyle = C.lamp; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 26 * c * eio(seg(t, at('b6', 0.3), at('b6', 0.7))), gy + 26 * c * eio(seg(t, at('b6', 0.3), at('b6', 0.7)))); ctx.stroke();
    label('if A is plugged to B,', 1340, 240, { size: 40, color: C.cream, align: 'left' });
    label('then B is plugged to A', 1340, 300, { size: 40, color: C.lamp, align: 'left' });
    label('Welchman’s diagonal board', 1340, 360, { size: 32, color: C.creamFaint, align: 'left' });
  });
  // b7-b8: the run
  const rA = seg(t, s('b7', 0.0), s('b7', 0.5)) * (1 - seg(t, s('b9'), s('b9', 0.5)));
  if (rA > 0) A(rA, () => {
    mono(`${fmt(17576)} positions`, 1416, 200, { size: 48, color: C.cream, weight: 600 });
    label('without the diagonal board', 1215, 290, { size: 34, color: C.creamSoft });
    const nd = Math.floor(D.stopsNoDiagonal * eio(seg(t, at('b7', 0.3), at('b7', 0.85))));
    for (let i = 0; i < nd; i++) { const x = 1070 + (i % 26) * 11.4, y = 330 + Math.floor(i / 26) * 11.4; ctx.fillStyle = C.red; ctx.fillRect(x, y, 8, 8); }
    mono(`${fmt(nd)} stops`, 1215, 660, { size: 44, color: C.red, weight: 700 });
    A(seg(t, s('b8', 0.0), s('b8', 0.4)), () => {
      label('with it', 1640, 290, { size: 34, color: C.creamSoft });
      D.stops.forEach((st, i) => {
        const x = 1600 + i * 80, y = 460, ok = st.p === D.truePos, g = seg(t, at('b8', 0.4), at('b8', 0.6));
        ctx.fillStyle = ok && g > 0 ? C.green : C.red; ctx.fillRect(x - 14, y - 14, 28, 28);
        A(g, () => label(ok ? 'true' : 'false', x, y + 52, { size: 32, color: ok ? C.green : C.creamSoft }));
      });
      mono(`${D.stops.length} stops`, 1640, 660, { size: 44, color: C.cream, weight: 700 });
      A(seg(t, at('b8', 0.65), at('b8', 0.85)), () => chip('the true stop: E is plugged to J', 1416, 780, { size: 38, family: SLAB, bg: C.green, fg: C.ink }));
    });
  });
  // b9-b10: Victory, and the many that followed
  const vA = seg(t, s('b9', 0.0), s('b9', 0.6));
  if (vA > 0) A(vA, () => {
    rrect(1080, 190, 670, 220, 14); const g = ctx.createLinearGradient(0, 190, 0, 410); g.addColorStop(0, C.brassHi); g.addColorStop(1, C.brassDk); ctx.fillStyle = g; ctx.fill();
    label('VICTORY', 1415, 280, { size: 96, color: '#2A2210', weight: 800, spacing: '8px' });
    label('the first bombe · March 1940', 1415, 362, { size: 34, color: '#2A2210', weight: 600 });
    A(seg(t, s('b10', 0.1), s('b10', 0.5)), () => {
      for (let i = 0; i < 200; i++) {
        const x = 1080 + (i % 25) * 27, y = 470 + Math.floor(i / 25) * 36, g2 = seg(t, at('b10', 0.1) + i * 0.012, at('b10', 0.15) + i * 0.012);
        if (g2 > 0) A(g2, () => { ctx.fillStyle = C.brassDk; ctx.fillRect(x, y, 20, 26); ctx.fillStyle = '#8E2A1F'; ctx.fillRect(x + 4, y + 5, 12, 4); });
      }
      label('about 200 bombes by 1945', 1415, 800, { size: 40, color: C.cream, weight: 700 });
      label('run by some 2,000 Wrens', 1415, 860, { size: 36, color: C.creamSoft });
    });
  });
}

// ---------- 8: the U-boat war ----------
const TLX = (m) => 160 + m * (1600 / 29); // months from January 1941
function sub(x, y, sc, tilt = 0, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(sc, sc);
    ctx.fillStyle = '#0B0D0A'; ctx.beginPath(); ctx.ellipse(0, 0, 160, 22, 0, 0, Math.PI * 2); ctx.fill();
    rrect(-30, -54, 60, 40, 8); ctx.fill(); ctx.fillRect(-4, -78, 6, 26);
    ctx.strokeStyle = 'rgba(239,231,209,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 160, 22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  });
}
function partUboat(t) {
  // u1: three rotors from eight
  const rA = seg(t, s('u1', 0.1), s('u1', 0.6)) * (1 - seg(t, s('u2'), s('u2', 0.5)));
  if (rA > 0) A(rA, () => {
    ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].forEach((n, i) => {
      const lift = [1, 4, 6].includes(i) ? eio(seg(t, at('u1', 0.45 + i * 0.03), at('u1', 0.65 + i * 0.03))) * 80 : 0, x = 330 + i * 180, y = 470 - lift;
      ctx.fillStyle = '#10130E'; ctx.beginPath(); ctx.arc(x, y, 62, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = lift > 0 ? C.brassHi : C.brassDk; ctx.stroke();
      label(n, x, y + 2, { size: 38, color: lift > 0 ? C.brassHi : C.creamSoft, weight: 700 });
    });
    A(seg(t, at('u1', 0.7), at('u1', 0.9)), () => mono('8 × 7 × 6 = 336 rotor orders', W / 2, 700, { size: 52, color: C.cream, weight: 600 }));
    label('the navy’s Enigma', W / 2, 260, { size: 40, color: C.creamSoft });
  });
  // u2: Turing's words
  const qA = span(t, s('u2', 0.0), e('u2', 0.4), 0.5, 0.4);
  if (qA > 0) A(qA, () => {
    paper(330, 300, 1260, 380, { tilt: -0.006 });
    ctx.font = `italic 500 52px "${SLAB}"`; text('“no one else was doing anything about it', W / 2, 430, { color: C.ink, align: 'center' });
    text('and I could have it to myself”', W / 2, 500, { color: C.ink, align: 'center' });
    label('Alan Turing, on naval Enigma', W / 2, 600, { size: 34, color: C.inkSoft, weight: 600 });
  });
  // u3-u10: a timeline of the U-boat traffic, January 1941 to mid-1943
  const lA = seg(t, s('u3', 0.0), s('u3', 0.5));
  if (lA > 0) A(lA, () => {
    ctx.strokeStyle = C.creamSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TLX(0), 780); ctx.lineTo(TLX(29), 780); ctx.stroke();
    for (const [m, y] of [[0, '1941'], [12, '1942'], [24, '1943']]) { ctx.beginPath(); ctx.moveTo(TLX(m), 770); ctx.lineTo(TLX(m), 792); ctx.stroke(); mono(y, TLX(m), 830, { size: 32, color: C.creamSoft }); }
    // readable (green) and dark (red) stretches of U-boat traffic
    const band = (m0, m1, col, t0, t1) => { const p = eio(seg(t, t0, t1)); if (p > 0) { ctx.fillStyle = col; ctx.fillRect(TLX(m0), 730, (TLX(m1) - TLX(m0)) * p, 30); } };
    band(4.3, 13, C.greenDk, at('u3', 0.6), e('u4'));
    band(13, 23, C.red, at('u6', 0.1), at('u6', 0.8));
    band(23, 29, C.greenDk, at('u9', 0.1), at('u9', 0.7));
    const mk = (m, str, y, key, f = 0.2) => A(seg(t, at(key, f), at(key, f + 0.2)), () => { ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(TLX(m), y + 22); ctx.lineTo(TLX(m), 728); ctx.stroke(); label(str, TLX(m), y, { size: 32, color: C.cream }); });
    mk(4.3, 'May 1941: U-110', 690, 'u3', 0.3);
    mk(13, '1 Feb 1942: four rotors', 690, 'u5', 0.3);
    mk(22, 'Oct: U-559', 620, 'u7', 0.2);
    mk(23, 'Dec: read again', 690, 'u9', 0.1);
    A(seg(t, at('u6', 0.5), at('u6', 0.9)), () => label('ten months', TLX(18), 880, { size: 34, color: C.red, weight: 700 }));
  });
  // the pictures above the timeline
  const p3 = span(t, s('u3', 0.2), s('u4', 0.1), 0.4, 0.4);
  if (p3 > 0) { sub(800, 420, 1.1, 0, p3); A(p3, () => { paper(1060, 330, 300, 170, { tilt: 0.05 }); label('codebooks', 1210, 395, { size: 36, color: C.ink, weight: 700 }); label('and keys', 1210, 445, { size: 36, color: C.ink, weight: 700 }); }); stamp('MAY 1941', 1520, 300, seg(t, at('u3', 0.5), at('u3', 0.8)), { size: 44 }); }
  const p4 = span(t, s('u4', 0.0), s('u5', 0.1), 0.4, 0.4);
  if (p4 > 0) A(p4, () => {
    for (let i = 0; i < 7; i++) { const x = 760 + i * 70, y = 300 + i * 34; ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 14, y + 12); ctx.lineTo(x - 14, y + 12); ctx.closePath(); ctx.fill(); }
    label('U-boat patrol line', 1020, 230, { size: 32, color: C.red });
    const f = eio(seg(t, at('u4', 0.2), at('u4', 0.95)));
    const curve = (u) => [lerp(380, 1560, u), 560 - Math.sin(u * Math.PI) * 0 + (u > 0.2 && u < 0.8 ? Math.sin((u - 0.2) / 0.6 * Math.PI) * 60 : 0)];
    ctx.strokeStyle = C.creamFaint; ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.beginPath();
    for (let u = 0; u <= f; u += 0.01) { const [x, y] = curve(u); if (u === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.setLineDash([]);
    const [cx, cy] = curve(f); for (let j = 0; j < 9; j++) { ctx.fillStyle = C.cream; ctx.fillRect(cx - 40 + (j % 3) * 28, cy - 30 + Math.floor(j / 3) * 22, 18, 9); }
    label('a convoy steered around it (diagram)', 960, 640, { size: 32, color: C.creamFaint });
  });
  const p5 = span(t, s('u5', 0.0), s('u7', 0.1), 0.4, 0.4);
  if (p5 > 0) A(p5, () => {
    const parts = [['thin reflector', 26, '#3E4535'], ['β', 26, '#5A3A2A'], ['', 62, '#10130E'], ['', 62, '#10130E'], ['', 62, '#10130E']];
    let x = 700;
    parts.forEach(([n, w, col], i) => {
      const slide = i === 1 ? (1 - eio(seg(t, at('u5', 0.3), at('u5', 0.7)))) * -160 : 0;
      rrect(x, 260 + slide, w, 300, 8); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = i >= 2 ? C.brass : C.brassDk; ctx.lineWidth = 3; ctx.stroke();
      x += w + 18;
    });
    label('a thin fourth rotor', 1240, 360, { size: 36, color: C.cream, align: 'left' });
    label('and a thin reflector', 1240, 420, { size: 36, color: C.cream, align: 'left' });
    label('four rotors (diagram)', 960, 620, { size: 32, color: C.creamFaint });
  });
  const p7 = span(t, s('u7', 0.0), s('u9', 0.0), 0.4, 0.4);
  if (p7 > 0) {
    sub(760, 440 + seg(t, s('u7'), e('u8')) * 40, 1.0, 0.12 + seg(t, s('u7'), e('u8')) * 0.1, p7);
    A(p7, () => { label('U-559, off Port Said', 760, 300, { size: 36, color: C.creamSoft }); stamp('30 OCTOBER 1942', 760, 610, seg(t, at('u7', 0.4), at('u7', 0.7)), { size: 40 }); });
    A(p7 * seg(t, s('u8', 0.1), s('u8', 0.6)), () => {
      rrect(1110, 300, 600, 300, 14); const g = ctx.createLinearGradient(0, 300, 0, 600); g.addColorStop(0, '#2C3427'); g.addColorStop(1, '#1A1F17'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.brass; ctx.stroke();
      label('Tony Fasson', 1410, 390, { size: 48, color: C.brassHi, weight: 700 });
      label('Colin Grazier', 1410, 460, { size: 48, color: C.brassHi, weight: 700 });
      label('awarded the George Cross', 1410, 540, { size: 32, color: C.creamSoft, weight: 500 });
    });
  }
  const p9 = seg(t, s('u9', 0.0), s('u9', 0.4));
  if (p9 > 0) A(p9, () => {
    chip('U-boat messages read again', 960, 330, { size: 40, family: SLAB, bg: C.green, fg: C.ink });
    A(seg(t, s('u10', 0.1), s('u10', 0.5)), () => {
      ['decrypts', 'radar', 'direction finding', 'and much else'].forEach((n, i) => chip(n, 480 + i * 320, 500, { size: 36, family: SLAB, bg: i === 0 ? C.lamp : C.paper }));
      label('how much each mattered is still argued', 960, 600, { size: 34, color: C.creamSoft });
    });
  });
}

// ---------- 9: never itself ----------
function person(x, y, sc, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 22 * sc, 9 * sc, 0, Math.PI * 2); ctx.fill(); rrect(x - 11 * sc, y - 10 * sc, 22 * sc, 28 * sc, 8 * sc); ctx.fill(); }
function partFinal(t) {
  // f1-f2: the film version, and the real one
  const fA = seg(t, s('f1', 0.1), s('f1', 0.6)) * (1 - seg(t, s('f3'), s('f3', 0.5)));
  if (fA > 0) A(fA, () => {
    const off = eio(seg(t, s('f2', 0.0), s('f2', 0.7))) * -300, x = 560 + off, y = 230;
    A(1 - 0.5 * eio(seg(t, s('f2', 0.0), s('f2', 0.7))), () => {
      rrect(x, y, 800, 520, 10); ctx.fillStyle = '#0B0D0A'; ctx.fill();
      for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(239,231,209,0.25)'; rrect(x + 24 + i * 64, y + 16, 34, 22, 4); ctx.fill(); rrect(x + 24 + i * 64, y + 482, 34, 22, 4); ctx.fill(); }
      rrect(x + 120, y + 130, 300, 280, 10); ctx.fillStyle = '#3A3226'; ctx.fill();
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = '#8E2A1F'; ctx.beginPath(); ctx.arc(x + 170 + i * 66, y + 180 + j * 62, 18, 0, Math.PI * 2); ctx.fill(); }
      person(x + 560, y + 400, 3.4, 'rgba(239,231,209,0.75)');
      label('“Christopher”', x + 270, y + 446, { size: 36, color: C.cream });
      label('the film version', x + 400, y - 40, { size: 36, color: C.creamSoft });
    });
    cross(560 + off + 400, 490, 120, seg(t, at('f2', 0.2), at('f2', 0.5)), C.red, 10);
    A(seg(t, at('f2', 0.3), at('f2', 0.7)), () => {
      rrect(1180, 230, 560, 150, 12); const g = ctx.createLinearGradient(0, 230, 0, 380); g.addColorStop(0, C.brassHi); g.addColorStop(1, C.brassDk); ctx.fillStyle = g; ctx.fill();
      label('VICTORY', 1460, 305, { size: 80, color: '#2A2210', weight: 800, spacing: '6px' });
      for (let i = 0; i < 48; i++) { const g2 = seg(t, at('f2', 0.4) + i * 0.02, at('f2', 0.45) + i * 0.02); if (g2 > 0) A(g2, () => person(1200 + (i % 12) * 46, 490 + Math.floor(i / 12) * 80, 1.4, i % 4 === 3 ? C.cream : C.brass)); }
    });
  });
  // f3: the people of Bletchley Park, January 1945
  const pA = seg(t, s('f3', 0.0), s('f3', 0.5)) * (1 - seg(t, s('f4'), s('f4', 0.5)));
  if (pA > 0) A(pA, () => {
    label('8,995 people at Bletchley Park and its outstations, January 1945', W / 2, 200, { size: 38, color: C.cream });
    const n = Math.floor(8995 * eio(seg(t, at('f3', 0.05), at('f3', 0.6)))), women = Math.round(8995 * 0.75);
    for (let i = 0; i < n; i++) { const x = 285 + (i % 150) * 9, y = 260 + Math.floor(i / 150) * 9; ctx.fillStyle = i < women ? C.brass : C.creamSoft; ctx.fillRect(x, y, 6, 6); }
    A(seg(t, at('f3', 0.65), at('f3', 0.85)), () => label('about three quarters of them women', W / 2, 860, { size: 40, color: C.brassHi, weight: 700 }));
  });
  // f4-f5: what it was worth
  const hA = seg(t, s('f4', 0.0), s('f4', 0.5)) * (1 - seg(t, s('f6'), s('f6', 0.5)));
  if (hA > 0) A(hA, () => {
    paper(380, 260, 1160, 300, { tilt: 0.004 });
    ctx.font = `italic 500 56px "${SLAB}"`; text('shortened the war by at least two years', W / 2, 380, { color: C.ink, align: 'center' });
    label('Harry Hinsley, Bletchley veteran and official historian', W / 2, 470, { size: 34, color: C.inkSoft, weight: 600 });
    stamp('TOO PRECISE?', 1400, 640, seg(t, s('f5', 0.1), s('f5', 0.6)), { size: 56, rot: -0.08 });
    A(seg(t, at('f5', 0.5), at('f5', 0.8)), () => label('no one can run a war twice', 760, 680, { size: 40, color: C.creamSoft }));
  });
  // f6-f7: the last messages from Cuxhaven
  const mA = seg(t, s('f6', 0.0), s('f6', 0.5)) * (1 - seg(t, s('f8'), s('f8', 0.6)));
  if (mA > 0) A(mA, () => {
    label('Cuxhaven, 7 May 1945', W / 2, 260, { size: 44, color: C.cream, weight: 700 });
    const lines = [['BRITISH TROOPS ENTERED CUXHAVEN', at('f6', 0.45)], ['CLOSING DOWN FOREVER', at('f7', 0.35)], ['ALL THE BEST — GOODBYE', at('f7', 0.6)]];
    lines.forEach(([str, t0], i) => {
      if (t < t0 - 0.2) return;
      const y = 400 + i * 130;
      A(seg(t, t0 - 0.2, t0), () => { paper(300, y - 44, 1320, 88, { shadow: 0.35, r: 3, fill: '#E9DDBA' }); });
      mono(str.slice(0, typed(t, t0, 22)), 340, y + 2, { size: 48, color: C.ink, align: 'left', weight: 600 });
    });
    label('decoded at Bletchley Park; released by GCHQ in 2020', W / 2, 820, { size: 32, color: C.creamFaint, weight: 500 });
  });
  // f8-f10: the machine, one last time
  const eA = seg(t, s('f8', 0.0), s('f8', 0.6)) * (1 - seg(t, e('f10', 0.6), e('f10', 1.4)));
  if (eA > 0) A(eA, () => {
    const ham = hammerA(t, s('f10', 0.1), 5);
    machine(t, { ...M0, win: 'AAA', ...(ham ?? {}), ring: { A: `rgba(210,69,47,${seg(t, s('f10', 0.3), s('f10', 0.8))})` } });
    reflectorRing(t, { a: span(t, s('f8', 0.2), s('f9', 0.3), 0.5, 0.5), draw: 1, cx: 1400, cy: 480, R: 230 });
    A(span(t, s('f8', 0.4), s('f9', 0.3), 0.4, 0.4), () => label('convenient, and never itself', 1400, 860, { size: 38, color: C.creamSoft }));
    A(span(t, s('f9', 0.2), s('f10', 0.3), 0.4, 0.4), () => {
      chip('never itself', 1400, 300, { size: 44, family: SLAB, weight: 700, bg: C.red, fg: C.cream });
      ['German habits', 'captured papers', 'thousands of patient people'].forEach((n, i) => A(seg(t, at('f9', 0.15 + i * 0.22), at('f9', 0.32 + i * 0.22)), () => {
        label('+', 1400, 400 + i * 130 - 4, { size: 44, color: C.brassHi, weight: 700 });
        chip(n, 1400, 450 + i * 130, { size: 40, family: SLAB, weight: 600, bg: C.paper });
      }));
    });
    A(seg(t, s('f10', 0.4), s('f10', 1.0)), () => {
      label('any letter at all,', 1400, 440, { size: 72, color: C.cream, weight: 700 });
      label('except A', 1400, 540, { size: 72, color: C.red, weight: 800 });
    });
  });
  const crA = seg(t, e('f10', 1.0), e('f10', 2.2));
  if (crA > 0) A(crA, () => credits(t));
}
const MUSIC_CREDITS = ['“Mesmerize” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Ghost Story” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Noble Race” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
function credits(t) {
  ctx.fillStyle = 'rgba(8,10,7,0.7)'; ctx.fillRect(0, 0, W, H);
  paper(240, 90, 1440, 900, { tilt: -0.004 });
  label('ENIGMA', W / 2, 175, { size: 88, color: C.ink, weight: 800, spacing: '10px' });
  label('The letter that never came out as itself', W / 2, 240, { size: 36, color: C.inkSoft, weight: 500 });
  const blocks = [
    ['ANIMATION AND SCRIPT', ['Reckon · original animation']],
    ['MUSIC', MUSIC_CREDITS],
    ['SOURCES', ['Wikipedia: Enigma machine; Cryptanalysis of the Enigma; Enigma rotor details;', 'Marian Rejewski; Cipher Bureau (Poland); Zygalski sheets; Bomba; Bombe;', 'Bletchley Park; Ultra; Battle of the Atlantic; German submarine U-559;', 'The Imitation Game. GCHQ’s release of 8 May 2020.']],
    ['THE MACHINE', ['Enigma I simulated in code: rotors I–III, reflectors A and B, plugboard, double step']],
  ];
  let y = 312;
  for (const [h, vals] of blocks) {
    mono(h, W / 2, y, { size: 32, color: C.red, weight: 600, spacing: '3px' });
    vals.forEach((v, j) => label(v, W / 2, y + 42 + j * 40, { size: 32, color: C.ink, weight: 500 }));
    y += 42 + vals.length * 40 + 22;
  }
}

// ---------- the scene ----------
Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [SLAB, MONO],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintTextures();
    background();
    const parts = [partOpen, partKey, partReflector, partNumber, partWarsaw, partSheets, partCribs, partBombe, partUboat, partFinal];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    header(t);
    titleCard(t);
  },
});
