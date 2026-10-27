import { useState } from 'react';
import { C, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The toy glacier runs from 2,000 to 3,600 m, in 100 m bands of equal area. */
export const BOTTOM = 2000, TOP = 3600, BANDS = 16;
/** Toy numbers: winter snow (m of water) grows with height; summer melt grows with the distance below the freezing level. */
const SNOW_LOW = 0.6, SNOW_RISE = 1.6, MELT_PER_M = 0.0028;
/** Once its snow is gone, bare ice melts this much faster, as it reflects less sunlight. */
export const ICE_FACTOR = 1.5;

/** The balance in metres of water of a band at height z, with `snow` times normal winter snow and the freezing level at `freeze` m. */
export function bandBalance(z: number, snow: number, freeze: number) {
  const f = (z - BOTTOM) / (TOP - BOTTOM);
  const s = snow * (SNOW_LOW + SNOW_RISE * f), melt = MELT_PER_M * Math.max(0, freeze - z);
  return s >= melt ? s - melt : -ICE_FACTOR * (melt - s);
}

/** Every band's balance, its middle height, and the glacier's average. */
export function glacier(snow: number, freeze: number) {
  const bands = Array.from({ length: BANDS }, (_, i) => {
    const z = BOTTOM + ((i + 0.5) * (TOP - BOTTOM)) / BANDS;
    return { z, b: bandBalance(z, snow, freeze) };
  });
  const mean = bands.reduce((s, x) => s + x.b, 0) / BANDS;
  // the break-even height: where the balance crosses zero (null if the whole glacier gains or loses)
  let even: number | null = null;
  for (let i = 1; i < BANDS; i++) {
    const a = bands[i - 1], b = bands[i];
    if (a.b < 0 && b.b >= 0) even = lerp(a.z, b.z, -a.b / (b.b - a.b));
  }
  const allLose = bands.every((x) => x.b < 0), allGain = bands.every((x) => x.b >= 0);
  return { bands, mean, even, allLose, allGain };
}

const GAIN = '#7cc6e0', LOSS = '#e2603f', ROCK = 'rgba(255,255,255,0.10)';

export default function GlacierBudget({ onDone }: LabProps) {
  const [snow, setSnow] = useState(75);
  const [freeze, setFreeze] = useState(4000);
  const g = glacier(snow / 100, freeze);
  useGoal(g.mean >= 0, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const Z0 = 1800, Z1 = 4500, Y = (z: number) => lerp(h - 14, 14, (z - Z0) / (Z1 - Z0));
    const X = (z: number) => lerp(w * 0.12, w * 0.9, (z - BOTTOM) / (TOP - BOTTOM));
    // the slope
    ctx.fillStyle = ROCK;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(X(Z0), Y(Z0));
    ctx.lineTo(X(Z1 - 300), Y(Z1 - 300));
    ctx.lineTo(w, Y(Z1 - 300));
    ctx.lineTo(w, h);
    ctx.fill();
    // bands of the glacier: blue where the year gains, red where it loses; leftover snow in white
    const step = (TOP - BOTTOM) / BANDS;
    g.bands.forEach(({ z, b }) => {
      const z0 = z - step / 2, z1 = z + step / 2, thick = 12;
      ctx.fillStyle = b >= 0 ? GAIN : LOSS;
      ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, Math.abs(b) / 3);
      ctx.beginPath();
      ctx.moveTo(X(z0), Y(z0));
      ctx.lineTo(X(z1), Y(z1));
      ctx.lineTo(X(z1), Y(z1) - thick);
      ctx.lineTo(X(z0), Y(z0) - thick);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (b > 0) {
        ctx.fillStyle = '#ffffff';
        const s = Math.min(10, b * 4);
        ctx.beginPath();
        ctx.moveTo(X(z0), Y(z0) - thick);
        ctx.lineTo(X(z1), Y(z1) - thick);
        ctx.lineTo(X(z1), Y(z1) - thick - s);
        ctx.lineTo(X(z0), Y(z0) - thick - s);
        ctx.fill();
      }
    });
    // the freezing level
    ctx.strokeStyle = '#ff8a7a';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(0, Y(freeze));
    ctx.lineTo(w, Y(freeze));
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, t('freezing level {z} m', { z: formatNumber(freeze) }), 6, Y(freeze) - 9, { size: 10.5, color: '#ff8a7a', align: 'left' });
    if (g.even !== null) {
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X(g.even) - 18, Y(g.even) - 6);
      ctx.lineTo(X(g.even) + 18, Y(g.even) - 6);
      ctx.stroke();
    }
  };

  const even = g.allLose ? t('above the top') : g.allGain ? t('below the tongue') : `${formatNumber(Math.round((g.even ?? 0) / 10) * 10)} m`;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A toy glacier with {s}% of normal winter snow and the summer freezing level at {z} m: average balance {b} m of water', { s: snow, z: freeze, b: formatNumber(Math.round(g.mean * 100) / 100) })} />
      <Range label={t('Winter snow')} value={snow} min={30} max={200} step={5} onChange={setSnow} format={(v) => `${v}%`} />
      <Range label={t('Summer freezing level')} value={freeze} min={2800} max={4400} step={100} onChange={setFreeze} format={(v) => `${formatNumber(v)} m`} />
      <Readouts
        items={[
          { label: t('Break-even line'), value: even, tone: g.allLose ? 'bad' : undefined },
          { label: t('Average glacier balance'), value: `${g.mean < 0 ? '−' : '+'}${formatNumber(Math.abs(Math.round(g.mean * 100) / 100))} m`, tone: g.mean >= 0 ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Toy model with made-up numbers: snow grows with height, melt with the distance below the freezing level, and bare ice melts 1.5 times as fast.')}</p>
    </div>
  );
}
