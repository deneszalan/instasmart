import { useState } from 'react';
import { Clapperboard, Play } from 'lucide-react';
import { FIELD_BY_ID } from '../data/fields';
import { FILM_FIELDS, filmFor, FilmPlayer, type Film } from '../components/Film';
import { EDITION } from '../edition';
import { LANG, t } from '../i18n';

/** The long films, one per section (`films` in shared/editions.ts), opened from the top bar. */
export function Films() {
  const [playing, setPlaying] = useState<Film | null>(null);
  // The films there are first; the sections still waiting for theirs follow in a short list.
  const ready = FILM_FIELDS.filter((field) => filmFor(field));
  const soon = FILM_FIELDS.filter((field) => !filmFor(field));
  return (
    <div className="films">
      <h1 className="view-title">{t('The films')}</h1>
      <p className="films__intro">{t('One long film for each section, 5 to 10 minutes.')}</p>
      <ul className="films__list">
        {[...ready, ...soon].map((field) => {
          const film = filmFor(field);
          const { emoji, name } = FIELD_BY_ID[field];
          const title = film?.title ?? EDITION.langs?.[LANG]?.films?.[field] ?? EDITION.films?.[field];
          const text = (
            <span className="film-card__text">
              <span className="film-card__field">
                <span aria-hidden="true">{emoji}</span> {name}
              </span>
              <span className="film-card__title">{title}</span>
              {film && film.lang !== LANG && film.lang === 'en' && <span className="film-card__note">{t('English version')}</span>}
            </span>
          );
          return (
            <li key={field}>
              {film ? (
                <button className="film-card" onClick={() => setPlaying(film)}>
                  <span className="film-card__poster">
                    {film.poster && <img src={film.poster} alt="" loading="lazy" />}
                    <span className="film-card__len">
                      <Play size={13} fill="currentColor" aria-hidden="true" />
                      {film.seconds ? t('{n} min', { n: Math.round(film.seconds / 60) }) : null}
                    </span>
                  </span>
                  {text}
                </button>
              ) : (
                <div className="film-card film-card--soon">
                  <span className="film-card__icon" aria-hidden="true">
                    <Clapperboard size={22} />
                  </span>
                  {text}
                  <span className="film-card__soon">{t('Coming soon')}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {playing && <FilmPlayer film={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
