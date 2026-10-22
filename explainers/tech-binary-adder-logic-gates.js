// Explainer for tech-binary-adder-logic-gates: logic gates add 5 + 3 = 8 in binary.
// Look: a green circuit board under solder mask, lighter copper traces, gold pads, white silkscreen
// gate symbols; signals glow cyan (data) and amber (carries) as they flow. JetBrains Mono for bits and
// labels, Space Grotesk for captions.
//
// Scene plan (60.8 s). Captions centred at y = 836; everything important above y = 930.
//  A  0.0– 9.2  Hook. "5 + 3" becomes 0101 + 0011 under place values 8 4 2 1.
//  B  9.2–24.0  Half adder. 1 + 1 = 10. An XOR gate gives the sum, an AND gate the carry; signals flow
//               for 1 + 1, then the four input cases cycle through.
//  C 24.0–33.4  Full adder: two half adders and an OR gate, shown with one case (1 + 0 + carry 1).
//  D 33.4–50.8  Ripple-carry adder. Four full adders in a row add 0101 + 0011 column by column, right
//               to left; each carry flows into the next stage. The sum LEDs read 1000.
//  E 50.8–60.8  Payoff: 1000 is 8. The carry chain lights stage by stage: each waits for the one before.
//
// Every bit is computed below with the gate functions (xor, and, or), as the circuit does.
// Facts (Wikipedia, "Adder (electronics)"): a half adder adds two single bits, with an XOR gate for the
// sum and an AND gate for the carry; a full adder also takes a carry in, and can be built from two half
// adders and an OR gate; in a ripple-carry adder each carry ripples to the next full adder, and since
// each stage waits for the carry before it, the ripple-carry adder is relatively slow.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  pcb0: '#0F4B2C', pcb1: '#08331D', pcb2: '#03170C', trace: '#2E7A4C', traceHi: 'rgba(160,230,170,0.18)',
  pad: '#D8AA55', padDark: '#8E6A28', silk: '#EAF3E6', silkSoft: 'rgba(234,243,230,0.66)',
  cyan: '#64F3FF', amber: '#FFB547', gateFill: '#0A2B19', chip: '#16181A',
};
const MONO = 'JetBrains', SANS = 'SpaceGrotesk';

let k, ctx;
const font = (weight, size, family = MONO) => k.font(weight, size, family);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.silk, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- the logic ----------
const xor = (a, b) => a ^ b, and = (a, b) => a & b, or = (a, b) => a | b;
const halfAdd = (a, b) => ({ s: xor(a, b), c: and(a, b) });
const fullAdd = (a, b, cin) => { const h1 = halfAdd(a, b), h2 = halfAdd(h1.s, cin); return { s: h2.s, c: or(h1.c, h2.c), h1, h2 }; };
const NA = 5, NB = 3, BITS = 4;
const bitsOf = (n) => Array.from({ length: BITS }, (_, i) => (n >> i) & 1); // [bit0, bit1, …]
const A_BITS = bitsOf(NA), B_BITS = bitsOf(NB);
const STAGES = [];
{ let carry = 0; for (let i = 0; i < BITS; i++) { const r = fullAdd(A_BITS[i], B_BITS[i], carry); STAGES.push({ i, a: A_BITS[i], b: B_BITS[i], cin: carry, s: r.s, cout: r.c }); carry = r.c; } }
const SUM_BITS = STAGES.map((s) => s.s), CARRY_OUT = STAGES.at(-1).cout;
const SUM = SUM_BITS.reduce((n, b, i) => n + (b << i), 0) + (CARRY_OUT << BITS);
if (SUM !== NA + NB) throw new Error('adder is wrong');
const str = (bits) => [...bits].reverse().join('');

// ---------- timeline ----------
const CUES = [
  [0.4, 5.0, `How does a chip made of switches add *${NA} + ${NB}*?`],
  [5.1, 9.2, `Written in bits, ${NA} is *${str(A_BITS)}* and ${NB} is *${str(B_BITS)}*.`],
  [9.4, 13.9, `With bits, 1 + 1 = ${halfAdd(1, 1).c}${halfAdd(1, 1).s}: write ${halfAdd(1, 1).s}, ~carry ${halfAdd(1, 1).c}~.`],
  [14.0, 19.2, 'A *half adder* uses two gates: *XOR* for the sum, ~AND~ for the carry.'],
  [19.3, 23.9, 'XOR is on when one input is on; AND, when both are.'],
  [24.1, 29.3, 'A *full adder* also takes a ~carry in~: two half adders, one OR gate.'],
  [29.4, 33.4, 'Chain four, and each carry ripples to the next.'],
  ...STAGES.map((s, i) => {
    const t0 = [33.6, 38.1, 42.4, 46.7][i], t1 = [38.0, 42.3, 46.6, 50.8][i];
    const lead = ['Rightmost column', 'Next', 'Then', 'Last'][i];
    const sumTxt = i === 0 ? `${s.a} + ${s.b}` : `${s.a} + ${s.b} + carry`;
    const tail = i === BITS - 1 ? `= *${s.s}*. Answer: ~${str(SUM_BITS)}~.` : `= ${s.s}, ~carry ${s.cout}~.`;
    return [t0, t1, `${lead}: ${sumTxt} ${tail}`];
  }),
  [50.9, 55.4, `Binary ${str(SUM_BITS)} is *${SUM}*: gates alone worked out ${NA} + ${NB}.`],
  [55.5, 60.5, 'Each stage waits for its ~carry~, so ripple adders are slow.'],
];
const DUR = 60.8;
const c = (i) => CUES[i][0];
const T = { hook: [0, c(2) + 0.3], half: [c(2) - 0.1, c(5) - 0.1], full: [c(5) - 0.3, c(6) + 2.2], ripple: [c(6) + 1.9, DUR] };

// ---------- deterministic noise ----------
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the board, painted once ----------
let bgCanvas = null;
function paintBackground() {
  bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const g = bgCanvas.getContext('2d');
  const rad = g.createRadialGradient(W / 2, 460, 60, W / 2, 500, 800);
  rad.addColorStop(0, C.pcb0); rad.addColorStop(0.6, C.pcb1); rad.addColorStop(1, C.pcb2);
  g.fillStyle = rad; g.fillRect(0, 0, W, H);
  const rnd = mulberry32(42);
  // faint background traces running to the edges, with vias
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 26; i++) {
    const vertical = rnd() < 0.5;
    let x = rnd() * W, y = rnd() * H;
    g.strokeStyle = 'rgba(80,170,110,0.13)'; g.lineWidth = 4 + rnd() * 4;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 3; s++) {
      const len = 60 + rnd() * 200;
      if ((s % 2 === 0) === vertical) y += (rnd() < 0.5 ? -1 : 1) * len; else x += (rnd() < 0.5 ? -1 : 1) * len;
      if (s === 1) { const d = 30 + rnd() * 40; x += d; y += d * (rnd() < 0.5 ? -1 : 1); }
      g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = 'rgba(216,170,85,0.22)'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
    g.fillStyle = 'rgba(3,23,12,0.9)'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill();
  }
  // mounting holes
  for (const [x, y] of [[48, 48], [W - 48, H - 48], [48, H - 48]]) {
    g.fillStyle = 'rgba(216,170,85,0.5)'; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill();
    g.fillStyle = '#020A06'; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill();
  }
  // solder-mask sheen
  const sh = g.createLinearGradient(0, 0, W, H);
  sh.addColorStop(0, 'rgba(255,255,255,0.05)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.15)');
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 330, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- traces, pads, gates ----------
function pathLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function strokePart(pts, f) {
  const L = pathLen(pts) * f;
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  let rem = L;
  for (let i = 1; i < pts.length && rem > 0; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const u = Math.min(1, rem / l);
    ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u));
    rem -= l;
  }
  ctx.stroke();
}
/** A copper trace; with `on` (0..1) a signal glows along it, its front at fraction `front`. */
function trace(pts, t, on = 0, front = 1, color = C.cyan) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = C.trace; ctx.lineWidth = 9; strokePart(pts, 1);
  ctx.strokeStyle = C.traceHi; ctx.lineWidth = 3; strokePart(pts, 1);
  if (on > 0 && front > 0) withAlpha(on, () => {
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 16;
    ctx.strokeStyle = color; ctx.lineWidth = 5; strokePart(pts, front);
    ctx.restore();
    // bright packets flowing along the wire
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 26]); ctx.lineDashOffset = -t * 90; strokePart(pts, front); ctx.setLineDash([]);
  });
}
function pad(x, y, r = 13) {
  const pg = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
  pg.addColorStop(0, '#F6D98E'); pg.addColorStop(1, C.padDark);
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = '#031208'; ctx.beginPath(); ctx.arc(x, y, r * 0.38, 0, 7); ctx.fill();
}
function led(x, y, on, color, r = 20) {
  ctx.fillStyle = '#0B1410'; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 7); ctx.fill();
  ctx.strokeStyle = C.silkSoft; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1D2A24'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  if (on > 0) withAlpha(on, () => {
    const gl = ctx.createRadialGradient(x, y, 2, x, y, r * 3.2);
    gl.addColorStop(0, color); gl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha *= 0.55; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 7); ctx.fill();
    ctx.globalAlpha /= 0.55;
    const lg = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, r);
    lg.addColorStop(0, '#FFFFFF'); lg.addColorStop(1, color);
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  });
}
/** Gate symbols, centred at (x, y), w wide, h tall; inputs on the left, output on the right. */
function gateShape(kind, x, y, w, h) {
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  ctx.beginPath();
  if (kind === 'AND') {
    ctx.moveTo(l, tp); ctx.lineTo(x, tp); ctx.arc(x, y, h / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(l, bt); ctx.closePath();
  } else {
    const back = l + (kind === 'XOR' ? 12 : 0);
    ctx.moveTo(back, tp);
    ctx.quadraticCurveTo(x + w * 0.15, tp, r, y);
    ctx.quadraticCurveTo(x + w * 0.15, bt, back, bt);
    ctx.quadraticCurveTo(back + w * 0.22, y, back, tp);
    ctx.closePath();
  }
}
function gate(kind, x, y, w, h, glow = 0, label = kind) {
  ctx.save();
  if (glow > 0) { ctx.shadowColor = `rgba(100,243,255,${0.7 * glow})`; ctx.shadowBlur = 26 * glow; }
  gateShape(kind, x, y, w, h); ctx.fillStyle = C.gateFill; ctx.fill();
  ctx.restore();
  gateShape(kind, x, y, w, h); ctx.strokeStyle = C.silk; ctx.lineWidth = 4; ctx.stroke();
  if (kind === 'XOR') { const l = x - w / 2; ctx.beginPath(); ctx.moveTo(l, y - h / 2); ctx.quadraticCurveTo(l + w * 0.22, y, l, y + h / 2); ctx.stroke(); }
  font(700, 24); text(label, x - (kind === 'AND' ? 6 : -2), y + 1, { color: C.silk, align: 'center', base: 'middle' });
}
const inX = (kind, x, w) => x - w / 2 + (kind === 'AND' ? 0 : kind === 'XOR' ? 8 : 10);
const outX = (x, w) => x + w / 2;

// ---------- scene A: the numbers ----------
const COLS = [660, 492, 324, 156]; // x of bit 0, 1, 2, 3
const ROW_A = 350, ROW_B = 420;
function hook(t) {
  const big = span(t, 0.3, 6.0, 0.5, 0.6);
  withAlpha(big, () => {
    font(800, 150);
    text(`${NA} + ${NB}`, W / 2, 470 - eio(seg(t, 5.2, 6.0)) * 60, { color: C.silk, align: 'center', base: 'middle' });
    font(700, 48); text('= ?', W / 2, 610, { color: C.cyan, align: 'center', base: 'middle' });
  });
  bitRows(t, eout(seg(t, 5.6, 6.6)), true);
}
function bitRows(t, a, header) {
  if (a <= 0) return;
  withAlpha(a, () => {
    if (header) { font(500, 24); for (let i = 0; i < BITS; i++) text(String(1 << i), COLS[i], ROW_A - 64, { color: C.silkSoft, align: 'center', base: 'middle' }); }
    font(800, 58);
    for (let i = 0; i < BITS; i++) {
      const ai = eout(seg(t, 6.0 + i * 0.18, 6.4 + i * 0.18));
      withAlpha(ai, () => {
        text(String(A_BITS[i]), COLS[i], ROW_A, { color: A_BITS[i] ? C.cyan : C.silkSoft, align: 'center', base: 'middle' });
        text(String(B_BITS[i]), COLS[i], ROW_B, { color: B_BITS[i] ? C.cyan : C.silkSoft, align: 'center', base: 'middle' });
      });
    }
    font(600, 32);
    text(`${NA} =`, 66, ROW_A, { color: C.silk, base: 'middle' });
    text(`${NB} =`, 66, ROW_B, { color: C.silk, base: 'middle' });
  });
}

// ---------- scene B: the half adder ----------
const HA = { ax: 120, ay: 420, bx: 120, by: 600, xorX: 440, xorY: 440, andX: 440, andY: 600, gw: 150, gh: 104, outX: 720 };
const CASES = [
  { at: c(3) + 1.0, a: 1, b: 1 },
  { at: c(4) + 0.3, a: 0, b: 0 },
  { at: c(4) + 1.3, a: 0, b: 1 },
  { at: c(4) + 2.3, a: 1, b: 0 },
  { at: c(4) + 3.3, a: 1, b: 1 },
];
function halfScene(t) {
  // 1 + 1 = 10, written as a sum first
  const intro = span(t, c(2), c(3) + 0.4, 0.5, 0.5);
  withAlpha(intro, () => {
    font(800, 84);
    const r = halfAdd(1, 1);
    const lhs = '1 + 1 = ', lw = ctx.measureText(lhs).width, dw = ctx.measureText('0').width;
    const x0 = W / 2 - (lw + 2 * dw) / 2;
    text(lhs, x0, 470, { color: C.silk, base: 'middle' });
    text(String(r.c), x0 + lw, 470, { color: C.amber, base: 'middle' });
    text(String(r.s), x0 + lw + dw, 470, { color: C.cyan, base: 'middle' });
    font(600, 26);
    withAlpha(eout(seg(t, c(2) + 1.2, c(2) + 1.8)), () => {
      text('carry', x0 + lw + dw / 2, 540, { color: C.amber, align: 'center', base: 'middle' });
      text('sum', x0 + lw + dw * 1.5, 576, { color: C.cyan, align: 'center', base: 'middle' });
    });
  });
  const circ = eout(seg(t, c(3) - 0.2, c(3) + 0.6));
  if (circ <= 0) return;
  withAlpha(circ, () => {
    const g = HA, xi = inX('XOR', g.xorX, g.gw), ai = inX('AND', g.andX, g.gw);
    const wires = {
      aX: [[g.ax, g.ay], [xi, g.ay]],
      aA: [[g.ax + 90, g.ay], [g.ax + 90, g.andY - 22], [ai, g.andY - 22]],
      bX: [[g.bx, g.by + 22], [g.bx + 140, g.by + 22], [g.bx + 140, g.xorY + 22], [xi, g.xorY + 22]],
      bA: [[g.bx + 140, g.by + 22], [ai, g.by + 22]],
      s: [[outX(g.xorX, g.gw), g.xorY], [g.outX, g.xorY]],
      cy: [[outX(g.andX, g.gw), g.andY], [g.outX, g.andY]],
    };
    // base traces
    for (const w of Object.values(wires)) trace(w, t);
    // each case: inputs flow in, then the gates' outputs flow out
    let gx = 0, ga = 0, ledS = 0, ledC = 0;
    CASES.forEach((cs, i) => {
      const end = CASES[i + 1]?.at ?? T.half[1];
      const a = span(t, cs.at, end, 0.12, 0.15);
      if (a <= 0) return;
      const fin = eio(seg(t, cs.at, cs.at + 0.4));
      const r = halfAdd(cs.a, cs.b);
      const fout = eio(seg(t, cs.at + 0.45, cs.at + 0.8));
      trace(wires.aX, t, a * cs.a, fin); trace(wires.aA, t, a * cs.a, fin);
      trace(wires.bX, t, a * cs.b, fin); trace(wires.bA, t, a * cs.b, fin);
      trace(wires.s, t, a * r.s, fout); trace(wires.cy, t, a * r.c, fout, C.amber);
      gx = Math.max(gx, a * r.s * fout); ga = Math.max(ga, a * r.c * fout);
      ledS = Math.max(ledS, a * r.s * seg(t, cs.at + 0.7, cs.at + 0.85));
      ledC = Math.max(ledC, a * r.c * seg(t, cs.at + 0.7, cs.at + 0.85));
      // the case, written out under the circuit
      withAlpha(a, () => {
        font(800, 44);
        const s1 = `${cs.a} + ${cs.b} = `;
        const w1 = ctx.measureText(s1).width, w2 = ctx.measureText('00').width;
        const x0 = W / 2 - (w1 + w2) / 2;
        text(s1, x0, 724, { color: C.silk, base: 'middle' });
        withAlpha(seg(t, cs.at + 0.7, cs.at + 0.9), () => {
          text(String(r.c), x0 + w1, 724, { color: r.c ? C.amber : C.silkSoft, base: 'middle' });
          text(String(r.s), x0 + w1 + w2 / 2, 724, { color: r.s ? C.cyan : C.silkSoft, base: 'middle' });
        });
      });
      // input values by the pads
      withAlpha(a, () => {
        font(800, 40);
        text(String(cs.a), g.ax - 46, g.ay + 1, { color: cs.a ? C.cyan : C.silkSoft, align: 'center', base: 'middle' });
        text(String(cs.b), g.bx - 46, g.by + 23, { color: cs.b ? C.cyan : C.silkSoft, align: 'center', base: 'middle' });
      });
    });
    pad(g.ax, g.ay); pad(g.bx, g.by + 22);
    font(700, 24); text('A', g.ax, g.ay - 34, { align: 'center', base: 'middle' }); text('B', g.bx, g.by + 56, { align: 'center', base: 'middle' });
    gate('XOR', g.xorX, g.xorY, g.gw, g.gh, gx);
    gate('AND', g.andX, g.andY, g.gw, g.gh, ga);
    led(g.outX + 24, g.xorY, ledS, C.cyan); led(g.outX + 24, g.andY, ledC, C.amber);
    font(700, 24);
    text('SUM', g.outX + 24, g.xorY - 50, { color: C.cyan, align: 'center', base: 'middle' });
    text('CARRY', g.outX + 24, g.andY - 50, { color: C.amber, align: 'center', base: 'middle' });
    font(600, 22); text('HALF ADDER', W / 2, 330, { color: C.silkSoft, align: 'center', base: 'middle', spacing: '4px' });
  });
}

// ---------- scene C: the full adder ----------
const FULL_CASE = { a: 1, b: 0, cin: 1 };
function haBox(x, y, w, h, label, glow) {
  ctx.save();
  if (glow > 0) { ctx.shadowColor = `rgba(100,243,255,${0.6 * glow})`; ctx.shadowBlur = 22 * glow; }
  ctx.fillStyle = C.chip; rrect(x - w / 2, y - h / 2, w, h, 10); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.silk; ctx.lineWidth = 3; rrect(x - w / 2, y - h / 2, w, h, 10); ctx.stroke();
  // tiny gate icons inside
  ctx.save(); ctx.globalAlpha *= 0.8;
  gateShape('XOR', x - 4, y - h * 0.2, 46, 32); ctx.strokeStyle = C.silkSoft; ctx.lineWidth = 2; ctx.stroke();
  gateShape('AND', x - 4, y + h * 0.22, 46, 32); ctx.stroke();
  ctx.restore();
  font(700, 22); text(label, x, y - h / 2 - 20, { color: C.silkSoft, align: 'center', base: 'middle', spacing: '1px' });
}
function fullScene(t) {
  const a0 = eout(seg(t, c(5) - 0.1, c(5) + 0.7));
  if (a0 <= 0) return;
  const r = fullAdd(FULL_CASE.a, FULL_CASE.b, FULL_CASE.cin);
  const H1 = { x: 290, y: 520, w: 140, h: 150 }, H2 = { x: 520, y: 430, w: 140, h: 150 }, OR = { x: 640, y: 640, w: 120, h: 86 };
  const P = { a: [100, 480], b: [100, 560], cin: [100, 380], s: [790, 400], cout: [790, 640] };
  const wires = {
    a: [P.a, [H1.x - H1.w / 2, 480]],
    b: [P.b, [H1.x - H1.w / 2, 560]],
    cin: [P.cin, [H2.x - H2.w / 2, 400]],
    s1: [[H1.x + H1.w / 2, 480], [400, 480], [400, 460], [H2.x - H2.w / 2, 460]],
    c1: [[H1.x + H1.w / 2, 560], [380, 560], [380, 662], [inX('OR', OR.x, OR.w), 662]],
    s: [[H2.x + H2.w / 2, 400], P.s],
    c2: [[H2.x + H2.w / 2, 460], [604, 460], [604, 560], [560, 560], [560, 618], [inX('OR', OR.x, OR.w), 618]],
    cout: [[outX(OR.x, OR.w), 640], P.cout],
  };
  const run = c(5) + 1.4;
  const f = (d) => eio(seg(t, run + d, run + d + 0.5));
  withAlpha(a0, () => {
    for (const w of Object.values(wires)) trace(w, t);
    trace(wires.a, t, FULL_CASE.a, f(0)); trace(wires.b, t, FULL_CASE.b, f(0)); trace(wires.cin, t, FULL_CASE.cin, f(0), C.amber);
    trace(wires.s1, t, r.h1.s, f(0.6)); trace(wires.c1, t, r.h1.c, f(0.6), C.amber);
    trace(wires.s, t, r.h2.s, f(1.2)); trace(wires.c2, t, r.h2.c, f(1.2), C.amber);
    trace(wires.cout, t, r.c, f(1.8), C.amber);
    haBox(H1.x, H1.y, H1.w, H1.h, 'HALF ADDER', FULL_CASE.a | FULL_CASE.b ? f(0.3) : 0);
    haBox(H2.x, H2.y, H2.w, H2.h, 'HALF ADDER', f(0.9));
    gate('OR', OR.x, OR.y, OR.w, OR.h, r.c ? f(1.6) : 0);
    for (const p of Object.values(P)) pad(...p);
    font(700, 24);
    text('A', P.a[0] - 30, P.a[1] + 1, { align: 'center', base: 'middle' });
    text('B', P.b[0] - 30, P.b[1] + 1, { align: 'center', base: 'middle' });
    text('CARRY IN', P.cin[0] - 22, P.cin[1] - 34, { color: C.amber, base: 'middle' });
    text('SUM', P.s[0], P.s[1] - 34, { color: C.cyan, align: 'center', base: 'middle' });
    text('CARRY', P.cout[0], P.cout[1] - 54, { color: C.amber, align: 'center', base: 'middle' });
    text('OUT', P.cout[0], P.cout[1] - 30, { color: C.amber, align: 'center', base: 'middle' });
    // the values in this example
    withAlpha(f(0), () => {
      font(800, 32);
      text(String(FULL_CASE.a), P.a[0] + 34, P.a[1] - 22, { color: C.cyan, align: 'center', base: 'middle' });
      text(String(FULL_CASE.b), P.b[0] + 34, P.b[1] - 22, { color: C.silkSoft, align: 'center', base: 'middle' });
      text(String(FULL_CASE.cin), P.cin[0] + 34, P.cin[1] + 26, { color: C.amber, align: 'center', base: 'middle' });
    });
    withAlpha(f(1.9), () => {
      font(800, 32);
      text(String(r.s), P.s[0] - 40, P.s[1] + 28, { color: r.s ? C.cyan : C.silkSoft, align: 'center', base: 'middle' });
      text(String(r.c), P.cout[0] - 40, P.cout[1] + 28, { color: r.c ? C.amber : C.silkSoft, align: 'center', base: 'middle' });
      font(800, 40);
      text(`${FULL_CASE.a} + ${FULL_CASE.b} + ${FULL_CASE.cin} = ${r.c}${r.s}`, W / 2, 750, { color: C.silk, align: 'center', base: 'middle' });
    });
    font(600, 22); text('FULL ADDER', W / 2, 300, { color: C.silkSoft, align: 'center', base: 'middle', spacing: '4px' });
  });
}

// ---------- scene D/E: the ripple-carry adder ----------
const FA = { y: 566, w: 124, h: 112 };
const SUM_Y = 690;
const stageT = (i) => c(7 + i) + 0.3;
function rippleScene(t) {
  const a0 = eout(seg(t, c(6) + 1.9, c(6) + 2.8));
  if (a0 <= 0) return;
  withAlpha(a0, () => {
    bitRows(t, 1, true);
    // carry chain replay in the last caption: each stage lights in turn
    const replay = (i) => span(t, c(12) + 0.6 + i * 0.7, c(12) + 0.6 + i * 0.7 + 0.9, 0.15, 0.5);
    for (let i = 0; i < BITS; i++) {
      const st = STAGES[i], x = COLS[i], t0 = stageT(i);
      const inA = [[x - 28, ROW_A + 32], [x - 28, FA.y - FA.h / 2]];
      const inB = [[x + 28, ROW_B + 32], [x + 28, FA.y - FA.h / 2]];
      const out = [[x, FA.y + FA.h / 2], [x, SUM_Y - 24]];
      const carryIn = [[x + FA.w / 2 + (i === 0 ? 70 : 44), FA.y + 20], [x + FA.w / 2, FA.y + 20]];
      const fIn = eio(seg(t, t0, t0 + 0.6));
      trace(inA, t, st.a, fIn); trace(inB, t, st.b, fIn);
      // carries between stages (drawn once, by the stage they feed)
      const cStart = i === 0 ? t0 : stageT(i - 1) + 1.9;
      trace(carryIn, t, st.cin, eio(seg(t, cStart, cStart + 0.5)), C.amber);
      if (i > 0) withAlpha(replay(i - 1), () => trace(carryIn, t, 1, 1, C.amber));
      const fOut = eio(seg(t, t0 + 1.0, t0 + 1.4));
      trace(out, t, st.s, fOut);
      // the full adder box
      const busy = span(t, t0 + 0.5, t0 + 1.8, 0.2, 0.4);
      ctx.save();
      if (busy > 0) { ctx.shadowColor = `rgba(100,243,255,${0.7 * busy})`; ctx.shadowBlur = 26 * busy; }
      ctx.fillStyle = C.chip; rrect(x - FA.w / 2, FA.y - FA.h / 2, FA.w, FA.h, 10); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = busy > 0.2 ? C.cyan : C.silk; ctx.lineWidth = 3; rrect(x - FA.w / 2, FA.y - FA.h / 2, FA.w, FA.h, 10); ctx.stroke();
      font(700, 22); text('FULL', x, FA.y - 30, { color: C.silkSoft, align: 'center', base: 'middle', spacing: '2px' });
      text('ADDER', x, FA.y - 6, { color: C.silkSoft, align: 'center', base: 'middle', spacing: '2px' });
      // the column's sum, worked inside the box
      const sumA = eout(seg(t, t0 + 0.5, t0 + 0.9));
      withAlpha(sumA, () => {
        font(700, 24);
        text(`${st.a}+${st.b}+${st.cin}`, x, FA.y + 28, { color: C.silk, align: 'center', base: 'middle' });
      });
      // pins
      for (const [px, py] of [[x - 28, FA.y - FA.h / 2], [x + 28, FA.y - FA.h / 2], [x, FA.y + FA.h / 2]]) pad(px, py, 7);
      // the sum LED and its bit
      const lit = seg(t, t0 + 1.3, t0 + 1.5);
      led(x, SUM_Y, st.s * lit, C.cyan);
      withAlpha(lit, () => { font(800, 44); text(String(st.s), x, SUM_Y + 52, { color: st.s ? C.cyan : C.silkSoft, align: 'center', base: 'middle' }); });
    }
    // carry into the first stage, and out of the last
    pad(COLS[0] + FA.w / 2 + 70, FA.y + 20, 10);
    font(700, 24); text(`${STAGES[0].cin}`, COLS[0] + FA.w / 2 + 70, FA.y + 56, { color: C.silkSoft, align: 'center', base: 'middle' });
    const last = BITS - 1, xl = COLS[last] - FA.w / 2;
    const coutW = [[xl, FA.y + 20], [xl - 40, FA.y + 20]];
    const cT = stageT(last) + 1.9;
    trace(coutW, t, CARRY_OUT, eio(seg(t, cT, cT + 0.4)), C.amber);
    withAlpha(replay(BITS - 1), () => trace(coutW, t, 1, 1, C.amber));
    pad(xl - 40, FA.y + 20, 10);
    withAlpha(seg(t, cT, cT + 0.4), () => { font(700, 24); text(`${CARRY_OUT}`, xl - 40, FA.y + 56, { color: CARRY_OUT ? C.amber : C.silkSoft, align: 'center', base: 'middle' }); });
    font(600, 22); text('CARRY', COLS[0] + FA.w / 2 + 70, FA.y - 18, { color: C.amber, align: 'center', base: 'middle' });
    // the answer
    const ans = eout(seg(t, c(11) + 0.4, c(11) + 1.1));
    withAlpha(ans, () => {
      font(800, 44);
      text(`= ${SUM}`, COLS[0] + 84, SUM_Y + 52, { color: C.silk, align: 'left', base: 'middle' });
      font(500, 24); for (let i = 0; i < BITS; i++) text(String(1 << i), COLS[i] + 40, SUM_Y - 6, { color: C.silkSoft, align: 'center', base: 'middle' });
    });
  });
}

// ---------- captions ----------
const CAP = { size: 44, lh: 56, weight: 700, maxW: 760 };
const capWidth = new Map();
function balanced(s) {
  if (capWidth.has(s)) return capWidth.get(s);
  font(CAP.weight, CAP.size, SANS);
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
    k.captions(t, [cue], { x: W / 2, y: 846, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SANS, ink: C.silk, marks: { '*': C.cyan, '~': C.amber } });
  }
}

Kit.scene({
  width: W, height: H, duration: DUR,
  fonts: [
    { family: MONO, file: 'JetBrainsMono.woff2' },
    { family: SANS, file: 'SpaceGrotesk.woff2' },
  ],
  draw(t, tools) {
    k = tools; ctx = tools.ctx;
    if (!bgCanvas) paintBackground();
    ctx.drawImage(bgCanvas, 0, 0);
    font(800, 22); text('RECKON', 64, 84, { color: C.pad, spacing: '3px' });
    const rw = ctx.measureText('RECKON').width + 6 * 3;
    font(600, 22); text('TECH · LOGIC GATES', 64 + rw + 20, 84, { color: C.silkSoft, spacing: '3px' });
    withAlpha(span(t, ...T.hook, 0.4, 0.4), () => hook(t));
    withAlpha(span(t, ...T.half, 0.4, 0.4), () => halfScene(t));
    withAlpha(span(t, ...T.full, 0.4, 0.4), () => fullScene(t));
    withAlpha(span(t, ...T.ripple, 0.4, 0), () => rippleScene(t));
    captions(t);
  },
});
