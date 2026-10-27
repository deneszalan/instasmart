import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** UN member states, and the majority of all of them that a Human Rights Council member needs (resolution 60/251). */
export const UN_MEMBERS = 193;
export const ELECT_AT = Math.floor(UN_MEMBERS / 2) + 1; // 97

/** Elected to the Council: votes from a majority of all UN members, however many take part. */
export const canJoin = (yes: number) => yes >= ELECT_AT;
/** Suspended from the Council: two-thirds of the members present and voting; abstentions don't count. */
export const canSuspend = (yes: number, no: number) => yes + no > 0 && 3 * yes >= 2 * (yes + no);

const YES = '#8fd3c1', NO = '#ef7d6a', ABST = '#8d9bb0', GOLD = '#f3dd8f';

export default function HumanRightsCouncilVotes({ onDone }: LabProps) {
  const [yes, setYes] = useState(120);
  const [no, setNo] = useState(70);
  const [abst, setAbst] = useState(0);
  const no2 = Math.min(no, UN_MEMBERS - yes), abst2 = Math.min(abst, UN_MEMBERS - yes - no2);
  const changeYes = (v: number) => {
    setYes(v);
    const n = Math.min(no2, UN_MEMBERS - v);
    setNo(n);
    setAbst(Math.min(abst2, UN_MEMBERS - v - n));
  };
  const changeNo = (v: number) => {
    setNo(v);
    setAbst(Math.min(abst2, UN_MEMBERS - yes - v));
  };
  const away = UN_MEMBERS - yes - no2 - abst2;
  const join = canJoin(yes), suspend = canSuspend(yes, no2);
  useGoal(suspend && !join, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 8, R = w - 8, bh = Math.min(30, h * 0.2);
    // all 193 members
    const y1 = 22, X = (n: number) => L + ((R - L) * n) / UN_MEMBERS;
    let x = L;
    for (const [n, col] of [[yes, YES], [no2, NO], [abst2, ABST], [away, C.line]] as [number, string][]) {
      ctx.fillStyle = col;
      ctx.fillRect(x, y1, X(n) - L, bh);
      x += X(n) - L;
    }
    line(ctx, X(ELECT_AT - 0.5), y1 - 6, X(ELECT_AT - 0.5), y1 + bh + 6, GOLD, 2.5, [5, 4]);
    label(ctx, t('{n} of all {m} members: elected', { n: ELECT_AT, m: UN_MEMBERS }), X(ELECT_AT - 0.5), y1 - 12, { size: 10, color: GOLD });
    // only those voting yes or no
    const y2 = y1 + bh + 46, voting = yes + no2;
    label(ctx, t('Only members voting yes or no: {n}', { n: voting }), L, y2 - 12, { size: 10, align: 'left', color: C.soft });
    ctx.fillStyle = C.line;
    ctx.fillRect(L, y2, R - L, bh);
    if (voting > 0) {
      const V = (n: number) => L + ((R - L) * n) / voting;
      ctx.fillStyle = YES;
      ctx.fillRect(L, y2, V(yes) - L, bh);
      ctx.fillStyle = NO;
      ctx.fillRect(V(yes), y2, R - V(yes), bh);
      line(ctx, V((2 * voting) / 3), y2 - 6, V((2 * voting) / 3), y2 + bh + 6, GOLD, 2.5, [5, 4]);
      label(ctx, t('two-thirds: suspended'), V((2 * voting) / 3), y2 + bh + 14, { size: 10, color: GOLD });
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{y} votes for, {n} against, {a} abstaining, {o} not voting', { y: yes, n: no2, a: abst2, o: away })} />
      <Range label={t('Votes for')} value={yes} min={0} max={UN_MEMBERS} step={1} onChange={changeYes} />
      <Range label={t('Votes against')} value={no2} min={0} max={UN_MEMBERS - yes} step={1} onChange={changeNo} />
      <Range label={t('Abstentions')} value={abst2} min={0} max={UN_MEMBERS - yes - no2} step={1} onChange={setAbst} />
      <Readouts
        items={[
          { label: t('Enough to join the Council?'), value: join ? t('yes') : t('no'), tone: join ? 'good' : 'bad' },
          { label: t('Enough to suspend a member?'), value: suspend ? t('yes') : t('no'), tone: suspend ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: a Council election has no votes against, only votes for each country. A suspension counts yes and no; abstentions are left out.')}</p>
    </div>
  );
}
