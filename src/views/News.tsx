import { useEffect, useRef, useState } from 'react';
import { LIBRARY } from '../data/library';
import { newsFirst } from '../lib/feed';
import { formatNewsDate, newsAt } from '../lib/time';
import { PostView } from '../components/Post';
import { t } from '../i18n';

/** Posts hooked to the news, the latest event first. */
export const NEWS = newsFirst(LIBRARY);

const PAGE_SIZE = 6;

/** The line above a news post: the day of its event, or "Coming up" for one still ahead, like an election. */
function dateline(news: string, now = Date.now()): string {
  const date = formatNewsDate(news);
  return news.length === 10 && newsAt(news) > now ? t('Coming up: {date}', { date }) : date;
}

export function News() {
  const [shown, setShown] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const more = shown < NEWS.length;

  // Re-observe after every page so a sentinel that is still on screen loads again.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setShown((n) => n + PAGE_SIZE), {
      rootMargin: '0px 0px 1400px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown, more]);

  return (
    <div className="feed news">
      <h1 className="view-title">{t('News')}</h1>
      <p className="news__intro">{t('Animated explainers on what’s in the news: how it works and what the numbers mean. The latest first.')}</p>
      {NEWS.slice(0, shown).map((card) => (
        <section key={card.id} className="news__item">
          <p className="news__date">
            <time dateTime={card.news}>{dateline(card.news!)}</time>
          </p>
          <PostView post={{ kind: 'card', key: card.id, card }} />
        </section>
      ))}
      <div ref={sentinel} className="feed__loader" aria-hidden="true" hidden={!more}>
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
