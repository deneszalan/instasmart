import type { Post } from '../types';
import { cardGradient, gradientStyle } from './Media';

interface TileProps {
  post: Post;
  onOpen: () => void;
  tall?: boolean;
}

/** A square (or tall) thumbnail for the Explore and Saved grids. */
export function Tile({ post, onOpen, tall }: TileProps) {
  const className = `tile${tall ? ' tile--tall' : ''}`;

  if (post.kind === 'wiki') {
    return (
      <button className={className} onClick={onOpen} aria-label={post.title}>
        {post.image ? (
          <img src={post.image.src} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="tile__face tile__face--wiki">
            <span className="tile__emoji">W</span>
            <span className="tile__title">{post.title}</span>
          </span>
        )}
      </button>
    );
  }

  const { card } = post;
  return (
    <button className={className} onClick={onOpen} aria-label={card.title}>
      {card.cover && <img src={card.cover.src} alt="" loading="lazy" decoding="async" />}
      <span className={`tile__face${card.cover ? ' tile__face--photo' : ''}`} style={gradientStyle(cardGradient(card))}>
        <span className="tile__emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="tile__title">{card.title}</span>
      </span>
      {card.slides?.some((sl) => sl.type === 'video') ? (
        <span className="tile__video" aria-hidden="true" />
      ) : card.slides?.some((sl) => sl.type === 'comic') ? (
        <span className="tile__comic" aria-hidden="true" />
      ) : card.slides?.length ? (
        <span className="tile__multi" aria-hidden="true" />
      ) : null}
    </button>
  );
}
