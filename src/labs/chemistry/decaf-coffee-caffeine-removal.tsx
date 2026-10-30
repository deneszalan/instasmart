import { useState } from 'react';
import { C, Choice, dot, font, label, Range, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Liquid = 'water' | 'extract' | 'solvent';

/** The US coffee industry says decaffeination removes about 97% of the caffeine (National Coffee Association). */
export const GOAL_REMOVED = 97;
/** The lab's own goal for the flavour left in the beans, in percent. */
export const GOAL_FLAVOUR = 90;
export const MAX_ROUNDS = 8;

export interface Soak {
  /** Shares of the bean's caffeine and flavour still in it, 0–1. */
  caffeine: number;
  flavour: number;
  /** What the liquid holds now, as shares of the bean's starting amounts. */
  liquidCaffeine: number;
  liquidFlavour: number;
  /** Caffeine taken out of the liquid so far. */
  caught: number;
}

/**
 * A toy model of soaking green beans. In each round the beans and an equal amount of liquid share evenly every
 * substance that dissolves in the liquid; then, if `clean`, the caffeine is taken out of the liquid (carbon filters
 * for water and the extract, recovery for a solvent). Hot water dissolves caffeine and flavour; the Swiss Water
 * Process's green coffee extract starts as full of flavour as the beans, so no flavour moves; the solvent is
 * idealised to take caffeine only.
 */
export function soak(liquid: Liquid, clean: boolean, rounds: number): Soak {
  let c = 1, f = 1, lc = 0, lf = liquid === 'extract' ? 1 : 0, caught = 0;
  const takesFlavour = liquid !== 'solvent';
  for (let i = 0; i < rounds; i++) {
    c = lc = (c + lc) / 2;
    if (takesFlavour) f = lf = (f + lf) / 2;
    if (clean) {
      caught += lc;
      lc = 0;
    }
  }
  return { caffeine: c, flavour: f, liquidCaffeine: lc, liquidFlavour: lf, caught };
}

export const removedPercent = (s: Soak) => (1 - s.caffeine) * 100;
export const isDecaf = (s: Soak) => removedPercent(s) >= GOAL_REMOVED && s.flavour * 100 >= GOAL_FLAVOUR - 1e-9;

const GOLD = '#f4b83f', ROSE = '#ee7393', BEAN = '#a9bb8b', BEAN_LO = '#7f9364';
const TINT: Record<Liquid, string> = { water: 'rgba(134,205,240,0.28)', extract: 'rgba(201,168,74,0.42)', solvent: 'rgba(96,158,236,0.42)' };
/** Molecules drawn of each kind when the bean is full. */
const N = 12;
const one = (v: number) => formatNumber(Math.floor(v * 10) / 10);

function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    if (i) ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    else ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

/** Grid points inside a shape, in a fixed shuffled order, so molecules never sit on top of each other. */
function slots(x0: number, y0: number, x1: number, y1: number, step: number, inside: (x: number, y: number) => boolean, seed: number) {
  const pts: [number, number, number][] = [];
  for (let y = y0 + step / 2; y < y1; y += step) for (let x = x0 + step / 2; x < x1; x += step) if (inside(x, y)) pts.push([x, y, Math.sin((x * 12.9898 + y * 78.233 + seed) * 0.37) * 43758.5453 % 1]);
  return pts.sort((a, b) => a[2] - b[2]).map(([x, y]) => [x, y] as [number, number]);
}

/** A label kept inside the canvas. */
function edgeLabel(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, w: number, color: string) {
  font(ctx, 11);
  const half = ctx.measureText(s).width / 2;
  label(ctx, s, Math.min(Math.max(x, half + 3), w - half - 3), y, { size: 11, color });
}

export default function DecafSoak({ onDone, active }: LabProps) {
  const [liquid, setLiquid] = useState<Liquid>('water');
  const [clean, setClean] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [clock, setClock] = useState(0);
  useFrame((dt) => setClock((c) => (c + dt) % 1000), active);
  const s = soak(liquid, clean, rounds);
  const removed = removedPercent(s), kept = s.flavour * 100, done = isDecaf(s);
  useGoal(done, onDone);

  const liquidName = liquid === 'water' ? t('Hot water') : liquid === 'extract' ? t('Coffee extract') : t('Solvent');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const jig = (i: number) => [Math.sin(clock * 2.1 + i * 1.7) * 1.2, Math.cos(clock * 1.8 + i * 2.3) * 1.2];
    const top = 21, bot = h - 22, mid = (top + bot) / 2;
    let step = 10;
    const put = (pts: [number, number][], n: number, from: number, kind: 'c' | 'f', k: number) => {
      for (let i = 0; i < Math.min(n, pts.length - from); i++) {
        const [x, y] = pts[from + i], [jx, jy] = jig(i + k);
        if (kind === 'c') hex(ctx, x + jx, y + jy, Math.min(4.2, step * 0.46));
        else dot(ctx, x + jx, y + jy, Math.min(3.3, step * 0.37), ROSE);
      }
    };
    // the bean
    const ry = Math.min((bot - top) / 2, w * 0.17), rx = ry * 0.72, bx = Math.max(w * 0.16, rx + 6), by = mid;
    ctx.fillStyle = BEAN;
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BEAN_LO;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, by - ry * 0.8);
    ctx.bezierCurveTo(bx + rx * 0.4, by - ry * 0.3, bx - rx * 0.4, by + ry * 0.3, bx, by + ry * 0.8);
    ctx.stroke();
    // the tightest grid that still holds every molecule of a full bean
    const inside = (x: number, y: number) => ((x - bx) / (rx - 3)) ** 2 + ((y - by) / (ry - 3)) ** 2 < 1;
    let inBean = slots(bx - rx, by - ry, bx + rx, by + ry, step, inside, 1);
    while (inBean.length < 2 * N && step > 4) {
      step -= 0.25;
      inBean = slots(bx - rx, by - ry, bx + rx, by + ry, step, inside, 1);
    }
    put(inBean, Math.round(N * s.caffeine), 0, 'c', 0);
    put(inBean, Math.round(N * s.flavour), N, 'f', 30);
    label(ctx, t('raw bean'), bx, 11, { size: 11, color: C.soft });
    // the liquid
    const tx0 = w * 0.4, tx1 = w * 0.68;
    ctx.fillStyle = TINT[liquid];
    ctx.fillRect(tx0, top + 6, tx1 - tx0, bot - top - 6);
    ctx.strokeStyle = C.soft;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx0, top, tx1 - tx0, bot - top, 7);
    ctx.stroke();
    label(ctx, liquidName, (tx0 + tx1) / 2, 11, { size: 11, color: C.ink });
    const inTank = slots(tx0 + 2, top + 8, tx1 - 2, bot - 2, step, () => true, 2);
    put(inTank, Math.round(N * s.liquidFlavour), N, 'f', 60);
    put(inTank, Math.round(N * s.liquidCaffeine), 0, 'c', 90);
    // exchange arrows between bean and liquid
    const ax0 = bx + rx + 5, ax1 = tx0 - 5;
    if (ax1 - ax0 > 12) {
      ctx.strokeStyle = C.faint;
      ctx.lineWidth = 2;
      for (const [y, dir] of [[mid - 6, 1], [mid + 6, -1]] as const) {
        const [x0, x1] = dir > 0 ? [ax0, ax1] : [ax1, ax0];
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.moveTo(x1 - dir * 5, y - 4);
        ctx.lineTo(x1, y);
        ctx.lineTo(x1 - dir * 5, y + 4);
        ctx.stroke();
      }
    }
    // where the caffeine goes when it is taken out of the liquid
    const fx0 = w * 0.75, fx1 = w - 6, fxm = (fx0 + fx1) / 2;
    if (clean) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.roundRect(fx0, top, fx1 - fx0, bot - top, 6);
      ctx.fill();
      ctx.strokeStyle = C.faint;
      ctx.beginPath();
      ctx.moveTo(tx1 + 3, mid);
      ctx.lineTo(fx0 - 3, mid);
      ctx.stroke();
      const inBox = slots(fx0 + 1, top + 2, fx1 - 1, bot - 2, step, () => true, 3);
      put(inBox, Math.round(N * s.caught), 0, 'c', 120);
      edgeLabel(ctx, t('caffeine out'), fxm, 11, w, GOLD);
    } else {
      edgeLabel(ctx, t('not taken out'), fxm, mid, w, C.faint);
    }
    // the score, which doubles as the key
    const sy = h - 10;
    hex(ctx, 9, sy, 4.2);
    label(ctx, t('caffeine out: {p}%', { p: one(removed) }), 17, sy, { size: 12, color: removed >= GOAL_REMOVED ? C.good : GOLD, align: 'left' });
    font(ctx, 12);
    const right = t('flavour kept: {p}%', { p: Math.round(kept) }), rw = ctx.measureText(right).width;
    dot(ctx, w - rw - 12, sy, 3.3, ROSE);
    label(ctx, right, w - 4, sy, { size: 12, color: kept >= GOAL_FLAVOUR ? C.good : C.bad, align: 'right' });
  };

  const tag = { fontSize: 12.5, fontWeight: 750 } as const;
  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('{liquid}, {rounds} rounds: {removed}% of the caffeine removed, {kept}% of the flavour kept', { liquid: liquidName, rounds, removed: one(removed), kept: Math.round(kept) })}
      />
      <Choice
        label={t('Soak the beans in')}
        options={[
          { value: 'water' as Liquid, label: t('Hot water') },
          { value: 'extract' as Liquid, label: t('Coffee extract') },
          { value: 'solvent' as Liquid, label: t('Solvent') },
        ]}
        value={liquid}
        onChange={setLiquid}
      />
      <div className="lab__row">
        <span style={tag}>{t('Its caffeine')}</span>
        <Choice
          label={t('Its caffeine')}
          options={[
            { value: 'out', label: t('Taken out') },
            { value: 'in', label: t('Left in') },
          ]}
          value={clean ? 'out' : 'in'}
          onChange={(v) => setClean(v === 'out')}
        />
      </div>
      <Range label={t('Soaking rounds')} value={rounds} min={0} max={MAX_ROUNDS} step={1} onChange={setRounds} />
      <p className="lab__note">{t('Toy model: each round, the beans and as much liquid share evenly what it dissolves. Real solvents take a little flavour too.')}</p>
    </div>
  );
}
