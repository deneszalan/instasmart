import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export const SOLAR = 365.2422; // days in a year of the seasons
export const JULIAN = 365.25; // a leap year every 4 years
export const GREGORIAN = 365.2425; // 97 leap years in every 400

/** Is `year` a leap year under each rule? */
export const leap = (year: number, gregorian: boolean) => year % 4 === 0 && (!gregorian || year % 100 !== 0 || year % 400 === 0);

/**
 * The calendar date of the spring equinox in March, by year: 21 March in AD 325, creeping earlier as the Julian
 * year runs long; the Gregorian reform of 1582 drops 10 days and slows the drift to about a day in 3,000 years.
 */
export function equinox(year: number, gregorian: boolean) {
  if (!gregorian || year < 1582) return 21 - (JULIAN - SOLAR) * (year - 325);
  return 21 - (GREGORIAN - SOLAR) * (year - 1582);
}

export default function Calendar({ onDone }: LabProps) {
  const [rule, setRule] = useState<'julian' | 'gregorian'>('julian');
  const [year, setYear] = useState(325);
  const [seen, setSeen] = useState(new Set<string>());
  const g = rule === 'gregorian', day = equinox(year, g);
  // before 1 March it falls in February (28 days in the years that matter here)
  const date = Math.round(day) >= 1 ? t('{d} March', { d: Math.round(day) }) : t('{d} February', { d: Math.round(day) + 28 });
  useGoal(seen.has('julian') && seen.has('gregorian'), onDone);
  const go = (y: number) => {
    setYear(y);
    if (y >= 1700) setSeen((s) => new Set(s).add(rule));
  };
  const pick = (r: 'julian' | 'gregorian') => {
    setRule(r);
    if (year >= 1700) setSeen((s) => new Set(s).add(r));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // March as a strip of days, with where the equinox falls
    const L = 12, R = w - 12, top = 16, cw = (R - L) / 31, X = (d: number) => L + (d - 1) * cw;
    for (let d = 1; d <= 31; d++) {
      ctx.fillStyle = d === 21 ? 'rgba(134,239,172,0.3)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(X(d) + 1, top, cw - 2, 26);
      if (d % 5 === 1 || d === 21) label(ctx, String(d), X(d) + cw / 2, top + 13, { size: 9.5, color: d === 21 ? C.good : C.faint });
    }
    label(ctx, t('March'), L, 7, { size: 10, align: 'left' });
    const ex = X(Math.max(1, Math.min(31, day))) + cw / 2;
    label(ctx, '☀', ex, top + 40, { size: 15, color: C.accent });
    label(ctx, t('equinox'), ex, top + 56, { size: 10, color: C.accent });
    // the drift over the centuries, under each rule
    const gt = top + 72, gb = h - 18, GX = (y: number) => L + ((y - 300) / 2700) * (R - L), GY = (d: number) => gt + ((21.5 - d) / 22) * (gb - gt);
    line(ctx, L, GY(21), R, GY(21), C.good, 1, [3, 3]);
    for (const [r, colour] of [[false, '#fca5a5'], [true, '#93c5fd']] as const) {
      ctx.strokeStyle = colour;
      ctx.lineWidth = r === g ? 2.5 : 1.2;
      ctx.beginPath();
      for (let y = 325; y <= 3000; y += 25) ctx[y === 325 ? 'moveTo' : 'lineTo'](GX(y), GY(equinox(y, r)));
      ctx.stroke();
    }
    line(ctx, GX(year), gt, GX(year), gb, C.ink, 1.5);
    for (const y of [325, 1000, 1582, 2000, 3000]) label(ctx, String(y), GX(y), gb + 10, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Calendar')}
        value={rule}
        onChange={pick}
        options={[
          { value: 'julian', label: t('Julian: every 4th year') },
          { value: 'gregorian', label: t('Gregorian: 97 in 400') },
        ]}
      />
      <Stage draw={draw} label={t('The spring equinox falls on {d} in {y}', { d: date, y: year })} />
      <Range label={t('Year')} value={year} min={325} max={3000} step={1} onChange={go} />
      <Readouts
        items={[
          { label: t('Equinox'), value: date, tone: Math.round(day) === 21 ? 'good' : 'accent' },
          { label: t('Average year'), value: t('{d} days', { d: formatNumber(g ? GREGORIAN : JULIAN) }) },
          { label: t('{y}: leap year?', { y: year }), value: leap(year, g && year >= 1582) ? t('yes') : t('no') },
        ]}
      />
    </div>
  );
}
