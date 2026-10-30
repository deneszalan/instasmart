// Explainer for psychology-bad-apple-rule-breaking: on 21 October 2026 psychologists at the University of
// Amsterdam reported in Proceedings of the Royal Society B how rule-breaking spreads: people copy others'
// violations more than others' rule-following, and a few go further than what they see, which in simulations
// can tip a whole group into rule-breaking. Look: a plum-charcoal night, the experiment's row of 100 squares lit
// by a "shooting star", and a crate of 100 apples that ripen from green (following the rule) to red (breaking
// it). Rubik for labels and numbers, Source Sans 3 for captions.
//
// Facts: L. Molleman, K. Hoyer, G. A. van Kleef, C. Scholz, J. Hausfeld, "Contagion and escalation of rule
// violations", Proc. R. Soc. B 293: 20261940 (21 October 2026), doi 10.1098/rspb.2026.1940, CC BY 4.0
// (full text at Europe PMC, PMC13682926):
// - In the week before the 2024 US presidential election, 750 participants from the USA, roughly half
//   Republicans and half Democrats. An animated "shooting star" moved across a row of 100 squares; the rule was
//   to "select the square that lit up most intensely" (always near the middle); squares farther to the right
//   paid more. Choices are scaled 0 (the cue, full compliance) to 1 (the rightmost square, full rule-breaking).
// - First choices: mean 0.341; outright rule-breaking (the highest-paying square) in 22.7% of them.
// - Each participant then saw a prior participant's choice (rule-following near the cue; a minor violation
//   about a third of the way, around 0.33; or a major violation, the rightmost square), labelled Democrat or
//   Republican, and chose again; six trials. Rule-following examples: mean within-trial change -0.013. Major
//   violations: +0.148, and more when the other was from the participant's own party (interaction b = 0.074).
//   Minor violations: +0.052. In 4.4% of trials participants escalated beyond the observed violation (33
//   participants). In 58% of trials they did not change. About 22-24% consistently followed the rule and
//   18-23% consistently broke it.
// - Simulations: 100 agents with values from 0 to 1, starting from a normal distribution with mean 0 and s.d.
//   0.5, winsorized; each step a random agent observes another and updates r <- (1 - s) r + s X, with s larger
//   for more rule-violating examples; with probability e an agent escalates with s_e > 1, the other updates
//   using (s - s_e e)/(1 - e). With asymmetric influence rule-breaking rises and levels off at intermediate
//   levels; adding the measured escalation e = 0.044 tips the population into collective rule-breaking;
//   adding unconditional rule-followers and rule-breakers in the observed proportions stabilizes it at an
//   intermediate level.
// - The Guardian, "Bad apple effect" (21 October 2026): first author Dr Lucas Molleman, University of
//   Amsterdam; Prof Stephen Reicher, University of St Andrews, not involved: the experiment was abstract and
//   there was no penalty for rule-breaking, so its relevance to real-world examples remains unproven.
// Computed here: the simulations, with the paper's procedure and our own illustrative influence strengths
// (s = 0.2 towards more rule-breaking, 0.05 towards less, s_e = 2), 30,000 updates, seeded so every frame is the
// same. The experiment's distributions are drawn from its stated means, not its data.
//
// Scene plan (60 s). Important things stay above y = 780; captions are centred at y = 846.
//  A  0.0– 4.6  The news: 750 players.
//  B  4.8–18.2  The task: the shooting star, the rule, the pay; first choices.
//  C 18.4–36.6  Social information: rule-following, a major violation, a minor one, escalation.
//  D 36.8–50.4  The simulation: levels off without escalation; tips over with 4.4%.
//  E 50.6–55.0  Steady rule-followers and rule-breakers stop the slide partway.
//  F 55.2–60.0  The caveat.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg0: '#1c1424', bg1: '#0d0a12', ink: '#f6f0ea', soft: 'rgba(246,240,234,0.74)', faint: 'rgba(246,240,234,0.28)', line: 'rgba(246,240,234,0.12)',
  green: '#8bdc7c', amber: '#ffc75a', red: '#ff5f57', cue: '#7fe0ff', violet: '#c49bff', panel: 'rgba(10,6,14,0.78)', wood: '#5a3a24', wood2: '#7a5132',
};
const NUM = 'Rubik', TXT = 'Source Sans 3';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the study's numbers ----------
const STUDY = { n: 750, squares: 100, firstMean: 0.341, firstFull: 22.7, follow: -0.013, major: 0.148, minor: 0.052, minorAt: 0.33, escalate: 4.4, steadyFollow: [22, 24], steadyBreak: [18, 23] };

// ---------- the simulation (the paper's procedure, illustrative strengths) ----------
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(rnd) { return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()); }
const SIM = { n: 100, steps: 30000, sUp: 0.2, sDown: 0.05, sEsc: 2, every: 300 };
function simulate({ e = 0, follow = 0, brk = 0, seed = 3 }) {
  const rnd = mulberry(seed), n = SIM.n;
  const kind = Array.from({ length: n }, (_, i) => (i < follow * n ? 'f' : i < (follow + brk) * n ? 'b' : 'c'));
  const r = kind.map((kd) => (kd === 'f' ? 0 : kd === 'b' ? 1 : clamp(gauss(rnd) * 0.5)));
  const frames = [r.slice()], means = [r.reduce((a, b) => a + b, 0) / n];
  for (let t = 1; t <= SIM.steps; t++) {
    const a = Math.floor(rnd() * n), b = Math.floor(rnd() * n);
    if (a !== b && kind[a] === 'c') {
      const X = r[b];
      let s = SIM.sDown;
      if (X > r[a]) s = rnd() < e ? SIM.sEsc : (SIM.sUp - SIM.sEsc * e) / (1 - e);
      r[a] = clamp((1 - s) * r[a] + s * X);
    }
    if (t % SIM.every === 0) { frames.push(r.slice()); means.push(r.reduce((x, y) => x + y, 0) / n); }
  }
  return { frames, means, kind };
}
const RUNS = { plain: simulate({}), esc: simulate({ e: STUDY.escalate / 100 }), steady: simulate({ e: STUDY.escalate / 100, follow: 0.23, brk: 0.2 }) };
const endMean = (run) => run.means.at(-1);
if (!(endMean(RUNS.plain) > 0.3 && endMean(RUNS.plain) < 0.6)) throw new Error(`plain run ends at ${endMean(RUNS.plain)}`);
if (!(endMean(RUNS.esc) > 0.9)) throw new Error(`escalation run ends at ${endMean(RUNS.esc)}`);
if (!(endMean(RUNS.steady) > 0.4 && endMean(RUNS.steady) < 0.8)) throw new Error(`steady run ends at ${endMean(RUNS.steady)}`);

const CUES = [
  [0.4, 4.6, 'On 21 October 2026, University of Amsterdam psychologists reported how rule-breaking spreads.'],
  [4.8, 9.0, `Lucas Molleman’s team had ${Kit.fmt(STUDY.n)} Americans watch a ‘shooting star’ cross a row of ${STUDY.squares} squares.`],
  [9.2, 13.6, 'The rule: click the square that lit up ^most brightly^. But squares further right paid ~more~.'],
  [13.8, 18.2, `Even alone, many bent the rule: ~${Math.round(STUDY.firstFull)}%~ of first choices went straight to the best-paying square.`],
  [18.4, 22.8, 'Then each player saw one earlier player’s choice, and could change their own.'],
  [23.0, 27.4, 'Seeing someone *follow the rule* changed almost nothing.'],
  [27.6, 32.0, 'Seeing someone grab the ~top square~ pushed choices well right, more so from their own party.'],
  [32.2, 36.6, `After a small violation most copied it at most. But in ^${STUDY.escalate}%^ of cases, people went further.`],
  [36.8, 41.2, 'That is ^escalation^: overshooting what you see. Rare, but each overshoot raises the bar.'],
  [41.4, 45.8, 'The team simulated 100 people copying each other. Without escalation, rule-breaking levels off.'],
  [46.0, 50.4, `With escalation at the measured ^${STUDY.escalate}%^, the whole group slides towards ~full rule-breaking~.`],
  [50.6, 55.0, 'About a quarter of players never broke the rule. Steady people like them stop the slide partway.'],
  [55.2, 60.0, 'It was a game with no punishment. Psychologist Stephen Reicher says the real-world link is unproven.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d'), lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1); g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 3; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,220,240,${rnd() * 0.035})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
}
/** Colour for a degree of rule-breaking: green at 0, amber at 0.5, red at 1. */
function heat(v) {
  const a = [139, 220, 124], b = [255, 199, 90], c = [255, 95, 87], u = clamp(v);
  const m = u < 0.5 ? a.map((x, i) => lerp(x, b[i], u * 2)) : b.map((x, i) => lerp(x, c[i], (u - 0.5) * 2));
  return `rgb(${m.map(Math.round).join(',')})`;
}

// ---------- the row of 100 squares ----------
const ROW = { x0: 52, x1: 812, y: 360 };
const sqW = (ROW.x1 - ROW.x0) / 100, CUE = 50;
const sqX = (i) => ROW.x0 + (i + 0.5) * sqW; // centre of square i (0-based)
/** x for a normalized choice: 0 = the cue square, 1 = the rightmost square. */
const choiceX = (v) => lerp(sqX(CUE), sqX(99), v);
function row(t, glow, o = {}) {
  for (let i = 0; i < 100; i++) {
    const x = ROW.x0 + i * sqW, d = Math.abs(i - CUE), lit = glow * Math.exp(-(d * d) / 18);
    ctx.fillStyle = `rgba(127,224,255,${0.08 + lit * 0.85})`; ctx.fillRect(x + 0.8, ROW.y - 20, sqW - 1.6, 40);
  }
  if (o.pay) A(o.pay, () => {
    // pay rises to the right of the cue
    for (let i = CUE; i < 100; i++) { const hgt = 6 + ((i - CUE) / 49) * 70; ctx.fillStyle = 'rgba(255,199,90,0.55)'; ctx.fillRect(ROW.x0 + i * sqW + 1, ROW.y + 34, sqW - 2, hgt); }
    font(600, 24, TXT); text('more money →', sqX(99), ROW.y + 136, { align: 'right', color: C.amber }); font(600, 24);
    text('the rule', sqX(CUE), ROW.y + 70, { align: 'center', color: C.cue });
  });
}
function marker(x, col, lab, a = 1, up = false) {
  A(a, () => {
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.strokeRect(x - sqW / 2 - 3, ROW.y - 24, sqW + 6, 48);
    const edge = x > 740;
    font(700, 24); text(lab, edge ? x + sqW / 2 + 3 : x, up ? ROW.y - 52 : ROW.y + 58, { align: edge ? 'right' : 'center', color: col });
  });
}

// ---------- the crate of 100 apples ----------
function apple(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x - r * 0.35, y, r * 0.72, 0, 7); ctx.arc(x + r * 0.35, y, r * 0.72, 0, 7); ctx.fill();
  ctx.strokeStyle = '#4a2f1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + 2, y - r * 1.05); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.arc(x - r * 0.45, y - r * 0.25, r * 0.18, 0, 7); ctx.fill();
}
function crate(vals, x0, y0, cell, kind) {
  ctx.fillStyle = C.wood; k.rrect(x0 - 16, y0 - 22, cell * 10 + 32, cell * 10 + 34, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x0 - 6, y0 - 12, cell * 10 + 12, cell * 10 + 14);
  vals.forEach((v, i) => {
    const cx = x0 + (i % 10 + 0.5) * cell, cy = y0 + (Math.floor(i / 10) + 0.5) * cell;
    apple(cx, cy, cell * 0.38, heat(v));
    if (kind && kind[i] !== 'c') { ctx.strokeStyle = 'rgba(246,240,234,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, cell * 0.46, 0, 7); ctx.stroke(); }
  });
}
function meanChart(runs, t0, t1, t, x0, y0, w, h, labels) {
  ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
  for (const v of [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(x0, y0 + h - v * h); ctx.lineTo(x0 + w, y0 + h - v * h); ctx.stroke(); font(500, 20); text(`${Math.round(v * 100)}%`, x0 - 8, y0 + h - v * h, { align: 'right', color: C.faint }); }
  font(500, 20); text('average rule-breaking', x0, y0 - 20, { color: C.soft });
  font(500, 20, TXT); text('time →', x0 + w, y0 + h + 22, { align: 'right', color: C.faint });
  runs.forEach(([run, col, a0, a1], j) => {
    const p = seg(t, a0, a1); if (p <= 0) return;
    const m = run.means, last = Math.max(1, Math.floor(p * (m.length - 1)));
    ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= last; i++) { const x = x0 + (i / (m.length - 1)) * w, y = y0 + h - m[i] * h; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    if (labels && p >= 1) { font(700, 22); text(labels[j], x0 + w + 10, y0 + h - m.at(-1) * h, { color: col }); }
  });
}

// ---------- A: the news ----------
function sceneNews(t) {
  const a = span(t, 0, 4.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('PROCEEDINGS OF THE ROYAL SOCIETY B · 21 OCTOBER 2026', W / 2, 130, { align: 'center', color: C.soft, spacing: '2px' });
    // 750 players as small dots
    for (let i = 0; i < STUDY.n; i++) {
      const g = eout(seg(t, 0.4 + i * 0.003, 1.0 + i * 0.003)); if (g <= 0) continue;
      const cx = 92 + (i % 30) * 23.2, cy = 190 + Math.floor(i / 30) * 20;
      ctx.fillStyle = `rgba(246,240,234,${0.25 + 0.5 * g})`; ctx.beginPath(); ctx.arc(cx, cy, 6.5 * g, 0, 7); ctx.fill();
    }
    A(seg(t, 2.6, 3.1), () => { ctx.fillStyle = C.panel; k.rrect(W / 2 - 220, 696, 440, 52, 12); ctx.fill(); font(700, 28); text(`${Kit.fmt(STUDY.n)} players in the USA`, W / 2, 722, { align: 'center' }); });
  });
}

// ---------- B: the task ----------
function sceneTask(t) {
  const a = span(t, 4.6, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE TASK: A ROW OF 100 SQUARES', W / 2, 130, { align: 'center', color: C.soft, spacing: '2px' });
    // the shooting star sweeps across, brightest at the cue
    const sweep = seg(t, 5.2, 8.6), sx = lerp(ROW.x0 - 30, ROW.x1 + 30, sweep), glowAt = Math.exp(-(((sx - sqX(CUE)) / 120) ** 2));
    const glow = t < 8.8 ? glowAt * 1.2 : 0.9;
    row(t, clamp(glow), { pay: seg(t, 10.4, 11.2) });
    if (sweep > 0 && sweep < 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.4 * glowAt})`; ctx.beginPath(); ctx.arc(sx, ROW.y - 70, 9 + 6 * glowAt, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(127,224,255,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 60, ROW.y - 70); ctx.lineTo(sx, ROW.y - 70); ctx.stroke();
    }
    A(seg(t, 9.4, 9.9), () => marker(sqX(CUE), C.cue, 'brightest', 1, true));
    // first choices: a spread with a mean at a third of the way, and a pile at the far right
    A(seg(t, 14.0, 14.6), () => {
      ctx.fillStyle = C.panel; k.rrect(52, 540, 760, 220, 12); ctx.fill();
      font(600, 22); text('first choices, before seeing anyone (sketch of the spread)', 72, 566, { color: C.soft });
      const base = 730, top = 600;
      for (let i = 0; i < 46; i++) {
        const v = i / 46, h = (1 - STUDY.firstFull / 100) * Math.exp(-v * 3.2) * 110;
        ctx.fillStyle = heat(v); ctx.fillRect(choiceX(v) - 6, base - h, 9, h);
      }
      const fh = 110 * 1.15; ctx.fillStyle = C.red; ctx.fillRect(choiceX(1) - 8, base - fh, 14, fh);
      font(800, 26); text(`${STUDY.firstFull}%`, choiceX(1) - 18, base - fh * 0.55, { align: 'right', color: C.red });
      font(600, 20); text('rule', choiceX(0), base + 18, { align: 'center', color: C.cue }); text('top pay', choiceX(1), base + 18, { align: 'right', color: C.red });
      A(seg(t, 15.4, 15.9), () => {
        const mx = choiceX(STUDY.firstMean);
        ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(mx, top - 10); ctx.lineTo(mx, base); ctx.stroke(); ctx.setLineDash([]);
        font(700, 22); text(`average: ${Math.round(STUDY.firstMean * 100)}% of the way`, mx + 10, top - 4, { color: C.amber });
      });
    });
  });
}

// ---------- C: social information ----------
function sceneSocial(t) {
  const a = span(t, 18.2, 36.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THEN: ONE EARLIER PLAYER’S CHOICE', W / 2, 130, { align: 'center', color: C.soft, spacing: '2px' });
    row(t, 0.9);
    marker(sqX(CUE), C.cue, 'rule', 1, true);
    // the three kinds of example, shown on the row in turn
    const ex = t < 27.6 ? [0, C.green] : t < 32.2 ? [1, C.red] : [STUDY.minorAt, C.amber];
    A(seg(t, 18.8, 19.3), () => marker(t < 23.0 ? choiceX(0.62) : choiceX(ex[0]), t < 23.0 ? C.soft : ex[1], 'their choice', 1, false));
    // average change of the second choice, in points of the 0-100 scale
    const P = { x0: 92, x1: 772, y0: 470, zero: 330 }, unit = 22; // px per point
    A(seg(t, 23.0, 23.5), () => {
      ctx.fillStyle = C.panel; k.rrect(52, 450, 760, 310, 14); ctx.fill();
      font(600, 22); text('average change in second choices, points out of 100', 72, 478, { color: C.soft });
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.zero, 500); ctx.lineTo(P.zero, 740); ctx.stroke();
      font(500, 20, TXT); text('more rule-following ←', P.zero - 8, 728, { align: 'right', color: C.faint }); text('→ more rule-breaking', P.zero + 8, 728, { color: C.faint });
      const bars = [['they followed the rule', STUDY.follow, C.green, 23.4], ['they took the top square', STUDY.major, C.red, 28.0], ['they bent it a little', STUDY.minor, C.amber, 32.6]];
      bars.forEach(([lab, v, col, at], i) => A(seg(t, at, at + 0.4), () => {
        const y = 540 + i * 62, g = eout(seg(t, at + 0.2, at + 1.2)), w = v * 100 * unit * g;
        font(700, 22); text(lab, P.zero - 44, y, { align: 'right', color: col });
        ctx.fillStyle = col; ctx.fillRect(w < 0 ? P.zero + w : P.zero, y - 14, Math.abs(w), 28);
        font(800, 24); text(`${v > 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(1)}`, P.zero + Math.max(0, w) + 12, y, { color: col });
      }));
      A(seg(t, 29.8, 30.3), () => { font(600, 21); text('more when from their own party', P.zero + 8, 540 + 62 + 30, { color: C.soft }); });
    });
    // escalation: past what they saw
    A(seg(t, 34.2, 34.7), () => {
      const y = 296, x0 = choiceX(0.08), xm = choiceX(STUDY.minorAt), x1 = choiceX(0.66), g = eout(seg(t, 34.6, 35.8));
      ctx.strokeStyle = C.violet; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, g), y); ctx.stroke();
      ctx.fillStyle = C.violet; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, g) + 12, y); ctx.lineTo(lerp(x0, x1, g) - 4, y - 9); ctx.lineTo(lerp(x0, x1, g) - 4, y + 9); ctx.fill();
      font(700, 22); text(`${STUDY.escalate}% of the time: past what they saw`, xm + 40, y - 30, { align: 'center', color: C.violet });
    });
  });
}

// ---------- D, E: the simulation ----------
function sceneSim(t) {
  const a = span(t, 36.6, 55.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('A SIMULATED GROUP OF 100', W / 2, 130, { align: 'center', color: C.soft, spacing: '2px' });
    let run = RUNS.plain, p = 0, title = 'no escalation';
    if (t < 41.4) {
      // 36.8–41.2: escalation in pictures: a ratchet of overshoots
      const steps = [0.1, 0.25, 0.42, 0.6, 0.8, 1.0], g = seg(t, 37.0, 40.8);
      ctx.fillStyle = C.panel; k.rrect(52, 170, 760, 600, 14); ctx.fill();
      font(600, 22); text('each one sees the last and goes a little further', W / 2, 206, { align: 'center', color: C.soft });
      steps.forEach((v, i) => {
        const gi = eout(seg(g, i / steps.length, (i + 0.8) / steps.length)); if (gi <= 0) return;
        const y = 270 + i * 82;
        const bx = (u) => lerp(150, 780, u);
        ctx.fillStyle = 'rgba(246,240,234,0.07)'; ctx.fillRect(bx(0), y - 14, bx(1) - bx(0), 28);
        apple(108, y, 18, heat(v));
        ctx.fillStyle = heat(v); ctx.fillRect(bx(0), y - 10, (bx(v) - bx(0)) * gi, 20);
        if (i > 0) { ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(bx(steps[i - 1]), y - 70); ctx.lineTo(bx(steps[i - 1]), y + 12); ctx.stroke(); ctx.setLineDash([]); }
      });
      font(600, 20); text('rule', 150, 744, { align: 'center', color: C.cue }); text('top pay', 780, 744, { align: 'center', color: C.red });
      return;
    }
    if (t < 46.0) { run = RUNS.plain; p = seg(t, 41.8, 45.4); title = 'copying, no escalation'; }
    else if (t < 50.6) { run = RUNS.esc; p = seg(t, 46.4, 50.0); title = `escalation in ${STUDY.escalate}% of updates`; }
    else { run = RUNS.steady; p = seg(t, 51.0, 54.6); title = 'with steady rule-followers and rule-breakers'; }
    const fi = Math.round(p * (run.frames.length - 1));
    crate(run.frames[fi], 92, 210, 36, run === RUNS.steady ? run.kind : null);
    font(700, 26); text(title, W / 2, 178, { align: 'center', color: run === RUNS.plain ? C.amber : run === RUNS.esc ? C.red : C.green });
    const runs = [[RUNS.plain, C.amber, 41.8, 45.4]];
    if (t >= 46.0) runs.push([RUNS.esc, C.red, 46.4, 50.0]);
    if (t >= 50.6) runs.push([RUNS.steady, C.green, 51.0, 54.6]);
    meanChart(runs, 0, 0, t, 572, 250, 170, 300, ['none', `${STUDY.escalate}%`, 'steady']);
    ctx.fillStyle = C.panel; k.rrect(520, 600, 260, 160, 12); ctx.fill();
    font(600, 20); text('each apple: one person', 540, 630, { color: C.soft });
    apple(552, 670, 12, heat(0)); text('follows the rule', 576, 670, { color: C.green });
    apple(552, 710, 12, heat(1)); text('breaks it fully', 576, 710, { color: C.red });
    if (run === RUNS.steady) { font(600, 20); text('ringed: never change', 540, 744, { color: C.ink }); }
    else { font(500, 18); text('simplified model', 540, 744, { color: C.faint }); }
  });
}

// ---------- F: the caveat ----------
function sceneEnd(t) {
  const a = eout(seg(t, 55.2, 56.0));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('THE LIMITS', W / 2, 130, { align: 'center', color: C.soft, spacing: '3px' });
    const items = [['an abstract game', 'clicking squares, not real rules'], ['no punishment', 'breaking the rule cost nothing'], ['one look at one player', 'the long run is a simulation']];
    items.forEach(([h, s], i) => A(eout(seg(t, 55.6 + i * 0.5, 56.2 + i * 0.5)), () => {
      const y = 200 + i * 170;
      ctx.fillStyle = C.panel; k.rrect(92, y, 680, 140, 14); ctx.fill();
      apple(150, y + 70, 26, heat(0.15 + i * 0.3));
      font(700, 32); text(h, 200, y + 52, { color: C.ink });
      font(400, 26, TXT); text(s, 200, y + 96, { color: C.soft });
    }));
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneNews(t);
    sceneTask(t);
    sceneSocial(t);
    sceneSim(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 41, weight: 700, family: TXT, ink: C.ink, marks: { '*': C.green, '~': C.red, '^': C.violet } });
  },
});
