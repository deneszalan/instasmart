import { useState } from 'react';
import { C, Choice, dot, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Wall = 'tyrrhenian' | 'adriatic';

/** The ridge of the Apennines, simplified, from the Ligurian Alps to the toe of Italy (longitude, latitude). */
export const SPINE: [number, number][] = [[7.6, 44.15], [8.9, 44.55], [9.9, 44.45], [10.9, 44.15], [11.6, 43.85], [12.3, 43.45], [13.0, 42.9], [13.7, 42.25], [14.3, 41.7], [15.0, 41.1], [15.6, 40.5], [16.0, 39.9], [16.2, 39.2], [16.0, 38.4]];

/**
 * Which side of the ridge a place lies on: north and east of it drain to the Adriatic (the Po plain too), south and
 * west to the Ligurian and Tyrrhenian seas. Uses the side of the nearest stretch of the ridge.
 */
export function apennineSide(lon: number, lat: number): Wall {
  let best = Infinity, side: Wall = 'adriatic';
  for (let i = 0; i < SPINE.length - 1; i++) {
    const [ax, ay] = SPINE[i], [bx, by] = SPINE[i + 1], dx = bx - ax, dy = by - ay;
    const u = Math.max(0, Math.min(1, ((lon - ax) * dx + (lat - ay) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(lon - (ax + u * dx), lat - (ay + u * dy));
    if (d < best) {
      best = d;
      side = dx * (lat - ay) - dy * (lon - ax) > 0 ? 'adriatic' : 'tyrrhenian';
    }
  }
  return side;
}

/** Regions of the Gallery of Maps, each with a place inside it and the wall its map is on (Vatican Museums; Wikipedia). */
export const REGIONS: { name: string; place: string; lon: number; lat: number; wall: Wall }[] = [
  { name: 'Latium et Sabina', place: 'Rome', lon: 12.5, lat: 41.9, wall: 'tyrrhenian' },
  { name: 'Pedemontium', place: 'Turin', lon: 7.69, lat: 45.07, wall: 'adriatic' },
  { name: 'Umbria', place: 'Spoleto', lon: 12.74, lat: 42.73, wall: 'tyrrhenian' },
  { name: 'Ager anconitanus', place: 'Ancona', lon: 13.52, lat: 43.62, wall: 'adriatic' },
  { name: 'Liguria', place: 'Genoa', lon: 8.93, lat: 44.41, wall: 'tyrrhenian' },
  { name: 'Mediolanensis ducatus', place: 'Milan', lon: 9.19, lat: 45.46, wall: 'adriatic' },
  { name: 'Etruria', place: 'Florence', lon: 11.25, lat: 43.77, wall: 'tyrrhenian' },
  { name: 'Bononiensis ditio', place: 'Bologna', lon: 11.34, lat: 44.49, wall: 'adriatic' },
  { name: 'Campania', place: 'Naples', lon: 14.25, lat: 40.85, wall: 'tyrrhenian' },
  { name: 'Apulia', place: 'Foggia', lon: 15.55, lat: 41.46, wall: 'adriatic' },
];

const MAINLAND: [number, number][] = [[7.6, 43.79], [8.48, 44.31], [8.93, 44.41], [9.82, 44.1], [10.31, 43.55], [10.5, 42.93], [11.2, 42.44], [11.8, 42.09], [12.29, 41.73], [12.62, 41.45], [13.05, 41.23], [13.57, 41.21], [14.25, 40.84], [14.33, 40.6], [14.77, 40.68], [14.9, 40.25], [15.5, 40.0], [16.03, 39.36], [15.83, 38.62], [15.65, 38.11], [16.06, 37.93], [16.6, 38.4], [17.1, 38.9], [17.13, 39.08], [16.5, 39.75], [17.24, 40.47], [17.98, 40.06], [18.36, 39.8], [18.49, 40.15], [17.94, 40.64], [16.87, 41.13], [15.92, 41.63], [16.18, 41.88], [15.0, 42.0], [14.21, 42.46], [13.5, 43.62], [12.57, 44.06], [12.5, 44.95], [12.33, 45.44], [13.77, 45.65], [13.7, 46.5], [12.4, 47.0], [11.0, 46.9], [10.5, 46.6], [9.0, 46.4], [8.4, 46.3], [7.0, 45.9], [6.8, 45.0], [7.0, 44.2]];
const ISLANDS: [number, number][][] = [
  [[12.4, 37.8], [13.36, 38.13], [14.0, 38.03], [15.2, 38.27], [15.65, 38.26], [15.1, 37.5], [15.3, 37.07], [15.1, 36.68], [14.5, 36.8], [13.6, 37.2], [12.6, 37.55]],
  [[8.2, 41.0], [9.5, 41.2], [9.8, 40.5], [9.6, 39.5], [9.2, 39.2], [8.4, 38.9], [8.4, 39.8], [8.4, 40.6]],
  [[9.4, 43.0], [9.55, 42.2], [9.2, 41.38], [8.6, 41.7], [8.6, 42.4], [9.1, 42.7]],
];

export default function GalleryOfMaps({ onDone }: LabProps) {
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [miss, setMiss] = useState(false);
  const current = REGIONS.findIndex((_, i) => !done.includes(i));
  useGoal(done.length === REGIONS.length, onDone);

  const answer = (w: Wall) => {
    if (current < 0) return;
    if (REGIONS[current].wall === w) {
      setDone([...done, current]);
      setMiss(false);
    } else {
      setWrong((n) => n + 1);
      setMiss(true);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the map on the left, the two walls on the right
    const mapW = w * 0.47, k = Math.min(mapW / (12.4 * 0.743), (h - 10) / 10.8);
    const X = (lon: number) => 6 + (lon - 6.5) * 0.743 * k, Y = (lat: number) => 5 + (47.3 - lat) * k;
    const poly = (pts: [number, number][]) => {
      ctx.beginPath();
      pts.forEach(([lo, la], i) => (i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la))));
      ctx.closePath();
      ctx.fillStyle = 'rgba(183,194,134,0.85)';
      ctx.fill();
    };
    poly(MAINLAND);
    ISLANDS.forEach(poly);
    ctx.strokeStyle = '#9a7a4c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    SPINE.forEach(([lo, la], i) => (i ? ctx.lineTo(X(lo), Y(la)) : ctx.moveTo(X(lo), Y(la))));
    ctx.stroke();
    for (const i of done) dot(ctx, X(REGIONS[i].lon), Y(REGIONS[i].lat), 3.5, REGIONS[i].wall === 'tyrrhenian' ? C.cool : C.accent);
    if (current >= 0) {
      const r = REGIONS[current];
      dot(ctx, X(r.lon), Y(r.lat), 6, miss ? C.bad : C.ink);
      label(ctx, r.place, X(r.lon) + 9, Y(r.lat), { size: 11.5, align: 'left', color: C.ink });
    }
    // the corridor: Tyrrhenian wall on the left, Adriatic on the right, north at the top
    const cx0 = w * 0.5, cw = w - cx0 - 6, half = cw / 2 - 3;
    label(ctx, t('Tyrrhenian wall'), cx0 + half / 2, 9, { size: 9, color: C.cool });
    label(ctx, t('Adriatic wall'), cx0 + half * 1.5 + 6, 9, { size: 9, color: C.accent });
    const placed = { tyrrhenian: [] as number[], adriatic: [] as number[] };
    for (const i of done) placed[REGIONS[i].wall].push(i);
    for (const wall of ['tyrrhenian', 'adriatic'] as Wall[]) {
      const list = placed[wall].sort((a, b) => REGIONS[b].lat - REGIONS[a].lat);
      const x = wall === 'tyrrhenian' ? cx0 : cx0 + half + 6, rowH = Math.min(22, (h - 24) / 5.2);
      list.forEach((i, n) => {
        ctx.fillStyle = wall === 'tyrrhenian' ? 'rgba(125,211,252,0.28)' : 'rgba(253,224,71,0.25)';
        ctx.fillRect(x, 18 + n * rowH, half, rowH - 3);
        label(ctx, REGIONS[i].name, x + half / 2, 18 + n * rowH + (rowH - 3) / 2, { size: 8.5, color: C.ink });
      });
    }
    label(ctx, t('north at the top'), cx0 + cw / 2, h - 7, { size: 9, color: C.faint });
  };

  const r = current >= 0 ? REGIONS[current] : null;
  return (
    <div className="lab">
      <Stage draw={draw} label={r ? t('A map of Italy with the Apennines; which wall does {name}, around {place}, go on?', { name: r.name, place: r.place }) : t('Every region is on its wall')} />
      <Choice
        label={t('Which wall of the gallery?')}
        value={'none' as Wall | 'none'}
        onChange={(v) => v !== 'none' && answer(v)}
        options={[
          { value: 'tyrrhenian', label: t('Tyrrhenian wall') },
          { value: 'adriatic', label: t('Adriatic wall') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Region to place'), value: r ? r.name : t('all on their walls'), tone: r ? 'accent' : 'good' },
          { label: t('On their walls'), value: `${done.length} / ${REGIONS.length}`, tone: done.length === REGIONS.length ? 'good' : undefined },
          { label: t('Wrong walls'), value: formatNumber(wrong), tone: wrong ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{miss && r ? t('Not that wall: look at which side of the Apennines {place} lies.', { place: r.place }) : t('Simplified outline of Italy and of the Apennine ridge.')}</p>
    </div>
  );
}
