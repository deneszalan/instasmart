import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

/**
 * Why were Soviet troops in Hungary? A month slider from January 1945 to October 1956 shows the legal basis the
 * troops stood on, from the UN Special Committee's report (1957), paras 306–315: the 1945 armistice; the peace treaty
 * in force from 15 September 1947, whose article 22 let them guard the Soviet Army's lines to its zone in Austria;
 * the Warsaw Treaty, in force from 6 June 1955. Austria's State Treaty came into force on 27 July 1955, ending the zone, and
 * the last Soviet units left Vienna on 19 September 1955.
 * Months are counted from January 1945 (0) to October 1956 (141).
 */
export const LAST = 141;
/** A date as a month index: January 1945 is 0. */
export const monthIndex = (y: number, m: number) => (y - 1945) * 12 + (m - 1);
export const TREATY = monthIndex(1947, 9); // in force 15 September 1947
export const WARSAW = monthIndex(1955, 6); // in force 6 June 1955
export const AUSTRIA_TREATY = monthIndex(1955, 7); // Austrian State Treaty in force, 27 July 1955: the zone ends
export const AUSTRIA_LEFT = monthIndex(1955, 9); // last Soviet units left Vienna, 19 September 1955

/** The legal bases in force in a given month (the treaty and the Warsaw Pact overlap for a few months in 1955). */
export function bases(month: number) {
  const out: ('armistice' | 'treaty' | 'warsaw')[] = [];
  if (month < TREATY) out.push('armistice');
  if (month >= TREATY && month < AUSTRIA_TREATY) out.push('treaty');
  if (month >= WARSAW) out.push('warsaw');
  return out;
}
/** Soviet troops were in Austria until September 1955. */
export const inAustria = (month: number) => month <= AUSTRIA_LEFT;
/** The goal: a month when no Soviet zone in Austria was left to guard, yet the troops stayed in Hungary. */
export const reached = (month: number) => !inAustria(month) && month <= LAST;

function basisName(b: 'armistice' | 'treaty' | 'warsaw') {
  if (b === 'armistice') return t('1945 armistice');
  if (b === 'treaty') return t('Peace treaty: lines to Austria');
  return t('Warsaw Pact');
}
function basisShort(b: 'armistice' | 'treaty' | 'warsaw') {
  if (b === 'armistice') return t('1945 armistice');
  if (b === 'treaty') return t('1947 peace treaty');
  return t('Warsaw Pact');
}
const monthName = (m: number) => new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(1945 + Math.floor(m / 12), m % 12, 15));

const RED = '#cf3a43', STEEL = '#93b4c8', GOLD = '#d9b45a', GREEN = '#6fae80';

export default function SovietTroops({ onDone }: LabProps) {
  const [month, setMonth] = useState(monthIndex(1950, 1));
  useGoal(reached(month), onDone);
  const now = bases(month);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const pad = Math.max(16, w * 0.05), X = (m: number) => pad + (m / LAST) * (w - 2 * pad);
    const rows = [
      { y: h * 0.16, name: t('Soviet troops in Hungary'), from: 0, to: LAST, col: RED },
      { y: h * 0.36, name: t('Soviet troops in Austria'), from: 0, to: AUSTRIA_LEFT, col: STEEL },
      { y: h * 0.56, name: basisName('armistice'), from: 0, to: TREATY - 1, col: GOLD },
      { y: h * 0.7, name: basisName('treaty'), from: TREATY, to: AUSTRIA_TREATY - 1, col: GOLD },
      { y: h * 0.84, name: basisName('warsaw'), from: WARSAW, to: LAST, col: GREEN },
    ];
    rows.forEach((r) => {
      ctx.fillStyle = r.col; ctx.globalAlpha = 0.85;
      ctx.fillRect(X(r.from), r.y, X(r.to + 1) - X(r.from) - 1, 9);
      ctx.globalAlpha = 1;
      const left = X(r.from) < w * 0.55;
      label(ctx, r.name, left ? Math.max(X(r.from), pad) : X(r.to + 1), r.y - 8, { size: 11, color: C.soft, align: left ? 'left' : 'right' });
    });
    if (h > 1) label(ctx, t('Legal basis'), pad, h * 0.47, { size: 10, color: C.faint, align: 'left' });
    for (const y of [1945, 1947, 1949, 1951, 1953, 1955]) label(ctx, String(y), X(monthIndex(y, 1)), h - 6, { size: 10, color: C.faint });
    // the chosen month
    const x = X(month + 0.5);
    line(ctx, x, h * 0.08, x, h * 0.93, reached(month) ? C.good : C.ink, 2);
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{month}: Soviet troops in Hungary; legal basis: {basis}', { month: monthName(month), basis: now.map(basisName).join(', ') })} />
      <Range label={t('Month and year')} value={month} min={0} max={LAST} step={1} onChange={setMonth} format={monthName} />
      <Readouts
        items={[
          { label: t('Soviet zone in Austria'), value: inAustria(month) ? t('still there') : t('no longer exists'), tone: inAustria(month) ? undefined : 'good' },
          { label: t('Legal basis'), value: now.map(basisShort).join(' + '), tone: 'accent' },
        ]}
      />
      <p className="lab__note">{t('UN report, 1957. The treaty basis ends with Austria’s State Treaty, July 1955.')}</p>
    </div>
  );
}
