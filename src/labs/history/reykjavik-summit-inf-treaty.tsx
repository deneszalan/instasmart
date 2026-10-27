import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Basing = 'ground' | 'ship' | 'plane';

/** The INF Treaty (1987) banned ground-launched missiles with ranges of 500 to 5,500 km. */
export const BAND = { min: 500, mid: 1000, max: 5500 };

export const rangeClass = (km: number) => (km < BAND.min ? 'short' : km < BAND.mid ? 'shorter' : km <= BAND.max ? 'intermediate' : 'longer');
export const banned = (basing: Basing, km: number) => basing === 'ground' && km >= BAND.min && km <= BAND.max;

/** The slider runs from 0 to 100 on a log scale from 100 km to 10,000 km, rounded to 50 km. */
export const kmAt = (v: number) => Math.round(Math.pow(10, 2 + v / 50) / 50) * 50;

const GOLD = '#e0ad52', RED = '#ef7d6a';

export default function InfTreaty({ onDone }: LabProps) {
  const [basing, setBasing] = useState<Basing>('ground');
  const [v, setV] = useState(60);
  const km = kmAt(v);
  const isBanned = banned(basing, km);
  const cls = rangeClass(km);
  useGoal(cls === 'intermediate' && !isBanned, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, y = h * 0.62, X = (k: number) => L + ((R - L) * (Math.log10(k) - 2)) / 2;
    // the banned band, only for missiles launched from the ground
    ctx.fillStyle = basing === 'ground' ? GOLD : C.line;
    ctx.globalAlpha = basing === 'ground' ? 0.55 : 1;
    ctx.fillRect(X(BAND.min), y - 34, X(BAND.mid) - X(BAND.min), 28);
    ctx.globalAlpha = 1;
    ctx.fillRect(X(BAND.mid), y - 34, X(BAND.max) - X(BAND.mid), 28);
    label(ctx, basing === 'ground' ? t('banned for ground-launched missiles') : t('not covered by this treaty'), (X(BAND.min) + X(BAND.max)) / 2, y - 46, { size: 10, color: basing === 'ground' ? GOLD : C.soft });
    line(ctx, L, y, R, y, C.soft, 2);
    for (const k of [100, 300, 1000, 3000, 10000]) {
      line(ctx, X(k), y - 5, X(k), y + 5, C.soft, 1.5);
      label(ctx, formatNumber(k), X(k), y + 15, { size: 9, color: C.soft });
    }
    label(ctx, t('range, km'), R, y + 30, { size: 9, align: 'right', color: C.faint });
    // the missile's reach, from the launch point at the left
    const x = X(km);
    line(ctx, L, y - 20, x, y - 20, isBanned ? RED : C.ink, 3);
    ctx.fillStyle = isBanned ? RED : C.ink;
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 20);
    ctx.lineTo(x - 4, y - 27);
    ctx.lineTo(x - 4, y - 13);
    ctx.closePath();
    ctx.fill();
    label(ctx, `${formatNumber(km)} km`, x, y - 74, { size: 13, color: isBanned ? RED : C.ink });
  };

  const className = cls === 'short' ? t('under 500 km') : cls === 'shorter' ? t('shorter-range, 500–1,000 km') : cls === 'intermediate' ? t('intermediate-range, 1,000–5,500 km') : t('longer-range, over 5,500 km');
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A missile with a range of {km} km: {v}', { km: formatNumber(km), v: isBanned ? t('Banned by the treaty') : t('Allowed by the treaty') })} />
      <Choice
        label={t('Launched from')}
        value={basing}
        onChange={setBasing}
        options={[
          { value: 'ground', label: t('the ground') },
          { value: 'ship', label: t('a ship') },
          { value: 'plane', label: t('a plane') },
        ]}
      />
      <Range label={t('Missile range')} value={v} min={0} max={100} step={1} onChange={setV} format={() => `${formatNumber(km)} km`} />
      <Readouts
        items={[
          { label: t('Range class'), value: className },
          { label: t('INF Treaty verdict'), value: isBanned ? t('Banned by the treaty') : t('Allowed by the treaty'), tone: isBanned ? 'bad' : 'good' },
        ]}
      />
      <p className="lab__note">{t('Only the United States and the Soviet Union signed the INF Treaty. It was in force from 1988 to 2019.')}</p>
    </div>
  );
}
