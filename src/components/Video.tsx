import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import { inline } from '../lib/markdown';
import { cardGradient, gradientStyle } from './Media';
import { sound } from '../lib/sound';
import { useStore } from '../state/store';
import { stepStill } from '../../shared/video.ts';
import { clipSeconds } from '../data/library';
import { t } from '../i18n';
import { formatNumber } from '../lib/format';

type VideoSlide = Extract<Slide, { type: 'video' }>;

/** Speeds the reader can pick. */
export const SPEEDS = [0.75, 0.9, 1, 1.25, 1.5, 2];

/** Animations carry captions to read, so unless the reader picks a speed they play a little slower. */
export const ANIMATION_SPEED = 0.9;

/** The speed a clip plays at: the one the reader picked, or the clip's own default. */
export const clipSpeed = (picked: number | null, slide: { animation?: boolean }) => picked ?? (slide.animation ? ANIMATION_SPEED : 1);

/** Taps this close to the left or right edge (as a share of the width) step back or forward. */
const EDGE = 0.25;

function autoplayAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduced && !saveData;
}

/** True while at least `threshold` of the element is on screen (scroll containers clip it, so off-screen slides don't count). */
function useOnScreen(ref: React.RefObject<HTMLElement | null>, threshold: number): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting && entry.intersectionRatio >= threshold), {
      threshold: [0, threshold, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return onScreen;
}

/** 75 → "1:15" */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * A clip. Footage loops, playing muted while the slide is on screen and pausing when it isn't; readers
 * who prefer reduced motion or save data tap to play. An animation is a short lesson with a beginning,
 * so it waits for a tap (which can bring its music too) and stops at the end. Nothing is downloaded
 * until a clip plays. `start`, when given, is set to a function that starts the clip from elsewhere
 * (the title slide's Watch button); call it within the tap, so the clip may play with sound.
 */
export function VideoSlideView({ slide, card, start }: { slide: VideoSlide; card: KnowledgeCard; start?: RefObject<(() => void) | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const onScreen = useOnScreen(box, 0.6);
  const animation = !!slide.animation;
  const [autoplay] = useState(() => !animation && autoplayAllowed());
  // The reader's own choice wins over autoplay: null until they tap.
  const [wantPlay, setWantPlay] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  // The big play button is only for a clip nobody has played or moved yet; after that, pausing leaves the picture clear.
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  // Where the reader left an animation part-way; when they come back it offers to resume or start over.
  const [leftAt, setLeftAt] = useState<number | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const seek = useRef<HTMLInputElement>(null);
  const elapsed = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const hasSound = !!slide.music;
  const wantsSound = () => hasSound && (animation ? sound.wanted !== false : sound.wanted === true);
  const { state, updateSettings } = useStore();
  const rate = clipSpeed(state.settings.speed, slide);
  const steps = slide.steps ?? [];
  const stepMode = state.settings.stepMode && steps.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  // Stopped at the end of a step: the picture stays clear and the play button lights up.
  const [stoppedAtStep, setStoppedAtStep] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const speedButton = useRef<HTMLButtonElement>(null);
  // A seek asked for while the clip is still finding the last one; it waits its turn.
  const pending = useRef<number | null>(null);
  // The arrow that flashes on the side tapped; n restarts its animation.
  const [flash, setFlash] = useState<{ back: boolean; n: number } | null>(null);
  // Read inside the frame loop, which is set up once.
  const live = useRef({ steps, stepMode, lastTime: 0 });
  live.current.steps = steps;
  live.current.stepMode = stepMode;

  const stepPaused = stoppedAtStep && stepMode && !playing;
  const shouldPlay = onScreen && (wantPlay ?? autoplay);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!shouldPlay) {
      v.pause();
      return;
    }
    v.muted = !wantsSound();
    setMuted(v.muted);
    v.play().catch(() => {
      // Browsers may refuse sound without a fresh tap; fall back to a muted start.
      v.muted = true;
      setMuted(true);
      v.play().catch(() => setPlaying(false));
    });
  }, [shouldPlay, hasSound]);

  // An animation left part-way doesn't play on when it comes back: the reader chooses.
  const seen = useRef(false);
  useEffect(() => {
    const v = video.current;
    if (onScreen) {
      seen.current = true;
      return;
    }
    if (!animation || !v || !seen.current) return;
    setWantPlay(null);
    if (v.ended) return;
    if (v.currentTime < 1) {
      // Barely begun: next time it is new again.
      v.currentTime = 0;
      setStarted(false);
    } else {
      setLeftAt(v.currentTime);
    }
  }, [onScreen, animation]);

  // Pause when the tab is hidden, resume when it comes back.
  useEffect(() => {
    const onVisibility = () => {
      const v = video.current;
      if (!v) return;
      if (document.hidden) v.pause();
      else if (shouldPlay) v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [shouldPlay]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.defaultPlaybackRate = rate;
    v.playbackRate = rate;
  }, [rate]);

  // Close the speed menu on a tap anywhere else.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !speedButton.current?.contains(target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  /** Put the progress bar and clock at `time`, straight in the DOM. */
  const show = useCallback((time: number) => {
    const v = video.current;
    const bar = seek.current;
    if (!v || !bar || !v.duration) return;
    if (!dragging.current) bar.value = String(time);
    bar.style.setProperty('--p', `${((time / v.duration) * 100).toFixed(2)}%`);
    bar.setAttribute('aria-valuetext', `${clock(time)} of ${clock(v.duration)}`);
    if (elapsed.current) elapsed.current.textContent = clock(time);
  }, []);

  // Runs every frame while playing. In step mode, it also stops once a step's caption has been on screen to its end.
  const paint = useCallback(() => {
    const v = video.current;
    if (!v || !v.duration) return;
    const now = live.current;
    if (now.stepMode && !v.paused) {
      for (const step of now.steps) {
        const stop = stepStill(step);
        // A big jump means the reader seeked past it, which shouldn't count.
        if (now.lastTime < stop && v.currentTime >= stop && v.currentTime - now.lastTime < 1) {
          // Paused where it is, a frame past the stop, so playing on doesn't stop here again.
          v.pause();
          // Counts as the reader's pause, so coming back to the tab or the slide doesn't play on.
          setWantPlay(false);
          setStoppedAtStep(true);
          break;
        }
      }
    }
    now.lastTime = v.currentTime;
    show(pending.current ?? v.currentTime);
  }, [show]);

  useEffect(() => {
    paint();
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      paint();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, paint]);

  // A new seek would cancel one still in progress, so while dragging the picture would only catch up
  // at the end. Instead the newest position waits until the current frame is shown.
  const jump = (time: number) => {
    const v = video.current;
    if (!v) return;
    live.current.lastTime = time;
    setStoppedAtStep(false);
    setStarted(true);
    setEnded(false);
    setLeftAt(null);
    // A clip that hasn't loaded yet (it loads when it first plays) starts loading to show this frame.
    if (v.readyState === 0) v.preload = 'auto';
    if (v.seeking) pending.current = time;
    else v.currentTime = time;
    show(time);
  };

  const onSeeked = () => {
    const v = video.current;
    if (v && pending.current !== null) {
      v.currentTime = pending.current;
      pending.current = null;
      return;
    }
    paint();
  };

  const pause = () => {
    setWantPlay(false);
    video.current?.pause();
  };

  // Browsing with the seek bar pauses the clip, so it shows the picture there instead of playing on.
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    pause();
    jump(Number(e.target.value));
  };

  // Playing again after a step stop doesn't change wantPlay, so start the clip directly too. Called
  // within the reader's tap, so the browser lets it play with sound.
  const resume = () => {
    setWantPlay(true);
    const v = video.current;
    if (!v) return;
    v.muted = !wantsSound();
    setMuted(v.muted);
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  };

  /** Play from `from`, or from where the clip is. */
  const playFrom = (from?: number) => {
    if (from !== undefined) jump(from);
    setLeftAt(null);
    setEnded(false);
    resume();
  };

  // The title slide's Watch button: from the start, unless the reader left it part-way (then it asks).
  useEffect(() => {
    if (!start) return;
    start.current = () => {
      if (leftAt === null) playFrom(ended ? 0 : undefined);
    };
  });
  useEffect(
    () => () => {
      if (start) start.current = null;
    },
    [start],
  );
  const togglePlay = () => (playing ? pause() : resume());

  /** Index of the step under the playhead, or -1 before the first. */
  const stepAt = (time: number) => steps.reduce((at, step, i) => (step.start <= time + 0.05 ? i : at), -1);

  // Playing, these go to a step's start and play on. Paused, they stay paused and show a step finished
  // (its still), because a step's caption only appears as it plays.
  const prevStep = () => {
    const v = video.current;
    if (!v) return;
    const time = pending.current ?? v.currentTime;
    if (v.paused) {
      const before = steps.filter((step) => stepStill(step) < time - 0.05).at(-1);
      jump(before ? stepStill(before) : 0);
      return;
    }
    const i = stepAt(time);
    // Back to the start of this step, or to the one before when already near its start.
    if (i >= 0 && time - steps[i].start > 1.2) jump(steps[i].start);
    else jump(i > 0 ? steps[i - 1].start : 0);
  };

  const nextStep = () => {
    const v = video.current;
    if (!v) return;
    const time = pending.current ?? v.currentTime;
    const end = Number.isFinite(v.duration) ? v.duration : 0;
    if (v.paused) {
      const after = steps.find((step) => stepStill(step) > time + 0.05);
      if (after) jump(stepStill(after));
      else if (end) jump(end - 0.05);
      return;
    }
    const next = steps[stepAt(time) + 1];
    jump(next ? next.start : Math.max(0, end - 0.1));
  };

  // Taps near the edges flip through the steps, like a story; elsewhere they play or pause.
  const onTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (steps.length && (x < EDGE || x > 1 - EDGE)) {
      const back = x < EDGE;
      if (back) prevStep();
      else nextStep();
      setFlash((f) => ({ back, n: (f?.n ?? 0) + 1 }));
      return;
    }
    togglePlay();
  };

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    sound.wanted = !v.muted;
    setMuted(v.muted);
    if (v.paused) setWantPlay(true);
  };

  const fit = slide.fit ?? 'contain';
  const length = duration || clipSeconds(slide.src);
  return (
    <div ref={box} className={`slide slide--video slide--fit-${fit}`} style={gradientStyle(cardGradient(card))} data-interactive>
      <video
        ref={video}
        className="slide-video"
        src={slide.src}
        poster={slide.poster}
        muted
        loop={!stepMode && !animation}
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label={slide.alt}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setStoppedAtStep(false);
          setEnded(false);
          setLeftAt(null);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setEnded(true)}
        onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onLoadedMetadata={(e) => {
          e.currentTarget.defaultPlaybackRate = rate;
          e.currentTarget.playbackRate = rate;
        }}
        onSeeked={onSeeked}
        onClick={onTap}
      />
      {!playing && !started && !animation && (
        <button className="video__play" onClick={resume} aria-label={t('Play clip')}>
          <Play size={30} fill="currentColor" />
        </button>
      )}
      {!playing && !started && animation && (
        <button className="video__play video__play--pill" onClick={() => playFrom()} aria-label={`${t('Watch the animation')}${length ? `, ${clock(length)}` : ''}`}>
          <Play size={20} fill="currentColor" /> {t('Watch')}
          {length ? ` · ${clock(length)}` : ''}
        </button>
      )}
      {!playing && ended && animation && (
        <button className="video__play video__play--pill" onClick={() => playFrom(0)}>
          <RotateCcw size={20} /> {t('Watch again')}
        </button>
      )}
      {!playing && leftAt !== null && animation && (
        <div className="video__choices">
          <button className="video__play video__play--pill" onClick={() => playFrom()} aria-label={t('Resume from {time}', { time: clock(leftAt) })}>
            <Play size={20} fill="currentColor" /> {t('Resume {time}', { time: clock(leftAt) })}
          </button>
          <button className="video__choice" onClick={() => playFrom(0)}>
            <RotateCcw size={16} /> {t('Start over')}
          </button>
        </div>
      )}
      {flash && (
        <span key={flash.n} className={`video__flash video__flash--${flash.back ? 'back' : 'next'}`} onAnimationEnd={() => setFlash(null)} aria-hidden="true">
          {flash.back ? <SkipBack size={22} fill="currentColor" /> : <SkipForward size={22} fill="currentColor" />}
        </span>
      )}
      <div className="slide-image__text video__info">
        {slide.caption && <p className="slide-image__caption">{inline(slide.caption)}</p>}
        <div className="video__bar">
          <button className={`video__btn${stepPaused ? ' video__btn--ready' : ''}`} onClick={togglePlay} aria-label={playing ? t('Pause') : t('Play')}>
            {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          {hasSound && (
            <button className="video__sound" onClick={toggleSound} aria-label={muted ? t('Turn sound on') : t('Turn sound off')} aria-pressed={!muted}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          {steps.length > 0 && (
            <button className="video__btn" onClick={prevStep} aria-label={t('Previous step')}>
              <SkipBack size={14} fill="currentColor" />
            </button>
          )}
          <span className="video__time" ref={elapsed}>
            0:00
          </span>
          <div className="video__track">
            <input
              ref={seek}
              type="range"
              className="video__seek"
              min={0}
              max={duration || 1}
              step="any"
              defaultValue={0}
              disabled={!duration}
              onChange={onSeek}
              onPointerDown={() => (dragging.current = true)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
              aria-label={t('Position in the clip')}
            />
            {duration > 0 &&
              steps
                .filter((step) => step.start > 0.5)
                .map((step) => (
                  <span key={step.start} className="video__tick" style={{ left: `calc(7px + (100% - 14px) * ${step.start / duration})` }} />
                ))}
          </div>
          <span className="video__time video__time--total">{duration ? clock(duration) : ''}</span>
          {steps.length > 0 && (
            <button className="video__btn" onClick={nextStep} aria-label={t('Next step')}>
              <SkipForward size={14} fill="currentColor" />
            </button>
          )}
          <button
            ref={speedButton}
            className="video__speed"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`${t('Playback speed {rate} times', { rate: formatNumber(rate) })}${steps.length ? t(', and step mode') : ''}`}
            aria-expanded={menuOpen}
          >
            {formatNumber(rate)}×
          </button>
          {menuOpen && (
            <div ref={menu} className="video__menu" role="dialog" aria-label={t('Playback')}>
              <span className="video__menu-label">{t('Speed')}</span>
              <div className="video__rates">
                {SPEEDS.map((speed) => (
                  <button key={speed} aria-pressed={speed === rate} onClick={() => updateSettings({ speed })}>
                    {formatNumber(speed)}×
                  </button>
                ))}
              </div>
              {steps.length > 0 && (
                <label className="video__toggle">
                  <span>{t('Pause after each step')}</span>
                  <input type="checkbox" checked={state.settings.stepMode} onChange={(e) => updateSettings({ stepMode: e.target.checked })} />
                </label>
              )}
            </div>
          )}
        </div>
        {/* One line by default; a tap shows the whole credit. */}
        <p className={`video__credits${creditsOpen ? ' video__credits--open' : ''}`} onClick={() => setCreditsOpen((o) => !o)}>
          🎬{' '}
          {slide.href ? (
            <a href={slide.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              {slide.credit}
            </a>
          ) : (
            slide.credit
          )}
          {slide.music && <> · ♪ {slide.music}</>}
        </p>
      </div>
    </div>
  );
}
