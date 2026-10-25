import type { CSSProperties } from 'react';
import type { Slide } from '../types';
import { COMIC } from '../../shared/comic.ts';
import { t } from '../i18n';

type ComicSlide = Extract<Slide, { type: 'comic' }>;
type Bubble = NonNullable<ComicSlide['bubbles']>[number];

/** The tail from a bubble's centre to the point it names, in panel percent; the bubble itself hides the inner part. */
function Tail({ bubble }: { bubble: Bubble }) {
  const { x, y, tail } = bubble;
  if (!tail) return null;
  // Work in width units both ways, so the tail keeps its shape on the 4:5 panel.
  const k = 1 / COMIC.aspect;
  const dx = tail.x - x;
  const dy = (tail.y - y) * k;
  const length = Math.hypot(dx, dy) || 1;
  if (bubble.kind === 'thought') {
    // Three shrinking puffs on the way to the thinker.
    return (
      <>
        {[0.6, 0.76, 0.9].map((f, i) => (
          <ellipse key={i} cx={x + dx * f} cy={y + (dy * f) / k} rx={2.2 - i * 0.6} ry={(2.2 - i * 0.6) / k} />
        ))}
      </>
    );
  }
  const half = bubble.kind === 'shout' ? 3.6 : 3;
  const px = (-dy / length) * half;
  const py = (dx / length) * half;
  // A slight curve, as a letterer would draw it.
  const bend = 0.18 * length;
  const cx = x + dx * 0.6 + (px / half) * bend * 0.25;
  const cy = y + (dy * 0.6 + (py / half) * bend * 0.25) / k;
  return <path d={`M${x + px} ${y + py / k} Q${cx} ${cy} ${tail.x} ${tail.y} Q${cx} ${cy} ${x - px} ${y - py / k}Z`} />;
}

/** The lettering's sizes, from the same numbers the schema checks layouts with. */
const LETTERING = {
  '--font': COMIC.font,
  '--lh': COMIC.lineHeight,
  '--pad-x': COMIC.padX,
  '--pad-y': COMIC.padY,
  '--cap-pad-x': COMIC.captionPadX,
  '--cap-pad-y': COMIC.captionPadY,
  '--cap-inset': COMIC.captionInset,
  '--cap-width': COMIC.captionWidth,
} as CSSProperties;

const place = (b: Bubble): CSSProperties => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.width ?? COMIC.bubbleWidth}%` });

/**
 * One panel of a comic: the art, the narrator's caption box and the bubbles lettered on top. The bubbles are drawn
 * twice, as one white outlined shape with their tails (hidden from screen readers) and as the words above it.
 */
export function ComicSlideView({ slide, next }: { slide: ComicSlide; next: 'comic' | 'other' | null }) {
  const bubbles = slide.bubbles ?? [];
  return (
    <div className="slide slide--comic">
      <figure className="comic" style={LETTERING}>
        <img className="comic__art" src={slide.src} alt={slide.alt} loading="lazy" decoding="async" />
        <div className="comic__shapes" aria-hidden="true">
          <svg className="comic__tails" viewBox="0 0 100 100" preserveAspectRatio="none">
            {bubbles.map((b, i) => (
              <Tail key={i} bubble={b} />
            ))}
          </svg>
          {bubbles.map((b, i) => (
            <div key={i} className={`comic__bubble comic__bubble--${b.kind ?? 'speech'}`} style={place(b)}>
              {b.text}
            </div>
          ))}
        </div>
        <figcaption className="comic__words">
          {slide.caption && <p className={`comic__caption comic__caption--${slide.captionAt ?? 'top'}`}>{slide.caption}</p>}
          {bubbles.map((b, i) => (
            <p key={i} className={`comic__bubble comic__bubble--${b.kind ?? 'speech'}`} style={place(b)}>
              {b.speaker && <span className="sr-only">{b.speaker}: </span>}
              {b.text}
            </p>
          ))}
        </figcaption>
        {slide.credit && <span className="comic__credit">{slide.credit}</span>}
        {next && <span className="comic__next">{next === 'comic' ? t('Read on →') : '→'}</span>}
      </figure>
    </div>
  );
}
