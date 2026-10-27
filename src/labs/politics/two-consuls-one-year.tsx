import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Centuriate Assembly's 193 centuries in Livy's account (1.43), in the order they were called: richest first. */
export const CLASSES = [18, 80, 20, 20, 20, 30, 5] as const;
export const TOTAL = CLASSES.reduce((s, n) => s + n, 0);
export const MAJORITY = Math.floor(TOTAL / 2) + 1;
/** The horsemen (18) and the first class (80) voted first. */
export const RICH = CLASSES[0] + CLASSES[1];
export const OTHERS = TOTAL - RICH;

/** Split `n` votes for A among the lower classes in proportion to their size (largest remainder). */
export function shareOut(n: number): number[] {
  const lower = CLASSES.slice(2);
  const raw = lower.map((c) => (n * c) / OTHERS);
  const out = raw.map(Math.floor);
  let left = n - out.reduce((s, x) => s + x, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) if (left > 0) (out[i]++, left--);
  return out;
}

export interface Vote {
  a: number;
  b: number;
  /** Centuries that voted before the count stopped. */
  called: number;
  winner: 'A' | 'B';
  /** How many classes (counting the horsemen and the first class as one block) were called. */
  blocks: number;
}

/** Run the vote: the richest 98 first, then each lower class in turn, stopping once one side has a majority. */
export function runVote(richForA: number, othersForA: number): Vote {
  const blocks = [[richForA, RICH], ...shareOut(othersForA).map((x, i) => [x, CLASSES[i + 2]])];
  let a = 0, b = 0, called = 0, n = 0;
  for (const [forA, size] of blocks) {
    a += forA;
    b += size - forA;
    called += size;
    n++;
    if (a >= MAJORITY || b >= MAJORITY) break;
  }
  return { a, b, called, winner: a > b ? 'A' : 'B', blocks: n };
}

const BLUE = '#7fb2e6', RED = '#f08a76', IDLE = 'rgba(255,255,255,0.12)';

export default function CenturiateVote({ onDone }: LabProps) {
  const [rich, setRich] = useState(60);
  const [others, setOthers] = useState(30);
  const v = runVote(rich, others);
  const early = v.blocks === 1;
  useGoal(early, onDone);
  const lower = shareOut(others);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const per = 20, rows = 11, cell = Math.min((w - 70) / per, (h - 8) / rows), x0 = w - per * cell - 4;
    let row = 0;
    const names = [t('Horsemen, 18'), t('1st class, 80'), t('2nd class, 20'), t('3rd class, 20'), t('4th class, 20'), t('5th class, 30'), t('Others, 5')];
    let idx = 0;
    CLASSES.forEach((n, ci) => {
      const forA = ci === 0 ? Math.round((rich * CLASSES[0]) / RICH) : ci === 1 ? rich - Math.round((rich * CLASSES[0]) / RICH) : lower[ci - 2];
      const r = Math.ceil(n / per);
      label(ctx, names[ci], x0 - 6, 4 + (row + r / 2) * cell, { size: 9, align: 'right', color: ci < 2 ? C.accent : C.soft });
      for (let i = 0; i < n; i++) {
        const voted = idx < v.called;
        ctx.fillStyle = !voted ? IDLE : i < forA ? BLUE : RED;
        ctx.fillRect(x0 + (i % per) * cell + 1, 4 + (row + Math.floor(i / per)) * cell + 1, cell - 2, cell - 2);
        idx++;
      }
      row += r;
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The 193 centuries: {a} for A, {b} for B, {n} never called', { a: v.a, b: v.b, n: TOTAL - v.called })} />
      <Range label={t('Of the 98 richest centuries, for A')} value={rich} min={0} max={RICH} step={1} onChange={(x) => setRich(Math.round(x))} format={(x) => formatNumber(x)} />
      <Range label={t('Of the other 95 centuries, for A')} value={others} min={0} max={OTHERS} step={1} onChange={(x) => setOthers(Math.round(x))} format={(x) => formatNumber(x)} />
      <Readouts
        items={[
          { label: t('Elected consul'), value: v.winner === 'A' ? t('Candidate A') : t('Candidate B'), tone: 'accent' },
          { label: t('Votes A : B when counting stopped'), value: `${formatNumber(v.a)} : ${formatNumber(v.b)}` },
          { label: t('Centuries never called'), value: formatNumber(TOTAL - v.called), tone: early ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: one race between two candidates, in Livy’s order of classes; a reform in the 3rd century BC later changed the numbers.')}</p>
    </div>
  );
}
