import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A kulák family's delivery quota in Hungary in 1951, against its harvest: per cadastral hold, "kulaks" had to
 * deliver goods worth about 700 to 1,100 kg of wheat (by the size and quality of the farm), while the average wheat
 * harvest that year, the best of the period, was 970 kg a hold (Bálint Magyar, 1986, after Pál Závada's table).
 * Simplified, as in that comparison: every delivered good is counted as its worth in wheat, and seed, fodder and the
 * family's own bread are left out.
 */
export const QUOTAS = [700, 1100];
export const AVERAGE_1951 = 970;
export const HARVEST_MIN = 500;
export const HARVEST_MAX = 1500;

/** What is left of a hold's harvest after the quota, in kg; negative is a shortfall. */
export const leftOver = (harvest: number, quota: number) => harvest - quota;
/** The share of the harvest the quota takes, in percent (over 100: more than the whole crop). */
export const takes = (harvest: number, quota: number) => (100 * quota) / harvest;
/** The goal: on the best land, the smallest harvest that just meets the quota. */
export const meetsHighest = (harvest: number, quota: number) => quota === QUOTAS[QUOTAS.length - 1] && harvest >= quota;

const WHEAT = '#dcb85c', RED = '#d0604c';

export default function KulakQuota({ onDone }: LabProps) {
  const [quota, setQuota] = useState(QUOTAS[0]);
  const [harvest, setHarvest] = useState(AVERAGE_1951);
  const left = leftOver(harvest, quota);
  useGoal(meetsHighest(harvest, quota), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const base = h - 30, top = 26, kgPx = (base - top) / HARVEST_MAX, bw = Math.min(70, w * 0.18);
    const x1 = w * 0.42 - bw / 2, x2 = w * 0.76 - bw / 2;
    // the harvest
    ctx.fillStyle = WHEAT;
    ctx.fillRect(x1, base - harvest * kgPx, bw, harvest * kgPx);
    label(ctx, t('wheat harvest'), x1 + bw / 2, base + 14, { size: 11, color: C.soft });
    label(ctx, formatNumber(harvest), x1 + bw / 2, base - harvest * kgPx - 10, { size: 12, color: WHEAT });
    // the quota
    ctx.fillStyle = RED;
    ctx.fillRect(x2, base - quota * kgPx, bw, quota * kgPx);
    label(ctx, t('kulák quota'), x2 + bw / 2, base + 14, { size: 11, color: C.soft });
    label(ctx, formatNumber(quota), x2 + bw / 2, base - quota * kgPx - 10, { size: 12, color: RED });
    // the 1951 average harvest
    const ya = base - AVERAGE_1951 * kgPx;
    line(ctx, 8, ya, w - 8, ya, 'rgba(255,255,255,0.5)', 1, [4, 4]);
    label(ctx, t('1951 average'), 8, ya - 8, { size: 9, color: C.soft, align: 'left' });
    line(ctx, 8, base, w - 8, base, C.faint, 1);
    label(ctx, t('kg per hold; simplified: all goods as wheat'), 8, 12, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('A harvest of {h} kg a hold against a quota of {q} kg: {l} kg left', {
          h: formatNumber(harvest),
          q: formatNumber(quota),
          l: formatNumber(left),
        })}
      />
      <Choice
        label={t('Kulák quota in 1951')}
        options={QUOTAS.map((q, i) => ({ value: q, label: i === 0 ? t('lowest quota') : t('highest quota') }))}
        value={quota}
        onChange={setQuota}
      />
      <Range label={t('Harvest per hold')} value={harvest} min={HARVEST_MIN} max={HARVEST_MAX} step={10} onChange={setHarvest} format={(v) => `${formatNumber(v)} kg`} />
      <Readouts
        items={[
          { label: t('Left for the family'), value: left >= 0 ? `${formatNumber(left)} kg` : t('{n} kg short', { n: formatNumber(-left) }), tone: left >= 0 ? 'good' : 'bad' },
          { label: t('Quota takes'), value: `${formatNumber(Math.round(takes(harvest, quota)))}%`, tone: 'accent' },
        ]}
      />
    </div>
  );
}
