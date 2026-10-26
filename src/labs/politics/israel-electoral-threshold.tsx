import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export interface List {
  name: string;
  bloc: 'blue' | 'gold';
  /** Share of the votes, in percent. */
  share: number;
}

/** Example lists (fictional), as in the post's animation: the blue bloc has 48.6% of the votes, the gold bloc 51.4%. */
export const LISTS: List[] = [
  ['B1', 'blue', 20.0], ['G1', 'gold', 20.0], ['B2', 'blue', 12.0], ['G2', 'gold', 12.0], ['B3', 'blue', 8.0], ['G3', 'gold', 7.0],
  ['B4', 'blue', 5.0], ['G4', 'gold', 4.4], ['B5', 'blue', 3.6], ['G5', 'gold', 3.0], ['G6', 'gold', 2.8], ['G7', 'gold', 2.2],
].map(([name, bloc, share]) => ({ name, bloc, share }) as List);

/** Seats for each list over the threshold, shared out by D'Hondt (largest averages), and each bloc's total. */
export function allocate(threshold: number, seats = 120) {
  const passing = LISTS.filter((l) => l.share >= threshold);
  const got = new Map<string, number>(LISTS.map((l) => [l.name, 0]));
  for (let s = 0; s < seats; s++) {
    let best = passing[0];
    for (const l of passing) if (l.share / (got.get(l.name)! + 1) > best.share / (got.get(best.name)! + 1)) best = l;
    got.set(best.name, got.get(best.name)! + 1);
  }
  const bloc = (b: List['bloc']) => passing.filter((l) => l.bloc === b).reduce((n, l) => n + got.get(l.name)!, 0);
  const wasted = LISTS.filter((l) => l.share < threshold).reduce((n, l) => n + l.share, 0);
  return { got, blue: bloc('blue'), gold: bloc('gold'), wasted };
}

const BLUE = '#7aa7e8', GOLD = '#f2c14e';

export default function ElectoralThreshold({ onDone }: LabProps) {
  const [threshold, setThreshold] = useState(3.25);
  const r = allocate(threshold);
  useGoal(r.blue < 61, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 26, R = w - 6, top = 10, base = h - 36, max = 24, slot = (R - L) / LISTS.length;
    const Y = (v: number) => base - (v / max) * (base - top);
    for (const v of [5, 10, 20]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${v}%`, L - 3, Y(v), { size: 9, align: 'right', color: C.faint });
    }
    LISTS.forEach((l, i) => {
      const x = L + slot * i + slot * 0.15, bw = slot * 0.7, out = l.share < threshold;
      ctx.fillStyle = out ? 'rgba(255,255,255,0.22)' : l.bloc === 'blue' ? BLUE : GOLD;
      ctx.fillRect(x, Y(l.share), bw, base - Y(l.share));
      label(ctx, l.name, x + bw / 2, base + 10, { size: 9, color: C.faint });
      label(ctx, out ? '–' : `${r.got.get(l.name)}`, x + bw / 2, base + 24, { size: 10.5, color: out ? C.faint : C.ink });
    });
    line(ctx, L, Y(threshold), R, Y(threshold), C.bad, 2, [5, 4]);
    label(ctx, `${formatNumber(threshold)}%`, R, Y(threshold) - 9, { size: 11, align: 'right', color: C.bad });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Example lists and their seats with a {p}% threshold', { p: formatNumber(threshold) })} />
      <Range label={t('Threshold')} value={threshold} min={0.5} max={6} step={0.05} onChange={(v) => setThreshold(Math.round(v * 100) / 100)} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Blue bloc · 48.6% of votes'), value: t('{n} seats', { n: r.blue }), tone: r.blue >= 61 ? 'good' : undefined },
          { label: t('Gold bloc · 51.4% of votes'), value: t('{n} seats', { n: r.gold }), tone: r.gold >= 61 ? 'good' : undefined },
          { label: t('Votes wasted'), value: `${formatNumber(Math.round(r.wasted * 10) / 10)}%`, tone: 'bad' },
        ]}
      />
    </div>
  );
}
