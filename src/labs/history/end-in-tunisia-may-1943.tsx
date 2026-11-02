import { useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type CountId = 'playfair' | 'armyGroup' | 'ushmm' | 'howe' | 'arnim';

/**
 * Counts of the Axis soldiers taken prisoner in Tunisia in 1943, by whose count. Playfair, the British official
 * history: 238,243 unwounded prisoners (101,784 German, 89,442 Italian, 47,017 others); the Allied 18th Army Group:
 * 244,500; G. F. Howe, the US Army's official historian: 275,000 (all three via Playfair, p. 460, quoted in Wikipedia,
 * "Tunisian campaign"); the US Holocaust Memorial Museum, "Tunisia Campaign": 267,000; General von Arnim's own
 * estimate: 100,000 German and 200,000 Italian.
 */
export const COUNTS: Record<CountId, number> = {
  playfair: 238243,
  armyGroup: 244500,
  ushmm: 267000,
  howe: 275000,
  arnim: 100000 + 200000,
};
export const COUNT_IDS = Object.keys(COUNTS) as CountId[];

/** One square of the grid stands for this many prisoners. */
export const PER_SQUARE = 1000;
export const squaresFor = (n: number) => Math.round(n / PER_SQUARE);

/** The lowest and the highest of the counts looked at so far, and how far apart they are. */
export function spread(seen: CountId[]) {
  const values = seen.map((id) => COUNTS[id]);
  const lo = Math.min(...values), hi = Math.max(...values);
  return { lo, hi, gap: hi - lo };
}

/** The goal: the reader has looked at both the lowest and the highest count. */
export function foundExtremes(seen: CountId[]) {
  const all = COUNT_IDS.map((id) => COUNTS[id]);
  const s = spread(seen);
  return seen.length > 0 && s.lo === Math.min(...all) && s.hi === Math.max(...all);
}

const COLOUR: Record<CountId, string> = { playfair: '#f3d36b', armyGroup: '#e9f3f6', ushmm: '#e9f3f6', howe: '#8fd0e8', arnim: '#d0694c' };

export default function EndInTunisia({ onDone }: LabProps) {
  const [id, setId] = useState<CountId>('playfair');
  const [seen, setSeen] = useState<CountId[]>(['playfair']);
  const n = COUNTS[id];
  const s = spread(seen);
  useGoal(foundExtremes(seen), onDone);

  const choose = (v: CountId) => {
    setId(v);
    setSeen((old) => (old.includes(v) ? old : [...old, v]));
  };

  const who: Record<CountId, string> = {
    playfair: t('British official history: unwounded prisoners'),
    armyGroup: t('Allied 18th Army Group’s own count'),
    ushmm: t('US Holocaust Memorial Museum'),
    howe: t('US Army’s official historian, G. F. Howe'),
    arnim: t('German commander von Arnim’s estimate'),
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cols = 25, rows = 12, total = cols * rows;
    const gap = 2, top = 6, bottom = 22;
    const size = Math.min((w - 8 - gap * (cols - 1)) / cols, (h - top - bottom - gap * (rows - 1)) / rows);
    const gw = cols * size + (cols - 1) * gap, x0 = (w - gw) / 2;
    const lit = squaresFor(n), lo = squaresFor(s.lo), hi = squaresFor(s.hi);
    for (let i = 0; i < total; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const x = x0 + c * (size + gap), y = top + r * (size + gap);
      ctx.fillStyle = i < lit ? COLOUR[id] : i < hi ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(x, y, size, size);
      // the lowest count seen so far: a line after its last square
      if (seen.length > 1 && i === lo - 1) {
        ctx.fillStyle = C.ink;
        ctx.fillRect(x + size, y - 1, 2, size + 2);
      }
    }
    label(ctx, t('One square = 1,000 prisoners'), w / 2, h - 9, { size: 10, color: C.faint });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Whose count')}
        value={id}
        onChange={choose}
        options={[
          { value: 'playfair', label: t('British history') },
          { value: 'armyGroup', label: t('Army group count') },
          { value: 'ushmm', label: t('US museum') },
          { value: 'howe', label: t('US historian') },
          { value: 'arnim', label: t('Von Arnim') },
        ]}
      />
      <Stage draw={draw} label={t('{n} prisoners: {who}', { n: formatNumber(n), who: who[id] })} />
      <Readouts
        items={[
          { label: who[id], value: formatNumber(n), tone: 'accent' },
          { label: t('Lowest to highest so far'), value: seen.length > 1 ? t('{gap} apart', { gap: formatNumber(s.gap) }) : '–', tone: foundExtremes(seen) ? 'good' : undefined },
        ]}
      />
    </div>
  );
}
