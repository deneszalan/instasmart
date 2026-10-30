import { useState } from 'react';
import { Btn, C, label, line, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The study truncated sightings at 50 m from the line. */
export const TRUNC = 50;
/** Tortoises really there, in this made-up strip of atoll. */
export const TRUE_N = 120;

/** Half-normal detection: the chance of seeing a tortoise d metres from the line (the shape the study used). */
export const detect = (d: number, sigma: number) => Math.exp(-(d * d) / (2 * sigma * sigma));
/** Effective strip half-width: the area under the detection curve from 0 to 50 m. */
export function stripWidth(sigma: number): number {
  const n = 400;
  let s = 0;
  for (let i = 0; i < n; i++) s += detect(((i + 0.5) / n) * TRUNC, sigma);
  return (s / n) * TRUNC;
}
export interface Tortoise {
  d: number;
  x: number;
  side: number;
  seen: boolean;
}
/** One survey: tortoises spread evenly within 50 m of a line, each seen by chance. */
export function walkLine(sigma: number, seed: number): Tortoise[] {
  const r = rng(seed);
  return Array.from({ length: TRUE_N }, () => {
    const d = r() * TRUNC, x = r(), side = r() < 0.5 ? -1 : 1;
    return { d, x, side, seen: r() < detect(d, sigma) };
  });
}
/** The corrected count: every sighting stands for 50 m ÷ the effective strip width of tortoises. */
export const corrected = (seen: number, sigma: number) => (seen * TRUNC) / stripWidth(sigma);

const SHELL = '#8a7550', LINE = '#e06a4f', CURVE = '#7cc0dc';

export default function TortoiseDistanceSampling({ onDone }: LabProps) {
  const [sigma, setSigma] = useState(20);
  const [seed, setSeed] = useState(1);
  const pts = walkLine(sigma, seed);
  const seen = pts.filter((p) => p.seen).length, est = corrected(seen, sigma);
  const close = Math.abs(est - TRUE_N) <= TRUE_N * 0.25;
  useGoal(seen < TRUE_N / 2 && close, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the band either side of the line
    const top = 8, fh = h - 30, ly = top + fh / 2, px = fh / 2 / TRUNC;
    line(ctx, 10, ly, w - 10, ly, LINE, 3, [8, 6]);
    line(ctx, 10, top, w - 10, top, C.line, 1, [4, 4]);
    line(ctx, 10, top + fh, w - 10, top + fh, C.line, 1, [4, 4]);
    for (const p of pts) {
      const x = 14 + p.x * (w - 28), y = ly + p.side * p.d * px;
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 3.6, 0, 0, Math.PI * 2);
      if (p.seen) {
        ctx.fillStyle = SHELL;
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    // the effective strip: where you would see the same number if you saw every tortoise
    const mu = stripWidth(sigma) * px;
    ctx.fillStyle = 'rgba(124,192,220,0.16)';
    ctx.fillRect(10, ly - mu, w - 20, 2 * mu);
    line(ctx, 10, ly - mu, w - 10, ly - mu, CURVE, 1.5, [4, 3]);
    line(ctx, 10, ly + mu, w - 10, ly + mu, CURVE, 1.5, [4, 3]);
    label(ctx, t('effective strip: {m} m each side', { m: Math.round(stripWidth(sigma)) }), w - 12, h - 10, { size: 11, color: CURVE, align: 'right' });
    label(ctx, t('band: 50 m each side'), 12, h - 10, { size: 11, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{s} of {n} tortoises seen; corrected estimate {e}', { s: seen, n: TRUE_N, e: Math.round(est) })} />
      <Range label={t('How far you can see into the scrub (σ)')} value={sigma} min={4} max={30} step={1} onChange={setSigma} format={(v) => `${v} m`} />
      <Btn onClick={() => setSeed((s) => s + 1)} ghost>
        {t('Walk the line again')}
      </Btn>
      <Readouts
        items={[
          { label: t('Tortoises seen'), value: seen, tone: seen < TRUE_N / 2 ? 'bad' : undefined },
          { label: t('Corrected estimate'), value: Math.round(est), tone: close ? 'good' : 'accent' },
          { label: t('Really there'), value: TRUE_N },
        ]}
      />
      <p className="lab__note">{t('Simplified: a made-up strip of 120 tortoises, with the right curve already known. The study had to fit its curves from the sightings.')}</p>
    </div>
  );
}
