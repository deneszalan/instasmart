import { useState } from 'react';
import { Btn, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/** The wartime Enigma I rotors I, II and III and reflector B, ring settings at A, no plugboard. */
const ROTORS = ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 'BDFHJLCPRTXVZNYEIWGAKMUSQO'];
const NOTCHES = [A.indexOf('Q'), A.indexOf('E'), A.indexOf('V')];
const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
const KEYS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];

const mod = (n: number) => ((n % 26) + 26) % 26;
const forward = (r: number, pos: number, c: number) => mod(A.indexOf(ROTORS[r][mod(c + pos)]) - pos);
const backward = (r: number, pos: number, c: number) => mod(ROTORS[r].indexOf(A[mod(c + pos)]) - pos);

/** Steps the rotors as a key goes down (with the middle rotor's double step), left to right [I, II, III]. */
export function stepRotors([l, m, r]: number[]): number[] {
  if (m === NOTCHES[1]) return [mod(l + 1), mod(m + 1), mod(r + 1)];
  if (r === NOTCHES[2]) return [l, mod(m + 1), mod(r + 1)];
  return [l, m, mod(r + 1)];
}

/** Encrypts one letter at the given (already stepped) rotor positions: right to left, reflector, back again. */
export function encipher(c: number, [l, m, r]: number[]): number {
  let x = forward(2, r, c);
  x = forward(1, m, x);
  x = forward(0, l, x);
  x = A.indexOf(REFLECTOR[x]);
  x = backward(0, l, x);
  x = backward(1, m, x);
  return backward(2, r, x);
}

export default function Enigma({ onDone }: LabProps) {
  const [start, setStart] = useState([0, 0, 0]);
  const [pos, setPos] = useState([0, 0, 0]);
  const [plain, setPlain] = useState('');
  const [cipher, setCipher] = useState('');
  const [lit, setLit] = useState<string | null>(null);
  useGoal(plain.length >= 10, onDone);

  const press = (key: string) => {
    const next = stepRotors(pos);
    const out = A[encipher(A.indexOf(key), next)];
    setPos(next);
    setPlain((p) => (p + key).slice(-60));
    setCipher((c) => (c + out).slice(-60));
    setLit(out);
  };
  const turn = (i: number) => {
    const s = start.map((v, j) => (j === i ? mod(v + 1) : v));
    setStart(s);
    setPos(s);
    setPlain('');
    setCipher('');
    setLit(null);
  };
  const reset = () => {
    setPos(start);
    setPlain('');
    setCipher('');
    setLit(null);
  };

  const same = [...plain].filter((ch, i) => ch === cipher[i]).length;
  return (
    <div className="lab">
      <div className="enigma__top">
        <div className="enigma__rotors" role="group" aria-label={t('Rotor start positions, tap to turn')}>
          {[0, 1, 2].map((i) => (
            <button key={i} className="enigma__window" onClick={() => turn(i)} aria-label={t('Rotor {n} shows {c}', { n: ['I', 'II', 'III'][i], c: A[pos[i]] })}>
              {A[pos[i]]}
            </button>
          ))}
        </div>
        <div className="enigma__tape" aria-live="polite">
          <span>
            {t('In')}: <strong>{plain.slice(-16) || '…'}</strong>
          </span>
          <span>
            {t('Out')}: <strong className="enigma__out">{cipher.slice(-16) || '…'}</strong>
          </span>
        </div>
      </div>
      <div className="lab__stage enigma__board">
        {KEYS.map((row) => (
          <div key={row} className="enigma__row">
            {[...row].map((k) => (
              <span key={k} className={`enigma__lamp${lit === k ? ' enigma__lamp--lit' : ''}`} aria-hidden="true">
                {k}
              </span>
            ))}
          </div>
        ))}
        <div className="enigma__keys">
          {KEYS.map((row) => (
            <div key={row} className="enigma__row">
              {[...row].map((k) => (
                <button key={k} className="enigma__key" onClick={() => press(k)}>
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="lab__row">
        <span className="lab__note" aria-live="polite">
          {t('Letters typed: {n}. Came out as themselves: {k}.', { n: plain.length, k: same })}
        </span>
        <Btn ghost onClick={reset}>
          {t('Back to start')}
        </Btn>
      </div>
    </div>
  );
}
