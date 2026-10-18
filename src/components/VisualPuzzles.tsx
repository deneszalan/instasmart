import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import type { Slide } from '../types';
import { guessFormat, withUnit } from '../lib/format';
import { stableShuffle } from '../lib/interactive';
import { inline } from '../lib/markdown';
import { useRecord } from './useRecord';
import { ChartRows, PictogramGrid } from './Visual';

type Of<T extends Slide['type']> = Extract<Slide, { type: T }>;

interface Props<T extends Slide['type']> {
  slide: Of<T>;
  /** `${postId}#${slideIndex}`: where the result is recorded. */
  challengeId: string;
}

const Tag = ({ ok, children }: { ok: boolean; children?: string }) => (
  <span className={`chart__tag chart__tag--${ok ? 'right' : 'wrong'}`}>{ok ? <Check size={11} /> : children ?? <X size={11} />}</span>
);

/** Tap the items from largest to smallest; the bars then show the truth. */
export function RankSlideView({ slide, challengeId }: Props<'rank'>) {
  const record = useRecord(challengeId);
  const shuffled = useMemo(() => stableShuffle(slide.items.length, `${challengeId}:rank`), [slide.items.length, challengeId]);
  // Original indices, largest value first.
  const truth = useMemo(() => slide.items.map((_, i) => i).sort((a, b) => slide.items[b].value - slide.items[a].value), [slide.items]);
  const [picks, setPicks] = useState<number[]>([]);
  const done = picks.length === slide.items.length;
  const right = picks.filter((p, pos) => truth[pos] === p).length;

  const tap = (i: number) => {
    if (done || picks.includes(i)) return;
    const next = [...picks, i];
    setPicks(next);
    if (next.length === slide.items.length) record(next.every((p, pos) => truth[pos] === p));
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Rank them</p>
      <p className="interactive__question">{inline(slide.heading)}</p>
      {done ? (
        <ChartRows
          unit={slide.unit}
          label="The real order"
          rows={truth.map((i, pos) => {
            const yours = picks.indexOf(i);
            const ok = yours === pos;
            return { ...slide.items[i], state: ok ? 'right' : 'wrong', tag: <Tag ok={ok}>{`you: ${yours + 1}`}</Tag> };
          })}
        />
      ) : (
        <>
          <p className="rank__hint">Tap them from largest to smallest</p>
          <ol className="choices" aria-label="Items to rank">
            {shuffled.map((i) => {
              const pos = picks.indexOf(i);
              return (
                <li key={i}>
                  <button className={`choice${pos >= 0 ? ' choice--picked' : ''}`} onClick={() => tap(i)} disabled={pos >= 0} aria-pressed={pos >= 0}>
                    <span className="choice__badge" aria-hidden="true">
                      {pos >= 0 ? pos + 1 : ''}
                    </span>
                    <span>{slide.items[i].label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      )}
      {done && slide.note && <p className="visual__note">{inline(slide.note)}</p>}
      <p className="interactive__result" role="status" aria-live="polite">
        {done ? (
          <>
            <strong>{right === slide.items.length ? 'Perfect order! ' : `${right} of ${slide.items.length} in the right place. `}</strong>
            {slide.explanation && inline(slide.explanation)}{' '}
            <button className="link-btn link-btn--light" onClick={() => setPicks([])}>
              <RotateCcw size={13} /> Try again
            </button>
          </>
        ) : (
          picks.length > 0 && (
            <button className="link-btn link-btn--light" onClick={() => setPicks([])}>
              <RotateCcw size={13} /> Reset
            </button>
          )
        )}
      </p>
    </div>
  );
}

/** The first bar is shown; guess whether each next one is higher or lower. */
export function HigherSlideView({ slide, challengeId }: Props<'higher'>) {
  const record = useRecord(challengeId);
  const [guesses, setGuesses] = useState<boolean[]>([]);
  const isHigher = (i: number) => slide.items[i].value > slide.items[i - 1].value;
  const revealed = guesses.length + 1;
  const done = revealed === slide.items.length;
  const right = guesses.filter((g, i) => g === isHigher(i + 1)).length;

  const guess = (higher: boolean) => {
    if (done) return;
    const next = [...guesses, higher];
    setGuesses(next);
    if (next.length === slide.items.length - 1) record(next.every((g, i) => g === isHigher(i + 1)));
  };

  const rows = slide.items.slice(0, Math.min(slide.items.length, revealed + 1)).map((d, i) => {
    if (i === 0) return d;
    if (i >= revealed) return { ...d, hidden: true };
    const ok = guesses[i - 1] === isHigher(i);
    return { ...d, state: ok ? ('right' as const) : ('wrong' as const), tag: <Tag ok={ok} /> };
  });

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Higher or lower?</p>
      <p className="interactive__question">{inline(slide.heading)}</p>
      <ChartRows rows={rows} unit={slide.unit} label="Bars so far" />
      {done ? (
        <>
          {slide.note && <p className="visual__note">{inline(slide.note)}</p>}
          <p className="interactive__result" role="status" aria-live="polite">
            <strong>{right === guesses.length ? 'All right! ' : `${right} of ${guesses.length} right. `}</strong>
            {slide.explanation && inline(slide.explanation)}
          </p>
        </>
      ) : (
        <>
          <p className="higher__ask">
            {slide.items[revealed].label}: higher or lower than {slide.items[revealed - 1].label}?
          </p>
          <div className="higher__btns" role="group" aria-label="Your guess">
            <button className="choice higher__btn" onClick={() => guess(true)}>
              Higher ↑
            </button>
            <button className="choice higher__btn" onClick={() => guess(false)}>
              Lower ↓
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Light up as many icons as you think count, then see the real share. */
export function FillSlideView({ slide, challengeId }: Props<'fill'>) {
  const record = useRecord(challengeId);
  const [count, setCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const off = Math.abs(count - slide.answer);
  const tolerance = Math.max(1, Math.round(slide.total * 0.1));
  const verdict = off === 0 ? 'Spot on!' : off <= tolerance ? 'Close!' : 'Not quite.';
  const share = (n: number) => `${(n / slide.total) * 100}%`;

  const lock = () => {
    setLocked(true);
    record(off <= tolerance);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Fill it in</p>
      <p className="interactive__question">{inline(slide.question)}</p>
      <PictogramGrid
        icon={slide.icon}
        total={slide.total}
        count={locked ? slide.answer : count}
        label={locked ? `Really ${slide.answer} of ${slide.total}` : `Your guess: ${count} of ${slide.total}`}
        onTap={locked ? undefined : (i) => setCount(i + 1 === count ? i : i + 1)}
        revealed={locked}
      />
      {locked ? (
        <div role="status" aria-live="polite">
          <div className="estimate__bars fill__bars">
            <div className="estimate__row">
              <span>You</span>
              <span className="estimate__bar">
                <span style={{ width: share(count) }} />
              </span>
              <strong>{count}</strong>
            </div>
            <div className="estimate__row estimate__row--answer">
              <span>Real</span>
              <span className="estimate__bar">
                <span style={{ width: share(slide.answer) }} />
              </span>
              <strong>{slide.answer}</strong>
            </div>
          </div>
          <p className="interactive__result">
            <strong>{verdict} </strong>
            {inline(slide.explanation)}
          </p>
        </div>
      ) : (
        <>
          <p className="fill__count" aria-live="polite">
            <strong>{count}</strong> of {slide.total}
            {count === 0 && <span className="fill__nudge"> · tap the icons</span>}
          </p>
          <button className="btn btn--light" onClick={lock}>
            Lock in my guess
          </button>
        </>
      )}
    </div>
  );
}

/** Slide a marker along a spectrum, with known points as clues. */
export function PlaceSlideView({ slide, challengeId }: Props<'place'>) {
  const record = useRecord(challengeId);
  const span = slide.max - slide.min;
  const step = slide.step ?? span / 100;
  const [value, setValue] = useState(slide.min + Math.round(span / 2 / step) * step);
  const [locked, setLocked] = useState(false);
  const pct = (v: number) => ((v - slide.min) / span) * 100;
  const off = Math.abs(value - slide.answer) / span;
  const verdict = off <= 0.02 ? 'Spot on!' : off <= 0.1 ? 'Close!' : off <= 0.25 ? 'Not far off.' : 'Way off, but now you know.';
  const [low, high] = slide.colors ?? ['#38bdf8', '#fbbf24'];
  const format = slide.format ?? guessFormat(slide.unit, [slide.min, slide.max, slide.answer, ...(slide.hints ?? []).map((h) => h.value)]);
  const show = (v: number) => withUnit(v, slide.unit, format);

  const lock = () => {
    setLocked(true);
    record(off <= 0.1);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Place it</p>
      <p className="interactive__question">{inline(slide.question)}</p>
      <div className="place">
        {slide.hints && (
          <div className="place__hints" aria-hidden="true">
            {slide.hints.map((h, i) => (
              <span key={i} className={`place__hint place__hint--${i % 2}`} style={{ left: `${Math.min(92, Math.max(8, pct(h.value)))}%` }}>
                {h.label}
                <small>{show(h.value)}</small>
              </span>
            ))}
          </div>
        )}
        <div className="place__bar" style={{ background: `linear-gradient(90deg, ${low}, ${high})` }}>
          {slide.hints?.map((h, i) => <i key={i} className="place__tick" style={{ left: `${pct(h.value)}%` }} />)}
          <i className="place__pin place__pin--you" style={{ left: `${pct(value)}%` }} />
          {locked && <i className="place__pin place__pin--real" style={{ left: `${pct(slide.answer)}%` }} />}
        </div>
        {!locked && (
          <input
            type="range"
            className="estimate__slider place__slider"
            min={slide.min}
            max={slide.max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={slide.question}
            aria-valuetext={show(value)}
          />
        )}
        <div className="estimate__ends" aria-hidden="true">
          <span>{slide.ends?.[0] ?? show(slide.min)}</span>
          <span>{slide.ends?.[1] ?? show(slide.max)}</span>
        </div>
      </div>
      {locked ? (
        <div role="status" aria-live="polite">
          <p className="place__legend">
            <span>
              <i className="place__key place__key--you" /> You: {show(value)}
            </span>
            <span>
              <i className="place__key place__key--real" /> Real: {show(slide.answer)}
            </span>
          </p>
          <p className="interactive__result">
            <strong>{verdict} </strong>
            {inline(slide.explanation)}
          </p>
        </div>
      ) : (
        <>
          <p className="estimate__value place__value" aria-live="polite">
            {show(value)}
          </p>
          <button className="btn btn--light" onClick={lock}>
            Lock in my guess
          </button>
        </>
      )}
    </div>
  );
}
