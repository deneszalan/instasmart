import { useState } from 'react';
import { C, Choice, font, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Read a source against claims: the telegram the US Legation in Budapest sent on 19 July 1956, the day after Mátyás
 * Rákosi resigned (Foreign Relations of the United States 1955–1957, vol. XXV, doc. 83). Each claim about the change
 * at the top is either supported or contradicted by a line of the telegram.
 */
export type Verdict = 'supported' | 'contradicted';
export interface Claim {
  id: string;
  verdict: Verdict;
}
export const CLAIMS: Claim[] = [
  { id: 'health', verdict: 'contradicted' },
  { id: 'petofi', verdict: 'contradicted' },
  { id: 'wages', verdict: 'supported' },
  { id: 'army', verdict: 'supported' },
  { id: 'break', verdict: 'contradicted' },
];

/** How many claims have been judged right. */
export const score = (answers: Record<string, Verdict | undefined>) => CLAIMS.filter((c) => answers[c.id] === c.verdict).length;

const PAPER = '#efe6c8', DARK = '#1a1712';

function claimText(id: string) {
  switch (id) {
    case 'health':
      return t('Rákosi gave only his health as the reason for going.');
    case 'petofi':
      return t('The new leader, Ernő Gerő, praised the Petőfi Circle’s debates.');
    case 'wages':
      return t('Gerő’s plan still promised a 25% rise in real wages.');
    case 'army':
      return t('Gerő announced a cut of 15,000 in the armed forces.');
    default:
      return t('The US Legation saw a clean break with the Rákosi years.');
  }
}
function lineText(id: string) {
  switch (id) {
    case 'health':
      return t('“Rakosi’s speech … dilated further on his health, and also on his mistakes”');
    case 'petofi':
      return t('Gerő warned of the enemy, citing “Poznan, Petofi Club, Western spies”');
    case 'wages':
      return t('“25 percent increase in real wages retained”');
    case 'army':
      return t('“further reduction of 15,000 in armed forces”');
    default:
      return t('“Gero with hardly more savory record in … old gang with exception Rakosi still there”');
  }
}

/** Wraps `s` into lines no wider than `maxW` at the current font. */
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

export default function TelegramClaims({ onDone }: LabProps) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Verdict | undefined>>({});
  const claim = CLAIMS[i];
  const answer = answers[claim.id];
  const right = score(answers);
  useGoal(right === CLAIMS.length, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the claim, and the score
    label(ctx, t('Claim {n} of {total}', { n: formatNumber(i + 1), total: formatNumber(CLAIMS.length) }), 8, 10, { size: 10, color: C.faint, align: 'left' });
    label(ctx, `${t('Claims judged right')}: ${formatNumber(right)} / ${formatNumber(CLAIMS.length)}`, w - 8, 10, { size: 10, color: right === CLAIMS.length ? C.good : C.faint, align: 'right' });
    font(ctx, 14, 700);
    const lines = wrap(ctx, claimText(claim.id), w - 20);
    lines.forEach((l, j) => label(ctx, l, w / 2, 30 + j * 18, { size: 14, color: C.ink }));
    // the telegram: its line shows once the reader has judged
    const ty = 30 + lines.length * 18, th = h - ty - 20;
    ctx.fillStyle = PAPER;
    ctx.fillRect(6, ty, w - 12, th);
    label(ctx, t('US Legation, Budapest, 19 July 1956'), w / 2, ty + 9, { size: 9, color: '#6b6250' });
    if (answer) {
      font(ctx, 12, 600);
      const tl = wrap(ctx, lineText(claim.id), w - 28);
      tl.forEach((l, j) => label(ctx, l, w / 2, ty + 25 + j * 15, { size: 12, weight: 600, color: DARK }));
      const ok = answer === claim.verdict;
      label(ctx, ok ? t('That matches the telegram') : t('Read the line again'), w / 2, ty + th - 8, { size: 11, color: ok ? '#15803d' : '#b91c1c' });
    } else label(ctx, t('Judge the claim to see the line'), w / 2, ty + th / 2 + 4, { size: 11, color: '#6b6250' });
    // progress dots, and how to move on
    CLAIMS.forEach((c, j) => {
      const a = answers[c.id];
      ctx.fillStyle = !a ? C.faint : a === c.verdict ? C.good : C.bad;
      ctx.beginPath();
      ctx.arc(14 + j * 14, h - 8, j === i ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
    label(ctx, t('Tap here for the next claim'), w - 8, h - 8, { size: 10, color: C.soft, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={(p) => p.kind === 'down' && setI((i + 1) % CLAIMS.length)} label={`${claimText(claim.id)} ${answer ? lineText(claim.id) : ''}`} />
      <Choice
        label={t('Does the telegram support the claim?')}
        options={[
          { value: 'supported', label: t('Supported by it') },
          { value: 'contradicted', label: t('Contradicted by it') },
        ]}
        value={answer ?? ('' as Verdict)}
        onChange={(v) => setAnswers((s) => ({ ...s, [claim.id]: v }))}
      />
    </div>
  );
}
