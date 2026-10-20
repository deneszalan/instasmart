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
