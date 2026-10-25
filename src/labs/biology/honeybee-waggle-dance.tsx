import { useRef, useState } from 'react';
import { Btn, C, Choice, dot, label, line, Range, Readouts, Stage, useFrame, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const MAP_KM = 3; // the map's radius
const SECONDS_PER_KM = 1; // this lab's scale for the waggle run; real bees differ between colonies and landscapes

/** The dance for food at compass bearing `food` (degrees), with the Sun at bearing `sun`: the waggle run's angle clockwise from straight up the comb. */
export const danceAngle = (food: number, sun: number) => (((food - sun) % 360) + 360) % 360;

/** Reading it back: the food's bearing from the run's angle and the Sun's bearing. */
export const foodBearing = (angle: number, sun: number) => (((angle + sun) % 360) + 360) % 360;

const rad = (d: number) => (d * Math.PI) / 180;
const compass = (d: number) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(d / 45) % 8];

export default function WaggleDance({ onDone, active }: LabProps) {
  const [mode, setMode] = useState<'hide' | 'read'>('hide');
  const [sun, setSun] = useState(135);
  const [food, setFood] = useState<{ b: number; km: number }>({ b: 175, km: 1.2 });
  const [guess, setGuess] = useState<{ b: number; km: number } | null>(null);
  const [solved, setSolved] = useState(0);
  const [right, setRight] = useState(false);
  const [time, setTime] = useState(0);
  const geom = useRef({ mx: 0, my: 0, mr: 1 });
  useGoal(solved > 0, onDone);
  useFrame((dt) => setTime((s) => s + dt), active);

  const angle = danceAngle(food.b, sun), waggle = Math.max(0.25, food.km * SECONDS_PER_KM);
  const onPointer = (p: StagePointer) => {
    const { mx, my, mr } = geom.current, dx = p.x - mx, dy = p.y - my, r = Math.hypot(dx, dy);
    if (r > mr * 1.05) return;
    const spot = { b: ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360, km: Math.min(MAP_KM, Math.max(0.1, (r / mr) * MAP_KM)) };
    if (mode === 'hide') setFood(spot);
    else if (p.kind === 'up' && !guess) {
      setGuess(spot);
      const off = Math.abs(((spot.b - food.b + 540) % 360) - 180);
      const ok = off <= 20 && Math.abs(spot.km - food.km) <= food.km * 0.35;
      setRight(ok);
      if (ok) setSolved((n) => n + 1);
    }
  };
  const newDance = () => {
    setFood({ b: Math.floor(Math.random() * 360), km: 0.4 + Math.random() * 2.4 });
    setSun(60 + Math.floor(Math.random() * 240));
    setGuess(null);
  };
  const pickMode = (m: 'hide' | 'read') => {
    setMode(m);
    if (m === 'read') newDance();
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the map, north up, with the hive in the middle
    const mr = Math.min(w * 0.24, h / 2 - 14), mx = mr + 12, my = h / 2 + 4;
    geom.current = { mx, my, mr };
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    for (const k of [1, 2]) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(mx, my, (mr * k) / MAP_KM, 0, Math.PI * 2);
      ctx.stroke();
    }
    label(ctx, 'N', mx, my - mr - 7, { size: 10 });
    const at = (b: number, km: number): [number, number] => [mx + Math.sin(rad(b)) * (km / MAP_KM) * mr, my - Math.cos(rad(b)) * (km / MAP_KM) * mr];
    const [sx, sy] = at(sun, MAP_KM * 1.02);
    ctx.shadowColor = C.accent;
    ctx.shadowBlur = 12;
    dot(ctx, sx, sy, 7, C.accent);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(mx - 5, my - 5, 10, 10);
    if (mode === 'hide' || guess) {
      const [fx, fy] = at(food.b, food.km);
      label(ctx, '🌼', fx, fy, { size: 16 });
      line(ctx, mx, my, fx, fy, 'rgba(255,255,255,0.45)', 1.5, [3, 3]);
    }
    if (guess) {
      const [gx, gy] = at(guess.b, guess.km);
      label(ctx, '✕', gx, gy, { size: 14, color: right ? C.good : C.bad });
    }
    // the comb: up stands for the Sun
    const cx0 = mx + mr + 18, cw = w - cx0 - 8, ccx = cx0 + cw / 2, ccy = h / 2 + 6;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx0, 4, cw, h - 8);
    ctx.clip();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx0, 4, cw, h - 8);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    const hex = 9;
    for (let y = 4, r = 0; y < h; y += hex * 1.5, r++)
      for (let x = cx0 + (r % 2 ? hex * 0.87 : 0); x < cx0 + cw; x += hex * 1.73) {
        ctx.beginPath();
        for (let k = 0; k < 6; k++) ctx.lineTo(x + Math.cos(rad(60 * k + 30)) * hex, y + Math.sin(rad(60 * k + 30)) * hex);
        ctx.closePath();
        ctx.stroke();
      }
    ctx.restore();
    line(ctx, ccx, ccy - 6, ccx, 20, 'rgba(255,255,255,0.5)', 1.5, [3, 3]);
    label(ctx, t('up = the Sun'), ccx, 12, { size: 10, color: C.ink });
    // the bee: a straight waggle run along the dance angle, then a loop back, alternately left and right
    const L = Math.min(cw * 0.42, h * 0.3), cycle = waggle + 1.2, ph = time % (2 * cycle), round = ph < cycle ? 0 : 1, s = ph % cycle;
    const dir = rad(angle), ux = Math.sin(dir), uy = -Math.cos(dir);
    const x0 = ccx - (ux * L) / 2, y0 = ccy - (uy * L) / 2;
    let bx: number, by: number, heading: number, waggling = false;
    if (s < waggle) {
      const f = s / waggle;
      bx = x0 + ux * L * f + -uy * Math.sin(s * 60) * 2.5;
      by = y0 + uy * L * f + ux * Math.sin(s * 60) * 2.5;
      heading = dir;
      waggling = true;
    } else {
      const f = (s - waggle) / 1.2, side = round ? 1 : -1, a = Math.PI * f;
      const mx2 = (x0 + x0 + ux * L) / 2, my2 = (y0 + y0 + uy * L) / 2;
      bx = mx2 + ux * (L / 2) * Math.cos(a) + side * -uy * (L / 2) * Math.sin(a);
      by = my2 + uy * (L / 2) * Math.cos(a) + side * ux * (L / 2) * Math.sin(a);
      heading = dir + Math.PI + side * (Math.PI / 2 - a);
    }
    line(ctx, x0, y0, x0 + ux * L, y0 + uy * L, 'rgba(255,255,255,0.3)', 3);
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(heading);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    for (const y of [-1, 2.5, 6]) ctx.fillRect(-4, y, 8, 1.6);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(-5, -2, 4, 2.2, -0.5, 0, Math.PI * 2);
    ctx.ellipse(5, -2, 4, 2.2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (waggling) label(ctx, t('waggle!'), ccx, h - 12, { size: 10.5, color: C.ink });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Mode')}
        value={mode}
        onChange={pickMode}
        options={[
          { value: 'hide', label: t('You place the flowers') },
          { value: 'read', label: t('You read the dance') },
        ]}
      />
      <Stage draw={draw} onPointer={onPointer} label={t('A map with the hive, the Sun and the flowers, and a bee dancing on the comb at {a} degrees', { a: Math.round(angle) })} />
      {mode === 'hide' ? (
        <Range label={t('Sun’s direction')} value={sun} min={60} max={300} step={5} onChange={setSun} format={(v) => `${compass(v)} ${v}°`} />
      ) : (
        <div className="lab__row">
          <span className="lab__note">{guess ? (right ? t('Found it!') : t('Not quite: the flowers are shown.')) : t('Tap the map where the flowers are. Here each second of waggling means 1 km.')}</span>
          <Btn ghost onClick={newDance}>
            {t('New dance')}
          </Btn>
        </div>
      )}
      <Readouts
        items={[
          { label: t('Run, clockwise from up'), value: mode === 'hide' || guess ? `${Math.round(angle)}°` : '?' },
          { label: t('Waggling lasts'), value: mode === 'hide' || guess ? `${formatNumber(Math.round(waggle * 10) / 10)} s` : '?', tone: 'accent' },
          { label: t('Flowers'), value: mode === 'hide' || guess ? `${formatNumber(Math.round(food.km * 10) / 10)} km ${compass(food.b)}` : '?' },
        ]}
      />
    </div>
  );
}
