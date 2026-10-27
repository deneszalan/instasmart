import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Four nuclides in spent fuel, with their half-lives in years (NUBASE2020, via Wikipedia). */
export const NUCLIDES = [
  { id: 'sr90', name: 'Sr-90', half: 28.91, colour: '#7dd3fc' },
  { id: 'cs137', name: 'Cs-137', half: 30.04, colour: '#c6f26b' },
  { id: 'am241', name: 'Am-241', half: 432.6, colour: '#fdba74' },
  { id: 'pu239', name: 'Pu-239', half: 24110, colour: '#f9a8d4' },
] as const;

/** The share of a nuclide left after `years`: one half for every half-life that has passed. */
export const remaining = (half: number, years: number) => 2 ** (-years / half);

/** Years until a share `frac` is left. */
export const yearsUntil = (half: number, frac: number) => half * Math.log2(1 / frac);

/** The slider runs from 1 to a million years on a log scale. */
export const yearsAt = (pos: number) => 10 ** ((pos / 100) * 6);

const GOAL = 1 / 1000;

export default function Onkalo({ onDone }: LabProps) {
  const [pos, setPos] = useState(25);
  const years = yearsAt(pos);
  const cs = remaining(NUCLIDES[1].half, years), pu = remaining(NUCLIDES[3].half, years);
  const reached = cs < GOAL;
  useGoal(reached, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // bars on a log scale from 1 (all left) down to one in a million
    const top = 22, bottom = h - 26, L = (v: number) => top + ((-Math.log10(Math.max(v, 1e-6))) / 6) * (bottom - top);
    for (const [v, lab] of [[1, t('all left')], [1e-3, t('a thousandth')], [1e-6, t('a millionth')]] as const) {
      line(ctx, 80, L(v), w - 10, L(v), v === GOAL ? 'rgba(253,224,71,0.6)' : C.line, v === GOAL ? 1.5 : 1, v === GOAL ? [5, 4] : []);
      label(ctx, lab, 76, L(v), { size: 10, align: 'right', color: v === GOAL ? C.accent : C.faint });
    }
    const n = NUCLIDES.length, gap = (w - 90) / n;
    NUCLIDES.forEach((nu, i) => {
      const v = remaining(nu.half, years), x = 90 + i * gap + gap * 0.18, bw = gap * 0.64;
      ctx.fillStyle = nu.colour;
      ctx.fillRect(x, L(v), bw, bottom - L(v));
      label(ctx, nu.name, x + bw / 2, h - 12, { size: 11, color: C.ink });
      label(ctx, v >= 0.01 ? `${formatNumber(Math.round(v * 100))}%` : v > 1e-6 ? '<1%' : '≈0', x + bw / 2, Math.max(top + 2, L(v) - 10), { size: 10, color: C.soft });
    });
  };

  const yearsText = years < 10 ? formatNumber(Math.round(years * 10) / 10) : formatNumber(Math.round(years / (years < 1000 ? 1 : years < 1e5 ? 10 : 1000)) * (years < 1000 ? 1 : years < 1e5 ? 10 : 1000));
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Bars for four radioactive nuclides in spent fuel, showing the share of each left after {y} years', { y: yearsText })} />
      <Range label={t('Years in the repository')} value={pos} min={0} max={100} step={1} onChange={setPos} format={() => yearsText} />
      <Readouts
        items={[
          { label: t('Caesium-137 left'), value: cs >= 0.01 ? `${formatNumber(Math.round(cs * 100))}%` : cs > 1e-9 ? t('one part in {n}', { n: formatNumber(Number((1 / cs).toPrecision(2))) }) : '≈ 0', tone: reached ? 'good' : undefined },
          { label: t('Its half-lives so far'), value: formatNumber(Math.round((years / NUCLIDES[1].half) * 10) / 10) },
          { label: t('Plutonium-239 left'), value: `${formatNumber(Math.round(pu * 1000) / 10)}%` },
        ]}
      />
      <p className="lab__note">{t('Simplified: each nuclide on its own, as a share of what it started with. Real spent fuel is a changing mix, and some nuclides turn into others.')}</p>
    </div>
  );
}
