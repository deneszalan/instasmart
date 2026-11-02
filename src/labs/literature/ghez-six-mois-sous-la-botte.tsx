import { useState } from 'react';
import { C, label, line, Range, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

/** Days are counted from 9 November 1942 (day 0), when German aircraft landed at Tunis, to 13 May 1943. */
const DAY0 = Date.UTC(1942, 10, 9);
export const dayOf = (y: number, m: number, d: number) => Math.round((Date.UTC(y, m - 1, d) - DAY0) / 86400000);
export const LAST_DAY = dayOf(1943, 5, 13);

export type WarId = 'landing' | 'kasserine' | 'tunis' | 'surrender';
export type DiaryId = 'property' | 'flat' | 'order' | 'cheylus' | 'count' | 'aouina' | 'fewer' | 'arrests' | 'front' | 'escape' | 'home' | 'emptied';

/** The campaign (Wikipedia, "Tunisian campaign", citing Playfair): German aircraft at Tunis by 9 November 1942; Kasserine from 19 February 1943; Tunis taken on 7 May; the last surrender on 13 May. */
export const WAR: { id: WarId; day: number }[] = [
  { id: 'landing', day: dayOf(1942, 11, 9) },
  { id: 'kasserine', day: dayOf(1943, 2, 19) },
  { id: 'tunis', day: dayOf(1943, 5, 7) },
  { id: 'surrender', day: dayOf(1943, 5, 13) },
];

/**
 * Dated chapters of Paul Ghez's diary, "Six mois sous la botte" (Tunis, 1943), as indexed by the Documentation Center
 * of North African Jews during WWII (Yad Ben-Zvi): pp. 13-14, 14, 16, 30-31, 35-37, 86-87, 104, 143-144, 154-155,
 * 156-160 and 160-161 of the 1943 edition.
 */
export const DIARY: { id: DiaryId; day: number }[] = [
  { id: 'property', day: dayOf(1942, 11, 15) },
  { id: 'flat', day: dayOf(1942, 11, 27) },
  { id: 'order', day: dayOf(1942, 12, 7) },
  { id: 'cheylus', day: dayOf(1942, 12, 12) },
  { id: 'count', day: dayOf(1942, 12, 14) },
  { id: 'aouina', day: dayOf(1942, 12, 17) },
  { id: 'fewer', day: dayOf(1943, 2, 6) },
  { id: 'arrests', day: dayOf(1943, 2, 24) },
  { id: 'front', day: dayOf(1943, 4, 15) },
  { id: 'escape', day: dayOf(1943, 5, 4) },
  { id: 'home', day: dayOf(1943, 5, 7) },
  { id: 'emptied', day: dayOf(1943, 5, 8) },
];

/** The latest entry on or before `day`. */
export function latest<T extends { day: number }>(list: T[], day: number): T | undefined {
  let found: T | undefined;
  for (const e of list) if (e.day <= day) found = e;
  return found;
}
/** Days on which the war and the diary both have an entry. */
export const meetingDays = () => DIARY.filter((d) => WAR.some((w) => w.day === d.day)).map((d) => d.day);

export default function GhezDiary({ onDone }: LabProps) {
  const [day, setDay] = useState(0);
  const war = latest(WAR, day);
  const diary = latest(DIARY, day);
  const meet = meetingDays().includes(day);
  useGoal(meet, onDone);

  const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(DAY0 + day * 86400000));
  const warText: Record<WarId, string> = {
    landing: t('German aircraft land at Tunis'),
    kasserine: t('The Battle of Kasserine Pass begins'),
    tunis: t('The Allies enter Tunis'),
    surrender: t('The last Axis army in Africa surrenders'),
  };
  const diaryText: Record<DiaryId, string> = {
    property: t('Jewish property confiscated'),
    flat: t('Ordered out of his flat'),
    order: t('The order for forced labour; the lists'),
    cheylus: t('A march on foot to the camp at Cheylus'),
    count: t('3,585 men recruited so far'),
    aouina: t('Men sent to work at El Aouina airfield'),
    fewer: t('Trying to lower the numbers'),
    arrests: t('30 French citizens arrested, 3 of them Jewish leaders'),
    front: t('Workers moved back from the front'),
    escape: t('30 workers escape from the camp at Bizerte'),
    home: t('He arranges the workers’ return home'),
    emptied: t('His flat emptied of its furniture'),
  };
  const sameDay = (e: { day: number } | undefined) => e && e.day === day;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 12, R = w - 12, X = (d: number) => L + (R - L) * (d / LAST_DAY);
    const yWar = 22, yDiary = h * 0.5 + 8;
    /** The latest entry, written under its line in up to two lines. */
    const entry = (s: string, y: number, color: string, now: boolean) => {
      ctx.font = `${now ? 700 : 600} 12px system-ui, sans-serif`;
      ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const words = s.split(' '), lines: string[] = [''];
      for (const word of words) {
        const next = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word;
        if (ctx.measureText(next).width > R - L && lines[lines.length - 1]) lines.push(word); else lines[lines.length - 1] = next;
      }
      lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, L, y + i * 15));
    };
    label(ctx, t('In the war'), L + 8, yWar - 12, { size: 10, align: 'left', color: '#9cc2f0' });
    label(ctx, t('In Paul Ghez’s diary'), L + 8, yDiary - 12, { size: 10, align: 'left', color: '#f0a08a' });
    line(ctx, L, yWar, R, yWar, C.faint, 2);
    line(ctx, L, yDiary, R, yDiary, C.faint, 2);
    for (const [y, m] of [[1942, 12], [1943, 1], [1943, 2], [1943, 3], [1943, 4], [1943, 5]]) {
      const x = X(dayOf(y, m, 1));
      line(ctx, x, yWar - 6, x, yWar + 6, C.line, 1);
      line(ctx, x, yDiary - 6, x, yDiary + 6, C.line, 1);
    }
    for (const e of WAR) {
      ctx.fillStyle = e.day <= day ? '#9cc2f0' : C.faint;
      ctx.beginPath(); ctx.arc(X(e.day), yWar, e.day === day ? 7 : 5, 0, Math.PI * 2); ctx.fill();
    }
    for (const e of DIARY) {
      ctx.fillStyle = e.day <= day ? '#f0a08a' : C.faint;
      const s = e.day === day ? 12 : 8;
      ctx.fillRect(X(e.day) - s / 2, yDiary - s / 2, s, s);
    }
    line(ctx, X(day), 8, X(day), yDiary + 8, meet ? C.good : C.ink, 2);
    entry(war ? warText[war.id] : '–', yWar + 22, sameDay(war) ? (meet ? C.good : C.accent) : C.soft, !!sameDay(war));
    entry(diary ? diaryText[diary.id] : '–', yDiary + 22, sameDay(diary) ? (meet ? C.good : C.accent) : C.soft, !!sameDay(diary));
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{date}. War: {war}. Diary: {diary}.', { date, war: war ? warText[war.id] : '–', diary: diary ? diaryText[diary.id] : '–' })} />
      <Range label={t('Day of the occupation')} value={day} min={0} max={LAST_DAY} step={1} onChange={(v) => setDay(Math.round(v))} format={() => date} />
      <p className="lab__note">{t('The latest entry on each line up to the day you pick, from the diary’s dated chapters and the campaign.')}</p>
    </div>
  );
}
