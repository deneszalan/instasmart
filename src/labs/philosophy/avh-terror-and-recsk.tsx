import { useState } from 'react';
import { C, Choice, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/**
 * A toy model of why fear of the ÁVH spread so far. Witnesses told the UN Special Committee (1957 report, para. 433)
 * that informers sat in every office and factory, "so that no one knew, even when talking to friends, where his words
 * would be repeated half an hour later". If one person in k is an informer, and you speak openly to n people, the
 * chance that at least one of them informs is 1 − (1 − 1/k)^n. The shares are illustrative, not historical counts:
 * how many informers there were is not what this lab claims.
 */
export const SHARES = [10, 25, 50] as const;
export type Share = (typeof SHARES)[number];

/** The chance that at least one of `n` people is an informer, when one in `k` is. */
export const atLeastOne = (n: number, k: number) => 1 - Math.pow(1 - 1 / k, n);

/** The smallest circle of people that makes it more likely than not that one of them informs. */
export function circleForEvenOdds(k: number) {
  let n = 1;
  while (atLeastOne(n, k) < 0.5) n++;
  return n;
}

/** The goal: with only one informer in 50, a circle big enough that one of them more likely than not informs. */
export const GOAL_SHARE: Share = 50;
export const reached = (n: number, k: number) => k === GOAL_SHARE && atLeastOne(n, k) >= 0.5;

const LAMP = '#f2b33d', SLATE = '#7c8aa0', AVH = '#c0503f';

export default function AvhInformers({ onDone }: LabProps) {
  const [n, setN] = useState(5);
  const [k, setK] = useState<Share>(10);
  const p = atLeastOne(n, k);
  useGoal(reached(n, k), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.3, cy = h * 0.47, r = Math.min(w * 0.2, h * 0.28);
    // you, in the middle, and the people you talk to around you
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      ctx.strokeStyle = 'rgba(242,179,61,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = SLATE; ctx.beginPath(); ctx.arc(x, y, Math.max(2.5, Math.min(6, 70 / n)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = LAMP; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, 12, 4, 0, Math.PI * 2); ctx.fill();
    label(ctx, t('you speak'), 22, 12, { size: 10, color: LAMP, align: 'left' });
    // the chance, as a vertical gauge with the even-odds line
    const gx = w * 0.66, gw = Math.max(22, w * 0.08), top = h * 0.2, bot = h * 0.72, gh = bot - top;
    label(ctx, t('At least one informs'), gx + gw / 2, top - 12, { size: 10, color: C.soft });
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(gx, top, gw, gh);
    ctx.fillStyle = p >= 0.5 ? AVH : 'rgba(192,80,63,0.6)'; ctx.fillRect(gx, bot - gh * p, gw, gh * p);
    const half = bot - gh * 0.5;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(gx - 6, half); ctx.lineTo(gx + gw + 6, half); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, '50%', gx - 10, half, { size: 10, color: C.soft, align: 'right' });
    label(ctx, `${formatNumber(Math.round(p * 100))}%`, gx + gw + 8, bot - gh * p, { size: 13, color: C.ink, align: 'left' });
    label(ctx, `${t('Informers to expect')}: ${formatFixed(n / k, 1)}`, gx + gw / 2, bot + 13, { size: 10, color: C.soft });
    label(ctx, t('Toy model: illustrative shares, not historical counts'), 6, h - 7, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('You speak openly to {n} people; if one in {k} informs, the chance that at least one of them does is {p}', {
          n: formatNumber(n),
          k: formatNumber(k),
          p: `${formatNumber(Math.round(p * 100))}%`,
        })}
      />
      <Range label={t('People you speak to openly')} value={n} min={1} max={40} step={1} onChange={setN} format={(v) => t('{n} people you trust', { n: formatNumber(v) })} />
      <Choice
        label={t('One informer in every')}
        options={SHARES.map((v) => ({ value: v, label: t('1 informer in {n}', { n: formatNumber(v) }) }))}
        value={k}
        onChange={setK}
      />
    </div>
  );
}
