import { useRef, useState } from 'react';
import { C, clamp, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const MARKS = [1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TICKS = Array.from({ length: 91 }, (_, i) => 1 + i * 0.1);

const sig = (v: number) => formatNumber(Number(v.toPrecision(3)));

export default function SlideRule({ onDone }: LabProps) {
  // Where the C scale's 1 sits, and where the cursor is, both as log10 positions (0 = left end, 1 = right end of D).
  const [shift, setShift] = useState(Math.log10(1.2));
  const [cursor, setCursor] = useState(Math.log10(4));
  const grab = useRef<{ what: 'scale' | 'cursor'; from: number; start: number } | null>(null);
  const width = useRef(300);

  const x = Math.pow(10, shift), onC = Math.pow(10, cursor - shift), onD = Math.pow(10, cursor);
  const twoTimesThree = Math.abs(x - 2) < 0.04 && Math.abs(onC - 3) < 0.06;
  useGoal(twoTimesThree, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    width.current = w - 32;
    const L = 16, R = w - 16, X = (u: number) => L + u * (R - L), mid = h * 0.5;
    // the stator (D) below, the slide (C) above, sliding along it
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(L - 8, mid, R - L + 16, h * 0.32);
    ctx.fillStyle = '#e9d3a5';
    ctx.fillRect(X(shift) - 8, mid - h * 0.3, R - L + 16, h * 0.3);
    for (const v of TICKS) {
      const big = MARKS.includes(Math.round(v * 10) / 10), u = Math.log10(v);
      line(ctx, X(u), mid, X(u), mid + (big ? 14 : 7), '#3f2d14', big ? 1.5 : 1);
      line(ctx, X(shift + u), mid, X(shift + u), mid - (big ? 14 : 7), '#3f2d14', big ? 1.5 : 1);
    }
    for (const v of MARKS) {
      const u = Math.log10(v);
      label(ctx, formatNumber(v), X(u), mid + 24, { size: 11, color: '#3f2d14' });
      label(ctx, formatNumber(v), X(shift + u), mid - 22, { size: 11, color: '#3f2d14' });
    }
    label(ctx, 'C', L - 2, mid - h * 0.26, { size: 11, color: '#7c5a26', align: 'left' });
    label(ctx, 'D', L - 2, mid + h * 0.28, { size: 11, color: '#7c5a26', align: 'left' });
    // the glass cursor
    ctx.fillStyle = 'rgba(186,230,253,0.25)';
    ctx.fillRect(X(cursor) - 9, mid - h * 0.36, 18, h * 0.72);
    line(ctx, X(cursor), mid - h * 0.36, X(cursor), mid + h * 0.36, '#dc2626', 2);
    label(ctx, t('Drag the slide or the cursor'), w / 2, 12, { size: 11, color: C.soft });
  };

  const onPointer = (p: StagePointer) => {
    const u = (p.x - 16) / width.current;
    if (p.kind === 'down') {
      grab.current = Math.abs(u - cursor) < 0.05 ? { what: 'cursor', from: u, start: cursor } : { what: 'scale', from: u, start: shift };
    } else if (p.kind === 'move' && grab.current) {
      const v = grab.current.start + (u - grab.current.from);
      if (grab.current.what === 'scale') setShift(clamp(v, 0, 1));
      else setCursor(clamp(v, 0, 1));
    } else grab.current = null;
  };

  const off = cursor < shift || cursor > shift + 1;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A slide rule: C scale over D scale with a cursor')} onPointer={onPointer} />
      <Readouts
        items={[
          { label: t('C’s 1 is over'), value: sig(x) },
          { label: t('Cursor on C'), value: off ? '–' : sig(onC) },
          { label: t('Cursor on D'), value: sig(onD), tone: 'accent' },
        ]}
      />
      <p className="lab__note">
        {off ? t('The cursor is past the end of the slide.') : t('{a} × {b} ≈ {c}: the lengths log {a} and log {b} add up to log {c}.', { a: sig(x), b: sig(onC), c: sig(onD) })}
      </p>
    </div>
  );
}
