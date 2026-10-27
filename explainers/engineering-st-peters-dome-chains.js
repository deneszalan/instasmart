// Explainer for engineering-st-peters-dome-chains (Roma): in the 1740s St Peter's dome was cracked into slices;
// Giovanni Poleni used Robert Hooke's hanging chain to show that each slice could still stand as an arch, and iron
// rings were added to hold the outward push. Look: the dome against a Roman dusk, lead-grey with white ribs; iron in
// rust orange; the chain in dark gold; the slice in section as a stone band. Lora for captions, Libre Franklin for
// labels.
//
// Facts:
// - Wikipedia, "St. Peter's Basilica": Michelangelo redesigned the dome in 1547; two shells of brick, the outer with
//   16 stone ribs; internal diameter 41.47 m; 136.57 m from the floor to the top of the external cross; Giacomo della
//   Porta and Domenico Fontana completed it in 1590; in the mid-18th century cracks appeared and iron chains were
//   installed "like the rings that keep a barrel from bursting".
// - M. F. Funari et al., "Real-time structural stability of domes through limit analysis: application to St. Peter's
//   dome", Int. J. Architectural Heritage (2021): della Porta introduced iron rings; a mid-18th-century survey found
//   the drum and attic rotating outwards and meridian cracks splitting the dome into pushing arches (slices); around
//   1742 three mathematicians (Le Seur, Jacquier, Boscovich) reported and proposed a strenuous strengthening; Pope
//   Benedict XIV followed Giovanni Poleni, who concluded the dome was adequately designed and proposed non-invasive
//   interventions; during the works Vanvitelli found one of the original rings broken, and six iron rings were added.
//   Dome: diameter 42.7 m, height from base to the outer extrados 28.8 m, total thickness from 3.0 m at its base.
// - Wikipedia, "18th-century Western domes": Poleni, tasked by the Pope in 1743, built models to show a catenary can be
//   fitted within the dome, and published drawings in 1748. Wikipedia, "Giovanni Poleni": professor at Padua
//   (astronomy, physics, mathematics); used a correctly loaded hanging chain to find the dome's funicular shape;
//   Memorie istoriche della gran cupola del Tempio Vaticano, 1748. Hooke's anagram of 1675 (Wikipedia, "Catenary";
//   18th-century domes): as hangs a flexible cable, so, inverted, stand the touching pieces of an arch.
// Computed here: the catenary; a slice of an ovoid dome (mid-surface semi-axes 22 m × 27 m, 3 m thick, cut into 24
// pieces whose weights grow with their distance from the axis, as a slice narrows to the top, plus a lantern load of
// 10% of the slice); the funicular polygon of those loads, its horizontal thrust and start height chosen so it stays
// closest to the middle of the section; then the check that it lies within the 3 m thickness. The profile is
// illustrative, not a survey of St Peter's.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The dome at dusk: 41.5 m across inside, 136.6 m to the cross.
//  B  9.2–23.0  Cracks from the base cut it into slices; the 1742–43 report; Poleni called in 1743.
//  C 23.0–32.0  Hooke: a hanging chain in tension, turned over, an arch in compression.
//  D 32.0–46.0  One slice in section, cut into pieces; the loaded chain; flipped, it fits inside the thickness.
//  E 46.0–59.6  The outward push at the base; iron rings like barrel hoops; six added in the 1740s.
//  F 59.8–64.6  Poleni's report of 1748; the dome still stands.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  sky1: '#1b2340', sky2: '#4a3b5c', sky3: '#c47a4e', ink: '#f6efe2', soft: 'rgba(246,239,226,0.74)', faint: 'rgba(246,239,226,0.25)',
  lead: '#8f9db0', lead2: '#6f7c8f', rib: '#eae3d3', stone: '#d8ccb4', stone2: '#b9aa8f', iron: '#e0763a', gold: '#e9b44c', red: '#ff7a5c', crack: '#2a2030',
};
const SERIF = 'Lora', SANS = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;

// ---------- the numbers ----------
const INSIDE = 41.47, CROSS = 136.57, RIBS = 16, FINISHED = 1590, REPORT = 1748, NEW_RINGS = 6;
// one slice of the dome: mid-surface semi-axes, thickness, pieces, the lantern ring's radius and load
const AX = 22, BY = 27, T = 3, N = 24, TOP_R = 4.5, LANTERN = 0.1;
const TH0 = Math.acos(TOP_R / AX);
const MID = []; for (let i = 0; i <= N; i++) { const th = (i / N) * TH0; MID.push([AX * Math.cos(th), BY * Math.sin(th)]); }
const PIECES = []; for (let i = 0; i < N; i++) { const [x0, y0] = MID[i], [x1, y1] = MID[i + 1]; PIECES.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: T * Math.hypot(x1 - x0, y1 - y0) * ((x0 + x1) / 2) }); }
const W_SLICE = PIECES.reduce((s, p) => s + p.w, 0);
const FINE = []; for (let i = 0; i <= 400; i++) { const th = (i / 400) * (Math.PI / 2); FINE.push([AX * Math.cos(th), BY * Math.sin(th)]); }
const offMid = ([x, y]) => Math.min(...FINE.map(([u, v]) => Math.hypot(u - x, v - y)));
/** The funicular polygon from the lantern ring down to the springing, for horizontal thrust h and start height yt. */
function thrustLine(h, yt) {
  let x = TOP_R, y = yt, V = LANTERN * W_SLICE; const out = [[x, y]];
  for (const p of PIECES.slice().reverse()) { y -= (V / h) * (p.x - x); x = p.x; out.push([x, y]); V += p.w; }
  out.push([x + (y * h) / V, 0]);
  return out;
}
let BEST = null;
for (let h = 0.1 * W_SLICE; h < 0.5 * W_SLICE; h *= 1.02) for (let yt = BY - 1.5; yt <= BY + 1.5; yt += 0.1) {
  const l = thrustLine(h, yt), worst = Math.max(...l.map(offMid));
  if (!BEST || worst < BEST.worst) BEST = { h, yt, worst, line: l };
}
const FITS = BEST.worst < T / 2;
if (!FITS || CROSS < 136 || NEW_RINGS !== 6) throw new Error('numbers');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `St Peter’s dome in the Vatican, designed by Michelangelo, was finished in ${FINISHED}.`],
  [4.8, 9.0, `Two brick shells with ${RIBS} ribs span ~${(Math.round(INSIDE * 10) / 10).toFixed(1)} m~ inside; the cross on top is ${(Math.round(CROSS * 10) / 10).toFixed(1)} m up.`],
  [9.2, 13.6, 'By the 1740s it was cracked: long splits ran up from the base, cutting it into *slices*.'],
  [13.8, 18.2, 'Pope Benedict XIV asked if it would fall. Three mathematicians urged heavy repairs.'],
  [18.4, 22.8, 'In 1743 he called in Giovanni Poleni, a professor of mathematics and physics at Padua.'],
  [23.0, 27.4, 'Poleni used Robert Hooke’s idea of 1675: a hanging chain is pulled only by *tension*…'],
  [27.6, 32.0, '…so its shape, turned upside down, gives an arch that is only pushed, in ~compression~.'],
  [32.2, 36.6, 'He took one slice of the cracked dome as an arch on its own, and cut it into pieces.'],
  [36.8, 41.2, 'On a chain he hung weights in proportion to the weights of those pieces.'],
  [41.4, 45.8, 'Turned over, the chain’s curve fitted inside the dome’s thickness: each slice could stand.'],
  [46.0, 50.4, 'So the cracks did not mean collapse. The danger was the slices pushing *outwards*.'],
  [50.6, 55.0, 'Like hoops on a barrel, ^iron rings^ hold that push. The builders had set some inside.'],
  [55.2, 59.6, 'Six new rings went round it in the 1740s, after one old ring was found broken.'],
  [59.8, 64.2, `Poleni published his analysis in ${REPORT}. The dome, rings and all, still stands.`],
];

// ---------- background: dusk over Rome ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sky1); lg.addColorStop(0.55, C.sky2); lg.addColorStop(0.78, C.sky3); lg.addColorStop(1, '#2a1d24');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,250,235,${0.2 + r() * 0.5})`; g.beginPath(); g.arc(r() * W, r() * 380, 0.5 + r(), 0, TAU); g.fill(); }
  // rooftops of the city
  g.fillStyle = '#1d1520';
  g.beginPath(); g.moveTo(0, H); let x = 0;
  while (x < W) { const hh = 20 + r() * 40; g.lineTo(x, 760 - hh); x += 30 + r() * 50; g.lineTo(x, 760 - hh); }
  g.lineTo(W, H); g.fill();
}
const RING_AT = [0.6, 4, 7.5, 11, 14.5, 18]; // heights of the six new rings in the drawing (illustrative)
const DARK = () => { ctx.fillStyle = 'rgba(20,16,30,0.55)'; ctx.fillRect(0, 0, W, H); };

function pill(str, x, y, col, align = 'left', size = 22) {
  font(700, size); const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.fillStyle = 'rgba(20,16,30,0.82)'; k.rrect(x0 - 10, y - size * 0.8, w + 20, size * 1.6, 8); ctx.fill();
  text(str, x0, y, { base: 'middle', color: col });
}

// ---------- the dome in elevation ----------
// drawn in metres from the centre of the dome's base (the top of the drum); 1 m = sc px
const EL = { cx: CX, base: 430, sc: 6.8 };
function domeOutline(R, B, steps = 60) {
  const pts = []; for (let i = 0; i <= steps; i++) { const th = (i / steps) * Math.PI; pts.push([R * Math.cos(th), B * Math.sin(th)]); }
  return pts;
}
function elevation(a, { cracks = 0, rings = 0, oldRings = 0, broken = 0, glow = 0 } = {}) {
  A(a, () => {
    const { cx, base, sc } = EL, X = (m) => cx + m * sc, Y = (m) => base - m * sc;
    const R = 24, B = 29;
    // the drum with paired columns
    ctx.fillStyle = C.stone2; ctx.fillRect(X(-27), Y(0), 54 * sc, 26 * sc);
    ctx.fillStyle = C.stone; ctx.fillRect(X(-28.5), Y(0) - 4, 57 * sc, 6);
    for (let i = -3; i <= 3; i++) {
      const xm = i * 7.6;
      ctx.fillStyle = C.stone; ctx.fillRect(X(xm - 1.6), Y(0) + 4, 1.1 * sc, 22 * sc); ctx.fillRect(X(xm + 0.5), Y(0) + 4, 1.1 * sc, 22 * sc);
      if (i < 3) { ctx.fillStyle = '#3b3346'; ctx.fillRect(X(xm + 2.6), Y(-6), 2.4 * sc, 9 * sc); }
    }
    // the dome: lead with white ribs
    const pts = domeOutline(R, B);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath();
    const gr = ctx.createLinearGradient(X(-R), 0, X(R), 0); gr.addColorStop(0, C.lead2); gr.addColorStop(0.45, C.lead); gr.addColorStop(1, '#5b6678');
    ctx.fillStyle = gr; ctx.fill();
    // ribs: meridians of the ovoid, as seen from the front
    ctx.strokeStyle = C.rib; ctx.lineWidth = 3;
    for (let i = 0; i < RIBS / 2; i++) {
      const phi = ((i + 0.5) / (RIBS / 2)) * Math.PI;
      ctx.beginPath();
      for (let j = 0; j <= 30; j++) { const th = (j / 30) * (Math.PI / 2) * 0.93; const x = R * Math.cos(th) * Math.cos(phi), y = B * Math.sin(th); j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
      ctx.stroke();
    }
    // the lantern, ball and cross
    ctx.fillStyle = C.stone; ctx.fillRect(X(-4), Y(B + 9), 8 * sc, 9 * sc);
    ctx.fillStyle = '#3b3346'; for (const xm of [-2.6, -0.6, 1.4]) ctx.fillRect(X(xm), Y(B + 7.5), 1.2 * sc, 5 * sc);
    ctx.fillStyle = C.lead; ctx.beginPath(); ctx.moveTo(X(-4.4), Y(B + 9)); ctx.quadraticCurveTo(X(0), Y(B + 16), X(4.4), Y(B + 9)); ctx.fill();
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X(0), Y(B + 16.5), 1.3 * sc, 0, TAU); ctx.fill();
    ctx.fillRect(X(-0.35), Y(B + 23), 0.7 * sc, 5.5 * sc); ctx.fillRect(X(-1.8), Y(B + 21.4), 3.6 * sc, 0.7 * sc);
    // cracks running up from the base
    if (cracks > 0) {
      ctx.strokeStyle = C.crack; ctx.lineWidth = 2.6;
      [-0.75, -0.4, -0.1, 0.25, 0.6].forEach((u, i) => {
        const len = clamp(cracks * 1.6 - i * 0.12);
        if (len <= 0) return;
        ctx.beginPath();
        for (let j = 0; j <= 20 * len; j++) {
          const th = (j / 20) * 0.95, x = R * Math.cos(th) * u + Math.sin(j * 2.3 + i) * 0.4, y = B * Math.sin(th);
          j ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
        }
        ctx.stroke();
      });
    }
    // iron rings around the dome, front half
    const ring = (hm, col, wdt) => {
      const rr = R * Math.sqrt(Math.max(0, 1 - (hm / B) ** 2));
      ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.beginPath(); ctx.ellipse(X(0), Y(hm), rr * sc, rr * sc * 0.12, 0, 0, Math.PI); ctx.stroke();
    };
    if (oldRings > 0) A(oldRings, () => { ring(1.5, 'rgba(224,118,58,0.6)', 3); ring(10, 'rgba(224,118,58,0.6)', 3); });
    if (broken > 0) A(broken, () => {
      const rr = R * Math.sqrt(1 - (10 / B) ** 2);
      ctx.fillStyle = C.red; for (let i = 0; i < 6; i++) { const ang = i * 1.1; ctx.beginPath(); ctx.arc(X(rr * 0.3) + Math.cos(ang) * 12, Y(10) + 8 + Math.sin(ang) * 6, 3, 0, TAU); ctx.fill(); }
      pill('an old ring: broken', X(rr * 0.3) + 24, Y(10) + 34, C.red);
    });
    if (rings > 0) for (let i = 0; i < NEW_RINGS; i++) {
      const v = clamp(rings * NEW_RINGS - i);
      if (v <= 0) continue;
      A(v, () => ring(RING_AT[i], C.iron, 5 + glow * 3));
    }
  });
}

// ---------- plan view: an orange cut into slices ----------
function planSlices(cx, cy, r, a, split) {
  A(a, () => {
    for (let i = 0; i < RIBS; i++) {
      const a0 = (i / RIBS) * TAU, a1 = ((i + 1) / RIBS) * TAU, mid = (a0 + a1) / 2, off = split * 10;
      const ox = Math.cos(mid) * off, oy = Math.sin(mid) * off;
      ctx.fillStyle = i % 2 ? C.lead : C.lead2;
      ctx.beginPath(); ctx.moveTo(cx + ox + Math.cos(a0) * r * 0.18, cy + oy + Math.sin(a0) * r * 0.18); ctx.arc(cx + ox, cy + oy, r, a0, a1); ctx.lineTo(cx + ox + Math.cos(a1) * r * 0.18, cy + oy + Math.sin(a1) * r * 0.18); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(cx, cy, r * 0.16, 0, TAU); ctx.fill();
    font(600, 22); text('seen from above', cx, cy + r + 34, { align: 'center', base: 'middle', color: C.soft });
  });
}

// ---------- A and B: the dome, the cracks, the experts ----------
function sceneDome(t) {
  const a = span(t, 0, 23.2, 0.5, 0.4);
  if (a <= 0) return;
  const toSide = eio(seg(t, 10.8, 12.0));
  EL.cx = lerp(CX, 260, toSide); EL.sc = lerp(6.8, 5.0, toSide); EL.base = lerp(430, 470, toSide);
  elevation(a, { cracks: seg(t, 9.6, 12.6), oldRings: 0 });
  const { cx, base, sc } = EL;
  A(a * seg(t, 5.0, 5.8) * (1 - seg(t, 9.0, 9.6)), () => {
    const y = base + 26 * sc + 30, half = (INSIDE / 2) * sc;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx + half, y); ctx.stroke();
    for (const x of [cx - half, cx + half]) { ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); ctx.stroke(); }
    font(700, 26); text(`${(Math.round(INSIDE * 10) / 10).toFixed(1)} m inside`, cx, y + 30, { align: 'center', base: 'middle', color: C.gold });
    font(600, 22); text(`cross: ${(Math.round(CROSS * 10) / 10).toFixed(1)} m above the floor`, cx + 40, 150, { base: 'middle', color: C.soft });
    ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx + 36, 146); ctx.lineTo(cx + 12, base - (29 + 21) * sc); ctx.stroke();
  });
  A(a * seg(t, 1.0, 2.0) * (1 - seg(t, 9.0, 9.6)), () => {
    font(700, 24); text('ST PETER’S BASILICA', 60, 120, { base: 'middle', color: C.ink, spacing: '2px' });
    font(400, 24, SERIF); text(`Michelangelo · finished ${FINISHED}`, 60, 152, { base: 'middle', color: C.soft });
  });
  planSlices(650, 300, 120, a * seg(t, 11.6, 12.4), eio(seg(t, 12.2, 13.4)));
  A(a * seg(t, 14.6, 15.4), () => {
    const x = 520, y = 520;
    font(700, 24); text('1742–43', x, y, { base: 'middle', color: C.gold });
    font(500, 22); text('Le Seur, Jacquier, Boscovich:', x, y + 32, { base: 'middle', color: C.ink });
    text('strengthen it, heavily', x, y + 60, { base: 'middle', color: C.soft });
  });
  A(a * seg(t, 18.8, 19.6), () => {
    const x = 520, y = 630;
    font(700, 24); text('1743', x, y, { base: 'middle', color: C.gold });
    font(500, 22); text('Giovanni Poleni, Padua', x, y + 32, { base: 'middle', color: C.ink });
  });
}

// ---------- C: Hooke's chain ----------
const CAT_C = 12, CAT_HALF = 16; // catenary y = c·cosh(x/c), in metres of the drawing
const catenary = (x) => CAT_C * Math.cosh(x / CAT_C);
const SAG = catenary(CAT_HALF) - catenary(0);
function sceneHooke(t) {
  const a = span(t, 23.0, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const sc = 15, cx = CX, flip = eio(seg(t, 28.0, 30.0));
    const top = lerp(240, 600, flip); // the pegs: the chain hangs from them, then the arch stands on them
    for (const sd of [-1, 1]) { ctx.fillStyle = C.stone; ctx.beginPath(); ctx.arc(cx + sd * CAT_HALF * sc, top, 8, 0, TAU); ctx.fill(); }
    const links = 26, stone = flip > 0.5;
    for (let i = 0; i < links; i++) {
      const x = -CAT_HALF + (i + 0.5) * (2 * CAT_HALF / links), yd = catenary(CAT_HALF) - catenary(x);
      const y = top + lerp(yd, -yd, flip) * sc;
      if (stone) { ctx.fillStyle = i % 2 ? C.stone : C.stone2; ctx.beginPath(); ctx.arc(cx + x * sc, y, 10, 0, TAU); ctx.fill(); }
      else { ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx + x * sc, y, 7, 4, Math.atan(Math.sinh(x / CAT_C)) * (1 - 2 * flip), 0, TAU); ctx.stroke(); }
    }
    // arrows along the curve: tension pulls outwards along it, compression pushes inwards
    const arrows = (sign, col, inward) => {
      for (const x of [-9, 0, 9]) {
        const yd = catenary(CAT_HALF) - catenary(x), y = top + sign * yd * sc, ang = Math.atan(-sign * Math.sinh(x / CAT_C));
        ctx.save(); ctx.translate(cx + x * sc, y - sign * 30); ctx.rotate(ang);
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
        for (const d of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(d * 10, 0); ctx.lineTo(d * 30, 0); ctx.stroke();
          const tip = inward ? 8 : 34, back = inward ? 18 : 24;
          ctx.beginPath(); ctx.moveTo(d * tip, 0); ctx.lineTo(d * back, -6); ctx.lineTo(d * back, 6); ctx.fill();
        }
        ctx.restore();
      }
    };
    A(seg(t, 24.6, 25.4) * (1 - seg(t, 27.6, 28.0)), () => { arrows(1, C.gold, false); font(700, 26); text('TENSION', cx, top + SAG * sc + 60, { align: 'center', base: 'middle', color: C.gold, spacing: '3px' }); });
    A(seg(t, 30.0, 30.8), () => { arrows(-1, C.red, true); font(700, 26); text('COMPRESSION', cx, top - SAG * sc - 70, { align: 'center', base: 'middle', color: C.red, spacing: '3px' }); });
    A(seg(t, 23.6, 24.4), () => { font(400, 26, SERIF); text('Robert Hooke, 1675', cx, 130, { align: 'center', base: 'middle', color: C.soft }); });
    A(seg(t, 30.4, 31.2), () => {
      font(400, 24, SERIF); text('“As hangs the flexible line, so but inverted', cx, 680, { align: 'center', base: 'middle', color: C.soft });
      text('will stand the rigid arch”, Hooke’s Latin, translated', cx, 712, { align: 'center', base: 'middle', color: C.soft });
    });
  });
}

// ---------- D: Poleni's slice and chain ----------
const SL = { x0: 60, y0: 650, sc: 13 }; // the slice's axis at x0; its springing at y0
const SX = (m) => SL.x0 + m * SL.sc, SY = (m) => SL.y0 - m * SL.sc;
const CH = { cx: 640, top: 200, sc: 6.6 }; // the hanging chain, drawn smaller, from a beam at the top right
const HX = (m) => CH.cx + m * CH.sc, HY = (m) => CH.top + m * CH.sc;
function normalAt(th) { const tx = -AX * Math.sin(th), ty = BY * Math.cos(th), n = Math.hypot(tx, ty); return [ty / n, -tx / n]; }
function sliceBand(cut) {
  const outer = [], inner = [];
  for (let i = 0; i <= 60; i++) { const th = (i / 60) * TH0, [nx, ny] = normalAt(th), x = AX * Math.cos(th), y = BY * Math.sin(th); outer.push([x + nx * T / 2, y + ny * T / 2]); inner.push([x - nx * T / 2, y - ny * T / 2]); }
  ctx.beginPath(); outer.forEach(([x, y], i) => (i ? ctx.lineTo(SX(x), SY(y)) : ctx.moveTo(SX(x), SY(y)))); inner.slice().reverse().forEach(([x, y]) => ctx.lineTo(SX(x), SY(y))); ctx.closePath();
  ctx.fillStyle = C.stone2; ctx.fill(); ctx.strokeStyle = C.stone; ctx.lineWidth = 2; ctx.stroke();
  if (cut > 0) A(cut, () => {
    ctx.strokeStyle = 'rgba(42,32,48,0.7)'; ctx.lineWidth = 1.6;
    for (let i = 1; i < N; i++) { const th = (i / N) * TH0, [nx, ny] = normalAt(th), x = AX * Math.cos(th), y = BY * Math.sin(th); ctx.beginPath(); ctx.moveTo(SX(x + nx * T / 2), SY(y + ny * T / 2)); ctx.lineTo(SX(x - nx * T / 2), SY(y - ny * T / 2)); ctx.stroke(); }
  });
  ctx.setLineDash([6, 6]); ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(SX(0), SY(-1)); ctx.lineTo(SX(0), SY(BY + 5)); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.stone; ctx.fillRect(SX(AX - T / 2 - 0.3), SY(0), (T + 0.6) * SL.sc, 3 * SL.sc);
  // the lantern on top, as a load
  ctx.fillStyle = C.stone; ctx.fillRect(SX(0), SY(BY + 3.2), TOP_R * SL.sc, 3 * SL.sc);
}
// the thrust line, and the same polygon hanging: mirrored, both halves of the arch, from a beam
const LINE = BEST.line, YT = BEST.yt;
const hangPoint = ([x, y], side) => [HX(side * x), HY(YT - y) - (YT - LINE.at(-1)[1]) * 0 ];
function scenePoleni(t) {
  const a = span(t, 32.0, 46.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    sliceBand(seg(t, 33.6, 34.6));
    font(600, 22);
    A(seg(t, 32.8, 33.6), () => { text('one slice,', SX(1.5), SY(13), { base: 'middle', color: C.soft }); text('in section', SX(1.5), SY(13) + 28, { base: 'middle', color: C.soft }); text('lantern', SX(TOP_R) + 10, SY(BY + 1.7), { base: 'middle', color: C.soft }); });
    const hang = eio(seg(t, 37.0, 38.6)), fly = eio(seg(t, 41.4, 43.4));
    if (hang > 0) {
      // the beam
      A(hang * (1 - fly), () => { ctx.fillStyle = C.stone; ctx.fillRect(HX(-24), CH.top - 10, 48 * CH.sc, 8); });
      // chain points: hanging (right, small) then flying onto the slice (left, large, the right half only)
      const pts = (side) => LINE.map((p) => {
        const [hx, hy] = hangPoint(p, side);
        return side > 0 ? [lerp(hx, SX(p[0]), fly), lerp(hy, SY(p[1]), fly)] : [hx, hy];
      });
      A(hang, () => {
        ctx.strokeStyle = fly > 0.98 ? C.red : C.gold; ctx.lineWidth = fly > 0.98 ? 4 : 3;
        ctx.beginPath(); pts(1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        A(1 - fly, () => { ctx.beginPath(); pts(-1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
          ctx.beginPath(); const [a1, b1] = pts(1)[0], [a2, b2] = pts(-1)[0]; ctx.moveTo(a1, b1); ctx.lineTo(a2, b2); ctx.stroke(); });
        // weights hang from the vertices, sized by the pieces they stand for
        A(1 - fly, () => {
          const order = PIECES.slice().reverse();
          for (const side of [1, -1]) pts(side).forEach(([x, y], i) => {
            if (i === 0 || i > order.length || i % 2) return;
            const r = 2 + Math.sqrt(order[i - 1].w / W_SLICE) * 18;
            ctx.strokeStyle = C.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12); ctx.stroke();
            ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y + 12 + r, r, 0, TAU); ctx.fill();
          });
        });
      });
      A(seg(t, 38.2, 39.0) * (1 - fly), () => { font(600, 22); text('weights in proportion to the pieces', CH.cx, HY(YT) + 70, { align: 'center', base: 'middle', color: C.gold }); });
    }
    A(seg(t, 43.4, 44.2), () => {
      font(700, 24); text('turned over: the line of thrust', 470, 330, { base: 'middle', color: C.red });
      font(600, 22); text(`it stays inside the ${T} m thickness,`, 470, 366, { base: 'middle', color: C.ink });
      text('so the slice can stand as an arch', 470, 396, { base: 'middle', color: C.ink });
    });
  });
}

// ---------- E: the outward push and the rings ----------
function sceneRings(t) {
  const a = span(t, 46.0, 59.8, 0.4, 0.4);
  if (a <= 0) return;
  EL.cx = CX; EL.sc = 6.8; EL.base = 430;
  elevation(a, { cracks: 1, oldRings: seg(t, 52.2, 53.0), broken: seg(t, 55.6, 56.4), rings: seg(t, 56.4, 59.0) });
  A(a, () => {
    const { cx, base, sc } = EL;
    // outward push at the base
    const push = seg(t, 46.8, 47.6) * (1 - seg(t, 52.0, 52.6));
    A(push, () => {
      for (const sd of [-1, 1]) for (const hm of [0.5, 5]) {
        const x = cx + sd * 25 * sc, y = base - hm * sc, l = 40 + 10 * Math.sin(t * 6);
        ctx.strokeStyle = C.red; ctx.fillStyle = C.red; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sd * l, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + sd * (l + 16), y); ctx.lineTo(x + sd * l, y - 10); ctx.lineTo(x + sd * l, y + 10); ctx.fill();
      }
      pill('the slices push outwards', cx, base + 26 * sc + 36, C.red, 'center', 24);
    });
    // a barrel's hoop
    A(seg(t, 50.8, 51.6) * (1 - seg(t, 54.8, 55.4)), () => {
      const bx = 730, by = 470;
      ctx.fillStyle = '#8a5a34'; k.rrect(bx - 50, by - 70, 100, 140, 30); ctx.fill();
      ctx.strokeStyle = '#6a4224'; ctx.lineWidth = 2; for (const dx of [-25, 0, 25]) { ctx.beginPath(); ctx.moveTo(bx + dx, by - 66); ctx.lineTo(bx + dx, by + 66); ctx.stroke(); }
      ctx.strokeStyle = C.iron; ctx.lineWidth = 7; for (const dy of [-42, 42]) { ctx.beginPath(); ctx.moveTo(bx - 52, by + dy); ctx.lineTo(bx + 52, by + dy); ctx.stroke(); }
      font(600, 22); text('a barrel’s hoops', bx, by + 98, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 52.6, 53.4) * (1 - seg(t, 55.2, 55.6)), () => pill('the builders’ own rings, inside the masonry', cx, base + 26 * sc + 36, C.iron, 'center'));
    A(seg(t, 56.8, 57.6), () => pill(`+ ${NEW_RINGS} iron rings, 1740s`, cx, base + 26 * sc + 36, C.iron, 'center', 26));
  });
}

// ---------- F: 1748 ----------
function sceneEnd(t) {
  const a = span(t, 59.8, 64.6, 0.5, 0.0);
  if (a <= 0) return;
  EL.cx = CX; EL.sc = 6.8; EL.base = 430;
  elevation(a, { cracks: 1, rings: 1, oldRings: 1, glow: 0.5 + 0.5 * Math.sin(t * 3) });
  A(a * seg(t, 60.4, 61.2), () => {
    const x = CX, y = 690;
    ctx.fillStyle = '#efe4cc'; k.rrect(x - 190, y - 34, 380, 92, 6); ctx.fill();
    font(600, 22, SERIF); text('Memorie istoriche della gran cupola', x, y - 6, { align: 'center', base: 'middle', color: '#3a2a20' });
    text(`del Tempio Vaticano · Padua, ${REPORT}`, x, y + 24, { align: 'center', base: 'middle', color: '#3a2a20' });
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    if (t > 22.8 && t < 46.4) A(span(t, 22.8, 46.4, 0.5, 0.5), DARK);
    sceneDome(t);
    sceneHooke(t);
    scenePoleni(t);
    sceneRings(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 800, size: 37, weight: 500, family: SERIF, ink: C.ink, marks: { '*': C.gold, '~': C.red, '^': C.iron } });
  },
});
