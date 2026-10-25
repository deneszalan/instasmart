import { useRef, useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Radius of the Sun's radiative zone, which light has to random-walk across: about 0.7 of the Sun's, 490,000 km. */
const ZONE_M = 4.9e8;
const LIGHT = 3e8;
const YEAR = 3.156e7;

/** Years for light to random-walk a distance R with steps of length l: about (R / l)² steps of l / c each. */
export const walkYears = (stepMetres: number) => (ZONE_M * ZONE_M) / (stepMetres * LIGHT) / YEAR;

/** The model photon's world: a disc 20 steps across, so it needs about 400 steps to get out. */
const RADIUS = 20;

export default function AncientSunlight({ onDone, active }: LabProps) {
  const path = useRef<number[]>([0, 0]);
  const [steps, setSteps] = useState(0);
  const [speed, setSpeed] = useState(20);
  const [running, setRunning] = useState(true);
  const [escapes, setEscapes] = useState<number[]>([]);
  const [mm, setMm] = useState(1);
  useGoal(escapes.length > 0, onDone);

  useFrame((dt) => {
    const p = path.current;
    const n = Math.max(1, Math.round(speed * dt * 10));
    for (let i = 0; i < n; i++) {
      const x = p[p.length - 2], y = p[p.length - 1], a = Math.random() * Math.PI * 2;
      const nx = x + Math.cos(a), ny = y + Math.sin(a);
      p.push(nx, ny);
      if (Math.hypot(nx, ny) >= RADIUS) {
        setEscapes((e) => [...e, p.length / 2 - 1]);
        path.current = [0, 0];
        break;
      }
    }
    setSteps(path.current.length / 2 - 1);
  }, active && running);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 10, k = r / RADIUS;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    glow.addColorStop(0, '#fff7cc');
    glow.addColorStop(0.25, '#fbbf24');
    glow.addColorStop(1, '#b45309');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // the straight path the light would take without collisions
    ctx.strokeStyle = 'rgba(17,24,39,0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    const p = path.current;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < p.length; i += 2) ctx[i ? 'lineTo' : 'moveTo'](cx + p[i] * k, cy + p[i + 1] * k);
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(cx + p[p.length - 2] * k, cy + p[p.length - 1] * k, 4, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('straight out: {n} steps', { n: RADIUS }), cx + r / 2, cy - 8, { size: 10.5, color: '#1f2937' });
  };

  const avg = escapes.length ? Math.round(escapes.reduce((a, b) => a + b, 0) / escapes.length) : null;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A photon zigzagging out from the centre of a model Sun')} />
      <Readouts
        items={[
          { label: t('Steps so far'), value: formatNumber(steps) },
          { label: t('Steps to escape'), value: escapes.length ? `${formatNumber(escapes[escapes.length - 1])}` : '…', tone: 'accent' },
          { label: t('Average, {n} escapes', { n: escapes.length }), value: avg === null ? '…' : formatNumber(avg) },
        ]}
      />
      <div className="lab__row">
        <Btn onClick={() => setRunning((r) => !r)}>{running ? t('Pause') : t('Play')}</Btn>
        <Btn ghost onClick={() => setSpeed((v) => (v === 20 ? 100 : 20))}>
          {speed === 20 ? t('Faster') : t('Slower')}
        </Btn>
      </div>
      <Range label={t('Real step')} value={mm} min={0.1} max={5} step={0.1} onChange={setMm} format={(v) => `${formatNumber(v)} mm`} />
      <p className="lab__note">{t('Simple model, {mm} mm steps: about {y} years to cross the Sun’s radiative zone.', { mm: formatNumber(mm), y: formatNumber(Math.round(walkYears(mm / 1000) / 100) * 100) })}</p>
    </div>
  );
}
