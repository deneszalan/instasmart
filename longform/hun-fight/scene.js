// "The freedom fight, 23 October to 4 November" („A szabadságharc, október 23. – november 4.”): the long film of
// Hungary 1956's section The freedom fight, 16:9, 1920x1080. Twelve days, 23 October to 3 November 1956.
// Look (the series' look): deep ink ground with a faint paper grain, painted once; Archivo for titles and cards,
// Alegreya Sans for everything else; the 1956 flag with the hole as the emblem (title and credits) and a thin tricolour
// rule under chapter titles. This film's accent is green (#5fae74), its motif a ribbon of the twelve days along the top,
// which lights up the day each scene happens on. Budapest and Hungary as schematic maps (Hungary from the series'
// outline), Soviet tanks as plain grey shapes, crowds as pale dots, movements as arrows; no weapons, no fire, no
// falling figures; the lynchings at Köztársaság tér are told in words only.
// The same scene plays the Hungarian version: kit.js swaps every whole string for its labels-fr.json entry, so words
// and numbers are drawn as separate strings; Kit.fmt writes 200 000 in Hungarian.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt, clamp } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const at = (key, f) => lerp(T[key][0], T[key][1], f); // a fraction of the way through a line
const TAU = Math.PI * 2;

const C = {
  ink: '#ece6d6', soft: 'rgba(236,230,214,0.74)', faint: 'rgba(236,230,214,0.24)', ghost: 'rgba(236,230,214,0.09)',
  red: '#c63a32', white: '#ece6d6', green: '#3f7f52', accent: '#5fae74', accentDim: 'rgba(95,174,116,0.30)', accentInk: '#0f1a13',
  soviet: '#8d969f', sovietDk: '#5a6168', fire: '#c9634f', amber: '#d7a24a', blue: '#7fa7c9',
  river: '#1f3a4f', riverHi: '#2c5069', land: '#1a1f25', road: 'rgba(236,230,214,0.13)', block: '#232931', blockHi: '#2c333c',
  card: 'rgba(15,18,22,0.94)', panel: 'rgba(22,26,31,0.92)', bgDeep: '#0e1114',
};
const DISPLAY = 'Archivo', TEXT = 'Alegreya Sans';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, weight = 500, family = TEXT, color = C.ink, align = 'left', spacing = '0px', base = 'middle', halo = 0 } = {}) {
  k.font(weight, size, family);
  if (halo) {
    ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = spacing;
    ctx.lineJoin = 'round'; ctx.lineWidth = halo; ctx.strokeStyle = 'rgba(14,17,20,0.9)'; ctx.strokeText(str, x, y); ctx.letterSpacing = '0px';
  }
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 500, family = TEXT, spacing = '0px' } = {}) {
  k.font(weight, size, family); ctx.letterSpacing = spacing; const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** The largest size up to `size` at which str fits in maxW. */
function fit(str, maxW, size, o = {}) { let z = size; while (z > 26 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A rounded label as wide as its text. */
function chip(str, x, y, { color = C.ink, bg = C.panel, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, fill = null, ink = null } = {}) {
  const w = textW(str, { size, weight, family }), pad = size * 0.6, h = size * 1.62;
  const x0 = align === 'left' ? x : align === 'right' ? x - w - pad * 2 : x - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, y - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = fill ?? bg; ctx.fill();
    if (line && !fill) { ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, y + 1, { size, weight, color: ink ?? color, align: 'center', family });
  });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.panel, r = 16, line = null, lw = 3 } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
function arrowHead(x, y, ang, col, size = 22) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size, y + Math.sin(ang + 2.5) * size);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size, y + Math.sin(ang - 2.5) * size);
  ctx.closePath(); ctx.fill();
}
/** A polyline drawn up to fraction u of its length, with an arrow head at the tip. Returns the tip. */
function trace(pts, u, col, { w = 7, dash = null, head = true, headSize = 20 } = {}) {
  if (u <= 0 || pts.length < 2) return pts[0];
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = u * tot, tip = pts[0], ang = 0;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / L[i - 1]);
    tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(...tip); left -= L[i - 1];
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = 'butt';
  if (head) arrowHead(tip[0] + Math.cos(ang) * 4, tip[1] + Math.sin(ang) * 4, ang, col, headSize);
  return tip;
}
/** A point a fraction u along a polyline, with its heading. */
function along(pts, u) {
  let tot = 0; const L = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let left = clamp(u) * tot;
  for (let i = 1; i < pts.length; i++) {
    if (left <= L[i - 1] || i === pts.length - 1) {
      const f = L[i - 1] ? Math.min(1, left / L[i - 1]) : 0;
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])];
    }
    left -= L[i - 1];
  }
  return [...pts.at(-1), 0];
}
/** Deterministic pseudo-random numbers. */
function rng(seed) { let r = seed >>> 0 || 1; return () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A crowd as pale dots in an ellipse; `n` dots, the first `fill` fraction shown. */
const CROWDS = new Map();
function crowd(cx, cy, rx, ry, n, fill, { col = C.ink, a = 1, seed = 7, r = 4 } = {}) {
  const key = `${n}:${seed}`;
  if (!CROWDS.has(key)) { const R = rng(seed); CROWDS.set(key, Array.from({ length: n }, () => { const ang = R() * TAU, d = Math.sqrt(R()); return [Math.cos(ang) * d, Math.sin(ang) * d, R()]; })); }
  const pts = CROWDS.get(key), m = Math.floor(n * clamp(fill));
  A(a, () => { ctx.fillStyle = col; for (let i = 0; i < m; i++) { const [u, v, w] = pts[i]; ctx.globalAlpha = a * (0.55 + 0.45 * w); ctx.beginPath(); ctx.arc(cx + u * rx, cy + v * ry, r, 0, TAU); ctx.fill(); } });
}
/** A tank as a plain shape: hull, turret, a short barrel; optionally a small tricolour on the turret. */
function tank(x, y, ang, { sc = 1, col = C.soviet, a = 1, flag = 0 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
    ctx.fillStyle = col; k.rrect(-24, -14, 48, 28, 6); ctx.fill();
    ctx.fillStyle = C.sovietDk; k.rrect(-24, -14, 48, 6, 3); ctx.fill(); k.rrect(-24, 8, 48, 6, 3); ctx.fill();
    ctx.fillStyle = C.sovietDk; ctx.beginPath(); ctx.arc(-3, 0, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.sovietDk; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(26, 0); ctx.stroke();
    if (flag > 0) {
      ctx.rotate(-ang); ctx.globalAlpha *= flag;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-3, -34); ctx.stroke();
      ['#c63a32', '#ece6d6', '#3f7f52'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-2, -34 + i * 5, 22, 5); });
    }
    ctx.restore();
  });
}
/** The 1956 flag: red, white, green; `hole` 0–1 opens the round hole in the white band, `crest` shows the crest there. */
function flag(x, y, w, { hole = 1, crest = 0, a = 1, cut = 0 } = {}) {
  const h = w * 2 / 3, bh = h / 3, cx = x + w / 2, cy = y + h / 2, R = bh * 0.44;
  A(a, () => {
    ctx.fillStyle = C.red; ctx.fillRect(x, y, w, bh);
    ctx.fillStyle = C.green; ctx.fillRect(x, y + 2 * bh, w, bh);
    ctx.beginPath(); ctx.rect(x, y + bh, w, bh);
    if (hole > 0) ctx.arc(cx, cy, R * hole, 0, TAU, true);
    ctx.fillStyle = C.white; ctx.fill('evenodd');
    if (crest > 0) {
      A(crest, () => {
        const r = R * 1.02;
        ctx.fillStyle = '#ece6d6'; ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, TAU); ctx.fill();
        ctx.fillStyle = '#86a7c2'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.08, r * 0.62, r * 0.72, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#c9a94a'; ctx.lineWidth = Math.max(2, r * 0.14);
        for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.08, r * 0.8, r * 0.86, 0, sgn < 0 ? 0.55 * Math.PI : 0.12 * Math.PI, sgn < 0 ? 1.12 * Math.PI : 0.45 * Math.PI); ctx.stroke(); }
        star(cx, cy - r * 0.7, r * 0.24, C.red);
        ctx.fillStyle = '#c9a94a'; ctx.fillRect(cx - r * 0.05, cy - r * 0.18, r * 0.1, r * 0.62); ctx.fillRect(cx - r * 0.22, cy - r * 0.22, r * 0.44, r * 0.12);
        ctx.fillStyle = '#3f7f52'; ctx.fillRect(cx - r * 0.5, cy + r * 0.62, r * 1.0, r * 0.12);
      });
    }
    if (cut > 0) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, -Math.PI / 2, -Math.PI / 2 + TAU * cut); ctx.stroke(); ctx.setLineDash([]);
    }
  });
}
function star(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r, an = -Math.PI / 2 + (i * Math.PI) / 5; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill();
}
/** The series' thin tricolour rule. */
function tricolour(cx, y, seg = 64, h = 5) { ['#c63a32', '#ece6d6', '#3f7f52'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(cx - seg * 1.5 + i * seg, y, seg, h); }); }
/** A simple respectful figure: a head and a rounded body. */
function figure(x, y, sc, col, a = 1) {
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 46 * sc, 13 * sc, 0, TAU); ctx.fill();
    k.rrect(x - 17 * sc, y - 30 * sc, 34 * sc, 52 * sc, 15 * sc); ctx.fill();
  });
}
function radioIcon(x, y, sc, col, a = 1) {
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(x - 46 * sc, y - 28 * sc, 92 * sc, 58 * sc, 10 * sc); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 18 * sc, y + 1 * sc, 15 * sc, 0, TAU); ctx.stroke();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = col; ctx.fillRect(x + 8 * sc, y - 12 * sc + i * 11 * sc, 26 * sc, 4 * sc); }
    ctx.beginPath(); ctx.moveTo(x - 24 * sc, y - 28 * sc); ctx.lineTo(x + 12 * sc, y - 52 * sc); ctx.stroke();
  });
}
/** A ring that pulses outwards: a place where something happened (never a shot). */
function pulse(x, y, t, t0, col, { r0 = 10, r1 = 46, period = 1.8, a = 1 } = {}) {
  if (t < t0) return;
  for (let j = 0; j < 2; j++) {
    const p = ((t - t0) / period + j / 2) % 1;
    A(a * (1 - p) * 0.9, () => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, lerp(r0, r1, p), 0, TAU); ctx.stroke(); });
  }
}

// ---------- the background, painted once: deep ink with a faint paper grain ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createLinearGradient(0, 0, W * 0.3, H); gr.addColorStop(0, '#181c22'); gr.addColorStop(1, '#111418');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), d = img.data, R = rng(1956);
  for (let i = 0; i < d.length; i += 4) { const n = (R() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
  g.putImageData(img, 0, 0);
  // paper fibres
  g.lineWidth = 1;
  for (let i = 0; i < 420; i++) {
    const x = R() * W, y = R() * H, l = 10 + R() * 40, an = R() * Math.PI;
    g.strokeStyle = `rgba(236,230,214,${0.012 + R() * 0.02})`;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an) * l * 0.5 + 4, y + Math.sin(an) * l * 0.5 - 3, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.32)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- the motif: a ribbon of the twelve days ----------
const DAYS = [23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3];
const RIB = { x0: 330, x1: 1824, y: 138, h: 46 };
const CW = (RIB.x1 - RIB.x0) / 13; // twelve days and room for 4 November
const cellX = (i) => RIB.x0 + CW * (i + 0.5);
// [line, from day, to day, seconds into the line, transition]; days are 0 (23 October) to 11 (3 November)
const RIBK = [
  ['o3', 0, 0, 0, 0.1], ['o3', 0, 11, 0.6, 2.6],
  ['a1', 0, 0, 0, 0.6], ['b1', 1, 1, 0, 0.6], ['b3', 1, 5, 0.4, 1.2],   ['c1', 2, 2, 0, 0.6], ['c9', 3, 3, 0, 0.6], ['d1', 1, 7, 0.3, 1.2], ['d5', 7, 7, 0, 0.6],
  ['e1', 4, 4, 0, 0.6], ['e2', 5, 5, 0, 0.6], ['e4', 6, 6, 0, 0.6], ['e4', 7, 7, 2.6, 0.6],
  ['f1', 8, 8, 0, 0.6], ['f6', 9, 9, 0, 0.6], ['f10', 10, 10, 0, 0.6], ['f11', 11, 11, 0, 0.6], ['g1', 0, 11, 0.3, 1.6],
].map(([key, lo, hi, d, tr]) => ({ t: s(key, d), lo, hi, tr }));
function ribState(t) {
  let prev = RIBK[0], cur = RIBK[0];
  for (const kf of RIBK) { if (kf.t <= t) { prev = cur; cur = kf; } }
  const u = eio(seg(t, cur.t, cur.t + cur.tr));
  return { lo: lerp(prev.lo, cur.lo, u), hi: lerp(prev.hi, cur.hi, u) };
}
function ribbon(t, a) {
  if (a <= 0) return;
  const { lo, hi } = ribState(t);
  const y0 = RIB.y - RIB.h / 2, nov = seg(t, s('g5', 0.6), s('g5', 1.8));
  A(a, () => {
    txt('1956', 96, RIB.y + 2, { size: 44, weight: 800, family: DISPLAY, color: C.ink });
    txt('OCTOBER', (cellX(0) + cellX(8)) / 2, 90, { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '5px' });
    txt('NOVEMBER', (cellX(9) + cellX(11)) / 2, 90, { size: 32, weight: 700, color: C.soft, align: 'center', spacing: '5px' });
    ctx.fillStyle = C.faint; ctx.fillRect(cellX(8) + CW / 2 - 1, 76, 2, 92);
    DAYS.forEach((d, i) => {
      const x = cellX(i) - CW / 2 + 5, past = i < lo - 0.5;
      k.rrect(x, y0, CW - 10, RIB.h, 8);
      ctx.fillStyle = past ? 'rgba(95,174,116,0.16)' : 'rgba(236,230,214,0.035)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = past ? 'rgba(95,174,116,0.4)' : C.faint; ctx.stroke();
    });
    // the highlight
    const x0 = cellX(lo) - CW / 2 + 5, x1 = cellX(hi) + CW / 2 - 5;
    k.rrect(x0, y0, x1 - x0, RIB.h, 8); ctx.fillStyle = C.accent; ctx.fill();
    DAYS.forEach((d, i) => {
      const on = i >= lo - 0.5 && i <= hi + 0.5;
      txt(String(d), cellX(i), RIB.y + 2, { size: 32, weight: 700, family: DISPLAY, align: 'center', color: on ? C.accentInk : C.soft });
    });
    // 4 November, at the very end: the next film
    if (nov > 0) A(eout(nov), () => {
      const x = cellX(12) - CW / 2 + 5;
      k.rrect(x, y0, CW - 10, RIB.h, 8); ctx.fillStyle = 'rgba(141,150,159,0.25)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.soviet; ctx.stroke();
      txt('4', cellX(12), RIB.y + 2, { size: 32, weight: 700, family: DISPLAY, align: 'center', color: C.ink });
    });
  });
}

// ---------- maps ----------
// Hungary: the series' outline (lon, lat), projected here.
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE_HU = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const TOWN = {
  budapest: [19.04, 47.5], debrecen: [21.63, 47.53], mosonmo: [17.27, 47.87], gyor: [17.635, 47.687], miskolc: [20.78, 48.1], pecs: [18.23, 46.07],
  szeged: [20.15, 46.25], veszprem: [17.91, 47.09], sopron: [16.59, 47.68], szfvar: [18.41, 47.19], szolnok: [20.18, 47.17], salgo: [19.8, 48.1],
  nyiregyhaza: [21.72, 47.95], kaposvar: [17.8, 46.36], zalaeg: [16.84, 46.84], szombathely: [16.62, 47.23], eger: [20.38, 47.9], bekescs: [21.1, 46.68],
  baja: [18.96, 46.18], tatabanya: [18.4, 47.58], szekszard: [18.71, 46.35], komlo: [18.26, 46.19], dunapentele: [18.935, 46.96], cegled: [19.8, 47.17],
  zahony: [22.18, 48.41],
};
function mkHu(x0, y0, w) {
  const kx = w / ((23.0 - 16.0) * 0.68);
  const P = (ll) => [x0 + (ll[0] - 16.0) * 0.68 * kx, y0 + (48.65 - ll[1]) * kx];
  P.h = 2.95 * kx; P.w = w;
  return P;
}
function hungary(P, a, { fill = C.land, label = true } = {}) {
  A(a, () => {
    ctx.beginPath(); OUTLINE.forEach((ll, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(ll))); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = C.riverHi; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); DANUBE_HU.forEach((ll, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(ll))); ctx.stroke();
    if (label) { const [x, y] = P([16.2, 45.85]); txt('schematic map', x, y, { size: 32, weight: 500, color: C.faint }); }
  });
}
function town(P, ll, name, a, { dx = 16, dy = 0, align = 'left', col = C.ink, r = 8, size = 32, weight = 600 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (name) txt(name, x + dx, y + dy, { size, weight, align, color: col === C.ink ? C.ink : col, halo: 6 });
  });
}

// Budapest: a schematic map from rounded coordinates, seen through a moving camera.
const BP = {
  parliament: [19.0462, 47.5072], bem: [19.0372, 47.5136], petofi: [19.0500, 47.4930], bme: [19.0540, 47.4808], radio: [19.0641, 47.4910],
  astoria: [19.0602, 47.4934], corvin: [19.0705, 47.4856], stalin: [19.0832, 47.5072], szena: [19.0275, 47.5084], moricz: [19.0470, 47.4777],
  baross: [19.0835, 47.5000], koztarsasag: [19.0817, 47.4962], csepel: [19.0720, 47.4370], akademia: [19.0470, 47.5023], ujpest: [19.0850, 47.5610],
  tokol: [18.9650, 47.3210], cityPark: [19.0890, 47.5145], deak: [19.0548, 47.4977],
};
const DANUBE_N = [[19.072, 47.600], [19.060, 47.575], [19.048, 47.552], [19.041, 47.538], [19.040, 47.525], [19.043, 47.514], [19.041, 47.507], [19.0415, 47.499],
  [19.046, 47.4915], [19.053, 47.4865], [19.0605, 47.4795], [19.0665, 47.4725], [19.0715, 47.4655], [19.0735, 47.458]];
const DANUBE_W = [[19.0735, 47.458], [19.060, 47.446], [19.045, 47.432], [19.030, 47.415], [19.010, 47.395], [18.985, 47.370], [18.955, 47.345], [18.935, 47.320], [18.925, 47.280]];
const DANUBE_E = [[19.0735, 47.458], [19.085, 47.450], [19.097, 47.435], [19.104, 47.410], [19.108, 47.380], [19.110, 47.340], [19.105, 47.300]];
const MARGIT = [[19.0405, 47.5150], [19.0445, 47.5210], [19.0478, 47.5290], [19.0462, 47.5312], [19.0432, 47.5262], [19.0395, 47.5175]];
const ROADS = [
  [[19.0490, 47.5133], [19.0565, 47.5105], [19.0630, 47.5050], [19.0705, 47.4965], [19.0712, 47.4862], [19.0640, 47.4790]], // Grand Boulevard
  [[19.0548, 47.4977], [19.0602, 47.4934], [19.0610, 47.4895], [19.0582, 47.4868]], // Small Boulevard
  [[19.0602, 47.4934], [19.0705, 47.4965], [19.0835, 47.5000]], // Rákóczi út
  [[19.0610, 47.4895], [19.0712, 47.4860], [19.0860, 47.4800], [19.1150, 47.4680]], // Üllői út
  [[19.0560, 47.5000], [19.0630, 47.5050], [19.0775, 47.5150]], // Andrássy út
  [[19.0775, 47.5150], [19.0835, 47.5070], [19.0880, 47.5005]], // Dózsa György út
  [[19.0548, 47.4977], [19.0545, 47.5050], [19.0490, 47.5133]], // Bajcsy-Zsilinszky út
  [[19.0372, 47.5136], [19.0300, 47.5100], [19.0275, 47.5084], [19.0230, 47.5000]], // Buda: towards Széna tér
  [[19.0410, 47.5131], [19.0490, 47.5133]], [[19.0395, 47.4995], [19.0480, 47.4990]], [[19.0420, 47.4915], [19.0515, 47.4905]], // bridges
  [[19.0510, 47.4855], [19.0598, 47.4870]], [[19.0585, 47.4770], [19.0662, 47.4785]],
];
const VIEWS = {
  centre: { lon: 19.055, lat: 47.4975, k: 150 },
  city: { lon: 19.058, lat: 47.478, k: 62 },
  south: { lon: 19.02, lat: 47.414, k: 33 },
  astoria: { lon: 19.054, lat: 47.5005, k: 205 },
};
const MAPR = { x: 640, y: 200, w: 1184, h: 790 };
function mkBp(v, r = MAPR) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  const P = (ll) => [cx + (ll[0] - v.lon) * 75.25 * v.k, cy - (ll[1] - v.lat) * 111.2 * v.k];
  P.k = v.k; P.r = r;
  return P;
}
const mixView = (a, b, u) => ({ lon: lerp(a.lon, b.lon, u), lat: lerp(a.lat, b.lat, u), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), u)) });
/** Draw inside a map's frame only. */
function clipTo(r, fn) { ctx.save(); k.rrect(r.x, r.y, r.w, r.h, 18); ctx.clip(); fn(); ctx.restore(); }
function budapest(P, a, { roads = 1, label = true, night = 0 } = {}) {
  const r = P.r;
  A(a, () => {
    ctx.save(); k.rrect(r.x, r.y, r.w, r.h, 18); ctx.clip();
    ctx.fillStyle = C.land; ctx.fillRect(r.x, r.y, r.w, r.h);
    // City Park
    const [px, py] = P(BP.cityPark); ctx.fillStyle = 'rgba(63,127,82,0.16)'; ctx.beginPath(); ctx.ellipse(px, py, 0.55 * P.k, 0.6 * P.k, 0, 0, TAU); ctx.fill();
    // roads
    if (roads > 0) A(roads, () => {
      ctx.strokeStyle = C.road; ctx.lineWidth = Math.max(3, P.k * 0.045); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const rd of ROADS) { ctx.beginPath(); rd.forEach((ll, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(ll))); ctx.stroke(); }
    });
    // the Danube
    ctx.strokeStyle = C.river; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [pts, wd] of [[DANUBE_N, 0.42], [DANUBE_W, 0.42], [DANUBE_E, 0.18]]) {
      ctx.lineWidth = Math.max(8, wd * P.k); ctx.beginPath(); pts.forEach((ll, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(ll))); ctx.stroke();
    }
    ctx.fillStyle = C.land; ctx.beginPath(); MARGIT.forEach((ll, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(ll))); ctx.closePath(); ctx.fill();
    if (night > 0) A(night, () => { ctx.fillStyle = 'rgba(5,7,10,0.55)'; ctx.fillRect(r.x, r.y, r.w, r.h); });
    ctx.restore();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; k.rrect(r.x, r.y, r.w, r.h, 18); ctx.stroke();
    if (label) txt('schematic map', r.x + r.w - 24, r.y + r.h - 30, { size: 32, weight: 500, color: C.faint, align: 'right' });
  });
}
function riverLabels(P, a) {
  A(a, () => {
    const [bx, by] = P([19.025, 47.4925]), [qx, qy] = P([19.075, 47.5015]);
    const r = P.r, inside = (x, y) => x > r.x + 40 && x < r.x + r.w - 40 && y > r.y + 30 && y < r.y + r.h - 30;
    if (inside(bx, by)) txt('BUDA', bx, by, { size: 34, weight: 800, family: DISPLAY, color: C.faint, align: 'center', spacing: '6px' });
    if (inside(qx, qy)) txt('PEST', qx, qy, { size: 34, weight: 800, family: DISPLAY, color: C.faint, align: 'center', spacing: '6px' });
  });
}
function place(P, ll, name, a, { dx = 18, dy = 0, align = 'left', col = C.ink, r = 9, size = 32, weight = 600 } = {}) {
  if (a <= 0) return;
  const [x, y] = P(ll);
  A(a, () => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.bgDeep; ctx.lineWidth = 2.5; ctx.stroke();
    if (name) txt(name, x + dx, y + dy, { size, weight, align, color: col, halo: 7 });
  });
}

// ---------- the left column: the time and a few words ----------
const LX = 96, LW = 500;
function stamp(time, label, a, { y = 280, sub = null, col = C.accent } = {}) {
  A(a, () => {
    txtFit(time, LX, y, LW, { size: 64, weight: 800, family: DISPLAY, color: col });
    if (label) txtFit(label, LX, y + 70, LW, { size: 40, weight: 700 });
    if (sub) txtFit(sub, LX, y + 122, LW, { size: 34, weight: 500, color: C.soft });
  });
}
/** A small card in the left column with a heading and lines. */
function noteCard(x, y, w, head, lines, a, { col = C.accent, size = 34 } = {}) {
  const h = 74 + lines.length * size * 1.3 + 10;
  A(a, () => {
    card(x, y, w, h, { line: col, bg: C.panel });
    txtFit(head, x + 28, y + 42, w - 56, { size: 34, weight: 800, color: col, spacing: '2px' });
    lines.forEach((l, i) => txtFit(l, x + 28, y + 92 + i * size * 1.3, w - 56, { size, weight: 500 }));
  });
  return h;
}

// ---------- cold open ----------
function partOpen(t) {
  // the flag: it has its hole (o1); the crest that was cut out (o2); then it becomes the title's emblem
  const toTitle = eio(seg(t, e('o3', 0.2), e('o3', 1.4)));
  const shrink = eio(seg(t, s('o3', 0), s('o3', 1.2)));
  const w0 = lerp(720, 420, shrink), x0 = lerp(W / 2 - 360, W / 2 - 210, shrink), y0 = lerp(330, 300, shrink);
  const fw = lerp(w0, 150, toTitle), fx = lerp(x0, W / 2 - 75, toTitle), fy = lerp(y0, 238, toTitle);
  const crest = span(t, s('o2', 0.1), s('o2', 3.0), 0.7, 0.8), cut = seg(t, s('o2', 0.9), s('o2', 2.2));
  const hole = 1 - crest;
  A(seg(t, 0.3, s('o1', 0.8)), () => flag(fx, fy, fw, { hole: Math.max(0.001, hole), crest, cut: cut * (1 - seg(t, s('o2', 2.4), s('o2', 3.0))) }));
  A(span(t, s('o1', 0.8), s('o2', 0.1), 0.6, 0.5), () => txt('23 October 1956 · Budapest', W / 2, 860, { size: 40, weight: 700, color: C.soft, align: 'center' }));
  A(span(t, s('o2', 0.6), at('o2', 0.52), 0.5, 0.4), () => chip('the Communist crest, cut out', W / 2, 860, { color: C.ink, size: 36 }));
  // by midnight: a march, then an uprising
  const mu = span(t, at('o2', 0.56), s('o3', 0.3), 0.5, 0.5);
  A(mu, () => {
    const w1 = chip('3 p.m. · a march', W / 2 - 60, 860, { color: C.ink, size: 36, align: 'right' });
    arrowHead(W / 2 + 6, 860, 0, C.accent, 22); ctx.fillStyle = C.accent; ctx.fillRect(W / 2 - 46, 857, 46, 6);
    chip('midnight · an uprising', W / 2 + 60, 860, { color: C.accent, size: 36, align: 'left' });
  });
  // twelve days: fighting, councils, a new government
  ['fighting', 'councils', 'a new government'].forEach((w, i) => {
    const a = span(t, s('o3', 1.0 + i * 0.9), e('o3', 0.4), 0.5, 0.5);
    chip(w, W / 2 + (i - 1) * 420, 690, { color: C.accent, size: 38, a });
  });
  // the title, until the first chapter card
  const ti = seg(t, e('o3', 0.9), e('o3', 2.0));
  A(eout(ti), () => {
    txt('THE FREEDOM FIGHT', W / 2, 420, { size: 34, weight: 700, color: C.accent, align: 'center', spacing: '8px' });
    const l1 = 'THE FREEDOM FIGHT,', l2 = '23 OCTOBER TO 4 NOVEMBER';
    txt(l1, W / 2, 530 + (1 - eout(ti)) * 16, { size: fit(l1, 1600, 116, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, align: 'center' });
    txt(l2, W / 2, 650 + (1 - eout(ti)) * 16, { size: fit(l2, 1600, 76, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, align: 'center', color: C.ink });
    tricolour(W / 2, 724, 70, 6);
    txt('Hungary 1956', W / 2, 800, { size: 40, weight: 500, color: C.soft, align: 'center' });
  });
}

// ---------- 1: a march becomes an uprising (23 October) ----------
// the routes, schematic: from the Petőfi statue across the Margaret Bridge, and from the university along the Buda bank
const R_PEST = [BP.petofi, [19.0480, 47.4995], [19.0478, 47.5070], [19.0490, 47.5131], [19.0410, 47.5131], BP.bem];
const R_BUDA = [BP.bme, [19.0505, 47.4860], [19.0430, 47.4930], [19.0388, 47.5000], [19.0362, 47.5080], BP.bem];
const R_PARL = [BP.bem, [19.0410, 47.5131], [19.0490, 47.5131], [19.0478, 47.5095], BP.parliament];
const R_CSEPEL = [[19.0760, 47.4765], [19.0700, 47.4830], BP.radio];
const R_UJPEST = [[19.0740, 47.5180], [19.0690, 47.5060], [19.0660, 47.4990], BP.radio];
function partOct23(t) {
  const P = mkBp(VIEWS.centre);
  const ma = seg(t, s('a1', 0.4), s('a1', 1.6));
  budapest(P, ma);
  riverLabels(P, ma);
  // a1: the sixteen points
  noteCard(LX, 220, LW, '16 POINTS', ['· Soviet troops out', '· free elections', '· Imre Nagy in government'], span(t, s('a1', 0.4), s('a2', 0.2), 0.6, 0.5));
  A(span(t, s('a1', 0.8), s('a2', 0.2), 0.6, 0.5), () => txt('Technical University, 22 October', LX, 520, { size: 32, weight: 500, color: C.soft }));
  place(P, BP.bme, 'Technical University', span(t, s('a1', 1.2), s('a3', 0.4), 0.6, 0.6), { dx: -18, align: 'right', col: C.soft });
  // a2: 3 p.m., the marches set off; a3: they meet at the Bem statue
  stamp('3 p.m.', 'the march sets off', span(t, s('a2', 0.3), s('a3', 0.3), 0.5, 0.4), { sub: 'banned, then allowed' });
  const mp = eio(seg(t, at('a2', 0.45), e('a3', -0.6)));
  if (t < s('a5')) {
    A(1 - seg(t, s('a4', 0.4), s('a4', 1.2)), () => { trace(R_PEST.map(P), mp, C.accent, { w: 6, dash: [12, 9] }); trace(R_BUDA.map(P), mp, C.accent, { w: 6, dash: [12, 9] }); });
  }
  place(P, BP.petofi, 'Petőfi statue', span(t, at('a2', 0.4), s('a4', 0.4), 0.5, 0.6), { col: C.ink });
  place(P, BP.bem, 'Bem statue', span(t, s('a3', 0.2), s('a5', 0.2), 0.5, 0.6), { dx: -18, align: 'right', col: C.accent });
  A(span(t, s('a3', 0.8), s('a4', 0.2), 0.6, 0.5), () => {
    flag(LX, 300, 240, { hole: 1 });
    txt('the flag with the hole', LX, 500, { size: 40, weight: 700 });
  });
  // a4: 6 p.m., the crowd at Parliament
  const pa = span(t, s('a4', 0.2), s('a8', 0.3), 0.5, 0.6);
  const pg = eio(seg(t, s('a4', 0.2), s('a4', 1.4)));
  A(pa, () => { trace(R_PARL.map(P), pg, C.accent, { w: 6, dash: [12, 9] }); });
  const [kx, ky] = P(BP.parliament);
  crowd(kx + 30, ky - 6, 64, 46, 140, seg(t, s('a4', 1.0), e('a4', -0.5)), { a: pa, seed: 11, r: 3.5 });
  place(P, BP.parliament, 'Parliament', span(t, s('a4', 0.4), s('a8', 0.3), 0.5, 0.6), { dx: 78, dy: 30, col: C.ink });
  A(span(t, s('a4', 0.4), s('a5', 0.1), 0.5, 0.5), () => {
    txt('6 p.m.', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.accent });
    txt('at least', LX, 350, { size: 36, weight: 500, color: C.soft });
    txtFit(fmt(200000), LX, 420, LW, { size: 88, weight: 800, family: DISPLAY });
    txt('perhaps', LX, 492, { size: 36, weight: 500, color: C.soft });
    txtFit(fmt(300000), LX, 548, LW, { size: 60, weight: 800, family: DISPLAY, color: C.soft });
    txtFit('the UN committee’s estimate', LX, 620, LW, { size: 32, weight: 500, color: C.soft });
  });
  // a5: Gerő at 8 p.m.; a6: Nagy about 9; a7: the Stalin statue
  A(span(t, s('a5', 0.2), s('a6', 0.1), 0.5, 0.5), () => {
    txt('8 p.m.', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.accent });
    radioIcon(LX + 60, 420, 1.1, C.ink);
    txtFit('Ernő Gerő, party leader', LX, 530, LW, { size: 38, weight: 700 });
    txtFit('condemns', LX, 584, LW, { size: 34, weight: 500, color: C.soft });
    txtFit('“nationalist demonstrations”', LX, 636, LW, { size: 38, weight: 700, color: C.fire });
  });
  A(span(t, s('a6', 0.2), s('a7', 0.1), 0.5, 0.5), () => {
    txt('about 9 p.m.', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('Imre Nagy, on a balcony', LX, 360, LW, { size: 40, weight: 700 });
    txtFit('asks the crowd to go home', LX, 414, LW, { size: 34, weight: 500, color: C.soft });
  });
  pulse(kx, ky, t, s('a6', 0.3), C.accent, { a: span(t, s('a6', 0.3), s('a7', 0.2), 0.3, 0.4) });
  const [sx, sy] = P(BP.stalin);
  const fall = eio(seg(t, s('a7', 1.4), s('a7', 2.8)));
  A(span(t, s('a7', 0.2), s('a8', 0.3), 0.5, 0.6), () => {
    txt('about 9.30 p.m.', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('the Stalin statue', LX, 360, LW, { size: 40, weight: 700 });
    txtFit('pulled down, Dózsa György út', LX, 414, LW, { size: 34, weight: 500, color: C.soft });
    // the statue as a block on its plinth, tipping over
    ctx.fillStyle = C.soft; ctx.fillRect(sx - 22, sy - 8, 44, 16);
    ctx.save(); ctx.translate(sx + 14, sy - 8); ctx.rotate(fall * Math.PI * 0.48);
    ctx.fillStyle = C.ink; ctx.fillRect(-36, -66, 22, 66); ctx.restore();
    txt('Stalin statue', sx + 30, sy + 40, { size: 32, weight: 600, halo: 7 });
  });
  // a8–a10: the Radio
  const ra = span(t, s('a8', 0.1), e('a12', 0.6), 0.6, 0.6);
  const [rx, ry] = P(BP.radio);
  A(ra, () => {
    ctx.fillStyle = C.blockHi; ctx.strokeStyle = C.fire; ctx.lineWidth = 3; k.rrect(rx - 26, ry - 18, 52, 36, 5); ctx.fill(); ctx.stroke();
    txt('the Radio', rx + 36, ry - 30, { size: 34, weight: 700, halo: 7 });
  });
  A(span(t, s('a8', 0.2), s('a9', 0.1), 0.5, 0.5), () => {
    txt('THE RADIO', LX, 280, { size: 60, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('Bródy Sándor utca', LX, 352, LW, { size: 40, weight: 700 });
    txtFit('guarded by the ÁVH', LX, 406, LW, { size: 36, weight: 600, color: C.fire });
    txtFit('the students’ demands', LX, 470, LW, { size: 34, weight: 500, color: C.soft });
    txtFit('not broadcast', LX, 516, LW, { size: 34, weight: 500, color: C.soft });
  });
  crowd(rx - 36, ry + 34, 40, 22, 50, seg(t, s('a8', 0.6), s('a8', 2.0)), { a: span(t, s('a8', 0.4), e('a12', 0.6), 0.5, 0.6), seed: 23, r: 3.5 });
  pulse(rx, ry, t, s('a9', 0.6), C.fire, { a: span(t, s('a9', 0.6), e('a10', 0.4), 0.3, 0.5), r1: 54 });
  A(span(t, s('a9', 0.2), s('a10', 0.1), 0.5, 0.5), () => {
    txt('after 9 p.m.', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.fire });
    txtFit('tear gas, then shots', LX, 360, LW, { size: 40, weight: 700 });
    txtFit('from the building', LX, 414, LW, { size: 34, weight: 500, color: C.soft });
    txtFit('the first dead in Budapest', LX, 478, LW, { size: 34, weight: 600, color: C.ink });
  });
  noteCard(LX, 230, LW, 'DOCUMENTED', ['the firing began', 'about 9 p.m.'], span(t, s('a10', 0.2), s('a12', 0.1), 0.5, 0.5), { col: C.ink });
  noteCard(LX, 460, LW, 'DISPUTED', ['who fired the first shot,', 'and on whose order'], span(t, at('a10', 0.45), s('a12', 0.1), 0.5, 0.5), { col: C.fire });
  // a12: the night: soldiers join, workers bring arms, Soviet tanks
  const na = span(t, s('a12', 0.1), e('a12', 1.0), 0.5, 0.6);
  A(na, () => {
    txt('the night', LX, 280, { size: 64, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('of 23–24 October', LX, 350, LW, { size: 40, weight: 700 });
  });
  chip('soldiers join the crowd', LX, 450, { color: C.accent, size: 34, align: 'left', a: span(t, s('a12', 0.4), e('a12', 1.0), 0.4, 0.6) });
  chip('workers bring arms', LX, 540, { color: C.accent, size: 34, align: 'left', a: span(t, at('a12', 0.35), e('a12', 1.0), 0.4, 0.6) });
  chip('Soviet tanks, before dawn', LX, 630, { color: C.soviet, size: 34, align: 'left', a: span(t, at('a12', 0.7), e('a12', 1.0), 0.4, 0.6) });
  const wg = eio(seg(t, at('a12', 0.35), at('a12', 0.75)));
  A(na, () => {
    trace(R_CSEPEL.map(P), wg, C.accent, { w: 5, dash: [10, 8] }); trace(R_UJPEST.map(P), wg, C.accent, { w: 5, dash: [10, 8] });
    const [cx1, cy1] = P(R_CSEPEL[0]), [ux1, uy1] = P(R_UJPEST[0]);
    A(wg, () => { txt('from Csepel', cx1 - 20, cy1 + 4, { size: 32, weight: 600, color: C.accent, halo: 7, align: 'right' }); txt('from Újpest', ux1 + 20, uy1 - 6, { size: 32, weight: 600, color: C.accent, halo: 7 }); });
  });
  const tg = eio(seg(t, at('a12', 0.7), e('a12', 0.9)));
  if (tg > 0) clipTo(MAPR, () => {
    const r = MAPR;
    [[r.x + r.w + 30, r.y + 140, Math.PI * 0.9], [r.x + r.w + 30, r.y + r.h - 140, Math.PI * 1.1]].forEach(([x, y, an], i) =>
      tank(x + Math.cos(an) * 150 * tg, y + Math.sin(an) * 150 * tg, an, { a: na * tg, sc: 1.1 }));
  });
}

// ---------- 2: tanks in the streets (24–28 October) ----------
const HUBIG = mkHu(150, 230, 1000);
const GROUPS = [BP.corvin, BP.baross, BP.szena, BP.moricz, BP.csepel, [19.0760, 47.4800], [19.0660, 47.4780]];
const AVENUES = [ROADS[0], ROADS[2], ROADS[3]];
function partFight(t) {
  // b1: the Soviet troops in Hungary
  const b1 = span(t, s('b1', 0), s('b2', 0.2), 0.6, 0.6);
  if (b1 > 0) {
    hungary(HUBIG, b1);
    town(HUBIG, TOWN.budapest, 'Budapest', b1, { dx: 16, dy: -30 });
    const g = eio(seg(t, s('b1', 0.8), s('b1', 3.0)));
    [[TOWN.szfvar, 'Székesfehérvár'], [TOWN.cegled, 'Cegléd']].forEach(([ll, n], i) => {
      town(HUBIG, ll, n, b1, { col: C.soviet, dx: i ? 16 : -16, dy: 34, align: i ? 'left' : 'right' });
      A(b1, () => trace([HUBIG(ll), HUBIG(TOWN.budapest)], g, C.soviet, { w: 6, dash: [12, 9] }));
    });
    A(b1, () => {
      const x = 1290;
      txt('Soviet troops', x, 330, { size: 40, weight: 700, color: C.soviet });
      txt('already in Hungary', x, 378, { size: 34, weight: 500, color: C.soft });
      txt(fmt(20000), x, 480, { size: 96, weight: 800, family: DISPLAY });
      txt('troops', x, 550, { size: 36, weight: 600, color: C.soft });
      txt(fmt(600), x, 660, { size: 96, weight: 800, family: DISPLAY });
      txt('tanks', x, 730, { size: 36, weight: 600, color: C.soft });
      txt('UN Special Committee, 1957', x, 820, { size: 32, weight: 500, color: C.faint });
    });
  }
  // b2: the morning broadcasts
  const b2 = span(t, s('b2', 0.1), s('b3', 0.2), 0.5, 0.5);
  A(b2, () => {
    radioIcon(W / 2, 300, 1.4, C.ink);
    txt('24 October, morning', W / 2, 410, { size: 40, weight: 700, color: C.accent, align: 'center' });
    chip('Imre Nagy, prime minister', W / 2, 500, { color: C.ink, size: 40, a: seg(t, s('b2', 0.4), s('b2', 1.0)) });
    chip('martial law, “signed by Imre Nagy”', W / 2, 610, { color: C.fire, size: 40, a: seg(t, at('b2', 0.35), at('b2', 0.5)) });
    A(seg(t, at('b2', 0.72), at('b2', 0.85)), () => txt('he later said he had not signed it', W / 2, 720, { size: 38, weight: 600, color: C.soft, align: 'center' }));
  });
  // b3, b7, b8: the city, its armed groups and the tanks on the avenues
  const cityA = Math.max(span(t, s('b3', 0.1), s('b4', 0.3), 0.6, 0.6), span(t, s('b7', 0.0), e('b8', 0.6), 0.6, 0.6));
  if (cityA > 0) {
    const P = mkBp(VIEWS.city);
    budapest(P, cityA); riverLabels(P, cityA);
    GROUPS.forEach((ll, i) => {
      const a = cityA * seg(t, s('b3', 0.6 + i * 0.35), s('b3', 1.0 + i * 0.35));
      const [x, y] = P(ll); A(a, () => { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill(); });
    });
    AVENUES.forEach((rd, i) => {
      const pts = rd.map(P), u = ((t - s('b3')) / 9 + i * 0.33) % 1;
      const [x, y, an] = along(pts, u); tank(x, y, an, { a: cityA * seg(t, s('b3', 0.4), s('b3', 1.2)), sc: 0.8 });
    });
    A(span(t, s('b3', 0.4), s('b4', 0.3), 0.5, 0.5), () => {
      txt('armed groups', LX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('young workers and students,', LX, 370, LW - 20, { size: 34, weight: 500 });
      txtFit('some barely past childhood', LX, 416, LW - 20, { size: 34, weight: 500 });
      txtFit('formed overnight', LX, 480, LW - 20, { size: 34, weight: 500, color: C.soft });
      const [x, y] = [LX + 14, 570]; ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
      txt('a group', LX + 40, y, { size: 32, weight: 600, color: C.soft });
      tank(LX + 14, 640, 0, { sc: 0.7 }); txt('Soviet tanks', LX + 40, 640, { size: 32, weight: 600, color: C.soft });
    });
    place(P, BP.szena, 'Széna tér', span(t, s('b7', 0.2), s('b8', 0.4), 0.5, 0.6), { col: C.accent, dx: -18, align: 'right' });
    pulse(...P(BP.szena), t, s('b7', 0.4), C.accent, { a: span(t, s('b7', 0.2), s('b8', 0.4), 0.5, 0.6) });
    A(span(t, s('b7', 0.2), s('b8', 0.2), 0.5, 0.5), () => {
      txt('Buda', LX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('Széna tér', LX, 370, LW, { size: 40, weight: 700 });
      txtFit('János Szabó, “Uncle Szabó”', LX, 424, LW, { size: 36, weight: 600 });
      txtFit('a truck driver of nearly sixty', LX, 474, LW, { size: 34, weight: 500, color: C.soft });
    });
    const cg = eio(seg(t, s('b8', 0.6), e('b8', -0.4)));
    A(span(t, s('b8', 0.2), e('b8', 0.6), 0.5, 0.6), () => {
      place(P, BP.csepel, 'Csepel', 1, { col: C.accent });
      trace([P(BP.csepel), P([19.0720, 47.452]), P([19.0700, 47.470]), P(BP.corvin)], cg, C.accent, { w: 6, dash: [12, 9] });
      txt('Csepel', LX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('the factory island', LX, 370, LW, { size: 40, weight: 700 });
      txtFit('workers come north', LX, 424, LW, { size: 34, weight: 500, color: C.soft });
      txtFit('to help the city', LX, 470, LW, { size: 34, weight: 500, color: C.soft });
    });
  }
  // b4–b6: the plan round the Corvin cinema and the Kilián barracks (schematic)
  const pl = span(t, s('b4', 0.1), s('b7', 0.2), 0.6, 0.6);
  if (pl > 0) corvinPlan(t, pl);
  // b9: Soviet soldiers and the people who argued with them
  const b9 = span(t, s('b9', 0.1), s('b10', 0.2), 0.5, 0.5);
  A(b9, () => {
    tank(W / 2, 500, Math.PI, { sc: 4.4 });
    [-220, 220].forEach((dx) => figure(W / 2 + dx, 640, 1.9, C.soviet, 1));
    [-560, -420, 420, 560].forEach((dx, i) => figure(W / 2 + dx, 646, 1.9, C.ink, seg(t, s('b9', 0.5 + i * 0.3), s('b9', 1.0 + i * 0.3))));
    txt('Soviet soldiers', W / 2, 300, { size: 40, weight: 700, color: C.soviet, align: 'center' });
    A(seg(t, s('b9', 0.6), s('b9', 1.4)), () => txt('told to crush “counter-revolutionary gangs”', W / 2, 760, { size: 38, weight: 600, color: C.soft, align: 'center' }));
    A(seg(t, at('b9', 0.55), at('b9', 0.7)), () => chip('people argue with them, in the Russian learnt at school', W / 2, 860, { color: C.accent, size: 36 }));
  });
  // b10: the cost
  const b10 = span(t, s('b10', 0.1), e('b10', 1.2), 0.5, 0.6);
  A(b10, () => {
    txt('The cost', W / 2, 270, { size: 56, weight: 800, family: DISPLAY, align: 'center' });
    txt('those who died in the fighting, by age', W / 2, 340, { size: 34, weight: 500, color: C.soft, align: 'center' });
    const X0 = 620, X1 = 1500, y1 = 470, y2 = 600, g = eio(seg(t, s('b10', 0.6), s('b10', 2.2)));
    txt('under 20', X0 - 30, y1, { size: 36, weight: 700, align: 'right' });
    txt('20 to 29', X0 - 30, y2, { size: 36, weight: 700, align: 'right' });
    ctx.fillStyle = C.ghost; ctx.fillRect(X0, y1 - 24, X1 - X0, 48); ctx.fillRect(X0, y2 - 24, X1 - X0, 48);
    ctx.fillStyle = C.accent; ctx.fillRect(X0, y1 - 24, (X1 - X0) * 0.21 * g, 48);
    ctx.fillStyle = C.soft; ctx.fillRect(X0, y2 - 24, (X1 - X0) * 0.28 * g, 48);
    A(g, () => {
      txt('more than 1 in 5', X0 + (X1 - X0) * 0.21 + 24, y1, { size: 36, weight: 700, color: C.accent });
      txt('28 in 100', X0 + (X1 - X0) * 0.28 + 24, y2, { size: 36, weight: 700, color: C.soft });
    });
    txt('UN Special Committee, 1957, from Hungarian statistics', W / 2, 740, { size: 32, weight: 500, color: C.faint, align: 'center' });
  });
}
function corvinPlan(t, a) {
  const R = { x: 640, y: 200, w: 1184, h: 790 };
  A(a, () => {
    card(R.x, R.y, R.w, R.h, { bg: C.land, r: 18, line: C.faint, lw: 2 });
    ctx.save(); k.rrect(R.x, R.y, R.w, R.h, 18); ctx.clip();
    // blocks of houses
    const R2 = rng(5);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 7; j++) {
      const x = R.x + 30 + i * 130, y = R.y + 30 + j * 112;
      ctx.fillStyle = C.block; k.rrect(x, y, 100 + R2() * 10, 84, 6); ctx.fill();
    }
    // the avenues: Üllői út (left to right) and the Grand Boulevard (top to bottom)
    const yU = R.y + 430, xK = R.x + 470;
    ctx.fillStyle = C.land; ctx.fillRect(R.x, yU - 44, R.w, 88); ctx.fillRect(xK - 44, R.y, 88, R.h);
    ctx.fillStyle = 'rgba(236,230,214,0.07)'; ctx.fillRect(R.x, yU - 44, R.w, 88); ctx.fillRect(xK - 44, R.y, 88, R.h);
    // narrow side streets
    ctx.fillStyle = C.land; [R.x + 690, R.x + 900].forEach((x) => ctx.fillRect(x - 15, R.y, 30, yU - 44 - R.y));
    ctx.fillRect(xK + 44, R.y + 250, R.w, 24);
    ctx.fillStyle = 'rgba(236,230,214,0.045)'; [R.x + 690, R.x + 900].forEach((x) => ctx.fillRect(x - 15, R.y, 30, yU - 44 - R.y));
    // the Corvin cinema: a round building in its ring of houses
    const cx = R.x + 690, cy = R.y + 250;
    ctx.fillStyle = C.blockHi; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, TAU); ctx.fill();
    ctx.fillStyle = C.land; ctx.beginPath(); ctx.arc(cx, cy, 82, 0, TAU); ctx.fill();
    ctx.fillStyle = C.accent; ctx.globalAlpha = a * seg(t, s('b4', 0.6), s('b4', 1.4)); ctx.beginPath(); ctx.arc(cx, cy, 58, 0, TAU); ctx.fill(); ctx.globalAlpha = a;
    // the Kilián barracks across the avenue
    const ka = seg(t, s('b5', 0.3), s('b5', 1.1));
    ctx.fillStyle = C.blockHi; ctx.fillRect(R.x + 560, yU + 110, 300, 180);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.globalAlpha = a * ka; ctx.strokeRect(R.x + 560, yU + 110, 300, 180); ctx.globalAlpha = a;
    ctx.restore();
    txt('Üllői út', R.x + 40, yU, { size: 32, weight: 600, color: C.soft });
    ctx.save(); ctx.translate(xK, R.y + 690); ctx.rotate(-Math.PI / 2); txt('Grand Boulevard', 0, 0, { size: 32, weight: 600, color: C.soft, align: 'center' }); ctx.restore();
    A(seg(t, s('b4', 0.6), s('b4', 1.4)), () => { txt('Corvin cinema', cx, cy - 150, { size: 34, weight: 700, color: C.accent, align: 'center', halo: 7 }); });
    A(ka, () => {
      txt('Kilián barracks', R.x + 710, yU + 180, { size: 34, weight: 700, color: C.accent, align: 'center' });
      txt('Colonel Pál Maléter', R.x + 710, yU + 226, { size: 32, weight: 600, color: C.ink, align: 'center' });
    });
    txt('schematic plan', R.x + R.w - 24, R.y + R.h - 30, { size: 32, weight: 500, color: C.faint, align: 'right' });
    // b6: a tank on the wide avenue, the groups strike from the side streets and withdraw
    const b6 = span(t, s('b6', 0.1), s('b7', 0.2), 0.5, 0.5);
    if (b6 > 0) {
      const u = seg(t, s('b6', 0.2), e('b6', 0.4));
      tank(lerp(R.x + R.w + 60, R.x + 980, eout(u)), yU, Math.PI, { a: b6, sc: 1.8 });
      const strike = span(t, at('b6', 0.25), at('b6', 0.6), 0.3, 0.3), back = seg(t, at('b6', 0.6), at('b6', 0.85));
      A(b6, () => {
        [R.x + 900].forEach((x) => {
          A(strike, () => trace([[x, R.y + 120], [x, yU - 70]], seg(t, at('b6', 0.25), at('b6', 0.45)), C.accent, { w: 6 }));
          A(back, () => trace([[x - 30, yU - 70], [x - 30, R.y + 140]], back, C.accent, { w: 6, dash: [10, 8] }));
        });
        txt('wide avenue: tanks, little infantry', R.x + R.w - 30, yU + 72, { size: 32, weight: 600, color: C.soviet, align: 'right' });
        txt('narrow streets', R.x + 930, R.y + 64, { size: 32, weight: 600, color: C.accent });
      });
    }
  });
  // the left column
  A(span(t, s('b4', 0.2), s('b5', 0.1), 0.5, 0.5), () => {
    txt('Corvin köz', LX, 300, { size: 52, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('8th district, Pest', LX, 370, LW, { size: 38, weight: 700 });
    txtFit('a passage round a cinema', LX, 424, LW, { size: 34, weight: 500, color: C.soft });
    txtFit('ringed by tall houses', LX, 470, LW, { size: 34, weight: 500, color: C.soft });
  });
  A(span(t, s('b5', 0.2), s('b6', 0.1), 0.5, 0.5), () => {
    txt('Kilián barracks', LX, 300, { size: 52, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('Hungarian soldiers', LX, 370, LW, { size: 38, weight: 700 });
    txtFit('take the insurgents’ side', LX, 424, LW, { size: 34, weight: 500, color: C.soft });
  });
  A(span(t, s('b6', 0.2), s('b7', 0.1), 0.5, 0.5), () => {
    txt('strike,', LX, 300, { size: 52, weight: 800, family: DISPLAY, color: C.accent });
    txt('then withdraw', LX, 366, { size: 52, weight: 800, family: DISPLAY, color: C.accent });
    txtFit('petrol bombs, barricades,', LX, 440, LW, { size: 34, weight: 500 });
    txtFit('help from the neighbours', LX, 486, LW, { size: 34, weight: 500, color: C.soft });
  });
}

// ---------- 3: Bloody Thursday (25–26 October) ----------
const R_ASTORIA = [BP.astoria, [19.0575, 47.4955], BP.deak, [19.0546, 47.5040], [19.0510, 47.5070], BP.parliament];
function partThursday(t) {
  // c1–c2: the Astoria, the tanks and the march to Parliament
  const ca = span(t, s('c1', 0), s('c3', 0.3), 0.6, 0.6);
  if (ca > 0) {
    const P = mkBp(VIEWS.astoria);
    budapest(P, ca); riverLabels(P, ca);
    const pts = R_ASTORIA.map(P), g = eio(seg(t, at('c1', 0.5), e('c1', 1.2)));
    place(P, BP.astoria, 'Astoria', ca, { dx: 20, dy: 30 });
    place(P, BP.parliament, 'Parliament', ca, { dx: -20, dy: -34, align: 'right' });
    A(ca * seg(t, at('c1', 0.45), at('c1', 0.55)), () => trace(pts, g, C.accent, { w: 6, dash: [12, 9] }));
    for (let i = 0; i < 3; i++) {
      const u = Math.max(0, g - i * 0.08), [x, y, an] = along(pts, u);
      tank(x + (i - 1) * 8, y + 10, an, { a: ca, sc: 1.0, flag: seg(t, at('c1', 0.42), at('c1', 0.55)) });
    }
    const [x, y] = along(pts, Math.max(0, g - 0.06));
    crowd(x, y + 40, 60, 34, 60, seg(t, s('c1', 0.6), s('c1', 2.0)), { a: ca, seed: 31, r: 3.5 });
    A(span(t, s('c1', 0.2), s('c3', 0.2), 0.5, 0.5), () => {
      txt('Thursday', LX, 280, { size: 60, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('25 October, morning', LX, 350, LW, { size: 40, weight: 700 });
      txtFit('people talk with', LX, 420, LW, { size: 34, weight: 500, color: C.soft });
      txtFit('the Soviet tank crews', LX, 466, LW, { size: 34, weight: 500, color: C.soft });
      A(seg(t, at('c1', 0.45), at('c1', 0.58)), () => {
        txtFit('Hungarian flags on the turrets', LX, 540, LW, { size: 34, weight: 600 });
        txtFit('to Parliament, to see Imre Nagy', LX, 590, LW, { size: 34, weight: 600, color: C.accent });
      });
    });
  }
  // c3–c7: Kossuth Square, schematic plan; three accounts; the estimates
  const ka = span(t, s('c3', 0.0), s('c8', 0.3), 0.6, 0.6);
  if (ka > 0) kossuthPlan(t, ka);
  // c8: the party's new leader
  A(span(t, s('c8', 0.1), s('c9', 0.1), 0.5, 0.5), () => {
    txt('25 October', W / 2, 330, { size: 44, weight: 700, color: C.soft, align: 'center' });
    txt('the party’s first secretary', W / 2, 400, { size: 40, weight: 700, align: 'center' });
    chip('Ernő Gerő', W / 2 - 300, 540, { color: C.soft, size: 44 });
    arrowHead(W / 2 + 30, 540, 0, C.accent, 26); ctx.fillStyle = C.accent; ctx.fillRect(W / 2 - 60, 536, 80, 8);
    chip('János Kádár', W / 2 + 320, 540, { color: C.accent, size: 44, a: seg(t, s('c8', 1.0), s('c8', 1.8)) });
  });
  // c9–c10: Mosonmagyaróvár
  const ma = span(t, s('c9', 0.0), e('c10', 1.0), 0.6, 0.6);
  if (ma > 0) {
    hungary(HUBIG, ma);
    A(ma, () => { const [x, y] = HUBIG([16.3, 48.35]); txt('AUSTRIA', x, y, { size: 32, weight: 700, color: C.faint, spacing: '4px', align: 'center' }); });
    town(HUBIG, TOWN.budapest, 'Budapest', ma, { dx: 16, dy: 30 });
    town(HUBIG, TOWN.mosonmo, 'Mosonmagyaróvár', ma, { col: C.fire, dx: 0, dy: -36, align: 'left' });
    pulse(...HUBIG(TOWN.mosonmo), t, s('c9', 0.8), C.fire, { a: ma });
    A(ma, () => {
      const x = 1250;
      txt('26 October', x, 330, { size: 48, weight: 800, family: DISPLAY, color: C.fire });
      txtFit('border guards fire on', x, 400, 560, { size: 36, weight: 600 });
      txtFit('an unarmed crowd at their barracks', x, 446, 560, { size: 36, weight: 600 });
      A(seg(t, s('c10', 0.2), s('c10', 1.0)), () => {
        txt(fmt(52), x, 560, { size: 84, weight: 800, family: DISPLAY });
        txtFit('dead, the 1956 Institute', x + 140, 560, 420, { size: 34, weight: 500, color: C.soft });
        txt(fmt(105), x, 670, { size: 84, weight: 800, family: DISPLAY, color: C.soft });
        txtFit('dead, reports at the time', x + 170, 670, 390, { size: 34, weight: 500, color: C.soft });
      });
      A(seg(t, at('c10', 0.62), at('c10', 0.78)), () => txtFit('in revenge, officers killed by the crowd', x, 780, 560, { size: 34, weight: 600, color: C.ink }));
    });
  }
}
function kossuthPlan(t, a) {
  const R = { x: 96, y: 200, w: 1060, h: 790 };
  const cx = R.x + R.w * 0.52, cy = R.y + R.h * 0.5;
  A(a, () => {
    card(R.x, R.y, R.w, R.h, { bg: C.land, r: 18, line: C.faint, lw: 2 });
    // the river along the left, Parliament along it, the square, the Ministry of Agriculture to the east
    ctx.fillStyle = C.river; ctx.fillRect(R.x + 2, R.y + 2, 120, R.h - 4);
    ctx.fillStyle = C.blockHi; k.rrect(R.x + 160, R.y + 160, 200, 470, 10); ctx.fill();
    ctx.fillStyle = C.block; k.rrect(R.x + 796, R.y + 200, 244, 390, 10); ctx.fill();
    for (const [x, y, w, h] of [[R.x + 420, R.y + 40, 330, 90], [R.x + 420, R.y + 660, 330, 90], [R.x + 796, R.y + 40, 244, 120], [R.x + 796, R.y + 630, 244, 120]]) { ctx.fillStyle = C.block; k.rrect(x, y, w, h, 8); ctx.fill(); }
    txt('PARLIAMENT', R.x + 260, R.y + 395, { size: 34, weight: 800, family: DISPLAY, color: C.soft, align: 'center' });
    ctx.save(); ctx.translate(R.x + 918, R.y + 395); ctx.rotate(-Math.PI / 2); { const z = Math.min(fit('MINISTRY OF', 370, 34, { weight: 700 }), fit('AGRICULTURE', 370, 34, { weight: 700 })); txt('MINISTRY OF', 0, -22, { size: z, weight: 700, color: C.soft, align: 'center' }); txt('AGRICULTURE', 0, 18, { size: z, weight: 700, color: C.soft, align: 'center' }); } ctx.restore();
    txt('KOSSUTH SQUARE', R.x + 600, R.y + 600, { size: 34, weight: 800, family: DISPLAY, color: C.faint, align: 'center', spacing: '3px' });
    txt('schematic plan', R.x + R.w - 24, R.y + R.h - 30, { size: 32, weight: 500, color: C.faint, align: 'right' });
  });
  crowd(R.x + 600, R.y + 390, 170, 150, 320, seg(t, s('c3', 0.2), s('c3', 1.6)), { a, seed: 41, r: 3.5 });
  // the three accounts: each lights its zone (no lines of fire)
  const acc = [
    { at: 0.30, zone: () => { tank(R.x + 773, R.y + 70, Math.PI / 2, { sc: 1.3 }); tank(R.x + 773, R.y + 720, -Math.PI / 2, { sc: 1.3 }); }, label: 'Soviet tanks in the side streets', by: 'András Kő and Lambert Nagy' },
    { at: 0.55, zone: () => { ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); k.rrect(R.x + 788, R.y + 192, 260, 406, 12); ctx.stroke(); ctx.setLineDash([]); }, label: 'shooters on roofs and in the ministry', by: 'Edit Kéri; the UN report of 1957' },
    { at: 0.78, zone: () => { for (let i = 0; i < 5; i++) { ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(R.x + 470 + i * 24, R.y + 540 - i * 8, 7, 0, TAU); ctx.fill(); } }, label: 'Hungarian border guards on the square', by: 'military historian Miklós Horváth' },
  ];
  const ac = span(t, s('c4', 0.1), s('c6', 0.2), 0.5, 0.6);
  acc.forEach((ac0, i) => {
    const ai = ac * seg(t, at('c4', ac0.at - 0.12), at('c4', ac0.at));
    A(ai * a, ac0.zone);
    A(ai, () => {
      const y = 330 + i * 190, col = [C.soviet, C.amber, C.blue][i];
      txt(String(i + 1), 1230, y, { size: 56, weight: 800, family: DISPLAY, color: col });
      txtFit(ac0.label, 1284, y - 8, 540, { size: 34, weight: 700 });
      txtFit(ac0.by, 1284, y + 40, 540, { size: 32, weight: 500, color: C.soft });
    });
  });
  A(span(t, s('c3', 0.3), s('c4', 0.1), 0.5, 0.5), () => {
    txt('11 a.m. to noon', 1230, 330, { size: 48, weight: 800, family: DISPLAY, color: C.fire });
    txtFit('fire from several directions', 1230, 400, 590, { size: 36, weight: 600 });
    txtFit('on an unarmed crowd', 1230, 446, 590, { size: 36, weight: 600, color: C.soft });
  });
  A(span(t, s('c4', 0.1), s('c6', 0.2), 0.5, 0.5), () => txt('WHO FIRED?', 1230, 230, { size: 40, weight: 800, family: DISPLAY, color: C.ink, spacing: '2px' }));
  // c6–c7: the estimates of the dead, on a scale
  const sa = span(t, s('c6', 0.0), s('c8', 0.3), 0.5, 0.6);
  if (sa > 0) A(sa, () => {
    ctx.fillStyle = C.card; ctx.fillRect(1180, 200, 650, 790);
    txt('HOW MANY DIED?', 1220, 250, { size: 40, weight: 800, family: DISPLAY, spacing: '2px' });
    const X = 1300, Y0 = 330, Y1 = 900, Y = (v) => lerp(Y0, Y1, v / 1000);
    ctx.fillStyle = C.faint; ctx.fillRect(X - 2, Y0, 4, Y1 - Y0);
    const band = seg(t, s('c7', 0.2), s('c7', 1.2));
    A(band, () => { ctx.fillStyle = 'rgba(215,162,74,0.32)'; ctx.fillRect(X - 14, Y(300), 28, (Y(800) - Y(300))); });
    const marks = [
      [22, 'the regime’s White Book', seg(t, s('c6', 1.4), s('c6', 2.0)), C.soft],
      [75, 'named one by one, 2001', seg(t, at('c6', 0.7), at('c6', 0.85)), C.accent],
      [300, 'UN report: low estimate', band, C.amber],
      [800, 'UN report: high estimate', band, C.amber],
      [1000, 'some eyewitnesses', seg(t, at('c7', 0.45), at('c7', 0.6)), C.soft],
    ];
    marks.forEach(([v, label, ma, col], i) => A(ma, () => {
      const y = Y(v) + (i === 1 ? 26 : i === 0 ? -14 : 0);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X, Y(v), 10, 0, TAU); ctx.fill();
      const nw = textW(fmt(v), { size: 36, weight: 800, family: DISPLAY });
      txt(fmt(v), X + 30, y, { size: 36, weight: 800, family: DISPLAY, color: col });
      txtFit(label, X + 52 + nw, y, 470 - nw, { size: 32, weight: 600, color: col === C.soft ? C.soft : C.ink });
    }));
  });
  A(seg(t, at('c7', 0.72), at('c7', 0.86)) * sa, () => {
    ctx.fillStyle = C.card; ctx.fillRect(R.x + 120, R.y + R.h - 120, R.w - 240, 80);
    txt('No one was called to account.', R.x + R.w / 2, R.y + R.h - 80, { size: 38, weight: 700, align: 'center' });
  });
}

// ---------- 4: the councils ----------
const HUC = mkHu(96, 230, 1080);
const COUNCILS = ['gyor', 'miskolc', 'debrecen', 'pecs', 'szeged', 'veszprem', 'sopron', 'szfvar', 'szolnok', 'salgo', 'nyiregyhaza', 'kaposvar', 'zalaeg', 'szombathely', 'eger', 'bekescs', 'baja', 'tatabanya', 'mosonmo', 'szekszard'];
const WORKS = [['budapest', 0], ['miskolc', 0], ['pecs', 0], ['gyor', 1], ['komlo', 1], ['dunapentele', 1], ['tatabanya', 1], ['nyiregyhaza', 1], ['kaposvar', 1]];
function partCouncils(t) {
  const a = span(t, s('d1', 0), e('d5', 1.2), 0.6, 0.6);
  if (a <= 0) return;
  hungary(HUC, a);
  town(HUC, TOWN.budapest, 'Budapest', a, { dx: 18, dy: -30 });
  COUNCILS.forEach((key, i) => {
    const ai = a * seg(t, at('d1', 0.45 + i * 0.022), at('d1', 0.5 + i * 0.022));
    const [x, y] = HUC(TOWN[key]);
    A(ai, () => { ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.stroke(); ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); });
  });
  WORKS.forEach(([key, late], i) => {
    const ai = a * seg(t, s('d3', 0.5 + i * 0.25), s('d3', 0.9 + i * 0.25));
    const [x, y] = HUC(TOWN[key]);
    A(ai, () => { ctx.fillStyle = C.amber; ctx.fillRect(x + 12, y + 8, 18, 18); });
  });
  ['gyor', 'miskolc', 'debrecen', 'pecs', 'szeged'].forEach((key, i) => {
    const off = { gyor: [-20, -34, 'right'], miskolc: [20, -32, 'left'], debrecen: [-20, 36, 'right'], pecs: [20, 34, 'left'], szeged: [20, 34, 'left'] }[key];
    const nm = { gyor: 'Győr', miskolc: 'Miskolc', debrecen: 'Debrecen', pecs: 'Pécs', szeged: 'Szeged' }[key];
    A(a * seg(t, at('d1', 0.6), at('d1', 0.75)), () => { const [x, y] = HUC(TOWN[key]); txt(nm, x + off[0], y + off[1], { size: 32, weight: 600, align: off[2], halo: 6 }); });
  });
  // the legend and the words, on the right
  const RX = 1250, RW = 574;
  A(a, () => {
    A(span(t, s('d1', 0.3), e('d5', 1.2), 0.5, 0.6), () => {
      ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(RX + 14, 300, 13, 0, TAU); ctx.stroke();
      txtFit('revolutionary councils', RX + 44, 300, RW - 44, { size: 34, weight: 700 });
      txtFit('chosen at public meetings', RX + 44, 344, RW - 44, { size: 32, weight: 500, color: C.soft });
    });
    A(span(t, s('d3', 0.3), e('d5', 1.2), 0.5, 0.6), () => {
      ctx.fillStyle = C.amber; ctx.fillRect(RX + 5, 410, 18, 18);
      txtFit('workers’ councils', RX + 44, 420, RW - 44, { size: 34, weight: 700 });
      txtFit('from 24 October', RX + 44, 464, RW - 44, { size: 32, weight: 500, color: C.soft });
    });
    chip('general strike', RX, 550, { color: C.amber, size: 36, align: 'left', a: span(t, at('d3', 0.6), e('d5', 1.2), 0.5, 0.6) });
  });
  // d5: Győr, the Transdanubian National Council
  const d5 = span(t, s('d5', 0.1), e('d5', 1.2), 0.5, 0.6);
  pulse(...HUC(TOWN.gyor), t, s('d5', 0.4), C.accent, { a: d5, r1: 60 });
  if (d5 > 0) noteCard(RX, 620, RW, 'GYŐR, 30 OCTOBER', ['Transdanubian National Council', 'about 400 delegates', 'calls for neutrality'], d5, { col: C.accent });
}

// ---------- 5: the ceasefire (27–30 October) ----------
function partCeasefire(t) {
  // e1: the government of 27 October
  const e1 = span(t, s('e1', 0), s('e2', 0.2), 0.6, 0.5);
  A(e1, () => {
    txt('27 October', W / 2, 270, { size: 44, weight: 700, color: C.accent, align: 'center' });
    txt('a new government', W / 2, 336, { size: 48, weight: 800, family: DISPLAY, align: 'center' });
    ctx.fillStyle = C.blockHi; ctx.beginPath(); ctx.ellipse(W / 2, 580, 420, 120, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 12; i++) {
      const an = i * (Math.PI / 6), x = W / 2 + Math.cos(an) * 470, y = 580 + Math.sin(an) * 160;
      const named = i === 0 || i === 6;
      ctx.fillStyle = named ? C.accent : C.soft; ctx.beginPath(); ctx.arc(x, y, 20, 0, TAU); ctx.fill();
    }
    A(seg(t, at('e1', 0.55), at('e1', 0.7)), () => {
      txt('Zoltán Tildy', W / 2 - 510, 580, { size: 36, weight: 700, color: C.accent, align: 'right' });
      txt('Béla Kovács', W / 2 + 510, 580, { size: 36, weight: 700, color: C.accent, align: 'left' });
      txt('two Smallholders', W / 2, 820, { size: 36, weight: 600, color: C.soft, align: 'center' });
    });
    txt('Imre Nagy', W / 2, 580, { size: 40, weight: 700, align: 'center' });
  });
  // e2: dawn attack beaten back; the ceasefire
  const e2 = span(t, s('e2', 0), s('e3', 0.1), 0.5, 0.5);
  A(e2, () => {
    txt('28 October', W / 2, 300, { size: 44, weight: 700, color: C.accent, align: 'center' });
    chip('dawn: a Soviet attack on the Corvin köz is beaten back', W / 2, 400, { color: C.soft, size: 36 });
    const ca = seg(t, at('e2', 0.62), at('e2', 0.78));
    A(ca, () => {
      txt('CEASEFIRE', W / 2, 600, { size: fit('CEASEFIRE', 1400, 150, { weight: 800, family: DISPLAY, spacing: '8px' }), weight: 800, family: DISPLAY, color: C.accent, align: 'center', spacing: '8px' });
      tricolour(W / 2, 700, 80, 6);
    });
  });
  // e3: the broadcast
  const e3 = span(t, s('e3', 0), s('e4', 0.1), 0.5, 0.5);
  A(e3, () => {
    radioIcon(W / 2, 320, 1.5, C.ink);
    txt('Imre Nagy on the radio, 28 October', W / 2, 440, { size: 38, weight: 600, color: C.soft, align: 'center' });
    A(seg(t, s('e3', 0.6), s('e3', 1.4)), () => txt('not a “counter-revolution”', W / 2, 540, { size: 44, weight: 700, color: C.soft, align: 'center' }));
    A(seg(t, at('e3', 0.55), at('e3', 0.7)), () => txt('“a great national and democratic movement”', W / 2, 650, { size: fit('“a great national and democratic movement”', 1600, 62, { weight: 800 }), weight: 800, color: C.accent, align: 'center' }));
  });
  // e4: the ÁVH dissolved; one-party rule ends
  const e4 = span(t, s('e4', 0), s('e5', 0.2), 0.5, 0.5);
  A(e4, () => {
    const bx = 520, by = 520;
    ctx.strokeStyle = C.fire; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx, by, 120, 0, TAU); ctx.stroke();
    txt('ÁVH', bx, by + 4, { size: 72, weight: 800, family: DISPLAY, color: C.fire, align: 'center' });
    const sl = seg(t, s('e4', 0.6), s('e4', 1.4));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 90, by + 90); ctx.lineTo(bx - 90 + 180 * sl, by + 90 - 180 * sl); ctx.stroke(); ctx.lineCap = 'butt';
    txt('29 October: dissolved', bx, by + 180, { size: 36, weight: 700, align: 'center' });
    const op = seg(t, at('e4', 0.5), at('e4', 0.65));
    A(op, () => {
      txt('30 October', 1300, 330, { size: 44, weight: 700, color: C.accent, align: 'center' });
      txt('one-party rule ends', 1300, 396, { size: 48, weight: 800, family: DISPLAY, align: 'center' });
      const parties = ['Communists', 'Smallholders', 'National Peasants', 'Social Democrats'];
      parties.forEach((p, i) => chip(p, 1300, 500 + i * 92, { color: i ? C.accent : C.soft, size: 36, a: seg(t, at('e4', 0.6 + i * 0.05), at('e4', 0.66 + i * 0.05)) }));
      A(seg(t, at('e4', 0.85), at('e4', 0.95)), () => txt('free elections promised', 1300, 880, { size: 36, weight: 600, color: C.soft, align: 'center' }));
    });
  });
  // e5: Soviet tanks leave; Moscow's declaration
  const e5 = span(t, s('e5', 0), s('e7', 0.1), 0.5, 0.5);
  if (e5 > 0) {
    const P = mkBp(VIEWS.city, { x: 96, y: 220, w: 900, h: 760 });
    budapest(P, e5); riverLabels(P, e5);
    const g = eout(seg(t, s('e5', 0.3), e('e5', 0.4)));
    clipTo(P.r, () => [[BP.astoria, -0.9], [BP.corvin, 0.2], [BP.parliament, -1.6], [BP.baross, 0.6]].forEach(([ll, an], i) => {
      const [x, y] = P(ll), d = 260 * g;
      tank(x + Math.cos(an) * d, y + Math.sin(an) * d, an, { a: e5 * (1 - seg(t, at('e5', 0.7), e('e5', 0.4))), sc: 0.9 });
    }));
    A(e5, () => {
      txtFit('Soviet tanks begin to leave Budapest', 1080, 300, 740, { size: 38, weight: 700, color: C.soviet });
      noteCard(1080, 380, 744, 'DECLARATION', ['Soviet government, 30 October', '· respect for sovereignty', '· troops to leave Budapest'], seg(t, at('e5', 0.45), at('e5', 0.6)), { col: C.soft });
    });
  }
  // e7–e11: Köztársaság tér, in words
  const kt = span(t, s('e7', 0), e('e11', 1.2), 0.7, 0.7);
  A(kt, () => {
    card(96, 210, 1728, 770, { bg: 'rgba(12,14,17,0.9)', line: C.faint, lw: 2 });
    txt('KÖZTÁRSASÁG TÉR', 160, 290, { size: 48, weight: 800, family: DISPLAY, spacing: '2px' });
    txt('Republic Square · 30 October', 160, 346, { size: 34, weight: 600, color: C.soft });
    tricolour(160 + 96, 384, 64, 5);
    const lines = [
      ['e7', 0.2, 'Armed insurgents besiege the Budapest party headquarters,', C.ink],
      ['e7', 0.55, 'believing prisoners are held there.', C.ink],
      ['e8', 0.2, 'Its defenders: young ÁVH conscripts, party staff, army officers.', C.ink],
      ['e9', 0.15, 'When it falls, the men who come out to negotiate are shot.', C.ink],
      ['e9', 0.55, 'The crowd shoots or lynches several of the defenders.', C.ink],
      ['e10', 0.1, '23 defenders dead, by the 1956 Institute’s count; attackers killed too.', C.ink],
      ['e10', 0.6, 'Revolutionary organisations condemn the lynchings.', C.accent],
      ['e11', 0.15, 'After 4 November, held up as proof of a “counter-revolution”.', C.soft],
    ];
    lines.forEach(([key, f, str, col], i) => A(seg(t, at(key, f), at(key, f) + 0.7), () => txtFit(str, 160, 466 + i * 64, 1600, { size: 40, weight: col === C.soft ? 500 : 600, color: col })));
  });
}

// ---------- 6: two capitals (31 October – 3 November) ----------
const LANE = { x: 96, w: 1728, yB: 220, yM: 610, h: 360 };
function lanes(t, a) {
  A(a, () => {
    card(LANE.x, LANE.yB, LANE.w, LANE.h, { bg: 'rgba(95,174,116,0.07)', line: 'rgba(95,174,116,0.5)', lw: 2 });
    card(LANE.x, LANE.yM, LANE.w, LANE.h, { bg: 'rgba(141,150,159,0.07)', line: 'rgba(141,150,159,0.5)', lw: 2 });
    txt('BUDAPEST, IN PUBLIC', LANE.x + 30, LANE.yB + 44, { size: 34, weight: 800, family: DISPLAY, color: C.accent, spacing: '2px' });
    txt('MOSCOW, IN SECRET', LANE.x + 30, LANE.yM + 44, { size: 34, weight: 800, family: DISPLAY, color: C.soviet, spacing: '2px' });
  });
}
const HUF = mkHu(96, 220, 1150);
function partCapitals(t) {
  // f1–f5: 31 October in two lanes
  const la = span(t, s('f1', 0), s('f6', 0.2), 0.6, 0.6);
  if (la > 0) {
    lanes(t, la);
    A(la, () => {
      const xB = LANE.x + 30;
      A(seg(t, s('f1', 0.3), s('f1', 1.0)), () => {
        txt('31 October', xB, LANE.yB + 104, { size: 40, weight: 700 });
        txtFit('Soviet tanks leave the city', xB, LANE.yB + 156, 700, { size: 34, weight: 500, color: C.soft });
        txtFit('“the first days of our sovereignty and independence”', xB, LANE.yB + 230, 1640, { size: 44, weight: 700, color: C.accent });
      });
      const xM = LANE.x + 30;
      A(seg(t, s('f3', 0.3), s('f3', 1.0)), () => {
        txt('31 October, the Soviet party Presidium', xM, LANE.yM + 104, { size: 40, weight: 700 });
        txtFit('Nikita Khrushchev:', xM, LANE.yM + 156, 700, { size: 34, weight: 500, color: C.soft });
        txtFit('“We should not withdraw our troops from Hungary and Budapest.”', xM, LANE.yM + 226, 1640, { size: 44, weight: 700, color: C.ink });
      });
      chip('leaving would look like weakness', xM, LANE.yM + 306, { color: C.soviet, size: 34, align: 'left', a: span(t, s('f4', 0.2), s('f5', 0.3), 0.6, 0.4) });
      chip('Suez: Britain and France against Egypt', xM + 560, LANE.yM + 306, { color: C.soft, size: 34, align: 'left', a: span(t, at('f4', 0.55), s('f5', 0.3), 0.6, 0.4) });
      chip('Budapest does not know', LANE.x + 30, LANE.yB + 310, { color: C.soft, size: 34, align: 'left', a: seg(t, at('f3', 0.6), at('f3', 0.75)) });
      // f5 replaces the quote line's chips with the plan
      A(seg(t, s('f5', 0.4), s('f5', 1.0)), () => {
        chip('a new government, loyal to Moscow', xM, LANE.yM + 306, { color: C.soviet, size: 34, align: 'left' });
        chip('three days to prepare', xM + 640, LANE.yM + 306, { color: C.fire, size: 34, align: 'left', a: seg(t, at('f5', 0.55), at('f5', 0.7)) });
      });
    });
  }
  // f6–f8: 1 November on the map; f10: Szolnok
  const ma = Math.max(span(t, s('f6', 0), s('f9', 0.2), 0.6, 0.6), span(t, s('f10', 0), s('f11', 0.2), 0.6, 0.6));
  if (ma > 0) {
    hungary(HUF, ma);
    A(ma, () => {
      const [ux, uy] = HUF([22.4, 48.62]); txt('USSR', ux, uy, { size: 32, weight: 700, color: C.faint, align: 'center', spacing: '4px' });
      const [rx, ry] = HUF([22.6, 46.6]); txt('ROMANIA', rx, ry, { size: 32, weight: 700, color: C.faint, align: 'center', spacing: '4px' });
    });
    town(HUF, TOWN.budapest, 'Budapest', ma, { dx: -18, dy: -30, align: 'right' });
    const g = eio(seg(t, s('f6', 0.4), e('f6', 0.2)));
    A(ma, () => {
      trace([HUF([22.6, 48.75]), HUF(TOWN.zahony), HUF(TOWN.nyiregyhaza), HUF([20.6, 47.75])], g, C.soviet, { w: 8, headSize: 26 });
      trace([HUF([23.0, 48.3]), HUF([21.9, 47.9]), HUF(TOWN.miskolc)], g, C.soviet, { w: 8, headSize: 26 });
      trace([HUF([23.0, 47.2]), HUF([21.7, 47.35]), HUF(TOWN.debrecen)], g * 0.95, C.soviet, { w: 8, headSize: 26 });
    });
    town(HUF, TOWN.zahony, 'Záhony', ma * g, { col: C.soviet, dx: -16, dy: 32, align: 'right' });
    const RX = 1300, RW = 524;
    A(span(t, s('f6', 0.2), s('f8', 0.2), 0.5, 0.5), () => {
      txt('1 November', RX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('new Soviet divisions', RX, 370, RW, { size: 38, weight: 700 });
      txtFit('cross the eastern border', RX, 420, RW, { size: 34, weight: 500, color: C.soft });
      A(seg(t, s('f7', 0.2), s('f7', 1.0)), () => {
        txtFit('Ambassador Yuri Andropov:', RX, 520, RW, { size: 34, weight: 600 });
        txtFit('“to cover the withdrawal”', RX, 570, RW, { size: 38, weight: 700, color: C.soviet });
      });
    });
    const nt = span(t, s('f8', 0.2), s('f9', 0.2), 0.5, 0.5);
    A(nt, () => {
      const st = eout(seg(t, s('f8', 1.0), s('f8', 1.8)));
      ctx.save(); const [bx, by] = HUF([18.6, 46.55]); ctx.translate(bx, by); ctx.rotate(-0.08); ctx.scale(lerp(1.3, 1, st), lerp(1.3, 1, st)); ctx.globalAlpha *= st;
      const word = 'NEUTRAL', ww = textW(word, { size: 120, weight: 800, family: DISPLAY, spacing: '8px' }) + 80;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 8; k.rrect(-ww / 2, -86, ww, 172, 14); ctx.stroke();
      txt(word, 0, 6, { size: 120, weight: 800, family: DISPLAY, color: C.accent, align: 'center', spacing: '8px' });
      ctx.restore();
      txt('evening, 1 November', RX, 300, { size: 44, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('out of the Warsaw Pact', RX, 380, RW, { size: 38, weight: 700, ...{} });
      txtFit('an appeal to the United Nations', RX, 432, RW, { size: 34, weight: 500, color: C.soft });
      txtFit('7.50 p.m., on the radio', RX, 484, RW, { size: 34, weight: 500, color: C.soft });
    });
    const f10 = span(t, s('f10', 0), s('f11', 0.2), 0.5, 0.5);
    town(HUF, TOWN.szolnok, 'Szolnok', f10, { col: C.fire, dx: 18, dy: 30 });
    pulse(...HUF(TOWN.szolnok), t, s('f10', 0.6), C.fire, { a: f10 });
    A(f10, () => {
      txt('Szolnok', RX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.fire });
      txtFit('Marshal Ivan Konev', RX, 370, RW, { size: 38, weight: 700 });
      txtFit('Warsaw Pact commander', RX, 420, RW, { size: 34, weight: 500, color: C.soft });
      txtFit('the order: attack on 4 November', RX, 500, RW, { size: 36, weight: 700, color: C.fire });
    });
  }
  // f9: Kádár's speech, and Kádár moving from one lane to the other
  const f9 = span(t, s('f9', 0), s('f10', 0.2), 0.5, 0.5);
  if (f9 > 0) {
    lanes(t, f9);
    A(f9, () => {
      txt('1 November, late evening', LANE.x + 30, LANE.yB + 104, { size: 40, weight: 700 });
      radioIcon(LANE.x + 1290, LANE.yB + 180, 1.0, C.ink);
      txtFit('on the radio: Kádár praises the “glorious uprising”', LANE.x + 30, LANE.yB + 180, 1150, { size: 38, weight: 600, color: C.soft });
      const mv = eio(seg(t, at('f9', 0.6), e('f9', 0.4)));
      const y = lerp(LANE.yB + 280, LANE.yM + 200, mv);
      chip('János Kádár', LANE.x + 700, y, { color: mv > 0.5 ? C.soviet : C.ink, size: 40, bg: C.card });
      A(seg(t, at('f9', 0.75), e('f9', 0.6)), () => txt('gone over to the Soviets', LANE.x + 960, LANE.yM + 200, { size: 36, weight: 600, color: C.soviet }));
    });
  }
  // f11: the government of 3 November
  const f11 = span(t, s('f11', 0), s('f12', 0.2), 0.5, 0.5);
  A(f11, () => {
    txt('3 November', W / 2, 270, { size: 44, weight: 700, color: C.accent, align: 'center' });
    txt('a coalition of four parties', W / 2, 336, { size: 48, weight: 800, family: DISPLAY, align: 'center' });
    const rows = [['Communists', 3], ['Social Democrats', 3], ['Smallholders', 3], ['Petőfi Party', 2]];
    rows.forEach(([p, n], i) => {
      const y = 450 + i * 92, ai = seg(t, s('f11', 0.6 + i * 0.35), s('f11', 1.0 + i * 0.35));
      A(ai, () => {
        txt(p, W / 2 - 40, y, { size: 38, weight: 700, align: 'right' });
        for (let j = 0; j < n; j++) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(W / 2 + 20 + j * 60, y, 20, 0, TAU); ctx.fill(); }
        txt('ministries', W / 2 + 210, y, { size: 32, weight: 500, color: C.soft });
      });
    });
    A(seg(t, at('f11', 0.6), at('f11', 0.75)), () => chip('defence: Pál Maléter', W / 2, 860, { color: C.accent, size: 40 }));
  });
  // f12–f13: from Parliament to Tököl
  const tk = span(t, s('f12', 0), e('f13', 1.4), 0.6, 0.6);
  if (tk > 0) {
    const P = mkBp(VIEWS.south, { x: 96, y: 220, w: 1080, h: 760 });
    budapest(P, tk, { night: seg(t, at('f12', 0.6), s('f13', 0.4)) });
    place(P, BP.parliament, 'Parliament', tk, { dx: 18, dy: -24 });
    place(P, BP.tokol, 'Tököl', tk * seg(t, at('f12', 0.5), at('f12', 0.7)), { col: C.soviet, dx: 18 });
    A(tk, () => trace([P(BP.parliament), P([19.06, 47.44]), P([19.02, 47.38]), P(BP.tokol)], eio(seg(t, at('f12', 0.55), e('f12', -0.2))), C.accent, { w: 6, dash: [12, 9] }));
    const RX = 1260, RW = 564;
    A(tk, () => {
      txt('3 November', RX, 300, { size: 48, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('noon, Parliament:', RX, 370, RW, { size: 36, weight: 700 });
      txtFit('talks on the withdrawal', RX, 418, RW, { size: 34, weight: 500, color: C.soft });
      A(seg(t, at('f12', 0.55), at('f12', 0.7)), () => {
        txtFit('evening: the Soviet base', RX, 500, RW, { size: 36, weight: 700 });
        txtFit('at Tököl', RX, 548, RW, { size: 34, weight: 500, color: C.soft });
      });
      A(seg(t, s('f13', 0.2), s('f13', 1.0)), () => {
        txtFit('about 10 p.m.', RX, 640, RW, { size: 44, weight: 800, family: DISPLAY, color: C.fire });
        txtFit('the KGB arrests', RX, 700, RW, { size: 36, weight: 700 });
        txtFit('Pál Maléter and his delegation', RX, 748, RW, { size: 34, weight: 500, color: C.soft });
      });
    });
    pulse(...P(BP.tokol), t, s('f13', 0.5), C.fire, { a: span(t, s('f13', 0.4), e('f13', 1.4), 0.4, 0.6) });
  }
}

// ---------- 7: twelve days ----------
function partTwelve(t) {
  const g1 = span(t, s('g1', 0), s('g2', 0.2), 0.5, 0.5);
  A(g1, () => {
    txt('In twelve days', W / 2, 300, { size: 60, weight: 800, family: DISPLAY, align: 'center' });
    ['one-party rule ended', 'the ÁVH dissolved', 'towns and factories run by councils'].forEach((w, i) =>
      chip(w, W / 2, 440 + i * 120, { color: C.accent, size: 42, a: seg(t, at('g1', 0.3 + i * 0.18), at('g1', 0.4 + i * 0.18)) }));
  });
  const g2 = span(t, s('g2', 0), s('g3', 0.2), 0.5, 0.5);
  A(g2, () => {
    const roles = ['students', 'workers', 'young fighters', 'old fighters', 'soldiers', 'neighbours'];
    roles.forEach((r, i) => {
      const x = 260 + i * 280, ai = seg(t, s('g2', 0.2 + i * 0.4), s('g2', 0.7 + i * 0.4));
      figure(x, 560, i === 2 ? 1.6 : i === 3 ? 1.9 : 1.8, i === 4 ? C.soft : C.ink, ai);
      A(ai, () => txt(r, x, 680, { size: 34, weight: 600, color: C.soft, align: 'center' }));
    });
    A(seg(t, at('g2', 0.7), at('g2', 0.85)), () => txt('many paid with their lives', W / 2, 820, { size: 40, weight: 700, color: C.accent, align: 'center' }));
  });
  const g3 = span(t, s('g3', 0), e('g3', 0.8), 0.5, 0.6);
  A(g3, () => {
    txt('Not every death came in battle.', W / 2, 400, { size: 52, weight: 800, family: DISPLAY, align: 'center' });
    A(seg(t, at('g3', 0.4), at('g3', 0.55)), () => txt('unarmed crowds were fired on', W / 2, 520, { size: 42, weight: 600, color: C.soft, align: 'center' }));
    A(seg(t, at('g3', 0.7), at('g3', 0.85)), () => txt('men of the ÁVH were lynched', W / 2, 600, { size: 42, weight: 600, color: C.soft, align: 'center' }));
  });
  const g4 = span(t, s('g4', 0), DURATION + 1, 0.8, 0.1);
  if (g4 > 0) {
    const P = mkBp(VIEWS.city);
    budapest(P, g4, { night: 0.8 });
    // a few lit windows
    const R = rng(3);
    A(g4, () => {
      for (const rd of ROADS) for (let i = 1; i < rd.length; i++) for (let j = 0; j < 6; j++) {
        const u = R(), [x, y] = P([lerp(rd[i - 1][0], rd[i][0], u), lerp(rd[i - 1][1], rd[i][1], u)]);
        ctx.fillStyle = `rgba(217,180,90,${0.3 + R() * 0.45})`; ctx.fillRect(x + (R() - 0.5) * 50, y + (R() - 0.5) * 50, 4, 4);
      }
    });
    A(g4, () => {
      txt('Saturday night', LX, 300, { size: 52, weight: 800, family: DISPLAY, color: C.accent });
      txtFit('3 November', LX, 370, LW, { size: 40, weight: 700 });
      txtFit('hoping for a quiet Sunday', LX, 430, LW, { size: 36, weight: 500, color: C.soft });
    });
    const g5 = seg(t, s('g5', 0.2), e('g5', 2.0));
    if (g5 > 0) {
      const r = MAPR;
      clipTo(r, () => [[r.x + r.w + 30, r.y + 160, Math.PI * 0.9], [r.x + r.w + 30, r.y + r.h - 160, Math.PI * 1.1], [r.x + 160, r.y + r.h + 30, -Math.PI * 0.4]].forEach(([x, y, an]) =>
        tank(x + Math.cos(an) * 150 * eio(g5), y + Math.sin(an) * 150 * eio(g5), an, { a: g4 * g5, sc: 1.1 })));
      A(seg(t, s('g5', 0.4), s('g5', 1.4)), () => {
        txtFit('before dawn,', LX, 560, LW, { size: 40, weight: 700, color: C.soviet });
        txtFit('4 November', LX, 620, LW, { size: 40, weight: 700, color: C.soviet });
      });
    }
  }
}

// ---------- chapter cards and credits ----------
const CH_DATES = ['23 October', '24–28 October', '25–26 October', '24–30 October', '27–30 October', '31 October – 3 November', '23 October – 3 November'];
function titleCards(t) {
  CH.forEach((ch, i) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.9, () => { ctx.fillStyle = 'rgba(14,17,21,0.95)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 520 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.accent, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1560, 112, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, align: 'center' });
      tricolour(W / 2, y + 82, 70, 6);
      if (CH_DATES[i]) txt(CH_DATES[i], W / 2, y + 160, { size: 44, weight: 600, color: C.soft, align: 'center' });
    });
  });
}
const MUSIC = ['“Long Note Two” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“When The Wind Blows” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Stay the Course” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  '1956 Institute (National Széchényi Library): Revolution and freedom fight; The days of freedom; chronology.',
  'UN Special Committee on the Problem of Hungary, Report (1957).',
  'National Security Archive: CPSU Presidium notes, 31 October 1956.',
  'Gábor Jobbágyi, Hungarian Review; András Kő and Lambert J. Nagy, Kossuth tér 1956 (2001).',
  'Imre Berki, Rendvédelem-történeti Füzetek (2007); National Remembrance Committee, Faces of 1956.',
  'Maps: schematic.',
];
function credits(t) {
  ctx.fillStyle = C.bgDeep; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(BG, 0, 0); ctx.fillStyle = 'rgba(10,12,15,0.55)'; ctx.fillRect(0, 0, W, H);
  flag(W / 2 - 60, 96, 120, { hole: 1 });
  const t1 = 'THE FREEDOM FIGHT, 23 OCTOBER TO 4 NOVEMBER';
  txt(t1, W / 2, 262, { size: fit(t1, 1640, 72, { weight: 800, family: DISPLAY }), weight: 800, family: DISPLAY, align: 'center' });
  txt('Hungary 1956 · original animation', W / 2, 336, { size: 40, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 420, { size: 32, weight: 800, color: C.accent, align: 'center', spacing: '4px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 468 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 640, { size: 32, weight: 800, color: C.accent, align: 'center', spacing: '4px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 688 + j * 44, 1700, { size: 32, weight: 500, align: 'center', color: j === SOURCES.length - 1 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partOct23, partFight, partThursday, partCouncils, partCeasefire, partCapitals, partTwelve];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    // the ribbon: from "twelve days" on, but not over the title
    const ra = seg(t, s('o3', 0.2), s('o3', 1.0)) * (1 - span(t, e('o3', 0.3), CH[0].at + 0.6, 0.6, 0.01)) + span(t, CH[0].at + 3.2, DURATION + 1, 0.6, 0.01);
    ribbon(t, Math.min(1, ra) * (1 - seg(t, e('g5', 1.4), e('g5', 2.4))));
    titleCards(t);
    A(seg(t, e('g5', 1.6), e('g5', 2.6)), () => credits(t));
  },
});
