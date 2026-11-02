import { useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Where Keith Douglas's war took him, on a schematic map (Merton College; CWGC; PN Review; BYU Library): El Alamein,
 * Egypt (October 1942), Wadi Zem Zem in Tripolitania, Libya (wounded, January 1943), Tunisia ("Aristocrats" is
 * dated Tunisia 1943) and Tilly-sur-Seulles in Normandy (killed on 9 June 1944). The memoir Alamein to Zem Zem ends
 * before Tunisia. Positions are in fractions of the stage: a strip of North Africa below, an inset of Normandy above.
 */
export type PlaceId = 'alamein' | 'zemzem' | 'tunisia' | 'tilly';
/** North Africa strip: longitude 8–31° E, latitude 37.6–29.8° N, in the lower part of the stage. */
export const africa = (lon: number, lat: number) => ({ u: 0.04 + ((lon - 8) / 23) * 0.92, v: 0.42 + ((37.6 - lat) / 7.8) * 0.5 });
/** Normandy inset: longitude 2° W – 2° E, latitude 51–48.5° N, in the top-left box. */
export const inset = (lon: number, lat: number) => ({ u: 0.04 + ((lon + 2) / 4) * 0.38, v: 0.06 + ((51 - lat) / 2.5) * 0.3 });
export const SPOTS: Record<PlaceId, { u: number; v: number }> = {
  alamein: africa(28.95, 30.83),
  zemzem: africa(15.35, 31.25),
  tunisia: africa(9.9, 35.3),
  tilly: inset(-0.62, 49.18),
};
export const ORDER: PlaceId[] = ['alamein', 'zemzem', 'tunisia', 'tilly'];
/** Whether a tap at (x, y) on a w × h stage lands on a place: within 7% of the width (at least 22 px). */
export const hits = (id: PlaceId, x: number, y: number, w: number, h: number) =>
  Math.hypot(x - SPOTS[id].u * w, y - SPOTS[id].v * h) <= Math.max(22, 0.07 * w);

const COAST: [number, number][] = [[8, 36.9], [9.87, 37.27], [10.3, 36.9], [11.05, 37.05], [10.6, 36.4], [10.64, 35.83], [11.1, 35.2], [10.76, 34.74], [10.1, 33.88], [10.9, 33.8], [11.6, 33.15], [13.18, 32.89], [15.1, 32.4], [15.4, 31.6], [16.6, 31.2], [18.5, 30.4], [19.2, 30.3], [20.07, 32.12], [21.7, 32.9], [22.6, 32.76], [23.96, 32.08], [25.15, 31.57], [27.24, 31.35], [28.95, 30.83], [29.92, 31.2], [31, 31.5]];
const BLUE = '#7fa8e0', RED = '#e0866f';

export default function KeithDouglas({ onDone }: LabProps) {
  const [pick, setPick] = useState<PlaceId>('alamein');
  const [placed, setPlaced] = useState<PlaceId[]>([]);
  const [miss, setMiss] = useState(false);
  useGoal(placed.length === ORDER.length, onDone);

  const name = (id: PlaceId) => (id === 'alamein' ? 'El Alamein' : id === 'zemzem' ? 'Wadi Zem Zem' : id === 'tunisia' ? t('Tunisia, in 1943') : 'Tilly-sur-Seulles');
  const note = (id: PlaceId) =>
    id === 'alamein'
      ? t('El Alamein, Egypt, October 1942: Douglas joins the battle against orders, and his memoir begins.')
      : id === 'zemzem'
        ? t('Wadi Zem Zem, Libya, January 1943: wounded by a mine. The memoir’s title ends here.')
        : id === 'tunisia'
          ? t('Tunisia, 1943: back in the fight. “Aristocrats” is dated Tunisia 1943.')
          : t('Tilly-sur-Seulles, Normandy, 9 June 1944: killed three days after D-Day, aged 24.');

  const onPointer = (p: StagePointer, size: { w: number; h: number }) => {
    if (p.kind !== 'down' || placed.includes(pick)) return;
    if (hits(pick, p.x, p.y, size.w, size.h)) {
      const next = [...placed, pick];
      setPlaced(next);
      setMiss(false);
      const left = ORDER.find((id) => !next.includes(id));
      if (left) setPick(left);
    } else setMiss(true);
  };

  let size = { w: 0, h: 0 };
  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size = s;
    const { w, h } = s, X = (u: number) => u * w, Y = (v: number) => v * h;
    // North Africa: the coast, Sicily and Crete
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath();
    COAST.forEach(([lo, la], i) => { const { u, v } = africa(lo, la); i ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)); });
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (const [lo, la, rx, ry] of [[14.1, 37.5, 1.5, 0.45], [24.9, 35.25, 1.2, 0.18]]) { const { u, v } = africa(lo, la); ctx.beginPath(); ctx.ellipse(X(u), Y(v), (rx / 23) * 0.92 * w, (ry / 7.8) * 0.5 * h, 0, 0, Math.PI * 2); ctx.fill(); }
    label(ctx, t('North Africa, schematic map'), X(0.96), 12, { size: 10, color: C.faint, align: 'right' });
    // the Normandy inset
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.strokeRect(X(0.04), Y(0.06), X(0.38), Y(0.3));
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
    const line = (pts: [number, number][]) => { ctx.beginPath(); pts.forEach(([lo, la], i) => { const { u, v } = inset(lo, la); i ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)); }); ctx.stroke(); };
    line([[-2, 50.6], [-1, 50.75], [0, 50.8], [1, 50.95], [1.4, 51.0]]);
    line([[-2, 49.7], [-1.9, 49.72], [-1.3, 49.65], [-1.15, 49.35], [-0.6, 49.34], [0.1, 49.3], [0.2, 49.45], [1.0, 49.95], [1.6, 50.25], [1.85, 50.9]]);
    label(ctx, t('Normandy, inset'), X(0.23), Y(0.40), { size: 10, color: C.faint });
    // what is placed, and its date
    for (const id of placed) {
      const { u, v } = SPOTS[id];
      ctx.fillStyle = id === 'tilly' ? RED : BLUE; ctx.beginPath(); ctx.arc(X(u), Y(v), 6, 0, Math.PI * 2); ctx.fill();
      label(ctx, name(id), X(u) + (u < 0.2 ? -4 : 0), Y(v) - 13, { size: 11, color: C.ink, align: u < 0.2 ? 'left' : 'center' });
    }
    // the memoir's span, once both ends are placed
    if (placed.includes('alamein') && placed.includes('zemzem')) {
      const a = SPOTS.alamein, b = SPOTS.zemzem;
      const my = Math.min(Y(a.v), Y(b.v)) - 30;
      ctx.strokeStyle = BLUE; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(b.u) + 10, my); ctx.lineTo(X(a.u) - 10, my); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, t('the memoir'), X((a.u + b.u) / 2), my - 9, { size: 10, color: BLUE });
    }
  };

  const last = placed.at(-1);
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={(p) => onPointer(p, size)} label={t('{n} of {total} places of Keith Douglas’s war placed on the map', { n: formatNumber(placed.length), total: formatNumber(ORDER.length) })} />
      <Choice label={t('Place to put on the map')} options={ORDER.filter((id) => !placed.includes(id)).map((id) => ({ value: id, label: name(id) }))} value={pick} onChange={setPick} />
      <Readouts
        items={[
          { label: t('Places found'), value: t('{n} of {total}', { n: formatNumber(placed.length), total: formatNumber(ORDER.length) }), tone: placed.length === ORDER.length ? 'good' : 'accent' },
          { label: t('Your last tap'), value: miss ? t('not there, try again') : last ? t('found it') : '–', tone: miss ? 'bad' : last ? 'good' : undefined },
        ]}
      />
      {last && <p className="lab__note">{note(last)}</p>}
    </div>
  );
}
