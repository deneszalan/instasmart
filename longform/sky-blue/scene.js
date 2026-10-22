// "Why the sky is blue", a long-form explainer (16:9, about 10 minutes).
// Look: an atmospheric watercolour. Every sky is a graded wash painted once into an offscreen canvas (blooms,
// back-runs, lifted highlights, granulation, paper grain); the plates move from noon blue through a dark lab, white
// clouds and golden light to sunset orange, dusk and a butterscotch Mars. The sky and the Sun sit on the left; a
// deckled paper card on the right holds the spectrum, the 1/λ⁴ curve and the numbers. Cormorant Garamond for titles,
// Source Sans 3 (light and regular) for labels. Everything is keyed to the narration lines in window.TL, so the
// dialogue version (same keys, different timing) shares this file.
// Numbers are computed here: (700/λ)⁴ for the scattering, Kasten & Young's air mass, the Rayleigh sky model's degree
// of polarisation, and the light left after the noon and sunset paths. Facts and sources: see script.mjs.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const SERIF = 'Cormorant Garamond', SANS = 'Source Sans 3';

const C = {
  ink: '#1E2A44', inkSoft: 'rgba(30,42,68,0.74)', inkFaint: 'rgba(30,42,68,0.36)',
  paper: '#FBF7EE', cream: '#FFFDF6', creamSoft: 'rgba(255,253,246,0.86)',
  red: '#B8392B', orange: '#C46A1E', yellow: '#A88612', green: '#2F7D45', blue: '#2458A8', violet: '#5E3AA6',
  skyBlue: '#8DBBE3', paleBlue: '#B9D6EE',
};
// the five colours used throughout, with their wavelengths
const COLS = [
  { nm: 700, name: 'red', ink: C.red },
  { nm: 580, name: 'yellow', ink: C.yellow },
  { nm: 530, name: 'green', ink: C.green },
  { nm: 450, name: 'blue', ink: C.blue },
  { nm: 400, name: 'violet', ink: C.violet },
];
const rel = (nm) => Math.pow(700 / nm, 4); // scattering relative to red, from 1/λ⁴
for (const c of COLS) c.rel = rel(c.nm);
const BLUE_X = rel(450), VIOLET_X = rel(400); // 5.86, 9.38
const airMass = (z) => 1 / (Math.cos((z * Math.PI) / 180) + 0.50572 * Math.pow(96.07995 - z, -1.6364)); // Kasten & Young
const HORIZON_X = airMass(90); // 37.9
const COLUMN_KM = 8.435;
// Rayleigh optical depth of the whole air column, scaled from nitrogen's cross-section at 532 nm (5.1e-31 m²,
// 2e25 molecules per m³, 8,435 m): only for drawing the light that gets through.
const TAU532 = 5.1e-31 * 2e25 * COLUMN_KM * 1000;
const tau = (nm) => TAU532 * Math.pow(532 / nm, 4);
const polar = (g) => (0.8 * Math.sin(g) ** 2) / (1 + Math.cos(g) ** 2); // Rayleigh sky model, δmax = 80%

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const font = (w, size, fam = SANS) => k.font(w, size, fam);
function txt(str, x, y, { size = 34, weight = 400, fam = SANS, color = C.ink, align = 'left', base = 'middle', spacing = '0px', italic = false } = {}) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px "${fam}"`;
  k.text(str, x, y, { color, align, base, spacing });
}
/** Text over the sky: cream, with a soft shadow. */
function sky(str, x, y, o = {}) {
  ctx.save(); ctx.shadowColor = o.shadow ?? 'rgba(12,22,48,0.6)'; ctx.shadowBlur = 12;
  const weight = o.fam === SERIF ? o.weight : Math.max(400, o.weight ?? 400);
  txt(str, x, y, { color: C.cream, ...o, weight }); ctx.restore();
}
/** A base with a raised exponent, e.g. sup('1 / λ', '4', …). Returns the total width. */
function sup(base, ex, x, y, { size = 40, weight = 400, fam = SANS, color = C.ink, align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px "${fam}"`; const bw = ctx.measureText(base).width;
  ctx.font = `${weight} ${size * 0.6}px "${fam}"`; const ew = ctx.measureText(ex).width;
  const w = bw + ew + size * 0.04, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  txt(base, x0, y, { size, weight, fam, color, base: 'alphabetic' });
  txt(ex, x0 + bw + size * 0.04, y - size * 0.42, { size: size * 0.6, weight, fam, color, base: 'alphabetic' });
  return w;
}

// ---------- colour ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixRGB = (a, b, x) => a.map((v, i) => Math.round(lerp(v, b[i], x)));
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixHex = (a, b, x) => rgba(mixRGB(hex(a), hex(b), x));
/** An approximate display colour for a wavelength (after D. Bruton), softened toward the paper. */
function nmRGB(nm, soft = 0.12) {
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else { r = 1; }
  const f = nm < 420 ? 0.35 + (0.65 * (nm - 380)) / 40 : nm > 700 ? 0.35 + (0.65 * (780 - nm)) / 80 : 1;
  return mixRGB([r, g, b].map((v) => Math.round(255 * Math.pow(clamp(v * f), 0.8))), [251, 247, 238], soft);
}

// ---------- watercolour painting (offscreen, once) ----------
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
/** A closed wobbly outline around (cx, cy). */
function wobble(g, cx, cy, rx, ry, rnd, amt = 0.12, n = 64) {
  const ph = [rnd() * 6.3, rnd() * 6.3, rnd() * 6.3], fr = [2 + Math.floor(rnd() * 3), 5 + Math.floor(rnd() * 4), 11 + Math.floor(rnd() * 6)];
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = 1 + amt * (0.55 * Math.sin(fr[0] * a + ph[0]) + 0.3 * Math.sin(fr[1] * a + ph[1]) + 0.15 * Math.sin(fr[2] * a + ph[2]));
    const x = cx + Math.cos(a) * rx * m, y = cy + Math.sin(a) * ry * m;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.closePath();
}
/** A soft pigment bloom, optionally with a darker back-run edge. */
function bloom(g, x, y, r, col, a, rnd, edge = 0.7) {
  const c = hex(col), sy = 0.55 + rnd() * 0.4;
  g.save(); g.translate(x, y); g.scale(1, sy);
  const rg = g.createRadialGradient(0, 0, r * 0.05, 0, 0, r);
  rg.addColorStop(0, rgba(c, a)); rg.addColorStop(0.55, rgba(c, a * 0.6)); rg.addColorStop(1, rgba(c, 0));
  g.fillStyle = rg; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.restore();
  if (edge > 0) { g.strokeStyle = rgba(c, a * edge * 0.7); g.lineWidth = 1 + rnd() * 1.2; wobble(g, x, y, r * 0.62, r * 0.62 * sy, rnd, 0.22); g.stroke(); }
}
/** A rectangle with ragged, wandering edges. */
function raggedRect(g, x, y, w, h, rnd, amp = 18) {
  const ph = [rnd() * 9, rnd() * 9, rnd() * 9, rnd() * 9], f = (u, i) => amp * (0.6 * Math.sin(u * 7 + ph[i]) + 0.4 * Math.sin(u * 23 + ph[i] * 2));
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x + u * w, y + f(u, 0)); }
  for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x + w + f(u, 1), y + u * h); }
  for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x + w - u * w, y + h + f(u, 2)); }
  for (let i = 0; i <= 40; i++) { const u = i / 40; g.lineTo(x + f(u, 3), y + h - u * h); }
  g.closePath();
}
/** A wobbly-topped band from y = top(x) down to the bottom, filled with fill, with pigment pooling at its edge. */
function ridge(g, top, fill, a, rnd, pool = 0.35) {
  g.globalAlpha = a; g.fillStyle = fill;
  g.beginPath(); g.moveTo(-20, H + 20);
  for (let x = -20; x <= W + 20; x += 8) g.lineTo(x, top(x));
  g.lineTo(W + 20, H + 20); g.closePath(); g.fill();
  g.globalAlpha = a * pool; g.strokeStyle = fill; g.lineWidth = 3;
  g.beginPath(); for (let x = -20; x <= W + 20; x += 8) { const y = top(x) + 1; if (x === -20) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
  g.globalAlpha = 1;
}
function hillTop(base, amp, f1, f2, p) { return (x) => base + amp * Math.sin(x / f1 + p) + amp * 0.5 * Math.sin(x / f2 + p * 2.3) + amp * 0.18 * Math.sin(x / 23 + p); }
/** A cumulus cloud: lobes of white lifted out of the wash, with grey shading underneath. */
function paintCloud(g, cx, cy, w, rnd, { lit = '#FFFFFF', shade = '#8E9BB3', a = 1 } = {}) {
  g.save(); g.globalAlpha = a;
  const lobes = [];
  for (let i = 0; i < 9; i++) { const u = i / 8 - 0.5; lobes.push([cx + u * w * 0.9 + (rnd() - 0.5) * 30, cy - Math.cos(u * Math.PI) * w * 0.16 + (rnd() - 0.5) * 16, w * (0.13 + rnd() * 0.08)]); }
  g.globalCompositeOperation = 'source-over';
  for (const [x, y, r] of lobes) { g.fillStyle = mixHex(lit, '#FFFFFF', 0.4); g.globalAlpha = a * 0.92; wobble(g, x, y, r, r * 0.9, rnd, 0.1); g.fill(); }
  g.globalCompositeOperation = 'multiply';
  const sg = g.createLinearGradient(0, cy - w * 0.05, 0, cy + w * 0.2);
  sg.addColorStop(0, rgba(hex(shade), 0)); sg.addColorStop(1, rgba(hex(shade), 0.75));
  g.fillStyle = sg; g.globalAlpha = a;
  for (const [x, y, r] of lobes) { wobble(g, x, y + r * 0.15, r, r * 0.85, rnd, 0.1); g.fill(); }
  g.globalAlpha = a * 0.25; g.strokeStyle = shade; g.lineWidth = 2;
  for (const [x, y, r] of lobes) { wobble(g, x, y, r * 0.98, r * 0.88, rnd, 0.1); g.stroke(); }
  g.restore();
}
const PLATES = {
  noon: { seed: 3, top: '#2B66B0', mid: '#7AAEDF', hor: '#DDEBF2', horizon: 880, hills: ['#7E9DBB', '#4E6E92', '#2E4766'] },
  lab: { seed: 5, top: '#141B2E', mid: '#1C2640', hor: '#27324F', horizon: 1080, hills: null },
  cloud: { seed: 7, top: '#3271B8', mid: '#86B6E0', hor: '#E4EEF0', horizon: 880, hills: ['#86A3BD', '#55759A', '#33506F'], clouds: true },
  golden: { seed: 9, top: '#3A62A2', mid: '#9DB3CB', hor: '#F0D39C', horizon: 880, hills: ['#A39A9A', '#6C6A7E', '#3B3F59'] },
  sunset: { seed: 11, top: '#2C326C', mid: '#B4587A', hor: '#F29A4C', horizon: 880, hills: ['#8A5873', '#553D61', '#2A2442'], clouds: 'sunset' },
  dusk: { seed: 13, top: '#121A3D', mid: '#3D3D74', hor: '#C9735F', horizon: 880, hills: ['#4E3F63', '#302A4C', '#1A1730'] },
  mars: { seed: 17, top: '#6E5038', mid: '#B98F62', hor: '#E2BF8F', horizon: 800, mars: true },
};
const plateCache = {};
function plate(name) {
  if (plateCache[name]) return plateCache[name];
  const p = PLATES[name], c = mk(W, H), g = c.getContext('2d'), rnd = mulberry32(p.seed);
  g.fillStyle = '#F3EEE2'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'multiply';
  // the graded wash, laid in three overlapping passes with ragged edges
  [[0.9, 0, 0], [0.16, 40, 30], [0.12, -50, 24]].forEach(([a, dy, amp]) => {
    const lg = g.createLinearGradient(0, dy, 0, p.horizon + dy);
    lg.addColorStop(0, p.top); lg.addColorStop(0.5, p.mid); lg.addColorStop(1, p.hor);
    g.globalAlpha = a; g.fillStyle = lg; raggedRect(g, -60, -60, W + 120, p.horizon + 60 + dy + (amp ? 0 : 200), rnd, amp); g.fill();
  });
  g.globalAlpha = 1;
  // wet-in-wet blooms, a few with back-run edges
  for (let i = 0; i < 70; i++) {
    const y = rnd() * p.horizon * 0.95, col = y < p.horizon * 0.45 ? (rnd() < 0.7 ? p.top : p.mid) : (rnd() < 0.6 ? p.mid : p.hor);
    bloom(g, rnd() * W, y, 90 + rnd() * 340, col, 0.03 + rnd() * 0.06, rnd, rnd() < 0.15 ? 0.8 : 0);
  }
  // soft horizontal brush streaks
  for (let i = 0; i < 16; i++) {
    const y = rnd() * p.horizon * 0.8, x = rnd() * W, w = 300 + rnd() * 700, h = 14 + rnd() * 30, c = hex(rnd() < 0.5 ? p.top : p.mid);
    const lg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); lg.addColorStop(0, rgba(c, 0)); lg.addColorStop(0.5, rgba(c, 0.05 + rnd() * 0.05)); lg.addColorStop(1, rgba(c, 0));
    g.fillStyle = lg; wobble(g, x, y, w / 2, h, rnd, 0.25); g.fill();
  }
  // lifted highlights: paper showing through
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = 120 + rnd() * p.horizon * 0.8, r = 40 + rnd() * 160;
    const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(255,252,244,${0.05 + rnd() * 0.08})`); rg.addColorStop(1, 'rgba(255,252,244,0)');
    g.fillStyle = rg; wobble(g, x, y, r * 1.6, r * 0.5, rnd, 0.2); g.fill();
  }
  if (p.clouds) {
    const lit = p.clouds === 'sunset' ? '#FFD2A6' : '#FFFFFF', shade = p.clouds === 'sunset' ? '#7A4A6E' : '#8B99B2';
    paintCloud(g, 560, 470, 520, rnd, { lit, shade });
    paintCloud(g, 180, 640, 300, rnd, { lit, shade, a: 0.9 });
    paintCloud(g, 860, 290, 280, rnd, { lit, shade, a: 0.85 });
    if (p.clouds === 'sunset') paintCloud(g, 1500, 360, 420, rnd, { lit, shade, a: 0.7 });
  }
  g.globalCompositeOperation = 'multiply';
  if (p.hills) {
    const [far, midc, near] = p.hills;
    ridge(g, hillTop(p.horizon - 70, 26, 230, 97, 0.8), far, 0.55, rnd);
    ridge(g, hillTop(p.horizon - 10, 30, 180, 71, 2.1), midc, 0.75, rnd);
    ridge(g, hillTop(p.horizon + 70, 24, 260, 53, 4.0), near, 0.9, rnd);
  }
  if (p.mars) {
    ridge(g, hillTop(p.horizon - 40, 34, 300, 120, 1.3), '#B07A52', 0.6, rnd);
    ridge(g, hillTop(p.horizon + 30, 16, 210, 60, 2.6), '#9A5E3A', 0.85, rnd);
    ridge(g, hillTop(p.horizon + 140, 12, 150, 47, 0.4), '#6E3D24', 0.9, rnd);
    for (let i = 0; i < 40; i++) { const x = rnd() * W, y = p.horizon + 160 + rnd() * 120, r = 4 + rnd() * 14; g.fillStyle = 'rgba(70,35,20,0.45)'; wobble(g, x, y, r * 1.5, r, rnd, 0.2); g.fill(); }
  }
  if (name === 'lab') {
    // a dark room: a bench along the bottom
    g.fillStyle = 'rgba(10,12,22,0.6)'; g.fillRect(0, 800, W, 280);
    g.strokeStyle = 'rgba(160,170,200,0.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 800); g.lineTo(W, 800); g.stroke();
  }
  // granulation and paper
  const id = g.getImageData(0, 0, W, H), d = id.data, nrnd = mulberry32(p.seed + 100);
  const cell = 6, cw = Math.ceil(W / cell) + 1, coarse = new Float32Array(cw * (Math.ceil(H / cell) + 1)).map(() => nrnd());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, gx = x / cell, gy = y / cell, x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0;
    const n = lerp(lerp(coarse[y0 * cw + x0], coarse[y0 * cw + x0 + 1], fx), lerp(coarse[(y0 + 1) * cw + x0], coarse[(y0 + 1) * cw + x0 + 1], fx), fy);
    const m = 1 - 0.05 * n - 0.035 * nrnd();
    d[i] *= m; d[i + 1] *= m; d[i + 2] *= m;
  }
  g.putImageData(id, 0, 0);
  // vignette
  g.globalCompositeOperation = 'multiply';
  const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200);
  vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, name === 'lab' ? 'rgba(120,120,140,1)' : 'rgba(205,200,195,1)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  plateCache[name] = c;
  return c;
}
// fine paper grain laid over every frame
let GRAIN = null;
function grain() {
  GRAIN = mk(W, H); const g = GRAIN.getContext('2d'), id = g.createImageData(W, H), d = id.data, rnd = mulberry32(99);
  for (let i = 0; i < d.length; i += 4) { const v = 255 - Math.floor(rnd() * rnd() * 46); d[i] = v; d[i + 1] = v; d[i + 2] = v - 2; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  g.globalAlpha = 0.05; g.strokeStyle = '#6A5A40'; g.lineWidth = 0.8;
  for (let i = 0; i < 900; i++) { const x = rnd() * W, y = rnd() * H, a = rnd() * 6.3, l = 6 + rnd() * 26; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}
// the paper card on the right, and the title band
const CARD = { x: 1036, y: 150, w: 790, h: 790 };
const CX = CARD.x + CARD.w / 2;
let cardCanvas = null, bandCanvas = null;
function paintPaper(w, h, seed, { fill = C.paper, shadow = true } = {}) {
  const c = mk(w + 80, h + 80), g = c.getContext('2d'), rnd = mulberry32(seed);
  const deckle = () => {
    g.beginPath(); const pts = [];
    const n = 40;
    for (let i = 0; i < n; i++) pts.push([40 + (w * i) / n, 40 + (rnd() - 0.5) * 5]);
    for (let i = 0; i < n; i++) pts.push([40 + w + (rnd() - 0.5) * 5, 40 + (h * i) / n]);
    for (let i = 0; i < n; i++) pts.push([40 + w - (w * i) / n, 40 + h + (rnd() - 0.5) * 5]);
    for (let i = 0; i < n; i++) pts.push([40 + (rnd() - 0.5) * 5, 40 + h - (h * i) / n]);
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  };
  if (shadow) { g.save(); g.shadowColor = 'rgba(10,20,40,0.32)'; g.shadowBlur = 26; g.shadowOffsetY = 8; g.fillStyle = fill; deckle(); g.fill(); g.restore(); }
  g.fillStyle = fill; deckle(); g.fill();
  g.save(); deckle(); g.clip();
  g.globalCompositeOperation = 'multiply';
  for (let i = 0; i < 18; i++) bloom(g, 40 + rnd() * w, 40 + rnd() * h, 80 + rnd() * 200, '#EFE6D2', 0.18, rnd, 0.4);
  const id = g.getImageData(0, 0, w + 80, h + 80), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const m = 1 - 0.035 * rnd(); d[i] *= m; d[i + 1] *= m; d[i + 2] *= m; }
  g.putImageData(id, 0, 0);
  g.restore();
  g.strokeStyle = 'rgba(150,130,100,0.25)'; g.lineWidth = 1.5; deckle(); g.stroke();
  return c;
}
function card(a, fn) {
  if (a <= 0) return;
  if (!cardCanvas) cardCanvas = paintPaper(CARD.w, CARD.h, 21);
  A(a, () => { ctx.drawImage(cardCanvas, CARD.x - 40, CARD.y - 40 + (1 - eout(clamp(a))) * 16); fn(); });
}
function cardTitle(str, y = CARD.y + 74) { txt(str, CX, y, { size: 54, weight: 600, fam: SERIF, align: 'center' }); }

// ---------- small drawings ----------
function sun(x, y, r, { core = '#FFFCEF', glow = [255, 246, 214], halo = 4.4, a = 1, glowA = 0.6 } = {}) {
  A(a, () => {
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * halo);
    g.addColorStop(0, rgba(glow, glowA)); g.addColorStop(0.35, rgba(glow, glowA * 0.35)); g.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * halo, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - r * 0.18, y - r * 0.18, r * 0.62, 0, Math.PI * 2); ctx.fill();
  });
}
/** A sine wave from (x0,y0) to (x1,y1) with wavelength wl px. */
function wave(x0, y0, x1, y1, wl, amp, ph, col, lw = 4, env = false) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  ctx.beginPath();
  for (let d = 0; d <= L; d += 2) {
    const en = env ? Math.pow(Math.sin((Math.PI * d) / L), 2) : 1;
    const o = amp * en * Math.sin((2 * Math.PI * d) / wl - ph);
    const px = x0 + ux * d - uy * o, py = y0 + uy * d + ux * o;
    if (d) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function eye(x, y, sc = 1, iris = '#3E7BC4', lid = C.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.moveTo(-36, 0); ctx.quadraticCurveTo(0, -32, 36, 0); ctx.quadraticCurveTo(0, 32, -36, 0); ctx.closePath();
  ctx.fillStyle = '#FBF8F1'; ctx.fill(); ctx.strokeStyle = lid; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#141A2A'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-4, -4, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
/** A watercolour swatch drawn live: a soft blob with a darker rim. */
function swatch(x, y, r, col, a = 1, seed = 1) {
  const rnd = mulberry32(seed), c = hex(col);
  A(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, rgba(mixRGB(c, [255, 255, 255], 0.25), 0.9)); g.addColorStop(0.85, rgba(c, 0.92)); g.addColorStop(1, rgba(c, 0.5));
    ctx.fillStyle = g; wobble(ctx, x, y, r, r * 0.94, rnd, 0.06); ctx.fill();
    ctx.strokeStyle = rgba(mixRGB(c, [20, 30, 60], 0.25), 0.55); ctx.lineWidth = 2; wobble(ctx, x, y, r * 0.99, r * 0.93, mulberry32(seed), 0.06); ctx.stroke();
  });
}
function molecule(x, y, sc = 1, t = 0, col = 'rgba(250,252,255,0.95)', line = 'rgba(20,40,80,0.5)') {
  const a = 0.6 + Math.sin(t * 0.7 + x) * 0.5, dx = Math.cos(a) * 7 * sc, dy = Math.sin(a) * 7 * sc;
  ctx.fillStyle = col; ctx.strokeStyle = line; ctx.lineWidth = 1.4;
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sg * dx, y + sg * dy, 6 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}
function arrow(x0, y0, x1, y1, col, lw = 3, head = 14) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4)); ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
}
/** A spectrum strip: x maps nm0 → nm1 across w, optional brightness per wavelength. */
function strip(x, y, w, h, nm0 = 380, nm1 = 720, gain = null, a = 1) {
  A(a, () => {
    for (let i = 0; i < w; i += 2) {
      const nm = lerp(nm0, nm1, i / w), c = nmRGB(nm, 0.08), gn = gain ? gain(nm) : 1;
      ctx.fillStyle = rgba(mixRGB([28, 32, 48], c, gn)); ctx.fillRect(x + i, y, 2.5, h);
    }
    ctx.strokeStyle = 'rgba(30,42,68,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
  });
}
function bracket(x0, x1, y, col, up = true, lw = 2.5) {
  const d = up ? -12 : 12;
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y - d); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y - d); ctx.stroke();
}

// ---------- background, header, title cards ----------
// which painted plate shows when: [time, plate, seconds to crossfade]
function plateEvents() {
  const at = (n) => CH[n - 1].at + 1.4;
  return [[0, 'noon', 0], [at(2), 'lab', 1.6], [at(3), 'noon', 1.6], [at(6), 'cloud', 1.6], [at(7), 'golden', 1.6],
    [s('s6') - 1.5, 'sunset', 5], [s('s11'), 'dusk', 3.5], [at(9), 'mars', 1.6], [s('z1') - 0.6, 'dusk', 2.2]];
}
let EVENTS = null;
function background(t) {
  EVENTS ??= plateEvents();
  let i = 0; while (i + 1 < EVENTS.length && EVENTS[i + 1][0] <= t) i++;
  const [t0, name, dur] = EVENTS[i], p = dur ? eio(seg(t, t0, t0 + dur)) : 1;
  if (p < 1 && i > 0) ctx.drawImage(plate(EVENTS[i - 1][1]), 0, 0);
  A(p, () => ctx.drawImage(plate(name), 0, 0));
}
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.2) c = ch; return c; }
function header(t) {
  const a = seg(t, CH[0].at + 2.4, CH[0].at + 3.4);
  if (a <= 0) return;
  A(a * 0.92, () => {
    sky('RECKON', 96, 100, { size: 34, weight: 600, fam: SERIF, spacing: '4px' });
    ctx.font = `600 34px "${SERIF}"`; ctx.letterSpacing = '4px'; const w = ctx.measureText('RECKON').width; ctx.letterSpacing = '0px';
    const ch = chapterAt(t);
    if (ch && t < s('z1') - 0.5) A(seg(t, ch.at + 2.2, ch.at + 3.2), () => sky(`${ch.n} · ${ch.title}`, 96 + w + 28, 101, { size: 32, weight: 300 }));
  });
}
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.5, 0.6);
    if (a <= 0) continue;
    if (!bandCanvas) bandCanvas = paintPaper(1500, 330, 31, { fill: '#FBF6EA' });
    A(a * 0.5, () => { ctx.fillStyle = 'rgba(14,22,44,0.55)'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      ctx.save(); ctx.translate(0, (1 - p) * 18);
      ctx.drawImage(bandCanvas, 210 - 40, 375 - 40);
      // a painted spectrum stroke under the title
      for (let i = 0; i < 520; i += 2) { ctx.fillStyle = rgba(nmRGB(lerp(400, 700, i / 520), 0.2), 0.75); ctx.fillRect(700 + i, 640 + Math.sin(i / 40) * 2, 2.6, 7 + Math.sin(i / 17) * 1.5); }
      txt(`PART ${ch.n}`, W / 2, 448, { size: 34, weight: 600, align: 'center', color: C.inkSoft, spacing: '6px' });
      txt(ch.title, W / 2, 552, { size: 112, weight: 600, fam: SERIF, align: 'center' });
      ctx.restore();
    });
  }
}

// ---------- cold open ----------
const SUN_O = { x: 330, y: 300 };
function partOpen(t) {
  const sunA = seg(t, 0.2, s('o1', 0.6));
  sun(SUN_O.x, lerp(360, SUN_O.y, eout(sunA)), 48, { a: sunA });
  // the whole dome brightens
  A(0.55 * seg(t, s('o1', 0.4), s('o1', 2.4)) * (1 - seg(t, s('o5'), s('o5', 1))), () => {
    const g = ctx.createRadialGradient(SUN_O.x, SUN_O.y, 60, SUN_O.x, SUN_O.y, 1500);
    g.addColorStop(0, 'rgba(225,240,255,0.5)'); g.addColorStop(1, 'rgba(120,175,235,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  // white sunlight, clear air
  const b = eout(seg(t, s('o2'), s('o2', 1.4))), bOut = 1 - seg(t, s('o5') - 0.3, s('o5', 0.4));
  A(b * bOut, () => {
    ctx.save(); ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(255,255,250,0.9)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(SUN_O.x + 40, SUN_O.y + 40); ctx.lineTo(lerp(SUN_O.x + 40, 760, b), lerp(SUN_O.y + 40, 800, b)); ctx.stroke(); ctx.restore();
    A(seg(t, s('o2', 0.6), s('o2', 1.2)), () => sky('white sunlight', 600, 520, { size: 36, weight: 400 }));
  });
  const q1 = span(t, s('o3'), s('o4', 0.1), 0.5, 0.5), q2 = span(t, s('o4', 0.2), s('o5', 0.2), 0.5, 0.5);
  A(q1, () => { sky('Where does', 1340, 380, { size: 92, weight: 600, fam: SERIF, align: 'center' }); sky('the blue come from?', 1340, 480, { size: 92, weight: 600, fam: SERIF, align: 'center' }); });
  A(q2, () => {
    sky('Why not', 1340, 380, { size: 92, weight: 600, fam: SERIF, align: 'center' });
    sky('violet?', 1340, 480, { size: 104, weight: 600, fam: SERIF, italic: true, align: 'center', color: '#E3D2FF', shadow: 'rgba(40,20,80,0.7)' });
  });
  // four roundels: a tube of smoke, the fourth power, Mars, an eye
  const rOut = 1 - seg(t, s('o6') - 0.2, s('o6', 0.5));
  [0.04, 0.28, 0.52, 0.74].forEach((f, i) => {
    const a = eout(seg(t, mid('o5', f), mid('o5', f) + 0.6)) * rOut;
    if (a <= 0) return;
    const x = 420 + i * 360, y = 640;
    A(a, () => {
      swatch(x, y, 128, ['#FBF6EA', '#FBF6EA', '#E7C495', '#FBF6EA'][i], 0.95, 40 + i);
      if (i === 0) {
        ctx.fillStyle = 'rgba(70,120,210,0.25)'; ctx.fillRect(x - 96, y - 26, 192, 52);
        ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2.5; k.rrect(x - 100, y - 30, 200, 60, 28); ctx.stroke();
        const g = ctx.createLinearGradient(x - 96, 0, x + 96, 0); g.addColorStop(0, 'rgba(90,150,240,0.9)'); g.addColorStop(1, 'rgba(210,90,60,0.9)');
        ctx.fillStyle = g; ctx.fillRect(x - 92, y - 6, 184, 12);
      } else if (i === 1) {
        sup('1 / λ', '4', x, y + 22, { size: 64, weight: 400, align: 'center' });
      } else if (i === 2) {
        ctx.fillStyle = '#B9774A'; ctx.beginPath(); ctx.arc(x, y + 150, 150, Math.PI * 1.15, Math.PI * 1.85); ctx.fill();
        const g = ctx.createRadialGradient(x, y + 14, 4, x, y + 14, 70); g.addColorStop(0, 'rgba(120,170,230,0.95)'); g.addColorStop(1, 'rgba(120,170,230,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y + 14, 70, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F4F6FF'; ctx.beginPath(); ctx.arc(x, y + 14, 12, 0, Math.PI * 2); ctx.fill();
      } else eye(x, y, 1.5);
    });
  });
  // the title
  const ti = eout(seg(t, s('o6'), s('o6', 1.0)));
  A(ti, () => {
    sky('Why the sky is blue', W / 2, 430 + (1 - ti) * 20, { size: 124, weight: 600, fam: SERIF, align: 'center' });
    for (let i = 0; i < 620; i += 2) { ctx.fillStyle = rgba(nmRGB(lerp(400, 700, i / 620), 0.15), 0.8 * seg(i / 620, 0, ti)); ctx.fillRect(W / 2 - 310 + i, 520 + Math.sin(i / 50) * 3, 2.6, 8 + Math.sin(i / 19) * 2); }
  });
}

// ---------- 1: white light ----------
function partWhite(t) {
  const S0 = { x: 200, y: 230 }, P = { x: 540, y: 560 };
  sun(S0.x, S0.y, 44);
  const beam = eout(seg(t, s('w1', 0.2), s('w1', 1.6)));
  const ex = lerp(S0.x + 30, P.x - 40, beam), ey = lerp(S0.y + 30, P.y, beam);
  ctx.save(); ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(255,255,250,0.95)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(S0.x + 30, S0.y + 30); ctx.lineTo(ex, ey); ctx.stroke(); ctx.restore();
  A(seg(t, s('w1', 1.0), s('w1', 1.6)) * (1 - seg(t, s('w2', 0.4), s('w2', 1))), () => sky('white light', 410, 330, { size: 36 }));
  // the prism and the fan
  const pr = eout(seg(t, s('w2'), s('w2', 0.8))), fan = eout(seg(t, s('w2', 0.7), s('w2', 2.2)));
  A(pr, () => {
    ctx.beginPath(); ctx.moveTo(P.x, P.y - 110); ctx.lineTo(P.x + 100, P.y + 70); ctx.lineTo(P.x - 100, P.y + 70); ctx.closePath();
    ctx.fillStyle = 'rgba(235,245,255,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.stroke();
    sky('prism', P.x, P.y + 120, { size: 34, align: 'center' });
  });
  if (fan > 0) {
    const o = { x: P.x + 40, y: P.y - 10 }, sx = lerp(o.x, 950, fan);
    for (let i = 0; i < 60; i++) {
      const nm = lerp(720, 380, i / 60), nm2 = lerp(720, 380, (i + 1) / 60);
      const y0 = lerp(o.y, lerp(380, 760, i / 60), fan), y1 = lerp(o.y, lerp(380, 760, (i + 1) / 60), fan);
      ctx.fillStyle = rgba(nmRGB((nm + nm2) / 2, 0.05), 0.55);
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(sx, y0); ctx.lineTo(sx, y1 + 0.5); ctx.closePath(); ctx.fill();
    }
    A(seg(t, s('w2', 1.6), s('w2', 2.2)), () => sky('spectrum', 930, 340, { size: 34, align: 'right' }));
  }
  // the card
  const ca = seg(t, s('w3', -0.4), s('w3', 0.3));
  card(ca, () => {
    const stA = 1 - seg(t, s('w4') - 0.3, s('w4', 0.3)), stB = span(t, s('w4', 0.1), s('w7', 0.3), 0.6, 0.6), stC = seg(t, s('w7'), s('w7', 0.6));
    A(stA, () => {
      cardTitle('Light is a wave');
      const wl = 220, x0 = CARD.x + 85, y = 520;
      // a sine with crests (smallest y) at x0 + wl/4 + n·wl
      wave(x0, y, CARD.x + CARD.w - 85, y, wl, 70, Math.PI, C.blue, 5);
      const c1 = x0 + wl * 0.75;
      A(seg(t, s('w3', 1.0), s('w3', 1.6)), () => {
        ctx.setLineDash([6, 8]); ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2;
        for (const cx of [c1, c1 + wl]) { ctx.beginPath(); ctx.moveTo(cx, y - 90); ctx.lineTo(cx, y + 90); ctx.stroke(); }
        ctx.setLineDash([]);
        bracket(c1, c1 + wl, y - 108, C.ink);
        txt('wavelength', c1 + wl / 2, y - 140, { size: 36, weight: 600, align: 'center' });
        txt('crest to crest', c1 + wl / 2, y + 140, { size: 34, weight: 300, align: 'center', color: C.inkSoft });
      });
    });
    A(stB, () => {
      cardTitle('The visible spectrum');
      const x0 = CARD.x + 70, w = CARD.w - 140, y = 420;
      const xn = (nm) => x0 + ((nm - 380) / 340) * w;
      strip(x0, y, w, 70);
      txt('380 nm', x0, y + 112, { size: 32, weight: 600, color: C.violet });
      txt('720 nm', x0 + w, y + 112, { size: 32, weight: 600, color: C.red, align: 'right' });
      const names = [[400, 'violet', C.violet, 0], [460, 'blue', C.blue, 1], [525, 'green', C.green, 0], [578, 'yellow', C.yellow, 1], [612, 'orange', C.orange, 0], [690, 'red', C.red, 1]];
      names.forEach(([nm, n, col, row]) => {
        const show = n === 'violet' || n === 'red' ? seg(t, s('w4', 0.4), s('w4', 1.0)) : seg(t, s('w6'), s('w6', 0.8));
        A(show, () => txt(n, xn(nm), row ? y - 82 : y - 34, { size: 32, weight: 400, color: col, align: 'center' }));
      });
      A(seg(t, s('w5'), s('w5', 0.6)), () => {
        txt('1 nanometre =', CX, 680, { size: 40, weight: 400, align: 'center' });
        txt('a millionth of a millimetre', CX, 736, { size: 40, weight: 400, align: 'center' });
      });
    });
    A(stC, () => {
      cardTitle('Drawn to scale');
      const x0 = CARD.x + 70, x1 = CARD.x + CARD.w - 70, pxnm = 0.5;
      [[450, C.blue, 'blue · 450 nm', 410], [700, C.red, 'red · 700 nm', 690]].forEach(([nm, col, lab, y]) => {
        const wl = nm * pxnm;
        wave(x0, y, x1, y, wl, 52, Math.PI, rgba(nmRGB(nm, 0.15)), 5);
        txt(lab, x0, y - 96, { size: 36, weight: 600, color: col });
        bracket(x0 + wl * 0.75, x0 + wl * 1.75, y + 80, col, false);
        txt('one wave', x0 + wl * 1.25, y + 116, { size: 32, weight: 300, color: col, align: 'center' });
      });
      A(seg(t, s('w8'), s('w8', 0.6)), () => txt('shorter', x1, 314, { size: 36, weight: 600, color: C.blue, align: 'right' }));
    });
  });
}

// ---------- 2: Tyndall's tube ----------
const TL = { y: 214, xL: 300, x0: 640, x1: 1720, y0: 1860, y1: 1910 };
const yearX = (y) => lerp(TL.x0, TL.x1, (y - TL.y0) / (TL.y1 - TL.y0));
function timeline(t, nodes, a = 1) {
  A(a, () => {
    const g = eout(seg(t, nodes.start, nodes.start + 1.2));
    ctx.strokeStyle = 'rgba(255,253,246,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(TL.xL - 60, TL.y); ctx.lineTo(lerp(TL.xL - 60, 470, g), TL.y); ctx.stroke();
    if (g > 0.4) { ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.moveTo(480, TL.y); ctx.lineTo(600, TL.y); ctx.stroke(); ctx.setLineDash([]); }
    ctx.beginPath(); ctx.moveTo(610, TL.y); ctx.lineTo(lerp(610, TL.x1 + 40, g), TL.y); ctx.stroke();
    for (const [x, at, top, bottom] of nodes.items) {
      const p = eout(seg(t, at, at + 0.7));
      if (p <= 0) continue;
      A(p, () => {
        ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(x, TL.y, 9 * p, 0, Math.PI * 2); ctx.fill();
        sky(top, x, TL.y - 40, { size: 40, weight: 600, fam: SERIF, align: 'center' });
        sky(bottom, x, TL.y + 44, { size: 32, weight: 300, align: 'center' });
      });
    }
  });
}
const TUBE = { x0: 360, x1: 1480, y: 590, h: 120 };
const SMOKE = [];
{ const rnd = mulberry32(23); for (let i = 0; i < 420; i++) SMOKE.push({ x: rnd(), y: rnd(), r: 1 + rnd() * 2.4, v: 0.004 + rnd() * 0.01, ph: rnd() * 6.3, d: rnd() }); }
function partTyndall(t) {
  timeline(t, { start: s('t1'), items: [[TL.xL, s('t2', 0.6), 'early 1500s', 'Leonardo da Vinci'], [yearX(1869), s('t3', 0.3), '1869', 'John Tyndall']] });
  // Leonardo's idea: sunlight on tiny particles
  A(span(t, s('t2', 0.4), s('t4', 0.4), 0.8, 0.6), () => {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(700, 300, 1100, 800); g.addColorStop(0, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0.05)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(760, 290); ctx.lineTo(880, 290); ctx.lineTo(1260, 800); ctx.lineTo(980, 800); ctx.closePath(); ctx.fill();
    const rnd = mulberry32(17);
    for (let i = 0; i < 90; i++) { const u = rnd(), v = rnd(), x = lerp(lerp(760, 880, v), lerp(980, 1260, v), u) + Math.sin(t * 0.6 + i) * 6, y = lerp(290, 800, u) + Math.cos(t * 0.5 + i) * 5;
      ctx.fillStyle = `rgba(200,220,255,${0.4 + 0.5 * rnd()})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd() * 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    sky('sunlight on tiny particles?', 1300, 560, { size: 38, weight: 600, fam: SERIF, italic: true });
  });
  const tube = eout(seg(t, s('t4'), s('t4', 1.0)));
  if (tube <= 0) return;
  const { x0, x1, y, h } = TUBE, smoke = eio(seg(t, s('t5', 0.6), Math.max(s('t5', 3.2), e('t5'))));
  A(tube, () => {
    // the lamp
    ctx.fillStyle = '#2A3150'; k.rrect(170, y - 70, 130, 140, 14); ctx.fill(); ctx.strokeStyle = 'rgba(220,225,240,0.45)'; ctx.lineWidth = 2; ctx.stroke();
    const lg = ctx.createRadialGradient(300, y, 4, 300, y, 80); lg.addColorStop(0, 'rgba(255,250,235,1)'); lg.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(300, y, 80, 0, Math.PI * 2); ctx.fill();
    sky('bright lamp', 235, y + 118, { size: 32, weight: 300, align: 'center' });
    // the beam along the tube: white, fading toward the end as blue scatters out
    const bg = ctx.createLinearGradient(x0, 0, x1, 0);
    bg.addColorStop(0, 'rgba(255,252,240,0.85)'); bg.addColorStop(1, rgba(mixRGB([255, 252, 240], [255, 170, 120], smoke), 0.8));
    ctx.fillStyle = bg; ctx.fillRect(300, y - 16, x1 - 300, 32);
    // smoke
    for (const p of SMOKE) {
      if (p.d > smoke) continue;
      const px = x0 + 10 + ((p.x + t * p.v) % 1) * (x1 - x0 - 20), py = y - h / 2 + 10 + p.y * (h - 20) + Math.sin(t * 0.8 + p.ph) * 4;
      ctx.fillStyle = 'rgba(200,205,215,0.35)'; ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // the blue glow seen from the side
    A(smoke, () => {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const gg = ctx.createLinearGradient(x0, 0, x1, 0); gg.addColorStop(0, 'rgba(90,150,255,0.85)'); gg.addColorStop(1, 'rgba(90,150,255,0.45)');
      ctx.shadowColor = 'rgba(90,150,255,0.9)'; ctx.shadowBlur = 40; ctx.fillStyle = gg; ctx.fillRect(x0, y - 34, x1 - x0, 68);
      ctx.restore();
    });
    // the glass
    k.rrect(x0, y - h / 2, x1 - x0, h, h / 2); ctx.fillStyle = 'rgba(220,235,255,0.07)'; ctx.fill();
    ctx.strokeStyle = 'rgba(230,240,255,0.75)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 50, y - h / 2 + 12); ctx.lineTo(x1 - 50, y - h / 2 + 12); ctx.stroke();
    // the far end glows red
    A(smoke, () => {
      const rg = ctx.createRadialGradient(x1, y, 4, x1, y, 90); rg.addColorStop(0, 'rgba(255,120,80,0.95)'); rg.addColorStop(1, 'rgba(255,120,80,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x1, y, 90, 0, Math.PI * 2); ctx.fill();
    });
    A(seg(t, s('t5', 0.4), s('t5', 1.2)), () => sky('smoke', 900, y - 96, { size: 34, weight: 300, align: 'center' }));
  });
  // the two views
  const v = seg(t, s('t6'), s('t6', 0.6)), v2 = seg(t, mid('t6', 0.45), mid('t6', 0.45) + 0.6);
  A(v, () => { eye(900, 800, 1.2, '#3E7BC4', 'rgba(230,236,250,0.9)'); arrow(900, 762, 900, 680, 'rgba(140,185,255,0.9)', 3); sky('from the side: blue', 960, 800, { size: 36, weight: 600, color: '#BFD6FF' }); });
  A(v2, () => { eye(1640, 590, 1.2, '#C8573A', 'rgba(230,236,250,0.9)'); sky('from the end:', 1640, 680, { size: 34, weight: 300, align: 'center' }); sky('red', 1640, 724, { size: 38, weight: 600, align: 'center', color: '#FFB49A' }); });
  // blue scattered out sideways, red carrying on
  const sc = seg(t, s('t7'), s('t7', 0.5)) * (1 - seg(t, s('t9', 0.5), s('t9', 1.2)));
  if (sc > 0) {
    const rnd = mulberry32(5);
    for (let i = 0; i < 14; i++) {
      const bx = lerp(x0 + 80, x1 - 80, rnd()), dir = rnd() < 0.5 ? -1 : 1, ph = rnd();
      const f = ((t - s('t7')) * 0.45 + ph) % 1;
      A(sc * Math.min(1, f * 6, (1 - f) * 4), () => wave(bx, y + dir * 20 - dir * 0, bx + (rnd() - 0.5) * 60, y + dir * (40 + f * 170), 18, 6, t * 10, 'rgba(120,175,255,0.95)', 3.5, true));
    }
    for (let i = 0; i < 3; i++) {
      const f = ((t - s('t7')) * 0.3 + i / 3) % 1, x = lerp(x0 + 40, x1 + 40, f);
      A(sc * Math.min(1, f * 6, (1 - f) * 6), () => wave(x - 60, y, x + 60, y, 34, 7, t * 8, 'rgba(255,140,110,0.95)', 3.5, true));
    }
  }
  A(span(t, s('t8'), s('t9') + 0.2, 0.6, 0.5), () => sky('…the blue of the sky?', W / 2, 920, { size: 56, weight: 600, fam: SERIF, italic: true, align: 'center' }));
  A(seg(t, s('t9', 0.3), s('t9', 0.9)), () => {
    sky('Why does blue scatter more?', 560, 920, { size: 44, weight: 600, fam: SERIF, align: 'center' });
    A(seg(t, mid('t9', 0.55), mid('t9', 0.55) + 0.6), () => sky('Why is the sky so intensely blue?', 1360, 920, { size: 44, weight: 600, fam: SERIF, align: 'center' }));
  });
}

// ---------- 3: Rayleigh's rule ----------
const MOL = { x: 560, y: 600 };
const PLOT = { x0: CARD.x + 120, x1: CARD.x + CARD.w - 60, y0: CARD.y + 690, y1: CARD.y + 230, nm0: 380, nm1: 720, v1: 12 };
const px = (nm) => lerp(PLOT.x0, PLOT.x1, (nm - PLOT.nm0) / (PLOT.nm1 - PLOT.nm0)), py = (v) => lerp(PLOT.y0, PLOT.y1, v / PLOT.v1);
function partRayleigh(t) {
  sun(200, 230, 44);
  // who and when
  const nm = span(t, s('r1'), s('r3', 0.2), 0.6, 0.6);
  A(nm, () => {
    sky('1871', 520, 360, { size: 120, weight: 600, fam: SERIF, align: 'center' });
    sky('John William Strutt', 520, 460, { size: 56, weight: 500, fam: SERIF, align: 'center' });
    A(seg(t, s('r2'), s('r2', 0.6)), () => {
      sky('from 1873: Lord Rayleigh', 520, 530, { size: 36, weight: 300, align: 'center' });
      A(seg(t, mid('r2', 0.5), mid('r2', 0.5) + 0.7), () => sky('Rayleigh scattering', 520, 650, { size: 72, weight: 600, fam: SERIF, italic: true, align: 'center' }));
    });
  });
  // the molecule as a tiny antenna
  const ma = span(t, s('r3'), s('r10', 0.2), 0.6, 0.6);
  A(ma, () => {
    const wl = 150, om = 5.2;
    wave(110, MOL.y, MOL.x - 30, MOL.y, wl, 34, t * om, 'rgba(255,253,246,0.9)', 4.5);
    arrow(MOL.x - 120, MOL.y - 70, MOL.x - 60, MOL.y - 70, 'rgba(255,253,246,0.7)', 2.5, 12);
    sky('light wave', 250, MOL.y - 80, { size: 34, weight: 300, align: 'center' });
    // the charges shaken up and down
    const sh = Math.sin(t * om) * 14 * seg(t, s('r3', 1.2), s('r3', 2.0));
    const cg = ctx.createRadialGradient(MOL.x, MOL.y + sh, 4, MOL.x, MOL.y + sh, 46); cg.addColorStop(0, 'rgba(255,240,200,0.75)'); cg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(MOL.x, MOL.y + sh, 46, 0, Math.PI * 2); ctx.fill();
    molecule(MOL.x, MOL.y, 2.2, t);
    A(seg(t, s('r3', 1.6), s('r3', 2.4)), () => { arrow(MOL.x + 60, MOL.y + 6, MOL.x + 60, MOL.y - 34, C.cream, 2.5, 10); arrow(MOL.x + 60, MOL.y + 10, MOL.x + 60, MOL.y + 50, C.cream, 2.5, 10); sky('charges shaken', MOL.x + 84, MOL.y + 10, { size: 32, weight: 300 }); });
    // new light, sent out in rings
    const ring = seg(t, s('r4'), s('r4', 0.8));
    if (ring > 0) {
      for (let i = 0; i < 3; i++) {
        const r = ((t - s('r4')) * 90 + i * wl) % (wl * 3);
        if (r < 30) continue;
        ctx.strokeStyle = `rgba(190,215,255,${ring * 0.85 * (1 - r / (wl * 3))})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(MOL.x, MOL.y, r, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
        ctx.beginPath(); ctx.arc(MOL.x, MOL.y, r, Math.PI * 0.58, Math.PI * 1.42); ctx.stroke();
      }
      A(seg(t, s('r4', 0.8), s('r4', 1.4)), () => sky('a tiny antenna', MOL.x, MOL.y + 150, { size: 38, weight: 600, align: 'center' }));
    }
    // much smaller than the wavelength
    A(seg(t, s('r5'), s('r5', 0.6)), () => {
      bracket(130, 130 + wl, MOL.y + 70, C.cream, false);
      sky('one wavelength', 130 + wl / 2, MOL.y + 118, { size: 32, weight: 300, align: 'center' });
      sky('particle: under a tenth of it', MOL.x, MOL.y + 220, { size: 36, weight: 400, align: 'center' });
    });
  });
  // 1899: molecules themselves
  const mo = seg(t, s('r10'), s('r10', 0.7));
  A(mo, () => {
    sky('1899', 520, 300, { size: 100, weight: 600, fam: SERIF, align: 'center' });
    sky('the rule holds for single molecules', 520, 380, { size: 36, weight: 300, align: 'center' });
    const sc = seg(t, s('r11'), s('r11', 0.8));
    A(sc, () => {
      // one wave of blue light, 450 nm, drawn 760 px long: a molecule under 1 nm is under 1.7 px
      const x0 = 140, x1 = 900, y = 560, wl = x1 - x0;
      wave(x0, y, x1, y, wl, 60, -Math.PI / 2 + Math.PI / 2, 'rgba(150,195,255,0.95)', 5);
      bracket(x0, x1, y + 100, C.cream, false);
      sky('one wave of blue light: 450 nm', (x0 + x1) / 2, y + 148, { size: 34, align: 'center' });
      const mx = 760, my = y - 110;
      ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(mx, my, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,253,246,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx - 18, my - 12); ctx.lineTo(mx - 60, my - 34); ctx.stroke();
      sky('a molecule: under 1 nm', mx - 70, my - 40, { size: 34, weight: 600, align: 'right' });
    });
    A(seg(t, s('r12'), s('r12', 0.6)), () => sky('the air itself does it: no dust needed', 520, 860, { size: 40, weight: 600, fam: SERIF, align: 'center' }));
    A(seg(t, s('r13'), s('r13', 0.6)), () => sky('later: Einstein’s theory matches experiment', 520, 920, { size: 32, weight: 300, align: 'center' }));
  });
  // the card: the fourth-power curve
  card(seg(t, s('r6', -0.4), s('r6', 0.3)), () => {
    cardTitle('How strongly air scatters');
    txt('relative to red light at 700 nm', CX, CARD.y + 124, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
    // axes
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PLOT.x0, PLOT.y1 - 10); ctx.lineTo(PLOT.x0, PLOT.y0); ctx.lineTo(PLOT.x1, PLOT.y0); ctx.stroke();
    for (const v of [1, 5, 10]) { ctx.strokeStyle = C.inkFaint; ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.moveTo(PLOT.x0, py(v)); ctx.lineTo(PLOT.x1, py(v)); ctx.stroke(); ctx.setLineDash([]); txt(`${v}×`, PLOT.x0 - 14, py(v), { size: 32, weight: 400, align: 'right', color: C.inkSoft }); }
    for (const n of [400, 500, 600, 700]) txt(`${n}`, px(n), PLOT.y0 + 30, { size: 32, align: 'center', color: C.inkSoft });
    txt('wavelength, nm', (PLOT.x0 + PLOT.x1) / 2, PLOT.y0 + 72, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
    // the curve, drawn from red toward violet
    const g = eio(seg(t, s('r6', 0.6), s('r6', 2.6))), lo = lerp(720, 380, g);
    for (let n = 720; n > lo; n -= 2) {
      const n2 = Math.max(lo, n - 2);
      ctx.fillStyle = rgba(nmRGB(n, 0.3), 0.32); ctx.beginPath(); ctx.moveTo(px(n), PLOT.y0); ctx.lineTo(px(n), py(rel(n))); ctx.lineTo(px(n2), py(rel(n2))); ctx.lineTo(px(n2), PLOT.y0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(nmRGB(n, 0)); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px(n), py(rel(n))); ctx.lineTo(px(n2), py(rel(n2))); ctx.stroke();
    }
    A(seg(t, s('r6', 1.4), s('r6', 2.2)), () => sup('goes as 1 / λ', '4', PLOT.x1 - 10, PLOT.y1 + 30, { size: 48, align: 'right' }));
    // halve the wavelength
    A(span(t, s('r7'), s('r8', 0.2), 0.5, 0.5), () => {
      txt('half the wavelength:', PLOT.x1 - 10, PLOT.y1 + 100, { size: 34, weight: 400, align: 'right' });
      txt('16×', PLOT.x1 - 10, PLOT.y1 + 170, { size: 84, weight: 600, fam: SERIF, align: 'right', color: C.blue });
      txt('the scattering', PLOT.x1 - 10, PLOT.y1 + 230, { size: 34, weight: 400, align: 'right' });
    });
    // red 1×, blue 5.9×
    const m = seg(t, s('r8', 0.3), s('r8', 1.0));
    A(m, () => {
      for (const [n, col, lab] of [[700, C.red, '1×'], [450, C.blue, `${BLUE_X.toFixed(1)}×`]]) {
        ctx.setLineDash([4, 6]); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px(n), PLOT.y0); ctx.lineTo(px(n), py(rel(n))); ctx.lineTo(PLOT.x0, py(rel(n))); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(n), py(rel(n)), 9, 0, Math.PI * 2); ctx.fill();
        txt(lab, px(n) + 18, py(rel(n)) - 26, { size: 38, weight: 600, color: col });
      }
    });
    A(seg(t, s('r9'), s('r9', 0.7)), () => {
      txt('≈ 6×', PLOT.x1 - 10, PLOT.y1 + 130, { size: 104, weight: 600, fam: SERIF, color: C.blue, align: 'right' });
      txt('blue, compared with red', PLOT.x1 - 10, PLOT.y1 + 210, { size: 34, weight: 400, color: C.ink, align: 'right' });
    });
  });
}

// ---------- 4: a sky full of blue ----------
const SUN4 = { x: 170, y: 200 };
const MOLS = [];
{ const rnd = mulberry32(31); for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 9; gx++) { const x = 280 + gx * 80 + (rnd() - 0.5) * 50, y = 170 + gy * 78 + (rnd() - 0.5) * 46; MOLS.push({ x, y }); } }
const PK = [];
{
  const rnd = mulberry32(37), n = 120;
  for (let i = 0; i < n; i++) {
    const c = i % 5, f = i / n + rnd() * 0.004, ang = ((22 + rnd() * 34) * Math.PI) / 180, ux = Math.cos(ang), uy = Math.sin(ang);
    const q = Math.min(0.9, 0.06 * COLS[c].rel);
    const near = MOLS.map((m, j) => { const dx = m.x - SUN4.x, dy = m.y - SUN4.y, sd = dx * ux + dy * uy; return { j, sd, d: Math.abs(-dx * uy + dy * ux) }; }).filter((o) => o.d < 22 && o.sd > 80).sort((a, b) => a.sd - b.sd);
    let hit = null; for (const o of near) if (rnd() < q) { hit = o; break; }
    const out = rnd() * Math.PI * 2;
    PK.push({ c, f, ux, uy, hit, vx: Math.cos(out), vy: Math.sin(out), ph: rnd() * 6 });
  }
}
function packet(x, y, ux, uy, c, t, a = 1, len = 54) {
  const wl = (COLS[c].nm / 700) * 18, nx = -uy, ny = ux;
  A(a, () => {
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const sd = -len / 2 + (len * i) / 30, en = Math.pow(Math.cos((Math.PI * sd) / len), 2), o = 6 * en * Math.sin((2 * Math.PI * sd) / wl - t * 14);
      const X = x + ux * sd + nx * o, Y = y + uy * sd + ny * o; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
    }
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(10,20,50,0.35)'; ctx.lineWidth = 6.5; ctx.stroke();
    ctx.strokeStyle = rgba(nmRGB(COLS[c].nm, 0)); ctx.lineWidth = 3.4; ctx.stroke();
  });
}
function partSky(t) {
  sun(SUN4.x, SUN4.y, 46);
  const t0 = s('b1', 0.6), t1 = Math.max(e('b3'), s('b3', 4)), SPEED = 300;
  A(seg(t, s('b1'), s('b1', 0.8)) * (1 - seg(t, s('b6') - 0.4, s('b6', 0.6)) * 0.6), () => MOLS.forEach((m) => molecule(m.x, m.y, 1, t)));
  A(seg(t, s('b2'), s('b2', 0.6)) * (1 - seg(t, s('b3', 1.2), s('b3', 2))), () => sky('air molecules', 620, 860, { size: 34, weight: 300, align: 'center' }));
  for (const p of PK) {
    const em = lerp(t0, t1, p.f), age = t - em;
    if (age < 0 || age > 5) continue;
    const d = age * SPEED;
    let x, y, ux = p.ux, uy = p.uy;
    if (!p.hit || d < p.hit.sd) { x = SUN4.x + p.ux * d; y = SUN4.y + p.uy * d; }
    else { const bx = SUN4.x + p.ux * p.hit.sd, by = SUN4.y + p.uy * p.hit.sd, d2 = d - p.hit.sd; x = bx + p.vx * d2; y = by + p.vy * d2; ux = p.vx; uy = p.vy; }
    if (x < -40 || x > 1010 || y < -40 || y > 900) continue;
    packet(x, y, ux, uy, p.c, t + p.ph, seg(age, 0, 0.25) * (1 - seg(t, s('b5'), s('b5', 0.8)) * 0.85));
  }
  A(seg(t, s('b3', 0.3), s('b3', 1)) * (1 - seg(t, s('b4'), s('b4', 0.6))), () => sky('blue is knocked aside most often', 600, 860, { size: 34, weight: 400, align: 'center' }));
  // the eye on the hill gets blue from everywhere
  const EYE = { x: 760, y: 880 }, ea = seg(t, s('b4'), s('b4', 0.8)) * (1 - seg(t, s('b8') - 0.4, s('b8', 0.3)));
  A(ea, () => {
    const from = [[300, 200], [520, 140], [760, 220], [960, 330], [400, 450], [920, 560], [260, 640], [620, 420]];
    from.forEach(([fx, fy], i) => {
      const L = Math.hypot(EYE.x - fx, EYE.y - fy), ux = (EYE.x - fx) / L, uy = (EYE.y - fy) / L, ex = EYE.x - ux * 46, ey = EYE.y - uy * 46;
      ctx.setLineDash([6, 10]); ctx.strokeStyle = 'rgba(205,228,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
      const f = ((t - s('b4')) * 0.5 + i * 0.13) % 1;
      packet(lerp(fx, ex, f), lerp(fy, ey, f), ux, uy, 3, t, Math.min(1, f * 5, (1 - f) * 5), 42);
    });
    eye(EYE.x, EYE.y, 1.1);
  });
  // the direct sunlight looks slightly yellow
  A(seg(t, s('b5'), s('b5', 0.7)) * ea, () => {
    ctx.strokeStyle = 'rgba(255,236,170,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(SUN4.x + 34, SUN4.y + 34); ctx.lineTo(EYE.x - 34, EYE.y - 34); ctx.stroke();
    sun(SUN4.x, SUN4.y, 46, { core: '#FFF2C4', glow: [255, 236, 170], glowA: 0.5 });
    sky('direct sunlight: slightly yellow', 340, 380, { size: 34, weight: 400 });
  });
  // the sea, reflecting the sky
  const sea = seg(t, s('b8', 0.2), s('b8', 1.2));
  A(sea, () => {
    const top = 820, g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, '#9CC3E6'); g.addColorStop(0.4, '#4F86C0'); g.addColorStop(1, '#2A5288');
    ctx.fillStyle = g; ctx.fillRect(0, top, W, H - top);
    const rnd = mulberry32(41);
    for (let i = 0; i < 70; i++) { const y = top + 8 + rnd() * (H - top), x = rnd() * 1000, l = 30 + rnd() * 120; ctx.strokeStyle = `rgba(235,245,255,${0.18 + rnd() * 0.25})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l + Math.sin(t + i) * 6, y); ctx.stroke(); }
    A(seg(t, s('b9'), s('b9', 0.6)), () => { arrow(560, 520, 560, 800, 'rgba(255,253,246,0.85)', 3, 16); sky('the sea reflects the sky', 590, 660, { size: 38, weight: 600 }); });
  });
  // the card: what the sky's light holds
  card(seg(t, s('b6', -0.4), s('b6', 0.3)), () => {
    const stA = 1 - seg(t, s('b8') - 0.4, s('b8', 0.2)), stB = seg(t, s('b8', 0.1), s('b8', 0.7));
    A(stA, () => {
      cardTitle('The light of a blue sky');
      const x0 = CARD.x + 70, w = CARD.w - 140, y = 340, xn = (nm) => x0 + ((nm - 380) / 340) * w;
      strip(x0, y, w, 60);
      txt('every colour is there', CX, y + 100, { size: 34, weight: 300, align: 'center', color: C.inkSoft });
      A(seg(t, s('b6', 0.8), s('b6', 1.6)), () => {
        ctx.fillStyle = 'rgba(30,42,68,0.14)'; ctx.fillRect(xn(450), y - 18, xn(485) - xn(450), 96);
        bracket(xn(450), xn(485), y - 22, C.ink); txt('broad peak: 450–485 nm', xn(468), y - 50, { size: 32, weight: 600, align: 'center' });
      });
      A(seg(t, s('b7'), s('b7', 0.6)), () => {
        const yy = 560, r = 82;
        swatch(CARD.x + 150, yy, r, '#3F7FD0', eout(seg(t, s('b7', 0.1), s('b7', 0.8))), 2);
        swatch(CX, yy, r, '#FFFFFF', eout(seg(t, s('b7', 0.5), s('b7', 1.2))), 3);
        swatch(CARD.x + CARD.w - 150, yy, r, '#9CC4EA', eout(seg(t, mid('b7', 0.6), mid('b7', 0.6) + 0.7)), 4);
        txt('+', (CARD.x + 150 + CX) / 2, yy, { size: 64, weight: 300, align: 'center' });
        txt('=', (CX + CARD.x + CARD.w - 150) / 2, yy, { size: 64, weight: 300, align: 'center' });
        txt('blue', CARD.x + 150, yy + 124, { size: 34, align: 'center' }); txt('white', CX, yy + 124, { size: 34, align: 'center' });
        txt('sky blue', CARD.x + CARD.w - 150, yy + 124, { size: 34, weight: 600, align: 'center', color: C.blue });
      });
    });
    A(stB, () => {
      cardTitle('Sky and sea');
      const y1 = 380, y2 = 600;
      txt('the sky reflects the sea', CX, y1, { size: 44, weight: 400, align: 'center', color: C.inkSoft });
      const st = eout(seg(t, s('b8', 1.2), s('b8', 2.0)));
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CX - 230, y1 + 4); ctx.lineTo(lerp(CX - 230, CX + 230, st), y1 - 6 * st); ctx.stroke();
      A(seg(t, s('b9'), s('b9', 0.6)), () => {
        txt('the sea reflects the sky', CX, y2, { size: 44, weight: 600, align: 'center', color: C.blue });
        txt('(and water absorbs red light)', CX, y2 + 64, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      });
    });
  });
}

// ---------- 5: why not violet ----------
const BARS = { x0: CARD.x + 120, base: CARD.y + 520, maxH: 290, bw: 90, gap: 130 };
function scatterBars(t, grow0, { violetFade = 0, focus = null, labels = true } = {}) {
  COLS.forEach((c, i) => {
    const g = eio(seg(t, grow0 + i * 0.25, grow0 + 0.9 + i * 0.25)), h = (c.rel / VIOLET_X) * BARS.maxH * g, x = BARS.x0 + i * BARS.gap;
    const a = (focus !== null && focus !== i ? 0.45 : 1) * (i === 4 ? 1 - violetFade : 1);
    A(a, () => {
      const col = nmRGB(c.nm, 0.15);
      ctx.fillStyle = rgba(col, 0.85); k.rrect(x - BARS.bw / 2, BARS.base - h, BARS.bw, Math.max(2, h), [8, 8, 2, 2]); ctx.fill();
      ctx.strokeStyle = rgba(mixRGB(col, [20, 30, 60], 0.35), 0.6); ctx.lineWidth = 2; ctx.stroke();
      if (labels) A(seg(g, 0.7, 1), () => txt(`${c.rel.toFixed(1)}×`, x, BARS.base - h - 26, { size: 34, weight: 600, align: 'center' }));
      txt(`${c.nm}`, x, BARS.base + 30, { size: 32, align: 'center', color: C.inkSoft });
      txt(c.name, x, BARS.base + 68, { size: 32, weight: 600, align: 'center', color: c.ink });
    });
  });
}
function partViolet(t) {
  sun(210, 220, 44);
  // some violet absorbed high in the atmosphere
  const hi = span(t, s('v5'), s('v6', 0.4), 0.6, 0.6);
  A(hi, () => {
    const g = ctx.createLinearGradient(0, 120, 0, 300); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 120, 1000, 180);
    sky('high atmosphere', 880, 200, { size: 32, weight: 300, align: 'right' });
    for (let i = 0; i < 6; i++) {
      const f = ((t - s('v5')) * 0.5 + i / 6) % 1, x = 340 + i * 95, y = lerp(60, 320, f);
      packet(x, y, 0.3, 0.95, 4, t + i, Math.min(1, f * 5) * (1 - seg(f, 0.45, 0.8)));
    }
  });
  // a rainbow still shows violet
  const rb = span(t, s('v6'), s('v8', 0.3), 1.0, 0.8);
  A(rb * 0.75, () => {
    const cx = 560, cy = 1180;
    for (let i = 0; i < 70; i++) { const nm = lerp(700, 400, i / 70), r = 640 - i * 1.6; ctx.strokeStyle = rgba(nmRGB(nm, 0.1), 0.5); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); }
    sky('violet, inside the rainbow', 560, 460, { size: 34, weight: 400, align: 'center' });
  });
  // the eye
  const ey = span(t, s('v7'), s('v11', 0.6), 0.6, 0.6);
  A(ey, () => { eye(560, 780, 1.6); });
  card(seg(t, s('v1', -0.6), s('v1', 0.2)), () => {
    const stA = 1 - seg(t, s('v8') - 0.3, s('v8', 0.3)), stB = span(t, s('v8', 0.1), s('v11', 0.3), 0.6, 0.6), stC = seg(t, s('v11'), s('v11', 0.6));
    A(stA, () => {
      cardTitle('Violet scatters most');
      const vf = 0.25 * seg(t, s('v4'), s('v4', 0.8)) + 0.2 * seg(t, s('v5'), s('v5', 0.8)) + 0.25 * seg(t, s('v7'), s('v7', 0.8));
      scatterBars(t, s('v1', 0.3), { violetFade: vf, focus: t > s('v2') && t < s('v4') ? 4 : null });
      A(span(t, s('v3'), s('v4', 0.2), 0.4, 0.4), () => txt('?', BARS.x0 + 4 * BARS.gap, BARS.base - BARS.maxH - 92, { size: 120, weight: 600, fam: SERIF, align: 'center', color: C.violet }));
      const rows = [[s('v4'), 'less violet in sunlight'], [s('v5'), 'some absorbed high up'], [s('v7'), 'eyes less sensitive to it']];
      rows.forEach(([at, lab], i) => A(seg(t, at, at + 0.6), () => {
        const y = BARS.base + 140 + i * 50;
        ctx.fillStyle = C.violet; ctx.beginPath(); ctx.arc(CARD.x + 110, y, 7, 0, Math.PI * 2); ctx.fill();
        txt(lab, CARD.x + 134, y, { size: 34, weight: 400, color: C.violet });
      }));
    });
    A(stB, () => {
      cardTitle('Three kinds of cone');
      txt('how strongly each responds (schematic)', CX, CARD.y + 122, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      const x0 = CARD.x + 80, x1 = CARD.x + CARD.w - 60, yb = CARD.y + 430, hh = 220, xn = (nm) => lerp(x0, x1, (nm - 380) / 340);
      ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
      for (const n of [400, 500, 600, 700]) txt(`${n} nm`, xn(n), yb + 30, { size: 32, align: 'center', color: C.inkSoft });
      // approximate cone sensitivities (peaks near 440, 535 and 565 nm)
      const cones = [[440, 26, C.blue, 'blue', 0], [535, 42, C.green, 'green', 1], [565, 46, C.red, 'red', 2]];
      cones.forEach(([pk, wd, col, nme, i]) => {
        const g = eio(seg(t, s('v8', 0.3 + i * 0.35), s('v8', 1.2 + i * 0.35)));
        ctx.beginPath();
        for (let n = 380; n <= 720; n += 3) { const v = Math.exp(-0.5 * ((n - pk) / wd) ** 2) * g; const X = xn(n), Y = yb - v * hh; if (n === 380) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
        ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
        A(g, () => txt(nme, xn(pk) + [-50, -40, 46][i], yb - hh - 22, { size: 32, weight: 600, align: 'center', color: col }));
      });
      // what skylight does to them
      A(seg(t, s('v9'), s('v9', 0.6)), () => {
        txt('stimulated by skylight (schematic)', CX, CARD.y + 530, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
        [[C.red, 'red', 0.55], [C.green, 'green', 0.57], [C.blue, 'blue', 0.92]].forEach(([col, n, v], i) => {
          const x = CARD.x + 120, y = CARD.y + 590 + i * 54, g = eio(seg(t, s('v9', 0.3 + i * 0.3), s('v9', 1.1 + i * 0.3)));
          txt(n, x, y, { size: 32, weight: 600, color: col, align: 'right' });
          ctx.fillStyle = col; k.rrect(x + 20, y - 14, 380 * v * g, 28, 6); ctx.fill();
        });
        A(seg(t, s('v10'), s('v10', 0.7)), () => { swatch(CARD.x + CARD.w - 130, CARD.y + 644, 70, '#A8CBEE', 1, 7); txt('pale blue', CARD.x + CARD.w - 130, CARD.y + 744, { size: 32, weight: 600, align: 'center', color: C.blue }); });
      });
    });
    A(stC, () => {
      txt('physics', CX, CARD.y + 250, { size: 84, weight: 600, fam: SERIF, align: 'center' });
      txt('+', CX, CARD.y + 340, { size: 64, weight: 300, align: 'center' });
      txt('the way we see', CX, CARD.y + 430, { size: 84, weight: 600, fam: SERIF, align: 'center' });
      swatch(CX, CARD.y + 610, 90, '#9CC4EA', eout(seg(t, s('v11', 0.5), s('v11', 1.3))), 9);
    });
  });
}

// ---------- 6: white clouds ----------
function partClouds(t) {
  const halo = seg(t, s('c9'), s('c9', 1.2));
  sun(240, 200, 44, { halo: 4.4 + halo * 2.5, glowA: 0.6 + halo * 0.3, glow: [255, 252, 245] });
  A(halo, () => sky('a white glow around the Sun', 120, 330, { size: 34, weight: 400 }));
  // white light in, white light out
  const wi = span(t, s('c6'), s('c8', 0.2), 0.6, 0.6);
  A(wi, () => {
    ctx.save(); ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 12; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(270, 230); ctx.lineTo(480, 420); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3, f = ((t - s('c6')) * 0.6 + i * 0.1) % 1;
      const x = 560 + Math.cos(a) * (60 + f * 200), y = 470 + Math.sin(a) * (40 + f * 140);
      A(Math.min(1, f * 5, (1 - f) * 4), () => { ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 22, y - Math.sin(a) * 22); ctx.lineTo(x, y); ctx.stroke(); });
    }
    sky('white in, white out', 560, 700, { size: 38, weight: 600, align: 'center' });
  });
  A(span(t, s('c8'), s('c9', 0.3), 0.6, 0.6), () => { arrow(760, 760, 640, 590, 'rgba(255,253,246,0.9)', 3, 14); sky('less light gets through: a grey base', 780, 790, { size: 34, weight: 400 }); });
  card(seg(t, s('c2', -0.4), s('c2', 0.3)), () => {
    const stA = 1 - seg(t, s('c4') - 0.3, s('c4', 0.3)), stB = span(t, s('c4', 0.1), s('c7', 0.3), 0.6, 0.6), stC = seg(t, s('c7'), s('c7', 0.6));
    A(stA, () => {
      cardTitle('How big?');
      txt('sizes on a scale of tens', CX, CARD.y + 122, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      const x0 = CARD.x + 70, x1 = CARD.x + CARD.w - 70, y = CARD.y + 430, lg = (nm) => lerp(x0, x1, (Math.log10(nm) + 1) / 6); // 0.1 nm .. 100,000 nm
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      [[0.1, '0.1 nm'], [1, '1 nm'], [10, '10 nm'], [100, '100 nm'], [1000, '1 µm'], [10000, '10 µm']].forEach(([v, l]) => {
        ctx.beginPath(); ctx.moveTo(lg(v), y - 10); ctx.lineTo(lg(v), y + 10); ctx.stroke();
        txt(l, lg(v), y + 40, { size: 32, align: 'center', color: C.inkSoft });
      });
      // molecules, light, droplets
      A(seg(t, s('c2', 0.2), s('c2', 0.8)), () => {
        ctx.fillStyle = 'rgba(30,42,68,0.2)'; ctx.fillRect(lg(0.2), y - 34, lg(0.8) - lg(0.2), 24);
        txt('air molecules', lg(0.4), y - 70, { size: 32, weight: 600, align: 'center' });
        txt('under 1 nm', lg(0.4), y - 110, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
        for (let i = 0; i < (lg(720) - lg(380)); i += 2) { ctx.fillStyle = rgba(nmRGB(lerp(380, 720, i / (lg(720) - lg(380))), 0.1)); ctx.fillRect(lg(380) + i, y - 34, 2.5, 24); }
        txt('light waves', (lg(380) + lg(720)) / 2, y - 70, { size: 32, weight: 600, align: 'center' });
        txt('380–720 nm', (lg(380) + lg(720)) / 2, y - 110, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      });
      A(seg(t, mid('c2', 0.5), mid('c2', 0.5) + 0.6), () => {
        ctx.fillStyle = 'rgba(90,120,170,0.45)'; ctx.fillRect(lg(2000), y - 34, lg(10000) - lg(2000), 24);
        txt('cloud droplets', lg(4500), y + 110, { size: 32, weight: 600, align: 'center' });
        txt('a few µm', lg(4500), y + 150, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      });
      A(seg(t, s('c3'), s('c3', 0.6)), () => {
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lg(0.5), y + 80); ctx.quadraticCurveTo((lg(0.5) + lg(4500)) / 2, y + 230, lg(4500) - 40, y + 190); ctx.stroke();
        txt('thousands of times bigger', (lg(0.5) + lg(4500)) / 2 - 20, y + 250, { size: 34, weight: 600, align: 'center', color: C.blue });
      });
    });
    A(stB, () => {
      cardTitle('Small and large scatterers');
      const base = CARD.y + 540, bw = 46, gp = 62;
      [[CARD.x + 110, 'molecules', 'Rayleigh', (c) => c.rel / VIOLET_X], [CARD.x + 450, 'droplets', 'Mie', () => 0.62]].forEach(([x0, nme, rule, h], gi) => {
        const g = eio(seg(t, gi ? s('c4', 1.0) : s('c4', 0.2), (gi ? s('c4', 1.0) : s('c4', 0.2)) + 1.0));
        COLS.forEach((c, i) => { const hh = h(c) * 270 * g; ctx.fillStyle = rgba(nmRGB(c.nm, 0.15), 0.85); k.rrect(x0 + i * gp, base - hh, bw, Math.max(2, hh), [6, 6, 2, 2]); ctx.fill(); });
        txt(nme, x0 + 2 * gp + bw / 2, base + 40, { size: 34, weight: 600, align: 'center' });
        txt(rule, x0 + 2 * gp + bw / 2, base + 80, { size: 34, weight: 300, align: 'center', color: C.inkSoft });
      });
      A(seg(t, s('c5'), s('c5', 0.6)), () => {
        txt('Mie scattering', CARD.x + 450 + 2 * 62 + 23, CARD.y + 190, { size: 44, weight: 600, fam: SERIF, align: 'center' });
        txt('after Gustav Mie', CARD.x + 450 + 2 * 62 + 23, CARD.y + 236, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      });
      A(seg(t, s('c6'), s('c6', 0.6)), () => txt('all colours alike → white', CX, CARD.y + 720, { size: 36, weight: 600, align: 'center', color: C.blue }));
    });
    A(stC, () => {
      cardTitle('A thick cloud');
      txt('70–95%', CX, CARD.y + 300, { size: 140, weight: 600, fam: SERIF, align: 'center', color: C.blue });
      txt('of the light that falls on it is reflected,', CX, CARD.y + 420, { size: 34, weight: 400, align: 'center' });
      txt('across all colours', CX, CARD.y + 468, { size: 34, weight: 400, align: 'center' });
      A(seg(t, s('c9'), s('c9', 0.6)), () => {
        txt('the same scattering:', CX, CARD.y + 590, { size: 34, weight: 300, align: 'center', color: C.inkSoft });
        txt('whitish haze, a white glow round the Sun', CX, CARD.y + 640, { size: 34, weight: 600, align: 'center' });
      });
    });
  });
}

// ---------- 7: polarised light ----------
const DISC = { x: 520, y: 560, r: 320 };
const SUNP = { az: (215 * Math.PI) / 180, el: (32 * Math.PI) / 180 };
let polarCanvas = null;
function dirOf(az, el) { return [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)]; }
/** The sky looking straight up (zenith in the middle, horizon at the rim), shaded by the degree of polarisation. */
function paintPolar() {
  const R = DISC.r, c = mk(2 * R + 4, 2 * R + 4), g = c.getContext('2d'), id = g.createImageData(2 * R + 4, 2 * R + 4), d = id.data;
  const sd = dirOf(SUNP.az, SUNP.el);
  for (let y = 0; y < 2 * R + 4; y++) for (let x = 0; x < 2 * R + 4; x++) {
    const dx = x - R - 2, dy = y - R - 2, rr = Math.hypot(dx, dy) / R;
    if (rr > 1) continue;
    const el = (1 - rr) * (Math.PI / 2), az = Math.atan2(dx, -dy), v = dirOf(az, el);
    const gam = Math.acos(clamp(v[0] * sd[0] + v[1] * sd[1] + v[2] * sd[2], -1, 1)), p = polar(gam) / 0.8;
    const col = mixRGB([238, 232, 214], [36, 70, 150], Math.pow(p, 1.3));
    const i = (y * (2 * R + 4) + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = Math.round(255 * clamp((1 - rr) * 60));
  }
  g.putImageData(id, 0, 0);
  polarCanvas = c;
}
function sunInDisc() { const rr = 1 - SUNP.el / (Math.PI / 2); return { x: DISC.x + Math.sin(SUNP.az) * rr * DISC.r, y: DISC.y - Math.cos(SUNP.az) * rr * DISC.r }; }
function partPolar(t) {
  // the sky, looking straight up
  const da = seg(t, s('p3', -0.3), s('p3', 0.6));
  A(span(t, CH[6].at + 2, s('p3'), 0.5, 0.6), () => sun(260, 240, 44, { core: '#FFF6DE', glow: [255, 235, 190] }));
  A(da, () => {
    if (!polarCanvas) paintPolar();
    ctx.save(); ctx.shadowColor = 'rgba(10,20,40,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = '#EEE8D6'; ctx.beginPath(); ctx.arc(DISC.x, DISC.y, DISC.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.drawImage(polarCanvas, DISC.x - DISC.r - 2, DISC.y - DISC.r - 2);
    ctx.strokeStyle = 'rgba(30,42,68,0.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(DISC.x, DISC.y, DISC.r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(DISC.x, DISC.y, 4, 0, Math.PI * 2); ctx.fill();
    const sp = sunInDisc(), hidden = seg(t, s('p9'), s('p9', 0.8)) * (1 - seg(t, s('p10', 0.4), s('p10', 1.2)));
    sun(sp.x, sp.y, 24, { core: '#FFF6DE', glow: [255, 235, 190], halo: 3 });
    A(hidden, () => {
      const rnd = mulberry32(3); ctx.fillStyle = 'rgba(245,245,248,0.97)';
      for (let i = 0; i < 6; i++) { wobble(ctx, sp.x - 40 + i * 16, sp.y + Math.sin(i) * 10, 38, 28, rnd, 0.1); ctx.fill(); }
      txt('Sun hidden', sp.x, sp.y + 72, { size: 32, weight: 600, align: 'center' });
    });
    A(1 - hidden, () => sky('Sun', sp.x + 34, sp.y - 26, { size: 34, weight: 600, shadow: 'rgba(12,22,48,0.4)' }));
    sky('looking straight up (diagram)', DISC.x, DISC.y + DISC.r + 48, { size: 32, weight: 300, align: 'center' });
    A(seg(t, s('p3', 0.8), s('p3', 1.5)), () => sky('most polarised: 90° from the Sun', DISC.x, DISC.y - DISC.r - 34, { size: 34, weight: 600, align: 'center' }));
    // sunglasses over the band
    A(span(t, s('p5'), s('p6', 0.3), 0.5, 0.5), () => {
      const gx = DISC.x + 150, gy = DISC.y - 150;
      ctx.strokeStyle = '#1A2238'; ctx.lineWidth = 6;
      for (const dx of [-62, 62]) { k.rrect(gx + dx - 54, gy - 34, 108, 68, 24); ctx.fillStyle = 'rgba(20,40,90,0.45)'; ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(gx - 8, gy - 8); ctx.quadraticCurveTo(gx, gy - 20, gx + 8, gy - 8); ctx.stroke();
      sky('a deeper blue', gx, gy + 66, { size: 34, weight: 600, align: 'center' });
    });
  });
  card(seg(t, s('p2', -0.4), s('p2', 0.3)), () => {
    const stA = 1 - seg(t, s('p4') - 0.3, s('p4', 0.3)), stB = span(t, s('p4', 0.1), s('p6', 0.3), 0.6, 0.6), stC = span(t, s('p6', 0.1), s('p7', 0.3), 0.6, 0.6), stD = seg(t, s('p7'), s('p7', 0.6));
    A(stA, () => {
      cardTitle('Polarised light');
      const yy = CARD.y + 400;
      [[CARD.x + 210, 'ordinary light', 'vibrates every way', 6], [CARD.x + 580, 'polarised light', 'one direction wins', 1]].forEach(([x, l1, l2, n], gi) => {
        A(gi ? seg(t, mid('p2', 0.55), mid('p2', 0.55) + 0.6) : seg(t, s('p2', 0.3), s('p2', 0.9)), () => {
          for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI + (gi ? Math.PI / 2 : 0.2), r = 96 * (0.8 + 0.2 * Math.sin(t * 6 + i)); arrow(x, yy, x + Math.cos(a) * r, yy + Math.sin(a) * r, C.blue, 3, 14); arrow(x, yy, x - Math.cos(a) * r, yy - Math.sin(a) * r, C.blue, 3, 14); }
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, yy, 6, 0, Math.PI * 2); ctx.fill();
          txt(l1, x, yy + 160, { size: 36, weight: 600, align: 'center' }); txt(l2, x, yy + 204, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
        });
      });
      txt('looking along the beam', CX, CARD.y + 160, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
    });
    A(stB, () => {
      cardTitle('How polarised is the sky?');
      const x0 = CARD.x + 130, x1 = CARD.x + CARD.w - 60, y0 = CARD.y + 640, y1 = CARD.y + 230;
      const X = (deg) => lerp(x0, x1, deg / 180), Y = (p) => lerp(y0, y1, p / 0.9);
      ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      for (const d of [0, 45, 90, 135, 180]) txt(`${d}°`, X(d), y0 + 32, { size: 32, align: 'center', color: C.inkSoft });
      for (const p of [0, 0.4, 0.8]) txt(`${Math.round(p * 100)}%`, x0 - 14, Y(p), { size: 32, align: 'right', color: C.inkSoft });
      txt('angle from the Sun', (x0 + x1) / 2, y0 + 76, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      const g = eio(seg(t, s('p4', 0.4), s('p4', 1.8)));
      ctx.beginPath(); for (let d = 0; d <= 180 * g; d += 2) { const X1 = X(d), Y1 = Y(polar((d * Math.PI) / 180)); if (d) ctx.lineTo(X1, Y1); else ctx.moveTo(X1, Y1); }
      ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.stroke();
      A(seg(t, s('p4', 1.4), s('p4', 2.0)), () => {
        ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(X(90), Y(0.8), 9, 0, Math.PI * 2); ctx.fill();
        txt('about 80% at 90°', X(90), Y(0.8) - 36, { size: 36, weight: 600, align: 'center', color: C.blue });
      });
      txt('Rayleigh sky model, clear sky', CX, CARD.y + 128, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
    });
    A(stC, () => {
      txt('“On the light from the sky,', CX, CARD.y + 300, { size: 54, weight: 500, fam: SERIF, italic: true, align: 'center' });
      txt('its polarization and colour”', CX, CARD.y + 370, { size: 54, weight: 500, fam: SERIF, italic: true, align: 'center' });
      txt('J. W. Strutt, 1871', CX, CARD.y + 470, { size: 36, weight: 400, align: 'center', color: C.inkSoft });
    });
    A(stD, () => {
      cardTitle('A compass in the sky');
      // a honeybee, in simple shapes
      const bx = CARD.x + 230, by = CARD.y + 330, fl = Math.sin(t * 30) * 0.25;
      ctx.save(); ctx.translate(bx, by);
      ctx.fillStyle = 'rgba(200,220,245,0.7)'; ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2;
      for (const sg of [-1, 1]) { ctx.save(); ctx.rotate(sg * (0.5 + fl)); ctx.beginPath(); ctx.ellipse(sg * 10, -46, 26, 48, sg * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = '#E2A72E'; ctx.beginPath(); ctx.ellipse(0, 20, 42, 58, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2B2418'; for (const y of [0, 26, 50]) { ctx.fillRect(-40, y, 80, 11); }
      ctx.beginPath(); ctx.arc(0, -46, 26, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      txt('honeybees', bx, by + 130, { size: 36, weight: 600, align: 'center' });
      txt('Karl von Frisch', bx, by + 172, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      // a compass rose
      const cx = CARD.x + 560, cy = CARD.y + 360;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.stroke();
      const nd = seg(t, s('p9'), s('p9', 1.2)) * 0.6 + Math.sin(t * 1.3) * 0.05;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(nd);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(0, -94); ctx.lineTo(14, 0); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.inkSoft; ctx.beginPath(); ctx.moveTo(0, 94); ctx.lineTo(14, 0); ctx.lineTo(-14, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      txt('the Sun’s direction,', cx, cy + 160, { size: 32, weight: 600, align: 'center' });
      txt('from the pattern', cx, cy + 200, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      A(seg(t, s('p10'), s('p10', 0.6)), () => {
        const sx = CX, sy = CARD.y + 680;
        ctx.fillStyle = 'rgba(225,235,245,0.9)'; ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(sx - 140, sy + 20); ctx.lineTo(sx - 100, sy - 30); ctx.lineTo(sx - 20, sy - 30); ctx.lineTo(sx - 60, sy + 20); ctx.closePath(); ctx.fill(); ctx.stroke();
        txt('a “sunstone” crystal?', sx - 0, sy - 10, { size: 34, weight: 600 });
        txt('suggested for Viking sailors', sx - 0, sy + 30, { size: 32, weight: 300, color: C.inkSoft });
      });
    });
  });
}

// ---------- 8: sunset ----------
/** The colour of sunlight after crossing m air masses (for drawing). */
function sunColour(m) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let nm = 400; nm <= 700; nm += 10) { const c = nmRGB(nm, 0), tr = Math.exp(-tau(nm) * m); r += c[0] * tr; g += c[1] * tr; b += c[2] * tr; n++; }
  const mx = Math.max(r, g, b);
  return [r, g, b].map((v) => Math.round(255 * Math.pow(v / mx, 0.75)));
}
function partSunset(t) {
  // the Sun goes down on the left: its height in degrees, from 60 to 0
  const dn = eio(seg(t, s('s2'), s('s7', 0.6))), alt = lerp(60, 0.5, dn), m = airMass(90 - alt);
  const sx = lerp(330, 560, dn), sy = lerp(300, 836, dn), col = sunColour(m);
  const fadeOut = 1 - seg(t, s('s11'), s('s11', 1.5));
  A(fadeOut, () => sun(sx, sy, lerp(44, 58, dn), { core: rgba(mixRGB(col, [255, 255, 255], 0.25 * (1 - dn))), glow: col, glowA: lerp(0.55, 0.75, dn), halo: lerp(4.4, 6, dn) }));
  // clouds lit by the reddened light
  A(seg(t, s('s8'), s('s8', 1.0)) * fadeOut, () => {
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const g = ctx.createRadialGradient(560, 820, 40, 560, 820, 900); g.addColorStop(0, 'rgba(255,140,60,0.9)'); g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1020, H); ctx.restore();
    sky('red and orange on white clouds', 560, 160, { size: 34, weight: 400, align: 'center' });
  });
  // after sunset, ozone helps keep the sky blue
  A(seg(t, s('s11', 0.6), s('s11', 1.4)), () => { sky('overhead: still blue', 520, 260, { size: 40, weight: 600, fam: SERIF, align: 'center' }); sky('ozone helps keep it so', 520, 314, { size: 34, weight: 300, align: 'center' }); });
  card(seg(t, s('s2', -0.4), s('s2', 0.3)) * (1 - seg(t, s('s11') - 0.2, s('s11', 0.6))), () => {
    const stA = 1 - seg(t, s('s6') - 0.3, s('s6', 0.3)), stB = span(t, s('s6', 0.1), s('s9', 0.2), 0.6, 0.6), stC = seg(t, s('s9'), s('s9', 0.6));
    A(stA, () => {
      cardTitle('The long way through');
      // a slice of the Earth with its (exaggerated) air
      const ex = CX, R = 1500, ey = CARD.y + 520 + R, air = 70, top = ey - R;
      ctx.save(); k.rrect(CARD.x + 20, CARD.y + 110, CARD.w - 40, 470, 12); ctx.clip();
      ctx.fillStyle = 'rgba(120,170,225,0.35)'; ctx.beginPath(); ctx.arc(ex, ey, R + air, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5E7F62'; ctx.beginPath(); ctx.arc(ex, ey, R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      txt('air (much thicker than to scale)', CX, top - air - 26, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      const ox = ex, oy = top;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ox, oy - 6, 8, 0, Math.PI * 2); ctx.fill();
      // overhead: straight down
      A(seg(t, s('s2', 0.3), s('s2', 1.0)), () => {
        arrow(ox, oy - air - 60, ox, oy - 18, '#C99A1A', 5, 16);
        txt('Sun high', ox + 14, oy - air - 56, { size: 32, weight: 600, color: C.yellow });
      });
      A(seg(t, s('s3'), s('s3', 0.6)), () => txt('≈ 8 km of sea-level air', ox + 20, oy - 34, { size: 32, weight: 600 }));
      // near the horizon: a long slant through the air
      A(seg(t, s('s4'), s('s4', 0.8)), () => {
        const L = Math.sqrt((R + air) ** 2 - R ** 2);
        arrow(ox - L - 40, oy - 4, ox - 16, oy - 6, C.orange, 5, 16);
        txt('Sun on the horizon', ox - 300, oy + 40, { size: 32, weight: 600, color: C.orange, align: 'center' });
        txt(`≈ ${Math.round(HORIZON_X)}× as much air`, ox - 300, oy + 80, { size: 34, weight: 600, align: 'center' });
      });
      // the two paths as bars, to scale
      A(seg(t, s('s5'), s('s5', 0.6)), () => {
        const x0 = CARD.x + 70, wMax = CARD.w - 140, y = CARD.y + 650, kmMax = HORIZON_X * COLUMN_KM, g = eio(seg(t, s('s5', 0.3), s('s5', 1.4)));
        ctx.fillStyle = C.yellow; ctx.fillRect(x0, y, Math.max(3, (COLUMN_KM / kmMax) * wMax), 22);
        txt('high Sun: 8 km', x0 + 24, y + 11, { size: 32, weight: 400 });
        ctx.fillStyle = C.orange; ctx.fillRect(x0, y + 58, wMax * g, 22);
        txt(`low Sun: over ${Math.floor(kmMax / 100) * 100} km`, x0, y + 112, { size: 32, weight: 600 });
      });
    });
    A(stB, () => {
      cardTitle('What gets through');
      txt('Rayleigh scattering by air alone', CX, CARD.y + 124, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
      const x0 = CARD.x + 70, w = CARD.w - 260;
      [[1, 'Sun high', CARD.y + 240], [HORIZON_X, 'Sun on the horizon', CARD.y + 470]].forEach(([mm, lab, y], i) => {
        const g = i ? eio(seg(t, s('s6', 0.6), s('s6', 2.0))) : 1;
        txt(lab, x0, y - 30, { size: 34, weight: 600 });
        strip(x0, y, w, 70, 380, 720, (nm) => lerp(1, Math.exp(-tau(nm) * mm), g));
        swatch(x0 + w + 100, y + 35, 62, `#${sunColour(lerp(1, mm, g)).map((v) => v.toString(16).padStart(2, '0')).join('')}`, 1, 11 + i);
      });
      A(seg(t, s('s7'), s('s7', 0.6)), () => {
        txt('blue and green: almost gone', CX, CARD.y + 640, { size: 36, weight: 600, align: 'center', color: C.blue });
        txt('orange and red get through', CX, CARD.y + 690, { size: 36, weight: 600, align: 'center', color: C.orange });
      });
    });
    A(stC, () => {
      cardTitle('The setting Sun');
      [['#F3D25C', 'very clear air', 'yellow', s('s9', 0.3)], ['#D9502E', 'smoke or dust', 'redder', s('s10', 0.1)], ['#EE8A33', 'sea salt', 'orange', mid('s10', 0.55)]].forEach(([col, l1, l2, at], i) => {
        const x = CARD.x + 150 + i * 245, y = CARD.y + 380;
        A(seg(t, at, at + 0.7), () => {
          swatch(x, y, 86, col, 1, 30 + i);
          txt(l1, x, y + 140, { size: 32, weight: 400, align: 'center' });
          txt(l2, x, y + 182, { size: 34, weight: 600, align: 'center' });
        });
      });
    });
  });
}

// ---------- 9: other skies, and the recap ----------
function rover(x, y, sc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#3A2418';
  ctx.fillRect(-40, -22, 80, 16); ctx.fillRect(-6, -52, 6, 30); ctx.fillRect(-14, -60, 22, 10);
  for (const wx of [-32, 0, 32]) { ctx.beginPath(); ctx.arc(wx, 0, 9, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function partOther(t) {
  const out = 1 - seg(t, s('z1') - 0.6, s('z1', 0.8));
  A(out, () => {
    // the Martian Sun: about two-thirds the size; it sets at m4
    const dn = eio(seg(t, s('m4'), s('m4', 2.4))), sx = lerp(420, 600, dn), sy = lerp(250, 740, dn);
    const glow = seg(t, s('m4', 0.8), s('m4', 2.6));
    A(glow, () => {
      const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, 380); g.addColorStop(0, 'rgba(150,190,235,0.95)'); g.addColorStop(0.45, 'rgba(130,170,220,0.45)'); g.addColorStop(1, 'rgba(130,170,220,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 380, 0, Math.PI * 2); ctx.fill();
    });
    sun(sx, sy, 30, { core: '#FBF8F0', glow: glow > 0.5 ? [200, 220, 245] : [255, 240, 215], glowA: 0.45, halo: 3 });
    // hills in front of the setting Sun
    ctx.fillStyle = 'rgba(122,72,44,0.0)';
    rover(820, 930, 1.2);
    A(seg(t, s('m3'), s('m3', 0.6)) * (1 - seg(t, s('m4'), s('m4', 0.6))), () => sky('Mars by day: butterscotch', 520, 150, { size: 40, weight: 600, fam: SERIF, align: 'center' }));
    A(seg(t, s('m4', 1.2), s('m4', 2.0)), () => sky('Mars at sunset: blue near the Sun', 520, 150, { size: 40, weight: 600, fam: SERIF, align: 'center' }));
    A(seg(t, s('m5'), s('m5', 0.6)), () => sky('illustration · Curiosity, Gale Crater, 2015', 520, 204, { size: 32, weight: 300, align: 'center' }));
    card(seg(t, s('m1', -0.4), s('m1', 0.3)), () => {
      const stA = 1 - seg(t, s('m3') - 0.3, s('m3', 0.3)), stB = seg(t, s('m3', 0.1), s('m3', 0.7));
      A(stA, () => {
        cardTitle('Different air');
        const x0 = CARD.x + 210, w = CARD.w - 290, g = eio(seg(t, s('m2', 0.3), s('m2', 1.4)));
        txt('Earth', x0 - 24, CARD.y + 300, { size: 36, weight: 600, align: 'right' });
        ctx.fillStyle = C.skyBlue; ctx.fillRect(x0, CARD.y + 280, w * g, 40);
        txt('Mars', x0 - 24, CARD.y + 420, { size: 36, weight: 600, align: 'right', color: '#8A4B26' });
        ctx.fillStyle = '#C07A4A'; ctx.fillRect(x0, CARD.y + 400, w * 0.02 * g, 40);
        A(seg(t, s('m2', 1.0), s('m2', 1.6)), () => {
          txt('1–2%', x0 + w * 0.02 + 20, CARD.y + 420, { size: 40, weight: 600, color: '#8A4B26' });
          txt('air density at the surface', CX, CARD.y + 520, { size: 32, weight: 300, align: 'center', color: C.inkSoft });
          txt('and full of fine dust', CX, CARD.y + 570, { size: 36, weight: 600, align: 'center', color: '#8A4B26' });
        });
      });
      A(stB, () => {
        cardTitle('Earth and Mars');
        const tiles = [
          ['Earth', 'day', ['#3C78C0', '#9CC5EA'], null, s('m3', 0.3)],
          ['Mars', 'day', ['#B78A5A', '#E3C08E'], null, s('m3', 0.3)],
          ['Earth', 'sunset', ['#36407A', '#F09450'], [255, 150, 70], s('m4', 0.4)],
          ['Mars', 'sunset', ['#9C6A5C', '#D9A884'], [150, 190, 235], s('m4', 0.4)],
        ];
        tiles.forEach(([wld, when, [c1, c2], glow, at], i) => {
          const col = i % 2, row = (i / 2) | 0, x = CARD.x + 130 + col * 330, y = CARD.y + 170 + row * 270, w = 270, h = 190;
          A(seg(t, at, at + 0.7), () => {
            ctx.save(); k.rrect(x, y, w, h, 10); ctx.clip();
            const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
            if (glow) { const gg = ctx.createRadialGradient(x + w / 2, y + h - 20, 4, x + w / 2, y + h - 20, 130); gg.addColorStop(0, rgba(glow, 0.95)); gg.addColorStop(1, rgba(glow, 0)); ctx.fillStyle = gg; ctx.fillRect(x, y, w, h); }
            ctx.fillStyle = '#FFF8E8'; ctx.beginPath(); ctx.arc(x + w / 2, y + (glow ? h - 20 : 60), wld === 'Mars' ? 12 : 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = wld === 'Mars' ? '#7A4128' : '#3E5A44'; ctx.fillRect(x, y + h - 22, w, 22);
            ctx.restore();
            ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; k.rrect(x, y, w, h, 10); ctx.stroke();
            txt(when, x + w / 2, y + h + 32, { size: 32, weight: 400, align: 'center', color: C.inkSoft });
          });
        });
        txt('Earth', CARD.x + 130 + 135, CARD.y + 140, { size: 34, weight: 600, align: 'center' });
        txt('Mars', CARD.x + 460 + 135, CARD.y + 140, { size: 34, weight: 600, align: 'center', color: '#8A4B26' });
        A(seg(t, s('m8'), s('m8', 0.6)), () => {
          const y = CARD.y + 440 + 95;
          arrow(CARD.x + 420, y - 16, CARD.x + 450, y - 16, C.ink, 3, 12); arrow(CARD.x + 450, y + 16, CARD.x + 420, y + 16, C.ink, 3, 12);
          txt('opposite', CX, CARD.y + 740, { size: 40, weight: 600, fam: SERIF, align: 'center' });
        });
      });
    });
  });
  // the recap: five roundels across the frame
  const ra = seg(t, s('z1') - 0.2, s('z1', 0.8)) * (1 - seg(t, e('z7', 0.6), e('z7', 1.6)));
  if (ra <= 0) return;
  A(ra, () => {
    sky('So, why is the sky blue?', W / 2, 220, { size: 76, weight: 600, fam: SERIF, align: 'center' });
    const items = ['z2', 'z3', 'z4', 'z5', 'z6'], labels = [['every colour,', 'short waves scatter'], ['blue ≈ 6× red', 'from all over the sky'], ['less violet,', 'and less seen'], ['the long way', 'at sunset'], ['big droplets:', 'white clouds']];
    items.forEach((key, i) => {
      const a = eout(seg(t, s(key), s(key, 0.8))), x = 330 + i * 315, y = 520;
      A(a, () => {
        swatch(x, y, 122, ['#FBF6EA', '#CFE2F5', '#E4D8F5', '#F6C99A', '#FFFFFF'][i], 0.95, 60 + i);
        if (i === 0) { for (let j = 0; j < 30; j++) { ctx.fillStyle = rgba(nmRGB(lerp(700, 400, j / 30), 0.05), 0.75); ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.lineTo(x + 70, y - 60 + j * 4); ctx.lineTo(x + 70, y - 56 + j * 4); ctx.closePath(); ctx.fill(); } }
        if (i === 1) txt('≈ 6×', x, y, { size: 74, weight: 600, fam: SERIF, align: 'center', color: C.blue });
        if (i === 2) eye(x, y, 1.3, '#6D45B8');
        if (i === 3) { sun(x, y + 30, 30, { core: '#FFD9A0', glow: [255, 150, 70], halo: 3 }); ctx.fillStyle = '#553D61'; ctx.fillRect(x - 100, y + 40, 200, 30); }
        if (i === 4) { const rnd = mulberry32(8); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(120,135,165,0.6)'; ctx.lineWidth = 2; for (let j = 0; j < 5; j++) { wobble(ctx, x - 50 + j * 25, y + Math.sin(j * 1.7) * 14, 34, 28, rnd, 0.1); ctx.fill(); ctx.stroke(); } }
        sky(labels[i][0], x, y + 176, { size: 34, weight: 600, align: 'center' });
        sky(labels[i][1], x, y + 218, { size: 32, weight: 300, align: 'center' });
      });
    });
  });
}
// the credits
const CREDITS = {
  music: ['“Ever Mindful”, “Equatorial Complex” and “Evening”', 'Kevin MacLeod (incompetech.com) · CC BY 4.0'],
  sources: ['Wikipedia: Rayleigh scattering · Diffuse sky radiation · Tyndall effect · Mie scattering', 'Rayleigh sky model · Air mass (astronomy) · Sunset · Cloud · Extraterrestrial sky',
    'Physics FAQ: “Why is the sky blue?” (P. Gibbs) · NASA: Sunset at Mars’ Gale Crater'],
};
let creditCanvas = null;
function credits(t) {
  const a = seg(t, e('z7', 1.0), e('z7', 2.0));
  if (a <= 0) return;
  if (!creditCanvas) creditCanvas = paintPaper(1620, 800, 51, { fill: '#FBF6EA' });
  A(a, () => {
    ctx.drawImage(creditCanvas, 150 - 40, 140 - 40);
    txt('Why the sky is blue', W / 2, 250, { size: 92, weight: 600, fam: SERIF, align: 'center' });
    for (let i = 0; i < 520; i += 2) { ctx.fillStyle = rgba(nmRGB(lerp(400, 700, i / 520), 0.15), 0.8); ctx.fillRect(W / 2 - 260 + i, 316, 2.6, 6); }
    txt('Reckon · original animation', W / 2, 376, { size: 36, weight: 400, align: 'center' });
    let y = 470;
    for (const [h, lines] of [['MUSIC', CREDITS.music], ['SOURCES', CREDITS.sources]]) {
      txt(h, W / 2, y, { size: 32, weight: 600, align: 'center', color: C.blue, spacing: '4px' });
      lines.forEach((l, i) => txt(l, W / 2, y + 50 + i * 46, { size: 32, weight: 400, align: 'center' }));
      y += 50 + lines.length * 46 + 46;
    }
  });
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [SERIF, SANS],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const parts = [partOpen, partWhite, partTyndall, partRayleigh, partSky, partViolet, partClouds, partPolar, partSunset, partOther];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    header(t);
    titleCard(t);
    credits(t);
    if (!GRAIN) grain();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55; ctx.drawImage(GRAIN, 0, 0); ctx.restore();
  },
});
