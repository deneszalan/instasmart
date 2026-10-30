// Explainer for math-quasi-riemann-zero-strip: on 6 October 2026 OpenAI posted 722 manuscripts written by an
// internal AI model; one claims the "quasi-Riemann hypothesis", that the Riemann zeta function has no zeros with
// real part beyond 11/12 (or below 1/12), a narrowing of the strip in which the zeros are known to live. The scene
// explains what the zeta function's zeros have to do with primes, what Riemann guessed, what the new claim is and
// what it buys. Look: a chalkboard blue-black, chalk white, a gold critical line, red for the new bounds.
// Libre Caslon Text for the formula and headings, Jost for the captions.
//
// Facts:
// - OpenAI, "Sharing AI progress in mathematics", 6 October 2026, and the GitHub repository openai/math (README):
//   manuscripts and proof artefacts from an unnamed internal model, Apache-2.0; about 42% of top-line results
//   formalised in Lean; the write-up on the zero-free region Re(s) > 11/12 was human-edited for readability;
//   the catalogue now lists 721 manuscripts in 373 families (722 at release, three withdrawn on 7 October).
// - Quanta Magazine, 19 October 2026, "AI Proved the Quasi-Riemann Hypothesis. What Happens Now?": a 30 September
//   version (199 pages) claims all nontrivial zeros have real part between 1/8 and 7/8 and was formally verified in
//   Lean; a 5 October version (49 pages) claims between 1/12 and 11/12 and is not formally verified; experts
//   largely agree it is correct, but Peter Sarnak will not call it "a Theorem" until humans check every detail;
//   Maksym Radziwiłł: "the vast majority of consequences of RH already follow from quasi-RH"; Jared Duker
//   Lichtman: "the most significant AI-for-math achievement so far, by quite a margin".
// - Clay Mathematics Institute: the Riemann hypothesis asserts that all "non-obvious" zeros of the zeta function
//   ζ(s) = 1 + 1/2ˢ + 1/3ˢ + … are complex numbers with real part 1/2; a Millennium Prize Problem (US$1 million).
// - Textbook: Euler's product ζ(s) = ∏ (1 − p⁻ˢ)⁻¹ over primes; the nontrivial zeros lie in the strip 0 < Re(s) < 1
//   (Hadamard and de la Vallée Poussin, 1896, no zeros on the line Re(s) = 1); the first zeros have imaginary parts
//   14.13, 21.02, 25.01, 30.42, 32.94, 37.59, 40.92, 43.33, 48.01, 49.77; trillions of zeros have been computed, all
//   on the line; if no zero has real part above θ, the count of primes up to x differs from li(x) by at most about
//   x^θ times a logarithm.
// Computed here: x^θ for x = 10⁹ and θ = 1, 11/12, 7/8, 1/2 (about 1.8 × 10⁸, 7.5 × 10⁷ and 31,623), and the zeros' places.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  The news.
//  B  9.2–18.2  Zeta and the primes.
//  C 18.4–32.0  The strip, the line, the zeros, the prize.
//  D 32.2–45.8  The claim: 11/12, and the Lean-checked 7/8.
//  E 46.0–55.0  Why it matters: the error term.
//  F 55.2–60.0  Status.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#13203a', bg2: '#060b16', ink: '#f4f1e8', soft: 'rgba(244,241,232,0.72)', faint: 'rgba(244,241,232,0.24)', line: 'rgba(244,241,232,0.14)',
  chalk: '#f4f1e8', gold: '#f0c75e', red: '#ff6f6f', green: '#8fd8a8', blue: '#8ec5ff', panel: 'rgba(244,241,232,0.06)',
};
const HEAD = 'Libre Caslon Text', TXT = 'Jost';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const ZEROS = [14.13, 21.02, 25.01, 30.42, 32.94, 37.59, 40.92, 43.33, 48.01, 49.77]; // imaginary parts of the first zeros
const NEW = 11 / 12, LEAN = 7 / 8, RH = 0.5;
const X9 = 1e9;
const bound = (theta) => Math.pow(X9, theta);
const MANUSCRIPTS = 722;
const big = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} billion` : n >= 1e6 ? `${Math.round(n / 1e6)} million` : fmt(n));

const CUES = [
  [0.4, 4.6, `On 6 October 2026, OpenAI posted ${MANUSCRIPTS} maths manuscripts written by an AI model. One made headlines.`],
  [4.8, 9.0, 'It claims the *quasi-Riemann hypothesis*: a step toward the most famous unsolved problem in maths.'],
  [9.2, 13.6, 'The Riemann zeta function adds 1 + 1/2^s + 1/3^s + … Euler showed it is secretly a product over all ^primes^.'],
  [13.8, 18.2, 'So the places where zeta equals zero control how the primes are spread along the number line.'],
  [18.4, 22.8, 'The interesting zeros all lie in a strip: real part between 0 and 1. That much was proved in 1896.'],
  [23.0, 27.4, 'Riemann guessed in 1859 that every one sits exactly on the middle line, ^real part ½^.'],
  [27.6, 32.0, 'Trillions of zeros have been computed, all on the line. A proof is worth a million-dollar Clay prize.'],
  [32.2, 36.6, 'The AI’s claim is weaker: no zeros beyond ~11/12~, nor below 1/12. The strip shrinks; the line stays unproven.'],
  [36.8, 41.2, 'A 199-page version proves the looser bounds 1/8 and 7/8, and a computer checked it line by line in Lean.'],
  [41.4, 45.8, 'The 49-page 11/12 version is not machine-checked yet. Mathematicians reading it think it holds.'],
  [46.0, 50.4, 'Why care? The zero furthest from the line sets how far prime counts can stray: an error of about ^x to the theta^.'],
  [50.6, 55.0, `Up to a billion, that is about ${big(bound(NEW))} with theta = 11/12, and only about ${fmt(bound(RH))} if Riemann is right.`],
  [55.2, 60.0, 'Peter Sarnak: not a theorem until every line is checked. Yet most of Riemann’s payoff already follows.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 17; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(244,241,232,${rnd() * 0.04})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1); }
}

// ---------- the strip: real part across, imaginary part up ----------
const STRIP = { x0: 150, x1: 714, y0: 190, y1: 700 }; // x maps real part 0..1, y maps imaginary part 0..52
const sx = (re) => lerp(STRIP.x0, STRIP.x1, re), sy = (im) => lerp(STRIP.y1, STRIP.y0, im / 52);
function strip(t, { line = 0, zeros = 0, lo = 0, hi = 1, bounds = 0, boundsLean = 0 } = {}) {
  ctx.fillStyle = 'rgba(244,241,232,0.05)'; ctx.fillRect(sx(0), STRIP.y0, sx(1) - sx(0), STRIP.y1 - STRIP.y0);
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(sx(0), STRIP.y0, sx(1) - sx(0), STRIP.y1 - STRIP.y0);
  font(400, 24); text('0', sx(0), STRIP.y1 + 28, { align: 'center', color: C.soft }); text('1', sx(1), STRIP.y1 + 28, { align: 'center', color: C.soft });
  font(400, 20, TXT); text('real part', CX, STRIP.y1 + 58, { align: 'center', color: C.faint });
  ctx.save(); ctx.translate(STRIP.x0 - 40, (STRIP.y0 + STRIP.y1) / 2); ctx.rotate(-Math.PI / 2); font(400, 20, TXT); text('imaginary part', 0, 0, { align: 'center', color: C.faint }); ctx.restore();
  if (line > 0) A(line, () => {
    ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(sx(0.5), STRIP.y0); ctx.lineTo(sx(0.5), STRIP.y1); ctx.stroke(); ctx.setLineDash([]);
    font(400, 24); text('½', sx(0.5), STRIP.y1 + 28, { align: 'center', color: C.gold });
  });
  if (zeros > 0) ZEROS.forEach((im, i) => A(seg(zeros, i / ZEROS.length, i / ZEROS.length + 0.15), () => {
    ctx.fillStyle = C.chalk; ctx.beginPath(); ctx.arc(sx(0.5), sy(im), 7, 0, 7); ctx.fill();
    if (i < 3) { font(400, 18, TXT); text(`½ + ${im}i`, sx(0.5) + 16, sy(im), { color: C.soft }); }
  }));
  if (bounds > 0) A(bounds, () => {
    ctx.fillStyle = 'rgba(255,111,111,0.22)'; ctx.fillRect(sx(0), STRIP.y0, (sx(1 / 12) - sx(0)) * bounds, STRIP.y1 - STRIP.y0); ctx.fillRect(sx(1) - (sx(1) - sx(NEW)) * bounds, STRIP.y0, (sx(1) - sx(NEW)) * bounds, STRIP.y1 - STRIP.y0);
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx(NEW), STRIP.y0); ctx.lineTo(sx(NEW), STRIP.y1); ctx.moveTo(sx(1 / 12), STRIP.y0); ctx.lineTo(sx(1 / 12), STRIP.y1); ctx.stroke();
    font(400, 22); text('11/12', sx(NEW), STRIP.y0 - 16, { align: 'center', color: C.red }); text('1/12', sx(1 / 12), STRIP.y0 - 16, { align: 'center', color: C.red });
  });
  if (boundsLean > 0) A(boundsLean, () => {
    ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(sx(LEAN), STRIP.y0); ctx.lineTo(sx(LEAN), STRIP.y1); ctx.moveTo(sx(1 / 8), STRIP.y0); ctx.lineTo(sx(1 / 8), STRIP.y1); ctx.stroke(); ctx.setLineDash([]);
    font(400, 22); text('7/8', sx(LEAN), STRIP.y1 - 16, { align: 'center', color: C.green }); text('1/8', sx(1 / 8), STRIP.y1 - 16, { align: 'center', color: C.green });
  });
}

// ---------- A: the news ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(400, 24); text('OPENAI · 6 OCTOBER 2026', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    // a stack of manuscripts
    for (let i = 0; i < 12; i++) {
      const g = eout(seg(t, 0.6 + i * 0.12, 1.2 + i * 0.12));
      if (g <= 0) continue;
      const x = 200 + (i % 4) * 120, y = 220 + Math.floor(i / 4) * 110;
      A(g, () => { ctx.fillStyle = i === 5 ? C.gold : 'rgba(244,241,232,0.85)'; k.rrect(x, y, 90, 96, 4); ctx.fill(); ctx.fillStyle = 'rgba(6,11,22,0.5)'; for (let l = 0; l < 5; l++) ctx.fillRect(x + 12, y + 16 + l * 14, 66 - (l % 2) * 20, 3); });
    }
    A(eout(seg(t, 2.4, 3.2)), () => { font(400, 56); text(`${MANUSCRIPTS} manuscripts`, CX, 600, { align: 'center', color: C.ink }); font(400, 24, TXT); text('written by an unnamed internal model · posted on GitHub', CX, 650, { align: 'center', color: C.soft }); });
    A(eout(seg(t, 5.0, 5.8)), () => { font(400, 30); text('“The Quasi-Riemann Hypothesis”', CX, 716, { align: 'center', color: C.gold }); });
  });
}

// ---------- B: zeta and the primes ----------
function sceneZeta(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(400, 24); text('THE ZETA FUNCTION', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    font(400, 48); text('zeta(s) = 1 + 1/2^s + 1/3^s + 1/4^s + …', CX, 260, { align: 'center', color: C.ink });
    A(eout(seg(t, 10.4, 11.2)), () => {
      font(400, 30, TXT); text('=', CX, 340, { align: 'center', color: C.soft });
      font(400, 44); text('a product of one factor per prime', CX, 410, { align: 'center', color: C.gold });
      font(400, 26, TXT); text('2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 …', CX, 466, { align: 'center', color: C.soft });
      font(400, 22, TXT); text('Euler, 1737', CX, 504, { align: 'center', color: C.faint });
    });
    A(eout(seg(t, 14.0, 14.8)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 560, 744, 190, 12); ctx.fill();
      font(400, 26, TXT); text('where zeta is zero tells you where the primes thin out and bunch', CX, 606, { align: 'center', color: C.ink });
      // a number line with primes marked
      const x0 = 100, x1 = 764; ctx.fillStyle = C.line; ctx.fillRect(x0, 680, x1 - x0, 2);
      for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]) { const x = lerp(x0, x1, p / 50); ctx.fillStyle = C.gold; ctx.fillRect(x - 2, 664, 4, 34); }
      font(400, 18, TXT); text('1', x0, 716, { color: C.faint }); text('50', x1, 716, { align: 'right', color: C.faint });
    });
  });
}

// ---------- C: the strip ----------
function sceneStrip(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(400, 24); text('WHERE THE ZEROS LIVE', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    strip(t, { line: seg(t, 23.2, 24.0), zeros: seg(t, 24.2, 27.4) });
    A(seg(t, 19.0, 19.6) * (1 - seg(t, 22.8, 23.2)), () => { font(400, 22, TXT); text('the critical strip · proved 1896', CX, STRIP.y0 - 20, { align: 'center', color: C.soft }); });
    A(seg(t, 23.4, 24.0) * (1 - seg(t, 27.4, 27.8)), () => { font(400, 22, TXT); text('Riemann, 1859: all of them on this line', CX, STRIP.y0 - 20, { align: 'center', color: C.gold }); });
    A(seg(t, 28.0, 28.6), () => { font(400, 22, TXT); text('trillions computed, all on the line · unproven · a Millennium Prize', CX, STRIP.y0 - 20, { align: 'center', color: C.gold }); });
  });
}

// ---------- D: the claim ----------
function sceneClaim(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(400, 24); text('THE CLAIM', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    strip(t, { line: 1, zeros: 1, bounds: eio(seg(t, 32.6, 34.2)), boundsLean: seg(t, 37.0, 37.8) });
    A(seg(t, 37.2, 37.8) * (1 - seg(t, 41.2, 41.6)), () => {
      ctx.fillStyle = 'rgba(6,11,22,0.85)'; k.rrect(170, 300, 524, 110, 12); ctx.fill();
      font(400, 24, TXT); text('199 pages · bounds 1/8 and 7/8', CX, 336, { align: 'center', color: C.green });
      font(400, 22, TXT); text('formally verified in the Lean proof checker', CX, 376, { align: 'center', color: C.soft });
    });
    A(seg(t, 41.6, 42.2), () => {
      ctx.fillStyle = 'rgba(6,11,22,0.85)'; k.rrect(170, 300, 524, 110, 12); ctx.fill();
      font(400, 24, TXT); text('49 pages · bounds 1/12 and 11/12', CX, 336, { align: 'center', color: C.red });
      font(400, 22, TXT); text('not machine-checked · read by mathematicians', CX, 376, { align: 'center', color: C.soft });
    });
  });
}

// ---------- E + F: the error term ----------
function sceneError(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(400, 24); text('HOW FAR PRIME COUNTS CAN STRAY · UP TO A BILLION', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    font(400, 24, TXT); text('error of roughly x to the theta, where theta is the furthest a zero can be from 0', CX, 190, { align: 'center', color: C.ink });
    const rows = [['no result · theta = 1', 1, C.soft, 46.4], ['new claim · theta = 11/12', NEW, C.red, 47.2], ['Lean-checked · theta = 7/8', LEAN, C.green, 48.0], ['Riemann · theta = ½', RH, C.gold, 51.0]];
    const x0 = 330, x1 = 800;
    const X = (v) => lerp(x0, x1, Math.log10(v) / 9);
    rows.forEach(([lab, th, col, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const y = 260 + i * 92, v = bound(th);
      font(400, 22, TXT); text(lab, 60, y, { color: C.ink });
      ctx.fillStyle = col; k.rrect(x0, y - 16, X(v) - x0, 32, 6); ctx.fill();
      font(400, 20); text(v >= 1e6 ? big(v) : fmt(v), Math.min(X(v) + 12, 700), y - 30, { color: col });
    }));
    font(400, 18, TXT); text('log scale · 1', x0, 640, { align: 'center', color: C.faint }); text('a billion', x1, 640, { align: 'right', color: C.faint });
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 668, 744, 90, 12); ctx.fill();
      font(400, 22, TXT); text('“the vast majority of consequences of RH already follow from quasi-RH”', CX, 700, { align: 'center', color: C.ink });
      font(400, 20, TXT); text('Maksym Radziwiłł, number theorist, to Quanta Magazine · a preprint, not yet peer reviewed', CX, 734, { align: 'center', color: C.soft });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneZeta(t);
    sceneStrip(t);
    sceneClaim(t);
    sceneError(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.gold, '~': C.red, '^': C.gold } });
  },
});
