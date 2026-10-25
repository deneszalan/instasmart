import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export const BURN_MS = 2; // in this lab, the burn takes 2 ms to reach its peak pressure, whatever the engine speed
export const BEST = 10; // degrees after the top: about where peak pressure does the most work

/** Which stroke the engine is on at crank angle `a` (0–720°, top dead centre of compression at 360°). */
export const stroke = (a: number) => (['intake', 'compression', 'power', 'exhaust'] as const)[Math.floor((((a % 720) + 720) % 720) / 180)];

/** Where the pressure peaks, in degrees after the top, for a spark `advance` degrees before it at `rpm`. */
export const peakAfterTop = (advance: number, rpm: number) => -advance + (rpm * 360 * BURN_MS) / 60000;

/** Share of the best possible push the piston gets: highest when the peak comes about 10° after the top. */
export const push = (peak: number) => Math.max(0, 1 - ((peak - BEST) / 45) ** 2);

export default function FourStroke({ onDone, active }: LabProps) {
  const [rpm, setRpm] = useState(1000);
  const [advance, setAdvance] = useState(30);
  const [angle, setAngle] = useState(0);
  const [tuned, setTuned] = useState(new Set<string>());
  const peak = peakAfterTop(advance, rpm), power = push(peak);
  useGoal(tuned.has('slow') && tuned.has('fast'), onDone);
  useFrame((dt) => setAngle((a) => (a + dt * 300) % 720), active);
  const check = (r: number, adv: number) => {
    if (push(peakAfterTop(adv, r)) >= 0.97) setTuned((s) => new Set(s).add(r <= 1200 ? 'slow' : r >= 2500 ? 'fast' : 'mid'));
  };

  const names = { intake: t('Intake'), compression: t('Compression'), power: t('Power'), exhaust: t('Exhaust') };
  const st = stroke(angle), rel = angle - 360; // degrees from the compression top
  const burning = rel >= -advance && rel < -advance + 120;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // sized so the piston's whole travel fits the stage: just under the valves at the top, crank at the bottom
    const cx = w * 0.3, cw = Math.min(w * 0.24, 80), top = 16, R = Math.min(h * 0.12, 22), pistonH = Math.min(22, h * 0.14), crankY = h - R - 6;
    const rod = Math.max(R * 1.6, crankY - R - pistonH - (top + 16));
    const a = (angle * Math.PI) / 180, pinX = cx + Math.sin(a) * R, pinY = crankY - Math.cos(a) * R;
    const pistonY = pinY - Math.sqrt(rod * rod - (pinX - cx) ** 2), head = pistonY - pistonH;
    // the gas above the piston
    const gas = st === 'intake' ? 'rgba(125,211,252,0.35)' : st === 'compression' ? (burning ? 'rgba(251,146,60,0.85)' : 'rgba(125,211,252,0.6)') : st === 'power' ? (burning ? 'rgba(251,146,60,0.8)' : 'rgba(148,163,184,0.5)') : 'rgba(148,163,184,0.4)';
    ctx.fillStyle = gas;
    ctx.fillRect(cx - cw / 2, top + 10, cw, Math.max(0, head - top - 10));
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - cw / 2, top + 10, cw, crankY - top - 10);
    // the valves: intake on the left, exhaust on the right
    const open = (on: boolean) => (on ? 8 : 0);
    line(ctx, cx - cw * 0.28, top, cx - cw * 0.28, top + 10 + open(st === 'intake'), '#93c5fd', 3);
    line(ctx, cx - cw * 0.4, top + 10 + open(st === 'intake'), cx - cw * 0.16, top + 10 + open(st === 'intake'), '#93c5fd', 3);
    line(ctx, cx + cw * 0.28, top, cx + cw * 0.28, top + 10 + open(st === 'exhaust'), '#cbd5e1', 3);
    line(ctx, cx + cw * 0.16, top + 10 + open(st === 'exhaust'), cx + cw * 0.4, top + 10 + open(st === 'exhaust'), '#cbd5e1', 3);
    // the spark plug
    const spark = rel >= -advance && rel < -advance + 12;
    line(ctx, cx, top - 4, cx, top + 12, C.soft, 2);
    if (spark) label(ctx, '⚡', cx, top + 18, { size: 16 });
    // piston, connecting rod and crank
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(cx - cw / 2 + 3, head, cw - 6, pistonH);
    line(ctx, cx, pistonY - pistonH / 2, pinX, pinY, '#d1d5db', 5);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(cx, crankY, R, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, cx, crankY, pinX, pinY, '#d1d5db', 4);
    // the four strokes, with where the spark and the peak fall
    const gx = w * 0.62, gw = w - gx - 10;
    const rowH = Math.min(20, (h - 56) / 4);
    (['intake', 'compression', 'power', 'exhaust'] as const).forEach((s, i) => label(ctx, names[s], gx, 12 + i * rowH, { size: Math.min(11.5, rowH * 0.8), align: 'left', color: s === st ? C.accent : C.faint }));
    const ty = 12 + 4 * rowH - 4, X = (deg: number) => gx + ((deg + 60) / 120) * gw;
    line(ctx, gx, ty + 14, gx + gw, ty + 14, C.faint, 1);
    line(ctx, X(0), ty + 6, X(0), ty + 22, C.ink, 1.5);
    label(ctx, t('top'), X(0), ty + 30, { size: 9.5, color: C.soft });
    label(ctx, '⚡', X(Math.max(-60, -advance)), ty + 4, { size: 11 });
    ctx.fillStyle = power > 0.97 ? C.good : C.bad;
    ctx.beginPath();
    ctx.arc(X(Math.max(-60, Math.min(60, peak))), ty + 14, 5, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('peak'), X(Math.max(-60, Math.min(60, peak))), ty + 30, { size: 9.5, color: power > 0.97 ? C.good : C.bad });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('One cylinder of a four-stroke engine, in slow motion: {s}', { s: names[st] })} />
      <Range label={t('Engine speed')} value={rpm} min={800} max={3000} step={50} onChange={(v) => (setRpm(v), check(v, advance))} format={(v) => t('{n} rpm', { n: v })} />
      <Range label={t('Spark before top')} value={advance} min={0} max={40} onChange={(v) => (setAdvance(v), check(rpm, v))} format={(v) => `${v}°`} />
      <Readouts
        items={[
          { label: t('Peak pressure'), value: peak >= 0 ? t('{d}° after the top', { d: Math.round(peak) }) : t('{d}° before the top', { d: Math.round(-peak) }), tone: power > 0.97 ? 'good' : 'bad' },
          { label: t('Push on the piston'), value: `${Math.round(power * 100)}%`, tone: 'accent' },
        ]}
      />
    </div>
  );
}
