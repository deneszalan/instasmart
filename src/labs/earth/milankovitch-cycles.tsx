import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const S0 = 1361; // W/m², sunlight above the air at Earth's average distance
const LAT = (65 * Math.PI) / 180;
const SOLSTICE_DAY = 172; // 21 June

/**
 * Daily average sunshine at 65° N on the June solstice, the summer value Milankovitch linked to ice ages.
 * `tilt` in degrees, `e` the orbit's eccentricity, `perihelionDay` the day of the year Earth is closest to the Sun.
 */
export function summerSunshine(tilt: number, e: number, perihelionDay: number): number {
  const d = (tilt * Math.PI) / 180;
  const h0 = Math.acos(Math.max(-1, Math.min(1, -Math.tan(LAT) * Math.tan(d))));
  const M = (2 * Math.PI * (SOLSTICE_DAY - perihelionDay)) / 365.25, nu = M + 2 * e * Math.sin(M);
  const closer = Math.pow((1 + e * Math.cos(nu)) / (1 - e * e), 2);
  return (S0 / Math.PI) * closer * (h0 * Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.sin(h0));
}

/** Today: tilt 23.44°, eccentricity 0.0167, closest to the Sun on about 3 January. */
export const TODAY = summerSunshine(23.44, 0.0167, 3);

export default function Milankovitch({ onDone }: LabProps) {
  const [tilt, setTilt] = useState(23.44);
  const [e, setE] = useState(0.0167);
  const [month, setMonth] = useState(0);
  const months = [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'), t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')];
  const q = summerSunshine(tilt, e, 3 + month * 30.4);
  const diff = q - TODAY;
  // In this lab, summers more than 20 W/m² weaker than today's let winter snow survive and pile up.
  const ice = Math.max(0, Math.min(1, -(diff + 5) / 35));
  useGoal(diff < -20, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.5, cy = h * 0.56, r = Math.min(w, h) * 0.3;
    // the globe, tilted, with the northern ice sheet growing or shrinking
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-tilt * Math.PI) / 180);
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.55, r * 0.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // the northern ice: a cap whose edge creeps south as summers weaken
    const edge = r * (0.72 - ice * 0.75);
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-r, -r, 2 * r, r - edge);
    ctx.restore();
    ctx.strokeStyle = C.soft;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(0, -r - 16);
    ctx.lineTo(0, r + 16);
    ctx.stroke();
    ctx.restore();
    label(ctx, t('June sunlight →'), w * 0.04, cy, { size: 11, align: 'left' });
    label(ctx, diff < -20 ? t('Ice spreads: an ice age begins') : diff > 10 ? t('Warm summers melt the snow') : t('Summers about like today'), cx, 14, { size: 12, color: diff < -20 ? C.ink : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Earth with its northern ice cap; summer sunshine at 65° north is {q} watts per square metre', { q: Math.round(q) })} />
      <Range label={t('Tilt')} value={tilt} min={22.1} max={24.5} step={0.05} onChange={setTilt} format={(v) => `${formatNumber(v)}°`} />
      <Range label={t('Orbit stretch')} value={e} min={0} max={0.058} step={0.001} onChange={setE} format={(v) => formatNumber(Math.round(v * 1000) / 1000)} />
      <Range label={t('Closest to Sun')} value={month} min={0} max={11} onChange={setMonth} format={(v) => months[v]} />
      <Readouts
        items={[
          { label: t('June sunshine at 65° N'), value: `${Math.round(q)} W/m²`, tone: 'accent' },
          { label: t('Compared with today'), value: `${diff > 0 ? '+' : ''}${Math.round(diff)}`, tone: diff < -20 ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
