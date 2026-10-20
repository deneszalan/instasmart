import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { lockScroll } from '../lib/scrollLock';
import { t } from '../i18n';

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** 'sheet' slides up from the bottom; 'dialog' is a centred panel. */
  variant?: 'sheet' | 'dialog';
}

/** Modal overlay closed by Escape, the close button, or a click on the backdrop. */
export function Sheet({ title, onClose, children, variant = 'sheet' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Overlays are appended to <body> in opening order; only the top one closes.
      const overlays = document.querySelectorAll('.overlay');
      if (overlays[overlays.length - 1] === panelRef.current?.parentElement) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const unlock = lockScroll();
    return () => {
      document.removeEventListener('keydown', onKey);
      unlock();
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className={`overlay overlay--${variant}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={`panel panel--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="panel__bar">
          {variant === 'sheet' && <span className="panel__grip" aria-hidden="true" />}
          <h2 className="panel__title">{title}</h2>
          <button className="icon-btn panel__close" onClick={onClose} aria-label={t('Close')}>
            <X size={22} />
          </button>
        </div>
        <div className="panel__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
