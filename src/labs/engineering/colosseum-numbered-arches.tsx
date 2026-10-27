import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Colosseum had 80 arches at ground level; the 76 between the four axial ones were numbered for the public. */
export const ARCHES = 80;
export const PUBLIC_ARCHES = 76;
const PER_QUARTER = PUBLIC_ARCHES / 4; // 19 between each pair of axial arches

/**
 * Minutes until the busiest arch has let its whole queue through. The open arches are shared equally between the
 * four quarters of the building; `busiest` is the share of the crowd that heads for one quarter (0.25 is an even
 * spread, as numbered tokens make it), spread evenly over that quarter's open arches. Every open arch passes
 * `perSecond` people a second. A model, not a measurement.
 */
export function minutesToEmpty(people: number, open: number, busiest: number, perSecond: number) {
  const perQuarter = open / 4;
  const atBusiestArch = (busiest * people) / perQuarter;
  return atBusiestArch / perSecond / 60;
}

/** People queueing at each open arch of the busiest quarter. */
export const busiestQueue = (people: number, open: number, busiest: number) => (busiest * people) / (open / 4);

/** Which public arches (0–75, quarter by quarter) are open when `open` of them are, spread evenly in each quarter. */
export function openArches(open: number): Set<number> {
  const k = open / 4, out = new Set<number>();
  for (let q = 0; q < 4; q++) for (let i = 0; i < k; i++) out.add(q * PER_QUARTER + Math.floor(((i + 0.5) * PER_QUARTER) / k));
  return out;
}

const GOAL_MINUTES = 5;

export default function ColosseumArches({ onDone }: LabProps) {
  const [people, setPeople] = useState(50000);
  const [open, setOpen] = useState(4);
  const [busiest, setBusiest] = useState(0.25);
  const [rate, setRate] = useState(3);
  const minutes = minutesToEmpty(people, open, busiest, rate);
  useGoal(people === 50000 && minutes < GOAL_MINUTES, onDone);

  const lit = openArches(open);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the 76 public arches unrolled into a row, quarter by quarter, with each open arch's queue as a bar to scale
    const L = 10, R = w - 10, base = h - 12, top = 24, colW = (R - L) / PUBLIC_ARCHES, FULL = 12500;
    const queue = busiestQueue(people, open, busiest), other = (4 * (1 - busiest) * people) / (3 * open);
    ctx.fillStyle = 'rgba(253,224,71,0.07)';
    ctx.fillRect(L, top, colW * PER_QUARTER, base - top);
    for (let q = 0; q <= 4; q++) {
      const x = L + q * PER_QUARTER * colW;
      line(ctx, x, top - 4, x, base, C.line, 1);
      dot(ctx, x, base + 5, 2.5, 'rgba(253,224,71,0.6)'); // an axial arch, not numbered
    }
    for (let p = 0; p < PUBLIC_ARCHES; p++) {
      const x = L + (p + 0.5) * colW;
      if (!lit.has(p)) { dot(ctx, x, base, 1.2, C.faint); continue; }
      const q = p < PER_QUARTER ? queue : other;
      const hgt = Math.min(1, q / FULL) * (base - top);
      ctx.fillStyle = q > FULL ? C.bad : C.accent;
      ctx.fillRect(x - Math.max(1, colW * 0.35), base - hgt, Math.max(2, colW * 0.7), hgt);
    }
    line(ctx, L, base, R, base, C.soft, 1);
    label(ctx, t('busiest quarter'), L + (PER_QUARTER * colW) / 2, 11, { size: 10, color: C.soft });
    label(ctx, t('{n} open arches', { n: open }), R, 11, { size: 10, align: 'right', color: C.soft });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Spectators')}
        value={people}
        onChange={setPeople}
        options={[
          { value: 50000, label: t('50,000: modern estimate') },
          { value: 87000, label: t('87,000: list of AD 354') },
        ]}
      />
      <Stage draw={draw} label={t('The Colosseum’s plan with queues at {n} open arches', { n: open })} />
      <Range label={t('Arches in use')} value={open} min={4} max={PUBLIC_ARCHES} step={4} onChange={(v) => setOpen(Math.round(v))} format={(v) => formatNumber(v)} />
      <Range
        label={t('Crowd heading for the busiest quarter')}
        value={busiest}
        min={0.25}
        max={1}
        step={0.05}
        onChange={setBusiest}
        format={(v) => `${formatNumber(Math.round(v * 100))}%`}
      />
      <Range label={t('People through each arch a second')} value={rate} min={1} max={5} step={0.5} onChange={setRate} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Queue at the busiest arch'), value: formatNumber(Math.round(busiestQueue(people, open, busiest))) },
          { label: t('Time to empty'), value: t('{n} min', { n: formatNumber(Math.round(minutes * 10) / 10) }), tone: minutes < GOAL_MINUTES ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Model: every open arch and its stairs pass the same number of people a second, and nobody switches arch. 25% is an even spread.')}</p>
    </div>
  );
}
