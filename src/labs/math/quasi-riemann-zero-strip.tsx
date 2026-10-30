import { useState } from 'react';
import { C, Choice, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** If no zero of the zeta function has real part above θ, the count of primes up to x strays from its smooth estimate by at most about x^θ (times a logarithm, left out here). */
export const errorBound = (x: number, theta: number) => Math.pow(x, theta);
/** About how many primes there are up to x: x / ln x (the prime number theorem's simplest form). */
export const primesAbout = (x: number) => x / Math.log(x);
/** The bound claimed on 6 October 2026, the Lean-checked bound, and Riemann's line. */
export const THETA_NEW = 11 / 12;
export const THETA_LEAN = 7 / 8;
export const THETA_RH = 0.5;
/** The goal: a bound under 1% of the prime count up to a trillion. */
export const X_GOAL = 1e12;
export const goalMet = (theta: number) => errorBound(X_GOAL, theta) < 0.01 * primesAbout(X_GOAL);

const GOLD = '#f0c75e', RED = '#ff6f6f', GREEN = '#8fd8a8';
const short = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} ${t('billion')}` : n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} ${t('million')}` : formatNumber(Math.round(n)));

export default function QuasiRiemann({ onDone }: LabProps) {
  const [theta, setTheta] = useState(1);
  const [x, setX] = useState<number>(1e9);
  const bound = errorBound(x, theta), primes = primesAbout(x), share = bound / primes;
  useGoal(x === X_GOAL && goalMet(theta), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the strip, with θ as the right-hand wall for zeros and 1 − θ the left one; its top row holds the captions,
    // so the lines start below it
    const x0 = w * 0.1, x1 = w * 0.9, y0 = 6, y1 = y0 + Math.min(90, Math.max(28, h * 0.3)), yt = y0 + 18;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    const X = (re: number) => lerp(x0, x1, re);
    ctx.fillStyle = 'rgba(255,111,111,0.22)';
    ctx.fillRect(X(theta), y0, x1 - X(theta), y1 - y0);
    ctx.fillRect(x0, y0, X(1 - theta) - x0, y1 - y0);
    ctx.strokeStyle = GOLD;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(X(0.5), yt);
    ctx.lineTo(X(0.5), y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(theta), yt);
    ctx.lineTo(X(theta), y1);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    label(ctx, t('zeros only in the pale band'), x0 + 6, y0 + 9, { size: 10, align: 'left', color: C.soft });
    label(ctx, t('θ = {v}', { v: theta.toFixed(2) }), x1 - 4, y0 + 9, { size: 10, align: 'right', color: RED });
    label(ctx, '0', x0, y1 + 9, { size: 10, color: C.faint });
    label(ctx, '½', X(0.5), y1 + 9, { size: 10, color: GOLD });
    label(ctx, '1', x1, y1 + 9, { size: 10, color: C.faint });
    // two bars on a log scale along the bottom: the primes up to x, and the error bound, each with a caption row above
    const short_ = h < 125, bh = short_ ? 8 : 10, yB = h - (short_ ? 11 : 13), yA = yB - (short_ ? 26 : 30), off = short_ ? 11 : 13;
    const bx0 = x0, bx1 = w - 8;
    const B = (v: number) => lerp(bx0, bx1, Math.log10(Math.max(1, v)) / 12);
    const bar = (y: number, v: number, col: string) => {
      const end = B(v);
      ctx.fillStyle = col;
      ctx.fillRect(bx0, y - bh / 2, end - bx0, bh);
      // the value beside the bar, or inside its end when it reaches the edge
      if (end > w - 70) label(ctx, short(v), end - 4, y, { size: 10, align: 'right', color: '#050b1c' });
      else label(ctx, short(v), end + 6, y, { size: 10, align: 'left', color: C.ink });
    };
    label(ctx, t('primes up to x'), bx0, yA - off, { size: 10, align: 'left', color: C.soft });
    bar(yA, primes, C.soft);
    label(ctx, t('error bound x^θ'), bx0, yB - off, { size: 10, align: 'left', color: RED });
    label(ctx, t('log scale'), bx1, yB - off, { size: 9, align: 'right', color: C.faint });
    bar(yB, bound, goalMet(theta) && x === X_GOAL ? GREEN : RED);
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('With θ = {th} and x = {x}, the bound is {b} against about {p} primes', { th: theta.toFixed(2), x: short(x), b: short(bound), p: short(primes) })} />
      <Range label={t('θ: no zero has real part above')} value={theta} min={0.5} max={1} step={0.01} onChange={setTheta} format={(v) => v.toFixed(2)} />
      <Choice
        label={t('Count primes up to')}
        options={[
          { value: 1e6, label: t('a million') },
          { value: 1e9, label: t('a billion') },
          { value: 1e12, label: t('a trillion') },
        ]}
        value={x}
        onChange={setX}
      />
      <Readouts
        items={[
          { label: t('Bound as share of the count'), value: `${share >= 0.1 ? Math.round(share * 100) : (share * 100).toFixed(share >= 0.001 ? 1 : 3)}%`, tone: goalMet(theta) && x === X_GOAL ? 'good' : undefined },
          { label: t('11/12 · 7/8 · Riemann'), value: `${THETA_NEW.toFixed(2)} · ${THETA_LEAN.toFixed(2)} · ${THETA_RH.toFixed(2)}` },
        ]}
      />
      <p className="lab__note">{t('Simplified: the bound x^θ leaves out a logarithm and a constant, and the prime count is x ÷ ln x. The point: 11/12 narrows the strip, but only Riemann’s ½ makes the bound tiny.')}</p>
    </div>
  );
}
