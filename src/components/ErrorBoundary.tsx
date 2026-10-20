import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';
import { EDITION } from '../edition';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Reckon also clears where it saved progress under its old name.
const STORAGE_KEYS = EDITION.id === 'reckon' ? [EDITION.storageKey, 'instasmart:v1'] : [EDITION.storageKey];

/**
 * Catches rendering errors so a bug shows a message and a way back,
 * instead of an empty page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${EDITION.name} crashed:`, error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const reload = () => location.reload();
    const reset = () => {
      try {
        for (const key of STORAGE_KEYS) localStorage.removeItem(key);
      } catch {
        // Nothing to clear.
      }
      location.hash = '';
      location.reload();
    };

    return (
      <div className="crash" role="alert">
        <h1 className="crash__title">{t('Something went wrong')}</h1>
        <p className="crash__sub">{t('The page hit an error it couldn’t recover from. Reloading usually fixes it.')}</p>
        <pre className="crash__detail">
          {error.name}: {error.message}
        </pre>
        <div className="crash__actions">
          <button className="btn btn--primary" onClick={reload}>
            {t('Reload')}
          </button>
          <button className="btn btn--danger" onClick={reset}>
            {t('Clear saved progress and reload')}
          </button>
        </div>
        {EDITION.id === 'reckon' && (
          <p className="crash__hint">
            If it keeps happening, copy the message above into an issue at github.com/deneszalan/instasmart.
          </p>
        )}
      </div>
    );
  }
}
