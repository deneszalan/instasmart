import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Place = 'mareth' | 'medenine' | 'toujane' | 'gabes';
/** The Mareth Line museum and the places around it, from Wikipedia's coordinates (latitude, longitude). */
export const MUSEUM: [number, number] = [33.6178, 10.2861];
export const PLACES: Record<Place, [number, number]> = {
  mareth: [33.633, 10.3],
  medenine: [33.355, 10.505],
  toujane: [33.467, 10.133],
  gabes: [33.883, 10.117],
};
export const ORDER: Place[] = ['mareth', 'medenine', 'toujane', 'gabes'];
/** How close the heading must be to a place's bearing to count as facing it, in degrees. */
export const TOL = 10;

const rad = (d: number) => (d * Math.PI) / 180;
/** Initial great-circle bearing from a to b, in degrees clockwise from north. */
export function bearing([la1, lo1]: [number, number], [la2, lo2]: [number, number]) {
  const y = Math.sin(rad(lo2 - lo1)) * Math.cos(rad(la2));
  const x = Math.cos(rad(la1)) * Math.sin(rad(la2)) - Math.sin(rad(la1)) * Math.cos(rad(la2)) * Math.cos(rad(lo2 - lo1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
/** Great-circle distance in km. */
export function distanceKm([la1, lo1]: [number, number], [la2, lo2]: [number, number]) {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
/** The smallest angle between two headings, 0–180°. */
export const angleGap = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
/** The place the heading points at, if any. */
export const facing = (heading: number): Place | null => ORDER.find((p) => angleGap(heading, bearing(MUSEUM, PLACES[p])) <= TOL) ?? null;

const COLOUR: Record<Place, string> = { mareth: C.ink, medenine: '#9bd18b', toujane: '#f0b44c', gabes: C.cool };
function placeName(p: Place) {
  if (p === 'mareth') return t('Mareth town');
  if (p === 'medenine') return t('Medenine, toward Libya');
  if (p === 'toujane') return t('Toujane, in the Matmata hills');
  return t('Gabès, behind the line');
}

export default function MarethCompass({ onDone }: LabProps) {
  const [heading, setHeading] = useState(90);
  const [found, setFound] = useState<Place[]>([]);
  const now = facing(heading);
  useGoal(found.length === ORDER.length, onDone);

  const turn = (v: number) => {
    const h = Math.round(v) % 360;
    setHeading(h);
    const p = facing(h);
    if (p && !found.includes(p)) setFound([...found, p]);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) / 2 - 26;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (let d = 0; d < 360; d += 30) {
      const a = rad(d - 90);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8)); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    ([['N', 0], ['90°', 90], ['180°', 180], ['270°', 270]] as [string, number][]).forEach(([n, d]) => {
      const a = rad(d - 90);
      label(ctx, n, cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14), { size: 12, color: C.soft });
    });
    // places already found
    for (const p of found) {
      const b = bearing(MUSEUM, PLACES[p]), a = rad(b - 90);
      ctx.strokeStyle = COLOUR[p]; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92); ctx.stroke();
      const lx = cx + Math.cos(a) * R * 0.6, ly = cy + Math.sin(a) * R * 0.6;
      label(ctx, `${formatNumber(Math.round(distanceKm(MUSEUM, PLACES[p])))} km`, lx, ly - 8, { size: 11, color: COLOUR[p] });
    }
    // the reader's heading
    const a = rad(heading - 90);
    ctx.strokeStyle = now ? C.good : C.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    label(ctx, t('You, on the museum’s hill'), cx, cy + 20, { size: 11, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A compass on the Mareth museum’s hill, facing {deg} degrees; {n} of {total} places found', { deg: formatNumber(heading), n: formatNumber(found.length), total: formatNumber(ORDER.length) })} />
      <Range label={t('Facing (degrees from north)')} value={heading} min={0} max={359} step={1} onChange={turn} format={(v) => `${formatNumber(v)}°`} />
      <Readouts
        items={[
          { label: t('Lined up with'), value: now ? `${placeName(now)} · ${formatNumber(Math.round(bearing(MUSEUM, PLACES[now])))}°` : '–', tone: now ? 'good' : undefined },
          { label: t('Places found'), value: t('{n} of {total}', { n: formatNumber(found.length), total: formatNumber(ORDER.length) }), tone: found.length === ORDER.length ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: straight lines from the museum, within 10°.')}</p>
    </div>
  );
}
