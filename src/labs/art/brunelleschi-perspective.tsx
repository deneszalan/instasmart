import { useRef, useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const TALL = 1.7; // m, the people in the picture

/**
 * Where a point X metres to the side, Y metres up and Z metres away lands on the picture, in units of the
 * picture's distance from the eye, measured from the vanishing point (down and right positive): Alberti's
 * similar triangles, x = X / Z and y = (eye − Y) / Z.
 */
export const project = (X: number, Y: number, Z: number, eye: number): [number, number] => [X / Z, (eye - Y) / Z];

export default function Perspective({ onDone }: LabProps) {
  const [eye, setEye] = useState(3);
  const [people, setPeople] = useState<[number, number][]>([
    [-1.5, 6],
    [1.2, 10],
    [-0.3, 18],
  ]);
  const held = useRef<number | null>(null);
  const view = useRef({ cx: 0, hy: 0, f: 1 });
  useGoal(Math.abs(eye - TALL) < 0.03, onDone);

  const toScreen = (X: number, Y: number, Z: number): [number, number] => {
    const { cx, hy, f } = view.current, [x, y] = project(X, Y, Z, eye);
    return [cx + x * f, hy + y * f];
  };

  const onPointer = (p: StagePointer) => {
    const { cx, hy, f } = view.current;
    if (p.kind === 'down') {
      let best = -1, dist = 40;
      people.forEach(([X, Z], i) => {
        const [x, y] = toScreen(X, TALL / 2, Z), d = Math.hypot(p.x - x, p.y - y);
        if (d < dist) [best, dist] = [i, d];
      });
      held.current = best >= 0 ? best : null;
    }
    if (held.current !== null && p.kind === 'move' && p.y > hy + 2) {
      // back from the picture to the floor: the feet stand where the ray through the pointer meets the ground
      const Z = Math.min(40, Math.max(5, (eye * f) / (p.y - hy))), X = Math.max(-4, Math.min(4, ((p.x - cx) * Z) / f));
      const i = held.current;
      setPeople((ps) => ps.map((q, k) => (k === i ? [X, Z] : q)));
    }
    if (p.kind === 'up') held.current = null;
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const hy = h * 0.36, f = ((h - hy) * 5) / 3.6;
    view.current = { cx: w / 2, hy, f };
    // sky and floor
    ctx.fillStyle = '#7dabc8';
    ctx.fillRect(0, 0, w, hy);
    ctx.fillStyle = '#c9a77c';
    ctx.fillRect(0, hy, w, h - hy);
    // the tiled floor: 1 m squares, rows crowding towards the horizon
    for (let Z = 4; Z < 60; Z++)
      for (let X = -8; X < 8; X++) {
        if ((X + Z) % 2) continue;
        const a = toScreen(X, 0, Z), b = toScreen(X + 1, 0, Z), c = toScreen(X + 1, 0, Z + 1), d = toScreen(X, 0, Z + 1);
        ctx.fillStyle = 'rgba(120,72,40,0.45)';
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.lineTo(...c);
        ctx.lineTo(...d);
        ctx.fill();
      }
    // lines into the distance all meet at the vanishing point
    for (const X of [-8, -4, 4, 8]) {
      const [x, y] = toScreen(X, 0, 4);
      line(ctx, x, y, w / 2, hy, 'rgba(255,255,255,0.35)', 1, [4, 4]);
    }
    line(ctx, 0, hy, w, hy, C.accent, 1.5);
    dot(ctx, w / 2, hy, 3.5, C.accent);
    label(ctx, t('horizon: at your eye height'), 8, hy - 9, { size: 10.5, align: 'left', color: '#1e293b' });
    // the people, farthest first, each 1.7 m tall
    [...people]
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p[1] - a.p[1])
      .forEach(({ p: [X, Z], i }) => {
        const [fx, fy] = toScreen(X, 0, Z), [, hy2] = toScreen(X, TALL, Z), tall = fy - hy2, wide = tall * 0.26;
        ctx.fillStyle = ['#7c2d12', '#1e3a8a', '#14532d'][i];
        ctx.fillRect(fx - wide / 2, hy2 + tall * 0.16, wide, tall * 0.84);
        ctx.beginPath();
        ctx.arc(fx, hy2 + tall * 0.08, tall * 0.08, 0, Math.PI * 2);
        ctx.fill();
        if (Math.abs(hy2 - hy) < 2) dot(ctx, fx, hy2, 3, C.accent);
      });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A tiled floor in one-point perspective with three people, seen from {e} m up', { e: formatNumber(eye) })} />
      <Range label={t('Your eye height')} value={eye} min={0.5} max={3.5} step={0.05} onChange={setEye} format={(v) => `${formatNumber(v)} m`} />
      <Readouts
        items={[
          { label: t('Each person'), value: `${formatNumber(TALL)} m` },
          { label: t('Their heads'), value: Math.abs(eye - TALL) < 0.03 ? t('on the horizon') : eye > TALL ? t('below the horizon') : t('above the horizon'), tone: Math.abs(eye - TALL) < 0.03 ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Drag the people around the floor.')}</p>
    </div>
  );
}
