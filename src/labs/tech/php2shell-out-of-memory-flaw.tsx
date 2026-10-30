import { useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** A toy request that adds form fields to a table, each needing memory for its name (in KB). */
export const ENTRIES = [
  { name: 'user', kb: 2 },
  { name: 'file', kb: 3 },
  { name: 'a[b]', kb: 4 },
  { name: 'a[b][c]', kb: 6 },
  { name: 'a[b][c][d]', kb: 8 },
];
/** Memory the request already uses before it starts on the table. */
export const START_KB = 4;
export const TOTAL_KB = START_KB + ENTRIES.reduce((a, e) => a + e.kb, 0);

export type Order = 'count-first' | 'memory-first';
export interface Outcome {
  /** What the table's count says. */
  count: number;
  /** Entries that really have memory for their names. */
  built: number;
  crashed: boolean;
  /** A counted entry with no memory: what the tidy-up would trip over. */
  halfBuilt: boolean;
  usedKb: number;
}

/**
 * Fill the table under a memory limit. With "count first" (the order behind the first PHP2Shell flaw), the count goes
 * up before the memory is asked for, so running out leaves a counted entry with nothing behind it.
 */
export function fill(limitKb: number, order: Order): Outcome {
  let count = 0, built = 0, used = START_KB;
  for (const e of ENTRIES) {
    if (order === 'count-first') count++;
    if (used + e.kb > limitKb) return { count, built, crashed: true, halfBuilt: count > built, usedKb: used };
    used += e.kb;
    built++;
    if (order === 'memory-first') count++;
  }
  return { count, built, crashed: false, halfBuilt: false, usedKb: used };
}

const AMBER = '#f4b860', BAD = '#ff5c5c', TEAL = '#5fd4bd', LILAC = '#b9a6ff';

export default function Php2ShellOutOfMemory({ onDone }: LabProps) {
  const [limit, setLimit] = useState(TOTAL_KB + 2);
  const [order, setOrder] = useState<Order>('count-first');
  const o = fill(limit, order);
  useGoal(order === 'memory-first' && o.crashed && !o.halfBuilt, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the count and the table's slots
    const n = ENTRIES.length, top = 6, cw = Math.min(44, h * 0.34, (w - 110) / n - 8), x0 = 92;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(14, top, 64, cw, 8);
    ctx.fill();
    label(ctx, t('table count'), 46, top + 8, { size: 8, color: C.soft });
    label(ctx, String(o.count), 46, top + cw * 0.66, { size: 18, color: LILAC });
    ENTRIES.forEach((e, i) => {
      const x = x0 + i * (cw + 8);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(x, top, cw, cw, 8);
      ctx.fill();
      if (i < o.built) {
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.roundRect(x + 4, top + 4, cw - 8, cw - 8, 6);
        ctx.fill();
        label(ctx, e.name, x + cw / 2, top + cw / 2, { size: e.name.length > 6 ? 7 : 10, color: '#0d1316' });
      } else if (i === o.built && o.halfBuilt) {
        ctx.save();
        ctx.strokeStyle = BAD;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.roundRect(x + 4, top + 4, cw - 8, cw - 8, 6);
        ctx.stroke();
        ctx.restore();
        label(ctx, '?', x + cw / 2, top + cw / 2, { size: 20, color: BAD });
      }
    });
    // the memory bar and the limit
    const by = top + cw + 22, bw = w - 40, scale = bw / 34;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(20, by, bw, 14);
    ctx.fillStyle = o.crashed ? BAD : TEAL;
    ctx.fillRect(20, by, o.usedKb * scale, 14);
    const lx = 20 + limit * scale;
    ctx.fillStyle = BAD;
    ctx.fillRect(lx - 1.5, by - 6, 3, 26);
    label(ctx, t('memory limit'), Math.min(w - 40, lx), by - 12, { size: 10, color: BAD });
    label(ctx, t('memory used'), 20, by + 24, { size: 10, color: C.soft, align: 'left' });
    const verdict = !o.crashed ? t('the request finished: nothing to tidy up') : o.halfBuilt ? t('out of memory mid-step: the tidy-up trips on junk') : t('out of memory: everything counted is real');
    label(ctx, verdict, w / 2, h - 9, { size: 12, color: o.crashed && o.halfBuilt ? BAD : o.crashed ? C.good : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A table with {c} counted entries and {b} built', { c: String(o.count), b: String(o.built) })} />
      <Range label={t('Memory limit of the request')} value={limit} min={6} max={30} step={1} onChange={setLimit} format={(v) => `${v} KB`} />
      <Choice
        label={t('Order of the two steps')}
        value={order}
        onChange={setOrder}
        options={[
          { value: 'count-first', label: t('count, then memory') },
          { value: 'memory-first', label: t('memory, then count') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Entries counted'), value: o.count },
          { label: t('Entries really built'), value: o.built, tone: o.halfBuilt ? 'bad' : 'good' },
        ]}
      />
      <p className="lab__note">{t('A toy model of the first PHP2Shell flaw, with made-up sizes: not PHP’s real code or fix.')}</p>
    </div>
  );
}
