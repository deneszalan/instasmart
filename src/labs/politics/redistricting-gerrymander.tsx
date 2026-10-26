import { useRef, useState } from 'react';
import { Btn, C, Choice, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

export const COLS = 10, ROWS = 5, SEATS = 5, SIZE = (COLS * ROWS) / SEATS;

/** The 20 orange voters among 50 (the rest are purple): four in every row, so a map of rows gives orange nothing. */
export const ORANGE = new Set([0, 4, 8, 9, 11, 13, 15, 18, 20, 21, 24, 29, 31, 34, 35, 38, 40, 45, 46, 49]);

/** A map gives each cell (row × 10 + column) a district from 0 to 4. */
export type DistrictMap = number[];
export const ROWS_MAP: DistrictMap = Array.from({ length: COLS * ROWS }, (_, i) => Math.floor(i / COLS));

/** Problems with a map: each district needs exactly 10 cells, all joined up. Empty when the map is valid. */
export function problems(map: DistrictMap): number[] {
  const bad: number[] = [];
  for (let d = 0; d < SEATS; d++) {
    const cells = map.flatMap((x, i) => (x === d ? [i] : []));
    if (cells.length !== SIZE) { bad.push(d); continue; }
    const seen = new Set([cells[0]]), todo = [cells[0]];
    while (todo.length) {
      const i = todo.pop()!, c = i % COLS, r = Math.floor(i / COLS);
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const cc = c + dc, rr = r + dr, j = rr * COLS + cc;
        if (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && map[j] === d && !seen.has(j)) { seen.add(j); todo.push(j); }
      }
    }
    if (seen.size !== cells.length) bad.push(d);
  }
  return bad;
}

/** Each district's votes and winner, and the seats each side wins (a 5–5 tie wins nobody a seat). */
export function seats(map: DistrictMap) {
  const votes = Array.from({ length: SEATS }, () => ({ purple: 0, orange: 0 }));
  map.forEach((d, i) => votes[d][ORANGE.has(i) ? 'orange' : 'purple']++);
  const win = votes.map((v) => (v.purple > v.orange ? 'purple' : v.orange > v.purple ? 'orange' : 'tie'));
  return { votes, win, purple: win.filter((w) => w === 'purple').length, orange: win.filter((w) => w === 'orange').length };
}

const TINTS = ['#5eead4', '#f9a8d4', '#fde68a', '#93c5fd', '#bef264'];
const PURPLE = '#a78bfa', ORANGE_DOT = '#fb923c';

export default function Gerrymander({ onDone }: LabProps) {
  const [map, setMap] = useState<DistrictMap>(ROWS_MAP);
  const [brush, setBrush] = useState(0);
  const size = useRef({ w: 0, h: 0 });
  const bad = problems(map), result = seats(map), valid = bad.length === 0;
  useGoal(valid && result.orange >= 3, onDone);

  const geometry = (w: number, h: number) => {
    const cell = Math.min((w - 8) / COLS, (h - 34) / ROWS), x0 = (w - cell * COLS) / 2, y0 = 4;
    return { cell, x0, y0 };
  };
  const onPointer = (p: StagePointer) => {
    if (p.kind === 'up') return;
    const { cell, x0, y0 } = geometry(size.current.w, size.current.h);
    const c = Math.floor((p.x - x0) / cell), r = Math.floor((p.y - y0) / cell);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
    const i = r * COLS + c;
    if (map[i] !== brush) setMap(map.map((d, j) => (j === i ? brush : d)));
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const { cell, x0, y0 } = geometry(s.w, s.h);
    map.forEach((d, i) => {
      const x = x0 + (i % COLS) * cell, y = y0 + Math.floor(i / COLS) * cell;
      ctx.fillStyle = TINTS[d];
      ctx.globalAlpha = bad.includes(d) ? 0.25 : 0.45;
      ctx.fillRect(x, y, cell, cell);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ORANGE.has(i) ? ORANGE_DOT : PURPLE;
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.28, 0, Math.PI * 2);
      ctx.fill();
    });
    // district borders
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    map.forEach((d, i) => {
      const c = i % COLS, r = Math.floor(i / COLS), x = x0 + c * cell, y = y0 + r * cell;
      if (c === COLS - 1 || map[i + 1] !== d) { ctx.moveTo(x + cell, y); ctx.lineTo(x + cell, y + cell); }
      if (r === ROWS - 1 || map[i + COLS] !== d) { ctx.moveTo(x, y + cell); ctx.lineTo(x + cell, y + cell); }
      if (c === 0) { ctx.moveTo(x, y); ctx.lineTo(x, y + cell); }
      if (r === 0) { ctx.moveTo(x, y); ctx.lineTo(x + cell, y); }
    });
    ctx.stroke();
    // each district's result, under the grid
    result.votes.forEach((v, d) => {
      const x = x0 + (d + 0.5) * ((cell * COLS) / SEATS), y = y0 + cell * ROWS + 16;
      const color = bad.includes(d) ? C.bad : result.win[d] === 'orange' ? ORANGE_DOT : result.win[d] === 'purple' ? PURPLE : C.soft;
      label(ctx, `${v.purple}–${v.orange}`, x, y, { size: 12, color });
      ctx.fillStyle = TINTS[d];
      ctx.fillRect(x - 26, y - 5, 6, 10);
    });
  };

  return (
    <div className="lab">
      <Choice
        label={t('Paint district')}
        value={brush}
        onChange={setBrush}
        options={TINTS.map((_, d) => ({ value: d, label: `${d + 1}` }))}
      />
      <Stage draw={draw} onPointer={onPointer} label={t('Fifty voters in five districts; purple wins {p} seats and orange {o}', { p: result.purple, o: result.orange })} />
      <Readouts
        items={[
          { label: t('Purple seats'), value: valid ? result.purple : '–' },
          { label: t('Orange seats'), value: valid ? result.orange : '–', tone: valid && result.orange >= 3 ? 'good' : undefined },
          { label: t('Map'), value: valid ? t('valid') : t('needs 10 joined voters per district'), tone: valid ? 'good' : 'bad' },
        ]}
      />
      <Btn ghost onClick={() => setMap(ROWS_MAP)}>{t('Start over')}</Btn>
    </div>
  );
}
