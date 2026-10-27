// Explainer for engineering-colosseum-numbered-arches (Roma): the Colosseum's 76 public arches were numbered, and
// a token sent each spectator to one arch, one staircase and one numbered seat, so a crowd of tens of thousands
// spread itself round the building. Look: travertine stone against a dusk sky, red-painted Roman numerals, the
// elliptical plan with its 80 radial walls, and a simplified cross-section of the seating. Cinzel for numerals and
// labels, Archivo for captions.
//
// Facts:
// - Parco archeologico del Colosseo, "The Cavea of the Colosseum and the Belvedere Terrace" (colosseo.it): entry was
//   free; the social classes entered through 76 arches with numbers carved and marked in red, 29 of which are still
//   visible along the northern side; spectators followed paths marked on the inner arches and indicated on the
//   tesserae of the head of each family; senators sat closest to the arena, knights behind them (maenianum primum),
//   the two parts of the maenianum secundum seated progressively lower classes, and the worst seats were the
//   maenianum summum, the colonnaded portico at the top with wooden seats for the plebs.
// - Wikipedia, "Colosseum": completed in AD 80 under Titus; elliptical, 189 m by 156 m; eighty entrances at ground
//   level, 76 used by ordinary spectators; each entrance and staircase numbered; the four axial entrances were for
//   the emperor and (most likely) the elite; tickets (numbered pottery shards) directed spectators to their section
//   and row; vomitoria, passages opening into a tier from below or behind, named from the Latin word for a rapid
//   discharge (English "vomit"); tiers cut into wedges (cunei) by stairs and aisles, every row (gradus) numbered, so
//   a seat was fixed by its row, wedge and number; the Codex-Calendar of 354 gives 87,000 people, modern estimates
//   about 50,000.
// - Gravit, Kirik and Savchenko, "Effect of Design on the Evacuation Time for the Colosseum of Rome", Construction
//   of Unique Buildings and Structures 95 (2021): a computer simulation with 48,000 spectators; the layout needed no
//   routing control to even out the load on the stairs. (Their emptying times are not quoted: the lab models it.)
// Drawn schematically: the plan's 80 arches are spaced evenly round the ellipse; the section is simplified; the
// token is an illustration, not a copy of a real one. Arch numerals use L, LI, LII, LIII (50–53), which have only
// one Roman spelling.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.4  The plan: 80 arches round the ellipse; 76 numbered (red), 4 on the axes (gold).
//  B  9.6–18.6  The façade: arches L to LIII with red numerals; 29 still readable on the north side.
//  C 18.8–27.8  The token; the crowd splits over 76 arches instead of 4.
//  D 28.0–41.6  Section: arch, staircase, vomitorium, seat; the crowd pours in and out.
//  E 41.8–51.0  Seats by rank; wedges and numbered rows.
//  F 51.0–65.0  How many: 87,000 or about 50,000; the 2021 simulation; gates like a modern stadium.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#141d33', sky2: '#2c2a45', sky3: '#4a3446',
  stone: '#e3d3b3', stone2: '#cdb994', stoneDark: '#9c8866', shadow: '#2a2230',
  ink: '#f5ecdc', soft: 'rgba(245,236,220,0.72)', faint: 'rgba(245,236,220,0.25)',
  red: '#e2513c', redPaint: '#b8321f', gold: '#f1c35a', crowd: '#ffd98a', cool: '#8fc6e8',
  senate: '#f1c35a', knight: '#e2513c', mid1: '#8fc6e8', mid2: '#7aa37a', top: '#b48ad6',
};
const CAPS = 'Cinzel', SANS = 'Archivo';

let k, ctx;
const font = (w, s, f = CAPS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const ARCHES = 80, AXIAL = 4, PUBLIC = ARCHES - AXIAL; // 76
const STILL_READABLE = 29;
const LIST_354 = 87000, MODERN = 50000, SIM = 48000;
const LONG_M = 189, SHORT_M = 156, ARENA_LONG = 87, ARENA_SHORT = 55;
if (PUBLIC !== 76) throw new Error('numbers');

// ---------- the plan ----------
const PLAN = { cx: CX, cy: 400, sx: 3.4 }; // px per metre
const RX = (LONG_M / 2) * PLAN.sx, RY = (SHORT_M / 2) * PLAN.sx;
const ARX = (ARENA_LONG / 2) * PLAN.sx, ARY = (ARENA_SHORT / 2) * PLAN.sx;

// ---------- the façade ----------
/** A strip of the outer arcade, arches x0 .. with numerals. `paint` 0..1 shows the red paint. */
/** A piece of the outer wall: three arcades and the attic, four bays wide, numerals over the ground arches. */
function facade(x0, yTop, numerals, { bay = 168, paint = 1, glow = -1 } = {}) {
  const n = numerals.length, w = bay * n + 36, L = x0 - 18;
  const storeys = [[64, 'attic'], [120, 'arc'], [130, 'arc'], [186, 'ground']];
  let y = yTop;
  ctx.fillStyle = C.stone; ctx.fillRect(L, yTop, w, storeys.reduce((s, [h]) => s + h + 14, 0));
  for (const [h, kind] of storeys) {
    // cornice above the storey
    ctx.fillStyle = C.stone2; ctx.fillRect(L - 6, y, w + 12, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(L - 6, y + 11, w + 12, 3);
    y += 14;
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * bay;
      // pilaster or half-column
      ctx.fillStyle = C.stone2; ctx.fillRect(x - 12, y, 24, h);
      ctx.fillStyle = 'rgba(0,0,0,0.09)'; ctx.fillRect(x + 5, y, 7, h);
      if (i === n) continue;
      const ax = x + 26, aw = bay - 52;
      if (kind === 'attic') {
        if (i % 2 === 0) { ctx.fillStyle = C.shadow; ctx.fillRect(x + bay / 2 - 16, y + 16, 32, 30); }
        continue;
      }
      const top = y + (kind === 'ground' ? 58 : 18);
      ctx.fillStyle = C.shadow;
      ctx.beginPath(); ctx.moveTo(ax, y + h); ctx.lineTo(ax, top + aw / 2); ctx.arc(ax + aw / 2, top + aw / 2, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw, y + h); ctx.fill();
      ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ax + aw / 2, top + aw / 2, aw / 2 + 6, Math.PI, 0); ctx.stroke();
      if (kind === 'ground') {
        const num = numerals[i], cx = ax + aw / 2, ny = y + 27;
        font(800, 40);
        A(paint, () => text(num, cx, ny, { align: 'center', base: 'middle', color: i === glow ? C.red : C.redPaint, spacing: '2px' }));
        A(1 - paint, () => text(num, cx, ny, { align: 'center', base: 'middle', color: 'rgba(120,96,64,0.5)', spacing: '2px' }));
        if (i === glow) { ctx.strokeStyle = C.gold; ctx.lineWidth = 3; k.rrect(cx - 58, ny - 26, 116, 52, 8); ctx.stroke(); }
      }
    }
    y += h;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(L - 6, y, w + 12, 6);
  return y;
}
const NUMERALS = ['L', 'LI', 'LII', 'LIII'];

// ---------- crowd dots ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const CROWD = Array.from({ length: 380 }, () => ({ a: rnd() * TAU, d: rnd(), s: rnd(), jitter: rnd() }));

// ---------- the section (one radial slice, outside on the left, arena on the right) ----------
const SEC = { x0: 150, x1: 660, ground: 690, pxm: 9.6 }; // 51 m wide, 48 m high
const sx = (m) => SEC.x0 + m * SEC.pxm, sy = (m) => SEC.ground - m * SEC.pxm;
// Seating zones as [from metres out from the outer wall... to], heights: a sloping line from the podium to the top.
const ZONES = [
  { key: 'senate', name: 'SENATORS', col: C.senate, a: 47, b: 51, h0: 4.5, h1: 4.5 },
  { key: 'knight', name: 'KNIGHTS', col: C.knight, a: 36, b: 46, h0: 13, h1: 6 },
  { key: 'mid1', name: 'CITIZENS', col: C.mid1, a: 26, b: 35, h0: 21, h1: 14 },
  { key: 'mid2', name: '', col: C.mid2, a: 16, b: 25, h0: 30, h1: 22 },
  { key: 'top', name: 'THE POOREST', col: C.top, a: 4, b: 14, h0: 41, h1: 33 },
];
function section(t, { zones = 0, flow = -1, out = 0, stairsGlow = 0 } = {}) {
  // structure: outer wall, ring corridors, the seating slope
  ctx.fillStyle = C.stone2;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(0)); ctx.lineTo(sx(0), sy(48)); ctx.lineTo(sx(3.5), sy(48)); ctx.lineTo(sx(3.5), sy(41));
  ctx.lineTo(sx(14), sy(33)); ctx.lineTo(sx(16), sy(30)); ctx.lineTo(sx(25), sy(22)); ctx.lineTo(sx(26), sy(21)); ctx.lineTo(sx(35), sy(14));
  ctx.lineTo(sx(36), sy(13)); ctx.lineTo(sx(46), sy(6)); ctx.lineTo(sx(47), sy(4.5)); ctx.lineTo(sx(51), sy(4.5)); ctx.lineTo(sx(51), sy(0)); ctx.closePath(); ctx.fill();
  // arena floor
  ctx.fillStyle = '#d9c39a'; ctx.fillRect(sx(51), sy(0) - 6, W - sx(51), 12);
  // corridors (dark bands) and stairs
  ctx.fillStyle = C.shadow;
  for (const [a, b, y0, y1] of [[1, 7, 0, 10], [9, 15, 0, 9], [1, 6, 12, 20], [9, 14, 12, 19], [1, 6, 23, 30], [1, 5, 33, 40]]) ctx.fillRect(sx(a), sy(y1), (b - a) * SEC.pxm, (y1 - y0) * SEC.pxm);
  // the outer arch at ground level
  ctx.fillStyle = '#120e18'; ctx.fillRect(sx(-0.4), sy(9), 0.8 * SEC.pxm + 4, 9 * SEC.pxm);
  // staircases as zigzags
  const stairs = [[[8, 0.5], [8, 6], [16, 12.5], [20, 15]], [[8, 0.5], [8, 6], [16, 12.5], [28, 21.5]], [[4, 12.5], [4, 18], [12, 24], [18, 30]], [[3, 23.5], [3, 29], [7, 34]]];
  ctx.strokeStyle = stairsGlow ? `rgba(241,195,90,${0.35 + 0.5 * stairsGlow})` : 'rgba(80,62,40,0.6)';
  ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
  for (const s of stairs) { ctx.beginPath(); s.forEach(([m, h], i) => (i ? ctx.lineTo(sx(m), sy(h)) : ctx.moveTo(sx(m), sy(h)))); ctx.stroke(); }
  ctx.setLineDash([]);
  // vomitoria: openings in the slope
  for (const [m, h] of [[20, 15], [28, 21.5], [18, 30], [7, 34], [40, 9.5]]) {
    ctx.fillStyle = '#120e18'; k.rrect(sx(m) - 10, sy(h) - 16, 20, 18, 4); ctx.fill();
  }
  // zones by rank
  ZONES.forEach((z, i) => {
    const v = clamp(zones * ZONES.length - i);
    if (v <= 0) return;
    A(v, () => {
      ctx.strokeStyle = z.col; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx(z.a), sy(z.h0) - 8); ctx.lineTo(sx(z.b), sy(z.h1) - 8); ctx.stroke(); ctx.lineCap = 'butt';
    });
  });
  // the colonnade at the top
  ctx.fillStyle = C.stone;
  for (let i = 0; i < 4; i++) ctx.fillRect(sx(4 + i * 3), sy(48), 6, (48 - 41 + (i * 0.3)) * SEC.pxm - 6);
  ctx.fillRect(sx(3.5), sy(48.5), 11 * SEC.pxm, 8);
  // the crowd flowing: arch -> stairs -> vomitorium -> seat
  if (flow >= 0) {
    const paths = [
      [[-14, 1], [0, 1], [8, 1], [8, 6], [16, 12.5], [20, 15], [22, 16.5]],
      [[-14, 1], [0, 1], [8, 1], [8, 6], [16, 12.5], [28, 21.5], [31, 19]],
      [[-14, 1], [0, 1], [4, 1], [4, 12.5], [4, 18], [12, 24], [18, 30], [19, 28]],
      [[-14, 1], [0, 1], [3, 1], [3, 23.5], [3, 29], [7, 34], [10, 36]],
      [[-14, 1], [0, 1], [10, 1], [40, 1], [40, 9.5], [43, 8.5]],
    ];
    paths.forEach((p, pi) => {
      const L = []; let tot = 0;
      for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); L.push(d); tot += d; }
      for (let n = 0; n < 9; n++) {
        let u = ((flow * 0.55 + n / 9 + pi * 0.13) % 1);
        if (out) u = 1 - u;
        let d = u * tot, i = 0;
        while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; }
        const f = d / L[i];
        const m = lerp(p[i][0], p[i + 1][0], f), h = lerp(p[i][1], p[i + 1][1], f);
        ctx.fillStyle = C.crowd; ctx.beginPath(); ctx.arc(sx(m), sy(h) - 6, 4.5, 0, TAU); ctx.fill();
      }
    });
  }
}

// ---------- scenes ----------
function scenePlan(t) {
  A(span(t, 0, 9.6, 0.4, 0.4), () => {
    font(700, 26); text('THE COLOSSEUM · ROME · AD 80', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const grow = eout(seg(t, 0.3, 1.6));
    ctx.save(); ctx.translate(PLAN.cx, PLAN.cy); ctx.scale(0.9 + 0.1 * grow, 0.9 + 0.1 * grow); ctx.translate(-PLAN.cx, -PLAN.cy);
    A(grow, () => drawPlan(t, { walls: seg(t, 0.8, 2.2), numbered: seg(t, 1.6, 4.0) }));
    ctx.restore();
    A(seg(t, 2.4, 3.2), () => {
      font(800, 64); text(`${ARCHES}`, CX, PLAN.cy - 22, { align: 'center', base: 'middle', color: C.shadow });
      font(700, 24); text('ARCHES', CX, PLAN.cy + 26, { align: 'center', base: 'middle', color: C.shadow, spacing: '3px' });
    });
    A(seg(t, 5.2, 6.0), () => {
      legendDot(150, 712, C.red, `${PUBLIC} NUMBERED, FOR THE PUBLIC`);
      legendDot(150, 752, C.gold, `${AXIAL} ON THE AXES, NO NUMBER`);
    });
  });
}
function legendDot(x, y, col, label) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
  font(700, 24); text(label, x + 24, y + 1, { base: 'middle', spacing: '1px' });
}
/** The plan with arches drawn at their centre angles (axial ones centred on the axes). */
function drawPlan(t, { walls = 1, numbered = 1, readable = 0, lit = null } = {}) {
  ctx.fillStyle = C.stone2;
  ctx.beginPath(); ctx.ellipse(PLAN.cx, PLAN.cy, RX, RY, 0, 0, TAU); ctx.ellipse(PLAN.cx, PLAN.cy, ARX, ARY, 0, 0, TAU, true); ctx.fill('evenodd');
  ctx.fillStyle = '#d9c39a'; ctx.beginPath(); ctx.ellipse(PLAN.cx, PLAN.cy, ARX, ARY, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.stoneDark; ctx.lineWidth = 2;
  for (const sc of [1, 0.92, 0.84]) { ctx.beginPath(); ctx.ellipse(PLAN.cx, PLAN.cy, RX * sc, RY * sc, 0, 0, TAU); ctx.stroke(); }
  A(walls, () => {
    ctx.strokeStyle = 'rgba(80,62,40,0.5)'; ctx.lineWidth = 1.5;
    for (let j = 0; j < ARCHES; j++) {
      const a = ((j + 0.5) / ARCHES) * TAU;
      ctx.beginPath(); ctx.moveTo(PLAN.cx + ARX * 1.08 * Math.cos(a), PLAN.cy + ARY * 1.08 * Math.sin(a));
      ctx.lineTo(PLAN.cx + RX * 0.995 * Math.cos(a), PLAN.cy + RY * 0.995 * Math.sin(a)); ctx.stroke();
    }
  });
  for (let j = 0; j < ARCHES; j++) {
    const v = clamp(numbered * ARCHES - j);
    if (v <= 0) continue;
    const a = archCentre(j), axial = j % 20 === 0;
    const x = PLAN.cx + RX * Math.cos(a), y = PLAN.cy + RY * Math.sin(a);
    let col = axial ? C.gold : C.red, r = axial ? 8 : 6;
    if (lit && !lit(j, axial)) { col = 'rgba(245,236,220,0.25)'; r = 5; }
    if (readable > 0) {
      if (READABLE.has(j)) { r = 6 + 4 * readable; col = '#fff1d6'; }
      else if (!axial) col = `rgba(226,81,60,${1 - 0.7 * readable})`;
    }
    A(v, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
  }
}
// Arch centres spaced evenly in angle round the ellipse, with the four axial arches on the axes: schematic.
const archCentre = (j) => (j / ARCHES) * TAU;
// 29 public arches on the north (top) side whose numbers are still readable: schematic.
const READABLE = new Set();
{ let j = 46; while (READABLE.size < STILL_READABLE) { if (j % 20 !== 0) READABLE.add(j); j++; } }

function sceneFacade(t) {
  A(span(t, 9.4, 16.9, 0.5, 0.4), () => {
    const slide = eio(seg(t, 9.4, 11.0));
    const ground = facade(lerp(112, 96, slide), 140, NUMERALS, { paint: seg(t, 10.8, 12.2), glow: t > 14.2 ? 2 : -1 });
    A(seg(t, 14.4, 15.2), () => {
      font(700, 32); text('LII = 50 + 1 + 1 = 52', CX, ground + 50, { align: 'center', base: 'middle', color: C.gold, spacing: '2px' });
    });
    A(seg(t, 11.0, 11.8) * (1 - seg(t, 14.0, 14.4)), () => {
      font(700, 26); text('CARVED, THEN PAINTED RED', CX, ground + 50, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    });
  });
}

function sceneAxes(t) {
  A(span(t, 16.7, 23.4, 0.5, 0.4), () => {
    drawPlan(t, { readable: seg(t, 16.9, 17.8) * (1 - seg(t, 18.6, 19.2)) });
    A(seg(t, 16.9, 17.6) * (1 - seg(t, 18.6, 19.2)), () => {
      font(800, 44); text(`${STILL_READABLE}`, CX, PLAN.cy - 18, { align: 'center', base: 'middle', color: C.shadow });
      font(700, 20); text('STILL READABLE', CX, PLAN.cy + 22, { align: 'center', base: 'middle', color: C.shadow, spacing: '2px' });
    });
    // north arrow
    font(700, 22); text('N', 108, 150, { align: 'center', base: 'middle', color: C.soft });
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(108, 210); ctx.lineTo(108, 170); ctx.lineTo(100, 182); ctx.moveTo(108, 170); ctx.lineTo(116, 182); ctx.stroke();
    A(seg(t, 19.0, 19.8), () => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      for (let q = 0; q < 4; q++) {
        const a = archCentre(q * 20), x = PLAN.cx + RX * 1.1 * Math.cos(a), y = PLAN.cy + RY * 1.13 * Math.sin(a);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3 + pulse * 2; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.stroke();
      }
      font(700, 26); text('EMPEROR AND ELITE', CX, PLAN.cy - 12, { align: 'center', base: 'middle', color: C.shadow, spacing: '1px' });
      font(500, 22, SANS); text('the four axial entrances', CX, PLAN.cy + 24, { align: 'center', base: 'middle', color: C.shadow });
    });
  });
}

function token(x, y, s, a) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#c98a55'; ctx.beginPath(); ctx.arc(0, 0, 96, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8a5530'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,20,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.stroke();
    font(800, 58); text('LII', 0, -4, { align: 'center', base: 'middle', color: '#3a1d0e', spacing: '3px' });
    font(700, 16); text('TESSERA', 0, 46, { align: 'center', base: 'middle', color: '#5a2f16', spacing: '3px' });
    ctx.restore();
  });
}

function sceneToken(t) {
  A(span(t, 23.4, 32.6, 0.4, 0.4), () => {
    // token and its three pieces of information
    const tk = eout(seg(t, 23.6, 24.6));
    token(210, 230, 0.9 + 0.1 * tk, tk);
    A(seg(t, 24.6, 25.4), () => {
      font(500, 22, SANS); text('illustration', 210, 352, { align: 'center', base: 'middle', color: C.faint });
      const rows = [['ARCH', 'which of the 76'], ['SECTION', 'by rank'], ['ROW', 'numbered']];
      rows.forEach(([a, b], i) => {
        A(seg(t, 24.8 + i * 0.4, 25.4 + i * 0.4), () => {
          font(700, 28); text(a, 380, 175 + i * 56, { base: 'middle', color: C.gold, spacing: '2px' });
          font(500, 26, SANS); text(b, 560, 175 + i * 56, { base: 'middle', color: C.soft });
        });
      });
    });
    // the crowd: queues if only the 4 axial arches were used, then at the 76 public ones
    A(seg(t, 28.0, 28.8), () => {
      const many = eio(seg(t, 29.8, 30.8));
      const pcx = CX, pcy = 560, sc = 0.36;
      ctx.save(); ctx.translate(pcx, pcy); ctx.scale(sc, sc); ctx.translate(-PLAN.cx, -PLAN.cy);
      drawPlan(t, { walls: 0.6, lit: (j, axial) => (axial ? many < 0.98 : many > 0.02) });
      ctx.restore();
      const per4 = MODERN / AXIAL, perPublic = MODERN / PUBLIC, PEOPLE_PER_PX = 114;
      for (let j = 0; j < ARCHES; j++) {
        const axial = j % 20 === 0;
        const people = axial ? per4 * (1 - many) : perPublic * many;
        const len = people / PEOPLE_PER_PX; // queues drawn to scale
        if (len < 1) continue;
        const a = archCentre(j), ex = Math.cos(a), ey = Math.sin(a);
        const x0 = pcx + RX * sc * ex, y0 = pcy + RY * sc * ey;
        const nx = ex * RY, ny = ey * RX, nl = Math.hypot(nx, ny);
        ctx.strokeStyle = C.crowd; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x0 + (nx / nl) * 8, y0 + (ny / nl) * 8); ctx.lineTo(x0 + (nx / nl) * (8 + len), y0 + (ny / nl) * (8 + len)); ctx.stroke();
        ctx.lineCap = 'butt';
      }
      font(700, 20);
      text(many > 0.5 ? `${PUBLIC} ARCHES` : 'ONLY 4 ARCHES?', pcx, pcy - 14, { align: 'center', base: 'middle', color: C.shadow, spacing: '1px' });
      font(600, 18, SANS);
      text(many > 0.5 ? `about ${Kit.fmt(Math.round(perPublic / 10) * 10)} each` : `${Kit.fmt(per4)} each`, pcx, pcy + 14, { align: 'center', base: 'middle', color: C.shadow });
      font(500, 22, SANS);
      text(`${Kit.fmt(MODERN)} spectators`, 92, 716, { base: 'middle', color: C.soft });
      text('queues drawn to scale', 92, 746, { base: 'middle', color: C.soft });
    });
  });
}

function sceneSection(t) {
  A(span(t, 32.6, 46.4, 0.5, 0.4), () => {
    font(700, 24); text('A SLICE THROUGH THE SEATING (SIMPLIFIED)', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    const out = t > 41.8 ? 1 : 0;
    section(t, { flow: t > 33.6 ? (t - 33.6) * 0.9 : -1, out, stairsGlow: seg(t, 32.8, 33.6) * (1 - seg(t, 37.0, 37.6)), zones: seg(t, 42.2, 44.4) * 0 });
    // labels
    A(seg(t, 33.0, 33.8), () => {
      font(700, 22); text('ARCH', sx(0) - 8, sy(0) + 30, { align: 'center', base: 'middle', color: C.red });
      text('STAIRS', sx(43), sy(17), { align: 'center', base: 'middle', color: C.gold });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(43) - 40, sy(17) + 6); ctx.lineTo(sx(16), sy(12.5) - 6); ctx.stroke();
    });
    A(seg(t, 37.4, 38.2), () => {
      font(700, 22); text('VOMITORIA', sx(36), sy(27), { align: 'center', base: 'middle', color: C.gold, spacing: '1px' });
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
      for (const [m, h] of [[28, 21.5], [40, 9.5]]) { ctx.beginPath(); ctx.moveTo(sx(36), sy(25.5)); ctx.lineTo(sx(m) + 4, sy(h) - 18); ctx.stroke(); }
    });
    A(seg(t, 39.6, 40.4) * (1 - seg(t, 41.4, 41.8)), () => {
      font(800, 34); text('VOMERE', sx(30), 160, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
      font(500, 24, SANS); text('Latin: to spew out', sx(30), 196, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 42.0, 42.6), () => {
      font(800, 30); text('OUT AGAIN', sx(30), 170, { align: 'center', base: 'middle', color: C.crowd, spacing: '3px' });
    });
    font(700, 20); A(seg(t, 33.0, 33.8), () => text('ARENA', sx(51) + 50, sy(0) - 24, { align: 'center', base: 'middle', color: C.soft }));
  });
}

function sceneRank(t) {
  A(span(t, 46.2, 51.4, 0.4, 0.4), () => {
    font(700, 24); text('SEATS BY RANK', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    section(t, { zones: seg(t, 46.4, 48.4) });
    const labels = [
      ['SENATORS', C.senate, 51, 4.5, 'right'], ['KNIGHTS', C.knight, 44, 13, 'left'], ['CITIZENS', C.mid1, 33, 22, 'left'],
      ['LOWER RANKS', C.mid2, 23, 31, 'left'], ['THE POOREST', C.top, 17, 44, 'left'],
    ];
    labels.forEach(([s, col, m, h, al], i) => A(seg(t, 46.6 + i * 0.4, 47.2 + i * 0.4), () => {
      font(700, 22);
      if (al === 'right') text(s, sx(m) + 60, sy(h) - 40, { align: 'center', base: 'middle', color: col });
      else text(s, sx(m) + 14, sy(h) - 34, { base: 'middle', color: col });
    }));
    A(seg(t, 49.6, 50.4), () => { font(500, 22, SANS); text('wooden seats under a colonnade', sx(18.5), sy(40.5), { base: 'middle', color: C.soft }); });
  });
  // wedges and numbered rows: a piece of the plan
  A(span(t, 51.0, 55.8, 0.4, 0.4), () => {
    font(700, 24); text('WEDGE · ROW · SEAT', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const cx = CX, cy = 820, r0 = 250, r1 = 640;
    const a0 = -Math.PI / 2 - 0.42, a1 = -Math.PI / 2 + 0.42;
    for (let w = 0; w < 4; w++) {
      const wa = lerp(a0, a1, w / 4), wb = lerp(a0, a1, (w + 1) / 4);
      for (let r = 0; r < 10; r++) {
        const ra = lerp(r0, r1, r / 10), rb = lerp(r0, r1, (r + 1) / 10) - 6;
        const v = seg(t, 51.2 + (w * 10 + r) * 0.02, 51.6 + (w * 10 + r) * 0.02);
        A(v, () => {
          ctx.fillStyle = w === 2 ? 'rgba(241,195,90,0.55)' : 'rgba(227,211,179,0.35)';
          ctx.beginPath(); ctx.arc(cx, cy, rb, wa + 0.012, wb - 0.012); ctx.arc(cx, cy, ra, wb - 0.012, wa + 0.012, true); ctx.closePath(); ctx.fill();
        });
      }
    }
    A(seg(t, 52.4, 53.2), () => {
      // highlight one row in wedge III and one seat
      const wa = lerp(a0, a1, 2 / 4), wb = lerp(a0, a1, 3 / 4);
      const ra = lerp(r0, r1, 4 / 10), rb = lerp(r0, r1, 5 / 10) - 6;
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, rb, wa + 0.012, wb - 0.012); ctx.arc(cx, cy, ra, wb - 0.012, wa + 0.012, true); ctx.closePath(); ctx.fill();
      const am = (wa + wb) / 2 + 0.03, rm = (ra + rb) / 2;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + rm * Math.cos(am), cy + rm * Math.sin(am), 8, 0, TAU); ctx.fill();
      font(700, 24);
      text('WEDGE', cx + 300 * Math.cos(lerp(a0, a1, 2.5 / 4)) - 0, cy + 200 * Math.sin(lerp(a0, a1, 2.5 / 4)) - 0, { align: 'center', base: 'middle', color: C.gold });
      text('ROW 5', cx - 250, cy - rm + 20, { align: 'center', base: 'middle', color: C.red });
      text('SEAT', cx + 245, cy - rm + 14, { align: 'center', base: 'middle', color: C.ink });
    });
  });
}

function sceneCount(t) {
  A(span(t, 55.6, 60.2, 0.4, 0.4), () => {
    font(700, 24); text('HOW MANY SPECTATORS?', CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
    const L = 110, R = 760, max = 90000, bar = (v) => (R - L) * v / max;
    const g1 = eio(seg(t, 56.0, 57.2)), g2 = eio(seg(t, 57.4, 58.6));
    ctx.fillStyle = C.red; ctx.fillRect(L, 250, bar(LIST_354) * g1, 70);
    ctx.fillStyle = C.gold; ctx.fillRect(L, 450, bar(MODERN) * g2, 70);
    font(700, 24); text('A LIST OF AD 354', L, 226, { base: 'middle', color: C.red, spacing: '1px' });
    A(g1, () => { font(800, 40); text(Kit.fmt(LIST_354 * g1), L + bar(LIST_354) * g1 - 12, 286, { align: 'right', base: 'middle', color: C.shadow }); });
    A(seg(t, 57.4, 57.8), () => { font(700, 24); text('MODERN ESTIMATES', L, 426, { base: 'middle', color: C.gold, spacing: '1px' }); });
    A(g2, () => { font(800, 40); text(`about ${Kit.fmt(MODERN * g2)}`, L + bar(MODERN) * g2 + 14, 486, { base: 'middle', color: C.ink }); });
  });
  A(span(t, 60.2, 65.2, 0.4, 0.0), () => {
    // the simulation: 48,000 people leaving evenly through all arches
    font(700, 24); text(`A 2021 SIMULATION: ${Kit.fmt(SIM)} PEOPLE`, CX, 96, { align: 'center', base: 'middle', color: C.soft, spacing: '2px' });
    drawPlan(t, { walls: 0.7 });
    const rx = RX, ry = RY;
    for (const c of CROWD) {
      const j = Math.round((c.a / TAU) * ARCHES) % ARCHES;
      const a = archCentre(j);
      const u = ((t - 60.2) * 0.32 + c.d) % 1;
      const r = lerp(0.72 + 0.2 * c.s, 1.32, eio(u));
      const x = PLAN.cx + rx * r * Math.cos(a + (c.jitter - 0.5) * 0.04), y = PLAN.cy + ry * r * Math.sin(a + (c.jitter - 0.5) * 0.04);
      if (y < 130 || y > 760) continue;
      ctx.fillStyle = C.crowd; ctx.globalAlpha = 0.9 * (1 - u * 0.6); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    }
    A(seg(t, 62.4, 63.2), () => {
      ctx.fillStyle = 'rgba(20,29,51,0.85)'; k.rrect(CX - 170, PLAN.cy - 44, 340, 88, 14); ctx.fill();
      font(800, 40); text('GATE 52', CX, PLAN.cy - 10, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
      font(700, 24); text('= ARCH LII', CX, PLAN.cy + 26, { align: 'center', base: 'middle', color: C.red, spacing: '2px' });
    });
  });
}

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky1); lg.addColorStop(0.62, C.sky2); lg.addColorStop(1, C.sky3);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,240,220,${0.15 + r() * 0.35})`; g.fillRect(r() * W, r() * 420, 1.6, 1.6); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.02})`; g.fillRect(r() * W, r() * H, 2, 2); }
}

const CUES = [
  [0.4, 4.8, 'The Colosseum in Rome, finished in AD 80, had *80 arches* round its ground floor.'],
  [5.0, 9.4, '*76* were for the public. The ~four~ on the building’s axes were grand entrances.'],
  [9.6, 14.0, 'Over each public arch, a *number* was carved and then painted red.'],
  [14.2, 18.6, 'Arch *LII* is number 52. On the north side, 29 of these numbers can still be read.'],
  [18.8, 23.2, 'The ~four~ unnumbered axial arches were probably for the emperor and the elite.'],
  [23.4, 27.8, 'A token, a *tessera*, showed the way to your arch, your section and your row.'],
  [28.0, 32.4, 'So the crowd did not squeeze through a few doors: it split itself across *76 arches*.'],
  [32.6, 37.0, 'Each arch led to its own *stairs*, marked on the inner arches, up to the right level.'],
  [37.2, 41.6, 'The stairs ended in a *vomitorium*, from Latin for ‘spewing out’, the root of ‘vomit’.'],
  [41.8, 46.2, 'These passages poured people into their tier, and at the end ~out again~.'],
  [46.4, 50.8, 'Seats went by rank: *senators* by the arena, then knights, the poorest at the very top.'],
  [51.0, 55.4, 'Each tier was cut into *wedges*, and every row was numbered, down to a single seat.'],
  [55.6, 60.0, 'A list from AD 354 says it held *87,000*; modern estimates say about ~50,000~.'],
  [60.2, 64.6, 'A 2021 simulation of *48,000* people found the stairs shared out the crowd evenly.'],
];

Kit.scene({
  width: W, height: H, duration: 65.2, fonts: [CAPS, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    scenePlan(t);
    sceneFacade(t);
    sceneAxes(t);
    sceneToken(t);
    sceneSection(t);
    sceneRank(t);
    sceneCount(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.gold } });
  },
});
