import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Ten ridings of equal size. Our party has this share of all the votes (the CAQ had 13.35% in 2026). */
export const RIDINGS = 10;
export const SHARE = 13;
/** In every riding the two other parties split what is left, 52 to 48 (they take turns being ahead). */
export const SPLIT = 0.52;

/** Each riding's result when the party spreads its votes evenly over the first `spread` ridings (2–10). */
export function ridings(spread: number) {
  const mine = (SHARE * RIDINGS) / spread; // its share in each riding it focuses on, in %
  return Array.from({ length: RIDINGS }, (_, i) => {
    const ours = i < spread ? mine : 0;
    const rest = 100 - ours, a = rest * (i % 2 ? 1 - SPLIT : SPLIT), b = rest - a;
    const winner = ours > a && ours > b ? 0 : a > b ? 1 : 2;
    return { ours, a, b, winner };
  });
}

export const seatsWon = (spread: number) => ridings(spread).filter((r) => r.winner === 0).length;

const OURS = '#7fd17a', TEAL = '#4fb3ae', GOLD = '#e0b34e';

export default function QuebecFirstPastThePost({ onDone }: LabProps) {
  const [spread, setSpread] = useState(RIDINGS);
  const rs = ridings(spread);
  const won = seatsWon(spread);
  useGoal(won >= 3, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const top = 16, bottom = h - 22, gap = 6, bw = (w - 16 - gap * (RIDINGS - 1)) / RIDINGS;
    const Y = (p: number) => bottom - ((bottom - top) * p) / 100;
    line(ctx, 8, Y(50), w - 8, Y(50), C.faint, 1, [4, 4]);
    label(ctx, '50%', w - 8, Y(50) - 7, { size: 9, align: 'right', color: C.faint });
    rs.forEach((r, i) => {
      const x = 8 + i * (bw + gap);
      let y = bottom;
      for (const [v, col] of [[r.ours, OURS], [r.a, TEAL], [r.b, GOLD]] as [number, string][]) {
        const hh = ((bottom - top) * v) / 100;
        ctx.fillStyle = col;
        ctx.fillRect(x, y - hh, bw, hh);
        y -= hh;
      }
      const winCol = r.winner === 0 ? OURS : r.winner === 1 ? TEAL : GOLD;
      ctx.fillStyle = winCol;
      ctx.beginPath();
      ctx.arc(x + bw / 2, bottom + 11, 5, 0, Math.PI * 2);
      ctx.fill();
      if (r.ours > 0) label(ctx, `${formatNumber(Math.round(r.ours))}`, x + bw / 2, Y(r.ours / 2), { size: 10, color: '#10241a' });
      if (r.winner === 0) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, top - 1, bw + 2, bottom - top + 2);
      }
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Ten ridings: your party has {s}% of all the votes and wins {n} seats', { s: SHARE, n: won })} />
      <Range label={t('Ridings your votes are spread over')} value={spread} min={2} max={RIDINGS} step={1} onChange={setSpread} format={(v) => `${v}`} />
      <Readouts
        items={[
          { label: t('Your share of the votes'), value: `${SHARE}%` },
          { label: t('Seats won'), value: `${won}/${RIDINGS}`, tone: won ? 'good' : 'bad' },
          { label: t('Your share of the seats'), value: `${formatNumber((100 * won) / RIDINGS)}%`, tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Green: your party. Each dot below a riding shows who wins it. Simplified: ten equal ridings, and two other parties share the rest of each riding 52 to 48.')}</p>
    </div>
  );
}
