import { useMemo, useState } from 'react';
import { C, clamp, dot, label, lerp, line, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { withUnit } from '../../lib/format';

/**
 * The 2026 study's simulation (Molleman and colleagues, Proc. R. Soc. B): 100 people, each with a degree of rule-breaking
 * from 0 (follows the rule) to 1 (breaks it fully). Each step one person sees another and moves towards them:
 * r ← (1 − s)·r + s·X. People move more towards worse examples than better ones; with chance e they overshoot (s > 1).
 * The influence strengths here are illustrative, not the study's estimates.
 */
export const N = 100, STEPS = 30000, S_UP = 0.2, S_DOWN = 0.05, S_ESC = 2, EVERY = 500;
/** The chance of overshooting after a small violation that the study measured: 4.4% of trials. */
export const MEASURED = 0.044;
/** The lab's goal: an average of 90% rule-breaking at the end. */
export const TIPPED = 0.9;
export const SEEDS = [1, 2, 3];

function gauss(rnd: () => number) {
  return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
}

export interface Run {
  /** The average rule-breaking every EVERY steps, from the start. */
  means: number[];
  /** Everyone's rule-breaking at the end. */
  end: number[];
  /** Who never changes: the first `steady` people follow the rule whatever they see. */
  steady: number;
}

/** One run: `e` the chance of overshooting a worse example, `steady` the share who always follow the rule. */
export function simulate(e: number, steady: number, seed: number): Run {
  const rnd = rng(seed), fixed = Math.round(steady * N);
  const r = Array.from({ length: N }, (_, i) => (i < fixed ? 0 : clamp(gauss(rnd) * 0.5, 0, 1)));
  const mean = () => r.reduce((a, b) => a + b, 0) / N;
  const means = [mean()];
  for (let step = 1; step <= STEPS; step++) {
    const a = Math.floor(rnd() * N), b = Math.floor(rnd() * N);
    if (a !== b && a >= fixed) {
      const X = r[b];
      let s = S_DOWN;
      // the average pull towards worse examples stays S_UP whatever e is, as in the study
      if (X > r[a]) s = rnd() < e ? S_ESC : (S_UP - S_ESC * e) / (1 - e);
      r[a] = clamp((1 - s) * r[a] + s * X, 0, 1);
    }
    if (step % EVERY === 0) means.push(mean());
  }
  return { means, end: r, steady: fixed };
}

/** The average rule-breaking at the end, over the lab's three runs. */
export const finalAverage = (runs: Run[]) => runs.reduce((a, x) => a + x.means[x.means.length - 1], 0) / runs.length;

const GREEN = [139, 220, 124], AMBER = [255, 199, 90], RED = [255, 95, 87];
function heat(v: number) {
  const u = clamp(v, 0, 1);
  const m = u < 0.5 ? GREEN.map((x, i) => lerp(x, AMBER[i], u * 2)) : AMBER.map((x, i) => lerp(x, RED[i], (u - 0.5) * 2));
  return `rgb(${m.map(Math.round).join(',')})`;
}

export default function BadAppleRuleBreaking({ onDone }: LabProps) {
  const [e, setE] = useState(0);
  const [steady, setSteady] = useState(0);
  const runs = useMemo(() => SEEDS.map((sd) => simulate(e, steady, sd)), [e, steady]);
  const avg = finalAverage(runs);
  useGoal(avg >= TIPPED, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the first run's 100 people at the end, as a 10 × 10 crate of apples
    const cell = Math.min((w * 0.44) / 10, (h - 24) / 10), x0 = 6, y0 = 16;
    label(ctx, t('100 people at the end'), x0, 7, { size: 10, align: 'left', color: C.soft });
    runs[0].end.forEach((v, i) => {
      const cx = x0 + (i % 10 + 0.5) * cell, cy = y0 + (Math.floor(i / 10) + 0.5) * cell;
      dot(ctx, cx, cy, cell * 0.38, heat(v));
      if (i < runs[0].steady) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, cell * 0.46, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    // right: the average over time, one line per run
    const gx0 = x0 + cell * 10 + 34, gx1 = w - 8, gy0 = 18, gy1 = h - 18;
    label(ctx, t('average rule-breaking over time'), gx0, 7, { size: 10, align: 'left', color: C.soft });
    for (const v of [0, 0.5, 1]) {
      const y = lerp(gy1, gy0, v);
      line(ctx, gx0, y, gx1, y, C.line, 1);
      label(ctx, `${v * 100}%`, gx0 - 4, y, { size: 9, align: 'right', color: C.faint });
    }
    line(ctx, gx0, lerp(gy1, gy0, TIPPED), gx1, lerp(gy1, gy0, TIPPED), 'rgba(255,95,87,0.5)', 1, [4, 3]);
    runs.forEach((run) => {
      ctx.strokeStyle = heat(run.means[run.means.length - 1]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      run.means.forEach((m, i) => {
        const x = lerp(gx0, gx1, i / (run.means.length - 1)), y = lerp(gy1, gy0, m);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
    });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('A simulated group of 100: overshooting in {e} of updates, {s} who always follow the rule; average rule-breaking at the end {a}', {
          e: withUnit(Math.round(e * 1000) / 10, '%'),
          s: withUnit(Math.round(steady * 100), '%'),
          a: withUnit(Math.round(avg * 100), '%'),
        })}
      />
      <Range label={t('Chance of overshooting')} value={e} min={0} max={0.08} step={0.004} onChange={setE} format={(v) => withUnit(Math.round(v * 1000) / 10, '%')} />
      <Range label={t('Always follow the rule')} value={steady} min={0} max={0.4} step={0.05} onChange={setSteady} format={(v) => withUnit(Math.round(v * 100), '%')} />
      <Readouts
        items={[
          { label: t('Average rule-breaking at the end'), value: withUnit(Math.round(avg * 100), '%'), tone: avg >= TIPPED ? 'bad' : undefined },
          { label: t('Measured in the study'), value: t('overshoot in {n} of cases', { n: withUnit(MEASURED * 100, '%') }) },
        ]}
      />
      <p className="lab__note">
        {t('Simplified model after the 2026 study’s simulation: each step one person moves towards another’s choice, more towards worse examples than better ones. The strengths are illustrative; three runs are shown.')}
      </p>
    </div>
  );
}
