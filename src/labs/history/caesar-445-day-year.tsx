import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Sun's year from one March equinox to the next, about 365.2422 days; the model keeps it fixed. */
export const SUN_YEAR = 365.2422;

export type Rule = 'none' | 'three' | 'four' | 'gregorian';

/**
 * The average calendar year under each leap-day rule: none, every third year (the priests' early mistake),
 * every fourth year (Caesar), and the Gregorian rule of 1582 (every fourth year, but not in century years
 * unless they divide by 400: 97 leap days in 400 years).
 */
export const AVERAGE: Record<Rule, number> = {
  none: 365,
  three: 365 + 1 / 3,
  four: 365.25,
  gregorian: 365 + 97 / 400,
};

/** Days the equinox moves in the calendar after `years`: positive is earlier, as a too-long calendar year falls behind the Sun. */
export const drift = (rule: Rule, years: number) => years * (AVERAGE[rule] - SUN_YEAR);

/** Years until the equinox has moved a whole day. */
export const yearsPerDay = (rule: Rule) => 1 / Math.abs(AVERAGE[rule] - SUN_YEAR);

const GOAL_YEARS = 1000;
const MAX_YEARS = 2000, MAX_DAYS = 16;

export default function CaesarYear({ onDone }: LabProps) {
  const [rule, setRule] = useState<Rule>('none');
  const [years, setYears] = useState(100);
  const d = drift(rule, years);
  useGoal(years >= GOAL_YEARS && Math.abs(d) < 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 10, top = 14, bot = h - 22, mid = (top + bot) / 2;
    const X = (y: number) => L + (y / MAX_YEARS) * (R - L);
    const Y = (days: number) => mid - (Math.max(-MAX_DAYS, Math.min(MAX_DAYS, days)) / MAX_DAYS) * (bot - top) / 2;
    // within a day of the Sun
    ctx.fillStyle = 'rgba(134,239,172,0.14)';
    ctx.fillRect(L, Y(1), R - L, Y(-1) - Y(1));
    for (const v of [-15, -10, -5, 5, 10, 15]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${v > 0 ? '+' : ''}${v}`, L - 4, Y(v), { size: 9, align: 'right', color: C.faint });
    }
    line(ctx, L, mid, R, mid, C.soft, 1.2);
    label(ctx, '0', L - 4, mid, { size: 9, align: 'right', color: C.soft });
    for (const y of [0, 500, 1000, 1500, 2000]) label(ctx, formatNumber(y, 'year'), X(y), bot + 11, { size: 9, color: C.faint, align: y === MAX_YEARS ? 'right' : 'center' });
    label(ctx, t('equinox earlier'), R, top + 6, { size: 9.5, align: 'right', color: C.soft });
    label(ctx, t('equinox later'), R, bot - 8, { size: 9.5, align: 'right', color: C.soft });
    // this rule over 2,000 years
    ctx.strokeStyle = C.cool;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(MAX_YEARS), Y(drift(rule, MAX_YEARS)));
    ctx.stroke();
    const ok = Math.abs(d) < 1;
    line(ctx, X(years), bot, X(years), Y(d), C.faint, 1, [3, 3]);
    dot(ctx, X(years), Y(d), 5, ok ? C.good : C.bad);
  };

  const days = Math.abs(d);
  const shown = formatNumber(Math.round(days * 10) / 10);
  return (
    <div className="lab">
      <Choice
        label={t('Leap days')}
        value={rule}
        onChange={setRule}
        options={[
          { value: 'none', label: t('None') },
          { value: 'three', label: t('Every 3rd year') },
          { value: 'four', label: t('Every 4th year') },
          { value: 'gregorian', label: t('Gregorian') },
        ]}
      />
      <Stage draw={draw} label={t('After {n} years the equinox has moved {d} days', { n: formatNumber(years), d: shown })} />
      <Range label={t('Years')} value={years} min={1} max={MAX_YEARS} step={1} onChange={(v) => setYears(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Average year'), value: t('{n} days', { n: AVERAGE[rule].toFixed(4) }) },
          {
            label: t('Equinox moved'),
            value: days < 0.05 ? t('not at all') : d > 0 ? t('{n} days earlier', { n: shown }) : t('{n} days later', { n: shown }),
            tone: days < 1 ? 'good' : 'bad',
          },
          { label: t('A day off every'), value: t('{n} years', { n: formatNumber(Math.round(yearsPerDay(rule))) }), tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the Sun’s year is held at 365.2422 days.')}</p>
    </div>
  );
}
