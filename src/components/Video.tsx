import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import { inline } from '../lib/markdown';
import { cardGradient, gradientStyle } from './Media';
import { sound } from '../lib/sound';

type VideoSlide = Extract<Slide, { type: 'video' }>;

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
 * A short looping clip. It plays muted while the slide is on screen and pauses when it isn't;
 * nothing is downloaded until then. Readers who prefer reduced motion or save data tap to play.
 */
export function VideoSlideView({ slide, card }: { slide: VideoSlide; card: KnowledgeCard }) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const onScreen = useOnScreen(box, 0.6);
  const [autoplay] = useState(autoplayAllowed);
  // The reader's own choice wins over autoplay: null until they tap.
  const [wantPlay, setWantPlay] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(!sound.wanted);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const seek = useRef<HTMLInputElement>(null);
  const elapsed = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const hasSound = !!slide.music;

  const shouldPlay = onScreen && (wantPlay ?? autoplay);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!shouldPlay) {
      v.pause();
      return;
    }
    v.muted = !hasSound || !sound.wanted;
    setMuted(v.muted);
    v.play().catch(() => {
      // Browsers may refuse sound without a fresh tap; fall back to a muted start.
      v.muted = true;
      setMuted(true);
      v.play().catch(() => setPlaying(false));
    });
  }, [shouldPlay, hasSound]);

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

  // Move the progress bar and clock straight in the DOM, every frame while playing.
  const paint = useCallback(() => {
    const v = video.current;
    const bar = seek.current;
    if (!v || !bar || !v.duration) return;
    if (!dragging.current) bar.value = String(v.currentTime);
    bar.style.setProperty('--p', `${((v.currentTime / v.duration) * 100).toFixed(2)}%`);
    bar.setAttribute('aria-valuetext', `${clock(v.currentTime)} of ${clock(v.duration)}`);
    if (elapsed.current) elapsed.current.textContent = clock(v.currentTime);
  }, []);

  useEffect(() => {
    paint();
    if (!playing) return;
    let frame = requestAnimationFrame(function tick() {
      paint();
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, paint]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    paint();
  };

  const togglePlay = () => setWantPlay(!playing);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    sound.wanted = !v.muted;
    setMuted(v.muted);
    if (v.paused) setWantPlay(true);
  };

  const fit = slide.fit ?? 'contain';
  return (
    <div ref={box} className={`slide slide--video slide--fit-${fit}`} style={gradientStyle(cardGradient(card))} data-interactive>
      <video
        ref={video}
        className="slide-video"
        src={slide.src}
        poster={slide.poster}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-label={slide.alt}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onSeeked={paint}
        onClick={togglePlay}
      />
      {!playing && (
        <button className="video__play" onClick={() => setWantPlay(true)} aria-label="Play clip">
          <Play size={30} fill="currentColor" />
        </button>
      )}
      <div className="slide-image__text video__info">
        {slide.caption && <p className="slide-image__caption">{inline(slide.caption)}</p>}
        <div className="video__bar">
          {hasSound && (
            <button className="video__sound" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          <span className="video__time" ref={elapsed}>
            0:00
          </span>
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
            aria-label="Position in the clip"
          />
          <span className="video__time video__time--total">{duration ? clock(duration) : ''}</span>
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
