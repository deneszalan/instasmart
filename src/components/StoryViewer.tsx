import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Pause, Play, X } from 'lucide-react';
import type { Story } from '../lib/stories';
import { frameDuration } from '../lib/stories';
import { FIELD_BY_ID } from '../data/fields';
import { lockScroll } from '../lib/scrollLock';
import { useStore } from '../state/store';
import { Avatar } from './Avatar';
import { cardGradient, gradientStyle } from './Media';
import { inline } from '../lib/markdown';

interface StoryViewerProps {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
}

/** Full-screen stories: tap right/left to move, hold to pause, finishes one story then moves to the next. */
export function StoryViewer({ stories, startIndex, onClose }: StoryViewerProps) {
  const { markStory, markSeen } = useStore();
  const [storyIdx, setStoryIdx] = useState(startIndex);
  const [frame, setFrame] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wasHold = useRef(false);

  const story = stories[storyIdx];
  const card = story.cards[frame];
  const field = FIELD_BY_ID[card.field];

  const next = useCallback(() => {
    if (frame + 1 < story.cards.length) setFrame(frame + 1);
    else if (storyIdx + 1 < stories.length) {
      setStoryIdx(storyIdx + 1);
      setFrame(0);
    } else onClose();
  }, [frame, story, storyIdx, stories.length, onClose]);

  const prev = useCallback(() => {
    if (frame > 0) setFrame(frame - 1);
    else if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1);
      setFrame(stories[storyIdx - 1].cards.length - 1);
    } else setFrame(0);
  }, [frame, storyIdx, stories]);

  useEffect(() => markStory(story.id), [story.id, markStory]);

  useEffect(() => {
    const timer = setTimeout(() => markSeen(card.id), 1500);
    return () => clearTimeout(timer);
  }, [card.id, markSeen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  useEffect(() => lockScroll(), []);

  const onPointerDown = () => {
    wasHold.current = false;
    holdTimer.current = setTimeout(() => {
      wasHold.current = true;
      setHeld(true);
    }, 220);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    clearTimeout(holdTimer.current);
    setHeld(false);
    if (wasHold.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.3) prev();
    else next();
  };

  const isPaused = held || paused;
  const duration = frameDuration(card);

  return createPortal(
    <div className="story-overlay" role="dialog" aria-modal="true" aria-label={`${story.label} story`}>
      <div className="story" style={gradientStyle(cardGradient(card))}>
        <div className="story__bars">
          {story.cards.map((c, i) => (
            <span key={c.id} className="story__bar">
              <span
                key={`${storyIdx}-${frame}`}
                className={`story__fill${i < frame ? ' story__fill--done' : ''}${i === frame ? ' story__fill--active' : ''}`}
                style={i === frame ? { animationDuration: `${duration}ms`, animationPlayState: isPaused ? 'paused' : 'running' } : undefined}
                onAnimationEnd={i === frame ? next : undefined}
              />
            </span>
          ))}
        </div>

        <div className="story__head">
          <Avatar emoji={story.emoji} gradient={story.gradient} size={32} />
          <span className="story__label">{story.label}</span>
          {story.id === 'daily' && <span className="story__sub">{field.name}</span>}
          <span className="story__spacer" />
          <button className="icon-btn icon-btn--light" onClick={() => setPaused((p) => !p)} aria-label={isPaused ? 'Play' : 'Pause'}>
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button className="icon-btn icon-btn--light" onClick={onClose} aria-label="Close stories">
            <X size={24} />
          </button>
        </div>

        <div
          className="story__content"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => {
            clearTimeout(holdTimer.current);
            setHeld(false);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="slide__bg-emoji" aria-hidden="true">
            {card.emoji}
          </span>
          <div className="story__emoji" aria-hidden="true">
            {card.emoji}
          </div>
          <h3 className="story__title">{card.title}</h3>
          <p className="story__body">{inline(card.body)}</p>
        </div>

        <a className="story__source" href={card.source.url} target="_blank" rel="noreferrer">
          {card.source.label} <ExternalLink size={14} />
        </a>
      </div>
    </div>,
    document.body,
  );
}
