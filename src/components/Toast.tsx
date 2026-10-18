import { useEffect, useState } from 'react';
import { onToast } from '../lib/toast';

export function Toast() {
  const [message, setMessage] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => onToast((text) => setMessage({ text, id: Date.now() })), []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message && (
        <div key={message.id} className="toast">
          {message.text}
        </div>
      )}
    </div>
  );
}
