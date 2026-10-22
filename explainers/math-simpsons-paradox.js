// Explainer for math-simpsons-paradox: treatment A wins for small stones and for large stones, yet B
// wins when all patients are pooled (the 1986 kidney stone study).
// Look: a clean editorial infographic on warm newsprint: ink-navy type, teal for treatment A,
// vermilion for treatment B, one dot per patient (filled = cured, ring = not cured; light = small
// stone, dark = large stone), thin rules and big serif numbers. Fraunces for numbers and titles,
// Libre Franklin for captions and labels.
//
// Scene plan (56.5 s). Captions centred at y = 838; everything important above y = 930.
//  A  0.0–5.3   Hook. 350 dots per treatment, mixed. "Which works better?"
//  B  5.3–14.3  The dots sort into small- and large-stone groups; small stones in focus: A 81/87
//               = 93%, B 234/270 = 87%. A better.
//  C 14.3–21.5  Large stones in focus: A 192/263 = 73%, B 55/80 = 69%. A better again.
//  D 21.5–30.5  The groups pool: A 273/350 = 78%, B 289/350 = 83%. B better: the winner flips.
//  E 30.2–51.2  Why: each total is a weighted average, drawn as a beam balancing the two group rates
//               with weights sized by patient count; A's balance point sits near 73% (263 large),
//               B's near 87% (270 small).
//  F 50.9–56.5  Payoff table.
//
// Facts (Wikipedia, "Simpson's paradox"): Charig et al. 1986; treatment A includes open surgical
// procedures, B closed procedures; small stones A 93% (81/87), B 87% (234/270); large stones A 73%
// (192/263), B 69% (55/80); both A 78% (273/350), B 83% (289/350); doctors tend to give large stones
// treatment A and small stones treatment B; stone size, the lurking (confounding) variable, affects
// the success rate more than the choice of treatment. Every rate below is computed from the counts.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#F4EFE4', paperDeep: '#E9E2D3', ink: '#1C2430', inkSoft: 'rgba(28,36,48,0.72)', inkDim: 'rgba(28,36,48,0.5)',
  rule: 'rgba(28,36,48,0.16)',
  A: '#0E7C7A', Alight: '#7CC7C0', B: '#D9482A', Blight: '#F2A48E',
};
const SERIF = 'Fraunces', SANS = 'Libre Franklin';

let k, ctx;
const font = (weight, size, family = SANS) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.ink, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);
const TAU = Math.PI * 2;
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the data ----------
const DATA = {
  A: { small: [81, 87], large: [192, 263] },
  B: { small: [234, 270], large: [55, 80] },
};
const rate = ([s, n]) => s / n;
const pooled = (tr) => [DATA[tr].small[0] + DATA[tr].large[0], DATA[tr].small[1] + DATA[tr].large[1]];
const P = (x) => `${Math.round(100 * x)}%`;

// one dot per patient, with three layouts: mixed, grouped by stone size, pooled
const COLS = 24, PITCH = 13, DOT = 5;
const COLX = { A: 92, B: 460 };
const LAY = { mixedY: 262, smallY: 268, largeY: 532, poolY: 300 };
const DOTS = [];
for (const tr of ['A', 'B']) {
  const list = [];
  for (const g of ['small', 'large']) {
    const [s, n] = DATA[tr][g];
    for (let i = 0; i < n; i++) list.push({ tr, g, cured: i < s });
  }
  // grouped: cured first within each group
  for (const g of ['small', 'large']) list.filter((d) => d.g === g).forEach((d, i) => { d.gi = i; });
  // pooled: cured small, cured large, uncured small, uncured large
  const pool = [...list.filter((d) => d.cured && d.g === 'small'), ...list.filter((d) => d.cured && d.g === 'large'),
    ...list.filter((d) => !d.cured && d.g === 'small'), ...list.filter((d) => !d.cured && d.g === 'large')];
  pool.forEach((d, i) => { d.pi = i; });
  // mixed: a shuffle
  const rnd = mulberry32(tr === 'A' ? 17 : 23);
  const order = list.map((d, i) => [rnd(), i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([, i], j) => { list[i].mi = j; });
  list.forEach((d) => { d.stag = rnd(); });
  DOTS.push(...list);
}
const gridXY = (tr, i, y0) => [COLX[tr] + (i % COLS) * PITCH + DOT, y0 + Math.floor(i / COLS) * PITCH + DOT];
const rowsOf = (n) => Math.ceil(n / COLS);

// ---------- timeline ----------
const T = { A: [0, 5.6], BD: [0, 30.6], E: [30.2, 51.2], F: [50.9, 56.5] };
const SORT = [5.6, 7.4], POOL = [21.8, 23.8];
const CUES = [
  [0.4, 5.2, 'Two treatments for kidney stones, 350 patients each. Which works better?'],
  [5.3, 10.3, 'First, ^small stones^. Each dot is one patient; a filled dot was cured.'],
  [10.4, 14.2, `Treatment A cures ~${P(rate(DATA.A.small))}~, B cures *${P(rate(DATA.B.small))}*. A wins.`],
  [14.3, 17.4, 'Now ^large stones^, the harder cases.'],
  [17.5, 21.4, `A cures ~${P(rate(DATA.A.large))}~, B cures *${P(rate(DATA.B.large))}*. A wins again.`],
  [21.5, 25.4, 'Now pool all 350 patients of each treatment together…'],
  [25.5, 30.0, `…and B wins, *${P(rate(pooled('B')))}* to ~${P(rate(pooled('A')))}~. The winner flips.`],
  [30.5, 35.0, 'Why? Large stones fail more often, whichever treatment is used.'],
  [35.1, 40.2, `And doctors gave A mostly to large stones: ~${DATA.A.large[1]}~ of its 350 patients.`],
  [40.3, 45.2, 'B got mostly small, easy cases, so its total is pulled up.'],
  [45.3, 51.0, 'Stone size is a hidden factor: a ^confounder^.'],
  [51.1, 56.2, 'Pool groups that differ, and a trend can reverse: ^Simpson’s paradox^.'],
];

// ---------- background ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paperDeep);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // paper grain
  const rnd = mulberry32(9);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(80,60,30,${0.015 + rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
  // fine baseline grid
  g.strokeStyle = 'rgba(28,36,48,0.035)'; g.lineWidth = 1;
  for (let y = 0; y < H; y += 26) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  // masthead rule
  g.fillStyle = C.ink; g.fillRect(64, 104, W - 128, 3);
  g.fillRect(64, 110, W - 128, 1);
}
function header() {
  font(800, 22); text('RECKON', 64, 84, { color: C.ink, spacing: '3px' });
  const rw = ctx.measureText('RECKON').width + 18;
  font(500, 22); text('MATH · STATISTICS', 64 + rw + 16, 84, { color: C.inkSoft, spacing: '2px' });
}

// ---------- the dot panels (A–D) ----------
function dotStyle(d) {
  const tone = d.g === 'small' ? (d.tr === 'A' ? C.Alight : C.Blight) : (d.tr === 'A' ? C.A : C.B);
  return tone;
}
function columnHeads(a) {
  withAlpha(a, () => {
    for (const tr of ['A', 'B']) {
      const x = COLX[tr], col = tr === 'A' ? C.A : C.B;
      font(700, 46, SERIF); text(tr, x, 176, { color: col, base: 'middle' });
      font(600, 24); text(tr === 'A' ? 'open surgery' : 'closed procedures', x + 40, 178, { color: C.inkSoft, base: 'middle' });
      ctx.fillStyle = col; ctx.fillRect(x, 204, COLS * PITCH - 2, 3);
    }
  });
}
function legend(a) {
  withAlpha(a, () => {
    font(500, 22);
    const y = 756;
    let x = 92;
    const item = (draw, s) => { draw(x + 7, y); text(s, x + 22, y + 1, { color: C.inkSoft, base: 'middle' }); x += ctx.measureText(s).width + 50; };
    item((cx, cy) => { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill(); }, 'cured');
    item((cx, cy) => { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.stroke(); }, 'not cured');
    item((cx, cy) => { ctx.fillStyle = C.Alight; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill(); ctx.fillStyle = C.Blight; ctx.beginPath(); ctx.arc(cx + 14, cy, 6, 0, TAU); ctx.fill(); x += 14; }, 'small stone');
    item((cx, cy) => { ctx.fillStyle = C.A; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill(); ctx.fillStyle = C.B; ctx.beginPath(); ctx.arc(cx + 14, cy, 6, 0, TAU); ctx.fill(); x += 14; }, 'large stone');
  });
}
function rateLabel(tr, g, y, a, win) {
  withAlpha(a, () => {
    const [s, n] = g === 'pool' ? pooled(tr) : DATA[tr][g];
    const x = COLX[tr], col = tr === 'A' ? C.A : C.B;
    font(600, g === 'pool' ? 66 : 44, SERIF); text(P(s / n), x, y, { color: col, base: 'middle' });
    const w = ctx.measureText(P(s / n)).width;
    font(600, 22); text(`${s}/${n}`, x + w + 12, y + (g === 'pool' ? 14 : 8), { color: C.inkSoft, base: 'middle' });
    if (win > 0) {
      const sc = back(clamp(win));
      ctx.save();
      if (g === 'pool') ctx.translate(x + 52, y + 58); else ctx.translate(x + COLS * PITCH - 50, y - 2);
      ctx.scale(sc, sc);
      ctx.fillStyle = col; rrect(-52, -18, 104, 36, 18); ctx.fill();
      font(700, 22); text(`${tr} better`, 0, 1, { color: C.paper, align: 'center', base: 'middle' });
      ctx.restore();
    }
  });
}
function sceneBD(t) {
  const sortP = (d) => eio(seg(t, SORT[0] + d.stag * 0.8, SORT[0] + d.stag * 0.8 + 1.0));
  const poolP = (d) => eio(seg(t, POOL[0] + d.stag * 0.8, POOL[0] + d.stag * 0.8 + 1.2));
  const fade = 1 - seg(t, 30.0, 30.6);
  columnHeads(eout(seg(t, 0.2, 0.8)) * fade);
  // focus: which group is bright
  const fSmall = 1 - 0.72 * (seg(t, 14.2, 14.8) - seg(t, 21.2, 21.7));
  const fLarge = 1 - 0.78 * (seg(t, 7.2, 7.8) - seg(t, 14.2, 14.8));
  // group titles
  withAlpha(fade * span(t, 6.6, 22.2, 0.5, 0.5), () => {
    font(800, 22); text('SMALL STONES', 92, LAY.smallY - 26, { color: C.ink, spacing: '2px', base: 'middle' });
    withAlpha(fLarge, () => text('LARGE STONES', 92, LAY.largeY - 26, { color: C.ink, spacing: '2px', base: 'middle' }));
    ctx.fillStyle = C.rule; ctx.fillRect(92 + 190, LAY.smallY - 27, W - 92 - 64 - 190, 1.5);
    withAlpha(fLarge, () => ctx.fillRect(92 + 190, LAY.largeY - 27, W - 92 - 64 - 190, 1.5));
  });
  withAlpha(fade * span(t, 23.4, 30.6, 0.5, 0.0), () => {
    font(800, 22); text('ALL PATIENTS', 92, LAY.poolY - 30, { color: C.ink, spacing: '2px', base: 'middle' });
    ctx.fillStyle = C.rule; ctx.fillRect(92 + 190, LAY.poolY - 31, W - 92 - 64 - 190, 1.5);
  });
  // dots
  withAlpha(fade, () => {
    for (const d of DOTS) {
      const appear = eout(seg(t, 0.4 + d.mi * 0.004, 0.9 + d.mi * 0.004));
      if (appear <= 0) continue;
      const [mx, my] = gridXY(d.tr, d.mi, LAY.mixedY);
      const [gx, gy] = gridXY(d.tr, d.gi, d.g === 'small' ? LAY.smallY : LAY.largeY);
      const [px, py] = gridXY(d.tr, d.pi, LAY.poolY);
      const s = sortP(d), p = poolP(d);
      let x = lerp(mx, gx, s), y = lerp(my, gy, s);
      x = lerp(x, px, p); y = lerp(y, py, p);
      const focus = d.g === 'small' ? fSmall : fLarge;
      const col = dotStyle(d);
      withAlpha(appear * focus, () => {
        if (d.cured) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, DOT, 0, TAU); ctx.fill(); }
        else { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, DOT - 1, 0, TAU); ctx.stroke(); }
      });
    }
  });
  // rates
  const smallY = LAY.smallY + rowsOf(270) * PITCH + 34, largeY = LAY.largeY + rowsOf(263) * PITCH + 34;
  const groupsOut = 1 - seg(t, 21.5, 22.0);
  for (const tr of ['A', 'B']) {
    rateLabel(tr, 'small', smallY, fade * groupsOut * seg(t, 10.4, 10.9) * lerp(1, 0.55, seg(t, 14.2, 14.8)), tr === 'A' ? seg(t, 12.2, 12.6) : 0);
    rateLabel(tr, 'large', largeY, fade * groupsOut * seg(t, 17.5, 18.0), tr === 'A' ? seg(t, 19.2, 19.6) : 0);
    rateLabel(tr, 'pool', LAY.poolY + rowsOf(350) * PITCH + 60, fade * seg(t, 25.5, 26.0), tr === 'B' ? seg(t, 27.0, 27.4) : 0);
  }
  // the flip
  withAlpha(fade * span(t, 27.4, 30.4, 0.4, 0.4), () => {
    const y = LAY.poolY + rowsOf(350) * PITCH + 160;
    font(500, 26, SERIF);
    text('A better in each group, B better in total', W / 2, y, { color: C.ink, align: 'center', base: 'middle' });
  });
  legend(fade * seg(t, 5.8, 6.6));
}

// ---------- E: weighted averages as balance beams ----------
const BEAM = { x0: 112, x1: 752, lo: 0.6, hi: 1.0 };
const BX = (r) => lerp(BEAM.x0, BEAM.x1, (r - BEAM.lo) / (BEAM.hi - BEAM.lo));
function beam(tr, y, t, tIn, tWeigh) {
  const col = tr === 'A' ? C.A : C.B, light = tr === 'A' ? C.Alight : C.Blight;
  const rs = rate(DATA[tr].small), rl = rate(DATA[tr].large);
  const ns = DATA[tr].small[1], nl = DATA[tr].large[1];
  const pr = rate(pooled(tr));
  const a = eout(seg(t, tIn, tIn + 0.6));
  withAlpha(a, () => {
    font(700, 46, SERIF); text(tr, 64, y + 116, { color: col, base: 'middle' });
    font(600, 24); text(tr === 'A' ? 'open surgery' : 'closed procedures', 104, y + 118, { color: C.inkSoft, base: 'middle' });
    // the scale
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(BEAM.x0, y + 46); ctx.lineTo(BEAM.x1, y + 46); ctx.stroke();
    font(500, 22);
    for (let r = 0.6; r <= 1.0001; r += 0.1) {
      const x = BX(r);
      ctx.beginPath(); ctx.moveTo(x, y + 46); ctx.lineTo(x, y + 54); ctx.stroke();
      text(`${Math.round(r * 100)}%`, x, y + 74, { color: C.inkDim, align: 'center', base: 'middle' });
    }
    // weights: area proportional to the number of patients
    const w = eio(seg(t, tWeigh, tWeigh + 1.4));
    const rad = (n) => Math.sqrt(n) * 2.3;
    // beam between the two group rates
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(BX(rl), y); ctx.lineTo(BX(rs), y); ctx.stroke();
    for (const [r, n, c, lab] of [[rl, nl, col, 'large'], [rs, ns, light, 'small']]) {
      const rr = lerp(rad(40), rad(n), w);
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(BX(r), y - rr, rr, 0, TAU); ctx.fill();
      font(600, 22); text(`${lab}: ${P(r)}`, BX(r), y - 2 * rr - 16, { color: C.ink, align: 'center', base: 'middle' });
      withAlpha(w, () => { font(600, 22); text(`${n}`, BX(r), y - rr + 1, { color: lab === 'large' ? C.paper : C.ink, align: 'center', base: 'middle' }); });
    }
    // the balance point slides from the middle to the weighted mean
    const mid = (rs + rl) / 2, bp = lerp(mid, pr, w);
    const px = BX(bp);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(px, y + 3); ctx.lineTo(px - 16, y + 40); ctx.lineTo(px + 16, y + 40); ctx.closePath(); ctx.fill();
    withAlpha(w, () => {
      font(700, 34, SERIF); text(P(pr), px, y + 112, { color: col, align: 'center', base: 'middle' });
      font(500, 22); text('all patients', px, y + 142, { color: C.inkSoft, align: 'center', base: 'middle' });
    });
  });
}
function sceneE(t) {
  // highlight: large stones fail more often
  withAlpha(span(t, 30.6, 35.2, 0.4, 0.4), () => {
    ctx.fillStyle = 'rgba(28,36,48,0.06)';
    rrect(BX(0.66), 180, BX(0.76) - BX(0.66), 560, 12); ctx.fill();
    rrect(BX(0.84), 180, BX(0.95) - BX(0.84), 560, 12); ctx.fill();
    font(700, 22); text('LARGE', (BX(0.66) + BX(0.76)) / 2, 172, { color: C.ink, align: 'center', base: 'middle', spacing: '2px' });
    text('SMALL', (BX(0.84) + BX(0.95)) / 2, 172, { color: C.ink, align: 'center', base: 'middle', spacing: '2px' });
  });
  beam('A', 312, t, 30.4, 35.3);
  beam('B', 600, t, 30.8, 40.4);
  withAlpha(span(t, 45.4, 51.2, 0.5, 0.3), () => {
    font(500, 24, SERIF);
    text('Each total is an average weighted by group size.', W / 2, 160, { color: C.ink, align: 'center', base: 'middle' });
  });
}

// ---------- F: payoff table ----------
function sceneF(t) {
  const rows = [['Small stones', 'small'], ['Large stones', 'large'], ['All patients', 'pool']];
  const x0 = 100, cA = 520, cB = 700, y0 = 260;
  font(700, 40, SERIF); text('Simpson’s paradox', W / 2, 184, { color: C.ink, align: 'center', base: 'middle' });
  font(700, 46, SERIF); text('A', cA, y0, { color: C.A, align: 'center', base: 'middle' }); text('B', cB, y0, { color: C.B, align: 'center', base: 'middle' });
  rows.forEach(([lab, g], i) => {
    const y = y0 + 96 + i * 104;
    withAlpha(eout(seg(t, 51.2 + i * 0.4, 51.7 + i * 0.4)), () => {
      ctx.fillStyle = C.rule; ctx.fillRect(x0, y - 52, W - 2 * x0, 1.5);
      font(i === 2 ? 800 : 600, 30); text(lab, x0, y, { color: C.ink, base: 'middle' });
      for (const tr of ['A', 'B']) {
        const r = g === 'pool' ? rate(pooled(tr)) : rate(DATA[tr][g]);
        const other = g === 'pool' ? rate(pooled(tr === 'A' ? 'B' : 'A')) : rate(DATA[tr === 'A' ? 'B' : 'A'][g]);
        const win = r > other, cx = tr === 'A' ? cA : cB, col = tr === 'A' ? C.A : C.B;
        if (win) { ctx.fillStyle = tr === 'A' ? 'rgba(14,124,122,0.14)' : 'rgba(217,72,42,0.14)'; rrect(cx - 74, y - 36, 148, 72, 12); ctx.fill(); }
        font(win ? 700 : 400, 46, SERIF); text(P(r), cx, y + 2, { color: win ? col : C.inkSoft, align: 'center', base: 'middle' });
      }
    });
  });
  withAlpha(seg(t, 52.8, 53.4), () => {
    ctx.fillStyle = C.ink; ctx.fillRect(x0, y0 + 96 + 2 * 104 + 52, W - 2 * x0, 2);
    font(500, 22); text('Source: Wikipedia, “Simpson’s paradox” (Charig et al., 1986)', W / 2, 902, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 740 };
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
  const any = CUES.some(([a, b]) => t >= a - 0.3 && t <= b + 0.3);
  withAlpha(any ? 1 : 0, () => { ctx.fillStyle = 'rgba(28,36,48,0.08)'; ctx.fillRect(64, 784, W - 128, 1.5); });
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2, y: 840, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.ink, marks: { '*': C.B, '~': C.A, '^': '#8A5A00' } });
  }
}

Kit.scene({
  width: W, height: H, duration: 56.5,
  fonts: [
    { family: SERIF, file: 'Fraunces.woff2' },
    { family: SANS, file: 'LibreFranklin.woff2', weight: '400 800' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    header();
    const scenes = [[sceneBD, T.BD, 0, 0], [sceneE, T.E], [sceneF, T.F, 0.4, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
