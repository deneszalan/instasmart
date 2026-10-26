import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** von Foerster, Mora and Amiot's 1960 fit: N = K / (t0 − t)^n, here in billions. */
export const K = 1.79e11, T0 = 2026.87, N_EXP = 0.99;
export const formula = (year: number) => K / Math.pow(T0 - year, N_EXP) / 1e9;

/** Years until the formula's population doubles again, from `year`: (t0 − t) shrinks by 2^(1/n). */
export const doublingTime = (year: number) => (T0 - year) * (1 - Math.pow(2, -1 / N_EXP));

/** World population in billions: rough estimates to 1950, then UN World Population Prospects 2024, rounded. */
export const REAL: [number, number][] = [
  [1900, 1.6], [1950, 2.5], [1960, 3.0], [1970, 3.7], [1980, 4.4], [1990, 5.3], [2000, 6.1], [2010, 7.0], [2020, 7.9], [2026, 8.3],
];
export function realPopulation(year: number): number {
  const i = REAL.findIndex(([y]) => y >= year);
  if (i <= 0) return REAL[0][1];
  const [y0, v0] = REAL[i - 1], [y1, v1] = REAL[i];
  return v0 + ((v1 - v0) * (year - y0)) / (y1 - y0);
}

/** A span of years as words: years, days, hours or minutes. */
function span(years: number): string {
  if (years >= 1) return t('{n} years', { n: formatNumber(Math.round(years * 10) / 10) });
  const days = years * 365.25;
  if (days >= 1) return t('{n} days', { n: formatNumber(Math.round(days)) });
  const hours = days * 24;
  if (hours >= 1) return t('{n} hours', { n: formatNumber(Math.round(hours)) });
  return t('{n} minutes', { n: formatNumber(Math.max(1, Math.round(hours * 60))) });
}

export default function Doomsday({ onDone }: LabProps) {
  const [year, setYear] = useState(1960);
  const model = formula(year), real = realPopulation(Math.min(year, 2026)), dbl = doublingTime(year);
  useGoal(dbl < 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 30, R = w - 14, top = 14, bot = h - 22, MAX = 30;
    const X = (y: number) => L + ((y - 1900) / (2030 - 1900)) * (R - L), Y = (v: number) => bot - (Math.min(v, MAX) / MAX) * (bot - top);
    for (const v of [10, 20, 30]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${v}`, L - 5, Y(v), { size: 9.5, align: 'right', color: C.faint });
    }
    for (const y of [1900, 1950, 2000]) label(ctx, `${y}`, X(y), bot + 11, { size: 9.5, color: C.faint });
    line(ctx, X(T0), top, X(T0), bot, C.bad, 1.5, [4, 3]);
    label(ctx, t('13 Nov 2026'), X(T0) - 4, top + 6, { size: 10, align: 'right', color: C.bad });
    // the 1960 formula, clipped where it leaves the chart
    ctx.save();
    ctx.beginPath();
    ctx.rect(L, top, R - L, bot - top);
    ctx.clip();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let y = 1900; y < T0 - 0.05; y += 0.25) ctx[y === 1900 ? 'moveTo' : 'lineTo'](X(y), Y(formula(y)));
    ctx.stroke();
    ctx.restore();
    // real population
    ctx.strokeStyle = C.cool;
    ctx.lineWidth = 3;
    ctx.beginPath();
    REAL.forEach(([y, v], i) => ctx[i ? 'lineTo' : 'moveTo'](X(y), Y(v)));
    ctx.stroke();
    // the chosen year
    line(ctx, X(year), top, X(year), bot, C.soft, 1.5);
    if (model <= MAX) dot(ctx, X(year), Y(model), 5, C.accent);
    if (year <= 2026) dot(ctx, X(year), Y(real), 5, C.cool);
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('World population, in billions: the 1960 formula and the real count, in {y}', { y: Math.floor(year) })} />
      <Range label={t('Year')} value={year} min={1900} max={2026.8} step={0.1} onChange={(v) => setYear(Math.round(v * 10) / 10)} format={(v) => formatNumber(Math.round(v * 10) / 10, 'year')} />
      <Readouts
        items={[
          { label: t('The 1960 formula'), value: t('{n} bn', { n: formatNumber(model < 100 ? Math.round(model * 10) / 10 : Math.round(model)) }), tone: 'accent' },
          { label: t('Real count'), value: year <= 2026 ? t('{n} bn', { n: formatNumber(Math.round(real * 10) / 10) }) : '–' },
          { label: t('Formula doubles in'), value: span(dbl), tone: dbl < 1 ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
