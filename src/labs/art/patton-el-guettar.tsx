import { useState } from 'react';
import { Btn, C, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

export type Side = 'film' | 'record';
export type ClaimId = 'rommel' | 'book' | 'panzer' | 'mines' | 'weeks';

/**
 * Claims about El Guettar, each either only in the film Patton (1970) or in the record of March-April 1943
 * (Wikipedia, "Panzer Greift An", "Erwin Rommel" and "Battle of El Guettar"; National WWII Museum, "US II Corps at
 * El Guettar"): Rommel had left Africa on 9 March and never finished his tank book; the 10th Panzer Division attacked
 * the 1st Infantry Division on 23 March; mines stopped 8 tanks and guns about 30 more; the fighting went on to 7 April.
 */
export const CLAIMS: { id: ClaimId; side: Side }[] = [
  { id: 'rommel', side: 'film' },
  { id: 'panzer', side: 'record' },
  { id: 'book', side: 'film' },
  { id: 'mines', side: 'record' },
  { id: 'weeks', side: 'record' },
];

/** How many of the answers so far are right. */
export const score = (answers: Partial<Record<ClaimId, Side>>) => CLAIMS.filter((c) => answers[c.id] === c.side).length;
/** All claims sorted correctly. */
export const allRight = (answers: Partial<Record<ClaimId, Side>>) => score(answers) === CLAIMS.length;

export default function PattonElGuettar({ onDone }: LabProps) {
  const [answers, setAnswers] = useState<Partial<Record<ClaimId, Side>>>({});
  const [wrong, setWrong] = useState(false);
  const right = score(answers);
  const current = CLAIMS.find((c) => answers[c.id] !== c.side);
  useGoal(allRight(answers), onDone);

  const claimText: Record<ClaimId, string> = {
    rommel: t('Rommel commands the German attack'),
    panzer: t('The German 10th Panzer Division attacks on 23 March 1943'),
    book: t('Patton owns Rommel’s book on tank warfare'),
    mines: t('A minefield and American guns stop the German tanks'),
    weeks: t('The fighting goes on for two more weeks, with no breakthrough'),
  };
  const why: Record<ClaimId, string> = {
    rommel: t('Only in the film: Rommel had left Africa on 9 March 1943.'),
    panzer: t('In the record: it attacked the US 1st Infantry Division at dawn.'),
    book: t('Only in the film: Rommel never finished a book on tanks. His real book was Infantry Attacks (1937).'),
    mines: t('In the record: mines stopped 8 tanks; guns and tank destroyers knocked out about 30 more.'),
    weeks: t('In the record: costly attacks on the hills until 7 April. The film shows one morning.'),
  };
  const last = [...CLAIMS].reverse().find((c) => answers[c.id] === c.side);

  const answer = (side: Side) => {
    if (!current) return;
    if (side === current.side) {
      setAnswers((a) => ({ ...a, [current.id]: side }));
      setWrong(false);
    } else setWrong(true);
  };
  const done = (id: ClaimId) => answers[id] === CLAIMS.find((c) => c.id === id)!.side;

  const draw = (ctx: CanvasRenderingContext2D, { w, h: full }: { w: number; h: number }) => {
    // the claim to sort, in a band at the top
    const band = 42;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, w, band);
    {
      const s = current ? claimText[current.id] : t('All claims sorted');
      ctx.font = '700 13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = current ? (wrong ? C.bad : C.accent) : C.good;
      const lines: string[] = [''];
      for (const word of s.split(' ')) {
        const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
        if (ctx.measureText(next).width > w - 20 && lines[lines.length - 1]) lines.push(word); else lines[lines.length - 1] = next;
      }
      const y0 = band / 2 - ((Math.min(lines.length, 2) - 1) * 15) / 2;
      lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, w / 2, y0 + i * 15));
    }
    ctx.save(); ctx.translate(0, band);
    const h = full - band;
    // the valley: hills above and below a road from El Guettar (left) to Gabès (right)
    ctx.fillStyle = 'rgba(201,180,138,0.22)'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(143,123,85,0.45)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.22); ctx.quadraticCurveTo(w * 0.5, h * 0.42, 0, h * 0.3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w, h * 0.8); ctx.quadraticCurveTo(w * 0.5, h * 0.6, 0, h * 0.74); ctx.closePath(); ctx.fill();
    const roadY = h * 0.52;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(w, roadY); ctx.stroke();
    label(ctx, t('← El Guettar'), 8, roadY - 12, { size: 10, align: 'left', color: C.soft });
    label(ctx, t('to Gabès →'), w - 8, roadY - 12, { size: 10, align: 'right', color: C.soft });
    if (done('panzer')) {
      ctx.fillStyle = '#d0693f';
      for (let i = 0; i < 6; i++) ctx.fillRect(w * 0.62 + i * 14, roadY - 5 + (i % 2) * 8, 10, 6);
      label(ctx, t('10th Panzer, 23 March'), w * 0.8, roadY + 22, { size: 10, color: '#f0a08a' });
    }
    if (done('mines')) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(w * 0.53, h * 0.3, w * 0.06, h * 0.42);
      for (const [x, y] of [[0.25, 0.22], [0.4, 0.2], [0.28, 0.8], [0.42, 0.78]]) {
        ctx.fillStyle = '#9cc2f0'; ctx.beginPath(); ctx.moveTo(w * x - 8, h * y + 6); ctx.lineTo(w * x, h * y - 8); ctx.lineTo(w * x + 8, h * y + 6); ctx.closePath(); ctx.fill();
      }
      label(ctx, t('Keddab minefield'), w * 0.56, h * 0.26, { size: 10, color: C.soft });
      label(ctx, t('US guns on the hills'), w * 0.33, h * 0.12, { size: 10, color: '#9cc2f0' });
    }
    if (done('rommel')) label(ctx, t('Rommel: gone since 9 March'), w * 0.5, h * 0.06 + 6, { size: 11, color: '#f0a08a' });
    if (done('book')) label(ctx, t('No such book'), w * 0.5, h * 0.94 - 6, { size: 11, color: '#f0a08a' });
    if (done('weeks')) {
      ctx.fillStyle = C.accent; ctx.fillRect(w * 0.1, h * 0.88, w * 0.8, 4);
      label(ctx, t('23 March to 7 April'), w * 0.5, h * 0.82, { size: 10, color: C.accent });
    }
    ctx.restore();
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The valley of El Guettar, schematic: {n} of {total} claims sorted', { n: formatNumber(right), total: formatNumber(CLAIMS.length) })} />
      {current ? (
        <div className="lab__choice" role="group" aria-label={t('Film or record? {n} of {total} sorted', { n: formatNumber(right), total: formatNumber(CLAIMS.length) })}>
          <button onClick={() => answer('film')}>{t('Only in the film')}</button>
          <button onClick={() => answer('record')}>{t('In the 1943 record')}</button>
        </div>
      ) : (
        <Btn ghost onClick={() => { setAnswers({}); setWrong(false); }}>{t('Sort the claims again')}</Btn>
      )}
      <p className="lab__note">{wrong ? t('Not quite: look at the dates again.') : last ? why[last.id] : t('Sort each claim about El Guettar.')}</p>
    </div>
  );
}
