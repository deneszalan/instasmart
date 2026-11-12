// "The crushing, 4 November 1956" („A leverés, 1956. november 4.”): the long film of Hungary 1956's section The end,
// 16:9, 1920x1080. Part of a series of six films with one look: deep ink ground with a faint paper grain, Archivo for
// titles and cards, Alegreya Sans for everything else, the 1956 flag with the hole as the emblem, a tricolour rule under
// chapter titles, Hungary drawn from the shared outline (earth-last-fighting-csepel-dunapentele.js).
// This film's accent is violet-grey; its motif is time itself: a strip along the top that counts the hours of the morning
// of 4 November (chapters 1–2), then the days from 4 November to 12 December (chapters 3–6), and the radio's carrier wave,
// a thin line that moves while a voice speaks and lies flat in silence.
// The same scene plays the Hungarian version: kit.js swaps every whole string for its labels-fr.json entry, so words and
// numbers are drawn as separate strings. All maps are schematic; Soviet moves are drawn as arrows, places of resistance
// as warm lights that go grey when they fall; no explosions, no falling figures.
const W = 1920, H = 1080;
const { seg, lerp, span, fmt, clamp } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key) => (T[key][0] + T[key][1]) / 2;
const TAU = Math.PI * 2;

const C = {
  bg0: '#111418', bg1: '#181c22',
  ink: '#ece6d6', soft: 'rgba(236,230,214,0.74)', faint: 'rgba(236,230,214,0.2)', hair: 'rgba(236,230,214,0.09)',
  accent: '#a399c9', accentSoft: 'rgba(163,153,201,0.32)', accentDim: 'rgba(163,153,201,0.14)',
  red: '#c63a32', white: '#ece6d6', green: '#3f7f52',
  soviet: '#b0645a', sovietSoft: 'rgba(176,100,90,0.3)', warm: '#e3b45c', warmSoft: 'rgba(227,180,92,0.28)', fallen: '#6b7079',
  land: 'rgba(236,230,214,0.045)', river: '#34516b', card: 'rgba(12,14,18,0.95)', panel: 'rgba(18,21,27,0.9)', paper: '#e6dfcd', pInk: '#26231e',
};
const HEAD = 'Archivo', TEXT = 'Alegreya Sans';

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
function fit(str, maxW, size, o = {}) { let z = size; while (z > 20 && textW(str, { ...o, size: z }) > maxW) z -= 2; return z; }
function txtFit(str, x, y, maxW, o = {}) { txt(str, x, y, { ...o, size: fit(str, maxW, o.size ?? 36, o) }); }
/** A rounded label as wide as its text (in Hungarian, as wide as the Hungarian). Returns its width. */
function chip(str, x, y, { color = C.ink, bg = C.panel, size = 34, weight = 700, a = 1, align = 'center', line = true, family = TEXT, maxW = 1600 } = {}) {
  const z = fit(str, maxW, size, { weight, family });
  const w = textW(str, { size: z, weight, family }), pad = z * 0.62, h = z * 1.62;
  const x0 = align === 'left' ? x : align === 'right' ? x - w - pad * 2 : x - w / 2 - pad;
  A(a, () => {
    k.rrect(x0, y - h / 2, w + pad * 2, h, h / 2); ctx.fillStyle = bg; ctx.fill();
    if (line) { ctx.lineWidth = 2.5; ctx.strokeStyle = color; ctx.stroke(); }
    txt(str, x0 + pad + w / 2, y + 1, { size: z, weight, color, align: 'center', family });
  });
  return w + pad * 2;
}
function card(x, y, w, h, { bg = C.panel, r = 16, line = null, lw = 2 } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = bg; ctx.fill();
  if (line) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); }
}
/** A stamp, as on a document. */
function stamp(str, x, y, col, a = 1, rot = -0.06, size = 36) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const w = textW(str, { size, weight: 800, family: HEAD, spacing: '3px' }) + 40;
    ctx.strokeStyle = col; ctx.lineWidth = 4; k.rrect(-w / 2, -size * 0.85, w, size * 1.7, 6); ctx.stroke();
    txt(str, 0, 2, { size, weight: 800, family: HEAD, color: col, align: 'center', spacing: '3px' });
    ctx.restore();
  });
}
function arrowHead(x, y, ang, col, size = 18) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * size, y + Math.sin(ang) * size);
  ctx.lineTo(x + Math.cos(ang + 2.5) * size, y + Math.sin(ang + 2.5) * size);
  ctx.lineTo(x + Math.cos(ang - 2.5) * size, y + Math.sin(ang - 2.5) * size);
  ctx.closePath(); ctx.fill();
}
/** A polyline drawn up to fraction u of its length, with an arrow head at the tip. */
function trace(pts, u, col, { w = 6, dash = [14, 10], head = true, headSize = 18 } = {}) {
  if (u <= 0) return;
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
}
/** A smooth curve through points (Catmull-Rom), as a polyline. */
function smooth(pts, n = 10) {
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
/** A value that steps from one setting to the next as lines begin: [[key, value, delay], ...]. */
function stepper(t, steps, dur = 0.9) {
  let v = steps[0][1];
  for (let i = 1; i < steps.length; i++) {
    const [key, val, d = 0.2] = steps[i];
    const p = eio(seg(t, s(key, d), s(key, d) + dur));
    if (p <= 0) break;
    v = lerp(v, val, p);
  }
  return v;
}

// ---------- the series emblem: the flag of 1956, with the hole ----------
function flag(cx, cy, w, a = 1) {
  const h = w * 0.62, b = h / 3, x0 = cx - w / 2, y0 = cy - h / 2;
  A(a, () => {
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.fillStyle = C.red; ctx.fillRect(x0, y0, w, b + 0.5);
    ctx.fillStyle = C.white; ctx.fillRect(x0, y0 + b, w, b + 0.5);
    ctx.fillStyle = C.green; ctx.fillRect(x0, y0 + 2 * b, w, b);
    // the hole, where the coat of arms was cut out: the ground shows through
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(cx, cy, b * 0.42, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(236,230,214,0.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, w, h);
  });
}
/** The thin tricolour rule under chapter titles. */
function tricolour(cx, y, w, a = 1) {
  A(a, () => {
    const t3 = w / 3;
    ctx.fillStyle = C.red; ctx.fillRect(cx - w / 2, y, t3, 5);
    ctx.fillStyle = C.white; ctx.fillRect(cx - w / 2 + t3, y, t3, 5);
    ctx.fillStyle = C.green; ctx.fillRect(cx - w / 2 + 2 * t3, y, t3, 5);
  });
}
/** The motif: the carrier wave. amp 0 is a flat line (silence). */
function carrier(x0, x1, y, amp, t, col = C.accent, lw = 3, seed = 0) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath();
  for (let x = x0; x <= x1; x += 4) {
    const f = (x - x0) / (x1 - x0), env = Math.sin(Math.PI * f) ** 0.6;
    const v = Math.sin(x * 0.045 + t * 7 + seed) * 0.55 + Math.sin(x * 0.13 - t * 11 + seed * 2) * 0.3 + Math.sin(x * 0.021 + t * 3) * 0.25;
    const y1 = y + amp * env * v;
    if (x === x0) ctx.moveTo(x, y1); else ctx.lineTo(x, y1);
  }
  ctx.stroke();
}

// ---------- the ground, painted once: deep ink with a faint paper grain ----------
let BG = null;
function paintBackground() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H;
  const g = BG.getContext('2d');
  const gr = g.createRadialGradient(W * 0.45, H * 0.4, 100, W / 2, H / 2, 1300);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg0);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // paper grain: a seeded scatter of faint specks and fibres
  let seed = 1956;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 26000; i++) {
    const x = rnd() * W, y = rnd() * H, l = rnd();
    g.fillStyle = l > 0.5 ? `rgba(236,230,214,${0.012 + rnd() * 0.022})` : `rgba(0,0,0,${0.03 + rnd() * 0.05})`;
    g.fillRect(x, y, 1 + rnd() * 1.6, 1 + rnd() * 1.6);
  }
  g.strokeStyle = 'rgba(236,230,214,0.018)'; g.lineWidth = 1;
  for (let i = 0; i < 380; i++) {
    const x = rnd() * W, y = rnd() * H, a = rnd() * TAU, l = 8 + rnd() * 26;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const v = g.createRadialGradient(W / 2, H / 2, 760, W / 2, H / 2, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.2)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}

// ---------- Hungary (schematic), the series outline ----------
const OUTLINE = [[16.11, 46.87], [16.28, 47.0], [16.45, 47.15], [16.48, 47.4], [16.43, 47.56], [16.64, 47.75], [16.9, 47.7], [17.05, 47.82], [17.16, 48.01],
  [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.87, 47.82], [19.05, 48.05], [19.48, 48.1], [19.75, 48.2], [20.05, 48.17], [20.3, 48.27], [20.55, 48.53],
  [21.12, 48.5], [21.45, 48.57], [21.72, 48.35], [22.15, 48.41], [22.4, 48.25], [22.9, 47.95], [22.7, 47.82], [22.3, 47.7], [22.02, 47.53], [21.95, 47.12],
  [21.65, 46.95], [21.4, 46.62], [21.05, 46.28], [20.7, 46.18], [20.26, 46.12], [19.85, 46.17], [19.4, 46.05], [18.95, 45.95], [18.8, 45.88], [18.45, 45.77],
  [18.15, 45.78], [17.7, 45.9], [17.4, 45.95], [17.15, 46.15], [16.88, 46.36], [16.6, 46.47], [16.38, 46.63]];
const DANUBE = [[17.16, 48.0], [17.6, 47.83], [18.13, 47.76], [18.74, 47.8], [18.95, 47.75], [19.06, 47.6], [19.05, 47.45], [18.95, 47.2], [18.93, 46.95], [18.92, 46.6], [18.85, 46.2], [18.8, 45.88]];
const BALATON = [[17.25, 46.73], [17.55, 46.8], [17.85, 46.93], [18.1, 47.05], [18.17, 47.03], [17.92, 46.87], [17.6, 46.72], [17.32, 46.68]];
const TOWN = {
  budapest: [19.04, 47.5], gyor: [17.63, 47.68], miskolc: [20.78, 48.1], debrecen: [21.63, 47.53], szeged: [20.15, 46.25], pecs: [18.23, 46.07],
  fehervar: [18.41, 47.19], szolnok: [20.2, 47.17], veszprem: [17.91, 47.09], dunapentele: [18.935, 46.96], mecsek: [18.08, 46.16], salgotarjan: [19.8, 48.1],
  tokol: [18.97, 47.32], uzhhorod: [22.3, 48.62],
};
/** A projection of the map: k pixels per degree of latitude, longitude shrunk by cos(47°). */
const projection = (x0, y0, kk) => (lon, lat) => [x0 + (lon - 16.0) * kk * 0.682, y0 + (48.62 - lat) * kk];
const PM = projection(120, 236, 186); // the large map, left: x 120–1000, y 236–788
function path(pts, P) { ctx.beginPath(); pts.forEach(([lo, la], i) => (i ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); }
function hungary(P, a = 1, { label = true, labelXY = null, river = true, lw = 2.5 } = {}) {
  A(a, () => {
    path(OUTLINE, P); ctx.closePath(); ctx.fillStyle = C.land; ctx.fill(); ctx.strokeStyle = C.soft; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
    if (river) {
      path(BALATON, P); ctx.closePath(); ctx.fillStyle = C.river; ctx.fill();
      ctx.strokeStyle = C.river; ctx.lineWidth = Math.max(3, lw * 2); path(DANUBE, P); ctx.stroke();
    }
    if (label) { const [lx, ly] = labelXY ?? P(16.0, 48.42); txt('schematic map', lx, ly, { size: 28, weight: 500, color: C.soft }); }
  });
}
/** A town: a small dot and its name. */
function town(P, key, name, { dx = 14, dy = 0, align = 'left', size = 30, color = C.ink, r = 6, weight = 600 } = {}) {
  const [x, y] = P(...TOWN[key]);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (name) txt(name, x + dx, y + dy, { size, weight, color, align });
}
/** A place of resistance: a warm light while it holds, grey once it has fallen. */
function stronghold(x, y, hold, fall, t, r = 11) {
  const f = clamp(fall);
  const col = f >= 1 ? C.fallen : C.warm;
  A(hold * (1 - f), () => {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + x * 0.01);
    const g = ctx.createRadialGradient(x, y, 2, x, y, r * 4);
    g.addColorStop(0, 'rgba(227,180,92,0.5)'); g.addColorStop(1, 'rgba(227,180,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * (1.6 + pulse * 0.4), 0, TAU); ctx.stroke();
  });
  A(hold, () => { ctx.fillStyle = f > 0 && f < 1 ? C.warm : col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
  if (f > 0 && f < 1) A(hold * f, () => { ctx.fillStyle = C.fallen; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
}

// ---------- Budapest (schematic) ----------
const PB = (lon, lat) => [150 + (lon - 18.93) * 3400 * 0.676, 196 + (47.60 - lat) * 3400];
// a closer view of Pest, for the embassy (chapter 4)
const PB2 = (lon, lat) => [110 + (lon - 18.98) * 5000 * 0.676, 210 + (47.585 - lat) * 5000];
const B_DANUBE = [[19.075, 47.605], [19.06, 47.578], [19.05, 47.552], [19.045, 47.53], [19.042, 47.51], [19.045, 47.495], [19.052, 47.484], [19.064, 47.473], [19.07, 47.462], [19.066, 47.452], [19.048, 47.432], [19.03, 47.412], [19.012, 47.394], [18.998, 47.38]];
const B_SOROKSAR = [[19.068, 47.455], [19.086, 47.44], [19.1, 47.421], [19.106, 47.401], [19.102, 47.38]];
const BP = {
  parliament: [19.046, 47.507], embassy: [19.079, 47.516], heroes: [19.077, 47.515], corvin: [19.0705, 47.4855], ujpest: [19.09, 47.565], csepel: [19.077, 47.425],
  szena: [19.022, 47.509], moricz: [19.047, 47.477], kobanya: [19.135, 47.48], command: [19.205, 47.512], hall: [19.098, 47.502],
};
function budapest(a = 1, { label = true, P: PB = PB_DEFAULT, clip = null } = {}) {
  A(a, () => {
    if (clip) { ctx.beginPath(); ctx.rect(...clip); ctx.clip(); }
    // the city as a soft shape
    if (!clip) { ctx.fillStyle = C.land; ctx.beginPath(); ctx.ellipse(...PB(19.08, 47.49), 420, 330, 0, 0, TAU); ctx.fill(); }
    // Csepel Island between the two branches
    ctx.fillStyle = 'rgba(236,230,214,0.05)'; ctx.beginPath();
    [...B_DANUBE.slice(9), ...B_SOROKSAR.slice().reverse()].forEach(([lo, la], i) => (i ? ctx.lineTo(...PB(lo, la)) : ctx.moveTo(...PB(lo, la))));
    ctx.closePath(); if (!clip) ctx.fill();
    ctx.strokeStyle = C.river; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 22; path(smooth(B_DANUBE), PB); ctx.stroke();
    ctx.lineWidth = 10; path(smooth(B_SOROKSAR), PB); ctx.stroke();
    // Margaret Island
    { const [m0x, m0y] = PB(19.047, 47.527), [m1x, m1y] = PB(19.047, 47.517); ctx.fillStyle = 'rgba(236,230,214,0.22)'; ctx.beginPath(); ctx.ellipse(m0x, m0y, 8, (m1y - m0y) * 1.0, 0.05, 0, TAU); ctx.fill(); }
    txt('Buda', ...PB(18.965, 47.535), { size: 36, weight: 700, color: C.faint, align: 'center' });
    txt('Pest', ...(clip ? PB(19.125, 47.568) : PB(19.16, 47.545)), { size: 36, weight: 700, color: C.faint, align: 'center' });
    txt('Danube', ...PB(19.008, 47.445), { size: 26, weight: 500, color: '#5d7a94', align: 'center' });
    if (label) txt('schematic map', 150, 976, { size: 28, weight: 500, color: C.soft });
  });
}
const PB_DEFAULT = PB;
function bp(key, P = PB) { return P(...BP[key]); }

// ---------- simple shapes: a tank, a figure, a factory, a candle, a radio, Parliament ----------
/** A tank as a plain shape, pointing along `ang`. */
function tank(x, y, sc = 1, ang = 0, col = '#7d838c') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc); ctx.fillStyle = col;
  k.rrect(-22, -9, 44, 18, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(-2, 0, 8, 0, TAU); ctx.fill();
  ctx.fillRect(4, -2, 22, 4);
  ctx.restore();
}
/** A plain standing figure, without a face. */
function figure(x, y, sc, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y - 34 * sc, 11 * sc, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 17 * sc, y + 16 * sc); ctx.quadraticCurveTo(x - 18 * sc, y - 18 * sc, x, y - 19 * sc);
  ctx.quadraticCurveTo(x + 18 * sc, y - 18 * sc, x + 17 * sc, y + 16 * sc); ctx.closePath(); ctx.fill();
}
/** A factory with saw-tooth roof and a chimney; smoke 0..1. */
function factory(x, y, w, smoke, t, col = '#3b4049') {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x, y);
  const n = 3, tw = (w * 0.72) / n;
  ctx.lineTo(x, y - 60);
  for (let i = 0; i < n; i++) { ctx.lineTo(x + tw * i + tw, y - 92); ctx.lineTo(x + tw * i + tw, y - 60); }
  ctx.lineTo(x + w, y - 60); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillRect(x + w - 30, y - 150, 20, 92);
  if (smoke > 0) A(smoke, () => {
    for (let i = 0; i < 4; i++) {
      const p = ((t * 0.35 + i / 4) % 1), r = 10 + p * 22;
      A(0.35 * (1 - p), () => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + w - 20 + p * 40, y - 162 - p * 70, r, 0, TAU); ctx.fill(); });
    }
  });
}
/** A small candle with a soft flame. */
function candle(x, y, t, a = 1, sc = 1) {
  A(a, () => {
    ctx.fillStyle = 'rgba(236,230,214,0.78)'; k.rrect(x - 7 * sc, y - 34 * sc, 14 * sc, 34 * sc, 3); ctx.fill();
    const fl = 1 + 0.08 * Math.sin(t * 9 + x);
    const g = ctx.createRadialGradient(x, y - 44 * sc, 1, x, y - 44 * sc, 26 * sc);
    g.addColorStop(0, 'rgba(227,180,92,0.55)'); g.addColorStop(1, 'rgba(227,180,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 44 * sc, 26 * sc, 0, TAU); ctx.fill();
    ctx.fillStyle = C.warm; ctx.beginPath(); ctx.ellipse(x, y - 45 * sc, 5 * sc, 10 * sc * fl, 0, 0, TAU); ctx.fill();
  });
}
/** An old radio set; on 0..1 lights its dial. */
function radio(cx, cy, w, col, on) {
  const h = w * 0.58, x0 = cx - w / 2, y0 = cy - h / 2;
  card(x0, y0, w, h, { bg: '#22262d', r: 22, line: 'rgba(236,230,214,0.25)', lw: 2 });
  // grille
  ctx.strokeStyle = 'rgba(236,230,214,0.14)'; ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(x0 + 30, y0 + 34 + i * 16); ctx.lineTo(x0 + w * 0.55, y0 + 34 + i * 16); ctx.stroke(); }
  // dial
  const dx = x0 + w * 0.78, dy = cy - 4, r = h * 0.28;
  ctx.fillStyle = '#15181d'; ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fill();
  A(on, () => {
    const g = ctx.createRadialGradient(dx, dy, 2, dx, dy, r * 1.4);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= 0.5; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, r * 1.4, 0, TAU); ctx.fill();
  });
  ctx.strokeStyle = on > 0.5 ? col : 'rgba(236,230,214,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(-0.9) * r * 0.8, dy + Math.sin(-0.9) * r * 0.8); ctx.stroke();
  // feet
  ctx.fillStyle = '#22262d'; ctx.fillRect(x0 + 30, y0 + h, 26, 10); ctx.fillRect(x0 + w - 56, y0 + h, 26, 10);
}
/** Parliament as a long facade with a dome; lit 0..1 lights one window. */
function parliament(cx, by, w, lit, col = '#2e333b') {
  const x0 = cx - w / 2;
  ctx.fillStyle = col;
  ctx.fillRect(x0, by - 90, w, 90);
  ctx.fillRect(x0 + w * 0.08, by - 120, w * 0.12, 30); ctx.fillRect(x0 + w * 0.8, by - 120, w * 0.12, 30);
  ctx.fillRect(cx - w * 0.09, by - 150, w * 0.18, 60);
  ctx.beginPath(); ctx.ellipse(cx, by - 150, w * 0.08, 70, 0, Math.PI, TAU); ctx.fill();
  ctx.fillRect(cx - 3, by - 250, 6, 40);
  for (const sx of [0.05, 0.22, 0.75, 0.93]) { ctx.beginPath(); ctx.moveTo(x0 + w * sx - 10, by - 90); ctx.lineTo(x0 + w * sx, by - 140); ctx.lineTo(x0 + w * sx + 10, by - 90); ctx.fill(); }
  // windows
  for (let i = 0; i < 18; i++) {
    const wx = x0 + 28 + i * ((w - 56) / 17);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(wx - 6, by - 66, 12, 26);
  }
  if (lit > 0) A(lit, () => {
    const wx = x0 + 28 + 11 * ((w - 56) / 17);
    const g = ctx.createRadialGradient(wx, by - 53, 2, wx, by - 53, 60);
    g.addColorStop(0, 'rgba(227,180,92,0.5)'); g.addColorStop(1, 'rgba(227,180,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(wx, by - 53, 60, 0, TAU); ctx.fill();
    ctx.fillStyle = C.warm; ctx.fillRect(wx - 6, by - 66, 12, 26);
  });
}
/** A bus, side view. */
function bus(x, y, sc = 1, col = '#8e95a0') {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = col; k.rrect(-60, -30, 120, 46, 10); ctx.fill();
  ctx.fillStyle = 'rgba(17,20,24,0.8)'; for (let i = 0; i < 5; i++) ctx.fillRect(-52 + i * 22, -22, 16, 14);
  ctx.fillStyle = '#1b1e23'; ctx.beginPath(); ctx.arc(-34, 18, 9, 0, TAU); ctx.arc(34, 18, 9, 0, TAU); ctx.fill();
  ctx.restore();
}
/** An armoured car, plain. */
function armoured(x, y, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#6a7079';
  ctx.beginPath(); ctx.moveTo(-34, 10); ctx.lineTo(-34, -6); ctx.lineTo(-20, -18); ctx.lineTo(24, -18); ctx.lineTo(34, -6); ctx.lineTo(34, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b1e23'; ctx.beginPath(); ctx.arc(-20, 12, 7, 0, TAU); ctx.arc(20, 12, 7, 0, TAU); ctx.fill();
  ctx.restore();
}
/** A letter on paper. */
function letter(x, y, w, h, lines, a = 1, rot = 0) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = C.paper; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(38,35,30,0.25)'; for (let i = 0; i < lines; i++) ctx.fillRect(-w / 2 + 18, -h / 2 + 22 + i * 16, w - 36 - (i % 3) * 18, 5);
    ctx.restore();
  });
}

// ---------- the time strips along the top: hours of 4 November, then the days to 12 December ----------
const HX0 = 200, HX1 = 1720, HY = 112;
const H0 = 21.5, H1 = 34; // from 21.30 on 3 November to 10.00 on 4 November
const hx = (h) => lerp(HX0, HX1, (h - H0) / (H1 - H0));
function hourStrip(a, cur, marks, t) {
  A(a, () => {
    ctx.fillStyle = C.hair; ctx.fillRect(HX0, HY - 2, HX1 - HX0, 4);
    for (let h = 22; h <= 34; h++) {
      const x = hx(h), big = h === 24;
      ctx.fillStyle = big ? C.soft : C.faint; ctx.fillRect(x - 1, HY - (big ? 14 : 8), 2, big ? 28 : 16);
      // an hour's label gives way to a mark nearby
      const near = marks.reduce((m, [mh, , al]) => Math.max(m, Math.abs(mh - h) < 0.75 ? al : 0), 0);
      if (h % 2 === 0) A(1 - near, () => txt(`${h % 24}.00`, x, HY + 34, { size: 28, weight: 500, color: big ? C.soft : C.faint, align: 'center' }));
    }
    txt('3 Nov', hx(22.75), HY - 32, { size: 28, weight: 700, color: C.faint, align: 'center' });
    txt('4 Nov', hx(29), HY - 32, { size: 28, weight: 700, color: C.soft, align: 'center' });
    for (const [h, label, al, row = 0] of marks) {
      if (al <= 0) continue;
      A(al, () => {
        const x = hx(h); ctx.fillStyle = C.accent; ctx.fillRect(x - 2, HY - 12, 4, 24 + row * 30);
        txt(label, x, HY + 34 + row * 36, { size: 30, weight: 700, color: C.accent, align: 'center' });
      });
    }
    const x = hx(cur);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(x, HY + 6); ctx.lineTo(x - 11, HY - 14); ctx.lineTo(x + 11, HY - 14); ctx.closePath(); ctx.fill();
  });
}
const DAYS = 39; // 4 November (0) … 12 December (38)
const DX0 = 170, DX1 = 1750, DY = 112;
const dx = (d) => lerp(DX0, DX1, (d + 0.5) / DAYS);
const dayOf = (m, d) => (m === 11 ? d - 4 : 26 + d);
const DAYLABEL = (i) => (i <= 26 ? `${i + 4} Nov` : `${i - 26} Dec`);
if (dayOf(12, 12) !== 38 || DAYLABEL(38) !== '12 Dec' || DAYLABEL(0) !== '4 Nov') throw new Error('calendar');
/** bands: [from, to, colour, alpha]; marks: [day, alpha, colour]. */
function dayStrip(a, cur, { bands = [], marks = [], curA = 1 } = {}) {
  A(a, () => {
    const cw = (DX1 - DX0) / DAYS;
    for (let i = 0; i < DAYS; i++) { ctx.fillStyle = i < 27 ? 'rgba(236,230,214,0.07)' : 'rgba(236,230,214,0.05)'; ctx.fillRect(DX0 + i * cw + 1, DY - 12, cw - 2, 24); }
    for (const [d0, d1, col, al] of bands) if (al > 0) A(al, () => { ctx.fillStyle = col; ctx.fillRect(DX0 + d0 * cw + 1, DY - 12, (d1 - d0 + 1) * cw - 2, 24); });
    txt('NOVEMBER', DX0, DY - 36, { size: 26, weight: 700, color: C.soft, spacing: '3px' });
    txt('DECEMBER', DX0 + 27 * cw, DY - 36, { size: 26, weight: 700, color: C.soft, spacing: '3px' });
    ctx.fillStyle = C.faint; ctx.fillRect(DX0 + 27 * cw - 1, DY - 22, 2, 44);
    for (const [d, al, col = C.accent, row = 0] of marks) if (al > 0) A(al, () => {
      const x = dx(d); ctx.fillStyle = col; ctx.fillRect(x - 2, DY + 12, 4, 10 + row * 34);
      txt(DAYLABEL(d), x, DY + 42 + row * 34, { size: 28, weight: 700, color: col, align: 'center' });
    });
    if (curA > 0) A(curA, () => {
      const x = DX0 + (cur + 0.5) * cw;
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(x, DY - 10); ctx.lineTo(x - 11, DY - 30); ctx.lineTo(x + 11, DY - 30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.strokeRect(x - cw / 2, DY - 13, cw, 26);
    });
  });
}
/** A heading at the top right of the right-hand panel. */
function heading(str, x, y, a, { size = 54, color = C.ink, maxW = 760, align = 'left' } = {}) {
  A(a, () => txtFit(str, x, y, maxW, { size, weight: 800, family: HEAD, color, align }));
}

// ---------- cold open: 5.20, the radio, the words; then the title ----------
function partOpen(t) {
  const out = 1 - seg(t, s('o3', 0.1), s('o3', 1.0));
  A(out, () => {
    const a1 = eout(seg(t, s('o1', 0.2), s('o1', 1.2)));
    A(a1, () => {
      txt('4 November 1956', 300, 330, { size: 40, weight: 700, color: C.accent });
      txt('5.20', 292, 462, { size: 200, weight: 800, family: HEAD });
      txt('Free Radio Kossuth, Budapest', 300, 594, { size: 36, weight: 600, color: C.soft });
    });
    const ra = eout(seg(t, s('o1', 0.8), s('o1', 1.8)));
    A(ra, () => {
      radio(1360, 450, 520, C.accent, 1);
      // the 35 seconds: the voice moves the carrier while he speaks, then it lies still
      const talk = span(t, s('o1', 1.2), e('o2', 0.2), 0.6, 1.0);
      carrier(1110, 1610, 230, 34 * talk, t, C.accent, 3);
      txt('35', 1360, 650, { size: 64, weight: 800, family: HEAD, color: C.accent, align: 'right' });
      txt('seconds', 1376, 654, { size: 36, weight: 600, color: C.soft });
    });
    const q = eout(seg(t, s('o2', 1.6), s('o2', 2.6))), q2 = eout(seg(t, mid('o2'), mid('o2') + 1));
    A(q, () => txtFit('“Our troops are in combat.', 300, 770, 1400, { size: 60, weight: 700, color: C.ink }));
    A(q2, () => txtFit('The Government is at its post.”', 300, 850, 1400, { size: 60, weight: 700, color: C.ink }));
    A(q2, () => txt('Prime Minister Imre Nagy', 300, 918, { size: 34, weight: 600, color: C.accent }));
  });
  // o3: the shape of the weeks to come, along the days
  const st = span(t, s('o3', 0.3), e('o4', 0.4), 0.8, 0.9);
  if (st > 0) {
    const g1 = eio(seg(t, s('o3', 0.6), s('o3', 2.0))), g2 = eio(seg(t, mid('o3'), mid('o3') + 2.2));
    A(st, () => {
      ctx.save(); ctx.translate(0, 360);
      dayStrip(1, 0, { bands: [[0, 7, C.sovietSoft, g1], [8, 38, C.accentSoft, g2]], marks: [[0, g1, C.soft], [7, g1, C.soviet], [38, g2, C.accent]], curA: 0 });
      A(g1, () => txt('armed resistance', dx(3.5), 230, { size: 38, weight: 700, color: C.soviet, align: 'center' }));
      A(g2, () => txt('strikes, without weapons', dx(23), 230, { size: 38, weight: 700, color: C.accent, align: 'center' }));
      ctx.restore();
    });
  }
  // the title, until the first chapter card
  const ti = eout(seg(t, e('o4', 0.3), e('o4', 1.4)));
  A(ti, () => {
    flag(W / 2, 330, 120);
    txt('THE END', W / 2, 438, { size: 34, weight: 700, color: C.accent, align: 'center', spacing: '8px' });
    const title = 'The crushing, 4 November 1956';
    txt(title, W / 2, 540 + (1 - ti) * 16, { size: fit(title, 1640, 104, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
    carrier(W / 2 - 420, W / 2 + 420, 630, 0, t, C.accentSoft, 2);
    txt('Hungary 1956', W / 2, 700, { size: 42, weight: 600, color: C.soft, align: 'center' });
  });
}

// ---------- 1: before dawn ----------
const HOURS_1 = [['a1', 22], ['a3', 24], ['a4', 28.25]];
function partDawn(t) {
  const cur = stepper(t, HOURS_1);
  const hs = eout(seg(t, s('a1', -0.2), s('a1', 0.8)));
  hourStrip(hs, cur, [[22, '22.00', 0], [24, '0.00', 0], [28.25, '4.15', eout(seg(t, s('a4'), s('a4', 0.8)))]], t);
  const ma = eout(seg(t, s('a1', 0.1), s('a1', 1.2)));
  hungary(PM, ma);
  A(ma, () => {
    town(PM, 'budapest', 'Budapest', { dx: -16, dy: -26, align: 'right', size: 32, weight: 700 });
    for (const [kk, n, o] of [['gyor', 'Győr', { dy: -24, dx: -10 }], ['miskolc', 'Miskolc', { dy: -24 }], ['debrecen', 'Debrecen', { dy: -24, dx: -12 }], ['szeged', 'Szeged', { dy: 26, dx: -10 }],
      ['pecs', 'Pécs', { dy: 26, dx: -10 }], ['fehervar', 'Székesfehérvár', { dy: 28, dx: -70 }], ['szolnok', 'Szolnok', { dy: 26 }]]) town(PM, kk, n, { size: 26, color: C.soft, r: 5, weight: 500, ...o });
  });
  // right panel
  const RX = 1090;
  const a1 = span(t, s('a1', 0.3), s('a3', 0.2), 0.7, 0.6);
  A(a1, () => {
    heading('3 November 1956', RX, 270, 1, { size: 50 });
    txt('talks on the withdrawal', RX, 350, { size: 36, weight: 600, color: C.soft });
    txt('of Soviet troops', RX, 396, { size: 36, weight: 600, color: C.soft });
    const [bx, by] = PM(...TOWN.budapest);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(bx, by, 24, 0, TAU); ctx.stroke();
  });
  const a2 = span(t, s('a2', 0.3), s('a3', 0.2), 0.7, 0.6);
  A(a2, () => {
    card(RX, 470, 690, 210, { line: C.soviet });
    txt('31 October · Moscow', RX + 34, 524, { size: 34, weight: 700, color: C.soviet });
    txt('The Soviet leaders decide,', RX + 34, 580, { size: 38, weight: 600 });
    txt('in secret, to crush the revolution', RX + 34, 626, { size: 34, weight: 500, color: C.soft });
    txt('their own notes, published in the 1990s', RX, 716, { size: 26, weight: 500, color: C.faint });
  });
  const a3 = span(t, s('a3', 0.3), s('a4', 0.4), 0.7, 0.6);
  A(a3, () => {
    const [x, y] = PM(...TOWN.tokol);
    ctx.fillStyle = C.soviet; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    txt('Tököl', x + 16, y + 6, { size: 28, weight: 700, color: C.soviet });
    heading('near midnight', RX, 270, 1, { size: 50 });
    txt('at the Soviet headquarters, Tököl:', RX, 350, { size: 34, weight: 600, color: C.soft });
    txt('the Hungarian negotiators', RX, 410, { size: 40, weight: 700 });
    txt('are arrested', RX, 458, { size: 40, weight: 700 });
    txt('among them Defence Minister Pál Maléter', RX, 522, { size: 30, weight: 500, color: C.soft });
  });
  // a4: the attack, as arrows
  const ARROWS = [
    [[22.6, 48.45], [21.63, 47.53], [20.6, 47.35], [19.25, 47.5]],
    [[22.25, 48.6], [20.78, 48.1], [19.6, 47.8], [19.12, 47.56]],
    [[21.5, 46.35], [20.15, 46.27], [19.6, 46.75], [19.1, 47.42]],
    [[19.3, 47.32], [18.6, 47.25], [17.75, 47.6]],
    [[18.6, 47.05], [18.3, 46.5], [18.23, 46.12]],
    [[19.9, 47.8], [19.5, 47.6], [19.1, 47.52]],
  ];
  const ag = span(t, s('a4', 0.2), e('a7', 0.6), 0.4, 0.8);
  A(ag * ma, () => ARROWS.forEach((pts, i) => trace(pts.map((p) => PM(...p)), eio(seg(t, s('a4', 0.4 + i * 0.22), s('a4', 2.6 + i * 0.22))), C.soviet, { w: 6, headSize: 18 })));
  A(ag * ma, () => txt('Soviet moves, simplified', PM(16.0, 48.42)[0], PM(16.0, 48.42)[1] + 38, { size: 28, weight: 500, color: C.soviet }));
  const a4 = span(t, s('a4', 0.2), s('a6', 0.2), 0.6, 0.6);
  A(a4, () => {
    txt('4 November', RX, 270, { size: 40, weight: 700, color: C.accent });
    txt('4.15', RX - 6, 390, { size: 150, weight: 800, family: HEAD });
    txt('the attack begins', RX, 492, { size: 38, weight: 600, color: C.soft });
  });
  const a5 = span(t, s('a5', 0.2), s('a6', 0.2), 0.6, 0.6);
  A(a5, () => {
    chip('Operation Whirlwind', RX, 586, { align: 'left', size: 30, color: C.soviet, weight: 700 });
    txt('about', RX, 660, { size: 32, weight: 600, color: C.soft });
    txt(fmt(60000), RX, 724, { size: 92, weight: 800, family: HEAD });
    const w6 = textW(fmt(60000), { size: 92, weight: 800, family: HEAD }) + 20;
    txt('soldiers', RX + w6, 740, { size: 36, weight: 600, color: C.soft });
    txt('17', RX, 812, { size: 60, weight: 800, family: HEAD });
    txt('divisions, in part', RX + textW('17', { size: 60, weight: 800, family: HEAD }) + 16, 816, { size: 36, weight: 600, color: C.soft });
    txt('count: Miklós Horváth, military historian', RX, 878, { size: 28, weight: 500, color: C.soft });
    txtFit('UN estimate: some 2,500 Soviet tanks in Hungary by 3 November', RX, 922, 730, { size: 28, weight: 500, color: C.soft });
  });
  // a6: the barracks, surrounded, then disarmed
  const BARRACKS = ['gyor', 'fehervar', 'veszprem', 'szolnok', 'debrecen', 'miskolc', 'szeged', 'pecs'];
  const ba = span(t, s('a6', 0.1), e('a7', 0.6), 0.6, 0.8);
  if (ba > 0) A(ba * ma, () => BARRACKS.forEach((kk, i) => {
    const [x, y] = PM(...TOWN[kk]), dis = eio(seg(t, s('a6', 1.2 + i * 0.15), s('a6', 2.2 + i * 0.15)));
    ctx.fillStyle = dis > 0.5 ? C.fallen : C.green; ctx.fillRect(x - 11, y - 33, 22, 16);
    ctx.strokeStyle = C.soviet; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(x, y - 25, 20, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }));
  const a6 = span(t, s('a6', 0.2), s('a7', 0.2), 0.6, 0.6);
  A(a6, () => {
    heading('The Hungarian army', RX, 290, 1, { size: 50 });
    txt('barracks surrounded overnight', RX, 370, { size: 36, weight: 600, color: C.soft });
    txt('generals forbid resistance', RX, 420, { size: 36, weight: 600, color: C.soft });
    chip('disarmed almost everywhere', RX, 510, { align: 'left', size: 36, color: C.ink });
  });
  // a7: the conscripts
  const a7 = span(t, s('a7', 0.2), e('a7', 0.6), 0.6, 0.8);
  A(a7, () => {
    ctx.strokeStyle = 'rgba(163,153,201,0.7)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; path(DANUBE, PM); ctx.stroke(); ctx.lineCap = 'butt';
    for (let i = 0; i < 3; i++) figure(RX + 70 + i * 92, 420, 1.5, i === 1 ? '#8b919b' : '#646a73');
    heading('Soviet conscripts', RX, 540, 1, { size: 46 });
    txt('many from distant regions', RX, 604, { size: 34, weight: 600, color: C.soft });
    txt('some believed they were in Egypt, at Suez', RX, 656, { size: 34, weight: 600, color: C.accent });
    txt('witnesses to the UN committee', RX, 712, { size: 26, weight: 500, color: C.faint });
    const [x, y] = PM(18.95, 47.15); txt('Danube', x + 18, y, { size: 28, weight: 700, color: C.accent });
  });
}

// ---------- 2: two voices on the radio ----------
const HOURS_2 = [['b1', 28.25], ['b1', 29.083, 0.4], ['b5', 29.333, 0.2], ['b5', 30, 3.2], ['b6', 31.95], ['b7', 32.117]];
function partRadio(t) {
  const cur = stepper(t, HOURS_2);
  const showH = 1 - seg(t, s('b8', -0.4), s('b8', 0.6));
  hourStrip(showH, cur, [[28.25, '4.15', 1], [29.083, '5.05', eout(seg(t, s('b1', 0.4), s('b1', 1.2)))], [29.333, '5.20', eout(seg(t, s('b5', 0.2), s('b5', 1))), 1],
    [31.95, '7.57', eout(seg(t, s('b6', 0.2), s('b6', 1)))], [32.117, '8.07', eout(seg(t, s('b7', 0.1), s('b7', 0.9))), 1]], t);
  // b7: the carrier wave stays on the air until 9.45, without a voice
  A(showH * eout(seg(t, s('b7', 1.0), s('b7', 2.0))), () => {
    ctx.fillStyle = C.accentSoft; ctx.fillRect(hx(32.117), HY - 5, hx(33.75) - hx(32.117), 10);
    txt('carrier wave only, to 9.45', hx(33.0), HY - 30, { size: 24, weight: 600, color: C.accent, align: 'center' });
  });
  const radios = 1 - seg(t, s('b8', -0.4), s('b8', 0.6));
  if (radios > 0) A(radios, () => {
    const L = 520, R = 1400, RY = 450;
    // left: another station, Kádár's government
    const lo = eout(seg(t, s('b1', 0.2), s('b1', 1.2)));
    A(0.35 + 0.65 * lo, () => radio(L, RY, 470, C.soviet, lo));
    const ltalk = span(t, s('b1', 0.4), e('b4', 0.2), 0.6, 0.8);
    carrier(L - 230, L + 230, RY - 180, 26 * ltalk, t, C.soviet, 3, 1.3);
    A(lo, () => {
      txt('another station', L, RY - 232, { size: 34, weight: 700, color: C.soviet, align: 'center' });
      txt('5.05', L, RY + 200, { size: 64, weight: 800, family: HEAD, color: C.soviet, align: 'center' });
      txtFit('János Kádár’s “Revolutionary', L, RY + 266, 780, { size: 38, weight: 700, align: 'center' });
      txtFit('Worker-Peasant Government”', L, RY + 312, 780, { size: 38, weight: 700, align: 'center' });
    });
    const b2 = span(t, s('b2', 0.2), s('b3', 0.3), 0.6, 0.6);
    A(b2, () => {
      // where it came from: a small map
      const P = projection(L - 330, RY + 356, 58);
      hungary(P, 1, { label: false, river: false, lw: 1.8 });
      const [sx, sy] = P(...TOWN.szolnok), [ux, uy] = P(...TOWN.uzhhorod);
      ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(sx, sy, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = C.soviet; ctx.beginPath(); ctx.arc(ux, uy, 8, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx + 8, sy); ctx.lineTo(L + 140, RY + 450); ctx.moveTo(ux + 10, uy); ctx.lineTo(L + 140, RY + 400); ctx.stroke();
      txt('Uzhhorod, Soviet Ukraine', L + 150, RY + 400, { size: 30, weight: 700, color: C.soviet });
      txt('by the 1956 Institute’s account', L + 150, RY + 434, { size: 26, weight: 500, color: C.soft });
      txt('said to be: Szolnok', L + 150, RY + 484, { size: 30, weight: 600, color: C.soft });
      txt('schematic map', L + 150, RY + 526, { size: 26, weight: 500, color: C.faint });
    });
    const b3 = span(t, s('b3', 0.5), s('b4', 0.2), 0.6, 0.6);
    A(b3, () => {
      chip('on paper, still a minister in Nagy’s government', L, RY + 404, { size: 32, color: C.soft, weight: 600, maxW: 820 });
      chip('1 November: flown to Moscow', L, RY + 484, { size: 32, color: C.soft, weight: 600 });
    });
    const b4 = span(t, s('b4', 0.2), s('b5', 0.2), 0.6, 0.6);
    A(b4, () => {
      chip('“counter-revolution”', L, RY + 400, { size: 40, color: C.soviet });
      txt('asks the Soviet army for help', L, RY + 482, { size: 34, weight: 600, color: C.soft, align: 'center' });
    });
    // right: Free Radio Kossuth, Imre Nagy
    const ro = eout(seg(t, s('b5', 0.1), s('b5', 1.1)));
    const silent = eio(seg(t, s('b7', 0.3), s('b7', 1.4)));
    A(0.35 + 0.65 * ro * (1 - 0.6 * silent), () => radio(R, RY, 470, C.accent, ro * (1 - silent)));
    const rtalk = span(t, s('b5', 0.3), e('b5', -1.0), 0.5, 0.8) + span(t, s('b6', 0.2), e('b6', 0.2), 0.5, 0.8);
    carrier(R - 230, R + 230, RY - 180, 26 * Math.min(1, rtalk) * (1 - silent), t, C.accent, 3, 0.4);
    A(ro, () => {
      txt('Free Radio Kossuth, Budapest', R, RY - 232, { size: 34, weight: 700, color: C.accent, align: 'center' });
      A(1 - seg(t, s('b6', -0.2), s('b6', 0.4)), () => {
        txt('5.20', R, RY + 200, { size: 64, weight: 800, family: HEAD, color: C.accent, align: 'center' });
        txt('Prime Minister Imre Nagy', R, RY + 266, { size: 38, weight: 700, align: 'center' });
        A(eout(seg(t, mid('b5'), mid('b5') + 0.8)), () => chip('about 6.00: to the Yugoslav embassy', R, RY + 350, { size: 32, color: C.ink, weight: 600, maxW: 820 }));
      });
      A(seg(t, s('b6', 0), s('b6', 0.6)) * (1 - seg(t, s('b7', -0.2), s('b7', 0.4))), () => {
        txt('7.57', R, RY + 200, { size: 64, weight: 800, family: HEAD, color: C.accent, align: 'center' });
        txt('the Writers’ Union', R, RY + 266, { size: 38, weight: 700, align: 'center' });
        txt('“Help Hungary!”', R, RY + 336, { size: 50, weight: 800, color: C.accent, align: 'center' });
      });
      A(seg(t, s('b7', 0), s('b7', 0.6)), () => {
        txt('8.07', R, RY + 200, { size: 64, weight: 800, family: HEAD, color: C.soft, align: 'center' });
        txt('silence', R, RY + 270, { size: 50, weight: 700, color: C.soft, align: 'center' });
      });
    });
  });
  // b8–b10: Bibó in Parliament
  const pa = span(t, s('b8', 0.1), DURATION, 0.9, 0.1);
  if (pa > 0) A(pa, () => {
    const lit = eout(seg(t, mid('b8'), mid('b8') + 1.2));
    parliament(560, 640, 860, lit);
    // Soviet tanks on the square, as plain shapes
    const tk = eout(seg(t, s('b8', 0.8), s('b8', 2.4)));
    A(tk, () => { for (let i = 0; i < 4; i++) tank(220 + i * 230, 740 + (i % 2) * 34, 1.5, 0); });
    txt('Parliament, 4 November', 560, 846, { size: 30, weight: 600, color: C.soft, align: 'center' });
    A(lit, () => {
      heading('István Bibó', 1110, 300, 1, { size: 58 });
      txt('minister of state since 3 November', 1110, 366, { size: 32, weight: 600, color: C.soft });
      txt('the last minister at his post', 1110, 412, { size: 32, weight: 600, color: C.accent });
    });
    const b9 = eout(seg(t, s('b9', 0.2), s('b9', 1.0)));
    A(b9, () => {
      card(1110, 470, 700, 250, { bg: C.paper, r: 6 });
      txt('PROCLAMATION', 1140, 512, { size: 26, weight: 800, family: HEAD, color: C.pInk, spacing: '4px' });
      txtFit('not to recognise as lawful', 1140, 568, 640, { size: 34, weight: 700, color: C.pInk });
      txtFit('the occupation forces', 1140, 614, 640, { size: 34, weight: 600, color: C.pInk });
      txtFit('or their “puppet government”', 1140, 660, 640, { size: 34, weight: 600, color: C.pInk });
    });
    const b10 = eout(seg(t, s('b10', 0.2), s('b10', 1.0))), b10b = eout(seg(t, mid('b10'), mid('b10') + 0.9));
    A(b10, () => chip('“every means of passive resistance”', 1110, 790, { align: 'left', size: 34, color: C.accent, maxW: 720 }));
    A(b10b, () => {
      txt('except', 1110, 870, { size: 30, weight: 600, color: C.soft });
      const ex = textW('except', { size: 30, weight: 600 }) + 24;
      chip('Budapest’s water', 1110 + ex, 870, { align: 'left', size: 28, color: C.ink, weight: 600 });
      const w2 = textW('Budapest’s water', { size: 28, weight: 600 }) + 28 * 1.24 + 18;
      chip('public services', 1110 + ex + w2, 870, { align: 'left', size: 28, color: C.ink, weight: 600 });
    });
  });
}

// ---------- 3: the last fighting ----------
const DAYS_3 = [['c1', 0], ['c2', 2, 0.6], ['c5', 5], ['c7', 3], ['c9', 15, 0.6], ['c10', 7], ['c11', 7]];
function partFight(t) {
  const cur = stepper(t, DAYS_3);
  const ds = eout(seg(t, s('c1', -0.2), s('c1', 0.8))) * (1 - seg(t, s('c11', -0.6), s('c11', 0.4)));
  const fallM = (key, d = 0.6) => eio(seg(t, s(key, d), s(key, d + 1.2)));
  dayStrip(ds, cur, {
    bands: [[0, 7, C.sovietSoft, eout(seg(t, s('c10', 0.2), s('c10', 1.2)))]],
    marks: [[2, fallM('c2'), C.soft], [5, fallM('c6', 0), C.soft], [3, fallM('c8', 1.5), C.soft, 1], [15, fallM('c9', 2.0), C.soft], [7, fallM('c10', 0.2), C.soviet, 1]],
  });
  // c1–c6: Budapest
  const bA = span(t, s('c1', 0.1), s('c7', 0.4), 0.9, 0.8);
  if (bA > 0) A(bA, () => {
    budapest(1);
    const hold = eout(seg(t, s('c1', 0.6), s('c1', 1.6)));
    const others = [['szena', 'c2'], ['moricz', 'c2'], ['kobanya', 'c3']];
    for (const [kk, key] of others) { const [x, y] = bp(kk); stronghold(x, y, hold * 0.8, fallM(key, 1.4), t, 8); }
    const corvinFall = fallM('c2', 1.0), csepelFall = fallM('c6', 0.1), ujpestFall = fallM('c6', 0.6);
    const [cx, cy] = bp('corvin'), [ux, uy] = bp('ujpest'), [sx, sy] = bp('csepel');
    stronghold(cx, cy, hold, corvinFall, t);
    stronghold(ux, uy, hold, ujpestFall, t);
    stronghold(sx, sy, hold, csepelFall, t);
    A(hold, () => {
      txt('Corvin köz', cx + 34, cy + 4, { size: 30, weight: 700 });
      txt('Újpest', ux + 40, uy + 4, { size: 30, weight: 700 });
      txt('Csepel', sx + 40, sy + 4, { size: 30, weight: 700 });
      A(0.8, () => txt('places of resistance', 150, 940, { size: 26, weight: 500, color: C.warm }));
    });
    const csHalo = span(t, s('c3', 0.4), s('c7'), 0.6, 0.6);
    A(csHalo, () => {
      for (const [x, y] of [[ux, uy], [sx, sy]]) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 32, 0, TAU); ctx.stroke(); }
    });
  });
  const RX = 1090;
  const c1 = span(t, s('c1', 0.3), s('c2', 0.2), 0.6, 0.6);
  A(c1, () => {
    heading('Budapest', RX, 280, 1, { size: 56 });
    txt('young fighters and workers fight on', RX, 356, { size: 36, weight: 600, color: C.soft });
    txt('hoping to hold out until the world acts', RX, 404, { size: 36, weight: 600, color: C.accent });
  });
  const c2 = span(t, s('c2', 0.2), s('c3', 0.2), 0.6, 0.6);
  A(c2, () => {
    heading('Corvin köz', RX, 280, 1, { size: 56 });
    txt('artillery attack on 5 November', RX, 356, { size: 36, weight: 600, color: C.soft });
    chip('held until the morning of 6 November', RX, 440, { align: 'left', size: 34, color: C.ink });
  });
  const c3 = span(t, s('c3', 0.2), s('c5', 0.2), 0.6, 0.6);
  A(c3, () => {
    heading('The working districts', RX, 280, 1, { size: 52 });
    txt('held out longest', RX, 350, { size: 36, weight: 600, color: C.soft });
    txt('Újpest, in the north', RX, 420, { size: 36, weight: 700 });
    txt('Csepel, in the south', RX, 470, { size: 36, weight: 700 });
  });
  const c4 = span(t, s('c4', 0.1), s('c5', 0.2), 0.6, 0.6);
  A(c4, () => {
    factory(RX + 10, 700, 170, 0, t, '#3b4049');
    figure(RX + 260, 690, 1.3, '#8b919b'); figure(RX + 330, 690, 1.3, '#5f7d63');
    txt('workers and the local army unit', RX, 760, { size: 34, weight: 600, color: C.soft });
    txt('fight together', RX, 804, { size: 34, weight: 600, color: C.soft });
  });
  const c5 = span(t, s('c5', 0.2), s('c7', 0.2), 0.6, 0.6);
  A(c5, () => {
    heading('Csepel, 9 November', RX, 280, 1, { size: 52 });
    txt('Soviet artillery shells the town centre', RX, 356, { size: 36, weight: 600, color: C.soft });
    txt('54', RX, 470, { size: 110, weight: 800, family: HEAD });
    const x2 = RX + textW('54', { size: 110, weight: 800, family: HEAD }) + 26;
    txt('people died there that day,', x2, 448, { size: 34, weight: 600 });
    txt('whole families among them', x2, 494, { size: 34, weight: 600, color: C.soft });
    A(eout(seg(t, s('c6', 0.2), s('c6', 1.0))), () => chip('by evening, its defence was broken', RX, 590, { align: 'left', size: 32, color: C.soft, weight: 600 }));
    txt('Tulipán and Molnár, Betekintő, 2016', RX, 660, { size: 26, weight: 500, color: C.faint });
  });
  // c7–c10: the country
  const hA = span(t, s('c7', -0.2), s('c11', 0.2), 0.9, 0.7);
  if (hA > 0) A(hA, () => {
    hungary(PM, 1);
    town(PM, 'budapest', 'Budapest', { dx: -16, dy: -26, align: 'right', size: 30, weight: 700, color: C.soft });
    const [bx, by] = PM(...TOWN.budapest); stronghold(bx, by, 1, 1, t, 8);
    const [dx0, dy0] = PM(...TOWN.dunapentele), [mx, my] = PM(...TOWN.mecsek);
    const dHold = eout(seg(t, s('c7', 0.5), s('c7', 1.5))), dFall = fallM('c8', 2.4);
    stronghold(dx0, dy0, dHold, dFall, t);
    A(dHold, () => { txt('Dunapentele', dx0 + 24, dy0 - 4, { size: 30, weight: 700 }); txt('then Sztálinváros', dx0 + 24, dy0 + 32, { size: 26, weight: 500, color: C.soft }); });
    // its radio, rings going out
    const rr = span(t, s('c8', 0.1), s('c8', 2.6), 0.4, 0.6);
    A(rr, () => { for (let i = 0; i < 3; i++) { const p = (t * 0.6 + i / 3) % 1; A(1 - p, () => { ctx.strokeStyle = C.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dx0, dy0, 20 + p * 120, 0, TAU); ctx.stroke(); }); } });
    const mHold = eout(seg(t, s('c9', 0.2), s('c9', 1.2))), mFall = fallM('c9', 2.2);
    stronghold(mx, my, mHold, mFall, t);
    A(mHold, () => { txt('Mecsek hills', mx - 20, my - 34, { size: 30, weight: 700, align: 'right' }); town(PM, 'pecs', 'Pécs', { dx: 14, dy: 22, size: 26, color: C.soft, r: 5, weight: 500 }); });
    trace([PM(18.08, 46.16), PM(17.9, 45.95), PM(17.75, 45.8)], eio(seg(t, s('c9', 2.6), s('c9', 4.2))), C.warm, { w: 4, dash: [8, 8], headSize: 14 });
    A(eout(seg(t, s('c9', 3.4), s('c9', 4.2))), () => txt('to Yugoslavia', PM(17.7, 45.8)[0] - 10, PM(17.7, 45.8)[1] + 30, { size: 26, weight: 600, color: C.warm, align: 'right' }));
  });
  const c7 = span(t, s('c7', 0.3), s('c9', 0.2), 0.6, 0.6);
  A(c7, () => {
    heading('Dunapentele', RX, 280, 1, { size: 56 });
    txt('a new steel town, then named Sztálinváros', RX, 352, { size: 32, weight: 600, color: C.soft });
    txt('workers and soldiers together', RX, 400, { size: 32, weight: 600, color: C.soft });
    A(eout(seg(t, s('c8', 0.2), s('c8', 1.0))), () => {
      txt('Rákóczi radio', RX, 480, { size: 36, weight: 700, color: C.warm });
      txt('calls for help in Hungarian and German', RX, 526, { size: 32, weight: 600, color: C.soft });
    });
    A(eout(seg(t, mid('c8'), mid('c8') + 1)), () => {
      txt('7 November', RX, 616, { size: 36, weight: 700 });
      txt('bombed and shelled; by the afternoon, taken', RX, 662, { size: 32, weight: 600, color: C.soft });
    });
  });
  const c9 = span(t, s('c9', 0.2), s('c10', 0.2), 0.6, 0.6);
  A(c9, () => {
    heading('Near Pécs', RX, 280, 1, { size: 56 });
    txt('several hundred men in the Mecsek hills', RX, 352, { size: 34, weight: 600, color: C.soft });
    chip('until 19 November', RX, 432, { align: 'left', size: 34, color: C.warm });
    txt('then on foot to Yugoslavia', RX, 510, { size: 34, weight: 600, color: C.soft });
  });
  const c10 = span(t, s('c10', 0.2), s('c11', 0.2), 0.6, 0.6);
  A(c10, () => {
    heading('By 11 November', RX, 280, 1, { size: 56 });
    txt('the organised armed resistance', RX, 352, { size: 36, weight: 600, color: C.soft });
    txt('is broken', RX, 400, { size: 36, weight: 600, color: C.soft });
  });
  // c11–c14: counting the dead, with whose figures they are
  const nA = span(t, s('c11', 0.1), DURATION, 0.9, 0.1);
  if (nA > 0) A(nA, () => {
    const X0 = 180, PX = 1100 / 3000, bx = (n) => X0 + n * PX, RC = 1370, BH = 56;
    heading('How many died?', X0, 150, 1, { size: 58, maxW: 1500 });
    txt('in the whole uprising, from 23 October, and by whose count', X0, 212, { size: 32, weight: 600, color: C.soft });
    txt('Hungarians', X0, 300, { size: 36, weight: 700 });
    // the Statistical Office's count, 2,502, of which 1,945 in Budapest
    const Y = 340, g = eio(seg(t, s('c11', 0.8), s('c11', 2.4)));
    ctx.fillStyle = C.accent; ctx.fillRect(X0, Y, 1945 * PX * g, BH);
    ctx.fillStyle = 'rgba(163,153,201,0.5)'; ctx.fillRect(X0 + 1945 * PX * g, Y, 557 * PX * g, BH);
    A(seg(t, s('c11', 2.0), s('c11', 2.8)), () => {
      txt('Budapest', X0 + 16, Y + BH / 2 + 1, { size: 30, weight: 700, color: C.bg0 });
      txt(fmt(1945), bx(1945) - 14, Y + BH / 2 + 1, { size: 30, weight: 700, color: C.bg0, align: 'right' });
      txt(fmt(557), bx(2502) - 12, Y + BH / 2 + 1, { size: 28, weight: 700, color: C.bg0, align: 'right' });
      txt(fmt(2502), RC, Y + 14, { size: 52, weight: 800, family: HEAD });
      txt('known deaths', RC + textW(fmt(2502), { size: 52, weight: 800, family: HEAD }) + 16, Y + 20, { size: 32, weight: 600, color: C.soft });
      txt('Statistical Office (KSH), early 1957', RC, Y + 64, { size: 28, weight: 500, color: C.soft });
    });
    const r12 = eout(seg(t, s('c12', 0.2), s('c12', 1.2))), r12b = eout(seg(t, mid('c12'), mid('c12') + 1));
    A(r12, () => {
      const y = 476;
      ctx.fillStyle = C.ink; ctx.fillRect(bx(2700) - 2, Y - 14, 4, y - Y + 14);
      ctx.beginPath(); ctx.arc(bx(2700), y, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx(2700) + 14, y); ctx.lineTo(RC - 16, y); ctx.stroke();
      txt('about', RC, y, { size: 32, weight: 600, color: C.soft });
      txt(fmt(2700), RC + textW('about', { size: 32, weight: 600 }) + 12, y - 2, { size: 40, weight: 800, family: HEAD });
      txt('recent research', RC, y + 42, { size: 28, weight: 500, color: C.soft });
    });
    A(r12b, () => {
      const y = 600;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx(2500), y - 14); ctx.lineTo(bx(2500), y); ctx.lineTo(bx(3000), y); ctx.lineTo(bx(3000), y - 14); ctx.stroke();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx(3000) + 14, y); ctx.lineTo(RC - 16, y); ctx.stroke();
      txt(`${fmt(2500)}–${fmt(3000)}`, RC, y - 2, { size: 40, weight: 800, family: HEAD });
      txt('most sources', RC, y + 42, { size: 28, weight: 500, color: C.soft });
      txt('wounded: some 19,000', X0, y + 2, { size: 30, weight: 600, color: C.soft });
    });
    const r13 = eio(seg(t, s('c13', 0.2), s('c13', 1.4)));
    A(seg(t, s('c13', 0), s('c13', 0.6)), () => {
      const Y2 = 760;
      txt('Soviet soldiers', X0, Y2 - 40, { size: 36, weight: 700 });
      ctx.fillStyle = '#8a8f99'; ctx.fillRect(X0, Y2, 720 * PX * r13, BH);
      A(seg(t, s('c13', 1.2), s('c13', 1.8)), () => {
        txt(fmt(720), RC, Y2 + 14, { size: 52, weight: 800, family: HEAD });
        txt('dead', RC + textW(fmt(720), { size: 52, weight: 800, family: HEAD }) + 16, Y2 + 20, { size: 32, weight: 600, color: C.soft });
        txt('1,540 wounded', RC, Y2 + 64, { size: 30, weight: 600, color: C.soft });
        txt('the Soviet army’s own count, 1993', RC, Y2 + 104, { size: 28, weight: 500, color: C.soft });
      });
    });
    // c14: who they were, as quiet lights
    const r14 = eout(seg(t, s('c14', 0.2), s('c14', 1.4)));
    A(r14, () => {
      for (let i = 0; i < 9; i++) candle(470 + i * 72, 960, t + i * 0.7, eout(seg(t, s('c14', 0.3 + i * 0.25), s('c14', 1.2 + i * 0.25))), 1);
    });
  });
}

// ---------- 4: eighteen days in the embassy ----------
const DAYS_4 = [['d1', 0], ['d2', 3], ['d5', 17], ['d6', 18]];
function partEmbassy(t) {
  const cur = stepper(t, DAYS_4);
  const ds = eout(seg(t, s('d1', -0.2), s('d1', 0.8)));
  const span18 = eio(seg(t, s('d1', 0.6), e('d6', 0)));
  dayStrip(ds, cur, { bands: [[0, Math.round(lerp(0, 18, span18)), C.accentDim, 1]], marks: [[0, 1, C.soft], [3, eout(seg(t, s('d2', 0.4), s('d2', 1.2))), C.soft], [17, eout(seg(t, s('d5', 0.4), s('d5', 1.2)))], [18, eout(seg(t, s('d6', 0.2), s('d6', 1.0))), C.accent, 1]] });
  A(ds * eout(seg(t, s('d6', 0.8), s('d6', 1.8))), () => {
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(dx(0), DY + 58); ctx.lineTo(dx(0), DY + 66); ctx.lineTo(dx(16.5), DY + 66); ctx.stroke();
    txt('18', dx(9) - 8, DY + 92, { size: 32, weight: 800, family: HEAD, color: C.accent, align: 'right' });
    txt('days', dx(9) + 2, DY + 94, { size: 30, weight: 600, color: C.accent });
  });
  const mA = span(t, s('d1', 0.1), s('d8', 0.4), 0.9, 0.8);
  const [ex, ey] = bp('embassy', PB2), [px, py] = bp('parliament', PB2), [mx, my] = bp('command', PB2);
  if (mA > 0) A(mA, () => {
    budapest(1, { P: PB2, clip: [0, 196, 1060, 820], label: false });
    txt('schematic map', 110, 976, { size: 28, weight: 500, color: C.soft });
    ctx.fillStyle = C.soft; ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.fill();
    txt('Parliament', px - 16, py + 4, { size: 28, weight: 600, color: C.soft, align: 'right' });
    // the embassy, lit
    const g = ctx.createRadialGradient(ex, ey, 2, ex, ey, 60);
    g.addColorStop(0, 'rgba(163,153,201,0.45)'); g.addColorStop(1, 'rgba(163,153,201,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 60, 0, TAU); ctx.fill();
    ctx.fillStyle = C.accent; ctx.fillRect(ex - 12, ey - 12, 24, 24);
    txt('Yugoslav embassy', ex + 28, ey - 14, { size: 32, weight: 700, color: C.accent });
    txt('by Heroes’ Square', ex + 28, ey + 22, { size: 28, weight: 500, color: C.soft });
    const tk = eout(seg(t, s('d2', 0.2), s('d2', 1.2)));
    A(tk, () => { tank(ex - 40, ey - 62, 1.4, 0.4); tank(ex + 40, ey - 76, 1.4, -0.2); tank(ex + 110, ey - 58, 1.4, 0.1); });
    // b5's dashed walk, remembered
    A(0.5, () => trace([[px, py], [px + 60, py - 20], [ex - 14, ey]], 1, C.accentSoft, { w: 3, dash: [6, 8], head: false }));
    // 22 November: the bus to the Soviet command
    const bA = seg(t, s('d6', 0.2), s('d6', 0.8));
    if (bA > 0) {
      const route = [[ex + 10, ey + 96], [ex + 180, ey + 110], [(ex + mx) / 2 + 80, my + 100], [mx - 6, my + 34]];
      const go = eio(seg(t, s('d7', 0.1), s('d7', 2.6)));
      const pts = route; let tot = 0; const L = [];
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
      let left = go * tot, bx = pts[0][0], by = pts[0][1];
      for (let i = 1; i < pts.length; i++) { const f = Math.min(1, Math.max(0, left / L[i - 1])); if (left > 0) { bx = lerp(pts[i - 1][0], pts[i][0], f); by = lerp(pts[i - 1][1], pts[i][1], f); } left -= L[i - 1]; }
      A(bA, () => {
        trace(route, go, C.faint, { w: 3, dash: [6, 8], head: false });
        ctx.fillStyle = C.soviet; ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill();
        txt('Soviet military command', mx + 20, my - 150, { size: 30, weight: 700, color: C.soviet, align: 'right' });
        txt('Mátyásföld', mx + 20, my - 114, { size: 28, weight: 500, color: C.soft, align: 'right' });
        ctx.strokeStyle = C.sovietSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, my - 96); ctx.lineTo(mx, my - 12); ctx.stroke();
        bus(bx, by - 26, 0.9);
        const esc = eout(seg(t, s('d7', 1.6), s('d7', 2.6)));
        A(esc, () => { armoured(bx - 100, by - 20, 0.8); armoured(bx + 100, by - 20, 0.8); });
      });
    }
  });
  const RX = 1090;
  const d1 = span(t, s('d1', 0.3), s('d2', 0.2), 0.6, 0.6);
  A(d1, () => {
    heading('In the Yugoslav embassy', RX, 280, 1, { size: 50 });
    txt('Imre Nagy, ministers, writers,', RX, 350, { size: 34, weight: 600, color: C.soft });
    txt('their families', RX, 394, { size: 34, weight: 600, color: C.soft });
    for (let i = 0; i < 17; i++) { const x = RX + 20 + (i % 9) * 46, y = 470 + Math.floor(i / 9) * 58; A(eout(seg(t, s('d1', 1.4 + i * 0.07), s('d1', 2.0 + i * 0.07))), () => figure(x, y, 0.62, C.accent)); }
    txt('17', RX, 600, { size: 54, weight: 800, family: HEAD, color: C.accent });
    txt('children', RX + 70, 604, { size: 34, weight: 600, color: C.accent });
  });
  const d2 = span(t, s('d2', 0.2), s('d4', 0.2), 0.6, 0.6);
  A(d2, () => {
    heading('Outside: Soviet tanks', RX, 280, 1, { size: 50 });
    txt('Kádár’s government, sworn in on 7 November,', RX, 350, { size: 32, weight: 600, color: C.soft });
    txt('wants them out', RX, 394, { size: 32, weight: 600, color: C.soft });
    A(eout(seg(t, s('d3', 0.2), s('d3', 1.0))), () => chip('Nagy has not resigned', RX, 480, { align: 'left', size: 36, color: C.accent }));
  });
  const d4 = span(t, s('d4', 0.2), s('d5', 0.2), 0.6, 0.6);
  A(d4, () => {
    heading('Letters', RX, 280, 1, { size: 50 });
    txt('Belgrade', RX, 360, { size: 34, weight: 700, color: C.accent });
    txt('Kádár', RX + 640, 360, { size: 34, weight: 700, color: C.soviet, align: 'right' });
    const p1 = eio(seg(t, s('d4', 0.6), s('d4', 2.0)));
    letter(lerp(RX + 80, RX + 560, p1), 430, 90, 60, 3, 1, -0.05);
    chip('a written guarantee: home, freely', RX, 520, { align: 'left', size: 30, color: C.accent, weight: 600, maxW: 680 });
    const p2 = eio(seg(t, mid('d4'), mid('d4') + 1.4));
    A(seg(t, mid('d4'), mid('d4') + 0.3), () => letter(lerp(RX + 560, RX + 80, p2), 610, 90, 60, 3, 1, 0.05));
    A(eout(seg(t, mid('d4') + 0.4, mid('d4') + 1.2)), () => chip('Kádár: Romania instead', RX, 700, { align: 'left', size: 30, color: C.soviet, weight: 600 }));
    A(eout(seg(t, e('d4', -1.4), e('d4', -0.6))), () => chip('Nagy: no', RX, 780, { align: 'left', size: 30, color: C.ink, weight: 700 }));
  });
  const d5 = span(t, s('d5', 0.2), s('d6', 0.2), 0.6, 0.6);
  A(d5, () => {
    card(RX, 250, 700, 360, { bg: C.paper, r: 6 });
    txt('21 November 1956', RX + 34, 300, { size: 30, weight: 800, family: HEAD, color: C.pInk });
    txtFit('Kádár, in writing:', RX + 34, 366, 640, { size: 34, weight: 700, color: C.pInk });
    txtFit('no sanctions against Imre Nagy', RX + 34, 420, 640, { size: 34, weight: 600, color: C.pInk });
    txtFit('and his group', RX + 34, 464, 640, { size: 34, weight: 600, color: C.pInk });
    txtFit('“for their past activities”', RX + 34, 518, 640, { size: 34, weight: 700, color: C.pInk });
    ctx.strokeStyle = C.pInk; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RX + 400, 576); ctx.bezierCurveTo(RX + 450, 548, RX + 500, 590, RX + 560, 560); ctx.stroke();
  });
  const d6 = span(t, s('d6', 0.2), s('d8', 0.2), 0.6, 0.6);
  A(d6, () => {
    heading('22 November, 6.30 p.m.', RX, 280, 1, { size: 50 });
    txt('a bus, to take them home', RX, 350, { size: 34, weight: 600, color: C.soft });
    A(eout(seg(t, mid('d6'), mid('d6') + 0.8)), () => chip('Soviet soldiers board it', RX, 430, { align: 'left', size: 34, color: C.soviet }));
    A(eout(seg(t, s('d7', 0.4), s('d7', 1.2))), () => {
      txt('at the Soviet command,', RX, 520, { size: 32, weight: 600, color: C.soft });
      txt('the two Yugoslav diplomats are ordered off', RX, 564, { size: 32, weight: 600, color: C.soft });
    });
    A(eout(seg(t, mid('d7'), mid('d7') + 1)), () => txt('then, under armoured escort', RX, 640, { size: 34, weight: 700 }));
  });
  // d8–d10: to Romania
  const rA = span(t, s('d8', 0.1), DURATION, 0.9, 0.1);
  if (rA > 0) A(rA, () => {
    const P = projection(110, 330, 120);
    hungary(P, 1, { labelXY: [110, 690] });
    const [bx0, by0] = P(...TOWN.budapest);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx0, by0, 7, 0, TAU); ctx.fill();
    txt('Budapest', bx0 - 14, by0 - 22, { size: 28, weight: 700, align: 'right' });
    const SN = [1010, 560];
    trace([[bx0, by0], [560, 380], [860, 470], SN], eio(seg(t, s('d8', 0.4), s('d8', 2.6))), C.soviet, { w: 4, dash: [10, 10], headSize: 16 });
    A(eout(seg(t, s('d8', 1.8), s('d8', 2.6))), () => {
      ctx.fillStyle = C.soviet; ctx.beginPath(); ctx.arc(...SN, 9, 0, TAU); ctx.fill();
      txt('Snagov, near Bucharest', SN[0] - 16, SN[1] + 40, { size: 30, weight: 700, color: C.soviet, align: 'right' });
      txt('Romania', SN[0] - 16, SN[1] + 78, { size: 26, weight: 500, color: C.soft, align: 'right' });
      txt('direction only, not to scale', 110, 726, { size: 24, weight: 500, color: C.faint });
    });
    const RX2 = 1150;
    A(eout(seg(t, mid('d8'), mid('d8') + 0.9)), () => {
      txt('Kádár’s government:', RX2, 300, { size: 34, weight: 600, color: C.soft });
      txt('“they asked to go to Romania”', RX2, 352, { size: 38, weight: 700, color: C.soviet });
    });
    A(eout(seg(t, s('d9', 0.2), s('d9', 1.0))), () => {
      card(RX2, 420, 640, 210, { line: C.accent });
      txt('UN Special Committee, 1957', RX2 + 30, 468, { size: 28, weight: 700, color: C.accent });
      txt('taken by force,', RX2 + 30, 524, { size: 38, weight: 700 });
      txt('not even told where', RX2 + 30, 574, { size: 34, weight: 600, color: C.soft });
    });
    A(eout(seg(t, s('d10', 0.2), s('d10', 1.0))), () => {
      card(RX2, 690, 300, 210, { bg: C.paper, r: 6 });
      ctx.fillStyle = C.red; ctx.fillRect(RX2, 690, 300, 40);
      txt('APRIL 1957', RX2 + 150, 711, { size: 26, weight: 800, family: HEAD, color: C.white, align: 'center', spacing: '2px' });
      txt('14', RX2 + 150, 806, { size: 96, weight: 800, family: HEAD, color: C.pInk, align: 'center' });
      txt('Nagy arrested;', RX2 + 330, 760, { size: 32, weight: 700 });
      txt('a secret trial', RX2 + 330, 806, { size: 32, weight: 600, color: C.soft });
      txt('follows', RX2 + 330, 848, { size: 32, weight: 600, color: C.soft });
    });
  });
}

// ---------- 5: the workers' five weeks ----------
const DAYS_5 = [['e1', 0], ['e1', 7, 2.0], ['e3', 10], ['e5', 13], ['e6', 17], ['e7', 30], ['e9', 34], ['e12', 35], ['e13', 37], ['e14', 38]];
function partStrike(t) {
  const cur = stepper(t, DAYS_5);
  const ds = eout(seg(t, s('e1', -0.2), s('e1', 0.8)));
  const strikeBand = eio(seg(t, s('e1', 0.6), s('e1', 2.6)));
  const mk = (key, d = 0.3) => eout(seg(t, s(key, d), s(key, d + 0.8)));
  dayStrip(ds, cur, {
    bands: [[0, Math.round(lerp(0, 38, strikeBand)), C.accentDim, 1], [17, 18, C.accentSoft, mk('e6', 1.2)], [37, 38, C.accentSoft, mk('e14', 0.2)]],
    marks: [[10, mk('e3')], [17, mk('e6')], [30, mk('e7')], [34, mk('e9'), C.warm], [35, mk('e12'), C.soviet, 1], [37, mk('e13'), C.soviet]],
  });
  // the factories, along the bottom: still, then working again
  const fA = span(t, s('e1', 0.1), DURATION, 0.9, 0.1);
  const work = eio(seg(t, mid('e14'), e('e14', 0.6)));
  A(fA, () => {
    ctx.save(); ctx.translate(0, 990); ctx.scale(0.72, 0.72);
    for (let i = 0; i < 8; i++) factory(180 + i * 300, 0, 200, work * 0.9 + (1 - seg(t, s('e1', 0.4), s('e1', 1.6))) * 0.9 * (1 - work), t + i * 0.37, '#2b2f36');
    ctx.restore();
    A(1 - work, () => txt('the factories stand still', W - 110, 1010, { size: 28, weight: 600, color: C.accent, align: 'right' }));
    A(work, () => txt('work resumes, out of sheer need', W - 110, 1010, { size: 28, weight: 600, color: C.soft, align: 'right' }));
  });
  const CX = W / 2;
  const e1 = span(t, s('e1', 0.3), s('e2', 0.2), 0.6, 0.6);
  A(e1, () => { heading('The general strike', CX, 330, 1, { size: 64, align: 'center', maxW: 1500 }); txt('the guns fall quiet; the factories stand still', CX, 410, { size: 38, weight: 600, color: C.soft, align: 'center' }); });
  const e2 = span(t, s('e2', 0.2), s('e3', 0.2), 0.6, 0.6);
  A(e2, () => {
    heading('Workers’ councils', CX, 300, 1, { size: 60, align: 'center', maxW: 1500 });
    txt('elected in the factories since late October', CX, 370, { size: 36, weight: 600, color: C.soft, align: 'center' });
    // a council voting: raised hands, as simple figures
    for (let i = 0; i < 9; i++) {
      const x = CX - 360 + i * 90, up = eout(seg(t, s('e2', 1.0 + i * 0.12), s('e2', 1.6 + i * 0.12)));
      figure(x, 560, 1.2, '#7b818b');
      ctx.strokeStyle = '#7b818b'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 14, 530); ctx.lineTo(x + 20, lerp(530, 470, up)); ctx.stroke(); ctx.lineCap = 'butt';
    }
    txt('they now lead the resistance', CX, 650, { size: 36, weight: 700, color: C.accent, align: 'center' });
  });
  const e3 = span(t, s('e3', 0.2), s('e5', 0.2), 0.6, 0.6);
  A(e3, () => {
    card(CX - 560, 230, 1120, 230, { line: C.accent });
    txt('14 November', CX - 520, 282, { size: 32, weight: 700, color: C.accent });
    txtFit('Central Workers’ Council of Greater Budapest', CX - 520, 344, 1040, { size: 44, weight: 800, family: HEAD });
    txt('chairman: Sándor Rácz, aged 23', CX - 520, 410, { size: 34, weight: 600, color: C.soft });
    const d = eout(seg(t, s('e4', 0.2), s('e4', 1.0)));
    A(d, () => {
      txt('they demand', CX, 530, { size: 32, weight: 600, color: C.soft, align: 'center' });
      const items = ['Soviet troops out', 'free elections', 'Imre Nagy back'];
      const ws = items.map((str) => textW(str, { size: 34, weight: 700 }) + 34 * 1.24);
      const tot = ws.reduce((a, b) => a + b, 0) + 30 * (items.length - 1);
      let x = CX - tot / 2;
      items.forEach((str, i) => { A(eout(seg(t, s('e4', 0.4 + i * 0.3), s('e4', 1.0 + i * 0.3))), () => chip(str, x, 600, { align: 'left', size: 34, color: C.ink })); x += ws[i] + 30; });
    });
  });
  const e5 = span(t, s('e5', 0.2), s('e6', 0.2), 0.6, 0.6);
  A(e5, () => {
    heading('Talks in Parliament', CX, 270, 1, { size: 56, align: 'center', maxW: 1500 });
    txt('Kádár promises a great deal', CX, 336, { size: 36, weight: 600, color: C.soft, align: 'center' });
    card(CX - 300, 400, 600, 300, { bg: C.paper, r: 6 });
    txt('In writing, please', CX, 450, { size: 34, weight: 700, color: C.pInk, align: 'center' });
    ctx.fillStyle = 'rgba(38,35,30,0.22)'; for (let i = 0; i < 4; i++) ctx.fillRect(CX - 240, 500 + i * 26, 480 - (i % 2) * 90, 6);
    ctx.strokeStyle = 'rgba(38,35,30,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(CX - 60, 650); ctx.lineTo(CX + 240, 650); ctx.stroke(); ctx.setLineDash([]);
    txt('signature', CX + 90, 674, { size: 22, weight: 500, color: 'rgba(38,35,30,0.6)', align: 'center' });
    stamp('NOT SIGNED', CX + 10, 600, C.soviet, eout(seg(t, mid('e5'), mid('e5') + 0.6)), -0.08, 40);
    A(eout(seg(t, mid('e5') + 0.6, mid('e5') + 1.4)), () => txt('Kádár: his word should be enough', CX, 760, { size: 38, weight: 700, color: C.accent, align: 'center' }));
  });
  const e6 = span(t, s('e6', 0.2), s('e7', 0.2), 0.6, 0.6);
  A(e6, () => {
    heading('21 November', CX, 270, 1, { size: 56, align: 'center' });
    // the sports hall, ringed by tanks
    ctx.fillStyle = '#2e333b'; ctx.beginPath(); ctx.ellipse(CX, 500, 220, 90, 0, 0, TAU); ctx.fill();
    txt('the councils’ national meeting', CX, 500, { size: 30, weight: 600, color: C.soft, align: 'center' });
    for (let i = 0; i < 8; i++) { const ang = (i / 8) * TAU + 0.2, p = eout(seg(t, s('e6', 0.6 + i * 0.1), s('e6', 1.4 + i * 0.1))); A(p, () => tank(CX + Math.cos(ang) * 330, 500 + Math.sin(ang) * 150, 2.0, Math.cos(ang) > 0 ? Math.PI : 0)); }
    A(eout(seg(t, mid('e6'), mid('e6') + 0.8)), () => chip('blocked by Soviet tanks', CX, 690, { size: 34, color: C.soviet }));
    A(eout(seg(t, mid('e6') + 0.8, mid('e6') + 1.6)), () => txt('Budapest strikes for 48 hours', CX, 776, { size: 40, weight: 700, color: C.accent, align: 'center' }));
  });
  const e7 = span(t, s('e7', 0.2), s('e9', 0.2), 0.6, 0.6);
  A(e7, () => {
    heading('4 December', CX, 270, 1, { size: 56, align: 'center' });
    txt('several thousand women walk in silence to Heroes’ Square', CX, 336, { size: 36, weight: 600, color: C.soft, align: 'center' });
    // the monument, and the women walking towards it with flowers
    const MX = CX + 560, MY = 640;
    ctx.fillStyle = '#3a3f48'; ctx.fillRect(MX - 9, MY - 300, 18, 290); ctx.fillRect(MX - 18, MY - 312, 36, 14); ctx.beginPath(); ctx.arc(MX, MY - 324, 12, 0, TAU); ctx.fill(); ctx.fillRect(MX - 80, MY - 18, 160, 18);
    txt('Tomb of the Unknown Soldier', MX, MY + 34, { size: 26, weight: 600, color: C.soft, align: 'center' });
    const walk = seg(t, s('e7', 0.6), e('e8', 0.4));
    for (let i = 0; i < 14; i++) {
      const row = i % 2, x = CX - 760 + (i >> 1) * 120 + row * 60 + walk * 300, y = 640 + row * 40;
      if (x > MX - 110) continue;
      figure(x, y, 1.05, '#9aa0aa');
      ctx.fillStyle = C.warm; ctx.beginPath(); ctx.arc(x + 16, y - 6, 6, 0, TAU); ctx.fill();
    }
    const laid = eout(seg(t, mid('e8'), e('e8', 0.2)));
    A(laid, () => { for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 3 ? C.warm : C.white; ctx.beginPath(); ctx.arc(MX - 58 + i * 10.5, MY - 26 - (i % 2) * 6, 6, 0, TAU); ctx.fill(); } });
    A(eout(seg(t, s('e8', 0.2), s('e8', 1.0))), () => {
      txt('Soviet soldiers waiting', CX, 790, { size: 32, weight: 600, color: C.soft, align: 'center' });
      txt('India’s ambassador comes too', CX, 836, { size: 32, weight: 700, color: C.accent, align: 'center' });
    });
  });
  const e9 = span(t, s('e9', 0.2), s('e12', 0.2), 0.6, 0.6);
  A(e9, () => {
    const P = projection(140, 260, 150);
    hungary(P, 1, { labelXY: [140, 760] });
    const [sx, sy] = P(...TOWN.salgotarjan);
    ctx.fillStyle = C.warm; ctx.beginPath(); ctx.arc(sx, sy, 10, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.warm; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, TAU); ctx.stroke();
    txt('Salgótarján', sx + 30, sy - 26, { size: 32, weight: 700, color: C.warm });
    town(P, 'budapest', 'Budapest', { dx: -14, dy: 24, align: 'right', size: 26, color: C.soft, r: 5, weight: 500 });
    const RX = 1110;
    heading('8 December', RX, 290, 1, { size: 56 });
    txt('a mining town; some 4,000 people', RX, 360, { size: 34, weight: 600, color: C.soft });
    txt('demand the release of two arrested', RX, 406, { size: 34, weight: 600, color: C.soft });
    txt('workers’ council leaders', RX, 452, { size: 34, weight: 600, color: C.soft });
    A(eout(seg(t, s('e10', 0.2), s('e10', 1.0))), () => {
      txt('security forces, police and Soviet soldiers', RX, 532, { size: 32, weight: 600 });
      txt('fire into the crowd', RX, 576, { size: 32, weight: 600 });
      chip('how it began is disputed', RX, 646, { align: 'left', size: 30, color: C.soft, weight: 600 });
    });
    A(eout(seg(t, s('e11', 0.2), s('e11', 1.0))), () => {
      txt('46', RX, 770, { size: 100, weight: 800, family: HEAD });
      const x2 = RX + textW('46', { size: 100, weight: 800, family: HEAD }) + 24;
      txt('dead known by name;', x2, 750, { size: 32, weight: 600 });
      txt('estimates run higher', x2, 794, { size: 32, weight: 600, color: C.soft });
    });
  });
  const e12 = span(t, s('e12', 0.2), s('e14', 0.2), 0.6, 0.6);
  A(e12, () => {
    card(CX - 520, 230, 1040, 170, { line: C.faint });
    txtFit('Central Workers’ Council of Greater Budapest', CX, 315, 960, { size: 42, weight: 800, family: HEAD, align: 'center' });
    stamp('BANNED', CX + 360, 404, C.soviet, eout(seg(t, s('e12', 0.6), s('e12', 1.2))), -0.07, 40);
    txt('9 December', CX - 480, 444, { size: 32, weight: 700, color: C.soviet });
    A(eout(seg(t, s('e13', 0.2), s('e13', 1.0))), () => {
      parliament(CX, 840, 620, 0, '#2a2e35');
      txt('11 December, Parliament', CX, 520, { size: 38, weight: 700, color: C.soviet, align: 'center' });
      txtFit('invited by Kádár: Sándor Rácz and the council’s secretary, Sándor Bali', CX, 568, 1500, { size: 32, weight: 600, color: C.soft, align: 'center' });
      A(eout(seg(t, mid('e13'), mid('e13') + 0.8)), () => chip('arrested there', CX + 330, 740, { size: 38, color: C.soviet, align: 'left' }));
    });
  });
  const e14 = span(t, s('e14', 0.2), e('e14', 1.0), 0.6, 0.8);
  A(e14, () => {
    heading('11–12 December', CX, 300, 1, { size: 56, align: 'center' });
    txt('the last general strike', CX, 370, { size: 38, weight: 600, color: C.accent, align: 'center' });
  });
}

// ---------- 6: no help came ----------
function partWorld(t) {
  const CX = W / 2;
  const f1 = span(t, s('f1', 0.2), s('f2', 0.2), 0.6, 0.6);
  A(f1, () => {
    heading('United Nations, New York', CX, 280, 1, { size: 56, align: 'center', maxW: 1500 });
    txt('the Security Council', CX, 360, { size: 38, weight: 600, color: C.soft, align: 'center' });
    // eleven seats, one veto
    for (let i = 0; i < 11; i++) { const ang = Math.PI * (1.1 + (i / 10) * 0.8), x = CX + Math.cos(ang) * 340, y = 700 + Math.sin(ang) * 220; ctx.fillStyle = i === 7 ? C.soviet : '#4a505a'; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill(); }
    stamp('SOVIET VETO', CX, 640, C.soviet, eout(seg(t, mid('f1'), mid('f1') + 0.6)), -0.06, 44);
  });
  const f2 = span(t, s('f2', 0.2), s('f3', 0.2), 0.6, 0.6);
  A(f2, () => {
    heading('The General Assembly, 4 November', CX, 260, 1, { size: 52, align: 'center', maxW: 1500 });
    txt('calls on the Soviet Union to withdraw its forces', CX, 330, { size: 36, weight: 600, color: C.soft, align: 'center' });
    const VOTES = [[50, C.accent, 'for'], [8, C.soviet, 'against'], [15, '#5b616b', 'abstaining']];
    const g = seg(t, s('f2', 0.6), s('f2', 3.0)); let n = 0; const total = 73, cols = 25, R = 15, GX = CX - (cols * 44) / 2 + 22;
    for (const [cnt, col] of VOTES) for (let j = 0; j < cnt; j++, n++) {
      const x = GX + (n % cols) * 44, y = 420 + Math.floor(n / cols) * 44;
      A(clamp((g * total - n) * 0.8), () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); });
    }
    A(eout(seg(t, s('f2', 2.6), s('f2', 3.4))), () => {
      let x = CX - 520;
      for (const [cnt, col, lab] of VOTES) { txt(String(cnt), x, 590, { size: 64, weight: 800, family: HEAD, color: col }); txt(lab, x + textW(String(cnt), { size: 64, weight: 800, family: HEAD }) + 16, 596, { size: 34, weight: 600, color: C.soft }); x += 380; }
    });
    A(eout(seg(t, mid('f2') + 0.8, mid('f2') + 1.6)), () => chip('Moscow and Kádár ignore it', CX, 700, { size: 36, color: C.soviet }));
  });
  const f3 = span(t, s('f3', 0.2), s('f4', 0.2), 0.6, 0.6);
  A(f3, () => {
    heading('In the same days: Suez', CX, 250, 1, { size: 54, align: 'center', maxW: 1500 });
    // a schematic sketch of the canal, the coast and the attacks
    const X = CX - 140, Y = 450;
    ctx.fillStyle = 'rgba(52,81,107,0.55)'; ctx.fillRect(X - 420, Y - 60, 840, 70);
    txt('Mediterranean Sea', X - 400, Y - 26, { size: 28, weight: 500, color: '#8fa6bb' });
    ctx.fillStyle = C.land; ctx.fillRect(X - 420, Y + 10, 840, 420);
    ctx.strokeStyle = C.river; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(X, Y + 10); ctx.lineTo(X + 6, Y + 200); ctx.lineTo(X + 20, Y + 400); ctx.stroke();
    txt('Suez Canal', X + 26, Y + 210, { size: 30, weight: 700, color: '#8fa6bb' });
    txt('Egypt', X - 260, Y + 300, { size: 36, weight: 700, color: C.faint });
    txt('Sinai', X + 240, Y + 300, { size: 36, weight: 700, color: C.faint });
    trace([[X + 420, Y + 180], [X + 160, Y + 190]], eio(seg(t, s('f3', 0.6), s('f3', 2.0))), C.soviet, { w: 5, headSize: 16 });
    txt('Israel, 29 October', X + 430, Y + 140, { size: 28, weight: 700, color: C.soviet, align: 'right' });
    trace([[X - 40, Y - 120], [X - 10, Y + 10]], eio(seg(t, s('f3', 1.2), s('f3', 2.6))), C.soviet, { w: 5, headSize: 16 });
    txt('Britain and France, from 31 October', X - 60, Y - 110, { size: 30, weight: 700, color: C.soviet, align: 'right' });
    txt('schematic map', X - 420, Y + 466, { size: 28, weight: 500, color: C.soft });
    A(eout(seg(t, mid('f3'), mid('f3') + 0.8)), () => chip('the United States opposes the attack', X + 680, Y + 340, { size: 32, color: C.accent, maxW: 600 }));
  });
  const f4 = span(t, s('f4', 0.2), s('f6', 0.2), 0.6, 0.6);
  A(f4, () => {
    heading('Washington', CX, 270, 1, { size: 56, align: 'center' });
    txt('condemns the attack, but will not risk a world war', CX, 344, { size: 38, weight: 600, color: C.soft, align: 'center' });
    const q = eout(seg(t, s('f5', 0.2), s('f5', 1.2)));
    A(q, () => {
      card(CX - 680, 440, 1360, 300, { line: C.faint });
      txtFit('“We do not look upon these nations', CX, 530, 1260, { size: 52, weight: 700, align: 'center' });
      txtFit('as potential military allies.”', CX, 600, 1260, { size: 52, weight: 700, align: 'center' });
      txt('John Foster Dulles, Secretary of State, 27 October 1956', CX, 682, { size: 30, weight: 600, color: C.accent, align: 'center' });
    });
  });
  const f6 = span(t, s('f6', 0.2), mid('f9') - 0.2, 0.6, 0.6);
  A(f6, () => {
    // a mast in Munich, waves towards a radio in Hungary
    const MXm = 380, MYm = 640;
    ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(MXm - 60, MYm + 120); ctx.lineTo(MXm, MYm - 120); ctx.lineTo(MXm + 60, MYm + 120); ctx.stroke();
    ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { const y = MYm - 120 + i * 48; ctx.beginPath(); ctx.moveTo(MXm - 12.5 * i, y); ctx.lineTo(MXm + 12.5 * i, y); ctx.stroke(); }
    for (let i = 0; i < 4; i++) { const p = (t * 0.5 + i / 4) % 1; A((1 - p) * 0.8, () => { ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(MXm, MYm - 120, 40 + p * 260, -0.5, 0.5); ctx.stroke(); }); }
    txt('Munich', MXm, MYm + 170, { size: 32, weight: 700, align: 'center' });
    txt('American money', MXm, MYm + 212, { size: 28, weight: 500, color: C.soft, align: 'center' });
    const RX = 860;
    heading('Radio Free Europe', RX, 280, 1, { size: 56 });
    txt('encouraged the fighters', RX, 352, { size: 38, weight: 600, color: C.soft });
    A(eout(seg(t, s('f7', 0.2), s('f7', 1.0))), () => {
      card(RX, 410, 900, 190, { line: C.accent });
      txt('its own review, December 1956:', RX + 30, 456, { size: 30, weight: 600, color: C.soft });
      txt('no direct promise of military help,', RX + 30, 508, { size: 38, weight: 700 });
      txt('with one exception', RX + 30, 558, { size: 38, weight: 700, color: C.accent });
    });
    A(eout(seg(t, s('f8', 0.2), s('f8', 1.0))), () => {
      txt('4 November, a press review:', RX, 660, { size: 32, weight: 700, color: C.accent });
      txt('a London paper suggests American help might come', RX, 706, { size: 32, weight: 600, color: C.soft });
      txt('if Hungarians hold out', RX, 750, { size: 32, weight: 600, color: C.soft });
    });
    A(eout(seg(t, s('f9', 0.2), s('f9', 1.0))), () => {
      txt('witnesses to the UN: “no reason for expecting military help”', RX, 830, { size: 30, weight: 600, color: C.soft });
    });
  });
  // f9: the survey, 1,000 refugees as dots, 96% lit
  const sv = span(t, mid('f9') - 0.2, s('f10', 0.2), 0.6, 0.6);
  A(sv, () => {
    const cols = 50, R = 6.5, gap = 16, GX = CX - (cols * gap) / 2 - 200, GY = 380;
    const g = seg(t, mid('f9'), mid('f9') + 2.2);
    for (let i = 0; i < 1000; i++) {
      const x = GX + (i % cols) * gap, y = GY + Math.floor(i / cols) * gap;
      ctx.fillStyle = i < 960 && i / 1000 < g ? C.accent : '#3a3f48'; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    }
    txt('1,000 refugees in Austria, 1957', GX, GY - 50, { size: 32, weight: 700 });
    A(seg(t, mid('f9') + 1.4, mid('f9') + 2.2), () => {
      const X2 = GX + cols * gap + 40;
      txt('96', X2, GY + 120, { size: 140, weight: 800, family: HEAD, color: C.accent });
      txt('percent', X2 + textW('96', { size: 140, weight: 800, family: HEAD }) + 14, GY + 134, { size: 40, weight: 700, color: C.accent });
      txt('had trusted in some', X2, GY + 220, { size: 34, weight: 600, color: C.soft });
      txt('American help', X2, GY + 264, { size: 34, weight: 600, color: C.soft });
      txt('International Research Associates, February 1957', GX, GY + 20 * gap + 40, { size: 26, weight: 500, color: C.faint });
    });
  });
  // f10–f12: the weeks, and what came after
  const en = span(t, s('f10', 0.1), DURATION, 0.9, 0.1);
  if (en > 0) A(en, () => {
    const g1 = eio(seg(t, s('f10', 0.4), s('f10', 1.6))), g2 = eio(seg(t, s('f10', 1.2), s('f10', 3.0)));
    dayStrip(1, 38, { bands: [[0, 7, C.sovietSoft, g1], [8, 38, C.accentSoft, g2]], marks: [[0, g1, C.soft], [7, g1, C.soviet], [38, g2, C.accent]], curA: 0 });
    A(g1, () => txt('armed resistance', dx(3.5), 220, { size: 32, weight: 700, color: C.soviet, align: 'center' }));
    A(g2, () => txt('strikes, without weapons', dx(23), 220, { size: 32, weight: 700, color: C.accent, align: 'center' }));
    A(eout(seg(t, s('f11', 0.2), s('f11', 1.2))), () => {
      txt('and then', CX, 340, { size: 30, weight: 700, color: C.soft, align: 'center' });
      txt('some 200,000 refugees', CX - 40, 420, { size: 46, weight: 700, align: 'right' });
      txt('·', CX, 420, { size: 46, weight: 700, color: C.soft, align: 'center' });
      txt('the reprisals', CX + 40, 420, { size: 46, weight: 700, color: C.soviet });
    });
    A(eout(seg(t, s('f12', 0.2), s('f12', 1.2))), () => {
      txt('for over thirty years, the regime’s word:', CX, 560, { size: 34, weight: 600, color: C.soft, align: 'center' });
      txt('“counter-revolution”', CX, 630, { size: 60, weight: 800, family: HEAD, color: C.soviet, align: 'center' });
    });
    A(eout(seg(t, mid('f12') + 0.4, mid('f12') + 1.4)), () => {
      txt('NEXT', CX, 760, { size: 28, weight: 700, color: C.accent, align: 'center', spacing: '6px' });
      txt('What 1956 left behind', CX, 830, { size: 60, weight: 800, family: HEAD, align: 'center' });
    });
  });
}

// ---------- title cards and credits ----------
function titleCards(t) {
  CH.forEach((ch) => {
    const a = span(t, ch.at, ch.at + 3.9, 0.6, 0.7);
    if (a <= 0) return;
    A(a * 0.9, () => { ctx.fillStyle = 'rgba(14,16,20,0.95)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8)), y = 520 + (1 - p) * 18;
      txt(`PART ${ch.n}`, W / 2, y - 120, { size: 36, weight: 700, color: C.accent, align: 'center', spacing: '6px' });
      const title = ch.title.toUpperCase();
      txt(title, W / 2, y, { size: fit(title, 1560, 112, { weight: 800, family: HEAD, spacing: '2px' }), weight: 800, family: HEAD, align: 'center', spacing: '2px' });
      tricolour(W / 2, y + 80, 240);
    });
  });
}
const MUSIC = ['“Long Note Four” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Cryptic Sorrow” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
const SOURCES = [
  'UN Special Committee on the Problem of Hungary, Report (1957)',
  '1956 Institute: “Occupation and resistance” (lesson 4); National Security Archive (2002); FRUS 1955–57, vol. XXV',
  'Béla Király; Miklós Horváth; Éva Tulipán and Gábor Molnár (Betekintő, 2016); Mark Kramer (CWIHP Bulletin)',
  'Csaba Békés and Gusztáv D. Kecskés (eds.): the Hungarian question at the UN (2006)',
  'Maps schematic, drawn for this film',
];
function credits() {
  ctx.drawImage(BG, 0, 0);
  ctx.fillStyle = 'rgba(10,12,15,0.6)'; ctx.fillRect(0, 0, W, H);
  flag(W / 2, 150, 96);
  const title = 'The crushing, 4 November 1956';
  txt(title, W / 2, 262, { size: fit(title, 1500, 76, { weight: 800, family: HEAD }), weight: 800, family: HEAD, align: 'center' });
  txt('Hungary 1956 · original animation', W / 2, 336, { size: 38, weight: 600, color: C.soft, align: 'center' });
  txt('MUSIC', W / 2, 430, { size: 30, weight: 700, color: C.accent, align: 'center', spacing: '5px' });
  MUSIC.forEach((m, j) => txt(m, W / 2, 478 + j * 44, { size: 32, weight: 500, align: 'center' }));
  txt('SOURCES', W / 2, 620, { size: 30, weight: 700, color: C.accent, align: 'center', spacing: '5px' });
  SOURCES.forEach((m, j) => txtFit(m, W / 2, 668 + j * 46, 1700, { size: 30, weight: 500, align: 'center', color: j === SOURCES.length - 1 ? C.soft : C.ink }));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [HEAD, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!BG) paintBackground();
    ctx.drawImage(BG, 0, 0);
    const parts = [partOpen, partDawn, partRadio, partFight, partEmbassy, partStrike, partWorld];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCards(t);
    A(seg(t, e('f12', 1.4), e('f12', 2.4)), () => credits());
  },
});
