import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, FlaskConical } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import { LAB_COMPONENTS } from '../labs';
import { inline } from '../lib/markdown';
import { cardGradient, gradientStyle } from './Media';
import { t } from '../i18n';
import { EDITION } from '../edition';

type ExploreSlide = Extract<Slide, { type: 'explore' }>;

/** The browser couldn't fetch a lab's code: offline, or the app was updated and its old files are gone. */
export const isLoadError = (error: Error) =>
  error.name === 'ChunkLoadError' || /dynamically imported module|importing a module script failed|failed to fetch/i.test(error.message);

const RELOADED = `${EDITION.storageKey}:reloaded-for-lab`;

/**
 * A lab that fails (or can't load offline) says so on its slide instead of taking the page down. A page opened
 * before an update asks for lab files the update replaced, so when online it reloads once to get the new ones.
 */
class LabBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error('Lab failed:', error);
    if (!isLoadError(error) || !navigator.onLine) return;
    try {
      const last = Number(sessionStorage.getItem(RELOADED) ?? 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(RELOADED, String(Date.now()));
    } catch {
      return;
    }
    location.reload();
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="lab lab--failed">
        <p>{t('This experiment couldn’t load. Check your connection and try again later.')}</p>
        <button className="lab__btn" onClick={() => location.reload()}>
          {t('Reload')}
        </button>
      </div>
    );
  }
}

/** Whether the element is (nearly) on screen; `near` turns true the first time it comes close and stays true. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ near: false, visible: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setState((s) => ({ near: s.near || e.isIntersecting, visible: e.intersectionRatio > 0.5 })), {
      threshold: [0, 0.5],
      rootMargin: '0px 50% 0px 50%',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state] as const;
}

/**
 * A lab the reader experiments with. The prompt sets a goal; when the lab reports it reached, the takeaway
 * replaces the prompt. The lab's code loads once the slide is near the screen and pauses while it's hidden.
 */
export function ExploreSlideView({ slide, card }: { slide: ExploreSlide; card: KnowledgeCard }) {
  const [ref, view] = useInView<HTMLDivElement>();
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  const Lab = LAB_COMPONENTS[slide.lab];
  return (
    <div ref={ref} className="slide slide--detail slide--explore" style={gradientStyle(cardGradient(card))} data-interactive>
      <p className="slide__heading explore__heading">
        <FlaskConical size={15} aria-hidden="true" /> {slide.heading ?? t('Try it yourself')}
      </p>
      <p className={`explore__prompt${done ? ' explore__prompt--done' : ''}`} aria-live="polite">
        {done && <Check size={16} className="explore__check" aria-hidden="true" />}
        {inline(done ? slide.takeaway : slide.prompt)}
      </p>
      {view.near && (
        <LabBoundary>
          <Suspense fallback={<div className="lab lab--loading" />}>
            <Lab onDone={onDone} active={view.visible} />
          </Suspense>
        </LabBoundary>
      )}
    </div>
  );
}
