import { useState } from 'react';
import { Btn, C, dot, label, line, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Circular, flat orbits are enough to show the effect: radius in AU and period in years. */
const EARTH = { r: 1, T: 1 };
const MARS = { r: 1.524, T: 1.881 };

const at = (p: { r: number; T: number }, years: number): [number, number] => {
  const a = (2 * Math.PI * years) / p.T;
  return [p.r * Math.cos(a), p.r * Math.sin(a)];
};

/** Mars's direction in Earth's sky (its ecliptic longitude), in degrees. */
export function marsLongitude(years: number): number {
  const [ex, ey] = at(EARTH, years), [mx, my] = at(MARS, years);
  return (Math.atan2(my - ey, mx - ex) * 180) / Math.PI;
}

/** Whether Mars is moving backwards against the stars at this moment. */
export function retrograde(years: number): boolean {
  let d = marsLongitude(years + 0.002) - marsLongitude(years);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

export default function MarsLoop({ onDone, active }: LabProps) {
  const [years, setYears] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  useFrame((dt) => setYears((y) => (y + dt * 0.25) % 4.3), active && playing);
  const back = retrograde(years);
  useGoal(back, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the view from above; right: Mars's track across the stars, with time running down the strip
    const split = w * 0.52, cx = split / 2, cy = h / 2, k = (Math.min(split, h) / 2 - 10) / MARS.r;
    dot(ctx, cx, cy, 7, '#fbbf24');
    for (const p of [EARTH, MARS]) {
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r * k, 0, Math.PI * 2);
      ctx.stroke();
    }
    const [ex, ey] = at(EARTH, years), [mx, my] = at(MARS, years);
    const E: [number, number] = [cx + ex * k, cy - ey * k], M: [number, number] = [cx + mx * k, cy - my * k];
    const dx = M[0] - E[0], dy = M[1] - E[1], len = Math.hypot(dx, dy);
    line(ctx, E[0], E[1], E[0] + (dx / len) * split, E[1] + (dy / len) * split, back ? C.bad : C.faint, 1.5, [4, 4]);
    dot(ctx, E[0], E[1], 5, C.cool);
    dot(ctx, M[0], M[1], 5, '#f87171');
    label(ctx, t('Earth'), E[0], E[1] + 13, { size: 10 });
    label(ctx, t('Mars'), M[0], M[1] - 12, { size: 10 });
    // the sky strip: direction across, date down
    const L = split + 10, R = w - 8, top = 14, bot = h - 18;
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(L - 4, top - 8, R - L + 8, bot - top + 16);
    const span = 1.2, from = years - span / 2;
    const centre = marsLongitude(years);
    const X = (lon: number) => {
      let d = lon - centre;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      return (L + R) / 2 - (d / 60) * (R - L);
    };
    for (let i = 0; i <= 120; i++) {
      const y0 = from + (i / 120) * span, y1 = from + ((i + 1) / 120) * span;
      line(ctx, X(marsLongitude(y0)), top + (i / 120) * (bot - top), X(marsLongitude(y1)), top + ((i + 1) / 120) * (bot - top), retrograde(y0) ? C.bad : '#f87171', 2);
    }
    dot(ctx, X(centre), (top + bot) / 2, 5, C.ink);
    label(ctx, t('east ←  in the sky  → west'), (L + R) / 2, h - 6, { size: 9.5 });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Earth and Mars from above, and Mars’s path across the sky')} />
      <Range label={t('Date')} value={years} min={0} max={4.3} step={0.01} onChange={setYears} format={(v) => t('year {y}', { y: formatNumber(Math.round(v * 10) / 10) })} />
      <div className="lab__row">
        <Btn onClick={() => setPlaying((p) => !p)}>{playing ? t('Pause') : t('Play')}</Btn>
        <span className="lab__note" aria-live="polite">
          {back ? t('Backwards! Earth is overtaking Mars on the inside track.') : t('Mars drifts east against the stars, as usual.')}
        </span>
      </div>
    </div>
  );
}
