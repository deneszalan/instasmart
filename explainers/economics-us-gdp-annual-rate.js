// Explainer for economics-us-gdp-annual-rate: on 29 October 2026 the US Bureau of Economic Analysis (BEA) said
// real GDP grew "at an annual rate of 3.4 percent" in July–September 2026. In those three months it grew about
// 0.8%: the US writes a quarter's growth as the yearly pace it would make if it went on for four quarters.
// China's figure for the same quarter, 4.5%, is measured on another ruler (year on year). Look: a dark slate
// ledger with a faint graph-paper grid, GDP as a stack of bars, three coloured measuring tapes for the three
// rulers (mint: against the previous quarter, amber: annual rate, coral: against a year earlier). Azeret Mono for
// numbers, Rubik for captions and labels.
//
// Facts:
// - BEA, "GDP (Advance Estimate), 3rd Quarter 2026" (29 October 2026), bea.gov/news/2026/gdp-advance-estimate-
//   3rd-quarter-2026: "Real gross domestic product (GDP) increased at an annual rate of 3.4 percent" in the third
//   quarter; 2.2 percent in the second quarter; real GDP rose "0.8 percent at a quarterly rate"; "Percent changes
//   in quarterly seasonally adjusted series are displayed at annual rates, unless otherwise specified."
// - BEA FAQ 122, "Why does BEA publish percent changes in quarterly series at annual rates?": "for ease of
//   comparison"; an annual rate "shows what the percent change would be if the quarterly rate continued for four
//   quarters"; formula (((level of quarter 2 / level of quarter 1)^4) − 1) × 100; monthly series are published at
//   monthly rates because annual rates would "excessively exaggerate the month-to-month changes".
// - National Bureau of Statistics of China, "Preliminary Accounting Results of GDP for the Third Quarter of 2026"
//   (stats.gov.cn, 21 October 2026; headline release 19 October): Q3 GDP grew 4.5% year on year; quarter on
//   quarter (seasonally adjusted, over the previous quarter) 1.2%.
// - PBS NewsHour / AP (Paul Wiseman, 29 October 2026): 3.4% annualized from July through September; the first of
//   three Commerce Department estimates.
// Computed here: the quarterly growth behind 3.4% at an annual rate, 1.034^(1/4) − 1 ≈ 0.84% (BEA rounds it to
// 0.8%); the four imagined quarters 100 → 103.4; China's 1.2% as a US-style annual rate, 1.012^4 − 1 ≈ 4.9%
// (shown as computed, not as an official figure); 1% a quarter ≈ 4.1% a year.
//
// Scene plan (60.4 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: 3.4% "at an annual rate"; what real GDP is.
//  B  9.6–27.8  The quarter really grew ≈ 0.84%; four quarters in a row compound to 3.4%.
//  C 28.0–32.4  Why: comparison with whole years; a pace, not a forecast.
//  D 32.6–50.8  China's 4.5% is year on year; its quarter grew 1.2% (≈ 4.9% at an annual rate).
//  E 51.0–60.4  Three rulers for one quarter; check the ruler.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#10232b', bg2: '#081419', ink: '#eef6f3', soft: 'rgba(238,246,243,0.72)', faint: 'rgba(238,246,243,0.26)',
  line: 'rgba(238,246,243,0.10)', grid: 'rgba(125,211,192,0.07)',
  qoq: '#6ee7b7', qoqSoft: 'rgba(110,231,183,0.18)', ann: '#fbbf24', annSoft: 'rgba(251,191,36,0.18)',
  yoy: '#fb7185', yoySoft: 'rgba(251,113,133,0.18)', panel: 'rgba(0,0,0,0.30)', bar: '#2f6f73', bar2: '#3f8a8c',
};
const NUM = 'Azeret Mono', CAP = 'Rubik';

let k, ctx;
const font = (w, s, f = CAP) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the numbers ----------
const US_ANNUAL = 3.4; // BEA: % at an annual rate, Q3 2026
const US_QTR_BEA = 0.8; // BEA: % at a quarterly rate (rounded)
const CN_YOY = 4.5, CN_QOQ = 1.2; // NBS China, Q3 2026
/** A quarter's growth (%) written at an annual rate: compounded over four quarters. */
const annualise = (q) => (Math.pow(1 + q / 100, 4) - 1) * 100;
/** The quarterly growth (%) behind an annual rate. */
const deannualise = (a) => (Math.pow(1 + a / 100, 1 / 4) - 1) * 100;
const US_QTR = deannualise(US_ANNUAL); // ≈ 0.839
const CN_ANN = annualise(CN_QOQ); // ≈ 4.886
const LEVELS = [0, 1, 2, 3, 4].map((n) => 100 * Math.pow(1 + US_QTR / 100, n)); // 100 → 103.40
if (Math.abs(LEVELS[4] - 103.4) > 1e-9) throw new Error('four quarters should give 103.4');
if (US_QTR.toFixed(1) !== US_QTR_BEA.toFixed(1)) throw new Error('should round to BEA’s 0.8% a quarter');
const f2 = (v) => v.toFixed(2), f1 = (v) => v.toFixed(1);

const CUES = [
  [0.4, 4.8, `On 29 October 2026, the US said its economy grew at an ^annual rate^ of ${f1(US_ANNUAL)}% in July to September.`],
  [5.0, 9.4, 'The measure is real GDP: the value of all goods and services made, with price rises taken out.'],
  [9.6, 14.0, `From April–June to July–September, real GDP grew by about *${f1(US_QTR_BEA)}%*. Not ${f1(US_ANNUAL)}%.`],
  [14.2, 18.6, 'An ^annual rate^ asks: what if the economy grew like that for four quarters in a row?'],
  [18.8, 23.2, `Each quarter adds *${f2(US_QTR)}%* to a slightly bigger economy, so the growth compounds.`],
  [23.4, 27.8, `1.0084 × 1.0084 × 1.0084 × 1.0084 ≈ 1.034. That is the ^${f1(US_ANNUAL)}%^.`],
  [28.0, 32.4, 'It lets a quarter be compared with whole years. It is a pace, not a forecast.'],
  [32.6, 37.0, `In October, China said its economy grew ~${f1(CN_YOY)}%~ in July to September. Faster?`],
  [37.2, 41.6, `China’s ${f1(CN_YOY)}% compares the quarter with the same quarter a year before: ~year on year~.`],
  [41.8, 46.2, `Against the quarter before, China grew *${f1(CN_QOQ)}%*. At a US-style annual rate: about ^${f1(CN_ANN)}%^.`],
  [46.4, 50.8, `On the same ruler, the US grew *${f1(US_QTR_BEA)}%* in the quarter and China *${f1(CN_QOQ)}%*.`],
  [51.0, 55.4, 'One quarter, three rulers: against the last quarter, as an ^annual rate^, or against a ~year ago~.'],
  [55.6, 60.0, 'So before comparing two growth figures, check which ruler each one uses.'],
];

// ---------- background: a slate ledger with graph paper ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 12; x <= W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 790); g.stroke(); }
  for (let y = 18; y <= 790; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(200,255,240,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- small drawings ----------
function header(s, y = 132, color = C.soft) { font(600, 24); text(s, CX, y, { align: 'center', color, spacing: '3px' }); }
function chip(s, x, y, color, soft, size = 24) {
  font(700, size); const w = ctx.measureText(s).width + 28;
  ctx.fillStyle = soft; k.rrect(x - w / 2, y - size * 0.85, w, size * 1.7, size * 0.85); ctx.fill();
  text(s, x, y + 1, { align: 'center', color });
}
function arrowLine(x0, y0, x1, y1, color, w = 4, head = 14) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); ctx.closePath(); ctx.fill();
}
/** An arc from x0 to x1 above a baseline y, peaking h above it. */
function hop(x0, x1, y, h, color, p = 1, w = 5) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  const n = 40;
  for (let i = 0; i <= n * p; i++) {
    const u = i / n, x = lerp(x0, x1, u), yy = y - Math.sin(u * Math.PI) * h;
    i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
  }
  ctx.stroke();
  if (p >= 1) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y + 2); ctx.lineTo(x1 - 9, y - 14); ctx.lineTo(x1 + 7, y - 12); ctx.closePath(); ctx.fill(); }
}
/** A measuring tape: a coloured strip with ticks and a label. */
function tape(x, y, w, color, label, sub, a = 1) {
  A(a, () => {
    ctx.fillStyle = color; k.rrect(x, y - 22, w * a, 44, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i * 18 < w * a - 6; i++) { const xx = x + 10 + i * 18; ctx.beginPath(); ctx.moveTo(xx, y - 22); ctx.lineTo(xx, y - 22 + (i % 5 === 0 ? 20 : 11)); ctx.stroke(); }
    font(700, 26); text(label, x + 16, y + 6, { color: '#0b1a1f' });
    if (sub) { font(500, 22); text(sub, x + w + 16, y, { color: C.soft }); }
  });
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => { header('UNITED STATES · JULY–SEPTEMBER 2026'); header('BUREAU OF ECONOMIC ANALYSIS · 29 OCTOBER 2026', 170, C.faint); });
    const g = back(seg(t, 0.6, 1.6));
    const shrink = eio(seg(t, 4.8, 5.8));
    ctx.save(); ctx.translate(CX, lerp(380, 270, shrink)); ctx.scale(lerp(0.6, 1, g) * lerp(1, 0.55, shrink), lerp(0.6, 1, g) * lerp(1, 0.55, shrink));
    A(seg(t, 0.6, 1.2), () => { font(700, 210, NUM); text(`${f1(US_ANNUAL)}%`, 0, 0, { align: 'center', color: C.ann }); });
    A(seg(t, 1.6, 2.2), () => { font(600, 46); text('at an annual rate', 0, 140, { align: 'center', color: C.soft }); });
    ctx.restore();
    // real GDP: goods and services pour into one bar
    A(seg(t, 5.2, 5.8), () => {
      const items = ['cars', 'haircuts', 'software', 'bread', 'rent', 'concerts', 'trucks', 'doctors’ visits'];
      const bx = CX - 70, by0 = 690, bw = 140, bh = 230;
      items.forEach((s, i) => {
        const p = eio(seg(t, 5.6 + i * 0.22, 6.8 + i * 0.22));
        const sx = i % 2 ? 690 : 174, sy = 420 + Math.floor(i / 2) * 64;
        const x = lerp(sx, CX, p), y = lerp(sy, by0 - 40, p);
        A(1 - seg(p, 0.85, 1), () => chip(s, x, y, C.ink, 'rgba(238,246,243,0.12)', 22));
      });
      const fill = eout(seg(t, 6.0, 8.6));
      ctx.fillStyle = C.panel; k.rrect(bx, by0 - bh, bw, bh, 10); ctx.fill();
      ctx.fillStyle = C.bar2; k.rrect(bx, by0 - bh * fill, bw, bh * fill, 10); ctx.fill();
      font(700, 26); text('real GDP', CX, by0 + 26, { align: 'center', color: C.ink });
      font(500, 20); text('price rises taken out', CX, by0 + 54, { align: 'center', color: C.soft });
    });
  });
}

// ---------- B: one quarter, then four in a row ----------
const ST = { x0: 120, step: 140, base: 690, scale: 70, w: 104 }; // bars: 100 = base height; extra growth magnified
const barH = (lvl, mag) => 160 + (lvl - 100) * ST.scale * mag; // 100 → 160 px; each point above 100 → 70 px when magnified
function sceneStairs(t) {
  const a = span(t, 9.4, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('REAL GDP · APRIL–JUNE 2026 = 100');
    const mag = eio(seg(t, 11.0, 12.4)); // zoom into the top of the bars
    const ghosts = eout(seg(t, 14.4, 15.4));
    const grow = (i) => eio(seg(t, 19.0 + (i - 1) * 0.9, 19.9 + (i - 1) * 0.9));
    for (let i = 0; i < 5; i++) {
      const x = ST.x0 + i * ST.step;
      const real = i <= 1;
      const g = i === 0 ? 1 : i === 1 ? eout(seg(t, 9.8, 10.8)) : ghosts;
      if (g <= 0) continue;
      const lvl = i <= 1 ? LEVELS[i] : lerp(LEVELS[i - 1] ?? 100, LEVELS[i], grow(i));
      const h = barH(lvl, mag);
      A(g, () => {
        if (real) { ctx.fillStyle = i === 0 ? C.bar : C.bar2; k.rrect(x, ST.base - h, ST.w, h, 8); ctx.fill(); }
        else {
          ctx.setLineDash([10, 8]); ctx.strokeStyle = C.ann; ctx.lineWidth = 3; k.rrect(x, ST.base - h, ST.w, h, 8); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = C.annSoft; k.rrect(x, ST.base - h, ST.w, h, 8); ctx.fill();
        }
        font(600, 22); text(['Apr–Jun', 'Jul–Sep', 'if', 'if', 'if'][i], x + ST.w / 2, ST.base + 26, { align: 'center', color: real ? C.ink : C.ann });
        if (i >= 1) {
          const show = i === 1 ? seg(t, 10.6, 11.2) : seg(t, 19.6 + (i - 1) * 0.9, 20.0 + (i - 1) * 0.9);
          A(show, () => { font(700, 24, NUM); text(f2(lvl), x + ST.w / 2, ST.base - h - 22, { align: 'center', color: real ? C.qoq : C.ann }); });
        } else A(seg(t, 10.0, 10.6), () => { font(700, 24, NUM); text('100.00', x + ST.w / 2, ST.base - h - 22, { align: 'center', color: C.soft }); });
      });
    }
    // the cut in the bars: we zoom into the top
    A(mag, () => {
      ctx.fillStyle = C.bg1; ctx.fillRect(ST.x0 - 10, ST.base - 70, ST.step * 4 + ST.w + 20, 12);
      font(500, 20); text('bars cut: only their tops are shown, magnified', CX, ST.base + 58, { align: 'center', color: C.faint });
    });
    // the quarter's step
    A(seg(t, 11.6, 12.2) * (1 - seg(t, 18.6, 19.0)), () => {
      const x = ST.x0 + ST.step - 18, y0 = ST.base - barH(100, 1), y1 = ST.base - barH(LEVELS[1], 1);
      arrowLine(x, y0, x, y1 - 4, C.qoq, 4, 12);
      const lx = ST.x0 + (ST.step + ST.w) / 2;
      font(800, 34, NUM); text(`+${f2(US_QTR)}%`, lx, 380, { align: 'center', color: C.qoq });
      font(500, 20); text('in one quarter', lx, 414, { align: 'center', color: C.soft });
    });
    // step sizes of the four quarters
    A(seg(t, 21.8, 22.4) * (1 - seg(t, 23.2, 23.6)), () => {
      for (let i = 1; i <= 4; i++) {
        const d = LEVELS[i] - LEVELS[i - 1];
        font(600, 20, NUM); text(`+${f2(d)}`, ST.x0 + i * ST.step + ST.w / 2, 210, { align: 'center', color: i === 1 ? C.qoq : C.ann });
      }
      font(500, 20); text('points added each quarter', CX, 180, { align: 'center', color: C.soft });
    });
    // the product
    A(seg(t, 23.4, 24.0), () => {
      const y = 206;
      ctx.fillStyle = C.panel; k.rrect(60, y - 40, 744, 80, 14); ctx.fill();
      const terms = ['1.0084', '×', '1.0084', '×', '1.0084', '×', '1.0084', '≈', '1.034'];
      font(700, 28, NUM);
      let x = CX - (terms.reduce((s, w) => s + ctx.measureText(w).width, 0) + 14 * (terms.length - 1)) / 2;
      terms.forEach((s, i) => {
        A(seg(t, 23.6 + i * 0.12, 23.9 + i * 0.12), () => text(s, x, y, { color: i === 8 ? C.ann : s === '×' || s === '≈' ? C.soft : C.qoq }));
        x += ctx.measureText(s).width + 14;
      });
      A(seg(t, 25.2, 25.8), () => {
        const x4 = ST.x0 + 4 * ST.step + ST.w / 2, y4 = ST.base - barH(LEVELS[4], 1) + 34;
        chip(`+${f1(US_ANNUAL)}%`, x4, y4, '#1b1405', C.ann, 26);
      });
    });
  });
}

// ---------- C: why annual rates ----------
function sceneWhy(t) {
  const a = span(t, 27.8, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    header('ONE YEAR = FOUR QUARTERS');
    const x0 = 92, x1 = 772, y = 330, qw = (x1 - x0) / 4;
    for (let i = 0; i < 4; i++) {
      const g = eout(seg(t, 28.2 + i * 0.2, 28.8 + i * 0.2));
      A(g, () => {
        const x = x0 + i * qw;
        if (i === 0) { ctx.fillStyle = C.qoqSoft; k.rrect(x + 4, y - 50, qw - 8, 100, 10); ctx.fill(); }
        else { ctx.setLineDash([8, 7]); ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 3; k.rrect(x + 4, y - 50, qw - 8, 100, 10); ctx.stroke(); ctx.setLineDash([]); }
        font(700, 26, NUM); text(`+${f2(US_QTR)}%`, x + qw / 2, y, { align: 'center', color: i === 0 ? C.qoq : 'rgba(251,191,36,0.75)' });
        font(500, 22); text(i === 0 ? 'measured' : 'imagined', x + qw / 2, y + 74, { align: 'center', color: i === 0 ? C.qoq : C.soft });
      });
    }
    A(seg(t, 29.4, 30.0), () => { arrowLine(x0, y + 128, x1, y + 128, C.ann, 4, 14); font(700, 30, NUM); text(`= ${f1(US_ANNUAL)}% a year`, CX, y + 172, { align: 'center', color: C.ann }); });
    A(seg(t, 30.4, 31.0), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 590, 644, 120, 14); ctx.fill();
      font(700, 30); text('like a speedometer:', CX, 628, { align: 'center', color: C.ink });
      font(500, 26); text('it states a short stretch as a pace', CX, 672, { align: 'center', color: C.soft });
    });
  });
}

// ---------- D: China ----------
const TL = { x0: 104, x1: 760, y: 470 };
const tlx = (i) => lerp(TL.x0, TL.x1, i / 4);
const QLAB = ['Jul–Sep 2025', 'Oct–Dec', 'Jan–Mar 2026', 'Apr–Jun', 'Jul–Sep 2026'];
function sceneChina(t) {
  const a = span(t, 32.4, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    // two headline cards
    const lift = eio(seg(t, 36.8, 37.8));
    const cy = lerp(330, 186, lift), sc = lerp(1, 0.62, lift);
    const card = (x, flag, big, sub, col) => {
      ctx.save(); ctx.translate(x, cy); ctx.scale(sc, sc);
      ctx.fillStyle = C.panel; k.rrect(-170, -130, 340, 260, 18); ctx.fill();
      font(700, 30); text(flag, 0, -84, { align: 'center', color: C.ink });
      font(700, 96, NUM); text(big, 0, 0, { align: 'center', color: col });
      font(500, 26); text(sub, 0, 80, { align: 'center', color: col });
      ctx.restore();
    };
    A(eout(seg(t, 32.8, 33.6)), () => card(232, 'United States', `${f1(US_ANNUAL)}%`, 'annual rate', C.ann));
    A(eout(seg(t, 33.6, 34.4)), () => card(632, 'China', `${f1(CN_YOY)}%`, lift > 0.5 ? 'year on year' : '?', C.yoy));
    if (t < 37.0) A(seg(t, 34.6, 35.2), () => { font(500, 26); text('July–September 2026, same three months', CX, 520, { align: 'center', color: C.soft }); });
    // the timeline of five quarters
    A(seg(t, 37.4, 38.0), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(TL.x0 - 30, TL.y); ctx.lineTo(TL.x1 + 30, TL.y); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i === 0 || i === 4 ? C.ink : C.soft; ctx.beginPath(); ctx.arc(tlx(i), TL.y, i === 4 ? 10 : 7, 0, 7); ctx.fill();
        font(i === 4 || i === 0 ? 700 : 500, 19); text(QLAB[i], tlx(i), TL.y + 32, { align: 'center', color: i === 4 || i === 0 ? C.ink : C.soft });
      }
    });
    // year on year: the long hop
    A(seg(t, 38.0, 38.4), () => {
      hop(tlx(0), tlx(4), TL.y - 14, 100, C.yoy, eio(seg(t, 38.0, 39.4)));
      A(seg(t, 39.2, 39.8), () => { font(800, 32, NUM); text(`+${f1(CN_YOY)}%`, CX, TL.y - 172, { align: 'center', color: C.yoy }); font(500, 22); text('against the same quarter a year before', CX, TL.y - 138, { align: 'center', color: C.yoy }); });
    });
    // quarter on quarter: the short hop
    A(seg(t, 42.0, 42.4), () => {
      hop(tlx(3), tlx(4), TL.y - 14, 70, C.qoq, eio(seg(t, 42.0, 43.0)));
      A(seg(t, 42.8, 43.3), () => { font(800, 30, NUM); text(`+${f1(CN_QOQ)}%`, tlx(3.5), TL.y + 96, { align: 'center', color: C.qoq }); font(500, 20); text('against the quarter before', tlx(3.5), TL.y + 128, { align: 'center', color: C.qoq }); });
      A(seg(t, 44.0, 44.6), () => {
        font(500, 22); text(`1.012 four times over ≈ ${(1 + CN_ANN / 100).toFixed(3)}`, tlx(1.2), TL.y + 96, { align: 'center', color: C.soft });
        font(800, 30, NUM); text(`≈ ${f1(CN_ANN)}% annual rate`, tlx(1.2), TL.y + 136, { align: 'center', color: C.ann });
        font(500, 18); text('(computed, not an official figure)', tlx(1.2), TL.y + 168, { align: 'center', color: C.faint });
      });
    });
    // the same ruler
    A(seg(t, 46.4, 46.9), () => {
      ctx.fillStyle = 'rgba(8,20,25,0.92)'; ctx.fillRect(0, 380, W, 400);
      const y0 = 440;
      font(700, 24); text('July–September 2026', 90, y0, { color: C.soft }); text('United States', 520, y0, { align: 'center', color: C.ink }); text('China', 712, y0, { align: 'center', color: C.ink });
      const rows = [['against the last quarter', f1(US_QTR_BEA), f1(CN_QOQ), C.qoq], ['at an annual rate', f1(US_ANNUAL), `≈${f1(CN_ANN)}`, C.ann], ['against a year ago', '—', f1(CN_YOY), C.yoy]];
      rows.forEach(([lab, us, cn, col], i) => {
        const y = y0 + 70 + i * 82;
        A(seg(t, 46.6 + i * 0.3, 47.0 + i * 0.3), () => {
          ctx.fillStyle = C.panel; k.rrect(60, y - 32, 744, 64, 12); ctx.fill();
          ctx.fillStyle = col; k.rrect(60, y - 32, 10, 64, 4); ctx.fill();
          font(600, 24); text(lab, 90, y, { color: col });
          font(700, 30, NUM); text(us === '—' ? '—' : `${us}%`, 520, y, { align: 'center', color: us === '—' ? C.faint : C.ink }); text(`${cn}%`, 712, y, { align: 'center', color: C.ink });
        });
      });
    });
  });
}

// ---------- E: three rulers ----------
function sceneRulers(t) {
  const a = eout(seg(t, 50.8, 51.6));
  if (a <= 0) return;
  A(a, () => {
    header('ONE QUARTER · THREE RULERS');
    const rows = [
      [C.qoq, 'vs the last quarter', `US ${f1(US_QTR_BEA)}% · China ${f1(CN_QOQ)}%`],
      [C.ann, 'annual rate', `US ${f1(US_ANNUAL)}%`],
      [C.yoy, 'vs a year ago', `China ${f1(CN_YOY)}%`],
    ];
    rows.forEach(([col, lab, val], i) => {
      const y = 250 + i * 130;
      const g = eout(seg(t, 51.2 + i * 0.35, 52.0 + i * 0.35));
      tape(90, y, 330, col, lab, '', g);
      A(seg(t, 51.8 + i * 0.35, 52.3 + i * 0.35), () => { font(700, 28, NUM); text(val, 450, y, { color: C.ink }); });
    });
    A(seg(t, 56.0, 56.6), () => {
      ctx.fillStyle = C.panel; k.rrect(110, 628, 644, 96, 14); ctx.fill();
      font(700, 30); text('check the ruler before you compare', CX, 676, { align: 'center', color: C.ink });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60.4, fonts: [NUM, CAP],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneStairs(t);
    sceneWhy(t);
    sceneChina(t);
    sceneRulers(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 600, family: CAP, ink: C.ink, marks: { '*': C.qoq, '^': C.ann, '~': C.yoy } });
  },
});
