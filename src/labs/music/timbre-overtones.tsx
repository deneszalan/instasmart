import { useRef, useState } from 'react';
import { Btn, C, Choice, label, line, Readouts, Stage, useAudio, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const BASE = 440;
const N = 8;

/** The note's shape over one cycle (x from 0 to 1): its harmonics added together, each a sine at a whole multiple. */
export const waveAt = (x: number, amps: number[]) => amps.reduce((y, a, i) => y + a * Math.sin(2 * Math.PI * (i + 1) * x), 0);

const PRESETS: { name: string; amps: number[] }[] = [
  { name: 'pure', amps: [1, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'odd', amps: [1, 0, 1 / 3, 0, 1 / 5, 0, 1 / 7, 0] },
  { name: 'all', amps: [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8] },
  { name: 'second', amps: [0.5, 1, 0.35, 0.2, 0.1, 0.05, 0, 0] },
];

type Shape = 'steady' | 'struck' | 'swell';

export default function Timbre({ onDone, active }: LabProps) {
  const [amps, setAmps] = useState(PRESETS[0].amps);
  const [shape, setShape] = useState<Shape>('steady');
  const [played, setPlayed] = useState(new Set<string>());
  const audio = useAudio(active);
  const geom = useRef({ L: 0, R: 1, top: 0, bot: 1 });
  useGoal(played.size >= 3, onDone);

  const play = () => {
    setPlayed((s) => new Set(s).add(amps.map((a) => Math.round(a * 10)).join()));
    const ac = audio();
    if (!ac || amps.every((a) => a < 0.01)) return;
    const real = new Float32Array(N + 1), imag = new Float32Array(N + 1);
    amps.forEach((a, i) => (imag[i + 1] = a));
    const osc = ac.createOscillator(), env = ac.createGain(), at = ac.currentTime + 0.02;
    osc.setPeriodicWave(ac.createPeriodicWave(real, imag));
    osc.frequency.value = BASE;
    const g = env.gain;
    g.setValueAtTime(0, at);
    if (shape === 'struck') {
      g.linearRampToValueAtTime(0.16, at + 0.005);
      g.exponentialRampToValueAtTime(0.0001, at + 1.6);
    } else if (shape === 'swell') {
      g.linearRampToValueAtTime(0.12, at + 0.9);
      g.linearRampToValueAtTime(0, at + 1.6);
    } else {
      g.linearRampToValueAtTime(0.1, at + 0.03);
      g.setValueAtTime(0.1, at + 1.4);
      g.linearRampToValueAtTime(0, at + 1.6);
    }
    osc.connect(env).connect(ac.destination);
    osc.start(at);
    osc.stop(at + 1.7);
  };

  const onPointer = (p: StagePointer) => {
    const { L, R, top, bot } = geom.current;
    if (p.y < top - 20) return;
    const i = Math.floor(((p.x - L) / (R - L)) * N);
    if (i < 0 || i >= N) return;
    const v = Math.round(Math.min(1, Math.max(0, (bot - p.y) / (bot - top))) * 20) / 20;
    setAmps((a) => a.map((x, k) => (k === i ? v : x)));
  };

  const loudest = amps.indexOf(Math.max(...amps));
  // The wave repeats at the spacing of its harmonics, even without the fundamental: 2× and 3× still repeat 440 times a second.
  const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
  const repeats = BASE * amps.reduce((g, a, i) => (a > 0 ? gcd(g, i + 1) : g), 0);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the wave: two cycles of the sum
    const L = 12, R = w - 12, wTop = 20, wBot = h * 0.46, wy = (wTop + wBot) / 2, wa = (wBot - wTop) / 2;
    let peak = 0;
    for (let i = 0; i <= 200; i++) peak = Math.max(peak, Math.abs(waveAt(i / 200, amps)));
    line(ctx, L, wy, R, wy, C.line, 1);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 320; i++) {
      const x = (i / 320) * 2;
      ctx[i ? 'lineTo' : 'moveTo'](L + (i / 320) * (R - L), wy - (peak ? waveAt(x, amps) / peak : 0) * wa);
    }
    ctx.stroke();
    line(ctx, (L + R) / 2, wy - wa - 4, (L + R) / 2, wy + wa + 4, C.faint, 1, [3, 3]);
    label(ctx, t('two cycles: each lasts 1/{f} s', { f: BASE }), L, 9, { size: 10, align: 'left' });
    // the harmonics, as bars to drag
    const top = h * 0.58, bot = h - 28, bw = (R - L) / N;
    geom.current = { L, R, top, bot };
    amps.forEach((a, i) => {
      const x = L + i * bw;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x + 3, top, bw - 6, bot - top);
      ctx.fillStyle = i === loudest && a > 0 ? C.accent : C.cool;
      ctx.fillRect(x + 3, bot - a * (bot - top), bw - 6, a * (bot - top));
      label(ctx, `${i + 1}×`, x + bw / 2, bot + 9, { size: 10.5, color: C.ink });
      label(ctx, formatNumber(BASE * (i + 1)), x + bw / 2, bot + 21, { size: 8.5, color: C.faint });
    });
    label(ctx, t('drag the bars: how strong each harmonic is'), L, top - 10, { size: 10, align: 'left' });
  };

  const names: Record<string, string> = { pure: t('Pure'), odd: t('Odd only'), all: t('All, fading'), second: t('Strong 2nd') };
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('The shape of one note and the strengths of its first {n} harmonics', { n: N })} />
      <Choice
        label={t('Recipes')}
        value={PRESETS.find((p) => p.amps.every((a, i) => Math.abs(a - amps[i]) < 1e-9))?.name ?? ''}
        onChange={(name) => setAmps(PRESETS.find((p) => p.name === name)!.amps)}
        options={PRESETS.map((p) => ({ value: p.name, label: names[p.name] }))}
      />
      <div className="lab__row">
        <Btn onClick={play}>{t('Play')}</Btn>
        <Choice
          label={t('How it starts and ends')}
          value={shape}
          onChange={setShape}
          options={[
            { value: 'steady', label: t('Steady') },
            { value: 'struck', label: t('Struck') },
            { value: 'swell', label: t('Swelling') },
          ]}
        />
      </div>
      <Readouts
        items={[
          { label: t('Repeats'), value: repeats ? `${formatNumber(repeats)}/s` : '–' },
          { label: t('Strongest'), value: amps[loudest] > 0 ? `${loudest + 1}×` : '–', tone: 'accent' },
          { label: t('Mixes heard'), value: String(played.size), tone: played.size >= 3 ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
