import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/**
 * Moncef Bey's reign and exile, month by month (USHMM; Kapitalis; Webdo): on the throne from 19 June 1942, deposed
 * by the French on 14 May 1943 and flown to Laghouat in Algeria, later held at Ténès, moved to Pau in France on
 * 17 October 1945, died there on 1 September 1948. Tunis was occupied by German and Italian troops from November
 * 1942 to May 1943.
 */
const DAY = 864e5;
const D = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
export const ACCESSION = D(1942, 6, 19);
export const DEPOSED = D(1943, 5, 14);
export const TO_PAU = D(1945, 10, 17);
export const DEATH = D(1948, 9, 1);
/** Months from June 1942 (0) to September 1948 (75). */
export const LAST_MONTH = 75;
export const DEPOSED_MONTH = 11;

/** The year and month (1–12) of month index `i`. */
export const monthOf = (i: number) => ({ y: 1942 + Math.floor((5 + i) / 12), m: ((5 + i) % 12) + 1 });
/** The last moment of month `i` that the lab counts to: the end of the month, or the day of his death. */
export const endOf = (i: number) => {
  const { y, m } = monthOf(i);
  return Math.min(Date.UTC(y, m, 1) - DAY, DEATH);
};
/** Days on the throne and in exile, counted to the end of month `i`. */
export const daysOnThrone = (i: number) => Math.max(0, Math.min(endOf(i), DEPOSED) - ACCESSION) / DAY;
export const daysInExile = (i: number) => Math.max(0, endOf(i) - DEPOSED) / DAY;
export type Where = 'tunis' | 'algeria' | 'pau';
export const whereAt = (i: number): Where => (endOf(i) < DEPOSED ? 'tunis' : endOf(i) < TO_PAU ? 'algeria' : 'pau');
export type Power = 'vichy' | 'axis' | 'restored';
/** Who held Tunis: the Vichy French protectorate, the Axis occupation (November 1942 to May 1943), or French rule restored. */
export const powerAt = (i: number): Power => (i < 5 ? 'vichy' : i < 11 ? 'axis' : 'restored');

const GOLD = '#d9b45a', BLUE = '#8fb4e8', RUST = '#c9634f';

export default function MoncefBey({ onDone }: LabProps) {
  const [i, setI] = useState(0);
  useGoal(i === DEPOSED_MONTH, onDone);
  const where = whereAt(i), power = powerAt(i);
  const { y, m } = monthOf(i);
  const month = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, 15));
  const event = eventAt(i);
  const whereText = where === 'tunis' ? t('on the throne in Tunis') : where === 'algeria' ? t('in exile in Algeria: Laghouat, later Ténès') : i === LAST_MONTH ? t('died in exile in Pau, France') : t('in exile in Pau, France');
  const powerText = power === 'vichy' ? t('Tunis under the Vichy French protectorate') : power === 'axis' ? t('German and Italian troops in Tunis') : t('French rule restored in Tunis');

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // a schematic map: Pau, Tunis and Laghouat
    const mapH = h - 46, P = (lon: number, lat: number) => [w * (0.08 + ((lon + 2) / 14) * 0.84), 8 + ((44.5 - lat) / 11.5) * (mapH - 16)] as const;
    ctx.strokeStyle = 'rgba(217,180,90,0.35)'; ctx.lineWidth = 1.5;
    const coast = (pts: number[][]) => { ctx.beginPath(); pts.forEach(([lo, la], j) => (j ? ctx.lineTo(...P(lo, la)) : ctx.moveTo(...P(lo, la)))); ctx.stroke(); };
    coast([[-2, 34.9], [0.1, 35.9], [1.3, 36.5], [3, 36.8], [5.1, 36.8], [7.7, 36.9], [9.9, 37.3], [10.3, 36.9], [11.05, 37.05], [10.6, 36.4], [10.8, 35.8], [11.1, 35.2], [10.1, 34.2], [11.1, 33.3], [12, 32.9]]);
    coast([[-2, 36.8], [-0.3, 38.6], [0.9, 40.9], [3.2, 41.9], [3.1, 42.5], [4, 43.5], [5.4, 43.2], [7.4, 43.7], [8.9, 44.4], [10.2, 43.9], [10.5, 42.9], [12, 41.8]]);
    if (power === 'axis') {
      ctx.fillStyle = 'rgba(201,99,79,0.35)';
      const [ox, oy] = P(10.2, 35.9); ctx.beginPath(); ctx.ellipse(ox, oy, w * 0.05, mapH * 0.11, 0, 0, Math.PI * 2); ctx.fill();
    }
    const spots: [Where | 'tenes', number, number, string][] = [['tunis', 10.18, 36.8, 'Tunis'], ['algeria', 2.88, 33.8, 'Laghouat'], ['tenes', 1.31, 36.51, 'Ténès'], ['pau', -0.37, 43.3, 'Pau']];
    for (const [id, lo, la, name] of spots) {
      const [x, yy] = P(lo, la), here = id === where || (id === 'tenes' && where === 'algeria');
      ctx.fillStyle = here ? GOLD : C.faint; ctx.beginPath(); ctx.arc(x, yy, here ? 6 : 4, 0, Math.PI * 2); ctx.fill();
      label(ctx, name, x + (id === 'tenes' ? -8 : 8), yy, { size: 11, color: here ? GOLD : C.soft, align: id === 'tenes' ? 'right' : 'left' });
    }
    label(ctx, t('Schematic map of the exile'), w - 6, 10, { size: 9, color: C.faint, align: 'right' });
    // the timeline: reign in gold, exile in blue, the cursor at this month
    const ty = h - 24, x0 = 8, x1 = w - 8, X = (ms: number) => x0 + ((ms - ACCESSION) / (DEATH - ACCESSION)) * (x1 - x0);
    ctx.fillStyle = GOLD; ctx.fillRect(x0, ty, X(DEPOSED) - x0, 10);
    ctx.fillStyle = 'rgba(143,180,232,0.55)'; ctx.fillRect(X(DEPOSED), ty, x1 - X(DEPOSED), 10);
    ctx.fillStyle = RUST; ctx.fillRect(X(D(1942, 11, 1)), ty - 4, X(D(1943, 5, 13)) - X(D(1942, 11, 1)), 3);
    const cx = X(Math.max(ACCESSION, endOf(i)));
    ctx.fillStyle = C.ink; ctx.fillRect(cx - 1.5, ty - 8, 3, 26);
    label(ctx, t('reign, 1942–43'), x0, ty + 20, { size: 10, color: GOLD, align: 'left' });
    label(ctx, t('exile, 1943–48'), x1, ty + 20, { size: 10, color: BLUE, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('{month}: Moncef Bey {where}. {power}.', { month, where: whereText, power: powerText })} />
      <Range label={t('Month, 1942–48')} value={i} min={0} max={LAST_MONTH} step={1} onChange={(v) => setI(Math.round(v))} format={() => month} />
      <Readouts
        items={[
          { label: t('Days on the throne'), value: formatNumber(daysOnThrone(i)), tone: 'accent' },
          { label: t('Days in exile'), value: formatNumber(daysInExile(i)), tone: daysInExile(i) > daysOnThrone(i) ? 'bad' : undefined },
        ]}
      />
      <p className="lab__note">{event ?? `${whereText} · ${powerText}`}</p>
    </div>
  );
}

/** What happened in month `i`, if anything the sources date. */
function eventAt(i: number): string | null {
  switch (i) {
    case 0: return t('19 June 1942: Moncef Bey comes to the throne.');
    case 2: return t('August 1942: he sends Vichy France demands for reform.');
    case 5: return t('November 1942: German and Italian troops occupy Tunis.');
    case 6: return t('December 1942: the Germans force Jewish men into labour and levy 20 million francs.');
    case 7: return t('1 January 1943: he names a government of Tunisians under M’hamed Chenik.');
    case 11: return t('May 1943: the Axis armies surrender; on 14 May the French depose him and fly him to Laghouat.');
    case 40: return t('17 October 1945: he is moved to Pau, in France.');
    case 75: return t('1 September 1948: he dies in exile in Pau.');
    default: return null;
  }
}
