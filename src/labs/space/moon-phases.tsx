import { useRef, useState } from 'react';
import { C, dot, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Moon's angle from the Sun as seen from Earth (its elongation), 0–360°, and what that phase is called. */
export function phaseName(elongation: number): string {
  return [t('New moon'), t('Waxing crescent'), t('First quarter'), t('Waxing gibbous'), t('Full moon'), t('Waning gibbous'), t('Last quarter'), t('Waning crescent')][phaseIndex(elongation)];
}

/** 0 new, 2 first quarter, 4 full, 6 last quarter (each within 10° of exact), and the odd numbers in between. */
export function phaseIndex(elongation: number): number {
  const e = ((elongation % 360) + 360) % 360;
  for (const [i, at] of [[0, 0], [2, 90], [4, 180], [6, 270], [0, 360]] as const) if (Math.abs(e - at) <= 10) return i;
  return e < 90 ? 1 : e < 180 ? 3 : e < 270 ? 5 : 7;
}

export const litShare = (elongation: number) => (1 - Math.cos((elongation * Math.PI) / 180)) / 2;

/** Draws the Moon as seen from the northern hemisphere: waxing, the right side is lit. */
function moonFace(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, elongation: number) {
  const e = ((elongation % 360) + 360) % 360, rad = (e * Math.PI) / 180;
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  const right = e < 180, rx = r * Math.abs(Math.cos(rad));
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  // the lit half's outer edge, then back along the terminator (an ellipse)
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !right);
  // Back from the bottom to the top along the terminator: through the lit side for a crescent, the dark side when gibbous.
  const crescent = e < 90 || e > 270;
  ctx.ellipse(x, y, rx, r, 0, Math.PI / 2, -Math.PI / 2, crescent ? right : !right);
  ctx.fill();
}

export default function MoonPhases({ onDone }: LabProps) {
  // The Moon's position around Earth in the top view, in degrees counter-clockwise from the right; the Sun is off to the left.
  const [angle, setAngle] = useState(250);
  const [seen, setSeen] = useState(new Set<string>());
  const centre = useRef<[number, number]>([0, 0]);
  const elongation = (((angle - 180) % 360) + 360) % 360;
  const name = phaseName(elongation);
  useGoal(['New moon', 'First quarter', 'Full moon', 'Last quarter'].every((n) => seen.has(n)), onDone);

  const onPointer = (p: StagePointer) => {
    if (p.kind === 'up') return;
    const [cx, cy] = centre.current;
    const a = (Math.atan2(-(p.y - cy), p.x - cx) * 180) / Math.PI;
    const next = (a + 360) % 360;
    setAngle(next);
    const e = (((next - 180) % 360) + 360) % 360;
    const key = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'][phaseIndex(e)];
    setSeen((s) => (s.has(key) ? s : new Set(s).add(key)));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.4, cy = h / 2, r = Math.min(w * 0.4, h / 2) - 22;
    centre.current = [cx, cy];
    // sunlight arriving from the left
    for (let y = 16; y < h; y += 26) line2(ctx, 6, y, 30, y);
    label(ctx, t('sunlight'), 8, 8, { size: 10, align: 'left' });
    // Earth's shadow points away from the Sun: it only reaches the Moon at full moon, in an eclipse
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(cx, cy - 9, w - cx, 18);
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // Earth, lit on its sunward side
    dot(ctx, cx, cy, 11, '#1e3a8a');
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, Math.PI / 2, -Math.PI / 2);
    ctx.fill();
    // the Moon: always half lit, on the side facing the Sun
    const a = (angle * Math.PI) / 180, mx = cx + Math.cos(a) * r, my = cy - Math.sin(a) * r;
    dot(ctx, mx, my, 9, '#334155');
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(mx, my, 9, Math.PI / 2, -Math.PI / 2);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 13, 0, Math.PI * 2);
    ctx.stroke();
    // what you see from Earth
    const vx = w * 0.86, vy = h / 2;
    label(ctx, t('From Earth'), vx, vy - 44, { size: 11, color: C.ink });
    moonFace(ctx, vx, vy, 30, elongation);
    label(ctx, t('drag the Moon'), mx, my + 24, { size: 10, color: C.accent });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Top view of the Moon going round Earth, and how it looks from Earth: {p}', { p: name })} onPointer={onPointer} />
      <Readouts
        items={[
          { label: t('Phase'), value: name, tone: 'accent' },
          { label: t('Lit, as we see it'), value: `${Math.round(litShare(elongation) * 100)}%` },
          { label: t('Days since new moon'), value: formatNumber(Math.round((elongation / 360) * 29.53 * 10) / 10) },
        ]}
      />
      <p className="lab__note">{t('Found: {list}', { list: [...seen].filter((n) => ['New moon', 'First quarter', 'Full moon', 'Last quarter'].includes(n)).map((n) => phaseName(['New moon', 'First quarter', 'Full moon', 'Last quarter'].indexOf(n) * 90)).join(', ') || '–' })}</p>
    </div>
  );
}

function line2(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = 'rgba(253,224,71,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - 5, y2 - 3);
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 5, y2 + 3);
  ctx.stroke();
}
