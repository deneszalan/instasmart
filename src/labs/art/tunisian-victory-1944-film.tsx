import { useState } from 'react';
import { C, clamp, font, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
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
    // the note along the bottom, smaller on a narrow phone so it stays on one line
    const note = t('Variety’s figure for footage shot; 90 feet of 35 mm film a minute.');
    font(ctx, 9);
    const ns = clamp((9 * (w - 8)) / ctx.measureText(note).width, 7, 9), noteTop = h - 4 - ns * 1.2;
    label(ctx, note, w / 2, h - 4 - ns * 0.6, { size: ns, color: C.faint });
    // all the film shot, as a long bar of frames; the kept share in brass
    const n = 60, gap = 2, fw = (w - 16 - gap * (n - 1)) / n, y0 = 24, fh = clamp(h * 0.14, 10, 24);
    const keptFrames = Math.max(1, Math.round(n / r));
    for (let i = 0; i < n; i++) {
      const x = 8 + i * (fw + gap);
      ctx.fillStyle = i < keptFrames ? BRASS : 'rgba(255,255,255,0.14)';
      ctx.fillRect(x, y0, fw, fh);
    }
    label(ctx, t('All the film shot: {h} hours', { h: formatNumber(Math.round(hoursOf(SHOT_FT) * 10) / 10) }), w / 2, y0 - 11, { size: 11, color: C.soft });
    label(ctx, t('Kept: about {n} of these {total} squares', { n: formatNumber(Math.round((n / r) * 10) / 10), total: formatNumber(n) }), w / 2, y0 + fh + 12, { size: 11, color: BRASS });
    // a reel for the finished film, growing with its length, in the room between the squares' label and the note
    const top = y0 + fh + 22, room = noteTop - 4 - top;
    const rr = Math.max(6, Math.min(room / 2 - 2, 14 + Math.sqrt(kept) * 0.9)), cy = top + room / 2;
    // its length inside the reel when it fits there, else beside it, the two centred together
    const text = t('{min} min = {ft} ft', { min: formatNumber(min), ft: formatNumber(Math.round(kept)) });
    font(ctx, 12);
    const tw = ctx.measureText(text).width, inside = tw + 16 <= 2 * rr;
    const cx = inside ? w / 2 : Math.max(rr + 6, (w - (2 * rr + 10 + tw)) / 2 + rr);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = min === FINAL_MIN ? STEEL : BRASS; ctx.lineWidth = 3; ctx.stroke();
    label(ctx, text, inside ? cx : cx + rr + 10, cy, { size: 12, color: C.ink, align: inside ? 'center' : 'left' });
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
