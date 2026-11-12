import { useRef, useState } from 'react';
import { C, font, label, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * 23 October 1956 on a schematic map of central Budapest. The places and times are from the UN Special Committee's
 * report (1957, chapter X) and the 1956 Institute (Szakolczai, lesson 2): the march from the Petőfi statue (3 p.m.),
 * the Bem statue, the crowd at Parliament (by 6 p.m.), the Radio in Bródy Sándor utca (shots shortly after 9 p.m.) and
 * the Stalin statue (fell at about 9.30 p.m.). The places come from rounded coordinates; the river is simplified.
 */
export type PlaceId = 'petofi' | 'bem' | 'parl' | 'radio' | 'stalin';
export const PLACES: Record<PlaceId, [number, number]> = {
  petofi: [19.05, 47.4935],
  bem: [19.0395, 47.511],
  parl: [19.0457, 47.5071],
  radio: [19.063, 47.4925],
  stalin: [19.081, 47.5065],
};
/** The events in the order of the day. */
export const ORDER: PlaceId[] = ['petofi', 'bem', 'parl', 'radio', 'stalin'];
const DANUBE: [number, number][] = [[19.0405, 47.52], [19.043, 47.512], [19.043, 47.503], [19.044, 47.497], [19.049, 47.49], [19.057, 47.484], [19.0645, 47.4775]];
const BOX = { lon0: 19.026, lon1: 19.088, lat0: 47.477, lat1: 47.52 };
const COS = Math.cos((47.5 * Math.PI) / 180);

/** Where a point of the map falls on a stage of w × h, keeping the map's shape and centring it. */
export function project(lon: number, lat: number, w: number, h: number): [number, number] {
  const mw = (BOX.lon1 - BOX.lon0) * COS, mh = BOX.lat1 - BOX.lat0;
  const s = Math.min((w * 0.92) / mw, (h * 0.8) / mh);
  const ox = (w - mw * s) / 2, oy = h * 0.14 + (h * 0.84 - mh * s) / 2;
  return [ox + (lon - BOX.lon0) * COS * s, oy + (BOX.lat1 - lat) * s];
}

/** The place tapped at (x, y), if a dot is within reach of a finger. */
export function placeAt(x: number, y: number, w: number, h: number, reach = 22): PlaceId | null {
  let best: PlaceId | null = null, bd = reach;
  for (const id of ORDER) {
    const [px, py] = project(...PLACES[id], w, h);
    const d = Math.hypot(px - x, py - y);
    if (d <= bd) { bd = d; best = id; }
  }
  return best;
}

/** The goal: every place found, in the order of the day. */
export const complete = (found: PlaceId[]) => found.length === ORDER.length && found.every((id, i) => ORDER[i] === id);

function clue(id: PlaceId) {
  switch (id) {
    case 'petofi':
      return t('3 p.m.: one column sets off from the Petőfi statue, on the Pest bank');
    case 'bem':
      return t('The columns meet at the Bem statue, on the Buda bank');
    case 'parl':
      return t('By 6 p.m. a vast crowd fills the square at Parliament, on the Pest bank');
    case 'radio':
      return t('Shortly after 9 p.m. shots at the Radio, Bródy Sándor utca, inland in Pest');
    default:
      return t('About 9.30 p.m. the Stalin statue falls, by the City Park, furthest east');
  }
}
function name(id: PlaceId) {
  switch (id) {
    case 'petofi':
      return t('Petőfi statue, 3 p.m.');
    case 'bem':
      return t('Bem statue, afternoon');
    case 'parl':
      return t('Parliament, 6 p.m.');
    case 'radio':
      return t('Radio, after 9 p.m.');
    default:
      return t('Stalin statue, 9.30 p.m.');
  }
}

/** Breaks a label into lines that fit `maxW` at `size` px. */
function wrap(ctx: CanvasRenderingContext2D, s: string, maxW: number, size: number) {
  font(ctx, size);
  const out: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

const RIVER = '#3b6288', GOLD = '#e8c25a', RED = '#ce2939';

export default function October23({ onDone }: LabProps) {
  const [found, setFound] = useState<PlaceId[]>([]);
  const [wrong, setWrong] = useState(false);
  const next = ORDER[found.length];
  useGoal(complete(found), onDone);

  const onPointer = (p: StagePointer, size: { w: number; h: number }) => {
    if (p.kind !== 'down' || !next) return;
    const id = placeAt(p.x, p.y, size.w, size.h);
    if (id === next) { setFound([...found, id]); setWrong(false); } else setWrong(true);
  };
  const stageSize = useRef({ w: 0, h: 0 });

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    stageSize.current = { w, h };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = RIVER; ctx.lineWidth = Math.max(8, w * 0.03);
    ctx.beginPath(); DANUBE.forEach(([lo, la], i) => { const [x, y] = project(lo, la, w, h); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    const [bx, by] = project(19.031, 47.484, w, h), [px, py] = project(19.08, 47.482, w, h);
    label(ctx, t('Buda bank'), bx, by, { size: 12, color: C.faint });
    label(ctx, t('Pest bank'), px, py, { size: 12, color: C.faint });
    // the five places: unnamed dots until found
    ORDER.forEach((id) => {
      const [x, y] = project(...PLACES[id], w, h), done = found.includes(id);
      ctx.fillStyle = done ? GOLD : 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(x, y, done ? 7 : 6, 0, Math.PI * 2); ctx.fill();
      if (done) label(ctx, name(id), x + (id === 'bem' ? -10 : 10), y - 12, { size: 11, color: GOLD, align: id === 'bem' ? 'right' : 'left' });
    });
    // the order of the day so far, as a line
    for (let i = 1; i < found.length; i++) {
      const [x1, y1] = project(...PLACES[found[i - 1]], w, h), [x2, y2] = project(...PLACES[found[i]], w, h);
      ctx.strokeStyle = 'rgba(232,194,90,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    }
    const msg = next ? clue(next) : t('The whole day, from 3 p.m. to about 9.30 p.m.');
    const lines = wrap(ctx, msg, w - 16, 11);
    lines.forEach((s, i) => label(ctx, s, w / 2, 12 + i * 14, { size: 11, color: next ? C.ink : C.good }));
    if (wrong && next) label(ctx, t('Not that one: read the clue again'), w / 2, 14 + lines.length * 14, { size: 11, color: RED });
    label(ctx, t('Schematic map of central Budapest'), 6, h - 8, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        onPointer={(p) => onPointer(p, stageSize.current)}
        label={t('Map of central Budapest: {n} of 5 places of 23 October found', { n: formatNumber(found.length) })}
      />
    </div>
  );
}
