import { useRef, useState } from 'react';
import { Btn, C, label, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const R = 6371; // km
const GM = 398600; // km³/s²
const HEIGHT = 400; // the space station's height, km

/** Speed for a circular orbit at a height above the ground, km/s. */
export const circular = (height: number) => Math.sqrt(GM / (R + height));
/** Gravity at a height, as a share of gravity on the ground. */
export const gravityShare = (height: number) => Math.pow(R / (R + height), 2);

type Fate = 'flying' | 'landed' | 'orbit' | 'escaped';

export default function Falling({ onDone, active }: LabProps) {
  const [speed, setSpeed] = useState(6);
  const shot = useRef<{ x: number; y: number; vx: number; vy: number; trail: number[]; turned: number; time: number } | null>(null);
  const [fate, setFate] = useState<Fate | null>(null);
  const [, setTick] = useState(0);
  useGoal(fate === 'orbit', onDone);

  const fire = () => {
    shot.current = { x: 0, y: R + HEIGHT, vx: speed, vy: 0, trail: [0, R + HEIGHT], turned: 0, time: 0 };
    setFate('flying');
  };

  useFrame((dt) => {
    const s = shot.current;
    if (!s || fate !== 'flying') return;
    // 600 simulated seconds per real second, in small steps (semi-implicit Euler is steady enough here)
    const steps = 60, h = (dt * 600) / steps;
    for (let i = 0; i < steps; i++) {
      const r = Math.hypot(s.x, s.y), a = -GM / (r * r * r);
      s.vx += a * s.x * h;
      s.vy += a * s.y * h;
      const before = Math.atan2(s.x, s.y);
      s.x += s.vx * h;
      s.y += s.vy * h;
      let d = Math.atan2(s.x, s.y) - before;
      if (d < -Math.PI) d += 2 * Math.PI;
      if (d > Math.PI) d -= 2 * Math.PI;
      s.turned += d;
      s.time += h;
      if (Math.hypot(s.x, s.y) <= R) {
        setFate('landed');
        break;
      }
      if (s.turned >= 2 * Math.PI) {
        setFate('orbit');
        break;
      }
      if (Math.hypot(s.x, s.y) > R * 6) {
        // Far out: it escapes if it has enough energy, otherwise it's on a long orbit that will bring it back.
        setFate((s.vx * s.vx + s.vy * s.vy) / 2 - GM / Math.hypot(s.x, s.y) >= 0 ? 'escaped' : 'orbit');
        break;
      }
    }
    s.trail.push(s.x, s.y);
    setTick((k) => k + 1);
  }, active && fate === 'flying');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2 + 6, k = (Math.min(w, h) / 2 - 16) / (R * 1.45);
    const earth = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, R * k);
    earth.addColorStop(0, '#60a5fa');
    earth.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = earth;
    ctx.beginPath();
    ctx.arc(cx, cy, R * k, 0, Math.PI * 2);
    ctx.fill();
    // the mountain-top cannon at the station's height (drawn taller than life)
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - R * k + 2);
    ctx.lineTo(cx, cy - (R + HEIGHT) * k - 4);
    ctx.lineTo(cx + 16, cy - R * k + 2);
    ctx.fill();
    const s = shot.current;
    if (s) {
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < s.trail.length; i += 2) ctx[i ? 'lineTo' : 'moveTo'](cx + s.trail[i] * k, cy - s.trail[i + 1] * k);
      ctx.stroke();
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.arc(cx + s.x * k, cy - s.y * k, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    label(ctx, t('{v} km/s', { v: formatNumber(speed) }), 10, 14, { size: 13, align: 'left', color: C.ink });
  };

  const say: Record<Fate, string> = {
    flying: t('Falling…'),
    landed: t('It fell back to Earth, {km} km away.', { km: formatNumber(Math.round((shot.current?.turned ?? 0) * R)) }),
    orbit: t('Orbit! It keeps falling, but the ground curves away just as fast.'),
    escaped: t('Too fast: it escaped Earth’s pull altogether.'),
  };
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Newton’s cannon firing sideways from the height of the space station')} />
      <Range label={t('Launch speed')} value={speed} min={1} max={11.5} step={0.1} onChange={setSpeed} format={(v) => `${formatNumber(v)} km/s`} />
      <div className="lab__row">
        <Btn onClick={fire} disabled={fate === 'flying'}>
          {t('Fire!')}
        </Btn>
        <span className="lab__note" aria-live="polite">
          {fate ? say[fate] : t('Gravity up here is still {p}% of its pull on the ground.', { p: Math.round(gravityShare(HEIGHT) * 100) })}
        </span>
      </div>
    </div>
  );
}
