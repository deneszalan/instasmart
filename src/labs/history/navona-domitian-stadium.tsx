import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Stadium of Domitian in metres (Bernard and Ciancio Rossetto 2014): 275 long, 106 wide, the track 52.9 wide. */
export const LENGTH = 275;
export const WIDTH = 106;
export const TRACK = 52.9;
/** From the track's edge to the outer wall, on each side. */
export const STANDS = (WIDTH - TRACK) / 2;
/** Depth of one row of benches, a fixed assumption of this model. */
export const ROW = 0.7;
export const MAX_ROWS = Math.floor(STANDS / ROW);
/** The modern estimate of the stadium's seats. */
export const ESTIMATE = 30000;

const RI = TRACK / 2;
/** Length of each long side of the stands: from the straight south end to where the north curve begins. */
const SIDE = LENGTH - WIDTH / 2;

/** Length of the bench in row i (0 = next to the track): both long sides and the half-ring round the curved north end. */
export const rowLength = (i: number) => 2 * SIDE + Math.PI * (RI + (i + 0.5) * ROW);

/** Places for spectators with `rows` rows of benches and `width` metres of bench per person. */
export function seats(rows: number, width: number) {
  let total = 0;
  for (let i = 0; i < rows; i++) total += rowLength(i);
  return Math.floor(total / width);
}

export const nearEstimate = (n: number) => Math.abs(n - ESTIMATE) <= 1000;

export default function NavonaStadium({ onDone }: LabProps) {
  const [rows, setRows] = useState(12);
  const [cm, setCm] = useState(60);
  const n = seats(rows, cm / 100);
  const ok = nearEstimate(n);
  useGoal(ok, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the plan lies on its side: north (the curved end) to the right
    const s = Math.min((w - 24) / LENGTH, (h - 40) / WIDTH);
    const x0 = (w - LENGTH * s) / 2, cy = (h - 14) / 2;
    const xc = x0 + SIDE * s; // centre of the north curve
    const shape = (r: number) => {
      ctx.beginPath();
      ctx.moveTo(x0, cy - r * s);
      ctx.lineTo(xc, cy - r * s);
      ctx.arc(xc, cy, r * s, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x0, cy + r * s);
      ctx.closePath();
    };
    // the whole stadium, then the stands in use, then the track
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    shape(WIDTH / 2);
    ctx.fill();
    ctx.fillStyle = ok ? 'rgba(134,239,172,0.45)' : 'rgba(253,224,71,0.42)';
    shape(RI + rows * ROW);
    ctx.fill();
    ctx.fillStyle = 'rgba(233,214,168,0.9)';
    shape(RI);
    ctx.fill();
    // every fifth row as a line
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let i = 5; i < rows; i += 5) {
      shape(RI + i * ROW);
      ctx.stroke();
    }
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    shape(WIDTH / 2);
    ctx.stroke();
    label(ctx, t('track, now the square'), x0 + (LENGTH * s) / 2 - 20, cy, { size: 11, color: 'rgba(0,0,0,0.6)' });
    label(ctx, t('north →'), x0 + LENGTH * s, cy + (WIDTH / 2) * s + 12, { size: 10, align: 'right', color: C.soft });
    label(ctx, t('no seats at the south end'), x0, cy + (WIDTH / 2) * s + 12, { size: 10, align: 'left', color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Plan of the Stadium of Domitian with {r} rows of benches: {n} places', { r: rows, n: formatNumber(n) })} />
      <Range label={t('Rows of benches')} value={rows} min={1} max={MAX_ROWS} step={1} onChange={(v) => setRows(Math.round(v))} />
      <Range label={t('Bench per spectator')} value={cm} min={35} max={70} step={5} onChange={(v) => setCm(Math.round(v))} format={(v) => `${v} cm`} />
      <Readouts
        items={[
          { label: t('Places for spectators'), value: formatNumber(n), tone: ok ? 'good' : 'accent' },
          { label: t('Depth of stands used'), value: t('{n} of {m} m', { n: formatNumber(Math.round(rows * ROW * 10) / 10), m: formatNumber(Math.round(STANDS * 10) / 10) }) },
          { label: t('Usual estimate'), value: formatNumber(ESTIMATE) },
        ]}
      />
      <p className="lab__note">{t('Simplified: rows 70 cm deep along both long sides and round the curved north end, none at the straight south end, and every place filled.')}</p>
    </div>
  );
}
