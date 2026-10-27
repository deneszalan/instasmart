import { useMemo, useState } from 'react';
import { Btn, C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Domenico Fontana's 40 capstans (Della trasportatione dell’obelisco vaticano, 1590). */
export const ROPES = 40;
/** On 30 April 1586 the obelisk rose 2¾ palms, enough to slide the sledge under it. */
export const TARGET = 2.75;
/**
 * The model, simplified: each rope stretches a little, so its pull is K × (rope wound in − its starting slack − the
 * lift), in units of what one team can turn. The obelisk rises once the ropes together hold NEED, here 80% of what all
 * 40 teams can turn (the levers and wedges are left out). A move is TURNS small turns of STEP palms.
 */
export const K = 8, NEED = 0.8 * ROPES, STEP = 0.01, TURNS = 26;
/** In "snap" mode teams can pull 1.6 but a rope breaks above 1: what Fontana's critics feared. */
export const STRONG_TEAM = 1.6;

export type Mode = 'stop' | 'snap';
export interface RunState { wound: number[]; broken: boolean[]; h: number; pull: number[] }

function rnd(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** How slack each rope starts, in palms: up to 0.6 palms when `uneven` is 1. */
export const slacks = (uneven: number, seed = 7) => {
  const r = rnd(seed);
  return Array.from({ length: ROPES }, () => r() * 0.6 * uneven);
};

/** The lift for ropes stretched by `e` (null = snapped): zero until they can hold NEED together. */
export function liftFor(e: (number | null)[]) {
  const pull = (h: number) => e.reduce<number>((s, x) => (x === null ? s : s + K * Math.max(0, x - h)), 0);
  if (pull(0) <= NEED) return 0;
  let lo = 0, hi = 10;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (pull(m) > NEED) lo = m;
    else hi = m;
  }
  return lo;
}

function settle(wound: number[], broken: boolean[], slack: number[]): RunState {
  const e = wound.map((w, i) => (broken[i] ? null : w - slack[i]));
  const h = liftFor(e);
  return { wound, broken, h, pull: e.map((x) => (x === null ? 0 : K * Math.max(0, x - h))) };
}

export const start = (slack: number[]): RunState => settle(new Array(ROPES).fill(0), new Array(ROPES).fill(false), slack);

/** One move: every capstan that still can turns, a little at a time; in snap mode overloaded ropes break. */
export function move(s0: RunState, slack: number[], mode: Mode): RunState {
  let s = s0;
  const limit = mode === 'snap' ? STRONG_TEAM : 1;
  for (let n = 0; n < TURNS; n++) {
    const wound = s.wound.slice(), broken = s.broken.slice();
    for (let i = 0; i < ROPES; i++) {
      if (broken[i]) continue;
      const room = (limit - s.pull[i]) / K;
      if (room > 0) wound[i] += Math.min(STEP, room);
    }
    s = settle(wound, broken, slack);
    if (mode === 'snap') {
      for (;;) {
        const over = s.pull.findIndex((p, i) => !s.broken[i] && p > 1);
        if (over < 0) break;
        const b = s.broken.slice();
        b[over] = true;
        s = settle(s.wound, b, slack);
      }
    }
  }
  return s;
}

export default function ObeliskCapstans({ onDone }: LabProps) {
  const [uneven, setUneven] = useState(20);
  const [mode, setMode] = useState<Mode>('snap');
  const slack = useMemo(() => slacks(uneven / 100), [uneven]);
  const [run, setRun] = useState<{ s: RunState; moves: number }>(() => ({ s: start(slacks(0.2)), moves: 0 }));
  const reset = (u = uneven) => setRun({ s: start(slacks(u / 100)), moves: 0 });
  const { s, moves } = run;
  const snapped = s.broken.filter(Boolean).length;
  const heaviest = Math.max(...s.pull);
  const stuck = moves > 0 && ROPES - snapped < NEED;
  useGoal(uneven >= 50 && s.h >= TARGET && snapped === 0, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const gaugeW = 46;
    label(ctx, t('Move {n} · pull on each of the 40 ropes', { n: formatNumber(moves) }), 8, 12, { size: 10, align: 'left', color: C.soft });
    // bars: the pull on each rope
    const bx = 8, bw = (w - gaugeW - 16) / ROPES, by = h - 14, bh = (h - 60) / 1.6;
    for (let i = 0; i < ROPES; i++) {
      if (s.broken[i]) {
        label(ctx, '×', bx + i * bw + bw / 2, by - 6, { size: 10, color: C.bad });
        continue;
      }
      const p = Math.min(1.6, s.pull[i]);
      ctx.fillStyle = p >= 0.995 && mode === 'stop' ? C.cool : C.accent;
      ctx.fillRect(bx + i * bw + 1, by - p * bh, Math.max(1, bw - 2), p * bh);
    }
    line(ctx, bx, by - bh, bx + ROPES * bw, by - bh, mode === 'stop' ? C.cool : C.bad, 1.5, [5, 4]);
    label(ctx, mode === 'stop' ? t('most a team can turn') : t('a rope snaps here'), bx, by - bh - 9, { size: 10, align: 'left', color: mode === 'stop' ? C.cool : C.bad });
    line(ctx, bx, by, bx + ROPES * bw, by, C.faint, 1);
    // the lift gauge
    const gx = w - gaugeW / 2 - 4, g0 = h - 18, g1 = 14, gy = (v: number) => g0 - (v / 3) * (g0 - g1);
    line(ctx, gx, g0, gx, g1, C.faint, 6);
    line(ctx, gx, g0, gx, gy(Math.min(3, s.h)), s.h >= TARGET ? C.good : C.ink, 6);
    line(ctx, gx - 12, gy(TARGET), gx + 12, gy(TARGET), C.good, 1.5);
    label(ctx, '2¾', gx, gy(TARGET) - 9, { size: 10, color: C.good });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Forty ropes from the timber tower to the capstans, with the pull on each and the obelisk’s lift')} />
      <Range label={t('How unevenly the ropes start')} value={uneven} min={0} max={100} step={5} onChange={(v) => { setUneven(v); reset(v); }} format={(v) => `${formatNumber(v)}%`} />
      <Choice
        label={t('When a rope is overloaded')}
        options={[
          { value: 'snap', label: t('It snaps (the critics’ fear)') },
          { value: 'stop', label: t('Its capstan stops (Fontana)') },
        ]}
        value={mode}
        onChange={(m) => { setMode(m); reset(); }}
      />
      <div className="lab__row">
        <Btn onClick={() => setRun({ s: move(s, slack, mode), moves: moves + 1 })} disabled={stuck || s.h >= 3}>{t('Trumpet: turn')}</Btn>
        <Btn ghost onClick={() => reset()}>{t('Start again')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Lift of the obelisk'), value: t('{n} palms', { n: formatNumber(Math.round(s.h * 100) / 100) }), tone: s.h >= TARGET ? 'good' : undefined },
          { label: t('Ropes snapped'), value: formatNumber(snapped), tone: snapped ? 'bad' : undefined },
          { label: t('Heaviest rope'), value: t('{n}% of a team’s pull', { n: formatNumber(Math.round(heaviest * 100)) }) },
        ]}
      />
      {stuck && <p className="lab__note">{t('Too many ropes have snapped: the rest cannot hold the obelisk.')}</p>}
      <p className="lab__note">{t('Simplified model: 40 ropes that stretch a little; together they must hold 80% of what all 40 teams can turn before the obelisk rises. Levers and wedges are left out.')}</p>
    </div>
  );
}
