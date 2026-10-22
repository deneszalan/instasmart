// "Eratosthenes: measuring the Earth with a shadow", a long-form explainer (16:9, 1920x1080).
// Look: Hellenistic papyrus. A fibrous papyrus sheet painted once, black-figure ink and terracotta (meander friezes,
// a black-ringed Sun, black gnomons), Egyptian-blue angles and sea, ochre land and gold sunlight; chapter cards on
// black glaze like a vase. Cinzel (inscriptional capitals) for titles and numbers, Alegreya Sans for labels and Greek.
// Every animation is keyed to a narration line in window.TL (timing.mjs), so it stays in sync when the voice changes.
// Facts: see script.mjs. Every number shown is computed below from those facts.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const C = {
  ink: '#22170F', inkSoft: 'rgba(34,23,15,0.72)', inkFaint: 'rgba(34,23,15,0.32)',
  terra: '#B4532A', terraDeep: '#8E3A17', terraLight: '#E08A55',
  blue: '#1F4F9C', blueDeep: '#163A75', blueSoft: 'rgba(31,79,156,0.26)', sea: 'rgba(48,104,182,0.36)',
  gold: '#C98A12', goldSoft: 'rgba(201,138,18,0.55)', land: 'rgba(196,140,52,0.20)',
  paper: '#EBD9AF', chip: 'rgba(246,234,204,0.94)', panel: 'rgba(248,238,212,0.62)',
  glaze: '#1B130D', glazeText: '#F1DDB4', red: '#A8321C', green: '#2F6B3A',
};
const DISPLAY = 'Cinzel', TEXT = 'Alegreya Sans';

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const rrect = (...a) => k.rrect(...a);
const font = (w, size, fam = TEXT) => k.font(w, size, fam);
/** Text, vertically centred on y by default. */
function txt(str, x, y, { size = 36, weight = 700, family = TEXT, color = C.ink, align = 'left', base = 'middle', spacing = '0px' } = {}) {
  font(weight, size, family);
  k.text(str, x, y, { color, align, base, spacing });
}
function textW(str, { size = 36, weight = 700, family = TEXT, spacing = '0px' } = {}) {
  font(weight, size, family); ctx.letterSpacing = spacing;
  const w = ctx.measureText(str).width; ctx.letterSpacing = '0px'; return w;
}
/** A label on a small papyrus chip, so it reads over lines. */
function chip(str, x, y, o = {}) {
  const { size = 34, align = 'center', pad = 12, bg = C.chip } = o;
  const w = textW(str, o);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  rrect(x0 - pad, y - size * 0.7, w + 2 * pad, size * 1.4, 8); ctx.fillStyle = bg; ctx.fill();
  txt(str, x0, y + 1, { ...o, align: 'left' });
}

// ---------- the numbers ----------
const ANGLE = 360 / 50;                         // degrees: one fiftieth of a circle (Cleomedes)
const DIST = 5000, TOTAL = 50 * DIST;           // stadia
const PLINY = 252000, PTOLEMY = 180000, ARISTOTLE = 400000;
const POLAR = 40007.863;                        // km through the poles
const REPEAT2012 = 40074;                       // km, a 2012 repeat with modern data
const pct = (km) => (km / POLAR - 1) * 100;
const km = (stadia, m) => (stadia * m) / 1000;
const signed = (v, d = 0) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(d)}%`;
const STAD = { lo: 150, hi: 210, olympic: 176.4, italian: 184.8, short: [155, 160], firsov: 157.7 };
const LAT_A = 31 + 11 / 60 + 51 / 3600, LON_A = 29 + 53 / 60 + 33 / 3600;   // Alexandria
const LAT_S = 24 + 5 / 60 + 20 / 3600, LON_S = 32 + 53 / 60 + 59 / 3600;    // Syene (Aswan)
const DLAT = LAT_A - LAT_S, DLON = LON_S - LON_A;                            // 7.11, 3.01 degrees
const TROPIC_THEN = 23 + 43 / 60 + 40 / 3600, TROPIC_NOW = 23.436;          // obliquity then; the tropic today
const R_EARTH = 6371, AU = 149597870.7;
const CITY_KM = (() => {                                                     // great-circle distance, km
  const p1 = LAT_A * DEG, p2 = LAT_S * DEG, dl = DLON * DEG;
  return Math.acos(Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl)) * R_EARTH;
})();
const RAY_DIFF = (CITY_KM / AU) / DEG;                                       // degrees between the two rays
const SHADOW = Math.tan(ANGLE * DEG);                                        // shadow / stick, about 1/8
const DIVIDES = (n) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => n % d === 0);
const PRIMES = (() => { const p = []; for (let n = 2; n <= 100; n++) if ([2, 3, 5, 7].every((q) => n === q || n % q)) p.push(n); return p; })();

// ---------- seeded randomness ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

// ---------- papyrus, painted once ----------
let PAPYRUS = null;
function makePapyrus() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const base = g.createRadialGradient(W / 2, 500, 80, W / 2, 540, 1250);
  base.addColorStop(0, '#F3E3BC'); base.addColorStop(0.55, '#E7D2A2'); base.addColorStop(1, '#C9A96C');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = rng(23);
  for (let i = 0; i < 140; i++) {
    const x = rnd() * W, y = rnd() * H, r = 50 + rnd() * 220, a = 0.02 + rnd() * 0.05;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const tint = rnd() < 0.6 ? '140,96,40' : '255,246,222';
    gr.addColorStop(0, `rgba(${tint},${a})`); gr.addColorStop(1, `rgba(${tint},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  // strip seams: papyrus is laid in overlapping strips
  for (let x = 40 + rnd() * 40; x < W; x += 110 + rnd() * 50) {
    const lg = g.createLinearGradient(x - 12, 0, x + 12, 0);
    lg.addColorStop(0, 'rgba(120,80,30,0)'); lg.addColorStop(0.5, 'rgba(120,80,30,0.07)'); lg.addColorStop(1, 'rgba(120,80,30,0)');
    g.fillStyle = lg; g.fillRect(x - 12, 0, 24, H);
  }
  g.lineCap = 'round';
  const fibre = (horizontal, n, aMax) => {
    for (let i = 0; i < n; i++) {
      const dark = rnd() < 0.55;
      g.strokeStyle = dark ? `rgba(110,72,28,${0.03 + rnd() * aMax})` : `rgba(255,248,226,${0.04 + rnd() * aMax})`;
      g.lineWidth = 0.6 + rnd() * 1.5;
      const len = 80 + rnd() * 520, wob = rnd() * 2.4, ph = rnd() * TAU;
      g.beginPath();
      if (horizontal) {
        const y = rnd() * H, x0 = rnd() * W - 120;
        for (let q = 0; q <= len; q += 12) { const yy = y + Math.sin(q * 0.02 + ph) * wob; q ? g.lineTo(x0 + q, yy) : g.moveTo(x0, yy); }
      } else {
        const x = rnd() * W, y0 = rnd() * H - 120;
        for (let q = 0; q <= len; q += 12) { const xx = x + Math.sin(q * 0.02 + ph) * wob; q ? g.lineTo(xx, y0 + q) : g.moveTo(xx, y0); }
      }
      g.stroke();
    }
  };
  fibre(false, 520, 0.04);
  fibre(true, 2300, 0.07);
  for (let i = 0; i < 1100; i++) {
    g.fillStyle = `rgba(90,58,22,${0.05 + rnd() * 0.12})`;
    g.beginPath(); g.arc(rnd() * W, rnd() * H, 0.4 + rnd() * 1.2, 0, TAU); g.fill();
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 520, W / 2, H / 2, 1180);
  vg.addColorStop(0, 'rgba(96,58,20,0)'); vg.addColorStop(1, 'rgba(96,58,20,0.42)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return cv;
}

// ---------- ornaments and icons ----------
/** A black-figure meander (Greek key) frieze on a terracotta band. */
function meander(x0, x1, y, h, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.terra; ctx.fillRect(x0, y, x1 - x0, h);
    const grd = ctx.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, 'rgba(255,220,180,0.18)'); grd.addColorStop(1, 'rgba(60,20,0,0.18)');
    ctx.fillStyle = grd; ctx.fillRect(x0, y, x1 - x0, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x0, y + 1.5); ctx.lineTo(x1, y + 1.5); ctx.moveTo(x0, y + h - 1.5); ctx.lineTo(x1, y + h - 1.5); ctx.stroke();
    const p = 6, top = y + p, bot = y + h - p, hh = bot - top, u = hh * 1.5;
    ctx.lineWidth = 3; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    ctx.beginPath();
    let first = true;
    for (let x = x0 + 8; x + u <= x1 - 8; x += u) {
      const pts = [[x, bot], [x, top], [x + 0.78 * u, top], [x + 0.78 * u, top + 0.62 * hh], [x + 0.36 * u, top + 0.62 * hh], [x + 0.36 * u, bot], [x + u, bot]];
      for (const [px, py] of pts) { first ? ctx.moveTo(px, py) : ctx.lineTo(px, py); first = false; }
    }
    ctx.stroke();
  });
}
/** A black-figure Sun: a terracotta disc in a black ring, with black ray-wedges. */
function sunDisc(x, y, r, a = 1, spin = 0) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ctx.fillStyle = C.ink;
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(th - 0.13) * r * 1.12, Math.sin(th - 0.13) * r * 1.12);
      ctx.lineTo(Math.cos(th) * r * 1.62, Math.sin(th) * r * 1.62);
      ctx.lineTo(Math.cos(th + 0.13) * r * 1.12, Math.sin(th + 0.13) * r * 1.12);
      ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    g.addColorStop(0, '#F0A35C'); g.addColorStop(1, C.terra);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, r * 0.07);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.stroke();
    ctx.restore();
  });
}
/** A gnomon: a black rod with a small foot, from (x0,y0) on the ground to (x1,y1). */
function stick(x0, y0, x1, y1, w = 8) {
  ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const ang = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
  ctx.lineWidth = w * 0.8;
  ctx.beginPath(); ctx.moveTo(x0 - Math.cos(ang) * w * 1.4, y0 - Math.sin(ang) * w * 1.4); ctx.lineTo(x0 + Math.cos(ang) * w * 1.4, y0 + Math.sin(ang) * w * 1.4); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x1, y1, w * 0.75, 0, TAU); ctx.fill();
}
/** A straight line drawn from a to b up to fraction p. */
function line(ax, ay, bx, by, p = 1, { color = C.ink, width = 2, dash = null, offset = 0, cap = 'round' } = {}) {
  if (p <= 0) return;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap;
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = offset; }
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lerp(ax, bx, p), lerp(ay, by, p)); ctx.stroke();
  ctx.setLineDash([]);
}
/** A filled angle wedge at (cx,cy) between screen angles a0 and a1. */
function wedge(cx, cy, r, a0, a1, color = C.blue, fill = 'rgba(31,79,156,0.34)') {
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1, a1 < a0); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1, a1 < a0); ctx.stroke();
}
function cross(x, y, sz = 8, color = C.ink) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x - sz, y); ctx.lineTo(x + sz, y); ctx.moveTo(x, y - sz); ctx.lineTo(x, y + sz); ctx.stroke();
}
/** A tick or a cross, drawn with the pen (p: 0..1). */
function mark(ok, x, y, sz, p = 1, color) {
  if (p <= 0) return;
  ctx.strokeStyle = color ?? (ok ? C.green : C.red); ctx.lineWidth = sz * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ok) {
    const pts = [[x - sz * 0.5, y], [x - sz * 0.12, y + sz * 0.4], [x + sz * 0.55, y - sz * 0.45]];
    const q = p * 2;
    ctx.moveTo(...pts[0]);
    ctx.lineTo(lerp(pts[0][0], pts[1][0], clamp(q)), lerp(pts[0][1], pts[1][1], clamp(q)));
    if (q > 1) ctx.lineTo(lerp(pts[1][0], pts[2][0], clamp(q - 1)), lerp(pts[1][1], pts[2][1], clamp(q - 1)));
  } else {
    const q = p * 2, a = sz * 0.42;
    ctx.moveTo(x - a, y - a); ctx.lineTo(lerp(x - a, x + a, clamp(q)), lerp(y - a, y + a, clamp(q)));
    if (q > 1) { ctx.moveTo(x + a, y - a); ctx.lineTo(lerp(x + a, x - a, clamp(q - 1)), lerp(y - a, y + a, clamp(q - 1))); }
  }
  ctx.stroke();
}
/** A framed papyrus panel with a terracotta inner rule. */
function panel(x, y, w, h, fill = C.panel) {
  rrect(x, y, w, h, 16); ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  rrect(x + 9, y + 9, w - 18, h - 18, 10); ctx.strokeStyle = C.terra; ctx.lineWidth = 2; ctx.stroke();
}
/** A rolled papyrus book. */
function scroll(x, y, w, h, a = 1) {
  A(a, () => {
    ctx.fillStyle = '#F2E2B8'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = C.inkFaint;
    for (let i = 0; i < 5; i++) ctx.fillRect(x + w * 0.14, y + h * (0.2 + i * 0.14), w * (i === 4 ? 0.45 : 0.72), 4);
    for (const xx of [x, x + w]) {
      ctx.fillStyle = C.terra; ctx.beginPath(); ctx.ellipse(xx, y + h / 2, 12, h / 2 + 10, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(xx, y - 14, 5, 6, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(xx, y + h + 14, 5, 6, 0, 0, TAU); ctx.fill();
    }
  });
}
/** A small temple front: the Library. */
function temple(x, y, w, a = 1) {
  A(a, () => {
    const h = w * 0.62;
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, y - h * 0.72); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2 + 6, y - h * 0.72); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.terra; ctx.beginPath(); ctx.moveTo(x - w / 2 + 10, y - h * 0.75); ctx.lineTo(x, y - h * 0.93); ctx.lineTo(x + w / 2 - 10, y - h * 0.75); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillRect(x - w / 2, y - h * 0.72, w, h * 0.08);
    for (let i = 0; i < 5; i++) ctx.fillRect(x - w / 2 + 4 + i * (w - 14) / 4, y - h * 0.62, 6, h * 0.52);
    ctx.fillRect(x - w / 2 - 6, y - h * 0.1, w + 12, h * 0.1);
  });
}
function star(x, y, r, color = C.ink, n = 5) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 2 * n; i++) { const rr = i % 2 ? r * 0.45 : r, th = -Math.PI / 2 + (i * Math.PI) / n; i ? ctx.lineTo(x + rr * Math.cos(th), y + rr * Math.sin(th)) : ctx.moveTo(x + rr * Math.cos(th), y + rr * Math.sin(th)); }
  ctx.closePath(); ctx.fill();
}

// ---------- the map (simplified, equirectangular) ----------
const COAST = [ // the Mediterranean shore from the Gulf of Sidra round to Albania, lon/lat
  [10, 30.9], [15.2, 31.3], [16.5, 31.25], [17.4, 31.1], [18.2, 30.75], [19.0, 30.4], [19.9, 30.9], [20.1, 31.6], [20.0, 32.1], [20.6, 32.6], [21.4, 32.85],
  [22.2, 32.9], [22.9, 32.7], [23.5, 32.3], [24.0, 32.05], [24.9, 31.95], [25.15, 31.6], [26.0, 31.55], [27.2, 31.4], [28.0, 31.1],
  [29.0, 30.9], [29.6, 31.05], [29.9, 31.22], [30.4, 31.48], [31.0, 31.6], [31.6, 31.5], [31.9, 31.5], [32.3, 31.27], [32.6, 31.08],
  [33.2, 31.15], [33.8, 31.2], [34.25, 31.35], [34.5, 31.6], [34.9, 32.4], [35.0, 32.9], [35.2, 33.3], [35.5, 33.9], [35.65, 34.4],
  [35.9, 34.9], [35.75, 35.6], [35.95, 36.0], [36.2, 36.6], [35.9, 36.8], [35.3, 36.6], [34.6, 36.8], [34.0, 36.3], [33.4, 36.15],
  [32.6, 36.1], [32.0, 36.55], [31.3, 36.8], [30.6, 36.85], [30.4, 36.3], [29.6, 36.2], [29.1, 36.6], [28.3, 36.75], [27.6, 36.7],
  [27.4, 37.0], [27.25, 37.5], [27.2, 37.9], [26.7, 38.3], [26.3, 38.3], [26.8, 38.7], [26.9, 39.1], [26.2, 39.45], [26.1, 40.0],
  [26.3, 40.3], [26.6, 40.6], [26.0, 40.8], [25.4, 40.95], [24.6, 40.85], [23.9, 40.7], [23.3, 40.2], [22.9, 40.6], [22.6, 40.2],
  [22.9, 39.4], [23.3, 39.15], [22.9, 38.9], [23.6, 38.4], [24.05, 38.2], [24.05, 37.7], [23.6, 37.95], [23.2, 37.9], [23.0, 37.5],
  [23.1, 37.0], [22.9, 36.45], [22.5, 36.4], [22.1, 36.9], [21.7, 36.8], [21.6, 37.3], [21.1, 37.8], [21.4, 38.25], [21.0, 38.4],
  [20.7, 38.8], [20.8, 39.1], [20.2, 39.6], [19.95, 39.9], [19.4, 40.3], [19.4, 40.9], [19.5, 41.6], [19.5, 44], [10, 44],
];
const ISLANDS = [
  [[23.55, 35.6], [24.3, 35.35], [25.0, 35.42], [25.75, 35.3], [26.3, 35.27], [26.15, 35.0], [25.4, 34.98], [24.7, 34.93], [24.0, 35.1], [23.55, 35.3]],
  [[32.3, 34.75], [32.9, 34.65], [33.6, 34.85], [34.05, 34.98], [34.6, 35.7], [33.9, 35.4], [33.0, 35.4], [32.4, 35.15]],
  [[27.7, 36.15], [28.2, 36.45], [28.25, 36.1], [27.75, 35.9]],
];
const RED_SEA = [[32.55, 29.97], [32.4, 29.7], [32.6, 29.2], [32.75, 28.85], [33.2, 28.25], [33.6, 27.75], [33.95, 27.2], [34.3, 26.55], [34.65, 26.0],
  [35.05, 25.3], [35.5, 24.4], [35.65, 23.9], [36.3, 22.9], [37.5, 22.0], [39, 22], [39, 24.6], [37.2, 25.0], [36.5, 26.0], [35.6, 27.3], [35.2, 27.9],
  [34.8, 28.1], [34.85, 28.7], [35.0, 29.4], [34.95, 29.53], [34.9, 29.5], [34.6, 28.9], [34.45, 28.3], [34.25, 27.75], [33.95, 27.95], [33.55, 28.35],
  [33.15, 28.95], [32.75, 29.55], [32.6, 29.95]];
const NILE = [[31.25, 30.05], [31.2, 29.5], [31.1, 29.0], [30.85, 28.5], [30.75, 28.1], [30.85, 27.7], [31.2, 27.2], [31.5, 26.9], [31.8, 26.5],
  [32.25, 26.15], [32.7, 26.15], [32.75, 25.9], [32.62, 25.68], [32.55, 25.3], [32.88, 24.95], [32.95, 24.5], [LON_S, LAT_S], [32.9, 23.6], [32.6, 23.0], [31.9, 22.2]];
const DELTA = [[[31.25, 30.05], [30.9, 30.6], [30.5, 31.0], [30.37, 31.45]], [[31.25, 30.05], [31.3, 30.6], [31.6, 31.1], [31.82, 31.5]]];
const CITY = {
  cyrene: [21.86, 32.82], athens: [23.73, 37.98], alexandria: [LON_A, LAT_A], syene: [LON_S, LAT_S], rhodes: [28.22, 36.44],
};
const MAPF = { x: 110, y: 168, w: 860, h: 776 };
const MED = { lon: 27.8, lat: 32.45, s: 53.5 }, EGYPT = { lon: 31.4, lat: 27.45, s: 92 };
const viewLerp = (a, b, f) => ({ lon: lerp(a.lon, b.lon, f), lat: lerp(a.lat, b.lat, f), s: lerp(a.s, b.s, f) });
const KX = Math.cos(30 * DEG);
function proj(v, lon, lat) { return [MAPF.x + MAPF.w / 2 + (lon - v.lon) * v.s * KX, MAPF.y + MAPF.h / 2 - (lat - v.lat) * v.s]; }
function path(v, pts, close = true) {
  ctx.beginPath();
  pts.forEach(([lo, la], i) => { const [x, y] = proj(v, lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  if (close) ctx.closePath();
}
/** The map frame with land, sea, islands and the Nile; fn(v) draws on top, clipped to the frame. */
function drawMap(v, fn) {
  ctx.save();
  rrect(MAPF.x, MAPF.y, MAPF.w, MAPF.h, 18); ctx.fillStyle = 'rgba(214,176,108,0.30)'; ctx.fill();
  ctx.clip();
  // land everywhere, then the seas cut out in blue
  ctx.fillStyle = C.land; ctx.fillRect(MAPF.x, MAPF.y, MAPF.w, MAPF.h);
  path(v, COAST); ctx.fillStyle = 'rgba(236,228,206,0.7)'; ctx.fill(); ctx.fillStyle = C.sea; ctx.fill();
  path(v, RED_SEA); ctx.fillStyle = 'rgba(236,228,206,0.7)'; ctx.fill(); ctx.fillStyle = C.sea; ctx.fill();
  // wave hatching on the sea
  ctx.save(); path(v, COAST); ctx.clip();
  ctx.strokeStyle = 'rgba(22,58,117,0.28)'; ctx.lineWidth = 1.6;
  for (let yy = MAPF.y + 20; yy < MAPF.y + MAPF.h; yy += 34) for (let xx = MAPF.x + ((yy / 34) % 2) * 30; xx < MAPF.x + MAPF.w; xx += 60) {
    ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 8, yy - 6, xx + 16, yy); ctx.quadraticCurveTo(xx + 24, yy + 6, xx + 32, yy); ctx.stroke();
  }
  ctx.restore();
  ctx.lineJoin = 'round';
  for (const isl of ISLANDS) { path(v, isl); ctx.fillStyle = 'rgba(214,170,96,0.75)'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
  path(v, COAST.slice(1, -2), false); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6; ctx.stroke();
  path(v, RED_SEA.slice(0, 13), false); ctx.stroke(); path(v, RED_SEA.slice(16), false); ctx.stroke();
  // the Nile
  const nw = 2 + v.s / 30;
  ctx.strokeStyle = C.blue; ctx.lineCap = 'round'; ctx.lineWidth = nw;
  path(v, NILE, false); ctx.stroke();
  ctx.lineWidth = nw * 0.75;
  for (const d of DELTA) { path(v, d, false); ctx.stroke(); }
  fn?.(v);
  ctx.restore();
  rrect(MAPF.x, MAPF.y, MAPF.w, MAPF.h, 18); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  rrect(MAPF.x + 9, MAPF.y + 9, MAPF.w - 18, MAPF.h - 18, 11); ctx.strokeStyle = C.terra; ctx.lineWidth = 2; ctx.stroke();
}
function mapCaption(a = 1) { A(a, () => chip('simplified map', MAPF.x + MAPF.w - 24, MAPF.y + MAPF.h - 36, { size: 32, weight: 500, color: C.inkSoft, align: 'right' })); }
/** A city: a black-figure dot and a label. */
function city(v, key, name, { a = 1, side = 'right', dy = 0, pulse = 0, size = 36, color = C.ink } = {}) {
  if (a <= 0) return;
  const [x, y] = proj(v, ...CITY[key]);
  A(a, () => {
    if (pulse > 0) { ctx.strokeStyle = `rgba(180,83,42,${0.6 * pulse})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 14 + 16 * (1 - pulse), 0, TAU); ctx.stroke(); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
    const lx = side === 'right' ? x + 22 : side === 'left' ? x - 22 : x;
    const ly = side === 'above' ? y - 36 : side === 'below' ? y + 38 : y;
    chip(name, lx, ly + dy, { size, color, align: side === 'right' ? 'left' : side === 'left' ? 'right' : 'center' });
  });
}
/** A dashed route between two cities, bowed, drawn to fraction p. */
function route(v, a, b, p, bow = 0.18) {
  if (p <= 0) return;
  const [x0, y0] = proj(v, ...CITY[a]), [x1, y1] = proj(v, ...CITY[b]);
  const mx = (x0 + x1) / 2 - (y1 - y0) * bow, my = (y0 + y1) / 2 + (x1 - x0) * bow;
  ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0);
  const n = 40;
  for (let i = 1; i <= Math.round(n * p); i++) { const u = i / n; ctx.lineTo((1 - u) ** 2 * x0 + 2 * u * (1 - u) * mx + u * u * x1, (1 - u) ** 2 * y0 + 2 * u * (1 - u) * my + u * u * y1); }
  ctx.stroke(); ctx.setLineDash([]);
}

// ---------- the Earth and its rays ----------
/** The Earth as a compass-drawn circle, drawn to fraction p. */
function earth(cx, cy, r, p = 1, wash = 1) {
  if (p <= 0) return;
  A(wash * seg(p, 0.8, 1), () => {
    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.05, cx, cy, r);
    g.addColorStop(0, 'rgba(246,230,192,0.75)'); g.addColorStop(1, 'rgba(196,140,52,0.30)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke();
}
/** The compass that draws a circle: legs from the centre to the pen at angle ang. */
function compass(cx, cy, r, ang, a = 1) {
  A(a, () => {
    const px = cx + r * Math.cos(ang), py = cy + r * Math.sin(ang);
    const mx = (cx + px) / 2, my = (cy + py) / 2, nx = Math.sin(ang), ny = -Math.cos(ang);
    const hinge = [mx + nx * r * 0.36, my + ny * r * 0.36];
    ctx.strokeStyle = C.ink; ctx.lineCap = 'round';
    ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(...hinge); ctx.lineTo(px, py); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.strokeStyle = C.terra; ctx.beginPath(); ctx.moveTo(lerp(cx, hinge[0], 0.15), lerp(cy, hinge[1], 0.15)); ctx.lineTo(lerp(cx, hinge[0], 0.85), lerp(cy, hinge[1], 0.85)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(hinge[0], hinge[1], 12, 0, TAU); ctx.fill();
    ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(hinge[0], hinge[1], 5, 0, TAU); ctx.fill();
  });
}
/**
 * The geometry: the Earth (centre cx,cy, radius r), Syene at the top and Alexandria th degrees round to the
 * left, vertical sunlight, the two sticks and their lines to the centre, and the two equal angles.
 * show: { rays, syene, alex, extS, extA, angA, z, angC, arc } each 0..1.
 */
function geometry(t, cx, cy, r, th, show) {
  const L = r * 0.26, top = cy - r - r * 0.62;
  const S = [cx, cy - r], Al = [cx - r * Math.sin(th * DEG), cy - r * Math.cos(th * DEG)];
  const out = [-Math.sin(th * DEG), -Math.cos(th * DEG)];
  const SA = [S[0], S[1] - L], AA = [Al[0] + out[0] * L, Al[1] + out[1] * L];
  // parallel sunlight, falling straight down the page
  if (show.rays > 0) A(show.rays, () => {
    for (let i = -6; i <= 6; i++) {
      const x = cx + i * r * 0.17;
      if (Math.abs(x - cx) > r * 1.02) continue;
      const hit = cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
      line(x, top, x, lerp(top, hit, eout(show.rays)), 1, { color: C.goldSoft, width: 3, dash: [12, 10], offset: -t * 30 });
    }
    // the two rays that matter, solid: down the Syene stick, and onto the Alexandria stick's tip
    line(S[0], top, S[0], lerp(top, SA[1], eout(show.rays)), 1, { color: C.gold, width: 5 });
    line(AA[0], top, AA[0], lerp(top, AA[1], eout(show.rays)), 1, { color: C.gold, width: 5 });
  });
  // the arc between the cities
  if (show.arc > 0) {
    ctx.strokeStyle = C.terra; ctx.lineWidth = 12; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2 - th * DEG * eout(show.arc), -Math.PI / 2); ctx.stroke();
  }
  // lines from the sticks to the centre
  if (show.extS > 0) line(S[0], S[1], cx, cy, eio(show.extS), { color: C.ink, width: 3, dash: [10, 9] });
  if (show.extA > 0) line(Al[0], Al[1], cx, cy, eio(show.extA), { color: C.ink, width: 3, dash: [10, 9] });
  // the Z of alternate angles
  if (show.z > 0) A(show.z, () => {
    ctx.strokeStyle = 'rgba(31,79,156,0.85)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(AA[0], AA[1] - r * 0.45); ctx.lineTo(AA[0], AA[1]); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - r * 0.62); ctx.stroke();
  });
  if (show.angA > 0) A(show.angA, () => {
    wedge(AA[0], AA[1], r * 0.4, -Math.PI / 2 - th * DEG * eout(show.angA), -Math.PI / 2);
  });
  if (show.angC > 0) A(show.angC, () => {
    wedge(cx, cy, r * 0.4, -Math.PI / 2 - th * DEG * eout(show.angC), -Math.PI / 2);
    cross(cx, cy, 9);
  });
  // the sticks
  if (show.syene > 0) A(show.syene, () => stick(S[0], S[1], S[0], lerp(S[1], SA[1], eout(show.syene)), 9));
  if (show.alex > 0) A(show.alex, () => stick(Al[0], Al[1], lerp(Al[0], AA[0], eout(show.alex)), lerp(Al[1], AA[1], eout(show.alex)), 9));
  return { S, Al, SA, AA, top };
}

// ---------- layers ----------
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.6) c = ch; return c; }
function background(t) {
  if (!PAPYRUS) PAPYRUS = makePapyrus();
  ctx.drawImage(PAPYRUS, 0, 0);
  const on = eout(seg(t, 0.1, 1.2));
  A(on, () => {
    txt('RECKON', 96, 84, { size: 32, family: DISPLAY, weight: 700, color: C.terraDeep, spacing: '6px' });
    const w = textW('RECKON', { size: 32, family: DISPLAY, weight: 700, spacing: '6px' });
    txt('HISTORY · ANCIENT SCIENCE', 96 + w + 26, 85, { size: 32, weight: 700, color: C.inkSoft, spacing: '3px' });
    const ch = chapterAt(t);
    if (ch && t < e('z1', -0.5)) A(seg(t, ch.at + 2.6, ch.at + 3.6) * (1 - seg(t, s('z1', -1.0), s('z1', -0.4))), () => {
      txt(`PART ${ROMAN[ch.n]} · ${ch.title.toUpperCase()}`, 1824, 85, { size: 32, weight: 700, color: C.inkSoft, align: 'right', spacing: '2px' });
    });
    // two thin rules at the foot
    ctx.fillStyle = C.ink; ctx.fillRect(96, 964, W - 192, 3); ctx.fillStyle = C.terra; ctx.fillRect(96, 971, W - 192, 2);
  });
  meander(96, W - 96, 114, 28, on);
}

// ---------- title cards ----------
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.5, 0.6);
    if (a <= 0) continue;
    A(a * 0.5, () => { ctx.fillStyle = '#2A1A0C'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      ctx.save(); ctx.translate(W / 2, 540 + (1 - p) * 26);
      glazePanel(1260, 380);
      txt(`PART ${ROMAN[ch.n]}`, 0, -70, { size: 44, family: DISPLAY, weight: 700, color: C.terraLight, align: 'center', spacing: '12px' });
      let size = 88;
      while (textW(ch.title.toUpperCase(), { size, family: DISPLAY, weight: 700, spacing: '4px' }) > 1080) size -= 4;
      txt(ch.title.toUpperCase(), 0, 30, { size, family: DISPLAY, weight: 700, color: C.glazeText, align: 'center', spacing: '4px' });
      ctx.restore();
    });
  }
}
/** A black-glaze panel with terracotta meander bands, centred on the origin. */
function glazePanel(bw, bh) {
  rrect(-bw / 2, -bh / 2, bw, bh, 26);
  const bg = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2); bg.addColorStop(0, '#2A1D14'); bg.addColorStop(1, C.glaze);
  ctx.fillStyle = bg; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = C.terra; ctx.stroke();
  meander(-bw / 2 + 30, bw / 2 - 30, -bh / 2 + 26, 30);
  meander(-bw / 2 + 30, bw / 2 - 30, bh / 2 - 56, 30);
}

// ---------- 0: cold open ----------
const OPEN = { cx: 560, cy: 556, r: 300 };
function emblem(kind, x, y, a, t) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y);
    if (kind === 'shadow') {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; line(-50, 34, 50, 34, 1, { width: 4 });
      ctx.strokeStyle = 'rgba(34,23,15,0.8)'; ctx.lineWidth = 9; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(-34, 30); ctx.stroke();
      stick(0, 34, 0, -40, 7);
      line(30, -60, -34, 30, 1, { color: C.gold, width: 3.5, dash: [8, 7], offset: -t * 20 });
    } else if (kind === 'distance') {
      line(-52, 0, 52, 0, 1, { color: C.terraDeep, width: 4, dash: [10, 8] });
      for (const xx of [-56, 56]) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(xx, 0, 10, 0, TAU); ctx.fill(); ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(xx, 0, 4, 0, TAU); ctx.fill(); }
      line(-56, 26, 56, 26, 1, { width: 2.5 }); line(-56, 18, -56, 34, 1, { width: 2.5 }); line(56, 18, 56, 34, 1, { width: 2.5 });
    } else {
      line(-50, 36, 50, 36, 1, { width: 4 }); line(-50, 36, 40, -38, 1, { width: 4 });
      wedge(-50, 36, 54, -Math.atan2(74, 90), 0);
    }
    ctx.restore();
  });
}
function partOpen(t) {
  const { cx, cy, r } = OPEN;
  const draw = eio(seg(t, s('o1', 0.3), s('o1', 3.6)));
  earth(cx, cy, r, draw);
  A(span(t, s('o1', 0.2), s('o1', 4.1), 0.3, 0.5), () => compass(cx, cy, r, -Math.PI / 2 + draw * TAU));
  // the 50 arcs of the answer, laid round the Earth
  const arcs = seg(t, s('o3', 0.1), e('o3', 0.6));
  if (arcs > 0) for (let i = 0; i < 50; i++) {
    const p = clamp(arcs * 50 - i);
    if (p <= 0) break;
    const a0 = -Math.PI / 2 - i * ANGLE * DEG;
    ctx.strokeStyle = i % 2 ? C.ink : C.terra; ctx.lineWidth = 16; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, r + 14, a0 - ANGLE * DEG * p, a0); ctx.stroke();
  }
  // right column
  const X = 1060;
  A(span(t, s('o1', 0.6), s('o3', 0.1), 0.5, 0.5), () => {
    txt('AROUND 240 BC', X, 300, { size: 64, family: DISPLAY, weight: 700, color: C.terraDeep, spacing: '3px' });
    txt('Alexandria, Egypt', X, 370, { size: 44, weight: 500, color: C.inkSoft });
  });
  const ems = [['shadow', 'A SHADOW'], ['distance', 'A DISTANCE'], ['angle', 'GEOMETRY']];
  ems.forEach(([kind, name], i) => {
    const a = eout(seg(t, mid('o2', 0.18 + i * 0.26), mid('o2', 0.18 + i * 0.26) + 0.6)) * (1 - seg(t, s('o3', -0.2), s('o3', 0.4)));
    const y = 500 + i * 140;
    emblem(kind, X + 70, y, a, t);
    A(a, () => txt(name, X + 170, y, { size: 52, family: DISPLAY, weight: 700, color: C.ink, spacing: '3px' }));
  });
  const num = eout(seg(t, s('o3', 0.3), s('o3', 1.1)));
  A(num * (1 - seg(t, s('o5', 0.2), s('o5', 0.8))), () => {
    txt(fmt(TOTAL), X, 470 + (1 - num) * 20, { size: 130, family: DISPLAY, weight: 700, color: C.ink });
    txt('STADIA AROUND THE EARTH', X + 6, 580, { size: 44, weight: 800, color: C.terraDeep, spacing: '3px' });
  });
  const q = eout(seg(t, s('o4', 0.2), s('o4', 0.9)));
  A(q * (1 - seg(t, s('o5', 0.2), s('o5', 0.8))), () => {
    txt('= ? km', X + 6, 700, { size: 96, family: DISPLAY, weight: 700, color: C.blue });
    txt('how long was a stadion?', X + 10, 790, { size: 40, weight: 500, color: C.inkSoft });
  });
  // the title
  const ti = eout(seg(t, mid('o5', 0.45), mid('o5', 0.45) + 1.0));
  A(ti, () => {
    ctx.fillStyle = 'rgba(236,219,178,0.93)'; ctx.fillRect(0, 150, W, 810);
    sunDisc(W / 2, 330, 46, 1, t * 0.12);
    for (let i = -5; i <= 5; i++) line(W / 2 + i * 90, 400, W / 2 + i * 90, 470, ti, { color: C.goldSoft, width: 3, dash: [10, 8], offset: -t * 24 });
    txt('ERATOSTHENES', W / 2, 560 + (1 - ti) * 16, { size: 128, family: DISPLAY, weight: 700, align: 'center', spacing: '10px' });
    txt('MEASURING THE EARTH WITH A SHADOW', W / 2, 680, { size: 48, weight: 800, color: C.terraDeep, align: 'center', spacing: '6px' });
    meander(W / 2 - 520, W / 2 + 520, 740, 30, ti);
  });
}

// ---------- 1: the librarian ----------
function partLibrarian(t) {
  const v = MED;
  const mapA = 1 - seg(t, s('l8', -0.2), s('l8', 0.6));
  A(mapA, () => drawMap(v, () => {
    route(v, 'cyrene', 'athens', eio(seg(t, s('l2', 0.2), mid('l2', 0.5))), -0.2);
    route(v, 'athens', 'alexandria', eio(seg(t, mid('l2', 0.55), e('l2', 0.2))), -0.15);
    city(v, 'cyrene', 'Cyrene', { a: eout(seg(t, s('l1', 0.3), s('l1', 1.0))), side: 'below', pulse: span(t, s('l1', 0.6), e('l1'), 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 4)) });
    city(v, 'athens', 'Athens', { a: eout(seg(t, s('l2', 0.4), s('l2', 1.1))), side: 'right' });
    city(v, 'alexandria', 'Alexandria', { a: eout(seg(t, mid('l2', 0.7), e('l2'))), side: 'below', dy: 10 });
    const lib = eout(seg(t, s('l3', 0.3), s('l3', 1.1)));
    if (lib > 0) { const [x, y] = proj(v, ...CITY.alexandria); temple(x - 4, y - 26, 84, lib); }
  }));
  A(mapA, () => mapCaption());
  // the right column: who he was
  const X = 1060;
  A(span(t, s('l1', 0.4), s('l8', 0.4), 0.6, 0.6), () => {
    txt('ERATOSTHENES', X, 230, { size: 72, family: DISPLAY, weight: 700, spacing: '4px' });
    txt('of Cyrene · born about 276 BC', X + 4, 300, { size: 40, weight: 500, color: C.inkSoft });
    const rows = [
      ['l2', 0.35, 'Years of study in Athens'],
      ['l2', 0.8, 'Called to Alexandria by Ptolemy III'],
      ['l3', 0.35, 'Head of the Library'],
      ['l4', 0.3, 'Tutor to the future king'],
    ];
    rows.forEach(([key, f, str], i) => {
      const a = eout(seg(t, mid(key, f), mid(key, f) + 0.6));
      A(a, () => {
        const y = 390 + i * 64;
        ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(X + 14, y, 7, 0, TAU); ctx.fill();
        txt(str, X + 40 + (1 - a) * 16, y, { size: 40, weight: 700 });
      });
    });
    // five subjects
    const subj = ['MATHEMATICS', 'GEOGRAPHY', 'POETRY', 'HISTORY', 'THE STARS'];
    const sa = span(t, s('l5', 0.1), s('l6', 0.2), 0.4, 0.5);
    subj.forEach((name, i) => {
      const a = eout(seg(t, mid('l5', 0.12 + i * 0.15), mid('l5', 0.12 + i * 0.15) + 0.5)) * sa;
      A(a, () => chip(name, X + 10 + (i % 3) * 252, 680 + Math.floor(i / 3) * 70, { size: 34, weight: 800, color: C.blueDeep, align: 'left', spacing: '1px' }));
    });
    // the nicknames
    const n1 = eout(seg(t, s('l6', 0.2), s('l6', 0.9)));
    A(n1, () => {
      txt('Πένταθλος', X + 10, 700, { size: 64, weight: 800, color: C.blueDeep });
      txt('Pentathlos: all-rounder', X + 14, 770, { size: 38, weight: 500, color: C.inkSoft });
    });
    const n2 = eout(seg(t, s('l7', 0.2), s('l7', 0.9)));
    A(n2, () => {
      txt('Β', X + 520, 715, { size: 120, weight: 800, color: C.terraDeep });
      txt('Beta: second best', X + 520, 800, { size: 38, weight: 500, color: C.inkSoft });
    });
  });
  // the round Earth: an eclipse, the southern stars, and Aristotle's figure
  const ecl = span(t, s('l8', 0.2), s('l10', 0.2), 0.7, 0.6);
  A(ecl, () => eclipse(t, eout(seg(t, s('l9', 0.2), mid('l9', 0.8)))));
  const stars = span(t, s('l10', -0.1), s('l12', 0.4), 0.6, 0.6);
  A(stars, () => southernStar(t, eout(seg(t, s('l10', 0.3), mid('l10', 0.8)))));
  A(span(t, s('l8', 0.9), e('l12', 2), 0.6, 0.6), () => {
    txt('THE EARTH IS ROUND', 1060, 250, { size: 56, family: DISPLAY, weight: 700, spacing: '3px' });
    txt('known before Eratosthenes', 1064, 312, { size: 40, weight: 500, color: C.inkSoft });
    const r1 = eout(seg(t, s('l9', 0.3), s('l9', 1.0)));
    A(r1, () => { mark(true, 1084, 412, 40, r1); txt('a round shadow on the Moon', 1130, 412, { size: 42, weight: 700 }); });
    const r2 = eout(seg(t, s('l10', 0.3), s('l10', 1.0)));
    A(r2, () => { mark(true, 1084, 486, 40, r2); txt('stars seen in Egypt, hidden further north', 1130, 486, { size: 42, weight: 700 }); });
    const r3 = eout(seg(t, s('l11', 0.3), s('l11', 1.1)));
    A(r3, () => {
      txt(fmt(ARISTOTLE), 1060, 640, { size: 120, family: DISPLAY, weight: 700, color: C.inkSoft });
      txt('STADIA: A SIZE REPORTED BY ARISTOTLE', 1066, 735, { size: 38, weight: 800, color: C.terraDeep, spacing: '2px' });
    });
    const r4 = eout(seg(t, s('l12', 0.2), s('l12', 0.9)));
    A(r4, () => txt('Can it be measured?', 1064, 840, { size: 52, weight: 800, color: C.blueDeep }));
  });
}
function eclipse(t, p) {
  const y = 520;
  sunDisc(220, y, 54, 1, t * 0.1);
  // the shadow cone behind the Earth
  ctx.fillStyle = 'rgba(34,23,15,0.22)';
  ctx.beginPath(); ctx.moveTo(520, y - 120); ctx.lineTo(980, y - 70); ctx.lineTo(980, y + 70); ctx.lineTo(520, y + 120); ctx.closePath(); ctx.fill();
  earth(520, y, 120, 1);
  txt('Earth', 520, y + 168, { size: 36, weight: 800, align: 'center' });
  // the Moon passing into the shadow; the edge of the shadow on it is an arc
  const mx = lerp(1010, 925, p), mr = 70;
  ctx.save(); ctx.beginPath(); ctx.arc(mx, y - 34, mr, 0, TAU); ctx.clip();
  ctx.fillStyle = '#F6EBCB'; ctx.fillRect(mx - mr, y - 34 - mr, 2 * mr, 2 * mr);
  ctx.fillStyle = 'rgba(70,40,20,0.78)'; ctx.beginPath(); ctx.arc(760, y, 160, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, y - 34, mr, 0, TAU); ctx.stroke();
  chip('Moon', mx, y - 150, { size: 36 });
  A(seg(p, 0.6, 1), () => chip('the shadow’s edge is curved', 560, 780, { size: 36, color: C.terraDeep }));
  chip('diagram, not to scale', 200, 900, { size: 32, weight: 500, color: C.inkSoft, align: 'left' });
}
function southernStar(t, p) {
  const cx = 430, cy = 540, r = 220;
  earth(cx, cy, r, 1);
  // two observers, further north (40 degrees) and in Egypt (25 degrees); a star lies low in the southern sky
  const dir = [Math.cos(50 * DEG), Math.sin(50 * DEG)];               // towards the star, screen coordinates
  const starPos = [cx + dir[0] * 560, cy + dir[1] * 300];
  for (const [phi, name, sees] of [[58, 'further north', false], [14, 'Egypt', true]]) {
    const n = [Math.cos(phi * DEG), -Math.sin(phi * DEG)], P = [cx + r * n[0], cy + r * n[1]];
    const tg = [-n[1], n[0]];
    line(P[0] - tg[0] * 130, P[1] - tg[1] * 130, P[0] + tg[0] * 130, P[1] + tg[1] * 130, 1, { color: C.inkSoft, width: 3 });
    const l0 = (starPos[0] - P[0]) * dir[0] + (starPos[1] - P[1]) * dir[1];
    const S0 = [P[0] + dir[0] * l0, P[1] + dir[1] * l0];
    // the starlight reaches the Egyptian observer above the horizon; further north, the Earth is in the way
    const nd = n[0] * dir[0] + n[1] * dir[1];
    const lHit = sees ? 0 : -2 * r * nd;
    const E = [P[0] + dir[0] * lHit, P[1] + dir[1] * lHit];
    line(S0[0], S0[1], E[0], E[1], eout(p), { color: C.gold, width: 4, dash: [12, 9], offset: -t * 26 });
    if (!sees) A(seg(p, 0.8, 1), () => mark(false, E[0] + 4, E[1] - 30, 40, seg(p, 0.8, 1)));
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(P[0], P[1], 9, 0, TAU); ctx.fill();
    chip(name, P[0] + 26, P[1] + (sees ? 34 : -36), { size: 34, align: 'left' });
  }
  star(starPos[0], starPos[1], 26, C.gold);
  A(seg(p, 0.5, 1), () => chip('a southern star', starPos[0] + 46, starPos[1] - 10, { size: 34, color: C.terraDeep, align: 'left' }));
  chip('diagram, not to scale', 120, 920, { size: 32, weight: 500, color: C.inkSoft, align: 'left' });
}

// ---------- 2: noon at Syene ----------
function sceneBox(x, y, w, h, title, fn) {
  panel(x, y, w, h);
  ctx.save(); rrect(x + 9, y + 9, w - 18, h - 18, 10); ctx.clip(); fn(); ctx.restore();
  txt(title, x + 30, y + 46, { size: 36, family: DISPLAY, weight: 700, color: C.terraDeep, spacing: '2px' });
}
/** A ground scene: stick, sunlight at angle th (degrees from overhead), a shadow, optionally a well. */
function groundScene(t, x, y, w, h, th, o = {}) {
  const ground = y + h - (o.well ? 200 : 140), sx = x + w * (o.well ? 0.36 : 0.55), sh = Math.min(240, h * 0.42);
  ctx.fillStyle = 'rgba(180,83,42,0.18)'; ctx.fillRect(x, ground, w, h);
  const dx = Math.sin(th * DEG), dy = Math.cos(th * DEG);
  const ra = o.rays ?? 1;
  if (ra > 0) A(ra, () => {
    for (let i = -8; i <= 8; i++) {
      const gx = sx - sh * Math.tan(th * DEG) + i * 56, L = (ground - y - 70) / dy;
      line(gx + dx * L, ground - dy * L, gx, ground, eout(ra), { color: C.goldSoft, width: 3, dash: [10, 9], offset: -t * 26 });
    }
  });
  line(x + 10, ground, x + w - 10, ground, 1, { width: 3.5 });
  if (o.well) {
    const wx = x + w * 0.72, ww = 64, wd = 120;
    ctx.fillStyle = '#5A3A1E'; ctx.fillRect(wx - ww / 2, ground, ww, wd);
    const lit = o.lit ?? 0;
    ctx.fillStyle = C.blue; ctx.fillRect(wx - ww / 2, ground + wd - 24, ww, 24);
    if (lit > 0) A(lit, () => {
      const g = ctx.createLinearGradient(0, ground, 0, ground + wd);
      g.addColorStop(0, 'rgba(255,214,120,0.35)'); g.addColorStop(1, 'rgba(255,214,120,0.85)');
      ctx.fillStyle = g; ctx.fillRect(wx - ww / 2 + 6, ground, ww - 12, wd - 24);
      ctx.fillStyle = '#FFE9A8'; ctx.beginPath(); ctx.ellipse(wx, ground + wd - 14, 20, 6, 0, 0, TAU); ctx.fill();
    });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(wx - ww / 2, ground, ww, wd);
    ctx.fillStyle = C.ink; ctx.fillRect(wx - ww / 2 - 10, ground - 8, 12, 8); ctx.fillRect(wx + ww / 2 - 2, ground - 8, 12, 8);
  }
  if (th > 0 && (o.shadow ?? 1) > 0) {
    const L = sh * Math.tan(th * DEG) * eout(o.shadow ?? 1);
    ctx.strokeStyle = 'rgba(34,23,15,0.85)'; ctx.lineWidth = 12; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(sx, ground - 6); ctx.lineTo(sx - L, ground - 6); ctx.stroke();
  }
  stick(sx, ground, sx, ground - sh * eout(o.stick ?? 1), 9);
  return { ground, sx, sh };
}
function partSyene(t) {
  const zoom = eio(seg(t, s('m1', 0.0), s('m1', 2.6)));
  const v = viewLerp(MED, EGYPT, zoom);
  const flat = span(t, s('m8', -0.3), e('m10', 3), 0.7, 0.6);
  A(1 - flat, () => {
    drawMap(v, () => {
      city(v, 'syene', 'Syene (Aswan)', { a: eout(seg(t, mid('m1', 0.45), mid('m1', 0.45) + 0.7)), side: 'left', pulse: span(t, mid('m1', 0.5), e('m6'), 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 4)) });
      city(v, 'alexandria', 'Alexandria', { a: eout(seg(t, s('m7', 0.2), s('m7', 0.9))), side: 'left', pulse: span(t, s('m7', 0.4), e('m7', 0.6), 0.4, 0.6) * (0.5 + 0.5 * Math.sin(t * 4)) });
      // the tropic as Cleomedes takes it: through Syene
      const tr = eout(seg(t, s('m6', 0.3), s('m6', 1.4)));
      if (tr > 0) {
        const [x0, y0] = proj(v, 25, LAT_S), [x1] = proj(v, 37, LAT_S);
        line(x0, y0, lerp(x0, x1, tr), y0, 1, { color: C.terraDeep, width: 4, dash: [16, 10] });
        A(seg(tr, 0.5, 1), () => chip('Tropic of Cancer, as assumed', MAPF.x + 40, y0 + 46, { size: 32, color: C.terraDeep, align: 'left' }));
      }
      const d = eout(seg(t, s('m7', 0.8), mid('m7', 0.75)));
      if (d > 0) {
        const [ax, ay] = proj(v, ...CITY.alexandria), [sx, sy] = proj(v, ...CITY.syene);
        line(ax, ay, lerp(ax, sx, d), lerp(ay, sy, d), 1, { color: C.terraDeep, width: 5, dash: [14, 10] });
        A(seg(d, 0.6, 1), () => chip('about 5,000 stadia', lerp(ax, sx, 0.5) + 30, lerp(ay, sy, 0.5), { size: 36, color: C.terraDeep, align: 'left' }));
      }
    });
    mapCaption();
  });
  // the right column: what happens at Syene at noon on the solstice
  const X = 1040, Wd = 784;
  A(span(t, s('m2', 0.1), s('m6', 0.2), 0.6, 0.6) * (1 - flat), () => {
    sceneBox(X, 176, Wd, 560, 'SYENE · MIDSUMMER NOON', () => {
      const sun = eout(seg(t, s('m3', 0.2), s('m3', 1.0)));
      sunDisc(X + Wd * 0.36, 272, 30, sun, t * 0.1);
      groundScene(t, X, 176, Wd, 560, 0, { well: true, rays: eout(seg(t, s('m3', 0.5), s('m3', 1.6))), lit: eout(seg(t, mid('m4', 0.4), mid('m4', 0.9))) });
    });
    A(eout(seg(t, mid('m3', 0.55), mid('m3', 0.55) + 0.6)), () => chip('no shadow', X + Wd * 0.36, 600, { size: 40, color: C.terraDeep }));
    A(eout(seg(t, mid('m4', 0.6), mid('m4', 0.6) + 0.6)), () => chip('sunlit to the water', X + Wd * 0.72, 700, { size: 36, color: C.blueDeep }));
    A(eout(seg(t, s('m5', 0.1), s('m5', 0.8))), () => {
      txt('The Sun is straight overhead.', X + 10, 800, { size: 48, weight: 800 });
    });
  });
  // the tropic on a globe
  A(span(t, s('m6', 0.1), s('m7', 0.6), 0.6, 0.6) * (1 - flat), () => {
    const gx = X + 300, gy = 520, gr = 230;
    earth(gx, gy, gr, 1);
    const tropic = 23.7 * DEG;
    ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, gr, 0, TAU); ctx.clip();
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.16, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 4; ctx.setLineDash([14, 9]);
    ctx.beginPath(); ctx.ellipse(gx, gy - gr * Math.sin(tropic), gr * Math.cos(tropic), gr * 0.16 * Math.cos(tropic), 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    const P = [gx + gr * Math.cos(tropic), gy - gr * Math.sin(tropic)];
    const n = [Math.cos(tropic), -Math.sin(tropic)], tg = [Math.sin(tropic), Math.cos(tropic)];
    for (let i = -3; i <= 3; i++) {
      const o = i * 38, hit = Math.sqrt(gr * gr - o * o);
      line(gx + n[0] * (gr + 250) + tg[0] * o, gy + n[1] * (gr + 250) + tg[1] * o, gx + n[0] * hit + tg[0] * o, gy + n[1] * hit + tg[1] * o, 1, { color: i ? C.goldSoft : C.gold, width: i ? 3 : 5, dash: i ? [10, 8] : null, offset: -t * 24 });
    }
    sunDisc(gx + n[0] * (gr + 290), gy + n[1] * (gr + 290), 30, 1, t * 0.1);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(P[0], P[1], 9, 0, TAU); ctx.fill();
    chip('Tropic of Cancer', P[0] - 16, P[1] + 44, { size: 36, color: C.terraDeep, align: 'right' });
    txt('the Sun overhead at its furthest north', X + 10, 840, { size: 40, weight: 700, color: C.inkSoft });
  });
  // two noons side by side
  A(span(t, s('m7', 0.4), s('m8', 0.0), 0.6, 0.6) * (1 - flat), () => {
    const w2 = 380;
    sceneBox(X, 176, w2, 600, 'SYENE', () => groundScene(t, X, 176, w2, 600, 0, { rays: 1 }));
    sceneBox(X + w2 + 24, 176, w2, 600, 'ALEXANDRIA', () => groundScene(t, X + w2 + 24, 176, w2, 600, ANGLE * 3, { rays: 1, shadow: eout(seg(t, mid('m7', 0.6), mid('m7', 0.6) + 0.8)) }));
    txt('no shadow', X + w2 / 2, 820, { size: 40, weight: 800, align: 'center', color: C.terraDeep });
    A(eout(seg(t, mid('m7', 0.7), mid('m7', 0.7) + 0.6)), () => txt('a shadow', X + w2 * 1.5 + 24, 820, { size: 40, weight: 800, align: 'center', color: C.terraDeep }));
    chip('angle enlarged', X + w2 * 1.5 + 24, 900, { size: 32, weight: 500, color: C.inkSoft });
  });
  // flat or curved?
  A(flat, () => flatOrCurved(t));
}
function flatOrCurved(t) {
  const L = { x: 110, w: 820 }, R = { x: 990, w: 820 };
  const top = 230;
  // flat ground: equal shadows
  const fa = eout(seg(t, s('m8', 0.1), s('m8', 0.9)));
  A(fa, () => {
    txt('IF THE EARTH WERE FLAT', L.x + L.w / 2, 200, { size: 46, family: DISPLAY, weight: 700, align: 'center', spacing: '2px' });
    const g = 720, th = 14 * DEG;
    for (let i = -7; i <= 7; i++) { const x = L.x + 80 + i * 60 + 200; line(x + Math.tan(th) * (g - top - 40), top + 40, x, g, 1, { color: C.goldSoft, width: 3, dash: [10, 9], offset: -t * 26 }); }
    ctx.fillStyle = 'rgba(180,83,42,0.18)'; ctx.fillRect(L.x + 20, g, L.w - 40, 120);
    line(L.x + 20, g, L.x + L.w - 20, g, 1, { width: 4 });
    for (const x of [L.x + 230, L.x + 600]) {
      const sh = 220 * Math.tan(th) * eout(seg(t, mid('m8', 0.4), mid('m8', 0.8)));
      ctx.strokeStyle = 'rgba(34,23,15,0.85)'; ctx.lineWidth = 12; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x, g - 6); ctx.lineTo(x - sh, g - 6); ctx.stroke();
      stick(x, g, x, g - 220, 9);
    }
    A(seg(t, mid('m8', 0.7), mid('m8', 0.95)), () => txt('the same shadow everywhere', L.x + L.w / 2, 800, { size: 40, weight: 800, align: 'center', color: C.terraDeep }));
  });
  // curved ground: different shadows
  const ca = eout(seg(t, s('m9', 0.1), s('m9', 0.9)));
  A(ca, () => {
    txt('A CURVED EARTH', R.x + R.w / 2, 200, { size: 46, family: DISPLAY, weight: 700, align: 'center', spacing: '2px' });
    const cx = R.x + R.w / 2, cy = 1400, rr = 760;
    for (let i = -7; i <= 7; i++) { const x = cx + i * 60; const hit = cy - Math.sqrt(rr * rr - (x - cx) ** 2); line(x, top + 40, x, hit, 1, { color: C.goldSoft, width: 3, dash: [10, 9], offset: -t * 26 }); }
    ctx.save(); ctx.beginPath(); ctx.rect(R.x, 160, R.w, 800); ctx.clip();
    ctx.fillStyle = 'rgba(180,83,42,0.18)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    ctx.restore();
    const curve = eout(seg(t, s('m9', 0.5), s('m9', 1.5)));
    for (const [ang, shadow] of [[0, false], [-18, true]]) {
      const a = (-90 + ang) * DEG, Pb = [cx + rr * Math.cos(a), cy + rr * Math.sin(a)], Pt = [cx + (rr + 220) * Math.cos(a), cy + (rr + 220) * Math.sin(a)];
      if (shadow) {
        // the shadow of the tip, along the ground, from the vertical rays
        const sh = 220 * Math.tan(Math.abs(ang) * DEG) * curve;
        const tang = [-Math.sin(a), Math.cos(a)];
        ctx.strokeStyle = 'rgba(34,23,15,0.85)'; ctx.lineWidth = 12; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(Pb[0] - Math.cos(a) * 6, Pb[1] - Math.sin(a) * 6); ctx.lineTo(Pb[0] - Math.cos(a) * 6 + tang[0] * sh, Pb[1] - Math.sin(a) * 6 + tang[1] * sh); ctx.stroke();
      }
      stick(Pb[0], Pb[1], Pt[0], Pt[1], 9);
    }
    A(seg(t, mid('m9', 0.6), e('m9')), () => txt('different shadows', R.x + R.w / 2, 800, { size: 40, weight: 800, align: 'center', color: C.terraDeep }));
    chip('curve exaggerated', R.x + R.w - 20, 900, { size: 32, weight: 500, color: C.inkSoft, align: 'right' });
  });
  A(eout(seg(t, s('m10', 0.3), s('m10', 1.0))), () => {
    chip('how much it curves  →  how big the Earth is', W / 2, 880, { size: 44, weight: 800, color: C.blueDeep });
  });
}

// ---------- 3: the bowl at Alexandria ----------
const BOWL = { cx: 540, cy: 560, r: 280 };
/** A scaphe in cross-section: a hemispherical bowl, its pointer and the tip's shadow at angle th (degrees). */
function scaphe(t, cx, cy, r, th, o = {}) {
  const fullC = o.full ?? 0;
  // the bowl's whole great circle, dashed, with 50 divisions
  if (fullC > 0) A(fullC, () => {
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2.5; ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, TAU); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 50; i++) {
      const a = Math.PI / 2 + i * ANGLE * DEG, len = i % 5 ? 14 : 26;
      line(cx + (r - len) * Math.cos(a), cy + (r - len) * Math.sin(a), cx + (r + len * 0.4) * Math.cos(a), cy + (r + len * 0.4) * Math.sin(a), 1, { width: i % 5 ? 2 : 3.5, color: C.ink });
    }
  });
  // the stone bowl
  ctx.fillStyle = 'rgba(214,190,150,0.85)';
  ctx.beginPath(); ctx.arc(cx, cy, r + 40, 0, Math.PI); ctx.lineTo(cx - r, cy); ctx.arc(cx, cy, r, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(120,90,50,0.12)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI); ctx.closePath(); ctx.fill();
  // sunlight at th from overhead, coming from the upper right
  const dx = -Math.sin(th * DEG), dy = Math.cos(th * DEG);
  const ra = o.rays ?? 1;
  if (ra > 0) A(ra, () => {
    const L = (cy - 190) / dy;
    for (let i = -5; i <= 5; i++) {
      const ox = cx + i * 56 / dy;
      line(ox - dx * L, cy - dy * L, ox, cy, eout(ra), { color: C.goldSoft, width: 3, dash: [10, 9], offset: -t * 26 });
    }
    line(cx - dx * L, cy - dy * L, cx, cy, eout(ra), { color: C.gold, width: 5 });
  });
  // the pointer, its tip at the centre of the bowl's sphere
  stick(cx, cy + r, cx, lerp(cy + r, cy, eout(o.stick ?? 1)), 9);
  // the shadow of the tip, on the far side of the bottom
  const sa = o.shadow ?? 1;
  if (th > 0 && sa > 0) {
    const a1 = Math.PI / 2 - th * DEG * eout(sa) * 0 + th * DEG * eout(sa) * -1;
    const end = [cx + r * Math.cos(Math.PI / 2 + th * DEG), cy + r * Math.sin(Math.PI / 2 + th * DEG)];
    A(sa, () => line(cx, cy, end[0], end[1], 1, { color: C.gold, width: 3, dash: [7, 7] }));
    // the arc from the pointer's foot to the shadow's end
    ctx.strokeStyle = C.blue; ctx.lineWidth = 18; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, r - 9, Math.PI / 2, Math.PI / 2 + th * DEG * eout(sa)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(end[0], end[1], 7 * eout(sa), 0, TAU); ctx.fill();
    void a1;
  }
}
function partBowl(t) {
  const { cx, cy, r } = BOWL;
  const ex = 1.0;                                       // the true 7.2 degrees, drawn large
  const bowlA = 1 - seg(t, s('b8', -0.2), s('b8', 0.5));
  A(bowlA, () => {
    scaphe(t, cx, cy, r, ANGLE * ex, {
      stick: eout(seg(t, s('b3', 0.1), s('b3', 1.0))),
      rays: eout(seg(t, s('b4', 0.0), s('b4', 1.0))),
      shadow: eout(seg(t, mid('b4', 0.5), e('b4', 0.3))),
      full: eout(seg(t, s('b6', 0.1), s('b6', 1.4))),
    });
    A(eout(seg(t, s('b2', 0.4), s('b2', 1.2))), () => chip('σκάφη · scaphe', cx + r + 30, cy + 70, { size: 40, color: C.terraDeep, align: 'left' }));
    A(eout(seg(t, mid('b3', 0.5), mid('b3', 0.5) + 0.6)), () => chip('pointer', cx + 26, cy + r * 0.62, { size: 34, align: 'left' }));
    A(eout(seg(t, mid('b3', 0.7), mid('b3', 0.7) + 0.6)), () => chip('tip at the centre', cx + 30, cy - 4, { size: 34, align: 'left' }));
    const arcL = eout(seg(t, mid('b5', 0.45), mid('b5', 0.45) + 0.7));
    A(arcL, () => {
      line(cx - 30, cy + r - 24, cx - 130, cy + r - 90, 1, { color: C.blueDeep, width: 3 });
      chip('the arc', cx - 140, cy + r - 100, { size: 36, color: C.blueDeep, align: 'right' });
    });
    A(eout(seg(t, s('b6', 0.6), s('b6', 1.6))), () => chip('the arc is one of 50 equal parts', cx, cy - r - 40, { size: 36, color: C.ink }));
  });
  // right column
  const X = 1080;
  A(span(t, s('b1', 0.3), s('b8', 0.0), 0.6, 0.5), () => {
    txt('AT ALEXANDRIA', X, 240, { size: 56, family: DISPLAY, weight: 700, spacing: '3px' });
    const q = eout(seg(t, s('b2', 0.4), s('b2', 1.2)));
    A(q, () => txt('the noon shadow, read in a bowl-shaped sundial', X + 4, 304, { size: 40, weight: 500, color: C.inkSoft }));
    const f = eout(seg(t, mid('b6', 0.4), mid('b6', 0.4) + 0.7));
    A(f, () => {
      txt('1/50', X, 470, { size: 150, family: DISPLAY, weight: 700, color: C.blueDeep });
      txt('OF A FULL CIRCLE', X + 8, 570, { size: 42, weight: 800, color: C.terraDeep, spacing: '3px' });
    });
    const d = eout(seg(t, s('b7', 0.1), s('b7', 0.9)));
    A(d, () => {
      txt(`360° ÷ 50 = ${ANGLE.toFixed(1)}°`, X, 700, { size: 76, family: DISPLAY, weight: 700, color: C.ink });
    });
  });
  // a stick and its noon shadow, to scale
  const sb = span(t, s('b8', 0.0), e('b9', 2), 0.6, 0.6);
  A(sb, () => {
    const g = 800, x0 = 520, hgt = 520, sh = hgt * SHADOW * eout(seg(t, s('b8', 0.4), mid('b8', 0.6)));
    ctx.fillStyle = 'rgba(180,83,42,0.18)'; ctx.fillRect(140, g, 760, 120);
    line(140, g, 900, g, 1, { width: 4 });
    for (let i = -4; i <= 6; i++) { const gx = x0 + i * 70; line(gx + Math.tan(ANGLE * DEG) * 640, g - 640, gx, g, 1, { color: C.goldSoft, width: 3, dash: [10, 9], offset: -t * 26 }); }
    ctx.strokeStyle = 'rgba(34,23,15,0.85)'; ctx.lineWidth = 14; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(x0, g - 7); ctx.lineTo(x0 - sh, g - 7); ctx.stroke();
    stick(x0, g, x0, g - hgt, 10);
    line(x0 + Math.tan(ANGLE * DEG) * hgt, g - hgt - 0, x0 - hgt * SHADOW, g, eout(seg(t, s('b8', 0.4), mid('b8', 0.6))), { color: C.gold, width: 4, dash: [9, 8] });
    A(seg(t, mid('b8', 0.5), mid('b8', 0.8)), () => {
      chip('shadow', x0 - sh / 2, g + 50, { size: 36 });
      chip('stick', x0 + 34, g - hgt / 2, { size: 36, align: 'left' });
    });
    chip('drawn to scale', 860, 900, { size: 32, weight: 500, color: C.inkSoft, align: 'right' });
    const X = 1080;
    A(eout(seg(t, mid('b8', 0.5), mid('b8', 0.5) + 0.7)), () => {
      txt(`shadow ≈ 1/${Math.round(1 / SHADOW)}`, X, 420, { size: 92, family: DISPLAY, weight: 700, color: C.ink });
      txt('OF THE STICK’S HEIGHT', X + 6, 510, { size: 42, weight: 800, color: C.terraDeep, spacing: '3px' });
      txt(`at ${ANGLE.toFixed(1)}° from overhead`, X + 6, 570, { size: 40, weight: 500, color: C.inkSoft });
    });
    A(eout(seg(t, s('b9', 0.2), s('b9', 0.9))), () => {
      txt('SYENE, SAME NOON:', X, 720, { size: 42, weight: 800, color: C.blueDeep, spacing: '2px' });
      txt('0°  ·  no shadow at all', X, 790, { size: 56, family: DISPLAY, weight: 700, color: C.ink });
    });
  });
}

// ---------- 4: parallel rays ----------
const GEO = { cx: 540, cy: 630, r: 270, th: 24 };
function partRays(t) {
  const far = span(t, s('p10', -0.2), DURATION, 0.7, 0.6);
  A(1 - far, () => {
    earth(GEO.cx, GEO.cy, GEO.r, eio(seg(t, s('p2', -0.4), s('p2', 0.8))));
    const g = geometry(t, GEO.cx, GEO.cy, GEO.r, GEO.th, {
      rays: eout(seg(t, s('p1', 0.4), s('p1', 2.0))),
      syene: eout(seg(t, s('p2', 0.3), mid('p2', 0.6))),
      alex: eout(seg(t, mid('p2', 0.6), e('p2', 0.3))),
      extS: seg(t, mid('p3', 0.5), e('p3')),
      extA: seg(t, s('p4', 0.2), mid('p4', 0.8)),
      angA: eout(seg(t, s('p5', 0.2), s('p5', 1.0))),
      z: span(t, s('p6', 0.4), e('p7', 0.6), 0.6, 0.6),
      angC: eout(seg(t, s('p8', 0.3), s('p8', 1.1))),
      arc: eout(seg(t, s('p9', 0.2), s('p9', 1.4))),
    });
    A(eout(seg(t, s('p2', 0.6), s('p2', 1.3))), () => chip('Syene', g.S[0] + 24, g.S[1] + 34, { size: 34, align: 'left' }));
    A(eout(seg(t, mid('p2', 0.7), e('p2', 0.4))), () => chip('Alexandria', g.Al[0] - 30, g.Al[1] + 30, { size: 34, align: 'right' }));
    A(eout(seg(t, mid('p3', 0.8), e('p3', 0.4))), () => chip('centre', GEO.cx + 22, GEO.cy + 30, { size: 34, align: 'left' }));
    A(eout(seg(t, s('p5', 0.6), s('p5', 1.3))), () => chip(`${ANGLE.toFixed(1)}°`, g.AA[0] - 60, g.AA[1] - 130, { size: 44, family: DISPLAY, color: C.blueDeep }));
    A(eout(seg(t, s('p8', 0.8), s('p8', 1.5))), () => chip(`${ANGLE.toFixed(1)}°`, GEO.cx - 50, GEO.cy - 145, { size: 44, family: DISPLAY, color: C.blueDeep }));
    A(eout(seg(t, s('p9', 0.8), s('p9', 1.6))), () => chip('1/50 of the way round', GEO.cx - GEO.r * 0.2, GEO.cy - GEO.r * 0.45, { size: 36, color: C.terraDeep }));
    A(eout(seg(t, s('p2', 0.4), s('p2', 1.2))), () => chip('angle enlarged · not to scale', 120, 930, { size: 32, weight: 500, color: C.inkSoft, align: 'left' }));
    // the steps, on the right
    const X = 1060;
    txtSteps(t, X, [
      ['p1', 0.5, 'Sunlight arrives in parallel rays'],
      ['p3', 0.6, 'Each stick points to the Earth’s centre'],
      ['p7', 0.3, 'Alternate angles are equal'],
      ['p8', 0.5, `Angle at the centre: ${ANGLE.toFixed(1)}°`],
      ['p9', 0.4, 'The cities are 1/50 of the way round'],
    ]);
  });
  // how parallel? the Sun, far away
  A(far, () => {
    const y = 520, ex = 260, sx = 1640;
    earth(ex, y, 80, 1);
    sunDisc(sx, y, 70, 1, t * 0.1);
    line(ex + 90, y + 150, sx, y + 150, eout(seg(t, s('p10', 0.4), mid('p10', 0.5))), { width: 3 });
    for (const xx of [ex + 90, sx]) line(xx, y + 136, xx, y + 164, 1, { width: 3 });
    A(seg(t, mid('p10', 0.3), mid('p10', 0.6)), () => txt(`${(AU / 1e6).toFixed(1)} million km`, (ex + sx) / 2, y + 196, { size: 40, weight: 800, align: 'center' }));
    for (const dy of [-26, 26]) line(sx - 80, y + dy * 0.4, ex + 82, y + dy, eout(seg(t, s('p10', 0.6), mid('p10', 0.45))), { color: C.gold, width: 4, dash: [14, 10], offset: -t * 30 });
    A(eout(seg(t, mid('p10', 0.6), e('p10', 0.4))), () => {
      txt(`the two rays differ by ${RAY_DIFF.toFixed(4)}°`, W / 2, 330, { size: 56, family: DISPLAY, weight: 700, align: 'center', color: C.blueDeep });
      txt(`over the ${fmt(CITY_KM)} km between the cities`, W / 2, 400, { size: 40, weight: 500, align: 'center', color: C.inkSoft });
    });
    chip('not to scale', 1820, 900, { size: 32, weight: 500, color: C.inkSoft, align: 'right' });
  });
}
function txtSteps(t, X, steps) {
  steps.forEach(([key, f, str], i) => {
    const a = eout(seg(t, mid(key, f), mid(key, f) + 0.7));
    A(a, () => {
      const y = 260 + i * 120;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X + 30, y, 30, 0, TAU); ctx.fill();
      txt(String(i + 1), X + 30, y + 2, { size: 36, family: DISPLAY, weight: 700, color: C.glazeText, align: 'center' });
      txt(str, X + 84 + (1 - a) * 14, y, { size: 42, weight: 700 });
    });
  });
}

// ---------- 5: five thousand stadia ----------
function footprints(t, v, p) {
  // footsteps pacing up the Nile from Syene towards the delta, then on to Alexandria
  const pts = [...NILE.slice(0, 17)].reverse().concat([[30.9, 30.6], [30.5, 31.0], [LON_A, LAT_A]]);
  const xy = pts.map(([lo, la]) => proj(v, lo, la));
  const lens = [0]; for (let i = 1; i < xy.length; i++) lens.push(lens[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]));
  const total = lens.at(-1), step = 26;
  for (let d = 0, n = 0; d < total * p; d += step, n++) {
    let i = 1; while (lens[i] < d) i++;
    const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1]), x = lerp(xy[i - 1][0], xy[i][0], u), y = lerp(xy[i - 1][1], xy[i][1], u);
    const ang = Math.atan2(xy[i][1] - xy[i - 1][1], xy[i][0] - xy[i - 1][0]), side = n % 2 ? 1 : -1;
    const ox = Math.cos(ang + Math.PI / 2) * 7 * side, oy = Math.sin(ang + Math.PI / 2) * 7 * side;
    const fade = 0.35 + 0.65 * seg(d, total * p - 400, total * p);
    A(fade, () => { ctx.save(); ctx.translate(x + ox + 16, y + oy); ctx.rotate(ang + Math.PI / 2); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(0, 0, 3.5, 6.5, 0, 0, TAU); ctx.fill(); ctx.restore(); });
  }
}
const RING = { cx: 520, cy: 560, r: 290 };
function partDistance(t) {
  const ring = span(t, s('f7', -0.3), DURATION, 0.7, 0.6);
  A(1 - ring, () => {
    drawMap(EGYPT, (v) => {
      const [ax, ay] = proj(v, ...CITY.alexandria), [sx, sy] = proj(v, ...CITY.syene);
      const d = eout(seg(t, s('f2', 0.1), s('f2', 1.2)));
      line(ax, ay, lerp(ax, sx, d), lerp(ay, sy, d), 1, { color: C.terraDeep, width: 6, dash: [14, 10] });
      footprints(t, v, eio(seg(t, s('f4', 0.3), e('f5', 0.5))));
      city(v, 'alexandria', 'Alexandria', { side: 'left' });
      city(v, 'syene', 'Syene', { side: 'left' });
      A(seg(d, 0.6, 1), () => chip('5,000 stadia', lerp(ax, sx, 0.5) - 24, lerp(ay, sy, 0.5) + 10, { size: 40, color: C.terraDeep, align: 'right' }));
      const q = eout(seg(t, s('f3', 0.2), s('f3', 0.9))) * (1 - seg(t, s('f4', 0.0), s('f4', 0.6)));
      A(q, () => txt('?', lerp(ax, sx, 0.5) + 40, lerp(ay, sy, 0.5) - 20, { size: 110, family: DISPLAY, weight: 700, color: C.blueDeep }));
    });
    mapCaption();
    const X = 1060;
    A(eout(seg(t, s('f1', 0.3), s('f1', 1.0))), () => {
      txt('THE DISTANCE', X, 240, { size: 56, family: DISPLAY, weight: 700, spacing: '3px' });
      txt('Alexandria to Syene', X + 4, 304, { size: 40, weight: 500, color: C.inkSoft });
    });
    A(eout(seg(t, s('f2', 0.3), s('f2', 1.1))), () => {
      txt(fmt(DIST), X, 430, { size: 140, family: DISPLAY, weight: 700, color: C.terraDeep });
      txt('STADIA, ACCORDING TO CLEOMEDES', X + 6, 524, { size: 38, weight: 800, color: C.ink, spacing: '2px' });
    });
    A(eout(seg(t, s('f4', 0.2), s('f4', 1.0))), () => {
      txt('βηματισταί · bematists', X, 640, { size: 48, weight: 800, color: C.blueDeep });
      txt('step-measurers: land for farming and taxes', X + 4, 700, { size: 38, weight: 500, color: C.inkSoft });
    });
    A(eout(seg(t, s('f6', 0.2), s('f6', 1.0))), () => {
      txt('c. AD 410–420, a Latin writer:', X, 800, { size: 38, weight: 500, color: C.inkSoft });
      txt('mensores regii · royal surveyors', X, 860, { size: 44, weight: 800, color: C.ink });
    });
  });
  // fifty arcs round the Earth, at the true angle
  A(ring, () => {
    const { cx, cy, r } = RING;
    earth(cx, cy, r, 1);
    const n = 1 + 49 * eio(seg(t, mid('f7', 0.35), e('f8', 0.6)));
    for (let i = 0; i < 50; i++) {
      const p = clamp(n - i);
      if (p <= 0) break;
      const a0 = -Math.PI / 2 - i * ANGLE * DEG;
      ctx.strokeStyle = i % 2 ? C.ink : C.terra; ctx.lineWidth = 22; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.arc(cx, cy, r, a0 - ANGLE * DEG * eout(p), a0); ctx.stroke();
    }
    // the first arc, Syene to Alexandria, named
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy - r, 8, 0, TAU); ctx.fill();
    const al = -Math.PI / 2 - ANGLE * DEG;
    ctx.beginPath(); ctx.arc(cx + r * Math.cos(al), cy + r * Math.sin(al), 8, 0, TAU); ctx.fill();
    chip('Syene', cx + 20, cy - r - 44, { size: 32, align: 'left' });
    chip('Alexandria', cx + r * Math.cos(al) - 26, cy + r * Math.sin(al) - 44, { size: 32, align: 'right' });
    chip('drawn to scale: 7.2°', cx, cy + r + 70, { size: 32, weight: 500, color: C.inkSoft });
    const count = Math.min(50, Math.floor(n + 1e-6));
    txt(String(count), cx, cy - 20, { size: 110, family: DISPLAY, weight: 700, align: 'center', color: C.terraDeep });
    txt(count === 1 ? 'arc' : 'arcs', cx, cy + 60, { size: 40, weight: 800, align: 'center', color: C.inkSoft });
    const X = 1060;
    A(eout(seg(t, s('f7', 0.2), s('f7', 0.9))), () => {
      txt('1/50 of the way round', X, 250, { size: 48, weight: 800, color: C.blueDeep });
      txt(`= ${fmt(DIST)} stadia`, X, 320, { size: 48, weight: 800, color: C.ink });
    });
    A(eout(seg(t, s('f8', 0.0), s('f8', 0.8))), () => txt(`50 × ${fmt(DIST)}`, X, 470, { size: 96, family: DISPLAY, weight: 700, color: C.ink }));
    A(eout(seg(t, mid('f8', 0.6), e('f8', 0.4))), () => {
      txt(`= ${fmt(Math.round(n) * DIST)}`, X, 600, { size: 112, family: DISPLAY, weight: 700, color: C.terraDeep });
      txt('STADIA AROUND THE EARTH', X + 8, 690, { size: 42, weight: 800, color: C.ink, spacing: '3px' });
    });
    A(eout(seg(t, s('f9', 0.1), s('f9', 0.9))), () => {
      emblem('shadow', X + 60, 830, 1, t); emblem('distance', X + 270, 830, 1, t); emblem('angle', X + 480, 830, 1, t);
      txt('+', X + 165, 830, { size: 56, weight: 800, align: 'center' }); txt('+', X + 375, 830, { size: 56, weight: 800, align: 'center' });
    });
  });
}

// ---------- 6: second-hand ----------
const TL = { x0: 170, x1: 1750, y: 640, from: -300, to: 500 };
const yearX = (y) => lerp(TL.x0, TL.x1, (y - TL.from) / (TL.to - TL.from));
function partSources(t) {
  const nums = span(t, s('c7', -0.1), DURATION, 0.6, 0.6);
  A(1 - nums, () => {
    const ax = eio(seg(t, s('c1', 0.2), s('c1', 1.6)));
    line(TL.x0, TL.y, lerp(TL.x0, TL.x1, ax), TL.y, 1, { width: 5 });
    A(seg(ax, 0.6, 1), () => {
      for (let y = -300; y <= 500; y += 100) {
        const x = yearX(y);
        line(x, TL.y - 12, x, TL.y + 12, 1, { width: 3 });
        txt(y < 0 ? `${-y} BC` : y === 0 ? 'AD 1' : `AD ${y}`, x, TL.y + 50, { size: 34, weight: 700, align: 'center', color: C.inkSoft });
      }
    });
    // Eratosthenes' life and the measurement
    const er = eout(seg(t, s('c1', 0.8), s('c1', 1.8)));
    A(er, () => {
      bar(-276, -194, TL.y - 50, C.terra, 'Eratosthenes', 'above');
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(yearX(-240), TL.y, 11, 0, TAU); ctx.fill();
    });
    // his book, lost
    const bk = eout(seg(t, s('c2', 0.3), s('c2', 1.1))), lost = seg(t, mid('c2', 0.7), e('c2', 0.4));
    A(bk * (1 - 0.75 * lost), () => scroll(yearX(-240) - 70, 190, 140, 80));
    A(bk, () => txt('On the Measure of the Earth', 180, 330, { size: 36, weight: 800, align: 'left' }));
    A(lost, () => { chip('LOST', yearX(-240), 232, { size: 44, family: DISPLAY, color: C.red, spacing: '4px' }); });
    // Strabo and Pliny
    A(eout(seg(t, mid('c6', 0.4), mid('c6', 0.4) + 0.7)), () => bar(-64, 24, TL.y + 110, C.blue, 'Strabo: the well', 'below'));
    // Cleomedes: somewhere in a long range
    const cl = eout(seg(t, s('c3', 0.3), s('c3', 1.1)));
    A(cl, () => {
      const x0 = yearX(-50), x1 = yearX(lerp(-50, 400, eout(seg(t, s('c4', 0.2), mid('c4', 0.8)))));
      const yb = TL.y - 150;
      ctx.save(); rrect(x0, yb - 20, Math.max(40, x1 - x0), 40, 20); ctx.clip();
      ctx.fillStyle = 'rgba(31,79,156,0.18)'; ctx.fillRect(x0, yb - 20, x1 - x0 + 40, 40);
      ctx.strokeStyle = 'rgba(31,79,156,0.55)'; ctx.lineWidth = 6;
      for (let x = x0 - 40; x < x1 + 40; x += 22) { ctx.beginPath(); ctx.moveTo(x, yb + 20); ctx.lineTo(x + 40, yb - 20); ctx.stroke(); }
      ctx.restore();
      rrect(x0, yb - 20, Math.max(40, x1 - x0), 40, 20); ctx.strokeStyle = C.blueDeep; ctx.lineWidth = 3; ctx.stroke();
      txt('Cleomedes: some time in here', x0 + 10, yb - 52, { size: 40, weight: 800, color: C.blueDeep });
    });
    A(eout(seg(t, s('c5', 0.3), s('c5', 1.0))), () => chip('his version: simplified', yearX(330), 330, { size: 40, color: C.terraDeep }));
    A(eout(seg(t, s('c6', 0.1), s('c6', 0.8))), () => chip('sundials, no well', yearX(330), 250, { size: 36, color: C.inkSoft }));
  });
  A(nums, () => twoNumbers(t));
}
function bar(y0, y1, y, color, label, side) {
  const x0 = yearX(y0), x1 = yearX(y1);
  rrect(x0, y - 16, x1 - x0, 32, 16); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  txt(label, x0, side === 'above' ? y - 46 : y + 50, { size: 40, weight: 800, color: C.ink });
}
function twoNumbers(t) {
  const X1 = 140, X2 = 990;
  const a1 = eout(seg(t, s('c7', 0.1), s('c7', 0.9))), a2 = eout(seg(t, s('c8', 0.4), mid('c8', 0.7)));
  A(a1, () => {
    txt('CLEOMEDES', X1, 230, { size: 44, family: DISPLAY, weight: 700, color: C.inkSoft, spacing: '3px' });
    txt(fmt(TOTAL), X1, 340, { size: 140, family: DISPLAY, weight: 700 });
  });
  A(a2, () => {
    txt('PLINY THE ELDER', X2, 230, { size: 44, family: DISPLAY, weight: 700, color: C.inkSoft, spacing: '3px' });
    txt(fmt(PLINY), X2, 340, { size: 140, family: DISPLAY, weight: 700, color: C.terraDeep });
  });
  A(eout(seg(t, s('c9', 0.2), s('c9', 0.8))), () => chip(`+${fmt(PLINY - TOTAL)}`, X2 + 660, 250, { size: 44, family: DISPLAY, color: C.blueDeep }));
  // divisible by 1..10?
  const dv = span(t, s('c10', 0.0), s('c11', 0.4), 0.5, 0.5);
  A(dv, () => {
    const d1 = DIVIDES(TOTAL), d2 = DIVIDES(PLINY);
    txt('divides evenly by', 140, 480, { size: 40, weight: 700, color: C.inkSoft });
    for (let i = 0; i < 10; i++) {
      const x = 560 + i * 120;
      txt(String(i + 1), x, 480, { size: 52, family: DISPLAY, weight: 700, align: 'center' });
      const p = seg(t, mid('c10', 0.1 + i * 0.07), mid('c10', 0.1 + i * 0.07) + 0.4);
      mark(d2[i], x, 590, 52, p);
      const q = seg(t, mid('c10', 0.75 + i * 0.02), mid('c10', 0.75 + i * 0.02) + 0.4);
      mark(d1[i], x, 690, 52, q);
    }
    txt(fmt(PLINY), 140, 590, { size: 48, family: DISPLAY, weight: 700, color: C.terraDeep });
    A(seg(t, mid('c10', 0.7), mid('c10', 0.8)), () => txt(fmt(TOTAL), 140, 690, { size: 48, family: DISPLAY, weight: 700 }));
  });
  A(span(t, s('c11', 0.3), s('c12', 0.3), 0.5, 0.5), () => {
    txt(`${fmt(PLINY)} ÷ 360 = ${fmt(PLINY / 360)}`, W / 2, 560, { size: 92, family: DISPLAY, weight: 700, align: 'center' });
    txt('stadia for each degree', W / 2, 660, { size: 44, weight: 800, align: 'center', color: C.terraDeep });
  });
  // two explanations
  const h1 = eout(seg(t, s('c12', 0.2), s('c12', 1.0))), h2 = eout(seg(t, s('c13', 0.2), s('c13', 1.0)));
  A(h1, () => { panel(140, 470, 780, 330); txt('EASIER ARITHMETIC', 530, 560, { size: 46, family: DISPLAY, weight: 700, align: 'center', color: C.blueDeep }); txt('the figure adjusted', 530, 640, { size: 40, weight: 700, align: 'center' }); txt('so it divides neatly', 530, 700, { size: 40, weight: 700, align: 'center' }); });
  A(h2, () => { panel(1000, 470, 780, 330); txt('A NEW STADION', 1390, 560, { size: 46, family: DISPLAY, weight: 700, align: 'center', color: C.blueDeep }); txt('a unit defined', 1390, 640, { size: 40, weight: 700, align: 'center' }); txt('from the Earth itself', 1390, 700, { size: 40, weight: 700, align: 'center' }); });
  A(h2, () => txt('or', W / 2 + 0, 635, { size: 44, family: DISPLAY, weight: 700, align: 'center', color: C.inkSoft }));
  A(span(t, s('c12', 0.2), DURATION, 0.5, 0.5), () => txt('HISTORIANS DISAGREE', W / 2, 880, { size: 40, weight: 800, align: 'center', color: C.inkSoft, spacing: '3px' }));
}

// ---------- 7: how long is a stadion? ----------
const KM = { x0: 200, x1: 1720, y: 640, from: 36000, to: 54000 };
const kmX = (v) => lerp(KM.x0, KM.x1, (v - KM.from) / (KM.to - KM.from));
function partStadion(t) {
  const scale = span(t, s('s4', -0.4), DURATION, 0.6, 0.6);
  A(1 - scale, () => {
    // a stadion: 600 feet
    const r1 = eout(seg(t, s('s1', 0.4), s('s1', 1.4)));
    A(r1, () => {
      txt('1 STADION = 600 FEET', W / 2, 270, { size: 64, family: DISPLAY, weight: 700, align: 'center', spacing: '3px' });
      const x0 = 260, x1 = 1660, y = 380;
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? C.ink : C.terra; ctx.fillRect(lerp(x0, x1, i / 6), y, (x1 - x0) / 6 * eout(clamp(r1 * 6 - i)), 30); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x0, y, x1 - x0, 30);
      for (let i = 0; i <= 6; i++) txt(String(i * 100), lerp(x0, x1, i / 6), y + 70, { size: 34, weight: 700, align: 'center', color: C.inkSoft });
    });
    // a foot is not a foot
    const r2 = eout(seg(t, mid('s2', 0.4), mid('s2', 0.4) + 0.8));
    A(r2 * (1 - seg(t, s('s3', 0.0), s('s3', 0.6))), () => {
      txt('but a foot varied:', 260, 560, { size: 42, weight: 700, color: C.inkSoft });
      [0.83, 0.93, 1.0, 1.08].forEach((f, i) => { const w = 360 * f, x = 760; ctx.fillStyle = [C.blue, C.terra, C.gold, C.ink][i]; ctx.fillRect(x, 520 + i * 44, w * eout(clamp(r2 * 1.4 - i * 0.12)), 26); });
    });
    const r3 = eout(seg(t, s('s3', 0.3), s('s3', 1.1)));
    A(r3, () => {
      txt('ESTIMATES OF A STADION', W / 2, 560, { size: 44, weight: 800, align: 'center', color: C.inkSoft, spacing: '3px' });
      const x0 = 460, x1 = 1460, y = 660;
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.blue); g.addColorStop(1, C.terra);
      rrect(x0, y - 18, (x1 - x0) * r3, 36, 18); ctx.fillStyle = g; ctx.fill();
      txt(`${STAD.lo} m`, x0 - 30, y, { size: 64, family: DISPLAY, weight: 700, align: 'right' });
      A(seg(r3, 0.8, 1), () => txt(`${STAD.hi} m`, x1 + 30, y, { size: 64, family: DISPLAY, weight: 700 }));
    });
  });
  A(scale, () => {
    // the km axis
    line(KM.x0, KM.y, KM.x1, KM.y, 1, { width: 4 });
    for (let v = 36000; v <= 54000; v += 2000) { const x = kmX(v); line(x, KM.y - 10, x, KM.y + 10, 1, { width: 3 }); txt(`${v / 1000}k`, x, KM.y + 44, { size: 34, weight: 700, align: 'center', color: C.inkSoft }); }
    txt('km around the Earth', KM.x1, KM.y + 96, { size: 34, weight: 700, align: 'right', color: C.inkSoft });
    // the real Earth
    const re = eout(seg(t, s('s4', 0.4), s('s4', 1.2)));
    A(re, () => {
      line(kmX(POLAR), KM.y + 20, kmX(POLAR), lerp(KM.y, 230, re), 1, { color: C.blue, width: 6 });
      txt(`${fmt(POLAR)} km: the real Earth`, kmX(POLAR) - 16, 216, { size: 42, weight: 800, color: C.blueDeep, align: 'left' });
    });
    // 250,000 stadia at every proposed stadion
    const band = eout(seg(t, s('s5', 0.3), e('s5', 0.4)));
    A(band, () => {
      const x0 = kmX(km(TOTAL, STAD.lo)), x1 = lerp(x0, kmX(km(TOTAL, STAD.hi)), band);
      rrect(x0, KM.y - 70, x1 - x0, 44, 10); ctx.fillStyle = 'rgba(180,83,42,0.28)'; ctx.fill(); ctx.strokeStyle = C.terraDeep; ctx.lineWidth = 2.5; ctx.stroke();
      txt(`250,000 stadia × ${STAD.lo}–${STAD.hi} m`, x0, KM.y - 106, { size: 36, weight: 800, color: C.terraDeep });
    });
    const pin = (v, lab, sub, y, a, color = C.ink) => A(a, () => {
      const x = kmX(v);
      line(x, KM.y - 22, x, y + 26, 1, { color, width: 3 });
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, KM.y - 22, 8, 0, TAU); ctx.fill();
      chip(lab, x, y, { size: 40, family: DISPLAY, color });
      txt(sub, x, y + 56, { size: 34, weight: 700, align: 'center', color: C.inkSoft });
    });
    const k1 = km(TOTAL, STAD.olympic), k2 = km(TOTAL, STAD.italian);
    pin(k1, signed(pct(k1)), `${STAD.olympic} m · ${fmt(k1)} km`, 420, eout(seg(t, s('s6', 0.3), s('s6', 1.0))));
    pin(k2, signed(pct(k2)), `${STAD.italian} m · ${fmt(k2)} km`, 300, eout(seg(t, s('s7', 0.3), s('s7', 1.0))));
    // Pliny's figure with a short stadion
    const sh = eout(seg(t, mid('s8', 0.5), mid('s8', 0.5) + 0.8));
    A(sh, () => {
      const x0 = kmX(km(PLINY, STAD.short[0])), x1 = kmX(km(PLINY, STAD.short[1]));
      rrect(x0, KM.y + 130, x1 - x0, 40, 8); ctx.fillStyle = 'rgba(31,79,156,0.45)'; ctx.fill(); ctx.strokeStyle = C.blueDeep; ctx.lineWidth = 2.5; ctx.stroke();
      txt(`252,000 × 155–160 m: ${signed(pct(km(PLINY, STAD.short[0])), 1)} to ${signed(pct(km(PLINY, STAD.short[1])), 1)}`, x0 - 10, KM.y + 214, { size: 38, weight: 800, color: C.blueDeep });
    });
    A(eout(seg(t, s('s9', 0.3), s('s9', 1.0))), () => {
      txt(`${STAD.firsov} m from ancient distances? disputed`, KM.x0 + 0, KM.y + 280, { size: 36, weight: 700, color: C.inkSoft });
    });
    A(eout(seg(t, s('s10', 0.3), s('s10', 1.0))), () => {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
      const x0 = kmX(km(PLINY, STAD.short[0])) - 16, x1 = kmX(km(PLINY, STAD.short[1])) + 16;
      rrect(x0, KM.y + 116, x1 - x0, 68, 14); ctx.stroke(); ctx.setLineDash([]);
      chip('“within 2%”: only with a short stadion', 1380, 760, { size: 38, color: C.red });
    });
    A(eout(seg(t, mid('s11', 0.6), mid('s11', 0.6) + 0.7)), () => {
      const x = kmX(REPEAT2012);
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(x, KM.y - 4); ctx.lineTo(x - 12, KM.y - 28); ctx.lineTo(x + 12, KM.y - 28); ctx.closePath(); ctx.fill();
      chip(`2012 repeat: ${fmt(REPEAT2012)} km`, x - 30, 400, { size: 36, color: C.green, align: 'right' });
      line(x - 6, KM.y - 30, x - 40, 424, 1, { color: C.green, width: 3 });
    });
  });
}

// ---------- 8: the simplifications ----------
function partSimplify(t) {
  const v = EGYPT;
  drawMap(v, () => {
    const [ax, ay] = proj(v, ...CITY.alexandria), [sx, sy] = proj(v, ...CITY.syene);
    // latitudes through both cities
    const lat = eout(seg(t, s('a9', 0.2), s('a9', 1.2)));
    if (lat > 0) A(lat, () => {
      for (const [la, yy] of [[LAT_A, ay], [LAT_S, sy]]) line(MAPF.x, yy, MAPF.x + MAPF.w, yy, 1, { color: C.blue, width: 3, dash: [6, 8] });
      const xm = MAPF.x + MAPF.w - 110;
      line(xm, ay + 10, xm, sy - 10, 1, { color: C.blueDeep, width: 4 });
      chip(`${DLAT.toFixed(1)}°`, xm, (ay + sy) / 2, { size: 44, family: DISPLAY, color: C.blueDeep });
      chip(`${LAT_A.toFixed(1)}° N`, MAPF.x + 90, ay + 36, { size: 32, color: C.blueDeep });
      chip(`${LAT_S.toFixed(1)}° N`, MAPF.x + 90, sy - 36, { size: 32, color: C.blueDeep });
    });
    // the tropic, then and now
    const tr = eout(seg(t, s('a4', 0.2), s('a4', 1.2)));
    if (tr > 0) A(tr, () => {
      const [, yNow] = proj(v, 30, TROPIC_NOW), [, yThen] = proj(v, 30, TROPIC_THEN);
      const tn = eout(seg(t, s('a5', 0.3), s('a5', 1.2)));
      line(MAPF.x, yThen, MAPF.x + MAPF.w * tr, yThen, 1, { color: C.terraDeep, width: 4, dash: [16, 10] });
      chip('tropic then', MAPF.x + 120, yThen - 30, { size: 32, color: C.terraDeep });
      A(tn, () => { line(MAPF.x, yNow, MAPF.x + MAPF.w * tn, yNow, 1, { color: C.terra, width: 3, dash: [8, 8] }); chip('tropic today', MAPF.x + 380, yNow + 4, { size: 32, color: C.terra }); });
    });
    // the meridian through Alexandria
    const me = eout(seg(t, s('a6', 0.3), s('a6', 1.3)));
    if (me > 0) {
      line(ax, ay, ax, lerp(ay, MAPF.y + MAPF.h, me), 1, { color: C.ink, width: 3.5, dash: [12, 9] });
      A(seg(me, 0.6, 1), () => chip('Alexandria’s meridian', ax - 20, 470, { size: 32, align: 'right' }));
    }
    const lo = eout(seg(t, s('a7', 0.2), s('a7', 1.0)));
    if (lo > 0) A(lo, () => {
      line(ax, sy, lerp(ax, sx, lo), sy, 1, { color: C.red, width: 5 });
      chip(`${DLON.toFixed(0)}° east`, (ax + sx) / 2, sy - 44, { size: 36, color: C.red });
    });
    city(v, 'alexandria', 'Alexandria', { side: 'right', dy: -30 });
    city(v, 'syene', 'Syene', { side: 'right', dy: -30 });
  });
  mapCaption();
  // the checklist
  const X = 1050;
  const items = [
    ['a2', 'Parallel rays', true, `differ by ${RAY_DIFF.toFixed(4)}°`],
    ['a3', 'Syene on the tropic', false, `${(LAT_S - TROPIC_THEN).toFixed(1)}° north of it then`],
    ['a6', 'Same meridian', false, `Syene ${DLON.toFixed(0)}° further east`],
    ['a8', 'A perfect sphere', false, 'flattened by about 0.3%'],
  ];
  A(eout(seg(t, s('a1', 0.3), s('a1', 1.1))), () => txt('THE SIMPLIFICATIONS', X, 236, { size: 52, family: DISPLAY, weight: 700, spacing: '3px' }));
  items.forEach(([key, name, ok, note], i) => {
    const y = 330 + i * 120, a = eout(seg(t, s(key, 0.1), s(key, 0.8)));
    const verdictKey = key === 'a3' ? 'a4' : key === 'a6' ? 'a7' : key;
    const m = seg(t, key === verdictKey ? mid(key, 0.5) : s(verdictKey, 0.2), (key === verdictKey ? mid(key, 0.5) : s(verdictKey, 0.2)) + 0.6);
    A(a, () => {
      txt(name, X + 70, y, { size: 46, weight: 800 });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(X + 4, y - 26, 48, 48);
      mark(ok, X + 28, y, 44, m);
      A(seg(m, 0.4, 1), () => txt(note, X + 70, y + 46, { size: 36, weight: 500, color: C.inkSoft }));
    });
  });
  // flattening, exaggerated
  A(span(t, s('a8', 0.3), s('a9', 0.1), 0.5, 0.5), () => {
    const cx = 1700, cy = 650;
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.arc(cx, cy, 80, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(cx, cy, 86, 70, 0, 0, TAU); ctx.stroke();
    txt('exaggerated', cx, cy + 116, { size: 32, weight: 500, align: 'center', color: C.inkSoft });
  });
  A(eout(seg(t, mid('a9', 0.5), mid('a9', 0.5) + 0.7)), () => {
    txt(`${DLAT.toFixed(2)}° vs ${ANGLE.toFixed(2)}°: 1/${(360 / DLAT).toFixed(1)} vs 1/50`, X, 820, { size: 42, weight: 800, color: C.blueDeep });
  });
  A(eout(seg(t, s('a10', 0.2), s('a10', 0.9))), () => chip('the distance: depends on the stadion', X + 10, 896, { size: 38, color: C.terraDeep, align: 'left' }));
}

// ---------- 9: the rest of his work, and the whole idea ----------
function partWork(t) {
  const geoA = span(t, s('w1', -0.5), s('w4', 0.2), 0.6, 0.6);
  A(geoA, () => {
    drawMap(MED, (v) => {
      const g = eout(seg(t, s('w2', 0.3), e('w2')));
      ctx.strokeStyle = 'rgba(34,23,15,0.55)'; ctx.lineWidth = 2.5;
      for (let la = 24; la <= 42; la += 3) { const [x0, y] = proj(v, 10, la), [x1] = proj(v, 40, la); line(x0, y, lerp(x0, x1, g), y, 1, { color: 'rgba(34,23,15,0.5)', width: 2.5 }); }
      for (let lo = 15; lo <= 39; lo += 3) { const [x, y0] = proj(v, lo, 44), [, y1] = proj(v, lo, 20); line(x, y0, x, lerp(y0, y1, g), 1, { color: 'rgba(34,23,15,0.5)', width: 2.5 }); }
      city(v, 'alexandria', 'Alexandria', { side: 'below', a: 1 });
      city(v, 'rhodes', 'Rhodes', { side: 'right', a: eout(seg(t, mid('w3', 0.1), mid('w3', 0.1) + 0.5)) });
      city(v, 'athens', 'Athens', { side: 'right', a: eout(seg(t, mid('w3', 0.2), mid('w3', 0.2) + 0.5)) });
      city(v, 'cyrene', 'Cyrene', { side: 'below', a: eout(seg(t, mid('w3', 0.3), mid('w3', 0.3) + 0.5)) });
    });
    A(eout(seg(t, s('w2', 0.3), s('w2', 1.0))), () => chip('grid illustrated, not his map', MAPF.x + MAPF.w - 24, MAPF.y + MAPF.h - 36, { size: 32, weight: 500, color: C.inkSoft, align: 'right' }));
    const X = 1060;
    A(eout(seg(t, s('w2', 0.2), s('w2', 1.0))), () => {
      txt('Γεωγραφικά', X, 260, { size: 76, weight: 800, color: C.blueDeep });
      txt('Geographica', X + 4, 336, { size: 44, weight: 500, color: C.inkSoft });
      txt('the known world on a grid', X + 4, 410, { size: 42, weight: 700 });
    });
    A(eout(seg(t, s('w3', 0.2), s('w3', 1.0))), () => {
      txt('400+', X, 560, { size: 120, family: DISPLAY, weight: 700, color: C.terraDeep });
      txt('CITIES WITH THEIR LOCATIONS', X + 6, 650, { size: 38, weight: 800, spacing: '2px' });
    });
    A(eout(seg(t, mid('w3', 0.6), mid('w3', 0.6) + 0.7)), () => txt('and the word “geography”', X + 6, 760, { size: 44, weight: 800, color: C.blueDeep }));
  });
  // the tilt and the chronology
  A(span(t, s('w4', -0.1), s('w5', 0.2), 0.6, 0.6), () => {
    const cx = 520, cy = 560, r = 230, tilt = TROPIC_THEN * DEG * eout(seg(t, s('w4', 0.3), mid('w4', 0.4)));
    earth(cx, cy, r, 1);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    line(0, -r - 80, 0, r + 80, 1, { width: 4, dash: [12, 8] });
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.18, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    line(cx, cy - r - 80, cx, cy + r + 80, 1, { color: C.inkFaint, width: 3 });
    A(seg(t, s('w4', 0.6), mid('w4', 0.4)), () => wedge(cx, cy, r + 60, -Math.PI / 2, -Math.PI / 2 + tilt, C.blue, 'rgba(31,79,156,0.18)'));
    chip('the tilt of the Earth’s axis', cx, cy + r + 110, { size: 36, color: C.blueDeep });
    const X = 1060;
    A(eout(seg(t, mid('w4', 0.55), mid('w4', 0.55) + 0.7)), () => {
      txt('DATES IN HISTORY', X, 420, { size: 48, family: DISPLAY, weight: 700, spacing: '2px' });
      line(X, 520, 1780, 520, 1, { width: 4 });
      for (const [yr, lab] of [[-1184, 'the fall of Troy'], [-776, 'first Olympiad']]) {
        const x = lerp(X + 40, 1740, (yr + 1300) / 1100);
        ctx.fillStyle = C.terra; ctx.beginPath(); ctx.arc(x, 520, 12, 0, TAU); ctx.fill();
        txt(`${-yr} BC`, x, 580, { size: 36, family: DISPLAY, weight: 700, align: 'center' });
        txt(lab, x, 630, { size: 34, weight: 700, align: 'center', color: C.inkSoft });
      }
      txt('his dates for them', X, 720, { size: 36, weight: 500, color: C.inkSoft });
    });
  });
  // the sieve
  A(span(t, s('w5', -0.2), s('w9', 0.2), 0.6, 0.6), () => sieve(t));
  // smaller Earths
  A(span(t, s('w9', -0.1), s('z1', 0.1), 0.6, 0.6), () => smallerEarths(t));
  // the whole idea
  A(span(t, s('z1', -0.3), e('z7', 1.6), 0.7, 0.8), () => recap(t));
  A(seg(t, e('z7', 1.2), e('z7', 2.2)), () => credits(t));
}
function sieve(t) {
  const X0 = 1090, Y0 = 200, c = 72;
  const at = (q) => mid('w6', [0.44, 0.62, 0.79, 0.95][[2, 3, 5, 7].indexOf(q)]);
  const colour = { 2: C.terra, 3: C.gold, 5: C.blue, 7: C.ink };
  const primeOn = seg(t, s('w7', 0.2), s('w7', 1.0));
  for (let n = 1; n <= 100; n++) {
    const i = n - 1, x = X0 + (i % 10) * c, y = Y0 + Math.floor(i / 10) * c;
    const by = [2, 3, 5, 7].find((q) => n !== q && n % q === 0);
    const crossed = by ? seg(t, at(by) + (n / 100) * 0.8, at(by) + (n / 100) * 0.8 + 0.35) : 0;
    const isPrime = n > 1 && !by;
    rrect(x + 3, y + 3, c - 6, c - 6, 8);
    ctx.fillStyle = isPrime && primeOn > 0 ? `rgba(31,79,156,${0.12 + 0.3 * primeOn})` : 'rgba(248,238,212,0.55)'; ctx.fill();
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 1.5; ctx.stroke();
    A(1 - 0.6 * crossed - (n === 1 ? 0.6 * seg(t, s('w6', 0), s('w6', 0.6)) : 0), () => txt(String(n), x + c / 2, y + c / 2 + 2, { size: 32, weight: 800, align: 'center', color: isPrime && primeOn > 0.5 ? C.blueDeep : C.ink }));
    if (crossed > 0) { ctx.strokeStyle = colour[by]; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 12, y + c - 12); ctx.lineTo(lerp(x + 12, x + c - 12, crossed), lerp(y + c - 12, y + 12, crossed)); ctx.stroke(); }
  }
  txt('THE SIEVE', 140, 260, { size: 64, family: DISPLAY, weight: 700, spacing: '3px' });
  txt('κόσκινον Ἐρατοσθένους', 144, 336, { size: 48, weight: 800, color: C.blueDeep });
  [2, 3, 5, 7].forEach((q, i) => {
    const a = eout(seg(t, at(q) - 0.2, at(q) + 0.4));
    A(a, () => {
      ctx.fillStyle = colour[q]; rrect(144, 432 + i * 74, 46, 46, 8); ctx.fill();
      txt(`multiples of ${q}`, 214, 456 + i * 74, { size: 42, weight: 700 });
    });
  });
  A(primeOn, () => {
    txt(`${PRIMES.length} primes up to 100`, 144, 780, { size: 52, weight: 800, color: C.blueDeep });
  });
  A(eout(seg(t, s('w8', 0.3), s('w8', 1.0))), () => {
    txt('earliest record: Nicomachus, 2nd century AD', 144, 860, { size: 36, weight: 500, color: C.inkSoft });
  });
}
function smallerEarths(t) {
  const cx = 520, cy = 560, R = 300;
  const rows = [[PLINY, 'Eratosthenes (Pliny)', C.terra, s('w9', 0.0)], [PTOLEMY, 'Ptolemy’s Geography', C.blue, mid('w9', 0.55)]];
  for (const [n, , col, at] of rows) {
    const a = eout(seg(t, at, at + 0.8)), r = R * (n / PLINY);
    A(a, () => { ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * a); ctx.stroke(); });
  }
  const X = 1060;
  rows.forEach(([n, lab, col, at], i) => {
    A(eout(seg(t, at, at + 0.8)), () => {
      txt(fmt(n), X, 280 + i * 190, { size: 100, family: DISPLAY, weight: 700, color: col });
      txt(lab, X + 6, 360 + i * 190, { size: 40, weight: 700, color: C.inkSoft });
    });
  });
  A(eout(seg(t, s('w10', 0.3), mid('w10', 0.5))), () => {
    const r = R * 0.75;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    txt('COLUMBUS, 1492', X, 700, { size: 52, family: DISPLAY, weight: 700, spacing: '2px' });
    txt('an Earth about ¼ smaller', X + 4, 770, { size: 44, weight: 800, color: C.ink });
    txt('than Eratosthenes’ figure', X + 4, 826, { size: 40, weight: 500, color: C.inkSoft });
  });
  chip('circles sized by circumference', cx, cy + R + 60, { size: 32, weight: 500, color: C.inkSoft });
}
function recap(t) {
  const g = { cx: 540, cy: 630, r: 270, th: 24 };
  const z2 = eout(seg(t, s('z2', 0.1), s('z2', 1.0))), z3 = eout(seg(t, s('z3', 0.1), s('z3', 1.0))), z4 = eout(seg(t, s('z4', 0.1), s('z4', 1.4)));
  earth(g.cx, g.cy, g.r, eio(seg(t, s('z1', 0.1), s('z1', 1.4))));
  geometry(t, g.cx, g.cy, g.r, g.th, { rays: eout(seg(t, s('z1', 0.6), s('z1', 2.0))), syene: z2, alex: z2, extS: z3, extA: z3, angA: z2, z: 0, angC: z3, arc: z4 });
  A(eout(seg(t, s('z1', 0.8), s('z1', 1.6))), () => chip('angle enlarged · not to scale', 120, 930, { size: 32, weight: 500, color: C.inkSoft, align: 'left' }));
  const X = 1060;
  const rows = [
    ['z2', 0.1, 'Syene: no shadow'],
    ['z2', 0.55, `Alexandria: 1/50 of a circle`],
    ['z3', 0.2, 'Parallel rays: the same angle at the centre'],
    ['z4', 0.1, `50 × ${fmt(DIST)} = ${fmt(TOTAL)} stadia`],
    ['z5', 0.3, 'In km? It depends on the stadion'],
  ];
  rows.forEach(([key, f, str], i) => {
    const a = eout(seg(t, mid(key, f), mid(key, f) + 0.7));
    A(a, () => {
      const y = 260 + i * 104;
      ctx.fillStyle = i === 4 ? C.blue : C.terra; ctx.beginPath(); ctx.arc(X + 14, y, 9, 0, TAU); ctx.fill();
      txt(str, X + 44, y, { size: 42, weight: 800, color: i === 4 ? C.blueDeep : C.ink });
    });
  });
  A(eout(seg(t, s('z6', 0.3), s('z6', 1.1))), () => txt('The idea was right.', X, 820, { size: 64, family: DISPLAY, weight: 700, color: C.terraDeep }));
  A(eout(seg(t, s('z7', 0.2), s('z7', 1.0))), () => {
    ctx.fillStyle = 'rgba(235,217,175,0.86)'; ctx.fillRect(0, 160, W, 790);
    txt('Β', W / 2, 500, { size: 300, weight: 800, align: 'center', color: C.terraDeep });
    txt('NOT BAD FOR “BETA”', W / 2, 720, { size: 64, family: DISPLAY, weight: 700, align: 'center', spacing: '6px' });
  });
}
const MUSIC = [
  '“Teller of the Tales” Kevin MacLeod (incompetech.com) · CC BY 4.0',
  '“Truth in the Stones” Kevin MacLeod (incompetech.com) · CC BY 4.0',
  '“Healing” Kevin MacLeod (incompetech.com) · CC BY 4.0',
];
const SOURCES = [
  'Wikipedia: Earth’s circumference · Eratosthenes · Cleomedes · Stadion (unit) · Bematist',
  'Aswan · Alexandria · Tropic of Cancer · Spherical Earth · Scaphe · Library of Alexandria',
  'Sieve of Eratosthenes · History of geodesy · Christopher Columbus · Astronomical unit',
  'Cleomedes, The Heavens (tr. T. L. Heath) · Strabo, Geography 17.1.48 (tr. H. L. Jones)',
];
function credits(t) {
  ctx.fillStyle = 'rgba(42,26,12,0.55)'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, 540);
  glazePanel(1680, 820);
  txt('ERATOSTHENES', 0, -296, { size: 76, family: DISPLAY, weight: 700, align: 'center', color: C.glazeText, spacing: '8px' });
  txt('MEASURING THE EARTH WITH A SHADOW', 0, -230, { size: 34, weight: 800, align: 'center', color: C.terraLight, spacing: '4px' });
  let y = -160;
  for (const [h, lines] of [['Animation and script', ['Reckon · original animation']], ['Music', MUSIC], ['Sources', SOURCES]]) {
    txt(h.toUpperCase(), 0, y, { size: 32, weight: 800, align: 'center', color: C.terraLight, spacing: '3px' });
    lines.forEach((l, j) => txt(l, 0, y + 42 + j * 38, { size: 32, weight: 500, align: 'center', color: C.glazeText }));
    y += 42 + lines.length * 38 + 26;
  }
  ctx.restore();
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const parts = [partOpen, partLibrarian, partSyene, partBowl, partRays, partDistance, partSources, partStadion, partSimplify, partWork];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCard(t);
  },
});
