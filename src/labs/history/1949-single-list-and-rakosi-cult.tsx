import { useState } from 'react';
import { C, Choice, font, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/**
 * The single-list election of 15 May 1949 in Hungary, from the Interior Ministry's communiqué of 18 May 1949 as
 * printed by Gyarmati György (Betekintő 2015/2). A yes needed no mark: the ballot went in as it was; a no meant
 * crossing out the circle on the slip with two lines. The reader tries each thing a voter could do and sees what
 * it left for the polling committee to see, and how many people did the same.
 */
export type Act = 'yes' | 'no' | 'spoil' | 'away';
export const ACTS: Act[] = ['yes', 'no', 'spoil', 'away'];
/** People on the roll, and what they did. */
export const ROLL = 6053792;
export const TALLY: Record<Act, number> = { yes: 5478515, no: 165283, spoil: 86721, away: 323273 };
/** Those who cast a ballot: yes, no and invalid. */
export const CAST = TALLY.yes + TALLY.no + TALLY.spoil;

/** Share in % of everyone on the roll. */
export const shareOfRoll = (a: Act) => (TALLY[a] / ROLL) * 100;
/** Share in % of the ballots cast (null for those who stayed away). */
export const shareOfCast = (a: Act) => (a === 'away' ? null : (TALLY[a] / CAST) * 100);

const RED = '#e2443d', PAPER = '#f3e6cf', GOLD = '#e8b04a', GREY = '#9a8f86', DARK = '#1d0b0c';
const COL: Record<Act, string> = { yes: RED, no: PAPER, spoil: GREY, away: 'rgba(246,236,218,0.35)' };

export default function SingleList({ onDone }: LabProps) {
  const [act, setAct] = useState<Act>('yes');
  const [tried, setTried] = useState<Act[]>(['yes']);
  useGoal(tried.length === ACTS.length, onDone);
  const choose = (a: Act) => {
    setAct(a);
    setTried((s) => (s.includes(a) ? s : [...s, a]));
  };
  const name = (a: Act) =>
    a === 'yes' ? t('Dropped in unmarked') : a === 'no' ? t('Circle crossed out') : a === 'spoil' ? t('Spoilt ballot') : t('Stayed at home');
  const counted = act === 'yes' ? t('For the list') : act === 'no' ? t('Against the list') : act === 'spoil' ? t('Invalid ballot') : t('Did not vote');
  const seen =
    act === 'yes'
      ? t('Nothing: no mark, no time in the booth needed.')
      : act === 'no'
        ? t('Two strokes take time behind the curtain.')
        : act === 'spoil'
          ? t('A marked ballot that counts for no one.')
          : t('Your absence shows on the voters’ roll.');
  const cast = shareOfCast(act);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the ballot slip, sized to the stage
    const bh = Math.min(h * 0.5, 120), bw = bh * 1.35, bx = 8, by = 8;
    ctx.globalAlpha = act === 'away' ? 0.3 : 1;
    ctx.fillStyle = PAPER;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = RED;
    ctx.fillRect(bx + 8, by + bh * 0.24, bw - 16, 2);
    label(ctx, t('People’s Front'), bx + bw / 2, by + bh * 0.13, { size: Math.min(11, bh / 6), color: DARK });
    label(ctx, t('a single list'), bx + bw / 2, by + bh * 0.36, { size: Math.min(10, bh / 7), weight: 500, color: '#5b4a40' });
    const cx = bx + bw / 2, cy = by + bh * 0.7, r = bh * 0.15;
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineCap = 'round';
    if (act === 'no') {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.3, cy - r * 1.3);
      ctx.lineTo(cx + r * 1.3, cy + r * 1.3);
      ctx.moveTo(cx + r * 1.3, cy - r * 1.3);
      ctx.lineTo(cx - r * 1.3, cy + r * 1.3);
      ctx.stroke();
    }
    if (act === 'spoil') {
      ctx.strokeStyle = '#5b4a40';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) ctx.lineTo(bx + 10 + i * ((bw - 20) / 5), by + bh * 0.55 + (i % 2 ? bh * 0.12 : -bh * 0.08));
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
    // what the committee could see, and the share of ballots cast
    const tx = bx + bw + 12, tw = w - tx - 8;
    label(ctx, t('What the committee could see'), tx, by + 6, { size: 10, color: GOLD, align: 'left' });
    font(ctx, 12, 600);
    const lines: string[] = [];
    let line = '';
    for (const word of seen.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > tw && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    lines.forEach((l, j) => label(ctx, l, tx, by + 24 + j * 15, { size: 12, weight: 600, color: C.ink, align: 'left' }));
    if (cast !== null) label(ctx, `${t('Share of ballots cast')}: ${formatFixed(cast, 1)}%`, tx, by + 30 + lines.length * 15, { size: 10, color: C.soft, align: 'left' });
    // everyone on the roll: one bar, split as the ministry counted it
    const x0 = 8, x1 = w - 8, hb = 12, yb = h - 30;
    let x = x0;
    for (const a of ACTS) {
      const ww = ((x1 - x0) * TALLY[a]) / ROLL;
      ctx.fillStyle = COL[a];
      ctx.globalAlpha = a === act ? 1 : 0.35;
      ctx.fillRect(x, yb, Math.max(ww, 2), hb);
      ctx.globalAlpha = 1;
      if (a === act) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, yb - 1, Math.max(ww, 2) + 2, hb + 2);
        const lx = Math.min(Math.max(x + ww / 2, x0 + 24), x1 - 24);
        label(ctx, `${formatFixed(shareOfRoll(a), 1)}%`, lx, yb - 8, { size: 11, color: GOLD });
      }
      x += ww;
    }
    label(ctx, t('Everyone on the roll, 15 May 1949: {n}', { n: formatNumber(ROLL) }), w / 2, yb + hb + 9, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{act}: counted as {counted}. {seen}', { act: name(act), counted, seen })} />
      <Choice label={t('What do you do with the ballot?')} options={ACTS.map((a) => ({ value: a, label: name(a) }))} value={act} onChange={choose} />
      <Readouts
        items={[
          { label: t('Counted in 1949 as'), value: counted, tone: act === 'yes' ? 'accent' : undefined },
          { label: t('People who did the same'), value: formatNumber(TALLY[act]) },
        ]}
      />
    </div>
  );
}
