// Explainer for math-doomsday-13-november-2026: in 1960 a fitted curve sent world population to infinity
// on Friday 13 November 2026. Look: a night-blue chart with a torn calendar page; the 1960 curve in amber,
// real population in teal, the UN projection dashed. Oswald for the calendar and big numbers, Libre
// Franklin (a 1960s newspaper sans) for captions and labels.
//
// Everything on the chart is computed: the curve is von Foerster, Mora and Amiot's N = K / (t0 − t)^n with
// K = 1.79 × 10¹¹, t0 = 2026.87 and n = 0.99 (Science, 4 November 1960). Its doublings follow from the
// formula: with n ≈ 1, population doubles each time the time left to t0 halves (1993, 2010, 2018, 2023…).
// Real population: about 1.0 billion in 1800, 1.6 in 1900, 2.5 in 1950 and 3.0 in 1960, then UN World
// Population Prospects 2024 estimates rounded to 0.1 billion; the dashed line is the UN's 2024 medium
// projection (a peak of about 10.3 billion in the mid-2080s, 10.2 billion in 2100).
//
// Scene plan (64 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 8.6  Hook: the calendar page, FRIDAY 13 NOVEMBER 2026.
//  B  8.4–22.2  The fit: real points 1800–1960, the curve drawn through them; "it hits a wall".
//  C 22.0–36.2  The wall: the curve races off the chart; each doubling in half the time; the quote.
//  D 36.0–50.0  Reality: the teal line keeps up until about 1993, then falls behind; 2020: 27 vs 7.9.
//  E 49.8–64.0  The future: fertility, the UN projection to a mid-2080s peak; an ordinary Friday.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  night: '#0e1124', night2: '#1d1838', grid: 'rgba(170,180,230,0.10)', axis: 'rgba(214,220,245,0.55)',
  ink: '#f2eee4', soft: 'rgba(242,238,228,0.72)', faint: 'rgba(242,238,228,0.42)',
  amber: '#f3b13b', amberSoft: 'rgba(243,177,59,0.25)', red: '#ff5a4e', teal: '#49d3c3', tealSoft: 'rgba(73,211,195,0.55)',
  paper: '#f6f1e6', paperEdge: '#d9d0bd', calRed: '#d7392f', calInk: '#22202a',
};
const BIG = 'Oswald', SANS = 'Libre Franklin';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const K = 1.79e11, T0 = 2026.87, N_EXP = 0.99;
const model = (year) => K / Math.pow(T0 - year, N_EXP) / 1e9; // billions
const PAST = [[1800, 1.0], [1900, 1.6], [1950, 2.5], [1960, 3.0]];
const REAL = [[1960, 3.0], [1970, 3.7], [1980, 4.4], [1990, 5.3], [2000, 6.1], [2010, 7.0], [2020, 7.9], [2026, 8.3]];
const UN = [[2026, 8.3], [2030, 8.5], [2040, 9.2], [2050, 9.7], [2060, 10.0], [2070, 10.2], [2084, 10.3], [2100, 10.2]];
const DOUBLINGS = [0, 1, 2, 3, 4].map((i) => T0 - (T0 - 1960) / 2 ** i); // 1960, 1993.4, 2010.1, 2018.5, 2022.7
const GAPS = DOUBLINGS.slice(1).map((y, i) => Math.round(y - DOUBLINGS[i])); // 33, 17, 8, 4
const M2020 = Math.round(model(2020)); // 27

// ---------- chart geometry ----------
const P = { l: 118, r: 806, t: 190, b: 680 };
const YR = [1800, 2100], BN = 24;
const X = (yr) => P.l + ((yr - YR[0]) / (YR[1] - YR[0])) * (P.r - P.l);
const Y = (bn) => P.b - (bn / BN) * (P.b - P.t);
const WALL = X(T0);

// ---------- timeline ----------
const T = { A: [0, 8.6], B: [8.4, 22.2], C: [22.0, 36.2], D: [36.0, 50.0], E: [49.8, 64] };
const CUES = [
  [0.4, 4.2, 'In 1960, three scientists named the day world population would become *infinite*.'],
  [4.4, 8.4, 'They published it in the journal *Science*: Friday 13 November 2026.'],
  [8.6, 13.0, 'They fitted a curve to *24 estimates* of world population, going back 2,000 years.'],
  [13.2, 17.6, 'It matched the past well: about 1 billion in 1800, 3 billion by 1960.'],
  [17.8, 22.0, 'But this curve doesn’t just grow fast. It hits a *wall*.'],
  [22.2, 26.8, 'On it, each doubling of humanity takes *half* as long as the last.'],
  [27.0, 31.6, `${GAPS[0]} years, then ${GAPS[1]}, then ${GAPS[2]}, then ${GAPS[3]}… *endless doublings* before late 2026.`],
  [31.8, 36.0, '“Our great-great-grandchildren will not starve to death. They will be *squeezed* to death.”'],
  [36.2, 40.6, 'Real population ~kept up~ until the early 1990s, then *fell behind*.'],
  [40.8, 45.2, 'Its growth rate had already peaked in the early 1960s, just as the paper came out.'],
  [45.4, 49.8, `For 2020 the curve said about *${M2020} billion*. The real count: about ~7.9 billion~.`],
  [50.0, 54.6, 'Families got smaller: most people now live where women average under *2.1 children*.'],
  [54.8, 59.2, 'The UN expects a peak of about ~10.3 billion~ in the mid-2080s.'],
  [59.4, 63.8, 'So Friday 13 November 2026 should be just another *Friday*.'],
];

// ---------- background, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W * 0.4, H);
  lg.addColorStop(0, C.night); lg.addColorStop(1, C.night2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(230,232,255,${0.08 + r() * 0.35})`;
    const x = r() * W, y = r() * H, d = r() < 0.9 ? 1.2 : 2.2;
    g.fillRect(x, y, d, d);
  }
  const vg = g.createRadialGradient(W / 2, H * 0.42, 200, W / 2, H * 0.45, 720);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- the calendar page ----------
/** The page centred at (cx, cy), scaled by s; `torn` adds the ragged top edge; `note` writes on it. */
function calendar(cx, cy, s, { tilt = 0, note = 0 } = {}) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(tilt); ctx.scale(s, s);
  const w = 420, h = 470;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  ctx.fillStyle = C.paper; k.rrect(-w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.shadowColor = 'transparent';
  // red header with the month
  ctx.fillStyle = C.calRed;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, 118, [14, 14, 0, 0]); ctx.fill();
  // binding rings
  for (const x of [-120, 0, 120]) {
    ctx.fillStyle = '#7a1d17'; ctx.beginPath(); ctx.arc(x, -h / 2 + 22, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9c4d6'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, -h / 2 + 4, 16, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
  }
  font(600, 46, BIG); text('NOVEMBER 2026', 0, -h / 2 + 82, { color: C.paper, align: 'center', base: 'middle', spacing: '3px' });
  font(700, 250, BIG); text('13', 0, 30, { color: C.calInk, align: 'center', base: 'middle' });
  font(500, 52, BIG); text('FRIDAY', 0, h / 2 - 56, { color: C.calRed, align: 'center', base: 'middle', spacing: '10px' });
  // faint ruled lines at the foot, like a desk calendar
  ctx.strokeStyle = C.paperEdge; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 30, h / 2 - 100); ctx.lineTo(w / 2 - 30, h / 2 - 100); ctx.stroke();
  if (note > 0) A(note, () => {
    ctx.save(); ctx.rotate(-0.12);
    ctx.strokeStyle = C.teal; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = eout(clamp(note * 1.4));
    ctx.beginPath(); ctx.moveTo(120, 120); ctx.lineTo(120 + 36 * Math.min(1, p * 2), 120 + 40 * Math.min(1, p * 2));
    if (p > 0.5) ctx.lineTo(156 + 70 * (p - 0.5) * 2, 160 - 120 * (p - 0.5) * 2);
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

// ---------- chart parts ----------
function axes(a) {
  A(a, () => {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5;
    for (let bn = 0; bn <= 20; bn += 5) { ctx.beginPath(); ctx.moveTo(P.l, Y(bn)); ctx.lineTo(P.r, Y(bn)); ctx.stroke(); }
    for (let yr = 1850; yr <= 2100; yr += 50) { ctx.beginPath(); ctx.moveTo(X(yr), P.t); ctx.lineTo(X(yr), P.b); ctx.stroke(); }
    ctx.strokeStyle = C.axis; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(P.l, P.t - 10); ctx.lineTo(P.l, P.b); ctx.lineTo(P.r, P.b); ctx.stroke();
    font(500, 24);
    for (let bn = 0; bn <= 20; bn += 5) text(String(bn), P.l - 14, Y(bn), { color: C.soft, align: 'right', base: 'middle' });
    for (let yr = 1800; yr <= 2100; yr += 50) text(String(yr), X(yr), P.b + 30, { color: C.soft, align: 'center', base: 'middle' });
    font(600, 24); text('billion people', P.l - 6, P.t - 34, { color: C.soft, base: 'middle' });
  });
}
/** A polyline through [year, bn] points, drawn up to year `upTo`. */
function path(points, upTo, color, width, dash = []) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.setLineDash(dash);
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < points.length; i++) {
    const [y, v] = points[i];
    if (y > upTo) {
      if (i > 0 && started) {
        const [py, pv] = points[i - 1], f = (upTo - py) / (y - py);
        ctx.lineTo(X(upTo), Y(lerp(pv, v, f)));
      }
      break;
    }
    if (!started) { ctx.moveTo(X(y), Y(v)); started = true; } else ctx.lineTo(X(y), Y(v));
  }
  ctx.stroke(); ctx.restore();
}
/** The 1960 curve from 1800 up to year `upTo` (it leaves the chart before the wall). */
function curve(upTo, glow = 0) {
  const pts = [];
  for (let yr = 1800; yr <= Math.min(upTo, T0 - 0.02); yr += yr < 2000 ? 2 : 0.1) pts.push([yr, model(yr)]);
  ctx.save();
  ctx.beginPath(); ctx.rect(P.l, P.t - 90, P.r - P.l, P.b - P.t + 90); ctx.clip();
  if (glow > 0) A(glow, () => path(pts, upTo, C.amberSoft, 16));
  path(pts, upTo, C.amber, 5);
  ctx.restore();
}
function dot(x, y, r, color, a = 1) {
  A(a, () => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.night; ctx.lineWidth = 3; ctx.stroke();
  });
}
function label(s, x, y, color, a, { size = 24, align = 'left', weight = 600 } = {}) {
  A(a, () => { font(weight, size); text(s, x, y, { color, align, base: 'middle' }); });
}

// ---------- scenes ----------
function sceneA(t) {
  const drop = eout(seg(t, 0, 1.1));
  const leave = eio(seg(t, 7.8, 9.2));
  const cx = lerp(W / 2, 92, leave), cy = lerp(lerp(-260, 420, drop), 96, leave);
  const s = lerp(1, 0.25, leave);
  A(1 - seg(t, 8.6, 9.2), () => calendar(cx, cy, s, { tilt: lerp(-0.04 * (1 - drop) + 0.02, 0.05, leave) }));
}

function sceneChart(t) {
  const ax = eout(seg(t, 8.6, 9.6)) * (1 - seg(t, 59.0, 59.8));
  axes(ax);
  if (ax <= 0) return;
  A(1 - seg(t, 59.0, 59.8), () => {
    // B: the real points of the past, then the curve through them
    PAST.forEach(([yr, bn], i) => {
      const a = eout(seg(t, 9.4 + i * 0.5, 9.9 + i * 0.5));
      dot(X(yr), Y(bn), 9, C.teal, a);
    });
    label('about 1 billion', X(1800) + 18, Y(1.0) - 30, C.teal, span(t, 13.4, 18.0));
    label('about 3 billion', X(1960) + 18, Y(3.0) - 30, C.teal, span(t, 13.8, 18.0));
    const drawTo = t < 22 ? lerp(1800, 1960, eio(seg(t, 10.6, 13.0))) : lerp(1960, T0, eio(seg(t, 22.2, 26.4)));
    if (t >= 10.6) curve(drawTo, span(t, 17.8, 22.4));
    label('fitted in 1960', X(1880), Y(model(1880)) - 64, C.amber, span(t, 11.6, 17.6), { size: 26 });

    // C: the wall at 2026.87 and the doublings
    const wa = eout(seg(t, 19.0, 20.0)) * (1 - seg(t, 49.8, 50.6));
    A(wa, () => {
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([10, 9]);
      ctx.beginPath(); ctx.moveTo(WALL, P.b); ctx.lineTo(WALL, P.t - 70); ctx.stroke(); ctx.restore();
      font(700, 26); text('13 Nov 2026', WALL + 12, P.b - 58, { color: C.red, base: 'middle' });
      font(500, 22); text('the wall', WALL + 12, P.b - 28, { color: C.red, base: 'middle' });
    });
    // the curve runs off the top: an arrow to infinity
    const inf = eout(seg(t, 25.4, 26.4)) * (1 - seg(t, 49.8, 50.6));
    A(inf, () => {
      const x = WALL - 10;
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(x, P.t - 92); ctx.lineTo(x - 13, P.t - 66); ctx.lineTo(x + 13, P.t - 66); ctx.closePath(); ctx.fill();
      font(600, 40, BIG); text('∞', x - 38, P.t - 76, { color: C.amber, align: 'center', base: 'middle' });
    });
    DOUBLINGS.forEach((yr, i) => {
      const at = 23.0 + i * 0.85;
      const a = eout(seg(t, at, at + 0.4)) * (1 - seg(t, 36.0, 36.8));
      const v = model(yr);
      if (Y(v) < P.t - 70) return;
      dot(X(yr), Y(v), 8, C.amber, a);
      if (i > 0 && i <= 3) label(`×2 in ${GAPS[i - 1]} years`, X(yr) - 20, Y(v), C.amber, a * span(t, at, 36.4), { size: 22, align: 'right' });
    });
    // the time left to the wall, halving
    const bar = span(t, 27.0, 31.8);
    A(bar, () => {
      const by = 762, bx0 = X(1960), full = WALL - X(1960);
      font(600, 22); text('time left to the wall', bx0 - 14, by, { color: C.soft, align: 'right', base: 'middle' });
      for (let i = 0; i < 5; i++) {
        const a = eout(seg(t, 27.2 + i * 0.6, 27.6 + i * 0.6));
        A(a, () => {
          const w = full / 2 ** i, x = WALL - w;
          ctx.fillStyle = i % 2 ? 'rgba(243,177,59,0.55)' : C.amber;
          k.rrect(x, by - 6, w, 12, 6); ctx.fill();
        });
      }
    });

    // D: reality, in teal, then the gap in 2020
    const realTo = lerp(1960, 2026, eio(seg(t, 36.4, 40.4)));
    if (t >= 36.4) path(REAL, realTo, C.teal, 6);
    if (t >= 36.4) dot(X(realTo), Y(REAL.reduce((v, [y, b], i) => (y <= realTo ? (i + 1 < REAL.length && REAL[i + 1][0] > realTo ? lerp(b, REAL[i + 1][1], (realTo - y) / (REAL[i + 1][0] - y)) : b) : v), 3)), 8, C.teal, 1 - seg(t, 49.8, 50.4));
    const cross = span(t, 37.8, 45.0);
    A(cross, () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(X(1993.4), Y(5.55), 22, 0, Math.PI * 2); ctx.stroke();
      font(600, 22); text('1993', X(1993.4) - 28, Y(5.55) + 6, { color: C.ink, align: 'right', base: 'middle' });
    });
    const gap = span(t, 45.4, 50.0);
    A(gap, () => {
      const x = X(2020);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(x, Y(7.9)); ctx.lineTo(x, Y(Math.min(BN, model(2020)))); ctx.stroke(); ctx.setLineDash([]);
      label(`${M2020} bn`, x - 14, Y(Math.min(BN, model(2020))) + 18, C.amber, 1, { size: 30, align: 'right', weight: 700 });
      label('7.9 bn', x + 14, Y(7.9) + 30, C.teal, 1, { size: 30, weight: 700 });
    });

    // E: the UN projection to a peak in the mid-2080s
    const unTo = lerp(2026, 2100, eio(seg(t, 54.8, 57.8)));
    if (t >= 54.8) path(UN, unTo, C.tealSoft, 5, [12, 10]);
    A(span(t, 56.6, 59.6, 0.4, 0.3), () => {
      dot(X(2084), Y(10.3), 9, C.teal);
      font(700, 28); text('≈10.3 bn peak', X(2084), Y(10.3) - 40, { color: C.teal, align: 'center', base: 'middle' });
      font(500, 22); text('UN projection', X(2084), Y(10.3) + 36, { color: C.soft, align: 'center', base: 'middle' });
    });
    // the fertility panel
    A(span(t, 50.0, 54.8), () => {
      const cx = 600, cy = 470;
      ctx.fillStyle = 'rgba(14,17,36,0.86)'; k.rrect(cx - 190, cy - 110, 380, 220, 20); ctx.fill();
      ctx.strokeStyle = 'rgba(73,211,195,0.5)'; ctx.lineWidth = 2; ctx.stroke();
      font(700, 92, BIG); text('2.1', cx, cy - 18, { color: C.teal, align: 'center', base: 'middle' });
      font(500, 24); text('children per woman', cx, cy + 50, { color: C.ink, align: 'center', base: 'middle' });
      text('keeps a population level', cx, cy + 80, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 59.4, 60.4));
  if (a <= 0) return;
  A(a, () => {
    const rise = 1 - eout(seg(t, 59.4, 60.6));
    calendar(W / 2, 410 + 40 * rise, 0.92, { tilt: 0.02, note: seg(t, 60.8, 62.0) });
  });
}

Kit.scene({
  width: W, height: H, duration: 64, fonts: [BIG, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    if (t < T.A[1] + 0.8) sceneA(t);
    sceneChart(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.red, '~': C.teal } });
  },
});
