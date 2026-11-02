import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** [longitude, latitude], rounded. */
export type LonLat = [number, number];

/** Places in northern Tunisia, rounded coordinates. */
export const PLACES = {
  souk: [8.78, 36.5] as LonLat,
  beja: [9.18, 36.73] as LonLat,
  medjez: [9.61, 36.65] as LonLat,
  tebourba: [9.84, 36.83] as LonLat,
  djedeida: [9.93, 36.83] as LonLat,
  tunis: [10.17, 36.8] as LonLat,
  bizerte: [9.87, 37.27] as LonLat,
};

/** The road of the southern Allied column in November 1942 (CMH Pub 72-12): Souk el Arba, Béja, Medjez el Bab, Tebourba, Djedeida, Tunis. */
export const ROUTE: LonLat[] = [PLACES.souk, PLACES.beja, PLACES.medjez, PLACES.tebourba, PLACES.djedeida, PLACES.tunis];

export interface Field { id: 'aouina' | 'sidiAhmed' | 'souk' | 'bone' | 'youks'; at: LonLat; side: 'axis' | 'allied'; usableInRain: boolean }
/**
 * Airfields in late November 1942 (G. F. Howe, Northwest Africa, CMH 1957): the Axis flew from El Aouina by Tunis and
 * Sidi Ahmed by Bizerte (hard-surfaced, CMH Pub 72-12); the Allies from Souk el Arba (80 miles from Tunis), Bône (135)
 * and Youks-les-Bains (155). In protracted rain, Eisenhower wrote, every Allied field "becomes unusable except the tiny
 * one at Bone" (and Maison Blanche at Algiers, far to the west).
 */
export const FIELDS: Field[] = [
  { id: 'aouina', at: [10.23, 36.85], side: 'axis', usableInRain: true },
  { id: 'sidiAhmed', at: [9.79, 37.25], side: 'axis', usableInRain: true },
  { id: 'souk', at: [8.78, 36.5], side: 'allied', usableInRain: false },
  { id: 'bone', at: [7.72, 36.8], side: 'allied', usableInRain: true },
  { id: 'youks', at: [8.0, 35.38], side: 'allied', usableInRain: false },
];

const R_MILES = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;
/** Great-circle distance in statute miles. */
export function miles([lo1, la1]: LonLat, [lo2, la2]: LonLat): number {
  const a = Math.sin(rad(la2 - la1) / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(rad(lo2 - lo1) / 2) ** 2;
  return 2 * R_MILES * Math.asin(Math.sqrt(a));
}
export const toKm = (mi: number) => mi * 1.609344;

/** Miles along the route from its start to each of its points. */
export const ROUTE_AT = ROUTE.reduce<number[]>((acc, p, i) => [...acc, i ? acc[i - 1] + miles(ROUTE[i - 1], p) : 0], []);
export const ROUTE_LENGTH = ROUTE_AT[ROUTE_AT.length - 1];
/** Where the spearhead is after `d` miles along the route. */
export function along(d: number): LonLat {
  const x = Math.max(0, Math.min(ROUTE_LENGTH, d));
  let i = 1;
  while (i < ROUTE.length - 1 && ROUTE_AT[i] < x) i++;
  const f = (x - ROUTE_AT[i - 1]) / (ROUTE_AT[i] - ROUTE_AT[i - 1] || 1);
  return [ROUTE[i - 1][0] + (ROUTE[i][0] - ROUTE[i - 1][0]) * f, ROUTE[i - 1][1] + (ROUTE[i][1] - ROUTE[i - 1][1]) * f];
}
/** The nearest field of one side that can fly, and how far it is. */
export function nearest(p: LonLat, side: Field['side'], rain: boolean): { field: Field; mi: number } {
  return FIELDS.filter((f) => f.side === side && (!rain || f.usableInRain))
    .map((field) => ({ field, mi: miles(p, field.at) }))
    .reduce((a, b) => (b.mi < a.mi ? b : a));
}
/** Miles along the route to Djedeida, the closest the Allies came to Tunis (28 November 1942). */
export const DJEDEIDA_AT = ROUTE_AT[4];

const AMBER = '#f2a541', LAVENDER = '#b7a3f0';
const FIELD_NAME: Record<Field['id'], string> = { aouina: 'El Aouina', sidiAhmed: 'Sidi Ahmed', souk: 'Souk el Arba', bone: 'Bône', youks: 'Youks-les-Bains' };

export default function RaceForTunis({ onDone }: LabProps) {
  const [d, setD] = useState(0);
  const [rain, setRain] = useState(false);
  const p = along(d);
  const axis = nearest(p, 'axis', rain), allied = nearest(p, 'allied', rain);
  const atDjedeida = Math.abs(d - DJEDEIDA_AT) < 1;
  useGoal(atDjedeida && rain, onDone);

  // Place names stay as they are in every language.
  const fieldName = (f: Field) => FIELD_NAME[f.id];
  const dist = (mi: number) => t('{mi} mi · {km} km', { mi: formatNumber(Math.round(mi)), km: formatNumber(Math.round(toKm(mi))) });

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // schematic map of northern Tunisia, lon 7.6–10.45, lat 36.3–37.4; Youks-les-Bains lies off it to the south
    const lon0 = 7.6, lon1 = 10.45, lat0 = 36.3, lat1 = 37.4, c = Math.cos(rad(36.8));
    const s = Math.min((w - 12) / ((lon1 - lon0) * c), (h - 22) / (lat1 - lat0));
    const ox = (w - (lon1 - lon0) * c * s) / 2, oy = 4, bottom = oy + (lat1 - lat0) * s;
    const P = ([lo, la]: LonLat): [number, number] => [ox + (lo - lon0) * c * s, Math.min(bottom, oy + (lat1 - la) * s)];
    const coast: LonLat[] = [[7.6, 36.89], [7.76, 36.9], [8.44, 36.9], [8.76, 36.96], [9.2, 37.23], [9.85, 37.34], [10.19, 37.17], [10.28, 37.18], [10.29, 36.92], [10.34, 36.73], [10.45, 36.71], [10.45, 36.3], [7.6, 36.3]];
    ctx.fillStyle = 'rgba(163,177,142,0.20)';
    ctx.beginPath(); coast.forEach((q, i) => { const [x, y] = P(q); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill();
    ROUTE.forEach((q, i) => { if (i) { const [a, b] = P(ROUTE[i - 1]), [x, y] = P(q); line(ctx, a, b, x, y, C.faint, 2, [4, 4]); } });
    const [ax, ay] = P(ROUTE[0]), [px, py] = P(p);
    line(ctx, ax, ay, px, py, AMBER, 3);
    const [tx, ty] = P(PLACES.tunis);
    dot(ctx, tx, ty, 3, C.ink); label(ctx, 'Tunis', tx + 4, ty + 10, { size: 10, color: C.ink });
    // airfields; rain-closed ones greyed; the nearest working one of each side joined to the spearhead
    for (const f of FIELDS) {
      const [x, y] = P(f.at), open = !rain || f.usableInRain, col = !open ? C.faint : f.side === 'axis' ? LAVENDER : AMBER;
      dot(ctx, x, y, 4.5, col);
      const name = f.id === 'youks' ? 'Youks ↓' : fieldName(f);
      label(ctx, name, f.id === 'youks' ? x - 6 : x, f.side === 'axis' || f.id === 'youks' ? y - 9 : y + 11, { size: 10, color: col, align: f.id === 'aouina' ? 'left' : f.id === 'youks' ? 'right' : 'center' });
    }
    const seg = (to: Field, mi: number, col: string) => {
      const [x, y] = P(to.at);
      line(ctx, px, py, x, y, col, 2, [5, 4]);
      label(ctx, t('{mi} mi', { mi: formatNumber(Math.round(mi)) }), (px + x) / 2, (py + y) / 2 - 8, { size: 11, color: col });
    };
    seg(axis.field, axis.mi, LAVENDER);
    seg(allied.field, allied.mi, AMBER);
    if (rain) for (let i = 0; i < 70; i++) { const x = (i * 53.3) % (w * 0.62), y = (i * 37.1) % (h - 30); line(ctx, x, y, x - 3, y + 9, 'rgba(143,195,230,0.35)', 1); }
    dot(ctx, px, py, 6, AMBER);
    label(ctx, t('Schematic; straight-line distances; 1 mi = 1.6 km.'), w / 2, h - 7, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Map of northern Tunisia: the Allied spearhead is {d} along the road from Souk el Arba, {tunis} from Tunis', { d: dist(d), tunis: dist(miles(p, PLACES.tunis)) })}
      />
      <Range label={t('Miles from Souk el Arba')} value={d} min={0} max={Math.floor(ROUTE_LENGTH)} step={1} onChange={(v) => setD(Math.round(v))} format={(v) => formatNumber(v)} />
      <Choice label={t('Weather over the airfields')} options={[{ value: 'dry', label: t('Dry weather') }, { value: 'rain', label: t('Winter rain') }]} value={rain ? 'rain' : 'dry'} onChange={(v) => setRain(v === 'rain')} />
      <p className="lab__note">
        <strong>{t('Tunis {a} mi · Axis airfield {b} mi · Allied airfield in use {c} mi', { a: formatNumber(Math.round(miles(p, PLACES.tunis))), b: formatNumber(Math.round(axis.mi)), c: formatNumber(Math.round(allied.mi)) })}</strong>
      </p>
    </div>
  );
}
