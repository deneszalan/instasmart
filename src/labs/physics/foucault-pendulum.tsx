import { useState } from 'react';
import { Btn, C, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** One sidereal day, in hours: how long Earth takes to turn once relative to the stars. */
const SIDEREAL = 23.934;

/** Degrees per hour that the swing plane turns at a latitude (positive: clockwise seen from above, in the north). */
export const turnRate = (latitude: number) => (360 / SIDEREAL) * Math.sin((latitude * Math.PI) / 180);


export default function Foucault({ onDone, active }: LabProps) {
  const [lat, setLat] = useState(48.85);
  const [hours, setHours] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [swing, setSwing] = useState(0);
  const [watched, setWatched] = useState(0);
  // Time-lapse: two hours of turning every second; the bob's own swing is shown slowed right down.
  useFrame((dt) => {
    setHours((h) => h + dt * 2);
    setSwing((s) => s + dt * 2.2);
    if (Math.abs(lat) < 1) setWatched((w) => w + dt);
  }, active && playing);
  useGoal(watched > 2, onDone);

  const places: [string, number][] = [
    [t('North Pole'), 90],
    [t('Paris'), 48.85],
    [t('Equator'), 0],
    [t('Sydney'), -33.87],
  ];
  const rate = turnRate(lat), angle = -(rate * hours * Math.PI) / 180;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 14;
    // the floor dial
    ctx.fillStyle = 'rgba(253,230,138,0.12)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    for (let d = 0; d < 360; d += 15) {
      const a = (d * Math.PI) / 180, long = d % 90 === 0;
      line(ctx, cx + Math.cos(a) * (r - (long ? 12 : 6)), cy + Math.sin(a) * (r - (long ? 12 : 6)), cx + Math.cos(a) * r, cy + Math.sin(a) * r, C.faint, long ? 2 : 1);
    }
    label(ctx, 'N', cx, cy - r + 20, { size: 11 });
    // where the swing started, and the line it swings along now (it turns; the floor seems still)
    line(ctx, cx, cy - r + 26, cx, cy + r - 26, C.line, 2, [5, 5]);
    const dx = Math.sin(angle) * (r - 22), dy = -Math.cos(angle) * (r - 22);
    line(ctx, cx - dx, cy - dy, cx + dx, cy + dy, C.accent, 2.5);
    const k = Math.sin(swing);
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.arc(cx + dx * k, cy + dy * k, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, t('{h} h', { h: formatNumber(Math.floor(hours)) }), w - 12, 14, { size: 12, align: 'right', color: C.ink });
  };

  const fullTurn = Math.abs(rate) < 0.01 ? t('never') : t('{h} hours', { h: formatNumber(Math.round((360 / Math.abs(rate)) * 10) / 10) });
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Top view of the pendulum’s swing line turning over the floor')} />
      <Range label={t('Latitude')} value={lat} min={-90} max={90} step={0.5} onChange={(v) => { setLat(v); setHours(0); }} format={(v) => (v === 0 ? '0°' : `${formatNumber(Math.abs(v))}° ${v > 0 ? 'N' : 'S'}`)} />
      <div className="lab__row">
        {places.map(([name, v]) => (
          <Btn key={name} ghost onClick={() => { setLat(v); setHours(0); }}>
            {name}
          </Btn>
        ))}
        <Btn onClick={() => setPlaying((p) => !p)}>{playing ? t('Pause') : t('Play')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Turns per hour'), value: `${formatNumber(Math.round(Math.abs(rate) * 10) / 10)}°` },
          { label: t('Full circle'), value: fullTurn, tone: 'accent' },
          { label: t('Direction'), value: Math.abs(rate) < 0.01 ? '–' : rate > 0 ? t('clockwise') : t('anticlockwise') },
        ]}
      />
    </div>
  );
}
