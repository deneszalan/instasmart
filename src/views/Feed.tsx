import { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { Post } from '../types';
import { LIBRARY } from '../data/library';
import { endlessFeed, take, type FeedEntry } from '../lib/feed';
import { createWikiStream, type WikiPost } from '../lib/wiki';
import { useStore } from '../state/store';
import { PostView } from '../components/Post';
import { StoriesBar } from '../components/StoriesBar';

type FeedItem = Post | { kind: 'caught-up'; key: string; round: number };

const PAGE_SIZE = 6;
/** One live Wikipedia post after every this many library cards. */
const WIKI_EVERY = 4;

function CaughtUp({ round }: { round: number }) {
  return (
    <div className="caught-up" role="note">
      <span className="caught-up__icon">
        <Check size={30} strokeWidth={2.5} />
      </span>
      <p className="caught-up__title">You’ve explored all {LIBRARY.length} pieces</p>
      <p className="caught-up__sub">
        {round === 1 ? 'Nice work. ' : `That’s round ${round}. `}
        Keep scrolling for a fresh shuffle — repetition is how things stick.
      </p>
    </div>
  );
}

export function Feed() {
  const { state } = useStore();
  const wikiEnabled = state.settings.wiki;

  // The stream is created once per visit, putting pieces you haven't read yet first.
  const [session] = useState(() => {
    const feed = endlessFeed(LIBRARY, { seed: Date.now(), seen: new Set(Object.keys(state.seen)) });
    return { feed, firstPage: take(feed, PAGE_SIZE) };
  });
  const { feed } = session;
  const wiki = useRef(createWikiStream());
  const wikiBuffer = useRef<WikiPost[]>([]);
  const wikiLoading = useRef(false);
  const cardsSinceWiki = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);

  const toItems = useCallback(
    (entries: FeedEntry[]): FeedItem[] => {
      const items: FeedItem[] = [];
      for (const entry of entries) {
        if (entry.type === 'caught-up') {
          items.push({ kind: 'caught-up', key: `caught-up-${entry.round}`, round: entry.round });
          continue;
        }
        items.push({ kind: 'card', key: `${entry.card.id}:${entry.round}`, card: entry.card });
        cardsSinceWiki.current++;
        if (wikiEnabled && cardsSinceWiki.current >= WIKI_EVERY && wikiBuffer.current.length > 0) {
          items.push(wikiBuffer.current.shift()!);
          cardsSinceWiki.current = 0;
        }
      }
      return items;
    },
    [wikiEnabled],
  );

  const [items, setItems] = useState<FeedItem[]>(() => toItems(session.firstPage));

  const topUpWiki = useCallback(async () => {
    if (!wikiEnabled || wikiLoading.current || wiki.current.exhausted) return;
    wikiLoading.current = true;
    try {
      while (wikiBuffer.current.length < 4 && !wiki.current.exhausted) {
        wikiBuffer.current.push(...(await wiki.current.next()));
      }
    } finally {
      wikiLoading.current = false;
    }
  }, [wikiEnabled]);

  useEffect(() => {
    void topUpWiki();
  }, [topUpWiki]);

  const loadMore = useCallback(() => {
    const more = toItems(take(feed, PAGE_SIZE));
    setItems((prev) => prev.concat(more));
    void topUpWiki();
  }, [feed, toItems, topUpWiki]);

  // Re-observe after every page so a sentinel that is still on screen loads again.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
      rootMargin: '0px 0px 1400px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, loadMore]);

  const visible = wikiEnabled ? items : items.filter((item) => item.kind !== 'wiki');

  return (
    <div className="feed">
      <StoriesBar />
      {visible.map((item) =>
        item.kind === 'caught-up' ? <CaughtUp key={item.key} round={item.round} /> : <PostView key={item.key} post={item} />,
      )}
      <div ref={sentinel} className="feed__loader" aria-hidden="true">
        <div className="skeleton">
          <div className="skeleton__head">
            <span className="skeleton__circle" />
            <span className="skeleton__line" />
          </div>
          <div className="skeleton__media" />
        </div>
      </div>
    </div>
  );
}
