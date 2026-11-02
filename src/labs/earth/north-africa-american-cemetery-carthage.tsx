import { useRef, useState } from 'react';
import { C, label, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A schematic plan of the North Africa American Cemetery at Carthage: nine plots, A to I, in three rows of three, with A,
 * B and C nearest the mall (ABMC brochure, 2024). Every grave has an address: plot, row and grave. The rows and graves
 * here are made up (8 rows of 12 graves a plot); the real plots differ.
 */
export const PLOTS = 'ABCDEFGHI';
export const ROWS = 8;
export const GRAVES = 12;
export interface Address { plot: string; row: number; grave: number }
/** Practice records, not real people. */
export const RECORDS: Address[] = [
  { plot: 'C', row: 3, grave: 10 },
  { plot: 'G', row: 7, grave: 2 },
  { plot: 'E', row: 5, grave: 6 },
];
export const same = (a: Address | null, b: Address) => !!a && a.plot === b.plot && a.row === b.row && a.grave === b.grave;

export interface Box { x0: number; y0: number; w: number; h: number }
/** The whole plan: plot i sits in column i % 3 and, counting from the mall at the bottom, band ⌊i / 3⌋. */
export function planBox(w: number, h: number): Box { return { x0: 8, y0: 6, w: w - 16, h: h - 48 }; }
const GAP = 0.04;
/** The rectangle of plot i in the plan. */
export function plotRect(B: Box, i: number): Box {
  const pw = (B.w * (1 - 2 * GAP)) / 3, ph = (B.h * (1 - 2 * GAP)) / 3;
  const col = i % 3, band = 2 - Math.floor(i / 3);
  return { x0: B.x0 + col * (pw + B.w * GAP), y0: B.y0 + band * (ph + B.h * GAP), w: pw, h: ph };
}
/** The plot under a point of the plan, or null on a path. */
export function plotAt(B: Box, x: number, y: number): number | null {
  for (let i = 0; i < 9; i++) { const r = plotRect(B, i); if (x >= r.x0 && x < r.x0 + r.w && y >= r.y0 && y < r.y0 + r.h) return i; }
  return null;
}
/** One plot filling the stage, with room for row numbers on the left and grave numbers below. */
export function zoomBox(w: number, h: number): Box { return { x0: 26, y0: 20, w: w - 34, h: h - 54 }; }
/** The centre of a grave in the zoomed plot. Row 1 is the southern row (nearest the mall); grave 1 is at the west end. */
export function gravePoint(Z: Box, row: number, grave: number): [number, number] {
  return [Z.x0 + ((grave - 0.5) / GRAVES) * Z.w, Z.y0 + Z.h - ((row - 0.5) / ROWS) * Z.h];
}
/** The grave under a point of the zoomed plot, or null outside it. */
export function graveAt(Z: Box, x: number, y: number): { row: number; grave: number } | null {
  if (x < Z.x0 || x >= Z.x0 + Z.w || y < Z.y0 || y >= Z.y0 + Z.h) return null;
  return { row: Math.floor(((Z.y0 + Z.h - y) / Z.h) * ROWS) + 1, grave: Math.floor(((x - Z.x0) / Z.w) * GRAVES) + 1 };
}

const GOLD = '#d9b45a', LAWN = 'rgba(80,140,105,0.45)';

export default function GraveFinder({ onDone }: LabProps) {
  const [found, setFound] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [tap, setTap] = useState<{ a: Address; ok: boolean } | null>(null);
  const goal = RECORDS[Math.min(found, RECORDS.length - 1)];
  useGoal(found >= RECORDS.length, onDone);
  const size = useRef({ w: 0, h: 0 });

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    size.current = { w, h };
    if (zoom === null) {
      const B = planBox(w, h);
      for (let i = 0; i < 9; i++) {
        const r = plotRect(B, i);
        ctx.fillStyle = LAWN; ctx.fillRect(r.x0, r.y0, r.w, r.h);
        for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(243,241,234,0.35)'; ctx.fillRect(r.x0 + 6, r.y0 + 6 + (k * (r.h - 12)) / 5, r.w - 12, 1.5); }
        label(ctx, PLOTS[i], r.x0 + r.w / 2, r.y0 + r.h / 2, { size: 18, color: GOLD });
      }
      ctx.fillStyle = 'rgba(217,210,194,0.5)'; ctx.fillRect(B.x0, B.y0 + B.h + 4, B.w, 6);
      label(ctx, t('mall and Tablets of the Missing (south) · N ↑'), w / 2, B.y0 + B.h + 20, { size: 9, color: C.soft });
      label(ctx, t('Tap a plot to walk into it.'), w / 2, h - 7, { size: 10, color: C.faint });
      return;
    }
    const Z = zoomBox(w, h);
    ctx.fillStyle = LAWN; ctx.fillRect(Z.x0, Z.y0, Z.w, Z.h);
    for (let r = 1; r <= ROWS; r++) for (let g = 1; g <= GRAVES; g++) {
      const [x, y] = gravePoint(Z, r, g);
      ctx.fillStyle = 'rgba(243,241,234,0.75)'; ctx.fillRect(x - 1.5, y - 2.5, 3, 5);
    }
    for (let r = 1; r <= ROWS; r++) label(ctx, formatNumber(r), Z.x0 - 10, gravePoint(Z, r, 1)[1], { size: 9, color: C.soft });
    for (const g of [1, 4, 8, 12]) label(ctx, formatNumber(g), gravePoint(Z, 1, g)[0], Z.y0 + Z.h + 9, { size: 9, color: C.soft });
    label(ctx, t('← Back to the plan'), 8, 9, { size: 11, color: GOLD, align: 'left' });
    label(ctx, t('Plot {plot}', { plot: PLOTS[zoom] }), w - 8, 9, { size: 11, color: C.ink, align: 'right' });
    if (tap && tap.a.plot === PLOTS[zoom]) {
      const [x, y] = gravePoint(Z, tap.a.row, tap.a.grave);
      ctx.strokeStyle = tap.ok ? GOLD : C.bad; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
    }
    label(ctx, t('Row 1 nearest the mall, grave 1 at the west. Schematic.'), w / 2, h - 8, { size: 9, color: C.faint });
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down' || found >= RECORDS.length || !size.current.w) return;
    const { w, h } = size.current;
    if (zoom === null) { const i = plotAt(planBox(w, h), p.x, p.y); if (i !== null) setZoom(i); return; }
    if (p.y < zoomBox(w, h).y0 - 2) { setZoom(null); return; }
    const g = graveAt(zoomBox(w, h), p.x, p.y);
    if (!g) return;
    const a = { plot: PLOTS[zoom], ...g }, ok = same(a, goal);
    setTap({ a, ok });
    if (ok) { setFound(found + 1); setZoom(null); }
  };
  const addr = (a: Address) => t('Plot {plot}, row {row}, grave {grave}', { plot: a.plot, row: formatNumber(a.row), grave: formatNumber(a.grave) });

  return (
    <div className="lab">
      <p className="lab__note">{t('Find this practice record (not a real person):')} <strong>{found >= RECORDS.length ? t('All found') : addr(goal)}</strong></p>
      <Stage draw={draw} onPointer={onPointer} label={t('Schematic plan of the cemetery’s nine plots; find the grave at {addr}', { addr: addr(goal) })} />
      <p className="lab__note">
        {t('You tapped:')} <strong>{tap ? addr(tap.a) : '–'}</strong> · {t('Graves found:')} <strong>{t('{n} of {total}', { n: formatNumber(found), total: formatNumber(RECORDS.length) })}</strong>
      </p>
    </div>
  );
}
