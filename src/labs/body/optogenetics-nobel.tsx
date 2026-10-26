import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * A simplified nerve cell (integrate-and-fire) with channelrhodopsin: light opens a conductance within about a
 * millisecond, and it closes over about ten once the light stops. Times in ms, voltages in mV.
 */
export const MODEL = { rest: -70, threshold: -50, reset: -70, tauM: 10, tauOn: 1, tauOff: 10, gMax: 1, reversal: 0, refractory: 4, dt: 0.05 };

export interface Run {
  /** The voltage every 0.5 ms: [ms, mV]. */
  trace: [number, number][];
  /** When the cell fired, in ms. */
  spikes: number[];
  flashes: number;
  period: number;
}

/** One second of the cell's life, lit by flashes of `flashMs` milliseconds, `perSecond` times a second. */
export function simulate(gene: boolean, flashMs: number, perSecond: number, totalMs = 1000): Run {
  const m = MODEL, period = 1000 / perSecond, trace: [number, number][] = [], spikes: number[] = [];
  let v = m.rest, g = 0, refr = 0;
  for (let i = 0; i * m.dt < totalMs; i++) {
    const time = i * m.dt, lit = time % period < flashMs;
    const on = gene && lit;
    g += on ? ((m.gMax - g) / m.tauOn) * m.dt : (-g / m.tauOff) * m.dt;
    if (refr > 0) {
      refr -= m.dt;
      v = m.reset;
    } else {
      v += ((-(v - m.rest) + g * (m.reversal - v)) / m.tauM) * m.dt;
      if (v >= m.threshold) {
        spikes.push(time);
        v = m.reset;
        refr = m.refractory;
      }
    }
    if (i % 10 === 0) trace.push([time, v]);
  }
  return { trace, spikes, flashes: Math.ceil(totalMs / period), period };
}

const BLUE = '#4fa8ff', GOLD = '#ffd166';

export default function Optogenetics({ onDone }: LabProps) {
  const [gene, setGene] = useState(true);
  const [flash, setFlash] = useState(1);
  const [rate, setRate] = useState(5);
  const run = simulate(gene, flash, rate);
  const oneEach = gene && run.spikes.length === run.flashes;
  useGoal(oneEach && rate >= 10, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 8, R = w - 8, top = 10, bot = h - 34;
    const X = (ms: number) => L + (ms / 1000) * (R - L), V = (mv: number) => bot - ((mv + 80) / 120) * (bot - top);
    line(ctx, L, V(MODEL.threshold), R, V(MODEL.threshold), C.line, 1, [4, 4]);
    label(ctx, t('threshold'), R, V(MODEL.threshold) - 8, { size: 9.5, align: 'right', color: C.faint });
    for (let i = 0; i < run.flashes; i++) {
      ctx.fillStyle = BLUE;
      ctx.fillRect(X(i * run.period), bot + 10, Math.max(1.5, X(flash) - L), 10);
    }
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    run.trace.forEach(([ms, mv], i) => ctx[i ? 'lineTo' : 'moveTo'](X(ms), V(mv)));
    ctx.stroke();
    for (const s of run.spikes) line(ctx, X(s), V(MODEL.threshold), X(s), V(30), GOLD, 1.6);
    label(ctx, t('light'), L, bot + 28, { size: 9.5, align: 'left', color: BLUE });
    label(ctx, t('1 second'), R, bot + 28, { size: 9.5, align: 'right', color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Channelrhodopsin gene')}
        value={gene ? 'yes' : 'no'}
        onChange={(v) => setGene(v === 'yes')}
        options={[
          { value: 'yes', label: t('With the gene') },
          { value: 'no', label: t('Without it') },
        ]}
      />
      <Stage draw={draw} label={t('One second of the nerve cell’s voltage: {f} flashes of light, {s} signals', { f: run.flashes, s: run.spikes.length })} />
      <Range label={t('Flash length')} value={flash} min={0.5} max={20} step={0.5} onChange={setFlash} format={(v) => `${formatNumber(v)} ms`} />
      <Range label={t('Flashes per second')} value={rate} min={1} max={40} step={1} onChange={setRate} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Flashes'), value: formatNumber(run.flashes) },
          { label: t('Signals fired'), value: formatNumber(run.spikes.length), tone: oneEach ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('A simplified model of one nerve cell.')}</p>
    </div>
  );
}
