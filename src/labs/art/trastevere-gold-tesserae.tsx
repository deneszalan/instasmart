import { useState } from 'react';
import { C, dot, label, line, Range, Readouts, rng, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The model: one vertical slice of the apse wall, with a patch of gold tiles 1 cm tall from 10 to 12 m up. */
export const TILES = 200;
export const LOW = 10, HIGH = 12; // m
export const EYE = 1.6; // m
/** Sunlight comes down at this angle (degrees below the horizontal). */
export const SUN = 35;
/** The Sun is about half a degree wide, so a tile's flash is seen within about 0.27° of its exact direction. */
export const SUN_RADIUS = 0.27;
/** The stretch of nave the reader can stand in, in metres from the wall. */
export const NEAR = 2, FAR = 30;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Height of tile i. */
export const tileHeight = (i: number) => LOW + ((i + 0.5) * (HIGH - LOW)) / TILES;

/**
 * A mirror reflects with the angle out equal to the angle in, measured from its own surface: tipping a tile by
 * `tilt` degrees turns its reflection by twice that. Returns the angle below the horizontal of the reflected ray.
 */
export const reflectedAngle = (tilt: number, sun = SUN) => sun + 2 * tilt;

/** The angle below the horizontal from a tile at height h to an eye at distance x from the wall. */
export const angleToEye = (h: number, x: number) => deg(Math.atan2(h - EYE, x));

/** Each tile's tilt, the same random set for every spread: −spread to +spread degrees. */
export function tiltsFor(spread: number, seed = 11): number[] {
  const r = rng(seed);
  return Array.from({ length: TILES }, () => (r() * 2 - 1) * spread);
}

/** The tiles whose reflection of the Sun reaches an eye standing x metres from the wall. */
export function flashing(tilts: number[], x: number, sun = SUN): number[] {
  const out: number[] = [];
  tilts.forEach((tilt, i) => {
    if (Math.abs(reflectedAngle(tilt, sun) - angleToEye(tileHeight(i), x)) < SUN_RADIUS) out.push(i);
  });
  return out;
}

/** The share of places along the nave, every 10 cm from NEAR to FAR, where at least one tile flashes. */
export function coverage(tilts: number[], sun = SUN): number {
  let seen = 0, all = 0;
  for (let x = NEAR; x <= FAR + 1e-9; x += 0.1) {
    all++;
    if (flashing(tilts, x, sun).length) seen++;
  }
  return seen / all;
}

export const GOAL = 2 / 3;

export default function GoldTesserae({ onDone }: LabProps) {
  const [spread, setSpread] = useState(0);
  const [x, setX] = useState(8);
  const tilts = tiltsFor(spread);
  const hits = flashing(tilts, x);
  const cover = coverage(tilts);
  useGoal(cover >= GOAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 26, floor = h - 26, top = 14;
    // separate scales across and up, so the whole nave fits: angles look steeper than they are
    const sx = (R - L) / (FAR + 1), sy = (floor - top) / (HIGH + 1.5);
    const X = (m: number) => R - m * sx, Y = (m: number) => floor - m * sy;
    // floor, wall, eye height
    line(ctx, L, floor, R, floor, C.soft, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(R, Y(HIGH + 1.4), 10, floor - Y(HIGH + 1.4));
    line(ctx, X(FAR), Y(EYE), R, Y(EYE), C.line, 1, [3, 4]);
    label(ctx, t('eye height, 1.6 m'), X(FAR), Y(EYE) - 9, { size: 9.5, align: 'left', color: C.faint });
    for (const m of [0, 10, 20, 30]) label(ctx, `${m} m`, X(m), floor + 12, { size: 9, color: C.faint, align: m === 0 ? 'right' : 'center' });
    // where along the nave a flash can be seen
    for (let m = NEAR; m <= FAR + 1e-9; m += 0.1) {
      if (flashing(tilts, m).length) {
        ctx.fillStyle = 'rgba(253,224,71,0.85)';
        ctx.fillRect(X(m) - 0.8, Y(EYE) - 4, 1.6, 8);
      }
    }
    // sunlight coming in
    const a = rad(SUN);
    for (let k = 0; k < 4; k++) {
      const hh = LOW + 0.3 + k * 0.5, len = 9;
      line(ctx, X(len * Math.cos(a)), Y(hh + len * Math.sin(a)), R, Y(hh), 'rgba(253,224,71,0.35)', 1);
    }
    // the tiles that flash at you, and their rays
    for (const i of hits) line(ctx, R, Y(tileHeight(i)), X(x), Y(EYE), 'rgba(253,224,71,0.9)', 1.2);
    // the gold patch, every tile drawn at its tilt (exaggerated four times so it shows)
    for (let i = 0; i < TILES; i += 2) {
      const yy = Y(tileHeight(i)), tt = rad(tilts[i] * 4), len = 7;
      ctx.strokeStyle = hits.includes(i) || hits.includes(i + 1) ? '#fff7c2' : '#d9a73e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(R + 2 - Math.sin(tt) * 0, yy - (len / 2) * Math.cos(tt));
      ctx.lineTo(R + 2 + Math.sin(tt) * len, yy + (len / 2) * Math.cos(tt));
      ctx.stroke();
    }
    // you
    dot(ctx, X(x), Y(EYE), 5, hits.length ? C.accent : C.ink);
    line(ctx, X(x), Y(EYE) + 5, X(x), floor, C.ink, 2);
  };

  const pct = Math.round(cover * 100);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A slice of the apse wall with gold tiles tilted up to {s} degrees, and you {x} m away', { s: formatNumber(spread), x: formatNumber(x) })} />
      <Range label={t('Gold tiles tilted up to')} value={spread} min={0} max={10} step={0.5} onChange={setSpread} format={(v) => `±${formatNumber(v)}°`} />
      <Range label={t('You stand in the nave')} value={x} min={NEAR} max={FAR} step={0.1} onChange={setX} format={(v) => t('{n} m from the apse', { n: formatNumber(Math.round(v * 10) / 10) })} />
      <Readouts
        items={[
          { label: t('Gold tiles flashing at you'), value: formatNumber(hits.length), tone: hits.length ? 'accent' : undefined },
          { label: t('Places in the nave with a flash'), value: `${pct}%`, tone: cover >= GOAL ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: one slice of wall, 200 gold tiles 1 cm tall between 10 and 12 m up, and sunlight from one direction, 35° above the horizon. Yellow ticks: where you would see a flash.')}</p>
    </div>
  );
}
