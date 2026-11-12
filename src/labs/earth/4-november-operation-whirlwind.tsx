import { useState } from 'react';
import { C, font, label, Range, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/**
 * The radio on the morning of 4 November 1956, minute by minute, from the UN Special Committee's report (1957),
 * paras 77, 290–296: the Soviet attack at 4.15 (the 1956 Institute's time), Kádár's government announced at 5.05 on
 * another station and by his own voice at 6.00, Imre Nagy on Free Radio Kossuth at 5.20, his call to Maléter at 5.56,
 * the appeal to Soviet soldiers at 7.14, the Writers' Union at 7.57, and silence at 8.07. Times in minutes after
 * midnight. The reader turns a time dial and finds the last words of Free Radio Kossuth.
 */
export type Station = 'kossuth' | 'kadar' | 'none';
export interface Broadcast {
  id: string;
  at: number;
  station: Station;
}
const hm = (h: number, m: number) => h * 60 + m;
export const LOG: Broadcast[] = [
  { id: 'attack', at: hm(4, 15), station: 'none' },
  { id: 'kadar505', at: hm(5, 5), station: 'kadar' },
  { id: 'nagy520', at: hm(5, 20), station: 'kossuth' },
  { id: 'maleter', at: hm(5, 56), station: 'kossuth' },
  { id: 'kadar600', at: hm(6, 0), station: 'kadar' },
  { id: 'soldiers', at: hm(7, 14), station: 'kossuth' },
  { id: 'writers', at: hm(7, 57), station: 'kossuth' },
  { id: 'silence', at: hm(8, 7), station: 'kossuth' },
];
export const START = hm(4, 0), END = hm(9, 0);

/** What a listener tuned to `station` last heard at minute `m` (null before its first broadcast). */
export function heard(station: Station, m: number): Broadcast | null {
  let last: Broadcast | null = null;
  for (const b of LOG) if (b.station === station && b.at <= m) last = b;
  return last;
}

/** The goal: the dial stands where Free Radio Kossuth's last words, the Writers' Union's appeal, are on air. */
export const onLastWords = (m: number) => heard('kossuth', m)?.id === 'writers';

/** 4.15, 5.05: a time the way the period's documents write it. */
export const clockText = (m: number) => `${Math.floor(m / 60)}.${String(m % 60).padStart(2, '0')}`;

function message(id: string) {
  switch (id) {
    case 'attack':
      return t('Soviet attack begins');
    case 'kadar505':
      return t('Kádár’s government announced');
    case 'nagy520':
      return t('Nagy: “Our troops are in combat.”');
    case 'maleter':
      return t('Nagy calls the generals back to their posts');
    case 'kadar600':
      return t('Kádár’s own voice names his government');
    case 'soldiers':
      return t('To Soviet soldiers: “Do not shoot!”');
    case 'writers':
      return t('Writers’ Union: “Help Hungary!”');
    default:
      return t('Silence: off the air');
  }
}

const GOLD = '#e3b24a', RED = '#c0485a', WAVE = '#8fc7d8';

export default function November4({ onDone }: LabProps) {
  const [m, setM] = useState(hm(4, 30));
  useGoal(onLastWords(m), onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const rows: [Station, string, string][] = [
      ['none', t('In Budapest that morning'), C.soft],
      ['kossuth', t('Free Radio Kossuth, Budapest'), GOLD],
      ['kadar', t('The other station: Kádár'), RED],
    ];
    rows.forEach(([st, name, col], i) => {
      const y = h * (0.1 + i * 0.24), b = heard(st, m);
      label(ctx, name, 10, y, { size: 12, color: col, align: 'left' });
      const live = b && b.id !== 'silence';
      ctx.fillStyle = live ? 'rgba(143,199,216,0.16)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(10, y + 9, w - 20, 28);
      const msg = b ? `${clockText(b.at)} · ${message(b.id)}` : t('nothing yet in this log');
      let size = 12;
      for (; size > 9; size--) { font(ctx, size); if (ctx.measureText(msg).width <= w - 36) break; }
      label(ctx, msg, 18, y + 23, { size, color: live ? C.ink : C.faint, align: 'left' });
    });
    // the time line with every broadcast as a tick
    const y = h * 0.82, X = (v: number) => 10 + ((w - 20) * (v - START)) / (END - START);
    ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke();
    for (const b of LOG) {
      ctx.fillStyle = b.station === 'kadar' ? RED : b.station === 'kossuth' ? GOLD : C.soft;
      ctx.fillRect(X(b.at) - 1.5, y - 8, 3, 16);
    }
    for (let hh = 4; hh <= 9; hh++) label(ctx, `${hh}.00`, X(hm(hh, 0)), y + 18, { size: 9, color: C.faint, align: hh === 4 ? 'left' : hh === 9 ? 'right' : 'center' });
    ctx.fillStyle = WAVE; ctx.beginPath(); ctx.arc(X(m), y, 6, 0, Math.PI * 2); ctx.fill();
    label(ctx, t('Times as the UN committee gave them'), w - 10, y + 32, { size: 9, color: C.faint, align: 'right' });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('4 November 1956 at {time}: what the two stations were broadcasting', { time: clockText(m) })} />
      <Range label={t('Time on 4 November')} value={m} min={START} max={END} step={1} onChange={setM} format={(v) => clockText(v)} />
    </div>
  );
}
