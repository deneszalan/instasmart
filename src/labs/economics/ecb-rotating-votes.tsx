import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** The ECB's 2026 timetable of voting rights: for each national central bank governor, the months (0 = January) without a vote. */
export const ROTA: Record<string, number[]> = {
  DE: [2, 7], FR: [4, 9], IT: [0, 5, 10], ES: [3, 8], NL: [1, 6, 11],
  BE: [0, 1, 6, 11], BG: [1, 6, 7, 11], EE: [1, 2, 6, 7], IE: [1, 2, 7], GR: [2, 7, 8], HR: [2, 3, 7, 8], CY: [2, 3, 8], LV: [3, 8, 9],
  LT: [3, 4, 8, 9], LU: [3, 4, 9], MT: [4, 9, 10], AT: [4, 5, 9, 10], PT: [0, 4, 5, 10], SI: [0, 5, 10, 11], SK: [0, 5, 6, 10, 11], FI: [0, 1, 5, 6, 11],
};
/** The five governors of the biggest economies, who share four votes; the other sixteen share eleven. */
export const BIG = ['DE', 'FR', 'IT', 'ES', 'NL'];
export const SMALL = ['BE', 'BG', 'EE', 'IE', 'GR', 'HR', 'CY', 'LV', 'LT', 'LU', 'MT', 'AT', 'PT', 'SI', 'SK', 'FI'];
export const BOARD = 6;
/** The council's votes in any month: the six board members, four of the big five, eleven of the sixteen. */
export const VOTES = BOARD + 4 + 11;
export const hasVote = (code: string, month: number) => !ROTA[code].includes(month);
export const sittingOut = (month: number) => [...BIG, ...SMALL].filter((c) => !hasVote(c, month));

const names = (code: string) => {
  switch (code) {
    case 'DE': return t('Germany');
    case 'FR': return t('France');
    case 'IT': return t('Italy');
    case 'ES': return t('Spain');
    case 'NL': return t('Netherlands');
    case 'BE': return t('Belgium');
    case 'BG': return t('Bulgaria');
    case 'EE': return t('Estonia');
    case 'IE': return t('Ireland');
    case 'GR': return t('Greece');
    case 'HR': return t('Croatia');
    case 'CY': return t('Cyprus');
    case 'LV': return t('Latvia');
    case 'LT': return t('Lithuania');
    case 'LU': return t('Luxembourg');
    case 'MT': return t('Malta');
    case 'AT': return t('Austria');
    case 'PT': return t('Portugal');
    case 'SI': return t('Slovenia');
    case 'SK': return t('Slovakia');
    default: return t('Finland');
  }
};
const monthName = (m: number) => {
  switch (m) {
    case 0: return t('January');
    case 1: return t('February');
    case 2: return t('March');
    case 3: return t('April');
    case 4: return t('May');
    case 5: return t('June');
    case 6: return t('July');
    case 7: return t('August');
    case 8: return t('September');
    case 9: return t('October');
    case 10: return t('November');
    default: return t('December');
  }
};

const YELLOW = '#ffd23f', BLUE = '#8fc1ff', RED = '#ff7b7b';

export default function EcbRotatingVotes({ onDone }: LabProps) {
  const [month, setMonth] = useState(9);
  const out = sittingOut(month);
  const germanyOut = !hasVote('DE', month);
  useGoal(germanyOut, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const seats = [...Array(BOARD).fill('board'), ...BIG, ...SMALL];
    const cx = w / 2, cy = h / 2 + 4, rx = w * 0.4, ry = h * 0.36, r = Math.min(7, w / 56);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 22, ry - 22, 0, 0, Math.PI * 2);
    ctx.fill();
    seats.forEach((code, i) => {
      const a = -Math.PI / 2 + (i / seats.length) * Math.PI * 2;
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      const board = code === 'board', sits = board || hasVote(code, month);
      ctx.fillStyle = sits ? (board ? YELLOW : BIG.includes(code) ? C.ink : BLUE) : 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (!sits) {
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 4);
        ctx.lineTo(x + 4, y + 4);
        ctx.moveTo(x + 4, y - 4);
        ctx.lineTo(x - 4, y + 4);
        ctx.stroke();
      }
      if (!board) label(ctx, code, x + 17 * Math.cos(a), y + 15 * Math.sin(a), { size: 9, color: sits ? C.soft : RED });
    });
    label(ctx, t('{n} votes', { n: VOTES }), cx, cy - 8, { size: 16, color: YELLOW });
    label(ctx, t('6 board + 4 + 11'), cx, cy + 10, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('In {month} 2026 these governors have no vote: {list}', { month: monthName(month), list: out.map(names).join(', ') })} />
      <Range label={t('Month of 2026')} value={month} min={0} max={11} step={1} onChange={setMonth} format={monthName} />
      <Readouts
        items={[
          { label: t('Sitting out'), value: out.map(names).join(', ') },
          { label: t('Germany’s governor'), value: germanyOut ? t('no vote') : t('votes'), tone: germanyOut ? 'bad' : 'good' },
        ]}
      />
      <p className="lab__note">{t('The ECB’s timetable for 2026: the five biggest economies share 4 votes, the other sixteen share 11, and the six Executive Board members always vote.')}</p>
    </div>
  );
}
