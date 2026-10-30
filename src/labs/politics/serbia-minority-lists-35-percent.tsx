import { useState } from 'react';
import { C, Choice, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Serbia's parliamentary election of 25 October 2026, in the Republic Electoral Commission's preliminary count from
 * 8,136 of 8,392 polling stations (26 October): the lists with the most votes, and whether each is a national-minority list.
 */
export interface List {
  name: string;
  votes: number;
  minority: boolean;
}
export const VOTED = 4269403;
export const SEATS = 250;
export const BONUS = 1.35;
export const LISTS: readonly List[] = [
  { name: 'Student List', votes: 2246423, minority: false },
  { name: 'United Serbia', votes: 1673241, minority: false },
  { name: 'Dačić', votes: 92532, minority: false },
  { name: 'Authentic Right', votes: 38286, minority: false },
  { name: 'SVM', votes: 34755, minority: true },
  { name: 'Albanian Coalition', votes: 27664, minority: true },
  { name: 'Ljajić', votes: 20305, minority: true },
  { name: 'Karić', votes: 19508, minority: false },
  { name: 'SDA Sandžak', votes: 12348, minority: true },
  { name: 'European Serbia', votes: 12041, minority: false },
  { name: 'SPP', votes: 11605, minority: true },
];

/** The 3% threshold, in votes: 3% of the voters who voted. */
export const THRESHOLD = 0.03 * VOTED;
/** Does a list take part in the distribution of seats? Minority lists always do. */
export const takesPart = (l: List) => l.minority || l.votes >= THRESHOLD;
/** The number a list's quotients are made from: its votes, raised by 35% for a minority list under 3%. */
export const quotientBase = (l: List) => (l.minority && l.votes < THRESHOLD ? l.votes * BONUS : l.votes);

/** d'Hondt: the `seats` highest of votes/1, votes/2, … over the lists that take part. Returns each list's seats and the last winning quotient. */
export function dhondt(lists: readonly List[], seats = SEATS): { won: number[]; last: number } {
  const q: [number, number][] = [];
  lists.forEach((l, i) => {
    if (!takesPart(l)) return;
    const b = quotientBase(l);
    for (let d = 1; d <= seats; d++) q.push([b / d, i]);
  });
  q.sort((a, b) => b[0] - a[0]);
  const won = lists.map(() => 0);
  for (const [, i] of q.slice(0, seats)) won[i]++;
  return { won, last: q[seats - 1][0] };
}

/** The real lists plus one of yours, with `votes` and of one kind. */
export const withYours = (votes: number, minority: boolean) => dhondt([...LISTS, { name: 'yours', votes, minority }]);

const GREEN = '#7fd8a4', GOLD = '#f2c14e', RED = '#e0484f';
const YOURS = LISTS.length;

export default function SerbiaMinorityLists({ onDone }: LabProps) {
  const [votes, setVotes] = useState(10000);
  const [kind, setKind] = useState<'minority' | 'ordinary'>('ordinary');
  const minority = kind === 'minority';
  const r = withYours(votes, minority);
  const seats = r.won[YOURS];
  const base = quotientBase({ name: 'yours', votes, minority });
  useGoal(seats >= 1 && votes <= 12500, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // a scale of quotients from 0 to 40,000, drawn as a vertical ladder; the cut is the 250th quotient
    // the chips sit in the middle column, so the cut's label on the right never meets them
    const lo = 0, hi = 40000, top = 22, bot = h - 20, gx = w * 0.2, cx = w * 0.5;
    const Y = (q: number) => bot - ((Math.min(hi, q) - lo) / (hi - lo)) * (bot - top);
    // on a short stage the rungs are too close to label every one
    const every = (bot - top) / 4 >= 14 ? 10000 : 20000;
    for (const q of [10000, 20000, 30000, 40000]) {
      ctx.strokeStyle = C.line;
      ctx.beginPath();
      ctx.moveTo(gx, Y(q));
      ctx.lineTo(w - 6, Y(q));
      ctx.stroke();
      if (q % every === 0) label(ctx, formatNumber(q), gx - 6, Y(q), { size: 10, align: 'right', color: C.faint });
    }
    label(ctx, t('Quotients: votes ÷ 1, 2, 3 …'), gx, 9, { size: 10, align: 'left', color: C.soft });
    // the cut
    const cy = Y(r.last);
    ctx.strokeStyle = GOLD;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(gx, cy);
    ctx.lineTo(w - 6, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, t('250th number: {q}', { q: formatNumber(Math.round(r.last)) }), w - 8, cy - 9, { size: 10, align: 'right', color: GOLD });
    // your list's quotients ÷1 … ÷4, as chips on the ladder; where a chip would sit on the one above, just a dot beside it
    let lastY = -Infinity;
    for (let d = 1; d <= 4; d++) {
      const q = base / d;
      if (q > hi) continue;
      const won = q >= r.last;
      const y = Y(q);
      // opaque chips, so the cut line never runs through their text
      ctx.fillStyle = won ? (minority ? GREEN : C.ink) : '#3b2f41';
      ctx.beginPath();
      if (y - lastY >= 18) {
        ctx.roundRect(cx - 40, y - 8, 80, 16, 4);
        ctx.fill();
        label(ctx, `÷${d} = ${formatNumber(Math.round(q))}`, cx, y, { size: 10, align: 'center', color: won ? '#050b1c' : C.soft });
        lastY = y;
      } else {
        ctx.arc(cx - 48, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // the plain votes, when the bonus lifts them
    if (minority && votes < THRESHOLD && votes > 0) {
      const y1 = Y(votes), y2 = Y(base);
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 52, y1);
      ctx.lineTo(cx - 52, y2);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      label(ctx, t('× 1.35'), cx - 56, (y1 + y2) / 2, { size: 10, align: 'right', color: GREEN });
    }
    if (!minority && votes < THRESHOLD) {
      // on the left, so it never meets the cut's label on the right; below the chip when the chip is at the top
      const y = Y(Math.min(hi, votes));
      label(ctx, t('under 3%: takes no part'), gx + 4, y - 16 >= top + 2 ? y - 16 : y + 16, { size: 10, align: 'left', color: RED });
    }
    label(ctx, t('your list'), cx, h - 7, { size: 10, align: 'center', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Your list with {v} votes wins {s} seats; the last seat goes at a quotient of {q}', { v: formatNumber(votes), s: seats, q: formatNumber(Math.round(r.last)) })} />
      <Range label={t('Votes for your list')} value={votes} min={0} max={40000} step={500} onChange={setVotes} format={(v) => formatNumber(v)} />
      <Choice
        label={t('Kind of list')}
        options={[
          { value: 'ordinary', label: t('Ordinary list') },
          { value: 'minority', label: t('Minority list') },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Readouts
        items={[
          { label: t('Seats for your list'), value: `${seats}`, tone: seats > 0 ? 'good' : undefined },
          { label: t('Student List / United Serbia'), value: `${r.won[0]} / ${r.won[1]}` },
          { label: t('Price of the last seat'), value: formatNumber(Math.round(r.last)) },
        ]}
      />
      <p className="lab__note">
        {t('Simplified: your list is added to the preliminary count of 26 October 2026 (8,136 of 8,392 stations); the 3% line is 128,082 votes. Minority lists skip it and get ×1.35 on their quotients.')}
      </p>
    </div>
  );
}
