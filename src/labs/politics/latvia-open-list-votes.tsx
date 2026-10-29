import { useRef, useState } from 'react';
import { Btn, C, Choice, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** An imaginary party list, as in the post's animation: six names in printed order, 1,000 ballots, 2 seats. */
export const BALLOTS = 1000;
export const SEATS = 2;
export const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
/** Marks added per tap. */
export const STEP = 50;

export interface Marks {
  pro: number[];
  con: number[];
}
export const NO_MARKS: Marks = { pro: NAMES.map(() => 0), con: NAMES.map(() => 0) };

/** Latvia's rule: each name gets the list's ballots, plus its "for" marks, minus its "against" marks. */
export const votes = (m: Marks) => NAMES.map((_, i) => BALLOTS + m.pro[i] - m.con[i]);

/** Names (by index) from most votes to fewest; in this lab a tie goes to the name printed higher. */
export function ranking(m: Marks) {
  const v = votes(m);
  return NAMES.map((_, i) => i).sort((a, b) => v[b] - v[a] || a - b);
}

/** Indexes of the names that win the list's seats. */
export const elected = (m: Marks) => ranking(m).slice(0, SEATS);

const GREEN = '#72d79e', GOLD = '#f3c45c', PAPER = '#f5f0e7', INK = '#2a2023';
const LAST = NAMES.length - 1;

export default function LatviaOpenList({ onDone }: LabProps) {
  const [marks, setMarks] = useState<Marks>(NO_MARKS);
  const [kind, setKind] = useState<'pro' | 'con'>('pro');
  const v = votes(marks), rank = ranking(marks), seats = elected(marks);
  const place = rank.indexOf(LAST) + 1;
  useGoal(seats.includes(LAST) && marks.pro[LAST] === 0, onDone);
  const size = useRef({ w: 0, h: 0 });

  const rows = (w: number, h: number) => {
    const top = 18, rh = Math.min(44, (h - top - 4) / NAMES.length);
    return NAMES.map((_, i) => ({ x: 6, y: top + i * rh, w: w * 0.44, h: rh - 5 }));
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const i = rows(size.current.w, size.current.h).findIndex((r) => p.y >= r.y - 2 && p.y <= r.y + r.h + 2 && p.x <= r.x + r.w + 4);
    if (i < 0) return;
    const next = { pro: [...marks.pro], con: [...marks.con] };
    next[kind][i] = Math.min(500, next[kind][i] + STEP);
    setMarks(next);
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const all = rows(s.w, s.h);
    const x0 = s.w * 0.5, x1 = s.w - 6, lo = 700, hi = 1300;
    label(ctx, t('Ballot, in printed order'), all[0].x + 2, 9, { size: 10, align: 'left', color: C.soft });
    label(ctx, t('Votes, highest first'), x0, 9, { size: 10, align: 'left', color: C.soft });
    // left: the ballot, in printed order, with its marks
    all.forEach((r, i) => {
      ctx.fillStyle = PAPER;
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.w, r.h, 5);
      ctx.fill();
      const cy = r.y + r.h / 2, size = Math.min(15, Math.max(11, r.h * 0.56));
      label(ctx, `${i + 1}. ${NAMES[i]}`, r.x + 8, cy, { size, align: 'left', color: INK });
      label(ctx, `+${marks.pro[i]}`, r.x + r.w * 0.66, cy, { size: size * 0.85, align: 'right', color: '#2a9a5b' });
      label(ctx, `−${marks.con[i]}`, r.x + r.w - 6, cy, { size: size * 0.85, align: 'right', color: '#cc3a3a' });
    });
    // right: the count, from most votes to fewest, seats marked
    const X = (n: number) => x0 + ((x1 - x0) * (Math.max(lo, Math.min(hi, n)) - lo)) / (hi - lo);
    rank.forEach((i, p) => {
      const r = all[p];
      const seat = p < SEATS, cy = r.y + r.h / 2;
      ctx.fillStyle = seat ? 'rgba(243,196,92,0.16)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x0, r.y, x1 - x0, r.h);
      ctx.fillStyle = i === LAST ? GREEN : seat ? GOLD : 'rgba(255,255,255,0.45)';
      ctx.fillRect(x0, r.y + r.h * 0.18, X(v[i]) - x0, r.h * 0.64);
      label(ctx, `${NAMES[i]} · ${formatNumber(v[i])}`, x0 + 6, cy, { size: Math.min(13, Math.max(10.5, r.h * 0.5)), align: 'left', color: '#111' });
      if (seat) label(ctx, t('takes a seat'), x1 - 4, cy, { size: 10, align: 'right', color: GOLD });
    });
    const lx = X(BALLOTS);
    ctx.strokeStyle = C.faint;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(lx, all[0].y - 3);
    ctx.lineTo(lx, all[LAST].y + all[LAST].h + 3);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        onPointer={onPointer}
        label={t('An example party list of six names and their votes; the seats go to {a} and {b}', { a: NAMES[seats[0]], b: NAMES[seats[1]] })}
      />
      <div className="lab__row">
        <Choice
          label={t('Mark to add')}
          options={[
            { value: 'pro', label: t('Mark for') },
            { value: 'con', label: t('Mark against') },
          ]}
          value={kind}
          onChange={setKind}
        />
        <Btn ghost onClick={() => setMarks(NO_MARKS)}>
          {t('Clear the marks')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Seats go to'), value: `${NAMES[seats[0]]}, ${NAMES[seats[1]]}`, tone: seats.includes(LAST) ? 'good' : undefined },
          { label: t('Place of F'), value: `${place}` },
          { label: t('For marks on F'), value: `${marks.pro[LAST]}`, tone: marks.pro[LAST] > 0 ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">
        {t('Tap a name on the ballot to add 50 marks. Votes = 1,000 ballots + for − against. Simplified: an imaginary list with 2 seats; here a tie goes to the name printed higher.')}
      </p>
    </div>
  );
}
