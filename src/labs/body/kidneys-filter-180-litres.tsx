import { useRef, useState } from 'react';
import { C, label, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const FILTERED = 180; // litres of filtrate a day
const BOTTLE = 1.5; // litres

/** Litres of urine a day when a share (0…1) of the day's 180 litres of filtrate is taken back into the blood. */
export const urine = (share: number) => FILTERED * (1 - share);

interface Drop {
  x: number;
  back: number | null; // where along the tubule it is taken back, or null if it goes on to the bladder
  up: number;
}

export default function Kidneys({ onDone, active }: LabProps) {
  const [pct, setPct] = useState(97);
  const drops = useRef<Drop[]>([]);
  const spawn = useRef(0);
  const [bladder, setBladder] = useState(0);
  const [, setTick] = useState(0);
  const share = pct / 100, out = urine(share), normal = out >= 0.8 && out <= 2;
  useGoal(normal, onDone);

  useFrame((dt) => {
    spawn.current += dt * 45;
    const d = drops.current;
    while (spawn.current >= 1) {
      spawn.current -= 1;
      d.push({ x: 0, back: Math.random() < share ? 0.08 + Math.random() * 0.84 : null, up: 0 });
    }
    let reached = 0;
    drops.current = d.filter((p) => {
      if (p.back !== null && p.x >= p.back) {
        p.up += dt * 3;
        return p.up < 1;
      }
      p.x += dt * 0.45;
      if (p.x >= 1) reached++;
      return p.x < 1;
    });
    if (reached) setBladder((b) => (b + reached * 0.06) % 1);
    setTick((n) => n + 1);
  }, active);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 46, ty = h * 0.3, vy = h * 0.1, X = (f: number) => L + f * (R - L);
    // the blood vessel above and the tubule below it
    ctx.fillStyle = 'rgba(248,113,113,0.35)';
    ctx.fillRect(L, vy - 6, R - L, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(L, ty - 6, R - L, 12);
    // the glomerulus, where blood is filtered
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(L - 14, (vy + ty) / 2, 13, 0, Math.PI * 2);
    ctx.fill();
    // the bladder
    const bx = R + 8, by = ty - 16, bw = 32, bh = 34;
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(bx + 1, by + bh - bladder * bh, bw - 2, bladder * bh);
    for (const p of drops.current) {
      if (p.back !== null && p.x >= p.back) {
        ctx.fillStyle = `rgba(147,197,253,${1 - p.up})`;
        ctx.fillRect(X(p.x) - 2, ty - p.up * (ty - vy) - 2, 4, 4);
      } else {
        ctx.fillStyle = p.back === null ? '#facc15' : '#93c5fd';
        ctx.fillRect(X(p.x) - 2, ty - 2, 4, 4);
      }
    }
    label(ctx, t('back into the blood'), (L + R) / 2, vy + 16, { size: 10, color: '#fca5a5' });
    label(ctx, t('tubule'), (L + R) / 2, ty + 15, { size: 10 });
    label(ctx, t('bladder'), bx + bw / 2, by + bh + 10, { size: 10 });
    // a day's filtrate as 120 bottles of 1.5 litres: blue ones go back, yellow ones leave as urine
    const cols = 20, rows = 6, gy = h * 0.5, gh = h - gy - 8, cw = (w - 20) / cols, rh = gh / rows;
    const bottles = FILTERED / BOTTLE, yellow = out / BOTTLE;
    for (let i = 0; i < bottles; i++) {
      const c = i % cols, r = Math.floor(i / cols), x = 10 + c * cw + cw * 0.25, y = gy + r * rh + rh * 0.15;
      const left = bottles - 1 - i, fill = Math.max(0, Math.min(1, yellow - left));
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y + rh * 0.2, cw * 0.5, rh * 0.6);
      ctx.fillRect(x + cw * 0.17, y, cw * 0.16, rh * 0.2);
      if (fill > 0) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x, y + rh * 0.2, cw * 0.5 * fill, rh * 0.6);
      }
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A day’s 180 litres of filtrate: {back}% taken back, {out} litres left as urine', { back: formatNumber(pct), out: formatNumber(Math.round(out * 10) / 10) })} />
      <Range label={t('Taken back')} value={pct} min={95} max={99.9} step={0.1} onChange={setPct} format={(v) => `${formatNumber(v)}%`} />
      <Readouts
        items={[
          { label: t('Filtered a day'), value: `${FILTERED} L` },
          { label: t('Urine a day'), value: `${formatNumber(Math.round(out * 10) / 10)} L`, tone: normal ? 'good' : 'bad' },
          { label: t('Bottles of 1.5 L'), value: formatNumber(Math.round((out / BOTTLE) * 10) / 10), tone: 'accent' },
        ]}
      />
      <p className="lab__note">{normal ? t('A normal day: 0.8 to 2 litres.') : out > 2 ? t('Far more than a normal day’s 0.8 to 2 litres.') : t('Less than a normal day’s 0.8 to 2 litres.')}</p>
    </div>
  );
}
