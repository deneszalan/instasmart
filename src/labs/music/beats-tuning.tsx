import { useEffect, useRef, useState } from 'react';
import { Btn, C, label, line, Range, Readouts, Stage, useAudio, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const REF = 220; // the string already in tune: A, 220 Hz

/** Beats per second when two notes sound together: the difference of their frequencies. */
export const beats = (f1: number, f2: number) => Math.abs(f1 - f2);

/** How loud the two together are at time `s` (seconds), from 2 when they are in step to 0 when opposite. */
export const loudness = (s: number, f1: number, f2: number) => Math.abs(2 * Math.cos(Math.PI * (f1 - f2) * s));

export default function BeatsTuning({ onDone, active }: LabProps) {
  const [f, setF] = useState(224);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useAudio(active);
  const voices = useRef<{ ac: AudioContext; osc: OscillatorNode[]; gain: GainNode } | null>(null);
  const rate = beats(REF, f);
  useGoal(rate <= 0.2, onDone);
  useFrame((dt) => setTime((s) => s + dt), active);

  const tune = (v: number) => setF(Math.round(Math.min(230, Math.max(210, v)) * 10) / 10);

  useEffect(() => {
    const v = voices.current;
    if (v) v.osc[1].frequency.setTargetAtTime(f, v.ac.currentTime, 0.02);
  }, [f]);
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(() => {
    const v = voices.current;
    if (v) v.gain.gain.setTargetAtTime(playing ? 0.08 : 0, v.ac.currentTime, 0.03);
  }, [playing]);

  const play = () => {
    if (!voices.current) {
      const ac = audio();
      if (ac) {
        const gain = ac.createGain();
        gain.gain.value = 0;
        gain.connect(ac.destination);
        const osc = [REF, f].map((freq) => {
          const o = ac.createOscillator();
          o.frequency.value = freq;
          o.connect(gain);
          o.start();
          return o;
        });
        voices.current = { ac, osc, gain };
      }
    } else audio();
    setPlaying((p) => !p);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 12, R = w - 12, phase = 2 * Math.PI * (f - REF) * time;
    // Close up: a few vibrations of each string, drifting in and out of step.
    const mid1 = h * 0.2, mid2 = h * 0.48, amp = h * 0.09;
    const wave = (y0: number, a: number, fn: (x: number) => number, color: string, width: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const x = i / 160;
        ctx[i ? 'lineTo' : 'moveTo'](L + x * (R - L), y0 - a * fn(x));
      }
      ctx.stroke();
    };
    const cycles = 4;
    wave(mid1, amp, (x) => Math.sin(2 * Math.PI * cycles * x), C.cool, 2);
    wave(mid1, amp, (x) => Math.sin(2 * Math.PI * cycles * x + phase), C.accent, 2);
    wave(mid2, amp * 0.8, (x) => Math.sin(2 * Math.PI * cycles * x) + Math.sin(2 * Math.PI * cycles * x + phase), C.ink, 2.5);
    label(ctx, t('each string, close up'), L, 10, { size: 10.5, align: 'left' });
    label(ctx, t('together'), L, mid2 - amp * 1.75, { size: 10.5, align: 'left' });
    // The last three seconds of loudness, now at the right.
    const top = h * 0.7, bot = h - 16, cy = (top + bot) / 2, half = (bot - top) / 2, span = 3;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const s = time - span + (i / 200) * span, y = (loudness(s, REF, f) / 2) * half;
      ctx[i ? 'lineTo' : 'moveTo'](L + (i / 200) * (R - L), cy - y);
    }
    for (let i = 200; i >= 0; i--) {
      const s = time - span + (i / 200) * span, y = (loudness(s, REF, f) / 2) * half;
      ctx.lineTo(L + (i / 200) * (R - L), cy + y);
    }
    ctx.fill();
    line(ctx, R, top - 2, R, bot + 2, C.accent, 2);
    label(ctx, t('loudness, last 3 seconds'), L, h - 6, { size: 10.5, align: 'left' });
    label(ctx, t('now'), R, h - 6, { size: 10.5, align: 'right', color: C.accent });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Two strings, {a} Hz and {b} Hz, played together', { a: REF, b: formatNumber(f) })} />
      <Range label={t('String 2')} value={f} min={210} max={230} step={0.1} onChange={tune} format={(v) => `${formatNumber(v)} Hz`} />
      <div className="lab__row">
        <Btn onClick={play}>{playing ? t('Stop') : t('Play both')}</Btn>
        <Btn ghost label={t('Lower by 0.1 Hz')} onClick={() => tune(f - 0.1)}>
          −0.1
        </Btn>
        <Btn ghost label={t('Raise by 0.1 Hz')} onClick={() => tune(f + 0.1)}>
          +0.1
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('String 1'), value: `${REF} Hz` },
          { label: t('Beats'), value: t('{n} a second', { n: formatNumber(Math.round(rate * 10) / 10) }), tone: rate <= 0.2 ? 'good' : 'accent' },
        ]}
      />
    </div>
  );
}
