import { useState } from 'react';
import { C, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

/**
 * The revolution's second week in two lanes: what Budapest knew in public and what the Soviet leadership decided in
 * secret, day by day from 28 October to 4 November 1956. From the UN Special Committee's report (1957), paras 67–72
 * and 330–342, and the CPSU Presidium notes of 31 October (National Security Archive, EBB 76, doc. 6), whose editors
 * note that crushing the revolution was "only one of the possible solutions under discussion" on 28 October and
 * that the 30 October decisions were reversed on 31 October. What each lane says about the Soviet troops:
 */
export type Belief = 'unclear' | 'leave' | 'stay' | 'attack';
export const DAYS = [
  { m: 10, d: 28, budapest: 'unclear', moscow: 'unclear' },
  { m: 10, d: 29, budapest: 'unclear', moscow: 'unclear' },
  { m: 10, d: 30, budapest: 'leave', moscow: 'leave' },
  { m: 10, d: 31, budapest: 'leave', moscow: 'stay' },
  { m: 11, d: 1, budapest: 'stay', moscow: 'stay' },
  { m: 11, d: 2, budapest: 'stay', moscow: 'stay' },
  { m: 11, d: 3, budapest: 'stay', moscow: 'stay' },
  { m: 11, d: 4, budapest: 'attack', moscow: 'attack' },
] as const satisfies readonly { m: number; d: number; budapest: Belief; moscow: Belief }[];
/** The goal: a day when Budapest believed the troops were leaving while Moscow had decided they would stay. */
export const fooled = (i: number) => DAYS[i].budapest === 'leave' && DAYS[i].moscow === 'stay';
export const firstFooled = () => DAYS.findIndex((_, i) => fooled(i));

function publicNews(i: number) {
  switch (i) {
    case 0: return [t('Ceasefire ordered'), t('Nagy: “a great national and democratic movement”')];
    case 1: return [t('The ÁVH is dissolved'), t('Fighting dies down')];
    case 2: return [t('One-party rule ends'), t('Soviet tanks start leaving Budapest')];
    case 3: return [t('Withdrawal from Budapest under way'), t('Nagy: “the first days of our sovereignty”')];
    case 4: return [t('New Soviet units cross the border'), t('Hungary declares neutrality')];
    case 5: return [t('Protests to the Soviet embassy'), t('Hungary proposes talks on withdrawal')];
    case 6: return [t('A government of four parties'), t('Talks on the troops’ withdrawal')];
    default: return [t('4.15 a.m.: the Soviet attack begins'), ''];
  }
}
function secretPlan(i: number) {
  switch (i) {
    case 0:
    case 1: return [t('Options still open'), t('Force is one of several')];
    case 2: return [t('Declaration: troops to leave Budapest'), t('Talks offered on troops in Hungary')];
    case 3: return [t('Khrushchev: “should not withdraw our troops”'), t('A new government to be set up')];
    case 7: return [t('The attack is launched'), ''];
    default: return [t('Troops move in'), t('Preparing the attack')];
  }
}
function beliefName(b: Belief) {
  if (b === 'leave') return t('troops leaving');
  if (b === 'stay') return t('troops staying');
  if (b === 'attack') return t('attack under way');
  return t('not yet decided');
}
const dayName = (i: number) => new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(Date.UTC(1956, DAYS[i].m - 1, DAYS[i].d));

const GOLD = '#f0c060', GREY = '#8e9bb3', RED = '#e05a50';

export default function SecondWeek({ onDone }: LabProps) {
  const [day, setDay] = useState(0);
  useGoal(fooled(day), onDone);
  const D = DAYS[day];

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the eight days as a strip
    const cw = w / DAYS.length;
    DAYS.forEach((x, i) => {
      ctx.fillStyle = i === day ? (fooled(i) ? RED : GOLD) : i < day ? 'rgba(240,192,96,0.22)' : 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.roundRect(i * cw + 2, 2, cw - 4, 26, 6); ctx.fill();
      label(ctx, String(x.d), i * cw + cw / 2, 15, { size: 12, color: i === day ? '#14100a' : C.soft });
    });
    // the two lanes
    const lane = (y: number, hh: number, title: string, col: string, lines: string[], bg: string) => {
      ctx.fillStyle = bg; ctx.fillRect(0, y, w, hh);
      label(ctx, title, 8, y + 11, { size: 10, color: col, align: 'left' });
      lines.forEach((s, j) => s && label(ctx, s, w / 2, y + 27 + j * 15, { size: j ? 10 : 12, color: j ? C.soft : C.ink }));
    };
    const top = 36, lh = (h - top - 6) / 2;
    lane(top, lh - 3, t('BUDAPEST, IN PUBLIC'), GOLD, publicNews(day), 'rgba(240,192,96,0.08)');
    lane(top + lh + 3, lh - 3, t('MOSCOW, IN SECRET'), GREY, secretPlan(day), 'rgba(142,155,179,0.12)');
    // what each side expects of the Soviet troops, at the right of each lane
    label(ctx, beliefName(D.budapest), w - 8, top + 11, { size: 11, color: D.budapest === 'leave' ? C.good : C.soft, align: 'right' });
    label(ctx, beliefName(D.moscow), w - 8, top + lh + 3 + 11, { size: 11, color: D.moscow === 'stay' || D.moscow === 'attack' ? C.bad : C.soft, align: 'right' });
    if (fooled(day)) {
      ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(w * 0.15, top + lh - 3); ctx.lineTo(w * 0.85, top + lh + 3); ctx.stroke(); ctx.setLineDash([]);
    }
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{day} 1956: Budapest believes {b}; Moscow plans {m}', { day: dayName(day), b: beliefName(D.budapest), m: beliefName(D.moscow) })} />
      <Range label={t('Date in 1956')} value={day} min={0} max={DAYS.length - 1} step={1} onChange={setDay} format={dayName} />
      <p className="lab__note">{t('Simplified from the UN report of 1957 and the Soviet Presidium notes of 31 October 1956.')}</p>
    </div>
  );
}
