import { useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Walls = 'black' | 'grey' | 'white';
export type Windows = 'one' | 'two';

/** How much light each kind of wall reflects (a rough reflectance). */
export const REFLECT: Record<Walls, number> = { black: 0.05, grey: 0.3, white: 0.8 };
/** Share of the window light that the walls bounce back onto the sitter's shadow side, for a fully white room (model constant). */
const BOUNCE = 0.6;
/** A second window, on the other side, lights the shadow side directly with this much of the first one's light. */
const SECOND = 0.6;

/** Brightness of the lit side and of the shadow side of a face, with the main window's direct light = 1. */
export function sides(walls: Walls, windows: Windows) {
  const total = windows === 'two' ? 1 + SECOND : 1;
  const bounce = REFLECT[walls] * BOUNCE * total;
  return { lit: 1 + bounce, shadow: bounce + (windows === 'two' ? SECOND : 0) };
}

/** Lit side ÷ shadow side. */
export const contrast = (walls: Walls, windows: Windows) => {
  const s = sides(walls, windows);
  return s.lit / s.shadow;
};

/** Tenebrism in this model: the lit side at least 20 times as bright as the shadow side. */
export const TENEBRIST = 20;

export default function CaravaggioLight({ onDone }: LabProps) {
  const [walls, setWalls] = useState<Walls>('white');
  const [windows, setWindows] = useState<Windows>('two');
  const { lit, shadow } = sides(walls, windows);
  const ratio = lit / shadow;
  const dark = ratio >= TENEBRIST;
  const shown = formatNumber(ratio < 10 ? Math.round(ratio * 10) / 10 : Math.round(ratio));
  useGoal(dark, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const wallTone = { black: 22, grey: 96, white: 200 }[walls];
    ctx.fillStyle = `rgb(${wallTone},${Math.round(wallTone * 0.95)},${Math.round(wallTone * 0.85)})`;
    ctx.fillRect(0, 0, w, h);
    // windows
    ctx.fillStyle = 'rgba(255,236,190,0.95)';
    ctx.fillRect(w - 14, 8, 8, h * 0.32);
    if (windows === 'two') ctx.fillRect(6, 8, 8, h * 0.32);
    // the face: a sphere with its lit side toward the main window (upper right)
    const cx = w / 2, cy = h * 0.52, r = Math.min(w, h) * 0.26;
    const max = Math.max(lit, 1.6);
    const tone = (v: number) => {
      const f = Math.min(1, v / max);
      return `rgb(${Math.round(255 * f)},${Math.round(214 * f)},${Math.round(170 * f)})`;
    };
    const g = ctx.createLinearGradient(cx + r * 0.7, cy - r * 0.7, cx - r * 0.7, cy + r * 0.7);
    g.addColorStop(0, tone(lit));
    g.addColorStop(0.45, tone((lit + shadow) / 2));
    g.addColorStop(0.7, tone(shadow));
    g.addColorStop(1, tone(shadow));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    const ink = walls === 'white' ? 'rgba(0,0,0,0.6)' : C.soft;
    label(ctx, t('lit side of the face'), cx + r * 0.95, cy - r - 10, { size: 10, color: ink });
    label(ctx, t('shadow side of the face'), cx - r * 0.95, cy + r + 12, { size: 10, color: ink });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Studio walls')}
        value={walls}
        onChange={setWalls}
        options={[
          { value: 'white', label: t('White walls') },
          { value: 'grey', label: t('Grey walls') },
          { value: 'black', label: t('Black walls') },
        ]}
      />
      <Choice
        label={t('Studio windows')}
        value={windows}
        onChange={setWindows}
        options={[
          { value: 'two', label: t('Windows on two sides') },
          { value: 'one', label: t('One high window') },
        ]}
      />
      <Stage draw={draw} label={t('A face lit in a studio: the lit side is {n} times as bright as the shadow side', { n: shown })} />
      <Readouts
        items={[
          { label: t('Lit side to shadow side'), value: t('{n} to 1', { n: shown }), tone: dark ? 'good' : 'accent' },
          { label: t('Shadow side, share of the lit side'), value: `${formatNumber(Math.round((shadow / lit) * 100))}%` },
        ]}
      />
      <p className="lab__note">{t('Simplified: one face as a sphere, light bouncing once off the walls; the numbers show the idea, not measurements.')}</p>
    </div>
  );
}
