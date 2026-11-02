import { useState } from 'react';
import { C, Choice, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { LOCALE, t } from '../../i18n';

/**
 * Where the Commonwealth War Graves Commission commemorates a soldier of the campaign in Algeria and Tunisia
 * (CWGC, Medjez-el-Bab Memorial and Alamein Memorial): with a known grave, a headstone in a war cemetery such as
 * Medjez-el-Bab; with none, the Medjez-el-Bab Memorial names First Army men who died between 8 November 1942 and
 * 13 May 1943, and Eighth Army men from 20 February 1943; Eighth Army men who died in Tunisia up to 19 February 1943
 * are named on the Alamein Memorial in Egypt.
 */
const DAY = 864e5;
const D = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
export const FIRST = D(1942, 11, 8);
export const SWITCH = D(1943, 2, 20);
export const LAST = D(1943, 5, 13);
/** Days from 8 November 1942 (0) to 13 May 1943. */
export const SPAN = (LAST - FIRST) / DAY;
export type Army = 'first' | 'eighth';
export type Place = 'medjez' | 'alamein';
/** Which memorial names a soldier of this army, missing in Algeria or Tunisia, who died on day `day`. */
export const memorialFor = (army: Army, day: number): Place => (army === 'first' || FIRST + day * DAY >= SWITCH ? 'medjez' : 'alamein');
/** The first day on which an Eighth Army soldier would be named at Medjez-el-Bab. */
export const SWITCH_DAY = (SWITCH - FIRST) / DAY;

const GREEN = '#7fd1a0', RUST = '#e39a7a';

export default function MedjezMemorial({ onDone }: LabProps) {
  const [army, setArmy] = useState<Army>('eighth');
  const [day, setDay] = useState(0);
  const place = memorialFor(army, day);
  useGoal(army === 'eighth' && day === SWITCH_DAY, onDone);
  const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(FIRST + day * DAY);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // two memorials, schematic: Medjez-el-Bab in Tunisia, El Alamein in Egypt; the name goes to one of them
    const k = Math.min(1, h / 170), y = h * 0.36, mx = w * 0.18, ax = w * 0.82;
    for (const [x, id, name, sub] of [[mx, 'medjez', 'Medjez-el-Bab', t('memorial in Tunisia')], [ax, 'alamein', 'El Alamein', t('memorial in Egypt')]] as const) {
      const on = place === id;
      ctx.fillStyle = on ? (id === 'medjez' ? GREEN : RUST) : 'rgba(255,255,255,0.18)';
      ctx.fillRect(x - 26 * k, y - 22 * k, 52 * k, 34 * k);
      ctx.fillRect(x - 3 * k, y - 48 * k, 6 * k, 26 * k); ctx.fillRect(x - 10 * k, y - 42 * k, 20 * k, 4 * k);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      for (let r = 0; r < 3; r++) ctx.fillRect(x - 20 * k, y - 16 * k + r * 9 * k, 40 * k, 3);
      label(ctx, name, x, y + 26 * k, { size: 12, color: on ? C.ink : C.soft });
      label(ctx, sub, x, y + 26 * k + 14, { size: 10, color: C.faint });
    }
    const tx = place === 'medjez' ? mx : ax, ny = h - 22;
    line(ctx, w / 2, ny - 6, tx, y + 26 * k + 24, place === 'medjez' ? GREEN : RUST, 2, [5, 4]);
    ctx.fillStyle = C.ink; ctx.fillRect(w / 2 - 26, ny - 6, 52, 12);
    label(ctx, t('his name'), w / 2, ny + 14, { size: 10, color: C.soft });
    // Bottom left, clear of the memorials' crosses.
    label(ctx, t('schematic, not to scale'), 6, h - 8, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('A {army} with no known grave who died on {date} is named at {place}', { army: army === 'first' ? t('First Army soldier') : t('Eighth Army soldier'), date, place: place === 'medjez' ? 'Medjez-el-Bab' : 'El Alamein' })} />
      <Choice label={t('The soldier’s army')} options={[{ value: 'first', label: t('1st Army') }, { value: 'eighth', label: t('8th Army') }]} value={army} onChange={(v) => setArmy(v as Army)} />
      <Range label={t('Date he died')} value={day} min={0} max={SPAN} step={1} onChange={(v) => setDay(Math.round(v))} format={() => date} />
      <Readouts
        items={[
          { label: t('Named on the memorial at'), value: place === 'medjez' ? 'Medjez-el-Bab' : 'El Alamein', tone: place === 'medjez' ? 'good' : 'bad' },
        ]}
      />
    </div>
  );
}
