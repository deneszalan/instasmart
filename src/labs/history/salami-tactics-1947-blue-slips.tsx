import { useState } from 'react';
import { C, label, line, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatFixed, formatNumber } from '../../lib/format';

/**
 * The Hungarian election of 31 August 1947, the "blue-slip" election: the official national results of the six
 * largest lists (Attila Csönge, Múltunk 2009/2, table 3) and the estimates of the false blue-slip votes cast for the
 * Communists: 62,981 in the report of the political police chief Gábor Péter, about 100,000 as the "customary"
 * figure (László Hubai), about 200,000 by Károly Szerencsés. The reader takes false votes away from the Communist
 * result and sees whether the order changes. Simplified: only the false votes are taken away; the people refused
 * the vote and the other abuses are left out.
 */
export type PartyId = 'mkp' | 'dnp' | 'fkgp' | 'szdp' | 'mfp' | 'npp';
export const RESULTS: { id: PartyId; votes: number }[] = [
  { id: 'mkp', votes: 1111001 },
  { id: 'dnp', votes: 824259 },
  { id: 'fkgp', votes: 766000 },
  { id: 'szdp', votes: 742171 },
  { id: 'mfp', votes: 670751 },
  { id: 'npp', votes: 413409 },
];
/** All valid votes, the ten lists together. */
export const TOTAL = 4994338;
export const ESTIMATES = [62981, 100000, 200000];
export const MAX_FAKE = 400000;

const MKP = RESULTS[0].votes;
/** The Communist votes once `fake` false votes are taken away. */
export const communistVotes = (fake: number) => MKP - fake;
/** The Communist share of all valid votes, in percent, once `fake` false votes are taken away. */
export const communistShare = (fake: number) => (100 * (MKP - fake)) / (TOTAL - fake);
/** The Communists' place: 1 + the lists with more votes. */
export const communistPlace = (fake: number) => 1 + RESULTS.slice(1).filter((r) => r.votes > communistVotes(fake)).length;
/** The fewest false votes whose removal costs the Communists first place. */
export const toLoseFirst = MKP - RESULTS[1].votes + 1;

const RED = '#e0675a', GREEN = '#86b86a', BLUE = '#79aef0', GREY = '#8d93a3', GOLD = '#e8c46a';

export default function SalamiBlueSlips({ onDone }: LabProps) {
  const [fake, setFake] = useState(0);
  const place = communistPlace(fake);
  useGoal(place > 1, onDone);

  const name = (id: PartyId) =>
    id === 'mkp' ? t('MKP (Communists)')
    : id === 'dnp' ? t('DNP (Christian democrats)')
    : id === 'fkgp' ? t('FKgP (Smallholders)')
    : id === 'szdp' ? t('SZDP (Social Democrats)')
    : id === 'mfp' ? t('MFP (Independence Party)')
    : t('NPP (Peasant Party)');
  const colour = (id: PartyId) => (id === 'mkp' ? RED : id === 'fkgp' ? GREEN : id === 'mfp' ? GOLD : GREY);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const left = Math.min(150, w * 0.4), right = 12, top = 30, rowH = (h - top - 26) / RESULTS.length;
    const max = MKP, X = (v: number) => left + ((w - left - right) * v) / max;
    RESULTS.forEach((r, i) => {
      const y = top + i * rowH, bh = Math.min(22, rowH * 0.62);
      const v = r.id === 'mkp' ? communistVotes(fake) : r.votes;
      ctx.fillStyle = colour(r.id);
      ctx.fillRect(left, y, X(v) - left, bh);
      if (r.id === 'mkp' && fake > 0) {
        // the votes taken away, as a dashed outline
        ctx.save(); ctx.strokeStyle = BLUE; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
        ctx.strokeRect(X(v), y + 0.5, X(MKP) - X(v), bh - 1); ctx.restore();
      }
      label(ctx, name(r.id), left - 6, y + bh / 2, { size: 10, color: C.ink, align: 'right' });
    });
    // the line the Communists must stay above to keep first place
    const xLine = X(RESULTS[1].votes);
    line(ctx, xLine, top - 6, xLine, top + rowH * 2, 'rgba(255,255,255,0.45)', 1, [3, 3]);
    // where the three estimates would bring the Communist bar
    ESTIMATES.forEach((e) => {
      const x = X(MKP - e);
      line(ctx, x, top - 9, x, top - 1, BLUE, 2);
    });
    label(ctx, t('Blue ticks: estimates of the false votes'), left, top - 18, { size: 9, color: BLUE, align: 'left' });
    label(ctx, t('Official 1947 results; simplified: only false votes taken away'), 8, h - 10, { size: 9, color: C.faint, align: 'left' });
  };

  return (
    <div className="lab">
      <Stage
        draw={draw}
        label={t('1947 results with {n} false votes taken from the Communists: they would be in place {p}, with {s}%', {
          n: formatNumber(fake),
          p: formatNumber(place),
          s: formatFixed(communistShare(fake), 1),
        })}
      />
      <Range
        label={t('False votes taken away')}
        value={fake}
        min={0}
        max={MAX_FAKE}
        step={1000}
        onChange={setFake}
        format={(v) => formatNumber(v)}
      />
      <p className="lab__note">{t('Estimates: {a} (police report), about {b}, about {c}', { a: formatNumber(ESTIMATES[0]), b: formatNumber(ESTIMATES[1]), c: formatNumber(ESTIMATES[2]) })}</p>
      <Readouts
        items={[
          { label: t('Communist share'), value: `${formatFixed(communistShare(fake), 1)}%`, tone: 'accent' },
          { label: t('Communist place'), value: place === 1 ? t('still first') : t('no longer first'), tone: place === 1 ? undefined : 'good' },
        ]}
      />
    </div>
  );
}
