import { useRef, useState } from 'react';
import { C, dot, font, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Put the first days of the 1956 revolution on a schematic map of Budapest, in order, from the UN Special Committee's
 * report of 1957 (paras 53–56 and 481–483): the students at the Bem statue and the crowd at Parliament on the
 * afternoon and evening of 23 October, the shooting at the Radio after 9 p.m., the Stalin statue toppled at 9.30 p.m.,
 * then on 25 October the crowd talking with Soviet tank crews in the morning and the volley at Kossuth Square between
 * 11 and noon. Places from their coordinates, nudged apart where they would be too close to tap; the Danube simplified.
 */
export type Place = 'bem' | 'parliament' | 'radio' | 'stalin' | 'astoria';
export const PLACES: Record<Place, [number, number]> = {
  bem: [19.0383, 47.513],
  parliament: [19.0458, 47.507],
  radio: [19.0675, 47.4895],
  stalin: [19.0845, 47.506],
  astoria: [19.0575, 47.4950],
};
export const EVENTS: { id: string; place: Place }[] = [
  { id: 'bem', place: 'bem' },
  { id: 'nagy', place: 'parliament' },
  { id: 'radio', place: 'radio' },
  { id: 'statue', place: 'stalin' },
  { id: 'tanks', place: 'astoria' },
  { id: 'volley', place: 'parliament' },
];
const DANUBE: [number, number][] = [[19.046, 47.53], [19.043, 47.514], [19.04, 47.506], [19.042, 47.499], [19.048, 47.492], [19.056, 47.486], [19.066, 47.478]];
const LON0 = 19.03, LON1 = 19.091, LAT0 = 47.517, LAT1 = 47.486;

/** A place's point on a stage of w × h: an equal-area map of central Budapest, fitted and centred. */
export function project(w: number, h: number, lon: number, lat: number): [number, number] {
  const kx = 75.1, ky = 111.2; // km per degree of longitude and latitude at 47.5° N
  const spanX = (LON1 - LON0) * kx, spanY = (LAT0 - LAT1) * ky;
  const s = Math.min((w - 40) / spanX, (h - 66) / spanY);
  const ox = (w - spanX * s) / 2, oy = 38 + (h - 52 - spanY * s) / 2;
  return [ox + (lon - LON0) * kx * s, oy + (LAT0 - lat) * ky * s];
}
/** The place under a tap, within 30 px (the nearest), or null. */
export function placeAt(w: number, h: number, x: number, y: number): Place | null {
  let best: Place | null = null, bestD = 30;
  for (const p of Object.keys(PLACES) as Place[]) {
    const [px, py] = project(w, h, ...PLACES[p]);
    const d = Math.hypot(px - x, py - y);
    if (d < bestD) { best = p; bestD = d; }
  }
  return best;
}

const GOLD = '#e3c06b', RIVER = 'rgba(62,90,110,0.7)';

function eventText(id: string) {
  switch (id) {
    case 'bem':
      return t('23 Oct, afternoon: students march to the statue of General Bem');
    case 'nagy':
      return t('23 Oct, 6 p.m.: a vast crowd calls for Imre Nagy');
    case 'radio':
      return t('23 Oct, after 9 p.m.: shooting at the Radio building');
    case 'statue':
      return t('23 Oct, 9.30 p.m.: the Stalin statue is pulled down');
    case 'tanks':
      return t('25 Oct, morning: people talk with Soviet tank crews');
    default:
      return t('25 Oct, 11 to 12: the volley at Kossuth Square');
  }
}
function placeName(p: Place) {
  return p === 'bem' ? t('Bem statue') : p === 'parliament' ? t('Parliament, Kossuth Square') : p === 'radio' ? t('Radio building') : p === 'stalin' ? t('Stalin statue') : t('Astoria hotel');
}

export default function KossuthSquareMap({ onDone }: LabProps) {
  const [done, setDone] = useState(0);
  const [miss, setMiss] = useState<Place | null>(null);
  const size = useRef({ w: 0, h: 0 });
  useGoal(done === EVENTS.length, onDone);
  const current = EVENTS[Math.min(done, EVENTS.length - 1)];

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down' || done >= EVENTS.length || !size.current.w) return;
    const hit = placeAt(size.current.w, size.current.h, p.x, p.y);
    if (!hit) return;
    if (hit === current.place) {
      setDone(done + 1);
      setMiss(null);
    } else setMiss(hit);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    // the river
    ctx.strokeStyle = RIVER;
    ctx.lineWidth = Math.max(10, w * 0.035);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    DANUBE.forEach(([lo, la], i) => {
      const [x, y] = project(w, h, lo, la);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.lineCap = 'butt';
    const [bx, by] = project(w, h, 19.029, 47.497);
    label(ctx, t('Buda side'), bx, by, { size: 11, color: C.faint });
    const [px, py] = project(w, h, 19.078, 47.497);
    label(ctx, t('Pest side'), px, py, { size: 11, color: C.faint });
    // the places, with what has been put there
    for (const p of Object.keys(PLACES) as Place[]) {
      const [x, y] = project(w, h, ...PLACES[p]);
      const n = EVENTS.slice(0, done).filter((e) => e.place === p).length;
      dot(ctx, x, y, n ? 8 : 6, n ? GOLD : C.ink);
      if (miss === p) {
        ctx.strokeStyle = C.bad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.stroke();
      }
      const [dx, dy, align]: [number, number, CanvasTextAlign] =
        p === 'stalin' ? [0, 15, 'center'] : p === 'radio' ? [10, 10, 'left'] : p === 'astoria' ? [-10, 8, 'right'] : p === 'bem' ? [0, -13, 'center'] : [10, -10, 'left'];
      label(ctx, placeName(p), x + dx, y + dy, { size: 11, color: n ? GOLD : C.soft, align });
    }
    // the event to place, wrapped to the stage
    const text = done < EVENTS.length ? eventText(current.id) : t('All six placed');
    font(ctx, 12, 700);
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > w - 16 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    ctx.fillStyle = 'rgba(12,14,13,0.8)';
    ctx.fillRect(0, 0, w, 6 + lines.length * 14);
    lines.forEach((l, j) => label(ctx, l, w / 2, 11 + j * 14, { size: 12, color: GOLD }));
    label(ctx, t('Schematic map of central Budapest'), 6, h - 8, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={done < EVENTS.length ? eventText(current.id) : t('All six placed')} />
      <Readouts
        items={[
          { label: t('Events placed'), value: `${formatNumber(done)} / ${formatNumber(EVENTS.length)}`, tone: done === EVENTS.length ? 'good' : undefined },
          { label: t('Last tap'), value: miss ? t('Not there: {place}', { place: placeName(miss) }) : done ? placeName(EVENTS[done - 1].place) : '–', tone: miss ? 'bad' : undefined },
        ]}
      />
    </div>
  );
}
