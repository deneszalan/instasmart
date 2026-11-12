import { useState } from 'react';
import { C, Choice, font, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * The Greater Budapest Central Workers' Council's demands and what János Kádár's government did with them, from the
 * UN Special Committee's report of 1957 (paras 85, 646–652): guess Kádár's answer to each, then read the record.
 */
export type Outcome = 'granted' | 'takenBack' | 'refused';
export const DEMANDS: { id: string; outcome: Outcome }[] = [
  { id: 'councils', outcome: 'takenBack' },
  { id: 'national', outcome: 'refused' },
  { id: 'troops', outcome: 'takenBack' },
  { id: 'nagy', outcome: 'refused' },
  { id: 'writing', outcome: 'refused' },
];
/** How many guesses match the record. */
export const matches = (guesses: Record<string, Outcome | undefined>) => DEMANDS.filter((d) => guesses[d.id] === d.outcome).length;
/** How many of the demands Kádár granted, by the record. */
export const granted = () => DEMANDS.filter((d) => d.outcome === 'granted').length;

const BLUE = '#6fa3d8', WARM = '#f0c36a';

function demandText(id: string) {
  switch (id) {
    case 'councils':
      return t('Workers’ councils run the factories');
    case 'national':
      return t('A national body of all the workers’ councils');
    case 'troops':
      return t('Soviet troops leave Hungary');
    case 'nagy':
      return t('Imre Nagy returns as prime minister');
    default:
      return t('Kádár’s promises put in writing');
  }
}
function recordText(id: string) {
  switch (id) {
    case 'councils':
      return t('21 Nov: councils recognised in each factory, but ministries appoint the directors. 9 Dec: every council above the factory is banned.');
    case 'national':
      return t('17 Nov: Kádár sees no need for a national body, since Hungary has “a workers’ Government”.');
    case 'troops':
      return t('17 Nov: he will use his influence. 25 Nov: talks on a withdrawal only once order is restored.');
    case 'nagy':
      return t('25 Nov: Kádár calls Imre Nagy’s government a camouflage for counter-revolutionaries.');
    default:
      return t('17 Nov: Kádár answers that his word should be enough.');
  }
}
function outcomeText(o: Outcome) {
  return o === 'granted' ? t('Granted by Kádár') : o === 'takenBack' ? t('Promised, then taken back') : t('Refused outright');
}

function wrap(ctx: CanvasRenderingContext2D, s: string, maxW: number) {
  const out: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxW && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export default function KadarsAnswers({ onDone }: LabProps) {
  const [i, setI] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, Outcome | undefined>>({});
  const d = DEMANDS[i];
  const guess = guesses[d.id];
  const answered = DEMANDS.filter((x) => guesses[x.id]).length;
  useGoal(answered === DEMANDS.length, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    label(ctx, t('Demand {n} of {total}', { n: formatNumber(i + 1), total: formatNumber(DEMANDS.length) }), 8, 10, { size: 10, color: C.faint, align: 'left' });
    label(ctx, `${t('Guesses that match')}: ${formatNumber(matches(guesses))} / ${formatNumber(DEMANDS.length)}`, w - 8, 10, { size: 10, color: C.faint, align: 'right' });
    // the demand, on the council's blue card
    font(ctx, 14, 700);
    const dl = wrap(ctx, demandText(d.id), w - 28);
    const ch = 12 + dl.length * 17;
    ctx.fillStyle = 'rgba(111,163,216,0.22)';
    ctx.fillRect(6, 20, w - 12, ch);
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 20, w - 12, ch);
    dl.forEach((l, j) => label(ctx, l, w / 2, 20 + 14 + j * 17, { size: 14, color: C.ink }));
    // the record
    const ry = 20 + ch + 14;
    if (guess) {
      const ok = guess === d.outcome;
      label(ctx, outcomeText(d.outcome), w / 2, ry, { size: 13, color: d.outcome === 'refused' ? C.bad : WARM });
      font(ctx, 12, 500);
      wrap(ctx, recordText(d.id), w - 20).forEach((l, j) => label(ctx, l, w / 2, ry + 18 + j * 15, { size: 12, weight: 500, color: C.soft }));
      label(ctx, ok ? t('Your guess matches the record') : t('The record says otherwise'), w / 2, h - 24, { size: 11, color: ok ? C.good : C.bad });
    } else label(ctx, t('Guess Kádár’s answer to see the record'), w / 2, ry + 14, { size: 11, color: C.soft });
    // one dot per demand, and how to move on
    DEMANDS.forEach((x, j) => {
      const g = guesses[x.id];
      ctx.fillStyle = !g ? C.faint : g === x.outcome ? C.good : C.bad;
      ctx.beginPath();
      ctx.arc(14 + j * 14, h - 8, j === i ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
    label(ctx, t('Tap here for the next demand'), w - 8, h - 8, { size: 10, color: C.soft, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={(p) => p.kind === 'down' && setI((i + 1) % DEMANDS.length)} label={`${demandText(d.id)}${guess ? `: ${outcomeText(d.outcome)}. ${recordText(d.id)}` : ''}`} />
      <Choice
        label={t('What did Kádár’s government do with this demand?')}
        options={(['granted', 'takenBack', 'refused'] as Outcome[]).map((o) => ({ value: o, label: outcomeText(o) }))}
        value={guess ?? ('' as Outcome)}
        onChange={(o) => setGuesses((s) => ({ ...s, [d.id]: o }))}
      />
    </div>
  );
}
