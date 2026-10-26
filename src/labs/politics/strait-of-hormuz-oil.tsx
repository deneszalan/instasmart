import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Brent crude, EIA daily spot price: 27 February 2026, the last trading day before the war, and the 2026 high on 7 April. */
export const PREWAR = 71.32;
export const PEAK = 138.21;

/**
 * The simplest short-run oil market: only demand adjusts, with a constant price elasticity `e`. For buyers to
 * use a share `cut` less oil, the price must rise by the factor (1 − cut)^(−1/e).
 */
export const price = (cut: number, e: number, p0 = PREWAR) => p0 * Math.pow(1 - cut, -1 / e);
/** The shortfall at which the price doubles. */
export const doublingCut = (e: number) => 1 - Math.pow(2, -e);

export default function HormuzOil({ onDone }: LabProps) {
  const [cut, setCut] = useState(1);
  const [e, setE] = useState(0.05);
  const p = price(cut / 100, e);
  useGoal(p >= PEAK, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 40, R = w - 8, top = 10, bot = h - 22, q0 = 90, q1 = 100.5, pmax = 300;
    const X = (q: number) => L + ((q - q0) / (q1 - q0)) * (R - L), Y = (v: number) => bot - (Math.min(v, pmax) / pmax) * (bot - top);
    for (const v of [100, 200, 300]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `$${v}`, L - 4, Y(v), { size: 9, align: 'right', color: C.faint });
    }
    for (const q of [90, 95, 100]) label(ctx, `${q}%`, X(q), bot + 11, { size: 9, color: C.faint });
    // the April high
    line(ctx, L, Y(PEAK), R, Y(PEAK), C.bad, 1.5, [5, 4]);
    label(ctx, t('7 April high'), L + 4, Y(PEAK) - 8, { size: 9.5, align: 'left', color: C.bad });
    // the demand curve for this elasticity
    ctx.strokeStyle = C.cool;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let q = q1; q >= q0; q -= 0.05) {
      const v = price(1 - q / 100, e);
      if (v > pmax) break;
      if (started) ctx.lineTo(X(q), Y(v));
      else ctx.moveTo(X(q), Y(v));
      started = true;
    }
    ctx.stroke();
    // where the market ends up
    const q = 100 - cut, y = Y(p);
    line(ctx, X(q), bot, X(q), y, C.faint, 1, [3, 3]);
    dot(ctx, X(q), y, 5, p > pmax ? C.bad : C.accent);
    if (p > pmax) label(ctx, t('off the chart'), X(q), top + 8, { size: 9.5, color: C.bad });
    label(ctx, t('oil used, % of normal'), R, top + 14, { size: 9.5, align: 'right', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A demand curve for oil: with {c}% less oil the price is ${p}', { c: formatNumber(cut), p: formatNumber(Math.round(p)) })} />
      <Range label={t('Oil missing')} value={cut} min={0} max={8} step={0.1} onChange={(v) => setCut(Math.round(v * 10) / 10)} format={(v) => `${formatNumber(v)}%`} />
      <Range label={t('Elasticity')} value={e} min={0.02} max={0.3} step={0.01} onChange={(v) => setE(Math.round(v * 100) / 100)} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Price, from $71'), value: `$${formatNumber(Math.round(p))}`, tone: p >= PEAK ? 'bad' : undefined },
          { label: t('Change'), value: `+${formatNumber(Math.round((p / PREWAR - 1) * 100))}%` },
          { label: t('Doubles at'), value: `${formatNumber(Math.round(doublingCut(e) * 1000) / 10)}%`, tone: 'accent' },
        ]}
      />
    </div>
  );
}
