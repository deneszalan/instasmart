import { Bookmark } from 'lucide-react';
import type { Post } from '../types';
import { CARD_BY_ID } from '../data/library';
import { useStore, type LearnState } from '../state/store';
import { Tile } from '../components/Tile';

export function savedPosts(saved: LearnState['saved']): Post[] {
  return Object.entries(saved)
    .sort(([, a], [, b]) => b.at - a.at)
    .flatMap(([id, entry]): Post[] => {
      if (entry.wiki) return [entry.wiki];
      const card = CARD_BY_ID.get(id);
      return card ? [{ kind: 'card', key: id, card }] : [];
    });
}

export function Saved({ onOpen }: { onOpen: (id: string) => void }) {
  const { state } = useStore();
  const posts = savedPosts(state.saved);

  return (
    <div className="saved">
      <h1 className="view-title">Saved</h1>
      {posts.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <Bookmark size={34} />
          </span>
          <p className="empty__title">Save what you want to remember</p>
          <p className="empty__sub">Tap the bookmark on any post and it will be kept here.</p>
        </div>
      ) : (
        <div className="grid">
          {posts.map((post) => (
            <Tile key={post.key} post={post} onOpen={() => onOpen(post.kind === 'card' ? post.card.id : post.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
