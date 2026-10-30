import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** NASA's Mars fact sheet: Mars's GM in km³/s², its equatorial radius in km and its sidereal rotation in hours. */
export const GM = 42828, R_MARS = 3396.2, T_MARS = 24.6229;
/** The same fact sheet: the mean distances of Phobos and Deimos from Mars's centre, in km. */
export const PHOBOS = 9378, DEIMOS = 23459;

/** Hours for one circular orbit `r` km from Mars's centre (Kepler's third law). */
export const period = (r: number) => (2 * Math.PI * Math.sqrt(r ** 3 / GM)) / 3600;

/** The orbit that takes exactly one Mars rotation: a moon there seems to hang still. */
export const KEEP_PACE = Math.cbrt((GM * (T_MARS * 3600) ** 2) / (4 * Math.PI ** 2));

/**
 * Hours from one moonrise to the next, seen from the equator: positive when the moon overtakes the ground (it rises
 * in the west), negative when the ground overtakes it (it rises in the east), Infinity when it keeps pace.
 */
export const betweenRisings = (r: number) => {
  const rel = 1 / period(r) - 1 / T_MARS;
  return rel === 0 ? Infinity : 1 / rel;
};

/** Hours the moon stays above an equator observer's horizon each time it rises. */
export const hoursUp = (r: number) => ((2 * Math.acos(R_MARS / r)) / (2 * Math.PI)) * Math.abs(betweenRisings(r));

/** The goal: a lap within six minutes of Mars's day. */
export const keepsPace = (r: number) => Math.abs(period(r) - T_MARS) <= 0.1;

const hm = (h: number) => {
  const m = Math.round(h * 60);
  return t('{h} h {m} min', { h: formatNumber(Math.floor(m / 60)), m: String(m % 60).padStart(2, '0') });
};

const ORBIT = '#6fd3d0', BRASS = '#f2bf4f', RUST = '#c8643c', STONE = '#bcb2a6';

export default function PhobosRisesInTheWest({ onDone, active }: LabProps) {
  const [r, setR] = useState(12000);
  const [hours, setHours] = useState(0);
  useFrame((dt) => setHours((h) => (h + dt * 2) % (T_MARS * 1000)), active);
  const p = period(r), between = betweenRisings(r), pace = keepsPace(r);
  useGoal(pace, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2, s = (Math.min(w, h) / 2 - 16) / 30000;
    const ring = (rr: number, color: string, width: number, dash: number[] = []) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(cx, cy, rr * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    ring(PHOBOS, C.line, 1, [3, 4]);
    ring(DEIMOS, C.line, 1, [3, 4]);
    ring(KEEP_PACE, 'rgba(242,191,79,0.45)', 1.5, [6, 4]);
    // the moons' names are the same in English and German
    label(ctx, 'Phobos', cx + PHOBOS * s + 3, cy, { size: 9.5, color: C.faint, align: 'left' });
    label(ctx, 'Deimos', cx, cy - DEIMOS * s - 7, { size: 9.5, color: C.faint });
    // Mars, turning, with a flag on its equator
    const rot = (hours / T_MARS) * Math.PI * 2;
    dot(ctx, cx, cy, R_MARS * s, RUST);
    const fx = cx + Math.cos(rot) * R_MARS * s, fy = cy - Math.sin(rot) * R_MARS * s;
    line(ctx, fx, fy, cx + Math.cos(rot) * (R_MARS * s + 9), cy - Math.sin(rot) * (R_MARS * s + 9), C.ink, 2);
    // the reader's moon
    ring(r, pace ? BRASS : ORBIT, 2);
    const ang = (hours / p) * Math.PI * 2;
    dot(ctx, cx + Math.cos(ang) * r * s, cy - Math.sin(ang) * r * s, 6, pace ? BRASS : STONE);
  };

  const riseLabel = pace ? t('Seen from the equator') : between > 0 ? t('Rises in the west every') : t('Rises in the east every');
  const riseValue = pace ? t('It hangs still') : hm(Math.abs(between));
  const seen = `${riseLabel} ${riseValue}`;
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Mars from above with a moon {r} km from its centre, one lap in {p}: {seen}', { r: formatNumber(r), p: hm(p), seen })}
      />
      <Range label={t('Distance from Mars’s centre')} value={r} min={5000} max={30000} step={100} onChange={setR} format={(v) => `${formatNumber(v)} km`} />
      <Readouts
        items={[
          { label: t('One lap of the moon'), value: hm(p), tone: pace ? 'good' : undefined },
          { label: riseLabel, value: riseValue, tone: pace ? 'good' : 'accent' },
          { label: t('Mars’s tide'), value: pace ? t('No drift') : between > 0 ? t('Pulls it down') : t('Pushes it out') },
        ]}
      />
      <p className="lab__note">{t('Simplified: circular orbits over the equator, to scale. Mars turns once in 24 h 37 min.')}</p>
    </div>
  );
}
