import { useRef, useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** A heartbeat: when its pacemaker fired, and whether it came from the sinoatrial node (so the atria fire first). */
interface Beat {
  at: number;
  sinus: boolean;
}

const PR = 0.16; // seconds from the start of the P wave to the ventricles' QRS: mostly the pause at the AV node
export const ESCAPE = 45; // beats a minute from the backup pacemaker near the AV node

/** The QT interval for a beat-to-beat time `rr` (both in seconds), by Bazett's formula with a normal 0.4 s. */
export const qt = (rr: number) => 0.4 * Math.sqrt(rr);

const bump = (s: number, c: number, w: number, a: number) => a * Math.exp(-Math.pow((s - c) / w, 2));

/** The ECG at time `s`: P wave for the atria, QRS for the ventricles, T as the ventricles reset. */
export function ecg(s: number, beats: Beat[], rr: number) {
  let v = 0;
  for (const b of beats) {
    const q = b.sinus ? b.at + PR : b.at + 0.02;
    if (s < b.at - 0.1 || s > q + 0.8) continue;
    if (b.sinus) v += bump(s, b.at + 0.05, 0.025, 0.15);
    v += bump(s, q - 0.015, 0.008, -0.1) + bump(s, q, 0.011, 1) + bump(s, q + 0.017, 0.01, -0.25);
    v += bump(s, q + qt(rr) * 0.72, 0.045, 0.28);
  }
  return v;
}

export default function HeartPacemaker({ onDone, active }: LabProps) {
  const [rate, setRate] = useState(70);
  const [node, setNode] = useState<'working' | 'stopped'>('working');
  const [time, setTime] = useState(0);
  const sim = useRef<{ beats: Beat[]; next: number }>({ beats: [], next: 0.3 });
  const [escapes, setEscapes] = useState(0);
  useGoal(escapes >= 2, onDone);

  const bpm = node === 'working' ? rate : ESCAPE, rr = 60 / bpm;
  useFrame((dt) => {
    const now = time + dt, s = sim.current;
    if (now >= s.next) {
      s.beats = [...s.beats.filter((b) => b.at > now - 6), { at: s.next, sinus: node === 'working' }];
      if (node === 'stopped') setEscapes((n) => n + 1);
      s.next += rr;
    }
    // a slower or faster rate takes effect from the next beat
    const last = s.beats[s.beats.length - 1];
    if (last) s.next = Math.max(now, last.at + rr);
    setTime(now);
  }, active);

  const beats = sim.current.beats, last = beats[beats.length - 1];
  const since = last ? time - last.at : 9;
  const sinceQ = last ? since - (last.sinus ? PR : 0.02) : 9;
  // which part of the beat is happening now
  const atria = !!last?.sinus && since >= 0 && since < 0.11;
  const pause = !!last?.sinus && since >= 0.09 && since < PR;
  const down = sinceQ >= -0.03 && sinceQ < 0.06;
  const squeeze = sinceQ > 0 && sinceQ < 0.3 ? Math.sin((Math.PI * sinceQ) / 0.3) : 0;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const stripH = Math.min(84, h * 0.4), S = Math.min(w * 0.42, h - stripH - 12), cx = w * 0.27, cy = (h - stripH) / 2 + 4;
    const glow = (on: boolean, base: string) => (on ? '#fb7185' : base);
    // atria
    ctx.fillStyle = glow(atria, '#7f1d1d');
    ctx.beginPath();
    ctx.ellipse(cx - S * 0.2, cy - S * 0.26, S * 0.18, S * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + S * 0.2, cy - S * 0.28, S * 0.18, S * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    // ventricles, squeezing after the QRS
    const k = 1 - 0.07 * squeeze;
    ctx.save();
    ctx.translate(cx, cy - S * 0.08);
    ctx.scale(k, k);
    ctx.fillStyle = glow(down || squeeze > 0.6, '#991b1b');
    ctx.beginPath();
    ctx.moveTo(-S * 0.38, 0);
    ctx.quadraticCurveTo(-S * 0.42, S * 0.3, 0, S * 0.56);
    ctx.quadraticCurveTo(S * 0.42, S * 0.3, S * 0.38, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // the wiring: AV node, bundle of His, Purkinje fibres
    const av: [number, number] = [cx - S * 0.03, cy - S * 0.1];
    const wire = down ? C.accent : 'rgba(253,224,71,0.35)';
    line(ctx, av[0], av[1], cx, cy + S * 0.36, wire, 2.5);
    line(ctx, cx, cy + S * 0.36, cx - S * 0.3, cy + S * 0.02, wire, 1.5);
    line(ctx, cx, cy + S * 0.36, cx + S * 0.3, cy + S * 0.02, wire, 1.5);
    dot(ctx, av[0], av[1], pause ? 6 : 4, pause ? C.accent : '#fde68a');
    // the sinoatrial node, in the right atrium (on the left as you face the heart)
    const fired = node === 'working' && since >= 0 && since < 0.06;
    ctx.shadowColor = C.accent;
    ctx.shadowBlur = fired ? 16 : 0;
    dot(ctx, cx - S * 0.3, cy - S * 0.38, fired ? 7 : 5, node === 'working' ? C.accent : C.faint);
    ctx.shadowBlur = 0;
    if (node === 'stopped') label(ctx, '×', cx - S * 0.3, cy - S * 0.38, { size: 16, color: C.bad });
    // labels, with leader lines to the parts
    const tx = Math.max(cx + S * 0.55, w * 0.5), tag = (text: string, y: number, x0: number, y0: number, color: string) => {
      line(ctx, tx - 4, y, x0, y0, 'rgba(255,255,255,0.25)', 1);
      label(ctx, text, tx, y, { size: 11, align: 'left', color });
    };
    tag(node === 'working' ? t('SA node') : t('SA node: stopped'), cy - S * 0.42, cx - S * 0.3 + 6, cy - S * 0.38, node === 'working' ? C.accent : C.bad);
    tag(node === 'stopped' ? t('Backup cells near the AV node') : pause ? t('AV node: holding the signal') : t('AV node'), cy - S * 0.12, av[0] + 5, av[1], pause || (node === 'stopped' && down) ? C.accent : C.soft);
    tag(t('ventricles'), cy + S * 0.2, cx + S * 0.3, cy + S * 0.12, down || squeeze > 0.6 ? '#fb7185' : C.soft);
    // the ECG, last 4 seconds
    const top = h - stripH, mid = top + stripH * 0.62, span = 4, L = 8, R = w - 8;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, top, w, stripH);
    ctx.strokeStyle = C.good;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const s = time - span + (i / 300) * span;
      ctx[i ? 'lineTo' : 'moveTo'](L + (i / 300) * (R - L), mid - ecg(s, beats, rr) * stripH * 0.5);
    }
    ctx.stroke();
    label(ctx, 'ECG', L + 4, top + 10, { size: 10, align: 'left', color: C.good });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A heart beating {n} times a minute, with its ECG', { n: bpm })} />
      <Range label={t('SA node rate')} value={rate} min={40} max={180} onChange={setRate} format={(v) => t('{n}/min', { n: v })} />
      <Choice
        label={t('Sinoatrial node')}
        value={node}
        onChange={setNode}
        options={[
          { value: 'working', label: t('SA node working') },
          { value: 'stopped', label: t('SA node stops') },
        ]}
      />
      <Readouts
        items={[
          { label: t('Atria'), value: node === 'working' ? t('{n}/min', { n: rate }) : t('no P waves'), tone: node === 'working' ? undefined : 'bad' },
          { label: t('Ventricles'), value: t('{n}/min', { n: bpm }), tone: node === 'working' ? 'accent' : 'bad' },
        ]}
      />
    </div>
  );
}
