import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Kinetic energy per kilogram, in megajoules, for a speed in km/s: ½ v². */
export const energyPerKg = (kmPerS: number) => (kmPerS * kmPerS) / 2;
/** A kilogram of TNT releases 4.184 MJ. */
export const TNT_MJ = 4.184;
/**
 * The median peak temperature of a comet's material in an impact, in kelvin, after McDonald and colleagues (2025):
 * about 18.02 × v^2.17 for a head-on hit, scaled by sin(angle)^1.6 for an oblique one.
 */
export const peakTemperature = (kmPerS: number, angleDeg: number) => 18.02 * Math.pow(kmPerS, 2.17) * Math.pow(Math.sin((angleDeg * Math.PI) / 180), 1.6);
/** Above about 3,600 K hydrogen cyanide breaks apart within a fraction of a second; at 7,000 K none survives. */
export const HCN_BREAKS = 3600;
export const HCN_NONE = 7000;
export type Fate = 'survives' | 'partly' | 'destroyed';
export const hcnFate = (kelvin: number): Fate => (kelvin < HCN_BREAKS ? 'survives' : kelvin < HCN_NONE ? 'partly' : 'destroyed');
/** The average impact speed of a comet on Earth, km/s (Anslow et al. 2026), and the lowest possible, Earth's escape speed. */
export const V_EARTH = 28.2;
export const V_MIN = 11;

const HCN = '#9ad7ff', HEAT = '#ff7a3d', HOT = '#ff3b3b';

export default function CometHcn({ onDone }: LabProps) {
  const [speed, setSpeed] = useState(V_EARTH);
  const [angle, setAngle] = useState(45);
  const T = peakTemperature(speed, angle);
  const fate = hcnFate(T);
  useGoal(fate === 'survives' && speed >= V_EARTH, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const gy = h * 0.62;
    ctx.fillStyle = '#28435c';
    ctx.fillRect(0, gy, w, 6);
    // the comet's path at the chosen angle, ending at the ground
    const hx = w * 0.55, len = Math.min(w * 0.5, h * 0.55);
    const a = (angle * Math.PI) / 180;
    const sx = hx - len * Math.cos(a), sy = gy - len * Math.sin(a);
    const col = fate === 'survives' ? HCN : fate === 'partly' ? HEAT : HOT;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(hx, gy);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(hx - 10 * Math.cos(a), gy - 10 * Math.sin(a), 7, 0, Math.PI * 2);
    ctx.fill();
    // the angle arc
    ctx.strokeStyle = C.faint;
    ctx.beginPath();
    ctx.arc(hx, gy, 34, Math.PI, Math.PI + a);
    ctx.stroke();
    label(ctx, `${angle}°`, hx - 44, gy + 16, { size: 11, color: C.soft });
    // a glow at the ground scaled by the heat
    const glow = Math.min(1, T / 25000);
    const g = ctx.createRadialGradient(hx, gy, 2, hx, gy, 30 + 60 * glow);
    g.addColorStop(0, `rgba(255,122,61,${0.3 + 0.6 * glow})`);
    g.addColorStop(1, 'rgba(255,122,61,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, gy, 30 + 60 * glow, 0, Math.PI * 2);
    ctx.fill();
    // the temperature and the verdict below the ground on the right, where they fit even on a short stage
    label(ctx, `${formatNumber(Math.round(T))} K`, w - 8, gy + 16, { size: 13, align: 'right', color: col });
    label(ctx, fate === 'survives' ? t('HCN survives') : fate === 'partly' ? t('most HCN breaks') : t('no HCN left'), w - 8, gy + 32, { size: 10, align: 'right', color: col });
    label(ctx, t('{v} km/s', { v: speed.toFixed(1) }), sx + 8, Math.max(9, sy - 10), { size: 11, align: 'left', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A comet at {v} km/s hitting at {a} degrees reaches about {T} K: {fate}', { v: speed.toFixed(1), a: angle, T: formatNumber(Math.round(T)), fate: fate === 'survives' ? t('HCN survives') : fate === 'partly' ? t('most HCN breaks') : t('no HCN left') })} />
      <Range label={t('Impact speed')} value={speed} min={V_MIN} max={50} step={0.1} onChange={setSpeed} format={(v) => `${v.toFixed(1)} km/s`} />
      <Range label={t('Impact angle')} value={angle} min={5} max={90} step={1} onChange={setAngle} format={(v) => `${v}°`} />
      <Readouts
        items={[
          { label: t('Energy per kg'), value: `${formatNumber(Math.round(energyPerKg(speed)))} MJ`, tone: 'accent' },
          { label: t('Times TNT'), value: `${Math.round(energyPerKg(speed) / TNT_MJ)}×` },
          { label: t('Peak temperature'), value: `${formatNumber(Math.round(T))} K`, tone: fate === 'survives' ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the temperature law 18 × v^2.17 × sin(angle)^1.6 from McDonald and colleagues (2025), with HCN breaking above 3,600 K; real survival also depends on the comet’s size and where in it the HCN sits.')}</p>
    </div>
  );
}
