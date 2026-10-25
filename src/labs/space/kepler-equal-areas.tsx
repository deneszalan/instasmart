import { useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Solves Kepler's equation M = E − e sin E for the eccentric anomaly E (Newton's method). */
export function eccentricAnomaly(M: number, e: number): number {
  let E = e > 0.8 ? Math.PI : M;
  for (let i = 0; i < 30; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/** Position on an orbit with semi-major axis 1, the Sun at the origin (a focus), at a fraction `f` of the period. */
export function orbitPoint(f: number, e: number): [number, number] {
  const E = eccentricAnomaly(2 * Math.PI * f, e);
  return [Math.cos(E) - e, Math.sqrt(1 - e * e) * Math.sin(E)];
}

const WEDGES = 12;

export default function Kepler({ onDone, active }: LabProps) {
  const [e, setE] = useState(0.3);
  const [f, setF] = useState(0);
  const [playing, setPlaying] = useState(true);
  useFrame((dt) => setF((v) => (v + dt / 8) % 1), active && playing);
  const ratio = (1 + e) / (1 - e);
  useGoal(Math.abs(ratio - 3) < 0.08, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const b = Math.sqrt(1 - e * e), k = Math.min((w - 24) / 2, (h - 24) / (2 * b)), cx = w / 2 + e * k, cy = h / 2;
    const P = ([x, y]: [number, number]): [number, number] => [cx + x * k, cy - y * k];
    // twelve wedges, each swept in the same time: long and thin far out, short and fat close in
    for (let i = 0; i < WEDGES; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 0; s <= 16; s++) ctx.lineTo(...P(orbitPoint((i + s / 16) / WEDGES, e)));
      ctx.closePath();
      ctx.fillStyle = i % 2 ? 'rgba(253,224,71,0.30)' : 'rgba(253,224,71,0.16)';
      ctx.fill();
    }
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let s = 0; s <= 120; s++) ctx[s ? 'lineTo' : 'moveTo'](...P(orbitPoint(s / 120, e)));
    ctx.stroke();
    // the wedge being swept right now
    const now = Math.floor(f * WEDGES);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s <= 16; s++) ctx.lineTo(...P(orbitPoint(now / WEDGES + ((f * WEDGES - now) * s) / 16 / WEDGES, e)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(253,224,71,0.7)';
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    const [px, py] = P(orbitPoint(f, e));
    ctx.fillStyle = C.cool;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('closest'), ...P([1 - e + 0.12, 0]), { size: 10, align: 'left' });
  };

  const presets: [string, number][] = [
    [t('Earth'), 0.017],
    [t('Mars'), 0.093],
    [t('Pluto'), 0.249],
  ];
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A planet sweeping equal areas in equal times around an orbit of eccentricity {e}', { e })} />
      <Range label={t('Stretch')} value={e} min={0} max={0.9} step={0.005} onChange={setE} format={(v) => formatNumber(Math.round(v * 1000) / 1000)} />
      <div className="lab__row">
        {presets.map(([name, v]) => (
          <Btn key={name} ghost onClick={() => setE(v)}>
            {name}
          </Btn>
        ))}
        <Btn onClick={() => setPlaying((p) => !p)}>{playing ? t('Pause') : t('Play')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Fastest ÷ slowest speed'), value: `${formatNumber(Math.round(ratio * 100) / 100)}×`, tone: 'accent' },
          { label: t('Closest ÷ farthest distance'), value: formatNumber(Math.round(((1 - e) / (1 + e)) * 100) / 100) },
        ]}
      />
    </div>
  );
}
