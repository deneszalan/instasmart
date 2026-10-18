import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import type { Slide } from '../types';
import { createRng, shuffle } from '../lib/feed';
import { withUnit } from '../lib/format';
import { seed } from '../lib/interactive';
import { inline } from '../lib/markdown';
import { MatchSlideView, OddSlideView, ScrambleSlideView, SortSlideView } from './Puzzles';
import { useRecord } from './useRecord';

type Of<T extends Slide['type']> = Extract<Slide, { type: T }>;

/** Renders whichever interactive slide this is; nothing for other slide types. */
export function InteractiveSlide({ slide, challengeId }: { slide: Slide; challengeId: string }) {
  switch (slide.type) {
    case 'quiz':
      return <QuizSlideView slide={slide} challengeId={challengeId} />;
    case 'reveal':
      return <RevealSlideView slide={slide} challengeId={challengeId} />;
    case 'estimate':
      return <EstimateSlideView slide={slide} challengeId={challengeId} />;
    case 'order':
      return <OrderSlideView slide={slide} challengeId={challengeId} />;
    case 'match':
      return <MatchSlideView slide={slide} challengeId={challengeId} />;
    case 'sort':
      return <SortSlideView slide={slide} challengeId={challengeId} />;
    case 'scramble':
      return <ScrambleSlideView slide={slide} challengeId={challengeId} />;
    case 'odd':
      return <OddSlideView slide={slide} challengeId={challengeId} />;
    default:
      return null;
  }
}

interface Props<T extends Slide['type']> {
  slide: Of<T>;
  /** `${postId}#${slideIndex}`: where the result is recorded. */
  challengeId: string;
}

const LETTERS = ['A', 'B', 'C', 'D'];

/** A question with one right answer. One attempt; the explanation shows afterwards. */
export function QuizSlideView({ slide, challengeId }: Props<'quiz'>) {
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
      <p className="slide__heading">Quick quiz</p>
      <p className="interactive__question">{inline(slide.question)}</p>
      <div className="choices" role="group" aria-label="Answers">
        {slide.options.map((option, i) => {
          const state = !done ? '' : i === slide.answer ? ' choice--right' : i === picked ? ' choice--wrong' : ' choice--dim';
          return (
            <button key={i} className={`choice${state}`} onClick={() => choose(i)} disabled={done} aria-pressed={picked === i}>
              <span className="choice__badge" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span>{option}</span>
              {done && i === slide.answer && <Check size={20} aria-label="Correct answer" />}
              {done && i === picked && i !== slide.answer && <X size={20} aria-label="Your answer" />}
            </button>
          );
        })}
      </div>
      <p className="interactive__result" role="status" aria-live="polite">
        {done && (
          <>
            <strong>{picked === slide.answer ? 'Right! ' : 'Not quite. '}</strong>
            {inline(slide.explanation)}
          </>
        )}
      </p>
    </div>
  );
}

/** A teaser the reader flips over. */
export function RevealSlideView({ slide, challengeId }: Props<'reveal'>) {
  const record = useRecord(challengeId);
  const [open, setOpen] = useState(false);

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Think first</p>
      <p className="interactive__question">{inline(slide.prompt)}</p>
      {open ? (
        <div className="reveal reveal--open" role="status" aria-live="polite">
          <p className="reveal__answer">{inline(slide.answer)}</p>
          {slide.detail && <p className="reveal__detail">{inline(slide.detail)}</p>}
        </div>
      ) : (
        <button
          className="reveal"
          onClick={() => {
            setOpen(true);
            record(null);
          }}
        >
          <span className="reveal__tap">Tap to reveal</span>
        </button>
      )}
    </div>
  );
}

/** Guess a number with a slider, then see the real value and how close you were. */
export function EstimateSlideView({ slide, challengeId }: Props<'estimate'>) {
  const record = useRecord(challengeId);
  const span = slide.max - slide.min;
  const step = slide.step ?? span / 100;
  const [value, setValue] = useState(slide.min + span / 2);
  const [locked, setLocked] = useState(false);

  // How far off, as a share of the slider's range.
  const off = Math.abs(value - slide.answer) / span;
  const verdict = off <= 0.02 ? 'Spot on!' : off <= 0.1 ? 'Close!' : off <= 0.25 ? 'Not far off.' : 'Way off, but now you know.';
  const width = (n: number) => `${((n - slide.min) / span) * 100}%`;

  const lock = () => {
    setLocked(true);
    record(off <= 0.1);
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Take a guess</p>
      <p className="interactive__question">{inline(slide.question)}</p>
      {locked ? (
        <div role="status" aria-live="polite">
          <div className="estimate__bars">
            <div className="estimate__row">
              <span>You</span>
              <span className="estimate__bar">
                <span style={{ width: width(value) }} />
              </span>
              <strong>{withUnit(value, slide.unit, slide.format)}</strong>
            </div>
            <div className="estimate__row estimate__row--answer">
              <span>Real</span>
              <span className="estimate__bar">
                <span style={{ width: width(slide.answer) }} />
              </span>
              <strong>{withUnit(slide.answer, slide.unit, slide.format)}</strong>
            </div>
          </div>
          <p className="interactive__result">
            <strong>{verdict} </strong>
            {inline(slide.explanation)}
          </p>
        </div>
      ) : (
        <>
          <p className="estimate__value" aria-live="polite">
            {withUnit(value, slide.unit, slide.format)}
          </p>
          <input
            type="range"
            className="estimate__slider"
            min={slide.min}
            max={slide.max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={slide.question}
            aria-valuetext={withUnit(value, slide.unit, slide.format)}
          />
          <div className="estimate__ends" aria-hidden="true">
            <span>{withUnit(slide.min, slide.unit, slide.format)}</span>
            <span>{withUnit(slide.max, slide.unit, slide.format)}</span>
          </div>
          <button className="btn btn--light" onClick={lock}>
            Lock in my guess
          </button>
        </>
      )}
    </div>
  );
}

/** Shuffled items the reader taps into the right order. */
export function OrderSlideView({ slide, challengeId }: Props<'order'>) {
  const record = useRecord(challengeId);
  // A stable shuffle per post, never showing the items already in the right order.
  const shuffled = useMemo(() => {
    const out = shuffle(
      slide.items.map((_, i) => i),
      createRng(seed(challengeId)),
    );
    if (out.every((v, i) => v === i)) out.push(out.shift()!);
    return out;
  }, [slide.items, challengeId]);
  // Original indices, in the order they were tapped.
  const [picks, setPicks] = useState<number[]>([]);
  const done = picks.length === slide.items.length;
  const allRight = done && picks.every((v, i) => v === i);

  const tap = (original: number) => {
    if (done || picks.includes(original)) return;
    const next = [...picks, original];
    setPicks(next);
    if (next.length === slide.items.length) record(next.every((v, i) => v === i));
  };

  return (
    <div className="slide__center interactive" data-interactive>
      <p className="slide__heading">Tap in order</p>
      <p className="interactive__question">{inline(slide.heading)}</p>
      <ol className="choices" aria-label="Items to order">
        {shuffled.map((original) => {
          const pos = picks.indexOf(original);
          const state = !done ? (pos >= 0 ? ' choice--picked' : '') : pos === original ? ' choice--right' : ' choice--wrong';
          return (
            <li key={original}>
              <button className={`choice${state}`} onClick={() => tap(original)} disabled={done || pos >= 0} aria-pressed={pos >= 0}>
                <span className="choice__badge" aria-hidden="true">
                  {pos >= 0 ? pos + 1 : ''}
                </span>
                <span>{slide.items[original]}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="interactive__result" role="status" aria-live="polite">
        {done && (
          <>
            <strong>{allRight ? 'Perfect order! ' : 'Not quite. '}</strong>
            {!allRight && <>The order is {slide.items.join(' → ')}. </>}
            {slide.explanation && inline(slide.explanation)}{' '}
            <button className="link-btn link-btn--light" onClick={() => setPicks([])}>
              <RotateCcw size={13} /> Try again
            </button>
          </>
        )}
      </p>
    </div>
  );
}
