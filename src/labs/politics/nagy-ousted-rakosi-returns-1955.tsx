import { useState } from 'react';
import { Btn, C, label, line, Stage, useGoal, type LabProps } from '../kit';
import { t, LOCALE } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * 1955 in Hungary and next door in Austria, from the 1956 Institute's chronology (rev.hu) and the UN Special
 * Committee's report of 1957 (paras 306–315): the reader taps the events in the order they happened and each one
 * takes its place on a 1955 timeline, Hungary above the line, Austria below.
 */
export type EventId = 'moscow' | 'nagyOut' | 'warsaw' | 'treaty' | 'vienna' | 'neutral' | 'un';
export const EVENTS: { id: EventId; month: number; day: number; side: 'hu' | 'at' }[] = [
  { id: 'moscow', month: 1, day: 8, side: 'hu' },
  { id: 'nagyOut', month: 4, day: 14, side: 'hu' },
  { id: 'warsaw', month: 5, day: 14, side: 'hu' },
  { id: 'treaty', month: 5, day: 15, side: 'at' },
  { id: 'vienna', month: 9, day: 19, side: 'at' },
  { id: 'neutral', month: 10, day: 26, side: 'at' },
  { id: 'un', month: 12, day: 14, side: 'hu' },
];
/** The day of the year 1955 (1 January = 1). */
export const dayOfYear = (month: number, day: number) => Math.round((Date.UTC(1955, month - 1, day) - Date.UTC(1955, 0, 1)) / 86400000) + 1;
/** Whether the events are in time order. */
export const inOrder = (ids: EventId[]) => ids.every((id, i) => i === 0 || at(ids[i - 1]) < at(id));
const at = (id: EventId) => { const e = EVENTS.find((x) => x.id === id)!; return dayOfYear(e.month, e.day); };
/** The event that should come next, after those already placed. */
export const nextEvent = (placed: EventId[]) => EVENTS.find((e) => !placed.includes(e.id))?.id;

const TEAL = '#5fc0b2', RED = '#e05252';

export default function Year1955({ onDone }: LabProps) {
  const [placed, setPlaced] = useState<EventId[]>([]);
  const [wrong, setWrong] = useState(0);
  const [miss, setMiss] = useState(false);
  useGoal(placed.length === EVENTS.length, onDone);

  const name = (id: EventId) =>
    id === 'moscow' ? t('Moscow condemns Nagy')
    : id === 'nagyOut' ? t('Nagy pushed out')
    : id === 'warsaw' ? t('Warsaw Pact signed')
    : id === 'treaty' ? t('Austrian State Treaty')
    : id === 'vienna' ? t('Soviets leave Vienna')
    : id === 'neutral' ? t('Austria neutral')
    : t('Hungary joins the UN');

  const tap = (id: EventId) => {
    if (id === nextEvent(placed)) { setPlaced([...placed, id]); setMiss(false); }
    else { setWrong(wrong + 1); setMiss(true); }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 14, x1 = w - 14, y = h * 0.5, X = (d: number) => x0 + ((x1 - x0) * (d - 1)) / 364;
    line(ctx, x0, y, x1, y, C.soft, 2);
    const months = new Intl.DateTimeFormat(LOCALE, { month: 'narrow', timeZone: 'UTC' });
    for (let m = 1; m <= 12; m++) {
      const x = X(dayOfYear(m, 1));
      line(ctx, x, y - 4, x, y + 4, C.faint, 1);
      label(ctx, months.format(new Date(Date.UTC(1955, m - 1, 15))), X(dayOfYear(m, 15)), y + 14, { size: 9, color: C.faint });
    }
    label(ctx, t('Hungary, 1955'), 8, y - 46, { size: 10, color: TEAL, align: 'left' });
    label(ctx, t('Austria, 1955'), 8, y + 54, { size: 10, color: RED, align: 'left' });
    // each placed event: a numbered dot above (Hungary) or below (Austria) the line; the latest one is named
    placed.forEach((id, i) => {
      const e = EVENTS.find((x) => x.id === id)!;
      const x = X(dayOfYear(e.month, e.day)), up = e.side === 'hu', ty = up ? y - 22 : y + 30, col = up ? TEAL : RED;
      line(ctx, x, y, x, up ? ty + 8 : ty - 8, col, 1.5);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, ty, 8, 0, Math.PI * 2); ctx.fill();
      label(ctx, formatNumber(i + 1), x, ty, { size: 10, color: '#0a111a' });
    });
    const last = placed[placed.length - 1];
    if (last) {
      const e = EVENTS.find((x) => x.id === last)!, up = e.side === 'hu';
      label(ctx, name(last), w / 2, up ? 12 : h - 12, { size: 12, color: up ? TEAL : RED });
    }
  };

  const left = EVENTS.filter((e) => !placed.includes(e.id)).sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A 1955 timeline, Hungary above and Austria below: {n} of {total} events placed', { n: formatNumber(placed.length), total: formatNumber(EVENTS.length) })} />
      {left.length ? (
        <div className="lab__choice" role="group" aria-label={t('Which came next in 1955?')}>
          {left.map((e) => (
            <button key={e.id} onClick={() => tap(e.id)}>{name(e.id)}</button>
          ))}
        </div>
      ) : (
        <Btn ghost onClick={() => { setPlaced([]); setWrong(0); setMiss(false); }}>{t('Order 1955 again')}</Btn>
      )}
      <p className="lab__note">
        {miss ? t('Not yet: something else came first.') : t('Tap the events of 1955 in the order they happened. Wrong taps: {n}', { n: formatNumber(wrong) })}
      </p>
    </div>
  );
}
