import { useRef, useState } from 'react';
import { C, Choice, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

export interface Midterm {
  year: number;
  president: string;
  party: 'D' | 'R';
  house: number;
  senate: number;
}

/** Seats won or lost by the president's party in each midterm since 1946 (American Presidency Project, UCSB). */
export const MIDTERMS: Midterm[] = [
  [1946, 'Truman', 'D', -56, -12], [1950, 'Truman', 'D', -28, -6], [1954, 'Eisenhower', 'R', -18, -1], [1958, 'Eisenhower', 'R', -48, -13],
  [1962, 'Kennedy', 'D', -4, 3], [1966, 'Johnson', 'D', -47, -4], [1970, 'Nixon', 'R', -12, 2], [1974, 'Ford', 'R', -48, -5],
  [1978, 'Carter', 'D', -15, -3], [1982, 'Reagan', 'R', -26, 1], [1986, 'Reagan', 'R', -5, -8], [1990, 'G. H. W. Bush', 'R', -8, -1],
  [1994, 'Clinton', 'D', -54, -8], [1998, 'Clinton', 'D', 4, 0], [2002, 'G. W. Bush', 'R', 8, 2], [2006, 'G. W. Bush', 'R', -30, -6],
  [2010, 'Obama', 'D', -63, -6], [2014, 'Obama', 'D', -13, -9], [2018, 'Trump', 'R', -41, 2], [2022, 'Biden', 'D', -9, 1],
].map(([year, president, party, house, senate]) => ({ year, president, party, house, senate }) as Midterm);

/** How many midterms the president's party lost seats in, and its average change, in one chamber. */
export function record(chamber: 'house' | 'senate') {
  const changes = MIDTERMS.map((m) => m[chamber]);
  return { losses: changes.filter((c) => c < 0).length, average: changes.reduce((a, b) => a + b, 0) / changes.length };
}

const DEM = '#7aa7e8', REP = '#f08a80';

export default function MidtermPenalty({ onDone }: LabProps) {
  const [chamber, setChamber] = useState<'house' | 'senate'>('house');
  const [pick, setPick] = useState(MIDTERMS.length - 1);
  const [seen, setSeen] = useState<number[]>([]);
  const m = MIDTERMS[pick];
  const { losses, average } = record(chamber);
  useGoal(seen.includes(1998) && seen.includes(2002), onDone);

  const geometry = (w: number, h: number) => {
    const L = 30, R = w - 8, top = 10, bot = h - 20, zero = top + (bot - top) * (chamber === 'house' ? 0.13 : 0.22);
    const scale = (chamber === 'house' ? 66 : 14) / (bot - zero);
    return { L, R, top, bot, zero, slot: (R - L) / MIDTERMS.length, y: (v: number) => zero - v / scale };
  };
  const size = useRef({ w: 0, h: 0 });

  const choose = (i: number) => {
    setPick(i);
    if (chamber === 'house' && MIDTERMS[i].house > 0 && !seen.includes(MIDTERMS[i].year)) setSeen([...seen, MIDTERMS[i].year]);
  };
  const onPointer = (p: StagePointer) => {
    if (p.kind === 'up') return;
    const g = geometry(size.current.w, size.current.h);
    choose(Math.max(0, Math.min(MIDTERMS.length - 1, Math.floor((p.x - g.L) / g.slot))));
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const g = geometry(s.w, s.h);
    for (const v of chamber === 'house' ? [-20, -40, -60] : [-5, -10]) {
      line(ctx, g.L, g.y(v), g.R, g.y(v), C.line, 1);
      label(ctx, `${v}`, g.L - 4, g.y(v), { size: 9.5, align: 'right', color: C.faint });
    }
    MIDTERMS.forEach((d, i) => {
      const v = d[chamber], x = g.L + g.slot * i + g.slot * 0.18, bw = g.slot * 0.64;
      ctx.fillStyle = d.party === 'D' ? DEM : REP;
      ctx.globalAlpha = i === pick ? 1 : 0.55;
      ctx.fillRect(x, Math.min(g.zero, g.y(v)), bw, Math.max(2, Math.abs(g.y(v) - g.zero)));
      ctx.globalAlpha = 1;
      if (i === pick) {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, Math.min(g.zero, g.y(v)) - 2, bw + 4, Math.max(2, Math.abs(g.y(v) - g.zero)) + 4);
      }
      if (i % 4 === 0) label(ctx, `’${String(d.year).slice(2)}`, x + bw / 2, g.bot + 10, { size: 9.5, color: C.faint });
    });
    line(ctx, g.L, g.zero, g.R, g.zero, C.soft, 1.5);
    line(ctx, g.L, g.y(average), g.R, g.y(average), C.accent, 1.5, [5, 4]);
  };

  const sign = (v: number) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−'));
  return (
    <div className="lab">
      <Choice
        label={t('Chamber')}
        value={chamber}
        onChange={setChamber}
        options={[
          { value: 'house', label: t('House') },
          { value: 'senate', label: t('Senate') },
        ]}
      />
      <Stage draw={draw} onPointer={onPointer} label={t('Seats won or lost by the president’s party in every midterm since 1946; {y} is chosen', { y: m.year })} />
      <Readouts
        items={[
          { label: t('Midterm'), value: `${m.year} · ${m.president}` },
          { label: t('Seats'), value: sign(m[chamber]), tone: m[chamber] > 0 ? 'good' : m[chamber] < 0 ? 'bad' : undefined },
          { label: t('Losses since 1946'), value: t('{n} of {all}', { n: losses, all: MIDTERMS.length }), tone: 'accent' },
        ]}
      />
    </div>
  );
}
