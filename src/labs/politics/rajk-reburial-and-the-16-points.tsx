import { useRef, useState } from 'react';
import { C, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * October 1956 on a wall calendar: the reader pins each event of the road to 23 October on its day. Dates from the UN
 * Special Committee's report (1957): the reburial (6), Nagy readmitted (announced 14), compulsory Russian to end (19),
 * the sixteen points (22), the march (23); Hungarian Review (2017): MEFESZ in Szeged (16); FRUS: Soviet leaders in
 * Warsaw (19); Encyclopedia of World Biography: Gomułka elected (21). 1 October 1956 was a Monday.
 */
export type OctEvent = 'reburial' | 'nagy' | 'mefesz' | 'russian' | 'warsaw' | 'gomulka' | 'points' | 'march';
export const DAY: Record<OctEvent, number> = { reburial: 6, nagy: 14, mefesz: 16, russian: 19, warsaw: 19, gomulka: 21, points: 22, march: 23 };
/** The order the cards come up in. */
export const DECK: OctEvent[] = ['points', 'reburial', 'gomulka', 'mefesz', 'march', 'nagy', 'warsaw', 'russian'];
/** Column (0 = Monday) and row of a day in October 1956, which began on a Monday. */
export const cell = (day: number) => ({ col: (day - 1) % 7, row: Math.floor((day - 1) / 7) });
export const dayAt = (col: number, row: number) => (col >= 0 && col < 7 && row >= 0 ? row * 7 + col + 1 : 0);
export const fits = (e: OctEvent, day: number) => DAY[e] === day;
/** Days between two dates in October. */
export const daysBetween = (a: OctEvent, b: OctEvent) => DAY[b] - DAY[a];
export const done = (placed: OctEvent[]) => DECK.every((e) => placed.includes(e));

function long(e: OctEvent) {
  switch (e) {
    case 'reburial': return t('László Rajk is reburied in Budapest');
    case 'nagy': return t('Imre Nagy is taken back into the party');
    case 'mefesz': return t('Students in Szeged found MEFESZ');
    case 'russian': return t('Russian is to stop being compulsory');
    case 'warsaw': return t('Soviet leaders fly to Warsaw');
    case 'gomulka': return t('Gomułka is elected in Poland');
    case 'points': return t('Students adopt the 16 points');
    case 'march': return t('The march to the Bem statue');
  }
}
function short(e: OctEvent) {
  switch (e) {
    case 'reburial': return 'Rajk';
    case 'nagy': return 'Nagy';
    case 'mefesz': return 'MEFESZ';
    case 'russian': return t('Russian at school');
    case 'warsaw': return t('In Warsaw');
    case 'gomulka': return 'Gomułka';
    case 'points': return t('16 points');
    case 'march': return t('The march');
  }
}
const AMBER = '#e8a93e', RED = '#d9485a';

export default function October1956({ onDone }: LabProps) {
  const [placed, setPlaced] = useState<OctEvent[]>([]);
  const [wrong, setWrong] = useState(0);
  const [miss, setMiss] = useState(0);
  const size = useRef({ w: 0, h: 0 });
  const current = DECK.find((e) => !placed.includes(e)) ?? null;
  useGoal(done(placed), onDone);

  const grid = (w: number, h: number) => {
    const top = 22, cw = w / 7, ch = (h - top - 4) / 4;
    return { top, cw, ch };
  };
  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down' || !current) return;
    const { top, cw, ch } = grid(size.current.w, size.current.h);
    const day = dayAt(Math.floor(p.x / cw), Math.floor((p.y - top) / ch));
    if (day < 1 || day > 28) return;
    if (fits(current, day)) { setPlaced([...placed, current]); setMiss(0); }
    else { setWrong(wrong + 1); setMiss(day); }
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const { top, cw, ch } = grid(s.w, s.h);
    const names = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: 'UTC' }).format(Date.UTC(1956, 9, 1 + i)));
    names.forEach((n, i) => label(ctx, n, i * cw + cw / 2, 10, { size: 10, color: i === 6 ? RED : C.faint }));
    for (let day = 1; day <= 28; day++) {
      const { col, row } = cell(day), x = col * cw, y = top + row * ch;
      const here = DECK.filter((e) => placed.includes(e) && DAY[e] === day);
      ctx.fillStyle = day === miss ? 'rgba(217,72,90,0.35)' : here.length ? 'rgba(232,169,62,0.28)' : day > 23 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.roundRect(x + 2, y + 2, cw - 4, ch - 4, 6); ctx.fill();
      label(ctx, String(day), x + 6, y + 11, { size: 10, color: col === 6 ? RED : C.soft, align: 'left' });
      here.forEach((e, i) => label(ctx, short(e), x + cw / 2, y + ch * 0.55 + i * 12 - (here.length - 1) * 6, { size: Math.min(11, cw / 5), color: AMBER }));
    }
  };

  const span = placed.includes('reburial') && placed.includes('march') ? daysBetween('reburial', 'march') : null;
  return (
    <div className="lab">
      <p className="lab__note">{current ? t('Tap the day: {event}', { event: long(current) }) : t('All eight events are on the calendar.')}</p>
      <Stage draw={draw} onPointer={onPointer} label={t('October 1956: {n} of {total} events pinned', { n: formatNumber(placed.length), total: formatNumber(DECK.length) })} />
      <Readouts
        items={[
          { label: t('Events pinned'), value: t('{n} of {total} events', { n: formatNumber(placed.length), total: formatNumber(DECK.length) }), tone: done(placed) ? 'good' : undefined },
          { label: t('Reburial to march'), value: span === null ? '–' : t('{n} days apart', { n: formatNumber(span) }), tone: span === null ? undefined : 'accent' },
          { label: t('Wrong taps'), value: formatNumber(wrong), tone: wrong ? 'bad' : undefined },
        ]}
      />
    </div>
  );
}
