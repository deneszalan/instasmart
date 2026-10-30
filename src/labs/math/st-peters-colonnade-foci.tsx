import { useRef, useState } from 'react';
import { C, dot, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

// A simplified plan of St Peter's Square, in metres, with the obelisk at the origin and x towards the north
// colonnade. The disc ("centro del colonnato") is the centre of the colonnade's circles (Seguí's survey via Ginoux et
// al.: 33 m from the obelisk, inner radius 66 m). The four rows' radii, the 35 sets and the 1.5 m columns are schematic.
export const COL_DISC = 33.02;
export const COL_ROWS = [67.8, 71.8, 77.4, 81.4];
export const COL_SETS = 35;
const SPAN = (68 * Math.PI) / 180, COL_R = 0.75, FOUNTAIN = 59.43, SNAP = 2.5;
const HALF_A = 99.06, HALF_B = 74.9; // the inner oval's half-axes

export interface Column { x: number; y: number; row: number; set: number }

/** The north colonnade: four rows on arcs round the disc, each set of four on one radius from it. */
export const colonnadeColumns = (): Column[] => {
  const out: Column[] = [];
  for (let i = 0; i < COL_SETS; i++) {
    const a = -SPAN + (2 * SPAN * i) / (COL_SETS - 1);
    COL_ROWS.forEach((r, row) => out.push({ x: COL_DISC + r * Math.cos(a), y: r * Math.sin(a), row, set: i }));
  }
  return out;
};
const COLUMNS = colonnadeColumns();

/** Which columns an eye at (x, y) can see: a column shows if more than 5% of its width is not hidden by nearer ones. */
export const sightFrom = (x: number, y: number) => {
  const cols = COLUMNS.map((c) => {
    const d = Math.hypot(c.x - x, c.y - y), az = Math.atan2(c.y - y, c.x - x), h = Math.asin(COL_R / d);
    return { ...c, d, lo: az - h, hi: az + h };
  }).sort((p, q) => p.d - q.d);
  const covered: [number, number][] = [];
  const seen: Column[] = [];
  for (const c of cols) {
    // the part of this column's angle that no nearer column covers
    let free = c.hi - c.lo;
    for (const [a, b] of covered) free -= Math.max(0, Math.min(b, c.hi) - Math.max(a, c.lo));
    if (free > 0.05 * (c.hi - c.lo)) seen.push(c);
    // merge into the covered union, so overlaps are not subtracted twice
    covered.push([c.lo, c.hi]);
    covered.sort((p, q) => p[0] - q[0]);
    for (let i = covered.length - 1; i > 0; i--) {
      if (covered[i][0] <= covered[i - 1][1]) { covered[i - 1][1] = Math.max(covered[i - 1][1], covered[i][1]); covered.splice(i, 1); }
    }
  }
  return { seen, rear: seen.filter((c) => c.row > 0).length };
};

/** Keep the eye inside the oval, and let it click onto the disc when it comes close. */
export const placeEye = (x: number, y: number): [number, number] => {
  if (Math.hypot(x - COL_DISC, y) < SNAP) return [COL_DISC, 0];
  const q = Math.max(1, Math.hypot(x / (HALF_A - 4), y / (HALF_B - 4)));
  return [Math.max(-4, x / q), y / q];
};

export default function StPetersColonnade({ onDone }: LabProps) {
  const [eye, setEye] = useState<[number, number]>([4, -40]);
  const view = useRef({ ox: 0, oy: 0, s: 1, top: 0 });
  const { seen, rear } = sightFrom(...eye);
  const onDisc = rear === 0;
  useGoal(onDisc, onDone);

  // The plan is drawn with north (the colonnade) up: plan x runs up the screen, plan y to the left.
  const onPointer = (p: StagePointer) => {
    if (p.kind === 'up') return;
    const { ox, oy, s, top } = view.current;
    if (p.y < top) return;
    setEye(placeEye((oy - p.y) / s, (ox - p.x) / s));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the first-person view on top, the plan below it
    const vh = Math.round(h * 0.36), top = vh + 6;
    const s = Math.min((w - 8) / 168, (h - top - 6) / 124);
    const ox = w / 2, oy = h - 6 - 6 * s;
    view.current = { ox, oy, s, top };
    const X = (_x: number, y: number) => ox - y * s, Y = (x: number) => oy - x * s;

    // the view: columns at their real angles, nearer ones drawn over farther ones
    const look = Math.atan2(-eye[1], COL_DISC + 74 - eye[0]), fov = 0.42, ppr = w / (2 * fov), hor = vh - 8;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, w, vh, 10);
    ctx.clip();
    const sky = ctx.createLinearGradient(0, 0, 0, hor);
    sky.addColorStop(0, '#5d4a63');
    sky.addColorStop(1, '#c9a58c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, hor);
    ctx.fillStyle = '#4a3a40';
    ctx.fillRect(0, hor, w, vh - hor);
    const tones = ['#f3e9d2', '#cdb894', '#a48f6e', '#7d6c54'];
    const far = COLUMNS.map((c) => ({ c, d: Math.hypot(c.x - eye[0], c.y - eye[1]) })).sort((p, q) => q.d - p.d);
    for (const { c, d } of far) {
      let az = Math.atan2(c.y - eye[1], c.x - eye[0]) - look;
      az = Math.atan2(Math.sin(az), Math.cos(az));
      if (Math.abs(az) > fov + 0.05) continue;
      const x = w / 2 - az * ppr, half = Math.asin(COL_R / d) * ppr;
      const y0 = Math.max(0, hor - Math.atan(11.4 / d) * ppr), y1 = hor + Math.atan(1.6 / d) * ppr;
      ctx.fillStyle = tones[c.row];
      ctx.fillRect(x - half, y0, 2 * half, y1 - y0);
    }
    ctx.restore();
    ctx.font = '700 11px system-ui, sans-serif';
    const tag = t('What you see from there'), tw = ctx.measureText(tag).width;
    ctx.fillStyle = 'rgba(20,14,20,0.8)';
    ctx.beginPath();
    ctx.roundRect(6, 6, tw + 12, 18, 6);
    ctx.fill();
    label(ctx, tag, 12, 15, { size: 11, align: 'left', color: C.ink });

    // the plan: the oval's paving, the colonnade, obelisk, fountain and disc
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, w, h - top);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.ellipse(X(0, 0), Y(0), HALF_B * s, HALF_A * s, 0, 0, Math.PI * 2);
    ctx.fill();
    const rearSeen = seen.filter((c) => c.row > 0);
    for (const c of rearSeen) line(ctx, X(...eye), Y(eye[0]), X(c.x, c.y), Y(c.x), 'rgba(252,165,165,0.3)', 1);
    for (const c of COLUMNS) dot(ctx, X(c.x, c.y), Y(c.x), Math.max(1.2, COL_R * s), tones[c.row]);
    for (const c of rearSeen) dot(ctx, X(c.x, c.y), Y(c.x), Math.max(1.5, COL_R * s * 1.4), C.bad);
    ctx.fillStyle = C.ink;
    ctx.fillRect(X(0, 0) - 3, Y(0) - 3, 6, 6);
    label(ctx, t('St Peter’s obelisk'), X(0, 0) + 8, Y(0), { size: 10, align: 'left' });
    dot(ctx, X(FOUNTAIN, 0), Y(FOUNTAIN), Math.max(2.5, 3 * s), C.cool);
    dot(ctx, X(COL_DISC, 0), Y(COL_DISC), 3.5, C.accent);
    label(ctx, t('disc: centro del colonnato'), X(COL_DISC, 0) + 8, Y(COL_DISC), { size: 10, align: 'left', color: C.accent });
    // the eye, looking towards the colonnade
    line(ctx, X(...eye), Y(eye[0]), X(eye[0] + Math.cos(look) * 14, eye[1] + Math.sin(look) * 14), Y(eye[0] + Math.cos(look) * 14), onDisc ? C.good : C.ink, 2);
    dot(ctx, X(...eye), Y(eye[0]), 5.5, onDisc ? C.good : C.ink);
    ctx.restore();
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        onPointer={onPointer}
        label={t('A simplified plan of St Peter’s Square and its north colonnade of four rows, with the view from where you stand; drag to move')}
      />
      <Readouts
        items={[
          { label: t('Columns seen'), value: t('{n} of {total}', { n: seen.length, total: COLUMNS.length }), tone: onDisc ? 'good' : 'accent' },
          { label: t('Back rows showing'), value: String(rear), tone: onDisc ? 'good' : 'bad' },
          { label: t('From the disc'), value: `${formatNumber(Math.round(Math.hypot(eye[0] - COL_DISC, eye[1])))} m` },
        ]}
      />
      <p className="lab__note">{t('Drag on the plan; near the disc you click onto it. Red: back-row columns you can see. Simplified: 35 sets of four.')}</p>
    </div>
  );
}
