import type { SortOrder } from '../lib/feed';
import { useStore } from '../state/store';
import { t } from '../i18n';

const SORTS: { id: SortOrder; label: string }[] = [
  { id: 'mix', label: t('Mixed') },
  { id: 'newest', label: t('Newest') },
  { id: 'oldest', label: t('Oldest') },
];

/** The sort order shared by the feed and Explore; the choice is remembered. */
export function SortChips() {
  const { state, updateSettings } = useStore();
  return (
    <div className="chips chips--sort" role="group" aria-label={t('Sort')}>
      <span className="chips__label">{t('Sort')}</span>
      {SORTS.map((s) => (
        <button key={s.id} aria-pressed={state.settings.sort === s.id} className="chip" onClick={() => updateSettings({ sort: s.id })}>
          {s.label}
        </button>
      ))}
    </div>
  );
}
