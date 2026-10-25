import { useRef, useState } from 'react';
import { C, Choice, dot, label, line, Range, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const FIRST = 1.5; // days: how slowly a fresh memory fades in this model
const BOOST = 4; // how much a review strengthens a memory, at most
const LATER = 30; // days after the test for the second check

/**
 * A simple model of forgetting, not a fit to data: memory fades as e^(−t/S). Each review brings it back to full
 * strength and multiplies S by 1 + BOOST × (how much had faded), so a review just after another adds almost
 * nothing, and one after some forgetting adds a lot. Returns how much is remembered on `day`.
 */
export function recall(reviews: number[], day: number) {
  let s = FIRST, last = 0;
  for (const r of [...reviews].sort((a, b) => a - b)) {
    if (r > day) break;
    const faded = 1 - Math.exp(-(r - last) / s);
    s *= 1 + BOOST * faded;
    last = r;
  }
  return Math.exp(-(day - last) / s);
}

export default function Spacing({ onDone }: LabProps) {
  const [test, setTest] = useState(30);
  const [reviews, setReviews] = useState([29, 29, 29, 29]);
  const held = useRef<number | null>(null);
  const geom = useRef({ L: 0, R: 1, span: 1, y: 0 });
  const onTest = recall(reviews, test), later = recall(reviews, test + LATER);
  useGoal(later >= 0.3, onDone);

  const onPointer = (p: StagePointer) => {
    const { L, R, span } = geom.current, day = Math.round(((p.x - L) / (R - L)) * span);
    if (p.kind === 'down') {
      // pick up the nearest review marker
      let best = -1, dist = 1e9;
      reviews.forEach((r, i) => {
        const d = Math.abs(L + (r / span) * (R - L) - p.x);
        if (d < dist) [best, dist] = [i, d];
      });
      held.current = dist < 28 ? best : null;
    }
    if (held.current !== null && p.kind !== 'up') {
      const i = held.current;
      setReviews((rs) => rs.map((r, k) => (k === i ? Math.max(1, Math.min(test - 1, day)) : r)));
    }
    if (p.kind === 'up') held.current = null;
  };

  const setTestDay = (d: number) => {
    setTest(d);
    setReviews((rs) => rs.map((r) => Math.min(d - 1, r)));
  };
  const presets: [string, number[]][] = [
    [t('Cram'), [1, 1, 1, 1].map(() => test - 1)],
    [t('Even gaps'), [1, 2, 3, 4].map((k) => Math.round((k * test) / 5))],
    [t('Growing gaps'), [1, 3, 7, 15].map((k) => Math.max(1, Math.round((k * test) / 30)))],
  ];

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 34, R = w - 12, top = 14, bot = h - 40, span = test + LATER;
    geom.current = { L, R, span, y: bot };
    const X = (d: number) => L + (d / span) * (R - L), Y = (r: number) => bot - r * (bot - top);
    for (const r of [0, 0.5, 1]) {
      line(ctx, L, Y(r), R, Y(r), C.line, 1);
      label(ctx, `${r * 100}%`, L - 5, Y(r), { size: 9.5, align: 'right', color: C.faint });
    }
    // without any reviews
    ctx.strokeStyle = C.faint;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) ctx[i ? 'lineTo' : 'moveTo'](X((i / 200) * span), Y(recall([], (i / 200) * span)));
    ctx.stroke();
    ctx.setLineDash([]);
    // with the reader's reviews
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 400; i++) {
      const d = (i / 400) * span;
      ctx[i ? 'lineTo' : 'moveTo'](X(d), Y(recall(reviews, d)));
    }
    ctx.stroke();
    line(ctx, X(test), top, X(test), bot, C.ink, 1.5, [3, 3]);
    label(ctx, t('test'), X(test), bot + 30, { size: 10, color: C.ink });
    line(ctx, X(span), top, X(span), bot, C.soft, 1, [3, 3]);
    label(ctx, t('a month on'), X(span), bot + 30, { size: 10, align: 'right' });
    // the timeline with the review markers to drag
    line(ctx, L, bot + 12, R, bot + 12, C.faint, 1);
    const stack = new Map<number, number>();
    for (const r of reviews) {
      const k = stack.get(r) ?? 0;
      stack.set(r, k + 1);
      dot(ctx, X(r), bot + 12 - k * 7, 6, C.cool);
    }
    dot(ctx, X(0), bot + 12, 5, C.ink);
    label(ctx, t('learn'), X(0), bot + 30, { size: 10 });
  };

  const pct = (r: number) => `${formatNumber(Math.round(r * 100))}%`;
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('How much you remember over {d} days, with four reviews', { d: test + LATER })} />
      <Choice
        label={t('Schedules')}
        value={presets.find(([, days]) => days.every((d, i) => d === reviews[i]))?.[0] ?? ''}
        onChange={(name) => setReviews(presets.find(([n]) => n === name)![1])}
        options={presets.map(([name]) => ({ value: name, label: name }))}
      />
      <Range label={t('Test on day')} value={test} min={7} max={60} onChange={setTestDay} />
      <Readouts
        items={[
          { label: t('On the test'), value: pct(onTest), tone: 'accent' },
          { label: t('A month later'), value: pct(later), tone: later >= 0.3 ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Drag the four blue reviews. A simple model of forgetting, not real data.')}</p>
    </div>
  );
}
