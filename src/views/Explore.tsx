import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { FieldId } from '../types';
import { FIELDS } from '../data/fields';
import { LIBRARY } from '../data/library';
import { authorGroup } from '../lib/authors';
import { firstInteractive } from '../lib/interactive';
import { firstAnimation, firstFootage, firstVisual } from '../lib/visual';
import { createRng, searchCards, shuffle } from '../lib/feed';
import { Tile } from '../components/Tile';
import { WRITERS, WriterChips } from '../components/WriterChips';
import { t } from '../i18n';

interface ExploreProps {
  query: string;
  onQuery: (q: string) => void;
  /** Author group id from the "Written by" filter, or "" for anyone. */
  author: string;
  onAuthor: (id: string) => void;
  onOpen: (id: string) => void;
}

/** The kind filters this library has posts for; a filter that finds nothing isn't offered. */
const KINDS = {
  interactive: LIBRARY.some((c) => firstInteractive(c) >= 0),
  visual: LIBRARY.some((c) => firstVisual(c) >= 0),
  video: LIBRARY.some((c) => firstFootage(c) >= 0),
  animation: LIBRARY.some((c) => firstAnimation(c) >= 0),
};

/** Every 10 tiles, two are tall — the mosaic look of an explore grid. */
const isTall = (i: number) => i % 10 === 2 || i % 10 === 5;

export function Explore({ query, onQuery, author, onAuthor, onOpen }: ExploreProps) {
  const [field, setField] = useState<FieldId | 'all'>('all');
  const [interactiveOnly, setInteractiveOnly] = useState(false);
  const [visualOnly, setVisualOnly] = useState(false);
  const [videoOnly, setVideoOnly] = useState(false);
  const [animationOnly, setAnimationOnly] = useState(false);
  // A per-visit shuffle so the grid isn't grouped by field.
  const [order] = useState(() => shuffle(LIBRARY, createRng(Date.now())));

  const results = useMemo(() => {
    const filtered = order.filter(
      (c) =>
        (field === 'all' || c.field === field) &&
        (!author || authorGroup(c)?.id === author) &&
        (!interactiveOnly || firstInteractive(c) >= 0) &&
        (!visualOnly || firstVisual(c) >= 0) &&
        (!videoOnly || firstFootage(c) >= 0) &&
        (!animationOnly || firstAnimation(c) >= 0),
    );
    return searchCards(filtered, query);
  }, [order, field, author, query, interactiveOnly, visualOnly, videoOnly, animationOnly]);

  const authorLabel = WRITERS.find((w) => w.id === author)?.label;
  const fieldName = FIELDS.find((f) => f.id === field)?.name;

  return (
    <div className="explore">
      <div className="explore__top">
        <label className="search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder={t('Search topics, ideas or #tags')}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label={t('Search knowledge')}
          />
          {query && (
            <button className="search__clear" onClick={() => onQuery('')} aria-label={t('Clear search')}>
              <X size={16} />
            </button>
          )}
        </label>
        <div className="chips" role="group" aria-label={t('Fields')}>
          <button aria-pressed={field === 'all'} className="chip" onClick={() => setField('all')}>
            {t('All')}
          </button>
          {KINDS.interactive && (
            <button aria-pressed={interactiveOnly} className="chip" onClick={() => setInteractiveOnly((v) => !v)}>
              🎯 {t('Interactive')}
            </button>
          )}
          {KINDS.visual && (
            <button aria-pressed={visualOnly} className="chip" onClick={() => setVisualOnly((v) => !v)}>
              📊 {t('Visual')}
            </button>
          )}
          {KINDS.video && (
            <button aria-pressed={videoOnly} className="chip" onClick={() => setVideoOnly((v) => !v)}>
              🎬 {t('Video')}
            </button>
          )}
          {KINDS.animation && (
            <button aria-pressed={animationOnly} className="chip" onClick={() => setAnimationOnly((v) => !v)}>
              ✨ {t('Animation')}
            </button>
          )}
          {FIELDS.map((f) => (
            <button key={f.id} aria-pressed={field === f.id} className="chip" onClick={() => setField(f.id)}>
              {f.emoji} {f.name}
            </button>
          ))}
        </div>
        <WriterChips value={author} onChange={onAuthor} />
      </div>

      <p className="explore__count">
        {results.length === LIBRARY.length
          ? t('{n} pieces to discover', { n: results.length })
          : t('{n} of {total} pieces', { n: results.length, total: LIBRARY.length })}
      </p>

      {results.length === 0 ? (
        <div className="empty">
          {authorLabel && !query ? (
            <>
              <p className="empty__title">
                {fieldName
                  ? t('No posts by {writer} in {field} yet', { writer: authorLabel, field: fieldName })
                  : t('No posts by {writer} yet', { writer: authorLabel })}
              </p>
              <p className="empty__sub">{t('They’ll show up here as soon as they’re added to the library.')}</p>
            </>
          ) : (
            <>
              <p className="empty__title">{t('Nothing found')}</p>
              <p className="empty__sub">{t('Try another word, or change the filters.')}</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid">
          {results.map((card, i) => (
            <Tile
              key={card.id}
              post={{ kind: 'card', key: card.id, card }}
              tall={!query && isTall(i)}
              onOpen={() => onOpen(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
