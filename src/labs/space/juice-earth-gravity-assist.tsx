import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber, withUnit } from '../../lib/format';

/** Earth's GM (km³/s²), mean radius (km) and mean speed round the Sun (km/s): NASA Earth fact sheet. */
export const MU = 398600, R_EARTH = 6371, V_EARTH = 29.78;
/** Juice's flyby on 28 September 2026 (ESA): 8,640 km up, a 20° turn, 3.5 km/s faster. */
export const JUICE_ALT = 8640, JUICE_TURN = 20, JUICE_GAIN = 3.5;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** How far a flyby turns the path, in degrees, at an approach speed `vinf` (km/s, relative to Earth): sin(δ/2) = 1/(1 + r·v∞²/μ). */
export function turnAngle(altKm: number, vinf: number): number {
  return 2 * deg(Math.asin(1 / (1 + ((R_EARTH + altKm) * vinf * vinf) / MU)));
}

/** The approach speed relative to Earth that turns a path by `turnDeg` at `altKm`. For Juice: about 11.2 km/s. */
export function approachSpeed(altKm: number, turnDeg: number): number {
  return Math.sqrt((MU / (R_EARTH + altKm)) * (1 / Math.sin(rad(turnDeg / 2)) - 1));
}
export const VINF = approachSpeed(JUICE_ALT, JUICE_TURN);

/** Speed round the Sun for a velocity relative to Earth of `vinf` at `thDeg` to Earth's direction of travel. */
export const sunSpeed = (vinf: number, thDeg: number) => Math.hypot(V_EARTH + vinf * Math.cos(rad(thDeg)), vinf * Math.sin(rad(thDeg)));

/** An approach direction (degrees from Earth's direction of travel) for which Juice's 20° turn adds 3.5 km/s. */
export const TH_IN = (() => {
  let lo = 0, hi = 120;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (sunSpeed(VINF, m - JUICE_TURN) - sunSpeed(VINF, m) < JUICE_GAIN) lo = m;
    else hi = m;
  }
  return lo;
})();

export type Side = 'behind' | 'front';

/** A flyby at `altKm` passing behind or in front of Earth: the turn and the speeds round the Sun before and after. */
export function flyby(altKm: number, side: Side) {
  const turn = turnAngle(altKm, VINF);
  const thOut = side === 'behind' ? TH_IN - turn : TH_IN + turn;
  const before = sunSpeed(VINF, TH_IN), after = sunSpeed(VINF, thOut);
  return { turn, thOut, before, after, gain: after - before };
}

const TEAL = '#2ee6b6', CORAL = '#ff7a6b', GOLD = '#ffc23d';

function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 2.5) {
  line(ctx, x0, y0, x1, y1, color, width);
  const a = Math.atan2(y1 - y0, x1 - x0), h = 7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * h, y1 - Math.sin(a - 0.45) * h);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * h, y1 - Math.sin(a + 0.45) * h);
  ctx.fill();
}

export default function JuiceGravityAssist({ onDone }: LabProps) {
  const [alt, setAlt] = useState(30000);
  const [side, setSide] = useState<Side>('front');
  const f = flyby(alt, side);
  const matched = Math.abs(f.gain - JUICE_GAIN) <= 0.1;
  useGoal(matched, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the flyby seen from Earth, which moves to the right; the probe comes up from below
    const cx = w * 0.26, cy = h * 0.52, span = 64000, s = (h * 0.46) / span;
    const e = 1 + ((R_EARTH + alt) * VINF * VINF) / MU, a = MU / (VINF * VINF), p = a * (e * e - 1);
    const sign = side === 'behind' ? 1 : -1; // behind: passes on Earth's trailing (left) side and turns towards Earth's motion
    const mid = rad(TH_IN) - sign * rad(f.turn / 2); // direction of motion at closest approach
    const Q = { x: Math.cos(mid), y: -Math.sin(mid) }, P = { x: sign * Q.y, y: -sign * Q.x };
    const fInf = Math.acos(-1 / e) - 0.02;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w * 0.52, h);
    ctx.clip();
    ctx.strokeStyle = matched ? C.good : f.gain >= 0 ? GOLD : CORAL;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 200; i++) {
      const nu = -fInf + (2 * fInf * i) / 200, r = p / (1 + e * Math.cos(nu));
      if (r > span * 1.3) continue;
      const x = cx + r * s * (Math.cos(nu) * P.x + Math.sin(nu) * Q.x), y = cy + r * s * (Math.cos(nu) * P.y + Math.sin(nu) * Q.y);
      if (started) ctx.lineTo(x, y);
      else {
        ctx.moveTo(x, y);
        started = true;
      }
    }
    ctx.stroke();
    ctx.restore();
    dot(ctx, cx, cy, Math.max(4, R_EARTH * s), '#3d7fe0');
    arrow(ctx, cx - 14, h - 14, cx + 16, h - 14, TEAL, 2);
    label(ctx, t('Earth moves'), cx + 22, h - 14, { size: 10, align: 'left', color: TEAL });

    // right: the arrows seen from the Sun
    const k = (w * 0.44) / (V_EARTH + VINF + 2), ox = w * 0.54, oy = h * 0.8;
    const vIn = { x: VINF * Math.cos(rad(TH_IN)) * k, y: -VINF * Math.sin(rad(TH_IN)) * k };
    const vOut = { x: VINF * Math.cos(rad(f.thOut)) * k, y: -VINF * Math.sin(rad(f.thOut)) * k };
    const tip = { x: ox + V_EARTH * k, y: oy };
    arrow(ctx, ox, oy, tip.x, tip.y, TEAL);
    line(ctx, ox, oy, tip.x + vIn.x, tip.y + vIn.y, C.faint, 2, [4, 3]);
    arrow(ctx, tip.x, tip.y, tip.x + vOut.x, tip.y + vOut.y, CORAL);
    arrow(ctx, ox, oy, tip.x + vOut.x, tip.y + vOut.y, matched ? C.good : GOLD, 3);
    label(ctx, t('probe relative to the Sun'), ox + 2, h * 0.12, { size: 10, align: 'left', color: matched ? C.good : GOLD });
    label(ctx, t('dashed: before the flyby'), ox + 2, h * 0.12 + 14, { size: 9.5, align: 'left', color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A flyby {a} km above Earth turns the probe by {d}° and changes its speed round the Sun by {g} km/s', { a: formatNumber(alt), d: formatNumber(Math.round(f.turn * 10) / 10), g: formatNumber(Math.round(f.gain * 10) / 10) })} />
      <Choice
        label={t('Which side of Earth')}
        options={[
          { value: 'front' as Side, label: t('In front of Earth') },
          { value: 'behind' as Side, label: t('Behind Earth') },
        ]}
        value={side}
        onChange={setSide}
      />
      <Range label={t('Closest approach')} value={alt} min={300} max={40000} step={100} onChange={setAlt} format={(v) => withUnit(v, 'km')} />
      <Readouts
        items={[
          { label: t('Turned by'), value: `${formatNumber(Math.round(f.turn * 10) / 10)}°` },
          { label: t('Speed gained'), value: withUnit(Math.round(f.gain * 10) / 10, 'km/s'), tone: matched ? 'good' : f.gain < 0 ? 'bad' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: Earth’s gravity only, Earth moving straight at 29.8 km/s, and an arrival at 11.2 km/s set to match Juice.')}</p>
    </div>
  );
}
