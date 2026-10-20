// Explainer for tech-binary-search-twenty-guesses: a million numbers, halved to one in 20 guesses.
// Look: warm graph paper, navy ink, tomato and teal highlights, Fraunces numerals.
const W = 864, H = 1080;
const { clamp, seg, lerp, fmt, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F4EEE3', grid: 'rgba(31,42,68,0.055)', ink: '#1F2A44', soft: 'rgba(31,42,68,0.58)',
  faint: 'rgba(31,42,68,0.14)', tomato: '#E2553B', teal: '#2A8C80', mustard: '#F2B33D', card: '#FFFDF8',
};
const SERIF = 'Fraunces', SANS = 'Inter';

// Drawing tools from the kit, bound on the first frame.
let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the search itself ----------
const SECRET = 737013;
const STEPS = [];
{
  let lo = 1, hi = 1_000_000;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const ans = SECRET > mid ? 'higher' : SECRET < mid ? 'lower' : 'found';
    STEPS.push({ lo, hi, mid, ans });
    if (ans === 'found') break;
    if (ans === 'higher') lo = mid + 1; else hi = mid - 1;
  }
}
const DUR = [3.2, 2.2, 1.6, 0.75, 0.65, 0.55, 0.5, 0.45, 0.42, 0.4, 0.38, 0.36, 0.35, 0.35, 0.35, 0.35, 0.4, 0.5, 0.8, 1.8];
const B0 = 10.0;
const START = []; { let s = B0; for (const d of DUR) { START.push(s); s += d; } }

// ---------- timeline ----------
const T = { A: [0, 10.2], B: [9.9, 27.8], C: [27.6, 35.2], D: [35.0, 41.6], E: [41.4, 46.8], F: [46.6, 50.0] };
const CUES = [
  [0.4, 4.3, 'Someone picks a number from *1 to a million*.'],
  [4.4, 8.0, 'After each guess they only say *higher* or *lower*. How many guesses do you need?'],
  [8.1, 10.0, 'Just ~20~. Every time.'],
  [10.1, 11.7, 'Guess the ~middle~: 500,000.'],
  [11.8, 14.6, '“Higher.” So the whole *bottom half* is out.'],
  [14.7, 19.0, 'Guess the middle of what’s left. Again. And again.'],
  [19.1, 24.4, 'Every answer throws away ~half~ of what’s left.'],
  [24.6, 27.6, 'Guess 20: ~found it~.'],
  [27.8, 31.2, 'Why 20? Start at 1 and double it twenty times…'],
  [31.3, 35.0, '…and you pass a million: ~1,048,576~.'],
  [35.2, 41.3, 'A *thousand times* more numbers? Just ~10 more~ guesses.'],
  [41.5, 46.5, 'The catch: the list must be ~sorted~. Unsorted, you’re back to checking *one by one*.'],
];

// ---------- layers ----------
function background(t) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let x = 18; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 18; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
  // margin rule, like a notebook
  ctx.strokeStyle = 'rgba(226,85,59,0.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(56, 0); ctx.lineTo(56, H); ctx.stroke();
  font(800, 19); text('RECKON', 80, 74, { color: C.ink, spacing: '4px' });
}

function captions(t) {
  k.captions(t, CUES, { x: W / 2, y: 830, maxW: 744, size: 44, lh: 58, family: SANS, ink: C.ink, marks: { '*': C.tomato, '~': C.teal } });
}

// ---------- the number line ----------
const BAR = { x0: 92, x1: 772, y: 390, h: 64 };
const BW = BAR.x1 - BAR.x0;

function barShell(grow = 1) {
  rrect(BAR.x0, BAR.y, BW * grow, BAR.h, 18); ctx.fillStyle = C.card; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
}
function secretCard(x, y, label, alpha, scale = 1, found = false) {
  withAlpha(alpha, () => {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    font(800, found ? 34 : 40, SERIF);
    const w = found ? ctx.measureText(label).width + 40 : 62;
    rrect(-w / 2, -64, w, 58, 14); ctx.fillStyle = found ? C.teal : C.mustard; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, -7); ctx.lineTo(9, -7); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill();
    text(label, 0, -34, { color: found ? C.card : C.ink, align: 'center', base: 'middle' });
    ctx.restore();
  });
}

function sceneA(t) {
  const grow = eout(seg(t, 0.2, 1.2));
  barShell(Math.max(grow, 0.02));
  withAlpha(seg(t, 0.9, 1.3), () => {
    ctx.save(); rrect(BAR.x0, BAR.y, BW, BAR.h, 18); ctx.clip();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
    for (let j = 1; j < 10; j++) { const x = BAR.x0 + (BW * j) / 10; ctx.beginPath(); ctx.moveTo(x, BAR.y + 18); ctx.lineTo(x, BAR.y + BAR.h - 18); ctx.stroke(); }
    ctx.restore();
    font(600, 26); text('1', BAR.x0, BAR.y + BAR.h + 40, { color: C.soft });
    text('1,000,000', BAR.x1, BAR.y + BAR.h + 40, { color: C.soft, align: 'right' });
  });
  const sx = BAR.x0 + (SECRET / 1e6) * BW;
  const pop = seg(t, 1.5, 2.0);
  secretCard(sx, BAR.y - 8 + Math.sin(t * 3) * 3, '?', pop, 0.6 + 0.4 * back(pop));

  // the quiz
  const opts = [['1,000', 4.6], ['100', 4.8], ['20', 5.0]];
  const reveal = seg(t, 8.0, 8.5);
  opts.forEach(([label, at], i) => {
    const w = 210, h = 128, gap = 27, x = (W - (3 * w + 2 * gap)) / 2 + i * (w + gap), y = 570;
    const p = eout(seg(t, at, at + 0.45));
    const right = i === 2;
    withAlpha(p * (right ? 1 : 1 - 0.6 * reveal), () => {
      ctx.save();
      const s = right ? 1 + 0.07 * back(reveal) * (1 - seg(t, 8.9, 9.4) * 0.3) : 1;
      ctx.translate(x + w / 2, y + h / 2 + (1 - p) * 30); ctx.scale(s, s);
      rrect(-w / 2, -h / 2, w, h, 20);
      ctx.fillStyle = right && reveal > 0 ? `rgba(42,140,128,${reveal})` : C.card; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = right && reveal > 0 ? C.teal : C.ink; ctx.stroke();
      font(800, 56, SERIF); text(label, 0, -8, { color: right && reveal > 0.5 ? C.card : C.ink, align: 'center', base: 'middle' });
      font(600, 20); text('guesses', 0, 38, { color: right && reveal > 0.5 ? C.card : C.soft, align: 'center', base: 'middle' });
      ctx.restore();
      if (!right && reveal > 0) {
        ctx.strokeStyle = C.tomato; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + 24, y + h / 2 + 4); ctx.lineTo(x + 24 + (w - 48) * eout(reveal), y + h / 2 - 4); ctx.stroke();
      }
    });
  });
  // tick on the right answer
  withAlpha(seg(t, 8.35, 8.6), () => {
    const cx = (W + 3 * 210 + 2 * 27) / 2 - 8, cy = 570 + 8;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fillStyle = C.mustard; ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 10, cy + 1); ctx.lineTo(cx - 3, cy + 9); ctx.lineTo(cx + 11, cy - 8); ctx.stroke();
  });
}

function sceneB(t) {
  let k = 0;
  for (let i = 0; i < STEPS.length; i++) if (t >= START[i]) k = i;
  const st = STEPS[k];
  const p = seg(t, START[k], START[k] + DUR[k]);
  const found = st.ans === 'found';
  const keepUpper = st.ans === 'higher';
  const z = found ? 0 : eio(seg(p, 0.6, 1));
  // view interval in this step's coordinates (0..1 = lo..hi)
  const v0 = found ? 0 : lerp(0, keepUpper ? 0.5 : 0, z), v1 = found ? 1 : lerp(1, keepUpper ? 1 : 0.5, z);
  const X = (u) => BAR.x0 + ((u - v0) / (v1 - v0)) * BW;

  // counters
  font(700, 19); text('GUESS', BAR.x0, 226, { color: C.soft, spacing: '3px' });
  font(800, 76, SERIF); text(String(k + 1), BAR.x0, 300, { color: C.ink });
  const left = found ? 1 : p < 0.62 ? st.hi - st.lo + 1 : STEPS[k + 1].hi - STEPS[k + 1].lo + 1;
  font(700, 19); text('NUMBERS LEFT', BAR.x1, 226, { color: C.soft, align: 'right', spacing: '3px' });
  font(800, 64, SERIF); text(fmt(left), BAR.x1, 296, { color: found ? C.teal : C.ink, align: 'right' });

  barShell(1);
  ctx.save(); rrect(BAR.x0, BAR.y, BW, BAR.h, 18); ctx.clip();
  // ticks stretch with the zoom
  ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
  for (let j = 1; j < 8; j++) { const x = X(j / 8); ctx.beginPath(); ctx.moveTo(x, BAR.y + 18); ctx.lineTo(x, BAR.y + BAR.h - 18); ctx.stroke(); }
  // the half that is thrown away
  if (!found) {
    const a = seg(p, 0.42, 0.6) * (1 - z);
    const [u0, u1] = keepUpper ? [0, 0.5] : [0.5, 1];
    ctx.fillStyle = `rgba(226,85,59,${0.55 * a})`;
    ctx.fillRect(X(u0), BAR.y, X(u1) - X(u0), BAR.h);
  } else {
    ctx.fillStyle = `rgba(42,140,128,${0.25 * seg(p, 0.3, 0.5)})`; ctx.fillRect(BAR.x0, BAR.y, BW, BAR.h);
  }
  ctx.restore();
  rrect(BAR.x0, BAR.y, BW, BAR.h, 18); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();

  // range ends
  const nxt = found ? st : STEPS[k + 1];
  const endsA = p < 0.62 ? 1 : 0;
  font(600, 26);
  withAlpha(endsA ? 1 - seg(p, 0.58, 0.62) : seg(p, 0.85, 1), () => {
    const s = endsA ? st : nxt;
    text(fmt(s.lo), BAR.x0, BAR.y + BAR.h + 40, { color: C.soft });
    text(fmt(s.hi), BAR.x1, BAR.y + BAR.h + 40, { color: C.soft, align: 'right' });
  });

  // the secret, still hidden: it is always inside the half we keep
  const us = (SECRET - st.lo + 0.5) / (st.hi - st.lo + 1);
  const foundP = found ? seg(p, 0.3, 0.5) : 0;
  secretCard(X(us), BAR.y - 8 + Math.sin(t * 3) * 3 * (1 - foundP), found && foundP > 0.5 ? fmt(SECRET) : '?', 1, 1 + 0.12 * Math.sin(Math.PI * foundP), found && foundP > 0.5);

  // the guess: a pin up into the bar from below, with its number
  const drop = eout(seg(p, 0, 0.3));
  const gone = found ? 0 : seg(p, 0.6, 0.75);
  withAlpha(drop * (1 - gone), () => {
    const x = X(0.5);
    const by = BAR.y + BAR.h + 70 + (1 - drop) * 30;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, BAR.y - 4); ctx.lineTo(x, by - 26); ctx.stroke();
    font(800, 32, SERIF);
    const label = fmt(st.mid); const w = ctx.measureText(label).width + 36;
    rrect(x - w / 2, by - 26, w, 52, 26); ctx.fillStyle = found ? C.teal : C.ink; ctx.fill();
    text(label, x, by + 1, { color: C.card, align: 'center', base: 'middle' });
    // the answer
    const ap = eout(seg(p, 0.28, 0.45));
    withAlpha(ap, () => {
      const word = found ? 'that’s it!' : st.ans === 'higher' ? 'higher  →' : '←  lower';
      font(700, 26); const aw = ctx.measureText(word).width + 34;
      const ay = by + 62 + (1 - ap) * 12;
      rrect(x - aw / 2, ay - 22, aw, 44, 22); ctx.fillStyle = found ? C.mustard : C.card; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = found ? C.mustard : C.ink; ctx.stroke();
      text(word, x, ay + 1, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
}

function sceneC(t) {
  const a = 28.4, step = 0.2;
  const n = clamp(Math.floor((t - a) / step) + 1, 0, 20);
  const value = Math.pow(2, n);
  font(700, 19); text('1 DOUBLED ' + n + (n === 1 ? ' TIME' : ' TIMES'), W / 2, 210, { color: C.soft, align: 'center', spacing: '3px' });
  font(800, value >= 100000 ? 112 : 128, SERIF); text(fmt(value), W / 2, 350, { color: n === 20 ? C.teal : C.ink, align: 'center', base: 'middle' });
  const cw = 58, gap = 10, x0 = (W - (10 * cw + 9 * gap)) / 2;
  for (let i = 0; i < 20; i++) {
    const r = Math.floor(i / 10), c = i % 10, x = x0 + c * (cw + gap), y = 470 + r * (cw + gap);
    const on = seg(t, a + i * step - 0.05, a + i * step + 0.1);
    rrect(x, y, cw, cw, 12); ctx.fillStyle = on > 0 ? `rgba(42,140,128,${0.15 + 0.85 * on})` : C.card; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = on > 0.5 ? C.teal : C.faint; ctx.stroke();
    font(700, 19); text('×2', x + cw / 2, y + cw / 2 + 1, { color: on > 0.5 ? C.card : C.faint, align: 'center', base: 'middle' });
  }
  // compare with a million
  const cp = eout(seg(t, 32.6, 33.1));
  withAlpha(cp, () => {
    const y = 670 + (1 - cp) * 16;
    font(700, 28); const label = 'more than 1,000,000  ✓'; const w = ctx.measureText(label).width + 44;
    rrect(W / 2 - w / 2, y - 26, w, 52, 26); ctx.fillStyle = C.mustard; ctx.fill();
    text(label, W / 2, y + 1, { color: C.ink, align: 'center', base: 'middle' });
  });
}

function sceneD(t) {
  const rows = [['1 to 100', 7, 35.3], ['1 to 1,000', 10, 35.8], ['1 to a million', 20, 36.3], ['1 to a billion', 30, 36.8]];
  font(700, 19); text('GUESSES YOU NEED', BAR.x0, 216, { color: C.soft, spacing: '3px' });
  const lx = BAR.x0, bx = 330, maxW = 360;
  rows.forEach(([label, v, at], i) => {
    const y = 270 + i * 100;
    const p = eout(seg(t, at, at + 0.6));
    withAlpha(seg(t, at - 0.1, at + 0.2), () => {
      font(600, 28); text(label, lx, y + 30, { color: C.ink, base: 'middle' });
      const w = Math.max(6, (maxW * v / 30) * p);
      rrect(bx, y + 8, w, 44, 12); ctx.fillStyle = i >= 2 ? C.teal : C.ink; ctx.fill();
      font(800, 34, SERIF); text(String(Math.round(v * p)), bx + w + 16, y + 31, { color: i >= 2 ? C.teal : C.ink, base: 'middle' });
    });
  });
  // the comparison between the last two rows
  const q = eout(seg(t, 38.0, 38.5));
  withAlpha(q, () => {
    ctx.strokeStyle = C.tomato; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const y1 = 270 + 2 * 100 + 30, y2 = 270 + 3 * 100 + 30, x = BAR.x0 - 18;
    ctx.beginPath(); ctx.moveTo(x + 10, y1); ctx.lineTo(x, y1); ctx.lineTo(x, y2); ctx.lineTo(x + 10, y2); ctx.stroke();
    font(700, 24);
    rrect(BAR.x0 + 40, 700, 300, 46, 23); ctx.fillStyle = C.tomato; ctx.fill();
    text('×1,000 the numbers', BAR.x0 + 190, 724, { color: C.card, align: 'center', base: 'middle' });
    rrect(BAR.x0 + 360, 700, 260, 46, 23); ctx.fillStyle = C.teal; ctx.fill();
    text('+10 guesses', BAR.x0 + 490, 724, { color: C.card, align: 'center', base: 'middle' });
  });
}

function sceneE(t) {
  const vals = [42, 7, 93, 18, 61, 3, 77, 25];
  const sorted = [...vals].sort((a, b) => a - b);
  const cw = 78, gap = 12, x0 = (W - (8 * cw + 7 * gap)) / 2, y = 420;
  const sp = eio(seg(t, 43.4, 44.8));
  font(700, 19);
  withAlpha(1 - seg(t, 43.2, 43.5), () => text('UNSORTED: CHECK ONE BY ONE', W / 2, 360, { color: C.tomato, align: 'center', spacing: '3px' }));
  withAlpha(seg(t, 44.8, 45.1), () => text('SORTED: HALVE IT', W / 2, 360, { color: C.teal, align: 'center', spacing: '3px' }));
  vals.forEach((v, i) => {
    const j = sorted.indexOf(v);
    const xa = x0 + i * (cw + gap), xb = x0 + j * (cw + gap);
    const x = lerp(xa, xb, sp), lift = Math.sin(Math.PI * sp) * (i % 2 ? 60 : -60);
    const pop = eout(seg(t, 41.6 + i * 0.08, 41.9 + i * 0.08));
    withAlpha(pop, () => {
      rrect(x, y + lift + (1 - pop) * 20, cw, 104, 14); ctx.fillStyle = C.card; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = sp >= 1 ? C.teal : C.ink; ctx.stroke();
      font(800, 38, SERIF); text(String(v), x + cw / 2, y + lift + 54 + (1 - pop) * 20, { color: C.ink, align: 'center', base: 'middle' });
    });
  });
  // a scanning finger before sorting: one by one
  const scan = seg(t, 42.3, 43.2);
  withAlpha(scan > 0 && scan < 1 ? 1 : 0, () => {
    const i = Math.floor(scan * 8);
    rrect(x0 + i * (cw + gap) - 6, y - 6, cw + 12, 116, 18); ctx.lineWidth = 4; ctx.strokeStyle = C.tomato; ctx.stroke();
  });
  // after sorting: the middle card is the first guess
  withAlpha(seg(t, 45.2, 45.5), () => {
    const i = 3; rrect(x0 + i * (cw + gap) - 6, y - 6, cw + 12, 116, 18); ctx.lineWidth = 4; ctx.strokeStyle = C.mustard; ctx.stroke();
  });
}

function sceneF(t) {
  const p = eout(seg(t, 46.8, 47.4));
  withAlpha(p, () => {
    font(800, 92, SERIF); text('Binary search', W / 2, 430 + (1 - p) * 20, { color: C.ink, align: 'center', base: 'middle' });
    ctx.fillStyle = C.mustard; rrect(W / 2 - 150, 490, 300 * eout(seg(t, 47.2, 47.8)), 10, 5); ctx.fill();
    font(600, 32); text('20 guesses for a million numbers', W / 2, 570, { color: C.soft, align: 'center', base: 'middle' });
    font(500, 22); text('Source: Wikipedia, “Binary search”', W / 2, 660, { color: C.soft, align: 'center', base: 'middle' });
  });
}

Kit.scene({
  width: W, height: H, duration: 50,
  fonts: [{ family: SERIF, file: 'Fraunces.woff2' }, { family: SANS, file: 'Inter.woff2' }],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    background(t);
    const scenes = [[sceneA, T.A, 0], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E], [sceneF, T.F, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
