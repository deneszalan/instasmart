import { useState } from 'react';
import { C, Choice, dot, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** NHC's 2026 Atlantic cone circles (radius holding two-thirds of 2021–2025 track errors), in km. */
export const NHC_RADIUS_KM: Record<number, number> = { 24: 39 * 1.852, 72: 95 * 1.852, 120: 200 * 1.852 };
export const MISSES = 60;

/**
 * Simulated forecast misses for `hours` ahead: where the storm's centre really was, in km from the forecast point.
 * The spread is random (seeded), then scaled so that exactly two-thirds lie within NHC's circle for that time.
 */
export function misses(hours: number, seed = 7) {
  const r = rng(seed + hours);
  const raw = Array.from({ length: MISSES }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(-2 * Math.log(1 - r() * 0.999));
    return { a, d };
  });
  const sorted = raw.map((p) => p.d).sort((x, y) => x - y);
  const q = sorted[Math.ceil((2 * MISSES) / 3) - 1];
  const scale = NHC_RADIUS_KM[hours] / q;
  return raw.map((p) => ({ x: Math.cos(p.a) * p.d * scale, y: Math.sin(p.a) * p.d * scale }));
}

/** How many misses lie within `radiusKm` of the forecast point. */
export const inside = (pts: { x: number; y: number }[], radiusKm: number) => pts.filter((p) => Math.hypot(p.x, p.y) <= radiusKm + 1e-9).length;

const TRACK = '#ffd84d', MISS = '#ff7f66';

export default function HurricaneCone({ onDone }: LabProps) {
  const [hours, setHours] = useState(72);
  const [radius, setRadius] = useState(60);
  const pts = misses(hours);
  const n = inside(pts, radius), share = n / MISSES;
  const reached = share >= 0.64 && share <= 0.7;
  useGoal(reached, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2;
    // scale so the two-thirds circle fills most of the stage; the farthest misses may fall off its edges
    const far = NHC_RADIUS_KM[hours] * 1.6;
    const px = (Math.min(w, h) / 2 - 6) / far;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (far * px * i) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * px, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    pts.forEach((p) => {
      const inCircle = Math.hypot(p.x, p.y) <= radius;
      dot(ctx, cx + p.x * px, cy + p.y * px, 3.4, inCircle ? MISS : 'rgba(255,127,102,0.4)');
    });
    dot(ctx, cx, cy, 5, TRACK);
    // a 100 km scale bar
    const bar = 100 * px;
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, h - 12);
    ctx.lineTo(12 + bar, h - 12);
    ctx.stroke();
    label(ctx, t('100 km'), 12 + bar / 2, h - 22, { size: 9.5, color: C.soft });
    dot(ctx, w - 80, 14, 4, TRACK);
    label(ctx, t('forecast point'), w - 72, 14, { size: 9.5, color: TRACK, align: 'left' });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Hours ahead')}
        value={hours}
        onChange={setHours}
        options={[
          { value: 24, label: t('24 hours') },
          { value: 72, label: t('3 days') },
          { value: 120, label: t('5 days') },
        ]}
      />
      <Stage draw={draw} label={t('{n} of {m} simulated misses lie within {r} km of the forecast point', { n, m: MISSES, r: radius })} />
      <Range label={t('Circle radius')} value={radius} min={10} max={600} step={2} onChange={setRadius} format={(v) => `${v} km`} />
      <Readouts
        items={[
          { label: t('Misses inside'), value: `${n} / ${MISSES}`, tone: reached ? 'good' : undefined },
          { label: t('Share inside'), value: `${formatNumber(Math.round(share * 100))}%`, tone: reached ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simulated misses, scaled so that two-thirds fall inside the Hurricane Center’s 2026 circle.')}</p>
    </div>
  );
}
