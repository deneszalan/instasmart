import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Brazil's presidential vote on 4 October 2026, round one (TSE totals): votes for the top two and all valid votes. */
export const ROUND1 = { flavio: 56104503, lula: 53879538, valid: 119300788 };
/** The runoff on 25 October 2026 (TSE). */
export const ROUND2 = { lula: 64256232, flavio: 59826041 };
/** Votes for the ten other candidates in round one: 9,316,747. */
export const OTHERS = ROUND1.valid - ROUND1.flavio - ROUND1.lula;

/**
 * A simple runoff: everyone who backed Lula or Flávio Bolsonaro in round one does so again; the other
 * candidates' votes, plus `extra` new valid votes, split with `toLula` (0–1) going to Lula.
 */
export function runoff(toLula: number, extra = 0) {
  const free = OTHERS + extra;
  const lula = ROUND1.lula + free * toLula, flavio = ROUND1.flavio + free * (1 - toLula);
  return { lula, flavio, lulaShare: lula / (lula + flavio) };
}

/** Lula's share of the free votes at which the runoff is a tie. */
export const tieShare = (extra = 0) => 0.5 + (ROUND1.flavio - ROUND1.lula) / (2 * (OTHERS + extra));

const LULA = '#3fc1bb', FLAVIO = '#e486bd';
const mil = (n: number) => formatNumber(Math.round(n / 1e5) / 10);

export default function BrazilRunoff({ onDone }: LabProps) {
  const [share, setShare] = useState(50);
  const [extra, setExtra] = useState(0);
  const r = runoff(share / 100, extra * 1e6);
  useGoal(r.lula > r.flavio, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the free votes as 100 squares on the right, coloured by where they go
    const size = Math.min((h - 30) / 10, (w * 0.34) / 10), gx = w - size * 10 - 8, gy = 8;
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = i < share ? LULA : FLAVIO;
      ctx.fillRect(gx + (i % 10) * size + 1, gy + Math.floor(i / 10) * size + 1, size - 2, size - 2);
    }
    label(ctx, t('{n} M free votes', { n: mil(OTHERS + extra * 1e6) }), gx + size * 5, gy + size * 10 + 11, { size: 10, color: C.soft });
    // the two candidates' votes: round one solid, the gain lighter
    const L = 50, R = gx - 46, max = 70e6, X = (n: number) => L + (n / max) * (R - L), bh = Math.min(28, h * 0.2);
    const rows: [string, number, number, string][] = [
      [t('Flávio'), ROUND1.flavio, r.flavio, FLAVIO],
      [t('Lula'), ROUND1.lula, r.lula, LULA],
    ];
    for (const m of [20e6, 40e6, 60e6]) {
      line(ctx, X(m), 18, X(m), h - 14, C.line, 1);
      label(ctx, mil(m), X(m), 9, { size: 9, color: C.faint });
    }
    rows.forEach(([name, first, now, col], i) => {
      const y = h * 0.24 + i * (h * 0.36);
      ctx.fillStyle = col;
      ctx.fillRect(L, y, X(first) - L, bh);
      ctx.globalAlpha = 0.45;
      ctx.fillRect(X(first), y, X(now) - X(first), bh);
      ctx.globalAlpha = 1;
      label(ctx, name, L - 6, y + bh / 2, { size: 11, align: 'right', color: col });
      label(ctx, mil(now), X(now) + 4, y + bh / 2, { size: 11, align: 'left', color: C.ink });
    });
    label(ctx, t('votes, millions'), (L + R) / 2, h - 6, { size: 9, color: C.faint });
  };

  const lead = r.lula > r.flavio ? t('Lula wins') : r.flavio > r.lula ? t('Flávio wins') : t('A tie');
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Runoff votes in millions: Lula {l}, Flávio Bolsonaro {f}', { l: mil(r.lula), f: mil(r.flavio) })} />
      <Range label={t('Free votes to Lula')} value={share} min={0} max={100} step={1} onChange={setShare} format={(v) => `${v}%`} />
      <Range label={t('New valid votes')} value={extra} min={0} max={6} step={0.1} onChange={setExtra} format={(v) => t('{n} million', { n: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Lula'), value: `${formatNumber(Math.round(r.lulaShare * 1000) / 10)}%`, tone: r.lula > r.flavio ? 'good' : undefined },
          { label: t('Flávio'), value: `${formatNumber(Math.round((1 - r.lulaShare) * 1000) / 10)}%`, tone: r.flavio > r.lula ? 'good' : undefined },
          { label: t('Result'), value: lead, tone: 'accent' },
        ]}
      />
    </div>
  );
}
