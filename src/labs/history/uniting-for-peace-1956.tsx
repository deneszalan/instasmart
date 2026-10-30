import { useRef, useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/** The UN Security Council of 1956: 11 seats, 5 of them permanent, in its alphabetical order (elected members unnamed). */
export const SEATS = ['elected', 'elected', 'China', 'elected', 'France', 'elected', 'elected', 'USSR', 'UK', 'US', 'elected'] as const;
export const PERMANENT = new Set(['China', 'France', 'USSR', 'UK', 'US']);
/** Affirmative votes needed in the 11-member Council. */
export const NEED = 7;
export type Vote = 'yes' | 'no' | 'abstain';

export function count(votes: Vote[]) {
  const yes = votes.filter((v) => v === 'yes').length;
  const vetoes = votes.filter((v, i) => v === 'no' && PERMANENT.has(SEATS[i])).length;
  return { yes, vetoes };
}
/** A substantive decision needs 7 votes and no permanent member against; a procedural one, such as calling the General Assembly under Uniting for Peace, needs only the 7. */
export const passes = (votes: Vote[], kind: 'substantive' | 'procedural') => {
  const c = count(votes);
  return c.yes >= NEED && (kind === 'procedural' || c.vetoes === 0);
};
/** The goal: a vote that a veto blocks as a decision but that still sends the matter to the Assembly. */
export const reached = (votes: Vote[]) => !passes(votes, 'substantive') && passes(votes, 'procedural');

/** The votes of 4 November 1956 on Hungary as tallied (9 yes, 1 Soviet no), with the yes votes placed for illustration. */
export const HUNGARY_DRAFT: Vote[] = SEATS.map((s, i) => (s === 'USSR' ? 'no' : i === 10 ? 'abstain' : 'yes'));

const NEXT: Record<Vote, Vote> = { abstain: 'yes', yes: 'no', no: 'abstain' };
const COL: Record<Vote, string> = { yes: '#86dba4', no: '#ff7a66', abstain: 'rgba(255,255,255,0.3)' };
const GOLD = '#f2c45a';

function places(w: number, h: number) {
  const cx = w / 2, cy = h * 0.9, rx = w * 0.44, ry = h * 0.6;
  return SEATS.map((_, i) => {
    const a = Math.PI * (0.97 - (i / (SEATS.length - 1)) * 0.94);
    return { x: cx + rx * Math.cos(a), y: cy - ry * Math.sin(a), a };
  });
}

export default function UnitingForPeace({ onDone }: LabProps) {
  const [votes, setVotes] = useState<Vote[]>(SEATS.map(() => 'abstain'));
  const c = count(votes);
  useGoal(reached(votes), onDone);
  const size = useRef({ w: 0, h: 0 });

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const pts = places(size.current.w, size.current.h);
    const r = Math.min(16, size.current.w / 22, size.current.h / 8);
    const i = pts.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) <= r + 6);
    if (i >= 0) setVotes(votes.map((v, j) => (j === i ? NEXT[v] : v)));
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const pts = places(s.w, s.h), r = Math.min(16, s.w / 22, s.h / 8);
    pts.forEach((q, i) => {
      ctx.fillStyle = COL[votes[i]];
      ctx.beginPath();
      ctx.arc(q.x, q.y, r * 0.78, 0, Math.PI * 2);
      ctx.fill();
      if (PERMANENT.has(SEATS[i])) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
        ctx.stroke();
        label(ctx, SEATS[i], q.x + (r + 8) * Math.cos(q.a) * 0.9, q.y - r - 12, { size: 10, color: C.soft });
      }
    });
    label(ctx, t('{y} yes votes, {n} needed', { y: c.yes, n: NEED }), s.w / 2, s.h * 0.66, { size: 13, color: c.yes >= NEED ? '#86dba4' : C.soft });
    label(ctx, t('Tap a seat: yes, no, abstain'), s.w / 2, s.h * 0.66 + 18, { size: 10, color: C.faint });
  };

  const sub = passes(votes, 'substantive'), proc = passes(votes, 'procedural');
  const why = c.yes < NEED ? t('Too few votes') : c.vetoes ? t('Vetoed') : t('Adopted');
  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('The 1956 Security Council: {y} yes votes, {v} permanent members against', { y: c.yes, v: c.vetoes })} />
      <div className="lab__row">
        <Btn ghost onClick={() => setVotes(HUNGARY_DRAFT)}>
          {t('Votes of 4 November 1956')}
        </Btn>
        <Btn ghost onClick={() => setVotes(SEATS.map(() => 'abstain'))}>
          {t('Clear the votes')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('As a decision'), value: why, tone: sub ? 'good' : 'bad' },
          { label: t('Calling the Assembly'), value: proc ? t('Adopted') : t('Too few votes'), tone: proc ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the 1956 Council of 11, needing 7 votes; gold rings are the 5 permanent members. The 4 November button sets the tally, not each seat’s real vote.')}</p>
    </div>
  );
}
