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
function waveSum(t, x0, y0, w, phi, a, { rows = [300, 470, 700], amp = 50, names = ['WAVE 1', 'WAVE 2', 'TOGETHER'], lam = 190, moving = true } = {}) {
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
    names.forEach((n, i) => label(n, x0, rows[i] - amp * (i === 2 ? 2 : 1) - 30, { size: 32 }));
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
  const cardsOut = 1 - seg(t, s('w6') - 0.4, s('w6', 0.2));
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
  const ap = eout(seg(t, s('w6', -0.05), s('w6', 0.7)));
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
    A(add, () => label('ADD UP', P.x1 - 50, 878, { align: 'right', color: C.green, weight: 600, size: 36 }));
    A(1 - add, () => label('CANCEL OUT', P.x1 - 50, 878, { align: 'right', color: C.red, weight: 600, size: 36 }));
    A(seg(t, mid('w9', 0.72), mid('w9', 0.86)), () => chip('INTERFERENCE', P.x0 + 50, 878, { color: C.greenHi, size: 34 }));
  });
}

// ---------- 2: Young's stripes ----------
function wl2rgb(nm) {
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1;
  const f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 680 ? 0.3 + 0.7 * (720 - nm) / 40 : 1;
  return [r * f, g * f, b * f];
}
const YG = { hole: 200, card: 470, cardH: 30, cone: 214, s0: 19 };
YG.shadow = YG.cardH * (TV.sx - YG.hole) / (YG.card - YG.hole);
/** Young's card in sunlight, face-on: coloured fringes inside the card's shadow (white light, computed). */
function youngRow(u, blocked) {
  const au = Math.abs(u), outer = clamp((YG.cone + 26 - au) / 26);
  if (blocked && u < -YG.shadow) return [0, 0, 0, 0];
  if (au > YG.shadow) return [255, 236, 200, 0.92 * outer];
  if (blocked) { const v = 0.4 * Math.exp(-(YG.shadow - u) / 24); return [255, 236, 200, v]; }
  let R = 0, G = 0, B = 0, n = 0;
  for (let nm = 400; nm <= 700; nm += 10) { const c = wl2rgb(nm), v = Math.cos((Math.PI * u) / (YG.s0 * nm / 550)) ** 2; R += c[0] * v; G += c[1] * v; B += c[2] * v; n += (c[0] + c[1] + c[2]) / 3; }
  R /= n; G /= n; B /= n;
  const m = Math.max(R, G, B, 1e-6);
  return [255 * R / m, 255 * G / m, 255 * B / m, 0.82 * m * (0.6 + 0.4 * (1 - au / YG.shadow))];
}
const rowCache = new Map();
function rowsImage(key, fn) {
  if (rowCache.has(key)) return rowCache.get(key);
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = P.h;
  const g = cv.getContext('2d'), img = g.createImageData(1, P.h);
  for (let j = 0; j < P.h; j++) { const [r, gg, b, a] = fn(j + 0.5 - P.h / 2); img.data[j * 4] = r; img.data[j * 4 + 1] = gg; img.data[j * 4 + 2] = b; img.data[j * 4 + 3] = Math.round(255 * clamp(a)); }
  g.putImageData(img, 0, 0); rowCache.set(key, cv); return cv;
}
function drawRows(cv, a, { lighter = true, x0 = P.x0, x1 = P.x1 } = {}) {
  if (a <= 0) return;
  A(a, () => clipPanel(() => {
    ctx.save(); if (lighter) ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, x0, P.y0, x1 - x0, P.h); ctx.restore();
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(2,7,6,0.85)'); g.addColorStop(0.18, 'rgba(2,7,6,0)'); g.addColorStop(0.82, 'rgba(2,7,6,0)'); g.addColorStop(1, 'rgba(2,7,6,0.85)');
    ctx.fillStyle = g; ctx.fillRect(x0, P.y0, x1 - x0, P.h);
  }));
}
/** Arago's disc, face-on: its round shadow, the rings at its edge and (optionally) the bright spot. */
const discImg = {};
function aragoImage(spot) {
  if (discImg[spot]) return discImg[spot];
  const sc = 2, w = Math.ceil(P.w / sc), h = Math.ceil(P.h / sc), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), img = g.createImageData(w, h), R = 60 * (TV.sx - YG.hole) / (YG.card - YG.hole);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const r = Math.hypot((i + 0.5) * sc - P.w / 2, (j + 0.5) * sc - P.h / 2);
    let v;
    if (r > R) v = (1 - 0.32 * Math.cos((2 * Math.PI * (r - R)) / 22) * Math.exp(-(r - R) / 46)) * clamp((330 - r) / 40) * 0.85;
    else v = 0.05 * Math.exp(-(R - r) / 14);
    if (spot) v += 0.95 * Math.exp(-((r / 9) ** 2)) + 0.12 * Math.cos((2 * Math.PI * r) / 20) ** 2 * Math.exp(-r / 40) * clamp(1 - r / R);
    const o = (j * w + i) * 4; img.data[o] = 255; img.data[o + 1] = 236; img.data[o + 2] = 200; img.data[o + 3] = Math.round(255 * clamp(v));
  }
  g.putImageData(img, 0, 0); discImg[spot] = cv; return cv;
}
function sunlightSetup(t, a, { blockP = 0, disc = false, both = 0 } = {}) {
  A(a, () => {
    // the shutter with its hole, sunlight outside
    const sg = ctx.createLinearGradient(96, 0, YG.hole, 0); sg.addColorStop(0, 'rgba(255,227,168,0)'); sg.addColorStop(1, 'rgba(255,227,168,0.35)');
    ctx.fillStyle = sg; ctx.fillRect(96, TV.cy - 120, YG.hole - 96, 240);
    ctx.fillStyle = C.steelDim; ctx.fillRect(YG.hole - 8, TV.by0, 16, TV.cy - 6 - TV.by0); ctx.fillRect(YG.hole - 8, TV.cy + 6, 16, TV.by1 - TV.cy - 6);
    label(disc ? 'LIGHT' : 'SHUTTER', YG.hole, TV.by0 - 34, { align: 'center' });
    blob(glowW, YG.hole, TV.cy, 22);
    // the cone of light, and the shadow of the card (or disc)
    const hh = disc ? 60 : YG.cardH, sh = hh * (TV.sx - YG.hole) / (YG.card - YG.hole);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const cone = (yA, yB, alpha) => { ctx.fillStyle = `rgba(255,227,168,${alpha})`; ctx.beginPath(); ctx.moveTo(YG.hole, TV.cy); ctx.lineTo(TV.sx, yA); ctx.lineTo(TV.sx, yB); ctx.closePath(); ctx.fill(); };
    cone(TV.cy + sh, TV.cy + YG.cone, 0.16);
    if (blockP < 0.5) cone(TV.cy - YG.cone, TV.cy - sh, 0.16 * (1 - 2 * blockP));
    ctx.restore();
    // the card, edge-on
    ctx.fillStyle = C.warm; ctx.fillRect(YG.card - 3, TV.cy - hh, 6, 2 * hh);
    label(disc ? 'SMALL DISC' : 'CARD, 1/30 INCH', YG.card, TV.cy + hh + 44, { align: 'center', color: C.warm });
    // a second card blocking one edge
    if (blockP > 0) A(blockP, () => {
      const yb = lerp(TV.by0 - 40, TV.cy - 20, eout(blockP));
      ctx.fillStyle = C.amber; ctx.fillRect(400 - 3, yb - 112, 6, 112);
      label('BLOCKED', 400, yb - 136, { align: 'center', color: C.amber });
    });
    if (both > 0) A(both, () => {
      for (const sgn of [-1, 1]) arrow(YG.card + 10, TV.cy + sgn * hh, TV.sx - 14, TV.cy + sgn * 4, C.warm, 3, 16);
      label('LIGHT FROM BOTH SIDES', 660, TV.cy - 180, { align: 'center', color: C.warm });
    });
    ctx.fillStyle = 'rgba(255,227,168,0.45)'; ctx.fillRect(TV.sx - 3, TV.y0, 6, TV.y1 - TV.y0);
    label('WALL', TV.sx, TV.y0 - 34, { align: 'center' });
  });
}
function partYoung(t) {
  // Thomas Young
  const ya = span(t, CH[1].at + 3.4, s('y2'), 0.6, 0.6);
  A(ya, () => {
    heading('Thomas Young', 160, 440, { size: 104 });
    label('1773–1829', 164, 530, { size: 44, color: C.green });
    label('DOCTOR · POLYMATH', 164, 600, { size: 34, color: C.textSoft });
    const rp = eout(seg(t, mid('y1', 0.25), mid('y1', 0.5)));
    A(rp, () => { rosetta(1380, 540 + (1 - rp) * 20, 1.0); label('THE ROSETTA STONE', 1380, 800, { align: 'center' }); });
  });
  // 24 November 1803
  A(span(t, s('y2', -0.25), s('y3', 0.15), 0.5, 0.5), () => {
    label('24 NOVEMBER 1803', W / 2, 400, { size: 52, color: C.green, align: 'center', spacing: '4px', weight: 600 });
    font(400, 80, SANS, 'italic '); text('“whenever the sun shines”', W / 2, 530, { align: 'center' });
    label('TO THE ROYAL SOCIETY OF LONDON', W / 2, 640, { align: 'center', color: C.textSoft });
  });
  // the card in a sunbeam
  const st = span(t, s('y3', -0.05), s('y7', 0.3), 0.6, 0.6);
  const blockP = eio(seg(t, s('y5', 0.1), s('y5', 0.9))) * (1 - eio(seg(t, s('y6', 0.1), s('y6', 0.8))));
  const both = span(t, s('y6', 0.6), e('y6', 0.3), 0.4, 0.4);
  sunlightSetup(t, st, { blockP, both });
  A(st, () => {
    panel(1, { name: 'THE WALL, FACE-ON' }); seenFromAbove(1, 'SEEN FROM ABOVE · A DIAGRAM');
    const f = eout(seg(t, s('y4'), s('y4', 1.2)));
    drawRows(rowsImage('young', (u) => youngRow(u, false)), f * (1 - blockP));
    drawRows(rowsImage('youngB', (u) => youngRow(u, true)), f * blockP);
    A(seg(t, s('y4', 0.8), s('y4', 1.4)) * (1 - blockP), () => label('FRINGES IN THE SHADOW', P.x0 + P.w / 2, P.y0 + 44, { align: 'center', color: C.warm, weight: 600 }));
    A(blockP, () => label('NO FRINGES', P.x0 + P.w / 2, P.y0 + 44, { align: 'center', color: C.amber, weight: 600 }));
  });
  // the two-slit version, described
  const bk = span(t, s('y7'), s('y9', 0.2), 0.6, 0.6);
  A(bk, () => {
    card(120, 210, 1680, 660);
    ctx.save(); rr(140, 230, 760, 620, 16); ctx.clip();
    for (const sy of [470, 610]) for (let r = 24; r < 760; r += 26) {
      ctx.strokeStyle = `rgba(61,255,138,${0.6 * (1 - r / 760)})`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(200, sy, r - ((t * 40) % 26), -1.35, 1.35); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = C.metal; ctx.fillRect(196, 240, 8, 222); ctx.fillRect(196, 478, 8, 124); ctx.fillRect(196, 618, 8, 232);
    label('1807', 980, 320, { size: 52, color: C.green, weight: 600 });
    heading('His lectures are published', 980, 400, { size: 52 });
    para('“…a screen in which there are two very small holes or slits…”', 980, 500, 760, { size: 44, style: 'italic ' });
    label('THOMAS YOUNG', 980, 640, { color: C.textSoft });
    const sp = eout(seg(t, s('y8', 0.2), s('y8', 0.7)));
    A(sp, () => {
      ctx.save(); ctx.translate(1380, 760); ctx.rotate(-0.06); ctx.scale(lerp(1.3, 1, sp), lerp(1.3, 1, sp));
      chip('ACTUALLY PERFORMED? UNCLEAR', 0, 0, { color: C.red, align: 'center', size: 34 });
      ctx.restore();
    });
  });
  // Fresnel, Poisson and Arago's spot
  const ar = span(t, s('y9', 0.1), s('y14', 0.05), 0.6, 0.6);
  const spot = eout(seg(t, mid('y12', 0.55), mid('y12', 0.8)));
  sunlightSetup(t, ar * (1 - 0.7 * seg(t, s('y13'), s('y13', 0.6))), { disc: true });
  A(ar, () => {
    panel(1, { name: 'THE SCREEN, FACE-ON' }); seenFromAbove(1, 'SEEN FROM ABOVE · A DIAGRAM');
    const im = seg(t, s('y9', 0.6), s('y9', 1.6));
    A(im * (1 - spot), () => clipPanel(() => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(aragoImage(false), P.x0, P.y0, P.w, P.h); ctx.restore(); }));
    A(im * spot, () => clipPanel(() => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.drawImage(aragoImage(true), P.x0, P.y0, P.w, P.h); ctx.restore(); }));
    chipFade(t, '1818 · A PRIZE CONTEST IN PARIS', P.x0 + 30, 152, s('y9', 0.2), s('y10', 0.2), C.green);
    A(span(t, s('y10', 0.2), mid('y12', 0.6), 0.4, 0.3), () => chip('POISSON: A WAVE THEORY’S FLAW?', 560, 820, { color: C.red, align: 'center' }));
    A(span(t, s('y11', 0.3), mid('y12', 0.6), 0.4, 0.3), () => {
      ctx.strokeStyle = C.red; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(P.x0 + P.w / 2, P.cy, 30, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      chip('A BRIGHT SPOT HERE?', P.x0 + P.w / 2, P.cy + 80, { align: 'center', color: C.red });
    });
    A(seg(t, mid('y12', 0.6), mid('y12', 0.9)) * (1 - seg(t, s('y13'), s('y13', 0.5))), () => { chip('ARAGO, 1819: THERE IT IS', 560, 820, { color: C.warm, align: 'center' }); chip('THE SPOT', P.x0 + P.w / 2, P.cy + 80, { align: 'center', color: C.warm }); });
    // rays bending into the shadow
    A(span(t, s('y11', 0.3), s('y13', 0.4), 0.5, 0.5), () => {
      ctx.strokeStyle = 'rgba(255,227,168,0.5)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 8]);
      for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(YG.card, TV.cy + sg * 62); ctx.quadraticCurveTo(700, TV.cy + sg * 52, TV.sx - 6, TV.cy); ctx.stroke(); }
      ctx.setLineDash([]);
    });
  });
  A(span(t, s('y13', 0.1), s('y14', 0.05), 0.5, 0.5), () => {
    ctx.fillStyle = 'rgba(2,6,7,0.72)'; rr(110, 430, 820, 260, 20); ctx.fill();
    heading('Light is a wave', 520, 560, { size: 92, align: 'center', color: C.warm });
  });
  // Maxwell
  const mx = span(t, s('y14', -0.2), CH[2].at + 1.2, 0.6, 0.6);
  A(mx, () => {
    label('1865 · JAMES CLERK MAXWELL', 160, 250, { size: 40, color: C.green, weight: 600 });
    heading('Light: an electromagnetic wave', 160, 330, { size: 64 });
    const y0 = 640, x0 = 160, x1 = 1760, lam = 300, ph = t * 1.4;
    ctx.strokeStyle = 'rgba(234,243,240,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    const ink = eio(seg(t, s('y14', 0.2), s('y14', 2.2)));
    const xe = lerp(x0, x1, ink);
    for (let x = x0; x <= xe; x += 16) {
      const v = Math.sin((2 * Math.PI * (x - x0)) / lam - ph);
      ctx.strokeStyle = 'rgba(61,255,138,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 - 150 * v); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,79,79,0.35)'; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 60 * v, y0 + 50 * v); ctx.stroke();
    }
    const tr = (col, f) => { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); for (let x = x0; x <= xe; x += 4) { const v = Math.sin((2 * Math.PI * (x - x0)) / lam - ph); const [px, py] = f(x, v); x === x0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); ctx.restore(); };
    tr(C.green, (x, v) => [x, y0 - 150 * v]);
    tr(C.red, (x, v) => [x + 60 * v, y0 + 50 * v]);
    A(seg(t, s('y14', 1.6), s('y14', 2.4)), () => { label('ELECTRIC FIELD', x1, 450, { align: 'right', color: C.green }); label('MAGNETIC FIELD', x1, 800, { align: 'right', color: C.red }); });
  });
}
function chipFade(t, str, x, y, t0, t1, color) { A(span(t, t0, t1, 0.4, 0.4), () => chip(str, x, y, { color })); }

// ---------- 3: reading the stripes ----------
const LS = 11;                                   // the wavelength in the diagram, px
const yUp = TV.cy - TV.d / 2, yLo = TV.cy + TV.d / 2, LL = TV.sx - TV.bx;
const extra = (y) => Math.hypot(LL, y - yUp) - Math.hypot(LL, y - yLo); // path difference at the screen, px (exact)
function yForExtra(m) { let lo = TV.cy, hi = TV.y1 + 400; for (let i = 0; i < 50; i++) { const md = (lo + hi) / 2; if (extra(md) / LS < m) lo = md; else hi = md; } return (lo + hi) / 2; }
const Iexact = (y) => Math.cos((Math.PI * extra(y)) / LS) ** 2 / (1 + ((y - TV.cy) / 520) ** 2);
function labState(t) {
  // the slits and screen of the worked example, changed in "Move the screen" and "Young had described this too"
  let L = LAB.L, d = LAB.d;
  L = lerp(L, 2 * LAB.L, eio(seg(t, s('r10', 0.2), s('r10', 1.6)))) ;
  L = lerp(L, LAB.L, eio(seg(t, s('r11'), s('r11', 0.8))));
  d = lerp(d, LAB.d / 2, eio(seg(t, s('r11', 0.6), s('r11', 2.0))));
  d = lerp(d, LAB.d, eio(seg(t, s('r12'), s('r12', 0.8))));
  return { ...LAB, L, d };
}
const num = (v, dp) => { for (let q = 0; q < dp; q++) { const r = Math.round(v * 10 ** q) / 10 ** q; if (Math.abs(v - r) < 1e-6) return r.toFixed(q); } return v.toFixed(dp); };
function part3(t) {
  const ap = span(t, CH[2].at + 3.0, CH[3].at + 1.0, 0.8, 0.8);
  const formulaOn = seg(t, s('r7'), s('r7', 0.8));
  const yP = (() => {
    let y = yForExtra(0.7);
    y = lerp(y, yForExtra(2), eio(seg(t, s('r4', 0.1), s('r4', 1.0))));
    y = lerp(y, yForExtra(1.5), eio(seg(t, s('r5', 0.1), s('r5', 0.9))));
    y = lerp(y, TV.y0 + 30, eio(seg(t, s('r6', 0.05), s('r6', 0.5))));
    y = lerp(y, TV.y1 - 30, eio(seg(t, s('r6', 0.6), e('r6', -0.2))));
    return y;
  })();
  const pOn = span(t, s('r3', 0.2), s('r7', 0.4), 0.5, 0.5);
  A(ap * lerp(1, 0.05, formulaOn), () => {
    screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, 1);
    beam(TV.src + 50, TV.bx, TV.cy, 1);
    barrier(TV.bx, slitYs());
    waves(t, span(t, s('r2', 0.1), s('r7', 0.6), 0.8, 0.6), { lambda: LS });
    // the exact pattern on the screen line, revealed by the sweep
    A(seg(t, s('r6', 0.6), s('r6', 0.9)), () => {
      const all = t >= e('r6', -0.2);
      for (let y = TV.y0; y < TV.y1; y += 2) {
        if (!all && y > yP) continue;
        const v = Iexact(y); ctx.fillStyle = `rgba(61,255,138,${v})`; ctx.fillRect(TV.sx - 4, y, 8 + 34 * v, 2);
      }
    });
    // the point on the screen and the two paths to it
    A(pOn, () => {
      const r1 = Math.hypot(LL, yP - yUp), r2 = Math.hypot(LL, yP - yLo), ex = r1 - r2;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(234,243,240,0.75)';
      ctx.beginPath(); ctx.moveTo(TV.bx, yUp); ctx.lineTo(TV.sx, yP); ctx.moveTo(TV.bx, yLo); ctx.lineTo(TV.sx, yP); ctx.stroke();
      // the extra stretch on the longer path
      const lng = ex >= 0 ? [TV.bx, yUp, r1] : [TV.bx, yLo, r2], sh = Math.min(r1, r2);
      const fx = (f) => lerp(lng[0], TV.sx, f), fy = (f) => lerp(lng[1], yP, f);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(fx(sh / lng[2]), fy(sh / lng[2])); ctx.lineTo(TV.sx, yP); ctx.stroke();
      blob(glowW, TV.sx, yP, 18);
      ctx.strokeStyle = C.text; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(TV.sx, yP, 14, 0, 6.283); ctx.stroke();
    });
  });
  A(ap * span(t, s('r1', 0.3), s('r3', 0.6), 0.6, 0.5), () => { panel(1); exposure(I2, 1, { gain: 1.05 }); label('SO MANY STRIPES', P.x0 + P.w / 2, P.y0 + 40, { align: 'center', color: C.green, weight: 600 }); });
  // the readout: how far the extra distance is, in wavelengths, and what the two waves do there
  const ro = pOn * (1 - formulaOn);
  A(ro * ap, () => {
    const ex = extra(yP) / LS, fr = Math.abs(ex - Math.round(ex));
    label('EXTRA DISTANCE', P.x0 + 30, 250, { size: 32 });
    font(600, 84, MONO); text(Math.abs(ex).toFixed(2), P.x0 + 30, 336, { color: C.amber });
    const wv = ctx.measureText(Math.abs(ex).toFixed(2)).width;
    label('WAVELENGTHS', P.x0 + 30 + wv + 24, 344, { size: 34, color: C.textSoft });
    A(clamp(1 - fr / 0.12), () => chip('BRIGHT', P.x1 - 30, 336, { color: C.green, align: 'right', size: 36 }));
    A(clamp(1 - Math.abs(fr - 0.5) / 0.12), () => chip('DARK', P.x1 - 30, 336, { color: C.red, align: 'right', size: 36 }));
    waveSum(t, P.x0 + 30, 0, P.w - 60, 2 * Math.PI * ex, 1, { rows: [520, 650, 830], amp: 40, names: ['FROM SLIT 1', 'FROM SLIT 2', 'TOGETHER'], lam: 170 });
  });
  // the rule, and the worked example on the true-scale screen
  const lp = labState(t);
  const w = spacingMM(lp.lambda, lp.L, lp.d);
  A(ap * formulaOn, () => {
    panel(1, { link: false, name: 'THE SCREEN, FACE-ON · TRUE SCALE' });
    exposure((u) => I2(u, lp), 1, { gain: 1.05 });
    // a millimetre ruler down the left edge
    for (let mm = -8; mm <= 8; mm++) { const y = P.cy + mm * MM; ctx.fillStyle = 'rgba(234,243,240,0.5)'; ctx.fillRect(P.x0, y - 1, mm % 2 ? 12 : 22, 2); }
    label('TICKS: 1 mm', P.x0 + 34, P.y0 + 34, { size: 32, color: C.textDim });
    // the bracket between two bright stripes
    A(seg(t, s('r9'), s('r9', 0.6)), () => {
      const x = P.x1 - 50, ya = P.cy, yb = P.cy + w * MM;
      ctx.strokeStyle = C.text; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 16, ya); ctx.lineTo(x, ya); ctx.lineTo(x, yb); ctx.lineTo(x - 16, yb); ctx.stroke();
      chip(`${w.toFixed(1)} mm`, x - 30, (ya + yb) / 2, { color: C.text, align: 'right', size: 34 });
    });
    // the formula card
    card(120, 210, 800, 690);
    font(600, 60); text('spacing = λ × L ÷ d', 170, 300, { color: C.text });
    const rows = [['λ', 'wavelength', `${num(lp.lambda * 1000, 1)} µm`, mid('r8', 0.45)], ['L', 'distance to the screen', `${num(lp.L / 1000, 1)} m`, mid('r8', 0.8)], ['d', 'gap between the slits', `${num(lp.d, 2)} mm`, mid('r8', 0.1)]];
    rows.forEach(([sym, desc, val, at], i) => {
      const y = 420 + i * 92;
      font(600, 52); text(sym, 170, y, { color: C.green });
      font(400, 36); text(desc, 240, y, { color: C.textSoft });
      A(seg(t, at, at + 0.5), () => { font(600, 40, MONO); text(val, 870, y, { color: C.text, align: 'right' }); });
    });
    A(seg(t, s('r9'), s('r9', 0.5)), () => {
      ctx.fillStyle = 'rgba(61,255,138,0.25)'; ctx.fillRect(170, 664, 700, 2);
      label('SPACING', 170, 720, { size: 34 });
      font(700, 64, MONO); text(`${w.toFixed(1)} mm`, 870, 720, { color: C.green, align: 'right' });
    });
    A(span(t, s('r11', 0.4), s('r12', 0.3), 0.5, 0.4), () => para('“wider also in the same proportion as the apertures are closer to each other”', 170, 800, 700, { size: 34, style: 'italic ', color: C.textSoft }));
    A(seg(t, s('r12', 0.5), s('r12', 1.1)), () => {
      font(500, 40); text(`λ = ${w.toFixed(1)} mm × ${num(lp.d, 2)} mm ÷ ${num(lp.L / 1000, 1)} m = ${num(w * lp.d / lp.L * 1000, 1)} µm`, 170, 812, { color: C.text });
      label('STRIPES IN, WAVELENGTH OUT', 170, 862, { size: 32, color: C.green });
    });
  });
}

// ---------- 4: one at a time ----------
const S4 = schedule([[s('p12', 0.7), 0], [e('p12'), 12], [e('p13'), 300, 1.5], [e('p14', -0.3), 10000, 2.2], [s('p15', 0.2), 10000], [e('p15', 0.3), 60000, 1.3]]);
function gasFlame(x, y, a = 1) {
  A(a, () => {
    blob(glowW, x, y, 46, 0.7);
    ctx.fillStyle = C.amber; ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.quadraticCurveTo(x + 20, y - 4, x, y + 16); ctx.quadraticCurveTo(x - 20, y - 4, x, y - 34); ctx.fill();
    ctx.fillStyle = C.warm; ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 9, y, x, y + 10); ctx.quadraticCurveTo(x - 9, y, x, y - 18); ctx.fill();
  });
}
/** The plate behind Taylor's needle (enlarged): fringes in the needle's shadow, monochrome. */
function needleRow(u) {
  const sh = 110, au = Math.abs(u);
  if (au < sh) return [235, 225, 200, 0.75 * Math.cos((Math.PI * u) / 26) ** 2 * (0.55 + 0.45 * (1 - au / sh))];
  return [235, 225, 200, (0.85 - 0.25 * Math.cos((2 * Math.PI * (au - sh)) / 30) * Math.exp(-(au - sh) / 50)) * clamp((330 - au) / 40)];
}
function machZehnder(t, a, sch) {
  A(a, () => {
    const S = [190, 720], B1 = [400, 720], M1 = [400, 380], M2 = [800, 720], B2 = [800, 380], D1 = [905, 380], D2 = [800, 260];
    ctx.strokeStyle = 'rgba(61,255,138,0.32)'; ctx.lineWidth = 4;
    const ln = (p, q) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
    ln(S, B1); ln(B1, M1); ln(M1, B2); ln(B1, M2); ln(M2, B2); ln(B2, D1); ln(B2, D2);
    const bs = (p, mirror) => { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(-Math.PI / 4); ctx.fillStyle = mirror ? C.metal : 'rgba(150,220,255,0.55)'; ctx.fillRect(-36, -4, 72, 8); ctx.restore(); };
    bs(B1); bs(B2); bs(M1, true); bs(M2, true);
    label('SPLITTER', B1[0] + 30, B1[1] + 54, { align: 'center' }); label('MIRROR', M1[0], M1[1] - 50, { align: 'center' }); label('MIRROR', M2[0], M2[1] + 54, { align: 'center' });
    blob(glowG, S[0], S[1], 22); label('ONE PHOTON AT A TIME', S[0] - 60, S[1] - 64, { align: 'left', color: C.green });
    const det = (p, nm) => { ctx.fillStyle = '#16262B'; rr(p[0] - 26, p[1] - 26, 52, 52, 8); ctx.fill(); ctx.strokeStyle = C.steel; ctx.lineWidth = 2; ctx.stroke(); label(nm, p[0] + (nm === 'A' ? 50 : 0), p[1] + (nm === 'A' ? 0 : -50), { align: nm === 'A' ? 'left' : 'center', color: C.text, weight: 600 }); };
    det(D1, 'A'); det(D2, 'B');
    // photons: one dot to the first splitter, then a faint half on each arm (both paths), then a click at A
    const n = sch.N(t);
    for (let i = Math.max(0, n - 3); i < Math.min(n + 2, 400); i++) {
      const ta = sch.inv(i + 1), q = seg(t, ta - 1.0, ta);
      if (q <= 0) continue;
      if (q < 1) {
        if (q < 0.3) blob(glowG, lerp(S[0], B1[0], q / 0.3), S[1], 14);
        else { const f = (q - 0.3) / 0.7; const along = (p0, p1, p2, f) => (f < 0.5 ? [lerp(p0[0], p1[0], f * 2), lerp(p0[1], p1[1], f * 2)] : [lerp(p1[0], p2[0], f * 2 - 1), lerp(p1[1], p2[1], f * 2 - 1)]); const u = along(B1, M1, B2, f), v = along(B1, M2, B2, f); blob(glowG, u[0], u[1], 12, 0.55); blob(glowG, v[0], v[1], 12, 0.55); }
      } else blob(glowG, D1[0], D1[1], 30, 1 - seg(t, ta, ta + 0.5));
    }
  });
}
function part4(t) {
  // the crack
  const cr = span(t, CH[3].at + 3.3, s('p2', 0.05), 0.5, 0.5);
  A(cr, () => {
    heading('Light is a wave', W / 2, 540, { size: 112, align: 'center', color: C.warm });
    const ink = eio(seg(t, s('p1', 0.3), e('p1')));
    ctx.save(); ctx.shadowColor = C.red; ctx.shadowBlur = 12; ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath();
    const r = mulberry32(5), pts = []; for (let i = 0; i <= 14; i++) pts.push([lerp(540, 1380, i / 14), 540 + (r() - 0.5) * 90]);
    pts.forEach(([x, y], i) => { if (i / 14 <= ink) i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke(); ctx.restore();
  });
  // lumps of light
  const lp = span(t, s('p2', -0.2), s('p4', 0.2), 0.6, 0.6);
  const dim = eio(seg(t, s('p3', 0.3), e('p3')));
  A(lp, () => {
    seenFromAbove(1);
    laser(TV.src, TV.cy, lerp(1, 0.35, dim));
    barrier(TV.bx, slitYs()); screenLine(1);
    const gap = lerp(34, 210, dim);
    for (let x = ((t * 260) % gap) + TV.src + 50; x < TV.bx - 6; x += gap) blob(glowG, x, TV.cy, 12);
    chip('1905 · ALBERT EINSTEIN', P.x0, 250, { color: C.green });
    heading('Light comes in lumps', P.x0, 350, { size: 60 });
    label('PHOTONS', P.x0, 420, { color: C.green, size: 36, weight: 600 });
    // a continuous wave above, packets below
    const x0 = P.x0, wd = P.w;
    ctx.strokeStyle = 'rgba(255,227,168,0.7)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= wd; x += 4) { const y = 560 - 40 * Math.sin((x - t * 160) / 26); x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0, y); } ctx.stroke();
    label('A SMOOTH WAVE?', x0, 500, { size: 32 });
    ctx.strokeStyle = C.green; ctx.lineWidth = 3;
    for (let c = ((t * 160) % 260) - 260; c < wd + 260; c += 260) {
      ctx.beginPath(); let first = true;
      for (let x = c - 60; x <= c + 60; x += 3) { if (x < 0 || x > wd) continue; const env = Math.exp(-(((x - c) / 30) ** 2)); const y = 760 - 44 * env * Math.sin((x - t * 160) / 9); first ? ctx.moveTo(x0 + x, y) : ctx.lineTo(x0 + x, y); first = false; }
      ctx.stroke();
    }
    label('OR SEPARATE LUMPS OF ENERGY', x0, 680, { size: 32, color: C.green });
    A(dim, () => {
      label('DIMMER', TV.src - 70, 770, { size: 32 });
      ctx.fillStyle = C.steelDim; ctx.fillRect(TV.src - 70, 800, 300, 8);
      ctx.fillStyle = C.green; ctx.fillRect(TV.src - 70, 800, 300 * (1 - 0.9 * dim), 8);
    });
  });
  // Taylor, 1909
  const ty = span(t, s('p4', -0.05), s('p10', 0.1), 0.6, 0.6);
  const expo = seg(t, s('p6', 0.2), e('p6', -0.2));
  A(ty * (1 - 0.75 * seg(t, s('p9'), s('p9', 0.6))), () => {
    seenFromAbove(1, 'SEEN FROM ABOVE · A DIAGRAM');
    gasFlame(TV.src - 10, TV.cy); label('GAS LIGHT', TV.src - 10, TV.cy + 70, { align: 'center' });
    for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(40,50,55,0.85)'; ctx.fillRect(262 + i * 30, TV.cy - 90, 14, 180); ctx.strokeStyle = 'rgba(154,174,182,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(262 + i * 30, TV.cy - 90, 14, 180); }
    label('DARK GLASS', 316, TV.cy - 130, { align: 'center' });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,227,168,0.07)'; ctx.beginPath(); ctx.moveTo(380, TV.cy - 40); ctx.lineTo(TV.sx, TV.cy - 240); ctx.lineTo(TV.sx, TV.cy + 240); ctx.lineTo(380, TV.cy + 40); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = C.metal; ctx.beginPath(); ctx.arc(600, TV.cy, 7, 0, 6.283); ctx.fill();
    label('SEWING NEEDLE', 600, TV.cy + 50, { align: 'center', color: C.warm });
    ctx.fillStyle = 'rgba(235,225,200,0.5)'; ctx.fillRect(TV.sx - 3, TV.y0, 6, TV.y1 - TV.y0);
    label('PLATE', TV.sx, TV.y0 - 34, { align: 'center' });
    chip('1909 · G. I. TAYLOR', 120, 250, { color: C.warm });
    A(seg(t, s('p5', 0.4), s('p5', 1.2)), () => label('≈ A CANDLE MORE THAN A MILE AWAY', 120, 330, { color: C.warm, size: 32 }));
    panel(1, { name: 'THE PLATE, ENLARGED', fill: '#070706' });
    drawRows(rowsImage('needle', needleRow), 0.08 + 0.92 * eio(expo), { lighter: true });
    label('EXPOSURE', P.x0, 152, { size: 32 });
    font(600, 40, MONO); text(`DAY ${Math.round(90 * expo)}`, P.x0 + 200, 152, { color: C.warm });
    A(seg(t, e('p6', -0.6), e('p6')), () => label('3 MONTHS', P.x1, 152, { align: 'right', color: C.warm, weight: 600 }));
    A(span(t, s('p7', 0.1), s('p9', 0.3), 0.4, 0.4), () => chip('THE FRINGES ARE STILL THERE', P.x0 + P.w / 2, P.y1 - 50, { color: C.warm, align: 'center' }));
  });
  // the caution
  A(span(t, s('p9', 0.2), s('p10', 0.1), 0.5, 0.5), () => {
    card(120, 360, 800, 360, { edge: 'rgba(255,79,79,0.5)' });
    chip('A CAUTION', 170, 430, { color: C.red });
    const nl = para('Taylor’s paper never mentions photons.', 170, 520, 700, { size: 40 });
    para('His dim lamp was not a true single-photon source.', 170, 520 + nl * 52 + 30, 700, { size: 40 });
  });
  // 1986
  const mz = span(t, s('p10', -0.15), s('p12', 0.15), 0.6, 0.6);
  const SMZ = schedule([[s('p10', 1.4), 0], [e('p11', 0.3), 9, 1]]);
  machZehnder(t, mz, SMZ);
  A(mz, () => {
    seenFromAbove(1, 'AN INTERFEROMETER · A DIAGRAM');
    chip('1986 · GRANGIER, ROGER AND ASPECT', P.x0, 250, { color: C.green });
    heading('A true single-photon source', P.x0, 350, { size: 52 });
    const n = SMZ.N(t), x = P.x0, y = 620;
    label('EXIT A', x, y, { size: 34, color: C.text }); label('EXIT B', x, y + 110, { size: 34, color: C.text });
    ctx.fillStyle = C.green; ctx.fillRect(x + 190, y - 20, 50 * n, 40);
    font(600, 40, MONO); text(String(n), x + 210 + 50 * n, y, { color: C.green }); text('0', x + 210, y + 110, { color: C.textSoft });
    A(seg(t, s('p11'), s('p11', 0.6)), () => {
      ctx.strokeStyle = C.red; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; const hx = x + 190 + 50 * 4.5;
      ctx.beginPath(); ctx.moveTo(hx, y - 50); ctx.lineTo(hx, y + 150); ctx.stroke(); ctx.setLineDash([]);
      label('HALF EACH, IF EVERY PHOTON TOOK ONE PATH', x, y + 220, { color: C.red, size: 32 });
      label('THE TWO PATHS INTERFERE', x, 470, { color: C.green, size: 34, weight: 600 });
    });
  });
  // the build-up
  const bu = span(t, s('p12', -0.1), CH[4].at + 1.0, 0.6, 0.6);
  const n = S4.N(t), bright = seg(t, s('p15', 0.2), s('p15', 1.0));
  A(bu, () => {
    panel(1); screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, n < 300 ? 0.5 : lerp(0.75, 1, bright));
    barrier(TV.bx, slitYs());
    if (n < 400) packets(t, S4, n, { max: 400 });
    else beam(TV.src + 50, TV.bx, TV.cy, lerp(0.25, 0.8, bright), { w: 4 });
    drawHits(HITS, n, t, S4);
    counter(n);
    A(bright, () => chip('BRIGHTER: SAME PATTERN, SOONER', P.x0 + P.w / 2, P.y1 - 50, { color: C.green, align: 'center' }));
  });
}

// ---------- 5: electrons too ----------
function gun(x, y, a = 1, { dashed = false, name = 'ELECTRON GUN' } = {}) {
  A(a, () => {
    if (dashed) { ctx.setLineDash([8, 8]); ctx.strokeStyle = C.steel; ctx.lineWidth = 2.5; rr(x - 76, y - 26, 112, 52, 22); ctx.stroke(); ctx.setLineDash([]); }
    else {
      const g = ctx.createLinearGradient(0, y - 26, 0, y + 26); g.addColorStop(0, '#2C3E45'); g.addColorStop(0.5, '#4A5E66'); g.addColorStop(1, '#1A262A');
      ctx.fillStyle = g; rr(x - 76, y - 26, 112, 52, 22); ctx.fill();
      ctx.fillStyle = '#0B1518'; ctx.fillRect(x + 30, y - 10, 14, 20);
    }
    if (name) label(name, x - 20, y + 62, { align: 'center' });
  });
}
function biprism(t, a) {
  A(a, () => {
    ctx.setLineDash([10, 8]); ctx.strokeStyle = C.steel; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(TV.bx, TV.by0); ctx.lineTo(TV.bx, TV.cy - 150); ctx.moveTo(TV.bx, TV.cy + 150); ctx.lineTo(TV.bx, TV.by1); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.metal; ctx.beginPath(); ctx.arc(TV.bx, TV.cy, 6, 0, 6.283); ctx.fill();
    font(700, 34); text('+', TV.bx + 16, TV.cy - 24, { color: C.red });
    ctx.strokeStyle = 'rgba(61,255,138,0.28)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 8]);
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(TV.src + 50, TV.cy); ctx.quadraticCurveTo(TV.bx - 10, TV.cy + sg * 120, TV.sx, TV.cy - sg * 150); ctx.stroke(); }
    ctx.setLineDash([]);
  });
}
const IN = (u, N) => { const y = u / MM, q = Math.PI / (LAB.lambda * LAB.L), al = q * LAB.d * y, be = q * LAB.b * y; const sa = Math.sin(al); const g = Math.abs(sa) < 1e-6 ? 1 : Math.sin(N * al) / (N * sa); return sinc(be) ** 2 * g * g; };
const S5 = schedule([[s('e8', 0.6), 0], [e('e8'), 8], [e('e9', 0.2), 600, 1.8]]);
const S5b = schedule([[s('e11', 0.2), 0], [e('e11'), 6]]);
function part5(t) {
  // particle, wave, diffraction: a timeline
  const tl = span(t, CH[4].at + 3.2, s('e4', 0.05), 0.6, 0.6);
  A(tl, () => {
    const y = 640, xs = [400, 960, 1520], at = [s('e1'), s('e2'), s('e3')];
    ctx.strokeStyle = C.steelDim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(200, y); ctx.lineTo(1720, y); ctx.stroke();
    const items = [['1897', 'THE ELECTRON: A PARTICLE'], ['1924', 'DE BROGLIE: MATTER WAVES'], ['1927', 'ELECTRONS DIFFRACT']];
    items.forEach(([yr, cap], i) => {
      const p = eout(seg(t, at[i] + 0.2, at[i] + 0.9));
      if (p <= 0) return;
      A(p, () => {
        const x = xs[i];
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
        label(yr, x, y + 60, { align: 'center', size: 48, color: C.green, weight: 600 });
        label(cap, x, y + 130, { align: 'center', size: 32, color: C.textSoft });
        if (i === 0) { const g = ctx.createRadialGradient(x - 14, 440, 4, x, 460, 50); g.addColorStop(0, '#E6FFF0'); g.addColorStop(0.5, C.green); g.addColorStop(1, '#0B6B38'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, 460, 46, 0, 6.283); ctx.fill(); }
        if (i === 1) {
          ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.beginPath();
          for (let dx = -180; dx <= 180; dx += 3) { const v = Math.exp(-((dx / 80) ** 2)) * Math.sin(dx / 11 - t * 6); dx === -180 ? ctx.moveTo(x + dx, 460 - 60 * v) : ctx.lineTo(x + dx, 460 - 60 * v); }
          ctx.stroke(); blob(glowG, x, 460, 18);
        }
        if (i === 2) {
          for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) { ctx.fillStyle = C.metal; ctx.beginPath(); ctx.arc(x - 210 + a * 20, 420 + b * 20, 4, 0, 6.283); ctx.fill(); }
          for (let r = 26; r < 120; r += 26) { ctx.strokeStyle = `rgba(61,255,138,${0.9 - r / 160})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 60, 460, r, 0, 6.283); ctx.stroke(); }
          blob(glowG, x + 60, 460, 16);
        }
      });
    });
  });
  // a thought experiment
  A(span(t, s('e4', -0.2), s('e5', 0.05), 0.5, 0.5), () => {
    gun(TV.src, TV.cy, 1, { dashed: true });
    barrier(TV.bx, slitYs(), TV.a, { dashed: true });
    ctx.setLineDash([10, 10]); ctx.strokeStyle = C.steel; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(TV.sx, TV.y0); ctx.lineTo(TV.sx, TV.y1); ctx.stroke(); rr(P.x0, P.y0, P.w, P.h, 14); ctx.stroke(); ctx.setLineDash([]);
    font(600, 160, MONO); text('?', P.x0 + P.w / 2, P.cy, { align: 'center', color: C.textDim });
    ctx.save(); ctx.translate(W / 2, 540); ctx.rotate(-0.05); chip('ONLY A THOUGHT EXPERIMENT', 0, 0, { color: C.amber, align: 'center', size: 40 }); ctx.restore();
  });
  // Feynman's line, and the date
  A(span(t, s('e5', -0.2), s('e6', 0.1), 0.5, 0.5), () => {
    card(260, 330, 1400, 420);
    para('“This experiment has never been done in just this way.”', W / 2, 470, 1260, { size: 64, style: 'italic ', align: 'center' });
    label('RICHARD FEYNMAN · THE FEYNMAN LECTURES ON PHYSICS', W / 2, 660, { align: 'center', color: C.textSoft });
  });
  A(span(t, s('e6', -0.15), s('e7', 0.05), 0.5, 0.5), () => {
    const yr = (v) => lerp(300, 1620, (v - 1955) / 15), y = 560;
    ctx.strokeStyle = C.steelDim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(yr(1955), y); ctx.lineTo(yr(1970), y); ctx.stroke();
    for (const v of [1955, 1960, 1965, 1970]) { ctx.fillStyle = C.textDim; ctx.fillRect(yr(v) - 1, y - 12, 2, 24); label(String(v), yr(v), y + 150, { align: 'center', color: C.textDim }); }
    ctx.fillStyle = 'rgba(234,243,240,0.75)'; ctx.fillRect(yr(1961), y - 70, yr(1963) - yr(1961), 26);
    label('FEYNMAN’S LECTURES, 1961–63', yr(1962), y - 110, { align: 'center', color: C.text });
    const p = eout(seg(t, s('e6', 0.6), s('e6', 1.2)));
    A(p, () => { blob(glowG, yr(1961), y, 26); label('ELECTRONS THROUGH SLITS, 1961', yr(1961), y + 70, { align: 'center', color: C.green, weight: 600 }); });
  });
  // Jönsson: one to five slits
  const jn = span(t, s('e7', -0.2), s('e8', 0.05), 0.6, 0.6);
  const N = 1 + Math.min(4, Math.floor(5 * seg(t, s('e7', 0.4), e('e7', -0.3))));
  A(jn, () => {
    seenFromAbove(1);
    gun(TV.src, TV.cy); beam(TV.src + 50, TV.bx, TV.cy, 0.5, { w: 5 });
    barrier(TV.bx, slitYs(N, 64), 14, { name: `${N} SLIT${N > 1 ? 'S' : ''}` });
    screenLine(1);
    panel(1);
    chip('1961 · CLAUS JÖNSSON · TÜBINGEN', P.x0, 152, { color: C.green });
    const cw = (P.w - 60) / 5;
    for (let i = 1; i <= N; i++) {
      const x0 = P.x0 + 30 + (i - 1) * cw;
      exposure((u) => IN(u, i), 1, { x0: x0 + 6, x1: x0 + cw - 6, edge: false, gain: 1.1 });
      label(String(i), x0 + cw / 2, P.y1 - 36, { align: 'center', color: C.text, weight: 600, size: 34 });
    }
    label('SLITS', P.x0 + P.w / 2, P.y0 + 34, { align: 'center' });
  });
  // the biprism, Bologna and Hitachi
  const bp = span(t, s('e8', -0.2), s('e14', 0.3), 0.6, 0.6);
  const tono = seg(t, s('e10'), s('e10', 0.6));
  A(bp, () => {
    seenFromAbove(1);
    gun(TV.src, TV.cy); biprism(t, 1); screenLine(1, 'DETECTOR');
    A(span(t, s('e9', 0.2), s('e10', 0.4), 0.4, 0.4), () => { arrow(TV.bx + 150, TV.cy - 250, TV.bx + 14, TV.cy - 12, C.text, 3, 16); label('A FINE WIRE', TV.bx + 160, TV.cy - 270, { color: C.text, weight: 600 }); label('ELECTRON BIPRISM', TV.bx + 160, TV.cy - 226, { color: C.textSoft }); });
    A(1 - tono, () => {
      chip('1974 · BOLOGNA', P.x0, 152, { color: C.green });
      panel(1, { name: 'MERLI, MISSIROLI AND POZZI' });
      packets(t, S5, S5.N(t), { max: 60 });
      drawHits(HITS, S5.N(t), t, S5);
    });
    A(tono, () => {
      chip('1989 · HITACHI · TONOMURA ET AL.', P.x0, 152, { color: C.green });
      packets(t, S5b, S5b.N(t), { dur: 0.6 });
      panel(1 - seg(t, mid('e12', 0.42), mid('e12', 0.6)), { name: 'THE DETECTOR, FACE-ON' });
      A(span(t, s('e11', 0.3), s('e12', 0.4), 0.4, 0.4), () => {
        label('FEWER THAN 1,000 A SECOND', 120, 250, { color: C.green, weight: 600 });
        label('NEVER TWO IN FLIGHT AT ONCE', 120, 300, { color: C.textSoft });
      });
      // four frames of the build-up: 8, 270, 2,000 and 60,000 electrons
      const counts = [8, 270, 2000, 60000], ats = [mid('e12', 0.42), mid('e12', 0.62), mid('e12', 0.86), s('e13', 0.4)];
      const fw = (P.w - 30) / 2, fh = (P.h - 30) / 2;
      counts.forEach((c, i) => {
        const p = eout(seg(t, ats[i], ats[i] + 0.6));
        if (p <= 0) return;
        const fx = P.x0 + (i % 2) * (fw + 30), fy = P.y0 + Math.floor(i / 2) * (fh + 30);
        A(p, () => {
          rr(fx, fy, fw, fh, 12); ctx.fillStyle = '#020706'; ctx.fill(); ctx.strokeStyle = 'rgba(61,255,138,0.3)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.save(); rr(fx, fy, fw, fh, 12); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(61,255,138,0.8)'; ctx.globalAlpha *= c > 5000 ? 0.45 : 0.95;
          const sz = c < 500 ? 4 : c < 5000 ? 2.4 : 1.4;
          for (let j = 0; j < c; j++) { const h = HITS[j]; ctx.fillRect(fx + ((h.x - P.x0) / P.w) * fw - sz / 2, fy + ((h.y - P.y0) / P.h) * fh - sz / 2, sz, sz); }
          ctx.restore();
          font(600, 36, MONO); text(fmt(c), fx + 20, fy + 34, { color: C.text });
        });
      });
      A(seg(t, s('e13', 0.6), s('e13', 1.2)), () => label('ABOUT 20 MINUTES', P.x1, 968, { align: 'right', color: C.green, weight: 600 }));
    });
  });
  A(span(t, s('e14', 0.1), CH[5].at + 1.0, 0.5, 0.5), () => {
    ctx.fillStyle = 'rgba(1,3,4,0.82)'; ctx.fillRect(0, 0, W, H);
    card(260, 340, 1400, 420);
    label('PHYSICS WORLD · READERS’ POLL · 2002', W / 2, 420, { align: 'center', color: C.green });
    heading('The most beautiful experiment', W / 2, 530, { size: 76, align: 'center' });
    para('the double-slit experiment with single electrons', W / 2, 640, 1200, { size: 44, style: 'italic ', align: 'center', color: C.textSoft });
  });
}

// ---------- 6: how big? ----------
const CHART = { x0: 1150, x1: 1770, y0: 300, y1: 840, yr0: 1985, yr1: 2030 };
const cx = (yr) => lerp(CHART.x0, CHART.x1, (yr - CHART.yr0) / (CHART.yr1 - CHART.yr0));
const cy = (atoms) => lerp(CHART.y1, CHART.y0, Math.log10(atoms) / 4);
const RECORDS = [
  { yr: 1991, atoms: 1, name: 'HELIUM ATOMS', at: () => s('m2', 0.3), dx: 22, dy: -34, align: 'left' },
  { yr: 1999, atoms: 60, name: 'C60 · 60 ATOMS', at: () => s('m3', 0.6), dx: 22, dy: -34, align: 'left' },
  { yr: 2013, atoms: 810, name: '810', at: () => mid('m5', 0.3), dx: 18, dy: 36, align: 'left' },
  { yr: 2019, atoms: 2000, name: '2,000', at: () => mid('m5', 0.75), dx: 18, dy: 36, align: 'left' },
  { yr: 2026, atoms: 7000, name: '7,000+', at: () => mid('m6', 0.6), dx: -22, dy: -34, align: 'right' },
];
function sodiumCluster(x, y, R, a, t) {
  A(a, () => {
    const r = mulberry32(2026);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7000; i++) {
      const u = r(), v = r(), rad = R * Math.cbrt(u), th = v * 6.283, ph = Math.acos(2 * r() - 1);
      const px = rad * Math.sin(ph) * Math.cos(th + t * 0.2), py = rad * Math.sin(ph) * Math.sin(th + t * 0.2), pz = rad * Math.cos(ph);
      ctx.fillStyle = `rgba(255,214,120,${0.08 + 0.18 * (pz / R + 1) / 2})`; ctx.fillRect(x + px - 1.5, y + py - 1.5, 3, 3);
    }
    ctx.restore();
  });
}
function part6(t) {
  const on = span(t, CH[5].at + 3.0, CH[6].at + 1.0, 0.6, 0.6);
  A(on, () => {
    // the chart
    const ca = seg(t, s('m1', 0.2), s('m1', 1.0));
    A(ca, () => {
      label('ATOMS IN EACH PARTICLE', CHART.x0 - 120, CHART.y0 - 70, { size: 32 });
      for (let p = 0; p <= 4; p++) {
        const y = cy(10 ** p); ctx.fillStyle = 'rgba(234,243,240,0.1)'; ctx.fillRect(CHART.x0, y - 1, CHART.x1 - CHART.x0, 2);
        label(fmt(10 ** p), CHART.x0 - 24, y, { align: 'right', size: 32 });
      }
      for (const yr of [1990, 2000, 2010, 2020, 2030]) label(String(yr), cx(yr), CHART.y1 + 50, { align: 'center', size: 32 });
    });
    let prev = null;
    for (const rec of RECORDS) {
      const p = eout(seg(t, rec.at(), rec.at() + 0.7));
      if (p <= 0) continue;
      const x = cx(rec.yr), y = cy(rec.atoms);
      A(p, () => {
        if (prev) { ctx.strokeStyle = 'rgba(61,255,138,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y); ctx.stroke(); }
        blob(glowG, x, y, 26); ctx.fillStyle = C.greenHi; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
        label(rec.name, x + rec.dx, y + rec.dy, { align: rec.align, color: C.text, size: 32, weight: 600 });
        label(String(rec.yr), x + rec.dx, y + rec.dy + 42, { align: rec.align, color: C.textDim, size: 32 });
      });
      prev = [x, y];
    }
    A(seg(t, s('m8', 0.2), s('m8', 0.8)), () => chip('EVERY TEST PASSED SO FAR', CHART.x1, CHART.y1 + 118, { color: C.green, align: 'right' }));
    // the left side
    A(span(t, s('m1'), s('m3', 0.2), 0.4, 0.5), () => heading('How big?', 520, 540, { size: 112, align: 'center' }));
    A(span(t, s('m2', 0.2), s('m3', 0.1), 0.4, 0.4), () => { blob(glowG, 520, 700, 50); label('A HELIUM ATOM', 520, 790, { align: 'center', color: C.text }); label('THROUGH SLITS IN GOLD FOIL', 520, 840, { align: 'center' }); });
    const bk = span(t, s('m3', -0.15), s('m5', 0.1), 0.6, 0.6);
    A(bk, () => {
      buckyball(520, 500, 190, t * 0.35, 1);
      label('A BUCKYBALL: 60 CARBON ATOMS', 520, 236, { align: 'center', color: C.text, weight: 600 });
      label('VIENNA, 1999 · THROUGH A GRATING', 520, 284, { align: 'center' });
    });
    A(span(t, s('m4', 0.1), s('m5', 0.1), 0.5, 0.5), () => {
      const L0 = 560, x0 = 240, y = 760, ratio = 0.7e-9 / 2.5e-12;
      ctx.fillStyle = C.green; ctx.fillRect(x0, y - 6, L0, 12); label('MOLECULE · 0.7 nm', x0, y - 36, { color: C.text });
      ctx.fillStyle = C.amber; ctx.fillRect(x0, y + 54, Math.max(2, L0 / ratio), 12);
      label(`ITS WAVE · 2.5 pm · ${Math.round(ratio)} TIMES SMALLER`, x0, y + 100, { color: C.amber });
    });
    A(span(t, s('m5', -0.15), s('m6', 0.1), 0.5, 0.5), () => {
      const r = mulberry32(2019);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2000; i++) { const a = r() * 6.283, rad = 200 * Math.sqrt(r()) * (0.75 + 0.25 * Math.sin(a * 3)); ctx.fillStyle = 'rgba(61,255,138,0.35)'; ctx.fillRect(520 + rad * Math.cos(a) - 1.5, 520 + rad * Math.sin(a) * 0.8 - 1.5, 3, 3); }
      ctx.restore();
      label('MOLECULES OF 810, THEN 2,000 ATOMS', 520, 800, { align: 'center', color: C.text });
    });
    A(span(t, s('m6', -0.15), s('m7', 0.05), 0.5, 0.5), () => {
      sodiumCluster(520, 500, 220, 1, t);
      label('SODIUM CLUSTERS · 7,000+ ATOMS', 520, 800, { align: 'center', color: C.amber, weight: 600 });
      label('ABOUT 8 nm ACROSS · VIENNA, 2026', 520, 850, { align: 'center' });
    });
    A(span(t, s('m7', -0.2), CH[6].at + 1.0, 0.5, 0.5), () => {
      font(600, 96); text('λ = h ÷ (m × v)', 520, 480, { align: 'center', color: C.text });
      label('h: PLANCK’S CONSTANT · m: MASS · v: SPEED', 520, 570, { align: 'center' });
      label('HEAVIER → SHORTER WAVE → FINER STRIPES', 520, 680, { align: 'center', color: C.green, weight: 600 });
    });
  });
}

// ---------- 7: which slit? ----------
const S7 = schedule([[s('k3', 0.2), 0], [e('k3'), 12], [e('k4', -0.1), 4000, 2.2], [e('k5'), 14000, 1]]);
function detectors(t, a, sch, n) {
  A(a, () => {
    for (const [i, sy] of slitYs().entries()) {
      let fl = 0;
      if (sch) for (let j = Math.max(0, n - 3); j < Math.min(n, 400); j++) if (HITS_W[j].slit === i) fl = Math.max(fl, 1 - seg(t, sch.inv(j + 1) - 0.12, sch.inv(j + 1) + 0.4));
      ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(TV.bx + 26, sy, 15, 0, 6.283); ctx.stroke();
      ctx.fillStyle = `rgba(255,79,79,${0.25 + 0.75 * fl})`; ctx.beginPath(); ctx.arc(TV.bx + 26, sy, 9, 0, 6.283); ctx.fill();
      if (fl > 0) blob(glowR, TV.bx + 26, sy, 30, fl);
    }
    label('DETECTORS', TV.bx + 60, TV.cy, { color: C.red, weight: 600 });
  });
}
function part7(t) {
  const on = span(t, CH[6].at + 3.0, s('k8', 0.1), 0.6, 0.6);
  const det = eout(seg(t, s('k2', 0.3), s('k2', 1.0)));
  const n = S7.N(t), oldA = 1 - seg(t, s('k3', 0.3), e('k4', -0.4));
  A(on, () => {
    panel(1); screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, 0.7, { name: 'SOURCE' });
    barrier(TV.bx, slitYs());
    detectors(t, det, S7, n);
    packets(t, S7, n, { max: 40 });
    drawHits(HITS, 20000, t, null, { a: oldA, flash: false });
    drawHits(HITS_W, n, t, S7, { spr: glowG });
    if (n) counter(n);
    // the comparison
    const cv = seg(t, s('k5', 0.2), s('k5', 1.0)) * (1 - seg(t, s('k7', 0.4), s('k7', 1.0)));
    curve(I2, cv * 0.9, { color: C.greenHi, dash: [10, 10], w: 3 });
    curve(I1, cv, { color: C.red, ink: eio(seg(t, s('k5', 0.2), s('k5', 1.6))) });
    A(cv, () => { label('TWO SINGLE-SLIT PATTERNS, ADDED', P.x1 - 30, P.y0 + 44, { align: 'right', color: C.red, weight: 600 }); label('WITHOUT DETECTORS', P.x1 - 30, P.y0 + 92, { align: 'right', color: C.green }); });
    A(span(t, s('k4', 0.1), s('k5', 0.3), 0.3, 0.4), () => chip('NO STRIPES', P.x0 + P.w / 2, P.y0 + 60, { color: C.red, align: 'center', size: 36 }));
    // an interaction at the slit: a probe bounces off the particle
    const pr = span(t, s('k6', 0.4), s('k7', 0.6), 0.4, 0.5);
    A(pr, () => {
      const q = (t - s('k6', 0.4)) % 1.6 / 1.6, sy = slitYs()[0];
      const pa = q < 0.5 ? [lerp(TV.bx + 190, TV.bx + 6, q / 0.5), lerp(sy + 190, sy, q / 0.5)] : [lerp(TV.bx + 6, TV.bx + 26, (q - 0.5) / 0.5), sy];
      blob(glowW, pa[0], pa[1], 13);
      label('SOMETHING MUST INTERACT', 120, 840, { color: C.text, weight: 600 });
    });
    // the record
    A(span(t, s('k7', 0.2), s('k8', 0.3), 0.4, 0.4), () => {
      card(TV.bx + 50, 640, 400, 190, { edge: 'rgba(255,79,79,0.5)' });
      label('THE RECORD', TV.bx + 80, 690, { color: C.red, weight: 600 });
      const m = Math.min(n, 9999), last = [];
      for (let j = Math.max(0, m - 9); j < m; j++) last.push(HITS_W[j].slit + 1);
      font(600, 40, MONO); text(last.join(' '), TV.bx + 80, 770, { color: C.text });
    });
  });
  // not a mind
  const mind = span(t, s('k8', -0.15), s('k10', 0.1), 0.6, 0.6);
  A(mind, () => {
    heading('A record, not a mind', W / 2, 450, { size: 96, align: 'center' });
    A(seg(t, s('k8', 1.2), s('k8', 1.9)), () => label('THE STANDARD ACCOUNT NEEDS NO OBSERVER', W / 2, 560, { align: 'center', color: C.textSoft, size: 36 }));
    A(seg(t, s('k9', 0.2), s('k9', 0.9)), () => label('WHAT COUNTS: COULD THE PATH BE KNOWN, IN PRINCIPLE?', W / 2, 660, { align: 'center', color: C.green, size: 36, weight: 600 }));
  });
  // hot molecules
  const hot = span(t, s('k10', -0.15), s('k13', 0.1), 0.6, 0.6);
  const heat = eio(seg(t, s('k10', 1.0), e('k11', -0.4)));
  A(hot, () => {
    chip('2004 · VIENNA · CARBON-70', 120, 250, { color: C.amber });
    const g = ctx.createRadialGradient(520, 560, 20, 520, 560, 300);
    g.addColorStop(0, `rgba(255,${Math.round(140 + 60 * heat)},70,${0.15 + 0.45 * heat})`); g.addColorStop(1, 'rgba(255,90,40,0)');
    ctx.fillStyle = g; ctx.fillRect(220, 260, 600, 600);
    ctx.save(); ctx.translate(520, 560); ctx.scale(1.18, 1); ctx.translate(-520, -560);
    buckyball(520, 560, 170, t * 0.4, 1, { color: heat > 0.5 ? '#FFC07A' : C.green });
    ctx.restore();
    // heat radiation leaving the molecule
    const r = mulberry32(70);
    for (let i = 0; i < 14; i++) {
      const ang = r() * 6.283, ph = (t * 0.7 + r()) % 1;
      if (r() > heat) continue;
      const d0 = 220 + ph * 200, x = 520 + Math.cos(ang) * d0, y = 560 + Math.sin(ang) * d0;
      ctx.strokeStyle = `rgba(255,150,90,${0.8 * (1 - ph)})`; ctx.lineWidth = 3; ctx.beginPath();
      for (let q = -18; q <= 18; q += 2) { const px = x + Math.cos(ang) * q - Math.sin(ang) * 5 * Math.sin(q / 3), py = y + Math.sin(ang) * q + Math.cos(ang) * 5 * Math.sin(q / 3); q === -18 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.stroke();
    }
    label('HEATED BY A LASER', 520, 890, { align: 'center', color: C.amber });
    // three exposures: the hotter, the fainter
    panel(1, { link: false, name: 'SCHEMATIC' });
    const cw = (P.w - 60) / 3, Vs = [0.9, 0.5, 0.15], names = ['COOL', 'WARMER', 'HOT'], at = [s('k11', 0.2), mid('k11', 0.55), mid('k11', 0.8)];
    Vs.forEach((V, i) => {
      const x0 = P.x0 + 30 + i * cw;
      exposure((u) => IV(u, V), seg(t, at[i], at[i] + 0.6), { x0: x0 + 6, x1: x0 + cw - 6, edge: false, gain: 1.1 });
      A(seg(t, at[i], at[i] + 0.6), () => label(names[i], x0 + cw / 2, P.y1 - 36, { align: 'center', color: C.text, weight: 600 }));
    });
    A(seg(t, s('k12', 0.2), s('k12', 0.8)), () => chip('NOBODY LOOKED AT THAT LIGHT', 120, 330, { color: C.text }));
  });
  // partial information: the trade-off
  const pt = span(t, s('k13', -0.15), CH[7].at + 1.0, 0.6, 0.6);
  let D = lerp(0, 0.6, eio(seg(t, s('k13', 0.6), e('k13'))));
  D = lerp(D, 0.95, eio(seg(t, s('k14', 0.2), mid('k14', 0.6))));
  D = lerp(D, 0.8, eio(seg(t, mid('k14', 0.6), e('k14'))));
  const V = Math.sqrt(1 - D * D);
  A(pt, () => {
    chip('1987 · PARTIAL PATH INFORMATION', 120, 250, { color: C.green });
    const ox = 220, oy = 870, sz = 440;
    ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy - sz - 20); ctx.lineTo(ox, oy); ctx.lineTo(ox + sz + 20, oy); ctx.stroke();
    ctx.strokeStyle = 'rgba(61,255,138,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ox, oy, sz, -Math.PI / 2, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(61,255,138,0.08)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, sz, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
    label('D · PATH INFORMATION', ox, oy + 50, { size: 32 });
    ctx.save(); ctx.translate(ox - 40, oy); ctx.rotate(-Math.PI / 2); label('V · STRIPE CLARITY', 0, 0, { size: 32 }); ctx.restore();
    const px = ox + D * sz, py = oy - V * sz;
    ctx.strokeStyle = 'rgba(234,243,240,0.35)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, py); ctx.lineTo(ox, py); ctx.stroke(); ctx.setLineDash([]);
    blob(glowG, px, py, 30); ctx.fillStyle = C.greenHi; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.283); ctx.fill();
    font(600, 40, MONO); text(`${D.toFixed(2)}`, px, oy - 30, { align: 'center', color: C.text });
    text(`${V.toFixed(2)}`, ox + 70, py - 34, { align: 'center', color: C.text });
    A(seg(t, s('k14', 0.6), s('k14', 1.3)), () => { font(600, 56); text('D² + V² ≤ 1', 120, 336, { color: C.green }); });
    panel(1, { link: false });
    exposure((u) => IV(u, V), 1, { gain: 0.95, gamma: 1 });
    curve((u) => IV(u, V), 0.9, { color: C.greenHi, w: 3 });
  });
}

// ---------- 8: the heart of it ----------
const S8 = schedule([[s('h6', 0.1), 0], [e('h6', 0.2), 26000, 1.8]]);
const MILESTONES = [[1690, 'HUYGENS'], [1704, 'NEWTON'], [1803, 'YOUNG'], [1819, 'ARAGO'], [1905, 'EINSTEIN'], [1909, 'TAYLOR'], [1961, 'JÖNSSON'], [1974, 'BOLOGNA'], [1986, 'SINGLE PHOTONS'], [1989, 'HITACHI'], [1999, 'BUCKYBALLS'], [2026, '7,000 ATOMS']];
function part8(t) {
  // Feynman
  A(span(t, CH[7].at + 3.2, s('h4', 0.1), 0.6, 0.6), () => {
    label('RICHARD FEYNMAN', W / 2, 260, { align: 'center', color: C.green, size: 40, weight: 600, spacing: '4px' });
    A(seg(t, s('h2'), s('h2', 0.7)), () => para('“…impossible, absolutely impossible, to explain in any classical way…”', W / 2, 400, 1500, { size: 60, style: 'italic ', align: 'center' }));
    A(seg(t, s('h3'), s('h3', 0.7)), () => para('“…has in it the heart of quantum mechanics. In reality, it contains the only mystery.”', W / 2, 620, 1500, { size: 60, style: 'italic ', align: 'center', color: C.greenHi }));
    label('THE FEYNMAN LECTURES ON PHYSICS, VOL. III', W / 2, 860, { align: 'center', color: C.textDim });
  });
  // the wave and the dots
  const ap = span(t, s('h4', -0.15), s('h10', 0.1), 0.6, 0.6);
  const n = S8.N(t), interp = seg(t, s('h7', 0.1), s('h7', 0.8));
  A(ap, () => {
    panel(1); screenLine(1);
    A(1 - interp, () => {
      seenFromAbove(1);
      laser(TV.src, TV.cy, 1); beam(TV.src + 50, TV.bx, TV.cy, 0.7);
      barrier(TV.bx, slitYs());
      waves(t, 0.9 * span(t, s('h4', 0.2), s('h7', 0.6), 0.8, 0.6), { lambda: 11 });
      A(seg(t, s('h4', 0.6), s('h4', 1.3)), () => label('ONE WAVE, THROUGH BOTH SLITS', 640, TV.by1 + 30, { align: 'center', color: C.green, weight: 600 }));
    });
    exposure(I2, 0.35 * seg(t, s('h5'), s('h5', 0.8)) * (1 - seg(t, s('h6'), e('h6'))));
    curve(I2, seg(t, s('h5', 0.2), s('h5', 0.8)), { ink: eio(seg(t, s('h5', 0.2), s('h5', 1.8))) });
    A(seg(t, s('h5', 1.2), s('h5', 1.8)), () => label('THE ODDS: THE WAVE, SQUARED', P.x1 - 30, P.y0 + 44, { align: 'right', color: C.green, weight: 600 }));
    drawHits(HITS, n, t, S8);
    if (n) counter(n);
    // interpretations
    A(interp * (1 - seg(t, s('h8', 0.1), s('h8', 0.6))), () => heading('And in between?', 500, 540, { size: 84, align: 'center' }));
    A(interp, () => {
      const boxes = [['NO DETECTOR, NO “WHICH SLIT”', 'one view: the question has no meaning', s('h8', 0.2)], ['MANY WORLDS', 'another view', mid('h8', 0.55)], ['A GUIDING WAVE', 'a particle steered by its wave', mid('h8', 0.8)]];
      boxes.forEach(([h, sub, at], i) => {
        const p = eout(seg(t, at, at + 0.6)); if (p <= 0) return;
        const y = 300 + i * 210;
        A(p, () => {
          card(120, y - 70, 760, 160);
          font(600, 40); text(h, 160, y - 12, { color: C.text });
          font(400, 34, SANS, 'italic '); text(sub, 160, y + 42, { color: C.textSoft });
          A(seg(t, s('h9'), s('h9', 0.6)), () => arrow(890, y + 10, P.x0 - 16, lerp(y + 10, P.cy, 0.6), C.green, 3, 16));
        });
      });
      A(seg(t, s('h9', 0.3), s('h9', 0.9)), () => chip('THE SAME STRIPES', P.x0 + P.w / 2, P.y1 - 50, { color: C.green, align: 'center', size: 36 }));
    });
  });
  // the story so far
  A(span(t, s('h10', -0.15), s('h12', 0.1), 0.6, 0.6), () => {
    const y = 560, x0 = 170, x1 = 1750;
    ctx.strokeStyle = C.steelDim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 30, y); ctx.lineTo(x1 + 30, y); ctx.stroke();
    MILESTONES.forEach(([yr, nm], i) => {
      const x = lerp(x0, x1, i / (MILESTONES.length - 1)), up = i % 2 === 0;
      const p = eout(seg(t, s('h10', 0.2) + i * 0.22, s('h10', 0.7) + i * 0.22));
      A(p, () => {
        const col = i < 4 ? C.warm : i < 6 ? C.green : i < 10 ? C.green : C.amber;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(234,243,240,0.3)'; ctx.fillRect(x - 1, up ? y - 70 : y + 12, 2, 58);
        label(String(yr), x, up ? y - 100 : y + 100, { align: 'center', color: col, weight: 600, size: 34 });
        label(nm, x, up ? y - 146 : y + 146, { align: 'center', color: C.textSoft, size: 32 });
      });
    });
    A(seg(t, s('h11', 0.2), s('h11', 0.8)), () => chip('A RECORD OF THE PATH WIPES THE STRIPES AWAY', W / 2, 860, { color: C.red, align: 'center' }));
  });
  // the last picture
  const fin = span(t, s('h12', -0.15), DURATION + 1, 0.8, 0.1);
  A(fin * (1 - seg(t, e('h12', 0.6), e('h12', 1.6))), () => {
    panel(1); screenLine(1); seenFromAbove(1);
    laser(TV.src, TV.cy, 1); beam(TV.src + 50, TV.bx, TV.cy, 0.5);
    barrier(TV.bx, slitYs());
    drawHits(HITS, 60000, t, null, { flash: false });
  });
  A(seg(t, e('h12', 1.0), e('h12', 2.0)), () => credits(t));
}
function credits(t) {
  fringeStrip(W / 2, 250, 900, 22, 0.8);
  heading('The double-slit experiment', W / 2, 180, { size: 72, align: 'center' });
  const blocks = [
    ['ANIMATION AND SCRIPT', ['Reckon · original animation']],
    ['MUSIC', ['“Ambiment” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Dreams Become Real” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Soaring” Kevin MacLeod (incompetech.com) · CC BY 4.0']],
    ['SOURCES', ['Wikipedia: “Double-slit experiment”, “Young’s interference experiment”, “Thomas Young”,', '“G. I. Taylor”, “Arago spot”, “Photon”, “Matter wave”, “Complementarity”, “Claus Jönsson”;', 'Physics World, “The double-slit experiment” (2002); Nature (1999, 2004, 2026); Nature Physics (2019)']],
    ['SIMULATION', ['Every dot is drawn at random from the computed pattern, with a fixed seed']],
  ];
  let y = 330;
  for (const [h, lines] of blocks) {
    label(h, W / 2, y, { align: 'center', color: C.green, size: 32, weight: 600, spacing: '3px' });
    lines.forEach((l, j) => { font(400, 32); text(l, W / 2, y + 46 + j * 42, { align: 'center', color: C.text }); });
    y += 46 + lines.length * 42 + 34;
  }
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [SANS, MONO],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    header(t);
    const parts = [part0, part1, partYoung, part3, part4, part5, part6, part7, part8];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    chapterCards(t);
  },
});
