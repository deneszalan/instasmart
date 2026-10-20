import { LIBRARY } from '../data/library';
import { authorFilters } from '../lib/authors';
import { t } from '../i18n';

export const WRITERS = authorFilters(LIBRARY);

interface WriterChipsProps {
  /** Selected author group id, or "" for everyone. */
  value: string;
  onChange: (id: string) => void;
}

/** The "Written by" slicer shared by the feed and Explore. */
export function WriterChips({ value, onChange }: WriterChipsProps) {
  // A library by a single writer has nothing to filter (unless a filter is already set and needs clearing).
  if (!value && WRITERS.filter((w) => w.count > 0).length < 2) return null;
  return (
    <div className="chips chips--authors" role="group" aria-label={t('Written by')}>
      <span className="chips__label">{t('Written by')}</span>
      <button aria-pressed={!value} className="chip" onClick={() => onChange('')}>
        {t('Anyone')}
      </button>
      {WRITERS.map((w) => (
        <button key={w.id} aria-pressed={value === w.id} className="chip" onClick={() => onChange(w.id)}>
          {w.label} <span className="chip__count">{w.count}</span>
        </button>
      ))}
    </div>
  );
}
