import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** US price changes, September 2025 to September 2026, in % (BLS CPI release, 14 October 2026). */
export const CHANGE = { energy: 20.4, food: 2.5, rest: 2.6 };

/** The average basket a year earlier, in %: BLS relative importance in August 2026, each divided by (1 + its price rise), rescaled to 100. */
const RI = { energy: 7.418, food: 13.507, rest: 79.075 };
const raw = { energy: RI.energy / (1 + CHANGE.energy / 100), food: RI.food / (1 + CHANGE.food / 100), rest: RI.rest / (1 + CHANGE.rest / 100) };
const sum = raw.energy + raw.food + raw.rest;
export const AVERAGE = { energy: (100 * raw.energy) / sum, food: (100 * raw.food) / sum };

/** Inflation for a basket that spends `energy`% on energy and `food`% on food, the rest on everything else. */
export function inflationFor(energy: number, food: number) {
  const rest = 100 - energy - food;
  const push = { energy: (energy * CHANGE.energy) / 100, food: (food * CHANGE.food) / 100, rest: (rest * CHANGE.rest) / 100 };
  return { ...push, total: push.energy + push.food + push.rest };
}

const COLOURS = { energy: '#f28c28', food: '#8cc152', rest: '#8e9aab' };
const GOAL = 5;

export default function InflationBasket({ onDone }: LabProps) {
  const [energy, setEnergy] = useState(Math.round(AVERAGE.energy * 2) / 2);
  const [food, setFood] = useState(Math.round(AVERAGE.food * 2) / 2);
  const mine = inflationFor(energy, food), avg = inflationFor(AVERAGE.energy, AVERAGE.food);
  const reached = mine.total >= GOAL;
  useGoal(reached, onDone);
  const pct = (x: number) => `${formatNumber(Math.round(x * 10) / 10)}%`;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 12, bw = w - 24;
    // your spending, as one bar
    label(ctx, t('Your spending'), x0, 12, { size: 11, align: 'left', color: C.soft });
    let x = x0;
    for (const [key, share] of [['energy', energy], ['food', food], ['rest', 100 - energy - food]] as const) {
      ctx.fillStyle = COLOURS[key];
      ctx.fillRect(x, 22, (bw * share) / 100, 22);
      x += (bw * share) / 100;
    }
    label(ctx, t('energy spending'), x0, 56, { size: 10, align: 'left', color: COLOURS.energy });
    label(ctx, t('food spending'), x0 + bw * 0.4, 56, { size: 10, align: 'center', color: COLOURS.food });
    label(ctx, t('everything else you buy'), x0 + bw, 56, { size: 10, align: 'right', color: COLOURS.rest });
    // the pushes, on a scale of 0 to 8 points
    const y = Math.max(88, h * 0.52), sc = bw / 8;
    label(ctx, t('What each part adds to your inflation, in points'), x0, y - 12, { size: 11, align: 'left', color: C.soft });
    x = x0;
    for (const key of ['energy', 'food', 'rest'] as const) {
      ctx.fillStyle = COLOURS[key];
      ctx.fillRect(x, y, mine[key] * sc, 22);
      x += mine[key] * sc;
    }
    for (let p = 0; p <= 8; p += 2) label(ctx, String(p), x0 + p * sc, y + 34, { size: 10, color: C.faint });
    // the average and the goal
    for (const [v, col, name] of [[avg.total, C.ink, t('average basket, {v}', { v: pct(avg.total) })], [GOAL, C.accent, t('your goal, {v}', { v: pct(GOAL) })]] as const) {
      ctx.fillStyle = col;
      ctx.fillRect(x0 + v * sc - 1, y - 4, 2, 30);
      label(ctx, name, x0 + v * sc, y + 46, { size: 10, color: col });
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Your basket as a bar of spending shares, and what each part adds to your inflation: {v} in all', { v: pct(mine.total) })} />
      <Range label={t('Share spent on energy')} value={energy} min={0} max={25} step={0.5} onChange={setEnergy} format={pct} />
      <Range label={t('Share spent on food')} value={food} min={5} max={30} step={0.5} onChange={setFood} format={pct} />
      <Readouts
        items={[
          { label: t('Your inflation'), value: pct(mine.total), tone: reached ? 'good' : undefined },
          { label: t('Added by energy'), value: t('{n} pts', { n: formatNumber(Math.round(mine.energy * 10) / 10) }) },
          { label: t('Average basket'), value: pct(avg.total) },
        ]}
      />
      <p className="lab__note">{t('Simplified: three groups, real US price changes to September 2026, average shares estimated from BLS weights.')}</p>
    </div>
  );
}
