import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/**
 * The norm squeeze, simplified: a piece-rate worker is paid in proportion to how much of the norm (the output that
 * counts as a day's work) they fulfil. Raise the norm and the same work earns less. At the Ikarus bus works in
 * Budapest the "standardization of norms" for 1950 cut average wages by a nominal 35.5% (Zsombor Bódy, Hungarian
 * Historical Review 10/3, 2021). The reader finds the norm rise that gives that cut for unchanged work.
 */
export const IKARUS_CUT = 35.5;

/** Pay as % of before, for output `o` (% of the old norm) under a norm raised by `r` %. */
export const payShare = (o: number, r: number) => (o / (100 + r)) * 100;
/** The pay cut in % for unchanged work (output = the old norm). */
export const cutFor = (r: number) => 100 - payShare(100, r);
/** The norm rise that gives a pay cut of `cut` % for unchanged work. */
export const raiseFor = (cut: number) => 100 / (1 - cut / 100) - 100;
/** The goal: unchanged work, and a cut within half a point of Ikarus's 35.5%. */
export const matchesIkarus = (o: number, r: number) => o === 100 && Math.abs(cutFor(r) - IKARUS_CUT) < 0.5;

const STEEL = '#8fb3c9', FIRE = '#f08a3c', WHEAT = '#e6c35c';

export default function NormSqueeze({ onDone }: LabProps) {
  const [r, setR] = useState(0);
  const [o, setO] = useState(100);
  const pay = payShare(o, r);
  useGoal(matchesIkarus(o, r), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const base = h - 18, top = 22, max = 210;
    const Y = (v: number) => base - ((base - top) * v) / max;
    const bw = Math.min(w * 0.15, 70);
    const x1 = w * 0.27, x2 = w * 0.45;
    // output against the norms
    ctx.fillStyle = STEEL;
    ctx.fillRect(x1, Y(o), bw, base - Y(o));
    label(ctx, t('your output'), x1 + bw / 2, base + 10, { size: 10, color: C.soft });
    line(ctx, x1 - 8, Y(100), x1 + bw + 8, Y(100), C.faint, 2, [5, 4]);
    label(ctx, t('old norm'), x1 - 10, Y(100) + (r > 0 && r < 12 ? 7 : 0), { size: 10, color: C.soft, align: 'right' });
    if (r > 0) {
      line(ctx, x1 - 8, Y(100 + r), x1 + bw + 8, Y(100 + r), FIRE, 3, [7, 5]);
      label(ctx, t('new norm'), x1 - 10, Y(100 + r) - (r < 12 ? 7 : 0), { size: 10, color: FIRE, align: 'right' });
    }
    // the pay packet against before
    ctx.fillStyle = 'rgba(230,195,92,0.22)';
    ctx.fillRect(x2, Y(100), bw, base - Y(100));
    ctx.fillStyle = WHEAT;
    ctx.fillRect(x2, Y(pay), bw, base - Y(pay));
    label(ctx, t('your pay'), x2 + bw / 2, base + 10, { size: 10, color: C.soft });
    label(ctx, `${formatFixed(pay, 1)}%`, x2 + bw / 2, Y(Math.max(pay, 100)) - 9, { size: 12, color: WHEAT });
    // the Ikarus mark
    const yi = Y(100 - IKARUS_CUT);
    line(ctx, x2 - 6, yi, x2 + bw + 6, yi, C.bad, 2, [4, 4]);
    label(ctx, t('Ikarus 1950: −35.5%'), x2 + bw + 10, yi, { size: 10, color: C.bad, align: 'left' });
    label(ctx, t('Simplified: pay in proportion to the norm fulfilled'), 8, 10, { size: 10, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Norm raised by {r}%, output {o}% of the old norm: pay {p}% of before', {
          r: formatNumber(r),
          o: formatNumber(o),
          p: formatFixed(pay, 1),
        })}
      />
      <Range label={t('Norm raised by')} value={r} min={0} max={100} step={1} onChange={setR} format={(v) => `+${formatNumber(v)}%`} />
      <Range label={t('Your output, % of the old norm')} value={o} min={80} max={200} step={5} onChange={setO} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Norm fulfilled'), value: `${formatFixed((o / (100 + r)) * 100, 1)}%` },
          { label: t('Pay, compared with before'), value: `${pay >= 100 ? '+' : '−'}${formatFixed(Math.abs(pay - 100), 1)}%`, tone: pay < 100 ? 'bad' : 'good' },
          { label: t('Output needed for the old pay'), value: `${formatNumber(100 + r)}%` },
        ]}
      />
    </div>
  );
}
