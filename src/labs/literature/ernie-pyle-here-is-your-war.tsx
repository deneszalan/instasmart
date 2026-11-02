import { useState } from 'react';
import { C, dot, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Places Ernie Pyle reported from in Here Is Your War (1943), in the order of the book, with their coordinates. */
export const PLACES = [
  { id: 'sbeitla', name: 'Sbeitla', lat: 35.23, lon: 9.13 },
  { id: 'feriana', name: 'Fériana', lat: 34.95, lon: 8.57 },
  { id: 'gafsa', name: 'Gafsa', lat: 34.42, lon: 8.78 },
  { id: 'mateur', name: 'Mateur', lat: 37.04, lon: 9.67 },
  { id: 'bizerte', name: 'Bizerte', lat: 37.27, lon: 9.87 },
] as const;
export type PlaceId = (typeof PLACES)[number]['id'];
/** A tap this close to the real place counts, or within 24 screen pixels on a small map. */
export const TOLERANCE_KM = 20;
export const toleranceKm = (pxPerKm: number) => Math.max(TOLERANCE_KM, 24 / pxPerKm);

/** Great-circle distance in kilometres between two points given in degrees. */
export function kmBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = Math.PI / 180, R = 6371;
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function what(id: PlaceId): string {
  if (id === 'sbeitla') return t('Sbeitla, February 1943: he camps in a cactus patch, then leaves in the American retreat.');
  if (id === 'feriana') return t('Fériana: a little country hotel where correspondents ate, until the Germans came.');
  if (id === 'gafsa') return t('Gafsa, March 1943: retaken in the south, its homes looted and smashed.');
  if (id === 'mateur') return t('Before Mateur, April–May 1943: with the 1st Infantry Division in the hills.');
  return t('Bizerte, May 1943: after months of bombing, the most wrecked city he had seen.');
}

// a schematic outline of Tunisia, [latitude, longitude]
const OUTLINE: [number, number][] = [[36.95, 8.76], [37.23, 9.22], [37.27, 9.87], [37.17, 10.2], [36.8, 10.18], [36.9, 10.4], [37.08, 11.04], [36.85, 11.1], [36.4, 10.62], [35.83, 10.64], [35.77, 10.83], [35.5, 11.07], [35.24, 11.11], [34.74, 10.76], [34.4, 10.35], [33.88, 10.1], [33.7, 10.4], [33.5, 11.11], [33.17, 11.57], [32.8, 11.5], [32.6, 11.1], [32.8, 10.4], [33.2, 9.7], [33.4, 8.6], [33.6, 7.8], [34.0, 7.9], [34.6, 8.25], [35.3, 8.3], [36.0, 8.35], [36.6, 8.35]];
const BOX = { lat0: 34.15, lat1: 37.45, lon0: 7.9, lon1: 11.2 };
const KM_LAT = 111.2, KM_LON = 111.2 * Math.cos((35.4 * Math.PI) / 180);
const PENCIL = '#c8553d';

export default function PyleTunisia({ onDone }: LabProps) {
  const [placed, setPlaced] = useState<PlaceId[]>([]);
  const [tap, setTap] = useState<{ lat: number; lon: number } | null>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const next = PLACES.find((p) => !placed.includes(p.id));
  useGoal(!next, onDone);

  const frame = (w: number, h: number) => {
    const wk = (BOX.lon1 - BOX.lon0) * KM_LON, hk = (BOX.lat1 - BOX.lat0) * KM_LAT;
    const s = Math.min((w - 8) / wk, (h - 8) / hk);
    return { s, ox: (w - wk * s) / 2, oy: (h - hk * s) / 2 };
  };
  const toXY = (lat: number, lon: number, w: number, h: number): [number, number] => {
    const { s, ox, oy } = frame(w, h);
    return [ox + (lon - BOX.lon0) * KM_LON * s, oy + (BOX.lat1 - lat) * KM_LAT * s];
  };
  const toLL = (x: number, y: number, w: number, h: number) => {
    const { s, ox, oy } = frame(w, h);
    return { lat: BOX.lat1 - (y - oy) / s / KM_LAT, lon: BOX.lon0 + (x - ox) / s / KM_LON };
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'up' || !next) return;
    const ll = toLL(p.x, p.y, size.w, size.h);
    setTap(ll);
    if (kmBetween(ll.lat, ll.lon, next.lat, next.lon) <= toleranceKm(frame(size.w, size.h).s)) { setPlaced((s) => [...s, next.id]); setTap(null); }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (w !== size.w || h !== size.h) queueMicrotask(() => setSize({ w, h }));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    ctx.fillStyle = 'rgba(239,232,214,0.16)'; ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); OUTLINE.forEach(([la, lo], i) => { const [x, y] = toXY(la, lo, w, h); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    const fs = Math.max(10, Math.min(13, w / 28));
    const [tx, ty] = toXY(36.8, 10.18, w, h); dot(ctx, tx, ty, 3, C.soft); label(ctx, 'Tunis', tx + 5, ty + 9, { size: fs - 1, color: C.soft, align: 'left' });
    for (const p of PLACES) {
      if (!placed.includes(p.id)) continue;
      const [x, y] = toXY(p.lat, p.lon, w, h);
      dot(ctx, x, y, 5, PENCIL);
      label(ctx, p.name, x - 7, y, { size: fs, color: C.ink, align: 'right' });
    }
    if (tap && next) {
      const [x, y] = toXY(tap.lat, tap.lon, w, h);
      ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke();
    }
    label(ctx, t('Schematic map of northern and central Tunisia'), w / 2, h - 8, { size: fs - 2, color: C.faint });
  };

  const off = tap && next ? kmBetween(tap.lat, tap.lon, next.lat, next.lon) : null;
  const lastPlaced = placed.length ? PLACES.find((p) => p.id === placed[placed.length - 1]) : null;
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Schematic map of Tunisia: tap where each place of Ernie Pyle’s book lies')} />
      <Readouts
        items={[
          { label: t('Tap the map for'), value: next ? next.name : t('all five placed'), tone: next ? 'accent' : 'good' },
          { label: t('Your last tap'), value: off === null ? '–' : t('{km} km away', { km: formatNumber(Math.round(off)) }), tone: off !== null && off > toleranceKm(frame(size.w, size.h).s) ? 'bad' : undefined },
          { label: t('Places found'), value: t('{n} of {total} places', { n: formatNumber(placed.length), total: formatNumber(PLACES.length) }) },
        ]}
      />
      <p className="lab__note">{lastPlaced ? what(lastPlaced.id) : t('Places from Ernie Pyle’s Here Is Your War (1943), in the order of the book. A tap within 20 km counts, more on a small screen.')}</p>
    </div>
  );
}
