import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber, withUnit } from '../../lib/format';

/** The model: latitude 52° N, near the UK's shearwater colonies, on midsummer's day (the Sun's declination 23.44°). */
export const LAT = 52, DEC = 23.44;
/** The largest compass error the 2026 study in Science found in Manx shearwaters' homeward flights: 15°. */
export const GOAL = 15;
const R = Math.PI / 180;

/** The Sun's compass direction in degrees from north, clockwise, at sun time `hrs` (hours after midnight). */
export function azimuth(hrs: number, lat = LAT, dec = DEC): number {
  const h = (hrs - 12) * 15 * R, p = lat * R, d = dec * R;
  const a = Math.atan2(-Math.sin(h), Math.tan(d) * Math.cos(p) - Math.sin(p) * Math.cos(h)) / R;
  return (a + 360) % 360;
}

/** Kilometres in one degree of longitude at latitude `lat`. */
export const kmPerDegree = (lat = LAT) => 111.32 * Math.cos(lat * R);

/** How many minutes later the sun time is after flying `km` due east (negative: west). The Earth turns 15° an hour. */
export const shiftMinutes = (km: number, lat = LAT) => (km / kmPerDegree(lat)) * 4;

/**
 * The compass error, in degrees clockwise, of a bird whose body clock reads `bodyHrs` but which has flown `km`
 * east since its clock was set: it expects the Sun where it stands at `bodyHrs`, finds it where it stands at the
 * local sun time, and, keeping its usual angle to the Sun, turns its heading by the difference.
 */
export const compassError = (bodyHrs: number, km: number, lat = LAT) => azimuth(bodyHrs + shiftMinutes(km, lat) / 60, lat) - azimuth(bodyHrs, lat);

/** A time of day as 14:05. */
export const clock = (hrs: number) => {
  const m = Math.round(hrs * 60);
  return `${Math.floor(m / 60) % 24}:${String(((m % 60) + 60) % 60).padStart(2, '0')}`;
};

const GOLD = '#ffc45c', LILAC = '#c3b1ff', CORAL = '#ff7a5c', FOAM = '#9fe3d6';
/** The direction home in the drawing: east. */
const HOME = 90;

export default function ShearwaterJetLag({ onDone }: LabProps) {
  const [km, setKm] = useState(0);
  const [body, setBody] = useState(10);
  const shift = shiftMinutes(km), err = compassError(body, km);
  const reached = Math.round(Math.abs(err)) >= GOAL;
  useGoal(reached, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: a compass ring seen from above, north up
    const r = Math.max(24, Math.min((h - 30) / 2, w * 0.24)), cx = 14 + r, cy = h / 2 + 4;
    const at = (az: number, rr: number) => [cx + rr * Math.sin(az * R), cy - rr * Math.cos(az * R)] as const;
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // north is N in English and German alike
    label(ctx, 'N', cx, cy - r - 8, { size: 10, color: C.soft });
    // the Sun's path through the day, dawn to dusk
    ctx.strokeStyle = 'rgba(255,196,92,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const [x, y] = at(azimuth(4 + (i / 80) * 16), r - 8);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
    // where the body clock expects the Sun, and where it is
    const [gx, gy] = at(azimuth(body), r - 8), [sx, sy] = at(azimuth(body + shift / 60), r - 8);
    const ghost = (x: number, y: number) => {
      ctx.strokeStyle = LILAC;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    ghost(gx, gy);
    dot(ctx, sx, sy, 6, GOLD);
    // intended and actual headings
    const [hx, hy] = at(HOME, r * 0.8), [ax, ay] = at(HOME + err, r * 0.8);
    line(ctx, cx, cy, hx, hy, FOAM, 2, [5, 4]);
    line(ctx, cx, cy, ax, ay, Math.abs(err) < 0.5 ? FOAM : CORAL, 3);
    dot(ctx, cx, cy, 4, C.ink);
    // right: the key, then the flight east or west
    const x0 = cx + r + 26, x1 = w - 14, rows = [cy - r * 0.8, cy - r * 0.8 + 18, cy - r * 0.8 + 36];
    ghost(x0 + 6, rows[0]);
    label(ctx, t('Sun as the clock expects'), x0 + 20, rows[0], { size: 10, align: 'left', color: LILAC });
    dot(ctx, x0 + 6, rows[1], 6, GOLD);
    label(ctx, t('Sun as it really is'), x0 + 20, rows[1], { size: 10, align: 'left', color: GOLD });
    line(ctx, x0, rows[2], x0 + 13, rows[2], FOAM, 2, [4, 3]);
    label(ctx, t('way home'), x0 + 20, rows[2], { size: 10, align: 'left', color: FOAM });
    const y = cy + r * 0.78, mid = (x0 + x1) / 2, X = (d: number) => mid + (d / 1000) * (x1 - x0) * 0.48;
    line(ctx, x0, y, x1, y, C.line, 2);
    line(ctx, mid, y - 5, mid, y + 5, C.faint, 1.5);
    line(ctx, mid, y, X(km), y, FOAM, 3);
    dot(ctx, X(km), y, 4, FOAM);
    label(ctx, t('west'), x0, y - 11, { size: 9.5, align: 'left', color: C.faint });
    label(ctx, t('east'), x1, y - 11, { size: 9.5, align: 'right', color: C.faint });
  };

  const turnLabel = err < -0.5 ? t('Compass turns anticlockwise') : t('Compass turns clockwise');
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Flown {km} km (east +, west −): the body clock reads {b}, the sun time is {s}, and the sun compass is off by {e}°', {
          km: formatNumber(km),
          b: clock(body),
          s: clock(body + shift / 60),
          e: formatNumber(Math.round(err)),
        })}
      />
      <Range label={t('Flown east (+) or west (−)')} value={km} min={-1000} max={1000} step={50} onChange={setKm} format={(v) => withUnit(v, 'km')} />
      <Range label={t('Time on its body clock')} value={body} min={6} max={18} step={0.25} onChange={setBody} format={clock} />
      <Readouts
        items={[
          { label: t('Sun time where it is'), value: clock(body + shift / 60) },
          { label: t('Sun time ahead of its body clock'), value: t('{n} min', { n: formatNumber(Math.round(shift)) }) },
          { label: turnLabel, value: withUnit(Math.round(Math.abs(err)), '°'), tone: reached ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: latitude 52° N on midsummer’s day, a flight due east or west since sunrise, and a body clock still on the sun time of the place where the bird saw the Sun rise.')}</p>
    </div>
  );
}
