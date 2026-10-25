import { useRef, useState } from 'react';
import { Btn, C, label, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export const COP = 2; // in this lab, the fridge moves 2 units of heat for every unit of electricity
const KITCHEN = 300, BOX = 3; // how much heat it takes to warm each by 1 °C (the kitchen is far bigger)

interface State {
  kitchen: number;
  box: number;
  on: boolean;
  moved: number; // heat taken out of the box so far
  used: number; // electricity used so far
}

/**
 * One step of `dt` (a simple model): heat leaks from the kitchen into the box, a lot with the door open; the
 * thermostat runs the compressor between 3 and 5 °C; when it runs, it takes heat from the box and gives that
 * heat plus the electricity it used to the kitchen. Nothing leaves the closed kitchen.
 */
export function tick(s: State, open: boolean, dt: number): State {
  const leak = (open ? 1.5 : 0.08) * (s.kitchen - s.box) * dt;
  const on = s.box > 5 ? true : s.box < 3 ? false : s.on;
  const work = on ? 1 * dt : 0, cool = COP * work;
  return {
    kitchen: s.kitchen + (cool + work - leak) / KITCHEN,
    box: s.box + (leak - cool) / BOX,
    on,
    moved: s.moved + cool,
    used: s.used + work,
  };
}

export default function Fridge({ onDone, active }: LabProps) {
  const sim = useRef<State>({ kitchen: 20, box: 20, on: true, moved: 0, used: 0 });
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<{ kitchen: number; time: number } | null>(null);
  const [time, setTime] = useState(0);
  const s = sim.current;
  const since = openedAt ? s.kitchen - openedAt.kitchen : 0;
  useGoal(open && openedAt !== null && time - openedAt.time >= 3 && since > 0.05, onDone);
  useFrame((dt) => {
    for (let k = 0; k < 16; k++) sim.current = tick(sim.current, open, dt);
    setTime((x) => x + dt);
  }, active);
  const toggle = () => {
    setOpen((o) => !o);
    if (!open) setOpenedAt({ kitchen: sim.current.kitchen, time });
  };

  const colour = (temp: number) => `hsl(${Math.max(0, Math.min(220, 200 - (temp - 0) * 6))},80%,62%)`;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the kitchen around the fridge
    ctx.fillStyle = `hsla(${Math.max(0, 200 - (s.kitchen - 15) * 18)},60%,40%,0.25)`;
    ctx.fillRect(0, 0, w, h);
    const fx = w * 0.18, fw = Math.min(w * 0.42, 150), fy = 12, fh = h - 24;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = colour(s.box);
    ctx.globalAlpha = 0.45;
    ctx.fillRect(fx + 6, fy + 6, fw - 12, fh * 0.7);
    ctx.globalAlpha = 1;
    label(ctx, `${formatNumber(Math.round(s.box * 10) / 10)} °C`, fx + fw / 2, fy + fh * 0.3, { size: 16, color: '#0f172a' });
    label(ctx, '🥛🧀🥚', fx + fw / 2, fy + fh * 0.5, { size: 14 });
    // the door, swung open or shut
    if (open) {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - fw * 0.5, fy + 10);
      ctx.lineTo(fx - fw * 0.5, fy + fh - 10);
      ctx.lineTo(fx, fy + fh);
      ctx.fill();
    }
    // the refrigerant loop: cold coils inside, compressor below, hot coils at the back
    const cyc = (time * 0.35) % 1, loop: [number, number][] = [
      [fx + fw * 0.2, fy + 10],
      [fx + fw * 0.8, fy + 10],
      [fx + fw * 0.8, fy + fh * 0.82],
      [fx + fw + 16, fy + fh * 0.82],
      [fx + fw + 16, fy + 10],
      [fx + fw * 0.2, fy + 10],
    ];
    for (let k = 0; k < 18; k++) {
      const f = (k / 18 + cyc) % 1, seg = f * (loop.length - 1), i = Math.floor(seg), u = seg - i;
      const [x0, y0] = loop[i], [x1, y1] = loop[i + 1];
      const hot = i >= 2 && i < 4;
      ctx.fillStyle = s.on ? (hot ? '#fb923c' : '#7dd3fc') : 'rgba(148,163,184,0.6)';
      ctx.beginPath();
      ctx.arc(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = s.on ? '#475569' : '#64748b';
    ctx.fillRect(fx + fw * 0.6, fy + fh * 0.76, 26, 18);
    label(ctx, s.on ? t('compressor on') : t('compressor off'), fx + fw / 2, fy + fh - 10, { size: 10, color: '#0f172a' });
    // heat flowing out at the back
    if (s.on) for (let k = 0; k < 3; k++) label(ctx, '〰', fx + fw + 34 + ((time * 30 + k * 18) % 50), fy + 30 + k * 26, { size: 13, color: '#fb923c' });
    label(ctx, t('kitchen {t} °C', { t: formatNumber(Math.round(s.kitchen * 100) / 100) }), w - 8, h - 24, { size: 11.5, align: 'right', color: C.ink });
    if (open && openedAt) label(ctx, t('{d} °C since the door opened', { d: `${since >= 0 ? '+' : '−'}${formatNumber(Math.abs(Math.round(since * 100) / 100))}` }), w - 8, h - 9, { size: 10.5, align: 'right', color: since > 0 ? C.bad : C.cool });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A fridge in a closed kitchen; inside {b} °C, kitchen {k} °C', { b: Math.round(s.box), k: Math.round(s.kitchen * 10) / 10 })} />
      <div className="lab__row">
        <Btn onClick={toggle}>{open ? t('Close the door') : t('Leave the door open')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Heat taken from inside'), value: formatNumber(Math.round(s.moved)), tone: 'accent' },
          { label: t('Electricity used'), value: formatNumber(Math.round(s.used)) },
          { label: t('Heat given to the kitchen'), value: formatNumber(Math.round(s.moved + s.used)), tone: 'bad' },
        ]}
      />
      <p className="lab__note">{t('In this lab the fridge moves 2 units of heat for each unit of electricity.')}</p>
    </div>
  );
}
