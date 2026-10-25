import { useRef, useState } from 'react';
import { Btn, label, Range, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

const N = 5;
const LIGHT = 200, DARK = 120; // the squares' greys in full light
const A: [number, number] = [1, 4]; // a dark square in the light
const B: [number, number] = [2, 2]; // a light square in the shadow

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/**
 * How much of the light reaches a point (u, v) of the board, in squares: a soft-edged band of shadow cast along the
 * board from the cylinder at u = 4.4, v = 2.5, letting through `depth` of the light in its core.
 */
export const lightAt = (u: number, v: number, depth: number) => {
  const lit = Math.max(smooth(0.75, 1.5, Math.abs(v - 2.5)), smooth(4.0, 4.6, u));
  return depth + (1 - depth) * lit;
};

/** The grey of the board at (u, v): the square's own shade times the light falling on it. */
export const greyAt = (u: number, v: number, depth: number) => {
  const i = Math.min(N - 1, Math.floor(u)), j = Math.min(N - 1, Math.floor(v));
  return Math.round(((i + j) % 2 ? DARK : LIGHT) * lightAt(u, v, depth));
};

const center = ([i, j]: [number, number]): [number, number] => [i + 0.5, j + 0.5];

export default function CheckerShadow({ onDone }: LabProps) {
  const [depth, setDepth] = useState(0.6);
  const [covered, setCovered] = useState(false);
  const [picked, setPicked] = useState<{ A?: number; B?: number; last?: number }>({});
  const view = useRef({ cx: 0, cy: 0, s: 1 });
  const same = greyAt(...center(A), depth) === greyAt(...center(B), depth);
  useGoal(same && ((picked.A !== undefined && picked.B !== undefined) || covered), onDone);

  // board coordinates (u, v) seen at an angle: squares become diamonds
  const toScreen = (u: number, v: number): [number, number] => {
    const { cx, cy, s } = view.current;
    return [cx + (u - v) * s, cy + (u + v) * s * 0.56];
  };
  const toBoard = (x: number, y: number): [number, number] => {
    const { cx, cy, s } = view.current, p = (x - cx) / s, q = (y - cy) / (s * 0.56);
    return [(p + q) / 2, (q - p) / 2];
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const [u, v] = toBoard(p.x, p.y);
    if (u < 0 || v < 0 || u >= N || v >= N) return;
    const grey = greyAt(u, v, depth), i = Math.floor(u), j = Math.floor(v);
    setPicked((q) => ({ ...q, last: grey, ...(i === A[0] && j === A[1] ? { A: grey } : {}), ...(i === B[0] && j === B[1] ? { B: grey } : {}) }));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min(w / (2 * N + 1.4), (h - 16) / (N * 1.12 + 1.6));
    view.current = { cx: w / 2, cy: 8 + s * 1.2, s };
    ctx.fillStyle = 'rgb(150,150,150)';
    ctx.fillRect(0, 0, w, h);
    // each square drawn in small pieces, so the shadow's soft edge falls smoothly across it
    const k = 12;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        for (let a = 0; a < k; a++)
          for (let b = 0; b < k; b++) {
            const u0 = i + a / k, v0 = j + b / k, g = greyAt(u0 + 0.5 / k, v0 + 0.5 / k, depth);
            ctx.fillStyle = ctx.strokeStyle = `rgb(${g},${g},${g})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(...toScreen(u0, v0));
            ctx.lineTo(...toScreen(u0 + 1 / k, v0));
            ctx.lineTo(...toScreen(u0 + 1 / k, v0 + 1 / k));
            ctx.lineTo(...toScreen(u0, v0 + 1 / k));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
    // the cylinder casting the shadow
    const [px, py] = toScreen(4.4, 2.5), r = s * 0.62, ch = s * 1.6;
    const body = ctx.createLinearGradient(px - r, 0, px + r, 0);
    body.addColorStop(0, '#7c2d12');
    body.addColorStop(0.7, '#c2410c');
    body.addColorStop(1, '#ea580c');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 0.45, 0, 0, Math.PI);
    ctx.lineTo(px - r, py - ch);
    ctx.ellipse(px, py - ch, r, r * 0.45, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(px, py - ch, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    if (covered) {
      // a card over everything but the middles of A and B
      ctx.save();
      ctx.fillStyle = '#e7e2d6';
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      for (const sq of [A, B]) {
        const [x, y] = toScreen(...center(sq));
        ctx.moveTo(x + s * 0.32, y);
        ctx.arc(x, y, s * 0.32, 0, Math.PI * 2, true);
      }
      ctx.fill('evenodd');
      ctx.restore();
    }
    for (const [name, sq] of [['A', A], ['B', B]] as const) {
      const [x, y] = toScreen(...center(sq));
      label(ctx, name, x, y + (covered ? s * 0.55 : 0), { size: Math.max(12, s * 0.42), color: covered ? '#111' : name === 'A' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)' });
    }
  };

  const swatch = (g?: number) =>
    g === undefined ? (
      t('tap it')
    ) : (
      <>
        <i className="lab__swatch" style={{ background: `rgb(${g},${g},${g})` }} />
        {g}
      </>
    );
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A checkerboard with a cylinder’s shadow across it; squares A and B')} />
      <Range label={t('Shadow')} value={Math.round((1 - depth) * 100)} min={0} max={60} onChange={(v) => setDepth(1 - v / 100)} format={(v) => t('{p}% darker', { p: v })} />
      <div className="lab__row">
        <Btn ghost={!covered} onClick={() => setCovered((c) => !c)}>
          {covered ? t('Take the card away') : t('Cover the rest')}
        </Btn>
        <span className="lab__note">{t('Tap a square to measure its grey, 0 to 255.')}</span>
      </div>
      <Readouts
        items={[
          { label: t('Square A'), value: swatch(picked.A === undefined ? undefined : greyAt(...center(A), depth)) },
          { label: t('Square B'), value: swatch(picked.B === undefined ? undefined : greyAt(...center(B), depth)) },
          { label: t('Last tap'), value: swatch(picked.last) },
        ]}
      />
    </div>
  );
}
