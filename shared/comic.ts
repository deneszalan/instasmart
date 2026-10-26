/**
 * The geometry of a comic panel's lettering, shared by the schema's checks and the app's CSS (.comic in
 * src/styles.css). Sizes are in percent of the panel's width; the panel is 4:5, so a height in percent of the
 * panel's height is that size × 0.8.
 */
export const COMIC = {
  /** Letter size of bubbles and captions. */
  font: 4.3,
  lineHeight: 1.16,
  /** Width of an average capital in Patrick Hand, in ems, with a margin for ragged line ends. */
  charWidth: 0.47,
  /** Padding inside a bubble: across and down. */
  padX: 3.4,
  padY: 2.2,
  /** Padding inside the caption box. */
  captionPadX: 2.4,
  captionPadY: 1.6,
  /** The caption box sits this far in from the panel's corner and is at most this wide. */
  captionInset: 2.5,
  captionWidth: 72,
  /** Most lines a bubble may hold. */
  maxLines: 6,
  /** Default bubble width. */
  bubbleWidth: 46,
  aspect: 0.8,
} as const;

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Laughter is lettered this much bigger than speech. */
export const LAUGH_SCALE = 1.2;

function wrap(text: string, inner: number, scale = 1): number {
  const perLine = Math.max(1, Math.floor(inner / (COMIC.font * scale * COMIC.charWidth)));
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const need = used ? used + 1 + word.length : word.length;
    if (need > perLine && used) {
      lines++;
      used = word.length;
    } else used = need;
  }
  return lines;
}

const scaleOf = (kind?: string) => (kind === 'laugh' ? LAUGH_SCALE : 1);

/** How many lines a bubble's words take at a width (percent of the panel's width). */
export function bubbleLines(text: string, width: number, kind?: string): number {
  return wrap(text, width - COMIC.padX * 2, scaleOf(kind));
}

/** Where a bubble centred on (x, y) lands, roughly, in percent of the panel's width (left, right) and height (top, bottom). */
export function bubbleBox(text: string, x: number, y: number, width: number, kind?: string): Box {
  const height = (bubbleLines(text, width, kind) * COMIC.font * scaleOf(kind) * COMIC.lineHeight + COMIC.padY * 2) * COMIC.aspect;
  return { left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
}

/** The caption box at the top or bottom of the panel, at its widest. */
export function captionBox(text: string, at: 'top' | 'bottom'): Box {
  const inner = COMIC.captionWidth - COMIC.captionPadX * 2;
  const lines = wrap(text, inner);
  const border = 0.9;
  const width = Math.min(COMIC.captionWidth, text.length * COMIC.font * COMIC.charWidth + COMIC.captionPadX * 2) + border;
  const height = (lines * COMIC.font * COMIC.lineHeight + COMIC.captionPadY * 2 + border) * COMIC.aspect;
  const top = at === 'top' ? COMIC.captionInset * COMIC.aspect : 100 - COMIC.captionInset * COMIC.aspect - height;
  return { left: COMIC.captionInset, right: COMIC.captionInset + width, top, bottom: top + height };
}

/** Corners of the panel that the app covers: the slide counter (top right) and the "Read on" tab (bottom right). */
export const COVERED: Record<'counter' | 'next', Box> = {
  counter: { left: 84, right: 100, top: 0, bottom: 9 },
  next: { left: 76, right: 100, top: 93, bottom: 100 },
};

export function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/**
 * Whether a bubble that interrupts or talks over another (box over before) only nicks its edge: the overlap stays
 * within the earlier bubble's padding on one side, so none of its words are covered.
 */
export function edgeOnly(before: Box, box: Box): boolean {
  const across = Math.min(before.right, box.right) - Math.max(before.left, box.left);
  const down = Math.min(before.bottom, box.bottom) - Math.max(before.top, box.top);
  return across <= COMIC.padX + 1.5 || down <= (COMIC.padY + 1.5) * COMIC.aspect;
}
