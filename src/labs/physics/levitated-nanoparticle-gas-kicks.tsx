import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Boltzmann's constant (J/K), the atomic mass unit (kg), the speed of light (m/s) and the electron charge (C). */
const KB = 1.380649e-23, U = 1.66053906660e-27, CL = 2.99792458e8, QE = 1.602176634e-19;
/** The gas temperature used in the 2026 Yale experiment: 293 K, 20 °C. */
export const T_GAS = 293;
/** The glass bead: a silica sphere of radius 50 nm and mass about 1 femtogram (10⁻¹⁸ kg). */
export const BEAD_KG = 1e-18;
/** The three gases let into the chamber, in atomic mass units (Tseng et al. 2026). */
export const MASS_U = { kr: 83.798, xe: 131.293, sf6: 146.055 } as const;
export type Gas = keyof typeof MASS_U;
/** Kicks below about 200 keV/c were lost in the noise of the measurement. */
export const THRESHOLD = 200;

/** Momentum in kg·m/s as keV/c, the unit particle physicists use. */
export const toKeV = (q: number) => (q * CL) / QE / 1000;
/** The mean speed in m/s of gas particles of `massU` atomic mass units at temperature `T`: √(8kT/πm). */
export const meanSpeed = (massU: number, T = T_GAS) => Math.sqrt((8 * KB * T) / (Math.PI * massU * U));
/**
 * The kick in keV/c from a particle of `massU` arriving head-on at `speed` m/s. Bouncing straight back it
 * reverses its momentum, 2mv; sticking for a moment and leaving in a random direction it gives mv on average.
 */
export const kick = (massU: number, speed: number, bounce: boolean) => toKeV((bounce ? 2 : 1) * massU * U * speed);
/** How much a kick of `keV` keV/c changes the bead's speed, in mm/s. */
export const beadSpeedChange = (keV: number) => ((keV * 1000 * QE) / CL / BEAD_KG) * 1000;
/** The slowest head-on, bouncing particle of `massU` whose kick reaches `q` keV/c, in m/s. */
export const speedFor = (q: number, massU: number) => (q * 1000 * QE) / CL / (2 * massU * U);

const PINK = 'rgba(255,77,139,0.22)', TEAL = '#46e0c5', AMBER = '#ffcf5c', GLASS = '#dff1ff';

export default function GasKicks({ onDone }: LabProps) {
  const [gas, setGas] = useState<Gas>('kr');
  const [speed, setSpeed] = useState(150);
  const [bounce, setBounce] = useState(true);
  const q = kick(MASS_U[gas], speed, bounce);
  const seen = q >= THRESHOLD;
  useGoal(gas === 'xe' && bounce && q >= THRESHOLD && q < THRESHOLD + 5, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cy = h * 0.38, bx = w * 0.4, r = Math.max(10, Math.min(20, h * 0.11));
    // the laser beam and the bead
    ctx.fillStyle = PINK;
    ctx.fillRect(0, cy - r * 1.4, w, r * 2.8);
    label(ctx, t('trapping laser beam'), 8, cy - r * 1.4 - 8, { size: 9.5, align: 'left', color: 'rgba(255,77,139,0.9)' });
    dot(ctx, bx, cy, r, GLASS);
    // the particle coming in, and going out
    const len = (speed / 600) * w * 0.42, x0 = bx + r + 8;
    const arrow = (xa: number, ya: number, xb: number, yb: number, color: string, width: number, dash: number[] = []) => {
      line(ctx, xa, ya, xb, yb, color, width, dash);
      const a = Math.atan2(yb - ya, xb - xa);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(xb, yb);
      ctx.lineTo(xb - Math.cos(a - 0.5) * 8, yb - Math.sin(a - 0.5) * 8);
      ctx.lineTo(xb - Math.cos(a + 0.5) * 8, yb - Math.sin(a + 0.5) * 8);
      ctx.fill();
    };
    arrow(x0 + len, cy - 8, x0, cy - 8, TEAL, 2.5);
    dot(ctx, x0 + len + 5, cy - 8, 4, TEAL);
    if (bounce) arrow(x0, cy + 8, x0 + len, cy + 8, TEAL, 2.5, [4, 3]);
    else {
      arrow(bx + r * 0.7, cy - r * 0.7, bx + r * 0.7 + len * 0.45, cy - r * 0.7 - len * 0.6, TEAL, 2, [4, 3]);
      label(ctx, t('leaves in a random direction'), bx + r, cy - r - len * 0.6 - 12, { size: 9.5, align: 'left', color: TEAL });
    }
    // the kick on the bead
    const kl = (q / 600) * w * 0.3;
    if (kl > 1) arrow(bx - r - 4, cy, bx - r - 4 - kl, cy, AMBER, 4);
    // the kick meter, 0 to 600 keV/c, along the bottom
    const x0m = 12, x1m = w - 12, yb = h - 34, hb = 18, X = (v: number) => x0m + ((x1m - x0m) * Math.min(v, 600)) / 600;
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(X(0), yb, X(THRESHOLD) - X(0), hb);
    ctx.fillStyle = 'rgba(255,207,92,0.18)';
    ctx.fillRect(X(THRESHOLD), yb, X(600) - X(THRESHOLD), hb);
    label(ctx, t('lost in the noise'), (X(0) + X(THRESHOLD)) / 2, yb + hb / 2, { size: 9.5, color: C.soft });
    label(ctx, t('seen by the experiment'), (X(THRESHOLD) + X(600)) / 2, yb + hb / 2, { size: 9.5, color: AMBER });
    ctx.fillStyle = seen ? AMBER : C.ink;
    ctx.fillRect(X(q) - 2, yb - 6, 4, hb + 12);
    for (const v of [0, 200, 400, 600]) label(ctx, formatNumber(v), X(v), yb + hb + 10, { size: 9.5, align: v === 0 ? 'left' : v === 600 ? 'right' : 'center', color: C.faint });
    label(ctx, t('kick in keV/c'), x0m, yb - 12, { size: 9.5, align: 'left', color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A particle at {v} m/s gives the bead a kick of {q} keV/c', { v: formatNumber(speed), q: formatNumber(Math.round(q)) })} />
      <Choice
        label={t('Gas let into the chamber')}
        value={gas}
        onChange={setGas}
        options={[
          { value: 'kr', label: t('Krypton atom') },
          { value: 'xe', label: t('Xenon atom') },
          { value: 'sf6', label: t('Sulfur hexafluoride molecule') },
        ]}
      />
      <Choice
        label={t('How it leaves the bead')}
        value={bounce ? 'bounce' : 'stick'}
        onChange={(v) => setBounce(v === 'bounce')}
        options={[
          { value: 'bounce', label: t('Bounces straight back') },
          { value: 'stick', label: t('Sticks, then leaves') },
        ]}
      />
      <Range label={t('Speed of the particle')} value={speed} min={50} max={600} step={5} onChange={setSpeed} format={(v) => t('{n} m/s', { n: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Kick to the bead'), value: `${formatNumber(Math.round(q))} keV/c`, tone: seen ? 'good' : undefined },
          { label: t('Bead’s speed changes by'), value: `${formatNumber(Math.round(beadSpeedChange(q) * 100) / 100)} mm/s` },
          { label: t('Average speed of this gas at 20 °C'), value: t('{n} m/s', { n: formatNumber(Math.round(meanSpeed(MASS_U[gas]))) }) },
        ]}
      />
      <p className="lab__note">{t('Simplified: one particle flying head-on along the beam, the direction the experiment measured. A particle that sticks and leaves in a random direction is counted as giving its incoming momentum, the average.')}</p>
    </div>
  );
}
