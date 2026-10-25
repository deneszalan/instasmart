import { useMemo, useState } from 'react';
import { Btn, C, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** One round of Kaprekar's routine on a four-digit number, keeping leading zeros. */
export function kaprekarStep(n: number): { big: string; small: string; next: number } {
  const digits = String(n).padStart(4, '0').split('').sort();
  const small = digits.join(''), big = [...digits].reverse().join('');
  return { big, small, next: Number(big) - Number(small) };
}

/** Rounds from n to 6174 (0 for 6174 itself). */
export function stepsTo6174(n: number): number {
  let k = 0;
  while (n !== 6174) {
    n = kaprekarStep(n).next;
    k++;
  }
  return k;
}

const repdigit = (s: string) => /^(\d)\1{3}$/.test(s);

export default function Kaprekar({ onDone }: LabProps) {
  const [entry, setEntry] = useState('3524');
  const [path, setPath] = useState<number[]>([3524]);
  const valid = /^\d{4}$/.test(entry) && Number(entry) >= 1000 && !repdigit(entry);
  const reached = path[path.length - 1] === 6174 && path.length > 1;
  useGoal(reached && path[0] !== 3524, onDone);

  // How many numbers from 1000 to 9999 (digits not all the same) need each number of rounds.
  const histogram = useMemo(() => {
    const counts = Array<number>(8).fill(0);
    for (let n = 1000; n <= 9999; n++) if (!repdigit(String(n))) counts[stepsTo6174(n)]++;
    return counts;
  }, []);

  const start = (s: string) => {
    setEntry(s);
    if (/^\d{4}$/.test(s) && Number(s) >= 1000 && !repdigit(s)) setPath([Number(s)]);
  };
  const step = () => setPath((p) => (p[p.length - 1] === 6174 && p.length > 1 ? p : [...p, kaprekarStep(p[p.length - 1]).next]));
  const random = () => {
    let s;
    do s = String(1000 + Math.floor(Math.random() * 9000));
    while (repdigit(s));
    start(s);
  };

  const steps = valid ? stepsTo6174(Number(entry)) : -1;
  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const max = Math.max(...histogram), bw = (w - 40) / 8, base = h - 18;
    label(ctx, t('Rounds needed, for all 8,991 starting numbers'), w / 2, 10, { size: 11 });
    histogram.forEach((c, k) => {
      const bh = (c / max) * (base - 34), x = 20 + k * bw;
      ctx.fillStyle = k === steps ? C.accent : C.faint;
      ctx.fillRect(x + 3, base - bh, bw - 6, bh);
      label(ctx, String(k), x + bw / 2, base + 9, { size: 11, color: k === steps ? C.accent : C.soft });
      label(ctx, String(c), x + bw / 2, base - bh - 8, { size: 9.5 });
    });
  };

  return (
    <div className="lab">
      <div className="lab__row">
        <input
          className="lab__digits"
          inputMode="numeric"
          maxLength={4}
          value={entry}
          onChange={(e) => start(e.target.value.replace(/\D/g, '').slice(0, 4))}
          aria-label={t('Your four-digit number')}
        />
        <Btn onClick={step} disabled={!valid || reached}>
          {t('Next round')}
        </Btn>
        <Btn ghost onClick={random}>
          {t('Random')}
        </Btn>
      </div>
      <ol className="kaprekar__path" aria-live="polite">
        {!valid && <li className="kaprekar__hint">{t('Type four digits from 1000 to 9999, not all the same.')}</li>}
        {valid &&
          path.slice(0, -1).map((n, i) => {
            const s = kaprekarStep(n);
            return (
              <li key={i}>
                {s.big} − {s.small} = <strong className={s.next === 6174 ? 'kaprekar__hit' : ''}>{String(s.next).padStart(4, '0')}</strong>
              </li>
            );
          })}
        {valid && path.length === 1 && <li className="kaprekar__hint">{t('Start: {n}. Tap Next round.', { n: entry })}</li>}
        {valid && reached && <li className="kaprekar__done">{t('6174 in {n} rounds. It stays there: 7641 − 1467 = 6174.', { n: path.length - 1 })}</li>}
      </ol>
      <Stage draw={draw} label={t('Bar chart of how many rounds each starting number needs')} className="lab__stage--short" />
    </div>
  );
}
