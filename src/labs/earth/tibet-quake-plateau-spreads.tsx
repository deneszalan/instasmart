import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/**
 * Anderson's rule of faulting, in made-up units: of the three pushes on a block of crust at a fixed depth, the
 * biggest and smallest decide how it breaks. Weight from above grows with the height of the land; India's squeeze
 * pushes north–south, and a little of it reaches east–west, where the plateau is less hemmed in.
 */
export type Fault = 'thrust' | 'strike-slip' | 'normal';
export interface Pushes {
  vertical: number;
  northSouth: number;
  eastWest: number;
}
export const BASE = 100;
export function pushes(heightKm: number, squeeze: number): Pushes {
  return { vertical: BASE + 25 * heightKm, northSouth: BASE + 1.6 * squeeze, eastWest: BASE + 0.5 * squeeze };
}
/** Thrust when the weight is the smallest push, normal when it is the biggest, strike-slip in between. */
export function faultType(heightKm: number, squeeze: number): Fault {
  const p = pushes(heightKm, squeeze);
  const horiz = [p.northSouth, p.eastWest];
  if (p.vertical <= Math.min(...horiz)) return 'thrust';
  if (p.vertical >= Math.max(...horiz)) return 'normal';
  return 'strike-slip';
}
/** The direction the crust stretches in a normal fault: across the less-held side. */
export const stretches = (heightKm: number, squeeze: number) => {
  const p = pushes(heightKm, squeeze);
  return p.eastWest < p.northSouth ? 'east-west' : 'north-south';
};

const PUSH = '#7cc4e8', PULL = '#f2b33d', QUAKE = '#ff6f59', ROCK = 'rgba(211,154,92,0.55)';
const faultName = (f: Fault) => (f === 'thrust' ? t('thrust fault') : f === 'normal' ? t('normal fault') : t('strike-slip fault'));

export default function TibetPlateauSpreads({ onDone }: LabProps) {
  const [height, setHeight] = useState(0.5);
  const [squeeze, setSqueeze] = useState(60);
  const p = pushes(height, squeeze), f = faultType(height, squeeze);
  useGoal(f === 'normal' && stretches(height, squeeze) === 'east-west' && squeeze >= 40, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min(w * 0.3, h * 0.42), cx = w * 0.4, cy = h * 0.58;
    const dx = s * 0.5, dy = -s * 0.32; // depth (north) goes up and to the right
    const fx = cx - s / 2, fy = cy - s / 2; // front face's top-left
    const P = (x: number, y: number, z: number): [number, number] => [fx + x * s + z * dx, fy + y * s + z * dy];
    const face = (pts: [number, number][], fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = C.faint;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    face([P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], ROCK);
    face([P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], 'rgba(230,180,120,0.6)');
    face([P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0)], 'rgba(160,100,60,0.6)');
    // the fault the pushes would make
    ctx.fillStyle = 'rgba(255,111,89,0.35)';
    ctx.strokeStyle = QUAKE;
    ctx.lineWidth = 2;
    const plane =
      f === 'normal' ? [P(0.35, 0, 0), P(0.35, 0, 1), P(0.75, 1, 1), P(0.75, 1, 0)]
      : f === 'thrust' ? [P(0, 1, 0.1), P(1, 1, 0.1), P(1, 0, 0.9), P(0, 0, 0.9)]
      : [P(0.15, 0, 0), P(0.85, 0, 1), P(0.85, 1, 1), P(0.15, 1, 0)];
    ctx.beginPath();
    plane.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // arrows: length grows with each push
    const len = (v: number) => 14 + (v - BASE) * 0.32;
    const arrow = (x0: number, y0: number, x1: number, y1: number, color: string) => {
      line(ctx, x0, y0, x1, y1, color, 4);
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - Math.cos(a - 0.5) * 10, y1 - Math.sin(a - 0.5) * 10);
      ctx.lineTo(x1 - Math.cos(a + 0.5) * 10, y1 - Math.sin(a + 0.5) * 10);
      ctx.closePath();
      ctx.fill();
    };
    // weight from above
    const [tx, ty] = P(0.5, 0, 0.5);
    arrow(tx, ty - 8 - len(p.vertical), tx, ty - 6, C.ink);
    label(ctx, t('weight'), tx + 8, Math.max(8, ty - 4 - len(p.vertical)), { size: 11, color: C.ink, align: 'left' });
    // north-south squeeze, along the depth axis
    const [sx, sy] = P(0.5, 0.5, 0), [nx, ny] = P(0.5, 0.5, 1);
    const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy), Lns = len(p.northSouth);
    arrow(sx - ux * (Lns + 6), sy - uy * (Lns + 6), sx - ux * 4, sy - uy * 4, PUSH);
    arrow(nx + ux * (Lns + 6), ny + uy * (Lns + 6), nx + ux * 4, ny + uy * 4, PUSH);
    label(ctx, t('India squeezes (N–S)'), 6, h - 10, { size: 11, color: PUSH, align: 'left' });
    // east-west, on the sides
    const [ex, ey] = P(1, 0.5, 0.5), [wx, wy] = P(0, 0.5, 0.5), Lew = len(p.eastWest);
    arrow(ex + Lew + 6, ey, ex + 4, ey, PULL);
    arrow(wx - Lew - 6, wy, wx - 4, wy, PULL);
    label(ctx, t('east–west'), ex + Lew + 10, ey, { size: 11, color: PULL, align: 'left' });
    label(ctx, faultName(f), w - 10, 14, { size: 14, color: QUAKE, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A block of crust breaks as a {f}', { f: faultName(f) })} />
      <Range label={t('Height of the land')} value={height} min={0} max={6} step={0.5} onChange={setHeight} format={(v) => t('{n} km', { n: v.toFixed(1) })} />
      <Range label={t('India’s squeeze')} value={squeeze} min={0} max={100} step={5} onChange={setSqueeze} format={(v) => `${v}%`} />
      <Readouts
        items={[
          { label: t('Biggest push'), value: p.vertical >= Math.max(p.northSouth, p.eastWest) ? t('weight from above') : t('India’s squeeze'), tone: 'accent' },
          { label: t('The crust breaks as a'), value: faultName(f), tone: f === 'normal' ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified, in made-up units: only which push is biggest and which smallest matters (Anderson’s rule of faulting).')}</p>
    </div>
  );
}
