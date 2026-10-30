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
/** An error rate as "1 in n", kept short enough for a label when n runs into the billions. */
const oneIn = (e: number) => {
  if (e >= 0.01) return `${(e * 100).toFixed(1)}%`;
  const n = 1 / e;
  if (n >= 1e12) return t('under 1 in a trillion');
  if (n >= 1e9) return t('1 in {n} billion', { n: (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) });
  if (n >= 1e6) return t('1 in {n} million', { n: (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) });
  return t('1 in {n}', { n: formatNumber(Math.round(n)) });
};

export default function LogicalQubit({ onDone }: LabProps) {
  const [p, setP] = useState<number>(0.01);
  const [n, setN] = useState(3);
  const e = majorityError(p, n);
  useGoal(e < GOAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the copies: flipped ones in red, from a fixed sample so the picture stays still
    const r = rng(11 + n);
    const s = Math.min(26, (w - 20) / n, h * 0.22);
    const cy = 10 + s * 0.32;
    let flipped = 0;
    for (let i = 0; i < n; i++) {
      const bad = r() < p;
      if (bad) flipped++;
      ctx.fillStyle = bad ? RED : TEAL;
      ctx.beginPath();
      ctx.arc(w / 2 + (i - (n - 1) / 2) * s, cy, s * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    const vote = flipped > n / 2;
    label(ctx, t('{n} copies, {f} flipped → majority says {v}', { n, f: flipped, v: vote ? t('wrong') : t('right') }), w / 2, cy + s * 0.32 + 12, { size: 11, color: vote ? RED : C.soft });
    // a log scale of error rates along the bottom: a tick for one qubit, a dot for the code, and a legend row above it
    const x0 = 16, x1 = w - 16, yb = h - 26;
    const X = (v: number) => x0 + ((Math.log10(Math.max(1e-9, v)) + 9) / 9) * (x1 - x0);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x0, yb - 5, x1 - x0, 10);
    for (const [v, txt] of [[1e-9, t('1 in a billion')], [1e-6, t('1 in a million')], [1e-3, '0.1%'], [1, '100%']] as const) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(X(v) - 0.5, yb - 8, 1, 16);
      label(ctx, txt, X(v), yb + 14, { size: 9, align: v === 1e-9 ? 'left' : v === 1 ? 'right' : 'center', color: C.faint });
    }
    const col = e < GOAL ? TEAL : e <= p ? MAGENTA : RED;
    ctx.fillStyle = C.ink;
    ctx.fillRect(X(p) - 1, yb - 10, 2, 20);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(X(e), yb, 7, 0, Math.PI * 2);
    ctx.fill();
    const ly = yb - 20;
    ctx.fillStyle = C.ink;
    ctx.fillRect(x0, ly - 6, 2, 12);
    label(ctx, t('one qubit: {p}%', { p: (p * 100).toString() }), x0 + 8, ly, { size: 10, align: 'left', color: C.soft });
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x1 - 4, ly, 5, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('code: {e}', { e: oneIn(e) }), x1 - 14, ly, { size: 10, align: 'right', color: col });
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
