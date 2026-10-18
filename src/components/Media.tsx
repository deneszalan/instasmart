import { useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import type { WikiPost } from '../lib/wiki';
import { FIELD_BY_ID } from '../data/fields';
import { inline } from '../lib/markdown';

function titleSize(title: string): string {
  if (title.length <= 36) return 'xl';
  if (title.length <= 56) return 'lg';
  return 'md';
}

export function gradientStyle(gradient: [string, string]): CSSProperties {
  return { '--c1': gradient[0], '--c2': gradient[1] } as CSSProperties;
}

/** A post's colours: its own theme if it has one, otherwise its field's. */
export function cardGradient(card: KnowledgeCard): [string, string] {
  return card.theme?.gradient ?? FIELD_BY_ID[card.field].gradient;
}

export function TitleSlide({ card, hasMore }: { card: KnowledgeCard; hasMore?: boolean }) {
  const field = FIELD_BY_ID[card.field];
  const cover = card.cover;
  return (
    <div className={`slide slide--title${cover ? ' slide--cover' : ''}`} style={gradientStyle(cardGradient(card))}>
      {cover ? (
        <img className="slide__cover" src={cover.src} alt={cover.alt} loading="lazy" decoding="async" />
      ) : (
        <span className="slide__bg-emoji" aria-hidden="true">
          {card.emoji}
        </span>
      )}
      <span className="slide__pill">
        {field.emoji} {field.name}
      </span>
      <div className="slide__center">
        {!cover && (
          <div className="slide__emoji" aria-hidden="true">
            {card.emoji}
          </div>
        )}
        <h3 className={`slide__title slide__title--${titleSize(card.title)}`}>{card.title}</h3>
      </div>
      <div className="slide__foot">
        <span>{cover?.credit ? `📷 ${cover.credit}` : `@${field.handle}`}</span>
        {hasMore && <span className="slide__swipe">Swipe for more →</span>}
      </div>
    </div>
  );
}

function SlideBody({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'text':
      return (
        <div className="slide__center">
          {slide.heading && <p className="slide__heading">{slide.heading}</p>}
          <p className="slide__text">{inline(slide.text)}</p>
        </div>
      );

    case 'stat':
      return (
        <div className="slide__center slide__center--stat">
          <p className="stat__value">{slide.value}</p>
          <p className="stat__label">{inline(slide.label)}</p>
          {slide.text && <p className="stat__text">{inline(slide.text)}</p>}
        </div>
      );

    case 'list': {
      const style = slide.style ?? 'bullets';
      const Tag = style === 'bullets' ? 'ul' : 'ol';
      return (
        <div className="slide__center">
          {slide.heading && <p className="slide__heading">{slide.heading}</p>}
          <Tag className={`slide-list slide-list--${style}`}>
            {slide.items.map((item, i) => (
              <li key={i}>
                <span className="slide-list__mark" aria-hidden="true">
                  {style === 'bullets' ? '' : i + 1}
                </span>
                <span>{inline(item)}</span>
              </li>
            ))}
          </Tag>
        </div>
      );
    }

    case 'quote':
      return (
        <div className="slide__center">
          <span className="quote__mark" aria-hidden="true">
            “
          </span>
          <blockquote className="quote__text">{inline(slide.text)}</blockquote>
          {slide.attribution && <p className="quote__by">— {slide.attribution}</p>}
        </div>
      );

    case 'compare':
      return (
        <div className="slide__center">
          {slide.heading && <p className="slide__heading">{slide.heading}</p>}
          <div className="compare">
            {[slide.left, slide.right].map((side, i) => (
              <div key={i} className={`compare__side compare__side--${i === 0 ? 'a' : 'b'}`}>
                <span className="compare__label">{side.label}</span>
                <p>{inline(side.text)}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="slide__center">
          {slide.heading && <p className="slide__heading">{slide.heading}</p>}
          <ol className="timeline">
            {slide.events.map((e, i) => (
              <li key={i}>
                <span className="timeline__when">{e.when}</span>
                <span className="timeline__text">{inline(e.text)}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'image':
      // Rendered by ImageSlideView.
      return null;
  }
}

function ImageSlideView({ slide, card }: { slide: Extract<Slide, { type: 'image' }>; card: KnowledgeCard }) {
  const fit = slide.fit ?? 'cover';
  return (
    <div className={`slide slide--image slide--fit-${fit}`} style={gradientStyle(cardGradient(card))}>
      <img className="slide-image" src={slide.src} alt={slide.alt} loading="lazy" decoding="async" />
      <div className="slide-image__text">
        {slide.caption && <p className="slide-image__caption">{inline(slide.caption)}</p>}
        {slide.credit && <p className="slide-image__credit">📷 {slide.credit}</p>}
      </div>
    </div>
  );
}

function DetailSlide({ card, index, total }: { card: KnowledgeCard; index: number; total: number }) {
  const field = FIELD_BY_ID[card.field];
  const slide = card.slides![index - 1];
  if (slide.type === 'image') return <ImageSlideView slide={slide} card={card} />;
  return (
    <div className={`slide slide--detail slide--${slide.type}`} style={gradientStyle(cardGradient(card))}>
      <span className="slide__bg-emoji" aria-hidden="true">
        {card.emoji}
      </span>
      <SlideBody slide={slide} />
      <div className="slide__foot">
        <span>@{field.handle}</span>
        {index + 1 < total && <span className="slide__swipe">→</span>}
      </div>
    </div>
  );
}

interface CardMediaProps {
  card: KnowledgeCard;
  onIndexChange: (index: number) => void;
}

/** The post "image": a single title slide, or a swipeable carousel when the card has slides. */
export function CardMedia({ card, onIndexChange }: CardMediaProps) {
  const total = 1 + (card.slides?.length ?? 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (total === 1) return <TitleSlide card={card} />;

  const onScroll = () => {
    const track = trackRef.current!;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) {
      setIndex(next);
      onIndexChange(next);
    }
  };

  const go = (to: number) => {
    const track = trackRef.current!;
    track.scrollTo({ left: to * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="carousel">
      <div
        ref={trackRef}
        className="carousel__track"
        onScroll={onScroll}
        aria-roledescription="carousel"
        aria-label={`${total} slides`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="carousel__item"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${total}`}
            aria-hidden={i !== index}
          >
            {i === 0 ? <TitleSlide card={card} hasMore /> : <DetailSlide card={card} index={i} total={total} />}
          </div>
        ))}
      </div>
      <span className="carousel__badge">
        {index + 1}/{total}
      </span>
      {index > 0 && (
        <button className="carousel__nav carousel__nav--prev" onClick={() => go(index - 1)} aria-label="Previous slide">
          <ChevronLeft size={18} />
        </button>
      )}
      {index < total - 1 && (
        <button className="carousel__nav carousel__nav--next" onClick={() => go(index + 1)} aria-label="Next slide">
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

export function WikiMedia({ post }: { post: WikiPost }) {
  const [failed, setFailed] = useState(false);
  const image = post.image;

  if (!image || failed) {
    return (
      <div className="slide slide--title slide--wiki">
        <span className="slide__pill">W {post.label}</span>
        <div className="slide__center">
          <div className="slide__emoji slide__emoji--wiki" aria-hidden="true">
            W
          </div>
          <h3 className={`slide__title slide__title--${titleSize(post.title)}`}>{post.title}</h3>
        </div>
        <div className="slide__foot">
          <span>@wikipedia.featured</span>
        </div>
      </div>
    );
  }

  // Same bounds Instagram uses: no taller than 4:5, no wider than 1.91:1.
  const ratio = Math.min(1.91, Math.max(0.8, image.width / image.height));
  return (
    <div className="wiki-media" style={{ aspectRatio: String(ratio) }}>
      <img src={image.src} alt={post.title} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      <span className="wiki-media__label">{post.label}</span>
      {image.credit && <span className="wiki-media__credit">📷 {image.credit}</span>}
    </div>
  );
}
