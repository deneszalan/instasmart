import { useState } from 'react';
import { Btn, C, dot, label, line, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Refractive index of the deep South Pole ice (Nobel scientific background, 2026), and the Cherenkov angle, cos θ = 1/n. */
export const N_ICE = 1.31;
export const THETA = Math.acos(1 / N_ICE);
/** Speed of light in a vacuum, metres per nanosecond. */
const C_M_NS = 0.2998;

/** A slice through IceCube: 9 strings 125 m apart, each with 60 sensors every 17 m. Heights in metres, 0 at the deepest sensor. */
export const SENSORS: { x: number; z: number }[] = [];
for (let s = -4; s <= 4; s++) for (let i = 0; i < 60; i++) SENSORS.push({ x: s * 125, z: i * 17 });

/** A straight muon track: a point it passes through and its direction of travel, in degrees (0 = right, 90 = straight up). */
export interface Track {
  x: number;
  z: number;
  angle: number;
}

/** Light reaching a sensor at most this far from the track is seen (simplified; clear ice absorbs over about 200 m). */
export const REACH = 110;

/**
 * When Cherenkov light from the track reaches a sensor, in ns after the muon passes the track's reference point:
 * (l − d/tan θ)/c + n·d/(c·sin θ), for a sensor l metres along the track and d metres from it.
 */
export function arrival(s: { x: number; z: number }, tr: Track): { time: number; d: number } {
  const a = (tr.angle * Math.PI) / 180, ux = Math.cos(a), uz = Math.sin(a);
  const dx = s.x - tr.x, dz = s.z - tr.z;
  const l = dx * ux + dz * uz, d = Math.abs(dx * uz - dz * ux);
  return { time: (l - d / Math.tan(THETA) + (N_ICE * d) / Math.sin(THETA)) / C_M_NS, d };
}

/** The arrival time at a sensor that sees the light, or null if it is too far from the track. */
export function hitTime(s: { x: number; z: number }, tr: Track): number | null {
  const { time, d } = arrival(s, tr);
  return d > REACH ? null : time;
}

export interface Hit {
  i: number;
  time: number;
}

export function hitsOf(tr: Track): Hit[] {
  return SENSORS.flatMap((s, i) => {
    const time = hitTime(s, tr);
    return time === null ? [] : [{ i, time }];
  });
}

/**
 * The best track at a given angle: slide it sideways and shift its clock until the predicted hit times match the
 * measured ones best. Returns that track and the root-mean-square mismatch in ns.
 */
export function fitAt(hits: Hit[], angle: number): { track: Track; rms: number } {
  const a = (angle * Math.PI) / 180, nx = -Math.sin(a), nz = Math.cos(a);
  let best = { track: { x: 0, z: 500, angle }, rms: Infinity };
  for (let off = -700; off <= 700; off += 4) {
    const tr = { x: nx * off, z: 500 + nz * off, angle };
    const pred = hits.map((h) => arrival(SENSORS[h.i], tr).time);
    const shift = hits.reduce((sum, h, i) => sum + h.time - pred[i], 0) / hits.length;
    const rms = Math.sqrt(hits.reduce((sum, h, i) => sum + (h.time - pred[i] - shift) ** 2, 0) / hits.length);
    if (rms < best.rms) best = { track: tr, rms };
  }
  return best;
}

/** A random up-going muon (from a neutrino that came through the Earth) crossing the slice. */
export function newEvent(seed: number): Track {
  const r = rng(seed);
  for (;;) {
    const tr = { x: (r() - 0.5) * 500, z: 300 + r() * 400, angle: Math.round(25 + r() * 130) };
    if (hitsOf(tr).length >= 25) return tr;
  }
}

/** Smallest difference between two directions, in degrees. */
export const angleGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

export default function IceCube({ onDone }: LabProps) {
  const [seed, setSeed] = useState(2026);
  const [guess, setGuess] = useState(270);
  const truth = newEvent(seed);
  const hits = hitsOf(truth);
  const fit = fitAt(hits, guess);
  const error = angleGap(guess, truth.angle);
  const found = error <= 3;
  useGoal(found, onDone);
  const t0 = Math.min(...hits.map((h) => h.time)), t1 = Math.max(...hits.map((h) => h.time));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min((w - 20) / 1100, (h - 20) / 1100), cx = w / 2, cz = h / 2;
    const X = (x: number) => cx + x * s, Y = (z: number) => cz - (z - 500) * s;
    for (let k = -4; k <= 4; k++) line(ctx, X(k * 125), Y(0), X(k * 125), Y(1003), C.line, 1);
    SENSORS.forEach((p) => dot(ctx, X(p.x), Y(p.z), 1.4, C.faint));
    for (const hit of hits) {
      const p = SENSORS[hit.i];
      const hue = ((hit.time - t0) / (t1 - t0 || 1)) * 275;
      dot(ctx, X(p.x), Y(p.z), Math.max(1.8, 17 * s * 0.55), `hsl(${hue}, 95%, 60%)`);
    }
    // a track through the slice, as an arrow in its direction of travel
    const arrow = (tr: Track, color: string, width: number, dash: number[] = []) => {
      const a = (tr.angle * Math.PI) / 180, ux = Math.cos(a), uz = Math.sin(a), L = 760;
      const x0 = X(tr.x - ux * L), y0 = Y(tr.z - uz * L), x1 = X(tr.x + ux * L), y1 = Y(tr.z + uz * L);
      ctx.save();
      ctx.beginPath();
      ctx.rect(4, 4, w - 8, h - 8);
      ctx.clip();
      line(ctx, x0, y0, x1, y1, color, width, dash);
      ctx.restore();
      const hx = X(tr.x + ux * 420), hy = Y(tr.z + uz * 420), back = Math.atan2(uz, -ux);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(back + 0.45) * 14, hy + Math.sin(back + 0.45) * 14);
      ctx.lineTo(hx + Math.cos(back - 0.45) * 14, hy + Math.sin(back - 0.45) * 14);
      ctx.fill();
    };
    if (found) arrow(truth, C.good, 2, [6, 4]);
    arrow(fit.track, found ? C.good : C.accent, 2.5);
    label(ctx, t('early'), 12, 12, { size: 10, align: 'left', color: 'hsl(0, 95%, 60%)' });
    label(ctx, t('late'), 44, 12, { size: 10, align: 'left', color: 'hsl(275, 95%, 70%)' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A slice of IceCube: {n} sensors lit, coloured from early (red) to late (purple), and your track', { n: hits.length })} />
      <Range label={t('Your track’s direction')} value={guess} min={0} max={359} step={1} onChange={setGuess} format={(v) => `${formatNumber(v)}°`} />
      <div className="lab__row">
        <Btn onClick={() => setSeed(seed + 1)}>{t('New neutrino')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Sensors hit'), value: formatNumber(hits.length) },
          { label: t('Timing mismatch'), value: t('{n} ns', { n: formatNumber(Math.round(fit.rms)) }), tone: found ? 'good' : undefined },
          { label: t('Off by'), value: found ? `${formatNumber(error)}°` : '?', tone: found ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: a straight track, and light that goes straight to sensors within 110 m.')}</p>
    </div>
  );
}
