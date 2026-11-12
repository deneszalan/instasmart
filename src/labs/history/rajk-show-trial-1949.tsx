import { useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The Rajk case on a time line, from Stalin's break with Tito (1948) to the revolution (1956): the reader taps the
 * events in the order they happened. Dates: the trial and the hanging (hvg.hu, 2009); the admission of 27 March 1956
 * and the reburial of 6 October 1956 (UN Special Committee report, 1957). The 1948 split is placed in mid-1948.
 */
export type RajkEvent = { id: 'split' | 'trial' | 'hanged' | 'admitted' | 'reburied' | 'revolution'; y: number; m: number; d: number };
export const EVENTS: RajkEvent[] = [
  { id: 'split', y: 1948, m: 6, d: 28 },
  { id: 'trial', y: 1949, m: 9, d: 16 },
  { id: 'hanged', y: 1949, m: 10, d: 15 },
  { id: 'admitted', y: 1956, m: 3, d: 27 },
  { id: 'reburied', y: 1956, m: 10, d: 6 },
  { id: 'revolution', y: 1956, m: 10, d: 23 },
];
/** The events in a fixed shuffled order, as the buttons show them. */
export const SHUFFLED: RajkEvent['id'][] = ['reburied', 'trial', 'revolution', 'split', 'admitted', 'hanged'];

const ev = (id: RajkEvent['id']) => EVENTS.find((e) => e.id === id)!;
/** Time as a fractional year, for placing on the axis. */
export const yearOf = (e: RajkEvent) => e.y + (e.m - 1) / 12 + (e.d - 1) / 365;
/** The next event in time that hasn't been placed yet. */
export const nextExpected = (placed: RajkEvent['id'][]) => EVENTS.find((e) => !placed.includes(e.id))?.id ?? null;
/** Whole years and months from one date to a later one. */
export function gap(a: RajkEvent, b: RajkEvent) {
  let months = (b.y - a.y) * 12 + (b.m - a.m) - (b.d < a.d ? 1 : 0);
  if (months < 0) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}
/** The goal: every event placed, in order. */
export const done = (placed: RajkEvent['id'][]) => placed.length === EVENTS.length;

function name(id: RajkEvent['id']) {
  switch (id) {
    case 'split': return t('Stalin breaks with Tito');
    case 'trial': return t('Rajk’s trial opens');
    case 'hanged': return t('Rajk is hanged');
    case 'admitted': return t('Charges declared false');
    case 'reburied': return t('Rajk is reburied');
    case 'revolution': return t('The revolution begins');
  }
}
function when(e: RajkEvent) {
  if (e.id === 'split') return '1948';
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(e.y, e.m - 1, e.d));
}

const RED = '#e8846f', GOLD = '#e2b85a';

export default function RajkShowTrial({ onDone }: LabProps) {
  const [placed, setPlaced] = useState<RajkEvent['id'][]>([]);
  const [miss, setMiss] = useState<RajkEvent['id'] | null>(null);
  const [errors, setErrors] = useState(0);
  useGoal(done(placed), onDone);

  const tap = (id: RajkEvent['id']) => {
    if (placed.includes(id)) return;
    if (id === nextExpected(placed)) { setPlaced([...placed, id]); setMiss(null); }
    else { setMiss(id); setErrors(errors + 1); }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = Math.max(22, w * 0.06), y0 = h * 0.55;
    const X = (yr: number) => pad + ((yr - 1948) / (1957 - 1948)) * (w - 2 * pad);
    line(ctx, X(1948), y0, X(1957), y0, C.soft, 2);
    for (let yr = 1948; yr <= 1957; yr++) {
      line(ctx, X(yr), y0 - 5, X(yr), y0 + 5, C.faint, 1.5);
      if (yr % 2 === 0 || w > 420) label(ctx, String(yr), X(yr), y0 + 18, { size: 10, color: C.faint });
    }
    // the silent years between the hanging and the admission
    if (placed.includes('admitted')) {
      ctx.fillStyle = 'rgba(226,184,90,0.16)';
      ctx.fillRect(X(yearOf(ev('hanged'))), y0 - 10, X(yearOf(ev('admitted'))) - X(yearOf(ev('hanged'))), 20);
      label(ctx, t('years of silence'), (X(yearOf(ev('hanged'))) + X(yearOf(ev('admitted')))) / 2, y0 + 34, { size: 11, color: GOLD });
    }
    placed.forEach((id, i) => {
      const e = ev(id), x = X(yearOf(e)), up = i % 2 === 0, yy = up ? y0 - 26 - (i % 3) * 22 : y0 + 50 + (i % 3) * 18;
      ctx.fillStyle = id === 'hanged' ? RED : GOLD;
      ctx.beginPath(); ctx.arc(x, y0, 6, 0, Math.PI * 2); ctx.fill();
      line(ctx, x, y0 + (up ? -6 : 6), x, yy + (up ? 8 : -8), C.faint, 1);
      const align: CanvasTextAlign = x < w * 0.25 ? 'left' : x > w * 0.75 ? 'right' : 'center';
      label(ctx, name(id), x, yy, { size: 11, color: C.ink, align });
      label(ctx, when(e), x, yy + (up ? -13 : 13), { size: 10, color: C.soft, align });
    });
    if (!placed.length) label(ctx, t('Tap the events below in the order they happened'), w / 2, h * 0.22, { size: 12, color: C.soft });
  };

  const left = SHUFFLED.filter((id) => !placed.includes(id));
  const g = placed.includes('admitted') ? gap(ev('hanged'), ev('admitted')) : null;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} of {total} events placed on the time line', { n: formatNumber(placed.length), total: formatNumber(EVENTS.length) })} />
      <div className="lab__row">
        {left.map((id) => (
          <Btn key={id} ghost={miss !== id} onClick={() => tap(id)}>
            {name(id)}
          </Btn>
        ))}
      </div>
      <Readouts
        items={[
          { label: t('Events in order'), value: t('{n} of {total} events', { n: formatNumber(placed.length), total: formatNumber(EVENTS.length) }), tone: done(placed) ? 'good' : undefined },
          {
            label: t('From the hanging to the admission'),
            value: g ? t('{y} years {m} months', { y: formatNumber(g.years), m: formatNumber(g.months) }) : '–',
            tone: g ? 'accent' : undefined,
          },
          { label: t('Wrong taps'), value: formatNumber(errors), tone: errors ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{miss ? t('Not yet: something else happened before that.') : t('Dates from Hungarian sources and the UN report of 1957; the split with Tito is shown in mid-1948.')}</p>
    </div>
  );
}
