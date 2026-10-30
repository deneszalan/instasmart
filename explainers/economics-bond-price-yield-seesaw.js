// Explainer for economics-bond-price-yield-seesaw: on 21 October 2026 the yield on France's 10-year government
// bonds rose past 5%, the highest since 2002. What that means: a bond's payments are fixed, so the only thing that
// moves is the price buyers pay for them; pay less and the same payments earn more, so price and yield move like a
// seesaw. Look: midnight-blue banking hall, a cream bond certificate with tear-off coupons, a brass seesaw.
// Bitter for the certificate and numbers, Jost for captions.
//
// Facts:
// - France 24 / AFP, "Five things to know as French bond yield tops 5%" (21 October 2026): the yield on the
//   benchmark 10-year French government bond rose past 5% on Wednesday, the highest since 2002, in a sell-off
//   driven by a budget standoff and violent protests; the gap with German bonds widened to 1.6 percentage points,
//   "the extra payment investors demand to hold French rather than German bonds"; a bond's yield measures the
//   interest paid relative to its price: yields rise as prices fall (a 100-euro bond paying 1 euro yields 1%; at a
//   price of 50 euros, 2%); German debt about 66% of GDP, France almost 120%.
// - The Edge Malaysia (wire report, 21 October 2026): touched 5.002% at 0914 GMT; about 157 basis points over Bunds.
// - SEC Investor Bulletin "Interest rate risk — When interest rates go up, prices of fixed-rate bonds fall"
//   (sec.gov/files/ib_interestraterisk.pdf): market interest rates and bond prices move in opposite directions, like
//   a seesaw; interest payments are "coupon payments"; yield to maturity "shows how much an investor's money will
//   earn if the bond is held until it matures"; example: a 3% Treasury (semi-annual coupons, $1,000, 10 years) is
//   worth $925 a year later if rates rise to 4%, and $1,082 if they fall to 2% (both reproduced below); longer
//   maturity and lower coupons mean bigger price swings.
// Computed here: prices and yields of an example bond (€100, 3% a year, 10 years, annual coupons) by discounting:
// 4% → €91.9, 5% → €84.6; the SEC's two prices as a check.
//
// Scene plan (60.4 s). Important things stay above y = 760; captions are centred at y = 846.
//  A  0.0– 9.4  Hook: France's 10-year yield passes 5%; a bond is a fixed promise.
//  B  9.6–32.4  The example bond; resale; price €100 → 3%, €92 → 4%, €85 → 5%: the seesaw.
//  C 32.6–41.6  Why prices fall; the yield as the going rate.
//  D 41.8–60.4  France vs Germany: the spread; new borrowing; reading the headline.
const W = 864, H = 1080, CX = W / 2;
const { clamp, seg, lerp, span } = Kit;
const { inOut: eio, out: eout, back } = Kit.ease;

const C = {
  bg1: '#141b33', bg2: '#0a0f1f', ink: '#f4efe4', soft: 'rgba(244,239,228,0.72)', faint: 'rgba(244,239,228,0.25)',
  paper: '#f3ead6', paper2: '#e6d9bc', paperInk: '#2b2418', paperSoft: 'rgba(43,36,24,0.6)', guil: 'rgba(120,92,40,0.35)',
  brass: '#d4a94e', brass2: '#a77f2e', price: '#7cc4f0', yield: '#f59e7a', fr: '#8fb3ff', de: '#e9e2c9', panel: 'rgba(0,0,0,0.32)',
};
const SER = 'Bitter', SANS = 'Jost';

let k, ctx;
const font = (w, s, f = SANS) => k.font(w, s, f);
const text = (s, x, y, o = {}) => k.text(s, x, y, { color: C.ink, base: 'middle', ...o });
const A = (a, fn) => k.alpha(a, fn);

// ---------- bond maths ----------
/** Price of a bond paying `coupon` per period for `n` periods and `face` at the end, at yield `y` per period. */
const price = (y, { coupon, n, face }) => { let p = 0; for (let i = 1; i <= n; i++) p += coupon / Math.pow(1 + y, i); return p + face / Math.pow(1 + y, n); };
/** The yield per period that makes the payments worth `p` (bisection). */
function yieldAt(p, bond) { let lo = -0.5, hi = 1; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (price(m, bond) > p) lo = m; else hi = m; } return (lo + hi) / 2; }
const EX = { coupon: 3, n: 10, face: 100 }; // the example bond: €100, 3% a year, 10 years
const P4 = price(0.04, EX), P5 = price(0.05, EX); // 91.89, 84.56
// The SEC's check: $1,000, 3% a year paid half-yearly, 9 years left: 4% → $925, 2% → $1,082.
const SEC = { coupon: 15, n: 18, face: 1000 };
if (Math.round(price(0.02, SEC)) !== 925 || Math.round(price(0.01, SEC)) !== 1082) throw new Error('SEC example should give $925 and $1,082');
if (Math.abs(yieldAt(P5, EX) - 0.05) > 1e-9) throw new Error('yield should invert price');
const FR = 5.0, SPREAD = 1.6; // France 24 / AFP
const eur = (v) => `€${v.toFixed(0)}`;

const CUES = [
  [0.4, 4.8, 'On 21 October 2026, the yield on France’s 10-year government bonds passed ^5%^, the highest since 2002.'],
  [5.0, 9.4, 'A bond is a loan with fixed terms: the government promises set payments, then the money back.'],
  [9.6, 14.0, 'An example: lend *€100* for 10 years, get ^€3^ every year, then your *€100* back at the end.'],
  [14.2, 18.6, 'Those promises never change. But the bond can be sold on, at whatever price a buyer will pay.'],
  [18.8, 23.2, 'Pay *€100* and you earn ^3%^ a year. What you earn on the price you paid is the bond’s ^yield^.'],
  [23.4, 27.8, `Pay only *${eur(P4)}*, and €3 a year plus an €8 gain at the end work out at ^4%^ a year.`],
  [28.0, 32.4, `At about *${eur(P5)}*, the same promises yield ^5%^. Price down, yield up: a seesaw.`],
  [32.6, 37.0, 'Prices fall when new loans pay more, or when lenders want more for the risk they take.'],
  [37.2, 41.6, 'So a bond’s yield is the going rate for lending to that government for that long.'],
  [41.8, 46.2, `On 21 October, lenders wanted about ${SPREAD} points more a year from ~France~ than from Germany.`],
  [46.4, 50.8, 'That gap is the ~spread~. Reports linked the sell-off to a budget standoff and protests.'],
  [51.0, 55.4, 'Old bonds keep their coupons. The higher yield is what new borrowing will cost.'],
  [55.6, 60.0, 'So when you read that bond yields are rising, bond prices are falling.'],
];

// ---------- background: a banking hall at night ----------
let bg = null;
function paintBg() {
  bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const g = bg.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, C.bg1); lg.addColorStop(1, C.bg2);
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  // faint columns
  for (let i = 0; i < 6; i++) {
    const x = 36 + i * 160;
    const cg = g.createLinearGradient(x, 0, x + 70, 0);
    cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(0.5, 'rgba(255,240,210,0.035)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = cg; g.fillRect(x, 0, 70, 790);
  }
  let s = 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,240,210,${r() * 0.025})`; g.fillRect(r() * W, r() * H, 1 + r(), 1 + r()); }
}

// ---------- the certificate ----------
function certificate(x, y, w, h, o = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; k.rrect(x + 8, y + 10, w, h, 10); ctx.fill();
  ctx.fillStyle = C.paper; k.rrect(x, y, w, h, 10); ctx.fill();
  // guilloche border
  ctx.strokeStyle = C.guil; ctx.lineWidth = 1.4;
  for (let j = 0; j < 3; j++) {
    ctx.beginPath();
    const n = 120, m = 14 + j * 2;
    for (let i = 0; i <= n; i++) {
      const u = i / n, px = x + 14 + u * (w - 28);
      const py = y + 18 + Math.sin(u * Math.PI * m) * 5;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const u = i / n, px = x + 14 + u * (w - 28);
      const py = y + h - 18 - Math.sin(u * Math.PI * m) * 5;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120,92,40,0.55)'; ctx.lineWidth = 2; k.rrect(x + 8, y + 8, w - 16, h - 16, 6); ctx.stroke();
  if (o.title) { font(800, o.ts ?? 30, SER); text(o.title, x + w / 2, y + 62, { align: 'center', color: C.paperInk }); }
  if (o.lines) o.lines.forEach((s, i) => { font(500, o.ls ?? 22, SER); text(s, x + w / 2, y + 104 + i * 32, { align: 'center', color: C.paperSoft }); });
}
/** A coupon: a small ticket with a perforated edge. */
function coupon(x, y, s, label, a = 1, gone = 0) {
  A(a, () => {
    ctx.save(); ctx.translate(x, y - gone * 40); ctx.rotate(gone * 0.25);
    ctx.fillStyle = C.paper2; k.rrect(-s / 2, -s * 0.36, s, s * 0.72, 5); ctx.fill();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(43,36,24,0.45)'; ctx.lineWidth = 1.6; k.rrect(-s / 2 + 4, -s * 0.36 + 4, s - 8, s * 0.72 - 8, 4); ctx.stroke(); ctx.setLineDash([]);
    font(800, s * 0.4, SER); text(label, 0, 1, { align: 'center', color: C.paperInk });
    ctx.restore();
  });
}

// ---------- the seesaw ----------
/** A brass seesaw: price on the left, yield on the right; `tilt` > 0 lifts the yield end. */
function seesaw(cx, cy, len, tilt, pLabel, yLabel) {
  // pivot
  ctx.fillStyle = C.brass2; ctx.beginPath(); ctx.moveTo(cx - 44, cy + 92); ctx.lineTo(cx + 44, cy + 92); ctx.lineTo(cx, cy + 6); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-tilt);
  ctx.fillStyle = C.brass; k.rrect(-len / 2, -10, len, 20, 10); ctx.fill();
  // the two seats
  const seat = (x, col, s) => { ctx.fillStyle = col; k.rrect(x - 82, -78, 164, 64, 14); ctx.fill(); ctx.save(); ctx.translate(x, -46); ctx.rotate(tilt); font(800, 34, SER); text(s, 0, 2, { align: 'center', color: '#0a0f1f' }); ctx.restore(); };
  seat(-len / 2 + 90, C.price, pLabel);
  seat(len / 2 - 90, C.yield, yLabel);
  ctx.restore();
  font(600, 22); text('price', cx - len / 2 + 90 * Math.cos(tilt), cy + 120, { align: 'center', color: C.price });
  text('yield', cx + len / 2 - 90 * Math.cos(tilt), cy + 120, { align: 'center', color: C.yield });
}

// ---------- A: the hook ----------
function sceneHook(t) {
  const a = 1 - seg(t, 9.2, 9.6);
  if (a <= 0) return;
  A(a, () => {
    A(eout(seg(t, 0.2, 1.0)), () => {
      font(600, 24); text('FRANCE · 10-YEAR GOVERNMENT BONDS · 21 OCTOBER 2026', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    });
    // a gauge: the 10-year yield reaches 5%
    const rise = eio(seg(t, 0.8, 3.2));
    const gx = 250, yTop = 220, yBot = 600;
    const Y = (v) => lerp(yBot, yTop, v / 6);
    A(seg(t, 0.4, 1.0) * (1 - seg(t, 4.8, 5.4)), () => {
      ctx.fillStyle = C.panel; k.rrect(gx - 34, yTop - 20, 68, yBot - yTop + 40, 34); ctx.fill();
      for (let v = 0; v <= 6; v++) {
        ctx.strokeStyle = v === 5 ? C.yield : C.faint; ctx.lineWidth = v === 5 ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(gx - 60, Y(v)); ctx.lineTo(gx - 40, Y(v)); ctx.stroke();
        font(600, 22, SER); text(`${v}%`, gx - 70, Y(v), { align: 'right', color: v === 5 ? C.yield : C.soft });
      }
      const v = FR * rise;
      const lg = ctx.createLinearGradient(0, yBot, 0, Y(FR));
      lg.addColorStop(0, 'rgba(245,158,122,0.25)'); lg.addColorStop(1, C.yield);
      ctx.fillStyle = lg; k.rrect(gx - 22, Y(v), 44, yBot - Y(v), 22); ctx.fill();
      A(seg(t, 3.0, 3.6), () => {
        font(800, 120, SER); text(`${FR.toFixed(0)}%`, 360, Y(FR) + 10, { color: C.yield });
        font(600, 28); text('the yield on 10-year bonds', 364, Y(FR) + 96, { color: C.ink });
        font(500, 24); text('first time above 5% since 2002', 364, Y(FR) + 134, { color: C.soft });
      });
    });
    // a bond: a fixed promise
    A(seg(t, 5.2, 5.8), () => {
      const g = back(seg(t, 5.2, 6.2));
      ctx.save(); ctx.translate(CX, 420); ctx.scale(lerp(0.8, 1, g), lerp(0.8, 1, g));
      certificate(-300, -170, 600, 340, { title: 'GOVERNMENT BOND', lines: ['The holder lends money and is promised', 'fixed payments, then the money back.'], ts: 34, ls: 24 });
      ctx.restore();
    });
  });
}

// ---------- B: the example bond and the seesaw ----------
const ROW = { x0: 96, x1: 768, y: 520 };
function sceneBond(t) {
  const a = span(t, 9.4, 32.6, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('AN EXAMPLE BOND · €100 · 3% A YEAR · 10 YEARS', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    // the certificate shrinks to the top; the payments line up below
    const settle = eio(seg(t, 9.6, 10.6));
    const cy = lerp(420, 250, settle), sc = lerp(1, 0.75, settle);
    ctx.save(); ctx.translate(CX, cy); ctx.scale(sc, sc);
    certificate(-300, -130, 600, 260, { title: 'BOND · €100', lines: ['€3 every year for 10 years', 'then €100 back'], ts: 40, ls: 28 });
    ctx.restore();
    // the timeline of payments
    const show = seg(t, 10.4, 11.0) * (1 - seg(t, 18.6, 19.2));
    A(show, () => {
      ctx.strokeStyle = C.faint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ROW.x0, ROW.y + 56); ctx.lineTo(ROW.x1, ROW.y + 56); ctx.stroke();
      for (let i = 1; i <= 10; i++) {
        const x = lerp(ROW.x0, ROW.x1, (i - 0.5) / 10);
        coupon(x, ROW.y, 62, '€3', eout(seg(t, 10.8 + i * 0.16, 11.3 + i * 0.16)));
        font(500, 18); text(`yr ${i}`, x, ROW.y + 80, { align: 'center', color: C.soft });
      }
      A(seg(t, 12.6, 13.2), () => {
        const x = lerp(ROW.x0, ROW.x1, 0.95);
        ctx.fillStyle = C.brass; k.rrect(x - 40, ROW.y - 106, 80, 52, 10); ctx.fill();
        font(800, 26, SER); text('€100', x, ROW.y - 79, { align: 'center', color: '#0a0f1f' });
      });
      A(seg(t, 14.6, 15.2), () => { font(700, 26); text('fixed: €3 × 10, then €100', CX, ROW.y + 140, { align: 'center', color: C.ink }); });
      // sold on: a buyer's price tag
      A(seg(t, 16.0, 16.6), () => {
        ctx.fillStyle = C.price; k.rrect(96, 380, 170, 60, 12); ctx.fill();
        font(800, 30, SER); text('price ?', 181, 411, { align: 'center', color: '#0a0f1f' });
      });
    });
    // the seesaw
    const sw = seg(t, 18.8, 19.4);
    if (sw > 0) A(sw, () => {
      const p = t < 23.6 ? 100 : t < 28.2 ? lerp(100, P4, eio(seg(t, 23.6, 24.8))) : lerp(P4, P5, eio(seg(t, 28.2, 29.4)));
      const y = yieldAt(p, EX) * 100;
      const tilt = (y - 3) * 0.11;
      seesaw(CX, 500, 640, tilt, eur(p), `${y.toFixed(1)}%`);
      // what you get for the price
      A(seg(t, 24.6, 25.2) * (1 - seg(t, 28.0, 28.4)), () => {
        font(500, 24); text(`€3 × 10 = €30 in coupons, plus €${(100 - P4).toFixed(0)} more back than you paid`, CX, 700, { align: 'center', color: C.soft });
      });
      A(seg(t, 29.6, 30.2), () => {
        ctx.fillStyle = C.panel; k.rrect(140, 664, 584, 92, 14); ctx.fill();
        font(700, 28, SER); text('price ↓   yield ↑', CX, 696, { align: 'center', color: C.ink });
        font(500, 20); text('the same payments, bought for less', CX, 732, { align: 'center', color: C.soft });
      });
    });
  });
}

// ---------- C: why prices fall ----------
function sceneWhy(t) {
  const a = span(t, 32.4, 41.8, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHY WOULD BUYERS PAY LESS?', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    const card = (x, y, title, body, col, g) => A(g, () => {
      ctx.fillStyle = C.panel; k.rrect(x - 180, y - 120, 360, 240, 16); ctx.fill();
      ctx.fillStyle = col; k.rrect(x - 180, y - 120, 360, 10, 5); ctx.fill();
      font(700, 30); text(title, x, y - 60, { align: 'center', color: col });
      body.forEach((s, i) => { font(500, 24); text(s, x, y - 6 + i * 36, { align: 'center', color: C.soft }); });
    });
    card(232, 330, 'new loans pay more', ['a new bond at 5%', 'beats an old one at 3%', 'unless the old one is cheaper'], C.price, eout(seg(t, 32.8, 33.6)));
    card(632, 330, 'more risk', ['lenders ask more', 'when they worry', 'about the borrower'], C.yield, eout(seg(t, 34.0, 34.8)));
    A(seg(t, 37.4, 38.0), () => {
      ctx.fillStyle = 'rgba(212,169,78,0.16)'; k.rrect(90, 540, 684, 150, 16); ctx.fill();
      font(700, 32); text('the yield =', CX, 586, { align: 'center', color: C.brass });
      font(600, 28); text('the going rate for lending to that', CX, 632, { align: 'center', color: C.ink });
      text('government, for that many years', CX, 668, { align: 'center', color: C.ink });
    });
  });
}

// ---------- D: France and Germany ----------
function sceneSpread(t) {
  const a = span(t, 41.6, 51.0, 0.4, 0.4);
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('10-YEAR GOVERNMENT BONDS · 21 OCTOBER 2026', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    const base = 640, top = 240, max = 5.5;
    const Y = (v) => lerp(base, top, v / max);
    const de = FR - SPREAD;
    const g = eio(seg(t, 42.0, 43.4));
    // France: just above 5%; Germany: about 1.6 points lower. Only the gap is labelled, not a German yield.
    const bar = (x, v, col, name) => {
      ctx.fillStyle = col; k.rrect(x - 80, Y(v * g), 160, base - Y(v * g), 10); ctx.fill();
      font(700, 28); text(name, x, base + 34, { align: 'center', color: C.ink });
    };
    bar(300, FR, C.fr, 'France');
    bar(564, de, C.de, 'Germany');
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, base); ctx.lineTo(714, base); ctx.stroke();
    A(seg(t, 43.4, 44.0), () => { font(800, 30, SER); text(`above ${FR.toFixed(0)}%`, 300, Y(FR) - 30, { align: 'center', color: C.fr }); });
    // the gap
    A(seg(t, 46.6, 47.2), () => {
      ctx.strokeStyle = C.yield; ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(380, Y(FR)); ctx.lineTo(684, Y(FR)); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(670, Y(FR)); ctx.lineTo(670, Y(de)); ctx.stroke();
      font(800, 30, SER); text(`${SPREAD} points`, 690, (Y(FR) + Y(de)) / 2 - 16, { color: C.yield });
      font(600, 22); text('the spread', 690, (Y(FR) + Y(de)) / 2 + 18, { color: C.yield });
    });
  });
}

// ---------- E: old bonds, new borrowing; the headline ----------
function sceneEnd(t) {
  const a = eout(seg(t, 50.8, 51.6));
  if (a <= 0) return;
  A(a, () => {
    font(600, 24); text('WHAT A HIGHER YIELD CHANGES', CX, 132, { align: 'center', color: C.soft, spacing: '2px' });
    // an old bond keeps its €3 coupons; a new one has to offer more
    ctx.save(); ctx.translate(232, 320); ctx.scale(0.62, 0.62); certificate(-300, -170, 600, 340, { title: 'OLD BOND', lines: ['€3 a year, as promised'], ts: 48, ls: 34 }); ctx.restore();
    A(seg(t, 52.0, 52.6), () => { ctx.save(); ctx.translate(632, 320); ctx.scale(0.62, 0.62); certificate(-300, -170, 600, 340, { title: 'NEW BOND', lines: ['must offer the going rate'], ts: 48, ls: 34 }); ctx.restore(); });
    font(600, 26); text('unchanged', 232, 460, { align: 'center', color: C.soft });
    A(seg(t, 52.4, 53.0), () => { font(600, 26); text('costs the borrower more', 632, 460, { align: 'center', color: C.yield }); });
    // the headline, decoded
    A(seg(t, 55.8, 56.4), () => {
      ctx.fillStyle = C.panel; k.rrect(90, 540, 684, 170, 16); ctx.fill();
      font(700, 30); text('“bond yields rise”', CX, 588, { align: 'center', color: C.yield });
      font(600, 30); text('=', CX, 630, { align: 'center', color: C.soft });
      font(700, 30); text('bond prices fall', CX, 672, { align: 'center', color: C.price });
    });
  });
}

Kit.scene({
  width: W, height: H, duration: 60.4, fonts: [SER, SANS],
  draw(t, kit) {
    k = kit; ctx = kit.ctx;
    if (!bg) paintBg();
    ctx.drawImage(bg, 0, 0);
    sceneHook(t);
    sceneBond(t);
    sceneWhy(t);
    sceneSpread(t);
    sceneEnd(t);
    k.captions(t, CUES, { x: W / 2, y: 846, maxW: 780, size: 40, weight: 500, family: SANS, ink: C.ink, marks: { '*': C.price, '^': C.yield, '~': C.fr } });
  },
});
