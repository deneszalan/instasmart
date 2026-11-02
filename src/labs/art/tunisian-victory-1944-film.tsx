import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Film shot for Tunisian Victory, as Variety reported it (AFI Catalog). */
export const SHOT_FT = 300000;
/** The finished film: 6,871 feet, 76 minutes (Imperial War Museums film record). */
export const FINAL_FT = 6871;
export const FINAL_MIN = 76;
/** 35 mm sound film runs at 24 frames a second, 16 frames to the foot: 90 feet a minute. */
export const FT_PER_MIN = (24 * 60) / 16;
export const FT_TO_M = 0.3048;

/** Feet of film in a running time. */
export const feetFor = (min: number) => min * FT_PER_MIN;
/** How many feet were shot for every foot kept. */
export const ratio = (keptFt: number) => SHOT_FT / keptFt;
/** Hours of footage in a length of film. */
export const hoursOf = (ft: number) => ft / FT_PER_MIN / 60;

const BRASS = '#d4a24c', STEEL = '#7fa7c9';

export default function CuttingRoom({ onDone }: LabProps) {
  const [min, setMin] = useState(20);
  const kept = feetFor(min), r = ratio(kept);
  useGoal(min === FINAL_MIN, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // all the film shot, as a long bar of frames; the kept share in brass
    const n = 60, gap = 2, fw = (w - 16 - gap * (n - 1)) / n, y0 = h * 0.18, fh = h * 0.2;
    const keptFrames = Math.max(1, Math.round(n / r));
    for (let i = 0; i < n; i++) {
      const x = 8 + i * (fw + gap);
      ctx.fillStyle = i < keptFrames ? BRASS : 'rgba(255,255,255,0.14)';
      ctx.fillRect(x, y0, fw, fh);
    }
    label(ctx, t('All the film shot: {h} hours', { h: formatNumber(Math.round(hoursOf(SHOT_FT) * 10) / 10) }), w / 2, y0 - 12, { size: 11, color: C.soft });
    label(ctx, t('Kept: about {n} of these {total} squares', { n: formatNumber(Math.round((n / r) * 10) / 10), total: formatNumber(n) }), w / 2, y0 + fh + 14, { size: 11, color: BRASS });
    // a reel for the finished film, growing with its length
    const rr = Math.min(h * 0.22, 14 + Math.sqrt(kept) * 0.9);
    const cx = w / 2, cy = h * 0.72;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = min === FINAL_MIN ? STEEL : BRASS; ctx.lineWidth = 3; ctx.stroke();
    label(ctx, t('{min} min = {ft} ft', { min: formatNumber(min), ft: formatNumber(Math.round(kept)) }), cx, cy, { size: 12, color: C.ink });
    label(ctx, t('Variety’s figure for footage shot; 90 feet of 35 mm film a minute.'), w / 2, h - 8, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The cutting room: {min} minutes kept from {h} hours of film shot', { min: formatNumber(min), h: formatNumber(Math.round(hoursOf(SHOT_FT))) })} />
      <Range label={t('Final cut, minutes')} value={min} min={10} max={120} step={1} onChange={(v) => setMin(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Film kept'), value: t('{ft} ft ({m} m)', { ft: formatNumber(Math.round(kept)), m: formatNumber(Math.round(kept * FT_TO_M)) }) },
          { label: t('Feet shot for each foot kept'), value: formatNumber(Math.round(r)), tone: min === FINAL_MIN ? 'good' : 'accent' },
        ]}
      />
    </div>
  );
}
