import { useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Rules of thumb: warm water of at least 26.5 °C (NOAA), wind shear under about 10 m/s, and enough spin from Earth's rotation, so not within about 5° of the equator. */
export const SST_MIN = 26.5;
export const SHEAR_MAX = 10;
export const LAT_MIN = 5;
export type Outcome = 'none' | 'depression' | 'cyclone';
/** What the sea and the winds allow, in this simplified picture. */
export function canForm(sst: number, shear: number, latitude: number): Outcome {
  if (latitude < LAT_MIN || sst < SST_MIN) return 'none';
  return shear > SHEAR_MAX ? 'depression' : 'cyclone';
}

const AMBER = '#ffb347', RED = '#ff6b57', GREEN = '#8fd3a1', CYAN = '#7fe0e8', SEA = '#135d6b';

export default function BayCycloneSeason({ onDone }: LabProps) {
  const [sst, setSst] = useState(29);
  const [shear, setShear] = useState(20);
  const [lat, setLat] = useState(15);
  const out = canForm(sst, shear, lat);
  useGoal(out === 'cyclone', onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const seaY = h * 0.78, cx = w / 2;
    ctx.fillStyle = sst >= SST_MIN ? '#1f8d93' : SEA;
    ctx.fillRect(0, seaY, w, h - seaY);
    label(ctx, `${sst.toFixed(1)} °C`, 10, seaY + 16, { size: 11, align: 'left', color: sst >= SST_MIN ? CYAN : C.soft });
    // winds at two heights
    const arrow = (y: number, v: number, name: string) => {
      const len = Math.min(w * 0.3, 4 * Math.abs(v));
      label(ctx, name, 8, y, { size: 9, align: 'left', color: C.faint });
      if (len < 4) { label(ctx, t('calm'), cx, y, { size: 10, color: GREEN }); return; }
      const d = Math.sign(v);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - d * len, y);
      ctx.lineTo(cx + d * len, y);
      ctx.lineTo(cx + d * (len - 8), y - 6);
      ctx.moveTo(cx + d * len, y);
      ctx.lineTo(cx + d * (len - 8), y + 6);
      ctx.stroke();
      ctx.lineWidth = 1.5;
    };
    arrow(h * 0.16, -shear / 2, t('high up'));
    arrow(h * 0.68, shear / 2, t('near the sea'));
    // the storm column, tilted by the shear
    const tilt = Math.min(0.6, shear / 50);
    ctx.save();
    ctx.translate(cx, seaY - 4);
    ctx.rotate(tilt);
    ctx.fillStyle = out === 'none' ? 'rgba(201,210,214,0.12)' : 'rgba(201,210,214,0.35)';
    ctx.beginPath();
    ctx.roundRect(-22, -h * 0.5, 44, h * 0.5, 14);
    ctx.fill();
    ctx.restore();
    if (out !== 'none') {
      const ex = cx - Math.sin(tilt) * h * 0.3, ey = seaY - 4 - Math.cos(tilt) * h * 0.3, r = out === 'cyclone' ? 26 : 16;
      ctx.strokeStyle = out === 'cyclone' ? C.ink : C.soft;
      ctx.lineWidth = 3;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) { const u = i / 20, a = arm * 2.094 + u * 2.6, rr = r * (0.25 + 0.75 * u); ctx.lineTo(ex + rr * Math.cos(a), ey + rr * Math.sin(a)); }
        ctx.stroke();
      }
      ctx.lineWidth = 1.5;
    }
    const msg = out === 'cyclone' ? t('a cyclone can grow') : out === 'depression' ? t('tipped over: a depression at most') : lat < LAT_MIN ? t('no spin this close to the equator') : t('too cool: nothing forms');
    label(ctx, msg, cx, h - 10, { size: 11, color: out === 'cyclone' ? GREEN : out === 'depression' ? RED : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Sea {s} °C, shear {w} m/s, latitude {l}°: {o}', { s: sst.toFixed(1), w: shear, l: lat, o: out === 'cyclone' ? t('a cyclone can grow') : out === 'depression' ? t('tipped over: a depression at most') : t('nothing forms') })} />
      <Range label={t('Sea surface temperature')} value={sst} min={24} max={31} step={0.5} onChange={setSst} format={(v) => `${v.toFixed(1)} °C`} />
      <Range label={t('Wind shear, low to high')} value={shear} min={0} max={30} step={1} onChange={setShear} format={(v) => `${v} m/s`} />
      <Choice
        label={t('Latitude')}
        options={[
          { value: 0, label: t('equator') },
          { value: 5, label: '5°' },
          { value: 15, label: '15°' },
        ]}
        value={lat}
        onChange={setLat}
      />
      <Readouts
        items={[
          { label: t('Outcome'), value: out === 'cyclone' ? t('cyclone') : out === 'depression' ? t('depression') : t('nothing'), tone: out === 'cyclone' ? 'good' : out === 'depression' ? 'bad' : undefined },
          { label: t('Rules of thumb'), value: `≥ ${SST_MIN} °C · ≤ ${SHEAR_MAX} m/s · ≥ ${LAT_MIN}°` },
        ]}
      />
      <p className="lab__note">{t('Simplified: forecasters’ rules of thumb, water of at least 26.5 °C over its top 50 m (NOAA), wind shear under about 10 m/s, and enough spin from Earth’s rotation; a real storm also needs moist air and a seed.')}</p>
    </div>
  );
}
