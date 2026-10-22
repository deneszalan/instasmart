// Explainer for tech-public-key-cryptography: Diffie–Hellman key exchange, with paint and then numbers.
// Look: watercolour paint pots on cold-press paper. Glass jars of paint, ceramic pans for the secret
// colours, washes with darker edges, and an ink-drawn eye for Eve. Fraunces for numbers and names,
// Nunito for captions.
//
// Scene plan (65 s). Captions centred at y = 830; everything important above y = 930.
//  A  0.0– 8.1  Hook. Alice's and Bob's empty jars, Eve's eye above. "Can they agree on one in public?"
//  B  8.3–27.5  Paint. A public yellow is poured into both jars (Eve notes it). Each stirs in a secret
//               colour from a pan (orange, green). The jars swap sides in full view (Eve notes both).
//               Each adds their own secret again: both jars turn the same brown. Eve's "?" stays empty.
//  C 27.5–53.4  Numbers, mod 23 with base 5 (computed below). Alice's secret 3: 5³ = 125 = 5 × 23 + 10,
//               she sends 10. Bob's secret 7: he sends 17. They swap; 17³ and 10⁷ both leave 14.
//               Eve heard 23, 5, 10, 17, never 3 or 7.
//  D 53.4–65.0  Payoff. A wall of 600 random digits: real keys use numbers hundreds of digits long.
//               Diffie and Hellman published in 1976; GCHQ had found it first, in secret (declassified 1997).
//
// Facts: Wikipedia, "Diffie–Hellman key exchange" (the paint analogy; the method with a public prime p
// and base g, where only the secrets a and b stay private; much larger numbers are needed to be
// secure, primes of at least 2048 bits are recommended, and at 600 digits even the fastest computers
// cannot work back; Diffie and Hellman published in 1976). Wikipedia, "Public-key cryptography" (at
// GCHQ, Ellis, Cocks and Williamson's work, including Williamson's 1974 key exchange, was declassified
// by the British government in 1997). The paint mixes are geometric means of reflectance, so the
// order of mixing doesn't matter, as in the analogy.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F3ECDF', ink: '#2B2533', inkSoft: 'rgba(43,37,51,0.66)', inkFaint: 'rgba(43,37,51,0.16)',
  yellow: '#F0C43A', red: '#C8344C', blue: '#1F86C9', redText: '#B02A3F', blueText: '#1A5F92',
};
const SERIF = 'Fraunces', SANS = 'Nunito';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- colour: paint mixes as geometric means of reflectance ----------
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (...hexes) => {
  const cs = hexes.map(rgbOf);
  return [0, 1, 2].map((ch) => Math.round(Math.exp(cs.reduce((s, c) => s + Math.log(Math.max(4, c[ch])), 0) / cs.length)));
};
const hexOf = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
const lerpRGB = (a, b, x) => a.map((v, i) => Math.round(lerp(v, b[i], x)));
const css = (rgb, a = 1) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
const Y_ = rgbOf(C.yellow), R_ = rgbOf(C.red), B_ = rgbOf(C.blue);
const ORANGE = mix(C.yellow, C.red), GREEN = mix(C.yellow, C.blue);
// The same paint whichever order it was mixed in (warmed a little, so it reads as brown).
const warm = (rgb) => [Math.min(255, Math.round(rgb[0] * 1.18)), Math.round(rgb[1] * 0.96), Math.round(rgb[2] * 0.78)];
const BROWN_A = warm(mix(C.yellow, C.blue, C.red)), BROWN_B = warm(mix(C.yellow, C.red, C.blue));
const darker = (rgb, f = 0.62) => rgb.map((v) => Math.round(v * f));

// ---------- the numbers, computed ----------
const P = 23, G = 5, SA = 3, SB = 7;
const powmod = (b, e, m) => { let r = 1; for (let i = 0; i < e; i++) r = (r * b) % m; return r; };
const A = powmod(G, SA, P), B = powmod(G, SB, P);
const S_ALICE = powmod(B, SA, P), S_BOB = powmod(A, SB, P);
if (S_ALICE !== S_BOB) throw new Error('key exchange failed');
const S = S_ALICE;

// ---------- timeline ----------
const CUES = [
  [0.4, 4.8, 'Alice and Bob need a shared secret, but *Eve* sees everything.'],
  [4.9, 8.1, 'Can they agree on one in public?'],
  [8.3, 12.4, 'They agree a public colour: *yellow*. Eve sees it too.'],
  [12.5, 16.0, 'Each stirs in a ~secret colour~.'],
  [16.1, 19.3, 'They swap the mixtures in full view.'],
  [19.4, 23.2, 'Each adds their own secret again: the *same colour*!'],
  [23.3, 27.4, 'Eve has every mixture she saw, but paint won’t ~unmix~.'],
  [27.6, 31.1, `Now with numbers. Everyone knows *${P}* and *${G}*.`],
  [31.2, 35.0, `Alice’s secret is ~${SA}~: ${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][SA]} ${G}s multiplied make ${G ** SA}.`],
  [35.1, 39.2, `She sends only the remainder after dividing by ${P}: *${A}*.`],
  [39.3, 43.7, `Bob does the same with his secret ~${SB}~ and sends *${B}*.`],
  [43.8, 48.8, `Each raises what they got to their own secret. Remainder: ~${S}~ for both!`],
  [48.9, 53.3, `Eve heard ${P}, ${G}, ${A} and ${B}, never ${SA} or ${SB}.`],
  [53.5, 57.9, 'Real keys have *hundreds of digits*: far too many to undo.'],
  [58.0, 61.2, 'Diffie and Hellman published it in *1976*.'],
  [61.3, 64.8, 'Britain’s GCHQ had found it first, in secret.'],
];
const DUR = 65.0;
const c = (i) => CUES[i][0];
const T = { paint: [0, c(7) - 0.1], nums: [c(7) - 0.3, c(13)], big: [c(13) - 0.2, c(14) + 0.1], hist: [c(14) - 0.1, DUR] };

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

// ---------- paper, painted once ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(21);
  // faint old washes soaked into the paper
  for (const [x, y, r, col] of [[120, 980, 260, '240,196,58'], [780, 120, 220, '31,134,201'], [760, 1000, 200, '200,52,76']]) {
    const rg = g.createRadialGradient(x, y, 10, x, y, r);
    rg.addColorStop(0, `rgba(${col},0.07)`); rg.addColorStop(0.8, `rgba(${col},0.035)`); rg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
  }
  // cold-press tooth: soft lumps, then grain
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * W, y = rnd() * H, r = 1 + rnd() * 4;
    g.fillStyle = rnd() < 0.5 ? 'rgba(120,100,70,0.05)' : 'rgba(255,255,255,0.35)';
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 3; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
  g.putImageData(img, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(90,70,40,0)'); vg.addColorStop(1, 'rgba(90,70,40,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- watercolour washes ----------
const shapes = new Map();
function blobShape(id) {
  if (shapes.has(id)) return shapes.get(id);
  const rnd = mulberry32(hash(id)), n = 56, ph = [rnd() * 6.3, rnd() * 6.3, rnd() * 6.3], pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.06 * Math.sin(3 * a + ph[0]) + 0.04 * Math.sin(5 * a + ph[1]) + 0.025 * Math.sin(11 * a + ph[2]) + (rnd() - 0.5) * 0.02;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  shapes.set(id, pts);
  return pts;
}
function blobPath(pts, cx, cy, rx, ry) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * rx, cy + y * ry) : ctx.moveTo(cx + x * rx, cy + y * ry)));
  ctx.closePath();
}
function wash(id, cx, cy, rx, ry, rgb, a = 1) {
  if (a <= 0) return;
  const pts = blobShape(id);
  withAlpha(a, () => {
    blobPath(pts, cx, cy, rx, ry); ctx.fillStyle = css(rgb, 0.58); ctx.fill();
    blobPath(pts, cx + rx * 0.05, cy - ry * 0.06, rx * 0.8, ry * 0.76); ctx.fillStyle = css(rgb, 0.3); ctx.fill();
    blobPath(pts, cx - rx * 0.12, cy - ry * 0.1, rx * 0.4, ry * 0.36); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
    blobPath(pts, cx, cy, rx, ry); ctx.strokeStyle = css(darker(rgb), 0.5); ctx.lineWidth = 2.4; ctx.stroke();
  });
}

// ---------- jars, pans, drops ----------
const JAR = { w: 140, h: 172 };
function jar(x, y, rgb, level, a = 1, swirl = 0, swirlRGB = null) {
  if (a <= 0) return;
  withAlpha(a, () => {
    const { w, h } = JAR, l = x - w / 2, top = y - h / 2;
    // shadow on the paper
    ctx.fillStyle = 'rgba(60,45,30,0.13)'; ctx.beginPath(); ctx.ellipse(x + 8, y + h / 2 + 6, w * 0.55, 10, 0, 0, 7); ctx.fill();
    ctx.save();
    rrect(l, top + 14, w, h - 14, [10, 10, 22, 22]); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(l, top, w, h);
    if (rgb && level > 0) {
      const ly = y + h / 2 - level * (h - 20);
      ctx.fillStyle = css(rgb, 0.92);
      ctx.beginPath(); ctx.moveTo(l, ly);
      for (let i = 0; i <= 20; i++) ctx.lineTo(l + (w * i) / 20, ly + Math.sin(i * 0.9 + x * 0.01) * 2.2);
      ctx.lineTo(l + w, y + h / 2); ctx.lineTo(l, y + h / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = css(darker(rgb, 0.8), 0.35); ctx.fillRect(l, ly - 1, w, 5);
      if (swirl > 0 && swirlRGB) {
        // a ribbon of the colour just added, spiralling into the mix
        ctx.strokeStyle = css(swirlRGB, 0.75 * swirl); ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath();
        const cy0 = (ly + y + h / 2) / 2;
        for (let i = 0; i <= 40; i++) {
          const u = i / 40, ang = u * 9 + (1 - swirl) * 4, rr = (1 - u) * (w * 0.36) * swirl + 4;
          const px = x + Math.cos(ang) * rr, py = cy0 + Math.sin(ang) * rr * 0.45;
          if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
    }
    // glass highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(l + 12, top + 26, 9, h - 52);
    ctx.restore();
    ctx.strokeStyle = 'rgba(43,37,51,0.7)'; ctx.lineWidth = 3;
    rrect(l, top + 14, w, h - 14, [10, 10, 22, 22]); ctx.stroke();
    // the rim
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; rrect(l - 7, top, w + 14, 18, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(43,37,51,0.7)'; ctx.lineWidth = 3; rrect(l - 7, top, w + 14, 18, 6); ctx.stroke();
  });
}
function pan(x, y, rgb, a = 1, label = 'secret') {
  if (a <= 0) return;
  withAlpha(a, () => {
    ctx.fillStyle = 'rgba(60,45,30,0.14)'; rrect(x - 38 + 5, y - 28 + 6, 76, 56, 10); ctx.fill();
    ctx.fillStyle = '#FBFAF6'; rrect(x - 38, y - 28, 76, 56, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(43,37,51,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
    wash('pan' + x, x, y, 27, 18, rgb, 1);
    ctx.fillStyle = css(rgb, 0.9); rrect(x - 26, y - 17, 52, 34, 7); ctx.fill();
    font(800, 22); text(label, x, y + 52, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '1px' });
  });
}
/** A drop of paint flying from (x0,y0) to (x1,y1) as p goes 0→1. */
function drop(x0, y0, x1, y1, p, rgb, r = 11) {
  if (p <= 0 || p >= 1) return;
  const u = eio(p), x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 70;
  ctx.fillStyle = css(rgb, 0.95);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, 7); ctx.fill();
}

// ---------- Eve ----------
const EYE = { x: 432, y: 168 };
function eve(t, look) {
  const a = eout(seg(t, 0.8, 1.8));
  if (a <= 0) return;
  withAlpha(a, () => {
    const { x, y } = EYE;
    // a blink every so often
    const bl = [3.4, 14.6, 30.2, 46.6, 57.4].reduce((m, b) => Math.max(m, 1 - Math.abs(t - b) / 0.12), 0);
    const open = 1 - clamp(bl);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x - 62, y); ctx.quadraticCurveTo(x, y - 46 * open, x + 62, y); ctx.quadraticCurveTo(x, y + 46 * open, x - 62, y); ctx.closePath();
    ctx.fillStyle = '#FFFDF7'; ctx.fill();
    ctx.clip();
    const lx = clamp((look - x) / 300, -1, 1) * 16;
    wash('iris', x + lx, y + 2, 22, 22, [96, 104, 120], 1);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + lx, y + 2, 10, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x + lx - 5, y - 4, 4, 0, 7); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 62, y); ctx.quadraticCurveTo(x, y - 46 * open, x + 62, y); ctx.quadraticCurveTo(x, y + 46 * open, x - 62, y); ctx.stroke();
    // lashes
    for (let i = -2; i <= 2; i++) {
      const u = 0.5 + i * 0.16, bx = lerp(x - 62, x + 62, u), by = y - Math.sin(u * Math.PI) * 23 * open * 2 * 0.5 - 1;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + i * 5, by - 12 * open - 2); ctx.stroke();
    }
    font(900, 24, SANS); text('EVE', x - 96, y + 2, { color: C.ink, align: 'right', base: 'middle', spacing: '3px' });
    font(700, 22, SANS); text('listening', x - 96, y + 28, { color: C.inkSoft, align: 'right', base: 'middle' });
  });
}
/** Eve's notes: what she has seen, as small swatches in a row under her eye. */
function eveNotes(t, items) {
  const shown = items.filter((it) => t >= it.at);
  if (!shown.length) return;
  const gap = 92, y = 262;
  const x0 = EYE.x - ((items.length - 1) * gap) / 2;
  items.forEach((it, i) => {
    const a = eout(seg(t, it.at, it.at + 0.5)) * (it.until ? 1 - seg(t, it.until - 0.4, it.until) : 1);
    if (a <= 0) return;
    const x = x0 + i * gap, s = lerp(0.6, 1, back(seg(t, it.at, it.at + 0.5)));
    withAlpha(a, () => {
      if (it.rgb) wash('note' + i + (it.label ?? ''), x, y, 38 * s, 27 * s, it.rgb, 1);
      else { ctx.strokeStyle = C.inkSoft; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]); blobPath(blobShape('q' + i), x, y, 38, 27); ctx.stroke(); ctx.setLineDash([]); }
      if (it.label) { font(800, it.label.length > 2 ? 26 : 30, SERIF); text(it.label, x, y + 1, { color: C.ink, align: 'center', base: 'middle' }); }
    });
  });
}

// ---------- scene B: paint ----------
const AX = 200, BX = 664, JY = 590, PAN_A = 66, PAN_B = 798, PAN_Y = 700, NAME_Y = 404;
function names() {
  font(700, 42, SERIF);
  text('Alice', AX, NAME_Y, { color: C.ink, align: 'center', base: 'middle' });
  text('Bob', BX, NAME_Y, { color: C.ink, align: 'center', base: 'middle' });
}
function paintScene(t) {
  names();
  const jt = JY - JAR.h / 2 + 10; // where drops land
  // the public pot of yellow, in the middle; it pours into both jars
  const pubA = span(t, c(2) + 0.1, c(3) + 1.0, 0.5, 0.6);
  jar(432, JY, Y_, 0.75 - 0.4 * eio(seg(t, c(2) + 1.5, c(2) + 3.3)), pubA);
  withAlpha(pubA, () => { font(800, 24); text('public', 432, JY + JAR.h / 2 + 30, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '1px' }); });
  drop(432, jt, AX, jt, seg(t, c(2) + 1.5, c(2) + 2.7), Y_, 14);
  drop(432, jt, BX, jt, seg(t, c(2) + 2.1, c(2) + 3.3), Y_, 14);
  // the secret pans
  const panA = span(t, c(3) + 0.1, T.paint[1], 0.5, 0.4);
  pan(PAN_A, PAN_Y, R_, panA);
  pan(PAN_B, PAN_Y, B_, panA);
  const fillA = eio(seg(t, c(2) + 2.5, c(2) + 3.3)) * 0.42, fillB = eio(seg(t, c(2) + 3.1, c(2) + 3.9)) * 0.42;
  const m1 = eio(seg(t, c(3) + 1.5, c(3) + 2.9));
  const add2 = eio(seg(t, c(5) + 1.2, c(5) + 2.6));
  let colA = lerpRGB(Y_, ORANGE, m1), colB = lerpRGB(Y_, GREEN, m1);
  let levA = fillA + 0.14 * m1, levB = fillB + 0.14 * m1;
  // the swap: the orange jar goes to Bob along a low arc, the green one to Alice along a high one
  const sw = eio(seg(t, c(4) + 0.3, c(4) + 2.6));
  const jarAx = lerp(AX, BX, sw), jarAy = JY + Math.sin(sw * Math.PI) * 70;
  const jarBx = lerp(BX, AX, sw), jarBy = JY - Math.sin(sw * Math.PI) * 150;
  // after the swap, each side adds its own secret again: both become the same brown
  if (t > c(5)) { colA = lerpRGB(ORANGE, BROWN_B, add2); colB = lerpRGB(GREEN, BROWN_A, add2); levA = levB = 0.56 + 0.12 * add2; }
  drop(PAN_A, PAN_Y - 30, AX, jt, seg(t, c(3) + 0.6, c(3) + 1.6), R_);
  drop(PAN_B, PAN_Y - 30, BX, jt, seg(t, c(3) + 0.6, c(3) + 1.6), B_);
  drop(PAN_A, PAN_Y - 30, AX, jt, seg(t, c(5) + 0.3, c(5) + 1.3), R_);
  drop(PAN_B, PAN_Y - 30, BX, jt, seg(t, c(5) + 0.3, c(5) + 1.3), B_);
  const second = t > c(5);
  const swirl = second ? span(t, c(5) + 1.2, c(5) + 3.0, 0.2, 0.6) : span(t, c(3) + 1.5, c(3) + 3.2, 0.2, 0.6);
  jar(jarAx, jarAy, colA, levA, 1, swirl, second ? B_ : R_);
  jar(jarBx, jarBy, colB, levB, 1, swirl, second ? R_ : B_);
  // the reveal: the two jars match
  const same = span(t, c(5) + 2.4, T.paint[1], 0.5, 0.4);
  withAlpha(same, () => {
    font(800, 72, SERIF); text('=', 432, JY, { color: C.ink, align: 'center', base: 'middle' });
    font(800, 24); text('shared secret', 432, JY + JAR.h / 2 + 30, { color: C.ink, align: 'center', base: 'middle', spacing: '1px' });
  });
  return sw > 0 && sw < 1 ? jarAx : 432;
}

// ---------- scene C: numbers ----------
/** Draws a run of segments; { s, sup, color } — sup is raised and smaller. Centred on cx. */
function mathLine(segs, cx, y, size, a = 1) {
  if (a <= 0) return;
  withAlpha(a, () => {
    const widths = segs.map((sg) => { font(sg.w ?? 600, sg.sup ? size * 0.62 : size, SERIF); return ctx.measureText(sg.s).width; });
    let x = cx - widths.reduce((p, q) => p + q, 0) / 2;
    segs.forEach((sg, i) => {
      font(sg.w ?? 600, sg.sup ? size * 0.62 : size, SERIF);
      text(sg.s, x, sg.sup ? y - size * 0.36 : y, { color: sg.color ?? C.ink, base: 'middle' });
      x += widths[i];
    });
  });
}
function numberSwatch(id, x, y, rgb, label, a, sub) {
  if (a <= 0) return;
  wash(id, x, y, 64, 42, rgb, a);
  withAlpha(a, () => {
    font(800, 46, SERIF); text(label, x, y + 2, { color: C.ink, align: 'center', base: 'middle' });
    if (sub) { font(800, 24); text(sub, x, y + 62, { color: C.inkSoft, align: 'center', base: 'middle', spacing: '1px' }); }
  });
}
const L1 = 604, L2 = 650, SEND_Y = 728, SECRET_Y = 488;
/** The two lines of working for base^exp: "b^e = n" and "= q × 23 + r". */
function working(cx, base, exp, a1, a2, rColor, size2 = 32) {
  const n = base ** exp;
  mathLine([{ s: String(base) }, { s: String(exp), sup: true }, { s: ` = ${fmt(n)}` }], cx, L1, 36, a1);
  mathLine([{ s: `= ${fmt(Math.floor(n / P))} × ${P} + ` }, { s: String(n % P), color: rColor, w: 800 }], cx, L2, size2, a2);
}
function numbersScene(t) {
  names();
  // public numbers, between the names
  const pub = eout(seg(t, c(7) + 0.2, c(7) + 1.0));
  wash('pub', 432, 352, 130, 46, Y_, pub);
  mathLine([{ s: `p = ${P}    g = ${G}` }], 432, 353, 36, pub);
  // secrets
  numberSwatch('sa', AX, SECRET_Y, R_, String(SA), eout(seg(t, c(8) + 0.2, c(8) + 0.9)), 'secret');
  numberSwatch('sb', BX, SECRET_Y, B_, String(SB), eout(seg(t, c(10) + 0.2, c(10) + 0.9)), 'secret');
  // first round of working, hidden once the swap starts
  const r1 = 1 - seg(t, c(11), c(11) + 0.5);
  working(AX, G, SA, eout(seg(t, c(8) + 1.2, c(8) + 1.9)) * r1, eout(seg(t, c(9) + 0.4, c(9) + 1.1)) * r1, C.redText);
  working(BX, G, SB, eout(seg(t, c(10) + 0.9, c(10) + 1.6)) * r1, eout(seg(t, c(10) + 1.7, c(10) + 2.4)) * r1, C.blueText, 30);
  // the numbers sent, swapped in the open; then each turns into the shared result
  const sw = eio(seg(t, c(11) + 0.2, c(11) + 1.9));
  const morph = eio(seg(t, c(11) + 3.4, c(11) + 4.2));
  const aX = lerp(AX, BX, sw), aY = SEND_Y - Math.sin(sw * Math.PI) * 90;
  const bX = lerp(BX, AX, sw), bY = SEND_Y - Math.sin(sw * Math.PI) * 190;
  const aCol = lerpRGB(ORANGE, BROWN_B, morph), bCol = lerpRGB(GREEN, BROWN_A, morph);
  const lab = (n) => (morph > 0.5 ? String(S) : String(n));
  numberSwatch('A', aX, aY, aCol, lab(A), eout(seg(t, c(9) + 1.6, c(9) + 2.2)));
  numberSwatch('B', bX, bY, bCol, lab(B), eout(seg(t, c(10) + 2.5, c(10) + 3.1)));
  // second round of working
  const r2a = eout(seg(t, c(11) + 2.0, c(11) + 2.7)), r2b = eout(seg(t, c(11) + 2.7, c(11) + 3.4));
  working(AX, B, SA, r2a, r2b, C.ink);
  working(BX, A, SB, r2a, r2b, C.ink, 30);
  withAlpha(span(t, c(11) + 3.8, T.nums[1], 0.5, 0.3), () => {
    font(800, 72, SERIF); text('=', 432, SEND_Y, { color: C.ink, align: 'center', base: 'middle' });
  });
  return sw > 0 && sw < 1 ? aX : 432;
}

// ---------- scene D: big numbers and history ----------
const DIGITS = (() => { const rnd = mulberry32(1976); let s = String(1 + Math.floor(rnd() * 9)); while (s.length < 600) s += Math.floor(rnd() * 10); return s; })();
function bigScene(t) {
  const per = 40, rows = Math.ceil(DIGITS.length / per);
  font(500, 24, SERIF);
  const cw = 17.6, x0 = W / 2 - (per * cw) / 2, y0 = 344;
  for (let r = 0; r < rows; r++) {
    const a = eout(seg(t, c(13) + 0.2 + r * 0.1, c(13) + 0.7 + r * 0.1));
    if (a <= 0) continue;
    withAlpha(a, () => {
      const row = DIGITS.slice(r * per, (r + 1) * per);
      for (let i = 0; i < row.length; i++) text(row[i], x0 + i * cw + cw / 2, y0 + r * 25.5, { color: C.ink, align: 'center', base: 'middle' });
    });
  }
  withAlpha(eout(seg(t, c(13) + 1.8, c(13) + 2.4)), () => {
    font(800, 26); text(`${DIGITS.length} digits: about the size of a real key`, W / 2, y0 + rows * 25.5 + 18, { color: C.redText, align: 'center', base: 'middle', spacing: '1px' });
  });
}
function histScene(t) {
  const rows = [
    { at: c(14) + 0.2, year: '1976', textA: 'Diffie and Hellman', textB: 'publish key exchange', rgb: Y_ },
    { at: c(15) + 0.2, year: '1997', textA: 'GCHQ’s earlier secret', textB: 'work is declassified', rgb: R_ },
  ];
  rows.forEach((r, i) => {
    const a = eout(seg(t, r.at, r.at + 0.6)), y = 450 + i * 160;
    wash('y' + i, 226, y, 110, 54, r.rgb, a);
    withAlpha(a, () => {
      font(800, 58, SERIF); text(r.year, 226, y + 2, { color: C.ink, align: 'center', base: 'middle' });
      font(800, 34); text(r.textA, 364, y - 20, { color: C.ink, base: 'middle' });
      font(600, 34); text(r.textB, 364, y + 22, { color: C.inkSoft, base: 'middle' });
    });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 800, maxW: 750 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > maxW && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 836, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.redText, '~': C.blueText } });
  }
}

Kit.scene({
  width: W, height: H, duration: DUR,
  fonts: [
    { family: SERIF, file: 'Fraunces.woff2' },
    { family: SANS, file: 'Nunito.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(900, 22); text('RECKON', 64, 84, { color: C.redText, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 6 * 3;
    font(700, 22); text('TECH · CRYPTOGRAPHY', 64 + rw + 20, 84, { color: C.inkSoft, spacing: '3px' });
    let look = 432;
    withAlpha(span(t, ...T.paint, 0.6, 0.5), () => { look = paintScene(t); });
    withAlpha(span(t, ...T.nums, 0.5, 0.5), () => { if (t > T.nums[0]) look = numbersScene(t); });
    withAlpha(span(t, ...T.big, 0.4, 0.4), () => bigScene(t));
    withAlpha(span(t, ...T.hist, 0.4, 0), () => histScene(t));
    eve(t, look);
    eveNotes(t, [
      { at: c(2) + 2.4, until: T.paint[1], rgb: Y_ },
      { at: c(4) + 1.0, until: T.paint[1], rgb: ORANGE },
      { at: c(4) + 1.5, until: T.paint[1], rgb: GREEN },
      { at: c(6) + 0.6, until: T.paint[1], label: '?' },
    ]);
    eveNotes(t, [
      { at: c(7) + 0.8, until: T.nums[1], rgb: Y_, label: String(P) },
      { at: c(7) + 1.1, until: T.nums[1], rgb: Y_, label: String(G) },
      { at: c(11) + 0.9, until: T.nums[1], rgb: ORANGE, label: String(A) },
      { at: c(11) + 1.3, until: T.nums[1], rgb: GREEN, label: String(B) },
      { at: c(12) + 0.5, until: T.nums[1], label: '?' },
    ]);
    captions(t);
  },
});
