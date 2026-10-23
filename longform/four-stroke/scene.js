// "The four-stroke engine: two turns, one push", a long-form explainer (16:9, 1920×1080).
// Look: an engineering cutaway on a dark steel-blue drawing sheet with a grid. Cut metal is hatched grey,
// moving parts are machined steel, intake air is cool blue, compressed charge amber, combustion hot orange,
// exhaust smoky grey; mint for dimensions and annotations. Oswald (condensed gothic) for titles and labels,
// JetBrains Mono for readouts. Chapter cards are drawing title blocks.
//
// The engine is computed, not keyframed: one crank angle θ(t) (cubic Hermite keys built from the line times)
// drives everything. Piston: x = r cos θ + √(l² − r² sin² θ) (r = 100, l = 340 px). The flat-roofed chamber is
// sized so that V(BDC) / V(TDC) = 10 exactly. The camshaft turns at θ/2 and each cam is drawn from the lift
// curve that moves its valve. The P–V loop, the efficiency curve, the gas torque of 1, 4 and 6 cylinders and
// the flywheel's energy are all computed from the same ideal Otto cycle (γ = 1.4). Facts: see script.mjs.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const at = (n) => CH[n - 1].at;
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const DISPLAY = 'Oswald', MONO = 'JetBrains Mono';

const C = {
  ink: '#EAF2F8', soft: 'rgba(234,242,248,0.78)', faint: 'rgba(234,242,248,0.46)', ghost: 'rgba(234,242,248,0.2)',
  line: '#A9C7DF', dim: '#8FE3C8', paper: '#0B1724',
  steelDark: '#26303B', steel: '#4F5C69', steelMid: '#7B8894', steelLight: '#B4BFC9', steelHi: '#E1E7EC',
  cut: '#323D49', hatch: 'rgba(196,210,222,0.30)',
  air: '#4FB6FF', airDeep: '#1D6AB0', fuel: '#FFD27A',
  warm: '#FFC14D', hot: '#FF6B1F', flame: '#FFB04A', white: '#FFF2CC', exhaust: '#8E8781',
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixRGB = (a, b, u) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(lerp(v, B[i], clamp(u)))); };
const mix = (a, b, u) => `rgb(${mixRGB(a, b, u).join(',')})`;
const mixHex = (a, b, u) => `#${mixRGB(a, b, u).map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

let k, ctx;
const font = (w, size, fam = DISPLAY) => k.font(w, size, fam);
const text = (str, x, y, o = {}) => k.text(str, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const label = (str, x, y, { size = 32, color = C.ink, align = 'left', weight = 500, spacing = '1.5px', base = 'alphabetic' } = {}) => {
  font(weight, size); text(str, x, y, { color, align, spacing, base });
};
const mono = (str, x, y, { size = 32, color = C.ink, align = 'left', weight = 500, base = 'alphabetic' } = {}) => {
  font(weight, size, MONO); text(str, x, y, { color, align, base });
};
const width = (str, size, fam = DISPLAY, w = 500, spacing = '1.5px') => { font(w, size, fam); ctx.letterSpacing = spacing; const m = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return m; };
const stroke = (w = 2, col = C.line) => { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
const line = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
const dot = (x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); };
function chip(str, x, y, { size = 32, fg = C.paper, bg = C.dim, align = 'left', fam = DISPLAY, padX = 18, h = 50, outline = false } = {}) {
  const w = width(str, size, fam, 600) + padX * 2;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  k.rrect(x0, y - h / 2, w, h, 8);
  if (outline) { stroke(2.5, bg); ctx.stroke(); } else { ctx.fillStyle = bg; ctx.fill(); }
  font(600, size, fam); text(str, x0 + w / 2, y + 1, { color: outline ? bg : fg, align: 'center', base: 'middle', spacing: '1.5px' });
  return w;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

// =====================================================================================================
// Geometry and the ideal cycle
// =====================================================================================================
const CX = 480, BORE = 280, WALL = 30;
const R = 100, ROD = 340, CY = 840, PIN_OFF = 66, PISTON_H = 112, STROKE = 2 * R;
const pinYat = (th, r = R, l = ROD) => -(r * Math.cos(th * DEG) + Math.sqrt(l * l - (r * Math.sin(th * DEG)) ** 2));
const pinY = (th) => CY + pinYat(th);
const crownY = (th) => pinY(th) - PIN_OFF;
const TDC_Y = crownY(0), BDC_Y = crownY(180);
const ROOF = TDC_Y - STROKE / 9;                        // flat roof: V(BDC) / V(TDC) = 10
const RATIO = (BDC_Y - ROOF) / (TDC_Y - ROOF);
const HEAD_TOP = 226, LINER_END = 612;
const IV = CX - 74, EV = CX + 74, VR = 44;
const CAM_Y = 134, CAM_R0 = 24, LIFT_PX = 24;
const travel = (th) => crownY(th) - TDC_Y;             // 0 at TDC, STROKE at BDC
const vol = (th) => 1 + (RATIO - 1) * travel(th) / STROKE; // 1 at TDC, 10 at BDC
const GAMMA = 1.4, P2 = Math.pow(RATIO, GAMMA), EXPLOSION = 3.2, P3 = P2 * EXPLOSION, P4 = P3 / P2;
const cyc = (th) => ((th % 720) + 720) % 720;
/** Ideal Otto-cycle pressure (atm) at cycle angle c; combustion over q2 ∈ [0,1] at TDC, blowdown over q4 at BDC. */
function pressure(c, q2 = null, q4 = null) {
  const V = vol(c);
  if (c < 180) return 1;
  if (c < 360) return Math.pow(RATIO / V, GAMMA);
  if (c < 540) {
    const comb = Math.pow(RATIO / V, GAMMA), exp = P3 * Math.pow(1 / V, GAMMA);
    const q = q2 ?? eio(clamp((c - 360) / 10));
    return lerp(comb, exp, q);
  }
  const exp = P3 * Math.pow(1 / V, GAMMA);
  const q = q4 ?? eio(clamp((c - 540) / 10));
  return lerp(exp, 1, q);
}
/** d(travel)/dθ per radian: the lever arm through which gas pressure turns the crank. */
const lever = (th) => { const a = th * DEG, sn = Math.sin(a), cs = Math.cos(a); return R * sn + (R * R * sn * cs) / Math.sqrt(ROD * ROD - R * R * sn * sn); };
const TORQUE1 = Array.from({ length: 720 }, (_, c) => (pressure(c) - 1) * lever(c));
const torqueN = (n, c) => { let sum = 0; for (let i = 0; i < n; i++) sum += TORQUE1[Math.round(cyc(c - i * 720 / n)) % 720]; return sum; };
const TMAX = Math.max(...TORQUE1);
// flywheel energy for one cylinder: the work done so far, minus a steady load
const FLY = (() => {
  const mean = TORQUE1.reduce((a, b) => a + b, 0) / 720;
  let w = 0; const out = TORQUE1.map((tq) => (w += tq - mean));
  const lo = Math.min(...out), hi = Math.max(...out);
  return { mean, at: (c) => (out[Math.round(cyc(c)) % 720] - lo) / (hi - lo) };
})();
// the piston after a quarter turn, and the crank angle at which it is halfway down
const QUARTER = travel(90) / STROKE;
const HALF_AT = (() => { let lo = 0, hi = 180; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (travel(m) < STROKE / 2) lo = m; else hi = m; } return lo; })();
const eta = (r) => 1 - Math.pow(r, 1 - GAMMA);
const strokeIdx = (c) => (c < 1 ? 0 : Math.min(3, Math.floor((c - 1) / 180)));
const pct = (x) => `${Math.round(x * 100)}%`;
const tempC = (r) => Math.round(293.15 * Math.pow(r, GAMMA - 1) - 273.15);

// =====================================================================================================
// The crank angle over time: cubic Hermite keys [t, θ, ω], built from the line times
// =====================================================================================================
const KEYS = [[0, 0, 0]];
const cur = () => KEYS[KEYS.length - 1];
function key(t, a, w) { const [ct] = cur(); KEYS.push([Math.max(t, ct + 0.05), a, w]); }
function runTo(t1) { const [ct, a, w] = cur(); if (t1 > ct) key(t1, a + w * (t1 - ct), w); }
function holdTo(t) { const [ct, a, w] = cur(); if (w) runTo(t); else if (t > ct) key(t, a, 0); }
function moveBy(t0, t1, da) { holdTo(t0); key(t1, cur()[1] + da, 0); }
function spin(t0, t1, w1) { holdTo(t0); const [ct, a] = cur(); key(t1, a + (w1 * (t1 - ct)) / 2, w1); }
function accel(t0, t1, w1) { runTo(t0); const [ct, a, w] = cur(); key(t1, a + ((w + w1) / 2) * (t1 - ct), w1); }
/** Run on, then brake evenly, to stop at an angle ≡ off (mod `mod`) at about tStop. */
function stopBy(tStop, mod = 720, off = 0, hmin = 1.0) {
  const [ct, a, w] = cur();
  const reach = (h) => a + w * (tStop - ct) - (w * h) / 2;
  let target = off + Math.floor((reach(hmin) - off) / mod) * mod;
  let h = (2 * (a + w * (tStop - ct) - target)) / w;
  if (tStop - h < ct) { target = off + Math.ceil((a + (w * hmin) / 2 - off) / mod) * mod; h = (2 * (target - a)) / w; key(ct + 0.001, a, w); key(ct + h, target, 0); return; }
  runTo(tStop - h); key(tStop, target, 0);
}
// cold open: running; it stops at the top under the first chapter card
spin(0.3, s('o1', 0.6), 300);
stopBy(at(1) + 2.6, 720, 0, 1.6);
// 1 the machine
moveBy(s('m7', 0.3), mid('m7', 0.7), 180);
moveBy(s('m8', 0.2), e('m8', -0.1), 180);
moveBy(s('m9', 0.1), e('m9', 0.3), 360);
moveBy(s('m10', 0.3), mid('m10', 0.75), 90);
moveBy(s('m11', 0.2), e('m11', 1.0), 630);
// 2 four strokes, one at a time, then running
moveBy(s('f2', 0.3), e('f2'), 180);
moveBy(s('f3', 0.2), e('f3'), 180);
moveBy(s('f5', 0.6), e('f5'), 8);
moveBy(s('f6', 0.1), e('f6'), 172);
moveBy(s('f8', 0.2), e('f8'), 180);
spin(s('f9', 0.4), s('f9', 1.9), 200);
stopBy(at(3) + 5.5, 720, 0, 2.0);
// 4 pressure and volume
moveBy(s('p3', 0.2), e('p3'), 180);
moveBy(s('p4', 0.2), e('p4'), 180);
moveBy(s('p6', 0.2), e('p6'), 180);
moveBy(s('p8', 0.2), e('p8'), 180);
spin(s('p9', 0.2), s('p9', 1.6), 160);
stopBy(at(5) + 3.0, 720, 0, 1.6);
// 5 squeeze harder
moveBy(s('c1', 0.2), mid('c1', 0.45), 180);
moveBy(mid('c1', 0.55), e('c1', 0.3), 180);
spin(s('c2', 0.3), s('c2', 1.8), 120);
// 6 timing: faster for the spark advance, then a crawl through the overlap
accel(s('v4', 0.2), e('v4'), 320);
stopBy(s('v6', 0.4), 720, 700, 1.4);
moveBy(s('v6', 0.5), e('v7'), 32);
moveBy(s('v8', 0.1), e('v8'), 18);
spin(s('v9', 0.2), s('v9', 1.6), 220);
// 7 more cylinders
accel(at(7) + 1.0, at(7) + 3.0, 140);
stopBy(at(8) + 3.2, 720, 0, 1.6);
// 8 the diesel
moveBy(s('d2', 0.2), e('d2'), 180);
moveBy(s('d3', 0.1), e('d3'), 168);
moveBy(s('d4', 0.1), e('d4', 0.2), 44);
spin(s('d5', 0.2), s('d5', 1.6), 200);
runTo(DURATION + 2);
function theta(t) {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, p0, v0] = KEYS[i], [t1, p1, v1] = KEYS[i + 1];
    if (t > t1) continue;
    const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * v0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * v1;
  }
  const [t0, p0, v0] = KEYS[KEYS.length - 1];
  return p0 + v0 * (t - t0);
}
const omega = (t) => (theta(t + 0.02) - theta(t - 0.02)) / 0.04;

// =====================================================================================================
// Engine state over time
// =====================================================================================================
const chap = (t) => { let n = 0; for (const c of CH) if (t >= c.at) n = c.n; return n; };
const inCh = (t, n, pad = 1.2) => seg(t, at(n) + pad, at(n) + pad + 1.4) * (n < CH.length ? 1 - seg(t, at(n + 1) + pad, at(n + 1) + pad + 1.4) : 1);
function engineAlpha(t) {
  const on = (a, b) => span(t, a, b, 1.0, 1.0);
  return Math.max(on(0, at(3) + 3.0), on(at(4) + 1.6, at(7) + 3.0), on(at(8) + 1.6, e('z6', 1.6)));
}
const gasOn = (t) => 1 - inCh(t, 1, 1.4);
const dieselK = (t) => inCh(t, 8, 1.0);
const realK = (t) => seg(t, s('v5'), e('v5')) * (1 - seg(t, at(7) + 1, at(7) + 2));
const advance = (t) => (chap(t) === 6 ? lerp(10, 40, eio(seg(t, s('v4', 0.2), e('v4')))) * seg(t, s('v2'), s('v2', 1)) : 0);
const vvt = (t) => (chap(t) === 6 ? 18 * Math.sin(((t - s('v10')) / 3.2) * TAU) * span(t, s('v10'), e('v10', 1.0), 0.8, 0.8) : 0);
// windows where a spark and burn are driven by the narration while the crank is held at the top
const IGNITE = [[s('f5', 0.35), e('f6')], [s('p5', 0.2), e('p6')]];

// valve timing: simple (dead centre to dead centre) blended to illustrative real angles with overlap
function valveAngles(t) {
  const r = realK(t), v = vvt(t);
  return { io: lerp(0, -30, r) + v, ic: lerp(180, 240, r) + v, eo: lerp(540, 480, r), ec: lerp(720, 750, r) };
}
const lobe = (u) => (u <= 0 || u >= 1 ? 0 : Math.pow(Math.sin(Math.PI * u), 1.6));
function liftAt(c, open, close) {
  let best = 0;
  for (const off of [-720, 0, 720]) best = Math.max(best, lobe((c + off - open) / (close - open)));
  return best;
}
const inLift = (c, va) => liftAt(c, va.io, va.ic);
const exLift = (c, va) => liftAt(c, va.eo, va.ec);

// =====================================================================================================
// Background: the drawing sheet, painted once
// =====================================================================================================
let BG = null, HATCH = null, HATCH_FINE = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const base = g.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#0F1E2E'); base.addColorStop(0.6, '#0A1522'); base.addColorStop(1, '#060D16');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(520, 520, 40, 520, 520, 760);
  glow.addColorStop(0, 'rgba(70,120,170,0.20)'); glow.addColorStop(1, 'rgba(70,120,170,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  const r = rng(7);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '200,220,240' : '0,0,0'},${0.02 + r() * 0.04})`; g.fillRect(r() * W, r() * H, 1.4, 1.4); }
  for (let x = 0; x <= W; x += 24) { g.fillStyle = x % 120 === 0 ? 'rgba(130,180,225,0.11)' : 'rgba(130,180,225,0.045)'; g.fillRect(x, 0, 1, H); }
  for (let y = 0; y <= H; y += 24) { g.fillStyle = y % 120 === 0 ? 'rgba(130,180,225,0.11)' : 'rgba(130,180,225,0.045)'; g.fillRect(0, y, W, 1); }
  // the sheet border with zone ticks
  g.strokeStyle = 'rgba(169,199,223,0.35)'; g.lineWidth = 2; g.strokeRect(40, 36, W - 80, H - 72);
  g.lineWidth = 1; g.strokeStyle = 'rgba(169,199,223,0.22)'; g.strokeRect(52, 48, W - 104, H - 96);
  g.strokeStyle = 'rgba(169,199,223,0.35)'; g.lineWidth = 2;
  for (let x = 240; x < W - 100; x += 240) { g.beginPath(); g.moveTo(x, 36); g.lineTo(x, 48); g.moveTo(x, H - 36); g.lineTo(x, H - 48); g.stroke(); }
  for (let y = 216; y < H - 100; y += 216) { g.beginPath(); g.moveTo(40, y); g.lineTo(52, y); g.moveTo(W - 40, y); g.lineTo(W - 52, y); g.stroke(); }
  const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,4,10,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const hatch = (gap, col, bgc) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = gap;
    const h = cv.getContext('2d');
    h.fillStyle = bgc; h.fillRect(0, 0, gap, gap);
    h.strokeStyle = col; h.lineWidth = 1.4;
    h.beginPath(); h.moveTo(-2, gap + 2); h.lineTo(gap + 2, -2); h.moveTo(-2, 2); h.lineTo(2, -2); h.moveTo(gap - 2, gap + 2); h.lineTo(gap + 2, gap - 2); h.stroke();
    return ctx.createPattern(cv, 'repeat');
  };
  HATCH = hatch(12, C.hatch, C.cut);
  HATCH_FINE = hatch(9, 'rgba(196,210,222,0.4)', '#3C4855');
}

// =====================================================================================================
// The engine
// =====================================================================================================
const steelH = (x0, x1, dark = C.steel, light = C.steelLight) => {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, dark); g.addColorStop(0.35, light); g.addColorStop(0.55, C.steelHi); g.addColorStop(0.75, light); g.addColorStop(1, dark);
  return g;
};
function gasColour(c, d) {
  // returns [colour, alpha, amount] for cycle angle c (d = diesel blend)
  if (c < 180) return [C.air, lerp(0.14, 0.42, c / 180), c / 180];
  if (c < 360) {
    const u = (c - 180) / 180;
    return [mixHex(C.air, d > 0.5 ? '#FF8A3A' : C.warm, Math.pow(u, lerp(1.6, 1.2, d))), lerp(0.42, 0.62 + 0.15 * d, u), 1];
  }
  if (c < 540) return [mixHex(C.hot, C.exhaust, seg(c, 430, 560)), lerp(0.78, 0.5, seg(c, 380, 540)), 1];
  const u = (c - 540) / 180;
  return [C.exhaust, lerp(0.5, 0.1, u), 1 - u];
}
const DOTS = (() => { const r = rng(9); return Array.from({ length: 64 }, (_, i) => ({ u: 0.04 + 0.92 * r(), v: 0.06 + 0.88 * r(), i, fuel: i % 4 === 1 })); })();
const KERNELS = (() => { const r = rng(31); return Array.from({ length: 7 }, () => ({ x: (r() - 0.5) * 200, y: 0.3 + r() * 0.6, d: r() * 6 })); })();

function burnState(c, t, sparkAt) {
  // progress of the flame (0..1) and the spark flash (0..1)
  for (const [a, b] of IGNITE) if (t >= a - 0.1 && t <= b) {
    const flash = Math.max(0, 1 - Math.abs(t - a - 0.12) / 0.3);
    return { burn: Math.max(seg(t, a + 0.1, a + 1.8), clamp((c - sparkAt) / 26) * (c > 361 ? 1 : 0)), flash };
  }
  const moving = clamp(Math.abs(omega(t)) / 40);
  const w = Math.max(5, Math.abs(omega(t)) * 0.06);
  const flash = c < 560 ? clamp(1 - Math.abs(c - sparkAt) / w) * moving : 0;
  return { burn: c >= sparkAt && c < 560 ? clamp((c - sparkAt) / 26) : 0, flash };
}

function drawGas(th, t, o) {
  const c = cyc(th), cy = crownY(th), d = o.diesel;
  const [col, a, amount] = gasColour(c, d);
  const sparkAt = 360 - o.advance;
  const { burn, flash } = burnState(c, t, sparkAt);
  ctx.save(); ctx.beginPath(); ctx.rect(CX - BORE / 2, ROOF, BORE, cy - ROOF); ctx.clip();
  const burning = c >= sparkAt - 1 && c < 560;
  // the charge
  let base = col, al = a;
  if (burning && d < 0.5 && burn < 1 && c < 400) { base = c < 360 ? mixHex(C.air, C.warm, 1) : C.warm; al = 0.62; }
  ctx.globalAlpha = al * o.gas; ctx.fillStyle = base; ctx.fillRect(CX - BORE / 2, ROOF, BORE, cy - ROOF); ctx.globalAlpha = 1;
  // petrol: a flame front spreads from the plug; diesel: the spray lights in several places at once
  const heat = (1 - 0.6 * seg(c, 380, 540)) * (1 - seg(c, 470, 560));
  if (d < 0.5 && burning && burn > 0) {
    const rad = 12 + burn * 330;
    const fl = ctx.createRadialGradient(CX, ROOF + 4, 0, CX, ROOF + 4, rad);
    fl.addColorStop(0, rgba(C.white, 0.95 * heat)); fl.addColorStop(0.35, rgba(C.flame, 0.9 * heat)); fl.addColorStop(1, rgba(C.hot, (burn < 1 ? 0.45 : 0.65) * heat));
    ctx.globalAlpha = o.gas; ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(CX, ROOF + 4, rad, 0, TAU); ctx.fill();
    if (burn < 1) { stroke(3, rgba(C.white, 0.9)); ctx.beginPath(); ctx.arc(CX, ROOF + 4, rad, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (d >= 0.5) {
    const lit = seg(c, 356, 372);
    if (lit > 0 && c < 560) {
      ctx.globalAlpha = o.gas;
      for (const kn of KERNELS) {
        const p = clamp((c - 356 - kn.d) / 12);
        if (p <= 0) continue;
        const kx = CX + kn.x, ky = ROOF + kn.y * Math.max(10, cy - ROOF), rr = 6 + p * 160;
        const fl = ctx.createRadialGradient(kx, ky, 0, kx, ky, rr);
        fl.addColorStop(0, rgba(C.white, 0.9 * heat)); fl.addColorStop(0.5, rgba(C.flame, 0.8 * heat)); fl.addColorStop(1, rgba(C.hot, 0));
        ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(kx, ky, rr, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  // molecules: they spread as the piston falls and crowd together as it rises
  for (const p of DOTS) {
    let vis = clamp((amount - p.i / DOTS.length) * 10);
    if (vis <= 0) continue;
    const x = CX - BORE / 2 + 10 + p.u * (BORE - 20), y = ROOF + 5 + p.v * Math.max(2, cy - ROOF - 10);
    let dc = col;
    if (c < 360 && p.fuel && d < 0.5) dc = C.fuel;
    if (c >= sparkAt && c < 470 && (d < 0.5 ? burn > p.u * 0.8 : c > 362)) dc = C.white;
    ctx.globalAlpha = vis * 0.9 * o.gas; dot(x, y, 3.2, dc); ctx.globalAlpha = 1;
  }
  ctx.restore();
  return { flash, sparkAt };
}

function portFlow(th, t, o, va) {
  const c = cyc(th);
  const run = (pts, a, col, phase, fuel) => {
    if (a <= 0.02) return;
    const lens = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
    for (let j = 0; j < 16; j++) {
      let sd = ((((j / 16 + phase) % 1) + 1) % 1) * tot, i = 0;
      while (i < lens.length - 1 && sd > lens[i]) { sd -= lens[i]; i++; }
      const u = clamp(sd / lens[i]);
      const x = lerp(pts[i][0], pts[i + 1][0], u), y = lerp(pts[i][1], pts[i + 1][1], u) + (((j * 7) % 5) - 2) * 3;
      ctx.globalAlpha = a * o.gas; dot(x, y, 3.4, fuel && j % 3 === 1 ? C.fuel : col);
    }
    ctx.globalAlpha = 1;
  };
  const drift = t * 0.35;
  run([[150, 262], [300, 262], [IV - 6, 286], [IV - 6, ROOF + 14]], Math.min(1, inLift(c, va) * 3), C.air, c / 180 * 1.6 + drift, o.diesel < 0.5);
  run([[EV + 6, ROOF + 14], [EV + 6, 286], [2 * CX - 300, 262], [2 * CX - 150, 262]], Math.min(1, exLift(c, va) * 3), C.exhaust, (c - 480) / 180 * 1.6 + drift, false);
}

function portPath(g, mirror) {
  const X = (x) => (mirror ? 2 * CX - x : x), v = mirror ? EV : IV;
  g.moveTo(X(150), 240); g.lineTo(X(300), 240);
  g.quadraticCurveTo(X(v + VR + 10), 240, X(v + VR), ROOF);
  g.lineTo(X(v - VR), ROOF);
  g.quadraticCurveTo(X(v - VR - 6), 284, X(270), 284);
  g.lineTo(X(150), 284);
  g.closePath();
}
function drawBlock() {
  // liner walls, cut and hatched
  ctx.beginPath();
  ctx.rect(CX - BORE / 2 - WALL, ROOF, WALL, LINER_END - ROOF); ctx.rect(CX + BORE / 2, ROOF, WALL, LINER_END - ROOF);
  ctx.fillStyle = HATCH; ctx.fill(); stroke(2.2, C.steelLight); ctx.stroke();
  // crankcase
  ctx.beginPath();
  ctx.moveTo(CX - BORE / 2 - WALL, LINER_END); ctx.lineTo(CX - BORE / 2 - WALL, CY);
  ctx.ellipse(CX, CY, BORE / 2 + WALL, 128, 0, Math.PI, 0, true);
  ctx.lineTo(CX + BORE / 2 + WALL, LINER_END);
  ctx.save(); ctx.lineWidth = 16; ctx.strokeStyle = HATCH; ctx.stroke(); ctx.restore();
  stroke(2, C.steelLight); ctx.stroke();
}
function drawHead() {
  ctx.save();
  const p = new Path2D();
  p.rect(CX - BORE / 2 - WALL, HEAD_TOP, BORE + 2 * WALL, ROOF - HEAD_TOP);
  const holes = new Path2D(); portPath(holes, false); portPath(holes, true);
  ctx.beginPath(); ctx.rect(CX - BORE / 2 - WALL, HEAD_TOP, BORE + 2 * WALL, ROOF - HEAD_TOP); ctx.clip();
  const both = new Path2D(); both.addPath(p); both.addPath(holes);
  ctx.fillStyle = HATCH; ctx.fill(both, 'evenodd');
  ctx.restore();
  // manifolds outside the head
  for (const m of [false, true]) {
    const X = (x) => (m ? 2 * CX - x : x);
    ctx.beginPath(); ctx.rect(Math.min(X(150), X(CX - BORE / 2 - WALL)), 228, Math.abs(X(CX - BORE / 2 - WALL) - X(150)), 12);
    ctx.rect(Math.min(X(150), X(CX - BORE / 2 - WALL)), 284, Math.abs(X(CX - BORE / 2 - WALL) - X(150)), 12);
    ctx.fillStyle = HATCH; ctx.fill(); stroke(1.8, C.steelLight); ctx.stroke();
    stroke(3, C.steelLight); line(X(150), 220, X(150), 304);
  }
  stroke(2.2, C.steelLight); ctx.strokeRect(CX - BORE / 2 - WALL, HEAD_TOP, BORE + 2 * WALL, ROOF - HEAD_TOP);
  const ports = new Path2D(); portPath(ports, false); portPath(ports, true);
  stroke(2, C.steelHi); ctx.stroke(ports);
}
function drawPiston(th) {
  const cy = crownY(th), x0 = CX - BORE / 2 + 3, w = BORE - 6;
  ctx.fillStyle = steelH(x0, x0 + w);
  ctx.beginPath(); ctx.rect(x0, cy, w, 30); ctx.rect(x0, cy + 30, 14, PISTON_H - 30); ctx.rect(x0 + w - 14, cy + 30, 14, PISTON_H - 30); ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = HATCH_FINE; ctx.beginPath(); ctx.rect(x0, cy, w, 30); ctx.fill(); ctx.restore();
  stroke(2.2, C.steelHi);
  ctx.beginPath(); ctx.moveTo(x0, cy + PISTON_H); ctx.lineTo(x0, cy); ctx.lineTo(x0 + w, cy); ctx.lineTo(x0 + w, cy + PISTON_H); ctx.stroke();
  stroke(1.6, C.steelMid); ctx.beginPath(); ctx.moveTo(x0 + 14, cy + PISTON_H); ctx.lineTo(x0 + 14, cy + 30); ctx.lineTo(x0 + w - 14, cy + 30); ctx.lineTo(x0 + w - 14, cy + PISTON_H); ctx.stroke();
  for (const dy of [7, 14, 21]) { stroke(2.4, C.steelDark); line(x0 - 1, cy + dy, x0 + 9, cy + dy); line(x0 + w - 9, cy + dy, x0 + w + 1, cy + dy); }
}
function drawRodCrank(th) {
  const a = th * DEG, px = CX + R * Math.sin(a), py = CY - R * Math.cos(a), sy = pinY(th);
  ctx.save(); ctx.translate(CX, CY); ctx.rotate(a);
  const web = new Path2D();
  web.arc(0, 0, 104, Math.PI / 2 - 1.1, Math.PI / 2 + 1.1); web.arc(0, 0, 34, Math.PI / 2 + 1.1, Math.PI / 2 - 1.1, true); web.closePath();
  const wg = ctx.createLinearGradient(-104, 0, 104, 0); wg.addColorStop(0, C.steel); wg.addColorStop(0.5, C.steelLight); wg.addColorStop(1, C.steel);
  ctx.fillStyle = wg; ctx.fill(web);
  ctx.save(); ctx.clip(web); stroke(1.4, 'rgba(38,48,59,0.55)'); for (let d = -120; d <= 120; d += 14) line(d - 110, -110, d + 110, 110); ctx.restore();
  stroke(2.2, C.steelHi); ctx.stroke(web);
  k.rrect(-32, -R - 30, 64, R + 60, 32); ctx.fillStyle = steelH(-32, 32, C.steel, C.steelMid); ctx.fill(); stroke(2.2, C.steelHi); ctx.stroke();
  ctx.restore();
  // connecting rod
  const ang = Math.atan2(py - sy, px - CX), nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.beginPath();
  ctx.moveTo(CX + nx * 12, sy + ny * 12); ctx.lineTo(px + nx * 19, py + ny * 19); ctx.lineTo(px - nx * 19, py - ny * 19); ctx.lineTo(CX - nx * 12, sy - ny * 12); ctx.closePath();
  const rg = ctx.createLinearGradient(CX + nx * 16, sy + ny * 16, CX - nx * 16, sy - ny * 16); rg.addColorStop(0, C.steel); rg.addColorStop(0.5, C.steelHi); rg.addColorStop(1, C.steel);
  ctx.fillStyle = rg; ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
  ctx.setLineDash([16, 6, 3, 6]); stroke(1.2, 'rgba(38,48,59,0.7)'); line(CX, sy, px, py); ctx.setLineDash([]);
  for (const [x, y, r0, r1] of [[CX, sy, 24, 12], [px, py, 34, 18]]) {
    ctx.beginPath(); ctx.arc(x, y, r0, 0, TAU); ctx.fillStyle = steelH(x - r0, x + r0, C.steel, C.steelLight); ctx.fill(); stroke(2.2, C.steelHi); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r1, 0, TAU); ctx.fillStyle = C.steelDark; ctx.fill(); stroke(1.6, C.steelMid); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(CX, CY, 26, 0, TAU); ctx.fillStyle = C.steelDark; ctx.fill(); stroke(2.4, C.steelHi); ctx.stroke();
  stroke(1, 'rgba(234,242,248,0.4)'); line(CX - 40, CY, CX + 40, CY); line(CX, CY - 40, CX, CY + 40);
}
function drawValve(x, lift, glow) {
  const y = ROOF + lift * LIFT_PX, by = CAM_Y + CAM_R0 + lift * LIFT_PX;
  if (glow > 0.01) { ctx.save(); ctx.globalAlpha = glow; stroke(10, rgba(C.dim, 0.45)); ctx.beginPath(); ctx.moveTo(x - VR - 2, y + 1); ctx.lineTo(x + VR + 2, y + 1); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = steelH(x - 5, x + 5); ctx.fillRect(x - 5, by + 14, 10, y - by - 22);
  ctx.beginPath(); ctx.moveTo(x - 6, y - 14); ctx.lineTo(x + 6, y - 14); ctx.lineTo(x + VR, y - 3); ctx.lineTo(x + VR, y + 2); ctx.lineTo(x - VR, y + 2); ctx.lineTo(x - VR, y - 3); ctx.closePath();
  ctx.fillStyle = steelH(x - VR, x + VR); ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
  // spring between the bucket and the head
  const top = by + 18, bot = HEAD_TOP, n = 6;
  stroke(2.4, C.steelLight); ctx.beginPath();
  for (let i = 0; i <= n * 2; i++) ctx.lineTo(x + (i % 2 ? 16 : -16), lerp(top, bot, i / (n * 2)));
  ctx.stroke();
  k.rrect(x - 20, by, 40, 18, 3); ctx.fillStyle = steelH(x - 20, x + 20, C.steel, C.steelMid); ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
}
function drawCam(x, liftFn, th) {
  const phi = th / 2;
  ctx.save(); ctx.translate(x, CAM_Y);
  ctx.beginPath();
  for (let a = 0; a <= 360; a += 3) {
    // the cam point at body angle a faces down when a + θ/2 ≡ 90°, i.e. at crank angle 2(90° − a)
    const thAt = 2 * ((((90 - a) % 360) + 360) % 360);
    const r = CAM_R0 + LIFT_PX * liftFn(thAt);
    const X = r * Math.cos((a + phi) * DEG), Y = r * Math.sin((a + phi) * DEG);
    a === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
  }
  ctx.closePath(); ctx.fillStyle = steelH(-48, 48, C.steel, C.steelLight); ctx.fill(); stroke(2.2, C.steelHi); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fillStyle = C.steelDark; ctx.fill(); stroke(2, C.steelMid); ctx.stroke();
  stroke(2.4, C.dim); line(0, 0, 10 * Math.cos(phi * DEG), 10 * Math.sin(phi * DEG));
  ctx.restore();
}
function drawPlug(flash, a) {
  A(a, () => {
    ctx.fillStyle = C.steelDark; ctx.fillRect(CX - 5, 168, 10, 10); stroke(1.8, C.steelHi); ctx.strokeRect(CX - 5, 168, 10, 10);
    k.rrect(CX - 10, 178, 20, 44, 5); ctx.fillStyle = '#E8ECEF'; ctx.fill();
    stroke(1.4, 'rgba(38,48,59,0.6)'); for (const y of [188, 198, 208]) line(CX - 10, y, CX + 10, y);
    ctx.fillStyle = steelH(CX - 16, CX + 16); ctx.fillRect(CX - 16, 222, 32, 16); stroke(2, C.steelHi); ctx.strokeRect(CX - 16, 222, 32, 16);
    ctx.fillStyle = steelH(CX - 10, CX + 10); ctx.fillRect(CX - 10, 238, 20, ROOF - 238); ctx.strokeRect(CX - 10, 238, 20, ROOF - 238);
    stroke(2.6, C.steelHi); line(CX, ROOF, CX, ROOF + 6); ctx.beginPath(); ctx.moveTo(CX - 8, ROOF); ctx.lineTo(CX - 8, ROOF + 11); ctx.lineTo(CX - 1, ROOF + 11); ctx.stroke();
    if (flash > 0) {
      const gl = ctx.createRadialGradient(CX, ROOF + 8, 0, CX, ROOF + 8, 70 * flash + 10);
      gl.addColorStop(0, `rgba(255,252,230,${flash})`); gl.addColorStop(0.4, rgba(C.flame, 0.7 * flash)); gl.addColorStop(1, rgba(C.hot, 0));
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(CX, ROOF + 8, 70 * flash + 10, 0, TAU); ctx.fill();
      stroke(3, `rgba(255,255,240,${flash})`); ctx.beginPath(); ctx.moveTo(CX - 1, ROOF + 6); ctx.lineTo(CX + 5, ROOF + 8); ctx.lineTo(CX - 4, ROOF + 9); ctx.lineTo(CX + 2, ROOF + 12); ctx.stroke();
    }
  });
}
function drawInjector(c, a, th) {
  A(a, () => {
    ctx.fillStyle = steelH(CX - 14, CX + 14); k.rrect(CX - 14, 160, 28, 70, 6); ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
    ctx.fillStyle = steelH(CX - 9, CX + 9); ctx.beginPath(); ctx.moveTo(CX - 9, 230); ctx.lineTo(CX + 9, 230); ctx.lineTo(CX + 6, ROOF); ctx.lineTo(CX - 6, ROOF); ctx.closePath(); ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
    stroke(3, C.fuel); line(CX + 14, 180, CX + 40, 168); line(CX + 40, 168, CX + 60, 168);
    // the spray, near the top of compression
    const sp = span(c, 346, 372, 6, 8);
    if (sp > 0) {
      const cy = crownY(th), reach = Math.min(cy - ROOF - 2, 70) * seg(c, 346, 354) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(CX - BORE / 2, ROOF, BORE, cy - ROOF); ctx.clip();
      for (const dir of [-1, 1]) {
        const g = ctx.createLinearGradient(CX, ROOF, CX + dir * 130, ROOF + reach);
        g.addColorStop(0, rgba(C.fuel, 0.95 * sp)); g.addColorStop(1, rgba(C.fuel, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(CX, ROOF + 2); ctx.lineTo(CX + dir * 140, ROOF + reach); ctx.lineTo(CX + dir * 90, ROOF + reach + 6); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  });
}
function drawFlywheel(th, a) {
  A(a, () => {
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(th * DEG);
    ctx.setLineDash([14, 8]); stroke(2.4, rgba(C.dim, 0.9));
    ctx.beginPath(); ctx.arc(0, 0, 146, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.stroke();
    for (let i = 0; i < 6; i++) { const q = (i * TAU) / 6; line(Math.cos(q) * 40, Math.sin(q) * 40, Math.cos(q) * 118, Math.sin(q) * 118); }
    ctx.setLineDash([]);
    ctx.restore();
  });
}

function engine(th, t, alpha) {
  if (alpha <= 0) return;
  const o = { gas: gasOn(t), diesel: dieselK(t), advance: advance(t) };
  const va = valveAngles(t), c = cyc(th);
  A(alpha, () => {
    drawFlywheel(th, span(t, s('f11'), at(3) + 1.5, 0.8, 1.0));
    drawBlock();
    const g = drawGas(th, t, o);
    drawPiston(th);
    drawRodCrank(th);
    drawHead();
    portFlow(th, t, o, va);
    const both = clamp(Math.min(inLift(c, va), exLift(c, va)) * 30) * realK(t);
    drawValve(IV, inLift(c, va), both);
    drawValve(EV, exLift(c, va), both);
    drawCam(IV, (x) => inLift(x, va), th);
    drawCam(EV, (x) => exLift(x, va), th);
    drawPlug(g.flash, 1 - o.diesel);
    drawInjector(c, o.diesel, th);
    A(gasOn(t), () => {
      mono('IN', 150, 346, { size: 32, weight: 700, color: C.air });
      mono('OUT', 2 * CX - 150, 346, { size: 32, weight: 700, color: C.exhaust, align: 'right' });
    });
  });
}

// =====================================================================================================
// Header, diagram caption, title cards
// =====================================================================================================
function header(t) {
  A(seg(t, 0.2, 1.2) * (1 - seg(t, e('z6', 0.6), e('z6', 1.6))), () => {
    const rw = width('ENGINEERING', 32, DISPLAY, 400, '3px');
    label('ENGINEERING', 1824, 100, { color: C.soft, align: 'right', weight: 400, spacing: '3px' });
    label('RECKON', 1824 - rw - 22, 100, { color: C.dim, align: 'right', weight: 600, spacing: '3px' });
  });
  let ch = null; for (const c of CH) if (t >= c.at + 2.6) ch = c;
  if (ch && t < e('z6', 0.5)) A(seg(t, ch.at + 2.6, ch.at + 3.6) * (1 - seg(t, e('z6'), e('z6', 0.6))), () => label(`PART ${ch.n} · ${ch.title.toUpperCase()}`, 1824, 144, { color: C.faint, align: 'right', weight: 400, spacing: '2px' }));
  const eng = engineAlpha(t), multi = inCh(t, 7, 1.6);
  A(Math.max(eng, multi) * (1 - seg(t, e('z6'), e('z6', 0.8))), () => {
    label('SIMPLIFIED DIAGRAM', 96, 104, { color: C.faint, weight: 400, spacing: '2px' });
    label('NOT TO SCALE', 96, 144, { color: C.faint, weight: 400, spacing: '2px' });
    A(Math.max(span(t, 0, at(1) + 2, 0.5, 1), span(t, at(9) + 2, e('z6'), 1, 0.6)), () => label('SLOWED DOWN', 96, 184, { color: C.dim, weight: 400, spacing: '2px' }));
  });
}
function titleBlock(cx, cy, bw, bh, big, small, foot) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(8,16,26,0.94)'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  stroke(3, C.line); ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  stroke(1.4, rgba(C.line, 0.6)); ctx.strokeRect(-bw / 2 + 10, -bh / 2 + 10, bw - 20, bh - 20);
  const fy = bh / 2 - 74;
  stroke(1.6, rgba(C.line, 0.7)); line(-bw / 2 + 10, fy, bw / 2 - 10, fy);
  const cells = foot.length; for (let i = 1; i < cells; i++) line(-bw / 2 + 10 + ((bw - 20) * i) / cells, fy, -bw / 2 + 10 + ((bw - 20) * i) / cells, bh / 2 - 10);
  foot.forEach((f, i) => mono(f, -bw / 2 + 10 + ((bw - 20) * (i + 0.5)) / cells, fy + 44, { size: 32, color: C.soft, align: 'center' }));
  label(small, 0, -bh / 2 + 78, { size: 36, color: C.dim, align: 'center', spacing: '5px', weight: 500 });
  label(big, 0, fy - 46, { size: big.length > 18 ? 96 : 110, color: C.ink, align: 'center', spacing: '3px', weight: 600 });
  ctx.restore();
}
function titleCards(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.5, 0.6);
    if (a <= 0) continue;
    A(a * 0.7, () => { ctx.fillStyle = '#050B13'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      titleBlock(960, 520 + (1 - p) * 24, 1180, 380, ch.title.toUpperCase(), `PART ${ch.n}`, ['RECKON', `SHEET ${ch.n} OF ${CH.length}`, 'ENGINES']);
    });
  }
}
function coldTitle(t) {
  const a = span(t, s('o4', -0.2), at(1) + 0.6, 0.7, 0.7);
  if (a <= 0) return;
  A(a * 0.72, () => { ctx.fillStyle = '#050B13'; ctx.fillRect(0, 0, W, H); });
  A(a, () => {
    const p = eout(seg(t, s('o4', -0.2), s('o4', 0.8)));
    ctx.save(); ctx.translate(0, (1 - p) * 20);
    label('THE FOUR-STROKE ENGINE', 960, 470, { size: 136, weight: 600, align: 'center', spacing: '4px' });
    label('TWO TURNS, ONE PUSH', 960, 560, { size: 52, weight: 400, color: C.dim, align: 'center', spacing: '8px' });
    A(eout(seg(t, s('o4', 1.2), s('o4', 1.8))), () => chip('1862 · PATENTED, NEVER BUILT', 940, 680, { align: 'right', bg: C.line, size: 34 }));
    A(eout(seg(t, s('o5', 1.0), s('o5', 1.6))), () => chip('1876 · BUILT · 1886 · PATENT LOST', 980, 680, { align: 'left', bg: C.flame, size: 34 }));
    ctx.restore();
  });
}

// =====================================================================================================
// Shared panel pieces
// =====================================================================================================
const STROKES = [
  ['INTAKE', 'INTAKE VALVE OPEN · PISTON DOWN', C.air],
  ['COMPRESSION', 'BOTH VALVES SHUT · PISTON UP', C.warm],
  ['POWER', 'SPARK · BURNING GAS PUSHES DOWN', C.hot],
  ['EXHAUST', 'EXHAUST VALVE OPEN · PISTON UP', C.exhaust],
];
function cycleDial(cx, cy, r, c, a = 1) {
  const sIdx = strokeIdx(c);
  A(a, () => {
    for (let i = 0; i < 4; i++) {
      const a0 = -Math.PI / 2 + (i * Math.PI) / 2 + 0.03, a1 = a0 + Math.PI / 2 - 0.06, on = i === sIdx;
      ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.lineWidth = on ? 30 : 20; ctx.strokeStyle = rgba(STROKES[i][2], on ? 1 : 0.32); ctx.lineCap = 'butt'; ctx.stroke();
      const m = (a0 + a1) / 2;
      label(String(i + 1), cx + Math.cos(m) * (r - 52), cy + Math.sin(m) * (r - 52) + 2, { size: 40, weight: 600, align: 'center', base: 'middle', color: on ? C.ink : C.faint });
    }
    ctx.lineCap = 'round';
    stroke(1.6, C.faint); ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const q = -Math.PI / 2 + (i * Math.PI) / 4; line(cx + Math.cos(q) * (r + 20), cy + Math.sin(q) * (r + 20), cx + Math.cos(q) * (r + 32), cy + Math.sin(q) * (r + 32)); }
    const pa = -Math.PI / 2 + (c / 720) * TAU;
    stroke(4, C.ink); line(cx, cy, cx + Math.cos(pa) * (r + 30), cy + Math.sin(pa) * (r + 30));
    ctx.beginPath(); ctx.arc(cx, cy, 70, 0, TAU); ctx.fillStyle = '#0B1622'; ctx.fill(); stroke(2, C.ink); ctx.stroke();
    mono(`${Math.floor(c)}°`, cx, cy + 3, { size: 40, weight: 700, align: 'center', base: 'middle' });
  });
}
function counterRow(lbl, val, x0, x1, y, col = C.ink) {
  label(lbl, x0, y, { size: 32, color: C.soft, weight: 400 });
  mono(val, x1, y + 2, { size: 44, weight: 700, align: 'right', color: col });
}
/** Axes for a chart: origin (x0, y0), width w, height h. */
function axes(x0, y0, w, h, a = 1) {
  A(a, () => {
    stroke(2.4, C.soft); line(x0, y0, x0 + w, y0); line(x0, y0, x0, y0 - h);
    ctx.fillStyle = C.soft;
    ctx.beginPath(); ctx.moveTo(x0 + w + 14, y0); ctx.lineTo(x0 + w, y0 - 7); ctx.lineTo(x0 + w, y0 + 7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x0, y0 - h - 14); ctx.lineTo(x0 - 7, y0 - h); ctx.lineTo(x0 + 7, y0 - h); ctx.closePath(); ctx.fill();
  });
}
function plot(fn, x0, x1, n, prog = 1) {
  ctx.beginPath();
  const m = Math.max(1, Math.round(n * prog));
  for (let i = 0; i <= m; i++) { const [x, y] = fn(lerp(x0, x1, i / n)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
}

// =====================================================================================================
// Cold open
// =====================================================================================================
function partOpen(t) {
  const th = theta(t), c = cyc(th);
  A(span(t, s('o1', -0.3), s('o4', -0.1), 0.6, 0.6), () => {
    const p = eout(seg(t, s('o1', -0.3), s('o1', 0.6)));
    label('3,000 RPM', 1000, 360 + (1 - p) * 20, { size: 150, weight: 600, spacing: '2px' });
    A(seg(t, s('o1', 1.2), s('o1', 1.8)), () => label('= 50 CRANK TURNS EVERY SECOND', 1004, 432, { size: 40, color: C.soft, weight: 400 }));
    // fifty turns, a burn on every second one
    A(seg(t, s('o2', 0.1), s('o2', 0.6)), () => {
      const x0 = 1006, dx = 16.2, y = 610;
      for (let i = 0; i < 50; i++) {
        const lit = seg(t, s('o2', 0.2) + i * 0.05, s('o2', 0.3) + i * 0.05);
        A(0.25 + 0.75 * lit, () => { stroke(2.4, C.line); ctx.beginPath(); ctx.arc(x0 + i * dx, y, 6, 0, TAU); ctx.stroke(); });
        if (i % 2 === 1) A(lit, () => { const gx = x0 + i * dx - dx / 2, gy = y - 34; ctx.fillStyle = C.hot; ctx.beginPath(); ctx.moveTo(gx, gy - 14); ctx.quadraticCurveTo(gx + 9, gy, gx, gy + 8); ctx.quadraticCurveTo(gx - 9, gy, gx, gy - 14); ctx.fill(); });
      }
      label('TURNS', x0 - 4, y + 52, { size: 32, color: C.line, weight: 400 });
      label('BURNS: 25 A SECOND, ONE EVERY TWO TURNS', x0 - 4, y - 78, { size: 32, color: C.flame, weight: 400 });
    });
    // four trips, one push
    A(seg(t, s('o3', 0.1), s('o3', 0.7)), () => {
      STROKES.forEach(([name, , col], i) => {
        const x = 1006 + i * 200, y = 790, on = i === 2;
        const live = strokeIdx(c) === i;
        k.rrect(x, y - 40, 184, 80, 10); ctx.fillStyle = rgba(col, on ? 0.9 : 0.16); ctx.fill();
        if (live) { stroke(3, C.ink); ctx.stroke(); }
        label(name, x + 92, y + 2, { size: 32, align: 'center', base: 'middle', weight: 600, color: on ? C.paper : C.soft, spacing: '1px' });
      });
      label('4 TRIPS · ONLY ONE PUSHES', 1006, 892, { size: 40, color: C.ink, weight: 500 });
    });
  });
}

// =====================================================================================================
// 1 The machine
// =====================================================================================================
function leader(str, lx, ly, tx, ty, a, side = 'right') {
  A(a, () => {
    const w = width(str, 34, DISPLAY, 500);
    const ex = side === 'right' ? lx - 14 : lx + w + 14;
    const p = eout(clamp(a * 1.4));
    stroke(2, C.dim); line(ex, ly - 11, lerp(ex, tx, p), lerp(ly - 11, ty, p));
    dot(tx, ty, 5 * p, C.dim);
    label(str, lx, ly, { size: 34, weight: 500, spacing: '2px', align: side === 'right' ? 'left' : 'left' });
  });
}
function partMachine(t, th) {
  const L = (key, d = 0.1) => seg(t, s(key, d), s(key, d + 0.6)) * (1 - seg(t, s('m9', -0.2), s('m9', 0.4)));
  leader('PISTON', 850, 420, CX + 126, 380, L('m2'));
  leader('CONNECTING ROD', 850, 610, CX + 18, 600, L('m3', 0.3));
  leader('CRANKSHAFT', 850, 852, CX + 70, CY + 18, L('m3', 1.6));
  leader('INTAKE VALVE', 850, 356, IV + 36, ROOF + 8, L('m4', 0.6));
  leader('EXHAUST VALVE', 850, 300, EV + 44, ROOF, L('m4', 1.8));
  leader('CAMSHAFT', 850, 140, EV + 50, CAM_Y, L('m5', 0.2));
  leader('VALVE SPRING', 850, 196, EV + 17, 196, L('m5', 1.8));
  leader('SPARK PLUG', 850, 246, CX + 17, 230, L('m6', 0.1));
  // TDC, BDC and the stroke, to the left of the cylinder
  const dA = span(t, s('m7'), at(2) + 1.0, 0.5, 0.6);
  A(dA, () => {
    const x = CX - BORE / 2 - WALL - 16;
    stroke(2.4, C.dim);
    A(seg(t, s('m7', 0.2), s('m7', 0.8)), () => { line(x - 70, TDC_Y, x, TDC_Y); label('TDC', x - 84, TDC_Y + 12, { size: 34, align: 'right', color: C.dim, weight: 600 }); });
    A(seg(t, mid('m7', 0.6), mid('m7', 0.9)), () => { line(x - 70, BDC_Y, x, BDC_Y); label('BDC', x - 84, BDC_Y + 12, { size: 34, align: 'right', color: C.dim, weight: 600 }); });
    A(seg(t, s('m8', 0.2), s('m8', 0.8)), () => {
      const ax = x - 36, up = eio(seg(t, s('m8', 0.2), s('m8', 1.0))), m0 = (TDC_Y + BDC_Y) / 2;
      const y0 = lerp(m0, TDC_Y + 4, up), y1 = lerp(m0, BDC_Y - 4, up);
      stroke(2.4, C.dim); line(ax, y0, ax, y1);
      ctx.fillStyle = C.dim;
      ctx.beginPath(); ctx.moveTo(ax, y0); ctx.lineTo(ax - 8, y0 + 16); ctx.lineTo(ax + 8, y0 + 16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax, y1); ctx.lineTo(ax - 8, y1 - 16); ctx.lineTo(ax + 8, y1 - 16); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(ax - 18, m0); ctx.rotate(-Math.PI / 2); label('STROKE', 0, 0, { size: 34, align: 'center', color: C.dim, weight: 600, spacing: '3px' }); ctx.restore();
    });
  });
  // the piston's position against crank angle, traced as the crank turns
  const gA = span(t, s('m9', -0.2), at(2) + 1.2, 0.6, 0.6);
  if (gA <= 0) return;
  const th0 = theta(s('m9', 0.1)), rel = th - th0;
  const X0 = 1060, Y0 = 300, GW = 700, GH = 420;
  const gx = (a) => X0 + (a / 360) * GW, gy = (tr) => Y0 + (tr / STROKE) * GH;
  A(gA, () => {
    label('PISTON POSITION AS THE CRANK TURNS', 1000, 230, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    stroke(2, C.ghost);
    for (const a of [0, 90, 180, 270, 360]) { line(gx(a), Y0, gx(a), Y0 + GH); mono(`${a}°`, gx(a), Y0 + GH + 44, { align: 'center', color: C.faint }); }
    line(X0, Y0, X0 + GW, Y0); line(X0, Y0 + GH, X0 + GW, Y0 + GH);
    mono('TDC', X0 - 16, Y0 + 10, { align: 'right', color: C.dim, size: 32 });
    mono('BDC', X0 - 16, Y0 + GH + 10, { align: 'right', color: C.dim, size: 32 });
    // the comparison: a crank with an endlessly long rod gives a pure wave
    A(seg(t, s('m10', 0.6), s('m10', 1.2)), () => {
      ctx.setLineDash([10, 9]); stroke(2.4, C.faint);
      plot((a) => [gx(a), gy((STROKE / 2) * (1 - Math.cos(a * DEG)))], 0, 360, 90);
      ctx.setLineDash([]);
    });
    const prog = clamp(rel / 360);
    stroke(4, C.ink); plot((a) => [gx(a), gy(travel(a))], 0, 360, 120, prog);
    const ca = rel <= 0 ? 0 : rel <= 360 ? rel : ((rel % 360) + 360) % 360;
    if (rel > 0) dot(gx(ca), gy(travel(ca)), 9, C.dim);
    // after a quarter turn: more than half the stroke
    A(seg(t, mid('m10', 0.75), e('m10')), () => {
      stroke(2.4, C.dim); ctx.setLineDash([6, 7]);
      line(gx(90), gy(travel(90)), X0, gy(travel(90))); ctx.setLineDash([]);
      A(1 - seg(t, s('m11', 0.1), s('m11', 0.5)), () => {
        chip(`QUARTER TURN: ${pct(QUARTER)} OF THE STROKE`, 1000, 840, { size: 34 });
        A(seg(t, e('m10', -0.2), e('m10', 0.5)), () => label('DASHED: A PURE WAVE, 50%', 1004, 910, { size: 32, color: C.faint, weight: 400 }));
      });
    });
    // the halves: hurrying through the top, dawdling through the bottom
    A(seg(t, s('m11', 0.4), s('m11', 1.2)), () => {
      ctx.fillStyle = rgba(C.dim, 0.18);
      ctx.fillRect(gx(0), Y0, gx(HALF_AT) - gx(0), GH / 2); ctx.fillRect(gx(360 - HALF_AT), Y0, gx(360) - gx(360 - HALF_AT), GH / 2);
      ctx.fillStyle = rgba(C.line, 0.10); ctx.fillRect(gx(HALF_AT), Y0 + GH / 2, gx(360 - HALF_AT) - gx(HALF_AT), GH / 2);
      stroke(1.6, C.faint); line(X0, Y0 + GH / 2, X0 + GW, Y0 + GH / 2);
    });
  });
  A(gA * seg(t, s('m11', 0.4), s('m11', 1.2)), () => {
    const top = 2 * HALF_AT, bot = 360 - top;
    counterRow('TOP HALF OF THE STROKE', `${Math.round(top)}° OF CRANK`, 1000, 1800, 850, C.dim);
    counterRow('BOTTOM HALF', `${Math.round(bot)}° OF CRANK`, 1000, 1800, 910, C.line);
    // and on the crank circle
    ctx.save(); ctx.globalAlpha *= engineAlpha(t);
    ctx.lineCap = 'butt';
    ctx.lineWidth = 8; ctx.strokeStyle = C.dim; ctx.beginPath(); ctx.arc(CX, CY, R + 30, -Math.PI / 2 - HALF_AT * DEG, -Math.PI / 2 + HALF_AT * DEG); ctx.stroke();
    ctx.strokeStyle = rgba(C.line, 0.8); ctx.beginPath(); ctx.arc(CX, CY, R + 30, -Math.PI / 2 + HALF_AT * DEG, Math.PI * 1.5 - HALF_AT * DEG); ctx.stroke();
    ctx.restore();
  });
}

// =====================================================================================================
// 2 Four strokes (and the stroke panel reused in the recap)
// =====================================================================================================
function strokeTitle(c, x, y, a) {
  const i = strokeIdx(c);
  A(a, () => {
    const [name, sub, col] = STROKES[i];
    label(`STROKE ${i + 1}`, x, y - 96, { size: 40, color: col, weight: 500, spacing: '4px' });
    label(name, x, y, { size: 96, weight: 600, spacing: '3px' });
    label(sub, x, y + 56, { size: 34, color: C.soft, weight: 400 });
  });
}
function partStrokes(t, th) {
  const base = theta(at(2) + 2.6), c = cyc(th);
  const run = th - base;
  const live = seg(t, s('f2', -0.2), s('f2', 0.4));
  // the big stroke name: only while a stroke is being described or the engine runs
  strokeTitle(c, 1000, 380, live);
  A(seg(t, s('f1', 0.2), s('f1', 0.9)), () => {
    cycleDial(1190, 700, 170, c);
    label('ONE CYCLE = 720° = 2 TURNS', 1190, 952, { size: 32, color: C.soft, weight: 400, align: 'center' });
  });
  A(seg(t, s('f2', 0.2), s('f2', 0.8)), () => {
    const turns = Math.max(0, run / 360);
    const pushes = run > 361 ? Math.floor((run - 361) / 720) + 1 : t > s('f5', 0.35) && run > 359 ? 1 : 0;
    counterRow('CRANK TURNS', turns.toFixed(2), 1440, 1820, 600);
    counterRow('CAMSHAFT TURNS', (turns / 2).toFixed(2), 1440, 1820, 680, C.dim);
    counterRow('POWER STROKES', String(pushes), 1440, 1820, 760, C.hot);
  });
  // only stroke 3 pushes
  A(span(t, s('f7', 0.1), e('f7', 0.8), 0.4, 0.5), () => chip('ONLY STROKE 3 PUSHES', 1820, 860, { bg: C.hot, size: 32, align: 'right' }));
  // the cams: half speed
  A(span(t, s('f10', 0.2), e('f10', 0.8), 0.4, 0.5), () => {
    chip('CAMSHAFT: HALF THE CRANK’S SPEED', 640, 132, { size: 32, align: 'left' });
  });
  // the flywheel's energy, computed from the same ideal cycle
  A(span(t, s('f11', 0.4), at(3) + 1.0, 0.6, 0.6), () => {
    const f = FLY.at(c), x0 = 1440, y = 860, w = 380;
    label('FLYWHEEL ENERGY', x0, y - 22, { size: 32, color: C.dim, weight: 500 });
    k.rrect(x0, y - 4, w, 30, 6); stroke(2, C.dim); ctx.stroke();
    k.rrect(x0 + 3, y - 1, (w - 6) * (0.08 + 0.92 * f), 24, 4); ctx.fillStyle = C.dim; ctx.fill();
    const storing = TORQUE1[Math.round(c) % 720] > FLY.mean;
    label(storing ? 'STORING' : 'GIVING BACK', x0, y + 66, { size: 32, color: storing ? C.flame : C.line, weight: 500 });
  });
  A(span(t, s('f11', 0.3), at(3) + 1.0, 0.6, 0.6) * engineAlpha(t), () => label('FLYWHEEL (BEHIND)', CX + 170, 950, { size: 32, color: C.dim, weight: 500 }));
}

// =====================================================================================================
// 3 Who invented it? (full-width timeline)
// =====================================================================================================
const YEAR0 = 1857, YEAR1 = 1892, AX0 = 200, AX1 = 1720, AXY = 800;
const yx = (y) => AX0 + ((y - YEAR0) / (YEAR1 - YEAR0)) * (AX1 - AX0);
const EVENTS = [
  { k: 'h2', until: 'h4', year: 1860, head: '1860 · ÉTIENNE LENOIR, PARIS', lines: ['A GAS ENGINE THAT BURNS ITS FUEL', 'WITHOUT COMPRESSING IT'], icon: 'lenoir' },
  { k: 'h4', until: 'h5', year: 1860, head: 'NICOLAUS OTTO', lines: ['A TRAVELLING SALESMAN', 'LEARNS OF LENOIR’S ENGINE'], icon: 'case' },
  { k: 'h5', until: 'h6', year: 1862, head: '1862 · OTTO TRIES COMPRESSION', lines: ['IT RUNS A FEW MINUTES,', 'THEN DESTROYS ITSELF'], icon: 'burst' },
  { k: 'h6', until: 'h7', year: 1862, head: '1862 · ALPHONSE BEAU DE ROCHAS', lines: ['PATENTS THE FOUR-STROKE CYCLE', 'NEVER BUILDS AN ENGINE'], icon: 'patent' },
  { k: 'h7', until: 'h8', year: 1864, head: '1864 · N. A. OTTO & CIE', lines: ['OTTO AND EUGEN LANGEN FOUND', 'THE FIRST COMPANY DEVOTED TO ENGINES'], icon: 'factory' },
  { k: 'h8', until: 'h9', year: 1867, head: '1867 · PARIS WORLD’S FAIR', lines: ['THEIR ATMOSPHERIC ENGINE', 'WINS A GOLD MEDAL'], icon: 'medal' },
  { k: 'h9', until: 'h11', year: 1876, head: '1876 · OTTO’S FOUR-STROKE ENGINE', lines: ['COMPRESSES ITS CHARGE IN THE CYLINDER', 'AN IMMEDIATE SUCCESS'], icon: 'otto' },
  { k: 'h11', until: 'h12', year: 1883, head: 'GOTTLIEB DAIMLER & WILHELM MAYBACH', lines: ['SMALL, FAST ENGINES FOR VEHICLES', 'FIRST HIGH-SPEED OTTO ENGINE, 1883'], icon: 'fast' },
  { k: 'h12', until: 'h13', year: 1886, head: '1886 · PATENT CANCELLED IN GERMANY', lines: ['BEAU DE ROCHAS HAD PATENTED', 'THE CYCLE FIRST'], icon: 'cancel' },
  { k: 'h13', until: 'h14', year: 1889, head: '1889 · MORE THAN 50 COMPANIES', lines: ['BUILD OTTO-TYPE ENGINES'], icon: 'many' },
];
function iconLenoir(cx, cy, p) {
  // a horizontal cylinder, burning on both sides of the piston, and a flywheel
  stroke(3, C.line);
  ctx.strokeRect(cx - 200, cy - 50, 230, 100);
  ctx.fillStyle = rgba(C.hot, 0.35 + 0.25 * Math.sin(p * 6)); ctx.fillRect(cx - 196, cy - 46, 90, 92);
  ctx.fillStyle = steelH(cx - 106, cx - 80); ctx.fillRect(cx - 106, cy - 46, 26, 92);
  stroke(3, C.line); line(cx - 80, cy, cx + 90, cy);
  ctx.beginPath(); ctx.arc(cx + 150, cy, 90, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 150, cy, 12, 0, TAU); ctx.stroke();
  for (let i = 0; i < 6; i++) { const q = p * 2 + (i * TAU) / 6; line(cx + 150 + Math.cos(q) * 14, cy + Math.sin(q) * 14, cx + 150 + Math.cos(q) * 86, cy + Math.sin(q) * 86); }
  line(cx - 230, cy + 110, cx + 260, cy + 110);
}
function iconCase(cx, cy) {
  stroke(3, C.line);
  k.rrect(cx - 150, cy - 60, 300, 170, 14); ctx.stroke();
  k.rrect(cx - 50, cy - 100, 100, 40, 10); ctx.stroke();
  line(cx - 150, cy, cx + 150, cy);
  k.rrect(cx + 60, cy - 160, 190, 120, 4); ctx.fillStyle = '#0D1A28'; ctx.fill(); ctx.stroke();
  for (let i = 0; i < 4; i++) line(cx + 80, cy - 130 + i * 22, cx + (i === 0 ? 230 : 200), cy - 130 + i * 22);
}
function iconBurst(cx, cy, p) {
  stroke(3, C.line);
  ctx.strokeRect(cx - 80, cy - 120, 160, 220);
  ctx.fillStyle = rgba(C.hot, 0.4); ctx.fillRect(cx - 76, cy - 116, 152, 90);
  stroke(4, C.flame);
  ctx.beginPath(); ctx.moveTo(cx - 20, cy - 120); ctx.lineTo(cx + 6, cy - 60); ctx.lineTo(cx - 12, cy - 20); ctx.lineTo(cx + 18, cy + 30); ctx.stroke();
  for (let i = 0; i < 9; i++) { const q = (i / 9) * TAU, r0 = 150 + 10 * Math.sin(p * 9 + i), r1 = r0 + 40; line(cx + Math.cos(q) * r0, cy - 10 + Math.sin(q) * r0 * 0.9, cx + Math.cos(q) * r1, cy - 10 + Math.sin(q) * r1 * 0.9); }
}
function iconPatent(cx, cy, stamp, cancel = 0) {
  stroke(3, C.line);
  ctx.fillStyle = '#0D1A28'; ctx.beginPath(); ctx.rect(cx - 140, cy - 170, 280, 340); ctx.fill(); ctx.stroke();
  label('PATENT', cx, cy - 116, { size: 40, align: 'center', color: C.line, weight: 600, spacing: '4px' });
  for (let i = 0; i < 4; i++) {
    const x = cx - 105 + i * 70, y = cy - 50;
    ctx.strokeRect(x - 22, y, 44, 80);
    const py = y + [10, 50, 14, 50][i];
    ctx.fillStyle = [rgba(C.air, 0.5), rgba(C.warm, 0.6), rgba(C.hot, 0.7), rgba(C.exhaust, 0.6)][i]; ctx.fillRect(x - 20, y + 2, 40, py - y - 2);
    line(x - 20, py, x + 20, py);
  }
  for (let i = 0; i < 3; i++) line(cx - 105, cy + 70 + i * 26, cx + (i === 2 ? 40 : 105), cy + 70 + i * 26);
  if (stamp > 0) A(stamp, () => { ctx.save(); ctx.translate(cx + 40, cy + 120); ctx.rotate(-0.18); chip('NEVER BUILT', 0, 0, { align: 'center', bg: C.flame, outline: true, size: 34 }); ctx.restore(); });
  if (cancel > 0) A(cancel, () => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.3); chip('CANCELLED', 0, 0, { align: 'center', bg: C.hot, outline: true, size: 48, h: 74 }); ctx.restore(); });
}
function iconFactory(cx, cy) {
  stroke(3, C.line);
  ctx.beginPath(); ctx.moveTo(cx - 200, cy + 110); ctx.lineTo(cx - 200, cy - 10);
  for (let i = 0; i < 3; i++) { ctx.lineTo(cx - 200 + i * 110 + 110, cy - 70); ctx.lineTo(cx - 200 + i * 110 + 110, cy - 10); }
  ctx.lineTo(cx + 130, cy - 10); ctx.lineTo(cx + 130, cy - 170); ctx.lineTo(cx + 180, cy - 170); ctx.lineTo(cx + 180, cy + 110); ctx.closePath(); ctx.stroke();
  for (let i = 0; i < 4; i++) ctx.strokeRect(cx - 180 + i * 75, cy + 20, 44, 44);
  line(cx - 240, cy + 110, cx + 240, cy + 110);
}
function iconMedal(cx, cy) {
  stroke(3, C.line);
  ctx.beginPath(); ctx.moveTo(cx - 50, cy - 170); ctx.lineTo(cx - 10, cy - 60); ctx.moveTo(cx + 50, cy - 170); ctx.lineTo(cx + 10, cy - 60); ctx.stroke();
  const g = ctx.createRadialGradient(cx - 20, cy - 10, 10, cx, cy, 90); g.addColorStop(0, '#FFE7A0'); g.addColorStop(1, '#B98A2E');
  ctx.beginPath(); ctx.arc(cx, cy + 10, 80, 0, TAU); ctx.fillStyle = g; ctx.fill(); stroke(3, '#FFE7A0'); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy + 10, 58, 0, TAU); stroke(2, 'rgba(90,60,10,0.6)'); ctx.stroke();
  label('1867', cx, cy + 24, { size: 40, align: 'center', color: '#5A3C0A', weight: 600 });
}
function iconOtto(cx, cy, p) {
  // a horizontal engine with a big flywheel
  stroke(3, C.line);
  ctx.strokeRect(cx - 230, cy - 50, 200, 100);
  const pp = cx - 200 + 70 * (0.5 - 0.5 * Math.cos(p * 3));
  ctx.fillStyle = rgba(C.warm, 0.5); ctx.fillRect(cx - 226, cy - 46, pp - cx + 226, 92);
  ctx.fillStyle = steelH(pp, pp + 24); ctx.fillRect(pp, cy - 46, 24, 92);
  stroke(3, C.line);
  const fx = cx + 150, q = p * 3;
  line(pp + 24, cy, fx + Math.cos(q + Math.PI) * 40, cy + Math.sin(q + Math.PI) * 40);
  ctx.beginPath(); ctx.arc(fx, cy, 120, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(fx, cy, 100, 0, TAU); ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = q + (i * TAU) / 6; line(fx + Math.cos(a) * 14, cy + Math.sin(a) * 14, fx + Math.cos(a) * 100, cy + Math.sin(a) * 100); }
  line(cx - 260, cy + 130, cx + 300, cy + 130);
}
function iconMany(cx, cy, n) {
  stroke(2, C.line);
  for (let i = 0; i < n; i++) {
    const x = cx - 250 + (i % 10) * 50, y = cy - 120 + Math.floor(i / 10) * 56;
    ctx.beginPath(); ctx.moveTo(x, y + 34); ctx.lineTo(x, y + 12); ctx.lineTo(x + 14, y + 4); ctx.lineTo(x + 14, y + 12); ctx.lineTo(x + 28, y + 4); ctx.lineTo(x + 28, y + 12); ctx.lineTo(x + 40, y + 12); ctx.lineTo(x + 40, y - 6); ctx.lineTo(x + 46, y - 6); ctx.lineTo(x + 46, y + 34); ctx.closePath(); ctx.stroke();
  }
}
function iconFast(cx, cy, p) {
  stroke(3, C.line);
  ctx.strokeRect(cx - 170, cy - 120, 90, 150);
  ctx.beginPath(); ctx.arc(cx - 125, cy + 70, 46, 0, TAU); ctx.stroke();
  for (const wx of [cx + 30, cx + 230]) {
    ctx.beginPath(); ctx.arc(wx, cy + 60, 70, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(wx, cy + 60, 8, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = p * 5 + (i * TAU) / 8; line(wx + Math.cos(a) * 10, cy + 60 + Math.sin(a) * 10, wx + Math.cos(a) * 66, cy + 60 + Math.sin(a) * 66); }
  }
  line(cx - 80, cy - 40, cx + 230, cy - 20); line(cx + 30, cy + 60, cx + 120, cy - 30);
  stroke(3, C.dim); for (let i = 0; i < 3; i++) line(cx - 300, cy - 40 + i * 40, cx - 210, cy - 40 + i * 40);
}
function bars(x, y, rows, a) {
  A(a, () => {
    label('EFFICIENCY', x, y, { size: 32, color: C.dim, weight: 500, spacing: '2px' });
    rows.forEach(([name, v, col, ra], i) => A(ra, () => {
      const yy = y + 40 + i * 60;
      label(name, x, yy + 26, { size: 32, color: C.soft, weight: 400 });
      ctx.fillStyle = col; ctx.fillRect(x + 300, yy + 2, v * 16 * eout(clamp(ra * 1.5)), 32);
      mono(`${Math.round(v)}%`, x + 310 + v * 16, yy + 30, { size: 32, weight: 700, color: col });
    }));
  });
}
function partHistory(t) {
  // the axis
  A(seg(t, s('h1', -0.4), s('h1', 0.6)), () => {
    stroke(3, C.soft); line(AX0 - 20, AXY, AX1 + 20, AXY);
    for (let y = 1860; y <= 1890; y += 5) { stroke(2, C.faint); line(yx(y), AXY - 10, yx(y), AXY + 10); }
  });
  let curX = null;
  for (const ev of EVENTS) {
    const a0 = s(ev.k, -0.3), a1 = s(ev.until, -0.2);
    const seen = seg(t, a0, a0 + 0.5);
    if (seen > 0) A(seen, () => {
      const x = yx(ev.year), on = t < a1 + 0.3;
      dot(x, AXY, on ? 11 : 8, on ? C.dim : C.line);
      if (ev.k !== 'h4' && ev.k !== 'h6') mono(String(ev.year), x, AXY + 50, { align: 'center', size: 32, color: on ? C.dim : C.soft, weight: on ? 700 : 500 });
    });
    if (t >= a0 && t <= a1 + 0.6) curX = yx(ev.year);
    const a = span(t, a0, a1 + 0.5, 0.5, 0.5);
    if (a <= 0) continue;
    A(a, () => {
      const p = t - a0, ix = 0, iy = 0;
      ctx.save(); ctx.translate(500, 450); ctx.scale(1.3, 1.3);
      ({
        lenoir: () => iconLenoir(ix, iy, p), case: () => iconCase(ix, iy), burst: () => iconBurst(ix, iy, p),
        patent: () => iconPatent(ix, iy, seg(t, mid('h6', 0.6), mid('h6', 0.8))),
        factory: () => iconFactory(ix, iy), medal: () => iconMedal(ix, iy), otto: () => iconOtto(ix, iy, p),
        cancel: () => iconPatent(ix, iy, 0, seg(t, s('h12', 0.8), s('h12', 1.2))),
        many: () => iconMany(ix, iy, Math.round(50 * eio(seg(t, s('h13', 0.2), e('h13', -0.3))))),
        fast: () => iconFast(ix, iy, p),
      })[ev.icon]();
      ctx.restore();
      const ty = 350;
      label(ev.head, 880, ty, { size: ev.head.length > 30 ? 52 : 60, weight: 600, spacing: '2px' });
      ev.lines.forEach((l, i) => label(l, 882, ty + 70 + i * 54, { size: 40, color: C.soft, weight: 400 }));
    });
  }
  // a marker on the axis for the current event
  if (curX != null) A(seg(t, s('h2', -0.3), s('h2', 0.3)) * (1 - seg(t, s('h14', -0.3), s('h14', 0.3))), () => { stroke(3, C.dim); line(curX, AXY - 40, curX, AXY - 16); });
  // efficiency bars for Lenoir and the atmospheric engine
  bars(882, 560, [['LENOIR, 1860', 4, C.line, seg(t, s('h3', 0.2), s('h3', 0.8))], ['OTTO & LANGEN, 1867', 12, C.dim, seg(t, s('h8', 1.0), s('h8', 1.6))]],
    Math.max(span(t, s('h3'), s('h4', -0.1), 0.4, 0.4), span(t, s('h8', 0.8), s('h9', -0.1), 0.4, 0.4)));
  // the name that stuck
  A(span(t, s('h14', -0.2), at(4) + 1.0, 0.6, 0.6), () => {
    label('THE OTTO CYCLE', 960, 470, { size: 130, weight: 600, align: 'center', spacing: '6px' });
    label('INTAKE · COMPRESSION · POWER · EXHAUST', 960, 560, { size: 40, color: C.dim, align: 'center', weight: 400, spacing: '4px' });
  });
}

// =====================================================================================================
// 4 Pressure and volume
// =====================================================================================================
const PV = { x0: 1060, y0: 860, w: 720, h: 600 };
const pvx = (V) => PV.x0 + (V / 10.6) * PV.w;
const pvy = (p) => PV.y0 - (p / (P3 * 1.06)) * PV.h;
function pvState(t, th) {
  const c = cyc(th);
  // narrated: combustion during p5 and blowdown during p7, each while the crank is held
  let q2 = null, q4 = null;
  if (t >= s('p3') && t < s('p9', 0.2)) {
    if (c >= 359) q2 = t < s('p5') ? 0 : eio(seg(t, s('p5', 0.4), e('p5', -0.2)));
    if (c >= 539) q4 = t < s('p7') ? 0 : eio(seg(t, s('p7', 0.6), e('p7', -0.2)));
  }
  let cc = c;
  if (q2 != null && c > 359 && c < 360.02) cc = 360.01;
  if (q4 != null && c > 539 && c < 540.02) cc = 540.01;
  return { V: vol(cc), p: pressure(cc, q2, q4), c: cc };
}
function partPV(t, th) {
  const start = theta(s('p3', 0.2)), rel = th - start;
  A(seg(t, s('p1', 0.6), s('p1', 1.4)), () => {
    label('IDEALISED OTTO CYCLE · DIAGRAM', 1000, 232, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    axes(PV.x0, PV.y0, PV.w, PV.h);
    ctx.save(); ctx.translate(PV.x0 - 30, PV.y0 - PV.h / 2); ctx.rotate(-Math.PI / 2); label('PRESSURE', 0, 0, { size: 34, align: 'center', color: C.soft, spacing: '4px' }); ctx.restore();
    label('VOLUME', PV.x0 + PV.w * 0.55, PV.y0 + 52, { size: 34, align: 'center', color: C.soft, spacing: '4px' });
    stroke(2, C.ghost); ctx.setLineDash([6, 8]); line(pvx(1), PV.y0, pvx(1), PV.y0 - PV.h); line(pvx(10), PV.y0, pvx(10), PV.y0 - PV.h); ctx.setLineDash([]);
    mono('TDC', pvx(1), PV.y0 + 44, { align: 'center', color: C.dim });
    mono('BDC', pvx(10), PV.y0 + 44, { align: 'center', color: C.dim });
  });
  // the path traced so far, coloured by stroke
  const seg4 = [[0, 180, C.air], [180, 360, C.warm], [360, 540, C.hot], [540, 720, C.exhaust]];
  const done = rel;
  if (t > s('p3') && t < at(5) + 2) {
    A(seg(t, s('p3'), s('p3', 0.4)), () => {
      // the loop's area, once it's complete
      A(seg(t, s('p9', 0.2), s('p9', 1.2)), () => {
        ctx.beginPath();
        for (let c = 180; c <= 540; c += 2) { const V = vol(c), p = pressure(c); c === 180 ? ctx.moveTo(pvx(V), pvy(p)) : ctx.lineTo(pvx(V), pvy(p)); }
        ctx.closePath(); ctx.fillStyle = rgba(C.flame, 0.28); ctx.fill();
        stroke(2.4, C.flame); line(pvx(1.45), pvy(22), pvx(1.95), pvy(50));
        label('NET WORK', pvx(1.98), pvy(52), { size: 44, color: C.flame, weight: 600, spacing: '3px' });
      });
      for (const [a0, a1, col] of seg4) {
        const hi = Math.min(a1, done), lo = a0;
        if (hi <= lo && !(done >= 720)) continue;
        stroke(5, col);
        ctx.beginPath();
        const top = done >= 720 ? a1 : hi;
        for (let c = lo; c <= top + 0.001; c += 1.5) {
          const cc = Math.min(c, top), V = vol(cc);
          const p = pressure(cc);
          c === lo ? ctx.moveTo(pvx(V), pvy(p)) : ctx.lineTo(pvx(V), pvy(p));
        }
        ctx.stroke();
      }
      // the combustion and blowdown lines while they are narrated
      const st = pvState(t, th);
      if (t >= s('p5') && done <= 360.5) { stroke(5, C.hot); line(pvx(1), pvy(P2), pvx(1), pvy(st.p)); }
      if (t >= s('p7') && done <= 540.5 && done >= 539) { stroke(5, C.exhaust); line(pvx(10), pvy(P4), pvx(10), pvy(st.p)); }
      if (done >= 360.5) { stroke(5, C.hot); line(pvx(1), pvy(P2), pvx(1), pvy(P3)); }
      if (done >= 540.5) { stroke(5, C.exhaust); line(pvx(10), pvy(P4), pvx(10), pvy(1)); }
      dot(pvx(st.V), pvy(st.p), 12, C.ink); dot(pvx(st.V), pvy(st.p), 6, C.paper);
      // point numbers
      const num = (n, V, p, dx, dy, a) => A(a, () => mono(String(n), pvx(V) + dx, pvy(p) + dy, { size: 34, weight: 700, color: C.ink, align: 'center' }));
      num(1, 10, 1, 26, -14, seg(done, 175, 180));
      num(2, 1, P2, 30, 14, seg(done, 355, 360));
      num(3, 1, P3, 30, 10, seg(t, e('p5', -0.6), e('p5')));
      num(4, 10, P4, 26, -32, seg(done, 535, 540));
    });
    // a legend, filled in as each process is narrated; the current one is lit
    const items = [['0–1', 'INTAKE', C.air, 'p3'], ['1–2', 'COMPRESSION', C.warm, 'p4'], ['2–3', 'COMBUSTION', C.hot, 'p5'], ['3–4', 'POWER', C.flame, 'p6'], ['4–1', 'VALVE OPENS', C.exhaust, 'p7'], ['1–0', 'EXHAUST', C.exhaust, 'p8']];
    let nowK = null; for (const it of items) if (t >= s(it[3], 0.1)) nowK = it[3];
    items.forEach(([nums, name, col, kk], i) => A(seg(t, s(kk, 0.1), s(kk, 0.6)), () => {
      const y = 360 + i * 58, on = nowK === kk && t < s('p9');
      k.rrect(1430, y - 32, 350, 48, 8); ctx.fillStyle = on ? rgba(col, 0.9) : 'rgba(234,242,248,0.06)'; ctx.fill();
      mono(nums, 1446, y + 2, { size: 32, weight: 700, color: on ? C.paper : col });
      label(name, 1560, y + 2, { size: 32, weight: 500, color: on ? C.paper : C.soft });
    }));
  }
}

// =====================================================================================================
// 5 Squeeze harder: the efficiency curve, then knock
// =====================================================================================================
const EF = { x0: 1080, y0: 860, w: 680, h: 440, rmax: 20, emax: 0.8 };
const efx = (r) => EF.x0 + ((r - 1) / (EF.rmax - 1)) * EF.w;
const efy = (v) => EF.y0 - (v / EF.emax) * EF.h;
function formula(x, y, size, col = C.ink) {
  // η = 1 − r^(1−γ), with the exponent raised
  font(600, size, MONO); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const a = 'η = 1 − r'; ctx.fillText(a, x, y);
  const w = ctx.measureText(a).width;
  font(600, size * 0.62, MONO); ctx.fillText('1 − γ', x + w + 4, y - size * 0.45);
}
function partSqueeze(t, th) {
  const c = cyc(th);
  // the ratio, measured on the drawing
  A(span(t, s('c1', 0.3), s('c2', 0.4), 0.5, 0.5), () => {
    label('COMPRESSION RATIO', 1000, 330, { size: 40, color: C.dim, weight: 500, spacing: '3px' });
    label('LARGEST VOLUME ÷ SMALLEST', 1000, 400, { size: 52, weight: 500 });
    A(seg(t, mid('c1', 0.6), e('c1')), () => mono(`IN THIS DRAWING: ${RATIO.toFixed(1)} : 1`, 1000, 500, { size: 44, weight: 700, color: C.ink }));
  });
  A(span(t, s('c1', 0.2), s('c2', 0.4), 0.4, 0.5) * engineAlpha(t), () => {
    const x = CX + BORE / 2 + WALL + 22, cy = crownY(th);
    stroke(2.4, C.dim); line(x, ROOF, x + 30, ROOF); line(x, cy, x + 30, cy); line(x + 15, ROOF + 2, x + 15, cy - 2);
    const big = cy - ROOF > 100;
    label(big ? 'V MAX' : 'V MIN', x + 44, (ROOF + cy) / 2 + 12, { size: 34, color: C.dim, weight: 600 });
  });
  // the curve
  const chartA = span(t, s('c2', 0.2), s('c9', 0.2), 0.6, 0.6);
  A(chartA, () => {
    A(seg(t, s('c3', 0.1), s('c3', 0.7)), () => { formula(1000, 300, 64); mono('γ = 1.4 FOR AIR', 1500, 296, { size: 34, color: C.dim }); });
    axes(EF.x0, EF.y0, EF.w, EF.h);
    for (const v of [0.2, 0.4, 0.6]) { stroke(1.4, C.ghost); line(EF.x0, efy(v), EF.x0 + EF.w, efy(v)); mono(`${v * 100}%`, EF.x0 - 14, efy(v) + 11, { align: 'right', color: C.faint }); }
    for (const r of [1, 5, 10, 15, 20]) mono(`${r}`, efx(r), EF.y0 + 42, { align: 'center', color: C.faint });
    label('COMPRESSION RATIO', EF.x0 + EF.w, EF.y0 + 92, { size: 32, align: 'right', color: C.soft });
    label('IDEAL EFFICIENCY', EF.x0 + 16, EF.y0 - EF.h + 4, { size: 32, color: C.soft });
    A(seg(t, s('c8', 0.3), s('c8', 1.0)), () => {
      ctx.fillStyle = rgba(C.dim, 0.16); ctx.fillRect(efx(8), EF.y0 - EF.h, efx(12) - efx(8), EF.h);
      label('MOST PETROL CARS', (efx(8) + efx(12)) / 2, EF.y0 - EF.h + 40, { size: 32, align: 'center', color: C.dim });
    });
    stroke(5, C.ink); plot((r) => [efx(r), efy(eta(r))], 1, 20, 120, eout(seg(t, s('c2', 0.3), e('c2'))));
    const pt = (r, key, d, dx, dy, align) => A(seg(t, s(key, d), s(key, d + 0.4)), () => {
      dot(efx(r), efy(eta(r)), 11, C.flame);
      chip(`${r} : 1  ${pct(eta(r))}`, efx(r) + dx, efy(eta(r)) + dy, { bg: C.flame, size: 32, align });
    });
    pt(4, 'c4', 0.4, 22, 44, 'left'); pt(10, 'c5', 0.2, 0, 60, 'center'); pt(16, 'c5', 1.6, 0, 60, 'center');
    A(seg(t, s('c6', 0.3), s('c6', 1.0)), () => {
      ctx.setLineDash([12, 9]); stroke(3, C.line); line(EF.x0, efy(0.3), EF.x0 + EF.w, efy(0.3)); ctx.setLineDash([]);
      label('A REAL PETROL ENGINE ≈ 30%', efx(10.6), efy(0.3) + 46, { size: 32, color: C.line });
    });
    A(seg(t, s('c7', 0.3), s('c7', 1.0)), () => {
      const ay = efy(0.07);
      stroke(4, C.dim); ctx.beginPath(); ctx.moveTo(efx(4), ay); ctx.lineTo(efx(13), ay); ctx.stroke();
      ctx.fillStyle = C.dim; ctx.beginPath(); ctx.moveTo(efx(13) + 18, ay); ctx.lineTo(efx(13), ay - 10); ctx.lineTo(efx(13), ay + 10); ctx.closePath(); ctx.fill();
      label('SQUEEZE HARDER: MORE WORK', efx(4), ay - 18, { size: 32, color: C.dim });
    });
  });
  // knock: the chamber seen from above, and its pressure
  const kA = span(t, s('c9', 0.2), at(6) + 1.0, 0.6, 0.6);
  if (kA <= 0) return;
  A(kA, () => {
    const ox = 1190, oy = 560, rr = 230;
    label('THE CHAMBER, SEEN FROM ABOVE · DIAGRAM', 1000, 232, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    // heat of compression (c9), normal flame (c10), knock (c11–c12)
    const heat = seg(t, s('c9', 0.3), e('c9'));
    const normal = t < s('c11');
    const fp = normal ? eio(seg(t, s('c10', 0.4), e('c10', -0.2))) : 0.62 * eio(seg(t, s('c11', 0.3), mid('c11', 0.55)));
    ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, rr, 0, TAU); ctx.clip();
    ctx.fillStyle = mix(C.airDeep, C.warm, 0.25 + 0.55 * heat); ctx.globalAlpha = 0.65; ctx.fillRect(ox - rr, oy - rr, 2 * rr, 2 * rr); ctx.globalAlpha = 1;
    if (!normal) { // the end gas ahead of the flame heats further
      const g = ctx.createRadialGradient(ox, oy, rr * 0.5, ox, oy, rr);
      g.addColorStop(0, rgba(C.warm, 0)); g.addColorStop(1, rgba('#FF8A3A', 0.7 * seg(t, s('c11', 0.6), mid('c11', 0.6))));
      ctx.fillStyle = g; ctx.fillRect(ox - rr, oy - rr, 2 * rr, 2 * rr);
    }
    if (fp > 0) {
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr * 1.05 * fp);
      g.addColorStop(0, rgba(C.white, 0.95)); g.addColorStop(0.5, rgba(C.flame, 0.9)); g.addColorStop(1, rgba(C.hot, 0.8));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, rr * 1.05 * fp, 0, TAU); ctx.fill();
      if (fp < 1) { stroke(4, C.white); ctx.beginPath(); ctx.arc(ox, oy, rr * 1.05 * fp, 0, TAU); ctx.stroke(); }
    }
    // pockets ahead of the flame explode all at once
    if (!normal) {
      const r0 = rng(5);
      for (let i = 0; i < 6; i++) {
        const q = r0() * TAU, d = rr * (0.78 + 0.14 * r0()), when = mid('c11', 0.6) + r0() * 0.5;
        const p = seg(t, when, when + 0.35), x = ox + Math.cos(q) * d, y = oy + Math.sin(q) * d;
        if (p <= 0) continue;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 20 + 70 * p);
        g.addColorStop(0, rgba(C.white, 1)); g.addColorStop(0.5, rgba(C.hot, 0.9)); g.addColorStop(1, rgba(C.hot, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 20 + 70 * p, 0, TAU); ctx.fill();
        stroke(3, rgba(C.white, 1 - p)); for (let j = 0; j < 8; j++) { const a = (j / 8) * TAU; line(x + Math.cos(a) * (24 + 40 * p), y + Math.sin(a) * (24 + 40 * p), x + Math.cos(a) * (40 + 60 * p), y + Math.sin(a) * (40 + 60 * p)); }
      }
    }
    ctx.restore();
    stroke(4, C.steelLight); ctx.beginPath(); ctx.arc(ox, oy, rr, 0, TAU); ctx.stroke();
    for (const [vx, vy, col] of [[-90, -95, C.air], [90, -95, C.exhaust], [-90, 95, C.air], [90, 95, C.exhaust]]) { stroke(3, col); ctx.beginPath(); ctx.arc(ox + vx, oy + vy, 52, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(ox, oy, 16, 0, TAU); ctx.fillStyle = C.steelHi; ctx.fill();
    A(span(t, s('c10', 0.4), s('c11', 0.2), 0.4, 0.3), () => chip('FLAME FRONT', ox, oy + rr + 56, { align: 'center', bg: C.flame, size: 32 }));
    A(seg(t, mid('c11', 0.6), mid('c11', 0.9)), () => chip('POCKETS EXPLODE AHEAD OF IT', ox, oy + rr + 56, { align: 'center', bg: C.hot, size: 32 }));
    // pressure traces
    A(seg(t, s('c12', 0.1), s('c12', 0.7)), () => {
      const x0 = 1480, y0 = 760, w = 330, h = 340;
      axes(x0, y0, w, h);
      label('PRESSURE', x0 + 10, y0 - h - 4, { size: 32, color: C.soft });
      label('CRANK ANGLE', x0 + w, y0 + 46, { size: 32, color: C.soft, align: 'right' });
      const bump = (u) => Math.exp(-((u - 0.45) ** 2) / 0.02);
      stroke(3, C.line); plot((u) => [x0 + u * w, y0 - bump(u) * h * 0.6], 0, 1, 80);
      stroke(3, C.hot); plot((u) => [x0 + u * w, y0 - (bump(u) * 0.66 + (u > 0.42 ? 0.32 * Math.exp(-(u - 0.42) * 9) * Math.sin((u - 0.42) * 120) + 0.12 * Math.exp(-(u - 0.42) * 6) : 0)) * h], 0, 1, 260, eout(seg(t, s('c12', 0.3), s('c12', 1.6))));
      label('NORMAL', x0 + w - 4, y0 - h * 0.25, { size: 32, color: C.line, align: 'right' });
      label('KNOCK', x0 + w * 0.62, y0 - h + 20, { size: 32, color: C.hot });
    });
    A(span(t, s('c13', 0.2), s('c14', 0.3), 0.5, 0.5), () => chip('OCTANE RATING = RESISTANCE TO SELF-IGNITION', 1000, 930, { bg: C.dim, size: 32 }));
  });
  // a knock sensor on the block
  A(span(t, s('c14', 0.2), at(6) + 1, 0.5, 0.5) * engineAlpha(t), () => {
    const x = CX - BORE / 2 - WALL - 30, y = 470;
    k.rrect(x - 24, y - 24, 48, 48, 8); ctx.fillStyle = C.steelMid; ctx.fill(); stroke(2, C.steelHi); ctx.stroke();
    stroke(2.4, C.dim); for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(x, y, 30 + i * 16, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke(); }
    label('KNOCK SENSOR', x - 20, y + 74, { size: 32, color: C.dim, align: 'center' });
    A(seg(t, s('c14', 0.4), s('c14', 0.9)), () => chip('KNOCK HEARD: FIRE THE SPARK LATER', 1000, 930, { bg: C.dim, size: 32 }));
  });
}

// =====================================================================================================
// 6 Timing
// =====================================================================================================
const VT = { x0: 1040, y0: 800, w: 760, h: 300 };
const vtx = (c) => VT.x0 + ((c - 360) / 720) * VT.w;
function partTiming(t, th) {
  const c = cyc(th);
  // A: the spark comes early
  const sA = span(t, s('v1', 0.2), s('v5', 0.3), 0.6, 0.6);
  A(sA, () => {
    const ox = 1190, oy = 600, r = 220, adv = advance(t) || 10;
    label('WHEN THE SPARK FIRES', 1000, 232, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    stroke(2.4, C.soft); ctx.beginPath(); ctx.arc(ox, oy, r, 0, TAU); ctx.stroke();
    for (let i = 0; i < 36; i++) { const q = -Math.PI / 2 + (i * TAU) / 36; line(ox + Math.cos(q) * (r - (i % 9 ? 10 : 22)), oy + Math.sin(q) * (r - (i % 9 ? 10 : 22)), ox + Math.cos(q) * r, oy + Math.sin(q) * r); }
    label('TDC', ox, oy - r - 22, { size: 34, align: 'center', color: C.dim, weight: 600 });
    // the possible range, 10 to 40 degrees before TDC
    A(seg(t, s('v2', 0.4), s('v2', 1.2)), () => {
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, r - 26, -Math.PI / 2 - 40 * DEG, -Math.PI / 2 - 10 * DEG); ctx.closePath();
      ctx.fillStyle = rgba(C.flame, 0.22); ctx.fill();
      label('SPARK RANGE', 1470, 420, { size: 32, color: C.soft, weight: 400 });
      label('10°–40° BEFORE TDC', 1470, 466, { size: 36, color: C.flame, weight: 500 });
    });
    // the spark itself
    const q = -Math.PI / 2 - adv * DEG;
    stroke(5, C.flame); line(ox + Math.cos(q) * 70, oy + Math.sin(q) * 70, ox + Math.cos(q) * (r - 4), oy + Math.sin(q) * (r - 4));
    dot(ox + Math.cos(q) * (r + 16), oy + Math.sin(q) * (r + 16), 10, C.flame);
    // the peak pressure, just after the top
    A(seg(t, s('v3', 0.4), s('v3', 1.0)), () => {
      const qp = -Math.PI / 2 + 15 * DEG;
      stroke(5, C.hot); line(ox + Math.cos(qp) * 70, oy + Math.sin(qp) * 70, ox + Math.cos(qp) * (r - 4), oy + Math.sin(qp) * (r - 4));
      label('PEAK PRESSURE', 1470, 560, { size: 32, color: C.soft, weight: 400 });
      label('JUST AFTER TDC', 1470, 606, { size: 36, color: C.hot, weight: 500 });
    });
    // the crank, turning
    const qa = -Math.PI / 2 + (th % 360) * DEG;
    stroke(4, C.ink); line(ox, oy, ox + Math.cos(qa) * (r - 40), oy + Math.sin(qa) * (r - 40)); dot(ox, oy, 12, C.ink);
    mono(`SPARK: ${Math.round(adv)}° BEFORE TDC`, 1000, 900, { size: 40, weight: 700, color: C.flame });
    A(seg(t, s('v4', 0.2), s('v4', 0.8)), () => { label('HIGHER REVS', 1470, 700, { size: 32, color: C.soft, weight: 400 }); label('EARLIER SPARK', 1470, 746, { size: 36, color: C.dim, weight: 500 }); });
  });
  // B: valve lift against crank angle, from the firing TDC round to the next
  const vA = span(t, s('v5', 0.2), at(7) + 1.0, 0.6, 0.6);
  A(vA, () => {
    const va = valveAngles(t);
    label('VALVE OPENINGS · DIAGRAM, ILLUSTRATIVE ANGLES', 1000, 232, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    axes(VT.x0, VT.y0, VT.w, VT.h + 30);
    label('LIFT', VT.x0 + 12, VT.y0 - VT.h - 30, { size: 32, color: C.soft });
    const ticks = [[360, 'TDC'], [540, 'BDC'], [720, 'TDC'], [900, 'BDC'], [1080, 'TDC']];
    for (const [cc, l] of ticks) { stroke(1.6, C.ghost); line(vtx(cc), VT.y0, vtx(cc), VT.y0 - VT.h - 10); mono(l, vtx(cc), VT.y0 + 42, { align: 'center', size: 32, color: C.faint }); }
    ['POWER', 'EXHAUST', 'INTAKE', 'COMPRESSION'].forEach((n, i) => label(n, vtx(360 + i * 180 + 90), VT.y0 + 96, { size: 32, align: 'center', color: [C.hot, C.exhaust, C.air, C.warm][i] }));
    const ly = (l) => VT.y0 - l * VT.h;
    // overlap: both open
    ctx.beginPath();
    for (let cc = 640; cc <= 800; cc += 1) { const l = Math.min(inLift(cc % 720, va), exLift(cc % 720, va)); cc === 640 ? ctx.moveTo(vtx(cc), ly(l)) : ctx.lineTo(vtx(cc), ly(l)); }
    ctx.lineTo(vtx(800), VT.y0); ctx.lineTo(vtx(640), VT.y0); ctx.closePath(); ctx.fillStyle = rgba(C.dim, 0.55); ctx.fill();
    stroke(5, C.exhaust); plot((cc) => [vtx(cc), ly(exLift(cc % 720, va))], 360, 1080, 240);
    stroke(5, C.air); plot((cc) => [vtx(cc), ly(inLift(cc % 720, va))], 360, 1080, 240);
    const cur = c < 360 ? c + 720 : c;
    stroke(2.4, C.ink); line(vtx(cur), VT.y0, vtx(cur), VT.y0 - VT.h - 10); dot(vtx(cur), VT.y0 - VT.h - 16, 7, C.ink);
    A(seg(t, s('v5', 0.8), s('v5', 1.6)) * (1 - seg(t, s('v9', 0), s('v9', 0.5))), () => {
      mono('EXHAUST OPENS EARLY', vtx(va.eo) - 10, VT.y0 - VT.h - 100, { size: 32, color: C.exhaust, align: 'left' });
      mono('INTAKE CLOSES LATE', vtx(va.ic + 720) + 6, VT.y0 - VT.h - 50, { size: 32, color: C.air, align: 'right' });
    });
    A(seg(t, s('v6', 0.4), s('v6', 1.2)), () => chip('OVERLAP: BOTH OPEN', vtx(720), VT.y0 - 120, { align: 'center', size: 32 }));
    A(span(t, s('v9', 0.2), at(7) + 1, 0.4, 0.4), () => label('RACING: MORE OVERLAP · ROAD: LESS', 1000, 320, { size: 34, color: C.ink }));
    A(span(t, s('v10', 0.2), at(7) + 1, 0.4, 0.4), () => label('VARIABLE VALVE TIMING SHIFTS THE CAM', 1000, 372, { size: 34, color: C.dim }));
  });
  // the overlap, at the head
  A(span(t, s('v6', 0.4), e('v8', 0.5), 0.5, 0.5) * engineAlpha(t), () => chip('BOTH VALVES OPEN', CX + 330, 330, { size: 32 }));
}

// =====================================================================================================
// 7 More cylinders: an inline four, and the gas torque of 1, 4 and 6 cylinders
// =====================================================================================================
const ORDER = [1, 3, 4, 2];
const PHASE = { 1: 0, 3: 180, 4: 360, 2: 540 };   // firing order 1-3-4-2: each fires 180° after the last
function miniCylinder(x, th, n, flashOn) {
  const r = 46, l = 156, cyy = 800, bore = 120, poff = 30, ph = 54, clear = (2 * r) / 9;
  const c = cyc(th - PHASE[n]);
  const pin = cyy + pinYat(th - PHASE[n], r, l), crown = pin - poff;
  const tdc = cyy - (r + l) - poff, roof = tdc - clear;
  // gas
  const [col, a] = gasColour(c, 0);
  const burning = c >= 360 && c < 470;
  ctx.fillStyle = burning ? C.flame : col; ctx.globalAlpha = burning ? 0.9 : a + 0.15; ctx.fillRect(x - bore / 2, roof, bore, crown - roof); ctx.globalAlpha = 1;
  // walls and head
  ctx.fillStyle = HATCH; ctx.fillRect(x - bore / 2 - 14, roof - 40, bore + 28, 40); ctx.fillRect(x - bore / 2 - 14, roof, 14, 230); ctx.fillRect(x + bore / 2, roof, 14, 230);
  stroke(2, C.steelLight); ctx.strokeRect(x - bore / 2 - 14, roof - 40, bore + 28, 40); ctx.strokeRect(x - bore / 2 - 14, roof, 14, 230); ctx.strokeRect(x + bore / 2, roof, 14, 230);
  // piston, rod, crank throw
  ctx.fillStyle = steelH(x - bore / 2 + 2, x + bore / 2 - 2); ctx.fillRect(x - bore / 2 + 2, crown, bore - 4, ph); stroke(2, C.steelHi); ctx.strokeRect(x - bore / 2 + 2, crown, bore - 4, ph);
  const q = (th - PHASE[n]) * DEG, px = x + r * Math.sin(q), py = cyy - r * Math.cos(q);
  stroke(14, C.steelMid); line(x, pin, px, py); stroke(2, C.steelHi); dot(x, pin, 9, C.steelHi);
  stroke(16, C.steel); line(x, cyy, px, py); dot(px, py, 12, C.steelLight);
  // spark
  const f = flashOn ? clamp(1 - Math.abs(c - 360) / 14) : 0;
  if (f > 0) { const g = ctx.createRadialGradient(x, roof + 4, 0, x, roof + 4, 60 * f + 6); g.addColorStop(0, `rgba(255,252,230,${f})`); g.addColorStop(1, rgba(C.hot, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, roof + 4, 60 * f + 6, 0, TAU); ctx.fill(); }
  label(String(n), x, roof - 62, { size: 44, weight: 600, align: 'center', color: burning ? C.flame : C.ink });
  return { c, burning };
}
function partCylinders(t, th) {
  const fourA = span(t, s('n2', -0.4), at(8) + 1.2, 0.8, 0.6);
  A(fourA, () => {
    const xs = [210, 380, 550, 720];
    stroke(10, C.steel); line(150, 800, 790, 800);
    let firing = null;
    xs.forEach((x, i) => { const st = miniCylinder(x, th, i + 1, true); if (st.burning) firing = i + 1; });
    label('A STRAIGHT FOUR', 136, 400, { size: 36, color: C.soft, weight: 500, spacing: '2px' });
    A(seg(t, s('n5', 0.2), s('n5', 0.9)), () => {
      label('FIRING ORDER', 150, 930, { size: 34, color: C.soft });
      ORDER.forEach((n, i) => {
        const x = 410 + i * 92, on = firing === n;
        k.rrect(x - 34, 892, 68, 60, 8); ctx.fillStyle = on ? C.flame : 'rgba(234,242,248,0.08)'; ctx.fill();
        label(String(n), x, 936, { size: 40, weight: 600, align: 'center', color: on ? C.paper : C.ink });
      });
    });
  });
  // the spacing rule
  A(span(t, s('n3', 0.1), s('n6', 0.2), 0.5, 0.5), () => {
    label('EVEN SPACING', 1000, 330, { size: 40, color: C.dim, weight: 500, spacing: '3px' });
    mono('720° ÷ CYLINDERS', 1000, 430, { size: 64, weight: 700 });
    A(seg(t, s('n4', 0.2), s('n4', 0.8)), () => mono('720° ÷ 4 = 180°', 1000, 540, { size: 64, weight: 700, color: C.flame }));
    A(seg(t, s('n4', 1.4), s('n4', 2.0)), () => label('A PUSH EVERY HALF TURN', 1004, 610, { size: 40, color: C.soft, weight: 400 }));
  });
  // torque rows
  const rows = [['1 CYLINDER', 1, 'n7'], ['4 CYLINDERS · EVERY 180°', 4, 'n8'], ['6 CYLINDERS · EVERY 120°', 6, 'n9']];
  const tA = span(t, s('n6', 0.2), at(8) + 1.0, 0.6, 0.6);
  A(tA, () => {
    label('TWISTING FORCE FROM THE GAS · IDEALISED', 1000, 232, { size: 34, color: C.soft, weight: 500, spacing: '2px' });
    const scale = 120 / TMAX, cc = cyc(th);
    rows.forEach(([name, n, key], i) => {
      const ra = seg(t, s(key, 0.1), s(key, 0.7));
      if (ra <= 0) return;
      A(ra, () => {
        const y0 = 440 + i * 210, x0 = 1010, w = 790;
        label(name, x0, y0 - 150, { size: 32, color: C.ink, weight: 500 });
        stroke(1.6, C.ghost); line(x0, y0, x0 + w, y0);
        ctx.beginPath();
        for (let a = 0; a <= 720; a += 2) { const v = torqueN(n, a) * scale; a ? ctx.lineTo(x0 + (a / 720) * w, y0 - v) : ctx.moveTo(x0, y0 - v); }
        ctx.lineTo(x0 + w, y0); ctx.lineTo(x0, y0); ctx.closePath(); ctx.fillStyle = rgba(C.flame, 0.22); ctx.fill();
        stroke(3.5, C.flame);
        ctx.beginPath(); for (let a = 0; a <= 720; a += 2) { const v = torqueN(n, a) * scale; a ? ctx.lineTo(x0 + (a / 720) * w, y0 - v) : ctx.moveTo(x0, y0 - v); } ctx.stroke();
        const v = torqueN(n, cc) * scale; dot(x0 + (cc / 720) * w, y0 - v, 8, C.ink);
      });
    });
  });
  A(span(t, s('n10', 0.2), at(8) + 1, 0.5, 0.5), () => chip('EVEN SPACING: LESS VIBRATION', 1000, 955, { bg: C.dim, size: 32 }));
}

// =====================================================================================================
// 8 The diesel
// =====================================================================================================
function partDiesel(t, th) {
  const cols = [1000, 1330, 1590];
  const rows = [
    ['LIT BY', 'SPARK', 'HOT AIR', 'd1', 'd4'],
    ['SQUEEZES', 'AIR + FUEL', 'AIR ONLY', 'd2', 'd2'],
    ['RATIO', '8–12 : 1', '15–23 : 1', 'd2', 'd2'],
    ['BEST EFFICIENCY', '≈ 30%', 'SHIPS: 55%', 'd6', 'd6'],
    ['POWER SET BY', 'THROTTLE', 'FUEL DOSE', 'd7', 'd7'],
  ];
  A(seg(t, s('d1', 0.2), s('d1', 0.9)), () => {
    label('PETROL', cols[1], 270, { size: 40, weight: 600, color: C.flame, spacing: '3px' });
    label('DIESEL', cols[2], 270, { size: 40, weight: 600, color: C.air, spacing: '3px' });
    stroke(2, C.ghost); line(1000, 296, 1820, 296);
    rows.forEach(([name, pv, dv, kp, kd], i) => {
      const y = 360 + i * 82;
      const ap = seg(t, s(kp, i === 2 ? 1.6 : 0.3), s(kp, i === 2 ? 2.2 : 0.9)), ad = seg(t, s(kd, i === 0 ? 0.6 : i === 2 ? 2.4 : 1.0), s(kd, i === 0 ? 1.2 : i === 2 ? 3.0 : 1.6));
      A(ap, () => { label(name, cols[0], y, { size: 32, color: C.soft, weight: 400 }); label(pv, cols[1], y, { size: 36, weight: 500 }); });
      A(ad, () => label(dv, cols[2], y, { size: 36, weight: 600, color: C.air }));
      A(ap, () => { stroke(1.4, C.ghost); line(1000, y + 26, 1820, y + 26); });
    });
  });
  // the squeeze heats the air: ideal values, from 20 °C
  A(span(t, s('d3', 0.2), s('d8', 0.2), 0.5, 0.5), () => {
    label('IDEAL SQUEEZE FROM 20 °C, NO HEAT LOSS', 1000, 820, { size: 32, color: C.soft, weight: 400 });
    mono(`10 : 1 → ${tempC(10)} °C`, 1000, 880, { size: 40, weight: 700, color: C.warm });
    mono(`20 : 1 → ${tempC(20)} °C`, 1420, 880, { size: 40, weight: 700, color: '#FF8A3A' });
  });
  A(span(t, s('d8', 0.2), at(9) + 1, 0.5, 0.5), () => {
    chip('1893 · FIRST PROTOTYPE FIRES', 1000, 840, { bg: C.line, size: 32 });
    A(seg(t, mid('d8', 0.45), mid('d8', 0.6)), () => chip('1897 · THIRD PROTOTYPE · 26% EFFICIENT', 1000, 910, { bg: C.air, size: 32 }));
  });
  A(span(t, s('d1', 0.2), at(9) + 1.4, 0.5, 0.5) * engineAlpha(t), () => {
    label('DIESEL: NO SPARK PLUG', CX + 120, 104, { size: 32, color: C.air, weight: 500 });
    A(seg(t, s('d4', 0.1), s('d4', 0.6)), () => label('FUEL INJECTOR', CX + 120, 184, { size: 32, color: C.fuel, weight: 500 }));
  });
}

// =====================================================================================================
// 9 Two turns, one push
// =====================================================================================================
function partRecap(t, th) {
  const c = cyc(th);
  A(seg(t, s('z1', 0.1), s('z1', 0.7)), () => label('THE WHOLE IDEA', 1000, 200, { size: 40, color: C.dim, weight: 500, spacing: '4px' }));
  A(seg(t, s('z2', 0.1), s('z2', 0.7)), () => {
    STROKES.forEach(([name, , col], i) => {
      const x = 1000 + i * 205, y = 300, live = strokeIdx(c) === i;
      k.rrect(x, y - 44, 190, 88, 10); ctx.fillStyle = rgba(col, live ? 0.95 : 0.18); ctx.fill();
      label(name, x + 95, y + 2, { size: 32, align: 'center', base: 'middle', weight: 600, color: live ? C.paper : C.soft, spacing: '1px' });
    });
    mono('720° = 2 TURNS = 1 PUSH', 1000, 410, { size: 44, weight: 700 });
  });
  A(seg(t, s('z3', 0.2), s('z3', 0.8)), () => {
    formula(1000, 530, 52);
    label('SQUEEZE HARDER FOR MORE WORK, UNTIL IT KNOCKS', 1000, 590, { size: 34, color: C.dim });
  });
  A(seg(t, s('z4', 0.2), s('z4', 0.8)), () => {
    chip('1862 · PATENTED', 1000, 690, { bg: C.line, size: 34 });
    A(seg(t, mid('z4', 0.6), mid('z4', 0.8)), () => chip('1876 · BUILT BY OTTO', 1330, 690, { bg: C.flame, size: 34 }));
  });
  A(seg(t, s('z5', 0.1), s('z5', 0.7)), () => label('STILL THE CYCLE INSIDE MOST CAR ENGINES', 1000, 790, { size: 36, color: C.ink }));
  A(seg(t, s('z6', 0.1), s('z6', 0.7)), () => mono('3,000 RPM → 25 PUSHES A SECOND', 1000, 890, { size: 44, weight: 700, color: C.flame }));
}

// =====================================================================================================
// Credits
// =====================================================================================================
const MUSIC = ['“Beauty Flow” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Limit 70” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
function credits(t) {
  const a = seg(t, e('z6', 0.8), e('z6', 2.0));
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = 'rgba(5,11,19,0.94)'; ctx.fillRect(0, 0, W, H);
    const bx = 210, by = 110, bw = 1500, bh = 820;
    ctx.fillStyle = 'rgba(8,16,26,0.94)'; ctx.fillRect(bx, by, bw, bh);
    stroke(3, C.line); ctx.strokeRect(bx, by, bw, bh); stroke(1.4, rgba(C.line, 0.6)); ctx.strokeRect(bx + 10, by + 10, bw - 20, bh - 20);
    label('THE FOUR-STROKE ENGINE', 960, 236, { size: 88, weight: 600, align: 'center', spacing: '3px' });
    label('TWO TURNS, ONE PUSH', 960, 296, { size: 36, color: C.dim, align: 'center', spacing: '6px', weight: 400 });
    stroke(1.6, rgba(C.line, 0.7)); line(bx + 10, by + bh - 84, bx + bw - 10, by + bh - 84);
    ['RECKON', 'ENGINEERING', 'END OF SET'].forEach((f, i) => { if (i) line(bx + 10 + ((bw - 20) * i) / 3, by + bh - 84, bx + 10 + ((bw - 20) * i) / 3, by + bh - 10); mono(f, bx + 10 + ((bw - 20) * (i + 0.5)) / 3, by + bh - 34, { size: 32, color: C.soft, align: 'center' }); });
    const blocks = [
      ['ANIMATION AND SCRIPT', ['Reckon · original animation']],
      ['MUSIC', MUSIC],
      ['SOURCES', ['Wikipedia: Four-stroke engine, Otto engine, Otto cycle, Nicolaus Otto,', 'Alphonse Beau de Rochas, Compression ratio, Engine knocking,', 'Ignition timing, Valve timing, Firing order, Diesel engine']],
    ];
    let y = 380;
    for (const [h, vals] of blocks) {
      label(h, 960, y, { size: 32, color: C.dim, align: 'center', spacing: '3px', weight: 500 });
      vals.forEach((v, j) => { font(400, 34, DISPLAY); text(v, 960, y + 46 + j * 44, { color: C.ink, align: 'center', spacing: '0.5px' }); });
      y += 46 + vals.length * 44 + 30;
    }
  });
}

// =====================================================================================================
Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: ['Oswald', 'JetBrains Mono'],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const th = theta(t);
    A(seg(t, 0, 1.0), () => engine(th, t, engineAlpha(t)));
    header(t);
    const parts = [partOpen, partMachine, partStrokes, partHistory, partPV, partSqueeze, partTiming, partCylinders, partDiesel, (tt, h) => A(1 - seg(tt, e('z6', 0.6), e('z6', 1.6)), () => partRecap(tt, h))];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 2.8, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.2 : DURATION + 1;
      if (t < a - 0.8 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.8, b, 0.8, 1.0), () => fn(t, th));
    });
    coldTitle(t);
    titleCards(t);
    credits(t);
  },
});
