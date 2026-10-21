// Explainer for biology-mega-plate-evolution: on the MEGA-plate, E. coli evolved step by step to grow
// in 1,000 times the antibiotic of the first band that had stopped their ancestors.
// Look: a dark lab bench seen from above. A glowing acrylic dish on black epoxy, bacteria as
// bioluminescent greens and teals, labels in Azeret Mono, captions in Space Grotesk.
//
// Facts. Harvard Medical School, "Bugs on Screen" (2016): a 2-by-4-foot dish; the outermost rims had
// no drug; each section a 10-fold increase, the centre 1,000 times as much; bacteria spread until they
// reached a dose in which they could no longer grow, then a small group adapted; "In the span of 10
// days, bacteria produced mutant strains capable of surviving a dose of the antibiotic trimethoprim
// 1,000 times higher than the one that killed their progenitors"; the strongest mutants were not
// always the fastest and often moved behind more vulnerable strains; who gets there first may depend
// on proximity rather than mutation strength. Baym et al., Science 353:1147 (2016), PMC5534434:
// 120 x 60 cm; symmetric four-step gradients of trimethoprim (TMP: 0, 3, 30, 300, 3000x the wild-type
// MIC) or ciprofloxacin in separate runs; adaptation time 10 days in TMP, 12 in CPR; "evolution is
// not always led by the most resistant mutants; highly resistant mutants may be trapped behind more
// sensitive lineages". The bands here are labelled relative to the first drug band (x1 ... x1,000).
// The spread is a seeded simulation on a grid (first-passage growth with chosen mutation sites), so
// the picture is a diagram: plate proportions are right, timings within the ten days are illustrative.
//
// Scene plan (54.5 s). Content stays above y = 930; captions are centred at y = 840.
//  A  0.0– 8.9  Hook: the plate fades up on the bench.      "A petri dish *120 cm* long, with bands of antibiotic."
//                                                           "Could bacteria evolve their way to the *middle*?"
//  B  8.7–17.9  The bands light up from the edges in, with   "The edges hold none. Each band holds *ten times* more."
//               dose labels and a dose staircase below.      "The middle: *1,000 times* the first band, which stops ordinary ~E. coli~."
//  C 17.7–37.4  The simulation: wild type spreads from both  "~E. coli~ spread from both ends, then *stall* at the drug."
//               edges, stalls; mutants break through, fan    "Until a *mutant* appears that can grow there."
//               out and branch, band after band; a time-     "At every band: stall, mutate, break through."
//               lapse bar runs to about 10 days.             "*Lineages* branch and race, crowding each other out."
//                                                           "In about ~10 days~, they reached the middle."
//  D 37.2–49.0  Zoom into bands x10 | x100 on the left: the  "The first to cross weren't always the *toughest*."
//               first lineage across, and a tougher mutant   "Some *more resistant* mutants were boxed in behind the front."
//               boxed in behind the front.                   "Being in the ~right place~ often mattered more."
//  E 48.8–54.5  Payoff card with a lit staircase.            "Resistance evolved in *steps*, one mutation at a time."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  ink: '#E4FFF5', soft: 'rgba(214,255,240,0.70)', faint: 'rgba(170,255,225,0.24)',
  mint: '#6CFFB8', cyan: '#62E3FF', gold: '#FFEE80', rim: '#3FE6C0', agar: '#030907',
};
// Bacteria by resistance level: 0 is the original strain; level n grows in band n (x1, x10, ...).
const LEVEL_RGB = [[40, 190, 120], [86, 236, 150], [62, 226, 206], [92, 196, 255], [214, 255, 150]];
const MONO = 'AzeretMono', SANS = 'SpaceGrotesk';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the plate and its bands ----------
const CELL = 4, NX = 198, NY = 99, BAND = 22, N = NX * NY;
const PLATE = { x: 33, y: 214, w: NX * CELL, h: NY * CELL };     // 792 x 396: the plate's 2:1 shape
const BAND_LEVEL = [0, 1, 2, 3, 4, 3, 2, 1, 0];
const BAND_DOSE = [0, 1, 10, 100, 1000, 100, 10, 1, 0];          // relative to the first drug band
const doseLabel = (d) => (d ? `×${d.toLocaleString('en-US')}` : '0');
const bandOf = (x) => Math.floor(x / BAND);
const bandX = (b) => PLATE.x + b * BAND * CELL;
const BW = BAND * CELL;
const MIDDLE_TIMES = BAND_DOSE[4] / BAND_DOSE[1];                 // 1,000

// ---------- seeded randomness ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the simulation ----------
// Growth spreads cell to cell (8 neighbours, random local costs), only into bands the lineage can
// tolerate. At chosen sites along each band edge, a mutant one level tougher arises some time after
// the front arrives, and spreads from the far side of the edge; whoever reaches a cell first keeps it.
const SIM = { seed: 20160909, base: 0.05, sites: [0, 4, 4, 4, 3], first: [0, 2.6, 1.3, 0.9, 1.1], stagger: 0.32, jitter: 0.35 };
const TRAP = { x: 2 * BAND + 11, row: 0, born: 0 };   // a tougher mutant behind the front (row/born set below)
function simulate() {
  const rnd = mulberry32(SIM.seed);
  const wgt = new Float32Array(N);
  for (let i = 0; i < N; i++) wgt[i] = 0.55 + 0.9 * rnd();
  const arr = new Float32Array(N).fill(Infinity), lin = new Int16Array(N).fill(-1);
  const lineages = [];
  const add = (level, speed, side, born, origin) => { lineages.push({ id: lineages.length, level, speed, side, born, origin, tint: rnd(), ok: false }); return lineages.length - 1; };
  // mutation sites: cell index -> { delay }
  const sites = new Map();
  for (const side of [0, 1]) for (let lv = 1; lv <= 4; lv++) {
    const rows = [];
    for (let tries = 0; rows.length < SIM.sites[lv] && tries < 500; tries++) {
      const r = 6 + Math.floor(rnd() * (NY - 12));
      if (rows.every((q) => Math.abs(q - r) > 16)) rows.push(r);
    }
    rows.forEach((r, j) => {
      const x = side ? BAND * (9 - lv) : BAND * lv - 1;
      sites.set(r * NX + x, { delay: SIM.first[lv] + j * SIM.stagger + rnd() * SIM.jitter });
    });
  }
  // a binary heap of [time, cell, lineage]
  const hT = [], hC = [], hL = [];
  const push = (t, c, l) => {
    let i = hT.length; hT.push(t); hC.push(c); hL.push(l);
    while (i > 0) { const p = (i - 1) >> 1; if (hT[p] <= hT[i]) break; [hT[p], hT[i]] = [hT[i], hT[p]]; [hC[p], hC[i]] = [hC[i], hC[p]]; [hL[p], hL[i]] = [hL[i], hL[p]]; i = p; }
  };
  const pop = () => {
    const out = [hT[0], hC[0], hL[0]];
    const t = hT.pop(), c = hC.pop(), l = hL.pop();
    if (hT.length) {
      hT[0] = t; hC[0] = c; hL[0] = l;
      let i = 0;
      for (;;) {
        const a = 2 * i + 1, b = a + 1; let m = i;
        if (a < hT.length && hT[a] < hT[m]) m = a;
        if (b < hT.length && hT[b] < hT[m]) m = b;
        if (m === i) break;
        [hT[m], hT[i]] = [hT[i], hT[m]]; [hC[m], hC[i]] = [hC[i], hC[m]]; [hL[m], hL[i]] = [hL[i], hL[m]]; i = m;
      }
    }
    return out;
  };
  const wl = add(0, 1, 0, 0, null), wr = add(0, 1, 1, 0, null);
  for (let y = 0; y < NY; y++) { push(rnd() * 0.05, y * NX, wl); push(rnd() * 0.05, y * NX + NX - 1, wr); }
  while (hT.length) {
    const [t, c, l] = pop();
    if (lin[c] >= 0) continue;
    const L = lineages[l], x = c % NX, y = (c - x) / NX;
    if (L.level < BAND_LEVEL[bandOf(x)]) continue;
    lin[c] = l; arr[c] = t; L.ok = true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) continue;
      const n = ny * NX + nx;
      if (lin[n] >= 0) continue;
      const need = BAND_LEVEL[bandOf(nx)];
      if (need <= L.level) push(t + SIM.base * wgt[n] * (dx && dy ? 1.414 : 1) / L.speed, n, l);
      else if (need === L.level + 1 && dy === 0 && sites.has(c) && !sites.get(c).used) {
        const s = sites.get(c); s.used = true;
        const id = add(L.level + 1, 0.85 + 0.3 * rnd(), L.side, t + s.delay, [nx, ny]);
        push(t + s.delay, n, id);
      }
    }
  }
  return { arr, lin, lineages };
}
const { arr: ARR, lin: LIN, lineages: LINEAGES } = simulate();
const MUTANTS = LINEAGES.filter((L) => L.ok && L.origin);
const firstOf = (side, level) => MUTANTS.filter((L) => L.side === side && L.level === level).sort((a, b) => a.born - b.born)[0];
const FIRST_ACROSS = firstOf(0, 3);
// The tougher mutant: in band x10 on the left, a few rows from where the first x100 lineage began,
// arising once that stretch is filled, so it has no free space to grow into.
TRAP.row = clamp(FIRST_ACROSS.origin[1] + (FIRST_ACROSS.origin[1] > NY / 2 ? -13 : 13), 8, NY - 9);
TRAP.born = ARR[TRAP.row * NX + TRAP.x] + 0.9;
let MIDDLE_FULL = 0, END_DAY = 0;
for (let c = 0; c < N; c++) { END_DAY = Math.max(END_DAY, ARR[c]); if (bandOf(c % NX) === 4) MIDDLE_FULL = Math.max(MIDDLE_FULL, ARR[c]); }

// Video time <-> simulated days: a steady time-lapse through scene C.
const LAPSE = { t0: 18.0, t1: 35.6 };
const SETTLE = 0.8;                       // after the last cell is reached, let it grow to full density
const DAYS = 10;                          // "about 10 days" (trimethoprim), the length of the lapse bar
const dayAt = (t) => ((t - LAPSE.t0) / (LAPSE.t1 - LAPSE.t0)) * END_DAY;
const tAt = (d) => LAPSE.t0 + (d / END_DAY) * (LAPSE.t1 - LAPSE.t0);
const firstStall = (() => { let m = Infinity; for (let y = 0; y < NY; y++) m = Math.min(m, ARR[y * NX + BAND - 1]); return m; })();

window.DEBUG = {
  END_DAY, MIDDLE_FULL, firstStall, TRAP, FIRST_ACROSS,
  firsts: [1, 2, 3, 4].map((lv) => [firstOf(0, lv)?.born, firstOf(1, lv)?.born].map((d) => d && +d.toFixed(2))),
  firstsT: [1, 2, 3, 4].map((lv) => +tAt(Math.min(firstOf(0, lv).born, firstOf(1, lv).born)).toFixed(2)),
  mutants: MUTANTS.map((L) => [L.side, L.level, +L.born.toFixed(2), L.origin[1]]),
  stallT: +tAt(firstStall).toFixed(2),
};

// ---------- textures, made once ----------
let BENCH = null;
function makeBench() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W * 0.38, 330, 40, W / 2, 470, 900);
  base.addColorStop(0, '#0C1714'); base.addColorStop(0.5, '#060D0B'); base.addColorStop(1, '#020504');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(5);
  for (let i = 0; i < 90; i++) {           // soft blotches in the epoxy
    const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 200;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.015 + rnd() * 0.03;
    gr.addColorStop(0, rnd() < 0.5 ? `rgba(60,140,120,${a})` : `rgba(0,0,0,${a * 2})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 2600; i++) {         // fine speckle
    g.fillStyle = `rgba(${rnd() < 0.5 ? '190,255,235' : '0,0,0'},${0.03 + rnd() * 0.07})`;
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd(), 1 + rnd());
  }
  // a faint overhead light reflection
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, 'rgba(160,255,230,0.035)'); lg.addColorStop(0.35, 'rgba(160,255,230,0)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 780);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}

// Each lineage's colour: one of three shades of its level's colour, a little brighter or dimmer.
const SHADES = [
  [[34, 170, 104]],
  [[82, 236, 140], [120, 244, 150], [52, 206, 150]],
  [[44, 222, 204], [72, 192, 236], [120, 238, 198]],
  [[84, 172, 255], [106, 152, 255], [66, 212, 250]],
  [[214, 255, 150], [240, 255, 200], [172, 255, 180]],
];
const shadeN = [0, 0, 0, 0, 0];
const LCOL = LINEAGES.map((L) => {
  if (!L.origin) return SHADES[0][0];
  const list = SHADES[L.level], c = list[shadeN[L.level]++ % list.length];
  return c.map((v) => Math.min(255, v * (0.9 + 0.18 * L.tint)));
});
const TRAP_RGB = [255, 238, 128];
const TRAP_ID = -2;

// Smooth value noise, for organic colony edges and grain.
function valueNoise(seed, n = 64) {
  const r = mulberry32(seed), g = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) g[i] = r();
  const at = (x, y) => g[(((y % n) + n) % n) * n + (((x % n) + n) % n)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    return lerp(lerp(at(xi, yi), at(xi + 1, yi), su), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), su), sv);
  };
}
const WX = valueNoise(11), WY = valueNoise(12), GR = valueNoise(13);
/** The grid cell shown at plate pixel (px, py): the grid gently warped, but never across a band edge. */
function cellAt(px, py) {
  const wx = (WX(px / 16, py / 16) - 0.5) * 10 + (WX(px / 5 + 40, py / 5) - 0.5) * 3;
  const wy = (WY(px / 16, py / 16) - 0.5) * 10 + (WY(px / 5, py / 5 + 40) - 0.5) * 3;
  const b = bandOf(clamp(Math.floor(px / CELL), 0, NX - 1));
  const cx = clamp(Math.floor((px + wx) / CELL), b * BAND, b * BAND + BAND - 1);
  const cy = clamp(Math.floor((py + wy) / CELL), 0, NY - 1);
  return cy * NX + cx;
}
/** A pixel map: which cell each pixel shows, the neighbouring cell across a lineage seam, grain, and distance to the trapped mutant. */
function buildMap(w, h, toPlate, grainScale) {
  const n = w * h, map = new Int32Array(n), seam = new Int32Array(n).fill(-1), grain = new Float32Array(n), trap = new Float32Array(n);
  const rnd = mulberry32(w * 7 + h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const p = j * w + i, [px, py] = toPlate(i, j);
    map[p] = cellAt(px, py);
    grain[p] = (0.8 + 0.2 * rnd()) * (0.84 + 0.3 * GR(px / grainScale, py / grainScale));
    trap[p] = Math.hypot(px / CELL - (TRAP.x + 0.5), py / CELL - (TRAP.row + 0.5)) + (GR(px / 2.5 + 9, py / 2.5) - 0.5) * 1.4;
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const p = j * w + i, c = map[p];
    const r = i + 1 < w ? map[p + 1] : c, d = j + 1 < h ? map[p + w] : c;
    if (LIN[r] !== LIN[c]) seam[p] = r; else if (LIN[d] !== LIN[c]) seam[p] = d;
  }
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  return { w, h, map, seam, grain, trap, cv, g, img: g.createImageData(w, h) };
}
const TRAP_R = 2.1;   // cells: the trapped mutant's little colony
/** Paint a map's colonies at `day`; dimOf(lineage) can fade lineages out of focus. */
function paintMap(M, day, dimOf = null) {
  const d = M.img.data, n = M.w * M.h;
  const trapR = TRAP_R * eout(seg(day, TRAP.born, TRAP.born + 1.0));
  for (let p = 0; p < n; p++) {
    const c = M.map[p], a0 = ARR[c], o = 4 * p;
    if (!(a0 <= day)) { d[o + 3] = 0; continue; }
    const dens = eout(clamp((day - a0) / 0.5));
    let l = LIN[c], rgb = LCOL[l];
    if (trapR > 0 && M.trap[p] <= trapR) { l = TRAP_ID; rgb = TRAP_RGB; }
    let lum = (0.24 + 0.62 * dens) * M.grain[p] * (dimOf ? dimOf(l) : 1);
    const sn = M.seam[p];
    if (sn >= 0 && ARR[sn] <= day && l !== TRAP_ID) lum *= 0.3;
    d[o] = rgb[0] * lum; d[o + 1] = rgb[1] * lum; d[o + 2] = rgb[2] * lum; d[o + 3] = 255 * clamp(0.1 + dens);
  }
  M.g.putImageData(M.img, 0, 0);
  return M.cv;
}
let PMAP = null, ZMAP = null;
function drawColonies(cv, x, y, w, h, glow = 1) {
  ctx.drawImage(cv, x, y, w, h);
  if (glow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= 0.32 * glow; ctx.filter = 'blur(8px)';
    ctx.drawImage(cv, x, y, w, h);
    ctx.restore();
  }
}

// ---------- drawing the plate ----------
function bandsOn(t, b) {
  const i = Math.min(b, 8 - b);              // 0 at the edges, 4 in the middle
  return eout(seg(t, 9.2 + i * 0.75, 9.9 + i * 0.75));
}
function drawPlate(t, day) {
  const { x, y, w, h } = PLATE;
  // glow and body
  ctx.save();
  ctx.shadowColor = 'rgba(63,230,192,0.30)'; ctx.shadowBlur = 46;
  rrect(x - 8, y - 8, w + 16, h + 16, 14); ctx.fillStyle = '#04100D'; ctx.fill();
  ctx.restore();
  rrect(x, y, w, h, 8); ctx.fillStyle = C.agar; ctx.fill();
  ctx.save(); rrect(x, y, w, h, 8); ctx.clip();
  // the bands: a teal tint that deepens with the dose
  for (let b = 0; b < 9; b++) {
    const on = bandsOn(t, b), lv = BAND_LEVEL[b];
    ctx.fillStyle = `rgba(70,255,205,${(0.012 + 0.022 * lv) * (0.25 + 0.75 * on)})`;
    ctx.fillRect(bandX(b), y, BW, h);
  }
  if (day > 0) {
    if (!PMAP) PMAP = buildMap(PLATE.w, PLATE.h, (i, j) => [i + 0.5, j + 0.5], 6);
    drawColonies(paintMap(PMAP, day), x, y, w, h);
  }
  for (let b = 1; b < 9; b++) {
    ctx.fillStyle = `rgba(150,255,225,${0.10 + 0.14 * bandsOn(t, Math.min(b, 9 - b))})`;
    ctx.fillRect(bandX(b) - 1, y, 2, h);
  }
  // a glassy sheen
  const sh = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
  sh.addColorStop(0, 'rgba(200,255,240,0.06)'); sh.addColorStop(0.4, 'rgba(200,255,240,0)'); sh.addColorStop(1, 'rgba(200,255,240,0.025)');
  ctx.fillStyle = sh; ctx.fillRect(x, y, w, h);
  ctx.restore();
  // acrylic rim
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,255,220,0.55)'; rrect(x - 4, y - 4, w + 8, h + 8, 11); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(220,255,245,0.25)'; rrect(x - 8, y - 8, w + 16, h + 16, 14); ctx.stroke();
}

function doseLabels(t) {
  font(600, 22, MONO);
  for (let b = 0; b < 9; b++) {
    const on = bandsOn(t, b);
    withAlpha(on, () => text(doseLabel(BAND_DOSE[b]), bandX(b) + BW / 2, 194 + (1 - on) * 8, { color: BAND_LEVEL[b] ? C.ink : C.soft, align: 'center' }));
  }
}

const STAIR = { base: 770, step: 21 };
function staircase(t, a = 1) {
  withAlpha(a, () => {
    font(600, 22, MONO); text('DOSE · ×10 PER STEP', PLATE.x, 694, { color: C.soft });
    ctx.fillStyle = C.faint; ctx.fillRect(PLATE.x, STAIR.base, PLATE.w, 2);
    for (let b = 0; b < 9; b++) {
      const lv = BAND_LEVEL[b], on = bandsOn(t, b);
      if (!lv) continue;
      const hh = STAIR.step * lv * eout(on), bx = bandX(b) + 5, bw = BW - 10;
      const g = ctx.createLinearGradient(0, STAIR.base - STAIR.step * 4, 0, STAIR.base);
      g.addColorStop(0, 'rgba(98,227,255,0.55)'); g.addColorStop(1, 'rgba(108,255,184,0.18)');
      ctx.fillStyle = g; ctx.fillRect(bx, STAIR.base - hh, bw, hh);
      ctx.fillStyle = C.mint; ctx.fillRect(bx, STAIR.base - hh - 1, bw, 3);
    }
  });
}

// ---------- header, captions ----------
function header() {
  font(700, 22); text('RECKON', 36, 78, { spacing: '4px' });
  const w = ctx.measureText('RECKON').width + 6 * 4;
  font(500, 22, MONO); text('BIOLOGY · EVOLUTION', 36 + w + 20, 78, { color: C.soft, spacing: '1px' });
}

const CUES = [
  [0.5, 4.6, 'A petri dish *120 cm* long, with bands of antibiotic.'],
  [4.7, 8.8, 'Could bacteria evolve their way to the *middle*?'],
  [9.0, 13.2, 'The edges hold none. Each band holds *ten times* more.'],
  [13.3, 17.9, `The middle: *${MIDDLE_TIMES.toLocaleString('en-US')} times* the first band, which stops ordinary ~E. coli~.`],
  [18.1, 22.5, '~E. coli~ spread from both ends, then *stall* at the drug.'],
  [22.6, 26.7, 'Until a *mutant* appears that can grow there.'],
  [26.8, 30.4, 'At every band: stall, mutate, break through.'],
  [30.5, 34.0, '*Lineages* branch and race, crowding each other out.'],
  [34.1, 37.6, `In about ~${DAYS} days~, they reached the middle.`],
  [37.9, 41.5, 'The first to cross weren’t always the *toughest*.'],
  [41.6, 45.6, 'Some *more resistant* mutants were boxed in behind the front.'],
  [45.7, 49.2, 'Being in the ~right place~ often mattered more.'],
  [49.4, 53.8, 'Resistance evolved in *steps*, one mutation at a time.'],
];
const CAP = { size: 42, lh: 54, weight: 700, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.mint, '~': C.cyan } });
  }
}

/** A dark pill with a coloured outline. */
function tag(s, x, y, color, a = 1, size = 22) {
  withAlpha(a, () => {
    font(600, size, MONO);
    const w = ctx.measureText(s).width + 26;
    rrect(x - w / 2, y - 19, w, 38, 19); ctx.fillStyle = 'rgba(2,10,8,0.86)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    text(s, x, y + 1, { color, align: 'center', base: 'middle' });
  });
}
const cellXY = (cx, cy) => [PLATE.x + (cx + 0.5) * CELL, PLATE.y + (cy + 0.5) * CELL];

// ---------- scenes A–C: the whole plate ----------
function plateView(t, ov = 1) {
  const day = t >= LAPSE.t0 ? Math.min(END_DAY + SETTLE, dayAt(t)) : 0;
  const appear = eout(seg(t, 0.2, 1.8));
  withAlpha(appear, () => {
    ctx.save();
    const s = 1.05 - 0.05 * appear;
    ctx.translate(W / 2, PLATE.y + PLATE.h / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(PLATE.y + PLATE.h / 2));
    drawPlate(t, day);
    ctx.restore();
  });
  withAlpha(ov, () => doseLabels(t));
  // the hook: how long the plate is, and the middle the bacteria would have to reach
  withAlpha(span(t, 0.9, 9.1, 0.5, 0.5), () => {
    const y = 186, x0 = PLATE.x, x1 = PLATE.x + PLATE.w;
    font(600, 24, MONO);
    const lw = ctx.measureText('120 cm').width + 28;
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(W / 2 - lw / 2, y); ctx.moveTo(W / 2 + lw / 2, y); ctx.lineTo(x1, y);
    ctx.moveTo(x0, y - 9); ctx.lineTo(x0, y + 9); ctx.moveTo(x1, y - 9); ctx.lineTo(x1, y + 9); ctx.stroke();
    text('120 cm', W / 2, y + 1, { color: C.ink, align: 'center', base: 'middle' });
  });
  withAlpha(span(t, 4.9, 9.4, 0.4, 0.5), () => {
    const x = bandX(4), pulse = 0.6 + 0.4 * Math.sin(t * 4);
    ctx.save(); ctx.shadowColor = C.mint; ctx.shadowBlur = 24 * pulse;
    ctx.strokeStyle = C.mint; ctx.lineWidth = 3; rrect(x + 3, PLATE.y + 3, BW - 6, PLATE.h - 6, 6); ctx.stroke();
    ctx.restore();
    tag('MIDDLE', x + BW / 2, PLATE.y + PLATE.h / 2, C.mint);
  });
  // what the plate is
  withAlpha(appear * ov, () => {
    font(600, 22, MONO);
    text('MEGA-PLATE · 120 × 60 cm · TRIMETHOPRIM', PLATE.x, 650, { color: C.soft });
    text(t < 17.6 ? 'DIAGRAM' : 'SIMULATION', PLATE.x + PLATE.w, 650, { color: C.soft, align: 'right' });
  });
  staircase(t, eout(seg(t, 9.0, 9.8)) * ov);
  if (t > Z.box) withAlpha(ov, () => zoomBox(t));
  // inoculation: the edges glow as the bacteria go on
  withAlpha(span(t, 17.4, 19.2, 0.3, 0.8), () => {
    for (const ex of [PLATE.x + 2, PLATE.x + PLATE.w - 2]) {
      const g = ctx.createRadialGradient(ex, PLATE.y + PLATE.h / 2, 0, ex, PLATE.y + PLATE.h / 2, 60);
      g.addColorStop(0, 'rgba(108,255,184,0.5)'); g.addColorStop(1, 'rgba(108,255,184,0)');
      ctx.fillStyle = g; ctx.fillRect(ex - 60, PLATE.y, 120, PLATE.h);
    }
  });
  if (t < LAPSE.t0 - 0.5) return;
  // the time-lapse bar
  withAlpha(span(t, 17.7, 37.4, 0.4, 0.4) * ov, () => {
    font(600, 22, MONO); text('TIME-LAPSE', 36, 152, { color: C.soft });
    const x0 = 210, x1 = 560, p = clamp(day / END_DAY);
    rrect(x0, 143, x1 - x0, 8, 4); ctx.fillStyle = 'rgba(170,255,225,0.14)'; ctx.fill();
    rrect(x0, 143, Math.max(8, (x1 - x0) * p), 8, 4); ctx.fillStyle = C.mint; ctx.fill();
    text(`≈${DAYS} DAYS`, x1 + 16, 152, { color: p >= 1 ? C.cyan : C.soft });
  });
  // "stalled" at the first band, until the first mutant
  const m1 = Math.min(firstOf(0, 1).born, firstOf(1, 1).born);
  const stallA = span(t, tAt(firstStall) + 0.4, tAt(m1) + 0.3, 0.3, 0.3);
  tag('STALLED', bandX(1), PLATE.y + 30, C.ink, stallA);
  tag('STALLED', bandX(8), PLATE.y + 30, C.ink, stallA);
  // birth flashes for every mutant lineage
  for (const L of MUTANTS) {
    const tb = tAt(L.born), u = seg(t, tb, tb + 0.7);
    if (u <= 0 || u >= 1) continue;
    const [px, py] = cellXY(...L.origin);
    withAlpha(1 - u, () => {
      ctx.beginPath(); ctx.arc(px, py, 5 + 26 * eout(u), 0, TAU);
      ctx.strokeStyle = `rgb(${LCOL[L.id].map(Math.round).join(',')})`; ctx.lineWidth = 3; ctx.stroke();
    });
  }
  // name the first mutant on the left
  const f1 = firstOf(0, 1), tf = tAt(f1.born);
  const [fx, fy] = cellXY(...f1.origin);
  withAlpha(span(t, tf, tf + 2.8, 0.25, 0.4), () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx + 6, fy - 6); ctx.lineTo(fx + 30, fy - 34); ctx.stroke();
    tag('MUTANT', fx + 70, fy - 50, C.mint);
  });
}

// ---------- scene D: the zoom ----------
// Bands x10 and x100 on the left, exactly: 44 cells wide, 44 rows around the two lineages of interest.
const REG = { x: 2 * BAND, w: 2 * BAND, h: 2 * BAND };
REG.y = clamp(Math.round((FIRST_ACROSS.origin[1] + TRAP.row) / 2) - REG.h / 2, 0, NY - REG.h);
const PANEL = { x: 132, y: 168, w: 600, h: 600 };
const ZS = PANEL.w / (REG.w * CELL);
const REGC = [PLATE.x + (REG.x + REG.w / 2) * CELL, PLATE.y + (REG.y + REG.h / 2) * CELL];
const PANC = [PANEL.x + PANEL.w / 2, PANEL.y + PANEL.h / 2];
const Z = { box: 36.2, in0: 37.0, in1: 38.3, out0: 48.4, out1: 49.2 };

function camera(e) {
  const s = Math.pow(ZS, e);
  ctx.translate(lerp(REGC[0], PANC[0], e) - s * REGC[0], lerp(REGC[1], PANC[1], e) - s * REGC[1]);
  ctx.scale(s, s);
}
const zx = (cx) => PANEL.x + (cx - REG.x + 0.5) * CELL * ZS;
const zy = (cy) => PANEL.y + (cy - REG.y + 0.5) * CELL * ZS;

/** The box on the plate that the camera is about to zoom into. */
function zoomBox(t) {
  withAlpha(seg(t, Z.box, Z.box + 0.4), () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    rrect(PLATE.x + REG.x * CELL, PLATE.y + REG.y * CELL, REG.w * CELL, REG.h * CELL, 6); ctx.stroke();
  });
}

function zoomView(t) {
  const e = eio(seg(t, Z.in0, Z.in1));
  const hi = seg(t, Z.in1 - 0.15, Z.in1 + 0.35);     // crossfade to the detailed view
  const clipA = [lerp(0, PANEL.x, e), lerp(0, PANEL.y, e), lerp(W, PANEL.w, e), lerp(H, PANEL.h, e)];
  ctx.save();
  rrect(...clipA, 22 * e); ctx.clip();
  if (hi < 1) {
    ctx.save(); camera(e);
    ctx.drawImage(BENCH, 0, 0);
    plateView(t, 1 - seg(e, 0, 0.35));
    ctx.restore();
  }
  if (hi > 0) withAlpha(hi, () => detail(t));
  ctx.restore();
  withAlpha(e, () => {
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(120,255,220,0.6)'; rrect(...clipA, 22 * e); ctx.stroke();
  });
  withAlpha(hi, () => {
    font(600, 22, MONO);
    text('ZOOMED IN · SIMULATION', PANEL.x, PANEL.y - 18, { color: C.soft });
  });
}

// In the zoom, the clip rewinds and replays the last days of this stretch: the front stalls at the
// x100 edge, the tougher mutant appears behind it, and a weaker lineage crosses first.
const REPLAY = { rw0: 38.5, rw1: 39.1, p0: 39.4, p1: 43.4, d0: TRAP.born - 0.35, d1: END_DAY + SETTLE };
function zoomDay(t) {
  if (t < REPLAY.rw0) return REPLAY.d1;
  if (t < REPLAY.p0) return lerp(REPLAY.d1, REPLAY.d0, eio(seg(t, REPLAY.rw0, REPLAY.rw1)));
  return lerp(REPLAY.d0, REPLAY.d1, seg(t, REPLAY.p0, REPLAY.p1));
}
const tOfZoomDay = (d) => lerp(REPLAY.p0, REPLAY.p1, (d - REPLAY.d0) / (REPLAY.d1 - REPLAY.d0));

/** The zoomed region at full detail, with the first lineage across and the boxed-in mutant. */
function detail(t) {
  if (!ZMAP) ZMAP = buildMap(PANEL.w, PANEL.h, (i, j) => [REG.x * CELL + (i + 0.5) / ZS, REG.y * CELL + (j + 0.5) / ZS], 6);
  const xb = zx(3 * BAND) - (CELL * ZS) / 2;                    // the edge between x10 and x100
  ctx.fillStyle = C.agar; ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
  ctx.fillStyle = 'rgba(70,255,205,0.056)'; ctx.fillRect(PANEL.x, PANEL.y, xb - PANEL.x, PANEL.h);
  ctx.fillStyle = 'rgba(70,255,205,0.078)'; ctx.fillRect(xb, PANEL.y, PANEL.x + PANEL.w - xb, PANEL.h);
  const day = zoomDay(t);
  const tFirst = tOfZoomDay(FIRST_ACROSS.born), tTrap = tOfZoomDay(TRAP.born);
  const f1 = eio(seg(t, tFirst + 0.6, tFirst + 1.4)), f2 = eio(seg(t, 41.7, 42.3));
  const dimOf = (l) => (l === FIRST_ACROSS.id ? 1 : l === TRAP_ID ? 1 - 0.55 * f1 * (1 - f2) : 1 - 0.55 * f1);
  drawColonies(paintMap(ZMAP, day, dimOf), PANEL.x, PANEL.y, PANEL.w, PANEL.h, 1.2);
  ctx.fillStyle = 'rgba(150,255,225,0.55)'; ctx.fillRect(xb - 1.5, PANEL.y, 3, PANEL.h);
  tag(doseLabel(BAND_DOSE[2]), (PANEL.x + xb) / 2, PANEL.y + 34, C.ink);
  tag(doseLabel(BAND_DOSE[3]), (xb + PANEL.x + PANEL.w) / 2, PANEL.y + 34, C.ink);
  // rewind, then replay
  withAlpha(span(t, REPLAY.rw0, REPLAY.p0 + 0.5, 0.2, 0.3), () => tag('◀◀ REWIND', PANEL.x + PANEL.w - 104, PANEL.y + PANEL.h - 36, C.soft));
  withAlpha(span(t, REPLAY.p0, REPLAY.p1, 0.2, 0.4), () => tag('REPLAY ▶', PANEL.x + PANEL.w - 96, PANEL.y + PANEL.h - 36, C.soft));
  // the first lineage across: where it began, just over the edge
  const [ox, oy] = [zx(FIRST_ACROSS.origin[0]), zy(FIRST_ACROSS.origin[1])];
  const u = seg(t, tFirst, tFirst + 0.7);
  withAlpha(u > 0 && t < tFirst + 0.7 ? 1 - u : 0, () => {
    ctx.beginPath(); ctx.arc(ox, oy, 8 + 40 * eout(u), 0, TAU); ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke();
  });
  withAlpha(seg(t, tFirst + 0.3, tFirst + 0.8), () => {
    const up = oy > PANC[1], ly = oy + (up ? -80 : 80);
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(2,10,8,0.7)';
    ctx.beginPath(); ctx.arc(ox, oy, 15, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.arc(ox, oy, 15, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 9, oy + (up ? -12 : 12)); ctx.lineTo(ox + 40, ly + (up ? 19 : -19)); ctx.stroke();
    tag('FIRST ACROSS', clamp(ox + 96, PANEL.x + 110, PANEL.x + PANEL.w - 110), ly, C.cyan);
  });
  // the tougher mutant, boxed in behind the front
  const [tx, ty] = [zx(TRAP.x), zy(TRAP.row)];
  const v = seg(t, tTrap, tTrap + 0.7);
  withAlpha(v > 0 && v < 1 ? 1 - v : 0, () => {
    ctx.beginPath(); ctx.arc(tx, ty, 8 + 40 * eout(v), 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
  });
  withAlpha(seg(t, 41.9, 42.5), () => {
    const pulse = 1 + 0.08 * Math.sin(t * 5);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(tx, ty, (TRAP_R + 1.6) * CELL * ZS * pulse, 0, TAU); ctx.stroke();
    const ly = ty - 96;
    tag('TOUGHER, BOXED IN', clamp(tx, PANEL.x + 140, PANEL.x + PANEL.w - 140), ly, C.gold);
  });
}

// ---------- scene E: payoff ----------
function payoff(t) {
  const p = eout(seg(t, 49.0, 49.8));
  withAlpha(p, () => {
    ctx.save(); ctx.translate(0, (1 - p) * 20);
    // a staircase that lights up step by step
    const x0 = 192, y0 = 660, sw = 120, sh = 70;
    for (let i = 0; i < 4; i++) {
      const on = eout(seg(t, 49.5 + i * 0.45, 50.0 + i * 0.45));
      const x = x0 + i * sw, hh = sh * (i + 1);
      rrect(x + 6, y0 - hh, sw - 12, hh, 10);
      ctx.fillStyle = 'rgba(170,255,225,0.07)'; ctx.fill();
      withAlpha(on, () => {
        ctx.save(); ctx.shadowColor = `rgb(${LEVEL_RGB[i + 1].join(',')})`; ctx.shadowBlur = 28;
        rrect(x + 6, y0 - hh, sw - 12, hh, 10); ctx.fillStyle = `rgba(${LEVEL_RGB[i + 1].join(',')},0.85)`; ctx.fill();
        ctx.restore();
        font(700, 24, MONO); text(doseLabel(BAND_DOSE[i + 1]), x + sw / 2, y0 - hh - 18, { color: C.ink, align: 'center' });
      });
    }
    ctx.fillStyle = C.faint; ctx.fillRect(x0 - 20, y0, 4 * sw + 40, 2);
    font(700, 60); text('Resistance, step by step', W / 2, 196, { align: 'center', base: 'middle' });
    font(500, 30); text(`${MIDDLE_TIMES.toLocaleString('en-US')} times the first dose in about ${DAYS} days`, W / 2, 256, { color: C.soft, align: 'center', base: 'middle' });
    font(500, 22, MONO);
    text('SOURCES: BAYM ET AL., SCIENCE (2016)', W / 2, 718, { color: C.soft, align: 'center' });
    text('HARVARD MEDICAL SCHOOL · TRIMETHOPRIM RUN', W / 2, 750, { color: C.soft, align: 'center' });
    ctx.restore();
  });
}

Kit.scene({
  width: W, height: H, duration: 54.5,
  fonts: [
    { family: MONO, file: 'AzeretMono.woff2', weight: '100 900' },
    { family: SANS, file: 'SpaceGrotesk.woff2', weight: '300 700' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BENCH) BENCH = makeBench();
    ctx.drawImage(BENCH, 0, 0);
    if (t < Z.in0) plateView(t);
    else if (t < Z.out1) withAlpha(1 - seg(t, Z.out0, Z.out1), () => zoomView(t));
    if (t >= 48.8) payoff(t);
    header();
    captions(t);
  },
});
