// Explainer for economics-us-inflation-basket-weights: on 14 October 2026 the US Bureau of Labor Statistics
// reported consumer prices up 3.7% in a year to September 2026, but only 2.6% without food and energy. Look: a
// night-blue counter with a paper receipt; a 10 × 10 grid of cents for the basket's weights; shelter teal,
// food green, energy orange, everything else slate. Playfair Display for the big numbers, Patrick Hand for the
// receipt and the notes.
//
// Computed here: each group's share of the basket a year earlier, estimated as its August 2026 relative
// importance divided by (1 + its 12-month price change), then rescaled to 100; each group's contribution to the
// 12-month rise, share × change (energy ≈ 1.3, food ≈ 0.3, everything else ≈ 2.1 points, adding to 3.7); a
// $100 basket at +3.7%; an illustrative household spending 15% on energy.
// Facts: BLS, Consumer Price Index news release for September 2026 (released 14 October 2026; archived at
// https://www.bls.gov/news.release/archives/cpi_10142026.htm): all items
// +3.7% over 12 months before seasonal adjustment (+0.6% in September, seasonally adjusted); all items less
// food and energy +2.6%; energy +20.4%; gasoline +34.2%; food +2.5%; shelter +3.2%; gasoline rose 9.1% in
// September, "accounting for over half of the monthly all items increase". Table 1, relative importance in
// August 2026: food 13.507, energy 7.418, gasoline 3.853, shelter 35.323, all items less food and energy 79.075.
// BLS, CPI questions and answers: prices of about 80,000 items each month; more than 200 categories; weights
// from the Consumer Expenditure Surveys; some users follow the index less food and energy because those prices
// are relatively volatile.
//
// Scene plan (64.6 s). Important things stay above y = 930; captions are centred at y = 846.
//  A  0.0– 9.2  The two numbers: 3.7% and 2.6%.
//  B  9.2–23.0  The basket: 80,000 prices; $100 → $103.70; weights as cents of a dollar.
//  C 23.0–41.4  Shares, price changes, and each group's push: share × change.
//  D 41.4–64.6  Core inflation; September's gasoline; your own basket.
const W = 864, H = 1080;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#111b27', bg2: '#1c2b3c', ink: '#f4f1ea', soft: 'rgba(244,241,234,0.72)', faint: 'rgba(244,241,234,0.20)',
  paper: '#fbf7ee', paperInk: '#24303f', paperSoft: 'rgba(36,48,63,0.6)',
  shelter: '#4fb3bf', food: '#8cc152', energy: '#f28c28', other: '#8e9aab', red: '#e8504a', gold: '#f4c95d', panel: 'rgba(6,10,16,0.75)',
};
const BIG = 'Playfair Display', HAND = 'Patrick Hand';

let k, ctx;
const font = (w, s, f = HAND) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- the official figures (BLS, September 2026) ----------
const ALL = 3.7, CORE = 2.6, ENERGY = 20.4, GASOLINE = 34.2, FOOD = 2.5, SHELTER = 3.2, SEPT_GAS = 9.1;
const RI = { food: 13.507, energy: 7.418, core: 79.075, shelter: 35.323 }; // relative importance, August 2026
// shares a year earlier: deflate each by its own price rise, then rescale to 100
const base = { food: RI.food / (1 + FOOD / 100), energy: RI.energy / (1 + ENERGY / 100), core: RI.core / (1 + CORE / 100) };
const total = base.food + base.energy + base.core;
const SHARE = { food: (100 * base.food) / total, energy: (100 * base.energy) / total, core: (100 * base.core) / total }; // ≈ 13.7, 6.4, 79.9
const PUSH = { energy: (SHARE.energy * ENERGY) / 100, food: (SHARE.food * FOOD) / 100, core: (SHARE.core * CORE) / 100 }; // points
const PUSH_SUM = PUSH.energy + PUSH.food + PUSH.core; // ≈ 3.7
const DRIVER = { energy: 15, food: SHARE.food }; // an illustrative household
const DRIVER_RATE = (DRIVER.energy * ENERGY + DRIVER.food * FOOD + (100 - DRIVER.energy - DRIVER.food) * CORE) / 100; // ≈ 5.3
const f1 = (x) => x.toFixed(1);

// the 100 cents of the basket (August 2026 weights, rounded): shelter, food, energy, everything else
const CENTS = (() => {
  const s = Math.round(RI.shelter), f = Math.round(RI.food), e = Math.round(RI.energy);
  return [...Array(s).fill('shelter'), ...Array(f).fill('food'), ...Array(e).fill('energy'), ...Array(100 - s - f - e).fill('other')];
})();

const CUES = [
  [0.4, 4.6, `On 14 October 2026, the US Bureau of Labor Statistics said prices were up *${ALL}%* in a year.`],
  [4.8, 9.0, `Leave out food and energy, and they were up only ^${CORE}%^. How can both be true?`],
  [9.2, 13.6, 'Its consumer price index follows a *basket*: about 80,000 prices, checked every month.'],
  [13.8, 18.2, `A basket that cost $100 in September 2025 cost about *$${(100 + ALL).toFixed(2)}* a year later.`],
  [18.4, 22.8, 'Each part of the basket counts by how much people spend on it: its *weight*.'],
  [23.0, 27.4, `Shelter, the cost of housing, is over a third of it. Energy is only about ~${Math.round(RI.energy)}%~.`],
  [27.6, 32.0, `But over the year energy prices jumped ~${ENERGY}%~, and gasoline alone ~${GASOLINE}%~.`],
  [32.2, 36.6, 'A part’s push on inflation is its *weight times its price change*.'],
  [36.8, 41.2, `So energy, a small slice, added about ~${f1(PUSH.energy)} points~ of the ${ALL}.`],
  [41.4, 45.8, `Food added about ${f1(PUSH.food)}, and everything else together about ${f1(PUSH.core)}.`],
  [46.0, 50.4, `Everything but food and energy rose ^${CORE}%^: what economists call *core* inflation.`],
  [50.6, 55.0, 'Food and energy prices swing the most, so core shows the slower, underlying trend.'],
  [55.2, 59.6, `In September alone, gasoline rose ${SEPT_GAS}% and made up over half of that month’s rise.`],
  [59.8, 64.2, 'Your own basket differs: drive more, and energy weighs more in your inflation.'],
];

// ---------- background ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(244,241,234,0.035)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 36) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y < H; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
}

function panel(x, y, w, h, r = 14) { ctx.fillStyle = C.panel; k.rrect(x, y, w, h, r); ctx.fill(); }
const colour = (c) => C[c];

/** A receipt: a paper strip with a zigzag bottom edge. */
function receipt(x, y, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 6, y + 8, w, h);
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
  for (let i = 0; i <= 20; i++) ctx.lineTo(x + w - (i * w) / 20, y + h + (i % 2 ? 10 : 0));
  ctx.closePath(); ctx.fill();
}

// ---------- A: the two numbers ----------
function sceneNumbers(t) {
  const a = 1 - seg(t, 8.9, 9.5);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.3, 1.0)), () => {
      font(400, 30); text('US consumer prices, September 2025 to September 2026', W / 2, 150, { color: C.soft, align: 'center' });
      k.font(800, 190, BIG); text(`${ALL}%`, W / 2, 330, { color: C.gold, align: 'center' });
      font(400, 36); text('all items', W / 2, 450, { color: C.ink, align: 'center' });
    });
    A(eout(seg(t, 4.8, 5.6)), () => {
      k.font(800, 120, BIG); text(`${CORE}%`, W / 2, 590, { color: C.shelter, align: 'center' });
      font(400, 34); text('without food and energy', W / 2, 680, { color: C.ink, align: 'center' });
    });
  });
}

// ---------- B: the basket ----------
function gridOfCents(t, x0, y0, cell, { from = 0, dim = () => 1, labels = false } = {}) {
  CENTS.forEach((c, i) => {
    const r = Math.floor(i / 10), col = i % 10, g = eout(seg(t, from + i * 0.012, from + 0.3 + i * 0.012));
    if (g <= 0) return;
    A(g * dim(c), () => { ctx.fillStyle = colour(c); k.rrect(x0 + col * cell, y0 + r * cell, cell - 5, cell - 5, 4); ctx.fill(); });
  });
}

function sceneBasket(t) {
  const a = span(t, 9.2, 23.0, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    // the receipt prints
    A(1 - seg(t, 18.2, 18.7), () => {
      const lines = [['Rent and housing', ''], ['Groceries', ''], ['Restaurant meals', ''], ['Gasoline', ''], ['Electricity', ''], ['Used cars', ''], ['Doctor visits', ''], ['Airline fares', ''], ['Clothes', ''], ['… about 80,000 prices', '']];
      const shown = Math.floor(clamp((t - 9.6) / 0.32, 0, lines.length));
      const h = 80 + shown * 38;
      receipt(232, 120, 400, Math.max(90, h));
      font(400, 30); text('THE BASKET', W / 2, 160, { color: C.paperInk, align: 'center', spacing: '3px' });
      lines.slice(0, shown).forEach(([name], i) => { font(400, 28); text(name, 262, 210 + i * 38, { color: i === lines.length - 1 ? C.paperSoft : C.paperInk }); });
      // the price of the whole basket, a year apart
      A(seg(t, 13.8, 14.4), () => {
        panel(120, 600, 624, 150, 16);
        font(400, 30); text('Sept 2025', 210, 640, { color: C.soft, align: 'center' }); text('Sept 2026', 654, 640, { color: C.soft, align: 'center' });
        k.font(800, 64, BIG); text('$100', 210, 700, { color: C.ink, align: 'center' });
        const v = 100 + ALL * eio(seg(t, 14.4, 16.4));
        text(`$${v.toFixed(2)}`, 654, 700, { color: C.gold, align: 'center' });
        ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(320, 680); ctx.lineTo(500, 680); ctx.stroke();
        ctx.fillStyle = C.soft; ctx.beginPath(); ctx.moveTo(514, 680); ctx.lineTo(498, 670); ctx.lineTo(498, 690); ctx.fill();
      });
    });
    // the weights, as the 100 cents of a dollar
    A(span(t, 18.4, 23.0, 0.4, 0.4), () => {
      font(400, 30); text('every dollar spent, as 100 cents', W / 2, 150, { color: C.soft, align: 'center' });
      gridOfCents(t, 212, 190, 46, { from: 18.6 });
    });
  });
}

// ---------- C: shares, changes and pushes ----------
function sceneWeights(t) {
  const a = span(t, 23.0, 41.4, 0.5, 0.5);
  if (a <= 0) return;
  A(a, () => {
    if (t < 27.8) {
      // the grid with its groups named
      font(400, 30); text('every dollar spent, as 100 cents', W / 2, 150, { color: C.soft, align: 'center' });
      gridOfCents(t, 212, 190, 46, { from: -10 });
      const tags = [['shelter', `shelter ${Math.round(RI.shelter)}¢`, 46, 280], ['food', `food ${Math.round(RI.food)}¢`, 46, 400], ['energy', `energy ${Math.round(RI.energy)}¢`, 690, 440], ['other', 'everything else', 690, 560]];
      tags.forEach(([c, lab, x, y], i) => A(eout(seg(t, 23.2 + i * 0.4, 23.7 + i * 0.4)), () => {
        ctx.fillStyle = C.panel; k.rrect(x - 8, y - 24, 170, 48, 8); ctx.fill();
        font(400, 30); text(lab, x, y, { color: colour(c) });
      }));
    } else if (t < 32.4) {
      // price changes over the year
      panel(60, 120, 744, 600, 18);
      font(400, 30); text('price change, Sept 2025 to Sept 2026', 96, 170, { color: C.soft });
      const rows = [['gasoline', GASOLINE, 'energy'], ['all energy', ENERGY, 'energy'], ['shelter', SHELTER, 'shelter'], ['food', FOOD, 'food'], ['all but food & energy', CORE, 'other']];
      const x0 = 380, s = 9;
      rows.forEach(([name, v, c], i) => {
        const y = 250 + i * 92, g = eout(seg(t, 27.8 + i * 0.25, 28.6 + i * 0.25));
        font(400, 30); text(name, 96, y, { color: C.ink });
        ctx.fillStyle = colour(c); ctx.fillRect(x0, y - 20, v * s * g, 40);
        A(g, () => { k.font(700, 32, BIG); text(`+${v}%`, x0 + v * s * g + 14, y, { color: colour(c) }); });
      });
    } else {
      // pushes: share × change, stacked into the 3.7
      panel(60, 120, 744, 600, 18);
      font(400, 30); text('each group’s push = its share × its price change', 96, 170, { color: C.soft });
      const rows = [['energy', SHARE.energy, ENERGY, PUSH.energy], ['food', SHARE.food, FOOD, PUSH.food], ['everything else', SHARE.core, CORE, PUSH.core]];
      const keyc = ['energy', 'food', 'other'];
      rows.forEach(([name, share, change, push], i) => {
        const y = 250 + i * 80, g = eout(seg(t, 32.6 + i * 0.7, 33.2 + i * 0.7));
        A(g, () => {
          font(400, 30); text(name, 96, y, { color: colour(keyc[i]) });
          text(`${f1(share)}% × ${change}% ≈`, 360, y, { color: C.ink });
          k.font(700, 34, BIG); text(`${f1(push)}`, 640, y, { color: colour(keyc[i]) });
          font(400, 26); text('points', 700, y + 2, { color: C.soft });
        });
      });
      font(400, 24); text('shares are a year earlier, estimated from the BLS weights', 96, 480, { color: C.soft });
      // the stacked bar
      const g = eio(seg(t, 36.8, 38.6)), bx = 96, bw = 672, by = 540, sc = bw / 4;
      let x = bx;
      [['energy', PUSH.energy], ['food', PUSH.food], ['other', PUSH.core]].forEach(([c, v], i) => {
        const w = v * sc * clamp(g * 3 - i, 0, 1);
        ctx.fillStyle = colour(c); ctx.fillRect(x, by, w, 60); x += w;
      });
      ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 60);
      for (let p = 0; p <= 4; p++) { font(400, 24); text(`${p}`, bx + p * sc, by + 88, { color: C.soft, align: 'center' }); }
      A(seg(t, 38.6, 39.0), () => { k.font(800, 40, BIG); text(`= ${f1(PUSH_SUM)}%`, bx + PUSH_SUM * sc - 4, by - 30, { color: C.gold, align: 'center' }); });
      // circle the energy part
      A(span(t, 36.8, 41.4, 0.6, 0.3), () => { ctx.strokeStyle = C.energy; ctx.lineWidth = 4; ctx.strokeRect(bx - 4, by - 4, PUSH.energy * sc + 8, 68); });
    }
  });
}

// ---------- D: core, September, your basket ----------
function sceneCore(t) {
  const a = span(t, 41.4, 64.6, 0.5, 0.01);
  if (a <= 0) return;
  A(a, () => {
    if (t < 46.2) {
      // the pushes again, as a split bar labelled
      panel(60, 120, 744, 600, 18);
      const bx = 96, bw = 672, by = 330, sc = bw / 4;
      let x = bx;
      [['energy', PUSH.energy, 'energy'], ['food', PUSH.food, 'food'], ['other', PUSH.core, 'everything else']].forEach(([c, v, name], i) => {
        ctx.fillStyle = colour(c); ctx.fillRect(x, by, v * sc, 70);
        A(eout(seg(t, 41.6 + i * 0.5, 42.1 + i * 0.5)), () => {
          k.font(700, 36, BIG); text(f1(v), x + (v * sc) / 2, by + 36, { color: C.bg1, align: 'center' });
          font(400, 28); text(name, x + (v * sc) / 2, by + (i === 1 ? -36 : 110), { color: colour(c), align: 'center' });
        });
        x += v * sc;
      });
      font(400, 30); text('points of the 3.7% rise', W / 2, 190, { color: C.soft, align: 'center' });
    } else if (t < 55.4) {
      // core: grey out food and energy
      A(1 - seg(t, 50.4, 50.9), () => {
        font(400, 30); text('core: the basket without food and energy', W / 2, 150, { color: C.soft, align: 'center' });
        const out = eio(seg(t, 46.4, 47.6));
        gridOfCents(t, 212, 190, 46, { from: -10, dim: (c) => (c === 'food' || c === 'energy' ? 1 - 0.8 * out : 1) });
        A(seg(t, 47.6, 48.2), () => {
          ctx.fillStyle = C.panel; k.rrect(W / 2 - 150, 380, 300, 130, 16); ctx.fill();
          k.font(800, 80, BIG); text(`${CORE}%`, W / 2, 448, { color: C.shelter, align: 'center' });
        });
      });
      // the swings: a jittery energy line and a calm core line
      A(span(t, 50.6, 55.4, 0.4, 0.4), () => {
        panel(60, 120, 744, 600, 18);
        font(400, 30); text('how prices wobble: a sketch, not data', 96, 170, { color: C.soft });
        let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
        const N = 36, x0 = 100, x1 = 764, g = eio(seg(t, 50.8, 53.4));
        ctx.lineWidth = 4;
        ctx.strokeStyle = C.energy; ctx.beginPath();
        for (let i = 0; i <= N * g; i++) { const x = lerp(x0, x1, i / N), y = 420 - (r() - 0.5) * 300; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
        ctx.strokeStyle = C.shelter; ctx.beginPath();
        for (let i = 0; i <= N * g; i++) { const x = lerp(x0, x1, i / N), y = 430 - Math.sin(i / 6) * 14; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
        font(400, 30); text('energy prices', 100, 640, { color: C.energy }); text('core', 400, 640, { color: C.shelter });
      });
    } else if (t < 59.9) {
      // September: gasoline was over half of the month's rise
      panel(60, 120, 744, 600, 18);
      font(400, 30); text('September 2026 alone, seasonally adjusted', 96, 170, { color: C.soft });
      k.font(800, 110, BIG); text('+0.6%', W / 2, 300, { color: C.gold, align: 'center' });
      font(400, 30); text('all items, in one month', W / 2, 380, { color: C.ink, align: 'center' });
      const g = eio(seg(t, 55.8, 57.4)), bx = 160, bw = 544;
      ctx.fillStyle = C.faint; ctx.fillRect(bx, 460, bw, 60);
      ctx.fillStyle = C.energy; ctx.fillRect(bx, 460, bw * 0.5 * g, 60);
      A(seg(t, 57.2, 57.6), () => { ctx.fillStyle = C.energy; ctx.beginPath(); ctx.moveTo(bx + bw / 2 + 4, 466); ctx.lineTo(bx + bw / 2 + 34, 490); ctx.lineTo(bx + bw / 2 + 4, 514); ctx.fill(); });
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + bw / 2, 446); ctx.lineTo(bx + bw / 2, 534); ctx.stroke();
      font(400, 28); text('half', bx + bw / 2, 560, { color: C.ink, align: 'center' });
      A(seg(t, 57.4, 57.9), () => { font(400, 30); text(`gasoline, +${SEPT_GAS}%: over half`, bx, 620, { color: C.energy }); });
    } else {
      // your basket: a household spending 15% on energy
      panel(60, 120, 744, 600, 18);
      font(400, 30); text('same prices, different baskets', 96, 170, { color: C.soft });
      const rows = [['average basket', SHARE.energy, ALL], ['a household spending 15% on energy', DRIVER.energy, DRIVER_RATE]];
      rows.forEach(([name, e, rate], i) => {
        const y = 260 + i * 190, g = eout(seg(t, 60.0 + i * 1.0, 60.6 + i * 1.0));
        A(g, () => {
          font(400, 30); text(name, 96, y, { color: C.ink });
          ctx.fillStyle = C.faint; ctx.fillRect(96, y + 30, 480, 40);
          ctx.fillStyle = C.energy; ctx.fillRect(96, y + 30, 480 * (e / 100), 40);
          font(400, 24); text(`energy ${f1(e)}%`, 96, y + 96, { color: C.energy });
          k.font(800, 64, BIG); text(`${f1(rate)}%`, 700, y + 52, { color: i ? C.red : C.gold, align: 'right' });
        });
      });
      A(seg(t, 62.0, 62.5), () => { font(400, 24); text('bars: share of spending on energy; the household is an example', 96, 680, { color: C.soft }); });
    }
  });
}

Kit.scene({
  width: W, height: H, duration: 64.6, fonts: [BIG, HAND],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneNumbers(t);
    sceneBasket(t);
    sceneWeights(t);
    sceneCore(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 44, lh: 50, weight: 400, family: HAND, ink: C.ink, marks: { '*': C.gold, '~': C.energy, '^': C.shelter } });
  },
});
