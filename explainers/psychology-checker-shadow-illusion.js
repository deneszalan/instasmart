// Explainer for psychology-checker-shadow-illusion: two squares that look different are the same grey.
// Look: a neutral grey photo studio, a seamless backdrop under a soft key light. Our own drawing of the
// idea (not Adelson's picture): a 5 x 5 checkerboard seen from above at an angle, a terracotta cylinder,
// and its soft shadow. Jost for captions, IBM Plex Mono for the pixel values.
//
// Scene plan (57 s). Captions centred at y = 846; everything important above y = 930.
//  A  0.0–9.8   Hook. "Which square is darker: A or B?" / "A looks much darker than B. Yet they are the
//               same grey."
//  B  9.8–29.8  Proof. A bar of one grey joins A and B: no edge where it meets either square. A grey card
//               slides over everything but two holes: they match. The pixel values: 120, 120, 120 both.
//  C 29.8–46.6  Why. "Your brain isn't measuring light. It's judging surfaces." The shadow lifts, showing
//               what the brain infers: B a light square in shade, A a dark one in light.
//  D 46.6–57.0  Payoff: colour constancy helps in the real world; here it fools you. Adelson, MIT, 1995.
//
// The board is painted pixel by pixel (3 x 3 supersampled) from the constants below, so A and B really
// are identical: A is a dark square (DARK) in full light, B is a light square (LIGHT) in the shadow's
// umbra, where the light is multiplied by SHADE = DARK / LIGHT. Both come out at exactly DARK.
//
// Facts (Wikipedia, "Checker shadow illusion"): published by Edward H. Adelson, professor of vision
// science at MIT, in 1995; a checkerboard partly shadowed by another object; A appears darker than B, yet
// on the page they are identical (same ink, same pixels); it shows the context-dependent nature of colour
// perception. Wikipedia, "Color constancy": perceived colour stays relatively constant under varying
// illumination; the visual system estimates the illumination and discounts it to obtain the surface's
// "true color" (reflectance); the article's caption: constancy makes A appear darker than B.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TEXT = 'Jost', MONO = 'PlexMono';

const LIGHT = 218, DARK = 120, SHADE = DARK / LIGHT;
const C = {
  text: '#F5F4F1', textSoft: 'rgba(245,244,241,0.74)', amber: '#FFC46B', teal: '#9BE6DC',
  card: 'rgb(62,62,61)', cardInk: '#F5F4F1',
};
const grey = (v) => `rgb(${v},${v},${v})`;

const CUES = [
  [0.5, 4.6, 'Which square is darker: *A* or *B*?'],
  [4.8, 9.6, 'A looks much darker than B. Yet they are the *same grey*.'],
  [9.9, 14.8, 'Join them with a bar of one single grey.'],
  [15.0, 19.6, 'No edge appears where the bar meets either square.'],
  [19.8, 24.6, 'Now cover everything else. Through two holes, they match.'],
  [24.8, 29.6, `On screen, both are exactly ~RGB ${DARK}, ${DARK}, ${DARK}~.`],
  [30.0, 35.2, 'Your brain isn’t measuring light. It’s judging *surfaces*.'],
  [35.4, 40.8, 'It sees a *shadow* across the board, and discounts it.'],
  [41.0, 46.4, 'So B reads as a *light square in shade*, A as a *dark one in light*.'],
  [46.6, 51.6, 'This *colour constancy* helps in the real world. Here, it fools you.'],
  [51.8, 56.6, 'Edward Adelson of MIT published the original version in 1995.'],
];

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.text, ...opts });

// ---------- geometry: board square (u, v) to screen ----------
const O = [432, 282], E1 = [72, 38], E2 = [-72, 38], N = 5, THICK = 24;
const P = (u, v) => [O[0] + u * E1[0] + v * E2[0], O[1] + u * E1[1] + v * E2[1]];
const DET = E1[0] * E2[1] - E2[0] * E1[1];
const UV = (x, y) => [((x - O[0]) * E2[1] - (y - O[1]) * E2[0]) / DET, (E1[0] * (y - O[1]) - E1[1] * (x - O[0])) / DET];
const SQ_A = [0, 3], SQ_B = [3, 3];
const isLight = (i, j) => (i + j) % 2 === 0;

// The cylinder stands at CYL with radius R (board units); its shadow runs from S0 to S1, widening and
// softening with distance. Inside the umbra the light is exactly SHADE.
const CYL = [3.6, 1.4], R = 0.95, CYL_H = 214;
const S0 = CYL, S1 = [3.3, 3.75];
function sigma(u, v) {
  const dx = S1[0] - S0[0], dy = S1[1] - S0[1], L2 = dx * dx + dy * dy;
  const tau = clamp(((u - S0[0]) * dx + (v - S0[1]) * dy) / L2, 0, 1);
  const cx = S0[0] + tau * dx, cy = S0[1] + tau * dy, d = Math.hypot(u - cx, v - cy);
  const hw = 0.95 + 0.25 * tau, pw = 0.12 + 0.3 * tau;
  const a = hw - pw / 2, b = hw + pw / 2;
  if (d <= a) return SHADE;
  if (d >= b) return 1;
  const x = (d - a) / (b - a), s = x * x * (3 - 2 * x);
  return SHADE + (1 - SHADE) * s;
}

// ---------- the board, painted once per lighting ----------
function paintBoard(shadowOn) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const img = g.createImageData(W, H), d = img.data;
  const sig = shadowOn ? sigma : () => 1;
  const SS = 3;
  for (let y = 270; y < 720; y++) for (let x = 60; x < 806; x++) {
    let r = 0, cov = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
      const [u, v] = UV(px, py);
      if (u >= 0 && u < N && v >= 0 && v < N) {
        const base = isLight(Math.floor(u), Math.floor(v)) ? LIGHT : DARK;
        r += Math.round(base * sig(u, v)); cov++; continue;
      }
      // the two front faces of the board's thickness: below the edge v = N, and below the edge u = N
      let hit = false;
      for (const [edge, shadeFace] of [['v', 84], ['u', 66]]) {
        // find the drop dz (0..THICK) at which (px, py - dz) lies on the edge
        let lo = 0, hi = THICK, found = null;
        const at = (dz) => UV(px, py - dz);
        const f0 = at(0), f1 = at(THICK);
        const k0 = edge === 'v' ? f0[1] - N : f0[0] - N, k1 = edge === 'v' ? f1[1] - N : f1[0] - N;
        if (k0 >= 0 && k1 <= 0) {
          const dz = (k0 / (k0 - k1)) * THICK; const q = at(dz);
          const along = edge === 'v' ? q[0] : q[1];
          if (along >= 0 && along <= N) found = q;
        }
        if (found) { r += Math.round(shadeFace * sig(Math.min(found[0], N - 1e-6), Math.min(found[1], N - 1e-6))); cov++; hit = true; break; }
      }
    }
    if (!cov) continue;
    const p = (y * W + x) * 4, v = Math.round(r / cov);
    d[p] = v; d[p + 1] = v; d[p + 2] = v; d[p + 3] = Math.round((255 * cov) / (SS * SS));
  }
  g.putImageData(img, 0, 0);
  return c;
}

// ---------- the studio ----------
let BG = null, BOARD = null, BOARD_LIT = null;
function paintStudio() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const sweep = g.createLinearGradient(0, 0, 0, H);
  sweep.addColorStop(0, '#5D5D5C'); sweep.addColorStop(0.42, '#8A8A88'); sweep.addColorStop(0.62, '#7C7C7A'); sweep.addColorStop(1, '#4A4A49');
  g.fillStyle = sweep; g.fillRect(0, 0, W, H);
  const key = g.createRadialGradient(560, 300, 40, 520, 420, 640);
  key.addColorStop(0, 'rgba(255,253,248,0.22)'); key.addColorStop(1, 'rgba(255,253,248,0)');
  g.fillStyle = key; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, 470, 300, W / 2, 520, 820);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the board's soft shadow on the floor
  g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(20,20,20,0.45)';
  g.beginPath(); const pts = [P(0, 0), P(N, 0), P(N, N), P(0, N)].map(([x, y]) => [x - 18, y + 34]);
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore();
  const img = g.getImageData(0, 0, W, H), dd = img.data; let s = 7;
  for (let p = 0; p < dd.length; p += 4) { s = (s * 16807) % 2147483647; const n = ((s / 2147483647) - 0.5) * 6; dd[p] += n; dd[p + 1] += n; dd[p + 2] += n; }
  g.putImageData(img, 0, 0);
  return c;
}

function cylinder() {
  const [bx, by] = P(...CYL);
  const rx = Math.SQRT2 * 72 * R, ry = Math.SQRT2 * 38 * R, top = by - CYL_H;
  const body = ctx.createLinearGradient(bx - rx, 0, bx + rx, 0);
  body.addColorStop(0, '#5E2E1E'); body.addColorStop(0.45, '#8C4A31'); body.addColorStop(0.8, '#C27A57'); body.addColorStop(0.92, '#D99572'); body.addColorStop(1, '#9A5638');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.moveTo(bx - rx, top); ctx.lineTo(bx - rx, by); ctx.ellipse(bx, by, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(bx + rx, top); ctx.closePath(); ctx.fill();
  const lid = ctx.createLinearGradient(bx - rx, top - ry, bx + rx, top + ry);
  lid.addColorStop(0, '#B8704F'); lid.addColorStop(1, '#E3A988');
  ctx.fillStyle = lid; ctx.beginPath(); ctx.ellipse(bx, top, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,210,0.35)'; ctx.lineWidth = 2; ctx.stroke();
}

/** A parallelogram over square (i, j), inset by `inset` board units. */
function squarePath(i, j, inset = 0) {
  const pts = [P(i + inset, j + inset), P(i + 1 - inset, j + inset), P(i + 1 - inset, j + 1 - inset), P(i + inset, j + 1 - inset)];
  ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.closePath();
}
function label(ch, sq, a) {
  if (a <= 0) return;
  const [x, y] = P(sq[0] + 0.5, sq[1] + 0.32);
  k.alpha(a, () => {
    font(700, 46); ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(25,25,25,0.85)'; ctx.lineWidth = 7; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeText(ch, x, y); text(ch, x, y, { align: 'center', base: 'middle', color: '#FFFFFF' });
  });
}

// ---------- the proofs ----------
function bar(t) {
  const grow = eio(seg(t, 10.4, 12.4)), out = 1 - seg(t, 19.4, 20.0);
  if (grow <= 0 || out <= 0) return;
  const v = SQ_A[1] + 0.68, hw = 0.19, u0 = SQ_A[0] + 0.5, u1 = lerp(u0, SQ_B[0] + 0.5, grow);
  k.alpha(out, () => {
    ctx.fillStyle = grey(DARK);
    ctx.beginPath(); ctx.moveTo(...P(u0, v - hw)); ctx.lineTo(...P(u1, v - hw)); ctx.lineTo(...P(u1, v + hw)); ctx.lineTo(...P(u0, v + hw)); ctx.closePath(); ctx.fill();
  });
}
function mask(t) {
  const inn = eio(seg(t, 20.0, 21.2)), out = eio(seg(t, 28.8, 29.8));
  const off = (1 - inn) * -1150 + out * -1150;
  if (inn <= 0 || out >= 1) return;
  ctx.save(); ctx.translate(0, off);
  ctx.fillStyle = C.card;
  ctx.beginPath(); ctx.rect(0, 0, W, H); squarePath(...SQ_A, 0.16); squarePath(...SQ_B, 0.16); ctx.fill('evenodd');
  // a thin bevel on the holes
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); squarePath(...SQ_A, 0.16); squarePath(...SQ_B, 0.16); ctx.stroke();
  const vals = eout(seg(t, 25.0, 25.8));
  k.alpha(vals, () => {
    for (const [sq, ch] of [[SQ_A, 'A'], [SQ_B, 'B']]) {
      const [x, y] = P(sq[0] + 0.5, sq[1] + 1.0);
      font(700, 40); text(ch, x, y + 52, { align: 'center', color: C.cardInk });
      font(600, 28, MONO); text(`${DARK}, ${DARK}, ${DARK}`, x, y + 92, { align: 'center', color: C.cardInk });
    }
    font(600, 26, MONO); text('red, green, blue values of every pixel', W / 2, 250, { align: 'center', color: C.textSoft });
  });
  ctx.restore();
}

// ---------- the inference: the shadow lifts ----------
const lift = (t) => eio(seg(t, 36.4, 38.0)) * (1 - eio(seg(t, 44.6, 46.0)));
function inferenceTags(t) {
  const a = span(t, 41.2, 46.2, 0.5, 0.4);
  if (a <= 0) return;
  k.alpha(a, () => {
    const [ax, ay] = P(SQ_A[0] + 0.5, SQ_A[1] + 0.55);
    const [bx, by] = P(SQ_B[0] + 0.55, SQ_B[1] + 0.75);
    ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.fillStyle = C.amber;
    ctx.beginPath(); ctx.moveTo(200, 330); ctx.lineTo(ax, ay - 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(560, 716); ctx.lineTo(bx + 8, by + 10); ctx.stroke();
    for (const [x, y] of [[ax, ay - 34], [bx + 8, by + 10]]) { ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
    font(600, 32); text('a dark square, in light', 200, 318, { align: 'center', color: C.amber });
    text('a light square, in shade', 600, 750, { align: 'center', color: C.amber });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((x) => ctx.measureText(x.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const x of words) { if (lw + x > maxW && any) { n++; lw = 0; } lw += x + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 850, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.text, marks: { '*': C.amber, '~': C.teal } });
  }
}

Kit.scene({
  width: W, height: H, duration: 57,
  fonts: [
    { family: TEXT, file: 'Jost.woff2', weight: '100 900' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) { BG = paintStudio(); BOARD = paintBoard(true); BOARD_LIT = paintBoard(false); }
    ctx.drawImage(BG, 0, 0);
    font(600, 22); text('RECKON · PSYCHOLOGY', 60, 80, { color: C.textSoft, spacing: '3px' });
    const on = eout(seg(t, 0.0, 1.0));
    k.alpha(on, () => {
      ctx.drawImage(BOARD, 0, 0);
      const l = lift(t);
      if (l > 0) k.alpha(l, () => ctx.drawImage(BOARD_LIT, 0, 0));
      cylinder();
    });
    const tag = eout(seg(t, 1.0, 1.8)) * (1 - seg(t, 19.6, 20.0) + seg(t, 29.6, 30.2));
    label('A', SQ_A, Math.min(1, tag)); label('B', SQ_B, Math.min(1, tag));
    bar(t);
    const li = lift(t);
    if (li > 0) k.alpha(li, () => { font(600, 30); text('what your brain infers', W / 2, 168, { align: 'center', color: C.amber, spacing: '1px' }); });
    inferenceTags(t);
    mask(t);
    captions(t);
  },
});
