import { useState } from 'react';
import { C, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Success rates in the 1986 kidney stone study (Charig et al.), which stay fixed: only the mix of cases changes. */
const RATE = { A: { small: 81 / 87, large: 192 / 263 }, B: { small: 234 / 270, large: 55 / 80 } };
/** In the study, 263 of A's 350 patients had large stones, and 80 of B's 350. */
const STUDY = { A: Math.round((263 / 350) * 100), B: Math.round((80 / 350) * 100) };

export const overall = (rates: { small: number; large: number }, largeShare: number) => rates.small * (1 - largeShare) + rates.large * largeShare;

const pct = (p: number) => `${formatNumber(Math.round(p * 100))}%`;

export default function SimpsonsParadox({ onDone }: LabProps) {
  const [la, setLa] = useState(STUDY.A);
  const [lb, setLb] = useState(STUDY.B);
  const a = overall(RATE.A, la / 100), b = overall(RATE.B, lb / 100);
  useGoal(a > b, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const rows: [string, number, number][] = [
      [t('Small stones'), RATE.A.small, RATE.B.small],
      [t('Large stones'), RATE.A.large, RATE.B.large],
      [t('All patients'), a, b],
    ];
    const L = 92, R = w - 44, rowH = (h - 16) / rows.length, x = (p: number) => L + ((p - 0.5) / 0.5) * (R - L);
    rows.forEach(([name, pa, pb], i) => {
      const y = 10 + i * rowH, bar = Math.min(13, rowH / 4);
      label(ctx, name, 8, y + rowH / 2 - 4, { size: 12, align: 'left', color: i === 2 ? C.ink : C.soft });
      for (const [k, p, color, dy] of [['A', pa, C.accent, 0], ['B', pb, C.cool, bar + 4]] as const) {
        ctx.fillStyle = color;
        ctx.fillRect(L, y + rowH / 2 - bar - 2 + dy, x(p) - L, bar);
        label(ctx, `${k} ${pct(p)}`, x(p) + 4, y + rowH / 2 - bar / 2 - 2 + dy, { size: 11, align: 'left', color });
      }
      if (i === 2) {
        const winner = pa > pb ? 'A' : 'B';
        label(ctx, t('{x} wins', { x: winner }), 8, y + rowH / 2 + 12, { size: 11, align: 'left', color: winner === 'A' ? C.accent : C.cool });
      }
    });
    label(ctx, '50%', L, h - 4, { size: 9.5, base: 'bottom' });
    label(ctx, '100%', R, h - 4, { size: 9.5, base: 'bottom' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Success rates: A {a}, B {b} overall', { a: pct(a), b: pct(b) })} />
      <Range label={t('A: large stones')} value={la} min={0} max={100} onChange={setLa} format={(v) => t('{v}% of cases', { v })} />
      <Range label={t('B: large stones')} value={lb} min={0} max={100} onChange={setLb} format={(v) => t('{v}% of cases', { v })} />
      <p className="lab__note">
        {la === STUDY.A && lb === STUDY.B ? t('This is the real study’s mix of cases.') : t('Real study: A {a}%, B {b}% large stones.', { a: STUDY.A, b: STUDY.B })}
      </p>
    </div>
  );
}
