import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A model start, not to scale: the track is 1 unit wide at the gates; the first straight is its lower half, and
 * the point P that every chariot heads for sits in the middle of that straight, on the break line. Twelve gates,
 * six either side of a central entrance, span the track's width.
 */
export const P = { x: 0, y: 0.75 };
export const RADIUS = 1.07;
export const GATE_Y: number[] = (() => {
  const ys: number[] = [], y0 = 0.05, y1 = 0.95, gap = 0.09, slot = (y1 - y0 - gap) / 12;
  for (let i = 0; i < 12; i++) ys.push(y0 + slot * (i + 0.5) + (i >= 6 ? gap : 0));
  return ys;
})();

export type Centre = 'track' | 'straight';
const centreY = (c: Centre) => (c === 'straight' ? P.y : 0.5);

const arcX = (y: number, c: Centre) => P.x - Math.sqrt(RADIUS * RADIUS - (y - centreY(c)) ** 2);
/** A straight row across the track, level with the middle of the true arc. */
const STRAIGHT_X = GATE_Y.reduce((s, y) => s + arcX(y, 'straight'), 0) / GATE_Y.length;

/** Each gate's position along the track: `bend` 0 is a straight row, 1 an arc of a circle round the chosen centre. */
export const gateX = (i: number, bend: number, c: Centre) => STRAIGHT_X + (arcX(GATE_Y[i], c) - STRAIGHT_X) * bend;

/** How far each chariot runs from its gate to P. */
export const runs = (bend: number, c: Centre) => GATE_Y.map((y, i) => Math.hypot(P.x - gateX(i, bend, c), P.y - y));

/** How much farther the longest run is than the shortest, as a fraction. */
export function unfairness(bend: number, c: Centre) {
  const r = runs(bend, c);
  return Math.max(...r) / Math.min(...r) - 1;
}

const GOAL = 0.002;

export default function CircusGates({ onDone }: LabProps) {
  const [bend, setBend] = useState(0);
  const [centre, setCentre] = useState<Centre>('track');
  const r = runs(bend, centre), u = unfairness(bend, centre);
  const longest = r.indexOf(Math.max(...r)), shortest = r.indexOf(Math.min(...r));
  useGoal(u < GOAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const s = Math.min(w / 2.3, (h - 18) / 1.08), top = 10, left = w * 0.1 + s * 1.15;
    const X = (x: number) => left + x * s, Y = (y: number) => top + y * s;
    // the track, the barrier and the break line
    ctx.fillStyle = 'rgba(217,187,131,0.18)';
    ctx.fillRect(X(-1.2), Y(0), w - X(-1.2), s);
    line(ctx, X(-1.2), Y(0), w, Y(0), C.faint, 1.5);
    line(ctx, X(-1.2), Y(1), w, Y(1), C.faint, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(X(0), Y(0.5) - 3, w - X(0), 6);
    line(ctx, X(0), Y(0.52), X(0), Y(1), C.ink, 2, [5, 4]);
    label(ctx, t('break line'), X(0) + 6, Y(0.97), { size: 10, align: 'left', color: C.soft });
    label(ctx, t('first straight'), X(0.55), Y(0.75), { size: 10, color: C.soft });
    // the centre of the arc, if it is not P
    if (centre === 'track') dot(ctx, X(P.x), Y(0.5), 3, C.cool);
    // strings from each gate to P, the longest red, the shortest green
    GATE_Y.forEach((y, i) => {
      const gx = gateX(i, bend, centre);
      const col = u < GOAL ? C.good : i === longest ? C.bad : i === shortest ? C.good : C.faint;
      line(ctx, X(gx), Y(y), X(P.x), Y(P.y), col, i === longest || i === shortest || u < GOAL ? 2 : 1);
      ctx.fillStyle = C.ink;
      ctx.fillRect(X(gx) - 9, Y(y) - (s * 0.06) / 2, 9, s * 0.06);
    });
    dot(ctx, X(P.x), Y(P.y), 4.5, C.accent);
  };

  return (
    <div className="lab">
      <Choice
        label={t('Centre of the curve')}
        value={centre}
        onChange={setCentre}
        options={[
          { value: 'track', label: t('Middle of the track') },
          { value: 'straight', label: t('Middle of the first straight') },
        ]}
      />
      <Stage draw={draw} label={t('Twelve starting gates and the run from each to the break line')} />
      <Range
        label={t('Bend the row of gates')}
        value={bend}
        min={0}
        max={1.5}
        step={0.05}
        onChange={setBend}
        format={(v) => (v === 0 ? t('straight row') : `${formatNumber(Math.round(v * 100))}%`)}
      />
      <Readouts
        items={[
          { label: t('Longest run vs shortest'), value: `+${formatNumber(Math.round(u * 1000) / 10)}%`, tone: u < GOAL ? 'good' : 'bad' },
          { label: t('Farthest gate'), value: u < GOAL ? t('every gate equal') : t('gate {n} of 12', { n: longest + 1 }), tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('Model start, not to scale: 100% puts the gates on a circle round the chosen centre.')}</p>
    </div>
  );
}
