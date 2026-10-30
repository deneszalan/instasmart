import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The example bond, as in the post's animation: €100 back at the end and a €3 coupon each year. */
export const FACE = 100;
export const COUPON = 3;
export const MATURITIES = [2, 10, 30] as const;
export type Years = (typeof MATURITIES)[number];

/** What the bond's payments are worth at a yield `y` (in % a year): each payment discounted back to today. */
export function priceAt(y: number, years: number, coupon = COUPON, face = FACE) {
  const r = y / 100;
  let p = 0;
  for (let i = 1; i <= years; i++) p += coupon / Math.pow(1 + r, i);
  return p + face / Math.pow(1 + r, years);
}

/** The yield to maturity (in % a year) of a bond bought at `price`: the rate at which its payments are worth the price. */
export function yieldAt(price: number, years: number, coupon = COUPON, face = FACE) {
  let lo = -50, hi = 100;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (priceAt(m, years, coupon, face) > price) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** The goal: the 10-year bond priced to yield 5% (to the nearest 0.05 point). */
export const reached = (price: number, years: number) => years === 10 && Math.abs(yieldAt(price, years) - 5) <= 0.05;

const PRICE = '#7cc4f0', YIELD = '#f59e7a', BRASS = '#d4a94e';
const P_MIN = 50, P_MAX = 130, Y_MAX = 12;
const pct = (v: number) => `${formatNumber(Math.round(v * 100) / 100)}%`;
const euro = (v: number) => `€${formatNumber(Math.round(v * 10) / 10)}`;

export default function BondPriceYield({ onDone }: LabProps) {
  const [price, setPrice] = useState(100);
  const [years, setYears] = useState<Years>(10);
  const y = yieldAt(price, years);
  useGoal(reached(price, years), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the seesaw; right: price against yield for the chosen bond
    const sx = w * 0.24, sy = h * 0.55, len = w * 0.4;
    const tilt = Math.max(-0.45, Math.min(0.45, (y - COUPON) * 0.07));
    ctx.fillStyle = '#a77f2e';
    ctx.beginPath();
    ctx.moveTo(sx - 16, sy + 34);
    ctx.lineTo(sx + 16, sy + 34);
    ctx.lineTo(sx, sy + 3);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-tilt);
    ctx.fillStyle = BRASS;
    ctx.fillRect(-len / 2, -4, len, 8);
    ctx.fillStyle = PRICE;
    ctx.fillRect(-len / 2, -26, len * 0.34, 22);
    ctx.fillStyle = YIELD;
    ctx.fillRect(len / 2 - len * 0.34, -26, len * 0.34, 22);
    ctx.restore();
    label(ctx, euro(price), sx - (len / 2 - len * 0.17) * Math.cos(tilt), sy - 15 + (len / 2 - len * 0.17) * Math.sin(tilt), { size: 11, color: '#0a0f1f' });
    label(ctx, pct(y), sx + (len / 2 - len * 0.17) * Math.cos(tilt), sy - 15 - (len / 2 - len * 0.17) * Math.sin(tilt), { size: 11, color: '#0a0f1f' });
    label(ctx, t('bond price'), sx - len * 0.33, sy + 46, { size: 10, color: PRICE });
    label(ctx, t('bond yield'), sx + len * 0.33, sy + 46, { size: 10, color: YIELD });

    const L = w * 0.5, R = w - 8, top = 14, base = h - 22;
    const X = (p: number) => L + ((p - P_MIN) / (P_MAX - P_MIN)) * (R - L);
    const Y = (v: number) => base - (Math.max(0, Math.min(Y_MAX, v)) / Y_MAX) * (base - top);
    for (const v of [0, 3, 5, 10]) {
      line(ctx, L, Y(v), R, Y(v), v === 5 ? 'rgba(245,158,122,0.5)' : C.line, 1, v === 5 ? [4, 3] : []);
      label(ctx, `${v}%`, L - 3, Y(v), { size: 9, align: 'right', color: v === 5 ? YIELD : C.faint });
    }
    for (const p of [60, 100, 120]) label(ctx, `€${p}`, X(p), base + 11, { size: 9, color: C.faint });
    // the curve: every price and its yield, for this bond
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let p = P_MIN; p <= P_MAX; p += 1) {
      const v = yieldAt(p, years);
      if (p === P_MIN) ctx.moveTo(X(p), Y(v));
      else ctx.lineTo(X(p), Y(v));
    }
    ctx.stroke();
    dot(ctx, X(price), Y(y), 5, YIELD);
    label(ctx, t('{n}-year bond', { n: years }), R, top + 4, { size: 10, align: 'right', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A {n}-year bond paying €3 a year, bought for {p}, yields {y}', { n: years, p: euro(price), y: pct(y) })} />
      <Range label={t('Price paid')} value={price} min={P_MIN} max={P_MAX} step={0.2} onChange={(v) => setPrice(Math.round(v * 10) / 10)} format={euro} />
      <Choice
        label={t('Years until the €100 comes back')}
        options={MATURITIES.map((n) => ({ value: n, label: t('{n} years', { n }) }))}
        value={years}
        onChange={setYears}
      />
      <Readouts
        items={[
          { label: t('Yield to maturity'), value: pct(y), tone: Math.abs(y - 5) <= 0.05 ? 'good' : 'accent' },
          { label: t('€3 ÷ price'), value: pct((COUPON / price) * 100) },
          { label: t('Back at the end, against the price'), value: `${price <= FACE ? '+' : '−'}${euro(Math.abs(FACE - price))}` },
        ]}
      />
      <p className="lab__note">{t('Simplified: an example bond of €100 paying €3 once a year, held to the end; the yield is the rate at which all its payments are worth the price.')}</p>
    </div>
  );
}
