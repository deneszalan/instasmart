import { useState } from 'react';
import { C, Choice, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** C(n, k). */
export function choose(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}
/**
 * A repetition code against bit flips: `n` copies, each flipped with probability `p`, read by majority vote.
 * The logical error is the chance that more than half the copies flip.
 */
export function majorityError(p: number, n: number): number {
  let e = 0;
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) e += choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  return e;
}
export const GOAL = 1e-6;
const PRESETS = [0.001, 0.005, 0.01, 0.05, 0.2, 0.5, 0.6] as const;

const TEAL = '#5ef2d2', MAGENTA = '#ff6bd6', RED = '#ff5c5c';
const oneIn = (e: number) => (e >= 0.01 ? `${(e * 100).toFixed(1)}%` : t('1 in {n}', { n: formatNumber(Math.round(1 / e)) }));

export default function LogicalQubit({ onDone }: LabProps) {
  const [p, setP] = useState<number>(0.01);
  const [n, setN] = useState(3);
  const e = majorityError(p, n);
  useGoal(e < GOAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the copies: flipped ones in red, from a fixed sample so the picture stays still
    const r = rng(11 + n);
    const s = Math.min(26, (w - 20) / n);
    let flipped = 0;
    for (let i = 0; i < n; i++) {
      const bad = r() < p;
      if (bad) flipped++;
      ctx.fillStyle = bad ? RED : TEAL;
      ctx.beginPath();
      ctx.arc(w / 2 + (i - (n - 1) / 2) * s, h * 0.28, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    const vote = flipped > n / 2;
    label(ctx, t('{n} copies, {f} flipped → majority says {v}', { n, f: flipped, v: vote ? t('wrong') : t('right') }), w / 2, h * 0.28 + s * 0.32 + 16, { size: 11, color: vote ? RED : C.soft });
    // log bar of the logical error against the physical one
    const x0 = 24, x1 = w - 10, y = h * 0.74;
    const X = (v: number) => x0 + ((Math.log10(Math.max(1e-9, v)) + 9) / 9) * (x1 - x0);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x0, y - 6, x1 - x0, 12);
    for (const v of [1e-9, 1e-6, 1e-3, 1]) label(ctx, v === 1 ? '100%' : v === 1e-3 ? '0.1%' : v === 1e-6 ? t('1 in a million') : '', X(v), y + 22, { size: 9, color: C.faint });
    ctx.fillStyle = C.soft;
    ctx.fillRect(X(p) - 1, y - 18, 2, 24);
    label(ctx, t('one qubit'), X(p), y - 26, { size: 10, color: C.soft });
    ctx.fillStyle = e < GOAL ? TEAL : e <= p ? MAGENTA : RED;
    ctx.beginPath();
    ctx.arc(X(e), y, 8, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('code: {e}', { e: oneIn(e) }), X(e), y + 40, { size: 11, color: e < GOAL ? TEAL : e <= p ? MAGENTA : RED });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} copies each wrong {p}% of the time: the vote is wrong {e} of the time', { n, p: (p * 100).toString(), e: oneIn(e) })} />
      <Choice label={t('Physical error per step')} options={PRESETS.map((v) => ({ value: v, label: `${v * 100}%` }))} value={p} onChange={setP} />
      <Range label={t('Copies (odd)')} value={n} min={1} max={15} step={2} onChange={setN} />
      <Readouts
        items={[
          { label: t('Logical error'), value: oneIn(e), tone: e < GOAL ? 'good' : e > p ? 'bad' : undefined },
          { label: t('Versus one qubit'), value: e <= p ? t('better') : t('worse'), tone: e <= p ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: a repetition code against bit flips, read by majority vote. Above 50% error, more copies make it worse: that is a threshold. Quantinuum’s colour code also catches phase errors and never reads the data.')}</p>
    </div>
  );
}
