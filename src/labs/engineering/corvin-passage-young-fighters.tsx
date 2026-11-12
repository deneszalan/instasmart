import { useRef, useState } from 'react';
import { Btn, C, label, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Where the armed groups of Budapest held out in October 1956 (1956 Institute, rev.hu; UN Special Committee report,
 * 1957): the reader finds five places on a schematic map of the city, one after another. Positions from the places'
 * coordinates; the Danube is simplified.
 */
export type PlaceId = 'corvin' | 'szena' | 'baross' | 'moricz' | 'csepel';
export const PLACES: { id: PlaceId; lon: number; lat: number }[] = [
  { id: 'corvin', lon: 19.0716, lat: 47.4855 },
  { id: 'szena', lon: 19.0265, lat: 47.5085 },
  { id: 'baross', lon: 19.0838, lat: 47.5003 },
  { id: 'moricz', lon: 19.0468, lat: 47.4772 },
  { id: 'csepel', lon: 19.075, lat: 47.43 },
];
/** The Danube's main channel through the city, north to south (simplified), and the small branch east of Csepel Island. */
export const DANUBE: [number, number][] = [[19.055, 47.56], [19.048, 47.535], [19.045, 47.515], [19.046, 47.497], [19.051, 47.487], [19.06, 47.478], [19.068, 47.462], [19.066, 47.448], [19.052, 47.433], [19.04, 47.415], [19.032, 47.4]];
export const BRANCH: [number, number][] = [[19.068, 47.455], [19.088, 47.44], [19.1, 47.425], [19.11, 47.405]];
const BOX = { lon0: 18.99, lon1: 19.14, lat0: 47.395, lat1: 47.55 };

/** A point on a stage of w × h pixels; one degree of longitude is about 0.68 of one of latitude here. */
export function project(lon: number, lat: number, w: number, h: number): [number, number] {
  const sx = w / ((BOX.lon1 - BOX.lon0) * 0.68), sy = h / (BOX.lat1 - BOX.lat0), s = Math.min(sx, sy);
  const ox = (w - (BOX.lon1 - BOX.lon0) * 0.68 * s) / 2, oy = (h - (BOX.lat1 - BOX.lat0) * s) / 2;
  return [ox + (lon - BOX.lon0) * 0.68 * s, oy + (BOX.lat1 - lat) * s];
}
/** The main channel's longitude at a latitude, by straight lines between its points. */
export function danubeLon(lat: number, line: [number, number][] = DANUBE): number {
  for (let i = 0; i < line.length - 1; i++) {
    const [lo1, la1] = line[i], [lo2, la2] = line[i + 1];
    if ((lat <= la1 && lat >= la2) || (lat >= la1 && lat <= la2)) return lo1 + ((lo2 - lo1) * (lat - la1)) / (la2 - la1);
  }
  return lat > line[0][1] ? line[0][0] : line[line.length - 1][0];
}
/** Buda is west of the river, Pest east; Csepel Island lies between the main channel and the branch. */
export function side(id: PlaceId): 'buda' | 'pest' | 'island' {
  const p = PLACES.find((x) => x.id === id)!;
  if (p.lon < danubeLon(p.lat)) return 'buda';
  return p.lat < BRANCH[0][1] && p.lon < danubeLon(p.lat, BRANCH) ? 'island' : 'pest';
}
/** The place nearest a tap, if one is within `r` pixels. */
export function nearest(x: number, y: number, w: number, h: number, r = 26): PlaceId | null {
  let best: PlaceId | null = null, bd = r;
  for (const p of PLACES) {
    const [px, py] = project(p.lon, p.lat, w, h), d = Math.hypot(px - x, py - y);
    if (d <= bd) { bd = d; best = p.id; }
  }
  return best;
}

const AMBER = '#eab04c', RIVER = '#3a6286';
const NAMES: Record<PlaceId, string> = { corvin: 'Corvin köz', szena: 'Széna tér', baross: 'Baross tér', moricz: 'Móricz Zsigmond körtér', csepel: 'Csepel' };

export default function CorvinMap({ onDone }: LabProps) {
  const [found, setFound] = useState<PlaceId[]>([]);
  const [miss, setMiss] = useState<PlaceId | null>(null);
  const size = useRef({ w: 300, h: 200 });
  const target = PLACES.find((p) => !found.includes(p.id))?.id;
  useGoal(found.length === PLACES.length, onDone);

  // Place names stay as they are in every language.
  const name = (id: PlaceId) => NAMES[id];
  const where = (id: PlaceId) =>
    id === 'corvin' ? t('8th district, Pest: the biggest stronghold')
    : id === 'szena' ? t('2nd district, Buda: János Szabó’s group')
    : id === 'baross' ? t('By the Eastern Railway Station, Pest')
    : id === 'moricz' ? t('11th district, Buda: a round square')
    : t('The factory island in the south: workers and soldiers together');

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down' || !target) return;
    const hit = nearest(p.x, p.y, size.current.w, size.current.h);
    if (hit === target) { setFound([...found, hit]); setMiss(null); }
    else if (hit) setMiss(hit);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    const river = (pts: [number, number][], width: number) => {
      ctx.strokeStyle = RIVER; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = project(lo, la, w, h); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
    };
    river(DANUBE, Math.max(8, w * 0.03)); river(BRANCH, Math.max(4, w * 0.012));
    label(ctx, 'Buda', w * 0.14, h * 0.22, { size: 13, color: C.soft });
    label(ctx, 'Pest', w * 0.84, h * 0.22, { size: 13, color: C.soft });
    for (const p of PLACES) {
      const [x, y] = project(p.lon, p.lat, w, h), ok = found.includes(p.id), wrong = miss === p.id;
      ctx.fillStyle = ok ? AMBER : wrong ? C.bad : 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(x, y, ok ? 7 : 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ok ? AMBER : 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
      if (ok) label(ctx, name(p.id), x < w / 2 ? x - 16 : x + 16, y, { size: 10, color: AMBER, align: x < w / 2 ? 'right' : 'left' });
    }
    label(ctx, t('Schematic map of Budapest'), 8, h - 10, { size: 9, color: C.faint, align: 'left' });
  };

  const last = found[found.length - 1];
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A schematic map of Budapest with five places of the 1956 fighting: {n} of {total} found', { n: formatNumber(found.length), total: formatNumber(PLACES.length) })} />
      <p className="lab__note">
        {target ? <>{t('Tap the place:')} <strong>{name(target)}</strong>{miss ? ` · ${t('Not that one.')}` : last ? ` · ${where(last)}` : ''}</> : where(last!)}
      </p>
      {!target && <Btn ghost onClick={() => { setFound([]); setMiss(null); }}>{t('Find the places again')}</Btn>}
    </div>
  );
}
