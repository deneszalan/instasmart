import { useRef, useState } from 'react';
import { Btn, C, Choice, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const LAYERS = 20, DEPTH = 10; // a lake 10 m deep in 20 layers
const LAYER = DEPTH / LAYERS;
const WINTER = 150; // days the lab runs for

/** Water's density (kg/m³) between 0 and 20 °C: highest, 999.97, at 4 °C (a close fit to the measured values). */
export const density = (temp: number) => 999.97 - 0.0068 * (temp - 4) ** 2;
export const ICE = 916.7; // kg/m³ at 0 °C

interface Lake {
  temps: number[]; // top first
  ice: number; // m of ice: floating on top, or (if ice sank) piled on the bottom
  day: number;
}
const fresh = (): Lake => ({ temps: Array(LAYERS).fill(10), ice: 0, day: 0 });

/**
 * One step of `dt` days: the air cools or warms the open surface; ice grows under its own insulation (Stefan's
 * law); denser water sinks below lighter water. With `sinks`, new ice goes to the bottom and the surface stays open.
 */
export function advance(lake: Lake, air: number, dt: number, sinks = false): Lake {
  const temps = [...lake.temps];
  let ice = lake.ice;
  const water = sinks ? Math.max(0, LAYERS - Math.round(ice / LAYER)) : LAYERS;
  if (water === 0) return { temps, ice, day: lake.day + dt };
  if (!sinks && ice > 0) {
    // under floating ice the water at the top stays at 0 °C; the ice thickens or melts
    temps[0] = 0;
    ice = Math.max(0, ice + (air < 0 ? (6.2e-4 * -air * dt) / (ice + 0.02) : -0.01 * air * dt));
  } else {
    temps[0] += 0.3 * (air - temps[0]) * dt;
    if (temps[0] < 0) {
      // the surface can't go below freezing: the extra cold freezes a skin of ice
      ice += (-temps[0] * LAYER) / 80;
      temps[0] = 0;
    }
  }
  // a little mixing between neighbours, then the overturn: denser water ends up underneath
  for (let i = 1; i < water; i++) {
    const d = 0.05 * (temps[i - 1] - temps[i]) * Math.min(1, dt);
    temps[i - 1] -= d;
    temps[i] += d;
  }
  const column = temps.slice(0, water).sort((a, b) => density(a) - density(b));
  return { temps: [...column, ...temps.slice(water)], ice, day: lake.day + dt };
}

const colour = (temp: number) => `hsl(${200 - Math.min(10, Math.max(0, temp)) * 6},70%,${32 + Math.min(10, Math.max(0, temp)) * 2}%)`;

export default function IceFloats({ onDone, active }: LabProps) {
  const lake = useRef(fresh());
  const [, setTick] = useState(0);
  const [air, setAir] = useState(-8);
  const [running, setRunning] = useState(false);
  const [fast, setFast] = useState(false);
  const [world, setWorld] = useState<'real' | 'sinks'>('real');
  const { temps, ice, day } = lake.current;
  const sinks = world === 'sinks', bottom = sinks ? temps[Math.max(0, LAYERS - 1 - Math.round(ice / LAYER))] : temps[LAYERS - 1];
  useGoal(!sinks && ice >= 0.1 && Math.abs(temps[LAYERS - 1] - 4) < 0.5, onDone);

  useFrame((dt) => {
    for (let k = 0; k < (fast ? 30 : 6); k++) lake.current = advance(lake.current, air, dt, sinks);
    if (lake.current.day >= WINTER) setRunning(false);
    setTick((n) => n + 1);
  }, active && running);
  const restart = (w = world) => {
    lake.current = fresh();
    setWorld(w);
    setTick((n) => n + 1);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const lw = w * 0.56, top = 18, bot = h - 6, lh = (bot - top) / LAYERS;
    ctx.fillStyle = air < 0 ? '#cbd5e1' : '#7dd3fc';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, 0, lw, top);
    ctx.globalAlpha = 1;
    label(ctx, t('air {t} °C', { t: formatNumber(air) }), 8, 9, { size: 10.5, align: 'left', color: C.ink });
    const frozen = sinks ? Math.min(LAYERS, Math.round(ice / LAYER)) : 0;
    temps.forEach((temp, i) => {
      ctx.fillStyle = sinks && i >= LAYERS - frozen ? '#e0f2fe' : colour(temp);
      ctx.fillRect(0, top + i * lh, lw, lh + 0.5);
    });
    if (!sinks && ice > 0) {
      const th = Math.max(3, (ice / DEPTH) * (bot - top));
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, top, lw, th);
      label(ctx, t('ice {m} m', { m: formatNumber(Math.round(ice * 100) / 100) }), lw / 2, top + th + 9, { size: 10, color: '#0f172a' });
    }
    if (sinks && frozen) label(ctx, t('ice on the bottom'), lw / 2, bot - 9, { size: 10, color: '#0f172a' });
    // the temperature with depth
    const gx = lw + 26, gw = w - gx - 10, X = (temp: number) => gx + (temp / 12) * gw;
    line(ctx, gx, top, gx, bot, C.faint, 1);
    line(ctx, X(4), top, X(4), bot, C.accent, 1, [3, 3]);
    label(ctx, '4 °C', X(4), top - 7, { size: 9.5, color: C.accent });
    label(ctx, '0', gx, top - 7, { size: 9.5, color: C.faint });
    label(ctx, '12', gx + gw, top - 7, { size: 9.5, color: C.faint });
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    temps.forEach((temp, i) => ctx[i ? 'lineTo' : 'moveTo'](X(temp), top + (i + 0.5) * lh));
    ctx.stroke();
  };

  return (
    <div className="lab">
      <Choice
        label={t('Which world')}
        value={world}
        onChange={(v) => restart(v)}
        options={[
          { value: 'real', label: t('Real water') },
          { value: 'sinks', label: t('If ice sank') },
        ]}
      />
      <Stage draw={draw} label={t('A lake 10 m deep in winter, with its temperature at each depth')} />
      <Range label={t('Air')} value={air} min={-15} max={10} onChange={setAir} format={(v) => `${v} °C`} />
      <div className="lab__row">
        <Btn onClick={() => setRunning((r) => !r)} disabled={day >= WINTER}>{running ? t('Pause') : day >= WINTER ? t('Winter is over') : day ? t('Go on') : t('Start the winter')}</Btn>
        <Btn ghost onClick={() => setFast((f) => !f)}>
          {fast ? t('Normal speed') : t('Faster')}
        </Btn>
        <Btn ghost onClick={() => restart()}>
          {t('Start again')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Day'), value: formatNumber(Math.floor(day)) },
          { label: t('Ice'), value: `${formatNumber(Math.round(ice * 100) / 100)} m`, tone: 'accent' },
          { label: t('Bottom water'), value: bottom === undefined || (sinks && Math.round(ice / LAYER) >= LAYERS) ? t('frozen') : `${formatNumber(Math.round(bottom * 10) / 10)} °C`, tone: !sinks && Math.abs(temps[LAYERS - 1] - 4) < 0.5 ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
