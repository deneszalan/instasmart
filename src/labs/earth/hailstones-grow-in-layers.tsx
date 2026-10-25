import { useRef, useState } from 'react';
import { Btn, C, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const BASE = 1.5, FREEZE = 4, TOP = 12; // km: cloud base, freezing level, cloud top
const SPEEDUP = 60; // simulated seconds per real second

/** How fast a hailstone of diameter `d` cm falls through still air (m/s): about 9 at 1 cm and 48 at 8 cm. */
export const fallSpeed = (d: number) => 9 * Math.pow(d, 0.8);

/** The updraft at height z (km) in a storm whose strongest updraft is `peak` m/s. */
export const updraft = (z: number, peak: number) => (z < BASE || z > TOP ? 0 : peak * Math.sin((Math.PI * (z - BASE)) / (TOP - BASE)));

/** Supercooled water at each height above the freezing level, as a share of the most: two wet zones and two drier ones. */
export const water = (z: number) => (z < FREEZE ? 0 : (z > 4.5 && z < 6) || (z > 7.5 && z < 9) ? 1 : 0.25);

interface Stone {
  z: number;
  d: number;
  layers: { wet: boolean; from: number }[];
  path: [number, number][];
  s: number;
  landed: boolean;
}
const seed = (): Stone => ({ z: 5, d: 0.5, layers: [], path: [], s: 0, landed: false });

export default function Hail({ onDone, active }: LabProps) {
  const stone = useRef(seed());
  const [peak, setPeak] = useState(35);
  const [, setTick] = useState(0);
  const [best, setBest] = useState<{ d: number; layers: number } | null>(null);
  useGoal(!!best && best.d >= 3 && best.layers >= 3, onDone);

  useFrame((dt) => {
    const st = stone.current;
    if (st.landed) return;
    let left = dt * SPEEDUP;
    while (left > 0) {
      const h = Math.min(1, left);
      left -= h;
      const wz = water(st.z);
      if (wz > 0) {
        // wet zones freeze slowly into clear ice; drier ones freeze fast, trapping bubbles: white ice
        const wet = wz > 0.5, last = st.layers[st.layers.length - 1];
        if (!last || last.wet !== wet) st.layers.push({ wet, from: st.d });
        st.d += 0.012 * wz * h;
      } else if (st.z < FREEZE) st.d = Math.max(0.3, st.d - 0.0015 * h);
      st.z = Math.min(TOP, st.z + ((updraft(st.z, peak) - fallSpeed(st.d)) / 1000) * h);
      st.s += h;
      if (Math.round(st.s) % 4 === 0) st.path.push([st.s, st.z]);
      if (st.z <= 0) {
        st.landed = true;
        setBest((b) => (!b || st.d > b.d ? { d: st.d, layers: st.layers.length } : b));
        break;
      }
    }
    setTick((n) => n + 1);
  }, active);

  const st = stone.current;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cw = w * 0.62, top = 8, bot = h - 14, Y = (z: number) => bot - (z / TOP) * (bot - top);
    // the cloud and its zones
    ctx.fillStyle = 'rgba(148,163,184,0.25)';
    ctx.fillRect(0, Y(TOP), cw, Y(BASE) - Y(TOP));
    for (const [a, b] of [[4.5, 6], [7.5, 9]]) {
      ctx.fillStyle = 'rgba(125,211,252,0.22)';
      ctx.fillRect(0, Y(b), cw, Y(a) - Y(b));
    }
    line(ctx, 0, Y(FREEZE), cw, Y(FREEZE), C.cool, 1, [4, 3]);
    label(ctx, '0 °C', 30, Y(FREEZE) + 8, { size: 9.5, align: 'left', color: C.cool });
    label(ctx, t('wet zone'), cw - 4, Y(5.25), { size: 9.5, align: 'right', color: '#bae6fd' });
    label(ctx, t('wet zone'), cw - 4, Y(8.25), { size: 9.5, align: 'right', color: '#bae6fd' });
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, bot, cw, h - bot);
    // the updraft, as arrows
    for (const z of [3, 6, 9]) label(ctx, '↑', 14, Y(z), { size: 10 + updraft(z, peak) / 4, color: 'rgba(255,255,255,0.45)' });
    // the stone's path so far
    const span = Math.max(600, st.s), X = (s: number) => 36 + (s / span) * (cw - 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    st.path.forEach(([s, z], i) => ctx[i ? 'lineTo' : 'moveTo'](X(s), Y(z)));
    ctx.lineTo(X(st.s), Y(Math.max(0, st.z)));
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.arc(X(st.s), Y(Math.max(0, st.z)), 2 + st.d, 0, Math.PI * 2);
    ctx.fill();
    // the stone cut in half: its layers, outermost first
    const sx = cw + (w - cw) / 2, sy = h * 0.45, R = Math.min((w - cw) / 2 - 8, h * 0.36), scale = R / Math.max(st.d, 1);
    const rings = st.layers.map((l, i) => ({ wet: l.wet, to: st.layers[i + 1]?.from ?? st.d }));
    for (let i = rings.length - 1; i >= 0; i--) {
      ctx.fillStyle = rings[i].wet ? '#bae6fd' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(sx, sy, (rings[i].to / 2) * scale * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.25)';
      ctx.stroke();
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(sx, sy, 0.25 * scale * 2, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, st.landed ? t('landed: {d} cm', { d: formatNumber(Math.round(st.d * 10) / 10) }) : t('{d} cm across', { d: formatNumber(Math.round(st.d * 10) / 10) }), sx, h - 10, { size: 10.5, color: st.landed ? C.accent : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A storm cloud with a growing hailstone, and the hailstone cut in half')} />
      <Range label={t('Updraft')} value={peak} min={10} max={60} onChange={setPeak} format={(v) => `${v} m/s`} />
      <div className="lab__row">
        <Btn
          onClick={() => {
            stone.current = seed();
            setTick((n) => n + 1);
          }}
        >
          {t('New hailstone')}
        </Btn>
        <span className="lab__note">{t('Clear rings grow in wet zones, white ones in drier air.')}</span>
      </div>
      <Readouts
        items={[
          { label: t('Layers'), value: String(st.layers.length), tone: 'accent' },
          { label: t('Falls at'), value: `${formatNumber(Math.round(fallSpeed(st.d)))} m/s` },
          { label: t('Biggest landed'), value: best ? `${formatNumber(Math.round(best.d * 10) / 10)} cm` : '–', tone: best && best.d >= 3 ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
