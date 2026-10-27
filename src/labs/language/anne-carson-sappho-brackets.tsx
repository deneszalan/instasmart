import { useRef, useState } from 'react';
import { Btn, C, label, pluck, Readouts, Stage, useAudio, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Sappho, fragment 31, line 1: Φαίνεταί μοι κῆνος ἴσος θέοισιν, split into its 11 syllables (transliterated). */
export const SYLLABLES = ['phai', 'ne', 'tai', 'moi', 'kē', 'no', 'si', 'sos', 'the', 'oi', 'sin'] as const;
export const GREEK = 'Φαίνεταί μοι κῆνος ἴσος θέοισιν';

/** The lesser Sapphic line: – u – x – u u – u – –, with x free; the last syllable of a line may be either too. */
export type Mark = 'long' | 'short';
export const SAPPHIC: (Mark | 'either')[] = ['long', 'short', 'long', 'either', 'long', 'short', 'short', 'long', 'short', 'long', 'either'];

export const fits = (marks: Mark[]) => marks.length === SAPPHIC.length && marks.every((m, i) => SAPPHIC[i] === 'either' || SAPPHIC[i] === m);
export const symbol = (m: Mark | 'either') => (m === 'long' ? '–' : m === 'short' ? '∪' : '×');
/** How many places agree with the pattern. */
export const agreeing = (marks: Mark[]) => marks.filter((m, i) => SAPPHIC[i] === 'either' || SAPPHIC[i] === m).length;

export default function SapphicLine({ onDone, active }: LabProps) {
  const [marks, setMarks] = useState<Mark[]>(() => SYLLABLES.map(() => 'short'));
  const done = fits(marks);
  useGoal(done, onDone);
  const audio = useAudio(active);

  const toggle = (i: number) => setMarks((ms) => ms.map((m, j) => (j === i ? (m === 'long' ? 'short' : 'long') : m)));
  const play = (pattern: Mark[]) => {
    const ac = audio();
    if (!ac) return;
    let at = ac.currentTime + 0.05;
    pattern.forEach((m, i) => {
      pluck(ac, i === 0 ? 392 : 330, at, { length: m === 'long' ? 0.42 : 0.2, gain: 0.14 });
      at += m === 'long' ? 0.44 : 0.22;
    });
  };

  const layout = (w: number) => {
    const x0 = 8, cw = (w - 16) / SYLLABLES.length;
    return { x0, cw };
  };
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const { x0, cw } = layout(w), boxTop = h * 0.34, boxH = Math.min(46, h * 0.3);
    label(ctx, GREEK, w / 2, 14, { size: 14, color: C.ink, weight: 600 });
    label(ctx, t('Sappho, fragment 31, line 1: tap each syllable to mark it long or short'), w / 2, 34, { size: 10, color: C.soft, weight: 500 });
    SYLLABLES.forEach((s, i) => {
      const x = x0 + i * cw, long = marks[i] === 'long';
      ctx.fillStyle = long ? 'rgba(253,224,71,0.30)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(x + 1.5, boxTop, cw - 3, boxH, 6);
      ctx.fill();
      label(ctx, symbol(marks[i]), x + cw / 2, boxTop + boxH * 0.32, { size: 15, color: long ? C.accent : C.cool });
      label(ctx, s, x + cw / 2, boxTop + boxH * 0.74, { size: 11, color: C.ink, weight: 600 });
      if (done) label(ctx, symbol(SAPPHIC[i]), x + cw / 2, boxTop + boxH + 14, { size: 12, color: C.good });
    });
    if (done) label(ctx, t('the Sapphic line'), w / 2, boxTop + boxH + 32, { size: 11, color: C.good });
  };

  const onPointer = (p: { x: number; y: number; kind: string }, w: number) => {
    if (p.kind !== 'down') return;
    const { x0, cw } = layout(w), i = Math.floor((p.x - x0) / cw);
    if (i >= 0 && i < SYLLABLES.length) toggle(i);
  };
  const width = useRef(360);

  return (
    <div className="lab">
      <Stage
        draw={(ctx, size) => {
          width.current = size.w;
          draw(ctx, size);
        }}
        onPointer={(p) => onPointer(p, width.current)}
        label={t('The first line of Sappho’s fragment 31 in 11 syllables, each marked long or short')}
      />
      <div className="lab__row">
        <Btn onClick={() => play(marks)}>{t('Hear your rhythm')}</Btn>
        <Btn ghost onClick={() => setMarks(SYLLABLES.map(() => 'short'))}>{t('Clear the marks')}</Btn>
      </div>
      <Readouts
        items={[
          { label: t('Long syllables'), value: String(marks.filter((m) => m === 'long').length) },
          { label: t('Fit the metre'), value: `${agreeing(marks)} / ${SYLLABLES.length}`, tone: done ? 'good' : undefined },
        ]}
      />
      <p className="lab__note">
        {t('Long: a vowel with a line (ē), a pair like ai or oi, or a vowel with two consonants after it, even across a word gap (th is one). The last syllable may be either. Simplified rules.')}
      </p>
    </div>
  );
}
