// Explainer for earth-gallery-of-maps-danti (Roma): the Vatican's Gallery of Maps lays Italy along a 120 m corridor,
// split along the Apennines: regions on the Ligurian and Tyrrhenian seas on one wall, those bounded by the Alps and
// the Adriatic on the other, in order from north to south, so walking it is like walking up Italy along its spine.
// Look: a painted map on parchment, sea blue and land green, gold frames and red-ink lettering, and the corridor as a
// plan with its two walls of panels. EB Garamond for captions, Fira Sans for labels.
//
// Facts:
// - Vatican Museums, "Galleria delle Carte Geografiche" (Italian and English pages): 120 m long and 6 m wide; built
//   1578–1580 by Ottaviano Nonni (Mascherino) for Gregory XIII; frescoed in under two years by artists led by
//   Girolamo Muziano and Cesare Nebbia; programme by Egnazio Danti, Dominican, cosmographer, astronomer and
//   mathematician; 40 maps: 32 of the regions, in sequence from north to south, and 8 narrower ones at the ends
//   (the Siege of Malta, the Battle of Lepanto, Elba, the Tremiti Islands, four ports: Civitavecchia, Genoa, Venice,
//   Ancona); the Apennines divide the peninsula: the wall towards the Belvedere Courtyard has the regions on the
//   Ligurian and Tyrrhenian seas, the wall towards the Gardens those bounded by the Alps and the Adriatic; 51 ceiling
//   panels show episodes of Church history linked to the regions below; for the first time it shows Italy, then
//   divided into many states, as one unit.
// - Wikipedia, "Vatican Gallery of Maps": the panels of each wall (eastern regions from Salentina to Pedemontium;
//   western from Liguria to Calabria, Sicilia, Sardinia, Corsica, and Avignon); Latium et Sabina shows Rome; each
//   map shows a region and often a perspective view of its main city.
// - Wikipedia, "Ignazio Danti", and MacTutor: begun in early 1580 and finished in about 18 months; in 1574 Danti
//   found the spring equinox falling on 11 March, 11 days off; Gregory XIII made him papal mathematician and a
//   member of the calendar commission. The History Blog (2016): Danti likened walking the corridor to walking up
//   Italy on the spine of the Apennines.
// The outline of Italy and the line of the Apennines are hand-simplified from coordinates; the panel order on each
// wall follows the Wikipedia list; panel sizes are not to scale.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The gallery in perspective: maps on both walls, a gilded vault; 120 × 6 m.
//  B  9.2–27.6  Italy, its spine, the two seas; the halves; inland regions take a side.
//  C 27.6–36.8  The halves slide apart and become the two walls of panels, north to south.
//  D 36.8–50.4  Walking the corridor; city views; the eight end maps.
//  E 50.4–59.6  The ceiling's 51 panels; Danti the astronomer and the calendar.
//  F 59.8–64.6  Italy as one land.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  parch: '#efe3c5', parch2: '#e2d2ac', ink: '#3a2a1c', soft: 'rgba(58,42,28,0.72)', faint: 'rgba(58,42,28,0.22)',
  sea: '#86b4c6', sea2: '#a9cbd6', land: '#b7c286', land2: '#d6c48d', mount: '#9a7a4c', red: '#a8321f', gold: '#b8862e', gold2: '#d7aa48',
  west: '#6f9db3', east: '#c08a3e',
};
const SERIF = 'EB Garamond', SANS = 'Fira Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- Italy, simplified (lon, lat) ----------
const MAINLAND = [[7.6, 43.79], [8.48, 44.31], [8.93, 44.41], [9.82, 44.1], [10.31, 43.55], [10.5, 42.93], [11.2, 42.44], [11.8, 42.09], [12.29, 41.73], [12.62, 41.45],
  [13.05, 41.23], [13.57, 41.21], [14.25, 40.84], [14.33, 40.6], [14.77, 40.68], [14.9, 40.25], [15.5, 40.0], [16.03, 39.36], [15.83, 38.62], [15.65, 38.11],
  [16.06, 37.93], [16.6, 38.4], [17.1, 38.9], [17.13, 39.08], [16.5, 39.75], [17.24, 40.47], [17.98, 40.06], [18.36, 39.8], [18.49, 40.15], [17.94, 40.64],
  [16.87, 41.13], [15.92, 41.63], [16.18, 41.88], [15.0, 42.0], [14.21, 42.46], [13.5, 43.62], [12.57, 44.06], [12.5, 44.95], [12.33, 45.44], [13.77, 45.65],
  [13.7, 46.5], [12.4, 47.0], [11.0, 46.9], [10.5, 46.6], [9.0, 46.4], [8.4, 46.3], [7.0, 45.9], [6.8, 45.0], [7.0, 44.2]];
const SICILY = [[12.4, 37.8], [13.36, 38.13], [14.0, 38.03], [15.2, 38.27], [15.65, 38.26], [15.1, 37.5], [15.3, 37.07], [15.1, 36.68], [14.5, 36.8], [13.6, 37.2], [12.6, 37.55]];
const SARDINIA = [[8.2, 41.0], [9.5, 41.2], [9.8, 40.5], [9.6, 39.5], [9.2, 39.2], [8.4, 38.9], [8.4, 39.8], [8.4, 40.6]];
const CORSICA = [[9.4, 43.0], [9.55, 42.2], [9.2, 41.38], [8.6, 41.7], [8.6, 42.4], [9.1, 42.7]];
const SPINE = [[7.6, 44.15], [8.9, 44.55], [9.9, 44.45], [10.9, 44.15], [11.6, 43.85], [12.3, 43.45], [13.0, 42.9], [13.7, 42.25], [14.3, 41.7], [15.0, 41.1], [15.6, 40.5], [16.0, 39.9], [16.2, 39.2], [16.0, 38.4]];
const WEST_CLIP = [[0, 44.15], ...SPINE, [16.0, 30], [0, 30]];
const EAST_CLIP = [[0, 44.15], ...SPINE, [16.0, 30], [30, 30], [30, 50], [0, 50]];

// ---------- the gallery's walls (Wikipedia's list), north to south ----------
const TYRRHENIAN = ['Liguria', 'Etruria', 'Perusinus', 'Umbria', 'Latium et Sabina', 'Patrimonium', 'Campania', 'Principatus Salerni', 'Lucania', 'Calabria citerior', 'Calabria ulterior', 'Sicilia', 'Sardinia', 'Corsica', 'Avenionensis'];
const ADRIATIC = ['Pedemontium', 'Mediolanensis', 'Mantuae ducatus', 'Transpadana', 'Forum Iulii', 'Placentia et Parma', 'Ferraria', 'Bononiensis', 'Flaminia', 'Urbini ducatus', 'Picenum', 'Ager anconitanus', 'Aprutium', 'Apulia', 'Salentina'];
const LENGTH = 120, WIDTH = 6, MAPS = 40, REGIONAL = 32, END_MAPS = 8, CEILING = 51;
if (TYRRHENIAN.length + ADRIATIC.length + 2 !== REGIONAL || REGIONAL + END_MAPS !== MAPS) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `The Vatican’s Gallery of Maps, ${LENGTH} m long, was painted from 1580 in under two years.`],
  [4.8, 9.0, `Its ${MAPS} maps of Italy were designed by Egnazio Danti, a Dominican friar and mathematician.`],
  [9.2, 13.6, 'Danti split Italy along its mountain spine, the *Apennines*, and gave each side a wall.'],
  [13.8, 18.2, 'Regions on the Ligurian and ~Tyrrhenian~ seas face the Belvedere Courtyard…'],
  [18.4, 22.8, '…and those bounded by the Alps and the ^Adriatic^ face the Vatican Gardens.'],
  [23.0, 27.4, 'Inland regions take sides too: Umbria goes west, the Duchy of Milan with the Adriatic.'],
  [27.6, 32.0, `Then the halves are laid out: ${REGIONAL} regional maps in order along the two long walls.`],
  [32.2, 36.6, 'So walking the corridor is like walking the length of Italy along the Apennines.'],
  [36.8, 41.2, 'Each regional map also has a bird’s-eye view of its chief city, such as Rome.'],
  [41.4, 45.8, `${END_MAPS === 8 ? 'Eight' : END_MAPS} narrower maps at the ends show islands, four great ports and two battles.`],
  [46.0, 50.4, `Above, ${CEILING} ceiling panels tell stories of the Church set in the regions below.`],
  [50.6, 55.0, 'Danti was also an astronomer: in 1574 he found the spring equinox falling on 11 March.'],
  [55.2, 59.6, 'Pope Gregory XIII made him papal mathematician and put him on his calendar commission.'],
  [59.8, 64.2, 'The Vatican Museums call it the first picture of a divided Italy as one land.'],
];

// ---------- background: parchment ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rg = g.createRadialGradient(CX, 420, 100, CX, 460, 760); rg.addColorStop(0, C.parch); rg.addColorStop(1, C.parch2);
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(120,90,40,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r()); }
  g.strokeStyle = 'rgba(184,134,46,0.55)'; g.lineWidth = 5; g.strokeRect(18, 18, W - 36, 760);
  g.strokeStyle = 'rgba(184,134,46,0.3)'; g.lineWidth = 2; g.strokeRect(30, 30, W - 60, 736);
}

// ---------- map projection ----------
let MAP = { x: 160, y: 70, k: 60 };
const MX = (lon) => MAP.x + (lon - 6.5) * 0.743 * MAP.k;
const MY = (lat) => MAP.y + (47.3 - lat) * MAP.k;
function path(pts, close = true) { ctx.beginPath(); pts.forEach(([lo, la], i) => (i ? ctx.lineTo(MX(lo), MY(la)) : ctx.moveTo(MX(lo), MY(la)))); if (close) ctx.closePath(); }
function land(fill) { for (const p of [MAINLAND, SICILY, SARDINIA, CORSICA]) { path(p); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = 'rgba(58,42,28,0.5)'; ctx.lineWidth = 1.6; ctx.stroke(); } }
function italy(a, { split = 0, halves = 0, apart = 0, spine = 0, seas = 0 } = {}) {
  A(a, () => {
    // the sea
    ctx.fillStyle = C.sea2; ctx.fillRect(MX(6.4), MY(47.4), MX(19.2) - MX(6.4), MY(36.3) - MY(47.4));
    for (const [clip, col, dx] of [[WEST_CLIP, C.west, -apart], [EAST_CLIP, C.east, apart]]) {
      ctx.save(); ctx.translate(dx, 0);
      path(clip); ctx.clip();
      land(C.land);
      if (halves > 0) A(halves * 0.55, () => land(col));
      ctx.restore();
    }
    // the Apennines
    if (spine > 0) {
      const n = Math.max(2, Math.ceil(SPINE.length * spine));
      ctx.strokeStyle = C.mount; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (split > 0) ctx.setLineDash([12, 10]);
      path(SPINE.slice(0, n), false); ctx.stroke(); ctx.setLineDash([]);
      // little mountains along it
      ctx.fillStyle = C.mount;
      for (let i = 0; i < n - 1; i++) { const [lo, la] = SPINE[i], [lo2, la2] = SPINE[i + 1]; const x = MX((lo + lo2) / 2), y = MY((la + la2) / 2); ctx.beginPath(); ctx.moveTo(x - 9, y + 6); ctx.lineTo(x, y - 10); ctx.lineTo(x + 9, y + 6); ctx.fill(); }
    }
    if (seas > 0) A(seas, () => {
      font(600, 22, SERIF);
      const two = (a1, a2, lon, lat, col) => { text(a1, MX(lon), MY(lat) - 14, { align: 'center', base: 'middle', color: col, spacing: '2px' }); text(a2, MX(lon), MY(lat) + 14, { align: 'center', base: 'middle', color: col, spacing: '2px' }); };
      two('MARE', 'TYRRHENUM', 12.2, 39.7, C.west);
      two('MARE', 'ADRIATICUM', 16.9, 43.1, C.east);
      two('MARE', 'LIGUSTICUM', 7.9, 43.3, C.west);
      text('ALPES', MX(10.5), MY(46.65), { align: 'center', base: 'middle', color: C.mount, spacing: '3px' });
      font(600, 22); text('APENNINES', MX(13.6), MY(42.45) - 8, { base: 'middle', color: C.mount, spacing: '1px' });
    });
  });
}
function cityDot(lon, lat, name, col = C.red, align = 'left') {
  const x = MX(lon), y = MY(lat);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
  font(700, 22); text(name, x + (align === 'left' ? 12 : -12), y, { align, base: 'middle', color: col });
}

// ---------- A: the gallery in perspective ----------
function gallery(a) {
  A(a, () => {
    const vx = CX, vy = 330, L = 60, R = W - 60, T = 60, B = 700;
    const depth = (z) => 1 / (1 + z); // z from 0 (front) to far
    const pt = (x, y, z) => [vx + (x - vx) * depth(z), vy + (y - vy) * depth(z)];
    // the vault: gilded with coloured panels
    for (let i = 0; i < 18; i++) {
      const z0 = i * 0.55, z1 = z0 + 0.55;
      const [ax, ay] = pt(L, T + 60, z0), [bx, by] = pt(R, T + 60, z0), [cx2, cy2] = pt(R, T + 60, z1), [dx, dy] = pt(L, T + 60, z1);
      ctx.fillStyle = i % 2 ? C.gold2 : C.gold; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(vx, T - 70 * depth(z0), bx, by); ctx.lineTo(cx2, cy2); ctx.quadraticCurveTo(vx, T - 70 * depth(z1), dx, dy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = i % 3 ? '#4f7d95' : '#8f4a3a'; const [px, py] = pt(vx - 40, T + 10, z0 + 0.27); ctx.beginPath(); ctx.ellipse(px + 40 * depth(z0 + 0.27), py, 30 * depth(z0 + 0.27), 12 * depth(z0 + 0.27), 0, 0, TAU); ctx.fill();
    }
    // the floor
    const [fl, fy] = pt(L, B, 10), [fr] = pt(R, B, 10);
    ctx.fillStyle = '#c9b28a'; ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(R, B); ctx.lineTo(fr, fy); ctx.lineTo(fl, fy); ctx.fill();
    // the walls with framed maps, receding
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? L : R;
      ctx.fillStyle = '#e8dcc0'; const [a1, a2] = pt(x0, T + 60, 0), [b1, b2] = pt(x0, T + 60, 10), [c1, c2] = pt(x0, B, 10);
      ctx.beginPath(); ctx.moveTo(a1, a2); ctx.lineTo(b1, b2); ctx.lineTo(c1, c2); ctx.lineTo(x0, B); ctx.fill();
      for (let i = 0; i < 16; i++) {
        const z0 = 0.15 + i * 0.62, z1 = z0 + 0.48;
        const p1 = pt(x0, T + 120, z0), p2 = pt(x0, T + 120, z1), p3 = pt(x0, B - 70, z1), p4 = pt(x0, B - 70, z0);
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.lineTo(...p3); ctx.lineTo(...p4); ctx.fill();
        const q = (p, f) => [lerp(p[0], vx, f * 0), p[1]];
        const inset = (pA, pB, f) => [lerp(pA[0], pB[0], f), lerp(pA[1], pB[1], f)];
        const m1 = inset(p1, p3, 0.08), m2 = inset(p2, p4, 0.08), m3 = inset(p3, p1, 0.08), m4 = inset(p4, p2, 0.08);
        ctx.fillStyle = i % 2 ? C.land : '#a7b77a'; ctx.beginPath(); ctx.moveTo(...q(m1)); ctx.lineTo(...q(m2)); ctx.lineTo(...q(m3)); ctx.lineTo(...q(m4)); ctx.fill();
        ctx.fillStyle = C.sea; const s1 = inset(m1, m4, 0.0), s2 = inset(m2, m3, 0.0), s3 = inset(m3, m2, 0.65), s4 = inset(m4, m1, 0.65);
        ctx.beginPath(); ctx.moveTo(...s1); ctx.lineTo(...s2); ctx.lineTo(...s3); ctx.lineTo(...s4); ctx.fill();
      }
    }
    // the far end
    const [e1, e2] = pt(L, T + 60, 10), [e3, e4] = pt(R, B, 10);
    ctx.fillStyle = '#d9c9a3'; ctx.fillRect(e1, e2, e3 - e1, e4 - e2);
  });
}
function sceneGallery(t) {
  const a = span(t, 0, 9.4, 0.5, 0.5);
  if (a <= 0) return;
  gallery(a);
  A(a * seg(t, 1.0, 2.0), () => {
    ctx.fillStyle = 'rgba(239,227,197,0.9)'; k.rrect(CX - 250, 724, 500, 50, 8); ctx.fill();
    font(700, 24); text(`GALLERY OF MAPS · ${LENGTH} m × ${WIDTH} m`, CX, 750, { align: 'center', base: 'middle', color: C.ink, spacing: '2px' });
  });
}

// ---------- B: the spine and the two sides ----------
function sceneSides(t) {
  const a = span(t, 9.2, 27.9, 0.5, 0.3);
  if (a <= 0) return;
  MAP = { x: 160, y: 70, k: 60 };
  italy(a, { spine: eio(seg(t, 9.8, 12.0)), halves: seg(t, 12.6, 13.6), seas: seg(t, 13.0, 14.0) });
  A(a * seg(t, 14.2, 15.0), () => { font(700, 22); text('west side: the wall facing', MX(6.7), MY(37.35), { base: 'middle', color: C.west }); text('the Belvedere Courtyard', MX(6.7), MY(37.35) + 26, { base: 'middle', color: C.west }); });
  A(a * seg(t, 18.8, 19.6), () => { font(700, 22); text('east side: the wall', MX(19.0), MY(46.75), { align: 'right', base: 'middle', color: C.east }); text('facing the Gardens', MX(19.0), MY(46.75) + 26, { align: 'right', base: 'middle', color: C.east }); });
  A(a * seg(t, 23.4, 24.2), () => {
    cityDot(12.74, 42.73, 'Umbria: west', C.red, 'right');
    cityDot(9.19, 45.46, 'Milan: Adriatic side', C.red, 'left');
  });
}

// ---------- C and D: the corridor ----------
const COR = { top: 96, bottom: 736, lx: 196, rx: 448, w: 222 };
const PANEL_H = (COR.bottom - COR.top - 60) / 15;
function panelY(i) { return COR.top + 30 + i * PANEL_H; }
function corridor(a, { fill = 1, walk = -1, city = 0, ends = 0 } = {}) {
  A(a, () => {
    // the floor of the corridor between the walls
    ctx.fillStyle = 'rgba(201,178,138,0.6)'; ctx.fillRect(COR.lx + COR.w, COR.top, COR.rx - COR.lx - COR.w, COR.bottom - COR.top);
    const wall = (names, x0, col, align) => names.forEach((nm, i) => {
      const v = clamp(fill * 15 - i);
      if (v <= 0) return;
      A(v, () => {
        const y = panelY(i), lit = walk >= 0 && Math.abs(walk - i) < 0.8;
        ctx.fillStyle = lit ? col : 'rgba(255,255,255,0.35)'; k.rrect(x0, y + 2, COR.w, PANEL_H - 4, 4); ctx.fill();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
        font(600, 22); text(nm, align === 'left' ? x0 + 10 : x0 + COR.w - 10, y + PANEL_H / 2, { align, base: 'middle', color: lit ? '#fff8ea' : C.ink });
      });
    });
    wall(TYRRHENIAN, COR.lx, C.west, 'left');
    wall(ADRIATIC, COR.rx, C.east, 'right');
    // the eight narrow end maps
    A(ends, () => {
      for (const y of [COR.top, COR.bottom - 26]) for (let i = 0; i < 4; i++) { ctx.fillStyle = C.gold2; ctx.fillRect(COR.lx + 40 + i * 120, y + 4, 90, 18); }
    });
    font(700, 22);
    text('TYRRHENIAN WALL', COR.lx, COR.top - 16, { base: 'middle', color: C.west, spacing: '1px' });
    text('ADRIATIC WALL', COR.rx + COR.w, COR.top - 16, { align: 'right', base: 'middle', color: C.east, spacing: '1px' });
    font(600, 22); text('north', COR.rx + COR.w + 18, panelY(0) + PANEL_H / 2, { base: 'middle', color: C.soft });
    text('south', COR.rx + COR.w + 18, panelY(14) + PANEL_H / 2, { base: 'middle', color: C.soft });
    // the walker
    if (walk >= 0) {
      const y = panelY(clamp(walk, 0, 14)) + PANEL_H / 2, x = (COR.lx + COR.w + COR.rx) / 2;
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x - 8, y - 12); ctx.lineTo(x + 8, y - 12); ctx.fill();
    }
    // a city view on Latium's panel
    if (city > 0) A(city, () => {
      const i = TYRRHENIAN.indexOf('Latium et Sabina'), y = panelY(i);
      ctx.fillStyle = '#fff8ea'; k.rrect(COR.lx - 150, y - 34, 130, 110, 6); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      // a tiny bird's-eye Rome: walls, river, domes
      const cx = COR.lx - 85, cy = y + 20;
      ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, TAU); ctx.stroke();
      ctx.strokeStyle = C.sea; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 44, cy - 30); ctx.quadraticCurveTo(cx - 6, cy, cx - 20, cy + 44); ctx.stroke();
      ctx.fillStyle = C.ink; for (const [dx, dy] of [[8, -10], [18, 8], [-2, 18], [24, -18]]) { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, Math.PI, 0); ctx.fill(); }
      font(700, 22); text('ROMA', cx, y - 18, { align: 'center', base: 'middle', color: C.red });
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(COR.lx - 20, y + PANEL_H / 2); ctx.lineTo(COR.lx + 4, y + PANEL_H / 2); ctx.stroke();
    });
  });
}
function sceneCorridor(t) {
  // the halves slide apart and fade as the walls fill
  const a1 = t < 27.6 ? 0 : span(t, 27.6, 31.0, 0.3, 1.0);
  if (a1 > 0) { MAP = { x: 160, y: 70, k: 60 }; italy(a1, { spine: 1, halves: 1, split: 1, apart: eio(seg(t, 27.8, 29.6)) * 120 }); }
  const a = span(t, 28.8, 46.2, 0.8, 0.4);
  if (a <= 0) return;
  const walk = t < 32.4 ? -1 : lerp(14, 0, eio(seg(t, 32.6, 40.6)));
  corridor(a, { fill: eio(seg(t, 29.0, 31.8)), walk, city: seg(t, 37.2, 38.0), ends: seg(t, 41.8, 42.6) });
  A(a * seg(t, 42.4, 43.2), () => {
    font(700, 22); text('8 narrow maps', 688, 330, { base: 'middle', color: C.ink }); text('at the ends:', 688, 358, { base: 'middle', color: C.ink });
    font(500, 22); for (const [i, s] of ['Malta, Lepanto,', 'Elba, Tremiti,', 'four ports'].entries()) text(s, 688, 396 + i * 28, { base: 'middle', color: C.soft });
  });
}

// ---------- E: the ceiling, and Danti the astronomer ----------
function sceneDanti(t) {
  A(span(t, 46.0, 50.8, 0.4, 0.4), () => {
    // the vault's 51 panels, as a band over the corridor
    const n = Math.round(lerp(0, CEILING, eio(seg(t, 46.4, 48.8))));
    for (let i = 0; i < n; i++) {
      const c = i % 17, r = Math.floor(i / 17), x = 92 + c * 40, y = 110 + r * 64;
      ctx.fillStyle = C.gold; ctx.fillRect(x, y, 34, 56);
      ctx.fillStyle = ['#4f7d95', '#8f4a3a', '#6d8a4c'][(c + r) % 3]; ctx.fillRect(x + 5, y + 6, 24, 44);
    }
    font(800, 56, SERIF); text(String(n), CX, 360, { align: 'center', base: 'middle', color: C.gold });
    font(600, 24); text('ceiling panels, each above the region it belongs to', CX, 410, { align: 'center', base: 'middle', color: C.soft });
  });
  A(span(t, 50.6, 59.8, 0.4, 0.4), () => {
    // March 1574: the equinox on the 11th
    font(700, 26); text('MARCH 1574', CX, 130, { align: 'center', base: 'middle', color: C.ink, spacing: '3px' });
    for (let d = 8; d <= 24; d++) {
      const x = 96 + (d - 8) * 42, y = 180, v = seg(t, 50.8 + (d - 8) * 0.04, 51.2 + (d - 8) * 0.04);
      A(v, () => {
        ctx.fillStyle = d === 11 ? C.gold2 : 'rgba(255,255,255,0.45)'; k.rrect(x, y, 36, 50, 5); ctx.fill();
        font(700, 22); text(String(d), x + 18, y + 25, { align: 'center', base: 'middle', color: d === 11 ? '#fff8ea' : C.ink });
      });
    }
    A(seg(t, 51.8, 52.6), () => {
      const x = 96 + 3 * 42 + 18;
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, 290, 26, 0, TAU); ctx.fill();
      for (let i = 0; i < 12; i++) { const ang = (i / 12) * TAU; ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * 32, 290 + Math.sin(ang) * 32); ctx.lineTo(x + Math.cos(ang) * 42, 290 + Math.sin(ang) * 42); ctx.stroke(); }
      font(600, 22); text('equinox measured by Danti', x + 56, 290, { base: 'middle', color: C.ink });
      // 11 days off the calendar's date
      const x2 = 96 + 14 * 42 + 18;
      ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 248); ctx.lineTo(x, 262); ctx.moveTo(x2, 248); ctx.lineTo(x2, 262); ctx.moveTo(x, 255); ctx.lineTo(x2, 255); ctx.stroke();
      font(700, 22); text('11 days', (x + x2) / 2 + 60, 340, { align: 'center', base: 'middle', color: C.red });
    });
    A(seg(t, 55.6, 56.4), () => {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; k.rrect(CX - 300, 430, 600, 220, 10); ctx.fill();
      font(700, 26, SERIF); text('Egnazio Danti, 1536–1586', CX, 480, { align: 'center', base: 'middle', color: C.ink });
      font(500, 22); text('Dominican friar · mathematician · astronomer', CX, 522, { align: 'center', base: 'middle', color: C.soft });
      text('papal mathematician to Gregory XIII', CX, 560, { align: 'center', base: 'middle', color: C.soft });
      text('on the commission for the calendar of 1582', CX, 598, { align: 'center', base: 'middle', color: C.red });
    });
  });
}

// ---------- F: one land ----------
function sceneEnd(t) {
  const a = t < 59.8 ? 0 : span(t, 59.8, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  MAP = { x: 160, y: 70, k: 60 };
  italy(a, { spine: 1, halves: 1 - seg(t, 60.4, 62.4), seas: 1 });
  A(a * seg(t, 61.6, 62.4), () => {
    font(700, 40, SERIF); text('ITALIA', MX(12.2), MY(41.3), { align: 'center', base: 'middle', color: C.red, spacing: '10px' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneGallery(t);
    sceneSides(t);
    sceneCorridor(t);
    sceneDanti(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 40, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.mount, '~': C.west, '^': C.east } });
  },
});
