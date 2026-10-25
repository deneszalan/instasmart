import { useState } from 'react';
import { Btn, C, Choice, dot, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Noons seen on board during one lap of the globe that takes `days` at home: one fewer sailing west, one more sailing east. */
export const noonsAboard = (days: number, west: boolean) => days + (west ? -1 : 1);

export default function LostDay({ onDone, active }: LabProps) {
  const [dir, setDir] = useState<'west' | 'east'>('west');
  const [days, setDays] = useState(5);
  const [time, setTime] = useState(0); // days since setting off
  const [running, setRunning] = useState(false);
  const [counts, setCounts] = useState({ home: 0, ship: 0 });
  const [done, setDone] = useState(new Set<string>());
  useGoal(done.has('west') && done.has('east'), onDone);

  const west = dir === 'west';
  // angles as seen from above the North Pole; the Earth turns anticlockwise, the Sun's light comes from the right
  const homeAngle = (s: number) => 2 * Math.PI * s;
  const shipAngle = (s: number) => homeAngle(s) + (west ? -1 : 1) * 2 * Math.PI * (s / days);
  // noon comes each time a place turns to face the Sun, at angles π, 3π, 5π …
  const noonsBy = (angle: (s: number) => number, s: number) => Math.floor((angle(s) + Math.PI) / (2 * Math.PI) + 1e-9);

  useFrame((dt) => {
    const next = Math.min(days, time + dt * 0.8);
    setTime(next);
    setCounts({ home: noonsBy(homeAngle, next) - noonsBy(homeAngle, 0), ship: noonsBy(shipAngle, next) - noonsBy(shipAngle, 0) });
    if (next >= days) {
      setRunning(false);
      setDone((d) => new Set(d).add(dir));
    }
  }, active && running);

  const start = () => {
    setTime(0);
    setCounts({ home: 0, ship: 0 });
    setRunning(true);
  };
  const pick = (d: 'west' | 'east') => {
    setDir(d);
    setRunning(false);
    setTime(0);
    setCounts({ home: 0, ship: 0 });
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.4, cy = h / 2, R = Math.min(w * 0.3, h * 0.42);
    // daylight on the side facing the Sun
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    for (let k = -2; k <= 2; k++) label(ctx, '←', w - 18, cy + k * R * 0.4, { size: 14, color: 'rgba(253,224,71,0.6)' });
    label(ctx, '☀', w - 14, 14, { size: 16, color: C.accent });
    line(ctx, cx, cy, cx + R + 8, cy, 'rgba(253,224,71,0.5)', 1, [3, 3]);
    label(ctx, t('noon line'), cx + R + 6, cy - 9, { size: 9.5, align: 'left', color: 'rgba(253,224,71,0.8)' });
    const at = (a: number, r: number): [number, number] => [cx + Math.cos(-a + Math.PI) * r, cy + Math.sin(-a + Math.PI) * r];
    const home = at(homeAngle(time), R * 0.8), ship = at(shipAngle(time), R * 0.96);
    dot(ctx, ...home, 6, '#fca5a5');
    label(ctx, t('Spain'), home[0], home[1] - 12, { size: 10, color: '#fca5a5' });
    label(ctx, '⛵', ship[0], ship[1], { size: 15 });
    dot(ctx, cx, cy, 3, C.ink);
  };

  return (
    <div className="lab">
      <Choice
        label={t('Sailing')}
        value={dir}
        onChange={pick}
        options={[
          { value: 'west', label: t('West, like Magellan’s crew') },
          { value: 'east', label: t('East, like Phileas Fogg') },
        ]}
      />
      <Stage draw={draw} label={t('The Earth seen from above the North Pole, with Spain and a ship sailing {d} around it', { d: west ? t('west') : t('east') })} />
      <Range label={t('One lap takes')} value={days} min={2} max={12} onChange={(v) => (setDays(v), setRunning(false), setTime(0), setCounts({ home: 0, ship: 0 }))} format={(v) => t('{n} days at home', { n: v })} />
      <div className="lab__row">
        <Btn onClick={start} disabled={running}>
          {t('Sail round the world')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Noons in Spain'), value: String(counts.home) },
          { label: t('Noons on board'), value: String(counts.ship), tone: time >= days && counts.ship !== counts.home ? 'accent' : undefined },
        ]}
      />
    </div>
  );
}
