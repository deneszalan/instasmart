import { useState } from 'react';
import { C, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const DAY = 86400000;
/** German forces began to arrive in Tunis on 9 November 1942 (Mémorial de la Shoah; G. F. Howe, CMH). */
export const START = Date.UTC(1942, 10, 9);
/** The date `d` days after 9 November 1942. */
export const dateOf = (d: number) => new Date(START + d * DAY);
/** Days from 9 November 1942 to a date (month 1–12). */
export const dayOf = (y: number, m: number, d: number) => Math.round((Date.UTC(y, m - 1, d) - START) / DAY);
/** British troops entered Tunis on 7 May 1943 (ABMC; USHMM); Axis forces in Tunisia surrendered on 13 May. */
export const FREED = dayOf(1943, 5, 7);
export const SURRENDER = dayOf(1943, 5, 13);
/** The order of 6 December 1942 for Jewish workers (R. Borgel, 1944, as described by Yad Ben-Zvi's documentation centre). */
export const ORDER = dayOf(1942, 12, 6);
export const ROUNDUP = dayOf(1942, 12, 9);

export type EventId = 'arrive' | 'leaders' | 'order' | 'roundup' | 'camps' | 'freed' | 'surrender';
/** The days the lab marks, in order. "Within two weeks" (Montreal Holocaust Museum) is drawn at day 14. */
export const EVENTS: { id: EventId; day: number }[] = [
  { id: 'arrive', day: 0 },
  { id: 'leaders', day: 14 },
  { id: 'order', day: ORDER },
  { id: 'roundup', day: ROUNDUP },
  { id: 'camps', day: ROUNDUP + 1 },
  { id: 'freed', day: FREED },
  { id: 'surrender', day: SURRENDER },
];
/** The latest marked event on or before day `d`. */
export const eventAt = (d: number) => EVENTS.filter((e) => e.day <= d).at(-1)!;

const GOLD = '#e2a74a', ROSE = '#d98b8b', TEAL = '#86cdb8';

export default function OccupationCalendar({ onDone }: LabProps) {
  const [d, setD] = useState(0);
  useGoal(d === FREED, onDone);
  const ev = eventAt(d);
  const describe = (id: EventId) =>
    id === 'arrive' ? t('German forces begin to arrive in Tunis')
    : id === 'leaders' ? t('Within two weeks: leaders of the Jewish community arrested')
    : id === 'order' ? t('SS officer Walter Rauff orders the community to supply 2,000 to 3,000 men for forced labour')
    : id === 'roundup' ? t('Roundup of Jewish men in the streets of Tunis')
    : id === 'camps' ? t('About 5,000 men at forced labour, in 32 to about 40 camps')
    : id === 'freed' ? t('British troops enter Tunis; the Germans flee and the forced labour ends')
    : t('Axis forces in Tunisia surrender');
  const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(dateOf(d));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cols = 20, n = SURRENDER + 1, rows = Math.ceil(n / cols);
    const gap = 3, cell = Math.min((w - 16 - gap * (cols - 1)) / cols, (h - 34 - gap * (rows - 1)) / rows);
    const x0 = (w - (cols * cell + (cols - 1) * gap)) / 2, y0 = 6;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i % cols) * (cell + gap), y = y0 + Math.floor(i / cols) * (cell + gap);
      const mark = EVENTS.find((e) => e.day === i && e.id !== 'camps');
      ctx.fillStyle = i > d ? 'rgba(255,255,255,0.10)' : i >= FREED ? TEAL : i > ROUNDUP ? 'rgba(217,139,139,0.55)' : 'rgba(226,167,74,0.55)';
      ctx.beginPath(); ctx.roundRect(x, y, cell, cell, 2); ctx.fill();
      if (mark) { ctx.strokeStyle = mark.day >= FREED ? TEAL : mark.day >= ORDER ? ROSE : GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 1.5, y - 1.5, cell + 3, cell + 3, 3); ctx.stroke(); }
      if (i === d) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(x - 2.5, y - 2.5, cell + 5, cell + 5, 3); ctx.stroke(); }
    }
    label(ctx, t('One square a day. Rose: forced labour. Green: Tunis freed.'), w / 2, h - 10, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Calendar of the German occupation of Tunis: day {d}, {date}', { d: formatNumber(d), date })} />
      <Range label={t('Day of the occupation')} value={d} min={0} max={SURRENDER} step={1} onChange={(v) => setD(Math.round(v))} format={(v) => formatNumber(v)} />
      <p className="lab__note">
        <strong>{date}</strong>{d >= ORDER ? ` · ${t('{n} days since the SS order for workers', { n: formatNumber(d - ORDER) })}` : ''}
        <br />
        {t('What happened by then:')} <strong>{describe(ev.id)}</strong>
      </p>
    </div>
  );
}
