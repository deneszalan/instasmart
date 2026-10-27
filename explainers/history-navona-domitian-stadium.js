// Explainer for history-navona-domitian-stadium (Roma): Piazza Navona keeps the outline of the Stadium of Domitian,
// because later Rome built its houses on the stadium's stands and left the track open; then Bernini's Fountain of the
// Four Rivers and the legend that its Nile hides from Borromini's church, which the dates rule out. Look: an engraved
// city plan in the manner of Nolli's 1748 map of Rome, buildings hatched in brown ink on sepia paper, open spaces
// left white; the stadium in red. Playfair Display for titles, Barlow for captions and labels.
//
// Facts:
// - Bernard & Ciancio Rossetto, "Le stade de Domitien" (MEFRM 126-1, 2014, journals.openedition.org/mefrm/1862):
//   275 × 106 m (after Colini 1943); track 52.90 m wide; the curved end is to the north (remains of the hemicycle
//   north of the square), the other end straight; the whole cavea rests on a network of walls; modern buildings sit
//   on the ancient remains; the church of Sant'Agnese occupies the centre of the west side, at the main entrance,
//   probably that of the imperial box. First Capitoline Games in 86.
// - Turismo Roma (turismoroma.it/it/node/1103): inaugurated AD 86, 275 × 106 m, about 30,000 spectators, hidden about
//   4.50 m below today's street level.
// - Wikipedia, "Stadium of Domitian": Greek-style stadium, used almost entirely for athletic contests; later its
//   arcades housed the poor; in the Renaissance it was quarried for building material; Piazza Navona sits over the
//   arena, and the buildings round it incorporate the lower arcades.
// - Wikipedia, "Piazza Navona": a public space from the late 15th century, when the city market moved there from the
//   Campidoglio; Pope Innocent X (1644–1655) made it a Baroque showcase.
// - Wikipedia, "Fontana dei Quattro Fiumi": Gian Lorenzo Bernini, unveiled 12 June 1651; the Nile's head is draped
//   because no one then knew where its source was; the tour-guide legend that the Nile can't bear to look at
//   Borromini's church is false, as the fountain was finished before Borromini began work on the church.
// - Wikipedia, "Sant'Agnese in Agone": begun in 1652 by Girolamo and Carlo Rainaldi; Borromini replaced them in 1653
//   and resigned in 1657; the legend persists although the fountain predates the façade.
// The plan is simplified: the south end is drawn straight, the surrounding streets and blocks are schematic.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  Hook: the square on a map today; the stadium's outline drops onto it.
//  B  9.2–18.4  The stadium: 275 × 106 m, the stands, 30,000 spectators, curved end north.
//  C 18.4–32.0  Homes in the arcades, stone carted away, houses on the stands, the market on the track.
//  D 32.2–41.2  Section across the square: the arena 4.5 m down; Sant'Agnese on the main entrance.
//  E 41.4–64.6  Bernini's fountain, Borromini's church, the legend and the dates.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  paper: '#efe6d2', paper2: '#e3d5b8', ink: '#2f2721', soft: 'rgba(47,39,33,0.68)', faint: 'rgba(47,39,33,0.22)',
  hatch: 'rgba(47,39,33,0.62)', red: '#a8322a', blue: '#2f6594', sand: '#e9d6a8', ochre: '#b9772f', stone: '#cbbd9f',
};
const TITLE = 'Playfair Display', SANS = 'Barlow';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the stadium, in metres: x east, y north, origin at the middle ----------
const LEN = 275, WID = 106, TRACK = 52.9;
const RO = WID / 2, RI = TRACK / 2;           // outer and track half-widths
const NC = LEN / 2 - RO;                      // centre of the north curve
const SOUTH = -LEN / 2, TRACK_S = SOUTH + 14; // straight south end; the track stops short of it (schematic)
const SEATS = 30000, DEPTH = 4.5;
const STANDS = (WID - TRACK) / 2;             // ≈ 26.5 m from track to outer wall
if (Math.round(STANDS) !== 27) throw new Error('numbers');

// plan frame
const PS = 2.2, PX = 432, PY = 430;
const px = (x) => PX + x * PS, py = (y) => PY - y * PS;
function stadiumPath(r, south) {
  ctx.beginPath();
  ctx.moveTo(px(-r), py(south));
  ctx.lineTo(px(-r), py(NC));
  ctx.arc(px(0), py(NC), r * PS, Math.PI, 0);
  ctx.lineTo(px(r), py(south));
  ctx.closePath();
}

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'Rome’s *Piazza Navona* is long and narrow, with one rounded end. The shape is Roman.'],
  [4.8, 9.0, 'It traces a *stadium* Emperor Domitian opened in AD 86, for Greek-style athletics.'],
  [9.2, 13.6, `It was about ~${LEN} m~ long and ~${WID} m~ wide, with seats for some *${SEATS.toLocaleString('en-US')}* people.`],
  [13.8, 18.2, 'The curved end lay to the north. The crowd sat on stands around the track.'],
  [18.4, 22.8, 'After the empire, poor families lived in its arcades. Later its stone was carted away.'],
  [23.0, 27.4, 'Houses and palaces rose on the old stands. The track in the middle stayed open.'],
  [27.6, 32.0, 'In the late 1400s the city’s market moved there, and the track became a *public square*.'],
  [32.2, 36.6, `Its floor lies about ~${DEPTH} m~ below the paving. Remains survive under the north end.`],
  [36.8, 41.2, '*Sant’Agnese in Agone* church stands on the main entrance, probably the emperor’s box.'],
  [41.4, 45.8, 'In 1651 sculptor Gian Lorenzo Bernini unveiled his *Fountain of the Four Rivers* there.'],
  [46.0, 50.4, 'The church facing it is partly the work of his rival, architect *Francesco Borromini*.'],
  [50.6, 55.0, 'Legend says Bernini’s Nile covers its eyes to avoid seeing Borromini’s church.'],
  [55.2, 59.6, 'But the church was only begun in ^1652^, and Borromini took over in ^1653^.'],
  [59.8, 64.2, 'The Nile’s veil meant something else: in 1651, no one knew where the river began.'],
];

// ---------- background and seeded randomness ----------
let bg = null;
const rand = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H * 0.45, 760);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const r = rand(29);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(110,80,40,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r()); }
  g.strokeStyle = 'rgba(47,39,33,0.5)'; g.lineWidth = 2; g.strokeRect(20, 20, W - 40, 740);
  g.lineWidth = 0.8; g.strokeRect(28, 28, W - 56, 724);
}

// the hatched city blocks of the modern map (schematic), cut by a few streets
const BLOCKS = (() => {
  const r = rand(7), out = [];
  for (let gx = -175; gx < 175; gx += 22) {
    for (let gy = -175; gy < 175; gy += 22) {
      const x = gx + (r() - 0.5) * 4, y = gy + (r() - 0.5) * 4, w = 17 + r() * 4, h = 17 + r() * 4;
      out.push({ x, y, w, h, keep: r() });
    }
  }
  return out;
})();
function hatchFill(pathFn, alpha = 1) {
  A(alpha, () => {
    ctx.save(); pathFn(); ctx.clip();
    ctx.fillStyle = 'rgba(47,39,33,0.12)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.hatch; ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let d = -H; d < W + H; d += 5) { ctx.moveTo(d, 0); ctx.lineTo(d + H, H); }
    ctx.stroke();
    ctx.restore();
  });
}
function cityMap(a, { trackOpen = 1 } = {}) {
  A(a, () => {
    // blocks: everything outside the square, cut by streets
    hatchFill(() => {
      ctx.beginPath();
      for (const b of BLOCKS) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const inSquare = Math.abs(cx) < RI + 4 && cy < NC + RI && cy > TRACK_S - 4 || Math.hypot(cx, cy - NC) < RI + 4 && cy > NC;
        if (inSquare && trackOpen > 0.5) continue;
        if (px(b.x) < 36 || px(b.x + b.w) > W - 36 || py(b.y + b.h) < 36 || py(b.y) > 744) continue;
        ctx.rect(px(b.x), py(b.y + b.h), b.w * PS, b.h * PS);
      }
    });
    // the square itself, white
    ctx.fillStyle = C.paper; stadiumPath(RI, TRACK_S); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; stadiumPath(RI, TRACK_S); ctx.stroke();
    // three fountains on the long axis
    for (const [y, r] of [[78, 5], [0, 8], [-80, 5]]) {
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(px(0), py(y), r * PS * 0.9, 0, TAU); ctx.fill();
    }
    // Sant'Agnese on the west side, with its dome
    ctx.fillStyle = C.paper; ctx.fillRect(px(-RI - 44), py(14), 44 * PS, 28 * PS);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(px(-RI - 44), py(14), 44 * PS, 28 * PS);
    ctx.beginPath(); ctx.arc(px(-RI - 22), py(0), 10 * PS, 0, TAU); ctx.stroke();
  });
}
function titleBox() { ctx.fillStyle = 'rgba(239,230,210,0.94)'; ctx.fillRect(36, 40, 470, 108); }
function northArrow(a) {
  A(a, () => {
    const x = 700, y = 196;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(x, y - 36); ctx.lineTo(x - 12, y); ctx.lineTo(x, y - 8); ctx.lineTo(x + 12, y); ctx.closePath(); ctx.fill();
    font(700, 26, TITLE); text('N', x, y + 24, { align: 'center', base: 'middle' });
  });
}

// ---------- A: today, then the stadium drops in ----------
function sceneToday(t) {
  const a = span(t, 0, 9.4, 0.5, 0.4);
  cityMap(a);
  northArrow(a);
  A(a * (1 - seg(t, 4.6, 5.2)), () => {
    titleBox(); font(700, 44, TITLE); text('Piazza Navona', 52, 82, { base: 'middle', color: C.ink });
    font(600, 24); text('ROME, TODAY', 52, 122, { base: 'middle', color: C.soft, spacing: '3px' });
    font(600, 22); text('Fountain of the', px(RI) + 18, py(6), { base: 'middle', color: C.blue });
    text('Four Rivers', px(RI) + 18, py(-6), { base: 'middle', color: C.blue });
    text('Sant’Agnese', px(-RI - 22), py(-26), { align: 'center', base: 'middle', color: C.soft });
  });
  // the stadium outline lands on the map
  const d = eout(seg(t, 5.0, 6.6));
  A(seg(t, 5.0, 5.6) * span(t, 0, 9.6, 0, 0.4), () => {
    ctx.save(); ctx.translate(0, (1 - d) * -60);
    ctx.strokeStyle = C.red; ctx.lineWidth = 5; stadiumPath(RO, SOUTH); ctx.stroke();
    ctx.lineWidth = 3; ctx.setLineDash([12, 8]); stadiumPath(RI, TRACK_S); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    A(seg(t, 6.4, 7.0), () => { titleBox(); font(700, 34, TITLE); text('Stadium of Domitian', 52, 82, { base: 'middle', color: C.red }); font(600, 24); text('OPENED AD 86', 52, 122, { base: 'middle', color: C.soft, spacing: '3px' }); });
  });
}

// ---------- the stadium itself ----------
const RADIALS = (() => {
  const out = [];
  for (let y = SOUTH + 4; y < NC; y += 7) { out.push([[-RI, y], [-RO, y]]); out.push([[RI, y], [RO, y]]); }
  for (let a = 0; a <= Math.PI + 1e-6; a += Math.PI / 18) out.push([[RI * Math.cos(a), NC + RI * Math.sin(a)], [RO * Math.cos(a), NC + RO * Math.sin(a)]]);
  const r = rand(5); return out.map((s) => ({ s, gone: 0.15 + r() * 0.8 }));
})();
const CROWD = (() => {
  const r = rand(17), out = [];
  while (out.length < 900) {
    const x = (r() * 2 - 1) * RO, y = SOUTH + r() * (LEN);
    const inOuter = (y <= NC && Math.abs(x) < RO - 1.5 && y > SOUTH + 2) || (y > NC && Math.hypot(x, y - NC) < RO - 1.5);
    const inTrack = (y <= NC && Math.abs(x) < RI + 1.5 && y > TRACK_S - 2) || (y > NC && Math.hypot(x, y - NC) < RI + 1.5);
    if (inOuter && !inTrack && y > TRACK_S) out.push({ x, y, t: r() });
  }
  return out;
})();
const HOUSES = (() => {
  const r = rand(41), out = [];
  for (let i = 0; i < 70; i++) {
    const side = r() < 0.5 ? -1 : 1, onCurve = r() < 0.22;
    if (onCurve) { const a = r() * Math.PI, rr = RI + 4 + r() * (STANDS - 10); out.push({ x: rr * Math.cos(a) - 4, y: NC + rr * Math.sin(a) - 4, w: 9 + r() * 6, h: 9 + r() * 6, t: r() }); }
    else out.push({ x: side * (RI + 3 + r() * (STANDS - 12)) - (side < 0 ? 10 : 0), y: TRACK_S + r() * (NC - TRACK_S), w: 10 + r() * 6, h: 10 + r() * 12, t: r() });
  }
  return out;
})();
function stadium(t, a) {
  A(a, () => {
    const decay = seg(t, 18.8, 23.0), houses = seg(t, 19.6, 27.0);
    // the stands
    ctx.fillStyle = 'rgba(203,189,159,0.75)'; stadiumPath(RO, SOUTH); ctx.fill();
    ctx.fillStyle = C.sand; stadiumPath(RI, TRACK_S); ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 1.6;
    for (const { s: [[x1, y1], [x2, y2]], gone } of RADIALS) {
      A(1 - clamp((decay - gone + 0.15) * 4), () => { ctx.beginPath(); ctx.moveTo(px(x1), py(y1)); ctx.lineTo(px(x2), py(y2)); ctx.stroke(); });
    }
    A(1 - decay * 0.7, () => { ctx.strokeStyle = C.red; ctx.lineWidth = 5; stadiumPath(RO, SOUTH); ctx.stroke(); });
    ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; stadiumPath(RI, TRACK_S); ctx.stroke();
    // the crowd
    const fill = seg(t, 10.4, 13.4) * (1 - seg(t, 18.4, 19.4));
    ctx.fillStyle = C.ink;
    for (const p of CROWD) if (p.t < fill) { ctx.fillRect(px(p.x) - 1.4, py(p.y) - 1.4, 2.8, 2.8); }
    // houses on the stands
    for (const h of HOUSES) {
      const v = clamp((houses - h.t * 0.8) * 5);
      if (v <= 0) continue;
      A(v, () => {
        ctx.fillStyle = C.paper; ctx.fillRect(px(h.x), py(h.y + h.h), h.w * PS, h.h * PS);
        ctx.save(); ctx.beginPath(); ctx.rect(px(h.x), py(h.y + h.h), h.w * PS, h.h * PS); ctx.clip();
        ctx.strokeStyle = C.hatch; ctx.lineWidth = 1.1; ctx.beginPath();
        for (let d = -60; d < 120; d += 5) { ctx.moveTo(px(h.x) + d, py(h.y + h.h)); ctx.lineTo(px(h.x) + d + 60, py(h.y + h.h) + 60); }
        ctx.stroke(); ctx.restore();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(px(h.x), py(h.y + h.h), h.w * PS, h.h * PS);
      });
    }
  });
}
function sceneStadium(t) {
  const a = span(t, 9.2, 27.8, 0.5, 0.6);
  stadium(t, a);
  northArrow(span(t, 9.2, 32.2, 0.5, 0.4));
  A(span(t, 9.4, 18.6, 0.4, 0.4), () => {
    // dimensions
    ctx.strokeStyle = C.blue; ctx.fillStyle = C.blue; ctx.lineWidth = 2;
    const xd = px(RO) + 26;
    ctx.beginPath(); ctx.moveTo(xd, py(SOUTH)); ctx.lineTo(xd, py(LEN / 2)); ctx.stroke();
    for (const y of [SOUTH, LEN / 2]) { ctx.beginPath(); ctx.moveTo(xd - 9, py(y)); ctx.lineTo(xd + 9, py(y)); ctx.stroke(); }
    font(700, 28); text(`${LEN} m`, xd + 16, py(0), { base: 'middle', color: C.blue });
    const yd = py(LEN / 2) - 22;
    ctx.beginPath(); ctx.moveTo(px(-RO), yd); ctx.lineTo(px(RO), yd); ctx.stroke();
    for (const x of [-RO, RO]) { ctx.beginPath(); ctx.moveTo(px(x), yd - 9); ctx.lineTo(px(x), yd + 9); ctx.stroke(); }
    text(`${WID} m`, px(0), yd - 24, { align: 'center', base: 'middle', color: C.blue });
    A(seg(t, 11.0, 11.8), () => {
      font(700, 40, TITLE); text(`${SEATS.toLocaleString('en-US')}`, 60, py(40), { base: 'middle', color: C.red });
      font(600, 24); text('SEATS, ABOUT', 60, py(40) - 38, { base: 'middle', color: C.soft, spacing: '2px' });
    });
  });
  A(span(t, 13.8, 18.6, 0.4, 0.4), () => {
    font(600, 24);
    text('curved end', px(-RO) - 16, py(NC + 30), { align: 'right', base: 'middle', color: C.red });
    text('to the north', px(-RO) - 16, py(NC + 30) + 28, { align: 'right', base: 'middle', color: C.red });
    text('TRACK', px(0), py(-40), { align: 'center', base: 'middle', color: C.ink, spacing: '4px' });
    text('stands', px(RO) + 16, py(NC + 20), { base: 'middle', color: C.soft });
    text('straight end', px(RO) + 16, py(SOUTH + 20), { base: 'middle', color: C.soft });
  });
  // decline and rebirth
  A(span(t, 18.6, 23.0, 0.4, 0.4), () => {
    font(600, 24);
    text('homes in the arcades', 60, py(30), { base: 'middle', color: C.ink });
    text('stone carted away', 60, py(30) + 32, { base: 'middle', color: C.red });
  });
  A(span(t, 23.2, 27.6, 0.4, 0.4), () => {
    font(600, 24); text('houses on the stands', 60, py(30), { base: 'middle', color: C.ink });
    text('the track left open', 60, py(30) + 32, { base: 'middle', color: C.ochre });
  });
}

// ---------- C: the square, the market ----------
const STALLS = (() => { const r = rand(77), out = []; for (let i = 0; i < 26; i++) out.push({ x: (r() * 2 - 1) * (RI - 8), y: TRACK_S + 10 + r() * (NC + 10 - TRACK_S), t: r() }); return out; })();
function sceneMarket(t) {
  const a = span(t, 27.2, 32.4, 0.6, 0.4);
  cityMap(a);
  A(a, () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); stadiumPath(RO, SOUTH); ctx.stroke(); ctx.setLineDash([]);
    const v = seg(t, 28.2, 30.4);
    for (const s of STALLS) {
      if (s.t > v) continue;
      ctx.fillStyle = C.ochre; ctx.fillRect(px(s.x) - 7, py(s.y) - 5, 14, 10);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(px(s.x) - 7, py(s.y) - 5, 14, 10);
    }
    titleBox(); font(700, 34, TITLE); text('The market', 52, 82, { base: 'middle', color: C.ochre });
    font(600, 24); text('MOVED HERE IN THE LATE 1400s', 52, 122, { base: 'middle', color: C.soft, spacing: '2px' });
  });
}

// ---------- D: section across the west side of the square ----------
const SS = 7.6, SX = 40 + 80 * 7.6, SY = 640;
const sx = (x) => SX + x * SS, sz = (z) => SY - z * SS;
function sceneSection(t) {
  const a = span(t, 32.2, 41.4, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 34, TITLE); text('Across the square', 52, 70, { base: 'middle' });
    font(600, 22); text('SECTION THROUGH THE WEST SIDE, SIMPLIFIED', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
    // earth below today's paving
    ctx.fillStyle = '#d7c6a2'; ctx.fillRect(sx(-80), sz(DEPTH), 112 * SS, (DEPTH + 8) * SS);
    // rubble that filled the old arena
    ctx.save(); ctx.beginPath(); ctx.rect(sx(-RI), sz(DEPTH), 60 * SS, DEPTH * SS); ctx.clip();
    ctx.strokeStyle = 'rgba(47,39,33,0.35)'; ctx.lineWidth = 1;
    for (let d = -200; d < 700; d += 9) { ctx.beginPath(); ctx.moveTo(sx(-RI) + d, sz(DEPTH)); ctx.lineTo(sx(-RI) + d - 40, sz(0)); ctx.stroke(); }
    ctx.restore();
    // houses over the old stands, drawn see-through
    const hx0 = -80, hx1 = -RI - 1, top = DEPTH + 22;
    ctx.fillStyle = 'rgba(239,230,210,0.7)'; ctx.fillRect(sx(hx0), sz(top), (hx1 - hx0) * SS, 22 * SS);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(sx(hx0), sz(top), (hx1 - hx0) * SS, 22 * SS);
    ctx.lineWidth = 1.2;
    for (let f = 1; f < 5; f++) { ctx.beginPath(); ctx.moveTo(sx(hx0), sz(DEPTH + f * 4.4)); ctx.lineTo(sx(hx1), sz(DEPTH + f * 4.4)); ctx.stroke(); }
    for (let w = hx0 + 4; w < hx1 - 3; w += 6) for (let f = 0; f < 5; f++) { ctx.strokeRect(sx(w), sz(DEPTH + f * 4.4 + 3.4), 2.2 * SS, 2.2 * SS); }
    // the ancient stands: a rake from the track to the outer wall, inside the houses' lower floors
    ctx.fillStyle = 'rgba(168,50,42,0.22)'; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx(-RI), sz(0)); ctx.lineTo(sx(-RI), sz(3));
    const steps = 9;
    for (let i = 1; i <= steps; i++) { const x = RI + (STANDS * i) / steps, z = 3 + (14 * i) / steps; ctx.lineTo(sx(-(x - STANDS / steps)), sz(z)); ctx.lineTo(sx(-x), sz(z)); }
    ctx.lineTo(sx(-RO), sz(0)); ctx.closePath(); ctx.fill(); ctx.stroke();
    // the old arena floor
    ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx(-RI), sz(0)); ctx.lineTo(sx(30), sz(0)); ctx.stroke();
    // the paving today
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx(-80), sz(DEPTH)); ctx.lineTo(sx(32), sz(DEPTH)); ctx.stroke();
    // Sant'Agnese, above the main entrance
    A(seg(t, 36.8, 37.6), () => {
      const x0 = -RI - 1, x1 = -66, dc = (x0 + x1) / 2;
      ctx.fillStyle = 'rgba(239,230,210,0.6)'; ctx.strokeStyle = C.red; ctx.lineWidth = 3;
      ctx.fillRect(sx(x1), sz(DEPTH + 26), (x0 - x1) * SS, 26 * SS); ctx.strokeRect(sx(x1), sz(DEPTH + 26), (x0 - x1) * SS, 26 * SS);
      ctx.fillRect(sx(dc - 9), sz(DEPTH + 35), 18 * SS, 9 * SS); ctx.strokeRect(sx(dc - 9), sz(DEPTH + 35), 18 * SS, 9 * SS);
      ctx.beginPath(); ctx.arc(sx(dc), sz(DEPTH + 35), 9 * SS, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx(dc), sz(DEPTH + 44)); ctx.lineTo(sx(dc), sz(DEPTH + 49)); ctx.stroke();
      font(700, 26); text('Sant’Agnese', sx(dc) + 9 * SS + 14, sz(DEPTH + 38), { base: 'middle', color: C.red });
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(sx(-RO + 8), sz(2), 10, 0, TAU); ctx.fill();
      font(600, 22); text('main entrance, probably the emperor’s box', sx(-RO + 8) - 12, sz(-5.5), { base: 'middle', color: C.red });
    });
    // labels and the depth
    font(600, 22);
    text('today’s paving', sx(4), sz(DEPTH) - 18, { align: 'center', base: 'middle', color: C.ink });
    text('the old arena floor', sx(4), sz(0) + 22, { align: 'center', base: 'middle', color: C.red });
    text('old stands, inside the houses', sx(-52), sz(top) - 18, { align: 'center', base: 'middle', color: C.red });
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; const xd = sx(22);
    ctx.beginPath(); ctx.moveTo(xd, sz(DEPTH)); ctx.lineTo(xd, sz(0)); ctx.stroke();
    for (const z of [0, DEPTH]) { ctx.beginPath(); ctx.moveTo(xd - 8, sz(z)); ctx.lineTo(xd + 8, sz(z)); ctx.stroke(); }
    font(700, 26); text(`≈ ${DEPTH} m`, xd - 14, sz(DEPTH / 2), { align: 'right', base: 'middle', color: C.blue });
    font(600, 22); text('WEST', sx(-78), sz(-5.5), { base: 'middle', color: C.soft, spacing: '2px' });
    text('TOWARD THE MIDDLE', 832, sz(DEPTH) - 52, { align: 'right', base: 'middle', color: C.soft, spacing: '2px' });
  });
}

// ---------- E: the fountain, the church, the legend ----------
function church(a, hl) {
  A(a, () => {
    const g = 700, cx = 432;
    const col = hl > 0 ? C.red : C.ink;
    ctx.fillStyle = C.paper; ctx.strokeStyle = col; ctx.lineWidth = 2.5;
    // towers
    for (const s of [-1, 1]) {
      const x = cx + s * 190;
      ctx.fillRect(x - 46, 330, 92, g - 330); ctx.strokeRect(x - 46, 330, 92, g - 330);
      ctx.fillRect(x - 32, 250, 64, 80); ctx.strokeRect(x - 32, 250, 64, 80);
      ctx.beginPath(); ctx.moveTo(x - 36, 250); ctx.lineTo(x, 214); ctx.lineTo(x + 36, 250); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // the concave front, lower and upper order
    ctx.beginPath(); ctx.moveTo(cx - 144, g); ctx.lineTo(cx - 144, 430); ctx.quadraticCurveTo(cx, 470, cx + 144, 430); ctx.lineTo(cx + 144, g); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.moveTo(cx + i * 36, g); ctx.lineTo(cx + i * 36, 450 + Math.abs(i) * -6); ctx.stroke(); }
    // drum and dome
    ctx.fillRect(cx - 92, 300, 184, 120); ctx.strokeRect(cx - 92, 300, 184, 120);
    ctx.beginPath(); ctx.ellipse(cx, 300, 98, 112, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillRect(cx - 14, 162, 28, 30); ctx.strokeRect(cx - 14, 162, 28, 30);
    ctx.beginPath(); ctx.moveTo(cx, 162); ctx.lineTo(cx, 140); ctx.stroke();
    // doorway
    ctx.fillStyle = 'rgba(47,39,33,0.55)'; ctx.fillRect(cx - 28, 600, 56, 100);
  });
}
function fountain(a, veilHl) {
  A(a, () => {
    const g = 744, cx = 432;
    // basin
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.ellipse(cx, g - 14, 300, 34, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(cx, g - 14, 300, 34, 0, 0, Math.PI); ctx.stroke();
    // rocks
    ctx.fillStyle = C.stone;
    ctx.beginPath(); ctx.moveTo(cx - 150, g - 30); ctx.lineTo(cx - 110, g - 120); ctx.lineTo(cx - 60, g - 150); ctx.lineTo(cx - 34, g - 186); ctx.lineTo(cx + 34, g - 186); ctx.lineTo(cx + 64, g - 146); ctx.lineTo(cx + 112, g - 118); ctx.lineTo(cx + 150, g - 30); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(47,39,33,0.55)'; ctx.beginPath(); ctx.ellipse(cx, g - 70, 34, 44, 0, 0, TAU); ctx.fill();
    // obelisk with the dove on top
    ctx.fillStyle = '#d9cbb0';
    ctx.beginPath(); ctx.moveTo(cx - 24, g - 186); ctx.lineTo(cx - 15, 236); ctx.lineTo(cx, 214); ctx.lineTo(cx + 15, 236); ctx.lineTo(cx + 24, g - 186); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(cx, 204, 12, 6, 0, 0, TAU); ctx.fill();
    // four river gods, reclining on the rocks (two in front, two behind)
    const god = (x, y, flip, veil) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
      ctx.fillStyle = '#e8dcc4'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      // legs stretched out, torso propped up on one arm, head turned, the other arm raised
      ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(30, 18, 58, 10); ctx.lineTo(56, -2); ctx.quadraticCurveTo(26, 2, -8, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-18, -18, 14, 22, -0.6, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-34, -44, 11, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(-40, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(8, -52); ctx.stroke(); ctx.lineWidth = 2;
      if (veil) { ctx.fillStyle = veilHl > 0 ? C.ochre : '#c9b48c'; ctx.beginPath(); ctx.moveTo(-50, -48); ctx.quadraticCurveTo(-36, -64, -20, -46); ctx.lineTo(-18, -26); ctx.lineTo(-50, -30); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    };
    god(cx - 170, g - 150, 1, false); god(cx + 170, g - 150, -1, false);
    god(cx - 128, g - 60, 1, true); god(cx + 128, g - 60, -1, false);
  });
}
function datesBar(t, a) {
  A(a, () => {
    const L = 70, R = 794, y = 92, y0 = 1648, y1 = 1658;
    const X = (yr) => L + ((yr - y0) / (y1 - y0)) * (R - L);
    ctx.fillStyle = 'rgba(239,230,210,0.94)'; ctx.fillRect(40, 40, W - 80, 136);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    font(600, 22);
    for (let yr = y0; yr <= y1; yr += 2) { ctx.beginPath(); ctx.moveTo(X(yr), y - 6); ctx.lineTo(X(yr), y + 6); ctx.stroke(); text(String(yr), X(yr), y + 24, { align: 'center', base: 'middle', color: C.soft }); }
    const marks = [[1651.45, 'fountain unveiled', C.blue, 55.2], [1652, 'church begun', C.red, 55.8], [1653, 'Borromini', C.red, 56.4]];
    marks.forEach(([yr, lab, col, at], i) => {
      A(seg(t, at, at + 0.5), () => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(yr), y, 9, 0, TAU); ctx.fill();
        font(700, 22); text(lab, X(yr) + (i === 0 ? -10 : 10), i === 2 ? y + 54 : y - 26, { align: i === 0 ? 'right' : 'left', base: 'middle', color: col });
      });
    });
  });
}
function sceneBaroque(t) {
  const a = span(t, 41.4, 64.6, 0.6, 0.0);
  if (a <= 0) return;
  A(a, () => {
    ctx.fillStyle = C.paper; ctx.fillRect(28, 28, W - 56, 724);
  });
  church(seg(t, 45.8, 46.8) * a, seg(t, 46.2, 46.8) * (1 - seg(t, 50.0, 50.6)));
  fountain(seg(t, 41.6, 42.6) * a, seg(t, 59.8, 60.4));
  A(span(t, 41.4, 50.6, 0.4, 0.4), () => {
    font(700, 34, TITLE); text('Fountain of the Four Rivers', 52, 70, { base: 'middle', color: C.blue });
    font(600, 22); text('GIAN LORENZO BERNINI, 1651', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
  });
  A(span(t, 46.2, 50.6, 0.4, 0.4), () => {
    font(600, 24); text('Sant’Agnese in Agone', 640, 540, { align: 'center', base: 'middle', color: C.red });
    text('Francesco Borromini', 640, 570, { align: 'center', base: 'middle', color: C.red });
  });
  // the legend: the Nile looking away
  A(span(t, 50.6, 64.6, 0.4, 0.0), () => {
    font(700, 26); text('NILE', 432 - 160, 744 - 18, { align: 'center', base: 'middle', color: C.ochre });
  });
  A(span(t, 50.8, 55.2, 0.4, 0.4), () => {
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
    ctx.beginPath(); ctx.moveTo(432 - 176, 744 - 86); ctx.lineTo(432 - 120, 520); ctx.stroke(); ctx.setLineDash([]);
    font(700, 40, TITLE); text('?', 432 - 112, 500, { align: 'center', base: 'middle', color: C.red });
    font(700, 34, TITLE); text('The legend', 52, 70, { base: 'middle', color: C.red });
    font(600, 22); text('THE NILE HIDES FROM BORROMINI’S CHURCH', 52, 106, { base: 'middle', color: C.soft, spacing: '2px' });
  });
  datesBar(t, span(t, 55.2, 64.6, 0.4, 0.0));
  A(span(t, 59.8, 64.6, 0.4, 0.0), () => {
    font(600, 24); text('veil: its source', 70, 470, { base: 'middle', color: C.ochre });
    text('was unknown', 70, 500, { base: 'middle', color: C.ochre });
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, 516); ctx.lineTo(432 - 128 - 44, 744 - 60 - 34); ctx.stroke();
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [TITLE, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneToday(t);
    sceneStadium(t);
    sceneMarket(t);
    sceneSection(t);
    sceneBaroque(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.blue, '^': C.ochre } });
  },
});
