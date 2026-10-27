import { useState } from 'react';
import { C, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Northwestern trap (Myers et al., 2026): cyclotron about 156 GHz, axial bounce about 206 MHz. */
export const REAL_RATIO = 156e9 / 206e6;

export type Fate = 'trapped' | 'cap' | 'ring';

/** A Penning trap holds a positive charge only if the circling beats the end caps' sideways push: ωc² > 2ωz². */
export const holds = (wc: number, volts: number) => volts > 0 && wc * wc > 2 * volts;

/**
 * An ideal Penning trap in toy units: the ring wall at radius 1, the end caps at z = ±1. The magnet sets the
 * cyclotron rate ωc, the end-cap voltage sets ωz² (so ωz = √volts). Equations of motion for a positive charge:
 * x″ = ωc·y′ + ωz²x/2, y″ = −ωc·x′ + ωz²y/2, z″ = −ωz²z. Integrated with RK4 until it hits a wall or time runs out.
 */
export function simulate(wc: number, volts: number, tMax = 30, dt = 0.005) {
  let s = [0.25, 0, 0.15, 0, 0.9, 0.35]; // x, y, z, vx, vy, vz
  const f = (q: number[]) => [q[3], q[4], q[5], wc * q[4] + (volts / 2) * q[0], -wc * q[3] + (volts / 2) * q[1], -volts * q[2]];
  const path: [number, number, number][] = [[s[0], s[1], s[2]]];
  let time = 0, fate: Fate = 'trapped';
  const steps = Math.round(tMax / dt);
  for (let i = 0; i < steps; i++) {
    const k1 = f(s), k2 = f(s.map((v, j) => v + (dt / 2) * k1[j])), k3 = f(s.map((v, j) => v + (dt / 2) * k2[j])), k4 = f(s.map((v, j) => v + dt * k3[j]));
    s = s.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    time += dt;
    if (i % 4 === 0) path.push([s[0], s[1], s[2]]);
    if (Math.hypot(s[0], s[1]) >= 1) { fate = 'ring'; break; }
    if (Math.abs(s[2]) >= 1) { fate = 'cap'; break; }
  }
  path.push([s[0], s[1], s[2]]);
  return { fate, time, path };
}

const POS = '#ff4fa3', COPPER = '#d08a4e';

export default function OnePositronTrap({ onDone }: LabProps) {
  const [wc, setWc] = useState(4);
  const [volts, setVolts] = useState(0);
  const run = simulate(wc, volts);
  const trapped = run.fate === 'trapped';
  useGoal(trapped, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const r = Math.min(w * 0.22, h * 0.42);
    // left: side view, end caps above and below, the ring at the sides
    const sx = w * 0.27, sy = h / 2;
    line(ctx, sx - r, sy - r, sx + r, sy - r, COPPER, 4);
    line(ctx, sx - r, sy + r, sx + r, sy + r, COPPER, 4);
    line(ctx, sx - r, sy - r * 0.45, sx - r, sy + r * 0.45, COPPER, 4);
    line(ctx, sx + r, sy - r * 0.45, sx + r, sy + r * 0.45, COPPER, 4);
    // right: top view, the ring
    const tx = w * 0.73, ty = h / 2;
    ctx.strokeStyle = COPPER;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.stroke();
    const trace = (X: (p: [number, number, number]) => number, Y: (p: [number, number, number]) => number) => {
      ctx.strokeStyle = trapped ? C.good : POS;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      run.path.forEach((p, i) => (i ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p))));
      ctx.stroke();
      ctx.globalAlpha = 1;
      const end = run.path[run.path.length - 1];
      ctx.fillStyle = trapped ? C.good : C.bad;
      ctx.beginPath();
      ctx.arc(X(end), Y(end), trapped ? 3.5 : 5, 0, Math.PI * 2);
      ctx.fill();
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx - r - 8, sy - r - 8, 2 * r + 16, 2 * r + 16);
    ctx.clip();
    trace((p) => sx + p[0] * r, (p) => sy - p[2] * r);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, r + 6, 0, Math.PI * 2);
    ctx.clip();
    trace((p) => tx + p[0] * r, (p) => ty - p[1] * r);
    ctx.restore();
  };

  const fate = run.fate === 'trapped' ? t('Held in place') : run.fate === 'cap' ? t('Hit an end cap') : t('Hit the ring');
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A positron in a Penning trap, seen from the side and from above: {f}', { f: fate })} />
      <Range label={t('Magnet strength')} value={wc} min={0} max={8} step={0.1} onChange={setWc} format={(v) => formatNumber(v)} />
      <Range label={t('End-cap voltage')} value={volts} min={0} max={8} step={0.1} onChange={setVolts} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('The positron'), value: fate, tone: trapped ? 'good' : 'bad' },
          { label: t('Circling ÷ bouncing'), value: volts > 0 ? formatNumber(Math.round((wc / Math.sqrt(volts)) * 100) / 100) : '∞' },
        ]}
      />
      <p className="lab__note">{t('Toy units and an ideal trap.')}</p>
    </div>
  );
}
