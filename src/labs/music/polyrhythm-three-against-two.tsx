import { useEffect, useRef, useState } from 'react';
import { Btn, C, Choice, dot, label, Range, Readouts, Stage, useAudio, useFrame, useGoal, pluck, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

type Pair = '3:2' | '4:3' | '5:4';
const PAIRS: Record<Pair, [number, number]> = { '3:2': [3, 2], '4:3': [4, 3], '5:4': [5, 4] };

/** The grid both rhythms fit on (their lowest common multiple), and the steps each one plays, counting from 0. */
export function grid(a: number, b: number) {
  const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
  const steps = (a * b) / gcd(a, b);
  const hits = (n: number) => Array.from({ length: n }, (_, k) => (k * steps) / n);
  return { steps, a: hits(a), b: hits(b) };
}

const TOLERANCE = 0.12; // seconds either side of a beat that still counts as on time

export default function Polyrhythm({ onDone, active }: LabProps) {
  const [pair, setPair] = useState<Pair>('3:2');
  const [cycle, setCycle] = useState(2.4);
  const [mode, setMode] = useState<'both' | 'tap'>('both');
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const [streak, setStreak] = useState(0);
  const [last, setLast] = useState<number | null>(null); // error of the last tap, seconds
  const [heard, setHeard] = useState<Record<string, number>>({});
  const audio = useAudio(active);
  const clock = useRef<{ ac: AudioContext | null; start: number; until: number; cycles: number }>({ ac: null, start: 0, until: 0, cycles: 0 });
  const [a, b] = PAIRS[pair];
  const g = grid(a, b);
  useGoal(streak >= 4 || ((heard['3:2'] ?? 0) >= 2 && Object.entries(heard).some(([p, n]) => p !== '3:2' && n >= 2)), onDone);

  const now = () => (clock.current.ac ? clock.current.ac.currentTime : performance.now() / 1000);

  const start = () => {
    const ac = audio();
    clock.current = { ac, start: (ac ? ac.currentTime : performance.now() / 1000) + 0.15, until: 0, cycles: 0 };
    clock.current.until = clock.current.start;
    setStreak(0);
    setLast(null);
    setPlaying(true);
  };
  useEffect(() => {
    if (playing) start();
  }, [pair, cycle, mode]);
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  // Each frame, schedule the next notes a little ahead, so the timing comes from the audio clock, not the screen.
  useFrame(() => {
    const c = clock.current, tNow = now(), step = cycle / g.steps;
    setPhase((((tNow - c.start) / cycle) % 1 + 1) % 1);
    const done = Math.floor((tNow - c.start) / cycle);
    if (done > c.cycles) {
      c.cycles = done;
      if (mode === 'both') setHeard((h) => ({ ...h, [pair]: (h[pair] ?? 0) + 1 }));
    }
    if (!c.ac) return;
    const ahead = tNow + 0.15;
    for (let k = Math.ceil((c.until - c.start) / step - 1e-9); c.start + k * step < ahead; k++) {
      const when = c.start + k * step, s = ((k % g.steps) + g.steps) % g.steps;
      if (when < tNow) continue;
      if (g.a.includes(s)) pluck(c.ac, 880, when, { length: 0.14, gain: 0.12 });
      if (mode === 'both' && g.b.includes(s)) pluck(c.ac, 196, when, { length: 0.3, type: 'sine', gain: 0.35 });
      c.until = when + step / 2;
    }
  }, active && playing);

  const tap = () => {
    const c = clock.current, ac = c.ac;
    if (ac) pluck(ac, 196, ac.currentTime, { length: 0.3, type: 'sine', gain: 0.35 });
    if (!playing) return;
    // compare with the nearest beat of the slower rhythm, allowing for the time the sound takes to come out
    const heardAt = now() - (ac?.outputLatency ?? 0), every = cycle / b;
    const k = Math.round((heardAt - c.start) / every), err = heardAt - (c.start + k * every);
    setLast(err);
    setStreak((n) => (Math.abs(err) <= TOLERANCE ? n + 1 : 0));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const gridH = 54, cx = w / 2, cy = (h - gridH) / 2 + 4, r = Math.max(20, Math.min(w, h - gridH) / 2 - 18);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    const at = (f: number, rr: number): [number, number] => [cx + Math.sin(f * 2 * Math.PI) * rr, cy - Math.cos(f * 2 * Math.PI) * rr];
    const flash = (f: number) => playing && ((phase - f + 1) % 1) < 0.07;
    const poly = (n: number, rr: number, color: string, show: boolean) => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = show ? 0.5 : 0.18;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let k = 0; k <= n; k++) ctx[k ? 'lineTo' : 'moveTo'](...at(k / n, rr));
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (let k = 0; k < n; k++) {
        const [x, y] = at(k / n, rr), lit = flash(k / n);
        dot(ctx, x, y, lit ? 10 : 6, show ? color : C.faint);
      }
    };
    poly(a, r, '#fb7185', true);
    poly(b, r * 0.62, C.cool, mode === 'both');
    const [hx, hy] = at(phase, r + 10);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    // the grid of equal steps underneath
    const L = 10, R = w - 10, cw = (R - L) / g.steps, y0 = h - gridH + 6, cur = Math.floor(phase * g.steps);
    for (let s = 0; s < g.steps; s++) {
      const x = L + s * cw;
      if (playing && s === cur) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x, y0 - 4, cw, gridH - 6);
      }
      label(ctx, String(s + 1), x + cw / 2, y0 + 3, { size: g.steps > 12 ? 8.5 : 10, color: C.faint });
      if (g.a.includes(s)) dot(ctx, x + cw / 2, y0 + 19, Math.min(6, cw / 2 - 1), '#fb7185');
      if (g.b.includes(s)) dot(ctx, x + cw / 2, y0 + 36, Math.min(6, cw / 2 - 1), mode === 'both' ? C.cool : C.faint);
    }
  };

  const err = last === null ? '–' : Math.abs(last) <= TOLERANCE ? t('on time') : last < 0 ? t('{ms} ms early', { ms: Math.round(-last * 1000) }) : t('{ms} ms late', { ms: Math.round(last * 1000) });
  return (
    <div className="lab">
      <div className="lab__row">
        <Choice label={t('Rhythms')} value={pair} onChange={setPair} options={(Object.keys(PAIRS) as Pair[]).map((p) => ({ value: p, label: p.replace(':', ' : ') }))} />
        <Choice
          label={t('Who plays')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'both', label: t('Lab plays both') },
            { value: 'tap', label: t('You tap') },
          ]}
        />
      </div>
      <Stage draw={draw} label={t('{a} beats against {b} on a circle and a grid of {n} steps', { a, b, n: g.steps })} />
      <Range label={t('One cycle')} value={cycle} min={1.2} max={4} step={0.1} onChange={setCycle} format={(v) => `${formatNumber(v)} s`} />
      <div className="lab__row">
        <Btn onClick={() => (playing ? setPlaying(false) : start())}>{playing ? t('Stop') : t('Play')}</Btn>
        {mode === 'tap' ? (
          <button className="lab__btn lab__pad" onPointerDown={tap}>
            {t('Tap the {b}', { b })}
          </button>
        ) : (
          <span className="lab__note">{t('Pink: {a} a cycle. Blue: {b}.', { a, b })}</span>
        )}
      </div>
      {mode === 'tap' && (
        <Readouts
          items={[
            { label: t('Last tap'), value: err, tone: last !== null && Math.abs(last) <= TOLERANCE ? 'good' : undefined },
            { label: t('On time in a row'), value: String(streak), tone: streak >= 4 ? 'good' : 'accent' },
          ]}
        />
      )}
    </div>
  );
}
