import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Bookmark, ExternalLink, Heart, MessageCircle, Send, Ellipsis } from 'lucide-react';
import type { KnowledgeCard, Post } from '../types';
import type { WikiPost } from '../lib/wiki';
import { FIELD_BY_ID } from '../data/fields';
import { LIBRARY } from '../data/library';
import { cardText, readSeconds, slideDetail } from '../lib/feed';
import { authorGroup, badgeLabel } from '../lib/authors';
import { inline } from '../lib/markdown';
import { sharePost } from '../lib/share';
import { useRoute } from '../lib/route';
import { postId, useStore } from '../state/store';
import { Avatar } from './Avatar';
import { CardMedia, WikiMedia } from './Media';
import { Sheet } from './Sheet';

/** Mark a post as read once at least 60% of it has been on screen for 1.5 seconds. */
function useSeen(id: string) {
  const ref = useRef<HTMLElement>(null);
  const { markSeen, state } = useStore();
  const alreadySeen = id in state.seen;

  useEffect(() => {
    const el = ref.current;
    if (!el || alreadySeen) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry.isIntersecting) timer = setTimeout(() => markSeen(id), 1500);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [id, alreadySeen, markSeen]);

  return ref;
}

/** Detect a double tap/click without waiting on the browser's dblclick heuristics. */
function useDoubleTap(onDoubleTap: () => void) {
  const down = useRef({ x: 0, y: 0 });
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  return {
    onPointerDown: (e: PointerEvent) => {
      down.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 10) return;
      const now = performance.now();
      const prev = lastTap.current;
      if (now - prev.t < 320 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 40) {
        lastTap.current.t = 0;
        onDoubleTap();
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
    },
  };
}

function relatedCards(card: KnowledgeCard, count = 3): KnowledgeCard[] {
  return LIBRARY.filter((c) => c.field === card.field && c.id !== card.id)
    .map((c) => ({ c, shared: c.tags.filter((t) => card.tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared || a.c.id.localeCompare(b.c.id))
    .slice(0, count)
    .map(({ c }) => c);
}

function formatDay(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** The "go deeper" sheet: the full explanation, every slide, tags, source and related pieces. */
export function LearnMore({ post, onClose }: { post: Post; onClose: () => void }) {
  const [current, setCurrent] = useState(post);
  const [, navigate] = useRoute();
  const bodyRef = useRef<HTMLDivElement>(null);

  const openTag = (tag: string) => {
    onClose();
    navigate({ tab: 'explore', q: `#${tag}`, post: null });
  };

  useEffect(() => bodyRef.current?.closest('.panel__body')?.scrollTo({ top: 0 }), [current]);

  if (current.kind === 'wiki') {
    return (
      <Sheet title={current.label} onClose={onClose}>
        <div ref={bodyRef} className="learn">
          <p className="learn__meta">
            Wikipedia · {current.label} · {formatDay(current.date)}
          </p>
          <h3 className="learn__title">{current.title}</h3>
          <p className="learn__body">{current.body}</p>
          {current.image?.credit && <p className="learn__credit">Image: {current.image.credit}</p>}
          <a className="btn btn--primary" href={current.source.url} target="_blank" rel="noreferrer">
            Read on {current.source.label.startsWith('Wikipedia') ? 'Wikipedia' : 'Wikimedia Commons'}{' '}
            <ExternalLink size={16} />
          </a>
        </div>
      </Sheet>
    );
  }

  const { card } = current;
  const field = FIELD_BY_ID[card.field];
  return (
    <Sheet title="Go deeper" onClose={onClose}>
      <div ref={bodyRef} className="learn">
        <p className="learn__meta">
          {field.emoji} {field.name} · {readSeconds(cardText(card))} s read
        </p>
        <h3 className="learn__title">{card.title}</h3>
        <p className="learn__body">{inline(card.body)}</p>
        {card.slides && (
          <ol className="learn__slides">
            {card.slides.map((s, i) => (
              <li key={i}>
                {'heading' in s && s.heading && <strong>{s.heading}</strong>}
                {s.type === 'image' ? (
                  <figure className="learn__figure">
                    <img src={s.src} alt={s.alt} loading="lazy" />
                    {(s.caption || s.credit) && (
                      <figcaption>{[s.caption, s.credit && `📷 ${s.credit}`].filter(Boolean).join(' · ')}</figcaption>
                    )}
                  </figure>
                ) : (
                  <span>{slideDetail(s)}</span>
                )}
              </li>
            ))}
          </ol>
        )}
        {card.author && (
          <p className="learn__author">
            {card.author.kind === 'ai' ? 'AI-written' : 'Written'} by {card.author.name}
            {card.author.model ? ` (${card.author.model})` : ''}
            {card.createdAt ? ` · ${formatDay(card.createdAt)}` : ''}
          </p>
        )}
        <div className="learn__tags">
          {card.tags.map((t) => (
            <button key={t} className="chip" onClick={() => openTag(t)}>
              #{t}
            </button>
          ))}
        </div>
        <a className="btn btn--primary" href={card.source.url} target="_blank" rel="noreferrer">
          Source: {card.source.label} <ExternalLink size={16} />
        </a>
        <h4 className="learn__subhead">More from {field.name}</h4>
        <ul className="learn__related">
          {relatedCards(card).map((c) => (
            <li key={c.id}>
              <button onClick={() => setCurrent({ kind: 'card', key: c.id, card: c })}>
                <span className="learn__related-emoji" aria-hidden="true">
                  {c.emoji}
                </span>
                <span>{c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

function Caption({ handle, text, onMore }: { handle: string; text: string; onMore: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="caption">
      <p className={`caption__text${expanded ? '' : ' caption__text--clamped'}`}>
        <strong>{handle}</strong> {inline(text)}
      </p>
      {!expanded ? (
        <button className="link-btn" onClick={() => setExpanded(true)}>
          more
        </button>
      ) : (
        <button className="link-btn" onClick={onMore}>
          Go deeper
        </button>
      )}
    </div>
  );
}

interface PostViewProps {
  post: Post;
  /** Extra class names, e.g. for posts shown inside an overlay. */
  className?: string;
}

export function PostView({ post, className }: PostViewProps) {
  const id = postId(post);
  const { state, toggleLike, like, toggleSave } = useStore();
  const [, navigate] = useRoute();
  const ref = useSeen(id);
  const [burst, setBurst] = useState(0);
  const [slide, setSlide] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const liked = id in state.liked;
  const saved = id in state.saved;
  const doubleTap = useDoubleTap(() => {
    like(id);
    setBurst((n) => n + 1);
  });

  const card = post.kind === 'card' ? post.card : null;
  const wiki: WikiPost | null = post.kind === 'wiki' ? post : null;
  const field = card ? FIELD_BY_ID[card.field] : null;
  const handle = field ? field.handle : 'wikipedia.featured';
  const slideCount = 1 + (card?.slides?.length ?? 0);
  const group = card ? authorGroup(card) : null;
  const badge = group && badgeLabel(group);

  return (
    <article ref={ref} className={`post${className ? ` ${className}` : ''}`} aria-label={card?.title ?? wiki!.title}>
      <header className="post__head">
        <Avatar emoji={field?.emoji} gradient={field?.gradient} wiki={!!wiki} size={34} ring="new" />
        <div className="post__who">
          <span className="post__handle">
            {handle}
            {group && badge && (
              <button
                className={`badge badge--${group.id}`}
                onClick={() => navigate({ tab: 'explore', by: group.id, q: '', post: null })}
                title={`Written by ${card!.author!.name}. Show all posts by ${group.label}`}
                aria-label={`Written by ${group.label}. Show all their posts`}
              >
                {badge}
              </button>
            )}
          </span>
          <span className="post__sub">
            {field ? `${field.name} · ${readSeconds(cardText(card!))} s read` : `${wiki!.label} · ${formatDay(wiki!.date)}`}
          </span>
        </div>
        <button className="icon-btn" onClick={() => setShowMore(true)} aria-label="More about this post">
          <Ellipsis size={22} />
        </button>
      </header>

      <div className="post__media" {...doubleTap}>
        {card ? <CardMedia card={card} onIndexChange={setSlide} /> : <WikiMedia post={wiki!} />}
        {burst > 0 && (
          <span key={burst} className="heart-burst" aria-hidden="true">
            <Heart size={96} fill="currentColor" strokeWidth={0} />
          </span>
        )}
      </div>

      <div className="post__actions">
        <div className="post__actions-left">
          <button
            className={`icon-btn${liked ? ' icon-btn--liked' : ''}`}
            onClick={() => toggleLike(id)}
            aria-label={liked ? 'Unlike' : 'Like'}
            aria-pressed={liked}
          >
            <Heart size={26} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-btn" onClick={() => setShowMore(true)} aria-label="Go deeper">
            <MessageCircle size={26} style={{ transform: 'scaleX(-1)' }} />
          </button>
          <button className="icon-btn" onClick={() => sharePost(post)} aria-label="Share">
            <Send size={24} />
          </button>
        </div>
        {slideCount > 1 && (
          <div className="dots" aria-hidden="true">
            {Array.from({ length: slideCount }, (_, i) => (
              <span key={i} className={`dots__dot${i === slide ? ' dots__dot--on' : ''}`} />
            ))}
          </div>
        )}
        <button
          className="icon-btn post__save"
          onClick={() => toggleSave(post)}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
        >
          <Bookmark size={26} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="post__text">
        {liked && <p className="post__likes">Liked by you</p>}
        <Caption handle={handle} text={(card ?? wiki!).body} onMore={() => setShowMore(true)} />
        {card && (
          <p className="post__tags">
            {card.tags.map((t) => (
              <button key={t} className="tag" onClick={() => navigate({ tab: 'explore', q: `#${t}`, post: null })}>
                #{t}
              </button>
            ))}
          </p>
        )}
        <a className="post__source" href={(card ?? wiki!).source.url} target="_blank" rel="noreferrer">
          {(card ?? wiki!).source.label} <ExternalLink size={12} />
        </a>
      </div>

      {showMore && <LearnMore post={post} onClose={() => setShowMore(false)} />}
    </article>
  );
}
