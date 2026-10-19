import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import { inline } from '../lib/markdown';
import { cardGradient, gradientStyle } from './Media';

type VideoSlide = Extract<Slide, { type: 'video' }>;

/** Once the reader turns sound on, later clips try to start with sound too (until they turn it off). */
let soundWanted = false;

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
  const [muted, setMuted] = useState(!soundWanted);
  const hasSound = !!slide.music;

  const shouldPlay = onScreen && (wantPlay ?? autoplay);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!shouldPlay) {
      v.pause();
      return;
    }
    v.muted = !hasSound || !soundWanted;
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

  const togglePlay = () => setWantPlay(!playing);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    soundWanted = !v.muted;
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
        onClick={togglePlay}
      />
      {!playing && (
        <button className="video__play" onClick={() => setWantPlay(true)} aria-label="Play clip">
          <Play size={30} fill="currentColor" />
        </button>
      )}
      {hasSound && (
        <button className="video__sound" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}>
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      )}
      <div className="slide-image__text">
        {slide.caption && <p className="slide-image__caption">{inline(slide.caption)}</p>}
        <p className="slide-image__credit">
          🎬{' '}
          {slide.href ? (
            <a href={slide.href} target="_blank" rel="noopener noreferrer">
              {slide.credit}
            </a>
          ) : (
            slide.credit
          )}
        </p>
        {slide.music && <p className="slide-image__credit">♪ {slide.music}</p>}
      </div>
    </div>
  );
}
