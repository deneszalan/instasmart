import { useState } from 'react';
import { C, clamp, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const SIDE = 7;
type Pt = [number, number];

/**
 * The four triangles in a square of side a + b, first round a tilted square (c²), then slid into two rectangles
 * that leave the squares a² and b². Every triangle only slides: T1 by (0, a), T2 not at all, T3 by (−b, 0), T4 by (a, −b).
 */
function triangles(a: number, b: number, t: number): Pt[][] {
  const s = a + b;
  const start: Pt[][] = [
    [[0, 0], [a, 0], [0, b]],
    [[s, 0], [s, a], [a, 0]],
    [[s, s], [b, s], [s, a]],
    [[0, s], [0, b], [b, s]],
  ];
  const moves: Pt[] = [[0, a], [0, 0], [-b, 0], [a, -b]];
  return start.map((tri, i) => {
    // Each triangle moves in its own stretch of the slider, one after another.
    const k = clamp(t * 3 - i * 0.66, 0, 1), e = k * k * (3 - 2 * k);
    return tri.map(([x, y]) => [x + moves[i][0] * e, y + moves[i][1] * e] as Pt);
  });
}

export default function Pythagoras({ onDone }: LabProps) {
  const [a, setA] = useState(3);
  const [slide, setSlide] = useState(0);
  const [tried, setTried] = useState(new Set<number>());
  const b = SIDE - a, c2 = a * a + b * b;
  useGoal(slide === 100 && tried.size >= 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const size = Math.min(w, h) - 24, k = size / SIDE, x0 = (w - size) / 2, y0 = (h - size) / 2;
    const P = ([x, y]: Pt): Pt => [x0 + x * k, y0 + y * k];
    ctx.fillStyle = 'rgba(253,224,71,0.18)';
    ctx.fillRect(x0, y0, size, size);
    const tris = triangles(a, b, slide / 100);
    tris.forEach((tri) => {
      ctx.beginPath();
      tri.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](...P(p)));
      ctx.closePath();
      ctx.fillStyle = '#7dd3fc';
      ctx.fill();
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, y0, size, size);
    if (slide === 0) label(ctx, `c² = ${formatNumber(c2)}`, ...P([SIDE / 2, SIDE / 2]), { size: 16, color: C.accent });
    if (slide === 100) {
      label(ctx, `a² = ${a * a}`, ...P([a / 2, a / 2]), { size: a > 1.5 ? 14 : 10, color: C.accent });
      label(ctx, `b² = ${b * b}`, ...P([a + b / 2, a + b / 2]), { size: b > 1.5 ? 14 : 10, color: C.accent });
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Four triangles in a square, sliding from one arrangement to the other')} />
      <Range label={t('Slide')} value={slide} min={0} max={100} onChange={setSlide} format={(v) => `${v}%`} />
      <Range
        label={t('Side a')}
        value={a}
        min={1}
        max={6}
        step={0.5}
        onChange={(v) => {
          setA(v);
          setTried((s) => new Set(s).add(v));
        }}
        format={(v) => `${formatNumber(v)} · b ${formatNumber(SIDE - v)}`}
      />
      <Readouts
        items={[
          { label: t('Big square (a + b)²'), value: formatNumber(SIDE * SIDE) },
          { label: t('4 triangles, 2ab'), value: formatNumber(2 * a * b) },
          { label: t('Empty area'), value: formatNumber(SIDE * SIDE - 2 * a * b), tone: 'accent' },
        ]}
      />
    </div>
  );
}
