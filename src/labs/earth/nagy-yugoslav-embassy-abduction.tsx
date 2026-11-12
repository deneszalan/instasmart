import { useState } from 'react';
import { Btn, C, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Read a claim against the record. On 23 November 1956 János Kádár's government announced that Imre Nagy's group had
 * left the Yugoslav embassy and gone to Romania at its own request. The cards are facts from the UN Special
 * Committee's report (1957), paras 630–639; the reader decides whether each supports the claim, contradicts it, or
 * says nothing about it.
 */
export type Verdict = 'supports' | 'contradicts' | 'neither';
export type CardId = 'refusedRomania' | 'writtenPromise' | 'soldiersBoard' | 'notTold' | 'refuge' | 'yugoslavNote';
export const CARDS: { id: CardId; answer: Verdict }[] = [
  { id: 'refuge', answer: 'neither' },
  { id: 'refusedRomania', answer: 'contradicts' },
  { id: 'writtenPromise', answer: 'contradicts' },
  { id: 'soldiersBoard', answer: 'contradicts' },
  { id: 'notTold', answer: 'contradicts' },
  { id: 'yugoslavNote', answer: 'contradicts' },
];
export const score = (answers: Partial<Record<CardId, Verdict>>) => CARDS.filter((c) => answers[c.id] === c.answer).length;
export const tally = (v: Verdict) => CARDS.filter((c) => c.answer === v).length;
export const done = (answers: Partial<Record<CardId, Verdict>>) => score(answers) === CARDS.length;

function cardText(id: CardId) {
  switch (id) {
    case 'refuge': return t('They had taken refuge in the Yugoslav embassy on 4 November.');
    case 'refusedRomania': return t('Nagy and his group turned down the offer to go to Romania.');
    case 'writtenPromise': return t('Kádár promised in writing that they could go freely to their homes.');
    case 'soldiersBoard': return t('Soviet soldiers boarded the bus; Yugoslav diplomats were ordered off.');
    case 'notTold': return t('Forced onto a plane, they were not even told where they were going.');
    case 'yugoslavNote': return t('Yugoslavia protested: they had made clear they would refuse Romania.');
  }
}
function verdictName(v: Verdict) {
  if (v === 'supports') return t('Supports the claim');
  if (v === 'contradicts') return t('Contradicts it');
  return t('Says nothing either way');
}

/** Wrap a text into lines that fit a width, measured with the canvas. */
function wrap(ctx: CanvasRenderingContext2D, s: string, maxW: number) {
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const AMBER = '#f2b33d', TEAL = '#73c6cf', RED = '#e2675b';

export default function EmbassyClaim({ onDone }: LabProps) {
  const [answers, setAnswers] = useState<Partial<Record<CardId, Verdict>>>({});
  const [wrong, setWrong] = useState<CardId | null>(null);
  const current = CARDS.find((c) => answers[c.id] === undefined) ?? null;
  useGoal(done(answers), onDone);

  const answer = (v: Verdict) => {
    if (!current) return;
    if (v === current.answer) { setAnswers({ ...answers, [current.id]: v }); setWrong(null); }
    else setWrong(current.id);
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the claim
    ctx.fillStyle = 'rgba(242,179,61,0.14)'; ctx.beginPath(); ctx.roundRect(6, 6, w - 12, 76, 10); ctx.fill();
    label(ctx, t('THE CLAIM · Kádár government, 23 November 1956'), 16, 20, { size: 10, color: AMBER, align: 'left' });
    ctx.font = `700 ${Math.min(14, w / 26)}px system-ui, sans-serif`;
    wrap(ctx, t('Nagy’s group left the embassy and went to Romania at its own request.'), w - 40).forEach((s, i) => label(ctx, s, 16, 40 + i * 17, { size: Math.min(14, w / 26), color: C.ink, align: 'left' }));
    // the card in hand, or the tally
    const y0 = 90;
    if (current) {
      ctx.fillStyle = wrong === current.id ? 'rgba(226,103,91,0.22)' : 'rgba(115,198,207,0.14)';
      ctx.beginPath(); ctx.roundRect(6, y0, w - 12, h * 0.74 - y0 - 8, 10); ctx.fill();
      label(ctx, t('FROM THE RECORD (UN report, 1957)'), 16, y0 + 14, { size: 10, color: TEAL, align: 'left' });
      ctx.font = `600 ${Math.min(14, w / 26)}px system-ui, sans-serif`;
      wrap(ctx, cardText(current.id), w - 40).forEach((s, i) => label(ctx, s, 16, y0 + 36 + i * 17, { size: Math.min(14, w / 26), weight: 600, color: C.ink, align: 'left' }));
      if (wrong === current.id) label(ctx, t('Look again: what does this fact say about a request to go to Romania?'), w / 2, h * 0.74 - 22, { size: 10, color: RED });
    }
    // the stack of checked cards: contradicting ones in red, neutral ones grey
    const checked = CARDS.filter((c) => answers[c.id]);
    checked.forEach((c, i) => {
      const x = 12 + i * ((w - 24) / CARDS.length), bw = (w - 24) / CARDS.length - 6;
      ctx.fillStyle = c.answer === 'contradicts' ? RED : 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.roundRect(x, h * 0.74, bw, h * 0.16, 6); ctx.fill();
      label(ctx, c.answer === 'contradicts' ? '✗' : '–', x + bw / 2, h * 0.82, { size: 16, color: '#14100a' });
    });
    const against = checked.filter((c) => c.answer === 'contradicts').length;
    if (checked.length) label(ctx, t('{n} against the claim, none for it', { n: formatNumber(against) }), w / 2, h * 0.96, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={current ? cardText(current.id) : t('All facts checked')} />
      {current && (
        <div className="lab__row">
          {(['supports', 'contradicts', 'neither'] as Verdict[]).map((v) => (
            <Btn key={v} ghost onClick={() => answer(v)}>
              {verdictName(v)}
            </Btn>
          ))}
        </div>
      )}
    </div>
  );
}
