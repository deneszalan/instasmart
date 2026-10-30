/**
 * The page itself doesn't zoom (the viewport in index.html, and touch-action in styles.css): a zoomed page hid the menu
 * bar behind the browser's own and left empty space below short pages. Pictures and videos zoom instead, as on
 * Instagram: pinch one and a copy grows over the page under the fingers, then springs back when they let go.
 */

/** What can be zoomed: the pictures and clips of posts and stories, not thumbnails or avatars. */
const ZOOMABLE = 'img.slide__cover, img.slide-image, img.comic__art, video.slide-video, video.story__video, .wiki-media img, .learn__figure img';
/** A pinch may start on what's drawn over a picture too (a caption, the play button). */
const HOLDERS = '.slide, .story, .wiki-media, .learn__figure';
const MAX_SCALE = 4;

type Media = HTMLImageElement | HTMLVideoElement;

export interface Point {
  x: number;
  y: number;
}

function mediaAt(target: EventTarget | null): Media | null {
  if (!(target instanceof Element)) return null;
  return (target.closest(ZOOMABLE) ?? target.closest(HOLDERS)?.querySelector(ZOOMABLE) ?? null) as Media | null;
}

/**
 * The scale and shift that keep the spot first pinched under the fingers as they spread and move: a point p of the
 * picture lands at now + (p - start) × scale. `origin` is the picture's top left corner; the transform is about it.
 */
export function pinchTransform(origin: Point, start: Point, now: Point, startGap: number, gap: number) {
  const scale = Math.min(MAX_SCALE, Math.max(1, gap / startGap));
  return { scale, x: now.x - origin.x - scale * (start.x - origin.x), y: now.y - origin.y - scale * (start.y - origin.y) };
}

interface Pinch {
  layer: HTMLDivElement;
  copy: HTMLElement;
  rect: DOMRect;
  start: Point;
  startGap: number;
  frame: number;
}

const gapOf = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
const midOf = (a: Touch, b: Touch): Point => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

/** A copy of the picture, or of the clip's current frame (drawn live while it plays), laid over the page. */
function begin(el: Media, a: Touch, b: Touch): Pinch | null {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  let copy: HTMLImageElement | HTMLCanvasElement;
  let draw: (() => void) | null = null;
  if (el instanceof HTMLVideoElement && el.readyState >= 2 && el.videoWidth) {
    const canvas = document.createElement('canvas');
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    draw = () => ctx.drawImage(el, 0, 0);
    draw();
    copy = canvas;
  } else {
    const src = el instanceof HTMLVideoElement ? el.poster : el.currentSrc || el.src;
    if (!src) return null;
    copy = new Image();
    copy.src = src;
  }
  const style = getComputedStyle(el);
  Object.assign(copy.style, {
    position: 'absolute',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    objectFit: style.objectFit,
    objectPosition: style.objectPosition,
    transformOrigin: '0 0',
    willChange: 'transform',
  });
  const layer = document.createElement('div');
  layer.className = 'pinch-layer';
  layer.append(copy);
  document.body.append(layer);
  const pinch: Pinch = { layer, copy, rect, start: midOf(a, b), startGap: gapOf(a, b), frame: 0 };
  if (draw) {
    const tick = () => {
      draw();
      pinch.frame = requestAnimationFrame(tick);
    };
    pinch.frame = requestAnimationFrame(tick);
  }
  return pinch;
}

function follow(pinch: Pinch, a: Touch, b: Touch) {
  const { scale, x, y } = pinchTransform({ x: pinch.rect.left, y: pinch.rect.top }, pinch.start, midOf(a, b), pinch.startGap, gapOf(a, b));
  pinch.copy.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  pinch.layer.style.backgroundColor = `rgba(0, 0, 0, ${Math.min(0.7, (scale - 1) * 0.7)})`;
}

function release(pinch: Pinch) {
  pinch.layer.classList.add('pinch-layer--back');
  pinch.copy.style.transform = '';
  pinch.layer.style.backgroundColor = '';
  setTimeout(() => {
    cancelAnimationFrame(pinch.frame);
    pinch.layer.remove();
  }, 260);
}

/** Lets readers pinch pictures and clips, once, for the whole app. */
export function enablePinchZoom(): void {
  if (typeof document === 'undefined') return;
  let pinch: Pinch | null = null;
  let endedAt = -Infinity;
  document.addEventListener(
    'touchstart',
    (e) => {
      if (pinch || e.touches.length !== 2) return;
      const el = mediaAt(e.touches[0].target);
      // Both fingers on the same picture.
      if (el && mediaAt(e.touches[1].target) === el) pinch = begin(el, e.touches[0], e.touches[1]);
    },
    { capture: true, passive: true },
  );
  document.addEventListener(
    'touchmove',
    (e) => {
      if (!pinch) return;
      // The fingers move the picture, not the feed or the slides.
      if (e.cancelable) e.preventDefault();
      if (e.touches.length >= 2) follow(pinch, e.touches[0], e.touches[1]);
    },
    { capture: true, passive: false },
  );
  const end = (e: TouchEvent) => {
    if (!pinch || e.touches.length >= 2) return;
    release(pinch);
    pinch = null;
    endedAt = performance.now();
  };
  document.addEventListener('touchend', end, { capture: true });
  document.addEventListener('touchcancel', end, { capture: true });
  // Lifting the fingers of a pinch also makes a click: it must not pause a clip or jump a step.
  document.addEventListener(
    'click',
    (e) => {
      if (performance.now() - endedAt > 400) return;
      e.preventDefault();
      e.stopPropagation();
    },
    { capture: true },
  );
  // Safari zooms the page on a pinch whatever the viewport says; its own gesture events can be stopped.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
}
