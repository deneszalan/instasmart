import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Rome had six Vestals at a time (Plutarch; Dionysius of Halicarnassus). */
export const PLACES = 6;
/** Ancient writers split the first thirty years into ten learning, ten performing the rites and ten teaching. */
export const DECADE = 10;

/** In the model every Vestal serves `term` years and the six joined at even intervals: one new girl every term ÷ 6 years. */
export const interval = (term: number) => term / PLACES;

export type Phase = 'learning' | 'performing' | 'teaching' | 'staying';
const stageOf = (age: number): Phase => (age < DECADE ? 'learning' : age < 2 * DECADE ? 'performing' : age < 3 * DECADE ? 'teaching' : 'staying');

/** How many of the six are in each stage in `year` of the model. */
export function stages(term: number, year: number): Record<Phase, number> {
  const out: Record<Phase, number> = { learning: 0, performing: 0, teaching: 0, staying: 0 };
  for (let v = 0; v < PLACES; v++) {
    const age = (((year - v * interval(term)) % term) + term) % term;
    out[stageOf(age)]++;
  }
  return out;
}

const COLOUR: Record<Phase, string> = { learning: '#7fb7e6', performing: '#ffc857', teaching: '#ef6f5e', staying: '#b9a3d6' };
const OCCIA = 57, SPAN = 120;

export default function VestalsTerm({ onDone }: LabProps) {
  const [term, setTerm] = useState(30);
  const [year, setYear] = useState(40);
  useGoal(term >= OCCIA, onDone);
  const now = stages(term, year);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 8, R = w - 8, T = 6, B = h - 16, lane = (B - T) / PLACES;
    const X = (y: number) => L + ((R - L) * y) / SPAN;
    for (let v = 0; v < PLACES; v++) {
      const y0 = T + v * lane;
      for (let start = v * interval(term) - term; start < SPAN; start += term) {
        for (let a = 0; a < term; a += 1) {
          const y = start + a;
          if (y < 0 || y >= SPAN) continue;
          ctx.fillStyle = COLOUR[stageOf(a)];
          ctx.fillRect(X(y), y0 + 1, X(y + 1) - X(y) + 0.3, lane - 4);
        }
        if (start >= 0 && start < SPAN) { ctx.fillStyle = C.ink; ctx.fillRect(X(start) - 1, y0, 2, lane - 2); }
      }
    }
    line(ctx, X(year), T - 2, X(year), B, C.ink, 2);
    for (const y of [0, 30, 60, 90, 120]) label(ctx, formatNumber(y), X(y), B + 9, { size: 9, color: C.faint, align: y === 0 ? 'left' : y === SPAN ? 'right' : 'center' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Six Vestals’ terms of service over {n} years', { n: SPAN })} />
      <Range label={t('Years each Vestal serves')} value={term} min={30} max={60} step={1} onChange={(v) => setTerm(Math.round(v))} format={(v) => formatNumber(v)} />
      <Range label={t('Year in the model')} value={year} min={0} max={SPAN} step={1} onChange={(v) => setYear(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('A new Vestal every'), value: t('{n} years', { n: formatNumber(Math.round(interval(term) * 10) / 10) }), tone: 'accent' },
          { label: t('Learning (years 0–10)'), value: formatNumber(now.learning) },
          { label: t('Performing the rites (10–20)'), value: formatNumber(now.performing) },
          { label: t('Teaching (20–30)'), value: formatNumber(now.teaching) },
          { label: t('Staying on (30+)'), value: formatNumber(now.staying) },
        ]}
      />
      <p className="lab__note">{t('Model: every Vestal serves the same term, and the six are chosen at even intervals.')}</p>
    </div>
  );
}
