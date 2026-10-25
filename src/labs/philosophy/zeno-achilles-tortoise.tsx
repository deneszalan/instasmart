import { useState } from 'react';
import { Btn, C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Zeno's catch-up steps: each time Achilles reaches where the tortoise was, it has moved on. Times of the first `n` steps. */
export function steps(lead: number, fast: number, slow: number, n: number) {
  const out: number[] = [];
  let gap = lead;
  for (let k = 0; k < n; k++) {
    const time = gap / fast;
    out.push(time);
    gap = slow * time;
  }
  return out;
}

/** Infinitely many steps, one finite total: he draws level after lead ÷ (fast − slow) seconds. */
export const catchUp = (lead: number, fast: number, slow: number) => lead / (fast - slow);

export default function Zeno({ onDone }: LabProps) {
  const [lead, setLead] = useState(100);
  const [fast, setFast] = useState(10);
  const [n, setN] = useState(0);
  const slow = 1, times = steps(lead, fast, slow, n), sum = times.reduce((a, b) => a + b, 0), total = catchUp(lead, fast, slow);
  useGoal(n >= 6, onDone);
  const change = (set: (v: number) => void) => (v: number) => (set(v), setN(0));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the track, zoomed so the current gap fills the view
    const achilles = fast * sum, tortoise = lead + slow * sum, gap = tortoise - achilles;
    const view = Math.max(gap * 2.5, 1e-9), left = achilles - view * 0.2, X = (m: number) => 14 + ((m - left) / view) * (w - 28);
    const ty = h * 0.34;
    line(ctx, 0, ty + 12, w, ty + 12, C.faint, 1);
    label(ctx, '🏃', X(achilles), ty, { size: 20 });
    label(ctx, '🐢', X(tortoise), ty + 2, { size: 18 });
    label(ctx, t('gap {m} m', { m: gap >= 0.01 ? formatNumber(Math.round(gap * 100) / 100) : gap.toExponential(1) }), w / 2, ty + 30, { size: 10.5 });
    if (n) label(ctx, t('zoom ×{z}', { z: formatNumber(Math.round(lead / gap)) }), w - 10, 10, { size: 10, align: 'right', color: C.faint });
    // the ledger: each step's time, and the running total closing in on the answer
    const by = h * 0.58, bh = h - by - 18, bw = (w - 28) / 10;
    times.slice(0, 10).forEach((s, i) => {
      const bar = (s / times[0]) * bh;
      ctx.fillStyle = C.accent;
      ctx.fillRect(14 + i * bw + 2, by + bh - bar, bw - 4, Math.max(1, bar));
    });
    label(ctx, t('time of each step'), 14, by - 8, { size: 10, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Achilles chasing the tortoise, after {n} catch-up steps', { n })} />
      <Range label={t('Head start')} value={lead} min={10} max={200} step={10} onChange={change(setLead)} format={(v) => `${v} m`} />
      <Range label={t('Achilles')} value={fast} min={2} max={12} onChange={change(setFast)} format={(v) => t('{v} m/s; tortoise 1', { v })} />
      <div className="lab__row">
        <Btn onClick={() => setN((k) => k + 1)}>{t('Next catch-up step')}</Btn>
        <Btn ghost onClick={() => setN(0)}>
          {t('Start again')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Steps'), value: String(n) },
          { label: t('Time so far'), value: `${formatNumber(Math.round(sum * 10000) / 10000)} s`, tone: 'accent' },
          { label: t('All of them add up to'), value: `${formatNumber(Math.round(total * 100) / 100)} s`, tone: 'good' },
        ]}
      />
    </div>
  );
}
