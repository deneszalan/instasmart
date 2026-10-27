import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The three populations in the Living Planet Index 2026 technical report's example: 400, 50 and 33 animals. */
export const START = [400, 50, 33];

/** Each population's size after changing by `changes` (in %, e.g. -60). */
export const after = (changes: number[]) => START.map((n, i) => n * (1 + changes[i] / 100));

/** The index's change in %: the geometric mean of each population's ratio of new to old size, as the LPI averages. */
export function indexChange(changes: number[]) {
  const logs = changes.map((c) => Math.log10(Math.max(1e-6, 1 + c / 100)));
  return (Math.pow(10, logs.reduce((s, x) => s + x, 0) / logs.length) - 1) * 100;
}

/** The plain average of the populations' changes, in %. */
export const meanChange = (changes: number[]) => changes.reduce((s, c) => s + c, 0) / changes.length;

/** The change in the total number of animals, in %. */
export function totalChange(changes: number[]) {
  const before = START.reduce((s, n) => s + n, 0), now = after(changes).reduce((s, n) => s + n, 0);
  return ((now - before) / before) * 100;
}

const UP = '#5cc8b2', DOWN = '#f2a84b';
const pct = (v: number) => `${v > 0.05 ? '+' : v < -0.05 ? '−' : ''}${formatNumber(Math.abs(Math.round(v)))}%`;

export default function LivingPlanetIndex({ onDone }: LabProps) {
  const [a, setA] = useState(5);
  const [b, setB] = useState(-60);
  const [c, setC] = useState(0);
  const changes = [a, b, c];
  const idx = indexChange(changes), tot = totalChange(changes);
  useGoal(idx <= -50 && tot >= 0, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const now = after(changes);
    const cols = [w * 0.2, w * 0.55, w * 0.83];
    const r = Math.max(1.3, Math.min(2.4, w / 190)), step = r * 2.6;
    START.forEach((n0, i) => {
      const n = Math.round(now[i]), max = Math.max(n0, n);
      const perRow = i === 0 ? 20 : 8;
      const x0 = cols[i] - (perRow * step) / 2, y0 = 22;
      for (let j = 0; j < max; j++) {
        const x = x0 + (j % perRow) * step, y = y0 + Math.floor(j / perRow) * step;
        if (y > h - 34) break;
        ctx.fillStyle = j < n ? (n >= n0 ? UP : DOWN) : 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      label(ctx, t('{a} → {b}', { a: n0, b: formatNumber(n) }), cols[i], h - 22, { size: 11, color: C.ink });
      label(ctx, pct(changes[i]), cols[i], h - 8, { size: 10.5, color: n >= n0 ? UP : DOWN });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Three populations change by {a}, {b} and {c}; the index changes by {i} and the number of animals by {n}', { a: pct(a), b: pct(b), c: pct(c), i: pct(idx), n: pct(tot) })} />
      <Range label={t('400 animals')} value={a} min={-95} max={100} step={5} onChange={setA} format={pct} />
      <Range label={t('50 animals')} value={b} min={-95} max={100} step={5} onChange={setB} format={pct} />
      <Range label={t('33 animals')} value={c} min={-95} max={100} step={5} onChange={setC} format={pct} />
      <Readouts
        items={[
          { label: t('Average of the changes'), value: pct(meanChange(changes)) },
          { label: t('Index (geometric mean)'), value: pct(idx), tone: idx <= -50 ? 'bad' : undefined },
          { label: t('Animals in total'), value: pct(tot), tone: tot >= 0 ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: three populations, one step and no weights.')}</p>
    </div>
  );
}
