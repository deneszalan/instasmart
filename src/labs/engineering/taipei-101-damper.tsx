import { useMemo, useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export const MASS = 0.0005; // the ball's mass as a share of the swaying tower's (a model value)
export const TOWER_DAMPING = 0.01; // the tower's own damping, as a share of critical

type Complex = [number, number];
const mul = ([a, b]: Complex, [c, d]: Complex): Complex => [a * c - b * d, a * d + b * c];
const sub = ([a, b]: Complex, [c, d]: Complex): Complex => [a - c, b - d];
const abs = ([a, b]: Complex) => Math.hypot(a, b);
const div = (p: Complex, q: Complex): Complex => {
  const d = q[0] * q[0] + q[1] * q[1];
  return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d];
};

/**
 * The tower's sway in steady gusts, as a multiple of how far the same push would bend it slowly. `r` is the gusts'
 * rhythm and `tune` the ball's swing rhythm, both as shares of the tower's own; `damping` is the ball's dampers.
 * With `damping` null there is no ball. Returns the tower's and the ball's motion as complex amplitudes.
 */
export function response(r: number, tune: number, damping: number | null): { tower: Complex; ball: Complex } {
  const B: Complex = [1 - r * r, 2 * TOWER_DAMPING * r];
  if (damping === null) {
    const tower = div([1, 0], B);
    return { tower, ball: tower };
  }
  const A: Complex = [tune * tune - r * r, 2 * damping * tune * r], Cc: Complex = [tune * tune, 2 * damping * tune * r];
  const tower = div(A, sub(mul(B, A), mul([MASS * r * r, 0], Cc)));
  return { tower, ball: mul(tower, div(Cc, A)) };
}

const RS = Array.from({ length: 241 }, (_, i) => 0.85 + (i / 240) * 0.3);
/** The worst sway over all gust rhythms near the tower's own. */
export const worst = (tune: number, damping: number | null) => Math.max(...RS.map((r) => abs(response(r, tune, damping).tower)));

export default function TunedDamper({ onDone, active }: LabProps) {
  const [tune, setTune] = useState(115);
  const [damp, setDamp] = useState(1);
  const [time, setTime] = useState(0);
  useFrame((dt) => setTime((s) => s + dt), active);
  const f = tune / 100, z = damp / 100;
  const without = useMemo(() => worst(1, null), []);
  const withBall = useMemo(() => worst(f, z), [f, z]);
  const cut = 1 - withBall / without;
  useGoal(cut >= 0.3, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the sway at each gust rhythm, without and with the ball
    const L = 30, R = w * 0.64, top = 14, bot = h - 20, X = (r: number) => L + ((r - 0.85) / 0.3) * (R - L), Y = (v: number) => bot - (v / (without * 1.05)) * (bot - top);
    const curve = (damping: number | null, colour: string, width: number) => {
      ctx.strokeStyle = colour;
      ctx.lineWidth = width;
      ctx.beginPath();
      RS.forEach((r, i) => ctx[i ? 'lineTo' : 'moveTo'](X(r), Y(abs(response(r, damping === null ? 1 : f, damping).tower))));
      ctx.stroke();
    };
    curve(null, 'rgba(255,255,255,0.45)', 1.5);
    curve(z, C.accent, 2.5);
    line(ctx, L, Y(withBall), R, Y(withBall), C.accent, 1, [3, 3]);
    line(ctx, L, bot, R, bot, C.faint, 1);
    label(ctx, t('gusts slower'), L, bot + 10, { size: 9.5, align: 'left', color: C.faint });
    label(ctx, t('faster'), R, bot + 10, { size: 9.5, align: 'right', color: C.faint });
    label(ctx, t('sway'), L - 4, top + 4, { size: 9.5, align: 'right', color: C.faint });
    label(ctx, t('no ball'), X(1) + 6, Y(without) + 4, { size: 10, align: 'left' });
    // the tower in gusts at its own rhythm, and the ball swinging out of step inside it
    const cx = w * 0.82, base = h - 10, th = h - 28, wob = 2 * Math.PI * 0.6 * time;
    const { tower, ball } = response(1, f, z), sway = Math.min(18, (abs(tower) / without) * 18);
    const phase = Math.atan2(tower[1], tower[0]), lean = sway * Math.sin(wob + phase);
    const bphase = Math.atan2(ball[1], ball[0]), bmove = Math.min(26, (abs(ball) / without) * 18) * Math.sin(wob + bphase);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(cx - 12, base);
    ctx.lineTo(cx + 12, base);
    ctx.lineTo(cx + 7 + lean, base - th);
    ctx.lineTo(cx - 7 + lean, base - th);
    ctx.fill();
    const by = base - th * 0.86, bx = cx + lean * 0.86;
    line(ctx, bx, by - 14, bx + bmove * 0.25, by, '#94a3b8', 1);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx + bmove * 0.25, by, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('How far the tower sways at each gust rhythm, with and without the tuned ball')} />
      <Range label={t('Ball’s swing rhythm')} value={tune} min={85} max={115} onChange={setTune} format={(v) => t('{p}% of the tower’s', { p: v })} />
      <Range label={t('Its dampers')} value={damp} min={0} max={10} step={0.5} onChange={setDamp} format={(v) => `${v}`} />
      <Readouts
        items={[
          { label: t('Worst sway, with the ball'), value: t('{p}% less', { p: Math.round(cut * 100) }), tone: cut >= 0.3 ? 'good' : cut > 0 ? 'accent' : 'bad' },
        ]}
      />
    </div>
  );
}
