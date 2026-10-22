// Explainer for psychology-spacing-effect: spread out, 38 repetitions did the work of 68 crammed ones.
// Look: a page of a ruled school notebook. Blue rules, a red margin, punched holes; the graph is drawn
// in pencil by a little pencil, key numbers get a yellow highlighter swipe. Caveat for handwriting,
// Nunito for captions.
//
// Scene plan (61.5 s). Captions centred at y = 842; everything important above y = 930.
//  A  0.0–10.3  Hook. "How fast do you forget something you just learned?" Nonsense syllables are
//               written down the page: Ebbinghaus tested himself on syllables like WID and ZOF.
//  B 10.3–26.6  The forgetting curve, drawn from Ebbinghaus's own formula (below), first over one day:
//               about 1/2 left after an hour, about 1/3 after a day. Then the time axis zooms out to a
//               month: the curve flattens, about 1/5 left.
//  C 26.6–43.7  Cramming vs spacing: 68 tally marks in one day against 38 spread over three days (about
//               18, 12 and 8: his day totals for nine lists, 158, 109 and 75, divided by nine). Same result.
//               "decidedly more advantageous".
//  D 43.7–49.5  Why: a sketch (not data) of reviews resetting the curve, each decay slower.
//  E 49.5–61.5  Payoff: "the spacing effect", highlighted; a 2006 review: spacing won 259 of 271 cases.
//
// Facts. Wikipedia "Forgetting curve": Ebbinghaus studied himself (1880–1885, published 1885), nonsense
// syllables such as WID and ZOF, measured "savings" (time saved relearning); his equation
// b = 100k / ((log t)^c + k), t in minutes from one minute before the end of learning, c = 1.25, k = 1.84;
// "the forgetting curve was flattened by every repetition"; each repetition increases the optimum interval
// before the next. Ebbinghaus, Memory (1885; tr. 1913, psychclassics.yorku.ca): the log is common (base 10);
// after an hour about one half, after 24 hours about one third, after a month fully one fifth remained;
// §34: 38 repetitions distributed over the three preceding days "had just as favorable an effect as 68
// repetitions made on the day just previous"; distribution is "decidedly more advantageous than the massing
// of them at a single time". Wikipedia "Spacing effect": first identified by Ebbinghaus (1885); Cepeda et
// al. (2006): spaced practice beat massed practice in 259 out of 271 cases.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const HAND = 'Caveat', TEXT = 'Nunito';

const C = {
  paper: '#FBF8EE', rule: 'rgba(86,140,205,0.33)', margin: 'rgba(222,86,86,0.55)', pencil: '#3C3F45',
  ink: '#1E2A44', inkSoft: 'rgba(30,42,68,0.70)', red: '#C2410C', blue: '#1F5FAD', hi: 'rgba(255,232,64,0.62)',
};

const CUES = [
  [0.4, 4.4, 'How fast do you forget something you just learned?'],
  [4.6, 10.2, 'Hermann Ebbinghaus tested himself, learning lists of nonsense syllables like *WID* and *ZOF*.'],
  [10.4, 15.6, 'Later he timed how fast he could relearn them: his *savings*.'],
  [15.8, 21.0, 'Within an hour, about *half* was gone. By the next day, about *two-thirds*.'],
  [21.2, 26.4, 'Then the curve flattens: after a month, about a *fifth* remained.'],
  [26.8, 31.8, 'Then he compared cramming with spreading repetitions out.'],
  [32.0, 38.2, 'Spread over three days, *38* repetitions did as much as *68* crammed into one day.'],
  [38.4, 43.6, 'He judged spacing them out *decidedly more advantageous*.'],
  [43.8, 49.4, 'Each well-timed review flattens the curve, so the next can wait longer.'],
  [49.6, 55.0, 'Today it’s called the *spacing effect*: the same study, spread out, sticks better.'],
  [55.2, 61.2, 'One 2006 review found spacing won in *259 of 271* cases.'],
];

let k, ctx;
const font = (weight, size, family = TEXT) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const hand = (s, x, y, size, opts = {}) => { font(600, size, HAND); text(s, x, y, { color: C.pencil, ...opts }); };

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the notebook page, painted once ----------
let PAGE = null;
function paintPage() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const rnd = mulberry32(5);
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let p = 0; p < d.length; p += 4) { const n = (rnd() - 0.5) * 8; d[p] += n; d[p + 1] += n; d[p + 2] += n; }
  g.putImageData(img, 0, 0);
  g.strokeStyle = C.rule; g.lineWidth = 1.6;
  for (let y = 154; y < H; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.strokeStyle = C.margin; g.lineWidth = 2;
  g.beginPath(); g.moveTo(98, 0); g.lineTo(98, H); g.stroke();
  for (const y of [236, 540, 1000]) { // punched holes
    g.fillStyle = 'rgba(70,60,45,0.20)'; g.beginPath(); g.arc(42, y + 2, 15, 0, 7); g.fill();
    g.fillStyle = '#D9D2C2'; g.beginPath(); g.arc(42, y, 14, 0, 7); g.fill();
  }
  const vg = g.createRadialGradient(W / 2, H * 0.45, 300, W / 2, H / 2, 820);
  vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(120,100,60,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  return c;
}
function background() {
  if (!PAGE) PAGE = paintPage();
  ctx.drawImage(PAGE, 0, 0);
  font(800, 21); text('RECKON · PSYCHOLOGY', 120, 84, { color: C.inkSoft, spacing: '2px' });
}

// ---------- pencil helpers ----------
const jit = (i, s) => Math.sin(i * 12.9898 + s * 78.233) * 0.5;
/** A pencil line through pts, drawn up to fraction p, a little rough. */
function pencil(pts, p = 1, width = 3.2, color = C.pencil) {
  const n = Math.max(2, Math.floor(pts.length * clamp(p)));
  if (p <= 0) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color;
  for (const [pass, w, a] of [[0, width, 0.85], [1, width * 0.55, 0.5]]) {
    ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath();
    for (let i = 0; i < n; i++) { const [x, y] = pts[i]; const dx = jit(i, pass + 1) * 1.2, dy = jit(i, pass + 3) * 1.2; i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return pts[n - 1];
}
const line = (x0, y0, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
/** The little pencil, its tip at x, y. */
function pencilIcon(x, y, a) {
  if (a <= 0) return;
  k.alpha(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.75);
    ctx.fillStyle = '#E8C9A0'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, -9); ctx.lineTo(22, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3A3A3A'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, -3); ctx.lineTo(7, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F5B82E'; ctx.fillRect(22, -9, 110, 18);
    ctx.fillStyle = '#D99A12'; ctx.fillRect(22, -3, 110, 2.5);
    ctx.fillStyle = '#B9BDC4'; ctx.fillRect(132, -9, 14, 18);
    ctx.fillStyle = '#EE8FA0'; k.rrect(146, -9, 20, 18, 5); ctx.fill();
    ctx.restore();
  });
}
/** A highlighter swipe from x0 to x1 at height y, grown to fraction p. */
function highlight(x0, x1, y, h, p, a = 1) {
  if (p <= 0 || a <= 0) return;
  k.alpha(a, () => {
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = C.hi;
    const x = lerp(x0, x1, eout(clamp(p)));
    ctx.beginPath(); ctx.moveTo(x0, y - h / 2 + 2); ctx.lineTo(x, y - h / 2); ctx.lineTo(x + 4, y + h / 2); ctx.lineTo(x0 - 3, y + h / 2 - 1); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}

// ---------- A: syllables ----------
const SYL = ['WID', 'ZOF', 'KEB', 'MUP', 'DAX', 'LOV', 'TIQ', 'NEH'];
function sceneA(t) {
  SYL.forEach((s, i) => {
    const a = eout(seg(t, 4.8 + i * 0.45, 5.3 + i * 0.45));
    if (a <= 0) return;
    const col = i < 4 ? 0 : 1, row = i % 4;
    const x = 250 + col * 330, y = 286 + row * 88;
    k.alpha(a, () => hand(s, x, y - (1 - a) * 8, 78, { align: 'center', color: i < 2 ? C.ink : C.pencil }));
    if (i < 2) highlight(x - 70, x + 70, y - 22, 54, seg(t, 7.0 + i * 0.5, 7.8 + i * 0.5));
  });
  const q = span(t, 0.3, 10.3, 0.5, 0.4);
  k.alpha(q * (1 - seg(t, 4.4, 5.0)), () => { hand('?', W / 2, 520, 220, { align: 'center', color: 'rgba(60,63,69,0.55)' }); });
  k.alpha(eout(seg(t, 8.6, 9.4)), () => hand('nonsense syllables', W / 2, 680, 44, { align: 'center', color: C.inkSoft }));
}

// ---------- B: the forgetting curve ----------
const savings = (min) => (min <= 1 ? 100 : (100 * 1.84) / (Math.pow(Math.log10(min), 1.25) + 1.84));
const G = { x0: 172, x1: 760, y0: 640, y1: 236 }; // axes: x0,y0 = origin; y1 = 100%
const Y = (b) => lerp(G.y0, G.y1, b / 100);
// The time axis spans `spanH` hours: one day, then it zooms out to a month (31 days).
const spanAt = (t) => lerp(24, 31 * 24, eio(seg(t, 21.6, 23.8)));
const X = (hours, spanH) => G.x0 + (hours / spanH) * (G.x1 - G.x0);
function curvePts(spanH, upToH) {
  const pts = [];
  const n = 260;
  for (let i = 0; i <= n; i++) {
    const hrs = Math.pow(i / n, 3) * upToH; // dense near the start, where the curve is steep
    pts.push([X(hrs, spanH), Y(savings(hrs * 60 + 1))]);
  }
  return pts;
}
function sceneB(t) {
  const axes = eout(seg(t, 10.5, 11.6));
  pencil(line(G.x0, G.y0, G.x0, G.y1 - 20), axes, 3);
  pencil(line(G.x0, G.y0, G.x1 + 16, G.y0), axes, 3);
  const lab = seg(t, 11.0, 11.8);
  k.alpha(lab, () => {
    ctx.save(); ctx.translate(124, (G.y0 + G.y1) / 2); ctx.rotate(-Math.PI / 2);
    hand('memory left', 0, 0, 38, { align: 'center', base: 'middle', color: C.ink }); ctx.restore();
    hand('100%', G.x0 - 12, G.y1 + 8, 28, { align: 'right' }); hand('0', G.x0 - 12, G.y0 + 8, 28, { align: 'right' });
    hand('measured as time saved in relearning', G.x0 + 4, G.y0 + 92, 30, { color: C.inkSoft });
  });
  pencil(line(G.x0 - 6, G.y1, G.x0 + 6, G.y1, 4), lab, 2.4);
  // ticks: hours first, then days
  const sp = spanAt(t), zoom = eio(seg(t, 21.6, 23.8));
  k.alpha(lab * (1 - zoom), () => {
    for (const [h, s] of [[6, '6 h'], [12, '12 h'], [18, '18 h'], [24, '1 day']]) {
      const x = X(h, sp); pencil(line(x, G.y0 - 6, x, G.y0 + 6, 3), 1, 2.4); hand(s, x, G.y0 + 44, 32, { align: 'center' });
    }
  });
  k.alpha(zoom, () => {
    for (const [d, s] of [[10, '10 days'], [20, '20 days'], [31, '1 month']]) {
      const x = X(d * 24, sp); pencil(line(x, G.y0 - 6, x, G.y0 + 6, 3), 1, 2.4); hand(s, x, G.y0 + 44, 32, { align: 'center' });
    }
  });
  // the curve: drawn over the first day, then on to a month while the axis zooms out
  const draw1 = eio(seg(t, 12.2, 15.4));
  const upTo = lerp(0, 24, draw1) + (sp > 24 ? (sp - 24) * clamp(seg(t, 21.6, 24.6) * 1.0) : 0);
  if (upTo > 0) {
    const pts = curvePts(sp, Math.min(upTo, sp));
    const tip = pencil(pts, 1, 4.2, C.ink);
    pencilIcon(tip[0], tip[1], Math.max(span(t, 12.2, 15.8, 0.2, 0.4), span(t, 21.6, 25.0, 0.2, 0.4)));
  }
  // marks in words from Ebbinghaus's text, placed on the curve
  const marks = [[1, '1 hour: about 1/2 left', 16.2, -1], [24, '1 day: about 1/3 left', 18.4, 1], [31 * 24, '1 month: about 1/5 left', 24.8, 1]];
  for (const [h, s, at, side] of marks) {
    const a = eout(seg(t, at, at + 0.6)) * (h === 1 ? 1 - zoom : 1);
    if (a <= 0 || (h > sp)) continue;
    const x = X(h, sp), y = Y(savings(h * 60 + 1));
    k.alpha(a, () => {
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill();
      font(700, 34, HAND);
      const w = ctx.measureText(s).width;
      const tx = h === 1 ? x + 26 : h === 24 ? Math.min(x + 18, G.x1 - w) : G.x1 - w, ty = h === 1 ? y - 30 : h === 24 ? y - 34 - 72 * zoom : y - 34;
      highlight(tx - 8, tx + w + 8, ty - 10, 40, seg(t, at + 0.3, at + 1.1));
      text(s, tx, ty, { color: C.red });
    });
  }
}

// ---------- C: 68 crammed against 38 spread ----------
function tally(x, y, count, p, gap = 54, perRow = 3) {
  // groups of five: four strokes and a slash; groups run left to right, perRow to a row
  const shown = Math.floor(count * clamp(p));
  for (let i = 0; i < shown; i++) {
    const gI = Math.floor(i / 5), inG = i % 5, row = Math.floor(gI / perRow), col = gI % perRow;
    const gx = x + col * gap, gy = y + row * 66;
    if (inG < 4) pencil(line(gx + inG * 9, gy, gx + inG * 9 + 2, gy + 46, 6), 1, 3.2);
    else pencil(line(gx - 6, gy + 34, gx + 36, gy + 10, 6), 1, 3.2);
  }
}
function sceneC(t) {
  const boxA = eout(seg(t, 27.0, 27.8)), boxB = eout(seg(t, 27.4, 28.2));
  k.alpha(boxA, () => {
    hand('Crammed', 270, 234, 52, { align: 'center', color: C.ink });
    hand('one day', 270, 274, 32, { align: 'center', color: C.inkSoft });
    tally(150, 306, 68, seg(t, 28.2, 31.2), 54, 3);
  });
  k.alpha(boxB, () => {
    hand('Spread out', 650, 234, 52, { align: 'center', color: C.ink });
    for (let d = 0; d < 3; d++) hand(`day ${d + 1}`, 492 + d * 116 + 36, 274, 32, { align: 'center', color: C.inkSoft });
    // about 18, 12 and 8 per list on the three days (his totals for nine lists, divided by nine)
    tally(492, 306, 18, seg(t, 29.0, 30.4), 46, 2);
    tally(492 + 116, 306, 12, seg(t, 30.4, 31.2), 46, 2);
    tally(492 + 2 * 116, 306, 8, seg(t, 31.2, 31.8), 46, 2);
  });
  // divider
  pencil(line(440, 220, 446, 600, 12), boxA * (1 - seg(t, 34.6, 35.2)), 2.6, 'rgba(60,63,69,0.6)');
  // totals
  const tot = eout(seg(t, 32.2, 33.0));
  k.alpha(tot, () => {
    font(700, 92, HAND); text('68', 270, 704, { align: 'center', color: C.ink }); text('38', 650, 704, { align: 'center', color: C.ink });
    hand('repetitions', 270, 744, 32, { align: 'center', color: C.inkSoft }); hand('repetitions', 650, 744, 32, { align: 'center', color: C.inkSoft });
  });
  highlight(600, 700, 676, 66, seg(t, 33.6, 34.4));
  const eq = eout(seg(t, 35.0, 35.8));
  k.alpha(eq, () => {
    hand('=', 460, 702, 96, { align: 'center', color: C.red });
    hand('same result next day', 450, 640, 36, { align: 'center', color: C.red });
  });
  // a red tick for the winner
  const tick = seg(t, 38.6, 39.3);
  pencil([[742, 226], [758, 244], [790, 196]].flatMap((p, i, a) => (i ? line(a[i - 1][0], a[i - 1][1], p[0], p[1], 8) : [])), tick, 5, C.red);
}

// ---------- D: reviews flatten the curve (a sketch, not data) ----------
const D = { x0: 172, x1: 760, y0: 620, y1: 250, days: 30 };
const REVIEWS = [0, 2, 6, 14]; // days of learning and reviews: gaps that grow
function sketchMem(day) {
  // after each review, memory restarts at 100% and fades with a longer time constant
  let last = 0, n = 0;
  for (let i = 0; i < REVIEWS.length; i++) if (day >= REVIEWS[i]) { last = REVIEWS[i]; n = i; }
  const tau = 0.9 * Math.pow(2.6, n);
  return 100 * (0.18 + 0.82 * Math.exp(-(day - last) / tau));
}
function sceneD(t) {
  const axes = eout(seg(t, 43.9, 44.6));
  pencil(line(D.x0, D.y0, D.x0, D.y1 - 20), axes, 3);
  pencil(line(D.x0, D.y0, D.x1 + 16, D.y0), axes, 3);
  k.alpha(axes, () => {
    ctx.save(); ctx.translate(124, (D.y0 + D.y1) / 2); ctx.rotate(-Math.PI / 2);
    hand('memory', 0, 0, 38, { align: 'center', base: 'middle', color: C.ink }); ctx.restore();
    hand('days', D.x1, D.y0 + 44, 32, { align: 'right' });
    hand('a sketch, not data', D.x1, D.y1 - 24, 32, { align: 'right', color: C.inkSoft });
  });
  const p = eio(seg(t, 44.6, 48.6));
  const pts = [];
  for (let i = 0; i <= 600; i++) {
    const day = (i / 600) * D.days;
    if (day > p * D.days) break;
    pts.push([lerp(D.x0, D.x1, day / D.days), lerp(D.y0, D.y1, sketchMem(day) / 100)]);
    // a vertical jump at each review: insert the point just before it
    const nd = ((i + 1) / 600) * D.days;
    for (const r of REVIEWS.slice(1)) if (day < r && nd >= r) pts.push([lerp(D.x0, D.x1, r / D.days), lerp(D.y0, D.y1, sketchMem(r - 1e-6) / 100)]);
  }
  if (pts.length > 1) { const tip = pencil(pts, 1, 4.2, C.ink); pencilIcon(tip[0], tip[1], t < 48.8 ? 1 : 0); }
  REVIEWS.slice(1).forEach((r, i) => {
    const at = 44.6 + (r / D.days) * 4.0;
    const a = eout(seg(t, at, at + 0.5));
    if (a <= 0) return;
    const x = lerp(D.x0, D.x1, r / D.days);
    k.alpha(a, () => {
      highlight(x - 14, x + 14, (D.y0 + D.y1) / 2 + 20, D.y0 - D.y1 - 60, 1, 0.9);
      hand('review', x, D.y0 + 44, 30, { align: 'center', color: C.red });
    });
  });
}

// ---------- E: payoff ----------
function sceneE(t) {
  const a = eout(seg(t, 49.8, 50.6));
  k.alpha(a, () => {
    font(700, 104, HAND);
    const s = 'the spacing effect';
    const w = ctx.measureText(s).width;
    highlight(W / 2 - w / 2 - 14, W / 2 + w / 2 + 14, 352, 92, seg(t, 50.6, 51.8));
    text(s, W / 2, 384, { align: 'center', color: C.ink });
    hand('same study, spread out, sticks better', W / 2, 466, 40, { align: 'center', color: C.inkSoft });
  });
  const b = eout(seg(t, 55.4, 56.2));
  k.alpha(b, () => {
    font(700, 130, HAND); text('259', 330, 650, { align: 'center', color: C.red }); text('271', 560, 650, { align: 'center', color: C.ink });
    hand('of', 445, 640, 56, { align: 'center', color: C.inkSoft });
    hand('spaced won', 330, 704, 34, { align: 'center', color: C.red }); hand('cases', 560, 704, 34, { align: 'center', color: C.inkSoft });
    hand('Cepeda et al., 2006', W / 2, 752, 30, { align: 'center', color: C.inkSoft });
  });
}

// ---------- captions with balanced lines ----------
const CAP = { size: 42, lh: 54, weight: 800, maxW: 700 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((x) => ctx.measureText(x.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (maxW) => { let n = 1, lw = 0, any = false; for (const x of words) { if (lw + x > maxW && any) { n++; lw = 0; } lw += x + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capWidth.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2 + 18, y: 852, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: TEXT, ink: C.ink, marks: { '*': C.red, '~': C.blue } });
  }
}

const T = { A: [0, 10.3], B: [10.3, 26.6], C: [26.6, 43.7], D: [43.7, 49.5], E: [49.5, 61.5] };
Kit.scene({
  width: W, height: H, duration: 61.5,
  fonts: [
    { family: HAND, file: 'Caveat.woff2', weight: '400 700' },
    { family: TEXT, file: 'Nunito.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background();
    for (const [fn, [a, b], fi = 0.4, fo = 0.4] of [[sceneA, T.A, 0.01], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.4, 0.01]]) {
      if (t < a || t > b) continue;
      k.alpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
