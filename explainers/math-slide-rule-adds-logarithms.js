// Explainer for math-slide-rule-adds-logarithms: sliding two log scales adds lengths, which multiplies.
// Look: an ivory-faced bamboo slide rule with engraved black and red scales and a glass cursor with a
// red hairline, lying on a bottle-green leather desk blotter. Jost for captions and scale figures,
// Cardo for the big sums.
//
// Scene plan (58.6 s). Captions centred at y = 830; everything important above y = 930.
//  A  0.0– 9.2  Hook. The rule glides in. "Until the 1970s…" / "How can sliding a stick multiply?"
//               "2 × 3 = ?" appears above the rule.
//  B  9.2–22.8  The scale. The D figures pulse left to right: they crowd together. The cursor
//               measures 1→3 (log 3 = 0.477). Brackets 1→2, 2→4, 4→8 come out the same length.
//  C 22.8–40.4  2 × 3. The slide moves so C's 1 sits over D's 2; the cursor goes to 3 on C; D reads 6.
//               Bars under the rule add the two lengths: 0.301 + 0.477 = 0.778 = log 6.
//  D 40.4–48.2  1.5 × 5. The slide moves back to 1.5, the cursor to 5 on C, and D reads 7.5.
//  E 48.2–58.6  Why: log(x × y) = log x + log y. Payoff: Buzz Aldrin's slide rule flew to the Moon.
//
// Every position is placed with log10 below (X, XC, XA, XCI), and the sums in the captions are
// computed from the same numbers. Facts (Wikipedia, "Slide rule"): the C and D scales are single-
// decade log scales; distances from the 1 mark are proportional to the logarithms; to multiply,
// the 1 on the top scale is moved to a factor on the bottom one and the answer is read off the
// bottom; cheap pocket calculators replaced slide rules in the mid-1970s; "The model N600-ES owned
// by Buzz Aldrin that flew with him to the Moon on Apollo 11 was sold at auction in 2007."
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#123B31', bg1: '#0A231D', bg2: '#04110D',
  ivory: '#F4ECD6', ivoryShade: '#E3D7B8', bamboo: '#C9A35B', bambooDark: '#8C6A2F', bambooLight: '#E2C487',
  ink: '#1C1A16', red: '#B8231B', redText: '#FF7A6B', cream: '#F7F0DE', creamSoft: 'rgba(247,240,222,0.72)',
  gold: '#F1C66B', glass: 'rgba(214,236,240,0.16)', steel: '#AEB6B9', steelDark: '#5E676B',
};
const TEXT = 'Jost', SERIF = 'Cardo', SERIF_I = 'CardoItalic';

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.cream, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the rule's geometry: every mark is placed with log10 ----------
const L = 700, X0 = 82;                  // length of one decade on C and D; x of the left index
const RULE = { left: 40, right: 824 };   // the stock; the slide is the same length
const Y = { aTop: 300, slideTop: 377, slideBot: 497, dBot: 582 };
const lg = Math.log10;
const X = (v) => X0 + L * lg(v);                  // D scale (fixed)
const XC = (v, off) => X0 + off + L * lg(v);       // C scale (on the slide)
const XCI = (v, off) => X0 + off + L * (1 - lg(v)); // CI scale, red, inverted (on the slide)
const XA = (v) => X0 + (L / 2) * lg(v);           // A scale, two decades (upper stator)
const r3 = (x) => x.toFixed(3);

const P1 = [2, 3], P2 = [1.5, 5];
const OFF1 = L * lg(P1[0]), OFF2 = L * lg(P2[0]);
const PROD1 = P1[0] * P1[1], PROD2 = P2[0] * P2[1];

// ---------- timeline ----------
const CUES = [
  [0.5, 4.6, 'Until the 1970s, engineers multiplied with a *sliding ruler*.'],
  [4.7, 9.0, 'How can sliding a stick ~multiply~ two numbers?'],
  [9.3, 13.5, 'Look: the numbers crowd together as they grow.'],
  [13.6, 18.3, `Each number sits at its *logarithm* from 1: log 3 = ${r3(lg(3))}.`],
  [18.4, 22.7, 'So every ~doubling~ takes the same step, as the brackets show.'],
  [23.0, 27.8, `For *${P1[0]} × ${P1[1]}*, slide C’s 1 over the ${P1[0]} on D.`],
  [27.9, 31.6, `Then move the cursor to ${P1[1]} on C…`],
  [31.7, 34.9, `…and read D under the hairline: ~${PROD1}~.`],
  [35.0, 40.2, `The lengths added: *${r3(lg(P1[0]))}* + *${r3(lg(P1[1]))}* = ~${r3(lg(P1[0]) + lg(P1[1]))}~, the log of ${PROD1}.`],
  [40.4, 45.0, `Same moves for *${P2[0]} × ${P2[1]}*: slide to ${P2[0]}, cursor to ${P2[1]}…`],
  [45.1, 48.1, `…and D reads ~${PROD2}~.`],
  [48.3, 53.0, 'Adding logarithms ~multiplies~ numbers: that is the whole trick.'],
  [53.1, 58.4, 'Buzz Aldrin’s own slide rule flew with him to the Moon on *Apollo 11*.'],
];
const DUR = 58.6;

// Slide offset and cursor position over time, eased.
function slideOff(t) {
  let off = lerp(0, OFF1, eio(seg(t, 24.2, 26.8)));
  off = lerp(off, OFF2, eio(seg(t, 40.9, 42.9)));
  return off;
}
function cursorX(t) {
  let x = lerp(X(4.6), X(3), eio(seg(t, 14.0, 15.4)));
  x = lerp(x, X(8), eio(seg(t, 19.0, 20.6)));
  x = lerp(x, X(PROD1), eio(seg(t, 28.3, 30.5)));
  x = lerp(x, X(PROD2), eio(seg(t, 43.2, 44.8)));
  return x;
}
// The whole rule glides in at the start.
const ruleShift = (t) => lerp(-940, 0, eout(seg(t, 0.25, 2.3)));

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the blotter, painted once ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 430, 60, W / 2, 470, 820);
  rad.addColorStop(0, C.bg0); rad.addColorStop(0.55, C.bg1); rad.addColorStop(1, C.bg2);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  // leather grain: soft blotches and fine speckle
  const rnd = mulberry32(7);
  for (let i = 0; i < 900; i++) {
    const x = rnd() * W, y = rnd() * H, r = 2 + rnd() * 9;
    g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(160,220,190,0.025)';
    g.beginPath(); g.ellipse(x, y, r * 1.6, r, rnd() * Math.PI, 0, Math.PI * 2); g.fill();
  }
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 3; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
  // stitched border of the blotter
  g.strokeStyle = 'rgba(241,198,107,0.16)'; g.lineWidth = 2; g.setLineDash([9, 7]);
  g.strokeRect(26, 26, W - 52, H - 52); g.setLineDash([]);
  const vg = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- the rule, also painted once per part ----------
let parts = null;
function bambooPiece(w, h, rnd) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const lgd = g.createLinearGradient(0, 0, 0, h);
  lgd.addColorStop(0, C.bambooLight); lgd.addColorStop(0.5, C.bamboo); lgd.addColorStop(1, C.bambooDark);
  g.fillStyle = lgd; g.beginPath(); g.roundRect(0, 0, w, h, 5); g.fill();
  // bamboo fibres along the length, and a node or two
  for (let i = 0; i < 70; i++) {
    const y = rnd() * h;
    g.strokeStyle = `rgba(90,60,20,${0.08 + rnd() * 0.12})`; g.lineWidth = 0.6 + rnd();
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (rnd() - 0.5) * 3); g.stroke();
  }
  for (const nx of [w * 0.07, w * 0.93]) { g.fillStyle = 'rgba(90,60,20,0.18)'; g.fillRect(nx, 0, 3, h); }
  return { cv, g };
}
function ivoryFace(g, x, y, w, h, rnd) {
  const lgd = g.createLinearGradient(0, y, 0, y + h);
  lgd.addColorStop(0, '#FBF5E3'); lgd.addColorStop(1, C.ivoryShade);
  g.fillStyle = lgd; g.fillRect(x, y, w, h);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = `rgba(150,120,60,${0.03 + rnd() * 0.04})`;
    g.fillRect(x + rnd() * w, y + rnd() * h, 6 + rnd() * 40, 1);
  }
}
/** Ticks for a single-decade scale with the left index at x0: dir +1 draws down from y, -1 up. */
function ticksDecade(g, xOf, y, dir, color, labels, labelY, size = 24) {
  g.strokeStyle = color; g.fillStyle = color;
  for (let i = 100; i <= 1000; i += 5) {
    const v = i / 100;
    const whole = i % 100 === 0, half = i % 50 === 0, tenth = i % 10 === 0;
    if (!tenth && v >= 2) continue;
    const len = whole ? 26 : half ? 17 : tenth ? 11 : 6;
    g.lineWidth = whole ? 2.2 : 1.3;
    const x = xOf(v);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + dir * len); g.stroke();
  }
  if (labels) {
    g.font = `500 ${size}px ${TEXT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let v = 1; v <= 10; v++) g.fillText(String(v), xOf(v), labelY);
  }
}
function paintParts() {
  const rnd = mulberry32(3);
  const len = RULE.right - RULE.left;
  // upper stator with the A scale (two decades)
  const up = bambooPiece(len, Y.slideTop - Y.aTop, rnd);
  ivoryFace(up.g, 0, 6, len, Y.slideTop - Y.aTop - 10, rnd);
  {
    const g = up.g, y = Y.slideTop - Y.aTop - 4, ox = -RULE.left;
    g.strokeStyle = C.ink; g.fillStyle = C.ink;
    for (let i = 100; i <= 10000; i += i < 1000 ? 10 : 100) {
      const v = i / 100; const top = Number.isInteger(v) && (v < 10 || v % 10 === 0);
      const len2 = top ? 18 : 8; if (v > 10 && v % 10 !== 0 && i % 500 !== 0) continue;
      if (v < 10 && !Number.isInteger(v) && i % 50 !== 0) continue;
      g.lineWidth = top ? 1.8 : 1.1;
      const x = XA(v) + ox; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - len2); g.stroke();
    }
    g.font = `500 22px ${TEXT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const v of [1, 2, 3, 4, 5, 7, 10, 20, 30, 40, 50, 70, 100]) g.fillText(String(v), XA(v) + ox, y - 36);
    g.font = `600 22px ${TEXT}`; g.fillText('A', 20, y - 36);
  }
  // the slide: CI in red along its top, C in black along its bottom
  const sl = bambooPiece(len, Y.slideBot - Y.slideTop, rnd);
  ivoryFace(sl.g, 0, 3, len, Y.slideBot - Y.slideTop - 6, rnd);
  {
    const g = sl.g, ox = -RULE.left, h = Y.slideBot - Y.slideTop;
    ticksDecade(g, (v) => XCI(v, 0) + ox, 3, 1, C.red, false);
    g.font = `500 22px ${TEXT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.red;
    for (let v = 1; v <= 9; v++) g.fillText(String(v), XCI(v, 0) + ox, 42);
    g.font = `600 22px ${TEXT}`; g.fillText("CI", 20, 42);
    ticksDecade(g, (v) => XC(v, 0) + ox, h - 3, -1, C.ink, true, h - 44);
    g.fillStyle = C.ink; g.font = `600 22px ${TEXT}`; g.fillText('C', 20, h - 44);
    // a thin groove line through the middle
    g.fillStyle = 'rgba(120,95,50,0.25)'; g.fillRect(0, h / 2 - 7, len, 1);
  }
  // lower stator with D
  const lo = bambooPiece(len, Y.dBot - Y.slideBot, rnd);
  ivoryFace(lo.g, 0, 4, len, Y.dBot - Y.slideBot - 10, rnd);
  {
    const g = lo.g, ox = -RULE.left;
    ticksDecade(g, (v) => X(v) + ox, 4, 1, C.ink, false);
    g.fillStyle = C.ink; g.font = `600 22px ${TEXT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('D', 20, 50);
  }
  parts = { up: up.cv, sl: sl.cv, lo: lo.cv };
}

// D labels are drawn live so they can glow and pulse.
function dLabels(t, sx, glowAt) {
  for (let v = 1; v <= 10; v++) {
    const x = X(v) + sx, y = Y.slideBot + 50;
    const pulse = span(t, 9.6 + v * 0.32, 10.4 + v * 0.32, 0.25, 0.45);
    const g = Math.max(pulse, glowAt(v));
    if (g > 0) withAlpha(g, () => {
      ctx.fillStyle = 'rgba(241,198,107,0.55)'; ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
    });
    font(600, 24); text(String(v), x, y + 1, { color: C.ink, align: 'center', base: 'middle' });
  }
}

function drawRule(t) {
  if (!parts) paintParts();
  const sx = ruleShift(t), off = slideOff(t);
  // shadow under the rule
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#000'; ctx.fillRect(RULE.left + sx + 6, Y.aTop + 10, RULE.right - RULE.left - 12, Y.dBot - Y.aTop - 14);
  ctx.restore();
  // dark groove the slide runs in
  ctx.fillStyle = '#3B2A12'; ctx.fillRect(RULE.left + sx, Y.slideTop - 2, RULE.right - RULE.left, Y.slideBot - Y.slideTop + 4);
  ctx.drawImage(parts.up, RULE.left + sx, Y.aTop);
  ctx.drawImage(parts.lo, RULE.left + sx, Y.slideBot);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6;
  ctx.drawImage(parts.sl, RULE.left + sx + off, Y.slideTop);
  ctx.restore();
  return { sx, off };
}

function glowRing(x, y, r, a, color = C.gold) {
  withAlpha(a, () => {
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  });
}

function drawCursor(t, sx) {
  const cx = cursorX(t) + sx, w = 78, top = Y.aTop - 18, bot = Y.dBot + 18;
  const a = eout(seg(t, 1.6, 2.6));
  withAlpha(a, () => {
    ctx.fillStyle = C.glass; ctx.fillRect(cx - w / 2, top, w, bot - top);
    // a soft reflection across the glass
    const rg = ctx.createLinearGradient(cx - w / 2, top, cx + w / 2, bot);
    rg.addColorStop(0.0, 'rgba(255,255,255,0)'); rg.addColorStop(0.42, 'rgba(255,255,255,0.10)');
    rg.addColorStop(0.5, 'rgba(255,255,255,0.20)'); rg.addColorStop(0.58, 'rgba(255,255,255,0.06)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg; ctx.fillRect(cx - w / 2, top, w, bot - top);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.strokeRect(cx - w / 2, top, w, bot - top);
    // steel end bars
    for (const [y0, h] of [[top - 6, 18], [bot - 12, 18]]) {
      const mg = ctx.createLinearGradient(0, y0, 0, y0 + h);
      mg.addColorStop(0, '#D9DEE0'); mg.addColorStop(0.5, C.steel); mg.addColorStop(1, C.steelDark);
      ctx.fillStyle = mg; rrect(cx - w / 2 - 6, y0, w + 12, h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(cx - w / 2 + 6, y0 + h / 2, 3, 0, 7); ctx.arc(cx + w / 2 - 6, y0 + h / 2, 3, 0, 7); ctx.fill();
    }
    // the red hairline
    ctx.strokeStyle = C.red; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, top + 12); ctx.lineTo(cx, bot - 12); ctx.stroke();
  });
  return cx;
}

// ---------- overlays ----------
function bigSum(t) {
  // "2 × 3 = ?" then "= 6", above the rule
  const a = span(t, 4.9, 40.3, 0.6, 0.5);
  withAlpha(a, () => {
    const done = eout(seg(t, 32.0, 32.8));
    font(700, 76, SERIF);
    const left = `${P1[0]} × ${P1[1]} = `;
    const lw = ctx.measureText(left).width;
    const total = lw + ctx.measureText(String(PROD1)).width;
    const x = W / 2 - total / 2;
    text(left, x, 210, { color: C.cream, base: 'middle' });
    withAlpha(1 - done, () => text('?', x + lw, 210, { color: C.gold, base: 'middle' }));
    withAlpha(done, () => text(String(PROD1), x + lw, 210 + (1 - done) * 16, { color: C.gold, base: 'middle' }));
  });
  const b = span(t, 40.7, 48.3, 0.5, 0.5);
  withAlpha(b, () => {
    const done = eout(seg(t, 45.3, 46.1));
    font(700, 76, SERIF);
    const left = `${P2[0]} × ${P2[1]} = `;
    const lw = ctx.measureText(left).width;
    const total = lw + ctx.measureText(String(PROD2)).width;
    const x = W / 2 - total / 2;
    text(left, x, 210, { color: C.cream, base: 'middle' });
    withAlpha(1 - done, () => text('?', x + lw, 210, { color: C.gold, base: 'middle' }));
    withAlpha(done, () => text(String(PROD2), x + lw, 210 + (1 - done) * 16, { color: C.gold, base: 'middle' }));
  });
  const c = span(t, 48.5, 53.2, 0.6, 0.5);
  withAlpha(c, () => {
    font(400, 58, SERIF_I);
    text('log(x × y) = log x + log y', W / 2, 210, { color: C.cream, align: 'center', base: 'middle' });
  });
}

/** A horizontal measuring bracket between x1 and x2 at height y, with a label above it. */
function bracket(x1, x2, y, label, color, a, grow = 1) {
  withAlpha(a, () => {
    const xe = lerp(x1, x2, grow);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y - 10); ctx.lineTo(x1, y); ctx.lineTo(xe, y); ctx.lineTo(xe, y - 10); ctx.stroke();
    if (label) withAlpha(eout(seg(grow, 0.6, 1)), () => { font(600, 24); text(label, (x1 + x2) / 2, y + 26, { color, align: 'center', base: 'middle' }); });
  });
}

/** A solid bar standing for a length, drawn under the rule. */
function lenBar(x1, x2, y, color, a, grow, label, labelColor = C.cream, above = false) {
  withAlpha(a, () => {
    const xe = lerp(x1, x2, grow);
    ctx.fillStyle = color; rrect(x1, y - 9, Math.max(0.1, xe - x1), 18, 4); ctx.fill();
    if (label) withAlpha(eout(seg(grow, 0.7, 1)), () => {
      font(600, 24); text(label, (x1 + x2) / 2, above ? y - 30 : y + 34, { color: labelColor, align: 'center', base: 'middle' });
    });
  });
}

function sceneB(t, sx) {
  // 1 → 3 measured with the cursor
  const a1 = span(t, 14.2, 18.4, 0.4, 0.4);
  bracket(X(1) + sx, X(3) + sx, 660, `log 3 = ${r3(lg(3))}`, C.gold, a1, eio(seg(t, 14.0, 15.4)));
  // three doublings, each the same length
  const a2 = span(t, 18.6, 22.9, 0.4, 0.45);
  const segs = [[1, 2], [2, 4], [4, 8]];
  segs.forEach(([p, q], i) => {
    const g = eio(seg(t, 19.0 + i * 0.55, 19.9 + i * 0.55));
    bracket(X(p) + sx + 2, X(q) + sx - 2, 660, `×2: ${r3(lg(q) - lg(p))}`, i === 1 ? C.redText : C.gold, a2 * (g > 0 ? 1 : 0), g);
  });
}

function sceneC(t, sx, off) {
  // index and factor rings while the slide moves
  const rA = span(t, 23.4, 28.0, 0.35, 0.4);
  glowRing(X(P1[0]) + sx, Y.slideBot + 50, 23, rA);
  glowRing(XC(1, off) + sx, Y.slideBot - 44, 23, rA);
  glowRing(XC(P1[1], off) + sx, Y.slideBot - 44, 23, span(t, 28.4, 35.0, 0.35, 0.4), C.redText);
  // the added lengths
  const a = span(t, 35.0, 40.4, 0.4, 0.45);
  const y = 650;
  lenBar(X(1) + sx, X(P1[0]) + sx, y, C.redText, a, eio(seg(t, 35.2, 36.3)), r3(lg(P1[0])), C.redText);
  lenBar(X(P1[0]) + sx, X(PROD1) + sx, y, C.ivory, a, eio(seg(t, 36.3, 37.4)), r3(lg(P1[1])), C.ivory);
  bracket(X(1) + sx, X(PROD1) + sx, y + 64, `${r3(lg(P1[0]) + lg(P1[1]))} = log ${PROD1}`, C.gold, a, eio(seg(t, 37.6, 38.6)));
}

function sceneD(t, sx, off) {
  const a = span(t, 41.0, 48.2, 0.35, 0.4);
  glowRing(XC(1, off) + sx, Y.slideBot - 44, 23, a * (1 - seg(t, 43.0, 43.4)));
  glowRing(XC(P2[1], off) + sx, Y.slideBot - 44, 23, a * seg(t, 43.6, 44.2), C.redText);
  // there is no figure 7.5 on D, so a tag points to the spot under the hairline
  const b = span(t, 45.1, 48.3, 0.35, 0.4);
  withAlpha(b, () => {
    const x = X(PROD2) + sx, y = 670;
    ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.moveTo(x, Y.dBot + 22); ctx.lineTo(x - 12, y - 30); ctx.lineTo(x + 12, y - 30); ctx.closePath(); ctx.fill();
    rrect(x - 50, y - 30, 100, 52, 10); ctx.fill();
    font(700, 32); text(String(PROD2), x, y - 3, { color: C.ink, align: 'center', base: 'middle' });
  });
}

function sceneE(t, sx) {
  const a = span(t, 53.2, DUR, 0.6, 0);
  if (a <= 0) return;
  withAlpha(a, () => {
    // the Moon, above the rule, and a dotted path from the rule up to it
    const mx = 560, my = 170, r = 70;
    const mg = ctx.createRadialGradient(mx - 20, my - 20, 10, mx, my, r);
    mg.addColorStop(0, '#FBF6E6'); mg.addColorStop(1, '#C9C1A8');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,110,90,0.25)';
    for (const [dx, dy, cr] of [[-22, -10, 14], [18, 22, 10], [26, -26, 8], [-8, 32, 7]]) { ctx.beginPath(); ctx.arc(mx + dx, my + dy, cr, 0, 7); ctx.fill(); }
    const p = eio(seg(t, 53.4, 56.0));
    ctx.strokeStyle = 'rgba(241,198,107,0.8)'; ctx.lineWidth = 3; ctx.setLineDash([3, 10]); ctx.lineCap = 'round';
    ctx.beginPath();
    const x0 = 250, y0 = 285, cx1 = 300, cy1 = 140, x1 = mx - r - 12, y1 = my + 10;
    const n = 40; for (let i = 0; i <= n * p; i++) { const u = i / n; const bx = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx1 + u * u * x1; const by = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy1 + u * u * y1; if (i === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by); }
    ctx.stroke(); ctx.setLineDash([]);
    font(600, 26); text('APOLLO 11', mx, my + r + 34, { color: C.gold, align: 'center', base: 'middle', spacing: '3px' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 600, maxW: 740 };
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
    k.captions(t, [cue], { x: W / 2, y: 830, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.cream, marks: { '*': C.redText, '~': C.gold } });
  }
}

Kit.scene({
  width: W, height: H, duration: DUR,
  fonts: [
    { family: TEXT, file: 'Jost.woff2' },
    { family: SERIF, file: 'Cardo-Bold.woff2', weight: '700' },
    { family: SERIF_I, file: 'Cardo-Italic.woff2', weight: '400' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(600, 22); text('RECKON', 64, 84, { color: C.gold, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 6 * 3;
    font(500, 22); text('MATH · LOGARITHMS', 64 + rw + 20, 84, { color: C.creamSoft, spacing: '3px' });
    const { sx, off } = drawRule(t);
    // D figures glow when they are the answer or the factor
    dLabels(t, sx, (v) => (v === P1[0] ? span(t, 23.4, 28.0, 0.35, 0.4) : 0) + (v === PROD1 ? span(t, 31.9, 35.0, 0.3, 0.4) : 0));
    sceneB(t, sx);
    sceneC(t, sx, off);
    sceneD(t, sx, off);
    drawCursor(t, sx);
    bigSum(t);
    sceneE(t, sx);
    captions(t);
  },
});
