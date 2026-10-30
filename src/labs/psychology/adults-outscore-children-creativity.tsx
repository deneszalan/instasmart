import { useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Two imaginary players' uses for a tin can, each idea rated 1 to 5 by judges (invented ratings). Player A lists many
 * ordinary ideas; Player B gives a few original ones and one weak one.
 */
export const A_RATINGS = [1.2, 1.4, 1.6, 1.8, 2.0, 1.4, 2.2, 1.6, 2.4, 1.8, 1.4, 2.0];
export const B_RATINGS = [4.0, 3.6, 3.2, 1.2];
export type Rule = 'count' | 'sum' | 'average' | 'best3';
/** The lab's goal holds when Player A lists at least this many ideas. */
export const GOAL_IDEAS = 10;

/** A player's score under a rule. `best3` is the one the 2026 study used: the average of the three highest-rated ideas. */
export function score(ratings: number[], rule: Rule) {
  if (rule === 'count') return ratings.length;
  const sum = ratings.reduce((a, b) => a + b, 0);
  if (rule === 'sum') return sum;
  if (rule === 'average') return sum / ratings.length;
  const top = [...ratings].sort((a, b) => b - a).slice(0, 3);
  return top.reduce((a, b) => a + b, 0) / top.length;
}
/** Which ideas a rule counts (indexes), for drawing. */
export function counted(ratings: number[], rule: Rule) {
  if (rule !== 'best3') return ratings.map((_, i) => i);
  return ratings.map((r, i) => [r, i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, 3).map(([, i]) => i);
}

const ORANGE = '#f0a050', PURPLE = '#b68ce0';

export default function CreativityScoring({ onDone }: LabProps) {
  const [rule, setRule] = useState<Rule>('count');
  const [n, setN] = useState(10);
  const a = A_RATINGS.slice(0, n), b = B_RATINGS;
  const sa = score(a, rule), sb = score(b, rule), bWins = sb > sa;
  // the goal: Player B wins even though Player A lists at least 10 ideas
  useGoal(bWins && n >= GOAL_IDEAS, onDone);
  const fmt = (v: number) => (rule === 'count' ? formatNumber(v) : formatNumber(Math.round(v * 10) / 10));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // each idea as a column, as tall as its rating out of 5; the ideas a rule counts are coloured
    const colW = (w - 18) / 2, top = 30, base = h - 8;
    const column = (ratings: number[], x0: number, title: string, col: string, slots: number) => {
      label(ctx, title, x0, 9, { size: 10.5, align: 'left', color: col });
      const on = new Set(counted(ratings, rule)), step = colW / slots, bw = Math.min(16, step - 3);
      ratings.forEach((r, i) => {
        const x = x0 + i * step + (step - bw) / 2, bh = ((base - top - 12) * r) / 5;
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(x, top + 12, bw, base - top - 12);
        ctx.fillStyle = on.has(i) ? col : 'rgba(255,255,255,0.22)';
        ctx.fillRect(x, base - bh, bw, bh);
        label(ctx, formatNumber(r), x + bw / 2, base - bh - 7, { size: 9, color: C.soft });
      });
    };
    column(a, 6, t('A: many ordinary ideas'), PURPLE, A_RATINGS.length);
    column(b, 12 + colW, t('B: a few original ideas'), ORANGE, 6);
  };

  const ruleName = (r: Rule) => (r === 'count' ? t('Count the ideas') : r === 'sum' ? t('Add up the ratings') : r === 'average' ? t('Average them all') : t('Average the best three'));
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Two players’ ideas as bars, each rated 1 to 5; with the rule {r}, Player A scores {a} and Player B {b}', { r: ruleName(rule), a: fmt(sa), b: fmt(sb) })}
      />
      <Choice
        label={t('Scoring rule')}
        options={(['count', 'sum', 'average', 'best3'] as const).map((r) => ({ value: r, label: ruleName(r) }))}
        value={rule}
        onChange={setRule}
      />
      <Range label={t('Ideas from Player A')} value={n} min={3} max={A_RATINGS.length} step={1} onChange={setN} />
      <Readouts
        items={[
          { label: t('Player A’s score'), value: fmt(sa), tone: !bWins && sa > sb ? 'accent' : undefined },
          { label: t('Player B’s score'), value: fmt(sb), tone: bWins ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Invented ideas and ratings. The 2026 study had five judges, who did not know the players’ ages, rate every use from 1 to 5, and scored each person by their best three.')}</p>
    </div>
  );
}
