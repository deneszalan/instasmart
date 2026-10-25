import { useState } from 'react';
import { C, Choice, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The stages from picture sign to letter, oldest first, with when each appears (from the post's timeline). */
export const STAGES = ['c. 1850 BC', 'c. 1050 BC', '8th c. BC', 'c. 7th c. BC', 'today'];

type Stroke = [number, number][];
// A: the same shape turning, from an upside-down ox head with horns, onto its side, then upright
const A_TURN = [180, 90, 90, 10, 0];
const A_SHAPE: Stroke[] = [
  [[-0.55, 0.8], [0, -0.8], [0.55, 0.8]],
  [[-0.3, 0.15], [0.3, 0.15]],
];
// B: a house plan, then a head on a stem, the Greek letter facing left, then the B we use
const B_SHAPES: Stroke[][] = [
  [[[-0.6, 0.2], [-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.1, 0.6]], [[-0.6, 0.2], [-0.2, 0.2], [-0.2, 0.6]]],
  [[[0.2, 0.8], [0.2, -0.7], [-0.4, -0.7], [-0.4, -0.05], [0.2, -0.05]]],
  [[[0.3, -0.8], [0.3, 0.8]], [[0.3, -0.8], [-0.3, -0.6], [-0.3, -0.15], [0.3, 0]], [[0.3, 0], [-0.35, 0.2], [-0.35, 0.6], [0.3, 0.8]]],
  [[[-0.3, -0.8], [-0.3, 0.8]], [[-0.3, -0.8], [0.3, -0.6], [0.3, -0.15], [-0.3, 0]], [[-0.3, 0], [0.35, 0.2], [0.35, 0.6], [-0.3, 0.8]]],
  [[[-0.3, -0.8], [-0.3, 0.8]], [[-0.3, -0.8], [0.25, -0.75], [0.35, -0.45], [0.25, -0.1], [-0.3, -0.05]], [[-0.3, -0.05], [0.35, 0.05], [0.42, 0.45], [0.3, 0.78], [-0.3, 0.8]]],
];

export default function AlephToA({ onDone }: LabProps) {
  const [letter, setLetter] = useState<'A' | 'B'>('A');
  const [v, setV] = useState(0);
  const [reached, setReached] = useState(new Set<string>());
  useGoal(reached.has('A') && reached.has('B'), onDone);
  const move = (x: number) => {
    setV(x);
    if (x >= 4) setReached((s) => new Set(s).add(letter));
  };

  const stroke = (ctx: CanvasRenderingContext2D, strokes: Stroke[], cx: number, cy: number, s: number, turn: number, alpha: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((turn * Math.PI) / 180);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = Math.max(3, s * 0.12);
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const st of strokes) {
      ctx.beginPath();
      st.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x * s, y * s));
      ctx.stroke();
    }
    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h * 0.46, s = Math.min(w, h) * 0.28, i = Math.min(3, Math.floor(v)), f = v - i;
    if (letter === 'A') {
      const turn = A_TURN[i] + (A_TURN[Math.min(4, i + 1)] - A_TURN[i]) * f;
      stroke(ctx, A_SHAPE, cx, cy, s, turn, 1);
      // the ox's eyes, fading as the sign becomes a letter
      const eyes = Math.max(0, 1 - v);
      if (eyes > 0) {
        ctx.globalAlpha = eyes;
        for (const ex of [-0.18, 0.18]) {
          ctx.fillStyle = C.ink;
          ctx.beginPath();
          ctx.arc(cx + ex * s, cy - 0.05 * s, s * 0.06, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    } else {
      stroke(ctx, B_SHAPES[i], cx, cy, s, 0, 1 - f);
      stroke(ctx, B_SHAPES[Math.min(4, i + 1)], cx, cy, s, 0, f);
    }
    const names = letter === 'A' ? [t('ox head'), t('Phoenician aleph'), t('Greek alpha, on its side'), t('Latin A'), 'A'] : [t('house'), t('Phoenician bet'), t('early Greek beta, facing left'), t('Latin B'), 'B'];
    const k = Math.round(v);
    label(ctx, names[k], cx, h - 26, { size: 13, color: C.accent });
    label(ctx, STAGES[k], cx, h - 10, { size: 10.5 });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Letter')}
        value={letter}
        onChange={(l) => (setLetter(l), setV(0))}
        options={[
          { value: 'A', label: t('A, from an ox') },
          { value: 'B', label: t('B, from a house') },
        ]}
      />
      <Stage draw={draw} label={t('The letter {l} as it looked: {stage}', { l: letter, stage: STAGES[Math.round(v)] })} />
      <Range label={t('Through time')} value={v} min={0} max={4} step={0.05} onChange={move} format={(x) => STAGES[Math.round(x)]} />
      <p className="lab__note">{t('Simplified shapes. The ox head and the house are scholars’ readings of signs not fully deciphered.')}</p>
    </div>
  );
}
