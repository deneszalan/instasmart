import { useMemo, useState } from 'react';
import { C, Choice, dot, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Curve = 'parabola' | 'ellipse' | 'sphere';
export const RADIUS = 75.2; // m, the sphere all the shells were cut from
const SPAN = 40, RISE = 55; // a rib from its foot (0, 0) to the crown (40 m across, 55 m up)

// the circle of radius 75.2 m through the foot and the crown, bulging outwards like the parabola and the ellipse
const chord = Math.hypot(SPAN, RISE), off = Math.sqrt(RADIUS * RADIUS - (chord / 2) ** 2);
const CX = SPAN / 2 + (off * RISE) / chord, CY = RISE / 2 - (off * SPAN) / chord;
const A0 = Math.atan2(-CY, -CX), A1 = Math.atan2(RISE - CY, SPAN - CX);

/** A point along the rib, u from 0 (foot) to 1 (crown). */
export function rib(curve: Curve, u: number): [number, number] {
  if (curve === 'parabola') return [u * SPAN, RISE * (1 - (1 - u) ** 2)];
  if (curve === 'ellipse') return [SPAN * (1 - Math.cos((u * Math.PI) / 2)), RISE * Math.sin((u * Math.PI) / 2)];
  const a = A0 + (A1 - A0) * u;
  return [CX + RADIUS * Math.cos(a), CY + RADIUS * Math.sin(a)];
}

/** How sharply the rib bends at u, as the radius of the circle that fits it there (m). */
export function bendRadius(curve: Curve, u: number) {
  const e = 1e-4, p = rib(curve, u - e), q = rib(curve, u), r = rib(curve, u + e);
  const dx = (r[0] - p[0]) / (2 * e), dy = (r[1] - p[1]) / (2 * e);
  const ddx = (r[0] - 2 * q[0] + p[0]) / (e * e), ddy = (r[1] - 2 * q[1] + p[1]) / (e * e);
  return Math.pow(dx * dx + dy * dy, 1.5) / Math.abs(dx * ddy - dy * ddx);
}

/** Cut the rib into `n` pieces of equal length; pieces that bend alike can share a mould. Returns each piece's mould. */
export function moulds(curve: Curve, n: number) {
  const N = 600, len = [0];
  for (let i = 1; i <= N; i++) {
    const [x0, y0] = rib(curve, (i - 1) / N), [x1, y1] = rib(curve, i / N);
    len.push(len[i - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  const at = (s: number) => len.findIndex((l) => l >= s) / N; // u where the rib is s metres long
  const cuts = Array.from({ length: n + 1 }, (_, k) => Math.max(0, at((k * len[N]) / n)));
  const shapes: number[][] = [], ids: number[] = [];
  cuts.slice(0, -1).forEach((u0, k) => {
    // a piece is described by how it bends at its start, middle and end
    const shape = [u0, (u0 + cuts[k + 1]) / 2, cuts[k + 1]].map((u) => bendRadius(curve, Math.min(0.9999, Math.max(0.0001, u))));
    let id = shapes.findIndex((other) => other.every((r, i) => Math.abs(r - shape[i]) / r < 0.01));
    if (id < 0) id = shapes.push(shape) - 1;
    ids.push(id);
  });
  return { cuts, ids, count: shapes.length };
}

const PALETTE = ['#fde047', '#f472b6', '#7dd3fc', '#86efac', '#fdba74', '#c4b5fd', '#fca5a5', '#5eead4', '#fcd34d', '#a5b4fc', '#f9a8d4', '#bef264'];

export default function OperaHouse({ onDone }: LabProps) {
  const [curve, setCurve] = useState<Curve>('parabola');
  const [n, setN] = useState(12);
  const { cuts, ids, count } = useMemo(() => moulds(curve, n), [curve, n]);
  useGoal(curve === 'sphere', onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = 14, s = Math.min((w * 0.62 - 2 * pad) / SPAN, (h - 2 * pad) / RISE), ox = pad + 6, oy = h - pad;
    const X = (x: number) => ox + x * s, Y = (y: number) => oy - y * s;
    if (curve === 'sphere') {
      // the rest of the sphere's circle
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(X(CX), Y(CY), RADIUS * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, oy, w, h - oy);
    cuts.slice(0, -1).forEach((u0, k) => {
      ctx.strokeStyle = PALETTE[ids[k] % PALETTE.length];
      ctx.lineWidth = 7;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const [x, y] = rib(curve, u0 + ((cuts[k + 1] - u0) * i) / 12);
        ctx[i ? 'lineTo' : 'moveTo'](X(x), Y(y));
      }
      ctx.stroke();
      const [jx, jy] = rib(curve, u0);
      dot(ctx, X(jx), Y(jy), 2.2, '#111');
    });
    // the moulds needed, one swatch each
    const mx = w * 0.66, cols = 4, sw = (w - mx - 10) / cols - 4;
    label(ctx, t('moulds needed'), mx, 10, { size: 10.5, align: 'left' });
    for (let j = 0; j < Math.min(count, 24); j++) {
      ctx.fillStyle = PALETTE[j % PALETTE.length];
      ctx.fillRect(mx + (j % cols) * (sw + 4), 22 + Math.floor(j / cols) * 14, sw, 9);
    }
    if (curve === 'sphere') label(ctx, t('one radius: {r} m', { r: formatNumber(RADIUS) }), mx, 46, { size: 11, align: 'left', color: C.good });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Shape of the rib')}
        value={curve}
        onChange={setCurve}
        options={[
          { value: 'parabola', label: t('Parabola') },
          { value: 'ellipse', label: t('Ellipse') },
          { value: 'sphere', label: t('Cut from a sphere') },
        ]}
      />
      <Stage draw={draw} label={t('A shell rib made of {n} precast pieces, coloured by the mould each needs', { n })} />
      <Range label={t('Pieces')} value={n} min={6} max={24} step={2} onChange={setN} />
      <Readouts
        items={[
          { label: t('Pieces in the rib'), value: String(n) },
          { label: t('Different moulds'), value: String(count), tone: count === 1 ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
