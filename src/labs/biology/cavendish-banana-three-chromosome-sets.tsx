import { useState } from 'react';
import { Btn, C, Choice, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A banana's set of chromosomes holds 11 kinds: wild Musa acuminata has 2 sets (22), the Cavendish 3 (33). */
export const KINDS = 11;
/** How many sex cells one press of the button makes. */
export const BATCH = 1000;

/**
 * One sex cell in the simple model: how many copies of each of `kinds` chromosomes it gets. With 2 sets each pair
 * splits one and one; with 3 sets each trio sends two copies one way and one the other, which way by a coin toss.
 */
export function sexCell(sets: 2 | 3, kinds: number, rand: () => number): number[] {
  return Array.from({ length: kinds }, () => (sets === 2 ? 1 : rand() < 0.5 ? 1 : 2));
}

/** A sex cell works only if it is balanced: the same number of copies of every kind. */
export const balanced = (cell: number[]) => cell.every((n) => n === cell[0]);

/** The chance that a sex cell comes out balanced: certain with pairs; 2 × (1/2)^kinds with trios. */
export const balancedChance = (sets: 2 | 3, kinds: number) => (sets === 2 ? 1 : 2 * 0.5 ** kinds);

const CORAL = '#ff7b6b', SKY = '#6cc4ff';

export default function CavendishThreeSets({ onDone }: LabProps) {
  const [sets, setSets] = useState<2 | 3>(3);
  const [kinds, setKinds] = useState(3);
  const [seed, setSeed] = useState(1);
  const [tally, setTally] = useState({ made: 0, good: 0 });
  const [recent, setRecent] = useState<number[][]>([]);
  const [madeFull, setMadeFull] = useState(0);
  useGoal(madeFull >= BATCH, onDone);

  const reset = () => {
    setTally({ made: 0, good: 0 });
    setRecent([]);
  };
  const make = () => {
    const rand = rng(seed * 7919 + kinds * 31 + sets);
    let good = 0;
    const cells: number[][] = [];
    for (let i = 0; i < BATCH; i++) {
      const cell = sexCell(sets, kinds, rand);
      if (balanced(cell)) good++;
      if (i < 12) cells.push(cell);
    }
    setSeed((s) => s + 1);
    setTally((tl) => ({ made: tl.made + BATCH, good: tl.good + good }));
    setRecent(cells);
    if (sets === 3 && kinds === KINDS) setMadeFull((n) => n + BATCH);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (!recent.length) {
      label(ctx, t('Press the button to make sex cells'), w / 2, h / 2, { size: 12, color: C.soft });
      return;
    }
    // the first 12 sex cells of the last batch, with their chromosomes: one copy or two of each kind
    const cols = 6, cw = w / cols, ch = h / 2;
    recent.forEach((cell, i) => {
      const cx = cw * (i % cols) + cw / 2, cy = ch * Math.floor(i / cols) + ch / 2, r = Math.min(cw, ch) * 0.42;
      const ok = balanced(cell);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ok ? C.good : C.bad;
      ctx.lineWidth = 2;
      ctx.stroke();
      const bw = Math.min(6, (r * 1.4) / (cell.length * 1.6)), x0 = cx - (cell.length * bw * 1.6) / 2;
      cell.forEach((n, j) => {
        for (let c = 0; c < n; c++) {
          ctx.fillStyle = c ? SKY : CORAL;
          ctx.fillRect(x0 + j * bw * 1.6, cy - r * 0.4 + c * r * 0.42, bw, r * 0.34);
        }
      });
    });
  };

  const chance = balancedChance(sets, kinds);
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('{n} sex cells shown from the last batch; {g} of {m} made so far are balanced', {
          n: formatNumber(recent.length),
          g: formatNumber(tally.good),
          m: formatNumber(tally.made),
        })}
      />
      <Choice
        label={t('Sets of chromosomes')}
        value={sets}
        onChange={(v) => {
          setSets(v);
          reset();
        }}
        options={[
          { value: 2, label: t('2 sets: wild banana') },
          { value: 3, label: t('3 sets: Cavendish') },
        ]}
      />
      <Range
        label={t('Kinds of chromosome')}
        value={kinds}
        min={1}
        max={KINDS}
        onChange={(v) => {
          setKinds(v);
          reset();
        }}
      />
      <Btn onClick={make}>{t('Make 1,000 sex cells')}</Btn>
      <Readouts
        items={[
          { label: t('Expected to be balanced'), value: chance === 1 ? t('every sex cell') : t('1 in {n}', { n: formatNumber(Math.round(1 / chance)) }), tone: 'accent' },
          { label: t('Balanced so far'), value: `${formatNumber(tally.good)} / ${formatNumber(tally.made)}`, tone: tally.made && tally.good === 0 ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: trios split two and one at random; real meiosis is messier.')}</p>
    </div>
  );
}
