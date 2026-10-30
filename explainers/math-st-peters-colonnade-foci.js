// Explainer for math-st-peters-colonnade-foci (Roma): Gian Lorenzo Bernini's colonnades round St Peter's Square
// (1656–1667) are four rows of columns on arcs of circles, with each set of four columns on a radius. A disc in the
// paving between the obelisk and each fountain, inscribed "CENTRO DEL COLONNATO", marks the centre of the nearer
// colonnade, so from it every line of sight runs along a set and the four rows look like one. Look: a plan in
// travertine cream on a dark cardinal-plum ground, sight lines in turquoise, construction in gold, and a computed
// first-person view of the columns above the plan. Playfair Display for captions, Inter for labels.
//
// Facts:
// - vatican.va (augmented-reality pages "Centre of colonnade" and "Colonnade and statues of saints"): colonnade by
//   Gian Lorenzo Bernini for Pope Alexander VII (1655–1667), 1656–1667; 284 columns and 88 pillars in 4 rows;
//   columns 13 m high; 140 statues of saints, about 3.10 m, 1662–1703. Two round plaques mark the centre of the
//   northern and southern colonnades; standing on either, the four rows of columns appear to merge into a single row.
// - turismoroma.it, "Saint Peter's Square": "284 columns arranged radially in four rows"; 1656–1667; from the marked
//   point "the colonnade seems composed of a single row", the outer columns disappearing behind the inner row.
// - J.-M. Ginoux, J.-C. Golvin, R. Meucci, "On the Design of St. Peter's Square in Rome", Research Square preprint,
//   2026 (doi 10.21203/rs.3.rs-10455562/v1): a disc inscribed "centro del colonnato" between the obelisk and each
//   fountain is the centre of curvature of each colonnade (the distance from it to the colonnade is constant:
//   Wittkower, Gridgeman, Pinto, Kruft); the plan is Serlio's "ovato tondo", an oval of four circular arcs, not an
//   ellipse (Kitao 1974, Thieme, Seguí): two small circles round the discs, closed by two large arcs centred where
//   the small circles cross. Seguí's laser survey: discs 33.02 m from the obelisk, inner small circles of radius
//   66.04 m (so each passes through the other disc), inner oval 198.12 × 149.77 m; colonnade about 17 m deep
//   (Kitao); fountains about 59 m from the obelisk, not at the foci of any of the square's ellipses.
// - en.wikipedia.org "St. Peter's Square": the oval's long axis is parallel to the basilica's façade; colonnades four
//   columns deep, Tuscan order.
// Computed here: every column's place on the plan, every first-person view (by real angles from the eye, the nearer
// columns drawn over the farther), the large arcs of the oval, and the foci of an ellipse with the oval's axes.
// Schematic, said on screen: 35 sets of four per colonnade spanning ±68°, the four rows' radii, column width 1.5 m.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  Plan of the square: oval, obelisk, fountains, the two colonnades of four rows.
//  B  9.6–14.0  A walk across the square: the view above shows the rows sliding past each other.
//  C 14.2–23.2  The disc, its inscription; stepping onto it, the four rows close up into one.
//  D 23.4–37.0  Zoom: sets on radii from the disc, the front column hides three; the rows are circles round the disc.
//  E 37.2–41.6  From the obelisk, sight lines cut across the sets: the forest returns.
//  F 41.8–50.8  The second disc; the two circles and the wide arcs make the ovato tondo.
//  G 51.0–60.0  Not foci: an ellipse with the same axes has its foci elsewhere; the survey's 33 m and 66 m.
//  H 60.2–65.0  Back on the disc: a whole colonnade in single file.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  bg: '#231a22', bg2: '#33232f', ink: '#f6efe2', soft: 'rgba(246,239,226,0.74)', faint: 'rgba(246,239,226,0.2)',
  trav: '#efe4cc', row: ['#f3e9d2', '#cdb894', '#a48f6e', '#7d6c54'], cobble: '#3a2d36', cobble2: '#46363f',
  teal: '#4fd8c8', gold: '#f2bf4f', red: '#ff7a6b', sky1: '#5d4a63', sky2: '#c9a58c', ground: '#4a3a40', water: '#7fb4d6',
};
const SERIF = 'Playfair Display', SANS = 'Inter';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the square, in metres: origin at the obelisk, x towards the north colonnade, y towards the basilica ----------
const DISC = 33.02, R_IN = 66.04, DEPTH = 16.77, R_OUT = R_IN + DEPTH; // Seguí via Ginoux et al.; depth: vatican.va
const FOUNTAIN = 59.43, B_IN = 149.77 / 2; // the fountains' distance from the obelisk; the inner oval's half-width
const A_IN = DISC + R_IN; // half the inner oval's length: 99.06 m
const ROWS = [67.8, 71.8, 77.4, 81.4]; // schematic radii of the four rows, the middle passage wider
const SETS = 35, SPAN = 68 * DEG, COL_R = 0.75, COL_H = 13, EYE_H = 1.6; // schematic sets; columns 13 m (vatican.va)
// the oval's wide arcs: centred where the two inner circles cross, reaching the inner oval's half-width
const G_Y = Math.sqrt(R_IN * R_IN - DISC * DISC), R_BIG = B_IN + G_Y;
const FOCUS = Math.sqrt(A_IN * A_IN - B_IN * B_IN); // the foci of an ellipse with the inner oval's axes
if (Math.abs(R_IN - 2 * DISC) > 0.01 || Math.abs(2 * A_IN - 198.12) > 0.01 || FOCUS < FOUNTAIN) throw new Error('geometry');
const setAngle = (i) => -SPAN + (2 * SPAN * i) / (SETS - 1);
/** The columns of the colonnade centred on the disc at (side·DISC, 0), side +1 north, −1 south. */
const colonnade = (side) => {
  const out = [];
  for (let i = 0; i < SETS; i++) for (let r = 0; r < 4; r++) {
    const a = setAngle(i);
    out.push({ x: side * (DISC + ROWS[r] * Math.cos(a)), y: ROWS[r] * Math.sin(a), row: r, set: i });
  }
  return out;
};
const NORTH = colonnade(1), SOUTH = colonnade(-1);
const DISC_N = [DISC, 0], OBELISK = [0, 0];

// ---------- the camera: plan metres to canvas pixels ----------
const CAMS = {
  full: { s: 3.2, mx: 0, px: CX, py: 500 },
  split: { s: 2.6, mx: 55, px: CX, py: 578 },
  zoom: { s: 4.2, mx: 62, px: CX, py: 455 },
};
let cam = CAMS.full;
const camLerp = (a, b, f) => ({ s: lerp(a.s, b.s, f), mx: lerp(a.mx, b.mx, f), px: lerp(a.px, b.px, f), py: lerp(a.py, b.py, f) });
const P = (x, y) => [cam.px + (x - cam.mx) * cam.s, cam.py - y * cam.s];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'In 1656–1667 Gian Lorenzo Bernini built the colonnades of St Peter’s Square in Rome.'],
  [5.0, 9.4, 'They curve round an oval, *four rows* deep: 284 columns and 88 pillars in all.'],
  [9.6, 14.0, 'Walk across the square and the four rows slide past each other, a forest of columns.'],
  [14.2, 18.6, 'Between the obelisk and each fountain, a paving disc reads ~Centro del colonnato~.'],
  [18.8, 23.2, 'Stand on it and face the nearer colonnade: the four rows close up into *one*.'],
  [23.4, 27.8, 'Why? Each set of four columns stands on one straight line running out from the disc.'],
  [28.0, 32.4, 'Every sight line from the disc runs along a set: the front column hides the three behind.'],
  [32.6, 37.0, 'The rows are arcs of circles round the disc: it is the *centre* of the colonnade, as it says.'],
  [37.2, 41.6, 'From anywhere else, like the obelisk, sight lines cut across the sets: the gaps open.'],
  [41.8, 46.2, 'The square’s second disc is the centre of the opposite colonnade, and works the same way.'],
  [46.4, 50.8, 'Wider arcs join the two circles into an oval, an *ovato tondo*: a near-ellipse of circles.'],
  [51.0, 55.4, 'Guides often call the discs ^foci^, but each is the *centre* of a circle: that is the trick.'],
  [55.6, 60.0, `By one survey the discs are *${Math.round(2 * DISC)} m* apart: the radius of each colonnade’s inner circle.`],
  [60.2, 64.6, 'So from each disc, a whole colonnade of Bernini’s columns stands in single file.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(246,239,226,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1); }
}

// ---------- the plan ----------
function pill(str, x, y, col, align = 'center', size = 22) {
  font(700, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(35,26,34,0.88)'; k.rrect(x0 - 9, y - size * 0.75, w + 18, size * 1.5, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}
function ovalPath() {
  // the inner oval, anticlockwise on the plan: the small arcs round the discs (±60°) and the two wide arcs
  const a60 = Math.atan2(G_Y, DISC);
  const arc = (mx, my, r, p0, p1) => { const [x, y] = P(mx, my); ctx.arc(x, y, r * cam.s, -p0, -p1, true); };
  ctx.beginPath();
  arc(DISC, 0, R_IN, -a60, a60);
  arc(0, -G_Y, R_BIG, a60, Math.PI - a60);
  arc(-DISC, 0, R_IN, Math.PI - a60, Math.PI + a60);
  arc(0, G_Y, R_BIG, Math.PI + a60, TAU - a60);
  ctx.closePath();
}
function plan(a, { labels = 0, discs = 1 } = {}) {
  A(a, () => {
    // the paving: cobbles inside the oval, radiating travertine lines from the obelisk
    const [ox, oy] = P(0, 0);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(ox, oy, (A_IN + 1) * cam.s, (B_IN + 1) * cam.s, 0, 0, TAU); ctx.fillStyle = C.cobble; ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(239,228,204,0.16)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) { const t = (i * TAU) / 16; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(t) * 400 * cam.s, oy - Math.sin(t) * 400 * cam.s); ctx.stroke(); }
    ctx.restore();
    // the corridors to the basilica, straight walls widening towards it
    ctx.strokeStyle = C.row[1]; ctx.lineWidth = Math.max(3, 2.2 * cam.s);
    for (const sd of [-1, 1]) {
      const [x0, y0] = P(sd * 55, 66), [x1, y1] = P(sd * 61, 95);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    // the colonnades: a pale roof band and the four rows of columns
    for (const [side, cols] of [[1, NORTH], [-1, SOUTH]]) {
      const [dx, dy] = P(side * DISC, 0);
      ctx.beginPath();
      const a0 = side > 0 ? -SPAN : Math.PI - SPAN, a1 = side > 0 ? SPAN : Math.PI + SPAN;
      ctx.arc(dx, dy, (R_IN + 0.4) * cam.s, -a0, -a1, true); ctx.arc(dx, dy, (R_OUT - 0.4) * cam.s, -a1, -a0, false); ctx.closePath();
      ctx.fillStyle = 'rgba(239,228,204,0.10)'; ctx.fill();
      for (const c of cols) { const [x, y] = P(c.x, c.y); ctx.fillStyle = C.row[c.row]; ctx.beginPath(); ctx.arc(x, y, Math.max(1.6, COL_R * cam.s * 1.15), 0, TAU); ctx.fill(); }
    }
    // obelisk, fountains, discs
    ctx.fillStyle = C.trav; const os = Math.max(5, 3 * cam.s); ctx.fillRect(ox - os / 2, oy - os / 2, os, os);
    for (const sd of [-1, 1]) {
      const [fx, fy] = P(sd * FOUNTAIN, 0);
      ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(fx, fy, 3.2 * cam.s, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.trav; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (discs > 0) A(discs, () => {
      for (const sd of [-1, 1]) {
        const [dx, dy] = P(sd * DISC, 0);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(dx, dy, 5, 0, TAU); ctx.fill();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, TAU); ctx.stroke();
      }
    });
    if (labels > 0) A(labels, () => {
      font(600, 22);
      text('obelisk', ox, oy + 28, { align: 'center', base: 'middle', color: C.soft });
      const [fx, fy] = P(FOUNTAIN, 0), [gx] = P(-FOUNTAIN, 0);
      text('fountain', fx, fy - 30, { align: 'center', base: 'middle', color: C.water });
      text('fountain', gx, fy - 30, { align: 'center', base: 'middle', color: C.water });
      const [bx, by] = P(0, 95);
      text('↑ to St Peter’s Basilica', bx, by + 6, { align: 'center', base: 'middle', color: C.soft });
      const [nx, ny] = P(DISC + R_OUT + 2, 0), [sx] = P(-DISC - R_OUT - 2, 0);
      font(700, 22);
      text('N', nx - 4, ny - 150, { align: 'center', base: 'middle', color: C.soft });
      void sx;
    });
  });
}

// ---------- the view from an eye: real angles, farther columns first ----------
const VIEW = { x0: 40, x1: 824, y0: 112, y1: 360, hor: 336, fov: 24 * DEG };
const VPPD = (VIEW.x1 - VIEW.x0) / (2 * VIEW.fov); // pixels per radian
function lookAt(eye) { return Math.atan2(0 - eye[1], DISC + R_IN + DEPTH / 2 - eye[0]); }
function view(a, eye, { tag = '', tagCol = C.soft } = {}) {
  A(a, () => {
    const { x0, x1, y0, y1, hor } = VIEW, cx = (x0 + x1) / 2, look = lookAt(eye);
    ctx.save(); k.rrect(x0, y0, x1 - x0, y1 - y0, 14); ctx.clip();
    const sky = ctx.createLinearGradient(0, y0, 0, hor); sky.addColorStop(0, C.sky1); sky.addColorStop(1, C.sky2);
    ctx.fillStyle = sky; ctx.fillRect(x0, y0, x1 - x0, hor - y0);
    ctx.fillStyle = C.ground; ctx.fillRect(x0, hor, x1 - x0, y1 - hor);
    const cols = NORTH.map((c) => {
      const dx = c.x - eye[0], dy = c.y - eye[1], d = Math.hypot(dx, dy);
      let az = Math.atan2(dy, dx) - look; az = Math.atan2(Math.sin(az), Math.cos(az));
      return { ...c, d, az };
    }).filter((c) => Math.abs(c.az) < VIEW.fov + 4 * DEG).sort((p, q) => q.d - p.d);
    for (const c of cols) {
      const half = Math.asin(COL_R / c.d) * VPPD, x = cx - c.az * VPPD;
      const top = hor - Math.atan((COL_H - EYE_H) / c.d) * VPPD, bot = hor + Math.atan(EYE_H / c.d) * VPPD;
      const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
      g.addColorStop(0, C.row[c.row]); g.addColorStop(1, shade(C.row[c.row], 0.72));
      ctx.fillStyle = g; ctx.fillRect(x - half, top, 2 * half, bot - top);
      ctx.fillStyle = C.row[c.row];
      ctx.fillRect(x - half * 1.35, top - half * 0.5, half * 2.7, half * 0.55); // capital
      ctx.fillRect(x - half * 1.25, bot - half * 0.4, half * 2.5, half * 0.4); // base
    }
    ctx.restore();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; k.rrect(x0, y0, x1 - x0, y1 - y0, 14); ctx.stroke();
    if (tag) pill(tag, x0 + 16, y0 + 26, tagCol, 'left', 22);
    const n = visibleCount(cols);
    pill(`columns in view: ${n}`, x1 - 16, y0 + 26, n > 20 ? C.red : C.teal, 'right', 22);
  });
}
/** How many columns inside the view show at least a sliver: nearer columns cover the angles behind them. */
function visibleCount(cols) {
  const covered = [];
  let n = 0;
  for (const c of [...cols].sort((p, q) => p.d - q.d)) {
    const h = Math.asin(COL_R / c.d), lo = c.az - h, hi = c.az + h;
    if (hi < -VIEW.fov || lo > VIEW.fov) continue;
    let seen = false;
    for (let i = 0; i <= 8 && !seen; i++) { const x = lo + ((hi - lo) * (i + 0.5)) / 9.5; if (!covered.some(([a, b]) => x > a && x < b)) seen = true; }
    if (seen) n++;
    covered.push([lo, hi]);
  }
  return n;
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}
// the eye on the plan, with its field of view
function eyeMark(eye, a = 1, col = C.teal) {
  A(a, () => {
    const [x, y] = P(...eye), look = lookAt(eye), L = 26;
    ctx.fillStyle = 'rgba(79,216,200,0.16)'; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.arc(x, y, 60, -(look + VIEW.fov), -(look - VIEW.fov)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
    void L;
  });
}

// ---------- the disc's inscription, drawn round a ring ----------
function inscription(a, cx, cy, R) {
  A(a, () => {
    ctx.fillStyle = '#3c3a3e';
    ctx.beginPath(); ctx.arc(cx, cy, R + 18, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ece6dc'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.fillStyle = '#77736f'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.52, 0, TAU); ctx.fill();
    const s = 'CENTRO DEL COLONNATO'; font(600, Math.round(R * 0.2), SERIF);
    const spanA = 1.3 * Math.PI, step = spanA / (s.length - 1);
    for (let i = 0; i < s.length; i++) {
      const t = -Math.PI / 2 - spanA / 2 + i * step;
      ctx.save(); ctx.translate(cx + Math.cos(t) * R * 0.76, cy + Math.sin(t) * R * 0.76); ctx.rotate(t + Math.PI / 2);
      text(s[i], 0, 0, { align: 'center', base: 'middle', color: '#3a3330' }); ctx.restore();
    }
  });
}

// ---------- the eye's path ----------
const WALK = [[-6, -42], [12, -20]];
function eyeAt(t) {
  if (t < 9.8) return WALK[0];
  if (t < 14.0) { const f = eio(seg(t, 9.8, 14.0)); return [lerp(WALK[0][0], WALK[1][0], f), lerp(WALK[0][1], WALK[1][1], f)]; }
  if (t < 37.0) { const f = eio(seg(t, 16.0, 20.4)); return [lerp(WALK[1][0], DISC, f), lerp(WALK[1][1], 0, f)]; }
  if (t < 60.0) return OBELISK;
  return DISC_N;
}

// ---------- A: the plan of the square ----------
function sceneA(t) {
  const a = span(t, 0, 9.8, 0.5, 0.4);
  if (a <= 0) return;
  cam = CAMS.full;
  plan(a * seg(t, 0.2, 1.2), { labels: seg(t, 1.4, 2.2), discs: 0 });
  A(a * seg(t, 0.6, 1.4), () => { font(600, 22); text('ST PETER’S SQUARE · BERNINI · 1656–1667', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' }); });
  // four rows: a magnified slice of the north colonnade
  A(a * seg(t, 5.4, 6.2), () => {
    const c0 = NORTH.filter((c) => c.set === 17), [x0, y0] = P(c0[0].x, c0[0].y), [x3, y3] = P(c0[3].x, c0[3].y);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc((x0 + x3) / 2, (y0 + y3) / 2, 42, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((x0 + x3) / 2 - 40, (y0 + y3) / 2 + 12); ctx.lineTo(600, 596); ctx.stroke();
    pill('4 rows deep', 540, 612, C.gold);
    font(600, 22); text('284 columns · 88 pillars', 540, 648, { align: 'center', base: 'middle', color: C.soft });
  });
}

// ---------- B and C: the walk, the disc, the four rows becoming one ----------
function sceneBC(t) {
  const a = span(t, 9.6, 23.6, 0.5, 0.4);
  if (a <= 0) return;
  cam = camLerp(CAMS.full, CAMS.split, eio(seg(t, 9.6, 10.6)));
  const eye = eyeAt(t);
  plan(a, { labels: 0, discs: seg(t, 14.4, 15.0) });
  eyeMark(eye, a * seg(t, 10.0, 10.6));
  // the walker's sight lines to one set of four
  A(a * seg(t, 10.6, 11.2), () => {
    for (const c of NORTH.filter((c) => c.set === 21)) {
      const [ex, ey] = P(...eye), [x, y] = P(c.x, c.y);
      ctx.strokeStyle = 'rgba(79,216,200,0.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x, y); ctx.stroke();
    }
  });
  const aligned = seg(t, 19.4, 20.4);
  view(a * seg(t, 10.2, 10.9), eye, { tag: aligned >= 1 ? 'WHAT YOU SEE: ONE ROW' : 'WHAT YOU SEE', tagCol: aligned >= 1 ? C.teal : C.soft });
  // the disc and its inscription
  A(a * seg(t, 14.6, 15.4) * (1 - seg(t, 22.6, 23.2)), () => {
    const [dx, dy] = P(DISC, 0);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(dx + 12, dy + 4); ctx.lineTo(650, 600); ctx.stroke(); ctx.setLineDash([]);
    inscription(1, 724, 600, 86);
  });
  A(a * seg(t, 15.0, 15.6), () => {
    const [dx, dy] = P(DISC, 0);
    pill('disc', dx, dy + 34, C.gold);
  });
}

// ---------- D: lines from the disc ----------
const HL = 23; // the set picked out
function sceneD(t) {
  const a = span(t, 23.4, 37.4, 0.4, 0.4);
  if (a <= 0) return;
  cam = camLerp(CAMS.split, CAMS.zoom, eio(seg(t, 23.4, 24.6)));
  plan(a, { discs: 1 });
  const [dx, dy] = P(DISC, 0);
  // a ray from the disc through every set
  const f = eio(seg(t, 24.4, 26.6));
  A(a * (1 - 0.6 * seg(t, 28.0, 28.6)), () => {
    ctx.strokeStyle = 'rgba(242,191,79,0.7)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < SETS; i++) {
      const an = setAngle(i), L = lerp(0, ROWS[3] + 4, f);
      const [x, y] = P(DISC + L * Math.cos(an), L * Math.sin(an));
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(x, y); ctx.stroke();
    }
  });
  // one set: the line of sight passes all four, the front one hides the rest
  A(a * seg(t, 28.4, 29.2), () => {
    const an = setAngle(HL), set = NORTH.filter((c) => c.set === HL);
    const [x4, y4] = P(DISC + (ROWS[3] + 6) * Math.cos(an), (ROWS[3] + 6) * Math.sin(an));
    ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(x4, y4); ctx.stroke();
    set.forEach((c, i) => {
      const [x, y] = P(c.x, c.y);
      ctx.strokeStyle = i === 0 ? C.teal : C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.stroke();
    });
    const [fx, fy] = P(set[0].x, set[0].y), [bx, by] = P(set[3].x, set[3].y);
    A(seg(t, 29.4, 30.2), () => {
      pill('front column: seen', fx - 100, fy - 34, C.teal, 'right');
      ctx.strokeStyle = C.teal; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx - 96, fy - 34); ctx.lineTo(fx - 10, fy - 6); ctx.stroke();
      pill('3 behind: hidden', bx + 10, by - 52, C.soft, 'left');
    });
  });
  A(a * seg(t, 25.2, 26.0), () => pill('centro del colonnato', dx - 14, dy + 34, C.gold, 'right'));
  // the rows are arcs of circles centred on the disc
  A(a * seg(t, 32.8, 33.8), () => {
    ctx.setLineDash([8, 7]); ctx.lineWidth = 1.8;
    ROWS.forEach((r, i) => { ctx.strokeStyle = shade(C.row[i], 0.95); ctx.beginPath(); ctx.arc(dx, dy, r * cam.s, -SPAN - 0.5, SPAN + 0.5); ctx.stroke(); });
    ctx.setLineDash([]);
    const an = -SPAN - 0.25, [rx, ry] = P(DISC + ROWS[0] * Math.cos(an), ROWS[0] * Math.sin(an));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(rx, ry); ctx.stroke();
    pill('same centre', (dx + rx) / 2 - 20, (dy + ry) / 2 + 8, C.gold, 'right');
  });
}

// ---------- E: from the obelisk ----------
function sceneE(t) {
  const a = span(t, 37.2, 42.0, 0.4, 0.4);
  if (a <= 0) return;
  cam = camLerp(CAMS.zoom, CAMS.split, eio(seg(t, 37.2, 38.2)));
  plan(a, { discs: 1 });
  const eye = OBELISK;
  eyeMark(eye, a * seg(t, 37.6, 38.2));
  view(a * seg(t, 37.8, 38.6), eye, { tag: 'FROM THE OBELISK', tagCol: C.red });
  A(a * seg(t, 38.4, 39.4), () => {
    const [ex, ey] = P(...eye);
    for (const s of [HL - 1, HL]) for (const c of NORTH.filter((c) => c.set === s)) {
      const [x, y] = P(c.x, c.y);
      ctx.strokeStyle = 'rgba(255,122,107,0.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x, y); ctx.stroke();
    }
  });
}

// ---------- F and G: the second disc, the oval of circles, not foci ----------
function sceneFG(t) {
  const a = span(t, 41.8, 60.4, 0.4, 0.4);
  if (a <= 0) return;
  cam = CAMS.full;
  plan(a, { discs: 1 });
  const [nx, ny] = P(DISC, 0), [sx, sy] = P(-DISC, 0);
  // the south disc's rays
  const f = eio(seg(t, 42.4, 44.2));
  A(a * (1 - seg(t, 46.4, 47.0)), () => {
    ctx.strokeStyle = 'rgba(242,191,79,0.65)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < SETS; i += 2) {
      const an = Math.PI + setAngle(i), L = lerp(0, ROWS[3] + 3, f);
      const [x, y] = P(-DISC + L * Math.cos(an), L * Math.sin(an));
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke();
    }
    font(700, 22); text('second disc', sx, sy + 32, { align: 'center', base: 'middle', color: C.gold });
  });
  // the two full circles and the oval they make
  const c = seg(t, 46.8, 48.2);
  A(a * c * (1 - 0.5 * seg(t, 51.0, 51.6)), () => {
    ctx.setLineDash([7, 7]); ctx.strokeStyle = 'rgba(242,191,79,0.7)'; ctx.lineWidth = 2;
    for (const [x, y] of [[nx, ny], [sx, sy]]) { ctx.beginPath(); ctx.arc(x, y, R_IN * cam.s, 0, TAU * eio(c)); ctx.stroke(); }
    ctx.setLineDash([]);
  });
  A(a * seg(t, 48.4, 49.4), () => {
    ovalPath(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
    const [gx, gy] = P(0, -G_Y), [hx, hy] = P(0, G_Y);
    for (const [x, y] of [[gx, gy], [hx, hy]]) { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); }
    pill('ovato tondo', CX, P(0, B_IN)[1] - 32, C.gold, 'center', 24);
  });
  // not foci: an ellipse with the same axes, and where its foci would be
  A(a * seg(t, 51.4, 52.4) * (1 - seg(t, 55.4, 56.0)), () => {
    const [ox, oy] = P(0, 0);
    ctx.setLineDash([4, 6]); ctx.strokeStyle = C.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(ox, oy, A_IN * cam.s, B_IN * cam.s, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    for (const sd of [-1, 1]) {
      const [fx, fy] = P(sd * FOCUS, 0);
      ctx.strokeStyle = C.red; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(fx - 8, fy - 8); ctx.lineTo(fx + 8, fy + 8); ctx.moveTo(fx + 8, fy - 8); ctx.lineTo(fx - 8, fy + 8); ctx.stroke();
    }
    const [fx, fy] = P(FOCUS, 0);
    pill(`an ellipse’s focus: ${Math.round(FOCUS)} m out`, fx + 10, fy + 96, C.red, 'center', 21);
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx, fy + 12); ctx.lineTo(fx + 8, fy + 80); ctx.stroke();
    pill(`disc: ${Math.round(DISC)} m out`, nx - 6, ny - 92, C.gold, 'center', 21);
    ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(nx, ny - 12); ctx.lineTo(nx - 4, ny - 76); ctx.stroke();
  });
  // the survey: discs 66 m apart, the radius of each colonnade's inner circle
  A(a * seg(t, 55.8, 56.8), () => {
    const y = ny + 40;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(nx, y); ctx.stroke();
    for (const x of [sx, nx]) { ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.stroke(); }
    pill(`${Math.round(2 * DISC)} m`, CX, y + 30, C.ink);
    const an = -0.62, [rx, ry] = P(DISC + R_IN * Math.cos(an), R_IN * Math.sin(an));
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(rx, ry); ctx.stroke();
    pill(`${Math.round(R_IN)} m`, (nx + rx) / 2 + 40, (ny + ry) / 2 - 6, C.gold);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(nx, ny, R_IN * cam.s, Math.PI - 0.12, Math.PI + 0.12); ctx.stroke();
  });
}

// ---------- H: back on the disc ----------
function sceneH(t) {
  const a = span(t, 60.2, 65.0, 0.5, 0);
  if (a <= 0) return;
  cam = CAMS.split;
  plan(a, { discs: 1 });
  eyeMark(DISC_N, a);
  A(a * seg(t, 60.6, 61.6), () => {
    const [dx, dy] = P(DISC, 0);
    ctx.strokeStyle = 'rgba(79,216,200,0.7)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < SETS; i++) {
      const an = setAngle(i), [x, y] = P(DISC + (ROWS[3] + 3) * Math.cos(an), (ROWS[3] + 3) * Math.sin(an));
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(x, y); ctx.stroke();
    }
  });
  view(a, DISC_N, { tag: 'FROM THE DISC: ONE ROW', tagCol: C.teal });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneA(t);
    sceneBC(t);
    sceneD(t);
    sceneE(t);
    sceneFG(t);
    sceneH(t);
    if (t > 9.6) A(span(t, 9.6, 65.2), () => { font(500, 20); text('simplified plan', 40, 104, { base: 'middle', color: C.soft }); });
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 600, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.teal, '^': C.red } });
  },
});
