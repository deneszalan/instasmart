import { useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/**
 * Twelve made-up CpG sites: the fraction methylated at birth and its drift per year of age. Some gain tags with age,
 * some lose them, as Horvath's 2013 clock found for its 353 real sites (193 gain, 160 lose).
 */
export const SITES: { start: number; drift: number }[] = [
  { start: 0.12, drift: 0.0068 }, { start: 0.82, drift: -0.0061 }, { start: 0.2, drift: 0.0055 }, { start: 0.9, drift: -0.0072 },
  { start: 0.08, drift: 0.0049 }, { start: 0.76, drift: -0.0044 }, { start: 0.25, drift: 0.0071 }, { start: 0.85, drift: -0.0058 },
  { start: 0.15, drift: 0.0036 }, { start: 0.8, drift: -0.0066 }, { start: 0.1, drift: 0.0063 }, { start: 0.88, drift: -0.005 },
];
/** The oldest donor in the Bonn study. */
export const DONOR_MAX = 101;
/** The share of the age marks that the toy curve never erases: the study's long-cultured cells kept about 5% of donor age. */
export const FLOOR = 0.05;
/** The toy curve's time constant in days: about a fifth of the marks are left after seven weeks. */
export const TAU = 27;

export type Route = 'direct' | 'pluripotent';

/** The share of a donor's age marks a converted cell still carries after `days` of conversion by `route` (a toy curve). */
export function retained(days: number, route: Route): number {
  if (route === 'pluripotent') return 0;
  return FLOOR + (1 - FLOOR) * Math.exp(-days / TAU);
}

/** The fraction methylated at each site for cells from a donor aged `age`, `days` into conversion by `route`. */
export function profile(age: number, days: number, route: Route): number[] {
  const keep = retained(days, route);
  return SITES.map((s) => Math.min(1, Math.max(0, s.start + s.drift * age * keep)));
}

/** The toy clock: the age that best explains the profile, by least squares over the sites. */
export function readAge(p: number[]): number {
  let num = 0, den = 0;
  SITES.forEach((s, i) => { num += (p[i] - s.start) * s.drift; den += s.drift * s.drift; });
  return num / den;
}

const TAG = '#ff7a8a', STRAND = '#9b8fc4', DIAL = '#f4c95d', YOUNG = '#7ee0c3';

export default function BloodCellsEpigeneticClock({ onDone }: LabProps) {
  const [age, setAge] = useState(80);
  const [days, setDays] = useState(0);
  const [route, setRoute] = useState<Route>('direct');
  const p = profile(age, days, route);
  const reading = readAge(p);
  const kept = retained(days, route);
  const shown = Math.max(0, Math.round(reading));
  useGoal(route === 'direct' && age >= 80 && reading < 20, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the two strands, with a site on each crest; on a short stage the band sits higher and loses its captions
    const tall = h >= 150;
    const y0 = tall ? h * 0.4 : h * 0.36, amp = 10, x0 = 24, x1 = w - 24;
    ctx.lineWidth = 2;
    for (const sgn of [1, -1]) {
      ctx.strokeStyle = STRAND;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 2) ctx.lineTo(x, y0 + sgn * amp * Math.sin(((x - x0) / (x1 - x0)) * Math.PI * SITES.length));
      ctx.stroke();
    }
    SITES.forEach((s, i) => {
      const x = x0 + ((i + 0.5) / SITES.length) * (x1 - x0);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.arc(x, y0, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = TAG;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.arc(x, y0, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p[i]); ctx.closePath(); ctx.fill();
      if (h >= 125) label(ctx, s.drift > 0 ? '+' : '−', x, y0 + 20, { size: 10, color: C.soft });
    });
    // the gauge along the bottom: the reading as a bar, the donor's age as a mark below it
    const gy = h - 26, gx0 = 24, gx1 = w - 24;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.stroke();
    ctx.strokeStyle = reading < 20 ? YOUNG : DIAL;
    ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx0 + (Math.max(0, reading) / DONOR_MAX) * (gx1 - gx0), gy); ctx.stroke();
    ctx.lineCap = 'butt';
    const dx = gx0 + (age / DONOR_MAX) * (gx1 - gx0);
    ctx.strokeStyle = C.soft; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(dx, gy - 7); ctx.lineTo(dx, gy + 7); ctx.stroke();
    label(ctx, t('donor {a}', { a: age }), dx, gy + 15, { size: 10, color: C.soft });
    label(ctx, t('reads {r} years', { r: shown }), gx1, gy - 13, { size: 12, align: 'right', color: reading < 20 ? YOUNG : DIAL });
    if (tall) label(ctx, t('{n} sites · methylated share in colour', { n: SITES.length }), w / 2, 12, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Toy epigenetic clock: donor aged {a}, day {d} of conversion, the clock reads {r} years', { a: age, d: days, r: shown })} />
      <Range label={t('Donor’s age')} value={age} min={0} max={DONOR_MAX} step={1} onChange={setAge} format={(v) => t('{n} years', { n: v })} />
      <Choice
        label={t('Route')}
        value={route}
        onChange={setRoute}
        options={[
          { value: 'direct', label: t('Direct to neural stem cells') },
          { value: 'pluripotent', label: t('Via pluripotent stem cells') },
        ]}
      />
      <Range label={t('Days of conversion')} value={days} min={0} max={100} step={1} onChange={setDays} format={(v) => t('day {d}', { d: v })} />
      <Readouts
        items={[
          { label: t('Clock reads'), value: t('{n} years', { n: shown }), tone: reading < 20 ? 'good' : undefined },
          { label: t('Age marks kept'), value: `${Math.round(kept * 100)}%`, tone: kept < 0.2 ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: twelve made-up sites drift evenly with age, and the direct route erases the drift along a smooth curve that keeps 5% of it, as the study’s long-cultured cells kept about 5% of donor age. Horvath’s real clock reads 353 sites with a typical error of 3.6 years.')}</p>
    </div>
  );
}
