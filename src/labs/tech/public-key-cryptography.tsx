import { useMemo, useState } from 'react';
import { Btn, Choice, Range, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

const PRIMES = [23, 101, 1009];

/** base^exp mod m, by repeated squaring. */
export function powMod(base: number, exp: number, m: number): number {
  let result = 1, b = base % m, e = exp;
  while (e > 0) {
    if (e & 1) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1;
  }
  return result;
}

/** The smallest generator of the prime p: every remainder 1 … p − 1 is one of its powers. */
export function generator(p: number): number {
  for (let g = 2; g < p; g++) {
    const seen = new Set<number>();
    for (let k = 1; k < p; k++) seen.add(powMod(g, k, p));
    if (seen.size === p - 1) return g;
  }
  return 2;
}

export default function PublicKey({ onDone }: LabProps) {
  const [p, setP] = useState(23);
  const g = useMemo(() => generator(p), [p]);
  const [a, setA] = useState(3);
  const [b, setB] = useState(7);
  const [eve, setEve] = useState(1);
  const A = powMod(g, a, p), B = powMod(g, b, p), keyA = powMod(B, a, p), keyB = powMod(A, b, p), eveSees = powMod(g, eve, p);
  const cracked = eveSees === A;
  useGoal(cracked, onDone);

  const choose = (q: number) => {
    setP(q);
    setA(Math.min(a, q - 2));
    setB(Math.min(b, q - 2));
    setEve(1);
  };
  return (
    <div className="lab">
      <Choice label={t('Public prime')} value={p} onChange={choose} options={PRIMES.map((q) => ({ value: q, label: t('prime {p}', { p: formatNumber(q) }) }))} />
      <div className="lab__stage dh">
        <p className="dh__public">{t('Public: prime {p}, base {g}', { p: formatNumber(p), g })}</p>
        <div className="dh__people">
          <div className="dh__person">
            <strong>Alice</strong>
            <span>{t('secret')} <b className="dh__secret">{a}</b></span>
            <span>{t('sends {g}^{a} mod {p} =', { g, a, p })}</span>
            <b className="dh__sent">{A}</b>
            <span>{t('key: {x}^{a} mod {p} =', { x: B, a, p })}</span>
            <b className="dh__key">{keyA}</b>
          </div>
          <div className="dh__person">
            <strong>Bob</strong>
            <span>{t('secret')} <b className="dh__secret">{b}</b></span>
            <span>{t('sends {g}^{b} mod {p} =', { g, b, p })}</span>
            <b className="dh__sent">{B}</b>
            <span>{t('key: {x}^{b} mod {p} =', { x: A, b, p })}</span>
            <b className="dh__key">{keyB}</b>
          </div>
        </div>
        <p className={`dh__eve${cracked ? ' dh__eve--won' : ''}`} aria-live="polite">
          {cracked
            ? t('Eve found Alice’s secret: {x}. Now she can work out the key too.', { x: eve })
            : t('Eve tries {x}: {g}^{x} mod {p} = {y}, not {A}.', { x: eve, g, p, y: eveSees, A })}
        </p>
      </div>
      <Range label="Alice" value={a} min={1} max={p - 2} onChange={(v) => { setA(v); setEve(1); }} />
      <Range label="Bob" value={b} min={1} max={p - 2} onChange={setB} />
      <Range label={t('Eve tries')} value={eve} min={1} max={p - 2} onChange={setEve} />
      <div className="lab__row">
        <Btn ghost onClick={() => setEve((x) => (x >= p - 2 ? 1 : x + 1))} disabled={cracked}>
          {t('Try the next one')}
        </Btn>
        <Btn ghost onClick={() => { let x = 1; while (powMod(g, x, p) !== A) x++; setEve(x); }} disabled={cracked}>
          {t('Try them all')}
        </Btn>
        <span className="lab__note">{t('A real prime has about 617 digits: far too many to try.')}</span>
      </div>
    </div>
  );
}
