import { useState } from 'react';
import { Btn, C, Choice, dot, label, line, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * One round of asymmetric autocatalysis in a simplified model: the product molecules pair up at random and act as
 * the catalyst for fresh starting material. A right–right pair makes right-handed product and a left–left pair
 * left-handed; a mixed pair makes nothing (`mixedWork` false) or one of each (`mixedWork` true). Returns the new
 * share of right-handed molecules.
 */
export function round(right: number, mixedWork: boolean): number {
  const rr = right * right, ll = (1 - right) * (1 - right), mixed = 2 * right * (1 - right);
  return mixedWork ? (rr + mixed / 2) / (rr + ll + mixed) : rr / (rr + ll);
}

export function rounds(start: number, n: number, mixedWork: boolean): number[] {
  const out = [start];
  for (let i = 0; i < n; i++) out.push(round(out[out.length - 1], mixedWork));
  return out;
}

const ROSE = '#f06292', TEAL = '#4dd0c4', MAX_ROUNDS = 12;
const KEYS = (() => {
  const r = rng(7);
  return Array.from({ length: 160 }, () => ({ x: r(), y: r(), key: r() }));
})();

export default function MirrorMolecules({ onDone }: LabProps) {
  const [start, setStart] = useState(50.5);
  const [mixedWork, setMixedWork] = useState(false);
  const [n, setN] = useState(0);
  const history = rounds(start / 100, n, mixedWork);
  const share = history[history.length - 1];
  useGoal(!mixedWork && share >= 0.99, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the flask: each dot is a molecule, right-handed (teal) if its key is below the share
    const fw = Math.min(w * 0.36, h * 0.95), fx = 8, fy = (h - fw) / 2;
    const sorted = [...KEYS].sort((a, b) => a.key - b.key);
    sorted.forEach((d, i) => dot(ctx, fx + 6 + d.x * (fw - 12), fy + 6 + d.y * (fw - 12), 3.2, i < share * KEYS.length ? TEAL : ROSE));
    // the share over the rounds
    const L = fw + 40, R = w - 10, top = 12, bot = h - 22;
    const X = (i: number) => L + (i / MAX_ROUNDS) * (R - L), Y = (s: number) => bot - ((s - 0.5) / 0.5) * (bot - top);
    for (const s of [0.5, 0.75, 1]) {
      line(ctx, L, Y(s), R, Y(s), C.line, 1);
      label(ctx, `${Math.round(s * 100)}%`, L - 4, Y(s), { size: 9.5, align: 'right', color: C.faint });
    }
    line(ctx, L, Y(0.99), R, Y(0.99), C.good, 1, [4, 4]);
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    history.forEach((s, i) => ctx[i ? 'lineTo' : 'moveTo'](X(i), Y(Math.max(0.5, s))));
    ctx.stroke();
    history.forEach((s, i) => dot(ctx, X(i), Y(Math.max(0.5, s)), 3, TEAL));
    label(ctx, t('rounds'), R, bot + 13, { size: 9.5, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Mixed pairs')}
        value={mixedWork ? 'work' : 'idle'}
        onChange={(v) => { setMixedWork(v === 'work'); setN(0); }}
        options={[
          { value: 'idle', label: t('Mixed pairs do nothing') },
          { value: 'work', label: t('Mixed pairs work too') },
        ]}
      />
      <Stage draw={draw} label={t('{r}% right-handed and {l}% left-handed after {n} rounds', { r: formatNumber(Math.round(share * 1000) / 10), l: formatNumber(Math.round((1 - share) * 1000) / 10), n })} />
      <Range label={t('Right-handed at the start')} value={start} min={50.1} max={55} step={0.1} onChange={(v) => { setStart(Math.round(v * 10) / 10); setN(0); }} format={(v) => `${formatNumber(v)}%`} />
      <div className="lab__row">
        <Btn onClick={() => setN(Math.min(MAX_ROUNDS, n + 1))} disabled={n >= MAX_ROUNDS}>{t('Run a round')}</Btn>
        <Btn ghost onClick={() => setN(0)}>{t('Start again')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Rounds'), value: formatNumber(n) },
          { label: t('Right-handed'), value: `${formatNumber(Math.round(share * 1000) / 10)}%`, tone: share >= 0.99 ? 'good' : undefined },
          { label: t('Left-handed'), value: `${formatNumber(Math.round((1 - share) * 1000) / 10)}%` },
        ]}
      />
      <p className="lab__note">{t('Simplified: a real Soai run amplifies much more than one round.')}</p>
    </div>
  );
}
