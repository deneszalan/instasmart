import { useState } from 'react';
import { Btn, C, label, line, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Dates that answer each other. Six dates from 1956 to 1989; two pairs fall on the same day of the year: the
 * executions of 16 June 1958 and the reburial of 16 June 1989 (OSA Archivum; Index, 2014), and the revolution of
 * 23 October 1956 and the Republic proclaimed on 23 October 1989 (444.hu, 2019; Act XXVIII of 1990). The others: the
 * Rajk reburial (6 October 1956) and the Soviet attack (4 November 1956), from the UN report of 1957.
 */
export type DateId = 'revolution' | 'attack' | 'rajk' | 'executed' | 'reburial' | 'republic';
export const DATES: { id: DateId; y: number; m: number; d: number }[] = [
  { id: 'rajk', y: 1956, m: 10, d: 6 },
  { id: 'revolution', y: 1956, m: 10, d: 23 },
  { id: 'attack', y: 1956, m: 11, d: 4 },
  { id: 'executed', y: 1958, m: 6, d: 16 },
  { id: 'reburial', y: 1989, m: 6, d: 16 },
  { id: 'republic', y: 1989, m: 10, d: 23 },
];
const get = (id: DateId) => DATES.find((x) => x.id === id)!;
/** Two dates on the same day of the year. */
export const sameDay = (a: DateId, b: DateId) => a !== b && get(a).m === get(b).m && get(a).d === get(b).d;
/** Whole years between two dates on the same day of the year. */
export const yearsApart = (a: DateId, b: DateId) => Math.abs(get(b).y - get(a).y);
export const PAIRS: [DateId, DateId][] = [['executed', 'reburial'], ['revolution', 'republic']];
const key = (a: DateId, b: DateId) => [a, b].sort().join('+');
export const done = (found: string[]) => PAIRS.every(([a, b]) => found.includes(key(a, b)));
export { key as pairKey };

function name(id: DateId) {
  switch (id) {
    case 'rajk': return t('Rajk reburied');
    case 'revolution': return t('Revolution begins');
    case 'attack': return t('Soviet attack');
    case 'executed': return t('Nagy executed');
    case 'reburial': return t('Nagy reburied');
    case 'republic': return t('Republic proclaimed');
  }
}
const dateText = (id: DateId) => {
  const x = get(id);
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(x.y, x.m - 1, x.d));
};
const GOLD = '#f2c879', RED = '#d24b4b';

export default function Anniversaries({ onDone }: LabProps) {
  const [picked, setPicked] = useState<DateId | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<[DateId, DateId] | null>(null);
  useGoal(done(found), onDone);

  const tap = (id: DateId) => {
    if (!picked) { setPicked(id); setMiss(null); return; }
    if (picked === id) { setPicked(null); return; }
    if (sameDay(picked, id)) { const k2 = key(picked, id); if (!found.includes(k2)) setFound([...found, k2]); setMiss(null); }
    else setMiss([picked, id]);
    setPicked(null);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = Math.max(16, w * 0.05), y0 = h * 0.5;
    // a broken axis: 1956–1958, then 1989
    const X = (x: { y: number; m: number; d: number }) => {
      const yr = x.y + (x.m - 1) / 12 + x.d / 365;
      return yr < 1970 ? pad + ((yr - 1956.6) / (1958.8 - 1956.6)) * (w * 0.52 - pad) : w * 0.62 + ((yr - 1989.3) / (1989.95 - 1989.3)) * (w * 0.38 - pad);
    };
    line(ctx, pad, y0, w * 0.55, y0, C.soft, 2);
    line(ctx, w * 0.6, y0, w - pad, y0, C.soft, 2);
    label(ctx, '≈', w * 0.575, y0, { size: 14, color: C.soft });
    label(ctx, t('{n} of 2 pairs', { n: formatNumber(found.length) }), w - 8, 12, { size: 10, color: done(found) ? C.good : C.faint, align: 'right' });
    // pairs found, as arcs
    found.forEach((k2) => {
      const [a, b] = k2.split('+') as DateId[];
      const xa = X(get(a)), xb = X(get(b)), mid = (xa + xb) / 2;
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(xa, y0); ctx.quadraticCurveTo(mid, y0 - h * 0.62, xb, y0); ctx.stroke();
      label(ctx, t('{n} years to the day', { n: formatNumber(yearsApart(a, b)) }), mid, y0 - h * 0.31 - (k2.includes('republic') ? 0 : 12), { size: 11, color: GOLD });
    });
    DATES.forEach((x, i) => {
      const xx = X(x), sel = picked === x.id, bad = miss?.includes(x.id);
      ctx.fillStyle = sel ? GOLD : bad ? RED : C.ink;
      ctx.beginPath(); ctx.arc(xx, y0, sel ? 7 : 5, 0, Math.PI * 2); ctx.fill();
      label(ctx, dateText(x.id), xx, y0 + 18 + (i % 3) * 12, { size: 9, color: sel ? GOLD : C.soft });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} of 2 pairs of anniversaries found', { n: formatNumber(found.length) })} />
      <div className="lab__row">
        {DATES.map((x) => (
          <Btn key={x.id} ghost={picked !== x.id} onClick={() => tap(x.id)}>
            {name(x.id)}
          </Btn>
        ))}
      </div>
      <p className="lab__note">{miss ? t('Different days: try another pair.') : picked ? t('Now tap its partner.') : t('Tap two dates that share a day of the year.')}</p>
    </div>
  );
}
