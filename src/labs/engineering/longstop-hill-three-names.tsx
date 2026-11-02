import { useState } from 'react';
import { C, dot, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/**
 * A cricket field seen from above, in units of the boundary's radius, y pointing down the screen. The batter's stumps
 * are just below the centre; "behind the wicketkeeper" is straight on down. The long stop stands behind the
 * wicket-keeper towards the boundary (Wikipedia, Fielding (cricket)); here: within 20° of that line and more than
 * halfway from the stumps to the boundary. A simplified, round field.
 */
export const STUMPS = { x: 0, y: 0.12 };
export const KEEPER = { x: 0, y: 0.22 };
export const MAX_ANGLE = 20;
export const MIN_SHARE = 0.5;

/** Angle in degrees between the line straight behind the stumps and the direction to (x, y). */
export const angleOff = (x: number, y: number) => Math.abs((Math.atan2(x - STUMPS.x, y - STUMPS.y) * 180) / Math.PI);
/** How far (x, y) is from the stumps, as a share of the distance from the stumps to the boundary along that line. */
export function shareToBoundary(x: number, y: number) {
  const dx = x - STUMPS.x, dy = y - STUMPS.y, d = Math.hypot(dx, dy);
  if (d === 0) return 0;
  const ux = dx / d, uy = dy / d;
  // distance from the stumps to the unit circle along (ux, uy)
  const b = STUMPS.x * ux + STUMPS.y * uy, c = STUMPS.x ** 2 + STUMPS.y ** 2 - 1;
  const toEdge = -b + Math.sqrt(b * b - c);
  return d / toEdge;
}
export type Spot = 'longstop' | 'close' | 'wide' | 'out';
export function spotOf(x: number, y: number): Spot {
  if (Math.hypot(x, y) > 1) return 'out';
  if (angleOff(x, y) > MAX_ANGLE) return 'wide';
  if (shareToBoundary(x, y) < MIN_SHARE) return 'close';
  return 'longstop';
}

export default function LongstopCricket({ onDone }: LabProps) {
  const [pos, setPos] = useState({ x: 0.6, y: -0.45 });
  const spot = spotOf(pos.x, pos.y);
  useGoal(spot === 'longstop', onDone);

  // Drawn turned a quarter-turn, the pitch across the screen and "behind the wicketkeeper" to the right, so the oval
  // field fills a wide, low stage. Field x maps to screen up, field y to screen right.
  let geom = { cx: 0, cy: 0, rx: 1, ry: 1 };
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const rx = w / 2 - 10, ry = h / 2 - 8, cx = w / 2, cy = h / 2;
    geom = { cx, cy, rx, ry };
    const P = (x: number, y: number) => [cx + y * rx, cy - x * ry] as const;
    ctx.fillStyle = 'rgba(79,138,63,0.45)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.soft; ctx.lineWidth = 2; ctx.stroke();
    // the long-stop zone, shown once found
    const [sx, sy] = P(STUMPS.x, STUMPS.y);
    if (spot === 'longstop') {
      ctx.fillStyle = 'rgba(134,239,172,0.2)';
      ctx.beginPath(); ctx.moveTo(sx, sy);
      for (let a = -MAX_ANGLE; a <= MAX_ANGLE; a += 2) {
        const rad = (a * Math.PI) / 180, ux = Math.sin(rad), uy = Math.cos(rad);
        const b = STUMPS.x * ux + STUMPS.y * uy, c = STUMPS.x ** 2 + STUMPS.y ** 2 - 1, edge = -b + Math.sqrt(b * b - c);
        ctx.lineTo(...P(STUMPS.x + ux * edge, STUMPS.y + uy * edge));
      }
      ctx.closePath(); ctx.fill();
    }
    // the pitch
    const [px0, py0] = P(0.04, -0.13), [px1, py1] = P(-0.04, 0.13);
    ctx.fillStyle = 'rgba(217,196,138,0.8)'; ctx.fillRect(px0, py0, px1 - px0, py1 - py0);
    const [bx, by] = P(0, -0.16), [tx, ty] = P(0, 0.09), [kx, ky] = P(KEEPER.x, KEEPER.y);
    dot(ctx, bx, by, 5, C.ink); label(ctx, t('bowler'), bx, by - 12, { size: 10, color: C.soft });
    dot(ctx, tx, ty, 5, C.ink); label(ctx, t('batter'), tx, ty + 13, { size: 10, color: C.soft });
    dot(ctx, kx, ky, 5, C.cool); label(ctx, t('wicketkeeper'), kx + 2, ky - 12, { size: 10, color: C.cool, align: 'left' });
    line(ctx, sx, sy, ...P(0, 1), C.faint, 1, [4, 4]);
    // the fielder the reader moves
    const [fx, fy] = P(pos.x, pos.y);
    dot(ctx, fx, fy, 8, spot === 'longstop' ? C.good : C.accent);
    label(ctx, t('you, the fielder'), fx, fy - 15, { size: 11, color: C.ink });
  };
  const onPointer = (p: StagePointer) => {
    const x = -(p.y - geom.cy) / geom.ry, y = (p.x - geom.cx) / geom.rx;
    if (Number.isFinite(x) && Number.isFinite(y)) setPos({ x: Math.max(-1.1, Math.min(1.1, x)), y: Math.max(-1.1, Math.min(1.1, y)) });
  };

  const verdict =
    spot === 'longstop' ? t('long stop: the last fielder behind the keeper') :
    spot === 'close' ? t('too close: go further back') :
    spot === 'wide' ? t('not straight behind the wicketkeeper') :
    t('beyond the boundary');
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A cricket field from above; drag the fielder. Now: {spot}', { spot: verdict })} />
      <Readouts
        items={[
          { label: t('Where you stand'), value: verdict, tone: spot === 'longstop' ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Drag on the field. Simplified: a round field; the long-stop area lights up when you find it.')}</p>
    </div>
  );
}
