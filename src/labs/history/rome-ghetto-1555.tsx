import { useState } from 'react';
import { C, Choice, dot, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Rome's ghetto covered about 3 hectares (Wikipedia, "Roman Ghetto"). */
export const AREA_M2 = 30000;
/** People in the ghetto: about 2,000 at its founding in 1555, about 3,500 in the late 1580s, 4,000 in 1656. */
export const PEOPLE = { 1555: 2000, 1588: 3500, 1656: 4000 } as const;
export type Year = keyof typeof PEOPLE;
/** Rome today: 2,745,062 people on 1,287.36 km² (Wikipedia, "Rome"), per hectare. */
export const ROME_PER_HA = 2745062 / 128736;

export const perHectare = (people: number) => people / (AREA_M2 / 10000);
export const groundPerPerson = (people: number) => AREA_M2 / people;
/** An upper bound: as if every square metre of the quarter were built on, `floors` high. */
export const floorPerPerson = (people: number, floors: number) => (AREA_M2 * floors) / people;
/** The goal: as much floor per person in 1656 as one floor gave in 1555. */
export const TARGET = floorPerPerson(PEOPLE[1555], 1);

export default function GhettoCrowding({ onDone }: LabProps) {
  const [year, setYear] = useState<Year>(1555);
  const [floors, setFloors] = useState(1);
  const people = PEOPLE[year];
  const each = floorPerPerson(people, floors);
  useGoal(year === 1656 && each >= TARGET, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the 3 hectares as a square plot, one dot for every 20 people
    const side = Math.min(h - 28, w * 0.5), x0 = 8, y0 = 8;
    ctx.fillStyle = 'rgba(201,143,90,0.35)';
    ctx.fillRect(x0, y0, side, side);
    ctx.strokeStyle = '#d9b98c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, y0, side, side);
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < people / 20; i++) dot(ctx, x0 + 3 + r() * (side - 6), y0 + 3 + r() * (side - 6), 1.6, C.ink);
    label(ctx, t('3 hectares · each dot 20 people'), x0, y0 + side + 12, { size: 10, align: 'left', color: C.soft });
    // a house, floors high, on the right
    const hx = x0 + side + 30, hw = Math.min(70, w - hx - 10), fh = Math.min(26, (h - 50) / 6.8), base = h - 10;
    for (let f = 0; f < floors; f++) {
      ctx.fillStyle = f % 2 ? '#c98f5a' : '#b07444';
      ctx.fillRect(hx, base - (f + 1) * fh, hw, fh - 1);
      ctx.fillStyle = 'rgba(30,24,20,0.75)';
      ctx.fillRect(hx + hw * 0.2, base - (f + 1) * fh + fh * 0.25, hw * 0.18, fh * 0.45);
      ctx.fillRect(hx + hw * 0.62, base - (f + 1) * fh + fh * 0.25, hw * 0.18, fh * 0.45);
    }
    ctx.fillStyle = '#9c4a35';
    ctx.beginPath();
    ctx.moveTo(hx - 4, base - floors * fh);
    ctx.lineTo(hx + hw / 2, base - floors * fh - 14);
    ctx.lineTo(hx + hw + 4, base - floors * fh);
    ctx.closePath();
    ctx.fill();
    label(ctx, t('Floors: {n}', { n: formatNumber(floors) }), hx + hw / 2, base - floors * fh - 26, { size: 10, color: C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('The ghetto’s 3 hectares with {p} people, and a house {n} floors high', { p: formatNumber(people), n: formatNumber(floors) })} />
      <Choice
        label={t('Year in the ghetto')}
        options={[
          { value: 1555, label: '1555' },
          { value: 1588, label: t('late 1580s') },
          { value: 1656, label: '1656' },
        ]}
        value={year}
        onChange={setYear}
      />
      <Range label={t('Floors of every house')} value={floors} min={1} max={6} step={1} onChange={(v) => setFloors(Math.round(v))} format={(v) => formatNumber(v)} />
      <Readouts
        items={[
          { label: t('People in the ghetto'), value: formatNumber(people) },
          { label: t('People per hectare in the ghetto'), value: formatNumber(Math.round(perHectare(people))), tone: 'accent' },
          { label: t('Floor per person, at most'), value: `${formatNumber(Math.round(each * 10) / 10)} m²`, tone: year === 1656 && each >= TARGET ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">{t('Simplified: as if all 3 hectares were built on, so real rooms were smaller. Rome today has about {n} people per hectare.', { n: formatNumber(Math.round(ROME_PER_HA)) })}</p>
    </div>
  );
}
