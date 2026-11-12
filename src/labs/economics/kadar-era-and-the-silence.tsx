import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The material side of the Kádár-era bargain, in the Hungarian Statistical Office's long series (Statistical Yearbook of
 * Hungary 2023, table 1.2; 1960 = 100): the real wage per wage-earner and real income per head, every five years from
 * 1960 to 1990. The reader moves through the years and finds when real wages stopped rising.
 */
export const YEARS = [1960, 1965, 1970, 1975, 1980, 1985, 1990];
export const WAGE = [100, 109, 129, 152, 158, 151, 142];
export const INCOME = [100, 118, 159, 199, 216, 236, 245];
/** The year real wages peaked, in this series. */
export const peakYear = () => YEARS[WAGE.indexOf(Math.max(...WAGE))];
/** The change in % from one year of the series to the next. */
export const change = (vals: number[], i: number) => (i === 0 ? 0 : (vals[i] / vals[i - 1] - 1) * 100);

const OLIVE = '#9db37f', PAPRIKA = '#e0763c';

function note(year: number) {
  switch (year) {
    case 1960:
      return t('The start of the series');
    case 1965:
      return t('Two years after the amnesty of 1963');
    case 1970:
      return t('Two years into the New Economic Mechanism');
    case 1975:
      return t('Real wages half as high again as in 1960');
    case 1980:
      return t('The highest real wage in the series');
    case 1985:
      return t('Real wages falling, real income still rising');
    default:
      return t('Real wages below their 1975 level');
  }
}

export default function KadarBargain({ onDone }: LabProps) {
  const [i, setI] = useState(0);
  const year = YEARS[i];
  useGoal(year === peakYear(), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 34, x1 = w - 14, y0 = 24, y1 = h - 40;
    const X = (k: number) => x0 + (k / (YEARS.length - 1)) * (x1 - x0);
    const Y = (v: number) => y1 - ((v - 80) / (260 - 80)) * (y1 - y0);
    for (const v of [100, 150, 200, 250]) {
      line(ctx, x0, Y(v), x1, Y(v), C.line, 1);
      label(ctx, String(v), x0 - 6, Y(v), { size: 9, color: C.faint, align: 'right' });
    }
    YEARS.forEach((yr, k) => label(ctx, String(yr), X(k), y1 + 12, { size: 9, color: k === i ? C.ink : C.faint }));
    const series = (vals: number[], col: string) => {
      for (let k = 1; k <= i; k++) line(ctx, X(k - 1), Y(vals[k - 1]), X(k), Y(vals[k]), col, 3);
      for (let k = 0; k <= i; k++) dot(ctx, X(k), Y(vals[k]), k === i ? 5 : 3, col);
    };
    series(INCOME, PAPRIKA);
    series(WAGE, OLIVE);
    line(ctx, X(i), y0, X(i), y1, C.faint, 1, [3, 4]);
    label(ctx, t('real income per head'), 6, 8, { size: 10, color: PAPRIKA, align: 'left' });
    label(ctx, t('real wage'), w - 6, 8, { size: 10, color: OLIVE, align: 'right' });
    label(ctx, note(year), w / 2, h - 10, { size: 11, color: C.ink });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{year}: real wage {w}, real income per head {r} (1960 = 100)', { year: String(year), w: formatNumber(WAGE[i]), r: formatNumber(INCOME[i]) })} />
      <Range label={t('Year of the series')} value={i} min={0} max={YEARS.length - 1} step={1} onChange={setI} format={(k) => String(YEARS[k])} />
      <Readouts
        items={[
          { label: t('Real wage, 1960 = 100'), value: formatNumber(WAGE[i]), tone: i > 0 && WAGE[i] < WAGE[i - 1] ? 'bad' : 'accent' },
          { label: t('Real income per head'), value: formatNumber(INCOME[i]) },
        ]}
      />
    </div>
  );
}
