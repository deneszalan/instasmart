import { useEffect, useRef, useState } from 'react';
import { Btn, C, Choice, dot, label, Range, Readouts, Stage, useAudio, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Greenwood's map of the human cochlea: the frequency that peaks at a point `x` of the way from the apex (0) to
 * the base (1), f = 165.4 (10^(2.1 x) − 0.88) Hz, from about 20 Hz at the tip to 20 kHz at the base.
 */
export const greenwood = (x: number) => 165.4 * (Math.pow(10, 2.1 * x) - 0.88);

/** Where along the membrane a frequency peaks, as a share of the way from the base (0) to the tip (1). */
export const place = (f: number) => 1 - Math.log10(f / 165.4 + 0.88) / 2.1;

const DAMAGED = 0.2; // in the "damaged" ear, the first fifth of the membrane from the base has lost its hair cells
const LOST = greenwood(1 - DAMAGED);

/** The frequency slider: 0…100 on a log scale from 20 Hz to 20 kHz. */
const freqAt = (v: number) => 20 * Math.pow(1000, v / 100);
const sliderAt = (f: number) => (100 * Math.log10(f / 20)) / 3;

export default function Cochlea({ onDone, active }: LabProps) {
  const [v, setV] = useState(Math.round(sliderAt(1000)));
  const [ear, setEar] = useState<'healthy' | 'damaged'>('healthy');
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useAudio(active);
  const tone = useRef<{ ac: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  const f = freqAt(v), u = place(f), deaf = ear === 'damaged' && u < DAMAGED;
  useGoal(ear === 'damaged' && f > LOST, onDone);
  useFrame((dt) => setTime((s) => s + dt), active);

  useEffect(() => {
    const tn = tone.current;
    if (tn) tn.osc.frequency.setTargetAtTime(f, tn.ac.currentTime, 0.02);
  }, [f]);
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);
  useEffect(() => {
    const tn = tone.current;
    // the ear is most sensitive to tones of a few kHz, so higher tones play more quietly
    if (tn) tn.gain.gain.setTargetAtTime(playing ? (f > 2000 ? 0.025 : 0.06) : 0, tn.ac.currentTime, 0.03);
  }, [playing, f]);
  const play = () => {
    if (!tone.current) {
      const ac = audio();
      if (ac) {
        const osc = ac.createOscillator(), gain = ac.createGain();
        gain.gain.value = 0;
        osc.frequency.value = f;
        osc.connect(gain).connect(ac.destination);
        osc.start();
        tone.current = { ac, osc, gain };
      }
    } else audio();
    setPlaying((p) => !p);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the coiled cochlea, 2¾ turns, base on the outside
    const sh = h * 0.46, scx = Math.min(w * 0.22, sh * 0.62), scy = sh / 2 + 4, sr = Math.min(sh / 2 - 6, w * 0.2);
    const spiral = (s: number): [number, number] => {
      const a = -Math.PI / 2 + s * 2.75 * 2 * Math.PI, r = sr * (1 - 0.82 * s);
      return [scx + Math.cos(a) * r, scy + Math.sin(a) * r];
    };
    for (let i = 0; i < 120; i++) {
      const s0 = i / 120, s1 = (i + 1) / 120, [x0, y0] = spiral(s0), [x1, y1] = spiral(s1);
      const lost = ear === 'damaged' && s0 < DAMAGED;
      ctx.strokeStyle = lost ? 'rgba(255,255,255,0.22)' : '#f9a8d4';
      ctx.lineWidth = 7 * (1 - 0.55 * s0);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    const [px, py] = spiral(u);
    if (!deaf) {
      ctx.shadowColor = C.accent;
      ctx.shadowBlur = 14;
      dot(ctx, px, py, 6, C.accent);
      ctx.shadowBlur = 0;
    }
    const [bx, by] = spiral(0);
    label(ctx, t('base'), bx + 8, by, { size: 10, align: 'left' });
    label(ctx, t('tip'), scx, scy + 14, { size: 10 });
    // the same membrane unrolled: narrow and stiff at the base, wide and floppy at the tip
    const L = 14, R = w - 14, my = h * 0.72, X = (s: number) => L + s * (R - L);
    const half = (s: number) => 2 + 9 * s;
    ctx.fillStyle = 'rgba(249,168,212,0.22)';
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) ctx[i ? 'lineTo' : 'moveTo'](X(i / 50), my - half(i / 50));
    for (let i = 50; i >= 0; i--) ctx.lineTo(X(i / 50), my + half(i / 50));
    ctx.fill();
    if (ear === 'damaged') {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(X(0), my - 30, X(DAMAGED) - X(0), 44);
      label(ctx, t('hair cells lost'), X(DAMAGED / 2), my - 24, { size: 9.5, color: C.bad });
    }
    // the travelling wave: it grows as it rolls in from the base, peaks at its own place, then dies away fast
    ctx.strokeStyle = deaf ? C.faint : C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const s = i / 300, env = Math.exp(-Math.pow((s - u) / (s < u ? 0.22 : 0.035), 2));
      const y = env * 22 * Math.sin(time * 9 - 40 * Math.pow(s / Math.max(u, 0.05), 1.4));
      ctx[i ? 'lineTo' : 'moveTo'](X(s), my - y);
    }
    ctx.stroke();
    label(ctx, t('base · high notes'), L, h - 8, { size: 10, align: 'left' });
    label(ctx, t('tip · low notes'), R, h - 8, { size: 10, align: 'right' });
    // a few marked frequencies along the top of the strip
    for (const mark of [100, 1000, 10000]) label(ctx, mark >= 1000 ? `${mark / 1000} kHz` : `${mark} Hz`, X(place(mark)), my + 22, { size: 9.5, color: C.faint });
    if (deaf) label(ctx, t('No hair cells left here to pick it up'), w * 0.66, sh * 0.5, { size: 11.5, color: C.bad });
  };

  const fmt = (x: number) => (x >= 1000 ? `${formatNumber(Math.round(x / 100) / 10)} kHz` : `${formatNumber(Math.round(x))} Hz`);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The cochlea, coiled and unrolled, with a {f} tone peaking {p}% of the way from the base', { f: fmt(f), p: Math.round(u * 100) })} />
      <Range label={t('Pitch')} value={v} min={0} max={100} onChange={setV} format={() => fmt(f)} />
      <div className="lab__row">
        <Btn onClick={play}>{playing ? t('Stop') : t('Play the tone')}</Btn>
        <Choice
          label={t('Ear')}
          value={ear}
          onChange={setEar}
          options={[
            { value: 'healthy', label: t('Healthy') },
            { value: 'damaged', label: t('Base damaged') },
          ]}
        />
      </div>
      <Readouts
        items={[
          { label: t('Peaks at'), value: t('{p}% along', { p: Math.round(u * 100) }), tone: deaf ? 'bad' : 'accent' },
          { label: ear === 'damaged' ? t('Lost: everything above') : t('Range'), value: ear === 'damaged' ? fmt(LOST) : '20 Hz – 20 kHz', tone: ear === 'damaged' ? 'bad' : undefined },
        ]}
      />
    </div>
  );
}
