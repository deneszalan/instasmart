// Explainer for space-ancient-sunlight: the energy in sunlight spent millennia escaping the Sun.
// Look: inside the Sun. Glowing radial gradients from deep crimson through orange to white-yellow,
// a drifting granulation texture, a tiny bright photon. One family: Exo 2.
//
// Facts (Wikipedia, "Sun"): core out to about 20-25% of the radius, where fusion releases energy;
// radiative zone from about 0.25 to 0.7 solar radii; convection zone from 0.7 radii to near the
// surface; light in the radiative zone is absorbed "usually after travelling only a few millimetres"
// and re-emitted "in a random direction"; "Estimates of the photon travel time range between 10,000
// and 170,000 years"; mean distance about 1.496e8 km, 8 min 19 s at light speed (infobox).
// The random walk is drawn by a seeded simulation; the "one second" comparison is computed below.
//
// Scene plan (seconds)                                    Captions
// A  0.0- 8.0  Hook: the glowing Sun, light streaming off   "Sunlight reaches Earth in about *8 minutes*."
//                                                          "But how long did it take to *escape the Sun*?"
// B  7.8-16.4  The Sun moves aside and a cutaway opens:    "It starts in the *core*, where fusion releases energy."
//              core, radiative zone, convection zone        "Around it lies the *radiative zone*: dense, hot gas."
// C 16.0-29.6  Zoom into the radiative zone: a seeded       "There, light usually gets *a few millimetres* before it’s absorbed."
//              random walk, slow at first, then fast        "Then it’s re-emitted in a *random direction*. Again and again."
//                                                          "This zigzag *random walk* drifts outward only slowly."
// D 28.9-37.9  Back to the cutaway: a walk to the edge of   "Near the top, churning *convection* carries the energy up."
//              the radiative zone, convection to the top,   "In all, an estimated *10,000 to 170,000 years* to reach the surface."
//              then a range gauge of the estimates
// E 37.7-42.6  The Sun slides left; light flies to Earth    "From there, it streaks to Earth in ~about 8 minutes~."
//              while a clock counts to 8:19
// F 42.3-49.9  Shrink the trip to 1 s: a grid of years      "Shrink that trip to ~one second~…"
//              (20 solid for the low estimate, 340 total)    "…and the escape would take *20 to 340 years*."
// G 49.7-53.5  Payoff card                                 "Fresh light, *ancient* energy."
const W = 864, H = 1080;
const { clamp, seg, lerp, fmt, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  ink: '#FFF0DC', soft: 'rgba(255,232,206,0.70)', faint: 'rgba(255,232,206,0.26)',
  gold: '#FFC94A', amber: '#FFB43C', ember: '#E8601E', crimson: '#9E1A1A', ice: '#93D6FF', earth: '#4DA3E8',
};
const F = 'Exo2';   // the Exo 2 face, registered without the space so canvas font strings parse

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- the numbers ----------
const ESCAPE_YEARS = [10000, 170000];   // Wikipedia "Sun": estimates of the photon travel time
const TRIP_S = 8 * 60 + 19;             // Wikipedia "Sun" infobox: 1 au, 8 min 19 s at light speed
const sig2 = (x) => { const p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };
// If the trip to Earth took 1 second, every year of escape becomes years/TRIP_S years.
const SCALED = ESCAPE_YEARS.map((y) => sig2(y / TRIP_S));      // [20, 340]
const ZONES = { core: 0.25, rad: 0.7 };                           // fractions of the solar radius

// ---------- textures, made once ----------
function makeBackdrop() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W / 2, 420, 30, W / 2, 420, 860);
  base.addColorStop(0, '#3E0A12'); base.addColorStop(0.45, '#1D050B'); base.addColorStop(1, '#080105');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = rng(7);
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W, y = rnd() * H, r = 50 + rnd() * 170, a = 0.02 + rnd() * 0.05;
    const tint = rnd() < 0.55 ? '255,96,40' : '130,10,34';
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${tint},${a})`); gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 220; i++) {
    g.fillStyle = `rgba(255,205,160,${0.05 + rnd() * 0.12})`;
    g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.6 + rnd() * 1.1, 0, TAU); g.fill();
  }
  return cv;
}

/** A tiling Voronoi texture: bright granules with dark lanes, like the solar granulation. */
function makeGranules(size, cell, seed) {
  const rnd = rng(seed), n = size / cell, pts = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    pts.push([(i + 0.12 + 0.76 * rnd()) * cell, (j + 0.12 + 0.76 * rnd()) * cell, 0.72 + 0.28 * rnd()]);
  }
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d');
  const img = g.createImageData(size, size);
  const lo = [190, 58, 24], mid = [242, 124, 38], hi = [255, 206, 112];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const ci = Math.floor(x / cell), cj = Math.floor(y / cell);
    let d1 = 1e9, d2 = 1e9, b = 1;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (ci + di + n) % n, jj = (cj + dj + n) % n, p = pts[jj * n + ii];
      const d = Math.hypot(x - (p[0] + (ci + di - ii) * cell), y - (p[1] + (cj + dj - jj) * cell));
      if (d < d1) { d2 = d1; d1 = d; b = p[2]; } else if (d < d2) d2 = d;
    }
    const edge = clamp((d2 - d1) / (cell * 0.32));
    const v = clamp(b * (0.25 + 0.75 * Math.sqrt(edge)) * (1 - 0.3 * clamp(d1 / cell)));
    const [c0, c1, u] = v < 0.55 ? [lo, mid, v / 0.55] : [mid, hi, (v - 0.55) / 0.45];
    const o = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) img.data[o + c] = c0[c] + (c1[c] - c0[c]) * u;
    img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  // soften the lanes a touch, blurring a 3x3 tiling so the edges still wrap
  const big = document.createElement('canvas'); big.width = big.height = size * 3;
  const bg = big.getContext('2d');
  bg.filter = 'blur(1.1px)';
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) bg.drawImage(cv, i * size, j * size);
  g.clearRect(0, 0, size, size);
  g.drawImage(big, size, size, size, size, 0, 0, size, size);
  return cv;
}

/** Dense, glowing plasma for the zoomed view: soft specks, made once. */
function makePlasma(w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const rnd = rng(23);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w, y = rnd() * h, r = 30 + rnd() * 90;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,170,70,${0.05 + rnd() * 0.07})`); gr.addColorStop(1, 'rgba(255,170,70,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(255,${180 + Math.floor(rnd() * 60)},${110 + Math.floor(rnd() * 60)},${0.10 + rnd() * 0.22})`;
    g.beginPath(); g.arc(rnd() * w, rnd() * h, 0.8 + rnd() * 1.8, 0, TAU); g.fill();
  }
  return cv;
}

const BACKDROP = makeBackdrop();
const GRAN = makeGranules(448, 14, 11);
let granPattern = null;

// ---------- the random walk (zoomed view) ----------
const PANEL = { x: 48, y: 128, w: 768, h: 572 };
const PLASMA = makePlasma(PANEL.w, PANEL.h);
/** Find, deterministically, an unbiased 2D walk that starts low and leaves through the top. */
function makeWalk() {
  const L = 24, xl = PANEL.x + 34, xr = PANEL.x + PANEL.w - 34, top = PANEL.y + 40, bottom = PANEL.y + PANEL.h - 28;
  for (let seed = 1; seed < 40000; seed++) {
    const rnd = rng(seed * 7919);
    let x = W / 2, y = PANEL.y + PANEL.h - 86;
    const pts = [[x, y]];
    let ok = true;
    for (let i = 0; i < 1400 && y > top; i++) {
      const a = rnd() * TAU;
      x += L * Math.cos(a); y += L * Math.sin(a);
      if (x < xl || x > xr || y > bottom) { ok = false; break; }
      pts.push([x, y]);
    }
    // the first few steps must stay near the start, where the slow part plays
    const near = pts.slice(0, 14).every(([px, py]) => Math.abs(px - W / 2) < 150 && py > PANEL.y + PANEL.h - 220);
    if (ok && y <= top && pts.length > 420 && pts.length < 1100 && near) return pts;
  }
  throw new Error('no walk found');
}
const WALK = makeWalk();
const SLOW = 13;                         // steps shown one at a time
const WALK_T = [17.0, 25.3, 28.7];       // slow phase start, fast phase start, exit
function walkN(t) {
  if (t <= WALK_T[0]) return 0;
  if (t < WALK_T[1]) {
    const u = (t - WALK_T[0]) / ((WALK_T[1] - WALK_T[0]) / SLOW), i = Math.floor(u), f = u - i;
    return Math.min(SLOW, i + eio(clamp(f / 0.62)));          // travel, then a pause: absorbed
  }
  const x = seg(t, WALK_T[1], WALK_T[2]);
  return SLOW + (WALK.length - 1 - SLOW) * Math.pow(x, 2.1);
}
const at = (pts, n) => {
  const i = Math.min(pts.length - 2, Math.floor(n)), f = clamp(n - i);
  return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
};

// ---------- the walk inside the cutaway (scene D), in polar terms ----------
function makeMiniWalk(r) {
  const L = 6.5, th0 = -0.24;
  for (let seed = 1; seed < 40000; seed++) {
    const rnd = rng(seed * 104729 + 3);
    let x = (ZONES.core * r + 3) * Math.cos(th0), y = (ZONES.core * r + 3) * Math.sin(th0);
    const pts = [[x, y]];
    let ok = true;
    for (let i = 0; i < 2600; i++) {
      const a = rnd() * TAU;
      x += L * Math.cos(a); y += L * Math.sin(a);
      const rr = Math.hypot(x, y), th = Math.atan2(y, x);
      if (rr < ZONES.core * r + 1 || Math.abs(th - th0) > 0.42) { ok = false; break; }
      pts.push([x, y]);
      if (rr >= ZONES.rad * r) break;
    }
    const end = pts.at(-1);
    if (ok && Math.hypot(end[0], end[1]) >= ZONES.rad * r && pts.length > 220 && pts.length < 1000) return pts;
  }
  throw new Error('no mini walk found');
}

// ---------- the Sun ----------
const SUN_A = [432, 410, 270], SUN_B = [310, 400, 255], SUN_E = [-170, 410, 400];
const MINI = makeMiniWalk(SUN_B[2]);
const ZOOM = { x: SUN_B[0] + 0.47 * SUN_B[2], y: SUN_B[1], s: 64 };   // the box we zoom into

function sunState(t) {
  const m = eio(seg(t, 7.9, 9.4)), e = eio(seg(t, 37.8, 39.3));
  const pick = (i) => lerp(lerp(SUN_A[i], SUN_B[i], m), SUN_E[i], e);
  const cut = eio(seg(t, 8.6, 10.1)) * (1 - eio(seg(t, 37.8, 38.9)));
  return { cx: pick(0), cy: pick(1), r: pick(2), cut };
}

function drawSun(cx, cy, r, cut, t, glow = 1) {
  const g1 = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.8);
  g1.addColorStop(0, `rgba(255,150,50,${0.40 * glow})`); g1.addColorStop(0.3, `rgba(240,90,30,${0.15 * glow})`);
  g1.addColorStop(1, 'rgba(160,20,20,0)');
  ctx.fillStyle = g1; ctx.fillRect(cx - r * 1.8, cy - r * 1.8, r * 3.6, r * 3.6);
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const s = r / 300;
  granPattern.setTransform(new DOMMatrix().translate(cx + ambient * 6 * s, cy + 0.5 * s).scale(s));
  ctx.fillStyle = granPattern; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  const limb = ctx.createRadialGradient(cx - r * 0.12, cy - r * 0.12, 0, cx, cy, r);
  limb.addColorStop(0, 'rgba(255,244,200,0.22)'); limb.addColorStop(0.55, 'rgba(255,200,120,0)');
  limb.addColorStop(0.86, 'rgba(150,20,10,0.32)'); limb.addColorStop(1, 'rgba(80,4,10,0.85)');
  ctx.fillStyle = limb; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  ctx.restore();
  if (cut > 0) drawCutaway(cx, cy, r, cut, t);
}

function drawCutaway(cx, cy, r, cut, t) {
  const a0 = -Math.PI / 2, a1 = a0 + Math.PI * cut;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r + 1, a0, a1); ctx.closePath(); ctx.clip();
  // convection zone
  let g = ctx.createRadialGradient(cx, cy, r * ZONES.rad, cx, cy, r);
  g.addColorStop(0, '#EE6A20'); g.addColorStop(1, '#A61C18');
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  // convection cells: loops that turn, neighbours in opposite senses
  const N = 8;
  for (let i = 0; i < N; i++) {
    const th = -Math.PI / 2 + ((i + 0.5) * Math.PI) / N, rc = r * 0.85;
    const x = cx + rc * Math.cos(th), y = cy + rc * Math.sin(th);
    ctx.save(); ctx.translate(x, y); ctx.rotate(th);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.11, r * 0.135, 0, 0, TAU);
    ctx.fillStyle = 'rgba(255,180,80,0.14)'; ctx.fill();
    ctx.setLineDash([9, 7]); ctx.lineDashOffset = (i % 2 ? 1 : -1) * ambient * 16;
    ctx.strokeStyle = 'rgba(255,214,140,0.55)'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  // radiative zone, with faint shells
  g = ctx.createRadialGradient(cx, cy, r * ZONES.core, cx, cy, r * ZONES.rad);
  g.addColorStop(0, '#FFCB55'); g.addColorStop(1, '#F4831F');
  ctx.beginPath(); ctx.arc(cx, cy, r * ZONES.rad, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(150,40,10,0.13)'; ctx.lineWidth = 1.5;
  for (let f = ZONES.core + 0.045; f < ZONES.rad - 0.02; f += 0.045) { ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, TAU); ctx.stroke(); }
  // core
  g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * ZONES.core);
  g.addColorStop(0, '#FFFFF4'); g.addColorStop(0.6, '#FFF0B0'); g.addColorStop(1, '#FFD969');
  ctx.beginPath(); ctx.arc(cx, cy, r * ZONES.core, 0, TAU); ctx.fillStyle = g; ctx.fill();
  // boundaries
  ctx.strokeStyle = 'rgba(90,10,14,0.55)'; ctx.lineWidth = 2;
  for (const f of [ZONES.core, ZONES.rad]) { ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, TAU); ctx.stroke(); }
  ctx.restore();
  // the cut faces
  ctx.strokeStyle = 'rgba(255,236,190,0.9)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * Math.cos(a1), cy + r * Math.sin(a1)); ctx.stroke();
}

/** Labels for the cutaway: name, a short note, and a leader line to the layer. */
const LABELS = [
  { name: 'Surface', note: 'photosphere', f: 1.0, th: -0.9, y: -205, at: 10.2 },
  { name: 'Convection zone', note: 'rising, sinking gas', f: 0.86, th: -0.3, y: -80, at: 13.6 },
  { name: 'Radiative zone', note: 'dense, hot gas', f: 0.47, th: 0.22, y: 70, at: 12.6 },
  { name: 'Core', note: 'fusion releases energy', f: 0.1, th: 0.7, y: 205, at: 9.4 },
];
function drawLabels(cx, cy, r, t, a) {
  const lx = 596;
  for (const L of LABELS) {
    const p = eout(seg(t, L.at, L.at + 0.6));
    withAlpha(p * a, () => {
      const px = cx + r * L.f * Math.cos(L.th), py = cy + r * L.f * Math.sin(L.th), ly = cy + L.y;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(40,4,8,0.6)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx - 22, ly); ctx.lineTo(lx - 10, ly); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, lx - 22, p), lerp(py, ly, p)); if (p > 0.99) ctx.lineTo(lx - 10, ly); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 4.5, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
      font(700, 26); text(L.name, lx + (1 - p) * 12, ly - 4, { base: 'alphabetic' });
      font(500, 22); text(L.note, lx + (1 - p) * 12, ly + 24, { color: C.soft });
    });
  }
}

function photon(x, y, size = 1, a = 1) {
  withAlpha(a, () => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 20 * size);
    g.addColorStop(0, 'rgba(255,255,250,1)'); g.addColorStop(0.18, 'rgba(255,250,220,0.95)');
    g.addColorStop(0.45, 'rgba(255,210,120,0.35)'); g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 20 * size, 0, TAU); ctx.fill();
  });
}

// ---------- timeline ----------
const T = { A: [0, 8.0], B: [7.8, 16.4], C: [15.8, 29.6], D: [28.9, 37.9], E: [37.7, 42.6], F: [42.3, 49.9], G: [49.7, 53.5] };
const CUES = [
  [0.4, 3.7, 'Sunlight reaches Earth in about ~8 minutes~.'],
  [3.8, 7.9, 'But how long did it take to *escape the Sun*?'],
  [8.1, 12.3, 'It starts in the *core*, where fusion releases energy.'],
  [12.4, 16.2, 'Around it lies the *radiative zone*: dense, hot gas.'],
  [16.4, 21.0, 'There, light usually gets *a few millimetres* before it’s absorbed.'],
  [21.1, 25.3, 'Then it’s re-emitted in a *random direction*. Again and again.'],
  [25.4, 29.0, 'This zigzag *random walk* drifts outward only slowly.'],
  [29.2, 33.0, 'Near the top, churning *convection* carries the energy up.'],
  [33.1, 37.8, `In all, an estimated *${fmt(ESCAPE_YEARS[0])} to ${fmt(ESCAPE_YEARS[1])} years* to reach the surface.`],
  [38.0, 42.2, 'From there, it streaks to Earth in ~about 8 minutes~.'],
  [42.4, 45.6, 'Shrink that trip to ~one second~…'],
  [45.7, 49.6, `…and the escape would take *${SCALED[0]} to ${SCALED[1]} years*.`],
  [49.8, 53.2, 'Fresh light, *ancient* energy.'],
];

// ---------- layers ----------
function background() {
  ctx.drawImage(BACKDROP, 0, 0);
  font(800, 22); text('RECKON', 56, 78, { spacing: '5px' });
  font(500, 22); text('SPACE · THE SUN', 186, 78, { color: C.soft, spacing: '2px' });
}

function vignette() {
  const g = ctx.createLinearGradient(0, 690, 0, H);
  g.addColorStop(0, 'rgba(8,1,4,0)'); g.addColorStop(0.35, 'rgba(8,1,4,0.72)'); g.addColorStop(1, 'rgba(8,1,4,0.9)');
  ctx.fillStyle = g; ctx.fillRect(0, 690, W, H - 690);
}

function captions(t) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 14;
  k.captions(t, CUES, { x: W / 2, y: 830, maxW: 760, size: 44, lh: 56, family: F, weight: 700, ink: C.ink, marks: { '*': C.gold, '~': C.ice } });
  ctx.restore();
}

/** Light streaming off the limb in every direction (hook). */
function streams(cx, cy, r, t, a) {
  const rnd = rng(5);
  for (let i = 0; i < 26; i++) {
    const th = rnd() * TAU, period = 2.4 + rnd() * 1.6, off = rnd() * period;
    const u = ((t + off) % period) / period;
    const d = r + 6 + u * 520;
    const x = cx + d * Math.cos(th), y = cy + d * Math.sin(th);
    const fade = Math.min(1, u * 6) * (1 - u);
    withAlpha(a * fade, () => {
      ctx.strokeStyle = 'rgba(255,236,190,0.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 46 * Math.cos(th), y - 46 * Math.sin(th)); ctx.stroke();
      photon(x, y, 0.45);
    });
  }
}

// ---------- scenes ----------
function sunLayer(t) {
  const { cx, cy, r, cut } = sunState(t);
  // zoom in and out around the box in the radiative zone
  const z = t < 22 ? seg(t, 15.8, 16.7) : 1 - seg(t, 28.9, 29.75);
  const zz = z * z;
  const shown = 1 - seg(z, 0.3, 0.8);
  const away = 1 - seg(t, 42.3, 43.1);
  if (shown * away <= 0) return;
  withAlpha(shown * away, () => {
    ctx.save();
    const s = 1 + 6 * zz;
    ctx.translate(ZOOM.x, ZOOM.y); ctx.scale(s, s); ctx.translate(-ZOOM.x, -ZOOM.y);
    if (t < 8.4) streams(cx, cy, r, t, span(t, 0, 8.4, 0.8, 0.5));
    drawSun(cx, cy, r, cut, t);
    // a glow deep inside while the question is asked
    withAlpha(span(t, 4.0, 9.0, 0.8, 0.8) * 0.8, () => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.42);
      const p = 0.75 + 0.25 * Math.sin(ambient * 3.2);
      g.addColorStop(0, `rgba(255,255,235,${0.7 * p})`); g.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, TAU); ctx.fill();
    });
    if (t > 8.5 && t < 39) {
      drawLabels(cx, cy, r, t, t < 22 ? 1 - seg(t, 15.2, 15.8) : seg(t, 29.7, 30.3) * (1 - seg(t, 33.0, 33.6)));
      withAlpha(span(t, 9.4, 37.9, 0.5, 0.4) * (t > 15.6 && t < 29.6 ? 0 : 1), () => {
        font(700, 22); text('CUTAWAY DIAGRAM', 56, 128, { color: C.soft, spacing: '3px' });
      });
    }
    // the zoom box
    withAlpha(span(t, 14.9, 16.4, 0.4, 0.5) + span(t, 29.0, 30.0, 0.01, 0.5), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5 / s;
      rrect(ZOOM.x - ZOOM.s / 2, ZOOM.y - ZOOM.s / 2, ZOOM.s, ZOOM.s, 6 / s); ctx.stroke();
    });
    if (t >= 28.9 && t < 38.2) sceneDOverlay(t, cx, cy, r);
    ctx.restore();
  });
}

function sceneC(t) {
  // the panel grows out of the zoom box, and shrinks back into it
  const g = eio(seg(t, 15.85, 16.7)) * (1 - eio(seg(t, 28.85, 29.7)));
  if (g <= 0) return;
  const box = { x: ZOOM.x - ZOOM.s / 2, y: ZOOM.y - ZOOM.s / 2, w: ZOOM.s, h: ZOOM.s };
  const R = { x: lerp(box.x, PANEL.x, g), y: lerp(box.y, PANEL.y, g), w: lerp(box.w, PANEL.w, g), h: lerp(box.h, PANEL.h, g) };
  withAlpha(seg(g, 0, 0.5), () => {
    ctx.save();
    rrect(R.x, R.y, R.w, R.h, 22 * g); ctx.clip();
    const bg = ctx.createLinearGradient(0, PANEL.y, 0, PANEL.y + PANEL.h);
    bg.addColorStop(0, '#4A0A12'); bg.addColorStop(0.5, '#86200F'); bg.addColorStop(1, '#C24A16');
    ctx.fillStyle = bg; ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.drawImage(PLASMA, PANEL.x, PANEL.y);
    withAlpha(seg(g, 0.6, 1), () => drawWalk(t));
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,226,180,0.6)'; ctx.lineWidth = 2.5;
    rrect(R.x, R.y, R.w, R.h, 22 * g); ctx.stroke();
  });
  withAlpha(seg(g, 0.85, 1), () => {
    font(500, 22); text('ILLUSTRATION · each step hugely enlarged', W / 2, PANEL.y + PANEL.h + 36, { color: C.soft, align: 'center' });
  });
}

function drawWalk(t) {
  font(600, 22);
  text('toward the surface  ↑', W / 2, PANEL.y + 32, { color: C.soft, align: 'center' });
  text('from the core', W / 2, PANEL.y + PANEL.h - 16, { color: C.soft, align: 'center' });
  const n = walkN(t), i = Math.floor(n);
  const [hx, hy] = at(WALK, n);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const path = (from, to) => {
    ctx.beginPath(); ctx.moveTo(...WALK[from]);
    for (let j = from + 1; j <= to; j++) ctx.lineTo(...WALK[j]);
  };
  const recent = Math.max(0, i - 40);
  if (recent > 0) { path(0, recent); ctx.strokeStyle = 'rgba(255,214,150,0.38)'; ctx.lineWidth = 2; ctx.stroke(); }
  path(recent, Math.min(i, WALK.length - 1)); ctx.lineTo(hx, hy);
  ctx.strokeStyle = 'rgba(255,190,90,0.35)'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,246,220,0.95)'; ctx.lineWidth = 2.6; ctx.stroke();
  // absorption points during the slow part: a ring flashes where light is absorbed
  for (let j = 1; j <= Math.min(i, SLOW); j++) {
    const [x, y] = WALK[j];
    ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.fill();
    const age = n - j;
    if (age < 0.9 && j <= SLOW) {
      withAlpha(1 - age / 0.9, () => {
        ctx.beginPath(); ctx.arc(x, y, 8 + age * 30, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
      });
    }
  }
  const done = n >= WALK.length - 1.001;
  photon(hx, hy, done ? 1.2 : 1, 1 - seg(t, WALK_T[2], WALK_T[2] + 0.4));
  // name the first absorption and re-emission
  const tag = (s, x, y, a, color) => withAlpha(a, () => {
    font(700, 22); const w = ctx.measureText(s).width + 26;
    rrect(x - w / 2, y - 19, w, 38, 19); ctx.fillStyle = 'rgba(30,4,8,0.82)'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    text(s, x, y + 1, { color, align: 'center', base: 'middle' });
  });
  const [ax, ay] = WALK[1], [bx, by] = WALK[2];
  tag('absorbed', ax, ay - 52, span(t, 17.5, 20.9, 0.3, 0.4), C.gold);
  tag('re-emitted, any direction', clamp(bx, 200, W - 200), by - 52, span(t, 21.1, 24.6, 0.3, 0.4), C.ink);
}

function sceneDOverlay(t, cx, cy, r) {
  // a walk from the core's edge to the top of the radiative zone
  const p = Math.pow(seg(t, 29.6, 31.2), 1.6);
  const n = p * (MINI.length - 1);
  withAlpha(span(t, 29.4, 37.9, 0.3, 0.4), () => {
    ctx.save(); ctx.translate(cx, cy);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...MINI[0]);
    for (let j = 1; j <= Math.floor(n); j++) ctx.lineTo(...MINI[j]);
    const head = at(MINI, n); ctx.lineTo(...head);
    ctx.strokeStyle = 'rgba(120,20,10,0.55)'; ctx.lineWidth = 3.4; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,245,0.95)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    if (p < 1) photon(cx + head[0], cy + head[1], 0.7);
  });
  // then convection carries it up to the surface, and out
  const end = MINI.at(-1), th = Math.atan2(end[1], end[0]);
  const P0 = [cx + end[0], cy + end[1]];
  const P2 = [cx + r * Math.cos(th - 0.16), cy + r * Math.sin(th - 0.16)];
  const P1 = [cx + r * 0.9 * Math.cos(th + 0.12), cy + r * 0.9 * Math.sin(th + 0.12)];
  const q = eio(seg(t, 31.2, 32.7));
  if (t > 31.1 && t < 33.6) {
    const bez = (u) => [0, 1].map((d) => (1 - u) * (1 - u) * P0[d] + 2 * (1 - u) * u * P1[d] + u * u * P2[d]);
    ctx.strokeStyle = 'rgba(255,240,200,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([2, 9]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...P0);
    for (let u = 0; u <= q + 1e-6; u += 0.02) ctx.lineTo(...bez(Math.min(u, q)));
    withAlpha(1 - seg(t, 32.9, 33.5), () => ctx.stroke());
    ctx.setLineDash([]);
    const [bx, by] = bez(q);
    withAlpha(1 - seg(t, 32.7, 33.0), () => {
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, 22);
      g.addColorStop(0, 'rgba(255,250,215,0.95)'); g.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 22, 0, TAU); ctx.fill();
    });
  }
  // it leaves the surface
  const out = seg(t, 32.7, 33.6);
  if (out > 0 && out < 1) {
    const d = eout(out) * 110, ux = Math.cos(th - 0.16), uy = Math.sin(th - 0.16);
    photon(P2[0] + ux * d, P2[1] + uy * d, 0.9, 1 - out * 0.6);
  }
  // the estimates, as a range on a time gauge
  const ga = span(t, 33.5, 37.9, 0.5, 0.4);
  if (ga > 0) withAlpha(ga, () => {
    const x = 622, y0 = 650, y1 = 238, max = 180000, Y = (v) => lerp(y0, y1, v / max);
    font(700, 22); text('ESTIMATED TIME', 596, 168, { color: C.soft, spacing: '2px' });
    text('TO THE SURFACE', 596, 196, { color: C.soft, spacing: '2px' });
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    for (let v = 0; v <= max; v += 50000) {
      ctx.beginPath(); ctx.moveTo(x - 8, Y(v)); ctx.lineTo(x + 8, Y(v)); ctx.stroke();
    }
    font(600, 22); text('0', x - 20, Y(0) + 8, { color: C.soft, align: 'right' });
    const grow = eio(seg(t, 33.9, 35.3));
    const top = lerp(ESCAPE_YEARS[0], ESCAPE_YEARS[1], grow);
    const bar = ctx.createLinearGradient(0, Y(ESCAPE_YEARS[0]), 0, Y(ESCAPE_YEARS[1]));
    bar.addColorStop(0, '#FFC94A'); bar.addColorStop(1, '#F06A1D');
    rrect(x - 11, Y(top), 22, Y(ESCAPE_YEARS[0]) - Y(top), 11); ctx.fillStyle = bar; ctx.fill();
    font(800, 30); text(fmt(ESCAPE_YEARS[0]), x + 22, Y(ESCAPE_YEARS[0]) + 2, { color: C.gold, base: 'middle' });
    withAlpha(seg(t, 35.1, 35.6), () => {
      font(800, 30); text(fmt(ESCAPE_YEARS[1]), x + 22, Y(ESCAPE_YEARS[1]) - 6, { color: C.gold, base: 'middle' });
      font(600, 22); text('years', x + 22, Y(ESCAPE_YEARS[1]) + 22, { color: C.soft, base: 'middle' });
    });
  });
}

function sceneE(t) {
  const sx = SUN_E[0] + SUN_E[2], ex = 748, y = SUN_E[1];
  const appear = eout(seg(t, 38.6, 39.3));
  withAlpha(appear, () => {
    // Earth
    const g = ctx.createRadialGradient(ex, y, 0, ex, y, 46);
    g.addColorStop(0, 'rgba(140,200,255,0.45)'); g.addColorStop(1, 'rgba(140,200,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, y, 46, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(ex, y, 17, 0, TAU); ctx.fillStyle = C.earth; ctx.fill();
    ctx.beginPath(); ctx.arc(ex - 4, y - 3, 7, 0, TAU); ctx.fillStyle = 'rgba(120,200,140,0.8)'; ctx.fill();
    font(600, 24); text('Earth', ex, y + 58, { color: C.ink, align: 'center' });
    // the route
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([3, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx + 14, y); ctx.lineTo(ex - 26, y); ctx.stroke(); ctx.setLineDash([]);
    font(500, 24); text('about 150 million km', (sx + ex) / 2, y + 62, { color: C.soft, align: 'center' });
  });
  // the flight: light speed is constant, so the clock runs evenly with the distance
  const f = seg(t, 39.3, 41.7);
  const x = lerp(sx + 4, ex - 18, f);
  if (t > 39.2) {
    withAlpha(1 - seg(t, 41.7, 42.0), () => {
      const tail = ctx.createLinearGradient(x - 140, 0, x, 0);
      tail.addColorStop(0, 'rgba(255,230,170,0)'); tail.addColorStop(1, 'rgba(255,240,200,0.9)');
      ctx.strokeStyle = tail; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(Math.max(sx, x - 140), y); ctx.lineTo(x, y); ctx.stroke();
      photon(x, y, 1);
    });
  }
  withAlpha(eout(seg(t, 41.7, 42.0)) * (1 - seg(t, 42.0, 42.5)), () => {
    ctx.beginPath(); ctx.arc(ex, y, 17 + 20 * seg(t, 41.7, 42.3), 0, TAU); ctx.strokeStyle = C.ice; ctx.lineWidth = 3; ctx.stroke();
  });
  // the clock
  withAlpha(appear, () => {
    const s = Math.round(TRIP_S * f), label = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const cx = (sx + ex) / 2 + 10;
    font(700, 22); text('LIGHT TRAVEL TIME', cx, 172, { color: C.soft, align: 'center', spacing: '3px' });
    font(800, 104);
    const adv = 64, colon = 30, widths = [...label].map((ch) => (ch === ':' ? colon : adv));
    let xx = cx - widths.reduce((a, b) => a + b, 0) / 2;
    [...label].forEach((ch, i) => { text(ch, xx + widths[i] / 2, 262, { color: f >= 1 ? C.ice : C.ink, align: 'center', base: 'middle' }); xx += widths[i]; });
    font(600, 22); text('min : s', cx, 330, { color: C.soft, align: 'center', spacing: '2px' });
  });
}

function sceneF(t) {
  const cols = 24, cell = 22, pitch = 28, n = SCALED[1];
  const gw = cols * pitch - (pitch - cell), x0 = (W - gw) / 2, y0 = 264;
  // legend
  withAlpha(eout(seg(t, 42.6, 43.2)), () => {
    font(700, 22); text('SCALE: 8 MIN 19 S SHRUNK TO 1 SECOND', x0, 124, { color: C.soft, spacing: '2px' });
    rrect(x0, 160, cell, cell, 4); ctx.fillStyle = C.ice; ctx.fill();
    font(600, 26); text('Sun to Earth: 1 second', x0 + cell + 16, 171, { base: 'middle' });
  });
  withAlpha(eout(seg(t, 44.0, 44.6)), () => {
    rrect(x0, 206, cell, cell, 4); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke();
    font(600, 26); text('getting out of the Sun: 1 square = 1 year', x0 + cell + 16, 217, { base: 'middle' });
  });
  const outline = seg(t, 44.2, 45.4), low = seg(t, 45.9, 46.6), high = Math.pow(seg(t, 46.9, 48.9), 1.5);
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols, x = x0 + c * pitch, y = y0 + r * pitch;
    const shown = clamp(outline * n * 1.4 - i * 0.4 + 1, 0, 1);
    if (shown <= 0) continue;
    withAlpha(shown, () => {
      rrect(x, y, cell, cell, 4);
      const lit = i < SCALED[0] ? clamp(low * SCALED[0] - i) : clamp(high * (n - SCALED[0]) - (i - SCALED[0]));
      ctx.fillStyle = 'rgba(255,201,74,0.06)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,201,74,0.38)'; ctx.lineWidth = 1.5; ctx.stroke();
      if (lit > 0) {
        withAlpha(lit, () => { rrect(x, y, cell, cell, 4); ctx.fillStyle = i < SCALED[0] ? C.gold : 'rgba(240,120,40,0.85)'; ctx.fill(); });
      }
    });
  }
  const pill = (s, x, y, a, color, dark) => withAlpha(a, () => {
    font(700, 24); const w = ctx.measureText(s).width + 30;
    rrect(x, y - 21, w, 42, 21); ctx.fillStyle = color; ctx.fill();
    text(s, x + w / 2, y + 1, { color: dark, align: 'center', base: 'middle' });
  });
  const yb = y0 + Math.ceil(n / cols) * pitch + 22;
  pill(`low estimate: ${SCALED[0]} years`, x0, yb, eout(seg(t, 46.4, 46.8)), C.gold, '#2A0508');
  withAlpha(1, () => {
    font(700, 24); const s = `high: ${SCALED[1]} years`, w = ctx.measureText(s).width + 30;
    pill(s, x0 + gw - w, yb, eout(seg(t, 48.7, 49.1)), 'rgba(240,120,40,1)', '#2A0508');
  });
}

function sceneG(t) {
  const p = eout(seg(t, 49.9, 50.6));
  withAlpha(p, () => {
    drawSun(W / 2, 240, 74, 0, t, 0.9);
    font(800, 84); text('Ancient sunlight', W / 2, 420 + (1 - p) * 18, { align: 'center', base: 'middle' });
    rrect(W / 2 - 150, 474, 300 * eout(seg(t, 50.3, 51.0)), 8, 4); ctx.fillStyle = C.gold; ctx.fill();
    font(600, 30); text(`${fmt(ESCAPE_YEARS[0])}–${fmt(ESCAPE_YEARS[1])} years out of the Sun`, W / 2, 536, { color: C.ink, align: 'center', base: 'middle' });
    text('then about 8 minutes to us', W / 2, 578, { color: C.soft, align: 'center', base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Sun”', W / 2, 668, { color: C.soft, align: 'center', base: 'middle' });
  });
}

// The clip's own time, from tools.clock: it runs on while a step holds for reading, so the decorative
// motion below uses it; the story itself uses t.
let ambient = 0;

Kit.scene({
  width: W, height: H, duration: 53.5,
  fonts: [{ family: F, file: 'Exo2.woff2', weight: '400 800' }],
  draw(t, tools) {
    ambient = tools.clock;
    k = tools; ctx = tools.ctx;
    if (!granPattern) granPattern = ctx.createPattern(GRAN, 'repeat');
    background();
    sunLayer(t);
    const scenes = [[sceneC, T.C, 0, 0], [sceneE, T.E, 0.01, 0.4], [sceneF, T.F], [sceneG, T.G, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    vignette();
    captions(t);
  },
});
