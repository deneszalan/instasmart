import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A quarter's growth (in %) written at an annual rate, as the US does: compounded over four quarters (BEA). */
export const annualRate = (q: number) => (Math.pow(1 + q / 100, 4) - 1) * 100;

/** The quarterly growth (in %) behind an annual rate. */
export const quarterBehind = (annual: number) => (Math.pow(1 + annual / 100, 1 / 4) - 1) * 100;

/** Growth over the four quarters together (in %): the latest quarter against the same quarter a year earlier. */
export const yearOnYear = (qs: number[]) => (qs.reduce((p, q) => p * (1 + q / 100), 1) - 1) * 100;

/** The economy's size after each quarter, starting at 100 a year earlier. */
export const levels = (qs: number[]) => qs.reduce<number[]>((ls, q) => [...ls, ls[ls.length - 1] * (1 + q / 100)], [100]);

/** The goal: the newest quarter reads at least 4% at an annual rate while the year-on-year growth stays at or under 2%. */
export const reached = (qs: number[]) => annualRate(qs[3]) >= 4 && yearOnYear(qs) <= 2;

const MINT = '#6ee7b7', AMBER = '#fbbf24', CORAL = '#fb7185', BAR = '#3f8a8c';
const START = [0.5, 0.5, 0.5, 0.5];
const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatNumber(Math.abs(Math.round(v * 10) / 10))}%`;

export default function UsGdpAnnualRate({ onDone }: LabProps) {
  const [qs, setQs] = useState<number[]>(START);
  const [pick, setPick] = useState(3);
  useGoal(reached(qs), onDone);
  const names = [t('Oct–Dec'), t('Jan–Mar'), t('Apr–Jun'), t('Jul–Sep')];
  const ls = levels(qs);
  const ann = annualRate(qs[3]), yoy = yearOnYear(qs);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 10, top = 30, base = h - 30;
    const lo = 94, hi = 108; // the bars show only their tops: the scale runs from 94 to 108
    const Y = (v: number) => base - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (base - top);
    const slot = (R - L) / 7;
    for (const v of [96, 100, 104, 108]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${v}`, L - 4, Y(v), { size: 9, align: 'right', color: C.faint });
    }
    // the five measured sizes: a year ago, then after each quarter
    ls.forEach((v, i) => {
      const x = L + slot * i + slot * 0.18, bw = slot * 0.64;
      ctx.fillStyle = i === pick + 1 ? MINT : BAR;
      ctx.fillRect(x, Y(v), bw, base - Y(v));
      label(ctx, i === 0 ? t('a year ago') : names[i - 1], x + bw / 2, base + 11, { size: 9, color: i === pick + 1 ? MINT : C.faint });
      label(ctx, formatNumber(Math.round(v * 10) / 10), x + bw / 2, Y(v) - 8, { size: 9.5, color: C.soft });
    });
    // the annual rate: the newest quarter's pace kept up for a whole year, from the quarter before
    const x3 = L + slot * 3.5, x4 = L + slot * 4.5, x7 = L + slot * 6.9;
    line(ctx, x3, Y(ls[3]), x7, Y(ls[3] * Math.pow(1 + qs[3] / 100, 4)), AMBER, 2, [5, 4]);
    label(ctx, t('same pace for a year'), x7, Y(ls[3] * Math.pow(1 + qs[3] / 100, 4)) - 10, { size: 9.5, align: 'right', color: AMBER });
    // year on year: the newest size against a year ago
    const x0 = L + slot * 0.5;
    line(ctx, x0, top - 12, x4, top - 12, CORAL, 2);
    line(ctx, x0, top - 16, x0, top - 8, CORAL, 2);
    line(ctx, x4, top - 16, x4, top - 8, CORAL, 2);
    label(ctx, t('year on year {p}', { p: pct(yoy) }), (x0 + x4) / 2, top - 4, { size: 9.5, color: CORAL, base: 'top' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('An imaginary economy over four quarters: {a} at an annual rate, {b} year on year', { a: pct(ann), b: pct(yoy) })} />
      <Choice label={t('Quarter to change')} options={names.map((n, i) => ({ value: i, label: n }))} value={pick} onChange={setPick} />
      <Range
        label={t('Growth that quarter')}
        value={qs[pick]}
        min={-1.5}
        max={2}
        step={0.1}
        onChange={(v) => setQs(qs.map((q, i) => (i === pick ? Math.round(v * 10) / 10 : q)))}
        format={pct}
      />
      <Readouts
        items={[
          { label: t('Jul–Sep, against Apr–Jun'), value: pct(qs[3]), tone: 'good' },
          { label: t('Jul–Sep at an annual rate'), value: pct(ann), tone: ann >= 4 ? 'accent' : undefined },
          { label: t('Jul–Sep, year on year'), value: pct(yoy), tone: yoy <= 2 ? undefined : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: an imaginary economy that was 100 a year ago. The annual rate compounds the newest quarter four times; year on year multiplies all four quarters.')}</p>
    </div>
  );
}
