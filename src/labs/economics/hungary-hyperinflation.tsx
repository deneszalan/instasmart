import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Place = 'hu' | 'zw' | 'de';
/** Hours for prices to double at the peak: Hungary July 1946 (about 15), Zimbabwe November 2008 (24.35), Germany October 1923 (3.65 days). */
export const DOUBLING: Record<Place, number> = { hu: 15, zw: 24.35, de: 87.6 };

/** How many times prices have multiplied after `hours`. */
export const priceFactor = (hours: number, doubling: number) => Math.pow(2, hours / doubling);

/** A big number written out in full, with its digits grouped. */
export const written = (n: number) => (n < 1e15 ? formatNumber(Math.round(n)) : `${formatNumber(Math.round(n / Math.pow(10, Math.floor(Math.log10(n)) - 2)) / 100)} × 10^${Math.floor(Math.log10(n))}`);

export default function Hyperinflation({ onDone }: LabProps) {
  const [place, setPlace] = useState<Place>('hu');
  const [hours, setHours] = useState(0);
  const f = priceFactor(hours, DOUBLING[place]);
  useGoal(place === 'hu' && hours >= 240, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the price tag
    const tagH = Math.min(58, h * 0.36);
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(10, 8, w - 20, tagH, 10);
    ctx.fill();
    const price = written(f);
    const tag = place === 'hu' ? t('{p} pengő', { p: price }) : place === 'zw' ? t('{p} Zimbabwe dollars', { p: price }) : t('{p} marks', { p: price });
    label(ctx, tag, w / 2, 8 + tagH / 2, { size: Math.max(12, Math.min(26, (w - 40) / (tag.length * 0.6))), color: '#78350f' });
    // prices on a scale where each line is ten times the last
    const top = tagH + 24, bot = h - 18, L = 34, R = w - 10, X = (hr: number) => L + (hr / 240) * (R - L), maxLog = 240 / DOUBLING.hu * Math.log10(2), Y = (lg: number) => bot - (lg / maxLog) * (bot - top);
    for (let k = 0; k <= maxLog; k += 1) {
      line(ctx, L, Y(k), R, Y(k), C.line, 1);
      if (k % 2 === 0) label(ctx, `×10^${k}`, L - 4, Y(k), { size: 8.5, align: 'right', color: C.faint });
    }
    for (const [p, colour] of [['de', '#a5b4fc'], ['zw', '#86efac'], ['hu', C.accent]] as const) {
      ctx.strokeStyle = colour;
      ctx.lineWidth = p === place ? 3 : 1.5;
      ctx.globalAlpha = p === place ? 1 : 0.5;
      ctx.beginPath();
      for (let hr = 0; hr <= 240; hr += 4) ctx[hr ? 'lineTo' : 'moveTo'](X(hr), Y(Math.log10(priceFactor(hr, DOUBLING[p]))));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    line(ctx, X(hours), top, X(hours), bot, C.ink, 1.5);
    for (let d = 0; d <= 10; d += 2) label(ctx, t('day {d}', { d }), X(d * 24), bot + 10, { size: 9, color: C.faint, align: d === 10 ? 'right' : 'center' });
    label(ctx, place === 'hu' ? t('July 1946') : place === 'zw' ? t('November 2008') : t('October 1923'), R, top - 6, { size: 9.5, align: 'right', color: C.soft });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Hyperinflation')}
        value={place}
        onChange={setPlace}
        options={[
          { value: 'hu', label: t('Hungary') },
          { value: 'zw', label: t('Zimbabwe') },
          { value: 'de', label: t('Germany') },
        ]}
      />
      <Stage draw={draw} label={t('A price that was 1, after {h} hours of prices doubling every {d} hours', { h: hours, d: DOUBLING[place] })} />
      <Range label={t('Time since payday')} value={hours} min={0} max={240} onChange={setHours} format={(v) => (v < 48 ? t('{n} h', { n: v }) : t('{n} days', { n: formatNumber(Math.round((v / 24) * 10) / 10) }))} />
      <Readouts
        items={[
          { label: t('Prices doubled'), value: t('{n} times', { n: formatNumber(Math.floor(hours / DOUBLING[place])) }) },
          { label: t('Your pay now buys'), value: f < 1.5 ? t('as much') : f < 1e9 ? t('{n}× less', { n: formatNumber(Math.round(f)) }) : t('almost nothing'), tone: 'bad' },
        ]}
      />
    </div>
  );
}
