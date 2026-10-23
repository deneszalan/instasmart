// "Achilles and the Tortoise: Zeno's paradoxes", a long-form explainer (16:9, about 11 minutes).
// Look: a charcoal-and-marble sketchbook. White veined marble with a fine chalk grain; everything is drawn in
// grainy charcoal, with one warm accent, sanguine (red chalk), for the tortoise and the key numbers. The race
// track is a long ruled line with tick marks across the width; Achilles is a running charcoal silhouette, the
// tortoise a domed sanguine shape. Cardo for titles and quotations, Patrick Hand for the sketchbook notes.
// Widescreen: the track runs across the full width; sums, ledgers and convergence charts sit beside or below it.
// Every animation is keyed to a narration line in window.TL, so the dialogue version (same keys) shares this file.
// All numbers on screen are computed below from the race (100 m head start, 10 m/s and 1 m/s), the halvings,
// the arrow (50 m/s), Archimedes' triangles and Thomson's lamp.
const W = 1920, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;
const { T, chapters: CH, duration: DURATION } = window.TL;
const s = (key, d = 0) => T[key][0] + d;
const e = (key, d = 0) => T[key][1] + d;
const mid = (key, f = 0.5) => lerp(T[key][0], T[key][1], f);
const SERIF = 'Cardo', HAND = 'Patrick Hand';
const TAU = Math.PI * 2;

const C = {
  marble: '#EEEBE4', marbleIn: '#F8F6F1', marbleOut: '#D9D4CA',
  ink: '#232427', soft: 'rgba(35,36,39,0.72)', faint: 'rgba(35,36,39,0.42)', ghost: 'rgba(35,36,39,0.14)',
  red: '#A9472A', redSoft: 'rgba(169,71,42,0.62)', redWash: 'rgba(169,71,42,0.14)', redLight: '#D27E5C',
  wash: 'rgba(35,36,39,0.06)', paper: '#F6F3EC',
};

let k, ctx;
const A = (a, fn) => k.alpha(a, fn);
const ap = (t, t0, d = 0.5) => eout(seg(t, t0, t0 + d));
const hsh = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- text ----------
function txt(str, x, y, { size = 40, weight = 400, family = HAND, color = C.ink, align = 'left', base = 'alphabetic', italic = false, spacing = '0px' } = {}) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  k.text(str, x, y, { color, align, base, spacing });
}
const hand = (str, x, y, o = {}) => txt(str, x, y, { family: HAND, ...o });
const serif = (str, x, y, o = {}) => txt(str, x, y, { family: SERIF, ...o });
function measure(str, size, family = HAND, weight = 400, italic = false) {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  return ctx.measureText(str).width;
}
/** Wrap words into lines no wider than maxW. */
function wrap(str, maxW, size, family, weight = 400, italic = false) {
  const words = str.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (measure(t, size, family, weight, italic) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------- charcoal and chalk textures (painted once) ----------
let grainInk = null, grainRed = null, bg = null;
function grainPattern(rgb, lo, hi, seed) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d'), img = g.createImageData(256, 256), r = mulberry32(seed);
  for (let i = 0; i < 256 * 256; i++) {
    const v = r(), streak = 0.5 + 0.5 * Math.sin((i % 256) * 0.21 + Math.floor(i / 256) * 0.37);
    img.data[i * 4] = rgb[0]; img.data[i * 4 + 1] = rgb[1]; img.data[i * 4 + 2] = rgb[2];
    img.data[i * 4 + 3] = Math.round(255 * (v < 0.06 ? lo * 0.4 : lerp(lo, hi, Math.pow(v, 0.6) * (0.8 + 0.2 * streak))));
  }
  g.putImageData(img, 0, 0);
  return ctx.createPattern(c, 'repeat');
}
function paintBackground() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const rad = g.createRadialGradient(W * 0.46, H * 0.42, 80, W / 2, H / 2, 1250);
  rad.addColorStop(0, C.marbleIn); rad.addColorStop(0.55, C.marble); rad.addColorStop(1, C.marbleOut);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const r = mulberry32(17);
  // soft clouds in the stone
  for (let i = 0; i < 46; i++) {
    const x = r() * W, y = r() * H, rr = 120 + r() * 360;
    const cg = g.createRadialGradient(x, y, 0, x, y, rr);
    cg.addColorStop(0, `rgba(160,156,146,${0.03 + r() * 0.04})`); cg.addColorStop(1, 'rgba(160,156,146,0)');
    g.fillStyle = cg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  // veins: wandering diagonal strokes, a blurred halo and a crisp core
  for (let i = 0; i < 16; i++) {
    let x = -80 + r() * (W + 160), y = -40;
    const pts = [[x, y]];
    let dir = 0.95 + (r() - 0.5) * 0.8;
    while (y < H + 40 && x > -120 && x < W + 120) {
      dir += (r() - 0.5) * 0.45; dir = clamp(dir, 0.45, 2.4);
      x += Math.cos(dir) * 30; y += Math.sin(dir) * 30;
      pts.push([x, y]);
    }
    const lw = 0.8 + r() * 2.6, a = 0.07 + r() * 0.11;
    for (const [blur, w, al] of [[7, lw * 5, a * 0.35], [0, lw, a]]) {
      g.save(); g.filter = blur ? `blur(${blur}px)` : 'none';
      g.strokeStyle = `rgba(98,96,90,${al})`; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); pts.forEach(([a1, b1], j) => (j ? g.lineTo(a1, b1) : g.moveTo(a1, b1))); g.stroke();
      g.restore();
    }
  }
  // chalky grain
  const img = g.getImageData(0, 0, W, H), d = img.data, r2 = mulberry32(5);
  for (let i = 0; i < d.length; i += 4) { const n = (r2() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  // a soft charcoal smudge around the edges, like a well-used sketchbook page
  const vg = g.createRadialGradient(W / 2, H / 2, 620, W / 2, H / 2, 1180);
  vg.addColorStop(0, 'rgba(40,40,42,0)'); vg.addColorStop(1, 'rgba(40,40,42,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function background() {
  if (!bg) { paintBackground(); grainInk = grainPattern([35, 36, 39], 0.55, 1, 3); grainRed = grainPattern([169, 71, 42], 0.5, 1, 9); }
  ctx.drawImage(bg, 0, 0);
}
const inkOf = (col) => (col === C.ink ? grainInk : col === C.red ? grainRed : col);

// ---------- charcoal strokes ----------
/** A charcoal line drawn on to progress p: a grainy main stroke and a lighter, slightly offset second pass. */
function cline(x0, y0, x1, y1, { w = 3, col = C.ink, p = 1, seed = 1, a = 1 } = {}) {
  if (p <= 0 || a <= 0) return;
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p);
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  ctx.strokeStyle = inkOf(col); ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
  const o = (hsh(seed) - 0.5) * w * 0.9;
  ctx.globalAlpha *= 0.32; ctx.lineWidth = w * 0.55;
  ctx.beginPath(); ctx.moveTo(x0 + o, y0 - o); ctx.lineTo(x + o * 0.6, y - o * 0.6); ctx.stroke();
  ctx.restore();
}
/** A charcoal polyline through pts, drawn on to progress p (by length). */
function cpath(pts, { w = 3, col = C.ink, p = 1, a = 1, close = false, seed = 2 } = {}) {
  if (p <= 0 || a <= 0 || pts.length < 2) return;
  const P = close ? [...pts, pts[0]] : pts;
  let L = 0; const segs = [];
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); segs.push(l); L += l; }
  let left = L * clamp(p);
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [lw, al, off] of [[w, 1, 0], [w * 0.55, 0.3, (hsh(seed) - 0.5) * w]]) {
    ctx.globalAlpha *= al; ctx.strokeStyle = inkOf(col); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(P[0][0] + off, P[0][1] - off);
    let rem = left;
    for (let i = 1; i < P.length && rem > 0; i++) {
      const f = Math.min(1, rem / (segs[i - 1] || 1));
      ctx.lineTo(lerp(P[i - 1][0], P[i][0], f) + off, lerp(P[i - 1][1], P[i][1], f) - off);
      rem -= segs[i - 1];
    }
    ctx.stroke();
  }
  ctx.restore();
}
/** Diagonal charcoal hatching inside a path set up by `shape()` (which must begin a path). */
function hatch(shape, x0, y0, x1, y1, { gap = 9, col = C.ink, w = 1.6, a = 0.5, ang = -0.9 } = {}) {
  if (a <= 0) return;
  ctx.save(); shape(); ctx.clip();
  ctx.globalAlpha *= a; ctx.strokeStyle = inkOf(col); ctx.lineWidth = w;
  const dx = Math.cos(ang), dy = Math.sin(ang), span2 = Math.hypot(x1 - x0, y1 - y0);
  ctx.beginPath();
  for (let d = -span2; d < span2; d += gap) {
    const cx = (x0 + x1) / 2 + -dy * d, cy = (y0 + y1) / 2 + dx * d;
    ctx.moveTo(cx - dx * span2, cy - dy * span2); ctx.lineTo(cx + dx * span2, cy + dy * span2);
  }
  ctx.stroke(); ctx.restore();
}
function fillGrain(col, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = inkOf(col); ctx.fill(); ctx.restore(); }
function dot(x, y, r, col = C.ink, a = 1) { if (a <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); fillGrain(col, a); }
/** A bracket over [x0, x1] at height y (ticks pointing down), with a label above. */
function bracket(x0, x1, y, label, a, { col = C.ink, size = 40, up = true } = {}) {
  if (a <= 0 || x1 - x0 < 3) return;
  A(a, () => {
    const d = up ? 16 : -16;
    cpath([[x0, y + d], [x0, y], [x1, y], [x1, y + d]], { w: 3, col });
    if (label) hand(label, (x0 + x1) / 2, up ? y - 16 : y + 46, { size, color: col, align: 'center' });
  });
}
/** A small flag on a pole, standing on the track at x. */
function flag(x, yb, a, col = C.red) {
  if (a <= 0) return;
  A(a, () => {
    cline(x, yb, x, yb - 70, { w: 3, col: C.ink });
    ctx.beginPath(); ctx.moveTo(x, yb - 70); ctx.lineTo(x + 28, yb - 61); ctx.lineTo(x, yb - 52); ctx.closePath(); fillGrain(col, 0.9);
  });
}
/** A quotation card: wrapped Cardo italic between large quote marks, with a source line. */
function quote(str, cx, cy, maxW, a, { size = 54, src = '', col = C.ink, reveal = 1, lh = 1.32 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const lines = wrap(str, maxW, size, SERIF, 400, true);
    const top = cy - ((lines.length - 1) * size * lh) / 2;
    const n = lines.length;
    lines.forEach((ln, i) => {
      const la = clamp(reveal * n - i);
      if (la > 0) A(la, () => serif(ln, cx, top + i * size * lh, { size, italic: true, color: col, align: 'center', base: 'middle' }));
    });
    const qa = Math.min(1, reveal * 3);
    A(qa * 0.55, () => serif('“', cx - maxW / 2 - 50, top + 30, { size: size * 2.6, color: C.red, align: 'center', base: 'middle' }));
    if (src) A(clamp(reveal * n - (n - 1)), () => hand(src, cx, top + (n - 1) * size * lh + size * 1.25, { size: 36, color: C.soft, align: 'center', base: 'middle' }));
  });
}
/** A heading in Cardo capitals with a charcoal rule that draws on. */
function heading(str, x, y, a, { size = 64, align = 'center', p = 1, col = C.ink, rule = true } = {}) {
  if (a <= 0) return;
  A(a, () => {
    serif(str, x, y, { size, weight: 700, color: col, align, spacing: '3px' });
    if (rule) {
      const w = measure(str, size, SERIF, 700) + str.length * 3;
      const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      cline(x0, y + 24, x0 + w, y + 24, { w: 2.5, col: C.red, p, a: 0.85 });
    }
  });
}
/** A pill-shaped tag. */
function tag(str, x, y, { col = C.ink, size = 36, fg = C.paper, a = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const w = measure(str, size) + 34, h = size + 16;
    k.rrect(x - w / 2, y - h / 2, w, h, h / 2); fillGrain(col, 0.92);
    hand(str, x, y + 2, { size, color: fg, align: 'center', base: 'middle' });
  });
}

// ---------- the race, computed ----------
const HEAD = 100, VA = 10, VT = 1, R = VT / VA;  // head start (m), speeds (m/s)
const MEET = HEAD / (1 - R);                       // 111.11 m, where they draw level
const T_MEET = HEAD / (VA - VT);                   // 11.11 s
const A_N = (n) => MEET * (1 - Math.pow(R, n));    // where Achilles is after n stages: 0, 100, 110, 111, …
const T_N = (n) => T_MEET * (1 - Math.pow(R, n));  // when: 0, 10, 11, 11.1, … s
const GAP_N = (n) => HEAD * Math.pow(R, n);        // the gap left after n stages: 100, 10, 1, 0.1, … m
const tortoiseAt = (a) => HEAD + a * R;            // they run at the same time
function dist(m) {
  if (m >= 1) return `${+m.toPrecision(3)} m`;
  if (m >= 0.01) return `${+(m * 100).toPrecision(3)} cm`;
  if (m >= 0.001) return `${+(m * 1000).toPrecision(3)} mm`;
  if (m >= 1e-6) return `${+(m * 1e6).toPrecision(3)} μm`;
  return `${+(m * 1e9).toPrecision(3)} nm`;
}
const secs = (x) => (x >= 0.1 ? `${+x.toPrecision(3)} s` : x >= 0.001 ? `${+(x * 1000).toPrecision(3)} ms` : `${+(x * 1e6).toPrecision(3)} μs`);
const TOTALS = Array.from({ length: 12 }, (_, n) => A_N(n));           // running totals of the distances
const TSUMS = Array.from({ length: 12 }, (_, n) => T_N(n));
/** The first stage from which every running total stays within `tol` metres of the limit. */
const stageWithin = (tol) => { let n = 0; while (MEET - A_N(n) >= tol) n++; return n; };
const MM_STAGE = stageWithin(0.001), UM_STAGE = stageWithin(1e-6);  // 6 and 9
const fixedTotal = (x, n) => x.toFixed(Math.max(0, n - 2));            // 100, 110, 111, 111.1, 111.11, …

// ---------- the track: a long ruled line, zoomed about the meeting point ----------
const TR = { y: 560, x0: 110, x1: 1810, o: 200, s0: 12 };                  // 0 m at x = 200, 12 px per metre
const PSTAR = TR.o + MEET * TR.s0;
const tx = (m, z = 0) => PSTAR + (m - MEET) * TR.s0 * Math.pow(10, z);
function track(z, a, { y = TR.y, labels = true, p = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const xe = lerp(TR.x0, TR.x1, p);
    cline(TR.x0, y, xe, y, { w: 4, seed: 3 });
    const zi = Math.floor(z), fr = z - zi;
    const mAt = (x) => MEET + (x - PSTAR) / (TR.s0 * Math.pow(10, z));
    for (const [lvl, al, len] of [[zi, 1, 22], [zi + 1, fr, 12]]) {
      if (al <= 0.01) continue;
      const step = Math.pow(10, 1 - lvl);
      const m0 = Math.ceil(mAt(TR.x0 + 4) / step), m1 = Math.floor(mAt(xe) / step);
      ctx.save(); ctx.globalAlpha *= al; ctx.strokeStyle = grainInk; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = m0; i <= m1 && i - m0 < 400; i++) { const x = tx(i * step, z); ctx.moveTo(x, y); ctx.lineTo(x, y + len * (i % 5 === 0 ? 1.5 : 1)); }
      ctx.stroke(); ctx.restore();
    }
    if (labels) A(1 - seg(z, 0.02, 0.15), () => {
      for (let m = 0; m <= 130; m += 20) { const x = tx(m, 0); if (x > TR.x0 && x < xe) hand(m ? `${m} m` : '0', x, y + 70, { size: 32, color: C.soft, align: 'center' }); }
    });
  });
}

// ---------- figures ----------
/** Achilles: a running charcoal silhouette with a crested helmet, facing right; (x, yb) is the ground point. */
function achilles(x, yb, phase, amp, a = 1, sc = 1.55) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, yb); ctx.scale(sc, sc);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = grainInk; ctx.fillStyle = grainInk;
    const bob = amp * Math.abs(Math.sin(phase)) * 4;
    const hip = [0, -50 - bob], sh = [6 + amp * 5, -86 - bob], head = [12 + amp * 6, -104 - bob];
    const limb = (from, a1, a2, l1, l2, w) => {
      const kx = from[0] + Math.sin(a1) * l1, ky = from[1] + Math.cos(a1) * l1;
      const fx = kx + Math.sin(a2) * l2, fy = ky + Math.cos(a2) * l2;
      ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    };
    for (const sgn of [Math.PI, 0]) {
      const p = phase + sgn, th = amp * 0.8 * Math.sin(p), bend = amp * (0.35 + 0.8 * Math.max(0, -Math.cos(p)));
      ctx.globalAlpha = sgn ? 0.5 : 1;
      limb(hip, th, th - bend, 26, 25, 10);
      const ar = -amp * 0.9 * Math.sin(p);
      limb(sh, ar, ar + 1.3 * amp + 0.15, 19, 17, 8);
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(hip[0], hip[1]); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
    ctx.beginPath(); ctx.arc(head[0], head[1], 12.5, 0, TAU); ctx.fill();
    // helmet with a crest that streams back
    ctx.beginPath(); ctx.arc(head[0], head[1] - 2, 14, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 5; ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(head[0] + 4, head[1] - 15);
    ctx.quadraticCurveTo(head[0] - 10, head[1] - 32, head[0] - 30, head[1] - 14 + amp * 4 * Math.sin(phase * 2)); ctx.stroke();
    ctx.restore();
  });
}
/** The tortoise: a domed sanguine shell with charcoal plates, little paddling legs, facing right. */
function tortoise(x, yb, phase, amp, a = 1, sc = 1.5) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, yb); ctx.scale(sc, sc);
    ctx.fillStyle = grainRed;
    for (let i = 0; i < 4; i++) { const lx = -22 + i * 14, off = amp * 3 * Math.sin(phase + i * Math.PI / 2); k.rrect(lx - 5 + off, -11, 10, 12, 4); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(26, -10); ctx.quadraticCurveTo(36, -24, 42, -18); ctx.lineTo(40, -9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(44, -17, 8, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-40, -5); ctx.lineTo(-30, -3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -8, 34, 28, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = grainInk; ctx.lineWidth = 2.2; ctx.globalAlpha *= 0.7;
    ctx.beginPath(); ctx.ellipse(0, -8, 34, 28, 0, Math.PI, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-32, -8); ctx.lineTo(32, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(-8, -22); ctx.lineTo(8, -22); ctx.lineTo(12, -8);
    ctx.moveTo(-8, -22); ctx.lineTo(-17, -31); ctx.moveTo(8, -22); ctx.lineTo(17, -31); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(47, -19, 1.8, 0, TAU); ctx.fill();
    ctx.restore();
  });
}
/** A walking figure (Diogenes): a charcoal silhouette with a staff. */
function walker(x, yb, phase, a = 1, sc = 1.5) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, yb); ctx.scale(sc, sc); ctx.lineCap = 'round'; ctx.strokeStyle = grainInk; ctx.fillStyle = grainInk;
    const hip = [0, -50], sh = [2, -88], head = [5, -104];
    for (const sgn of [Math.PI, 0]) {
      const th = 0.35 * Math.sin(phase + sgn);
      ctx.globalAlpha = sgn ? 0.5 : 1; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(hip[0] + Math.sin(th) * 50, hip[1] + Math.cos(th) * 50); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // a cloak: a soft trapezoid
    ctx.beginPath(); ctx.moveTo(sh[0] - 9, sh[1]); ctx.lineTo(sh[0] + 11, sh[1]); ctx.lineTo(hip[0] + 15, hip[1] + 6); ctx.lineTo(hip[0] - 16, hip[1] + 6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(head[0], head[1], 12, 0, TAU); ctx.fill();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(26, -96); ctx.lineTo(30 + Math.sin(phase) * 3, 0); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(sh[0] + 4, sh[1] + 6); ctx.lineTo(26, -70); ctx.stroke();
    ctx.restore();
  });
}
/** A Doric column, sketched in charcoal. */
function column(cx, yb, h, p, a = 1) {
  if (a <= 0 || p <= 0) return;
  A(a, () => {
    const w = h * 0.16, top = yb - h;
    const P = (i) => clamp(p * 6 - i);
    cline(cx - w * 1.5, yb, cx + w * 1.5, yb, { w: 4, p: P(0) });
    cline(cx - w * 1.3, yb - 14, cx + w * 1.3, yb - 14, { w: 3, p: P(0) });
    cline(cx - w, yb - 14, cx - w * 0.82, top + 30, { w: 3, p: P(1) });
    cline(cx + w, yb - 14, cx + w * 0.82, top + 30, { w: 3, p: P(1) });
    for (let i = 1; i < 4; i++) { const f = i / 4; cline(lerp(cx - w, cx + w, f), yb - 16, lerp(cx - w * 0.82, cx + w * 0.82, f), top + 32, { w: 1.6, a: 0.45, p: P(2) }); }
    cline(cx - w * 1.15, top + 30, cx + w * 1.15, top + 30, { w: 3, p: P(3) });
    cline(cx - w * 1.4, top + 12, cx + w * 1.4, top + 12, { w: 4, p: P(3) });
    cline(cx - w * 1.6, top, cx + w * 1.6, top, { w: 4, p: P(4) });
    cline(cx - w * 1.6, top - 22, cx + w * 1.6, top - 22, { w: 3, p: P(4) });
    cline(cx - w * 1.6, top, cx - w * 1.6, top - 22, { w: 3, p: P(5) });
    cline(cx + w * 1.6, top, cx + w * 1.6, top - 22, { w: 3, p: P(5) });
  });
}

// Positions relative to the meeting point (exact at any magnification): Achilles at off, the tortoise at R × off.
const offX = (off, z) => PSTAR + off * TR.s0 * Math.pow(10, z);
/** Track ticks in the zoomed frame, computed relative to the meeting point (MEET mod step = step / 9). */
function zoomTrack(z, a, { y = TR.y } = {}) {
  if (a <= 0) return;
  A(a, () => {
    cline(TR.x0, y, TR.x1, y, { w: 4, seed: 3 });
    const zi = Math.floor(z), fr = z - zi;
    for (const [lvl, al, len] of [[zi, 1, 22], [zi + 1, fr, 12]]) {
      if (al <= 0.01) continue;
      const px = 120 * Math.pow(10, z - lvl);       // pixels between ticks at this level
      const j0 = Math.ceil((TR.x0 - PSTAR) / px + 1 / 9), j1 = Math.floor((TR.x1 - PSTAR) / px + 1 / 9);
      ctx.save(); ctx.globalAlpha *= al; ctx.strokeStyle = grainInk; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let j = j0; j <= j1 && j - j0 < 400; j++) { const x = PSTAR + (j - 1 / 9) * px; ctx.moveTo(x, y); ctx.lineTo(x, y + len); }
      ctx.stroke(); ctx.restore();
    }
    A(1 - seg(z, 0.02, 0.15), () => {
      for (let m = 0; m <= 130; m += 20) hand(m ? `${m} m` : '0', tx(m, 0), y + 70, { size: 32, color: C.soft, align: 'center' });
    });
  });
}
function nameTags(xa, xt, y, a) {
  if (a <= 0) return;
  A(a, () => {
    hand('Achilles', xa, y, { size: 36, color: C.ink, align: 'center' });
    hand('tortoise', xt + 8, y, { size: 36, color: C.red, align: 'center' });
  });
}

// ---------- title cards and credits ----------
function veil(a) { if (a > 0) A(a, () => ctx.drawImage(bg, 0, 0)); }
function titleCard(t) {
  for (const ch of CH) {
    const a = span(t, ch.at, ch.at + 3.9, 0.5, 0.6);
    if (a <= 0) continue;
    veil(a * 0.93);
    A(a, () => {
      const p = eout(seg(t, ch.at, ch.at + 0.8));
      ctx.save(); ctx.translate(0, (1 - p) * 16);
      hand(`part ${ch.n}`, W / 2, 380, { size: 44, color: C.red, align: 'center' });
      serif(ch.title, W / 2, 500, { size: ch.title.length > 20 ? 92 : 108, weight: 700, align: 'center', base: 'middle' });
      // the dichotomy as a motif: a ruled line whose marks crowd towards its end
      const x0 = 660, x1 = 1260, y = 610, q = eio(seg(t, ch.at + 0.3, ch.at + 2.6));
      cline(x0, y, x1, y, { w: 3, p: eio(seg(t, ch.at + 0.15, ch.at + 0.9)) });
      for (let i = 0; i <= 12; i++) {
        const f = 1 - Math.pow(0.5, i), x = lerp(x0, x1, f);
        const al = clamp(q * 13 - i);
        if (al > 0) cline(x, y - 14 * Math.pow(0.84, i), x, y + 14 * Math.pow(0.84, i), { w: 2.5, a: al, col: i ? C.ink : C.red });
      }
      dot(lerp(x0, x1, 1 - Math.pow(0.5, q * 12)), y, 8, C.red, seg(t, ch.at + 0.3, ch.at + 0.6));
      ctx.restore();
    });
  }
}
const MUSIC = ['“Enchanted Journey” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Fresh Air” Kevin MacLeod (incompetech.com) · CC BY 4.0', '“Promises to Keep” Kevin MacLeod (incompetech.com) · CC BY 4.0'];
function credits(t) {
  const a = seg(t, e('z6', 1.2), e('z6', 2.4));
  if (a <= 0) return;
  veil(a * 0.96);
  A(a, () => {
    serif('Achilles and the Tortoise', W / 2, 170, { size: 84, weight: 700, align: 'center' });
    hand('Reckon · original animation', W / 2, 240, { size: 44, color: C.red, align: 'center' });
    const blocks = [
      ['MUSIC', MUSIC],
      ['SOURCES', [
        'Aristotle, Physics VI.9 and VIII.8 · Plato, Parmenides · Simplicius, On Aristotle’s Physics',
        'Wikipedia: Zeno’s paradoxes · Zeno of Elea · Parmenides · Thomson’s lamp · Supertask',
        'Quadrature of the Parabola · Series (mathematics) · Limit of a function · Solvitur ambulando',
        'N. Huggett, “Zeno’s Paradoxes”, Stanford Encyclopedia of Philosophy',
        'B. Dowden, “Zeno’s Paradoxes”, Internet Encyclopedia of Philosophy',
      ]],
    ];
    let y = 330;
    for (const [hd, lines] of blocks) {
      serif(hd, W / 2, y, { size: 32, weight: 700, color: C.ink, align: 'center', spacing: '6px' });
      lines.forEach((ln, j) => hand(ln, W / 2, y + 50 + j * 46, { size: 36, color: C.soft, align: 'center' }));
      y += 50 + lines.length * 46 + 44;
    }
    hand('All distances, times and sums are computed from the race: a 100 m head start, 10 m/s and 1 m/s.', W / 2, y + 6, { size: 34, color: C.faint, align: 'center' });
    // a last little race across the foot of the card
    const q = seg(t, e('z6', 2.0), e('z6', 9.5));
    const ax = lerp(360, 1640, eio(q)), tt = lerp(1380, 1508, eio(q));
    cline(300, 950, 1620, 950, { w: 3, a: 0.6 });
    tortoise(tt, 948, t * 5, 0.4, 0.9, 1.0);
    achilles(ax, 948, t * 9, q > 0 && q < 1 ? 1 : 0, 0.9, 0.95);
  });
}

// ---------- 0: cold open ----------
/** A simple race at actual size: Achilles at a (m), the tortoise where it would be at the same moment. */
function raceAt(a, tm, run, t, al = 1, { y = TR.y } = {}) {
  const xa = tx(a), xt = tx(tm);
  achilles(xa, y - 3, t * 9, run, al);
  tortoise(xt, y - 3, t * 5, 0.3 + 0.7 * run, al);
}
function partOpen(t) {
  const on = eio(seg(t, s('o1'), s('o1', 1.4)));
  const out = seg(t, s('o6'), s('o6', 0.9));
  A(1 - out, () => {
    track(0, 1, { p: on });
    // o2: the first stages at actual size, with flags where the tortoise was
    const st = [s('o2', 0.2), mid('o2', 0.55), mid('o2', 0.8), mid('o2', 0.95)];
    let a = 0, run = 0;
    for (let i = 0; i < 3; i++) {
      const q = seg(t, st[i], st[i + 1]);
      if (q > 0) { a = lerp(A_N(i), A_N(i + 1), i ? q : eio(q)); run = Math.min(1, Math.min(q, 1 - q) * 6); }
    }
    // o4: he simply runs on, and past
    const q4 = seg(t, s('o4', 0.1), e('o4', 0.8));
    if (q4 > 0) { a = lerp(A_N(3), 126, eio(q4)); run = Math.min(1, Math.min(q4, 1 - q4) * 5); }
    const tm = q4 > 0 ? HEAD + a * R : tortoiseAt(a);
    for (let j = 1; j <= 2; j++) flag(tx(A_N(j)), TR.y - 2, seg(t, st[j - 1] + 0.1, st[j - 1] + 0.4) * (1 - seg(t, s('o4'), s('o4', 0.5))) * 0.9);
    A(ap(t, s('o1', 0.5), 0.8), () => raceAt(a, tm, run, t));
    nameTags(tx(a), tx(tm), TR.y + 120, ap(t, s('o1', 1.0)) * (1 - seg(t, s('o2'), s('o2', 0.4))));
    bracket(tx(0), tx(100), TR.y - 230, 'head start', ap(t, mid('o1', 0.7)) * (1 - seg(t, s('o2', 0.1), s('o2', 0.5))));
    // o3: "he can never catch it", struck through in o4
    A(span(t, s('o3', 0.2), s('o5', 0.3), 0.5, 0.6), () => {
      const y = 250;
      serif('he can', 760, y, { size: 84, italic: true, align: 'right' });
      serif('never', 960, y, { size: 96, italic: true, weight: 700, color: C.red, align: 'center' });
      serif('catch it', 1160, y, { size: 84, italic: true, align: 'left' });
      cline(840, y - 28, 1084, y - 34, { w: 7, col: C.ink, p: eio(seg(t, s('o4', 0.6), s('o4', 1.2))), seed: 5 });
    });
    // o5: more than 2,000 years, from Zeno to the 19th century, and still argued over
    A(span(t, s('o5', 0.2), s('o6', 0.4), 0.6, 0.4), () => {
      const y = 260, x0 = 240, x1 = 1520, p = eio(seg(t, s('o5', 0.2), s('o5', 2.4)));
      cline(x0, y, lerp(x0, 1700, p), y, { w: 3 });
      const yr = (Y) => lerp(x0, x1, (Y + 460) / (1821 + 460));
      for (let Y = -400; Y <= 1800; Y += 200) cline(yr(Y), y, yr(Y), y + 14, { w: 2, a: clamp(p * 1.3 - (Y + 460) / 2281) * 0.6 });
      A(ap(t, s('o5', 0.3)), () => { dot(yr(-460), y, 9, C.red); hand('Zeno, 460s BC', yr(-460), y - 30, { size: 38, align: 'center' }); });
      A(ap(t, s('o5', 2.0)), () => { dot(yr(1821), y, 9, C.ink); hand('limits, 1800s', yr(1821), y - 30, { size: 38, align: 'center' }); });
      A(ap(t, mid('o5', 0.75)), () => { hand('and still argued over', 1700, y + 56, { size: 36, color: C.red, align: 'right' }); serif('?', 1730, y + 14, { size: 72, color: C.red, align: 'center' }); });
      A(ap(t, s('o5', 2.4)), () => bracket(yr(-460), yr(1821), y + 50, 'more than 2,000 years', 1, { up: false, size: 36 }));
    });
  });
  // o6: the title
  A(seg(t, s('o6', 0.3), s('o6', 1.3)), () => {
    const p = eout(seg(t, s('o6', 0.3), s('o6', 1.4)));
    ctx.save(); ctx.translate(0, (1 - p) * 18);
    serif('Ζήνων ὁ Ἐλεάτης', W / 2, 300, { size: 44, color: C.soft, align: 'center' });
    serif('Achilles and the Tortoise', W / 2, 440, { size: 120, weight: 700, align: 'center', base: 'middle' });
    hand('Zeno’s paradoxes of motion', W / 2, 560, { size: 56, color: C.red, align: 'center' });
    ctx.restore();
    const y = 800;
    cline(360, y, 1560, y, { w: 3, p: eio(seg(t, s('o6', 0.4), s('o6', 1.6))) });
    for (let i = 0; i <= 9; i++) { const x = lerp(360, 1560, 1 - Math.pow(0.5, i)); cline(x, y, x, y + 14, { w: 2, a: seg(t, s('o6', 0.6 + i * 0.12), s('o6', 0.9 + i * 0.12)) }); }
    achilles(520, y - 3, 0, 0, ap(t, s('o6', 0.8)), 1.1);
    tortoise(1180, y - 3, t * 4, 0.3, ap(t, s('o6', 1.0)), 1.05);
  });
}

// ---------- 1: the man from Elea ----------
const TL1 = { y: 860, x0: 200, x1: 1720, y0: -600, y1: 600 };
const yrx = (Y) => lerp(TL1.x0, TL1.x1, (Y - TL1.y0) / (TL1.y1 - TL1.y0));
function lifeBar(y0, y1, label, a, { col = C.ink, row = 0, size = 34 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const yy = TL1.y - 34 - row * 64;
    ctx.save(); k.rrect(yrx(y0), yy - 9, Math.max(6, (yrx(y1) - yrx(y0)) * eout(a)), 18, 9); fillGrain(col, 0.9); ctx.restore();
    hand(label, (yrx(y0) + yrx(y1)) / 2, yy - 20, { size, color: col, align: 'center' });
  });
}
function medallion(cx, cy, r, name, sub, a, { col = C.ink } = {}) {
  if (a <= 0) return;
  A(a, () => {
    const pts = []; for (let i = 0; i <= 64; i++) { const th = (i / 64) * TAU; pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); }
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); fillGrain(C.paper, 0.5);
    cpath(pts, { w: 4, col, p: eio(a) });
    serif(name, cx, cy + 4, { size: 38, weight: 700, color: col, align: 'center', base: 'middle', spacing: '2px' });
    if (sub) hand(sub, cx, cy + r + 46, { size: 34, color: C.soft, align: 'center' });
  });
}
function part1(t) {
  // the timeline, 600 BC to AD 600
  const tp = eio(seg(t, s('e1', 0.2), s('e1', 2.0)));
  A(1, () => {
    cline(TL1.x0, TL1.y, lerp(TL1.x0, TL1.x1, tp), TL1.y, { w: 3.5 });
    for (let Y = -600; Y <= 600; Y += 100) {
      const x = yrx(Y), al = clamp(tp * 13 - (Y + 600) / 100);
      if (al <= 0) continue;
      cline(x, TL1.y, x, TL1.y + 16, { w: 2.5, a: al });
      if (Y !== 0) hand(Y < 0 ? `${-Y} BC` : `AD ${Y}`, x, TL1.y + 54, { size: 30, color: C.soft, align: 'center' });
    }
  });
  lifeBar(-490, -430, 'Zeno, c. 490–430 BC', ap(t, s('e1', 1.4), 0.8), { col: C.red });
  lifeBar(-427, -347, 'Plato', ap(t, s('e7', 0.2), 0.7), { row: 1 });
  lifeBar(-384, -322, 'Aristotle', ap(t, mid('e7', 0.25), 0.7), { row: 2 });
  lifeBar(480, 540, 'Simplicius, c. 480–540', ap(t, mid('e7', 0.6), 0.7), { row: 0 });
  A(ap(t, mid('e7', 0.8)), () => bracket(yrx(-460), yrx(510), TL1.y - 200, 'about 1,000 years', 1, { size: 36, col: C.soft }));
  // left: the name
  const nameOut = seg(t, s('e6', -0.2), s('e6', 0.4));
  A(ap(t, s('e1', 0.3), 0.9) * (1 - nameOut), () => {
    serif('Ζήνων ὁ Ἐλεάτης', 520, 260, { size: 80, align: 'center' });
    hand('Zeno of Elea', 520, 340, { size: 52, color: C.red, align: 'center' });
    hand('Elea, today Velia, in southern Italy', 520, 410, { size: 36, color: C.soft, align: 'center' });
  });
  column(520, 680, 230, eio(seg(t, s('e1', 1.0), s('e1', 3.4))), 1 - nameOut);
  // left, e6: the lost book
  A(span(t, s('e6', 0.2), s('e7', 0.8), 0.5, 0.6), () => {
    // a scroll, sketched, with its end burnt away
    const x0 = 250, y0 = 230, w = 520, h = 190;
    cpath([[x0, y0], [x0 + w, y0], [x0 + w - 18, y0 + h * 0.4], [x0 + w + 8, y0 + h * 0.62], [x0 + w - 12, y0 + h], [x0, y0 + h]], { w: 3, close: true, p: eio(seg(t, s('e6', 0.2), s('e6', 1.4))) });
    for (let i = 0; i < 5; i++) cline(x0 + 40, y0 + 36 + i * 30, x0 + 40 + (w - 120) * (0.6 + 0.4 * hsh(i, 3)), y0 + 36 + i * 30, { w: 2, a: 0.4, p: seg(t, s('e6', 0.6 + i * 0.12), s('e6', 1.0 + i * 0.12)) });
    A(ap(t, s('e6', 0.8)), () => { ctx.save(); ctx.translate(x0 + w / 2, y0 + h / 2); ctx.rotate(-0.12); serif('LOST', 0, 0, { size: 90, weight: 700, color: C.red, align: 'center', base: 'middle', spacing: '10px' }); ctx.restore(); });
    A(ap(t, mid('e6', 0.55)), () => {
      hand('fewer than', 510, 500, { size: 44, color: C.soft, align: 'center' });
      serif('200', 510, 600, { size: 120, weight: 700, color: C.red, align: 'center' });
      hand('of his own words survive', 510, 664, { size: 44, color: C.soft, align: 'center' });
    });
  });
  // right: Parmenides and Zeno
  const RX = 1380;
  const r2out = seg(t, s('e4', -0.2), s('e4', 0.4));
  A(1 - r2out, () => {
    medallion(RX - 200, 330, 110, 'PARMENIDES', 'the older philosopher', ap(t, s('e2', 0.2), 1.0));
    medallion(RX + 200, 330, 92, 'ZENO', 'student and friend', ap(t, s('e2', 0.9), 0.9), { col: C.red });
    A(ap(t, s('e2', 1.4)), () => { cline(RX - 80, 330, RX + 96, 330, { w: 3 }); cpath([[RX + 82, 318], [RX + 102, 330], [RX + 82, 342]], { w: 3 }); });
    // e3: one unchanging whole
    A(ap(t, s('e3', 0.2), 0.8), () => {
      const cx = RX, cy = 600, r = 92;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); fillGrain(C.ink, 0.1);
      hatch(() => { ctx.beginPath(); ctx.arc(cx + 18, cy + 18, r - 6, 0, TAU); }, cx - r, cy - r, cx + r, cy + r, { gap: 10, a: 0.35 });
      cpath(Array.from({ length: 65 }, (_, i) => [cx + Math.cos(i / 64 * TAU) * r, cy + Math.sin(i / 64 * TAU) * r]), { w: 4, p: eio(seg(t, s('e3', 0.2), s('e3', 1.2))) });
      hand('reality: one, unchanging', cx, cy + r + 52, { size: 38, align: 'center' });
    });
    A(ap(t, mid('e3', 0.55)), () => {
      for (const [w2, x, y] of [['change', RX - 290, 560], ['motion', RX + 290, 650]]) {
        hand(w2, x, y, { size: 42, color: C.soft, align: 'center' });
        cline(x - 70, y - 12, x + 70, y - 20, { w: 4, col: C.red, p: eio(seg(t, mid('e3', 0.7), mid('e3', 0.9))) });
      }
      A(ap(t, mid('e3', 0.85)), () => hand('illusions', RX + 290, 712, { size: 36, color: C.red, align: 'center' }));
    });
  });
  // e4, e5: the method
  A(span(t, s('e4', 0.1), s('e6', 0.6), 0.5, 0.5), () => {
    const boxes = [['suppose things move', s('e4', 0.6)], ['follow the logic', mid('e4', 0.5)], ['absurd!', mid('e4', 0.8)]];
    boxes.forEach(([b, at], i) => {
      const y = 250 + i * 130, a = ap(t, at);
      A(a, () => {
        const w = 460, x = RX - w / 2;
        cpath([[x, y - 42], [x + w, y - 42], [x + w, y + 42], [x, y + 42]], { w: 3, close: true, col: i === 2 ? C.red : C.ink });
        hand(b, RX, y + 12, { size: 44, color: i === 2 ? C.red : C.ink, align: 'center' });
        if (i) { cline(RX, y - 88, RX, y - 46, { w: 3 }); cpath([[RX - 10, y - 58], [RX, y - 46], [RX + 10, y - 58]], { w: 3 }); }
      });
    });
    A(ap(t, s('e5', 0.2)), () => serif('reductio ad absurdum', RX, 680, { size: 60, italic: true, align: 'center' }));
    A(ap(t, mid('e5', 0.55)), () => hand('Aristotle called Zeno “the inventor of dialectic”', RX, 750, { size: 36, color: C.soft, align: 'center' }));
  });
  // e8: Plato's dialogue
  A(span(t, s('e8', 0.1), e('e8', 3), 0.5, 0.5), () => {
    const cx = RX, cy = 380;
    const book = eio(seg(t, s('e8', 0.1), s('e8', 0.9)));
    cpath([[cx - 260, cy - 120], [cx - 10, cy - 100], [cx - 10, cy + 120], [cx - 260, cy + 100]], { w: 3, close: true, p: book });
    cpath([[cx + 260, cy - 120], [cx + 10, cy - 100], [cx + 10, cy + 120], [cx + 260, cy + 100]], { w: 3, close: true, p: book });
    A(ap(t, s('e8', 0.6)), () => {
      serif('Plato', cx - 135, cy - 30, { size: 48, italic: true, align: 'center' });
      serif('Parmenides', cx + 135, cy - 30, { size: 46, italic: true, align: 'center' });
      hand('a dialogue', cx - 135, cy + 30, { size: 34, color: C.soft, align: 'center' });
      hand('Parmenides, Zeno,', cx + 135, cy + 24, { size: 32, color: C.soft, align: 'center' });
      hand('a young Socrates', cx + 135, cy + 62, { size: 32, color: C.soft, align: 'center' });
    });
    A(ap(t, mid('e8', 0.6)), () => hand('a meeting Plato probably invented', cx, cy + 190, { size: 40, color: C.red, align: 'center' }));
  });
}

// ---------- 2: the race ----------
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const pow10 = (n) => `10${String(n).split('').map((c) => SUP[+c]).join('')}`;
let STEPS2 = null;
/** Stage schedule: [run start, run end, zoom start, zoom end] for stage n = 1, 2, …, keyed to the lines. */
function steps2() {
  if (STEPS2) return STEPS2;
  const S = [];
  S.push([s('r7', 0.3), e('r7', -0.1), s('r9', 0.05), s('r9', 1.25)]);
  S.push([s('r9', 1.35), e('r9', -0.2), s('r10', 0.0), s('r10', 0.9)]);
  const m10 = mid('r10', 0.5);
  S.push([s('r10', 1.0), m10, m10 + 0.1, m10 + 0.8]);
  S.push([m10 + 0.9, e('r10', 0.1), s('r11', 0.0), s('r11', 0.6)]);
  let t0 = s('r11', 0.7), d = 0.6;
  const end = e('r12', 1.0);
  while (t0 + 2 * d < end && S.length < 40) { S.push([t0, t0 + d, t0 + d * 1.05, t0 + d * 1.9]); t0 += d * 2.0; d *= 0.86; }
  return (STEPS2 = S);
}
/** Achilles' offset from the meeting point, the magnification, and his stride, at time t. */
function race2(t) {
  const S = steps2();
  let off = -MEET, z = 0, amp = 0, n = 0, phase = 0, done = 0;
  for (let i = 0; i < S.length; i++) {
    const [r0, r1, z0, z1] = S[i];
    if (t < r0) break;
    n = i + 1;
    const p = seg(t, r0, r1), pe = i === 0 ? eio(p) : p;
    off = lerp(-MEET * Math.pow(R, i), -MEET * Math.pow(R, i + 1), pe);
    amp = clamp(Math.min(p, 1 - p) * (i === 0 ? 6 : 4));
    phase = pe * (i === 0 ? 7 : 3.5) * TAU;
    z = i + eio(seg(t, z0, z1));
    if (t >= r1) done = n;
  }
  return { off, z, amp, n, phase, done };
}
/** A length in big type; below a nanometre, as a power of ten with a raised exponent. */
function gapLabel(m, x, y, size) {
  if (m >= 1e-9) { serif(dist(m), x, y, { size, weight: 700, color: C.red, align: 'center' }); return; }
  const n = Math.round(-Math.log10(m)), ex = `−${n}`;
  const w1 = measure('10', size, SERIF, 700), w2 = measure(ex, size * 0.55, SERIF, 700), w3 = measure(' m', size, SERIF, 700);
  let x0 = x - (w1 + w2 + w3) / 2;
  serif('10', x0, y, { size, weight: 700, color: C.red }); x0 += w1;
  serif(ex, x0, y - size * 0.42, { size: size * 0.55, weight: 700, color: C.red }); x0 += w2;
  serif(' m', x0, y, { size, weight: 700, color: C.red });
}
function part2(t) {
  // r1–r4: Aristotle's words
  const qOut = seg(t, s('r5', -0.3), s('r5', 0.5));
  A(1 - qOut, () => {
    const Q1 = 'In a race, the quickest runner can never overtake the slowest, since the pursuer must first reach the point whence the pursued started,';
    const Q2 = 'so that the slower must always hold a lead.';
    const size = 60, lh = size * 1.3, maxW = 1480;
    const l1 = wrap(Q1, maxW, size, SERIF, 400, true), l2 = wrap(Q2, maxW, size, SERIF, 400, true);
    const lines = [...l1.map((x) => [x, 1]), ...l2.map((x) => [x, 2])];
    const top = 330 - ((lines.length - 1) * lh) / 2;
    lines.forEach(([ln, part], i) => {
      const j = part === 1 ? i : i - l1.length, nn = part === 1 ? l1.length : l2.length;
      const key = part === 1 ? 'r2' : 'r3';
      const a = seg(t, lerp(s(key), e(key), j / nn) - 0.3, lerp(s(key), e(key), j / nn) + 0.4);
      A(a, () => serif(ln, W / 2, top + i * lh, { size, italic: true, align: 'center', base: 'middle' }));
    });
    A(ap(t, s('r1', 0.3)) * 0.5, () => serif('“', W / 2 - maxW / 2 - 30, top + 10, { size: 170, color: C.red, align: 'center', base: 'middle' }));
    A(ap(t, s('r1', 0.4)), () => hand('Aristotle, Physics, book VI, chapter 9', W / 2, top + lines.length * lh + 30, { size: 40, color: C.soft, align: 'center' }));
    // r4: no tortoise in it
    A(ap(t, s('r4', 0.2)), () => {
      hand('no tortoise here, just “the slowest”', 760, 800, { size: 46, color: C.ink, align: 'center' });
      A(ap(t, mid('r4', 0.55)), () => {
        tortoise(1300, 815, t * 4, 0.3, 1, 1.3);
        hand('from later retellings', 1500, 806, { size: 40, color: C.red, align: 'left' });
      });
    });
  });
  // r5 on: the race, zoomed about the point where they will meet
  const on = ap(t, s('r5', 0.1), 0.8);
  if (on <= 0) return;
  const st = race2(t), S = steps2();
  const z = st.z, xa = offX(st.off, z), xt = offX(R * st.off, z);
  A(on, () => {
    zoomTrack(z, 1);
    // flags where the tortoise was when each of the first stages began
    for (let j = 1; j <= 4; j++) {
      const from = j === 1 ? s('r6', 0.3) : S[j - 2][2] + 0.3, gone = S[j - 1][2];
      flag(offX(-MEET * Math.pow(R, j), z), TR.y - 2, seg(t, from, from + 0.4) * (1 - seg(t, gone - 0.3, gone)));
    }
    achilles(xa, TR.y - 3, st.phase, st.amp);
    tortoise(xt, TR.y - 3, t * 6, 0.3 + 0.7 * st.amp);
    nameTags(xa, xt, TR.y + 120, 1 - seg(t, s('r7'), s('r7', 0.5)));
    // r5: the speeds
    A(span(t, s('r5', 0.6), s('r7', 0.6), 0.5, 0.5), () => {
      tag('10 m/s', xa + 10, TR.y + 190, { col: C.ink });
      tag('1 m/s', xt + 8, TR.y + 190, { col: C.red });
    });
    bracket(xa, xt, TR.y - 240, '100 m head start', span(t, s('r6', 0.2), s('r7', 0.6), 0.5, 0.5));
    // the gap after each of the first four stages
    for (let n = 1; n <= 4; n++) {
      const [, r1, z0] = S[n - 1];
      if (st.n === n) bracket(xa, xt, TR.y - 240, dist(GAP_N(n)), seg(t, r1 + 0.05, r1 + 0.4) * (1 - seg(t, z0 - 0.1, z0 + 0.3)), { col: C.red, size: 44 });
    }
    // stage counter, race clock and magnification
    A(seg(t, s('r7', 0.1), s('r7', 0.6)), () => {
      serif(`Stage ${Math.max(1, st.n)}`, 140, 190, { size: 72, weight: 700 });
      const tr = (MEET + st.off) / VA, digits = Math.min(6, Math.max(0, st.n - 1));
      hand(`clock: ${tr.toFixed(digits)} s`, 140, 256, { size: 44, color: C.soft });
      const label = z < 0.02 ? 'actual size' : z < 3.5 ? `magnified ×${fmt(Math.pow(10, Math.round(z * 100) / 100))}` : `magnified ×${pow10(Math.round(z))}`;
      hand(label, 1790, 190, { size: 44, color: C.soft, align: 'right' });
    });
    // the ledger
    const LX = [180, 560, 860, 1160], LY = 780;
    A(seg(t, S[0][1], S[0][1] + 0.5), () => {
      ['stage', 'Achilles runs', 'taking', 'gap left'].forEach((h, i) => hand(h, LX[i], LY, { size: 34, color: C.faint, align: i ? 'right' : 'left' }));
      cline(150, LY + 14, 1200, LY + 14, { w: 2, a: 0.5 });
    });
    for (let n = 1; n <= 4; n++) {
      const a = ap(t, S[n - 1][1], 0.5);
      if (a <= 0) continue;
      A(a, () => {
        const y = LY + 16 + n * 48;
        hand(`${n}`, LX[0] + 20, y, { size: 40, color: C.soft });
        hand(dist(GAP_N(n - 1)), LX[1], y, { size: 40, align: 'right' });
        hand(secs(GAP_N(n - 1) / VA), LX[2], y, { size: 40, align: 'right' });
        hand(dist(GAP_N(n)), LX[3], y, { size: 40, color: C.red, align: 'right' });
      });
    }
    A(ap(t, s('r11', 0.3)), () => hand('…', LX[0] + 20, LY + 16 + 4.8 * 48 + 2, { size: 40, color: C.soft }));
    A(ap(t, s('r11', 0.6)), () => {
      for (let n = 2; n <= 4; n++) hand('÷ 10', LX[3] + 40, LY + 16 + n * 48 - 22, { size: 30, color: C.red });
    });
    // the live gap
    A(seg(t, s('r7', 0.3), s('r7', 0.8)), () => {
      hand('gap', 1600, 790, { size: 40, color: C.soft, align: 'center' });
      gapLabel((1 - R) * -st.off, 1600, 880, 84);
    });
    // r12: always one more stage
    A(ap(t, s('r12', 0.4)), () => {
      hand('there is always one more stage', W / 2, 320, { size: 52, color: C.red, align: 'center' });
    });
  });
}

// ---------- small drawn symbols ----------
/** A stacked fraction (num over den) centred at x, its bar at y. */
function frac(num, den, x, y, { size = 44, col = C.ink, family = HAND } = {}) {
  const w = Math.max(measure(String(num), size, family), measure(String(den), size, family)) + 10;
  txt(String(num), x, y - 8, { size, family, color: col, align: 'center' });
  cline(x - w / 2, y, x + w / 2, y, { w: 2.5, col });
  txt(String(den), x, y + size * 0.86, { size, family, color: col, align: 'center' });
}
function tick(x, y, sz, p, col = C.ink) { cpath([[x - sz * 0.5, y], [x - sz * 0.12, y + sz * 0.4], [x + sz * 0.55, y - sz * 0.5]], { w: sz * 0.14, col, p }); }
function cross(x, y, sz, p, col = C.red) {
  cline(x - sz / 2, y - sz / 2, x + sz / 2, y + sz / 2, { w: sz * 0.14, col, p: clamp(p * 2) });
  cline(x + sz / 2, y - sz / 2, x - sz / 2, y + sz / 2, { w: sz * 0.14, col, p: clamp(p * 2 - 1) });
}
/** Axes for a chart: [x0, x1] by [y0 (bottom), y1 (top)], drawn on to p. */
function axes(x0, x1, y0, y1, p, a = 1) {
  A(a, () => { cline(x0, y0, x0, y1, { w: 3, p }); cline(x0, y0, x1, y0, { w: 3, p }); });
}

// ---------- 3: adding up forever ----------
function part3(t) {
  const leftOut = seg(t, s('a10', -0.3), s('a10', 0.4));
  // left: the sums
  A(1 - leftOut, () => {
    heading('Add up the stages', 140, 170, ap(t, s('a1', 0.2)), { align: 'left', size: 60, p: eio(seg(t, s('a1', 0.4), s('a1', 1.4))) });
    const terms = ['100', '+ 10', '+ 1', '+ 0.1', '+ 0.01', '+ …'];
    let x = 140;
    terms.forEach((tm, i) => {
      const a = ap(t, lerp(s('a2', 0.3), e('a2', -0.3), i / (terms.length - 1)), 0.4);
      A(a, () => hand(tm, x, 290, { size: 60, color: i ? C.ink : C.ink }));
      x += measure(tm, 60) + 22;
    });
    A(ap(t, s('a2', 0.2)), () => hand('metres', x + 4, 290, { size: 40, color: C.soft }));
    // running totals
    for (let n = 1; n <= 5; n++) {
      const a = ap(t, lerp(s('a3', 0.5), e('a3', -0.4), (n - 1) / 4), 0.4);
      A(a, () => {
        const y = 380 + (n - 1) * 60;
        hand(`after ${n} stage${n > 1 ? 's' : ''}`, 160, y, { size: 38, color: C.soft });
        hand(`${fixedTotal(TOTALS[n], n)} m`, 700, y, { size: 46, align: 'right' });
      });
    }
    A(ap(t, s('a4', 0.2)), () => {
      cline(160, 668, 720, 668, { w: 2, a: 0.4 });
      hand('they close in on', 160, 726, { size: 38, color: C.soft });
      serif('111.111… m', 700, 728, { size: 52, weight: 700, color: C.red, align: 'right' });
      A(ap(t, mid('a4', 0.5)), () => { hand('= 111', 770, 728, { size: 46, color: C.red }); frac(1, 9, 900, 712, { size: 34, col: C.red }); hand('m', 930, 728, { size: 46, color: C.red }); });
    });
    A(ap(t, s('a5', 0.2)), () => {
      hand('times: 10 + 1 + 0.1 + … =', 160, 830, { size: 46 });
      const x2 = 160 + measure('times: 10 + 1 + 0.1 + … =', 46) + 18;
      hand('11', x2, 830, { size: 46, color: C.red }); frac(1, 9, x2 + measure('11', 46) + 22, 814, { size: 32, col: C.red }); hand('s', x2 + measure('11', 46) + 46, 830, { size: 46, color: C.red });
    });
    A(ap(t, s('a6', 0.2)), () => serif('infinitely many stages, a finite distance, a finite time', 140, 940, { size: 46, italic: true }));
  });
  // right: the totals as a chart, then distance against time
  const gx0 = 1080, gx1 = 1760, gy0 = 880, gy1 = 230;
  const chartA = span(t, s('a3', 0.2), s('a7', 0.5), 0.6, 0.6) * (1 - leftOut);
  A(chartA, () => {
    const sx = (n) => lerp(gx0, gx1, n / 8), sy = (m) => lerp(gy0, gy1, m / 125);
    axes(gx0, gx1, gy0, gy1, eio(seg(t, s('a3', 0.2), s('a3', 1.2))));
    for (let n = 0; n <= 8; n++) hand(`${n}`, sx(n), gy0 + 44, { size: 30, color: C.soft, align: 'center' });
    hand('stages', gx1, gy0 + 86, { size: 32, color: C.soft, align: 'right' });
    for (const m of [0, 50, 100]) hand(`${m}`, gx0 - 16, sy(m) + 10, { size: 30, color: C.soft, align: 'right' });
    hand('running total (m)', gx0 + 10, gy1 - 20, { size: 32, color: C.soft });
    A(ap(t, s('a4', 0.1)), () => {
      ctx.save(); ctx.setLineDash([12, 10]); cline(gx0, sy(MEET), gx1, sy(MEET), { w: 2.5, col: C.red }); ctx.restore();
      hand('111.1', gx1 + 10, sy(MEET) + 10, { size: 32, color: C.red });
    });
    const pts = [];
    for (let n = 0; n <= 8; n++) {
      const at = n === 0 ? s('a3', 0.3) : lerp(s('a3', 0.5), e('a3', -0.4), Math.min(1, (n - 1) / 4)) + Math.max(0, n - 5) * 0.25;
      if (t < at) break;
      pts.push([sx(n), sy(TOTALS[n])]);
    }
    cpath(pts, { w: 3, a: 0.7 });
    pts.forEach(([x, y]) => dot(x, y, 8, C.ink));
  });
  const graphA = span(t, s('a7', 0.2), s('a10', 0.4), 0.6, 0.6);
  A(graphA, () => {
    const sx = (x) => lerp(gx0, gx1, x / 14), sy = (m) => lerp(gy0, gy1, m / 150);
    axes(gx0, gx1, gy0, gy1, eio(seg(t, s('a7', 0.2), s('a7', 1.0))));
    for (let x = 0; x <= 14; x += 2) hand(`${x}`, sx(x), gy0 + 44, { size: 30, color: C.soft, align: 'center' });
    hand('time (s)', gx1, gy0 + 86, { size: 32, color: C.soft, align: 'right' });
    for (const m of [0, 50, 100, 150]) hand(`${m}`, gx0 - 16, sy(m) + 10, { size: 30, color: C.soft, align: 'right' });
    hand('distance (m)', gx0 + 10, gy1 - 20, { size: 32, color: C.soft });
    const lp = eio(seg(t, s('a7', 0.6), mid('a7', 0.6)));
    cline(sx(0), sy(0), sx(14 * lp), sy(140 * lp), { w: 4, col: C.ink });
    cline(sx(0), sy(100), sx(14 * lp), sy(100 + 14 * lp), { w: 4, col: C.red });
    A(ap(t, mid('a7', 0.4)), () => { hand('Achilles', sx(7.2), sy(80), { size: 36, align: 'left' }); hand('tortoise', sx(2), sy(104) - 18, { size: 36, color: C.red }); });
    A(ap(t, mid('a7', 0.7)), () => {
      dot(sx(T_MEET), sy(MEET), 11, C.red);
      ctx.save(); ctx.setLineDash([8, 8]);
      cline(sx(T_MEET), sy(MEET), sx(T_MEET), gy0, { w: 2, a: 0.5 }); cline(sx(T_MEET), sy(MEET), gx0, sy(MEET), { w: 2, a: 0.5 });
      ctx.restore();
      hand('11.1 s', sx(T_MEET), gy0 - 14, { size: 32, color: C.red, align: 'center' });
      hand('111.1 m', gx0 + 12, sy(MEET) - 12, { size: 32, color: C.red });
    });
    // a8: Zeno's staircase between the lines: across to where the tortoise was, then up to where it is now
    const sp = seg(t, s('a8', 0.1), e('a8', -0.2));
    const stair = [[sx(0), sy(100)]];
    for (let n = 1; n <= 7; n++) { stair.push([sx(T_N(n)), sy(A_N(n))]); stair.push([sx(T_N(n)), sy(tortoiseAt(A_N(n)))]); }
    cpath(stair, { w: 3, col: C.ink, p: sp, a: 0.85 });
    // an inset, magnified 20 times about the crossing
    A(ap(t, mid('a8', 0.5)), () => {
      const bx = 1100, by = 250, bw = 330, bh = 210, mg = 20;
      const ix = (tt) => bx + bw * 0.78 + (tt - T_MEET) * (bw / 14) * mg, iy = (m) => by + bh * 0.3 - (m - MEET) * ((gy0 - gy1) / 150) * mg;
      ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); fillGrain(C.paper, 0.85); ctx.clip();
      cline(ix(T_MEET - 2), iy(MEET - 20), ix(T_MEET + 1), iy(MEET + 10), { w: 3 });
      cline(ix(T_MEET - 2), iy(MEET - 2), ix(T_MEET + 1), iy(MEET + 1), { w: 3, col: C.red });
      const st2 = []; for (let n = 1; n <= 9; n++) { st2.push([ix(T_N(n)), iy(A_N(n))]); st2.push([ix(T_N(n)), iy(tortoiseAt(A_N(n)))]); }
      cpath(st2, { w: 2.5, p: seg(t, mid('a8', 0.5), e('a8', 0.3)) });
      dot(ix(T_MEET), iy(MEET), 7, C.red);
      ctx.restore();
      cpath([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], { w: 2.5, close: true, a: 0.7 });
      hand('magnified ×20', bx + 10, by + bh + 36, { size: 30, color: C.soft });
    });
    A(ap(t, s('a9', 0.2)), () => hand('caught here, after every stage', sx(T_MEET) - 30, sy(MEET) - 70, { size: 38, color: C.red, align: 'right' }));
  });
  // a10–a13: the myth, and Zeno's real worry
  A(seg(t, s('a10', 0.1), s('a10', 0.8)), () => {
    const y = 250;
    serif('infinitely many pieces', 560, y, { size: 56, italic: true, align: 'center' });
    hand('must add up to', 960, y, { size: 44, color: C.soft, align: 'center' });
    serif('something infinite?', 1360, y, { size: 56, italic: true, align: 'center' });
    A(ap(t, s('a11', 0.2)), () => {
      cline(300, y - 18, 1620, y - 22, { w: 6, col: C.red, p: eio(seg(t, s('a11', 0.2), s('a11', 1.0))) });
      hand('no ancient source has Zeno discussing an infinite sum', W / 2, y + 80, { size: 42, color: C.red, align: 'center' });
    });
    quote('it is impossible to traverse an infinite number of things in a finite time', W / 2, 560, 1300, ap(t, s('a12', 0.2), 0.8), { size: 58, src: 'Zeno, as reported by Simplicius', reveal: seg(t, s('a12', 0.2), mid('a12', 0.9)) });
    A(ap(t, s('a13', 0.2)), () => {
      const y2 = 850;
      hand('the total:', 560, y2, { size: 46, color: C.soft, align: 'right' });
      hand('finite', 590, y2, { size: 50 });
      tick(740, y2 - 16, 46, eio(seg(t, s('a13', 0.4), s('a13', 0.9))));
      hand('finishing endless steps, with no last one:', 1420, y2, { size: 46, color: C.soft, align: 'right' });
      serif('?', 1480, y2 + 4, { size: 90, weight: 700, color: C.red, align: 'center' });
    });
  });
}

// ---------- 4: half, then half again ----------
const D4 = { y: 560, x0: 220, x1: 1700 };
const dx4 = (f) => lerp(D4.x0, D4.x1, f);
function part4(t) {
  quote('that which is in locomotion must arrive at the half-way stage before it arrives at the goal', W / 2, 230, 1400, span(t, s('d2', -0.2), s('d7', 0.4), 0.6, 0.6), { size: 52, src: 'Aristotle, Physics VI.9', reveal: seg(t, s('d2', 0.2), mid('d2', 0.9)) });
  A(ap(t, s('d1', 0.2)) * (1 - seg(t, s('d2', -0.4), s('d2', 0.2))), () => serif('the dichotomy', W / 2, 250, { size: 96, italic: true, align: 'center' }));
  const forward = 1 - seg(t, s('d7', -0.2), s('d7', 0.5));
  // the track: 100 m
  const on = ap(t, s('d1', 0.3), 0.9);
  A(on, () => {
    cline(D4.x0, D4.y, D4.x1, D4.y, { w: 4, p: eio(seg(t, s('d1', 0.3), s('d1', 1.6))) });
    cline(D4.x0, D4.y - 26, D4.x0, D4.y + 26, { w: 4 });
    cline(D4.x1, D4.y - 40, D4.x1, D4.y + 26, { w: 4, col: C.red });
    hand('start', D4.x0, D4.y + 70, { size: 34, color: C.soft, align: 'center' });
    hand('goal, 100 m', D4.x1, D4.y + 70, { size: 34, color: C.red, align: 'center' });
  });
  // d3–d6: half, then half of what's left …, counted up to 20 halvings
  const hops = [s('d3', 0.4), mid('d3', 0.55), e('d3', -0.3), s('d4', 0.4), mid('d4', 0.5), e('d4', -0.4)];
  const nAt = (tt) => {
    let n = 0, f = 0;
    for (let i = 0; i < hops.length; i++) { if (tt >= hops[i]) { n = i + 1; f = 1; } else { f = clamp((tt - (hops[i] - 0.6)) / 0.6); if (f > 0) { n = i + f; } break; } }
    if (tt > s('d5')) n = Math.max(n, 6 + 4 * eio(seg(tt, s('d5', 0.2), s('d5', 1.6))));
    if (tt > s('d6')) n = Math.max(n, 10 + 10 * eio(seg(tt, s('d6', 0.1), s('d6', 1.4))));
    return n;
  };
  const nh = nAt(t);
  A(forward * on, () => {
    const done = 1 - Math.pow(0.5, nh);
    // the marks, halfway, then halfway again …
    for (let i = 1; i <= Math.min(24, Math.ceil(nh)); i++) {
      const x = dx4(1 - Math.pow(0.5, i)), al = clamp(nh - i + 1);
      cline(x, D4.y - 22 * Math.pow(0.9, i), x, D4.y + 22 * Math.pow(0.9, i), { w: 2.5, a: al });
    }
    // brackets for the first steps
    const labels = ['50 m', '25 m', '12.5 m', '6.25 m'];
    for (let i = 0; i < 4; i++) {
      const a = clamp(nh - i) * (1 - seg(t, s('d5', -0.3), s('d5', 0.3)));
      bracket(dx4(1 - Math.pow(0.5, i)), dx4(1 - Math.pow(0.5, i + 1)), D4.y - 70, labels[i], a, { size: i < 2 ? 40 : 32, col: i % 2 ? C.red : C.ink });
    }
    achilles(dx4(done), D4.y - 3, nh * 3, nh < 6 && nh % 1 > 0.001 ? 0.8 : 0, 1);
    // d4: the running totals as fractions, under their marks
    const fr = [[1, 2], [3, 4], [7, 8], [15, 16]];
    fr.forEach(([a1, b1], i) => {
      const a = ap(t, lerp(s('d4', 0.3), mid('d4', 0.85), i / 3), 0.4) * (1 - seg(t, s('d5', -0.3), s('d5', 0.3)));
      if (a > 0) A(a, () => frac(a1, b1, dx4(1 - Math.pow(0.5, i + 1)), D4.y + 150, { size: 40, col: i % 2 ? C.red : C.ink }));
    });
    // d5, d6: the counter
    A(ap(t, s('d5', 0.1)), () => {
      const n = Math.floor(nh + 1e-9), left = 100 * Math.pow(0.5, n);
      serif(`${n} halvings`, 220, 830, { size: 64, weight: 700 });
      hand(`run: ${fmt(Math.pow(2, n) - 1)} parts in ${fmt(Math.pow(2, n))}`, 820, 830, { size: 46 });
      hand('left:', 1380, 830, { size: 46, color: C.soft });
      serif(dist(left), 1700, 834, { size: 60, weight: 700, color: C.red, align: 'right' });
    });
    A(ap(t, mid('d6', 0.6)), () => hand('but always a half still to run', W / 2, 930, { size: 44, color: C.red, align: 'center' }));
  });
  // d7, d8: the other way round: before half, a quarter; before that, an eighth …
  A(seg(t, s('d7', 0.1), s('d7', 0.7)) * on * (1 - seg(t, s('d9', -0.2), s('d9', 0.4))), () => {
    const q = seg(t, s('d7', 0.6), e('d8', -0.5)), nn = 1 + 16 * eio(q);
    for (let i = 1; i <= Math.ceil(nn); i++) {
      const x = dx4(Math.pow(0.5, i)), al = clamp(nn - i + 1);
      cline(x, D4.y - 22 * Math.pow(0.9, i), x, D4.y + 22 * Math.pow(0.9, i), { w: 2.5, a: al, col: i === 1 ? C.red : C.ink });
      if (i <= 3) A(al, () => frac(1, 2 ** i, x, D4.y + 150, { size: 40 }));
    }
    achilles(D4.x0, D4.y - 3, 0, 0, 1);
    A(ap(t, s('d8', 0.2)), () => {
      hand('no first step', D4.x0 + 40, 360, { size: 52, color: C.red });
      serif('?', D4.x0 + 360, 368, { size: 90, weight: 700, color: C.red });
    });
  });
  // d9: the same argument, by halves or by tenths
  A(seg(t, s('d9', 0.1), s('d9', 0.8)), () => {
    const rows = [[0.5, 'dichotomy: each step half the last', 360], [0.1, 'Achilles: each gap a tenth of the last', 640]];
    for (const [r, label, y] of rows) {
      hand(label, 220, y - 60, { size: 44, color: r === 0.1 ? C.red : C.ink });
      cline(220, y, 1700, y, { w: 3.5 });
      let f = 0, gapf = 1;
      for (let i = 0; i < 18; i++) { gapf *= r === 0.5 ? 0.5 : 0.1; f = 1 - gapf; const x = lerp(220, 1700, f); cline(x, y - 20 * Math.pow(0.85, i), x, y + 20 * Math.pow(0.85, i), { w: 2.5, a: clamp(seg(t, s('d9', 0.3), e('d9')) * 18 - i) }); }
      cline(1700, y - 34, 1700, y + 34, { w: 4, col: C.red });
    }
  });
}

// ---------- 5: the arrow and the stadium ----------
/** An arrow pointing right: charcoal shaft, sanguine fletching; x is the tip. */
function arrow(x, y, a = 1, sc = 1) {
  if (a <= 0) return;
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    cline(-260, 0, -18, 0, { w: 6 });
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34, -16); ctx.lineTo(-26, 0); ctx.lineTo(-34, 16); ctx.closePath(); fillGrain(C.ink);
    for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-210, 0); ctx.lineTo(-262, sg * 24); ctx.lineTo(-282, sg * 24); ctx.lineTo(-240, 0); ctx.closePath(); fillGrain(C.red, 0.95); }
    ctx.restore();
  });
}
const ARROW_V = 50; // m/s, the example's speed
function part5(t) {
  // w1–w4: the flight, frozen
  const flyOut = seg(t, s('w5', -0.3), s('w5', 0.4));
  A(1 - flyOut, () => {
    const y = 330, x0 = 420, x1 = 1500;
    const freeze = s('w2', 1.2);
    const q = seg(t, s('w1', 0.4), freeze + 1.4);
    const xNow = t < freeze ? lerp(x0, x1, seg(t, s('w1', 0.4), freeze + 1.4)) : lerp(x0, x1, seg(freeze, s('w1', 0.4), freeze + 1.4));
    cline(160, y + 120, 1760, y + 120, { w: 2, a: 0.35 });
    arrow(xNow, y, ap(t, s('w1', 0.2)));
    if (q > 0 && t < freeze) for (let i = 1; i <= 4; i++) cline(xNow - 300 - i * 50, y + (i - 2.5) * 10, xNow - 300 - i * 50 - 60, y + (i - 2.5) * 10, { w: 2, a: 0.3 });
    A(ap(t, freeze), () => {
      hand('one instant', xNow - 140, y - 90, { size: 44, color: C.red, align: 'center' });
      hand('t = 0.000 s', xNow - 140, y + 90, { size: 36, color: C.soft, align: 'center' });
    });
    A(ap(t, s('w3', 0.3)), () => {
      ctx.save(); ctx.setLineDash([12, 9]);
      cpath([[xNow - 296, y - 40], [xNow + 10, y - 40], [xNow + 10, y + 40], [xNow - 296, y + 40]], { w: 2.5, close: true, col: C.red });
      ctx.restore();
      hand('a space exactly its own size: at rest', xNow + 40, y + 12, { size: 38, color: C.red });
    });
    // w4: the whole flight, instant by instant
    A(ap(t, s('w4', 0.1)), () => {
      for (let i = 0; i < 7; i++) {
        const a = ap(t, lerp(s('w4', 0.1), mid('w4', 0.7), i / 6), 0.3);
        if (a <= 0) continue;
        A(a, () => {
          const fx = 160 + i * 230, fy = 640, fw = 210, fh = 150;
          cpath([[fx, fy], [fx + fw, fy], [fx + fw, fy + fh], [fx, fy + fh]], { w: 2.5, close: true, a: 0.75 });
          arrow(fx + 40 + i * 24 + 110, fy + fh / 2, 1, 0.45);
          hand('at rest', fx + fw / 2, fy + fh + 40, { size: 32, color: C.soft, align: 'center' });
        });
      }
      A(ap(t, mid('w4', 0.75)), () => hand('so when does it move?', W / 2, 920, { size: 52, color: C.red, align: 'center' }));
    });
  });
  quote('Time is not composed of indivisible nows any more than any other magnitude is composed of indivisibles.', W / 2, 420, 1400, span(t, s('w5', 0.1), s('w6', 0.5), 0.6, 0.5), { size: 56, src: 'Aristotle, Physics VI.9' });
  // w6–w10: speed as a limit
  const limA = span(t, s('w6', 0.2), s('w11', 0.4), 0.6, 0.6);
  A(limA, () => {
    heading('speed at an instant', 140, 190, 1, { align: 'left', size: 60, p: eio(seg(t, s('w6', 0.3), s('w6', 1.3))) });
    const rows = [[1, s('w7', 0.2)], [0.1, mid('w7', 0.6)], [0.01, s('w8', 0.1)], [0.001, mid('w8', 0.5)], [0, s('w9', 0.3)]];
    const cx = [1080, 1360, 1720], y0 = 300;
    ['time', 'distance', 'distance ÷ time'].forEach((h, i) => hand(h, cx[i], y0, { size: 36, color: C.faint, align: 'right' }));
    cline(900, y0 + 16, 1740, y0 + 16, { w: 2, a: 0.5 });
    let cur = 1;
    rows.forEach(([dt, at], i) => {
      const a = ap(t, at, 0.4);
      if (a <= 0) return;
      cur = dt;
      A(a, () => {
        const y = y0 + 70 + i * 66, last = dt === 0;
        hand(last ? '0 s' : secs(dt), cx[0], y, { size: 44, align: 'right' });
        hand(last ? '0 m' : dist(ARROW_V * dt), cx[1], y, { size: 44, align: 'right' });
        if (last) serif('0 ÷ 0 = ?', cx[2], y, { size: 46, weight: 700, color: C.red, align: 'right' });
        else hand('50 m/s', cx[2], y, { size: 44, color: C.red, align: 'right' });
      });
    });
    // left: the arrow and the distance it covers in the current interval (1 s = 600 px)
    const ry = 520, rx = 160, px1 = 600;
    cline(rx, ry + 60, rx + 660, ry + 60, { w: 2.5, a: 0.5 });
    arrow(rx + 300, ry, 1, 0.8);
    const shown = cur === 0 ? 0 : px1 * cur;
    const prev = 1;
    const wNow = cur === 0 ? lerp(px1 * 0.001, 0, seg(t, s('w9', 0.3), s('w9', 0.9))) : shown;
    if (wNow > 0.5) bracket(rx + 300, rx + 300 + wNow, ry - 70, cur >= 0.1 ? dist(ARROW_V * cur) : '', 1, { col: C.red, size: 38 });
    else dot(rx + 300, ry - 70, 6, C.red);
    A(ap(t, s('w10', 0.2)), () => {
      hand('as the time shrinks, the ratio stays at', 160, 760, { size: 42 });
      serif('50 m/s', 160, 840, { size: 72, weight: 700, color: C.red });
      hand('that limit is the speed at the instant', 470, 836, { size: 40, color: C.soft });
    });
    void prev;
  });
  // w11: a different place at each time
  A(span(t, s('w11', 0.2), s('w12', 0.4), 0.6, 0.5), () => {
    const x0 = 300, x1 = 1620, y0 = 820, y1 = 300;
    axes(x0, x1, y0, y1, eio(seg(t, s('w11', 0.2), s('w11', 1.0))));
    hand('time', x1, y0 + 50, { size: 36, color: C.soft, align: 'right' });
    hand('place', x0 + 12, y1 - 16, { size: 36, color: C.soft });
    const n = Math.floor(40 * seg(t, s('w11', 0.6), e('w11', -0.4)));
    for (let i = 0; i <= n; i++) dot(lerp(x0 + 40, x1 - 40, i / 40), lerp(y0 - 40, y1 + 40, i / 40), 5, C.red);
    A(ap(t, mid('w11', 0.6)), () => hand('one place at each instant, different places at different times', 1000, 230, { size: 40, align: 'center' }));
  });
  // w12–w15: the stadium
  const stA = seg(t, s('w12', 0.1), s('w12', 0.8));
  A(stA, () => {
    const bw = 150, bh = 84, X0 = 660, rows = { B: 330, A: 480, C: 630 };
    const q = eio(seg(t, s('w13', 0.3), e('w13', -0.3)));
    const posB = (i) => i - 2 + 2 * q, posC = (i) => i + 2 - 2 * q;
    const bx = (p) => X0 + p * bw;
    const block = (p, y, kind) => {
      const x = bx(p) + 6, w = bw - 12;
      const shape = () => { ctx.beginPath(); ctx.rect(x, y - bh / 2, w, bh); };
      if (kind === 'A') hatch(shape, x, y - bh / 2, x + w, y + bh / 2, { gap: 11, a: 0.45 });
      if (kind === 'C') { shape(); fillGrain(C.red, 0.22); }
      cpath([[x, y - bh / 2], [x + w, y - bh / 2], [x + w, y + bh / 2], [x, y + bh / 2]], { w: 3, close: true, col: kind === 'C' ? C.red : C.ink });
    };
    for (let i = 0; i < 4; i++) { block(i, rows.A, 'A'); block(posB(i), rows.B, 'B'); block(posC(i), rows.C, 'C'); }
    hand('still', 260, rows.A + 14, { size: 40, color: C.soft });
    hand('moving right', 260, rows.B + 14, { size: 40 });
    hand('moving left', 260, rows.C + 14, { size: 40, color: C.red });
    // the front block of the top row, and what it has passed
    const lead = posB(3) + 0.5;
    dot(bx(lead) - 4, rows.B, 9, C.red, ap(t, s('w13', 0.1)));
    const passedC = [0, 1, 2, 3].filter((j) => lead >= posC(j) + 0.5 - 1e-6).length, passedA = [0, 1, 2, 3].filter((i) => lead >= i + 0.5 - 1e-6 && i >= 2).length;
    A(ap(t, s('w13', 0.2)), () => {
      hand('front block has passed', 1440, 300, { size: 38, color: C.soft });
      hand(`${passedC} oncoming blocks`, 1440, 360, { size: 46, color: C.red });
      hand(`${passedA} still blocks`, 1440, 420, { size: 46 });
    });
    A(ap(t, s('w14', 0.2)), () => serif('half the time = double the time ?', W / 2, 820, { size: 64, italic: true, align: 'center' }));
    A(ap(t, s('w15', 0.2)), () => {
      cross(W / 2 + 520, 800, 56, eio(seg(t, s('w15', 0.2), s('w15', 0.9))));
      hand('relative to each other, the moving rows close at twice the speed', W / 2, 920, { size: 42, color: C.red, align: 'center' });
    });
  });
}

// ---------- 6: Aristotle's answer ----------
function divLine(x0, x1, y, marks, { a = 1, col = C.ink, solid = 1 } = {}) {
  if (a <= 0) return;
  A(a, () => {
    cline(x0, y, x1, y, { w: 3.5 });
    marks.forEach(([f, al]) => { if (al > 0) cline(lerp(x0, x1, f), y - 18, lerp(x0, x1, f), y + 18, { w: 2.5, a: al * solid, col }); });
  });
}
function part6(t) {
  // p1–p3: Diogenes walks
  const dA = span(t, s('p1', 0.2), s('p5', 0.3), 0.6, 0.6);
  A(dA, () => {
    const gy = 760;
    cline(160, gy, 1760, gy, { w: 3, a: 0.6 });
    const q = seg(t, s('p2', 0.4), e('p3', 0.4));
    const x = lerp(260, 1500, q);
    walker(x, gy - 2, q * 26, ap(t, s('p1', 0.6)));
    A(ap(t, s('p2', 0.1)), () => { hand('a story told by Simplicius', W / 2, 200, { size: 44, color: C.red, align: 'center' }); hand('Diogenes the Cynic hears Zeno’s arguments, says nothing, and walks', W / 2, 262, { size: 40, color: C.soft, align: 'center' }); });
    A(ap(t, s('p3', 0.2)), () => { serif('solvitur ambulando', W / 2, 420, { size: 96, italic: true, align: 'center' }); hand('it is solved by walking', W / 2, 500, { size: 48, color: C.soft, align: 'center' }); });
    A(ap(t, s('p4', 0.1)), () => {
      const steps = ['he must reach where it was', 'by then it has moved on', 'so he never catches up'];
      steps.forEach((st2, i) => {
        const x2 = 380 + i * 580, y2 = 620;
        hand(st2, x2, y2, { size: 38, color: i === 2 ? C.red : C.ink, align: 'center' });
        if (i < 2) hand('→', x2 + 290, y2, { size: 40, family: SERIF, color: C.soft, align: 'center' });
        if (i < 2) A(ap(t, mid('p4', 0.6)), () => serif('?', x2, y2 - 50, { size: 60, weight: 700, color: C.red, align: 'center' }));
      });
      cline(1160 - 170, 620 - 14, 1160 + 170, 620 - 18, { w: 5, col: C.red, p: eio(seg(t, s('p4', 0.4), s('p4', 1.1))) });
    });
  });
  // p5: shorter distances, shorter times
  A(span(t, s('p5', 0.1), s('p6', 0.5), 0.5, 0.5), () => {
    const x0 = 300, x1 = 1620;
    const n = 1 + 11 * eio(seg(t, s('p5', 0.3), mid('p5', 0.6)));
    const marks = Array.from({ length: 12 }, (_, i) => [1 - Math.pow(0.5, i + 1), clamp(n - i)]);
    hand('distance', x0, 330, { size: 40, color: C.soft });
    divLine(x0, x1, 400, marks);
    hand('time', x0, 560, { size: 40, color: C.red });
    divLine(x0, x1, 630, marks, { col: C.red });
    A(ap(t, mid('p5', 0.6)), () => hand('infinitely many pieces of time, too', W / 2, 790, { size: 50, color: C.red, align: 'center' }));
  });
  // p6–p8: two kinds of infinity
  const twoA = span(t, s('p6', 0.2), s('p10', 0.3), 0.6, 0.6);
  A(twoA, () => {
    const L = [200, 860], Rr = [1060, 1720], y = 400;
    serif('actual', (L[0] + L[1]) / 2, 230, { size: 72, weight: 700, align: 'center' });
    serif('potential', (Rr[0] + Rr[1]) / 2, 230, { size: 72, weight: 700, color: C.red, align: 'center' });
    cline(960, 180, 960, 600, { w: 2, a: 0.35 });
    // actual: every halving mark, all at once
    const aOn = ap(t, s('p7', 0.2), 0.8);
    divLine(L[0], L[1], y, Array.from({ length: 22 }, (_, i) => [1 - Math.pow(0.5, i + 1), aOn]), { a: 1 });
    A(ap(t, s('p7', 0.5)), () => hand('completed: all there at once', (L[0] + L[1]) / 2, y + 90, { size: 40, align: 'center' }));
    // potential: marks keep arriving, one at a time, and never finish
    const since = Math.max(0, t - s('p8', 0.2)), n = since > 0 ? 1 + since * 1.6 : 0;
    const nm = Math.min(22, Math.floor(n));
    divLine(Rr[0], Rr[1], y, Array.from({ length: nm }, (_, i) => [1 - Math.pow(0.5, i + 1), clamp(n - i)]), { col: C.red });
    if (n > 0) dot(lerp(Rr[0], Rr[1], 1 - Math.pow(0.5, Math.min(22, n))), y - 34, 7, C.red);
    A(ap(t, s('p8', 0.5)), () => hand('can always go on, never completed', (Rr[0] + Rr[1]) / 2, y + 90, { size: 40, color: C.red, align: 'center' }));
  });
  // p9: halves stay potential unless the runner stops at each
  A(span(t, s('p9', 0.1), s('p10', 0.4), 0.5, 0.5), () => {
    const x0 = 300, x1 = 1620, q = seg(t, s('p9', 0.4), e('p9', -0.3));
    const marks = Array.from({ length: 10 }, (_, i) => 1 - Math.pow(0.5, i + 1));
    // a continuous run: the halves stay faint
    const y1 = 740, y2 = 900;
    cline(x0, y1, x1, y1, { w: 3 });
    marks.forEach((f) => dot(lerp(x0, x1, f), y1, 5, C.ink, 0.25));
    achilles(lerp(x0, x1, eio(q)), y1 - 3, q * 30, q > 0 && q < 1 ? 0.9 : 0, 1, 0.9);
    hand('runs on: halves only potential', x0, y1 - 150, { size: 38, color: C.soft });
    // stopping at each half: the halves become actual
    cline(x0, y2, x1, y2, { w: 3 });
    let f = 0; const stops = 6;
    for (let i = 0; i < stops; i++) { const a0 = i / stops, a1 = (i + 0.7) / stops; const g = seg(q, a0, a1); if (g > 0) f = lerp(i ? marks[i - 1] : 0, marks[i], eio(g)); }
    marks.forEach((m, i) => dot(lerp(x0, x1, m), y2, 7, C.red, f >= m - 1e-6 ? 1 : 0.25));
    walker(lerp(x0, x1, f), y2 - 3, f * 40, 1, 0.85);
    hand('stops at each: halves made actual', x0, y2 - 140, { size: 38, color: C.red });
  });
  quote('If the units are actual, it is not possible: if they are potential, it is possible.', W / 2, 400, 1400, span(t, s('p10', 0.1), s('p11', 0.6) + 99, 0.6, 0.5), { size: 60, src: 'Aristotle, Physics VIII.8' });
  A(ap(t, s('p11', 0.2)), () => {
    const x0 = 360, x1 = 1560, y = 760, q = eio(seg(t, s('p11', 0.3), e('p11', 0.3)));
    ctx.save(); k.rrect(x0, y - 12, (x1 - x0) * q, 24, 12); fillGrain(C.red, 0.8); ctx.restore();
    hand('nearly all scholars agree with Aristotle', W / 2, y - 40, { size: 40, align: 'center' });
    hand('for about 1,500 years', W / 2, y + 70, { size: 48, color: C.red, align: 'center' });
  });
}

// ---------- 7: sums that settle ----------
// Archimedes' parabolic segment: y = x² under the chord y = 1, filled with triangles of area 1, 1/4, 1/16, … (per row)
function parabolaTri(level, x0, x1, out) {
  const m = (x0 + x1) / 2;
  out.push({ level, pts: [[x0, x0 * x0], [x1, x1 * x1], [m, m * m]] });
  if (level < 6) { parabolaTri(level + 1, x0, m, out); parabolaTri(level + 1, m, x1, out); }
}
const TRIS = (() => { const out = [{ level: 0, pts: [[-1, 1], [1, 1], [0, 0]] }]; parabolaTri(1, -1, 0, out); parabolaTri(1, 0, 1, out); return out; })();
const ARCH = Array.from({ length: 8 }, (_, n) => (4 / 3) * (1 - Math.pow(0.25, n + 1)));     // 1, 1.25, 1.3125, …
const GRANDI = Array.from({ length: 12 }, (_, n) => (n % 2 === 0 ? 1 : 0));                    // 1, 0, 1, 0, …
const HALVES = Array.from({ length: 12 }, (_, n) => 1 - Math.pow(0.5, n + 1));                 // 1/2, 3/4, …
function miniChart(vals, x0, x1, y0, y1, vmax, p, { col = C.ink, limit = null, n = vals.length } = {}) {
  axes(x0, x1, y0, y1, 1, 0.8);
  const sx = (i) => lerp(x0 + 20, x1 - 10, i / (n - 1)), sy = (v) => lerp(y0, y1, v / vmax);
  if (limit !== null) { ctx.save(); ctx.setLineDash([10, 9]); cline(x0, sy(limit), x1, sy(limit), { w: 2.5, col: C.red }); ctx.restore(); }
  const k2 = Math.floor(p * n);
  const pts = vals.slice(0, Math.max(1, k2)).map((v, i) => [sx(i), sy(v)]);
  if (k2 > 0) { cpath(pts, { w: 2.5, a: 0.6, col }); pts.forEach(([x, y]) => dot(x, y, 7, col)); }
}
function part7(t) {
  // m2–m5: Archimedes' triangles
  const arA = span(t, s('m2', 0.1), s('m6', 0.4), 0.6, 0.6);
  A(arA, () => {
    const cx = 540, sc = 330;
    const X = (x) => cx + x * sc, Y = (y) => 250 + y * 520;          // y = 1 (the chord) at the top, the vertex at the bottom
    // the parabola and its chord
    const curve = []; for (let i = 0; i <= 80; i++) { const x = -1.12 + (2.24 * i) / 80; curve.push([X(x), Y(x * x)]); }
    cpath(curve, { w: 4, p: eio(seg(t, s('m2', 0.3), s('m2', 1.6))) });
    cline(X(-1), Y(1), X(1), Y(1), { w: 3.5, col: C.red, p: eio(seg(t, s('m2', 1.0), s('m2', 1.8))) });
    const lv = 7 * seg(t, s('m3', 0.2), e('m3', -0.2));
    for (const tri of TRIS) {
      const a = clamp(lv - tri.level);
      if (a <= 0) continue;
      const P = tri.pts.map(([x, y]) => [X(x), Y(y)]);
      const shape = () => { ctx.beginPath(); ctx.moveTo(...P[0]); ctx.lineTo(...P[1]); ctx.lineTo(...P[2]); ctx.closePath(); };
      if (tri.level === 0) { shape(); fillGrain(C.red, 0.12 * a); }
      hatch(shape, Math.min(P[0][0], P[1][0]), Math.min(P[0][1], P[2][1]), Math.max(P[0][0], P[1][0]), Math.max(P[1][1], P[2][1]), { gap: 9 - tri.level * 0.6, a: 0.42 * a, ang: tri.level % 2 ? 0.9 : -0.9, w: 1.4 });
      cpath(P, { w: Math.max(1, 3 - tri.level * 0.35), close: true, a: a * 0.9 });
    }
    A(ap(t, s('m3', 0.6)), () => {
      hand('area of each row:', 1000, 290, { size: 40, color: C.soft });
      const rows = ['1', '¼', '1/16', '1/64', '1/256'];
      rows.forEach((r, i) => A(ap(t, lerp(s('m3', 0.6), e('m4', -0.3), i / 4), 0.4), () => {
        hand(`row ${i + 1}`, 1000, 360 + i * 56, { size: 40, color: C.soft });
        hand(r, 1200, 360 + i * 56, { size: 44, align: 'center', color: i ? C.ink : C.red });
        hand(`total ${ARCH[i].toFixed(i ? Math.min(6, 2 * i) : 0)}`, 1300, 360 + i * 56, { size: 40 });
      }));
    });
    A(ap(t, s('m4', 0.3)), () => hand('1 + ¼ + 1/16 + 1/64 + …', 1000, 690, { size: 50 }));
    A(ap(t, s('m5', 0.2)), () => {
      hand('= ', 1000, 790, { size: 54 });
      frac(4, 3, 1060, 772, { size: 52, col: C.red });
      hand('of the big triangle', 1110, 790, { size: 46, color: C.red });
      hand('Archimedes, 3rd century BC', 1000, 880, { size: 36, color: C.soft });
    });
  });
  // m6, m7: a slippery sum
  const grA = span(t, s('m6', 0.1), s('m8', 0.3), 0.5, 0.5);
  A(grA, () => {
    serif('1 − 1 + 1 − 1 + 1 − …', 140, 260, { size: 72, weight: 700 });
    A(ap(t, s('m7', 0.1)), () => { hand('(1 − 1) + (1 − 1) + … = 0 + 0 + … =', 140, 400, { size: 50 }); serif('0', 140 + measure('(1 − 1) + (1 − 1) + … = 0 + 0 + … =', 50) + 24, 402, { size: 64, weight: 700, color: C.red }); });
    A(ap(t, mid('m7', 0.5)), () => { hand('1 + (− 1 + 1) + (− 1 + 1) + … = 1 + 0 + … =', 140, 500, { size: 50 }); serif('1', 140 + measure('1 + (− 1 + 1) + (− 1 + 1) + … = 1 + 0 + … =', 50) + 24, 502, { size: 64, weight: 700, color: C.red }); });
    A(ap(t, s('m6', 0.6)), () => { hand('running totals', 1180, 640, { size: 36, color: C.soft }); miniChart(GRANDI, 1180, 1760, 900, 680, 1.2, seg(t, s('m6', 0.6), e('m7', -0.2)), { col: C.red }); });
  });
  // m8–m10: Cauchy, 1821
  const caA = span(t, s('m8', 0.1), s('m11', 0.3), 0.5, 0.5);
  A(caA, () => {
    const bx = 160, by = 220, bw = 420, bh = 300;
    cpath([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], { w: 3, close: true, p: eio(seg(t, s('m8', 0.1), s('m8', 1.0))) });
    cline(bx + 26, by, bx + 26, by + bh, { w: 2, a: 0.5 });
    A(ap(t, s('m8', 0.6)), () => {
      serif('Cours d’analyse', bx + bw / 2 + 12, by + 110, { size: 46, italic: true, align: 'center' });
      hand('A.-L. Cauchy', bx + bw / 2 + 12, by + 180, { size: 40, align: 'center' });
      hand('1821', bx + bw / 2 + 12, by + 240, { size: 40, color: C.red, align: 'center' });
    });
    A(ap(t, s('m9', 0.2)), () => {
      hand('an infinite sum = the number its running totals settle down to,', 700, 300, { size: 44 });
      hand('if they settle at all', 700, 370, { size: 44, color: C.red });
    });
    A(ap(t, s('m10', 0.1)), () => {
      hand('½ + ¼ + ⅛ + …', 300, 640, { size: 48, align: 'center' });
      miniChart(HALVES, 160, 900, 940, 700, 1.2, seg(t, s('m10', 0.2), mid('m10', 0.6)), { limit: 1 });
      A(ap(t, mid('m10', 0.45)), () => { hand('= 1', 560, 640, { size: 52, color: C.red }); tick(680, 624, 44, eio(seg(t, mid('m10', 0.5), mid('m10', 0.7)))); });
      hand('1 − 1 + 1 − …', 1180, 640, { size: 48, align: 'center', color: C.red });
      miniChart(GRANDI, 1040, 1780, 940, 700, 1.2, seg(t, mid('m10', 0.4), e('m10', -0.1)), { col: C.red });
      A(ap(t, mid('m10', 0.8)), () => hand('no sum', 1430, 640, { size: 52, color: C.red }));
    });
  });
  // m11: Weierstrass, 1861
  A(span(t, s('m11', 0.1), s('m12', 0.4), 0.5, 0.5), () => {
    serif('Karl Weierstrass, 1861', W / 2, 280, { size: 64, weight: 700, align: 'center' });
    const L = ['for every margin ε, however small,', 'there is a stage after which', 'every running total stays within ε of the limit'];
    L.forEach((ln, i) => A(ap(t, lerp(s('m11', 0.6), e('m11', -0.3), i / 2), 0.4), () => serif(ln, W / 2, 420 + i * 80, { size: 54, italic: true, align: 'center', color: i === 2 ? C.red : C.ink })));
  });
  // m12–m14: Achilles' totals, closing in: how far short of 111.1 m after each stage (log scale)
  A(seg(t, s('m12', 0.1), s('m12', 0.7)), () => {
    const x0 = 300, x1 = 1680, y0 = 900, y1 = 240;
    const lo = -10, hi = 3, sy = (m) => lerp(y0, y1, (Math.log10(m) - lo) / (hi - lo));
    axes(x0, x1, y0, y1, eio(seg(t, s('m12', 0.1), s('m12', 0.9))));
    hand('how far short of 111.1 m after each stage (each line is ten times smaller)', x0 + 10, y1 - 26, { size: 34, color: C.soft });
    for (const [m, lb] of [[100, '100 m'], [1, '1 m'], [0.01, '1 cm'], [1e-4, '0.1 mm'], [1e-6, '1 μm'], [1e-8, '10 nm']]) {
      hand(lb, x0 - 16, sy(m) + 10, { size: 28, color: C.soft, align: 'right' });
      cline(x0, sy(m), x1, sy(m), { w: 1, a: 0.15 });
    }
    const bwid = (x1 - x0) / 11;
    const nShow = 10 * seg(t, s('m12', 0.6), e('m12', -0.2));
    for (let n = 1; n <= 10; n++) {
      const a = clamp(nShow - n + 1);
      if (a <= 0) continue;
      const short = MEET - A_N(n) || MEET * Math.pow(R, n), bx = x0 + (n - 0.5) * bwid;
      const inMM = n >= MM_STAGE && t > s('m13', 0.3), inUM = n >= UM_STAGE && t > mid('m13', 0.55);
      const col = inUM || inMM ? C.red : C.ink;
      A(a, () => {
        ctx.save(); k.rrect(bx - bwid * 0.3, sy(short), bwid * 0.6, y0 - sy(short), 4); fillGrain(col, 0.55); ctx.restore();
        hand(`${n}`, bx, y0 + 40, { size: 30, color: C.soft, align: 'center' });
      });
    }
    hand('stage', x1, y0 + 80, { size: 32, color: C.soft, align: 'right' });
    for (const [tol, at, lb, n] of [[0.001, s('m13', 0.2), 'margin: 1 mm', MM_STAGE], [1e-6, mid('m13', 0.5), 'margin: 1 μm', UM_STAGE]]) {
      A(ap(t, at), () => {
        ctx.save(); ctx.setLineDash([12, 9]); cline(x0, sy(tol), x1, sy(tol), { w: 3, col: C.red }); ctx.restore();
        hand(`${lb}: inside from stage ${n} on`, x1, sy(tol) - 14, { size: 36, color: C.red, align: 'right' });
      });
    }
    A(ap(t, s('m14', 0.2)), () => {
      serif('111.1 m is the limit', 1300, 330, { size: 60, weight: 700, color: C.red, align: 'center' });
      hand('“calculus solves it”: some historians, such as Carl Boyer', 1300, 396, { size: 36, color: C.soft, align: 'center' });
    });
  });
}

// ---------- 8: solved? ----------
// Thomson's lamp: on at 0, off at 1 min, on at 1.5, off at 1.75, …; the switchings, in minutes
const SWITCH = Array.from({ length: 30 }, (_, n) => 2 - Math.pow(0.5, n - 1)).slice(1);   // 1, 1.5, 1.75, …
const lampOn = (m) => { let on = true; for (const x of SWITCH) { if (m >= x) on = !on; else break; } return on; };
function lamp(x, y, on, a = 1) {
  if (a <= 0) return;
  A(a, () => {
    if (on > 0) A(on, () => { const g = ctx.createRadialGradient(x + 150, y - 170, 10, x + 150, y - 170, 260); g.addColorStop(0, 'rgba(210,126,92,0.55)'); g.addColorStop(1, 'rgba(210,126,92,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160, y - 460, 620, 560); });
    cline(x - 90, y, x + 90, y, { w: 6 });
    cpath([[x, y], [x - 20, y - 170], [x + 110, y - 260]], { w: 6 });
    // the shade and bulb
    ctx.beginPath(); ctx.moveTo(x + 90, y - 290); ctx.lineTo(x + 200, y - 230); ctx.lineTo(x + 160, y - 160); ctx.lineTo(x + 60, y - 215); ctx.closePath(); fillGrain(C.ink, 0.9);
    dot(x + 140, y - 170, 22, on > 0.5 ? C.red : C.paper, 1);
    ctx.beginPath(); ctx.arc(x + 140, y - 170, 22, 0, TAU); ctx.strokeStyle = grainInk; ctx.lineWidth = 3; ctx.stroke();
  });
}
function part8(t) {
  // q1, q2: what the maths answers, and what it may not
  A(span(t, s('q1', 0.1), s('q3', 0.3), 0.5, 0.5), () => {
    serif('the maths', 520, 260, { size: 64, weight: 700, align: 'center' });
    hand('where and when he draws level', 520, 340, { size: 44, align: 'center' });
    hand('111.1 m, 11.1 s', 520, 420, { size: 52, color: C.red, align: 'center' });
    tick(520, 520, 70, eio(seg(t, s('q1', 0.8), s('q1', 1.5))));
    A(ap(t, mid('q1', 0.55)), () => {
      serif('the task', 1400, 260, { size: 64, weight: 700, align: 'center' });
      hand('how does he finish', 1400, 340, { size: 44, align: 'center' });
      hand('infinitely many steps?', 1400, 420, { size: 52, color: C.red, align: 'center' });
      serif('?', 1400, 560, { size: 120, weight: 700, color: C.red, align: 'center' });
    });
    A(ap(t, s('q2', 0.2)), () => {
      hand('Bertrand Russell: he really does complete', W / 2, 760, { size: 46, align: 'center' });
      hand('infinitely many tasks in a finite time', W / 2, 830, { size: 46, color: C.red, align: 'center' });
    });
  });
  // q3–q11: Thomson's lamp
  const lA = span(t, s('q3', 0.1), s('q12', 0.3), 0.6, 0.6);
  A(lA, () => {
    hand('James Thomson, 1954', 140, 160, { size: 44, color: C.soft });
    // the playhead, in minutes: the first minute, then ever faster towards 2
    const k1 = s('q4', 0.3), k2 = e('q4', -0.2), k3 = e('q5', -0.2);
    const mAt = (tt) => {
      let m = 0;
      if (tt > k1) m = lerp(0, 1, seg(tt, k1, lerp(k1, k2, 0.4)));
      if (tt > lerp(k1, k2, 0.4)) m = lerp(1, 1.75, seg(tt, lerp(k1, k2, 0.4), k2));
      if (tt > k2) m = 2 - 0.25 * Math.pow(0.5, 10 * seg(tt, k2, k3));
      return m;
    };
    const m = mAt(t);
    const x0 = 820, x1 = 1720, sx = (mm) => lerp(x0, x1, mm / 2), y = 420;
    // once the switching is faster than a few times a second, show a steady half glow (no flicker)
    const rate = (mAt(t + 0.05) - m) / 0.05, wait = Math.max(1e-9, 2 - m) / 2;   // the current wait is about half of what's left
    const fast = t > k2 && (rate <= 0 || wait / Math.max(rate, 1e-9) < 0.4 || t > k3);
    lamp(330, 680, t > k1 ? (fast ? 0.45 : lampOn(m) ? 1 : 0) : 0, 1);
    cline(x0, y, x1, y, { w: 3.5 });
    hand('0', x0, y + 50, { size: 32, color: C.soft, align: 'center' });
    hand('1 min', sx(1), y + 50, { size: 32, color: C.soft, align: 'center' });
    hand('2 min', x1, y + 50, { size: 34, color: C.red, align: 'center' });
    cline(x1, y - 40, x1, y + 20, { w: 4, col: C.red });
    // the switchings, and the lamp's state as a strip
    SWITCH.forEach((sw, i) => { if (m >= sw) cline(sx(sw), y - 22 * Math.pow(0.88, i), sx(sw), y, { w: 2.5 }); });
    const sy = 560;
    hand('on', x0 - 20, sy - 30 + 10, { size: 32, color: C.red, align: 'right' });
    hand('off', x0 - 20, sy + 30 + 10, { size: 32, color: C.soft, align: 'right' });
    const edges = [0, ...SWITCH.filter((x) => x < m), m];
    for (let i = 0; i + 1 < edges.length; i++) {
      const on = i % 2 === 0, xa = sx(edges[i]), xb = sx(edges[i + 1]);
      ctx.save(); ctx.beginPath(); ctx.rect(xa, on ? sy - 50 : sy + 10, Math.max(1, xb - xa), 40); fillGrain(on ? C.red : C.ink, on ? 0.8 : 0.25); ctx.restore();
    }
    A(ap(t, s('q5', 0.3)), () => hand('waits: 1 + ½ + ¼ + ⅛ + … = 2 minutes', x0, 300, { size: 44 }));
    A(ap(t, s('q6', 0.1)), () => {
      dot(x1, sy - 10, 26, C.paper, 1); ctx.beginPath(); ctx.arc(x1, sy - 10, 26, 0, TAU); ctx.strokeStyle = grainRed; ctx.lineWidth = 4; ctx.stroke();
      serif('?', x1, sy + 6, { size: 50, weight: 700, color: C.red, align: 'center' });
      serif('on or off?', 1260, 760, { size: 72, italic: true, align: 'center' });
    });
    A(ap(t, s('q7', 0.2)), () => {
      hand('not on: every “on” was followed by an “off”', 1260, 850, { size: 40, align: 'center' });
      A(ap(t, mid('q7', 0.55)), () => hand('not off: every “off” was followed by an “on”', 1260, 910, { size: 40, align: 'center' }));
    });
  });
  // q8, q9: supertask; like 1 − 1 + 1 − …
  const q8A = span(t, s('q8', 0.1), s('q12', 0.3), 0.5, 0.5);
  A(q8A, () => {
    A(1 - seg(t, s('q10', -0.2), s('q10', 0.3)), () => {
      ctx.save(); ctx.fillStyle = 'rgba(238,235,228,0.92)'; ctx.fillRect(800, 700, 1000, 280); ctx.restore();
      serif('a supertask: impossible?', 1260, 770, { size: 60, weight: 700, color: C.red, align: 'center' });
      A(ap(t, s('q9', 0.2)), () => { hand('running totals of 1 − 1 + 1 − …', 840, 850, { size: 38, color: C.soft }); miniChart(GRANDI, 1300, 1760, 960, 830, 1.2, seg(t, s('q9', 0.3), e('q9', -0.2)), { col: C.red }); });
    });
    A(ap(t, s('q10', 0.1)), () => {
      ctx.save(); ctx.fillStyle = 'rgba(238,235,228,0.94)'; ctx.fillRect(800, 700, 1000, 280); ctx.restore();
      hand('Paul Benacerraf, 1962:', 840, 760, { size: 40, color: C.soft });
      hand('every moment before 2 minutes: fixed', 840, 830, { size: 44 });
      hand('the moment of 2 minutes: not fixed by the story', 840, 900, { size: 44, color: C.red });
      A(ap(t, s('q11', 0.2)), () => hand('no contradiction, just an open question', 840, 966, { size: 40, color: C.soft }));
    });
  });
  // q12, q13: still debated; and physics
  A(span(t, s('q12', 0.1), s('q14', 0.3), 0.5, 0.5), () => {
    hand('what counts as a task?', 560, 260, { size: 52, align: 'center' });
    hand('can a supertask be done?', 1360, 260, { size: 52, align: 'center' });
    hand('still debated', W / 2, 360, { size: 48, color: C.red, align: 'center' });
    A(ap(t, s('q13', 0.2)), () => {
      // a smooth line, and the same line made of smallest pieces
      const y1 = 560, y2 = 760, x0 = 300, x1 = 1620;
      cline(x0, y1, x1, y1, { w: 4 });
      hand('endlessly divisible?', x0, y1 - 40, { size: 40, color: C.soft });
      const n = 34;
      for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n) + 3, xb = lerp(x0, x1, (i + 1) / n) - 3; ctx.save(); k.rrect(xa, y2 - 10, xb - xa, 20, 6); fillGrain(C.red, 0.7); ctx.restore(); }
      hand('or made of smallest pieces?', x0, y2 - 40, { size: 40, color: C.red });
      hand('a diagram, not to scale: some theories of quantum gravity suggest the second', W / 2, 880, { size: 34, color: C.soft, align: 'center' });
    });
  });
  quote('it’s probably foolhardy to think we’ve reached the end', W / 2, 460, 1300, span(t, s('q14', 0.1), e('q14', 1.6) + 99, 0.6, 0.5), { size: 64, src: 'Kevin Brown, on Zeno’s arguments' });
}

// ---------- 9: the finish line ----------
function part9(t) {
  const rq = seg(t, s('z1', 0.4), e('z2', -0.3));
  const tr = 12 * rq;                                    // race time, 0 to 12 s
  const a = VA * tr, tm = HEAD + VT * tr;
  const run = rq > 0 && rq < 1 ? 1 : 0;
  track(0, ap(t, s('z1', 0.1), 0.8));
  for (let j = 1; j <= 3; j++) flag(tx(A_N(j)), TR.y - 2, a >= A_N(j) ? 0.9 : 0);
  achilles(tx(a), TR.y - 3, t * 9, run, ap(t, s('z1', 0.2)));
  tortoise(tx(tm), TR.y - 3, t * 5, 0.3 + 0.7 * run, ap(t, s('z1', 0.2)));
  A(ap(t, s('z1', 0.4)), () => hand(`clock: ${tr.toFixed(1)} s`, 140, 200, { size: 48, color: C.soft }));
  A(a >= MEET ? ap(t, s('z1', 0.4) + (T_MEET / 12) * (e('z2', -0.3) - s('z1', 0.4))) : 0, () => {
    const x = tx(MEET);
    cline(x, TR.y - 260, x, TR.y + 30, { w: 3, col: C.red });
    hand('level: 111.1 m, after 11.1 s', x, TR.y - 280, { size: 42, color: C.red, align: 'center' });
  });
  // z3: every stage lies inside those 11.1 seconds
  A(ap(t, s('z3', 0.2)), () => {
    const X0 = 200, X1 = 1700, sx = (x) => lerp(X0, X1, x / 12), by = 800;
    cline(X0, by + 26, X1, by + 26, { w: 2.5 });
    for (let x = 0; x <= 12; x += 2) { cline(sx(x), by + 26, sx(x), by + 38, { w: 2 }); hand(`${x} s`, sx(x), by + 74, { size: 30, color: C.soft, align: 'center' }); }
    const fill = (n) => clamp((t - s('z3', 0.4) - n * 0.55) / 0.5);
    let sum = 0;
    for (let n = 0; n < 16; n++) {
      const d = (HEAD / VA) * Math.pow(R, n), f = eio(fill(n));
      if (f <= 0) break;
      ctx.save(); ctx.beginPath(); ctx.rect(sx(sum), by - 16, Math.max(0.8, sx(sum + d * f) - sx(sum)), 34); fillGrain(n % 2 ? C.red : C.ink, n % 2 ? 0.8 : 0.7); ctx.restore();
      sum += d * f;
    }
    hand('the stages: 10 s + 1 s + 0.1 s + …', X0, by - 40, { size: 40 });
    A(ap(t, mid('z3', 0.7)), () => { ctx.save(); ctx.setLineDash([10, 8]); cline(sx(T_MEET), by - 70, sx(T_MEET), by + 40, { w: 3, col: C.red }); ctx.restore(); hand('all inside 11.1 s', sx(T_MEET) + 16, by - 40, { size: 40, color: C.red }); });
  });
  // z4: three words
  A(span(t, s('z4', 0.2), s('z5', 0.3), 0.5, 0.5), () => {
    ['infinity', 'a sum', 'an instant'].forEach((w2, i) => A(ap(t, lerp(mid('z4', 0.55), e('z4', -0.2), i / 2), 0.4), () => serif(w2, 560 + i * 400, 300, { size: 72, italic: true, weight: 700, color: i === 1 ? C.red : C.ink, align: 'center' })));
  });
  quote('Zeno’s arguments, in some form, have afforded grounds for almost all theories of space and time and infinity which have been constructed from his time to our own.', W / 2, 270, 1500, span(t, s('z5', 0.1), s('z6', 0.4), 0.6, 0.5), { size: 46, src: 'Bertrand Russell' });
  A(ap(t, s('z6', 0.2)), () => {
    hand('Achilles wins the race.', W / 2, 250, { size: 60, align: 'center' });
    A(ap(t, mid('z6', 0.5)), () => hand('Zeno’s argument is still running.', W / 2, 330, { size: 60, color: C.red, align: 'center' }));
  });
}

// ---------- the whole ----------
Kit.scene({
  width: W, height: H, duration: DURATION, pace: 1, fonts: [SERIF, HAND],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    const parts = [partOpen, part1, part2, part3, part4, part5, part6, part7, part8, part9];
    const B = [0, ...CH.map((c) => c.at), DURATION + 1];
    parts.forEach((fn, i) => {
      // each part runs from its title card to the next one's; neighbours overlap under the card
      const a0 = i === 0 ? -1 : B[i] + 2.4, b = i + 1 < B.length - 1 ? B[i + 1] + 1.0 : DURATION + 1;
      if (t < a0 || t > b) return;
      A(1 - seg(t, b - 1.0, b), () => fn(t));
    });
    titleCard(t);
    credits(t);
  },
});
