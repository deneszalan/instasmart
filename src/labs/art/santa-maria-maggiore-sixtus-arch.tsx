import { useState } from 'react';
import { Btn, C, label, line, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The years the lab starts from: anywhere from AD 100 to 1600. */
export const RANGE: [number, number] = [100, 1600];
/** The five popes named Sixtus (Xystus), as Wikipedia gives their years; Sixtus I's are approximate (c. 115/119 – c. 125/128). */
export const SIXTUS_REIGNS: [number, number][] = [
  [115, 128],
  [257, 258],
  [432, 440],
  [1471, 1484],
  [1585, 1590],
];
/** Pope Liberius, in whose time the legend of the snow is set. */
export const LIBERIUS: [number, number] = [352, 366];
/** Christianity legal in the Roman Empire (Edict of Milan); the Council of Ephesus; Jacopo Torriti's apse mosaic. */
export const LEGAL = 313, EPHESUS = 431, APSE = 1295;

export type Clue = 'sixtus' | 'legal' | 'ephesus' | 'apse';
export const CLUES: Clue[] = ['sixtus', 'legal', 'ephesus', 'apse'];

type Win = [number, number];
const meet = (a: Win[], b: Win[]): Win[] => {
  const out: Win[] = [];
  for (const [a0, a1] of a) for (const [b0, b1] of b) if (Math.max(a0, b0) <= Math.min(a1, b1)) out.push([Math.max(a0, b0), Math.min(a1, b1)]);
  return out;
};

/** The windows of years that every chosen clue still allows. */
export function windows(clues: Iterable<Clue>): Win[] {
  const on = new Set(clues);
  let w: Win[] = [RANGE];
  if (on.has('sixtus')) w = meet(w, SIXTUS_REIGNS);
  if (on.has('legal')) w = meet(w, [[LEGAL, RANGE[1]]]);
  if (on.has('ephesus')) w = meet(w, [[EPHESUS + 1, RANGE[1]]]);
  if (on.has('apse')) w = meet(w, [[RANGE[0], APSE]]);
  return w;
}
/** How many years the windows cover in all. */
export const yearsLeft = (w: Win[]) => w.reduce((s, [a, b]) => s + (b - a), 0);
/** Whether a span of years still fits inside one of the windows. */
export const fits = (w: Win[], [a, b]: Win) => w.some(([w0, w1]) => a < w1 && b > w0);

export default function SixtusArch({ onDone }: LabProps) {
  const [on, setOn] = useState<Set<Clue>>(new Set());
  const w = windows(on);
  const solved = w.length === 1 && yearsLeft(w) <= 10;
  useGoal(solved, onDone);
  const toggle = (c: Clue) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  const clueText = (c: Clue) =>
    c === 'sixtus' ? t('Names a bishop Sixtus') : c === 'legal' ? t('Christianity legal, 313') : c === 'ephesus' ? t('After Ephesus, 431') : t('Before the apse, 1295');

  const draw = (ctx: CanvasRenderingContext2D, { w: cw, h }: { w: number; h: number }) => {
    const L = 14, R = cw - 14, Y = h * 0.44;
    const X = (y: number) => L + ((R - L) * (y - RANGE[0])) / (RANGE[1] - RANGE[0]);
    line(ctx, L, Y, R, Y, C.faint, 2);
    for (let y = 200; y <= 1600; y += 200) {
      line(ctx, X(y), Y - 4, X(y), Y + 4, C.faint, 1.5);
      label(ctx, formatNumber(y, 'year'), X(y), Y + 16, { size: 9.5, color: C.faint, align: y === 1600 ? 'right' : 'center' });
    }
    // the years still possible
    for (const [a, b] of w) {
      ctx.fillStyle = solved ? C.good : C.accent;
      ctx.fillRect(X(a), Y - 24, Math.max(3, X(b) - X(a)), 16);
    }
    if (w.length === 1 && w[0][1] - w[0][0] < 60) label(ctx, `${formatNumber(w[0][0], 'year')}–${formatNumber(w[0][1], 'year')}`, X(w[0][0]), Y - 34, { size: 11, align: 'left', color: solved ? C.good : C.accent });
    // the legend's pope
    const lx = X(LIBERIUS[0]), lw = X(LIBERIUS[1]) - lx;
    ctx.fillStyle = C.cool;
    ctx.fillRect(lx, Y + 26, Math.max(3, lw), 8);
    label(ctx, t('the legend: Pope Liberius'), lx + Math.max(3, lw) + 6, Y + 30, { size: 10, align: 'left', color: C.cool });
  };

  const liberiusFits = fits(w, LIBERIUS);
  return (
    <div className="lab">
      <Stage draw={draw} label={t('A time ruler from AD 100 to 1600, with the years the clues still allow for the arch mosaic')} />
      <div className="lab__row">
        {CLUES.map((c) => (
          <Btn key={c} ghost={!on.has(c)} onClick={() => toggle(c)}>
            {clueText(c)}
          </Btn>
        ))}
      </div>
      <Readouts
        items={[
          { label: t('Windows left'), value: formatNumber(w.length), tone: solved ? 'good' : 'accent' },
          { label: t('Years still possible'), value: formatNumber(yearsLeft(w)) },
          { label: t('Pope Liberius, 352–366'), value: liberiusFits ? t('still possible') : t('ruled out'), tone: liberiusFits ? undefined : 'bad' },
        ]}
      />
      <p className="lab__note">{t('Simplified: historians also weigh the building, the style of the mosaics and written records. The dates of Sixtus I are approximate.')}</p>
    </div>
  );
}
