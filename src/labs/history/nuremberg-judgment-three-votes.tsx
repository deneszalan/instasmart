import { useRef, useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/** The four judges with a vote, one per Allied power; the British judge, Geoffrey Lawrence, was the Tribunal's President. */
export const PRESIDENT = 1;
/** Charter, Art. 4(c): convictions only with the votes of at least three of the four members. */
export const convicts = (guilty: boolean[]) => guilty.filter(Boolean).length >= 3;
/** Other decisions: a majority, with the President's vote deciding a 2–2 tie. */
export const ordinaryDecision = (guilty: boolean[]) => {
  const n = guilty.filter(Boolean).length;
  return n > 2 || (n === 2 && guilty[PRESIDENT]);
};

const BRASS = '#d4ab5c', BLUE = '#93b9cb';

export default function NurembergThreeVotes({ onDone }: LabProps) {
  const [votes, setVotes] = useState([true, false, true, false]);
  const n = votes.filter(Boolean).length;
  const charter = convicts(votes), ordinary = ordinaryDecision(votes);
  useGoal(charter !== ordinary, onDone);
  const size = useRef({ w: 0, h: 0 });
  const judges = [t('US judge'), t('British judge'), t('Soviet judge'), t('French judge')];

  const cells = (w: number, h: number) => {
    const cw = Math.min((w - 40) / 4, h * 0.7);
    return judges.map((_, i) => ({ x: (w - 4 * cw - 24) / 2 + i * (cw + 8), y: 16, w: cw, h: Math.min(h - 36, cw * 1.25) }));
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const i = cells(size.current.w, size.current.h).findIndex((c) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h);
    if (i >= 0) setVotes(votes.map((v, j) => (j === i ? !v : v)));
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    cells(s.w, s.h).forEach((c, i) => {
      const v = votes[i];
      ctx.fillStyle = v ? BRASS : 'rgba(147,185,203,0.18)';
      ctx.strokeStyle = v ? BRASS : BLUE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 8);
      ctx.fill();
      ctx.stroke();
      label(ctx, judges[i], c.x + c.w / 2, c.y + 14, { size: 10, color: v ? '#251a14' : C.soft });
      label(ctx, v ? t('guilty') : t('not guilty'), c.x + c.w / 2, c.y + c.h / 2 + 4, { size: 12, color: v ? '#251a14' : BLUE });
      if (i === PRESIDENT) label(ctx, t('the President'), c.x + c.w / 2, c.y + c.h - 12, { size: 9, color: v ? '#251a14' : C.soft });
    });
    label(ctx, t('Tap a judge to change the vote'), s.w / 2, s.h - 8, { size: 10, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('{n} of the 4 judges vote guilty', { n })} />
      <Readouts
        items={[
          { label: t('Votes for guilty'), value: `${n}/4` },
          { label: t('Under the Charter (3 needed)'), value: charter ? t('Guilty verdict') : t('No conviction'), tone: charter ? 'accent' : 'good' },
          { label: t('By simple majority, President breaks ties'), value: ordinary ? t('Guilty verdict') : t('No conviction') },
        ]}
      />
      <div className="lab__row">
        <span className="lab__note">{t('For other decisions the Tribunal used a majority, with the President deciding a tie. Convictions needed three votes.')}</span>
        <Btn ghost onClick={() => setVotes([true, false, true, false])}>
          {t('Reset the votes')}
        </Btn>
      </div>
    </div>
  );
}
