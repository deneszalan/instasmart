// Explainer for math-kaprekar-6174: any four digits, sorted and subtracted over and over, end at 6174.
// Look: retro digital hardware. A charcoal brushed-metal panel, glowing amber seven-segment digits drawn
// segment by segment (they light up and fade), a red indicator lamp, Space Mono labels and captions.
//
// Scene plan (every number below is computed in this file by running Kaprekar's routine):
//   A  0.0–7.3   Hook. The panel powers up; the input digits roll and lock on 3524.
//                "Pick any four digits, not all the same." / "Repeat one simple step. Where do you end up?"
//   B  7.3–26.3  The routine on 3524, digit by digit: copy the digits largest-first, then smallest-first,
//                subtract column by column, feed the answer back. 3524 → 3087 → 8352 → 6174 → 6174, and the
//                FIXED POINT lamp lights. "Sort the digits largest first…" / "…then smallest first, and
//                subtract." / "Feed the answer back in. Keep the zero: 0378." / "Round three: 6174." /
//                "One more round…" / "6174 gives 6174 again. Stuck for good."
//   C 26.1–34.6  Six more starting numbers run side by side; each lamp lights as it lands on 6174 (1 to 7
//                steps). "Try other numbers. They all fall into 6174." / "Some take one step, some take seven."
//   D 34.4–42.6  Every number from 1000 to 9999 whose digits are not all the same (8,991) is run; an LED bar
//                graph counts the steps each needs. Nothing needs 8+. "Now test every four-digit number whose
//                digits aren't all the same." / "Not one needs more than 7 steps."
//   E 42.4–51.0  Why: after one step only 54 different results are possible. A bank of 54 displays runs the
//                routine together and all read 6174 within 6 rounds. "Why so fast? After one step, only 54
//                answers are possible." / "Those 54 all reach 6174 within 6 more steps."
//   F 50.8–55.0  Payoff card: 6174, Kaprekar's constant; 1 step + at most 6 more = at most 7.
//                "That number is Kaprekar's constant."
// Facts: Wikipedia, "Kaprekar's routine" (the routine, leading zeros, 6174 as fixed point, "within seven
// iterations", named after D. R. Kaprekar). The 8,991 count, the step histogram and the 54 are computed here.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout } = Kit.ease;
const MONO = 'Space Mono';

const C = {
  amber: '#FFB23A', hot: '#FFD37E', ghost: 'rgba(255,176,70,0.075)', glow: 'rgba(255,150,30,0.85)',
  glass: '#0B0B0C', bezel: '#141416', label: '#A9A69D', dim: 'rgba(169,166,157,0.5)', text: '#F1E7D3',
  red: '#FF4334', redGlow: 'rgba(255,60,40,0.9)', redOff: '#3B1411', wire: 'rgba(255,178,58,0.16)',
};

let k, ctx;
const font = (weight, size) => k.font(weight, size, MONO);
const text = (s, x, y, opts = {}) => k.text(s, x, y, { color: C.label, ...opts });
const rrect = (...a) => k.rrect(...a);
const withAlpha = (a, fn) => k.alpha(a, fn);

// ---------- Kaprekar's routine ----------
const pad = (n) => String(n).padStart(4, '0');
function kap(n) {
  const s = pad(n);
  const perm = [0, 1, 2, 3].sort((a, b) => s[b] - s[a] || a - b); // input positions, largest digit first
  const desc = perm.map((i) => s[i]).join(''), asc = [...desc].reverse().join('');
  return { s, perm, desc, asc, res: pad(Number(desc) - Number(asc)) };
}
const K = (n) => Number(kap(n).res);
const chain = (n) => { const c = [pad(n)]; while (n !== 6174) { n = K(n); c.push(pad(n)); } return c; };

const ROUNDS = [];
{ let n = 3524; for (let r = 0; r < 4; r++) { const st = kap(n); ROUNDS.push(st); n = Number(st.res); } }

// Every four-digit number whose digits are not all the same, and how many steps it needs.
const ALL = [];
for (let n = 1000; n <= 9999; n++) if (new Set(pad(n)).size > 1) ALL.push(chain(n).length - 1);
const PREFIX = [new Array(9).fill(0)]; // PREFIX[i][s] = numbers among the first i needing s steps (8 = "8+")
for (const s of ALL) { const p = [...PREFIX.at(-1)]; p[Math.min(s, 8)]++; PREFIX.push(p); }
const MAXSTEPS = Math.max(...ALL);

// The possible results after one step, and how they move round by round.
const FIRST = [...new Set(Array.from({ length: 9000 }, (_, i) => 1000 + i).filter((n) => new Set(pad(n)).size > 1).map(K))].sort((a, b) => a - b);
const GRID = [FIRST.map(pad)];
while (GRID.at(-1).some((v) => v !== '6174')) GRID.push(GRID.at(-1).map((v) => pad(K(Number(v)))));
const EXTRA = GRID.length - 1; // rounds the 54 need at most

// ---------- seven-segment digits ----------
const SEGS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const ON = (ch) => 'abcdefg'.split('').map((s) => (SEGS[ch] ?? '').includes(s) ? 1 : 0);
const mix = (a, b, p) => a.map((x, i) => x + (b[i] - x) * p);
/** Segment levels while one character turns into another: shared segments stay lit, others fade. */
const morph = (from, to, p) => mix(ON(from), ON(to), clamp(p));

function segShapes(h) {
  const w = h * 0.5, th = h * 0.135, g = th * 0.17, t2 = th / 2;
  const L = t2, R = w - t2, T = t2, M = h / 2, B = h - t2;
  const hs = (y, a, b) => [[a, y], [a + t2, y - t2], [b - t2, y - t2], [b, y], [b - t2, y + t2], [a + t2, y + t2]];
  const vs = (x, a, b) => [[x, a], [x + t2, a + t2], [x + t2, b - t2], [x, b], [x - t2, b - t2], [x - t2, a + t2]];
  return { w, list: [hs(T, L + g, R - g), vs(R, T + g, M - g), vs(R, M + g, B - g), hs(B, L + g, R - g), vs(L, M + g, B - g), vs(L, T + g, M - g), hs(M, L + g, R - g)] };
}
const SHAPES = new Map();
function seg7(cx, cy, h, levels, { color = C.amber, glowColor = C.glow, ghost = C.ghost, alpha = 1 } = {}) {
  if (!SHAPES.has(h)) SHAPES.set(h, segShapes(h));
  const { w, list } = SHAPES.get(h);
  const sl = h * 0.085, x0 = cx - w / 2, y0 = cy - h / 2;
  const add = (pts) => pts.forEach(([x, y], i) => { const X = x0 + x + sl * (0.5 - y / h), Y = y0 + y; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  if (ghost) { ctx.beginPath(); for (const p of list) { add(p); ctx.closePath(); } ctx.fillStyle = ghost; ctx.fill(); }
  ctx.save();
  ctx.fillStyle = color; ctx.shadowColor = glowColor; ctx.shadowBlur = Math.max(4, h * 0.2);
  const full = list.filter((_, i) => levels[i] > 0.985);
  if (full.length) { ctx.globalAlpha = alpha; ctx.beginPath(); for (const p of full) { add(p); ctx.closePath(); } ctx.fill(); }
  list.forEach((p, i) => {
    if (levels[i] <= 0.01 || levels[i] > 0.985) return;
    ctx.globalAlpha = alpha * levels[i]; ctx.beginPath(); add(p); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
}
/** A row of characters, centred on cx, `gap` apart. levelsFn(i) gives each one's segment levels. */
function seg7Row(cx, cy, h, gap, n, levelsFn, opts) {
  for (let i = 0; i < n; i++) seg7(cx + (i - (n - 1) / 2) * gap, cy, h, levelsFn(i), typeof opts === 'function' ? opts(i) : opts);
}

// ---------- panel parts ----------
function windowBox(x, y, w, h, { r = 10, lit = 0 } = {}) {
  rrect(x - 7, y - 7, w + 14, h + 14, r + 6); ctx.fillStyle = C.bezel; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5; ctx.stroke();
  rrect(x, y, w, h, r); ctx.fillStyle = C.glass; ctx.fill();
  ctx.save(); rrect(x, y, w, h, r); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  for (let yy = y + 2; yy < y + h; yy += 4) ctx.fillRect(x, yy, w, 1);
  const g = ctx.createLinearGradient(0, y, 0, y + h * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h * 0.5);
  if (lit > 0) { ctx.fillStyle = `rgba(255,170,50,${0.06 * lit})`; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  rrect(x, y, w, h, r); ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 2; ctx.stroke();
}
function lamp(x, y, r, on) {
  ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2); ctx.fillStyle = '#121214'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5; ctx.stroke();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, on > 0 ? `rgba(255,190,170,${0.3 + 0.7 * on})` : '#5A2420'); g.addColorStop(1, on > 0 ? C.red : C.redOff);
  ctx.save();
  if (on > 0) { ctx.shadowColor = C.redGlow; ctx.shadowBlur = r * 2.2 * on; }
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = on > 0 ? g : C.redOff; ctx.fill();
  ctx.restore();
  if (on <= 0) { ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); }
}
function engraved(s, x, y, { size = 22, weight = 700, align = 'left', color = C.label, spacing = '2px' } = {}) {
  font(weight, size);
  text(s, x, y + 1, { color: 'rgba(0,0,0,0.6)', align, spacing });
  text(s, x, y, { color, align, spacing });
}

// ---------- the static panel, drawn once ----------
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let BG;
function makeBackground() {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const base = g.createLinearGradient(0, 0, 0, H); base.addColorStop(0, '#2A2B2F'); base.addColorStop(1, '#1C1D20');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  const rnd = mulberry(6174);
  for (let i = 0; i < 3200; i++) { // brushed metal: fine horizontal streaks
    const y = Math.floor(rnd() * H) + 0.5, x = rnd() * W * 1.2 - 100, len = 60 + rnd() * 520, a = 0.01 + rnd() * 0.03;
    g.strokeStyle = rnd() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.6})`;
    g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke();
  }
  const v = g.createRadialGradient(W / 2, H * 0.42, 220, W / 2, H * 0.5, 780);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  // panel seam and corner screws
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 2; g.strokeRect(14, 14, W - 28, H - 28);
  g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1; g.strokeRect(16.5, 16.5, W - 33, H - 33);
  for (const [x, y] of [[34, 34], [W - 34, 34], [34, H - 34], [W - 34, H - 34]]) {
    const sg = g.createRadialGradient(x - 3, y - 3, 1, x, y, 10); sg.addColorStop(0, '#6A6B70'); sg.addColorStop(1, '#2C2D31');
    g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fillStyle = sg; g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 5, y + 3); g.lineTo(x + 5, y - 3); g.stroke();
  }
  // speaker grille along the bottom (decoration only)
  g.fillStyle = 'rgba(0,0,0,0.42)';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) {
    const x = 120 + i * 24.8 + (row % 2) * 12.4, y = 968 + row * 22;
    g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
  }
  // caption readout glass
  g.save();
  g.beginPath(); g.roundRect(40, 756, W - 80, 160, 18); g.fillStyle = '#101012'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1.5; g.stroke();
  g.beginPath(); g.roundRect(48, 764, W - 96, 144, 12); g.fillStyle = '#0A0A0B'; g.fill();
  g.clip(); g.fillStyle = 'rgba(255,255,255,0.016)'; for (let y = 766; y < 908; y += 4) g.fillRect(48, y, W - 96, 1);
  g.restore();
  // header
  g.font = `700 22px ${MONO}`; g.letterSpacing = '4px'; g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillText('RECKON', 64, 79);
  g.fillStyle = C.text; g.fillText('RECKON', 64, 78);
  g.font = `400 22px ${MONO}`; g.letterSpacing = '2px';
  g.fillStyle = C.label; g.fillText('MATH · KAPREKAR’S ROUTINE', 210, 78);
  g.letterSpacing = '0px';
  return c;
}

function captions(t) {
  k.captions(t, CUES, { x: W / 2, y: 836, maxW: 712, size: 42, lh: 52, weight: 700, family: MONO, ink: C.text, marks: { '*': C.amber, '~': C.red } });
}

// ---------- timeline ----------
const B0 = 7.3;
const SC = [0.95, 0.76, 0.6, 0.6];
const R0 = [];
{ let s = B0; for (let r = 0; r < 4; r++) { R0.push(s); s += 5.45 * SC[r]; } }
const at = (r, x) => R0[r] + x * SC[r];
const C0 = 26.1, CSTEP = 0.62, CFIRST = 27.0;
const D0 = 34.4, SWEEP = [35.0, 38.6];
const E0 = 42.4, ESTEP = 0.55, EFIRST = 47.2;
const F0 = 50.8, END = 55;
const T = { M: [0, 26.3], C: [C0, D0 + 0.2], D: [D0, E0 + 0.2], E: [E0, F0 + 0.2], F: [F0, END] };
const CUES = [
  [0.4, 3.6, 'Pick any four digits, *not all the same*.'],
  [3.7, 7.2, 'Repeat one simple step. Where do you end up?'],
  [7.4, 10.2, 'Sort the digits *largest first*…'],
  [10.3, 12.9, '…then *smallest first*, and subtract.'],
  [13.0, 17.0, 'Feed the answer back in. Keep the zero: *0378*.'],
  [18.4, 20.4, 'Round three: *6174*.'],
  [20.5, 22.9, 'One more round…'],
  [23.0, 26.2, '6174 gives ~6174~ again. Stuck for good.'],
  [26.4, 29.9, 'Try other numbers. They all *fall into 6174*.'],
  [30.0, 34.3, 'Some take one step, some take ~seven~.'],
  [34.6, 39.0, 'Now test every four-digit number whose digits aren’t all the same.'],
  [39.1, 42.4, `Not one needs more than ~${MAXSTEPS} steps~.`],
  [42.6, 47.0, `Why so fast? After one step, only *${FIRST.length}* answers are possible.`],
  [47.1, 50.8, `Those ${FIRST.length} all reach *6174* within ~${EXTRA} more~ steps.`],
  [51.0, 54.8, 'That number is ~Kaprekar’s constant~.'],
];

// ---------- A + B: the machine ----------
const SX = [318, 394, 470, 546];
const ROW = { in: 190, big: 330, small: 450, out: 590 };
const DH = 72, WIN = { x: 196, w: 432, h: 96 };
const rowY = (name) => ROW[name] - WIN.h / 2;

function rollDigit(i, t) {
  const f = Math.floor(t * 14), p = t * 14 - f;
  const r = (q) => Math.floor(mulberry(q * 31 + i * 977 + 5)() * 10);
  return morph(String(r(f - 1)), String(r(f)), p * 3);
}

function machine(t) {
  const power = eout(seg(t, 0.1, 0.7));
  // which round is running
  let r = -1;
  for (let i = 0; i < 4; i++) if (t >= R0[i]) r = i;
  const st = r >= 0 ? ROUNDS[r] : null;

  // labels
  withAlpha(power, () => {
    const lab = (s, y) => engraved(s, 176, y, { align: 'right', spacing: '1px' });
    lab('INPUT', ROW.in + 8);
    lab('LARGEST', ROW.big - 4); lab('FIRST', ROW.big + 22);
    lab('SMALLEST', ROW.small - 4); lab('FIRST', ROW.small + 22);
    lab('RESULT', ROW.out + 8);
    engraved('ROUND', 726, ROW.in + 72, { align: 'center' });
    engraved('FIXED', 726, ROW.out + 52, { align: 'center' }); engraved('POINT', 726, ROW.out + 76, { align: 'center' });
  });

  // windows
  for (const name of ['in', 'big', 'small', 'out']) windowBox(WIN.x, rowY(name), WIN.w, WIN.h, { lit: name === 'in' ? 0.6 : 0 });
  windowBox(690, ROW.in - 44, 72, 88);
  // subtraction rule
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(WIN.x, ROW.out - 70, WIN.w, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(WIN.x, ROW.out - 66, WIN.w, 1);
  // feedback wire: from the result back to the input
  const wx = 655;
  const wire = [[WIN.x + WIN.w + 7, ROW.out], [wx, ROW.out], [wx, ROW.in], [WIN.x + WIN.w + 14, ROW.in]];
  withAlpha(power, () => {
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); wire.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.strokeStyle = C.wire; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.wire; ctx.beginPath(); ctx.moveTo(WIN.x + WIN.w + 8, ROW.in); ctx.lineTo(WIN.x + WIN.w + 18, ROW.in - 7); ctx.lineTo(WIN.x + WIN.w + 18, ROW.in + 7); ctx.fill();
  });

  const ghostOnly = () => [0, 0, 0, 0, 0, 0, 0];
  const g = power;

  // --- input row
  const LOCK = [1.6, 2.1, 2.6, 3.1];
  seg7Row(432, ROW.in, DH, 76, 4, (i) => {
    if (!st) {
      if (t < LOCK[i]) return t < 0.5 ? ghostOnly() : rollDigit(i, t);
      return ON(ROUNDS[0].s[i]);
    }
    const p = seg(t, at(r, 4.85), at(r, 5.15));
    return r < 3 ? morph(st.s[i], st.res[i], p) : ON(st.s[i]);
  }, (i) => {
    let a = g;
    if (!st && t >= LOCK[i]) a *= 1 + 0.6 * (1 - seg(t, LOCK[i], LOCK[i] + 0.35));
    if (st) {
      const j = st.perm.indexOf(i);
      const lift = seg(t, at(r, 0.25 + 0.3 * j), at(r, 0.45 + 0.3 * j));
      const back = r < 3 ? seg(t, at(r, 4.85), at(r, 5.15)) : 0;
      a *= lerp(1, 0.4, lift * (1 - back));
    }
    return { alpha: Math.min(a, 1), color: a > 1 ? C.hot : C.amber };
  });

  // --- round counter
  seg7(726, ROW.in, 58, st ? morph(r ? String(r) : ' ', String(r + 1), seg(t, R0[r], R0[r] + 0.25)) : ghostOnly(), { alpha: g });

  // --- big, small and result rows for the current round (empty before the first round)
  if (!st) for (const name of ['big', 'small', 'out']) seg7Row(432, ROW[name], DH, 76, 4, ghostOnly, { alpha: g });
  if (st) {
    const clear = r < 3 ? 1 - seg(t, at(r, 4.95), at(r, 5.3)) : 1;
    const landBig = (j) => at(r, 0.8 + 0.3 * j), landSmall = (j) => at(r, 2.3 + 0.22 * j);
    const outAt = (s) => at(r, 3.2 + (3 - s) * 0.26);
    seg7Row(432, ROW.big, DH, 76, 4, (j) => (t >= landBig(j) ? ON(st.desc[j]) : ghostOnly()), { alpha: clear });
    seg7Row(432, ROW.small, DH, 76, 4, (j) => (t >= landSmall(j) ? ON(st.asc[j]) : ghostOnly()), { alpha: clear });
    // minus sign
    const minus = seg(t, at(r, 1.75), at(r, 1.95)) * clear;
    withAlpha(minus, () => {
      ctx.save(); ctx.shadowColor = C.glow; ctx.shadowBlur = 12; ctx.fillStyle = C.amber;
      rrect(220, ROW.small - 5, 30, 10, 3); ctx.fill(); ctx.restore();
    });
    // the active column while subtracting
    for (let s = 0; s < 4; s++) {
      const a = span(t, outAt(s) - 0.12 * SC[r], outAt(s) + 0.22 * SC[r], 0.08, 0.12) * clear;
      withAlpha(a, () => {
        const gx = ctx.createLinearGradient(0, rowY('big'), 0, ROW.out + 48);
        gx.addColorStop(0, 'rgba(255,178,58,0)'); gx.addColorStop(0.5, 'rgba(255,178,58,0.14)'); gx.addColorStop(1, 'rgba(255,178,58,0.05)');
        ctx.fillStyle = gx; ctx.fillRect(SX[s] - 30, rowY('big'), 60, ROW.out + 48 - rowY('big'));
      });
    }
    seg7Row(432, ROW.out, DH, 76, 4, (s) => mix([0, 0, 0, 0, 0, 0, 0], ON(st.res[s]), seg(t, outAt(s), outAt(s) + 0.18 * SC[r])), { alpha: clear });

    // flying digits: input → largest-first, then largest-first → smallest-first (reversed)
    const fly = (ch, x0, y0, x1, y1, a, b) => {
      if (t < a || t >= b) return;
      const p = eio(seg(t, a, b));
      const x = lerp(x0, x1, p), y = lerp(y0, y1, p) - Math.sin(Math.PI * p) * 16;
      seg7(x, y, DH * (1 + 0.1 * Math.sin(Math.PI * p)), ON(ch), { ghost: null, color: C.hot });
    };
    for (let j = 0; j < 4; j++) {
      fly(st.desc[j], SX[st.perm[j]], ROW.in, SX[j], ROW.big, at(r, 0.25 + 0.3 * j), landBig(j));
      fly(st.asc[j], SX[3 - j], ROW.big, SX[j], ROW.small, at(r, 1.75 + 0.22 * j), landSmall(j));
    }

    // the answer travels back along the wire
    if (r < 3) {
      const p = seg(t, at(r, 4.35), at(r, 4.95));
      if (p > 0 && p < 1) {
        const lens = wire.slice(1).map(([x, y], i) => Math.hypot(x - wire[i][0], y - wire[i][1]));
        const total = lens.reduce((a, b) => a + b, 0);
        const pos = (q) => {
          let d = q * total;
          for (let i = 0; i < lens.length; i++) {
            if (d <= lens[i] || i === lens.length - 1) { const u = clamp(d / lens[i]); return [lerp(wire[i][0], wire[i + 1][0], u), lerp(wire[i][1], wire[i + 1][1], u)]; }
            d -= lens[i];
          }
        };
        const q = eio(p);
        ctx.save(); ctx.shadowColor = C.glow; ctx.shadowBlur = 16;
        for (let s = 5; s >= 0; s--) {
          const [x, y] = pos(Math.max(0, q - s * 0.025));
          ctx.globalAlpha = (1 - s / 6) * 0.9; ctx.fillStyle = s ? C.amber : C.hot;
          ctx.beginPath(); ctx.arc(x, y, 7 - s * 0.7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  // --- the lamp lights when 6174 maps to itself
  const fixed = seg(t, at(3, 4.2), at(3, 4.5));
  lamp(726, ROW.out, 17, fixed * (0.85 + 0.15 * Math.sin(ambient * 6)));
  withAlpha(fixed, () => engraved('FIXED', 726, ROW.out + 52, { align: 'center', color: C.red }));
  withAlpha(fixed, () => engraved('POINT', 726, ROW.out + 76, { align: 'center', color: C.red }));
  if (fixed > 0) {
    const pulse = 0.5 + 0.5 * Math.sin((ambient - at(3, 4.2)) * 5);
    withAlpha(fixed * 0.5 * pulse, () => { rrect(WIN.x - 3, rowY('in') - 3, WIN.w + 6, WIN.h + 6, 12); rrect(WIN.x - 3, rowY('out') - 3, WIN.w + 6, WIN.h + 6, 12); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke(); });
  }

  // --- history tape
  const items = [ROUNDS[0].s, ...ROUNDS.slice(0, 3).map((s) => s.res)];
  const shown = (i) => (i === 0 ? seg(t, B0, B0 + 0.4) : seg(t, at(i - 1, 4.2), at(i - 1, 4.5)));
  const tw = 4 * 20 + 46;
  const tx0 = 432 - (items.length * tw - 46) / 2;
  items.forEach((v, i) => {
    const a = shown(i);
    if (a <= 0) return;
    const x = tx0 + i * tw + 30;
    withAlpha(a, () => {
      seg7Row(x, 690, 26, 20, 4, (d) => ON(v[d]), { ghost: null, color: v === '6174' && fixed > 0 ? C.hot : C.amber });
      if (i) engraved('›', x - 66, 700, { size: 30, align: 'center', color: C.label });
    });
  });
}

// ---------- C: other starting numbers ----------
const STARTS = [9831, 1000, 2468, 1492, 7101, 5998];
const CHAINS = STARTS.map(chain);
function sceneC(t) {
  const cols = { start: 70, win: 176, leds: 474, lamp: 748 };
  engraved('START', cols.start, 160);
  engraved('NOW', cols.win + 14, 160);
  engraved('STEPS', cols.leds - 12, 160);
  engraved('6174', cols.lamp, 160, { align: 'center' });
  const stepAt = (s) => CFIRST + (s - 1) * CSTEP;
  CHAINS.forEach((c, row) => {
    const y = 220 + row * 88;
    const pop = eout(seg(t, C0 + 0.15 + row * 0.08, C0 + 0.55 + row * 0.08));
    withAlpha(pop, () => {
      const L = c.length - 1;
      let done = 0;
      for (let s = 1; s <= L; s++) if (t >= stepAt(s)) done = s;
      engraved(c[0], cols.start, y + 9, { size: 26, color: C.text });
      windowBox(cols.win, y - 32, 214, 64, { r: 8 });
      const p = done ? seg(t, stepAt(done), stepAt(done) + 0.2) : 1;
      const from = done ? c[done - 1] : c[0], to = done ? c[done] : c[0];
      const landed = done === L ? seg(t, stepAt(L), stepAt(L) + 0.3) : 0;
      seg7Row(cols.win + 107, y, 44, 42, 4, (i) => morph(from[i], to[i], p), { color: landed > 0.5 ? C.hot : C.amber });
      for (let s = 0; s < 7; s++) {
        const x = cols.leds + s * 34;
        const on = s < done ? seg(t, stepAt(s + 1), stepAt(s + 1) + 0.15) : 0;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = '#121214'; ctx.fill();
        if (on > 0) {
          ctx.save(); ctx.globalAlpha *= on; ctx.shadowColor = C.glow; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fillStyle = C.amber; ctx.fill(); ctx.restore();
        } else { ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,176,70,0.08)'; ctx.fill(); }
      }
      lamp(cols.lamp, y, 13, landed);
    });
  });
}

// ---------- D: all of them ----------
function sceneD(t) {
  const q = eio(seg(t, SWEEP[0], SWEEP[1]));
  const idx = Math.round(q * ALL.length);
  const counts = PREFIX[idx];
  engraved('NUMBERS', 286, 150, { align: 'right' }); engraved('TESTED', 286, 176, { align: 'right' });
  windowBox(306, 120, 252, 82, { r: 9 });
  const shown = String(idx).padStart(4, ' ');
  seg7Row(432, 161, 56, 54, 4, (i) => ON(shown[i]));
  font(700, 30); text(`/ ${ALL.length}`, 578, 172, { color: C.label });

  const base = 636, bw = 52, x0 = 108, dx = 81, block = 100, bh = 13, gap = 4;
  for (let c = 0; c < 9; c++) {
    const x = x0 + c * dx;
    const n = counts[c], full = Math.floor(n / block), part = (n % block) / block;
    const maxBlocks = 22;
    for (let b = 0; b < maxBlocks; b++) {
      const y = base - (b + 1) * (bh + gap) + gap;
      const lit = b < full ? 1 : b === full ? part : 0;
      ctx.fillStyle = 'rgba(255,176,70,0.05)'; ctx.fillRect(x - bw / 2, y, bw, bh);
      if (lit > 0) {
        ctx.save(); ctx.globalAlpha *= lit; ctx.shadowColor = C.glow; ctx.shadowBlur = 8;
        ctx.fillStyle = c === 8 ? C.red : C.amber; ctx.fillRect(x - bw / 2, y, bw, bh); ctx.restore();
      }
    }
    const top = base - Math.max(1, Math.ceil(n / block)) * (bh + gap);
    font(700, 22);
    text(String(n), x, Math.min(base - 10, top - 4), { color: c === 8 ? C.red : C.text, align: 'center' });
    font(700, 28);
    text(c === 8 ? '8+' : String(c), x, base + 38, { color: c === 8 ? C.red : C.text, align: 'center' });
  }
  engraved('STEPS NEEDED TO REACH 6174', 432, base + 76, { align: 'center' });
  // highlight: the slowest column and the empty one
  const hl = eout(seg(t, 39.2, 39.7));
  withAlpha(hl, () => {
    const x7 = x0 + 7 * dx, x8 = x0 + 8 * dx;
    rrect(x7 - 36, base - 22 * (bh + gap) - 6, 72, 22 * (bh + gap) + 56, 10); ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke();
    rrect(x8 - 36, base - 22 * (bh + gap) - 6, 72, 22 * (bh + gap) + 56, 10); ctx.strokeStyle = C.red; ctx.stroke();
    engraved('MAX', x7, base - 22 * (bh + gap) - 16, { align: 'center', color: C.amber });
    engraved('NONE', x8, base - 22 * (bh + gap) - 16, { align: 'center', color: C.red });
  });
}

// ---------- E: the 54 possible results ----------
function sceneE(t) {
  let round = 0;
  for (let r = 1; r <= EXTRA; r++) if (t >= EFIRST + (r - 1) * ESTEP) round = r;
  const p = round ? seg(t, EFIRST + (round - 1) * ESTEP, EFIRST + (round - 1) * ESTEP + 0.2) : 1;
  const vals = GRID[round], prev = GRID[Math.max(0, round - 1)];
  const atFixed = vals.filter((v) => v === '6174').length;
  engraved('ROUND', 70, 150); font(700, 30); text(String(round), 170, 152, { color: C.text });
  engraved(`AT 6174: `, 470, 150); font(700, 30); text(`${atFixed}/${FIRST.length}`, 624, 152, { color: atFixed === FIRST.length ? C.red : C.text });
  const cw = 112, ch = 46, gx = 10, gy = 9, cols = 6;
  const x0 = (W - (cols * cw + (cols - 1) * gx)) / 2, y0 = 182;
  vals.forEach((v, i) => {
    const cx = x0 + (i % cols) * (cw + gx), cy = y0 + Math.floor(i / cols) * (ch + gy);
    const a = eout(seg(t, E0 + 0.2 + i * 0.018, E0 + 0.5 + i * 0.018));
    withAlpha(a, () => {
      rrect(cx, cy, cw, ch, 7); ctx.fillStyle = C.glass; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5; ctx.stroke();
      const from = round ? prev[i] : v;
      const fixed = v === '6174';
      const lit = fixed ? (prev[i] === '6174' && round ? 1 : seg(t, EFIRST + (round - 1) * ESTEP, EFIRST + (round - 1) * ESTEP + 0.25)) : 0;
      seg7Row(cx + cw / 2 - 6, cy + ch / 2, 28, 22, 4, (d) => morph(from[d], v[d], p), { color: fixed && lit > 0.5 ? C.hot : C.amber });
      ctx.beginPath(); ctx.arc(cx + cw - 10, cy + ch / 2, 4.5, 0, Math.PI * 2);
      ctx.save(); if (lit > 0) { ctx.shadowColor = C.redGlow; ctx.shadowBlur = 8 * lit; }
      ctx.fillStyle = lit > 0 ? C.red : C.redOff; ctx.globalAlpha *= lit > 0 ? 0.4 + 0.6 * lit : 1; ctx.fill(); ctx.restore();
    });
  });
}

// ---------- F: payoff ----------
function sceneF(t) {
  const p = eout(seg(t, F0 + 0.1, F0 + 0.7));
  withAlpha(p, () => {
    windowBox(212, 190 + (1 - p) * 14, 440, 156, { r: 12, lit: 1 });
    seg7Row(432, 268 + (1 - p) * 14, 112, 104, 4, (i) => ON('6174'[i]), { color: C.hot });
    lamp(726, 268, 18, 0.9 + 0.1 * Math.sin(ambient * 6));
    engraved('KAPREKAR’S CONSTANT', 432, 430, { size: 40, align: 'center', color: C.text, spacing: '3px' });
    engraved('named after Indian mathematician D. R. Kaprekar', 432, 474, { size: 22, weight: 400, align: 'center', spacing: '0px' });
    const q = eout(seg(t, F0 + 0.8, F0 + 1.4));
    withAlpha(q, () => {
      font(700, 26);
      text(`1 step  +  at most ${EXTRA} more  =  at most ${1 + EXTRA}`, 432, 570, { color: C.amber, align: 'center' });
      engraved('Source: Wikipedia, “Kaprekar’s routine”', 432, 680, { size: 22, weight: 400, align: 'center', spacing: '0px' });
    });
  });
}

// The clip's own time, from tools.clock: it runs on while a step holds for reading, so the decorative
// motion below uses it; the story itself uses t.
let ambient = 0;

Kit.scene({
  width: W, height: H, duration: END,
  fonts: [{ family: MONO, file: 'SpaceMono-Regular.woff2', weight: '400' }, { family: MONO, file: 'SpaceMono-Bold.woff2', weight: '700' }],
  draw(t, tools) {
    ambient = tools.clock;
    k = tools; ctx = tools.ctx;
    if (!BG) BG = makeBackground();
    ctx.drawImage(BG, 0, 0);
    const scenes = [[machine, T.M, 0], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E], [sceneF, T.F, 0.35, 0]];
    for (const [fn, [a, b], fi = 0.35, fo = 0.35] of scenes) {
      if (t < a || t > b) continue;
      withAlpha(span(t, a, b, fi, fo), () => fn(t));
    }
    captions(t);
  },
});
