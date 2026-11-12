// "The road to 23 October" („Az út október 23-ig”): the long film of Hungary 1956's section The road to October, 16:9.
// Motif: a road along the bottom of the picture runs from 1953 to 23 October 1956, with a coral lantern at the date the
// narration has reached. It zooms in as events speed up (years, then the months of 1956, then the days of October) and
// out again for the recap. Above it, each line has its own simple drawing: documents, name plates, pillars, schematic
// maps, crowds as dots, simple figures without faces.
// Series look (Hungary 1956's six films): deep ink with a faint paper grain, Archivo for titles and cards, Alegreya Sans
// for everything else, the 1956 flag with the hole as the emblem, a thin tricolour rule under chapter titles; this
// film's accent is coral (#e07a5f), the regime's things are drawn in cold steel.
// The same scene plays the Hungarian version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. Hungary's outline: OUTLINE and DANUBE from explainers/earth-last-fighting-
// csepel-dunapentele.js; Austria, Budapest and everything else drawn here, simplified.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const TAU = Math.PI * 2, RAD = Math.PI / 180;
const HU = !!window.TR;

const C = {
  bg0: '#111418', bg1: '#191d24', ink: '#ece6d6', soft: 'rgba(236,230,214,0.74)', faint: 'rgba(236,230,214,0.32)',
  ghost: 'rgba(236,230,214,0.12)', coral: '#e07a5f', coralDim: 'rgba(224,122,95,0.38)', coralGlow: 'rgba(224,122,95,0.16)',
  steel: '#8ea2b6', steelDim: 'rgba(142,162,182,0.42)', red: '#c63a32', white: '#ece6d6', green: '#3f7f52',
  card: 'rgba(25,29,36,0.94)', cardLine: 'rgba(236,230,214,0.16)', land: '#20262e', landLine: 'rgba(236,230,214,0.5)',
  river: '#5b88ad', paper: '#e6dfcc', paperInk: '#2b2723', paperSoft: 'rgba(43,39,35,0.55)', dark: '#0c0e11',
};
const DISPLAY = 'Archivo', TEXT = 'Alegreya Sans';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, weight = 500, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle' } = {}) {
  k.font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 500, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW. */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 28 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
/** Text that shrinks to fit maxW. */
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** Wrapped, centred text (kit's rich(): it translates the whole string, then wraps it). */
function para(str, cx, cy, maxW, { size = 36, weight = 500, family = TEXT, ink = C.ink, lh, marks = {} } = {}) {
  k.rich(str, cx, cy, { maxW, size, lh: lh ?? size * 1.25, weight, family, ink, marks });
}
/** A rounded label as wide as its text. */
function chip(str, cx, cy, { color = C.ink, bg = C.card, size = 34, weight = 700, line = color, align = 'center', pad = 24 } = {}) {
  const w = textW(str, { size, weight }), x = align === 'center' ? cx - w / 2 : align === 'left' ? cx : cx - w;
  k.rrect(x - pad, cy - size * 0.82, w + pad * 2, size * 1.64, size * 0.82);
  ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = 2.5; ctx.strokeStyle = line; ctx.stroke(); }
  txt(str, x, cy + 1, { size, weight, color });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.card, r = 16, line = C.cardLine, lw = 2 } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
function arrowHead(x, y, ang, col, size = 20) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size * 0.8, y + Math.sin(ang + 2.5) * size * 0.8);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size * 0.8, y + Math.sin(ang - 2.5) * size * 0.8);
  ctx.closePath(); ctx.fill();
}
/** A polyline drawn up to fraction u of its length, with an arrow head at the tip. */
function trace(pts, u, col, { w = 6, dash = null, head = true, headSize = 20 } = {}) {
  if (u <= 0) return;
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = tot * Math.min(1, u);
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  let tip = pts[0], ang = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    ang = Math.atan2(y1 - y0, x1 - x0);
    if (left >= L[i - 1]) { ctx.lineTo(x1, y1); tip = [x1, y1]; left -= L[i - 1]; }
    else { const f = left / L[i - 1]; tip = [lerp(x0, x1, f), lerp(y0, y1, f)]; ctx.lineTo(...tip); break; }
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  if (head) arrowHead(tip[0], tip[1], ang, col, headSize);
}
/** A smooth curve through points (Catmull-Rom), as a polyline. */
function smooth(pts, n = 14) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)));
    }
  }
  out.push(pts.at(-1));
  return out;
}
/** A rubber stamp, slightly rotated. */
function stamp(str, x, y, col, a = 1, { rot = -0.07, size = 40, scale = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
    const w = textW(str, { size, weight: 800, family: DISPLAY, spacing: '3px' });
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2 - 22, -size * 0.85, w + 44, size * 1.7, 8); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, family: DISPLAY, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
/** A plain standing figure: a head and a rounded body, no face. */
function figure(x, y, h, col, { fill = true } = {}) {
  const r = h * 0.13;
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y - h + r, r, 0, TAU); fill ? ctx.fill() : ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - h * 0.2, y); ctx.lineTo(x - h * 0.2, y - h * 0.5);
  ctx.quadraticCurveTo(x - h * 0.2, y - h * 0.7, x, y - h * 0.7);
  ctx.quadraticCurveTo(x + h * 0.2, y - h * 0.7, x + h * 0.2, y - h * 0.5);
  ctx.lineTo(x + h * 0.2, y); ctx.closePath(); fill ? ctx.fill() : ctx.stroke();
}
/** A small pseudo-random generator, so dots stay put from frame to frame. */
function rng(seed) { let x = seed % 2147483647 || 7; return () => ((x = (x * 16807) % 2147483647) / 2147483647); }
/** A crowd as dots filling the rectangle (x, y, w, h), the first n·u of them shown. */
const CROWDS = new Map();
function crowd(id, x, y, w, h, n, u, col, r = 5) {
  if (!CROWDS.has(id)) { const R = rng(id * 7919 + 13); CROWDS.set(id, Array.from({ length: n }, () => [R(), R(), R()])); }
  const pts = CROWDS.get(id), m = Math.floor(n * Math.min(1, u));
  ctx.fillStyle = col;
  for (let i = 0; i < m; i++) { const [a, b, c] = pts[i]; ctx.beginPath(); ctx.arc(x + a * w, y + b * h, r * (0.8 + c * 0.4), 0, TAU); ctx.fill(); }
}
/** The 1956 flag with the hole: red, white with a round hole, green. */
function flag(x, y, w, a = 1) {
  const h = w * 0.62, b = h / 3;
  A(a, () => {
    ctx.fillStyle = C.red; ctx.fillRect(x, y, w, b);
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.rect(x, y + b, w, b); ctx.arc(x + w / 2, y + b * 1.5, b * 0.36, 0, TAU, true); ctx.fill('evenodd');
    ctx.fillStyle = C.green; ctx.fillRect(x, y + 2 * b, w, b);
  });
}
/** The thin tricolour rule under titles. */
function rule(cx, y, w, a = 1, g = 1) {
  A(a, () => {
    const x0 = cx - (w * g) / 2, seg3 = (w * g) / 3;
    ctx.fillStyle = C.red; ctx.fillRect(x0, y, seg3, 5);
    ctx.fillStyle = C.white; ctx.fillRect(x0 + seg3, y, seg3, 5);
    ctx.fillStyle = C.green; ctx.fillRect(x0 + 2 * seg3, y, seg3, 5);
  });
}
/** A heading on the right of the stage: a small date line, a title, and a soft line under it. */
function heading(x, y, date, title, sub, a = 1, { maxW = 760, color = C.ink, size = 64 } = {}) {
  A(a, () => {
    if (date) txtFit(date, x, y, maxW, { size: 34, weight: 700, color: C.coral, spacing: '2px' });
    if (title) txtFit(title, x, y + 70, maxW, { size, weight: 800, family: DISPLAY, color });
    if (sub) txtFit(sub, x, y + 140, maxW, { size: 40, weight: 500, color: C.soft });
  });
}
/** A name plate: a name, and a role under it. */
function plate(x, y, w, name, role, col, a = 1, { sub = null } = {}) {
  A(a, () => {
    card(x, y, w, sub ? 196 : 150, { line: col, lw: 3 });
    ctx.fillStyle = col; ctx.fillRect(x, y + 18, 8, (sub ? 196 : 150) - 36);
    txtFit(name, x + 40, y + 56, w - 70, { size: 56, weight: 800, family: DISPLAY });
    txtFit(role, x + 40, y + 112, w - 70, { size: 38, weight: 700, color: col });
    if (sub) txtFit(sub, x + 40, y + 160, w - 70, { size: 34, weight: 500, color: C.soft });
  });
}
/** A struck-through line: drawn, then a line across it at progress g. */
function struck(str, x, y, g, { size = 40, col = C.ink, strikeCol = C.steel, maxW = 700 } = {}) {
  const z = fit(str, maxW, size, { weight: 600 });
  txt(str, x, y, { size: z, weight: 500, color: g >= 1 ? C.faint : col });
  if (g > 0) { const w = textW(str, { size: z, weight: 500 }); ctx.fillStyle = strikeCol; ctx.fillRect(x - 6, y - 2, (w + 12) * Math.min(1, g), 4); }
}
/** A vertical bar on a baseline, with its value above and its label below. */
function vbar(x, base, w, hgt, col, value, label, a = 1) {
  A(a, () => {
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, base - hgt, w, hgt);
    if (value != null) txt(value, x, base - hgt - 34, { size: 44, weight: 800, family: DISPLAY, align: 'center' });
    if (label != null) txt(label, x, base + 36, { size: 36, weight: 700, color: C.soft, align: 'center' });
  });
}
/** A sheet of paper with lines of "typing" (grey bars) shown up to n. */
function sheet(x, y, w, h, rot = -0.02) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 14, w, h);
  ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h);
  return () => ctx.restore();
}
/** A quotation, centred: the words, then who said it. */
function quote(str, who, cx, cy, a = 1, { maxW = 1300, size = 64, col = C.ink } = {}) {
  A(a, () => {
    para(str, cx, cy, maxW, { size, weight: 700, ink: col, lh: size * 1.2 });
    if (who) txtFit(who, cx, cy + 150, maxW, { size: 36, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- dates and the road ----------
const DAY = 86400000;
const D = (y, m, d = 1) => Date.UTC(y, m - 1, d) / DAY;
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// Where the lantern stands at each line (the narration's date), and the label it shows.
const STOPS = [
  ['o1', D(1956, 10, 22), '22 October 1956'], ['o3', D(1953, 3, 5), '1953'],
  ['a1', D(1953, 3, 5), '5 March 1953'], ['a3', D(1953, 6, 15), 'June 1953'], ['a5', D(1953, 7, 4), '4 July 1953'],
  ['a9', D(1954, 7, 1), '1954'],
  ['b2', D(1955, 1, 8), 'January 1955'], ['b3', D(1955, 4, 18), 'April 1955'], ['b4', D(1955, 12, 3), 'December 1955'],
  ['b7', D(1955, 5, 14), '14 May 1955'], ['b8', D(1955, 5, 15), '15 May 1955'], ['b9', D(1955, 12, 31), '1955'],
  ['c1', D(1956, 2, 25), '25 February 1956'], ['c4', D(1956, 3, 29), 'March 1956'], ['c5', D(1956, 5, 15), 'Spring 1956'],
  ['c6', D(1956, 6, 18), '18 June 1956'], ['c7', D(1956, 6, 27), '27 June 1956'], ['c10', D(1956, 6, 28), '28 June 1956'],
  ['c11', D(1956, 6, 30), '30 June 1956'],
  ['d1', D(1956, 7, 14), 'July 1956'], ['d2', D(1956, 7, 18), '18 July 1956'], ['d4', D(1956, 7, 19), '19 July 1956'],
  ['d6', D(1956, 9, 1), '1956'],
  ['e1', D(1956, 10, 6), '6 October 1956'], ['e6', D(1956, 10, 14), '14 October 1956'], ['e7', D(1956, 10, 16), '16 October 1956'],
  ['e8', D(1956, 10, 19), '19 October 1956'], ['e9', D(1956, 10, 21), '21 October 1956'],
  ['f1', D(1956, 10, 22), '22 October 1956'], ['g3', D(1956, 10, 23), '23 October 1956'],
];
// Milestones lit on the road once the lantern has passed them.
const MILES = [D(1953, 3, 5), D(1953, 7, 4), D(1955, 4, 18), D(1955, 5, 15), D(1955, 12, 3), D(1956, 2, 25), D(1956, 6, 27),
  D(1956, 7, 18), D(1956, 10, 6), D(1956, 10, 16), D(1956, 10, 21), D(1956, 10, 22)];
const START = D(1953, 3, 5), END = D(1956, 10, 23);
/** The lantern's date and label at time t: it walks from one stop to the next over the first 1.6 s of a line. */
function lantern(t) {
  let i = 0;
  while (i + 1 < STOPS.length && t >= s(STOPS[i + 1][0])) i++;
  if (t < s(STOPS[0][0])) return { d: STOPS[0][1], label: STOPS[0][2], i: 0, u: 1 };
  const [key, d1, label] = STOPS[i], d0 = i ? STOPS[i - 1][1] : d1;
  const u = eio(seg(t, s(key), s(key, 1.6)));
  return { d: lerp(d0, d1, u), label, i, u };
}
// The road's window [centre, span in days]: all of 1953–56, then 1956, then October 1956, then all again for the recap.
const VIEW_ALL = [(D(1953, 1, 1) + D(1956, 12, 1)) / 2, D(1956, 12, 1) - D(1953, 1, 1)];
const VIEW_56 = [(D(1955, 12, 20) + D(1956, 11, 8)) / 2, D(1956, 11, 8) - D(1955, 12, 20)];
const VIEW_OCT = [(D(1956, 9, 29) + D(1956, 10, 26)) / 2, D(1956, 10, 26) - D(1956, 9, 29)];
function view(t) {
  const moves = [[CH[2].at + 1.0, VIEW_56], [CH[4].at + 1.0, VIEW_OCT], [s('g1', 0.2), VIEW_ALL]];
  let v = VIEW_ALL;
  for (const [at, to] of moves) {
    const u = eio(seg(t, at, at + 2.6));
    if (u <= 0) break;
    v = [lerp(v[0], to[0], u), Math.exp(lerp(Math.log(v[1]), Math.log(to[1]), u))];
  }
  return v;
}
const RX0 = 150, RX1 = 1770, RY = 914;
function drawRoad(t, a = 1) {
  if (a <= 0) return;
  const [c, sp] = view(t), X = (d) => lerp(RX0, RX1, (d - (c - sp / 2)) / sp);
  const L = lantern(t), inside = (x) => x >= RX0 - 1 && x <= RX1 + 1;
  A(a, () => {
    // the road itself
    ctx.fillStyle = 'rgba(236,230,214,0.05)'; ctx.fillRect(RX0, RY - 9, RX1 - RX0, 18);
    ctx.fillStyle = C.ghost; ctx.fillRect(RX0, RY - 10, RX1 - RX0, 2); ctx.fillRect(RX0, RY + 8, RX1 - RX0, 2);
    // ticks: years, months, days, crossfading with the zoom
    const aY = seg(sp, 420, 900), aM = seg(sp, 45, 110) * (1 - seg(sp, 600, 1000)), aD = 1 - seg(sp, 45, 90);
    if (aY > 0) A(aY, () => {
      for (let y = 1953; y <= 1957; y++) {
        const x = X(D(y, 1, 1)); if (!inside(x)) continue;
        ctx.fillStyle = C.faint; ctx.fillRect(x - 1, RY - 18, 2, 36);
        const xm = X(D(y, 7, 1)); if (y <= 1956 && inside(xm)) txt(String(y), xm, RY + 44, { size: 32, weight: 700, color: C.soft, align: 'center' });
        for (let m = 2; m <= 12; m++) { const xx = X(D(y, m, 1)); if (inside(xx)) { ctx.fillStyle = C.ghost; ctx.fillRect(xx - 1, RY - 6, 2, 12); } }
      }
    });
    if (aM > 0) A(aM, () => {
      for (let y = 1955; y <= 1956; y++) for (let m = 1; m <= 12; m++) {
        const x = X(D(y, m, 1)); if (inside(x)) { ctx.fillStyle = C.faint; ctx.fillRect(x - 1, RY - 14, 2, 28); }
        const xm = X(D(y, m, 15)); if (inside(xm) && xm > RX0 + 30 && xm < RX1 - 30) txt(MON[m - 1], xm, RY + 44, { size: 32, weight: 700, color: m === 1 ? C.coral : C.soft, align: 'center' });
      }
    });
    if (aD > 0) A(aD, () => {
      for (let d = D(1956, 9, 20); d <= D(1956, 11, 2); d++) {
        const x = X(d), x2 = X(d + 0.5); if (!inside(x2)) continue;
        const day = new Date(d * DAY).getUTCDate();
        ctx.fillStyle = C.ghost; if (inside(x)) ctx.fillRect(x - 1, RY - 8, 2, 16);
        if (day === 1) txt(MON[new Date(d * DAY).getUTCMonth()], x2, RY + 44, { size: 32, weight: 800, color: C.coral, align: 'center' });
        else txt(String(day), x2, RY + 44, { size: 32, weight: 600, color: C.soft, align: 'center' });
      }
    });
    // the way travelled, in coral, from March 1953 to the lantern
    const xs = Math.max(RX0, X(START)), xl = Math.min(RX1, X(L.d));
    if (xl > xs) { ctx.fillStyle = C.coral; ctx.fillRect(xs, RY - 2, xl - xs, 4); }
    for (const m of MILES) {
      const x = X(m); if (!inside(x)) continue;
      ctx.fillStyle = m <= L.d + 0.5 ? C.coral : C.ghost; ctx.beginPath(); ctx.arc(x, RY, 5, 0, TAU); ctx.fill();
    }
    // the lantern and its date
    const xL = X(L.d);
    if (inside(xL)) {
      const g = ctx.createRadialGradient(xL, RY, 2, xL, RY, 46); g.addColorStop(0, 'rgba(224,122,95,0.5)'); g.addColorStop(1, 'rgba(224,122,95,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xL, RY, 46, 0, TAU); ctx.fill();
      ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(xL, RY, 10, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(xL, RY, 15, 0, TAU); ctx.stroke();
      ctx.fillStyle = C.coral; ctx.fillRect(xL - 1.5, RY - 40, 3, 24);
      const w = textW(L.label, { size: 32, weight: 700 }), lx = Math.max(RX0 + w / 2, Math.min(RX1 - w / 2, xL));
      txt(L.label, lx, RY - 60, { size: 32, weight: 700, color: C.ink, align: 'center' });
    }
  });
}

// ---------- maps ----------
// Hungary: the series' outline (lon, lat), from explainers/earth-last-fighting-csepel-dunapentele.js.
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
// Austria, simplified here; its eastern border is Hungary's western one, so the two meet exactly.
const AUSTRIA = [[9.53, 47.27], [9.6, 47.53], [10.2, 47.59], [10.9, 47.48], [11.6, 47.58], [12.2, 47.7], [12.75, 47.67], [13.0, 47.8], [12.9, 48.2],
  [13.45, 48.57], [13.8, 48.7], [14.7, 48.6], [15.0, 49.0], [15.6, 48.9], [16.1, 48.75], [16.95, 48.62], [17.16, 48.01], [17.05, 47.82], [16.9, 47.7],
  [16.64, 47.75], [16.43, 47.56], [16.48, 47.4], [16.45, 47.15], [16.28, 47.0], [16.11, 46.87], [15.65, 46.7], [15.0, 46.65], [14.5, 46.42], [13.7, 46.52],
  [12.6, 46.65], [12.2, 46.98], [11.5, 47.0], [11.0, 46.77], [10.45, 46.87], [10.1, 46.85], [9.6, 47.05]];
const TOWN = { budapest: [19.04, 47.5], szeged: [20.15, 46.25], vienna: [16.37, 48.21], warsaw: [21.01, 52.23], gyor: [17.63, 47.68], zahony: [22.17, 48.41] };
/** A projection: lon/lat to x/y around (lon0, lat0) at `sc` pixels per degree of latitude, centred on (cx, cy). */
const proj = (cx, cy, lon0, lat0, sc) => ([lo, la]) => [cx + (lo - lon0) * sc * Math.cos(47.3 * RAD), cy - (la - lat0) * sc];
function poly(P, pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...P(p)) : ctx.moveTo(...P(p)))); if (close) ctx.closePath(); }
function hungary(P, { fill = C.land, line = C.landLine, river = true } = {}) {
  poly(P, OUTLINE); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  if (river) { ctx.strokeStyle = C.river; ctx.lineWidth = 5; poly(P, DANUBE, false); ctx.stroke(); }
}
function town(P, ll, name, { dx = 16, dy = 0, align = 'left', col = C.ink, size = 34, r = 8, ring = 0 } = {}) {
  const [x, y] = P(ll);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (ring > 0) A(1 - ring, () => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r + 6 + ring * 18, 0, TAU); ctx.stroke(); });
  if (name) txt(name, x + dx, y + dy, { size, weight: 700, color: col, align });
  return [x, y];
}
function inPoly(pt, P) {
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// Villages for the bonfires: points inside Hungary, fixed.
const VILLAGES = (() => { const R = rng(1953), out = []; while (out.length < 46) { const p = [16.3 + R() * 6.5, 45.8 + R() * 2.7]; if (inPoly(p)) out.push(p); } return out; })();
// The web of terror over the map: a jittered net of short threads, each with the moment it gives way.
const NET = (() => {
  const R = rng(54), pts = [], out = [], nx = 15, ny = 9;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) pts.push([150 + i * 58 + (R() - 0.5) * 22, 230 + j * 58 + (R() - 0.5) * 22]);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const p = pts[j * nx + i];
    if (i + 1 < nx) out.push([...p, ...pts[j * nx + i + 1], R()]);
    if (j + 1 < ny) out.push([...p, ...pts[(j + 1) * nx + i], R()]);
  }
  return out;
})();
function mapNote(x, y, a = 1, align = 'left') { A(a, () => txt('schematic map', x, y, { size: 32, weight: 500, color: C.faint, align })); }

// ---------- the background, painted once ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.5, H * 0.42, 120, W * 0.5, H * 0.5, 1150);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // a faint paper grain: specks and short fibres
  const R = rng(1956);
  for (let i = 0; i < 26000; i++) {
    const x = R() * W, y = R() * H, v = R();
    g.fillStyle = v < 0.5 ? `rgba(236,230,214,${0.018 + R() * 0.03})` : `rgba(0,0,0,${0.05 + R() * 0.06})`;
    g.fillRect(x, y, 1 + R() * 1.6, 1 + R() * 1.6);
  }
  g.strokeStyle = 'rgba(236,230,214,0.025)'; g.lineWidth = 1;
  for (let i = 0; i < 900; i++) { const x = R() * W, y = R() * H, a = R() * TAU, l = 6 + R() * 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  // a soft vignette
  const v = g.createRadialGradient(W / 2, H / 2, 600, W / 2, H / 2, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- shared drawings ----------
/** Two places as dots and an arc between them (not a map): who went where. */
function journey(t, from, to, fromName, toName, u, col, { a = 1, labelTo = C.steel } = {}) {
  A(a, () => {
    const mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 150];
    const pts = smooth([from, mid, to], 18);
    ctx.strokeStyle = C.ghost; ctx.lineWidth = 3; ctx.setLineDash([4, 12]); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.setLineDash([]);
    trace(pts, u, col, { w: 5, dash: [16, 12] });
    for (const [p, n, c] of [[from, fromName, C.ink], [to, toName, labelTo]]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, TAU); ctx.fill();
      txt(n, p[0], p[1] + 48, { size: 38, weight: 700, color: c, align: 'center' });
    }
  });
}
/** The government building by the Danube: a long front, a dome with a spire, two rows of small towers. */
function parliament(cx, base, w, a = 1, glow = 0) {
  A(a, () => {
    const h = w * 0.16, col = glow > 0 ? C.coral : C.soft;
    ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(236,230,214,0.06)';
    ctx.beginPath(); ctx.rect(cx - w / 2, base - h, w, h); ctx.fill(); ctx.stroke();
    // wings and towers
    for (let i = 0; i <= 12; i++) { const x = cx - w / 2 + (i / 12) * w; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x, base - h - 26); ctx.lineTo(x + 6, base - h - 40); ctx.lineTo(x + 12, base - h - 26); ctx.lineTo(x + 12, base - h); ctx.stroke(); }
    for (let i = 0; i < 26; i++) { const x = cx - w / 2 + 18 + i * ((w - 36) / 25); ctx.beginPath(); ctx.moveTo(x, base - 18); ctx.lineTo(x, base - h + 22); ctx.stroke(); }
    // the dome
    const dw = w * 0.17, dy = base - h;
    ctx.beginPath(); ctx.rect(cx - dw / 2, dy - 50, dw, 50); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - dw / 2, dy - 50); ctx.quadraticCurveTo(cx, dy - 50 - dw * 0.95, cx + dw / 2, dy - 50); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, dy - 50 - dw * 0.5); ctx.lineTo(cx, dy - 50 - dw * 0.95); ctx.stroke();
    if (glow > 0) A(glow, () => {
      const g = ctx.createRadialGradient(cx, dy - 40, 10, cx, dy - 40, w * 0.55); g.addColorStop(0, 'rgba(224,122,95,0.35)'); g.addColorStop(1, 'rgba(224,122,95,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - w * 0.6, dy - w * 0.5, w * 1.2, w * 0.7);
    });
    ctx.strokeStyle = C.river; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - w * 0.62, base + 26); ctx.lineTo(cx + w * 0.62, base + 26); ctx.stroke();
    void col;
  });
}
/** A small flame, flickering with t. */
function flame(x, y, sz, t, ph) {
  const f = 1 + 0.18 * Math.sin(t * 9 + ph) + 0.1 * Math.sin(t * 15.3 + ph * 2);
  const g = ctx.createRadialGradient(x, y - sz * 0.4, 1, x, y - sz * 0.4, sz * 2.2); g.addColorStop(0, 'rgba(224,122,95,0.45)'); g.addColorStop(1, 'rgba(224,122,95,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - sz * 0.4, sz * 2.2, 0, TAU); ctx.fill();
  ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(x - sz * 0.5, y); ctx.quadraticCurveTo(x - sz * 0.6, y - sz * 0.8 * f, x, y - sz * 1.5 * f); ctx.quadraticCurveTo(x + sz * 0.6, y - sz * 0.8 * f, x + sz * 0.5, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f2c18a'; ctx.beginPath(); ctx.moveTo(x - sz * 0.22, y); ctx.quadraticCurveTo(x - sz * 0.25, y - sz * 0.5 * f, x, y - sz * 0.85 * f); ctx.quadraticCurveTo(x + sz * 0.25, y - sz * 0.5 * f, x + sz * 0.22, y); ctx.closePath(); ctx.fill();
}
/** A column of power: a shaft with a capital and a base, and a name on it. */
function pillar(cx, base, hgt, col, a = 1) {
  A(a, () => {
    const w = 150;
    ctx.fillStyle = 'rgba(236,230,214,0.05)'; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.rect(cx - w / 2, base - hgt, w, hgt); ctx.fill(); ctx.stroke();
    for (let i = 1; i < 4; i++) { const x = cx - w / 2 + (i * w) / 4; ctx.beginPath(); ctx.moveTo(x, base - hgt + 30); ctx.lineTo(x, base - 24); ctx.stroke(); }
    ctx.fillStyle = col; ctx.fillRect(cx - w / 2 - 26, base - hgt - 22, w + 52, 22); ctx.fillRect(cx - w / 2 - 26, base, w + 52, 22);
  });
}
/** A loudspeaker horn, facing right, with sound arcs at phase p. */
function speaker(x, y, sz, col, p) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - sz * 0.25); ctx.lineTo(x + sz * 0.4, y - sz * 0.25); ctx.lineTo(x + sz, y - sz * 0.7); ctx.lineTo(x + sz, y + sz * 0.7); ctx.lineTo(x + sz * 0.4, y + sz * 0.25); ctx.lineTo(x, y + sz * 0.25); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const q = (p + i / 3) % 1, r = sz * (0.6 + q * 1.2); A(1 - q, () => { ctx.beginPath(); ctx.arc(x + sz, y, r, -0.7, 0.7); ctx.stroke(); }); }
}
/** A microphone on a stand. */
function microphone(x, y, sz, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  k.rrect(x - sz * 0.22, y - sz, sz * 0.44, sz * 0.7, sz * 0.22); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - sz * 0.55, sz * 0.36, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - sz * 0.2); ctx.lineTo(x, y + sz * 0.3); ctx.moveTo(x - sz * 0.3, y + sz * 0.3); ctx.lineTo(x + sz * 0.3, y + sz * 0.3); ctx.stroke(); ctx.lineCap = 'butt';
}
/** A sheet of paper as an icon, with grey lines. */
function paperIcon(x, y, w, h, rot, col = C.paper) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2 + 4, -h / 2 + 5, w, h);
  ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = C.paperSoft; for (let i = 0; i < 6; i++) ctx.fillRect(-w / 2 + w * 0.14, -h / 2 + h * 0.16 + i * h * 0.12, w * (i % 3 === 2 ? 0.5 : 0.72), Math.max(2, h * 0.035));
  ctx.restore();
}

// ---------- cold open ----------
const POINTS_SHOWN = ['All Soviet troops out of Hungary'];
function partOpen(t) {
  // o1–o2: the students' sheet and its first point
  const v1 = span(t, s('o1', 0), s('o3', 0.6), 0.8, 0.8);
  if (v1 > 0) A(v1, () => {
    const done = sheet(330, 150, 620, 640, -0.025);
    txt('22 October 1956', -250, -250, { size: 34, weight: 700, color: C.paperInk });
    txtFit('Technical University, Budapest', -250, -205, 500, { size: 32, weight: 500, color: C.paperSoft });
    const n = Math.floor(16 * eout(seg(t, s('o1', 0.8), e('o1', -0.5))));
    for (let i = 0; i < 16; i++) {
      if (i >= n) break;
      const y = -140 + i * 26;
      if (i === 0) continue;
      ctx.fillStyle = C.paperSoft; ctx.fillRect(-250, y, 420 + ((i * 53) % 90), 7);
    }
    // point 1, typed out in o2
    const p1 = seg(t, s('o2', 0.6), s('o2', 1.6));
    ctx.fillStyle = C.paperSoft; ctx.fillRect(-250, -140, 470 * (1 - p1), 7);
    A(p1, () => { txt('1.', -250, -136, { size: 34, weight: 800, color: C.paperInk }); txtFit(POINTS_SHOWN[0], -210, -136, 440, { size: 34, weight: 700, color: C.paperInk }); ctx.fillStyle = C.coral; ctx.fillRect(-250, -112, 470 * eout(seg(t, s('o2', 1.6), s('o2', 2.4))), 5); });
    done();
    // the number, on the right
    const g = eout(seg(t, s('o1', 1.0), s('o1', 2.0)));
    A(g, () => {
      txt(String(Math.max(1, Math.round(16 * eout(seg(t, s('o1', 1.0), e('o1', -0.4)))))), 1380, 400, { size: 300, weight: 800, family: DISPLAY, color: C.coral, align: 'center' });
      txtFit('demands', 1380, 590, 600, { size: 56, weight: 700, align: 'center' });
    });
    A(seg(t, s('o2', 2.4), s('o2', 3.2)), () => { stamp('TABOO BROKEN', 1380, 700, C.coral, 1, { size: 42, scale: 1 + 0.3 * (1 - eout(seg(t, s('o2', 2.4), s('o2', 3.0)))) }); });
  });
  // o3: what Hungary had been in 1953
  const v3 = span(t, s('o3', 0), s('o4', 1.2), 0.8, 0.8);
  if (v3 > 0) A(v3, () => {
    const items = [['internment camps', 'fence'], ['show trials', 'bench'], ['fear', 'eye']];
    items.forEach(([label, icon], i) => {
      const x = 480 + i * 480, y = 450, g = eout(seg(t, s('o3', 0.6 + i * 1.2), s('o3', 1.4 + i * 1.2)));
      A(g, () => {
        ctx.strokeStyle = C.steel; ctx.fillStyle = C.steel; ctx.lineWidth = 4;
        if (icon === 'fence') {
          for (let j = 0; j < 5; j++) { const px = x - 140 + j * 70; ctx.fillRect(px - 4, y - 110, 8, 200); }
          for (let r = 0; r < 4; r++) { ctx.beginPath(); for (let j = 0; j <= 28; j++) { const px = x - 150 + j * 10.7, py = y - 90 + r * 50 + (j % 2 ? -7 : 7); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
        } else if (icon === 'bench') {
          ctx.fillRect(x - 170, y - 20, 340, 24); ctx.fillRect(x - 150, y + 4, 300, 90);
          ctx.fillRect(x - 70, y - 120, 140, 100); ctx.beginPath(); ctx.arc(x, y - 145, 24, 0, TAU); ctx.fill();
          ctx.fillStyle = C.bg0; ctx.fillRect(x - 130, y + 30, 260, 6);
        } else {
          ctx.beginPath(); ctx.moveTo(x - 150, y); ctx.quadraticCurveTo(x, y - 120, x + 150, y); ctx.quadraticCurveTo(x, y + 120, x - 150, y); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.arc(x, y, 46, 0, TAU); ctx.fill(); ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill();
        }
        txtFit(label, x, y + 190, 420, { size: 44, weight: 700, color: C.ink, align: 'center' });
      });
    });
  });
  // o4: the title
  const ti = eout(seg(t, s('o4', 1.4), s('o4', 2.8)));
  A(ti, () => {
    flag(W / 2 - 70, 200, 140);
    txtFit('THE ROAD TO OCTOBER', W / 2, 380, 1400, { size: 38, weight: 700, color: C.soft, align: 'center', spacing: '8px' });
    const title = 'THE ROAD TO 23 OCTOBER';
    txt(title, W / 2, 500 + (1 - ti) * 16, { size: fit(title, 1640, 128, { weight: 800, family: DISPLAY, spacing: '2px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '2px' });
    rule(W / 2, 596, 420, 1, ti);
    txt('Hungary 1956', W / 2, 676, { size: 48, weight: 700, color: C.coral, align: 'center' });
  });
}

// ---------- 1: a new course ----------
const PILLAR = { gov: 640, party: 1280, base: 760 };
function partNew(t) {
  const RXH = 1040; // right-hand column
  // a1: a calendar leaf
  const v1 = span(t, s('a1'), s('a2', 0.4), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    const x = 300, y = 190, w = 420, h = 520;
    card(x, y, w, h, { bg: C.paper, line: null, r: 10 });
    ctx.fillStyle = C.dark; ctx.fillRect(x, y, w, 110);
    txtFit('MARCH 1953', x + w / 2, y + 56, w - 40, { size: 50, weight: 800, family: DISPLAY, color: C.ink, align: 'center', spacing: '2px' });
    txt('5', x + w / 2, y + 320, { size: 300, weight: 800, family: DISPLAY, color: C.paperInk, align: 'center' });
    // a black mourning band across the corner
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x + w, y + h); ctx.rotate(-Math.PI / 4); ctx.fillStyle = C.dark; ctx.fillRect(-200, 40, 400, 44); ctx.restore();
    heading(RXH, 330, 'Moscow', 'Joseph Stalin dies', 'his heirs want calm', 1);
  });
  // a2: real wages
  const v2 = span(t, s('a2'), s('a3', 0.4), 0.7, 0.7);
  if (v2 > 0) A(v2, () => {
    const base = 740, g = eio(seg(t, s('a2', 1.2), s('a2', 3.2)));
    txtFit('Real wages of wage earners', 540, 190, 760, { size: 44, weight: 700, align: 'center' });
    txtFit('1949 = 100', 540, 245, 600, { size: 34, weight: 500, color: C.soft, align: 'center' });
    vbar(390, base, 170, 420, C.faint, '100', '1949');
    vbar(690, base, 170, 420 * lerp(1, 0.8, g), C.coral, g > 0.98 ? '80' : null, '1953', seg(t, s('a2', 0.8), s('a2', 1.4)));
    A(seg(t, s('a2', 3.0), s('a2', 3.8)), () => {
      ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(300, base - 420); ctx.lineTo(800, base - 420); ctx.stroke(); ctx.setLineDash([]);
      heading(RXH, 330, null, '−20%', null, 1, { color: C.coral, size: 120 });
      txtFit('an economy near collapse', RXH, 500, 760, { size: 44, weight: 700, color: C.soft });
    });
  });
  // a3: summoned to Moscow
  const v3 = span(t, s('a3'), s('a4', 0.4), 0.7, 0.7);
  if (v3 > 0) A(v3, () => {
    journey(t, [260, 620], [880, 330], 'Budapest', 'Moscow', eio(seg(t, s('a3', 0.4), s('a3', 2.4))), C.ink);
    heading(RXH, 300, 'June 1953', 'Summoned to Moscow', null, 1);
    A(seg(t, s('a3', 2.6), s('a3', 3.4)), () => { chip('Rákosi’s policies condemned', RXH, 480, { color: C.steel, align: 'left', size: 40 }); });
  });
  // a4: Imre Nagy
  const v4 = span(t, s('a4'), s('a5', 0.4), 0.7, 0.7);
  if (v4 > 0) A(v4, () => {
    const g = eout(seg(t, s('a4', 0.3), s('a4', 1.3)));
    A(g, () => figure(520, 720, 380, C.coral));
    A(seg(t, s('a4', 0.4), s('a4', 1.2)), () => plate(RXH - 120, 300, 820, 'Imre Nagy', 'prime minister', C.coral, 1, { sub: 'Moscow’s choice' }));
    A(seg(t, s('a4', 2.6), s('a4', 3.4)), () => txtFit('carried out the land reform of 1945', RXH - 80, 560, 780, { size: 38, weight: 500, color: C.soft }));
  });
  // a5: the new course in Parliament
  const v5 = span(t, s('a5'), s('a6', 0.4), 0.7, 0.7);
  if (v5 > 0) A(v5, () => {
    parliament(560, 640, 820, 1, seg(t, s('a5', 1.0), s('a5', 2.4)));
    txtFit('Parliament', 560, 730, 600, { size: 36, weight: 700, color: C.soft, align: 'center' });
    heading(RXH, 300, '4 July 1953', 'THE NEW COURSE', null, 1, { color: C.coral });
    A(seg(t, s('a5', 3.0), s('a5', 3.8)), () => txtFit('announced by the government', RXH, 440, 760, { size: 40, weight: 500, color: C.soft }));
  });
  // a6–a7: the measures
  const v6 = span(t, s('a6'), s('a8', 0.4), 0.7, 0.7);
  if (v6 > 0) A(v6, () => {
    const items = [['Internment camps closed', s('a6', 0.3)], ['Deportations ended', s('a6', 1.9)], ['An amnesty', s('a6', 3.4)],
      ['Less for heavy industry', s('a7', 0.2)], ['More for food and housing', s('a7', 1.6)], ['Peasants may leave the collective farms', s('a7', 3.4)]];
    txtFit('THE NEW COURSE', RXH, 170, 760, { size: 40, weight: 800, family: DISPLAY, color: C.coral, spacing: '3px' });
    items.forEach(([str, at], i) => {
      const g = eout(seg(t, at, at + 0.7)), y = 250 + i * 92;
      A(g, () => {
        ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(RXH + 20, y, 18, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(RXH + 10, y); ctx.lineTo(RXH + 18, y + 9); ctx.lineTo(RXH + 31, y - 9); ctx.stroke();
        txtFit(str, RXH + 64 + (1 - g) * 20, y, 700, { size: 42, weight: 700 });
      });
    });
    // left: a camp fence opening, then industry down and food up
    const f = span(t, s('a6'), s('a7', 0.3), 0.5, 0.6), open = eio(seg(t, s('a6', 0.6), s('a6', 2.4)));
    if (f > 0) A(f, () => {
      const x = 520, y = 470;
      ctx.fillStyle = C.steel; ctx.strokeStyle = C.steel; ctx.lineWidth = 4;
      for (let j = 0; j < 6; j++) {
        const side = j < 3 ? -1 : 1, px = x + (j - 2.5) * 80 + side * open * 120;
        ctx.fillRect(px - 4, y - 140, 8, 260);
      }
      for (let r = 0; r < 4; r++) for (const side of [-1, 1]) {
        ctx.beginPath();
        for (let j = 0; j <= 12; j++) { const px = x + side * (40 + open * 120) + side * j * 15, py = y - 110 + r * 60 + (j % 2 ? -6 : 6); j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      }
      // people walking out through the gap
      for (let i = 0; i < 7; i++) {
        const u = seg(t, s('a6', 2.0 + i * 0.35), s('a6', 4.6 + i * 0.35));
        if (u <= 0) continue;
        A(Math.min(1, u * 4) * (1 - seg(u, 0.85, 1)), () => figure(x + (i % 2 ? -18 : 18), lerp(y + 60, y + 290, eout(u)) - 26 * (i % 3), 92, C.coral));
      }
    });
    const f2 = span(t, s('a7'), s('a8', 0.4), 0.5, 0.6);
    if (f2 > 0) A(f2, () => {
      const g1 = eio(seg(t, s('a7', 0.2), s('a7', 1.4))), g2 = eio(seg(t, s('a7', 1.6), s('a7', 2.8)));
      // a factory, its arrow pointing down
      ctx.fillStyle = C.steel;
      ctx.fillRect(220, 560, 260, 140); ctx.fillRect(250, 380, 44, 180); ctx.fillRect(330, 430, 44, 130);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(220 + i * 87, 560); ctx.lineTo(220 + i * 87 + 87, 520); ctx.lineTo(220 + i * 87 + 87, 560); ctx.fill(); }
      A(g1, () => { trace([[560, 380], [560, 380 + 220 * g1]], 1, C.steel, { w: 10, headSize: 30 }); });
      // a house with a sheaf, its arrow pointing up
      A(seg(t, s('a7', 1.4), s('a7', 2.0)), () => {
        ctx.fillStyle = C.coral; ctx.fillRect(700, 580, 200, 120); ctx.beginPath(); ctx.moveTo(680, 590); ctx.lineTo(800, 480); ctx.lineTo(920, 590); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.bg0; ctx.fillRect(780, 630, 40, 70);
        A(g2, () => trace([[960, 640], [960, 640 - 230 * g2]], 1, C.coral, { w: 10, headSize: 30 }));
      });
    });
  });
  // a8–a9: the map, with bonfires; then the web of terror coming apart
  const v8 = span(t, s('a8'), s('a10', 0.4), 0.7, 0.7);
  if (v8 > 0) A(v8, () => {
    const P = proj(540, 470, 19.5, 47.17, 150);
    hungary(P);
    mapNote(140, 760);
    const n = Math.floor(VILLAGES.length * eout(seg(t, s('a8', 0.4), s('a8', 3.6))));
    VILLAGES.slice(0, n).forEach((v, i) => { const [x, y] = P(v); flame(x, y, 11, t, i * 1.7); });
    town(P, TOWN.budapest, 'Budapest', { col: C.ink, size: 32, r: 7 });
    // the web of terror, coming apart in a9
    const web = seg(t, s('a9', 0.0), s('a9', 0.8)) * (1 - seg(t, s('a10', -0.2), s('a10', 0.4)));
    if (web > 0) A(web, () => {
      const gone = seg(t, s('a9', 2.6), e('a9', -0.2));
      ctx.strokeStyle = C.steel; ctx.lineWidth = 2;
      for (const [x0, y0, x1, y1, thr] of NET) {
        if (thr < gone) continue;
        A(Math.min(1, (thr - gone) * 6), () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); });
      }
    });
    A(span(t, s('a8'), s('a9', 0.2), 0.6, 0.5), () => heading(RXH, 300, 'Summer 1953', 'Bonfires in the villages', 'from the party’s own reports', 1));
    A(seg(t, s('a9', 0.2), s('a9', 0.8)), () => {
      const g = eio(seg(t, s('a9', 0.6), s('a9', 2.4)));
      txtFit('Consumption', RXH + 330, 190, 700, { size: 44, weight: 700, align: 'center' });
      txtFit('1950 = 100', RXH + 330, 245, 600, { size: 34, weight: 500, color: C.soft, align: 'center' });
      vbar(RXH + 200, 700, 150, 300, C.faint, '100', '1950');
      vbar(RXH + 460, 700, 150, 300 * lerp(1, 1.2, g), C.coral, g > 0.98 ? '120' : null, '1954');
      A(seg(t, s('a9', 2.4), s('a9', 3.0)), () => txt('+20%', RXH + 660, 340, { size: 64, weight: 800, family: DISPLAY, color: C.coral, align: 'center' }));
    });
  });
  // a10–a11: two centres of power
  const v10 = span(t, s('a10'), DURATION, 0.7, 0.7);
  if (v10 > 0) A(v10, () => {
    const g1 = eout(seg(t, s('a10', 0.0), s('a10', 1.0))), g2 = eout(seg(t, s('a10', 0.8), s('a10', 1.8)));
    pillar(PILLAR.gov, PILLAR.base, 360, C.coral, g1);
    pillar(PILLAR.party, PILLAR.base, 440, C.steel, g2);
    A(g1, () => { txt('GOVERNMENT', PILLAR.gov, 230, { size: 40, weight: 800, family: DISPLAY, color: C.coral, align: 'center', spacing: '3px' }); txt('Imre Nagy', PILLAR.gov, 290, { size: 40, weight: 700, align: 'center' }); txt('prime minister', PILLAR.gov, 334, { size: 32, weight: 500, color: C.soft, align: 'center' }); });
    A(g2, () => { txt('PARTY', PILLAR.party, 150, { size: 40, weight: 800, family: DISPLAY, color: C.steel, align: 'center', spacing: '3px' }); txt('Mátyás Rákosi', PILLAR.party, 210, { size: 40, weight: 700, align: 'center' }); txt('First Secretary', PILLAR.party, 254, { size: 32, weight: 500, color: C.soft, align: 'center' }); });
    ['the press', 'the radio', 'the officials'].forEach((str, i) => {
      const g = eout(seg(t, s('a10', 2.6 + i * 0.9), s('a10', 3.3 + i * 0.9)));
      A(g, () => chip(str, PILLAR.party + 300, 420 + i * 100, { color: C.steel, size: 36, align: 'left' }));
      A(g, () => { ctx.strokeStyle = C.steelDim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PILLAR.party + 100, 420 + i * 100); ctx.lineTo(PILLAR.party + 270, 420 + i * 100); ctx.stroke(); });
    });
    A(seg(t, s('a11', 0.2), s('a11', 1.0)), () => {
      txtFit('TWO CENTRES OF POWER', 400, 140, 700, { size: 40, weight: 800, family: DISPLAY, color: C.ink, spacing: '3px', align: 'center' });
      rule(400, 172, 240);
    });
    const ar = eio(seg(t, s('a11', 2.4), e('a11', 0.4)));
    A(seg(t, s('a11', 2.2), s('a11', 2.6)), () => trace(smooth([[PILLAR.party - 90, 300], [960, 250], [PILLAR.gov + 110, 380]], 16), ar, C.steel, { w: 6, dash: [14, 10] }));
  });
}

// ---------- 2: Rákosi strikes back ----------
function partBack(t) {
  const RXH = 1040;
  // b1: prisoners freed, the Rajk case sealed
  const v1 = span(t, s('b1'), s('b2', 0.4), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    // a cell door swinging open, people leaving
    const x = 380, y = 230, open = eio(seg(t, s('b1', 0.4), s('b1', 1.6)));
    ctx.strokeStyle = C.steel; ctx.lineWidth = 4; ctx.strokeRect(x, y, 260, 460);
    ctx.save(); ctx.translate(x, y); ctx.transform(1 - open * 0.75, -open * 0.12, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(142,162,182,0.25)'; ctx.fillRect(0, 0, 260, 460); ctx.fillStyle = C.steel;
    for (let i = 1; i < 6; i++) ctx.fillRect(i * 43 - 4, 30, 8, 140);
    ctx.restore();
    for (let i = 0; i < 6; i++) {
      const u = seg(t, s('b1', 1.4 + i * 0.4), s('b1', 3.6 + i * 0.4)); if (u <= 0) continue;
      A(Math.min(1, u * 4), () => figure(lerp(x + 130, x + 380 + (i % 3) * 70, eout(u)), y + 460 - (i % 2) * 6, 90, C.coral));
    }
    A(seg(t, s('b1', 1.6), s('b1', 2.4)), () => { txt('freed', RXH, 250, { size: 36, weight: 700, color: C.coral }); plate(RXH, 290, 700, 'János Kádár', 'and many others', C.coral, 1); });
    A(seg(t, s('b1', 4.2), s('b1', 5.0)), () => {
      card(RXH, 520, 700, 170, { line: C.steel, lw: 3 });
      txtFit('The Rajk case', RXH + 40, 575, 620, { size: 46, weight: 800, family: DISPLAY });
      txtFit('László Rajk, hanged in 1949', RXH + 40, 635, 620, { size: 34, weight: 500, color: C.soft });
      stamp('TABOO', RXH + 560, 600, C.steel, seg(t, s('b1', 5.0), s('b1', 5.5)), { size: 40, rot: 0.08 });
    });
  });
  // b2: Moscow, January 1955
  const v2 = span(t, s('b2'), s('b3', 0.4), 0.7, 0.7);
  if (v2 > 0) A(v2, () => {
    journey(t, [260, 640], [880, 340], 'Budapest', 'Moscow', eio(seg(t, s('b2', 0.2), s('b2', 1.8))), C.coral, { labelTo: C.steel });
    heading(RXH, 260, 'January 1955', 'In Moscow', null, 1);
    A(seg(t, s('b2', 1.6), s('b2', 2.4)), () => { txtFit('Nagy: he cannot work with Rákosi', RXH, 420, 760, { size: 40, weight: 700, color: C.coral }); });
    stamp('ANTI-PARTY', RXH + 330, 560, C.steel, seg(t, s('b2', 4.4), s('b2', 4.9)), { size: 56, scale: 1 + 0.4 * (1 - eout(seg(t, s('b2', 4.4), s('b2', 5.0)))) });
  });
  // b3–b4: his posts struck off
  const v3 = span(t, s('b3'), s('b5', 0.4), 0.7, 0.7);
  if (v3 > 0) A(v3, () => {
    txt('Imre Nagy', 200, 180, { size: 56, weight: 800, family: DISPLAY });
    txt('April 1955', 200, 236, { size: 34, weight: 700, color: C.coral });
    const posts = ['Political Committee', 'Central Committee', 'prime minister', 'member of parliament', 'Academy of Sciences', 'university professor'];
    posts.forEach((p, i) => struck(p, 220, 310 + i * 64, seg(t, s('b3', 0.4 + i * 0.45), s('b3', 0.8 + i * 0.45)), { size: 40, maxW: 600 }));
    A(seg(t, s('b4', 0.1), s('b4', 0.6)), () => { txt('December 1955', 200, 710, { size: 34, weight: 700, color: C.coral }); });
    struck('party member', 220, 768, seg(t, s('b4', 2.2), s('b4', 2.9)), { size: 40, maxW: 600 });
    A(seg(t, s('b3', 3.0), s('b3', 3.8)), () => plate(RXH, 260, 720, 'András Hegedüs', 'prime minister', C.steel, 1, { sub: 'Rákosi’s man' }));
    A(seg(t, s('b4', 0.6), s('b4', 1.4)), () => txtFit('Nagy refuses to recant', RXH, 560, 720, { size: 44, weight: 700, color: C.coral }));
    stamp('EXPELLED', RXH + 330, 680, C.steel, seg(t, s('b4', 2.8), s('b4', 3.3)), { size: 52 });
  });
  // b5: the old course returns
  const v5 = span(t, s('b5'), s('b6', 0.4), 0.7, 0.7);
  if (v5 > 0) A(v5, () => {
    txtFit('THE OLD COURSE RETURNS', W / 2, 170, 1400, { size: 56, weight: 800, family: DISPLAY, color: C.steel, align: 'center', spacing: '2px' });
    const items = ['heavy industry', 'compulsory deliveries', 'pressure to join the collective farms'];
    items.forEach((str, i) => {
      const x = 400 + i * 560, g = eio(seg(t, s('b5', 1.6 + i * 1.1), s('b5', 2.6 + i * 1.1)));
      A(seg(t, s('b5', 1.4 + i * 1.1), s('b5', 1.9 + i * 1.1)), () => {
        ctx.fillStyle = C.ghost; ctx.fillRect(x - 60, 300, 120, 360);
        ctx.fillStyle = C.steel; ctx.fillRect(x - 60, 660 - 360 * lerp(0.35, 0.85, g), 120, 360 * lerp(0.35, 0.85, g));
        arrowHead(x, 660 - 360 * lerp(0.35, 0.85, g) - 30, -Math.PI / 2, C.steel, 36);
        para(str, x, 740, 440, { size: 36, weight: 700, ink: C.ink });
      });
    });
  });
  // b6: but not the old fear
  const v6 = span(t, s('b6'), s('b7', 0.4), 0.7, 0.7);
  if (v6 > 0) A(v6, () => {
    heading(RXH, 220, null, 'But not the old fear', null, 1, { color: C.coral });
    // people coming home: figures walking from a prison block to the houses
    ctx.strokeStyle = C.steel; ctx.lineWidth = 4; ctx.strokeRect(150, 330, 200, 270);
    ctx.fillStyle = C.steel; for (let i = 1; i < 5; i++) ctx.fillRect(150 + i * 40 - 3, 370, 6, 110);
    for (let i = 0; i < 3; i++) { const x = 640 + i * 90; ctx.fillStyle = C.faint; ctx.fillRect(x, 520, 70, 80); ctx.beginPath(); ctx.moveTo(x - 8, 524); ctx.lineTo(x + 35, 478); ctx.lineTo(x + 78, 524); ctx.fill(); }
    for (let i = 0; i < 6; i++) {
      const u = seg(t, s('b6', 0.8 + i * 0.5), s('b6', 4.2 + i * 0.5)); if (u <= 0) continue;
      A(Math.min(1, u * 4), () => figure(lerp(330, 600 - i * 50, eout(u)), 600, 100, C.coral));
    }
    A(seg(t, s('b6', 1.4), s('b6', 2.2)), () => txtFit('prisoners come home', RXH, 380, 760, { size: 44, weight: 700 }));
    A(seg(t, s('b6', 3.8), s('b6', 4.6)), () => {
      txtFit('writers protest', RXH, 520, 760, { size: 44, weight: 700 });
      // a pen nib
      ctx.save(); ctx.translate(250, 700); ctx.rotate(-0.6); ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(28, -20); ctx.lineTo(0, 40); ctx.lineTo(-28, -20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.bg0; ctx.fillRect(-2, -30, 4, 60); ctx.beginPath(); ctx.arc(0, -30, 7, 0, TAU); ctx.fill(); ctx.restore();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); const u = seg(t, s('b6', 4.2), e('b6'));
      for (let i = 0; i <= 90 * u; i++) { const x = 290 + i * 6, y = 760 + Math.sin(i * 0.6) * 8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    });
  });
  // b7–b9: the map of Austria and Hungary
  const v7 = span(t, s('b7'), DURATION, 0.7, 0.7);
  if (v7 > 0) A(v7, () => {
    const P = proj(960, 470, 16.3, 47.4, 168);
    const free = eio(seg(t, s('b8', 0.6), s('b8', 2.4)));
    poly(P, AUSTRIA); ctx.fillStyle = free > 0 ? `rgba(236,230,214,${0.06 + 0.12 * free})` : C.land; ctx.fill(); ctx.strokeStyle = C.landLine; ctx.lineWidth = 2.5; ctx.stroke();
    const pact = eio(seg(t, s('b7', 2.8), s('b7', 4.0)));
    hungary(P, { fill: pact > 0 ? `rgba(142,162,182,${0.12 + 0.16 * pact})` : C.land });
    mapNote(140, 790);
    txt('AUSTRIA', ...P([13.2, 47.15]), { size: 40, weight: 800, family: DISPLAY, color: C.soft, align: 'center', spacing: '4px' });
    txt('HUNGARY', ...P([20.2, 46.6]), { size: 40, weight: 800, family: DISPLAY, color: C.soft, align: 'center', spacing: '4px' });
    town(P, TOWN.vienna, 'Vienna', { dx: -16, align: 'right', dy: -26 });
    town(P, TOWN.budapest, 'Budapest', { dy: -26 });
    A(seg(t, s('b7', 2.8), s('b7', 3.6)) * (1 - seg(t, s('b9', 0), s('b9', 0.6))), () => chip('14 May 1955 · Warsaw Pact', ...P([20.3, 48.85]), { color: C.steel, size: 34 }));
    A(seg(t, s('b8', 0.4), s('b8', 1.2)), () => chip('15 May 1955 · Austrian State Treaty', ...P([12.6, 48.55]), { color: C.ink, size: 34 }));
    A(seg(t, s('b8', 3.4), s('b8', 4.2)), () => chip('neutral', ...P([13.2, 46.75]), { color: C.coral, size: 38 }));
    // the Soviet line of communication: the Soviet border, Budapest, Győr, Vienna
    const line = [P(TOWN.zahony), P([20.6, 47.9]), P(TOWN.budapest), P(TOWN.gyor), P(TOWN.vienna)];
    const draw = eio(seg(t, s('b9', 0.2), s('b9', 2.4))), cut = eio(seg(t, s('b9', 4.2), s('b9', 5.4)));
    A(draw, () => {
      trace(line.slice(0, 4), 1, C.steel, { w: 6, dash: [14, 10], head: false });
      A(1 - cut, () => trace(line.slice(3), 1, C.steel, { w: 6, dash: [14, 10] }));
      txtFit('Soviet lines to Austria, 1947 peace treaty', ...P([20.4, 48.85]), 760, { size: 32, weight: 700, color: C.steel, align: 'center' });
    });
    A(seg(t, s('b9', 4.2), s('b9', 5.0)), () => {
      for (const [lo, la] of [[18.3, 47.05], [20.0, 47.05]]) { const [x, y] = P([lo, la]); ctx.fillStyle = C.steel; k.rrect(x - 30, y - 14, 60, 28, 6); ctx.fill(); ctx.fillRect(x - 6, y - 26, 12, 14); ctx.fillRect(x, y - 24, 40, 6); }
      chip('Soviet troops stay', ...P([19.2, 45.5]), { color: C.steel, size: 36 });
    });
  });
}

// ---------- 3: the secret speech ----------
function partSpeech(t) {
  const RXH = 1040;
  // c1–c2: the speech
  const v1 = span(t, s('c1'), s('c3', 0.4), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    const done = sheet(250, 170, 560, 620, -0.03);
    txt('N. S. Khrushchev', -220, -230, { size: 32, weight: 700, color: C.paperSoft });
    txtFit('On the Cult of Personality', -220, -150, 460, { size: 44, weight: 800, family: DISPLAY, color: C.paperInk });
    txtFit('and Its Consequences', -220, -95, 460, { size: 44, weight: 800, family: DISPLAY, color: C.paperInk });
    ctx.fillStyle = C.paperSoft; for (let i = 0; i < 9; i++) ctx.fillRect(-220, -10 + i * 30, 380 + ((i * 41) % 70), 7);
    done();
    stamp('SECRET', 700, 700, C.red, seg(t, s('c1', 2.4), s('c1', 2.9)), { size: 52, rot: 0.12, scale: 1 + 0.3 * (1 - eout(seg(t, s('c1', 2.4), s('c1', 3.0)))) });
    heading(RXH, 220, '25 February 1956 · Moscow', 'The secret speech', '20th Congress, closed session', 1);
    ['mass arrests and executions of party members', 'the cult of one leader'].forEach((str, i) => {
      A(seg(t, s('c2', 0.6 + i * 2.6), s('c2', 1.3 + i * 2.6)), () => { ctx.fillStyle = C.coral; ctx.fillRect(RXH, 476 + i * 90, 10, 50); txtFit(str, RXH + 34, 502 + i * 90, 740, { size: 40, weight: 700 }); });
    });
  });
  // c3: the trap
  const v3 = span(t, s('c3'), s('c4', 0.4), 0.7, 0.7);
  if (v3 > 0) A(v3, () => {
    plate(560, 260, 800, 'Mátyás Rákosi', 'First Secretary', C.steel, 1, { sub: 'had copied Stalin’s cult' });
    const g = eio(seg(t, s('c3', 3.0), s('c3', 5.0)));
    A(seg(t, s('c3', 2.8), s('c3', 3.2)), () => {
      trace(smooth([[1380, 400], [1540, 540], [1240, 640], [980, 520]], 14), g, C.coral, { w: 6 });
      txtFit('to expose crimes he was responsible for', W / 2, 760, 1400, { size: 42, weight: 700, color: C.coral, align: 'center' });
    });
  });
  // c4: Rajk's charges were fabricated
  const v4 = span(t, s('c4'), s('c5', 0.4), 0.7, 0.7);
  if (v4 > 0) A(v4, () => {
    card(420, 250, 1080, 400, { line: C.cardLine });
    ctx.fillStyle = C.dark; ctx.fillRect(420, 250, 18, 400);
    txtFit('László Rajk', 500, 360, 900, { size: 80, weight: 800, family: DISPLAY });
    txtFit('foreign minister, hanged in 1949', 500, 440, 900, { size: 40, weight: 500, color: C.soft });
    txt('March 1956', 500, 300, { size: 34, weight: 700, color: C.coral });
    stamp('FABRICATED CHARGES', 960, 560, C.coral, seg(t, s('c4', 2.6), s('c4', 3.1)), { size: 52, scale: 1 + 0.4 * (1 - eout(seg(t, s('c4', 2.6), s('c4', 3.2)))) });
  });
  // c5–c9: the Petőfi Circle
  const v5 = span(t, s('c5'), s('c10', 0.4), 0.7, 0.7);
  if (v5 > 0) A(v5, () => {
    // c5: a lamp and the name
    const lamp = span(t, s('c5'), s('c7', 0.3), 0.6, 0.6);
    if (lamp > 0) A(lamp, () => {
      const x = 520, y = 250, g = ctx.createRadialGradient(x, y + 60, 10, x, y + 60, 300); g.addColorStop(0, 'rgba(224,122,95,0.35)'); g.addColorStop(1, 'rgba(224,122,95,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 320, y - 240, 640, 640);
      ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(x - 120, y + 40); ctx.lineTo(x - 60, y - 60); ctx.lineTo(x + 60, y - 60); ctx.lineTo(x + 120, y + 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y + 62, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = C.steel; ctx.fillRect(x - 3, y - 160, 6, 100);
      // listeners in c6
      const lis = seg(t, s('c6', 0.2), s('c6', 2.0));
      crowd(11, 160, 640, 720, 140, 90, lis, C.soft, 6);
      A(seg(t, s('c6', 0.4), s('c6', 1.2)), () => figure(520, 590, 170, C.coral));
      heading(RXH, 220, 'Spring 1956', 'The Petőfi Circle', null, span(t, s('c5'), s('c6', 0.2), 0.6, 0.5));
      A(span(t, s('c5', 1.0), s('c6', 0.2), 0.6, 0.5), () => { txtFit('a club of the party’s youth league', RXH, 360, 760, { size: 40, weight: 500, color: C.soft }); txtFit('named after Sándor Petőfi, poet of 1848', RXH, 420, 760, { size: 40, weight: 500, color: C.soft }); });
      heading(RXH, 220, '18 June 1956', 'Júlia Rajk speaks', null, seg(t, s('c6', 0.2), s('c6', 0.8)));
      A(seg(t, s('c6', 2.6), s('c6', 3.4)), () => { txtFit('widow of László Rajk', RXH, 360, 760, { size: 40, weight: 500, color: C.soft }); txtFit('asks that his name be cleared', RXH, 430, 760, { size: 44, weight: 700, color: C.coral }); });
    });
    // c7–c9: the press debate
    const deb = span(t, s('c7'), s('c10', 0.4), 0.6, 0.6);
    if (deb > 0) A(deb, () => {
      const hx = 160, hy = 220, hw = 520, hh = 420;
      ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.strokeRect(hx, hy, hw, hh);
      ctx.strokeStyle = C.faint; ctx.setLineDash([10, 10]); ctx.strokeRect(hx + hw + 40, hy - 40, 380, hh + 80); ctx.setLineDash([]);
      txt('hall', hx + hw / 2, hy - 30, { size: 34, weight: 700, color: C.soft, align: 'center' });
      txt('outside', hx + hw + 230, hy - 70, { size: 34, weight: 700, color: C.soft, align: 'center' });
      crowd(21, hx + 16, hy + 16, hw - 32, hh - 32, 320, seg(t, s('c7', 0.6), s('c7', 3.0)), C.ink, 5);
      crowd(22, hx + hw + 60, hy - 20, 340, hh + 40, 260, seg(t, s('c7', 2.8), s('c7', 5.0)), C.soft, 5);
      A(seg(t, s('c7', 3.4), s('c7', 4.0)), () => { speaker(hx + hw - 10, hy + 60, 40, C.coral, (t * 0.8) % 1); speaker(hx + hw - 10, hy + hh - 60, 40, C.coral, (t * 0.8 + 0.5) % 1); });
      txtFit('House of the People’s Army officers, Budapest', hx + hw / 2 + 200, hy + hh + 90, 900, { size: 32, weight: 500, color: C.soft, align: 'center' });
      heading(RXH + 120, 200, '27 June 1956', 'The press debate', null, seg(t, s('c7', 0.2), s('c7', 0.8)), { maxW: 660 });
      // c8: the count, the clock, the call for Nagy
      A(seg(t, s('c8', 0.2), s('c8', 0.9)), () => {
        txt(fmt(6000), RXH + 120, 420, { size: 110, weight: 800, family: DISPLAY, color: C.coral });
        txtFit('present, by the chairman’s count', RXH + 120, 500, 660, { size: 36, weight: 500, color: C.soft });
      });
      A(seg(t, s('c8', 3.0), s('c8', 3.6)), () => {
        const cx = RXH + 170, cy = 610, hrs = lerp(19, 25.5, eio(seg(t, s('c8', 3.0), s('c8', 5.2))));
        ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 46, 0, TAU); ctx.stroke();
        const ah = ((hrs % 12) / 12) * TAU - Math.PI / 2, am = ((hrs % 1)) * TAU - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ah) * 26, cy + Math.sin(ah) * 26); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(am) * 38, cy + Math.sin(am) * 38); ctx.stroke();
        txtFit('until 1.30 a.m.', cx + 80, cy, 520, { size: 40, weight: 700 });
      });
      A(seg(t, s('c8', 5.4), s('c8', 6.0)), () => chip('calls for Imre Nagy’s return', RXH + 120, 720, { color: C.coral, size: 36, align: 'left' }));
    });
    // c9: Andropov's report, over the hall
    const rep = span(t, s('c9'), s('c10', 0.4), 0.6, 0.6);
    if (rep > 0) A(rep, () => {
      ctx.fillStyle = 'rgba(17,20,24,0.85)'; ctx.fillRect(96, 120, 1728, 700);
      card(360, 230, 1200, 460, { line: C.steel, lw: 3 });
      txtFit('REPORT TO MOSCOW · SOVIET EMBASSY, BUDAPEST', 960, 290, 1100, { size: 32, weight: 700, color: C.steel, align: 'center', spacing: '3px' });
      txtFit('Yuri Andropov, ambassador', 960, 350, 1100, { size: 36, weight: 500, color: C.soft, align: 'center' });
      para('“a demonstration against the party leadership”', 960, 500, 1080, { size: 60, weight: 700, ink: C.ink });
      txtFit('in essence, he wrote', 960, 630, 1000, { size: 32, weight: 500, color: C.faint, align: 'center' });
    });
  });
  // c10: Poznań
  const v10 = span(t, s('c10'), s('c11', 0.4), 0.7, 0.7);
  if (v10 > 0) A(v10, () => {
    heading(RXH, 200, '28 June 1956', 'Poznań, Poland', null, 1);
    const g = eio(seg(t, s('c10', 1.0), s('c10', 4.0)));
    // a street, a march as an arrow, stopped by a line of security forces
    ctx.fillStyle = 'rgba(236,230,214,0.05)'; ctx.fillRect(140, 430, 820, 180);
    ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.strokeRect(140, 430, 820, 180);
    crowd(31, 160, 450, 320 * Math.min(1, g * 1.4) + 20, 140, 120, seg(t, s('c10', 0.6), s('c10', 2.0)), C.coral, 6);
    trace([[200, 520], [lerp(220, 700, g), 520]], 1, C.coral, { w: 12, headSize: 34 });
    A(seg(t, s('c10', 3.6), s('c10', 4.2)), () => { ctx.fillStyle = C.steel; ctx.fillRect(760, 420, 26, 200); txt('security forces', 773, 660, { size: 34, weight: 700, color: C.steel, align: 'center' }); });
    A(seg(t, s('c10', 1.2), s('c10', 1.8)), () => txtFit('workers march for better pay and conditions', RXH, 360, 760, { size: 40, weight: 700 }));
    A(seg(t, s('c10', 5.0), s('c10', 5.8)), () => txtFit('dozens killed', RXH, 450, 760, { size: 44, weight: 700, color: C.soft }));
  });
  // c11: the Circle condemned
  const v11 = span(t, s('c11'), DURATION, 0.7, 0.7);
  if (v11 > 0) A(v11, () => {
    card(460, 220, 1000, 440, { bg: C.paper, line: null, r: 8 });
    txtFit('RESOLUTION', 960, 300, 900, { size: 44, weight: 800, family: DISPLAY, color: C.paperInk, align: 'center', spacing: '6px' });
    txtFit('MDP Central Leadership · 30 June 1956', 960, 360, 900, { size: 34, weight: 600, color: C.paperSoft, align: 'center' });
    ctx.fillStyle = C.paperSoft; for (let i = 0; i < 4; i++) ctx.fillRect(560, 420 + i * 30, 800 - (i % 2) * 120, 7);
    stamp('condemns the Petőfi Circle', 960, 590, '#465a6e', seg(t, s('c11', 1.6), s('c11', 2.1)), { size: 44, rot: -0.04 });
    A(seg(t, s('c11', 3.6), s('c11', 4.4)), () => txtFit('the debates stop', 960, 740, 900, { size: 40, weight: 700, color: C.soft, align: 'center' }));
  });
}

// ---------- 4: a new face ----------
function partFace(t) {
  const RXH = 1040;
  // d1: Mikoyan to Budapest
  const v1 = span(t, s('d1'), s('d2', 0.4), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    journey(t, [880, 340], [260, 640], 'Moscow', 'Budapest', eio(seg(t, s('d1', 2.2), s('d1', 4.2))), C.steel, { labelTo: C.ink });
    heading(RXH, 260, 'July 1956', 'Moscow sends', 'Anastas Mikoyan', 1);
  });
  // d2–d3: one name plate out, another in
  const v2 = span(t, s('d2'), s('d4', 0.4), 0.7, 0.7);
  if (v2 > 0) A(v2, () => {
    txtFit('FIRST SECRETARY', W / 2, 200, 1000, { size: 40, weight: 800, family: DISPLAY, color: C.soft, align: 'center', spacing: '6px' });
    const out = eio(seg(t, s('d2', 3.0), s('d2', 4.6))), inn = eio(seg(t, s('d3', 0.2), s('d3', 1.6)));
    A(1 - out, () => plate(560 + out * 400, 270, 800, 'Mátyás Rákosi', 'resigns, 18 July 1956', C.steel, 1, { sub: 'his health, and his mistakes' }));
    A(seg(t, s('d2', 4.2), s('d2', 5.0)) * (1 - seg(t, s('d3', 0.0), s('d3', 0.6))), () => { trace([[1300, 520], [1700, 640]], 1, C.steelDim, { w: 4, dash: [10, 10] }); txt('to the Soviet Union', 1700, 690, { size: 34, weight: 700, color: C.steel, align: 'right' }); });
    A(inn, () => plate(560 - (1 - inn) * 500, 520, 800, 'Ernő Gerő', 'the new First Secretary', C.steel, 1, { sub: 'for years Rákosi’s partner in running the economy' }));
  });
  // d4: new men, and the telegram
  const v4 = span(t, s('d4'), s('d5', 0.4), 0.7, 0.7);
  if (v4 > 0) A(v4, () => {
    // the old team stays (a stack of grey plates), one new man joins
    for (let i = 3; i >= 0; i--) A(0.5 + 0.12 * (3 - i), () => card(160 + i * 26, 250 + i * 34, 700, 130, { line: C.steelDim, lw: 2 }));
    txtFit('Ernő Gerő and the old team', 200, 315, 620, { size: 40, weight: 700, color: C.steel });
    A(seg(t, s('d4', 0.6), s('d4', 1.4)), () => plate(160 + eout(seg(t, s('d4', 0.6), s('d4', 1.6))) * 60, 520, 700, 'János Kádár', 'new in the Politburo', C.coral, 1, { sub: 'once Rákosi’s prisoner' }));
    A(seg(t, s('d4', 3.2), s('d4', 4.0)), () => {
      card(RXH, 200, 760, 520, { bg: C.paper, line: null, r: 6 });
      txtFit('TELEGRAM · US LEGATION, BUDAPEST', RXH + 380, 260, 680, { size: 32, weight: 800, color: C.paperInk, align: 'center', spacing: '2px' });
      txtFit('19 JULY 1956', RXH + 380, 306, 680, { size: 32, weight: 700, color: C.paperSoft, align: 'center', spacing: '2px' });
      txtFit('“Number 1 Stalinist Rakosi out”', RXH + 380, 400, 680, { size: 38, weight: 700, color: C.paperInk, align: 'center' });
      txtFit('“old gang with exception Rakosi', RXH + 380, 500, 680, { size: 42, weight: 800, color: C.paperInk, align: 'center' });
      txtFit('still there”', RXH + 380, 556, 680, { size: 42, weight: 800, color: C.paperInk, align: 'center' });
      ctx.fillStyle = C.coral; ctx.fillRect(RXH + 120, 600, 520 * eout(seg(t, s('d4', 5.0), s('d4', 6.0))), 6);
      txtFit('in the original English', RXH + 380, 670, 680, { size: 32, weight: 500, color: C.paperSoft, align: 'center' });
    });
  });
  // d5: Gerő's speech, and no crackdown
  const v5 = span(t, s('d5'), s('d6', 0.4), 0.7, 0.7);
  if (v5 > 0) A(v5, () => {
    plate(200, 230, 720, 'Ernő Gerő', 'his first speech', C.steel, 1);
    A(seg(t, s('d5', 0.8), s('d5', 1.6)), () => { chip('Petőfi Circle: a tool of the enemy', 200, 480, { color: C.steel, size: 38, align: 'left' }); });
    // a fist of force that never lands: an arrow that falters and fades
    const g = eio(seg(t, s('d5', 1.8), s('d5', 3.6))), fade = seg(t, s('d5', 4.0), s('d5', 5.4));
    A(1 - fade * 0.8, () => trace([[1000, 560], [lerp(1000, 1440, g), 560 - 20 * g]], 1, C.steel, { w: 12, headSize: 36, dash: [22, 14] }));
    A(seg(t, s('d5', 4.6), s('d5', 5.4)), () => txtFit('no strength to crack down', 1240, 680, 800, { size: 44, weight: 700, color: C.coral, align: 'center' }));
    // the Circle's lamp, still lit
    const x = 1620, y = 520; ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(x - 60, y + 20); ctx.lineTo(x - 30, y - 30); ctx.lineTo(x + 30, y - 30); ctx.lineTo(x + 60, y + 20); ctx.closePath(); ctx.fill();
    const gl = ctx.createRadialGradient(x, y + 30, 5, x, y + 30, 140); gl.addColorStop(0, 'rgba(224,122,95,0.3)'); gl.addColorStop(1, 'rgba(224,122,95,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 150, y - 110, 300, 300);
  });
  // d6: families below the subsistence minimum
  const v6 = span(t, s('d6'), DURATION, 0.7, 0.7);
  if (v6 > 0) A(v6, () => {
    heading(200, 190, '1956', 'Life stayed hard', null, 1, { maxW: 1500 });
    txtFit('families with three children', 200, 390, 1400, { size: 44, weight: 700 });
    const g = eio(seg(t, s('d6', 3.2), s('d6', 5.4))), x0 = 200, x1 = 1720, y = 470;
    ctx.fillStyle = C.ghost; ctx.fillRect(x0, y, x1 - x0, 90);
    ctx.fillStyle = C.coral; ctx.fillRect(x0, y, (x1 - x0) * 0.5 * g, 90);
    A(seg(t, s('d6', 5.2), s('d6', 5.8)), () => {
      const xm = lerp(x0, x1, 0.5); ctx.fillStyle = C.ink; ctx.fillRect(xm - 2, y - 24, 4, 138);
      txt('half', xm, y - 46, { size: 32, weight: 700, color: C.soft, align: 'center' });
      trace([[xm + 10, y + 45], [xm + 120, y + 45]], 1, C.coral, { w: 8 });
      txt('more than half', xm + 150, y + 47, { size: 40, weight: 800, color: C.coral });
    });
    A(seg(t, s('d6', 5.8), s('d6', 6.6)), () => txtFit('below the subsistence minimum', 200, 640, 1400, { size: 44, weight: 700, color: C.ink }));
    txtFit('a trade union survey', 200, 710, 1400, { size: 34, weight: 500, color: C.faint });
  });
}

// ---------- 5: burying an era ----------
const COFFINS = ['László Rajk', 'Tibor Szőnyi', 'András Szalai', 'György Pálffy'];
function partEra(t) {
  const RXH = 1040;
  // e1–e4: the cemetery
  const v1 = span(t, s('e1'), s('e5', 0.4), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    const crowdU = seg(t, s('e3', 0.0), s('e3', 3.0));
    crowd(41, 110, 560, 1700, 200, 900, crowdU, 'rgba(236,230,214,0.55)', 4);
    // trees
    for (let i = 0; i < 9; i++) { const x = 140 + i * 205, hgt = 120 + (i % 3) * 40; ctx.fillStyle = 'rgba(63,127,82,0.32)'; ctx.beginPath(); ctx.ellipse(x, 300 - hgt * 0.4, 70, hgt * 0.7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(236,230,214,0.12)'; ctx.fillRect(x - 4, 300, 8, 90); }
    // the catafalque and four coffins
    ctx.fillStyle = 'rgba(236,230,214,0.08)'; ctx.fillRect(420, 470, 1080, 30);
    COFFINS.forEach((name, i) => {
      const x = 510 + i * 260, g = eout(seg(t, s('e1', 0.8 + i * 0.5), s('e1', 1.6 + i * 0.5)));
      A(g, () => {
        ctx.fillStyle = C.dark; ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 100, 470); ctx.lineTo(x - 90, 410); ctx.lineTo(x + 90, 410); ctx.lineTo(x + 100, 470); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.fillRect(x - 80, 418, 160, 6);
        // a wreath
        ctx.strokeStyle = C.green; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(x, 535, 24, 0, TAU); ctx.stroke();
        A(seg(t, s('e2', 1.0 + i * 1.3), s('e2', 1.6 + i * 1.3)), () => txtFit(name, x, 372, 240, { size: 32, weight: 700, color: i === 0 ? C.coral : C.ink, align: 'center' }));
      });
    });
    A(span(t, s('e1', 0.2), s('e3', 0.2), 0.6, 0.6), () => txtFit('Kerepesi cemetery, Budapest', W / 2, 160, 1500, { size: 52, weight: 800, family: DISPLAY, align: 'center' }));
    A(span(t, s('e1', 0.2), s('e2', 0.4), 0.6, 0.6), () => {
      txtFit('the anniversary of the martyrs of Arad, 1849', W / 2, 225, 1500, { size: 38, weight: 500, color: C.soft, align: 'center' });
    });
    A(span(t, s('e2', 0.6), s('e3', 0.2), 0.6, 0.6), () => txtFit('victims of the 1949 show trials, reburied', W / 2, 225, 1500, { size: 38, weight: 500, color: C.soft, align: 'center' }));
    // e3: the estimates, as a range
    A(span(t, s('e3', 1.0), s('e4', 0.2), 0.6, 0.6), () => {
      txtFit('How many came? Estimates differ', W / 2, 170, 1500, { size: 46, weight: 800, family: DISPLAY, align: 'center' });
      const x0 = 460, x1 = 1460, y = 250, g = eio(seg(t, s('e3', 1.4), s('e3', 3.0)));
      ctx.fillStyle = C.ghost; ctx.fillRect(x0, y - 4, x1 - x0, 8);
      ctx.fillStyle = C.coral; ctx.fillRect(x0, y - 7, (x1 - x0) * g, 14);
      txt(fmt(100000), x0, y + 44, { size: 38, weight: 800, color: C.ink, align: 'center' });
      A(seg(g, 0.9, 1), () => txt(fmt(350000), x1, y + 44, { size: 38, weight: 800, color: C.ink, align: 'center' }));
    });
    // e4: the words
    A(span(t, s('e4', 0.2), s('e5', 0.4), 0.7, 0.6), () => {
      ctx.fillStyle = 'rgba(17,20,24,0.7)'; ctx.fillRect(96, 110, 1728, 250);
      txtFit('Béla Szász, tried with Rajk in 1949', W / 2, 160, 1500, { size: 38, weight: 500, color: C.soft, align: 'center' });
      A(seg(t, s('e4', 3.0), s('e4', 3.8)), () => txtFit('“to bury an era”', W / 2, 260, 1500, { size: 92, weight: 800, family: DISPLAY, color: C.coral, align: 'center' }));
    });
  });
  // e5–e6: Nagy and Júlia Rajk; the students; Nagy back in the party
  const v5 = span(t, s('e5'), s('e7', 0.4), 0.7, 0.7);
  if (v5 > 0) A(v5, () => {
    figure(380, 620, 300, C.coral); figure(560, 620, 280, C.ink);
    txt('Imre Nagy', 380, 680, { size: 34, weight: 700, color: C.coral, align: 'center' });
    txt('Júlia Rajk', 560, 680, { size: 34, weight: 700, align: 'center' });
    A(span(t, s('e5'), s('e6', 0.2), 0.6, 0.6), () => {
      heading(RXH, 200, '6 October 1956', 'Sympathy for the widow', null, 1);
      A(seg(t, s('e5', 3.6), s('e5', 4.4)), () => {
        const g = eio(seg(t, s('e5', 3.8), s('e5', 6.4)));
        crowd(51, RXH, 470, 300 + 400 * g, 120, 80, g * 1.2, C.coral, 6);
        trace([[RXH, 600], [RXH + 100 + 600 * g, 600]], 1, C.coral, { w: 8 });
        txtFit('students march against Stalinism', RXH, 680, 760, { size: 38, weight: 700 });
      });
    });
    A(seg(t, s('e6', 0.0), s('e6', 0.6)), () => {
      heading(RXH, 200, '14 October 1956', 'Back in the party', null, 1);
      chip('no place in government', RXH, 470, { color: C.steel, size: 40, align: 'left' });
    });
  });
  // e7–e10: Szeged, then the map widens to Warsaw
  const v7 = span(t, s('e7'), DURATION, 0.7, 0.7);
  if (v7 > 0) A(v7, () => {
    const z = eio(seg(t, s('e8', 0.2), s('e8', 2.6)));
    const P = proj(lerp(520, 500, z), lerp(470, 500, z), lerp(19.5, 19.4, z), lerp(47.17, 49.1, z), lerp(150, 85, z));
    hungary(P);
    mapNote(140, 790);
    town(P, TOWN.budapest, 'Budapest', { dy: -28, size: lerp(34, 32, z) });
    const sz = seg(t, s('e7', 0.6), s('e7', 1.4));
    A(sz, () => town(P, TOWN.szeged, 'Szeged', { col: C.coral, dy: 30, ring: (t * 0.6) % 1 }));
    A(span(t, s('e7'), s('e8', 0.4), 0.6, 0.6), () => {
      heading(RXH, 200, '16 October 1956', 'MEFESZ', null, 1, { color: C.coral, size: 96 });
      txtFit('Federation of Hungarian University', RXH, 380, 760, { size: 36, weight: 500, color: C.soft });
      txtFit('and College Students’ Associations', RXH, 424, 760, { size: 36, weight: 500, color: C.soft });
      A(seg(t, s('e7', 3.6), s('e7', 4.4)), () => chip('outside the party’s youth league', RXH, 530, { color: C.ink, size: 36, align: 'left' }));
      A(seg(t, s('e7', 6.0), s('e7', 6.8)), () => chip('leaders the students chose', RXH, 630, { color: C.coral, size: 36, align: 'left' }));
    });
    // Poland: Warsaw, the Soviet leaders flying in, Gomułka, Moscow giving way
    A(seg(t, s('e8', 1.6), s('e8', 2.6)), () => {
      const wa = town(P, TOWN.warsaw, 'Warsaw', { dx: -18, dy: -24, align: 'right', col: C.ink });
      txt('POLAND', wa[0] - 18, wa[1] + 24, { size: 34, weight: 800, family: DISPLAY, color: C.soft, align: 'right', spacing: '4px' });
      const fly = eio(seg(t, s('e8', 2.8), s('e8', 4.6))), back = eio(seg(t, s('e9', 2.6), s('e9', 4.4)));
      const from = [960, wa[1] - 10], path = smooth([from, [790, wa[1] - 22], [wa[0] + 24, wa[1] - 2]], 16);
      A(1 - back * 0.85, () => trace(path, fly * (1 - back * 0.8), C.steel, { w: 6, dash: [14, 10] }));
      A(fly, () => txt('from Moscow', 960, wa[1] - 54, { size: 32, weight: 700, color: C.steel, align: 'right' }));
      A(seg(t, s('e9', 0.4), s('e9', 1.2)), () => chip('Gomułka', wa[0] - 40, wa[1] + 92, { color: C.coral, size: 36, align: 'right' }));
      // e10: the spark from Warsaw to Budapest
      const sp = eio(seg(t, s('e10', 0.6), s('e10', 2.6))), bp = P(TOWN.budapest);
      A(seg(t, s('e10', 0.4), s('e10', 0.8)), () => trace(smooth([[wa[0] + 6, wa[1] + 18], [wa[0] + 110, (wa[1] + bp[1]) / 2], [bp[0] + 12, bp[1] - 22]], 16), sp, C.coral, { w: 6 }));
      if (sp > 0.96) flame(bp[0], bp[1] - 12, 14, t, 0);
    });
    A(seg(t, s('e8', 0.6), s('e8', 1.4)) * (1 - seg(t, s('e9', 0), s('e9', 0.5))), () => heading(RXH, 200, '19 October 1956', 'News from Poland', 'Soviet leaders fly in unannounced', 1));
    A(seg(t, s('e9', 0.2), s('e9', 0.8)) * (1 - seg(t, s('e10', 0), s('e10', 0.5))), () => heading(RXH, 200, '21 October 1956', 'Władysław Gomułka', 'elected party leader; Moscow gives way', 1));
    A(seg(t, s('e10', 0.2), s('e10', 0.8)), () => {
      heading(RXH, 200, 'UN Special Committee, 1957', '“the catalyst”', null, 1, { color: C.coral, size: 80 });
      txtFit('for which Hungarians had been,', RXH, 380, 760, { size: 38, weight: 500, color: C.soft });
      txtFit('half consciously, waiting', RXH, 428, 760, { size: 38, weight: 500, color: C.soft });
    });
  });
}

// ---------- 6: the sixteen points, and the recap ----------
const POINTS = [
  ['1', 'All Soviet troops out', 'f3'], ['3', 'A new government under Imre Nagy', 'f4'], ['5', 'Free elections, several parties', 'f4'],
  ['4', 'Rákosi to be tried', 'f5'], ['12', 'Free press, free radio', 'f5'], ['13', 'The Stalin statue down', 'f5'], ['14', 'The Kossuth coat of arms', 'f5'],
];
const POINT_AT = { f3: [0.8], f4: [0.4, 3.0], f5: [0.3, 1.9, 3.2, 4.6] };
const pointAt = (i) => { const key = POINTS[i][2]; return s(key, POINT_AT[key][POINTS.filter((p, j) => j < i && p[2] === key).length]); };
// The Budapest of 23 October, schematic: the Danube, the Technical University, the Bem statue.
const BP = { river: [[19.058, 47.548], [19.05, 47.53], [19.046, 47.515], [19.044, 47.5], [19.048, 47.492], [19.056, 47.486], [19.066, 47.479], [19.076, 47.467], [19.08, 47.455]],
  bme: [19.0558, 47.4815], bem: [19.0388, 47.5108], route: [[19.0558, 47.4815], [19.05, 47.488], [19.0425, 47.4965], [19.0405, 47.503], [19.0388, 47.5108]] };
function partPoints(t) {
  const RXH = 1040;
  // f1: the hall fills
  const v1 = span(t, s('f1'), s('f2', 0.6), 0.7, 0.7);
  if (v1 > 0) A(v1, () => {
    ctx.strokeStyle = C.soft; ctx.lineWidth = 4; ctx.strokeRect(160, 200, 760, 560);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = C.ghost; ctx.fillRect(180 + i * 124, 210, 30, 540); }
    crowd(61, 190, 230, 700, 500, 700, seg(t, s('f1', 0.8), s('f1', 4.4)), C.ink, 4);
    heading(RXH, 220, 'Monday 22 October 1956', 'Technical University', 'Budapest, the great hall', 1);
    A(seg(t, s('f1', 4.0), s('f1', 4.8)), () => { txt('more than', RXH, 520, { size: 40, weight: 500, color: C.soft }); txt(fmt(2000), RXH, 600, { size: 96, weight: 800, family: DISPLAY, color: C.coral }); txt('people', RXH + textW(fmt(2000), { size: 96, weight: 800, family: DISPLAY }) + 24, 610, { size: 44, weight: 700 }); });
  });
  // f2–f5: the list grows, and its points
  const v2 = span(t, s('f2'), s('f6', 0.4), 0.7, 0.7);
  if (v2 > 0) A(v2, () => {
    // ten, fourteen, sixteen: the numbers come at the end of the line, in both languages
    const L2 = e('f2') - s('f2'), t14 = s('f2', 0.74 * L2), t16 = s('f2', 0.9 * L2);
    const n = t < t14 ? 10 : t < t16 ? 14 : 16;
    const grow = t < t14 ? 0 : t < t16 ? seg(t, t14, t14 + 0.5) : 1 + seg(t, t16, t16 + 0.5);
    const sh = 360 + grow * 60;
    const done = sheet(160, 150, 560, sh + 160, -0.02);
    txtFit('THE 16 POINTS', -200, -sh / 2 - 30, 400, { size: 38, weight: 800, family: DISPLAY, color: C.paperInk, spacing: '2px' });
    for (let i = 0; i < n; i++) { const y = -sh / 2 + 30 + i * ((sh + 40) / 17); ctx.fillStyle = POINTS.some((p, j) => Number(p[0]) === i + 1 && t > pointAt(j)) ? C.coral : C.paperSoft; ctx.fillRect(-200, y, 360 + ((i * 37) % 60), 7); }
    done();
    A(span(t, s('f2', 0.4), s('f3', 0.2), 0.6, 0.5), () => {
      txt(String(n), RXH + 120, 420, { size: 240, weight: 800, family: DISPLAY, color: C.coral, align: 'center' });
      txt('points', RXH + 120, 590, { size: 48, weight: 700, align: 'center' });
      chip('joining MEFESZ', RXH + 120, 690, { color: C.ink, size: 36 });
    });
    POINTS.forEach(([num, str, key], i) => {
      const at = pointAt(i);
      const g = eout(seg(t, at, at + 0.7)), y = 200 + i * 86;
      A(g, () => {
        txt(num, RXH - 20, y, { size: 44, weight: 800, family: DISPLAY, color: C.coral, align: 'right' });
        txtFit(str, RXH + 10 + (1 - g) * 20, y, 780, { size: 44, weight: 700 });
      });
    });
  });
  // f6: the two taboos
  const v6 = span(t, s('f6'), s('f7', 0.4), 0.7, 0.7);
  if (v6 > 0) A(v6, () => {
    const brk = eio(seg(t, s('f6', 5.2), s('f6', 6.4)));
    txtFit('TWO TABOOS', W / 2, 170, 1200, { size: 52, weight: 800, family: DISPLAY, align: 'center', spacing: '4px' });
    rule(W / 2, 210, 300);
    ['the Soviet troops', 'the one-party state'].forEach((str, i) => {
      const x = 600 + i * 720, y = 470, g = seg(t, s('f6', 1.4 + i * 1.4), s('f6', 2.0 + i * 1.4));
      A(g, () => {
        // a padlock that springs open
        const col = brk > 0 ? C.coral : C.steel;
        ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x, y - 60 - brk * 40, 62, Math.PI, 0); ctx.lineTo(x + 62, y - 60 + (1 - brk) * 40 - brk * 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 62, y - 60 - brk * 40); ctx.lineTo(x - 62, y - 20); ctx.stroke();
        ctx.fillStyle = col; k.rrect(x - 100, y - 30, 200, 160, 18); ctx.fill();
        ctx.fillStyle = C.bg0; ctx.beginPath(); ctx.arc(x, y + 40, 16, 0, TAU); ctx.fill(); ctx.fillRect(x - 6, y + 40, 12, 40);
        txtFit(str, x, y + 200, 560, { size: 44, weight: 700, align: 'center' });
      });
    });
    A(seg(t, s('f6', 0.4), s('f6', 1.0)) * (1 - brk), () => txtFit('the Petőfi Circle: never touched', W / 2, 790, 1400, { size: 38, weight: 700, color: C.steel, align: 'center' }));
    A(brk, () => txtFit('the students: broke both', W / 2, 790, 1400, { size: 38, weight: 700, color: C.coral, align: 'center' }));
  });
  // f7–f8: the radio refuses; dictated and copied
  const v7 = span(t, s('f7'), s('f9', 0.4), 0.7, 0.7);
  if (v7 > 0) A(v7, () => {
    microphone(480, 560, 260, C.soft);
    A(span(t, s('f7', 0.8), s('f8', 0.2), 0.5, 0.5), () => {
      ctx.strokeStyle = C.steel; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(340, 280); ctx.lineTo(620, 600); ctx.moveTo(620, 280); ctx.lineTo(340, 600); ctx.stroke(); ctx.lineCap = 'butt';
      heading(RXH, 220, 'Hungarian Radio', 'Not on air', null, 1, { color: C.steel });
      A(seg(t, s('f7', 3.6), s('f7', 4.4)), () => chip('the students refuse any cuts', RXH, 470, { color: C.coral, size: 38, align: 'left' }));
    });
    A(seg(t, s('f8', 0.0), s('f8', 0.6)), () => {
      heading(RXH, 220, null, 'Dictated, written down, copied', null, 1);
      for (let i = 0; i < 22; i++) {
        const u = eout(seg(t, s('f8', 1.6 + i * 0.12), s('f8', 3.4 + i * 0.12))); if (u <= 0) continue;
        const R = rng((i + 1) * 104729 + 17); R(); R(); const tx = RXH + 40 + R() * 700, ty = 420 + R() * 340;
        A(u, () => paperIcon(tx - 80 * (1 - u), ty, 70, 92, (R() - 0.5) * 0.6));
      }
      txtFit('by hand and typewriter', RXH, 370, 760, { size: 40, weight: 500, color: C.soft });
    });
  });
  // f9–f10: Budapest, the Bem statue, the march called
  const v9 = span(t, s('f9'), s('g1', 0.6), 0.7, 0.7);
  if (v9 > 0) A(v9, () => {
    const P = proj(560, 470, 19.05, 47.4975, 8200);
    ctx.save(); ctx.beginPath(); ctx.rect(110, 110, 900, 720); ctx.clip();
    ctx.fillStyle = 'rgba(236,230,214,0.03)'; ctx.fillRect(110, 110, 900, 720);
    ctx.strokeStyle = C.river; ctx.lineWidth = 24; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; poly(P, smooth(BP.river.map((p) => p), 8).map((p) => p), false); ctx.stroke(); ctx.lineCap = 'butt';
    // two bridges, Margaret Island
    ctx.strokeStyle = C.faint; ctx.lineWidth = 6; for (const [a, b] of [[[19.036, 47.514], [19.054, 47.513]], [[19.058, 47.4755], [19.075, 47.4815]]]) { ctx.beginPath(); ctx.moveTo(...P(a)); ctx.lineTo(...P(b)); ctx.stroke(); }
    const [mx, my] = P([19.049, 47.527]); ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(mx, my, 14, 70, -0.15, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.ghost; ctx.lineWidth = 2; ctx.strokeRect(110, 110, 900, 720);
    txt('BUDA', ...P([19.005, 47.522]), { size: 44, weight: 800, family: DISPLAY, color: C.faint, align: 'center', spacing: '6px' });
    txt('PEST', ...P([19.1, 47.522]), { size: 44, weight: 800, family: DISPLAY, color: C.faint, align: 'center', spacing: '6px' });
    txt('Danube', ...P([19.09, 47.457]), { size: 32, weight: 600, color: C.river, align: 'center' });
    mapNote(130, 800);
    town(P, BP.bme, 'Technical University', { dx: -18, dy: 34, align: 'right', col: C.ink, size: 34 });
    const bem = town(P, BP.bem, 'Bem statue', { dx: -18, dy: -30, align: 'right', col: C.coral, size: 36 });
    heading(RXH, 200, 'Writers’ Union', 'A wreath for General Bem', null, span(t, s('f9'), s('f10', 0.2), 0.6, 0.6));
    A(span(t, s('f9', 2.6), s('f10', 0.2), 0.6, 0.6), () => { txtFit('Józef Bem: a Pole,', RXH, 380, 760, { size: 40, weight: 500, color: C.soft }); txtFit('a hero of Hungary’s war of 1848–49', RXH, 430, 760, { size: 40, weight: 500, color: C.soft }); });
    // the wreath at the statue
    A(seg(t, s('f9', 1.6), s('f9', 2.4)), () => { ctx.strokeStyle = C.green; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(bem[0], bem[1], 22, 0, TAU); ctx.stroke(); });
    const r = eio(seg(t, s('f10', 0.8), s('f10', 4.0)));
    A(seg(t, s('f10', 0.6), s('f10', 1.0)), () => trace(BP.route.map(P), r, C.coral, { w: 8, dash: [16, 12] }));
    A(seg(t, s('f10', 0.2), s('f10', 0.8)), () => {
      heading(RXH, 200, 'Called for 23 October, 2.30 p.m.', 'A silent march', 'in sympathy with Poland', 1);
    });
  });
  // g1: the recap above the road
  const vg = span(t, s('g1'), s('g2', 0.4), 0.7, 0.7);
  if (vg > 0) A(vg, () => {
    const [c, sp] = view(t), X = (d) => lerp(RX0, RX1, (d - (c - sp / 2)) / sp);
    const steps = [[D(1953, 7, 4), 'a new course', 0.8], [D(1955, 4, 18), 'its fall', 1.8], [D(1956, 2, 25), 'a secret speech', 2.8], [D(1956, 10, 6), 'a funeral', 3.8], [D(1956, 10, 22), 'sixteen points', 4.8]];
    steps.forEach(([d, str, at], i) => {
      const g = eout(seg(t, s('g1', at), s('g1', at + 0.7))), x = X(d), y = 720 - i * 120;
      A(g, () => {
        ctx.strokeStyle = i === 4 ? C.coral : C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 32); ctx.lineTo(x, RY - 18); ctx.stroke();
        const w = textW(str, { size: 40, weight: 700 }), cx = Math.min(RX1 - w / 2 - 30, Math.max(RX0 + w / 2 + 30, x));
        chip(str, cx, y, { color: i === 4 ? C.coral : C.ink, size: 40 });
      });
    });
  });
  // g2: the judgement
  const v2g = span(t, s('g2'), s('g3', 0.4), 0.7, 0.7);
  if (v2g > 0) A(v2g, () => {
    txtFit('The country would not go on living the old way;', W / 2, 340, 1600, { size: 54, weight: 700, align: 'center' });
    A(seg(t, s('g2', 3.4), s('g2', 4.2)), () => txtFit('the regime no longer had the strength to defend it.', W / 2, 430, 1600, { size: 54, weight: 700, color: C.coral, align: 'center' }));
    txtFit('Attila Szakolczai, 1956 Institute', W / 2, 560, 1400, { size: 36, weight: 500, color: C.soft, align: 'center' });
  });
  // g3: on to the next day
  const v3g = span(t, s('g3'), DURATION, 0.7, 0.7);
  if (v3g > 0) A(v3g, () => {
    const g = eio(seg(t, s('g3', 2.4), s('g3', 4.4)));
    txt('23 October 1956', W / 2, 250, { size: 64, weight: 800, family: DISPLAY, align: 'center' });
    // the students set off: a quiet line of figures walking right
    const walk = seg(t, s('g3', 0.2), DURATION);
    A(seg(t, s('g3', 0.2), s('g3', 1.2)), () => { for (let i = 0; i < 16; i++) figure(520 + i * 62 + walk * 260 + (i % 2) * 8, 700 - (i % 3) * 10, 110 + (i % 4) * 8, i % 5 === 2 ? C.coral : C.soft); });
    A(seg(t, s('g3', 2.2), s('g3', 3.0)), () => {
      trace([[RX1 - 40, RY], [RX1 - 40 + 100 * g, RY]], 1, C.coral, { w: 6, dash: [12, 8] });
      txt('next: the freedom fight', W / 2, 340, { size: 44, weight: 700, color: C.coral, align: 'center' });
    });
  });
}

// ---------- title cards and credits ----------
const CARD_DATES = ['1953–1954', '1954–1955', 'February–June 1956', 'July–September 1956', '6–21 October 1956', '22 October 1956'];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.9, () => { ctx.fillStyle = 'rgba(14,16,20,0.94)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.9)), y = 470 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 130, { size: 36, weight: 700, color: C.coral, align: 'center', spacing: '8px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1560, 118, { weight: 800, family: DISPLAY, spacing: '2px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '2px' });
      rule(W / 2, y + 80, 360, 1, p);
      if (CARD_DATES[i]) txt(CARD_DATES[i], W / 2, y + 160, { size: 44, weight: 500, color: C.soft, align: 'center' });
    });
  });
}
const MUSIC = ['“Overheat” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Lightless Dawn” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  '1956 Institute: Attila Szakolczai, Crisis and the search for a way out, 1953–56;',
  'The sixteen points of the Technical University, 22 October 1956;',
  'UN Special Committee on the Problem of Hungary, Report (1957);',
  'FRUS 1955–57, vol. XXV: US Legation in Budapest, 19 July 1956;',
  'The Petőfi Circle’s debates (1956 Institute); Betekintő; Hungarian Review; Wikipedia.',
  'Map of Hungary: the series’ outline; all other maps schematic.',
];
function credits(t) {
  ctx.drawImage(BG, 0, 0);
  ctx.fillStyle = 'rgba(14,16,20,0.6)'; ctx.fillRect(0, 0, W, H);
  flag(W / 2 - 48, 96, 96);
  txt('THE ROAD TO 23 OCTOBER', W / 2, 230, { size: fit('THE ROAD TO 23 OCTOBER', 1600, 76, { weight: 800, family: DISPLAY, spacing: '2px' }), weight: 800, family: DISPLAY, align: 'center', spacing: '2px' });
  txt('Hungary 1956 · original animation', W / 2, 300, { size: 40, weight: 500, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 390, { size: 32, weight: 800, color: C.coral, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 440 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 570, { size: 32, weight: 800, color: C.coral, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 620 + j * 46, 1700, { size: 32, weight: 500, align: 'center', color: j > 4 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partNew, partBack, partSpeech, partFace, partEra, partPoints];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    drawRoad(t, seg(t, s('o1', 0.4), s('o1', 1.6)) * (1 - seg(t, e('g3', 1.4), e('g3', 2.4))));
    titleCards(t);
    A(seg(t, e('g3', 1.4), e('g3', 2.4)), () => credits(t));
  },
});
