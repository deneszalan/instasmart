import { useState } from 'react';
import { C, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The half-life of carbon-14, in years (about 5,700). */
export const HALF_LIFE = 5700;
/** The share of carbon-14 left after `years`. */
export const fractionLeft = (years: number) => Math.pow(0.5, years / HALF_LIFE);
/** The years since death that leave `fraction` of the carbon-14: the half-life times log₂(1 / fraction). */
export const ageFromFraction = (fraction: number) => HALF_LIFE * Math.log2(1 / fraction);
/** Westminster Abbey's radiocarbon result for the man in its Roman sarcophagus, as calendar years. */
export const RANGE: [number, number] = [987, 1052];
export const THIS_YEAR = 2026;

const GOLD = '#e0b85a', CYAN = '#6fd3e0';

export default function WestminsterRadiocarbon({ onDone }: LabProps) {
  const [percent, setPercent] = useState(75);
  const age = ageFromFraction(percent / 100);
  const year = Math.round(THIS_YEAR - age);
  const hit = year >= RANGE[0] && year <= RANGE[1];
  useGoal(hit, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 40, x1 = w - 10, y0 = 18, y1 = h - 24, span = 2 * HALF_LIFE;
    const X = (yr: number) => lerp(x0, x1, yr / span), Y = (f: number) => lerp(y1, y0, f);
    for (const f of [0.25, 0.5, 0.75, 1]) {
      ctx.strokeStyle = C.line;
      ctx.beginPath();
      ctx.moveTo(x0, Y(f));
      ctx.lineTo(x1, Y(f));
      ctx.stroke();
      label(ctx, `${f * 100}%`, x0 - 4, Y(f), { size: 9, align: 'right', color: C.faint });
    }
    for (const yr of [0, HALF_LIFE, span]) label(ctx, t('{n} years', { n: formatNumber(yr) }), X(yr), y1 + 12, { size: 9, align: yr === 0 ? 'left' : yr === span ? 'right' : 'center', color: C.faint });
    // the Saxon window, on the curve
    const a0 = THIS_YEAR - RANGE[1], a1 = THIS_YEAR - RANGE[0];
    ctx.fillStyle = 'rgba(224,184,90,0.25)';
    ctx.fillRect(X(a0), y0, Math.max(3, X(a1) - X(a0)), y1 - y0);
    label(ctx, t('987–1052'), X(a1) + 4, y1 - 8, { size: 10, align: 'left', color: GOLD });
    // the curve
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const yr = (i / 120) * span;
      const px = X(yr), py = Y(fractionLeft(yr));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.lineWidth = 1.5;
    // the reading
    const px = X(Math.min(span, age)), py = Y(percent / 100);
    ctx.strokeStyle = hit ? GOLD : C.soft;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, py);
    ctx.lineTo(px, py);
    ctx.lineTo(px, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = hit ? GOLD : C.ink;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    // the reading, in the top-right corner, where the curve never goes
    label(ctx, t('{p}% left → {n} years', { p: percent.toFixed(1), n: formatNumber(Math.round(age)) }), x1 - 4, y0 + 8, { size: 10, align: 'right', color: hit ? GOLD : C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{p}% of the carbon-14 left means about {n} years since death, so the year {y}', { p: percent.toFixed(1), n: formatNumber(Math.round(age)), y: year })} />
      <Range label={t('Carbon-14 left in the bone')} value={percent} min={60} max={100} step={0.1} onChange={setPercent} format={(v) => `${v.toFixed(1)}%`} />
      <Readouts
        items={[
          { label: t('Years since death'), value: formatNumber(Math.round(age)) },
          { label: t('Year of death'), value: `${year}`, tone: hit ? 'good' : undefined },
          { label: t('In 987–1052?'), value: hit ? t('yes') : t('no'), tone: hit ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the age from the 5,700-year half-life alone, counted back from 2026. A real date also needs the tree-ring calibration curve and comes with a range.')}</p>
    </div>
  );
}
