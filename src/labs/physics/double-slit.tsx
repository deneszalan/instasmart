import { useRef, useState } from 'react';
import { Btn, C, Choice, label, Range, Stage, useGoal, wavelengthColour, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A wavelength in nanometres as a screen colour (an approximation good enough to tell the colours apart). */
/**
 * Brightness on the screen at height y (−1 … 1), for slits `gap` apart and light of wavelength `nm`: the
 * two-slit cos² fringes inside the single-slit envelope. With a which-slit detector there are no fringes.
 */
export function intensity(y: number, gap: number, nm: number, watched: boolean): number {
  const k = (Math.PI * y * 600) / nm;
  const envelope = Math.pow(Math.sin(k * 0.5 + 1e-9) / (k * 0.5 + 1e-9), 2);
  return watched ? envelope : envelope * Math.pow(Math.cos(k * gap), 2);
}

export default function DoubleSlit({ onDone }: LabProps) {
  const [nm, setNm] = useState(520);
  const [gap, setGap] = useState(3);
  const [mode, setMode] = useState<'one' | 'wave'>('one');
  const [watched, setWatched] = useState(false);
  const hits = useRef<number[]>([]);
  const [count, setCount] = useState(0);
  useGoal(count >= 300, onDone);

  const fire = (n: number) => {
    for (let i = 0; i < n; i++) {
      // Each particle lands at one spot, picked with odds set by the wave's brightness there.
      for (;;) {
        const y = Math.random() * 2 - 1;
        if (Math.random() < intensity(y, gap, nm, watched)) {
          hits.current.push(y, Math.random());
          break;
        }
      }
    }
    setCount((c) => c + n);
  };
  const clear = () => {
    hits.current = [];
    setCount(0);
  };
  const change = (f: () => void) => {
    f();
    clear();
  };

  const colour = wavelengthColour(nm);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const wallX = w * 0.18, screenX = w * 0.62, sw = w - screenX - 10, top = 10, bot = h - 10, mid = (top + bot) / 2;
    // the laser, the wall with two slits, and the waves spreading from them
    ctx.fillStyle = colour;
    ctx.fillRect(8, mid - 2, wallX - 8, 4);
    ctx.fillStyle = C.soft;
    const s = 4 + gap * 3;
    ctx.fillRect(wallX - 2, top, 4, mid - s - 3 - top);
    ctx.fillRect(wallX - 2, mid - s + 3, 4, 2 * s - 6);
    ctx.fillRect(wallX - 2, mid + s + 3, 4, bot - mid - s - 3);
    ctx.save();
    ctx.beginPath();
    ctx.rect(wallX + 2, top, screenX - wallX - 4, bot - top);
    ctx.clip();
    ctx.strokeStyle = colour;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    const spacing = nm / 40;
    for (const sy of watched ? [mid - s] : [mid - s, mid + s]) {
      for (let r = spacing; r < screenX - wallX; r += spacing) {
        ctx.beginPath();
        ctx.arc(wallX, sy, r, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    if (watched) label(ctx, '👁', wallX + 12, mid - s - 12, { size: 13 });
    // the screen
    ctx.fillStyle = '#05060a';
    ctx.fillRect(screenX, top, sw, bot - top);
    const Y = (y: number) => mid + y * (bot - top) * 0.5;
    if (mode === 'wave') {
      for (let py = top; py < bot; py++) {
        const v = intensity((py - mid) / ((bot - top) / 2), gap, nm, watched);
        ctx.globalAlpha = v;
        ctx.fillStyle = colour;
        ctx.fillRect(screenX, py, sw * 0.55, 1);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let py = top; py <= bot; py++) {
        const v = intensity((py - mid) / ((bot - top) / 2), gap, nm, watched);
        ctx[py === top ? 'moveTo' : 'lineTo'](screenX + sw * 0.58 + v * sw * 0.4, py);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = colour;
      const pts = hits.current;
      for (let i = 0; i < pts.length; i += 2) ctx.fillRect(screenX + 2 + pts[i + 1] * (sw - 4), Y(pts[i]) - 0.8, 1.6, 1.6);
      label(ctx, formatNumber(pts.length / 2), screenX + sw / 2, bot - 8, { size: 11, color: C.soft });
    }
  };

  return (
    <div className="lab">
      <div className="lab__row">
        <Choice label={t('Show')} value={mode} onChange={setMode} options={[{ value: 'one', label: t('One at a time') }, { value: 'wave', label: t('The wave') }]} />
        <Choice label={t('Which slit?')} value={watched ? 'yes' : 'no'} onChange={(v) => change(() => setWatched(v === 'yes'))} options={[{ value: 'no', label: t('Don’t look') }, { value: 'yes', label: t('Watch the slits') }]} />
      </div>
      <Stage draw={draw} label={t('Two slits and a screen; {n} particles have landed', { n: count })} />
      {mode === 'one' && (
        <div className="lab__row">
          <Btn onClick={() => fire(1)}>{t('Fire 1')}</Btn>
          <Btn onClick={() => fire(100)}>{t('Fire 100')}</Btn>
          <Btn onClick={() => fire(1000)}>{t('Fire 1,000')}</Btn>
          <Btn ghost onClick={clear}>
            {t('Clear')}
          </Btn>
        </div>
      )}
      <Range label={t('Colour')} value={nm} min={400} max={700} step={10} onChange={(v) => change(() => setNm(v))} format={(v) => `${v} nm`} />
      <Range label={t('Slit gap')} value={gap} min={1} max={4} step={0.5} onChange={(v) => change(() => setGap(v))} format={(v) => formatNumber(v)} />
    </div>
  );
}
