import { useEffect, useMemo, useRef, useState } from 'react';
import { WifiOff } from 'lucide-react';
import type { KnowledgeCard } from '../types';
import { ALL_CARDS } from '../data/library';
import { OFFLINE_ONLY } from '../data/offline-set';
import { formatFixed } from '../lib/format';
import { bytesOf, keepOffline, newest, removeOffline, savedPosts, setOfflineOnly, type Progress } from '../lib/offline';
import { t } from '../i18n';
import { EDITION } from '../edition';

const megabytes = (bytes: number) => `${formatFixed(Math.max(1, Math.round(bytes / 1e6)), 0)} MB`;

/** iPhone and iPad keep a site's saved files for good only when it is opened from the Home Screen. */
const IOS = typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const STANDALONE =
  typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);

const total = ALL_CARDS.length;
/** A small app is saved whole; a big one starts with its newest 25. */
const DEFAULT = total <= 50 ? total : 25;

/**
 * Settings' "Use without internet": the reader picks how many of the newest posts to keep on the device, sees about how
 * much that is, saves them, and can switch to offline mode, where only those posts show.
 */
export function OfflineSave() {
  const [saved, setSaved] = useState<KnowledgeCard[] | null>(null);
  const [count, setCount] = useState(DEFAULT);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');
  const stop = useRef<AbortController | null>(null);

  useEffect(() => {
    void savedPosts().then((posts) => {
      setSaved(posts);
      if (posts.length > 0) setCount(posts.length);
    });
    return () => stop.current?.abort();
  }, []);

  const chosen = useMemo(() => newest(count), [count]);
  const size = useMemo(() => bytesOf(chosen), [chosen]);
  const savedIds = new Set((saved ?? []).map((c) => c.id));
  const upToDate = saved !== null && saved.length === chosen.length && chosen.every((c) => savedIds.has(c.id));

  const save = async () => {
    setError('');
    stop.current = new AbortController();
    try {
      await keepOffline(chosen, setProgress, stop.current.signal);
    } catch (e) {
      const name = (e as Error).name;
      if (name === 'QuotaExceededError') setError(t('There isn’t enough free space on this device. Free some up and try again.'));
      else if (name !== 'AbortError') setError(t('Saving stopped because the connection dropped. Try again on a good connection: it carries on where it stopped.'));
    } finally {
      stop.current = null;
      setProgress(null);
      setSaved(await savedPosts());
    }
  };

  const remove = async () => {
    if (!confirm(t('Remove the saved posts from this device?'))) return;
    await removeOffline();
    if (OFFLINE_ONLY) location.reload();
    else setSaved([]);
  };

  const savedSize = saved ? bytesOf(saved) : 0;
  const status =
    saved === null
      ? t('Checking what’s saved on this device…')
      : progress
        ? t('Saving… {done} of {total}', { done: megabytes(progress.done), total: megabytes(progress.total) })
        : saved.length === 0
          ? t('Nothing is saved on this device yet.')
          : t(saved.length === 1 ? 'Saved on this device: 1 post ({size}).' : 'Saved on this device: {n} posts ({size}).', { n: saved.length, size: megabytes(savedSize) });

  return (
    <section className="card-box offline">
      <h2 className="section-title">
        <WifiOff size={18} /> {t('Use without internet')}
      </h2>
      <label className="offline__pick">
        <span className="offline__pick-label">
          {count === total
            ? t('All {n} posts · about {size}', { n: total, size: megabytes(size) })
            : t(count === 1 ? 'The newest post · about {size}' : 'The {n} newest posts · about {size}', { n: count, size: megabytes(size) })}
        </span>
        <input
          type="range"
          min={1}
          max={total}
          value={count}
          disabled={!!progress}
          onChange={(e) => setCount(Number(e.target.value))}
          aria-label={t('How many posts to save')}
        />
      </label>
      <p className="offline__text" aria-live="polite">
        {status}
      </p>
      {progress && <progress className="offline__bar" max={progress.total} value={progress.done} />}
      {error && <p className="offline__error">{error}</p>}
      <div className="offline__actions">
        {progress ? (
          <button className="btn" onClick={() => stop.current?.abort()}>
            {t('Stop')}
          </button>
        ) : (
          <button className="btn btn--primary" disabled={saved === null || upToDate} onClick={() => void save()}>
            {upToDate ? t('Saved') : t(count === 1 ? 'Save 1 post' : 'Save {n} posts', { n: count })}
          </button>
        )}
        {!progress && saved !== null && saved.length > 0 && (
          <button className="btn" onClick={() => void remove()}>
            {t('Remove saved posts')}
          </button>
        )}
      </div>
      <label className="setting offline__mode">
        <span>
          <span className="setting__name">{t('Offline mode')}</span>
          <span className="setting__sub">{t('Show only the saved posts, so everything you open works without internet.')}</span>
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={OFFLINE_ONLY}
          disabled={!OFFLINE_ONLY && (saved === null || saved.length === 0 || !!progress)}
          onChange={(e) => setOfflineOnly(e.target.checked)}
        />
      </label>
      {IOS && !STANDALONE && (
        <p className="offline__tip">
          {t('On iPhone or iPad, first add {name} to your Home Screen (Share, then Add to Home Screen) and save from there: iOS keeps saved posts only for Home Screen apps.', {
            name: EDITION.name,
          })}
        </p>
      )}
    </section>
  );
}
