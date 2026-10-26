// Explainer for economics-nobel-hall-woodford: the 2026 economics prize went to Robert E. Hall and Michael
// Woodford "for microeconomic foundations of macroeconomic stabilisation". The idea shown: in their models
// households look ahead, so a central bank moves spending today through the whole path of rates people
// expect, which is why it can steer with promises (forward guidance). Look: banknote green with cream ink,
// the rate path in brass, spending in mint, a step chart of the Fed's rate. Playfair Display for titles and
// numbers, IBM Plex Sans for captions and labels.
//
// Computed here, with the same simplified model as the post's lab (prices held fixed, a neutral rate of 3%
// assumed, households that plan ahead): today's spending, in % above normal, is minus the sum over this
// quarter and the next eight of (expected rate − neutral rate)/4. A one-quarter cut of 1 point gives +0.25%;
// a promise of rates 1 point lower for two years gives +2%; if people only half believe it, +1%.
// Facts: Nobel press release and popular background (12 October 2026): the citation; households and firms
// are forward-looking; Hall (1978): consumption depends on expected future income and changes only with new
// information; Woodford's 2003 book and its three-equation New Keynesian model, now used by central banks
// and finance ministries; a lower policy rate makes saving less profitable and raises consumption today;
// expectations of future rates matter, so credibility and clear communication matter. Scientific background:
// a central bank that announces a path of future rates affects the economy today (forward guidance), used
// in the US during the near-zero rates of 2008–2015, and it needs credibility. Federal Reserve: on 16
// September 2026 the target range was raised by 1/4 point to 3.75–4% (statement: "Inflation remains
// elevated"), the first increase since July 2023 (open market history); next meeting 27–28 October 2026.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the prize; millions of households and firms add up to the economy.
//  B  9.0–23.0  Hall: spending follows expectations and moves only on news; Woodford's model.
//  C 23.0–46.0  A rate path and today's spending: cut today, cut ahead, promise; forward guidance; belief.
//  D 46.0–59.6  The Fed's rate since 2022 and the September 2026 rise; the next meeting.
//  E 59.8–64.6  What a central bank says about tomorrow is a tool for today.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#0b201b', bg2: '#123329', ink: '#f3ecda', soft: 'rgba(243,236,218,0.72)', faint: 'rgba(243,236,218,0.22)',
  brass: '#d9a441', mint: '#6fd3a8', coral: '#ff7a6b', panel: 'rgba(5,18,14,0.72)', grid: 'rgba(243,236,218,0.10)',
};
const SERIF = 'Playfair Display', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const circle = (x, y, r, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };

// ---------- the expectations model (as in the lab) ----------
const NEUTRAL = 3, AHEAD = 8; // per cent a year; quarters of promised rates after this one
/** Today's spending, % above normal: −Σ (rate − neutral)/4 over this quarter and the next AHEAD, as people expect them. */
const spending = (now, promised, belief = 1) => {
  const expected = belief * promised + (1 - belief) * NEUTRAL;
  return -((now - NEUTRAL) + AHEAD * (expected - NEUTRAL)) / 4;
};
const CASES = {
  cutNow: { now: 2, ahead: 3, belief: 1 },
  cutAll: { now: 2, ahead: 2, belief: 1 },
  promise: { now: 3, ahead: 2, belief: 1 },
  half: { now: 3, ahead: 2, belief: 0.5 },
};
for (const c of Object.values(CASES)) c.spend = spending(c.now, c.ahead, c.belief);

// ---------- the Fed's target range since 2022 (effective dates, federalreserve.gov) ----------
const FED = [
  [2020.2, 0, 0.25], [2022.21, 0.25, 0.5], [2022.34, 0.75, 1], [2022.46, 1.5, 1.75], [2022.57, 2.25, 2.5], [2022.73, 3, 3.25], [2022.84, 3.75, 4], [2022.96, 4.25, 4.5],
  [2023.09, 4.5, 4.75], [2023.22, 4.75, 5], [2023.34, 5, 5.25], [2023.57, 5.25, 5.5], [2024.72, 4.75, 5], [2024.86, 4.5, 4.75], [2024.97, 4.25, 4.5],
  [2025.71, 4, 4.25], [2025.83, 3.75, 4], [2025.95, 3.5, 3.75], [2026.71, 3.75, 4],
];

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, 'On 12 October 2026, Robert Hall and Michael Woodford won the economics Nobel.'],
  [4.8, 9.0, 'It was for building models of the economy from how households and firms decide.'],
  [9.2, 13.6, 'Hall showed that people spend according to what they *expect* to earn later.'],
  [13.8, 18.2, 'So their spending shifts only when news arrives, and news can’t be predicted.'],
  [18.4, 22.8, 'Woodford built this into a model that central banks around the world now use.'],
  [23.0, 27.4, `In it, a lower interest rate makes saving pay less, so people spend more ~now~.`],
  [27.6, 32.0, 'But people react to the rates they expect for years ahead, not just today’s.'],
  [32.2, 36.6, 'So a central bank can lift spending now just by promising lower rates later.'],
  [36.8, 41.2, 'This is *forward guidance*. The US Fed leaned on it while rates sat near zero, 2008–2015.'],
  [41.4, 45.8, 'It works only if people believe the promise. Half believed, half the effect.'],
  [46.0, 50.4, 'On 16 September 2026 the US Federal Reserve raised its rate to *3.75–4%*.'],
  [50.6, 55.0, 'It was its first rise since July 2023. The Fed said inflation remains elevated.'],
  [55.2, 59.6, 'Its next decision is due on 28 October, and what it says about later counts too.'],
  [59.8, 64.2, 'What a central bank says about tomorrow is one of its tools for today.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.bg2); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // fine guilloche lines, as on a banknote
  g.strokeStyle = 'rgba(217,164,65,0.05)'; g.lineWidth = 1;
  for (let i = 0; i < 26; i++) { g.beginPath(); for (let x = 0; x <= W; x += 6) { const y = 60 + i * 38 + Math.sin(x / 50 + i * 0.7) * 14; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(243,236,218,${r() * 0.03})`; g.fillRect(r() * W, r() * H, 1.3, 1.3); }
}

function house(x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x, y - 13 * s); ctx.lineTo(x + 14 * s, y); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 10 * s, y, 20 * s, 14 * s);
}
function factory(x, y, s, color) {
  ctx.fillStyle = color; ctx.fillRect(x - 14 * s, y - 2 * s, 28 * s, 16 * s);
  ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 2 * s); ctx.lineTo(x - 7 * s, y - 9 * s); ctx.lineTo(x - 7 * s, y - 2 * s); ctx.lineTo(x, y - 9 * s); ctx.lineTo(x, y - 2 * s); ctx.closePath(); ctx.fill();
  ctx.fillRect(x + 7 * s, y - 16 * s, 5 * s, 14 * s);
}

// ---------- scenes ----------
const CROWD = (() => { let s = 4; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 70 }, () => ({ x: 70 + r() * 724, y: 300 + r() * 380, f: r() < 0.25, d: r() })); })();
function sceneHook(t) {
  const a = 1 - seg(t, 8.8, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(span(t, 0.2, 9.2, 0.6, 0.4), () => {
      font(600, 24); text('PRIZE IN ECONOMIC SCIENCES 2026', 60, 96, { color: C.brass, base: 'middle', spacing: '2px' });
      font(700, 50, SERIF); text('Robert E. Hall', 60, 152, { base: 'middle' }); text('Michael Woodford', 60, 210, { base: 'middle' });
    });
    const gather = eio(seg(t, 5.2, 7.6));
    CROWD.forEach((p, i) => {
      const g = eout(seg(t, 0.8 + p.d * 2.4, 1.3 + p.d * 2.4));
      if (g <= 0) return;
      const tx = W / 2 + ((i % 10) - 4.5) * 34, ty = 560 + (Math.floor(i / 10) - 3) * 30;
      const x = lerp(p.x, tx, gather), y = lerp(p.y, ty, gather);
      A(g, () => (p.f ? factory(x, y, 1, C.mint) : house(x, y, 1, C.ink)));
    });
    A(seg(t, 7.2, 7.8), () => {
      ctx.strokeStyle = C.brass; ctx.lineWidth = 3; k.rrect(W / 2 - 200, 440, 400, 240, 16); ctx.stroke();
      font(700, 34, SERIF); text('the economy', W / 2, 720, { color: C.brass, align: 'center', base: 'middle' });
    });
    A(span(t, 1.6, 5.2), () => { font(600, 24); house(70, 290, 1, C.ink); text('households', 94, 290, { color: C.soft, base: 'middle' }); factory(300, 290, 1, C.mint); text('firms', 324, 290, { color: C.soft, base: 'middle' }); });
  });
}

const NEWS = [1.2, 3.1, 4.0]; // seconds into the spending line at which news arrives (illustration)
function sceneHall(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(1 - seg(t, 18.2, 18.8), () => {
      // a household thinking about its future pay
      house(170, 300, 4, C.ink);
      font(800, 30, SERIF); text('1978', 60, 104, { color: C.brass, base: 'middle' });
      A(eout(seg(t, 9.6, 10.6)), () => {
        ctx.fillStyle = C.panel; k.rrect(300, 160, 480, 150, 30); ctx.fill(); ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();
        for (const [x, y, r] of [[262, 300, 10], [240, 322, 6]]) circle(x, y, r, C.panel);
        font(600, 22); text('what I expect to earn', 330, 190, { color: C.soft, base: 'middle' });
        ['2027', '2028', '2029', '2030'].forEach((yr, i) => { ctx.fillStyle = C.brass; ctx.fillRect(340 + i * 110, 280 - (40 + i * 10), 60, 40 + i * 10); font(600, 20); text(yr, 370 + i * 110, 298, { color: C.soft, align: 'center', base: 'middle' }); });
      });
      // spending over time: flat, with steps only when news comes
      const L = 90, R = 780, base = 560, p = seg(t, 13.8, 17.8);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, base + 90); ctx.lineTo(R, base + 90); ctx.stroke();
      font(600, 22); text('spending', L, base - 90, { color: C.mint, base: 'middle' }); text('time →', R, base + 116, { color: C.soft, align: 'right', base: 'middle' });
      const level = (u) => { let v = 0; NEWS.forEach((n, i) => { if (u * 5 > n) v += [26, -18, 30][i]; }); return v; };
      ctx.strokeStyle = C.mint; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i <= 200 * p; i++) { const u = i / 200, x = lerp(L, R, u), y = base - level(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      NEWS.forEach((n) => { const u = n / 5; if (p < u) return; const x = lerp(L, R, u); ctx.fillStyle = C.ink; ctx.fillRect(x - 18, base + 54, 36, 26); ctx.fillStyle = C.bg1; ctx.fillRect(x - 12, base + 60, 24, 3); ctx.fillRect(x - 12, base + 67, 18, 3); });
      A(seg(t, 14.6, 15.2), () => { font(600, 22); text('news', lerp(L, R, NEWS[0] / 5), base + 116, { color: C.soft, align: 'center', base: 'middle' }); });
    });
    // Woodford's model: three linked equations
    A(span(t, 18.4, 23.0, 0.5, 0.3), () => {
      font(800, 30, SERIF); text('2003', 60, 104, { color: C.brass, base: 'middle' });
      const boxes = [['spending', W / 2, 260, C.mint], ['prices', W / 2 - 200, 560, C.coral], ['interest rate', W / 2 + 200, 560, C.brass]];
      ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
      for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) { ctx.beginPath(); ctx.moveTo(boxes[i][1], boxes[i][2]); ctx.lineTo(boxes[j][1], boxes[j][2]); ctx.stroke(); }
      boxes.forEach(([lab, x, y, col], i) => A(eout(seg(t, 18.6 + i * 0.4, 19.2 + i * 0.4)), () => {
        ctx.fillStyle = C.bg1; k.rrect(x - 130, y - 44, 260, 88, 16); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
        font(700, 30); text(lab, x, y, { color: col, align: 'center', base: 'middle' });
      }));
      font(600, 24); text('each built from how people and firms look ahead', W / 2, 690, { color: C.soft, align: 'center', base: 'middle' });
    });
  });
}

// the rate path and today's spending
function pathChart(t, c, belief, label) {
  const L = 110, R = 600, top = 190, bot = 620, maxR = 5;
  const X = (q) => L + (q / 12) * (R - L), Y = (r) => bot - (r / maxR) * (bot - top);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  for (let r = 0; r <= 5; r++) { ctx.beginPath(); ctx.moveTo(L, Y(r)); ctx.lineTo(R, Y(r)); ctx.stroke(); font(500, 22); text(`${r}%`, L - 14, Y(r), { color: C.soft, align: 'right', base: 'middle' }); }
  ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(L, Y(NEUTRAL)); ctx.lineTo(R, Y(NEUTRAL)); ctx.stroke(); ctx.setLineDash([]);
  font(500, 22); text('neutral', R + 8, Y(NEUTRAL), { color: C.soft, base: 'middle' });
  font(600, 22); text('now', X(0.5), bot + 30, { color: C.ink, align: 'center', base: 'middle' }); text('1 year', X(4), bot + 30, { color: C.soft, align: 'center', base: 'middle' }); text('2 years', X(8), bot + 30, { color: C.soft, align: 'center', base: 'middle' }); text('3 years', X(12), bot + 30, { color: C.soft, align: 'center', base: 'middle' });
  // the expected path: this quarter, the next eight, then back to neutral
  const exp = c.belief * c.ahead + (1 - c.belief) * NEUTRAL;
  const path = (q) => (q < 1 ? c.now : q < 1 + AHEAD ? exp : NEUTRAL);
  ctx.strokeStyle = C.brass; ctx.lineWidth = 6; ctx.beginPath();
  for (let q = 0; q <= 12; q += 0.05) { const x = X(q), y = Y(path(q)); q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  if (belief < 1) { // the promise itself, faint
    ctx.strokeStyle = 'rgba(217,164,65,0.4)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(X(1), Y(c.ahead)); ctx.lineTo(X(1 + AHEAD), Y(c.ahead)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22); text('promised', X(5), Y(c.ahead) + 26, { color: C.brass, align: 'center', base: 'middle' });
    text('believed', X(5), Y(exp) - 26, { color: C.brass, align: 'center', base: 'middle' });
  }
  font(700, 26); text('interest rate people expect', L - 40, top - 40, { color: C.brass, base: 'middle' });
  if (label) { font(700, 30, SERIF); text(label, (L + R) / 2, top + 40, { color: C.ink, align: 'center', base: 'middle' }); }
  // today's spending as a bar
  const bx = 700, bw = 90, zero = 520, scale = 60;
  ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 10, zero); ctx.lineTo(bx + bw + 10, zero); ctx.stroke();
  ctx.fillStyle = C.mint; const h = c.spend * scale; ctx.fillRect(bx, zero - Math.max(0, h), bw, Math.abs(h));
  font(800, 34, SERIF); text(`+${c.spend.toFixed(2).replace(/0$/, '')}%`, bx + bw / 2, zero - h - 30, { color: C.mint, align: 'center', base: 'middle' });
  font(600, 22); text('spending', bx + bw / 2, zero + 28, { color: C.mint, align: 'center', base: 'middle' }); text('today', bx + bw / 2, zero + 54, { color: C.mint, align: 'center', base: 'middle' });
}

function sceneGuidance(t) {
  const a = span(t, 23.0, 46.0, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    let c, belief = 1, label = null;
    if (t < 27.5) c = CASES.cutNow, label = 'cut now, for one quarter';
    else if (t < 32.1) c = CASES.cutAll, label = 'cut now and for two years';
    else if (t < 41.3) c = CASES.promise, label = t < 36.7 ? 'no cut now: a promise' : null;
    else c = CASES.half, belief = 0.5, label = null;
    // ease the bar between cases
    const prev = t < 27.5 ? { ...CASES.cutNow, spend: 0 } : t < 32.1 ? CASES.cutNow : t < 41.3 ? CASES.cutAll : CASES.promise;
    const start = t < 27.5 ? 23.4 : t < 32.1 ? 27.8 : t < 41.3 ? 32.4 : 41.6;
    const e = eio(seg(t, start, start + 1.2));
    const mix = { now: lerp(prev.now, c.now, e), ahead: lerp(prev.ahead, c.ahead, e), belief: lerp(prev.belief, c.belief, e) };
    mix.spend = spending(mix.now, mix.ahead, mix.belief);
    if (t < 27.5) { mix.now = lerp(NEUTRAL, c.now, e); mix.ahead = NEUTRAL; mix.spend = spending(mix.now, NEUTRAL, 1); }
    pathChart(t, mix, belief, label);
    A(span(t, 36.8, 41.4), () => {
      ctx.fillStyle = C.panel; k.rrect(130, 224, 500, 84, 14); ctx.fill();
      font(800, 40, SERIF); text('forward guidance', 380, 266, { color: C.brass, align: 'center', base: 'middle' });
    });
    A(span(t, 41.6, 46.0), () => {
      ctx.fillStyle = C.panel; k.rrect(130, 224, 500, 84, 14); ctx.fill();
      font(700, 32); text('believed by half: +1%', 380, 266, { color: C.mint, align: 'center', base: 'middle' });
    });
  });
}

function sceneFed(t) {
  const a = span(t, 46.0, 59.8, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    const L = 120, R = 770, top = 200, bot = 640, x0 = 2022, x1 = 2027;
    const X = (y) => L + ((y - x0) / (x1 - x0)) * (R - L), Y = (r) => bot - (r / 6) * (bot - top);
    font(700, 28); text('US Federal Reserve: target range for its key rate', 60, 120, { color: C.ink, base: 'middle' });
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let r = 0; r <= 6; r += 2) { ctx.beginPath(); ctx.moveTo(L, Y(r)); ctx.lineTo(R, Y(r)); ctx.stroke(); font(500, 22); text(`${r}%`, L - 14, Y(r), { color: C.soft, align: 'right', base: 'middle' }); }
    for (let y = 2022; y <= 2026; y++) { font(500, 22); text(`${y}`, X(y + 0.5), bot + 30, { color: C.soft, align: 'center', base: 'middle' }); }
    const shown = lerp(x0, 2026.82, eio(seg(t, 46.4, 49.4)));
    ctx.fillStyle = 'rgba(217,164,65,0.85)';
    for (let i = 0; i < FED.length; i++) {
      const from = Math.max(x0, FED[i][0]), to = Math.min(shown, i + 1 < FED.length ? FED[i + 1][0] : 2026.82);
      if (to <= from) continue;
      ctx.fillRect(X(from), Y(FED[i][2]), X(to) - X(from), Math.max(3, Y(FED[i][1]) - Y(FED[i][2])));
    }
    A(seg(t, 49.0, 49.6), () => {
      const x = X(FED[FED.length - 1][0]), y = Y(4);
      ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y + 6, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = C.coral; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 120); ctx.stroke();
      font(800, 32, SERIF); text('3.75–4%', x - 12, y - 150, { color: C.coral, align: 'right', base: 'middle' });
      font(600, 22); text('16 Sep 2026', x - 12, y - 116, { color: C.soft, align: 'right', base: 'middle' });
    });
    A(seg(t, 50.8, 51.4), () => {
      const x = X(FED[11][0]), y = Y(5.5);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x, y - 60); ctx.stroke(); ctx.setLineDash([]);
      font(600, 22); text('last rise before: July 2023', x - 10, y - 74, { color: C.ink, base: 'middle' });
    });
    A(span(t, 55.2, 59.8), () => {
      ctx.fillStyle = C.ink; k.rrect(560, 660, 170, 120, 12); ctx.fill();
      ctx.fillStyle = C.coral; k.rrect(560, 660, 170, 34, 12); ctx.fill(); ctx.fillRect(560, 680, 170, 14);
      font(600, 20); text('OCTOBER', 645, 678, { color: C.bg1, align: 'center', base: 'middle' });
      font(800, 54, SERIF); text('28', 645, 740, { color: C.bg1, align: 'center', base: 'middle' });
      font(600, 22); text('next decision', 545, 720, { color: C.soft, align: 'right', base: 'middle' });
    });
  });
}

function sceneEnd(t) {
  const a = span(t, 59.8, 64.8, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    // a speech bubble from the central bank, turning into spending now
    ctx.fillStyle = C.ink; k.rrect(140, 230, 584, 200, 40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(250, 420); ctx.lineTo(230, 500); ctx.lineTo(320, 425); ctx.closePath(); ctx.fill();
    font(700, 40, SERIF); text('“Our plan for rates…”', W / 2, 310, { color: C.bg1, align: 'center', base: 'middle' });
    font(600, 26); text('what a central bank says', W / 2, 372, { color: 'rgba(11,32,27,0.7)', align: 'center', base: 'middle' });
    const p = eout(seg(t, 60.6, 62.0));
    ctx.fillStyle = C.mint; for (let i = 0; i < 5; i++) { const h = (40 + i * 22) * p; ctx.fillRect(380 + i * 70, 700 - h, 46, h); }
    font(600, 24); text('spending today', W / 2 + 70, 730, { color: C.mint, align: 'center', base: 'middle' });
    // the bank
    ctx.fillStyle = C.brass; ctx.beginPath(); ctx.moveTo(150, 560); ctx.lineTo(240, 520); ctx.lineTo(330, 560); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) ctx.fillRect(164 + i * 44, 570, 16, 100);
    ctx.fillRect(150, 674, 180, 16);
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [SERIF, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneHall(t);
    sceneGuidance(t);
    sceneFed(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: SANS, ink: C.ink, marks: { '*': C.brass, '~': C.mint } });
  },
});
