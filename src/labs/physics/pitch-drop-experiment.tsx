import { useState } from 'react';
import { Btn, C, label, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** When each drop fell (the year plus a fraction for the month), from the University of Queensland's record. */
export const DROPS = [1938.9, 1947.1, 1954.3, 1962.4, 1970.6, 1979.3, 1988.5, 2000.9, 2014.3];
/** How long a drop takes to tumble into the beaker, in years of the time-lapse, so a reader can catch it. */
const FALL = 0.35;

export default function PitchDrop({ onDone, active }: LabProps) {
  const [year, setYear] = useState(1930);
  const [speed, setSpeed] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [caught, setCaught] = useState<number[]>([]);
  const [missed, setMissed] = useState(false);
  useGoal(caught.length > 0, onDone);

  useFrame((dt) => setYear((y) => (y + dt * speed > 2026 ? 1930 : y + dt * speed)), active && playing);

  const prev = [...DROPS].reverse().find((d) => d <= year) ?? 1930;
  const next = DROPS.find((d) => d > year);
  const falling = DROPS.find((d) => year >= d && year < d + FALL);
  const growth = next ? (year - prev) / (next - prev) : Math.min(1, (year - prev) / 12);

  const tryCatch = () => {
    if (falling !== undefined) {
      if (!caught.includes(falling)) setCaught((c) => [...c, falling]);
      setMissed(false);
    } else setMissed(true);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w * 0.34, top = 14;
    // bell jar, funnel of pitch, the drop on its stem, the beaker
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 62, h - 14);
    ctx.lineTo(cx - 62, top + 30);
    ctx.quadraticCurveTo(cx - 62, top, cx, top);
    ctx.quadraticCurveTo(cx + 62, top, cx + 62, top + 30);
    ctx.lineTo(cx + 62, h - 14);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(cx - 40, top + 26);
    ctx.lineTo(cx + 40, top + 26);
    ctx.lineTo(cx + 5, top + 80);
    ctx.lineTo(cx - 5, top + 80);
    ctx.fill();
    ctx.fillRect(cx - 4, top + 80, 8, 18);
    const stemEnd = top + 98;
    if (falling !== undefined) {
      const k = (year - falling) / FALL;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(cx, stemEnd + 14 + k * (h - stemEnd - 60), 10, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const len = 6 + growth * 34, wid = 4 + growth * 9;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(cx, stemEnd + len / 2, wid, len / 2 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = C.soft;
    ctx.strokeRect(cx - 26, h - 50, 52, 36);
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 24, h - 14 - Math.min(9, DROPS.filter((d) => d + FALL <= year).length) * 2.4, 48, Math.min(9, DROPS.filter((d) => d + FALL <= year).length) * 2.4);
    // the timeline of drops
    const tx = w * 0.66;
    label(ctx, formatNumber(Math.floor(year), 'year'), tx + 20, top + 6, { size: 22, weight: 850, color: C.ink });
    DROPS.forEach((d, i) => {
      const y = top + 34 + i * ((h - top - 44) / 9);
      const fell = year >= d + FALL, got = caught.includes(d);
      label(ctx, `${i + 1}`, tx - 6, y, { size: 11, align: 'right', color: fell ? C.ink : C.faint });
      label(ctx, formatNumber(Math.floor(d), 'year'), tx, y, { size: 11, align: 'left', color: got ? C.good : fell ? C.soft : C.faint });
      if (got) label(ctx, t('caught!'), tx + 36, y, { size: 10, align: 'left', color: C.good });
      else if (fell && (i === 6 || i === 7)) label(ctx, i === 6 ? t('missed: out for a drink') : t('missed: webcam'), tx + 36, y, { size: 10, align: 'left', color: C.bad });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The pitch funnel in {y}, with the nine drops so far', { y: Math.floor(year) })} />
      <div className="lab__row">
        <Btn onClick={() => setPlaying((p) => !p)}>{playing ? t('Pause') : t('Fast-forward')}</Btn>
        <Btn ghost onClick={tryCatch}>
          {t('Catch the drop!')}
        </Btn>
        <span className="lab__note" aria-live="polite">
          {missed ? t('Too early or too late: drops fall in a moment after years of waiting.') : caught.length ? t('Caught {n} of 9.', { n: caught.length }) : ''}
        </span>
      </div>
      <Range label={t('Speed')} value={speed} min={0.5} max={6} step={0.5} onChange={setSpeed} format={(v) => t('{v} years a second', { v: formatNumber(v) })} />
    </div>
  );
}
