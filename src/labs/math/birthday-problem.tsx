import { useState } from 'react';
import { Btn, C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const MAX = 80;

/** Chance that at least two of n people share a birthday, with 365 equally likely days. */
export function shared(n: number): number {
  let none = 1;
  for (let i = 0; i < n; i++) none *= (365 - i) / 365;
  return 1 - none;
}

/** Chance that at least one of the other n − 1 people shares your birthday. */
export function sharesMine(n: number): number {
  return 1 - Math.pow(364 / 365, n - 1);
}

const pct = (p: number) => `${formatNumber(Math.round(p * 1000) / 10)}%`;

export default function BirthdayProblem({ onDone }: LabProps) {
  const [n, setN] = useState(10);
  const [room, setRoom] = useState<number[] | null>(null);
  const [rooms, setRooms] = useState({ tried: 0, matched: 0, at: 10 });
  useGoal(n === 23, onDone);

  const fill = () => {
    const days = Array.from({ length: n }, () => Math.floor(Math.random() * 365));
    const match = new Set(days).size < days.length;
    setRoom(days);
    setRooms((r) => (r.at === n ? { tried: r.tried + 1, matched: r.matched + (match ? 1 : 0), at: n } : { tried: 1, matched: match ? 1 : 0, at: n }));
  };
  const change = (v: number) => {
    setN(v);
    setRoom(null);
  };

  const p = shared(n);
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 30, R = w - 10, T = 12, B = room ? h - 46 : h - 22;
    const x = (k: number) => L + ((k - 1) / (MAX - 1)) * (R - L), y = (q: number) => B - q * (B - T);
    for (const q of [0, 0.5, 1]) {
      line(ctx, L, y(q), R, y(q), q === 0.5 ? C.faint : C.line, 1, q === 0.5 ? [4, 4] : []);
      label(ctx, `${q * 100}%`, L - 4, y(q), { size: 10, align: 'right' });
    }
    for (const [f, color] of [[sharesMine, C.cool], [shared, C.accent]] as const) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let k = 1; k <= MAX; k++) ctx[k === 1 ? 'moveTo' : 'lineTo'](x(k), y(f(k)));
      ctx.stroke();
    }
    line(ctx, x(n), T, x(n), B, C.soft, 1.5);
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(x(n), y(p), 5, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, t('any two share'), x(MAX) - 2, y(shared(MAX)) + 12, { size: 11, color: C.accent, align: 'right' });
    label(ctx, t('someone shares yours'), x(MAX) - 2, y(sharesMine(MAX)) - 10, { size: 11, color: C.cool, align: 'right' });
    if (room) {
      // The room: each person's birthday on a strip of 365 days; matches stand out.
      const counts = new Map<number, number>();
      for (const d of room) counts.set(d, (counts.get(d) ?? 0) + 1);
      const sy = h - 22;
      ctx.fillStyle = C.line;
      ctx.fillRect(L, sy - 6, R - L, 12);
      for (const [d, c] of counts) {
        const px = L + (d / 364) * (R - L);
        ctx.fillStyle = c > 1 ? C.bad : C.ink;
        ctx.fillRect(px - (c > 1 ? 2 : 1), sy - (c > 1 ? 11 : 6), c > 1 ? 4 : 2, c > 1 ? 22 : 12);
      }
      label(ctx, t('Jan'), L, sy + 16, { size: 10, align: 'left' });
      label(ctx, t('Dec'), R, sy + 16, { size: 10, align: 'right' });
    }
  };

  const match = room && new Set(room).size < room.length;
  return (
    <div className="lab">
      <Stage draw={draw} label={t('Chance of a shared birthday with {n} people: {p}', { n, p: pct(p) })} />
      <Range label={t('People')} value={n} min={2} max={MAX} onChange={change} />
      <Readouts
        items={[
          { label: t('Any two share'), value: pct(p), tone: p > 0.5 ? 'accent' : undefined },
          { label: t('Pairs to compare'), value: formatNumber((n * (n - 1)) / 2) },
          { label: t('Someone shares yours'), value: pct(sharesMine(n)) },
        ]}
      />
      <div className="lab__row">
        <Btn onClick={fill}>{t('Fill a room')}</Btn>
        {room && (
          <span className="lab__note" aria-live="polite">
            {match ? t('A match!') : t('No match.')} {t('Rooms with a match: {m} of {k}', { m: rooms.matched, k: rooms.tried })}
          </span>
        )}
      </div>
    </div>
  );
}
