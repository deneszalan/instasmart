// Explainer for economics-rule-of-72: money doubles in about 72 ÷ (interest rate in %) years.
// Look: a green bookkeeper's ledger. Mint paper with ruled lines and a red double margin, dark
// green ink, entries in a typewriter-like mono, and stacks of gold coins. Libre Caslon Text for
// captions and headings, IBM Plex Mono for the figures.
//
// Everything is computed here: the 6% ledger compounds 100 a year at a time (interest on the
// balance, rounded to cents only for display); the growth curves are (1 + r)^t; the exact doubling
// time is ln 2 / ln(1 + r) for yearly compounding; the 72 coins are re-arranged into every grid
// whose sides are divisors of 72; the accuracy table compares 72 / r with the exact time.
//
// Scene plan (65 s). Important things stay above y = 930; captions are centred at y = 852.
//  A  0.0– 8.6  Hook: a stack of 10 coins and a dotted twice-as-tall outline. "How long does
//               money take to double?" / "Divide 72 by the interest rate…"
//  B  8.4–23.0  At 6%: the rule says 12 years; the ledger compounds year by year, coins drop on
//               the stack; year 12: 201.22, doubled.
//  C 22.8–32.2  Other rates: (1 + r)^t curves for 3%, 6% and 9%, each marked where it crosses 200
//               (exact) and at 72 ÷ r (the rule): 8 vs 8.04, 24 vs 23.45.
//  D 32.0–48.0  Why 72: the exact formula; 72 coins re-form into 8×9, 6×12, 4×18, 3×24, 2×36;
//               a table shows the rule is best around 6–10% and drifts at high rates.
//  E 47.8–65.0  History: Pacioli's Summa de arithmetica (Venice, 1494), "tieni per regola 72",
//               his own 6% example, no explanation, so the rule is thought to be older. End card.
//
// Facts: Wikipedia "Rule of 72": divide 72 by the percentage rate to estimate the doubling time;
// it is for compound, not simple, interest; the exact time is ln 2 / ln(1 + r/100); 9% gives 8
// years by the rule and 8.0432 exactly; 72 has many small divisors (1, 2, 3, 4, 6, 8, 9, 12); it is
// a good approximation for annual compounding at typical rates (6% to 10%) and less accurate at
// higher rates; 69.3 suits continuous compounding; an early reference is Luca Pacioli's Summa de
// arithmetica (Venice, 1494), which gives the rule without deriving or explaining it ("tieni per
// regola 72"), with the example of 6% doubling in 12 years, so the rule is assumed to predate him.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  paper: '#eaf2e1', paper2: '#dfe9d3', rule: 'rgba(92,140,96,0.28)', margin: 'rgba(190,60,50,0.55)',
  ink: '#1d3a28', inkSoft: 'rgba(29,58,40,0.72)', red: '#b03a2e', green: '#1f7a4a',
  gold: '#e3b341', goldLight: '#fbe39a', goldDeep: '#a8781c', goldEdge: '#8a6215',
  lines: ['#6f8f7a', '#c8962a', '#b03a2e'],
};
const SERIF = 'Libre Caslon Text', MONO = 'IBM Plex Mono';

let k, ctx;
const font = (w, s, f = SERIF) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);
const f2 = (x) => x.toFixed(2);

// ---------- the numbers ----------
const exact = (r) => Math.log(2) / Math.log(1 + r / 100);
const rule = (r) => 72 / r;
const RATE = 6, YEARS = rule(RATE); // 12
const LEDGER = [{ y: 0, interest: 0, bal: 100 }];
for (let y = 1; y <= YEARS; y++) { const prev = LEDGER[y - 1].bal, i = prev * RATE / 100; LEDGER.push({ y, interest: i, bal: prev + i }); }
const FINAL = LEDGER[YEARS].bal; // 201.22
const TABLE = [2, 4, 6, 8, 10, 12, 20, 50].map((r) => ({ r, rule: rule(r), exact: exact(r), err: rule(r) / exact(r) - 1 }));
const GRIDS = [[8, 9], [6, 12], [4, 18], [3, 24], [2, 36]];

// ---------- timeline ----------
const T = { A: [0, 8.6], B: [8.4, 23.0], C: [22.8, 32.2], D: [32.0, 48.0], E: [47.8, 65] };
const YEAR_T0 = 11.2, YEAR_DT = 0.6; // ledger rows appear one year at a time
const CUES = [
  [0.4, 4.2, 'How long does money take to *double*?'],
  [4.4, 8.4, 'Divide *72* by the interest rate. That’s roughly the years.'],
  [8.6, 13.0, `At ~${RATE}%~ a year, the rule says 72 ÷ ${RATE} = *${YEARS} years*.`],
  [13.2, 18.0, 'Each year the interest is added, and next year earns interest too.'],
  [18.2, 22.8, `Year ${YEARS}: 100 has grown to ${f2(FINAL)}. It has *doubled*.`],
  [23.0, 27.4, `At ~9%~: 72 ÷ 9 = 8 years. Exactly, it takes *${f2(exact(9))}*.`],
  [27.6, 32.0, `At ~3%~: 72 ÷ 3 = 24 years. Exactly, it takes *${f2(exact(3))}*.`],
  [32.2, 37.0, 'The exact answer needs logarithms: ln 2 ÷ ln(1 + rate).'],
  [37.2, 43.0, 'But 72 comes close, and splits evenly by 2, 3, 4, 6, 8, 9 and 12.'],
  [43.2, 47.8, 'It’s best for rates around ~6 to 10%~, and drifts at high rates.'],
  [48.0, 52.8, 'The rule appears in Luca Pacioli’s *Summa* of 1494, without a proof.'],
  [53.0, 57.6, 'His own example: at 6% a year, money doubles in 12 years.'],
  [57.8, 62.2, 'Since he didn’t explain it, the rule is thought to be older still.'],
];

// ---------- paper, painted once ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, W, H);
  lg.addColorStop(0, C.paper); lg.addColorStop(1, C.paper2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(60,90,60,${r() * 0.035})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(90,120,80,${0.03 + r() * 0.04})`; g.lineWidth = 1; const y = r() * H; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 20 * (r() - 0.5), W * 0.6, y + 20 * (r() - 0.5), W, y + 10 * (r() - 0.5)); g.stroke(); }
  // ruled lines and the margin
  g.strokeStyle = C.rule; g.lineWidth = 1.5;
  for (let y = 150; y < 960; y += 36) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  g.strokeStyle = 'rgba(92,140,96,0.45)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 112); g.lineTo(W, 112); g.stroke();
  g.strokeStyle = C.margin; g.lineWidth = 2;
  for (const x of [92, 98]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  // a soft shadow at the binding (left) and a vignette
  const sh = g.createLinearGradient(0, 0, 60, 0);
  sh.addColorStop(0, 'rgba(30,60,30,0.18)'); sh.addColorStop(1, 'rgba(30,60,30,0)');
  g.fillStyle = sh; g.fillRect(0, 0, 60, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 360, W / 2, H / 2, 760);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,70,40,0.16)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ---------- coins ----------
const COIN = { rx: 62, ry: 16, th: 11 };
function coinSide(x, y, rx = COIN.rx, ry = COIN.ry, th = COIN.th) {
  // one coin seen from the side, top face centred at (x, y)
  const sg = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
  sg.addColorStop(0, C.goldDeep); sg.addColorStop(0.4, C.gold); sg.addColorStop(1, C.goldEdge);
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.ellipse(x, y + th, rx, ry, 0, 0, Math.PI); ctx.lineTo(x - rx, y); ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,10,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y + th, rx, ry, 0, 0, Math.PI); ctx.stroke();
  const tg = ctx.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
  tg.addColorStop(0, C.goldLight); tg.addColorStop(0.6, C.gold); tg.addColorStop(1, C.goldDeep);
  ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(138,98,21,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, rx * 0.78, ry * 0.72, 0, 0, Math.PI * 2); ctx.stroke();
}
/** A stack worth `value` (10 per coin) on base y; the top coin can be partial (drawn fading). */
function stack(x, base, value, { ghost = 0, label = true } = {}) {
  const n = value / 10, whole = Math.floor(n + 1e-9);
  ctx.fillStyle = 'rgba(30,60,30,0.15)'; ctx.beginPath(); ctx.ellipse(x + 8, base + COIN.th + 8, COIN.rx + 16, COIN.ry + 4, 0, 0, Math.PI * 2); ctx.fill();
  if (ghost > 0) A(ghost, () => {
    ctx.strokeStyle = C.ink; ctx.setLineDash([7, 7]); ctx.lineWidth = 2;
    const top = base - 19 * COIN.th;
    ctx.beginPath(); ctx.ellipse(x, top, COIN.rx, COIN.ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - COIN.rx, top); ctx.lineTo(x - COIN.rx, base); ctx.moveTo(x + COIN.rx, top); ctx.lineTo(x + COIN.rx, base); ctx.stroke();
    ctx.setLineDash([]);
  });
  for (let i = 0; i < whole; i++) coinSide(x, base - i * COIN.th);
  const frac = n - whole;
  if (frac > 0.02) A(frac, () => coinSide(x, base - whole * COIN.th));
  return base - Math.max(0, Math.ceil(n - 1e-9) - 1) * COIN.th;
}
function flatCoin(x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, C.goldLight); g.addColorStop(0.6, C.gold); g.addColorStop(1, C.goldDeep);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(138,98,21,0.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.stroke();
}

// ---------- scene A: hook ----------
function sceneA(t) {
  A(eout(seg(t, 4.4, 5.2)), () => {
    font(700, 66); text('72 ÷ rate', W / 2, 260, { align: 'center', base: 'middle' });
    font(400, 38); text('≈ years to double', W / 2, 330, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  const x = W / 2, base = 690;
  stack(x, base, 100, { ghost: eout(seg(t, 1.2, 2.0)) });
  A(eout(seg(t, 1.6, 2.4)), () => {
    font(600, 30, MONO); text('100', x + COIN.rx + 26, base - 40, { align: 'left', base: 'middle' });
    text('200?', x + COIN.rx + 26, base - 19 * COIN.th, { color: C.red, align: 'left', base: 'middle' });
  });
}

// ---------- scene B: the 6% ledger ----------
const LX = { year: 150, int: 390, bal: 548, top: 222, row: 34 };
const STACK_X = 714, STACK_BASE = 690;
function yearsDone(t) { return clamp(Math.floor((t - YEAR_T0) / YEAR_DT) + 1, 0, YEARS); }
function balanceAt(t) {
  const u = (t - YEAR_T0) / YEAR_DT;
  if (u < 0) return 100;
  const i = Math.min(YEARS - 1, Math.floor(u)), f = eio(clamp((u - i) / 0.6));
  if (u >= YEARS) return FINAL;
  return lerp(LEDGER[i].bal, LEDGER[i + 1].bal, f);
}
function sceneB(t) {
  // the rule, written at the top
  A(eout(seg(t, 8.8, 9.6)), () => {
    font(700, 40); text(`72 ÷ ${RATE} = ${YEARS} years`, W / 2, 168, { align: 'center', base: 'middle' });
  });
  // ledger header
  A(eout(seg(t, 9.6, 10.4)), () => {
    font(600, 22, MONO);
    text('YEAR', LX.year, LX.top - 20, { color: C.inkSoft, base: 'middle' });
    text('INTEREST', LX.int, LX.top - 20, { color: C.inkSoft, align: 'right', base: 'middle' });
    text('BALANCE', LX.bal, LX.top - 20, { color: C.inkSoft, align: 'right', base: 'middle' });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(LX.year - 10, LX.top - 2); ctx.lineTo(LX.bal + 8, LX.top - 2); ctx.stroke();
  });
  // rows
  for (let y = 0; y <= YEARS; y++) {
    const at = y === 0 ? 10.6 : YEAR_T0 + (y - 1) * YEAR_DT;
    const a = eout(seg(t, at, at + 0.35));
    if (a <= 0) continue;
    A(a, () => {
      const ry = LX.top + 18 + y * LX.row;
      const last = y === YEARS;
      font(last ? 600 : 400, 24, MONO);
      text(String(y), LX.year + 10, ry, { color: C.ink, base: 'middle' });
      if (y > 0) text(`+${f2(LEDGER[y].interest)}`, LX.int, ry, { color: C.green, align: 'right', base: 'middle' });
      text(f2(LEDGER[y].bal), LX.bal, ry, { color: last ? C.red : C.ink, align: 'right', base: 'middle' });
      if (last) {
        const p = eio(seg(t, 18.4, 19.0));
        ctx.strokeStyle = C.red; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(LX.bal - 46, ry, 70 * p + 1, 22, -0.04, 0, Math.PI * 2 * p); ctx.stroke();
      }
    });
  }
  // the stack moves from the centre to the right
  const mv = eio(seg(t, 8.6, 9.8));
  const x = lerp(W / 2, STACK_X, mv);
  const bal = balanceAt(t);
  const top = stack(x, STACK_BASE, bal, { ghost: 1 });
  // interest coins falling onto the stack each year
  for (let y = 1; y <= YEARS; y++) {
    const at = YEAR_T0 + (y - 1) * YEAR_DT, p = seg(t, at - 0.25, at + 0.05);
    if (p <= 0 || p >= 1) continue;
    const yy = lerp(STACK_BASE - 300, STACK_BASE - (LEDGER[y - 1].bal / 10) * COIN.th, p * p);
    A(1 - p * 0.3, () => coinSide(x, yy, COIN.rx * 0.55, COIN.ry * 0.55, COIN.th * 0.6));
  }
  const shownBal = LEDGER[yearsDone(t)].bal; // the label shows the last full year's balance
  font(600, 34, MONO); text(f2(shownBal), x, Math.min(top, STACK_BASE - 19 * COIN.th) - 44, { color: shownBal >= 200 ? C.red : C.ink, align: 'center', base: 'middle' });
  A(span(t, 18.6, 23.0, 0.4, 0.3), () => {
    font(700, 52); text('×2', x - COIN.rx - 22, STACK_BASE - 120, { color: C.red, align: 'right', base: 'middle' });
  });
  A(eout(seg(t, 9.6, 10.2)), () => {
    font(400, 22, MONO); text(`YEAR ${yearsDone(t)}`, x, STACK_BASE + 64, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

// ---------- scene C: three rates ----------
const CH = { x0: 150, x1: 800, y0: 660, y1: 230, tMax: 26, vMin: 100, vMax: 400 };
const cx = (yr) => lerp(CH.x0, CH.x1, yr / CH.tMax);
const cy = (v) => lerp(CH.y0, CH.y1, (v - CH.vMin) / (CH.vMax - CH.vMin));
function sceneC(t) {
  A(eout(seg(t, 22.9, 23.6)), () => {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(CH.x0, CH.y1 - 10); ctx.lineTo(CH.x0, CH.y0); ctx.lineTo(CH.x1 + 10, CH.y0); ctx.stroke();
    font(400, 22, MONO);
    for (const v of [100, 200, 300, 400]) text(String(v), CH.x0 - 12, cy(v), { color: C.inkSoft, align: 'right', base: 'middle' });
    for (const yr of [0, 5, 10, 15, 20, 25]) text(String(yr), cx(yr), CH.y0 + 26, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('years', CH.x1, CH.y0 + 56, { color: C.inkSoft, align: 'right', base: 'middle' });
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(CH.x0, cy(200)); ctx.lineTo(CH.x1, cy(200)); ctx.stroke(); ctx.setLineDash([]);
    font(600, 22, MONO); text('DOUBLED', CH.x0 + 12, cy(200) - 16, { color: C.red, align: 'left', base: 'middle' });
  });
  const rates = [[3, 27.6], [6, 23.2], [9, 23.4]];
  rates.forEach(([r, at], i) => {
    const grow = eio(seg(t, at, at + 2.4));
    if (grow <= 0) return;
    const col = C.lines[i];
    ctx.save(); ctx.beginPath(); ctx.rect(CH.x0, CH.y1 - 20, CH.x1 - CH.x0 + 20, CH.y0 - CH.y1 + 20); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = r === 6 ? 4 : 5; ctx.lineCap = 'round';
    ctx.beginPath();
    const tEnd = CH.tMax * grow;
    for (let j = 0; j <= 160; j++) { const yr = (j / 160) * tEnd, v = 100 * Math.pow(1 + r / 100, yr); j ? ctx.lineTo(cx(yr), cy(v)) : ctx.moveTo(cx(yr), cy(v)); }
    ctx.stroke();
    ctx.restore();
    // rate label at the line's end (or where it leaves the chart)
    const yrEnd = Math.min(tEnd, Math.log(4) / Math.log(1 + r / 100));
    font(600, 24, MONO); text(`${r}%`, cx(yrEnd) + 10, cy(100 * Math.pow(1 + r / 100, yrEnd)) - 14, { color: col, align: 'left', base: 'middle' });
    // exact crossing and the rule's mark
    const ex = exact(r), ru = rule(r);
    const m = seg(t, at + 2.0 * (ex / CH.tMax) + 0.2, at + 2.0 * (ex / CH.tMax) + 0.7);
    if (r !== 6 && m > 0) A(m, () => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(cx(ex), cy(200)); ctx.lineTo(cx(ex), CH.y0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx(ex), cy(200), 7, 0, Math.PI * 2); ctx.fill();
      // the rule's estimate as a tick on the axis
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx(ru), CH.y0 - 12); ctx.lineTo(cx(ru), CH.y0 + 2); ctx.stroke();
      const box = (s, x, y) => { font(600, 22, MONO); const w = ctx.measureText(s).width + 18; ctx.fillStyle = 'rgba(234,242,225,0.92)'; ctx.fillRect(x - w / 2, y - 16, w, 32); text(s, x, y, { color: col, align: 'center', base: 'middle' }); };
      box(`rule ${ru}, exact ${f2(ex)}`, clamp(cx(ex), 300, 680), r === 9 ? cy(200) + 40 : cy(200) + 84);
    });
  });
}

// ---------- scene D: why 72 ----------
function sceneD(t) {
  // the exact formula
  A(span(t, 32.2, 37.2, 0.5, 0.4), () => {
    font(400, 30); text('years to double, exactly =', W / 2, 330, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(700, 60); text('ln 2 ÷ ln(1 + r)', W / 2, 410, { align: 'center', base: 'middle' });
    font(400, 26, MONO); text(`ln 2 = ${Math.log(2).toFixed(4)}…`, W / 2, 500, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('r = rate ÷ 100', W / 2, 540, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
  // 72 coins in every rectangle
  const g0 = 37.4, gd = 1.12;
  const gi = clamp((t - g0) / gd, 0, GRIDS.length - 1);
  const i0 = Math.floor(gi), i1 = Math.min(GRIDS.length - 1, i0 + 1), f = eio(clamp((gi - i0) * 1.6));
  const pos = ([rows, cols], n) => { const sp = 20, r = Math.floor(n / cols), c = n % cols; return [W / 2 + (c - (cols - 1) / 2) * sp, 420 + (r - (rows - 1) / 2) * sp]; };
  A(span(t, 37.2, 43.2, 0.4, 0.4), () => {
    for (let n = 0; n < 72; n++) {
      const [ax, ay] = pos(GRIDS[i0], n), [bx, by] = pos(GRIDS[i1], n);
      flatCoin(lerp(ax, bx, f), lerp(ay, by, f), 8);
    }
    const [rows, cols] = GRIDS[f > 0.5 ? i1 : i0];
    font(600, 52, MONO); text(`72 = ${rows} × ${cols}`, W / 2, 250, { align: 'center', base: 'middle' });
    font(400, 24, MONO); text('divides evenly by', W / 2, 600, { color: C.inkSoft, align: 'center', base: 'middle' });
    const D = [2, 3, 4, 6, 8, 9, 12];
    D.forEach((d, j) => {
      const x = W / 2 + (j - 3) * 74, on = seg(t, 37.8 + j * 0.25, 38.2 + j * 0.25);
      A(0.25 + 0.75 * on, () => {
        ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, 652, 26, 0, Math.PI * 2); ctx.stroke();
        font(600, 26, MONO); text(String(d), x, 653, { color: C.green, align: 'center', base: 'middle' });
      });
    });
  });
  // accuracy table
  A(span(t, 43.3, 48.0, 0.4, 0.4), () => {
    const x = { r: 200, rule: 400, ex: 560, err: 720 }, top = 200, row = 50;
    font(600, 22, MONO);
    text('RATE', x.r, top, { color: C.inkSoft, align: 'right', base: 'middle' });
    text('72 ÷ RATE', x.rule, top, { color: C.inkSoft, align: 'right', base: 'middle' });
    text('EXACT', x.ex, top, { color: C.inkSoft, align: 'right', base: 'middle' });
    text('OFF BY', x.err, top, { color: C.inkSoft, align: 'right', base: 'middle' });
    TABLE.forEach((r, i) => {
      const y = top + 46 + i * row, good = r.r >= 6 && r.r <= 10;
      A(seg(t, 43.5 + i * 0.12, 43.8 + i * 0.12), () => {
        if (good) { ctx.fillStyle = 'rgba(31,122,74,0.14)'; ctx.fillRect(116, y - 22, 640, 44); }
        font(good ? 600 : 400, 26, MONO);
        text(`${r.r}%`, x.r, y, { align: 'right', base: 'middle' });
        text(r.rule % 1 ? r.rule.toFixed(2) : String(r.rule), x.rule, y, { align: 'right', base: 'middle' });
        text(f2(r.exact), x.ex, y, { align: 'right', base: 'middle' });
        const e = r.err * 100;
        text(`${e >= 0 ? '+' : '−'}${Math.abs(e).toFixed(1)}%`, x.err, y, { color: Math.abs(e) <= 1.05 ? C.green : C.red, align: 'right', base: 'middle' });
      });
    });
  });
}

// ---------- scene E: Pacioli ----------
function sceneE(t) {
  A(span(t, 48.0, 62.4, 0.5, 0.5), () => {
    // an old book page
    ctx.save(); ctx.translate(W / 2, 430); ctx.rotate(-0.02);
    ctx.fillStyle = 'rgba(30,50,30,0.18)'; ctx.fillRect(-262, -262, 540, 540);
    const pg = ctx.createLinearGradient(-270, -270, 270, 270);
    pg.addColorStop(0, '#f6ecd0'); pg.addColorStop(1, '#e6d5a8');
    ctx.fillStyle = pg; ctx.fillRect(-270, -270, 540, 540);
    ctx.strokeStyle = 'rgba(110,70,30,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(-246, -246, 492, 492);
    font(700, 34); text('Summa de arithmetica', 0, -190, { color: '#5a3a1a', align: 'center', base: 'middle' });
    font(400, 26); text('Luca Pacioli · Venice · 1494', 0, -146, { color: '#7a5a3a', align: 'center', base: 'middle' });
    ctx.strokeStyle = 'rgba(110,70,30,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-180, -112); ctx.lineTo(180, -112); ctx.stroke();
    // faint lines of text
    ctx.fillStyle = 'rgba(90,60,30,0.16)';
    for (let i = 0; i < 9; i++) ctx.fillRect(-200, -80 + i * 34, 400 - (i % 3) * 40, 9);
    const q = eout(seg(t, 48.8, 49.6));
    A(q, () => {
      ctx.fillStyle = 'rgba(227,179,65,0.35)'; ctx.fillRect(-206, 22, 412, 54);
      font(700, 34); text('“tieni per regola 72”', 0, 50, { color: '#5a3a1a', align: 'center', base: 'middle' });
      font(400, 24); text('“keep as a rule 72”', 0, 104, { color: '#7a5a3a', align: 'center', base: 'middle' });
    });
    const ex = eout(seg(t, 53.2, 53.9));
    A(ex, () => {
      ctx.fillStyle = 'rgba(234,242,225,0.94)'; ctx.fillRect(-206, 140, 412, 92);
      font(600, 36, MONO); text('72 ÷ 6 = 12', 0, 172, { color: C.red, align: 'center', base: 'middle' });
      font(400, 22); text('at 6 per 100 a year: doubled in 12 years', 0, 210, { color: '#5a3a1a', align: 'center', base: 'middle' });
    });
    ctx.restore();
  });
  // end card
  A(seg(t, 62.4, 63.2), () => {
    stack(W / 2 - 120, 520, 100);
    stack(W / 2 + 120, 520, 200);
    font(700, 60); text('72 ÷ rate', W / 2, 640, { align: 'center', base: 'middle' });
    font(400, 32); text('≈ years for money to double', W / 2, 700, { color: C.inkSoft, align: 'center', base: 'middle' });
    font(400, 21, MONO);
    text('Source: Wikipedia, “Rule of 72”', W / 2, 862, { color: C.inkSoft, align: 'center', base: 'middle' });
    text('Compound interest, paid once a year', W / 2, 892, { color: C.inkSoft, align: 'center', base: 'middle' });
  });
}

function header(a) {
  A(a, () => {
    font(600, 22, MONO); text('RECKON', 120, 72, { color: C.red, spacing: '3px' });
    const w = ctx.measureText('RECKON').width + 18;
    font(400, 22, MONO); text('ECONOMICS · COMPOUND INTEREST', 120 + w + 14, 72, { color: C.inkSoft, spacing: '1px' });
  });
}

function draw(t) {
  if (!bg) paintBg();
  ctx.drawImage(bg, 0, 0);
  header(eout(seg(t, 0.1, 1.0)));
  const scenes = [[sceneA, T.A, 0.5], [sceneB, T.B], [sceneC, T.C], [sceneD, T.D], [sceneE, T.E, 0.4, 0]];
  for (const [fn, [a, b], fi = 0.4, fo = 0.4] of scenes) {
    if (t < a || t > b) continue;
    A(span(t, a, b, fi, fo), () => fn(t));
  }
  captions(t);
}

// Captions with balanced lines.
const CAP = { size: 42, lh: 56, weight: 700, maxW: 740 };
const capW = new Map();
function balanced(s) {
  if (capW.has(s)) return capW.get(s);
  font(CAP.weight, CAP.size);
  const words = s.split(' ').map((w) => ctx.measureText(w.replace(/[*~]/g, '')).width);
  const space = ctx.measureText(' ').width;
  const lines = (m) => { let n = 1, lw = 0, any = false; for (const w of words) { if (lw + w > m && any) { n++; lw = 0; } lw += w + space; any = true; } return n; };
  const n = lines(CAP.maxW);
  let lo = CAP.maxW / n - 1, hi = CAP.maxW;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (lines(mid) > n) lo = mid; else hi = mid; }
  capW.set(s, hi + 1);
  return hi + 1;
}
function captions(t) {
  for (const cue of CUES) {
    if (t < cue[0] || t > cue[1]) continue;
    k.captions(t, [cue], { x: W / 2 + 20, y: 852, maxW: balanced(cue[2]), size: CAP.size, lh: CAP.lh, weight: CAP.weight, family: SERIF, ink: C.ink, marks: { '*': C.red, '~': C.green } });
  }
}

Kit.scene({
  width: W, height: H, duration: 65,
  fonts: [
    { family: SERIF, file: 'LibreCaslonText-Regular.woff2', weight: '400' },
    { family: SERIF, file: 'LibreCaslonText-Bold.woff2', weight: '700' },
    { family: MONO, file: 'IBMPlexMono-Regular.woff2', weight: '400' },
    { family: MONO, file: 'IBMPlexMono-SemiBold.woff2', weight: '600' },
  ],
  draw(t, tools) { k = tools; ctx = tools.ctx; draw(t); },
});
