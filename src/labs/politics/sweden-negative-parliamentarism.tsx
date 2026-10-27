import { useRef, useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

export type PmVote = 'yes' | 'abstain' | 'no';

/** Seats in the Riksdag after the election of 13 September 2026, from the party breakdown of the vote on 15 October. */
export const PARTIES = [
  { id: 'S', seats: 99 },
  { id: 'M', seats: 70 },
  { id: 'SD', seats: 62 },
  { id: 'V', seats: 30 },
  { id: 'C', seats: 25 },
  { id: 'KD', seats: 22 },
  { id: 'MP', seats: 22 },
  { id: 'L', seats: 19 },
] as const;
export const MPS = PARTIES.reduce((n, p) => n + p.seats, 0); // 349
/** A candidate is rejected if more than half of all members vote no. */
export const REJECT_AT = Math.floor(MPS / 2) + 1; // 175

/** 15 October 2026: only the Social Democrats voted for Magdalena Andersson (here with nobody absent). */
export const OCT_15: PmVote[] = ['yes', 'no', 'no', 'no', 'no', 'no', 'no', 'no'];

/** Count a prime-minister vote where every MP votes with their party. */
export function tally(votes: PmVote[]) {
  let yes = 0, no = 0, abstain = 0;
  votes.forEach((v, i) => {
    const n = PARTIES[i].seats;
    if (v === 'yes') yes += n;
    else if (v === 'no') no += n;
    else abstain += n;
  });
  return { yes, no, abstain, approved: no < REJECT_AT };
}

const NEXT: Record<PmVote, PmVote> = { yes: 'abstain', abstain: 'no', no: 'yes' };
const COL: Record<PmVote, string> = { yes: '#5cc6b6', abstain: '#93a1ad', no: '#f08b5b' };
const GOLD = '#f2cf5b';

export default function SwedenPmVote({ onDone }: LabProps) {
  const [votes, setVotes] = useState<PmVote[]>(OCT_15);
  const r = tally(votes);
  useGoal(r.approved && r.no > r.yes, onDone);
  const size = useRef({ w: 0, h: 0 });

  const tiles = (w: number, h: number) => {
    const tw = (w - 16 - 3 * 8) / 4, th = Math.min(h * 0.27, 62);
    return PARTIES.map((_, i) => ({ x: 8 + (i % 4) * (tw + 8), y: 6 + Math.floor(i / 4) * (th + 8), w: tw, h: th }));
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const i = tiles(size.current.w, size.current.h).findIndex((c) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h);
    if (i >= 0) setVotes(votes.map((v, j) => (j === i ? NEXT[v] : v)));
  };

  const voteName = (v: PmVote) => (v === 'yes' ? t('yes') : v === 'no' ? t('no') : t('abstain'));

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    const all = tiles(s.w, s.h);
    all.forEach((c, i) => {
      ctx.fillStyle = COL[votes[i]];
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 6);
      ctx.fill();
      label(ctx, PARTIES[i].id, c.x + c.w / 2, c.y + c.h * 0.32, { size: 15, color: '#101b24' });
      label(ctx, `${PARTIES[i].seats} · ${voteName(votes[i])}`, c.x + c.w / 2, c.y + c.h * 0.72, { size: 10, weight: 600, color: '#101b24' });
    });
    // the no bar: no votes from the left, the rest from the right, a gold line at 175
    const L = 8, R = s.w - 8, y = all[7].y + all[7].h + 34, bh = Math.max(16, Math.min(26, s.h - y - 22));
    const X = (n: number) => L + ((R - L) * n) / MPS;
    ctx.fillStyle = C.line;
    ctx.fillRect(L, y, R - L, bh);
    ctx.fillStyle = COL.no;
    ctx.fillRect(L, y, X(r.no) - L, bh);
    ctx.fillStyle = COL.yes;
    ctx.fillRect(X(MPS - r.yes), y, R - X(MPS - r.yes), bh);
    ctx.fillStyle = COL.abstain;
    ctx.fillRect(X(MPS - r.yes - r.abstain), y, X(MPS - r.yes) - X(MPS - r.yes - r.abstain), bh);
    line(ctx, X(REJECT_AT - 0.5), y - 8, X(REJECT_AT - 0.5), y + bh + 8, GOLD, 2.5, [5, 4]);
    label(ctx, t('{n} no votes reject', { n: REJECT_AT }), X(REJECT_AT - 0.5), y - 15, { size: 10, color: GOLD });
    label(ctx, t('no {n}', { n: r.no }), L, y + bh + 11, { size: 10, align: 'left', color: COL.no });
    label(ctx, t('yes {n}', { n: r.yes }), R, y + bh + 11, { size: 10, align: 'right', color: COL.yes });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('A prime-minister vote in the Riksdag: {y} yes, {n} no, {a} abstaining', { y: r.yes, n: r.no, a: r.abstain })} />
      <div className="lab__row">
        <span className="lab__note">{t('Tap a party to change its vote. S Social Democrats, M Moderates, SD Sweden Democrats, V Left, C Centre, KD Christian Democrats, MP Greens, L Liberals.')}</span>
        <Btn ghost onClick={() => setVotes(OCT_15)}>
          {t('Back to 15 October')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Yes votes'), value: `${r.yes}` },
          { label: t('No votes'), value: `${r.no}`, tone: r.no >= REJECT_AT ? 'bad' : undefined },
          { label: t('Abstaining'), value: `${r.abstain}` },
          { label: t('Candidate'), value: r.approved ? t('PM approved') : t('PM rejected'), tone: r.approved ? 'good' : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: every MP votes with their party, and nobody is absent.')}</p>
    </div>
  );
}
