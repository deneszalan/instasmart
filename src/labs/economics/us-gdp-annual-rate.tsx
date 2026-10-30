import { useState } from 'react';
import { C, Choice, clamp, font, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** A quarter's growth (in %) written at an annual rate, as the US does: compounded over four quarters (BEA). */
export const annualRate = (q: number) => (Math.pow(1 + q / 100, 4) - 1) * 100;

/** The quarterly growth (in %) behind an annual rate. */
export const quarterBehind = (annual: number) => (Math.pow(1 + annual / 100, 1 / 4) - 1) * 100;

/** Growth over the four quarters together (in %): the latest quarter against the same quarter a year earlier. */
export const yearOnYear = (qs: number[]) => (qs.reduce((p, q) => p * (1 + q / 100), 1) - 1) * 100;

/** The economy's size after each quarter, starting at 100 a year earlier. */
export const levels = (qs: number[]) => qs.reduce<number[]>((ls, q) => [...ls, ls[ls.length - 1] * (1 + q / 100)], [100]);

/** The goal: the newest quarter reads at least 4% at an annual rate while the year-on-year growth stays at or under 2%. */
export const reached = (qs: number[]) => annualRate(qs[3]) >= 4 && yearOnYear(qs) <= 2;

const MINT = '#6ee7b7', AMBER = '#fbbf24', CORAL = '#fb7185', BAR = '#3f8a8c';
const START = [0.5, 0.5, 0.5, 0.5];
const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatNumber(Math.abs(Math.round(v * 10) / 10))}%`;

/** `s` broken into as few lines no wider than `width` at `size` px as the words allow, evened out; leaves that font set. */
function wrap(ctx: CanvasRenderingContext2D, s: string, width: number, size: number) {
  font(ctx, size);
  const greedy = (most: number) => {
    const lines: string[] = [];
    for (const word of s.split(' ')) {
      const last = lines.length ? `${lines[lines.length - 1]} ${word}` : '';
      if (last && ctx.measureText(last).width <= most) lines[lines.length - 1] = last;
      else lines.push(word);
    }
    return lines;
  };
  // the narrowest width that needs no more lines, so they come out about even
  const n = greedy(width).length;
  let lo = 0, hi = width;
  for (let k = 0; k < 10; k++) {
    const mid = (lo + hi) / 2;
    if (greedy(mid).length <= n) hi = mid;
    else lo = mid;
  }
  return greedy(hi);
}

export default function UsGdpAnnualRate({ onDone }: LabProps) {
  const [qs, setQs] = useState<number[]>(START);
  const [pick, setPick] = useState(3);
  useGoal(reached(qs), onDone);
  const names = [t('Oct–Dec'), t('Jan–Mar'), t('Apr–Jun'), t('Jul–Sep')];
  const ls = levels(qs);
  const ann = annualRate(qs[3]), yoy = yearOnYear(qs);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // a row at the top for the year-on-year bracket, room under it for the numbers over the tallest bars, and a row
    // at the bottom for the quarters' names; the scale's numbers take only the width they need
    font(ctx, 9);
    const L = 10 + ctx.measureText('108').width, R = w - 8, row = 9, top = row + 20, base = h - 18;
    const lo = 94, hi = 108; // the bars show only their tops: the scale runs from 94 to 108
    const Y = (v: number) => base - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (base - top);
    // five slots for the bars, and the rest of the width for the dashed line running on past them
    const slot = (R - L) / 6.4, bw = slot * 0.64;
    for (const v of [96, 100, 104, 108]) {
      line(ctx, L, Y(v), R, Y(v), C.line, 1);
      label(ctx, `${v}`, L - 4, Y(v), { size: 9, align: 'right', color: C.faint });
    }
    // the annual rate: the newest quarter's pace kept up for a whole year, from the quarter before
    const x3 = L + slot * 3.5, x4 = L + slot * 4.5, x7 = R - 2, y3 = Y(ls[3]), y7 = Y(ls[3] * Math.pow(1 + qs[3] / 100, 4));
    const along = (x: number) => y3 + ((y7 - y3) * (clamp(x, x3, x7) - x3)) / (x7 - x3);
    // the five measured sizes: a year ago, then after each quarter; the names shrink to fit their slots
    const names5 = [t('year ago'), ...names];
    font(ctx, 9);
    const nameSize = clamp((9 * (slot - 6)) / Math.max(...names5.map((s) => ctx.measureText(s).width)), 7, 9);
    ls.forEach((v, i) => {
      const x = L + slot * i + slot * 0.18, cx = x + bw / 2, num = formatNumber(Math.round(v * 10) / 10);
      ctx.fillStyle = i === pick + 1 ? MINT : BAR;
      ctx.fillRect(x, Y(v), bw, base - Y(v));
      label(ctx, names5[i], cx, base + 10, { size: nameSize, color: i === pick + 1 ? MINT : C.faint });
      // each number sits over its bar, and over the dashed line where that crosses it
      font(ctx, 9.5);
      const half = ctx.measureText(num).width / 2 + 1;
      const above = cx + half < x3 ? Y(v) : Math.min(Y(v), along(cx - half), along(cx + half));
      label(ctx, num, cx, above - 4, { size: 9.5, color: C.soft, base: 'alphabetic' });
    });
    line(ctx, x3, y3, x7, y7, AMBER, 2, [5, 4]);
    // the dashed line's name, in the room right of the last bar: above the line's end, or under it when that is too
    // near the top; wrapped onto lines, and smaller if a word is still too wide
    const room = R - (L + slot * 4.82 + 6), widest = (xs: string[]) => Math.max(...xs.map((s) => ctx.measureText(s).width));
    let size = 9.5, lines = wrap(ctx, t('same pace for a year'), room, size);
    while (size > 7.5 && widest(lines) > room) lines = wrap(ctx, t('same pace for a year'), room, (size -= 0.5));
    const lh = size + 2, tall = lines.length * lh, tw = widest(lines);
    const ya = along(R - tw), up = Math.min(ya, y7) - 5 - tall, down = Math.max(ya, y7) + 5;
    const over = { up: 2 - up, down: down + tall - (h - 2) };
    const y = clamp(over.up <= 0 || over.up < over.down ? up : down, 2, h - 2 - tall);
    lines.forEach((s, j) => label(ctx, s, R, y + j * lh, { size, align: 'right', color: AMBER, base: 'top' }));
    // year on year: the newest size against a year ago, its number written into the bracket
    const x0 = L + slot * 0.5, mid = (x0 + x4) / 2, yoyText = t('year on year {p}', { p: pct(yoy) });
    font(ctx, 9.5);
    const yoySize = Math.min(9.5, (9.5 * (x4 - x0 - 24)) / ctx.measureText(yoyText).width);
    font(ctx, yoySize);
    const gap = ctx.measureText(yoyText).width / 2 + 5;
    line(ctx, x0, row, mid - gap, row, CORAL, 2);
    line(ctx, mid + gap, row, x4, row, CORAL, 2);
    line(ctx, x0, row - 4, x0, row + 4, CORAL, 2);
    line(ctx, x4, row - 4, x4, row + 4, CORAL, 2);
    label(ctx, yoyText, mid, row, { size: yoySize, color: CORAL });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('An imaginary economy over four quarters: {a} at an annual rate, {b} year on year', { a: pct(ann), b: pct(yoy) })} />
      <Choice label={t('Quarter to change')} options={names.map((n, i) => ({ value: i, label: n }))} value={pick} onChange={setPick} />
      <Range
        label={t('Growth that quarter')}
        value={qs[pick]}
        min={-1.5}
        max={2}
        step={0.1}
        onChange={(v) => setQs(qs.map((q, i) => (i === pick ? Math.round(v * 10) / 10 : q)))}
        format={pct}
      />
      <Readouts
        items={[
          { label: t('vs Apr–Jun'), value: pct(qs[3]), tone: 'good' },
          { label: t('At an annual rate'), value: pct(ann), tone: ann >= 4 ? 'accent' : undefined },
          { label: t('Year on year'), value: pct(yoy), tone: yoy <= 2 ? undefined : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: an imaginary economy that was 100 a year ago.')}</p>
    </div>
  );
}
