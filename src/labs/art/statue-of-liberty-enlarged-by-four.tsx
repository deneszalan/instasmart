import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Heights in metres (NPS): Bartholdi's study model, his next two models, and the statue from base to torch. */
export const STUDY = 1.25;
export const STAGES = [
  { name: 'study', m: 1.25 },
  { name: 'second', m: 2.85 },
  { name: 'model', m: 11 },
  { name: 'statue', m: 46.05 },
] as const;
export const PERSON = 1.7;

/** Enlarging by k times the height: the surface (the copper skin) grows k², a solid's volume k³. */
export const enlarge = (k: number) => ({ height: STUDY * k, skin: k * k, volume: k * k * k });
/** How many times the study model's height the full statue is: about 37. */
export const FULL = STAGES[3].m / STUDY;

// the silhouette, in units of its height (base to torch = 1), y up; as in the animation
const FIG: [number, number][] = [
  [-0.135, 0], [0.135, 0], [0.13, 0.15], [0.12, 0.3], [0.115, 0.42], [0.165, 0.43], [0.15, 0.62], [0.1, 0.63], [0.085, 0.645],
  [0.035, 0.675], [0.042, 0.712], [0.072, 0.738], [0.046, 0.736], [0.052, 0.766], [0.026, 0.746], [0.014, 0.782], [0, 0.752],
  [-0.014, 0.782], [-0.026, 0.746], [-0.05, 0.764], [-0.044, 0.734], [-0.07, 0.738], [-0.042, 0.712], [-0.036, 0.678],
  [-0.06, 0.7], [-0.082, 0.8], [-0.092, 0.9], [-0.088, 0.918], [-0.104, 0.94], [-0.098, 0.965], [-0.122, 1.0], [-0.148, 0.966],
  [-0.142, 0.94], [-0.158, 0.918], [-0.128, 0.904], [-0.122, 0.8], [-0.108, 0.7], [-0.094, 0.645], [-0.104, 0.55], [-0.12, 0.35], [-0.13, 0.15],
];
const COPPER = '#c97a45', PLASTER = '#ece4d4', GOLD = '#f1c35c';

function figure(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  FIG.forEach(([fx, fy], i) => (i ? ctx.lineTo(x + fx * h, y - fy * h) : ctx.moveTo(x + fx * h, y - fy * h)));
  ctx.closePath();
  ctx.fill();
}

export default function StatueEnlarged({ onDone }: LabProps) {
  const [k, setK] = useState(1);
  const e = enlarge(k);
  const reached = k >= FULL - 0.05;
  useGoal(reached, onDone);
  const n = (x: number) => formatNumber(x >= 100 ? Math.round(x) : Math.round(x * 10) / 10);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const ground = h - 16, top = 14;
    const view = Math.max(PERSON * 1.25, e.height * 1.08); // metres shown from the ground to the top
    const px = (ground - top) / view;
    line(ctx, 8, ground, w - 8, ground, C.faint, 1.5);
    // a person and the study model for scale, then the enlargement
    const xp = w * 0.1, xm = w * 0.32, xe = w * 0.62;
    ctx.fillStyle = C.soft;
    const ph = PERSON * px;
    ctx.beginPath();
    ctx.arc(xp, ground - ph * 0.9, Math.max(0.6, ph * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(xp - ph * 0.1, ground - ph * 0.78, ph * 0.2, ph * 0.78);
    figure(ctx, xm, ground, STUDY * px, PLASTER);
    figure(ctx, xe, ground, e.height * px, reached ? COPPER : PLASTER);
    // Bartholdi's stages as ticks on a height scale at the right
    const sx = w - 26;
    line(ctx, sx, ground, sx, top, C.faint, 1);
    let lastY = Infinity;
    STAGES.forEach((s) => {
      const y = ground - s.m * px;
      if (y < top) return;
      line(ctx, sx - 5, y, sx + 5, y, GOLD, 2);
      if (lastY - y >= 12) {
        label(ctx, `${formatNumber(s.m)} m`, sx - 8, y, { size: 10, align: 'right', color: GOLD });
        lastY = y;
      }
    });
    label(ctx, t('a person, 1.7 m'), 8, ground + 9, { size: 9, align: 'left', color: C.soft });
    label(ctx, t('study model'), xm, ground + 9, { size: 9, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A statue {k} times as tall as the 1.25 m study model: {m} m', { k: n(k), m: n(e.height) })} />
      <Range label={t('Times taller than the study model')} value={k} min={1} max={40} step={0.1} onChange={setK} format={(v) => `× ${n(v)}`} />
      <Readouts
        items={[
          { label: t('Height'), value: `${n(e.height)} m`, tone: reached ? 'good' : undefined },
          { label: t('Copper skin, × model'), value: `× ${n(e.skin)}` },
          { label: t('Volume if solid, × model'), value: `× ${n(e.volume)}` },
        ]}
      />
      <p className="lab__note">{t('Gold ticks: Bartholdi’s models of 1.25, 2.85 and 11 m and the statue, 46 m from base to torch. Simplified: the shape stays the same at every size.')}</p>
    </div>
  );
}
