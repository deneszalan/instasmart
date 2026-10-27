import { useState } from 'react';
import { C, dot, FONT, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Caesar was killed on the Ides of March, 44 BC. */
export const IDES_BC = 44;

/** The calendar year (negative for BC) `n` years after 44 BC; there is no year 0. */
export const yearOf = (n: number) => (n < IDES_BC ? -(IDES_BC - n) : n - IDES_BC + 1);
/** Years from 44 BC to a calendar year (negative for BC). */
export const yearsAfter = (year: number) => (year > 0 ? year + IDES_BC - 1 : IDES_BC + year);

export type SourceId = 'nicolaus' | 'plutarch' | 'suetonius' | 'dio' | 'shakespeare';
export interface Source {
  id: SourceId;
  /** Year written, for placing on the line (a "before" or "about" date is placed at that year). */
  year: number;
}
/** Nicolaus completed his Life of Augustus before AD 14; Plutarch's Lives are of the early 2nd century; Suetonius wrote
 * in AD 121; Cassius Dio after 211, in the early 3rd century; Shakespeare's Julius Caesar is of 1599. */
export const SOURCES: Source[] = [
  { id: 'nicolaus', year: 14 },
  { id: 'plutarch', year: 100 },
  { id: 'suetonius', year: 121 },
  { id: 'dio', year: 220 },
  { id: 'shakespeare', year: 1599 },
];
/** The latest account written by `n` years after the Ides, if any. */
export const latest = (n: number) => [...SOURCES].reverse().find((s) => yearsAfter(s.year) <= n);

/** The slider runs 0–100: its first 60 steps cover 270 years, the rest the centuries to 1,700 years after. */
export const MAX_YEARS = 1700;
export const yearsAt = (p: number) => (p <= 60 ? (p / 60) * 270 : 270 + ((p - 60) / 40) * (MAX_YEARS - 270));
export const posOf = (n: number) => (n <= 270 ? (n / 270) * 60 : 60 + ((n - 270) / (MAX_YEARS - 270)) * 40);

const yearText = (y: number) => (y < 0 ? t('the year {n} BC', { n: formatNumber(-y, 'year') }) : t('the year AD {n}', { n: formatNumber(y, 'year') }));

function facts(id: SourceId) {
  switch (id) {
    case 'nicolaus':
      return { who: t('Nicolaus of Damascus, Life of Augustus'), when: t('before AD 14'), wounds: '35', words: t('none reported') };
    case 'plutarch':
      return { who: t('Plutarch, Life of Caesar'), when: t('early 2nd century AD'), wounds: '23', words: t('none: he covered his head with his toga') };
    case 'suetonius':
      return { who: t('Suetonius, Life of Julius Caesar'), when: t('AD 121'), wounds: '23', words: t('none, though some wrote of Greek words: “You too, child?”') };
    case 'dio':
      return { who: t('Cassius Dio, Roman History'), when: t('early 3rd century AD'), wounds: '–', words: t('none, Dio says') };
    case 'shakespeare':
      return { who: t('Shakespeare, Julius Caesar (a play)'), when: '1599', wounds: '–', words: '“Et tu, Brute?”' };
  }
}
const COLOUR: Record<SourceId, string> = { nicolaus: '#7cc8c2', plutarch: '#b9a6e0', suetonius: '#e7b95c', dio: '#9fc3e8', shakespeare: '#f08a76' };

export default function CaesarSources({ onDone }: LabProps) {
  const [p, setP] = useState(4);
  const n = yearsAt(p);
  const now = latest(n);
  useGoal(now?.id === 'shakespeare', onDone);
  const f = now ? facts(now.id) : null;
  const count = SOURCES.filter((s) => yearsAfter(s.year) <= n).length;

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const L = 14, R = w - 14, y = h * 0.72, X = (q: number) => L + ((R - L) * q) / 100;
    // the latest account and what it says Caesar said
    label(ctx, f ? f.who : t('no account yet'), L, 14, { size: 12, align: 'left', color: now ? COLOUR[now.id] : C.soft });
    if (f) {
      ctx.font = `600 11px ${FONT}`;
      const words = `${t('Last words:')} ${f.words}`.split(' ');
      const rows: string[] = [''];
      for (const word of words) {
        const next = rows[rows.length - 1] ? `${rows[rows.length - 1]} ${word}` : word;
        if (ctx.measureText(next).width > R - L && rows[rows.length - 1]) rows.push(word);
        else rows[rows.length - 1] = next;
      }
      rows.slice(0, 2).forEach((r, i) => label(ctx, r, L, 31 + i * 13, { size: 11, weight: 600, align: 'left', color: now?.id === 'shakespeare' ? C.bad : C.ink }));
    }
    // the time line
    line(ctx, L, y, X(60) - 4, y, C.faint, 2);
    line(ctx, X(60) + 4, y, R, y, C.faint, 2, [4, 4]);
    label(ctx, t('the Ides'), L, y + 12, { size: 9, align: 'left', color: C.faint });
    label(ctx, '1600', X(posOf(yearsAfter(1600))), y + 12, { size: 9, color: C.faint });
    SOURCES.forEach((s, i) => {
      const x = X(posOf(yearsAfter(s.year))), on = yearsAfter(s.year) <= n;
      dot(ctx, x, y, on ? 5 : 3, on ? COLOUR[s.id] : C.faint);
      const names: Record<SourceId, string> = { nicolaus: 'Nicolaus', plutarch: 'Plutarch', suetonius: 'Suetonius', dio: 'Dio', shakespeare: 'Shakespeare' };
      label(ctx, names[s.id], x, y - 12 - (i % 2) * 12, { size: 9.5, color: on ? COLOUR[s.id] : C.faint, align: s.id === 'shakespeare' ? 'right' : 'center' });
    });
    // the cursor and its year
    const cx = X(p);
    line(ctx, cx, y - 34, cx, y + 5, C.ink, 2);
    const near = cx > R - 60 ? 'right' : cx < L + 60 ? 'left' : 'center';
    label(ctx, yearText(yearOf(Math.round(n))), cx, y + 22, { size: 10, color: C.ink, align: near });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Accounts of Caesar’s murder on a time line, {n} years after it', { n: formatNumber(Math.round(n)) })} />
      <Range label={t('Years after the Ides of March')} value={p} min={0} max={100} step={0.25} onChange={setP} format={() => formatNumber(Math.round(n))} />
      <Readouts
        items={[
          { label: t('Accounts written by then'), value: `${formatNumber(count)} / ${formatNumber(SOURCES.length)}`, tone: 'accent' },
          { label: t('Account written'), value: f ? f.when : '–' },
          { label: t('Wounds counted'), value: f ? f.wounds : '–' },
        ]}
      />
      <p className="lab__note">{t('Dates of writing are approximate where the source is: “before AD 14”, “early 2nd century”. Plotters: Nicolaus says more than 80, Suetonius more than 60.')}</p>
    </div>
  );
}
