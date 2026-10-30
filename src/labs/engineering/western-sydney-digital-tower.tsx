import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The Sydney Morning Herald (August 2026): 15 nautical miles between landing planes, about 7 minutes. */
export const WIDE_NM = 15;
export const GAP_MIN = 7;
/** The approach speed those two figures imply, in knots (nautical miles an hour): about 129. */
export const SPEED_KT = WIDE_NM / (GAP_MIN / 60);
export const NM_M = 1852;
/** An A320's wingspan with sharklets, in metres. */
export const SPAN_M = 35.8;

export const minutesBetween = (nm: number) => (nm / SPEED_KT) * 60;
export const landingsPerHour = (nm: number) => 60 / minutesBetween(nm);
/** How far away a 1 cm button would look as wide as an A320 at `nm` nautical miles, in metres. */
export const buttonAt = (nm: number) => (0.01 * nm * NM_M) / SPAN_M;

const CYAN = '#58c4dd', MAG = '#ff5fa2', AMBER = '#ffb84d';

export default function WesternSydneyDigitalTower({ onDone }: LabProps) {
  const [nm, setNm] = useState(WIDE_NM);
  const perHour = landingsPerHour(nm), triple = perHour >= 3 * landingsPerHour(WIDE_NM) - 1e-9;
  useGoal(triple, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the approach: the runway at the left, planes queued every `nm` nautical miles out to 16
    const y = 14, L = 34, R = w - 14, per = (R - L) / 16;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(4, y - 5, L - 8, 10);
    line(ctx, L, y, R, y, C.line, 2);
    for (let d = nm; d <= 16; d += nm) {
      const x = L + d * per;
      ctx.fillStyle = nm >= 10 ? MAG : CYAN;
      ctx.beginPath();
      ctx.moveTo(x - 9, y);
      ctx.lineTo(x + 7, y - 6);
      ctx.lineTo(x + 7, y + 6);
      ctx.closePath();
      ctx.fill();
    }
    for (const d of [0, 15]) label(ctx, String(d), L + d * per, y + 15, { size: 10, color: C.faint });
    label(ctx, t('nautical miles from the runway'), (L + R) / 2, y + 15, { size: 10, color: C.faint });
    // the next plane as the camera sees it: its width shrinks as 1 / distance
    const top = y + 26, bot = h - 22, cy = (top + bot) / 2, px = Math.max(1, (60 * 4) / nm);
    ctx.fillStyle = '#1d2b48';
    ctx.fillRect(20, top, w - 40, bot - top);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - px / 2, cy - Math.max(1, px / 6) / 2, px, Math.max(1, px / 6));
    label(ctx, t('the next plane on screen (not to scale)'), w / 2, top + 10, { size: 10, color: C.faint });
    label(ctx, t('{n} landings an hour', { n: perHour.toFixed(1) }), w / 2, h - 9, { size: 13, color: triple ? C.good : AMBER });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Planes {n} nautical miles apart: {p} landings an hour', { n: nm, p: perHour.toFixed(1) })} />
      <Range label={t('Spacing between landing planes')} value={nm} min={3} max={15} step={0.5} onChange={setNm} format={(v) => t('{n} nautical miles', { n: v })} />
      <Readouts
        items={[
          { label: t('Minutes apart'), value: minutesBetween(nm).toFixed(1) },
          { label: t('Landings / hour'), value: perHour.toFixed(1), tone: triple ? 'good' : 'accent' },
          { label: t('A320 looks like'), value: t('1 cm at {m} m', { m: Math.round(buttonAt(nm)) }) },
        ]}
      />
      <p className="lab__note">{t('Simplified: every plane flies at the same speed, about 129 knots (15 nautical miles in about 7 minutes).')}</p>
    </div>
  );
}
