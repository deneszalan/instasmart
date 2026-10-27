import { useRef, useState } from 'react';
import { C, Choice, dot, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The painter's eye in the model: its height above the room's floor and its distance from the wall, in metres. */
export const EYE = 4.2;
export const DIST = 9;
const BOTTOM = 2, TOP = 7, HALF = 3.85; // the fresco on the wall
const HALL = 2.6, SPRING = 4.75, PLATFORM = 3.58, FAR = 17, TILE = 0.6;

/** Where a point of the painted world (X across, Y up, Z behind the wall) lands on the picture, in metres. */
export const project = (X: number, Y: number, Z: number): [number, number] => {
  const s = DIST / (DIST + Z);
  return [X * s, EYE + (Y - EYE) * s];
};

/** Distance from point p to the line through a and b. */
export const offLine = (a: [number, number], b: [number, number], p: [number, number]) =>
  Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Receding edges of the painted hall: lines straight back from the wall, as [start, end] on the picture. */
export const EDGES: [[number, number], [number, number]][] = [
  [project(-HALL, SPRING, 1.2), project(-HALL, SPRING, 8)],
  [project(HALL, SPRING, 1.2), project(HALL, SPRING, 8)],
  [project(-HALL, PLATFORM, 3), project(-HALL, PLATFORM, 12)],
  [project(HALL, PLATFORM, 3), project(HALL, PLATFORM, 12)],
  [project(-3 * TILE, BOTTOM, 0), project(-3 * TILE, BOTTOM, 1.2)],
  [project(3 * TILE, BOTTOM, 0), project(3 * TILE, BOTTOM, 1.2)],
];

/** Diagonals of the square floor tiles, each running back at 45° to the left or right. */
export const DIAGONALS: [[number, number], [number, number]][] = [-3, -2, -1, 0, 1, 2, 3].flatMap((c) => [
  [project(c * TILE, BOTTOM, 0), project(c * TILE + 1.2, BOTTOM, 1.2)] as [[number, number], [number, number]],
  [project(c * TILE, BOTTOM, 0), project(c * TILE - 1.2, BOTTOM, 1.2)] as [[number, number], [number, number]],
]);

const VP_TOL = 0.15, DIST_TOL = 0.35;

export default function SchoolOfAthens({ onDone }: LabProps) {
  const [mode, setMode] = useState<'vp' | 'dist'>('vp');
  const [vp, setVp] = useState<[number, number]>([1.6, 5.6]);
  const [dp, setDp] = useState(4);
  const view = useRef({ cx: 0, cy: 0, s: 1 });
  const hits = EDGES.filter(([a, b]) => offLine(a, b, vp) < VP_TOL).length;
  const foundVp = hits === EDGES.length;
  const foundDist = Math.abs(Math.abs(dp) - DIST) < DIST_TOL;
  useGoal(foundVp && foundDist, onDone);

  const onPointer = (p: StagePointer) => {
    if (p.kind === 'up') return;
    const { cx, cy, s } = view.current, x = (p.x - cx) / s, y = (cy - p.y) / s;
    if (mode === 'vp') setVp([Math.max(-4, Math.min(4, x)), Math.max(BOTTOM - 0.2, Math.min(TOP + 0.2, y))]);
    else setDp(Math.max(-10, Math.min(10, x)));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the picture in metres: zoomed in on the fresco to find the vanishing point, out to reach the distance points
    const s = mode === 'vp' ? Math.min((w - 16) / 8.4, (h - 20) / 5.8) : Math.min((w - 16) / 21, (h - 20) / 6);
    const V = { cx: w / 2, cy: h / 2 + 4.5 * s, s };
    view.current = V;
    const X = (x: number) => V.cx + x * V.s, Y = (y: number) => V.cy - y * V.s;
    const P = (q: [number, number]): [number, number] => [X(q[0]), Y(q[1])];
    const fill = (pts: [number, number][], col: string) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    };
    // the fresco: frame, sky, side walls, platform, steps, tiles
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(-HALF), Y(BOTTOM));
    ctx.lineTo(X(-HALF), Y(TOP - HALF));
    ctx.arc(X(0), Y(TOP - HALF), HALF * V.s, Math.PI, 0);
    ctx.lineTo(X(HALF), Y(BOTTOM));
    ctx.closePath();
    ctx.fillStyle = '#c2ab83';
    ctx.fill();
    ctx.clip();
    fill([project(-HALL, PLATFORM, FAR), project(HALL, PLATFORM, FAR), project(HALL, SPRING + HALL, FAR), project(-HALL, SPRING + HALL, FAR)], '#9fc4dd');
    for (const sd of [-1, 1]) fill([project(sd * HALL, PLATFORM, 1.2), project(sd * HALL, PLATFORM, FAR), project(sd * HALL, SPRING, FAR), project(sd * HALL, SPRING, 1.2)], '#a88f68');
    fill([project(-HALF * 2, PLATFORM, 3), project(HALF * 2, PLATFORM, 3), project(HALF * 2, PLATFORM, FAR), project(-HALF * 2, PLATFORM, FAR)], '#c9b089');
    for (let n = 0; n < 5; n++) {
      const y0 = BOTTOM + (n * (PLATFORM - BOTTOM)) / 5, z = 1.2 + n * 0.36;
      fill([project(-8, y0, z), project(8, y0, z), project(8, y0 + (PLATFORM - BOTTOM) / 5, z), project(-8, y0 + (PLATFORM - BOTTOM) / 5, z)], n % 2 ? '#d9c7a3' : '#c2ab83');
    }
    for (let r = 0; r < 2; r++)
      for (let c = -7; c < 7; c++)
        fill([project(c * TILE, BOTTOM, r * TILE), project((c + 1) * TILE, BOTTOM, r * TILE), project((c + 1) * TILE, BOTTOM, (r + 1) * TILE), project(c * TILE, BOTTOM, (r + 1) * TILE)], (r + c) % 2 ? '#a7865f' : '#d6c095');
    // Plato and Aristotle
    for (const [x0, col] of [[-0.3, '#b8432f'], [0.3, '#3f6ea8']] as [number, string][]) {
      const [fx, fy] = project(x0, PLATFORM, 4.2), [, hy] = project(x0, PLATFORM + 1.8, 4.2);
      ctx.fillStyle = col;
      ctx.fillRect(X(fx) - (fy - hy) * V.s * 0.1, Y(hy), (fy - hy) * V.s * 0.2, (hy - fy) * V.s * -1);
    }
    ctx.restore();
    // painted edges, darker, so the reader can line up on them
    for (const [a, b] of mode === 'vp' ? EDGES : DIAGONALS) line(ctx, ...P(a), ...P(b), '#fff3d6', mode === 'vp' ? 3.2 : 1.8);
    if (mode === 'vp') {
      // the reader's lines: from the start of each edge through the chosen point
      for (const [a, b] of EDGES) {
        const ok = offLine(a, b, vp) < VP_TOL;
        line(ctx, ...P(a), ...P(vp), ok ? C.good : 'rgba(252,165,165,0.85)', 1.4);
      }
      dot(ctx, ...P(vp), 6, foundVp ? C.good : C.accent);
      label(ctx, t('your point: {y} m up', { y: formatNumber(Math.round(vp[1] * 10) / 10) }), X(vp[0]) + 10, Y(vp[1]) - 12, { size: 11, align: 'left', color: C.ink });
    } else {
      // the horizon through the vanishing point, and lines from each tile diagonal through the distance point
      line(ctx, 0, Y(EYE), w, Y(EYE), C.accent, 1.2);
      dot(ctx, X(0), Y(EYE), 4, C.accent);
      for (const [a, b] of DIAGONALS) {
        if (Math.sign(b[0] - a[0]) !== Math.sign(dp || 1)) continue;
        const target: [number, number] = [dp, EYE];
        const ok = offLine(a, b, target) < 0.08;
        line(ctx, ...P(a), ...P(target), ok ? C.good : 'rgba(252,165,165,0.8)', 1.1);
      }
      dot(ctx, X(dp), Y(EYE), 6, foundDist ? C.good : C.accent);
      line(ctx, X(0), Y(EYE) + 18, X(dp), Y(EYE) + 18, C.ink, 1.4);
      label(ctx, `${formatNumber(Math.round(Math.abs(dp) * 10) / 10)} m`, X(dp / 2), Y(EYE) + 30, { size: 11, color: C.ink });
    }
  };

  return (
    <div className="lab">
      <Choice
        label={t('Perspective point to find')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'vp', label: t('Find the vanishing point') },
          { value: 'dist', label: t('Find a distance point') },
        ]}
      />
      <Stage
        draw={draw}
        onPointer={onPointer}
        label={mode === 'vp' ? t('A schematic of The School of Athens; drag the point where its receding edges meet') : t('The schematic zoomed out; drag the point on the horizon where the tile diagonals meet')}
      />
      <Readouts
        items={[
          { label: t('Edges through your point'), value: `${hits} / ${EDGES.length}`, tone: foundVp ? 'good' : 'accent' },
          { label: t('Painter’s eye height'), value: foundVp ? t('{n} m above the room floor', { n: formatNumber(EYE) }) : '–', tone: foundVp ? 'good' : undefined },
          { label: t('Painter’s distance'), value: foundDist ? t('{n} m from the wall', { n: formatNumber(DIST) }) : '–', tone: foundDist ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Drag on the picture. Simplified: a schematic drawn with an eye 4.2 m up and 9 m back, and square tiles.')}</p>
    </div>
  );
}
