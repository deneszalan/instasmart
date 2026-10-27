import { useState } from 'react';
import { label, Range, Readouts, Stage, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';
import { formatNumber } from '../../lib/format';

/** Astronomical year (1 BC = 0, 2 BC = −1) of a year written as negative for BC. */
export const astro = (y: number) => (y < 0 ? y + 1 : y);
/** Augustus's thirteen consulships (Wikipedia, "Augustus"). */
export const CONSULSHIPS = [-43, -33, -31, -30, -29, -28, -27, -26, -25, -24, -23, -5, -2];
/** Tribunician power from 1 July 23 BC, renewed each year (modelled as renewed every 1 July). */
export const TRIB_START = astro(-23) + 0.5;
/** The name Augustus from 16 January 27 BC; chief priest from 6 March 12 BC; Father of the Country from 5 February 2 BC. */
export const AUGUSTUS_FROM = astro(-27) + 16 / 365;
export const PONTIFEX_FROM = astro(-12) + 65 / 365;
export const PATER_FROM = astro(-2) + 36 / 365;

export function roman(n: number) {
  let s = '';
  for (const [v, r] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']] as const) while (n >= v) (s += r, (n -= v));
  return s;
}

export interface Titles {
  augustus: boolean;
  pontifex: boolean;
  cos: number;
  trib: number;
  pater: boolean;
}
/** His titles at time `tau`, in astronomical years with a fraction (0.5 = 1 July). */
export function titlesAt(tau: number): Titles {
  return {
    augustus: tau >= AUGUSTUS_FROM,
    pontifex: tau >= PONTIFEX_FROM,
    cos: CONSULSHIPS.filter((y) => astro(y) <= tau).length,
    trib: tau < TRIB_START ? 0 : Math.floor(tau - TRIB_START) + 1,
    pater: tau >= PATER_FROM,
  };
}
/** The titles as an inscription of his would give them (leaving out his count of victory acclamations, IMP). */
export function inscription(x: Titles) {
  const parts = ['IMP · CAESAR · DIVI · F'];
  if (x.augustus) parts.push('AVGVSTVS');
  if (x.pontifex) parts.push('PONTIFEX · MAXIMVS');
  if (x.cos) parts.push(`COS · ${roman(x.cos)}`);
  if (x.trib) parts.push(`TRIB · POT · ${roman(x.trib)}`);
  if (x.pater) parts.push('PATER · PATRIAE');
  return parts;
}
/** The obelisk now in Piazza del Popolo: PONTIFEX MAXIMVS … COS XI TRIB POT XIV. */
export const matchesObelisk = (x: Titles) => x.pontifex && x.cos === 11 && x.trib === 14 && !x.pater;

/** He died on 19 August AD 14. */
export const DEATH = astro(14) + 231 / 365;
/** The slider's steps: half-years from 30 BC to the second half of AD 14, which ends at his death. */
export const FIRST = astro(-30), STEPS = (astro(14) - FIRST) * 2 + 1;
export const tauAt = (step: number) => Math.min(FIRST + step / 2 + 0.25, DEATH);

const MARBLE = '#f1eee7', CARVE = '#4a463f';

export default function AugustusTitles({ onDone }: LabProps) {
  const [step, setStep] = useState(4);
  const tau = tauAt(step);
  const x = titlesAt(tau);
  const hit = matchesObelisk(x);
  useGoal(hit, onDone);
  const year = Math.floor(tau);
  const shown = year <= 0 ? -(year - 1) : year;
  const n = formatNumber(shown, 'year'), early = tau - year < 0.5;
  const date = year <= 0 ? (early ? t('Jan–Jun {n} BC', { n }) : t('Jul–Dec {n} BC', { n })) : early ? t('Jan–Jun AD {n}', { n }) : t('Jul–Dec AD {n}', { n });
  const lines = inscription(x);

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    ctx.fillStyle = MARBLE;
    ctx.beginPath();
    ctx.roundRect(6, 6, w - 12, h - 12, 8);
    ctx.fill();
    const lh = Math.min(26, (h - 24) / Math.max(4, lines.length));
    lines.forEach((s, i) => {
      const key = hit && /^(COS|TRIB)/.test(s);
      label(ctx, s, w / 2, 12 + lh * (i + 0.5) + (h - 24 - lh * lines.length) / 2, { size: Math.min(15, lh * 0.62), weight: 700, color: key ? '#a8321f' : i === 1 && x.augustus ? '#8a6a1f' : CARVE });
    });
  };

  return (
    <div className="lab">
      <Stage draw={draw} label={t('Augustus’s titles in an inscription: {s}', { s: lines.join(' ') })} />
      <Range label={t('Date in Augustus’s life')} value={step} min={0} max={STEPS} step={1} onChange={(v) => setStep(Math.round(v))} format={() => date} />
      <Readouts
        items={[
          { label: t('Consul so far'), value: `${roman(x.cos)} (${formatNumber(x.cos)})` },
          { label: t('Year of tribune’s power'), value: x.trib ? `${roman(x.trib)} (${formatNumber(x.trib)})` : '–' },
          { label: t('Matches the obelisk'), value: hit ? '✓' : '–', tone: hit ? 'good' : 'accent' },
        ]}
      />
      <p className="lab__note">{t('Simplified: the tribune’s power is renewed every 1 July from 23 BC, and his count of victory acclamations (IMP) is left out.')}</p>
    </div>
  );
}

