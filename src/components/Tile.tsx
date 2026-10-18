import type { Post } from '../types';
import { FIELD_BY_ID } from '../data/fields';
import { gradientStyle } from './Media';

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
  const field = FIELD_BY_ID[card.field];
  return (
    <button className={className} onClick={onOpen} aria-label={card.title}>
      <span className="tile__face" style={gradientStyle(field.gradient)}>
        <span className="tile__emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="tile__title">{card.title}</span>
      </span>
      {card.slides && <span className="tile__multi" aria-hidden="true" />}
    </button>
  );
}
