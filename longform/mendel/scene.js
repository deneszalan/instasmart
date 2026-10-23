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

// ---------- peas, pods, flowers, plants ----------
const PEA = {
  Y: [C.peaHi, C.pea, '#A89E38', C.peaEdge], G: [C.peaGHi, C.peaG, '#5F8634', C.peaGEdge],
  C: [C.coatHi, C.coat, '#6A5A40', '#4E412C'], W: ['#FFFFFA', '#EFEBDD', '#CFC9B4', '#9B9480'],
};
/** A pea seed. shape 'R' round or 'W' wrinkled; col 'Y' yellow, 'G' green, 'C' grey-brown coat, 'W' white coat. */
function pea(x, y, r, { shape = 'R', col = 'Y', a = 1, seed = 1, swell = 0 } = {}) {
  if (a <= 0 || r <= 0) return;
  const [hi, mid_, lo, edge] = PEA[col] ?? PEA.Y;
  A(a, () => {
    ctx.save(); ctx.translate(x, y);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
    g.addColorStop(0, hi); g.addColorStop(0.55, mid_); g.addColorStop(1, lo);
    ctx.beginPath();
    if (shape === 'R') ctx.arc(0, 0, r, 0, Math.PI * 2);
    else {
      const rnd = mulberry32(seed * 7 + 1), ph = rnd() * 6.28, ph2 = rnd() * 6.28, amp = 1 - swell;
      for (let j = 0; j <= 48; j++) {
        const th = (j / 48) * Math.PI * 2, rr = r * (0.9 + amp * (0.07 * Math.sin(th * 5 + ph) + 0.05 * Math.sin(th * 9 + ph2)));
        j ? ctx.lineTo(Math.cos(th) * rr, Math.sin(th) * rr) : ctx.moveTo(Math.cos(th) * rr, Math.sin(th) * rr);
      }
      ctx.closePath();
    }
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1.2, r * 0.08); ctx.stroke();
    if (shape === 'R') {
      ctx.fillStyle = 'rgba(255,255,240,0.6)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.38, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2); ctx.fill();
    } else {
      const rnd = mulberry32(seed * 13 + 5), ph = rnd() * 6.28;
      ctx.strokeStyle = edge; ctx.globalAlpha *= 0.7 * (1 - swell); ctx.lineWidth = Math.max(1, r * 0.07);
      for (let c = 0; c < 4; c++) {
        const a0 = ph + c * 1.6, rr = r * (0.25 + 0.15 * c);
        ctx.beginPath(); ctx.arc(Math.cos(a0) * r * 0.15, Math.sin(a0) * r * 0.15, rr, a0, a0 + 1.3); ctx.stroke();
      }
    }
    ctx.restore();
  });
}
/** Two-letter pea codes: 'RY' round yellow, 'WG' wrinkled green, … ; one letter means yellow. */
const peaOf = (code) => ({ shape: code[0] === 'W' ? 'W' : 'R', col: code[1] ?? 'Y' });
/** An open pea pod lying at angle ang. open: 0 closed .. 1 open; podCol 'G' or 'Y'; form 'I' inflated or 'C' constricted. */
function pod(cx, cy, len, peas, { ang = 0, open = 1, a = 1, seed = 1, podCol = 'G', form = 'I' } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    const L = len / 2, h = len * 0.17, n = Math.max(1, peas.length);
    const lens = (hh, inset = 0) => {
      ctx.beginPath(); ctx.moveTo(-L + inset, 0);
      if (form === 'C') {
        const m = n * 2;
        for (let i = 0; i <= m; i++) { const u = i / m, x = lerp(-L + inset, L - inset, u), env = Math.sin(Math.PI * u) ** 0.6, pinch = i % 2 ? 0.62 : 1; ctx.lineTo(x, -hh * env * pinch); }
        for (let i = m; i >= 0; i--) { const u = i / m, x = lerp(-L + inset, L - inset, u), env = Math.sin(Math.PI * u) ** 0.6, pinch = i % 2 ? 0.62 : 1; ctx.lineTo(x, hh * env * pinch * 0.9); }
      } else {
        ctx.bezierCurveTo(-L * 0.4, -hh, L * 0.5, -hh, L - inset, -hh * 0.1);
        ctx.bezierCurveTo(L * 0.5, hh, -L * 0.4, hh, -L + inset, 0);
      }
      ctx.closePath();
    };
    wash(6, h * 0.9, L * 1.02, h * 0.55, 'rgba(70,90,40,0.22)', 1, seed + 3);
    const sh = ctx.createLinearGradient(0, -h, 0, h);
    if (podCol === 'Y') { sh.addColorStop(0, '#F1E49A'); sh.addColorStop(0.5, '#D8C35A'); sh.addColorStop(1, '#A8933A'); }
    else { sh.addColorStop(0, C.leafLight); sh.addColorStop(0.5, C.leaf); sh.addColorStop(1, C.green); }
    const edge = podCol === 'Y' ? '#7D6C22' : C.leafDeep;
    ctx.fillStyle = sh; lens(h); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
    if (peas.length) {
      ctx.fillStyle = podCol === 'Y' ? '#F4ECC0' : C.podIn; lens(h * 0.62, L * 0.08); ctx.fill();
      ctx.strokeStyle = 'rgba(38,70,26,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();
      const pr = Math.min(h * 0.5, (len * 0.78) / n / 2.1);
      peas.forEach((code, i) => {
        const x = lerp(-L * 0.62, L * 0.58, n === 1 ? 0.5 : i / (n - 1));
        pea(x, 0, pr, { ...peaOf(code), seed: seed * 10 + i });
      });
    }
    if (open < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - eio(open); ctx.translate(0, -h * 0.9 * eio(open));
      ctx.fillStyle = sh; lens(h * 0.95); ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = C.green;
    for (const sg of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(-L - 4, sg * 6, 12, 4, sg * 0.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = C.leafDeep; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-L - 10, 0); ctx.quadraticCurveTo(-L - 26, -8, -L - 34, -22); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L - 2, -h * 0.1); ctx.quadraticCurveTo(L + 10, -h * 0.2, L + 12, -h * 0.6); ctx.stroke();
    ctx.restore();
  });
}
/** A pea flower seen from the side, facing right; col 'V' violet or 'W' white. */
function flower(x, y, sc, { col = 'V', a = 1, rot = 0 } = {}) {
  if (a <= 0) return;
  const std = col === 'V' ? C.violetLight : C.white, wing = col === 'V' ? C.violet : '#ECE7D6', line = col === 'V' ? '#4E2C63' : '#8F8970';
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.lineWidth = 1.6 / sc; ctx.strokeStyle = line;
    // stalk and calyx
    ctx.strokeStyle = C.leafDeep; ctx.lineWidth = 2.4 / sc; ctx.beginPath(); ctx.moveTo(-1.1, 0.5); ctx.quadraticCurveTo(-0.8, 0.1, -0.55, 0.05); ctx.stroke();
    ctx.fillStyle = C.leaf; ctx.beginPath(); ctx.moveTo(-0.62, -0.12); ctx.lineTo(-0.2, -0.18); ctx.lineTo(-0.15, 0.2); ctx.lineTo(-0.62, 0.16); ctx.closePath(); ctx.fill();
    // standard petal
    ctx.strokeStyle = line; ctx.lineWidth = 1.6 / sc;
    ctx.fillStyle = std; ctx.beginPath(); ctx.moveTo(-0.2, -0.05);
    ctx.bezierCurveTo(-0.3, -0.9, 0.55, -1.0, 0.55, -0.35); ctx.bezierCurveTo(0.55, -0.05, 0.2, 0.05, -0.2, 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
    // wings
    ctx.fillStyle = wing; ctx.beginPath(); ctx.moveTo(-0.15, 0.0); ctx.bezierCurveTo(0.2, -0.25, 0.75, -0.05, 0.62, 0.2); ctx.bezierCurveTo(0.45, 0.35, 0.05, 0.25, -0.15, 0.12); ctx.closePath(); ctx.fill(); ctx.stroke();
    // keel
    ctx.fillStyle = col === 'V' ? '#D9C3E4' : '#F7F4E8'; ctx.beginPath(); ctx.moveTo(-0.12, 0.12); ctx.bezierCurveTo(0.15, 0.42, 0.55, 0.38, 0.7, 0.22); ctx.bezierCurveTo(0.45, 0.25, 0.15, 0.2, -0.12, 0.12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}
/** A pea leaf: a pair of leaflets at (x, y). */
function leaflets(x, y, sz, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = C.leaf; ctx.strokeStyle = C.leafDeep; ctx.lineWidth = 1.2;
  for (const sd of [-1, 1]) {
    ctx.save(); ctx.rotate(sd * 0.75); ctx.beginPath(); ctx.ellipse(sz * 0.55, 0, sz * 0.55, sz * 0.26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sz * 0.05, 0); ctx.lineTo(sz * 1.0, 0); ctx.strokeStyle = 'rgba(40,70,26,0.5)'; ctx.stroke(); ctx.strokeStyle = C.leafDeep; ctx.restore();
  }
  ctx.restore();
}
function tendril(x, y, sz, dir = 1) {
  ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let j = 0; j < 30; j++) { const th = j * 0.42, rr = sz * (1 - j / 34); const px = x + dir * (sz * 0.6 + Math.cos(th) * rr * 0.5), py = y - sz * 0.4 + Math.sin(th) * rr * 0.5 - j * 0.4; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
}
/** A whole pea plant climbing from (x, base) to height h, grown to p (0..1). */
function plant(x, base, h, p, { flowers = 'axial', fcol = 'V', pods = true, podCol = 'G', form = 'I', a = 1, seed = 2 } = {}) {
  if (p <= 0 || a <= 0) return;
  A(a, () => {
    const g = eout(p), top = base - h * g, n = 7;
    ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, base);
    for (let i = 1; i <= 20; i++) { const u = i / 20, yy = lerp(base, top, u); ctx.lineTo(x + Math.sin(u * 9 + seed) * 8, yy); }
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const u = (i + 0.7) / (n + 0.5), yy = base - h * u;
      if (yy < top + 10) continue;
      const sd = i % 2 ? 1 : -1, xx = x + Math.sin(u * 9 + seed) * 8;
      leaflets(xx, yy, 34 + 10 * (1 - u), sd > 0 ? -0.3 : Math.PI + 0.3);
      if (i % 2 === 0) tendril(xx + sd * 30, yy - 18, 16, sd);
      if (flowers === 'axial' && i % 2 === 1 && i < n - 1) flower(xx + sd * 44, yy - 24, 26, { col: fcol, rot: sd > 0 ? 0 : 0 });
      if (pods && i % 3 === 0 && i > 0) pod(xx - sd * 70, yy + 30, 110, [], { ang: sd * 1.1, seed: seed + i, podCol, form });
    }
    if (flowers === 'terminal' && g > 0.9) for (let j = -1; j <= 1; j++) flower(x + j * 26, top - 10 + Math.abs(j) * 10, 24, { col: fcol });
  });
}
/** A small sprig growing from (x, y), scale sc, grown to p. */
function sprig(x, y, sc, p) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = C.green; ctx.lineCap = 'round'; ctx.lineWidth = 0.07;
  const h = eout(p);
  ctx.beginPath(); ctx.moveTo(0, 0.5); ctx.quadraticCurveTo(0.1, 0, 0, -0.5 * h); ctx.stroke();
  ctx.fillStyle = C.leaf;
  if (p > 0.3) for (const [lx, ly, rt] of [[-0.18, 0.05, -0.6], [0.2, -0.15, 0.6]]) {
    const q = eout(seg(p, 0.3, 1));
    ctx.save(); ctx.translate(lx * q, ly); ctx.rotate(rt); ctx.beginPath(); ctx.ellipse(0, 0, 0.2 * q, 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  if (p > 0.6) { ctx.lineWidth = 0.04; ctx.beginPath(); ctx.arc(0.08, -0.5, 0.08, 3.2, 3.2 + 4 * seg(p, 0.6, 1)); ctx.stroke(); }
  ctx.restore();
}
/** An allele token: R (green) or r (terracotta); dim draws it hidden (pale, dashed). blank: an empty slot. */
function token(ch, x, y, { a = 1, s = 1, r = 28, dim = 0 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (!ch) {
      ctx.setLineDash([5, 5]); ctx.strokeStyle = C.faint; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore(); return;
    }
    const big = ch === 'R';
    ctx.globalAlpha *= 1 - 0.65 * dim;
    ctx.fillStyle = big ? C.green : C.terra; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(45,40,28,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    txt(ch, 0, 2, { size: Math.round(r * 1.25), weight: 700, color: '#FBF6E6', align: 'center' });
    ctx.restore();
    if (dim > 0) A(dim, () => { ctx.setLineDash([5, 5]); ctx.strokeStyle = C.terra; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r * s + 7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); });
  });
}
/** A pollen grain (small, golden, speckled) or an egg cell (larger, pale), carrying one allele. */
function pollen(x, y, ch, a = 1, r = 26) {
  A(a, () => {
    ctx.fillStyle = '#E9C55A'; ctx.strokeStyle = '#9C7B22'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(156,123,34,0.5)';
    for (let i = 0; i < 9; i++) { const th = i * 2.4, rr = r * 0.75; ctx.beginPath(); ctx.arc(x + Math.cos(th) * rr, y + Math.sin(th) * rr, 1.8, 0, Math.PI * 2); ctx.fill(); }
    txt(ch, x, y + 1, { size: 34, weight: 700, color: ch === 'R' ? C.green : C.terra, align: 'center' });
  });
}
function egg(x, y, ch, a = 1, r = 34) {
  A(a, () => {
    ctx.fillStyle = '#F6E7D2'; ctx.strokeStyle = '#B9946C'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(185,148,108,0.45)'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.7, r * 0.58, 0, 0, Math.PI * 2); ctx.stroke();
    txt(ch, x, y + 1, { size: 36, weight: 700, color: ch === 'R' ? C.green : C.terra, align: 'center' });
  });
}
/** A seed packet, as from a seed dealer. */
function packet(x, y, w, h, { a = 1, band = C.green, peaCode = 'RY', seed = 1 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate((hsh(seed, 3) - 0.5) * 0.08);
    ctx.fillStyle = '#EFE4C6'; ctx.strokeStyle = 'rgba(45,40,28,0.5)'; ctx.lineWidth = 1.5;
    ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * 0.18); ctx.lineTo(0, -h / 2 + h * 0.3); ctx.lineTo(w / 2, -h / 2 + h * 0.18); ctx.stroke();
    ctx.fillStyle = band; ctx.fillRect(-w / 2 + 3, h / 2 - h * 0.22, w - 6, h * 0.14);
    pea(0, h * 0.06, Math.min(w, h) * 0.2, { ...peaOf(peaCode), seed });
    ctx.restore();
  });
}

// ---------- Mendel's numbers and the simulations (same code and seeds as sim.mjs) ----------
const EXPTS = [
  ['seed shape', 5474, 1850], ['seed colour', 6022, 2001], ['seed coat', 705, 224], ['pod shape', 882, 299],
  ['pod colour', 428, 152], ['flower position', 651, 207], ['stem length', 787, 277],
];
const DOM = EXPTS.reduce((p, x) => p + x[1], 0), REC = EXPTS.reduce((p, x) => p + x[2], 0); // 14,949 and 5,010
const r2 = (x) => x.toFixed(2);
const FIRST10 = [[45, 12], [27, 8], [24, 7], [19, 10], [32, 11], [26, 6], [88, 24], [22, 10], [28, 6], [25, 7]];
const TESTS = [['seed coat', 36, 64], ['pod shape', 29, 71], ['pod colour', 40, 60], ['pod colour, again', 35, 65], ['flower position', 33, 67], ['stem length', 28, 72]];
const T_PURE = TESTS.reduce((p, x) => p + x[1], 0), T_HYB = TESTS.reduce((p, x) => p + x[2], 0); // 201 and 399
const MISS10 = 0.75 ** 10, FISHER = (2 * (1 - MISS10)) / (1 + 2 * MISS10); // 0.0563 and 1.696
const DI = [['RY', 315, 9], ['WY', 101, 3], ['RG', 108, 3], ['WG', 32, 1]];
const DI_N = DI.reduce((p, x) => p + x[1], 0); // 556
const seedIsWrinkled = (rnd) => rnd() < 0.5 && rnd() < 0.5;
const TEN = (() => { const rnd = mulberry32(10); return FIRST10.map(([a, b]) => { let w = 0; for (let i = 0; i < a + b; i++) if (seedIsWrinkled(rnd)) w++; return [a + b - w, w]; }); })();
const TEN_LO = TEN.reduce((p, q, i) => (q[0] / q[1] < TEN[p][0] / TEN[p][1] ? i : p), 0);
const TEN_HI = TEN.reduce((p, q, i) => (q[0] / q[1] > TEN[p][0] / TEN[p][1] ? i : p), 0);
const HARV = (() => { const rnd = mulberry32(9), w = new Int32Array(7324); let k = 0; for (let i = 0; i < 7324; i++) { if (seedIsWrinkled(rnd)) k++; w[i] = k; } return w; })();
const hRatio = (n) => (HARV[n - 1] ? (n - HARV[n - 1]) / HARV[n - 1] : Infinity);
const chi2 = (d, r) => { const n = d + r, ex = n / 4; return (r - ex) ** 2 / ex + (d - 3 * ex) ** 2 / (3 * ex); };
const M_CHI = EXPTS.reduce((p, x) => p + chi2(x[1], x[2]), 0); // 2.14
const GARD = (() => {
  const rnd = mulberry32(11), out = [];
  for (let g = 0; g < 1000; g++) {
    let c = 0;
    for (const x of EXPTS) { const N = x[1] + x[2]; let r = 0; for (let i = 0; i < N; i++) if (rnd() < 0.25) r++; c += chi2(N - r, r); }
    out.push(c);
  }
  return out;
})();
const G_GOOD = GARD.filter((c) => c <= M_CHI).length; // 50
const ZS = EXPTS.map(([, d, r]) => { const n = d + r; return (r - n / 4) / Math.sqrt(n * 3 / 16); });

// ---------- the notebook ----------
const LX = 505, RX = 1415, GUT = 960;
const lineY = (k) => 166 + 58 * k;           // the ruled lines of the ledger page
const base = (k) => lineY(k) - 10;           // where handwriting sits on line k
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const r = mulberry32(5);
  // the desk: dark moss-green cloth
  const dk = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200);
  dk.addColorStop(0, C.desk1); dk.addColorStop(1, C.desk0);
  g.fillStyle = dk; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '160,190,120'},${r() * 0.06})`; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
  // the page block under the pages
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(36, 34, W - 72, H - 56);
  for (let i = 4; i >= 1; i--) { g.fillStyle = i % 2 ? '#CFC6A8' : '#DCD3B6'; g.fillRect(34 - i, 26 + i, W - 68 + 2 * i, H - 50); }
  // two pages
  const page = (x0, x1, col, colEdge) => {
    const pg = g.createLinearGradient(x0, 0, x1, 0);
    pg.addColorStop(0, x0 < GUT ? colEdge : col); pg.addColorStop(0.5, col); pg.addColorStop(1, x0 < GUT ? col : colEdge);
    g.fillStyle = pg; g.beginPath(); g.roundRect(x0, 24, x1 - x0, H - 50, x0 < GUT ? [10, 0, 0, 10] : [0, 10, 10, 0]); g.fill();
  };
  page(32, GUT, C.paperL, '#DFE3C6'); page(GUT, W - 32, C.paperR, '#E9E1C9');
  // paper texture: fibres, specks, foxing
  for (let i = 0; i < 700; i++) {
    const x = 40 + r() * (W - 80), y = 30 + r() * (H - 64), a = r() * 6.28, l = 6 + r() * 20;
    g.strokeStyle = `rgba(110,95,55,${0.04 + r() * 0.06})`; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(90,75,40,${r() * 0.05})`; g.fillRect(40 + r() * (W - 80), 30 + r() * (H - 64), 1.3, 1.3); }
  for (let i = 0; i < 16; i++) {
    const x = 60 + r() * (W - 120), y = 50 + r() * (H - 100), rr = 12 + r() * 36;
    const f = g.createRadialGradient(x, y, 0, x, y, rr); f.addColorStop(0, 'rgba(170,125,60,0.09)'); f.addColorStop(1, 'rgba(170,125,60,0)');
    g.fillStyle = f; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  }
  // the ledger: hand-ruled lines (a little uneven) and a double margin
  for (let kk = 0; kk <= 14; kk++) {
    const y = lineY(kk);
    g.strokeStyle = C.rule; g.lineWidth = 1.4; g.beginPath();
    for (let i = 0; i <= 40; i++) { const x = lerp(1000, 1846, i / 40); const yy = y + Math.sin(i * 0.7 + kk) * 0.6 + (i / 40) * (r() - 0.5) * 1.2; i ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
  g.strokeStyle = C.margin; g.lineWidth = 1.5;
  for (const x of [1030, 1036]) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x + 1, H - 40); g.stroke(); }
  g.strokeStyle = 'rgba(84,132,140,0.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(1000, 132); g.lineTo(1846, 133); g.stroke();
  // the gutter: a soft shadow into the spine
  const gt = g.createLinearGradient(GUT - 90, 0, GUT + 90, 0);
  gt.addColorStop(0, 'rgba(60,50,25,0)'); gt.addColorStop(0.42, 'rgba(60,50,25,0.10)'); gt.addColorStop(0.5, 'rgba(50,40,20,0.30)');
  gt.addColorStop(0.58, 'rgba(60,50,25,0.10)'); gt.addColorStop(1, 'rgba(60,50,25,0)');
  g.fillStyle = gt; g.fillRect(GUT - 90, 24, 180, H - 50);
  // a light vignette over the pages
  const vg = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1150);
  vg.addColorStop(0, 'rgba(80,60,20,0)'); vg.addColorStop(1, 'rgba(80,60,20,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function chapterAt(t) { let c = null; for (const ch of CH) if (t >= ch.at + 2.2) c = ch; return c; }
function background(t) {
  if (!bgCanvas) paintBackground();
  ctx.drawImage(bgCanvas, 0, 0);
  txt('RECKON', 112, 96, { size: 32, weight: 700, color: C.green, spacing: '4px' });
  txt('· Biology', 112 + tw('RECKON', 32, { weight: 700 }) + 34, 96, { size: 32, italic: true, color: C.soft });
  const ch = chapterAt(t);
  if (ch && t < e('z6', 1.2)) A(seg(t, ch.at + 2.2, ch.at + 3.2), () => txt(`Part ${ch.n} · ${ch.title}`, 1808, 96, { size: 32, italic: true, color: C.soft, align: 'right' }));
}
/** Fade the drawings on both pages back to paper (for title cards and the credits). */
function veil(a) {
  if (a <= 0) return;
  A(a, () => { ctx.fillStyle = C.paperL; ctx.fillRect(40, 140, GUT - 60, H - 190); ctx.fillStyle = C.paperR; ctx.fillRect(GUT + 20, 140, W - GUT - 60, H - 190); });
}
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.45, 0.55);
    if (a <= 0) continue;
    veil(a * 0.82);
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.7));
      ctx.save(); ctx.translate(0, (1 - p) * 18);
      slip(960, 520, 1060, 340, { rot: -0.012, fill: C.cardG });
      ctx.save(); ctx.translate(960, 520); ctx.rotate(-0.012);
      txt(`PART ${ch.n}`, 0, -92, { size: 40, weight: 600, color: C.gold, align: 'center', spacing: '6px' });
      inkLine(-150, -52, 150, -52, seg(t, ch.at + 0.2, ch.at + 0.9), { w: 2, col: C.faint, seed: ch.n });
      txt(ch.title, 0, 30, { size: ch.title.length > 18 ? 88 : 104, weight: 500, color: C.ink, align: 'center' });
      pod(390, 118, 150, ['R', 'R', 'W', 'R'], { ang: -0.25, seed: ch.n + 40, open: eio(seg(t, ch.at + 0.6, ch.at + 1.6)) });
      ctx.restore(); ctx.restore();
    });
  }
}
function credits(t) {
  const a = seg(t, e('z6', 1.0), e('z6', 2.2));
  if (a <= 0) return;
  veil(a);
  A(a, () => {
    slip(960, 552, 1640, 820, { rot: 0, fill: C.card });
    txt('Mendel’s Peas', 960, 186, { size: 84, weight: 500, align: 'center' });
    txt('Reckon · original animation', 960, 256, { size: 40, italic: true, color: C.soft, align: 'center' });
    const blocks = [
      ['MUSIC', ['“Crinoline Dreams” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Wholesome” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Organic Meditations Three” Kevin MacLeod (incompetech.com) · CC BY 4.0']],
      ['SOURCES', [
        'G. Mendel, “Experiments on Plant Hybrids” (1866), tr. S. Abbott & D. J. Fairbanks, Genetics, 2016',
        'Wikipedia: Gregor Mendel · Mendelian inheritance · Experiments on Plant Hybridization · Punnett square',
        'William Bateson · Carl Correns · Hugo de Vries · Erich von Tschermak · Reginald Punnett · Ronald Fisher',
        'T. H. N. Ellis et al., Hereditas, 2019 · J. B. Reid & J. J. Ross, Genetics, 2011 · M. K. Bhattacharyya et al., Cell, 1990',
      ]],
    ];
    let y = 336;
    for (const [hd, lines] of blocks) {
      txt(hd, 960, y, { size: 32, weight: 600, color: C.gold, align: 'center', spacing: '5px' });
      lines.forEach((ln, j) => txt(ln, 960, y + 48 + j * 42, { size: 32, color: C.ink, align: 'center' }));
      y += 48 + lines.length * 42 + 40;
    }
    hand('Simulated crosses use fixed random seeds, computed in the animation.', 960, y + 14, { size: 40, color: C.soft, align: 'center' });
  });
}

// ---------- shared drawings ----------
/** The abbey, as a simple ink elevation drawn on to p: church front, tower, cloister wall. */
function abbey(cx, by, sc, p, a = 1) {
  if (p <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(cx, by); ctx.scale(sc, sc);
    wash(0, -70, 230, 90, C.greenWash, eout(seg(p, 0.6, 1)), 4);
    const segs = [
      [-200, 0, 200, 0], [-150, 0, -150, -120], [150, 0, 150, -120], [-150, -120, 0, -190], [0, -190, 150, -120],
      [-40, 0, -40, -150], [-40, -150, -40, -230], [40, -230, 40, -110], [-40, -230, 0, -300], [0, -300, 40, -230],
      [-200, 0, -200, -60], [-200, -60, -150, -60], [150, -60, 200, -60], [200, -60, 200, 0],
    ];
    segs.forEach(([x0, y0, x1, y1], i) => inkLine(x0, y0, x1, y1, clamp(p * segs.length - i * 0.7), { w: 2.5 / sc, col: C.ink, seed: i + 1, wob: 0.8 }));
    A(seg(p, 0.7, 1), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2 / sc;
      for (const x of [-105, -60, 60, 105]) { ctx.beginPath(); ctx.moveTo(x - 12, -30); ctx.lineTo(x - 12, -70); ctx.arc(x, -70, 12, Math.PI, 0); ctx.lineTo(x + 12, -30); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-18, -44); ctx.arc(0, -44, 18, Math.PI, 0); ctx.lineTo(18, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -150, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, -326); ctx.moveTo(-9, -316); ctx.lineTo(9, -316); ctx.stroke();
    });
    ctx.restore();
  });
}
/** A row of pea poles with vines, growing to p. */
function peaRow(x0, x1, y, p, seed = 1, h = 80) {
  const n = Math.round((x1 - x0) / 54);
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n), q = seg(p, (i / n) * 0.5, (i / n) * 0.5 + 0.5);
    if (q <= 0) continue;
    inkLine(x, y, x + 3, y - h * eout(q), 1, { w: 2.2, col: '#6B5A3A', seed: i + seed, wob: 0.6 });
    sprig(x + 4, y - h * 0.45 * eout(q), h * 0.75, q);
  }
  inkLine(x0 - 20, y + 2, x1 + 20, y + 4, eout(p), { w: 2, col: 'rgba(107,90,58,0.6)', seed });
}
/** A friar, as a silhouette: hooded robe, no face. */
function friar(x, y, sc, a = 1, bend = 0) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.fillStyle = '#2E3326';
    ctx.beginPath(); ctx.moveTo(-0.32, 0); ctx.quadraticCurveTo(-0.3, -0.6, -0.12, -0.82); ctx.lineTo(0.14, -0.82); ctx.quadraticCurveTo(0.3, -0.6, 0.34, 0); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(0.02, -0.9); ctx.rotate(bend);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.13, 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-0.16, 0.05); ctx.quadraticCurveTo(-0.2, -0.2, 0.02, -0.2); ctx.quadraticCurveTo(0.2, -0.2, 0.16, 0.08); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#2E3326'; ctx.lineWidth = 0.08; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0.12, -0.62); ctx.quadraticCurveTo(0.36, -0.5, 0.5, -0.36 + bend * 0.2); ctx.stroke();
    ctx.strokeStyle = '#5E553E'; ctx.lineWidth = 0.03; ctx.beginPath(); ctx.moveTo(-0.2, -0.42); ctx.lineTo(0.22, -0.42); ctx.stroke();
    ctx.restore();
  });
}
/** Tally marks in groups of five, n marks, starting at (x, y), up to wrap width. */
function tallies(n, x, y, { col = C.ink, h = 30, gap = 11, wrap = 760, lh = 58, w = 2.4 } = {}) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  let cx = x, cy = y;
  for (let i = 0; i < n; i++) {
    const j = i % 5;
    if (j < 4) { const xx = cx + j * gap + hsh(i, 1) * 2; ctx.beginPath(); ctx.moveTo(xx, cy); ctx.lineTo(xx + 2, cy - h); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(cx - 5, cy - h * 0.2); ctx.lineTo(cx + 3 * gap + 6, cy - h * 0.8); ctx.stroke(); cx += 4 * gap + 22; }
    if (cx > x + wrap) { cx = x; cy += lh; }
  }
}

// ---------- 0: cold open ----------
const F2POD = ['R', 'R', 'W', 'R', 'R', 'R', 'W', 'R'];
function partOpen(t) {
  // the cross, and the wrinkles coming back
  A(span(t, -1, s('o3', 0.4), 0, 0.7), () => {
    const pa = ap(t, s('o1', 0.1), 0.6), pb = ap(t, s('o1', 0.5), 0.6);
    pea(330, 250, 54, { shape: 'R', a: pa }); pea(680, 250, 54, { shape: 'W', a: pb, seed: 3 });
    A(pa, () => hand('round', 330, 338, { size: 42, color: C.green, align: 'center' }));
    A(pb, () => hand('wrinkled', 680, 338, { size: 42, color: C.terra, align: 'center' }));
    A(ap(t, s('o1', 0.8)), () => txt('×', 505, 250, { size: 72, color: C.soft, align: 'center' }));
    arrow(505, 330, 505, 410, seg(t, mid('o1', 0.5), mid('o1', 0.7)));
    for (let i = 0; i < 6; i++) pea(505 + (i - 2.5) * 84, 470, 30, { a: ap(t, mid('o1', 0.62) + i * 0.1, 0.4) });
    A(ap(t, mid('o1', 0.85)), () => hand('every seed round', 505, 540, { size: 40, color: C.green, align: 'center' }));
    arrow(505, 580, 505, 660, seg(t, s('o2', 0.3), s('o2', 0.9)));
    pod(505, 780, 440, F2POD, { open: eio(seg(t, s('o2', 0.9), s('o2', 1.8))), a: ap(t, s('o2', 0.6)), seed: 2 });
    F2POD.forEach((c, i) => { if (c === 'W') ring(505 + lerp(-220 * 0.62, 220 * 0.58, i / 7), 780, 30, 30, seg(t, mid('o2', 0.72), mid('o2', 0.85)), { seed: i }); });
    A(ap(t, mid('o2', 0.8)), () => hand('wrinkled seeds come back', 505, 900, { size: 40, color: C.terra, align: 'center' }));
    // the ledger
    writeOn(t, s('o1', 0.9), 'round × wrinkled', 1080, base(2), { base: 'alphabetic' });
    writeOn(t, mid('o1', 0.8), 'first generation: all round', 1080, base(3), { base: 'alphabetic', color: C.green });
    writeOn(t, s('o2', 0.8), 'grown on: some wrinkled again', 1080, base(5), { base: 'alphabetic', color: C.terra });
    A(ap(t, mid('o2', 0.68)), () => {
      hand('1 in 4', RX, 740, { size: 132, color: C.terra, align: 'center' });
      ['R', 'R', 'R', 'W'].forEach((c, i) => pea(RX + (i - 1.5) * 92, 890, 32, { shape: c, seed: i + 7 }));
    });
  });
  // a friar, a garden, and thousands of seeds
  A(span(t, s('o3', -0.2), s('o4', 0.7), 0.6, 0.6), () => {
    abbey(LX, 470, 1.05, seg(t, s('o3'), s('o3', 1.6)));
    for (let j = 0; j < 3; j++) peaRow(150, 860, 640 + j * 110, seg(t, s('o3', 0.3 + j * 0.3), s('o3', 2.0 + j * 0.3)), j + 3);
    friar(300, 860, 150, ap(t, s('o3', 0.8), 0.8), 0.25);
    const n = Math.floor(560 * eio(seg(t, s('o3', 0.6), e('o3', -0.2))));
    tallies(n, 1070, base(1) + 2, { wrap: 680 });
    writeOn(t, mid('o3', 0.55), 'thousands of seeds, counted', 1080, base(13), { base: 'alphabetic', color: C.green, size: 48 });
  });
  // the title
  const tp = ap(t, s('o4', 0.4), 0.9);
  A(tp, () => {
    veil(0.85);
    ctx.save(); ctx.translate(0, (1 - tp) * 20);
    slip(960, 500, 1200, 460, { rot: -0.01, fill: C.card });
    ctx.save(); ctx.translate(960, 500); ctx.rotate(-0.01);
    txt('Mendel’s Peas', 0, -70, { size: 136, weight: 500, align: 'center' });
    writeOn(t, s('o4', 1.1), 'the friar who counted heredity', 0, 40, { size: 60, color: C.soft, align: 'center' });
    pod(0, 150, 360, ['R', 'R', 'R', 'W', 'R', 'R'], { open: eio(seg(t, s('o4', 1.6), s('o4', 2.6))), seed: 8 });
    ctx.restore(); ctx.restore();
  });
}

// ---------- 1: the monastery garden ----------
const TRAITS = [
  ['seed shape', (x, y) => pea(x, y, 30, { shape: 'R' }), (x, y) => pea(x, y, 30, { shape: 'W', seed: 4 })],
  ['seed colour', (x, y) => pea(x, y, 30, { col: 'Y' }), (x, y) => pea(x, y, 30, { col: 'G' })],
  ['seed coat, flower', (x, y) => { pea(x - 24, y + 6, 24, { col: 'C' }); flower(x + 26, y - 4, 26, { col: 'V' }); }, (x, y) => { pea(x - 24, y + 6, 24, { col: 'W' }); flower(x + 26, y - 4, 26, { col: 'W' }); }],
  ['pod shape', (x, y) => pod(x, y, 110, [], { seed: 3 }), (x, y) => pod(x, y, 110, ['R', 'R', 'R'], { form: 'C', seed: 4, open: 0 })],
  ['pod colour', (x, y) => pod(x, y, 110, [], { seed: 5 }), (x, y) => pod(x, y, 110, [], { podCol: 'Y', seed: 6 })],
  ['flower position', (x, y) => stemFlowers(x, y, 'axial'), (x, y) => stemFlowers(x, y, 'terminal')],
  ['stem length', (x, y) => stemLen(x, y, 1), (x, y) => stemLen(x, y, 0.38)],
];
function stemFlowers(x, y, kind) {
  inkLine(x, y + 42, x + 2, y - 42, 1, { w: 3, col: C.green, seed: 2 });
  if (kind === 'axial') { flower(x + 16, y + 16, 15, { col: 'V' }); flower(x - 16, y - 8, 15, { col: 'V', rot: 0 }); flower(x + 16, y - 30, 15, { col: 'V' }); }
  else for (let j = -1; j <= 1; j++) flower(x + j * 15, y - 42 + Math.abs(j) * 8, 15, { col: 'V' });
}
function stemLen(x, y, f) {
  const b = y + 44, h = 88 * f;
  inkLine(x, b, x + 1, b - h, 1, { w: 3, col: C.green, seed: 3 });
  for (let j = 1; j <= Math.max(1, Math.round(4 * f)); j++) leaflets(x, b - (h * j) / (Math.round(4 * f) + 0.6), 12, j % 2 ? -0.3 : Math.PI + 0.3);
  inkLine(x - 22, b, x + 22, b, 1, { w: 2, col: C.faint });
}
function part1(t) {
  const t0 = CH[0].at + 2.6;
  // the abbey and its garden
  A(span(t, t0, s('g3', 0.05), 0.8, 0.6), () => {
    abbey(LX, 450, 1.15, seg(t, s('g1', -0.6), s('g1', 1.4)));
    A(ap(t, s('g1', 1.2)), () => { txt('St Thomas’s Abbey', LX, 540, { size: 44, italic: true, align: 'center' }); });
    for (let j = 0; j < 3; j++) peaRow(150, 860, 690 + j * 100, seg(t, s('g2', 0.2 + j * 0.3), s('g2', 2.2 + j * 0.3)), j + 9, 76);
    friar(780, 880, 120, ap(t, s('g2', 1.4), 0.8), 0.3);
    writeOn(t, mid('g1', 0.45), 'Brno, then Brünn', 1080, base(2), { base: 'alphabetic', size: 48 });
    writeOn(t, mid('g1', 0.75), 'in the Austrian Empire', 1080, base(3), { base: 'alphabetic', size: 48, color: C.soft });
    // eight seasons
    const ys = 600;
    inkLine(1090, ys, 1770, ys, seg(t, s('g2', 0.2), s('g2', 1.2)), { w: 2.5, col: C.soft });
    for (let i = 0; i < 8; i++) {
      const x = lerp(1110, 1750, i / 7), q = seg(t, s('g2', 0.5) + i * 0.22, s('g2', 1.1) + i * 0.22);
      A(q, () => { inkLine(x, ys - 8, x, ys + 8, 1, { w: 2.5 }); hand(String(1856 + i), x, ys + 44, { size: 34, align: 'center', color: C.soft }); });
      sprig(x, ys - 40, 56, q);
    }
    writeOn(t, mid('g2', 0.7), 'crossing peas, 1856 to 1863', 1080, base(10), { base: 'alphabetic', color: C.green });
  });
  // the flower: closed, opened, crossed
  A(span(t, s('g3', -0.4), s('g5', 0.15), 0.6, 0.6), () => {
    const fx = LX - 30, fy = 520, sc = 300;
    const opened = eio(seg(t, mid('g3', 0.45), mid('g3', 0.7))), pulled = eio(seg(t, mid('g3', 0.7), e('g3', -0.1)));
    flowerCut(t, fx, fy, sc, opened, pulled);
    // own pollen inside the closed bud
    A(span(t, s('g3', 0.3), mid('g3', 0.55), 0.3, 0.3), () => {
      for (let i = 0; i < 10; i++) {
        const u = ((t - s('g3', 0.3)) * 0.6 + i / 10) % 1;
        const x = fx + sc * lerp(0.28, 0.5, u), y = fy + sc * lerp(0.18, 0.02, u) + Math.sin(i * 3 + u * 6) * 6;
        ctx.fillStyle = '#E2B93E'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
    });
    // forceps
    A(span(t, mid('g3', 0.62), e('g3', 0.2), 0.3, 0.4), () => {
      const fxp = fx + sc * 0.55 + 140 * pulled, fyp = fy + sc * 0.24 + 40 * pulled;
      ctx.strokeStyle = '#6E6A60'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(fxp, fyp); ctx.lineTo(fxp + 230, fyp + 120); ctx.moveTo(fxp + 6, fyp + 8); ctx.lineTo(fxp + 236, fyp + 104); ctx.stroke();
    });
    // pollen from another plant
    const fl2x = 840, fl2y = 250;
    A(ap(t, s('g4', -0.2)), () => { flower(fl2x, fl2y, 70, { col: 'W' }); hand('another plant', fl2x - 10, fl2y + 80, { size: 36, align: 'center', color: C.soft }); });
    const pp = seg(t, s('g4', 0.3), e('g4', -0.2));
    for (let i = 0; i < 12; i++) {
      const u = clamp(pp * 1.4 - i * 0.04);
      if (u <= 0 || u >= 1) continue;
      const x = lerp(fl2x - 20, fx + sc * 0.48, u), y = lerp(fl2y + 20, fy + sc * 0.0, u) - Math.sin(Math.PI * u) * 120 + Math.sin(i * 7) * 8;
      ctx.fillStyle = '#E2B93E'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    A(0.9, () => txt('diagram, simplified', LX, 940, { size: 32, italic: true, color: C.faint, align: 'center' }));
    writeOn(t, s('g3', 0.6), 'in the bud: its own pollen', 1080, base(2), { base: 'alphabetic' });
    writeOn(t, mid('g3', 0.5), '1.  open a young bud', 1080, base(4), { base: 'alphabetic', color: C.green });
    writeOn(t, mid('g3', 0.72), '2.  pull out the stamens', 1080, base(5), { base: 'alphabetic', color: C.green });
    writeOn(t, s('g4', 0.3), '3.  dust with other pollen', 1080, base(6), { base: 'alphabetic', color: C.green });
  });
  // 34 varieties, 22 kept
  A(span(t, s('g5', -0.3), s('g6', 0.3), 0.5, 0.5), () => {
    for (let i = 0; i < 34; i++) {
      const col = i % 9, row = Math.floor(i / 9), x = 1110 + col * 82, y = 300 + row * 104;
      const kept = hsh(i, 9) < 0.66 ? 1 : 0;
      packet(x, y, 58, 76, { a: ap(t, s('g5', 0.1) + i * 0.04, 0.3) * (1 - 0.6 * (1 - kept) * seg(t, mid('g5', 0.5), mid('g5', 0.7))), band: [C.green, C.terra, C.violet, C.gold][i % 4], peaCode: ['RY', 'WY', 'RG', 'WG'][(i * 7) % 4], seed: i });
    }
    writeOn(t, s('g5', 0.3), '34 varieties, tried for two years', 1080, base(12), { base: 'alphabetic' });
    writeOn(t, mid('g5', 0.5), '22 kept, true-breeding', 1080, base(13), { base: 'alphabetic', color: C.green });
  });
  // seven traits, and the plant they belong to
  A(span(t, s('g5', -0.2), s('g9', 0.15), 0.6, 0.6), () => {
    const pg = seg(t, s('g5', 0.0), s('g5', 2.5));
    plant(LX, 930, 720, pg, { seed: 3 });
    pod(LX + 150, 860, 170, ['R', 'R', 'W', 'R'], { ang: -0.15, a: ap(t, s('g5', 2.2)), seed: 9 });
  });
  const rowT = [s('g6', 0.2), mid('g6', 0.28), mid('g6', 0.62), s('g7', 0.1), mid('g7', 0.26), mid('g7', 0.52), mid('g7', 0.8)];
  const HL = [[LX + 150, 860, 110, 50], [LX + 150, 860, 110, 50], [LX + 50, 450, 70, 60], [LX - 60, 600, 90, 50], [LX - 60, 600, 90, 50], [LX, 450, 120, 120], [LX, 560, 60, 380]];
  A(span(t, s('g6', -0.2), s('g9', 0.15), 0.5, 0.6), () => {
    txt('two forms of each', 1500, base(0) + 2, { size: 32, italic: true, color: C.soft, align: 'center', base: 'alphabetic' });
    TRAITS.forEach(([name, dom, rec], i) => {
      const y = 232 + 112 * i, q = ap(t, rowT[i], 0.5);
      if (q <= 0) return;
      A(q, () => {
        hand(name, 1062, y, { size: 42 });
        dom(1480, y); hand('or', 1600, y, { size: 36, color: C.faint, align: 'center' }); rec(1720, y);
      });
      const cur = i === 6 ? span(t, rowT[i], e('g7', 0.4), 0.3, 0.3) : span(t, rowT[i], rowT[i + 1] + 0.2, 0.3, 0.3);
      const [hx, hy, rx, ry] = HL[i];
      wash(hx, hy, rx, ry, C.goldWash, cur * 1.4, i + 20);
    });
  });
  // 28,000 plants
  A(span(t, s('g9', -0.3), CH[1].at + 1.0, 0.5, 0.8), () => {
    for (let i = 0; i < 28; i++) { const col = i % 7, row = Math.floor(i / 7); sprig(200 + col * 102, 330 + row * 150, 96, seg(t, s('g9', 0.2) + i * 0.06, s('g9', 1.0) + i * 0.06)); }
    A(ap(t, s('g9', 1.2)), () => txt('each sprig: 1,000 plants', LX, 900, { size: 34, italic: true, color: C.soft, align: 'center' }));
    A(ap(t, mid('g9', 0.25)), () => hand(fmt(28000), RX, 420, { size: 132, color: C.green, align: 'center' }));
    writeOn(t, mid('g9', 0.45), 'plants, most of them peas', RX, 540, { size: 52, align: 'center' });
    writeOn(t, mid('g9', 0.75), 'and he counted', RX, 700, { size: 52, align: 'center', color: C.terra });
    tallies(Math.floor(30 * seg(t, mid('g9', 0.8), e('g9', 0.6))), 1230, 800, { col: C.terra, h: 40, gap: 14 });
  });
}
/** A pea flower in section: standard, wings, and a keel that hides the stamens and stigma. */
function flowerCut(t, x, y, sc, opened, pulled) {
  ctx.save(); ctx.translate(x, y);
  // stalk
  ctx.strokeStyle = C.leafDeep; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-sc * 1.0, sc * 0.6); ctx.quadraticCurveTo(-sc * 0.7, sc * 0.15, -sc * 0.42, sc * 0.1); ctx.stroke();
  ctx.fillStyle = C.leaf; ctx.strokeStyle = C.leafDeep; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-sc * 0.5, -sc * 0.05); ctx.lineTo(-sc * 0.12, -sc * 0.1); ctx.lineTo(-sc * 0.08, sc * 0.26); ctx.lineTo(-sc * 0.5, sc * 0.22); ctx.closePath(); ctx.fill(); ctx.stroke();
  // standard
  ctx.fillStyle = 'rgba(168,128,190,0.55)'; ctx.strokeStyle = '#4E2C63'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-sc * 0.12, -sc * 0.02); ctx.bezierCurveTo(-sc * 0.25, -sc * 0.95, sc * 0.6, -sc * 1.05, sc * 0.62, -sc * 0.35); ctx.bezierCurveTo(sc * 0.62, -sc * 0.06, sc * 0.25, sc * 0.04, -sc * 0.12, sc * 0.06); ctx.closePath(); ctx.fill(); ctx.stroke();
  // pistil: ovary, style, stigma
  ctx.strokeStyle = C.green; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-sc * 0.05, sc * 0.2); ctx.quadraticCurveTo(sc * 0.3, sc * 0.26, sc * 0.46, sc * 0.08); ctx.stroke();
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(sc * 0.48, sc * 0.05, 9, 0, Math.PI * 2); ctx.fill();
  // stamens: filaments and anthers (pulled out by the forceps)
  A(1 - seg(pulled, 0.6, 1), () => {
    ctx.save(); ctx.translate(pulled * 160, pulled * 50);
    ctx.strokeStyle = '#B9A46A'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const ex = sc * (0.24 + i * 0.035), ey = sc * (0.12 - i * 0.01);
      ctx.beginPath(); ctx.moveTo(-sc * 0.02, sc * 0.24); ctx.quadraticCurveTo(sc * 0.12, sc * 0.3, ex, ey); ctx.stroke();
      ctx.fillStyle = '#E2B93E'; ctx.beginPath(); ctx.ellipse(ex, ey, 9, 5, -0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
  // wings and keel (the keel swings down when opened)
  ctx.fillStyle = 'rgba(122,76,147,0.6)'; ctx.strokeStyle = '#4E2C63'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-sc * 0.1, sc * 0.02); ctx.bezierCurveTo(sc * 0.2, -sc * 0.2, sc * 0.75, -sc * 0.05, sc * 0.64, sc * 0.16); ctx.bezierCurveTo(sc * 0.5, sc * 0.3, sc * 0.1, sc * 0.2, -sc * 0.1, sc * 0.1); ctx.closePath();
  ctx.globalAlpha *= 0.45; ctx.fill(); ctx.globalAlpha /= 0.45; ctx.stroke();
  ctx.save(); ctx.translate(-sc * 0.08, sc * 0.18); ctx.rotate(0.5 * opened); ctx.translate(sc * 0.08, -sc * 0.18);
  ctx.fillStyle = 'rgba(217,195,228,0.82)';
  ctx.beginPath(); ctx.moveTo(-sc * 0.08, sc * 0.16); ctx.bezierCurveTo(sc * 0.15, sc * 0.46, sc * 0.6, sc * 0.4, sc * 0.72, sc * 0.18); ctx.bezierCurveTo(sc * 0.45, sc * 0.08, sc * 0.15, sc * 0.08, -sc * 0.08, sc * 0.16); ctx.closePath();
  ctx.globalAlpha *= 0.75 - 0.35 * opened; ctx.fill(); ctx.globalAlpha /= 0.75 - 0.35 * opened; ctx.stroke();
  ctx.restore();
  // labels with leader lines
  const lab = (str, lx, ly, px, py) => { inkLine(lx, ly, px, py, 1, { w: 1.6, col: C.faint, seed: lx }); hand(str, lx + (lx < px ? -8 : 8), ly, { size: 38, color: C.soft, align: lx < px ? 'right' : 'left' }); };
  lab('keel', -sc * 0.35, sc * 0.62, sc * 0.2, sc * 0.33);
  lab('stigma', sc * 0.75, -sc * 0.05, sc * 0.5, sc * 0.05);
  A(1 - seg(pulled, 0.3, 0.8), () => lab('stamens', sc * 0.78, sc * 0.48, sc * 0.36, sc * 0.12));
  lab('standard', -sc * 0.4, -sc * 0.62, -sc * 0.05, -sc * 0.55);
  ctx.restore();
}

// ---------- 2: three to one ----------
const PER = 50, N_R = Math.round(5474 / PER), N_W = Math.round(1850 / PER); // 109 and 37 drawn peas
const FALL = [];
{
  const rnd = mulberry32(5), bag = [...Array(N_R).fill('R'), ...Array(N_W).fill('W')];
  for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
  let nr = 0, nw = 0;
  bag.forEach((kind, i) => FALL.push({ kind, slot: kind === 'R' ? nr++ : nw++, i }));
}
const TRAY = { pitch: 26, r: 11, cols: 11, bottom: 590, xR: 1086, xW: 1466 };
const trayW = TRAY.cols * TRAY.pitch + 12;
const slotXY = (kind, slot) => [(kind === 'R' ? TRAY.xR : TRAY.xW) + 18 + (slot % TRAY.cols) * TRAY.pitch, TRAY.bottom - 16 - Math.floor(slot / TRAY.cols) * TRAY.pitch];
const xRatio = (r) => 170 + (r - 2.5) * 670;
function part2(t) {
  const t0 = CH[1].at + 2.6;
  const gl = (str, y, at) => A(ap(t, at), () => hand(str, 128, y, { size: 36, color: C.soft }));
  A(span(t, t0, s('r6', 0.15), 0.8, 0.6), () => {
    gl('parents', 180, s('r1', 0.2)); gl('hybrid seeds', 384, s('r2', 0.2)); gl('hybrid plant', 590, s('r4', 0.1));
    pod(380, 250, 250, ['R', 'R', 'R', 'R', 'R'], { open: eio(seg(t, s('r1', 0.6), s('r1', 1.4))), a: ap(t, s('r1', 0.2)), seed: 11 });
    pod(720, 250, 250, ['W', 'W', 'W', 'W', 'W'], { open: eio(seg(t, s('r1', 0.9), s('r1', 1.7))), a: ap(t, s('r1', 0.5)), seed: 12 });
    A(ap(t, s('r1', 0.8)), () => txt('×', 550, 250, { size: 64, color: C.soft, align: 'center' }));
    arrow(550, 316, 550, 386, seg(t, s('r2', 0.3), s('r2', 0.9)));
    pod(550, 446, 300, ['R', 'R', 'R', 'R', 'R', 'R'], { open: eio(seg(t, s('r2', 0.9), s('r2', 1.6))), a: ap(t, s('r2', 0.6)), seed: 13 });
    A(ap(t, mid('r2', 0.75)), () => hand('every seed round, that same year', 550, 516, { size: 36, color: C.green, align: 'center' }));
    A(ap(t, s('r4', 0.2)), () => { inkLine(450, 716, 650, 718, 1, { w: 2.5, col: 'rgba(107,90,58,0.7)' }); pea(550, 708, 13); });
    sprig(550, 652, 130, seg(t, s('r4', 0.4), e('r4', -0.3)));
    flower(552, 590, 22, { a: ap(t, e('r4', -0.5)) });
    arcArrow(560, 590, 44, -2.6, 2.2, seg(t, e('r4', -0.4), e('r4', 0.4)));
    A(ap(t, e('r4', -0.2)), () => hand('fertilises itself', 618, 640, { size: 34, color: C.soft }));
  });
  A(span(t, s('r1', 0.2), s('r6', 0.15), 0.4, 0.6), () => {
    writeOn(t, s('r1', 0.9), 'cross: round × wrinkled', 1080, base(1), { base: 'alphabetic', size: 46, color: C.soft });
    writeOn(t, s('r3', 0.5), 'round: dominant', 1080, base(2), { base: 'alphabetic', size: 50, color: C.green });
    writeOn(t, mid('r3', 0.6), 'wrinkled: recessive', 1080, base(3), { base: 'alphabetic', size: 50, color: C.terra });
    writeOn(t, mid('r5', 0.6), 'no in-between forms', 1080, base(5), { base: 'alphabetic', color: C.soft });
  });
  // the next generation's pod, which then pours into the trays
  A(span(t, s('r5', -0.3), e('r7', 0.8), 0.5, 0.6), () => {
    gl('its seeds', 790, s('r5', 0.0));
    const dim = 1 - 0.5 * seg(t, s('r6', 0.6), s('r6', 1.2));
    pod(550, 820, 380, F2POD, { open: eio(seg(t, s('r5', 0.1), s('r5', 1.0))), seed: 14, a: dim });
    A(dim, () => F2POD.forEach((c, i) => { if (c === 'W') ring(550 + lerp(-190 * 0.62, 190 * 0.58, i / 7), 820, 27, 27, seg(t, mid('r5', 0.35), mid('r5', 0.5)), { seed: i }); }));
    A(ap(t, mid('r5', 0.65)) * dim, () => hand('nothing in between', 550, 910, { size: 36, color: C.soft, align: 'center' }));
  });
  // counting
  A(span(t, s('r6', -0.3), e('r7', 0.8), 0.5, 0.6), () => {
    writeOn(t, s('r6', 0.2), '253 plants,  7,324 seeds', 1080, base(1), { base: 'alphabetic', size: 46 });
    const tr = ap(t, s('r6', 0.6));
    A(tr, () => {
      const rows = Math.ceil(N_R / TRAY.cols), h = rows * TRAY.pitch + 14;
      for (const [x0, col] of [[TRAY.xR, C.green], [TRAY.xW, C.terra]]) {
        inkLine(x0, TRAY.bottom - h, x0, TRAY.bottom, 1, { w: 2.5, col, seed: 1 }); inkLine(x0, TRAY.bottom, x0 + trayW, TRAY.bottom, 1, { w: 2.5, col, seed: 2 });
        inkLine(x0 + trayW, TRAY.bottom, x0 + trayW, TRAY.bottom - h, 1, { w: 2.5, col, seed: 3 });
      }
    });
    const fa = s('r6', 1.0), fb = e('r6', -0.5);
    let nr = 0, nw = 0;
    for (const f of FALL) {
      const t1 = fa + (fb - fa) * (f.i / (FALL.length - 1));
      if (t < t1) continue;
      const p = seg(t, t1, t1 + 0.6), q = eio(p), [sx, sy] = slotXY(f.kind, f.slot);
      const x = lerp(550 + (f.i % 5 - 2) * 30, sx, q), y = lerp(800, sy, q) - Math.sin(Math.PI * q) * 160;
      pea(x, y, TRAY.r, { shape: f.kind, seed: f.i, a: seg(p, 0, 0.12) });
      if (p >= 1) f.kind === 'R' ? nr++ : nw++;
    }
    A(tr, () => {
      const mR = TRAY.xR + trayW / 2, mW = TRAY.xW + trayW / 2;
      hand(fmt(Math.round(5474 * nr / N_R)), mR, 640, { size: 60, weight: 600, color: C.green, align: 'center' });
      hand(fmt(Math.round(1850 * nw / N_W)), mW, 640, { size: 60, weight: 600, color: C.terra, align: 'center' });
      hand('round', mR, 694, { size: 40, color: C.green, align: 'center' }); hand('wrinkled', mW, 694, { size: 40, color: C.terra, align: 'center' });
      txt(`each pea drawn: ${PER} seeds`, mW, 748, { size: 32, italic: true, color: C.soft, align: 'center' });
    });
    writeOn(t, s('r7', 0.2), `5,474 ÷ 1,850 = ${r2(5474 / 1850)}`, RX, 820, { size: 60, align: 'center' });
    A(ap(t, mid('r7', 0.6)), () => { hand('close to 3 : 1', RX, 912, { size: 50, color: C.gold, align: 'center' }); under(RX - 130, RX + 130, 936, seg(t, mid('r7', 0.65), mid('r7', 0.9)), { col: C.gold }); });
  });
  // the seven experiments: ledger on the right, the ratios on the left, row by row
  A(span(t, s('r8', -0.3), CH[2].at + 1.0, 0.5, 0.8), () => {
    A(ap(t, s('r8', 0.0)), () => {
      for (const [h, x, al] of [['trait', 1062, 'left'], ['dominant', 1500, 'right'], ['recessive', 1660, 'right'], ['ratio', 1800, 'right']]) txt(h, x, base(1), { size: 32, italic: true, color: C.soft, align: al, base: 'alphabetic' });
      // the scale
      inkLine(170, 820, 840, 820, 1, { w: 2.5, col: C.soft });
      for (const v of [2.5, 2.75, 3, 3.25, 3.5]) { const x = xRatio(v); inkLine(x, 812, x, 828, 1, { w: 2 }); hand(String(v), x, 862, { size: 34, color: C.soft, align: 'center' }); }
      inkLine(xRatio(3), 210, xRatio(3), 820, 1, { w: 2.5, col: C.gold, dash: [8, 8] });
      hand('3 : 1', xRatio(3), 186, { size: 42, color: C.gold, align: 'center' });
      txt('dominant to recessive', LX, 915, { size: 32, italic: true, color: C.soft, align: 'center' });
    });
    EXPTS.forEach(([name, d, r], i) => {
      const at = lerp(s('r8', 0.3), e('r8', -0.6), i / 6), kk = 2 + i, y = base(kk);
      writeOn(t, at, name, 1062, y, { base: 'alphabetic', size: 40 });
      writeOn(t, at + 0.25, fmt(d), 1500, y, { base: 'alphabetic', size: 40, align: 'right', color: C.green });
      writeOn(t, at + 0.35, fmt(r), 1660, y, { base: 'alphabetic', size: 40, align: 'right', color: C.terra });
      writeOn(t, at + 0.45, r2(d / r), 1800, y, { base: 'alphabetic', size: 40, align: 'right', color: C.gold, weight: 600 });
      const q = ap(t, at + 0.45, 0.4), yy = y - 14;
      A(q * 0.5, () => inkLine(170, yy, 840, yy, 1, { w: 1.2, col: C.ghost, seed: i }));
      pea(xRatio(d / r), yy, 15, { a: q, seed: i, shape: 'R' });
    });
    const tt = s('r9', 0.3);
    A(ap(t, tt), () => { inkLine(1062, lineY(9) - 3, 1800, lineY(9) - 2, 1, { w: 2, col: C.soft }); inkLine(1062, lineY(9) + 3, 1800, lineY(9) + 4, 1, { w: 2, col: C.soft, seed: 4 }); });
    writeOn(t, tt + 0.2, 'all seven', 1062, base(10), { base: 'alphabetic', size: 42 });
    writeOn(t, tt + 0.5, fmt(DOM), 1500, base(10), { base: 'alphabetic', size: 42, align: 'right', color: C.green });
    writeOn(t, tt + 0.7, fmt(REC), 1660, base(10), { base: 'alphabetic', size: 42, align: 'right', color: C.terra });
    writeOn(t, tt + 1.0, r2(DOM / REC), 1800, base(10), { base: 'alphabetic', size: 48, align: 'right', color: C.gold, weight: 700 });
    A(ap(t, tt + 1.1), () => {
      const x = xRatio(DOM / REC), y = base(10) - 14;
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 14, y); ctx.lineTo(x, y + 16); ctx.lineTo(x - 14, y); ctx.closePath(); ctx.fill();
      hand(r2(DOM / REC), x + 26, y, { size: 40, color: C.gold });
    });
    writeOn(t, s('r10', 0.3), 'but why 3 to 1?', RX, 900, { size: 60, color: C.terra, align: 'center' });
  });
}

// ---------- 3: two copies ----------
const PUN = { x0: 300, y0: 300, cell: 200 };
const geno = (a, b) => (a === 'R' || b !== 'R' ? a + b : b + a);
function genoTxt(g, x, y, size = 50) {
  const w0 = tw(g[0], size, { fam: HAND, weight: 600 }), w1 = tw(g[1], size, { fam: HAND, weight: 600 }), x0 = x - (w0 + w1) / 2;
  hand(g[0], x0, y, { size, weight: 600, color: g[0] === 'R' ? C.green : C.terra });
  hand(g[1], x0 + w0, y, { size, weight: 600, color: g[1] === 'R' ? C.green : C.terra });
}
function part3(t) {
  const t0 = CH[2].at + 2.6;
  const leave = s('c4', 0.3), land = s('c4', 1.6), q = eio(seg(t, leave, land));
  // the parents, two copies each
  A(span(t, t0, e('c5', 0.6), 0.8, 0.6), () => {
    [[300, 'R'], [710, 'W']].forEach(([x, sh], j) => {
      pea(x - 70, 250, 44, { shape: sh, seed: 5 + j, a: ap(t, t0 + 0.3 + j * 0.3) });
      const ch = j ? 'r' : 'R', filled = ap(t, mid('c2', 0.5 + 0.2 * j));
      for (let m = 0; m < 2; m++) {
        const tx = x + 14 + m * 66, moving = m === 0 && t >= leave;
        if (moving) continue;
        token('', tx, 250, { a: ap(t, s('c1', 0.6)) * (1 - filled) });
        token(ch, tx, 250, { a: filled });
      }
      A(ap(t, t0 + 0.3), () => hand(j ? 'pure wrinkled' : 'pure round', x, 320, { size: 36, color: j ? C.terra : C.green, align: 'center' }));
    });
    A(span(t, s('c1', 1.0), s('c4', 0.2), 0.4, 0.4), () => hand('two copies each, one from each parent', LX, 400, { size: 40, color: C.soft, align: 'center' }));
  });
  // the hybrid: R from one parent, r from the other; it rises to make pollen and eggs
  const up = eio(seg(t, s('c6', -0.2), s('c6', 0.7))), hy = lerp(560, 250, up);
  A(span(t, leave, s('c10', 0.1), 0.2, 0.6), () => {
    pea(420, hy, 48, { a: ap(t, mid('c4', 0.5)) });
    token('R', lerp(314, 500, q), lerp(250, hy, q) - Math.sin(Math.PI * q) * 40);
    token('r', lerp(790, 566, q), lerp(250, hy, q) - Math.sin(Math.PI * q) * 40, { dim: seg(t, s('c5', 0.4), s('c5', 1.0)) });
    A(span(t, mid('c4', 0.7), s('c6', 0.2), 0.4, 0.3), () => hand('hybrid: round', 470, 652, { size: 42, color: C.green, align: 'center' }));
    A(span(t, s('c5', 0.8), s('c6', 0.2), 0.4, 0.3), () => hand('hidden', 618, hy + 2, { size: 38, color: C.terra }));
  });
  // its pollen and egg cells, paired by chance
  A(span(t, s('c6', 0.2), s('c10', 0.1), 0.5, 0.6), () => {
    const PL = ['R', 'r', 'R', 'r'], EG = ['R', 'r', 'R', 'r'], PERM = [2, 0, 3, 1], xs = [300, 430, 560, 690];
    A(ap(t, s('c6', 0.6)), () => { hand('pollen', 128, 470, { size: 36, color: C.soft }); hand('eggs', 128, 720, { size: 36, color: C.soft }); });
    EG.forEach((ch, i) => egg(xs[i] + 20, 720, ch, ap(t, mid('c6', 0.5) + i * 0.12)));
    PL.forEach((ch, i) => {
      const t1 = s('c7', 0.2) + i * 0.3, m = eio(seg(t, t1, t1 + 1.0)), tx = xs[PERM[i]] + 20;
      const x = lerp(xs[i] + 20, tx, m) + Math.sin(m * 9 + i) * 26 * Math.sin(Math.PI * m), y = lerp(470, 676, m);
      pollen(x, y, ch, ap(t, mid('c6', 0.3) + i * 0.12) * (1 - seg(m, 0.92, 1)));
      const g = geno(ch, EG[PERM[i]]);
      A(seg(m, 0.95, 1) * ap(t, t1 + 1.0, 0.4), () => { genoTxt(g, tx, 800, 40); pea(tx, 860, 24, { shape: g === 'rr' ? 'W' : 'R', seed: i }); });
    });
    A(ap(t, mid('c7', 0.6)), () => hand('a matter of chance', LX, 935, { size: 44, color: C.gold, align: 'center' }));
  });
  // the ledger: notes as they come
  A(span(t, s('c2', 0.2), s('c8', 0.05), 0.4, 0.6), () => {
    A(ap(t, mid('c2', 0.5)), () => { token('R', 1092, base(2) - 14, { r: 22 }); hand('round', 1130, base(2), { base: 'alphabetic', color: C.green }); });
    A(ap(t, mid('c2', 0.75)), () => { token('r', 1092, base(3) - 14, { r: 22 }); hand('wrinkled', 1130, base(3), { base: 'alphabetic', color: C.terra }); });
    writeOn(t, mid('c4', 0.6), 'one R is enough: dominant', 1080, base(5), { base: 'alphabetic', color: C.green });
    writeOn(t, s('c5', 0.8), 'the r stays hidden, passed on', 1080, base(6), { base: 'alphabetic', color: C.terra });
    writeOn(t, mid('c6', 0.4), 'pollen, eggs: half R, half r', 1080, base(8), { base: 'alphabetic' });
    writeOn(t, mid('c7', 0.4), 'which meets which: chance', 1080, base(9), { base: 'alphabetic', color: C.gold });
  });
  // Mendel's fractions: pollen over egg cell
  const FR = [['R', 'R'], ['R', 'r'], ['r', 'R'], ['r', 'r']], fx = [1250, 1430, 1610, 1780];
  A(span(t, s('c8', -0.2), s('c13', 0.15), 0.5, 0.6), () => {
    writeOn(t, s('c8', 0.1), 'as Mendel wrote it', 1080, base(1), { base: 'alphabetic', color: C.soft });
    A(ap(t, s('c8', 0.6)), () => { txt('pollen', 1170, 386, { size: 32, italic: true, color: C.soft, align: 'right' }); txt('egg cell', 1170, 456, { size: 32, italic: true, color: C.soft, align: 'right' }); });
    FR.forEach(([a, b], i) => {
      const q2 = ap(t, s('c8', 1.0) + i * 0.45);
      frac(a, b, fx[i], 420, { size: 64, colTop: a === 'R' ? C.green : C.terra, colBot: b === 'R' ? C.green : C.terra, color: C.ink, a: q2 });
      if (i) A(q2, () => hand('+', (fx[i] + fx[i - 1]) / 2, 420, { size: 52, color: C.soft, align: 'center' }));
      pea(fx[i], 556, 26, { shape: a === 'r' && b === 'r' ? 'W' : 'R', a: ap(t, s('c9', 0.4) + i * 0.2), seed: i + 3 });
    });
    ring(fx[3], 470, 46, 120, seg(t, s('c9', 0.3), s('c9', 0.9)));
    writeOn(t, mid('c9', 0.6), '3 round : 1 wrinkled', 1500, 666, { size: 54, align: 'center' });
    writeOn(t, s('c11', 0.4), 'his shorthand:  A + 2Aa + a', 1080, base(11), { base: 'alphabetic', size: 46 });
  });
  // the same bookkeeping as a square, as drawn decades later
  A(span(t, s('c10', -0.3), s('c13', 0.15), 0.5, 0.6), () => {
    const { x0, y0, cell } = PUN, gp = seg(t, s('c10', 0.1), s('c10', 1.3));
    inkRect(x0, y0, cell * 2, cell * 2, gp, { w: 3 });
    inkLine(x0 + cell, y0, x0 + cell, y0 + 2 * cell, gp, { w: 3, seed: 7 }); inkLine(x0, y0 + cell, x0 + 2 * cell, y0 + cell, gp, { w: 3, seed: 8 });
    ['R', 'r'].forEach((ch, i) => { token(ch, x0 + cell * (i + 0.5), y0 - 52, { a: ap(t, s('c10', 0.8) + i * 0.15) }); token(ch, x0 - 52, y0 + cell * (i + 0.5), { a: ap(t, s('c10', 1.1) + i * 0.15) }); });
    A(ap(t, s('c10', 0.8)), () => { hand('pollen', x0 + cell, y0 - 112, { size: 36, color: C.soft, align: 'center' }); hand('egg', x0 - 128, y0 + cell, { size: 36, color: C.soft, align: 'center' }); });
    for (let n = 0; n < 4; n++) {
      const c = n % 2, r = Math.floor(n / 2), cx = x0 + cell * (c + 0.5), cy = y0 + cell * (r + 0.5), g = geno(['R', 'r'][c], ['R', 'r'][r]);
      const qq = ap(t, mid('c10', 0.5) + n * 0.4);
      if (g === 'rr') A(qq, () => { ctx.fillStyle = C.terraWash; ctx.fillRect(x0 + c * cell + 5, y0 + r * cell + 5, cell - 10, cell - 10); });
      if (g !== 'rr') A(qq * span(t, s('c12', 0.1), e('c12', 0.6), 0.4, 0.4), () => { ctx.fillStyle = C.goldWash; ctx.fillRect(x0 + c * cell + 5, y0 + r * cell + 5, cell - 10, cell - 10); });
      A(qq, () => { genoTxt(g, cx, cy - 42, 54); pea(cx, cy + 40, 36, { shape: g === 'rr' ? 'W' : 'R', seed: n + 9 }); });
      if (g === 'Rr') ring(cx, cy, 82, 82, seg(t, mid('c12', 0.3), mid('c12', 0.55)), { col: C.gold, seed: n });
    }
    A(ap(t, mid('c10', 0.7)), () => txt('Punnett square, drawn decades later', x0 + cell, y0 + 2 * cell + 54, { size: 32, italic: true, color: C.soft, align: 'center' }));
    writeOn(t, s('c11', 0.2), '1 RR  :  2 Rr  :  1 rr', x0 + cell, 830, { size: 50, align: 'center' });
    A(ap(t, mid('c12', 0.5)), () => hand('two in three round seeds hide an r', x0 + cell, 912, { size: 40, color: C.terra, align: 'center' }));
  });
  // the test: grow each round seed and look at its seeds
  A(span(t, s('c13', -0.3), CH[3].at + 1.0, 0.5, 0.8), () => {
    A(ap(t, s('c13', 0.1)), () => hand('grow each round seed, look at its seeds', LX, 190, { size: 40, color: C.soft, align: 'center' }));
    [[320, ['R', 'R', 'R', 'R', 'R', 'R'], 'only round: pure', C.green], [690, ['R', 'R', 'W', 'R', 'W', 'R'], 'both kinds: hybrid', C.terra]].forEach(([x, kinds, lab, col], j) => {
      const t1 = s('c13', 0.2 + j * 0.4);
      pea(x, 270, 32, { a: ap(t, t1) });
      arrow(x, 316, x, 380, seg(t, t1 + 0.3, t1 + 0.8));
      sprig(x, 450, 120, seg(t, t1 + 0.6, t1 + 1.6));
      pod(x, 590, 270, kinds, { a: ap(t, t1 + 1.3), open: eio(seg(t, t1 + 1.5, t1 + 2.2)), seed: 20 + j });
      A(ap(t, t1 + 2.0), () => hand(lab, x, 690, { size: 40, color: col, align: 'center' }));
    });
    writeOn(t, s('c13', 0.2), '565 plants from round seeds', 1080, base(1), { base: 'alphabetic', size: 46 });
    const bar = (y, n, lab, at, striped) => {
      const p = eio(seg(t, at, at + 0.9)), w = n * 1.5 * p;
      A(ap(t, at - 0.2), () => hand(lab, 1080, y - 44, { size: 40, color: C.soft }));
      if (w > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(1080, y - 26, w, 52); ctx.clip();
        ctx.fillStyle = 'rgba(61,106,44,0.55)'; ctx.fillRect(1080, y - 26, w, 52);
        if (striped) { ctx.strokeStyle = 'rgba(168,71,42,0.7)'; ctx.lineWidth = 6; for (let x = 1060; x < 1080 + w + 60; x += 22) { ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(x + 40, y - 30); ctx.stroke(); } }
        ctx.restore();
        inkRect(1080, y - 26, w, 52, 1, { w: 2, col: C.ink });
      }
      A(seg(p, 0.8, 1), () => hand(String(n), 1080 + n * 1.5 + 18, y, { size: 54, weight: 600 }));
    };
    bar(380, 372, 'made both kinds (hybrid)', mid('c13', 0.35), true);
    bar(540, 193, 'made only round (pure)', mid('c13', 0.75), false);
    writeOn(t, s('c14', 0.3), `372 ÷ 193 = ${r2(372 / 193)}`, RX, 700, { size: 62, align: 'center' });
    writeOn(t, mid('c14', 0.55), 'predicted: 2 to 1', RX - 30, 800, { size: 50, color: C.green, align: 'center' });
    tick(RX + 180, 790, 44, seg(t, mid('c14', 0.8), e('c14')));
  });
}

// ---------- 4: two traits at once ----------
const GAM = ['RY', 'RG', 'WY', 'WG'];          // gametes: R or r, with Y or y (shown as letters below)
const GAM_TXT = ['RY', 'Ry', 'rY', 'ry'];
const phen = (a, b) => (a[0] === 'R' || b[0] === 'R' ? 'R' : 'W') + (a[1] === 'Y' || b[1] === 'Y' ? 'Y' : 'G');
function gamTxt(g, x, y, size = 36) {
  const cols = { R: C.green, r: C.terra, Y: C.gold, y: C.peaGEdge };
  const w = tw(g, size, { fam: HAND, weight: 600 }); let xx = x - w / 2;
  for (const ch of g) { hand(ch, xx, y, { size, weight: 600, color: cols[ch] }); xx += tw(ch, size, { fam: HAND, weight: 600 }); }
}
function part4(t) {
  const t0 = CH[3].at + 2.6;
  A(span(t, t0, s('d4', -0.05), 0.8, 0.6), () => {
    pea(330, 260, 58, { shape: 'R', col: 'Y', a: ap(t, s('d1', 0.6)) }); pea(680, 260, 58, { shape: 'W', col: 'G', a: ap(t, mid('d1', 0.6)), seed: 6 });
    A(ap(t, s('d1', 0.8)), () => txt('×', LX, 260, { size: 64, color: C.soft, align: 'center' }));
    A(ap(t, s('d1', 0.8)), () => hand('round, yellow', 330, 350, { size: 40, color: C.green, align: 'center' }));
    A(ap(t, mid('d1', 0.8)), () => hand('wrinkled, green', 680, 350, { size: 40, color: C.terra, align: 'center' }));
    arrow(LX, 390, LX, 450, seg(t, s('d2', 0.1), s('d2', 0.6)));
    pea(LX, 510, 46, { a: ap(t, s('d2', 0.4)) });
    A(ap(t, s('d2', 0.8)), () => hand('all round and yellow', LX, 590, { size: 40, color: C.green, align: 'center' }));
    arrow(LX, 630, LX, 700, seg(t, mid('d2', 0.5), mid('d2', 0.8)));
    pod(LX, 800, 420, ['RY', 'WY', 'RG', 'RY', 'WG', 'RY', 'RG', 'WY'], { a: ap(t, mid('d2', 0.6)), open: eio(seg(t, mid('d2', 0.75), e('d2', 0.2))), seed: 30 });
    A(ap(t, mid('d2', 0.75)), () => hand('15 plants, 556 seeds', LX, 905, { size: 40, color: C.soft, align: 'center' }));
  });
  // the four kinds, counted (each pea drawn = 5 seeds)
  const cellX = [1110, 1460], cellY = [300, 590], CW = 320, CHh = 270;
  const cellOf = (code) => [code[0] === 'W' ? 1 : 0, code[1] === 'G' ? 1 : 0];
  A(span(t, s('d3', -0.4), e('d7', 0.6), 0.5, 0.6), () => {
    A(ap(t, s('d3', -0.2)), () => {
      txt('round', cellX[0] + CW / 2, 274, { size: 34, italic: true, color: C.green, align: 'center' });
      txt('wrinkled', cellX[1] + CW / 2, 274, { size: 34, italic: true, color: C.terra, align: 'center' });
      hand('yellow', 1060, cellY[0] + 24, { size: 38, color: C.gold }); hand('green', 1060, cellY[1] + 24, { size: 38, color: C.peaGEdge });
      for (const x of cellX) for (const y of cellY) inkRect(x, y, CW, CHh, 1, { w: 2, col: C.soft });
      A(1 - seg(t, s('d7', 0.1), s('d7', 0.4)), () => txt('each pea drawn: 5 seeds', 1450, 896, { size: 32, italic: true, color: C.soft, align: 'center' }));
    });
    const times = [s('d3', 0.4), mid('d3', 0.35), mid('d3', 0.6), mid('d3', 0.85)];
    DI.forEach(([code, n, k9], i) => {
      const [cx, cy] = cellOf(code), x0 = cellX[cx], y0 = cellY[cy], m = Math.round(n / 5), at = times[i];
      for (let j = 0; j < m; j++) pea(x0 + 26 + (j % 11) * 26.5, y0 + 92 + Math.floor(j / 11) * 27, 11, { ...peaOf(code), a: ap(t, at + j * 0.012, 0.25), seed: j + i * 70 });
      A(ap(t, at), () => hand(String(n), x0 + 20, y0 + 44, { size: 54, weight: 600 }));
      A(ap(t, s('d6', 0.6) + i * 0.4), () => hand(`expected ${Math.round(DI_N * k9 / 16)}`, x0 + CW - 16, y0 + 44, { size: 38, color: C.gold, align: 'right' }));
    });
    // independent
    const sp = seg(t, s('d7', 0.3), s('d7', 0.9));
    A(sp, () => {
      ctx.save(); ctx.translate(1440, 932); ctx.rotate(-0.04); const sc = 0.82 * (1.15 - 0.15 * back(sp)); ctx.scale(sc, sc);
      ctx.strokeStyle = C.terra; ctx.lineWidth = 4; ctx.strokeRect(-250, -54, 500, 108); ctx.lineWidth = 2; ctx.strokeRect(-240, -44, 480, 88);
      txt('INDEPENDENT', 0, 4, { size: 64, weight: 600, color: C.terra, align: 'center', spacing: '6px' });
      ctx.restore();
    });
  });
  // the 4 × 4 square
  const SQ = { x0: 296, y0: 250, c: 104 };
  A(span(t, s('d4', -0.3), e('d7', 0.6), 0.5, 0.6), () => {
    const { x0, y0, c } = SQ, gp = seg(t, s('d4', 0.0), s('d4', 1.0));
    inkRect(x0, y0, 4 * c, 4 * c, gp, { w: 2.5 });
    for (let i = 1; i < 4; i++) { inkLine(x0 + i * c, y0, x0 + i * c, y0 + 4 * c, gp, { w: 1.8, seed: i }); inkLine(x0, y0 + i * c, x0 + 4 * c, y0 + i * c, gp, { w: 1.8, seed: i + 4 }); }
    GAM_TXT.forEach((g, i) => A(ap(t, s('d4', 0.6) + i * 0.1), () => { gamTxt(g, x0 + c * (i + 0.5), y0 - 30); gamTxt(g, x0 - 44, y0 + c * (i + 0.5)); }));
    const grpT = { RY: mid('d5', 0.4), WY: mid('d5', 0.55), RG: mid('d5', 0.68), WG: mid('d5', 0.8) };
    for (let n = 0; n < 16; n++) {
      const ci = n % 4, ri = Math.floor(n / 4), ph = phen(GAM[ci], GAM[ri]), cx = x0 + c * (ci + 0.5), cy = y0 + c * (ri + 0.5);
      const hl = span(t, grpT[ph], grpT[ph] + 1.4, 0.2, 0.5);
      if (hl > 0) A(hl, () => { ctx.fillStyle = ph === 'RY' ? C.goldWash : C.terraWash; ctx.fillRect(cx - c / 2 + 4, cy - c / 2 + 4, c - 8, c - 8); });
      pea(cx, cy, 28, { ...peaOf(ph), a: ap(t, mid('d4', 0.2) + n * 0.12, 0.3), seed: n });
    }
    A(ap(t, s('d5', 0.2)), () => {
      const y = 760; frac(3, 4, 330, y, { size: 46 }); hand('×', 380, y, { size: 46, align: 'center' }); frac(3, 4, 430, y, { size: 46 }); hand('=', 482, y, { size: 46, align: 'center' }); frac(9, 16, 545, y, { size: 46, color: C.gold });
      hand('round and yellow', 610, y, { size: 40, color: C.soft });
    });
    writeOn(t, mid('d5', 0.4), '9 : 3 : 3 : 1', LX, 880, { size: 72, align: 'center', color: C.gold });
  });
  // 27 kinds, and all 128 true-breeding combinations
  A(span(t, s('d8', -0.3), CH[4].at + 1.0, 0.5, 0.8), () => {
    for (let i = 0; i < 128; i++) {
      const col = i % 16, row = Math.floor(i / 16), x = 150 + col * 47, y = 236 + row * 60;
      const code = (i & 1 ? 'W' : 'R') + (i & 2 ? 'G' : 'Y'), band = [C.violet, '#D9D2BE'][(i >> 2) & 1];
      packet(x, y, 36, 48, { a: ap(t, s('d8', 0.5) + i * 0.025, 0.3), band, peaCode: code, seed: i });
    }
    A(ap(t, mid('d8', 0.6)), () => { const w = power('2', '7', LX - 90, 790, { size: 72, color: C.gold }); hand(' = 128', LX - 90 + w, 790, { size: 72, color: C.gold }); });
    A(ap(t, mid('d8', 0.7)), () => txt('true-breeding combinations', LX, 870, { size: 34, italic: true, color: C.soft, align: 'center' }));
    writeOn(t, s('d8', 0.3), 'three traits: 27 kinds', RX, 470, { size: 56, align: 'center' });
    writeOn(t, mid('d8', 0.55), 'seven traits: every pure line', RX, 580, { size: 50, align: 'center', color: C.green });
  });
}

// ---------- 5: forgotten and found ----------
const xYear = (y) => 150 + (y - 1860) * 32.4;
const AXY = 600;
function hawkweed(x, y, sc, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.strokeStyle = C.green; ctx.lineWidth = 3 / sc; ctx.beginPath(); ctx.moveTo(0, 0.05); ctx.quadraticCurveTo(0.08, 0.6, 0, 1.0); ctx.stroke();
    ctx.fillStyle = C.leaf; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 0.28, 0.95, 0.3, 0.08, sd * -0.3, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < 22; i++) { const th = (i / 22) * Math.PI * 2; ctx.save(); ctx.rotate(th); ctx.fillStyle = i % 2 ? '#E7C23C' : '#F0D25A'; ctx.beginPath(); ctx.ellipse(0.24, 0, 0.17, 0.045, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = '#C79A22'; ctx.beginPath(); ctx.arc(0, 0, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}
function nameCard(x, y, l1, l2, a, rot) {
  slip(x, y, 248, 170, { rot, fill: C.card, a });
  A(a, () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); txt(l1, 0, -40, { size: 36, align: 'center' }); txt(l2, 0, 6, { size: 36, weight: 600, align: 'center' }); ctx.restore(); });
}
function part5(t) {
  const t0 = CH[4].at + 2.6;
  A(span(t, t0, CH[5].at + 1.0, 0.8, 0.8), () => {
    const reach = [[t0 + 0.2, 1860], [s('h1', 1.2), 1866], [mid('h3', 0.5), 1866], [e('h3', 0.4), 1884], [s('h8'), 1884], [mid('h8', 0.55), 1900], [s('h11'), 1900], [mid('h11', 0.5), 1910]];
    let yr = 1860;
    for (let i = 0; i < reach.length - 1; i++) { const [ta, ya] = reach[i], [tb, yb] = reach[i + 1]; if (t >= ta) yr = lerp(ya, yb, eio(seg(t, ta, tb))); }
    inkLine(xYear(1860), AXY, xYear(yr), AXY, 1, { w: 3, col: C.soft });
    for (const [y, at, col, dx] of [[1865, s('h1', 0.6), C.ink, -34], [1866, s('h2', 0.6), C.ink, 34], [1884, mid('h7', 0.6), C.ink, 0], [1900, mid('h8', 0.5), C.gold, 0], [1906, mid('h11', 0.5), C.green, 0]]) {
      A(ap(t, at), () => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(xYear(y), AXY, 8, 0, Math.PI * 2); ctx.fill(); hand(String(y), xYear(y) + dx, AXY + 44, { size: 40, color: col, align: 'center' }); });
    }
    // two lectures, about forty listening
    A(ap(t, s('h1', 0.6)), () => txt('two lectures, Brno', 292, 320, { size: 36, italic: true, align: 'center' }));
    for (let i = 0; i < 40; i++) {
      const col = i % 10, row = Math.floor(i / 10), x = 292 + (col - 4.5) * 22 + (row % 2) * 6, y = 380 + row * 34;
      A(ap(t, s('h2', 0.1) + i * 0.035, 0.3), () => { ctx.fillStyle = 'rgba(46,51,38,0.75)'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y + 14, 10, 6, 0, Math.PI, 0); ctx.fill(); });
    }
    A(ap(t, mid('h2', 0.35)), () => hand('about forty listened', 292, 530, { size: 34, color: C.soft, align: 'center' }));
    // the paper
    const pp = ap(t, mid('h2', 0.5));
    slip(380, 790, 320, 200, { rot: -0.02, fill: C.card, a: pp });
    A(pp, () => { ctx.save(); ctx.translate(380, 790); ctx.rotate(-0.02); txt('Versuche über', 0, -48, { size: 34, weight: 600, italic: true, align: 'center' }); txt('Pflanzen-Hybriden', 0, -6, { size: 34, weight: 600, italic: true, align: 'center' }); hand('Brünn, 1866', 0, 50, { size: 36, color: C.soft, align: 'center' }); ctx.restore(); });
    A(ap(t, s('h3', 0.6)), () => hand('read as a paper on hybrids', 380, 935, { size: 36, color: C.terra, align: 'center' }));
    // cited about three times; only some plants?
    A(ap(t, mid('h3', 0.55)), () => { hand('cited about 3 times', 660, 400, { size: 40, align: 'center' }); hand('in 35 years', 660, 446, { size: 34, color: C.soft, align: 'center' }); });
    A(ap(t, s('h5', 0.5)), () => hand('only for some plants?', 660, 520, { size: 36, color: C.terra, align: 'center' }));
    // hawkweed
    hawkweed(780, 720, 120, ap(t, s('h6', 0.2)));
    A(ap(t, s('h6', 0.8)), () => hand('hawkweed: no clean ratios', 780, 900, { size: 36, color: C.terra, align: 'center' }));
    A(ap(t, mid('h6', 0.7)), () => hand('seeds without fertilisation', 780, 944, { size: 34, color: C.soft, align: 'center' }));
    // abbot, died
    A(ap(t, s('h7', 0.3)), () => { inkLine(xYear(1868), AXY - 10, xYear(1868), AXY - 30, 1, { w: 2.5, col: C.soft }); hand('abbot', xYear(1868) + 14, 568, { size: 38, color: C.soft }); });
    // 1900: three scientists, three countries
    A(ap(t, mid('h8', 0.5)), () => hand('spring 1900', xYear(1900), 540, { size: 42, color: C.gold, align: 'center' }));
    const NM = [['Hugo', 'de Vries', 'Netherlands'], ['Carl', 'Correns', 'Germany'], ['Erich von', 'Tschermak', 'Austria']], cx = [1140, 1420, 1700];
    NM.forEach(([a1, a2, country], i) => {
      const q = eio(seg(t, e('h8', -0.8) + i * 0.25, e('h8', 0.2) + i * 0.25)), rot = (i - 1) * 0.02;
      ctx.save(); ctx.translate((1 - q) * 300, 0);
      nameCard(cx[i], 350, a1, a2, q, rot);
      A(q * ap(t, [s('h9', 0.8), mid('h9', 0.45), mid('h9', 0.75)][i]), () => hand(country, cx[i], 410, { size: 34, color: C.soft, align: 'center' }));
      ctx.restore();
    });
    A(ap(t, mid('h10', 0.15), 0.3), () => hand('?', 1790, 300, { size: 100, color: C.terra, align: 'center' }));
    A(ap(t, mid('h10', 0.65)), () => hand('how much from Mendel?', 1140, 480, { size: 34, color: C.terra, align: 'center' }));
    // genetics
    A(ap(t, mid('h11', 0.6)), () => {
      hand('genetics', xYear(1906) - 40, 740, { size: 72, color: C.green, align: 'center' });
      txt('William Bateson,', 1810, 820, { size: 34, italic: true, align: 'right' }); txt('“Mendel’s bulldog”', 1810, 864, { size: 34, italic: true, align: 'right', color: C.soft });
    });
  });
}

// ---------- 6: chance in every pod ----------
const yOfR = (r) => 820 - (clamp(r, 1, 8) - 1) * (600 / 7);
const xOfN = (n) => 170 + ((Math.log10(n) - 1) / (Math.log10(7324) - 1)) * 700;
const near = (x) => (Math.abs(x - Math.round(x)) < 0.05 ? String(Math.round(x)) : r2(x));
const DEMO = (() => { const rnd = mulberry32(101); return Array.from({ length: 8 }, () => [rnd() < 0.5 ? 'R' : 'r', rnd() < 0.5 ? 'R' : 'r']); })();
function ledgerRow(t, at, y, cells, xs, als, cols, size = 40) {
  cells.forEach((c, j) => writeOn(t, at + j * 0.1, String(c), xs[j], y, { base: 'alphabetic', size, align: als[j], color: cols[j], dur: 0.3 }));
}
function part6(t) {
  const t0 = CH[5].at + 2.6;
  const XS = [1070, 1380, 1580, 1790], LXS = [160, 470, 680, 870], ALS = ['left', 'right', 'right', 'right'], COLS = [C.soft, C.green, C.terra, C.gold];
  // Mendel's first ten plants, with the share of wrinkled seeds on the left
  A(span(t, t0, e('p7', 0.6), 0.8, 0.6), () => {
    writeOn(t, t0 + 0.3, 'Mendel’s first ten plants', 1062, base(1), { base: 'alphabetic', size: 44 });
    A(ap(t, s('p2', 0.2)), () => ['plant', 'round', 'wrinkled', 'ratio'].forEach((h, j) => txt(h, XS[j], base(2), { size: 32, italic: true, color: C.soft, align: ALS[j], base: 'alphabetic' })));
    FIRST10.forEach(([a, b], i) => {
      const at = i < 3 ? [mid('p2', 0.36), mid('p2', 0.62), mid('p2', 0.82)][i] : e('p2', -0.3) + (i - 3) * 0.15;
      ledgerRow(t, at, base(3 + i), [i + 1, a, b, r2(a / b)], XS, ALS, COLS);
    });
    ring(1745, base(6) - 14, 62, 30, seg(t, s('p3', 0.3), s('p3', 0.9)));
    writeOn(t, mid('p3', 0.62), 'and one plant: 43 to 2', 1062, base(13), { base: 'alphabetic', size: 44, color: C.terra });
  });
  A(span(t, t0 + 0.4, s('p5', 0.2), 0.8, 0.5), () => {
    const x0 = 180, x1 = 800;
    A(ap(t, s('p2', 0.2)), () => {
      hand('share of each plant’s seeds', 180, base(1), { base: 'alphabetic', size: 40, color: C.soft });
      inkLine(lerp(x0, x1, 0.75), lineY(2), lerp(x0, x1, 0.75), lineY(13) - 20, 1, { w: 2.5, col: C.gold, dash: [8, 8] });
      hand('3 : 1', lerp(x0, x1, 0.75), base(2) - 8, { size: 38, color: C.gold, align: 'center', base: 'alphabetic' });
    });
    FIRST10.forEach(([a, b], i) => {
      const at = i < 3 ? [mid('p2', 0.36), mid('p2', 0.62), mid('p2', 0.82)][i] : e('p2', -0.3) + (i - 3) * 0.15;
      const p = eio(seg(t, at, at + 0.6)), y = base(3 + i) - 14, f = a / (a + b), w = (x1 - x0) * p;
      if (w <= 0) return;
      ctx.fillStyle = 'rgba(61,106,44,0.6)'; ctx.fillRect(x0, y - 15, Math.min(w, (x1 - x0) * f), 30);
      if (w > (x1 - x0) * f) { ctx.fillStyle = 'rgba(168,71,42,0.65)'; ctx.fillRect(x0 + (x1 - x0) * f, y - 15, w - (x1 - x0) * f, 30); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y - 15, w, 30);
    });
    A(ap(t, s('p4', 0.8)), () => {
      pollen(250, 912, 'R', 1, 22); egg(330, 912, 'r', 1, 28);
      hand('chance pairs pollen and egg', 380, 922, { size: 40, color: C.gold });
    });
  });
  // the simulator: pollen R or r, egg R or r, for every seed
  A(span(t, s('p5', -0.2), s('p6', 0.4), 0.5, 0.5), () => {
    const st = s('p5', 0.8), step = Math.max(0.35, (e('p5', -0.2) - st) / DEMO.length);
    const i = clamp(Math.floor((t - st) / step), 0, DEMO.length - 1), u = (t - st) / step - i, flip = t < st ? 1 : u < 0.3 ? Math.abs(Math.cos((u / 0.3) * Math.PI)) : 1;
    const [pl, eg] = DEMO[i];
    A(ap(t, s('p5', 0.2)), () => {
      ctx.save(); ctx.translate(330, 300); ctx.scale(t < st ? 1 : Math.max(0.1, flip), 1); pollen(0, 0, t < st ? '?' : pl, 1, 44); ctx.restore();
      ctx.save(); ctx.translate(560, 300); ctx.scale(t < st ? 1 : Math.max(0.1, flip), 1); egg(0, 0, t < st ? '?' : eg, 1, 54); ctx.restore();
      hand('pollen', 330, 384, { size: 36, color: C.soft, align: 'center' }); hand('egg', 560, 384, { size: 36, color: C.soft, align: 'center' });
      txt('×', 445, 300, { size: 52, color: C.soft, align: 'center' });
    });
    DEMO.forEach(([a, b], j) => {
      const at = st + j * step + step * 0.6;
      pea(170 + j * 86, 520, 30, { shape: a === 'r' && b === 'r' ? 'W' : 'R', a: ap(t, at, 0.3), seed: j + 40 });
      A(ap(t, at, 0.3), () => genoTxt(geno(a, b), 170 + j * 86, 590, 36));
    });
    A(ap(t, mid('p5', 0.7)), () => hand('a quarter of seeds come out r r', LX, 690, { size: 40, color: C.terra, align: 'center' }));
  });
  // ten imaginary plants, the same sizes as Mendel's first ten
  A(span(t, s('p6', -0.2), e('p7', 0.6), 0.5, 0.6), () => {
    writeOn(t, s('p6', 0.2), 'ten imaginary plants', 160, base(1), { base: 'alphabetic', size: 44, color: C.gold });
    A(ap(t, s('p6', 0.3)), () => {
      for (let kk = 2; kk <= 12; kk++) inkLine(140, lineY(kk), 900, lineY(kk), 1, { w: 1.3, col: C.rule, seed: kk, wob: 0.5 });
      ['plant', 'round', 'wrinkled', 'ratio'].forEach((h, j) => txt(h, LXS[j], base(2), { size: 32, italic: true, color: C.soft, align: ALS[j], base: 'alphabetic' }));
    });
    TEN.forEach(([a, b], i) => ledgerRow(t, s('p6', 0.6) + i * 0.22, base(3 + i), [i + 1, a, b, r2(a / b)], LXS, ALS, COLS));
    for (const i of [TEN_LO, TEN_HI]) ring(LXS[3] - 44, base(3 + i) - 14, 62, 30, seg(t, s('p7', 0.6) + (i === TEN_HI ? 1.2 : 0), s('p7', 1.2) + (i === TEN_HI ? 1.2 : 0)), { col: C.gold });
  });
  // seed after seed: the running ratio settles
  const anchors = [[s('p8', 0.2), 10], [s('p9', 0.9), 40], [mid('p9', 0.75), 400], [s('p10', 1.6), 7324]];
  let nNow = 10;
  for (let i = 0; i < anchors.length - 1; i++) { const [ta, na] = anchors[i], [tb, nb] = anchors[i + 1]; if (t >= ta) nNow = Math.pow(10, lerp(Math.log10(na), Math.log10(nb), eio(seg(t, ta, tb)))); }
  nNow = Math.round(nNow);
  A(span(t, s('p8', -0.4), CH[6].at + 1.0, 0.6, 0.8), () => {
    inkLine(170, 820, 875, 820, 1, { w: 2.5, col: C.soft }); inkLine(170, 220, 170, 820, 1, { w: 2.5, col: C.soft, seed: 3 });
    for (let r = 1; r <= 8; r++) { inkLine(162, yOfR(r), 170, yOfR(r), 1, { w: 2 }); hand(String(r), 148, yOfR(r), { size: 32, color: C.soft, align: 'right' }); }
    for (const n of [10, 100, 1000, 7324]) { const x = xOfN(n); inkLine(x, 820, x, 830, 1, { w: 2 }); hand(fmt(n), x, 862, { size: 34, color: C.soft, align: 'center' }); }
    inkLine(170, yOfR(3), 875, yOfR(3), 1, { w: 2.5, col: C.gold, dash: [8, 8] });
    hand('3 : 1', 184, yOfR(3) + 30, { size: 40, color: C.gold });
    txt('seeds counted', 520, 905, { size: 32, italic: true, color: C.soft, align: 'center' });
    hand('round per wrinkled', 870, 236, { size: 36, color: C.soft, align: 'right' });
    // the line
    ctx.save(); ctx.beginPath(); ctx.rect(150, 200, 760, 640); ctx.clip();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath();
    let started = false;
    for (let j = 0; j <= 400; j++) {
      const n = Math.round(Math.pow(10, lerp(1, Math.log10(7324), j / 400)));
      if (n > nNow) break;
      const r = hRatio(n), x = xOfN(n), y = yOfR(r);
      started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true;
    }
    if (started) { ctx.lineTo(xOfN(nNow), yOfR(hRatio(nNow))); ctx.stroke(); }
    ctx.restore();
    pea(xOfN(nNow), yOfR(hRatio(nNow)), 12, { a: ap(t, s('p8', 0.2)) });
    if (nNow >= 40) A(ap(t, anchors[1][0], 0.3), () => hand(`${near(hRatio(40))} to 1`, xOfN(40) + 16, yOfR(hRatio(40)) - 30, { size: 40, color: C.terra }));
    if (nNow >= 400) A(ap(t, anchors[2][0], 0.3), () => hand(`${r2(hRatio(400))} to 1`, xOfN(400) + 6, yOfR(hRatio(400)) - 46, { size: 40, color: C.terra, align: 'center' }));
    if (nNow >= 7324) A(ap(t, anchors[3][0], 0.4), () => hand(`${r2(hRatio(7324))} to 1`, xOfN(7324) - 10, yOfR(hRatio(7324)) - 56, { size: 50, weight: 600, color: C.gold, align: 'right' }));
    A(ap(t, e('p10', 0.6)), () => { inkLine(xOfN(7324) + 18, yOfR(3), xOfN(7324) + 18, yOfR(hRatio(7324)), 1, { w: 3, col: C.terra }); hand('not exactly 3', 760, yOfR(3) + 48, { size: 38, color: C.terra, align: 'center' }); });
    // the counters
    const W_ = HARV[nNow - 1], R_ = nNow - W_;
    const row = (lab, val, y, col, size = 72) => { hand(lab, 1080, y, { size: 44, color: C.soft }); hand(val, 1780, y, { size, weight: 600, color: col, align: 'right' }); };
    A(ap(t, s('p8', 0.0)), () => {
      row('seeds', fmt(nNow), 290, C.ink); row('round', fmt(R_), 400, C.green); row('wrinkled', fmt(W_), 510, C.terra);
      under(1080, 1780, 572, 1, { col: C.soft });
      row('ratio', W_ ? `${r2(R_ / W_)} to 1` : '–', 650, C.gold, 80);
    });
    const qp = ap(t, s('p11', 0.1), 0.7);
    slip(RX, 850, 800, 200, { rot: 0.012, fill: C.card, a: qp });
    A(qp, () => {
      ctx.save(); ctx.translate(RX, 850); ctx.rotate(0.012);
      txt('“the larger their number is, the more', 0, -48, { size: 36, italic: true, align: 'center' });
      txt('mere chance effects are eliminated”', 0, -6, { size: 36, italic: true, align: 'center' });
      hand('Mendel, 1866', 0, 50, { size: 38, color: C.soft, align: 'center' });
      ctx.restore();
    });
  });
}

// ---------- 7: too good to be true? ----------
const xz = (z) => LX + z * 118;
const xc = (c) => 170 + c * (680 / 22);
function quoteSlip(x, y, w, h, lines, who, a, { rot = -0.012, size = 38 } = {}) {
  slip(x, y, w, h, { rot, fill: C.card, a });
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const top = -((lines.length - 1) * size * 1.25) / 2 - 24;
    lines.forEach((ln, i) => txt(ln, 0, top + i * size * 1.25, { size, italic: true, align: 'center' }));
    hand(who, 0, top + lines.length * size * 1.25 + 16, { size: 40, color: C.soft, align: 'center' });
    ctx.restore();
  });
}
function part7(t) {
  const t0 = CH[6].at + 2.6;
  // Fisher's paper, and how far honest counts miss
  A(span(t, t0, s('f3', 0.15), 0.8, 0.6), () => {
    const sp = ap(t, t0 + 0.2);
    slip(RX, 330, 780, 260, { rot: 0.01, fill: C.card, a: sp });
    A(sp, () => {
      ctx.save(); ctx.translate(RX, 330); ctx.rotate(0.01);
      txt('R. A. Fisher, 1936', 0, -66, { size: 48, weight: 600, align: 'center' });
      txt('“Has Mendel’s work been rediscovered?”', 0, 4, { size: 36, italic: true, align: 'center' });
      hand('Annals of Science', 0, 68, { size: 38, color: C.soft, align: 'center' });
      ctx.restore();
    });
    writeOn(t, mid('f2', 0.55), 'missed by too little?', RX, 640, { size: 60, color: C.terra, align: 'center' });
    const bp = seg(t, s('f2', 0.0), s('f2', 1.4));
    A(bp > 0 ? 1 : 0, () => {
      inkLine(xz(-3), 700, xz(3), 700, 1, { w: 2.5, col: C.soft });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath();
      const n = Math.ceil(80 * bp);
      for (let i = 0; i <= n; i++) { const z = -3 + 6 * (i / 80), x = xz(z), y = 700 - 330 * Math.exp(-z * z / 2); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    });
    A(ap(t, s('f2', 0.8)), () => {
      hand('how far honest counts usually miss', LX, 300, { size: 38, color: C.soft, align: 'center' });
      inkLine(xz(-1), 744, xz(1), 744, 1, { w: 2.5, col: C.soft }); for (const z of [-1, 1]) inkLine(xz(z), 734, xz(z), 754, 1, { w: 2.5, col: C.soft });
      hand('a typical miss', LX, 786, { size: 36, color: C.soft, align: 'center' });
    });
    const order = ZS.map((z, i) => [z, i]).sort((a, b) => a[0] - b[0]), placed = [];
    order.forEach(([z, i], j) => {
      const x = xz(z); let lvl = 0;
      while (placed.some(([px, pl]) => pl === lvl && Math.abs(px - x) < 27)) lvl++;
      placed.push([x, lvl]);
      pea(x, 686 - lvl * 27, 13, { a: ap(t, mid('f2', 0.55) + j * 0.1), seed: i });
    });
    A(ap(t, mid('f2', 0.7)), () => hand('Mendel’s seven totals', LX, 860, { size: 40, color: C.terra, align: 'center' }));
  });
  // 1,000 gardens run by chance alone
  A(span(t, s('f3', -0.3), e('f5', 0.6), 0.5, 0.6), () => {
    const shown = Math.floor(1000 * eio(seg(t, s('f3', 0.6), mid('f3', 0.62)))), bins = new Array(23).fill(0), good = new Array(23).fill(0);
    for (let g = 0; g < shown; g++) { const b = Math.min(22, Math.floor(GARD[g])); bins[b]++; if (GARD[g] <= M_CHI) good[b]++; }
    const hl = ap(t, mid('f3', 0.66), 0.5), bw = 680 / 22;
    for (let b = 0; b < 22; b++) {
      const h = bins[b] * 3.0, x = xc(b) + 2;
      if (h <= 0) continue;
      ctx.fillStyle = 'rgba(45,40,28,0.16)'; ctx.fillRect(x, 780 - h, bw - 4, h);
      ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.strokeRect(x, 780 - h, bw - 4, h);
      if (good[b] && hl > 0) A(hl, () => { ctx.fillStyle = 'rgba(168,71,42,0.75)'; ctx.fillRect(x, 780 - good[b] * 3.0, bw - 4, good[b] * 3.0); });
    }
    inkLine(170, 780, 860, 780, 1, { w: 2.5, col: C.soft });
    A(ap(t, s('f3', 0.4)), () => {
      inkLine(xc(M_CHI), 250, xc(M_CHI), 780, 1, { w: 3, col: C.terra });
      hand('Mendel', xc(M_CHI) + 12, 262, { size: 40, color: C.terra });
      hand('closer to 3 : 1', 176, 822, { size: 34, color: C.soft }); hand('further', 856, 822, { size: 34, color: C.soft, align: 'right' });
      txt('1,000 imaginary gardens, chance alone', LX, 900, { size: 32, italic: true, color: C.soft, align: 'center' });
    });
    A(ap(t, mid('f3', 0.75)), () => hand(`${G_GOOD} of 1,000`, 420, 380, { size: 60, weight: 600, color: C.terra }));
    A(ap(t, s('f4', 0.2)), () => hand('about 1 in 20', 420, 450, { size: 46, color: C.terra }));
    // the right page: the seven totals, lucky again and again
    writeOn(t, s('f3', 0.3), 'Mendel’s seven totals', 1062, base(1), { base: 'alphabetic', size: 44 });
    EXPTS.forEach(([name, d, r], i) => {
      ledgerRow(t, s('f3', 0.5) + i * 0.15, base(2 + i), [name, r2(d / r)], [1062, 1700], ['left', 'right'], [C.ink, C.gold]);
      tick(1760, base(2 + i) - 16, 34, seg(t, s('f5', 0.3) + i * 0.22, s('f5', 0.6) + i * 0.22), C.gold, 4);
    });
    writeOn(t, mid('f5', 0.5), 'lucky, again and again?', 1062, base(10), { base: 'alphabetic', size: 48, color: C.terra });
  });
  // the test of ten offspring
  A(span(t, s('f6', -0.3), e('f8', 0.8), 0.5, 0.6), () => {
    A(ap(t, s('f6', 0.2)), () => { hand('a round plant: pure, or hybrid?', LX, 196, { size: 40, align: 'center' }); pea(LX, 262, 30); });
    arrow(LX, 300, LX, 360, seg(t, s('f6', 0.6), s('f6', 1.1)));
    A(ap(t, mid('f6', 0.5)), () => hand('grow ten of its seeds', LX, 396, { size: 36, color: C.soft, align: 'center' }));
    for (let i = 0; i < 10; i++) {
      const x = 196 + i * 68, q = seg(t, mid('f6', 0.55) + i * 0.08, mid('f6', 0.55) + i * 0.08 + 0.6);
      sprig(x, 470, 64, q);
      const r = ap(t, s('f7', 0.3) + i * 0.12, 0.3);
      A(r, () => { ctx.fillStyle = 'rgba(61,106,44,0.85)'; ctx.beginPath(); ctx.arc(x, 530, 9, 0, Math.PI * 2); ctx.fill(); });
    }
    A(ap(t, s('f7', 1.6)), () => hand('all ten look dominant: counted as pure', LX, 586, { size: 38, color: C.terra, align: 'center' }));
    A(ap(t, mid('f7', 0.4)), () => {
      const y = 676; hand('(', 300, y, { size: 64, align: 'center' }); frac(3, 4, 336, y, { size: 44 }); hand(')', 372, y, { size: 64, align: 'center' });
      hand('10', 404, y - 30, { size: 36, align: 'center' }); hand(`≈ ${(MISS10 * 100).toFixed(1)}%`, 440, y, { size: 56 });
    });
    writeOn(t, mid('f7', 0.62), `expect about ${FISHER.toFixed(1)} hybrids per pure plant`, LX, 790, { size: 44, color: C.gold, align: 'center' });
    writeOn(t, mid('f7', 0.9), 'not 2', LX, 860, { size: 48, color: C.soft, align: 'center' });
    // the right page: his six tests
    writeOn(t, s('f6', 0.3), 'his six tests of 100 plants', 1062, base(1), { base: 'alphabetic', size: 44 });
    A(ap(t, s('f6', 0.5)), () => [['pure', 1600], ['hybrid', 1790]].forEach(([h, x]) => txt(h, x, base(2), { size: 32, italic: true, color: C.soft, align: 'right', base: 'alphabetic' })));
    TESTS.forEach(([name, pu, hy], i) => ledgerRow(t, s('f6', 0.8) + i * 0.3, base(3 + i), [name, pu, hy], [1062, 1600, 1790], ['left', 'right', 'right'], [C.ink, C.green, C.terra]));
    const tt = s('f8', 0.2);
    A(ap(t, tt), () => { inkLine(1062, lineY(9) - 3, 1800, lineY(9) - 2, 1, { w: 2, col: C.soft }); inkLine(1062, lineY(9) + 3, 1800, lineY(9) + 4, 1, { w: 2, col: C.soft, seed: 4 }); });
    ledgerRow(t, tt + 0.2, base(10), ['total', T_PURE, T_HYB], [1062, 1600, 1790], ['left', 'right', 'right'], [C.ink, C.green, C.terra], 44);
    writeOn(t, mid('f8', 0.6), `1 : ${r2(T_HYB / T_PURE)}`, 1790, base(11) + 8, { base: 'alphabetic', size: 56, weight: 600, color: C.gold, align: 'right' });
    writeOn(t, mid('f8', 0.8), `Fisher expected 1 : ${FISHER.toFixed(2)}`, 1062, base(13), { base: 'alphabetic', size: 42, color: C.soft });
  });
  // Fisher's verdict
  A(span(t, s('f9', -0.3), mid('f10', 0.6), 0.5, 0.6), () => {
    veil(0.6);
    quoteSlip(LX, 500, 800, 470, ['“the data of most, if not all,', 'of the experiments have been', 'falsified so as to agree closely', 'with Mendel’s expectations”'], 'R. A. Fisher, 1936', ap(t, s('f9', 0.0), 0.6));
    A(ap(t, mid('f9', 0.6)), () => { hand('and an assistant “who knew', LX, 840, { size: 40, color: C.terra, align: 'center' }); hand('too well what was expected”?', LX, 892, { size: 40, color: C.terra, align: 'center' }); });
  });
  // the defence
  A(span(t, s('f10', -0.3), e('f11', 0.8), 0.5, 0.6), () => {
    A(ap(t, s('f10', 0.2)), () => txt('Daniel Hartl, Daniel Fairbanks', 1062, base(2), { size: 40, weight: 600, base: 'alphabetic' }));
    writeOn(t, mid('f10', 0.45), 'more than ten seedlings, probably', 1062, base(4), { base: 'alphabetic', size: 46 });
    writeOn(t, mid('f10', 0.75), 'fraud charge: put to rest', 1062, base(5), { base: 'alphabetic', size: 46, color: C.green });
    const bk = ap(t, s('f11', 0.0), 0.7);
    A(bk, () => {
      ctx.save(); ctx.translate(LX, 540 + (1 - bk) * 20); ctx.rotate(-0.03);
      ctx.shadowColor = 'rgba(40,30,10,0.3)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#4B5E3A'; ctx.fillRect(-190, -250, 380, 500); ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#3A4A2C'; ctx.fillRect(-190, -250, 34, 500);
      ctx.strokeStyle = '#C9B37A'; ctx.lineWidth = 2; ctx.strokeRect(-140, -220, 300, 440);
      for (const [ln, y] of [['Ending the', -120], ['Mendel–Fisher', -66], ['Controversy', -12]]) txt(ln, 10, y, { size: 44, weight: 600, color: '#F1E6C2', align: 'center' });
      hand('2008', 10, 70, { size: 48, color: '#E3D39C', align: 'center' });
      pod(10, 160, 170, ['R', 'R', 'W', 'R'], { seed: 51 });
      ctx.restore();
    });
    writeOn(t, mid('f11', 0.7), 'no reason to think he made up results', 1062, base(7), { base: 'alphabetic', size: 44 });
  });
  // Edwards, and the 2019 reanalysis
  A(span(t, s('f12', -0.3), s('f17', 0.15), 0.5, 0.6), () => {
    const bar = (x, v, lab, col, at, dashed, lo = null, hi = null) => {
      const p = eio(seg(t, at, at + 0.9)), h = v * 4.4 * p;
      if (h <= 0) return;
      if (dashed) inkRect(x - 52, 800 - h, 104, h, 1, { w: 2.5, col: C.soft, dash: [7, 6] });
      else { ctx.fillStyle = col; ctx.fillRect(x - 52, 800 - h, 104, h); inkRect(x - 52, 800 - h, 104, h, 1, { w: 2, col: C.ink }); }
      if (lo !== null) A(seg(p, 0.8, 1), () => { const y0 = 800 - lo * 4.4, y1 = 800 - hi * 4.4; inkLine(x, y0, x, y1, 1, { w: 3 }); inkLine(x - 16, y0, x + 16, y0, 1, { w: 3 }); inkLine(x - 16, y1, x + 16, y1, 1, { w: 3 }); });
      A(seg(p, 0.7, 1), () => { const [l1, l2] = lab.split(': '); hand(l1, x, 842, { size: 36, color: C.soft, align: 'center' }); hand(l2, x, 886, { size: 40, weight: 600, color: dashed ? C.soft : C.ink, align: 'center' }); });
    };
    inkLine(150, 800, 870, 800, ap(t, s('f12', 0.2)), { w: 2.5, col: C.soft });
    A(ap(t, s('f12', 0.3)), () => hand('Edwards: 84 ratios', 320, 300, { size: 42, align: 'center' }));
    bar(250, 84, 'chance: 84', null, s('f12', 0.5), true);
    bar(390, 48.9, 'found: 49', 'rgba(168,71,42,0.7)', mid('f12', 0.6), false);
    A(ap(t, s('f15', 0.2)), () => hand('2019: with his extremes', 690, 300, { size: 42, color: C.gold, align: 'center' }));
    bar(620, 88, 'chance: 88', null, s('f15', 0.5), true);
    bar(760, 88.4, 'found: 86 to 91', 'rgba(61,106,44,0.6)', mid('f15', 0.5), false, 86.2, 90.6);
    A(ap(t, s('f12', 0.3)), () => txt('total scatter, against what chance gives', LX, 948, { size: 32, italic: true, color: C.soft, align: 'center' }));
    quoteSlip(RX, 520, 820, 560, ['“One can applaud the lucky gambler;', 'but when he is lucky again to-morrow,', 'and the next day, and the following', 'day, one is entitled to become', 'a little suspicious.”'], 'A. W. F. Edwards', ap(t, s('f13', -0.2), 0.6) * (1 - seg(t, s('f15', -0.2), s('f15', 0.4))), { size: 38, rot: 0.01 });
    writeOn(t, s('f16', 0.4), 'left out: small experiments', RX, 560, { size: 52, color: C.terra, align: 'center' });
    writeOn(t, mid('f16', 0.6), 'that strayed', RX, 640, { size: 52, color: C.terra, align: 'center' });
  });
  // the open question
  A(span(t, s('f17', -0.3), CH[7].at + 1.0, 0.5, 0.8), () => {
    pod(LX, 520, 520, ['R', 'R', 'W', 'R', 'R', 'R', 'W', 'R'], { seed: 61, open: eio(seg(t, s('f17', 0.0), s('f17', 1.0))) });
    writeOn(t, s('f17', 0.5), 'chosen?  counted?  reported?', RX, 450, { size: 58, align: 'center' });
    writeOn(t, mid('f17', 0.7), 'grown: yes', RX - 40, 580, { size: 56, color: C.green, align: 'center' });
    tick(RX + 110, 570, 50, seg(t, e('f17', -0.5), e('f17', 0.2)));
  });
}

// ---------- 8: what the wrinkle is ----------
function cutSeed(x, y, r, kind, a, grains = 1) {
  A(a, () => {
    pea(x, y, r, { shape: kind, seed: 77 });
    if (grains <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * 0.86, 0, Math.PI * 2); ctx.clip();
    A(grains, () => {
      ctx.fillStyle = 'rgba(250,246,226,0.75)'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      const rnd = mulberry32(kind === 'R' ? 3 : 4), n = kind === 'R' ? 26 : 34;
      for (let i = 0; i < n; i++) {
        const th = rnd() * 6.28, rr = Math.sqrt(rnd()) * r * 0.78, gx = x + Math.cos(th) * rr, gy = y + Math.sin(th) * rr;
        if (kind === 'R') { ctx.fillStyle = 'rgba(214,200,150,0.9)'; ctx.strokeStyle = 'rgba(120,100,60,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(gx, gy, 15, 11, th, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(214,200,150,0.9)'; ctx.strokeStyle = 'rgba(120,100,60,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(gx, gy, 6 + rnd() * 4, 4 + rnd() * 3, th, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
    });
    ctx.restore();
  });
}
function geneBar(x0, x1, y, { a = 1, col = C.green, gap = 0, gapAt = 1400, insert = 0 } = {}) {
  A(a, () => {
    const h = 40, segs = gap > 0 ? [[x0, gapAt - gap / 2], [gapAt + gap / 2, x1]] : [[x0, x1]];
    for (const [ax, bx] of segs) {
      ctx.fillStyle = col === C.green ? 'rgba(61,106,44,0.3)' : 'rgba(61,106,44,0.3)'; ctx.fillRect(ax, y - h / 2, bx - ax, h);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(ax, y - h / 2, bx - ax, h);
      ctx.strokeStyle = 'rgba(45,40,28,0.35)'; ctx.lineWidth = 1.5;
      for (let x = ax + 14; x < bx - 6; x += 14) { ctx.beginPath(); ctx.moveTo(x, y - h / 2 + 6); ctx.lineTo(x, y + h / 2 - 6); ctx.stroke(); }
    }
    if (insert > 0) A(insert, () => {
      const w = gap, yy = y - (1 - eout(insert)) * 90;
      ctx.fillStyle = 'rgba(168,71,42,0.75)'; ctx.fillRect(gapAt - w / 2, yy - 20, w, 40);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.strokeRect(gapAt - w / 2, yy - 20, w, 40);
    });
  });
}
function part8(t) {
  const t0 = CH[7].at + 2.6;
  // round and wrinkled seeds, and their starch
  A(span(t, t0, e('w4', 0.6), 0.8, 0.6), () => {
    const g = ap(t, s('w2', 0.2), 0.8);
    cutSeed(300, 440, 130, 'R', ap(t, t0 + 0.2), g); cutSeed(710, 440, 130, 'W', ap(t, t0 + 0.5), g);
    A(ap(t, t0 + 0.4), () => { hand('round', 300, 620, { size: 44, color: C.green, align: 'center' }); hand('wrinkled', 710, 620, { size: 44, color: C.terra, align: 'center' }); });
    A(g, () => { hand('big starch grains', 300, 680, { size: 36, color: C.soft, align: 'center' }); hand('few, small grains', 710, 680, { size: 36, color: C.soft, align: 'center' }); });
    A(ap(t, t0 + 0.3) * (1 - seg(t, s('w3', -0.4), s('w3', 0.1))), () => { hand('1990', RX, 300, { size: 120, color: C.gold, align: 'center' }); writeOn(t, s('w1', 0.6), 'what the wrinkle is made of', RX, 400, { size: 46, color: C.soft, align: 'center' }); });
  });
  // the enzyme: it branches starch
  A(span(t, s('w2', -0.2), e('w2', 0.8), 0.5, 0.6), () => {
    A(ap(t, s('w2', 0.2)), () => txt('starch-branching enzyme 1', RX, 500, { size: 42, italic: true, align: 'center' }));
    const bp = seg(t, s('w2', 0.4), e('w2', -0.2));
    for (let i = 0; i < 22; i++) { const x = 1110 + i * 30; ctx.fillStyle = 'rgba(214,200,150,1)'; ctx.strokeStyle = 'rgba(120,100,60,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, 650, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    [3, 9, 15].forEach((bi, j) => {
      const q = seg(bp, j * 0.3, j * 0.3 + 0.35);
      for (let m = 1; m <= Math.round(5 * q); m++) { const x = 1110 + bi * 30 + m * 21, y = 650 - m * 21; ctx.fillStyle = 'rgba(214,200,150,1)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    });
    const ex = 1110 + lerp(3, 15, bp) * 30;
    A(bp > 0 && bp < 1 ? 1 : 0, () => { ctx.fillStyle = 'rgba(169,125,36,0.85)'; ctx.beginPath(); ctx.ellipse(ex, 688, 26, 16, 0, 0, Math.PI * 2); ctx.fill(); });
    A(ap(t, mid('w2', 0.4)), () => hand('adds branches to starch', RX, 770, { size: 40, color: C.soft, align: 'center' }));
    A(ap(t, mid('w2', 0.75)), () => hand('missing in wrinkled seeds', RX, 840, { size: 44, color: C.terra, align: 'center' }));
  });
  // the gene, interrupted
  A(span(t, s('w3', -0.3), e('w6', 0.6), 0.5, 0.6), () => {
    A(ap(t, s('w3', 0.0)), () => { hand('the gene, in a round pea', 1080, 330, { size: 40, color: C.green }); geneBar(1080, 1780, 380); });
    const ins = seg(t, mid('w3', 0.45), mid('w3', 0.75)), gp = eio(seg(t, mid('w3', 0.2), mid('w3', 0.5)));
    A(ap(t, mid('w3', 0.1)), () => { hand('in a wrinkled pea', 1080, 530, { size: 40, color: C.terra }); geneBar(1080, 1780, 580, { gap: 170 * gp, insert: ins }); });
    A(ap(t, mid('w3', 0.8)), () => hand('extra DNA, about 800 letters', 1400, 664, { size: 42, color: C.terra, align: 'center' }));
    A(ap(t, s('w4', 0.4)), () => hand('like a jumping gene from maize', 1400, 724, { size: 40, color: C.soft, align: 'center' }));
    A(ap(t, s('w3', 0.5)), () => txt('not to scale', RX, 930, { size: 32, italic: true, color: C.faint, align: 'center' }));
  });
  // the young seed swells with sugar and water, then dries wrinkled
  A(span(t, s('w5', -0.3), e('w6', 0.8), 0.5, 0.6), () => {
    const sw = eio(seg(t, s('w5', 0.3), e('w5', -0.3))), dry = eio(seg(t, s('w6', 0.2), e('w6', 0.3)));
    const r = 110 + 40 * sw - 34 * dry;
    pea(LX, 460, r, { shape: 'W', seed: 12, swell: 1 - dry });
    const nS = Math.floor(40 * sw);
    ctx.save(); ctx.beginPath(); ctx.arc(LX, 460, r * 0.8, 0, Math.PI * 2); ctx.clip();
    for (let i = 0; i < nS; i++) { const th = hsh(i, 2) * 6.28, rr = Math.sqrt(hsh(i, 3)) * r * 0.75; ctx.fillStyle = 'rgba(255,255,250,0.9)'; ctx.fillRect(LX + Math.cos(th) * rr - 4, 460 + Math.sin(th) * rr - 4, 8, 8); }
    ctx.restore();
    for (let i = 0; i < 6; i++) {
      const u = ((t - s('w5', 0.3)) * 0.5 + i / 6) % 1, th = i * 1.05 + 0.3;
      A(span(t, s('w5', 0.3), e('w5', 0.2), 0.3, 0.4) * Math.sin(Math.PI * u), () => {
        const rr = lerp(r + 110, r + 10, u), x = LX + Math.cos(th) * rr, y = 460 + Math.sin(th) * rr;
        ctx.fillStyle = '#4F8D99'; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.quadraticCurveTo(x + 9, y + 2, x, y + 8); ctx.quadraticCurveTo(x - 9, y + 2, x, y - 12); ctx.fill();
      });
    }
    A(ap(t, s('w5', 0.8)), () => hand('less starch, more sugar', LX, 680, { size: 42, align: 'center' }));
    A(ap(t, mid('w5', 0.7)), () => hand('more water drawn in', LX, 736, { size: 42, color: '#3E7E86', align: 'center' }));
    A(ap(t, s('w6', 0.6)), () => hand('dries out wrinkled', LX, 812, { size: 50, color: C.terra, align: 'center' }));
  });
  // one working copy is enough
  A(span(t, s('w7', -0.3), s('w8', 0.15), 0.5, 0.6), () => {
    A(ap(t, s('w7', 0.0)), () => { token('R', 1090, 380); geneBar(1140, 1780, 380); token('r', 1090, 520); geneBar(1140, 1780, 520, { gap: 170, gapAt: 1460, insert: 1 }); });
    const q = seg(t, s('w7', 0.6), mid('w7', 0.6));
    for (let i = 0; i < 7; i++) { const u = clamp(q * 1.6 - i * 0.1); if (u > 0) A(u, () => { ctx.fillStyle = 'rgba(169,125,36,0.85)'; ctx.beginPath(); ctx.ellipse(1200 + i * 80, 430 + Math.sin(i) * 6 + (1 - u) * -30, 20, 12, 0, 0, Math.PI * 2); ctx.fill(); }); }
    A(ap(t, mid('w7', 0.35)), () => hand('enzyme made', 1820, 448, { size: 38, color: C.gold, align: 'right' }));
    A(ap(t, mid('w7', 0.6)), () => hand('one working copy: round', RX, 680, { size: 52, color: C.green, align: 'center' }));
    pea(LX, 470, 120, { a: ap(t, s('w7', 0.2)) });
    A(ap(t, s('w7', 0.4)), () => { genoTxt('Rr', LX, 270, 72); hand('round', LX, 650, { size: 46, color: C.green, align: 'center' }); });
  });
  // all seven genes
  A(span(t, s('w8', -0.3), CH[8].at + 1.0, 0.5, 0.8), () => {
    writeOn(t, s('w8', 0.1), 'Mendel’s seven genes', 1062, base(1), { base: 'alphabetic', size: 46 });
    EXPTS.forEach(([name], i) => {
      ledgerRow(t, s('w8', 0.3) + i * 0.12, base(2 + i), [name], [1062], ['left'], [C.ink]);
      if (i === 0) writeOn(t, s('w8', 0.6), 'found 1990', 1700, base(2), { base: 'alphabetic', size: 40, color: C.gold, align: 'right' });
      tick(1770, base(2 + i) - 16, 34, seg(t, (i ? mid('w8', 0.55) : s('w8', 0.8)) + i * 0.15, (i ? mid('w8', 0.55) : s('w8', 0.8)) + i * 0.15 + 0.4), C.green, 4);
    });
    writeOn(t, mid('w8', 0.7), 'all seven identified by 2025', 1062, base(10), { base: 'alphabetic', size: 48, color: C.gold });
    pea(330, 460, 90, { a: ap(t, s('w8', -0.2)) }); pea(680, 460, 90, { shape: 'W', seed: 5, a: ap(t, s('w8', -0.2)) });
    A(ap(t, s('w8', 0.0)), () => { hand('R', 330, 600, { size: 60, color: C.green, align: 'center' }); hand('r', 680, 600, { size: 60, color: C.terra, align: 'center' }); });
  });
}

// ---------- 9: counting chance ----------
function part9(t) {
  const t0 = CH[8].at + 2.6, out = 1 - seg(t, e('z6', 0.4), e('z6', 1.4));
  A(span(t, t0, DURATION + 1, 0.8, 0) * out, () => {
    pea(380, 250, 44, { a: ap(t, s('z1', 0.6)) });
    token('R', 470, 250, { a: ap(t, mid('z1', 0.6)) }); token('r', 536, 250, { a: ap(t, mid('z1', 0.75)) });
    A(ap(t, mid('z1', 0.8)), () => hand('one from each parent', 600, 250, { size: 36, color: C.soft }));
    ['R', 'r'].forEach((ch, i) => { pollen(300 + i * 110, 400, ch, ap(t, s('z2', 0.3) + i * 0.2)); egg(560 + i * 120, 400, ch, ap(t, s('z2', 0.6) + i * 0.2)); });
    const c = 92, x0 = LX - c, y0 = 500;
    const gp = seg(t, s('z3', 0.1), s('z3', 0.9));
    inkRect(x0, y0, 2 * c, 2 * c, gp, { w: 2.5 }); inkLine(x0 + c, y0, x0 + c, y0 + 2 * c, gp, { w: 2, seed: 3 }); inkLine(x0, y0 + c, x0 + 2 * c, y0 + c, gp, { w: 2, seed: 4 });
    for (let n = 0; n < 4; n++) { const ci = n % 2, ri = Math.floor(n / 2), g = geno(['R', 'r'][ci], ['R', 'r'][ri]); pea(x0 + c * (ci + 0.5), y0 + c * (ri + 0.5), 26, { shape: g === 'rr' ? 'W' : 'R', a: ap(t, s('z3', 0.6) + n * 0.2), seed: n }); }
    ring(x0 + 1.5 * c, y0 + 1.5 * c, 40, 40, seg(t, mid('z3', 0.7), e('z3')));
    const nn = Math.floor(400 * eio(seg(t, s('z4', 0.6), e('z4', 0.4))));
    for (let i = 0; i < nn; i++) { const x = 150 + hsh(i, 5) * 720, y = 800 + hsh(i, 6) * 150 * Math.sin(Math.PI * (x - 150) / 720); pea(x, 960 - (y - 800), 7, { shape: hsh(i, 7) < 0.25 ? 'W' : 'R', seed: i }); }
    writeOn(t, s('z1', 0.4), 'two copies of each gene', 1062, base(2), { base: 'alphabetic', size: 48 });
    writeOn(t, s('z2', 0.3), 'one to each pollen grain and egg', 1062, base(4), { base: 'alphabetic', size: 44 });
    writeOn(t, mid('z2', 0.6), 'chosen by chance', 1062, base(5), { base: 'alphabetic', size: 44, color: C.gold });
    writeOn(t, mid('z3', 0.3), 'two hidden copies meet:', 1062, base(7), { base: 'alphabetic', size: 44 });
    writeOn(t, mid('z3', 0.75), '1 in 4', 1530, base(7) + 4, { base: 'alphabetic', size: 64, color: C.terra });
    writeOn(t, s('z4', 0.5), 'seen only in thousands of seeds', 1062, base(9), { base: 'alphabetic', size: 44 });
    A(ap(t, s('z5', 0.4)), () => { hand('1866', 1120, base(11), { size: 56, base: 'alphabetic' }); arrow(1240, base(11) - 16, 1400, base(11) - 16, seg(t, s('z5', 0.6), mid('z5', 0.5)), { col: C.soft }); });
    A(ap(t, mid('z5', 0.5)), () => hand('1900', 1430, base(11), { size: 56, base: 'alphabetic', color: C.green }));
    writeOn(t, s('z6', 0.3), 'a friar, a garden, a careful count', RX, base(13), { base: 'alphabetic', size: 50, color: C.green, align: 'center' });
  });
}

// ---------- the timeline of parts ----------
Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [SERIF, HAND],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const parts = [partOpen, part1, part2, part3, part4, part5, part6, part7, part8, part9];
    const B = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a0 = i === 0 ? -1 : B[i] + 2.4, b = i + 1 < B.length - 1 ? B[i + 1] + 1.0 : DURATION + 1;
      if (t < a0 || t > b) return;
      A(i === 0 ? 1 - seg(t, b - 1.0, b) : 1 - seg(t, b - 1.0, b), () => fn(t));
    });
    titleCard(t);
    credits(t);
  },
});
