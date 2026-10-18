import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, RotateCcw, X } from 'lucide-react';
import type { Slide } from '../types';
import { stableShuffle } from '../lib/interactive';
import { inline } from '../lib/markdown';
import { useRecord } from './useRecord';

type Of<T extends Slide['type']> = Extract<Slide, { type: T }>;

interface Props<T extends Slide['type']> {
  slide: Of<T>;
  /** `${postId}#${slideIndex}`: where the result is recorded. */
  challengeId: string;
}

/** A timeout that is cleared if the slide goes away first. */
function useTimer() {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };
}

/** Two columns; tap one on each side to pair them up. */
export function MatchSlideView({ slide, challengeId }: Props<'match'>) {
  const record = useRecord(challengeId);
  const later = useTimer();
  const rights = useMemo(() => stableShuffle(slide.pairs.length, `${challengeId}:match`), [slide.pairs.length, challengeId]);
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const done = matched.length === slide.pairs.length;

  const pick = (side: 'left' | 'right', i: number) => {
    if (done || wrong || matched.includes(i)) return;
    const l = side === 'left' ? i : left;
    const r = side === 'right' ? i : right;
    if (l === null || r === null) {
      (side === 'left' ? setLeft : setRight)(i);
      return;
    }
    setLeft(null);
    setRight(null);
    if (l === r) {
      const next = [...matched, l];
      setMatched(next);
      if (next.length === slide.pairs.length) record(misses === 0);
    } else {
      setMisses(misses + 1);
      setWrong([l, r]);
      later(() => setWrong(null), 500);
    }
  };

  const reset = () => {
    setMatched([]);
    setMisses(0);
    setLeft(null);
    setRight(null);
  };

  const cls = (i: number, selected: boolean, flagged: boolean) =>
    `choice match__item${matched.includes(i) ? ' choice--right' : flagged ? ' choice--wrong' : selected ? ' choice--picked' : ''}`;

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Match the pairs</p>
      <p className="interactive__question">{inline(slide.heading)}</p>
      <div className={`match${slide.pairs.length >= 5 ? ' match--5' : ''}`}>
        <div className="match__col" role="group" aria-label="Left column">
          {slide.pairs.map((p, i) => (
            <button
              key={i}
              className={cls(i, left === i, wrong?.[0] === i)}
              onClick={() => pick('left', i)}
              disabled={done || matched.includes(i)}
              aria-pressed={left === i}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="match__col" role="group" aria-label="Right column">
          {rights.map((i) => (
            <button
              key={i}
              className={cls(i, right === i, wrong?.[1] === i)}
              onClick={() => pick('right', i)}
              disabled={done || matched.includes(i)}
              aria-pressed={right === i}
            >
              {slide.pairs[i].right}
            </button>
          ))}
        </div>
      </div>
      <p className="interactive__result" role="status" aria-live="polite">
        {done && (
          <>
            <strong>{misses === 0 ? 'Perfect match! ' : misses === 1 ? 'Done, with one slip. ' : `Done, with ${misses} slips. `}</strong>
            {slide.explanation && inline(slide.explanation)}{' '}
            <button className="link-btn link-btn--light" onClick={reset}>
              <RotateCcw size={13} /> Again
            </button>
          </>
        )}
      </p>
    </div>
  );
}

/** One item at a time; tap the bin it belongs in. */
export function SortSlideView({ slide, challengeId }: Props<'sort'>) {
  const record = useRecord(challengeId);
  const later = useTimer();
  const [answers, setAnswers] = useState<number[]>([]);
  const [flash, setFlash] = useState<boolean | null>(null);
  const index = answers.length;
  const done = index === slide.items.length;
  const right = answers.filter((bin, i) => bin === slide.items[i].bin).length;

  const choose = (bin: number) => {
    if (done || flash !== null) return;
    const next = [...answers, bin];
    setFlash(bin === slide.items[index].bin);
    later(() => {
      setFlash(null);
      setAnswers(next);
      if (next.length === slide.items.length) record(next.every((b, i) => b === slide.items[i].bin));
    }, 650);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Sort them</p>
      <p className="interactive__question">{inline(slide.heading)}</p>
      <div className="sort__dots" aria-hidden="true">
        {slide.items.map((item, i) => (
          <span
            key={i}
            className={`sort__dot${
              i < index ? (answers[i] === item.bin ? ' sort__dot--right' : ' sort__dot--wrong') : i === index && !done ? ' sort__dot--now' : ''
            }`}
          />
        ))}
      </div>
      {done ? (
        <ul className="sort__review" aria-label="How you did">
          {slide.items.map((item, i) => {
            const ok = answers[i] === item.bin;
            return (
              <li key={i} className={ok ? 'sort__review--right' : 'sort__review--wrong'}>
                <span aria-hidden="true">{ok ? <Check size={14} /> : <X size={14} />}</span>
                <span>
                  {item.text} <em>{slide.bins[item.bin]}</em>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <div className={`sort__card${flash === null ? '' : flash ? ' sort__card--right' : ' sort__card--wrong'}`} role="status" aria-live="polite">
            {inline(slide.items[index].text)}
          </div>
          <div className="sort__bins" role="group" aria-label="Bins">
            {slide.bins.map((bin, i) => (
              <button key={i} className="choice sort__bin" onClick={() => choose(i)} disabled={flash !== null}>
                {bin}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="interactive__result" role="status" aria-live="polite">
        {done && (
          <>
            <strong>{right === slide.items.length ? 'All sorted! ' : `${right} of ${slide.items.length} right. `}</strong>
            {slide.explanation && inline(slide.explanation)}
          </>
        )}
      </p>
    </div>
  );
}

/** Letter tiles to tap into the right order. */
export function ScrambleSlideView({ slide, challengeId }: Props<'scramble'>) {
  const record = useRecord(challengeId);
  const letters = useMemo(() => slide.answer.toUpperCase().split(''), [slide.answer]);
  const tiles = useMemo(() => {
    // Tiles are positions in the answer, shown in a shuffled order that never spells the answer.
    let out = stableShuffle(letters.length, `${challengeId}:scramble`);
    if (out.map((i) => letters[i]).join('') === letters.join('')) out = [...out.slice(1), out[0]];
    return out;
  }, [letters, challengeId]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [status, setStatus] = useState<'playing' | 'wrong' | 'solved' | 'revealed'>('playing');
  const over = status === 'solved' || status === 'revealed';

  const add = (tile: number) => {
    if (over || placed.includes(tile)) return;
    const next = [...placed, tile];
    setPlaced(next);
    if (next.length < letters.length) {
      setStatus('playing');
    } else if (next.map((i) => letters[i]).join('') === letters.join('')) {
      setStatus('solved');
      record(true);
    } else {
      setStatus('wrong');
    }
  };
  const remove = (pos: number) => {
    if (over || pos >= placed.length) return;
    setPlaced(placed.filter((_, i) => i !== pos));
    setStatus('playing');
  };
  const clear = () => {
    setPlaced([]);
    setStatus('playing');
  };
  const reveal = () => {
    setPlaced(letters.map((_, i) => i));
    setStatus('revealed');
    record(false);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Unscramble</p>
      <p className="interactive__question">{inline(slide.clue)}</p>
      <div
        className={`scramble__word${status === 'wrong' ? ' scramble__word--wrong' : over ? ' scramble__word--solved' : ''}`}
        role="group"
        aria-label={`Your word so far: ${placed.map((i) => letters[i]).join('') || 'nothing'}`}
      >
        {letters.map((_, pos) => (
          <button
            key={pos}
            className="scramble__slot"
            onClick={() => remove(pos)}
            disabled={over || pos >= placed.length}
            aria-label={pos < placed.length ? `Remove ${letters[placed[pos]]}` : 'Empty'}
          >
            {pos < placed.length ? letters[placed[pos]] : ''}
          </button>
        ))}
      </div>
      <div className="scramble__tiles" role="group" aria-label="Letters">
        {tiles.map((tile) => (
          <button key={tile} className="scramble__tile" onClick={() => add(tile)} disabled={over || placed.includes(tile)}>
            {letters[tile]}
          </button>
        ))}
      </div>
      <p className="interactive__result" role="status" aria-live="polite">
        {status === 'playing' && (
          <>
            {placed.length > 0 && (
              <>
                <button className="link-btn link-btn--light" onClick={clear}>
                  <RotateCcw size={13} /> Clear
                </button>
                {' · '}
              </>
            )}
            <button className="link-btn link-btn--light" onClick={reveal}>
              <Eye size={13} /> Show answer
            </button>
          </>
        )}
        {status === 'solved' && (
          <>
            <strong>Solved! </strong>
            {slide.detail && inline(slide.detail)}
          </>
        )}
        {status === 'revealed' && (
          <>
            <strong>It was {letters.join('')}. </strong>
            {slide.detail && inline(slide.detail)}
          </>
        )}
        {status === 'wrong' && (
          <>
            <strong>Not that. </strong>
            <button className="link-btn link-btn--light" onClick={clear}>
              <RotateCcw size={13} /> Clear
            </button>
            {' · '}
            <button className="link-btn link-btn--light" onClick={reveal}>
              <Eye size={13} /> Show answer
            </button>
          </>
        )}
      </p>
    </div>
  );
}

/** Tiles; one doesn't belong. */
export function OddSlideView({ slide, challengeId }: Props<'odd'>) {
  const record = useRecord(challengeId);
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;

  const choose = (i: number) => {
    if (done) return;
    setPicked(i);
    record(i === slide.answer);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Odd one out</p>
      <p className="interactive__question">{inline(slide.heading ?? 'Which one doesn’t belong?')}</p>
      <div className="odd" role="group" aria-label="Options">
        {slide.items.map((item, i) => {
          const state = !done ? '' : i === slide.answer ? ' choice--right' : i === picked ? ' choice--wrong' : ' choice--dim';
          return (
            <button key={i} className={`choice odd__item${state}`} onClick={() => choose(i)} disabled={done} aria-pressed={picked === i}>
              <span>{item}</span>
              {done && i === slide.answer && <Check size={18} aria-label="The odd one out" />}
            </button>
          );
        })}
      </div>
      <p className="interactive__result" role="status" aria-live="polite">
        {done && (
          <>
            <strong>{picked === slide.answer ? 'Right! ' : 'Not that one. '}</strong>
            {inline(slide.explanation)}
          </>
        )}
      </p>
    </div>
  );
}
