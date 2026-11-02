import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

export type Place = 'tunisPrison' | 'teboursouk' | 'marseille' | 'lyon' | 'rome' | 'tunis' | 'libya' | 'cairo';
export type Holder = 'france' | 'vichy' | 'germany' | 'italy' | 'axisTunis' | 'watched' | 'free';

/** Months counted from April 1938 (0) to April 1945 (84). */
export const FIRST = { year: 1938, month: 4 };
export const LAST_INDEX = 84;
export const monthIndex = (year: number, month: number) => (year - FIRST.year) * 12 + (month - FIRST.month);
export const fromIndex = (i: number) => {
  const m = FIRST.month - 1 + i;
  return { year: FIRST.year + Math.floor(m / 12), month: (m % 12) + 1 };
};

/**
 * Where Habib Bourguiba was and who held him, month by month (Larousse; Wikipedia, "Habib Bourguiba", citing Martel,
 * Belkhodja and Bessis; D. D. Newsom, Christian Science Monitor, 2000): arrested in Tunis on 10 April 1938; held in
 * Tunis, then at Téboursouk from June 1939; Fort Saint-Nicolas in Marseille from 26 May 1940 (under the Vichy regime from
 * July 1940); his letter to Habib Thameur of August 1942; Montluc prison in Lyon from 18 November 1942; freed by the
 * Germans in December 1942; in Rome from January 1943; back in Tunis in April 1943, under Axis occupation until the
 * Allies took the city on 7 May 1943; then free but watched by the French; across Libya in disguise from 23 March 1945;
 * in Cairo in April 1945.
 */
export function whereIn(year: number, month: number): { place: Place; holder: Holder } {
  const i = monthIndex(year, month);
  if (i < monthIndex(1939, 6)) return { place: 'tunisPrison', holder: 'france' };
  if (i < monthIndex(1940, 5)) return { place: 'teboursouk', holder: 'france' };
  if (i < monthIndex(1940, 7)) return { place: 'marseille', holder: 'france' };
  if (i < monthIndex(1942, 11)) return { place: 'marseille', holder: 'vichy' };
  if (i < monthIndex(1942, 12)) return { place: 'lyon', holder: 'vichy' };
  if (i < monthIndex(1943, 1)) return { place: 'lyon', holder: 'germany' };
  if (i < monthIndex(1943, 4)) return { place: 'rome', holder: 'italy' };
  if (i < monthIndex(1943, 5)) return { place: 'tunis', holder: 'axisTunis' };
  if (i < monthIndex(1945, 3)) return { place: 'tunis', holder: 'watched' };
  if (i < monthIndex(1945, 4)) return { place: 'libya', holder: 'free' };
  return { place: 'cairo', holder: 'free' };
}

/** The month of his letter to Habib Thameur: "Germany will not win the war". */
export const LETTER = { year: 1942, month: 8 };

/** Where each place sits on the lab's schematic map, as shares of its width and height (not to scale). */
const SPOT: Record<Place, [number, number]> = {
  lyon: [0.1, 0.06], marseille: [0.12, 0.34], rome: [0.54, 0.26], tunisPrison: [0.3, 0.68], tunis: [0.3, 0.68], teboursouk: [0.22, 0.78],
  libya: [0.62, 0.8], cairo: [0.93, 0.6],
};
const COLOUR: Record<Holder, string> = {
  france: '#7ea6ea', vichy: '#7ea6ea', germany: '#b7b7b7', italy: '#86c993', axisTunis: '#d0693f', watched: '#e9c65e', free: '#e9c65e',
};

export default function BourguibaAxis({ onDone }: LabProps) {
  const [i, setI] = useState(0);
  const { year, month } = fromIndex(i);
  const { place, holder } = whereIn(year, month);
  const isLetter = year === LETTER.year && month === LETTER.month;
  useGoal(isLetter, onDone);

  const placeName: Record<Place, string> = {
    tunisPrison: t('Civil prison, Tunis'), teboursouk: t('Téboursouk prison'), marseille: t('Fort Saint-Nicolas, Marseille'), lyon: t('Montluc prison, Lyon'),
    rome: t('A guest in Rome'), tunis: t('Back in Tunis'), libya: t('Crossing Libya in disguise'), cairo: t('In Cairo'),
  };
  const holderName: Record<Holder, string> = {
    france: t('Prisoner of France'), vichy: t('Prisoner of Vichy France'), germany: t('Freed by the Germans'), italy: t('In Italian hands'),
    axisTunis: t('At home, under Axis occupation'), watched: t('Free, watched by the French'), free: t('Free, abroad'),
  };
  const when = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 15));
  const events: Record<string, string> = {
    '1938-4': t('Arrested after the protests of 9 April in Tunis'),
    '1939-6': t('Charged with plotting; moved to Téboursouk'),
    '1940-5': t('Shipped to a prison in Marseille'),
    '1942-8': t('Writes to Habib Thameur: Germany will not win the war'),
    '1942-11': t('Moved to Lyon; the Germans occupy the south of France'),
    '1942-12': t('Freed by the Germans, handed to the Italians'),
    '1943-1': t('Received with honours in Rome; asked to speak for the Axis'),
    '1943-4': t('Back in Tunis; tells his party to support the Allies'),
    '1943-5': t('The Allies take Tunis; the French depose Moncef Bey'),
    '1945-3': t('Slips away in disguise toward Cairo'),
    '1945-4': t('In Cairo, pleading Tunisia’s cause'),
  };
  const event = events[`${year}-${month}`];

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const X = (f: number) => 14 + f * (w - 28), Y = (f: number) => 10 + f * (h - 34);
    const at = (p: Place) => [X(SPOT[p][0]), Y(SPOT[p][1])] as const;
    // the route so far
    const path: Place[] = [];
    for (let j = 0; j <= i; j++) {
      const d = fromIndex(j), p = whereIn(d.year, d.month).place;
      if (path[path.length - 1] !== p) path.push(p);
    }
    ctx.setLineDash([2, 6]);
    for (let j = 1; j < path.length; j++) {
      const [x0, y0] = at(path[j - 1]), [x1, y1] = at(path[j]);
      ctx.strokeStyle = j === path.length - 1 ? COLOUR[holder] : C.faint;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const p of Object.keys(SPOT) as Place[]) {
      if (p === 'libya') continue;
      const [x, y] = at(p);
      ctx.fillStyle = C.faint; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    }
    const tag = (s: string, p: Place, dx: number, dy: number, align: CanvasTextAlign) => { const [x, y] = at(p); label(ctx, s, x + dx, y + dy, { size: 10, align, color: C.soft }); };
    tag(t('Lyon, 1942'), 'lyon', 8, 0, 'left');
    tag(t('Marseille, 1940–42'), 'marseille', 8, 0, 'left');
    tag(t('Rome, 1943'), 'rome', 8, 0, 'left');
    tag(t('Tunis, 1938–39 and 1943–45'), 'tunis', 6, 14, 'left');
    tag(t('Cairo, 1945'), 'cairo', 0, -16, 'right');
    const [x, y] = at(place);
    ctx.fillStyle = COLOUR[holder];
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, t('Schematic map: places only, not to scale'), w / 2, h - 9, { size: 9, color: C.faint });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{when}: {where}. {holder}.', { when, where: placeName[place], holder: holderName[holder] })} />
      <Range label={t('Month, 1938 to 1945')} value={i} min={0} max={LAST_INDEX} step={1} onChange={(v) => setI(Math.round(v))} format={() => when} />
      <Readouts items={[{ label: placeName[place], value: holderName[holder], tone: isLetter ? 'good' : 'accent' }]} />
      <p className="lab__note">{event ?? t('Nothing recorded for this month: slide on.')}</p>
    </div>
  );
}
