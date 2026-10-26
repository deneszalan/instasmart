import { useState } from 'react';
import { C, Choice, FONT, label, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

export type Prize = 'physics' | 'chemistry' | 'medicine' | 'literature' | 'economics' | 'peace';
export type Chooser = 'academy' | 'karolinska' | 'swedish' | 'norwegian';

export const PRIZES: Prize[] = ['physics', 'chemistry', 'medicine', 'literature', 'economics', 'peace'];
export const CHOOSERS: Chooser[] = ['academy', 'karolinska', 'swedish', 'norwegian'];

/**
 * Who chooses each laureate: the Royal Swedish Academy of Sciences (physics, chemistry and, since 1969, the
 * Riksbank's economics prize), the Nobel Assembly at Karolinska Institutet (medicine), the Swedish Academy
 * (literature), and five people elected by Norway's parliament (peace), as Nobel's will of 1895 set out.
 */
export const CHOSEN_BY: Record<Prize, Chooser> = {
  physics: 'academy', chemistry: 'academy', medicine: 'karolinska', literature: 'swedish', economics: 'academy', peace: 'norwegian',
};
export const inOslo = (c: Chooser) => c === 'norwegian';

export function score(assigned: Partial<Record<Prize, Chooser>>) {
  return PRIZES.filter((p) => assigned[p] === CHOSEN_BY[p]).length;
}

const prizeName = (p: Prize) =>
  p === 'physics' ? t('Physics') : p === 'chemistry' ? t('Chemistry') : p === 'medicine' ? t('Medicine') : p === 'literature' ? t('Literature') : p === 'economics' ? t('Economics') : t('Peace');
const chooserName = (c: Chooser) =>
  c === 'academy' ? t('Academy of Sciences') : c === 'karolinska' ? t('Karolinska') : c === 'swedish' ? t('Swedish Academy') : t('Committee of five');

const GOLD = '#e7c46a', BLUE = '#a9c4e4';

export default function WhoChooses({ onDone }: LabProps) {
  const [prize, setPrize] = useState<Prize>('peace');
  const [assigned, setAssigned] = useState<Partial<Record<Prize, Chooser>>>({});
  const right = score(assigned);
  useGoal(right === PRIZES.length, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // two cities, four choosers, and the prizes placed where the reader put them
    const split = w * 0.74;
    const boxes = CHOOSERS.map((c, i) => {
      const oslo = inOslo(c), bw = oslo ? w - split - 8 : (split - 16) / 3;
      return { c, x: oslo ? split + 4 : 4 + i * (bw + 4), w: bw };
    });
    label(ctx, t('Stockholm'), split / 2, 8, { size: 10.5, color: BLUE });
    label(ctx, t('Oslo'), split + (w - split) / 2, 8, { size: 10.5, color: GOLD });
    const top = 18, bh = h - top - 4;
    for (const b of boxes) {
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.roundRect(b.x, top, b.w, bh, 8);
      ctx.fill();
      // the chooser's name, in two lines if it is too wide
      ctx.font = `600 9px ${FONT}`;
      const name = chooserName(b.c), words = name.split(' ');
      const lines = ctx.measureText(name).width <= b.w - 6 || words.length < 2 ? [name] : [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];
      lines.forEach((l, k) => label(ctx, l, b.x + b.w / 2, top + 10 + k * 10, { size: 9, weight: 600, color: C.soft }));
      // the prizes the reader placed here, as chips: green if right, red if not
      const here = PRIZES.filter((p) => assigned[p] === b.c), chipH = Math.min(18, (bh - 34) / Math.max(3, here.length) - 4);
      here.forEach((p, j) => {
        const y = top + 30 + j * (chipH + 4);
        ctx.fillStyle = inOslo(b.c) ? GOLD : BLUE;
        ctx.beginPath();
        ctx.roundRect(b.x + 4, y, b.w - 8, chipH, 5);
        ctx.fill();
        ctx.strokeStyle = CHOSEN_BY[p] === b.c ? C.good : C.bad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        label(ctx, prizeName(p), b.x + b.w / 2, y + chipH / 2 + 0.5, { size: 9.5, color: '#2a0d12' });
      });
    }
  };

  return (
    <div className="lab">
      <Choice label={t('Prize')} value={prize} onChange={setPrize} options={PRIZES.map((p) => ({ value: p, label: prizeName(p) }))} />
      <Stage draw={draw} label={t('Nobel prizes placed with the institutions that choose them; {n} of 6 right', { n: right })} />
      <Choice
        label={t('Who chooses it?')}
        value={assigned[prize] ?? ('' as Chooser)}
        onChange={(c) => {
          setAssigned({ ...assigned, [prize]: c });
          const next = PRIZES.find((p) => p !== prize && assigned[p] === undefined);
          if (next) setPrize(next);
        }}
        options={CHOOSERS.map((c) => ({ value: c, label: chooserName(c) }))}
      />
      <Readouts
        items={[
          { label: t('Right'), value: t('{n} of {all}', { n: right, all: PRIZES.length }), tone: right === PRIZES.length ? 'good' : 'accent' },
          { label: t('Placed'), value: `${Object.keys(assigned).length}/${PRIZES.length}` },
          { label: t('Placed in Oslo'), value: `${PRIZES.filter((p) => assigned[p] === 'norwegian').length}` },
        ]}
      />
    </div>
  );
}
