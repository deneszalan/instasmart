import { useState } from 'react';
import { C, clamp, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A normal year along the equatorial Pacific (NOAA PMEL): the sea about 0.5 m higher and 8 °C warmer in the west. */
export const NORMAL_SLOPE = 0.5, NORMAL_WARMER_WEST = 8;
/** In September 2026 NOAA found parts of the eastern equatorial Pacific more than 4 °C warmer than normal. */
export const EAST_2026 = 4;

/** Toy model: with the trade winds at `wind` times their normal strength, the slope and the contrast shrink in step. */
export function pacific(wind: number) {
  return {
    slope: NORMAL_SLOPE * wind,
    contrast: NORMAL_WARMER_WEST * wind,
    /** How much warmer than normal the eastern surface is: it ends up closer to the west's temperature. */
    eastAnomaly: NORMAL_WARMER_WEST * (1 - wind),
    /** Where the warmest water, and the rain, sit: 0 in the far west, 1 in the far east. */
    rainAt: clamp(0.15 + 0.55 * (1 - wind), 0.05, 0.8),
  };
}

const WARM = '#ff7b54', COLD = '#4cc9f0', LAND = '#3d5a3c';

export default function ElNino({ onDone }: LabProps) {
  const [wind, setWind] = useState(100);
  const w = wind / 100, p = pacific(w);
  useGoal(p.eastAnomaly >= EAST_2026, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w: cw, h }: { w: number; h: number }) => {
    const L = 26, R = cw - 26, surf = h * 0.42, deep = h - 16;
    const tilt = (h * 0.07 * p.slope) / NORMAL_SLOPE; // exaggerated
    const sy = (x: number) => surf + tilt * ((x - L) / (R - L) - 0.5);
    // thermocline: deep in the west and shallow in the east when the winds blow, flatter when they don't
    const ty = (x: number) => { const f = (x - L) / (R - L); return lerp(surf + h * 0.2, surf + h * 0.2, f) + (h * 0.14) * w * (0.5 - f); };
    ctx.fillStyle = '#05223a';
    ctx.fillRect(L, surf - h * 0.1, R - L, deep - surf + h * 0.1);
    for (let x = L; x < R; x += 3) {
      const f = (x - L) / (R - L), heat = clamp(1 - f * (p.contrast / NORMAL_WARMER_WEST) * 1.1, 0, 1);
      const g = ctx.createLinearGradient(0, sy(x), 0, ty(x));
      g.addColorStop(0, heat > 0.5 ? WARM : COLD);
      g.addColorStop(1, '#0a3a5a');
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(heat - 0.5) * 2;
      ctx.fillStyle = g;
      ctx.fillRect(x, sy(x), 3.5, ty(x) - sy(x));
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = COLD;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let x = L; x <= R; x += 4) ctx[x === L ? 'moveTo' : 'lineTo'](x, ty(x));
    ctx.stroke();
    ctx.setLineDash([]);
    // the sea's surface and the land at either end
    ctx.fillStyle = 'rgba(13,42,68,1)';
    ctx.beginPath();
    ctx.moveTo(L, 0);
    for (let x = L; x <= R; x += 4) ctx.lineTo(x, sy(x));
    ctx.lineTo(R, 0);
    ctx.fill();
    ctx.fillStyle = LAND;
    ctx.fillRect(0, surf - h * 0.12, L, deep);
    ctx.fillRect(R, surf - h * 0.16, cw - R, deep);
    label(ctx, t('Asia'), L + 4, surf - h * 0.17, { size: 10, align: 'left', color: C.soft });
    label(ctx, t('South America'), R - 4, surf - h * 0.21, { size: 10, align: 'right', color: C.soft });
    // trade winds: arrows towards the west, shorter as they weaken
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const x = L + 40 + i * ((R - L - 60) / 4), y = h * 0.07 + (i % 2) * 8, len = 30 * Math.min(1.5, w);
      if (len < 3) continue;
      ctx.beginPath();
      ctx.moveTo(x + len, y);
      ctx.lineTo(x, y);
      ctx.moveTo(x + 6, y - 4);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 6, y + 4);
      ctx.stroke();
    }
    // the rain cloud over the warmest water
    const rx = lerp(L, R, p.rainAt), ry = h * 0.24;
    ctx.fillStyle = '#c9d6e2';
    for (const [dx, dy, r] of [[-9, 0, 7], [0, -4, 9], [9, 0, 7]]) {
      ctx.beginPath();
      ctx.arc(rx + dx, ry + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    label(ctx, t('rain'), rx, ry + 15, { size: 9.5, color: '#a9c8ea' });
  };

  const state = w < 0.95 ? t('El Niño-like') : w > 1.05 ? t('La Niña-like') : t('Normal');
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The equatorial Pacific with the trade winds at {p} of normal strength', { p: `${wind}%` })} />
      <Range label={t('Trade winds')} value={wind} min={0} max={150} step={5} onChange={setWind} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('Sea higher in the west by'), value: `${formatNumber(Math.round(p.slope * 100) / 100)} m` },
          { label: t('East, against normal'), value: `${p.eastAnomaly > 0 ? '+' : p.eastAnomaly < 0 ? '−' : ''}${formatNumber(Math.abs(Math.round(p.eastAnomaly * 10) / 10))} °C`, tone: p.eastAnomaly >= EAST_2026 ? 'bad' : undefined },
          { label: t('The Pacific'), value: state },
        ]}
      />
      <p className="lab__note">{t('Toy model: NOAA’s normal half-metre slope and 8 °C contrast shrink in step with the winds. Depths and slope are exaggerated.')}</p>
    </div>
  );
}
