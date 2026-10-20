import { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { KnowledgeCard, Post } from '../types';
import { LIBRARY } from '../data/library';
import { authorGroup } from '../lib/authors';
import { endlessFeed, take, type FeedEntry } from '../lib/feed';
import { createWikiStream, type WikiPost } from '../lib/wiki';
import { useStore } from '../state/store';
import { PostView } from '../components/Post';
import { StoriesBar } from '../components/StoriesBar';
import { WRITERS, WriterChips } from '../components/WriterChips';
import { t } from '../i18n';
import { EDITION } from '../edition';

type FeedItem = Post | { kind: 'caught-up'; key: string; round: number };

const PAGE_SIZE = 6;
/** One live Wikipedia post after every this many library cards. */
const WIKI_EVERY = 4;

interface CaughtUpProps {
  round: number;
  total: number;
  /** Set when the feed shows one writer's posts; that feed ends here instead of reshuffling. */
  writer?: string;
  onShowAll: () => void;
}

function CaughtUp({ round, total, writer, onShowAll }: CaughtUpProps) {
  const pieces = t(total === 1 ? '{n} piece' : '{n} pieces', { n: total });
  if (writer) {
    return (
      <div className="caught-up" role="note">
        <span className="caught-up__icon">
          <Check size={30} strokeWidth={2.5} />
        </span>
        <p className="caught-up__title">{t('That’s all {pieces} by {writer}', { pieces, writer })}</p>
        <p className="caught-up__sub">{t('Switch back to everyone to keep scrolling.')}</p>
        <button className="btn btn--primary" onClick={onShowAll}>
          {t('Show everyone’s posts')}
        </button>
      </div>
    );
  }
  return (
    <div className="caught-up" role="note">
      <span className="caught-up__icon">
        <Check size={30} strokeWidth={2.5} />
      </span>
      <p className="caught-up__title">{t('You’ve explored all {pieces}', { pieces })}</p>
      <p className="caught-up__sub">
        {round === 1
          ? t('Nice work. Keep scrolling for a fresh shuffle — repetition is how things stick.')
          : t('That’s round {round}. Keep scrolling for a fresh shuffle — repetition is how things stick.', { round })}
      </p>
    </div>
  );
}

interface FeedProps {
  /** "Written by" filter: an author group id, or "" for everyone. The parent remounts the feed when it changes. */
  by: string;
  onBy: (id: string) => void;
}

export function Feed({ by, onBy }: FeedProps) {
  const { state } = useStore();
  // Wikipedia's posts aren't by any of the writers, so they only appear in the unfiltered feed.
  const wikiEnabled = EDITION.wiki && state.settings.wiki && !by;
  const writer = WRITERS.find((w) => w.id === by)?.label;

  /** Next page of entries. A one-writer feed stops after its first full round. */
  const takePage = useCallback(
    (stream: Generator<FeedEntry, never, void>) => {
      const entries = take(stream, PAGE_SIZE);
      const end = by ? entries.findIndex((e) => e.type === 'caught-up') : -1;
      return end === -1 ? { entries, done: false } : { entries: entries.slice(0, end + 1), done: true };
    },
    [by],
  );

  // The stream is created once per visit, putting pieces you haven't read yet first.
  const [session] = useState(() => {
    const cards: KnowledgeCard[] = by ? LIBRARY.filter((c) => authorGroup(c)?.id === by) : LIBRARY;
    if (cards.length === 0) return { cards, feed: null, firstPage: [], done: true };
    const feed = endlessFeed(cards, { seed: Date.now(), seen: new Set(Object.keys(state.seen)) });
    const first = takePage(feed);
    return { cards, feed, firstPage: first.entries, done: first.done };
  });
  const { feed } = session;
  const [ended, setEnded] = useState(session.done);
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
    if (!feed || ended) return;
    const page = takePage(feed);
    const more = toItems(page.entries);
    setItems((prev) => prev.concat(more));
    if (page.done) setEnded(true);
    void topUpWiki();
  }, [feed, ended, takePage, toItems, topUpWiki]);

  // Re-observe after every page so a sentinel that is still on screen loads again.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !feed || ended) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore(), {
      rootMargin: '0px 0px 1400px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, loadMore, feed, ended]);

  const visible = wikiEnabled ? items : items.filter((item) => item.kind !== 'wiki');

  return (
    <div className="feed">
      <StoriesBar />
      <div className="feed__filter">
        <WriterChips value={by} onChange={onBy} />
      </div>
      {!feed && (
        <div className="empty">
          <p className="empty__title">{t('No posts by {writer} yet', { writer: writer ?? t('this writer') })}</p>
          <p className="empty__sub">{t('They’ll show up here as soon as they’re added to the library.')}</p>
          <button className="btn btn--primary" onClick={() => onBy('')}>
            {t('Show everyone’s posts')}
          </button>
        </div>
      )}
      {visible.map((item) =>
        item.kind === 'caught-up' ? (
          <CaughtUp
            key={item.key}
            round={item.round}
            total={session.cards.length}
            writer={by ? (writer ?? t('this writer')) : undefined}
            onShowAll={() => onBy('')}
          />
        ) : (
          <PostView key={item.key} post={item} />
        ),
      )}
      <div ref={sentinel} className="feed__loader" aria-hidden="true" hidden={!feed || ended}>
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
