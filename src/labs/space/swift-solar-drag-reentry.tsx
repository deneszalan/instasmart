import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber, withUnit } from '../../lib/format';

/** Earth's GM (km³/s²) and mean radius (km), NASA Earth fact sheet. */
export const MU = 398600, R_EARTH = 6371;
/** Swift: launched to about 600 km in 2004 (NASA fact sheet); 275 km on 20 October 2026, when its mission ended (NASA). */
export const H_START = 600, H_END = 275;

/** Speed of a circular orbit `h` km up, in km/s: √(GM/r). */
export const speedAt = (h: number) => Math.sqrt(MU / (R_EARTH + h));
/** Time for one circular orbit `h` km up, in minutes. */
export const periodAt = (h: number) => (2 * Math.PI * Math.sqrt((R_EARTH + h) ** 3 / MU)) / 60;

/**
 * Height after the air has braked a satellite by `brake` m/s in all, starting from a circular orbit `h0` km up.
 * In a slow spiral the orbit stays circular, its energy is −v²/2, and the drag's loss of energy, −v·dv, means
 * the speed rises by exactly as much as the drag has braked it: v = v₀ + brake.
 */
export function heightAfter(brake: number, h0 = H_START): number {
  const v = speedAt(h0) + brake / 1000;
  return MU / (v * v) - R_EARTH;
}

const GOLD = '#ff9f43', ROSE = '#ff5d8f', AIR = '#4fd1e8';

export default function SwiftDrag({ onDone }: LabProps) {
  const [brake, setBrake] = useState(0);
  const h = heightAfter(brake), v = speedAt(h);
  const down = h <= H_END;
  useGoal(down, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h: H }: { w: number; h: number }) => {
    // left: Earth and the orbit seen from above, heights exaggerated sevenfold
    const R = Math.min(w * 0.15, H * 0.26), cx = w * 0.27, cy = H / 2, k = (R / R_EARTH) * 7;
    const glow = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 300 * k);
    glow.addColorStop(0, 'rgba(79,209,232,0.45)');
    glow.addColorStop(1, 'rgba(79,209,232,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 300 * k, 0, Math.PI * 2);
    ctx.fill();
    dot(ctx, cx, cy, R, '#1f5f9e');
    ctx.strokeStyle = C.faint;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R + H_START * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = down ? C.good : GOLD;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R + h * k, 0, Math.PI * 2);
    ctx.stroke();
    dot(ctx, cx, cy - R - h * k, 5, '#ffffff');
    label(ctx, t('heights exaggerated'), 8, H - 8, { size: 9.5, align: 'left', color: C.faint });

    // right: the braking and the speed gained, side by side
    const x0 = w * 0.56, x1 = w - 12, top = 18, bottom = H - 26, max = 260;
    const bar = (x: number, value: number, color: string, name: string, shown: string) => {
      const hh = ((bottom - top) * Math.min(value, max)) / max;
      ctx.fillStyle = color;
      ctx.fillRect(x, bottom - hh, (x1 - x0) * 0.36, hh);
      label(ctx, shown, x + (x1 - x0) * 0.18, bottom - hh - 9, { size: 11, color });
      label(ctx, name, x + (x1 - x0) * 0.18, bottom + 12, { size: 9.5, color: C.soft });
    };
    line(ctx, x0 - 4, bottom, x1, bottom, C.line, 1);
    bar(x0, brake, ROSE, t('air braking'), withUnit(brake, 'm/s'));
    bar(x0 + (x1 - x0) * 0.52, (v - speedAt(H_START)) * 1000, AIR, t('speed gain'), withUnit(Math.round((v - speedAt(H_START)) * 1000), 'm/s'));
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('After {b} m/s of braking by the air, the orbit is {h} km up and the speed is {v} km/s', { b: formatNumber(brake), h: formatNumber(Math.round(h)), v: formatNumber(Math.round(v * 100) / 100) })} />
      <Range label={t('Braking by the air so far')} value={brake} min={0} max={250} step={1} onChange={setBrake} format={(b) => withUnit(b, 'm/s')} />
      <Readouts
        items={[
          { label: t('Height above Earth'), value: withUnit(Math.round(h), 'km'), tone: down ? 'good' : undefined },
          { label: t('Orbital speed'), value: withUnit(Math.round(v * 100) / 100, 'km/s'), tone: 'accent' },
          { label: t('Time for one orbit'), value: t('{n} min', { n: formatNumber(Math.round(periodAt(h) * 10) / 10) }) },
        ]}
      />
      <p className="lab__note">{t('Simplified: a circular orbit that shrinks slowly, from Swift’s 600 km. How dense the air is, which the Sun changes, only sets how fast the braking adds up.')}</p>
    </div>
  );
}
