import { useRef, useState } from 'react';
import { Btn, C, label, Range, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Corners of the patches, in units of the panel's width (x) and height (y). */
const V: [number, number][] = [
  [0, 0], [0.36, 0], [0.7, 0], [1, 0],
  [0, 0.42], [0.3, 0.38], [0.52, 0.47], [0.74, 0.36], [1, 0.4],
  [0, 1], [0.27, 1], [0.58, 1], [1, 1],
];

/**
 * An invented panel of seven giornate, each with the day it was laid. Every patch is a list of corner indices; two
 * patches that share an edge meet at a seam, where the later one laps over the earlier.
 */
export const PATCHES: { corners: number[]; day: number; colour: string }[] = [
  { corners: [0, 1, 5, 4], day: 2, colour: '#9cc6e0' },
  { corners: [1, 2, 7, 6, 5], day: 1, colour: '#a9cfe4' },
  { corners: [2, 3, 8, 7], day: 3, colour: '#8e4f63' },
  { corners: [4, 5, 10, 9], day: 6, colour: '#8fa06a' },
  { corners: [5, 6, 11, 10], day: 4, colour: '#e3b48f' },
  { corners: [6, 7, 8, 12, 11], day: 5, colour: '#d99a3b' },
];

/** Pairs of patches that share at least one edge, with the shared edges. */
export function seams(): { a: number; b: number; edges: [number, number][] }[] {
  const out: { a: number; b: number; edges: [number, number][] }[] = [];
  const edges = (p: number[]) => p.map((v, i) => [v, p[(i + 1) % p.length]] as [number, number]);
  for (let a = 0; a < PATCHES.length; a++)
    for (let b = a + 1; b < PATCHES.length; b++) {
      const shared = edges(PATCHES[a].corners).filter(([u, v]) => edges(PATCHES[b].corners).some(([x, y]) => (x === v && y === u) || (x === u && y === v)));
      if (shared.length) out.push({ a, b, edges: shared });
    }
  return out;
}

const SEAMS = seams();

/** Patches that patch `i` laps over: its neighbours laid on an earlier day. */
export const under = (i: number) => SEAMS.filter((s) => s.a === i || s.b === i).map((s) => (s.a === i ? s.b : s.a)).filter((j) => PATCHES[j].day < PATCHES[i].day);

/** Patch `i` can be next in the order if every patch it laps over is already numbered. */
export const canLay = (i: number, laid: number[]) => !laid.includes(i) && under(i).every((j) => laid.includes(j));

/** How strongly the lip of a seam shows, from 0 with the light straight on (90°) to 1 when it grazes the wall (0°). */
export const relief = (degrees: number) => Math.cos((degrees * Math.PI) / 180) ** 2;

function inside(x: number, y: number, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export default function Giornate({ onDone }: LabProps) {
  const [light, setLight] = useState(80);
  const [laid, setLaid] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [miss, setMiss] = useState<number | null>(null);
  const box = useRef({ x: 0, y: 0, w: 1, h: 1 });
  useGoal(laid.length === PATCHES.length, onDone);

  const poly = (i: number): [number, number][] => {
    const { x, y, w, h } = box.current;
    return PATCHES[i].corners.map((c) => [x + V[c][0] * w, y + V[c][1] * h]);
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const i = PATCHES.findIndex((_, j) => inside(p.x, p.y, poly(j)));
    if (i < 0 || laid.includes(i)) return;
    if (canLay(i, laid)) {
      setLaid([...laid, i]);
      setMiss(null);
    } else {
      setWrong((n) => n + 1);
      setMiss(i);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pw = Math.min(w - 24, (h - 34) * 1.5), ph = pw / 1.5;
    box.current = { x: (w - pw) / 2, y: 8, w: pw, h: ph };
    const r = relief(light);
    // the plaster, lit from the left: the lower the light, the darker the far side
    PATCHES.forEach((patch, i) => {
      const pts = poly(i);
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = patch.colour;
      ctx.fill();
      if (miss === i) {
        ctx.fillStyle = 'rgba(252,165,165,0.45)';
        ctx.fill();
      }
    });
    const shade = ctx.createLinearGradient(box.current.x, 0, box.current.x + pw, 0);
    shade.addColorStop(0, `rgba(255,248,230,${0.18 * r})`);
    shade.addColorStop(1, `rgba(0,0,0,${0.45 * r})`);
    ctx.fillStyle = shade;
    ctx.fillRect(box.current.x, box.current.y, pw, ph);
    // the seams: a faint line always; in raking light, the later patch's lip and its shadow on the earlier one
    for (const s of SEAMS) {
      const later = PATCHES[s.a].day > PATCHES[s.b].day ? s.a : s.b;
      const cl = centroid(poly(later));
      for (const [u, v] of s.edges) {
        const { x, y } = box.current;
        const p1 = [x + V[u][0] * pw, y + V[u][1] * ph], p2 = [x + V[v][0] * pw, y + V[v][1] * ph];
        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        let nx = -(p2[1] - p1[1]) / len, ny = (p2[0] - p1[0]) / len;
        const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        if ((cl[0] - mx) * nx + (cl[1] - my) * ny < 0) [nx, ny] = [-nx, -ny]; // n points into the later patch
        const band = (off: number, wdt: number, col: string) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = wdt;
          ctx.beginPath();
          ctx.moveTo(p1[0] + nx * off, p1[1] + ny * off);
          ctx.lineTo(p2[0] + nx * off, p2[1] + ny * off);
          ctx.stroke();
        };
        band(0, 1.2, 'rgba(40,28,18,0.35)');
        if (r > 0.02) {
          band(-2.6, 4, `rgba(20,12,6,${0.75 * r})`); // shadow cast on the older patch
          band(1.6, 2.2, `rgba(255,250,236,${0.9 * r})`); // the raised edge of the newer one
        }
      }
    }
    // the numbers given so far
    laid.forEach((i, n) => {
      const [x, y] = centroid(poly(i));
      ctx.fillStyle = 'rgba(20,14,10,0.72)';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, String(n + 1), x, y + 0.5, { size: 14, color: C.ink });
    });
    label(ctx, t('light from the left, {d}° above the wall', { d: formatNumber(light) }), w / 2, box.current.y + ph + 14, { size: 10.5, color: C.soft });
  };

  const done = laid.length === PATCHES.length;
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A fresco panel of {n} patches of plaster; {k} numbered so far', { n: PATCHES.length, k: laid.length })} />
      <Range label={t('Light above the wall')} value={light} min={2} max={90} step={1} onChange={setLight} format={(v) => `${formatNumber(v)}°`} />
      <Readouts
        items={[
          { label: t('Days numbered'), value: `${laid.length} / ${PATCHES.length}`, tone: done ? 'good' : 'accent' },
          { label: t('Wrong guesses'), value: formatNumber(wrong), tone: wrong ? 'bad' : undefined },
          { label: t('Overlaps at the seams'), value: relief(light) > 0.6 ? t('easy to see') : relief(light) > 0.15 ? t('only just visible') : t('invisible head-on') },
        ]}
      />
      <p className="lab__note">
        {miss !== null ? t('Not yet: that patch laps over one you haven’t numbered.') : t('Tap the patches in the order they were laid. Simplified: an invented panel.')}
      </p>
      {laid.length > 0 && !done && (
        <Btn ghost onClick={() => { setLaid([]); setMiss(null); }}>
          {t('Start again')}
        </Btn>
      )}
    </div>
  );
}

function centroid(p: [number, number][]): [number, number] {
  let x = 0, y = 0;
  for (const [a, b] of p) {
    x += a;
    y += b;
  }
  return [x / p.length, y / p.length];
}
