import { useRef, useState } from 'react';
import { Btn, C, label, Readouts, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';

/** Hrozný's line of 1915: nu NINDA-an ezzatteni watar-ma ekutteni. NINDA, the Sumerian word sign for bread, was known. */
export const LINE = ['nu', 'NINDA-an', 'ezzatteni', 'watar-ma', 'ekutteni'] as const;

/** The three unknown words, with what Hrozný compared them to; `meaning` is an index into MEANINGS. */
export const WORDS = [
  { word: 'ezzatteni', meaning: 0 },
  { word: 'watar', meaning: 1 },
  { word: 'ekutteni', meaning: 2 },
] as const;
/** Meanings in the order they are offered: not the order of the words. */
export const OFFER = [1, 2, 0] as const;

/** Is this pairing Hrozný's reading? */
export const fits = (word: number, meaning: number) => WORDS[word].meaning === meaning;

/** The sentence's reading so far, with unread words left as they are. */
export function reading(matched: boolean[]) {
  return { eat: matched[0], water: matched[1], drink: matched[2], done: matched.every(Boolean) };
}

const GOLD = '#f2c15a', TEAL = '#7fd6cf', ROSE = '#f29cab', CLAY = '#c99668';

export default function HittiteDecipher({ onDone }: LabProps) {
  const [matched, setMatched] = useState([false, false, false]);
  const [picked, setPicked] = useState<number | null>(null);
  const [miss, setMiss] = useState<number | null>(null);
  const r = reading(matched);
  useGoal(r.done, onDone);
  const size = useRef({ w: 0, h: 0 });

  const meaningText = (m: number) => (m === 0 ? t('“you (will) eat”') : m === 1 ? t('“water”') : t('“you (will) drink”'));
  const clue = (i: number) =>
    i === 0 ? t('ezza- looks like Latin edo, German essen, English eat, and it sits next to bread.') : i === 1 ? t('watar looks like English water and German Wasser.') : t('Its stem eku- reminded Hrozný of Latin aqua, water.');

  const boxes = (w: number, h: number) => {
    const top = h * 0.36, rh = Math.min(40, (h - top - 6) / 3);
    return {
      words: WORDS.map((_, i) => ({ x: 8, y: top + i * rh, w: w * 0.4, h: rh - 6 })),
      meanings: OFFER.map((_, i) => ({ x: w * 0.48, y: top + i * rh, w: w * 0.52 - 8, h: rh - 6 })),
    };
  };

  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'down') return;
    const b = boxes(size.current.w, size.current.h);
    const inside = (q: { x: number; y: number; w: number; h: number }) => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h;
    const wi = b.words.findIndex(inside);
    if (wi >= 0 && !matched[wi]) {
      setPicked(wi);
      setMiss(null);
      return;
    }
    const mi = b.meanings.findIndex(inside);
    if (mi >= 0 && picked !== null) {
      if (fits(picked, OFFER[mi])) {
        setMatched(matched.map((m, i) => m || i === picked));
        setPicked(null);
        setMiss(null);
      } else setMiss(OFFER[mi]);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, s: { w: number; h: number }) => {
    size.current = s;
    // the line on a strip of clay, with what is read so far
    ctx.fillStyle = CLAY;
    ctx.beginPath();
    ctx.roundRect(6, 4, s.w - 12, s.h * 0.3 - 6, 8);
    ctx.fill();
    const cols = [GOLD, GOLD, matched[0] ? TEAL : '#5b3a22', matched[1] ? TEAL : '#5b3a22', matched[2] ? TEAL : '#5b3a22'];
    const xs = [0.05, 0.2, 0.43, 0.64, 0.85].map((f) => f * s.w);
    LINE.forEach((wd, i) => label(ctx, wd, xs[i], s.h * 0.09, { size: 12.5, color: i < 2 ? '#3a2412' : cols[i] === TEAL ? '#123c39' : '#3a2412', weight: i === 1 ? 800 : 600 }));
    const glosses = ['', t('“bread”'), r.eat ? meaningText(0) : '?', r.water ? meaningText(1) : '?', r.drink ? meaningText(2) : '?'];
    glosses.forEach((g, i) => g && label(ctx, g, xs[i], s.h * 0.2, { size: 10, color: g === '?' ? '#5b3a22' : '#1d1209', weight: 700 }));
    const b = boxes(s.w, s.h);
    b.words.forEach((q, i) => {
      ctx.fillStyle = matched[i] ? 'rgba(127,214,207,0.25)' : picked === i ? 'rgba(242,193,90,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(q.x, q.y, q.w, q.h, 6);
      ctx.fill();
      label(ctx, WORDS[i].word, q.x + q.w / 2, q.y + q.h / 2, { size: 14, color: matched[i] ? TEAL : C.ink, weight: 700 });
    });
    b.meanings.forEach((q, i) => {
      const m = OFFER[i], used = matched[WORDS.findIndex((w) => w.meaning === m)];
      ctx.fillStyle = used ? 'rgba(127,214,207,0.25)' : miss === m ? 'rgba(242,156,171,0.35)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(q.x, q.y, q.w, q.h, 6);
      ctx.fill();
      label(ctx, meaningText(m), q.x + q.w / 2, q.y + q.h / 2, { size: 12, color: used ? TEAL : miss === m ? ROSE : C.ink, weight: 600 });
    });
  };

  const note = picked !== null ? clue(picked) : r.done ? t('“You (will) eat bread; you (will) drink water.” Hittite is an Indo-European language.') : t('Tap one of the unknown words, then the meaning the clues point to.');

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Hrozný’s line of Hittite with {n} of 3 unknown words read', { n: matched.filter(Boolean).length })} />
      <p className="lab__note">{note}</p>
      <div className="lab__row">
        <Readouts items={[{ label: t('Words read'), value: `${matched.filter(Boolean).length} / 3`, tone: r.done ? 'good' : undefined }]} />
        <Btn
          ghost
          onClick={() => {
            setMatched([false, false, false]);
            setPicked(null);
            setMiss(null);
          }}
        >
          {t('Start again')}
        </Btn>
      </div>
      <p className="lab__note">{t('Simplified: Bedřich Hrozný’s reading of 1915, word by word; NINDA, the Sumerian sign for bread, was already known.')}</p>
    </div>
  );
}
