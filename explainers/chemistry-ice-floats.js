// Explainer for chemistry-ice-floats: hydrogen bonds hold frozen water molecules apart, so ice floats.
// Look: a frosted night-blue backdrop with a faint hexagonal frost pattern, glassware drawn as light
// on dark, ball-and-stick V-shaped molecules (blue oxygen, white hydrogen) and dashed cyan hydrogen
// bonds; a warm amber for 4 °C. Jost for captions and titles, IBM Plex Mono for numbers.
//
// Scene plan (56 s). Captions centred at y = 834; everything important above y = 930.
//  A  0.0–10.4  Hook. An ice cube floats in a glass, 91.7% of it below the waterline (0.9167/0.9998).
//               Then a measuring cylinder: 1.00 L of water freezes and its level rises to 1.09 L.
//  B  9.9–29.6  Why. Zoom in: one big V-shaped molecule with its 104.5° angle; then about 60 molecules
//               tumble as a liquid; a freezing front sweeps down and locks each into a honeycomb
//               (2D diagram of hexagonal ice), dashed hydrogen bonds appear, the empty rings glow.
//  C 29.3–34.6  Same volume, less mass: a balance with 1 cm³ of water (0.9998 g) and of ice (0.9167 g).
//  D 34.3–51.2  The lake. Autumn water at 8 °C cools at the surface and sinks until the lake is 4 °C;
//               then the surface cools further, stays on top and freezes into a floating lid, fish
//               below. An inset curve shows water's density peaking near 4 °C.
//  E 50.8–56.0  Payoff card.
//
// Facts (Wikipedia, "Ice"): ice is about 8.3% less dense than liquid water, equivalent to a 9% volume
// expansion; ice 0.9167–0.9168 g/cm³ and water 0.9998–0.999863 g/cm³ at 0 °C; water is densest at
// 4 °C; hydrogen bonds give a less compact packing in the hexagonal crystal; floating ice prevents
// bottom-up freezing and shelters life beneath. (Wikipedia, "Properties of water"): density peaks at
// 3.98 °C (0.99997 g/mL), the H–O–H angle is 104.48°, hydrogen bonds make an open lattice, and deep
// lakes stay at about 4 °C at the bottom. Ratios below are computed from these numbers.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const RHO_ICE = 0.9167, RHO_WATER = 0.9998; // g/cm³ at 0 °C
const EXPAND = RHO_WATER / RHO_ICE; // 1.0907: a litre of water becomes 1.09 L of ice
const LESS = (1 - RHO_ICE / RHO_WATER) * 100; // 8.3 %
const SUBMERGED = RHO_ICE / RHO_WATER; // share of a floating cube below the waterline

const C = {
  bg0: '#020A14', bg1: '#06203A', bg2: '#0C3A5E',
  ice: '#D8F6FF', iceMid: '#9BE2F8', iceDeep: '#4FB3DE',
  ink: '#EAF8FF', inkSoft: 'rgba(234,248,255,0.74)', inkDim: 'rgba(234,248,255,0.55)',
  oxy: '#2A7FD0', oxyHi: '#A6DCFF', oxyLo: '#123E78', hyd: '#F6FCFF', bond: '#8FE6FF',
  cyan: '#7FE3FF', warm: '#FFC266', water: '#1D6FAF', waterDeep: '#0D3C6B', glass: 'rgba(200,236,255,0.55)',
};
const SANS = 'Jost', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- timeline ----------
const T = { A: [0, 10.4], B: [9.9, 29.6], C: [29.3, 34.6], D: [34.3, 51.6], E: [50.8, 56.0] };
const CUES = [
  [0.4, 5.3, 'Ice floats on water. For a solid in its own liquid, that’s *unusual*.'],
  [5.4, 10.2, `Freeze *1 litre* of water and you get about ~${EXPAND.toFixed(2)} litres~ of ice.`],
  [10.4, 15.4, 'Zoom in. Each water molecule is a bent *V*: one oxygen, two hydrogens.'],
  [15.5, 19.4, 'In liquid water, they tumble and crowd close together.'],
  [19.5, 24.0, 'As water freezes, *hydrogen bonds* lock each molecule in place.'],
  [24.1, 29.2, 'They form an open, *hexagonal* lattice, with a gap in every ring.'],
  [29.4, 34.4, `Same space, fewer molecules: ice is about ~${LESS.toFixed(1)}% less dense~.`],
  [34.6, 40.2, 'In a lake, water is densest at about ~4 °C~, so it sinks to the bottom.'],
  [40.3, 45.7, 'Colder water stays on top and freezes there: lakes freeze from the *top down*.'],
  [45.8, 50.8, 'The floating ice shelters the water below, where life lasts the winter.'],
];

// ---------- background, painted once ----------
let bgCanvas = null;
function hexPath(g, cx, cy, r, rot = 0) {
  g.beginPath();
  for (let i = 0; i < 6; i++) { const a = rot + (i * TAU) / 6; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath();
}
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 360, 30, W / 2, 460, 900);
  rad.addColorStop(0, C.bg2); rad.addColorStop(0.45, C.bg1); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // a faint honeycomb of frost
  g.strokeStyle = 'rgba(160,225,255,0.035)'; g.lineWidth = 1.5;
  const r = 46, dx = r * Math.sqrt(3), dy = r * 1.5;
  for (let row = -1; row < H / dy + 1; row++) for (let col = -1; col < W / dx + 1; col++) {
    hexPath(g, col * dx + (row % 2 ? dx / 2 : 0), row * dy, r, Math.PI / 6); g.stroke();
  }
  // frost crystals creeping in from the corners
  const rnd = mulberry32(11);
  const frond = (x, y, len, ang, depth) => {
    if (depth <= 0 || len < 4) return;
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    for (const s of [0.35, 0.6, 0.85]) {
      const px = lerp(x, x2, s), py = lerp(y, y2, s);
      frond(px, py, len * 0.38, ang + Math.PI / 3, depth - 1);
      frond(px, py, len * 0.38, ang - Math.PI / 3, depth - 1);
    }
  };
  g.lineCap = 'round';
  for (const [x, y, a] of [[0, H, -0.8], [W, H, -2.3], [0, 160, 0.4], [30, 1040, -1.3], [W, 980, 3.6]]) {
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = `rgba(190,238,255,${0.05 + rnd() * 0.03})`; g.lineWidth = 1.6;
      frond(x, y, 120 + rnd() * 90, a + (rnd() - 0.5) * 0.9, 3);
    }
  }
  // sparkles
  for (let i = 0; i < 140; i++) {
    const x = rnd() * W, y = rnd() * H, s = rnd();
    g.fillStyle = `rgba(220,245,255,${0.05 + s * 0.18})`;
    g.beginPath(); g.arc(x, y, 0.6 + s * 1.3, 0, TAU); g.fill();
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 800);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,4,10,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function background(t) {
  if (!bgCanvas) paintBackground();
  ctx.drawImage(bgCanvas, 0, 0);
  font(700, 22); text('RECKON', 64, 84, { color: C.cyan, spacing: '3px' });
  const rw = ctx.measureText('RECKON').width + 18;
  font(500, 22); text('CHEMISTRY · WATER', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '2px' });
}

// ---------- A: a glass with a floating ice cube, then a measuring cylinder ----------
function iceBlock(x, y, w, h, rot, a = 1) {
  withAlpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, 'rgba(240,252,255,0.95)'); g.addColorStop(0.5, 'rgba(170,228,250,0.85)'); g.addColorStop(1, 'rgba(110,190,230,0.85)');
    ctx.fillStyle = g; rrect(-w / 2, -h / 2, w, h, w * 0.12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; rrect(-w / 2, -h / 2, w, h, w * 0.12); ctx.stroke();
    // inner facets and a crack
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w * 0.32, -h * 0.3); ctx.lineTo(w * 0.3, -h * 0.34); ctx.lineTo(w * 0.34, h * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.1, h * 0.05); ctx.lineTo(w * 0.08, h * 0.18); ctx.lineTo(w * 0.02, h * 0.36); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (const [bx, by, br] of [[-0.2, 0.15, 0.03], [0.12, -0.08, 0.022], [-0.05, -0.18, 0.018]]) { ctx.beginPath(); ctx.arc(bx * w, by * h, br * w, 0, TAU); ctx.fill(); }
    ctx.restore();
  });
}

function glassScene(t) {
  const x0 = 262, x1 = 602, top = 270, bot = 712, level = 430;
  const rise = eout(seg(t, 0.2, 1.2));
  ctx.save(); ctx.translate(0, (1 - rise) * 30);
  // water
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0 + 6, level); ctx.lineTo(x1 - 6, level); ctx.lineTo(x1 - 14, bot - 8); ctx.quadraticCurveTo(x1 - 16, bot, x1 - 30, bot); ctx.lineTo(x0 + 30, bot); ctx.quadraticCurveTo(x0 + 16, bot, x0 + 14, bot - 8); ctx.closePath();
  const wg = ctx.createLinearGradient(0, level, 0, bot);
  wg.addColorStop(0, 'rgba(70,160,220,0.55)'); wg.addColorStop(1, 'rgba(20,80,150,0.75)');
  ctx.fillStyle = wg; ctx.fill(); ctx.clip();
  // light rays in the water
  for (let i = 0; i < 4; i++) {
    const xx = 300 + i * 80 + Math.sin(t * 0.7 + i) * 10;
    const lg = ctx.createLinearGradient(xx, level, xx + 40, bot);
    lg.addColorStop(0, 'rgba(200,240,255,0.10)'); lg.addColorStop(1, 'rgba(200,240,255,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(xx, level); ctx.lineTo(xx + 26, level); ctx.lineTo(xx + 70, bot); ctx.lineTo(xx + 30, bot); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // the cube: SUBMERGED of its height under the waterline
  const side = 150, bob = Math.sin(t * 1.6) * 3, drop = (1 - eout(seg(t, 0.5, 1.6))) * -60;
  const cy = level - side * (1 - SUBMERGED) + side / 2 + bob + drop;
  iceBlock(432, cy, side, side, Math.sin(t * 1.1) * 0.025, eout(seg(t, 0.4, 1.0)));
  // tint the part under water
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, level, x1 - x0, bot - level); ctx.clip();
  ctx.fillStyle = 'rgba(30,110,180,0.32)'; ctx.fillRect(432 - side, level, side * 2, side * 1.2);
  ctx.restore();
  // the surface
  ctx.strokeStyle = 'rgba(210,245,255,0.85)'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = x0 + 6; x <= x1 - 6; x += 6) { const y = level + Math.sin(x * 0.05 + t * 2.2) * 1.6; x === x0 + 6 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  // the glass
  ctx.strokeStyle = C.glass; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0 + 12, bot - 6); ctx.quadraticCurveTo(x0 + 16, bot + 8, x0 + 34, bot + 8); ctx.lineTo(x1 - 34, bot + 8); ctx.quadraticCurveTo(x1 - 16, bot + 8, x1 - 12, bot - 6); ctx.lineTo(x1, top); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(x0 + 26, top + 30); ctx.lineTo(x0 + 34, bot - 40); ctx.stroke();
  // labels
  withAlpha(seg(t, 1.6, 2.2), () => {
    font(500, 24); text('ice', 640, cy - 30, { color: C.ice, base: 'middle' });
    ctx.strokeStyle = C.inkDim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(634, cy - 30); ctx.lineTo(516, cy - 30); ctx.stroke();
    text('water', 640, 580, { color: C.cyan, base: 'middle' });
    ctx.beginPath(); ctx.moveTo(634, 580); ctx.lineTo(590, 580); ctx.stroke();
  });
  ctx.restore();
}

const CYL = { x0: 357, x1: 507, bot: 724, top: 196, perL: 400 };
const levelY = (v) => CYL.bot - CYL.perL * v;
function cylinderScene(t) {
  const fr = eio(seg(t, 6.4, 9.0)); // freezing
  const v = lerp(1, EXPAND, fr);
  const y = levelY(v);
  const { x0, x1, bot, top } = CYL;
  // contents
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 + 5, y, x1 - x0 - 10, bot - y - 5); ctx.clip();
  const wg = ctx.createLinearGradient(0, y, 0, bot);
  const mix = (a, b) => `rgba(${a.map((c, i) => Math.round(lerp(c, b[i], fr))).join(',')},${lerp(0.7, 0.9, fr)})`;
  wg.addColorStop(0, mix([70, 160, 220], [215, 245, 255])); wg.addColorStop(1, mix([20, 80, 150], [120, 200, 238]));
  ctx.fillStyle = wg; ctx.fillRect(x0, y, x1 - x0, bot - y);
  // frost growing in from the walls
  if (fr > 0) {
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * fr})`; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const rnd = mulberry32(5);
    for (let i = 0; i < 26; i++) {
      const side = i % 2, yy = y + 10 + rnd() * (bot - y - 20), len = (16 + rnd() * 34) * eout(seg(fr, i / 40, i / 40 + 0.5));
      const xa = side ? x1 - 5 : x0 + 5, dir = side ? -1 : 1, ang = (rnd() - 0.5) * 0.9;
      const xb = xa + dir * Math.cos(ang) * len, yb = yy + Math.sin(ang) * len;
      ctx.beginPath(); ctx.moveTo(xa, yy); ctx.lineTo(xb, yb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lerp(xa, xb, 0.5), lerp(yy, yb, 0.5)); ctx.lineTo(lerp(xa, xb, 0.5) + dir * len * 0.3, lerp(yy, yb, 0.5) - len * 0.25); ctx.stroke();
    }
  }
  ctx.restore();
  // surface
  ctx.strokeStyle = fr < 0.5 ? 'rgba(210,245,255,0.9)' : 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0 + 5, y); ctx.lineTo(x1 - 5, y); ctx.stroke();
  // the cylinder
  ctx.strokeStyle = C.glass; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0 - 8, top); ctx.lineTo(x0, top + 8); ctx.lineTo(x0, bot); ctx.lineTo(x1, bot); ctx.lineTo(x1, top + 8); ctx.lineTo(x1 + 8, top); ctx.stroke();
  ctx.fillStyle = 'rgba(200,236,255,0.25)'; rrect(x0 - 40, bot, x1 - x0 + 80, 14, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0 + 18, top + 40); ctx.lineTo(x0 + 18, bot - 30); ctx.stroke();
  // scale: ticks every 0.05 L, labels at 0.8, 0.9, 1.0, 1.1, 1.2
  ctx.strokeStyle = 'rgba(234,248,255,0.65)'; ctx.lineWidth = 2;
  for (let i = 12; i <= 24; i++) {
    const vv = i * 0.05, yy = levelY(vv), major = i % 2 === 0;
    ctx.beginPath(); ctx.moveTo(x1 - (major ? 34 : 20), yy); ctx.lineTo(x1 - 5, yy); ctx.stroke();
    if (major && i >= 16) { font(400, 22, MONO); text(`${vv.toFixed(1)} L`, x1 + 22, yy, { color: C.inkSoft, base: 'middle' }); }
  }
  // left labels
  const l1 = 1 - seg(t, 6.2, 6.6), l2 = seg(t, 8.6, 9.1);
  font(600, 26);
  withAlpha(l1, () => { text('1.00 L water', x0 - 28, levelY(1), { color: C.cyan, align: 'right', base: 'middle' }); });
  withAlpha(l2, () => {
    font(600, 26, SANS); text(`${EXPAND.toFixed(2)} L ice`, x0 - 28, levelY(EXPAND), { color: C.ice, align: 'right', base: 'middle' });
    // the old level, dashed
    ctx.setLineDash([8, 8]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0 - 20, levelY(1)); ctx.lineTo(x1 + 4, levelY(1)); ctx.stroke(); ctx.setLineDash([]);
    font(500, 22); text('was 1.00 L', x0 - 28, levelY(1) + 4, { color: C.inkSoft, align: 'right', base: 'top' });
    const bx = x1 + 104, ya = levelY(1), yb = levelY(EXPAND);
    ctx.strokeStyle = C.warm; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx - 10, ya); ctx.lineTo(bx, ya); ctx.lineTo(bx, yb); ctx.lineTo(bx - 10, yb); ctx.stroke();
    font(600, 28, MONO); text(`+${((EXPAND - 1) * 100).toFixed(0)}%`, bx + 14, (ya + yb) / 2, { color: C.warm, base: 'middle' });
  });
  // a snowflake sign while it freezes
  withAlpha(span(t, 6.3, 9.2, 0.3, 0.4), () => snowflake(x0 - 120, 520, 34, t * 0.6, C.ice));
}
function snowflake(x, y, r, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.save(); ctx.rotate((i * TAU) / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.28, -r * 0.8); ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.28, -r * 0.8); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function sceneA(t) {
  withAlpha(1 - seg(t, 4.9, 5.6), () => glassScene(t));
  if (t > 4.9) {
    // zoom into the level at the end
    const z = eio(seg(t, 9.8, 10.4));
    withAlpha(seg(t, 5.0, 5.7), () => {
      ctx.save(); ctx.translate(432, levelY(EXPAND)); ctx.scale(1 + z * 2.2, 1 + z * 2.2); ctx.translate(-432, -levelY(EXPAND));
      cylinderScene(t);
      ctx.restore();
    });
  }
}

// ---------- B: molecules ----------
const D = 64, OR = 14, HR = 8, OH = D * 0.36; // O–O spacing, atom radii, O–H length in px
const SQ3 = Math.sqrt(3);
const DIRS = [[0, 1], [-SQ3 / 2, -0.5], [SQ3 / 2, -0.5]]; // from an A site to its three B neighbours
const SITES = [], key = (x, y) => `${Math.round(x)},${Math.round(y)}`, at = new Map();
{
  const x0 = 140, y0 = 236;
  for (let j = 0; j <= 4; j++) for (let i = -3; i <= 8; i++) {
    const ax = x0 + i * SQ3 * D + j * (SQ3 / 2) * D, ay = y0 + j * 1.5 * D;
    for (const [type, x, y] of [['A', ax, ay], ['B', ax, ay + D]]) {
      if (x < 112 || x > 752) continue;
      const s = { type, x, y, i: SITES.length };
      SITES.push(s); at.set(key(x, y), s);
    }
  }
}
// hydrogen bonds: every A donates along DIRS[1] and DIRS[2]; every B donates back along -DIRS[0]
const HBONDS = [];
for (const s of SITES) {
  const dirs = s.type === 'A' ? [DIRS[1], DIRS[2]] : [[0, -1]];
  for (const [dx, dy] of dirs) {
    const n = at.get(key(s.x + dx * D, s.y + dy * D));
    if (n) HBONDS.push({ from: s, to: n, dx, dy });
  }
}
// hexagon centres with all six corners present
const HEXES = [];
for (const s of SITES) if (s.type === 'A') {
  const cx = s.x + (SQ3 / 2) * D, cy = s.y + 0.5 * D;
  const corners = [[0, -1], [SQ3 / 2, -0.5], [SQ3 / 2, 0.5], [0, 1], [-SQ3 / 2, 0.5], [-SQ3 / 2, -0.5]].map(([a, b]) => at.get(key(cx + a * D, cy + b * D)));
  if (corners.every(Boolean)) HEXES.push({ x: cx, y: cy });
}
// target orientations: [V axis, opening angle, foreshortening of the 2nd H]
const DEG = Math.PI / 180;
const target = (s) => (s.type === 'A' ? [-Math.PI / 2, 120 * DEG, 1] : [(-90 + 104.5 / 2) * DEG, 104.5 * DEG, 0.22]);
// the liquid: random, closer-packed positions in a smaller box, matched to the sites
{
  const rnd = mulberry32(29);
  const cx = 432, cy = 457, bw = 600 * 0.86, bh = 470 * 0.86;
  const pts = [];
  let tries = 0;
  while (pts.length < SITES.length && tries++ < 200000) {
    const x = cx + (rnd() - 0.5) * bw, y = cy + (rnd() - 0.5) * bh;
    if (pts.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 > 47 * 47)) pts.push({ x, y });
  }
  const free = pts.slice();
  const order = SITES.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
  for (const s of order) {
    let best = 0, bd = Infinity;
    free.forEach((p, i) => { const d2 = (p.x - s.x) ** 2 + (p.y - s.y) ** 2; if (d2 < bd) { bd = d2; best = i; } });
    const p = free.splice(best, 1)[0] ?? { x: s.x, y: s.y };
    s.lx = p.x; s.ly = p.y;
    s.ph = [rnd() * TAU, rnd() * TAU, rnd() * TAU]; s.w = [0.7 + rnd() * 0.8, 0.6 + rnd() * 0.8, 0.5 + rnd() * 0.7];
    s.a0 = rnd() * TAU; s.spin = (rnd() - 0.5) * 1.1;
    s.lock = 19.7 + 2.6 * ((s.y - 236) / 448) + rnd() * 0.25; // a freezing front sweeping down
  }
}
const FOCUS = SITES.reduce((b, s) => ((s.lx - 432) ** 2 + (s.ly - 450) ** 2 < (b.lx - 432) ** 2 + (b.ly - 450) ** 2 ? s : b));

function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }

function molecule(x, y, axis, open, fore = 1, scale = 1, a = 1) {
  withAlpha(a, () => {
    const h1 = axis - open / 2, h2 = axis + open / 2;
    const p1 = [x + Math.cos(h1) * OH * scale, y + Math.sin(h1) * OH * scale];
    const p2 = [x + Math.cos(h2) * OH * scale * fore, y + Math.sin(h2) * OH * scale * fore];
    ctx.strokeStyle = 'rgba(230,248,255,0.9)'; ctx.lineWidth = 5 * scale; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...p1); ctx.stroke();
    if (fore > 0.5) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...p2); ctx.stroke(); }
    const ball = (px, py, r, hi, mid, lo) => {
      const g = ctx.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.1, px, py, r);
      g.addColorStop(0, hi); g.addColorStop(0.55, mid); g.addColorStop(1, lo);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill();
    };
    ball(p1[0], p1[1], HR * scale, '#FFFFFF', C.hyd, '#A9C8DA');
    if (fore > 0.5) ball(p2[0], p2[1], HR * scale, '#FFFFFF', C.hyd, '#A9C8DA');
    ball(x, y, OR * scale, C.oxyHi, C.oxy, C.oxyLo);
    if (fore <= 0.5) ball(p2[0], p2[1], HR * scale * lerp(0.75, 1, fore * 2), '#FFFFFF', C.hyd, '#A9C8DA'); // pointing at you
  });
}

function molState(s, t) {
  const f = eio(seg(t, s.lock, s.lock + 1.3));
  const wob = 1 - f;
  const lx = s.lx + Math.sin(t * s.w[0] + s.ph[0]) * 9 + Math.sin(t * 2.3 * s.w[1] + s.ph[1]) * 4;
  const ly = s.ly + Math.cos(t * s.w[1] + s.ph[1]) * 9 + Math.cos(t * 1.9 * s.w[2] + s.ph[2]) * 4;
  const la = s.a0 + s.spin * t + Math.sin(t * s.w[2] + s.ph[2]) * 0.8;
  const [ta, topen, tfore] = target(s);
  // freeze the liquid angle at the moment it starts to lock, then ease to the target
  const laLock = s.a0 + s.spin * s.lock + Math.sin(s.lock * s.w[2] + s.ph[2]) * 0.8;
  const aNow = f > 0 ? laLock + angDiff(laLock, ta) * f : la;
  return {
    x: lerp(lx, s.x, f), y: lerp(ly, s.y, f), axis: aNow, open: lerp(104.5 * DEG, topen, f), fore: lerp(1, tfore, f), f, wob,
  };
}

function sceneB(t) {
  const inA = eout(seg(t, 10.0, 11.0));
  // one molecule in close-up, then the crowd
  const crowd = eio(seg(t, 14.6, 15.8));
  const states = SITES.map((s) => molState(s, t));
  // hexagon glow (behind)
  const hx = seg(t, 24.2, 25.4);
  if (hx > 0) {
    for (const h of HEXES) {
      withAlpha(hx * (0.55 + 0.25 * Math.sin(t * 2.4 + h.x * 0.02 + h.y * 0.03)), () => {
        const g = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, D * 0.9);
        g.addColorStop(0, 'rgba(127,227,255,0.30)'); g.addColorStop(1, 'rgba(127,227,255,0)');
        ctx.fillStyle = g; hexPath(ctx, h.x, h.y, D * 0.82, -Math.PI / 2); ctx.fill();
      });
    }
  }
  // hydrogen bonds
  ctx.setLineDash([6, 7]); ctx.lineCap = 'butt';
  for (const b of HBONDS) {
    const sa = states[b.from.i], sb = states[b.to.i];
    const a = seg(t, Math.max(b.from.lock, b.to.lock) + 1.0, Math.max(b.from.lock, b.to.lock) + 1.8);
    if (a <= 0) continue;
    withAlpha(a * crowd, () => {
      const x1 = sa.x + b.dx * OH, y1 = sa.y + b.dy * OH;
      const x2 = sb.x - b.dx * (OR + 3), y2 = sb.y - b.dy * (OR + 3);
      ctx.strokeStyle = C.bond; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lerp(x1, x2, 0.15), lerp(y1, y2, 0.15)); ctx.lineTo(x2, y2); ctx.stroke();
    });
  }
  ctx.setLineDash([]);
  // the molecules
  SITES.forEach((s, i) => {
    const st = states[i];
    if (s === FOCUS) {
      const sc = lerp(4.2, 1, crowd);
      const x = lerp(432, st.x, crowd), y = lerp(430, st.y, crowd);
      const ax = lerp(-Math.PI / 2 + Math.sin(t * 0.8) * 0.15, st.axis, crowd);
      molecule(x, y, ax, st.open, st.fore, sc, inA);
    } else {
      molecule(st.x, st.y, st.axis, st.open, st.fore, 1, inA * crowd * (0.75 + 0.25 * st.f));
    }
  });
  // close-up labels
  withAlpha(span(t, 11.2, 15.0, 0.5, 0.4), () => {
    const sc = 4.2, ax = -Math.PI / 2 + Math.sin(t * 0.8) * 0.15, op = 104.5 * DEG;
    const r = OH * sc;
    // angle arc, outside the oxygen ball
    ctx.strokeStyle = C.warm; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(432, 430, OR * sc + 16, ax - op / 2, ax + op / 2); ctx.stroke();
    font(600, 30, MONO); text('104.5°', 432 + Math.cos(ax) * (r + 52), 430 + Math.sin(ax) * (r + 52), { color: C.warm, align: 'center', base: 'middle' });
    font(600, 30); text('oxygen', 432, 430 + OR * sc + 36, { color: C.oxyHi, align: 'center', base: 'middle' });
    const h1 = ax - op / 2, h2 = ax + op / 2;
    text('hydrogen', 432 + Math.cos(h1) * r - HR * sc - 14, 430 + Math.sin(h1) * r, { color: C.hyd, align: 'right', base: 'middle' });
    text('hydrogen', 432 + Math.cos(h2) * r + HR * sc + 14, 430 + Math.sin(h2) * r, { color: C.hyd, align: 'left', base: 'middle' });
  });
  // the open space in a ring
  withAlpha(span(t, 25.4, 29.6, 0.5, 0.3), () => {
    const h = HEXES.reduce((b, q) => (Math.abs(q.x - 432) + Math.abs(q.y - 470) < Math.abs(b.x - 432) + Math.abs(b.y - 470) ? q : b));
    ctx.strokeStyle = C.warm; ctx.lineWidth = 4; hexPath(ctx, h.x, h.y, D * 0.98, -Math.PI / 2); ctx.stroke();
    font(600, 26);
    const lx = h.x + 150, ly = h.y - 168;
    rrect(lx - 98, ly - 24, 196, 48, 24); ctx.fillStyle = 'rgba(4,20,38,0.88)'; ctx.fill();
    text('empty space', lx, ly + 1, { color: C.warm, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx - 50, ly + 24); ctx.lineTo(h.x + 8, h.y - 8); ctx.stroke();
  });
  // phase tag and legend
  withAlpha(inA * crowd, () => {
    const frozen = seg(t, 21.6, 22.4);
    font(700, 24);
    withAlpha(Math.max(0, 1 - 2 * frozen), () => text('LIQUID WATER', 64, 150, { color: C.cyan, spacing: '2px' }));
    withAlpha(Math.max(0, 2 * frozen - 1), () => text('ICE', 64, 150, { color: C.ice, spacing: '2px' }));
    font(400, 22); text('diagram, 2D view', 800, 150, { color: C.inkDim, align: 'right' });
    legend(742);
  });
}
function legend(y) {
  font(500, 22);
  const items = [['oxygen', 'O'], ['hydrogen', 'H'], ['hydrogen bond', 'B']];
  let widths = items.map(([s]) => ctx.measureText(s).width + 52);
  let x = W / 2 - widths.reduce((a, b) => a + b, 0) / 2;
  items.forEach(([s, kind], i) => {
    if (kind === 'O') { ctx.fillStyle = C.oxy; ctx.beginPath(); ctx.arc(x + 12, y, 11, 0, TAU); ctx.fill(); }
    if (kind === 'H') { ctx.fillStyle = C.hyd; ctx.beginPath(); ctx.arc(x + 12, y, 7, 0, TAU); ctx.fill(); }
    if (kind === 'B') { ctx.setLineDash([5, 5]); ctx.strokeStyle = C.bond; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30, y); ctx.stroke(); ctx.setLineDash([]); }
    text(s, x + 36, y + 1, { color: C.inkSoft, base: 'middle' });
    x += widths[i];
  });
}

// ---------- C: same volume, less mass ----------
function sceneC(t) {
  const tilt = -7 * DEG * eio(seg(t, 30.4, 31.8));
  const px = 432, py = 300, L = 250;
  // stand
  ctx.fillStyle = 'rgba(200,236,255,0.35)';
  rrect(px - 8, py, 16, 380, 6); ctx.fill();
  rrect(px - 120, py + 376, 240, 18, 9); ctx.fill();
  // beam
  ctx.save(); ctx.translate(px, py); ctx.rotate(tilt);
  ctx.fillStyle = 'rgba(220,244,255,0.85)'; rrect(-L - 10, -7, 2 * L + 20, 14, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.ice; ctx.beginPath(); ctx.arc(px, py, 13, 0, TAU); ctx.fill();
  // pointer
  ctx.save(); ctx.translate(px, py); ctx.rotate(tilt);
  ctx.strokeStyle = C.warm; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 120); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(234,248,255,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, py, 120, Math.PI / 2 - 0.3, Math.PI / 2 + 0.3); ctx.stroke();
  // pans
  for (const side of [-1, 1]) {
    const ex = px + Math.cos(tilt) * L * side, ey = py + Math.sin(tilt) * L * side;
    const panY = ey + 170;
    ctx.strokeStyle = 'rgba(220,244,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 80, panY); ctx.moveTo(ex, ey); ctx.lineTo(ex + 80, panY); ctx.stroke();
    ctx.fillStyle = 'rgba(220,244,255,0.8)';
    ctx.beginPath(); ctx.moveTo(ex - 96, panY); ctx.lineTo(ex + 96, panY); ctx.quadraticCurveTo(ex + 80, panY + 22, ex, panY + 22); ctx.quadraticCurveTo(ex - 80, panY + 22, ex - 96, panY); ctx.fill();
    const s = 104;
    if (side < 0) {
      // a cube of water in a thin glass box
      const g = ctx.createLinearGradient(0, panY - s, 0, panY);
      g.addColorStop(0, 'rgba(80,170,230,0.85)'); g.addColorStop(1, 'rgba(25,90,165,0.95)');
      ctx.fillStyle = g; rrect(ex - s / 2, panY - s, s, s, 6); ctx.fill();
      ctx.strokeStyle = C.glass; ctx.lineWidth = 3; rrect(ex - s / 2, panY - s, s, s, 6); ctx.stroke();
      ctx.strokeStyle = 'rgba(210,245,255,0.8)'; ctx.beginPath(); ctx.moveTo(ex - s / 2 + 4, panY - s + 12); ctx.lineTo(ex + s / 2 - 4, panY - s + 12); ctx.stroke();
    } else {
      iceBlock(ex, panY - s / 2, s, s, 0, 1);
    }
    const lab = side < 0 ? ['1 cm³ of water', RHO_WATER.toFixed(4) + ' g', C.cyan] : ['1 cm³ of ice', RHO_ICE.toFixed(4) + ' g', C.ice];
    withAlpha(seg(t, 29.8, 30.4), () => {
      font(500, 26); text(lab[0], ex, panY + 62, { color: C.inkSoft, align: 'center', base: 'middle' });
      font(600, 34, MONO); text(lab[1], ex, panY + 104, { color: lab[2], align: 'center', base: 'middle' });
    });
  }
  withAlpha(seg(t, 32.0, 32.6), () => {
    const ex = px + Math.cos(tilt) * L, ey = py + Math.sin(tilt) * L;
    const sc = 0.9 + 0.1 * back(seg(t, 32.0, 32.5));
    ctx.save(); ctx.translate(ex, ey - 72); ctx.scale(sc, sc);
    font(700, 28, MONO);
    const s = `${LESS.toFixed(1)}% lighter`, w = ctx.measureText(s).width + 40;
    rrect(-w / 2, -26, w, 52, 26); ctx.fillStyle = C.warm; ctx.fill();
    text(s, 0, 1, { color: '#2A1A00', align: 'center', base: 'middle' });
    ctx.restore();
  });
}

// ---------- D: the lake ----------
const LAKE = { top: 452, bot: 728, x0: 40, x1: 824 };
function lakePath() {
  const { top, bot, x0, x1 } = LAKE;
  ctx.beginPath();
  ctx.moveTo(x0 - 40, top);
  ctx.lineTo(x1 + 40, top);
  ctx.bezierCurveTo(x1 - 10, top + 90, x1 - 70, bot, W / 2 + 120, bot);
  ctx.bezierCurveTo(W / 2 + 40, bot + 10, W / 2 - 120, bot + 6, W / 2 - 200, bot - 4);
  ctx.bezierCurveTo(x0 + 70, bot - 20, x0 + 10, top + 100, x0 - 40, top);
  ctx.closePath();
}
const tempColour = (T) => {
  // 8 °C teal, 4 °C deep blue, 0 °C pale ice-blue
  const stops = [[0, [118, 196, 232]], [4, [16, 62, 122]], [8, [32, 120, 150]]];
  T = clamp(T, 0, 8);
  const i = T < 4 ? 0 : 1, [ta, ca] = stops[i], [tb, cb] = stops[i + 1], x = (T - ta) / (tb - ta);
  return ca.map((c, j) => Math.round(lerp(c, cb[j], x)));
};
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const rho = (T) => 0.99997 - 8e-6 * (T - 3.98) ** 2; // fits the source's 0 °C and 3.98 °C values

function surfaceT(t) {
  if (t < 40.4) return lerp(8, 4, eio(seg(t, 35.0, 38.6)));
  return lerp(4, 0, eio(seg(t, 40.6, 43.2)));
}
function bottomT(t) { return lerp(8, 4, eio(seg(t, 35.6, 39.6))); }

const BLOBS = Array.from({ length: 8 }, (_, i) => ({ x: 150 + i * 80 + (i % 2) * 22, t0: 35.3 + i * 0.42, depth: 0.82 - (i % 3) * 0.08 }));
const FISH = [{ y: 566, x0: 250, sp: 0.35, s: 1 }, { y: 600, x0: 570, sp: -0.28, s: 0.8 }, { y: 630, x0: 400, sp: 0.22, s: 0.65 }];

function sceneD(t) {
  const { top, bot } = LAKE;
  const Ts = surfaceT(t), Tb = bottomT(t);
  const ice = eio(seg(t, 42.4, 45.6)) * 34;
  // night sky glow above the horizon
  const sg = ctx.createLinearGradient(0, 300, 0, top);
  sg.addColorStop(0, 'rgba(60,130,190,0)'); sg.addColorStop(1, 'rgba(90,160,210,0.18)');
  ctx.fillStyle = sg; ctx.fillRect(0, 300, W, top - 300);
  // moon
  const mg = ctx.createRadialGradient(660, 228, 4, 660, 228, 90);
  mg.addColorStop(0, 'rgba(230,248,255,0.35)'); mg.addColorStop(1, 'rgba(230,248,255,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(660, 228, 90, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8F7FF'; ctx.beginPath(); ctx.arc(660, 228, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(2,10,20,0.9)'; ctx.beginPath(); ctx.arc(674, 220, 27, 0, TAU); ctx.fill();
  // ground
  ctx.fillStyle = '#081625'; ctx.fillRect(0, top - 2, W, 930 - top);
  const gg = ctx.createLinearGradient(0, top, 0, 930);
  gg.addColorStop(0, 'rgba(40,70,100,0.6)'); gg.addColorStop(1, 'rgba(4,10,20,0)');
  ctx.fillStyle = gg; ctx.fillRect(0, top - 2, W, 930 - top);
  // water, layered by temperature
  ctx.save(); lakePath(); ctx.clip();
  const wg = ctx.createLinearGradient(0, top, 0, bot);
  const layer = Ts < 4 ? 0.26 : 0.12;
  wg.addColorStop(0, rgb(tempColour(Ts))); wg.addColorStop(layer, rgb(tempColour(lerp(Ts, Tb, 0.4)))); wg.addColorStop(Math.min(0.9, layer + 0.25), rgb(tempColour(Tb))); wg.addColorStop(1, rgb(tempColour(Tb).map((c) => c * 0.8)));
  ctx.fillStyle = wg; ctx.fillRect(0, top, W, bot - top + 20);
  // sinking parcels of cooled surface water
  for (const b of BLOBS) {
    const p = seg(t, b.t0, b.t0 + 2.0);
    if (p <= 0 || p >= 1) continue;
    const y = lerp(top + 14, top + (bot - top) * b.depth, eio(p));
    withAlpha(Math.sin(Math.PI * p), () => {
      const c = tempColour(lerp(8, 4, seg(b.t0, 35.0, 38.6)) - 0.6);
      const g = ctx.createRadialGradient(b.x, y, 2, b.x, y, 26);
      g.addColorStop(0, rgb(c.map((v) => v * 0.7), 0.9)); g.addColorStop(1, rgb(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, y, 26, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(234,248,255,0.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(b.x, y - 30); ctx.lineTo(b.x, y - 6); ctx.lineTo(b.x - 7, y - 14); ctx.moveTo(b.x, y - 6); ctx.lineTo(b.x + 7, y - 14); ctx.stroke();
    });
  }
  // fish near the bottom
  withAlpha(seg(t, 44.8, 46.0), () => {
    for (const f of FISH) {
      const x = f.x0 + Math.sin(t * f.sp * 1.4) * 70, dir = Math.cos(t * f.sp * 1.4) * f.sp >= 0 ? 1 : -1;
      fish(x, f.y + Math.sin(t * 1.3 + f.x0) * 5, 34 * f.s, dir, t);
    }
  });
  ctx.restore();
  // ice lid
  if (ice > 0.5) {
    ctx.save(); lakePath(); ctx.clip();
    const ig = ctx.createLinearGradient(0, top - 3, 0, top + ice);
    ig.addColorStop(0, '#F2FCFF'); ig.addColorStop(1, '#A9E3F7');
    ctx.fillStyle = ig; ctx.fillRect(0, top - 3, W, ice + 3);
    ctx.strokeStyle = 'rgba(80,150,200,0.45)'; ctx.lineWidth = 2;
    for (const cx of [180, 330, 520, 690]) { ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx + 14, top + ice * 0.6); ctx.lineTo(cx + 4, top + ice); ctx.stroke(); }
    ctx.restore();
    // glint
    withAlpha(seg(t, 46, 47) * (0.5 + 0.5 * Math.sin(t * 2)), () => {
      const gx = 200 + ((t * 120) % 500);
      const lg = ctx.createLinearGradient(gx - 40, 0, gx + 40, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg; ctx.fillRect(gx - 40, top - 3, 80, 6);
    });
  }
  // the banks, with snow
  ctx.fillStyle = '#0B1B2C';
  ctx.beginPath(); ctx.moveTo(0, top - 30); ctx.quadraticCurveTo(50, top - 34, 92, top - 4); ctx.lineTo(60, top + 60); ctx.lineTo(0, top + 140); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, top - 40); ctx.quadraticCurveTo(W - 50, top - 38, W - 96, top - 4); ctx.lineTo(W - 60, top + 60); ctx.lineTo(W, top + 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(225,245,255,0.85)';
  ctx.beginPath(); ctx.moveTo(0, top - 30); ctx.quadraticCurveTo(50, top - 34, 92, top - 4); ctx.quadraticCurveTo(50, top - 22, 0, top - 22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, top - 40); ctx.quadraticCurveTo(W - 50, top - 38, W - 96, top - 4); ctx.quadraticCurveTo(W - 50, top - 30, W, top - 32); ctx.closePath(); ctx.fill();
  // labels
  font(600, 26, MONO);
  withAlpha(1 - seg(t, 37.0, 37.8), () => text('8 °C', W / 2, (top + bot) / 2, { color: C.ink, align: 'center', base: 'middle' }));
  withAlpha(seg(t, 38.6, 39.4), () => {
    text('4 °C', W / 2, bot - 28, { color: C.warm, align: 'center', base: 'middle' });
    font(500, 22); text('densest water', W / 2, bot - 58, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  withAlpha(seg(t, 43.4, 44.2), () => {
    font(600, 26, MONO); text('0 °C', W / 2 - 170, top + ice + 34, { color: C.ice, align: 'center', base: 'middle' });
    font(700, 24); text('ICE', W / 2, top + ice / 2 + 1, { color: '#164A73', align: 'center', base: 'middle', spacing: '4px' });
  });
  // snow
  for (let i = 0; i < 40; i++) {
    const r = mulberry32(i + 100), sx = r() * W, sp = 20 + r() * 30, ph = r() * 600;
    const y = 120 + ((t * sp + ph) % 340);
    const x = sx + Math.sin(t * 0.8 + i) * 12;
    if (x > 740 && y < 130) continue;
    ctx.fillStyle = `rgba(235,248,255,${0.35 + r() * 0.4})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + r() * 2, 0, TAU); ctx.fill();
  }
  densityChart(t, Ts);
}
function fish(x, y, s, dir, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(190,230,250,0.75)';
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.38, 0, 0, TAU); ctx.fill();
  const wag = Math.sin(t * 6) * s * 0.12;
  ctx.beginPath(); ctx.moveTo(-s * 0.85, 0); ctx.lineTo(-s * 1.45, -s * 0.38 + wag); ctx.lineTo(-s * 1.45, s * 0.38 + wag); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0C2A48'; ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.06, s * 0.08, 0, TAU); ctx.fill();
  ctx.restore();
}
function densityChart(t, Ts) {
  const x0 = 96, x1 = 420, y0 = 330, y1 = 176; // 0..10 °C, density 0.99965..1.00000
  const X = (T) => lerp(x0, x1, T / 10), Y = (r) => lerp(y0, y1, (r - 0.99965) / 0.00035);
  withAlpha(seg(t, 35.0, 35.8), () => {
    ctx.fillStyle = 'rgba(2,12,24,0.6)'; rrect(x0 - 36, y1 - 44, x1 - x0 + 64, y0 - y1 + 96, 16); ctx.fill();
    font(600, 22); text('Density of water', x0 - 16, y1 - 18, { color: C.inkSoft });
    ctx.strokeStyle = 'rgba(234,248,255,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    font(400, 22, MONO);
    for (const T of [0, 4, 8]) text(`${T}`, X(T), y0 + 22, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('°C', X(10), y0 + 22, { color: C.inkSoft, align: 'center', base: 'middle' });
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.beginPath();
    for (let T = 0; T <= 10.001; T += 0.1) { const x = X(T), y = Y(rho(T)); T ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // peak
    ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,194,102,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(3.98), Y(rho(3.98))); ctx.lineTo(X(3.98), y0); ctx.stroke(); ctx.setLineDash([]);
    font(500, 22); text('densest', X(3.98) + 14, Y(rho(3.98)) - 22, { color: C.warm, base: 'middle' });
    // where the surface water is now
    const x = X(Ts), y = Y(rho(Ts));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(2,12,24,0.9)'; ctx.lineWidth = 3; ctx.stroke();
  });
}

// ---------- E: payoff ----------
function sceneE(t) {
    const p = eout(seg(t, 51.0, 51.8));
  ctx.save(); ctx.translate(0, (1 - p) * 20);
  snowflake(W / 2, 236, 46, t * 0.2, C.ice);
  font(800, 92); text('ICE FLOATS', W / 2, 372, { color: C.ice, align: 'center', base: 'middle', spacing: '4px' });
  font(500, 34); text('Hydrogen bonds hold frozen water', W / 2, 462, { color: C.ink, align: 'center', base: 'middle' });
  text('molecules apart, so ice takes more room.', W / 2, 506, { color: C.ink, align: 'center', base: 'middle' });
  font(600, 28, MONO);
  text(`ice ${RHO_ICE} g/cm³`, W / 2, 590, { color: C.ice, align: 'center', base: 'middle' });
  text(`water ${RHO_WATER} g/cm³ (0 °C)`, W / 2, 634, { color: C.cyan, align: 'center', base: 'middle' });
  font(400, 22);
  text('Source: Wikipedia, “Ice” and “Properties of water”', W / 2, 860, { color: C.inkDim, align: 'center', base: 'middle' });
  text('Molecules and lake are diagrams, not to scale', W / 2, 892, { color: C.inkDim, align: 'center', base: 'middle' });
  ctx.restore();
}

// ---------- captions ----------
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
  // a soft band behind the captions
  const any = CUES.some(([a, b]) => t >= a - 0.3 && t <= b + 0.3);
  if (any) {
    const g = ctx.createLinearGradient(0, 760, 0, 910);
    g.addColorStop(0, 'rgba(2,10,20,0)'); g.addColorStop(0.3, 'rgba(2,10,20,0.55)'); g.addColorStop(0.7, 'rgba(2,10,20,0.55)'); g.addColorStop(1, 'rgba(2,10,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 760, W, 150);
  }
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 834, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.cyan, '~': C.warm } });
  }
}

Kit.scene({
  width: W, height: H, duration: 56,
  fonts: [
    { family: SANS, file: 'Jost.woff2', weight: '100 900' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B, 0.5], [sceneC, T.C], [sceneD, T.D, 0.35, 0.6], [sceneE, T.E, 0.5, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
