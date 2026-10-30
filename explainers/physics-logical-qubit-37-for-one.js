// Explainer for physics-logical-qubit-37-for-one: on 19 October 2026 Quantinuum announced (preprint arXiv
// 2610.24077, 16 October) a logical qubit on its 98-qubit Helios ion-trap computer that errs about 5 times in a
// million rounds, made from 37 physical qubits in a distance-7 colour code; each step up in code distance divided
// the error by about 12. The scene explains why a qubit can't just be copied, how parity checks catch errors without
// reading the data, and what "below threshold" means. Look: a near-black violet, ion-teal and magenta glows, a
// triangular code patch. Azeret Mono for numbers and headings, IBM Plex Sans for the captions.
//
// Facts:
// - arXiv 2610.24077 (16 October 2026), Lavasani et al., "Quantum error correction well below the color code
//   threshold": below-threshold operation of triangular colour codes with distances 3, 5 and 7 on Helios; logical
//   error rates as low as 5 (+4/−2) × 10⁻⁶ per round; error suppression Λ = 12 (+3/−2) per increase in distance;
//   a logical two-qubit Clifford gate at distance 5 with error 7 (+3/−3) × 10⁻⁵ and Λ = 9 (+8/−3); neural-network
//   decoders able to decode in real time about ten times faster than syndrome extraction.
// - Science News, 20 October 2026: Helios uses 98 qubits (ions held over a chip); one logical qubit from 37
//   physical qubits; about 5 errors per million operations; Λ about 10 versus about 2 in Google's 2024
//   demonstration; a megaquop machine (a million quantum operations) could need roughly 50 to 100 logical qubits;
//   Quantinuum is in Broomfield, Colorado. Trade reports (Bits&Chips, eWeek, 19–20 October): per-round error
//   5.5 × 10⁻⁴ at distance 3, 3.8 × 10⁻⁵ at distance 5, 5 × 10⁻⁶ at distance 7, over 20 rounds; the headline number is a
//   logical memory benchmark decoded offline; the distance-7 gate experiment was not run.
// - A code of distance d corrects up to (d − 1) / 2 errors; a triangular colour code of distance d has (3d² + 1) / 4
//   data qubits: 7, 19, 37 (textbook).
// Computed here: the data-qubit counts from d, the error ladder on a log scale, the ratios between the measured
// rates (14.5 and 7.6, average about 10, the paper's fit gives 12), and the repetition-code illustration.
//
// Scene plan (60 s). Captions are centred at y = 846; everything important stays above y = 770.
//  A  0.0– 9.0  The result and the machine.
//  B  9.2–18.2  A fragile qubit; no cloning.
//  C 18.4–32.0  Spread it out; parity checks; distance.
//  D 32.2–45.8  The ladder 7 → 19 → 37 qubits, errors falling by about 12 per step; below threshold.
//  E 46.0–55.0  Google's 2 versus 12; what a machine needs.
//  F 55.2–60.0  Caveats.
const W = 864, H = 1080;
const { clamp, seg, lerp, span, fmt } = Kit;
const { inOut: eio, out: eout } = Kit.ease;

const C = {
  bg1: '#15102a', bg2: '#06040d', ink: '#f2eefc', soft: 'rgba(242,238,252,0.72)', faint: 'rgba(242,238,252,0.24)', line: 'rgba(242,238,252,0.14)',
  teal: '#5ef2d2', magenta: '#ff6bd6', amber: '#ffc46b', red: '#ff5c5c', panel: 'rgba(255,255,255,0.06)',
  c1: '#ff6bd6', c2: '#5ef2d2', c3: '#ffc46b',
};
const HEAD = 'Azeret Mono', TXT = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = HEAD) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);
const CX = W / 2;

// ---------- the numbers ----------
const QUBITS = (d) => (3 * d * d + 1) / 4; // 7, 19, 37
const CORRECTS = (d) => (d - 1) / 2;
const RATES = { 3: 5.5e-4, 5: 3.8e-5, 7: 5e-6 }; // logical error per round
const LAMBDA = 12, LAMBDA_GOOGLE = 2, HELIOS = 98;
const STEP35 = RATES[3] / RATES[5], STEP57 = RATES[5] / RATES[7]; // 14.5 and 7.6
const PER_MILLION = Math.round(RATES[7] * 1e6); // 5

const CUES = [
  [0.4, 4.6, `On 19 October 2026, Quantinuum reported a quantum bit that errs only ^${PER_MILLION} times in a million^ steps.`],
  [4.8, 9.0, `It was built from *${QUBITS(7)} ordinary qubits* on Helios, the firm’s ion-trap computer in Colorado, which holds ${HELIOS}.`],
  [9.2, 13.6, 'A qubit is fragile. Its state is a direction on a sphere, and any stray field nudges it off course.'],
  [13.8, 18.2, 'You can’t just keep copies: a qubit ~can’t be cloned~, and measuring it to check destroys the state.'],
  [18.4, 22.8, 'The trick: spread one logical qubit across many physical ones, in a pattern called a ^colour code^.'],
  [23.0, 27.4, 'Then measure only ^parities^: do these neighbours agree? That reveals where an error struck, not the data.'],
  [27.6, 32.0, `Flip the culprit back, and repeat, round after round. A code of distance 7 corrects any ${CORRECTS(7)} errors.`],
  [32.2, 36.6, `Distance 3 used ${QUBITS(3)} qubits: ~5.5 errors~ in 10,000 rounds. Distance 5, ${QUBITS(5)} qubits: ~3.8 in 100,000~.`],
  [36.8, 41.2, `Distance 7, ${QUBITS(7)} qubits: ~${PER_MILLION} in a million~. Each step up divides the error by about ^${LAMBDA}^.`],
  [41.4, 45.8, 'That is the sign of being ^below threshold^: the qubits are good enough that adding more of them helps.'],
  [46.0, 50.4, `In 2024, Google’s step divided the error by about ${LAMBDA_GOOGLE}. Bigger steps mean far fewer qubits per logical one.`],
  [50.6, 55.0, 'A machine for a million-step algorithm would need dozens of such logical qubits, not one.'],
  [55.2, 60.0, 'Caveats: this was a memory test, decoded afterwards; the logical gates still err about 7 times in 100,000.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(242,238,252,0.04)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

/** A triangular patch of n dots (a schematic code patch), centred at (cx, cy); returns the dot positions. */
function patch(n, cx, cy, s, draw = true, hot = -1, dim = 1) {
  const pts = [];
  let row = 0;
  while (pts.length < n) { const count = row + 1; for (let i = 0; i < count && pts.length < n; i++) pts.push([cx + (i - row / 2) * s, cy + row * s * 0.87]); row++; }
  const rows = row, offY = -((rows - 1) * s * 0.87) / 2;
  const out = pts.map(([x, y]) => [x, y + offY]);
  if (draw) out.forEach(([x, y], i) => {
    ctx.fillStyle = i === hot ? C.red : [C.c1, C.c2, C.c3][i % 3];
    A(dim, () => { ctx.beginPath(); ctx.arc(x, y, s * 0.22, 0, 7); ctx.fill(); });
  });
  return out;
}

// ---------- A: the result ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.0, 9.4);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { font(600, 22); text('QUANTINUUM · HELIOS · 19 OCTOBER 2026', CX, 136, { align: 'center', color: C.soft, spacing: '3px' }); });
    A(eout(seg(t, 0.8, 1.6)), () => {
      font(700, 92); text(`${PER_MILLION}`, CX, 250, { align: 'center', color: C.teal });
      font(500, 28, TXT); text('errors in a million rounds, for one logical qubit', CX, 318, { align: 'center', color: C.ink });
    });
    const g = eout(seg(t, 5.0, 7.0));
    A(seg(t, 4.8, 5.4), () => {
      patch(QUBITS(7), CX, 520, 44, true, -1, g);
      font(600, 26); text(`${QUBITS(7)} physical qubits → 1 logical qubit`, CX, 700, { align: 'center', color: C.amber });
      font(500, 22, TXT); text(`ions held over a chip · ${HELIOS} qubits on the machine`, CX, 740, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: a fragile qubit, no cloning ----------
function sceneFragile(t) {
  const a = span(t, 9.2, 18.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 22); text('ONE QUBIT', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    // Bloch sphere
    const sx = 300, sy = 430, r = 150;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.3, 0, 0, 7); ctx.stroke();
    const wob = 0.35 * Math.sin((t - 9.2) * 2.2) * seg(t, 10.4, 11.4);
    const ang = -Math.PI / 2 + 0.5 + wob;
    ctx.strokeStyle = C.teal; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + r * Math.cos(ang), sy + r * Math.sin(ang)); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(sx + r * Math.cos(ang), sy + r * Math.sin(ang), 9, 0, 7); ctx.fill();
    font(500, 22, TXT); text('state 0', sx, sy - r - 22, { align: 'center', color: C.soft }); text('state 1', sx, sy + r + 24, { align: 'center', color: C.soft });
    A(seg(t, 10.6, 11.2), () => { font(500, 22, TXT); text('noise nudges it', sx + r + 20, sy - 60, { color: C.red }); });
    // the no-cloning panel
    A(seg(t, 14.0, 14.6), () => {
      ctx.fillStyle = C.panel; k.rrect(500, 290, 304, 300, 14); ctx.fill();
      font(600, 22); text('copy it?', 652, 330, { align: 'center', color: C.ink });
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(570 + i * 82, 420, 30, 0, 7); ctx.stroke(); }
      ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(540, 370); ctx.lineTo(764, 470); ctx.moveTo(764, 370); ctx.lineTo(540, 470); ctx.stroke();
      font(500, 22, TXT); text('no cloning', 652, 520, { align: 'center', color: C.red });
      font(500, 20, TXT); text('measuring collapses the state', 652, 556, { align: 'center', color: C.soft });
    });
  });
}

// ---------- C: the code ----------
function sceneCode(t) {
  const a = span(t, 18.4, 32.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 22); text('A COLOUR CODE · DISTANCE 7 · SCHEMATIC', CX, 136, { align: 'center', color: C.soft, spacing: '2px' });
    const hot = t > 24.0 && t < 30.4 ? 17 : -1;
    const pts = patch(QUBITS(7), CX, 440, 56, true, hot);
    // parity checks: triangles between neighbours light up
    A(seg(t, 23.2, 23.8) * (1 - seg(t, 31.6, 32.0)), () => {
      const tri = [[16, 17, 24], [10, 11, 17], [17, 18, 25]];
      tri.forEach((ids, i) => {
        const g = seg(t, 23.4 + i * 0.4, 24.0 + i * 0.4);
        ctx.fillStyle = `rgba(255,92,92,${0.25 * g})`; ctx.beginPath(); ids.forEach((id, j) => (j ? ctx.lineTo(...pts[id]) : ctx.moveTo(...pts[id]))); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(242,238,252,${0.7 * g})`; ctx.lineWidth = 2; ctx.stroke();
      });
      font(500, 22, TXT); text('three checks disagree → the error sits where they meet', CX, 660, { align: 'center', color: C.ink });
    });
    A(seg(t, 28.0, 28.6), () => { font(500, 22, TXT); text(`flip it back · repeat every round · distance 7 corrects any ${CORRECTS(7)} errors`, CX, 700, { align: 'center', color: C.amber }); });
    A(seg(t, 18.8, 19.4) * (1 - seg(t, 22.8, 23.2)), () => { font(500, 22, TXT); text('the information lives in the whole pattern, not in any one dot', CX, 660, { align: 'center', color: C.soft }); });
  });
}

// ---------- D: the ladder ----------
function sceneLadder(t) {
  const a = span(t, 32.2, 46.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 22); text('LOGICAL ERROR PER ROUND', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const x0 = 230, x1 = 790, y0 = 190, y1 = 640;
    const Y = (r) => lerp(y1, y0, (Math.log10(r) - Math.log10(1e-6)) / (Math.log10(1e-3) - Math.log10(1e-6)));
    for (const r of [1e-3, 1e-4, 1e-5, 1e-6]) { ctx.fillStyle = C.line; ctx.fillRect(x0, Y(r), x1 - x0, 1); font(500, 20); text(r === 1e-3 ? '1 in 1,000' : r === 1e-4 ? '1 in 10,000' : r === 1e-5 ? '1 in 100,000' : '1 in a million', x0 - 14, Y(r), { align: 'right', color: C.faint }); }
    const cols = [[3, 32.4], [5, 34.4], [7, 37.0]];
    cols.forEach(([d, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const x = x0 + 90 + i * 190, y = Y(RATES[d]);
      ctx.fillStyle = C.panel; k.rrect(x - 70, y0 - 10, 140, y1 - y0 + 20, 10); ctx.fill();
      font(600, 18); text(`d = ${d}`, x, y0 + 8, { align: 'center', color: C.amber });
      font(600, 18); text(`${QUBITS(d)} qubits`, x, y0 + 32, { align: 'center', color: C.amber });
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
      font(600, 20); text(RATES[d] >= 1e-4 ? `${(RATES[d] * 1e4).toFixed(1)} in 10,000` : RATES[d] >= 1e-5 ? `${(RATES[d] * 1e5).toFixed(1)} in 100,000` : `${(RATES[d] * 1e6).toFixed(0)} in a million`, x, y + 32, { align: 'center', color: C.teal });
    }));
    A(seg(t, 38.0, 38.6), () => {
      ctx.strokeStyle = C.magenta; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(x0 + 90, Y(RATES[3])); ctx.lineTo(x0 + 280, Y(RATES[5])); ctx.lineTo(x0 + 470, Y(RATES[7])); ctx.stroke(); ctx.setLineDash([]);
      font(600, 22); text(`÷${STEP35.toFixed(0)}`, x0 + 185, (Y(RATES[3]) + Y(RATES[5])) / 2 - 24, { align: 'center', color: C.magenta });
      font(600, 22); text(`÷${STEP57.toFixed(0)}`, x0 + 375, (Y(RATES[5]) + Y(RATES[7])) / 2 - 24, { align: 'center', color: C.magenta });
      font(500, 20, TXT); text(`the paper’s fit: ÷${LAMBDA} per step`, CX + 60, 690, { align: 'center', color: C.magenta });
    });
    A(seg(t, 41.6, 42.2), () => { ctx.fillStyle = 'rgba(6,4,13,0.85)'; k.rrect(40, 740, 784, 36, 8); ctx.fill(); font(500, 20, TXT); text('above threshold the line would slope the other way: more qubits, more errors', CX, 758, { align: 'center', color: C.soft }); });
  });
}

// ---------- E + F ----------
function sceneMeaning(t) {
  const a = eout(seg(t, 46.0, 46.8));
  if (a <= 0) return;
  A(a, () => {
    font(600, 22); text('HOW FAST THE ERRORS FALL PER STEP', CX, 136, { align: 'center', color: C.soft, spacing: '3px' });
    const bars = [['Google, 2024', LAMBDA_GOOGLE, C.soft, 46.4], ['Quantinuum, 2026', LAMBDA, C.teal, 47.0]];
    bars.forEach(([n, v, col, at], i) => A(eout(seg(t, at, at + 0.7)), () => {
      const y = 220 + i * 90;
      font(500, 24, TXT); text(n, 70, y, { color: C.ink });
      ctx.fillStyle = col; k.rrect(320, y - 18, 440 * (v / LAMBDA), 36, 6); ctx.fill();
      font(700, 28); text(`÷${v}`, 320 + 440 * (v / LAMBDA) + 14, y, { color: col });
    }));
    A(seg(t, 48.4, 49.0), () => { font(500, 22, TXT); text('a bigger divisor per step means a target error rate needs fewer qubits', CX, 372, { align: 'center', color: C.soft }); });
    A(eout(seg(t, 50.8, 51.5)), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 420, 744, 150, 12); ctx.fill();
      font(600, 26); text('one logical qubit is not a computer', CX, 460, { align: 'center', color: C.amber });
      font(500, 22, TXT); text('a million-operation algorithm needs dozens of logical qubits, each this good,', CX, 504, { align: 'center', color: C.ink });
      font(500, 22, TXT); text('and logical gates between them, not only memory', CX, 540, { align: 'center', color: C.soft });
    });
    A(seg(t, 55.6, 56.2), () => {
      ctx.fillStyle = C.panel; k.rrect(60, 600, 744, 150, 12); ctx.fill();
      font(600, 24); text('caveats', CX, 638, { align: 'center', color: C.red });
      font(500, 22, TXT); text('a memory benchmark over 20 rounds, decoded after the fact', CX, 680, { align: 'center', color: C.soft });
      font(500, 22, TXT); text('two-qubit logical gates at distance 5: about 7 errors in 100,000 · a preprint', CX, 716, { align: 'center', color: C.soft });
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
    sceneFragile(t);
    sceneCode(t);
    sceneLadder(t);
    sceneMeaning(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 770, size: 40, weight: 600, family: TXT, ink: C.ink, marks: { '*': C.amber, '~': C.magenta, '^': C.teal } });
  },
});
