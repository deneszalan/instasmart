import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** St Peter's dome is about 42 m wide; the keyhole on the Aventine is about 2,976 m from it (OpenStreetMap). */
export const DOME = 42, KEYHOLE_DISTANCE = 2976;
/** The full Moon's mean width in the sky, in degrees. */
export const MOON = 0.52;
/** The view drawn through the keyhole, in degrees across (illustrative). */
const VIEW = 3;

/** The angle an object of width `size` fills at `distance` (same units), in degrees. */
export const angularSize = (size: number, distance: number) => (2 * Math.atan(size / 2 / distance) * 180) / Math.PI;

/** The distance at which an object of width `size` looks `angle` degrees wide. */
export const distanceFor = (size: number, angle: number) => size / 2 / Math.tan(((angle / 2) * Math.PI) / 180);

export default function KeyholeView({ onDone }: LabProps) {
  const [km, setKm] = useState(KEYHOLE_DISTANCE / 1000);
  const angle = angularSize(DOME, km * 1000);
  const moons = angle / MOON;
  useGoal(Math.abs(moons - 1) < 0.03, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.36, cy = h * 0.46, r = Math.min(w * 0.3, h * 0.4);
    const pxPerDeg = (r * 2) / VIEW;
    // the keyhole: a round opening above a slot
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, (118 * Math.PI) / 180, (62 * Math.PI) / 180 + Math.PI * 2);
    ctx.lineTo(cx + r * 0.62, h - 6);
    ctx.lineTo(cx - r * 0.62, h - 6);
    ctx.closePath();
    ctx.clip();
    const sky = ctx.createLinearGradient(0, cy - r, 0, cy + r * 0.3);
    sky.addColorStop(0, '#7b97c4');
    sky.addColorStop(1, '#f2b179');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // the full Moon, for comparison, up in the sky
    ctx.fillStyle = '#f4f1e4';
    ctx.beginPath();
    ctx.arc(cx + r * 0.45, cy - r * 0.55, (MOON / 2) * pxPerDeg, 0, Math.PI * 2);
    ctx.fill();
    // the dome on its drum, at its true angular size in this view
    const d = (angle / 2) * pxPerDeg, base = cy + r * 0.18;
    ctx.fillStyle = '#5f7372';
    ctx.fillRect(cx - d * 1.15, base - d * 0.7, d * 2.3, d * 0.7 + 2);
    ctx.fillStyle = '#93a7a6';
    ctx.beginPath();
    ctx.ellipse(cx, base - d * 0.7, d, d * 1.05, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // the hedges on either side, and the path
    ctx.fillStyle = '#2f5d3a';
    ctx.fillRect(0, 0, cx - r * 0.55, h);
    ctx.fillRect(cx + r * 0.55, 0, w, h);
    ctx.fillStyle = '#c8b48d';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, h);
    ctx.lineTo(cx - 3, base + 2);
    ctx.lineTo(cx + 3, base + 2);
    ctx.lineTo(cx + r * 0.5, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // labels outside the keyhole, with leader lines
    const lx = cx + r + 12;
    line(ctx, cx + r * 0.45 + (MOON / 2) * pxPerDeg + 2, cy - r * 0.55, lx - 4, cy - r * 0.55, C.faint, 1);
    label(ctx, t('the full Moon, to scale'), lx, cy - r * 0.55, { size: 10, align: 'left', color: C.ink });
    line(ctx, cx + d * 1.2, base - d * 0.6, lx - 4, base - d * 0.6, C.faint, 1);
    label(ctx, t('St Peter’s dome'), lx, base - d * 0.6, { size: 10, align: 'left', color: C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The dome of St Peter’s seen through a keyhole from {km} km, beside the full Moon', { km: formatNumber(km) })} />
      <Range label={t('Distance to the dome')} value={km} min={0.5} max={10} step={0.05} onChange={setKm} format={(v) => `${formatNumber(v)} km`} />
      <Readouts
        items={[
          { label: t('The dome looks'), value: `${formatNumber(Math.round(angle * 100) / 100)}°` },
          { label: t('Full Moons wide'), value: formatNumber(Math.round(moons * 100) / 100), tone: Math.abs(moons - 1) < 0.03 ? 'good' : 'accent' },
          { label: t('From the keyhole'), value: `${formatNumber(KEYHOLE_DISTANCE / 1000)} km` },
        ]}
      />
      <p className="lab__note">{t('The keyhole’s view is drawn 3° across; the Moon and the dome are drawn to the same scale. The dome is about 42 m wide.')}</p>
    </div>
  );
}
