import { useRef, useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useFrame, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Dye = 'Y' | 'M' | 'B';
/** How far each of this lab's three dyes climbs compared with the solvent (its Rf). */
export const RF: Record<Dye, number> = { Y: 0.8, M: 0.5, B: 0.2 };
const COLOUR: Record<Dye, string> = { Y: '#facc15', M: '#e11d8c', B: '#2563eb' };
const START = 1.5, TOP = 11; // cm up the paper: the pencil line, and as far as the solvent gets

/** The solvent front after `s` seconds: fast at first, then slower as it climbs (cm). */
export const front = (s: number) => Math.min(TOP, 1 + 10 * Math.sqrt(Math.max(0, s) / 14));

/** Where a dye is when the front is at `f`: it covers its Rf share of the solvent's climb from the pencil line. */
export const spot = (dye: Dye, f: number) => START + RF[dye] * Math.max(0, f - START);

const MIXES: Dye[][] = [['Y', 'M'], ['Y', 'B'], ['M', 'B'], ['Y', 'M', 'B']];

export default function Chromatography({ onDone, active }: LabProps) {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [mystery, setMystery] = useState<Dye[]>(() => MIXES[Math.floor(Math.random() * MIXES.length)]);
  const [guess, setGuess] = useState(new Set<Dye>());
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<{ strip: number; dye: Dye } | null>(null);
  const geom = useRef({ x0: 0, sw: 1, gap: 1, Y: (cm: number) => cm });
  useGoal(verdict === true, onDone);
  useFrame((dt) => setTime((s) => s + dt), active && running);
  const f = front(time);

  const strips: Dye[][] = [['Y'], ['M'], ['B'], mystery];
  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const { x0, sw, gap, Y } = geom.current, k = Math.floor((p.x - x0) / (sw + gap));
    if (k < 0 || k > 3 || p.x - x0 - k * (sw + gap) > sw) return;
    let best: Dye | null = null, dist = 18;
    for (const d of strips[k]) {
      const dd = Math.abs(Y(spot(d, f)) - p.y);
      if (dd < dist) [best, dist] = [d, dd];
    }
    if (best) setPicked({ strip: k, dye: best });
  };

  const again = () => {
    setTime(0);
    setRunning(false);
    setMystery(MIXES[Math.floor(Math.random() * MIXES.length)]);
    setGuess(new Set());
    setVerdict(null);
    setPicked(null);
  };
  const toggle = (d: Dye) => {
    setVerdict(null);
    setGuess((g) => {
      const n = new Set(g);
      if (n.has(d)) n.delete(d);
      else n.add(d);
      return n;
    });
  };
  const check = () => setVerdict(guess.size === mystery.length && mystery.every((d) => guess.has(d)));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const top = 18, bot = h - 8, Y = (cm: number) => bot - (cm / 12) * (bot - top);
    const gap = Math.min(18, w * 0.04), sw = Math.min(56, (w - 40 - 3 * gap) / 4), x0 = (w - (4 * sw + 3 * gap)) / 2;
    geom.current = { x0, sw, gap, Y };
    // the solvent in the beaker
    ctx.fillStyle = 'rgba(147,197,253,0.3)';
    ctx.fillRect(x0 - 12, Y(1), 4 * sw + 3 * gap + 24, bot - Y(1));
    const names = [t('yellow'), t('magenta'), t('blue'), t('mystery')];
    strips.forEach((dyes, k) => {
      const x = x0 + k * (sw + gap);
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(x, Y(12), sw, bot - Y(12));
      ctx.fillStyle = 'rgba(148,163,184,0.25)';
      ctx.fillRect(x, Y(f), sw, Y(0) - Y(f));
      line(ctx, x + 3, Y(START), x + sw - 3, Y(START), '#78716c', 1);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      for (const d of dyes) {
        const y = Y(spot(d, f)), spread = 4 + (spot(d, f) - START) * 1.3;
        const g = ctx.createRadialGradient(x + sw / 2, y, 0, x + sw / 2, y, spread * 1.6);
        g.addColorStop(0, COLOUR[d]);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x + sw / 2, y, sw * 0.32, spread, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      if (picked?.strip === k) {
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 2, Y(spot(picked.dye, f)) - 9, sw + 4, 18);
      }
      label(ctx, names[k], x + sw / 2, 8, { size: 10, color: k === 3 ? C.accent : C.soft });
    });
    line(ctx, x0 - 12, Y(f), x0 + 4 * sw + 3 * gap + 12, Y(f), 'rgba(147,197,253,0.8)', 1, [3, 3]);
  };

  const rf = picked && f > START + 0.3 ? (spot(picked.dye, f) - START) / (f - START) : null;
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Four strips of paper in a solvent: three single dyes and a mystery ink')} />
      <div className="lab__row">
        <Btn onClick={() => setRunning((r) => !r)} disabled={f >= TOP}>
          {running && f < TOP ? t('Pause') : time ? t('Go on') : t('Dip the paper')}
        </Btn>
        <Btn ghost onClick={again}>
          {t('New mystery')}
        </Btn>
      </div>
      <div className="lab__row">
        <span className="lab__note">{t('Mystery:')}</span>
        {(['Y', 'M', 'B'] as Dye[]).map((d) => (
          <Btn key={d} ghost={!guess.has(d)} onClick={() => toggle(d)} label={d === 'Y' ? t('yellow') : d === 'M' ? t('magenta') : t('blue')}>
            <span className="lab__swatch" style={{ background: COLOUR[d] }} />
            {d}
          </Btn>
        ))}
        <Btn onClick={check} disabled={!guess.size}>
          {t('Check')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Tapped band’s Rf'), value: rf === null ? t('tap a band') : formatNumber(Math.round(rf * 100) / 100), tone: 'accent' },
          { label: t('Your answer'), value: verdict === null ? '–' : verdict ? t('right') : t('not yet'), tone: verdict ? 'good' : verdict === false ? 'bad' : undefined },
        ]}
      />
    </div>
  );
}
