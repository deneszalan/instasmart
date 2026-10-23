// "Mendel's peas: the friar who counted heredity", a long-form explainer (16:9, about 11 minutes).
// Look: a monastery garden notebook. An open notebook lies on a dark moss-green desk: the left page is pale
// green-cream paper for drawings (plants, pods, flowers, crosses), the right page is a cream ledger hand-ruled in
// faded blue-green with a red-brown margin, where counts and ratios are written in. Iron-gall ink for line work;
// dominant forms in garden green, recessive forms in terracotta, gold for ratios. Pea pods, flowers and seeds are
// simple shapes; the Punnett squares are ink diagrams. EB Garamond for titles and labels, Caveat for the handwriting.
// Widescreen: the plants or the cross on the left page, the ledger, the ratios or the square on the right.
// Every animation is keyed to a narration line in window.TL, so the dialogue version (same keys) shares this file.
// All numbers on screen are computed below: Mendel's counts and ratios (from his 1866 paper), the expected
// 9:3:3:1 numbers, the seeded simulations (the same code and seeds as sim.mjs), the chi-squared misfits.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const SERIF = 'EB Garamond', HAND = 'Caveat';

const C = {
  desk0: '#1C2416', desk1: '#2B3621', paperL: '#E9EDD3', paperR: '#F4EDD8', edge: '#D9D0B4',
  ink: '#2D281C', soft: 'rgba(45,40,28,0.74)', faint: 'rgba(45,40,28,0.46)', ghost: 'rgba(45,40,28,0.16)',
  rule: 'rgba(84,132,140,0.30)', margin: 'rgba(170,80,56,0.42)',
  green: '#3D6A2C', greenSoft: 'rgba(61,106,44,0.55)', greenWash: 'rgba(122,160,82,0.22)',
  leaf: '#6E9A45', leafLight: '#A8C478', leafDeep: '#2F5222', podIn: '#DCE6AE',
  pea: '#D9CC5A', peaHi: '#F4EDA8', peaEdge: '#7F7A2A', peaG: '#8CB054', peaGHi: '#C9DE93', peaGEdge: '#4E7429',
  coat: '#8E7A5C', coatHi: '#BCA885',
  terra: '#A8472A', terraSoft: 'rgba(168,71,42,0.55)', terraWash: 'rgba(168,71,42,0.13)',
  gold: '#A97D24', goldWash: 'rgba(196,150,52,0.18)',
  violet: '#7A4C93', violetLight: '#A880BE', white: '#FBF8EE',
  card: '#F7F1DE', cardG: '#E2EACB',
};

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const ap = (t, t0, d = 0.5) => eout(seg(t, t0, t0 + d));
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}
const hsh = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

// ---------- text ----------
function font(size, { fam = SERIF, weight = 500, italic = false } = {}) { ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${fam}`; }
function txt(str, x, y, { size = 40, fam = SERIF, weight = 500, italic = false, color = C.ink, align = 'left', base = 'middle', spacing = '0px' } = {}) {
  font(size, { fam, weight, italic });
  k.text(str, x, y, { color, align, base, spacing });
}
function tw(str, size, o = {}) { font(size, o); return ctx.measureText(str).width; }
const hand = (str, x, y, o = {}) => txt(str, x, y, { fam: HAND, weight: 500, size: 44, ...o });
/** Handwriting that writes itself on from left to right, starting at t0. */
function writeOn(t, t0, str, x, y, o = {}) {
  const size = o.size ?? 44, fam = o.fam ?? HAND, dur = o.dur ?? Math.max(0.35, str.length * 0.032);
  const p = seg(t, t0, t0 + dur);
  if (p <= 0) return;
  const w = tw(str, size, { fam, weight: o.weight ?? 500, italic: o.italic });
  const align = o.align ?? 'left', x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 12, y - size * 1.3, (w + 24) * eio(p), size * 2.6); ctx.clip();
  txt(str, x, y, { fam, weight: 500, ...o, size });
  ctx.restore();
}
/** A stacked fraction drawn by hand: top over bottom. */
function frac(top, bot, x, y, { size = 44, color = C.ink, colTop = color, colBot = color, fam = HAND, a = 1 } = {}) {
  A(a, () => {
    const w = Math.max(tw(String(top), size, { fam }), tw(String(bot), size, { fam })) + 14;
    txt(String(top), x, y - size * 0.55, { size, fam, color: colTop, align: 'center' });
    txt(String(bot), x, y + size * 0.6, { size, fam, color: colBot, align: 'center' });
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, size / 16); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - w / 2, y + 2); ctx.lineTo(x + w / 2, y + 2); ctx.stroke();
  });
}
/** A power written by hand: base with a raised exponent. */
function power(b, p, x, y, { size = 44, color = C.ink, fam = HAND, align = 'left' } = {}) {
  const wb = tw(b, size, { fam }), wp = tw(p, size * 0.6, { fam }), w = wb + wp + 2;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  txt(b, x0, y, { size, fam, color }); txt(p, x0 + wb + 2, y - size * 0.38, { size: size * 0.6, fam, color });
  return w;
}

// ---------- ink ----------
/** A hand-drawn line from (x0,y0) to (x1,y1), drawn up to fraction p, with a slight wobble. */
function inkLine(x0, y0, x1, y1, p = 1, { w = 3, col = C.ink, seed = 1, wob = 1.2, dash = null } = {}) {
  if (p <= 0) return;
  const n = 26, L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  const m = Math.max(1, Math.ceil(n * clamp(p)));
  for (let i = 0; i <= m; i++) {
    const u = Math.min(i / n, p), o = wob * (Math.sin(u * 9.1 + seed * 1.7) * 0.7 + Math.sin(u * 23.3 + seed * 3.1) * 0.3) * Math.sin(Math.PI * u);
    const x = lerp(x0, x1, u) + nx * o, y = lerp(y0, y1, u) + ny * o;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
function inkRect(x, y, w, h, p = 1, o = {}) {
  const q = (i) => clamp(p * 4 - i);
  inkLine(x, y, x + w, y, q(0), { ...o, seed: 1 }); inkLine(x + w, y, x + w, y + h, q(1), { ...o, seed: 2 });
  inkLine(x + w, y + h, x, y + h, q(2), { ...o, seed: 3 }); inkLine(x, y + h, x, y, q(3), { ...o, seed: 4 });
}
function arrow(x0, y0, x1, y1, p = 1, { col = C.soft, w = 3, head = 14, seed = 1, dash = null } = {}) {
  if (p <= 0) return;
  const x = lerp(x0, x1, eout(p)), y = lerp(y0, y1, eout(p));
  inkLine(x0, y0, x, y, 1, { w, col, seed, dash });
  if (p > 0.6) A(seg(p, 0.6, 1), () => {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - head * Math.cos(a - 0.45), y - head * Math.sin(a - 0.45)); ctx.lineTo(x, y);
    ctx.lineTo(x - head * Math.cos(a + 0.45), y - head * Math.sin(a + 0.45)); ctx.stroke();
  });
}
/** A curved arrow along an arc (cx, cy, r) from angle a0 to a1. */
function arcArrow(cx, cy, r, a0, a1, p = 1, { col = C.soft, w = 3, head = 13 } = {}) {
  if (p <= 0) return;
  const a = lerp(a0, a1, eout(p));
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.min(a0, a), Math.max(a0, a)); ctx.stroke();
  if (p > 0.7) {
    const dir = Math.sign(a1 - a0), x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), tg = a + dir * Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(x - head * Math.cos(tg - 0.5), y - head * Math.sin(tg - 0.5)); ctx.lineTo(x, y);
    ctx.lineTo(x - head * Math.cos(tg + 0.5), y - head * Math.sin(tg + 0.5)); ctx.stroke();
  }
}
/** A loose hand-drawn ring around (x, y). */
function ring(x, y, rx, ry, p = 1, { col = C.terra, w = 3, seed = 3 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  const n = 60, end = Math.ceil(n * 1.08 * eout(p));
  for (let i = 0; i <= end; i++) {
    const th = -2.2 + (i / n) * Math.PI * 2, wob = 1 + 0.035 * Math.sin(th * 3 + seed);
    const px = x + Math.cos(th) * rx * wob * (1 + 0.04 * i / n), py = y + Math.sin(th) * ry * wob;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}
/** Hand-drawn underline. */
const under = (x0, x1, y, p, o = {}) => inkLine(x0, y, x1, y + 1.5, p, { w: 3, wob: 1.6, ...o });
/** A tick mark. */
function tick(x, y, sz, p, col = C.green, w = 5) {
  if (p <= 0) return;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const a = [x - sz * 0.45, y], b = [x - sz * 0.1, y + sz * 0.35], c = [x + sz * 0.5, y - sz * 0.4];
  ctx.beginPath(); ctx.moveTo(...a);
  const q = eout(p);
  if (q < 0.4) ctx.lineTo(lerp(a[0], b[0], q / 0.4), lerp(a[1], b[1], q / 0.4));
  else { ctx.lineTo(...b); ctx.lineTo(lerp(b[0], c[0], (q - 0.4) / 0.6), lerp(b[1], c[1], (q - 0.4) / 0.6)); }
  ctx.stroke();
}
/** A watercolour wash: a soft blotch. */
function wash(x, y, rx, ry, color, a = 1, seed = 1) {
  if (a <= 0) return;
  const r = mulberry32(seed);
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const n = 28, ph = r() * 6.28;
    for (let j = 0; j <= n; j++) {
      const th = (j / n) * Math.PI * 2, wob = 1 + 0.07 * Math.sin(th * 3 + ph) + 0.04 * Math.sin(th * 7 + ph * 2);
      const px = x + Math.cos(th) * rx * wob * (1 - i * 0.12), py = y + Math.sin(th) * ry * wob * (1 - i * 0.12);
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.fillStyle = color; ctx.globalAlpha *= 0.6; ctx.fill();
  }
  ctx.restore();
}
/** A pasted paper slip, centred at (x, y). */
function slip(x, y, w, h, { rot = 0, fill = C.card, a = 1, edge = 'rgba(45,40,28,0.28)' } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(40,30,10,0.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = fill; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
    // two strips of tape
    ctx.fillStyle = 'rgba(232,222,186,0.75)';
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * (w / 2 - 34), -h / 2); ctx.rotate(sx * 0.35); ctx.fillRect(-34, -12, 68, 24); ctx.restore(); }
    ctx.restore();
  });
}
