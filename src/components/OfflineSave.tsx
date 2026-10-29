import { useEffect, useMemo, useRef, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { LIBRARY } from '../data/library';
import { formatFixed } from '../lib/format';
import { offlineFiles, offlineStatus, removeOffline, saveOffline, type OfflineStatus } from '../lib/offline';
import { t } from '../i18n';
import { EDITION } from '../edition';

const megabytes = (bytes: number) => `${formatFixed(bytes / 1e6, 0)} MB`;

/** iPhone and iPad keep a site's saved files for good only when it is opened from the Home Screen. */
const IOS = typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const STANDALONE =
  typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);

/** Settings' "Use without internet": saves every post's pictures and clips on the device, in the reader's language. */
export function OfflineSave() {
  const files = useMemo(() => offlineFiles(), []);
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const stop = useRef<AbortController | null>(null);

  useEffect(() => {
    void offlineStatus(files).then(setStatus);
    return () => stop.current?.abort();
  }, [files]);

  const save = async () => {
    setError('');
    setSaving(true);
    stop.current = new AbortController();
    try {
      setStatus(await saveOffline(files, setStatus, stop.current.signal));
    } catch (e) {
      const name = (e as Error).name;
      if (name === 'QuotaExceededError') setError(t('There isn’t enough free space on this device. Free some up and try again.'));
      else if (name !== 'AbortError') setError(t('Saving stopped because the connection dropped. Try again on a good connection: it carries on where it stopped.'));
      setStatus(await offlineStatus(files));
    } finally {
      setSaving(false);
      stop.current = null;
    }
  };

  const remove = async () => {
    if (!confirm(t('Remove the saved pictures and clips from this device?'))) return;
    await removeOffline();
    setStatus(await offlineStatus(files));
  };

  const all = status !== null && status.saved === status.total;
  const left = status ? status.totalBytes - status.savedBytes : 0;
  const text =
    status === null
      ? t('Checking what’s saved on this device…')
      : saving
        ? t('Saving… {done} of {total}', { done: megabytes(status.savedBytes), total: megabytes(status.totalBytes) })
        : all
          ? t('Saved on this device: all {n} posts work without internet, in the language you’ve chosen.', { n: LIBRARY.length })
          : status.saved === 0
            ? t('Save all {n} posts with their pictures and clips on this device ({size}), and {name} works with no internet, in the language you’ve chosen.', {
                n: LIBRARY.length,
                size: megabytes(status.totalBytes),
                name: EDITION.name,
              })
            : t('{size} still to save: new posts, or the clips in another language.', { size: megabytes(left) });

  return (
    <section className="card-box offline">
      <h2 className="section-title">
        <WifiOff size={18} /> {t('Use without internet')}
      </h2>
      <p className="offline__text" aria-live="polite">
        {text}
      </p>
      {saving && status && <progress className="offline__bar" max={status.totalBytes} value={status.savedBytes} />}
      {error && <p className="offline__error">{error}</p>}
      <div className="offline__actions">
        {saving ? (
          <button className="btn" onClick={() => stop.current?.abort()}>
            {t('Stop')}
          </button>
        ) : (
          status &&
          !all && (
            <button className="btn btn--primary" onClick={() => void save()}>
              {status.saved === 0 ? t('Save for offline') : t('Save the rest')}
            </button>
          )
        )}
        {!saving && status && status.saved > 0 && (
          <button className="btn" onClick={() => void remove()}>
            {t('Remove the saved copy')}
          </button>
        )}
      </div>
      {IOS && !STANDALONE && (
        <p className="offline__tip">
          {t('On iPhone or iPad, first add {name} to your Home Screen (Share, then Add to Home Screen) and save it from there: iOS keeps the saved copy only for Home Screen apps.', {
            name: EDITION.name,
          })}
        </p>
      )}
    </section>
  );
}
