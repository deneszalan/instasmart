import { useState } from 'react';
import { Btn, C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Places from Wikipedia's coordinates (latitude, longitude). */
export const KSAR_GHILANE: [number, number] = [32.981, 9.636];
export const NDJAMENA: [number, number] = [12.105, 15.045]; // Fort-Lamy in 1943, Chad
export const SABHA: [number, number] = [27.039, 14.426]; // the Fezzan, in Italian Libya
export const TUNIS: [number, number] = [36.806, 10.181];
/** A guess within this share of the straight-line distance counts. */
export const WITHIN = 0.15;

const rad = (d: number) => (d * Math.PI) / 180;
/** Great-circle distance in km. */
export function distanceKm([la1, lo1]: [number, number], [la2, lo2]: [number, number]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
export const STRAIGHT = distanceKm(NDJAMENA, KSAR_GHILANE);
export const VIA_FEZZAN = distanceKm(NDJAMENA, SABHA) + distanceKm(SABHA, KSAR_GHILANE);
export const TO_TUNIS = distanceKm(KSAR_GHILANE, TUNIS);
/** Whether a guess is within WITHIN of the straight-line distance from Chad. */
export const close = (guess: number) => Math.abs(guess - STRAIGHT) <= WITHIN * STRAIGHT;

export default function KsarGhilaneDistance({ onDone }: LabProps) {
  const [guess, setGuess] = useState(800);
  const [shown, setShown] = useState(false);
  useGoal(shown && close(guess), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // a distance scale from 0 to 4,000 km, Chad at the left
    const L = 16, R = w - 16, X = (km: number) => L + (km / 4000) * (R - L), y = h * 0.45;
    line(ctx, L, y, R, y, C.faint, 2);
    for (let km = 0; km <= 4000; km += 1000) {
      line(ctx, X(km), y - 5, X(km), y + 5, C.faint, 1.5);
      if (km % 2000 === 0) label(ctx, `${formatNumber(km)} km`, X(km), y + 14, { size: 9, color: C.faint, align: km === 0 ? 'left' : km === 4000 ? 'right' : 'center' });
    }
    dot(ctx, X(0), y, 6, C.cool);
    label(ctx, t('Fort-Lamy, Chad'), L, y - 16, { size: 11, color: C.cool, align: 'left' });
    if (shown) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(STRAIGHT), y); ctx.stroke();
      dot(ctx, X(STRAIGHT), y, 6, C.bad);
      label(ctx, 'Ksar Ghilane', X(STRAIGHT), y - 16, { size: 11, color: C.ink });
      line(ctx, X(0), y + 42, X(VIA_FEZZAN), y + 42, C.cool, 2, [4, 4]);
      label(ctx, t('via the Fezzan (Sabha)'), X(VIA_FEZZAN) + 4, y + 42, { size: 9, color: C.cool, align: 'left' });
    }
    // your guess, below the scale
    ctx.fillStyle = close(guess) && shown ? C.good : C.accent;
    ctx.beginPath(); ctx.moveTo(X(guess), y + 4); ctx.lineTo(X(guess) - 6, y + 14); ctx.lineTo(X(guess) + 6, y + 14); ctx.closePath(); ctx.fill();
    label(ctx, t('your guess, km'), X(guess), y + 26, { size: 10, color: C.accent, align: X(guess) > w - 60 ? 'right' : X(guess) < 60 ? 'left' : 'center' });
    label(ctx, t('Straight-line distances on the globe; desert tracks were longer'), w / 2, h - 4, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A distance scale from Chad to Ksar Ghilane; your guess is {g} km', { g: formatNumber(guess) })} />
      <Range label={t('Your guess: Chad to the oasis (km)')} value={guess} min={200} max={4000} step={50} onChange={(v) => { setGuess(Math.round(v)); setShown(false); }} format={(v) => `${formatNumber(v)} km`} />
      <Btn onClick={() => setShown(true)}>{t('Measure the distance')}</Btn>
      <Readouts
        items={[
          { label: t('Straight line from Chad'), value: shown ? `${formatNumber(Math.round(STRAIGHT / 10) * 10)} km` : '?', tone: shown ? (close(guess) ? 'good' : 'bad') : undefined },
          { label: t('Via the Fezzan'), value: shown ? `${formatNumber(Math.round(VIA_FEZZAN / 10) * 10)} km` : '?' },
        ]}
      />
    </div>
  );
}
