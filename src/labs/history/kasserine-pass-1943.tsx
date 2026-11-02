import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/**
 * A toy model of mutual support, the lesson of Sidi Bou Zid (14 February 1943), where US infantry sat on three
 * hills "unable to give mutual support" (Playfair, via Wikipedia) and were cut off. Distances are in "reaches":
 * how far one position's guns can help. The gap to hold is four reaches wide. Not real distances.
 */
export const REACH = 1;
export const GAP = 4;
const EPS = 1e-9;

/** Where `n` positions stand, `spacing` apart and centred in the gap (0 to GAP). */
export const positions = (n: number, spacing: number) => Array.from({ length: n }, (_, i) => GAP / 2 + (i - (n - 1) / 2) * spacing);

/** Whether the positions' reach covers the whole gap, with no hole between neighbours. */
export const covered = (n: number, spacing: number) => (n - 1) * spacing + 2 * REACH >= GAP - EPS && (n < 2 || spacing <= 2 * REACH + EPS);

/** How many positions have a neighbour close enough to help them. */
export const helped = (n: number, spacing: number) => (n >= 2 && spacing <= REACH + EPS ? n : 0);

/** The goal: the whole gap watched, and every position within reach of a neighbour. */
export const holds = (n: number, spacing: number) => covered(n, spacing) && helped(n, spacing) === n;

const BLUE = '#7db8e2', RUST = '#e2704f', RIDGE = '#b79c69';

export default function KasserinePass({ onDone }: LabProps) {
  const [n, setN] = useState(2);
  const [spacing, setSpacing] = useState(2);
  const xs = positions(n, spacing);
  const ok = holds(n, spacing);
  const cov = covered(n, spacing);
  const h = helped(n, spacing);
  useGoal(ok, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h: H }: { w: number; h: number }) => {
    const pad = Math.max(30, w * 0.09), unit = (w - 2 * pad) / GAP, X = (v: number) => pad + v * unit, y = H * 0.48;
    // the two ridges at the ends of the gap
    ctx.fillStyle = 'rgba(183,156,105,0.25)';
    ctx.fillRect(0, y - H * 0.3, pad, H * 0.6);
    ctx.fillRect(w - pad, y - H * 0.3, pad, H * 0.6);
    ctx.strokeStyle = RIDGE; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const yy = y - H * 0.27 + i * H * 0.067;
      line(ctx, pad - 14, yy, pad, yy, RIDGE, 2);
      line(ctx, w - pad, yy, w - pad + 14, yy, RIDGE, 2);
    }
    // the attack comes from the east (top), schematic
    for (const f of [0.2, 0.5, 0.8]) {
      const ax = X(f * GAP), ay = y - H * 0.36;
      line(ctx, ax, ay, ax, ay + H * 0.1, 'rgba(226,112,79,0.6)', 3, [6, 5]);
      ctx.fillStyle = 'rgba(226,112,79,0.6)';
      ctx.beginPath(); ctx.moveTo(ax - 6, ay + H * 0.1); ctx.lineTo(ax + 6, ay + H * 0.1); ctx.lineTo(ax, ay + H * 0.1 + 9); ctx.fill();
    }
    // coverage of the gap: blue where some position reaches, rust where none does
    const steps = 200;
    for (let i = 0; i < steps; i++) {
      const v = ((i + 0.5) / steps) * GAP;
      const seen = xs.some((p) => Math.abs(p - v) <= REACH + EPS);
      ctx.fillStyle = seen ? 'rgba(125,184,226,0.55)' : 'rgba(226,112,79,0.8)';
      ctx.fillRect(X((i / steps) * GAP), y + H * 0.2, unit * (GAP / steps) + 0.5, 8);
    }
    label(ctx, t('the gap to hold'), w / 2, y + H * 0.2 + 20, { size: 11, color: C.soft });
    // links between positions that can help each other
    for (let i = 0; i < xs.length - 1; i++) {
      if (xs[i + 1] - xs[i] <= REACH + EPS) line(ctx, X(xs[i]), y, X(xs[i + 1]), y, C.good, 3);
    }
    // each position, with its reach
    xs.forEach((p) => {
      const near = xs.some((q) => q !== p && Math.abs(q - p) <= REACH + EPS);
      ctx.strokeStyle = 'rgba(125,184,226,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.ellipse(X(p), y, REACH * unit, Math.min(REACH * unit, H * 0.26), 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(X(p), y, 9, 0, Math.PI * 2); ctx.fill();
      if (!near) {
        ctx.strokeStyle = RUST; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(p), y, 15, 0, Math.PI * 2); ctx.stroke();
        label(ctx, t('alone on its hill'), X(p), y - 24, { size: 10, color: RUST });
      }
    });
    label(ctx, t('Toy model, not real distances'), 8, 12, { size: 10, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('{n} positions spaced {s} reaches apart: {c}; {h} of them within reach of a neighbour', {
          n: formatNumber(n),
          s: formatFixed(spacing, 1),
          c: cov ? t('all watched') : t('holes open'),
          h: formatNumber(h),
        })}
      />
      <Choice
        label={t('Positions holding the gap')}
        options={[2, 3, 4].map((v) => ({ value: v, label: t('{n} hills', { n: formatNumber(v) }) }))}
        value={n}
        onChange={setN}
      />
      <Range label={t('Spacing between positions')} value={spacing} min={0.5} max={3} step={0.1} onChange={(v) => setSpacing(Math.round(v * 10) / 10)} format={(v) => t('{s} reaches', { s: formatFixed(v, 1) })} />
      <Readouts
        items={[
          { label: t('Watching the gap'), value: cov ? t('all watched') : t('holes open'), tone: cov ? 'good' : 'bad' },
          { label: t('Helped by a neighbour'), value: t('{n} of {total}', { n: formatNumber(h), total: formatNumber(n) }), tone: h === n ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
