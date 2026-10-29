import type { SortOrder } from '../lib/feed';
import { useStore } from '../state/store';
import { t } from '../i18n';

const SORTS: { id: SortOrder; label: string }[] = [
  { id: 'mix', label: t('Mixed') },
  { id: 'newest', label: t('Newest') },
  { id: 'oldest', label: t('Oldest') },
];

/** A sort order the reader picks and the app remembers: by default the one the feed and Explore share, or News's own. */
export function SortChips({ setting = 'sort' }: { setting?: 'sort' | 'newsSort' }) {
  const { state, updateSettings } = useStore();
  return (
    <div className="chips chips--sort" role="group" aria-label={t('Sort')}>
      <span className="chips__label">{t('Sort')}</span>
      {SORTS.map((s) => (
        <button key={s.id} aria-pressed={state.settings[setting] === s.id} className="chip" onClick={() => updateSettings({ [setting]: s.id })}>
          {s.label}
        </button>
      ))}
    </div>
  );
}
