import { useState } from 'react';
import { Btn, C, Choice, label, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const RANGES = [100, 1000, 1000000];
/** Guesses that always suffice when every guess halves what's left: the smallest k with 2^k > n. */
export const enough = (n: number) => Math.ceil(Math.log2(n + 1));

export default function BinarySearch({ onDone }: LabProps) {
  const [max, setMax] = useState(1000000);
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * 1000000));
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(1000000);
  const [entry, setEntry] = useState('');
  const [log, setLog] = useState<{ n: number; say: 'higher' | 'lower' | 'got' }[]>([]);
  const found = log.some((g) => g.say === 'got');
  useGoal(found && log.length <= enough(max), onDone);

  const restart = (m: number) => {
    setMax(m);
    setSecret(1 + Math.floor(Math.random() * m));
    setLo(1);
    setHi(m);
    setEntry('');
    setLog([]);
  };
  const guess = (n: number) => {
    if (found || !Number.isInteger(n) || n < 1 || n > max) return;
    const say = n === secret ? 'got' : n < secret ? 'higher' : 'lower';
    setLog((l) => [...l, { n, say }]);
    if (say === 'higher') setLo((v) => Math.max(v, n + 1));
    if (say === 'lower') setHi((v) => Math.min(v, n - 1));
    setEntry('');
  };
  const middle = Math.floor((lo + hi) / 2);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, X = (v: number) => L + ((v - 1) / (max - 1)) * (R - L), y = h * 0.42;
    ctx.fillStyle = C.line;
    ctx.fillRect(L, y - 6, R - L, 12);
    ctx.fillStyle = C.accent;
    ctx.fillRect(X(lo), y - 6, Math.max(2, X(hi) - X(lo)), 12);
    log.forEach((g, i) => {
      const x = X(g.n);
      ctx.fillStyle = g.say === 'got' ? C.good : C.ink;
      ctx.fillRect(x - 1, y - 12, 2, 24);
      if (i === log.length - 1) label(ctx, formatNumber(g.n), x, y - 20, { size: 11, color: C.ink });
    });
    label(ctx, '1', L, y + 22, { size: 11, align: 'left' });
    label(ctx, formatNumber(max), R, y + 22, { size: 11, align: 'right' });
    const left = Math.max(0, hi - lo + 1);
    label(ctx, found ? t('Found it!') : t('Still possible: {n} numbers', { n: formatNumber(left) }), w / 2, h - 16, { size: 13, color: found ? C.good : C.soft });
  };

  const last = log[log.length - 1];
  return (
    <div className="lab">
      <Choice label={t('Range')} value={max} onChange={restart} options={RANGES.map((m) => ({ value: m, label: t('1 to {n}', { n: formatNumber(m) }) }))} />
      <Stage draw={draw} label={t('The numbers still possible, shrinking with each guess')} className="lab__stage--short" />
      <div className="lab__row">
        <input
          className="lab__number"
          inputMode="numeric"
          value={entry}
          onChange={(e) => setEntry(e.target.value.replace(/\D/g, '').slice(0, 7))}
          onKeyDown={(e) => e.key === 'Enter' && guess(Number(entry))}
          aria-label={t('Your guess')}
          placeholder={t('Your guess')}
          disabled={found}
        />
        <Btn onClick={() => guess(Number(entry))} disabled={found || !entry}>
          {t('Guess')}
        </Btn>
        <Btn ghost onClick={() => setEntry(String(middle))} disabled={found}>
          {t('Middle: {n}', { n: formatNumber(middle) })}
        </Btn>
      </div>
      <p className="lab__note" aria-live="polite">
        {!last && t('I’m thinking of a number. You get “higher” or “lower” after each guess.')}
        {last && last.say !== 'got' && (last.say === 'higher' ? t('Guess {k}: {n} is too low. Higher!', { k: log.length, n: formatNumber(last.n) }) : t('Guess {k}: {n} is too high. Lower!', { k: log.length, n: formatNumber(last.n) }))}
        {found && t('Got it in {k} guesses. Halving every time never needs more than {m}.', { k: log.length, m: enough(max) })}
      </p>
      {found && (
        <Btn ghost onClick={() => restart(max)}>
          {t('New number')}
        </Btn>
      )}
    </div>
  );
}
