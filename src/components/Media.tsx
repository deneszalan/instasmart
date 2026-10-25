import { useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { KnowledgeCard, Slide } from '../types';
import type { WikiPost } from '../lib/wiki';
import { FIELD_BY_ID } from '../data/fields';
import { inline } from '../lib/markdown';
import { InteractiveSlide } from './Interactive';
import { VisualSlide } from './Visual';
import { clock, VideoSlideView } from './Video';
import { Ratings } from './Ratings';
import { ExploreSlideView } from './Explore';
import { challengeId } from '../lib/interactive';
import { firstVideo } from '../lib/visual';
import { clipSeconds } from '../data/library';
import { t } from '../i18n';

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

export function TitleSlide({ card, hasMore, onWatch }: { card: KnowledgeCard; hasMore?: boolean; onWatch?: () => void }) {
  const field = FIELD_BY_ID[card.field];
  const cover = card.cover;
  const video = firstVideo(card);
  const clip = video >= 0 ? card.slides![video] : undefined;
  const animated = clip?.type === 'video' && !!clip.animation;
  const length = clip?.type === 'video' ? clipSeconds(clip.src) : undefined;
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
      {video >= 0 && (
        <button
          className={`slide__video${animated ? ' slide__video--watch' : ''}`}
          onClick={onWatch}
          aria-label={animated ? `${t('Watch the animation in this post')}${length ? `, ${clock(length)}` : ''}` : t('Watch the video in this post')}
        >
          <Play size={13} fill="currentColor" /> {animated ? `${t('Watch')}${length ? ` · ${clock(length)}` : ''}` : t('Video')}
        </button>
      )}
      <div className="slide__center">
        {!cover && (
          <div className="slide__emoji" aria-hidden="true">
            {card.emoji}
          </div>
        )}
        <h3 className={`slide__title slide__title--${titleSize(card.title)}`}>{card.title}</h3>
        {clip?.type === 'video' && <Ratings ratings={clip.ratings} />}
      </div>
      <div className="slide__foot">
        <span>{cover?.credit ? `📷 ${cover.credit}` : `@${field.handle}`}</span>
        {hasMore && <span className="slide__swipe">{video === 0 ? t('Swipe to watch →') : t('Swipe for more →')}</span>}
      </div>
    </div>
  );
}

function SlideBody({ slide, challengeId }: { slide: Slide; challengeId: string }) {
  // The id is passed through to the interactive slides; other types ignore it.
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

    case 'quiz':
    case 'reveal':
    case 'estimate':
    case 'order':
    case 'match':
    case 'sort':
    case 'scramble':
    case 'odd':
    case 'rank':
    case 'higher':
    case 'fill':
    case 'place':
      return <InteractiveSlide slide={slide} challengeId={challengeId} />;
    case 'chart':
    case 'pictogram':
    case 'scale':
    case 'spectrum':
    case 'flow':
      return <VisualSlide slide={slide} />;
    case 'image':
    case 'video':
    case 'explore':
      // Rendered by ImageSlideView, VideoSlideView and ExploreSlideView.
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

function DetailSlide({ card, index, total, start }: { card: KnowledgeCard; index: number; total: number; start?: RefObject<(() => void) | null> }) {
  const field = FIELD_BY_ID[card.field];
  const slide = card.slides![index - 1];
  if (slide.type === 'image') return <ImageSlideView slide={slide} card={card} />;
  if (slide.type === 'video') return <VideoSlideView slide={slide} card={card} start={start} />;
  if (slide.type === 'explore') return <ExploreSlideView slide={slide} card={card} />;
  return (
    <div className={`slide slide--detail slide--${slide.type}`} style={gradientStyle(cardGradient(card))}>
      <span className="slide__bg-emoji" aria-hidden="true">
        {card.emoji}
      </span>
      <SlideBody slide={slide} challengeId={challengeId(card, index)} />
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
  // Starts the post's first clip, for the title slide's Watch button.
  const startVideo = useRef<(() => void) | null>(null);
  const videoAt = firstVideo(card) + 1;

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

  // On a lab, the arrows move up beside the counter so they don't cover the experiment.
  const lab = index > 0 && card.slides![index - 1].type === 'explore';
  return (
    <div className={`carousel${lab ? ' carousel--lab' : ''}`}>
      <div
        ref={trackRef}
        className="carousel__track"
        onScroll={onScroll}
        aria-roledescription="carousel"
        aria-label={t('{n} slides', { n: total })}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className="carousel__item"
            aria-roledescription="slide"
            aria-label={t('{n} of {total}', { n: i + 1, total })}
            aria-hidden={i !== index}
          >
            {i === 0 ? (
              <TitleSlide
                card={card}
                hasMore
                onWatch={() => {
                  go(videoAt);
                  // Still within the tap, so an animation may start with its music.
                  startVideo.current?.();
                }}
              />
            ) : (
              <DetailSlide card={card} index={i} total={total} start={i === videoAt ? startVideo : undefined} />
            )}
          </div>
        ))}
      </div>
      <span className="carousel__badge">
        {index + 1}/{total}
      </span>
      {index > 0 && (
        <button className="carousel__nav carousel__nav--prev" onClick={() => go(index - 1)} aria-label={t('Previous slide')}>
          <ChevronLeft size={18} />
        </button>
      )}
      {index < total - 1 && (
        <button className="carousel__nav carousel__nav--next" onClick={() => go(index + 1)} aria-label={t('Next slide')}>
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
