import { useState } from 'react';
import { C, label, lerp, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Rock rigidity in pascals: 30 GPa, a value often used for the Earth's crust. */
export const RIGIDITY = 3e10;
/** The Panama quake of 9 October 2026: USGS moment 3.77 × 10^20 N·m, magnitude 7.7. */
export const PANAMA_MOMENT = 3.77e20, PANAMA_MAG = 7.7;

/** Seismic moment in newton-metres of a fault `lengthKm` long and `widthKm` deep that slips `slipM` metres. */
export const moment = (lengthKm: number, widthKm: number, slipM: number) => RIGIDITY * lengthKm * 1000 * widthKm * 1000 * slipM;
/** Moment magnitude from a moment in newton-metres. */
export const magnitude = (m0: number) => (2 / 3) * (Math.log10(m0) - 9.1);
/** How many times more energy a quake of magnitude a releases than one of magnitude b. */
export const energyRatio = (a: number, b: number) => Math.pow(10, 1.5 * (a - b));
/** The magnitude as reported, to one decimal. */
export const shown = (m: number) => Math.round(m * 10) / 10;

const RED = '#e8735f', BLUE = '#7fb4d6', ROCK = 'rgba(255,255,255,0.10)';

export default function QuakeMagnitude({ onDone }: LabProps) {
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(10);
  const [slip, setSlip] = useState(1);
  const m0 = moment(length, width, slip), mw = magnitude(m0);
  useGoal(shown(mw) === PANAMA_MAG, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the fault plane, seen face on: up to 400 km long and 40 km deep
    const L = 14, R = w - 14, top = 30, kmX = (R - L) / 400, kmY = Math.min(kmX * 1.8, (h * 0.42) / 40);
    ctx.fillStyle = ROCK;
    ctx.fillRect(L, top, R - L, 40 * kmY);
    label(ctx, t('Earth’s surface'), L, top - 12, { size: 10, align: 'left', color: C.faint });
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L, top);
    ctx.lineTo(R, top);
    ctx.stroke();
    const fw = length * kmX, fh = width * kmY;
    ctx.fillStyle = `rgba(232,115,95,${0.25 + 0.6 * Math.min(1, slip / 15)})`;
    ctx.fillRect(L, top, fw, fh);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(L, top, fw, fh);
    label(ctx, t('{l} km × {d} km', { l: formatNumber(length), d: formatNumber(width) }), L + 4, top + fh + 12, { size: 10.5, align: 'left', color: RED });
    // slip arrows, longer for more slip
    const len = 6 + (slip / 15) * 46;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const x = L + fw / 2 - len / 2 + (i - 1) * Math.min(60, fw / 3), y = top + fh / 2;
      if (fw < 18 && i !== 1) continue;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.moveTo(x + len - 5, y - 4);
      ctx.lineTo(x + len, y);
      ctx.lineTo(x + len - 5, y + 4);
      ctx.stroke();
    }
    // the magnitude scale, 5 to 9
    const y = h - 26, X = (m: number) => lerp(L + 8, R - 8, (m - 5) / 4);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(X(5), y);
    ctx.lineTo(X(9), y);
    ctx.stroke();
    for (let m = 5; m <= 9; m++) label(ctx, String(m), X(m), y + 15, { size: 10, color: C.faint });
    ctx.fillStyle = BLUE;
    ctx.fillRect(X(PANAMA_MAG) - 1, y - 14, 2, 28);
    label(ctx, t('Panama 2026'), X(PANAMA_MAG), y - 22, { size: 10, color: BLUE });
    const at = Math.max(5, Math.min(9, mw));
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(X(at), y, 7, 0, Math.PI * 2);
    ctx.fill();
  };

  const ratio = energyRatio(mw, magnitude(PANAMA_MOMENT));
  const vs = ratio >= 1 ? `×${formatNumber(Math.round(ratio * 10) / 10)}` : `÷${formatNumber(Math.round((1 / ratio) * 10) / 10)}`;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A fault {l} km long and {d} km deep slipping {s} m: magnitude {m}', { l: length, d: width, s: slip, m: formatNumber(shown(mw)) })} />
      <Range label={t('Fault length')} value={length} min={5} max={400} step={5} onChange={setLength} format={(v) => `${v} km`} />
      <Range label={t('Fault depth')} value={width} min={2} max={40} step={1} onChange={setWidth} format={(v) => `${v} km`} />
      <Range label={t('Fault slip')} value={slip} min={0.2} max={15} step={0.2} onChange={setSlip} format={(v) => `${formatNumber(v)} m`} />
      <Readouts
        items={[
          { label: t('Quake magnitude'), value: formatNumber(shown(mw)), tone: shown(mw) === PANAMA_MAG ? 'good' : undefined },
          { label: t('Energy against Panama 2026'), value: vs },
        ]}
      />
      <p className="lab__note">{t('Simplified: rock rigidity is fixed at 30 gigapascals, a value often used for the crust.')}</p>
    </div>
  );
}
