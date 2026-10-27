import { Flame, Monitor, Moon, Sun } from 'lucide-react';
import { FIELDS } from '../data/fields';
import { LIBRARY } from '../data/library';
import { streak, useStore, type Theme } from '../state/store';
import { Avatar } from '../components/Avatar';
import { LANG, LANG_NAMES, LANGS, setLang, t } from '../i18n';
import { EDITION } from '../edition';

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'system', label: t('Auto'), icon: Monitor },
  { id: 'light', label: t('Light'), icon: Sun },
  { id: 'dark', label: t('Dark'), icon: Moon },
];

export function Profile() {
  const { state, updateSettings, reset } = useStore();
  const seenIds = new Set(Object.keys(state.seen));
  const learned = LIBRARY.filter((c) => seenIds.has(c.id)).length;
  const days = streak(state.activeDays);
  const pct = Math.round((learned / LIBRARY.length) * 100);
  const results = Object.values(state.challenges);
  const scored = results.filter((r) => r.correct !== null);
  const right = scored.filter((r) => r.correct).length;

  const perField = FIELDS.map((f) => {
    const cards = LIBRARY.filter((c) => c.field === f.id);
    return { field: f, total: cards.length, seen: cards.filter((c) => seenIds.has(c.id)).length };
  })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.seen / b.total - a.seen / a.total);

  return (
    <div className="profile">
      <section className="profile__head">
        <Avatar emoji="🧠" gradient={['#f59e0b', '#7c3aed']} size={84} ring="new" />
        <div className="profile__stats">
          <div>
            <strong>{learned}</strong>
            <span>{t('learned')}</span>
          </div>
          <div>
            <strong>{Object.keys(state.liked).length}</strong>
            <span>{t('liked')}</span>
          </div>
          <div>
            <strong>{Object.keys(state.saved).length}</strong>
            <span>{t('saved')}</span>
          </div>
        </div>
      </section>

      <section className="profile__bio">
        <h1>{t('You')}</h1>
        <p>{t('Curious mind. Collecting ideas from {n} fields, one scroll at a time.', { n: FIELDS.length })}</p>
      </section>

      <section className="card-box streak">
        <Flame size={28} className={days > 0 ? 'streak__flame streak__flame--on' : 'streak__flame'} />
        <div>
          <p className="streak__title">
            {days > 0 ? t(days === 1 ? '1-day learning streak' : '{n}-day learning streak', { n: days }) : t('Start a streak today')}
          </p>
          <p className="streak__sub">{t('Read at least one piece a day to keep it going.')}</p>
        </div>
      </section>

      <section className="card-box">
        <div className="progress-row">
          <span>{t('Challenges')}</span>
          <span>
            {t('{n} played', { n: results.length })}
            {scored.length ? t(' · {right}/{total} right', { right, total: scored.length }) : ''}
          </span>
        </div>
        <p className="streak__sub">{t('Quizzes, guesses and ordering puzzles inside posts.')}</p>
      </section>

      <section className="card-box">
        <div className="progress-row">
          <span>{t('Library explored')}</span>
          <span>
            {learned}/{LIBRARY.length} · {pct}%
          </span>
        </div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="card-box">
        <h2 className="section-title">{t('Fields')}</h2>
        <ul className="fields">
          {perField.map(({ field, total, seen }) => (
            <li key={field.id} className="fields__row">
              <span className="fields__emoji" aria-hidden="true">
                {field.emoji}
              </span>
              <span className="fields__name">{field.name}</span>
              <span className="fields__bar bar">
                <span
                  style={{
                    width: `${(seen / total) * 100}%`,
                    background: `linear-gradient(90deg, ${field.gradient[0]}, ${field.gradient[1]})`,
                  }}
                />
              </span>
              <span className="fields__count">
                {seen}/{total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-box">
        <h2 className="section-title">{t('Settings')}</h2>
        {EDITION.wiki && (
          <label className="setting">
            <span>
              <span className="setting__name">Live posts from Wikipedia</span>
              <span className="setting__sub">Mix featured articles and pictures of the day into your feed.</span>
            </span>
            <input
              type="checkbox"
              className="switch"
              checked={state.settings.wiki}
              onChange={(e) => updateSettings({ wiki: e.target.checked })}
            />
          </label>
        )}
        {LANGS.length > 1 && (
          <div className="setting">
            <span className="setting__name">{t('Language')}</span>
            <div className="segmented" role="radiogroup" aria-label={t('Language')}>
              {LANGS.map((lang) => (
                <button key={lang} role="radio" lang={lang} aria-checked={LANG === lang} onClick={() => lang !== LANG && setLang(lang)}>
                  {LANG_NAMES[lang]}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="setting">
          <span className="setting__name">{t('Theme')}</span>
          <div className="segmented" role="radiogroup" aria-label={t('Theme')}>
            {THEMES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="radio"
                aria-checked={state.settings.theme === id}
                onClick={() => updateSettings({ theme: id })}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn btn--danger"
          onClick={() => {
            if (confirm(t('Reset your likes, saved posts, streak and reading history?'))) reset();
          }}
        >
          {t('Reset progress')}
        </button>
      </section>

      <p className="about">{EDITION.langs?.[LANG]?.about ?? EDITION.about}</p>
    </div>
  );
}
