// Explainer for engineering-four-stroke-engine: intake, compression, power, exhaust, in two turns
// of the crankshaft, for one cylinder of a petrol (spark-ignition) engine.
// Look: a technical blueprint. Navy paper with a faint grid, cyan and white line-work, cut parts
// hatched as in a section drawing, orange-red for combustion. Saira for captions and labels,
// JetBrains Mono for numbers and technical notes.
//
// The machine is computed, not keyframed: the crank angle θ(t) is the only input. The piston crown
// follows real slider-crank geometry, x = r cos θ + √(l² − r² sin² θ) (crank radius r = 72 px, rod
// l = 236 px); the camshaft turns at θ/2 and each cam's shape is drawn from the same lift curve
// that moves its valve, so cam, follower and valve always agree. The gas colour follows the stroke:
// fresh mixture, compressed (warming), burning after the spark, then exhaust. Valve timing is the
// simplified textbook version (open exactly from dead centre to dead centre, no overlap); the spark
// fires at 352°, just before the top of compression. Counters count turns and sparks from θ.
//
// Scene plan (49.5 s). Everything important sits above y = 930; captions are centred at y = 834.
//  A  0.0– 5.4  Hook: the engine runs two quick cycles; counters reach 4 turns, 2 power strokes.
//                "In most car engines, each cylinder burns fuel only once every two turns."
//  B  5.4–14.0  Stopped at top dead centre: the parts are labelled; the crank circle and piston
//               travel are drawn; TDC, BDC and the stroke are marked.
//                "The crank and connecting rod turn up-and-down motion into rotation."
//                "A stroke is one trip of the piston, up or down."
//  C 14.0–35.3  One slow cycle, stroke by stroke, with a cycle dial (it turns at cam speed),
//               a stroke counter and a gas legend.
//                "Intake: the piston moves down and draws in fuel and air."
//                "Compression: both valves shut, and the piston squeezes the mixture."
//                "Power: near the top, a spark lights the mixture."
//                "The burning gas drives the piston down."
//                "Exhaust: the piston rises again and pushes the burnt gas out."
//  D 35.3–44.6  It speeds up and keeps running; counters show 2 turns per power stroke; the cams
//               are tagged ½ × crank speed.
//                "Four strokes take two turns of the crank, and only one pushes."
//                "The camshaft that works the valves turns at half that speed."
//  E 44.6–49.5  Notes: simplified valve timing, diesels have no spark, the source.
//                "Nicolaus Otto's 1876 engine made this cycle a commercial success."
//
// Facts: Wikipedia "Four-stroke engine": the four strokes and what the valves do in each; a stroke
// is the piston's full travel in either direction; the crankshaft completes a full revolution by
// the end of compression; ignition by spark plug in a petrol engine, by the heat of compression in a
// diesel; the spark fires close to TDC at low rpm; the camshaft turns at half the crankshaft's speed;
// most common engine type in cars. Wikipedia "Connecting rod" / "Crankshaft": they convert the
// piston's reciprocating motion into rotation. Wikipedia "Nicolaus Otto": the four-stroke
// compressed-charge engine of autumn 1876, the first commercially successful engine with
// in-cylinder compression. Wikipedia "Valve timing": real valves open early, close late, overlap.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#0C2A4A', line: '#7FE3FF', white: '#EAF6FF', soft: 'rgba(234,246,255,0.72)', faint: 'rgba(234,246,255,0.30)',
  hatch: 'rgba(127,227,255,0.42)',
  fresh: '#43D9AD', squeezed: '#FFD166', burn: '#FF5A36', flame: '#FFB347', exhaust: '#A9B4C2',
};
const TXT = 'Saira', MONO = 'JetBrainsMono';

let k, ctx;
const font = (weight, size, family = TXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.white, ...opts });
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const mix = (a, b, u) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(u)))).join(',')})`;
};
const rgba = (h, a) => `rgba(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')},${a})`;
const smooth = (e0, e1, x) => { const u = clamp((x - e0) / (e1 - e0)); return u * u * (3 - 2 * u); };

// ---------- geometry (px) ----------
const CX = 330, BORE = 200, WALL = 24;
const HEAD_TOP = 230, ROOF = 284, DECK = 316, LINER_END = 548;
const R = 72, ROD = 236, CY = 674, PIN_OFF = 44, PISTON_H = 80;
const IV = CX - 50, EV = CX + 50, VR = 28;            // valve centres and head radius
const CAM_Y = 160, CAM_R0 = 18, LIFT_PX = 16;
const SPARK_AT = 352;                                 // degrees into the cycle
/** Slider-crank: the piston pin sits r cos θ + √(l² − r² sin² θ) above the crank centre. */
const pinY = (th) => CY - (R * Math.cos(th * DEG) + Math.sqrt(ROD * ROD - R * R * Math.sin(th * DEG) ** 2));
const crownY = (th) => pinY(th) - PIN_OFF;
const TDC_Y = crownY(0), BDC_Y = crownY(180);

// ---------- valve lift, from dead centre to dead centre (simplified, no overlap) ----------
const bump = (u) => (u <= 0 || u >= 1 ? 0 : smooth(0, 0.55, Math.sin(Math.PI * u)));
const cyc = (th) => ((th % 720) + 720) % 720;
const inLift = (th) => { const c = cyc(th); return c < 180 ? bump(c / 180) : 0; };
const exLift = (th) => { const c = cyc(th); return c >= 540 ? bump((c - 540) / 180) : 0; };

// ---------- the crank angle over time: cubic Hermite segments, so speed never jumps ----------
// [time, angle, angular speed in °/s]
const KEYS = [
  [0.6, 0, 0], [1.6, 180, 360], [4.4, 1188, 360], [5.4, 1440, 0],          // A: two quick cycles
  [14.3, 1440, 0], [19.3, 1620, 0],                                          // C: intake
  [19.7, 1620, 0], [24.0, 1790, 22], [25.0, 1812, 22], [29.9, 1980, 0],      // compression, spark, power
  [30.3, 1980, 0], [35.2, 2160, 0],                                          // exhaust
  [35.4, 2160, 0], [37.0, 2352, 240], [49.6, 5376, 240],                    // D–E: running
];
function theta(t) {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [t0, p0, v0] = KEYS[i], [t1, p1, v1] = KEYS[i + 1];
    if (t > t1) continue;
    const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * v0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * v1;
  }
  return KEYS.at(-1)[1];
}
const omega = (t) => (theta(t + 0.01) - theta(t - 0.01)) / 0.02;
const T = { A: [0, 5.5], B: [5.4, 14.1], C: [14.0, 35.4], D: [35.3, 49.5] };
const BASE_C = 1440;                                   // the slow cycle starts here; counters restart
const sparks = (th, from) => Math.max(0, Math.floor((th - from - SPARK_AT) / 720) + 1);

const CUES = [
  [0.4, 5.3, 'In most car engines, each cylinder burns fuel only once every #two turns#.'],
  [5.5, 9.7, 'The #crank# and #connecting rod# turn up-and-down motion into rotation.'],
  [9.8, 14.1, 'A #stroke# is one trip of the piston, up or down.'],
  [14.2, 19.4, '~Intake:~ the piston moves down and draws in fuel and air.'],
  [19.6, 23.7, '^Compression:^ both valves shut, and the piston squeezes the mixture.'],
  [23.8, 27.5, '*Power:* near the top, a spark lights the mixture.'],
  [27.6, 30.7, 'The burning gas drives the piston down.'],
  [30.8, 35.3, '=Exhaust:= the piston rises again and pushes the burnt gas out.'],
  [35.4, 40.2, 'Four strokes take #two turns# of the crank, and only one pushes.'],
  [40.3, 44.6, 'The #camshaft# that works the valves turns at #half# that speed.'],
  [44.7, 49.3, 'Nicolaus Otto’s 1876 engine made this cycle a #commercial success#.'],
];

// ---------- paper and hatching, made once ----------
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
function paintPaper() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W * 0.42, H * 0.4, 60, W / 2, H / 2, 820);
  base.addColorStop(0, '#16406B'); base.addColorStop(0.55, '#0E3154'); base.addColorStop(1, '#071C34');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let x = 0; x <= W; x += 24) { g.fillStyle = x % 120 === 0 ? 'rgba(140,205,255,0.13)' : 'rgba(140,205,255,0.06)'; g.fillRect(x, 0, 1, H); }
  for (let y = 0; y <= H; y += 24) { g.fillStyle = y % 120 === 0 ? 'rgba(140,205,255,0.13)' : 'rgba(140,205,255,0.06)'; g.fillRect(0, y, W, 1); }
  const vg = g.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,8,20,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}
let PAPER, HATCH;
function makeHatch() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 10;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(127,227,255,0.07)'; g.fillRect(0, 0, 10, 10);
  g.strokeStyle = C.hatch; g.lineWidth = 1.3;
  g.beginPath(); g.moveTo(-2, 12); g.lineTo(12, -2); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(8, 12); g.lineTo(12, 8); g.stroke();
  return ctx.createPattern(cv, 'repeat');
}

// ---------- drawing the cylinder ----------
const stroke = (w = 2, col = C.line) => { ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
function intakePortPath(mirror = false) {
  const X = (x) => (mirror ? 2 * CX - x : x);
  const v = mirror ? EV : IV;
  ctx.beginPath();
  ctx.moveTo(X(150), 236); ctx.lineTo(X(268), 236);
  ctx.quadraticCurveTo(X(v + VR + 8), 236, X(v + VR), ROOF);
  ctx.lineTo(X(v - VR), ROOF);
  ctx.quadraticCurveTo(X(v - VR - 4), 268, X(234), 268);
  ctx.lineTo(X(150), 268);
  ctx.closePath();
}
function chamberPath() {
  ctx.beginPath();
  ctx.moveTo(CX - BORE / 2, DECK); ctx.lineTo(CX - BORE / 2, ROOF + 16); ctx.lineTo(CX - BORE / 2 + 16, ROOF);
  ctx.lineTo(CX + BORE / 2 - 16, ROOF); ctx.lineTo(CX + BORE / 2, ROOF + 16); ctx.lineTo(CX + BORE / 2, DECK);
  ctx.closePath();
}
/** The gas: the chamber plus the cylinder down to the piston crown. */
function gasPath(th) {
  const cy = crownY(th);
  ctx.beginPath();
  ctx.moveTo(CX - BORE / 2, cy); ctx.lineTo(CX - BORE / 2, ROOF + 16); ctx.lineTo(CX - BORE / 2 + 16, ROOF);
  ctx.lineTo(CX + BORE / 2 - 16, ROOF); ctx.lineTo(CX + BORE / 2, ROOF + 16); ctx.lineTo(CX + BORE / 2, cy);
  ctx.closePath();
}
function gasState(th) {
  const c = cyc(th);
  if (c < 180) return { col: C.fresh, a: lerp(0.12, 0.42, c / 180), amount: c / 180 };
  if (c < SPARK_AT) { const u = (c - 180) / (SPARK_AT - 180); return { col: mix(C.fresh, C.squeezed, Math.pow(u, 1.4)), a: lerp(0.42, 0.62, u), amount: 1 }; }
  if (c < 540) {
    if (c < SPARK_AT + 28) return { col: C.squeezed, a: 0.62, amount: 1 };   // unburnt, outside the flame front
    return { col: mix(C.burn, C.exhaust, seg(c, 470, 560)), a: lerp(0.7, 0.5, seg(c, 380, 540)), amount: 1 };
  }
  const u = (c - 540) / 180;
  return { col: C.exhaust, a: lerp(0.5, 0.1, u), amount: 1 - u };
}
const DOTS = (() => { const r = rng(9); return Array.from({ length: 48 }, (_, i) => ({ u: 0.05 + 0.9 * r(), v: 0.08 + 0.84 * r(), o: r(), i })); })();

function gas(th) {
  const g = gasState(th), c = cyc(th), cy = crownY(th);
  ctx.save(); gasPath(th); ctx.clip();
  ctx.fillStyle = g.col; ctx.globalAlpha = g.a; ctx.fillRect(CX - BORE / 2, ROOF, BORE, cy - ROOF); ctx.globalAlpha = 1;
  // after the spark: a flame front spreads from the plug through the squeezed mixture
  if (c >= SPARK_AT && c < 560) {
    const fp = clamp((c - SPARK_AT) / 28), rad = 10 + fp * 260;
    const heat = (1 - 0.55 * seg(c, 380, 540)) * (1 - seg(c, 470, 560));
    const fl = ctx.createRadialGradient(CX, ROOF + 6, 0, CX, ROOF + 6, rad);
    fl.addColorStop(0, rgba(C.flame, 0.95 * heat)); fl.addColorStop(0.55, rgba(C.burn, 0.85 * heat)); fl.addColorStop(1, rgba(C.burn, fp < 1 ? 0.3 * heat : 0.55 * heat));
    ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(CX, ROOF + 6, rad, 0, TAU); ctx.fill();
    if (fp < 1) { ctx.strokeStyle = rgba(C.flame, 0.9); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(CX, ROOF + 6, rad, 0, TAU); ctx.stroke(); }
  }
  // molecules: they spread out as the piston falls and crowd together as it rises
  for (const d of DOTS) {
    let vis = d.i / DOTS.length < g.amount ? 1 : 0;
    if (c < 180) vis = clamp((g.amount - d.i / DOTS.length) * 12);
    if (c >= 540) vis = clamp((g.amount - d.i / DOTS.length) * 12);
    if (vis <= 0) continue;
    const x = CX - BORE / 2 + 8 + d.u * (BORE - 16), y = ROOF + 6 + d.v * (cy - ROOF - 12);
    const col = c >= SPARK_AT && c < 470 ? C.flame : g.col;
    ctx.globalAlpha = vis * 0.95; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** Particles flowing in through the intake port and out through the exhaust port. */
function portFlow(th) {
  const c = cyc(th);
  const run = (pts, a, col, phase) => {
    if (a <= 0.02) return;
    const lens = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
    for (let j = 0; j < 14; j++) {
      let s = (((j / 14 + phase) % 1) + 1) % 1 * tot, i = 0;
      while (i < lens.length - 1 && s > lens[i]) { s -= lens[i]; i++; }
      const u = clamp(s / lens[i]);
      const x = lerp(pts[i][0], pts[i + 1][0], u), y = lerp(pts[i][1], pts[i + 1][1], u) + ((j * 7) % 5 - 2) * 2.4;
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  run([[112, 252], [236, 252], [IV - 8, 270], [IV - 8, ROOF + 18]], inLift(th), C.fresh, c / 180 * 1.6);
  run([[EV + 8, ROOF + 18], [EV + 8, 270], [2 * CX - 236, 252], [2 * CX - 112, 252]], exLift(th), C.exhaust, (c - 540) / 180 * 1.6);
}

function valve(x, lift) {
  const y = ROOF + lift * LIFT_PX;
  // stem
  stroke(5, C.white); ctx.beginPath(); ctx.moveTo(x, CAM_Y + CAM_R0 + lift * LIFT_PX + 12); ctx.lineTo(x, y - 6); ctx.stroke();
  // head
  ctx.beginPath(); ctx.moveTo(x - 4, y - 10); ctx.lineTo(x + 4, y - 10); ctx.lineTo(x + VR, y - 2); ctx.lineTo(x + VR, y + 1); ctx.lineTo(x - VR, y + 1); ctx.lineTo(x - VR, y - 2); ctx.closePath();
  ctx.fillStyle = '#123B63'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  // spring between the head top and the bucket
  const top = CAM_Y + CAM_R0 + lift * LIFT_PX + 14, bot = HEAD_TOP, n = 6;
  stroke(1.8, C.line);
  ctx.beginPath();
  for (let i = 0; i <= n * 2; i++) { const yy = lerp(top, bot, i / (n * 2)); ctx.lineTo(x + (i % 2 ? 12 : -12), yy); }
  ctx.stroke();
  // bucket follower
  const by = CAM_Y + CAM_R0 + lift * LIFT_PX;
  ctx.fillStyle = '#123B63'; ctx.fillRect(x - 15, by, 30, 13); stroke(2, C.white); ctx.strokeRect(x - 15, by, 30, 13);
}

/** A cam whose outline is drawn from the lift curve it produces at the follower below it. */
function cam(x, liftFn, th) {
  const phi = th / 2;                      // the camshaft turns at half the crank's speed
  ctx.save(); ctx.translate(x, CAM_Y);
  ctx.beginPath();
  for (let a = 0; a <= 360; a += 3) {
    const ang = a * DEG;
    // the cam point at body angle a faces straight down (canvas 90°) when a + θ/2 ≡ 90°, i.e. at
    // crank angle 2(90° − a) mod 720: give it the radius that makes the lift the valve needs then
    const thAt = 2 * ((((90 - a) % 360) + 360) % 360);
    const r = CAM_R0 + LIFT_PX * liftFn(thAt);
    const X = r * Math.cos(ang + phi * DEG), Y = r * Math.sin(ang + phi * DEG);
    a === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
  }
  ctx.closePath(); ctx.fillStyle = 'rgba(127,227,255,0.12)'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); stroke(2, C.line); ctx.stroke();
  // a key mark so the turning is visible
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7 * Math.cos(phi * DEG), 7 * Math.sin(phi * DEG)); stroke(2, C.line); ctx.stroke();
  ctx.restore();
}

function sparkPlug(th, t) {
  // terminal, insulator, hex, body
  ctx.fillStyle = '#123B63';
  ctx.fillRect(CX - 4, 182, 8, 8); stroke(1.8, C.white); ctx.strokeRect(CX - 4, 182, 8, 8);
  k.rrect(CX - 8, 190, 16, 36, 4); ctx.fillStyle = 'rgba(234,246,255,0.85)'; ctx.fill();
  stroke(1.5, C.white); for (const y of [198, 206, 214]) { ctx.beginPath(); ctx.moveTo(CX - 8, y); ctx.lineTo(CX + 8, y); ctx.strokeStyle = 'rgba(12,42,74,0.6)'; ctx.stroke(); }
  ctx.fillStyle = '#123B63'; ctx.fillRect(CX - 13, 226, 26, 14); stroke(2, C.white); ctx.strokeRect(CX - 13, 226, 26, 14);
  ctx.fillRect(CX - 8, 240, 16, ROOF - 240); ctx.strokeRect(CX - 8, 240, 16, ROOF - 240);
  for (let y = 246; y < ROOF; y += 6) { ctx.beginPath(); ctx.moveTo(CX - 8, y); ctx.lineTo(CX + 8, y + 3); stroke(1, C.line); ctx.stroke(); }
  stroke(2.5, C.white); ctx.beginPath(); ctx.moveTo(CX, ROOF); ctx.lineTo(CX, ROOF + 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX - 7, ROOF); ctx.lineTo(CX - 7, ROOF + 10); ctx.lineTo(CX - 1, ROOF + 10); ctx.stroke();
  // the spark: a short flash around 352°, widened when the engine runs fast so it shows on screen
  const c = cyc(th), w = Math.max(6, Math.abs(omega(t)) * 0.07);
  const d = Math.abs(c - SPARK_AT);
  const f = clamp(1 - d / w);
  if (f > 0) {
    const gl = ctx.createRadialGradient(CX, ROOF + 8, 0, CX, ROOF + 8, 60 * f + 10);
    gl.addColorStop(0, `rgba(255,250,220,${f})`); gl.addColorStop(0.4, rgba(C.flame, 0.7 * f)); gl.addColorStop(1, rgba(C.burn, 0));
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(CX, ROOF + 8, 60 * f + 10, 0, TAU); ctx.fill();
    stroke(2.5, `rgba(255,255,240,${f})`);
    ctx.beginPath(); ctx.moveTo(CX - 1, ROOF + 6); ctx.lineTo(CX + 4, ROOF + 8); ctx.lineTo(CX - 3, ROOF + 9); ctx.lineTo(CX + 2, ROOF + 11); ctx.stroke();
  }
}

function piston(th) {
  const cy = crownY(th), x0 = CX - BORE / 2 + 4, w = BORE - 8, py = pinY(th);
  ctx.save();
  // crown and skirt walls: cut metal, hatched
  ctx.beginPath(); ctx.rect(x0, cy, w, 24); ctx.rect(x0, cy + 24, 10, PISTON_H - 24); ctx.rect(x0 + w - 10, cy + 24, 10, PISTON_H - 24);
  ctx.fillStyle = HATCH; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x0, cy + PISTON_H); ctx.lineTo(x0, cy); ctx.lineTo(x0 + w, cy); ctx.lineTo(x0 + w, cy + PISTON_H);
  stroke(2.4, C.white); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0 + 10, cy + PISTON_H); ctx.lineTo(x0 + 10, cy + 24); ctx.lineTo(x0 + w - 10, cy + 24); ctx.lineTo(x0 + w - 10, cy + PISTON_H); stroke(1.6, C.line); ctx.stroke();
  // ring grooves
  for (const dy of [6, 12, 18]) { stroke(2, C.paper); ctx.beginPath(); ctx.moveTo(x0 - 1, cy + dy); ctx.lineTo(x0 + 7, cy + dy); ctx.moveTo(x0 + w - 7, cy + dy); ctx.lineTo(x0 + w + 1, cy + dy); ctx.stroke(); }
  ctx.restore();
  void py;
}

function rodAndCrank(th) {
  const a = th * DEG, px = CX + R * Math.sin(a), py = CY - R * Math.cos(a), sy = pinY(th);
  // counterweight and web
  ctx.save(); ctx.translate(CX, CY); ctx.rotate(a);
  const weight = new Path2D();
  weight.arc(0, 0, 76, Math.PI / 2 - 1.15, Math.PI / 2 + 1.15); weight.arc(0, 0, 26, Math.PI / 2 + 1.15, Math.PI / 2 - 1.15, true); weight.closePath();
  ctx.fillStyle = 'rgba(127,227,255,0.10)'; ctx.fill(weight);
  // a few broad section lines rather than fine hatching: it turns, and fine lines cost the video a lot
  ctx.save(); ctx.clip(weight);
  stroke(1.6, 'rgba(127,227,255,0.38)');
  for (let d = -80; d <= 80; d += 13) { ctx.beginPath(); ctx.moveTo(d - 80, -80); ctx.lineTo(d + 80, 80); ctx.stroke(); }
  ctx.restore();
  stroke(2.2, C.white); ctx.stroke(weight);
  k.rrect(-24, -R - 22, 48, R + 44, 24); ctx.fillStyle = '#123B63'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  ctx.restore();
  // the connecting rod
  const ang = Math.atan2(py - sy, px - CX), nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.beginPath();
  ctx.moveTo(CX + nx * 8, sy + ny * 8); ctx.lineTo(px + nx * 13, py + ny * 13); ctx.lineTo(px - nx * 13, py - ny * 13); ctx.lineTo(CX - nx * 8, sy - ny * 8); ctx.closePath();
  ctx.fillStyle = 'rgba(18,59,99,0.95)'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  ctx.setLineDash([14, 5, 3, 5]); stroke(1.2, 'rgba(234,246,255,0.5)'); ctx.beginPath(); ctx.moveTo(CX, sy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(CX, sy, 17, 0, TAU); ctx.fillStyle = '#123B63'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  ctx.beginPath(); ctx.arc(CX, sy, 9, 0, TAU); stroke(2, C.line); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 25, 0, TAU); ctx.fillStyle = '#123B63'; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  ctx.beginPath(); ctx.arc(px, py, 14, 0, TAU); stroke(2, C.line); ctx.stroke();
  // main journal
  ctx.beginPath(); ctx.arc(CX, CY, 20, 0, TAU); ctx.fillStyle = C.paper; ctx.fill(); stroke(2.4, C.white); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX - 30, CY); ctx.lineTo(CX + 30, CY); ctx.moveTo(CX, CY - 30); ctx.lineTo(CX, CY + 30); stroke(1, 'rgba(234,246,255,0.45)'); ctx.stroke();
}

function block() {
  // cylinder liner walls, cut and hatched
  ctx.beginPath();
  ctx.rect(CX - BORE / 2 - WALL, DECK, WALL, LINER_END - DECK); ctx.rect(CX + BORE / 2, DECK, WALL, LINER_END - DECK);
  ctx.fillStyle = HATCH; ctx.fill(); stroke(2.2, C.white); ctx.stroke();
  // crankcase
  ctx.beginPath();
  ctx.moveTo(CX - BORE / 2 - WALL, LINER_END); ctx.lineTo(CX - BORE / 2 - WALL, CY);
  ctx.ellipse(CX, CY, BORE / 2 + WALL, 88, 0, Math.PI, 0, true);
  ctx.lineTo(CX + BORE / 2 + WALL, LINER_END);
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = HATCH; ctx.stroke(); ctx.restore();
  stroke(2, C.line); ctx.stroke();
}
function head() {
  // hatch the head but leave the ports and the chamber open (so the gas shows through)
  ctx.save();
  ctx.beginPath(); ctx.rect(CX - BORE / 2 - WALL, HEAD_TOP, BORE + 2 * WALL, DECK - HEAD_TOP); ctx.clip();
  const hole = new Path2D();
  hole.rect(0, 0, W, H);
  for (const m of [false, true]) {
    const X = (x) => (m ? 2 * CX - x : x), v = m ? EV : IV;
    hole.moveTo(X(150), 236); hole.lineTo(X(268), 236); hole.quadraticCurveTo(X(v + VR + 8), 236, X(v + VR), ROOF);
    hole.lineTo(X(v - VR), ROOF); hole.quadraticCurveTo(X(v - VR - 4), 268, X(234), 268); hole.lineTo(X(150), 268); hole.closePath();
  }
  hole.moveTo(CX - BORE / 2, DECK); hole.lineTo(CX - BORE / 2, ROOF + 16); hole.lineTo(CX - BORE / 2 + 16, ROOF);
  hole.lineTo(CX + BORE / 2 - 16, ROOF); hole.lineTo(CX + BORE / 2, ROOF + 16); hole.lineTo(CX + BORE / 2, DECK); hole.closePath();
  ctx.fillStyle = HATCH; ctx.fill(hole, 'evenodd');
  ctx.restore();
  ctx.beginPath(); ctx.rect(CX - BORE / 2 - WALL, HEAD_TOP, BORE + 2 * WALL, DECK - HEAD_TOP); stroke(2.2, C.white); ctx.stroke();
  for (const m of [false, true]) { intakePortPath(m); stroke(2, C.white); ctx.stroke(); }
  chamberPath(); stroke(2, C.white); ctx.stroke();
  // manifold flanges
  stroke(2, C.line);
  for (const x of [150, 2 * CX - 150]) { ctx.beginPath(); ctx.moveTo(x, 228); ctx.lineTo(x, 276); ctx.stroke(); }
}

function engine(th, t, labelA = 1) {
  block();
  gas(th);
  piston(th);
  rodAndCrank(th);
  head();
  portFlow(th);
  valve(IV, inLift(th));
  valve(EV, exLift(th));
  cam(IV, inLift, th);
  cam(EV, exLift, th);
  sparkPlug(th, t);
  // flow labels by the ports
  withAlpha(labelA, () => {
    font(600, 22, MONO);
    text('IN', 112, 226, { color: C.fresh, align: 'center' });
    text('OUT', 2 * CX - 112, 226, { color: C.exhaust, align: 'center' });
  });
}

// ---------- labels and construction lines (scene B) ----------
function leader(label, lx, ly, tx, ty, a, lines = null) {
  withAlpha(a, () => {
    font(600, 22);
    const rows = lines ?? [label];
    const w = Math.max(...rows.map((r) => ctx.measureText(r).width));
    const ex = tx < lx ? lx - 10 : lx + w + 10;
    const p = eout(clamp(a * 1.6));
    stroke(1.6, C.line);
    ctx.beginPath(); ctx.moveTo(ex, ly - 8); ctx.lineTo(lerp(ex, tx, p), lerp(ly - 8, ty, p)); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, 4 * p, 0, TAU); ctx.fillStyle = C.line; ctx.fill();
    rows.forEach((r, i) => text(r, lx, ly + i * 26 - (rows.length - 1) * 13, { color: C.white, spacing: '1.5px' }));
  });
}
function sceneB(t) {
  const L = (t0) => seg(t, t0, t0 + 0.5);
  leader('CAMSHAFT', 64, 150, IV - 30, CAM_Y - 8, L(5.9));
  leader('INTAKE VALVE', 64, 204, IV - 14, ROOF - 4, L(6.3));
  leader('PISTON', 64, 360, CX - 90, TDC_Y + 30, L(6.7));
  leader('', 64, 540, CX - 8, 470, L(7.1), ['CONNECTING', 'ROD']);
  leader('CRANKSHAFT', 64, 676, CX - 22, CY + 4, L(7.5));
  leader('EXHAUST VALVE', 470, 150, EV + 18, ROOF - 4, L(6.5));
  leader('SPARK PLUG', 470, 204, CX + 10, 210, L(6.9));
  // the crank pin's circle and the piston's straight path
  const cp = eio(seg(t, 7.6, 9.2));
  withAlpha(span(t, 7.6, 14.1, 0.3, 0.4), () => {
    ctx.setLineDash([8, 6]); stroke(2, C.flame);
    ctx.beginPath(); ctx.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + TAU * cp); ctx.stroke(); ctx.setLineDash([]);
    if (cp > 0.95) {
      const ax = CX + R * Math.cos(-Math.PI / 2 + 0.5), ay = CY + R * Math.sin(-Math.PI / 2 + 0.5);
      ctx.fillStyle = C.flame; ctx.beginPath(); ctx.moveTo(ax + 9, ay - 2); ctx.lineTo(ax - 4, ay - 9); ctx.lineTo(ax - 2, ay + 7); ctx.closePath(); ctx.fill();
    }
  });
}
/** TDC, BDC and the stroke, marked beside the right wall. */
function deadCentres(t, a, la) {
  withAlpha(a, () => {
    const x = CX + BORE / 2 + WALL, up = eio(seg(t, 8.2, 9.2)), mid = (TDC_Y + BDC_Y) / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x, lerp(mid, TDC_Y - 14, up), 40, lerp(0, BDC_Y - TDC_Y + 28, up)); ctx.clip();
    stroke(2, C.flame);
    for (const y of [TDC_Y, BDC_Y]) { ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + 30, y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x + 18, TDC_Y + 4); ctx.lineTo(x + 18, BDC_Y - 4); ctx.stroke();
    ctx.fillStyle = C.flame;
    ctx.beginPath(); ctx.moveTo(x + 18, TDC_Y + 2); ctx.lineTo(x + 12, TDC_Y + 14); ctx.lineTo(x + 24, TDC_Y + 14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 18, BDC_Y - 2); ctx.lineTo(x + 12, BDC_Y - 14); ctx.lineTo(x + 24, BDC_Y - 14); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  withAlpha(a * la, () => {
    const x = CX + BORE / 2 + WALL;
    font(600, 22, MONO);
    text('TDC', x + 38, TDC_Y + 8, { color: C.white });
    text('BDC', x + 38, BDC_Y + 8, { color: C.white });
    font(600, 22); text('STROKE', x + 38, (TDC_Y + BDC_Y) / 2 + 8, { color: C.flame, spacing: '1.5px' });
  });
}

// ---------- the right-hand panel: stroke counter, cycle dial, gas legend ----------
const STROKES = [
  ['INTAKE', 'fresh fuel and air', C.fresh],
  ['COMPRESSION', 'mixture squeezed', C.squeezed],
  ['POWER', 'spark, burning gas', C.burn],
  ['EXHAUST', 'burnt gas out', C.exhaust],
];
const DIAL = { x: 694, y: 330, r: 86 };
function panel(t, th, base, a, legendA) {
  const c = cyc(th), sIdx = Math.min(3, Math.floor(c / 180)), turn = c < 360 ? 1 : 2;
  withAlpha(a, () => {
    font(600, 22, MONO); text(`TURN ${turn} OF 2`, DIAL.x, 214, { color: C.line, align: 'center', spacing: '1px' });
    // the dial: one cycle all the way round, so its pointer turns at camshaft speed
    for (let i = 0; i < 4; i++) {
      const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.04, a1 = a0 + Math.PI / 2 - 0.08, on = i === sIdx;
      ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, DIAL.r, a0, a1); ctx.lineWidth = on ? 18 : 12; ctx.strokeStyle = rgba(STROKES[i][2], on ? 1 : 0.35); ctx.lineCap = 'butt'; ctx.stroke();
      const mid = (a0 + a1) / 2;
      font(700, 22); text(String(i + 1), DIAL.x + Math.cos(mid) * (DIAL.r - 26), DIAL.y + Math.sin(mid) * (DIAL.r - 26) + 1, { color: on ? C.white : C.faint, align: 'center', base: 'middle' });
    }
    ctx.lineCap = 'round';
    stroke(1.5, C.faint); ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, DIAL.r + 16, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) { const ang = -Math.PI / 2 + i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(DIAL.x + Math.cos(ang) * (DIAL.r + 12), DIAL.y + Math.sin(ang) * (DIAL.r + 12)); ctx.lineTo(DIAL.x + Math.cos(ang) * (DIAL.r + 20), DIAL.y + Math.sin(ang) * (DIAL.r + 20)); ctx.stroke(); }
    const pa = -Math.PI / 2 + (c / 720) * TAU;
    stroke(3, C.white); ctx.beginPath(); ctx.moveTo(DIAL.x, DIAL.y); ctx.lineTo(DIAL.x + Math.cos(pa) * (DIAL.r + 18), DIAL.y + Math.sin(pa) * (DIAL.r + 18)); ctx.stroke();
    ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, 42, 0, TAU); ctx.fillStyle = '#0E3154'; ctx.fill(); stroke(2, C.white); ctx.stroke();
    font(700, 24, MONO); text(`${Math.floor(c)}°`, DIAL.x, DIAL.y + 2, { color: C.white, align: 'center', base: 'middle' });
    font(500, 22); text('720° = 2 TURNS', DIAL.x, DIAL.y + DIAL.r + 50, { color: C.soft, align: 'center', spacing: '0.5px' });
  });
  withAlpha(a * legendA, () => {
    STROKES.forEach(([name, sub, col], i) => {
      const y = 494 + i * 52, on = i === sIdx;
      if (on) { k.rrect(586, y - 24, 236, 50, 8); ctx.fillStyle = 'rgba(127,227,255,0.10)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(604, y - 2, 9, 0, TAU); ctx.fillStyle = rgba(col, on ? 1 : 0.5); ctx.fill();
      font(700, 23); text(`${i + 1}  ${name}`, 624, y - 2, { color: on ? C.white : C.soft, spacing: '1px' });
      font(400, 22); text(sub, 624, y + 20, { color: on ? C.soft : 'rgba(234,246,255,0.45)' });
    });
  });
  withAlpha(a * legendA, () => {
    const turns = Math.max(0, (th - base) / 360), fires = sparks(th, base);
    font(500, 22); text('CRANK TURNS', 586, 726, { color: C.soft, spacing: '1px' });
    text('POWER STROKES', 586, 762, { color: C.soft, spacing: '1px' });
    font(700, 28, MONO); text(turns.toFixed(2), 822, 727, { color: C.white, align: 'right' });
    text(String(fires), 822, 763, { color: C.burn, align: 'right' });
  });
}

/** Left-aligned paragraphs wrapped to a width. */
function paragraphs(list, x, y, maxW, lh, gap) {
  for (const [s, col, weight] of list) {
    font(weight, 22);
    let line = '';
    for (const w of s.split(' ')) {
      const tryLine = line ? `${line} ${w}` : w;
      if (ctx.measureText(tryLine).width > maxW && line) { text(line, x, y, { color: col }); y += lh; line = w; } else line = tryLine;
    }
    text(line, x, y, { color: col }); y += lh + gap;
  }
}
function notes(a) {
  withAlpha(a, () => paragraphs([
    ['NOTES', C.line, 700],
    ['Simplified: real valves open early, close late and briefly overlap.', C.soft, 500],
    ['Diesels have no spark: the heat of compression ignites the fuel.', C.soft, 500],
    ['Source: Wikipedia, “Four-stroke engine”', C.faint, 500],
  ], 586, 496, 238, 25, 10));
}

function camTag(t) {
  withAlpha(span(t, 40.6, 44.5, 0.4, 0.4), () => {
    font(700, 22, MONO);
    const s = 'CAMS: ½ × CRANK SPEED', w = ctx.measureText(s).width + 24;
    const x = EV + 48, y = CAM_Y;
    k.rrect(x, y - 17, w, 34, 17); ctx.fillStyle = C.line; ctx.fill();
    text(s, x + w / 2, y + 1, { color: '#0C2A4A', align: 'center', base: 'middle' });
  });
}

// Captions with balanced lines: the narrowest width that keeps the same number of lines.
const CAP = { size: 44, lh: 56, weight: 600, maxW: 780 };
const MARKS = { '#': C.line, '~': C.fresh, '^': C.squeezed, '*': C.burn, '=': C.exhaust };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, TXT);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[#~^*=]/g, '')).width);
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
    k.captions(t, [cue], { x: W / 2, y: 834, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TXT, ink: C.white, marks: MARKS });
  }
}

function header() {
  font(700, 24); text('RECKON', 64, 72, { color: C.line, spacing: '3px' });
  const rw = ctx.measureText('RECKON').width + 18;
  font(500, 24); text('ENGINEERING · ENGINES', 64 + rw + 16, 72, { color: C.soft, spacing: '3px' });
  font(500, 22, MONO); text('SIMPLIFIED DIAGRAM · ONE CYLINDER · PETROL ENGINE', 64, 104, { color: C.faint });
}

Kit.scene({
  width: W, height: H, duration: 49.5,
  fonts: [
    { family: TXT, file: 'Saira.woff2', weight: '100 900' },
    { family: MONO, file: 'JetBrainsMono.woff2', weight: '100 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!PAPER) { PAPER = paintPaper(); HATCH = makeHatch(); }
    ctx.drawImage(PAPER, 0, 0);
    header();
    const th = theta(t);
    withAlpha(eout(seg(t, 0, 0.9)), () => { ctx.save(); ctx.translate(0, (1 - eout(seg(t, 0, 1.0))) * 18); engine(th, t, 1 - span(t, 5.6, 14.0, 0.3, 0.4)); ctx.restore(); });
    withAlpha(span(t, T.B[0], T.B[1], 0.3, 0.4), () => sceneB(t));
    deadCentres(t, span(t, 8.0, 35.3, 0.4, 0.6), seg(t, 9.9, 10.4));
    // the panel: counters during the hook; dial, legend and counters from the slow cycle on
    const pa = Math.max(span(t, 0.4, 5.6, 0.5, 0.35), span(t, 13.8, 49.5, 0.5, 0));
    const base = t < 10 ? 0 : BASE_C;
    panel(t, th, base, pa, 1 - seg(t, 44.6, 45.1));
    notes(seg(t, 45.0, 45.6));
    camTag(t);
    captions(t);
  },
});
