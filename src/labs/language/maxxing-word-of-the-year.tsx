import { useRef, useState } from 'react';
import { C, Choice, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/**
 * Words that gave English a new ending (a libfix) or a new word, with where the piece was cut off (`cut`: the number
 * of letters before the cut) and, where the word had parts of its own, where those parts meet (`own`).
 */
export const WORDS = [
  { word: 'ALCOHOLIC', cut: 4, own: 7 },
  { word: 'WATERGATE', cut: 5, own: 5 },
  { word: 'MARATHON', cut: 3, own: null },
  { word: 'HAMBURGER', cut: 3, own: 7 },
  { word: 'MINMAXING', cut: 3, own: 3 },
] as const;
export type WordId = 0 | 1 | 2 | 3 | 4;

/** The piece set free when `word` is cut after `n` letters, and whether that is the cut English made. */
export function tryCut(i: WordId, n: number) {
  const w = WORDS[i];
  return { piece: w.word.slice(n), front: w.word.slice(0, n), right: n === w.cut, ownParts: n === w.own };
}

const PINK = '#ff4f9a', LIME = '#b6f06b', CREAM = '#f3ead8', INK = '#17212b', CYAN = '#5fd4ff';

/** What the found piece became, with examples (literal strings, so each has its German). */
function found(i: WordId) {
  switch (i) {
    case 0:
      return t('Its own parts are alcohol + ic, but English heard -holic: workaholic (1947), shopaholic.');
    case 1:
      return t('The Watergate buildings gave -gate, now stuck onto other scandals.');
    case 2:
      return t('Marathon is a place name in Greece, not mar + athon. Walkathon (1932) freed -athon: telethon, hackathon.');
    case 3:
      return t('Its own parts are Hamburg + er, but English heard ham + burger: cheeseburger, and burger on its own.');
    default:
      return t('Gamers’ min-maxing gave maxing, which picked up an extra x: looksmaxxing, tokenmaxxing, maxxing.');
  }
}
const wordName = (i: WordId) => (i === 4 ? 'MIN-MAXING' : WORDS[i].word);

export default function MaxxingLibfix({ onDone }: LabProps) {
  const [i, setI] = useState<WordId>(0);
  const [cuts, setCuts] = useState<(number | null)[]>(WORDS.map(() => null));
  const [done, setDone] = useState<boolean[]>(WORDS.map(() => false));
  const size = useRef({ w: 0, h: 0 });
  const w = WORDS[i].word, n = cuts[i];
  const res = n === null ? null : tryCut(i, n);
  const count = done.filter(Boolean).length;
  useGoal(count === WORDS.length, onDone);

  const layout = (W: number, H: number) => {
    const s = Math.min(42, (W - 20) / (w.length * 1.12)), step = s * 1.12, x0 = (W - w.length * step) / 2;
    return { s, step, x0, y: H * 0.36 };
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const { step, x0 } = layout(size.current.w, size.current.h);
    const g = Math.round((p.x - x0) / step);
    if (g < 1 || g > w.length - 1) return;
    setCuts(cuts.map((c, j) => (j === i ? g : c)));
    if (tryCut(i, g).right) setDone(done.map((d, j) => d || j === i));
  };

  const draw = (ctx: CanvasRenderingContext2D, s0: { w: number; h: number }) => {
    size.current = s0;
    const { s, step, x0, y } = layout(s0.w, s0.h);
    label(ctx, t('Tap between two letters to cut the word'), s0.w / 2, 12, { size: 11, color: C.soft });
    for (let j = 0; j < w.length; j++) {
      const after = n !== null && j >= n, shift = n !== null ? (after ? 6 : -6) : 0;
      const x = x0 + j * step + (step - s) / 2 + shift;
      const fill = res?.right ? (after ? PINK : 'rgba(243,234,216,0.3)') : n !== null && after ? 'rgba(255,79,154,0.45)' : CREAM;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x, y - s / 2, s, s, s * 0.16);
      ctx.fill();
      label(ctx, w[j], x + s / 2, y + 1, { size: s * 0.55, weight: 800, color: res?.right && after ? '#fff6fa' : INK });
      if (i === 4 && j === 2) label(ctx, '-', x + s + (step - s) / 2 + shift, y, { size: s * 0.5, color: C.faint });
    }
    if (n !== null) {
      const cx = x0 + n * step;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, y - s * 0.8);
      ctx.lineTo(cx, y + s * 0.8);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (res) {
      const msg = res.right ? t('The piece English set free: -{p}', { p: res.piece.toLowerCase() }) : res.ownParts ? t('That is where its own parts meet. The new piece was cut elsewhere.') : t('Not the cut English made here. Try another.');
      label(ctx, msg, s0.w / 2, y + s * 1.1, { size: 12, color: res.right ? PINK : C.soft });
    }
    done.forEach((d, j) => {
      const x = s0.w / 2 + (j - 2) * 20;
      ctx.fillStyle = d ? LIME : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, s0.h - 10, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('The word {w} as letter tiles; tap between two letters to cut it', { w: wordName(i) })} />
      <Choice
        label={t('Word to cut')}
        options={WORDS.map((_, j) => ({ value: j as WordId, label: `${done[j] ? '✓ ' : ''}${wordName(j as WordId).toLowerCase()}` }))}
        value={i}
        onChange={setI}
      />
      <Readouts items={[{ label: t('Cuts found'), value: t('{n} of {m} words', { n: count, m: WORDS.length }), tone: count === WORDS.length ? 'good' : undefined }]} />
      <p className="lab__note">{done[i] ? found(i) : t('Find where English cut each word to free a new ending or a new word.')}</p>
    </div>
  );
}
