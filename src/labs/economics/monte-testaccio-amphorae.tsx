import { useEffect, useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A Dressel 20 olive-oil jar held about 70 litres. */
export const LITRES = 70;
/** The two published estimates of the jars in the hill: José Remesal's and the one Bryan Ward-Perkins cites. */
export const ESTIMATES = [25e6, 53e6] as const;

/** Litres of oil in `jars` jars. */
export const totalLitres = (jars: number, litres = LITRES) => jars * litres;
/** Litres a year, if the jars arrived evenly over `years` years. */
export const litresPerYear = (jars: number, years: number, litres = LITRES) => totalLitres(jars, litres) / years;

export default function MonteTestaccio({ onDone }: LabProps) {
  const [millions, setMillions] = useState(40);
  const [years, setYears] = useState(250);
  const [seen, setSeen] = useState<[boolean, boolean]>([false, false]);
  const jars = millions * 1e6;
  useEffect(() => {
    if (jars === ESTIMATES[0] && !seen[0]) setSeen([true, seen[1]]);
    if (jars === ESTIMATES[1] && !seen[1]) setSeen([seen[0], true]);
  }, [jars, seen]);
  useGoal(seen[0] && seen[1], onDone);

  const perYear = litresPerYear(jars, years);
  const billions = totalLitres(jars) / 1e9;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // one jar icon for each million jars, in rows
    const cols = 15, cell = Math.min((w - 16) / cols, (h - 30) / 6);
    for (let i = 0; i < millions; i++) {
      const x = 8 + (i % cols) * cell + cell / 2, y = 10 + Math.floor(i / cols) * cell + cell / 2;
      const hit = ESTIMATES.some((e) => i === e / 1e6 - 1);
      ctx.fillStyle = hit ? C.accent : 'rgba(221,139,92,0.9)';
      ctx.beginPath();
      ctx.ellipse(x, y + cell * 0.06, cell * 0.3, cell * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - cell * 0.07, y - cell * 0.36, cell * 0.14, cell * 0.16);
    }
    label(ctx, t('each icon = 1 million jars'), w - 8, h - 10, { size: 10, align: 'right', color: C.soft });
    label(ctx, t('{n} million', { n: formatNumber(millions) }), 8, h - 10, { size: 11, align: 'left', color: C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{n} million olive-oil jars, about {b} billion litres of oil', { n: formatNumber(millions), b: formatNumber(Math.round(billions * 100) / 100) })} />
      <Range label={t('Jars in the hill')} value={millions} min={10} max={90} step={1} onChange={(v) => setMillions(Math.round(v))} format={(v) => t('{n} million', { n: formatNumber(v) })} />
      <Range label={t('Years of dumping')} value={years} min={100} max={300} step={10} onChange={(v) => setYears(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Oil in all'), value: t('{n} billion litres', { n: formatNumber(Math.round(billions * 100) / 100) }), tone: 'accent' },
          { label: t('Oil a year, on average'), value: t('{n} million litres', { n: formatNumber(Math.round(perYear / 1e5) / 10) }) },
          { label: t('Estimates tried'), value: `${seen.filter(Boolean).length} / 2`, ...(seen[0] && seen[1] ? { tone: 'good' as const } : {}) },
        ]}
      />
      <p className="lab__note">{t('Simplified: every jar held 70 litres and the jars came evenly over the years; the real flow rose and fell.')}</p>
    </div>
  );
}
