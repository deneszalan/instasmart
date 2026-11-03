import { useState } from 'react';
import { C, label, Stage, useGoal, type LabProps, type StagePointer } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';
import { shuffle } from '../../lib/feed';

/**
 * Elements of Férid Boughedir's film Villa Jasmin (2008), sorted by where they come from:
 * - history: documented by historians (USHMM Holocaust Encyclopedia; the Allied entry into Tunis on 7 May 1943);
 * - memory: the Moati family's account (Nine Moati's oral history for the USHMM, 2018; Serge Moati's novel, 2003);
 * - film: how the film frames and changes the story (Humanities Institute film guide; Jüdische Allgemeine).
 */
export type Strand = 'history' | 'memory' | 'film';
export const STRANDS: Strand[] = ['history', 'memory', 'film'];
export const ITEMS: { id: string; strand: Strand }[] = [
  { id: 'occupation', strand: 'history' },
  { id: 'vichy', strand: 'history' },
  { id: 'labour', strand: 'history' },
  { id: 'sachsenhausen', strand: 'memory' },
  { id: 'italian', strand: 'memory' },
  { id: 'dentist', strand: 'memory' },
  { id: 'boccara', strand: 'film' },
  { id: 'newsreel', strand: 'film' },
  { id: 'return1976', strand: 'film' },
];

/**
 * The order the cards are dealt in: shuffled, and never two cards of the same strand in a row, so the order
 * gives nothing away (ITEMS lists them strand by strand).
 */
export function deal(rng: () => number = Math.random): typeof ITEMS {
  for (let tries = 0; ; tries++) {
    const order = shuffle(ITEMS, rng);
    if (tries > 200 || order.every((it, k) => k === 0 || order[k - 1].strand !== it.strand)) return order;
  }
}

/** How many of the reader's answers (item id → strand) are right. */
export function score(answers: Record<string, Strand>): number {
  return ITEMS.filter((it) => answers[it.id] === it.strand).length;
}

function card(id: string): string {
  if (id === 'occupation') return t('German troops hold Tunis from November 1942 to May 1943');
  if (id === 'vichy') return t('Vichy’s anti-Jewish laws reach Tunisia in 1940');
  if (id === 'labour') return t('About 5,000 Jewish men are put to forced labour');
  if (id === 'sachsenhausen') return t('The father is deported to Sachsenhausen');
  if (id === 'italian') return t('A German takes the name Moati for an Italian one');
  if (id === 'dentist') return t('He gets out of the camp with a dentist’s help');
  if (id === 'boccara') return t('The family is called Boccara');
  if (id === 'newsreel') return t('He is glimpsed in a Paris newsreel');
  return t('A son returns to Tunis in 1976 with his pregnant fiancée');
}
function why(id: string): string {
  if (id === 'occupation') return t('Documented: the Allies entered Tunis on 7 May 1943.');
  if (id === 'vichy') return t('Documented: Vichy’s race laws reached North Africa in October 1940.');
  if (id === 'labour') return t('The US Holocaust Memorial Museum’s estimate for Tunisia’s German labour camps.');
  if (id === 'sachsenhausen') return t('The family’s account, in his daughter Nine Moati’s memories and his son’s novel.');
  if (id === 'italian') return t('Nine Moati’s memory, recorded for the US Holocaust Memorial Museum in 2018.');
  if (id === 'dentist') return t('Nine Moati said “apparently”, and could not say when or how.');
  if (id === 'boccara') return t('The film renames the family: the real name is Moati.');
  if (id === 'newsreel') return t('A scene of the film, not a record of the family.');
  return t('The frame the film builds around the father’s story.');
}
const COLOUR: Record<Strand, string> = { history: '#7cc4e0', memory: '#f2b45a', film: '#f08aa6' };

export default function VillaJasminStrands({ onDone }: LabProps) {
  const [answers, setAnswers] = useState<Record<string, Strand>>({});
  const [i, setI] = useState(0);
  const [tried, setTried] = useState<Strand | null>(null);
  const [width, setWidth] = useState(1);
  const [order] = useState(() => deal());
  const item = order[i];
  const right = Object.keys(answers).length;
  useGoal(right === ITEMS.length, onDone);
  const solved = item ? !!answers[item.id] : false;

  /** Tap a column to sort the card there; once it is right, tap again for the next card. */
  const onPointer = (p: StagePointer) => {
    if (p.kind !== 'up' || !item) return;
    if (solved) { setTried(null); setI((n) => Math.min(ITEMS.length, n + 1)); return; }
    const s = STRANDS[Math.min(2, Math.max(0, Math.floor((p.x / width) * 3)))];
    setTried(s);
    if (s === item.strand) setAnswers((a) => ({ ...a, [item.id]: s }));
  };
  const names: Record<Strand, string> = { history: t('Documented history'), memory: t('Family memory'), film: t('The film’s telling') };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    if (w !== width) queueMicrotask(() => setWidth(w));
    const fs = Math.max(10, Math.min(13, w / 28));
    const top = fs * 2.2, bottom = h - fs * 1.6, slot = (bottom - top) / 3;
    STRANDS.forEach((s, c) => {
      const x = (w / 3) * c + 4, cw = w / 3 - 8;
      ctx.fillStyle = tried === s && !solved ? 'rgba(252,165,165,0.16)' : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, 2, cw, bottom - 2);
      ctx.fillStyle = COLOUR[s]; ctx.fillRect(x, 2, cw, 3);
      label(ctx, names[s], x + cw / 2, fs * 1.1, { size: fs - 1, color: COLOUR[s] });
      const done = ITEMS.filter((it) => it.strand === s && answers[it.id]);
      done.forEach((it, j) => {
        const y = top + j * slot;
        ctx.fillStyle = COLOUR[s]; ctx.globalAlpha = 0.25; ctx.fillRect(x + 3, y, cw - 6, slot - 4); ctx.globalAlpha = 1;
        const words = card(it.id).split(' ');
        const size = fs - 3;
        let line = '', row = 0;
        ctx.font = `600 ${size}px system-ui, sans-serif`;
        const put = (text: string) => label(ctx, text, x + 6, y + size * 0.9 + row * (size + 1), { size, color: C.ink, align: 'left', weight: 600 });
        for (const wd of words) {
          const test = line ? line + ' ' + wd : wd;
          if (ctx.measureText(test).width > cw - 12 && line) { put(line); line = wd; row++; } else line = test;
        }
        if (line) put(line);
      });
    });
    const hint = !item ? t('All nine cards sorted.') : solved ? t('Tap for the next card') : t('Tap the column this card belongs in.');
    label(ctx, hint + ' · ' + t('{n} of 9 sorted', { n: formatNumber(right) }), w / 2, h - fs * 0.6, { size: fs - 1, color: solved || !item ? C.good : C.soft });
  };

  return (
    <div className="lab">
      <Stage draw={draw} onPointer={onPointer} label={t('Three columns, history, family memory and the film, with the cards sorted so far')} />
      <p className="lab__note"><strong>{item ? card(item.id) : t('History, a family’s memory and a film’s choices, braided in one story.')}</strong></p>
      <p className="lab__note">{item ? (solved ? why(item.id) : tried ? t('Not that one: try another column.') : '\u00a0') : ''}</p>
    </div>
  );
}
