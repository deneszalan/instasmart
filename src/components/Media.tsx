import { useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { KnowledgeCard } from '../types';
import type { WikiPost } from '../lib/wiki';
import { FIELD_BY_ID } from '../data/fields';

function titleSize(title: string): string {
  if (title.length <= 36) return 'xl';
  if (title.length <= 56) return 'lg';
  return 'md';
}

export function gradientStyle(gradient: [string, string]): CSSProperties {
  return { '--c1': gradient[0], '--c2': gradient[1] } as CSSProperties;
}

export function TitleSlide({ card, hasMore }: { card: KnowledgeCard; hasMore?: boolean }) {
  const field = FIELD_BY_ID[card.field];
  return (
    <div className="slide slide--title" style={gradientStyle(field.gradient)}>
      <span className="slide__bg-emoji" aria-hidden="true">
        {card.emoji}
      </span>
      <span className="slide__pill">
        {field.emoji} {field.name}
      </span>
      <div className="slide__center">
        <div className="slide__emoji" aria-hidden="true">
          {card.emoji}
        </div>
        <h3 className={`slide__title slide__title--${titleSize(card.title)}`}>{card.title}</h3>
      </div>
      <div className="slide__foot">
        <span>@{field.handle}</span>
        {hasMore && <span className="slide__swipe">Swipe for more →</span>}
      </div>
    </div>
  );
}

function DetailSlide({ card, index, total }: { card: KnowledgeCard; index: number; total: number }) {
  const field = FIELD_BY_ID[card.field];
  const slide = card.slides![index - 1];
  return (
    <div className="slide slide--detail" style={gradientStyle(field.gradient)}>
      <span className="slide__bg-emoji" aria-hidden="true">
        {card.emoji}
      </span>
      <span className="slide__count">
        {index + 1}/{total}
      </span>
      <div className="slide__center">
        <p className="slide__heading">{slide.heading}</p>
        <p className="slide__text">{slide.text}</p>
      </div>
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
