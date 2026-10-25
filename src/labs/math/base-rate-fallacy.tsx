import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** How rare the target is, as "1 in N", on a log slider. */
const RARITY = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

/** Chance that someone who sets off the alarm really is a target (the positive predictive value). */
export function ppv(prevalence: number, hit: number, falseAlarm: number): number {
  const real = prevalence * hit, wrong = (1 - prevalence) * falseAlarm;
  return real / (real + wrong);
}

const pct = (p: number) => `${formatNumber(p < 0.01 ? Math.round(p * 10000) / 100 : p < 0.1 ? Math.round(p * 1000) / 10 : Math.round(p * 100))}%`;

export default function BaseRate({ onDone }: LabProps) {
  const [rare, setRare] = useState(9);
  const [hit, setHit] = useState(99);
  const [fa, setFa] = useState(1);
  const n = RARITY[rare], prev = 1 / n, p = ppv(prev, hit / 100, fa / 100);
  useGoal(p > 0.5, onDone);

  // Per 100 alarms, how many are real: a 10 × 10 grid.
  const real100 = Math.round(p * 100);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cell = Math.min((w - 20) / 10, (h - 40) / 10), x0 = (w - cell * 10) / 2, y0 = 26;
    label(ctx, t('Out of 100 alarms'), w / 2, 12, { size: 12 });
    for (let i = 0; i < 100; i++) {
      const cx = x0 + (i % 10) * cell + cell / 2, cy = y0 + Math.floor(i / 10) * cell + cell / 2;
      ctx.fillStyle = i < real100 ? C.accent : C.faint;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }
    if (real100 === 0 && p > 0) label(ctx, t('(fewer than 1)'), w / 2, y0 + cell * 10 + 8, { size: 11 });
  };

  // Natural frequencies in a city of a million.
  const targets = 1e6 * prev, caught = targets * (hit / 100), flagged = (1e6 - targets) * (fa / 100);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} of 100 alarms are real', { n: real100 })} />
      <Range label={t('Targets')} value={rare} min={0} max={RARITY.length - 1} onChange={setRare} format={(i) => t('1 in {n}', { n: formatNumber(RARITY[i]) })} />
      <Range label={t('Caught')} value={hit} min={50} max={100} onChange={setHit} format={(v) => `${v}%`} />
      <Range label={t('False alarms')} value={fa} min={0.1} max={20} step={0.1} onChange={setFa} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Real alarms per million'), value: formatNumber(Math.round(caught)) },
          { label: t('False alarms per million'), value: formatNumber(Math.round(flagged)) },
          { label: t('Alarm is right'), value: pct(p), tone: p > 0.5 ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
