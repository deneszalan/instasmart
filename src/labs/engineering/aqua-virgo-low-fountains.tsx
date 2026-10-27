import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const G = 9.81;

/** Height the water can climb above the nozzle: up to the level it comes from (no friction in this model). */
export const jetHeight = (sourceAboveStreet: number, sinkBelowStreet: number) => Math.max(0, sourceAboveStreet + sinkBelowStreet);
/** Speed at the nozzle from the drop, by Torricelli's law: v = √(2gh). */
export const nozzleSpeed = (sourceAboveStreet: number, sinkBelowStreet: number) => Math.sqrt(2 * G * jetHeight(sourceAboveStreet, sinkBelowStreet));
/** The top of the jet, measured from the street: always the source's own level. */
export const jetTop = (sourceAboveStreet: number, sinkBelowStreet: number) => jetHeight(sourceAboveStreet, sinkBelowStreet) - sinkBelowStreet;

/** The goal: a 2 m jet from water that arrives only half a metre above the street. */
export const LOW_SOURCE = 0.5;
export const GOAL_JET = 2;

export default function AquaVirgoFountains({ onDone }: LabProps) {
  const [source, setSource] = useState(LOW_SOURCE);
  const [sink, setSink] = useState(0);
  const h = jetHeight(source, sink);
  const v = nozzleSpeed(source, sink);
  const reached = source <= LOW_SOURCE + 1e-9 && h >= GOAL_JET - 1e-9;
  useGoal(reached, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h: hh }: { w: number; h: number }) => {
    // heights in metres, from 4 m below the street to 8 m above
    const top = 6.5, bot = -4.5;
    const Y = (m: number) => 10 + ((top - m) / (top - bot)) * (hh - 20);
    const street = Y(0);
    // ground and street
    ctx.fillStyle = 'rgba(58,74,60,0.85)';
    ctx.fillRect(0, street, w, hh - street);
    line(ctx, 0, street, w, street, C.soft, 2);
    label(ctx, t('street level'), w - 8, street + 10, { size: 10, align: 'right', color: C.soft });
    // the aqueduct's tank on the left, its water level
    const tx = 18, tw = w * 0.2;
    ctx.fillStyle = 'rgba(63,167,181,0.75)';
    ctx.fillRect(tx, Y(source), tw, Y(-0.6) - Y(source));
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, Y(Math.max(source, 0) + 0.8), tw, Y(-0.6) - Y(Math.max(source, 0) + 0.8));
    label(ctx, t('aqueduct’s end'), tx + tw / 2, Y(Math.max(source, 0) + 0.8) - 9, { size: 10, color: C.soft });
    // the level of the source, across the stage
    line(ctx, tx, Y(source), w - 8, Y(source), C.accent, 1.5, [5, 4]);
    label(ctx, t('source level'), w - 8, Y(source) - 8, { size: 10, align: 'right', color: C.accent });
    // the pipe, under the street to the nozzle
    const nx = w * 0.68;
    ctx.strokeStyle = 'rgba(217,243,243,0.8)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tx + tw, Y(-0.4));
    ctx.lineTo(nx, Y(-0.4));
    ctx.lineTo(nx, Y(-sink));
    ctx.stroke();
    // the sunk basin
    if (sink > 0) {
      ctx.fillStyle = 'rgba(13,31,37,0.9)';
      ctx.fillRect(nx - w * 0.2, street, w * 0.4, Y(-sink - 0.3) - street);
    }
    ctx.fillStyle = 'rgba(63,167,181,0.8)';
    ctx.fillRect(nx - w * 0.2, Y(-sink - 0.05), w * 0.4, Y(-sink - 0.3) - Y(-sink - 0.05));
    // the jet
    if (h > 0) {
      ctx.strokeStyle = 'rgba(217,243,243,0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nx, Y(-sink));
      ctx.lineTo(nx, Y(-sink + h));
      ctx.stroke();
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The aqueduct’s water stands {s} m above the street; the nozzle is {d} m below it; the jet rises {h} m', { s: formatNumber(source), d: formatNumber(sink), h: formatNumber(Math.round(h * 10) / 10) })} />
      <Range label={t('Water at the aqueduct’s end')} value={source} min={0.5} max={6} step={0.5} onChange={setSource} format={(x) => `${formatNumber(x)} m`} />
      <Range label={t('Sink the fountain')} value={sink} min={0} max={4} step={0.25} onChange={setSink} format={(x) => `${formatNumber(x)} m`} />
      <Readouts
        items={[
          { label: t('Height of the jet'), value: `${formatNumber(Math.round(h * 10) / 10)} m`, tone: reached ? 'good' : 'accent' },
          { label: t('Top of the jet, above the street'), value: `${formatNumber(Math.round(jetTop(source, sink) * 10) / 10)} m` },
          { label: t('Speed at the nozzle'), value: t('{n} m/s', { n: formatNumber(Math.round(v * 10) / 10) }) },
        ]}
      />
      <p className="lab__note">{t('Simplified: no friction, so each jet climbs right up to its source’s level; real jets fall a little short.')}</p>
    </div>
  );
}
