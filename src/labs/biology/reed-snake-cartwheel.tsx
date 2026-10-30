import { useState } from 'react';
import { Btn, C, label, lerp, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The racetrack in the Toho University study, in metres, and the measured range of peak rolling speeds, m/s. */
export const TRACK_M = 2.2;
export const ROLL_MIN = 1.72;
export const ROLL_MAX = 3.69;
/** The paper's "about four times": the slither speed taken as a quarter of the roll (simplified). */
export const slitherSpeed = (rollSpeed: number) => rollSpeed / 4;
/** Seconds to cross the track at `speed` m/s. */
export const crossingTime = (speed: number) => TRACK_M / speed;

const SNAKE = '#d88a3c', HEADC = '#f2c27a', MOSS = '#7fb069';

export default function ReedSnakeCartwheel({ onDone, active }: LabProps) {
  const [roll, setRoll] = useState(2.5);
  const [clock, setClock] = useState(-1); // seconds since the start of a race; -1 when stopped
  useFrame((dt) => setClock((c) => (c < 0 ? c : Math.min(c + dt, crossingTime(slitherSpeed(ROLL_MIN)) + 0.5))), active && clock >= 0);
  const rollT = crossingTime(roll), slitherT = crossingTime(slitherSpeed(roll));
  useGoal(clock >= rollT && rollT < 1, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const x0 = 26, x1 = w - 26;
    const X = (m: number) => lerp(x0, x1, Math.min(1, m / TRACK_M));
    const el = Math.max(0, clock);
    [[0.3, t('rolling'), roll], [0.72, t('slithering'), slitherSpeed(roll)]].forEach(([fy, name, v], i) => {
      const y = h * (fy as number);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x0, y + 14, x1 - x0, 3);
      label(ctx, name as string, x0, y - 24, { size: 11, align: 'left', color: C.soft });
      const dist = Math.min(TRACK_M, el * (v as number));
      const hx = X(dist);
      if (i === 0) {
        // a loop rolling along
        const r = 13, a0 = (el * 3) % 1 * Math.PI * 2;
        ctx.strokeStyle = SNAKE;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let k = 0; k <= 24; k++) { const a = a0 + (k / 24) * Math.PI * 1.7; const px = hx - 18 + r * Math.cos(a), py = y - r * Math.sin(a); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.fillStyle = HEADC;
        ctx.beginPath();
        ctx.arc(hx + 4, y - 2, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = SNAKE;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let k = 0; k <= 24; k++) { const u = k / 24; const px = hx - 40 + u * 40, py = y + 7 * Math.sin(u * Math.PI * 3 - el * 10); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.fillStyle = HEADC;
        ctx.beginPath();
        ctx.arc(hx + 2, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      label(ctx, `${(v as number).toFixed(2)} m/s`, x1, y - 24, { size: 11, align: 'right', color: C.soft });
      const done = dist >= TRACK_M, tt = i === 0 ? rollT : slitherT;
      if (done) label(ctx, t('{s} s', { s: tt.toFixed(2) }), x1, y + 32, { size: 11, align: 'right', color: i === 0 && tt < 1 ? MOSS : C.ink });
    });
    label(ctx, t('{m} m track', { m: TRACK_M }), w / 2, h - 10, { size: 10, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Rolling at {r} m/s crosses the 2.2 m track in {a} s; slithering at a quarter of that takes {b} s', { r: roll.toFixed(2), a: rollT.toFixed(2), b: slitherT.toFixed(2) })} />
      <div className="lab__row">
        <Range label={t('Rolling speed')} value={roll} min={ROLL_MIN} max={ROLL_MAX} step={0.01} onChange={setRoll} format={(v) => `${v.toFixed(2)} m/s`} />
        <Btn onClick={() => setClock(0)}>{t('Race')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Rolling, 2.2 m'), value: `${rollT.toFixed(2)} s`, tone: rollT < 1 ? 'good' : undefined },
          { label: t('Slithering, 2.2 m'), value: `${slitherT.toFixed(2)} s` },
        ]}
      />
      <p className="lab__note">{t('Simplified: the slither runs at a quarter of the roll, the paper’s “about four times”; measured peak rolls were 1.72 to 3.69 m/s on a 2.2 m track.')}</p>
    </div>
  );
}
