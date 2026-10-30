// Explainer for engineering-vatican-double-helix-stairs (Roma): Giuseppe Momo's staircase of 1932 at the Vatican
// Museums is two ramps wound into one funnel-shaped shaft, one for going up and one for coming down, so the two
// streams never meet. The animation builds the two ramps half a turn apart, sends walkers up and down, cuts the shaft
// to show the floors alternating, then compares Donato Bramante's older single spiral ramp for horses and mules and
// Orvieto's well. Look: Art Deco of 1932, the shaft's green cipollino marble and bronze balustrades on a deep
// green-black ground; the up ramp amber, the down ramp sky blue. Jost for captions and labels, EB Garamond italic for
// the Renaissance part.
//
// Facts:
// - Barbara Jatta (director of the Vatican Museums), "Il Portone d'ingresso dei Musei Vaticani", L'Osservatore Romano,
//   7 December 2020 (museivaticani.va PDF): Pius XI opened the new entrance in the Sangallo walls on Viale Vaticano on
//   7 December 1932; the project began in August 1929; Giuseppe Momo engineer and architect. Quoting the 1932 booklet:
//   to climb the 22 m from the street to the level of the Vatican Gardens, a pit shaped like a truncated cone was dug,
//   in which two parallel helical ramps wind, one for visitors going up, the other for those coming down; 15,000 m³ of
//   earth removed; each ramp 94 m long; walls in green cipollino, bronze balustrades by Antonio Maraini cast by the
//   Marinelli foundry; Pius XI's medal celebrated the project as inspired by the Pozzo di San Patrizio in Orvieto.
//   Another entrance was opened beside it for the Jubilee of 2000.
// - F. Di Paola, "Genesi geometrica della scala di Momo ai Musei Vaticani", Life Safety and Security 4 (8), 2016:
//   reinforced concrete; the double ramp in the bastion's embankment was Pius XI's idea; the shaft is a truncated cone
//   whose apex lies below the first step (it narrows downwards); the project drawings show the ramp's inner curve in
//   plan is an Archimedean spiral, so the ramps follow conical spirals, not conical helices.
// - en.wikipedia.org "Bramante Staircase": Momo's stair circles a stairwell about 15 m wide with a clear space at the
//   centre; it is commonly called the "Bramante Staircase"; visitors leave the museum by it.
// - Bernd Grimm, "Rampa (Scala) del Bramante, Vatikan", research project 2015–18 (villamassimo.de): Bramante's spiral
//   ramp in a 25 m tower on the north-east of the Vatican palaces; patron Pope Julius II; 4½ full turns with 8 column
//   axes a turn, 36 columns: 8 Tuscan, 8 Doric, 8 Ionic, 12 Composite; column spiral radius 189 cm, rise 378 cm a turn.
//   Sir John Soane's Museum record ARC18373 (after Denker Nesselrath 1996): begun by 1512, perhaps proposed around
//   1507; "a ramp for access by horse or mule".
// - en.wikipedia.org "Pozzo di San Patrizio": Orvieto, Antonio da Sangallo the Younger, 1527–1537, for Pope Clement VII;
//   53.15 m deep, 13 m wide at the base; two spiral ramps, donkeys down one and up the other, never meeting.
// Computed here: every ramp and column position in 3D and its projection, the walkers' positions, the alternating
// floors in the section, and Bramante's 36 columns from 8 a turn and 4½ turns. Schematic, said on screen: the number
// of turns of Momo's ramps, the shaft's radii and the ramps' width.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The shaft: a funnel 22 m deep from the street to the gardens' level.
//  B  9.6–18.6  Ramp one (up) winds in, then ramp two (down), each 94 m.
//  C 18.8–27.8  Half a turn apart: a plan inset; walkers go up and down and never meet.
//  D 28.0–37.0  A cut through the wall: up and down floors alternate; each must climb twice its headroom a turn.
//  E 37.2–41.6  Seen from above: the ramps curl inwards, conical spirals.
//  F 41.8–55.4  Bramante's real staircase: one ramp, 4½ turns, 8 columns a turn, four orders.
//  G 55.6–60.0  Orvieto's well, 1527–1537: the double helix for donkeys.
//  H 60.2–65.0  Since 2000, the 1932 staircase is the way out.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const TAU = Math.PI * 2;

const C = {
  bg: '#0e1c18', bg2: '#17302a', ink: '#f1efe6', soft: 'rgba(241,239,230,0.74)', faint: 'rgba(241,239,230,0.22)',
  wall: '#3f6e5d', wall2: '#2b4f43', vein: 'rgba(200,235,215,0.16)', bronze: '#c99a4b', up: '#f2b24a', down: '#7cc8ec',
  floor: '#b9aaa2', stone: '#d9cdb5', red: '#ef8a6a', orders: ['#cbb38b', '#d9c49e', '#e6d5b3', '#f3e7cc'],
};
const SANS = 'Jost', SERIF = 'EB Garamond';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- Momo's shaft, in metres (sourced: 22 m, 94 m a ramp, 15 m wide at the top; schematic: the rest) ----------
const DEPTH = 22, RAMP_LEN = 94, R_TOP = 7.5, R_BOT = 5.2, WID = 2.3, TURNS = 2.5;
const rOut = (z) => R_BOT + ((R_TOP - R_BOT) * z) / DEPTH;
const PITCH = DEPTH / TURNS; // what each ramp climbs in one turn (schematic)
// a ramp: z rises with the angle; ramp two starts half a turn round
const rampZ = (th, start) => ((th - start) / TAU) * PITCH;
const STARTS = [Math.PI / 2, Math.PI / 2 + Math.PI];
// ---------- Bramante's ramp (Grimm): 4½ turns, 8 columns a turn, radius 1.89 m, 3.78 m a turn ----------
const B_TURNS = 4.5, B_PER_TURN = 8, B_R = 1.89, B_RISE = 3.78;
const B_COLS = B_TURNS * B_PER_TURN, B_ORDERS = [['Tuscan', 8], ['Doric', 8], ['Ionic', 8], ['Composite', 12]];
if (B_COLS !== 36 || B_ORDERS.reduce((s, o) => s + o[1], 0) !== B_COLS || Math.abs(B_RISE / B_R - 2) > 1e-9) throw new Error('Bramante');

// ---------- projection: an oblique view from above the rim ----------
let V = { cx: CX, base: 730, sx: 40, sy: 11, sz: 20.9 };
const proj = (r, th, z) => [V.cx + r * Math.cos(th) * V.sx, V.base - z * V.sz + r * Math.sin(th) * V.sy];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'In 1932 the Vatican Museums opened a new entrance, with a staircase by Giuseppe Momo.'],
  [5.0, 9.4, `It climbs *${DEPTH} m* from the street, in a pit shaped like a funnel, dug into the old walls.`],
  [9.6, 14.0, `Inside wind not one but *two* ramps, each ${RAMP_LEN} m long.`],
  [14.2, 18.6, 'One was for visitors going ~up~, the other for those coming ^down^.'],
  [18.8, 23.2, 'The second ramp starts half a turn round from the first: a *double helix*.'],
  [23.4, 27.8, 'Walk up one and people coming down pass above and below you, but you never meet.'],
  [28.0, 32.4, 'Cut through the shaft anywhere and the floors alternate: ~up~, ^down^, ~up~, ^down^.'],
  [32.6, 37.0, 'The other ramp runs overhead, so each must climb twice its headroom on every turn.'],
  [37.2, 41.6, 'Strictly they are *conical spirals*: the pit narrows downwards, so the ramps curl in.'],
  [41.8, 46.2, 'Momo’s stair is often called the Bramante Staircase, but Donato Bramante’s is older.'],
  [46.4, 50.8, 'Begun by 1512 for Pope Julius II, it is a *single* spiral ramp, for horses and mules.'],
  [51.0, 55.4, `It turns ${'4½'} times round an open well, ${B_PER_TURN} columns a turn: ${B_COLS} in all, Tuscan to Composite.`],
  [55.6, 60.0, 'Momo’s model was Orvieto’s well of 1527–1537: donkeys went down one ramp, up the other.'],
  [60.2, 64.6, 'Since 2000 a newer entrance takes visitors in: Momo’s staircase is now the way out.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // Art Deco sunburst, very faint
  g.strokeStyle = 'rgba(201,154,75,0.05)'; g.lineWidth = 2;
  for (let i = 0; i < 36; i++) { const t = (i * TAU) / 36; g.beginPath(); g.moveTo(CX, 470); g.lineTo(CX + Math.cos(t) * 900, 470 + Math.sin(t) * 900); g.stroke(); }
}

function pill(str, x, y, col, align = 'center', size = 22) {
  font(600, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(14,28,24,0.88)'; k.rrect(x0 - 10, y - size * 0.75, w + 20, size * 1.5, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}

// ---------- the shaft and its ramps ----------
function shaftWall(a, { rTop = R_TOP, rBot = R_BOT, depth = DEPTH } = {}) {
  A(a, () => {
    // the back half of the cone, filled; the front half only outlined
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) { const th = Math.PI + (i / 48) * Math.PI; const [x, y] = proj(rTop, th, depth); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    for (let i = 48; i >= 0; i--) { const th = Math.PI + (i / 48) * Math.PI; const [x, y] = proj(rBot, th, 0); ctx.lineTo(x, y); }
    ctx.closePath();
    const g = ctx.createLinearGradient(V.cx - rTop * V.sx, 0, V.cx + rTop * V.sx, 0);
    g.addColorStop(0, C.wall2); g.addColorStop(0.5, C.wall); g.addColorStop(1, C.wall2);
    ctx.fillStyle = g; ctx.fill();
    // marble veins
    ctx.save(); ctx.clip(); ctx.strokeStyle = C.vein; ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { const x = V.cx - rTop * V.sx + i * 46; ctx.beginPath(); ctx.moveTo(x, V.base - depth * V.sz - 120); ctx.bezierCurveTo(x + 30, V.base - depth * V.sz * 0.6, x - 30, V.base - depth * V.sz * 0.3, x + 18, V.base + 40); ctx.stroke(); }
    ctx.restore();
    // the floor of the pit and the rim
    ctx.fillStyle = 'rgba(185,170,162,0.35)';
    ctx.beginPath(); { const [x, y] = proj(0, 0, 0); ctx.ellipse(x, y, rBot * V.sx, rBot * V.sy, 0, 0, TAU); } ctx.fill();
    ctx.strokeStyle = C.stone; ctx.lineWidth = 3;
    ctx.beginPath(); { const [x, y] = proj(0, 0, depth); ctx.ellipse(x, y, rTop * V.sx, rTop * V.sy, 0, 0, TAU); } ctx.stroke();
    ctx.setLineDash([6, 7]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    for (const sd of [-1, 1]) { const [x0, y0] = proj(rTop, sd > 0 ? 0 : Math.PI, depth), [x1, y1] = proj(rBot, sd > 0 ? 0 : Math.PI, 0); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    ctx.beginPath(); { const [x, y] = proj(0, 0, 0); ctx.ellipse(x, y, rBot * V.sx, rBot * V.sy, 0, 0, Math.PI); } ctx.stroke();
    ctx.setLineDash([]);
  });
}
/** Quads of one ramp, from its start up to the given share of its length; each with a depth for sorting. */
function rampQuads(start, prog, { turns = TURNS, pitch = PITCH, rO = rOut, wid = WID, col } = {}) {
  const out = [], n = Math.ceil(turns * 64), end = start + turns * TAU * prog;
  for (let i = 0; i < n; i++) {
    const t0 = start + (i / n) * turns * TAU, t1 = start + ((i + 1) / n) * turns * TAU;
    if (t0 >= end) break;
    const t1c = Math.min(t1, end), z0 = ((t0 - start) / TAU) * pitch, z1 = ((t1c - start) / TAU) * pitch;
    out.push({ t0, t1: t1c, z0, z1, ro0: rO(z0), ro1: rO(z1), wid, col, depth: Math.sin((t0 + t1c) / 2) });
  }
  return out;
}
function drawQuads(quads) {
  quads.sort((p, q) => p.depth - q.depth);
  for (const q of quads) {
    const a = proj(q.ro0, q.t0, q.z0), b = proj(q.ro1, q.t1, q.z1), c = proj(q.ro1 - q.wid, q.t1, q.z1), d = proj(q.ro0 - q.wid, q.t0, q.z0);
    // the underside edge (slab thickness), then the walking surface, then the bronze balustrade on the open side
    const th = 0.7 * V.sz;
    ctx.fillStyle = shade(q.col, 0.55);
    ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1] + th); ctx.lineTo(d[0], d[1] + th); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(q.col, 0.78 + 0.22 * Math.max(0, q.depth));
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.bronze; ctx.lineWidth = 2;
    const e = proj(q.ro0 - q.wid, q.t0, q.z0 + 1), f = proj(q.ro1 - q.wid, q.t1, q.z1 + 1);
    ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(f[0], f[1]); ctx.stroke();
  }
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgb(${Math.min(255, Math.round(r * f))},${Math.min(255, Math.round(g * f))},${Math.min(255, Math.round(b * f))})`;
}
function walker(start, s, col, a = 1) {
  // s: share of the way up the ramp (0 at the bottom)
  A(a, () => {
    const th = start + s * TURNS * TAU, z = s * DEPTH, r = rOut(z) - WID / 2;
    const [x, y] = proj(r, th, z + 0.1);
    ctx.fillStyle = C.ink; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y - 12, 6, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - 30, 6, 0, TAU); ctx.fill(); ctx.stroke();
  });
}
const MOMO_V = { cx: CX, base: 728, sx: 37, sy: 10.5, sz: 19 };

// ---------- A–C: the shaft, the two ramps, the walkers ----------
function sceneMomo(t) {
  const a = span(t, 0, 28.2, 0.5, 0.4);
  if (a <= 0) return;
  V = MOMO_V;
  shaftWall(a * seg(t, 0.2, 1.4));
  const p1 = eio(seg(t, 9.8, 13.0)), p2 = eio(seg(t, 14.4, 17.6));
  A(a, () => drawQuads([...rampQuads(STARTS[0], p1, { col: C.up }), ...rampQuads(STARTS[1], p2, { col: C.down })]));
  // labels: the street and the gardens, the depth
  A(a * seg(t, 1.6, 2.4), () => {
    font(600, 22); text('VATICAN MUSEUMS · GIUSEPPE MOMO · 1932', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const [, yt] = proj(R_TOP, Math.PI, DEPTH), [, yb] = proj(R_BOT, Math.PI, 0);
    pill('museum level', V.cx, yt - R_TOP * V.sy - 26, C.ink);
    pill('street entrance', 742, yb + 4, C.ink);
  });
  A(a * seg(t, 5.4, 6.2), () => {
    const [xt, yt] = proj(R_TOP, Math.PI, DEPTH), [, yb] = proj(R_BOT, Math.PI, 0), x = xt - 34;
    ctx.strokeStyle = C.bronze; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, yt); ctx.lineTo(x, yb); ctx.stroke();
    for (const y of [yt, yb]) { ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.stroke(); }
    pill(`${DEPTH} m`, x - 4, (yt + yb) / 2, C.bronze, 'right', 26);
  });
  A(a * seg(t, 11.0, 11.8), () => pill(`up · ${RAMP_LEN} m`, 742, 520, C.up, 'center'));
  A(a * seg(t, 15.6, 16.4), () => pill(`down · ${RAMP_LEN} m`, 130, 430, C.down, 'center'));
  // half a turn apart: a plan inset
  A(a * seg(t, 19.0, 19.8), () => {
    const cx = 790, cy = 196, R = 46;
    ctx.fillStyle = 'rgba(14,28,24,0.9)'; ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    const spin = seg(t, 19.6, 22.6) * TAU * 0.75;
    for (const [i, col] of [[0, C.up], [1, C.down]]) {
      const th = STARTS[i] + spin;
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R - 6 - i * 0, STARTS[i], th); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + Math.cos(STARTS[i]) * (R - 6), cy + Math.sin(STARTS[i]) * (R - 6), 7, 0, TAU); ctx.fill();
    }
    font(600, 17); text('starts', cx, cy - 10, { align: 'center', base: 'middle', color: C.soft });
    text('½ turn', cx, cy + 10, { align: 'center', base: 'middle', color: C.soft });
  });
  // walkers: up on ramp one, down on ramp two
  const w = seg(t, 23.4, 27.8);
  if (w > 0 && w < 1) {
    for (let i = 0; i < 3; i++) {
      const s1 = clamp(w * 0.9 + i * 0.22 - 0.1), s2 = clamp(1 - (w * 0.9 + i * 0.22 - 0.1));
      walker(STARTS[0], s1, C.up, a * span(t, 23.4, 27.8));
      walker(STARTS[1], s2, C.down, a * span(t, 23.4, 27.8));
    }
  }
  A(a * seg(t, 23.8, 24.4) * (1 - seg(t, 27.4, 27.8)), () => { pill('going up', 760, 330, C.up); pill('coming down', 760, 374, C.down); });
}

// ---------- D: a cut through the wall ----------
function sceneSection(t) {
  const a = span(t, 28.0, 37.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // a vertical slice on one side of the shaft: the wall on the right, the open well on the left
    const top = 200, bot = 720, sz = (bot - top) / DEPTH, wallX = 640, inX = wallX - 250;
    const Y = (z) => bot - z * sz;
    ctx.fillStyle = C.wall; ctx.fillRect(wallX, top - 30, 60, bot - top + 60);
    ctx.strokeStyle = C.vein; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(wallX + 10 * i, top - 30); ctx.lineTo(wallX + 10 * i + 20, bot + 30); ctx.stroke(); }
    font(600, 22); text('shaft wall', wallX + 30, top - 52, { align: 'center', base: 'middle', color: C.soft });
    text('open well', inX - 70, top - 52, { align: 'center', base: 'middle', color: C.soft });
    ctx.strokeStyle = C.faint; ctx.setLineDash([6, 7]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(inX - 40, top - 30); ctx.lineTo(inX - 40, bot + 30); ctx.stroke(); ctx.setLineDash([]);
    // the floors where the slice cuts each ramp: ramp one every PITCH, ramp two half a turn later
    const floors = [];
    for (let n = 0; n <= TURNS + 1; n++) for (const [i, off] of [[0, 0], [1, PITCH / 2]]) { const z = n * PITCH + off; if (z <= DEPTH + 0.01) floors.push({ z, i }); }
    floors.sort((p, q) => p.z - q.z);
    const shown = Math.floor(seg(t, 28.4, 31.4) * floors.length + 0.0001);
    floors.slice(0, shown).forEach(({ z, i }) => {
      ctx.fillStyle = i ? C.down : C.up; ctx.fillRect(inX, Y(z) - 10, wallX - inX, 14);
      ctx.fillStyle = C.bronze; ctx.fillRect(inX - 4, Y(z) - 44, 5, 34);
      font(700, 22); text(i ? 'down' : 'up', inX - 20, Y(z) - 2, { align: 'right', base: 'middle', color: i ? C.down : C.up });
    });
    // headroom and climb per turn, on one up floor
    A(seg(t, 33.0, 33.8), () => {
      const z0 = PITCH, x = wallX - 60;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x, Y(z0) - 10); ctx.lineTo(x, Y(z0 + PITCH / 2) + 4); ctx.stroke();
      for (const y of [Y(z0) - 10, Y(z0 + PITCH / 2) + 4]) { ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke(); }
      pill('headroom', x - 14, (Y(z0) + Y(z0 + PITCH / 2)) / 2 - 3, C.ink, 'right', 21);
      const x2 = wallX + 92;
      ctx.strokeStyle = C.up; ctx.beginPath(); ctx.moveTo(x2, Y(z0) - 3); ctx.lineTo(x2, Y(z0 + PITCH) - 3); ctx.stroke();
      for (const y of [Y(z0) - 3, Y(z0 + PITCH) - 3]) { ctx.beginPath(); ctx.moveTo(x2 - 8, y); ctx.lineTo(x2 + 8, y); ctx.stroke(); }
      font(700, 21); text('one turn', x2 + 14, (Y(z0) + Y(z0 + PITCH)) / 2 - 12, { base: 'middle', color: C.up });
      text('of climb', x2 + 14, (Y(z0) + Y(z0 + PITCH)) / 2 + 12, { base: 'middle', color: C.up });
      // a person for scale, about 1.8 m
      const px = inX + 110, py = Y(z0) - 10, ph = 1.8 * sz;
      ctx.fillStyle = C.up; ctx.beginPath(); ctx.ellipse(px, py - ph * 0.4, ph * 0.13, ph * 0.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(px, py - ph * 0.9, ph * 0.1, 0, TAU); ctx.fill();
    });
    font(500, 20); text('schematic section', 40, 104, { base: 'middle', color: C.soft });
  });
}

// ---------- E: seen from above, a spiral ----------
function scenePlan(t) {
  const a = span(t, 37.2, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const cx = CX, cy = 470, s = 36;
    // a helix would look like one circle from above; the cone's ramp curls inwards as it goes down
    ctx.setLineDash([8, 8]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, (R_TOP - WID / 2) * s, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('a helix, from above: one circle', cx, cy - (R_TOP - WID / 2) * s - 26, { align: 'center', base: 'middle', color: C.soft });
    const f = eio(seg(t, 37.6, 40.0));
    for (const [i, col] of [[0, C.up], [1, C.down]]) {
      ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath();
      const n = 240;
      for (let j = 0; j <= n * f; j++) {
        const u = j / n, z = DEPTH * (1 - u), th = STARTS[i] + TURNS * TAU * (1 - u);
        const r = (rOut(z) - WID / 2) * s, x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    A(seg(t, 39.6, 40.4), () => pill('Momo’s ramps: spirals, narrowing downwards', cx, cy + (R_TOP) * s + 40, C.ink, 'center', 22));
    font(500, 20); text('seen from above · schematic', 40, 104, { base: 'middle', color: C.soft });
  });
}

// ---------- F: Bramante's single spiral ramp ----------
const BR_V = { cx: CX + 30, base: 712, sx: 56, sy: 15, sz: 26 };
function sceneBramante(t) {
  const a = span(t, 41.8, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  V = BR_V;
  const RO = 3.9, wid = RO - B_R; // the outer wall radius is schematic
  A(a, () => {
    font(600, 22); text('BRAMANTE’S RAMP · BELVEDERE · BEGUN BY 1512', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    // the tower's back wall
    const depth = B_TURNS * B_RISE;
    ctx.fillStyle = '#3a3530';
    { const [x0, y0] = proj(RO, Math.PI, depth), [x1, y1] = proj(RO, 0, 0); ctx.fillRect(x0, y0 - 70, x1 - x0, y1 - y0 + 70); }
    const prog = eio(seg(t, 42.4, 45.8));
    const quads = rampQuads(Math.PI / 2, prog, { turns: B_TURNS, pitch: B_RISE, rO: () => RO, wid, col: '#b7a58a' });
    // the 36 columns on the ramp's inner edge, back ones first
    const cols = [];
    for (let i = 0; i < B_COLS; i++) {
      const th = Math.PI / 2 + (i / B_PER_TURN) * TAU, z = (i / B_PER_TURN) * B_RISE;
      let o = 0, n = i; while (n >= B_ORDERS[o][1]) { n -= B_ORDERS[o][1]; o++; }
      cols.push({ th, z, o, depth: Math.sin(th) });
    }
    const showCols = seg(t, 51.0, 53.0) * B_COLS;
    const items = [...quads.map((q) => ({ q, depth: q.depth })), ...cols.filter((_, i) => i < showCols).map((c) => ({ c, depth: c.depth + 0.001 }))];
    items.sort((p, q) => p.depth - q.depth);
    for (const it of items) {
      if (it.q) { drawQuads([it.q]); continue; }
      const c = it.c, [x, y] = proj(B_R, c.th, c.z), [, y2] = proj(B_R, c.th, c.z + B_RISE * 0.62);
      ctx.fillStyle = C.orders[c.o]; ctx.fillRect(x - 5, y2, 10, y - y2);
      ctx.fillRect(x - 8, y2 - 4, 16, 5);
    }
    // a horse and rider, schematically, going up
    if (prog > 0.2) {
      const s = clamp(seg(t, 47.0, 50.6)), th = Math.PI / 2 + s * B_TURNS * TAU * prog, z = s * B_TURNS * B_RISE * prog;
      const [x, y] = proj((RO + B_R) / 2, th, z);
      ctx.fillStyle = C.up; ctx.fillRect(x - 14, y - 16, 28, 10); ctx.fillRect(x - 12, y - 8, 4, 10); ctx.fillRect(x + 8, y - 8, 4, 10); ctx.fillRect(x + 12, y - 24, 6, 12);
    }
    A(seg(t, 46.6, 47.4), () => pill('one ramp, no steps', 140, 300, C.up, 'center'));
    A(seg(t, 51.6, 52.4), () => {
      B_ORDERS.forEach(([name, n], i) => {
        const z = (B_ORDERS.slice(0, i).reduce((s, o) => s + o[1], 0) + n / 2) / B_PER_TURN * B_RISE;
        const [, y] = proj(RO, 0, z);
        font(500, 25, SERIF); ctx.font = `italic 500 25px "${SERIF}"`;
        text(`${name} · ${n}`, 690, y, { base: 'middle', color: C.orders[i] });
      });
      pill(`${B_PER_TURN} columns a turn`, 140, 344, C.stone, 'center', 21);
    });
    font(500, 20); text('schematic', 40, 104, { base: 'middle', color: C.soft });
  });
}

// ---------- G: Orvieto's well ----------
const ORV_V = { cx: CX + 40, base: 712, sx: 26, sy: 8, sz: 8.8 };
function sceneOrvieto(t) {
  const a = span(t, 55.6, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  V = ORV_V;
  const depth = 53.15, R = 6.5, turns = 4, pitch = depth / turns;
  A(a, () => {
    shaftWall(1, { rTop: R, rBot: R, depth });
    drawQuads([...rampQuads(Math.PI / 2, 1, { turns, pitch, rO: () => R, wid: 1.6, col: C.up }), ...rampQuads(Math.PI * 1.5, 1, { turns, pitch, rO: () => R, wid: 1.6, col: C.down })]);
    font(600, 22); text('POZZO DI SAN PATRIZIO · ORVIETO · 1527–1537', CX, 150, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    A(seg(t, 56.4, 57.2), () => { pill('53 m deep', 140, 420, C.ink); pill('empty jars: down', 140, 470, C.down); pill('full jars: up', 140, 520, C.up); });
    font(500, 20); text('schematic', 40, 104, { base: 'middle', color: C.soft });
  });
}

// ---------- H: the way out ----------
function sceneEnd(t) {
  const a = span(t, 60.2, 65.0, 0.5, 0);
  if (a <= 0) return;
  V = MOMO_V;
  shaftWall(a);
  A(a, () => drawQuads([...rampQuads(STARTS[0], 1, { col: C.up }), ...rampQuads(STARTS[1], 1, { col: C.down })]));
  A(a * seg(t, 60.8, 61.6), () => { pill('since 2000: the way out', CX, 172, C.ink, 'center', 24); });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [SANS, SERIF],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMomo(t);
    sceneSection(t);
    scenePlan(t);
    sceneBramante(t);
    sceneOrvieto(t);
    sceneEnd(t);
    const sa = t < 30 ? span(t, 9.6, 28.0) : span(t, 60.2, 65.2, 0.35, 0);
    if (sa > 0) A(sa, () => { font(500, 20); text('schematic: turns, widths', 40, 104, { base: 'middle', color: C.soft }); });
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 36, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.bronze, '~': C.up, '^': C.down } });
  },
});
