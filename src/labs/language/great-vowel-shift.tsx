import { useState } from 'react';
import { C, label, line, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

// where each vowel sits in the mouth: x from the front (0) to the back (1), y from high (0) to low (1)
const AT: Record<string, [number, number]> = {
  i: [0.04, 0.04], e: [0.12, 0.34], ɛ: [0.2, 0.64], a: [0.32, 0.96], ə: [0.5, 0.5], u: [0.96, 0.04], o: [0.93, 0.34], ɔ: [0.9, 0.64], ɪ: [0.16, 0.16], ʊ: [0.84, 0.16],
};

interface Word {
  word: string;
  then: string; // around 1400
  now: string; // today
  path: [number, string][]; // [year, vowel or diphthong]
}
/** Seven words, their long vowels around 1400 and today, and roughly when each moved (first phase by 1500, second from about 1550). */
export const WORDS: Word[] = [
  { word: 'bite', then: 'iː', now: 'aɪ', path: [[1400, 'i'], [1500, 'əɪ'], [1900, 'aɪ']] },
  { word: 'meet', then: 'eː', now: 'iː', path: [[1400, 'e'], [1500, 'i'], [1900, 'i']] },
  { word: 'meat', then: 'ɛː', now: 'iː', path: [[1550, 'ɛ'], [1650, 'e'], [1750, 'i'], [1900, 'i']] },
  { word: 'mate', then: 'aː', now: 'eɪ', path: [[1550, 'a'], [1650, 'ɛ'], [1750, 'e'], [1900, 'eɪ']] },
  { word: 'out', then: 'uː', now: 'aʊ', path: [[1400, 'u'], [1500, 'əʊ'], [1900, 'aʊ']] },
  { word: 'boot', then: 'oː', now: 'uː', path: [[1400, 'o'], [1500, 'u'], [1900, 'u']] },
  { word: 'boat', then: 'ɔː', now: 'oʊ', path: [[1550, 'ɔ'], [1650, 'o'], [1800, 'o'], [1900, 'oʊ']] },
];

/** A vowel's place (and, for a diphthong, where it glides to) in `year`. */
export function placeIn(w: Word, year: number): { at: [number, number]; to: [number, number] | null } {
  const pos = (v: string) => ({ at: AT[v[0]], to: v.length > 1 ? AT[v[1]] : null });
  const p = w.path;
  if (year <= p[0][0]) return pos(p[0][1]);
  for (let k = 1; k < p.length; k++)
    if (year <= p[k][0]) {
      const a = pos(p[k - 1][1]), b = pos(p[k][1]), f = (year - p[k - 1][0]) / (p[k][0] - p[k - 1][0]);
      const mix = (u: [number, number], v: [number, number]): [number, number] => [u[0] + (v[0] - u[0]) * f, u[1] + (v[1] - u[1]) * f];
      return { at: mix(a.at, b.at), to: a.to || b.to ? mix(a.to ?? a.at, b.to ?? b.at) : null };
    }
  return pos(p[p.length - 1][1]);
}

const COLOURS = ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#7dd3fc', '#a5b4fc', '#f0abfc'];

export default function VowelShift({ onDone }: LabProps) {
  const [year, setYear] = useState(1400);
  const [pick, setPick] = useState(0);
  useGoal(year >= 1900, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // the vowel space: front of the mouth on the left, back on the right, tongue high at the top
    const cw = w * 0.62, L = 22, R = cw - 10, top = 18, bot = h - 18;
    const P = ([x, y]: [number, number]): [number, number] => [L + (x * 0.85 + y * 0.15) * (R - L), top + y * (bot - top)];
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(...P([0, 0]));
    ctx.lineTo(...P([1, 0]));
    ctx.lineTo(...P([1, 1]));
    ctx.lineTo(...P([0.25, 1]));
    ctx.closePath();
    ctx.stroke();
    label(ctx, t('front'), L, 8, { size: 9.5, align: 'left', color: C.faint });
    label(ctx, t('back'), R, 8, { size: 9.5, align: 'right', color: C.faint });
    label(ctx, t('high'), L - 4, top + 10, { size: 9, align: 'right', color: C.faint });
    label(ctx, t('low'), L - 4, bot - 4, { size: 9, align: 'right', color: C.faint });
    WORDS.forEach((wd, i) => {
      const { at, to } = placeIn(wd, year), [x, y] = P(at), on = i === pick;
      if (to) line(ctx, x, y, ...P(to), COLOURS[i], on ? 2.5 : 1.5);
      ctx.fillStyle = COLOURS[i];
      ctx.beginPath();
      ctx.arc(x, y, on ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      // bite and out start their glides from the same middle vowel: keep their names apart
      label(ctx, wd.word, x + 8, y + (wd.word === 'out' ? 10 : -8), { size: on ? 12 : 10, align: 'left', color: on ? C.ink : COLOURS[i] });
    });
    // the list: each word's vowel around 1400 and today
    const lx = cw + 8, rh = (h - 10) / WORDS.length;
    WORDS.forEach((wd, i) => {
      const y = 5 + rh * (i + 0.5);
      label(ctx, wd.word, lx, y, { size: 11, align: 'left', color: COLOURS[i] });
      label(ctx, `/${wd.then}/ → /${wd.now}/`, w - 6, y, { size: 10.5, align: 'right', color: i === pick ? C.ink : C.soft });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={(p) => p.kind === 'down' && setPick((k) => (k + 1) % WORDS.length)} label={t('Seven long vowels on a chart of the mouth in {y}', { y: year })} />
      <Range label={t('Year')} value={year} min={1400} max={1900} step={10} onChange={setYear} />
      <p className="lab__note">{year < 1500 ? t('First phase: bite and out start to glide; meet and boot rise.') : year < 1550 ? t('By 1500 the first phase is done.') : year < 1760 ? t('Second phase: mate, meat and boat rise a step.') : t('Later changes give today’s vowels. Tap the chart to pick a word.')}</p>
    </div>
  );
}
