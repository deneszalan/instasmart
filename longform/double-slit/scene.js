// "The double-slit experiment", a long-form 16:9 explainer (about 11 minutes).
// Look: a dark optics lab. Near-black optical table, saturated green laser light, glowing fringes on a screen,
// green phosphor dots for single detections; red for what particles "should" do and for which-slit detectors;
// warm white for sunlight and lamps in the history chapters. IBM Plex Sans for titles and labels, Azeret Mono
// for numbers and dates.
// Layout: the apparatus seen from above on the left (beam left to right), the screen face-on on the right,
// sharing its vertical axis, so a dot at height y on the screen line is the same dot at height y on the panel.
// Every pattern is computed (far-field two-slit intensity, cos² fringes × sinc² envelope), every dot is drawn
// from it with a seeded generator, and every number on screen is computed from the same values (see script.mjs).
// Everything is keyed to the narration lines in window.TL (timing.mjs), never to absolute seconds.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const SANS = 'IBM Plex Sans', MONO = 'Azeret Mono';

const C = {
  bg0: '#010203', bg1: '#061012',
  green: '#3DFF8A', greenHi: '#D2FFE3', greenDeep: '#10A957', greenSoft: 'rgba(61,255,138,0.6)', greenFaint: 'rgba(61,255,138,0.16)',
  red: '#FF4F4F', redHi: '#FFC9C9', redSoft: 'rgba(255,79,79,0.6)', redFaint: 'rgba(255,79,79,0.16)',
  warm: '#FFE3A8', warmSoft: 'rgba(255,227,168,0.6)', amber: '#FFB547',
  steel: '#9AAEB6', steelDim: '#43555C', metal: '#B8C7CD',
  text: '#EAF3F0', textSoft: 'rgba(234,243,240,0.76)', textDim: 'rgba(234,243,240,0.52)',
  panel: '#020706', card: 'rgba(4,12,12,0.94)', cardEdge: 'rgba(61,255,138,0.34)',
};

let k, ctx;
const font = (w, sz, f = SANS, style = '') => k.font(`${style}${w}`, sz, f);
const text = (str, x, y, o = {}) => k.text(str, x, y, { color: C.text, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const rr = (x, y, w, h, r) => k.rrect(x, y, w, h, r);
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- geometry ----------
// The apparatus seen from above (a diagram, not to scale) and the screen face-on.
const TV = { src: 178, bx: 430, sx: 900, cy: 560, y0: 190, y1: 930, by0: 236, by1: 884, d: 96, a: 16 };
const P = { x0: 1010, x1: 1800, y0: 190, y1: 930, cy: 560 };
P.w = P.x1 - P.x0; P.h = P.y1 - P.y0;
// True scale on the face-on screen in "Reading the stripes": the panel is 17 mm tall.
const MM = P.h / 17;                                   // px per mm
const LAB = { lambda: 0.6e-3, L: 1000, d: 0.5, b: 0.1 }; // mm: λ = 0.6 µm, L = 1 m, d = 0.5 mm, slit width 0.1 mm
const spacingMM = (lam, L, d) => (lam * L) / d;          // fringe spacing w = λL/d (mm)
const FR = spacingMM(LAB.lambda, LAB.L, LAB.d) * MM;     // px between bright stripes on the panel

const sinc = (x) => (Math.abs(x) < 1e-7 ? 1 : Math.sin(x) / x);
// Far-field intensity at offset u px from the centre of the panel. I2: both slits open, cos² fringes × sinc²
// envelope (peak 1). I1: which-slit known, the two single-slit patterns added (scaled to the same area as I2).
function I2(u, p = LAB) { const y = u / MM, q = Math.PI / (p.lambda * p.L); return Math.cos(q * p.d * y) ** 2 * sinc(q * p.b * y) ** 2; }
function I1(u, p = LAB) { const y = u / MM, q = Math.PI / (p.lambda * p.L); return 0.25 * (sinc(q * p.b * (y - p.d / 2)) ** 2 + sinc(q * p.b * (y + p.d / 2)) ** 2); }
// What classical particles flying straight through the slits would give: two bands behind the slits.
const BAND = TV.d / 2 * (TV.sx - TV.src) / (TV.bx - TV.src), BANDW = TV.a / 2 * (TV.sx - TV.src) / (TV.bx - TV.src) + 6;
const IP = (u) => Math.exp(-(((Math.abs(u) - BAND) / BANDW) ** 2));
// Partial which-path information: visibility V mixes the two (D² + V² ≤ 1).
const IV = (u, V) => V * I2(u) + (1 - V) * I1(u);

// ---------- detections: drawn from the computed patterns with a fixed seed ----------
function sampler(I, seed, n, { x0 = P.x0 + 26, x1 = P.x1 - 26 } = {}) {
  const bins = 1480, us = [], cdf = [];
  let acc = 0;
  for (let i = 0; i < bins; i++) { const u = lerp(-P.h / 2 + 4, P.h / 2 - 4, (i + 0.5) / bins); acc += I(u); us.push(u); cdf.push(acc); }
  const r = mulberry32(seed), out = [];
  for (let j = 0; j < n; j++) {
    const v = r() * acc;
    let lo = 0, hi = bins - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < v) lo = m + 1; else hi = m; }
    const u = us[lo] + (r() - 0.5) * ((P.h - 8) / bins);
    // across the screen (along the slits) the hits spread evenly, thinning toward the edges
    let z = 0; for (let q = 0; q < 3; q++) z += r(); z = z / 3 - 0.5;
    out.push({ x: lerp(x0, x1, 0.5 + z * 1.5), y: P.cy + u, r: r(), slit: r() < 0.5 ? 0 : 1 });
  }
  return out;
}
const HITS = sampler(I2, 1801, 60000);   // both slits open
const HITS_W = sampler(I1, 1909, 24000); // which-slit detectors on
const HITS_P = sampler(IP, 1704, 3000);  // classical particles (what Newton's corpuscles would do)

/** A count that grows through the given points [t, n, shape], with the time each detection arrives. */
function schedule(pts) {
  const N = (t) => {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [t1, n1, p = 1] = pts[i], [t0, n0] = pts[i - 1];
      if (t <= t1) return n0 + (n1 - n0) * Math.pow(seg(t, t0, t1), p);
    }
    return pts.at(-1)[1];
  };
  const inv = (i) => { let lo = pts[0][0], hi = pts.at(-1)[0]; for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; if (N(m) < i) lo = m; else hi = m; } return hi; };
  return { N: (t) => Math.floor(N(t) + 1e-6), inv };
}

// ---------- sprites and background ----------
let bg = null, glowG = null, glowR = null, glowW = null;
function sprite(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 48;
  const g = c.getContext('2d'), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 48, 48);
  return c;
}
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W * 0.46, H * 0.5, 80, W * 0.5, H * 0.55, 1250);
  rad.addColorStop(0, C.bg1); rad.addColorStop(0.55, '#030809'); rad.addColorStop(1, C.bg0);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // the optical table: a breadboard of tapped holes, 48 px apart
  for (let y = 36; y < H; y += 48) for (let x = 36; x < W; x += 48) {
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.beginPath(); g.arc(x, y, 4.2, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(160,210,200,0.055)'; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.6, y + 0.6, 4.6, 0, 6.283); g.stroke();
  }
  const r = mulberry32(9);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(170,255,220,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1.4, 1.4); }
  const vg = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1150);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  glowG = sprite([[0, 'rgba(235,255,244,1)'], [0.16, 'rgba(61,255,138,0.95)'], [0.42, 'rgba(16,169,87,0.35)'], [1, 'rgba(16,169,87,0)']]);
  glowR = sprite([[0, 'rgba(255,240,240,1)'], [0.16, 'rgba(255,79,79,0.95)'], [0.42, 'rgba(190,30,30,0.35)'], [1, 'rgba(190,30,30,0)']]);
  glowW = sprite([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,240,210,0.9)'], [0.5, 'rgba(255,220,160,0.25)'], [1, 'rgba(255,220,160,0)']]);
}
function blob(spr, x, y, r, a = 1) { A(a, () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(spr, x - r, y - r, 2 * r, 2 * r); ctx.restore(); }); }

// ---------- small parts ----------
function label(str, x, y, { size = 32, color = C.textDim, align = 'left', weight = 500, family = MONO, spacing = '1px' } = {}) {
  font(weight, size, family); text(str, x, y, { color, align, spacing });
}
function heading(str, x, y, { size = 64, color = C.text, align = 'left', weight = 600 } = {}) { font(weight, size); text(str, x, y, { color, align }); }
function chip(str, x, y, { color = C.green, size = 32, align = 'left', fill = 'rgba(3,10,10,0.88)', family = MONO } = {}) {
  font(600, size, family); ctx.letterSpacing = '2px';
  const w = ctx.measureText(str).width + 40; ctx.letterSpacing = '0px';
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  rr(x0, y - size * 0.95, w, size * 1.9, 10); ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  text(str, x0 + 20, y + 1, { color, spacing: '2px' });
  return w;
}
function card(x, y, w, h, { edge = C.cardEdge, fill = C.card, r = 22 } = {}) {
  rr(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
}
function arrow(x0, y0, x1, y1, color, w = 3, head = 14) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const an = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(an - 0.45), y1 - head * Math.sin(an - 0.45)); ctx.lineTo(x1 - head * Math.cos(an + 0.45), y1 - head * Math.sin(an + 0.45)); ctx.closePath(); ctx.fill();
}
/** Text that types on from t0 to t1 (by characters). */
function typed(str, x, y, t, t0, t1, o) { const n = Math.round(str.length * seg(t, t0, t1)); if (n > 0) text(str.slice(0, n), x, y, o); }
function wrapLines(str, maxW) {
  const words = str.split(' '), lines = [];
  let cur = '';
  for (const w of words) { const tryS = cur ? `${cur} ${w}` : w; if (ctx.measureText(tryS).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryS; }
  if (cur) lines.push(cur);
  return lines;
}
function para(str, x, y, maxW, { size = 40, lh = 1.3, color = C.text, weight = 400, family = SANS, style = '', align = 'left' } = {}) {
  font(weight, size, family, style);
  const lines = wrapLines(str, maxW);
  lines.forEach((l, i) => text(l, x, y + i * size * lh, { color, align }));
  return lines.length;
}

// ---------- the apparatus, seen from above ----------
function laser(x, y, on = 1, { color = C.green, name = 'LASER' } = {}) {
  ctx.fillStyle = '#16262B'; rr(x - 70, y - 30, 104, 60, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(154,174,182,0.5)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#0B1518'; ctx.fillRect(x + 34, y - 14, 14, 28);
  if (on > 0) blob(color === C.red ? glowR : glowG, x + 48, y, 20, on);
  if (name) label(name, x - 18, y + 62, { align: 'center' });
}
function beam(x0, x1, y, a, { color = C.green, w = 7 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = color; ctx.globalAlpha *= 0.28; ctx.lineWidth = w * 3.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.globalAlpha /= 0.28; ctx.globalAlpha *= 0.9; ctx.lineWidth = w * 0.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.restore();
  });
}
/** The barrier: a dark plate with openings at the given centres (y), each `a` wide. */
function barrier(x, openings, a = TV.a, { y0 = TV.by0, y1 = TV.by1, name = 'TWO SLITS', dashed = false } = {}) {
  const ys = [...openings].sort((p, q) => p - q);
  let top = y0;
  ctx.fillStyle = C.metal;
  if (dashed) { ctx.setLineDash([10, 10]); ctx.strokeStyle = C.steel; ctx.lineWidth = 3; }
  const piece = (a0, a1) => { if (a1 <= a0) return; if (dashed) { ctx.beginPath(); ctx.moveTo(x, a0); ctx.lineTo(x, a1); ctx.stroke(); } else ctx.fillRect(x - 5, a0, 10, a1 - a0); };
  for (const yo of ys) { piece(top, yo - a / 2); top = yo + a / 2; }
  piece(top, y1);
  ctx.setLineDash([]);
  if (name) label(name, x, y0 - 34, { align: 'center' });
}
function screenLine(a = 1, name = 'SCREEN') {
  A(a, () => {
    ctx.fillStyle = 'rgba(61,255,138,0.4)'; ctx.fillRect(TV.sx - 3, TV.y0, 6, TV.y1 - TV.y0);
    if (name) label(name, TV.sx, TV.y0 - 34, { align: 'center' });
  });
}
const slitYs = (n = 2, d = TV.d) => Array.from({ length: n }, (_, i) => TV.cy + (i - (n - 1) / 2) * d);
function seenFromAbove(a = 1, str = 'SEEN FROM ABOVE · NOT TO SCALE') { A(a, () => label(str, 120, 968, { size: 32 })); }

/** The face-on screen: a dark panel with a faint grid, linked to the screen line. */
function panel(a = 1, { link = true, name = 'THE SCREEN, FACE-ON', fill = C.panel } = {}) {
  A(a, () => {
    rr(P.x0, P.y0, P.w, P.h, 14); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = 'rgba(61,255,138,0.26)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); rr(P.x0, P.y0, P.w, P.h, 14); ctx.clip();
    ctx.strokeStyle = 'rgba(61,255,138,0.045)'; ctx.lineWidth = 1;
    for (let x = P.x0 + 40; x < P.x1; x += 40) { ctx.beginPath(); ctx.moveTo(x, P.y0); ctx.lineTo(x, P.y1); ctx.stroke(); }
    for (let y = P.y0 + 30; y < P.y1; y += 40) { ctx.beginPath(); ctx.moveTo(P.x0, y); ctx.lineTo(P.x1, y); ctx.stroke(); }
    ctx.restore();
    if (link) {
      ctx.strokeStyle = 'rgba(61,255,138,0.16)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(TV.sx + 4, TV.y0); ctx.lineTo(P.x0, P.y0); ctx.moveTo(TV.sx + 4, TV.y1); ctx.lineTo(P.x0, P.y1); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (name) label(name, P.x1, 968, { align: 'right' });
  });
}
function clipPanel(fn) { ctx.save(); rr(P.x0, P.y0, P.w, P.h, 14); ctx.clip(); fn(); ctx.restore(); }

/** Detections: every hit up to n as a phosphor dot; the newest flash, also on the screen line. */
function drawHits(list, n, t, sch, { a = 1, spr = glowG, dot = 'rgba(61,255,138,0.6)', flash = true, line = true, size = 2.4, filter = null } = {}) {
  if (a <= 0 || n <= 0) return;
  n = Math.min(n, list.length);
  A(a, () => clipPanel(() => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = dot; ctx.globalAlpha *= n > 4000 ? 0.62 : n > 800 ? 0.8 : 1;
    for (let i = 0; i < n; i++) { const h = list[i]; if (filter && !filter(h, i)) continue; ctx.fillRect(h.x - size / 2, h.y - size / 2, size, size); }
    ctx.restore();
    if (flash && sch) {
      const n0 = Math.max(0, sch.N(t - 0.7));
      const step = Math.max(1, Math.floor((n - n0) / 300));
      for (let i = n0; i < n; i += step) {
        const h = list[i]; if (filter && !filter(h, i)) continue;
        const age = t - sch.inv(i + 1);
        const big = n < 400;
        blob(spr, h.x, h.y, (big ? 16 : 8) * lerp(1.6, 0.6, eout(seg(age, 0, 0.7))), (big ? 1 : 0.5) * (1 - seg(age, 0.3, 0.7)));
      }
    }
  }));
  if (flash && line && sch && a > 0) {
    const n0 = Math.max(0, sch.N(t - 0.5));
    const step = Math.max(1, Math.floor((n - n0) / 80));
    A(a, () => { for (let i = n0; i < n; i += step) { const h = list[i]; if (filter && !filter(h, i)) continue; const age = t - sch.inv(i + 1); blob(spr, TV.sx, h.y, 13, 1 - seg(age, 0.1, 0.5)); } });
  }
}
/** A particle in flight from the source to the slits (where it is in between is not drawn). */
function packets(t, sch, n, { from = TV.src + 50, to = TV.bx - 8, spr = glowG, max = 80, dur = 0.42 } = {}) {
  const n1 = Math.min(n + 3, max);
  for (let i = 0; i < n1; i++) {
    const ta = sch.inv(i + 1), p = seg(t, ta - dur - 0.12, ta - 0.12);
    if (p <= 0 || p >= 1) continue;
    blob(spr, lerp(from, to, p), TV.cy + Math.sin(i * 7.1) * 4 * p, 15, 1 - seg(p, 0.85, 1));
  }
}
function counter(n, { lab = 'DETECTIONS', color = C.green, x = P.x0, y = 152 } = {}) {
  label(lab, x, y, { size: 32 });
  font(600, 40, MONO); const w = (() => { font(500, 32, MONO); ctx.letterSpacing = '1px'; const v = ctx.measureText(lab).width; ctx.letterSpacing = '0px'; return v; })();
  font(600, 40, MONO); text(fmt(n), x + w + 20, y, { color });
}

/** A smooth intensity image across the panel (a long exposure), from I(u) in [0, 1]. */
const colCv = { cv: null, img: null };
function exposure(I, a, { rgb = [61, 255, 138], gain = 1, gamma = 0.8, x0 = P.x0, x1 = P.x1, y0 = P.y0, y1 = P.y1, edge = true } = {}) {
  if (a <= 0) return;
  const h = Math.round(y1 - y0);
  if (!colCv.cv || colCv.cv.height !== h) { colCv.cv = document.createElement('canvas'); colCv.cv.width = 1; colCv.cv.height = h; colCv.img = colCv.cv.getContext('2d').createImageData(1, h); }
  const d = colCv.img.data, cy = (y0 + y1) / 2;
  for (let j = 0; j < h; j++) {
    const v = clamp(gain * Math.pow(Math.max(0, I(y0 + j + 0.5 - cy)), gamma));
    const c = typeof rgb === 'function' ? rgb(y0 + j + 0.5 - cy) : rgb;
    d[j * 4] = c[0]; d[j * 4 + 1] = c[1]; d[j * 4 + 2] = c[2]; d[j * 4 + 3] = Math.round(255 * v);
  }
  colCv.cv.getContext('2d').putImageData(colCv.img, 0, 0);
  A(a, () => clipPanel(() => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(colCv.cv, x0, y0, x1 - x0, h);
    ctx.restore();
    if (edge) { // fade toward the left and right edges
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(2,7,6,0.9)'); g.addColorStop(0.16, 'rgba(2,7,6,0)'); g.addColorStop(0.84, 'rgba(2,7,6,0)'); g.addColorStop(1, 'rgba(2,7,6,0.9)');
      ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, h);
    }
  }));
}
/** The intensity curve traced over the panel (height = intensity), drawn up to fraction `ink`. */
function curve(I, a, { color = C.green, ink = 1, scale = 1, w = 4, dash = null, base = P.x0 + 30, amp = 330 } = {}) {
  if (a <= 0) return;
  A(a, () => clipPanel(() => {
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.strokeStyle = color; ctx.lineWidth = w;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const n = 520, m = Math.round(n * ink);
    for (let i = 0; i <= m; i++) { const y = lerp(P.y0, P.y1, i / n), x = base + I(y - P.cy) * scale * amp; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
  }));
}

/** Waves on the table seen from above: a plane wave up to the barrier, circular waves from each opening after it. */
let waveCv = null, waveImg = null;
const WG = { cell: 2.5, x0: TV.src + 40, x1: TV.sx, y0: TV.y0, y1: TV.y1 };
function waves(t, a, { lambda = 11, sources = slitYs(), plane = true, color = [61, 255, 138], speed = 1.0, x1 = WG.x1 } = {}) {
  if (a <= 0) return;
  const w = Math.ceil((WG.x1 - WG.x0) / WG.cell), h = Math.ceil((WG.y1 - WG.y0) / WG.cell);
  if (!waveCv) { waveCv = document.createElement('canvas'); waveCv.width = w; waveCv.height = h; waveImg = waveCv.getContext('2d').createImageData(w, h); }
  const kk = (2 * Math.PI) / lambda, om = 2 * Math.PI * speed, d = waveImg.data;
  for (let j = 0; j < h; j++) {
    const y = WG.y0 + (j + 0.5) * WG.cell;
    for (let i = 0; i < w; i++) {
      const x = WG.x0 + (i + 0.5) * WG.cell;
      let v = 0;
      if (x > x1) v = 0;
      else if (x < TV.bx) { if (plane) v = Math.cos(kk * (x - TV.src) - om * t) * clamp(1 - (Math.abs(y - TV.cy) - 60) / 30) * 0.9; }
      else { for (const sy of sources) { const r = Math.hypot(x - TV.bx, y - sy) + 2; v += Math.cos(kk * (r + TV.bx - TV.src) - om * t) / Math.sqrt(1 + r / 45); } v *= 0.95; }
      const b = Math.max(0, v) ** 1.25, o = (j * w + i) * 4;
      d[o] = color[0]; d[o + 1] = color[1]; d[o + 2] = color[2]; d[o + 3] = Math.min(255, b * 150);
    }
  }
  waveCv.getContext('2d').putImageData(waveImg, 0, 0);
  A(a, () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(waveCv, WG.x0, WG.y0, w * WG.cell, h * WG.cell); ctx.restore(); });
}

// ---------- shared pictures ----------
/** A horizontal strip of fringes (the motif on the title cards). */
function fringeStrip(cx, cy, w, h, a, { per = 46, rgb = '61,255,138' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let x = -w / 2; x < w / 2; x += 2) {
      const v = Math.cos((Math.PI * x) / per) ** 2 * sinc((Math.PI * x) / (per * 5)) ** 2;
      ctx.fillStyle = `rgba(${rgb},${0.9 * v})`; ctx.fillRect(cx + x, cy - h / 2, 2, h);
    }
    ctx.restore();
  });
}
/** Two waves and their sum, for a phase difference phi (radians). */
function waveSum(t, x0, y0, w, phi, a, { rows = [330, 520, 760], amp = 54, names = ['WAVE 1', 'WAVE 2', 'TOGETHER'], lam = 190, moving = true } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const off = moving ? t * 160 : 0;
    const f = (x, ph) => Math.sin((2 * Math.PI * (x - off)) / lam + ph);
    const plot = (y, fn, col, lw, am) => {
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      for (let x = 0; x <= w; x += 4) { const v = fn(x); x ? ctx.lineTo(x0 + x, y - v * am) : ctx.moveTo(x0, y - v * am); }
      ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(234,243,240,0.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    };
    plot(rows[0], (x) => f(x, 0), C.green, 4, amp);
    plot(rows[1], (x) => f(x, phi), C.green, 4, amp);
    plot(rows[2], (x) => f(x, 0) + f(x, phi), C.greenHi, 5, amp);
    names.forEach((n, i) => label(n, x0, rows[i] - amp - (i === 2 ? 70 : 34), { size: 32 }));
  });
}
function rosetta(x, y, sc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.moveTo(-150, -150); ctx.lineTo(-40, -200); ctx.lineTo(60, -176); ctx.lineTo(150, -210); ctx.lineTo(160, 200); ctx.lineTo(-160, 200); ctx.closePath();
  const g = ctx.createLinearGradient(0, -210, 0, 200); g.addColorStop(0, '#3A4448'); g.addColorStop(1, '#1E2629');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(154,174,182,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  const r = mulberry32(196);
  [[-130, -110, 14], [-130, 10, 16], [-130, 120, 18]].forEach(([x0, y0, rows], band) => {
    for (let j = 0; j < 6; j++) for (let i = 0; i < rows; i++) {
      ctx.fillStyle = `rgba(200,215,220,${0.25 + r() * 0.3})`;
      const gx = x0 + i * (260 / rows) + r() * 3, gy = y0 + j * 14;
      if (band === 0) { ctx.fillRect(gx, gy, 6 + r() * 6, 8); } else ctx.fillRect(gx, gy + 3, 4 + r() * 10, 3);
    }
  });
  ctx.restore();
}
/** A buckyball: 60 atoms, drawn as a projected truncated icosahedron. */
const BUCKY = (() => {
  const ph = (1 + Math.sqrt(5)) / 2, v = [];
  const perms = (a, b, c) => [[a, b, c], [b, c, a], [c, a, b]];
  const signs = (p) => { const out = []; for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) out.push([p[0] * sx, p[1] * sy, p[2] * sz]); return out; };
  const add = (p) => { if (!v.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) < 1e-6)) v.push(p); };
  for (const base of [[0, 1, 3 * ph], [1, 2 + ph, 2 * ph], [ph, 2, ph ** 3]]) for (const p of perms(...base)) for (const q of signs(p)) add(q);
  const edges = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (Math.abs(Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2]) - 2) < 1e-6) edges.push([i, j]);
  return { v, edges };
})();
function buckyball(x, y, R, rot, a = 1, { color = C.green, atom = 7 } = {}) {
  A(a, () => {
    const sc = R / 4.96, ca = Math.cos(rot), sa = Math.sin(rot), cb = Math.cos(0.5), sb = Math.sin(0.5);
    const P2 = BUCKY.v.map(([px, py, pz]) => { const x1 = px * ca + pz * sa, z1 = -px * sa + pz * ca; const y2 = py * cb - z1 * sb, z2 = py * sb + z1 * cb; return [x + x1 * sc, y + y2 * sc, z2]; });
    ctx.lineWidth = 2.5;
    for (const [i, j] of BUCKY.edges) { const z = (P2[i][2] + P2[j][2]) / 2; ctx.strokeStyle = `rgba(61,255,138,${0.18 + 0.5 * (z + 5) / 10})`; ctx.beginPath(); ctx.moveTo(P2[i][0], P2[i][1]); ctx.lineTo(P2[j][0], P2[j][1]); ctx.stroke(); }
    for (const p of [...P2].sort((q, r) => q[2] - r[2])) { const f = (p[2] + 5) / 10; ctx.fillStyle = color; ctx.globalAlpha = a * (0.3 + 0.7 * f); ctx.beginPath(); ctx.arc(p[0], p[1], atom * (0.75 + 0.35 * f), 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = a;
  });
}

// ---------- titles ----------
function chapterCards(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.45, 0.55);
    if (a <= 0) continue;
    A(a * 0.86, () => { ctx.fillStyle = '#010304'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      ctx.save(); ctx.translate(0, (1 - p) * 18);
      label(`PART ${ch.n}`, W / 2, 432, { size: 36, color: C.green, align: 'center', spacing: '8px', weight: 600 });
      heading(ch.title, W / 2, 530, { size: 108, align: 'center', weight: 600 });
      fringeStrip(W / 2, 640, 980 * eio(seg(t, ch.at + 0.2, ch.at + 1.6)), 26, 0.85);
      ctx.restore();
    });
  }
}
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 3.4) c = ch; return c; }
function header(t) {
  const on = eout(seg(t, 0.2, 1.2));
  A(on, () => {
    font(700, 32); text('RECKON', 120, 98, { color: C.green, spacing: '4px' });
    const w = ctx.measureText('RECKON').width + 16;
    label('PHYSICS · QUANTUM', 120 + w + 26, 98, { size: 32 });
    const ch = chapterAt(t);
    if (ch) A(seg(t, ch.at + 3.4, ch.at + 4.4) * (1 - seg(t, e(LAST, 0.6), e(LAST, 1.4))), () => label(`${ch.n} · ${ch.title.toUpperCase()}`, 1800, 98, { size: 32, align: 'right' }));
  });
}
const LAST = Object.keys(T).at(-1);

// ---------- 0: cold open ----------
const S0 = schedule([[e('o1', -1.2), 0], [e('o1', -0.15), 1], [e('o2', -0.2), 7], [e('o3'), 42, 1.2], [e('o4', -0.3), 5400, 2.4], [e('o5'), 9000], [e('o6', 0.3), 10500]]);
function part0(t) {
  const on = eout(seg(t, 0.2, 1.4));
  const n = S0.N(t);
  A(on, () => {
    panel(1); screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, 0.5 + 0.5 * (n < 50 ? span(t, S0.inv(n + 1) - 0.7, S0.inv(n + 1) - 0.3, 0.1, 0.2) : 1), { name: 'SOURCE' });
    barrier(TV.bx, slitYs());
    waves(t, 0.55 * span(t, s('o5', 0.3), e('o6', 0.6), 1.0, 1.0));
    packets(t, S0, n);
    drawHits(HITS, n, t, S0);
    counter(n);
    A(span(t, s('o6', 0.3), s('o7', 0.6), 0.4, 0.4), () => {
      chip('PARTICLE?', 664, 400, { color: C.red, align: 'center', size: 36 });
      chip('WAVE?', 664, 720, { color: C.green, align: 'center', size: 36 });
    });
  });
  // the title
  const tt = s('o7'), p = eout(seg(t, tt, tt + 1.0)), out = 1 - seg(t, CH[0].at - 0.3, CH[0].at + 0.3);
  A(p * 0.8 * out, () => { ctx.fillStyle = '#010304'; ctx.fillRect(0, 0, W, H); });
  A(p * out, () => {
    ctx.save(); ctx.translate(0, (1 - p) * 20);
    font(700, 124); text('THE DOUBLE-SLIT', W / 2, 452, { color: C.text, align: 'center', spacing: '6px' });
    text('EXPERIMENT', W / 2, 584, { color: C.green, align: 'center', spacing: '6px' });
    fringeStrip(W / 2, 700, 1100 * eio(seg(t, tt + 0.3, tt + 2.0)), 30, 0.9);
    label('ONE PARTICLE AT A TIME', W / 2, 790, { size: 36, align: 'center', color: C.textSoft, spacing: '6px' });
    ctx.restore();
  });
}

// ---------- 1: waves or particles? ----------
const SP = schedule([[s('w7', 0.3), 0], [s('w7', 1.6), 6], [e('w7', 0.6), 1600, 1.6]]);
function part1(t) {
  // the question
  A(span(t, CH[0].at + 3.6, s('w2', 0.3), 0.6, 0.5), () => heading('What is light?', W / 2, 540, { size: 104, align: 'center' }));
  // two books
  const cardsOut = 1 - seg(t, s('w6') - 0.2, s('w6', 0.5));
  const hp = eout(seg(t, s('w2'), s('w2', 0.8))), np = eout(seg(t, s('w3'), s('w3', 0.8)));
  const lead = eio(seg(t, s('w5', 0.2), s('w5', 2.2)));
  A(hp * cardsOut * lerp(1, 0.55, lead), () => {
    ctx.save(); ctx.translate(0, (1 - hp) * 20);
    card(120, 196, 780, 600);
    heading('Treatise on Light', 170, 266, { size: 56 });
    label('1690 · CHRISTIAAN HUYGENS', 170, 330, { color: C.green, size: 32 });
    ctx.save(); rr(140, 370, 740, 330, 16); ctx.clip();
    for (let i = 0; i < 9; i++) {
      const r = ((t * 70 + i * 52) % 470);
      ctx.strokeStyle = `rgba(61,255,138,${0.75 * (1 - r / 470)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(330, 535, r, -1.2, 1.2); ctx.stroke();
    }
    blob(glowG, 330, 535, 22);
    ctx.restore();
    label('LIGHT AS A WAVE', 170, 750, { color: C.textSoft });
    ctx.restore();
  });
  A(np * cardsOut, () => {
    ctx.save(); ctx.translate(0, (1 - np) * 20);
    card(1010, 196, 790, 600, { edge: 'rgba(255,79,79,0.4)' });
    heading('Opticks', 1060, 266, { size: 56 });
    label('1704 · ISAAC NEWTON', 1060, 330, { color: C.red, size: 32 });
    const q = seg(t, s('w4'), s('w4', 0.6));
    ctx.save(); rr(1030, 370, 750, q > 0 ? lerp(330, 130, eio(q)) : 330, 16); ctx.clip();
    const r = mulberry32(17);
    for (let i = 0; i < 26; i++) {
      const y = 400 + r() * 270, v = 140 + r() * 120, x = 1040 + ((t * v + r() * 900) % 760);
      blob(glowR, x, lerp(y, 420 + (y - 400) * 0.35, eio(q)), 9);
    }
    ctx.restore();
    A(eout(q), () => para('“Are not the Rays of Light very small Bodies emitted from shining Substances?”', 1060, 556, 690, { size: 40, style: 'italic ', color: C.text }));
    label('LIGHT AS PARTICLES', 1060, 750, { color: C.textSoft });
    ctx.restore();
  });
  // the particle view leads
  A(span(t, s('w5', 0.1), s('w6', 0.4), 0.5, 0.5), () => {
    const x0 = 160, x1 = 1760, yr = (y) => lerp(x0, x1, (y - 1680) / 130), y = 880;
    ctx.strokeStyle = C.steelDim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillStyle = C.red; ctx.globalAlpha *= 0.85; ctx.fillRect(yr(1704), y - 7, (yr(1800) - yr(1704)) * lead, 14); ctx.globalAlpha /= 0.85;
    for (const yy of [1690, 1704, 1750, 1800]) { ctx.fillStyle = C.text; ctx.fillRect(yr(yy) - 1.5, y - 18, 3, 36); label(String(yy), yr(yy), y + 46, { align: 'center', color: C.textSoft }); }
    A(seg(t, s('w5', 1.0), s('w5', 1.6)), () => label('THE PARTICLE VIEW LEADS', yr(1752), y - 44, { align: 'center', color: C.red, weight: 600 }));
  });
  // how to tell: the apparatus, with particles
  const ap = eout(seg(t, s('w6', 0.2), s('w6', 1.0)));
  const n = SP.N(t);
  A(ap, () => {
    panel(1); screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, 0.6, { name: 'SOURCE', color: C.red });
    barrier(TV.bx, slitYs());
    // straight paths through the slits
    A(span(t, s('w7', 0.2), s('w8', 1.0), 0.5, 0.8), () => {
      for (const sy of slitYs()) for (const dy of [-TV.a / 2, TV.a / 2]) {
        const yS = TV.cy + (sy + dy - TV.cy) * (TV.sx - TV.src) / (TV.bx - TV.src);
        ctx.strokeStyle = 'rgba(255,79,79,0.28)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.moveTo(TV.src + 50, TV.cy); ctx.lineTo(TV.sx, yS); ctx.stroke(); ctx.setLineDash([]);
      }
      // particles in flight, all the way, as classical particles would
      for (let i = 0; i < Math.min(n + 2, 60); i++) {
        const h = HITS_P[i], ta = SP.inv(i + 1), q = seg(t, ta - 0.75, ta);
        if (q <= 0 || q >= 1) continue;
        const ys = h.y, x = lerp(TV.src + 50, TV.sx, q), y = lerp(TV.cy, ys, q);
        blob(glowR, x, y, 13);
      }
      label('WHAT PARTICLES WOULD DO', P.x0 + P.w / 2, P.y0 + 44, { align: 'center', color: C.red, weight: 600 });
    });
    drawHits(HITS_P, n, t, SP, { a: 1 - seg(t, s('w8'), s('w8', 0.8)), spr: glowR, dot: 'rgba(255,79,79,0.7)' });
    // two waves meet
    waves(t, 0.6 * seg(t, s('w8', 0.3), s('w8', 1.3)), { plane: true });
  });
  // add up, or cancel out
  const ph = (t) => {
    let v = Math.PI * eio(seg(t, mid('w8', 0.55), mid('w8', 0.8)));
    v = lerp(v, 0, eio(seg(t, s('w9'), mid('w9', 0.12))));
    v = lerp(v, Math.PI, eio(seg(t, mid('w9', 0.36), mid('w9', 0.5))));
    return v;
  };
  const wa = seg(t, s('w8', 0.2), s('w8', 1.0));
  A(wa, () => { ctx.fillStyle = 'rgba(2,7,6,0.97)'; rr(P.x0, P.y0, P.w, P.h, 14); ctx.fill(); });
  const phi = ph(t);
  waveSum(t, P.x0 + 50, 0, P.w - 100, phi, wa);
  A(wa, () => {
    const add = Math.cos(phi / 2) ** 2;
    label('ADD UP', P.x1 - 50, 878, { align: 'right', color: C.green, weight: 600, size: 36 }); 
    ctx.save(); ctx.globalAlpha *= 1; ctx.restore();
    A(1 - add, () => { ctx.fillStyle = 'rgba(2,7,6,1)'; ctx.fillRect(P.x1 - 260, 850, 220, 56); label('CANCEL OUT', P.x1 - 50, 878, { align: 'right', color: C.red, weight: 600, size: 36 }); });
    A(seg(t, mid('w9', 0.72), mid('w9', 0.86)), () => chip('INTERFERENCE', P.x0 + 50, 878, { color: C.greenHi, size: 34 }));
  });
}
