import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Pantheon in metres: interior radius (43.3 m across, the drum as high as the radius), oculus radius (30 Roman feet across), doorway height (40 Roman feet), drum wall. */
export const R = 43.3 / 2;
export const RO = (30 * 0.296) / 2;
export const DOOR = 40 * 0.296;
const WALL = 6.4;
/** Rome's latitude and Earth's tilt, in degrees. */
export const LAT = 41.9;
const TILT = 23.44;
/** Where the oculus cuts the inner sphere. */
const YRIM = R + Math.sqrt(R * R - RO * RO);
const RAD = Math.PI / 180;

/** The Sun's declination on day n of the year (1 = 1 January), a standard approximation. */
export const declination = (n: number) => TILT * Math.sin((2 * Math.PI * (284 + n)) / 365);
/** The Sun's height above the horizon at local noon in Rome, in degrees. */
export const noonAltitude = (n: number) => 90 - LAT + declination(n);

export type Surface = 'floor' | 'wall' | 'dome';
export interface Hit {
  surface: Surface;
  x: number;
  y: number;
  /** Distance along the north half of the inside: floor 0…R from the centre, wall R…2R, then the dome. */
  u: number;
}

/** Where a ray that enters the oculus at x0 (metres north of its centre) meets the inside, with the Sun at alt°. */
export function hit(x0: number, alt: number): Hit {
  const c = Math.cos(alt * RAD), s = Math.sin(alt * RAD);
  const b = YRIM - R, p = x0 * c - b * s;
  const k = -p + Math.sqrt(p * p - (x0 * x0 + b * b - R * R));
  const x = x0 + k * c, y = YRIM - k * s;
  if (y >= R) return { surface: 'dome', x, y, u: 2 * R + R * Math.atan2(y - R, x) };
  const yw = YRIM - ((R - x0) / c) * s;
  if (yw >= 0) return { surface: 'wall', x: R, y: yw, u: R + yw };
  const xf = x0 + (YRIM / s) * c;
  return { surface: 'floor', x: xf, y: 0, u: xf };
}

/** The lit stretch of the north side at noon: from the ray through the oculus's south edge to the one through its north edge. */
export function litStretch(alt: number): [number, number] {
  const a = hit(-RO, alt).u, b = hit(RO, alt).u;
  return [Math.min(a, b), Math.max(a, b)];
}

/** True when the noon light covers the whole doorway, from the floor to the top of the door. */
export function doorwayLit(alt: number) {
  const [u0, u1] = litStretch(alt);
  return u0 <= R && u1 >= R + DOOR;
}

export type Place = 'dome' | 'domeBase' | 'wall' | 'doorway' | 'floorWall' | 'floor';
export function placeOf(alt: number): Place {
  const [u0, u1] = litStretch(alt);
  if (doorwayLit(alt)) return 'doorway';
  if (u0 >= 2 * R) return 'dome';
  if (u1 > 2 * R) return 'domeBase';
  if (u0 >= R) return 'wall';
  if (u1 > R) return 'floorWall';
  return 'floor';
}

function placeName(p: Place) {
  switch (p) {
    case 'dome': return t('the dome’s coffers');
    case 'domeBase': return t('the dome’s base');
    case 'wall': return t('the wall over the door');
    case 'doorway': return t('the whole doorway');
    case 'floorWall': return t('floor and door');
    case 'floor': return t('the floor by the door');
  }
}

const MONTHS = () => [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'), t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')];
const LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Day n of a 365-day year as day and month. */
export function dayMonth(n: number): [number, number] {
  let d = n - 1;
  for (let m = 0; m < 12; m++) {
    if (d < LEN[m]) return [d + 1, m];
    d -= LEN[m];
  }
  return [31, 11];
}

export default function PantheonNoonSunbeam({ onDone }: LabProps) {
  const [day, setDay] = useState(355);
  const alt = noonAltitude(day);
  const lit = doorwayLit(alt);
  useGoal(lit, onDone);
  const [dd, mm] = dayMonth(day);
  const date = t('{d} {m}', { d: dd, m: MONTHS()[mm] });
  const place = placeName(placeOf(alt));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min((w - 16) / (2 * R + 2 * WALL), (h - 30) / (2 * R + 6));
    const cx = w / 2, fy = h - 20;
    const X = (m: number) => cx + m * s, Y = (m: number) => fy - m * s;
    const a1 = Math.PI * 1.5 - Math.asin(RO / R), a2 = Math.PI * 1.5 + Math.asin(RO / R);
    // walls and dome, cut through
    ctx.fillStyle = 'rgba(185,166,139,0.55)';
    ctx.fillRect(X(-R - WALL), Y(R + 4), WALL * s, (R + 4) * s);
    ctx.fillRect(X(R), Y(R + 4), WALL * s, (R + 4) * s);
    ctx.beginPath();
    ctx.arc(X(0), Y(R), (R + WALL * 0.8) * s, Math.PI, 0);
    ctx.lineTo(X(R), Y(R));
    ctx.arc(X(0), Y(R), R * s, 0, a2, true);
    ctx.lineTo(X(-RO), Y(YRIM));
    ctx.arc(X(0), Y(R), R * s, a1, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    // the doorway in the north wall
    ctx.fillStyle = lit ? 'rgba(253,224,71,0.85)' : 'rgba(91,70,48,0.9)';
    ctx.fillRect(X(R), Y(DOOR), WALL * s, DOOR * s);
    line(ctx, X(-R - WALL), fy, X(R + WALL), fy, C.soft, 1.5);
    // the base of the dome
    line(ctx, X(-R), Y(R), X(R), Y(R), C.line, 1, [4, 4]);
    // the beam: between the rays through the two edges of the oculus
    const lo = hit(-RO, alt), hi = hit(RO, alt);
    const [u0, u1] = litStretch(alt);
    const along = (u: number): [number, number] => {
      if (u <= R) return [u, 0];
      if (u <= 2 * R) return [R, u - R];
      const th = (u - 2 * R) / R;
      return [R * Math.cos(th), R + R * Math.sin(th)];
    };
    ctx.fillStyle = 'rgba(253,224,71,0.18)';
    ctx.beginPath();
    ctx.moveTo(X(-RO), Y(YRIM));
    ctx.lineTo(X(RO), Y(YRIM));
    ctx.lineTo(X(hi.x), Y(hi.y));
    for (let u = u1; u >= u0; u -= 0.5) {
      const [px, py] = along(u);
      ctx.lineTo(X(px), Y(py));
    }
    ctx.lineTo(X(lo.x), Y(lo.y));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let u = u0; u <= u1; u += 0.25) {
      const [px, py] = along(u);
      ctx.lineTo(X(px) - (px >= R - 0.01 && py > 0 ? 2 : 0), Y(py) - (py === 0 ? 2 : 0));
    }
    ctx.stroke();
    // the Sun, to the south
    const c = Math.cos(alt * RAD), sn = Math.sin(alt * RAD), d = Math.min(w * 0.45, (Y(YRIM) - 12) / sn);
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(X(0) - c * d, Y(YRIM) - sn * d, 7, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('S, Sun at noon'), X(-R), fy + 10, { size: 10, color: C.soft });
    label(ctx, t('N, door'), X(R), fy + 10, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The Pantheon at noon on {d}: sunlight falls on {p}', { d: date, p: place })} />
      <Range label={t('Date')} value={day} min={1} max={365} step={1} onChange={(v) => setDay(Math.round(v))} format={() => date} />
      <Readouts
        items={[
          { label: t('Noon Sun height'), value: `${formatNumber(Math.round(alt))}°` },
          { label: t('Noon light falls on'), value: place, tone: 'accent' },
          { label: t('Doorway, 11.8 m high'), value: lit ? t('lit to the floor') : t('not fully lit'), tone: lit ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: local noon in Rome, a section through the door, the oculus as a thin ring.')}</p>
    </div>
  );
}
