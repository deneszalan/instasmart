import { useState } from 'react';
import { Btn, C, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** New Zealand's 2008 general election: party votes and electorates won (Electoral Commission figures). */
export const PARTIES = ['National', 'Labour', 'Green', 'ACT', 'Maori', 'Progressive', 'United', 'NZFirst'] as const;
export type Party = (typeof PARTIES)[number];
export const VOTES: Record<Party, number> = { National: 1053398, Labour: 796880, Green: 157613, ACT: 85496, Maori: 55980, Progressive: 21241, United: 20497, NZFirst: 95356 };
export const ELECTORATES: Record<Party, number> = { National: 41, Labour: 21, Green: 0, ACT: 1, Maori: 5, Progressive: 1, United: 1, NZFirst: 0 };
/** Valid party votes cast in 2008. */
export const TOTAL = 2344566;

/** The electorates won, if ACT loses Epsom and/or New Zealand First wins a seat (both from National, in this simplified what-if). */
export function electorates(actEpsom: boolean, nzfSeat: boolean): Record<Party, number> {
  const e = { ...ELECTORATES };
  if (!actEpsom) { e.ACT -= 1; e.National += 1; }
  if (nzfSeat) { e.NZFirst += 1; e.National -= 1; }
  return e;
}

/**
 * MMP as in New Zealand: parties with 5% of the party vote or at least one electorate share 120 seats by
 * Sainte-Laguë (highest votes ÷ (2 × seats + 1)); a party keeps any electorates beyond its share as overhang seats.
 */
export function allocate(e: Record<Party, number>, seats = 120) {
  const inside = PARTIES.filter((p) => VOTES[p] / TOTAL >= 0.05 || e[p] > 0);
  const share = Object.fromEntries(PARTIES.map((p) => [p, 0])) as Record<Party, number>;
  for (let s = 0; s < seats; s++) {
    let best = inside[0];
    for (const p of inside) if (VOTES[p] / (2 * share[p] + 1) > VOTES[best] / (2 * share[best] + 1)) best = p;
    share[best]++;
  }
  const total = Object.fromEntries(PARTIES.map((p) => [p, inside.includes(p) ? Math.max(share[p], e[p]) : 0])) as Record<Party, number>;
  const house = PARTIES.reduce((n, p) => n + total[p], 0);
  return { share, total, house, inside };
}

/** The goal: see both what-ifs at once, ACT without Epsom and New Zealand First with an electorate. */
export const reached = (actEpsom: boolean, nzfSeat: boolean) => !actEpsom && nzfSeat;

const COL: Record<Party, string> = { National: '#4a8fe0', Labour: '#e5554b', Green: '#62b865', ACT: '#f0c43a', Maori: '#b0485e', Progressive: '#8c7fe0', United: '#b07ad6', NZFirst: '#9aa7b0' };

export default function NewZealandMmp({ onDone }: LabProps) {
  const [actEpsom, setActEpsom] = useState(true);
  const [nzfSeat, setNzfSeat] = useState(false);
  const e = electorates(actEpsom, nzfSeat);
  const r = allocate(e);
  useGoal(reached(actEpsom, nzfSeat), onDone);
  const name = (p: Party) => ({ National: t('National Party'), Labour: t('Labour Party'), Green: t('Green Party'), ACT: t('ACT New Zealand'), Maori: t('Māori Party'), Progressive: t('Progressive Party'), United: t('United Future'), NZFirst: t('New Zealand First') })[p];

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // one row per party: name, share of the party vote, its seats as dots (electorates filled, list MPs hollow), the count
    const rows = PARTIES.length + 1, rh = (h - 6) / rows, nameW = w * 0.34, x0 = nameW + 46, x1 = w - 24;
    const dot = Math.min(rh * 0.17, (x1 - x0) / 20 / 2);
    PARTIES.forEach((p, i) => {
      const y = 3 + rh * i + rh / 2;
      const pct = (VOTES[p] / TOTAL) * 100, inside = r.inside.includes(p);
      label(ctx, name(p), nameW, y, { size: 9.5, align: 'right', color: inside ? C.ink : C.faint });
      label(ctx, `${pct.toFixed(2)}%`, nameW + 40, y, { size: 9, align: 'right', color: pct >= 5 ? C.soft : '#ff8f85' });
      const n = r.total[p], lines = Math.ceil(n / 20);
      for (let j = 0; j < n; j++) {
        const x = x0 + (j % 20) * dot * 2 + dot, yy = y + (Math.floor(j / 20) - (lines - 1) / 2) * dot * 1.7;
        ctx.beginPath();
        ctx.arc(x, yy, dot * 0.72, 0, Math.PI * 2);
        if (j < e[p]) {
          ctx.fillStyle = COL[p];
          ctx.fill();
        } else {
          ctx.strokeStyle = COL[p];
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
      if (inside) label(ctx, `${n}`, w - 4, y, { size: 10, align: 'right', color: C.ink });
      else label(ctx, t('no seats'), x0, y, { size: 9.5, align: 'left', color: '#ff8f85' });
    });
    label(ctx, t('{n} MPs in all', { n: r.house }), w - 4, 3 + rh * PARTIES.length + rh / 2, { size: 10.5, align: 'right', color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Seats in New Zealand’s 2008 parliament: {n} in all', { n: r.house })} />
      <div className="lab__row">
        <Btn ghost={!actEpsom} onClick={() => setActEpsom(!actEpsom)}>
          {actEpsom ? t('ACT keeps Epsom') : t('ACT loses Epsom')}
        </Btn>
        <Btn ghost={!nzfSeat} onClick={() => setNzfSeat(!nzfSeat)}>
          {nzfSeat ? t('NZ First wins a seat') : t('NZ First: no electorate')}
        </Btn>
      </div>
      <p className="lab__note">{t('2008 party votes, Sainte-Laguë method; filled dots are electorates. Simplified: a seat that changes hands goes to or from National.')}</p>
    </div>
  );
}
