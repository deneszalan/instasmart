import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Exact years to double at `rate` percent: interest added once a year, or continuously. */
export const doublingYears = (rate: number, continuous = false) => (continuous ? Math.log(2) / (rate / 100) : Math.log(2) / Math.log(1 + rate / 100));

/** The rule of thumb: 72 divided by the rate in percent. */
export const ruleOf72 = (rate: number) => 72 / rate;

export default function RuleOf72({ onDone }: LabProps) {
  const [rate, setRate] = useState(3);
  const [mode, setMode] = useState<'yearly' | 'continuous'>('yearly');
  const exact = doublingYears(rate, mode === 'continuous'), rule = ruleOf72(rate), off = rule - exact;
  useGoal(mode === 'yearly' && Math.abs(off) < 0.012, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 30, R = w - 12, top = 12, bot = h - 22, span = Math.max(8, Math.ceil(Math.max(exact, rule) * 1.25));
    const X = (yr: number) => L + (yr / span) * (R - L), Y = (v: number) => bot - ((v - 1) / 1.6) * (bot - top);
    line(ctx, L, Y(2), R, Y(2), C.accent, 1.5, [4, 3]);
    label(ctx, t('doubled'), L + 4, Y(2) - 8, { size: 10, align: 'left', color: C.accent });
    label(ctx, '×1', L - 4, Y(1), { size: 9.5, align: 'right', color: C.faint });
    label(ctx, '×2', L - 4, Y(2), { size: 9.5, align: 'right', color: C.faint });
    // the balance: steps once a year, or a smooth curve when interest is added all the time
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const yr = (i / 300) * span, v = mode === 'continuous' ? Math.exp((rate / 100) * yr) : Math.pow(1 + rate / 100, Math.floor(yr));
      ctx[i ? 'lineTo' : 'moveTo'](X(yr), Y(Math.min(2.6, v)));
    }
    ctx.stroke();
    line(ctx, X(exact), Y(1), X(exact), Y(2), C.good, 2);
    line(ctx, X(rule), Y(1), X(rule), Y(2.3), '#f9a8d4', 2, [3, 3]);
    label(ctx, t('72 ÷ {r}', { r: formatNumber(rate) }), X(rule), Y(2.3) - 8, { size: 10, color: '#f9a8d4' });
    for (let yr = 0; yr <= span; yr += span > 30 ? 10 : 5) label(ctx, `${yr}`, X(yr), bot + 10, { size: 9.5, color: C.faint });
    label(ctx, t('years'), R, bot + 10, { size: 9.5, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Interest added')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'yearly', label: t('Once a year') },
          { value: 'continuous', label: t('All the time') },
        ]}
      />
      <Stage draw={draw} label={t('Money growing at {r}% a year until it doubles', { r: formatNumber(rate) })} />
      <Range label={t('Interest')} value={rate} min={1} max={20} step={0.1} onChange={(v) => setRate(Math.round(v * 10) / 10)} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Exactly'), value: t('{n} years', { n: formatNumber(Math.round(exact * 100) / 100) }), tone: 'good' },
          { label: t('Rule of 72'), value: t('{n} years', { n: formatNumber(Math.round(rule * 100) / 100) }) },
          { label: t('Off by'), value: Math.abs(off) < 0.012 ? t('nothing') : t('{n} days', { n: formatNumber(Math.round(Math.abs(off) * 365)) }), tone: Math.abs(off) < 0.012 ? 'good' : 'accent' },
        ]}
      />
    </div>
  );
}
