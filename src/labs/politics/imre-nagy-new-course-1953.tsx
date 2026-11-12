import { useState } from 'react';
import { C, font, label, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Imre Nagy's first government, from Stalin's death to his expulsion from the party, as the 1956 Institute tells it
 * (Szakolczai Attila, Az 1956-os forradalom története, lesson 1) and the Hungarian National Archives date the amnesty
 * and the end of internment (26 July 1953). The reader taps the events in the order they happened; each lands on a
 * timeline from March 1953 to December 1955. Months only where the sources give no day.
 */
export interface NagyEvent {
  id: string;
  /** Months since January 1953 (0 = January 1953), with the day as a fraction where it is known. */
  at: number;
}
export const EVENTS: NagyEvent[] = [
  { id: 'stalin', at: 2 + 4 / 31 },
  { id: 'moscow', at: 5.4 },
  { id: 'speech', at: 6 + 3 / 31 },
  { id: 'amnesty', at: 6 + 25 / 31 },
  { id: 'condemned', at: 26.5 },
  { id: 'expelled', at: 35.5 },
];
export const SPAN = { from: 2, to: 36 };

/** The ids in the order they happened. */
export const ORDER = [...EVENTS].sort((a, b) => a.at - b.at).map((e) => e.id);

/** Whether tapping `id` next is right, given the events placed so far. */
export const isNext = (placed: string[], id: string) => ORDER[placed.length] === id;

/** The goal: every event placed, in order. */
export const complete = (placed: string[]) => placed.length === ORDER.length && placed.every((id, i) => ORDER[i] === id);

function eventText(id: string) {
  switch (id) {
    case 'stalin':
      return t('Stalin dies');
    case 'moscow':
      return t('Leaders summoned to Moscow');
    case 'speech':
      return t('The new course announced');
    case 'amnesty':
      return t('Amnesty, internment ends');
    case 'condemned':
      return t('Party condemns Nagy');
    default:
      return t('Nagy expelled');
  }
}
/** The event's date in the reader's language: 5 March 1953, 1953. március 5.; the month only where no day is known. */
const DATES: Record<string, [number, number, number?]> = {
  stalin: [1953, 2, 5],
  moscow: [1953, 5],
  speech: [1953, 6, 4],
  amnesty: [1953, 6, 26],
  condemned: [1955, 2],
  expelled: [1955, 11],
};
export function eventDate(id: string, locale = LOCALE ?? 'en-GB') {
  const [y, m, d] = DATES[id];
  const opts: Intl.DateTimeFormatOptions = d ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale, opts).format(new Date(Date.UTC(y, m, d ?? 1)));
}

/** A fixed, shuffled order for the buttons, so the answer isn't the button order. */
const SHUFFLED = ['condemned', 'speech', 'stalin', 'expelled', 'amnesty', 'moscow'];
const RED = '#d1495b', BLUE = '#7fb2e5', AMBER = '#f0a64a';

/** Breaks a label into lines that fit `maxW` at `size` px. */
function wrap(ctx: CanvasRenderingContext2D, s: string, maxW: number, size: number) {
  font(ctx, size);
  const out: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export default function NagyNewCourse({ onDone }: LabProps) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  useGoal(complete(placed), onDone);

  const tap = (id: string) => {
    if (placed.includes(id)) return;
    if (isNext(placed, id)) {
      setPlaced([...placed, id]);
      setMiss(null);
    } else setMiss(id);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = Math.max(18, w * 0.06), y = h * 0.5, X = (m: number) => pad + ((w - 2 * pad) * (m - SPAN.from)) / (SPAN.to - SPAN.from);
    // Nagy's time as prime minister, July 1953 to April 1955
    ctx.fillStyle = 'rgba(127,178,229,0.18)';
    ctx.fillRect(X(6 + 3 / 31), y - 16, X(27.5) - X(6 + 3 / 31), 32);
    label(ctx, t('Nagy prime minister'), (X(6.1) + X(27.5)) / 2, y + 28, { size: 10, color: BLUE });
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    for (const [m, s] of [[12, '1954'], [24, '1955']] as const) {
      ctx.beginPath(); ctx.moveTo(X(m), y - 6); ctx.lineTo(X(m), y + 6); ctx.stroke();
      label(ctx, s, X(m), y + 46, { size: 10, color: C.faint });
    }
    label(ctx, '1953', pad, y + 46, { size: 10, color: C.faint, align: 'left' });
    placed.forEach((id, i) => {
      const e = EVENTS.find((x) => x.id === id)!;
      const x = X(e.at), up = i % 2 === 0, ly = up ? y - 38 - (i % 4 === 0 ? 0 : 26) : y + 64 + (i % 4 === 1 ? 0 : 26);
      ctx.fillStyle = id === 'condemned' || id === 'expelled' ? RED : AMBER;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, ly + (up ? 8 : -8)); ctx.stroke();
      const align: CanvasTextAlign = x < w * 0.25 ? 'left' : x > w * 0.75 ? 'right' : 'center';
      label(ctx, eventDate(id), x, ly, { size: 10, color: C.ink, align });
    });
    const top = miss ? t('Not yet: something came before') : !placed.length ? t('Tap the events in the order they happened') : '';
    if (top) wrap(ctx, top, w - 16, 11).forEach((line, i) => label(ctx, line, w / 2, 11 + i * 13, { size: 11, color: miss ? RED : C.soft }));
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} of 6 events placed on the timeline', { n: formatNumber(placed.length) })} />
      <div role="group" aria-label={t('Events, in no order')} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {SHUFFLED.map((id) => (
          <button key={id} className={`lab__btn${placed.includes(id) ? '' : ' lab__btn--ghost'}`} style={{ fontSize: 11.5, padding: '5px 8px', lineHeight: 1.2 }} disabled={placed.includes(id)} onClick={() => tap(id)}>
            {eventText(id)}
          </button>
        ))}
      </div>
    </div>
  );
}
