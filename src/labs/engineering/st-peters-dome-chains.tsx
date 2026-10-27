import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** One slice of an ovoid dome, in metres: the mid-surface's semi-axes, the thickness, the pieces, the lantern ring. */
export const AX = 22, BY = 27, THICK = 3, PIECES_N = 24, TOP_R = 4.5;
const TH0 = Math.acos(TOP_R / AX);

/** The pieces of the slice, from the springing up: centre x and weight, which grows with the distance from the axis (a slice narrows to the top). */
export const PIECES = Array.from({ length: PIECES_N }, (_, i) => {
  const a = (i / PIECES_N) * TH0, b = ((i + 1) / PIECES_N) * TH0;
  const x0 = AX * Math.cos(a), y0 = BY * Math.sin(a), x1 = AX * Math.cos(b), y1 = BY * Math.sin(b);
  return { x: (x0 + x1) / 2, w: THICK * Math.hypot(x1 - x0, y1 - y0) * ((x0 + x1) / 2) };
});
export const SLICE_WEIGHT = PIECES.reduce((s, p) => s + p.w, 0);

/**
 * The line of thrust (Poleni's chain turned over): a funicular polygon from the lantern ring down to the springing,
 * for a horizontal thrust `h` and a lantern load, both as shares of the slice's weight, starting at height `yt`.
 */
export function thrustLine(h: number, lantern: number, yt: number): [number, number][] {
  const H = h * SLICE_WEIGHT;
  let x = TOP_R, y = yt, V = lantern * SLICE_WEIGHT;
  const out: [number, number][] = [[x, y]];
  for (const p of [...PIECES].reverse()) {
    y -= (V / H) * (p.x - x);
    x = p.x;
    out.push([x, y]);
    V += p.w;
  }
  out.push([x + (y * H) / V, 0]);
  return out;
}

const CURVE = Array.from({ length: 241 }, (_, i) => {
  const a = (i / 240) * (Math.PI / 2);
  return [AX * Math.cos(a), BY * Math.sin(a)] as [number, number];
});

/** How far the line strays from the middle of the masonry, at worst, in metres. */
export const worstOffset = (pts: [number, number][]) => Math.max(...pts.map(([x, y]) => Math.min(...CURVE.map(([u, v]) => Math.hypot(u - x, v - y)))));

/** The line for thrust h that stays closest to the middle, trying start heights around the crown. */
export function bestLine(h: number, lantern: number) {
  let best = { yt: BY, off: Infinity, pts: [] as [number, number][] };
  for (let yt = BY - 2; yt <= BY + 2.001; yt += 0.1) {
    const pts = thrustLine(h, lantern, yt), off = worstOffset(pts);
    if (off < best.off) best = { yt, off, pts };
  }
  return best;
}

/** Whether a line of thrust for this push fits inside the slice's thickness: Poleni's test of safety. */
export const fits = (h: number, lantern: number) => bestLine(h, lantern).off < THICK / 2;

export default function DomeChains({ onDone }: LabProps) {
  const [push, setPush] = useState(60);
  const [lantern, setLantern] = useState(10);
  const best = bestLine(push / 100, lantern / 100);
  const inside = best.off < THICK / 2;
  useGoal(inside, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min((w - 40) / 32, (h - 24) / 33), x0 = Math.max(18, (w - 32 * s) / 2), y0 = h - 14;
    const X = (m: number) => x0 + m * s, Y = (m: number) => y0 - m * s;
    // the masonry of the slice, in section
    const outer: [number, number][] = [], inner: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * TH0, tx = -AX * Math.sin(a), ty = BY * Math.cos(a), n = Math.hypot(tx, ty), nx = ty / n, ny = -tx / n;
      const x = AX * Math.cos(a), y = BY * Math.sin(a);
      outer.push([x + (nx * THICK) / 2, y + (ny * THICK) / 2]);
      inner.push([x - (nx * THICK) / 2, y - (ny * THICK) / 2]);
    }
    ctx.beginPath();
    outer.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    [...inner].reverse().forEach(([x, y]) => ctx.lineTo(X(x), Y(y)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(216,204,180,0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(216,204,180,0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // the lantern's load
    const lw = (lantern / 30) * 18 + 2;
    ctx.fillStyle = 'rgba(216,204,180,0.85)';
    ctx.fillRect(X(0), Y(BY + 1.5) - lw, TOP_R * s, lw);
    line(ctx, X(0), Y(-0.5), X(0), Y(BY + 4), C.faint, 1, [4, 4]);
    // the line of thrust
    ctx.strokeStyle = inside ? C.good : C.bad;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    best.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    ctx.stroke();
    // the push at the base, drawn to scale with the slice's weight
    const arrow = (push / 100) * 60;
    line(ctx, X(AX + 2), Y(1), X(AX + 2) + arrow, Y(1), C.accent, 3);
    label(ctx, t('push outwards'), X(AX + 2) + 2, Y(1) - 12, { size: 10.5, align: 'left', color: C.accent });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('One slice of a dome in section, with a line of thrust that {fits}', { fits: inside ? t('stays inside the masonry') : t('leaves the masonry') })} />
      <Range label={t('Outward push at the base')} value={push} min={8} max={90} step={1} onChange={setPush} format={(v) => `${formatNumber(v)}%`} />
      <Range label={t('Lantern’s load on the slice')} value={lantern} min={0} max={30} step={1} onChange={setLantern} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Line of thrust'), value: inside ? t('inside the masonry') : t('outside by {m} m', { m: formatNumber(Math.round((best.off - THICK / 2) * 10) / 10) }), tone: inside ? 'good' : 'bad' },
          { label: t('Slice thickness'), value: `${formatNumber(THICK)} m` },
        ]}
      />
      <p className="lab__note">{t('Push and load are shares of the slice’s weight. Simplified: an ovoid slice 3 m thick cut into 24 pieces, not a survey of St Peter’s.')}</p>
    </div>
  );
}
