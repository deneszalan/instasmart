import { useRef, useState } from 'react';
import { C, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Pietà is 174 cm high and 195 cm wide (Wikipedia, "Pietà (Michelangelo)"). */
export const HEIGHT = 174, WIDTH = 195;
/** Mary's head, the top of the group, about 108 cm from the left edge in a frontal photograph. */
export const MARY_HEAD_X = 108;

/** The group's outline in cm from the bottom-left corner, traced (simplified) from a frontal photograph. */
export const OUTLINE: [number, number][] = [[0, 0], [-1, 14.2], [6.4, 21.3], [16.2, 40.3], [26, 59.3], [30.9, 78.2], [37.2, 94.8], [42.1, 106.7], [44.1, 120.9], [48, 130.4], [57.8, 131.3], [65.2, 123.3], [77.4, 137.5], [93.1, 140.8], [97, 163.6], [107.8, 174], [119.1, 168.3], [124, 149.3], [126.4, 135.1], [141.1, 130.4], [150.9, 113.8], [160.7, 97.2], [174.4, 88.7], [173, 82], [160.7, 77.3], [168.1, 59.3], [177.9, 33.2], [190.1, 21.3], [195, 15.6], [195, 0]];

function inside([x, y]: [number, number], poly: [number, number][]) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xa, ya] = poly[i], [xb, yb] = poly[j];
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) ins = !ins;
  }
  return ins;
}
const G = 2;
const CELLS: [number, number][] = [];
for (let x = -20; x < 215; x += G) for (let y = 0; y < 264; y += G) CELLS.push([x + G / 2, y + G / 2]);
const IN_GROUP = CELLS.map((c) => inside(c, OUTLINE));
const GROUP = IN_GROUP.filter(Boolean).length;

/** Is a point inside the triangle standing on the rock, (0, 0)–(195, 0), with its tip at (ax, ay)? */
const inTriangle = ([x, y]: [number, number], ax: number, ay: number) => y >= 0 && y <= ay && x >= (ax * y) / ay && x <= WIDTH + ((ax - WIDTH) * y) / ay;

/** How well the triangle fits the group: overlap ÷ union of the two areas, on a 2 cm grid. */
export function fit(ax: number, ay: number) {
  let both = 0, tri = 0;
  CELLS.forEach((c, i) => {
    const inT = inTriangle(c, ax, ay);
    if (inT) tri++;
    if (inT && IN_GROUP[i]) both++;
  });
  return both / (tri + GROUP - both);
}

/** The best tip, searched on a 2 cm grid. */
export const BEST = (() => {
  let best = { ax: 0, ay: 0, f: 0 };
  for (let ax = 40; ax <= 160; ax += 2) for (let ay = 120; ay <= 260; ay += 2) {
    const f = fit(ax, ay);
    if (f > best.f) best = { ax, ay, f };
  }
  return best;
})();

export default function PietaPyramid({ onDone }: LabProps) {
  const [ax, setAx] = useState(40);
  const [ay, setAy] = useState(240);
  const f = fit(ax, ay);
  const good = f >= BEST.f - 0.02;
  useGoal(good, onDone);

  const frame = (w: number, h: number) => {
    const s = Math.min((w - 24) / 220, (h - 22) / 262), x0 = (w - 195 * s) / 2, y0 = h - 10;
    return { s, X: (cm: number) => x0 + cm * s, Y: (cm: number) => y0 - cm * s, cmX: (px: number) => (px - x0) / s, cmY: (py: number) => (y0 - py) / s };
  };
  const last = useRef(frame(300, 300));
  const onPointer = (p: StagePointer) => {
    setAx(Math.round(Math.min(195, Math.max(0, last.current.cmX(p.x)))));
    setAy(Math.round(Math.min(260, Math.max(100, last.current.cmY(p.y)))));
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const fr = frame(w, h), { X, Y } = fr;
    last.current = fr;
    ctx.beginPath();
    OUTLINE.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    ctx.closePath();
    ctx.fillStyle = 'rgba(236,230,219,0.75)';
    ctx.fill();
    ctx.fillStyle = good ? 'rgba(134,239,172,0.18)' : 'rgba(253,224,71,0.14)';
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(ax), Y(ay));
    ctx.lineTo(X(WIDTH), Y(0));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = good ? C.good : C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    dot(ctx, X(ax), Y(ay), 7, good ? C.good : C.accent);
    line(ctx, X(0), Y(0), X(WIDTH), Y(0), C.soft, 2);
    label(ctx, `${formatNumber(WIDTH)} cm`, X(WIDTH / 2), Y(0) - 8, { size: 10, color: C.soft });
    label(ctx, t('drag the tip'), X(ax), Y(ay) - 14, { size: 10, color: good ? C.good : C.accent });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('The outline of the Pietà with a triangle on its base; the fit is {f}%', { f: formatNumber(Math.round(f * 100)) })} />
      <Range label={t('Tip of the triangle, across')} value={ax} min={0} max={195} step={1} onChange={setAx} format={(v) => `${formatNumber(v)} cm`} />
      <Range label={t('Tip of the triangle, height')} value={ay} min={100} max={260} step={1} onChange={setAy} format={(v) => `${formatNumber(v)} cm`} />
      <Readouts
        items={[
          { label: t('Fit to the group'), value: `${formatNumber(Math.round(f * 100))}%`, tone: good ? 'good' : undefined },
          { label: t('Best possible fit'), value: `${formatNumber(Math.round(BEST.f * 100))}%` },
          { label: t('Mary’s head, across'), value: `${formatNumber(MARY_HEAD_X)} cm` },
        ]}
      />
      <p className="lab__note">{t('Fit = overlap ÷ combined area. The outline is traced, simplified, from a photograph of the statue, 195 cm wide.')}</p>
    </div>
  );
}
