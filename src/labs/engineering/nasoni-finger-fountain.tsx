import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A simple model of a nasone. The main holds a pressure head H; the pipe loses R·Q²; water leaves through the open
 * area A at the spout's pressure p, Q = A·√(2gp). Then p/H = 1 / (1 + K·A²), with A in units of the spout's mouth
 * and K = 2gR·(mouth area)² an illustrative pipe resistance, not a measurement.
 */
export const K = 8;
/** The hole on top of the spout's bend, as a share of the mouth's area (illustrative sizes). */
export const HOLES = { small: 0.05, medium: 0.1, large: 0.25 } as const;
export type Hole = keyof typeof HOLES;
/** The jet counts as strong enough once it rises to this share of the main's pressure head. */
export const GOAL = 0.85;

/** The open area at the spout when a finger covers a share `cover` (0–1) of the mouth. */
export const openArea = (cover: number, hole: number) => 1 - cover + hole;
/** The pressure left at the spout, as a share of the main's; the jet from the hole can rise about this high. */
export const spoutPressure = (cover: number, hole: number) => 1 / (1 + K * openArea(cover, hole) ** 2);
/** The water flowing, as a share of the flow with the mouth wide open and the same hole. */
export const flowShare = (cover: number, hole: number) =>
  (openArea(cover, hole) * Math.sqrt(spoutPressure(cover, hole))) / (openArea(0, hole) * Math.sqrt(spoutPressure(0, hole)));

export default function NasoniFinger({ onDone }: LabProps) {
  const [cover, setCover] = useState(0);
  const [hole, setHole] = useState<Hole>('large');
  const a = HOLES[hole], c = cover / 100;
  const p = spoutPressure(c, a), q = flowShare(c, a);
  const strong = p >= GOAL;
  useGoal(strong, onDone);
  const holeName = (h: Hole) => (h === 'small' ? t('small hole') : h === 'medium' ? t('medium hole') : t('large hole'));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const ground = h - 8, pipeY = h * 0.58, hx = w * 0.52, mouthX = w * 0.32, colX = w * 0.76;
    const top = 16, rise = pipeY - 10 - top; // the full pressure head, drawn from the hole up to `top`
    // the column and the spout
    ctx.fillStyle = '#5d7067';
    ctx.fillRect(colX, top + 10, w * 0.14, ground - top - 10);
    ctx.fillRect(mouthX - 8, pipeY - 9, colX - mouthX + 8, 18);
    ctx.fillRect(mouthX - 8, pipeY - 9, 16, 30);
    line(ctx, 0, ground, w, ground, C.faint, 2);
    // the main's pressure, and the goal
    line(ctx, hx - 60, top, hx + 60, top, C.soft, 1.5, [5, 4]);
    label(ctx, t('main’s pressure'), hx - 66, top, { size: 10, align: 'right', color: C.soft });
    const gy = pipeY - 10 - GOAL * rise;
    line(ctx, hx - 60, gy, hx + 60, gy, C.accent, 1.5, [3, 3]);
    label(ctx, `${formatNumber(GOAL * 100)}%`, hx + 64, gy, { size: 10, align: 'left', color: C.accent });
    // the jet from the hole on top, rising about as high as the pressure left at the spout
    ctx.fillStyle = '#0c1412';
    ctx.beginPath();
    ctx.arc(hx, pipeY - 9, 3, 0, Math.PI * 2);
    ctx.fill();
    const jetTop = pipeY - 10 - p * rise;
    ctx.strokeStyle = strong ? C.good : C.cool;
    ctx.lineWidth = 2 + 8 * Math.sqrt(a);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx, pipeY - 10);
    ctx.quadraticCurveTo(hx - 6, jetTop - 4, hx - 16, jetTop + 10);
    ctx.stroke();
    // the stream from the mouth, as wide as the water leaving it
    const mouthFlow = (1 - c) * Math.sqrt(p) / ((1 + a) * Math.sqrt(spoutPressure(0, a)));
    if (mouthFlow > 0.01) {
      ctx.strokeStyle = C.cool;
      ctx.lineWidth = Math.max(1.5, 14 * mouthFlow);
      ctx.beginPath();
      ctx.moveTo(mouthX, pipeY + 22);
      ctx.lineTo(mouthX - 3, ground - 2);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    // the finger, sliding in under the mouth
    if (c > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, c * 5);
      ctx.fillStyle = '#e9b98f';
      ctx.beginPath();
      ctx.roundRect(mouthX - 8 - 90 - 30 * (1 - c) + 16 * c, pipeY + 21, 90, 14, 7);
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A nasone’s spout with a finger over its end and a jet from the hole on top, {p}% of the main’s pressure high', { p: formatNumber(Math.round(p * 100)) })} />
      <Range label={t('Finger over the spout’s end')} value={cover} min={0} max={100} step={1} onChange={setCover} format={(v) => `${formatNumber(v)}%`} />
      <Choice label={t('Size of the hole on top')} value={hole} onChange={setHole} options={(Object.keys(HOLES) as Hole[]).map((x) => ({ value: x, label: holeName(x) }))} />
      <Readouts
        items={[
          { label: t('Pressure left at the spout'), value: `${formatNumber(Math.round(p * 100))}%`, tone: strong ? 'good' : 'accent' },
          { label: t('Water flowing'), value: `${formatNumber(Math.round(q * 100))}%` },
        ]}
      />
      <p className="lab__note">{t('Simple model: the pipe’s resistance and the hole sizes are illustrative, not measured on a real nasone. Shares are of the main’s pressure and of the flow with the end open.')}</p>
    </div>
  );
}
