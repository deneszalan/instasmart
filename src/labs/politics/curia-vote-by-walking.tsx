import { useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Group = 'acquit' | 'banish' | 'death';
export type Way = 'together' | 'three' | 'cross';
export type Result = Group | 'tie';

/**
 * The verdict under three ways of dividing the Senate, as in Pliny the Younger's letter 8.14 (about AD 105):
 * - together: death and banishment backers stand on one side against acquittal; if they win, they then split
 *   between death and banishment (Pliny says they sat together, putting off their quarrel).
 * - three: each proposal is counted on its own and the largest wins (Pliny's demand).
 * - cross: the death backers give up their proposal and cross to banishment, leaving two sides.
 */
export function verdict(acquit: number, banish: number, death: number, way: Way): Result {
  if (way === 'three') {
    const top = Math.max(acquit, banish, death);
    const leaders = (['acquit', 'banish', 'death'] as const).filter((_, i) => [acquit, banish, death][i] === top);
    return leaders.length === 1 ? leaders[0] : 'tie';
  }
  const harsher = banish + death;
  if (acquit === harsher) return 'tie';
  if (acquit > harsher) return 'acquit';
  if (way === 'cross') return 'banish';
  return banish === death ? 'tie' : banish > death ? 'banish' : 'death';
}

/** Pliny's situation: acquittal ahead of each other proposal alone, but behind both together. */
export const plinysCase = (a: number, b: number, d: number) => a > b && a > d && a < b + d;

const COLOUR: Record<Group, string> = { acquit: '#86efac', banish: '#fde047', death: '#fca5a5' };

export default function CuriaVote({ onDone }: LabProps) {
  const [acquit, setAcquit] = useState(150);
  const [banish, setBanish] = useState(50);
  const [death, setDeath] = useState(50);
  const [way, setWay] = useState<Way>('together');
  useGoal(plinysCase(acquit, banish, death), onDone);

  const name = (r: Result) => (r === 'acquit' ? t('Acquit the freedmen') : r === 'banish' ? t('Banish them') : r === 'death' ? t('Put them to death') : t('A tie'));

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the hall seen from above: steps along the top and bottom, the dais on the right
    const L = 8, R = w - 28, T = 8, B = h - 8, step = (B - T) * 0.3;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(L, T, R - L, B - T);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(L, T, R - L, step); ctx.fillRect(L, B - step, R - L, step);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(R, T + step, 20, B - T - 2 * step);
    line(ctx, L, T, R, T, C.faint, 1); line(ctx, L, B, R, B, C.faint, 1);
    const pack = (n: number, x0: number, x1: number, y0: number, y1: number, col: string, from = 0) => {
      const cols = Math.max(1, Math.floor((x1 - x0) / 6)), rows = Math.max(1, Math.floor((y1 - y0) / 6));
      for (let i = 0; i < n; i++) {
        const j = i + from, c = j % cols, r = Math.floor(j / cols);
        if (r >= rows) break;
        dot(ctx, x0 + 3 + c * 6, y0 + 3 + r * 6, 2.2, col);
      }
    };
    pack(acquit, L + 4, R - 4, T + 2, T + step - 2, COLOUR.acquit);
    if (way === 'three') {
      pack(banish, L + 4, R - 4, B - step + 2, B - 2, COLOUR.banish);
      pack(death, L + (R - L) * 0.25, L + (R - L) * 0.75, T + step + 6, B - step - 6, COLOUR.death);
    } else {
      pack(banish, L + 4, R - 4, B - step + 2, B - 2, COLOUR.banish);
      pack(death, L + 4, R - 4, B - step + 2, B - 2, COLOUR.death, banish);
    }
    label(ctx, way === 'three' ? t('three groups apart') : t('two sides of the hall'), (L + R) / 2, way === 'three' ? B - step - 8 : (T + B) / 2, { size: 10, color: C.soft });
  };

  const results = (['together', 'three', 'cross'] as const).map((wy) => verdict(acquit, banish, death, wy));
  return (
    <div className="lab">
      <Choice
        label={t('How the Senate divides')}
        value={way}
        onChange={setWay}
        options={[
          { value: 'together', label: t('Death with banishment') },
          { value: 'three', label: t('Three groups') },
          { value: 'cross', label: t('Death crosses over') },
        ]}
      />
      <Stage draw={draw} label={t('The Senate divided: {a} for acquittal, {b} for banishment, {d} for death', { a: acquit, b: banish, d: death })} />
      <Range label={t('For acquittal')} value={acquit} min={0} max={200} step={5} onChange={(v) => setAcquit(Math.round(v))} format={(v) => formatNumber(v)} />
      <Range label={t('For banishment')} value={banish} min={0} max={200} step={5} onChange={(v) => setBanish(Math.round(v))} format={(v) => formatNumber(v)} />
      <Range label={t('For death')} value={death} min={0} max={200} step={5} onChange={(v) => setDeath(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('Death with banishment'), value: name(results[0]), tone: results[0] === 'acquit' ? 'good' : 'bad' },
          { label: t('Three groups'), value: name(results[1]), tone: results[1] === 'acquit' ? 'good' : 'bad' },
          { label: t('Death crosses over'), value: name(results[2]), tone: results[2] === 'acquit' ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Pliny gives no numbers: the senators here are yours to set.')}</p>
    </div>
  );
}
