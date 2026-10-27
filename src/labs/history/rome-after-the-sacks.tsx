import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Aurelian Walls enclose 13.86 km² (Storey 1997). */
export const WALLS_KM2 = 13.86;
/** A tenth of a million: the mark the goal asks for. */
export const TENTH = 100000;

export type Who = 'peak' | 'late4th' | 'lancon' | 'by455' | 'durliat' | 'krautheimer';
/**
 * Estimates of the city's people. `low` is null where a source gives only an upper limit.
 * Sources: Storey (Antiquity 1997) and standard accounts; Wikipedia, Sack of Rome (455), for the 300s and 455;
 * Bertrand Lançon for 408 and 419; for about 550 one estimate of 30,000 (Wikipedia, Siege of Rome) and Jean
 * Durliat's 60,000; Richard Krautheimer's maximum of 90,000 around 600 (both in Coates-Stephens, JRS 1998).
 */
export const ESTIMATES: { year: number; low: number | null; high: number; who: Who }[] = [
  { year: 100, low: 450000, high: 1000000, who: 'peak' },
  { year: 400, low: 700000, high: 1000000, who: 'late4th' },
  { year: 408, low: 800000, high: 800000, who: 'lancon' },
  { year: 419, low: 500000, high: 500000, who: 'lancon' },
  { year: 455, low: 300000, high: 500000, who: 'by455' },
  { year: 550, low: 30000, high: 60000, who: 'durliat' },
  { year: 600, low: null, high: 90000, who: 'krautheimer' },
];

/** The latest estimate made for `year` or before. */
export const estimateAt = (year: number) => [...ESTIMATES].reverse().find((e) => e.year <= year) ?? ESTIMATES[0];
/** People per km² inside the walls. */
export const density = (people: number) => people / WALLS_KM2;

const whoText = (w: Who) =>
  w === 'peak'
    ? t('Glenn Storey (low); standard accounts (high)')
    : w === 'late4th'
      ? t('Estimates for the end of the 300s')
      : w === 'lancon'
        ? t('Bertrand Lançon')
        : w === 'by455'
          ? t('One estimate, for 455')
          : w === 'durliat'
            ? t('One estimate (low); Jean Durliat (high)')
            : t('Richard Krautheimer’s upper limit');

const DOT = '#ffcf73';

export default function RomeShrinks({ onDone }: LabProps) {
  const [year, setYear] = useState(100);
  const e = estimateAt(year);
  useGoal(e.high < TENTH, onDone);
  const range = (a: number | null, b: number) => (a === null ? t('up to {n}', { n: formatNumber(b) }) : a === b ? formatNumber(b) : `${formatNumber(a)}–${formatNumber(b)}`);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const gridW = Math.min(w * 0.34, h - 20), cw = w - gridW - 18;
    const L = 58, R = cw, T = 8, B = h - 18;
    const X = (y: number) => L + ((R - L) * (y - 100)) / 500, Y = (p: number) => B - ((B - T) * p) / 1e6;
    for (const p of [0, 500000, 1000000]) {
      line(ctx, L, Y(p), R, Y(p), C.line, 1);
      label(ctx, p ? t('{n} million', { n: formatNumber(p / 1e6) }) : '0', L - 4, Y(p), { size: 9, align: 'right', color: C.faint });
    }
    for (const y of [100, 300, 500]) label(ctx, t('AD {y}', { y: formatNumber(y, 'year') }), X(y), B + 10, { size: 9, color: C.faint });
    for (const est of ESTIMATES) {
      const on = est === e;
      const lo = est.low ?? 0;
      ctx.fillStyle = on ? DOT : 'rgba(255,207,115,0.35)';
      ctx.fillRect(X(est.year) - 3, Y(est.high), 6, Math.max(2, Y(lo) - Y(est.high)));
    }
    line(ctx, X(e.year), T, X(e.year), B, C.soft, 1, [3, 3]);
    // the dots: each 10,000 people; solid up to the low estimate, rings up to the high one
    const gx = w - gridW - 4, cell = gridW / 10;
    for (let i = 0; i < 100; i++) {
      const x = gx + (i % 10) * cell + cell / 2, y = T + Math.floor(i / 10) * cell + cell / 2, n = (i + 1) * 10000;
      ctx.beginPath(); ctx.arc(x, y, cell * 0.32, 0, Math.PI * 2);
      if (n <= (e.low ?? 0)) { ctx.fillStyle = DOT; ctx.fill(); }
      else if (n <= e.high) { ctx.strokeStyle = DOT; ctx.lineWidth = 1.5; ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); }
    }
    label(ctx, t('each dot: 10,000 people'), gx + gridW / 2, T + gridW + 9, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Estimates of Rome’s people from AD 100 to 600; around AD {y}: {n}', { y: formatNumber(e.year, 'year'), n: range(e.low, e.high) })} />
      <Range label={t('Year AD')} value={year} min={100} max={600} step={1} onChange={(v) => setYear(Math.round(v))} format={(v) => formatNumber(v, 'year')} />
      <Readouts
        items={[
          { label: t('People in Rome, estimated for AD {y}', { y: formatNumber(e.year, 'year') }), value: range(e.low, e.high), tone: e.high < TENTH ? 'good' : 'accent' },
          { label: t('Estimated by'), value: whoText(e.who) },
          { label: t('People per km² inside the walls'), value: range(e.low === null ? null : Math.round(density(e.low) / 100) * 100, Math.round(density(e.high) / 100) * 100) },
        ]}
      />
      <p className="lab__note">{t('Ancient numbers are estimates, and scholars disagree widely. Density uses the 13.86 km² inside the Aurelian Walls.')}</p>
    </div>
  );
}
