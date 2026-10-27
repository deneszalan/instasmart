import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Metres in a Roman foot: Trajan's Column is 100 Roman feet, 29.77 m (Platner and Ashby). */
export const FOOT = 0.2977;
/** The column's height without its base, in metres: the height the inscription is read as measuring. */
export const COLUMN = 100 * FOOT;
/** Its base, about 5.4 m high. */
const BASE = 5.4;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Cut a straight hillside of slope `deg` back by `back` metres to level ground: the vertical face left behind, in metres. */
export const faceHeight = (deg: number, back: number) => back * Math.tan(rad(deg));

/** Earth taken out, in cubic metres for every metre along the hillside: the triangle in front of the face. */
export const earthPerMetre = (deg: number, back: number) => (back * faceHeight(deg, back)) / 2;

/** How far back the cut must go for a face `height` metres high. */
export const backFor = (deg: number, height: number) => height / Math.tan(rad(deg));

const SLOPES = [20, 30, 45] as const;
type Slope = (typeof SLOPES)[number];

export default function TrajanHill({ onDone }: LabProps) {
  const [slope, setSlope] = useState<Slope>(30);
  const [back, setBack] = useState(20);
  const h = faceHeight(slope, back);
  const hit = Math.abs(h - COLUMN) <= FOOT;
  useGoal(hit, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h: H }: { w: number; h: number }) => {
    const ground = H - 22, toe = w * 0.3, maxM = 48;
    const s = Math.min((ground - 14) / maxM, (w - toe - 8) / 92); // pixels per metre
    const X = (m: number) => toe + m * s, Y = (m: number) => ground - m * s;
    const top = Math.tan(rad(slope)) * 92;
    // the hill before the cut, faint
    ctx.fillStyle = 'rgba(196,138,82,0.18)';
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(92), Y(Math.min(top, maxM))); ctx.lineTo(X(92), Y(0)); ctx.closePath(); ctx.fill();
    // what is left after cutting back `back` metres: the slope beyond the face
    const hh = Math.min(h, maxM);
    ctx.fillStyle = 'rgba(196,138,82,0.75)';
    ctx.beginPath(); ctx.moveTo(X(back), Y(0)); ctx.lineTo(X(back), Y(hh));
    const xEnd = Math.min(92, maxM / Math.tan(rad(slope)));
    if (xEnd > back) ctx.lineTo(X(xEnd), Y(maxM));
    ctx.lineTo(X(92), Y(Math.min(top, maxM))); ctx.lineTo(X(92), Y(0)); ctx.closePath(); ctx.fill();
    // the old slope, dashed
    line(ctx, X(0), Y(0), X(Math.min(92, xEnd)), Y(Math.min(top, maxM)), 'rgba(196,138,82,0.9)', 1.5, [4, 4]);
    // the forum floor
    line(ctx, 4, ground, w - 4, ground, C.soft, 2);
    // the face, red when it matches the column
    line(ctx, X(back), Y(0), X(back), Y(hh), hit ? C.good : '#e4573d', 3);
    // the column for comparison, to scale, on its base
    const cx = toe * 0.45, cw = 3.7 * s;
    ctx.fillStyle = 'rgba(239,232,218,0.55)'; ctx.fillRect(cx - 2.75 * s, Y(BASE), 5.5 * s, BASE * s);
    ctx.fillStyle = 'rgba(239,232,218,0.9)'; ctx.fillRect(cx - cw / 2, Y(BASE + COLUMN), cw, COLUMN * s);
    line(ctx, cx + cw, Y(BASE + COLUMN), X(back) - 4, Y(BASE + COLUMN), C.faint, 1, [3, 3]);
    line(ctx, X(back) - 10, Y(COLUMN), X(back), Y(COLUMN), C.accent, 2);
    label(ctx, t('100 Roman feet'), X(back) - 12, Y(COLUMN), { size: 9, align: 'right', color: C.accent });
    label(ctx, t('Trajan’s Column'), cx, ground + 11, { size: 9, color: C.soft });
    label(ctx, t('Forum floor'), (cx + X(back)) / 2, ground + 11, { size: 9, color: C.faint });
    label(ctx, t('Hillside'), X(Math.min(80, xEnd + 6)), Y(Math.min(top, maxM) / 2), { size: 10, color: C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A hillside cut back by {n} metres, leaving a face {h} metres high', { n: formatNumber(back), h: formatNumber(Math.round(h * 10) / 10) })} />
      <Choice
        label={t('Slope of the hillside')}
        options={SLOPES.map((d) => ({ value: d, label: t('{n}° slope', { n: d }) }))}
        value={slope}
        onChange={setSlope}
      />
      <Range label={t('Cut back into the hill')} value={back} min={0} max={90} step={0.5} onChange={setBack} format={(v) => `${formatNumber(v)} m`} />
      <Readouts
        items={[
          { label: t('Height of the cut face'), value: t('{m} m = {f} Roman feet', { m: formatNumber(Math.round(h * 10) / 10), f: formatNumber(Math.round(h / FOOT)) }), tone: hit ? 'good' : 'accent' },
          { label: t('Earth dug out per metre of hillside'), value: `${formatNumber(Math.round(earthPerMetre(slope, back)))} m³` },
        ]}
      />
      <p className="lab__note">{t('Simplified: a straight hillside cut back to a vertical face; real hillsides are uneven.')}</p>
    </div>
  );
}
