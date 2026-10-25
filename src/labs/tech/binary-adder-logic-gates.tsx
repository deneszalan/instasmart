import { useState } from 'react';
import { useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** A 4-bit ripple-carry adder: for each column (least significant first), its sum bit and the carry it passes on. */
export function rippleAdd(a: number, b: number) {
  const cols: { a: number; b: number; carryIn: number; sum: number; carryOut: number }[] = [];
  let carry = 0;
  for (let i = 0; i < 4; i++) {
    const x = (a >> i) & 1, y = (b >> i) & 1;
    const sum = x ^ y ^ carry, carryOut = (x & y) | (carry & (x ^ y));
    cols.push({ a: x, b: y, carryIn: carry, sum, carryOut });
    carry = carryOut;
  }
  return { cols, total: a + b };
}

export default function BinaryAdder({ onDone }: LabProps) {
  const [a, setA] = useState(0b0101);
  const [b, setB] = useState(0b0001);
  const { cols, total } = rippleAdd(a, b);
  // The carry runs all the way along when columns 0, 1 and 2 all carry into the next.
  useGoal(cols[0].carryOut === 1 && cols[1].carryOut === 1 && cols[2].carryOut === 1, onDone);

  const bit = (n: number, i: number, set: (v: number) => void, name: string) => (
    <button className={`adder__bit${(n >> i) & 1 ? ' adder__bit--on' : ''}`} onClick={() => set(n ^ (1 << i))} aria-label={t('{name}, bit worth {v}: {b}', { name, v: 1 << i, b: (n >> i) & 1 })}>
      {(n >> i) & 1}
    </button>
  );
  const order = [3, 2, 1, 0];
  return (
    <div className="lab">
      <div className="lab__stage adder">
        <div className="adder__grid">
          <span className="adder__label" />
          {order.map((i) => (
            <span key={i} className="adder__worth">
              {1 << i}
            </span>
          ))}
          <span className="adder__dec" />

          <span className="adder__label">{t('Carry')}</span>
          {order.map((i) => (
            <span key={i} className={`adder__carry${cols[i].carryIn ? ' adder__carry--on' : ''}`} aria-label={t('Carry into this column: {b}', { b: cols[i].carryIn })}>
              {cols[i].carryIn ? '1' : ''}
            </span>
          ))}
          <span className="adder__dec" />

          <span className="adder__label">A</span>
          {order.map((i) => (
            <span key={i}>{bit(a, i, setA, 'A')}</span>
          ))}
          <span className="adder__dec">{a}</span>

          <span className="adder__label">+ B</span>
          {order.map((i) => (
            <span key={i}>{bit(b, i, setB, 'B')}</span>
          ))}
          <span className="adder__dec">{b}</span>

          <span className="adder__label">=</span>
          {order.map((i) => (
            <span key={i} className={`adder__sum${cols[i].sum ? ' adder__sum--on' : ''}`}>
              {cols[i].sum}
            </span>
          ))}
          <span className="adder__dec adder__dec--sum">{total > 15 ? `${total - 16} + 16` : total}</span>
        </div>
        <p className="adder__out" aria-live="polite">
          {cols[3].carryOut ? t('Carry out of the last column: the answer needs a fifth bit, worth 16.') : t('{a} + {b} = {c}', { a, b, c: total })}
        </p>
      </div>
      <p className="lab__note">{t('Each column is a full adder: its sum is on when an odd number of its three inputs are on, and it carries when at least two are.')}</p>
    </div>
  );
}
