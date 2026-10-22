// "The birthday problem: why 23 people are enough", a long-form 16:9 explainer.
// Look: a party on warm paper. A paper wall calendar of 365 squares hangs on the left; the numbers, curves and
// diagrams sit on the right. Guests are round tokens with party hats; confetti and bunting. Fredoka for titles,
// Jost for numbers and labels. Every animation is keyed to a line's start or end in window.TL (written by
// timing.mjs from the measured voice). Facts: see script.mjs. The simulations below use the same generator and
// seeds as sim.mjs, so the picture and the narration agree.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const TAU = Math.PI * 2;

const C = {
  paper: '#F6EDDD', sheet: '#FFFCF6', ink: '#2F2342', inkSoft: 'rgba(47,35,66,0.74)', inkFaint: 'rgba(47,35,66,0.5)',
  cellEmpty: 'rgba(47,35,66,0.08)', line: 'rgba(47,35,66,0.16)',
  coral: '#EE5A4C', coralDeep: '#C63F31', marigold: '#F2A93B', marigoldDeep: '#B06E12', teal: '#23998C', tealDeep: '#17776C',
  sky: '#3B86D6', skyDeep: '#2865A8', berry: '#BF4783', leaf: '#6BAA4B',
  coralSoft: 'rgba(238,90,76,0.15)', tealSoft: 'rgba(35,153,140,0.42)', skySoft: 'rgba(59,134,214,0.18)',
};
const PARTY = [C.coral, C.marigold, C.teal, C.sky, C.berry, C.leaf];
const GCOL = (i) => PARTY[i % PARTY.length];
const DISPLAY = 'Fredoka', TEXT = 'Jost';

let k, ctx;
const font = (w, size, fam = TEXT) => k.font(w, size, fam);
const text = (str, x, y, o = {}) => k.text(str, x, y, { color: C.ink, base: 'middle', ...o });
const rrect = (...a) => k.rrect(...a);
const A = (a, fn) => k.alpha(a, fn);
const pct = (p, d = 1) => `${(100 * p).toFixed(d)}%`;
const tw = (str) => ctx.measureText(str).width;

// ---------- the maths ----------
const allDiff = (n, d = 365) => { let q = 1; for (let i = 0; i < n; i++) q *= (d - i) / d; return q; };
const P = (n, d = 365) => 1 - allDiff(n, d);
const Q = (n) => 1 - Math.pow(364 / 365, n);
const Pc = (x) => { const lo = Math.floor(x); return lerp(P(lo), P(lo + 1), x - lo); };

// ---------- simulations (same as sim.mjs) ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// 1,000 rooms: guests arrive until the first shared birthday
const FIRST = [], ROOMDAYS = [];
{
  const rnd = mulberry32(2026);
  for (let r = 0; r < 1000; r++) {
    const seen = new Set(), days = []; let n = 0;
    for (;;) { n++; const d = Math.floor(rnd() * 365); days.push(d); if (seen.has(d)) break; seen.add(d); }
    FIRST.push(n); if (r < 3) ROOMDAYS.push(days);
  }
}
const BY23 = FIRST.filter((n) => n <= 23).length;
const MEAN = FIRST.reduce((a, b) => a + b, 0) / FIRST.length;
// the demo party of 23
let DEMO = null;
for (let seed = 1; seed < 5000 && !DEMO; seed++) {
  const rnd = mulberry32(seed * 7919);
  const days = Array.from({ length: 23 }, () => Math.floor(rnd() * 365));
  let first = -1, other = -1;
  for (let i = 0; i < 23 && first < 0; i++) for (let j = 0; j < i; j++) if (days[j] === days[i]) { first = i; other = j; break; }
  const later = days.slice(first + 1).some((d, i) => days.indexOf(d) !== first + 1 + i);
  if (first >= 16 && first <= 19 && !later) DEMO = { days, first, other };
}
// 23 different birthdays for "counting the misses": the demo party with the repeat moved to the next free day
const DISTINCT = DEMO.days.slice();
{ let d = DISTINCT[DEMO.first]; while (DISTINCT.includes(d)) d = (d + 1) % 365; DISTINCT[DEMO.first] = d; }
// 253 random birthdays for "someone shares yours"
const CROWD = (() => { const rnd = mulberry32(253); return Array.from({ length: 253 }, () => Math.floor(rnd() * 365)); })();
const CROWD_DAYS = new Set(CROWD).size;

// ---------- the calendar ----------
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const START = LEN.reduce((a, l) => [...a, a[a.length - 1] + l], [0]);
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const JAN1 = 3; // weeks start on Monday; January 1 on a Thursday
const SHEET = { x: 96, y: 150, w: 840, h: 800 };
const CAL = { pitch: 25, cs: 21, bw: 171, mx: 44, y0: 228, rowPitch: 214, label: 44 };
CAL.gx = (SHEET.w - 2 * CAL.mx - 4 * CAL.bw) / 3;
const monthOf = (d) => { let m = 0; while (d >= START[m + 1]) m++; return m; };
const blockXY = (m) => [SHEET.x + CAL.mx + (m % 4) * (CAL.bw + CAL.gx), CAL.y0 + Math.floor(m / 4) * CAL.rowPitch];
const slotXY = (m, dd) => { const idx = ((JAN1 + START[m]) % 7) + dd, [bx, by] = blockXY(m); return [bx + (idx % 7) * CAL.pitch, by + CAL.label + Math.floor(idx / 7) * CAL.pitch]; };
const CELL = Array.from({ length: 365 }, (_, d) => { const m = monthOf(d); return slotXY(m, d - START[m]); });
const cellC = (d) => [CELL[d][0] + CAL.cs / 2, CELL[d][1] + CAL.cs / 2];
const dayName = (d) => { const m = monthOf(d); return `${MONTH[m]} ${d - START[m] + 1}`; };
// "your birthday": the first day from April 11 on that the 253 random birthdays miss
const YOUR = (() => { let d = 100; while (CROWD.includes(d)) d++; return d; })();

function sheet(a) {
  A(a, () => {
    const { x, y, w, h } = SHEET;
    ctx.fillStyle = 'rgba(90,60,30,0.12)'; rrect(x + 8, y + 12, w, h, 18); ctx.fill();
    ctx.fillStyle = C.sheet; rrect(x, y, w, h, 18); ctx.fill();
    ctx.save(); rrect(x, y, w, h, 18); ctx.clip(); ctx.fillStyle = C.coral; ctx.fillRect(x, y, w, 60); ctx.restore();
    for (const rx of [x + 170, x + w - 170]) {
      ctx.fillStyle = '#B33C2F'; ctx.beginPath(); ctx.arc(rx, y + 22, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6B5A72'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(rx, y + 4, 18, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    }
    font(600, 36, DISPLAY); text('365 DAYS', x + w / 2, y + 32, { color: C.sheet, align: 'center', spacing: '3px' });
    font(600, 32, DISPLAY);
    for (let m = 0; m < 12; m++) { const [bx, by] = blockXY(m); text(MON[m], bx, by + 18, { color: C.inkSoft, spacing: '1px' }); }
    ctx.fillStyle = C.cellEmpty;
    for (let d = 0; d < 365; d++) { rrect(CELL[d][0], CELL[d][1], CAL.cs, CAL.cs, 4); ctx.fill(); }
  });
}
/** A day square filled with a colour, popping in as p goes 0 to 1. */
function mark(d, col, p = 1) {
  if (p <= 0) return;
  const [cx, cy] = cellC(d), sz = (CAL.cs + 2) * back(clamp(p));
  ctx.fillStyle = col; rrect(cx - sz / 2, cy - sz / 2, sz, sz, 4); ctx.fill();
}
/** A day square shared by two guests: split corner to corner. */
function markTwo(d, c1, c2, p = 1) {
  if (p <= 0) return;
  const [cx, cy] = cellC(d), sz = (CAL.cs + 4) * back(clamp(p)), h = sz / 2;
  ctx.save(); rrect(cx - h, cy - h, sz, sz, 4); ctx.clip();
  ctx.fillStyle = c1; ctx.fillRect(cx - h, cy - h, sz, sz);
  ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(cx + h, cy - h); ctx.lineTo(cx + h, cy + h); ctx.lineTo(cx - h, cy + h); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function ring(d, col, t, t0, lw = 4) {
  if (t < t0) return;
  const [cx, cy] = cellC(d), p = eout(seg(t, t0, t0 + 0.5));
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(cx, cy, 10 + 12 * p + 2 * Math.sin(t * 5), 0, TAU); ctx.stroke();
}
/** A label in a pill. */
function pill(str, x, y, { bg = C.sheet, fg = C.ink, border = null, size = 32, weight = 600, family = TEXT, padX = 18, h = 48, align = 'center' } = {}) {
  font(weight, size, family);
  const w = tw(str) + 2 * padX, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.fillStyle = bg; rrect(x0, y - h / 2, w, h, h / 2); ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.stroke(); }
  text(str, x0 + w / 2, y + 1, { color: fg, align: 'center' });
  return w;
}
/** Text with superscripts: parts are [string, isSuperscript]. */
function supText(parts, x, y, size, color, { weight = 500, family = TEXT, align = 'left' } = {}) {
  const ws = parts.map(([str, up]) => { font(weight, up ? size * 0.58 : size, family); return tw(str); });
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  parts.forEach(([str, up], i) => {
    font(weight, up ? size * 0.58 : size, family);
    text(str, cx, up ? y - size * 0.34 : y, { color });
    cx += ws[i];
  });
  return total;
}
/** A stacked fraction centred on (cx, cy). */
function frac(num, den, cx, cy, size, color = C.ink) {
  font(500, size); const w = Math.max(tw(num), tw(den)) + 12;
  text(num, cx, cy - size * 0.58, { color, align: 'center' });
  text(den, cx, cy + size * 0.62, { color, align: 'center' });
  ctx.fillStyle = color; ctx.fillRect(cx - w / 2, cy - 1.5, w, 3);
  return w;
}
function arrow(x0, y0, x1, y1, col, lw = 5, head = 16) {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}

// ---------- guests and confetti ----------
/** A round party guest: a head, shoulders and a cone hat. (x, y) is the head's centre. */
function guest(x, y, r, col, { hat = true, halo = null } = {}) {
  if (halo) { ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y + r * 0.45, r * 1.85, 0, TAU); ctx.fill(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y + r * 1.62, r * 1.08, r * 0.8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = C.sheet; ctx.beginPath(); ctx.arc(x, y, r * 0.66, 0, TAU); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, r * 0.15); ctx.stroke();
  if (hat) {
    ctx.fillStyle = col === C.marigold ? C.coral : C.marigold;
    ctx.beginPath(); ctx.moveTo(x - r * 0.46, y - r * 0.42); ctx.lineTo(x + r * 0.46, y - r * 0.42); ctx.lineTo(x + r * 0.1, y - r * 1.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + r * 0.1, y - r * 1.52, r * 0.17, 0, TAU); ctx.fill();
  }
}
function piece(x, y, rot, flip, col, sz = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, flip); ctx.fillStyle = col; ctx.fillRect(-6 * sz, -3 * sz, 12 * sz, 6 * sz); ctx.restore();
}
function burst(x, y, t, t0, { n = 18, spread = 80, seed = 1, dur = 1.4 } = {}) {
  const p = seg(t, t0, t0 + dur);
  if (p <= 0 || p >= 1) return;
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, sp = spread * (0.45 + r()), q = eout(p);
    const px = x + Math.cos(ang) * sp * q, py = y + Math.sin(ang) * sp * q + 70 * p * p;
    A(1 - p * p, () => piece(px, py, ang + p * 9, Math.cos(p * 14 + i), PARTY[i % 6], 0.9));
  }
}
/** Confetti drifting down over the whole frame. */
function rain(t, a, { n = 46, seed = 7 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    for (let i = 0; i < n; i++) {
      const r = mulberry32(seed * 100 + i), x0 = r() * W, sp = 40 + r() * 50, ph = r() * 1300;
      const y = ((t * sp + ph) % 1220) - 70, x = x0 + Math.sin(t * (0.7 + r()) + i) * 26;
      piece(x, y, t * (1 + r() * 2) + i, Math.cos(t * 3 + i), GCOL(i), 1.1);
    }
  });
}

// ---------- background ----------
let bg = null;
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const rad = g.createRadialGradient(960, 480, 80, 960, 540, 1150);
  rad.addColorStop(0, 'rgba(255,251,242,0.9)'); rad.addColorStop(1, 'rgba(255,251,242,0)');
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const r = mulberry32(99);
  for (let i = 0; i < 16000; i++) {
    g.fillStyle = r() < 0.55 ? `rgba(120,88,50,${0.02 + r() * 0.04})` : `rgba(255,255,255,${0.05 + r() * 0.1})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6);
  }
  g.lineWidth = 1;
  for (let i = 0; i < 800; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 6 + r() * 20;
    g.strokeStyle = `rgba(120,88,50,${0.03 + r() * 0.04})`;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // settled confetti, mostly round the edges
  for (let i = 0; i < 260; i++) {
    const x = r() * W, y = r() * H, edge = x < 76 || x > W - 76 || y > H - 64;
    if (!edge && r() > 0.06) continue;
    g.save(); g.translate(x, y); g.rotate(r() * TAU); g.globalAlpha = edge ? 0.35 + r() * 0.35 : 0.1;
    g.fillStyle = PARTY[i % 6];
    if (r() < 0.3) { g.beginPath(); g.arc(0, 0, 4 + r() * 2.5, 0, TAU); g.fill(); } else g.fillRect(-7, -3.5, 14, 7);
    g.restore();
  }
  const vg = g.createRadialGradient(960, 540, 620, 960, 540, 1260);
  vg.addColorStop(0, 'rgba(110,70,30,0)'); vg.addColorStop(1, 'rgba(110,70,30,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the bunting's string
  g.strokeStyle = 'rgba(47,35,66,0.35)'; g.lineWidth = 2;
  g.beginPath(); for (let x = -10; x <= W + 10; x += 6) { const y = buntY(x); x < 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
}
const buntY = (x) => 10 + 28 * Math.sin(Math.PI * (((x % 960) + 960) % 960) / 960);
function bunting(t) {
  for (let i = 0; i < 30; i++) {
    const x = 32 + i * 64, y = buntY(x), sw = Math.sin(t * 1.6 + i * 0.9) * 0.07;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
    ctx.fillStyle = GCOL(i); ctx.globalAlpha *= 0.9;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.2) c = ch; return c; }
function header(t) {
  font(600, 32, DISPLAY); text('RECKON', 96, 118, { color: C.coralDeep, spacing: '3px' });
  const rw = tw('RECKON') + 12;
  const ch = chapterAt(t);
  if (ch && t < e('z6', 1.0)) A(seg(t, ch.at + 2.4, ch.at + 3.4), () => { font(500, 32); text(`PART ${ch.n} · ${ch.title.toUpperCase()}`, 96 + rw + 26, 118, { color: C.inkFaint, spacing: '2px' }); });
}

// ---------- when the calendar hangs on the wall ----------
const at = (n) => CH[n - 1].at; // when part n's title card starts
function calendarVis(t) {
  const wins = [
    [s('o3'), s('o6', 0.3)], [at(1) + 2.6, at(2) + 1.0], [at(3) + 2.6, s('c9', 0.2)], [s('c12', -0.4), at(4) + 1.0],
    [at(4) + 2.6, s('d8', 0.4)], [at(5) + 2.6, s('y8', 0.3)], [at(7) + 2.6, at(8) + 1.0], [at(9) + 2.6, e('z6', 2.2)],
  ];
  let v = 0;
  for (const [a, b] of wins) v = Math.max(v, span(t, a, b, 0.6, 0.6));
  return v;
}

// ---------- title cards and credits ----------
function card(cx, cy, w, h, tilt = -0.012) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
  ctx.fillStyle = 'rgba(90,60,30,0.14)'; rrect(-w / 2 + 10, -h / 2 + 14, w, h, 30); ctx.fill();
  ctx.fillStyle = C.sheet; rrect(-w / 2, -h / 2, w, h, 30); ctx.fill();
  ctx.save(); rrect(-w / 2, -h / 2, w, h, 30); ctx.clip(); ctx.fillStyle = C.coral; ctx.fillRect(-w / 2, -h / 2, w, 76); ctx.restore();
  for (const rx of [-w / 2 + 150, w / 2 - 150]) {
    ctx.fillStyle = '#B33C2F'; ctx.beginPath(); ctx.arc(rx, -h / 2 + 26, 8, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6B5A72'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(rx, -h / 2 + 6, 20, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
  }
}
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.45, 0.55);
    if (a <= 0) continue;
    A(a * 0.86, () => { ctx.fillStyle = C.paper; ctx.fillRect(0, 140, W, 860); });
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      card(960, 545 + (1 - p) * 26, 1120, 400);
      font(600, 36); text(`PART ${ch.n}`, 0, -200 + 38 + 2, { color: C.sheet, align: 'center', spacing: '6px' });
      font(600, ch.title.length > 20 ? 84 : 100, DISPLAY); text(ch.title, 0, 40, { color: C.ink, align: 'center' });
      // a strip of calendar squares, one of them taken twice
      for (let i = 0; i < 9; i++) {
        const x = -4 * 44 + i * 44 - 17, y = 120, on = seg(t, ch.at + 0.5 + i * 0.07, ch.at + 0.8 + i * 0.07);
        ctx.fillStyle = C.cellEmpty; rrect(x, y, 34, 34, 6); ctx.fill();
        if (i === 4) { A(on, () => { ctx.fillStyle = C.coral; rrect(x, y, 34, 34, 6); ctx.fill(); ctx.fillStyle = C.sky; ctx.beginPath(); ctx.moveTo(x + 34, y); ctx.lineTo(x + 34, y + 34); ctx.lineTo(x, y + 34); ctx.closePath(); ctx.fill(); }); }
        else if (i % 3 !== 1) A(on, () => { ctx.fillStyle = GCOL(i + ch.n); rrect(x, y, 34, 34, 6); ctx.fill(); });
      }
      ctx.restore();
    });
    A(a, () => burst(960, 420, t, ch.at + 0.3, { n: 26, spread: 300, seed: ch.n + 3, dur: 2.4 }));
  }
}
function credits(t) {
  A(0.9, () => { ctx.fillStyle = C.paper; ctx.fillRect(0, 140, W, 860); });
  card(960, 560, 1500, 800, 0);
  ctx.restore();
  font(600, 64, DISPLAY); text('The Birthday Problem', 960, 296, { color: C.ink, align: 'center' });
  const blocks = [
    ['Animation and script', ['Reckon · original animation']],
    ['Music', ['“Daily Beetle” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Fretless” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“On My Way” Kevin MacLeod (incompetech.com) · CC BY 4.0']],
    ['Sources', ['Wikipedia: “Birthday problem”, “Birthday attack”, “Cryptographic hash function”, “Birthday”', 'Voracek, Tran & Formann (2008) · BBC News (2014), on the World Cup squads']],
    ['Simulations', ['Every party and room here: seeded random numbers, computed in the animation']],
  ];
  let y = 380;
  for (const [h, vals] of blocks) {
    font(600, 32); text(h.toUpperCase(), 960, y, { color: C.coralDeep, align: 'center', spacing: '3px' });
    vals.forEach((v, j) => { font(500, 32); text(v, 960, y + 44 + j * 42, { color: C.ink, align: 'center' }); });
    y += 44 + vals.length * 42 + 30;
  }
}

// ---------- 0: cold open ----------
function crowdLayout(n) {
  const cols = n <= 23 ? 8 : 14, rows = Math.ceil(n / cols), x0 = 1060, x1 = 1770, y0 = 262, y1 = 572;
  const px = (x1 - x0) / cols, py = (y1 - y0) / rows;
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols), col = i % cols, inRow = Math.min(cols, n - row * cols);
    return [(x0 + x1) / 2 + (col - (inRow - 1) / 2) * px + (row % 2 ? 0.16 : -0.16) * px, y0 + (row + 0.62) * py + Math.sin(col * 1.7 + row) * 5, Math.min(px, py) * 0.3];
  });
}
const CROWD23 = crowdLayout(23), CROWD70 = crowdLayout(70);
function cake(cx, cy, w, h, t, n = 23) {
  ctx.fillStyle = 'rgba(47,35,66,0.12)'; ctx.beginPath(); ctx.ellipse(cx, cy + h / 2 + 10, w * 0.62, 18, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#F6D3A6'; rrect(cx - w / 2, cy - h / 2, w, h, 20); ctx.fill();
  ctx.fillStyle = C.berry; ctx.fillRect(cx - w / 2, cy + h * 0.16, w, 16);
  ctx.fillStyle = C.sheet;
  ctx.beginPath(); ctx.moveTo(cx - w / 2, cy - h / 2 + 20); ctx.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + 20, cy - h / 2); ctx.lineTo(cx + w / 2 - 20, cy - h / 2); ctx.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + 20);
  for (let i = 10; i >= 0; i--) { const x = cx - w / 2 + (i / 10) * w; ctx.lineTo(x, cy - h / 2 + 34 + (i % 2 ? 22 : 0)); }
  ctx.closePath(); ctx.fill();
  const r = mulberry32(5);
  for (let i = 0; i < 26; i++) { ctx.save(); ctx.translate(cx - w / 2 + 20 + r() * (w - 40), cy - h / 2 + 70 + r() * (h - 90)); ctx.rotate(r() * TAU); ctx.fillStyle = GCOL(i); ctx.fillRect(-6, -2.5, 12, 5); ctx.restore(); }
  for (let i = 0; i < n; i++) {
    const x = cx - w / 2 + 26 + (i * (w - 52)) / (n - 1), y = cy - h / 2;
    ctx.fillStyle = GCOL(i); ctx.fillRect(x - 5, y - 52, 10, 54);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x - 5, y - 40, 10, 6); ctx.fillRect(x - 5, y - 20, 10, 6);
    const fl = 1 + 0.12 * Math.sin(t * 11 + i * 2.1);
    ctx.fillStyle = C.marigold; ctx.beginPath(); ctx.ellipse(x, y - 64, 6, 11 * fl, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFF2C4'; ctx.beginPath(); ctx.ellipse(x, y - 61, 2.6, 5 * fl, 0, 0, TAU); ctx.fill();
  }
}
function partOpen(t) {
  const out = 1 - seg(t, s('o6', -0.1), s('o6', 0.5));
  const morph = eio(seg(t, s('o5', 0.1), s('o5', 1.2)));
  A(out, () => {
    // the pair in question
    const q = span(t, s('o2', 0.4), e('o3', -0.4), 0.4, 0.5);
    const [ax, ay] = CROWD23[3], [bx, by] = CROWD23[14];
    if (q > 0) A(q, () => {
      ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      pill('same birthday?', 1415, 208, { fg: C.coralDeep, border: C.coral, size: 34 });
    });
    for (let i = 0; i < 70; i++) {
      const pop = back(seg(t, i < 23 ? s('o1', 0.15 + i * 0.07) : s('o5', 0.4 + (i - 23) * 0.025), i < 23 ? s('o1', 0.45 + i * 0.07) : s('o5', 0.7 + (i - 23) * 0.025)));
      if (pop <= 0) continue;
      const [x0, y0, r0] = CROWD23[Math.min(i, 22)], [x1, y1, r1] = CROWD70[i];
      const x = i < 23 ? lerp(x0, x1, morph) : x1, y = (i < 23 ? lerp(y0, y1, morph) : y1) + Math.sin(t * 2.2 + i * 1.3) * 3, r = i < 23 ? lerp(r0, r1, morph) : r1;
      const hl = q > 0 && (i === 3 || i === 14);
      ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); guest(0, 0, r, GCOL(i), { halo: hl ? C.coralSoft : null }); ctx.restore();
    }
    // the count of guests
    font(600, 48, DISPLAY);
    A(seg(t, s('o1', 1.2), s('o1', 1.8)) * (1 - morph), () => text('23 guests', 1415, 640, { align: 'center' }));
    A(morph, () => text('70 guests', 1415, 640, { align: 'center' }));
    // the calendar ripples: 365 days
    if (t > s('o3') && t < s('o4', 1)) for (let d = 0; d < 365; d++) {
      const tc = s('o3', 0.3) + (d / 365) * 1.7, f = t < tc ? 0 : 1 - seg(t, tc, tc + 0.6);
      if (f > 0) A(f * calendarVis(t), () => mark(d, C.marigold, 1));
    }
    // the answer
    const n1 = mid('o4', 0.5), n2 = mid('o5', 0.35);
    const v = t < n2 ? 50.7 * eout(seg(t, n1, n1 + 0.9)) : lerp(50.7, 99.9, eout(seg(t, n2, n2 + 0.9)));
    A(seg(t, n1, n1 + 0.4), () => {
      font(600, 150, DISPLAY); text(`${v.toFixed(1)}%`, 1415, 775, { color: C.coral, align: 'center' });
      font(500, 38); text('chance of a shared birthday', 1415, 880, { color: C.inkSoft, align: 'center' });
    });
  });
  // the title
  const tt = s('o6', 0.25);
  A(eout(seg(t, tt, tt + 0.8)), () => {
    const p = eout(seg(t, tt, tt + 0.8));
    font(600, 128, DISPLAY); text('The Birthday Problem', 960, 360 + (1 - p) * 20, { color: C.ink, align: 'center' });
    font(500, 50); text('Why 23 people are enough', 960, 470, { color: C.inkSoft, align: 'center' });
  });
  A(eout(seg(t, tt + 0.3, tt + 1.1)), () => cake(960, 790 + (1 - eout(seg(t, tt + 0.3, tt + 1.1))) * 40, 520, 160, t));
  burst(700, 380, t, tt + 0.2, { n: 24, spread: 220, seed: 11 });
  burst(1220, 380, t, tt + 0.35, { n: 24, spread: 220, seed: 12 });
  rain(t, span(t, tt, at(1) + 1.6, 0.8, 1.2), { seed: 3 });
}

// ---------- 1: a room of 23 ----------
const SEAT = Array.from({ length: 23 }, (_, i) => { const row = Math.floor(i / 6), col = i % 6, n = row < 3 ? 6 : 5; return [1412 + (col - (n - 1) / 2) * 116, 322 + row * 100]; });
const FLY = 0.6;
let ARR = null;
function arrivals() {
  if (ARR) return ARR;
  ARR = [];
  const t0 = s('a3', 0.6), t1 = s('a4', -0.6);
  for (let i = 0; i < 19; i++) ARR.push(lerp(t0, t1, i / 18));
  ARR.push(s('a4', 0.05));
  for (let i = 20; i < 23; i++) ARR.push(e('a4', -1.5 + (i - 20) * 0.45));
  return ARR;
}
/** The demo party's marks on the calendar, as they land. */
function demoMarks(t, landAt, matchAt) {
  const D = DEMO.days, M = DEMO.first, O = DEMO.other;
  for (let i = 0; i < 23; i++) {
    const tl = landAt(i);
    if (t < tl) continue;
    if (i === M) markTwo(D[i], GCOL(O), GCOL(M), seg(t, tl, tl + 0.35));
    else if (!(i === O && t >= landAt(M))) mark(D[i], GCOL(i), seg(t, tl, tl + 0.3));
  }
  if (t >= matchAt) { ring(D[M], C.ink, t, matchAt, 3.5); const [cx, cy] = cellC(D[M]); burst(cx, cy, t, matchAt, { n: 22, spread: 90, seed: 4 }); }
}
function partRoom(t) {
  const arr = arrivals(), match = arr[DEMO.first] + FLY;
  // the rules
  A(span(t, at(1) + 2.6, s('a3', 0.3), 0.5, 0.5), () => {
    font(600, 60, DISPLAY); text('The rules', 1060, 300, { color: C.ink });
    const rows = [[s('a2', 0.2), '365 possible birthdays'], [mid('a2', 0.42), 'all equally likely'], [mid('a2', 0.78), 'no February 29']];
    rows.forEach(([t0, str], i) => A(eout(seg(t, t0, t0 + 0.45)), () => {
      const y = 420 + i * 108, x = 1092 + (1 - eout(seg(t, t0, t0 + 0.45))) * 20;
      if (i === 0) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { ctx.fillStyle = (a + b) % 2 ? C.coral : C.marigold; rrect(x - 22 + b * 15, y - 22 + a * 15, 12, 12, 3); ctx.fill(); }
      if (i === 1) for (let b = 0; b < 4; b++) { ctx.fillStyle = C.teal; rrect(x - 24 + b * 13, y - 14, 9, 34, 3); ctx.fill(); }
      if (i === 2) { ctx.strokeStyle = C.coral; ctx.lineWidth = 4; rrect(x - 20, y - 20, 40, 40, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12); ctx.stroke(); }
      font(500, 44); text(str, x + 52, y, { color: C.ink });
    }));
  });
  // February 29, crossed out on the calendar
  A(span(t, mid('a2', 0.78), e('a2', 1.4), 0.4, 0.6) * calendarVis(t), () => {
    const [x, y] = slotXY(1, 28);
    ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([4, 3]); rrect(x, y, CAL.cs, CAL.cs, 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + CAL.cs - 4, y + CAL.cs - 4); ctx.moveTo(x + CAL.cs - 4, y + 4); ctx.lineTo(x + 4, y + CAL.cs - 4); ctx.stroke();
  });
  // the marks stay on the calendar for the rest of the part
  A(calendarVis(t), () => demoMarks(t, (i) => arr[i] + FLY, match));
  // the room
  A(span(t, s('a3', -0.2), mid('a5', 0.35), 0.5, 0.5), () => {
    ctx.fillStyle = 'rgba(255,252,246,0.7)'; rrect(1040, 236, 744, 480, 28); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); rrect(1040, 236, 744, 480, 28); ctx.stroke(); ctx.setLineDash([]);
    let n = 0;
    for (let i = 0; i < 23; i++) {
      const [x, y] = SEAT[i];
      ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + 6, 26, 0, TAU); ctx.stroke();
      const pop = back(seg(t, arr[i] - 0.3, arr[i]));
      if (pop <= 0) continue;
      n = i + 1;
      const isPair = t >= match && (i === DEMO.first || i === DEMO.other);
      const dim = isPair ? 1 : 1 - 0.65 * span(t, match, mid('a5', 0.35), 0.4, 0.3);
      A(dim, () => { ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 2); ctx.scale(pop, pop); guest(0, 0, 26, GCOL(i), { halo: isPair ? C.coralSoft : null }); ctx.restore(); });
      // the birthday flies to its day
      const f = seg(t, arr[i], arr[i] + FLY);
      if (f > 0 && f < 1) {
        const [cx, cy] = cellC(DEMO.days[i]), g = eio(f);
        const fx = lerp(x, cx, g), fy = lerp(y, cy, g) - Math.sin(Math.PI * g) * 120;
        ctx.fillStyle = GCOL(i); rrect(fx - 11, fy - 11, 22, 22, 4); ctx.fill();
      }
    }
    font(600, 44, DISPLAY); A(seg(t, s('a3', 0.4), s('a3', 0.9)), () => text(`${n} ${n === 1 ? 'guest' : 'guests'}`, 1412, 772, { color: C.ink, align: 'center' }));
    // the match
    const m = span(t, match, mid('a5', 0.35), 0.3, 0.3);
    if (m > 0) A(m, () => {
      const [cx, cy] = cellC(DEMO.days[DEMO.first]);
      for (const i of [DEMO.other, DEMO.first]) {
        const [x, y] = SEAT[i], dl = eout(seg(t, match, match + 0.7));
        ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.setLineDash([9, 8]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, cx, dl), lerp(y, cy, dl)); ctx.stroke(); ctx.setLineDash([]);
        pill(`guest ${i + 1}`, x, y - 62, { fg: C.coralDeep, border: C.coral, size: 32, h: 44 });
      }
      const sc = back(seg(t, match, match + 0.5));
      ctx.save(); ctx.translate(cx, cy - 56); ctx.scale(sc, sc);
      pill(`MATCH · ${dayName(DEMO.days[DEMO.first])}`, 0, 0, { bg: C.coral, fg: C.sheet, size: 34, h: 52, family: DISPLAY });
      ctx.restore();
    });
  });
  // 1,000 parties of 23
  A(span(t, mid('a5', 0.35), s('a7', 0.2), 0.5, 0.5), () => {
    const cols = 40, pitch = 18, sz = 14, x0 = 1412 - (cols * pitch) / 2, y0 = 336;
    const shown = Math.floor(1000 * eio(seg(t, mid('a5', 0.55), mid('a6', 0.4))));
    let hits = 0;
    for (let i = 0; i < 1000; i++) {
      const x = x0 + (i % cols) * pitch, y = y0 + Math.floor(i / cols) * pitch, hit = FIRST[i] <= 23;
      if (i < shown) { if (hit) hits++; ctx.fillStyle = hit ? C.coral : C.tealSoft; } else ctx.fillStyle = C.cellEmpty;
      ctx.fillRect(x, y, sz, sz);
    }
    font(600, 44, DISPLAY);
    text(`${fmt(shown)} parties`, x0, 282, { color: C.ink });
    text(`${hits} with a match`, x0 + cols * pitch - 4, 282, { color: C.coralDeep, align: 'right' });
    font(500, 32);
    ctx.fillStyle = C.coral; ctx.fillRect(x0, 822, 26, 26); text('shared birthday', x0 + 40, 836, { color: C.inkSoft });
    ctx.fillStyle = C.tealSoft; ctx.fillRect(x0 + 330, 822, 26, 26); text('all different', x0 + 370, 836, { color: C.inkSoft });
  });
  // 23 against 365
  A(span(t, s('a7', -0.1), s('a8', 0.3), 0.5, 0.5), () => {
    const x0 = 1080, x1 = 1760, y = 560, x23 = lerp(x0, x1, 23 / 365), g = eio(seg(t, s('a7', 0.1), s('a7', 1.2)));
    ctx.fillStyle = C.tealSoft; rrect(x0, y - 12, (x1 - x0) * g, 24, 12); ctx.fill();
    ctx.fillStyle = C.coral; rrect(x0, y - 16, x23 - x0, 32, 12); ctx.fill();
    font(600, 64, DISPLAY); text('23', x0, y - 84, { color: C.coralDeep });
    A(g, () => text('365', x1, y - 84, { color: C.ink, align: 'right' }));
    font(500, 36); text('guests', x0 + 86, y - 80, { color: C.inkSoft });
    A(g, () => text('days', x1 - 132, y - 80, { color: C.inkSoft, align: 'right' }));
    A(seg(t, s('a7', 1.0), s('a7', 1.6)), () => { font(500, 40); text('fewer than 1 guest for every 15 days', 1420, y + 96, { color: C.inkSoft, align: 'center' }); });
  });
  // the history
  A(span(t, s('a8', -0.1), at(2) + 1.0, 0.5, 0.6), () => {
    const x0 = 1080, x1 = 1760, y = 600, X = (yr) => lerp(x0, x1, (yr - 1920) / 25);
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    font(500, 32);
    for (const yr of [1920, 1930, 1940]) { ctx.fillStyle = C.inkFaint; ctx.fillRect(X(yr) - 1.5, y - 10, 3, 20); text(String(yr), X(yr), y + 40, { color: C.inkFaint, align: 'center' }); }
    const cardAt = (t0, yr, cx, cy, w, l1, l2, col) => A(eout(seg(t, t0, t0 + 0.5)), () => {
      const p = eout(seg(t, t0, t0 + 0.5));
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(yr), y, 11 * p, 0, TAU); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(yr), y); ctx.lineTo(X(yr), cy + (cy < y ? 66 : -66)); ctx.stroke();
      ctx.fillStyle = C.sheet; rrect(cx - w / 2, cy - 66, w, 132, 20); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      font(600, 40, DISPLAY); text(l1, cx, cy - 22, { color: C.ink, align: 'center' });
      font(500, 32); text(l2, cx, cy + 30, { color: C.inkSoft, align: 'center' });
    });
    cardAt(s('a8', 0.3), 1927, 1280, 420, 400, 'Harold Davenport', 'about 1927 · unpublished', C.marigold);
    cardAt(s('a10', 0.3), 1939, 1594, 780, 420, 'Richard von Mises', '1939 · first in print', C.teal);
  });
}

// ---------- 2: it's not about you ----------
const RING = { x: 516, y: 560, r: 300 };
const ringXY = (i, n = 23) => { const a = -Math.PI / 2 + (i / n) * TAU; return [RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r]; };
const PAIRS = []; for (let i = 0; i < 23; i++) for (let j = i + 1; j < 23; j++) PAIRS.push([i, j]);
let PAIR_T = null;
function pairTimes() {
  if (PAIR_T) return PAIR_T;
  const g0 = [s('b5', 0.3), e('b5', -0.1)], g1 = [s('b6', 0.1), mid('b6', 0.45)], g2 = [mid('b6', 0.5), Math.max(mid('b6', 0.6), s('b7', 0.1))];
  let n2 = 0;
  PAIR_T = PAIRS.map(([i, j]) => {
    if (i === 0) return lerp(g0[0], g0[1], (j - 1) / 21);
    if (i === 1) return lerp(g1[0], g1[1], (j - 2) / 20);
    return lerp(g2[0], g2[1], n2++ / 209);
  });
  return PAIR_T;
}
function partPairs(t) {
  const pt = pairTimes();
  const grow = eio(seg(t, s('b9', 0.3), s('b9', 1.6)));
  const youA = seg(t, s('b2', 0.2), s('b2', 0.7));
  const split = seg(t, s('b8', 0.2), s('b8', 0.8));
  ctx.lineCap = 'round';
  // the 46-guest ring's extra pairs
  if (grow > 0.3) A(seg(grow, 0.3, 1) * 0.16, () => {
    ctx.strokeStyle = C.coral; ctx.lineWidth = 1.3;
    for (let i = 0; i < 46; i++) for (let j = i + 1; j < 46; j++) { if (i % 2 === 0 && j % 2 === 0) continue; const [x0, y0] = ringXY(i, 46), [x1, y1] = ringXY(j, 46); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  });
  // lines from you
  const youLines = t < s('b5', 0.3);
  if (youLines) for (let j = 1; j < 23; j++) {
    const f = eout(seg(t, s('b3', 0.1 + j * 0.04), s('b3', 0.5 + j * 0.04)));
    if (f <= 0) continue;
    const [x0, y0] = ringXY(0), [x1, y1] = ringXY(j);
    ctx.strokeStyle = C.sky; ctx.lineWidth = 3; ctx.globalAlpha = lerp(0.9, 0.25, seg(t, s('b4'), s('b4', 0.5)));
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); ctx.stroke(); ctx.globalAlpha = 1;
  }
  // one other pair
  const other = span(t, s('b4', 0.4), s('b5', 0.4), 0.4, 0.4);
  if (other > 0) A(other, () => { const [x0, y0] = ringXY(7), [x1, y1] = ringXY(15), f = eout(seg(t, s('b4', 0.4), s('b4', 1.0))); ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); ctx.stroke(); });
  // every pair
  if (!youLines) PAIRS.forEach(([i, j], n) => {
    const f = eout(seg(t, pt[n], pt[n] + 0.3));
    if (f <= 0) return;
    const [x0, y0] = ringXY(i), [x1, y1] = ringXY(j), you = i === 0;
    const base = t < s('b8') ? (t < pt[n] + 0.6 ? 0.85 : 0.42) : 0.42;
    ctx.strokeStyle = split > 0 ? (you ? C.sky : C.coral) : GCOL(i);
    ctx.globalAlpha = split > 0 ? (you ? lerp(base, 0.95, split) : lerp(base, 0.3, split)) : base;
    ctx.lineWidth = split > 0 && you ? lerp(2, 3.5, split) : 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, f), lerp(y0, y1, f)); ctx.stroke(); ctx.globalAlpha = 1;
  });
  // the guests
  for (let i = 0; i < 46; i++) {
    const orig = i % 2 === 0, gi = i / 2;
    const pop = orig ? back(seg(t, s('b1', -0.3 + gi * 0.05), s('b1', 0.0 + gi * 0.05))) : back(seg(t, s('b9', 0.6 + i * 0.015), s('b9', 0.9 + i * 0.015)));
    if (pop <= 0) continue;
    const [x, y] = ringXY(i, 46), r = lerp(20, 13, grow);
    const hl = (orig && (gi === 7 || gi === 15) && other > 0) ? C.coralSoft : (orig && gi === 0 && youA > 0 ? C.skySoft : null);
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); guest(0, 0, r, orig ? GCOL(gi) : GCOL(i + 3), { halo: hl }); ctx.restore();
  }
  A(youA * (1 - grow), () => { font(600, 40, DISPLAY); const [x, y] = ringXY(0); text('you', x + 64, y - 6, { color: C.skyDeep }); });
  // the right-hand side
  A(span(t, s('b3', 0.3), s('b4', 0.2), 0.5, 0.4), () => {
    font(600, 170, DISPLAY); text(pct(Q(22)), 1412, 520, { color: C.skyDeep, align: 'center' });
    font(500, 40); text('chance that someone', 1412, 660, { color: C.inkSoft, align: 'center' });
    text('shares your birthday', 1412, 712, { color: C.inkSoft, align: 'center' });
  });
  A(span(t, s('b4', 0.3), s('b5', 0.2), 0.5, 0.4), () => { font(600, 64, DISPLAY); text('any two guests', 1412, 520, { color: C.coralDeep, align: 'center' }); text('can match', 1412, 600, { color: C.coralDeep, align: 'center' }); });
  A(span(t, s('b5', 0.2), s('b7', 0.2), 0.5, 0.4), () => {
    const started = PAIRS.filter((_, n) => t >= pt[n]).length;
    const terms = ['22', ' + 21', ' + 20 + … + 1'], showT = [pt[0], pt[22], pt[43]];
    font(500, 52); let x = 1412 - tw(terms.join('')) / 2;
    terms.forEach((str, i) => { A(seg(t, showT[i], showT[i] + 0.4), () => text(str, x, 400, { color: C.ink })); x += tw(str); });
    font(600, 170, DISPLAY); text(String(started), 1412, 600, { color: C.coral, align: 'center' });
    font(500, 44); text('pairs', 1412, 730, { color: C.inkSoft, align: 'center' });
  });
  A(span(t, s('b7', -0.1), s('b8', 0.2), 0.5, 0.4), () => {
    font(500, 72); text('23 × 22 ÷ 2', 1412, 400, { color: C.ink, align: 'center' });
    font(600, 170, DISPLAY); text('253', 1412, 600, { color: C.coral, align: 'center' });
    font(500, 44); text('pairs', 1412, 730, { color: C.inkSoft, align: 'center' });
  });
  A(span(t, s('b8', 0.2), s('b9', 0.2), 0.5, 0.4), () => {
    const rows = [[22, 'pairs with you', C.sky, C.skyDeep], [231, 'pairs without you', C.coral, C.coralDeep]];
    rows.forEach(([n, lab, col, deep], i) => {
      const y = 400 + i * 200, g = eout(seg(t, s('b8', 0.3 + i * 0.5), s('b8', 1.1 + i * 0.5)));
      font(600, 80, DISPLAY); text(String(n), 1060, y, { color: deep });
      font(500, 40); text(lab, 1200, y + 4, { color: C.ink });
      ctx.fillStyle = C.cellEmpty; rrect(1060, y + 56, 700, 30, 15); ctx.fill();
      ctx.fillStyle = col; rrect(1060, y + 56, Math.max(30, 700 * (n / 253) * g), 30, 15); ctx.fill();
    });
  });
  A(span(t, s('b9', 0.2), at(3) + 1.0, 0.5, 0.6), () => {
    const rows = [[23, 253], [46, 1035]];
    rows.forEach(([g, p], i) => {
      const y = 400 + i * 220, w = eout(seg(t, s('b9', 0.4 + i * 1.2), s('b9', 1.4 + i * 1.2)));
      A(seg(t, s('b9', 0.3 + i * 1.2), s('b9', 0.8 + i * 1.2)), () => {
        font(600, 56, DISPLAY); text(`${g} guests`, 1060, y, { color: C.ink });
        ctx.fillStyle = C.coral; rrect(1060, y + 52, Math.max(28, 700 * (p / 1035) * w), 34, 17); ctx.fill();
        font(600, 44, DISPLAY); text(`${fmt(p)} pairs`, 1760, y, { color: C.coralDeep, align: 'right' });
      });
    });
    A(seg(t, s('b9', 2.8), s('b9', 3.4)), () => { font(500, 40); text('twice the guests, about four times the pairs', 1060, 860, { color: C.inkSoft }); });
  });
}

// ---------- 3: counting the misses ----------
let FT = null;
function factorTimes() {
  if (FT) return FT;
  FT = [mid('c2', 0.55), mid('c3', 0.55), mid('c4', 0.35)];
  for (let k2 = 3; k2 < 22; k2++) FT.push(lerp(mid('c4', 0.78), s('c5', 0.3), (k2 - 3) / 18));
  FT.push(mid('c5', 0.62));
  return FT;
}
const CHART = { x0: 1090, x1: 1780, y0: 820, y1: 270 };
const cx = (n, n1 = 100) => lerp(CHART.x0, CHART.x1, n / n1), cy = (p) => lerp(CHART.y0, CHART.y1, p);
function axes(xTicks, n1, xTitle) {
  ctx.strokeStyle = C.line; ctx.lineWidth = 2;
  for (const p of [0.5, 1]) { ctx.beginPath(); ctx.moveTo(CHART.x0, cy(p)); ctx.lineTo(CHART.x1, cy(p)); ctx.stroke(); }
  ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(CHART.x0, CHART.y1 - 16); ctx.lineTo(CHART.x0, CHART.y0); ctx.lineTo(CHART.x1, CHART.y0); ctx.stroke();
  font(500, 32);
  for (const p of [0, 0.5, 1]) text(`${p * 100}%`, CHART.x0 - 16, cy(p), { color: C.inkSoft, align: 'right' });
  for (const n of xTicks) text(String(n), cx(n, n1), CHART.y0 + 36, { color: C.inkSoft, align: 'center' });
  text(xTitle, CHART.x1, CHART.y0 + 82, { color: C.inkFaint, align: 'right' });
}
function partMisses(t) {
  const ft = factorTimes();
  let k2 = -1; for (let i = 0; i < 23; i++) if (t >= ft[i]) k2 = i;
  const prodAt = (i) => (i < 0 ? 1 : allDiff(i + 1));
  const fstep = k2 >= 0 ? eout(seg(t, ft[k2], ft[k2] + 0.3)) : 1;
  const prod = lerp(prodAt(k2 - 1), prodAt(k2), fstep);
  // calendar marks
  A(calendarVis(t) * (1 - seg(t, s('c12', -0.4), s('c12', 0.1))), () => { for (let i = 0; i <= k2; i++) mark(DISTINCT[i], GCOL(i), seg(t, ft[i], ft[i] + 0.3)); });
  // heading
  A(span(t, s('c1', 0.2), s('c9', 0.2), 0.5, 0.5), () => {
    font(600, 56, DISPLAY); text('No two the same', 1060, 290, { color: C.tealDeep });
    font(500, 36); text('the chance that all 23 birthdays differ', 1060, 350, { color: C.inkSoft });
  });
  // the chain of fractions
  A(span(t, ft[0] - 0.3, s('c8', 0.3), 0.4, 0.5), () => {
    const items = [['365', '365', ft[0]], ['364', '365', ft[1]], ['363', '365', ft[2]], ['…', null, ft[3]], ['343', '365', ft[22]]];
    let x = 1060; const y = 480;
    items.forEach(([n, d, t0], i) => {
      A(seg(t, t0, t0 + 0.4), () => {
        if (i > 0) { font(500, 44); text('×', x + 4, y, { color: C.inkSoft }); }
        const ox = i > 0 ? 44 : 0;
        if (d) frac(n, d, x + ox + 44, y, 40); else { font(500, 44); text(n, x + ox + 14, y, { color: C.ink }); }
      });
      x += (i > 0 ? 44 : 0) + (d ? 98 : 58);
    });
    A(seg(t, ft[0], ft[0] + 0.4), () => {
      font(500, 40);
      const g = Math.max(0, k2);
      text(`guest ${g + 1}: ${365 - g} free days of 365`, 1060, 610, { color: C.inkSoft });
    });
  });
  // 23 factors, each close to 1
  A(span(t, s('c8', 0.2), s('c9', 0.3), 0.5, 0.5), () => {
    for (let i = 0; i < 23; i++) {
      const h = 130 * ((365 - i) / 365), x = 1060 + i * 30, g = eout(seg(t, s('c8', 0.2 + i * 0.03), s('c8', 0.6 + i * 0.03)));
      ctx.fillStyle = C.teal; rrect(x, 560 - h * g, 22, h * g, 4); ctx.fill();
    }
    ctx.strokeStyle = C.inkFaint; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(1052, 430); ctx.lineTo(1760, 430); ctx.stroke(); ctx.setLineDash([]);
    font(500, 32); text('1', 1770, 430, { color: C.inkSoft });
    font(500, 36); text('23 factors, each close to 1', 1060, 610, { color: C.inkSoft });
  });
  // the bar
  A(span(t, ft[0] - 0.2, s('c9', 0.2), 0.5, 0.5), () => {
    const x0 = 1060, w = 700, y = 700;
    font(500, 36); text('all different', x0, y - 34, { color: C.tealDeep });
    font(600, 44, DISPLAY); text(pct(prod), x0 + w, y - 34, { color: C.tealDeep, align: 'right' });
    ctx.fillStyle = C.cellEmpty; rrect(x0, y, w, 40, 20); ctx.fill();
    const cr = eout(seg(t, s('c7', 0.2), s('c7', 1.0)));
    if (cr > 0) { ctx.fillStyle = C.coral; rrect(x0 + w * prod + 4 - (1 - cr) * 0, y, Math.max(0, w * (1 - prod) - 4) * cr, 40, 20); ctx.fill(); }
    ctx.fillStyle = C.teal; rrect(x0, y, Math.max(40, w * prod), 40, 20); ctx.fill();
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + w / 2, y - 6); ctx.lineTo(x0 + w / 2, y + 46); ctx.stroke();
    A(span(t, s('c6', 0.5), s('c7', 0.4), 0.4, 0.4), () => { font(600, 110, DISPLAY); text(pct(allDiff(23)), x0, 850, { color: C.tealDeep }); font(500, 36); text('all different', x0 + 330, 860, { color: C.inkSoft }); });
    A(seg(t, s('c7', 0.4), s('c7', 0.9)), () => { font(600, 110, DISPLAY); text(pct(P(23)), x0, 850, { color: C.coral }); font(500, 36); text('at least one match', x0 + 330, 860, { color: C.inkSoft }); });
  });
  // the curve
  const chartA = span(t, s('c9', 0.1), at(4) + 1.0, 0.6, 0.6);
  if (chartA > 0) A(chartA, () => {
    const segs = [[s('c9', 0.3), e('c9', -0.2), 1, 23], [mid('c10', 0.2), mid('c10', 0.38), 23, 30], [mid('c10', 0.55), mid('c10', 0.72), 30, 50], [mid('c11', 0.1), mid('c11', 0.3), 50, 57], [mid('c11', 0.5), mid('c11', 0.72), 57, 70], [e('c11', -0.1), e('c11', 0.7), 70, 100]];
    let N = 1;
    for (const [a, b, n0, n1] of segs) if (t >= a) N = lerp(n0, n1, eio(seg(t, a, b)));
    axes([0, 20, 40, 60, 80, 100], 100, 'guests');
    font(500, 36); text('chance of a shared birthday', CHART.x0, CHART.y1 - 50, { color: C.inkSoft });
    ctx.strokeStyle = C.coral; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let n = 1; n <= N; n += 0.25) n === 1 ? ctx.moveTo(cx(n), cy(Pc(n))) : ctx.lineTo(cx(n), cy(Pc(n)));
    ctx.lineTo(cx(N), cy(Pc(N))); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx(N), cy(Pc(N)), 9, 0, TAU); ctx.fill();
    const marks = [[23, e('c9', -0.2), 22, 16, 'left'], [10, mid('c10', 0.05), 18, 8, 'left'], [30, mid('c10', 0.38), 18, 40, 'left'], [50, mid('c10', 0.72), 0, 56, 'center'], [57, mid('c11', 0.3), 0, -44, 'center'], [70, mid('c11', 0.72), 10, 56, 'center']];
    for (const [n, t0, dx, dy, al] of marks) A(seg(t, t0, t0 + 0.3), () => {
      const x = cx(n), y = cy(P(n)), pop = back(seg(t, t0, t0 + 0.35));
      ctx.fillStyle = C.marigold; ctx.beginPath(); ctx.arc(x, y, 11 * pop, 0, TAU); ctx.fill();
      const v = P(n) > 0.995 ? pct(P(n), 1) : P(n) > 0.985 ? '99%' : P(n) > 0.95 ? '97%' : pct(P(n));
      font(600, 34); text(v, x + dx, y + dy, { color: n === 23 ? C.coralDeep : C.ink, align: al });
    });
    // the readout
    A(span(t, s('c9', 0.2), s('c12', 0.1), 0.5, 0.5), () => {
      const n = Math.round(N);
      font(500, 40); text('guests', 516, 330, { color: C.inkSoft, align: 'center' });
      font(600, 170, DISPLAY); text(String(n), 516, 450, { color: C.ink, align: 'center' });
      font(500, 40); text('chance of a match', 516, 610, { color: C.inkSoft, align: 'center' });
      font(600, 130, DISPLAY); text(pct(P(n)), 516, 720, { color: C.coral, align: 'center' });
    });
    A(seg(t, s('c12', 1.0), s('c12', 1.6)), () => pill('certain at 366 guests', CHART.x1, CHART.y1 - 50, { bg: C.coral, fg: C.sheet, size: 34, align: 'right' }));
  });
  // 366 guests: every day taken
  A(span(t, s('c12', -0.3), at(4) + 1.0, 0.5, 0.6) * calendarVis(t), () => {
    for (let d = 0; d < 365; d++) { const t0 = s('c12', 0.3) + (d / 365) * 1.6; mark(d, GCOL(d * 7), seg(t, t0, t0 + 0.25)); }
    A(seg(t, s('c12', 2.0), s('c12', 2.5)), () => {
      const bob = Math.sin(t * 3) * 4;
      guest(170, 892 + bob, 20, C.berry);
      font(500, 34); text('guest 366: no free day', 214, 902, { color: C.ink });
    });
  });
}

// ---------- 4: rooms filling up ----------
let RM = null;
function roomTimes() {
  if (RM) return RM;
  const M1 = s('d2', 0.3), S1 = Math.max(s('d1', 0.8), M1 - (FIRST[0] - 1) * 0.15);
  const S2 = e('d2', -0.5), M2 = Math.max(mid('d3', 0.26), S2 + 1.2);
  const M3 = Math.max(mid('d3', 0.95), M2 + 2.2), S3 = M3 - 1.3;
  RM = [[S1, M1], [S2, M2], [S3, M3]];
  return RM;
}
const PLOT = { x0: 1066, pitch: 10.4, base: 790 };
const STACK = (() => { const c = {}; return FIRST.map((n) => (c[n] = (c[n] ?? 0) + 1) - 1); })();
const MAXSTACK = Math.max(...STACK) + 1;
const VP = Math.min(10.4, 400 / MAXSTACK);
let DOT_T = null;
function dotTimes() {
  if (DOT_T) return DOT_T;
  const rm = roomTimes(), a = Math.max(s('d4', 0.6), rm[2][1] + 0.6), b = Math.max(e('d4', 1.2), a + 3);
  DOT_T = FIRST.map((_, r) => (r < 3 ? rm[r][1] : lerp(a, b, Math.pow((r - 3) / 996, 0.75))));
  return DOT_T;
}
const SHIRT_ORDER = (() => { const r = mulberry32(14), a = Array.from({ length: 32 }, (_, i) => i); for (let i = 31; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
function shirt(x, y, sc, fill) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath();
  ctx.moveTo(-14, -30); ctx.quadraticCurveTo(0, -20, 14, -30); ctx.lineTo(34, -20); ctx.lineTo(44, 0); ctx.lineTo(28, 8); ctx.lineTo(24, 2);
  ctx.lineTo(24, 34); ctx.lineTo(-24, 34); ctx.lineTo(-24, 2); ctx.lineTo(-28, 8); ctx.lineTo(-44, 0); ctx.lineTo(-34, -20); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = 'rgba(47,35,66,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
function partRooms(t) {
  const rm = roomTimes(), dt = dotTimes();
  // rooms filling up on the calendar
  A(calendarVis(t), () => {
    for (let r = 0; r < 3; r++) {
      const [S0, M] = rm[r], end = r < 2 ? rm[r + 1][0] - 0.05 : s('d4', 0.8);
      const a = span(t, S0 - 0.1, end, 0.2, 0.3);
      if (a <= 0) continue;
      A(a, () => {
        const days = ROOMDAYS[r], n = days.length, step = (M - S0) / (n - 1);
        const firstOf = days.indexOf(days[n - 1]);
        for (let g = 0; g < n; g++) {
          const tg = S0 + g * step;
          if (t < tg) continue;
          if (g === n - 1) markTwo(days[g], GCOL(firstOf), GCOL(g), seg(t, tg, tg + 0.3));
          else if (!(g === firstOf && t >= M)) mark(days[g], GCOL(g), seg(t, tg, tg + 0.2));
        }
        if (t >= M) {
          ring(days[n - 1], C.ink, t, M, 3.5);
          const [x, y] = cellC(days[n - 1]); burst(x, y, t, M, { n: 18, spread: 70, seed: 20 + r });
          const sc = back(seg(t, M, M + 0.4));
          ctx.save(); ctx.translate(x, y - 50); ctx.scale(sc, sc); pill(`guest ${n}`, 0, 0, { bg: C.coral, fg: C.sheet, size: 34, h: 50 }); ctx.restore();
        }
        const shown = Math.min(n, Math.max(0, Math.floor((t - S0) / step) + 1));
        font(500, 34); text(`room ${r + 1} · ${shown} ${shown === 1 ? 'guest' : 'guests'}`, SHEET.x + 44, 905, { color: C.inkSoft });
      });
    }
  });
  // the dot plot
  A(span(t, s('d1', 0.4), s('d8', 0.3), 0.5, 0.5), () => {
    const X = (n) => PLOT.x0 + (n - 1) * PLOT.pitch;
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(PLOT.x0 - 10, PLOT.base + 12); ctx.lineTo(X(70) + 10, PLOT.base + 12); ctx.stroke();
    font(500, 32);
    for (const n of [10, 20, 30, 40, 50, 60, 70]) { ctx.fillStyle = C.inkSoft; ctx.fillRect(X(n) - 1.5, PLOT.base + 12, 3, 10); text(String(n), X(n), PLOT.base + 48, { color: C.inkSoft, align: 'center' }); }
    text('guest who brought the first match', (PLOT.x0 + X(70)) / 2, PLOT.base + 98, { color: C.inkFaint, align: 'center' });
    const colour = seg(t, s('d6', 0.2), s('d6', 0.8));
    // the first 23 guests' columns
    A(colour * span(t, s('d6', 0.2), s('d8', 0.3), 0.5, 0.5), () => {
      ctx.fillStyle = C.coralSoft; rrect(PLOT.x0 - 8, 380, X(23) - PLOT.x0 + 14, PLOT.base - 368, 10); ctx.fill();
      font(600, 48, DISPLAY); text(`${BY23} by guest 23`, PLOT.x0, 340, { color: C.coralDeep });
    });
    let done = 0;
    for (let r = 0; r < 1000; r++) {
      const f = seg(t, dt[r], dt[r] + 0.35);
      if (f <= 0) continue;
      if (f >= 1) done++;
      const n = FIRST[r], x = X(n), y1 = PLOT.base - STACK[r] * VP - VP / 2, y = lerp(250, y1, eout(f));
      ctx.fillStyle = colour > 0 ? (n <= 23 ? `rgba(238,90,76,${lerp(0.6, 1, colour)})` : `rgba(35,153,140,${lerp(0.6, 0.85, colour)})`) : 'rgba(47,35,66,0.6)';
      ctx.beginPath(); ctx.arc(x, y, VP * 0.42, 0, TAU); ctx.fill();
    }
    A(seg(t, s('d4', 0.2), s('d4', 0.7)) * (1 - colour), () => { font(600, 48, DISPLAY); text(`${fmt(done)} ${done === 1 ? 'room' : 'rooms'}`, PLOT.x0, 300, { color: C.ink }); });
    // the extremes
    A(span(t, s('d5', 0.2), s('d6', 0.3), 0.4, 0.4), () => {
      const lo = Math.min(...FIRST), hiN = FIRST.filter((n) => n > 60);
      ctx.strokeStyle = C.berry; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(X(lo), PLOT.base - VP / 2, 12, 0, TAU); ctx.stroke();
      pill(`${lo} guests`, X(lo) + 10, PLOT.base - 70, { fg: C.berry, border: C.berry, size: 32, h: 44, align: 'left' });
      A(seg(t, mid('d5', 0.5), mid('d5', 0.7)), () => {
        ctx.strokeStyle = C.berry; rrect(X(61) - 8, PLOT.base - 40, X(70) - X(61) + 16, 52, 12); ctx.stroke();
        pill(`${hiN.length} past 60`, X(70) + 6, PLOT.base - 80, { fg: C.berry, border: C.berry, size: 32, h: 44, align: 'right' });
      });
    });
    // the average
    A(span(t, s('d7', 0.2), s('d8', 0.3), 0.4, 0.4), () => {
      const x = X(MEAN);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([9, 8]); ctx.beginPath(); ctx.moveTo(x, 410); ctx.lineTo(x, PLOT.base + 8); ctx.stroke(); ctx.setLineDash([]);
      font(600, 36); text(`average ${MEAN.toFixed(1)}`, x + 16, 420, { color: C.ink });
    });
  });
  // the 2014 World Cup
  A(span(t, s('d8', 0.2), at(5) + 1.0, 0.5, 0.6), () => {
    for (let i = 0; i < 32; i++) {
      const col = i % 8, row = Math.floor(i / 8), x = 516 + (col - 3.5) * 96, y = 330 + row * 130;
      const pop = back(seg(t, s('d8', 0.6 + i * 0.03), s('d8', 0.9 + i * 0.03)));
      if (pop <= 0) continue;
      const rank = SHIRT_ORDER.indexOf(i), hit = rank < 16 ? seg(t, mid('d9', 0.45 + rank * 0.012), mid('d9', 0.45 + rank * 0.012) + 0.3) : 0;
      ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); shirt(0, 0, 1, hit > 0 ? `rgba(238,90,76,${lerp(0.15, 1, hit)})` : 'rgba(47,35,66,0.12)'); ctx.restore();
      if (rank < 5) A(seg(t, s('d10', 0.3 + rank * 0.15), s('d10', 0.6 + rank * 0.15)), () => {
        ctx.fillStyle = C.sheet; ctx.beginPath(); ctx.arc(x + 30, y - 30, 22, 0, TAU); ctx.fill(); ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.stroke();
        font(600, 32, DISPLAY); text('2', x + 30, y - 28, { color: C.coralDeep, align: 'center' });
      });
    }
    font(500, 32); text('squads in no particular order', 516, 860, { color: C.inkFaint, align: 'center' });
    font(600, 60, DISPLAY); text('2014 World Cup', 1060, 300, { color: C.ink });
    font(500, 44); text('32 squads × 23 players', 1060, 380, { color: C.inkSoft });
    A(seg(t, mid('d9', 0.45), mid('d9', 0.6)), () => {
      font(600, 170, DISPLAY); text('16', 1060, 560, { color: C.coral });
      font(500, 44); text('squads with', 1290, 530, { color: C.ink }); text('a shared birthday', 1290, 584, { color: C.ink });
    });
    A(seg(t, s('d10', 0.2), s('d10', 0.7)), () => {
      ctx.fillStyle = C.sheet; ctx.beginPath(); ctx.arc(1084, 740, 24, 0, TAU); ctx.fill(); ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.stroke();
      font(600, 32, DISPLAY); text('2', 1084, 742, { color: C.coralDeep, align: 'center' });
      font(500, 44); text('5 of them had two pairs', 1126, 742, { color: C.ink });
    });
  });
}

// ---------- 5: someone shares my birthday ----------
const CH5 = { x0: 1090, x1: 1780, y0: 830, y1: 450 };
function partYou(t) {
  // your day on the calendar
  A(calendarVis(t), () => {
    const [x, y] = cellC(YOUR), p = eout(seg(t, s('y1', 0.4), s('y1', 1.0)));
    if (p <= 0) return;
    ctx.fillStyle = C.skySoft; ctx.beginPath(); ctx.arc(x, y, 18 * p, 0, TAU); ctx.fill();
    const pulse = t > s('y7') && t < s('y8') ? 3 * Math.sin((t - s('y7')) * 6) : 0;
    ctx.strokeStyle = C.sky; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, (16 + pulse) * p, 0, TAU); ctx.stroke();
    A(p, () => {
      ctx.strokeStyle = C.sky; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 18, y); ctx.lineTo(958, y); ctx.stroke();
      pill('you', 958, y, { fg: C.skyDeep, border: C.sky, size: 32, h: 44, family: DISPLAY, align: 'left' });
    });
  });
  // 253 random birthdays
  const c0 = s('y6', 0.3), c1 = mid('y6', 0.9);
  const dropped = Math.floor(253 * clamp((t - c0) / (c1 - c0)));
  A(calendarVis(t) * (t >= c0 ? 1 : 0), () => {
    const cnt = new Map();
    for (let i = 0; i < Math.min(253, dropped + 1); i++) {
      if (i >= dropped && t < c1) break;
      const d = CROWD[i]; cnt.set(d, (cnt.get(d) ?? 0) + 1);
    }
    for (const [d, n] of cnt) mark(d, n > 1 ? C.coral : C.sky, 1);
    font(500, 34); text(`${Math.min(253, dropped)} people · ${cnt.size} days`, SHEET.x + 44, 905, { color: C.inkSoft });
  });
  // the question
  A(span(t, at(5) + 2.6, s('y6', 0.2), 0.6, 0.5), () => {
    font(600, 56, DISPLAY); text('Someone shares', 1060, 290, { color: C.ink }); text('your birthday?', 1060, 360, { color: C.skyDeep });
  });
  A(span(t, s('y2', 0.2), s('y4', 0.2), 0.5, 0.5), () => { font(500, 44); text('each person: 1 in 365', 1060, 480, { color: C.ink }); });
  A(span(t, s('y3', 0.2), s('y4', 0.2), 0.5, 0.5), () => {
    font(500, 40); text('chance that nobody matches you:', 1060, 580, { color: C.inkSoft });
    font(500, 64); text('(', 1060, 690, { color: C.ink });
    frac('364', '365', 1060 + 74, 690, 44);
    font(500, 64); text(')', 1060 + 120, 690, { color: C.ink });
    supText([['', false], ['n', true]], 1060 + 146, 690, 80, C.ink);
    font(500, 36); text('one factor per person', 1260, 690, { color: C.inkSoft });
  });
  // two curves
  A(span(t, s('y4', 0.0), s('y6', 0.2), 0.5, 0.5), () => {
    const X = (n) => lerp(CH5.x0, CH5.x1, n / 400), Y = (p) => lerp(CH5.y0, CH5.y1, p);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; for (const p of [0.5, 1]) { ctx.beginPath(); ctx.moveTo(CH5.x0, Y(p)); ctx.lineTo(CH5.x1, Y(p)); ctx.stroke(); }
    ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CH5.x0, CH5.y1 - 14); ctx.lineTo(CH5.x0, CH5.y0); ctx.lineTo(CH5.x1, CH5.y0); ctx.stroke();
    font(500, 32);
    for (const p of [0, 0.5, 1]) text(`${p * 100}%`, CH5.x0 - 16, Y(p), { color: C.inkSoft, align: 'right' });
    for (const n of [0, 100, 200, 300, 400]) text(String(n), X(n), CH5.y0 + 36, { color: C.inkSoft, align: 'center' });
    text('people', CH5.x1, CH5.y0 + 80, { color: C.inkFaint, align: 'right' });
    const pa = eout(seg(t, s('y4', 0.1), s('y4', 0.9)));
    ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.globalAlpha *= 0.55 + 0.45 * pa; ctx.beginPath();
    for (let n = 1; n <= 400 * pa; n += 1) n === 1 ? ctx.moveTo(X(n), Y(n < 366 ? Pc(n) : 1)) : ctx.lineTo(X(n), Y(n < 366 ? Pc(n) : 1));
    ctx.stroke(); ctx.globalAlpha = 1;
    const nq = 253 * eio(seg(t, s('y4', 0.4), mid('y4', 0.85))) + 147 * eio(seg(t, e('y5', -0.6), e('y5', 0.6)));
    ctx.strokeStyle = C.sky; ctx.lineWidth = 6; ctx.beginPath();
    for (let n = 0; n <= nq; n += 2) n === 0 ? ctx.moveTo(X(0), Y(0)) : ctx.lineTo(X(n), Y(Q(n)));
    ctx.lineTo(X(nq), Y(Q(nq))); ctx.stroke();
    A(seg(t, mid('y4', 0.85), mid('y4', 0.85) + 0.4), () => {
      ctx.fillStyle = C.sky; ctx.beginPath(); ctx.arc(X(253), Y(Q(253)), 11, 0, TAU); ctx.fill();
      font(600, 36); text('253 people', X(253) + 18, Y(Q(253)) + 34, { color: C.skyDeep });
    });
    A(seg(t, s('y4', 0.6), s('y4', 1.0)), () => {
      ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(X(23), Y(P(23)), 9, 0, TAU); ctx.fill();
      font(600, 34); text('23', X(23) + 18, Y(P(23)) + 4, { color: C.coralDeep });
    });
    // legend
    font(500, 32);
    ctx.fillStyle = C.coral; ctx.fillRect(1440, 488, 30, 8); text('any two share', 1484, 492, { color: C.ink });
    ctx.fillStyle = C.sky; ctx.fillRect(1440, 538, 30, 8); text('someone shares yours', 1484, 542, { color: C.ink });
    // half of 365
    A(span(t, s('y5', 0.3), s('y6', 0.2), 0.4, 0.4), () => {
      const x = X(182.5);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(x, CH5.y0); ctx.lineTo(x, Y(Q(182.5)) - 30); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, Y(Q(182.5)), 8, 0, TAU); ctx.fill();
      font(600, 32); text('half of 365', x - 14, Y(Q(182.5)) - 44, { color: C.ink, align: 'right' });
      text(pct(Q(182.5), 0), x - 14, Y(Q(182.5)) + 4, { color: C.skyDeep, align: 'right' });
    });
  });
  // the tally
  A(span(t, s('y6', 0.3), s('y8', 0.3), 0.5, 0.5), () => {
    font(600, 80, DISPLAY); text(`${Math.min(253, dropped)} people`, 1060, 340, { color: C.ink });
    A(seg(t, c1, c1 + 0.5), () => { font(500, 44); text('land on only', 1060, 440, { color: C.inkSoft }); font(600, 80, DISPLAY); text(`${CROWD_DAYS} days`, 1060, 530, { color: C.skyDeep }); });
    font(500, 32);
    ctx.fillStyle = C.sky; ctx.fillRect(1060, 640, 28, 28); text('one birthday', 1102, 655, { color: C.inkSoft });
    ctx.fillStyle = C.coral; ctx.fillRect(1360, 640, 28, 28); text('two or more', 1402, 655, { color: C.inkSoft });
    A(seg(t, s('y7', 0.3), s('y7', 0.9)), () => { font(500, 48); text(`${CROWD_DAYS} ÷ 365 ≈ ${Math.round((100 * CROWD_DAYS) / 365)}%`, 1060, 790, { color: C.ink }); font(500, 36); text('the chance your day is one of them', 1060, 850, { color: C.inkSoft }); });
  });
  // 253 = 253
  A(span(t, s('y8', 0.0), at(6) + 1.0, 0.5, 0.6), () => {
    const box = (cx0, col, deep, top, bottom, t0) => A(eout(seg(t, t0, t0 + 0.5)), () => {
      const y = 470 + (1 - eout(seg(t, t0, t0 + 0.5))) * 20;
      ctx.fillStyle = C.sheet; rrect(cx0 - 350, y - 190, 700, 380, 30); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
      font(500, 44); text(top, cx0, y - 120, { color: C.inkSoft, align: 'center' });
      font(600, 170, DISPLAY); text('253', cx0, y + 10, { color: deep, align: 'center' });
      font(500, 44); text(bottom, cx0, y + 130, { color: C.ink, align: 'center' });
    });
    box(530, C.coral, C.coralDeep, '23 guests make', 'pairs', s('y8', 0.2));
    box(1390, C.sky, C.skyDeep, '253 people make', 'chances to match you', s('y8', 0.9));
    A(seg(t, s('y8', 1.3), s('y8', 1.8)), () => { font(600, 110, DISPLAY); text('=', 960, 476, { color: C.ink, align: 'center' }); });
    A(seg(t, s('y9', 0.6), s('y9', 1.2)), () => { font(500, 48); text('each a 1-in-365 chance', 960, 740, { color: C.ink, align: 'center' }); });
    A(seg(t, mid('y10', 0.6), mid('y10', 0.8)), () => {
      font(500, 72); text('365 × ln 2 ≈ 253', 960, 860, { color: C.coralDeep, align: 'center' });
    });
  });
}

// ---------- 6: a rule of thumb ----------
function partRule(t) {
  const L = (t0, y, draw) => A(span(t, t0, s('r6', 0.2), 0.5, 0.5), () => { const p = eout(seg(t, t0, t0 + 0.5)); ctx.save(); ctx.translate((1 - p) * 20, 0); draw(y); ctx.restore(); });
  L(s('r2', 0.2), 320, (y) => { font(500, 60); text('pairs ≈ n² ÷ 2', 140, y, { color: C.ink }); });
  L(s('r3', 0.4), 440, (y) => { font(500, 60); text('n² ≈ 2 × 253 = 506', 140, y, { color: C.ink }); });
  L(s('r4', 0.2), 560, (y) => {
    font(500, 60); const w = tw('n ≈ √506 ≈ 22.5'); text('n ≈ √506 ≈ 22.5', 140, y, { color: C.ink });
    A(seg(t, mid('r4', 0.7), mid('r4', 0.9)), () => { arrow(140 + w + 24, y, 140 + w + 96, y, C.coral, 5, 18); font(600, 72, DISPLAY); text('23', 140 + w + 112, y, { color: C.coralDeep }); });
  });
  // the general rule, boxed; then a million days
  A(span(t, s('r5', 0.2), at(7) + 1.0, 0.5, 0.6), () => {
    const y = lerp(720, 330, eio(seg(t, s('r6', 0.0), s('r6', 0.8))));
    font(600, 64); const w = tw('n ≈ 1.18 × √days') + 64;
    ctx.fillStyle = C.sheet; rrect(140 - 32, y - 56, w, 112, 24); ctx.fill(); ctx.strokeStyle = C.coral; ctx.lineWidth = 5; ctx.stroke();
    text('n ≈ 1.18 × √days', 140, y, { color: C.coralDeep });
  });
  A(span(t, s('r6', 0.6), at(7) + 1.0, 0.5, 0.6), () => {
    font(500, 52);
    text('days = 1,000,000', 140, 500, { color: C.ink });
    A(seg(t, s('r6', 1.2), s('r6', 1.7)), () => text('√days = 1,000', 140, 600, { color: C.ink }));
    A(seg(t, mid('r6', 0.7), mid('r6', 0.9)), () => { text('n ≈ 1.18 × 1,000 ≈ ', 140, 700, { color: C.ink }); const w = tw('n ≈ 1.18 × 1,000 ≈ '); font(600, 64, DISPLAY); text('1,178', 140 + w, 700, { color: C.coralDeep }); });
    A(seg(t, s('r7', 0.6), s('r7', 1.2)), () => { font(500, 40); text('people grow like the square root of the days', 140, 830, { color: C.inkSoft }); });
  });
  // the pairs as half a square
  A(span(t, s('r2', 0.0), s('r6', 0.3), 0.5, 0.5), () => {
    const n = 23, pitch = 22, cs = 19, x0 = 1150, y0 = 270;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = x0 + j * pitch, y = y0 + i * pitch;
      if (i > j) { const f = seg(t, lerp(s('r2', 0.3), e('r2', -0.2), i / 22), lerp(s('r2', 0.3), e('r2', -0.2), i / 22) + 0.3); ctx.fillStyle = f > 0 ? `rgba(238,90,76,${lerp(0.15, 0.9, f)})` : C.cellEmpty; }
      else if (i === j) ctx.fillStyle = 'rgba(47,35,66,0.28)';
      else ctx.fillStyle = C.cellEmpty;
      rrect(x, y, cs, cs, 3); ctx.fill();
    }
    font(500, 40); text('23 × 23 = 529 squares', x0 + (n * pitch) / 2, 222, { color: C.ink, align: 'center' });
    A(seg(t, s('r3', 0.2), s('r3', 0.7)), () => { font(500, 40); text('(529 − 23) ÷ 2 = 253 pairs', x0 + (n * pitch) / 2, 826, { color: C.coralDeep, align: 'center' }); });
    A(seg(t, s('r3', 0.2), s('r3', 0.7)), () => { font(500, 32); text('diagonal: no one pairs with themselves', x0 + (n * pitch) / 2, 880, { color: C.inkFaint, align: 'center' }); });
  });
  // a million days
  A(span(t, s('r6', 0.2), at(7) + 1.0, 0.6, 0.6), () => {
    const x0 = 1080, y0 = 250, sz = 480, g = eout(seg(t, s('r6', 0.2), s('r6', 1.0)));
    ctx.fillStyle = C.tealSoft; ctx.fillRect(x0, y0, sz, sz * g);
    ctx.strokeStyle = 'rgba(255,252,246,0.6)'; ctx.lineWidth = 1.5;
    for (let i = 1; i < 20; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * 24, y0); ctx.lineTo(x0 + i * 24, y0 + sz * g); ctx.stroke(); if (i * 24 < sz * g) { ctx.beginPath(); ctx.moveTo(x0, y0 + i * 24); ctx.lineTo(x0 + sz, y0 + i * 24); ctx.stroke(); } }
    ctx.strokeStyle = C.tealDeep; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, sz, sz * g);
    font(500, 40); text('1,000,000 days', x0 + sz / 2, 210, { color: C.ink, align: 'center' });
    A(seg(t, mid('r6', 0.7), mid('r6', 0.9)), () => {
      const side = Math.sqrt(1178 / 1e6) * sz;
      ctx.fillStyle = C.coral; ctx.fillRect(x0 + 6, y0 + 6, side, side);
      ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 6 + side, y0 + 6 + side / 2); ctx.lineTo(x0 + sz + 30, y0 + 50); ctx.stroke();
      font(600, 64, DISPLAY); text('1,178', x0 + sz + 40, y0 + 50, { color: C.coralDeep });
      font(500, 40); text('people', x0 + sz + 40, y0 + 112, { color: C.ink });
    });
    A(seg(t, s('r7', 0.3), s('r7', 0.9)), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, y0 + sz + 22); ctx.lineTo(x0 + sz, y0 + sz + 22); ctx.moveTo(x0, y0 + sz + 12); ctx.lineTo(x0, y0 + sz + 32); ctx.moveTo(x0 + sz, y0 + sz + 12); ctx.lineTo(x0 + sz, y0 + sz + 32); ctx.stroke();
      font(500, 40); text('1,000 days on a side', x0 + sz / 2, y0 + sz + 66, { color: C.ink, align: 'center' });
    });
  });
}

// ---------- 7: real birthdays ----------
function hatch(x, y, w, h, a) {
  A(a, () => {
    ctx.fillStyle = 'rgba(246,237,221,0.86)'; rrect(x - 6, y - 6, w + 12, h + 12, 10); ctx.fill();
    ctx.save(); rrect(x - 6, y - 6, w + 12, h + 12, 10); ctx.clip();
    ctx.strokeStyle = 'rgba(47,35,66,0.18)'; ctx.lineWidth = 2;
    for (let i = -h; i < w; i += 16) { ctx.beginPath(); ctx.moveTo(x + i, y + h + 6); ctx.lineTo(x + i + h + 12, y - 6); ctx.stroke(); }
    ctx.restore();
  });
}
function partReal(t) {
  const SEP16 = START[8] + 15, DEC25 = START[11] + 24;
  A(calendarVis(t), () => {
    // September and October
    A(span(t, s('u2', 0.6), s('u4', 0.3), 0.5, 0.5), () => {
      for (const m of [8, 9]) { const [bx, by] = blockXY(m); ctx.fillStyle = 'rgba(242,169,59,0.3)'; rrect(bx - 8, by - 6, CAL.bw + 16, 200, 14); ctx.fill(); }
    });
    A(span(t, s('u3', 0.3), s('u4', 0.3), 0.4, 0.5), () => {
      mark(SEP16, C.coral, seg(t, s('u3', 0.3), s('u3', 0.7))); ring(SEP16, C.coral, t, s('u3', 0.3));
      A(seg(t, mid('u3', 0.55), mid('u3', 0.7)), () => { const [x, y] = cellC(DEC25); ctx.fillStyle = C.sheet; rrect(x - 12, y - 12, 24, 24, 4); ctx.fill(); ctx.strokeStyle = C.sky; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
    });
    // half the year
    const half = span(t, s('u5', 0.3), s('u7', 0.4), 0.6, 0.6);
    for (let m = 6; m < 12; m++) { const [bx, by] = blockXY(m); hatch(bx, by, CAL.bw, 194, half); }
    A(half, () => { font(500, 34); text('181 days: January to June', SHEET.x + 44, 905, { color: C.inkSoft }); });
  });
  A(span(t, at(7) + 2.6, s('u2', 0.2), 0.6, 0.5), () => {
    font(600, 56, DISPLAY); text('Our simplifications', 1060, 290, { color: C.ink });
    ['365 equally likely days', 'no February 29', 'no twins'].forEach((str, i) => A(seg(t, mid('u1', 0.15 + i * 0.3), mid('u1', 0.3 + i * 0.3)), () => {
      ctx.fillStyle = GCOL(i * 2); rrect(1068, 400 + i * 90 - 14, 28, 28, 6); ctx.fill();
      font(500, 44); text(str, 1116, 400 + i * 90, { color: C.ink });
    }));
  });
  A(span(t, s('u2', 0.2), s('u4', 0.2), 0.5, 0.5), () => {
    font(500, 44); text('In the US, more births in', 1060, 330, { color: C.inkSoft });
    font(600, 56, DISPLAY); text('September and October', 1060, 400, { color: C.marigoldDeep });
    A(seg(t, s('u3', 0.3), s('u3', 0.8)), () => {
      ctx.fillStyle = C.coral; rrect(1062, 546, 28, 28, 6); ctx.fill(); font(500, 44); text('September 16: most common', 1110, 560, { color: C.ink });
    });
    A(seg(t, mid('u3', 0.55), mid('u3', 0.7)), () => {
      ctx.strokeStyle = C.sky; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(1076, 650, 15, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      font(500, 44); text('December 25: rarest', 1110, 650, { color: C.ink });
      font(500, 32); text('US birthdays, 1973–1999', 1110, 720, { color: C.inkFaint });
    });
  });
  A(span(t, s('u4', 0.2), s('u5', 0.3), 0.5, 0.5), () => {
    font(600, 60, DISPLAY); text('Any unevenness', 1060, 330, { color: C.ink });
    font(500, 48); text('makes a match more likely', 1060, 410, { color: C.coralDeep });
    const even = Array(12).fill(0.6), lumpy = [0.45, 0.4, 0.5, 0.55, 0.5, 0.55, 0.65, 0.7, 0.95, 0.9, 0.6, 0.4];
    [[even, 'even', 1080], [lumpy, 'uneven', 1450]].forEach(([hs, lab, x0], i) => A(seg(t, s('u4', 0.6 + i * 0.6), s('u4', 1.0 + i * 0.6)), () => {
      hs.forEach((h, j) => { ctx.fillStyle = i ? C.marigold : C.teal; rrect(x0 + j * 24, 700 - h * 150, 18, h * 150, 4); ctx.fill(); });
      ctx.fillStyle = C.inkSoft; ctx.fillRect(x0 - 6, 702, 12 * 24 + 6, 3);
      font(500, 36); text(lab, x0, 750, { color: C.inkSoft });
    }));
  });
  A(span(t, s('u5', 0.3), s('u7', 0.2), 0.5, 0.5), () => {
    font(600, 56, DISPLAY); text('Born only in', 1060, 300, { color: C.ink }); text('January to June?', 1060, 370, { color: C.ink });
    A(seg(t, s('u6', 0.2), s('u6', 0.7)), () => {
      font(600, 150, DISPLAY); text('17', 1060, 540, { color: C.coral });
      font(500, 44); text('guests', 1250, 520, { color: C.ink }); text(`${pct(P(17, 181))} chance`, 1250, 574, { color: C.inkSoft });
      for (let i = 0; i < 17; i++) { const p = back(seg(t, s('u6', 0.4 + i * 0.04), s('u6', 0.7 + i * 0.04))); if (p > 0) { ctx.save(); ctx.translate(1084 + i * 42, 720); ctx.scale(p, p); guest(0, 0, 14, GCOL(i)); ctx.restore(); } }
    });
  });
  A(span(t, s('u7', 0.2), s('u8', 0.2), 0.5, 0.5), () => {
    font(600, 56, DISPLAY); text('Real birthdays', 1060, 300, { color: C.ink });
    font(500, 44); text('only slightly uneven: still', 1060, 380, { color: C.inkSoft });
    font(600, 170, DISPLAY); text('23', 1060, 540, { color: C.coral });
    font(500, 44); text('guests for a', 1290, 520, { color: C.ink }); text('better-than-even chance', 1290, 574, { color: C.ink });
  });
  A(span(t, s('u8', 0.2), at(8) + 1.0, 0.5, 0.6), () => {
    const p = back(seg(t, s('u8', 0.3), s('u8', 0.8)));
    for (const dx of [-46, 46]) { ctx.save(); ctx.translate(1180 + dx, 480); ctx.scale(p, p); guest(0, 0, 36, C.berry); ctx.restore(); }
    font(600, 56, DISPLAY); text('Twins', 1340, 470, { color: C.ink });
    font(500, 44); text('almost always a match', 1340, 540, { color: C.inkSoft });
  });
}

// ---------- 8: the birthday attack ----------
// a real 64-bit FNV-1a hash of the file's text, as the fingerprint
function fnv64(str) { let h = 0xcbf29ce484222325n; for (const ch of str) { h ^= BigInt(ch.codePointAt(0)); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; } return h; }
const BITS64 = (() => { const h = fnv64('The birthday problem: why 23 people are enough.'); return Array.from({ length: 64 }, (_, i) => Number((h >> BigInt(63 - i)) & 1n)); })();
const fnv32 = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; };
// the forger's contracts: 32 harmless variations of each, with toy 8-bit fingerprints (the top byte of FNV-1a)
function variants(obj) {
  const out = [];
  for (let v = 0; v < 32; v++) {
    const verb = v & 1 ? 'I hereby sell' : 'I sell', o = obj[(v >> 1) & 1], sp = v & 4 ? '  ' : ' ', com = v & 8 ? ',' : '', toYou = v & 16;
    out.push(toYou ? `${verb} my${sp}${o}${com} to you for 100.` : `${verb} you my${sp}${o}${com} for 100.`);
  }
  return out;
}
const FAIR = variants(['bike', 'bicycle']), FRAUD = variants(['house', 'home']);
const byte = (str) => fnv32(str) >>> 24, hex = (b) => b.toString(16).toUpperCase().padStart(2, '0');
const FORGE = (() => {
  let best = null;
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) if (byte(FAIR[i]) === byte(FRAUD[j]) && (!best || i + j < best[0] + best[1])) best = [i, j];
  const [mi, mj] = best, b = byte(FAIR[mi]);
  const pick = (list, m, avoid) => {
    const rows = [], used = new Set([b, ...avoid]);
    for (let i = 0; i < 32 && rows.length < 5; i++) if (i !== m && !used.has(byte(list[i]))) { rows.push(i); used.add(byte(list[i])); }
    rows.splice(4, 0, m); return rows;
  };
  const fair = pick(FAIR, mi, []), fraud = pick(FRAUD, mj, fair.map((i) => byte(FAIR[i])));
  return { fair, fraud, row: 4, b };
})();
const TWO128 = (2n ** 128n).toLocaleString('en-US');
function fileCard(x, y, w, h, col, a = 1) {
  A(a, () => {
    ctx.fillStyle = 'rgba(90,60,30,0.12)'; rrect(x + 6, y + 8, w, h, 14); ctx.fill();
    ctx.fillStyle = C.sheet; ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x, y, x + 14, y); ctx.lineTo(x + w - 46, y); ctx.lineTo(x + w, y + 46); ctx.lineTo(x + w, y + h - 14); ctx.quadraticCurveTo(x + w, y + h, x + w - 14, y + h); ctx.lineTo(x + 14, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(47,35,66,0.12)'; ctx.beginPath(); ctx.moveTo(x + w - 46, y); ctx.lineTo(x + w - 46, y + 46); ctx.lineTo(x + w, y + 46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col; rrect(x + 26, y + 36, w * 0.42, 14, 7); ctx.fill();
    ctx.fillStyle = 'rgba(47,35,66,0.16)';
    for (let i = 0; i < 6; i++) { rrect(x + 26, y + 80 + i * 30, (w - 52) * (i % 3 === 2 ? 0.6 : 1), 10, 5); ctx.fill(); }
  });
}
function fingerprint(x, y, cols, rows, bits, pitch, t, t0, dur, { col = C.ink, outline = null } = {}) {
  const n = cols * rows;
  for (let i = 0; i < n; i++) {
    const cx0 = x + (i % cols) * pitch, cy0 = y + Math.floor(i / cols) * pitch, f = seg(t, t0 + (i / n) * dur, t0 + (i / n) * dur + 0.15);
    ctx.fillStyle = f > 0 && bits[i % bits.length] ? col : C.cellEmpty;
    ctx.globalAlpha *= 1; rrect(cx0, cy0, pitch - 4, pitch - 4, 4); ctx.fill();
  }
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = 5; rrect(x - 12, y - 12, cols * pitch + 20, rows * pitch + 20, 14); ctx.stroke(); }
}
function partAttack(t) {
  // the diagram: file -> hash function -> fingerprint
  A(span(t, at(8) + 2.6, s('h5', 0.3), 0.6, 0.5), () => {
    fileCard(150, 360, 260, 290, C.teal, eout(seg(t, s('h1', 0.2), s('h1', 0.7))));
    A(seg(t, s('h1', 0.2), s('h1', 0.7)), () => { font(500, 40); text('a file', 280, 700, { color: C.inkSoft, align: 'center' }); });
    A(seg(t, s('h2', 0.0), s('h2', 0.5)), () => {
      arrow(440, 505, 640, 505, C.inkSoft, 5, 20);
      ctx.fillStyle = C.ink; rrect(660, 400, 360, 210, 30); ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = GCOL(i); ctx.beginPath(); ctx.arc(720 + i * 60, 430, 8, 0, TAU); ctx.fill(); }
      font(600, 50, DISPLAY); text('hash', 840, 490, { color: C.sheet, align: 'center' }); text('function', 840, 552, { color: C.sheet, align: 'center' });
      arrow(1040, 505, 1200, 505, C.inkSoft, 5, 20);
    });
    const fpOut = t > s('h4', 0.2) ? C.coral : null;
    A(seg(t, mid('h2', 0.45), mid('h2', 0.55)), () => {
      fingerprint(1236, 437, 16, 4, BITS64, 34, t, mid('h2', 0.5), 1.2, { outline: fpOut ? `rgba(238,90,76,${seg(t, s('h4', 0.2), s('h4', 0.6))})` : null });
      A(1 - seg(t, s('h3', 0.0), s('h3', 0.4)), () => { font(500, 40); text('fingerprint: 64 bits', 1506, 640, { color: C.inkSoft, align: 'center' }); });
    });
    A(span(t, s('h3', 0.2), s('h4', 0.3), 0.4, 0.4), () => {
      supText([['2', false], ['64', true], [' possible fingerprints', false]], 1506, 640, 40, C.ink, { align: 'center' });
      font(500, 40); text('≈ 18,446,744,073,709,551,616', 1506, 700, { color: C.coralDeep, align: 'center' });
    });
    // a second file, the same fingerprint
    A(span(t, s('h4', 0.1), s('h5', 0.3), 0.4, 0.4), () => {
      fileCard(150, 690, 260, 220, C.berry, eout(seg(t, s('h4', 0.1), s('h4', 0.5))));
      ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(440, 800); ctx.quadraticCurveTo(600, 790, 650, 600); ctx.stroke();
      pill('collision: two files, one fingerprint', 1506, 700, { bg: C.coral, fg: C.sheet, size: 34, h: 56 });
      font(500, 32); text('diagram', 1506, 770, { color: C.inkFaint, align: 'center' });
    });
  });
  // a year with 2^64 days
  A(span(t, s('h5', 0.2), s('h6', 0.3), 0.5, 0.5), () => {
    const p = eout(seg(t, s('h5', 0.2), s('h5', 0.8)));
    ctx.save(); ctx.translate(960, 470); ctx.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p);
    ctx.fillStyle = 'rgba(90,60,30,0.12)'; rrect(-250 + 8, -200 + 10, 500, 400, 18); ctx.fill();
    ctx.fillStyle = C.sheet; rrect(-250, -200, 500, 400, 18); ctx.fill();
    ctx.save(); rrect(-250, -200, 500, 400, 18); ctx.clip(); ctx.fillStyle = C.coral; ctx.fillRect(-250, -200, 500, 70); ctx.restore();
    supText([['2', false], ['64', true], [' DAYS', false]], 0, -162, 44, C.sheet, { weight: 600, family: DISPLAY, align: 'center' });
    const r = mulberry32(64);
    for (let i = 0; i < 14; i++) for (let j = 0; j < 22; j++) { ctx.fillStyle = r() < 0.04 ? GCOL(i + j) : C.cellEmpty; ctx.fillRect(-228 + j * 21, -110 + i * 21, 16, 16); }
    ctx.restore();
    A(seg(t, s('h5', 0.8), s('h5', 1.3)), () => { font(500, 48); text('fingerprints are like birthdays', 960, 760, { color: C.ink, align: 'center' }); });
  });
  // the square root
  A(span(t, s('h6', 0.0), s('h9', 0.2), 0.5, 0.5), () => {
    supText([['√(2', false], ['64', true], [') = 2', false], ['32', true]], 960, 300, 80, C.ink, { align: 'center' });
    A(seg(t, mid('h6', 0.7), mid('h6', 0.9)), () => { font(500, 40); text('the square root of the number of fingerprints', 960, 390, { color: C.inkSoft, align: 'center' }); });
    A(seg(t, s('h7', 0.2), s('h7', 0.7)), () => {
      font(500, 44); text('any collision', 700, 540, { color: C.inkSoft, align: 'right' });
      font(600, 60); text('≈ 5,100,000,000', 740, 540, { color: C.coralDeep });
    });
    A(seg(t, mid('h8', 0.4), mid('h8', 0.6)), () => {
      font(500, 44); text('one particular', 700, 680, { color: C.inkSoft, align: 'right' }); text('fingerprint', 700, 732, { color: C.inkSoft, align: 'right' });
      font(600, 60); text('≈ 9,223,372,036,854,775,808', 740, 704, { color: C.skyDeep });
    });
    A(seg(t, s('h7', 0.4), s('h7', 0.9)), () => { font(500, 34); text('tries for an even chance, with 64-bit fingerprints', 960, 860, { color: C.inkFaint, align: 'center' }); });
  });
  // the forger
  A(span(t, s('h9', 0.0), s('h13', 0.3), 0.5, 0.5), () => {
    const cols = [[FAIR, FORGE.fair, 110, 'fair contract', C.teal, C.tealDeep], [FRAUD, FORGE.fraud, 1030, 'fraudulent contract', C.coral, C.coralDeep]];
    const glow = seg(t, s('h11', 0.4), s('h11', 1.0));
    cols.forEach(([list, rows, x0, head, col, deep], c) => {
      A(seg(t, mid('h9', 0.55 + c * 0.15), mid('h9', 0.65 + c * 0.15)), () => { font(600, 48, DISPLAY); text(head, x0 + 10, 250, { color: deep }); });
      rows.forEach((vi, r) => {
        const t0 = r === 0 ? mid('h9', 0.6 + c * 0.15) : lerp(s('h10', 0.3), e('h10', -0.2), (r - 1 + c * 0.5) / 5);
        const a = eout(seg(t, t0, t0 + 0.4));
        if (a <= 0) return;
        const y = 340 + r * 92, match = r === FORGE.row;
        A(a * (glow > 0 && !match ? lerp(1, 0.45, glow) : 1), () => {
          ctx.fillStyle = C.sheet; rrect(x0, y - 36, 780, 72, 16); ctx.fill();
          ctx.strokeStyle = match && glow > 0 ? C.marigold : C.line; ctx.lineWidth = match && glow > 0 ? 5 : 2; ctx.stroke();
          font(500, 32); text(list[vi], x0 + 20, y, { color: C.ink });
          const flip = seg(t, t0 + 0.2, t0 + 0.7), b = byte(list[vi]);
          ctx.fillStyle = col; rrect(x0 + 780 - 100, y - 24, 86, 48, 12); ctx.fill();
          font(600, 32); text(flip < 1 ? hex(Math.floor((b + flip * 97 * (r + 3)) % 256)) : hex(b), x0 + 780 - 57, y + 1, { color: C.sheet, align: 'center' });
        });
      });
    });
    // the matching pair
    A(glow, () => {
      const y = 340 + FORGE.row * 92;
      ctx.strokeStyle = C.marigold; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(890, y); ctx.lineTo(1030, y); ctx.stroke();
      pill('same', 960, y - 60, { bg: C.marigold, fg: C.ink, size: 32, h: 46 });
    });
    // the signature moves across
    const sig = (x, y, p) => { ctx.strokeStyle = C.skyDeep; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); const n = Math.floor(40 * p); for (let i = 0; i <= n; i++) { const u = i / 40, px = x + u * 150, py = y + Math.sin(u * 19) * 12 * (1 - u * 0.4) - u * 6; i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); };
    const y = 340 + FORGE.row * 92 + 74;
    A(seg(t, s('h12', 0.2), s('h12', 0.5)), () => { sig(500, y, seg(t, s('h12', 0.2), s('h12', 1.2))); font(500, 32); text('signed', 680, y + 4, { color: C.skyDeep }); });
    const mv = eio(seg(t, mid('h12', 0.55), mid('h12', 0.85)));
    if (mv > 0) A(mv, () => { sig(lerp(500, 1420, mv), y, 1); font(500, 32); text('still fits', lerp(680, 1600, mv), y + 4, { color: C.skyDeep }); });
    A(seg(t, s('h10', 0.3), s('h10', 0.8)), () => { font(500, 32); text('toy fingerprints: 8 bits, 256 possible values', 960, 930, { color: C.inkFaint, align: 'center' }); });
  });
  // the defence: more bits
  A(span(t, s('h13', 0.1), at(9) + 1.0, 0.5, 0.6), () => {
    const rows = 4 + Math.floor(12 * eio(seg(t, s('h13', 0.4), mid('h13', 0.9)) + 0.0001));
    const r = mulberry32(256), bits = Array.from({ length: 256 }, () => (r() < 0.5 ? 1 : 0));
    for (let i = 0; i < rows * 16; i++) { ctx.fillStyle = bits[i] ? C.ink : C.cellEmpty; rrect(180 + (i % 16) * 24, 230 + Math.floor(i / 16) * 24, 20, 20, 3); ctx.fill(); }
    font(500, 36); text(rows === 16 ? '256 bits' : `${rows * 16} bits`, 180 + 8 * 24, 650, { color: C.inkSoft, align: 'center' });
    font(600, 64, DISPLAY); text('SHA-256', 760, 320, { color: C.ink });
    font(500, 44); text('256-bit fingerprints', 760, 395, { color: C.inkSoft });
    A(seg(t, s('h14', 0.6), s('h14', 1.1)), () => {
      font(500, 44); text('a collision takes about', 760, 500, { color: C.ink });
      supText([['2', false], ['128', true], [' tries', false]], 760, 580, 72, C.coralDeep, { weight: 600 });
    });
    const typed = Math.floor(TWO128.length * seg(t, mid('h14', 0.55), e('h14', 0.2)));
    A(seg(t, mid('h14', 0.55), mid('h14', 0.6)), () => {
      font(600, 46); text(TWO128.slice(0, typed), 960 - tw(TWO128) / 2, 790, { color: C.coralDeep });
      A(seg(t, e('h14', -0.3), e('h14', 0.3)), () => { font(500, 36); text('a 39-digit number', 960, 860, { color: C.inkSoft, align: 'center' }); });
    });
  });
}

// ---------- 9: the answer ----------
function partAnswer(t) {
  A(calendarVis(t), () => demoMarks(t, (i) => s('z1', 0.3 + i * 0.07), s('z1', 0.3 + DEMO.first * 0.07)));
  const rows = [[s('z2', 0.2), '23 guests', 80, C.ink, 330], [s('z3', 0.4), '253 pairs', 80, C.coralDeep, 470]];
  for (const [t0, str, sz, col, y] of rows) A(seg(t, t0, t0 + 0.5), () => { font(600, sz, DISPLAY); text(str, 1412, y + (1 - eout(seg(t, t0, t0 + 0.5))) * 16, { color: col, align: 'center' }); });
  A(seg(t, mid('z4', 0.55), mid('z4', 0.75)), () => {
    const p = back(seg(t, mid('z4', 0.55), mid('z4', 0.85)));
    ctx.save(); ctx.translate(1412, 660); ctx.scale(p, p); font(600, 170, DISPLAY); text('50.7%', 0, 0, { color: C.coral, align: 'center' }); ctx.restore();
    font(500, 40); text('chance of a shared birthday', 1412, 780, { color: C.inkSoft, align: 'center' });
  });
  A(span(t, s('z5', 0.3), e('z6', 1.4), 0.5, 0.5), () => pill('When’s your birthday?', 1412, 880, { fg: C.ink, border: C.marigold, size: 36, h: 60, weight: 500 }));
  const [mx, my] = cellC(DEMO.days[DEMO.first]);
  burst(mx, my, t, s('z6', 0.3), { n: 30, spread: 160, seed: 31, dur: 1.8 });
  rain(t, span(t, s('z6', 0.2), DURATION + 1, 0.8, 1), { seed: 9 });
  A(seg(t, e('z6', 1.4), e('z6', 2.2)), () => credits(t));
}

Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1,
  fonts: [DISPLAY, TEXT],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bg) paintBackground();
    ctx.drawImage(bg, 0, 0);
    bunting(t);
    header(t);
    sheet(calendarVis(t));
    const parts = [partOpen, partRoom, partPairs, partMisses, partRooms, partYou, partRule, partReal, partAttack, partAnswer];
    const bounds = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      const a = i === 0 ? 0 : bounds[i] + 3.0, b = i + 1 < bounds.length - 1 ? bounds[i + 1] + 1.0 : DURATION + 1;
      if (t < a - 0.6 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : span(t, a - 0.6, b, 0.6, 1.0), () => fn(t));
    });
    titleCard(t);
  },
});
