import { useState } from 'react';
import { C, label, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** In this simplified picture, vapour settles on a seed once the air holds a little more water than it can keep. */
export const SEEDED_AT = 1.05;
/** Without a seed, the Mars model of the Arsia Mons cloud has vapour freezing at about 100,000 times saturation. */
export const HOMOGENEOUS_AT = 100000;

export type Ice = 'none' | 'seeded' | 'homogeneous';
/** Whether ice forms in air with `seeds` specks per cm³ and `supersaturation` times the water it can hold. */
export function iceForms(seeds: number, supersaturation: number): Ice {
  if (supersaturation >= HOMOGENEOUS_AT) return 'homogeneous';
  if (seeds > 0 && supersaturation >= SEEDED_AT) return 'seeded';
  return 'none';
}

const ICE = '#cdeeff', DUST = '#b57a4a';
const superLabel = (p: number) => `${formatNumber(Math.round(Math.pow(10, p)))}×`;

export default function MarsCloudSeeds({ onDone }: LabProps) {
  const [seeds, setSeeds] = useState(5);
  const [power, setPower] = useState(0.5); // log10 of the supersaturation
  const sup = Math.pow(10, power);
  const ice = iceForms(seeds, sup);
  useGoal(ice === 'homogeneous' && seeds === 0, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const r = rng(7);
    // vapour: the more supersaturated, the more molecules
    const n = Math.round(20 + 12 * power);
    const pts: [number, number][] = [];
    for (let i = 0; i < 60; i++) pts.push([8 + r() * (w - 16), 8 + r() * (h - 16)]);
    const seedPts = pts.slice(0, Math.round(seeds));
    const vapour = pts.slice(10, 10 + n);
    vapour.forEach(([x, y], i) => {
      let px = x, py = y;
      if (ice === 'seeded' && seedPts.length) {
        const s = seedPts[i % seedPts.length];
        px = s[0] + (x - s[0]) * 0.08;
        py = s[1] + (y - s[1]) * 0.08;
      }
      ctx.fillStyle = ice === 'homogeneous' ? ICE : 'rgba(205,238,255,0.75)';
      ctx.beginPath();
      if (ice === 'homogeneous') {
        for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; ctx.lineTo(px + 5 * Math.cos(a), py + 5 * Math.sin(a)); }
        ctx.closePath();
      } else ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    seedPts.forEach(([x, y]) => {
      if (ice === 'seeded') { ctx.fillStyle = ICE; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = DUST;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    const what = ice === 'homogeneous' ? t('ice forms on its own') : ice === 'seeded' ? t('ice forms on the seeds') : t('no ice: vapour stays vapour');
    label(ctx, what, w / 2, h - 12, { size: 12, color: ice === 'none' ? C.soft : ice === 'seeded' ? DUST : ICE });
    label(ctx, t('{s} seeds per cm³ · {x} saturation', { s: seeds, x: superLabel(power) }), w / 2, 12, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Air with {s} seeds per cm³ at {x} saturation: {ice}', { s: seeds, x: superLabel(power), ice: ice === 'homogeneous' ? t('ice forms on its own') : ice === 'seeded' ? t('ice forms on the seeds') : t('no ice: vapour stays vapour') })} />
      <Range label={t('Dust seeds per cm³')} value={seeds} min={0} max={10} step={1} onChange={setSeeds} />
      <Range label={t('Water vapour, times what the air can hold')} value={power} min={0} max={6} step={0.1} onChange={setPower} format={superLabel} />
      <Readouts
        items={[
          { label: t('Ice'), value: ice === 'homogeneous' ? t('on its own') : ice === 'seeded' ? t('on seeds') : t('none'), tone: ice === 'homogeneous' ? 'good' : ice === 'seeded' ? 'accent' : undefined },
          { label: t('Needed without seeds'), value: `${formatNumber(HOMOGENEOUS_AT)}×` },
        ]}
      />
      <p className="lab__note">{t('Simplified: seeds take vapour at 1.05× saturation; the 100,000× for seedless ice is the Mars model’s figure for the Arsia Mons cloud. Real thresholds depend on temperature and the seed.')}</p>
    </div>
  );
}
