import { useEffect, useState } from 'react';
import { C, Choice, Range, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A made-up patch of Mars in 10 m squares: # is a rock, S the rover, G the planners' waypoint. */
export const MAP = [
  '....................',
  '..................G.',
  '....................',
  '...##...............',
  '...##...#######.....',
  '..............#.....',
  '..............#.....',
  '..............#..##.',
  '..##..........#..##.',
  '..##..........#.....',
  '..............#.....',
  '.....##.............',
  '.S...##.............',
  '....................',
];
export const SQUARE = 10; // metres
const ROWS = MAP.length, COLS = MAP[0].length;
const ROCK = MAP.map((r) => [...r].map((ch) => ch === '#'));
type Cell = [number, number];
const find = (ch: string): Cell => {
  for (let r = 0; r < ROWS; r++) {
    const c = MAP[r].indexOf(ch);
    if (c >= 0) return [r, c];
  }
  throw new Error(ch);
};
export const START = find('S'), GOAL = find('G');
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
const length = (path: Cell[]) => path.slice(1).reduce((d, p, i) => d + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]) * SQUARE, 0);

/** Shortest route on the grid (A*), moving to any of the 8 neighbours but never squeezing between two rocks. */
export function route(blocked: (r: number, c: number) => boolean, from: Cell, to: Cell): Cell[] | null {
  const key = (r: number, c: number) => r * COLS + c, h = (r: number, c: number) => Math.hypot(r - to[0], c - to[1]);
  const g = new Map([[key(...from), 0]]), prev = new Map<number, Cell>(), done = new Set<number>();
  const open: [number, number, number][] = [[h(...from), ...from]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift()!;
    if (done.has(key(r, c))) continue;
    done.add(key(r, c));
    if (r === to[0] && c === to[1]) break;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if ((!dr && !dc) || nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || blocked(nr, nc)) continue;
        if (dr && dc && (blocked(r + dr, c) || blocked(r, c + dc))) continue;
        const ng = g.get(key(r, c))! + (dr && dc ? Math.SQRT2 : 1);
        if (ng < (g.get(key(nr, nc)) ?? Infinity)) {
          g.set(key(nr, nc), ng);
          prev.set(key(nr, nc), [r, c]);
          open.push([ng + h(nr, nc), nr, nc]);
        }
      }
  }
  const path: Cell[] = [to];
  while (!same(path[0], from)) {
    const p = prev.get(key(...path[0]));
    if (!p) return null;
    path.unshift(p);
  }
  return path;
}

/** The shortest route for a rover that could see the whole map. */
export const shortest = () => length(route((r, c) => ROCK[r][c], START, GOAL)!);

export interface Drive {
  path: Cell[];
  /** What the rover had seen by the end, square by square. */
  seen: boolean[][];
  metres: number;
  reached: boolean;
}

/**
 * AutoNav, simplified: the rover sees every square within `view` metres, plans the shortest route on what it has
 * seen (unseen ground counts as clear), drives one square and looks again.
 */
export function autonav(view: number): Drive {
  const seen = ROCK.map((row) => row.map(() => false));
  const path: Cell[] = [START];
  let at = START;
  for (let n = 0; n < 400; n++) {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (Math.hypot(r - at[0], c - at[1]) * SQUARE <= view) seen[r][c] = true;
    if (same(at, GOAL)) break;
    const plan = route((r, c) => seen[r][c] && ROCK[r][c], at, GOAL);
    if (!plan) break;
    at = plan[1];
    path.push(at);
  }
  return { path, seen, metres: length(path), reached: same(at, GOAL) };
}

/** No AutoNav: drive the straight line to the waypoint and stop in front of the first rock, to wait for Earth. */
export function straight(): Drive {
  const steps = Math.max(Math.abs(GOAL[0] - START[0]), Math.abs(GOAL[1] - START[1])) * 4;
  const path: Cell[] = [START];
  for (let i = 1; i <= steps; i++) {
    const cell: Cell = [Math.round(START[0] + ((GOAL[0] - START[0]) * i) / steps), Math.round(START[1] + ((GOAL[1] - START[1]) * i) / steps)];
    if (ROCK[cell[0]][cell[1]]) break;
    if (!same(cell, path[path.length - 1])) path.push(cell);
  }
  return { path, seen: ROCK.map((row) => row.map(() => false)), metres: length(path), reached: same(path[path.length - 1], GOAL) };
}

const ROCK_COLOUR = '#5a2c1c', CYAN = '#67d8ea', GOLD = '#f2b36b';

export default function PerseveranceDrive({ onDone, active }: LabProps) {
  const [mode, setMode] = useState<'auto' | 'straight'>('auto');
  const [view, setView] = useState(10);
  const [shown, setShown] = useState(0); // squares of the drive shown so far
  const drive = mode === 'auto' ? autonav(view) : straight();
  const best = shortest();
  const efficient = mode === 'auto' && drive.reached && drive.metres <= best * 1.05;
  useGoal(efficient && shown >= drive.path.length - 1, onDone);

  useEffect(() => setShown(0), [mode, view]);
  useFrame((dt) => setShown((s) => Math.min(drive.path.length - 1, s + Math.max(0, dt) * 14)), active && shown < drive.path.length - 1);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const cell = Math.min((w - 12) / COLS, (h - 12) / ROWS);
    const ox = (w - cell * COLS) / 2, oy = (h - cell * ROWS) / 2;
    const X = (c: number) => ox + (c + 0.5) * cell, Y = (r: number) => oy + (r + 0.5) * cell;
    const at = Math.max(0, Math.min(shown, drive.path.length - 1)), upto = Math.floor(at), fr = at - upto;
    // what the rover has seen so far: replay the looks along the path
    const seen = ROCK.map((row) => row.map(() => false));
    if (mode === 'auto')
      for (const [pr, pc] of drive.path.slice(0, upto + 1))
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (Math.hypot(r - pr, c - pc) * SQUARE <= view) seen[r][c] = true;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r + c) % 2 ? 'rgba(160,80,45,0.30)' : 'rgba(160,80,45,0.38)';
        ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
        if (seen[r][c]) {
          ctx.fillStyle = ROCK[r][c] ? 'rgba(252,165,165,0.45)' : 'rgba(103,216,234,0.16)';
          ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
        }
        if (ROCK[r][c]) {
          ctx.fillStyle = ROCK_COLOUR;
          ctx.beginPath();
          ctx.ellipse(X(c), Y(r), cell * 0.4, cell * 0.33, (r * 7 + c) % 3, 0, Math.PI * 2);
          ctx.fill();
          if (seen[r][c]) {
            ctx.strokeStyle = C.bad;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2);
          }
        }
      }
    // the waypoint
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(GOAL[1]) - 3, Y(GOAL[0]) + cell * 0.4);
    ctx.lineTo(X(GOAL[1]) - 3, Y(GOAL[0]) - cell * 0.5);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(X(GOAL[1]) - 3, Y(GOAL[0]) - cell * 0.5);
    ctx.lineTo(X(GOAL[1]) + cell * 0.45, Y(GOAL[0]) - cell * 0.3);
    ctx.lineTo(X(GOAL[1]) - 3, Y(GOAL[0]) - cell * 0.1);
    ctx.fill();
    // the route so far
    const p = drive.path, a = p[upto], b = p[Math.min(upto + 1, p.length - 1)];
    const rx = X(a[1]) + (X(b[1]) - X(a[1])) * fr, ry = Y(a[0]) + (Y(b[0]) - Y(a[0])) * fr;
    ctx.strokeStyle = mode === 'auto' ? CYAN : GOLD;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    p.slice(0, upto + 1).forEach(([r, c], i) => (i ? ctx.lineTo(X(c), Y(r)) : ctx.moveTo(X(c), Y(r))));
    ctx.lineTo(rx, ry);
    ctx.stroke();
    // its view and the rover
    if (mode === 'auto') {
      ctx.strokeStyle = 'rgba(103,216,234,0.6)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(rx, ry, (view / SQUARE + 0.5) * cell, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = C.ink;
    ctx.fillRect(rx - cell * 0.32, ry - cell * 0.22, cell * 0.64, cell * 0.44);
    // stuck: a red bar where it stopped
    if (!drive.reached && at >= p.length - 1) {
      ctx.strokeStyle = C.bad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rx, ry, cell * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const done = shown >= drive.path.length - 1;
  const result = !done ? t('Driving…') : drive.reached ? t('At the waypoint') : t('Stopped: waits for Earth');
  return (
    <div className="lab">
      <Choice
        label={t('Steering')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'auto', label: t('AutoNav') },
          { value: 'straight', label: t('Straight line, no AutoNav') },
        ]}
      />
      <Stage draw={draw} label={t('A rover crossing a rocky patch of Mars towards a waypoint; {m} metres driven', { m: Math.round(drive.metres) })} />
      {mode === 'auto' && <Range label={t('Looks ahead')} value={view} min={10} max={80} step={10} onChange={setView} format={(v) => `${v} m`} />}
      <Readouts
        items={[
          { label: t('Driven'), value: `${formatNumber(Math.round(drive.metres))} m`, tone: efficient && done ? 'good' : undefined },
          { label: t('Shortest route'), value: `${formatNumber(Math.round(best))} m`, tone: 'accent' },
          { label: t('Result'), value: result, tone: done && !drive.reached ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified model: 10 m squares; the rover plans on what it has seen and treats unseen ground as clear.')}</p>
    </div>
  );
}
