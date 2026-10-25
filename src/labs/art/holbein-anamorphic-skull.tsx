import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** How wide the skull looks: painted `stretch` times too wide, then seen at `angle` degrees to the panel, which squashes it by sin(angle). */
export const apparentWidth = (stretch: number, angle: number) => stretch * Math.sin((angle * Math.PI) / 180);

/** The viewing angle that undoes a stretch. */
export const rightAngle = (stretch: number) => (Math.asin(1 / stretch) * 180) / Math.PI;

/** A plain skull, about 1 wide and 1.2 tall, centred on (0, 0). */
function skull(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#e7e0cf';
  ctx.beginPath();
  ctx.ellipse(0, -0.16, 0.5, 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-0.3, 0.05, 0.6, 0.44, 0.12);
  ctx.fill();
  ctx.fillStyle = '#3f3a33';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 0.19, 0, 0.13, 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, 0.12);
  ctx.lineTo(-0.06, 0.25);
  ctx.lineTo(0.06, 0.25);
  ctx.closePath();
  ctx.fill();
  for (let i = -3; i <= 3; i++) ctx.fillRect(i * 0.07 - 0.025, 0.34, 0.05, 0.09);
}

export default function Anamorphosis({ onDone }: LabProps) {
  const [stretch, setStretch] = useState(5);
  const [angle, setAngle] = useState(90);
  const seen = apparentWidth(stretch, angle), right = Math.abs(seen - 1) < 0.06 && stretch >= 2;
  useGoal(right, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // seen from above: the panel on the wall and where your eye is
    const dw = Math.min(w * 0.32, h * 0.9), ox = 10 + dw * 0.08, oy = h - 18;
    line(ctx, ox, oy, ox + dw * 0.9, oy, '#a16207', 4);
    const a = (angle * Math.PI) / 180, r = dw * 0.42, ex = ox + dw * 0.45 - Math.cos(a) * r, ey = oy - Math.sin(a) * r;
    line(ctx, ex, ey, ox + dw * 0.45, oy, C.accent, 1.5, [4, 3]);
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(ex, ey, 7, 4.5, a, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('{a}° to the panel', { a: Math.round(angle) }), ox, 12, { size: 10.5, align: 'left' });
    label(ctx, t('panel, from above'), ox + dw * 0.45, oy + 11, { size: 9.5, color: C.faint });
    // what you see
    // too wide to fit? shrink it all alike, keeping its shape
    const vx = dw + 24 + (w - dw - 24) / 2, vy = h / 2 + 6, room = w - dw - 34;
    const size = Math.min(h * 0.62, room * 0.5) * Math.min(1, room / (Math.min(h * 0.62, room * 0.5) * seen));
    ctx.save();
    ctx.translate(vx, vy);
    ctx.scale(size * seen, size);
    skull(ctx);
    ctx.restore();
    label(ctx, right ? t('a skull!') : t('what your eye sees'), vx, 12, { size: 11, color: right ? C.good : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A skull painted {s} times too wide, seen at {a} degrees', { s: formatNumber(stretch), a: Math.round(angle) })} />
      <Range label={t('Painted stretch')} value={stretch} min={1} max={6} step={0.1} onChange={setStretch} format={(v) => `×${formatNumber(v)}`} />
      <Range label={t('Your view')} value={angle} min={5} max={90} step={0.5} onChange={setAngle} format={(v) => `${formatNumber(v)}°`} />
      <Readouts
        items={[
          { label: t('Seen from here, squashed'), value: `×${formatNumber(Math.round(Math.sin((angle * Math.PI) / 180) * 100) / 100)}` },
          { label: t('Skull width, as seen'), value: `×${formatNumber(Math.round(seen * 100) / 100)}`, tone: right ? 'good' : 'accent' },
        ]}
      />
    </div>
  );
}
