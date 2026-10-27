import { useState } from 'react';
import { C, label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** The Senate dedicated the arch in AD 315. */
export const DEDICATED = 315;

export type Group = 'trajan' | 'hadrian' | 'marcus';
/**
 * The reused sculpture, by the emperor it was carved for (Wikipedia; Encyclopaedia Romana): from Trajan's time
 * (AD 98–117) eight Dacian captives and four slabs of a battle frieze; from Hadrian's (117–138) eight roundels; from
 * Marcus Aurelius's arch of about AD 176, eight panels. Exact carving years within a reign are not known.
 */
export const REUSED: { id: Group; from: number; to: number; pieces: number }[] = [
  { id: 'trajan', from: 98, to: 117, pieces: 12 },
  { id: 'hadrian', from: 117, to: 138, pieces: 8 },
  { id: 'marcus', from: 176, to: 176, pieces: 8 },
];
export const REUSED_TOTAL = REUSED.reduce((s, g) => s + g.pieces, 0);

/** How many of the reused pieces had certainly been carved by the end of `year`. */
export const carvedBy = (year: number) => REUSED.reduce((s, g) => s + (year >= g.to ? g.pieces : 0), 0);
/** Whether a group could still have been in the making in `year`. */
const inMaking = (g: (typeof REUSED)[number], year: number) => year >= g.from && year < g.to;

const COLOUR: Record<Group, string> = { trajan: '#6fb0e8', hadrian: '#8fd07a', marcus: '#c49af0' };
const NEW = '#f3bf4f';

export default function ArchSpolia({ onDone }: LabProps) {
  const [year, setYear] = useState(DEDICATED);
  const n = carvedBy(year);
  useGoal(n === REUSED_TOTAL && carvedBy(year - 1) < REUSED_TOTAL, onDone);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    // one face of the arch, schematic
    const aw = Math.min(w - 16, (h - 30) * 1.23), ah = aw / 1.23, x0 = (w - aw) / 2, y0 = 6;
    const X = (f: number) => x0 + f * aw, Y = (f: number) => y0 + f * ah;
    ctx.fillStyle = 'rgba(234,220,194,0.22)'; ctx.fillRect(x0, y0, aw, ah);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const opening = (l: number, ww: number, top: number) => {
      ctx.beginPath(); ctx.moveTo(X(l), Y(1)); ctx.lineTo(X(l), Y(top + ww * 0.6)); ctx.arc(X(l + ww / 2), Y(top + ww * 0.6), (ww / 2) * aw, Math.PI, 0); ctx.lineTo(X(l + ww), Y(1)); ctx.closePath(); ctx.fill();
    };
    opening(0.375, 0.25, 0.45); opening(0.12, 0.13, 0.65); opening(0.75, 0.13, 0.65);
    const state = (g: Group) => {
      const grp = REUSED.find((r) => r.id === g)!;
      return year >= grp.to ? 1 : inMaking(grp, year) ? 0.45 : 0;
    };
    const fill = (g: Group | 'new', on: number) => {
      ctx.globalAlpha = on > 0 ? 0.35 + 0.65 * on : 1;
      ctx.fillStyle = on > 0 ? (g === 'new' ? NEW : COLOUR[g as Group]) : 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = on > 0 ? 'transparent' : 'rgba(255,255,255,0.35)';
    };
    // Marcus Aurelius: four attic panels
    for (const f of [0.04, 0.17, 0.73, 0.86]) { fill('marcus', state('marcus')); ctx.fillRect(X(f), Y(0.07), 0.1 * aw, 0.17 * ah); ctx.strokeRect(X(f), Y(0.07), 0.1 * aw, 0.17 * ah); }
    // Trajan: four Dacians on the columns, two slabs in the passage
    for (const f of [0.065, 0.335, 0.665, 0.935]) { fill('trajan', state('trajan')); ctx.fillRect(X(f) - 0.02 * aw, Y(0.05), 0.04 * aw, 0.2 * ah); ctx.strokeRect(X(f) - 0.02 * aw, Y(0.05), 0.04 * aw, 0.2 * ah); }
    for (const f of [0.39, 0.565]) { fill('trajan', state('trajan')); ctx.fillRect(X(f), Y(0.62), 0.045 * aw, 0.22 * ah); ctx.strokeRect(X(f), Y(0.62), 0.045 * aw, 0.22 * ah); }
    // Hadrian: two roundels over each side bay
    for (const f of [0.135, 0.225, 0.775, 0.865]) {
      fill('hadrian', state('hadrian'));
      ctx.beginPath(); ctx.arc(X(f), Y(0.4), 0.04 * aw, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // new in 312–315: the narrow frieze over the side bays
    const built = year >= DEDICATED ? 1 : year >= 312 ? 0.45 : 0;
    for (const f of [0.09, 0.71]) { fill('new', built); ctx.fillRect(X(f), Y(0.5), 0.2 * aw, 0.04 * ah); ctx.strokeRect(X(f), Y(0.5), 0.2 * aw, 0.04 * ah); }
    ctx.globalAlpha = 1;
    // the inscription
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(X(0.36), Y(0.06), 0.28 * aw, 0.19 * ah);
    label(ctx, t('One face shown; the count is for the whole arch'), w / 2, h - 10, { size: 9, color: C.faint });
  };

  const making = REUSED.filter((g) => inMaking(g, year));
  return (
    <div className="lab">
      <Stage draw={draw} label={t('The Arch of Constantine in AD {y}, with {n} of its {total} reused sculptures already carved', { y: formatNumber(year, 'year'), n: formatNumber(n), total: formatNumber(REUSED_TOTAL) })} />
      <Range label={t('Year AD')} value={year} min={95} max={DEDICATED} step={1} onChange={(v) => setYear(Math.round(v))} format={(v) => formatNumber(v, 'year')} />
      <Readouts
        items={[
          { label: t('Reused sculptures carved by then'), value: t('{n} of {total}', { n: formatNumber(n), total: formatNumber(REUSED_TOTAL) }), tone: n === REUSED_TOTAL ? 'good' : 'accent' },
          { label: t('Years before the arch was dedicated'), value: formatNumber(DEDICATED - year) },
          {
            label: t('Being carved that year'),
            value: making.length ? making.map((g) => (g.id === 'trajan' ? t('Trajan’s') : t('Hadrian’s'))).join(', ') : year >= 312 ? t('Constantine’s frieze') : '–',
          },
        ]}
      />
      <p className="lab__note">{t('Blue: Trajan (98–117). Green: Hadrian (117–138). Violet: Marcus Aurelius (about 176). Gold: new in 312–315. Exact carving years within a reign are not known.')}</p>
    </div>
  );
}
