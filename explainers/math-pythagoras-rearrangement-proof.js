// Explainer for math-pythagoras-rearrangement-proof: four copies of a right triangle, slid around
// inside a square of side a + b, show that c² = a² + b².
// Look: chalk on a dark green-grey slate board with eraser smudges and a wooden chalk ledge; lines
// drawn with rough, layered chalk strokes, areas hatched in coloured chalk (pink a², blue b², yellow
// c²). Patrick Hand for captions and labels, Cardo Italic for the letters a, b, c.
//
// Scene plan (53.5 s). Captions centred at y = 836; everything important above y = 930.
//  A  0.0–14.8  Hook. A right triangle with its three squares; "a² + b² = c²". "But why?" Four
//               copies of the triangle appear.
//  B 14.6–23.6  The four copies slide together inside a square of side a + b (a = 190, b = 310 px);
//               the gap in the middle is a tilted square with side c: c².
//  C 23.4–38.6  The triangles slide (translations only) one at a time; the gap becomes two squares,
//               b² top left and a² bottom right. Then both pictures side by side: c² = a² + b².
//  D 38.4–53.5  History: a chalk timeline from 2000 BC to 200 BC: the Old Babylonian period
//               (20th–16th centuries BC) with a clay tablet (Plimpton 322, about 1800 BC), Pythagoras
//               born about 570 BC, Euclid's Elements about 300 BC.
//
// Facts (Wikipedia, "Pythagorean theorem"): the rearrangement proof with two squares of side a + b,
// four triangles and a central square of side c (area 2ab + c² = 2ab + a² + b²); Pythagoras born
// around 570 BC; the date of first discovery and of the first proof is uncertain; the rule was in
// widespread use in the Old Babylonian period (20th to 16th centuries BC), over a thousand years
// before Pythagoras was born; Plimpton 322, about 1800 BC; Euclid's Elements, around 300 BC, has
// the oldest extant axiomatic proof. All geometry below is computed from a and b.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  slate0: '#18221F', slate1: '#22302C', slate2: '#2B3B36',
  chalk: '#F1EEE4', chalkSoft: 'rgba(241,238,228,0.72)', chalkDim: 'rgba(241,238,228,0.48)',
  pink: '#F4A6B8', blue: '#9ED4F2', yellow: '#F6E27F', green: '#AEE6A6', wood: '#5A3E26',
};
const HAND = 'Patrick Hand', ITAL = 'Cardo';

let k, ctx;
const font = (size, family = HAND, weight = 400) => k.font(weight, size, family);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (x) => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- chalk helpers ----------
/** Chalky text: a soft under-layer and a crisp top layer. */
function chalkText(s, x, y, { color = C.chalk, size = 30, family = HAND, align = 'left', base = 'alphabetic' } = {}) {
  font(size, family);
  ctx.textAlign = align; ctx.textBaseline = base;
  ctx.fillStyle = color;
  ctx.globalAlpha *= 0.35; ctx.fillText(s, x + 0.8, y + 0.7); ctx.fillText(s, x - 0.6, y - 0.4); ctx.globalAlpha /= 0.35;
  ctx.globalAlpha *= 0.92; ctx.fillText(s, x, y); ctx.globalAlpha /= 0.92;
}
/** A rough chalk line along points, drawn up to `p` (0..1) of its length. */
function chalkLine(pts, { color = C.chalk, width = 4, p = 1, seed = 1 } = {}) {
  if (p <= 0) return;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = lens.at(-1), stop = total * clamp(p);
  const sub = [];
  for (let i = 0; i < pts.length; i++) {
    if (lens[i] <= stop) { sub.push(pts[i]); continue; }
    const f = (stop - lens[i - 1]) / (lens[i] - lens[i - 1]);
    sub.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break;
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  for (let pass = 0; pass < 3; pass++) {
    const j = (pass - 1) * 0.9;
    ctx.globalAlpha *= pass === 1 ? 0.95 : 0.35;
    ctx.lineWidth = pass === 1 ? width : width * 0.8;
    ctx.beginPath();
    sub.forEach(([x, y], i) => { const dx = j + (hash(seed + i * 7.1 + pass) - 0.5) * 0.8, dy = -j * 0.6; i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy); });
    ctx.stroke();
    ctx.globalAlpha /= pass === 1 ? 0.95 : 0.35;
  }
}
const closed = (poly) => [...poly, poly[0]];
/** Hatched chalk fill of a polygon. */
function chalkFill(poly, color, a = 1, angle = 0.8, gap = 9) {
  if (a <= 0) return;
  withAlpha(a, () => {
    ctx.save();
    ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = color; ctx.globalAlpha *= 0.16; ctx.fill(); ctx.globalAlpha /= 0.16;
    ctx.clip();
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.globalAlpha *= 0.42;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    for (let d = -R; d <= R; d += gap) {
      ctx.beginPath();
      ctx.moveTo(cx + ca * -R - sa * d, cy + sa * -R + ca * d);
      ctx.lineTo(cx + ca * R - sa * d, cy + sa * R + ca * d);
      ctx.stroke();
    }
    ctx.restore();
  });
}
/** Solid slate patch (so a shape hides what is behind it). */
function slateFill(poly) {
  ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.fillStyle = C.slate1; ctx.fill();
}
const centroid = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

// ---------- timeline ----------
const T = { A: [0, 14.7], B: [14.7, 23.5], C: [23.5, 38.6], D: [38.4, 53.5] };
const CUES = [
  [0.4, 5.0, 'Every right triangle obeys one rule: *a²* + ~b²~ = ^c²^.'],
  [5.1, 11.0, 'The squares on the two short sides add up to the square on the long side.'],
  [11.1, 14.6, 'But why? Take four copies of the triangle…'],
  [14.7, 18.8, '…and fit them inside a square with sides *a* + ~b~.'],
  [18.9, 23.4, 'The gap left in the middle is a tilted square: ^c²^.'],
  [23.5, 28.4, 'Now slide the same four triangles. They don’t turn or change size.'],
  [28.5, 32.8, 'The gap is now two squares: *a²* and ~b²~.'],
  [32.9, 38.6, 'Same big square, same four triangles, so the gaps match: ^c²^ = *a²* + ~b²~.'],
  [38.7, 44.2, 'In Babylon, the rule was in wide use over 1,000 years before Pythagoras was born.'],
  [44.3, 47.6, 'Who first proved it is unknown.'],
  [47.7, 53.2, 'The oldest surviving formal proof is in *Euclid’s Elements*, about 300 BC.'],
];

// ---------- the board ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 420, 60, W / 2, 480, 820);
  rad.addColorStop(0, C.slate2); rad.addColorStop(0.55, C.slate1); rad.addColorStop(1, C.slate0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(31);
  // eraser smudges
  g.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * 960, len = 120 + rnd() * 320, a = (rnd() - 0.5) * 0.6;
    g.strokeStyle = `rgba(230,240,235,${0.012 + rnd() * 0.022})`; g.lineWidth = 30 + rnd() * 60;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + (rnd() - 0.5) * 60, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  // ghosts of old writing
  g.fillStyle = 'rgba(241,238,228,0.035)'; g.font = '40px serif';
  for (const [s, x, y] of [['x² − 1', 610, 250], ['π r²', 120, 560], ['√2', 700, 640], ['3 4 5', 90, 300]]) g.fillText(s, x, y);
  // grain
  for (let i = 0; i < 3200; i++) { g.fillStyle = `rgba(255,255,255,${0.01 + rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * H, 1.4, 1.4); }
  // frame and chalk ledge
  g.fillStyle = C.wood; g.fillRect(0, 1004, W, 76);
  const wg = g.createLinearGradient(0, 1004, 0, 1080);
  wg.addColorStop(0, 'rgba(255,220,180,0.18)'); wg.addColorStop(1, 'rgba(0,0,0,0.4)');
  g.fillStyle = wg; g.fillRect(0, 1004, W, 76);
  for (const [x, w, col] of [[560, 64, '#F1EEE4'], [640, 48, '#F4A6B8'], [700, 40, '#9ED4F2']]) { g.fillStyle = col; g.beginPath(); g.roundRect(x, 1012, w, 12, 6); g.fill(); }
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function header() {
  chalkText('RECKON', 64, 84, { color: C.yellow, size: 28 });
  font(28); const rw = ctx.measureText('RECKON').width;
  chalkText('math · geometry', 64 + rw + 18, 84, { color: C.chalkSoft, size: 28 });
}

// ---------- A: the classic picture ----------
const HA = 150, HB = 245; // the hook triangle's legs (same shape as the proof's 190 : 310)
const H0 = [290, 500]; // its right angle
function hookFigure(t) {
  const [x, y] = H0;
  const A = [x, y - HA], B = [x + HB, y], R = [x, y];
  const tri = [R, B, A];
  const d1 = eio(seg(t, 0.4, 1.6));
  slateFill(tri);
  chalkFill(tri, C.chalk, d1 * 0.6, 0.8);
  chalkLine(closed(tri), { width: 5, p: d1, seed: 3 });
  // right-angle mark
  withAlpha(seg(t, 1.4, 1.8), () => chalkLine([[x, y - 18], [x + 18, y - 18], [x + 18, y]], { width: 3, seed: 5 }));
  // squares on each side
  const sqA = [[x - HA, y - HA], [x, y - HA], [x, y], [x - HA, y]];
  const sqB = [[x, y], [x + HB, y], [x + HB, y + HB], [x, y + HB]];
  const n = [HA, -HB]; // outward normal of the hypotenuse, scaled to its length (from A to B is (HB, HA))
  const sqC = [A, B, [B[0] + n[0], B[1] + n[1]], [A[0] + n[0], A[1] + n[1]]];
  const sq = [[sqA, C.pink, 2.0, '*a²*'], [sqB, C.blue, 2.8, 'b²'], [sqC, C.yellow, 3.6, 'c²']];
  for (const [poly, col, t0, lab] of sq) {
    const p = eio(seg(t, t0, t0 + 0.9));
    chalkFill(poly, col, seg(t, t0 + 0.6, t0 + 1.2) * 0.9, 0.8);
    chalkLine(closed(poly), { color: col, width: 4, p, seed: t0 * 10 });
    withAlpha(seg(t, t0 + 0.7, t0 + 1.1), () => {
      const [cx, cy] = centroid(poly);
      chalkText(lab.replace(/\*/g, ''), cx, cy, { color: col, size: lab === 'c²' ? 64 : 50, family: ITAL, align: 'center', base: 'middle' });
    });
  }
  // side letters
  withAlpha(seg(t, 1.6, 2.0), () => {
    const hc = Math.hypot(HA, HB), nx = -HA / hc, ny = HB / hc; // from the hypotenuse towards the right angle
    chalkText('a', x + 18, y - HA * 0.42, { color: C.pink, size: 36, family: ITAL, base: 'middle' });
    chalkText('b', x + HB * 0.72, y - 18, { color: C.blue, size: 36, family: ITAL, align: 'center', base: 'middle' });
    chalkText('c', (A[0] + B[0]) / 2 + nx * 24, (A[1] + B[1]) / 2 + ny * 24, { color: C.yellow, size: 36, family: ITAL, align: 'center', base: 'middle' });
  });
  // the equation
  withAlpha(seg(t, 4.4, 5.0), () => equation(680, 640, 48));
}
function equation(cx, cy, size, a = 1) {
  withAlpha(a, () => {
    font(size, ITAL);
    const parts = [['c²', C.yellow], [' = ', C.chalk], ['a²', C.pink], [' + ', C.chalk], ['b²', C.blue]];
    const w = parts.reduce((s, [p]) => s + ctx.measureText(p).width, 0);
    let x = cx - w / 2;
    for (const [p, col] of parts) { chalkText(p, x, cy, { color: col, size, family: ITAL, base: 'middle' }); font(size, ITAL); x += ctx.measureText(p).width; }
  });
}

// ---------- the proof square ----------
const A_ = 190, B_ = 310, S = A_ + B_;
const SQ = { x: 182, y: 186 };
// the four triangles in the first arrangement (square coordinates, y down) ...
const TRIS = [
  { name: 'TL', pts: [[0, 0], [B_, 0], [0, A_]], move: [0, B_], slide: [27.4, 28.8] },
  { name: 'TR', pts: [[S, 0], [S, B_], [B_, 0]], move: [0, 0], slide: null },
  { name: 'BR', pts: [[S, S], [A_, S], [S, B_]], move: [-A_, 0], slide: [25.8, 27.2] },
  { name: 'BL', pts: [[0, S], [0, A_], [A_, S]], move: [B_, -A_], slide: [24.0, 25.6] },
];
// ... and the tilted square between them
const HOLE = [[B_, 0], [S, B_], [A_, S], [0, A_]];
const C_ = Math.hypot(A_, B_);

/** Draw a proof square at (ox, oy) with scale sc. f(tri) gives each triangle's slide progress 0..1. */
function proofSquare(ox, oy, sc, slideOf, opts = {}) {
  const P = ([x, y]) => [ox + x * sc, oy + y * sc];
  const { holeC = 0, holeAB = 0, explode = 0, labels = 0, frame = 1 } = opts;
  // the big square
  chalkLine(closed([[0, 0], [S, 0], [S, S], [0, S]].map(P)), { width: 5 * Math.max(0.7, sc), p: frame, seed: 11 });
  // the gaps
  chalkFill(HOLE.map(P), C.yellow, holeC, 0.8);
  if (holeC > 0) withAlpha(holeC, () => chalkLine(closed(HOLE.map(P)), { color: C.yellow, width: 3.5 * sc + 1, seed: 21 }));
  const sqB = [[0, 0], [B_, 0], [B_, B_], [0, B_]], sqA = [[B_, B_], [S, B_], [S, S], [B_, S]];
  chalkFill(sqB.map(P), C.blue, holeAB, 0.8);
  chalkFill(sqA.map(P), C.pink, holeAB, 0.8);
  // the triangles
  for (const tr of TRIS) {
    const f = slideOf(tr);
    const [cx, cy] = centroid(tr.pts), [qx, qy] = [S / 2, S / 2];
    const ex = (cx - qx) * 0.3 * explode, ey = (cy - qy) * 0.3 * explode;
    const pts = tr.pts.map(([x, y]) => P([x + tr.move[0] * f + ex, y + tr.move[1] * f + ey]));
    slateFill(pts);
    chalkFill(pts, C.chalk, 0.5, 2.3, 11);
    chalkLine(closed(pts), { width: 4 * Math.max(0.7, sc), seed: tr.name.charCodeAt(0) + tr.name.charCodeAt(1) });
  }
  // labels
  if (labels > 0) withAlpha(labels, () => {
    const L = (s, x, y, col, size = 36) => { const [px, py] = P([x, y]); chalkText(s, px, py, { color: col, size: size * Math.max(0.65, sc), family: ITAL, align: 'center', base: 'middle' }); };
    if (opts.edge) {
      L('b', B_ / 2, -26, C.blue); L('a', B_ + A_ / 2, -26, C.pink);
      L('a', -26, A_ / 2, C.pink); L('b', -26, A_ + B_ / 2, C.blue);
    }
  });
  if (holeC > 0.05) withAlpha(holeC, () => { const [px, py] = P([S / 2, S / 2]); chalkText('c²', px, py, { color: C.yellow, size: 76 * Math.max(0.6, sc), family: ITAL, align: 'center', base: 'middle' }); });
  if (holeAB > 0.05) withAlpha(holeAB, () => {
    let [px, py] = P([B_ / 2, B_ / 2]); chalkText('b²', px, py, { color: C.blue, size: 70 * Math.max(0.6, sc), family: ITAL, align: 'center', base: 'middle' });
    [px, py] = P([B_ + A_ / 2, B_ + A_ / 2]); chalkText('a²', px, py, { color: C.pink, size: 60 * Math.max(0.6, sc), family: ITAL, align: 'center', base: 'middle' });
  });
}

function sceneA(t) {
  withAlpha(1 - eio(seg(t, 10.8, 11.6)), () => hookFigure(t));
  // four copies appear, spread out where they will go
  withAlpha(eout(seg(t, 11.6, 12.0)), () => {
    proofSquare(SQ.x, SQ.y, 1, () => 0, { explode: 1, frame: 0 });
    // count them
    TRIS.forEach((tr, i) => withAlpha(seg(t, 12.0 + i * 0.4, 12.4 + i * 0.4) * (1 - seg(t, 14.1, 14.6)), () => {
      const [cx, cy] = centroid(tr.pts);
      const x = SQ.x + cx + (cx - S / 2) * 0.3, y = SQ.y + cy + (cy - S / 2) * 0.3;
      chalkText(String(i + 1), x, y, { color: C.green, size: 40, align: 'center', base: 'middle' });
    }));
  });
}
function sceneB(t) {
  const ex = 1 - eio(seg(t, 14.9, 16.8));
  proofSquare(SQ.x, SQ.y, 1, () => 0, { explode: ex, frame: eio(seg(t, 16.4, 17.6)), holeC: seg(t, 19.2, 20.2) * (1 - seg(t, 23.0, 23.5)), labels: seg(t, 17.2, 17.8), edge: true });
  // the c sides
  withAlpha(seg(t, 20.4, 21.0) * (1 - seg(t, 23.0, 23.5)), () => {
    const mid = (p, q) => [SQ.x + (p[0] + q[0]) / 2, SQ.y + (p[1] + q[1]) / 2];
    for (let i = 0; i < 4; i++) {
      const [x, y] = mid(HOLE[i], HOLE[(i + 1) % 4]);
      const dx = x - (SQ.x + S / 2), dy = y - (SQ.y + S / 2), d = Math.hypot(dx, dy);
      chalkText('c', x - (dx / d) * 30, y - (dy / d) * 30, { color: C.yellow, size: 34, family: ITAL, align: 'center', base: 'middle' });
    }
  });
}
// slide progress for each triangle
const slideP = (t) => (tr) => (tr.slide ? eio(seg(t, tr.slide[0], tr.slide[1])) : 0);
const SMALL = 0.5;
const LEFT = { x: 100, y: 236 }, RIGHT = { x: 514, y: 236 };
function sceneC(t) {
  const shrink = eio(seg(t, 33.0, 34.4));
  // the moving square shrinks to the right; its twin (first arrangement) comes in on the left
  const ox = lerp(SQ.x, RIGHT.x, shrink), oy = lerp(SQ.y, RIGHT.y, shrink), sc = lerp(1, SMALL, shrink);
  proofSquare(ox, oy, sc, slideP(t), { holeAB: seg(t, 28.9, 29.7), labels: 1 - seg(t, 23.6, 24.0), edge: true });
  withAlpha(seg(t, 34.0, 34.8), () => {
    proofSquare(LEFT.x, LEFT.y, SMALL, () => 0, { holeC: 1 });
    font(76, ITAL);
    chalkText('=', (LEFT.x + S * SMALL + RIGHT.x) / 2, LEFT.y + (S * SMALL) / 2, { color: C.chalk, size: 76, family: ITAL, align: 'center', base: 'middle' });
    chalkText('same square, same four triangles', W / 2, LEFT.y + S * SMALL + 50, { color: C.chalkSoft, size: 30, align: 'center', base: 'middle' });
  });
  withAlpha(seg(t, 35.2, 36.0), () => equation(W / 2, 640, 84));
  // motion hint arrows while sliding
  for (const tr of TRIS) {
    if (!tr.slide) continue;
    withAlpha(span(t, tr.slide[0] - 0.3, tr.slide[1] + 0.2, 0.25, 0.3), () => {
      const [cx, cy] = centroid(tr.pts);
      const x0 = SQ.x + cx, y0 = SQ.y + cy, x1 = x0 + tr.move[0], y1 = y0 + tr.move[1];
      ctx.setLineDash([10, 10]);
      chalkLine([[x0, y0], [x1, y1]], { color: C.green, width: 3, seed: 40 });
      ctx.setLineDash([]);
      const a = Math.atan2(y1 - y0, x1 - x0);
      chalkLine([[x1 - Math.cos(a - 0.5) * 18, y1 - Math.sin(a - 0.5) * 18], [x1, y1], [x1 - Math.cos(a + 0.5) * 18, y1 - Math.sin(a + 0.5) * 18]], { color: C.green, width: 3, seed: 41 });
    });
  }
}

// ---------- D: history ----------
const TL = { x0: 92, x1: 772, y: 560, from: 2000, to: 200 }; // years BC
const YX = (bc) => lerp(TL.x0, TL.x1, (TL.from - bc) / (TL.from - TL.to));
function tablet(x, y, w, h, p) {
  // a clay tablet with rows of wedge marks
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, 'rgba(214,170,120,0.85)'); g.addColorStop(1, 'rgba(150,104,64,0.85)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill();
  chalkLine(closed([[x + 8, y], [x + w - 8, y + 2], [x + w, y + h - 6], [x + 4, y + h]]), { color: C.chalk, width: 3, seed: 61 });
  ctx.fillStyle = 'rgba(70,40,20,0.75)';
  const rows = 6, n = 7;
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
    if ((r * n + i) / (rows * n) > p) continue;
    const wx = x + 22 + i * ((w - 44) / (n - 1)) + (hash(r * 9 + i) - 0.5) * 6, wy = y + 24 + r * ((h - 48) / (rows - 1));
    ctx.beginPath(); ctx.moveTo(wx - 6, wy - 6); ctx.lineTo(wx + 6, wy - 6); ctx.lineTo(wx, wy + 8); ctx.closePath(); ctx.fill();
  }
}
function sceneD(t) {
  const draw = eio(seg(t, 38.8, 40.2));
  chalkLine([[TL.x0, TL.y], [TL.x1, TL.y]], { width: 4, p: draw, seed: 71 });
  withAlpha(seg(t, 39.6, 40.2), () => {
    for (const bc of [2000, 1500, 1000, 500]) {
      const x = YX(bc);
      chalkLine([[x, TL.y - 8], [x, TL.y + 8]], { width: 3, seed: bc });
      chalkText(`${bc} BC`, x, TL.y + 40, { color: C.chalkDim, size: 26, align: 'center', base: 'middle' });
    }
  });
  // the Old Babylonian period: 20th to 16th centuries BC
  withAlpha(seg(t, 40.0, 40.8), () => {
    const x0 = YX(2000), x1 = YX(1501);
    chalkFill([[x0, TL.y - 22], [x1, TL.y - 22], [x1, TL.y + 0], [x0, TL.y + 0]], C.pink, 1, 0.8, 7);
    chalkText('Old Babylonian period', (x0 + x1) / 2, TL.y - 44, { color: C.pink, size: 28, align: 'center', base: 'middle' });
    tablet(122, 214, 170, 200, seg(t, 40.4, 42.4));
    chalkText('Plimpton 322, about 1800 BC', 122 + 85, 446, { color: C.chalkSoft, size: 26, align: 'center', base: 'middle' });
    chalkLine([[YX(1800), 470], [YX(1800), 490]], { color: C.chalkDim, width: 2, seed: 73 });
  });
  // Pythagoras born
  withAlpha(seg(t, 41.4, 42.0), () => {
    const x = YX(570);
    chalkLine([[x, TL.y - 30], [x, TL.y + 12]], { color: C.yellow, width: 5, seed: 75 });
    chalkText('Pythagoras', x, TL.y - 96, { color: C.yellow, size: 32, align: 'center', base: 'middle' });
    chalkText('born about 570 BC', x, TL.y - 62, { color: C.yellow, size: 26, align: 'center', base: 'middle' });
  });
  // over a thousand years
  withAlpha(seg(t, 42.2, 43.0), () => {
    const x0 = YX(1800), x1 = YX(570), y = TL.y + 96, p = eio(seg(t, 42.2, 43.4));
    chalkLine([[x0, y], [lerp(x0, x1, p), y]], { color: C.green, width: 3, seed: 77 });
    if (p > 0.95) chalkLine([[x1 - 14, y - 10], [x1, y], [x1 - 14, y + 10]], { color: C.green, width: 3, seed: 78 });
    chalkText('over 1,000 years', (x0 + x1) / 2, y + 32, { color: C.green, size: 30, align: 'center', base: 'middle' });
  });
  // a question mark over who proved it
  withAlpha(span(t, 44.4, 47.8, 0.5, 0.5), () => chalkText('first proof: ?', YX(1100), 300, { color: C.chalk, size: 48, align: 'center', base: 'middle' }));
  // Euclid
  withAlpha(seg(t, 47.9, 48.6), () => {
    const x = YX(300);
    chalkLine([[x, TL.y - 30], [x, TL.y + 12]], { color: C.blue, width: 5, seed: 79 });
    chalkText('Euclid’s', x - 6, 330, { color: C.blue, size: 32, align: 'center', base: 'middle' });
    chalkText('Elements', x - 6, 366, { color: C.blue, size: 32, align: 'center', base: 'middle' });
    chalkText('about 300 BC', x - 6, 402, { color: C.blue, size: 26, align: 'center', base: 'middle' });
    // a little scroll
    chalkLine(closed([[x - 50, 238], [x + 38, 238], [x + 38, 296], [x - 50, 296]]), { color: C.blue, width: 3, seed: 81 });
    for (let i = 0; i < 3; i++) chalkLine([[x - 38, 254 + i * 14], [x + 26, 254 + i * 14]], { color: C.blue, width: 2, seed: 83 + i });
  });
  withAlpha(seg(t, 49.6, 50.4), () => {
    equation(470, 186, 56);
    chalkText('Source: Wikipedia, “Pythagorean theorem”', W / 2, 908, { color: C.chalkDim, size: 24, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
// Drawn here rather than with k.captions so that marked words (the letters a², b², c²) can use the
// italic maths font: Patrick Hand's superscripts are too small to read. Timings stay in CUES.
const CAP = { size: 48, lh: 60, maxW: 740 };
const MARKS = { '*': C.pink, '~': C.blue, '^': C.yellow };
const tokenCache = new Map();
function tokens(s) {
  if (tokenCache.has(s)) return tokenCache.get(s);
  const out = [];
  let mode = null;
  for (const raw of s.split(' ')) {
    let w = raw, tail = '', m = null;
    if (!mode && MARKS[w[0]]) { mode = w[0]; w = w.slice(1); }
    if (mode) { m = mode; const at = w.lastIndexOf(mode); if (at >= 0) { tail = w.slice(at + 1); w = w.slice(0, at); mode = null; } }
    out.push({ w, tail, m });
  }
  tokenCache.set(s, out);
  return out;
}
const tokFont = (tk) => (tk.m && /[²abc+]/.test(tk.w) && tk.w.length <= 3 ? [CAP.size * 1.08, ITAL] : [CAP.size, HAND]);
function tokWidth(tk) {
  const [size, fam] = tokFont(tk); font(size, fam);
  let w = ctx.measureText(tk.w).width;
  font(CAP.size); w += ctx.measureText(tk.tail).width;
  return w;
}
function layout(s) {
  const toks = tokens(s);
  font(CAP.size); const space = ctx.measureText(' ').width;
  const widths = toks.map(tokWidth);
  const wrap = (maxW) => { const lines = [[]]; let lw = 0; toks.forEach((tk, i) => { if (lw + widths[i] > maxW && lines.at(-1).length) { lines.push([]); lw = 0; } lines.at(-1).push(i); lw += widths[i] + space; }); return lines; };
  const n = wrap(CAP.maxW).length;
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (wrap(mid).length > n) lo = mid; else hi = mid; }
  return { toks, widths, space, lines: wrap(hi + 1) };
}
const layoutCache = new Map();
function captions(t) {
  for (const [a, b, s] of CUES) {
    if (t < a || t > b) continue;
    if (!layoutCache.has(s)) layoutCache.set(s, layout(s));
    const { toks, widths, space, lines } = layoutCache.get(s);
    const rise = (1 - eout(seg(t, a, a + 0.35))) * 22;
    withAlpha(span(t, a, b, 0.25, 0.2), () => {
      const top = 836 + rise - ((lines.length - 1) * CAP.lh) / 2;
      lines.forEach((line, li) => {
        const total = line.reduce((sum, i) => sum + widths[i], 0) + space * (line.length - 1);
        let x = W / 2 - total / 2;
        const y = top + li * CAP.lh;
        for (const i of line) {
          const tk = toks[i], [size, fam] = tokFont(tk);
          chalkText(tk.w, x, y, { color: tk.m ? MARKS[tk.m] : C.chalk, size, family: fam, base: 'middle' });
          font(size, fam); x += ctx.measureText(tk.w).width;
          if (tk.tail) { chalkText(tk.tail, x, y, { color: C.chalk, size: CAP.size, base: 'middle' }); font(CAP.size); x += ctx.measureText(tk.tail).width; }
          x += space;
        }
      });
    });
  }
}

Kit.scene({
  width: W, height: H, duration: 53.5,
  fonts: [
    { family: HAND, file: 'PatrickHand.woff2', weight: '400' },
    { family: ITAL, file: 'Cardo-Italic.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    header();
    const scenes = [[sceneA, T.A, 0, 0], [sceneB, T.B, 0, 0], [sceneC, T.C, 0, 0.35], [sceneD, T.D]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
