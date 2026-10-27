import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Radiocarbon ages use Libby's half-life of 5,568 years, a mean life of 8,033 years, and count back from 1950. */
export const MEAN_LIFE = 8033;
/** The wolf's casting cores: 963 ± 15 radiocarbon years (Calcagnile et al.), calibrated to AD 1021–1153. */
export const WOLF_BP = 963;
/** The traditional date: an Etruscan work of about 480 BC. */
export const ETRUSCAN_YEAR = -480;

/** The radiocarbon age, in years before 1950, of a sample with a share `left` (0–1) of its original carbon-14. */
export const radiocarbonAge = (left: number) => -MEAN_LIFE * Math.log(left);
/** The share of carbon-14 left after `age` radiocarbon years. */
export const carbonLeft = (age: number) => Math.exp(-age / MEAN_LIFE);
/** The uncalibrated calendar year: 1950 minus the radiocarbon age (negative for BC). */
export const roughYear = (left: number) => 1950 - radiocarbonAge(left);

const yearText = (y: number) => (y < 1 ? t('about {n} BC', { n: formatNumber(Math.round(-y), 'year') }) : t('about AD {n}', { n: formatNumber(Math.round(y), 'year') }));

export default function WolfDating({ onDone }: LabProps) {
  const [pct, setPct] = useState(95);
  const left = pct / 100;
  const year = roughYear(left);
  useGoal(Math.abs(year - ETRUSCAN_YEAR) <= 25, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 10, T = 12, B = h - 22, maxAge = 3200, lo = 0.65;
    const X = (age: number) => L + (age / maxAge) * (R - L), Y = (f: number) => B - ((f - lo) / (1 - lo)) * (B - T);
    for (const f of [0.7, 0.8, 0.9, 1]) {
      line(ctx, L, Y(f), R, Y(f), C.line, 1);
      label(ctx, `${Math.round(f * 100)}%`, L - 4, Y(f), { size: 9, align: 'right', color: C.faint });
    }
    for (const a of [0, 1000, 2000, 3000]) label(ctx, formatNumber(a), X(a), B + 11, { size: 9, color: C.faint });
    // the decay curve
    ctx.strokeStyle = C.cool;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a <= maxAge; a += 40) {
      const x = X(a), y = Y(carbonLeft(a));
      if (a) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
    // the wolf's cores and an Etruscan core, for comparison
    dot(ctx, X(WOLF_BP), Y(carbonLeft(WOLF_BP)), 4.5, C.accent);
    label(ctx, t('The wolf’s cores'), X(WOLF_BP) + 8, Y(carbonLeft(WOLF_BP)) - 9, { size: 9.5, align: 'left', color: C.accent });
    // your sample
    const age = radiocarbonAge(left);
    if (age <= maxAge) {
      line(ctx, L, Y(left), X(age), Y(left), C.faint, 1, [3, 3]);
      line(ctx, X(age), Y(left), X(age), B, C.faint, 1, [3, 3]);
      dot(ctx, X(age), Y(left), 5, Math.abs(year - ETRUSCAN_YEAR) <= 25 ? C.good : C.ink);
    }
    label(ctx, t('years since 1950 (radiocarbon years)'), R, T + 4, { size: 9, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Carbon-14 left against radiocarbon age, with a sample holding {p} percent', { p: formatNumber(pct) })} />
      <Range label={t('Carbon-14 left in the sample')} value={pct} min={66} max={100} step={0.1} onChange={setPct} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Radiocarbon age'), value: t('{n} years', { n: formatNumber(Math.round(radiocarbonAge(left))) }) },
          { label: t('Rough date, uncalibrated'), value: yearText(year), tone: Math.abs(year - ETRUSCAN_YEAR) <= 25 ? 'good' : 'accent' },
          { label: t('The wolf’s cores'), value: `${formatNumber(Math.round(carbonLeft(WOLF_BP) * 1000) / 10)}%` },
        ]}
      />
      <p className="lab__note">{t('Simplified: real dates are calibrated against tree rings, which turned the wolf’s 963 radiocarbon years into AD 1021–1153.')}</p>
    </div>
  );
}
