import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clapperboard, X } from 'lucide-react';
import type { FieldId } from '../types';
import { clipSeconds, mediaUrl } from '../data/library';
import { EDITION } from '../edition';
import { LANG, t } from '../i18n';
import { lockScroll } from '../lib/scrollLock';

export interface Film {
  title: string;
  src: string;
  poster?: string;
  seconds?: number;
  /** The language of the film's voice and pictures. */
  lang: string;
}

/** A section's long film (`films` in shared/editions.ts), in the reader's language where it has one, else the app's own. */
export function filmFor(field: FieldId): Film | null {
  if (!EDITION.films?.[field]) return null;
  const pick = (ext: string) => (LANG !== EDITION.lang && mediaUrl('films', `${field}-${LANG}.${ext}`)) || mediaUrl('films', `${field}.${ext}`);
  const own = LANG !== EDITION.lang && mediaUrl('films', `${field}-${LANG}.mp4`);
  const src = own || mediaUrl('films', `${field}.mp4`);
  if (!src) return null;
  return {
    title: EDITION.langs?.[LANG]?.films?.[field] ?? EDITION.films[field]!,
    src,
    poster: own ? pick('jpg') : mediaUrl('films', `${field}.jpg`),
    seconds: clipSeconds(src),
    lang: own ? LANG : EDITION.lang,
  };
}

/** The sections that have a film title in shared/editions.ts, in the edition's order; some may not have the film yet. */
export const FILM_FIELDS: FieldId[] = EDITION.fields.filter((field) => EDITION.films?.[field]);
/** Whether the top bar offers the films page. */
export const HAS_FILMS = FILM_FIELDS.some((field) => filmFor(field));

/** "Watch the full story · 9 min" under a post whose section has a film; opens it full screen. */
export function FilmButton({ field }: { field: FieldId }) {
  const [open, setOpen] = useState(false);
  const film = filmFor(field);
  if (!film) return null;
  return (
    <>
      <button className="film-btn" onClick={() => setOpen(true)}>
        <Clapperboard size={16} aria-hidden />
        <span>
          {t('Watch the full story')}
          {film.seconds ? ` · ${t('{n} min', { n: Math.round(film.seconds / 60) })}` : ''}
        </span>
      </button>
      {open && <FilmPlayer film={film} onClose={() => setOpen(false)} />}
    </>
  );
}

export function FilmPlayer({ film, onClose }: { film: Film; onClose: () => void }) {
  useEffect(() => lockScroll(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div className="film" role="dialog" aria-modal="true" aria-label={film.title}>
      <div className="film__bar">
        <p className="film__title">{film.title}</p>
        <button className="icon-btn icon-btn--light" onClick={onClose} aria-label={t('Close the film')}>
          <X size={24} />
        </button>
      </div>
      <video className="film__video" src={film.src} poster={film.poster} controls autoPlay playsInline preload="metadata" />
      <p className="film__hint">{t('Turn your phone sideways for a bigger picture.')}</p>
    </div>,
    document.body,
  );
}
