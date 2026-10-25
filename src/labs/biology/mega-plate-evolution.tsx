import { useRef, useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export const COLS = 60, ROWS = 14, BAND = 12;
const DOSES = ['0×', '3×', '30×', '300×', '3,000×'];
const COLOURS = ['#e5e7eb', '#67e8f9', '#86efac', '#fde047', '#f472b6'];

/** Which band of drug a column is in: 0 at the edge with no drug, 4 in the middle. */
export const bandOf = (col: number) => Math.min(4, Math.floor(col / BAND));

/** A fresh plate: bacteria of the original strain (level 0) along the drug-free edge, the rest empty (−1). */
export function freshPlate() {
  const cells = new Int8Array(COLS * ROWS).fill(-1);
  for (let r = 0; r < ROWS; r++) cells[r * COLS] = 0;
  return cells;
}

/**
 * One generation. Each colony cell tries to grow into a random neighbouring spot. It can if the spot is empty and
 * its drug is no stronger than the cell tolerates; at a band it can't enter, it gets in only if a mutation
 * (chance `mu`) makes the offspring one level tougher. Rare mutants also arise behind the front.
 */
export function step(cells: Int8Array, mu: number, rand: () => number) {
  const next = cells.slice();
  for (let i = 0; i < cells.length; i++) {
    const level = cells[i];
    if (level < 0 || rand() > 0.5) continue;
    const c = i % COLS, r = (i - c) / COLS, k = Math.floor(rand() * 4);
    const nc = c + (k === 0 ? 1 : k === 1 ? -1 : 0), nr = r + (k === 2 ? 1 : k === 3 ? -1 : 0);
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
    const j = nr * COLS + nc;
    if (next[j] >= 0) continue;
    const need = bandOf(nc);
    if (need <= level) next[j] = level < 4 && rand() < mu / 4 ? level + 1 : level;
    else if (need === level + 1 && rand() < mu) next[j] = level + 1;
  }
  return next;
}

export default function MegaPlate({ onDone, active }: LabProps) {
  const plate = useRef(freshPlate());
  const [gen, setGen] = useState(0);
  const [running, setRunning] = useState(false);
  const [mu, setMu] = useState(1);
  const [fast, setFast] = useState(false);
  const acc = useRef(0);
  let furthest = 0;
  plate.current.forEach((v, i) => v >= 0 && (furthest = Math.max(furthest, bandOf(i % COLS))));
  useGoal(furthest === 4, onDone);

  useFrame((dt) => {
    acc.current += dt * (fast ? 40 : 12);
    let n = 0;
    while (acc.current >= 1 && n < 50) {
      acc.current -= 1;
      plate.current = step(plate.current, mu / 100, Math.random);
      n++;
    }
    if (n) setGen((g) => g + n);
  }, active && running);

  const restart = () => {
    plate.current = freshPlate();
    setGen(0);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const top = 16, cw = w / COLS, ch = (h - top - 4) / ROWS;
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = `rgba(0,0,0,${0.15 + b * 0.13})`;
      ctx.fillRect(b * BAND * cw, top, BAND * cw, h - top);
      label(ctx, DOSES[b], (b + 0.5) * BAND * cw, 8, { size: 10, color: C.soft });
    }
    const cells = plate.current;
    for (let i = 0; i < cells.length; i++) {
      const v = cells[i];
      if (v < 0) continue;
      const c = i % COLS, r = (i - c) / COLS;
      ctx.fillStyle = COLOURS[v];
      ctx.fillRect(c * cw, top + r * ch, cw + 0.5, ch + 0.5);
    }
  };

  const levels = [0, 0, 0, 0, 0];
  plate.current.forEach((v) => v >= 0 && levels[v]++);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Half of the mega-plate, from its drug-free edge to the middle: bacteria have reached band {b}', { b: furthest })} />
      <Range label={t('Mutation chance')} value={mu} min={0} max={5} step={0.1} onChange={setMu} format={(v) => `${formatNumber(v)}%`} />
      <div className="lab__row">
        <Btn onClick={() => setRunning((r) => !r)}>{running ? t('Pause') : gen ? t('Go on') : t('Let them grow')}</Btn>
        <Btn ghost onClick={() => setFast((f) => !f)}>
          {fast ? t('Normal speed') : t('Faster')}
        </Btn>
        <Btn ghost onClick={restart}>
          {t('Start again')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Generations'), value: formatNumber(gen) },
          { label: t('Reached'), value: DOSES[furthest], tone: furthest === 4 ? 'good' : 'accent' },
          { label: t('Toughest survives'), value: DOSES[levels.reduce((m, n, i) => (n ? i : m), 0)] },
        ]}
      />
    </div>
  );
}
