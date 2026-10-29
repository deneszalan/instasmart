import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A simplified model of Laocoön's right shoulder and the arm Ludwig Pollak found, in cm, x to the viewer's right and
 * y up, from the middle of the statue's base. Pollak's arm is one rigid piece of marble: its elbow is bent, and
 * that bend can't change. A drill hole runs into its break, and another into the shoulder's (Paolo Liverani, Digital
 * Sculpture Project: the two holes align perfectly). Shapes and angles are illustrative, not measured on the statue.
 */
export const SHOULDER: [number, number] = [-45, 169];
export const HEAD: [number, number] = [-20, 192];
/** Upper arm and forearm lengths. */
export const UPPER = 34, FORE = 24;
/** The angle of the upper arm (0° = to the right, 90° = up) at which the two drill holes line up. */
export const FIT = 152;
/** The elbow's bend, fixed in the marble: the forearm runs this many degrees from the upper arm. */
export const BEND = -160;
/** Along the upper arm: the shoulder's face (cut back) and the arm's break; the gap between is filled with plaster. */
export const CUT = 3.5, BREAK = 8.5;
/** Both drill holes sit this far off the arm's axis. */
export const HOLE_V = 1.8;
/** How close the holes must come: within 2° and 0.25 cm. */
export const TOL_DEG = 2, TOL_CM = 0.25;

const RAD = Math.PI / 180;
const dir = (deg: number): [number, number] => [Math.cos(deg * RAD), Math.sin(deg * RAD)];
const armW = (u: number) => 10.5 + 8 * Math.exp(-Math.max(0, u) / 4);

/** A point on the arm placed at `angle`, shifted sideways by `shift`: u along its axis from the shoulder, v across. */
export function onArm(angle: number, shift: number, u: number, v = 0): [number, number] {
  const [c, s] = dir(angle);
  return [SHOULDER[0] + u * c - (v + shift) * s, SHOULDER[1] + u * s + (v + shift) * c];
}

/** How far the arm's drill hole is from lining up with the shoulder's: the angle between them and the sideways gap. */
export function holesOff(angle: number, shift: number) {
  return { deg: Math.abs(angle - FIT), cm: Math.abs(shift) };
}
export const aligned = (angle: number, shift: number) => {
  const off = holesOff(angle, shift);
  return off.deg <= TOL_DEG && off.cm <= TOL_CM;
};

/** The elbow and the forearm's broken end, for the arm at `angle`. */
export function armEnds(angle: number, shift = 0) {
  const elbow = onArm(angle, shift, UPPER), [c, s] = dir(angle + BEND);
  return { elbow, end: [elbow[0] + FORE * c, elbow[1] + FORE * s] as [number, number] };
}
export default function LaocoonArm({ onDone }: LabProps) {
  const [angle, setAngle] = useState(196);
  const [shift, setShift] = useState(2.5);
  const off = holesOff(angle, shift);
  const ok = aligned(angle, shift);
  useGoal(ok, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the view: x from -98 to 2 cm, y from 146 to 214 cm
    const s = Math.min((w - 12) / 100, (h - 10) / 68), x0 = (w - 100 * s) / 2 + 98 * s, y0 = (h - 68 * s) / 2 + 214 * s;
    const X = (x: number) => x0 + x * s, Y = (y: number) => y0 - y * s;
    const P = (p: [number, number]): [number, number] => [X(p[0]), Y(p[1])];
    const poly = (pts: [number, number][], fill: string, stroke = 'rgba(0,0,0,0.35)') => {
      ctx.beginPath();
      pts.forEach((p, i) => { const [x, y] = P(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
    };
    const limb = (a: [number, number], b: [number, number], w1: number, w2: number, fill: string, stroke = 'rgba(0,0,0,0.35)') => {
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, [c, sn] = [Math.cos(ang), Math.sin(ang)];
      poly([[a[0] + (c * w1) / 2, a[1] + (sn * w1) / 2], [b[0] + (c * w2) / 2, b[1] + (sn * w2) / 2], [b[0] - (c * w2) / 2, b[1] - (sn * w2) / 2], [a[0] - (c * w1) / 2, a[1] - (sn * w1) / 2]], fill, stroke);
    };
    // the torso, the head and the stump of the shoulder, faded
    const marble = 'rgba(235,229,216,0.38)';
    poly([[-49, 128], [-50, 150], [-47, 166], [-30, 172], [-12, 172], [2, 165], [4, 128]], marble);
    ctx.fillStyle = marble; ctx.beginPath(); ctx.ellipse(X(HEAD[0]), Y(HEAD[1]), 11 * s, 13 * s, -0.35, 0, Math.PI * 2); ctx.fill();
    limb(onArm(FIT, 0, -2), onArm(FIT, 0, CUT), armW(-2), armW(CUT), 'rgba(235,229,216,0.85)');
    // the shoulder's drill hole and the line it sets
    line(ctx, ...P(onArm(FIT, 0, -2, HOLE_V)), ...P(onArm(FIT, 0, 40, HOLE_V)), ok ? C.good : C.accent, 1.5, [6, 5]);
    line(ctx, ...P(onArm(FIT, 0, CUT - 5, HOLE_V)), ...P(onArm(FIT, 0, CUT, HOLE_V)), '#3b2f1c', 3);
    // the plaster, once the pieces line up
    if (ok) limb(onArm(FIT, 0, CUT), onArm(FIT, 0, BREAK), armW(CUT), armW(BREAK), 'rgba(169,185,187,0.9)');
    // Pollak's arm: a rigid piece, its elbow bent
    const { elbow, end } = armEnds(angle, shift);
    const fill = ok ? 'rgba(241,227,194,1)' : 'rgba(241,227,194,0.92)';
    limb(onArm(angle, shift, BREAK), elbow, armW(BREAK), armW(UPPER), fill);
    limb(elbow, end, 9, 7.4, fill);
    ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(X(elbow[0]), Y(elbow[1]), (armW(UPPER) / 2) * s, 0, Math.PI * 2); ctx.fill();
    line(ctx, ...P(onArm(angle, shift, BREAK, HOLE_V)), ...P(onArm(angle, shift, BREAK + 5, HOLE_V)), ok ? C.good : '#3b2f1c', 3);
    label(ctx, t('Pollak’s arm'), ...P(onArm(angle, shift, UPPER * 0.55, 14)), { size: 11, color: C.ink });
    if (ok) label(ctx, t('holes in line'), 10, 14, { size: 12, color: C.good, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Laocoön’s shoulder and Pollak’s arm; its drill hole is {d}° and {c} cm off the shoulder’s', { d: formatNumber(off.deg), c: formatNumber(off.cm) })} />
      <Range label={t('Turn the arm')} value={angle} min={100} max={220} step={1} onChange={setAngle} format={(v) => `${formatNumber(v)}°`} />
      <Range label={t('Slide it sideways')} value={shift} min={-4} max={4} step={0.25} onChange={setShift} format={(v) => `${formatNumber(v)} cm`} />
      <Readouts
        items={[
          { label: t('Holes turned apart by'), value: `${formatNumber(off.deg)}°`, tone: off.deg <= TOL_DEG ? 'good' : undefined },
          { label: t('Holes apart sideways by'), value: `${formatNumber(off.cm)} cm`, tone: off.cm <= TOL_CM ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified model: the arm is one rigid piece, so its bend can’t change. Shapes and angles are illustrative.')}</p>
    </div>
  );
}
