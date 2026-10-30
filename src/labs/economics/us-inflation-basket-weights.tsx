import { useState } from 'react';
import { C, clamp, font, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
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
    // A heading shrinks to fit a narrow phone rather than run off the edge.
    const heading = (s: string, y: number) => {
      font(ctx, 11);
      label(ctx, s, x0, y, { size: Math.max(9, Math.min(11, (11 * bw) / ctx.measureText(s).width)), align: 'left', color: C.soft });
    };
    // On a short stage (small phones) the bars get thinner, so both rows and their labels still fit.
    const bh = clamp((h - 82) / 2, 14, 22);
    // your spending, as one bar
    heading(t('Your spending'), 9);
    let x = x0;
    for (const [key, share] of [['energy', energy], ['food', food], ['rest', 100 - energy - food]] as const) {
      ctx.fillStyle = COLOURS[key];
      ctx.fillRect(x, 18, (bw * share) / 100, bh);
      x += (bw * share) / 100;
    }
    // the food label under its part of the bar, kept clear of the labels at either end
    const ly = 18 + bh + 10;
    font(ctx, 10);
    const left = x0 + ctx.measureText(t('energy')).width + 8;
    const right = x0 + bw - ctx.measureText(t('everything else')).width - 8;
    const half = ctx.measureText(t('food')).width / 2;
    const foodAt = clamp(x0 + (bw * (energy + food / 2)) / 100, left + half, Math.max(left + half, right - half));
    label(ctx, t('energy'), x0, ly, { size: 10, align: 'left', color: COLOURS.energy });
    label(ctx, t('food'), foodAt, ly, { size: 10, align: 'center', color: COLOURS.food });
    label(ctx, t('everything else'), x0 + bw, ly, { size: 10, align: 'right', color: COLOURS.rest });
    // the pushes, on a scale of 0 to 8 points
    const y = Math.min(Math.max(ly + 26, h * 0.52), h - bh - 28), sc = bw / 8;
    heading(t('What each part adds to your inflation, in points'), y - 12);
    x = x0;
    for (const key of ['energy', 'food', 'rest'] as const) {
      ctx.fillStyle = COLOURS[key];
      ctx.fillRect(x, y, mine[key] * sc, bh);
      x += mine[key] * sc;
    }
    for (let p = 0; p <= 8; p += 2) label(ctx, String(p), x0 + p * sc, y + bh + 11, { size: 10, color: C.faint });
    // the average and the goal, close together on the scale: the average's label ends at its line, the goal's starts at its own
    for (const [v, col, name, align] of [
      [avg.total, C.ink, t('average basket, {v}', { v: pct(avg.total) }), 'right'],
      [GOAL, C.accent, t('your goal, {v}', { v: pct(GOAL) }), 'left'],
    ] as const) {
      ctx.fillStyle = col;
      ctx.fillRect(x0 + v * sc - 1, y - 4, 2, bh + 8);
      label(ctx, name, x0 + v * sc + (align === 'right' ? -4 : 4), y + bh + 23, { size: 10, color: col, align });
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
