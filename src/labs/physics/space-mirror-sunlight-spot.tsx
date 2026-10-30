import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** NASA's Sun fact sheet: the Sun's disc is 1,919 seconds of arc wide seen from Earth, 0.533°. */
export const SUN_DEG = 1919 / 3600;
/** The full Moon (magnitude -12.74) is 10^(0.4 × 14) ≈ 400,000 times fainter than the Sun (-26.74). */
export const MOON_RATIO = 10 ** (0.4 * (26.74 - 12.74));
const SUN = (SUN_DEG * Math.PI) / 180;

/** Kilometres from the satellite to its patch, `height` km up and `slant` degrees from overhead (flat ground). */
export const distanceKm = (height: number, slant: number) => height / Math.cos((slant * Math.PI) / 180);

/** The lit patch, an image of the Sun: [across, along] in km. Seen at a slant it stretches along the ground. */
export const patchKm = (height: number, slant = 0): [number, number] => {
  const across = distanceKm(height, slant) * SUN;
  return [across, across / Math.cos((slant * Math.PI) / 180)];
};

/**
 * The share of full sunlight on the patch, at best (no losses): the mirror, seen from the ground, shines like a bit
 * of the Sun's surface, so this is the share of the Sun's disc it covers, times the ground's tilt to the beam.
 */
export const share = (mirrorM: number, height: number, slant = 0) =>
  (mirrorM / 1000 / (distanceKm(height, slant) * SUN)) ** 2 * Math.cos((slant * Math.PI) / 180);

/** The same, in full Moons. */
export const fullMoons = (mirrorM: number, height: number, slant = 0) => share(mirrorM, height, slant) * MOON_RATIO;

/** The goal: a full Moon's worth of light or more from a mirror no wider than 8 m. */
export const SMALL_MIRROR = 8;
export const goalMet = (mirrorM: number, height: number, slant: number) => mirrorM <= SMALL_MIRROR && fullMoons(mirrorM, height, slant) >= 1;

const SUNC = '#ffd37a', MIRROR = '#cfe3ff', TEAL = '#59d3c7', MOONC = '#dfe6f0';

export default function SpaceMirrorSpot({ onDone }: LabProps) {
  const [mirror, setMirror] = useState(18);
  const [height, setHeight] = useState(645);
  const [slant, setSlant] = useState(0);
  const [across, along] = patchKm(height, slant), moons = fullMoons(mirror, height, slant);
  useGoal(goalMet(mirror, height, slant), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: a side view, heights to scale up to 1,000 km, the beam's spread hugely exaggerated
    const gx = w * 0.32, ground = h - 22, top = 16, Y = (km: number) => ground - (km / 1000) * (ground - top);
    const sx = gx + Math.tan((slant * Math.PI) / 180) * (ground - Y(height)) * 0.5, sy = Y(height);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, ground, w * 0.62, h - ground);
    const spread = 0.14 + along / 60;
    const grad = ctx.createLinearGradient(sx, sy, gx, ground);
    grad.addColorStop(0, 'rgba(255,241,196,0.7)');
    grad.addColorStop(1, 'rgba(255,211,122,0.2)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(gx + (ground - sy) * spread, ground);
    ctx.lineTo(gx - (ground - sy) * spread, ground);
    ctx.closePath();
    ctx.fill();
    line(ctx, sx - 8 - mirror / 8, sy, sx + 8 + mirror / 8, sy, MIRROR, 3);
    label(ctx, t('{h} km up', { h: formatNumber(height) }), sx, sy - 9, { size: 10, color: C.soft });
    label(ctx, t('patch {a} × {b} km', { a: formatNumber(Math.round(across * 10) / 10), b: formatNumber(Math.round(along * 10) / 10) }), gx, h - 9, { size: 10, color: SUNC });
    // right: brightness on a log scale, from a thousandth of a full Moon to the noon Sun
    const bx = w * 0.72, y0 = h - 22, y1 = 18, lo = -3, hi = Math.log10(MOON_RATIO);
    const B = (m: number) => y0 - ((Math.log10(Math.max(m, 10 ** lo)) - lo) / (hi - lo)) * (y0 - y1);
    line(ctx, bx, y0, bx, y1, C.line, 6);
    const tick = (m: number, s: string, color: string) => {
      line(ctx, bx - 8, B(m), bx + 8, B(m), color, 2);
      label(ctx, s, bx - 12, B(m), { size: 9.5, color, align: 'right' });
    };
    tick(MOON_RATIO, t('the noon Sun'), SUNC);
    tick(1, t('a full Moon'), MOONC);
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(bx, B(moons), 6, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('the lit patch'), bx + 12, B(moons), { size: 10, color: TEAL, align: 'left' });
  };

  const many = 1 / share(mirror, height, slant);
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('A {m} m mirror {h} km up, {s}° from overhead, lights a patch {a} by {b} km like {f} full Moons', {
          m: formatNumber(mirror),
          h: formatNumber(height),
          s: formatNumber(slant),
          a: formatNumber(Math.round(across * 10) / 10),
          b: formatNumber(Math.round(along * 10) / 10),
          f: formatNumber(Math.round(moons * 100) / 100),
        })}
      />
      <Range label={t('Mirror width')} value={mirror} min={1} max={60} step={1} onChange={setMirror} format={(v) => `${formatNumber(v)} m`} />
      <Range label={t('Height of the orbit')} value={height} min={300} max={1000} step={5} onChange={setHeight} format={(v) => `${formatNumber(v)} km`} />
      <Range label={t('Away from overhead')} value={slant} min={0} max={60} step={5} onChange={setSlant} format={(v) => `${formatNumber(v)}°`} />
      <Readouts
        items={[
          { label: t('Brightness of the patch'), value: t('{f} full Moons', { f: formatNumber(Math.round(moons * 100) / 100) }), tone: goalMet(mirror, height, slant) ? 'good' : 'accent' },
          { label: t('Mirrors for noon sunlight'), value: formatNumber(Math.round(many / 100) * 100) },
        ]}
      />
      <p className="lab__note">{t('Simplified: flat ground, no losses; the best any mirror shape can do.')}</p>
    </div>
  );
}
