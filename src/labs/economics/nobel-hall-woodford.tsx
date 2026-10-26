import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The model's neutral interest rate (an assumption, % a year) and how many quarters the promise covers after this one. */
export const NEUTRAL = 3;
export const AHEAD = 8;

/** The rate people expect for the promised quarters: what they believe of the promise, the rest neutral. */
export const expectedRate = (promised: number, belief: number) => belief * promised + (1 - belief) * NEUTRAL;

/**
 * Spending today, in % above normal, in a simplified forward-looking model (prices held fixed, households that
 * plan ahead): minus the sum, over this quarter and the next AHEAD, of (expected rate − neutral rate)/4.
 */
export function spendingToday(now: number, promised: number, belief: number): number {
  return -((now - NEUTRAL) + AHEAD * (expectedRate(promised, belief) - NEUTRAL)) / 4;
}

const BRASS = '#e7b65a', MINT = '#7be0b4';

export default function ForwardGuidance({ onDone }: LabProps) {
  const [now, setNow] = useState(3);
  const [promised, setPromised] = useState(3);
  const [belief, setBelief] = useState(100);
  const b = belief / 100, spend = spendingToday(now, promised, b), expected = expectedRate(promised, b);
  useGoal(spend >= 1.5 && now >= NEUTRAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 30, R = w - 96, top = 12, bot = h - 22, maxR = 6;
    const X = (q: number) => L + (q / 12) * (R - L), Y = (r: number) => bot - (r / maxR) * (bot - top);
    for (const r of [0, 2, 4, 6]) {
      line(ctx, L, Y(r), R, Y(r), C.line, 1);
      label(ctx, `${r}%`, L - 4, Y(r), { size: 9.5, align: 'right', color: C.faint });
    }
    line(ctx, L, Y(NEUTRAL), R, Y(NEUTRAL), C.soft, 1, [4, 4]);
    label(ctx, t('neutral'), L + 4, Y(NEUTRAL) - 9, { size: 9.5, align: 'left', color: C.faint });
    // the path people expect: this quarter, the promised quarters, then neutral again
    const path = (q: number) => (q < 1 ? now : q < 1 + AHEAD ? expected : NEUTRAL);
    if (b < 1) line(ctx, X(1), Y(promised), X(1 + AHEAD), Y(promised), 'rgba(231,182,90,0.45)', 1.5, [4, 4]);
    ctx.strokeStyle = BRASS;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let q = 0; q <= 12; q += 0.05) ctx[q ? 'lineTo' : 'moveTo'](X(q), Y(path(q)));
    ctx.stroke();
    label(ctx, t('now'), X(0.5), bot + 12, { size: 9.5, color: C.soft });
    label(ctx, t('1 year'), X(4), bot + 12, { size: 9.5, color: C.faint });
    label(ctx, t('2 years'), X(8), bot + 12, { size: 9.5, color: C.faint });
    // spending today
    const bx = w - 54, bw = 34, zero = (top + bot) / 2, scale = (bot - top) / 2 / 6;
    line(ctx, bx - 6, zero, bx + bw + 6, zero, C.soft, 1.5);
    ctx.fillStyle = spend >= 0 ? MINT : C.bad;
    const hh = Math.max(-6, Math.min(6, spend)) * scale;
    ctx.fillRect(bx, zero - Math.max(0, hh), bw, Math.abs(hh));
    label(ctx, t('spending today'), bx + bw / 2, bot + 12, { size: 9.5, color: MINT });
  };

  const pc = (v: number) => `${formatNumber(v)}%`;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The interest rates people expect over three years, and spending today: {s}%', { s: formatNumber(Math.round(spend * 100) / 100) })} />
      <Range label={t('Rate now')} value={now} min={0} max={6} step={0.25} onChange={setNow} format={pc} />
      <Range label={t('Promised rate, next 2 years')} value={promised} min={0} max={6} step={0.25} onChange={setPromised} format={pc} />
      <Range label={t('Believed by')} value={belief} min={0} max={100} step={10} onChange={setBelief} format={pc} />
      <Readouts
        items={[
          { label: t('Spending today'), value: `${spend > 0.004 ? '+' : ''}${pc(Math.round(spend * 100) / 100 || 0)}`, tone: spend >= 1.5 && now >= NEUTRAL ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: fixed prices, a neutral rate of 3% and perfect planners. Real economies respond less.')}</p>
    </div>
  );
}
