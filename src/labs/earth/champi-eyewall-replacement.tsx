import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** JTWC: Champi's winds fell to 120 knots on 18 October during an eyewall swap; before it, 130 knots. */
export const OLD_KT = 130;
/** The new outer ring, where it forms: an illustration (JTWC saw Champi's outer ring about 30–40 nautical miles out). */
export const START_NM = 40;
export const START_KT = 60;
/**
 * Spin-up of a shrinking ring when it keeps its angular momentum (speed × radius stays the same) and loses none to
 * friction with the sea: halve the radius, double the speed.
 */
export const ringSpeed = (radiusNm: number, startNm = START_NM, startKt = START_KT) => (startKt * startNm) / radiusNm;
/** The largest whole radius at which the new ring beats the old eyewall: 18 nautical miles. */
export const BEATS_AT = Math.floor((START_KT * START_NM) / OLD_KT);
/** How much of the old inner eyewall is left as the outer ring closes in (1 = all, 0 = gone). */
export const innerLeft = (radiusNm: number) => Math.max(0, Math.min(1, (radiusNm - 15) / (START_NM - 15)));

const ICE = '#9fd8f5', WIND = '#ffc857';

export default function ChampiEyewall({ onDone }: LabProps) {
  const [r, setR] = useState(START_NM);
  const v = ringSpeed(r), left = innerLeft(r);
  useGoal(v >= OLD_KT, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.75, cy = h / 2, s = (Math.min(w * 0.5, h) * 0.44) / START_NM;
    const ringAt = (rr: number, width: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(cx, cy, rr * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    // the old inner eyewall at about 12 nautical miles, fading as the new ring closes in
    ringAt(12, 9, '#e9f2f8', 0.15 + 0.85 * left);
    // the new ring
    ringAt(r, 12, ICE, 0.95);
    // wind arrows on the new ring: length grows with speed
    const n = 8, len = Math.min(1.2, v / 160);
    ctx.strokeStyle = WIND;
    ctx.lineWidth = 3;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * s + 12, -a0, -a0 - len * 0.6, true);
      ctx.stroke();
    }
    label(ctx, t('new ring: {v} knots', { v: Math.round(v) }), 10, 14, { size: 13, color: v >= OLD_KT ? C.good : WIND, align: 'left' });
    label(ctx, t('old eyewall: {v} knots', { v: OLD_KT }), 10, h - 10, { size: 11, color: C.soft, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A new ring {r} nautical miles from the centre, with winds of {v} knots', { r, v: Math.round(v) })} />
      <Range label={t('Radius of the new ring')} value={r} min={10} max={START_NM} step={1} onChange={setR} format={(x) => t('{n} nautical miles', { n: x })} />
      <Readouts
        items={[
          { label: t('New ring’s winds'), value: t('{v} knots', { v: Math.round(v) }), tone: v >= OLD_KT ? 'good' : 'accent' },
          { label: t('Old eyewall left'), value: `${Math.round(left * 100)}%` },
        ]}
      />
      <p className="lab__note">{t('Simplified: the ring keeps its spin (speed × radius) and loses none to friction; the starting ring of 60 knots at 40 nautical miles is an illustration.')}</p>
    </div>
  );
}
