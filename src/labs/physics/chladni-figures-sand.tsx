import { useEffect, useRef, useState } from 'react';
import { Btn, C, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Vibration patterns of a square plate, lowest note first: modes (m, n) in the usual simple approximation. */
const MODES: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [4, 5], [3, 6], [5, 6], [4, 7]];

/** How far a point of the plate (x, y in 0…1) moves in mode (m, n); the sand gathers where this is zero. */
export const amplitude = (x: number, y: number, m: number, n: number) =>
  Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y) - Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y);

const GRAINS = 2600;

export default function Chladni({ onDone, active }: LabProps) {
  const [mode, setMode] = useState(2);
  const [bowing, setBowing] = useState(false);
  const [notes, setNotes] = useState(new Set<number>());
  const grains = useRef<Float32Array>(new Float32Array(GRAINS * 2));
  const [, setTick] = useState(0);
  const audio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);
  useGoal(notes.size >= 3, onDone);

  const sprinkle = () => {
    const g = grains.current;
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    setTick((n) => n + 1);
  };
  useEffect(sprinkle, []);

  // Each frame, grains on moving parts of the plate are thrown about; on the still lines they stay put.
  useFrame((dt) => {
    const [m, n] = MODES[mode], g = grains.current;
    for (let i = 0; i < GRAINS; i++) {
      const x = g[2 * i], y = g[2 * i + 1], a = Math.abs(amplitude(x, y, m, n));
      const kick = a * 0.06 * Math.min(1, dt * 60);
      g[2 * i] = Math.min(1, Math.max(0, x + (Math.random() - 0.5) * kick));
      g[2 * i + 1] = Math.min(1, Math.max(0, y + (Math.random() - 0.5) * kick));
    }
    setTick((k) => k + 1);
  }, active && bowing);

  const pitch = () => 160 * ((MODES[mode][0] ** 2 + MODES[mode][1] ** 2) / 5);
  const bow = () => {
    if (bowing) {
      setBowing(false);
      audio.current?.gain.gain.setTargetAtTime(0, audio.current.ctx.currentTime, 0.05);
      return;
    }
    setBowing(true);
    setNotes((s) => new Set(s).add(mode));
    try {
      if (!audio.current) {
        const ctx = new AudioContext(), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = 'triangle';
        gain.gain.value = 0;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        audio.current = { ctx, osc, gain };
      }
      const a = audio.current;
      a.osc.frequency.setValueAtTime(pitch(), a.ctx.currentTime);
      a.gain.gain.setTargetAtTime(0.06, a.ctx.currentTime, 0.05);
    } catch {
      // No sound on this device; the sand still moves.
    }
  };
  useEffect(() => {
    if (!active && audio.current) audio.current.gain.gain.value = 0;
    if (!active) setBowing(false);
  }, [active]);
  useEffect(() => () => void audio.current?.ctx.close(), []);
  useEffect(() => {
    if (bowing && audio.current) audio.current.osc.frequency.setTargetAtTime(pitch(), audio.current.ctx.currentTime, 0.03);
    if (bowing) setNotes((s) => new Set(s).add(mode));
  }, [mode]);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const size = Math.min(w, h) - 16, x0 = (w - size) / 2, y0 = (h - size) / 2;
    ctx.fillStyle = '#7c5a26';
    ctx.fillRect(x0, y0, size, size);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x0, y0, size, 3);
    ctx.fillStyle = '#f5e6c8';
    const g = grains.current;
    for (let i = 0; i < GRAINS; i++) ctx.fillRect(x0 + g[2 * i] * size - 0.8, y0 + g[2 * i + 1] * size - 0.8, 1.6, 1.6);
    if (bowing) {
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0 + size + 4, y0 + size * 0.2);
      ctx.lineTo(x0 + size + 4, y0 + size * 0.55);
      ctx.stroke();
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A square brass plate sprinkled with sand')} />
      <Range label={t('Note')} value={mode} min={0} max={MODES.length - 1} onChange={setMode} format={(v) => t('{n} of {total}', { n: v + 1, total: MODES.length })} />
      <div className="lab__row">
        <Btn onClick={bow}>{bowing ? t('Stop bowing') : t('Bow the plate')}</Btn>
        <Btn ghost onClick={sprinkle}>
          {t('Fresh sand')}
        </Btn>
        <span className="lab__note">{t('Higher notes draw busier figures.')}</span>
      </div>
    </div>
  );
}
