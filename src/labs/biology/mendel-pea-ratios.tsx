import { useState } from 'react';
import { Btn, C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Genotype = 'RR' | 'Rr' | 'rr';
const GENOTYPES: Genotype[] = ['RR', 'Rr', 'rr'];

/** The chance a parent passes on the wrinkled allele r: each of its two alleles half the time. */
const rShare = (g: Genotype) => (g === 'rr' ? 1 : g === 'Rr' ? 0.5 : 0);

/** The share of wrinkled (rr) seeds expected from a cross: an r from each parent. */
export const wrinkledShare = (a: Genotype, b: Genotype) => rShare(a) * rShare(b);

/** Grow `n` seeds: count how many come out wrinkled. */
export function grow(a: Genotype, b: Genotype, n: number, rand = Math.random) {
  let wrinkled = 0;
  for (let i = 0; i < n; i++) if (rand() < rShare(a) && rand() < rShare(b)) wrinkled++;
  return wrinkled;
}

export default function Mendel({ onDone }: LabProps) {
  const [mum, setMum] = useState<Genotype>('RR');
  const [dad, setDad] = useState<Genotype>('rr');
  const [seeds, setSeeds] = useState({ round: 0, wrinkled: 0 });
  const total = seeds.round + seeds.wrinkled;
  useGoal(mum === 'Rr' && dad === 'Rr' && total >= 1000, onDone);

  const pick = (set: (g: Genotype) => void) => (g: Genotype) => {
    set(g);
    setSeeds({ round: 0, wrinkled: 0 });
  };
  const sow = (n: number) => {
    const w = grow(mum, dad, n);
    setSeeds((s) => ({ round: s.round + n - w, wrinkled: s.wrinkled + w }));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the Punnett square: one parent's alleles across, the other's down
    const size = Math.min(h - 30, w * 0.36), cell = size / 2, x0 = 26, y0 = 22;
    const across = [...mum], down = [...dad];
    across.forEach((a, i) => label(ctx, a, x0 + cell * (i + 0.5), y0 - 10, { size: 13, color: a === 'R' ? C.accent : C.cool }));
    down.forEach((a, j) => label(ctx, a, x0 - 12, y0 + cell * (j + 0.5), { size: 13, color: a === 'R' ? C.accent : C.cool }));
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const pair = [across[i], down[j]].sort().join(''), wr = pair === 'rr';
        ctx.fillStyle = wr ? 'rgba(125,211,252,0.18)' : 'rgba(253,224,71,0.14)';
        ctx.fillRect(x0 + i * cell + 2, y0 + j * cell + 2, cell - 4, cell - 4);
        pea(ctx, x0 + (i + 0.5) * cell, y0 + (j + 0.38) * cell, cell * 0.16, wr);
        label(ctx, pair, x0 + (i + 0.5) * cell, y0 + (j + 0.78) * cell, { size: 11, color: C.ink });
      }
    // the harvest: up to 300 peas drawn, in their real proportion
    const hx = x0 + size + 22, hw = w - hx - 8, shown = Math.min(300, total), r = Math.max(2.2, Math.min(6, Math.sqrt((hw * (h - 20)) / Math.max(shown, 1)) * 0.38));
    const perRow = Math.max(1, Math.floor(hw / (r * 2.4)));
    const wrShown = total ? Math.round((seeds.wrinkled / total) * shown) : 0;
    for (let k = 0; k < shown; k++) pea(ctx, hx + (k % perRow) * r * 2.4 + r, 14 + Math.floor(k / perRow) * r * 2.4 + r, r, k >= shown - wrShown);
    if (!total) label(ctx, t('no seeds yet'), hx + hw / 2, h / 2, { size: 11 });
  };

  const ratio = seeds.wrinkled ? `${formatNumber(Math.round((seeds.round / seeds.wrinkled) * 100) / 100)} : 1` : '–';
  return (
    <div className="lab">
      <div className="lab__row">
        <Choice label={t('First parent')} value={mum} onChange={pick(setMum)} options={GENOTYPES.map((g) => ({ value: g, label: g }))} />
        <span className="lab__note">×</span>
        <Choice label={t('Second parent')} value={dad} onChange={pick(setDad)} options={GENOTYPES.map((g) => ({ value: g, label: g }))} />
      </div>
      <Stage draw={draw} label={t('A Punnett square for {a} × {b}, and the seeds grown so far', { a: mum, b: dad })} />
      <div className="lab__row">
        <Btn onClick={() => sow(10)}>{t('Grow 10')}</Btn>
        <Btn onClick={() => sow(100)}>{t('Grow 100')}</Btn>
        <Btn onClick={() => sow(1000)}>{t('Grow 1,000')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Round'), value: formatNumber(seeds.round) },
          { label: t('Wrinkled'), value: formatNumber(seeds.wrinkled) },
          { label: t('Round : wrinkled'), value: ratio, tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Mendel’s count: 5,474 round, 1,850 wrinkled, 2.96 : 1. R is round, r wrinkled; one R is enough for a round seed.')}</p>
    </div>
  );
}

function pea(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, wrinkled: boolean) {
  ctx.fillStyle = wrinkled ? '#a3b95b' : '#c5d86d';
  ctx.beginPath();
  if (wrinkled)
    for (let k = 0; k <= 12; k++) {
      const a = (k / 12) * Math.PI * 2, rr = r * (k % 2 ? 0.78 : 1);
      ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
  else ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
