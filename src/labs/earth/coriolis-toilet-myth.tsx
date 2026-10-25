import { useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const OMEGA = 7.292e-5; // Earth's spin, radians per second

/**
 * The Rossby number: how strong a swirl's own motion is compared with the Coriolis effect, U / (f L) with
 * f = 2Ω sin(latitude). Far above 1, Earth's spin hardly matters; around 1 or below, it steers the swirl.
 */
export const rossby = (speed: number, size: number, latitude: number) => speed / (2 * OMEGA * Math.abs(Math.sin((latitude * Math.PI) / 180)) * size);

/** Sizes from 10 cm to 1,000 km on a log slider. */
const size = (v: number) => Math.pow(10, -1 + (v / 100) * 7);

export default function Coriolis({ onDone, active }: LabProps) {
  const [s, setS] = useState(10); // a toilet bowl, about 0.5 m
  const [lat, setLat] = useState(45);
  const [spin, setSpin] = useState(0);
  const L = size(s), U = L < 5 ? 1 : L < 1e4 ? 3 : 30; // rough flow speeds: drains about 1 m/s, weather tens of m/s
  const ro = rossby(U, L, lat);
  const earthWins = ro < 1;
  useGoal(earthWins, onDone);
  useFrame((dt) => setSpin((a) => a + dt), active);

  // Direction: Earth's spin makes lows turn anticlockwise in the north, clockwise in the south; a small swirl
  // follows whatever the shape of the bowl or the last stir gave it (shown here clockwise).
  const dir = earthWins ? (lat >= 0 ? -1 : 1) : 1;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 18;
    ctx.fillStyle = earthWins ? 'rgba(255,255,255,0.08)' : 'rgba(125,211,252,0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    for (let arm = 0; arm < 3; arm++) {
      ctx.strokeStyle = earthWins ? 'rgba(255,255,255,0.75)' : C.cool;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const f = k / 60, a = dir * (spin * 1.6 + arm * ((2 * Math.PI) / 3) + f * 4.5);
        const rr = r * (1 - f * 0.92);
        ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.stroke();
    }
    label(ctx, earthWins ? (lat >= 0 ? t('anticlockwise: set by Earth’s spin') : t('clockwise: set by Earth’s spin')) : t('either way: set by the bowl and the flush'), cx, h - 9, { size: 11.5, color: C.ink });
  };

  const show = (m: number) => (m < 1 ? `${formatNumber(Math.round(m * 100))} cm` : m < 1000 ? `${formatNumber(Math.round(m))} m` : `${formatNumber(Math.round(m / 1000))} km`);
  const presets: [string, number][] = [
    [t('Toilet'), 10],
    [t('Bathtub'), 15],
    [t('Tornado'), 49],
    [t('Hurricane'), 95],
  ];
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A swirl {s} across: which way it turns', { s: show(L) })} />
      <Range label={t('Size')} value={s} min={0} max={100} onChange={setS} format={(v) => show(size(v))} />
      <Range label={t('Latitude')} value={lat} min={-80} max={80} onChange={setLat} format={(v) => (v === 0 ? '0°' : `${Math.abs(v)}° ${v > 0 ? 'N' : 'S'}`)} />
      <div className="lab__row">
        {presets.map(([name, v]) => (
          <Btn key={name} ghost onClick={() => setS(v)}>
            {name}
          </Btn>
        ))}
      </div>
      <Readouts
        items={[
          { label: t('Typical flow speed'), value: `${U} m/s` },
          { label: t('Its own motion vs Earth’s spin'), value: !Number.isFinite(ro) ? t('no pull at the equator') : ro >= 1 ? t('{n} to 1', { n: formatNumber(Math.round(ro)) }) : t('Earth wins'), tone: earthWins ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
