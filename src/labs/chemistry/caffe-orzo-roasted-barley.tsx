import { useState } from 'react';
import { C, font, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The oven's range in the lab, in °C, and the roasting time's, in minutes. */
export const T_MIN = 100, T_MAX = 260, T_STEP = 10, MAX_MIN = 30, MIN_STEP = 0.5;
/** Water in raw barley: about 13% of the grain as stored (Feedipedia: 87.1% dry matter on average). */
export const WATER = 12.9;
/** Below this the toy grain doesn't brown. EFSA notes that acrylamide, made by the Maillard reaction, forms in roasting at 120 °C and up, in dry food. */
export const BROWN_FROM = 120;
/** Roast degrees in the lab: 0 raw, 3–4.5 dark brown like orzo, from 5.5 burnt; the drawing stops at 6. */
export const ORZO = [3, 4.5] as const;
export const BURNT = 5.5, TOP = 6;
/** Barley makes no caffeine, so no roast gives it any. */
export const CAFFEINE_MG = 0;

/** Minutes the toy grain takes to lose its water at oven temperature `T`: faster the hotter it is. */
export const dryMinutes = (T: number) => (T <= 80 ? Infinity : 240 / (T - 80));

/** Browning speed once the grain is dry, in roast degrees a minute: none below 120 °C, doubling with every 10 °C. */
export const brownRate = (T: number) => (T < BROWN_FROM ? 0 : 0.25 * 2 ** ((T - 200) / 10));

/** How roasted the grain is after `min` minutes at `T` °C. */
export function roastDegree(T: number, min: number): number {
  const d = dryMinutes(T);
  return min <= d ? 0 : brownRate(T) * (min - d);
}

/** Water left in the grain, in % of its weight, drying at a steady pace. */
export const waterLeft = (T: number, min: number) => WATER * Math.max(0, 1 - min / dryMinutes(T));

export const isOrzo = (r: number) => r >= ORZO[0] && r < ORZO[1];

/** The colour of a grain at roast degree r: straw, gold, chestnut, dark brown, near black. */
const RAMP = [[233, 214, 160], [222, 178, 98], [176, 112, 52], [112, 62, 30], [58, 32, 17], [30, 18, 11]];
export function roastColour(r: number): string {
  const x = (Math.min(Math.max(r, 0), TOP) / TOP) * (RAMP.length - 1), i = Math.min(RAMP.length - 2, Math.floor(x)), f = x - i;
  return `rgb(${RAMP[i].map((v, j) => Math.round(v + (RAMP[i + 1][j] - v) * f)).join(',')})`;
}

const GOLD = '#f2c14e', MINT = '#8fe0c8', WATERC = 'rgba(134,205,240,0.85)';
const rnd = (i: number, j: number) => {
  const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function grain(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, colour: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const w = r * 0.42;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo(w * 1.25, -r * 0.55, w * 1.25, r * 0.55, 0, r);
  ctx.bezierCurveTo(-w * 1.25, r * 0.55, -w * 1.25, -r * 0.55, 0, -r);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export default function RoastBarley({ onDone, active }: LabProps) {
  const [T, setT] = useState(160);
  const [min, setMin] = useState(10);
  const [clock, setClock] = useState(0);
  useFrame((dt) => setClock((c) => (c + dt) % 1000), active);
  const r = roastDegree(T, min), water = waterLeft(T, min), done = isOrzo(r);
  useGoal(done, onDone);

  const colourName =
    water > 0.05
      ? t('still drying')
      : r < 0.5
        ? t('pale straw')
        : r < 1.5
          ? t('golden brown')
          : r < ORZO[0]
            ? t('mid brown')
            : r < ORZO[1]
              ? t('dark brown')
              : r < BURNT
                ? t('almost black')
                : t('burnt black');
  const aroma = r < 0.3 ? t('not yet') : r < 1.5 ? t('faint, toasty') : r < ORZO[0] ? t('growing') : r < ORZO[1] ? t('rich, roasty') : r < BURNT ? t('harsh, bitter') : t('acrid, burnt');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // left: the roaster drum, its grains the colour of the roast
    const R = Math.max(26, Math.min((h - 28) / 2, w * 0.2)), cx = 6 + R, cy = h / 2 + 2;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(243,154,107,${0.25 + 0.6 * ((T - T_MIN) / (T_MAX - T_MIN))})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    const colour = roastColour(r);
    for (let i = 0; i < 16; i++) {
      const an = Math.PI * (0.15 + 0.7 * rnd(i, 7)) + Math.sin(clock * 1.5 + i) * 0.1, rr = (R - 12) * (0.35 + 0.6 * rnd(i, 8));
      grain(ctx, cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, Math.max(5, R * 0.15), rnd(i, 9) * 6 + clock * (rnd(i, 10) - 0.5), colour);
    }
    if (water > 0.05 && T > 100) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const ph = (clock * 0.5 + i / 3) % 1, x = cx - R * 0.3 + i * R * 0.3;
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
        ctx.beginPath();
        for (let j = 0; j <= 8; j++) {
          const yy = cy - R * 0.2 - ph * R * 0.5 - j * 2.5;
          if (j) ctx.lineTo(x + Math.sin(j + clock * 3) * 3, yy);
          else ctx.moveTo(x, yy);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    label(ctx, t('caffeine: 0 mg'), cx, h - 8, { size: 12, color: MINT });

    // right: roast degree against time at this temperature
    const x0 = cx + R + 30, x1 = w - 8, y0 = 10, y1 = h - 26;
    const X = (m: number) => x0 + (m / MAX_MIN) * (x1 - x0), Y = (v: number) => y1 - (Math.min(v, TOP) / TOP) * (y1 - y0);
    // the colour scale up the side
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = roastColour((i / 24) * TOP);
      ctx.fillRect(x0 - 12, Y(((i + 1) / 24) * TOP), 7, Y((i / 24) * TOP) - Y(((i + 1) / 24) * TOP) + 0.5);
    }
    // the orzo band and the burnt zone
    ctx.fillStyle = 'rgba(242,193,78,0.16)';
    ctx.fillRect(x0, Y(ORZO[1]), x1 - x0, Y(ORZO[0]) - Y(ORZO[1]));
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x0, Y(TOP), x1 - x0, Y(BURNT) - Y(TOP));
    line(ctx, x0, y1, x1, y1, C.faint, 1.5);
    label(ctx, '0', x0, y1 + 13, { size: 10, color: C.faint, align: 'left' });
    label(ctx, t('{n} min', { n: MAX_MIN }), x1, y1 + 13, { size: 10, color: C.faint, align: 'right' });
    // the curve: flat while the grain dries, then up at the browning speed
    const d = Math.min(dryMinutes(T), MAX_MIN);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(d), Y(0));
    const k = brownRate(T), end = k > 0 ? Math.min(MAX_MIN, d + TOP / k) : MAX_MIN;
    ctx.lineTo(X(end), Y(roastDegree(T, end)));
    ctx.stroke();
    ctx.setLineDash([]);
    // the drying stretch in blue, then the path so far in the roast's colours
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = WATERC;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(Math.min(min, d)), Y(0));
    ctx.stroke();
    if (min > d) {
      const steps = 24;
      for (let i = 0; i < steps; i++) {
        const a = d + ((min - d) * i) / steps, b = d + ((min - d) * (i + 1)) / steps;
        ctx.strokeStyle = roastColour(Math.max(1, roastDegree(T, b)));
        ctx.beginPath();
        ctx.moveTo(X(a), Y(roastDegree(T, a)));
        ctx.lineTo(X(b), Y(roastDegree(T, b)));
        ctx.stroke();
      }
    }
    // the two zone labels, on a dark backing over the curve, at the right end or the left one when the marker would cover them
    const mx = X(min), my = Y(r);
    const zoneLabel = (s: string, y: number, size: number, color: string) => {
      font(ctx, size);
      const lw = ctx.measureText(s).width, right = !(mx > x1 - lw - 16 && Math.abs(my - y) < 14), lx = right ? x1 - 3 - lw : x0 + 3;
      ctx.fillStyle = 'rgba(10,22,19,0.75)';
      ctx.beginPath();
      ctx.roundRect(lx - 3, y - size / 2 - 2, lw + 6, size + 4, 4);
      ctx.fill();
      label(ctx, s, lx, y, { size, color, align: 'left' });
    };
    zoneLabel(t('orzo'), (Y(ORZO[0]) + Y(ORZO[1])) / 2, 11, GOLD);
    zoneLabel(t('burnt black'), (Y(BURNT) + Y(TOP)) / 2, 10, C.soft);
    const px = mx, py = my;
    ctx.fillStyle = colour;
    ctx.strokeStyle = done ? C.good : C.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (water > 0.05) label(ctx, t('still drying'), Math.min(Math.max(px, x0 + 24), x1 - 24), py - 12, { size: 10, color: '#9fd8f2' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('Barley roasted {m} min at {T} °C: {colour}, roast aroma {aroma}, caffeine 0 mg', {
          m: formatNumber(min),
          T: formatNumber(T),
          colour: colourName,
          aroma,
        })}
      />
      <Range label={t('Roaster heat')} value={T} min={T_MIN} max={T_MAX} step={T_STEP} onChange={setT} format={(v) => `${formatNumber(v)} °C`} />
      <Range label={t('Roasting time')} value={min} min={0} max={MAX_MIN} step={MIN_STEP} onChange={setMin} format={(v) => t('{n} min', { n: formatNumber(v) })} />
      <Readouts
        items={[
          { label: t('Colour'), value: colourName, tone: done ? 'good' : r >= ORZO[1] ? 'bad' : undefined },
          { label: t('Roast aroma'), value: aroma, tone: done ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Toy model: the grain dries, then browns from 120 °C, twice as fast every 10 °C hotter.')}</p>
    </div>
  );
}
