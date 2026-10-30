// Explainer for chemistry-decaf-coffee-caffeine-removal: how decaffeinated coffee is made. All methods work on
// green (raw) beans: steam or hot water swells them, then a liquid that dissolves caffeine takes it out, while the
// flavour molecules stay in or are put back. Look: a dark espresso-brown burlap sack, sage-green beans, caffeine as
// gold hexagons, flavour molecules as rose dots, liquids in sky blue, an amber extract, lavender CO₂ and black
// carbon filters. Fraunces for headings and numbers, Fira Sans for captions and labels.
//
// Facts:
// - Molecules 26:3402 (2021, Muchtaridi et al., https://pmc.ncbi.nlm.nih.gov/articles/PMC8200017/): robusta
//   coffee contains 1.7–4.0% caffeine, Arabica 0.8–1.4% (said here as "roughly 1%").
// - PubChem, caffeine (CID 2519), solubility: "1 gm dissolves in 46 mL water, 5.5 mL water at 80 °C, 1.5 mL
//   boiling water"; in water 2.16×10⁴ mg/L at 25 °C (so the 46 mL is at room temperature).
// - Max Planck Society, "Coffee withdrawal" (13 August 2014, https://www.mpg.de/8365156/coffee-decaffeination-processes):
//   Bremen coffee merchant Ludwig Roselius used benzene as the solvent, patented his process in 1905 and founded
//   Kaffee HAG the following year; by 1970 dichloromethane and ethyl acetate had long replaced benzene; Kurt Zosel
//   of the Max Planck Institute for Coal Research noticed in 1967 that caffeine dissolves in supercritical CO₂ and
//   registered his decaffeination process for a patent three years later; in the patent the beans are first
//   moistened with steam and hot water so that they swell, CO₂ is made supercritical at 70 °C and 162 bar, pumped
//   through a water bath and then the beans, draws the caffeine out, and passes through an activated carbon filter
//   that captures the caffeine; the process is used on 100,000 tonnes of raw material a year.
// - NIST Chemistry WebBook, carbon dioxide: critical temperature 304.18 K (31.0 °C), critical pressure 73.80 bar.
// - Coffee Review, Kenneth Davids, "Fun without the Buzz: Decaffeination Processes and Issues" (2002,
//   https://www.coffeereview.com/fun-without-the-buzz-decaffeination-processes-and-issues/): coffee is decaffeinated
//   green, before roasting; the direct solvent process opens the beans' pores by steaming, applies the solvent
//   directly and removes solvent and caffeine by further steaming; the indirect process soaks the beans in hot water,
//   which removes virtually everything, strips the caffeine from the water with the solvent and reunites the water
//   with the beans, which soak up the flavour components again; with both, the caffeine is sold to makers of
//   pharmaceuticals and soft drinks; solvents in use are methylene chloride and ethyl acetate; ethyl acetate is found
//   naturally in fruit, so such coffees may be called "naturally decaffeinated"; in the Swiss Water process the
//   flavour-charged water can take up caffeine but no more flavour; compressed CO₂ behaves partly like a gas and
//   partly like a liquid and combines selectively with caffeine, which activated charcoal filters strip from it.
// - Swiss Water Decaffeinated Coffee Inc., "The Swiss Water Process" (https://www.swisswater.com/pages/coffee-decaffeination-process):
//   beans meet a Green Coffee Extract that is caffeine-free and holds water and coffee's other compounds, so by
//   diffusion only caffeine migrates out; the caffeine-saturated extract passes through carbon filters that trap the
//   caffeine and then goes on to the next beans.
// - National Coffee Association, "Decaf coffee" (https://www.aboutcoffee.org/beans/decaf-coffee/): decaffeination
//   typically removes around 97% of the caffeine, leaving about 2–15 mg in a cup; a typical 8-ounce cup of caffeinated
//   coffee has 95 mg; beans are steamed to open their "pores". The US Food and Drug Administration ("Spilling the
//   Beans", content of 28 August 2024) also gives 2 to 15 mg for an 8-fluid-ounce cup of decaf.
// - 21 CFR 173.255(c) (https://www.law.cornell.edu/cfr/text/21/173.255): methylene chloride may remain in
//   decaffeinated roasted coffee and instant coffee at no more than 10 parts per million (0.001%). Directive
//   2009/32/EC, Annex I (consolidated 16 February 2023, https://publications.europa.eu/resource/celex/02009L0032-20230216): dichloromethane for
//   decaffeination at most 2 mg/kg in the roasted coffee; ethyl acetate and carbon dioxide may be used under good
//   manufacturing practice. (For the post's slides: Directive 1999/4/EC, Article 2, "decaffeinated" coffee extract
//   holds at most 0.3% anhydrous caffeine by weight of the coffee-based dry matter; Germany's Kaffeeverordnung § 2(3),
//   https://www.gesetze-im-internet.de/kaffeev_2001/BJNR310700001.html: green and roasted decaf at most 1 g of caffeine
//   per kg of dry coffee; Federal Register 2026-10615, 28 May 2026: the FDA reopened comments, until 29 June 2026, on
//   the Environmental Defense Fund et al. petition to remove methylene chloride and three other solvents from its food
//   additive rules; no later document on docket FDA-2023-F-5684 by 30 October 2026.)
// Computed here: 46 / 5.5 ≈ 8, so about 1/8 as much water at 80 °C; an 8-fluid-ounce cup ≈ 237 mL ("about 240 mL"); 3% of
// 95 mg ≈ 3 mg; 10 parts per million of 100 kg = 1 g; 2 mg/kg × 100 kg = 0.2 g. Molecules and beans are not to
// scale, and the numbers of dots only illustrate.
//
// Scene plan (65.0 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0–5.0   Hook: raw green bean, caffeine out, still green, then roasted.
//  B  4.8–9.6   100 g of raw arabica holds about 1 g of caffeine, among the flavour molecules.
//  C  9.4–14.2  Steam swells the bean and opens it.
//  D 14.0–18.8  Two beakers: water needed to dissolve 1 g of caffeine, 46 mL cool, 5.5 mL at 80 °C.
//  E 18.6–28.0  Direct method: solvent in, caffeine out to a jar; steam drives the solvent off; fruit, "natural".
//  F 27.8–37.2  Indirect method: water out with caffeine and flavour, solvent takes the caffeine, water goes back.
//  G 37.0–46.4  Swiss Water: an extract full of flavour, caffeine leaves, carbon filters trap it, the extract loops.
//  H 46.2–55.6  Supercritical CO₂: thermometer and pressure dial cross 31 °C and 74 bar; CO₂ through moist beans.
//  I 55.4–65.0  Cups: 95 mg against 2–15 mg; the residue limits in 100 kg of decaf, 1 g (US) and 0.2 g (EU).
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg0: '#2b1a10', bg1: '#1f130c', ink: '#f6ecdc', soft: 'rgba(246,236,220,0.74)', faint: 'rgba(246,236,220,0.26)',
  line: 'rgba(246,236,220,0.14)', bean: '#a9bb8b', beanHi: '#cbd8b0', beanLo: '#7f9364', crease: '#55663f',
  roast: '#7b4527', roastHi: '#a0623a', roastLo: '#4a2816', caf: '#f4b83f', cafDark: '#7a5208', fla: '#ee7393',
  flaDark: '#6d2236', liq: '#86cdf0', water: 'rgba(134,205,240,0.26)', solvent: 'rgba(96,158,236,0.45)',
  extract: 'rgba(201,168,74,0.40)', co2: '#bba8f4', co2Soft: 'rgba(187,168,244,0.30)', carbon: '#262321',
  carbonLine: '#5a524c', steam: 'rgba(255,255,255,0.5)', glass: 'rgba(246,236,220,0.55)', panel: 'rgba(16,9,5,0.55)',
  hot: '#ef6b4a',
};
const HEAD = 'Fraunces', TXT = 'Fira Sans';

let k, ctx;
const font = (w, s, f = TXT) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', align: 'center', ...o });
const A = (a, fn) => k.alpha(a, fn);
const rnd = (i, j = 0) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------- the numbers ----------
const ARABICA = [0.8, 1.4]; // % caffeine in raw arabica (Molecules, 2021)
const ML_COOL = 46, ML_HOT = 5.5, HOT_C = 80; // water to dissolve 1 g of caffeine (PubChem)
const LESS_WATER = ML_COOL / ML_HOT; // ≈ 8.4
const TC = 31.0, PC = 73.8; // CO₂ critical point (NIST)
const ZOSEL_T = 70, ZOSEL_P = 162; // Zosel's patent (Max Planck Society)
const CUP_REG = 95, CUP_DECAF = [2, 15], REMOVED = 97; // mg in an 8-ounce cup; % removed (National Coffee Association)
const CUP_ML = 8 * 29.5735; // ≈ 237 mL
const US_PPM = 10, EU_MG_KG = 2, SACK_KG = 100;
const US_G = (US_PPM / 1e6) * SACK_KG * 1000; // 1 g in 100 kg
const EU_G = (EU_MG_KG * SACK_KG) / 1000; // 0.2 g in 100 kg
const left = (CUP_REG * (100 - REMOVED)) / 100; // ≈ 2.9 mg
const n1 = (v) => (Math.round(v * 10) / 10).toString();

const CUES = [
  [0.4, 4.8, 'Decaf starts green: the *caffeine* comes out of raw coffee beans, before they are roasted.'],
  [5.0, 9.4, 'Raw arabica beans are roughly *1%* caffeine, among the molecules behind their ~flavour~.'],
  [9.6, 14.0, 'First, steam or hot water: the beans swell and open up, so the *caffeine* can get out.'],
  [14.2, 18.6, `Heat helps: *1 g* of caffeine dissolves in ${ML_COOL} mL of ^water^ at 25 °C, but in just ${ML_HOT} mL at ${HOT_C} °C.`],
  [18.8, 23.2, 'Direct method: a ^solvent^, methylene chloride or ethyl acetate, washes *caffeine* out of steamed beans.'],
  [23.4, 27.8, 'Steam drives off the solvent. Ethyl acetate is in fruit, so its decaf may be called “natural”.'],
  [28.0, 32.4, 'Indirect: hot ^water^ draws out caffeine and ~flavour~; a solvent removes just the *caffeine*.'],
  [32.6, 37.0, 'The water goes back to the beans, and they soak their ~flavour~ up again.'],
  [37.2, 41.6, 'Swiss Water Process: beans soak in a coffee ^extract^ that holds everything but caffeine.'],
  [41.8, 46.2, 'Already full of ~flavour~, the extract takes only *caffeine*, and carbon filters trap it.'],
  [46.4, 50.8, `Above ${Math.round(TC)} °C and ${Math.round(PC)} bar, ^carbon dioxide^ turns supercritical: part gas, part liquid.`],
  [51.0, 55.4, 'Pumped through moist beans, it dissolves the *caffeine* and carries it off to activated carbon.'],
  [55.6, 60.0, `About *${REMOVED}%* of the caffeine goes, the US coffee industry says: a cup keeps about ${CUP_DECAF[0]} to ${CUP_DECAF[1]} mg.`],
  [60.2, 64.6, `US rules allow at most ${US_PPM} parts per million of methylene chloride in decaf: ${n1(US_G)} g in ${SACK_KG} kg.`],
];

// ---------- background: burlap sacking ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createRadialGradient(W / 2, 420, 80, W / 2, 520, 760);
  lg.addColorStop(0, C.bg0); lg.addColorStop(1, C.bg1);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.lineWidth = 2;
  for (let y = 0; y < H; y += 7) { g.strokeStyle = `rgba(230,200,160,${0.025 + r() * 0.03})`; g.beginPath(); g.moveTo(0, y + r()); g.lineTo(W, y + r()); g.stroke(); }
  for (let x = 0; x < W; x += 7) { g.strokeStyle = `rgba(230,200,160,${0.02 + r() * 0.025})`; g.beginPath(); g.moveTo(x + r(), 0); g.lineTo(x + r(), H); g.stroke(); }
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.12})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2); }
}

// ---------- small drawings ----------
/** A coffee bean, long axis along `rot`, half-length r. */
function bean(x, y, r, { rot = 0, roast = 0, pores = 0, a = 1 } = {}) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const rx = r * 0.72, ry = r;
    const base = roast > 0.5 ? C.roast : C.bean, hi = roast > 0.5 ? C.roastHi : C.beanHi, lo = roast > 0.5 ? C.roastLo : C.beanLo;
    const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, r * 0.08, 0, 0, r * 1.1);
    g.addColorStop(0, hi); g.addColorStop(0.55, base); g.addColorStop(1, lo);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = Math.max(1.5, r * 0.025); ctx.stroke();
    ctx.strokeStyle = roast > 0.5 ? '#2e170b' : C.crease; ctx.lineWidth = Math.max(2, r * 0.07); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rx * 0.05, -ry * 0.82); ctx.bezierCurveTo(rx * 0.42, -ry * 0.3, -rx * 0.42, ry * 0.3, -rx * 0.05, ry * 0.82); ctx.stroke();
    if (pores > 0) {
      ctx.strokeStyle = 'rgba(40,50,25,0.75)';
      for (let i = 0; i < 16; i++) {
        const an = rnd(i, 21) * Math.PI * 2, u = 0.35 + rnd(i, 22) * 0.55, px = Math.cos(an) * rx * u, py = Math.sin(an) * ry * u;
        ctx.lineWidth = 1 + pores * r * 0.035; ctx.beginPath(); ctx.moveTo(px - r * 0.05, py - r * 0.02); ctx.lineTo(px + r * 0.05, py + r * 0.02); ctx.stroke();
      }
    }
    ctx.restore();
  });
}
/** Caffeine: a gold hexagon. */
function caf(x, y, s = 8, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.caf; ctx.strokeStyle = C.cafDark; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + (i * Math.PI) / 3; const px = x + Math.cos(an) * s, py = y + Math.sin(an) * s; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });
}
/** A flavour molecule: a rose dot. */
function fla(x, y, s = 6.5, a = 1) {
  A(a, () => {
    ctx.fillStyle = C.fla; ctx.strokeStyle = C.flaDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}
function drop(x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - s * 1.4); ctx.quadraticCurveTo(x + s, y - s * 0.2, x, y + s * 0.6); ctx.quadraticCurveTo(x - s, y - s * 0.2, x, y - s * 1.4); ctx.fill();
}
function arrow(x0, y0, x1, y1, color, w = 5, head = 15) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  const an = Math.atan2(y1 - y0, x1 - x0);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(an) * head * 0.6, y1 - Math.sin(an) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(an - 0.45) * head, y1 - Math.sin(an - 0.45) * head); ctx.lineTo(x1 - Math.cos(an + 0.45) * head, y1 - Math.sin(an + 0.45) * head); ctx.closePath(); ctx.fill();
}
/** Steam: wavy wisps rising from y0, `n` of them across [x0, x1]. */
function steam(t, x0, x1, y0, rise, n = 7, a = 1) {
  A(a, () => {
    ctx.strokeStyle = C.steam; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + 0.5) / n), ph = (t * 0.45 + rnd(i, 31)) % 1;
      A(Math.sin(ph * Math.PI) * 0.9, () => {
        ctx.beginPath();
        for (let j = 0; j <= 12; j++) { const u = j / 12, yy = y0 - ph * rise * 0.5 - u * rise * 0.5; const xx = x + Math.sin(u * 5 + t * 2 + i) * 8; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
      });
    }
  });
}
/** A glass tank with liquid up to `level` (0–1). */
function tank(x0, y0, w, h, level, fill, wob = 0) {
  ctx.fillStyle = 'rgba(246,236,220,0.05)'; k.rrect(x0, y0, w, h, 22); ctx.fill();
  if (level > 0) {
    ctx.save(); k.rrect(x0, y0, w, h, 22); ctx.clip();
    const ly = y0 + h * (1 - level);
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x0, y0 + h);
    for (let x = x0; x <= x0 + w; x += 8) ctx.lineTo(x, ly + Math.sin(x * 0.05 + wob * 3) * 3);
    ctx.lineTo(x0 + w, y0 + h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = C.glass; ctx.lineWidth = 4; k.rrect(x0, y0, w, h, 22); ctx.stroke();
}
function pipe(pts, color = C.faint, w = 14) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
}
/** The point a fraction u along a polyline. */
function along(pts, u) {
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let d = clamp(u) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? d / lens[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}
/** Beans piled in the bottom of a box. */
function pile(x0, x1, y0, y1, n, r, seed) {
  const out = [];
  const cols = Math.max(1, Math.round((x1 - x0) / (r * 1.5)));
  for (let i = 0; i < n; i++) {
    const c = i % cols, row = Math.floor(i / cols);
    out.push([x0 + (c + 0.5 + (row % 2) * 0.35) * ((x1 - x0) / (cols + 0.35)) + (rnd(i, seed) - 0.5) * 6, y1 - r - row * r * 1.25 + (rnd(i, seed + 1) - 0.5) * 6, (rnd(i, seed + 2) - 0.5) * 2.4]);
  }
  return out.filter(([, y]) => y > y0 + r);
}
/** n points scattered in a box. */
const spots = (n, x0, y0, x1, y1, seed) => Array.from({ length: n }, (_, i) => [lerp(x0, x1, rnd(i, seed)), lerp(y0, y1, rnd(i, seed + 1))]);
/** A dot moving from p to q between a and b, with a little arc. */
function move(t, p, q, a, b, lift = 30) {
  const u = eio(seg(t, a, b));
  return [lerp(p[0], q[0], u), lerp(p[1], q[1], u) - Math.sin(u * Math.PI) * lift];
}
const jig = (t, i, amp = 2.5) => [Math.sin(t * 2.3 + i * 1.7) * amp, Math.cos(t * 2.0 + i * 2.3) * amp];

// ---------- A: hook ----------
function hook(t) {
  const a = span(t, 0, 5.0, 0, 0.4);
  if (a <= 0) return;
  A(a, () => {
    A(seg(t, 0.1, 0.6), () => { font(700, 58, HEAD); text('How decaf is made', W / 2, 160); });
    const y = 420, xs = [158, 432, 706];
    const g0 = back(seg(t, 0.3, 1.0)), g1 = back(seg(t, 1.1, 1.8)), g2 = back(seg(t, 3.0, 3.7));
    if (g0 > 0) bean(xs[0], y, 92 * g0, { rot: -0.2 });
    if (g1 > 0) bean(xs[1], y, 92 * g1, { rot: 0.15 });
    if (g2 > 0) bean(xs[2], y, 92 * g2, { rot: -0.1, roast: 1 });
    const dots = [[-20, -40], [24, -10], [-14, 22], [18, 48], [-26, 60]];
    dots.forEach(([dx, dy], i) => {
      if (g0 > 0.5) caf(xs[0] + dx, y + dy, 9);
      if (g1 > 0.5) {
        const u = eout(seg(t, 1.9 + i * 0.12, 3.0 + i * 0.12));
        caf(xs[1] + dx + u * (dx * 1.5), y + dy - u * 170, 9, 1 - seg(t, 2.6 + i * 0.12, 3.1 + i * 0.12));
      }
    });
    A(seg(t, 1.2, 1.6), () => {
      arrow(232, y, 352, y, C.caf, 6, 18);
      font(700, 24); text('caffeine', 292, y - 52, { color: C.caf }); text('out', 292, y - 24, { color: C.caf });
    });
    A(seg(t, 2.9, 3.3), () => {
      arrow(508, y, 628, y, C.hot, 6, 18);
      font(700, 24); text('roast', 568, y - 30, { color: C.hot });
    });
    font(600, 26);
    A(seg(t, 0.8, 1.2), () => text('raw, green', xs[0], 570, { color: C.soft }));
    A(seg(t, 1.7, 2.1), () => { text('decaf,', xs[1], 570, { color: C.soft }); text('still green', xs[1], 602, { color: C.soft }); });
    A(seg(t, 3.5, 3.9), () => text('roasted', xs[2], 570, { color: C.soft }));
  });
}

// ---------- B: about 1% caffeine ----------
function onePercent(t) {
  const a = span(t, 4.8, 9.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('100 g of raw arabica coffee', 252, 176, { color: C.soft });
    const lit = 64;
    for (let i = 0; i < 100; i++) {
      const g = seg(t, 5.1 + i * 0.011, 5.4 + i * 0.011);
      if (g <= 0) continue;
      const x = 90 + (i % 10) * 36, y = 222 + Math.floor(i / 10) * 36;
      if (i === lit && t > 6.6) {
        const p = 1 + 0.25 * Math.sin(seg(t, 6.6, 7.2) * Math.PI);
        caf(x, y, 13 * p);
      } else bean(x, y, 14 * g, { rot: 0.5 + rnd(i, 3) * 0.6 });
    }
    A(seg(t, 6.8, 7.3), () => {
      font(800, 36, HEAD); text('about 1 g is caffeine', 252, 598, { color: C.caf });
      font(500, 22); text(`${ARABICA[0]} to ${ARABICA[1]} g in arabica`, 252, 638, { color: C.soft });
    });
    // a bean up close
    const g = back(seg(t, 5.4, 6.2));
    if (g > 0) {
      const bx = 650, by = 396, r = 150 * g;
      bean(bx, by, r, { rot: 0.1 });
      if (g > 0.9) {
        spots(22, bx - 70, by - 110, bx + 70, by + 110, 41).forEach(([x, y], i) => {
          if (((x - bx) / 86) ** 2 + ((y - by) / 124) ** 2 > 0.85) return;
          const [jx, jy] = jig(t, i, 1.5);
          i % 5 === 0 ? caf(x + jx, y + jy, 9) : fla(x + jx, y + jy, 7);
        });
      }
      A(seg(t, 7.4, 7.9), () => {
        caf(578, 600, 9); font(600, 24); text('caffeine', 596, 600, { align: 'left', color: C.caf });
        fla(578, 638, 7); text('flavour molecules', 596, 638, { align: 'left', color: C.fla });
        font(500, 22); text('not to scale', 650, 678, { color: C.faint });
      });
    }
  });
}

// ---------- C: steam swells the bean ----------
function swell(t) {
  const a = span(t, 9.4, 14.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const s = eio(seg(t, 10.2, 12.6));
    const bx = W / 2, by = 410, r = lerp(150, 176, s);
    steam(t, bx - 230, bx + 230, 650, 260, 8, seg(t, 9.8, 10.4));
    bean(bx, by, r, { rot: 0.1, pores: s });
    const dots = spots(14, bx - 70, by - 110, bx + 70, by + 110, 7);
    dots.forEach(([x, y], i) => {
      if (((x - bx) / 90) ** 2 + ((y - by) / 128) ** 2 > 0.8) return;
      const out = 1 + 0.18 * s, [jx, jy] = jig(t, i, 1.5 + 3 * s);
      const px = bx + (x - bx) * out + jx, py = by + (y - by) * out + jy;
      i % 3 === 0 ? caf(px, py, 9) : fla(px, py, 7);
    });
    font(600, 26);
    A(seg(t, 10.0, 10.5), () => text('steam or hot water', bx, 680, { color: C.soft }));
    A(seg(t, 12.0, 12.5), () => {
      text('swells,', 718, 380, { color: C.ink }); text('opens up', 718, 414, { color: C.ink });
      text('caffeine', 146, 380, { color: C.caf }); text('can get out', 146, 414, { color: C.caf });
    });
  });
}

// ---------- D: heat helps it dissolve ----------
function dissolve(t) {
  const a = span(t, 14.0, 18.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text('water needed to dissolve 1 g of caffeine', W / 2, 170, { color: C.soft });
    const base = 640, px = 7, cap = 60, bw = 170;
    const cols = [[262, ML_COOL, '25 °C', C.liq], [602, ML_HOT, `${HOT_C} °C`, C.hot]];
    cols.forEach(([x, ml, lab, col], i) => {
      const top = base - cap * px;
      const fill = eio(seg(t, 14.6 + i * 0.4, 15.9 + i * 0.4));
      const h = ml * px * fill;
      ctx.save(); k.rrect(x - bw / 2, top, bw, cap * px, [6, 6, 20, 20]); ctx.clip();
      ctx.fillStyle = 'rgba(134,205,240,0.30)'; ctx.fillRect(x - bw / 2, base - h, bw, h);
      ctx.restore();
      ctx.strokeStyle = C.glass; ctx.lineWidth = 4; k.rrect(x - bw / 2, top, bw, cap * px, [6, 6, 20, 20]); ctx.stroke();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; font(500, 22);
      for (let v = 10; v < cap; v += 10) { const yy = base - v * px; ctx.beginPath(); ctx.moveTo(x - bw / 2, yy); ctx.lineTo(x - bw / 2 + 18, yy); ctx.stroke(); if (i === 0) text(String(v), x - bw / 2 - 26, yy, { color: C.faint }); }
      // a gram of crystals dissolving at the bottom
      const gone = seg(t, 15.8 + i * 0.4, 17.0 + i * 0.4);
      for (let j = 0; j < 7; j++) caf(x - 36 + (j % 4) * 24 + (j > 3 ? 12 : 0), base - 12 - (j > 3 ? 18 : 0), 9, 1 - gone);
      A(seg(t, 15.6 + i * 0.4, 16.1 + i * 0.4), () => { font(800, 44, HEAD); text(`${ml} mL`, x, base - ml * px - 40, { color: C.ink }); });
      font(600, 26); text(lab, x, base + 40, { color: col });
    });
    steam(t, 540, 664, 560, 110, 3, seg(t, 15.2, 15.8));
    A(seg(t, 16.6, 17.1), () => { font(700, 30, HEAD); font(700, 28, HEAD); text(`1/${Math.round(LESS_WATER)} as much`, 602, 330, { color: C.caf }); text('when hot', 602, 364, { color: C.caf }); });
  });
}

// ---------- E: the direct method ----------
const E = { x0: 110, y0: 250, w: 330, h: 380 };
const E_BEANS = pile(E.x0 + 12, E.x0 + E.w - 12, E.y0, E.y0 + E.h - 8, 16, 30, 50);
const E_CAF = E_BEANS.slice(0, 12).map(([x, y], i) => [x + (rnd(i, 60) - 0.5) * 20, y + (rnd(i, 61) - 0.5) * 20]);
const E_UP = spots(12, E.x0 + 40, E.y0 + 60, E.x0 + E.w - 40, E.y0 + 150, 62);
const E_DRAIN = [[E.x0 + E.w - 30, E.y0 + E.h + 26], [560, E.y0 + E.h + 26], [560, 580]];
const JAR = { x: 655, y0: 440, w: 150, h: 160 };
function direct(t) {
  const a = span(t, 18.6, 28.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const fillIn = eio(seg(t, 19.3, 20.6)), drain = eio(seg(t, 22.2, 23.2));
    const level = 0.82 * fillIn * (1 - drain);
    pipe([[40, 196], [170, 196], [170, E.y0 + 8]]);
    A(1 - seg(t, 24.4, 24.9), () => pipe(E_DRAIN));
    tank(E.x0, E.y0, E.w, E.h, level, C.solvent, t);
    for (let i = 0; i < 10 && t > 19.0 && t < 20.8; i++) { const u = (t * 1.6 + i / 10) % 1; drop(170, lerp(E.y0 + 10, E.y0 + 140, u), 7, C.liq); }
    E_BEANS.forEach(([x, y, r], i) => bean(x, y, 30, { rot: r }));
    // caffeine leaves the beans, then drains to the jar
    E_CAF.forEach((p, i) => {
      if (t < 22.2) {
        const q = E_UP[i], [jx, jy] = jig(t, i);
        const [x, y] = move(t, p, q, 20.6 + i * 0.08, 21.6 + i * 0.08, 10);
        caf(x + (t > 21.6 ? jx : 0), y + (t > 21.6 ? jy : 0), 8);
      } else {
        const u = seg(t, 22.3 + i * 0.07, 23.3 + i * 0.07);
        const [x, y] = u <= 0 ? E_UP[i] : u >= 1 ? [JAR.x - 50 + (i % 5) * 25, JAR.y0 + JAR.h - 22 - Math.floor(i / 5) * 22] : along([E_UP[i], [E.x0 + E.w - 30, E.y0 + E.h - 20], ...E_DRAIN, [JAR.x - 20, JAR.y0 + 60]], u);
        caf(x, y, 8, 1 - seg(t, 24.4, 24.9));
      }
    });
    font(600, 24); A(seg(t, 19.0, 19.5) * (1 - seg(t, 23.4, 23.8)), () => { text('solvent: methylene chloride', 620, 190, { color: C.liq }); text('or ethyl acetate', 620, 220, { color: C.liq }); });
    // the jar of caffeine
    A(seg(t, 21.8, 22.3) * (1 - seg(t, 24.4, 24.9)), () => {
      ctx.strokeStyle = C.glass; ctx.lineWidth = 4; k.rrect(JAR.x - JAR.w / 2, JAR.y0, JAR.w, JAR.h, 18); ctx.stroke();
      font(700, 24); text('caffeine', JAR.x, JAR.y0 - 70, { color: C.caf });
      font(500, 22); text('sold to soft-drink', JAR.x, JAR.y0 - 40, { color: C.soft }); text('and drug makers', JAR.x, JAR.y0 - 14, { color: C.soft });
    });
    // steam drives off the solvent
    steam(t, E.x0 + 30, E.x0 + E.w - 30, E.y0 + E.h - 20, 260, 6, span(t, 23.4, 26.6, 0.4, 0.6));
    for (let i = 0; i < 12; i++) {
      const [x, y] = E_BEANS[i % E_BEANS.length], u = eout(seg(t, 23.8 + i * 0.1, 25.4 + i * 0.1));
      if (t > 22.8 && u < 1) A((1 - u) * seg(t, 22.8, 23.3), () => drop(x + (rnd(i, 70) - 0.5) * 30, y - 6 - u * 200, 6, C.liq));
    }
    A(seg(t, 23.8, 24.3) * (1 - seg(t, 27.6, 28.0)), () => { font(600, 24); text('steam drives the solvent off', E.x0 + E.w / 2, E.y0 + E.h + 76, { color: C.soft }); });
    // ethyl acetate occurs in fruit
    A(seg(t, 25.0, 25.6), () => fruitCard(t));
  });
}
function fruitCard(t) {
  const x = 650, y = 330;
  // a pear
  ctx.fillStyle = '#c7cf5a';
  ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.bezierCurveTo(x + 30, y - 70, x + 30, y - 30, x + 26, y - 14);
  ctx.bezierCurveTo(x + 70, y + 10, x + 62, y + 76, x, y + 78); ctx.bezierCurveTo(x - 62, y + 76, x - 70, y + 10, x - 26, y - 14);
  ctx.bezierCurveTo(x - 30, y - 30, x - 30, y - 70, x, y - 70); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(x - 22, y + 20, 10, 22, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.quadraticCurveTo(x + 4, y - 92, x + 16, y - 100); ctx.stroke();
  ctx.fillStyle = '#6aa84f'; ctx.beginPath(); ctx.ellipse(x + 30, y - 92, 18, 8, -0.5, 0, Math.PI * 2); ctx.fill();
  font(600, 24); text('ethyl acetate also', x, y + 118, { color: C.ink }); text('occurs in fruit', x, y + 148, { color: C.ink });
  // a bag label
  const g = back(seg(t, 26.0, 26.7));
  if (g > 0) {
    ctx.save(); ctx.translate(x - 6, y + 220); ctx.scale(g, g); ctx.rotate(-0.04);
    ctx.fillStyle = '#efe2c8'; k.rrect(-176, -34, 352, 68, 12); ctx.fill();
    ctx.strokeStyle = C.roast; ctx.lineWidth = 3; k.rrect(-168, -26, 336, 52, 8); ctx.stroke();
    ctx.font = `italic 700 24px "${HEAD}"`; text('“naturally decaffeinated”', 0, 1, { color: C.roastLo });
    ctx.restore();
  }
}

// ---------- F: the indirect method ----------
const FL = { x0: 70, y0: 260, w: 290, h: 340 }, FR = { x0: 500, y0: 260, w: 290, h: 340 };
const F_BEANS = pile(FL.x0 + 12, FL.x0 + FL.w - 12, FL.y0, FL.y0 + FL.h - 8, 12, 30, 80);
const F_CAF = F_BEANS.slice(0, 8).map(([x, y], i) => [x + (rnd(i, 90) - 0.5) * 18, y - 4]);
const F_FLA = F_BEANS.slice(0, 12).map(([x, y], i) => [x + (rnd(i, 91) - 0.5) * 26, y + 10]);
const F_WL_C = spots(8, FL.x0 + 30, FL.y0 + 70, FL.x0 + FL.w - 30, FL.y0 + 150, 92);
const F_WL_F = spots(12, FL.x0 + 30, FL.y0 + 60, FL.x0 + FL.w - 30, FL.y0 + 160, 93);
const F_WR_C = spots(8, FR.x0 + 40, FR.y0 + 160, FR.x0 + FR.w - 40, FR.y0 + 300, 94);
const F_WR_F = spots(12, FR.x0 + 30, FR.y0 + 150, FR.x0 + FR.w - 30, FR.y0 + 310, 95);
const F_LOW = [[FL.x0 + FL.w - 20, FL.y0 + FL.h - 24], [FL.x0 + FL.w + 10, FL.y0 + FL.h - 24], [FR.x0 - 10, FR.y0 + FL.h - 24], [FR.x0 + 30, FR.y0 + FL.h - 24]];
const F_TOP = [[FR.x0 + FR.w / 2, FR.y0 + 10], [FR.x0 + FR.w / 2, 206], [FL.x0 + FL.w / 2, 206], [FL.x0 + FL.w / 2, FL.y0 + 10]];
const F_OUT = [[FR.x0 + FR.w - 20, FR.y0 + 230], [FR.x0 + FR.w + 46, FR.y0 + 230], [FR.x0 + FR.w + 46, FR.y0 + FR.h + 90]];
function indirect(t) {
  const a = span(t, 27.8, 37.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const inL = eio(seg(t, 28.2, 29.0)), across = eio(seg(t, 30.2, 31.2)), backL = eio(seg(t, 32.8, 34.2)), soak = eio(seg(t, 34.4, 35.8));
    const lvL = 0.8 * (inL * (1 - across) + backL * (1 - soak)), lvR = 0.62 * across * (1 - backL);
    pipe(F_LOW); pipe(F_TOP); pipe(F_OUT);
    tank(FL.x0, FL.y0, FL.w, FL.h, lvL, C.water, t);
    tank(FR.x0, FR.y0, FR.w, FR.h, lvR, C.water, t + 1);
    // the solvent passing through the water tank
    const solv = span(t, 31.0, 32.6, 0.3, 0.3);
    if (solv > 0) A(solv * 0.9, () => { for (let i = 0; i < 14; i++) { const u = (t * 0.9 + i / 14) % 1; const [x, y] = [FR.x0 + 30 + rnd(i, 96) * (FR.w - 60), lerp(FR.y0 + FR.h - 20, FR.y0 + 140, u)]; drop(x, y, 6, '#5d9eea'); } });
    F_BEANS.forEach(([x, y, r]) => bean(x, y, 30, { rot: r }));
    steam(t, FL.x0 + 30, FL.x0 + FL.w - 30, FL.y0 + 40, 90, 4, span(t, 28.4, 30.2, 0.3, 0.4));
    // caffeine: beans → water → across → out with the solvent
    F_CAF.forEach((p, i) => {
      let q;
      if (t < 30.2) { q = move(t, p, F_WL_C[i], 29.0 + i * 0.08, 29.9 + i * 0.08, 8); }
      else if (t < 31.3) { const u = eio(seg(t, 30.2, 31.2)); q = along([F_WL_C[i], F_LOW[0], F_LOW[1], F_LOW[2], F_LOW[3], F_WR_C[i]], u); }
      else { const u = eio(seg(t, 31.5 + i * 0.08, 32.4 + i * 0.08)); q = along([F_WR_C[i], F_OUT[0], F_OUT[1], F_OUT[2]], u); }
      const [jx, jy] = jig(t, i);
      caf(q[0] + jx * 0.5, q[1] + jy * 0.5, 8, 1 - seg(t, 32.2 + i * 0.08, 32.6 + i * 0.08));
    });
    // flavour: beans → water → across → back over the top → into the beans
    F_FLA.forEach((p, i) => {
      let q;
      if (t < 30.2) q = move(t, p, F_WL_F[i], 29.1 + i * 0.06, 30.0 + i * 0.06, 8);
      else if (t < 32.8) { const u = eio(seg(t, 30.2, 31.2)); q = along([F_WL_F[i], F_LOW[0], F_LOW[1], F_LOW[2], F_LOW[3], F_WR_F[i]], u); }
      else if (t < 34.4) { const u = eio(seg(t, 32.8 + i * 0.03, 34.2)); q = along([F_WR_F[i], ...F_TOP, F_WL_F[i]], u); }
      else q = move(t, F_WL_F[i], p, 34.4 + i * 0.06, 35.6 + i * 0.06, 8);
      const [jx, jy] = jig(t, i + 20);
      fla(q[0] + jx * 0.5, q[1] + jy * 0.5, 6.5);
    });
    font(600, 24);
    A(span(t, 28.4, 31.0, 0.4, 0.3), () => text('hot water takes both', FL.x0 + FL.w / 2, FL.y0 + FL.h + 52, { color: C.soft }));
    A(span(t, 31.2, 32.8, 0.3, 0.3), () => { text('a solvent takes', FR.x0 + FR.w / 2, FR.y0 + FR.h + 52, { color: C.liq }); text('only the caffeine', FR.x0 + FR.w / 2, FR.y0 + FR.h + 82, { color: C.liq }); });
    A(span(t, 33.0, 37.2, 0.4, 0.3), () => { text('water goes back,', FL.x0 + FL.w / 2, FL.y0 + FL.h + 52, { color: C.soft }); text('beans soak it up', FL.x0 + FL.w / 2, FL.y0 + FL.h + 82, { color: C.fla }); });
  });
}

// ---------- G: the Swiss Water Process ----------
const G = { x0: 70, y0: 270, w: 340, h: 340 };
const FIL = { x0: 590, y0: 300, w: 110, h: 270 };
const G_BEANS = pile(G.x0 + 12, G.x0 + G.w - 12, G.y0, G.y0 + G.h - 8, 15, 30, 110);
const G_CAF = G_BEANS.slice(0, 10).map(([x, y], i) => [x + (rnd(i, 120) - 0.5) * 18, y - 3]);
const G_FLA_IN = G_BEANS.slice(0, 15).map(([x, y], i) => [x + (rnd(i, 121) - 0.5) * 24, y + 9]);
const G_FLA_EX = spots(15, G.x0 + 26, G.y0 + 50, G.x0 + G.w - 26, G.y0 + 150, 122);
const G_LOOP = [[G.x0 + G.w - 16, G.y0 + G.h - 30], [FIL.x0 + FIL.w / 2, G.y0 + G.h - 30], [FIL.x0 + FIL.w / 2, FIL.y0 + FIL.h], [FIL.x0 + FIL.w / 2, FIL.y0], [FIL.x0 + FIL.w / 2, 214], [G.x0 + G.w / 2, 214], [G.x0 + G.w / 2, G.y0 + 16]];
const G_STUCK = spots(10, FIL.x0 + 18, FIL.y0 + FIL.h * 0.55, FIL.x0 + FIL.w - 18, FIL.y0 + FIL.h - 22, 123);
function swiss(t) {
  const a = span(t, 37.0, 46.4, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const filt = seg(t, 41.6, 42.2);
    pipe(G_LOOP, `rgba(201,168,74,${0.18 + 0.3 * filt})`);
    tank(G.x0, G.y0, G.w, G.h, 0.86 * eio(seg(t, 37.3, 38.2)), C.extract, t);
    G_BEANS.forEach(([x, y, r]) => bean(x, y, 30, { rot: r }));
    // the carbon filter
    A(seg(t, 41.4, 41.9), () => {
      ctx.fillStyle = C.carbon; k.rrect(FIL.x0, FIL.y0, FIL.w, FIL.h, 14); ctx.fill();
      ctx.strokeStyle = C.carbonLine; ctx.lineWidth = 2;
      for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) {
        const hx = FIL.x0 + 16 + c * 26 + (r % 2) * 13, hy = FIL.y0 + 16 + r * 21;
        if (hx > FIL.x0 + FIL.w - 10) continue;
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = (i * Math.PI) / 3; const px = hx + Math.cos(an) * 9, py = hy + Math.sin(an) * 9; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke();
      }
      ctx.strokeStyle = C.glass; ctx.lineWidth = 3; k.rrect(FIL.x0, FIL.y0, FIL.w, FIL.h, 14); ctx.stroke();
      font(700, 24); text('carbon filter', FIL.x0 + FIL.w / 2, FIL.y0 + FIL.h + 46, { color: C.ink });
      font(500, 22); text('traps the caffeine', FIL.x0 + FIL.w / 2, FIL.y0 + FIL.h + 76, { color: C.caf });
    });
    // flavour: in the beans and in the extract, staying put; some circulate round the loop
    const inEx = seg(t, 37.6, 38.4);
    G_FLA_IN.forEach(([x, y], i) => { const [jx, jy] = jig(t, i + 40, 1.6); fla(x + jx, y + jy, 6.5); });
    G_FLA_EX.forEach(([x, y], i) => { const [jx, jy] = jig(t, i + 60, 3); fla(x + jx, y + jy, 6.5, inEx); });
    if (filt > 0) for (let i = 0; i < 6; i++) { const u = (t * 0.16 + i / 6) % 1; const [x, y] = along(G_LOOP, u); fla(x, y, 6, filt); }
    // caffeine: out of the beans into the extract, round to the filter, stuck there
    G_CAF.forEach((p, i) => {
      const q = spots(10, G.x0 + 40, G.y0 + 70, G.x0 + G.w - 40, G.y0 + 170, 124)[i];
      let pos;
      if (t < 42.0 + i * 0.22) pos = move(t, p, q, 39.4 + i * 0.12, 40.6 + i * 0.12, 8);
      else {
        const u = eio(seg(t, 42.0 + i * 0.22, 43.6 + i * 0.22));
        const path = [q, ...G_LOOP.slice(0, 2), [FIL.x0 + FIL.w / 2, FIL.y0 + FIL.h], G_STUCK[i]];
        pos = along(path, u);
      }
      const [jx, jy] = t < 42.0 ? jig(t, i, 2) : [0, 0];
      caf(pos[0] + jx, pos[1] + jy, 8);
    });
    font(600, 24);
    A(seg(t, 37.8, 38.3), () => { text('green coffee extract:', G.x0 + G.w / 2, G.y0 + G.h + 50, { color: '#d9bd6a' }); text('everything except caffeine', G.x0 + G.w / 2, G.y0 + G.h + 80, { color: '#d9bd6a' }); });
    A(seg(t, 43.0, 43.5), () => { font(600, 22); text('the extract goes round again', (FIL.x0 + G.x0 + G.w / 2) / 2 + 60, 186, { color: C.soft }); });
  });
}

// ---------- H: supercritical carbon dioxide ----------
const TH = { x: 150, y0: 250, y1: 560, max: 100 }, DIAL = { x: 392, y: 405, r: 118, max: 200 }, CH = { x0: 580, y0: 270, w: 180, h: 270 };
function co2(t) {
  const a = span(t, 46.2, 51.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    const g = eio(seg(t, 47.0, 49.6));
    const T = lerp(20, ZOSEL_T, g), P = lerp(1, ZOSEL_P, g);
    const sc = T > TC && P > PC;
    // thermometer
    ctx.fillStyle = 'rgba(246,236,220,0.10)'; k.rrect(TH.x - 16, TH.y0, 32, TH.y1 - TH.y0, 16); ctx.fill();
    ctx.strokeStyle = C.glass; ctx.lineWidth = 3; k.rrect(TH.x - 16, TH.y0, 32, TH.y1 - TH.y0, 16); ctx.stroke();
    const ty = (v) => lerp(TH.y1 - 14, TH.y0 + 14, v / TH.max);
    ctx.fillStyle = C.hot; ctx.fillRect(TH.x - 8, ty(T), 16, TH.y1 - ty(T)); ctx.beginPath(); ctx.arc(TH.x, TH.y1 + 14, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.caf; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(TH.x - 30, ty(TC)); ctx.lineTo(TH.x + 30, ty(TC)); ctx.stroke();
    font(700, 24); text(`${Math.round(TC)} °C`, TH.x + 40, ty(TC), { color: C.caf, align: 'left' });
    font(800, 34, HEAD); text(`${Math.round(T)} °C`, TH.x, TH.y0 - 36, { color: C.ink });
    // pressure dial, 0–200 bar over 270°
    const ang = (v) => Math.PI * 0.75 + (v / DIAL.max) * Math.PI * 1.5;
    ctx.fillStyle = 'rgba(246,236,220,0.08)'; ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, DIAL.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.glass; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = C.co2Soft; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, DIAL.r - 18, ang(PC), ang(DIAL.max)); ctx.stroke();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 3;
    for (let v = 0; v <= DIAL.max; v += 25) { const an = ang(v); ctx.beginPath(); ctx.moveTo(DIAL.x + Math.cos(an) * (DIAL.r - 6), DIAL.y + Math.sin(an) * (DIAL.r - 6)); ctx.lineTo(DIAL.x + Math.cos(an) * (DIAL.r - 26), DIAL.y + Math.sin(an) * (DIAL.r - 26)); ctx.stroke(); }
    ctx.strokeStyle = C.caf; ctx.lineWidth = 5; { const an = ang(PC); ctx.beginPath(); ctx.moveTo(DIAL.x + Math.cos(an) * (DIAL.r - 2), DIAL.y + Math.sin(an) * (DIAL.r - 2)); ctx.lineTo(DIAL.x + Math.cos(an) * (DIAL.r - 32), DIAL.y + Math.sin(an) * (DIAL.r - 32)); ctx.stroke(); }
    font(700, 24); { const an = ang(PC); text(`${Math.round(PC)} bar`, DIAL.x + Math.cos(an) * (DIAL.r + 44), DIAL.y + Math.sin(an) * (DIAL.r + 24), { color: C.caf }); }
    const an = ang(P);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(DIAL.x, DIAL.y); ctx.lineTo(DIAL.x + Math.cos(an) * (DIAL.r - 34), DIAL.y + Math.sin(an) * (DIAL.r - 34)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(DIAL.x, DIAL.y, 10, 0, Math.PI * 2); ctx.fill();
    font(800, 34, HEAD); text(`${Math.round(P)} bar`, DIAL.x, DIAL.y + 64, { color: C.ink });
    // the CO₂ chamber: gas, then supercritical
    const s = seg(t, 48.4, 49.2) * (sc ? 1 : 0);
    ctx.fillStyle = `rgba(187,168,244,${0.06 + 0.3 * s})`; k.rrect(CH.x0, CH.y0, CH.w, CH.h, 20); ctx.fill();
    ctx.strokeStyle = C.glass; ctx.lineWidth = 4; k.rrect(CH.x0, CH.y0, CH.w, CH.h, 20); ctx.stroke();
    for (let i = 0; i < 22; i++) {
      const sp = lerp(1.6, 0.5, s), x = CH.x0 + 20 + ((rnd(i, 130) * (CH.w - 40) + t * 60 * sp * (rnd(i, 131) - 0.5)) % (CH.w - 40) + (CH.w - 40)) % (CH.w - 40);
      const y = CH.y0 + 20 + ((rnd(i, 132) * (CH.h - 40) + t * 50 * sp * (rnd(i, 133) - 0.5)) % (CH.h - 40) + (CH.h - 40)) % (CH.h - 40);
      ctx.fillStyle = C.co2; ctx.beginPath(); ctx.arc(x, y, lerp(5, 7, s), 0, Math.PI * 2); ctx.fill();
    }
    font(700, 26); text('CO₂', CH.x0 + CH.w / 2, CH.y0 - 30, { color: C.co2 });
    font(600, 24); text(s > 0.5 ? 'supercritical' : 'gas', CH.x0 + CH.w / 2, CH.y0 + CH.h + 38, { color: s > 0.5 ? C.co2 : C.soft });
    A(seg(t, 49.6, 50.1), () => { font(500, 22); text('part gas, part liquid', CH.x0 + CH.w / 2, CH.y0 + CH.h + 68, { color: C.soft }); });
    A(seg(t, 49.8, 50.3), () => { font(500, 22); text(`German chemist Kurt Zosel’s 1970 patent: ${ZOSEL_T} °C and ${ZOSEL_P} bar`, W / 2, 686, { color: C.soft }); });
  });
}
const V = { x0: 100, y0: 280, w: 320, h: 320 }, BED = { x0: 590, y0: 330, w: 140, h: 210 };
const V_BEANS = pile(V.x0 + 12, V.x0 + V.w - 12, V.y0, V.y0 + V.h - 8, 15, 30, 140);
const V_CAF = V_BEANS.slice(0, 11).map(([x, y], i) => [x + (rnd(i, 150) - 0.5) * 18, y - 3]);
const V_PATH = [[V.x0 + V.w / 2, V.y0 + 8], [V.x0 + V.w / 2, 216], [BED.x0 + BED.w / 2, 216], [BED.x0 + BED.w / 2, BED.y0 + 10]];
const V_STUCK = spots(11, BED.x0 + 18, BED.y0 + 40, BED.x0 + BED.w - 18, BED.y0 + BED.h - 22, 151);
function co2Beans(t) {
  const a = span(t, 51.0, 55.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    pipe([[V.x0 + V.w / 2, V.y0 + V.h + 70], [V.x0 + V.w / 2, V.y0 + V.h - 8]], 'rgba(187,168,244,0.35)');
    pipe(V_PATH, 'rgba(187,168,244,0.35)');
    pipe([[BED.x0 + BED.w / 2, BED.y0 + BED.h - 10], [BED.x0 + BED.w / 2, BED.y0 + BED.h + 70]], 'rgba(187,168,244,0.35)');
    tank(V.x0, V.y0, V.w, V.h, 0.9, C.co2Soft, t);
    // supercritical CO₂ rising through the beans
    for (let i = 0; i < 18; i++) { const u = (t * 0.35 + rnd(i, 152)) % 1; ctx.fillStyle = 'rgba(187,168,244,0.85)'; ctx.beginPath(); ctx.arc(V.x0 + 24 + rnd(i, 153) * (V.w - 48), lerp(V.y0 + V.h - 16, V.y0 + 24, u), 5, 0, Math.PI * 2); ctx.fill(); }
    V_BEANS.forEach(([x, y, r]) => bean(x, y, 30, { rot: r }));
    // carbon bed
    ctx.fillStyle = C.carbon; k.rrect(BED.x0, BED.y0, BED.w, BED.h, 14); ctx.fill();
    ctx.strokeStyle = C.carbonLine; ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(BED.x0 + 14 + rnd(i, 154) * (BED.w - 28), BED.y0 + 14 + rnd(i, 155) * (BED.h - 28), 4 + rnd(i, 156) * 4, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = C.glass; ctx.lineWidth = 3; k.rrect(BED.x0, BED.y0, BED.w, BED.h, 14); ctx.stroke();
    V_CAF.forEach((p, i) => {
      const u = eio(seg(t, 51.6 + i * 0.22, 53.4 + i * 0.22));
      const pos = along([p, [p[0], V.y0 + 30], ...V_PATH, V_STUCK[i]], u);
      caf(pos[0], pos[1], 8);
    });
    font(600, 24); text('moist beans', V.x0 + V.w / 2, V.y0 + V.h + 100, { color: C.soft });
    text('activated carbon', BED.x0 + BED.w / 2, BED.y0 + BED.h + 100, { color: C.ink });
    font(500, 22); text('catches the caffeine', BED.x0 + BED.w / 2, BED.y0 + BED.h + 130, { color: C.caf });
    font(700, 24); text('CO₂ in', V.x0 + V.w / 2 + 70, V.y0 + V.h + 50, { color: C.co2, align: 'left' });
  });
}

// ---------- I: what is left ----------
function cups(t) {
  const a = span(t, 55.4, 60.2, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text(`caffeine in an 8-ounce cup (about ${Math.round(CUP_ML / 10) * 10} mL)`, W / 2, 170, { color: C.soft });
    const cupsAt = [[262, 'regular', CUP_REG, CUP_REG], [602, 'decaf', CUP_DECAF[0], CUP_DECAF[1]]];
    cupsAt.forEach(([x, lab, lo, hi], ci) => {
      const y0 = 250, y1 = 560, wt = 230, wb = 180;
      // the cup
      ctx.fillStyle = '#efe6d6'; ctx.beginPath(); ctx.moveTo(x - wt / 2, y0); ctx.lineTo(x + wt / 2, y0); ctx.lineTo(x + wb / 2, y1); ctx.quadraticCurveTo(x, y1 + 18, x - wb / 2, y1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#efe6d6'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x + wt / 2 - 6, (y0 + y1) / 2 - 10, 46, -Math.PI / 2.4, Math.PI / 2.4); ctx.stroke();
      ctx.fillStyle = '#3a2213'; ctx.beginPath(); ctx.ellipse(x, y0 + 4, wt / 2 - 6, 12, 0, 0, Math.PI * 2); ctx.fill();
      // dots: 1 mg each, 10 a row, filling up from the bottom
      const show = eio(seg(t, 56.0 + ci * 0.9, 57.4 + ci * 0.9));
      for (let i = 0; i < hi; i++) {
        if (i / hi > show) break;
        const r = Math.floor(i / 10), c = i % 10, dx = x - 81 + c * 18, dy = y1 - 26 - r * 26;
        if (i < lo) caf(dx, dy, 7); else A(0.9, () => { ctx.strokeStyle = C.cafDark; ctx.lineWidth = 2.5; ctx.beginPath(); for (let j = 0; j < 6; j++) { const an = Math.PI / 6 + (j * Math.PI) / 3; const px = dx + Math.cos(an) * 7, py = dy + Math.sin(an) * 7; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke(); });
      }
      font(700, 28); text(lab, x, 222, { color: ci ? C.bean : C.ink });
      A(seg(t, 57.0 + ci * 0.9, 57.5 + ci * 0.9), () => { font(800, 36, HEAD); text(lo === hi ? `about ${lo} mg` : `about ${lo} to ${hi} mg`, x, 616, { color: C.caf }); });
    });
    A(seg(t, 58.4, 58.9), () => {
      font(700, 30, HEAD); text(`about ${REMOVED}% removed, ≈ ${Math.round(left)} mg left`, W / 2, 680, { color: C.ink });
      font(500, 22); text('US National Coffee Association figures; 1 hexagon = 1 mg', W / 2, 718, { color: C.faint });
    });
  });
}
function residue(t) {
  const a = seg(t, 60.0, 60.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 26); text(`most methylene chloride allowed in ${SACK_KG} kg of decaf`, W / 2, 170, { color: C.soft });
    // a sack of beans
    const sx = 250, sy = 430;
    ctx.fillStyle = '#b08a5a';
    ctx.beginPath(); ctx.moveTo(sx - 120, sy - 120); ctx.quadraticCurveTo(sx, sy - 150, sx + 120, sy - 120); ctx.quadraticCurveTo(sx + 160, sy + 40, sx + 120, sy + 150);
    ctx.quadraticCurveTo(sx, sy + 175, sx - 120, sy + 150); ctx.quadraticCurveTo(sx - 160, sy + 40, sx - 120, sy - 120); ctx.fill();
    ctx.strokeStyle = 'rgba(60,35,15,0.35)'; ctx.lineWidth = 2;
    for (let y = sy - 120; y < sy + 150; y += 9) { ctx.beginPath(); ctx.moveTo(sx - 135, y); ctx.lineTo(sx + 135, y); ctx.stroke(); }
    ctx.fillStyle = '#8b6a40'; ctx.beginPath(); ctx.ellipse(sx, sy - 128, 92, 20, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 9; i++) bean(sx - 64 + i * 16, sy - 136 + Math.sin(i * 1.7) * 6, 14, { rot: rnd(i, 160) * 3 });
    font(800, 40, HEAD); text(`${SACK_KG} kg`, sx, sy + 20, { color: '#3b2412' });
    // the two limits as heaps with area ∝ mass
    const heaps = [[520, 350, US_G, 'United States', `${US_PPM} parts per million`], [520, 560, EU_G, 'European Union', `${EU_MG_KG} mg per kg`]];
    heaps.forEach(([x, y, g, l1, l2], i) => {
      const u = back(seg(t, 60.8 + i * 1.6, 61.4 + i * 1.6));
      if (u <= 0) return;
      const r = 34 * Math.sqrt(g / US_G) * u;
      ctx.fillStyle = C.liq; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      A(seg(t, 61.2 + i * 1.6, 61.6 + i * 1.6), () => {
        font(700, 26); text(l1, x + 66, y - 36, { color: C.ink, align: 'left' });
        font(800, 32, HEAD); text(`at most ${n1(g)} g`, x + 66, y + 2, { color: C.liq, align: 'left' });
        font(500, 22); text(l2, x + 66, y + 38, { color: C.soft, align: 'left' });
      });
    });
    A(seg(t, 63.4, 63.9), () => { font(500, 22); text('limits for roasted decaf; heaps not to scale with the sack', W / 2, 700, { color: C.faint }); });
  });
}

Kit.scene({
  width: W, height: H, duration: 65.0, fonts: [HEAD, TXT],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    ctx.save(); ctx.translate(0, 24);
    hook(t);
    onePercent(t);
    swell(t);
    dissolve(t);
    direct(t);
    indirect(t);
    swiss(t);
    co2(t);
    co2Beans(t);
    cups(t);
    residue(t);
    ctx.restore();
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 790, size: 38, weight: 500, family: TXT, ink: C.ink, marks: { '*': C.caf, '~': C.fla, '^': C.liq } });
  },
});
