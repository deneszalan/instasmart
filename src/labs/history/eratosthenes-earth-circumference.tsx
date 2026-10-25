import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export const SHADOW = 7.2; // degrees: the noon shadow at Alexandria while the Sun stood overhead at Syene
export const DISTANCE = 5000; // stadia from Syene to Alexandria
export const EARTH_KM = 40008; // around the poles

/** Eratosthenes' step: the shadow's angle is the cities' share of the full 360°, so the Earth is 360 ÷ angle times the distance. */
export const circumference = (angle: number, distance = DISTANCE) => (distance * 360) / angle;

export default function Eratosthenes({ onDone }: LabProps) {
  const [angle, setAngle] = useState(3);
  const [stadion, setStadion] = useState<157.5 | 185>(157.5);
  const right = Math.abs(angle - SHADOW) < 0.15, stadia = circumference(angle), km = (stadia * stadion) / 1000;
  useGoal(right, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the Earth in section, with sunlight arriving in parallel rays
    const R = Math.min(w * 0.22, h * 0.4), cx = R + 16, cy = h / 2 + 8, a = (SHADOW * Math.PI) / 180 * 3; // the angle drawn 3× larger
    for (let k = -3; k <= 3; k++) line(ctx, cx + k * R * 0.3, 4, cx + k * R * 0.3, cy - R * 0.6, 'rgba(253,224,71,0.45)', 1.2);
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    const syene: [number, number] = [cx, cy - R], alex: [number, number] = [cx - Math.sin(a) * R, cy - Math.cos(a) * R];
    line(ctx, cx, cy, ...syene, 'rgba(255,255,255,0.5)', 1, [3, 3]);
    line(ctx, cx, cy, ...alex, 'rgba(255,255,255,0.5)', 1, [3, 3]);
    line(ctx, ...syene, syene[0], syene[1] - 14, C.ink, 2);
    line(ctx, ...alex, alex[0] - Math.sin(a) * 14, alex[1] - Math.cos(a) * 14, C.ink, 2);
    label(ctx, t('Syene'), syene[0] + 6, syene[1] - 8, { size: 10, align: 'left' });
    label(ctx, t('Alexandria'), alex[0] - 6, alex[1] - 14, { size: 10, align: 'right' });
    label(ctx, t('same angle'), cx, cy + 12, { size: 9.5, color: C.faint });
    // Alexandria's stick close up: the shadow, and the angle the reader measures
    const ox = w * 0.5, gw = w - ox - 12, gy = h - 18, stick = Math.min(h - 40, gw * 1.2), sx = ox + gw * 0.2;
    line(ctx, ox, gy, ox + gw, gy, '#a16207', 3);
    line(ctx, sx, gy, sx, gy - stick, C.ink, 3);
    const tip = sx + stick * Math.tan((SHADOW * Math.PI) / 180);
    line(ctx, sx, gy, tip, gy, '#0f172a', 5);
    line(ctx, sx, gy - stick, tip, gy, 'rgba(253,224,71,0.7)', 1.5);
    const mine = sx + stick * Math.tan((angle * Math.PI) / 180);
    line(ctx, sx, gy - stick, mine, gy, right ? C.good : C.cool, 2, [4, 3]);
    label(ctx, `${formatNumber(angle)}°`, sx + 8, gy - stick + 18, { size: 11, align: 'left', color: right ? C.good : C.cool });
    label(ctx, t('noon at Alexandria'), ox + gw / 2, 10, { size: 10.5 });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Sunlight on Syene and Alexandria, and the stick’s shadow at Alexandria')} />
      <Range label={t('Your angle')} value={angle} min={1} max={15} step={0.1} onChange={(v) => setAngle(Math.round(v * 10) / 10)} format={(v) => `${formatNumber(v)}°`} />
      <Choice
        label={t('Stadion')}
        value={stadion}
        onChange={setStadion}
        options={[
          { value: 157.5, label: t('Stadion of 157.5 m') },
          { value: 185, label: t('Stadion of 185 m') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Earth, in stadia'), value: formatNumber(Math.round(stadia / 1000) * 1000), tone: right ? 'good' : 'accent' },
          { label: t('In km'), value: formatNumber(Math.round(km / 100) * 100) },
          { label: t('Today’s figure'), value: `${formatNumber(EARTH_KM)} km` },
        ]}
      />
      <p className="lab__note">{t('Nobody knows which length of stadion he used.')}</p>
    </div>
  );
}
