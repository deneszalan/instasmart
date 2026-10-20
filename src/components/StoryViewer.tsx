import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ExternalLink, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import type { Slide } from '../types';
import type { Story } from '../lib/stories';
import { frameDuration } from '../lib/stories';
import { FIELD_BY_ID } from '../data/fields';
import { challengeId, pickInteractive } from '../lib/interactive';
import { lockScroll } from '../lib/scrollLock';
import { localDay, useStore } from '../state/store';
import { Avatar } from './Avatar';
import { InteractiveSlide } from './Interactive';
import { cardGradient, gradientStyle } from './Media';
import { inline } from '../lib/markdown';
import { firstVideo } from '../lib/visual';
import { useRoute } from '../lib/route';
import { sound } from '../lib/sound';
import { clipSpeed, SPEEDS } from './Video';
import { t } from '../i18n';
import { formatNumber } from '../lib/format';

type VideoSlide = Extract<Slide, { type: 'video' }>;

/** Stories play clips with sound, like Shorts, unless the reader mutes them. */
const storySound = { on: true };

/**
 * A story frame that plays a post's clip full-screen. The story bar follows the clip, holding
 * pauses it, and the next frame starts when it ends.
 */
function StoryVideo({ slide, paused, muted, rate, fill, onEnded, onForcedMute }: {
  slide: VideoSlide;
  paused: boolean;
  muted: boolean;
  rate: number;
  fill: RefObject<HTMLSpanElement | null>;
  onEnded: () => void;
  onForcedMute: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (paused) {
      v.pause();
      return;
    }
    v.muted = muted || !slide.music;
    v.play().catch(() => {
      // Browsers may refuse sound without a fresh tap; carry on muted.
      v.muted = true;
      onForcedMute();
      v.play().catch(() => {});
    });
  }, [paused, muted, slide.music, onForcedMute]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // The default rate survives the clip loading; the current one might not.
    v.defaultPlaybackRate = rate;
    v.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    let frame = requestAnimationFrame(function tick() {
      const v = video.current;
      if (v?.duration && fill.current) fill.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [fill]);

  return (
    <video
      ref={video}
      className="story__video"
      src={slide.src}
      poster={slide.poster}
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label={slide.alt}
      onEnded={onEnded}
    />
  );
}

interface StoryViewerProps {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
}

/** Full-screen stories: tap right/left to move, hold to pause, finishes one story then moves to the next. */
export function StoryViewer({ stories, startIndex, onClose }: StoryViewerProps) {
  const { state, markStory, markSeen, updateSettings } = useStore();
  const [storyIdx, setStoryIdx] = useState(startIndex);
  const [frame, setFrame] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wasHold = useRef(false);
  const activeFill = useRef<HTMLSpanElement>(null);
  const [muted, setMuted] = useState(!storySound.on);
  const [, navigate] = useRoute();

  const story = stories[storyIdx];
  const card = story.cards[frame];
  const field = FIELD_BY_ID[card.field];
  // In the quiz story each frame is the post's interactive slide, and waits for the reader instead of timing out.
  // Which of the card's interactive slides to show changes with the day, so puzzles get their turn.
  const widget = story.interactive ? pickInteractive(card, localDay()) : -1;
  const timed = widget < 0;
  // Timed frames of posts with a clip play the clip instead of showing the text.
  const videoAt = timed ? firstVideo(card) : -1;
  const clip = videoAt >= 0 ? (card.slides![videoAt] as VideoSlide) : null;
  const rate = clip ? clipSpeed(state.settings.speed, clip) : 1;

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
  // Bars animate by time for text frames; a clip's bar is driven by its playback.
  const animated = timed && !clip;

  const toggleSound = () => {
    storySound.on = muted;
    sound.wanted = muted;
    setMuted(!muted);
  };
  const forcedMute = useCallback(() => setMuted(true), []);
  // One tap moves to the next speed, wrapping round; the reader's choice is shared with posts.
  const nextSpeed = () => updateSettings({ speed: SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length] });

  const openPost = () => {
    onClose();
    navigate({ post: card.id });
  };
  // Buttons on the story must not also flip it.
  const own = { onPointerDown: (e: PointerEvent) => e.stopPropagation(), onPointerUp: (e: PointerEvent) => e.stopPropagation() };

  return createPortal(
    <div className="story-overlay" role="dialog" aria-modal="true" aria-label={t('{label} story', { label: story.label })}>
      <div className="story" style={gradientStyle(cardGradient(card))}>
        <div className="story__bars">
          {story.cards.map((c, i) => (
            <span key={c.id} className="story__bar">
              <span
                key={`${storyIdx}-${frame}`}
                ref={i === frame ? activeFill : undefined}
                className={`story__fill${i < frame || (i === frame && !timed) ? ' story__fill--done' : ''}${i === frame && animated ? ' story__fill--active' : ''}`}
                style={i === frame && animated ? { animationDuration: `${duration}ms`, animationPlayState: isPaused ? 'paused' : 'running' } : undefined}
                onAnimationEnd={i === frame && animated ? next : undefined}
              />
            </span>
          ))}
        </div>

        <div className="story__head">
          <Avatar emoji={story.emoji} gradient={story.gradient} size={32} />
          <span className="story__label">{story.label}</span>
          {(story.id === 'daily' || story.interactive) && <span className="story__sub">{field.name}</span>}
          <span className="story__spacer" />
          {clip?.music && (
            <button className="icon-btn icon-btn--light" onClick={toggleSound} aria-label={muted ? t('Turn sound on') : t('Turn sound off')} aria-pressed={!muted}>
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
          {clip && (
            <button className="story__speed" onClick={nextSpeed} aria-label={t('Playback speed {rate} times, tap to change', { rate: formatNumber(rate) })}>
              {formatNumber(rate)}×
            </button>
          )}
          {timed && (
            <button className="icon-btn icon-btn--light" onClick={() => setPaused((p) => !p)} aria-label={isPaused ? t('Play') : t('Pause')}>
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          )}
          <button className="icon-btn icon-btn--light" onClick={onClose} aria-label={t('Close stories')}>
            <X size={24} />
          </button>
        </div>

        <div
          className={`story__content${timed ? '' : ' story__content--interactive'}${clip ? ' story__content--video' : ''}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => {
            clearTimeout(holdTimer.current);
            setHeld(false);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {!clip && (
            <span className="slide__bg-emoji" aria-hidden="true">
              {card.emoji}
            </span>
          )}
          {clip ? (
            <>
              <StoryVideo
                key={`${storyIdx}-${frame}`}
                slide={clip}
                paused={isPaused}
                muted={muted}
                rate={rate}
                fill={activeFill}
                onEnded={next}
                onForcedMute={forcedMute}
              />
              <p className="story__video-title">{card.title}</p>
            </>
          ) : timed ? (
            <>
              <div className="story__emoji" aria-hidden="true">
                {card.emoji}
              </div>
              <h3 className="story__title">{card.title}</h3>
              <p className="story__body">{inline(card.body)}</p>
            </>
          ) : (
            <>
              <p className="story__from">
                {card.emoji} {card.title}
              </p>
              {/* Taps inside the widget answer the question; they must not flip the story. */}
              <div
                className="story__widget"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              >
                <InteractiveSlide key={`${card.id}-${widget}`} slide={card.slides![widget]} challengeId={challengeId(card, widget + 1)} />
              </div>
              <button
                className="btn btn--light story__next"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={next}
              >
                {frame + 1 < story.cards.length ? t('Next') : t('Done')} <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="story__actions">
          <button className="btn btn--light story__open" {...own} onClick={openPost}>
            {t('Open post')} <ArrowRight size={16} />
          </button>
          <a className="story__source" href={card.source.url} target="_blank" rel="noreferrer">
            {card.source.label} <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
