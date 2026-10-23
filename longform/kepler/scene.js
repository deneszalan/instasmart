// "Equal areas in equal times", a long-form 16:9 explainer about Kepler's second law (about 11 minutes).
// Look: a deep-space orrery. Near-black blue sky with faint stars, brass and gold orbit lines, engraved rings
// and ticks like an old instrument; Cormorant Garamond for titles and words, IBM Plex Mono for numbers and labels.
// Widescreen: the diagram lives on the left (centre 560, 520), numbers and graphs on the right (x 1080–1824).
// Every animation is keyed to a narration line (window.TL, written by timing.mjs from the measured voice).
// Everything shown is computed here: orbits from Kepler's equation (M = E − e sin E, solved by Newton's
// method), wedge areas by the shoelace formula, speeds by vis-viva, Earth's half-years, Halley's speeds and
// times, Kepler's 1618 table, Newton's kicked polygon. Facts and sources: see script.mjs.
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => T[key][0] + (T[key][1] - T[key][0]) * f;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const W = 1920, H = 1080, TAU = Math.PI * 2;
const SERIF = 'Cormorant Garamond', MONO = 'IBM Plex Mono';

const C = {
  bgIn: '#0E1B3E', bgMid: '#081026', bgOut: '#03060F',
  brass: '#C9A24E', brassLight: '#F1D58E', brassDark: '#7A5A22', gold: '#FFE3A1',
  ivory: '#F4EAD3', ivorySoft: 'rgba(244,234,211,0.76)', ivoryFaint: 'rgba(244,234,211,0.5)',
  steel: '#93BCEB', copper: '#E8875A', earth: '#6DB8EC', panel: 'rgba(7,13,32,0.86)',
  wedgeA: 'rgba(233,188,98,0.36)', wedgeB: 'rgba(233,188,98,0.18)',
};
const DC = { x: 560, y: 520 }; // diagram centre (left half)
const RX = 1080, RW = 744;      // right column
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

let k, ctx, now = 0;
const A = (a, fn) => k.alpha(a, fn);
function txt(str, x, y, { size = 36, w = 500, fam = SERIF, color = C.ivory, align = 'left', base = 'alphabetic', spacing = '0px', italic = false } = {}) {
  k.font(`${italic ? 'italic ' : ''}${w}`, size, fam);
  k.text(str, x, y, { color, align, base, spacing });
}
const label = (str, x, y, o = {}) => txt(str, x, y, { fam: MONO, w: 500, size: 32, spacing: '3px', color: C.brass, ...o });
const mono = (str, x, y, o = {}) => txt(str, x, y, { fam: MONO, w: 500, ...o });
function wrap(str, maxW, size, w = 500, fam = SERIF, italic = false) {
  k.font(`${italic ? 'italic ' : ''}${w}`, size, fam);
  const out = []; let line = '';
  for (const word of str.split(' ')) {
    const tryL = line ? `${line} ${word}` : word;
    if (ctx.measureText(tryL).width > maxW && line) { out.push(line); line = word; } else line = tryL;
  }
  if (line) out.push(line);
  return out;
}
function para(str, x, y, maxW, { size = 40, lh = size * 1.25, w = 500, fam = SERIF, italic = false, color = C.ivory, align = 'left' } = {}) {
  const lines = wrap(str, maxW, size, w, fam, italic);
  lines.forEach((l, i) => txt(l, x, y + i * lh, { size, w, fam, italic, color, align }));
  return lines.length * lh;
}
/** A heading block in the right column: a mono kicker, a serif title, an italic line under it. */
function heading(x, y, kicker, title, sub, { size = 76, maxW = RW, subSize = 40, color = C.ivory } = {}) {
  if (kicker) label(kicker, x, y);
  let yy = y + (kicker ? 22 : 0);
  if (title) { const lines = wrap(title, maxW, size, 600); lines.forEach((l, i) => txt(l, x, yy + size * 0.9 + i * size * 1.02, { size, w: 600, color })); yy += size * 0.9 + (lines.length - 1) * size * 1.02 + 18; }
  if (sub) para(sub, x, yy + subSize * 1.1, maxW, { size: subSize, italic: true, color: C.ivorySoft, lh: subSize * 1.22 });
}
function rule(x0, x1, y, a = 0.6) { ctx.strokeStyle = `rgba(201,162,78,${a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
function plate(x, y, w, h, { r = 16, fill = C.panel, line = C.brass } = {}) {
  k.rrect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = line; ctx.stroke();
  k.rrect(x + 8, y + 8, w - 16, h - 16, Math.max(4, r - 6)); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(201,162,78,0.35)'; ctx.stroke();
}
function dot(x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function line(x0, y0, x1, y1, color, w = 2, dash = null) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash ?? []); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
}
function arrow(x0, y0, x1, y1, color, w = 4, head = 18) {
  const an = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 2) return;
  const hh = Math.min(head, L * 0.6);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(an) * hh * 0.7, y1 - Math.sin(an) * hh * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(an - 0.42) * hh, y1 - Math.sin(an - 0.42) * hh); ctx.lineTo(x1 - Math.cos(an + 0.42) * hh, y1 - Math.sin(an + 0.42) * hh); ctx.closePath(); ctx.fill();
}
function poly(pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); if (close) ctx.closePath(); }
const shoelace = (pts) => Math.abs(pts.reduce((sum, p, i) => { const q = pts[(i + 1) % pts.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const fix = (x, n) => x.toFixed(n);

// ---------- orbits ----------
/** Kepler's equation M = E − e sin E, solved for E by Newton's method. */
function solveE(M, ecc) {
  M = ((M % TAU) + TAU) % TAU;
  let E = ecc < 0.8 ? M : Math.PI;
  for (let i = 0; i < 40; i++) { const d = (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E)); E -= d; if (Math.abs(d) < 1e-12) break; }
  return E;
}
/** An ellipse on screen: centre (cx, cy), semi-major a along x, perihelion on the left, counter-clockwise on screen. */
function Orbit(cx, cy, a, ecc) {
  const b = a * Math.sqrt(1 - ecc * ecc), sun = { x: cx - a * ecc, y: cy };
  const atE = (E) => ({ x: cx - a * Math.cos(E), y: cy + b * Math.sin(E) });
  const atTau = (tau) => atE(solveE(TAU * tau, ecc)); // tau = fraction of the period since perihelion
  const r = (E) => a * (1 - ecc * Math.cos(E));
  return { cx, cy, a, b, ecc, sun, atE, atTau, r };
}
function drawEllipse(o, { color = C.brassLight, w = 2.5, engraved = true, alpha = 1, dash = null } = {}) {
  A(alpha, () => {
    if (engraved) for (const d of [7, -7]) { ctx.beginPath(); ctx.ellipse(o.cx, o.cy, Math.max(1, o.a + d), Math.max(1, o.b + d), 0, 0, TAU); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(201,162,78,0.35)'; ctx.stroke(); }
    ctx.setLineDash(dash ?? []);
    ctx.beginPath(); ctx.ellipse(o.cx, o.cy, o.a, o.b, 0, 0, TAU); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.stroke();
    ctx.setLineDash([]);
  });
}
function wedge(o, tau0, tau1, n = 40) {
  const pts = [o.sun];
  for (let i = 0; i <= n; i++) pts.push(o.atTau(lerp(tau0, tau1, i / n)));
  return pts;
}
function sunBall(x, y, r = 30, t = 0) {
  const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 3.2);
  glow.addColorStop(0, 'rgba(255,214,130,0.35)'); glow.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 16; i++) {
    const an = (i / 16) * TAU + t * 0.06, l = i % 2 ? r * 1.35 : r * 1.7;
    ctx.strokeStyle = 'rgba(241,213,142,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Math.cos(an) * r * 1.08, Math.sin(an) * r * 1.08); ctx.lineTo(Math.cos(an) * l, Math.sin(an) * l); ctx.stroke();
  }
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 2, 0, 0, r);
  g.addColorStop(0, '#FFF3C8'); g.addColorStop(0.5, C.brassLight); g.addColorStop(1, C.brassDark);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,8,0.85)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function planet(x, y, r = 16, kind = 'steel') {
  const cols = { steel: ['#E4F0FC', '#86ADD8', '#1E3658'], earth: ['#DDF4FF', '#4C9ED8', '#123A5C'], mars: ['#FFD9C2', '#D8724A', '#5A2210'], comet: ['#FFFFFF', '#CFE6FF', '#5B7CA8'], jup: ['#FFF0D8', '#D8B48A', '#6A4A2A'] }[kind];
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, cols[0]); g.addColorStop(0.55, cols[1]); g.addColorStop(1, cols[2]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,78,0.9)'; ctx.lineWidth = 2; ctx.stroke();
}
function armLine(p, q, w = 4) {
  ctx.lineCap = 'round';
  line(p.x, p.y, q.x, q.y, 'rgba(30,18,4,0.6)', w + 3); line(p.x, p.y, q.x, q.y, C.brass, w);
}
function crossMark(x, y, r = 10, color = C.ivorySoft) { line(x - r, y, x + r, y, color, 1.5); line(x, y - r, x, y + r, color, 1.5); }

// ---------- the background and the engraved ring ----------
let bgCanvas = null, ringCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(760, 470, 80, 760, 520, 1350);
  rad.addColorStop(0, C.bgIn); rad.addColorStop(0.45, C.bgMid); rad.addColorStop(1, C.bgOut);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(1609);
  for (const [x, y, r, c] of [[420, 300, 520, 'rgba(70,90,170,0.07)'], [1500, 760, 600, 'rgba(110,70,150,0.05)'], [1180, 200, 420, 'rgba(60,110,170,0.05)']]) {
    const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(0, 0, W, H);
  }
  for (let i = 0; i < 1100; i++) {
    const x = rnd() * W, y = rnd() * H, m = rnd();
    const a = 0.08 + Math.pow(rnd(), 2.2) * 0.6, rr = 0.35 + m * 0.9;
    g.fillStyle = rnd() < 0.3 ? `rgba(190,215,255,${a})` : `rgba(246,236,214,${a})`;
    g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
  }
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * H, l = 3 + rnd() * 5;
    g.strokeStyle = 'rgba(246,236,214,0.35)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x - l, y); g.lineTo(x + l, y); g.moveTo(x, y - l); g.lineTo(x, y + l); g.stroke();
    g.fillStyle = 'rgba(255,248,230,0.8)'; g.beginPath(); g.arc(x, y, 1.2, 0, TAU); g.fill();
  }
  const vg = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1150);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // engraved corner brackets
  g.strokeStyle = 'rgba(201,162,78,0.32)'; g.lineWidth = 1.5;
  for (const [x, y, sx, sy] of [[44, 44, 1, 1], [W - 44, 44, -1, 1], [44, H - 44, 1, -1], [W - 44, H - 44, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * 70); g.lineTo(x, y); g.lineTo(x + sx * 70, y); g.stroke();
    g.beginPath(); g.moveTo(x + sx * 10, y + sy * 46); g.lineTo(x + sx * 10, y + sy * 10); g.lineTo(x + sx * 46, y + sy * 10); g.stroke();
  }
  // the engraved ring, painted once, drawn with an alpha per part
  ringCanvas = document.createElement('canvas'); ringCanvas.width = 1000; ringCanvas.height = 1000;
  const q = ringCanvas.getContext('2d'), o = 500;
  for (let r = 60; r < 470; r += 10) { q.strokeStyle = `rgba(201,162,78,${r % 50 === 10 ? 0.07 : 0.025})`; q.lineWidth = 1; q.beginPath(); q.arc(o, o, r, 0, TAU); q.stroke(); }
  q.strokeStyle = 'rgba(201,162,78,0.32)'; q.lineWidth = 3; q.beginPath(); q.arc(o, o, 478, 0, TAU); q.stroke();
  q.strokeStyle = 'rgba(201,162,78,0.2)'; q.lineWidth = 1.5; q.beginPath(); q.arc(o, o, 456, 0, TAU); q.stroke();
  for (let d = 0; d < 360; d += 2) {
    const an = (d * Math.PI) / 180, l = d % 30 === 0 ? 20 : d % 10 === 0 ? 12 : 6;
    q.strokeStyle = `rgba(201,162,78,${d % 30 === 0 ? 0.45 : 0.22})`; q.lineWidth = d % 30 === 0 ? 2 : 1;
    q.beginPath(); q.moveTo(o + Math.cos(an) * 456, o + Math.sin(an) * 456); q.lineTo(o + Math.cos(an) * (456 - l), o + Math.sin(an) * (456 - l)); q.stroke();
  }
}
function ring(a) { if (a > 0) A(a, () => ctx.drawImage(ringCanvas, DC.x - 500, DC.y - 500)); }

// ---------- shared pieces ----------
// Earth: e = 0.0167 (NASA), perihelion around 3 January, longitude of perihelion 102.947°.
const E_EARTH = 0.0167, V_MEAN = 29.78, YEAR = 365.256, PERI_DAY = 3, VARPI = 102.947;
const earthSpeed = (rAU, aAU = 1) => V_MEAN * Math.sqrt(2 / rAU - 1 / aAU);
const earthO = Orbit(DC.x, DC.y, 330, E_EARTH);
function earthState(day) {
  const tau = (day - PERI_DAY) / YEAR, E = solveE(TAU * tau, E_EARTH);
  return { p: earthO.atE(E), v: earthSpeed(1 - E_EARTH * Math.cos(E)) };
}
const V_MAX = earthSpeed(1 - E_EARTH), V_MIN = earthSpeed(1 + E_EARTH); // 30.28, 29.29
const MONTH_START = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function earthYear(day, { alpha = 1, months = 1, showSpeed = 1 } = {}) {
  A(alpha, () => {
    drawEllipse(earthO);
    A(months, () => {
      for (let m = 0; m < 12; m++) {
        const st = earthState(MONTH_START[m]).p, n = { x: st.x - earthO.sun.x, y: st.y - earthO.sun.y }, L = Math.hypot(n.x, n.y);
        line(st.x - (n.x / L) * 10, st.y - (n.y / L) * 10, st.x + (n.x / L) * 10, st.y + (n.y / L) * 10, 'rgba(241,213,142,0.7)', 2);
        const md = earthState(MONTH_START[m] + 15).p, nn = { x: md.x - earthO.sun.x, y: md.y - earthO.sun.y }, LL = Math.hypot(nn.x, nn.y);
        mono(MONTHS[m], md.x + (nn.x / LL) * 58, md.y + (nn.y / LL) * 58, { size: 32, color: C.ivoryFaint, align: 'center', base: 'middle', spacing: '1px' });
      }
    });
    sunBall(earthO.sun.x, earthO.sun.y, 30, now);
    const st = earthState(day);
    A(showSpeed, () => armLine(earthO.sun, st.p, 3));
    planet(st.p.x, st.p.y, 17, 'earth');
  });
}
/** Earth's speed through the year, Jan–Dec, computed; a cursor at `day`. */
function speedGraph(x0, y0, w, h, day, { alpha = 1, cursor = 1, marks = 0 } = {}) {
  const vx = (d) => x0 + (d / 365) * w, vy = (v) => y0 + h - ((v - 29.2) / 1.2) * h;
  A(alpha, () => {
    line(x0, y0 + h, x0 + w, y0 + h, C.brass, 2); line(x0, y0, x0, y0 + h, C.brass, 2);
    for (const v of [29.5, 30.0]) { line(x0, vy(v), x0 + w, vy(v), 'rgba(201,162,78,0.22)', 1, [4, 8]); mono(fix(v, 1), x0 - 16, vy(v), { size: 32, color: C.ivoryFaint, align: 'right', base: 'middle' }); }
    for (const [d, m] of [[15, 'JAN'], [105, 'APR'], [196, 'JUL'], [288, 'OCT']]) mono(m, vx(d), y0 + h + 44, { size: 32, color: C.ivoryFaint, align: 'center' });
    const pts = [];
    for (let d = 0; d <= 365; d += 3) pts.push({ x: vx(d), y: vy(earthState(d).v) });
    poly(pts, false); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 3; ctx.stroke();
    label('KM/S', x0 + w, y0 - 24, { color: C.ivoryFaint, align: 'right' });
    A(marks, () => {
      const pj = { x: vx(3), y: vy(V_MAX) }, pl = { x: vx(185), y: vy(V_MIN) };
      dot(pj.x, pj.y, 8, C.gold); dot(pl.x, pl.y, 8, C.steel);
      mono(fix(V_MAX, 1), pj.x + 20, pj.y - 18, { size: 40, w: 600, color: C.gold });
      mono(fix(V_MIN, 1), pl.x, pl.y - 30, { size: 40, w: 600, color: C.steel, align: 'center' });
    });
    if (cursor > 0) A(cursor, () => {
      const d = ((day % 365) + 365) % 365, p = { x: vx(d), y: vy(earthState(d).v) };
      line(p.x, y0, p.x, y0 + h, 'rgba(244,234,211,0.3)', 1.5); dot(p.x, p.y, 9, C.earth);
    });
  });
}
/** The angular scale used in parts 1 and 2: `px` pixels per arcminute. */
function moonDisc(x, y, r, a = 1) {
  A(a, () => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#F3EEDF'); g.addColorStop(0.7, '#C9C2AE'); g.addColorStop(1, '#8F8875');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    const rnd = mulberry32(31);
    for (let i = 0; i < 14; i++) { const an = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.8, cr = r * (0.04 + rnd() * 0.12); ctx.fillStyle = 'rgba(90,84,70,0.25)'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, cr, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(201,162,78,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  });
}
function bracket(x0, x1, y, txtStr, color = C.brassLight, up = true) {
  const d = up ? -14 : 14;
  line(x0, y, x1, y, color, 2.5); line(x0, y - 12, x0, y + 12, color, 2.5); line(x1, y - 12, x1, y + 12, color, 2.5);
  if (txtStr) mono(txtStr, (x0 + x1) / 2, y + (up ? -22 : 52), { size: 40, w: 600, color, align: 'center' });
}

// ---------- 0: cold open ----------
const DEMO = Orbit(DC.x, DC.y, 330, 0.6);
function partOpen(t) {
  // Earth's year: a constant pace, so January comes round during o2
  const rate = 365 / (e('o2') - s('o2') + 0.6), day = rate * (t - s('o2', 0.2));
  const earthOn = eout(seg(t, s('o1', 0.1), s('o1', 1.2))) * (1 - seg(t, s('o3'), s('o3', 0.8)));
  ring(earthOn * 0.9);
  earthYear(day, { alpha: earthOn });
  A(earthOn, () => label('DIAGRAM · EARTH’S ORBIT, SUN OFF-CENTRE BY 1.7%', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' }));
  // the speed readout, then the year graph
  const st = earthState(day);
  A(span(t, s('o1', 0.6), s('o3', 0.6), 0.5, 0.6), () => {
    label('EARTH’S SPEED AROUND THE SUN', RX, 250);
    mono(fix(st.v, 2), RX, 380, { size: 120, w: 600, color: C.ivory });
    k.font('600', 120, MONO); const wv = ctx.measureText(fix(st.v, 2)).width;
    mono('km/s', RX + wv + 24, 380, { size: 48, color: C.ivorySoft });
    A(eout(seg(t, s('o2'), s('o2', 0.8))), () => speedGraph(RX + 90, 520, 650, 300, day, { cursor: 1, marks: seg(t, mid('o2', 0.5), mid('o2', 0.7)) }));
  });
  // o3: four hundred years, and Tycho's records of Mars
  const o3 = span(t, s('o3'), s('o4', 0.3), 0.6, 0.5);
  A(o3, () => {
    const x0 = 200, x1 = 1720, y = 560, yr = (Y) => lerp(x0, x1, (Y - 1580) / (2030 - 1580));
    line(x0, y, x1, y, C.brass, 2);
    for (let Y = 1600; Y <= 2020; Y += 50) { line(yr(Y), y - 10, yr(Y), y + 10, C.brass, 2); mono(String(Y), yr(Y), y + 52, { size: 32, color: C.ivoryFaint, align: 'center' }); }
    const p = eio(seg(t, s('o3', 0.4), s('o3', 2.4)));
    const xNow = yr(2026), xThen = lerp(xNow, yr(1602), p);
    ctx.fillStyle = 'rgba(233,188,98,0.25)'; ctx.fillRect(xThen, y - 26, xNow - xThen, 52);
    dot(xNow, y, 9, C.ivory); mono('TODAY', xNow, y - 48, { size: 32, color: C.ivory, align: 'center' });
    A(seg(p, 0.9, 1), () => {
      dot(yr(1602), y, 11, C.gold);
      txt('Late 1602', yr(1602), y - 120, { size: 56, w: 600, color: C.gold, align: 'center' });
      mono('THE AREA RULE', yr(1602), y - 70, { size: 32, color: C.brass, align: 'center', spacing: '2px' });
      txt(`${2026 - 1602} years ago`, (yr(1602) + xNow) / 2, y + 140, { size: 56, italic: true, color: C.ivory, align: 'center' });
    });
  });
  // o4: eight arcminutes against the Moon
  const o4 = span(t, s('o4'), s('o5', 0.2), 0.6, 0.5);
  A(o4, () => {
    const px = 14, mx = 640, my = 520, r = 15.5 * px;
    moonDisc(mx, my, r);
    label('THE FULL MOON · ABOUT 31′', mx, my + r + 70, { align: 'center', color: C.ivorySoft });
    const p = eout(seg(t, s('o4', 1.2), s('o4', 2.2)));
    A(p, () => {
      const bx0 = mx - 4 * px, bx1 = mx + 4 * px;
      bracket(bx0, bx1, my - r - 40, '8′', C.gold);
      line(bx0, my - r - 28, bx0, my + r * 0.2, 'rgba(255,227,161,0.5)', 1.5, [6, 6]); line(bx1, my - r - 28, bx1, my + r * 0.2, 'rgba(255,227,161,0.5)', 1.5, [6, 6]);
    });
    A(seg(t, s('o4', 1.8), s('o4', 2.6)), () => {
      mono('8′', RX + 40, 500, { size: 120, w: 600, color: C.gold });
      txt('eight arcminutes', RX + 40, 580, { size: 56, italic: true, color: C.ivory });
      txt('about a quarter of the Moon’s width', RX + 40, 650, { size: 44, italic: true, color: C.ivorySoft });
    });
  });
  // o5: the title, over twelve wedges sweeping
  const tt = s('o5');
  A(eout(seg(t, tt - 0.2, tt + 0.8)), () => {
    ring(0.8);
    drawEllipse(DEMO);
    const P5 = 7.2, tau = 0.5 + (t - tt - 0.3) / P5;
    for (let i = 0; i < 12; i++) {
      const a0 = 0.5 + i / 12, part = clamp((tau - a0) * 12);
      if (part <= 0) continue;
      poly(wedge(DEMO, a0, a0 + part / 12)); ctx.fillStyle = i % 2 ? C.wedgeB : C.wedgeA; ctx.fill(); ctx.strokeStyle = 'rgba(241,213,142,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    sunBall(DEMO.sun.x, DEMO.sun.y, 26, t);
    const p = DEMO.atTau(tau);
    armLine(DEMO.sun, p); planet(p.x, p.y, 16);
    label('DIAGRAM · ORBIT STRETCHED FOR CLARITY', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(eout(seg(t, tt + 0.5, tt + 1.5)), () => {
    label('KEPLER’S SECOND LAW', RX + 20, 340, { size: 36, spacing: '6px' });
    rule(RX + 20, RX + 560, 372, 0.7);
    txt('Equal areas', RX + 10, 500, { size: 120, w: 600, color: C.gold });
    txt('in equal times', RX + 10, 620, { size: 112, w: 500, italic: true, color: C.ivory });
    rule(RX + 20, RX + 560, 676, 0.7);
  });
}

// ---------- 1: Tycho's sky ----------
const tyYear = (Y) => lerp(200, 1720, (Y - 1540) / (1612 - 1540));
function quadrant(t, a) {
  A(a, () => {
    const ox = 230, oy = 860, R = 600;
    // the arc, engraved with degrees
    ctx.strokeStyle = C.brass; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(ox, oy, R, -Math.PI / 2, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(201,162,78,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox, oy, R - 46, -Math.PI / 2, 0); ctx.stroke();
    for (let d = 0; d <= 90; d++) {
      const an = -(d * Math.PI) / 180, l = d % 10 === 0 ? 40 : d % 5 === 0 ? 26 : 14;
      line(ox + Math.cos(an) * R, oy + Math.sin(an) * R, ox + Math.cos(an) * (R - l), oy + Math.sin(an) * (R - l), d % 10 === 0 ? C.brassLight : 'rgba(201,162,78,0.7)', d % 10 === 0 ? 2.5 : 1.2);
      if (d % 10 === 0 && d > 0 && d < 90) mono(String(d), ox + Math.cos(an) * (R + 40), oy + Math.sin(an) * (R + 40), { size: 32, color: C.ivoryFaint, align: 'center', base: 'middle' });
    }
    line(ox, oy, ox + R, oy, C.brass, 4); line(ox, oy, ox, oy - R, C.brass, 4);
    // the sighting arm sweeps up to a star
    const target = 38 * Math.PI / 180;
    const ang = lerp(12 * Math.PI / 180, target, eio(seg(t, s('t3', 0.3), s('t3', 2.6))));
    const tip = { x: ox + Math.cos(-ang) * (R + 60), y: oy + Math.sin(-ang) * (R + 60) };
    armLine({ x: ox, y: oy }, { x: ox + Math.cos(-ang) * R, y: oy + Math.sin(-ang) * R }, 6);
    line(ox + Math.cos(-ang) * R, oy + Math.sin(-ang) * R, tip.x + Math.cos(-ang) * 120, tip.y + Math.sin(-ang) * 120, 'rgba(255,227,161,0.35)', 1.5, [6, 8]);
    dot(ox, oy, 10, C.brassLight);
    const star = { x: ox + Math.cos(-target) * (R + 200), y: oy + Math.sin(-target) * (R + 200) };
    const tw = 0.7 + 0.3 * Math.sin(t * 3);
    line(star.x - 16, star.y, star.x + 16, star.y, `rgba(255,248,230,${0.8 * tw})`, 2); line(star.x, star.y - 16, star.x, star.y + 16, `rgba(255,248,230,${0.8 * tw})`, 2);
    dot(star.x, star.y, 5, '#FFF8E6');
    label('DIAGRAM · A MURAL QUADRANT', RX, 836, { color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
// Mars against the stars, computed from J2000 elements (NASA fact sheets): heliocentric ellipses, then geocentric.
const ELEM = {
  earth: { a: 1.00000011, e: 0.01671022, i: 0, node: 0, peri: 102.94719, L: 100.46435, P: 365.256 },
  mars: { a: 1.52366231, e: 0.09341233, i: 1.85061, node: 49.57854, peri: 336.04084, L: 355.45332, P: 686.98 },
};
const rad = (d) => (d * Math.PI) / 180;
function helio(el, day) {
  const M = rad(el.L - el.peri + (360 * day) / el.P), E = solveE(M, el.e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + el.e) * Math.sin(E / 2), Math.sqrt(1 - el.e) * Math.cos(E / 2)), r = el.a * (1 - el.e * Math.cos(E));
  const u = nu + rad(el.peri - el.node), O = rad(el.node), I = rad(el.i);
  return { x: r * (Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(I)), y: r * (Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(I)), z: r * Math.sin(u) * Math.sin(I) };
}
function geoMars(day) {
  const m = helio(ELEM.mars, day), ea = helio(ELEM.earth, day), x = m.x - ea.x, y = m.y - ea.y, z = m.z - ea.z;
  return { lon: (Math.atan2(y, x) * 180) / Math.PI, lat: (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI, sunLon: (Math.atan2(-ea.y, -ea.x) * 180) / Math.PI };
}
const MARS_LOOP = (() => {
  // the first opposition after J2000: Mars's longitude 180° from the Sun's
  let best = 0, bd = 1e9;
  for (let d = 400; d < 1200; d += 0.5) { const g = geoMars(d); const diff = Math.abs(((g.lon - g.sunLon - 180) % 360 + 540) % 360 - 180); if (diff < bd) { bd = diff; best = d; } }
  const pts = [];
  for (let d = best - 110; d <= best + 110; d += 5) pts.push(geoMars(d));
  const l0 = geoMars(best).lon;
  return pts.map((g) => ({ dl: ((g.lon - l0 + 540) % 360) - 180, lat: g.lat }));
})();
function marsSky(t, a) {
  A(a, () => {
    const cx = 560, cy = 470, px = 22, lat0 = -1.6; // pixels per degree, no stretch
    // a frame of sky
    k.rrect(110, 170, 900, 600, 18); ctx.fillStyle = 'rgba(3,6,15,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(201,162,78,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.save(); k.rrect(110, 170, 900, 600, 18); ctx.clip();
    const rnd = mulberry32(7);
    for (let i = 0; i < 90; i++) dot(110 + rnd() * 900, 170 + rnd() * 600, 0.6 + rnd() * 1.6, `rgba(246,236,214,${0.25 + rnd() * 0.5})`);
    line(110, cy + lat0 * px, 1010, cy + lat0 * px, 'rgba(201,162,78,0.35)', 1.5, [8, 10]);
    const n = Math.floor(MARS_LOOP.length * clamp(seg(t, s('t6', 0.2), e('t6', 1.0))));
    for (let i = 0; i < n; i++) {
      const p = MARS_LOOP[i], x = cx - p.dl * px, y = cy - (p.lat - lat0) * px;
      dot(x, y, i === n - 1 ? 9 : 5.5, i === n - 1 ? C.copper : 'rgba(232,135,90,0.75)');
    }
    ctx.restore();
    label('DIAGRAM · MARS’S PATH, COMPUTED', RX, 836, { color: C.ivoryFaint, size: 32, spacing: '1px' });
    label('ONE DOT EVERY 5 DAYS', RX, 880, { color: C.ivoryFaint, size: 32, spacing: '1px' });
    mono('ecliptic', 136, cy + lat0 * px - 14, { size: 32, color: 'rgba(201,162,78,0.7)', align: 'left' });
  });
}
const PLACES = { hven: [55.91, 12.70], prague: [50.09, 14.42] };
function map(t, a) {
  A(a, () => {
    const cx = 560, cy = 500, py = 62, pxl = py * Math.cos(rad(53)), lat0 = 53, lon0 = 13.5;
    const P = ([la, lo]) => ({ x: cx + (lo - lon0) * pxl, y: cy - (la - lat0) * py });
    for (let la = 48; la <= 58; la++) { const p0 = P([la, 6]), p1 = P([la, 21]); line(p0.x, p0.y, p1.x, p1.y, la % 5 === 0 ? 'rgba(201,162,78,0.45)' : 'rgba(201,162,78,0.14)', la % 5 === 0 ? 1.5 : 1); }
    for (let lo = 6; lo <= 21; lo++) { const p0 = P([47.6, lo]), p1 = P([58.4, lo]); line(p0.x, p0.y, p1.x, p1.y, lo % 5 === 0 ? 'rgba(201,162,78,0.45)' : 'rgba(201,162,78,0.14)', lo % 5 === 0 ? 1.5 : 1); }
    for (const la of [50, 55]) mono(`${la}°N`, P([la, 6]).x - 12, P([la, 6]).y + 12, { size: 32, color: C.ivoryFaint, align: 'right' });
    for (const lo of [10, 15, 20]) mono(`${lo}°E`, P([47.6, lo]).x, P([47.6, lo]).y + 44, { size: 32, color: C.ivoryFaint, align: 'center' });
    const h = P(PLACES.hven), p = P(PLACES.prague);
    const f = eio(seg(t, s('t7', 0.5), s('t7', 2.6)));
    ctx.setLineDash([10, 10]); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(lerp(h.x, p.x, f), lerp(h.y, p.y, f)); ctx.stroke(); ctx.setLineDash([]);
    dot(h.x, h.y, 10, C.gold); mono('HVEN', h.x + 22, h.y + 10, { size: 36, w: 600, color: C.gold });
    A(seg(f, 0.85, 1), () => { dot(p.x, p.y, 10, C.gold); mono('PRAGUE', p.x + 22, p.y + 10, { size: 36, w: 600, color: C.gold }); });
    label('MAP · LATITUDE AND LONGITUDE ONLY', RX, 836, { color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
// Earth and Mars, to scale, with lines of sight from Earth through Mars (how Mars was observed)
const SCALE_AU = 190;
function orbitXY(el, day) { const h = helio(el, day); return { x: DC.x + h.x * SCALE_AU, y: DC.y - h.y * SCALE_AU }; }
const ORB_PATH = {};
for (const n of ['earth', 'mars']) { ORB_PATH[n] = []; for (let i = 0; i <= 240; i++) ORB_PATH[n].push(orbitXY(ELEM[n], (i / 240) * ELEM[n].P)); }
function sightlines(t, t0, a) {
  A(a, () => {
    for (const n of ['earth', 'mars']) { poly(ORB_PATH[n]); ctx.strokeStyle = n === 'mars' ? 'rgba(232,135,90,0.8)' : 'rgba(109,184,236,0.8)'; ctx.lineWidth = 2.5; ctx.stroke(); }
    sunBall(DC.x, DC.y, 24, t);
    const dayAt = (tt) => (tt - t0) * 60; // 60 days a second
    const nNow = Math.floor((t - t0) / 0.4);
    ctx.save(); ctx.beginPath(); ctx.rect(96, 140, 920, 730); ctx.clip();
    for (let j = Math.max(0, nNow - 14); j <= nNow; j++) {
      const tt = t0 + j * 0.4, ea = orbitXY(ELEM.earth, dayAt(tt)), ma = orbitXY(ELEM.mars, dayAt(tt));
      const dx = ma.x - ea.x, dy = ma.y - ea.y, L = Math.hypot(dx, dy), fade = 1 - (nNow - j) / 15;
      line(ea.x, ea.y, ea.x + (dx / L) * 420, ea.y + (dy / L) * 420, `rgba(255,227,161,${0.5 * fade})`, 1.5);
    }
    ctx.restore();
    const ea = orbitXY(ELEM.earth, dayAt(t)), ma = orbitXY(ELEM.mars, dayAt(t));
    planet(ea.x, ea.y, 13, 'earth'); planet(ma.x, ma.y, 13, 'mars');
    const out = (p, d) => { const dx = p.x - DC.x, dy = p.y - DC.y, L = Math.hypot(dx, dy) || 1; return { x: p.x + (dx / L) * d, y: p.y + (dy / L) * d + 11 }; };
    const le = out(ea, -52), lm = out(ma, 56);
    mono('EARTH', le.x, le.y, { size: 32, color: C.earth, align: 'center' });
    mono('MARS', lm.x, lm.y, { size: 32, color: C.copper, align: 'center' });
    label('DIAGRAM · LINES OF SIGHT, EARTH TO MARS', RX, 836, { color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
function partTycho(t) {
  const a1 = s('t1'), q = span(t, a1 - 0.6, s('t6', 0.2), 0.8, 0.7);
  quadrant(t, q);
  marsSky(t, span(t, s('t6'), s('t7', 0.2), 0.6, 0.6));
  map(t, span(t, s('t7'), s('t8', 0.1), 0.6, 0.6));
  sightlines(t, s('t8'), span(t, s('t8'), DURATION, 0.8, 0));
  // the right column: one plate per line
  const plates = [
    ['t1', 't2', 'DANISH ASTRONOMER · 1546–1601', 'Tycho Brahe', 'the best measurements of the sky'],
    ['t2', 't3', 'THE ISLAND OF HVEN · FROM 1576', 'Uraniborg', 'an observatory funded by the king'],
    ['t3', 't4', 'BEFORE THE TELESCOPE', 'By eye', 'with large quadrants and sextants'],
    ['t6', 't7', 'YEAR AFTER YEAR', 'The planets', 'Mars among them'],
    ['t7', 't8', '1597', 'To Prague', 'in the emperor’s service'],
    ['t8', 't9', 'FEBRUARY 1600 · AGE 28', 'Johannes Kepler', 'joins Tycho'],
    ['t9', 't10', 'TYCHO GUARDS HIS DATA', 'One planet: Mars', 'Kepler’s assignment'],
    ['t10', 't11', '24 OCTOBER 1601', 'Tycho dies', 'two days later, Kepler is imperial mathematician'],
    ['t11', null, 'OWNED BY TYCHO’S HEIRS', 'The Mars data', 'in Kepler’s hands'],
  ];
  for (const [k0, k1, kick, title, sub] of plates) {
    const a = span(t, s(k0), k1 ? s(k1) : DURATION, 0.5, 0.45);
    if (a > 0) A(a, () => heading(RX, 230 + (1 - eout(seg(t, s(k0), s(k0, 0.6)))) * 16, kick, title, sub, { size: title.length > 14 ? 76 : 88 }));
  }
  // t4–t5: one arcminute, and the Moon on the same scale
  A(span(t, s('t4'), s('t6', 0.2), 0.5, 0.5), () => {
    const px = 11, x0 = RX + 20, y = 740;
    label('ONE DEGREE = 60 ARCMINUTES', x0, 250);
    for (let i = 0; i <= 60; i++) line(x0 + i * px, y, x0 + i * px, y - (i % 10 === 0 ? 34 : i % 5 === 0 ? 22 : 12), i % 10 === 0 ? C.brassLight : C.brass, i % 10 === 0 ? 2.5 : 1.2);
    line(x0, y, x0 + 60 * px, y, C.brass, 2.5);
    mono('0′', x0, y + 44, { size: 32, color: C.ivoryFaint, align: 'center' }); mono('30′', x0 + 30 * px, y + 44, { size: 32, color: C.ivoryFaint, align: 'center' }); mono('60′', x0 + 60 * px, y + 44, { size: 32, color: C.ivoryFaint, align: 'center' });
    const hi = eout(seg(t, s('t4', 0.8), s('t4', 1.6)));
    A(hi, () => { ctx.fillStyle = 'rgba(255,227,161,0.85)'; ctx.fillRect(x0 + 44 * px, y - 50, px, 50); mono('1′', x0 + 44.5 * px, y - 70, { size: 48, w: 600, color: C.gold, align: 'center' }); });
    A(hi, () => { txt('Tycho: close to one arcminute', x0, 322, { size: 52, w: 600 }); });
    const mo = eout(seg(t, s('t5'), s('t5', 0.8)));
    A(mo, () => {
      const my = y - 30 - 15.5 * px;
      moonDisc(x0 + 15.5 * px, my, 15.5 * px);
      line(x0, my, x0, y, 'rgba(244,234,211,0.5)', 1.5, [5, 6]); line(x0 + 31 * px, my, x0 + 31 * px, y, 'rgba(244,234,211,0.5)', 1.5, [5, 6]);
      mono('FULL MOON', x0 + 31 * px + 30, my - 10, { size: 36, w: 600, color: C.ivory });
      mono('≈ 31′', x0 + 31 * px + 30, my + 40, { size: 36, w: 600, color: C.ivory });
    });
  });
  // the timeline along the bottom
  const tl = span(t, s('t2'), DURATION, 0.6, 0);
  A(tl * (1 - seg(t, s('t4'), s('t4', 0.4)) * (1 - seg(t, s('t6'), s('t6', 0.5)))), () => {
    const y = 920;
    line(tyYear(1540), y, tyYear(1612), y, C.brass, 2);
    for (let Y = 1540; Y <= 1610; Y += 2) line(tyYear(Y), y - (Y % 10 === 0 ? 12 : 6), tyYear(Y), y + (Y % 10 === 0 ? 12 : 6), C.brass, Y % 10 === 0 ? 2 : 1);
    for (let Y = 1550; Y <= 1610; Y += 10) mono(String(Y), tyYear(Y), y + 50, { size: 32, color: C.ivoryFaint, align: 'center' });
    const ev = [[1546, 't1'], [1576, 't2'], [1597, 't7'], [1600, 't8'], [1601, 't10'], [1609, 't11']];
    for (const [Y, key] of ev) A(eout(seg(t, s(key, 0.3), s(key, 0.9))), () => { dot(tyYear(Y), y, Y === 1609 ? 7 : 9, Y === 1609 ? 'rgba(255,227,161,0.6)' : C.gold); });
    const cur = [...ev].reverse().find(([, key]) => t >= s(key, 0.3));
    if (cur) A(eout(seg(t, s(cur[1], 0.3), s(cur[1], 0.9))), () => mono(String(cur[0]), tyYear(cur[0]), y - 30, { size: 36, w: 600, color: C.gold, align: 'center' }));
  });
}

// ---------- 2: Eight minutes ----------
function epicycles(t, a) {
  A(a, () => {
    const R = 270, r = 70, sunOff = 0;
    ctx.strokeStyle = 'rgba(241,213,142,0.75)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(DC.x + sunOff, DC.y, R, 0, TAU); ctx.stroke();
    sunBall(DC.x, DC.y, 24, t);
    const w1 = 0.5, w2 = 2.4, t0 = s('m1');
    const pos = (tt) => { const a1 = (tt - t0) * w1, a2 = (tt - t0) * w2; const c = { x: DC.x + Math.cos(a1) * R, y: DC.y - Math.sin(a1) * R }; return { c, p: { x: c.x + Math.cos(a2) * r, y: c.y - Math.sin(a2) * r } }; };
    const trail = [];
    for (let tt = Math.max(t0, t - 6); tt <= t; tt += 0.04) trail.push(pos(tt).p);
    if (trail.length > 1) { poly(trail, false); ctx.strokeStyle = 'rgba(232,135,90,0.6)'; ctx.lineWidth = 2; ctx.stroke(); }
    const { c, p } = pos(t);
    ctx.strokeStyle = 'rgba(241,213,142,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, TAU); ctx.stroke();
    line(DC.x, DC.y, c.x, c.y, 'rgba(201,162,78,0.6)', 2); line(c.x, c.y, p.x, p.y, 'rgba(201,162,78,0.8)', 2);
    planet(p.x, p.y, 13, 'mars');
    label('DIAGRAM · A CIRCLE CARRYING A CIRCLE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
const VIC = { R: 320, sun: -0.17, eq: 0.13 }; // the vicarious hypothesis, drawn as a diagram
function vicPoint(theta) {
  // the planet on the circle, in direction theta as seen from the equant
  const qx = DC.x + VIC.eq * VIC.R, qy = DC.y, dx = Math.cos(theta), dy = -Math.sin(theta);
  const fx = qx - DC.x, b = fx * dx, c = fx * fx - VIC.R * VIC.R, u = -b + Math.sqrt(b * b - c);
  return { x: qx + u * dx, y: qy + u * dy };
}
function vicarious(t, a, { wobble = 0, missing = 0 } = {}) {
  A(a, () => {
    const R = VIC.R, sun = { x: DC.x + VIC.sun * R, y: DC.y }, eq = { x: DC.x + VIC.eq * R, y: DC.y };
    ctx.setLineDash(wobble > 0 ? [14, 12] : []);
    ctx.strokeStyle = 'rgba(241,213,142,0.85)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(DC.x, DC.y, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    line(DC.x - R - 30, DC.y, DC.x + R + 30, DC.y, 'rgba(201,162,78,0.35)', 1.5, [6, 8]);
    const theta = (t - s('m2')) * 0.55 + 0.6, p = vicPoint(theta);
    line(eq.x, eq.y, p.x, p.y, 'rgba(147,188,235,0.8)', 2, [8, 8]);
    armLine(sun, p, 3);
    sunBall(sun.x, sun.y, 22, t);
    crossMark(DC.x, DC.y, 10);
    dot(eq.x, eq.y, 7, C.steel);
    planet(p.x, p.y, 14, 'mars');
    const lb = eout(seg(t, s('m2', 1.0), s('m2', 2.0)));
    A(lb, () => {
      mono('SUN', sun.x - 16, sun.y + 70, { size: 32, color: C.brassLight, align: 'center' });
      mono('CENTRE', DC.x + 4, DC.y - 30, { size: 32, color: C.ivorySoft, align: 'center' });
      mono('EQUANT', eq.x + 12, eq.y + 50, { size: 32, color: C.steel, align: 'left' });
    });
    A(missing, () => {
      txt('?', DC.x + R * 0.72, DC.y - R * 0.72, { size: 110, w: 600, color: C.gold, align: 'center' });
      txt('?', eq.x + 40, eq.y + 150, { size: 90, w: 600, color: C.steel, align: 'center' });
    });
    label('DIAGRAM · KEPLER’S FIRST MODEL OF MARS', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
function reticle(t, a, sepArcmin) {
  A(a, () => {
    const R = 340, px = 13; // 13 px per arcminute
    ctx.save(); ctx.beginPath(); ctx.arc(DC.x, DC.y, R, 0, TAU); ctx.clip();
    ctx.fillStyle = 'rgba(2,4,10,0.6)'; ctx.fillRect(DC.x - R, DC.y - R, 2 * R, 2 * R);
    const rnd = mulberry32(88);
    for (let i = 0; i < 40; i++) dot(DC.x - R + rnd() * 2 * R, DC.y - R + rnd() * 2 * R, 0.6 + rnd() * 1.4, `rgba(246,236,214,${0.2 + rnd() * 0.5})`);
    ctx.strokeStyle = 'rgba(243,238,223,0.25)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(DC.x - 60, DC.y + 40, 15.5 * px, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = C.brass; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(DC.x, DC.y, R, 0, TAU); ctx.stroke();
    for (let i = 0; i < 72; i++) { const an = (i / 72) * TAU, l = i % 6 === 0 ? 18 : 8; line(DC.x + Math.cos(an) * R, DC.y + Math.sin(an) * R, DC.x + Math.cos(an) * (R - l), DC.y + Math.sin(an) * (R - l), C.brass, i % 6 === 0 ? 2 : 1); }
    mono('THE MOON, FOR SCALE', DC.x - 60, DC.y + 40 + 15.5 * px - 34, { size: 32, color: 'rgba(243,238,223,0.55)', align: 'center' });
    const obs = { x: DC.x - 50, y: DC.y - 40 };
    const sep = sepArcmin * px, model = { x: obs.x + sep, y: obs.y };
    dot(obs.x, obs.y, 9, C.copper);
    ctx.strokeStyle = C.steel; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(model.x, model.y, 13, 0, TAU); ctx.stroke();
    mono('TYCHO', obs.x - 18, obs.y - 30, { size: 32, color: C.copper, align: 'right' });
    mono('MODEL', model.x + 22, model.y + 54, { size: 32, color: C.steel, align: 'left' });
    if (sep > 20) bracket(obs.x, model.x, obs.y - 70, `${fix(sepArcmin, 0)}′`, sepArcmin > 4 ? C.gold : C.brassLight);
    label('DIAGRAM · MARS IN THE SKY, MAGNIFIED', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
}
function tally(t, t0, t1, x0, y0) {
  const n = Math.round(70 * clamp(seg(t, t0, t1)));
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 5), j = i % 5, gx = x0 + (g % 7) * 104, gy = y0 + Math.floor(g / 7) * 120;
    if (j < 4) line(gx + j * 18, gy, gx + j * 18, gy + 76, C.brassLight, 3);
    else line(gx - 10, gy + 62, gx + 66, gy + 12, C.gold, 3);
  }
}
function partEight(t) {
  epicycles(t, span(t, s('m1') - 0.6, s('m2', 0.4), 0.6, 0.6));
  const vicA = span(t, s('m2'), s('m5', 0.2), 0.6, 0.6) + span(t, s('m9'), DURATION, 0.6, 0);
  vicarious(t, vicA, { wobble: t > s('m9') ? 1 : 0, missing: eout(seg(t, s('m9', 0.8), s('m9', 1.6))) });
  const sep = lerp(2, 8, eio(seg(t, s('m6', 0.2), s('m6', 1.6))));
  reticle(t, span(t, s('m5'), s('m9', 0.2), 0.6, 0.6) * (1 - 0.6 * span(t, s('m8'), s('m9'), 0.5, 0.5)), sep);
  const head = [
    ['m1', 'm2', 'PTOLEMY · COPERNICUS', 'Circles', 'even with the Sun near the middle'],
    ['m2', 'm3', 'KEPLER’S FIRST MODEL OF MARS', 'A circle and an equant', 'from the equant, the motion looks steady'],
  ];
  for (const [k0, k1, kick, title, sub] of head) A(span(t, s(k0), s(k1), 0.5, 0.45), () => heading(RX, 230, kick, title, sub, { size: 80 }));
  // m3–m4: seventy repetitions
  A(span(t, s('m3'), s('m5'), 0.5, 0.45), () => {
    label('AT LEAST 70 TIMES OVER', RX, 230);
    tally(t, s('m3', 0.2), e('m4', -0.4), RX + 10, 290);
    A(eout(seg(t, s('m4'), s('m4', 0.6))), () => {
      para('“Take pity on me, who had to go through with at least seventy repetitions of it.”', RX, 620, RW - 20, { size: 50, italic: true, lh: 62 });
      label('KEPLER, ASTRONOMIA NOVA', RX, 840, { color: C.ivoryFaint });
    });
  });
  // m5–m7: two arcminutes, eight, and Tycho's accuracy
  A(span(t, s('m5'), s('m8'), 0.5, 0.45), () => {
    label('HOW FAR OFF · ARCMINUTES', RX, 230);
    const px = 70, x0 = RX + 10;
    const bars = [['TYCHO’S ACCURACY', 1.5, C.ivorySoft, s('m7')], ['THE MODEL, AT BEST', 2, C.brassLight, s('m5', 0.4)], ['THE MODEL, AT WORST', 8, C.gold, s('m6', 0.3)]];
    bars.forEach(([name, v, col, at], i) => {
      const p = eio(seg(t, at, at + 0.9)), y = 330 + i * 170;
      A(seg(t, at, at + 0.3), () => {
        mono(name, x0, y, { size: 32, color: col });
        ctx.fillStyle = col; ctx.fillRect(x0, y + 22, Math.max(2, v * px * p), 40);
        mono(i === 0 ? '≈ 1–2′' : `${v}′`, x0 + v * px * p + 18, y + 56, { size: 40, w: 600, color: col });
      });
    });
    A(eout(seg(t, s('m7', 0.8), s('m7', 1.6))), () => para('too big to ignore', x0, 880, RW, { size: 48, italic: true, color: C.gold }));
  });
  // m8: the quote
  A(span(t, s('m8'), s('m9'), 0.6, 0.5), () => {
    para('“These eight minutes alone will lead us along a path to the reform of the whole of Astronomy.”', RX, 300, RW - 10, { size: 60, italic: true, lh: 74, color: C.ivory });
    label('KEPLER, ASTRONOMIA NOVA, 1609', RX, 720, { color: C.ivoryFaint });
  });
  A(span(t, s('m9'), DURATION, 0.5, 0), () => heading(RX, 230, 'SOMETHING IS WRONG', 'The circle?', 'or the way the planet moves along it?', { size: 88 }));
}

// ---------- 3: A law of areas ----------
// A circle with the Sun off-centre (what Kepler had at this point), the planet moving by the area rule.
const AL = (() => {
  const R = 300, sun = { x: DC.x - 0.3 * R, y: DC.y }, N = 1440, pts = [], cum = [0];
  for (let i = 0; i <= N; i++) { const an = Math.PI - (i / N) * TAU; pts.push({ x: DC.x + Math.cos(an) * R, y: DC.y - Math.sin(an) * R }); }
  for (let i = 1; i <= N; i++) { const p = pts[i - 1], q = pts[i]; cum.push(cum[i - 1] + Math.abs((p.x - sun.x) * (q.y - sun.y) - (q.x - sun.x) * (p.y - sun.y)) / 2); }
  const total = cum[N];
  const at = (f) => { f = ((f % 1) + 1) % 1; const target = f * total; let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < target) lo = m; else hi = m; } const u = (target - cum[lo]) / (cum[hi] - cum[lo] || 1); return { x: lerp(pts[lo].x, pts[hi].x, u), y: lerp(pts[lo].y, pts[hi].y, u), i: lo }; };
  const sector = (f0, f1, n = 30) => { const out = [sun]; for (let j = 0; j <= n; j++) out.push(at(lerp(f0, f1, j / n))); return out; };
  return { R, sun, pts, at, sector };
})();
function partAreas(t) {
  const P = 12, f0 = s('a1');
  const f = (t - f0) / P; // fraction of the period since perihelion (the left, near the Sun)
  const base = span(t, s('a1') - 0.6, DURATION, 0.6, 0);
  A(base, () => {
    ring(0.6);
    ctx.strokeStyle = 'rgba(241,213,142,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(DC.x, DC.y, AL.R, 0, TAU); ctx.stroke();
    crossMark(DC.x, DC.y, 10);
    // a1: the Sun's force, rotating spokes that fade with distance
    A(span(t, s('a1'), s('a3'), 0.6, 0.6), () => {
      for (let i = 0; i < 28; i++) {
        const an = (i / 28) * TAU + (t - f0) * 0.35;
        for (let j = 0; j < 8; j++) {
          const r0 = 40 + j * 52, r1 = r0 + 40;
          line(AL.sun.x + Math.cos(an) * r0, AL.sun.y + Math.sin(an) * r0, AL.sun.x + Math.cos(an + 0.05) * r1, AL.sun.y + Math.sin(an + 0.05) * r1, `rgba(255,214,130,${0.42 * (1 - j / 8)})`, 2);
        }
      }
    });
    // a3–a4: spokes (distances) along the way, then the swept area
    const spokeA = span(t, s('a3'), s('a5'), 0.5, 0.5);
    if (spokeA > 0) A(spokeA, () => {
      const n = Math.floor(36 * clamp(seg(t, s('a3', 0.3), e('a3', -0.2))));
      for (let i = 0; i < n; i++) { const p = AL.at(0.5 + i / 72); line(AL.sun.x, AL.sun.y, p.x, p.y, 'rgba(147,188,235,0.75)', 1.5); }
      const fill = eio(seg(t, s('a4', 0.4), s('a4', 2.0)));
      A(fill, () => { poly(AL.sector(0.5, 1.0, 80)); ctx.fillStyle = 'rgba(233,188,98,0.32)'; ctx.fill(); ctx.strokeStyle = 'rgba(241,213,142,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); });
    });
    // a5–a8: two thin triangles of equal time, near and far, then equal wedges all round
    const tri = span(t, s('a5'), DURATION, 0.5, 0);
    if (tri > 0) A(tri, () => {
      const dF = 1 / 24;
      const nearT = AL.sector(-dF / 2, dF / 2, 12), farT = AL.sector(0.5 - dF / 2, 0.5 + dF / 2, 12);
      const lit = eout(seg(t, s('a6'), s('a6', 0.6)));
      for (const [pts, col] of [[nearT, C.gold], [farT, C.steel]]) { poly(pts); ctx.fillStyle = col === C.gold ? 'rgba(255,227,161,0.55)' : 'rgba(147,188,235,0.5)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); }
      const nm = AL.at(0), fm = AL.at(0.5);
      mono('1 DAY', nm.x - 26, nm.y - 6, { size: 32, color: C.gold, align: 'right', base: 'middle' });
      mono('1 DAY', fm.x + 26, fm.y - 6, { size: 32, color: C.steel, align: 'left', base: 'middle' });
      A(seg(t, s('a7'), s('a7', 1.0)), () => {
        for (let i = 0; i < 24; i++) { if (i === 0 || i === 12) continue; poly(AL.sector((i - 0.5) / 24, (i + 0.5) / 24, 8)); ctx.fillStyle = i % 2 ? C.wedgeB : C.wedgeA; ctx.fill(); ctx.strokeStyle = 'rgba(241,213,142,0.4)'; ctx.lineWidth = 1; ctx.stroke(); }
      });
      void lit;
    });
    sunBall(AL.sun.x, AL.sun.y, 26, t);
    const p = AL.at(f);
    armLine(AL.sun, p, 3);
    // a2: speed arrow, by the distance rule (speed ∝ 1/distance), along the circle
    A(span(t, s('a2'), s('a3'), 0.5, 0.5), () => {
      const q = AL.at(f + 0.002), dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy), r = Math.hypot(p.x - AL.sun.x, p.y - AL.sun.y);
      const len = 60 * (AL.R / r) * 1.4;
      arrow(p.x, p.y, p.x + (dx / L) * len, p.y + (dy / L) * len, C.copper, 4);
    });
    planet(p.x, p.y, 15);
    label('DIAGRAM · A CIRCLE WITH THE SUN OFF-CENTRE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  // right column
  A(span(t, s('a1'), s('a2'), 0.5, 0.45), () => heading(RX, 230, 'A PHYSICAL CAUSE', 'A force from the Sun', 'pushing the planets round, weaker with distance', { size: 80 }));
  A(span(t, s('a2'), s('a3'), 0.5, 0.45), () => {
    label('KEPLER’S SPEED RULE', RX, 230);
    const x0 = RX + 90, y0 = 330, w = 560, h = 400, X = (d) => x0 + ((d - 0.5) / 2) * w, Y = (v) => y0 + h - (v / 2) * h;
    line(x0, y0 + h, x0 + w, y0 + h, C.brass, 2); line(x0, y0, x0, y0 + h, C.brass, 2);
    const pts = []; for (let d = 0.55; d <= 2.5; d += 0.02) pts.push({ x: X(d), y: Y(1 / d) });
    poly(pts, false); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 3; ctx.stroke();
    mono('distance', x0 + w, y0 + h + 92, { size: 32, color: C.ivoryFaint, align: 'right' });
    mono('speed', x0 - 16, y0 - 14, { size: 32, color: C.ivoryFaint, align: 'left' });
    const p = eout(seg(t, s('a2', 1.2), s('a2', 2.2)));
    A(p, () => {
      dot(X(1), Y(1), 9, C.gold); dot(X(2), Y(0.5), 9, C.steel);
      line(X(1), Y(1), X(1), y0 + h, 'rgba(255,227,161,0.5)', 1.5, [5, 6]); line(X(2), Y(0.5), X(2), y0 + h, 'rgba(147,188,235,0.5)', 1.5, [5, 6]);
      mono('1×', X(1), y0 + h + 44, { size: 32, color: C.gold, align: 'center' }); mono('2×', X(2), y0 + h + 44, { size: 32, color: C.steel, align: 'center' });
      mono('full speed', X(1) + 20, Y(1) - 12, { size: 32, color: C.gold }); mono('half speed', X(2) + 16, Y(0.5) - 20, { size: 32, color: C.steel });
    });
  });
  A(span(t, s('a3'), s('a4'), 0.5, 0.45), () => {
    heading(RX, 230, 'TO FIND THE PLANET', 'Add up every distance', null, { size: 76 });
    const str = 'r₁ + r₂ + r₃ + r₄ + r₅ + …';
    const n = Math.ceil(str.length * clamp(seg(t, s('a3', 0.5), e('a3'))));
    mono(str.slice(0, n), RX, 520, { size: 44, color: C.steel });
    para('hopeless by hand', RX, 640, RW, { size: 48, italic: true, color: C.ivorySoft });
  });
  A(span(t, s('a4'), s('a5'), 0.5, 0.45), () => heading(RX, 230, 'LATE 1602 · A SHORTCUT', 'Measure the area', 'swept by the line from the Sun', { size: 88 }));
  A(span(t, s('a5'), s('a7'), 0.5, 0.45), () => {
    label('ONE DAY’S TRIANGLE', RX, 230);
    // schematic triangles: far (height 2, base 1) and near (height 1, base 2)
    const y0 = 700, u = 120;
    const tri = (x, hgt, bas, col, name) => {
      poly([{ x, y: y0 }, { x: x + bas * u * 0.5, y: y0 - hgt * u }, { x: x + bas * u, y: y0 }]);
      ctx.fillStyle = col === C.gold ? 'rgba(255,227,161,0.4)' : 'rgba(147,188,235,0.35)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
      mono(name, x + bas * u * 0.5, y0 + 50, { size: 32, color: col, align: 'center' });
      mono(`height ${hgt}`, x + bas * u * 0.5, y0 - hgt * u - 22, { size: 32, color: C.ivorySoft, align: 'center' });
      mono(`base ${bas}`, x + bas * u * 0.5, y0 + 92, { size: 32, color: C.ivorySoft, align: 'center' });
    };
    tri(RX + 40, 1, 2, C.gold, 'NEAR');
    tri(RX + 420, 2, 1, C.steel, 'FAR');
    A(eout(seg(t, s('a6'), s('a6', 0.7))), () => {
      mono('area = ½ × base × height', RX, 330, { size: 40, color: C.ivory });
      mono('½ × 2 × 1 = 1', RX + 160, 880, { size: 36, w: 600, color: C.gold, align: 'center' });
      mono('½ × 1 × 2 = 1', RX + 480, 880, { size: 36, w: 600, color: C.steel, align: 'center' });
    });
  });
  A(span(t, s('a7'), s('a8'), 0.5, 0.45), () => {
    heading(RX, 230, 'KEPLER’S SECOND LAW', 'Equal areas', 'in equal times · found before the first law', { size: 100, subSize: 44 });
  });
  A(span(t, s('a8'), DURATION, 0.5, 0), () => {
    label('TWO RULES', RX, 230);
    plate(RX, 270, RW, 250, {}); plate(RX, 560, RW, 250, {});
    mono('speed ∝ 1 / distance', RX + 36, 350, { size: 44, w: 600, color: C.steel });
    para('only for orbits that are nearly circles', RX + 36, 420, RW - 70, { size: 44, italic: true, color: C.ivorySoft, lh: 52 });
    mono('equal areas', RX + 36, 640, { size: 44, w: 600, color: C.gold });
    para('works for every orbit', RX + 36, 710, RW - 70, { size: 44, italic: true, color: C.ivory });
  });
}

// ---------- 4: The ellipse ----------
function egg(i) {
  const rnd = mulberry32(100 + i), a = 300 + rnd() * 40, b = a * (0.86 + rnd() * 0.12), kk = (rnd() - 0.3) * 0.22, rot = (rnd() - 0.5) * 0.05;
  const pts = [];
  for (let j = 0; j <= 120; j++) { const th = (j / 120) * TAU, x = Math.cos(th), y = Math.sin(th) * (1 + kk * x); pts.push({ x: DC.x + (x * Math.cos(rot) - y * Math.sin(rot)) * a, y: DC.y + (x * Math.sin(rot) + y * Math.cos(rot)) * b }); }
  return pts;
}
const STR = Orbit(DC.x, DC.y, 330, 0.6); // the string construction
const MARS_O = Orbit(DC.x, DC.y, 360, 0.0934);
const ECC6 = [['MERCURY', 0.206], ['VENUS', 0.007], ['EARTH', 0.017], ['MARS', 0.094], ['JUPITER', 0.049], ['SATURN', 0.052]]; // NASA planetary fact sheet
function partEllipse(t) {
  const base = span(t, s('l1') - 0.6, DURATION, 0.6, 0);
  A(base, () => ring(0.6));
  // l1–l2: ovals, about forty of them
  const nEgg = Math.floor(40 * clamp(seg(t, s('l1', 0.2), mid('l2', 0.45))));
  A(span(t, s('l1') - 0.6, s('l3'), 0.6, 0.6) * (1 - seg(t, mid('l2', 0.5), mid('l2', 0.75))), () => {
    for (let i = Math.max(0, nEgg - 6); i < nEgg; i++) { poly(egg(i)); ctx.strokeStyle = i === nEgg - 1 ? 'rgba(232,135,90,0.95)' : `rgba(232,135,90,${0.12 + 0.05 * (i - nEgg + 6)})`; ctx.lineWidth = i === nEgg - 1 ? 3 : 1.5; ctx.stroke(); }
    label('DIAGRAM · EGG-SHAPED OVALS', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('l1'), s('l3'), 0.5, 0.45), () => {
    label('ATTEMPT', RX, 300);
    mono(String(Math.max(1, nEgg)), RX, 470, { size: 150, w: 600, color: nEgg >= 40 ? C.gold : C.copper });
    A(seg(t, mid('l2', 0.5), mid('l2', 0.8)), () => heading(RX, 590, 'LATE 1604', 'An ellipse', null, { size: 96 }));
  });
  // l2–l4: the ellipse, drawn in gold
  const ell = span(t, mid('l2', 0.55), s('l5', 0.2), 0.6, 0.6);
  A(ell, () => {
    const p = eio(seg(t, mid('l2', 0.55), e('l2', 0.6)));
    ctx.beginPath(); ctx.ellipse(DC.x, DC.y, 330, 330 * Math.sqrt(1 - 0.55 * 0.55), 0, Math.PI, Math.PI + TAU * p); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke();
    label('DIAGRAM · AN ELLIPSE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('l3'), s('l4'), 0.5, 0.45), () => heading(RX, 300, 'HE HAD THOUGHT', 'Too simple', 'surely someone would have tried it', { size: 100 }));
  A(span(t, s('l4'), s('l5'), 0.5, 0.45), () => {
    label('IT FITTED', RX, 300);
    para('“Ah, what a foolish bird I have been!”', RX, 420, RW, { size: 72, italic: true, lh: 84, color: C.ivory });
    label('KEPLER, ASTRONOMIA NOVA', RX, 640, { color: C.ivoryFaint });
  });
  // l5–l6: pins and a string; the Sun at one focus
  const strA = span(t, s('l5') - 0.3, s('l7', 0.2), 0.6, 0.6);
  A(strA, () => {
    const o = STR, c = o.a * o.ecc, F1 = { x: o.cx - c, y: o.cy }, F2 = { x: o.cx + c, y: o.cy };
    const p = clamp(seg(t, s('l5', 0.2), e('l5', 1.0)));
    const E = Math.PI + TAU * p;
    if (p > 0) { ctx.beginPath(); for (let j = 0; j <= 120 * p; j++) { const q = o.atE(Math.PI + (j / 120) * TAU); j ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); }
    const P = o.atE(E);
    A(1 - seg(t, s('l6', 0.4), s('l6', 1.2)), () => { line(F1.x, F1.y, P.x, P.y, C.ivory, 2); line(P.x, P.y, F2.x, F2.y, C.ivory, 2); dot(P.x, P.y, 7, C.ivory); });
    const sunOn = eout(seg(t, mid('l5', 0.45), mid('l5', 0.7)));
    A(1 - sunOn, () => { dot(F1.x, F1.y, 8, C.brassLight); });
    A(sunOn, () => sunBall(F1.x, F1.y, 26, t));
    dot(F2.x, F2.y, 8, 'rgba(0,0,0,0)'); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(F2.x, F2.y, 9, 0, TAU); ctx.stroke();
    mono('FOCUS', F1.x, F1.y + 86, { size: 32, color: C.brassLight, align: 'center' });
    mono('FOCUS', F2.x, F2.y + 50, { size: 32, color: C.brassLight, align: 'center' });
    A(sunOn, () => mono('(EMPTY)', F2.x, F2.y + 90, { size: 32, color: C.ivoryFaint, align: 'center' }));
    label('DIAGRAM · TWO PINS AND A LOOP OF STRING', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('l5'), s('l6'), 0.5, 0.45), () => heading(RX, 300, 'AN ELLIPSE HAS', 'Two foci', 'the Sun sits at one; the other is empty', { size: 100 }));
  A(span(t, s('l6'), s('l7'), 0.5, 0.45), () => heading(RX, 300, 'KEPLER’S FIRST LAW', 'An ellipse, with the Sun at one focus', null, { size: 84 }));
  // l7–l10: Mars's real orbit
  const marsA = span(t, s('l7') - 0.2, DURATION, 0.6, 0);
  A(marsA, () => {
    const o = MARS_O;
    ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(147,188,235,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(o.cx, o.cy, o.a, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    drawEllipse(o, { color: C.copper, w: 3 });
    crossMark(o.cx, o.cy, 12, C.ivory);
    sunBall(o.sun.x, o.sun.y, 18, t);
    const tau = (t - s('l7')) / 14, p = o.atTau(tau);
    planet(p.x, p.y, 14, 'mars');
    A(eout(seg(t, s('l8'), s('l8', 0.8))), () => {
      const y = o.cy - 150;
      line(o.sun.x, o.cy - 30, o.sun.x, y + 10, 'rgba(255,227,161,0.6)', 1.5, [5, 5]); line(o.cx, o.cy - 20, o.cx, y + 10, 'rgba(255,227,161,0.6)', 1.5, [5, 5]);
      bracket(o.sun.x, o.cx, y, null, C.gold);
      mono('9.3%', (o.sun.x + o.cx) / 2, y - 26, { size: 40, w: 600, color: C.gold, align: 'center' });
    });
    label('MARS’S ORBIT TO SCALE · DASHED: A CIRCLE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('l7'), s('l8'), 0.5, 0.45), () => {
    heading(RX, 230, 'MARS’S ORBIT', 'Barely squashed', null, { size: 96 });
    mono('width ÷ length', RX, 470, { size: 40, color: C.ivorySoft });
    mono(fix(MARS_O.b / MARS_O.a, 4), RX, 570, { size: 96, w: 600, color: C.ivory });
    para('less than half a percent narrower', RX, 660, RW, { size: 46, italic: true, color: C.ivorySoft });
  });
  A(span(t, s('l8'), s('l9'), 0.5, 0.45), () => {
    heading(RX, 230, 'BUT THE SUN', 'Well off-centre', null, { size: 96 });
    mono('centre to Sun ÷ centre to end', RX, 470, { size: 36, color: C.ivorySoft });
    mono(`${fix(100 * MARS_O.ecc, 1)}%`, RX, 570, { size: 96, w: 600, color: C.gold });
    para('the eccentricity, 0.093', RX, 660, RW, { size: 46, italic: true, color: C.ivorySoft });
  });
  A(span(t, s('l9'), s('l10'), 0.5, 0.45), () => {
    label('ECCENTRICITY · HOW STRETCHED', RX, 230);
    ECC6.forEach(([n, v], i) => {
      const y = 300 + i * 92, p = eio(seg(t, s('l9', 0.2 + i * 0.12), s('l9', 1.0 + i * 0.12)));
      const col = n === 'MARS' ? C.copper : n === 'MERCURY' ? C.brassLight : C.ivorySoft;
      mono(n, RX, y + 34, { size: 32, color: col });
      ctx.fillStyle = col; ctx.fillRect(RX + 200, y + 6, v * 2000 * p, 36);
      mono(fix(v, 3), RX + 200 + v * 2000 * p + 16, y + 36, { size: 32, color: col });
    });
    mono('NASA PLANETARY FACT SHEET', RX, 880, { size: 32, color: C.ivoryFaint, spacing: '2px' });
  });
  A(span(t, s('l10'), DURATION, 0.5, 0), () => {
    plate(RX + 40, 250, RW - 80, 560, { r: 20 });
    label('PUBLISHED 1609', RX + RW / 2, 330, { align: 'center' });
    txt('Astronomia', RX + RW / 2, 470, { size: 104, w: 600, color: C.gold, align: 'center' });
    txt('nova', RX + RW / 2, 580, { size: 104, w: 600, italic: true, color: C.gold, align: 'center' });
    rule(RX + 200, RX + RW - 200, 630, 0.7);
    txt('The New Astronomy', RX + RW / 2, 710, { size: 52, italic: true, color: C.ivory, align: 'center' });
  });
}

// ---------- 5: Sweeping the areas ----------
const AUX = Orbit(DC.x, DC.y, 300, 0.5);
const SW = Orbit(DC.x, DC.y, 330, 0.6), P_SW = 9.6;
const SW_SHARE = [...Array(12).keys()].map((i) => shoelace(wedge(SW, 0.5 + i / 12, 0.5 + (i + 1) / 12, 400)) / (Math.PI * SW.a * SW.b));
const SW_ARC = [...Array(12).keys()].map((i) => { const pts = wedge(SW, 0.5 + i / 12, 0.5 + (i + 1) / 12, 400).slice(1); let L = 0; for (let j = 1; j < pts.length; j++) L += Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y); return L; });
const ARC_MAX = Math.max(...SW_ARC), ARC_MIN = Math.min(...SW_ARC);
const FAST = (1 + SW.ecc) / (1 - SW.ecc); // 4
const MARS_ITER = (() => { const out = [1.0]; let E = 1.0; for (let i = 0; i < 4; i++) { E = 1.0 + 0.0934 * Math.sin(E); out.push(E); } return out; })();
function partSweep(t) {
  const base = span(t, s('k1') - 0.6, DURATION, 0.6, 0);
  A(base, () => ring(0.6));
  // k1–k6: the construction behind Kepler's equation (e = 0.5)
  const aux = span(t, s('k1') - 0.6, s('k7', 0.2), 0.6, 0.6);
  A(aux, () => {
    const o = AUX, M = TAU * ((t - s('k1')) / 11) + 0.4, E = solveE(M, o.ecc), P = o.atE(E);
    const Q = { x: o.cx - o.a * Math.cos(E), y: o.cy + o.a * Math.sin(E) }, Mq = { x: o.cx - o.a * Math.cos(M), y: o.cy + o.a * Math.sin(M) };
    ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(147,188,235,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(o.cx, o.cy, o.a, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    drawEllipse(o);
    line(o.cx - o.a - 20, o.cy, o.cx + o.a + 20, o.cy, 'rgba(201,162,78,0.35)', 1.5, [6, 8]);
    crossMark(o.cx, o.cy, 10);
    sunBall(o.sun.x, o.sun.y, 22, t);
    const mA = eout(seg(t, s('k2', 0.3), s('k2', 1.1)));
    A(mA, () => { line(o.cx, o.cy, Mq.x, Mq.y, C.ivory, 3); dot(Mq.x, Mq.y, 7, C.ivory); mono('M', Mq.x + (Mq.x - o.cx) * 0.12, Mq.y + (Mq.y - o.cy) * 0.12, { size: 44, w: 600, color: C.ivory, align: 'center', base: 'middle' }); });
    const eA = eout(seg(t, s('k3', 0.2), s('k3', 1.0)));
    A(eA, () => {
      line(o.cx, o.cy, Q.x, Q.y, C.gold, 3); line(Q.x, Q.y, P.x, P.y, 'rgba(255,227,161,0.7)', 1.5, [4, 5]); dot(Q.x, Q.y, 6, C.gold);
      mono('E', Q.x + (Q.x - o.cx) * 0.14, Q.y + (Q.y - o.cy) * 0.14, { size: 44, w: 600, color: C.gold, align: 'center', base: 'middle' });
    });
    armLine(o.sun, P, 3); planet(P.x, P.y, 14);
    label('DIAGRAM · THE CIRCLE AROUND THE ELLIPSE, e = 0.5', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('k1'), s('k2'), 0.5, 0.45), () => heading(RX, 280, 'THE QUESTION', 'Where is the planet on a given day?', null, { size: 84 }));
  A(span(t, s('k2'), s('k4'), 0.5, 0.45), () => {
    label('THREE LETTERS', RX, 250);
    mono('M', RX, 380, { size: 80, w: 600, color: C.ivory }); para('time, ticking round steadily', RX + 110, 362, RW - 110, { size: 44, italic: true, color: C.ivorySoft });
    A(eout(seg(t, s('k3'), s('k3', 0.6))), () => { mono('E', RX, 520, { size: 80, w: 600, color: C.gold }); para('where the planet really is', RX + 110, 502, RW - 110, { size: 44, italic: true, color: C.ivorySoft }); });
    A(eout(seg(t, mid('k3', 0.55), mid('k3', 0.75))), () => { mono('e', RX, 660, { size: 80, w: 600, color: C.brassLight }); para('how stretched: here 0.5', RX + 110, 642, RW - 110, { size: 44, italic: true, color: C.ivorySoft }); });
  });
  A(span(t, s('k4'), DURATION, 0.5, 0) * (1 - span(t, s('k7'), DURATION, 0.5, 0)), () => {
    label('KEPLER’S EQUATION · 1609', RX, 250);
    mono('M = E − e sin E', RX, 360, { size: 72, w: 600, color: C.ivory });
    rule(RX, RX + RW, 400, 0.5);
    A(eout(seg(t, s('k5', 0.4), s('k5', 1.2))), () => {
      label('KEPLER’S METHOD · 1621', RX, 470);
      mono('E ← M + e sin E', RX, 560, { size: 60, w: 600, color: C.gold });
      mono('guess, then repeat', RX, 615, { size: 32, color: C.ivoryFaint });
    });
    A(eout(seg(t, s('k6'), s('k6', 0.6))), () => {
      label('FOR MARS: e = 0.0934, M = 1', RX, 690);
      MARS_ITER.forEach((E, i) => {
        const at = s('k6', 0.6 + i * ((e('k6') - s('k6') - 0.6) / 5));
        A(eout(seg(t, at, at + 0.4)), () => {
          const x = RX + (i % 5) * 148;
          mono(i === 0 ? 'start' : `round ${i}`, x, 750, { size: 32, color: C.ivoryFaint });
          mono(fix(E, 4), x, 805, { size: 36, w: 600, color: i >= 3 ? C.gold : C.ivory });
        });
      });
    });
  });
  // k7–k12: the stretched orbit, swept in twelve equal times
  const T0 = s('k8', 0.3);
  const tau = 0.5 + (t - T0) / P_SW;
  const swA = span(t, s('k7') - 0.3, DURATION, 0.6, 0);
  A(swA, () => {
    const o = SW;
    drawEllipse(o);
    for (let i = 0; i < 12; i++) {
      const a0 = 0.5 + i / 12, part = clamp((tau - a0) * 12);
      if (part <= 0) continue;
      const lit = (t > s('k9') && t < s('k11') && (i === 5 || i === 0)) || (t > s('k10') && t < s('k12') && (i === 6 || i === 11));
      poly(wedge(o, a0, a0 + part / 12)); ctx.fillStyle = lit ? 'rgba(255,227,161,0.62)' : i % 2 ? C.wedgeB : C.wedgeA; ctx.fill();
      ctx.strokeStyle = lit ? C.gold : 'rgba(241,213,142,0.55)'; ctx.lineWidth = lit ? 2.5 : 1.2; ctx.stroke();
    }
    sunBall(o.sun.x, o.sun.y, 26, t);
    const p = o.atTau(tau);
    armLine(o.sun, p, 4); planet(p.x, p.y, 16);
    A(span(t, s('k10'), s('k12'), 0.5, 0.5), () => {
      for (const i of [6, 11]) {
        const pts = wedge(o, 0.5 + i / 12, 0.5 + (i + 1) / 12), c = pts.reduce((q, r) => ({ x: q.x + r.x / pts.length, y: q.y + r.y / pts.length }), { x: 0, y: 0 });
        plate(c.x - 72, c.y - 28, 144, 56, { r: 12 });
        mono(`${fix(100 * SW_SHARE[i], 1)}%`, c.x, c.y + 12, { size: 34, w: 600, color: C.gold, align: 'center' });
      }
    });
    A(span(t, s('k12'), DURATION, 0.5, 0), () => {
      const pe = o.atE(0), ap = o.atE(Math.PI), v = 70;
      arrow(pe.x, pe.y, pe.x, pe.y + v * FAST * 0.62, C.gold, 5);
      arrow(ap.x, ap.y, ap.x, ap.y - v * 0.62, C.steel, 5);
      mono('PERIHELION', pe.x + 24, pe.y + 120, { size: 32, color: C.gold });
      mono('APHELION', ap.x - 20, ap.y - 70, { size: 32, color: C.steel, align: 'right' });
    });
    label('DIAGRAM · ORBIT STRETCHED FOR CLARITY, e = 0.6', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('k7'), s('k8'), 0.5, 0.45), () => {
    heading(RX, 250, 'SOLVED FOR EVERY FRAME', 'A stretched orbit', null, { size: 88 });
    const E = solveE(TAU * tau, SW.ecc), M = ((TAU * tau) % TAU + TAU) % TAU;
    mono(`M = ${fix(M, 3)}`, RX, 520, { size: 52, color: C.ivory });
    mono(`E = ${fix(E, 3)}`, RX, 600, { size: 52, color: C.gold });
    mono(`e = ${fix(SW.ecc, 1)}`, RX, 680, { size: 52, color: C.brassLight });
  });
  // the two charts: area per wedge (all equal), distance per wedge (not)
  A(span(t, s('k8'), DURATION, 0.5, 0), () => {
    const x0 = RX + 10, bw = 50, gap = 12;
    label('AREA SWEPT IN EACH TWELFTH', x0, 240);
    for (let i = 0; i < 12; i++) {
      const done = clamp((tau - 0.5 - i / 12) * 12), h = 230 * SW_SHARE[i] * 12;
      if (done <= 0) continue;
      ctx.fillStyle = i % 2 ? 'rgba(233,188,98,0.6)' : 'rgba(233,188,98,0.9)'; ctx.fillRect(x0 + i * (bw + gap), 520 - h * done, bw, h * done);
    }
    line(x0, 520, x0 + 12 * (bw + gap), 520, C.brass, 2);
    A(eout(seg(t, s('k10'), s('k10', 0.6))), () => mono('each 1/12 = 8.3%', x0, 580, { size: 40, w: 600, color: C.gold }));
    A(eout(seg(t, s('k11'), s('k11', 0.6))), () => {
      label('DISTANCE TRAVELLED IN EACH', x0, 680);
      for (let i = 0; i < 12; i++) { const h = 200 * (SW_ARC[i] / ARC_MAX) * eio(seg(t, s('k11', 0.2 + i * 0.06), s('k11', 0.9 + i * 0.06))); ctx.fillStyle = i === 5 || i === 6 ? C.gold : i === 0 || i === 11 ? C.steel : 'rgba(147,188,235,0.55)'; ctx.fillRect(x0 + i * (bw + gap), 940 - h, bw, h); }
      line(x0, 940, x0 + 12 * (bw + gap), 940, C.brass, 2);
    });
    A(eout(seg(t, s('k12', 0.6), s('k12', 1.4))), () => {
      plate(RX + 450, 535, 294, 70, { r: 14 });
      mono(`${fix(FAST, 0)}× faster`, RX + 597, 584, { size: 40, w: 600, color: C.gold, align: 'center' });
    });
  });
}

// ---------- 6: Fast and slow ----------
const MARS_V = [26.50, 21.97]; // NASA Mars fact sheet, km/s
const HAL = { rp: 0.59278, ra: 35.14 }; HAL.a = (HAL.rp + HAL.ra) / 2; HAL.e = (HAL.ra - HAL.rp) / (HAL.ra + HAL.rp); HAL.P = Math.pow(HAL.a, 1.5);
const halleyR = (tau) => HAL.a * (1 - HAL.e * Math.cos(solveE(TAU * tau, HAL.e)));
const HAL_IN_JUP = (() => { const E = Math.acos((1 - 5.2 / HAL.a) / HAL.e); return (2 * (E - HAL.e * Math.sin(E)) / TAU) * HAL.P; })();
// Earth's two half-years, split by the equinox line: Kepler's equation from each equinox to the next
const HALF = (() => {
  const Mof = (nuDeg) => { const nu = rad(nuDeg), E = 2 * Math.atan(Math.sqrt((1 - E_EARTH) / (1 + E_EARTH)) * Math.tan(nu / 2)); return ((E - E_EARTH * Math.sin(E)) % TAU + TAU) % TAU; };
  const marN = 180 - VARPI, sepN = 360 - VARPI, d = ((Mof(sepN) - Mof(marN)) / TAU + 1) % 1;
  return { marN, sepN, summer: d * YEAR, winter: (1 - d) * YEAR };
})();
function partFast(t) {
  const base = span(t, s('f1') - 0.6, s('f9', 0.2), 0.6, 0.6);
  A(base, () => ring(0.7));
  // f1–f7: Earth's year again, keyed so it passes perihelion during f2 and aphelion during f3
  const rateF = 182 / (mid('f3', 0.6) - mid('f2', 0.6)), day = PERI_DAY + (t - mid('f2', 0.6)) * rateF;
  const eA = span(t, s('f1') - 0.6, s('f8', 0.2), 0.6, 0.6);
  const halves = span(t, s('f5'), s('f8'), 0.6, 0.6);
  A(eA, () => {
    if (halves > 0) A(halves, () => {
      // the equinox line through the Sun, and the two halves of the orbit
      const dirAt = (nuDeg) => { const nu = rad(nuDeg); return { x: -Math.cos(nu), y: Math.sin(nu) }; };
      const half = (n0, n1) => { const pts = [earthO.sun]; for (let j = 0; j <= 60; j++) { const nu = rad(lerp(n0, n1, j / 60)), r = earthO.a * (1 - E_EARTH * E_EARTH) / (1 + E_EARTH * Math.cos(nu)); pts.push({ x: earthO.sun.x - Math.cos(nu) * r, y: earthO.sun.y + Math.sin(nu) * r }); } return pts; };
      poly(half(HALF.marN, HALF.sepN)); ctx.fillStyle = 'rgba(147,188,235,0.22)'; ctx.fill();
      poly(half(HALF.sepN, HALF.marN + 360)); ctx.fillStyle = 'rgba(233,188,98,0.24)'; ctx.fill();
      const d1 = dirAt(HALF.marN), d2 = dirAt(HALF.sepN);
      line(earthO.sun.x + d2.x * 400, earthO.sun.y + d2.y * 400, earthO.sun.x + d1.x * 400, earthO.sun.y + d1.y * 400, C.ivory, 2, [10, 8]);
      mono('MARCH EQUINOX', earthO.sun.x + d1.x * 330 + 20, earthO.sun.y + d1.y * 330 - 70, { size: 32, color: C.ivory, align: 'left' });
      mono('SEPT. EQUINOX', earthO.sun.x + d2.x * 330 - 20, earthO.sun.y + d2.y * 330 + 80, { size: 32, color: C.ivory, align: 'right' });
    });
    earthYear(day, { months: 1 - halves * 0.7 });
    A(span(t, s('f2', 0.4), s('f5'), 0.5, 0.5), () => {
      const pe = earthO.atE(0), ap = earthO.atE(Math.PI);
      A(eout(seg(t, s('f2', 0.4), s('f2', 1.0))), () => { mono('PERIHELION', pe.x + 40, pe.y - 60, { size: 32, color: C.gold }); mono('~3 JAN', pe.x + 40, pe.y - 20, { size: 32, color: C.gold }); });
      A(eout(seg(t, s('f3', 0.2), s('f3', 0.8))), () => { mono('APHELION', ap.x - 40, ap.y - 60, { size: 32, color: C.steel, align: 'right' }); mono('~4 JUL', ap.x - 40, ap.y - 20, { size: 32, color: C.steel, align: 'right' }); });
    });
    label('EARTH’S ORBIT TO SCALE · SUN OFF-CENTRE BY 1.7%', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('f1'), s('f2'), 0.5, 0.45), () => heading(RX, 280, 'EARTH · e = 0.0167', 'Much rounder', 'but the rule still holds', { size: 100 }));
  A(span(t, s('f2'), s('f5'), 0.5, 0.45), () => {
    label('DISTANCE FROM THE SUN', RX, 230);
    A(eout(seg(t, s('f2', 0.3), s('f2', 1.0))), () => { mono('147.1', RX, 340, { size: 80, w: 600, color: C.gold }); mono('million km · ~3 Jan', RX + 270, 330, { size: 32, color: C.ivorySoft }); });
    A(eout(seg(t, s('f3', 0.2), s('f3', 0.8))), () => { mono('152.1', RX, 450, { size: 80, w: 600, color: C.steel }); mono('million km · ~4 Jul', RX + 270, 440, { size: 32, color: C.ivorySoft }); });
    A(eout(seg(t, s('f4'), s('f4', 0.7))), () => speedGraph(RX + 90, 580, 640, 260, day, { marks: seg(t, s('f4', 0.6), s('f4', 1.2)) }));
  });
  A(span(t, s('f5'), s('f8'), 0.5, 0.45), () => {
    label('EQUINOX TO EQUINOX', RX, 230);
    const bars = [['MARCH → SEPTEMBER', HALF.summer, C.steel, s('f5', 0.6)], ['SEPTEMBER → MARCH', HALF.winter, C.gold, s('f6', 0.3)]];
    bars.forEach(([n, d, col, at], i) => {
      const y = 300 + i * 190, p = eio(seg(t, at, at + 1.0));
      A(seg(t, at, at + 0.3), () => {
        mono(n, RX, y + 30, { size: 32, color: col });
        ctx.fillStyle = col; ctx.fillRect(RX, y + 54, (d / 190) * 480 * p, 50);
        mono(`${fix(d * p, 1)} days`, RX + (d / 190) * 480 * p + 18, y + 94, { size: 40, w: 600, color: col });
      });
    });
    A(eout(seg(t, s('f7'), s('f7', 0.7))), () => {
      plate(RX, 690, RW, 200, { r: 16 });
      txt('Northern spring and summer', RX + 34, 770, { size: 48, w: 600 });
      txt(`${fix(HALF.summer - HALF.winter, 1)} days longer: about a week`, RX + 34, 836, { size: 46, italic: true, color: C.gold });
    });
  });
  // f8: Mars
  const mA = span(t, s('f8') - 0.3, s('f9', 0.2), 0.6, 0.6);
  A(mA, () => {
    const o = Orbit(DC.x, DC.y, 360, 0.0934), tau = (t - s('f8')) / 8, E = solveE(TAU * tau, o.ecc), p = o.atE(E);
    drawEllipse(o, { color: C.copper, w: 3 });
    sunBall(o.sun.x, o.sun.y, 22, t);
    const q = o.atE(E + 0.01), L = Math.hypot(q.x - p.x, q.y - p.y), v = 29.78 * Math.sqrt(2 / (1.5237 * (1 - o.ecc * Math.cos(E))) - 1 / 1.5237);
    armLine(o.sun, p, 3);
    arrow(p.x, p.y, p.x + ((q.x - p.x) / L) * v * 5, p.y + ((q.y - p.y) / L) * v * 5, C.gold, 4);
    planet(p.x, p.y, 15, 'mars');
    mono(`${fix(v, 1)} km/s`, p.x + 30, p.y - 30, { size: 36, w: 600, color: C.gold });
    label('MARS’S ORBIT TO SCALE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('f8'), s('f9'), 0.5, 0.45), () => {
    label('MARS · NASA FACT SHEET', RX, 230);
    [['NEAR THE SUN', MARS_V[0], C.gold], ['AT THE FAR END', MARS_V[1], C.steel]].forEach(([n, v, col], i) => {
      const y = 300 + i * 190, p = eio(seg(t, s('f8', 0.4 + i * 0.6), s('f8', 1.4 + i * 0.6)));
      mono(n, RX, y + 30, { size: 32, color: col });
      ctx.fillStyle = col; ctx.fillRect(RX, y + 54, v * 18 * p, 50);
      mono(`${fix(v, 1)} km/s`, RX + v * 18 * p + 18, y + 94, { size: 40, w: 600, color: col });
    });
  });
  // f9–f13: Halley's Comet, to scale, across the whole width
  const hA = span(t, s('f9') - 0.3, DURATION, 0.7, 0);
  A(hA, () => {
    const px = 41, sun = { x: 1640, y: 560 }, cx = sun.x - (HAL.a - HAL.rp) * px, bpx = HAL.a * Math.sqrt(1 - HAL.e * HAL.e) * px, apx = HAL.a * px;
    // planets' orbits, as circles, clipped to the screen
    for (const [n, r] of [['EARTH', 1], ['JUPITER', 5.2], ['SATURN', 9.54], ['URANUS', 19.2], ['NEPTUNE', 30.1]]) {
      ctx.strokeStyle = n === 'JUPITER' ? 'rgba(241,213,142,0.5)' : 'rgba(147,188,235,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sun.x, sun.y, r * px, 0, TAU); ctx.stroke();
      if (r > 1) mono(n, sun.x - r * px + 10, sun.y - 14, { size: 32, color: n === 'JUPITER' ? C.brassLight : 'rgba(147,188,235,0.7)', align: 'left' });
    }
    // the comet's orbit, drawn on as it travels
    const tau = halleyTau(t);
    const hiIn = span(t, s('f13'), DURATION, 0.5, 0);
    ctx.beginPath(); ctx.ellipse(cx, sun.y, apx, bpx, 0, 0, TAU); ctx.strokeStyle = 'rgba(244,234,211,0.75)'; ctx.lineWidth = 2.5; ctx.stroke();
    A(hiIn, () => {
      ctx.save(); ctx.beginPath(); ctx.arc(sun.x, sun.y, 5.2 * px, 0, TAU); ctx.clip();
      ctx.beginPath(); ctx.ellipse(cx, sun.y, apx, bpx, 0, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    });
    sunBall(sun.x, sun.y, 14, t);
    // the comet, on a clock that runs at a steady rate (see halleyTau); perihelion on the right, next to the Sun
    const E = solveE(TAU * tau, HAL.e), cp = { x: cx + apx * Math.cos(E), y: sun.y - bpx * Math.sin(E) };
    const r = HAL.a * (1 - HAL.e * Math.cos(E)), v = earthSpeed(r, HAL.a);
    const tail = { x: cp.x - sun.x, y: cp.y - sun.y }, tl = Math.hypot(tail.x, tail.y);
    const tg = ctx.createLinearGradient(cp.x, cp.y, cp.x + (tail.x / tl) * 90, cp.y + (tail.y / tl) * 90);
    tg.addColorStop(0, 'rgba(220,235,255,0.7)'); tg.addColorStop(1, 'rgba(220,235,255,0)');
    line(cp.x, cp.y, cp.x + (tail.x / tl) * 90, cp.y + (tail.y / tl) * 90, tg, 6);
    planet(cp.x, cp.y, 9, 'comet');
    label('HALLEY’S COMET · ORBITS TO SCALE, DRAWN FLAT', 140, 1000 - 36, { color: C.ivoryFaint, size: 32, spacing: '1px' });
    // readouts, top left
    A(seg(t, s('f9', 0.6), s('f9', 1.4)), () => {
      label('DISTANCE FROM THE SUN', 140, 200, { color: C.ivoryFaint });
      mono(`${fix(r, r < 2 ? 2 : 1)} AU`, 140, 290, { size: 72, w: 600, color: C.ivory });
      label('SPEED', 720, 200, { color: C.ivoryFaint });
      mono(`${fix(v, v < 2 ? 2 : 1)} km/s`, 720, 290, { size: 72, w: 600, color: r > 20 ? C.steel : C.gold });
      label('YEARS SINCE PERIHELION', 1200, 200, { color: C.ivoryFaint });
      mono(fix(((tau % 1) + 1) % 1 * HAL.P, 1), 1200, 290, { size: 72, w: 600, color: C.ivory });
    });
    A(span(t, s('f9', 1.0), s('f11'), 0.5, 0.5), () => {
      mono('0.6 AU', sun.x - 20, sun.y + bpx * 0.15 + 120, { size: 32, color: C.gold, align: 'right' });
      mono('35 AU', cx - apx + 20, sun.y + 60, { size: 32, color: C.steel, align: 'left' });
    });
    A(span(t, s('f10'), s('f11'), 0.5, 0.5), () => {
      const y = sun.y + bpx + 120; bracket(sun.x - px, sun.x, y, null, C.brassLight, false); mono('1 AU', sun.x - px / 2, y + 52, { size: 32, color: C.brassLight, align: 'center' });
      mono('one AU = Earth’s average distance from the Sun', sun.x - px - 40, y + 10, { size: 32, color: C.ivorySoft, align: 'right' });
    });
    // f12: an inset near the Sun, where the comet whips round (its own clock, ±150 days)
    A(span(t, s('f12', 0.6), s('f13', 0.4), 0.6, 0.5), () => {
      const ix = 1380, iy = 820, R = 150, zp = 120; // 120 px per AU
      ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, R, 0, TAU); ctx.fillStyle = 'rgba(3,6,15,0.92)'; ctx.fill(); ctx.clip();
      const pts = []; for (let j = -60; j <= 60; j++) { const E2 = solveE(TAU * (j / 60) * 0.012, HAL.e); pts.push({ x: ix + (HAL.rp - HAL.a * (1 - Math.cos(E2))) * zp + 0, y: iy - HAL.a * Math.sqrt(1 - HAL.e * HAL.e) * Math.sin(E2) * zp }); }
      ctx.translate(-0.3 * zp, 0);
      poly(pts, false); ctx.strokeStyle = 'rgba(244,234,211,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(147,188,235,0.4)'; ctx.beginPath(); ctx.arc(ix, iy, zp, 0, TAU); ctx.stroke();
      sunBall(ix, iy, 9, t);
      const ph = lerp(-0.006, 0.006, clamp(seg(t, s('f12', 1.0), e('f12', 0.8)))), E2 = solveE(TAU * ph, HAL.e);
      const q = { x: ix + (HAL.rp - HAL.a * (1 - Math.cos(E2))) * zp, y: iy - HAL.a * Math.sqrt(1 - HAL.e * HAL.e) * Math.sin(E2) * zp };
      planet(q.x, q.y, 7, 'comet');
      ctx.restore();
      ctx.strokeStyle = C.brass; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ix, iy, R, 0, TAU); ctx.stroke();
      const r2 = HAL.a * (1 - HAL.e * Math.cos(E2)), v2 = earthSpeed(r2, HAL.a);
      label('NEAR THE SUN', ix - R - 30, iy - 70, { align: 'right', color: C.gold });
      mono(`${fix(v2, 0)} km/s`, ix - R - 30, iy + 10, { size: 64, w: 600, color: C.gold, align: 'right' });
      { const dd = Math.round(ph * HAL.P * 365.25); mono(`${dd > 0 ? '+' : dd < 0 ? '−' : ''}${Math.abs(dd)} days from perihelion`, ix - R - 30, iy + 60, { size: 32, color: C.ivorySoft, align: 'right' }); }
    });
    A(span(t, s('f11'), s('f12', 0.6), 0.5, 0.5), () => {
      plate(140, 760, 760, 150, { r: 16 });
      txt('far out: crawling', 180, 830, { size: 52, w: 600, color: C.steel });
      mono('0.91 km/s · 9 Dec 2023', 180, 880, { size: 32, color: C.ivorySoft });
    });
    A(span(t, s('f12'), DURATION, 0.5, 0), () => {
      mono('speed × distance:', 140, 800, { size: 36, color: C.ivorySoft });
      mono(`0.91 × ${fix(HAL.ra, 1)} ≈ v × ${fix(HAL.rp, 2)}`, 140, 856, { size: 40, w: 600, color: C.ivory });
      mono(`v ≈ ${fix(0.91 * HAL.ra / HAL.rp, 0)} km/s`, 140, 912, { size: 40, w: 600, color: C.gold });
    });
    A(span(t, s('f13', 0.4), DURATION, 0.5, 0), () => {
      plate(1040, 770, 760, 170, { r: 16 });
      txt(`only about ${fix(HAL_IN_JUP, 0)} of its roughly 75 years`, 1076, 840, { size: 48, w: 600, color: C.gold });
      txt('inside Jupiter’s orbit · back in 2061', 1076, 900, { size: 42, italic: true, color: C.ivory });
    });
  });
}
// Halley's clock: out to aphelion during f9–f11, then back toward the Sun; a constant rate within each stretch
function halleyTau(t) {
  const t0 = s('f9', 0.3), tA = mid('f11', 0.5), t1 = e('f13', 0.6);
  if (t < tA) return 0.5 * seg(t, t0, tA) + 0.003;
  return 0.5 + 0.45 * seg(t, tA, t1);
}

// ---------- 7: The harmony of the world ----------
const KEP = [['MERCURY', 0.389, 87.77], ['VENUS', 0.724, 224.70], ['EARTH', 1, 365.25], ['MARS', 1.524, 686.95], ['JUPITER', 5.20, 4332.62], ['SATURN', 9.510, 10759.2]]; // Kepler's 1618 values
const MOONS = [['IO', 421800, 1.769], ['EUROPA', 671100, 3.551], ['GANYMEDE', 1070400, 7.155], ['CALLISTO', 1882700, 16.689]];
function partHarmony(t) {
  const base = span(t, s('h1') - 0.6, s('h12', 0.2), 0.6, 0.6);
  A(base, () => {
    ring(0.5);
    const px = 38;
    sunBall(DC.x, DC.y, 14, t);
    KEP.forEach(([n, a, P], i) => {
      ctx.strokeStyle = n === 'JUPITER' ? 'rgba(241,213,142,0.8)' : 'rgba(201,162,78,0.55)'; ctx.lineWidth = n === 'JUPITER' ? 2.5 : 1.5; ctx.beginPath(); ctx.arc(DC.x, DC.y, a * px, 0, TAU); ctx.stroke();
      const an = 0.7 * i + ((t - s('h1')) / (P / 365.25)) * TAU / 3.5, p = { x: DC.x + Math.cos(an) * a * px, y: DC.y - Math.sin(an) * a * px };
      planet(p.x, p.y, a > 4 ? 10 : 6, n === 'MARS' ? 'mars' : n === 'EARTH' ? 'earth' : n === 'JUPITER' ? 'jup' : 'steel');
      if (a > 4) mono(n, p.x, p.y - 26, { size: 32, color: n === 'JUPITER' ? C.brassLight : C.ivorySoft, align: 'center' });
    });
    label('THE SIX PLANETS KEPLER KNEW · TO SCALE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('h1'), s('h2'), 0.5, 0.45), () => heading(RX, 280, 'ONE RULE FOR ALL', 'All the planets', 'not just one', { size: 100 }));
  A(span(t, s('h2'), s('h3'), 0.5, 0.45), () => heading(RX, 280, 'BY HIS OWN ACCOUNT', '8 March 1618', null, { size: 100 }));
  // the table, from Kepler's own numbers
  const tabA = span(t, s('h3'), s('h7', 0.3), 0.5, 0.45);
  A(tabA, () => {
    const cols = [RX, RX + 320, RX + 460, RX + 600, RX + 730], y0 = 250, rh = 62;
    label('KEPLER’S NUMBERS, 1618', RX, y0 - 20);
    mono('', RX, y0); mono('T years', cols[1], y0 + 40, { size: 32, color: C.ivoryFaint, align: 'right' }); mono('T²', cols[2], y0 + 40, { size: 32, color: C.gold, align: 'right' });
    mono('a AU', cols[3], y0 + 40, { size: 32, color: C.ivoryFaint, align: 'right' }); mono('a³', cols[4], y0 + 40, { size: 32, color: C.gold, align: 'right' });
    rule(RX, RX + RW, y0 + 60, 0.5);
    KEP.forEach(([n, a, P], i) => {
      const y = y0 + 110 + i * rh, Ty = P / 365.25, show = eout(seg(t, s('h3', 0.3 + i * 0.25), s('h3', 0.8 + i * 0.25)));
      A(show, () => {
        const jup = n === 'JUPITER';
        if (jup) {
          A(span(t, s('h4'), s('h6'), 0.4, 0.4), () => { k.rrect(cols[1] - 140, y - 42, 290, 56, 10); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); });
          A(span(t, s('h5'), s('h6'), 0.4, 0.4), () => { k.rrect(cols[3] - 106, y - 42, cols[4] - cols[3] + 118, 56, 10); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); });
        }
        mono(n, RX, y, { size: 32, color: jup ? C.brassLight : C.ivorySoft });
        mono(fix(Ty, Ty < 1 ? 3 : 2), cols[1], y, { size: 34, color: C.ivory, align: 'right' });
        mono(fix(Ty * Ty, Ty * Ty < 10 ? 3 : 1), cols[2], y, { size: 34, w: 600, color: C.gold, align: 'right' });
        mono(fix(a, a < 1 ? 3 : 2), cols[3], y, { size: 34, color: C.ivory, align: 'right' });
        mono(fix(a * a * a, a < 2 ? 3 : 1), cols[4], y, { size: 34, w: 600, color: C.gold, align: 'right' });
      });
    });
    A(eout(seg(t, s('h6', 0.3), s('h6', 1.0))), () => {
      const ratios = KEP.map(([, a, P]) => (a * a * a) / Math.pow(P / 365.25, 2));
      rule(RX, RX + RW, y0 + 110 + 6 * rh - 30, 0.5);
      mono(`a³ ÷ T²: ${fix(Math.min(...ratios), 2)} to ${fix(Math.max(...ratios), 2)}`, RX, y0 + 110 + 6 * rh + 30, { size: 40, w: 600, color: C.gold });
    });
  });
  A(span(t, s('h7'), s('h8'), 0.5, 0.45), () => {
    para('“I first believed I was dreaming…”', RX + 20, 520, RW - 40, { size: 76, italic: true, lh: 88, color: C.ivory });
    label('KEPLER, HARMONICE MUNDI', RX + 20, 720, { color: C.ivorySoft });
  });
  A(span(t, s('h8'), s('h9'), 0.5, 0.45), () => {
    plate(RX + 40, 250, RW - 80, 560, { r: 20 });
    label('PUBLISHED 1619', RX + RW / 2, 330, { align: 'center' });
    txt('Harmonice', RX + RW / 2, 470, { size: 100, w: 600, color: C.gold, align: 'center' });
    txt('Mundi', RX + RW / 2, 580, { size: 100, w: 600, italic: true, color: C.gold, align: 'center' });
    rule(RX + 200, RX + RW - 200, 630, 0.7);
    txt('The Harmony of the World', RX + RW / 2, 710, { size: 50, italic: true, color: C.ivory, align: 'center' });
  });
  A(span(t, s('h9'), s('h11'), 0.5, 0.45), () => {
    label('EARTH’S TURNING SPEED, SEEN FROM THE SUN', RX, 230, { size: 32, spacing: '1px' });
    const y0 = 330, gap = 30;
    for (let i = 0; i < 5; i++) line(RX, y0 + i * gap, RX + RW, y0 + i * gap, 'rgba(244,234,211,0.6)', 2);
    const notes = [['MI', 4], ['FA', 3.5], ['MI', 4]]; // E4 on the bottom line, F4 in the first space
    notes.forEach(([n, pos], i) => {
      const at = s('h10', 0.3 + i * 0.5), x = RX + 160 + i * 230, y = y0 + pos * gap;
      A(i === 1 ? 1 : eout(seg(t, i === 0 ? s('h9', 1.0) : at, (i === 0 ? s('h9', 1.0) : at) + 0.5)), () => {
        if (i === 1 && t < s('h9', 1.6)) return;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.ellipse(0, 0, 21, 14, 0, 0, TAU); ctx.fill(); ctx.restore();
        line(x + 19, y - 4, x + 19, y - 110, C.gold, 3);
        mono(n, x, y0 + 4 * gap + 70, { size: 40, w: 600, color: C.gold, align: 'center' });
      });
    });
    const ratio = Math.pow((1 + E_EARTH) / (1 - E_EARTH), 2);
    A(eout(seg(t, s('h9', 2.2), s('h9', 3.0))), () => {
      mono(`fastest ÷ slowest = ${fix(ratio, 3)}`, RX, 640, { size: 40, w: 600, color: C.ivory });
      mono(`a semitone, 16 : 15 = ${fix(16 / 15, 3)}`, RX, 700, { size: 40, color: C.gold });
    });
    A(eout(seg(t, s('h10', 1.6), s('h10', 2.4))), () => para('“The Earth sings Mi, Fa, Mi”', RX, 830, RW, { size: 56, italic: true, color: C.ivory }));
  });
  A(span(t, s('h11'), s('h12'), 0.5, 0.45), () => {
    plate(RX + 40, 250, RW - 80, 560, { r: 20 });
    label('PUBLISHED 1621', RX + RW / 2, 330, { align: 'center' });
    txt('Epitome', RX + RW / 2, 470, { size: 100, w: 600, color: C.gold, align: 'center' });
    txt('Astronomiae Copernicanae', RX + RW / 2, 560, { size: 52, italic: true, color: C.gold, align: 'center' });
    rule(RX + 200, RX + RW - 200, 620, 0.7);
    txt('the area law, in its modern form', RX + RW / 2, 700, { size: 46, italic: true, color: C.ivory, align: 'center' });
  });
  // h12: Jupiter's four bright moons, distances to scale
  A(span(t, s('h12') - 0.4, DURATION, 0.6, 0), () => {
    const px = 380 / 1882700;
    planet(DC.x, DC.y, 34, 'jup');
    MOONS.forEach(([n, a, P], i) => {
      ctx.strokeStyle = 'rgba(201,162,78,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(DC.x, DC.y, a * px, 0, TAU); ctx.stroke();
      const an = 1.3 * i + ((t - s('h12')) / P) * TAU * 0.9, p = { x: DC.x + Math.cos(an) * a * px, y: DC.y - Math.sin(an) * a * px };
      planet(p.x, p.y, 8, 'steel');
      mono(n, DC.x + a * px * Math.cos(-0.5 - i * 0.12) + 10, DC.y - a * px * Math.sin(-0.5 - i * 0.12) + 40, { size: 32, color: C.ivorySoft, align: 'left' });
    });
    label('JUPITER’S FOUR BRIGHT MOONS · DISTANCES TO SCALE', DC.x, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
    A(span(t, s('h12'), DURATION, 0.5, 0), () => heading(RX, 280, 'THE SAME YEAR', 'Jupiter’s moons too', 'the third law fits them', { size: 96 }));
  });
}

// ---------- 8: Newton's reason ----------
/** Newton's construction: straight steps of equal time, a kick toward S at each corner (one revolution). */
function newtonPath(nCirc, law) {
  const S = { x: 600, y: 540 }, r0 = 330;
  let x = { x: 0, y: -r0 }, v, acc;
  if (law === 'inv2') {
    const vc = (TAU * r0) / nCirc, GM = vc * vc * r0;
    v = { x: -0.85 * vc, y: 0 };
    acc = (p) => { const r = Math.hypot(p.x, p.y); return { x: (-GM * p.x) / (r * r * r), y: (-GM * p.y) / (r * r * r) }; };
  } else {
    const K = Math.pow(TAU / nCirc, 2);
    v = { x: -0.55 * Math.sqrt(K) * r0, y: 0 };
    acc = (p) => ({ x: -K * p.x, y: -K * p.y });
  }
  const rel = [x], would = [null];
  x = { x: x.x + v.x, y: x.y + v.y }; rel.push(x);
  let turned = Math.atan2(rel[1].y, rel[1].x) - Math.atan2(rel[0].y, rel[0].x);
  for (let i = 1; i < 400 && Math.abs(turned) < TAU; i++) {
    would.push({ x: x.x + v.x, y: x.y + v.y });
    const a = acc(x); v = { x: v.x + a.x, y: v.y + a.y };
    const nx = { x: x.x + v.x, y: x.y + v.y };
    let d = Math.atan2(nx.y, nx.x) - Math.atan2(x.y, x.x); if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU;
    turned += d; x = nx; rel.push(x);
  }
  const pts = rel.map((p) => ({ x: S.x + p.x, y: S.y + p.y })), wd = would.map((p) => p && { x: S.x + p.x, y: S.y + p.y });
  const areas = pts.slice(0, -1).map((p, i) => shoelace([S, p, pts[i + 1]]));
  return { S, pts, would: wd, areas };
}
const NP12 = newtonPath(12, 'inv2'), NP48 = newtonPath(70, 'inv2'), NPS = newtonPath(16, 'spring');
function newtonDraw(path, upto, { tri = true, alpha = 1, showWould = -1 } = {}) {
  const { S, pts } = path;
  A(alpha, () => {
    const n = Math.min(pts.length - 1, Math.floor(upto)), part = upto - Math.floor(upto);
    for (let i = 0; i < n; i++) {
      if (tri) { poly([S, pts[i], pts[i + 1]]); ctx.fillStyle = i % 2 ? 'rgba(233,188,98,0.2)' : 'rgba(233,188,98,0.38)'; ctx.fill(); ctx.strokeStyle = 'rgba(241,213,142,0.5)'; ctx.lineWidth = 1; ctx.stroke(); }
      line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, C.ivory, 3);
    }
    if (n < pts.length - 1 && part > 0) { const a = pts[n], b = pts[n + 1]; line(a.x, a.y, lerp(a.x, b.x, part), lerp(a.y, b.y, part), C.ivory, 3); }
    for (let i = 0; i <= n; i++) dot(pts[i].x, pts[i].y, 5, C.ivory);
  });
  void showWould;
}
function partNewton(t) {
  const base = span(t, s('n1') - 0.6, DURATION, 0.6, 0);
  A(base, () => ring(0.5));
  A(span(t, s('n1'), s('n4', 0.2), 0.5, 0.5), () => {
    // n1–n3: a smooth orbit, for reference
    const o = Orbit(NP12.S.x + 330 * 0.36, NP12.S.y, 330, 0.36), tau = (t - s('n1')) / 9, p = o.atTau(tau);
    drawEllipse(o, { alpha: 0.8 });
    sunBall(o.sun.x, o.sun.y, 24, t);
    armLine(o.sun, p, 3); planet(p.x, p.y, 14);
  });
  A(span(t, s('n1'), s('n2'), 0.5, 0.45), () => heading(RX, 280, 'BUT WHY?', 'Isaac Newton', null, { size: 100 }));
  A(span(t, s('n2'), s('n3'), 0.5, 0.45), () => heading(RX, 280, '1684', 'Pulled toward a fixed centre', 'equal areas in equal times', { size: 84 }));
  A(span(t, s('n3'), s('n4'), 0.5, 0.45), () => heading(RX, 280, 'PRINCIPIA · 1687 · BOOK 1', 'The pull in short, sharp tugs', null, { size: 84 }));
  // n4–n8: the construction, step by step
  const P = NP12, S = P.S, [A0, B0, C0] = P.pts, c0 = P.would[1];
  const cons = span(t, s('n4') - 0.2, s('n9', 0.2), 0.6, 0.6);
  A(cons, () => {
    sunBall(S.x, S.y, 24, t);
    mono('SUN', S.x, S.y + 74, { size: 32, color: C.brassLight, align: 'center' });
    // n4: two straight steps, A→B→c
    const st1 = eio(seg(t, s('n4', 0.3), s('n4', 1.3))), st2 = eio(seg(t, s('n4', 1.4), s('n4', 2.4)));
    const early = 1 - seg(t, s('n8'), s('n8', 0.6));
    A(early, () => {
    line(A0.x, A0.y, lerp(A0.x, B0.x, st1), lerp(A0.y, B0.y, st1), C.ivory, 3);
    A(seg(t, s('n4', 1.4), s('n4', 1.8)) * (1 - seg(t, s('n6', 0.8), s('n7', 0.2)) * 0.6), () => line(B0.x, B0.y, lerp(B0.x, c0.x, st2), lerp(B0.y, c0.y, st2), C.ivory, 3, [10, 8]));
    dot(A0.x, A0.y, 7, C.ivory); mono('A', A0.x - 10, A0.y - 22, { size: 36, w: 600, color: C.ivory, align: 'center' });
    A(st1, () => { dot(B0.x, B0.y, 7, C.ivory); mono('B', B0.x - 4, B0.y - 24, { size: 36, w: 600, color: C.ivory, align: 'center' }); });
    A(st2, () => { dot(c0.x, c0.y, 7, C.ivory); mono('c', c0.x - 28, c0.y - 6, { size: 36, w: 600, color: C.ivory, align: 'center' }); });
    });
    // n5: the two triangles, SAB and SBc
    const tr = eout(seg(t, s('n5'), s('n5', 0.8)));
    A(tr * (1 - seg(t, s('n8'), s('n8', 0.6))), () => {
      poly([S, A0, B0]); ctx.fillStyle = 'rgba(233,188,98,0.4)'; ctx.fill(); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 1.5; ctx.stroke();
      A(1 - seg(t, s('n7'), s('n7', 0.8)) * 0.85, () => { poly([S, B0, c0]); ctx.fillStyle = 'rgba(147,188,235,0.32)'; ctx.fill(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1.5; ctx.stroke(); });
    });
    // n6: the tug at B, toward the Sun; c moves to C along a line parallel to BS
    const kick = eio(seg(t, s('n6', 0.6), s('n6', 1.8)));
    A(seg(t, s('n6', 0.2), s('n6', 0.6)) * (1 - seg(t, s('n8'), s('n8', 0.6))), () => {
      const d = { x: S.x - B0.x, y: S.y - B0.y }, L = Math.hypot(d.x, d.y);
      arrow(B0.x, B0.y, B0.x + (d.x / L) * 120, B0.y + (d.y / L) * 120, C.copper, 5);
      mono('TUG', B0.x + (d.x / L) * 70 + 30, B0.y + (d.y / L) * 70 + 10, { size: 32, color: C.copper });
      const Cx = lerp(c0.x, C0.x, kick), Cy = lerp(c0.y, C0.y, kick);
      line(c0.x, c0.y, Cx, Cy, 'rgba(232,135,90,0.8)', 2, [5, 5]);
      A(kick, () => { line(B0.x, B0.y, Cx, Cy, C.ivory, 3); dot(Cx, Cy, 7, C.ivory); mono('C', Cx - 30, Cy + 10, { size: 36, w: 600, color: C.ivory, align: 'center' }); });
    });
    // n7: triangle SBC, the same area
    A(eout(seg(t, s('n7'), s('n7', 0.8))) * (1 - seg(t, s('n8'), s('n8', 0.6))), () => {
      poly([S, B0, C0]); ctx.fillStyle = 'rgba(255,227,161,0.42)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    });
    // n8: the whole polygon, then finer steps
    const fine = seg(t, s('n8', 2.4), s('n8', 3.4));
    A(eout(seg(t, s('n8'), s('n8', 0.6))) * (1 - fine), () => newtonDraw(P, 2 + (P.pts.length - 3) * seg(t, s('n8', 0.3), s('n8', 2.4))));
    A(fine, () => newtonDraw(NP48, NP48.pts.length));
    label('DIAGRAM · NEWTON’S CONSTRUCTION', DC.x + 40, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('n4'), s('n5'), 0.5, 0.45), () => heading(RX, 280, 'NO PULL', 'Straight, in equal steps', 'A to B, then B to c', { size: 84 }));
  A(span(t, s('n5'), s('n6'), 0.5, 0.45), () => {
    heading(RX, 280, 'TRIANGLES SAB AND SBc', 'Same base, same height', null, { size: 84 });
    const a1 = shoelace([S, A0, B0]), a2 = shoelace([S, B0, c0]);
    mono(`areas: ${fix(a1 / a1, 3)} and ${fix(a2 / a1, 3)}`, RX, 560, { size: 44, w: 600, color: C.gold });
  });
  A(span(t, s('n6'), s('n7'), 0.5, 0.45), () => heading(RX, 280, 'A TUG AT B', 'Only along the line to the Sun', 'so c slides to C, parallel to that line', { size: 84 }));
  A(span(t, s('n7'), s('n8'), 0.5, 0.45), () => {
    heading(RX, 280, 'TRIANGLE SBC', 'Same base, same height', 'as SBc, so the same area', { size: 84 });
    const a1 = shoelace([S, A0, B0]), a3 = shoelace([S, B0, C0]);
    mono(`areas: ${fix(1, 3)} and ${fix(a3 / a1, 3)}`, RX, 620, { size: 44, w: 600, color: C.gold });
  });
  A(span(t, s('n8'), s('n9'), 0.5, 0.45), () => {
    label('EVERY TRIANGLE’S AREA', RX, 250);
    const path = t < s('n8', 2.9) ? P : NP48, a0 = path.areas[0];
    const vals = path.areas.slice(0, 12).map((a) => fix(a / a0, 3));
    vals.forEach((v, i) => mono(v, RX + (i % 3) * 240, 340 + Math.floor(i / 3) * 70, { size: 44, w: 600, color: i % 2 ? C.brassLight : C.gold }));
    mono(`${(t < s('n8', 2.9) ? P : NP48).pts.length - 1} tugs per orbit`, RX, 680, { size: 36, color: C.ivorySoft });
  });
  // n9: any central pull: a spring-like pull gives a different orbit, the same equal areas
  A(span(t, s('n9'), s('n10'), 0.6, 0.5), () => {
    const S2 = NPS.S;
    sunBall(S2.x, S2.y, 20, t);
    newtonDraw(NPS, (NPS.pts.length - 1) * eio(seg(t, s('n9', 0.3), e('n9', -0.3))));
    label('DIAGRAM · A PULL THAT GROWS WITH DISTANCE', DC.x + 40, 1000 - 36, { align: 'center', color: C.ivoryFaint, size: 32, spacing: '1px' });
  });
  A(span(t, s('n9'), s('n10'), 0.5, 0.45), () => {
    heading(RX, 250, 'ANY PULL TOWARD A CENTRE', 'Equal areas, always', null, { size: 84 });
    const a0 = NPS.areas[0], spread = Math.max(...NPS.areas.map((a) => Math.abs(a / a0 - 1)));
    const range = (P2) => { const r = P2.areas.map((a) => a / P2.areas[0]); return `${fix(Math.min(...r), 3)} to ${fix(Math.max(...r), 3)}`; };
    mono('pull ∝ 1 / distance²', RX, 520, { size: 40, color: C.ivorySoft });
    mono(`every area: ${range(NP12)}`, RX, 575, { size: 40, w: 600, color: C.gold });
    mono('pull ∝ distance (this one)', RX, 670, { size: 40, color: C.ivorySoft });
    mono(`every area: ${range(NPS)}`, RX, 725, { size: 40, w: 600, color: C.gold });
    void spread;
  });
  A(span(t, s('n10'), DURATION, 0.6, 0), () => {
    const o = Orbit(DC.x + 40, DC.y, 330, 0.5);
    drawEllipse(o);
    const tau = (t - s('n10')) / 8, p = o.atTau(tau);
    for (let i = 0; i < 12; i++) { const a0 = i / 12; poly(wedge(o, a0, a0 + 1 / 12, 20)); ctx.fillStyle = i % 2 ? C.wedgeB : C.wedgeA; ctx.fill(); }
    sunBall(o.sun.x, o.sun.y, 24, t);
    armLine(o.sun, p, 3); planet(p.x, p.y, 15);
  });
  A(span(t, s('n10'), s('n11'), 0.5, 0.45), () => {
    heading(RX, 280, 'TODAY’S NAME', 'Conservation of angular momentum', null, { size: 80 });
    mono('distance × sideways speed = constant', RX, 640, { size: 34, color: C.gold });
  });
  A(span(t, s('n11'), DURATION, 0.5, 0), () => {
    heading(RX, 250, 'THE OTHER TWO LAWS NEED', 'One over distance squared', 'a pull that weakens like that: gravity', { size: 84 });
    mono('pull ∝ 1 / distance²', RX, 640, { size: 44, w: 600, color: C.gold });
  });
}

// ---------- 9: Three laws ----------
function partLaws(t) {
  // z1–z2: when the laws got their names
  A(span(t, s('z1') - 0.4, s('z3'), 0.6, 0.6), () => {
    const x0 = 180, x1 = 1740, y = 600, X = (Y) => lerp(x0, x1, (Y - 1600) / (1810 - 1600));
    line(x0, y, x1, y, C.brass, 2.5);
    for (let Y = 1600; Y <= 1800; Y += 10) line(X(Y), y - (Y % 50 === 0 ? 14 : 7), X(Y), y + (Y % 50 === 0 ? 14 : 7), C.brass, Y % 50 === 0 ? 2 : 1);
    for (let Y = 1600; Y <= 1800; Y += 100) mono(String(Y), X(Y), y + 48, { size: 32, color: C.ivoryFaint, align: 'center' });
    const ev = [[1609, 'Astronomia nova', -1, 1, 's'], [1619, 'Harmonice Mundi', 1, 1, 's'], [1621, 'Epitome', -1, 2, 's'], [1687, 'Principia', 1, 1, 's'], [1738, '“laws”: Voltaire', -1, 1, 'z1'], [1804, 'three laws', 1, 1, 'z2']];
    ev.forEach(([Y, n, side, row, key], i) => {
      const at = key === 's' ? s('z1', 0.2 + i * 0.25) : key === 'z1' ? mid('z1', 0.6) : s('z2', 0.6);
      A(eout(seg(t, at, at + 0.6)), () => {
        const hgt = side < 0 ? (row === 2 ? 170 : 80) : 100, col = key === 's' ? C.ivorySoft : C.gold, al = Y > 1790 ? 'right' : 'center';
        if (row === 2) {
          // the Epitome sits between two others: a bent leader out to the right
          line(X(Y), y, X(Y), y - 60, col, 1.5); line(X(Y), y - 60, X(Y) + 130, y - 170, col, 1.5); dot(X(Y), y, 8, col);
          mono(String(Y), X(Y) + 142, y - 160, { size: 32, w: 600, color: col });
          txt(n, X(Y) + 142, y - 200, { size: 40, italic: true, w: 600, color: col });
          return;
        }
        line(X(Y), y, X(Y), y + side * hgt, col, 1.5); dot(X(Y), y, 8, col);
        if (side < 0) { mono(String(Y), X(Y), y - hgt - 16, { size: 32, w: 600, color: col, align: al }); txt(n, X(Y), y - hgt - 56, { size: key === 's' ? 40 : 48, italic: true, w: 600, color: col, align: al }); }
        else { mono(String(Y), X(Y), y + hgt + 40, { size: 32, w: 600, color: col, align: al }); txt(n, X(Y), y + hgt + 86, { size: key === 's' ? 40 : 48, italic: true, w: 600, color: col, align: al }); }
      });
    });
    heading(140, 220, 'WHAT THEY’RE CALLED', 'Kepler never said “laws”', null, { size: 84, maxW: 1400 });
  });
  // z3–z5: three plates
  const pl = [['z3', 'I', 'Ellipses', 'the Sun at one focus'], ['z4', 'II', 'Equal areas', 'in equal times'], ['z5', 'III', 'T² ∝ a³', 'period squared, distance cubed']];
  const out = 1 - seg(t, s('z6'), s('z6', 0.6));
  pl.forEach(([key, num, title, sub], i) => {
    const x = 140 + i * 560, y = 300, w = 520, h = 560;
    A(eout(seg(t, s(key), s(key, 0.7))) * out, () => {
      plate(x, y, w, h, { r: 20 });
      txt(num, x + w / 2, y + 110, { size: 96, w: 600, color: C.gold, align: 'center' });
      const cx = x + w / 2, cy = y + 280;
      if (i === 0) { const o = Orbit(cx, cy, 150, 0.6); drawEllipse(o, { engraved: false }); sunBall(o.sun.x, o.sun.y, 12, t); ctx.strokeStyle = C.brassLight; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.cx + o.a * o.ecc, cy, 6, 0, TAU); ctx.stroke(); const p = o.atTau((t - s(key)) / 6); planet(p.x, p.y, 8); }
      if (i === 1) { const o = Orbit(cx, cy, 150, 0.6); for (let j = 0; j < 12; j++) { poly(wedge(o, j / 12, (j + 1) / 12, 16)); ctx.fillStyle = j % 2 ? C.wedgeB : C.wedgeA; ctx.fill(); ctx.strokeStyle = 'rgba(241,213,142,0.5)'; ctx.lineWidth = 1; ctx.stroke(); } sunBall(o.sun.x, o.sun.y, 12, t); }
      if (i === 2) { for (const [, a] of KEP) { ctx.strokeStyle = 'rgba(201,162,78,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, a * 15, 0, TAU); ctx.stroke(); } KEP.forEach(([, a, P], j) => { const an = j + ((t - s(key)) / (P / 365.25)) * TAU / 2; dot(cx + Math.cos(an) * a * 15, cy - Math.sin(an) * a * 15, 5, C.ivory); }); sunBall(cx, cy, 8, t); }
      txt(title, x + w / 2, y + 480, { size: 60, w: 600, color: C.ivory, align: 'center' });
      txt(sub, x + w / 2, y + 530, { size: 36, italic: true, color: C.ivorySoft, align: 'center' });
    });
  });
  // z6: eight arcminutes
  A(span(t, s('z6'), s('z7'), 0.6, 0.6), () => {
    moonDisc(560, 520, 15.5 * 14, 0.9);
    bracket(560 - 4 * 14, 560 + 4 * 14, 520 - 15.5 * 14 - 40, null, C.gold);
    mono('8′', RX + 40, 520, { size: 120, w: 600, color: C.gold });
    txt('that he refused to ignore', RX + 40, 610, { size: 56, italic: true, color: C.ivory });
  });
  // z7: Earth in January, at its closest and fastest
  A(span(t, s('z7') - 0.2, e('z7', 2.0), 0.7, 0.8), () => {
    ring(0.8);
    const rate = 30 / (e('z7') - s('z7')), day = -12 + (t - s('z7')) * rate;
    earthYear(day);
    const st = earthState(day);
    label('EARTH IN JANUARY', RX, 300);
    mono(fix(st.v, 2), RX, 430, { size: 120, w: 600, color: C.gold });
    k.font('600', 120, MONO); const wv = ctx.measureText(fix(st.v, 2)).width;
    mono('km/s', RX + wv + 24, 430, { size: 48, color: C.ivorySoft });
    txt('closest to the Sun, and fastest', RX, 530, { size: 52, italic: true, color: C.ivory });
  });
  A(seg(t, e('z7', 1.4), e('z7', 2.4)), () => credits(t));
}
function credits() {
  ctx.fillStyle = 'rgba(3,6,15,0.82)'; ctx.fillRect(0, 0, W, H);
  ring(0.35);
  txt('Equal Areas in Equal Times', W / 2, 220, { size: 96, w: 600, color: C.gold, align: 'center' });
  txt('Kepler’s second law', W / 2, 290, { size: 48, italic: true, color: C.ivorySoft, align: 'center' });
  const blocks = [
    ['ANIMATION AND SCRIPT', ['Reckon · original animation']],
    ['MUSIC', ['“Infinite Perspective” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Perspectives” Kevin MacLeod (incompetech.com) · CC BY 4.0']],
    ['SOURCES', ['Wikipedia: Kepler’s laws of planetary motion · Johannes Kepler · Astronomia nova · Tycho Brahe', 'Kepler’s equation · Harmonice Mundi · Areal velocity · Principia · Earth’s orbit · Halley’s Comet · Galilean moons', 'NASA planetary fact sheets (Earth, Mars, the planets)']],
    ['COMPUTED', ['Orbits from Kepler’s equation; areas, speeds and times calculated in the animation']],
  ];
  let y = 400;
  for (const [h, vals] of blocks) {
    label(h, W / 2, y, { align: 'center', spacing: '4px' });
    vals.forEach((v, j) => txt(v, W / 2, y + 52 + j * 46, { size: 36, w: 500, color: C.ivory, align: 'center' }));
    y += 52 + vals.length * 46 + 40;
  }
}

// ---------- title cards and header ----------
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.2) c = ch; return c; }
function header(t) {
  const card = Math.max(0, ...CH.map((ch) => span(t, ch.at, ch.at + 3.9, 0.5, 0.6)));
  A(eout(seg(t, 0.2, 1.4)) * (1 - seg(t, e('z7', 1.0), e('z7', 1.6))) * (1 - 0.85 * card), () => {
    label('RECKON', 96, 104, { color: C.brass, spacing: '5px', w: 600 });
    const ch = chapterAt(t);
    if (ch) A(seg(t, ch.at + 2.2, ch.at + 3.2), () => { k.font('600', 32, MONO); ctx.letterSpacing = '5px'; const w0 = ctx.measureText('RECKON').width; ctx.letterSpacing = '0px'; label(`${ROMAN[ch.n - 1]} · ${ch.title.toUpperCase()}`, 96 + w0 + 36, 104, { color: C.ivoryFaint, spacing: '2px' }); });
  });
}
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.5, 0.6);
    if (a <= 0) continue;
    A(a * 0.8, () => { ctx.fillStyle = '#03060F'; ctx.fillRect(0, 0, W, H); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8));
      ctx.save(); ctx.translate(W / 2, 520 + (1 - p) * 18);
      // an engraved ring, turning slowly, with one orbit and a planet
      ctx.strokeStyle = 'rgba(201,162,78,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 330, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(201,162,78,0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 312, 0, TAU); ctx.stroke();
      for (let d = 0; d < 360; d += 5) { const an = (d * Math.PI) / 180 + (t - ch.at) * 0.03, l = d % 30 === 0 ? 16 : 7; line(Math.cos(an) * 312, Math.sin(an) * 312, Math.cos(an) * (312 - l), Math.sin(an) * (312 - l), 'rgba(201,162,78,0.5)', d % 30 === 0 ? 2 : 1); }
      const an = -(t - ch.at) * 0.9 + 2.2;
      dot(Math.cos(an) * 330, Math.sin(an) * 330, 9, C.brassLight);
      label(`PART ${ROMAN[ch.n - 1]}`, 0, -90, { align: 'center', spacing: '8px', size: 36, color: C.brass });
      txt(ch.title, 0, 40, { size: ch.title.length > 18 ? 92 : 112, w: 600, color: C.ivory, align: 'center' });
      rule(-160, 160, 100, 0.8);
      ctx.restore();
    });
  }
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [SERIF, MONO],
  draw(t, tools) {
    k = tools; ctx = tools.ctx; now = t;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    const parts = [partOpen, partTycho, partEight, partAreas, partEllipse, partSweep, partFast, partHarmony, partNewton, partLaws];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCard(t);
    header(t);
  },
});
