import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Millimetres a year: a fingernail (3.5 mm a month), the Mid-Atlantic Ridge (10–40 mm; 25 here) and the Nazca Plate (up to about 160). */
export const RATES = { nail: 42, ridge: 25, nazca: 160 };

/** Years on the time slider: 0…100 on a log scale from 1 year to 200 million. */
export const yearsAt = (v: number) => Math.pow(10, (v / 100) * Math.log10(2e8));

/** A distance in mm, in the handiest unit. */
export function distance(mm: number) {
  if (mm < 1000) return `${formatNumber(Math.round(mm))} mm`;
  if (mm < 1e6) return `${formatNumber(Math.round(mm / 100) / 10)} m`;
  return `${formatNumber(mm < 1e8 ? Math.round(mm / 1e5) / 10 : Math.round(mm / 1e6))} km`;
}

export default function PlatesSpeed({ onDone }: LabProps) {
  const [v, setV] = useState(0);
  const years = yearsAt(v);
  useGoal(years >= 1e8, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the race: how far each has gone, on a ruler that rescales itself
    const L = 92, R = w - 14, max = RATES.nazca * years, p = Math.pow(10, Math.floor(Math.log10(max)));
    const unit = [1, 2, 5, 10].map((k) => k * p).find((u) => u >= max)!;
    const X = (mm: number) => L + (mm / unit) * (R - L);
    const rows: [string, number, string][] = [
      [t('Fingernail'), RATES.nail, '#fca5a5'],
      [t('Mid-Atlantic'), RATES.ridge, C.cool],
      [t('Nazca Plate'), RATES.nazca, C.accent],
    ];
    rows.forEach(([name, rate, colour], i) => {
      const y = 16 + i * 20;
      label(ctx, name, 8, y, { size: 10.5, align: 'left' });
      ctx.fillStyle = colour;
      ctx.fillRect(L, y - 5, X(rate * years) - L, 10);
    });
    line(ctx, L, 76, R, 76, C.faint, 1);
    for (let k = 0; k <= 10; k += 2) {
      line(ctx, X((k / 10) * unit), 73, X((k / 10) * unit), 79, C.faint, 1);
      if (k === 0 || k === 10) label(ctx, k ? distance(unit) : '0', X((k / 10) * unit), 87, { size: 9.5, color: C.faint, align: k ? 'right' : 'left' });
    }
    // an ocean opening at the ridge's pace, between two halves of a supercontinent
    const top = 100, bot = h - 8, mid = w / 2, gap = RATES.ridge * years, kmPerPx = 7000 / (w * 0.9);
    const half = Math.min(w * 0.45, gap / 1e6 / kmPerPx / 2);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, top, w, bot - top);
    const coast = (y: number) => Math.sin((y - top) / 13) * 9 + Math.sin((y - top) / 5) * 3;
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.moveTo(side < 0 ? 0 : w, top);
      for (let y = top; y <= bot; y += 3) ctx.lineTo(mid + coast(y) + side * half, y);
      ctx.lineTo(side < 0 ? 0 : w, bot);
      ctx.closePath();
      ctx.fill();
    }
    if (half > 3) line(ctx, mid + coast(top), top, mid + coast(bot), bot, '#fca5a5', 1.5, [4, 3]);
    label(ctx, gap < 1e6 ? t('a crack') : t('ocean {km} km wide', { km: formatNumber(Math.round(gap / 1e6)) }), mid, top + 12, { size: 11, color: C.ink });
  };

  const fmtYears = (y: number) => (y < 1e3 ? t('{n} years', { n: formatNumber(Math.round(y)) }) : y < 1e6 ? t('{n} thousand years', { n: formatNumber(Math.round(y / 100) / 10) }) : t('{n} million years', { n: formatNumber(Math.round(y / 1e5) / 10) }));
  return (
    <div className="lab">
      <Stage draw={draw} label={t('How far a fingernail and two plates move in {time}, and an ocean opening', { time: fmtYears(years) })} />
      <Range label={t('Time')} value={v} min={0} max={100} step={0.5} onChange={setV} format={() => fmtYears(years)} />
      <Readouts
        items={[
          { label: t('Fingernail'), value: distance(RATES.nail * years) },
          { label: t('Mid-Atlantic'), value: distance(RATES.ridge * years), tone: 'accent' },
          { label: t('Nazca Plate'), value: distance(RATES.nazca * years) },
        ]}
      />
    </div>
  );
}
