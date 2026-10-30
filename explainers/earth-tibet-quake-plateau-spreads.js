// Explainer for earth-tibet-quake-plateau-spreads: on 22 October 2026 at 10:33 pm local time a magnitude 7.0
// earthquake struck the north of Nagqu, on the Tibetan Plateau in China. India squeezes Tibet from the south, yet
// this quake pulled the crust apart: the plateau is so high that it spreads east-west under its own weight, like
// honey poured into a pile, and blocks drop down normal faults. Look: a high-plateau night of deep slate, rock in
// warm ochre and rust layers, honey gold for the spreading, glacier blue for India's push. Oswald for numbers and
// labels, Source Sans 3 for captions.
//
// Facts: USGS event page us6000u43g, "M 7.0 – 191 km ENE of Nagqu, China", tectonic summary (reviewed,
// 22 October 2026): magnitude 7 on the Tibetan Plateau on 22 October at 10:33 pm local time; normal faulting
// within the plateau; a crustal fault moderately dipping either to the northwest or southeast; India collides with
// and underthrusts Eurasia, driving uplift of the Himalaya and the plateau; the plateau is the highest in the world
// and extends to the east and west due to high gravitational potential energy; the normal faulting is consistent
// with this east-west extension, which is accommodated mainly by strike-slip and normal faulting; "analogous to
// how a pile of honey spreads flat after being poured from a bottle"; since 1900, 29 earthquakes of magnitude 7.0
// or larger within the plateau and its bounding regions; the sparsely populated region means impact varies with
// how close the rupture is to population; normal-faulting quakes of this size typically rupture about 50 km x 20 km.
// USGS moment tensor: nodal planes strike 175 / dip 57 and strike 40 / dip 43, rakes -119 and -54 (normal), depth
// about 17 km. USGS This Dynamic Earth, "The Himalayas: Two continents collide": India and Eurasia collided 40 to 50
// million years ago; Tibet presses on the land to the north; the plate may now be stretching out rather than
// thrusting up, with some subsidence due to gravity. Wikipedia, Tibetan Plateau: average elevation exceeding
// 4,500 m, world's largest and highest plateau, about 2.5 million km².
// Computed here: the honey pile is a spreading viscous mound whose cross-section keeps its area while it widens; the
// rock columns compare (without numbers) the rock above the same depth under the plateau and the lowland. The map
// and the cross-sections are schematic, and labelled so. Deaths and injuries are not shown.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.6  Hook: the quake on a schematic map; India pushes north, yet the ground was pulled apart.
//  B  9.6–14.2  A normal fault: the crust stretches, a block slides down a sloping crack.
//  C 14.2–28.0  Why: the plateau is high; honey spreads; more rock weighs down under the plateau.
//  D 28.0–41.8  Held north–south, free east–west: the plateau spreads sideways and cracks along north–south faults.
//  E 41.8–55.4  Locked faults slip in seconds; a 50 x 20 km patch; thrusts at the Himalaya, normal faults on top.
//  F 55.4–65.0  29 quakes of 7+ since 1900; squeezed and spreading at once.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#121820', bg1: '#1e2833', ink: '#f3eee6', soft: 'rgba(243,238,230,0.74)', faint: 'rgba(243,238,230,0.28)',
  line: 'rgba(243,238,230,0.16)', rock1: '#b5653c', rock2: '#8f4a2c', rock3: '#d39a5c', rock4: '#6e3a24',
  honey: '#f2b33d', honeyDeep: '#c98516', push: '#7cc4e8', pull: '#f2b33d', quake: '#ff6f59', panel: 'rgba(30,40,51,0.92)',
  low: '#5f7f63', snow: '#e9eef2',
};
const NUM = 'Oswald', CAP = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the facts ----------
const MAG = 7.0, PLATEAU_M = 4500, FAULT_L = 50, FAULT_W = 20, BIG_SINCE_1900 = 29, DIP = 57; // DIP: drawing angle (USGS: moderately dipping)

const CUES = [
  [0.4, 4.8, 'On 22 October 2026 a *magnitude 7.0* earthquake shook the Nagqu region of Tibet, in China.'],
  [5.0, 9.4, 'India pushes north into Asia, squeezing Tibet. Yet this quake ~pulled the ground apart~.'],
  [9.6, 14.0, 'It was a *normal fault*: as the crust is stretched, one block slides down a sloping crack.'],
  [14.2, 18.6, `Why stretch? The plateau is the world’s highest: on average over *${PLATEAU_M.toLocaleString('en-US')} metres* up.`],
  [18.8, 23.2, 'The US Geological Survey compares it to ~honey~: poured into a pile, it spreads flat.'],
  [23.4, 27.8, 'Deep down, the rock under a high plateau carries more weight than the rock under the lowlands.'],
  [28.0, 32.4, 'That weight pushes outward. To the north and south, India and Asia hold Tibet in.'],
  [32.6, 37.0, 'East and west, less holds it back, so the plateau spreads ~sideways~, east–west.'],
  [37.2, 41.6, 'Stretched that way, its crust cracks along faults that run *north–south*.'],
  [41.8, 46.2, 'Friction locks a fault while the stretch builds. When the stretch wins, it slips in seconds.'],
  [46.4, 50.8, `A quake this size slips a patch of fault about *${FAULT_L} km* long and *${FAULT_W} km* wide.`],
  [51.0, 55.4, 'At the plateau’s southern edge India slides under Asia on ^thrust^ faults, raising the Himalaya.'],
  [55.6, 60.0, `Since 1900, *${BIG_SINCE_1900}* earthquakes of magnitude 7 or more have struck the plateau and its edges.`],
  [60.2, 64.6, 'Squeezed from the south, spreading east and west: Tibet does both at once.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg0);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint contour lines, like a topographic map
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.strokeStyle = 'rgba(243,238,230,0.035)'; g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    const cx = r() * W, cy = r() * 760, R = 60 + r() * 220;
    for (let j = 0; j < 4; j++) {
      g.beginPath();
      for (let a = 0; a <= 64; a++) {
        const th = (a / 64) * Math.PI * 2, rr = R + j * 26 + 14 * Math.sin(th * 3 + i);
        const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr * 0.6;
        a ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }
}

// ---------- drawing helpers ----------
function panel(x, y, w, h, r = 18) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); }
function arrow(x0, y0, x1, y1, color, w = 6, head = 20) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head);
  ctx.closePath(); ctx.fill();
}
function poly(pts, fill, stroke, lw = 3) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function star(x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function ripple(x, y, t, t0, color) {
  for (let i = 0; i < 3; i++) {
    const u = ((t - t0) * 0.6 + i / 3) % 1;
    if (t < t0) return;
    ctx.strokeStyle = color; ctx.globalAlpha = 1 - u; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y, 20 + u * 90, (20 + u * 90) * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
function note(s, y = 770) { font(400, 19, CAP); text(s, W / 2, y, { color: C.faint, align: 'center' }); }

// ---------- A: a schematic map ----------
// Plateau outline (schematic), roughly: wide east-west, narrower north-south.
const PLATEAU = [[150, 330], [260, 270], [420, 255], [560, 262], [690, 300], [735, 380], [700, 450], [600, 480], [430, 495], [280, 480], [170, 430]];
const NAGQU = [505, 345];
function mapScene(t) {
  const a = span(t, 0, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 22); text('SCHEMATIC MAP', 60, 150, { color: C.faint, spacing: '3px' });
    // Asia around, India below
    poly([[40, 190], [824, 190], [824, 560], [40, 560]], 'rgba(95,127,99,0.16)');
    font(500, 26); text('ASIA', 760, 220, { color: C.soft, align: 'right', spacing: '4px' });
    const push = eio(seg(t, 5.2, 6.6));
    const iy = 640 - 26 * push;
    poly([[230, iy - 60], [470, iy - 70], [560, iy - 40], [500, iy + 70], [380, iy + 120], [300, iy + 60]], 'rgba(124,196,232,0.22)', C.push, 3);
    font(500, 26); text('INDIA', 400, iy + 30, { color: C.push, align: 'center', spacing: '4px' });
    poly(PLATEAU, 'rgba(211,154,92,0.30)', C.rock3, 3);
    font(500, 24); text('TIBETAN PLATEAU', 330, 420, { color: C.rock3, align: 'center', spacing: '3px' });
    // the epicentre
    A(seg(t, 0.8, 1.3), () => {
      ripple(NAGQU[0], NAGQU[1], t, 1.0, C.quake);
      star(NAGQU[0], NAGQU[1], 18, C.quake);
      font(500, 24); text('Nagqu region', NAGQU[0] + 28, NAGQU[1] + 4, { color: C.ink });
      font(400, 20, CAP); text('22 Oct 2026 · 10:33 pm local time', NAGQU[0] + 28, NAGQU[1] + 34, { color: C.soft });
    });
    A(seg(t, 1.6, 2.2), () => { font(700, 72); text(`M ${MAG.toFixed(1)}`, 60, 260 + 0, { color: C.quake }); });
    // India's push: north-pointing arrows
    A(seg(t, 5.2, 5.8), () => {
      for (const x of [330, 420, 510]) arrow(x, 690, x, 600 - 10 * push, C.push, 7, 22);
    });
    // but the quake pulled east-west
    A(seg(t, 7.0, 7.6), () => {
      const g = eout(seg(t, 7.0, 8.2));
      arrow(NAGQU[0] - 40, NAGQU[1] - 50, NAGQU[0] - 40 - 110 * g, NAGQU[1] - 50, C.pull, 7, 22);
      arrow(NAGQU[0] + 40, NAGQU[1] - 50, NAGQU[0] + 40 + 110 * g, NAGQU[1] - 50, C.pull, 7, 22);
      font(500, 22); text('pulled apart', NAGQU[0], NAGQU[1] - 86, { color: C.pull, align: 'center' });
    });
  });
}

// ---------- B: a normal fault ----------
/** Two blocks of layered crust with a crack dipping at `dip` degrees; the right block slides down by `drop` px. */
function faultBlocks(cx, top, w, h, drop, pull, { dip = DIP, labels = true } = {}) {
  const t0 = Math.tan((dip * Math.PI) / 180);
  const fx = cx; // where the crack meets the surface
  const run = h / t0; // horizontal run of the crack
  const L = cx - w / 2, R = cx + w / 2;
  const layers = [C.rock3, C.rock1, C.rock2, C.rock4];
  const lh = h / layers.length;
  // footwall (left), moved left by pull
  ctx.save(); ctx.translate(-pull, 0);
  layers.forEach((col, i) => {
    const y0 = top + i * lh, y1 = y0 + lh;
    poly([[L, y0], [fx + (y0 - top) / t0, y0], [fx + (y1 - top) / t0, y1], [L, y1]], col);
  });
  ctx.restore();
  // hanging wall (right), moved right by pull and down along the crack
  ctx.save(); ctx.translate(pull + drop / t0 * 0.0, drop);
  layers.forEach((col, i) => {
    const y0 = top + i * lh, y1 = y0 + lh;
    poly([[fx + (y0 - top) / t0, y0], [R, y0], [R, y1], [fx + (y1 - top) / t0, y1]], col);
  });
  ctx.restore();
  // the crack
  ctx.strokeStyle = C.quake; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
  ctx.beginPath(); ctx.moveTo(fx - pull, top); ctx.lineTo(fx + run - pull, top + h); ctx.stroke(); ctx.setLineDash([]);
  if (labels) {
    font(500, 22); text('crack (fault)', fx + run * 0.5, top + h + 110, { color: C.quake, align: 'center' });
    text('dips moderately', fx + run * 0.5, top + h + 138, { color: C.soft, align: 'center' });
  }
}
function normalFault(t) {
  const a = span(t, 9.6, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const g = eio(seg(t, 10.4, 12.6));
    faultBlocks(400, 300, 520, 240, 70 * g, 26 * g);
    arrow(240, 250, 240 - 120 * Math.max(0.3, g), 250, C.pull, 7, 22);
    arrow(600, 250, 600 + 120 * Math.max(0.3, g), 250, C.pull, 7, 22);
    font(500, 24); text('stretch', 140, 210, { color: C.pull, align: 'center' });
    text('stretch', 700, 210, { color: C.pull, align: 'center' });
    A(seg(t, 12.0, 12.5), () => { font(500, 24); text('slides down', 700, 470, { color: C.ink }); arrow(740, 490, 740, 560, C.ink, 5, 18); });
    note('cross-section, schematic');
  });
}

// ---------- C: high plateau, honey, heavy columns ----------
/** Ground profile across the plateau: lowland, steep edges, high flat top. */
function profileY(x, base, top, x0 = 210, x1 = 650) {
  const e = 70;
  const rise = clamp((x - (x0 - e)) / (2 * e)), fall = clamp(((x1 + e) - x) / (2 * e));
  const s = (u) => u * u * (3 - 2 * u);
  return lerp(base, top, s(rise) * s(fall));
}
function plateauProfile(t) {
  const a = span(t, 14.2, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const base = 600, top = lerp(600, 330, eout(seg(t, 14.4, 15.6)));
    ctx.beginPath(); ctx.moveTo(40, 680);
    for (let x = 40; x <= 824; x += 6) ctx.lineTo(x, profileY(x, base, top, 190, 560));
    ctx.lineTo(824, 680); ctx.closePath();
    const lg = ctx.createLinearGradient(0, 330, 0, 680); lg.addColorStop(0, C.rock3); lg.addColorStop(1, C.rock2);
    ctx.fillStyle = lg; ctx.fill();
    // snow line on top
    ctx.strokeStyle = C.snow; ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 210; x <= 540; x += 6) { const y = profileY(x, base, top, 190, 560); x === 230 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    // a height bar
    A(seg(t, 15.6, 16.1), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(690, base); ctx.lineTo(690, top); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(676, top); ctx.lineTo(704, top); ctx.moveTo(676, base); ctx.lineTo(704, base); ctx.stroke();
      font(600, 36); text('4,500 m+', 706, (base + top) / 2 - 16, { color: C.ink });
      font(400, 20, CAP); text('average height', 706, (base + top) / 2 + 20, { color: C.soft });
      font(400, 20, CAP); text('lowland', 90, base - 24, { color: C.soft });
    });
    note('cross-section, heights exaggerated');
  });
}
function honey(t) {
  const a = span(t, 18.8, 23.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = W / 2, floor = 600;
    // a bottle pours, then stops; the pile spreads while keeping its area
    const pour = seg(t, 19.0, 20.6), spread = eio(seg(t, 20.8, 23.2));
    const area = 36000 * eout(pour);
    const R = lerp(110, 330, spread);
    const H0 = area / (R * 1.4); // area of h0*(1-u²)^(1/3) over [-R,R] is ≈ 1.4·h0·R
    // the bottle
    const by = lerp(170, 140, seg(t, 20.6, 21.4)), tilt = lerp(2.6, 1.4, seg(t, 20.6, 21.4));
    ctx.save(); ctx.translate(cx + 30, by); ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(243,238,230,0.18)'; k.rrect(-34, -70, 68, 120, 14); ctx.fill();
    ctx.fillStyle = C.honey; k.rrect(-30, -10, 60, 56, 10); ctx.fill();
    ctx.fillStyle = 'rgba(243,238,230,0.3)'; ctx.fillRect(-12, -96, 24, 30);
    ctx.restore();
    if (pour > 0 && pour < 1) {
      ctx.strokeStyle = C.honey; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx, 214); ctx.lineTo(cx, floor - H0); ctx.stroke();
    }
    // the pile
    if (area > 0) {
      ctx.beginPath(); ctx.moveTo(cx - R, floor);
      for (let i = 0; i <= 80; i++) {
        const u = -1 + (2 * i) / 80, x = cx + u * R;
        ctx.lineTo(x, floor - H0 * Math.cbrt(Math.max(0, 1 - u * u)));
      }
      ctx.closePath();
      const lg = ctx.createLinearGradient(0, floor - H0, 0, floor); lg.addColorStop(0, C.honey); lg.addColorStop(1, C.honeyDeep);
      ctx.fillStyle = lg; ctx.fill();
    }
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, floor); ctx.lineTo(804, floor); ctx.stroke();
    A(seg(t, 21.2, 21.7), () => {
      const g = eout(seg(t, 21.2, 22.6));
      arrow(cx - R + 10, floor - 30, cx - R - 70 * g, floor - 30, C.pull, 6, 18);
      arrow(cx + R - 10, floor - 30, cx + R + 70 * g, floor - 30, C.pull, 6, 18);
      font(500, 24); text('spreads under its own weight', cx, floor + 50, { color: C.honey, align: 'center' });
    });
  });
}
function columns(t) {
  const a = span(t, 23.4, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const base = 560, top = 300, depth = 700;
    // ground surface: plateau on the left, lowland on the right
    ctx.beginPath(); ctx.moveTo(40, depth);
    for (let x = 40; x <= 824; x += 6) ctx.lineTo(x, profileY(x, base, top, -200, 420));
    ctx.lineTo(824, depth); ctx.closePath();
    ctx.fillStyle = C.rock2; ctx.fill();
    // the same depth line
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(40, 660); ctx.lineTo(824, 660); ctx.stroke(); ctx.setLineDash([]);
    font(400, 20, CAP); text('same depth', 50, 640, { color: C.soft });
    // two columns
    const g = eout(seg(t, 23.8, 24.8));
    const col = (x, y0, label, sub) => {
      ctx.fillStyle = 'rgba(211,154,92,0.55)'; ctx.fillRect(x - 40, y0, 80, (660 - y0) * g);
      ctx.strokeStyle = C.rock3; ctx.lineWidth = 3; ctx.strokeRect(x - 40, y0, 80, (660 - y0) * g);
      A(seg(t, 24.8, 25.3), () => { arrow(x, 600, x, 652, C.ink, 6, 18); font(500, 28); text(label, x, y0 - 50, { color: C.ink, align: 'center' }); font(400, 22, CAP); text(sub, x, y0 - 20, { color: C.soft, align: 'center' }); });
    };
    col(220, top, 'plateau', 'more rock above');
    col(650, base, 'lowland', 'less rock above');
    A(seg(t, 25.8, 26.4), () => {
      panel(232, 150, 400, 92);
      font(600, 34); text('more weight, same depth', W / 2, 184, { color: C.honey, align: 'center' });
      font(400, 19, CAP); text('kilometres of extra rock press down', W / 2, 220, { color: C.soft, align: 'center' });
      arrow(320, 680, 520, 680, C.honey, 6, 18);
      font(500, 22); text('pushes outward', 420, 714, { color: C.honey, align: 'center' });
    });
    note('cross-section, schematic', 770);
  });
}

// ---------- D: held north-south, free east-west ----------
/** A top view of the plateau: India pushing from the south, Asia holding the north, room to spread east and west. */
function topView(t, t0, t1, { spread = 0, cracks = 0, held = 1 } = {}) {
  const cx = W / 2, cy = 400, rx = 280 + 50 * spread, ry = 140;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(211,154,92,0.40)'; ctx.fill(); ctx.strokeStyle = C.rock3; ctx.lineWidth = 3; ctx.stroke();
  font(500, 22); text('TIBETAN PLATEAU (top view)', cx, cy - ry - 26, { color: C.rock3, align: 'center', spacing: '2px' });
  A(held, () => {
    for (const x of [cx - 120, cx, cx + 120]) arrow(x, cy + ry + 110, x, cy + ry + 14, C.push, 7, 22);
    font(500, 22); text('India pushes north', cx, cy + ry + 140, { color: C.push, align: 'center' });
    ctx.fillStyle = 'rgba(124,196,232,0.25)'; ctx.fillRect(cx - 260, cy - ry - 74, 520, 22);
    font(500, 20); text('Asia holds the north', cx, cy - ry - 92, { color: C.push, align: 'center' });
  });
  if (spread > 0) {
    arrow(cx - rx + 30, cy, cx - rx - 70 * spread, cy, C.pull, 8, 24);
    arrow(cx + rx - 30, cy, cx + rx + 70 * spread, cy, C.pull, 8, 24);
  }
  if (cracks > 0) {
    // north-south cracks (rifts) across the plateau
    const xs = [-170, -90, -10, 70, 150];
    xs.forEach((dx, i) => {
      const g = clamp(cracks * 5 - i);
      if (g <= 0) return;
      const x = cx + dx, half = ry * 0.75 * g;
      ctx.strokeStyle = C.quake; ctx.lineWidth = 4; ctx.beginPath();
      for (let j = 0; j <= 10; j++) { const y = cy - half + (2 * half * j) / 10; const xx = x + Math.sin(j * 1.7 + i) * 7; j ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y); }
      ctx.stroke();
    });
  }
}
function spreadScene(t) {
  const a = span(t, 28.0, 41.8, 0.4, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const spread = eio(seg(t, 33.0, 35.6));
    const cracks = seg(t, 37.6, 40.4);
    topView(t, 28, 41.8, { spread, cracks });
    // the outward push of the weight, in all directions, at first
    A(span(t, 28.4, 33.0, 0.4, 0.4), () => {
      for (let i = 0; i < 8; i++) {
        const th = (i / 8) * Math.PI * 2, r0 = 70, r1 = 120;
        arrow(W / 2 + Math.cos(th) * r0, 400 + Math.sin(th) * r0 * 0.55, W / 2 + Math.cos(th) * r1, 400 + Math.sin(th) * r1 * 0.55, C.honey, 5, 14);
      }
      font(500, 20); text('weight pushes out', W / 2, 400, { color: C.ink, align: 'center' });
    });
    A(seg(t, 34.0, 34.5), () => {
      font(500, 24); text('spreads east', 790, 330, { color: C.pull, align: 'right' });
      text('spreads west', 74, 330, { color: C.pull });
    });
    A(seg(t, 38.2, 38.7), () => {
      font(500, 24); text('faults run north–south', W / 2, 722, { color: C.quake, align: 'center' });
      // a little compass
      font(600, 20); text('N', 790, 170, { color: C.soft, align: 'center' });
      arrow(790, 230, 790, 186, C.soft, 3, 12);
    });
    note('schematic', 770);
  });
}

// ---------- E: locked faults, the patch, thrusts and normal faults ----------
function stickSlip(t) {
  const a = span(t, 41.8, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // stretch builds on a gauge, then the blocks jump
    const build = seg(t, 42.2, 44.8), slipped = seg(t, 44.8, 45.1);
    const drop = 70 * eout(slipped), pull = 26 * eout(slipped);
    faultBlocks(410, 300, 560, 240, drop, pull, { labels: false });
    // the gauge
    const gx = 160, gy = 610, gw = 540;
    ctx.fillStyle = 'rgba(243,238,230,0.12)'; k.rrect(gx, gy, gw, 30, 15); ctx.fill();
    const fill = slipped > 0 ? lerp(build, 0.05, slipped) : build;
    ctx.fillStyle = slipped > 0 ? C.quake : C.honey; k.rrect(gx, gy, Math.max(30, gw * fill), 30, 15); ctx.fill();
    font(500, 22); text('stretch stored in the rock', gx, gy - 24, { color: C.soft });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx + gw * 0.98, gy - 8); ctx.lineTo(gx + gw * 0.98, gy + 38); ctx.stroke();
    font(400, 19, CAP); text('friction gives way', gx + gw * 0.98, gy + 60, { color: C.soft, align: 'right' });
    A(slipped, () => { font(700, 44); text('SLIP', 410, 240, { color: C.quake, align: 'center', spacing: '4px' }); });
    note('cross-section, schematic', 770);
  });
}
function patch(t) {
  const a = span(t, 46.4, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // the fault plane drawn as a tilted sheet, 50 km along strike and 20 km down dip
    const px = 11; // px per km
    const g = eout(seg(t, 46.8, 48.2));
    const L = FAULT_L * px * g, Wd = FAULT_W * px * g;
    const x0 = W / 2 - (FAULT_L * px) / 2 - 60, y0 = 300;
    const skew = 0.55; // perspective of the dipping sheet
    poly([[x0, y0], [x0 + L, y0], [x0 + L + Wd * skew, y0 + Wd * 0.8], [x0 + Wd * skew, y0 + Wd * 0.8]], 'rgba(255,111,89,0.35)', C.quake, 3);
    A(seg(t, 48.2, 48.7), () => {
      font(600, 34); text(`${FAULT_L} km`, x0 + (FAULT_L * px) / 2, y0 - 30, { color: C.ink, align: 'center' });
      font(600, 34); text(`${FAULT_W} km`, x0 + FAULT_L * px + FAULT_W * px * 0.55 + 10, y0 + FAULT_W * px * 0.8 + 40, { color: C.ink, align: 'right' });
      font(400, 20, CAP); text('along the fault', x0 + (FAULT_L * px) / 2, y0 - 64, { color: C.soft, align: 'center' });
      text('down its slope', x0 + FAULT_L * px + FAULT_W * px * 0.55 + 10, y0 + FAULT_W * px * 0.8 + 72, { color: C.soft, align: 'right' });
    });
    A(seg(t, 49.0, 49.5), () => {
      // a 10-km scale bar for comparison
      ctx.fillStyle = C.ink; ctx.fillRect(x0, 600, 10 * px, 8);
      font(400, 20, CAP); text('10 km', x0 + 5 * px, 634, { color: C.soft, align: 'center' });
      font(400, 20, CAP); text('USGS: typical size for a normal-fault quake of magnitude 7', W / 2, 770, { color: C.faint, align: 'center' });
    });
  });
}
function edges(t) {
  const a = span(t, 51.0, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a south-north cross-section: India (south, left) slides under Asia; the high plateau with normal faults on top
    const edge = 340, low = 600, high = 360;
    ctx.beginPath(); ctx.moveTo(edge - 140, 700);
    for (let x = edge - 140; x <= 824; x += 6) ctx.lineTo(x, lerp(low, high, clamp((x - (edge - 140)) / 200) ** 0.8));
    ctx.lineTo(824, 700); ctx.closePath(); ctx.fillStyle = C.rock1; ctx.fill();
    // the Himalaya: peaks along the edge
    for (const [x, hgt] of [[250, 70], [300, 110], [350, 90], [395, 60]]) {
      const yb = lerp(low, high, clamp((x - (edge - 140)) / 200) ** 0.8);
      poly([[x - 40, yb + 10], [x, yb - hgt], [x + 40, yb + 10]], C.rock3);
      poly([[x - 12, yb - hgt + 30], [x, yb - hgt], [x + 12, yb - hgt + 30]], C.snow);
    }
    // India, a slab diving under from the south
    const g = eout(seg(t, 51.4, 53.0));
    poly([[40, 610], [200, 610], [600, 730], [600, 770], [200, 660], [40, 660]], 'rgba(124,196,232,0.45)', C.push, 3);
    arrow(60, 635, 60 + 170 * g, 635 + 14 * g, C.push, 7, 22);
    font(500, 24); text('India', 50, 585, { color: C.push });
    A(seg(t, 52.0, 52.5), () => {
      ctx.strokeStyle = C.push; ctx.lineWidth = 5; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(200, 610); ctx.lineTo(420, 676); ctx.stroke(); ctx.setLineDash([]);
      font(500, 24); text('thrust faults: the Himalaya', 60, 230, { color: C.push });
      arrow(160, 250, 270, 420, C.push, 3, 12);
    });
    // normal faults on the plateau top
    A(seg(t, 52.8, 53.3), () => {
      for (const x of [560, 650, 740]) { ctx.strokeStyle = C.quake; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, high + 4); ctx.lineTo(x + 34, high + 96); ctx.stroke(); }
      font(500, 24); text('normal faults on top', 650, 310, { color: C.quake, align: 'center' });
    });
    font(500, 20); text('SOUTH', 50, 170, { color: C.faint, spacing: '3px' });
    text('NORTH', 720, 170, { color: C.faint, align: 'right', spacing: '3px' });
    note('south–north cross-section, schematic', 770);
  });
}

// ---------- F: history and the summary ----------
function history(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(500, 24); text('magnitude 7+ on the plateau and its edges, since 1900', W / 2, 190, { color: C.soft, align: 'center' });
    const cols = 10, size = 54;
    for (let i = 0; i < BIG_SINCE_1900; i++) {
      const g = clamp((t - 56.0) * 12 - i);
      if (g <= 0) continue;
      const x = W / 2 - ((cols - 1) * size) / 2 + (i % cols) * size, y = 290 + Math.floor(i / cols) * size * 1.2;
      A(g, () => star(x, y, 20, i === BIG_SINCE_1900 - 1 ? C.quake : C.rock3));
    }
    A(seg(t, 58.6, 59.1), () => { font(700, 80); text(String(BIG_SINCE_1900), W / 2, 560, { color: C.ink, align: 'center' }); font(400, 22, CAP); text('counted by the US Geological Survey', W / 2, 620, { color: C.soft, align: 'center' }); });
  });
}
function finale(t) {
  const a = seg(t, 60.2, 60.7);
  if (a <= 0) return;
  A(a, () => {
    const spread = 0.6 + 0.4 * Math.sin((t - 60.2) * 1.5) * 0;
    topView(t, 60.2, 65, { spread, cracks: 1 });
    A(seg(t, 61.0, 61.5), () => { font(600, 28); text('squeezed', 120, 610, { color: C.push, align: 'left' }); text('spreading', 800, 350, { color: C.pull, align: 'right' }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    mapScene(t);
    normalFault(t);
    plateauProfile(t);
    honey(t);
    columns(t);
    spreadScene(t);
    stickSlip(t);
    patch(t);
    edges(t);
    history(t);
    finale(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 39, weight: 600, family: CAP, ink: C.ink, marks: { '*': C.honey, '~': C.pull, '^': C.push } });
  },
});
