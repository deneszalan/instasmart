import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

/** Days since 1 January 1970 (UTC) for a calendar date. */
export const day = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / 86400000;
export const START = day(1942, 11, 1);
export const END = day(1943, 5, 31);
/** German aircraft were arriving at Tunis by 9 November 1942 (Wikipedia, Tunisian campaign). */
export const AXIS_IN = day(1942, 11, 9);
/** The Axis surrender in Tunisia, 13 May 1943 (Hammamet was taken a little earlier; simplified). */
export const AXIS_OUT = day(1943, 5, 13);
/** Tripoli fell to the Eighth Army on 23 January 1943; Rommel's army retreated into Tunisia. */
export const TRIPOLI = day(1943, 1, 23);
/** Army Group Africa was created on 23 February 1943 under Rommel; on 9 March he left Africa (Wikipedia, Erwin Rommel). */
export const COMMAND = day(1943, 2, 23);
export const LEFT = day(1943, 3, 9);

export type Rommel = 'libya' | 'retreating' | 'tunisia' | 'gone';
export const rommelAt = (d: number): Rommel => (d < TRIPOLI ? 'libya' : d < COMMAND ? 'retreating' : d <= LEFT ? 'tunisia' : 'gone');
export const axisInHammamet = (d: number) => d >= AXIS_IN && d < AXIS_OUT;
/** Could the story that Rommel slept at the villa fit this date? */
export const fits = (d: number): 'no' | 'maybe' | 'yes' => {
  if (!axisInHammamet(d)) return 'no';
  const r = rommelAt(d);
  return r === 'tunisia' ? 'yes' : r === 'retreating' ? 'maybe' : 'no';
};
/** The last date on which the story could fit. */
export const lastFit = () => {
  let last = START;
  for (let d = START; d <= END; d++) if (fits(d) === 'yes') last = d;
  return last;
};

const dateText = (d: number) => new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(d * 86400000));

export default function DarSebastianDates({ onDone }: LabProps) {
  const [d, setD] = useState(day(1943, 1, 1));
  useGoal(d === LEFT, onDone);
  const r = rommelAt(d), f = fits(d);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, X = (x: number) => L + ((x - START) / (END - START)) * (R - L);
    const bar = (y: number, a: number, b: number, col: string, name: string) => {
      ctx.fillStyle = col; ctx.fillRect(X(a), y - 6, X(b) - X(a), 12);
      label(ctx, name, L, y - 15, { size: 11, color: C.ink, align: 'left' });
    };
    const gap = Math.min(44, (h - 70) / 2);
    bar(26, AXIS_IN, AXIS_OUT, 'rgba(255,159,128,0.55)', t('Axis troops in Hammamet'));
    bar(26 + gap, COMMAND, LEFT, '#ffd166', t('Rommel commands in Tunisia, then leaves Africa'));
    // the verdict for the chosen date
    const verdict = f === 'yes' ? t('The dates allow it') : f === 'maybe' ? t('Only if he was already in Tunisia') : t('The dates rule it out');
    label(ctx, verdict, w / 2, 26 + 2 * gap, { size: 13, color: f === 'yes' ? C.good : f === 'maybe' ? C.accent : C.bad });
    // month ticks
    for (const [y, m] of [[1942, 11], [1942, 12], [1943, 1], [1943, 2], [1943, 3], [1943, 4], [1943, 5]]) {
      const x = X(day(y, m, 1));
      line(ctx, x, h - 26, x, h - 20, C.faint, 1);
      label(ctx, new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: 'UTC' }).format(new Date(day(y, m, 1) * 86400000)), x + 2, h - 12, { size: 10, color: C.faint, align: 'left' });
    }
    // the chosen date
    const col = f === 'yes' ? C.good : f === 'maybe' ? C.accent : C.bad;
    line(ctx, X(d), 8, X(d), h - 28, col, 2.5);
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A timeline from November 1942 to May 1943; the chosen date is {date}', { date: dateText(d) })} />
      <Range label={t('Day, 1942–43')} value={d} min={START} max={END} step={1} onChange={(v) => setD(Math.round(v))} format={dateText} />
      <Readouts
        items={[
          { label: t('Where Rommel is'), value: r === 'libya' ? t('in Libya') : r === 'retreating' ? t('retreating into Tunisia') : r === 'tunisia' ? t('commanding in Tunisia') : t('has left Africa'), tone: f === 'yes' ? 'good' : f === 'maybe' ? 'accent' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the Axis counts as in Hammamet until the surrender of 13 May 1943.')}</p>
    </div>
  );
}
