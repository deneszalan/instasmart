// Explainer for chemistry-soap-micelles: soap lifts grease by wrapping it in micelles that water can rinse away.
// Look: clean and bright. A pale sky-blue water cross-section with soft drifting caustic light and
// light shafts, a white glazed plate, orange-amber grease drawn as a gooey metaball, soap molecules
// as round blue heads with wiggly amber tails. One rounded family: Fredoka.
//
// Facts (Wikipedia "Soap", "Micelle", "Surfactant", "Sodium stearate"): oily dirt "cannot be removed by
// water alone" (Micelle); surfactants have hydrophilic "heads" and hydrophobic "tails", the tails often a
// hydrocarbon chain (Surfactant); in cleaning, oil/fat dirt "becomes associated inside micelles, which are
// tiny spheres formed from soap molecules with polar hydrophilic (water-attracting) groups on the outside
// and encasing a lipophilic (fat-attracting) pocket, that shields the oil/fat molecules from the water"
// and soap "emulsifies oils, enabling them to be carried away by running water" (Soap); sodium stearate,
// C17H35COONa, is "the most common soap" (Sodium stearate), so its tail is a chain of 17 carbons.
// Nothing here is to scale: a real micelle is far too small to see, so the frame says DIAGRAM.
//
// Scene plan (48.5 s). Content stays above y = 930; captions are centred at y = 830 on the white plate.
//  A  0.0– 9.6  Water flows over a dome of grease on a      "Rinse a greasy plate with water, and the grease stays put."
//               plate; water molecules slide past it.       "Oil and water don't mix, so water alone can't lift it."
//  B  9.3–20.8  A soap molecule up close: blue head (COO-), "Enter soap. Each molecule has two ends."
//               then a zigzag tail whose 17 carbons light   "A *head* that is attracted to water…"
//               up one by one.                              "…and a ~tail~, a hydrocarbon chain, that's attracted to oil."
//  C 20.4–30.0  Molecules swim down and dig their tails in; "The ~tails~ dig into the grease; the *heads* stay in the water."
//               the grease lifts off as coated droplets.    "The grease breaks away in tiny droplets, wrapped in soap."
//  D 29.6–39.8  Zoom into one droplet: the micelle.         "This ball is a *micelle*: ~tails~ inside with the oil, *heads* outside."
//                                                           "Its water-loving surface hides the oil from the water."
//  E 39.4–48.5  Running water carries the micelles away;    "Now running water can carry the grease away."
//               the plate shines; a closing card.           "One end loves water, the other loves oil. That's soap."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const TAU = Math.PI * 2;
const F = 'Fredoka';

const C = {
  navy: '#0B3557', soft: 'rgba(11,53,87,0.68)', faint: 'rgba(11,53,87,0.22)',
  blue: '#1D6FD8', blueHi: '#7DB8FF', blueDeep: '#0F4FA8',
  amber: '#F59E0B', amberHi: '#FFD36B', amberDeep: '#C2410C', tail: '#A8460E', tailHi: '#E07A1F',
  white: '#FFFFFF',
};
const PLATE_Y = 690;          // the plate's top surface (world coordinates)
const CARBONS = 17;           // sodium stearate, C17H35COONa: the tail's carbon chain

let k, ctx;
const font = (weight, size) => k.font(weight, size, F);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.navy, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const angLerp = (a, b, u) => { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * u; };
const smax = (a, b, s) => (a + b + Math.sqrt((a - b) * (a - b) + s * s)) / 2;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- timeline ----------
const T = { split0: 25.6, split1: 28.8, zin0: 29.8, zin1: 31.1, zout0: 38.7, zout1: 39.9, rinse0: 39.9, rinse1: 44.8 };
const CUES = [
  [0.5, 4.9, 'Rinse a greasy plate with water, and the grease stays put.'],
  [5.0, 9.5, 'Oil and water don’t mix, so water alone can’t lift it.'],
  [9.7, 12.9, 'Enter soap. Each molecule has two ends.'],
  [13.0, 16.3, 'A *head* that is attracted to water…'],
  [16.4, 20.6, '…and a ~tail~, a hydrocarbon chain, that’s attracted to oil.'],
  [20.8, 25.4, 'The ~tails~ dig into the grease; the *heads* stay in the water.'],
  [25.5, 29.8, 'The grease breaks away in tiny droplets, wrapped in soap.'],
  [30.1, 34.8, 'This ball is a *micelle*: ~tails~ inside with the oil, *heads* outside.'],
  [34.9, 38.8, 'Its water-loving surface hides the oil from the water.'],
  [39.2, 42.9, 'Now running water can carry the grease away.'],
  [43.1, 48.2, 'One end loves water, the other loves oil. That’s soap.'],
];

// ---------- the grease: metaballs ----------
const DOME = [{ x: 296, y: 716, r: 96 }, { x: 432, y: 708, r: 106 }, { x: 568, y: 716, r: 96 }];
const DROPS = [{ x: 232, y: 468, r: 60 }, { x: 432, y: 418, r: 66 }, { x: 632, y: 478, r: 60 }];
function balls(t) {
  const s = eio(seg(t, T.split0, T.split1));
  const rin = (i) => eio(seg(t, T.rinse0 + (2 - i) * 0.3, T.rinse1 + (2 - i) * 0.3));   // the leader goes first, so they never merge
  return DOME.map((d, i) => {
    const q = DROPS[i], bob = Math.sin(t * 1.3 + i * 2.1) * 5 * s;
    const wob = (1 - s) * Math.sin(t * 2.2 + i) * 1.5;
    return {
      x: lerp(d.x, q.x, s) + rin(i) * 1000,
      y: lerp(d.y, q.y, s) + bob - rin(i) * 90 + wob,
      r: lerp(d.r, q.r, s),
    };
  });
}
function field(x, y, B) {
  let f = 0;
  for (const b of B) { const dx = x - b.x, dy = y - b.y; f += (b.r * b.r) / (dx * dx + dy * dy + 1e-3); }
  return f;
}
/** First point where the field drops below 1, marching out from (x, y) at angle a. */
function edge(x, y, a, B) {
  const ux = Math.cos(a), uy = Math.sin(a);
  let r0 = 0, r1 = 0;
  for (let r = 4; r < 400; r += 4) { if (field(x + ux * r, y + uy * r, B) < 1) { r1 = r; break; } r0 = r; }
  for (let i = 0; i < 12; i++) { const m = (r0 + r1) / 2; if (field(x + ux * m, y + uy * m, B) >= 1) r0 = m; else r1 = m; }
  const r = (r0 + r1) / 2, px = x + ux * r, py = y + uy * r;
  // outward normal: the field's falling gradient
  const e = 0.8, gx = field(px + e, py, B) - field(px - e, py, B), gy = field(px, py + e, B) - field(px, py - e, B);
  const gl = Math.hypot(gx, gy) || 1;
  return { x: px, y: py, nx: -gx / gl, ny: -gy / gl };
}
/** The top of the grease above x (or the plate where there is none). */
function surfaceY(x, B) {
  if (field(x, PLATE_Y - 2, B) < 1) return PLATE_Y;
  let lo = PLATE_Y - 2, hi = PLATE_Y - 320;
  for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; if (field(x, m, B) >= 1) lo = m; else hi = m; }
  return lo;
}

// ---------- the soap molecules ----------
const HEAD_R = 11, TAIL_L = 46;
const rnd0 = mulberry32(4);
// Dome molecules: evenly spaced along the dome's upper edge, assigned to the nearest ball.
const MOLS = [];
{
  const n = 19, cx = 432, cy = 712;
  for (let i = 0; i < n; i++) {
    const a = lerp(-Math.PI + 0.16, -0.16, i / (n - 1));
    const p = edge(cx, cy, a, DOME);
    let b = 0, best = 1e9;
    DOME.forEach((d, j) => { const dd = Math.hypot(p.x - d.x, p.y - d.y) - d.r; if (dd < best) { best = dd; b = j; } });
    MOLS.push({ kind: 'dome', ball: b, a0: Math.atan2(p.y - DOME[b].y, p.x - DOME[b].x), seed: rnd0() * 10, i });
  }
}
// Final slots: each droplet gets evenly spaced molecules all round; dome molecules take the top slots.
const SLOTS = [14, 15, 14];
SLOTS.forEach((n, b) => {
  const mine = MOLS.filter((m) => m.ball === b).sort((p, q) => p.a0 - q.a0);
  const slots = Array.from({ length: n }, (_, j) => -Math.PI / 2 + ((j - (n - 1) / 2) * TAU) / n);
  // centre the dome molecules' slots on the top (−90°), in order of angle
  const start = Math.round((n - mine.length) / 2);
  const topOrder = slots.map((a, j) => ({ a, j })).sort((p, q) => Math.abs(angLerp(-Math.PI / 2, p.a, 1) + Math.PI / 2) - Math.abs(angLerp(-Math.PI / 2, q.a, 1) + Math.PI / 2));
  const top = topOrder.slice(0, mine.length).map((o) => o.a).sort((p, q) => p - q);
  mine.forEach((m, j) => { m.a1 = top[j]; });
  const rest = topOrder.slice(mine.length).map((o) => o.a);
  rest.forEach((a, j) => MOLS.push({ kind: 'late', ball: b, a0: a, a1: a, seed: rnd0() * 10, i: j, n: rest.length }));
});
// Arrival times and starting points.
MOLS.forEach((m) => {
  if (m.kind === 'dome') {
    m.t0 = 20.7 + m.i * 0.13 + rnd0() * 0.3; m.t1 = m.t0 + 2.1;
    m.sx = lerp(80, 784, m.i / 18) + (rnd0() - 0.5) * 60; m.sy = -40 - rnd0() * 140;
  } else {
    m.t0 = 25.4 + rnd0() * 1.3; m.t1 = m.t0 + 2.4;
    const side = m.ball === 0 ? -1 : m.ball === 2 ? 1 : (rnd0() < 0.5 ? -1 : 1);
    m.sx = side < 0 ? -50 - rnd0() * 80 : W + 50 + rnd0() * 80; m.sy = 260 + rnd0() * 360;
  }
});

// The close-up molecule becomes this one: it starts swimming where the close-up shrinks to.
const HAND = MOLS[9];
HAND.sx = 470; HAND.sy = 300; HAND.t0 = 21.1; HAND.t1 = 23.4; HAND.h0 = Math.PI / 2 + 0.25;

/** Where a molecule's head sits and which way its tail points, at time t. */
function molPose(m, t, B) {
  const b = B[m.ball];
  const s = eio(seg(t, T.split0, T.split1));
  const a = m.kind === 'dome' ? angLerp(m.a0, m.a1, s) : m.a1;
  const e = edge(b.x, b.y, a, B);
  const hx = e.x + e.nx * (HEAD_R + 1), hy = e.y + e.ny * (HEAD_R + 1);
  const tailAng = Math.atan2(-e.ny, -e.nx);
  const u = eio(seg(t, m.t0, m.t1));
  if (u >= 1) return { x: hx, y: hy, ang: tailAng, on: 1 };
  // swimming in: a wavy path, tail leading toward the grease
  const swim = t - m.t0, w = Math.sin(Math.PI * u);
  const mx = lerp(m.sx, hx, u) + Math.sin(swim * 3 + m.seed) * 26 * w;
  const my = lerp(m.sy, hy, u) + Math.cos(swim * 2.4 + m.seed) * 14 * w;
  const heading = (m.h0 ?? Math.atan2(hy - m.sy, hx - m.sx)) + Math.sin(swim * 4 + m.seed) * 0.5 * w;
  return { x: mx, y: my, ang: angLerp(heading, tailAng, eio(seg(u, 0.55, 1))), on: seg(t, m.t0 - 0.05, m.t0 + 0.3) };
}

/** A soap molecule: a round head at (x, y) and a wiggly zigzag tail pointing along ang. */
function molecule(x, y, ang, t, seed, { s = 1, nodes = 9, lit = -1, sign = false, alpha = 1, wiggle = 3.2, weight = 1 } = {}) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    const step = TAIL_L / (nodes - 1);
    const pts = [];
    for (let i = 0; i < nodes; i++) {
      const u = i / (nodes - 1);
      const zig = (i % 2 ? 1 : -1) * 2.6;
      const wig = Math.sin(i * 0.8 - t * 4 + seed) * wiggle * u;
      pts.push([HEAD_R - 1 + i * step, zig + wig]);
    }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 6.5 * weight;
    ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    ctx.strokeStyle = C.tail; ctx.lineWidth = 3.6 * weight;
    ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    if (lit >= 0) {
      for (let i = 0; i < nodes; i++) {
        const on = clamp(lit - i);
        ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 2.1 * weight, 0, TAU);
        ctx.fillStyle = on > 0 ? C.amberHi : C.tail; ctx.fill();
        if (on > 0) withAlpha(on * (1 - clamp(lit - i - 1) * 0.7), () => { ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 4.4 * weight, 0, TAU); ctx.strokeStyle = C.amberDeep; ctx.lineWidth = 0.9; ctx.stroke(); });
      }
    }
    // head
    const g = ctx.createRadialGradient(-HEAD_R * 0.35, -HEAD_R * 0.4, 1, 0, 0, HEAD_R);
    g.addColorStop(0, C.blueHi); g.addColorStop(0.55, C.blue); g.addColorStop(1, C.blueDeep);
    ctx.beginPath(); ctx.arc(0, 0, HEAD_R, 0, TAU); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.6 * weight; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-HEAD_R * 0.32, -HEAD_R * 0.38, HEAD_R * 0.32, HEAD_R * 0.2, -0.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    if (sign) { ctx.rotate(-ang); ctx.fillStyle = C.white; ctx.fillRect(-4.5, -1.1, 9, 2.2); }
    ctx.restore();
  });
}

// ---------- textures, made once ----------
let CAUSTIC = null, capPat = null;
function makeCaustic(size = 256, cells = 7) {
  const rnd = mulberry32(9), cell = size / cells, pts = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) pts.push([(i + 0.15 + 0.7 * rnd()) * cell, (j + 0.15 + 0.7 * rnd()) * cell]);
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const ci = Math.floor(x / cell), cj = Math.floor(y / cell);
    let d1 = 1e9, d2 = 1e9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (ci + di + cells) % cells, jj = (cj + dj + cells) % cells, p = pts[jj * cells + ii];
      const d = Math.hypot(x - (p[0] + (ci + di - ii) * cell), y - (p[1] + (cj + dj - jj) * cell));
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    const v = Math.exp(-(d2 - d1) / 4.5);
    const o = 4 * (y * size + x);
    img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255; img.data[o + 3] = 255 * v;
  }
  g.putImageData(img, 0, 0);
  return cv;
}

// ---------- the camera (scene D zooms into the middle droplet) ----------
const ZOOM = 2.5, ZC = [432, 430];
function camState(t) {
  const e = eio(seg(t, T.zin0, T.zin1)) * (1 - eio(seg(t, T.zout0, T.zout1)));
  const B = balls(t), f = B[1];
  const s = lerp(1, ZOOM, e);
  return { e, s, ox: lerp(f.x, ZC[0], e) - s * f.x, oy: lerp(f.y, ZC[1], e) - s * f.y };
}
const toScreen = (cam, x, y) => [cam.ox + cam.s * x, cam.oy + cam.s * y];

// ---------- layers ----------
function water(t, cam) {
  const top = Math.min(H, toScreen(cam, 0, PLATE_Y)[1]);
  const g = ctx.createLinearGradient(0, 0, 0, Math.max(top, 400));
  g.addColorStop(0, '#E9F7FF'); g.addColorStop(0.55, '#C6E9FC'); g.addColorStop(1, '#A4D8F6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // light shafts from the surface
  ctx.save();
  for (const [x, w, ph] of [[150, 90, 0], [370, 140, 1.7], [610, 110, 3.1], [780, 80, 4.4]]) {
    const a = 0.10 + 0.05 * Math.sin(t * 0.7 + ph);
    const lg = ctx.createLinearGradient(0, 0, 0, 700);
    lg.addColorStop(0, `rgba(255,255,255,${a * 2})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg;
    const sw = Math.sin(t * 0.3 + ph) * 20;
    ctx.beginPath(); ctx.moveTo(x - w / 2 + sw, 0); ctx.lineTo(x + w / 2 + sw, 0); ctx.lineTo(x + w * 0.9 - 120, 700); ctx.lineTo(x - w * 0.9 - 120, 700); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // caustics: two drifting layers of the bright network
  if (!capPat) capPat = ctx.createPattern(CAUSTIC, 'repeat');
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, top); ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  for (const [sc, vx, vy, a] of [[1.9, 9, 4, 0.28], [2.7, -6, 7, 0.2]]) {
    capPat.setTransform(new DOMMatrix().translate(t * vx * cam.s + cam.ox * 0.2, t * vy * cam.s).scale(sc * Math.sqrt(cam.s)));
    ctx.globalAlpha = a; ctx.fillStyle = capPat; ctx.fillRect(0, 0, W, top);
  }
  ctx.restore();
}

function plate(t, cam) {
  const [, y] = toScreen(cam, 0, PLATE_Y);
  if (y >= H) return;
  const g = ctx.createLinearGradient(0, y, 0, H);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.08, '#F4F9FD'); g.addColorStop(1, '#E2EEF7');
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  ctx.fillStyle = 'rgba(11,53,87,0.16)'; ctx.fillRect(0, y, W, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(0, y + 3, W, 2);
  // a china plate's painted band, and the glaze's soft sheen
  ctx.fillStyle = 'rgba(29,111,216,0.30)'; ctx.fillRect(0, y + 22 * cam.s, W, 3 * cam.s);
  ctx.fillStyle = 'rgba(29,111,216,0.16)'; ctx.fillRect(0, y + 30 * cam.s, W, 1.5 * cam.s);
  const sh = ctx.createLinearGradient(0, y, W, y + 300);
  sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.45, 'rgba(255,255,255,0.5)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh; ctx.fillRect(0, y + 36, W, H - y);
  // a soft caustic shimmer on the glaze
  withAlpha(0.18, () => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y + 5, W, 40); ctx.clip();
    capPat.setTransform(new DOMMatrix().translate(t * 7, y).scale(2.2, 0.5));
    ctx.fillStyle = capPat; ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha *= 0.4;
    ctx.fillRect(0, y + 5, W, 40);
    ctx.restore();
  });
}

let GCV = null, GIMG = null;
const GS = 2;   // grease sampled every 2 px on screen
function grease(t, cam, B) {
  if (!GCV) { GCV = document.createElement('canvas'); GCV.width = W / GS; GCV.height = H / GS; GIMG = GCV.getContext('2d').createImageData(W / GS, H / GS); }
  const d = GIMG.data; d.fill(0);
  // bounds on screen
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (const b of B) {
    const [sx, sy] = toScreen(cam, b.x, b.y), sr = b.r * cam.s * 1.6;
    x0 = Math.min(x0, sx - sr); x1 = Math.max(x1, sx + sr); y0 = Math.min(y0, sy - sr); y1 = Math.max(y1, sy + sr);
  }
  const gw = W / GS, gh = H / GS;
  const i0 = clamp(Math.floor(x0 / GS), 0, gw), i1 = clamp(Math.ceil(x1 / GS), 0, gw);
  const j0 = clamp(Math.floor(y0 / GS), 0, gh), j1 = clamp(Math.ceil(y1 / GS), 0, gh);
  const hi = [255, 211, 107], mid = [245, 158, 11], lo = [194, 65, 12];
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const wx = ((i + 0.5) * GS - cam.ox) / cam.s, wy = ((j + 0.5) * GS - cam.oy) / cam.s;
    const f = field(wx, wy, B);
    if (f < 0.9) continue;
    const a = clamp((f - 0.93) / 0.1);
    const u = clamp((f - 1) / 0.9);                 // 0 at the rim, 1 deep inside
    const shade = clamp(0.5 + 0.5 * u - 0.0009 * (wy - 400));
    const c = shade < 0.5 ? lo.map((v, q) => lerp(v, mid[q], shade / 0.5)) : mid.map((v, q) => lerp(v, hi[q], (shade - 0.5) / 0.5));
    const o = 4 * (j * gw + i);
    d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255 * a;
  }
  GCV.getContext('2d').putImageData(GIMG, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(GCV, 0, 0, W, H);
  // glossy highlights
  ctx.save(); ctx.translate(cam.ox, cam.oy); ctx.scale(cam.s, cam.s);
  const sp = eio(seg(t, T.split0, T.split1));
  B.forEach((b, i) => {
    withAlpha(i === 1 ? 1 : sp, () => {
      const rx = i === 1 ? lerp(b.r * 0.5, b.r * 0.26, sp) : b.r * 0.26;
      ctx.beginPath(); ctx.ellipse(b.x - b.r * lerp(0.6, 0.38, sp), b.y - b.r * lerp(0.62, 0.48, sp), rx, b.r * 0.13, lerp(-0.25, -0.7, sp), 0, TAU);
      ctx.fillStyle = 'rgba(255,250,230,0.55)'; ctx.fill();
    });
  });
  ctx.restore();
}

/** Water molecules and flow lines, sliding over whatever is on the plate. */
const WATER = Array.from({ length: 26 }, (_, i) => { const r = mulberry32(100 + i); return { x0: r() * (W + 120), y0: 360 + r() * 300, v: 70 + r() * 50, a: r() * TAU, sp: (r() - 0.5) * 2 }; });
function flow(t, cam, B, amount) {
  if (amount <= 0) return;
  withAlpha(amount, () => {
    ctx.save(); ctx.translate(cam.ox, cam.oy); ctx.scale(cam.s, cam.s);
    const xs = []; for (let x = -24; x <= W + 24; x += 12) xs.push([x, surfaceY(x, B)]);
    const lift = (y0, ys, m) => y0 - smax(0, y0 - (ys - m), 14);
    ctx.lineCap = 'round'; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -t * 110;
    for (const y0 of [392, 470, 548, 612, 662]) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); xs.forEach(([x, ys], i) => { const y = lift(y0, ys, 18); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const m of WATER) {
      const x = ((m.x0 + m.v * t) % (W + 120)) - 60;
      const y = lift(m.y0 + Math.sin(t * 1.5 + m.a) * 6, surfaceY(x, B), 22);
      const ang = m.a + t * m.sp;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(Math.cos(s * 0.91) * 7.5, Math.sin(s * 0.91) * 7.5, 3.6, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill(); ctx.strokeStyle = 'rgba(29,111,216,0.35)'; ctx.lineWidth = 1.2; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, 6.4, 0, TAU); ctx.fillStyle = 'rgba(214,236,255,0.98)'; ctx.fill(); ctx.strokeStyle = 'rgba(29,111,216,0.45)'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  });
}

function bubbles(t) {
  const r = mulberry32(55);
  for (let i = 0; i < 12; i++) {
    const x0 = r() < 0.5 ? 30 + r() * 120 : 714 + r() * 120, per = 6 + r() * 4, off = r() * per, rad = 3 + r() * 6;
    const u = ((t + off) % per) / per, y = 700 - u * 760, x = x0 + Math.sin(u * 9 + i) * 10;
    withAlpha(Math.min(1, u * 8) * (1 - u) * 0.8, () => {
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - rad * 0.35, y - rad * 0.35, rad * 0.25, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    });
  }
}

function pill(s, x, y, bg, fg, a = 1, size = 24) {
  withAlpha(a, () => {
    font(600, size);
    const w = ctx.measureText(s).width + 30, h = size + 18;
    ctx.save(); ctx.shadowColor = 'rgba(11,53,87,0.18)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    rrect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    ctx.restore();
    text(s, x, y + 1, { color: fg, align: 'center', base: 'middle' });
  });
}

// ---------- scene B: one molecule up close ----------
const BIG = { s: 7, y: 352 };
BIG.x = W / 2 - ((TAIL_L + HEAD_R - 1 - HEAD_R) / 2) * BIG.s;   // centre the whole molecule
function closeUp(t) {
  // the big molecule, then it shrinks into one of the swarm
  const enter = eout(seg(t, 9.4, 10.6)), leave = eio(seg(t, 20.2, 21.1));
  if (enter <= 0 || leave >= 1) return;
  const p = molPose(HAND, HAND.t0, balls(t));
  const x = lerp(lerp(-420, BIG.x, enter), p.x, leave), y = lerp(BIG.y, p.y, leave);
  const s = lerp(BIG.s, 1, leave), ang = angLerp(Math.sin(t * 0.8) * 0.04, p.ang, leave);
  const lit = seg(t, 16.7, 19.2) * CARBONS;
  // a soft card behind it, so it reads against the scene
  withAlpha(enter * (1 - leave), () => {
    rrect(48, 190, 768, 430, 34); ctx.fillStyle = 'rgba(255,255,255,0.66)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 2; ctx.stroke();
    font(600, 22); text('ONE SOAP MOLECULE: SODIUM STEARATE', W / 2, 234, { color: C.soft, align: 'center', spacing: '1px' });
  });
  molecule(x, y, ang, t, 1.3, { s, nodes: CARBONS, lit, sign: true, wiggle: lerp(1.0, 3.2, leave), weight: lerp(0.6, 1, leave) });
  // labels
  const la = 1 - eio(seg(t, 20.0, 20.4));
  withAlpha(seg(t, 13.1, 13.6) * la, () => {
    pill('HEAD · loves water', BIG.x, 506, C.blue, C.white, 1, 24);
    font(600, 22);
    const w1 = ctx.measureText('COO').width, w2 = ctx.measureText(' group').width;
    const x0 = BIG.x - (w1 + 12 + w2) / 2;
    text('COO', x0, 552, { color: C.soft });
    text('−', x0 + w1 + 1, 542, { color: C.soft });
    text(' group', x0 + w1 + 12, 552, { color: C.soft });
  });
  withAlpha(seg(t, 16.5, 17.0) * la, () => {
    const tx = BIG.x + (HEAD_R + TAIL_L * 0.62) * BIG.s;
    pill('TAIL · loves oil', tx, 506, C.amberDeep, C.white, 1, 24);
    font(600, 22);
    const n = Math.min(CARBONS, Math.floor(lit + 1e-6));
    text(`${n} carbon${n === 1 ? '' : 's'} in a chain`, tx, 552, { color: C.soft, align: 'center' });
  });
}

// ---------- scene D: the micelle, labelled ----------
function micelleLabels(t, cam, B) {
  const a = span(t, T.zin1 - 0.2, T.zout0 + 0.2, 0.4, 0.4);
  if (a <= 0) return;
  const b = B[1], [cx, cy] = toScreen(cam, b.x, b.y), R = b.r * cam.s;
  withAlpha(a, () => {
    pill('MICELLE', cx, cy - R - 82, C.navy, C.white, 1, 28);
    // a head on the upper left, a tail in the core
    const hp = toScreen(cam, ...(() => { const e = edge(b.x, b.y, -2.45, B); return [e.x + e.nx * (HEAD_R + 1), e.y + e.ny * (HEAD_R + 1)]; })());
    const tp = toScreen(cam, b.x + 18, b.y + 22);
    withAlpha(seg(t, 31.0, 31.5), () => {
      ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hp[0] - 30, hp[1] - 22); ctx.lineTo(150, 196); ctx.stroke();
      pill('heads face the water', 170, 172, C.blue, C.white, 1, 24);
    });
    withAlpha(seg(t, 32.2, 32.7), () => {
      ctx.strokeStyle = C.amberDeep; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tp[0] + 8, tp[1] + 8); ctx.lineTo(650, 690); ctx.stroke();
      pill('tails hide in the oil', 640, 712, C.amberDeep, C.white, 1, 24);
    });
  });
}

// ---------- scene E: the closing card ----------
function closing(t) {
  const p = eout(seg(t, 44.4, 45.2));
  withAlpha(p, () => {
    ctx.save(); ctx.translate(0, (1 - p) * 18);
    rrect(84, 236, 696, 362, 40); ctx.fillStyle = 'rgba(255,255,255,0.84)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 2; ctx.stroke();
    // a little micelle icon
    const cx = W / 2, cy = 340, n = 12, R = 46;
    ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, TAU); ctx.fillStyle = C.amber; ctx.fill();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + t * 0.4;
      const hx = cx + Math.cos(a) * (R + 4), hy = cy + Math.sin(a) * (R + 4);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(a + Math.PI);
      ctx.strokeStyle = C.tail; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(14, 2); ctx.lineTo(22, -2); ctx.lineTo(30, 1); ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(hx, hy, 7.5, 0, TAU); ctx.fillStyle = C.blue; ctx.fill(); ctx.strokeStyle = C.white; ctx.lineWidth = 1.4; ctx.stroke();
    }
    font(700, 58); text('Heads out, tails in', W / 2, 462, { align: 'center', base: 'middle' });
    font(500, 28); text('how soap lifts grease off a plate', W / 2, 512, { color: C.soft, align: 'center', base: 'middle' });
    font(500, 22); text('Sources: Wikipedia, “Soap”, “Micelle”, “Surfactant”', W / 2, 566, { color: C.soft, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

function header(t) {
  font(700, 24); text('RECKON', 40, 76, { spacing: '3px' });
  const w = ctx.measureText('RECKON').width + 3 * 6;
  font(500, 24); text('CHEMISTRY · SOAP', 40 + w + 18, 76, { color: C.soft, spacing: '1px' });
  font(500, 22); text('DIAGRAM · NOT TO SCALE', 40, 116, { color: C.soft, spacing: '1px' });
}

// Captions with balanced lines.
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: F, ink: C.navy, marks: { '*': C.blue, '~': C.amberDeep } });
  }
}

Kit.scene({
  width: W, height: H, duration: 48.5,
  fonts: [{ family: F, file: 'Fredoka.woff2', weight: '300 700' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!CAUSTIC) CAUSTIC = makeCaustic();
    const cam = camState(t), B = balls(t);
    water(t, cam);
    bubbles(t);
    const intro = eout(seg(t, 0.1, 1.4));
    // A and E: water flowing; it fades while the soap works
    const flowA = span(t, 0.6, 9.8, 0.6, 0.6) + span(t, 39.6, 48.5, 0.6, 0.01);
    withAlpha(intro, () => {
      // the grease scene dims behind the close-up
      const dimB = 1 - 0.55 * span(t, 9.4, 21.0, 0.8, 0.8);
      withAlpha(dimB, () => {
        flow(t, cam, B, flowA * (1 - cam.e));
        grease(t, cam, B);
      });
      plate(t, cam);
      withAlpha(dimB, () => {
        ctx.save(); ctx.translate(cam.ox, cam.oy); ctx.scale(cam.s, cam.s);
        for (const m of MOLS) {
          if (t < m.t0 - 0.05) continue;
          if (m === MOLS[9] && t < 21.1) continue;   // shown by the close-up until it joins
          const p = molPose(m, t, B);
          molecule(p.x, p.y, p.ang, t, m.seed, { alpha: p.on });
        }
        ctx.restore();
      });
      // name the players in A
      withAlpha(span(t, 1.6, 9.3, 0.4, 0.4), () => {
        const [gx, gy] = toScreen(cam, 432, 560);
        pill('GREASE', gx, gy - 6, C.amberDeep, C.white);
        pill('WATER', 150, 330, C.blue, C.white);
        font(600, 22); text('PLATE', 40, 752, { color: C.soft, spacing: '2px' });
      });
      micelleLabels(t, cam, B);
    });
    closeUp(t);
    // the plate shines once the grease has gone
    withAlpha(span(t, 43.4, 48.5, 0.5, 0.01), () => {
      for (const [x, d] of [[300, 0], [470, 0.5], [610, 1.0]]) {
        const u = seg(t, 43.6 + d, 44.6 + d);
        const r = 14 * Math.sin(Math.PI * u);
        if (r <= 0) continue;
        ctx.fillStyle = C.white;
        ctx.beginPath(); ctx.moveTo(x, PLATE_Y - r); ctx.quadraticCurveTo(x, PLATE_Y, x + r, PLATE_Y); ctx.quadraticCurveTo(x, PLATE_Y, x, PLATE_Y + r);
        ctx.quadraticCurveTo(x, PLATE_Y, x - r, PLATE_Y); ctx.quadraticCurveTo(x, PLATE_Y, x, PLATE_Y - r); ctx.fill();
      }
    });
    closing(t);
    header(t);
    captions(t);
  },
});
