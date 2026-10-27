// Explainer for politics-strait-of-hormuz-oil: why a strait 39 km wide moves the world price of oil. Look: a
// night-sea chart with a schematic strait (not to scale), tankers in two shipping lanes, amber oil, then the
// daily Brent price of 2026 and a steep demand curve. Saira (squarish, nautical-instrument numbers) and IBM
// Plex Sans for captions.
//
// Facts: US EIA, "Amid regional conflict, the Strait of Hormuz remains critical oil chokepoint" (16 June 2025):
// oil flow through the strait averaged 20 million barrels a day in 2024, about 20% of global petroleum liquids
// consumption; about 2.6 million b/d of Saudi and UAE pipeline capacity could be available to bypass it.
// Wikipedia, "Strait of Hormuz": 39 km (21 nmi) wide at its narrowest; inbound and outbound lanes each 2 nmi
// (3.7 km) wide. Enerdata / IEA (11 March 2026): the conflict that began on 28 February 2026 sharply reduced oil
// flows through the strait; IEA members agreed to release 400 million barrels from emergency stocks, the
// largest such release. EIA daily Europe Brent spot price (RBRTED), copied below: $71.32 on 27 February 2026,
// first above $100 on 12 March ($102.38), highest $138.21 on 7 April, $118.82 and $115.22 in the last two days
// listed (19–20 October). Hamilton, "Causes and Consequences of the Oil Shock of 2007–08" (Brookings Papers,
// 2009), Table 1: short-run price elasticity of crude oil demand about 0.05 (Cooper 2003, average of 23
// countries) to 0.07 (Dahl 1993).
// Computed here: 20 / 0.20 = about 100 million barrels a day used worldwide; 138.21 / 71.32 = 1.94; with a
// constant elasticity of 0.05, 1% less oil needs a price 0.99^(−20) = 1.22 times higher, and the price doubles
// at a shortfall of 1 − 2^(−0.05) = 3.4%; 400 million barrels = 20 days of the strait's pre-war flow.
// The model is the simplest one: demand alone adjusts; stocks, pipelines and other suppliers are left out.
//
// Scene plan (60 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.0  Hook: the strait, tankers, 20 million barrels a day, a fifth of world use.
//  B  9.0–23.6  Two 3.7 km lanes; bypass pipelines 2.6 million b/d; 28 February 2026.
//  C 23.6–37.6  Brent, day by day: $71 to over $100 in two weeks; 400 million barrels; $138 on 7 April.
//  D 37.6–56.0  Why: elasticity 0.05; 1% less oil, +22%; 3.4% less, double.
//  E 56.0–60.0  Still above $110 in late October.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  sea: '#06202b', sea2: '#0b3140', land: '#163238', land2: '#1f4046', coast: '#c7a66d', ink: '#eef6f6', soft: 'rgba(238,246,246,0.72)',
  faint: 'rgba(238,246,246,0.28)', grid: 'rgba(120,200,210,0.08)', oil: '#f2a33a', oilSoft: 'rgba(242,163,58,0.25)', lane: '#4cc9d9', hull: '#d9573b', red: '#ff7a5c',
};
const NUM = 'Saira', SANS = 'IBM Plex Sans';

let k, ctx;
const font = (w, s, f = NUM) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- numbers ----------
const FLOW = 20, SHARE = 0.2, WORLD = FLOW / SHARE; // million barrels a day
const BYPASS = 2.6, STOCKS = 400, STOCK_DAYS = STOCKS / FLOW; // 20 days
const EPS = 0.05;
const priceFactor = (cut) => Math.pow(1 - cut, -1 / EPS);
const ONE_PCT = priceFactor(0.01); // 1.22
const DOUBLE_AT = 1 - Math.pow(2, -EPS); // 3.4%

// ---------- EIA daily Brent spot, 2026, by week (Monday first); Monday holidays leave four values ----------
const WEEKS = [
  ['01-05', [63.00, 62.10, 61.08, 63.34, 65.11]], ['01-12', [65.40, 67.58, 68.87, 66.16, 66.97]], ['01-19', [66.91, 67.68, 66.72, 65.46, 68.16]],
  ['01-26', [67.70, 70.28, 70.90, 71.00, 72.25]], ['02-02', [67.72, 70.01, 71.15, 69.87, 70.45]], ['02-09', [71.19, 71.01, 71.52, 69.80, 69.96]],
  ['02-16', [70.81, 69.77, 71.78, 73.17, 72.75]], ['02-23', [71.90, 71.21, 70.69, 71.66, 71.32]], ['03-02', [77.24, 83.28, 81.56, 88.59, 95.74]],
  ['03-09', [94.35, 89.84, 90.98, 102.38, 103.23]], ['03-16', [101.04, 108.39, 118.09, 111.05, 118.42]], ['03-23', [103.79, 108.42, 109.14, 113.39, 121.47]],
  ['03-30', [121.88, 126.69, 119.56, 127.61], 'fri'], ['04-06', [138.21, 122.11, 119.03, 119.07]], ['04-13', [123.28, 118.69, 114.93, 116.63, 98.63]],
  ['04-20', [103.40, 106.14, 113.44, 113.25, 111.86]], ['04-27', [113.89, 117.62, 124.16, 124.24, 118.26]], ['05-04', [114.51, 103.70, 101.82, 103.48]],
  ['05-11', [106.11, 111.37, 110.28, 110.91, 113.96]], ['05-18', [116.73, 114.64, 108.93, 105.84, 106.90]], ['05-25', [102.75, 97.11, 95.47, 92.88]],
  ['06-01', [98.29, 98.49, 101.69, 98.98, 97.29]], ['06-08', [97.46, 94.15, 95.73, 92.84, 88.64]], ['06-15', [84.36, 80.50, 80.33, 79.35, 80.46]],
  ['06-22', [76.49, 75.69, 72.09, 73.74, 70.16]], ['06-29', [71.59, 70.46, 69.24, 68.53, 68.68]], ['07-06', [69.56, 71.78, 76.50, 74.46, 74.34]],
  ['07-13', [81.62, 83.69, 83.08, 81.23, 85.01]], ['07-20', [86.99, 93.85, 94.12, 105.32, 100.31]], ['07-27', [91.82, 85.51, 91.95, 91.91, 96.95]],
  ['08-03', [88.90, 86.47, 86.65, 89.65, 87.62]], ['08-10', [92.74, 93.26, 92.52, 92.03, 92.02]], ['08-17', [92.43, 95.29, 92.37, 94.00, 96.92]],
  ['08-24', [92.71, 88.24, 87.77, 90.18, 89.75]], ['08-31', [96.02, 97.59, 100.52, 102.24]], ['09-07', [104.47, 106.12, 109.51, 120.98, 118.06]],
  ['09-14', [121.25, 130.80, 127.84, 121.18, 119.66]], ['09-21', [116.15, 114.89, 117.45, 120.92, 116.01]], ['09-28', [119.97, 113.96, 115.91, 114.82, 135.51]],
  ['10-05', [125.51, 125.44, 126.00, 130.18, 130.03]], ['10-12', [129.95, 125.78, 126.55, 126.35, 119.33]], ['10-19', [118.82, 115.22], 'end'],
];
const DAY = (md) => { const [m, d] = md.split('-').map(Number); return (Date.UTC(2026, m - 1, d) - Date.UTC(2026, 0, 1)) / 864e5; };
const PRICES = WEEKS.flatMap(([md, vals, how]) => {
  const first = how === 'fri' || how === 'end' || vals.length === 5 ? 0 : 1; // a short week lost its Monday, except Good Friday's
  return vals.map((p, i) => ({ day: DAY(md) + first + i, p }));
});
const at = (md) => PRICES.find((x) => x.day === DAY(md)).p;
const PREWAR = at('02-27'), FIRST100 = PRICES.find((x) => x.p > 100), PEAK = PRICES.reduce((a, b) => (b.p > a.p ? b : a));
const LAST = PRICES.slice(-2);
if (PEAK.day !== DAY('04-07') || FIRST100.day !== DAY('03-12')) throw new Error('Brent dates are off');

// ---------- timeline ----------
const CUES = [
  [0.4, 4.6, `Before 2026, about *${FLOW} million barrels* of oil a day passed through the Strait of Hormuz.`],
  [4.8, 9.0, 'That’s about *a fifth* of all the oil the world uses, through a gap 39 km wide.'],
  [9.2, 13.6, 'Ships keep to two lanes, each about ~3.7 km~ wide: one in, one out.'],
  [13.8, 18.2, `Pipelines can carry about *${BYPASS} million* barrels a day around it, a US agency estimated.`],
  [18.4, 23.6, 'When war broke out between Iran and the US and Israel on 28 February, flows were sharply cut.'],
  [23.8, 28.2, `Brent crude went from about *$${Math.round(PREWAR)}* a barrel to over $100 within two weeks.`],
  [28.4, 33.0, `On 11 March, International Energy Agency members agreed to release *${STOCKS} million* barrels.`],
  [33.2, 37.6, `Even so, on 7 April it reached *$${Math.round(PEAK.p)}*, nearly double its pre-war price.`],
  [37.8, 42.2, 'Why such a jump? In the short run, people can’t quickly use much less oil.'],
  [42.4, 46.8, 'Economists estimate that a 10% higher price cuts use by only about ~0.5%~ at first.'],
  [47.0, 51.4, `Run that backwards: for buyers to use 1% less, the price must rise about *${Math.round((ONE_PCT - 1) * 100)}%*.`],
  [51.6, 55.8, `In that simple model, a shortfall of just *${(DOUBLE_AT * 100).toFixed(1)}%* doubles the price.`],
  [56.0, 60.0, `In late October, Brent was still above *$${Math.floor(Math.min(...LAST.map((x) => x.p)) / 10) * 10}* a barrel.`],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.sea2); lg.addColorStop(1, C.sea);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = C.grid; g.lineWidth = 1.5;
  for (let x = 0; x <= W; x += 72) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 72) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(140,210,220,${0.02 + r() * 0.04})`; g.lineWidth = 1.5; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 3, x + 16, y); g.stroke(); }
}

// ---------- the schematic strait ----------
const NORTH = [[0, 170], [0, 330], [120, 346], [250, 362], [360, 372], [430, 352], [500, 318], [600, 292], [720, 300], [864, 318], [864, 170]];
const SOUTH = [[0, 680], [0, 560], [130, 548], [250, 560], [340, 540], [400, 492], [440, 432], [462, 412], [486, 430], [520, 486], [600, 548], [730, 590], [864, 600], [864, 680]];
const LANE = [[0, 456], [200, 452], [330, 440], [420, 400], [470, 372], [560, 350], [700, 366], [864, 400]];
function poly(pts, fill, edge) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke(); }
}
function along(path, u, off = 0) {
  const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1])), total = lens.reduce((a, b) => a + b, 0);
  let d = clamp(u) * total, i = 0;
  while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++; }
  const [x0, y0] = path[i], [x1, y1] = path[i + 1], f = d / lens[i], ang = Math.atan2(y1 - y0, x1 - x0);
  return { x: lerp(x0, x1, f) - Math.sin(ang) * off, y: lerp(y0, y1, f) + Math.cos(ang) * off, ang };
}
function tanker(x, y, ang, s = 1, a = 1) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    ctx.fillStyle = C.hull; ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(20, -8); ctx.lineTo(30, 0); ctx.lineTo(20, 8); ctx.lineTo(-26, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ink; ctx.fillRect(-24, -5, 9, 10);
    ctx.fillStyle = C.oil; ctx.fillRect(-12, -3, 26, 6);
    ctx.restore();
  });
}
function strait(t, traffic) {
  poly(NORTH, C.land, C.coast); poly(SOUTH, C.land2, C.coast);
  font(600, 24); text('IRAN', 300, 250, { align: 'center', base: 'middle', color: C.soft, spacing: '4px' });
  text('OMAN · UAE', 660, 648, { align: 'center', base: 'middle', color: C.soft, spacing: '3px' });
  font(500, 22); text('Persian Gulf', 120, 500, { base: 'middle', color: C.faint }); text('Gulf of Oman', 744, 470, { align: 'right', base: 'middle', color: C.faint });
  // the two lanes
  ctx.strokeStyle = 'rgba(76,201,217,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
  for (const off of [-14, 14]) { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const p = along(LANE, i / 60, off); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke(); }
  ctx.setLineDash([]);
  // tankers: outbound (west to east) on one lane, inbound on the other
  const n = 8;
  for (let i = 0; i < n; i++) {
    const keep = i / n < traffic;
    const u1 = ((t * 0.045 + i / n) % 1), u2 = 1 - ((t * 0.04 + (i + 0.5) / n) % 1);
    const p = along(LANE, u1, 14), q = along(LANE, u2, -14);
    if (keep) { tanker(p.x, p.y, p.ang, 0.9); tanker(q.x, q.y, q.ang + Math.PI, 0.9, 0.85); }
  }
  font(500, 20); text('schematic, not to scale', 840, 662, { align: 'right', base: 'middle', color: C.faint });
}

// ---------- scenes ----------
const CX = W / 2;
function sceneMap(t) {
  const a = 1 - seg(t, 23.4, 24.0);
  if (a <= 0) return;
  A(a, () => {
    const traffic = 1 - 0.8 * eio(seg(t, 18.8, 21.0));
    ctx.save(); ctx.translate(0, -30);
    strait(t, traffic);
    // the narrow gap
    A(span(t, 4.9, 9.2), () => {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(452, 404); ctx.lineTo(438, 358); ctx.stroke();
      font(700, 24); text('39 km', 420, 396, { align: 'right', base: 'middle', color: C.ink });
    });
    A(span(t, 9.2, 13.8), () => { font(700, 24); text('in', 40, 424, { base: 'middle', color: C.lane }); text('out', 40, 490, { base: 'middle', color: C.lane }); });
    // bypass pipelines on land
    A(span(t, 13.8, 18.6), () => {
      const p = eio(seg(t, 14.0, 15.4));
      ctx.strokeStyle = C.oil; ctx.lineWidth = 7; ctx.setLineDash([16, 8]);
      ctx.beginPath(); ctx.moveTo(140, 588); ctx.quadraticCurveTo(lerp(140, 420, p), 618, lerp(140, 720, p), lerp(588, 606, p)); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    const box = (x, y, w, h) => { ctx.fillStyle = 'rgba(6,32,43,0.88)'; k.rrect(x, y, w, h, 14); ctx.fill(); };
    A(span(t, 0.6, 4.8), () => { box(250, 668, 364, 76); font(700, 40); text(`${FLOW} million b/d`, CX, 706, { align: 'center', base: 'middle', color: C.oil }); });
    // a fifth of world use: 10 barrels, 2 lit
    A(span(t, 4.9, 9.2), () => {
      box(150, 660, 564, 104);
      for (let i = 0; i < 10; i++) {
        const x = 198 + i * 52, on = i < Math.round(SHARE * 10);
        ctx.fillStyle = on ? C.oil : C.faint; k.rrect(x - 15, 674, 30, 42, 6); ctx.fill();
        ctx.fillStyle = 'rgba(6,32,43,0.5)'; ctx.fillRect(x - 15, 685, 30, 3); ctx.fillRect(x - 15, 704, 30, 3);
      }
      font(600, 22); text(`${FLOW} of ~${WORLD} million barrels a day, 2024`, CX, 740, { align: 'center', base: 'middle', color: C.soft });
    });
    A(span(t, 9.2, 13.8), () => { box(232, 668, 400, 76); font(700, 30); text('2 lanes × 3.7 km', CX, 706, { align: 'center', base: 'middle', color: C.lane }); });
    A(span(t, 13.8, 18.6), () => {
      box(150, 660, 564, 104);
      const L = 190, R = 674;
      ctx.fillStyle = C.faint; ctx.fillRect(L, 680, R - L, 22);
      ctx.fillStyle = C.oil; ctx.fillRect(L, 680, (R - L) * (BYPASS / FLOW) * eout(seg(t, 14.6, 15.6)), 22);
      font(600, 22); text(`pipelines ${BYPASS} vs strait ${FLOW} million b/d`, CX, 736, { align: 'center', base: 'middle', color: C.soft });
    });
    A(span(t, 18.4, 23.8), () => { box(232, 668, 400, 76); font(700, 32); text('28 February 2026', CX, 706, { align: 'center', base: 'middle', color: C.red }); });
  });
}

// the price chart
const PC = { L: 120, R: 790, top: 190, bot: 640, d0: 0, d1: DAY('10-24'), p0: 50, p1: 150 };
const px = (d) => PC.L + ((d - PC.d0) / (PC.d1 - PC.d0)) * (PC.R - PC.L);
const py = (p) => PC.bot - ((p - PC.p0) / (PC.p1 - PC.p0)) * (PC.bot - PC.top);
function priceChart(upto, a = 1) {
  A(a, () => {
    font(500, 22);
    for (const p of [50, 75, 100, 125, 150]) {
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PC.L, py(p)); ctx.lineTo(PC.R, py(p)); ctx.stroke();
      text(`$${p}`, PC.L - 12, py(p), { align: 'right', base: 'middle', color: C.soft });
    }
    for (const [md, l] of [['01-01', 'Jan'], ['03-01', 'Mar'], ['05-01', 'May'], ['07-01', 'Jul'], ['09-01', 'Sep']]) text(l, px(DAY(md)), PC.bot + 26, { align: 'center', base: 'middle', color: C.soft });
    // 28 February
    ctx.strokeStyle = 'rgba(255,122,92,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(px(DAY('02-28')), PC.top); ctx.lineTo(px(DAY('02-28')), PC.bot); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.oil; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath();
    let started = false;
    for (const x of PRICES) { if (x.day > upto) break; started ? ctx.lineTo(px(x.day), py(x.p)) : ctx.moveTo(px(x.day), py(x.p)); started = true; }
    ctx.stroke();
  });
}
function dotLabel(d, p, s, side = 'right', col = C.ink) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px(d), py(p), 8, 0, Math.PI * 2); ctx.fill();
  font(700, 26); text(s, px(d) + (side === 'right' ? 16 : -16), py(p) - 20, { align: side === 'right' ? 'left' : 'right', base: 'middle', color: col });
}
function scenePrice(t) {
  const a = span(t, 23.8, 37.8, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 30); text('Brent crude, daily, 2026', CX, 140, { align: 'center', base: 'middle' });
    const upto = t < 28.4 ? lerp(0, DAY('03-13'), eio(seg(t, 24.0, 26.6))) : t < 33.2 ? DAY('03-13') : lerp(DAY('03-13'), DAY('04-10'), eio(seg(t, 33.2, 34.6)));
    priceChart(upto);
    A(seg(t, 24.6, 25.2), () => dotLabel(DAY('02-27'), PREWAR, `$${PREWAR.toFixed(0)}`, 'left', C.ink));
    A(seg(t, 26.4, 27.0), () => dotLabel(FIRST100.day, FIRST100.p, `$${FIRST100.p.toFixed(0)} · 12 Mar`, 'right', C.oil));
    // the stock release
    A(span(t, 28.4, 33.4), () => {
      ctx.fillStyle = 'rgba(6,32,43,0.9)'; k.rrect(400, 420, 380, 170, 14); ctx.fill();
      ctx.strokeStyle = C.lane; ctx.lineWidth = 2; k.rrect(400, 420, 380, 170, 14); ctx.stroke();
      font(800, 52); text(`${STOCKS} M`, 590, 476, { align: 'center', base: 'middle', color: C.lane });
      font(500, 22); text('barrels from emergency stocks', 590, 520, { align: 'center', base: 'middle', color: C.soft });
      text(`= ${STOCK_DAYS} days of the strait’s oil`, 590, 556, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 34.6, 35.2), () => dotLabel(PEAK.day, PEAK.p, `$${PEAK.p.toFixed(0)} · 7 Apr`, 'right', C.red));
    A(seg(t, 35.0, 35.6), () => { font(700, 26); text(`×${(PEAK.p / PREWAR).toFixed(2)}`, px(PEAK.day) + 16, py(PEAK.p) + 20, { base: 'middle', color: C.red }); });
    font(500, 20); text('EIA, Europe Brent spot price, $ a barrel', PC.R, PC.bot + 60, { align: 'right', base: 'middle', color: C.faint });
  });
}

// the demand curve: quantity (% of normal use) against price
const DC = { L: 150, R: 770, top: 190, bot: 640, q0: 94, q1: 101, p1: 3.0 };
const dx = (q) => DC.L + ((q - DC.q0) / (DC.q1 - DC.q0)) * (DC.R - DC.L);
const dy = (f) => DC.bot - ((f - 0.5) / (DC.p1 - 0.5)) * (DC.bot - DC.top);
function sceneDemand(t) {
  const a = span(t, 37.8, 56.2, 0.5, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(700, 30); text('Short-run demand for oil', CX, 140, { align: 'center', base: 'middle' });
    font(500, 22);
    for (const f of [1, 1.5, 2, 2.5, 3]) {
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(DC.L, dy(f)); ctx.lineTo(DC.R, dy(f)); ctx.stroke();
      text(`×${f}`, DC.L - 12, dy(f), { align: 'right', base: 'middle', color: C.soft });
    }
    for (const q of [94, 96, 98, 100]) text(`${q}%`, dx(q), DC.bot + 26, { align: 'center', base: 'middle', color: C.soft });
    text('oil used, % of normal', CX, DC.bot + 60, { align: 'center', base: 'middle', color: C.faint });
    text('price', DC.L - 12, DC.top - 30, { align: 'right', base: 'middle', color: C.faint });
    // the curve, drawn in
    const g = eio(seg(t, 38.0, 40.0));
    ctx.strokeStyle = C.lane; ctx.lineWidth = 5; ctx.beginPath();
    let first = true;
    for (let q = DC.q1; q >= lerp(DC.q1, 95.6, g); q -= 0.05) {
      const f = Math.pow(q / 100, -1 / EPS);
      if (f > DC.p1) break;
      first ? ctx.moveTo(dx(q), dy(f)) : ctx.lineTo(dx(q), dy(f)); first = false;
    }
    ctx.stroke();
    // the point: today's price at 100%, then 1% less, then the doubling
    const cut = t < 47.0 ? 0 : t < 51.6 ? 0.01 * eio(seg(t, 47.2, 48.6)) : lerp(0.01, DOUBLE_AT, eio(seg(t, 51.8, 53.2)));
    const q = 100 * (1 - cut), f = priceFactor(cut);
    A(seg(t, 39.6, 40.2), () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(dx(q), DC.bot); ctx.lineTo(dx(q), dy(f)); ctx.lineTo(DC.L, dy(f)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.oil; ctx.beginPath(); ctx.arc(dx(q), dy(f), 11, 0, Math.PI * 2); ctx.fill();
    });
    A(span(t, 42.4, 47.0), () => {
      ctx.fillStyle = 'rgba(6,32,43,0.9)'; k.rrect(462, 214, 310, 120, 14); ctx.fill();
      k.font(700, 50, SANS); text(`ε ≈ ${EPS}`, 617, 262, { align: 'center', base: 'middle', color: C.lane });
      k.font(500, 22, SANS); text('+10% price → −0.5% use', 617, 310, { align: 'center', base: 'middle', color: C.soft });
    });
    A(seg(t, 47.4, 48.0), () => {
      font(800, 34); text(`price +${Math.round((f - 1) * 100)}%`, dx(q) + 24, dy(f) - 58, { base: 'middle', color: C.oil });
      font(600, 24); text(`${(cut * 100).toFixed(1)}% less oil`, dx(q) + 24, dy(f) - 22, { base: 'middle', color: C.soft });
    });
    A(seg(t, 53.0, 53.6), () => { font(600, 22); text('only demand adjusts here: no stocks, no other routes', CX, 746, { align: 'center', base: 'middle', color: C.soft }); });
  });
}

function sceneEnd(t) {
  const a = eout(seg(t, 56.0, 56.8));
  if (a <= 0) return;
  A(a, () => {
    font(700, 30); text('Brent crude, daily, 2026', CX, 140, { align: 'center', base: 'middle' });
    priceChart(lerp(DAY('04-10'), PC.d1, eio(seg(t, 56.2, 58.4))));
    A(seg(t, 58.2, 58.8), () => { dotLabel(LAST[1].day, LAST[1].p, '', 'left', C.oil); font(700, 26); text(`$${LAST[1].p.toFixed(0)} · 20 Oct`, px(LAST[1].day) + 8, 512, { align: 'right', base: 'middle', color: C.oil }); ctx.strokeStyle = C.oil; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px(LAST[1].day), py(LAST[1].p) + 10); ctx.lineTo(px(LAST[1].day), 494); ctx.stroke(); });
    font(500, 20); text('EIA, Europe Brent spot price, $ a barrel', PC.R, PC.bot + 60, { align: 'right', base: 'middle', color: C.faint });
  });
}

Kit.scene({
  width: W, height: H, duration: 60, fonts: [NUM, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneMap(t);
    scenePrice(t);
    sceneDemand(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 760, size: 42, weight: 700, family: SANS, ink: C.ink, marks: { '*': C.oil, '~': C.lane } });
  },
});
