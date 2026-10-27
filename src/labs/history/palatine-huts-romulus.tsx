import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Livy 1.60: the kings ruled Rome for 244 years, from its founding to its liberation. */
export const KING_YEARS = 244;
/** Romulus, Numa Pompilius, Tullus Hostilius, Ancus Marcius, Tarquinius Priscus, Servius Tullius, Tarquinius Superbus. */
export const KINGS = 7;
/** The first consuls took office in 509 BC by Varro's count. */
export const REPUBLIC_BC = 509;
/** Varro's founding year, the standard one. */
export const VARRO_BC = 753;
/** Founding years given by ancient writers (Dionysius of Halicarnassus 1.74; Wikipedia, "Founding of Rome"). */
export const ANCIENT = [
  { who: 'Timaeus', bc: 814 },
  { who: 'Varro', bc: 753 },
  { who: 'Cato', bc: 751 },
  { who: 'Fabius Pictor', bc: 748 },
  { who: 'Cincius', bc: 728 },
] as const;
/** The hut village on the Palatine's Cermalus, dated by its finds to about the 9th–7th centuries BC. */
export const VILLAGE_BC = [900, 600] as const;

/** The founding year (BC) if seven kings each reigned `reign` years before the Republic began in 509 BC. */
export const foundingYear = (reign: number) => REPUBLIC_BC + Math.round(KINGS * reign);
/** The average reign that a founding year needs. */
export const reignFor = (bc: number) => (bc - REPUBLIC_BC) / KINGS;
/** The ancient date nearest a founding year. */
export const nearest = (bc: number) => ANCIENT.reduce((a, b) => (Math.abs(b.bc - bc) < Math.abs(a.bc - bc) ? b : a));

const GOLD = '#f2c35b', DIG = '#e8805a', SKY = '#8fbfe0';
const OLD = 950, NEW = 450;

export default function PalatineKings({ onDone }: LabProps) {
  const [reign, setReign] = useState(20);
  const year = foundingYear(reign);
  const hit = year === VARRO_BC;
  useGoal(hit, onDone);
  const near = nearest(year);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 10, R = w - 10, X = (bc: number) => L + ((R - L) * (OLD - bc)) / (OLD - NEW);
    const top = Math.max(22, h * 0.17), barH = h * 0.26, axisY = top + barH + h * 0.17;
    // the Republic from 509 BC
    ctx.fillStyle = SKY;
    ctx.fillRect(X(REPUBLIC_BC), top, R - X(REPUBLIC_BC), barH);
    label(ctx, t('Republic, from 509 BC'), R, top + barH + h * 0.07, { size: 9, color: SKY, align: 'right' });
    // seven reigns counted back from it
    for (let i = 0; i < KINGS; i++) {
      const b = REPUBLIC_BC + i * reign, a = Math.min(OLD, b + reign);
      if (b >= OLD) break;
      ctx.fillStyle = i % 2 ? '#d9a94a' : GOLD;
      ctx.fillRect(X(a) + 0.5, top, X(b) - X(a) - 1, barH);
    }
    // the founding year that gives
    const fx = X(Math.min(OLD, year));
    line(ctx, fx, top - 4, fx, axisY + 4, hit ? C.good : C.ink, 2);
    label(ctx, formatNumber(year, 'year'), Math.max(30, fx), top - 10, { size: 12, color: hit ? C.good : C.ink });
    // the axis, with the ancient writers' dates
    line(ctx, L, axisY, R, axisY, C.faint, 1.5);
    for (const bc of [900, 800, 700, 600, 500]) label(ctx, formatNumber(bc, 'year'), X(bc), axisY + h * 0.08, { size: 9, color: C.faint });
    for (const d of ANCIENT) dot(ctx, X(d.bc), axisY, d.bc === VARRO_BC ? 4 : 2.5, d.bc === VARRO_BC ? GOLD : C.soft);
    // the hut village, dated by digging
    const vy = axisY + h * 0.16;
    ctx.fillStyle = DIG;
    ctx.fillRect(X(VILLAGE_BC[0]), vy, X(VILLAGE_BC[1]) - X(VILLAGE_BC[0]), 7);
    label(ctx, t('Palatine hut village, dated by digging'), (X(VILLAGE_BC[0]) + X(VILLAGE_BC[1])) / 2, vy + 6 + h * 0.08, { size: 9.5, color: DIG });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Seven reigns of {r} years counted back from 509 BC reach {n} BC', { r: formatNumber(reign), n: formatNumber(year, 'year') })} />
      <Range label={t('Average reign of each king')} value={reign} min={15} max={50} step={0.1} onChange={setReign} format={(v) => t('{n} years', { n: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Founding year by this count, BC'), value: formatNumber(year, 'year'), tone: hit ? 'good' : 'accent' },
          { label: t('Years of the seven kings'), value: t('{n} years', { n: formatNumber(year - REPUBLIC_BC) }) },
          { label: t('Nearest ancient founding date, BC'), value: `${near.who}: ${formatNumber(near.bc, 'year')}` },
        ]}
      />
      <p className="lab__note">{t('Simplified: one average reign for all seven kings, counted back from 509 BC, the first year of the Republic by Varro’s count.')}</p>
    </div>
  );
}
